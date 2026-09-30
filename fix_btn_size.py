import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Replace the button classes across the entire file
old_class = 'className="ml-2 w-8 h-8 rounded-full bg-[#f4f6fa] flex items-center justify-center text-[#182033] hover:bg-[#e3e7ef] transition-colors shrink-0"'
new_class = 'className="ml-2 w-[32px] h-[32px] min-w-[32px] min-h-[32px] rounded-full bg-[#f4f6fa] flex items-center justify-center text-[#182033] hover:bg-[#e3e7ef] transition-colors shrink-0 aspect-square"'

content = content.replace(old_class, new_class)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("Replaced button dimensions with explicit pixels")