import re
with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

matches = re.findall(r'name:\s*"([^"]+)"', content)
with open("names_out.txt", "w", encoding="utf-8") as f:
    for m in matches:
        f.write(m + "\n")