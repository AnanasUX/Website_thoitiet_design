import urllib.request
import json
import re

url = "https://api.allorigins.win/get?url=https%3A%2F%2Fthanhnien.vn%2Fnu-ti-phu-nguyen-thi-phuong-thao-185260925145814674.htm"
try:
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    res = urllib.request.urlopen(req)
    data = json.loads(res.read().decode('utf-8'))
    html = data.get("contents", "")
    
    # regex from App.tsx
    ogMatch = re.search(r'<meta[^>]+property=["\']og:image["\'][^>]+content=["\']([^"\']+)["\']', html, re.IGNORECASE)
    if not ogMatch:
        ogMatch = re.search(r'<meta[^>]+content=["\']([^"\']+)["\'][^>]+property=["\']og:image["\']', html, re.IGNORECASE)
        
    if ogMatch:
        print("FOUND OG IMAGE:", ogMatch.group(1))
    else:
        print("NO OG IMAGE FOUND.")
        
except Exception as e:
    print("Error:", e)
