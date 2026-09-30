import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Let's completely rewrite the news fetching logic.
# 1. Add fullNewsPool ref
content = content.replace(
    'const [isLoadingMore, setIsLoadingMore] = useState(false);',
    'const [isLoadingMore, setIsLoadingMore] = useState(false);\n    const fullNewsPool = useRef<any[]>([]);'
)

# 2. Update processJson to not truncate to 10 items, but store ALL items in fullNewsPool, and ONLY set the first 10 to liveNews!
old_processJson_news = """        if (Array.isArray(newsArr) && newsArr.length > 0) {
          const images = [imgNews1, imgNews2, imgNews3, imgNews4, imgNews5];
          const shuffledNews = [...newsArr].sort(() => Math.random() - 0.5);
          const mapped: LiveNewsItem[] = shuffledNews.slice(0, 10).map((item, i) => ({
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

new_processJson_news = """        if (Array.isArray(newsArr) && newsArr.length > 0) {
          const images = [imgNews1, imgNews2, imgNews3, imgNews4, imgNews5];
          
          // Map EVERYTHING properly into LiveNewsItem format
          const allMapped: LiveNewsItem[] = newsArr.map((item, i) => ({
            img:    item.image ? getProxyImageUrl(item.image) : images[i % images.length],
            logo: getNewspaperLogo(item.link || ""),
            fallbackImg: images[i % images.length],
            author: item.title       ?? "Tin tức",
            src:    item.source      ?? "Tin tức",
            body:   item.description ?? "",
            link:   item.link,
          }));
          
          // Store massive pool in ref
          fullNewsPool.current = allMapped;
          
          // Randomly pick first 10 for initial render
          const shuffledPool = [...allMapped].sort(() => Math.random() - 0.5);
          setLiveNews(shuffledPool.slice(0, 10));
        }"""
content = content.replace(old_processJson_news, new_processJson_news)


# 3. Rewrite fetchMoreNews to pull from fullNewsPool!
old_fetchMoreNews = """  const fetchMoreNews = useCallback(async () => {
    if (loadingRef.current || !hasMoreNews) return;
    loadingRef.current = true;
    setIsLoadingMore(true);
    try {
      const getUniqueKey = (item: any) => {
        if (item.title && item.author) return (item.title || item.author).trim().toLowerCase();
        if (item.title) return item.title.trim().toLowerCase();
        if (item.author) return item.author.trim().toLowerCase();
        return item.link ? item.link.split('?')[0].replace(/^https?:\/\//, '') : Math.random().toString();
      };
      
      const existingKeys = new Set((liveNews || []).map(getUniqueKey));
      
      const newsPromises = RSS_FEEDS.map(feed => 
        fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.url + (feed.url.includes("?") ? "&" : "?") + "rnd=" + Date.now())}`)
          .then(r => { if (!r.ok) return null; return r.json(); })
          .then(data => data ? (data.items || []).map((item: any) => ({ ...item, _sourceName: feed.name })) : [])
          .catch(() => [])
      );
      
      const newsArrays = await Promise.all(newsPromises);
      const allNews = newsArrays.flat();
      
      const trulyNewItems = allNews.filter(item => !existingKeys.has(getUniqueKey(item)) && isToday(item.pubDate));
      
      if (trulyNewItems.length === 0) {
        setHasMoreNews(false);
        return;
      }
      
      const picked = trulyNewItems.sort(() => 0.5 - Math.random()).slice(0, 10);
      const images = [imgNews1, imgNews2, imgNews3, imgNews4, imgNews5];
      
      if (trulyNewItems.length <= 10) {
        setHasMoreNews(false);
      }
      
      const newMapped: LiveNewsItem[] = picked.map((item: any, i: number) => {
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
        if (!cleanDesc && item.content) {
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
        };
      });
      setLiveNews(prev => [...(prev || []), ...newMapped]);
    } catch (err) {
      console.error(err);
    } finally {
      loadingRef.current = false;
      setIsLoadingMore(false);
    }
  }, [liveNews, hasMoreNews]);"""

new_fetchMoreNews = """  const fetchMoreNews = useCallback(async () => {
    if (loadingRef.current || !hasMoreNews) return;
    loadingRef.current = true;
    setIsLoadingMore(true);
    
    // Fake a small network delay for UX
    await new Promise(res => setTimeout(res, 800));
    
    try {
      const getUniqueKey = (item: any) => {
        if (item.author) return item.author.trim().toLowerCase();
        return item.link ? item.link.split('?')[0].replace(/^https?:\/\//, '') : Math.random().toString();
      };
      
      const existingKeys = new Set((liveNews || []).map(getUniqueKey));
      
      // Filter the massive pool for items we HAVEN'T shown yet!
      const trulyNewItems = fullNewsPool.current.filter(item => !existingKeys.has(getUniqueKey(item)));
      
      if (trulyNewItems.length === 0) {
        setHasMoreNews(false);
        return;
      }
      
      // Randomly pick up to 10
      const picked = trulyNewItems.sort(() => 0.5 - Math.random()).slice(0, 10);
      
      if (trulyNewItems.length <= 10) {
        setHasMoreNews(false);
      }
      
      // Because fullNewsPool ALREADY contains LiveNewsItem objects (mapped by processJson), we can just append!
      setLiveNews(prev => [...(prev || []), ...picked]);
    } catch (err) {
      console.error(err);
    } finally {
      loadingRef.current = false;
      setIsLoadingMore(false);
    }
  }, [liveNews, hasMoreNews]);"""
content = content.replace(old_fetchMoreNews, new_fetchMoreNews)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Success")