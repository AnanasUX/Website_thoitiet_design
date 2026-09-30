import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Fix standalone block to filter isToday and NOT slice
old_standalone = """            // Combine all news, sort by newest (pubDate), and take top 10
            let allNews = newsArrays.flat().sort((a, b) => {
              const dateA = new Date(a.pubDate || 0).getTime();
              const dateB = new Date(b.pubDate || 0).getTime();
              return dateB - dateA;
            });
            const rawItems = allNews.slice(0, 10);"""

new_standalone = """            // Combine all news, filter for today, sort by newest
            let allNews = newsArrays.flat().filter(item => isToday(item.pubDate)).sort((a, b) => {
              const dateA = new Date(a.pubDate || 0).getTime();
              const dateB = new Date(b.pubDate || 0).getTime();
              return dateB - dateA;
            });
            const rawItems = allNews;"""
content = content.replace(old_standalone, new_standalone)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Success")