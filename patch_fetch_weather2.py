import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Helper for wind direction
wind_helper = """
  const getWindDirection = (deg: number) => {
    if (deg >= 337.5 || deg < 22.5) return 'Bắc';
    if (deg >= 22.5 && deg < 67.5) return 'Đông Bắc';
    if (deg >= 67.5 && deg < 112.5) return 'Đông';
    if (deg >= 112.5 && deg < 157.5) return 'Đông Nam';
    if (deg >= 157.5 && deg < 202.5) return 'Nam';
    if (deg >= 202.5 && deg < 247.5) return 'Tây Nam';
    if (deg >= 247.5 && deg < 292.5) return 'Tây';
    if (deg >= 292.5 && deg < 337.5) return 'Tây Bắc';
    return '';
  };
"""
content = content.replace("export default function App() {", wind_helper + "\nexport default function App() {")


old_fetch_body = """      const c_temp = Math.round(weather.main?.temp || 0);
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

new_fetch_body = """      const c_temp = Math.round(weather.main?.temp || 0);
      const feels_like = Math.round(weather.main?.feels_like || 0);
      const t_min = Math.round(weather.main?.temp_min || c_temp);
      const t_max = Math.round(weather.main?.temp_max || c_temp);
      const humidity = weather.main?.humidity || 0;
      const c_desc = weather.weather?.[0]?.description || "";
      const iconCode = weather.weather?.[0]?.icon || "";
      const c_icon = iconCode.includes("d") ? "☀️" : "🌙";
      
      const pop = forecast.list?.[0]?.pop || 0;
      const popPercent = Math.round(pop * 100);
      
      const pm25 = aqi.list?.[0]?.components?.pm25 || 15;
      
      const windMs = weather.wind?.speed || 0;
      const windDeg = weather.wind?.deg || 0;
      const windKmh = Math.round(windMs * 3.6);
      const windStr = windKmh > 0 ? `${windKmh} km/h • ${getWindDirection(windDeg)}` : "N/A";
      
      const formatTime = (ts: number) => {
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

content = content.replace(old_fetch_body, new_fetch_body)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Success")