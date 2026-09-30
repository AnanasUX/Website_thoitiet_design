import re

with open("font_download.zip", "r", encoding="utf-8", errors="ignore") as f:
    html = f.read()

match = re.search(r'href="(/uc\?export=download&amp;confirm=[^"]+)"', html)
if match:
    url = "https://drive.google.com" + match.group(1).replace("&amp;", "&")
    print(url)
else:
    print("Not found")