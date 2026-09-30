import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

idx = content.find("function MarketSection")
end_idx = content.find("function App()", idx)
print(content[end_idx-300:end_idx])