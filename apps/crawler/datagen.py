import requests
import json
import logging
import time
import threading
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
import os
import pickle
from datetime import datetime
import queue
from typing import Dict, Set, Any

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    filename="yh_get_all_sym.log",
    filemode="w",
    format="%(asctime)s - %(levelname)s - %(message)s",
)

# Configuration
BASE_URL = "https://query1.finance.yahoo.com/v1/finance/lookup"
CACHE_DIR = Path("cache")
RESULTS_FILE = "yh_all_symbols.json"
CHECKPOINT_FILE = "checkpoint.pkl"
MAX_RETRIES = 5
RATE_LIMIT_CALLS = 5
RATE_LIMIT_PERIOD = 1.0  # seconds
MAX_WORKERS = 20
BATCH_SIZE = 100
REQUEST_TIMEOUT = 10

DEFAULT_PARAMS = {
    "type": "all",
    "count": str(BATCH_SIZE),
    "formatted": "true",
    "fetchPricingData": "true",
    "lang": "en-US",
    "region": "US",
    "crumb": "O4o6AKsM4xk",
}

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36"
    )
}

# Create cache directory if it doesn't exist
CACHE_DIR.mkdir(exist_ok=True)


class SymbolCollector:
    def __init__(self):
        self.yh_all_sym: Dict[str, Dict[str, Any]] = {}  # Updated type hint
        self.processed_queries: Set[str] = set()
        self.lock = threading.Lock()
        self.error_queue = queue.Queue()
        self.last_request_time = 0
        self.load_checkpoint()

    def load_checkpoint(self):
        """Load the previous state if it exists"""
        if os.path.exists(CHECKPOINT_FILE):
            try:
                with open(CHECKPOINT_FILE, "rb") as f:
                    checkpoint = pickle.load(f)
                    self.yh_all_sym = checkpoint["symbols"]
                    self.processed_queries = checkpoint["processed_queries"]
                logging.info("Loaded checkpoint with %d symbols", len(self.yh_all_sym))
            except (pickle.PickleError, KeyError) as e:
                logging.error("Error loading checkpoint: %s", str(e))

    def save_checkpoint(self):
        """Save current progress"""
        try:
            checkpoint = {
                "symbols": self.yh_all_sym,
                "processed_queries": self.processed_queries,
                "timestamp": datetime.now(),
            }
            with open(CHECKPOINT_FILE, "wb") as f:
                pickle.dump(checkpoint, f)
            logging.info("Saved checkpoint")
        except (pickle.PickleError, IOError) as e:
            logging.error("Error saving checkpoint: %s", str(e))

    def call_url(self, query: str, start: int = 0) -> dict:
        """Rate-limited API call with caching"""
        # Implement rate limiting
        current_time = time.time()
        time_since_last_request = current_time - self.last_request_time
        if time_since_last_request < RATE_LIMIT_PERIOD / RATE_LIMIT_CALLS:
            time.sleep(RATE_LIMIT_PERIOD / RATE_LIMIT_CALLS - time_since_last_request)

        cache_file = CACHE_DIR / f"{query}_{start}.json"

        # Check cache first
        if cache_file.exists():
            try:
                with open(cache_file, "r", encoding="utf-8") as f:
                    return json.load(f)
            except (json.JSONDecodeError, IOError) as e:
                logging.warning("Cache read error for %s: %s", query, str(e))

        # Make API call with retries
        params = DEFAULT_PARAMS.copy()
        params.update({"query": query, "start": str(start)})

        for attempt in range(MAX_RETRIES):
            try:
                self.last_request_time = time.time()
                response = requests.get(
                    BASE_URL, headers=HEADERS, params=params, timeout=REQUEST_TIMEOUT
                )
                response.raise_for_status()
                
                # Parse and validate the response
                try:
                    data = response.json()
                    # Store complete response including finance wrapper and result array
                    complete_response = {
                        "finance": {
                            "result": data.get("finance", {}).get("result", []),
                            "error": data.get("finance", {}).get("error", None)
                        }
                    }
                    
                    # Cache the complete response
                    with open(cache_file, "w", encoding="utf-8") as f:
                        json.dump(complete_response, f, indent=2)
                    
                    return complete_response
                except json.JSONDecodeError as e:
                    logging.error("Invalid JSON response for %s: %s", query, str(e))
                    raise

            except requests.exceptions.RequestException as e:
                wait_time = (attempt + 1) * 2
                logging.warning(
                    "Request failed for '%s' (attempt %d): %s",
                    query, attempt + 1, str(e)
                )
                if attempt < MAX_RETRIES - 1:
                    time.sleep(wait_time)
                else:
                    raise

    def get_total_count(self, data: dict, query: str) -> int:
        """Extract total result count with error handling"""
        try:
            result = data.get("finance", {}).get("result", [])
            if not result:
                logging.info("No results for query '%s'", query)
                return 0
            total = result[0].get("lookupTotals", {}).get("all", 0)
            logging.info("Total count for query '%s': %d", query, total)
            return int(total)
        except (KeyError, ValueError) as e:
            logging.error("Error extracting total count for '%s': %s", query, str(e))
            return 0

    def update_file(self, filename=RESULTS_FILE):
        """
        Saves the dictionary of symbols into a JSON file.
        """
        try:
            # Convert any string values to proper dictionary format
            normalized_symbols = {}
            for symbol, data in self.yh_all_sym.items():
                if isinstance(data, str):
                    normalized_symbols[symbol] = {
                        "shortName": data,
                        "longName": "",
                        "typeDisp": "",
                        "exchDisp": "",
                        "sector": "",
                        "industry": "",
                        "dispSecIndFlag": False,
                        "isYahooFinance": False,
                    }
                else:
                    normalized_symbols[symbol] = data

            with open(filename, "w", encoding="UTF-8") as f:
                json.dump({"symbols": normalized_symbols}, f, indent=2)
            print("Updated file with {} symbols.".format(len(normalized_symbols)))
        except Exception as e:
            error_msg = "Error updating file: {}".format(e)
            logging.error(error_msg)
            print(error_msg)

    def validate_symbol_data(self, symbol_data: dict) -> bool:
        """Validate that required fields are present and properly formatted"""
        required_fields = ["symbol", "exchange", "quoteType"]
        numeric_fields = [
            "regularMarketPrice",
            "regularMarketChange",
            "regularMarketPercentChange",
            "rank"
        ]
        
        # Check required fields
        if not all(field in symbol_data for field in required_fields):
            return False
            
        # Validate numeric fields
        for field in numeric_fields:
            value = symbol_data.get(field)
            if value and not isinstance(value, (int, float)):
                return False
                
        return True

    def analyze_batch(self, docs: list) -> dict:
        """Analyze a batch of documents for data quality"""
        analysis = {
            "total_docs": len(docs),
            "valid_docs": 0,
            "quote_types": {},
            "exchanges": {},
            "industries": {},
            "price_ranges": {
                "<1": 0,
                "1-10": 0,
                "10-100": 0,
                "100-1000": 0,
                ">1000": 0
            }
        }
        
        for doc in docs:
            if self.validate_symbol_data(doc):
                analysis["valid_docs"] += 1
                
                # Count quote types
                qt = doc.get("quoteType", "unknown")
                analysis["quote_types"][qt] = analysis["quote_types"].get(qt, 0) + 1
                
                # Count exchanges
                ex = doc.get("exchange", "unknown")
                analysis["exchanges"][ex] = analysis["exchanges"].get(ex, 0) + 1
                
                # Count industries
                ind = doc.get("industryName", "unknown")
                analysis["industries"][ind] = analysis["industries"].get(ind, 0) + 1
                
                # Analyze price ranges
                price = doc.get("regularMarketPrice", 0)
                if price < 1:
                    analysis["price_ranges"]["<1"] += 1
                elif price < 10:
                    analysis["price_ranges"]["1-10"] += 1
                elif price < 100:
                    analysis["price_ranges"]["10-100"] += 1
                elif price < 1000:
                    analysis["price_ranges"]["100-1000"] += 1
                else:
                    analysis["price_ranges"][">1000"] += 1
                    
        return analysis

    def process_block(self, query: str) -> None:
        """Process a single query block with proper error handling and analysis"""
        if query in self.processed_queries:
            logging.info("Skipping already processed query: %s", query)
            return

        try:
            start = 0
            while True:
                logging.info("Processing query '%s' starting at %d", query, start)
                print("\nProcessing '{}' (start={})".format(query, start))
                data = self.call_url(query, start)

                result = data.get("finance", {}).get("result", [])
                if not result:
                    break

                docs = result[0].get("documents", [])
                if not docs:
                    break

                # Analyze the batch before processing
                analysis = self.analyze_batch(docs)
                print("Batch Analysis:")
                print("- Total documents: {}".format(analysis['total_docs']))
                print("- Valid documents: {}".format(analysis['valid_docs']))
                print("- Quote types: {}".format(dict(sorted(analysis['quote_types'].items()))))
                
                # Update symbols with thread safety
                with self.lock:
                    current_batch = []
                    for doc in docs:
                        symbol = doc.get("symbol")
                        if symbol:
                            # Store all data from the API response
                            symbol_data = doc.copy()
                            
                            # Add formatted versions of numeric fields if they exist
                            for field in ["regularMarketPrice", "regularMarketChange", "regularMarketPercentChange"]:
                                if field in doc:
                                    raw_value = doc[field].get("raw", 0) if isinstance(doc[field], dict) else doc[field]
                                    fmt_value = doc[field].get("fmt", "") if isinstance(doc[field], dict) else str(doc[field])
                                    symbol_data[field] = {
                                        "raw": raw_value,
                                        "fmt": fmt_value
                                    }

                            # Add metadata
                            symbol_data.update({
                                "last_updated": datetime.now().isoformat(),
                                "query": query,
                                "start_index": start
                            })

                            self.yh_all_sym[symbol] = symbol_data
                            current_batch.append(symbol)

                    # Mark progress
                    self.processed_queries.add(query)

                    # Periodic checkpoint and progress update
                    if len(self.yh_all_sym) % 100 == 0:
                        print("\nProgress Update:")
                        print("Total symbols: {}".format(len(self.yh_all_sym)))
                        print("Queries processed: {}".format(len(self.processed_queries)))
                        print("Current batch: {}".format(current_batch))
                        print("Price distribution: {}\n".format(analysis['price_ranges']))
                        self.save_checkpoint()

                if len(docs) < BATCH_SIZE:
                    break

                start += BATCH_SIZE

        except (requests.RequestException, json.JSONDecodeError) as e:
            self.error_queue.put((query, str(e)))
            logging.error("Error processing query '%s': %s", query, str(e))
            print("Error processing '{}': {}".format(query, str(e)))

    def collect_symbols(self) -> None:
        """Main collection process with improved parallelization"""
        # Generate search space: A-Z and 0-9
        search_set = [chr(x) for x in range(65, 91)] + [chr(x) for x in range(48, 58)]
        threshold = 9000
        tasks = []

        def submit_query(q: str) -> None:
            """Helper to submit a query to the thread pool"""
            future = executor.submit(self.process_block, q)
            tasks.append(future)

        with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
            # Process single characters
            for term in search_set:
                data = self.call_url(term)
                total = self.get_total_count(data, term)

                if total < threshold:
                    submit_query(term)
                else:
                    # Refine with second character
                    for term2 in search_set:
                        refined = term + term2
                        data = self.call_url(refined)
                        total = self.get_total_count(data, refined)

                        if total < threshold:
                            submit_query(refined)
                        else:
                            # Refine with third character
                            for term3 in search_set:
                                refined2 = refined + term3
                                data = self.call_url(refined2)
                                total = self.get_total_count(data, refined2)

                                if total < threshold:
                                    submit_query(refined2)
                                else:
                                    # Final refinement with fourth character
                                    for term4 in search_set:
                                        refined3 = refined2 + term4
                                        submit_query(refined3)

            # Wait for all tasks and handle errors
            for future in tasks:
                try:
                    future.result()
                except (requests.RequestException, json.JSONDecodeError) as e:
                    logging.error("Task failed: %s", str(e))

        # Process any errors
        while not self.error_queue.empty():
            query, error = self.error_queue.get()
            logging.error("Failed query '%s': %s", query, error)

        # Save final results
        self.save_results()

    def save_results(self) -> None:
        """Save collected symbols to file with all available data"""
        try:
            # First normalize any string values to proper dictionary format
            normalized_symbols = {}
            for symbol, data in self.yh_all_sym.items():
                if isinstance(data, str):
                    normalized_symbols[symbol] = {
                        "symbol": symbol,
                        "shortName": data,
                        "exchange": "",
                        "quoteType": "",
                        "rank": 0,
                    }
                else:
                    normalized_symbols[symbol] = data

            # Calculate statistics using normalized data
            unique_exchanges = set()
            quote_type_counts = {
                "equity": 0, "etf": 0, "index": 0, "mutualfund": 0,
                "currency": 0, "future": 0, "cryptocurrency": 0
            }
            exchange_counts = {}
            industry_counts = {}

            # Count occurrences
            for sym_data in normalized_symbols.values():
                exchange = sym_data.get("exchange", "")
                if exchange:
                    unique_exchanges.add(exchange)
                    exchange_counts[exchange] = exchange_counts.get(exchange, 0) + 1

                quote_type = sym_data.get("quoteType", "")
                if quote_type in quote_type_counts:
                    quote_type_counts[quote_type] += 1

                industry = sym_data.get("industryName", "")
                if industry:
                    industry_counts[industry] = industry_counts.get(industry, 0) + 1

            final_data = {
                "metadata": {
                    "total_count": len(normalized_symbols),
                    "timestamp": datetime.now().isoformat(),
                    "processed_queries": list(self.processed_queries),
                    "failed_queries": list(self.error_queue.queue),
                    "collection_stats": {
                        "total_symbols": len(normalized_symbols),
                        "unique_exchanges": len(unique_exchanges),
                        "quote_types": quote_type_counts,
                        "exchanges": exchange_counts,
                        "industries": industry_counts
                    }
                },
                "symbols": normalized_symbols
            }

            with open(RESULTS_FILE, "w", encoding="utf-8") as f:
                json.dump(final_data, f, indent=2)

            print("\nFinal Results:")
            print("Total symbols collected: {}".format(len(normalized_symbols)))
            print("Total queries processed: {}".format(len(self.processed_queries)))
            print("Results saved to: {}".format(RESULTS_FILE))
            
            print("\nCollection Statistics:")
            for qt, count in quote_type_counts.items():
                if count > 0:
                    print("- {}: {} symbols".format(qt, count))
            
            print("\nTop Exchanges:")
            for ex, count in sorted(exchange_counts.items(), key=lambda x: x[1], reverse=True)[:5]:
                if ex:
                    print("- {}: {} symbols".format(ex, count))

            logging.info("Saved %d symbols to %s", len(normalized_symbols), RESULTS_FILE)

        except (IOError, json.JSONDecodeError) as e:
            error_msg = "Error saving results: {}".format(str(e))
            logging.error(error_msg)
            print(error_msg)
            # Log the full traceback for debugging
            logging.exception("Full traceback for save_results error:")


def main():
    collector = SymbolCollector()
    collector.collect_symbols()


if __name__ == "__main__":
    main()
