import re
with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

match = re.search(r'function MobileLayout.*?(return \(\s*<div.*?\);\s*\})', content, re.DOTALL)
if match:
    mobile_html = match.group(1)
    lines = mobile_html.split('\n')
    for i, line in enumerate(lines):
        if "Tin" in line and "Tức" in line:
            print(line)
        elif "Tin" in line and "tức" in line:
            print(line)