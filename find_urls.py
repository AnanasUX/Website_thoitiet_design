import urllib.request
import re

req = urllib.request.Request(
    'https://phuquy.com.vn/main-EU7E4TGX.js', 
    headers={'User-Agent': 'Mozilla/5.0'}
)
js = urllib.request.urlopen(req).read().decode('utf-8')
urls = re.findall(r'https?://[a-zA-Z0-9./\-_]+', js)
print("\n".join(set(urls)))