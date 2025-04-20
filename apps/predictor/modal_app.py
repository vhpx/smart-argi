import modal
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Create a Modal App
app = modal.App("agri-price-forecast-api")

# Create a secret
env_vars = {
    "DOMAIN": os.getenv("DOMAIN"),
    "WORKSPACE_ID": os.getenv("WORKSPACE_ID"),
    "API_KEY": os.getenv("API_KEY"),
    "WORLD_BANK_DATASET_ID": os.getenv("WORLD_BANK_DATASET_ID"),
    "AGRO_GOV_DATASET_ID": os.getenv("AGRO_GOV_DATASET_ID"),
    "VBMA_DATASET_ID": os.getenv("VBMA_DATASET_ID"),
}

secrets = modal.Secret.from_dict(env_vars)

# Create an image with all dependencies
image = (
    modal.Image.debian_slim()
    .pip_install(
        "python-dotenv",
        "pandas",
        "numpy",
        "scikit-learn",
        "optuna",
        "mlforecast",
        "coreforecast",
        "matplotlib",
        "statsforecast",
        "ray",
        "lightgbm",
        "xgboost",
        "catboost",
        "fastapi",
        "uvicorn",
        "utilsforecast",
    )
    .add_local_dir(".", "/root/app")
)


@app.function(
    image=image, secrets=[modal.Secret.from_name("custom-secret")], timeout=600
)
@modal.asgi_app()
def fastapi_app():
    print("Starting FastAPI application...")

    try:
        import sys

        sys.path.append("/root/app")

        # Install the local package
        import subprocess

        subprocess.check_call(["pip", "install", "-e", "/root/app"])

        from app import app as user_app

        print("Successfully imported FastAPI app")
        return user_app
    except Exception as e:
        print(f"Error importing FastAPI app: {str(e)}")
        raise


if __name__ == "__main__":
    app.serve()
