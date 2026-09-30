import re
with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

match = re.search(r'(function GoldPriceSection\(\) \{.*?\n\})', content, re.DOTALL)
if match:
    print(match.group(1)[:2000]) # First 2000 chars
    print("... (truncated)")
    print(match.group(1)[-2000:]) # Last 2000 chars