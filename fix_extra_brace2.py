import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

content = re.sub(r'return \{ real: makeOhlc\(realArr\), forecast: makeOhlc\(forecastArr\) \};\s*\};\s*\};\s*useEffect\(\(\) => \{', 'return { real: makeOhlc(realArr), forecast: makeOhlc(forecastArr) };\n    };\n\n  useEffect(() => {', content)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Removed extra brace.")