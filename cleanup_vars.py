import re
with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

old_vars = """const axisMin = Math.min(...chartData.real, ...chartData.forecast) * 0.999;
  const axisMax = Math.max(...chartData.real, ...chartData.forecast) * 1.001;
  const r = axisMax - axisMin;"""

if old_vars in content:
    content = content.replace(old_vars, "")
    print("Cleaned up old variables.")

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)