import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

old_use_effect = """    if (apiUrl) {
      setApiStatus("loading");
      fetch(apiUrl)
        .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
        .then((json) => processJson(json as Record<string, unknown>))
        .catch(() => setApiStatus("error"));
    } else {"""

new_use_effect = """    if (apiUrl) {
      setApiStatus("loading");
      
      // Fetch fresh news independently of the bot's data!
      const newsPromises = RSS_FEEDS.map(feed => 
        fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.url)}`)
          .then(r => r.json())
          .then(data => (data.items || []).map((item: any) => ({ ...item, _sourceName: feed.name })))
          .catch(() => [])
      );
      
      Promise.all([
        fetch(apiUrl).then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }),
        Promise.all(newsPromises)
      ]).then(([json, newsArrays]) => {
        const allNews = newsArrays.flat();
        const sortedNews = allNews.sort((a, b) => new Date(b.pubDate || 0).getTime() - new Date(a.pubDate || 0).getTime());
        // Overwrite json.news with fresh news so processJson uses it!
        json.news = sortedNews.slice(0, 10).map((item: any) => ({
           title: item.title,
           link: item.link,
           source: item._sourceName,
           pubDate: item.pubDate,
           description: item.description,
           content: item.content,
           thumbnail: item.thumbnail,
           enclosure: item.enclosure
        }));
        
        // Also setup background OG image fetcher just like standalone mode!
        const baseNewsItems = json.news;
        setTimeout(() => {
          baseNewsItems.forEach((item: any, idx: number) => {
            let imageUrl = item.thumbnail || (item.enclosure && item.enclosure.link) || "";
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
      
    } else {"""

content = content.replace(old_use_effect, new_use_effect)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Success")