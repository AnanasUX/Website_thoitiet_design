import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

old_type = """type WeatherEntry = {
  time: string; location: string; locationFull: string;
  temp: string; feelsLike: string; conditionLabel: string;
  humidity: string; pm25: string; wind: string; forecastText: string;
  pressure: string; clouds: string; visibility: string;
};"""

new_type = """type WeatherEntry = {
  time: string; location: string; locationFull: string;
  temp: string; feelsLike: string; conditionLabel: string;
  humidity: string; pm25: string; wind: string; forecastText: string;
  pressure: string; clouds: string; visibility: string;
  sunrise: string; sunset: string; tempMin: string; tempMax: string;
};"""
content = content.replace(old_type, new_type)

content = content.replace(
    'visibility: "10 km" }',
    'visibility: "10 km", sunrise: "06:00", sunset: "18:00", tempMin: "25°C", tempMax: "32°C" }'
)
content = content.replace(
    'visibility: "6 km" }',
    'visibility: "6 km", sunrise: "06:00", sunset: "18:00", tempMin: "25°C", tempMax: "32°C" }'
)
content = content.replace(
    'visibility: "4 km" }',
    'visibility: "4 km", sunrise: "06:00", sunset: "18:00", tempMin: "25°C", tempMax: "32°C" }'
)
content = content.replace(
    'visibility: "2 km" }',
    'visibility: "2 km", sunrise: "06:00", sunset: "18:00", tempMin: "25°C", tempMax: "32°C" }'
)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Success")