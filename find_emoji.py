import re
with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Let's find all occurrences of this exact structure:
matches = re.finditer(r'<div className="bg-\[#ffe8ee\] flex flex-col items-center justify-center overflow-hidden rounded-full shrink-0 size-11">\s*<p className="font-bold text-\[#ff315f\] text-\[15\.84px\]">\s*.*?\s*</p>\s*</div>', content, re.DOTALL)
for m in matches:
    print(f"Match found at: {m.start()} - {m.end()}")
