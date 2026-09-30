with open("src/App.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()
in_desktop = False
for i, line in enumerate(lines):
    if "function DesktopLayout" in line:
        in_desktop = True
    if in_desktop and "Xem thêm" in line:
        print(f"Desktop Xem thêm: {i}")
        # Print a few lines around it
        for j in range(i-3, i+5):
            print(lines[j].strip('\n'))
        break