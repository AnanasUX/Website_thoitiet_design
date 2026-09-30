import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Fix layout of InfiniteScrollTrigger so button is visible
old_layout = """<div ref={targetRef} className="w-full flex justify-center py-8 pb-12">"""
new_layout = """<div ref={targetRef} className="w-full flex flex-col items-center justify-center gap-4 py-8 pb-12">"""
content = content.replace(old_layout, new_layout)

# Add a debug alert inside fetchMoreNews to see if it even triggers
old_fetch = """  const fetchMoreNews = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setIsLoadingMore(true);
    try {"""
new_fetch = """  const fetchMoreNews = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setIsLoadingMore(true);
    try {
      // alert("Bắt đầu tải thêm tin..."); // Optional: disabled for now, let's rely on button visibility"""
content = content.replace(old_fetch, new_fetch)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Success")