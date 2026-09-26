import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

pattern = r'const newsItems = \(news\.items \|\| \[\]\)\.slice\(0, 10\)\.map.*?\n.*?\n.*?\n.*?\n.*?\n.*?\n.*?\n.*?\n.*?\n.*?\n.*?\n.*?\n.*?\n.*?\n.*?\n.*?\n.*?\n.*?\n.*?\n.*?\n.*?\n.*?\n.*?\n.*?\n.*?\n.*?processJson\(json\);'

new_code = """        const rawItems = (news.items || []).slice(0, 10);
        
        // Asynchronously fetch OpenGraph images for news articles using proxy
        Promise.all(rawItems.map(async (item: any) => {
          let imageUrl = item.thumbnail || (item.enclosure && item.enclosure.link) || "";
          if (!imageUrl && item.description) {
            const imgMatch = item.description.match(/<img[^>]+src=["']([^"']+)["']/i);
            if (imgMatch) imageUrl = imgMatch[1];
          }
          if (!imageUrl && item.content) {
            const imgMatch2 = item.content.match(/<img[^>]+src=["']([^"']+)["']/i);
            if (imgMatch2) imageUrl = imgMatch2[1];
          }
          
          if (!imageUrl && item.link) {
            try {
              const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(item.link)}`;
              const res = await fetch(proxyUrl);
              const data = await res.json();
              const html = data.contents || "";
              const ogMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) 
                           || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
              if (ogMatch) {
                imageUrl = ogMatch[1];
              }
            } catch(e) {
              // fallback
            }
          }

          return {
            title: item.title,
            link: item.link,
            source: item.source || "Báo Mới",
            time: new Date(item.pubDate).toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' }),
            image: imageUrl
          };
        })).then(newsItems => {
          const json = {
            location: "Quận Hà Đông, VN",
            weather: {
              current: { temp: c_temp, feels_like, humidity, desc: c_desc, icon: c_icon, pm25, aqi_level },
              forecast_3h: { temp: n_temp, pop: n_pop, desc: n_desc },
              status: trang_thai
            },
            news: newsItems.length > 0 ? newsItems : undefined
          };
          processJson(json);
        });"""

content = re.sub(pattern, new_code, content, flags=re.DOTALL)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Updated App.tsx")