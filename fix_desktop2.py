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
                {dateStr} · {timeStr}
              </p>
            </div>"""

# Replace with Date/Button being a sibling to the left container
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

if old_desktop.replace("·", "A") in content:
    content = content.replace(old_desktop.replace("·", "A"), new_desktop)
elif old_desktop in content:
    content = content.replace(old_desktop, new_desktop)
else:
    # Just grab DesktopLayout start and find it
    idx = content.find("function DesktopLayout(")
    end_idx = content.find("function handleSecretTap()", idx)
    desk_content = content[idx:end_idx]
    
    old_snip = """<div className="flex gap-[var(--grid-gap)] items-center">
            <p className="font-bold text-[#182033] text-[18px] whitespace-nowrap">Anx.</p>
            <div className="flex items-center">
              <div className="bg-[#f4f6fa] flex items-start px-3 py-1 rounded-full">"""
    
    new_snip = """<div className="flex gap-[var(--grid-gap)] items-center">
            <p className="font-bold text-[#182033] text-[18px] whitespace-nowrap">Anx.</p>
          </div>
          <div className="flex items-center">
            <div className="bg-[#f4f6fa] flex items-center px-3 py-1 rounded-full">"""
    
    desk_content = desk_content.replace(old_snip, new_snip)
    content = content[:idx] + desk_content + content[end_idx:]

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("Fixed DesktopLayout grouping.")