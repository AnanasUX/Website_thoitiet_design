with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

bad_block = """          const baseNewsItems = rawItems.map((item: any) => {
            let imageUrl = item.thumbnail || (item.enclosure && item.enclosure.link) || "";
            if (!imageUrl && item.description) {
              const imgMatch = item.description.match(/<img[^>]+src=["']([^"']+)["']/i);
              if (imgMatch) imageUrl = imgMatch[1];
            }
            if (!imageUrl && item.content) {
              const imgMatch2 = item.content.match(/<img[^>]+src=["']([^"']+)["']/i);
              if (imgMatch2) imageUrl = imgMatch2[1];
            }
            
            return {
              title: item.title,
              link: item.link,
              source: item.source || "Báo Mới",
              time: new Date(item.pubDate).toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' }),
              image: imageUrl
            };
          });"""

content = content.replace(bad_block, "")

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("Fixed.")