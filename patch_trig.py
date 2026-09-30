import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add InfiniteScrollTrigger component at the top
trigger_comp = """
function InfiniteScrollTrigger({ onTrigger }: { onTrigger: () => void }) {
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
}
"""
content = content.replace("export function getNewspaperLogo", trigger_comp + "\nexport function getNewspaperLogo")

# 2. Change slice from 5 to 10 as user requested
content = content.replace("const picked = items.sort(() => 0.5 - Math.random()).slice(0, 5);", "const picked = items.sort(() => 0.5 - Math.random()).slice(0, 10);")

# 3. Use useCallback for fetchMoreNews so it can be a dependency
old_fetch = """  const fetchMoreNews = async () => {"""
new_fetch = """  const fetchMoreNews = useCallback(async () => {"""
content = content.replace(old_fetch, new_fetch)

old_fetch_end = """      loadingRef.current = false;
      setIsLoadingMore(false);
    }
  };"""
new_fetch_end = """      loadingRef.current = false;
      setIsLoadingMore(false);
    }
  }, []);"""
content = content.replace(old_fetch_end, new_fetch_end)

# 4. Remove old useEffect observer
old_effect = """  useEffect(() => {
    if (apiStatus === "loading") return;
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
  }, [apiStatus]);"""
content = content.replace(old_effect, "")

# 5. Replace observerTarget ref and bottom div
content = content.replace("const observerTarget = useRef<HTMLDivElement>(null);", "")
content = content.replace('<div ref={observerTarget} className="w-full h-10"></div>', '<InfiniteScrollTrigger onTrigger={fetchMoreNews} />')

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Success")