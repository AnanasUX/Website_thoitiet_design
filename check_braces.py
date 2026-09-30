with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

idx = content.find("function MarketSection()")
end_idx = content.find("return (", idx)
text = content[idx:end_idx]

open_c = text.count("{")
close_c = text.count("}")
print(f"Open: {open_c}, Close: {close_c}")