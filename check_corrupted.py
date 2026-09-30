import re
with open("src/App.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()
for i, line in enumerate(lines):
    if "GiA" in line or "BAn" in line or "Tin tcc" in line or "Th?i tit" in line or "Tin Tcc" in line:
        print(f"Line {i+1}: {line.strip()}")