import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Remove the exact if (loading) return ... block in MarketSection
loading_block = """  if (loading) {
    return (
      <div className="w-full flex flex-col gap-3 mb-6 bg-white p-[var(--card-padding)] rounded-[var(--card-radius)] shadow-[0px_4px_12px_0px_rgba(23,33,51,0.1)] border border-[#e3e7ef]">
        <div className="w-full h-[40px] bg-slate-100 animate-pulse rounded-md"></div>
        <div className="w-full h-[150px] bg-slate-100 animate-pulse rounded-md mt-2"></div>
      </div>
    );
  }"""

if loading_block in content:
    content = content.replace(loading_block, "")
    print("Removed hard skeleton block in MarketSection.")

# Make sure Gold data doesn't crash when loading by adding fallback to displayData
content = content.replace(
    "const axisMin = Math.min(...chartData.real, ...chartData.forecast) * 0.999;",
    """const displayData = goldData.length ? goldData : [
    { productTypeName: 'Đang tải...', priceIn: 0, priceOut: 0 },
    { productTypeName: 'Đang tải...', priceIn: 0, priceOut: 0 },
    { productTypeName: 'Đang tải...', priceIn: 0, priceOut: 0 }
  ];

  const hasChart = chartData.real.length > 0;
  const rawReal = hasChart ? chartData.real.filter(v => v > 0) : new Array(12).fill(0);
  const rawForecast = hasChart ? chartData.forecast : new Array(25).fill(0);

  const axisMin = hasChart ? Math.min(...chartData.real, ...chartData.forecast) * 0.999 : 0;
  const axisMax = hasChart ? Math.max(...chartData.real, ...chartData.forecast) * 1.001 : 1;
  const r = axisMax - axisMin || 1;
"""
)

# And replace rawReal and rawForecast definitions which were:
# const rawReal = chartData.real.filter(v => v > 0);
# const rawForecast = chartData.forecast;
content = content.replace(
    "const rawReal = chartData.real.filter(v => v > 0);\n  const rawForecast = chartData.forecast;",
    ""
)

# Replace goldData.map with displayData.map
content = content.replace(
    "{goldData.map((item, idx) => (",
    "{displayData.map((item, idx) => ("
)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Updated MarketSection for soft skeleton.")