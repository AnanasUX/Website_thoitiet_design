import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

match = re.search(r'(const DEFAULT_RSS_FEEDS.*?\];)', content, re.DOTALL)
if match:
    print(match.group(1))