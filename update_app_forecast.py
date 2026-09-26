import re
with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

s_old = "const forecastText = `Kho\\u1ea3ng ${(fore.temp as number) ?? cur.temp}\\u00b0C | ${(fore.desc as string) ?? \"\"} | M\\u01b0a: ${(fore.pop as number) ?? 0}%`;"
# Wait, unicode escaping in python regex might be tricky. Let's find it by substring:
s_old2 = "`Khoảng ${(fore.temp as number) ?? cur.temp}°C | ${(fore.desc as string) ?? \"\"} | Mưa: ${(fore.pop as number) ?? 0}%`"
s_new2 = "`~${(fore.temp as number) ?? cur.temp}°C | ${WEATHER_THEMES[key].label} | Mưa: ${(fore.pop as number) ?? 0}%`"
content = content.replace(s_old2, s_new2)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Updated forecastText in App.tsx")