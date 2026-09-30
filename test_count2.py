import urllib.request
import json
import urllib.parse
import sys

sys.stdout.reconfigure(encoding='utf-8')

url = "https://vnexpress.net/rss/tin-moi-nhat.rss"
api_url = f"https://api.rss2json.com/v1/api.json?rss_url={urllib.parse.quote(url)}&count=50"
req = urllib.request.Request(api_url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    res = urllib.request.urlopen(req)
    data = json.loads(res.read().decode('utf-8'))
    print("Items count:", len(data.get('items', [])))
except Exception as e:
    print("Error:", e)