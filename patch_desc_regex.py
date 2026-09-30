import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# We need to find the return statement inside `const baseNewsItems = rawItems.map((item: any) => {`
# It looks like:
# return {
#   title: item.title,
#   link: item.link,
#   source: item.source || item._sourceName || "Báo Mới",
#   time: new Date(item.pubDate || Date.now()).toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' }),
#   image: imageUrl
# };

pattern = r'return \{\s*title: item\.title,\s*link: item\.link,\s*source:.*?\s*time:.*?\s*image: imageUrl\s*\};'

replacement = """              let cleanDesc = "";
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

if re.search(pattern, content):
    content = re.sub(pattern, replacement, content)
    with open("src/App.tsx", "w", encoding="utf-8") as f:
        f.write(content)
    print("Success via regex")
else:
    print("Pattern not found!")