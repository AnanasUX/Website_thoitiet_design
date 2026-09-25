import re
with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()
content = re.sub(r"5\s*b[Aà]i", "{newsFeed.length} bài", content)
with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)