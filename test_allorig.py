import urllib.request
import json
import urllib.parse
url = f"https://api.allorigins.win/get?url={urllib.parse.quote('https://kenh14.vn/home.rss')}"
try:
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    res = urllib.request.urlopen(req)
    data = json.loads(res.read().decode('utf-8'))
    print("Status:", data.get('status', data.get('contents', '')[:50]))
except Exception as e:
    print("ERR:", e)