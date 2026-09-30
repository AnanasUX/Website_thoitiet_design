import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Weather
content = content.replace(
    '<p className="font-semibold leading-[26px] text-[#182033] text-[20px]">Th',
    '<p className="font-semibold leading-[26px] text-[#182033] text-[18px]">Th'
)

# 2. Latest News (Mobile/Desktop)
content = content.replace(
    '<p className="font-semibold leading-[26px] text-[#182033] text-[20px]">\n            Tin T',
    '<p className="font-semibold leading-[26px] text-[#182033] text-[18px]">\n            Tin T'
)
# Just in case it's on one line
content = content.replace(
    '<p className="font-semibold leading-[26px] text-[#182033] text-[20px]">Tin T',
    '<p className="font-semibold leading-[26px] text-[#182033] text-[18px]">Tin T'
)

# 3. News (Tablet)
content = content.replace(
    '<p className="font-bold text-[#182033] text-[20px] tracking-[-0.3px]">Tin t',
    '<p className="font-semibold leading-[26px] text-[#182033] text-[18px]">Tin t'
)

# 4. Gold Price
content = content.replace(
    '<h2 className="font-semibold leading-[26px] text-[#182033] text-[16px] md:text-[18px]">Gi',
    '<h2 className="font-semibold leading-[26px] text-[#182033] text-[18px]">Gi'
)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Updated all section titles to 18px")