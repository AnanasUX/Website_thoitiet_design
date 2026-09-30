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
        if (item.title && item.author) return (item.title || item.author).trim().toLowerCase();
        if (item.title) return item.title.trim().toLowerCase();
        if (item.author) return item.author.trim().toLowerCase();
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

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Success")