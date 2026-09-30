import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

old_stats_block = """          <div className="flex gap-2 items-start w-full text-[13px]">
            <div className="bg-[rgba(255,255,255,0.09)] border border-[rgba(255,255,255,0.2)] flex flex-1 flex-col gap-2 items-start min-w-0 overflow-hidden p-4 rounded-2xl">
              <p className="font-['Inter:Bold'] font-bold text-white whitespace-nowrap">💧 Độ ẩm</p>
              <p className="font-['Inter:Regular'] font-normal leading-5 text-[rgba(255,255,255,0.75)]">{WEATHER.humidity}</p>
            </div>
            <div className="bg-[rgba(255,255,255,0.09)] border border-[rgba(255,255,255,0.2)] flex flex-1 flex-col gap-2 items-start min-w-0 overflow-hidden p-4 rounded-2xl">
              <p className="font-['Inter:Bold'] font-bold text-white whitespace-nowrap">PM2.5</p>
              <p className="font-['Inter:Regular'] font-normal leading-5 text-[rgba(255,255,255,0.75)]">{WEATHER.pm25}</p>
            </div>
          </div>"""

new_stats_block = """          <div className="grid grid-cols-2 gap-2 w-full text-[13px]">
            {[
              { label: "💧 Độ ẩm", value: WEATHER.humidity },
              { label: "💨 Sức gió", value: WEATHER.wind },
              { label: "😷 PM2.5", value: WEATHER.pm25 },
              { label: "☁️ Mây", value: WEATHER.clouds },
              { label: "👁️ Tầm nhìn", value: WEATHER.visibility },
              { label: "⏬ Áp suất", value: WEATHER.pressure }
            ].map((stat, idx) => (
              <div key={idx} className="bg-[rgba(255,255,255,0.09)] border border-[rgba(255,255,255,0.2)] flex flex-col gap-2 items-start min-w-0 overflow-hidden p-4 rounded-2xl">
                <p className="font-['Inter:Bold'] font-bold text-white whitespace-nowrap">{stat.label}</p>
                <p className="font-['Inter:Regular'] font-normal leading-5 text-[rgba(255,255,255,0.75)]">{stat.value}</p>
              </div>
            ))}
          </div>"""

# Replace all occurrences (should be 2: one in MobileLayout, one in DesktopLayout)
content = content.replace(old_stats_block, new_stats_block)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Success")