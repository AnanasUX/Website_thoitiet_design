import urllib.request
import sys
sys.stdout.reconfigure(encoding='utf-8')

req2 = urllib.request.Request("https://ananasux.github.io/Website_thoitiet_design/assets/index-DpYP-Ave.js")
res2 = urllib.request.urlopen(req2)
js_code = res2.read().decode("utf-8")
if "bản mới nhất" in js_code:
    print("Live code HAS 'bản mới nhất'")
elif "Đang tải thêm tin tức" in js_code:
    print("Live code has OLD loading text")
else:
    print("Neither found")