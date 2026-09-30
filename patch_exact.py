with open("src/App.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

start_idx = -1
end_idx = -1
for i, line in enumerate(lines):
    if "const fetchMoreNews =" in line:
        start_idx = i
    if start_idx != -1 and i > start_idx and "}, [liveNews, hasMoreNews]);" in line:
        end_idx = i
        break

if start_idx != -1 and end_idx != -1:
    new_lines = lines[:start_idx] + ["""  const fetchMoreNews = useCallback(async () => {
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
  }, [liveNews, hasMoreNews]);\n"""] + lines[end_idx+1:]
    with open("src/App.tsx", "w", encoding="utf-8") as f:
        f.writelines(new_lines)
    print("Success fetchMoreNews")
else:
    print("Failed fetchMoreNews")

start_idx2 = -1
end_idx2 = -1
for i, line in enumerate(lines):
    if "if (Array.isArray(newsArr) && newsArr.length > 0) {" in line:
        start_idx2 = i
    if start_idx2 != -1 and i > start_idx2 and "setLiveNews(mapped);" in line:
        # Wait, there's a closing brace after setLiveNews(mapped);
        end_idx2 = i + 1
        break

if start_idx2 != -1 and end_idx2 != -1:
    with open("src/App.tsx", "r", encoding="utf-8") as f:
        lines2 = f.readlines()
    new_lines2 = lines2[:start_idx2] + ["""        if (Array.isArray(newsArr) && newsArr.length > 0) {
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
        }\n"""] + lines2[end_idx2+1:]
    with open("src/App.tsx", "w", encoding="utf-8") as f:
        f.writelines(new_lines2)
    print("Success processJson")
else:
    print("Failed processJson")
