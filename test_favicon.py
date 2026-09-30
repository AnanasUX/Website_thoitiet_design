import urllib.request
try:
    req = urllib.request.Request("https://dantri.com.vn/favicon.ico", headers={'User-Agent': 'Mozilla/5.0'})
    res = urllib.request.urlopen(req, timeout=10)
    print("Status:", res.status)
except Exception as e:
    print(e)