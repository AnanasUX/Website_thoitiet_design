import re
with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()
out = ""
for m in re.finditer(r'.{0,40}Tin [Tt]ức.{0,50}', content):
    out += m.group(0) + "\n"
with open("title_out.txt", "w", encoding="utf-8") as f:
    f.write(out)