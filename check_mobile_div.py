with open("src/App.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()
for i, line in enumerate(lines):
    if "function MobileLayout" in line:
        start = i
        for j in range(start, start+150):
            if "justify-center py-2" in lines[j]:
                print(f"Found in Mobile at {j}: {lines[j].strip()}")
            if "function TabletLayout" in lines[j]:
                print("Hit TabletLayout without finding it!")
                break
        break