import urllib.request
try:
    req = urllib.request.Request("https://api.allorigins.win/raw?url=https://portal.vietcombank.com.vn/Usercontrols/TVPortal.TyGia/pXML.aspx", headers={'User-Agent': 'Mozilla/5.0'})
    html = urllib.request.urlopen(req).read()
    print(html[:500])
except Exception as e:
    print("Error:", e)