with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

old_sig = """function WeatherSection({
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
}) {"""

# Fallback string matching because of formatting
if "liveOverrides,\n  darkMode,\n}: {" in content:
    content = content.replace(
        "liveOverrides,\n  darkMode,\n}: {",
        "liveOverrides,\n  darkMode,\n  isLoading,\n}: {"
    )

if "darkMode?: boolean;\n}) {" in content:
    content = content.replace(
        "darkMode?: boolean;\n}) {",
        "darkMode?: boolean;\n  isLoading?: boolean;\n}) {"
    )

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Updated WeatherSection signature.")