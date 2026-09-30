import urllib.request
import urllib.parse
import json
url = f"https://api.rss2json.com/v1/api.json?rss_url={urllib.parse.quote('https://news.google.com/rss/search?q=site:vietnamnet.vn&hl=vi&gl=VN&ceid=VN:vi')}"
try:
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    res = urllib.request.urlopen(req)
    data = json.loads(res.read().decode('utf-8'))
    print("Status:", data.get('status'), len(data.get('items', [])))
except Exception as e:
    print(e)