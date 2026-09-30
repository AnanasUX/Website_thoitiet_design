import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Create a fetchWeatherData function
weather_fetcher = """  const fetchRealtimeWeather = async () => {
    try {
      const apiKey = "a201c471567522a7d0b7a0567ad245fe";
      const lat = 20.9716;
      const lon = 105.7725;
      
      const [weather, forecast, aqi] = await Promise.all([
        fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=vi`).then(r => r.json()),
        fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=vi`).then(r => r.json()),
        fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`).then(r => r.json())
      ]);

      const c_temp = Math.round(weather.main?.temp || 0);
      const feels_like = Math.round(weather.main?.feels_like || 0);
      const humidity = weather.main?.humidity || 0;
      const c_desc = weather.weather?.[0]?.description || "";
      const iconCode = weather.weather?.[0]?.icon || "";
      const c_icon = iconCode.includes("d") ? "☀️" : "🌙";
      
      const pop = forecast.list?.[0]?.pop || 0;
      const popPercent = Math.round(pop * 100);
      
      const pm25 = aqi.list?.[0]?.components?.pm25 || 15;
      let pmIcon = "🟢";
      if (pm25 > 50) pmIcon = "🟡";
      if (pm25 > 100) pmIcon = "🟠";
      if (pm25 > 150) pmIcon = "🔴";
      
      const windMs = weather.wind?.speed || 0;
      const windKmh = Math.round(windMs * 3.6);
      const windStr = windKmh > 0 ? `${windKmh} km/h` : "N/A";
      
      const isRaining = c_desc.toLowerCase().includes("mưa") || c_desc.toLowerCase().includes("rain");
      let mappedCondKey: ConditionKey = isRaining ? "mua-nho" : "nang-nhe";
      
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      
      const forecastText = `~${c_temp}°C | ${WEATHER_THEMES[mappedCondKey].label} | Mưa: ${popPercent}%`;
      
      const entry: WeatherEntry = {
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
      };
      
      setCondKey(mappedCondKey);
      setLiveData({
        [mappedCondKey]: entry
      } as Record<ConditionKey, WeatherEntry>);
      
    } catch (e) {
      console.error("Lỗi cập nhật thời tiết realtime:", e);
    }
  };

  useEffect(() => {
    // Start realtime weather interval
    fetchRealtimeWeather();
    const weatherInterval = setInterval(fetchRealtimeWeather, 5 * 60 * 1000); // Every 5 minutes
    return () => clearInterval(weatherInterval);
  }, []);
"""

content = content.replace("export default function App() {", "export default function App() {\n" + weather_fetcher)

# Now, we need to strip out the old weather parsing from processJson and the `else` block so they don't clash.
# Wait, actually if processJson sets liveData, it will be immediately overwritten by fetchRealtimeWeather. 
# But just to be clean, let's remove the OpenWeatherMap fetching from the `else` block.

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Success")