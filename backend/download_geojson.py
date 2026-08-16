import urllib.request
import os

urls = [
    "https://raw.githubusercontent.com/geohacker/india/master/state/india_state.geojson",
    "https://raw.githubusercontent.com/geohacker/india/master/state/india_telengana.geojson"
]

for url in urls:
    try:
        urllib.request.urlretrieve(url, "../public/india-states.geojson")
        print(f"Downloaded from {url}")
        break
    except Exception as e:
        print(f"Failed {url}: {e}")
