import urllib.request
url = "https://wsrv.nl/?url=https%3A%2F%2Fimages2.thanhnien.vn%2Fzoom%2F600_315%2F528068263637045248%2F2026%2F9%2F25%2Fnu-ti-phu-nguyen-thi-phuong-thao-17903454562661953657769-45-0-1295-2000-crop-17903456654292018892923.png"
try:
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
    res = urllib.request.urlopen(req)
    print("STATUS:", res.status)
except Exception as e:
    print("ERR:", e)