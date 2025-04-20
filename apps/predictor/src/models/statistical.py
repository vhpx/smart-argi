import ray
from statsforecast import StatsForecast
from statsforecast.models import AutoARIMA, AutoETS, AutoTheta, AutoCES
from ..utils.metrics import calculate_metrics
import pandas as pd

@ray.remote
class StatisticalExperiment:
    def run(self, df, model_names, forecast_horizon, step_size, n_windows, use_scaler=False):
        """Runs forecasting experiment with cross-validation for multiple models."""
        # Initialize forecaster and prepare data
        stats_forecaster = self.get_stats_forecaster()
        prepared_df, scaler = self.prepare_data(df, use_scaler)
        
        # Prepare for cross-validation
        cv_df = prepared_df[['ds', 'y', 'unique_id']].copy()
        cv_df['y'] = cv_df['y'].astype(float)

        # Perform rolling window cross-validation
        crossvalidation_df = stats_forecaster.cross_validation(
            df=cv_df,
            h=forecast_horizon,
            step_size=step_size,
            n_windows=n_windows
        )

        # Inverse transform predictions if scaling was applied
        if scaler:
            crossvalidation_df['y'] = scaler.inverse_transform(crossvalidation_df[['y']])
            for model in model_names:
                if model in crossvalidation_df.columns:
                    crossvalidation_df[model] = scaler.inverse_transform(crossvalidation_df[[model]])

        # Calculate performance metrics for each model
        results = []
        for model in model_names:
            if model in crossvalidation_df.columns:
                rmse, dir_acc, turn_acc, weighted_score = calculate_metrics(
                    crossvalidation_df['y'].values,
                    crossvalidation_df[model].values
                )
                
                results.append({
                    'Model': model,
                    'RMSE': rmse,
                    'Directional_Accuracy': dir_acc,
                    'Turning_Point_Accuracy': turn_acc,
                    'Weighted_Score': weighted_score
                })
        
        return pd.DataFrame(results), crossvalidation_df

    def get_stats_forecaster(self):
        """Creates and returns a StatsForecast object with the defined models."""
        season_length = 12  # annual seasonality for monthly data
        models = [
            AutoARIMA(season_length=season_length),
            AutoETS(season_length=season_length),
            AutoTheta(season_length=season_length),
            AutoCES(season_length=season_length)
        ]
        # Use 'M' frequency to match the data
        return StatsForecast(models=models, freq='M', n_jobs=-1)

    def prepare_data(self, df, use_scaler=False):
        """Prepares data for forecasting by handling data types and optional scaling."""
        from sklearn.preprocessing import MinMaxScaler
        
        df = df.copy()
        
        # Convert to datetime without changing the date
        df['ds'] = pd.to_datetime(df['ds'])
        last_date = df['ds'].max()
        print(f"Last date in statistical pipeline: {last_date}")  # Add this for debugging
        
        df['y'] = pd.to_numeric(df['y'], errors='coerce')
        df['y'] = df['y'].fillna(method='ffill').fillna(method='bfill')
        
        scaler = None
        if use_scaler:
            scaler = MinMaxScaler()
            df['y'] = scaler.fit_transform(df[['y']])
        
        return df, scaler

    def forecast(self, df, forecast_horizon):
        """Generate future forecasts using statistical models"""
        # Initialize forecaster and prepare data
        stats_forecaster = self.get_stats_forecaster()
        prepared_df, scaler = self.prepare_data(df, use_scaler=False)
        
        # Prepare data for forecasting
        forecast_df = prepared_df[['ds', 'y', 'unique_id']].copy()
        forecast_df['y'] = forecast_df['y'].astype(float)
        
        # Fit models and generate forecasts with prediction intervals
        stats_forecaster.fit(forecast_df)
        predictions = stats_forecaster.predict(h=forecast_horizon, level=[90])
        
        # Post-process the predictions to align dates
        last_date = pd.to_datetime(df['ds'].max())
        next_month_start = last_date + pd.offsets.MonthBegin(1)
        
        # Create new date range starting from next month
        future_dates = pd.date_range(
            start=next_month_start,
            periods=forecast_horizon,
            freq='MS'
        )
        
        # Update the predictions DataFrame with correct dates
        predictions['ds'] = future_dates
        
        # Sort the predictions by date
        predictions = predictions.sort_values('ds').reset_index(drop=True)
        
        return predictions

def run_statistical_pipeline(stats_df, forecast_horizon=12, step_size=1, n_windows=36):
    """Run statistical forecasting pipeline with multiple models."""
    # Initialize Ray for parallel processing
    ray.init(ignore_reinit_error=True)
    
    # Define statistical models to evaluate
    model_names = ['AutoARIMA', 'AutoETS', 'AutoTheta', 'CES']
    
    try:
        # Create experiment actor
        experiment = StatisticalExperiment.remote()
        
        # Run cross-validation experiments
        experiment_ref_no_scale = experiment.run.remote(
            stats_df, 
            model_names, 
            forecast_horizon,
            step_size,
            n_windows,
            use_scaler=False
        )
        experiment_ref_with_scale = experiment.run.remote(
            stats_df, 
            model_names, 
            forecast_horizon,
            step_size,
            n_windows,
            use_scaler=True
        )

        # Generate future forecasts
        future_predictions = experiment.forecast.remote(stats_df, forecast_horizon)

        # Collect all results
        results_df_no_scale, cv_df_no_scale = ray.get(experiment_ref_no_scale)
        results_df_with_scale, cv_df_with_scale = ray.get(experiment_ref_with_scale)
        forecasts = ray.get(future_predictions)

        return {
            'no_scaling': {
                'results': results_df_no_scale,
                'cv_data': cv_df_no_scale
            },
            'with_scaling': {
                'results': results_df_with_scale,
                'cv_data': cv_df_with_scale
            },
            'forecasts': forecasts
        }
    finally:
        # Clean up Ray resources
        ray.shutdown() 