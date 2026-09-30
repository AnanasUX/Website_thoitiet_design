import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

old_effect = """  useEffect(() => {
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

new_effect = """  useEffect(() => {
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

content = content.replace(old_effect, new_effect)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Success")