with open("src/App.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()
with open("mobile_news_top.txt", "w", encoding="utf-8") as f:
    in_mobile = False
    for i, line in enumerate(lines):
        if "function MobileLayout" in line:
            in_mobile = True
        if in_mobile and "Tin Tức Mới Nhất" in line:
            f.write(f"--- Line {i+1} ---\n")
            for j in range(i-6, i+3):
                f.write(lines[j])
            break