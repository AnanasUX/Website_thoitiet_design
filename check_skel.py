with open("src/App.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()
for i, line in enumerate(lines):
    if "NewsSkeleton" in line:
        print(f"Line {i}: {line.strip()}")