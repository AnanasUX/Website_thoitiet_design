with open("src/App.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()
with open("gold_positions.txt", "w", encoding="utf-8") as f:
    for i, line in enumerate(lines):
        if "<GoldPriceSection />" in line:
            f.write(f"--- Line {i+1} ---\n")
            for j in range(i-2, i+4):
                f.write(lines[j])