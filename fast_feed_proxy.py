import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

old_proxy = """              if (!imageUrl && item.link) {
                const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(item.link)}`;
                fetch(proxyUrl).then(res => res.json()).then(data => {
                  const html = data.contents || "";"""

new_proxy = """              if (!imageUrl && item.link) {
                const proxyUrl = `https://corsproxy.io/?url=${encodeURIComponent(item.link)}`;
                fetch(proxyUrl).then(res => res.text()).then(html => {
                  html = html || "";"""

content = content.replace(old_proxy, new_proxy)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Updated news feed image fetching proxy.")