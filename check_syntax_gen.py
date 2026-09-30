import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

idx = content.find("const generateDynamicData = (currentPrice: number) => {")
end_idx = content.find("useEffect(() => {", idx)
print(content[idx:end_idx])