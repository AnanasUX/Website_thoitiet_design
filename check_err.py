with open("src/App.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()
for i in range(605, 625):
    print(f"{i+1}: {repr(lines[i])}")