import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add states
content = content.replace("const [isLoadingMore, setIsLoadingMore] = useState(false);", "const [isLoadingMore, setIsLoadingMore] = useState(false);\n  const [isFetchingCategory, setIsFetchingCategory] = useState(false);")

# 2. Update useEffect
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
content = content.replace(old_effect, new_effect)

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
          // If background fetch, prepend new items
          const existingLinks = new Set(fullNewsPool.current.map(n => n.link));
          const newItems = mixedNews.filter(n => !existingLinks.has(n.link));
          if (newItems.length > 0) {
            fullNewsPool.current = [...newItems, ...fullNewsPool.current];
            setLiveNews(prev => {
              const current = prev || [];
              const uniqueNew = newItems.filter(n => !current.find((c: any) => c.link === n.link));
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
    
    const timer = setInterval(() => {
      fetchCategoryNews(true);
    }, 2 * 60 * 1000);
    
    return () => { 
      isCancelled = true; 
      clearInterval(timer);
    };
  }, [activeCategory]);"""
content = content.replace(old_finish, new_finish)

# 3. Add props
content = re.sub(r'(function DesktopLayout\(\{.*?)(condKey,)(.*?\}: \{.*?)(condKey: ConditionKey;)', r'\1isFetchingCategory,\n    \2\3isFetchingCategory?: boolean;\n    \4', content, flags=re.DOTALL)
content = re.sub(r'(function TabletLayout\(\{.*?)(condKey,)(.*?\}: \{.*?)(condKey: ConditionKey;)', r'\1isFetchingCategory,\n    \2\3isFetchingCategory?: boolean;\n    \4', content, flags=re.DOTALL)
content = re.sub(r'(function MobileLayout\(\{.*?)(condKey,)(.*?\}: \{.*?)(condKey: ConditionKey;)', r'\1isFetchingCategory,\n    \2\3isFetchingCategory?: boolean;\n    \4', content, flags=re.DOTALL)

# 4. Pass prop in App
content = content.replace("liveNews={liveNews}", "liveNews={liveNews} isFetchingCategory={isFetchingCategory}")

# 5. Add NewsSkeleton
skeleton_code = """
function NewsSkeleton() {
  return (
    <div className="flex flex-col gap-[14px] w-full">
      <div className="w-full h-[240px] bg-[#e3e7ef] animate-pulse rounded-[16px]"></div>
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="flex gap-[14px] w-full p-[14px] bg-white rounded-[12px] border border-[#e3e7ef]">
          <div className="flex-1 flex flex-col gap-2 pt-1">
            <div className="w-full h-[18px] bg-[#e3e7ef] animate-pulse rounded"></div>
            <div className="w-3/4 h-[18px] bg-[#e3e7ef] animate-pulse rounded"></div>
            <div className="w-1/3 h-[14px] bg-[#e3e7ef] animate-pulse rounded mt-2"></div>
          </div>
          <div className="w-[110px] h-[80px] bg-[#e3e7ef] animate-pulse rounded-[8px] shrink-0"></div>
        </div>
      ))}
    </div>
  );
}
"""
content = content.replace("export function getNewspaperLogo", skeleton_code + "\nexport function getNewspaperLogo")

# 6. Wrap News feeds correctly for each layout!
# Instead of replacing loosely, I'll use simple Regex to wrap {featured && ...} all the way to </button>
# Wait, why not just wrap the `grid.map` inside the layouts? But featured is separate.
# I will just write a precise replace.

# Desktop
desk_start = "{/* Featured feed card */}"
desk_end = """          {/* News grid */}
            <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-[var(--grid-gap)] w-full">
              {grid.map((item, i) => ("""
# Let's just find where `desk_start` starts inside `function DesktopLayout` and where `desk_end` ends, wait, `desk_end` is before the list.
# We want to wrap BOTH featured and the grid.

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Applied phase 1")