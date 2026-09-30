import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

idx = content.find("function MarketSection")
ret_idx = content.find("return (", idx)
end_idx = content.find("function App()", ret_idx)

with open("market_section.txt", "w", encoding="utf-8") as f:
    f.write(content[ret_idx:end_idx])