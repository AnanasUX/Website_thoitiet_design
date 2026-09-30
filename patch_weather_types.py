import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update WeatherEntry
old_type = """type WeatherEntry = {
  time: string; location: string; locationFull: string;
  temp: string; feelsLike: string; conditionLabel: string;
  humidity: string; pm25: string; wind: string; forecastText: string;
};"""

new_type = """type WeatherEntry = {
  time: string; location: string; locationFull: string;
  temp: string; feelsLike: string; conditionLabel: string;
  humidity: string; pm25: string; wind: string; forecastText: string;
  pressure: string; clouds: string; visibility: string;
};"""
content = content.replace(old_type, new_type)

# 2. Update DEFAULT_WEATHER_DATA 
content = content.replace(
    'wind: "8 km/h", forecastText: "~26°C | Trời đẹp | Mưa: 5%" }',
    'wind: "8 km/h", forecastText: "~26°C | Trời đẹp | Mưa: 5%", pressure: "1012 hPa", clouds: "10%", visibility: "10 km" }'
)
content = content.replace(
    'wind: "10 km/h", forecastText: "~32°C | Nắng | Mưa: 2%" }',
    'wind: "10 km/h", forecastText: "~32°C | Nắng | Mưa: 2%", pressure: "1009 hPa", clouds: "5%", visibility: "10 km" }'
)
content = content.replace(
    'wind: "6 km/h", forecastText: "~39°C | Nắng gắt | Mưa: 0%" }',
    'wind: "6 km/h", forecastText: "~39°C | Nắng gắt | Mưa: 0%", pressure: "1005 hPa", clouds: "0%", visibility: "10 km" }'
)
content = content.replace(
    'wind: "9 km/h", forecastText: "~27°C | Âm u | Mưa: 8%" }',
    'wind: "9 km/h", forecastText: "~27°C | Âm u | Mưa: 8%", pressure: "1015 hPa", clouds: "80%", visibility: "6 km" }'
)
content = content.replace(
    'wind: "12 km/h", forecastText: "~29.5°C | Mưa nhỏ | Mưa: 13%" }',
    'wind: "12 km/h", forecastText: "~29.5°C | Mưa nhỏ | Mưa: 13%", pressure: "1010 hPa", clouds: "100%", visibility: "4 km" }'
)
content = content.replace(
    'wind: "35 km/h", forecastText: "~24°C | Mưa dông | Mưa: 80%" }',
    'wind: "35 km/h", forecastText: "~24°C | Mưa dông | Mưa: 80%", pressure: "998 hPa", clouds: "100%", visibility: "2 km" }'
)


# 3. Update fetchRealtimeWeather mapping!
old_fetch = """      const entry: WeatherEntry = {
        time: timeStr,
        location: weather.name || "Hà Nội",
        temperature: c_temp,
        condition: c_desc,
        conditionIcon: c_icon,
        forecastText: forecastText,
        stats: [
          { icon: "💧", label: "Độ ẩm", value: `${humidity}%` },
          { icon: pmIcon, label: "PM2.5", value: `${Math.round(pm25)}` },
          { icon: "💨", label: "Sức gió", value: windStr },
          { icon: "🌡️", label: "Cảm giác", value: `${feels_like}°C` }
        ]
      };"""

new_fetch = """      const entry: WeatherEntry = {
        time: timeStr,
        location: (weather.name || "Hà Nội") + ", Hà Nội",
        locationFull: (weather.name || "Hà Nội") + ", Thành phố Hà Nội",
        temp: `${c_temp}°C`,
        feelsLike: `${feels_like}°C`,
        conditionLabel: WEATHER_THEMES[mappedCondKey].label,
        humidity: `${humidity}%`,
        pm25: `${pm25.toFixed(1)} µg/m³`,
        wind: windStr,
        forecastText: forecastText,
        pressure: `${weather.main?.pressure || 1012} hPa`,
        clouds: `${weather.clouds?.all || 0}%`,
        visibility: `${(weather.visibility || 10000) / 1000} km`
      };"""
content = content.replace(old_fetch, new_fetch)

# Write back
with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Success")