import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

replacements = {
    "VnExpress Số Hóa": "VnExpress • Số Hóa",
    "Thanh Niên Công nghệ": "Thanh Niên • Công nghệ",
    "Tuổi Trẻ Công nghệ": "Tuổi Trẻ • Công nghệ",
    "Dân Trí Sức mạnh số": "Dân Trí • Sức mạnh số",
    
    "Tuổi Trẻ Nhịp sống trẻ": "Tuổi Trẻ • Nhịp sống trẻ",
    "Thanh Niên Giới trẻ": "Thanh Niên • Giới trẻ",
    "Dân Trí Nhịp sống trẻ": "Dân Trí • Nhịp sống trẻ",
    
    "VnExpress Giáo dục": "VnExpress • Giáo dục",
    "Tuổi Trẻ Giáo dục": "Tuổi Trẻ • Giáo dục",
    "Thanh Niên Giáo dục": "Thanh Niên • Giáo dục",
    "Dân Trí Giáo dục": "Dân Trí • Giáo dục",
    
    "VnExpress Kinh doanh": "VnExpress • Kinh doanh",
    "VnExpress Startup": "VnExpress • Startup",
    
    "VnExpress Giải trí": "VnExpress • Giải trí",
    "Tuổi Trẻ Giải trí": "Tuổi Trẻ • Giải trí",
    "Thanh Niên Giải trí": "Thanh Niên • Giải trí",
    
    "VnExpress Du lịch": "VnExpress • Du lịch",
    "Tuổi Trẻ Du lịch": "Tuổi Trẻ • Du lịch",
    "Thanh Niên Du lịch": "Thanh Niên • Du lịch",
    
    "VnExpress Thể thao": "VnExpress • Thể thao",
    "Tuổi Trẻ Thể thao": "Tuổi Trẻ • Thể thao",
    "Thanh Niên Thể thao": "Thanh Niên • Thể thao",
}

for old, new in replacements.items():
    content = content.replace(f'name: "{old}"', f'name: "{new}"')

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Updated RSS_FEEDS_DB names")