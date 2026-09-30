with open("src/App.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()
for i, line in enumerate(lines):
    if "function TabletLayout" in line:
        start = i
    if "GoldPriceSection />" in line and "TabletLayout" in "".join(lines[i-20:i]):
        for j in range(i-5, i+5):
            print(f"{j+1}: {lines[j].strip()}")
        break