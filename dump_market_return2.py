import re
with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

match = list(re.finditer(r'return \(\s*<div className="w-full flex flex-col gap-3 mb-6 bg-white(.*?)\);\s*\}', content, re.DOTALL))
if match:
    with open("dump_out.txt", "w", encoding="utf-8") as out:
        out.write(match[-1].group(0))