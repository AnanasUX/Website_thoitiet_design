import urllib.request
import json
import urllib.parse
import sys
sys.stdout.reconfigure(encoding='utf-8')

url = f"https://api.rss2json.com/v1/api.json?rss_url={urllib.parse.quote('https://dantri.com.vn/rss/tin-moi-nhat.rss')}"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
res = urllib.request.urlopen(req)
data = json.loads(res.read().decode('utf-8'))
print(data.keys())
print(data.get('status'))