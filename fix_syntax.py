import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Add the missing </div>
content = content.replace('</div>\n        <div className="flex justify-between text-[8px] sm:text-[9px] text-[#5f687b] mt-1 font-medium px-[2px]">', '</div>\n        </div>\n        <div className="flex justify-between text-[8px] sm:text-[9px] text-[#5f687b] mt-1 font-medium px-[2px]">')

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Added missing closing tag.")