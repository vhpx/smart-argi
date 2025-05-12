import modal
from scrape import get_links
import urllib.parse

image = (
    modal.Image.debian_slim()
    .pip_install("fastapi[standard]", "markitdown")
    .add_local_python_source("scrape")
)

app = modal.App(name="scraper", image=image)


@app.function()
@modal.web_endpoint(docs=True)
def main(url: str):
    # Decode the URL parameter to handle Unicode characters
    decoded_url = urllib.parse.unquote(url)
    results = get_links(decoded_url)
    return results
