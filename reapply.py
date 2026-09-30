import re

# 1. Zoom fix
with open("index.html", "r", encoding="utf-8") as f:
    html = f.read()
html = re.sub(
    r'<meta name="viewport" content="width=device-width, initial-scale=1\.0" />',
    '<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0" />',
    html
)
with open("index.html", "w", encoding="utf-8") as f:
    f.write(html)

with open("src/index.css", "r", encoding="utf-8") as f:
    css = f.read()
if "touch-action: pan-x pan-y;" not in css:
    css = css.replace("body {", "html, body {\n  touch-action: pan-x pan-y;\n}\n\nbody {")
with open("src/index.css", "w", encoding="utf-8") as f:
    f.write(css)

# 2. Logo fix
with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# We only replace the 📰 inside the featured article in DesktopLayout.
# Let's find it. It's the one under {/* Featured feed card */}
# But wait, to be safe, I'll use a very specific replace
target = """<div className="bg-[#ffe8ee] flex flex-col items-center justify-center overflow-hidden rounded-full shrink-0 size-11">
                  <p className="font-bold text-[#ff315f] text-[15.84px]">📰</p>
                </div>"""
# The user's exact snippet was <div class="...">📰</div>
# I'll replace it with the img tag that calls getNewspaperLogo(featured.link || "")
replacement = """{featured.link ? (
                  <img alt={featured.src} className="rounded-full shrink-0 size-11 object-cover bg-white border border-[#e3e7ef] p-0.5" referrerPolicy="no-referrer" src={getNewspaperLogo(featured.link)} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                ) : (
                  <div className="bg-[#ffe8ee] flex flex-col items-center justify-center overflow-hidden rounded-full shrink-0 size-11">
                    <p className="font-bold text-[#ff315f] text-[15.84px]">📰</p>
                  </div>
                )}"""

content = content.replace(target, replacement)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("Re-applied safe fixes")