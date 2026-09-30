import urllib.request
import re

try:
    req = urllib.request.Request("https://dantri.com.vn", headers={'User-Agent': 'Mozilla/5.0'})
    html = urllib.request.urlopen(req, timeout=10).read().decode('utf-8')
    matches = re.findall(r'<link[^>]*href="([^"]+)"', html, re.IGNORECASE)
    for m in matches:
        if 'icon' in m or 'logo' in m:
            print("Found:", m)
except Exception as e:
    print(e)