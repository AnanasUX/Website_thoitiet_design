import urllib.request
import json
import urllib.parse

feeds = [
    {"name": "Dân Trí", "url": "https://dantri.com.vn/rss/home.rss"},
    {"name": "VnExpress", "url": "https://vnexpress.net/rss/tin-moi-nhat.rss"},
    {"name": "Kênh 14", "url": "https://kenh14.vn/home.rss"},
    {"name": "Tuổi Trẻ", "url": "https://tuoitre.vn/rss/tin-moi-nhat.rss"},
    {"name": "Thanh Niên", "url": "https://thanhnien.vn/rss/home.rss"},
    {"name": "VietnamNet", "url": "https://vietnamnet.vn/rss/tin-moi-nhat.rss"},
    {"name": "Lao Động", "url": "https://laodong.vn/rss/home.rss"},
    {"name": "VTV News", "url": "https://vtv.vn/trong-nuoc.rss"},
    {"name": "Pháp Luật", "url": "https://plo.vn/rss/thoi-su-c2.rss"}
]

for feed in feeds:
    url = f"https://api.rss2json.com/v1/api.json?rss_url={urllib.parse.quote(feed['url'])}"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        res = urllib.request.urlopen(req)
        data = json.loads(res.read().decode('utf-8'))
        if data.get('status') == 'ok':
            print(f"OK: {feed['name']} - {len(data.get('items', []))} items")
        else:
            print(f"FAIL: {feed['name']} - {data.get('message')}")
    except Exception as e:
        print(f"ERR: {feed['name']} - {e}")