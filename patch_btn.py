import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

trigger_comp_old = """function InfiniteScrollTrigger({ onTrigger }: { onTrigger: () => void }) {
  const targetRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        onTrigger();
      }
    }, { rootMargin: '300px' });
    if (targetRef.current) observer.observe(targetRef.current);
    return () => observer.disconnect();
  }, [onTrigger]);
  return <div ref={targetRef} className="w-full h-10"></div>;
}"""

trigger_comp_new = """function InfiniteScrollTrigger({ onTrigger, isLoading }: { onTrigger: () => void, isLoading: boolean }) {
  const targetRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !isLoading) {
        onTrigger();
      }
    }, { rootMargin: '150px' });
    if (targetRef.current) observer.observe(targetRef.current);
    return () => observer.disconnect();
  }, [onTrigger, isLoading]);
  
  return (
    <div ref={targetRef} className="w-full flex justify-center py-8 pb-12">
      <button 
        onClick={onTrigger} 
        disabled={isLoading}
        className="px-6 py-3 bg-[#e3e7ef] text-[#182033] font-['Inter:Semi_Bold'] font-semibold rounded-full text-[14px] active:scale-95 transition-transform"
      >
        {isLoading ? "⏳ Đang tải thêm 10 bài..." : "↓ Tải thêm tin tức"}
      </button>
    </div>
  );
}"""

content = content.replace(trigger_comp_old, trigger_comp_new)

# Update the usage
old_usage = """<InfiniteScrollTrigger onTrigger={fetchMoreNews} />"""
new_usage = """<InfiniteScrollTrigger onTrigger={fetchMoreNews} isLoading={isLoadingMore} />"""
content = content.replace(old_usage, new_usage)

# Remove the old text-center loading indicator inside mobile layout
old_loading = """{isLoadingMore && <div className="text-center py-4 text-[13px] text-[#5f687b] font-['Inter:Medium'] font-medium">⏳ Đang tải thêm tin tức...</div>}"""
content = content.replace(old_loading, "")

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Success")