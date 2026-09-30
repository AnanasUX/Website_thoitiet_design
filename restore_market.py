with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("{/* <MarketSection /> */}", "<MarketSection />")

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Restored MarketSection.")