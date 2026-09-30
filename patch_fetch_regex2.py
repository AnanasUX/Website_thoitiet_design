import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

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
      
      const trulyNewItems = (fullNewsPool.current || []).filter(item => !existingKeys.has(getUniqueKey(item)));
      
      if (trulyNewItems.length === 0) {
        setHasMoreNews(false);
        return;
      }
      
      const picked = trulyNewItems.sort(() => 0.5 - Math.random()).slice(0, 10);
      
      if (trulyNewItems.length <= 10) {
        setHasMoreNews(false);
      }
      
      setLiveNews(prev => {
        const next = [...(prev || []), ...picked];
        return next;
      });
    } catch (err) {
      console.error(err);
    } finally {
      loadingRef.current = false;
      setIsLoadingMore(false);
    }
  }, [liveNews, hasMoreNews]);"""

content = re.sub(
    r'const fetchMoreNews = useCallback\(async \(\) => \{[\s\S]*?setIsLoadingMore\(false\);\n\s*\}\n\s*\}, \[\]\);',
    new_fetch,
    content
)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Success")