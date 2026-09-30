with open("src/App.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()
in_desktop = False
for i, line in enumerate(lines):
    if "function DesktopLayout" in line:
        in_desktop = True
    if in_desktop and "button" in line.lower():
        print(f"Desktop button: {i}")
        for j in range(i-2, i+5):
            print(lines[j].strip('\n'))
        break