with open("src/App.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()
in_mobile = False
for i, line in enumerate(lines):
    if "function MobileLayout" in line:
        in_mobile = True
    if in_mobile and "Featured" in line:
        print(f"Mobile Featured at {i+1}: {line.strip()}")
    if in_mobile and "function TabletLayout" in line:
        break