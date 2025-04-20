from fastapi import FastAPI, Query
from fastapi.responses import JSONResponse

# Import the modules used in main.py
from src.data.loader import DataLoader
from src.models.machine_learning import run_forecasting_pipeline, set_seeds
from src.models.statistical import run_statistical_pipeline
from src.utils.logger import setup_logger

import pandas as pd

app = FastAPI()

@app.get("/health")
def health_check():
    """Health check endpoint to verify API is running."""
    return {"status": "healthy", "message": "API is running"}

def prepare_data(price_df):
    """Prepare data for forecasting (mimics the function in main.py)."""
    stats_df = price_df.copy()
    stats_df = stats_df.rename(columns={'Rice, Viet Namese 5%': 'y', 'Date': 'ds'})
    stats_df['unique_id'] = 'stats'
    stats_df = stats_df[['ds', 'y', 'unique_id']]
    stats_df = stats_df.reset_index(drop=True)
    stats_df['y'] = stats_df['y'].fillna(method='ffill').fillna(method='bfill')
    return stats_df

def format_forecast_response(df):
    """Convert forecast DataFrame to a clean list structure."""
    dates = df['ds'].astype(str).tolist()
    forecasts = []
    
    for date_idx, date in enumerate(dates):
        forecast = {"date": date}
        for col in df.columns:
            if col != 'ds' and col != 'unique_id':
                forecast[col] = float(df[col].iloc[date_idx])
        forecasts.append(forecast)
    
    return forecasts

def format_metrics_response(df):
    """Convert metrics DataFrame to a clean dictionary structure."""
    metrics = []
    for idx in range(len(df)):
        metric = {}
        for col in df.columns:
            metric[col] = df[col].iloc[idx]
            if isinstance(metric[col], (float, int)):
                metric[col] = float(metric[col])
        metrics.append(metric)
    return metrics

@app.get("/forecast")
def forecast(h: int = Query(12, description="Forecast horizon")):
    """
    Returns date + future forecast (both statistical and ML).
    """
    logger = setup_logger()
    logger.info("Starting FastAPI forecast endpoint")

    set_seeds()
    loader = DataLoader()
    price_df = loader.load_price_data()
    stats_df = prepare_data(price_df)

    statistical_results = run_statistical_pipeline(
        stats_df,
        forecast_horizon=h,
        step_size=3,
        n_windows=12
    )
    ml_results = run_forecasting_pipeline(
        stats_df,
        horizon=h,
        step_size=3,
        n_windows=12
    )

    return JSONResponse(
        content={
            "statistical_forecast": format_forecast_response(statistical_results['forecasts']),
            "ml_forecast": format_forecast_response(ml_results['future_predictions'])
        }
    )

@app.get("/statistical_metrics")
def get_statistical_metrics(h: int = Query(12, description="Forecast horizon")):
    """
    Returns only statistical metrics (no_scaling, with_scaling).
    """
    logger = setup_logger()
    logger.info("Starting statistical metrics endpoint")

    set_seeds()
    loader = DataLoader()
    price_df = loader.load_price_data()
    stats_df = prepare_data(price_df)

    statistical_results = run_statistical_pipeline(
        stats_df,
        forecast_horizon=h,
        step_size=3,
        n_windows=12
    )

    return JSONResponse(
        content={
            "no_scaling": format_metrics_response(statistical_results['no_scaling']['results']),
            "with_scaling": format_metrics_response(statistical_results['with_scaling']['results'])
        }
    )

@app.get("/ml_metrics")
def get_ml_metrics(h: int = Query(12, description="Forecast horizon")):
    """
    Returns only ML metrics.
    """
    logger = setup_logger()
    logger.info("Starting ML metrics endpoint")

    set_seeds()
    loader = DataLoader()
    price_df = loader.load_price_data()
    stats_df = prepare_data(price_df)

    ml_results = run_forecasting_pipeline(
        stats_df,
        horizon=h,
        step_size=3,
        n_windows=12
    )
    
    # Convert metrics to a clean dictionary format
    metrics = {}
    for model, model_metrics in ml_results['metrics'].items():
        metrics[model] = {
            metric: float(value) for metric, value in model_metrics.items()
        }

    return JSONResponse(content=metrics) 