from dotenv import load_dotenv
import os
import http.client
import json
import pandas as pd
import numpy as np

class DataLoader:
    def __init__(self):
        # Load environment variables
        load_dotenv()
        
        # Initialize common attributes
        self.domain = os.getenv("DOMAIN")
        self.workspace_id = os.getenv("WORKSPACE_ID")
        self.api_key = os.getenv("API_KEY")
        
        # Dataset IDs
        self.world_bank_dataset_id = os.getenv("WORLD_BANK_DATASET_ID")
        self.agro_gov_dataset_id = os.getenv("AGRO_GOV_DATASET_ID")
        self.vbma_dataset_id = os.getenv("VBMA_DATASET_ID")
        
        # Common headers
        self.headers = {
            "API_KEY": self.api_key,
            "Content-Type": "application/json"
        }

    def _make_request(self, dataset_id):
        """Make HTTP request to API endpoint"""
        conn = http.client.HTTPSConnection(self.domain)
        conn.request(
            "GET",
            f"/api/v1/workspaces/{self.workspace_id}/datasets/{dataset_id}/full",
            headers=self.headers
        )
        res = conn.getresponse()
        data = res.read()
        return json.loads(data.decode("utf-8"))

    def _flatten_data(self, rows):
        """Flatten nested JSON data structure"""
        flattened_data = []
        for row in rows:
            cells = row["cells"]
            cells["row_id"] = row["row_id"]
            flattened_data.append(cells)
        return flattened_data

    def load_price_data(self):
        """Load and process World Bank rice price data"""
        parsed_data = self._make_request(self.world_bank_dataset_id)
        flattened_data = self._flatten_data(parsed_data["data"])
        
        # Convert to DataFrame and clean
        price_df = pd.DataFrame(flattened_data)
        price_df = price_df.replace("…", pd.NA)
        price_df = price_df.apply(pd.to_numeric, errors="ignore")
        
        # Keep only Rice and Date columns
        price_df = price_df[["Rice, Viet Namese 5%", "Date"]]
        
        # Convert Date format from YYYYMM to YYYY-MM-DD
        price_df['Date'] = pd.to_datetime(price_df['Date'].astype(str).str.replace('M', '-'), format='%Y-%m') + pd.offsets.MonthBegin(0)
        
        # Sort by Date
        return price_df.sort_values('Date')

    def load_news_data(self):
        """Load and process agricultural news data"""
        parsed_data = self._make_request(self.agro_gov_dataset_id)
        flattened_data = self._flatten_data(parsed_data["data"])
        
        # Convert to DataFrame and clean
        news_df = pd.DataFrame(flattened_data)
        news_df = news_df.replace("…", pd.NA)
        news_df = news_df.apply(pd.to_numeric, errors="ignore")
        
        # Convert DATE column to datetime
        news_df['DATE'] = pd.to_datetime(news_df['DATE'], format='%d | %m | %Y')
        
        # Sort by DATE
        return news_df.sort_values('DATE')

    def load_vbma_data(self):
        """Load and process VBMA data"""
        parsed_data = self._make_request(self.vbma_dataset_id)
        flattened_data = self._flatten_data(parsed_data["data"])
        
        # Convert to DataFrame
        df = pd.DataFrame(flattened_data)
        
        # Clean data - first replace "..." with NA, then replace "N/A" and "-" with 0
        df = df.replace("…", pd.NA)
        df = df.replace(["N/A", "-"], 0)
        df = df.apply(pd.to_numeric, errors="ignore")
        
        # Drop row_id before transposing
        df = df.drop('row_id', axis=1)
        
        # Transpose and set headers
        df = df.transpose()
        df.columns = df.iloc[0]
        df = df.iloc[1:]
        
        # Reset index and rename columns
        df = df.reset_index().rename(columns={'index': 'ds'})
        
        # Clean date strings
        df['ds'] = df['ds'].str.replace('- ', '')
        df['ds'] = df['ds'].str.replace('T', '')
        df['ds'] = df['ds'].str.replace(r'\([^)]*\)', '', regex=True).str.strip()
        
        # Convert to datetime
        df['ds'] = pd.to_datetime(df['ds'], format='mixed') + pd.offsets.MonthBegin(0)
        # Drop the first row:
        df = df.iloc[1:]
        
        return df 