import urllib.request
import re

req = urllib.request.Request(
    'https://phuquy.com.vn/main-EU7E4TGX.js', 
    headers={'User-Agent': 'Mozilla/5.0'}
)
try:
    js = urllib.request.urlopen(req).read().decode('utf-8')
    endpoints = re.findall(r'https?://[^"\']+', js)
    apis = set([e for e in endpoints if 'api' in e.lower() or 'bang-gia' in e.lower() or 'vang' in e.lower()])
    print("\n".join(list(apis)[:20]))
except Exception as e:
    print(e)