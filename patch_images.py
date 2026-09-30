import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update processJson
old_process = 'img:    item.image || images[i % images.length],'
new_process = 'img:    (item.image && item.image.startsWith("http") && !item.image.includes("wsrv.nl")) ? `https://wsrv.nl/?url=${encodeURIComponent(item.image)}` : (item.image || images[i % images.length]),'
content = content.replace(old_process, new_process)

# 2. Update background fetcher
old_fetcher = 'const newImg = ogMatch[1];'
new_fetcher = 'const newImg = `https://wsrv.nl/?url=${encodeURIComponent(ogMatch[1])}`;'
content = content.replace(old_fetcher, new_fetcher)

# 3. Simplify onError to avoid stale state causing broken images
old_onerror = "onError={(e) => { const el = e.currentTarget; if (el.dataset.fallbackTried) { el.style.display = 'none'; return; } el.dataset.fallbackTried = '1'; const fb = el.dataset.fallback; if (fb) { el.src = fb; } else { el.style.display = 'none'; } }}"
new_onerror = "onError={(e) => { const el = e.currentTarget; if (el.src !== el.dataset.fallback && el.dataset.fallback) { el.src = el.dataset.fallback; } }}"
content = content.replace(old_onerror, new_onerror)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Updated App.tsx")