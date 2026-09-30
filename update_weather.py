import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# We need to replace the return block of WeatherSection with a skeleton-aware one.
start = content.find("return (", content.find("function WeatherSection("))
end = content.find("    <HourlyTemperatureChart", start)

weather_body = """return (
    <div className={`flex flex-col gap-4 w-full transition-opacity duration-700 ease-in-out ${isLoading ? 'opacity-70' : 'opacity-100'}`}>
      {/* Hero card */}
      <div
        className="flex flex-col gap-4 items-start overflow-hidden p-6 rounded-2xl shadow-[0px_4px_12px_0px_rgba(23,33,51,0.1)] w-full transition-transform duration-500 hover:scale-[1.02] relative"
          style={{ background: darkMode ? "linear-gradient(21deg, rgb(23, 43, 115) 0%, rgb(18, 28, 48) 50%, rgb(41, 76, 194) 100%)" : "linear-gradient(21deg, rgb(72, 141, 203) 0%, rgb(51, 106, 214) 50%, rgb(79, 196, 255) 100%)" }}
          
      >
        <div className="flex justify-between items-center w-full">
          <p className={`font-semibold text-[13px] whitespace-nowrap ${isLoading ? 'bg-white/30 text-transparent animate-pulse rounded-md' : 'text-white'}`}>
            📍 {compact ? WEATHER.location : WEATHER.locationFull} <span className="animate-pulse inline-block">·</span> {WEATHER.time}
          </p>
          {isLoading && (
            <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
          )}
        </div>
        
        <div className="flex flex-col gap-1 items-start w-full">
          <p className={`font-extrabold leading-none text-[60px] whitespace-nowrap ${isLoading ? 'bg-white/30 text-transparent animate-pulse rounded-md min-w-[120px] h-[60px]' : 'text-white'}`}>
            {isLoading ? '00°C' : WEATHER.temp}
          </p>
          <p className={`font-semibold text-[18px] whitespace-nowrap mt-1 ${isLoading ? 'bg-white/30 text-transparent animate-pulse rounded-md min-w-[100px]' : 'text-white'}`}>
            {!isLoading && <span className="inline-block animate-bounce" style={{ animationDuration: '3s' }}>{baseTheme.emoji}</span>} {isLoading ? 'Đang cập nhật' : WEATHER.conditionLabel}
          </p>
          <p className={`font-normal text-[14px] whitespace-nowrap mt-1 ${isLoading ? 'bg-white/30 text-transparent animate-pulse rounded-md min-w-[120px]' : 'text-[rgba(255,255,255,0.8)]'}`}>
            Cảm nhận {isLoading ? '00°C' : WEATHER.feelsLike}
          </p>
        </div>
                <div className="grid grid-cols-2 gap-2 w-full text-[13px]">
          {[
            { label: "💨 Gió", value: WEATHER.wind },
            { label: "💧 Độ ẩm", value: WEATHER.humidity },
            { label: "😷 Bụi PM2.5", value: WEATHER.pm25 },
            { label: "☂️ Lượng mưa", value: WEATHER.precipitation }
          ].map((item, idx) => (
            <div key={idx} className="flex justify-between items-center border border-[rgba(255,255,255,0.2)] rounded-[8px] p-2 bg-[rgba(255,255,255,0.1)] backdrop-blur-[20px]">
              <p className="text-[rgba(255,255,255,0.8)]">{item.label}</p>
              <p className={`font-semibold ${isLoading ? 'bg-white/30 text-transparent animate-pulse rounded min-w-[40px]' : 'text-white'}`}>{isLoading ? '0' : item.value}</p>
            </div>
          ))}
        </div>
      </div>
"""

content = content[:start] + weather_body + "\n      " + content[end:]

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Updated WeatherSection UI with skeleton loading.")