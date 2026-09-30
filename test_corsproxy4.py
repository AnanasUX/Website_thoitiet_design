import urllib.request
import urllib.parse
url = f"https://corsproxy.io/?url={urllib.parse.quote('https://vietnamnet.vn/rss/tin-moi-nhat.rss')}"
try:
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    res = urllib.request.urlopen(req)
    print("Status:", res.status)
    content = res.read()
    print("Len:", len(content))
    print(content[:200].decode('utf-8', errors='ignore'))
except Exception as e:
    print("ERR:", e)