with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("text-[12px] sm:text-[14px] line-clamp-1 sm:line-clamp-2", "text-[14px] line-clamp-1")
content = content.replace("text-[10px] sm:text-[12px]", "text-[12px]")
content = content.replace("text-[11px] sm:text-[14px]", "text-[14px]")

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)