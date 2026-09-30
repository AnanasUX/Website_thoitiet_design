with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("hide-scrollbar", "scrollbar-hide")

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)