import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

old_shuf = """        const images = [imgNews1, imgNews2, imgNews3, imgNews4, imgNews5];
        const shuffledNews = [...newsArr].sort(() => Math.random() - 0.5);
        const mapped: LiveNewsItem[] = shuffledNews.slice(0, 10).map((item, i) => ({"""

new_shuf = """        const images = [imgNews1, imgNews2, imgNews3, imgNews4, imgNews5];
        // We no longer shuffle randomly. We trust the input order (which is now sorted by newest)
        const sortedNews = [...newsArr];
        const mapped: LiveNewsItem[] = sortedNews.slice(0, 10).map((item, i) => ({"""

content = content.replace(old_shuf, new_shuf)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Success")