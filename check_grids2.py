import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

for m in re.finditer(r'\{newsFeed\.map', content):
    start = max(0, m.start() - 200)
    print("--------------------------------")
    print(content[start:m.start() + 20])
