with open("src/App.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()
in_desktop = False
for i, line in enumerate(lines):
    if "function DesktopLayout" in line:
        in_desktop = True
    if in_desktop and "grid.map" in line:
        for j in range(i, i+35):
            if j < len(lines):
                print(lines[j].strip('\n'))
        break