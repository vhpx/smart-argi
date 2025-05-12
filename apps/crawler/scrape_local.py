from fastapi import FastAPI
from scrape import get_links
import urllib.parse

app = FastAPI()


@app.get("/")
def main(url: str):
    # Decode the URL parameter to handle Unicode characters
    decoded_url = urllib.parse.unquote(url)
    results = get_links(decoded_url)
    return results
