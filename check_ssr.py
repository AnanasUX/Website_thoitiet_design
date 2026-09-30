import urllib.request
import re

req = urllib.request.Request(
    'https://phuquy.com.vn/bang-gia/vang', 
    headers={'User-Agent': 'Mozilla/5.0'}
)
html = urllib.request.urlopen(req).read().decode('utf-8')
match = re.search(r'<script id="[a-zA-Z0-9\-_]+" type="application/json">(.*?)</script>', html)
if match:
    print(match.group(1)[:1000])
else:
    print("No application/json found")