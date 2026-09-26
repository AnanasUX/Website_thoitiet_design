import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("thumbnail?: string", "image?: string")
content = content.replace("item.thumbnail ||", "item.image ||")

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Fixed image key mapping in App.tsx")