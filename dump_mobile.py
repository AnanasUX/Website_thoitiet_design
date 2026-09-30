with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

idx = content.find("function MobileLayout")
end_idx = content.find("function TabletLayout", idx)

with open("mobile_layout.txt", "w", encoding="utf-8") as f:
    f.write(content[idx:end_idx])