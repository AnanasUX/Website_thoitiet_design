with open("src/App.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()
for i, line in enumerate(lines):
    if "GoldPriceSection" in line:
        print(f"Line {i+1}: {line.strip()}")
        # Check surrounding function
        for j in range(i, -1, -1):
            if "function DesktopLayout" in lines[j]:
                print(" -> In DesktopLayout")
                break
            if "function TabletLayout" in lines[j]:
                print(" -> In TabletLayout")
                break
            if "function MobileLayout" in lines[j]:
                print(" -> In MobileLayout")
                break