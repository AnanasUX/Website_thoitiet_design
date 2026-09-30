with open("src/App.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()
for i, line in enumerate(lines):
    if "function TabletLayout" in line:
        with open("tablet_out.txt", "w", encoding="utf-8") as f2:
            f2.write("".join(lines[i+20:i+80]))
        break