import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

idx = content.find("function MarketSection()")
end_idx = content.find("return (", idx)

print(content[idx:end_idx])