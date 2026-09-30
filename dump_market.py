import re
with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

match = re.search(r'function MarketSection.*?return\s*\(.*?\s*</svg>\s*</p>\s*\)\}\s*</div>\s*<div className="flex flex-col p-2.*?</div>\s*</div>\s*</div>\s*\)\s*\}', content, re.DOTALL)
if match:
    with open("market_section.txt", "w", encoding="utf-8") as out:
        out.write(match.group(0))
    print("Dumped MarketSection")
else:
    print("Not found")