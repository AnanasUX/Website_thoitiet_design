import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

match = re.search(r'function DesktopLayout.*?return \((.*?)\);\s*\}', content, re.DOTALL)
if match:
    # Print the lines containing Tin tức and around it
    lines = match.group(1).split('\n')
    for i, line in enumerate(lines):
        if "Tin Tức Mới Nhất" in line or "Tin tức" in line:
            start = max(0, i - 15)
            end = min(len(lines), i + 15)
            with open("desktop_out.txt", "w", encoding="utf-8") as outf:
                for j in range(start, end):
                    outf.write(lines[j] + "\n")
            break