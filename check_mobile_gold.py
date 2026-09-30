with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

import re
match = re.search(r'function MobileLayout.*?(return \(\s*<div.*?\);\s*\})', content, re.DOTALL)
if match:
    mobile_html = match.group(1)
    if "GoldPriceSection" in mobile_html:
        print("GoldPriceSection found in MobileLayout!")
    else:
        print("Not found in MobileLayout")