import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Update signature
sig_old = """function WeatherSection({
  compact = false,
  condKey,
  liveData,
  liveOverrides,
}: {
  compact?: boolean;
  condKey: ConditionKey;
  liveData?: Record<ConditionKey, WeatherEntry>;
  liveOverrides?: LiveOverrides;
}) {"""

sig_new = """function WeatherSection({
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

content = content.replace(sig_old, sig_new)

# Update Hero Card
hero_old = 'className="hero-gradient flex flex-col gap-4 items-start overflow-hidden p-6 rounded-2xl shadow-[0px_4px_12px_0px_rgba(23,33,51,0.1)] w-full transition-transform duration-500 hover:scale-[1.02]"'
hero_new = 'className="flex flex-col gap-4 items-start overflow-hidden p-6 rounded-2xl shadow-[0px_4px_12px_0px_rgba(23,33,51,0.1)] w-full transition-transform duration-500 hover:scale-[1.02]"\n          style={{ background: darkMode ? "linear-gradient(21deg, rgb(23, 43, 115) 0%, rgb(18, 28, 48) 50%, rgb(41, 76, 194) 100%)" : "linear-gradient(21deg, rgb(72, 141, 203) 0%, rgb(51, 106, 214) 50%, rgb(79, 196, 255) 100%)" }}'

content = content.replace(hero_old, hero_new)

# Also fix the button!
btn_old = '<button onClick={() => setDarkMode(!darkMode)} className="ml-2 w-[32px] h-[32px] min-w-[32px] min-h-[32px] rounded-full bg-[#f4f6fa] flex items-center justify-center text-[#182033] hover:bg-[#e3e7ef] transition-colors shrink-0 aspect-square">'
btn_new = '<button onClick={() => setDarkMode(!darkMode)} style={{ minHeight: "32px", minWidth: "32px", padding: 0 }} className="ml-2 w-[32px] h-[32px] rounded-full bg-[#f4f6fa] flex items-center justify-center text-[#182033] hover:bg-[#e3e7ef] transition-colors shrink-0 aspect-square">'
content = content.replace(btn_old, btn_new)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Updated WeatherSection signature and Hero style, and button style")