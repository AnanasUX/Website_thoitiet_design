import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Fix WeatherEntry type
content = content.replace(
    "warningText?: string; suggestionItems?: string[];",
    "warningText?: string; suggestionItems?: string[];\n  dailyForecast?: any[];\n  weekRange?: string;"
)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Fixed WeatherEntry type")