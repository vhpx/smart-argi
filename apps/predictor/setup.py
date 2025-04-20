from setuptools import setup, find_packages

setup(
    name="agri-price-forecast",
    version="0.1.0",
    packages=find_packages(),
    install_requires=[
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
        "utilsforecast"
    ]
) 