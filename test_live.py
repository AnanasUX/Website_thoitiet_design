import urllib.request
req = urllib.request.Request("https://ananasux.github.io/Website_thoitiet_design/")
res = urllib.request.urlopen(req)
html = res.read().decode("utf-8")
import re
js_file = re.search(r'assets/index-.*?\.js', html)
if js_file:
    js_url = "https://ananasux.github.io/Website_thoitiet_design/" + js_file.group(0)
    print("Found JS:", js_url)
    req2 = urllib.request.Request(js_url)
    res2 = urllib.request.urlopen(req2)
    js_code = res2.read().decode("utf-8")
    if "bản mới nhất" in js_code:
        print("Live code has 'bản mới nhất'")
    else:
        print("Live code does NOT have 'bản mới nhất'")
else:
    print("No JS file found")