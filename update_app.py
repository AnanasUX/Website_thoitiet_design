import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Replace Dashboard with Anx.
content = content.replace(
    '<p className="font-[\'Inter:Bold\'] font-bold text-[#182033] text-[18px] whitespace-nowrap">Dashboard</p>',
    '<p className="font-[\'Inter:Bold\'] font-bold text-[#182033] text-[18px] whitespace-nowrap">Anx.</p>'
)

# Customize the datetime string to be explicitly capitalized and precisely formatted
old_dateStr = 'const dateStr = now.toLocaleDateString("vi-VN", { weekday: "long", day: "numeric", month: "long" });'
new_dateStr = """
    const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    const dayName = days[now.getDay()];
    const dateStr = `${dayName}, ${now.getDate()} tháng ${now.getMonth() + 1}`;
"""

# Wait, let's just do a regex replace for the dateStr line
content = re.sub(r'const dateStr = now\.toLocaleDateString\("vi-VN", \{ weekday: "long", day: "numeric", month: "long" \}\);', new_dateStr.strip(), content)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Updated App.tsx")