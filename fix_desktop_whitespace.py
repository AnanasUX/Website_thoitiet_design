import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Let's fix DesktopLayout's News Column header.
# We will completely replace the two duplicate blocks with one clean header.

old_block = """        <div className="flex flex-1 flex-col gap-[var(--grid-gap)] items-start min-w-0 overflow-hidden">
      <div className="flex items-center justify-between w-full mb-1 sticky top-[var(--header-height)] bg-[#f4f6fa] z-[90] py-3 mt-[-12px]">
        <p className="font-semibold leading-[26px] text-[#182033] text-[20px]">
          Tin Tức Mới Nhất
        </p>
        <MobileCategoryMenu activeCategory={activeCategory} setActiveCategory={setActiveCategory} />
      </div>

          <div className="flex items-center justify-between w-full">
            <div className="flex gap-[10px] items-center">
              <p className="font-bold text-[#182033] text-[20px] whitespace-nowrap">Tin Tức Mới Nhất</p>
              <div className="bg-[#f7a928] flex items-start px-[10px] py-[3px] rounded-full">
                <p className="font-bold text-[11px] text-white">LIVE</p>
              </div>
            </div>
            
          </div>"""

new_block = """        <div className="flex flex-1 flex-col gap-[var(--grid-gap)] items-start min-w-0 overflow-hidden">
          <div className="flex items-center justify-between w-full sticky top-[var(--header-height)] bg-[#f4f6fa] z-[90] pb-2">
            <div className="flex gap-[10px] items-center">
              <p className="font-bold text-[#182033] text-[20px] whitespace-nowrap">Tin Tức Mới Nhất</p>
              <div className="bg-[#f7a928] flex items-start px-[10px] py-[3px] rounded-full">
                <p className="font-bold text-[11px] text-white">LIVE</p>
              </div>
            </div>
            <MobileCategoryMenu activeCategory={activeCategory} setActiveCategory={setActiveCategory} />
          </div>"""

if old_block in content:
    content = content.replace(old_block, new_block)
    with open("src/App.tsx", "w", encoding="utf-8") as f:
        f.write(content)
    print("Success DesktopLayout")
else:
    print("DesktopLayout block not found")
