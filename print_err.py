with open("src/App.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

start = max(0, 904 - 15)
end = min(len(lines), 904 + 15)
for i in range(start, end):
    print(f"{i+1:4d}: {lines[i]}", end="")