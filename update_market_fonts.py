import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Make the title smaller
content = content.replace(
    '<h2 className="font-semibold leading-[26px] text-[#182033] text-[20px]">',
    '<h2 className="font-semibold leading-[26px] text-[#182033] text-[16px] md:text-[18px]">'
)

# Bump trend indicator text
content = content.replace(
    '<p className="text-[11px] sm:text-[13px] font-bold text-[#182033]">',
    '<p className="text-[12px] sm:text-[14px] font-bold text-[#182033]">'
)
content = content.replace(
    '<p className="text-[11px] sm:text-[13px] font-bold text-[#ef4444] flex items-center gap-1">',
    '<p className="text-[12px] sm:text-[14px] font-bold text-[#ef4444] flex items-center gap-1">'
)
content = content.replace(
    '<p className="text-[11px] sm:text-[13px] font-bold text-[#16a34a] flex items-center gap-1">',
    '<p className="text-[12px] sm:text-[14px] font-bold text-[#16a34a] flex items-center gap-1">'
)

# Bump Intra-day title
content = content.replace(
    '<p className="text-[10px] font-bold text-[#5f687b]">BI',
    '<p className="text-[11px] sm:text-[12px] font-bold text-[#5f687b]">BI'
)

# Bump H/L stats
content = content.replace(
    '<div className="flex gap-2 text-[9px] font-bold">',
    '<div className="flex gap-2 text-[10px] sm:text-[11px] font-bold">'
)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Updated font sizes in MarketSection")