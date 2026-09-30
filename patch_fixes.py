import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update processJson to MERGE weather data instead of replacing it, preserving hourlyForecast
old_process = """      const entry: WeatherEntry = {
        time:           timeStr,
        location:       loc,
        locationFull:   locStr,
        temp:           `${cur.temp}°C`,
        feelsLike:      `${cur.feels_like}°C`,
        conditionLabel: (cur.desc as string) ?? WEATHER_THEMES[key].label,
        humidity:       `${cur.humidity ?? 60}%`,
        pm25:           `${pm25Val} µg/m³`,
        wind,
        forecastText,
      };

      const newData = { ...DEFAULT_WEATHER_DATA };
      (Object.keys(newData) as ConditionKey[]).forEach((k) => { newData[k] = entry; });
      setLiveData(newData);"""

new_process = """      const entry: Partial<WeatherEntry> = {
        time:           timeStr,
        location:       loc,
        locationFull:   locStr,
        temp:           `${cur.temp}°C`,
        feelsLike:      `${cur.feels_like}°C`,
        conditionLabel: (cur.desc as string) ?? WEATHER_THEMES[key].label,
        humidity:       `${cur.humidity ?? 60}%`,
        pm25:           `${pm25Val} µg/m³`,
        wind,
        forecastText,
      };

      setLiveData(prev => {
        const base = prev ? prev[key] : DEFAULT_WEATHER_DATA[key];
        const merged: WeatherEntry = { ...base, ...entry };
        const newData = { ...(prev || DEFAULT_WEATHER_DATA) };
        (Object.keys(newData) as ConditionKey[]).forEach((k) => { newData[k] = merged; });
        return newData;
      });"""

content = content.replace(old_process, new_process)


# 2. Reduce the 12 stats to 6 stats in WeatherSection
old_stats = """          {[
            { label: "💧 Độ ẩm", value: WEATHER.humidity },
            { label: "💨 Gió", value: WEATHER.wind },
            { label: "😷 PM2.5", value: WEATHER.pm25 },
            { label: "☁️ Mây", value: WEATHER.clouds },
            { label: "👁️ Tầm nhìn", value: WEATHER.visibility },
            { label: "⏬ Áp suất", value: WEATHER.pressure },
            { label: "🌅 Bình minh", value: WEATHER.sunrise },
            { label: "🌇 Hoàng hôn", value: WEATHER.sunset },
            { label: "🌡️ Cao nhất", value: WEATHER.tempMax },
            { label: "📉 Thấp nhất", value: WEATHER.tempMin },
            { label: "☀️ UV Index", value: WEATHER.uvIndex },
            { label: "💧 Điểm sương", value: WEATHER.dewPoint }
          ].map((stat, idx) => ("""

new_stats = """          {[
            { label: "💨 Gió", value: WEATHER.wind },
            { label: "💧 Độ ẩm", value: WEATHER.humidity },
            { label: "👁️ Tầm nhìn", value: WEATHER.visibility },
            { label: "⏬ Áp suất", value: WEATHER.pressure },
            { label: "☀️ UV Index", value: WEATHER.uvIndex },
            { label: "💧 Điểm sương", value: WEATHER.dewPoint }
          ].map((stat, idx) => ("""

content = content.replace(old_stats, new_stats)


with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Success")