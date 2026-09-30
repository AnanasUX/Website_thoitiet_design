import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Replace processJson's news logic
content = re.sub(
    r'if\s*\(Array\.isArray\(newsArr\)\s*&&\s*newsArr\.length\s*>\s*0\)\s*\{[\s\S]*?setLiveNews\(mapped\);\s*\}',
    r'''if (Array.isArray(newsArr) && newsArr.length > 0) {
          const images = [imgNews1, imgNews2, imgNews3, imgNews4, imgNews5];
          const allMapped: LiveNewsItem[] = newsArr.map((item, i) => ({
            img:    item.image ? getProxyImageUrl(item.image) : images[i % images.length],
            logo: getNewspaperLogo(item.link || ""),
            fallbackImg: images[i % images.length],
            author: item.title       ?? "Tin tức",
            src:    item.source      ?? "Tin tức",
            body:   item.description ?? "",
            link:   item.link,
          }));
          
          fullNewsPool.current = allMapped;
          
          const shuffledPool = [...allMapped].sort(() => Math.random() - 0.5);
          setLiveNews(shuffledPool.slice(0, 10));
        }''',
    content
)

# Replace fetchMoreNews completely
new_fetch = """  const fetchMoreNews = useCallback(async () => {
    if (loadingRef.current || !hasMoreNews) return;
    loadingRef.current = true;
    setIsLoadingMore(true);
    
    await new Promise(res => setTimeout(res, 800));
    
    try {
      const getUniqueKey = (item: any) => {
        if (item.author) return item.author.trim().toLowerCase();
        return item.link ? item.link.split('?')[0].replace(/^https?:\/\//, '') : Math.random().toString();
      };
      
      const existingKeys = new Set((liveNews || []).map(getUniqueKey));
      
      const trulyNewItems = fullNewsPool.current.filter(item => !existingKeys.has(getUniqueKey(item)));
      
      if (trulyNewItems.length === 0) {
        setHasMoreNews(false);
        return;
      }
      
      const picked = trulyNewItems.sort(() => 0.5 - Math.random()).slice(0, 10);
      
      if (trulyNewItems.length <= 10) {
        setHasMoreNews(false);
      }
      
      setLiveNews(prev => [...(prev || []), ...picked]);
    } catch (err) {
      console.error(err);
    } finally {
      loadingRef.current = false;
      setIsLoadingMore(false);
    }
  }, [liveNews, hasMoreNews]);"""

content = re.sub(
    r'const fetchMoreNews = useCallback\(async \(\) => \{[\s\S]*?\}, \[liveNews, hasMoreNews\]\);',
    new_fetch,
    content
)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Success")