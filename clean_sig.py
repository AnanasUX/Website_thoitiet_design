with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

sig = """function WeatherSection({
  compact = false,
  condKey,
  liveData,
  liveOverrides,
  darkMode,
}: {
  compact?: boolean;
  condKey: ConditionKey;
  liveData?: Record<ConditionKey, WeatherEntry>;
  liveOverrides?: LiveOverrides;
  darkMode?: boolean;
    activeCategory?: string;
    setActiveCategory?: (c: string) => void;
    darkMode?: boolean;
    setDarkMode?: (d: boolean) => void;
})"""

sig_clean = """function WeatherSection({
  compact = false,
  condKey,
  liveData,
  liveOverrides,
  darkMode,
}: {
  compact?: boolean;
  condKey: ConditionKey;
  liveData?: Record<ConditionKey, WeatherEntry>;
  liveOverrides?: LiveOverrides;
  darkMode?: boolean;
})"""

content = content.replace(sig, sig_clean)
with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Cleaned up WeatherSection signature")