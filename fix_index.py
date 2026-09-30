with open("index.html", "r", encoding="utf-8", errors="ignore") as f:
    html = f.read()

# Replace title (which might be garbled)
import re
html = re.sub(r'<title>.*?</title>', '<title>Anx Tin Tức</title>', html)

# Replace favicon
html = re.sub(r'<link rel="icon".*?>', '<link rel="icon" type="image/png" href="/favicon.png" />', html)

with open("index.html", "w", encoding="utf-8") as f:
    f.write(html)