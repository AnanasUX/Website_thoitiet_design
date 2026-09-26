with open("src/App.tsx", "r", encoding="utf-8") as f:
    for i, line in enumerate(f):
        if "lái xe bình thường" in line:
            print(f"{i}: {line.strip()}")
        if "áo khoác mỏng" in line:
            print(f"{i}: {line.strip()}")