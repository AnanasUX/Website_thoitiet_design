with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

if "HOURLY" in content:
    print("HOURLY still found!")
else:
    print("HOURLY not found, replacement successful.")