import re
with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

match = re.search(r'function TabletLayout.*?return \((.*?)\);\s*\}', content, re.DOTALL)
if match:
    print(match.group(1).find('size-11'))