import re
with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()
for m in re.finditer(r'.{0,40}Tin Tức.{0,50}', content):
    print(m.group(0))