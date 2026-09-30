import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# We need to replace the stats block and the forecast block in WeatherSection.
# First, let's extract WeatherSection completely and rewrite it.
# It starts at: function WeatherSection
# It ends at the closing brace of WeatherSection.

# Find start
start_idx = content.find("function WeatherSection")
if start_idx == -1:
    print("Cannot find WeatherSection")
    exit(1)

# Find the end of WeatherSection. We will just use regex to replace everything from `function WeatherSection` to the first `function MobileLayout`
end_idx = content.find("function MobileLayout")

if end_idx == -1:
    print("Cannot find MobileLayout")
    exit(1)

weather_section = content[start_idx:end_idx]

# Inside weather_section, we want to replace the stats block and the forecast block.
old_stats = """        <div className="flex gap-2 items-start w-full text-[13px]">
          <div className="bg-[rgba(255,255,255,0.09)] border border-[rgba(255,255,255,0.2)] flex flex-1 flex-col gap-2 items-start min-w-0 overflow-hidden p-4 rounded-2xl">
            <p className="font-['Inter:Bold'] font-bold text-white whitespace-nowrap">💧 Độ ẩm</p>
            <p className="font-['Inter:Regular'] font-normal leading-5 text-[rgba(255,255,255,0.75)]">{WEATHER.humidity}</p>
          </div>
          <div className="bg-[rgba(255,255,255,0.09)] border border-[rgba(255,255,255,0.2)] flex flex-1 flex-col gap-2 items-start min-w-0 overflow-hidden p-4 rounded-2xl">
            <p className="font-['Inter:Bold'] font-bold text-white whitespace-nowrap">PM2.5</p>
            <p className="font-['Inter:Regular'] font-normal leading-5 text-[rgba(255,255,255,0.75)]">{WEATHER.pm25}</p>
          </div>
        </div>
      </div>

      {/* Forecast */}
      <div className="bg-white border border-[#e3e7ef] flex flex-col gap-2 items-start overflow-hidden p-4 rounded-2xl text-[13px] w-full">
        <p className="font-['Inter:Bold'] font-bold text-[#182033] whitespace-nowrap">DỰ BÁO 3 GIỜ TỚI</p>
        <p className="font-['Inter:Regular'] font-normal leading-5 text-[#5f687b] w-full">{WEATHER.forecastText}</p>
      </div>"""

new_stats = """        <div className="grid grid-cols-2 gap-2 w-full text-[13px]">
          {[
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
          ].map((stat, idx) => (
            <div key={idx} className="bg-[rgba(255,255,255,0.09)] border border-[rgba(255,255,255,0.2)] flex flex-col gap-1 items-start min-w-0 overflow-hidden p-3 rounded-xl">
              <p className="font-['Inter:Medium'] font-medium text-[rgba(255,255,255,0.9)] text-[12px] whitespace-nowrap">{stat.label}</p>
              <p className="font-['Inter:Bold'] font-bold leading-5 text-white">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Forecast */}
      <div className="bg-white border border-[#e3e7ef] flex flex-col gap-4 items-start overflow-hidden p-4 rounded-2xl text-[13px] w-full">
        <p className="font-['Inter:Bold'] font-bold text-[#182033] whitespace-nowrap">DỰ BÁO HÀNG GIỜ (HOURLY)</p>
        <div className="flex gap-4 overflow-x-auto w-full pb-2 scrollbar-hide">
          {(WEATHER.hourlyForecast || []).map((hour: any, idx: number) => (
            <div key={idx} className="flex flex-col items-center gap-2 min-w-[50px]">
              <p className="font-['Inter:Semi_Bold'] font-semibold text-[#182033] text-[12px] whitespace-nowrap">{hour.time}</p>
              <img src={`https://openweathermap.org/img/wn/${hour.icon}.png`} className="w-8 h-8 drop-shadow-sm" />
              <p className="font-['Inter:Semi_Bold'] font-semibold text-[#0a84ff] text-[10px] whitespace-nowrap">{hour.pop}%</p>
              <p className="font-['Inter:Bold'] font-bold text-[#182033] text-[14px] whitespace-nowrap">{hour.temp}°</p>
            </div>
          ))}
        </div>
      </div>"""

# Wait! The original text has `DỰ BÁO 3 GIỜ TỚI` which I need to replace.
# Let's use regex that ignores exact whitespace.
pattern = r'<div className="flex gap-2 items-start w-full text-\[13px\]">.*?DỰ BÁO 3 GIỜ TỚI.*?</p>\s*</div>'

import re
if re.search(pattern, weather_section, re.DOTALL):
    new_weather_section = re.sub(pattern, new_stats, weather_section, flags=re.DOTALL)
    content = content[:start_idx] + new_weather_section + content[end_idx:]
    with open("src/App.tsx", "w", encoding="utf-8") as f:
        f.write(content)
    print("Success")
else:
    print("Failed to match pattern in WeatherSection")
    print(weather_section)