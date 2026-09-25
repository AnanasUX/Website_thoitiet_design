import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update Error Icon
content = content.replace(
    '{(featured.src?.[0] ?? "T").toUpperCase()}',
    '📰'
)

# 2. Remove Search bar
search_bar = """        <div className="bg-[#f4f6fa] border border-[#e3e7ef] flex gap-[10px] h-12 items-center overflow-hidden px-[14px] rounded-[10px] w-[300px]">
          <div className="relative shrink-0 size-[18px]">
            <img alt="" className="absolute inset-0 size-full" src={imgSearch} />
          </div>
          <p className="font-['Inter:Regular'] font-normal leading-[21px] text-[#5f687b] text-[14px] whitespace-nowrap">
            Tìm kiếm thời tiết, tin tức...
          </p>
        </div>"""
content = content.replace(search_bar, "")

# 3. Remove "Xem thêm tin tức"
btn_more = """          <div className="bg-white border border-[#e3e7ef] drop-shadow-[0px_4px_6px_rgba(23,33,51,0.1)] flex items-start px-7 py-[10px] rounded-full cursor-pointer hover:bg-[#f4f6fa] transition-colors custom-cursor-on-hover">
            <p className="font-['Inter:Semi_Bold'] font-semibold text-[#5f687b] text-[13px]">Xem thêm tin tức</p>
          </div>"""
content = content.replace(btn_more, "")

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Updated UI elements.")
