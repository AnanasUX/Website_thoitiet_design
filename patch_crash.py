import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Fix getProxyImageUrl
old_helper = """function getProxyImageUrl(url: string) {
  if (!url) return "";
  let cleanUrl = url.trim();"""
new_helper = """function getProxyImageUrl(url: string) {
  if (!url || typeof url !== 'string') return "";
  let cleanUrl = url.trim();"""
content = content.replace(old_helper, new_helper)

# Fix cleanDesc
old_desc = """              let cleanDesc = "";
              if (item.description) {
                  cleanDesc = item.description.replace(/<[^>]+>/g, '').trim();"""
new_desc = """              let cleanDesc = "";
              if (item.description && typeof item.description === 'string') {
                  cleanDesc = item.description.replace(/<[^>]+>/g, '').trim();"""
content = content.replace(old_desc, new_desc)

old_content = """              } else if (item.content) {
                  cleanDesc = item.content.replace(/<[^>]+>/g, '').trim();"""
new_content = """              } else if (item.content && typeof item.content === 'string') {
                  cleanDesc = item.content.replace(/<[^>]+>/g, '').trim();"""
content = content.replace(old_content, new_content)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Success")