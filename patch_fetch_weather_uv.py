import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

old_fetch_promise = """      const [weather, forecast, aqi] = await Promise.all([
        fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=vi`).then(r => r.json()),
        fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=vi`).then(r => r.json()),
        fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`).then(r => r.json())
      ]);"""

new_fetch_promise = """      const [weather, forecast, aqi, uviRes] = await Promise.all([
        fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=vi`).then(r => r.json()),
        fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=vi`).then(r => r.json()),
        fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`).then(r => r.json()),
        fetch(`https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${apiKey}`).then(r => r.json()).catch(() => ({ value: 0 }))
      ]);"""
content = content.replace(old_fetch_promise, new_fetch_promise)

old_fetch_mapping = """      const formatTime = (ts: number) => {
        if (!ts) return "--:--";
        return new Date(ts * 1000).toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' });
      };
      const sunrise = formatTime(weather.sys?.sunrise);
      const sunset = formatTime(weather.sys?.sunset);
      
      const isRaining = c_desc.toLowerCase().includes("mưa") || c_desc.toLowerCase().includes("rain");
      let mappedCondKey: ConditionKey = isRaining ? "mua-nho" : "nang-nhe";
      
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      
      const forecastText = `~${c_temp}°C | ${WEATHER_THEMES[mappedCondKey].label} | Mưa: ${popPercent}%`;
      
      const entry: WeatherEntry = {
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
        visibility: `${(weather.visibility || 10000) / 1000} km`,
        sunrise,
        sunset,
        tempMin: `${t_min}°C`,
        tempMax: `${t_max}°C`
      };"""

new_fetch_mapping = """      const formatTime = (ts: number) => {
        if (!ts) return "--:--";
        return new Date(ts * 1000).toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' });
      };
      const formatTimeShort = (ts: number) => {
        if (!ts) return "--";
        const d = new Date(ts * 1000);
        return `${d.getHours()}h`;
      };
      const sunrise = formatTime(weather.sys?.sunrise);
      const sunset = formatTime(weather.sys?.sunset);
      
      // Calculate Dew Point (Magnus formula)
      let dewPoint = c_temp;
      if (humidity > 0) {
        const a = 17.27;
        const b = 237.7;
        const alpha = ((a * c_temp) / (b + c_temp)) + Math.log(humidity / 100.0);
        dewPoint = Math.round((b * alpha) / (a - alpha));
      }
      
      const hourlyForecast = (forecast.list || []).slice(0, 8).map((item: any) => ({
        time: formatTimeShort(item.dt),
        icon: item.weather?.[0]?.icon || "01d",
        temp: Math.round(item.main?.temp || 0),
        pop: Math.round((item.pop || 0) * 100)
      }));
      
      const isRaining = c_desc.toLowerCase().includes("mưa") || c_desc.toLowerCase().includes("rain");
      let mappedCondKey: ConditionKey = isRaining ? "mua-nho" : "nang-nhe";
      
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      
      const forecastText = `~${c_temp}°C | ${WEATHER_THEMES[mappedCondKey].label} | Mưa: ${popPercent}%`;
      
      const entry: WeatherEntry = {
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
        visibility: `${(weather.visibility || 10000) / 1000} km`,
        sunrise,
        sunset,
        tempMin: `${t_min}°C`,
        tempMax: `${t_max}°C`,
        uvIndex: `${Math.round(uviRes.value || 0)}`,
        dewPoint: `${dewPoint}°C`,
        hourlyForecast
      };"""

content = content.replace(old_fetch_mapping, new_fetch_mapping)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Success")