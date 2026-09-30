import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Change grid layout
content = content.replace(
    '<div className="grid grid-cols-3 gap-2 w-full">',
    '<div className="grid grid-cols-1 md:grid-cols-3 gap-2 w-full">'
)

# 2. Adjust font sizes in GoldPriceSection since mobile has full width now
old_card = """          {goldData.map((item, idx) => (
            <div key={idx} className="flex flex-col border border-[#e3e7ef] rounded-[12px] p-2 sm:p-3 bg-[#f8fafc] w-full min-w-0 overflow-hidden">
              <p className="font-bold text-[#182033] text-[12px] sm:text-[14px] line-clamp-1 sm:line-clamp-2 mb-2 leading-tight" title={item.productTypeName}>{item.productTypeName}</p>
              <div className="flex justify-between items-center w-full gap-1">
                <p className="text-[#5f687b] text-[10px] sm:text-[12px]">Mua</p>
                <p className="font-semibold text-[#16a34a] text-[11px] sm:text-[14px] whitespace-nowrap">{item.priceIn.toLocaleString('vi-VN')}</p>
              </div>
              <div className="flex justify-between items-center w-full mt-1 gap-1">
                <p className="text-[#5f687b] text-[10px] sm:text-[12px]">Bán</p>
                <p className="font-semibold text-[#ef4444] text-[11px] sm:text-[14px] whitespace-nowrap">{item.priceOut.toLocaleString('vi-VN')}</p>
              </div>
            </div>
          ))}"""

new_card = """          {goldData.map((item, idx) => (
            <div key={idx} className="flex flex-col border border-[#e3e7ef] rounded-[12px] p-3 bg-[#f8fafc] w-full min-w-0 overflow-hidden">
              <p className="font-bold text-[#182033] text-[14px] line-clamp-1 sm:line-clamp-2 mb-2 leading-tight" title={item.productTypeName}>{item.productTypeName}</p>
              <div className="flex justify-between items-center w-full gap-1">
                <p className="text-[#5f687b] text-[13px]">Mua</p>
                <p className="font-semibold text-[#16a34a] text-[14px] whitespace-nowrap">{item.priceIn.toLocaleString('vi-VN')}</p>
              </div>
              <div className="flex justify-between items-center w-full mt-1 gap-1">
                <p className="text-[#5f687b] text-[13px]">Bán</p>
                <p className="font-semibold text-[#ef4444] text-[14px] whitespace-nowrap">{item.priceOut.toLocaleString('vi-VN')}</p>
              </div>
            </div>
          ))}"""

content = content.replace(old_card, new_card)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Updated GoldPrice layout to grid-cols-1 md:grid-cols-3 and normalized fonts")