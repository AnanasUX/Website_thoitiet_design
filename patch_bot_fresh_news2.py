import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

old_json_news = """        json.news = sortedNews.slice(0, 10).map((item: any) => ({
           title: item.title,
           link: item.link,
           source: item._sourceName,
           pubDate: item.pubDate,
           description: item.description,
           content: item.content,
           thumbnail: item.thumbnail,
           enclosure: item.enclosure
        }));"""

new_json_news = """        json.news = sortedNews.slice(0, 10).map((item: any) => {
           let imageUrl = item.thumbnail || (item.enclosure && item.enclosure.link) || "";
           if (!imageUrl && item.description) {
             const imgMatch = item.description.match(/<img[^>]+src=["']([^"']+)["']/i);
             if (imgMatch) imageUrl = imgMatch[1];
           }
           if (!imageUrl && item.content) {
             const imgMatch2 = item.content.match(/<img[^>]+src=["']([^"']+)["']/i);
             if (imgMatch2) imageUrl = imgMatch2[1];
           }
           if (imageUrl) imageUrl = imageUrl.replace(/&amp;/g, '&');
           let cleanDesc = item.description ? item.description.replace(/<[^>]+>/g, '').trim() : "";
           
           return {
             title: item.title,
             link: item.link,
             source: item._sourceName,
             pubDate: item.pubDate,
             description: cleanDesc,
             image: imageUrl
           };
        });"""

content = content.replace(old_json_news, new_json_news)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Success")