import re
import json

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

matches = re.findall(r'name:\s*"([^"]+)"', content)

with open("names.json", "w", encoding="utf-8") as f:
    json.dump(list(set(matches)), f, ensure_ascii=False, indent=2)