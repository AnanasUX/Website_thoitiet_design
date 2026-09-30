import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

old_stats_ui = """            {[
              { label: "💧 Độ ẩm", value: WEATHER.humidity },
              { label: "💨 Sức gió", value: WEATHER.wind },
              { label: "😷 PM2.5", value: WEATHER.pm25 },
              { label: "☁️ Mây", value: WEATHER.clouds },
              { label: "👁️ Tầm nhìn", value: WEATHER.visibility },
              { label: "⏬ Áp suất", value: WEATHER.pressure }
            ].map((stat, idx) => ("""

new_stats_ui = """            {[
              { label: "💧 Độ ẩm", value: WEATHER.humidity },
              { label: "💨 Gió", value: WEATHER.wind },
              { label: "😷 PM2.5", value: WEATHER.pm25 },
              { label: "☁️ Mây", value: WEATHER.clouds },
              { label: "👁️ Tầm nhìn", value: WEATHER.visibility },
              { label: "⏬ Áp suất", value: WEATHER.pressure },
              { label: "🌅 Bình minh", value: WEATHER.sunrise },
              { label: "🌇 Hoàng hôn", value: WEATHER.sunset },
              { label: "🌡️ Cao nhất", value: WEATHER.tempMax },
              { label: "📉 Thấp nhất", value: WEATHER.tempMin }
            ].map((stat, idx) => ("""

# Replace all occurrences
content = content.replace(old_stats_ui, new_stats_ui)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Success")