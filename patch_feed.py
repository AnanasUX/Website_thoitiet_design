import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Use regex to replace feed.name around author: item.title
content = re.sub(r'src:\s*feed\.name,', 'src: item._sourceName || "Tin tức",', content)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Success")