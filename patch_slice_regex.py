import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

content = re.sub(
    r'const rawItems = allNews\.slice\(0,\s*10\);',
    r'const rawItems = allNews;',
    content
)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Success")