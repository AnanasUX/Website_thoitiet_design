with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()
if "27.080" in content and "26.390" in content:
    print("SUCCESS: Prices are updated.")
else:
    print("FAILED: Prices not found.")