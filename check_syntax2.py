with open("src/App.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()
for i, line in enumerate(lines):
    if "{isFetchingCategory ? <NewsSkeleton />" in line:
        for j in range(i, i+15):
            print(lines[j].strip())
        break