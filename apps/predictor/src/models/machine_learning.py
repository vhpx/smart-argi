import random
import multiprocessing
import numpy as np
import pandas as pd
import optuna
from mlforecast import MLForecast
from sklearn.linear_model import ElasticNet
import lightgbm as lgb
import xgboost as xgb
from catboost import CatBoostRegressor
from coreforecast.scalers import LocalMinMaxScaler
from coreforecast.grouped_array import GroupedArray
from ..utils.metrics import calculate_metrics
from mlforecast.target_transforms import Differences
from mlforecast.lag_transforms import ExponentiallyWeightedMean, RollingMean

def set_seeds(seed=42):
    np.random.seed(seed)
    random.seed(seed)
    optuna.logging.set_verbosity(optuna.logging.WARNING)

def run_forecasting_pipeline(stats_df, horizon=12, step_size=1, n_windows=36):
    """Run an automated machine learning forecasting pipeline with multiple models."""
    # Basic preprocessing
    processed_df = stats_df.copy()
    
    # Ensure dates are properly formatted for MLForecast
    processed_df['ds'] = pd.to_datetime(processed_df['ds'])
    last_date = processed_df['ds'].max()
    print(f"Last date in data: {last_date}")  # Add this for debugging
    
    processed_df.fillna(0)

    # Initialize base models with default parameters
    models = {
        'elasticnet': ElasticNet(random_state=42),
        'lightgbm': lgb.LGBMRegressor(random_state=42),
        'xgboost': xgb.XGBRegressor(random_state=42),
        'catboost': CatBoostRegressor(random_seed=42, verbose=False)
    }

    # Create MLForecast with enhanced features
    mlf = MLForecast(
        models=models,
        freq='MS',  # Monthly frequency
        lags=[1, 12],  # Reduced from more complex lag structure
        target_transforms=[Differences([12])],  # Keep only yearly seasonality
        lag_transforms={
            1: [ExponentiallyWeightedMean(alpha=0.5)],  # Simplified lag transforms
            12: [RollingMean(window_size=12)]
        }
    )

    # First do cross-validation to evaluate performance
    cv_predictions = mlf.cross_validation(
        processed_df,
        n_windows=n_windows,  # Now using the reduced n_windows parameter
        h=horizon,
        step_size=step_size  # Now using the increased step_size parameter
    )

    # Evaluate models using cross-validation results
    cv_results, metrics_df = _evaluate_models(cv_predictions)

    # Now fit the models on all data for future predictions
    mlf.fit(processed_df)

    # Generate future predictions
    future_predictions = mlf.predict(horizon)

    return {
        'model': mlf,
        'cv_predictions': cv_predictions,
        'future_predictions': future_predictions,
        'cv_results': cv_results,
        'metrics': metrics_df
    }

def _evaluate_models(cv_df):
    """Helper function to evaluate model performance"""
    cv_results = {}
    metrics = {}

    # Get all model names (excluding 'unique_id', 'ds', 'cutoff', 'y')
    model_names = [col for col in cv_df.columns 
                  if col not in ['unique_id', 'ds', 'cutoff', 'y']]

    for model_name in model_names:
        cv_results[model_name] = cv_df
        
        # Get predictions for this model
        model_predictions = cv_df[model_name]
        actual = cv_df['y']
        
        rmse, dir_acc, turn_acc, weighted_score = calculate_metrics(actual, model_predictions)
        metrics[model_name] = {
            'RMSE': rmse,
            'Directional_Accuracy': dir_acc,
            'Turning_Point_Accuracy': turn_acc,
            'Weighted_Score': weighted_score
        }

    metrics_df = pd.DataFrame(metrics).round(4)
    return cv_results, metrics_df 