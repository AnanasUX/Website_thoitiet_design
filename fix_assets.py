import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Replace assetPathPrefix
content = content.replace(
    'const assetPathPrefix = "/assets";',
    'const assetPathPrefix = (import.meta.env.BASE_URL === "/" ? "" : import.meta.env.BASE_URL.replace(/\\/$/, "")) + "/assets";'
)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Updated assetPathPrefix")
