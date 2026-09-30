with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

idx = content.find("function MarketSection()")
end_idx = content.find("return (", idx)
text = content[idx:end_idx]

lines = text.split("\n")
for i, line in enumerate(lines):
    if line.strip() == "};" or line.strip() == "}" or line.strip() == "}, []);":
        print(f"Line {i}: {line}")