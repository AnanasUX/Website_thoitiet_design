import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

mock_hourly = """[
    { time: "Bây giờ", icon: "01d", temp: 32, pop: 0 },
    { time: "16h", icon: "02d", temp: 31, pop: 10 },
    { time: "19h", icon: "03n", temp: 29, pop: 20 },
    { time: "22h", icon: "10n", temp: 27, pop: 60 },
    { time: "01h", icon: "10n", temp: 26, pop: 80 }
  ]"""

content = re.sub(
    r'hourlyForecast:\s*\[\]',
    f'hourlyForecast: {mock_hourly}',
    content
)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Success")