import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace(
    'className="px-6 py-3 bg-[#e3e7ef] text-[#182033] font-semibold rounded-full text-[14px] active:scale-95 transition-transform disabled:opacity-50"',
    'className="px-[16px] py-[10px] bg-[#e3e7ef] text-[#182033] font-semibold rounded-[8px] min-h-[44px] active:scale-95 transition-transform disabled:opacity-50"'
)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Success")