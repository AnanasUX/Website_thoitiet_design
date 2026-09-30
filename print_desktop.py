with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()
idx = content.find("function DesktopLayout(")
end_idx = content.find("MarketSection", idx)
with open("temp.txt", "w", encoding="utf-8") as f:
    f.write(content[idx:end_idx])