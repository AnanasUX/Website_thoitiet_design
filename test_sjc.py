import urllib.request
try:
    req = urllib.request.Request("https://sjc.com.vn/xml/tygiavang.xml", headers={'User-Agent': 'Mozilla/5.0'})
    html = urllib.request.urlopen(req).read()
    print(html[:500])
except Exception as e:
    print("Error:", e)