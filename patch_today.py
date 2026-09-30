import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Helper for parsing today
today_helper = """
  // Helper: Get today's articles only
  const isToday = (dateString: string | undefined) => {
    if (!dateString) return false;
    try {
      const d = new Date(dateString.replace(' ', 'T') + 'Z');
      const now = new Date();
      return d.getDate() === now.getDate() &&
             d.getMonth() === now.getMonth() &&
             d.getFullYear() === now.getFullYear();
    } catch { return false; }
  };
"""

# Insert helper before function App()
content = content.replace("export default function App() {", today_helper + "\nexport default function App() {")

# Modify fetchMoreNews:
# 1. cache buster:
content = content.replace(
    'fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.url)}`)',
    'fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.url + (feed.url.includes("?") ? "&" : "?") + "cb=" + Date.now())}`)'
)

# 2. Add isToday to allNews.filter
old_filter = "const trulyNewItems = allNews.filter(item => !existingKeys.has(getUniqueKey(item)));"
new_filter = "const trulyNewItems = allNews.filter(item => !existingKeys.has(getUniqueKey(item)) && isToday(item.pubDate));"
content = content.replace(old_filter, new_filter)


# Modify fetchInitialLiveNews
old_initial_flat = "const allItems = arrs.flat().sort((a, b) => new Date(b.pubDate || 0).getTime() - new Date(a.pubDate || 0).getTime());"
new_initial_flat = "const allItems = arrs.flat().filter(item => isToday(item.pubDate)).sort((a, b) => new Date(b.pubDate || 0).getTime() - new Date(a.pubDate || 0).getTime());"
content = content.replace(old_initial_flat, new_initial_flat)

# Modify standalone mode
old_standalone_flat = "const allNews = newsArrays.flat().sort((a, b) => new Date(b.pubDate || 0).getTime() - new Date(a.pubDate || 0).getTime());"
new_standalone_flat = "const allNews = newsArrays.flat().filter(item => isToday(item.pubDate)).sort((a, b) => new Date(b.pubDate || 0).getTime() - new Date(a.pubDate || 0).getTime());"
content = content.replace(old_standalone_flat, new_standalone_flat)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Success")