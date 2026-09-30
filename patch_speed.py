import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update the loading UI
old_loading_ui_pattern = r'\{/\* Live API status indicator \*/\}.*?\{apiStatus === "loading" && \(\s*<div className="fixed top-2 left-1/2 -translate-x-1/2 z-50 bg-\[\#182033\]/80 text-white text-\[12px\] px-4 py-1 rounded-full backdrop-blur-sm">\s*.*?</div>\s*\)\}'
old_loading_ui_search = re.search(old_loading_ui_pattern, content, re.DOTALL)

if old_loading_ui_search:
    # We will remove it from here, and put a full screen return above `const theme = WEATHER_THEMES[condKey];`
    content = content.replace(old_loading_ui_search.group(0), '{/* Live API status indicator */}')

# Now insert the early return
insert_pos = content.find('const theme = WEATHER_THEMES[condKey];')
if insert_pos != -1:
    early_return = """  if (apiStatus === "loading") {
    return (
      <div className="w-full h-screen bg-white">
        <div className="fixed top-2 left-1/2 -translate-x-1/2 z-50 bg-[#182033]/80 text-white text-[12px] px-4 py-1 rounded-full backdrop-blur-sm">
          ⏳ Đang tải dữ liệu thực tế…
        </div>
      </div>
    );
  }

  """
    content = content[:insert_pos] + early_return + content[insert_pos:]

# 2. Update the Standalone Fetch Logic
old_fetch_logic_pattern = r'const rawItems = \(news\.items \|\| \[\]\)\.slice\(0, 10\);.*?\}\)\.catch\(e => \{'
# We need to construct the new async block
new_fetch_logic = """const rawItems = (news.items || []).slice(0, 10);
          
          // 1. Gửi dữ liệu ngay lập tức để UI render (chỉ trong 1-2s)
          const baseNewsItems = rawItems.map((item: any) => {
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
          });

          const jsonPayload = {
            location: "Quận Hà Đông, VN",
            weather: {
              current: { temp: c_temp, feels_like, humidity, desc: c_desc, icon: c_icon, pm25, aqi_level },
              forecast_3h: { temp: n_temp, pop: n_pop, desc: n_desc },
              status: trang_thai
            },
            news: baseNewsItems.length > 0 ? baseNewsItems : undefined
          };
          
          processJson(jsonPayload);

          // 2. Tải ảnh OG ngầm ở Background (không block UI)
          baseNewsItems.forEach((item: any, idx: number) => {
            if (!item.image && item.link) {
              const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(item.link)}`;
              fetch(proxyUrl).then(res => res.json()).then(data => {
                const html = data.contents || "";
                const ogMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) 
                             || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
                if (ogMatch) {
                  const newImg = ogMatch[1];
                  setLiveNews((prev: any) => {
                    if (!prev) return prev;
                    const next = [...prev];
                    if (next[idx]) {
                      next[idx] = { ...next[idx], img: newImg };
                    }
                    return next;
                  });
                }
              }).catch(() => {});
            }
          });
          
        }).catch((e: any) => {"""

content = re.sub(old_fetch_logic_pattern, new_fetch_logic, content, flags=re.DOTALL)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Updated src/App.tsx")