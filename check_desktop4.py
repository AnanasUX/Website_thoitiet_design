import re
with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

match = re.search(r'function DesktopLayout.*?return \((.*?)\);\s*\}', content, re.DOTALL)
if match:
    # Print the beginning of DesktopLayout
    lines = match.group(1).split('\n')
    for i in range(20):
        print(lines[i])