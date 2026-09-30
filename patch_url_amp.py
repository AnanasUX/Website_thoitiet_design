import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

old_block = """            if (!imageUrl && item.content) {
              const imgMatch2 = item.content.match(/<img[^>]+src=["']([^"']+)["']/i);
              if (imgMatch2) imageUrl = imgMatch2[1];
            }"""

new_block = """            if (!imageUrl && item.content) {
              const imgMatch2 = item.content.match(/<img[^>]+src=["']([^"']+)["']/i);
              if (imgMatch2) imageUrl = imgMatch2[1];
            }
            
            if (imageUrl) {
              imageUrl = imageUrl.replace(/&amp;/g, '&');
            }"""

content = content.replace(old_block, new_block)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Success")