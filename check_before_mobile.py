with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

idx = content.find("function MobileLayout")
with open("before_mobile.txt", "w", encoding="utf-8") as f:
    f.write(content[idx-500:idx])