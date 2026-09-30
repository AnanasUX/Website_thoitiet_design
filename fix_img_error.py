import re
with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

bad_img = """<img alt={featured.src} className="rounded-full shrink-0 size-11 object-cover bg-white border border-[#e3e7ef] p-0.5" referrerPolicy="no-referrer" src={getNewspaperLogo(featured.link)} onError={(e) => { e.currentTarget.style.display = 'none'; }} />"""

good_img = """<img alt={featured.src} className="rounded-full shrink-0 size-11 object-cover bg-white border border-[#e3e7ef]" referrerPolicy="no-referrer" src={getNewspaperLogo(featured.link)} data-fallback="/Website_thoitiet_design/assets/79d9c.png" onError={(e) => { const el = e.currentTarget; if (el.src !== el.dataset.fallback && el.dataset.fallback) { el.src = el.dataset.fallback; } }} />"""

content = content.replace(bad_img, good_img)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Updated onError for img")