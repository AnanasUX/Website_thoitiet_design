import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Update signature of WeatherSection
sig_old = """function WeatherSection({
  compact = false,
  condKey,
  liveData,
  liveOverrides,
}: {"""

sig_new = """function WeatherSection({
  compact = false,
  condKey,
  liveData,
  liveOverrides,
  darkMode,
}: {"""
content = content.replace(sig_old, sig_new)

type_old = """  compact?: boolean;
  condKey: ConditionKey;
  liveData?: Record<ConditionKey, WeatherEntry>;
  liveOverrides?: LiveOverrides;
    activeCategory?: string;"""

type_new = """  compact?: boolean;
  condKey: ConditionKey;
  liveData?: Record<ConditionKey, WeatherEntry>;
  liveOverrides?: LiveOverrides;
  darkMode?: boolean;
    activeCategory?: string;"""

if type_old in content:
    content = content.replace(type_old, type_new)
else:
    # If indentation differs, let's just use regex
    content = re.sub(r'(liveOverrides\?: LiveOverrides;)', r'\1\n  darkMode?: boolean;', content)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Added darkMode to WeatherSection")