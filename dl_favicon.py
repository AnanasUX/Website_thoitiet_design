import urllib.request
url = "https://www.google.com/s2/favicons?domain=dantri.com.vn&sz=128"
try:
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    res = urllib.request.urlopen(req)
    with open("dantri.png", "wb") as f:
        f.write(res.read())
    print("Saved")
except Exception as e:
    print(e)