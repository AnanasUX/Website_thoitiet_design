import re
with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

lines = content.split('\n')
with open("usage.txt", "w", encoding="utf-8") as outf:
    for line in lines:
        if "getNewspaperLogo" in line:
            outf.write(line.strip() + "\n")