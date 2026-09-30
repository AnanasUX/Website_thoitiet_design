with open("src/App.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()
with open("desktop_block.txt", "w", encoding="utf-8") as outf:
    outf.write("".join(lines[805:865]))