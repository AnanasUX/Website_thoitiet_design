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

# 7. Add opacity to WeatherSection root div
content = content.replace(
    '<div className="flex flex-col gap-4 w-full">',
    '<div className={`flex flex-col gap-4 w-full transition-opacity duration-700 ease-in-out ${isLoading ? \'opacity-50 blur-[2px] grayscale-[0.3]\' : \'opacity-100 blur-0 grayscale-0\'}`}>'
)

# 8. Add smooth skeleton styling for Gold Section
content = content.replace(
    '<div className="w-full flex flex-col gap-3 mb-6 bg-white p-[var(--card-padding)] rounded-[var(--card-radius)] shadow-[0px_4px_12px_0px_rgba(23,33,51,0.1)] border border-[#e3e7ef]">',
    '<div className={`w-full flex flex-col gap-3 mb-6 bg-white p-[var(--card-padding)] rounded-[var(--card-radius)] shadow-[0px_4px_12px_0px_rgba(23,33,51,0.1)] border border-[#e3e7ef] transition-all duration-700 ease-in-out ${loading ? \'opacity-50 blur-[2px] grayscale-[0.3]\' : \'opacity-100 blur-0 grayscale-0\'}`}>'
)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Updated smooth transitions for both Weather and Gold.")