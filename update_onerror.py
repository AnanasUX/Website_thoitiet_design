import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Add fallbackImg to LiveNewsItem
content = content.replace(
    '  link?: string;',
    '  link?: string;\n  fallbackImg?: string;'
)

# Update mapped object
content = content.replace(
    '          img:    item.thumbnail || images[i % images.length],',
    '          img:    item.thumbnail || images[i % images.length],\n          fallbackImg: images[i % images.length],'
)

# Update onError handlers
content = content.replace(
    "onError={(e) => (e.currentTarget.style.display = 'none')}",
    "onError={(e) => { if (e.currentTarget.src !== item.fallbackImg && item.fallbackImg) { e.currentTarget.src = item.fallbackImg; } else { e.currentTarget.style.display = 'none'; } }}"
)

# Wait, for featured, it's featured.fallbackImg! Let's handle that specifically.
content = content.replace(
    "onError={(e) => { if (e.currentTarget.src !== item.fallbackImg && item.fallbackImg) { e.currentTarget.src = item.fallbackImg; } else { e.currentTarget.style.display = 'none'; } }}",
    "onError={(e) => { const fallback = (typeof item !== 'undefined' ? item.fallbackImg : undefined) || (typeof featured !== 'undefined' ? featured.fallbackImg : undefined); if (fallback && e.currentTarget.src !== fallback) { e.currentTarget.src = fallback; } else { e.currentTarget.style.display = 'none'; } }}"
)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Updated onError to use fallbackImg")
