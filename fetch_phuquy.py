import urllib.request
req = urllib.request.Request(
    'https://phuquy.com.vn/bang-gia/vang', 
    headers={'User-Agent': 'Mozilla/5.0'}
)
html = urllib.request.urlopen(req).read().decode('utf-8')
with open("phuquy.html", "w", encoding="utf-8") as f:
    f.write(html)
print("Saved to phuquy.html")