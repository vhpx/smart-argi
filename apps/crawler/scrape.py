import re
import urllib.request
import urllib.parse
from markitdown import MarkItDown

html_ignored_extensions = [
    ".css",
    ".js",
    ".svg",
    ".jpg",
    ".png",
]


def to_absolute_url(base_url, url):
    return urllib.parse.urljoin(base_url, url)


def get_links(url):
    html = ""

    md = MarkItDown()
    markdown = md.convert(url)

    kept_links = set()
    skipped_links = set()

    # Process html if url doesn't end with an ignored extension
    if not any(url.endswith(ext) for ext in html_ignored_extensions):
        # Properly encode the URL to handle Unicode characters
        encoded_url = urllib.parse.quote(url, safe=":/?=&@")
        try:
            req = urllib.request.Request(
                encoded_url,
                headers={
                    "User-Agent": "Mozilla/5.0"
                },  # Add user agent to avoid some blocks
            )
            response = urllib.request.urlopen(req)
            html = response.read().decode("utf8")

            for match in re.finditer('href="(.*?)"', html):
                link = match.group(1)
                absolute_url = to_absolute_url(url, link)
                # Skip URLs ending with ignored extensions
                if any(absolute_url.endswith(ext) for ext in html_ignored_extensions):
                    skipped_links.add(absolute_url)
                else:
                    kept_links.add(absolute_url)
        except Exception as e:
            print(f"Error fetching URL: {str(e)}")
            return {
                "html": "",
                "markdown": markdown,
                "kept": [],
                "skipped": [],
                "error": str(e),
            }

    return {
        "html": html,
        "markdown": markdown,
        "kept": list(kept_links),
        "skipped": list(skipped_links),
    }


def print_links(links):
    print("Kept links:")
    for link in links["kept"]:
        print(link)
    print("\nSkipped links:")
    for link in links["skipped"]:
        print(link)
