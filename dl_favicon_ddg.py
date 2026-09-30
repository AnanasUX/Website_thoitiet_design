import urllib.request
url = "https://icons.duckduckgo.com/ip3/dantri.com.vn.ico"
try:
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    res = urllib.request.urlopen(req)
    with open("dantri_ddg.ico", "wb") as f:
        f.write(res.read())
    print("Saved DDG")
except Exception as e:
    print(e)