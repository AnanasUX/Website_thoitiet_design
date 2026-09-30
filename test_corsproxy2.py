import urllib.request
import urllib.parse

urls = [
    "https://vietnamnet.vn/rss/tin-moi-nhat.rss",
    "https://laodong.vn/rss/home.rss",
    "https://vtv.vn/trong-nuoc.rss",
    "https://plo.vn/rss/thoi-su-c2.rss"
]
for u in urls:
    url = f"https://corsproxy.io/?{urllib.parse.quote(u)}"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        res = urllib.request.urlopen(req)
        print(f"OK: {u} - {len(res.read())}")
    except Exception as e:
        print(f"ERR: {u} - {e}")