import urllib.request
import json
import urllib.parse
import sys

sys.stdout.reconfigure(encoding='utf-8')

feeds = [
  "https://dantri.com.vn/rss/tin-moi-nhat.rss",
  "https://vnexpress.net/rss/tin-moi-nhat.rss",
  "https://tuoitre.vn/rss/tin-moi-nhat.rss",
  "https://thanhnien.vn/rss/home.rss",
  "https://www.baogiaothong.vn/rss/thoi-su.rss"
]

for url in feeds:
    api_url = f"https://api.rss2json.com/v1/api.json?rss_url={urllib.parse.quote(url)}"
    req = urllib.request.Request(api_url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        res = urllib.request.urlopen(req)
        data = json.loads(res.read().decode('utf-8'))
        print(url)
        print("Status:", data.get('status'))
        print("Items count:", len(data.get('items', [])))
        if data.get('status') == 'error':
            print("Message:", data.get('message'))
    except Exception as e:
        print("Error fetching", url, e)