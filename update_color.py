import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Replace the specific forecast color
content = content.replace('#94a3b8', '#cbd5e1')

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Color changed.")