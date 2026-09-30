import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

helper = """export function getProxyImageUrl(url: string) {
"""

new_helper = """export function getNewspaperLogo(url: string) {
  if (!url || typeof url !== 'string') return "";
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
  } catch (e) {
    return "";
  }
}

export function getProxyImageUrl(url: string) {
"""

content = content.replace(helper, new_helper)

# Add logo to LiveNewsItem
old_iface = """interface LiveNewsItem {
  img: string;
  fallbackImg: string;
  author: string;
  src: string;
  body: string;
  link?: string;
}"""
new_iface = """interface LiveNewsItem {
  img: string;
  logo: string;
  fallbackImg: string;
  author: string;
  src: string;
  body: string;
  link?: string;
}"""
content = content.replace(old_iface, new_iface)

# Add logo to map
old_map = """            img:    item.image ? getProxyImageUrl(item.image) : images[i % images.length],
            fallbackImg: images[i % images.length],"""
new_map = """            img:    item.image ? getProxyImageUrl(item.image) : images[i % images.length],
            logo:   getNewspaperLogo(item.link || ""),
            fallbackImg: images[i % images.length],"""
content = content.replace(old_map, new_map)

# Replace src={item.img} in size-11 with src={item.logo || item.img}
old_img = """<img alt="" className="rounded-full shrink-0 size-11 object-cover" referrerPolicy="no-referrer" src={item.img} data-fallback={item.fallbackImg || ""} onError={(e) => { const el = e.currentTarget; if (el.src !== el.dataset.fallback && el.dataset.fallback) { el.src = el.dataset.fallback; } }} />"""
new_img = """<img alt="" className="rounded-full shrink-0 size-11 object-cover" referrerPolicy="no-referrer" src={item.logo || item.img} data-fallback={item.fallbackImg || ""} onError={(e) => { const el = e.currentTarget; if (el.src !== el.dataset.fallback && el.dataset.fallback) { el.src = el.dataset.fallback; } }} />"""
content = content.replace(old_img, new_img)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Success")