with open("src/App.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()
for i, line in enumerate(lines):
    if "function MobileLayout" in line:
        for j in range(i+60, i+90):
            print(f"{j}: {repr(lines[j])}")
        break