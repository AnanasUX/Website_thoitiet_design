import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Replace useEffect for scroll
old_effect = """  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 300) {
        fetchMoreNews();
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);"""

new_effect = """  const observerTarget = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          fetchMoreNews();
        }
      },
      { rootMargin: "300px" }
    );
    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }
    return () => observer.disconnect();
  }, []);"""

content = content.replace(old_effect, new_effect)

# Replace the bottom div
old_bottom = """        {isLoadingMore && <div className="text-center py-4 text-[13px] text-[#5f687b] font-['Inter:Medium'] font-medium">⏳ Đang tải thêm tin tức...</div>}
      </div>
      <div className="hidden md:block xl:hidden">
        <TabletLayout condKey={condKey} liveData={liveData} liveNews={liveNews} liveOverrides={liveOverrides} />
      </div>
      <div className="hidden xl:block">
        <DesktopLayout condKey={condKey} liveData={liveData} liveNews={liveNews} liveOverrides={liveOverrides} />
      </div>
    </div>"""

new_bottom = """        {isLoadingMore && <div className="text-center py-4 text-[13px] text-[#5f687b] font-['Inter:Medium'] font-medium">⏳ Đang tải thêm tin tức...</div>}
      </div>
      <div className="hidden md:block xl:hidden">
        <TabletLayout condKey={condKey} liveData={liveData} liveNews={liveNews} liveOverrides={liveOverrides} />
      </div>
      <div className="hidden xl:block">
        <DesktopLayout condKey={condKey} liveData={liveData} liveNews={liveNews} liveOverrides={liveOverrides} />
      </div>
      <div ref={observerTarget} className="w-full h-10"></div>
    </div>"""

content = content.replace(old_bottom, new_bottom)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Success")