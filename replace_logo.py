import re
with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Replace the fallback newspaper div with the logo img logic
old_block = """<div className="bg-[#ffe8ee] flex flex-col items-center justify-center overflow-hidden rounded-full shrink-0 size-11">
                  <p className="font-bold text-[#ff315f] text-[15.84px]">📰</p>
                </div>"""

new_block = """{featured.logo ? (
                  <img alt={featured.src} className="rounded-full shrink-0 size-11 object-cover bg-white border border-[#e3e7ef] p-0.5" referrerPolicy="no-referrer" src={featured.logo} />
                ) : (
                  <div className="bg-[#ffe8ee] flex flex-col items-center justify-center overflow-hidden rounded-full shrink-0 size-11">
                    <p className="font-bold text-[#ff315f] text-[15.84px]">📰</p>
                  </div>
                )}"""

content = content.replace(old_block, new_block)

# Wait, what if the emoji is garbled in the python script? Let's use regex to replace it
old_regex = r'<div className="bg-\[#ffe8ee\] flex flex-col items-center justify-center overflow-hidden rounded-full shrink-0 size-11">\s*<p className="font-bold text-\[#ff315f\] text-\[15\.84px\]">.*?</p>\s*</div>'

new_block_regex = r'''{featured.logo ? (
                  <img alt={featured.src} className="rounded-full shrink-0 size-11 object-cover bg-white border border-[#e3e7ef] p-0.5" referrerPolicy="no-referrer" src={featured.logo} />
                ) : (
                  <div className="bg-[#ffe8ee] flex flex-col items-center justify-center overflow-hidden rounded-full shrink-0 size-11">
                    <p className="font-bold text-[#ff315f] text-[15.84px]">📰</p>
                  </div>
                )}'''

content = re.sub(old_regex, new_block_regex, content, flags=re.DOTALL)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Replaced successfully")