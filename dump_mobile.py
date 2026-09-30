import re
with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

match = re.search(r'function MobileLayout.*?(return \(\s*<div.*?\);\s*\})', content, re.DOTALL)
if match:
    mobile_html = match.group(1)
    with open("mobile_full.txt", "w", encoding="utf-8") as outf:
        outf.write(mobile_html)