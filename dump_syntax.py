with open("src/App.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()
with open("syntax.txt", "w", encoding="utf-8") as f:
    f.writelines(lines[685:720])