import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Replace p-4 and rounded-2xl in WeatherSection
old_weather_card = 'className="bg-white flex flex-col gap-4 items-center justify-center p-4 rounded-2xl shadow-[0px_4px_12px_0px_rgba(23,33,51,0.1)] w-full"'
new_weather_card = 'className="bg-white flex flex-col gap-[var(--grid-gap)] items-center justify-center p-[var(--card-padding)] rounded-[var(--card-radius)] shadow-[0px_4px_12px_0px_rgba(23,33,51,0.1)] w-full"'
content = content.replace(old_weather_card, new_weather_card)

# Replace hourly scroll container padding if necessary (currently p-4)
old_weather_scroll = 'className="bg-white flex flex-col gap-4 items-start p-4 rounded-2xl shadow-[0px_4px_12px_0px_rgba(23,33,51,0.1)] w-full overflow-hidden"'
new_weather_scroll = 'className="bg-white flex flex-col gap-[var(--grid-gap)] items-start p-[var(--card-padding)] rounded-[var(--card-radius)] shadow-[0px_4px_12px_0px_rgba(23,33,51,0.1)] w-full overflow-hidden"'
content = content.replace(old_weather_scroll, new_weather_scroll)

# Replace Warning and Suggestion cards
old_weather_warn = 'className="bg-white flex flex-col gap-3 items-start p-4 rounded-2xl shadow-[0px_4px_12px_0px_rgba(23,33,51,0.1)] w-full"'
new_weather_warn = 'className="bg-white flex flex-col gap-[var(--grid-gap)] items-start p-[var(--card-padding)] rounded-[var(--card-radius)] shadow-[0px_4px_12px_0px_rgba(23,33,51,0.1)] w-full"'
content = content.replace(old_weather_warn, new_weather_warn)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Success")