with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

idx = content.find("function MarketSection()")
end_idx = content.find("return (", idx)
text = content[idx:end_idx]

lines = text.split("\n")
for i in range(35, 45):
    print(f"Line {i}: {lines[i]}")