with open("src/App.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()
for i, line in enumerate(lines):
    if "{isFetchingCategory ? <NewsSkeleton /> : (<div" in line:
        print(f"Line {i+1}: {line.strip()}")
        # print adjacent
        print(f"Line {i+2}: {lines[i+1].strip()}")