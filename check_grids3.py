import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

out = ""
for m in re.finditer(r'\{newsFeed\.map', content):
    start = max(0, m.start() - 200)
    out += "--------------------------------\n"
    out += content[start:m.start() + 20] + "\n"

with open("grids.txt", "w", encoding="utf-8") as f:
    f.write(out)