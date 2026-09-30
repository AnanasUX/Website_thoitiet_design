with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Remove inner blur from MarketSection
content = content.replace(
    "border-[#e3e7ef] transition-all duration-700 ease-in-out ${loading ? 'opacity-50 blur-[2px] grayscale-[0.3]' : 'opacity-100 blur-0 grayscale-0'}",
    "border-[#e3e7ef] transition-opacity duration-700 ease-in-out ${loading ? 'opacity-70' : 'opacity-100'}"
)

# Remove inner blur from WeatherSection
content = content.replace(
    "flex flex-col gap-4 w-full transition-opacity duration-700 ease-in-out ${isLoading ? 'opacity-50 blur-[2px] grayscale-[0.3]' : 'opacity-100 blur-0 grayscale-0'}",
    "flex flex-col gap-4 w-full transition-opacity duration-700 ease-in-out ${isLoading ? 'opacity-80' : 'opacity-100'}"
)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Removed inner blurs to prevent double blur.")