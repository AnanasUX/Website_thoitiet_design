import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

pattern = r'<div className="flex gap-\[10px\] items-center overflow-hidden w-full">\s*<img alt="" className="rounded-full shrink-0 size-11 object-cover".*?src={imgMoreHorizontal} />\s*</div>\s*</div>'

new_block = """<div className="flex flex-col gap-2 items-start w-full">
                  <div className="flex gap-[10px] items-center w-full">
                    <img alt="" className="rounded-full shrink-0 size-6 object-cover border border-gray-100" referrerPolicy="no-referrer" src={item.logo || item.img} data-fallback={item.fallbackImg || ""} onError={(e) => { const el = e.currentTarget; if (el.src !== el.dataset.fallback && el.dataset.fallback) { el.src = el.dataset.fallback; } }} />
                    <p className="font-normal text-[#5f687b] text-[12px]">{item.src}</p>
                  </div>
                  <p className="font-semibold text-[#182033] text-[length:var(--font-h4)] line-clamp-3 w-full leading-snug">{item.author}</p>
                </div>"""

if re.search(pattern, content, re.DOTALL):
    content = re.sub(pattern, new_block, content, flags=re.DOTALL)
    with open("src/App.tsx", "w", encoding="utf-8") as f:
        f.write(content)
    print("Success")
else:
    print("Pattern not found!")