with open("src/App.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()
for i, line in enumerate(lines):
    if "useEffect" in line or "fetch" in line:
        print(f"{i}: {line.strip()}")