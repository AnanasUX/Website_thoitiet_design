with open("src/App.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

in_desktop = False
for i, line in enumerate(lines):
    if "function DesktopLayout" in line:
        in_desktop = True
    if in_desktop and "{/* Featured feed card */}" in line:
        print(f"Desktop Featured start: {i}")
    if in_desktop and "<button" in line and "Xem thêm" in line:
        print(f"Desktop Button: {i}")
        break