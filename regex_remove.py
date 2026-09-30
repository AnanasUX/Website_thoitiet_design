import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Using regex to remove the if (loading) block safely
content = re.sub(
    r"if\s*\(loading\)\s*\{\s*return\s*\(\s*<div.*?animate-pulse.*?</div>\s*\);\s*\}",
    "",
    content,
    flags=re.DOTALL
)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Regex removal of hard skeleton done.")