import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

old_json_news = "json.news = sortedNews.slice(0, 10).map((item: any) => {"
new_json_news = "json.news = sortedNews.map((item: any) => {"

content = content.replace(old_json_news, new_json_news)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Success")