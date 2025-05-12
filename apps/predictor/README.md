# Rice Price Forecast API Documentation

> **Note:** This API is part of the RMIT Smart Agri cloud platform for managing datasets, with frequent data synchronization via cron jobs. Permissions are managed by workspace, and users can invite others to share workspace tools and data. See the main [README](../../README.md) for more details.

This API provides endpoints for forecasting Vietnamese rice prices using both statistical and machine learning models. The API is deployed on Modal and provides predictions and performance metrics for various forecasting models.

## Base URL
```
https://hajiwansau15--agri-price-forecast-api-fastapi-app.modal.run
```

## Endpoints

### 1. Health Check
Check if the API is running properly.

**Endpoint:** `/health`  
**Method:** GET  
**Response Time:** ~1 second

**Response Format:**
```json
{
    "status": "healthy",
    "message": "API is running"
}
```

### 2. Forecast
Get price forecasts using both statistical and machine learning models.

**Endpoint:** `/forecast`  
**Method:** GET  
**Parameters:**
- `h` (optional): Forecast horizon in months (default: 12)
**Response Time:** ~5-6 minutes

**Example Request:**
```
/forecast?h=24
```

**Response Format:**
```json
{
    "statistical_forecast": [
        {
            "date": "2025-01-01",
            "AutoARIMA": 500.06,
            "AutoARIMA-lo-90": 467.63,
            "AutoARIMA-hi-90": 532.49,
            "AutoETS": 496.52,
            "AutoETS-lo-90": 449.44,
            "AutoETS-hi-90": 543.60,
            "AutoTheta": 492.36,
            "AutoTheta-lo-90": 462.53,
            "AutoTheta-hi-90": 529.99,
            "CES": 494.38,
            "CES-lo-90": 447.22,
            "CES-hi-90": 543.09
        },
        // ... additional dates
    ],
    "ml_forecast": [
        {
            "date": "2025-01-01",
            "elasticnet": 484.42,
            "lightgbm": 484.71,
            "xgboost": 485.34,
            "catboost": 494.61
        },
        // ... additional dates
    ]
}
```

### 3. Statistical Metrics
Get performance metrics for statistical models.

**Endpoint:** `/statistical_metrics`  
**Method:** GET  
**Parameters:**
- `h` (optional): Forecast horizon in months (default: 12)
**Response Time:** ~4-5 minutes

**Example Request:**
```
/statistical_metrics?h=24
```

**Response Format:**
```json
{
    "no_scaling": [
        {
            "model": "AutoARIMA",
            "mape": 12.34,
            "rmse": 56.78,
            // ... additional metrics
        },
        // ... other models
    ],
    "with_scaling": [
        {
            "model": "AutoARIMA",
            "mape": 11.22,
            "rmse": 44.55,
            // ... additional metrics
        },
        // ... other models
    ]
}
```

### 4. ML Metrics
Get performance metrics for machine learning models.

**Endpoint:** `/ml_metrics`  
**Method:** GET  
**Parameters:**
- `h` (optional): Forecast horizon in months (default: 12)
**Response Time:** ~4-5 minutes

**Example Request:**
```
/ml_metrics?h=24
```

**Response Format:**
```json
{
    "elasticnet": {
        "mape": 12.34,
        "rmse": 56.78,
        // ... additional metrics
    },
    "lightgbm": {
        "mape": 23.45,
        "rmse": 67.89,
        // ... additional metrics
    },
    "xgboost": {
        // ... metrics
    },
    "catboost": {
        // ... metrics
    }
}
```

## Important Notes

1. **Response Times**: 
   - The health check endpoint responds quickly (~1 second)
   - Other endpoints involve complex computations and may take several minutes to respond
   - For h=24, expect longer response times than h=12

2. **Error Handling**:
   - All endpoints return HTTP 200 for successful responses
   - Error responses include appropriate HTTP status codes and error messages

3. **Rate Limiting**:
   - Please implement appropriate rate limiting in your applications
   - Consider caching responses for frequently requested forecasts

4. **Models**:
   - Statistical models: AutoARIMA, AutoETS, AutoTheta, CES
   - ML models: ElasticNet, LightGBM, XGBoost, CatBoost

## Example Usage (Python)

```python
import requests
import json

BASE_URL = "https://hajiwansau15--agri-price-forecast-api-fastapi-app.modal.run"

# Get forecast for next 24 months
response = requests.get(f"{BASE_URL}/forecast", params={"h": 24})
forecasts = response.json()

# Get ML metrics
response = requests.get(f"{BASE_URL}/ml_metrics", params={"h": 12})
ml_metrics = response.json()
```

## Support
For any issues or questions, please open an issue in the repository.