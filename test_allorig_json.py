import urllib.request
import json
url = "https://api.allorigins.win/get?url=https://kenh14.vn/home.rss"
try:
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    res = urllib.request.urlopen(req)
    data = json.loads(res.read().decode('utf-8'))
    contents = data.get('contents', '')
    print("Len:", len(contents))
    print(contents[:500])
except Exception as e:
    print(e)