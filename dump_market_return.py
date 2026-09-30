import re
with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

match = re.search(r'return \(\s*<div className="w-full flex flex-col gap-3 mb-6 bg-white(.*?)\);\s*\}', content, re.DOTALL)
if match:
    print(match.group(0))