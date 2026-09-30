import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Replace the useEffect for activeCategory
old_effect = """  useEffect(() => {
    
    
    let isCancelled = false;
    const fetchCategoryNews = async () => {
      try {
        const catFeeds = activeCategory === "Tất cả" ? RSS_FEEDS_DB : RSS_FEEDS_DB.filter(f => f.category === activeCategory);"""

new_effect = """  useEffect(() => {
    let isCancelled = false;
    
    const fetchCategoryNews = async (isBackground = false) => {
      if (!isBackground) {
        setIsFetchingCategory(true);
      }
      try {
        const catFeeds = activeCategory === "Tất cả" ? RSS_FEEDS_DB : RSS_FEEDS_DB.filter(f => f.category === activeCategory);"""

if old_effect in content:
    content = content.replace(old_effect, new_effect)
else:
    print("Could not find old_effect block 1")

old_finish = """        fullNewsPool.current = mixedNews;
        setLiveNews(mixedNews.slice(0, 15));
        setHasMoreNews(mixedNews.length > 10);
        
      } catch (e) {
        console.error(e);
      }
    };
    
    fetchCategoryNews();
    return () => { isCancelled = true; };
  }, [activeCategory]);"""

new_finish = """        if (!isBackground) {
          fullNewsPool.current = mixedNews;
          setLiveNews(mixedNews.slice(0, 15));
        } else {
          // If background fetch, only prepend new items that we don't already have
          const existingLinks = new Set(fullNewsPool.current.map(n => n.link));
          const newItems = mixedNews.filter(n => !existingLinks.has(n.link));
          if (newItems.length > 0) {
            fullNewsPool.current = [...newItems, ...fullNewsPool.current];
            setLiveNews(prev => {
              const current = prev || [];
              const uniqueNew = newItems.filter(n => !current.find(c => c.link === n.link));
              return [...uniqueNew, ...current];
            });
          }
        }
        setHasMoreNews(fullNewsPool.current.length > 10);
        
      } catch (e) {
        console.error(e);
      } finally {
        if (!isBackground) setIsFetchingCategory(false);
      }
    };
    
    fetchCategoryNews(false);
    
    // Auto background poll every 2 minutes
    const timer = setInterval(() => {
      fetchCategoryNews(true);
    }, 2 * 60 * 1000);
    
    return () => { 
      isCancelled = true; 
      clearInterval(timer);
    };
  }, [activeCategory]);"""

if old_finish in content:
    content = content.replace(old_finish, new_finish)
else:
    print("Could not find old_finish block 2")

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Updated useEffect logic")