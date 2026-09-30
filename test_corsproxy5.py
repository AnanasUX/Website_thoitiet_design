import urllib.request
url = "https://corsproxy.io/?https://vietnamnet.vn/rss/tin-moi-nhat.rss"
try:
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    res = urllib.request.urlopen(req)
    content = res.read()
    print("Len:", len(content))
    print(content[:500].decode('utf-8', errors='ignore'))
except Exception as e:
    print(e)