import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# I will update the flex classes in the GoldPriceSection
old_buy = """<div className="flex flex-col xl:flex-row xl:justify-between xl:items-center w-full gap-[2px]">
              <p className="text-[#5f687b] text-[11px] sm:text-[12px]">Mua</p>
              <p className="font-semibold text-[#16a34a] text-[12px] sm:text-[14px] whitespace-nowrap">{item.priceIn.toLocaleString('vi-VN')}</p>
            </div>"""

new_buy = """<div className="flex flex-col lg:flex-row lg:justify-between lg:items-center w-full gap-[2px]">
              <p className="text-[#5f687b] text-[11px] sm:text-[12px]">Mua</p>
              <p className="font-semibold text-[#16a34a] text-[12px] sm:text-[14px] whitespace-nowrap">{item.priceIn.toLocaleString('vi-VN')}</p>
            </div>"""

old_sell = """<div className="flex flex-col xl:flex-row xl:justify-between xl:items-center w-full mt-1 gap-[2px]">
              <p className="text-[#5f687b] text-[11px] sm:text-[12px]">Bán</p>
              <p className="font-semibold text-[#ef4444] text-[12px] sm:text-[14px] whitespace-nowrap">{item.priceOut.toLocaleString('vi-VN')}</p>
            </div>"""

new_sell = """<div className="flex flex-col lg:flex-row lg:justify-between lg:items-center w-full mt-1 lg:mt-2 gap-[2px]">
              <p className="text-[#5f687b] text-[11px] sm:text-[12px]">Bán</p>
              <p className="font-semibold text-[#ef4444] text-[12px] sm:text-[14px] whitespace-nowrap">{item.priceOut.toLocaleString('vi-VN')}</p>
            </div>"""

content = content.replace(old_buy, new_buy).replace(old_sell, new_sell)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Updated flex classes")