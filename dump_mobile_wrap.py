with open("src/App.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()
for i, line in enumerate(lines):
    if "function MobileLayout" in line:
        with open("mobile_check.txt", "w", encoding="utf-8") as outf:
            outf.write("".join(lines[i+30:i+70]))
        break