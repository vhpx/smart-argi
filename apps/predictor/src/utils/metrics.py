import numpy as np
from math import sqrt
from sklearn.metrics import mean_squared_error

def calculate_metrics(actual, predicted):
    """Calculate multiple performance metrics for forecasting evaluation.
    
    Args:
        actual (array-like): The actual/true values
        predicted (array-like): The predicted/forecasted values
        
    Returns:
        tuple: A tuple containing:
            - rmse (float): Root Mean Square Error
            - directional_accuracy (float): Proportion of correctly predicted directions (0-1)
            - turning_point_accuracy (float): Proportion of correctly predicted turning points (0-1)
            - weighted_score (float): Combined score weighing all three metrics equally
    """
    # Convert inputs to numpy arrays and flatten
    actual = np.asarray(actual).flatten()
    predicted = np.asarray(predicted).flatten()

    # Calculate RMSE
    rmse = sqrt(mean_squared_error(actual, predicted))
    
    # Calculate directional accuracy
    actual_diff = np.diff(actual)
    pred_diff = np.diff(predicted)
    directional_accuracy = np.mean((actual_diff * pred_diff) > 0)
    
    # Calculate turning point accuracy
    actual_turns = (actual_diff[:-1] * actual_diff[1:]) < 0
    pred_turns = (pred_diff[:-1] * pred_diff[1:]) < 0
    turning_point_accuracy = np.mean(actual_turns == pred_turns)
    
    # Calculate weighted score
    weighted_score = (rmse + (1 - directional_accuracy) + (1 - turning_point_accuracy)) / 3
    
    return rmse, directional_accuracy, turning_point_accuracy, weighted_score