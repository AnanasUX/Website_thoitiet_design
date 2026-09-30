import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Fix DesktopLayout Header
old_desktop = """<div className="bg-white border-b border-[#e3e7ef] flex h-[var(--header-height)] items-center justify-between px-[var(--page-padding)] w-full shrink-0 max-w-[1200px] mx-auto sticky top-0 z-[100]">
          <div className="flex gap-[var(--grid-gap)] items-center">
            <p className="font-bold text-[#182033] text-[18px] whitespace-nowrap">Anx.</p>
            <div className="flex items-center">
              <div className="bg-[#f4f6fa] flex items-start px-3 py-1 rounded-full">
              <p className="font-normal text-[#5f687b] text-[12px] whitespace-nowrap">
                {dateStr} A {timeStr}
              </p>
            </div>"""

new_desktop = """<div className="bg-white border-b border-[#e3e7ef] flex h-[var(--header-height)] items-center justify-between px-[var(--page-padding)] w-full shrink-0 max-w-[1200px] mx-auto sticky top-0 z-[100]">
          <div className="flex gap-[var(--grid-gap)] items-center">
            <p className="font-bold text-[#182033] text-[18px] whitespace-nowrap">Anx.</p>
          </div>
          <div className="flex items-center">
            <div className="bg-[#f4f6fa] flex items-center px-3 py-1 rounded-full">
              <p className="font-normal text-[#5f687b] text-[12px] whitespace-nowrap">
                {dateStr} · {timeStr}
              </p>
            </div>"""

content = content.replace(old_desktop.replace("A", "·"), new_desktop)
content = content.replace(old_desktop, new_desktop)

# Fix TabletLayout Header
old_tablet = """<div className="bg-white border-b border-[#e3e7ef] flex h-[var(--header-height)] items-center justify-between px-[var(--page-padding)] w-full shrink-0 max-w-[1200px] mx-auto sticky top-0 z-[100]">
          <div className="flex gap-[var(--grid-gap)] items-center">
            <p className="font-bold text-[#ff315f] text-[20px] whitespace-nowrap">Anx.</p>
            <p className="font-medium text-[#5f687b] text-[13px] whitespace-nowrap">
              dY"? {WEATHER.location}
            </p>
          </div>
          <div className="flex items-center">
              <div className="bg-[#f4f6fa] flex items-start px-3 py-1 rounded-full">
            <p className="font-normal text-[#5f687b] text-[12px] whitespace-nowrap">
              {dateStr} A {timeStr}
            </p>
          </div>"""

new_tablet = """<div className="bg-white border-b border-[#e3e7ef] flex h-[var(--header-height)] items-center justify-between px-[var(--page-padding)] w-full shrink-0 max-w-[1200px] mx-auto sticky top-0 z-[100]">
          <div className="flex gap-[var(--grid-gap)] items-center">
            <p className="font-bold text-[#ff315f] text-[20px] whitespace-nowrap">Anx.</p>
            <p className="font-medium text-[#5f687b] text-[13px] whitespace-nowrap">
              📍 {WEATHER.location}
            </p>
          </div>
          <div className="flex items-center">
            <div className="bg-[#f4f6fa] flex items-center px-3 py-1 rounded-full">
              <p className="font-normal text-[#5f687b] text-[12px] whitespace-nowrap">
                {dateStr} · {timeStr}
              </p>
            </div>"""

content = content.replace(old_tablet.replace("dY\"?", "📍").replace("A", "·"), new_tablet)
content = content.replace(old_tablet, new_tablet)

# Let's verify Mobile Layout is correct just in case
old_mobile = """<div className="bg-white border-b border-[#e3e7ef] flex h-[var(--header-height)] items-center justify-between px-[var(--page-padding)] w-full shrink-0 sticky top-0 z-[100]">
          <p className="font-bold text-[#ff315f] text-[20px]">Anx.</p>
          <div className="flex items-center">
            <div className="flex flex-col items-end">
              <p className="font-medium text-[#182033] text-[12px] whitespace-nowrap text-right">
              dY"? {WEATHER.location}
            </p>
              <div className="bg-[#f4f6fa] mt-1 flex items-center px-2 py-0.5 rounded-full">
              <p className="font-normal text-[#5f687b] text-[10px] whitespace-nowrap">
                {shortDateStr} A {timeStr}
              </p>
            </div>
            </div>"""
new_mobile = """<div className="bg-white border-b border-[#e3e7ef] flex h-[var(--header-height)] items-center justify-between px-[var(--page-padding)] w-full shrink-0 sticky top-0 z-[100]">
          <p className="font-bold text-[#ff315f] text-[20px]">Anx.</p>
          <div className="flex items-center">
            <div className="flex flex-col items-end">
              <p className="font-medium text-[#182033] text-[12px] whitespace-nowrap text-right">
              📍 {WEATHER.location}
            </p>
              <div className="bg-[#f4f6fa] mt-1 flex items-center px-2 py-0.5 rounded-full">
              <p className="font-normal text-[#5f687b] text-[10px] whitespace-nowrap">
                {shortDateStr} · {timeStr}
              </p>
            </div>
            </div>"""
content = content.replace(old_mobile.replace("dY\"?", "📍").replace("A", "·"), new_mobile)
content = content.replace(old_mobile, new_mobile)

# Let's fix the petrol names
content = content.replace('name: "Xăng RON 95-III"', 'name: "Xăng E10"')
content = content.replace('name: "Xăng RON 92"', 'name: "Xăng E5"')

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("Fixed grouping in Tablet and Desktop headers, and updated petrol names.")