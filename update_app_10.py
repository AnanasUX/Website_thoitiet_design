import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update newsArr.slice(0, 5) to slice(0, 10)
content = content.replace("newsArr.slice(0, 5).map", "newsArr.slice(0, 10).map")

# 2. Update text "5 bài" to "10 bài" or dynamic in MobileLayout
content = re.sub(r"Tin T\S+c M\S+i Nh\S+t A\S 5 bA\Si", "Tin Tức Mới Nhất • {newsFeed.length} bài", content)
content = re.sub(r"Tin T\S+c M\S+i Nh\S+t.*?5 b[Aà]i", "Tin Tức Mới Nhất • {newsFeed.length} bài", content)

# 3. In DesktopLayout / TabletLayout, grid uses newsFeed.slice(1, 5). Change it to slice(1)
content = content.replace("newsFeed.slice(1, 5)", "newsFeed.slice(1)")

# 4. Also fix the text "5 bài mới nhất" in other layouts
content = content.replace("{newsFeed.length} bAi m>i nht", "{newsFeed.length} bài mới nhất")
content = re.sub(r"5 b[Aà]i m[ớ]>i nh[ấ]t", "{newsFeed.length} bài mới nhất", content)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Updated App.tsx to display 10 articles")