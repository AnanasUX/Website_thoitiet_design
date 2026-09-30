import urllib.request
import json
import urllib.parse
url = f"https://api.rss2json.com/v1/api.json?rss_url={urllib.parse.quote('https://www.baogiaothong.vn/rss/thoi-su.rss')}"
try:
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    res = urllib.request.urlopen(req)
    data = json.loads(res.read().decode('utf-8'))
    print("Status:", data.get('status'))
except Exception as e:
    print(e)