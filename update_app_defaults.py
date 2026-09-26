import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Replace "18.50 \u00B5g/m\u00B3 \U0001F7E2", etc.
content = re.sub(r'(pm25:\s*"[0-9.]+\s*[^\s"]+)\s*[^"]+(")', r'\1\2', content)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Updated DEFAULT_WEATHER_DATA in App.tsx")