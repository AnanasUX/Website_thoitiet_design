with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

start_idx = content.find("function MarketSection() {")
end_idx = content.find("function DesktopLayout", start_idx)

with open("market_section.txt", "w", encoding="utf-8") as f:
    f.write(content[start_idx:end_idx])

print("Dumped MarketSection")