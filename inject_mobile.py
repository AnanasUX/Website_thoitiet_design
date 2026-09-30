import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

target = """        <div className="flex items-center justify-between w-full mb-1 sticky top-[calc(var(--header-height)-1px)] bg-[#f4f6fa] z-[90] py-3 mt-[-12px]">
          <p className="font-semibold leading-[26px] text-[#182033] text-[20px]">
            Tin Tức Mới Nhất
          </p>
          <MobileCategoryMenu activeCategory={activeCategory} setActiveCategory={setActiveCategory} />
        </div>"""

if target in content and "<GoldPriceSection />\n" + target not in content:
    content = content.replace(target, "<GoldPriceSection />\n" + target)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Injected into MobileLayout")