import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace('cb=" + Date.now()', 'rnd=" + Date.now()')

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Success")