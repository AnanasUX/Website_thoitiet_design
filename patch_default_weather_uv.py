import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Replace all occurrences of tempMax: "32°C" } with tempMax: "32°C", uvIndex: "5", dewPoint: "24°C", hourlyForecast: [] }
content = re.sub(
    r'tempMax: "(.*?)" \}',
    r'tempMax: "\1", uvIndex: "5", dewPoint: "24°C", hourlyForecast: [] }',
    content
)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Success")