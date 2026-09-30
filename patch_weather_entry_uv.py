import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

old_type = """type WeatherEntry = {
  time: string; location: string; locationFull: string;
  temp: string; feelsLike: string; conditionLabel: string;
  humidity: string; pm25: string; wind: string; forecastText: string;
  pressure: string; clouds: string; visibility: string;
  sunrise: string; sunset: string; tempMin: string; tempMax: string;
};"""

new_type = """type HourlyItem = { time: string; icon: string; temp: number; pop: number; };
type WeatherEntry = {
  time: string; location: string; locationFull: string;
  temp: string; feelsLike: string; conditionLabel: string;
  humidity: string; pm25: string; wind: string; forecastText: string;
  pressure: string; clouds: string; visibility: string;
  sunrise: string; sunset: string; tempMin: string; tempMax: string;
  uvIndex: string; dewPoint: string; hourlyForecast: HourlyItem[];
};"""

content = content.replace(old_type, new_type)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Success")