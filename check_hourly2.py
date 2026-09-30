with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

idx = content.find("function HourlyTemperatureChart")
end_idx = content.find("function WeatherSection", idx)

with open("hourly.txt", "w", encoding="utf-8") as f:
    f.write(content[idx:end_idx])