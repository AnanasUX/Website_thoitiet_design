with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Let's extract the part from `const hasChart = chartData.real.length > 0;` down to `</div>` of the chart.
idx = content.find("const hasChart = chartData.real.length > 0;")
end_idx = content.find("</div>", content.find("08:00", idx)) + 6

with open("chart_section.txt", "w", encoding="utf-8") as f:
    f.write(content[idx:end_idx])