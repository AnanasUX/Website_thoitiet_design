import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

old_block = """                <div className="flex gap-[10px] items-center overflow-hidden w-full">
                  <img alt="" className="rounded-full shrink-0 size-11 object-cover" referrerPolicy="no-referrer" src={item.logo || item.img} data-fallback={item.fallbackImg || ""} onError={(e) => { const el = e.currentTarget; if (el.src !== el.dataset.fallback && el.dataset.fallback) { el.src = el.dataset.fallback; } }} />
                  <div className="flex flex-1 flex-col items-start min-w-0 overflow-hidden">
                    <p className="font-semibold text-[#182033] text-[length:var(--font-h4)] line-clamp-2">{item.author}</p>
                    <p className="font-normal text-[#5f687b] text-[12px]">{item.src}</p>
                  </div>
                  <div className="relative shrink-0 size-5">
                    <img alt="" className="absolute inset-0 size-full" src={imgMoreHorizontal} />
                  </div>
                </div>"""

new_block = """                <div className="flex flex-col gap-2 items-start w-full">
                  <div className="flex gap-2 items-center w-full">
                    <img alt="" className="rounded-full shrink-0 size-6 object-cover shadow-sm border border-gray-100" referrerPolicy="no-referrer" src={item.logo || item.img} data-fallback={item.fallbackImg || ""} onError={(e) => { const el = e.currentTarget; if (el.src !== el.dataset.fallback && el.dataset.fallback) { el.src = el.dataset.fallback; } }} />
                    <p className="font-normal text-[#5f687b] text-[13px]">{item.src}</p>
                  </div>
                  <p className="font-semibold text-[#182033] text-[length:var(--font-h4)] line-clamp-3 w-full leading-snug">{item.author}</p>
                </div>"""

if old_block in content:
    content = content.replace(old_block, new_block)
    with open("src/App.tsx", "w", encoding="utf-8") as f:
        f.write(content)
    print("Success")
else:
    print("Block not found!")