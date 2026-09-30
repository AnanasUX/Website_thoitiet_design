import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

old_raw = """  const hasChart = chartData.real.length > 0;
  const rawReal = hasChart ? chartData.real.filter(v => v > 0) : new Array(12).fill(0);
  const rawForecast = hasChart ? chartData.forecast : new Array(25).fill(0);"""

new_raw = """  const hasChart = chartData.real.length > 0;
  const mockOHLC = { o: 0, h: 0, l: 0, c: 0 };
  const rawReal = hasChart ? chartData.real.filter(v => v.c > 0) : new Array(12).fill(mockOHLC);
  const rawForecast = hasChart ? chartData.forecast : new Array(25).fill(mockOHLC);"""

content = content.replace(old_raw, new_raw)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Fixed fallback OHLC array initialization.")