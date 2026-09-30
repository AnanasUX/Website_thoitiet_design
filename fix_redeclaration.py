import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace(".then(html => {", ".then(rawHtml => {")
content = content.replace('const doc = parser.parseFromString(html || "", "text/html");', 'const doc = parser.parseFromString(rawHtml || "", "text/html");')

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Fixed variable redeclaration.")