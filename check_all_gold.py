with open("src/App.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()
for i, line in enumerate(lines):
    if "<GoldPriceSection />" in line:
        print(f"--- Line {i+1} ---")
        for j in range(i-2, i+4):
            print(lines[j].strip('\n'))