# Crawler

A flexible web crawling service that serves as the foundation for our internal search engine project. This service can extract both HTML content and convert web pages to Markdown format.

## Features

- Extracts HTML content from web pages
- Converts web pages to Markdown format using `markitdown`
- Filters out non-relevant file types (css, js, images, documents, etc.)
- Extracts and normalizes links from pages
- Available as both local FastAPI service and serverless Modal deployment

## Components

- `scrape.py` - Core crawling functionality and shared utilities
- `scrape_local.py` - Local FastAPI server implementation
- `scrape_remote.py` - Serverless Modal deployment

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. For local development:
```bash
uvicorn scrape_local:app --reload
```

3. For Modal deployment:
```bash
modal deploy scrape_remote.py
```

## API Usage

Both local and remote deployments expose a single endpoint that accepts a URL parameter:

```
GET /?url=https://example.com
```

The response includes:
- `html`: Raw HTML content
- `markdown`: Converted Markdown content
- `kept`: List of extracted links that weren't filtered
- `skipped`: List of filtered links (based on extension)
