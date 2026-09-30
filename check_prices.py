with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()
idx = content.find("E10")
print(content[idx-20:idx+80])