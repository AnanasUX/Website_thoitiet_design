import re
with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

content = re.sub(
    r'<p className="font-semibold leading-\[26px\] text-\[#182033\] text-\[20px\]">\s*Tin T',
    '<p className="font-semibold leading-[26px] text-[#182033] text-[18px]">\n            Tin T',
    content
)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Updated remaining 20px News titles")