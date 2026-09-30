import re
with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()
content = content.replace("function InfiniteScrollTrigger({ onTrigger, isLoading }: { onTrigger: () => void, isLoading: boolean, hasMoreNews: boolean })", "function InfiniteScrollTrigger({ onTrigger, isLoading, hasMoreNews }: { onTrigger: () => void, isLoading: boolean, hasMoreNews: boolean })")
with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Success")