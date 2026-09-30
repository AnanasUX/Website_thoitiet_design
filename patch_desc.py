import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

old_block = """              return {
                title: item.title,
                link: item.link,
                source: item.source || item._sourceName || "Báo Mới",
                time: new Date(item.pubDate || Date.now()).toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' }),
                image: imageUrl
              };"""

new_block = """              let cleanDesc = "";
              if (item.description) {
                  cleanDesc = item.description.replace(/<[^>]+>/g, '').trim();
                  cleanDesc = cleanDesc.replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ');
              } else if (item.content) {
                  cleanDesc = item.content.replace(/<[^>]+>/g, '').trim();
                  cleanDesc = cleanDesc.replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ');
              }
              
              return {
                title: item.title,
                link: item.link,
                source: item.source || item._sourceName || "Báo Mới",
                time: new Date(item.pubDate || Date.now()).toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' }),
                image: imageUrl,
                description: cleanDesc
              };"""

if old_block in content:
    content = content.replace(old_block, new_block)
    with open("src/App.tsx", "w", encoding="utf-8") as f:
        f.write(content)
    print("Success")
else:
    print("Block not found!")