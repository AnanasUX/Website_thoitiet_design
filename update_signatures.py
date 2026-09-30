with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update Layouts to accept isLoading
content = content.replace(
    "isFetchingCategory?: boolean;", 
    "isFetchingCategory?: boolean;\n    isLoading?: boolean;"
)
content = content.replace(
    "isFetchingCategory, darkMode, setDarkMode,", 
    "isFetchingCategory, isLoading, darkMode, setDarkMode,"
)

# 2. Update DesktopLayout to pass isLoading to WeatherSection
content = content.replace(
    "<WeatherSection condKey={condKey} liveData={liveData} liveOverrides={liveOverrides} darkMode={darkMode} />",
    "<WeatherSection condKey={condKey} liveData={liveData} liveOverrides={liveOverrides} darkMode={darkMode} isLoading={isLoading} />"
)

# 3. Update TabletLayout
content = content.replace(
    '<WeatherSection compact condKey={condKey} liveData={liveData} liveOverrides={liveOverrides} darkMode={darkMode} />',
    '<WeatherSection compact condKey={condKey} liveData={liveData} liveOverrides={liveOverrides} darkMode={darkMode} isLoading={isLoading} />'
)

# 4. Update MobileLayout
content = content.replace(
    '<WeatherSection compact condKey={condKey} liveData={liveData} liveOverrides={liveOverrides} darkMode={darkMode} />',
    '<WeatherSection compact condKey={condKey} liveData={liveData} liveOverrides={liveOverrides} darkMode={darkMode} isLoading={isLoading} />'
)

# 5. Update App component usage
content = content.replace(
    "isFetchingCategory={isFetchingCategory} darkMode={darkMode} setDarkMode={setDarkMode}",
    "isFetchingCategory={isFetchingCategory} isLoading={apiStatus === 'loading'} darkMode={darkMode} setDarkMode={setDarkMode}"
)

# 6. Update WeatherSection signature
content = content.replace(
    "darkMode,\n  }: {",
    "darkMode,\n    isLoading,\n  }: {"
)
content = content.replace(
    "darkMode?: boolean;\n  }) {",
    "darkMode?: boolean;\n    isLoading?: boolean;\n  }) {"
)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Updated Layout signatures and WeatherSection signature.")