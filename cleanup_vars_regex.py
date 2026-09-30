import re
with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Using regex to remove the duplicate
content = re.sub(
    r"const axisMax = Math\.max\(\.\.\.chartData\.real, \.\.\.chartData\.forecast\) \* 1\.001;\s*const r = axisMax - axisMin;",
    "",
    content
)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Cleaned up old variables via regex.")