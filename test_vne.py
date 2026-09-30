import urllib.request
import json
import urllib.parse
import sys

# force utf8
sys.stdout.reconfigure(encoding='utf-8')

url = f"https://api.rss2json.com/v1/api.json?rss_url={urllib.parse.quote('https://vnexpress.net/rss/tin-moi-nhat.rss')}"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
res = urllib.request.urlopen(req)
data = json.loads(res.read().decode('utf-8'))

for item in data.get('items', [])[:2]:
    print("Title:", item.get('title'))
    print("Thumbnail:", item.get('thumbnail'))
    print("Enclosure:", item.get('enclosure'))
    desc = item.get('description', '')
    print("Desc image match?", "<img" in desc)
    print("Desc preview:", desc[:200])