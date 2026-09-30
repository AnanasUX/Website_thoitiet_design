import urllib.request
try:
    req = urllib.request.Request("https://dantri.com.vn/favicon.ico", headers={'User-Agent': 'Mozilla/5.0'})
    res = urllib.request.urlopen(req, timeout=10)
    data = res.read()
    print("Status:", res.status)
    print("Size:", len(data))
    print("Content-Type:", res.getheader('Content-Type'))
except Exception as e:
    print(e)