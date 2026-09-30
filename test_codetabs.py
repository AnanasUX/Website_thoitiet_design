import urllib.request
import urllib.parse
url = f"https://api.codetabs.com/v1/proxy?quest={urllib.parse.quote('https://kenh14.vn/home.rss')}"
try:
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    res = urllib.request.urlopen(req)
    print("Status:", res.status)
    print("Len:", len(res.read()))
except Exception as e:
    print("ERR:", e)