import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

old_set = """      setCondKey(mappedCondKey);
      setLiveData({
        [mappedCondKey]: entry
      } as Record<ConditionKey, WeatherEntry>);"""

new_set = """      setCondKey(mappedCondKey);
      setLiveData(prev => {
        const newData = { ...(prev || DEFAULT_WEATHER_DATA) };
        (Object.keys(newData) as ConditionKey[]).forEach((k) => {
           newData[k] = { ...(newData[k] || {}), ...entry };
        });
        return newData;
      });"""

content = content.replace(old_set, new_set)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Success")