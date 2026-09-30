import urllib.request
import json
import urllib.parse
import sys

sys.stdout.reconfigure(encoding='utf-8')
url = "https://vnexpress.net/rss/tin-moi-nhat.rss"
proxy = f"https://api.allorigins.win/get?url={urllib.parse.quote(url)}"
req = urllib.request.Request(proxy, headers={'User-Agent': 'Mozilla/5.0'})
res = urllib.request.urlopen(req)
data = json.loads(res.read().decode('utf-8'))
xml = data['contents']
print(xml[:500])