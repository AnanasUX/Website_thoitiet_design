import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Pass darkMode to WeatherSection calls
content = re.sub(r'<WeatherSection (.*?)/>', r'<WeatherSection \1 darkMode={darkMode} />', content)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Added darkMode prop to WeatherSection")