from src.data.loader import DataLoader
from src.models.machine_learning import run_forecasting_pipeline, set_seeds
from src.models.statistical import run_statistical_pipeline
from src.utils.logger import setup_logger
import pandas as pd

def prepare_data(price_df):
    """Prepare data for forecasting"""
    # Create stats_df from price_df and add unique_id column
    stats_df = price_df.copy()
    stats_df = stats_df.rename(columns={'Rice, Viet Namese 5%': 'y', 'Date': 'ds'})
    stats_df['unique_id'] = 'stats'
    stats_df = stats_df[['ds', 'y', 'unique_id']]  # Reorder columns
    stats_df = stats_df.reset_index(drop=True)  # Reset index

    # Handle missing values
    stats_df['y'] = stats_df['y'].fillna(method='ffill').fillna(method='bfill')
    
    return stats_df

def main():
    # Set up logging
    logger = setup_logger()
    logger.info("Starting forecasting application")
    
    # Set random seeds for reproducibility
    set_seeds()
    logger.info("Random seeds set")
    
    try:
        # Load data
        logger.info("Loading data...")
        loader = DataLoader()
        price_df = loader.load_price_data()
        news_df = loader.load_news_data()
        vbma_df = loader.load_vbma_data()
        logger.info("Data loading complete")
        
        # Prepare data for forecasting
        logger.info("Preparing data...")
        stats_df = prepare_data(price_df)
        logger.info("Data preparation complete")
        
        # Run statistical models
        logger.info("Running statistical models pipeline...")
        statistical_results = run_statistical_pipeline(
            stats_df,
            forecast_horizon=12,
            step_size=1,
            n_windows=36
        )
        logger.info("Statistical models complete")
        
        # Log statistical results
        logger.info("\nStatistical Models Results (No Scaling):")
        logger.info("\n" + statistical_results['no_scaling']['results'].to_string())
        logger.info("\nStatistical Models Results (With Scaling):")
        logger.info("\n" + statistical_results['with_scaling']['results'].to_string())
        logger.info("\nStatistical Models Future Forecasts:")
        logger.info("\n" + statistical_results['forecasts'].to_string())
        
        # Run ML pipeline
        logger.info("Running machine learning pipeline...")
        ml_results = run_forecasting_pipeline(
            stats_df,
            horizon=12,
            step_size=1,
            n_windows=36
        )
        logger.info("Machine learning pipeline complete")
        
        # Log ML results
        logger.info("\nMachine Learning Models Results:")
        logger.info("\n" + ml_results['metrics'].to_string())
        logger.info("\nMachine Learning Future Forecasts:")
        logger.info("\n" + ml_results['future_predictions'].to_string())
        
        logger.info("Forecasting application completed successfully")
        
        # Return results for further analysis if needed
        return {
            'statistical_results': statistical_results,
            'ml_results': ml_results
        }
        
    except Exception as e:
        logger.error(f"An error occurred: {str(e)}", exc_info=True)
        raise

if __name__ == "__main__":
    results = main() 