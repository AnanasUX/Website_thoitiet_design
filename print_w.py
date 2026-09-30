with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()
idx = content.find("function WeatherSection(")
print(content[idx:idx+500])