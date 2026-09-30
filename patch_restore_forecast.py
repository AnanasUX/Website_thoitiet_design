import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

old_hourly_html = """      {/* Forecast */}
      <div className="bg-white border border-[#e3e7ef] flex flex-col gap-4 items-start overflow-hidden p-4 rounded-2xl text-[13px] w-full">
        <p className="font-['Inter:Bold'] font-bold text-[#182033] whitespace-nowrap">DỰ BÁO HÀNG GIỜ (HOURLY)</p>
        <div className="flex gap-4 overflow-x-auto w-full pb-2 scrollbar-hide">
          {(WEATHER.hourlyForecast || []).map((hour: any, idx: number) => (
            <div key={idx} className="flex flex-col items-center gap-2 min-w-[50px]">
              <p className="font-['Inter:Semi_Bold'] font-semibold text-[#182033] text-[12px] whitespace-nowrap">{hour.time}</p>
              <img src={`https://openweathermap.org/img/wn/${hour.icon}.png`} className="w-8 h-8 drop-shadow-sm" />
              <p className="font-['Inter:Semi_Bold'] font-semibold text-[#0a84ff] text-[10px] whitespace-nowrap">{hour.pop}%</p>
              <p className="font-['Inter:Bold'] font-bold text-[#182033] text-[14px] whitespace-nowrap">{hour.temp}°</p>
            </div>
          ))}
        </div>
      </div>"""

new_hourly_html = """      {/* Forecast */}
      <div className="bg-white border border-[#e3e7ef] flex flex-col gap-4 items-start overflow-hidden p-4 rounded-2xl text-[13px] w-full">
        <p className="font-['Inter:Bold'] font-bold text-[#182033] whitespace-nowrap">DỰ BÁO HÀNG GIỜ (HOURLY)</p>
        {WEATHER.hourlyForecast && WEATHER.hourlyForecast.length > 0 ? (
          <div className="flex gap-4 overflow-x-auto w-full pb-2 scrollbar-hide">
            {WEATHER.hourlyForecast.map((hour: any, idx: number) => (
              <div key={idx} className="flex flex-col items-center gap-2 min-w-[50px]">
                <p className="font-['Inter:Semi_Bold'] font-semibold text-[#182033] text-[12px] whitespace-nowrap">{hour.time}</p>
                <img src={`https://openweathermap.org/img/wn/${hour.icon}.png`} className="w-8 h-8 drop-shadow-sm" />
                <p className="font-['Inter:Semi_Bold'] font-semibold text-[#0a84ff] text-[10px] whitespace-nowrap">{hour.pop}%</p>
                <p className="font-['Inter:Bold'] font-bold text-[#182033] text-[14px] whitespace-nowrap">{hour.temp}°C</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="font-['Inter:Regular'] text-[12px] text-[#5f687b] italic">Đang tải dữ liệu...</p>
        )}
      </div>

      <div className="bg-white border border-[#e3e7ef] flex flex-col gap-2 items-start overflow-hidden p-4 rounded-2xl text-[13px] w-full">
        <p className="font-['Inter:Bold'] font-bold text-[#182033] whitespace-nowrap">DỰ BÁO 3 GIỜ TỚI</p>
        <p className="font-['Inter:Regular'] font-normal leading-5 text-[#5f687b] w-full">{WEATHER.forecastText}</p>
      </div>"""

content = content.replace(old_hourly_html, new_hourly_html)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Success")