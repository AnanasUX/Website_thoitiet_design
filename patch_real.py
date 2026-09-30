import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

old_block = """    if (apiUrl) {
      setApiStatus("loading");
      fetch(apiUrl)
        .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
        .then((json) => processJson(json as Record<string, unknown>))
        .catch(() => setApiStatus("error"));
    }"""

new_block = """    if (apiUrl) {
      setApiStatus("loading");
      
      const newsPromises = RSS_FEEDS.map(feed => 
        fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.url + (feed.url.includes("?") ? "&" : "?") + "rnd=" + Date.now())}`)
          .then(r => r.json())
          .then(data => (data.items || []).map((item: any) => ({ ...item, _sourceName: feed.name })))
          .catch(() => [])
      );
      
      Promise.all([
        fetch(apiUrl).then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }),
        Promise.all(newsPromises)
      ]).then(([json, newsArrays]) => {
        const allNews = newsArrays.flat().filter(item => isToday(item.pubDate));
        const sortedNews = allNews.sort((a, b) => new Date(b.pubDate || 0).getTime() - new Date(a.pubDate || 0).getTime());
        
        json.news = sortedNews.slice(0, 10).map((item: any) => {
           let imageUrl = item.thumbnail || (item.enclosure && item.enclosure.link) || "";
           if (!imageUrl && item.description) {
             const imgMatch = item.description.match(/<img[^>]+src=["']([^"']+)["']/i);
             if (imgMatch) imageUrl = imgMatch[1];
           }
           if (!imageUrl && item.content) {
             const imgMatch2 = item.content.match(/<img[^>]+src=["']([^"']+)["']/i);
             if (imgMatch2) imageUrl = imgMatch2[1];
           }
           if (imageUrl) imageUrl = imageUrl.replace(/&amp;/g, '&');
           let cleanDesc = item.description ? item.description.replace(/<[^>]+>/g, '').trim() : "";
           
           return {
             title: item.title,
             link: item.link,
             source: item._sourceName,
             pubDate: item.pubDate,
             description: cleanDesc,
             image: imageUrl
           };
        });
        
        const baseNewsItems = json.news;
        setTimeout(() => {
          baseNewsItems.forEach((item: any, idx: number) => {
            let imageUrl = item.image;
            if (!imageUrl && item.link) {
              const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(item.link)}`;
              fetch(proxyUrl).then(res => res.json()).then(data => {
                const html = data.contents || "";
                const ogMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) 
                             || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
                if (ogMatch) {
                  const newImg = getProxyImageUrl(ogMatch[1]);
                  setLiveNews((prev: any) => {
                    if (!prev) return prev;
                    const next = [...prev];
                    if (next[idx]) next[idx] = { ...next[idx], img: newImg };
                    return next;
                  });
                }
              });
            }
          });
        }, 1000);
        
        processJson(json as Record<string, unknown>);
      }).catch(() => setApiStatus("error"));
    }"""

content = content.replace(old_block, new_block)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Success")