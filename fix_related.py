with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("allNews={liveNews ?? []}", "allNews={liveNews ?? DEFAULT_NEWS_FEED}")

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Using DEFAULT_NEWS_FEED as fallback for related articles.")