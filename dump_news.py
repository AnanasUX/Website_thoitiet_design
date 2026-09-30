with open("src/App.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()
with open("news_logic.txt", "w", encoding="utf-8") as outf:
    outf.write("".join(lines[1250:1395]))