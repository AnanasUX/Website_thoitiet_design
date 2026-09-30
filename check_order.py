with open("src/App.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()
for i, line in enumerate(lines):
    if "function MobileLayout" in line or "function TabletLayout" in line or "function DesktopLayout" in line:
        print(f"Line {i}: {line.strip()}")