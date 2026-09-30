import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Deduplication by title and link in fetchMoreNews
old_dedup = """      const existingLinks = new Set((liveNews || []).map(item => item.link));
      
      const newsPromises = RSS_FEEDS.map(feed => 
        fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.url)}`)
          .then(r => { if (!r.ok) return null; return r.json(); })
          .then(data => data ? (data.items || []).map((item: any) => ({ ...item, _sourceName: feed.name })) : [])
          .catch(() => [])
      );
      
      const newsArrays = await Promise.all(newsPromises);
      const allNews = newsArrays.flat();
      
      const trulyNewItems = allNews.filter(item => !existingLinks.has(item.link));"""

new_dedup = """      const getUniqueKey = (item: any) => {
        if (item.title && item.author) return (item.title || item.author).trim().toLowerCase(); // Support both RSS item and mapped LiveNewsItem
        return item.link ? item.link.split('?')[0].replace(/^https?:\\/\\//, '') : Math.random().toString();
      };
      
      const existingKeys = new Set((liveNews || []).map(getUniqueKey));
      
      const newsPromises = RSS_FEEDS.map(feed => 
        fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.url)}`)
          .then(r => { if (!r.ok) return null; return r.json(); })
          .then(data => data ? (data.items || []).map((item: any) => ({ ...item, _sourceName: feed.name })) : [])
          .catch(() => [])
      );
      
      const newsArrays = await Promise.all(newsPromises);
      const allNews = newsArrays.flat();
      
      const trulyNewItems = allNews.filter(item => !existingKeys.has(getUniqueKey(item)));"""

content = content.replace(old_dedup, new_dedup)

# 2. Make processJson always fetch live news directly!
# Right now, processJson has:
# const newsArr = json.news;
# if (Array.isArray(newsArr) && newsArr.length > 0) { ... setLiveNews(mapped); }

old_process = """      const newsArr = json.news;
      if (Array.isArray(newsArr) && newsArr.length > 0) {
        const images = [imgNews1, imgNews2, imgNews3, imgNews4, imgNews5];
        // We no longer shuffle randomly. We trust the input order (which is now sorted by newest)
        const sortedNews = [...newsArr];
        const mapped: LiveNewsItem[] = sortedNews.slice(0, 10).map((item, i) => ({
          img:    item.image ? getProxyImageUrl(item.image) : images[i % images.length],
          logo: getNewspaperLogo(item.link || ""),
          fallbackImg: images[i % images.length],
          author: item.title       ?? "Tin tức",
          src:    item.source      ?? "Tin tức",
          body:   item.description ?? "",
          link:   item.link,
        }));
        setLiveNews(mapped);
      }"""

# New logic: Ignore json.news, fetch from RSS_FEEDS directly!
new_process = """      const fetchInitialLiveNews = async () => {
        const promises = RSS_FEEDS.map(f => fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(f.url)}`).then(r => r.json()).then(d => (d.items || []).map((i: any) => ({...i, _sourceName: f.name}))).catch(()=>[]));
        const arrs = await Promise.all(promises);
        const allItems = arrs.flat().sort((a, b) => new Date(b.pubDate || 0).getTime() - new Date(a.pubDate || 0).getTime());
        const images = [imgNews1, imgNews2, imgNews3, imgNews4, imgNews5];
        const mapped: LiveNewsItem[] = allItems.slice(0, 10).map((item, i) => {
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
            img: imageUrl ? getProxyImageUrl(imageUrl) : images[i % images.length],
            logo: getNewspaperLogo(item.link || ""),
            fallbackImg: images[i % images.length],
            author: item.title ?? "Tin tức",
            src: item._sourceName || "Tin tức",
            body: cleanDesc,
            link: item.link
          };
        });
        setLiveNews(mapped);
      };
      
      // Fire and forget
      fetchInitialLiveNews();"""

content = content.replace(old_process, new_process)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Success")