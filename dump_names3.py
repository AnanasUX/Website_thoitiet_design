import re
import json

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

matches = re.findall(r'name:\s*"([^"]+)"', content)

with open("out_utf8.txt", "w", encoding="utf-8") as f:
    for name in set(matches):
        f.write(name + "\n")