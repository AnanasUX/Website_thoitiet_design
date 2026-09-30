with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace(
    'className="flex flex-col shrink-0 min-w-[150px] md:min-w-0 border border-[#e3e7ef] rounded-[12px] p-3 bg-[#f8fafc] w-full overflow-hidden"',
    'className="flex flex-col shrink-0 min-w-[150px] md:min-w-0 border border-[#e3e7ef] rounded-[12px] p-3 bg-[#f8fafc] overflow-hidden"'
)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)