import re
with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

start = content.find("function MarketSection() {")
end = content.find("function DesktopLayout", start)
if start > 0 and end > 0:
    print(f"Found MarketSection from {start} to {end}")
    with open("market_old.tsx", "w", encoding="utf-8") as out:
        out.write(content[start:end])
else:
    print("Not found")