import urllib.request
try:
    req = urllib.request.Request("https://corsproxy.io/?url=https://sjc.com.vn/xml/tygiavang.xml", headers={'User-Agent': 'Mozilla/5.0'})
    html = urllib.request.urlopen(req, timeout=5).read()
    print(html[:500])
except Exception as e:
    print("Error:", e)