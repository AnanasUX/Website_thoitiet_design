import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add hasMoreNews state
content = content.replace('const [isLoadingMore, setIsLoadingMore] = useState(false);', 'const [isLoadingMore, setIsLoadingMore] = useState(false);\n    const [hasMoreNews, setHasMoreNews] = useState(true);')

# 2. Update fetchMoreNews logic
old_fetch = """  const fetchMoreNews = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setIsLoadingMore(true);
    try {
      // alert("Bắt đầu tải thêm tin..."); // Optional: disabled for now, let's rely on button visibility
      const feed = RSS_FEEDS[Math.floor(Math.random() * RSS_FEEDS.length)];
      const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.url)}`);
      if (!res.ok) throw new Error("HTTP " + res.status);
      const data = await res.json();
      const items = data.items || [];
      const picked = items.sort(() => 0.5 - Math.random()).slice(0, 10);
      const images = [imgNews1, imgNews2, imgNews3, imgNews4, imgNews5];
      
      const newMapped: LiveNewsItem[] = picked.map((item: any, i: number) => {"""

new_fetch = """  const fetchMoreNews = useCallback(async () => {
    if (loadingRef.current || !hasMoreNews) return;
    loadingRef.current = true;
    setIsLoadingMore(true);
    try {
      const existingLinks = new Set((liveNews || []).map(item => item.link));
      
      const newsPromises = RSS_FEEDS.map(feed => 
        fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.url)}`)
          .then(r => { if (!r.ok) return null; return r.json(); })
          .then(data => data ? (data.items || []).map((item: any) => ({ ...item, _sourceName: feed.name })) : [])
          .catch(() => [])
      );
      
      const newsArrays = await Promise.all(newsPromises);
      const allNews = newsArrays.flat();
      
      const trulyNewItems = allNews.filter(item => !existingLinks.has(item.link));
      
      if (trulyNewItems.length === 0) {
        setHasMoreNews(false);
        return;
      }
      
      const picked = trulyNewItems.sort(() => 0.5 - Math.random()).slice(0, 10);
      const images = [imgNews1, imgNews2, imgNews3, imgNews4, imgNews5];
      
      if (trulyNewItems.length <= 10) {
        setHasMoreNews(false);
      }
      
      const newMapped: LiveNewsItem[] = picked.map((item: any, i: number) => {"""

content = content.replace(old_fetch, new_fetch)

# 3. Update the item mapping to use _sourceName
old_mapping = """            author: item.title ?? "Tin tức",
            src: feed.name,
            body: cleanDesc,
            link: item.link"""

new_mapping = """            author: item.title ?? "Tin tức",
            src: item._sourceName || "Tin tức",
            body: cleanDesc,
            link: item.link"""

content = content.replace(old_mapping, new_mapping)

# 4. Update the useCallback dependencies
old_deps = """      } finally {
        loadingRef.current = false;
        setIsLoadingMore(false);
      }
    }, []);"""

new_deps = """      } finally {
        loadingRef.current = false;
        setIsLoadingMore(false);
      }
    }, [liveNews, hasMoreNews]);"""

content = content.replace(old_deps, new_deps)

# 5. Update InfiniteScrollTrigger button text
old_button = """<button 
        onClick={onTrigger} 
        disabled={isLoading}
        className="px-6 py-3 bg-[#e3e7ef] text-[#182033] font-['Inter:Semi_Bold'] font-semibold rounded-full text-[14px] active:scale-95 transition-transform"
      >
        {isLoading ? "⏳ Đang tải thêm 10 bài..." : "↓ Tải thêm tin (bản mới nhất)"}
      </button>"""

new_button = """<button 
        onClick={onTrigger} 
        disabled={isLoading || !hasMoreNews}
        className="px-6 py-3 bg-[#e3e7ef] text-[#182033] font-['Inter:Semi_Bold'] font-semibold rounded-full text-[14px] active:scale-95 transition-transform disabled:opacity-50"
      >
        {!hasMoreNews ? "Đã tải hết tin tức hiện có" : isLoading ? "⏳ Đang tải thêm 10 bài..." : "↓ Tải thêm tin tức"}
      </button>"""

content = content.replace(old_button, new_button)
content = content.replace("isLoading: boolean }", "isLoading: boolean, hasMoreNews: boolean }")
content = content.replace("<InfiniteScrollTrigger onTrigger={fetchMoreNews} isLoading={isLoadingMore} />", "<InfiniteScrollTrigger onTrigger={fetchMoreNews} isLoading={isLoadingMore} hasMoreNews={hasMoreNews} />")

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Success")