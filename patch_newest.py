import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Change slice(0, 2) to fetch all
old_feeds = """// Randomly select 2 RSS feeds to fetch to mix news without hitting rate limits
        const shuffledFeeds = [...RSS_FEEDS].sort(() => 0.5 - Math.random()).slice(0, 2);"""
new_feeds = """// Fetch from ALL feeds to get the absolute newest articles across the board
        const shuffledFeeds = [...RSS_FEEDS];"""

content = content.replace(old_feeds, new_feeds)

# Change sort from random to newest (pubDate)
old_sort = """// Combine all news from the 2 fetched feeds, shuffle them, and take 10
          let allNews = newsArrays.flat().sort(() => 0.5 - Math.random());
          const rawItems = allNews.slice(0, 10);"""

new_sort = """// Combine all news, sort by newest (pubDate), and take top 10
          let allNews = newsArrays.flat().sort((a, b) => {
            const dateA = new Date(a.pubDate || 0).getTime();
            const dateB = new Date(b.pubDate || 0).getTime();
            return dateB - dateA;
          });
          const rawItems = allNews.slice(0, 10);"""

content = content.replace(old_sort, new_sort)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Success")