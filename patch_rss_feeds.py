import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Find the definition of RSS_FEEDS
rss_feeds_def = """        const RSS_FEEDS = [
            { name: "Dân Trí", url: "https://dantri.com.vn/rss/home.rss" },
            { name: "VnExpress", url: "https://vnexpress.net/rss/tin-moi-nhat.rss" },
            { name: "Tuổi Trẻ", url: "https://tuoitre.vn/rss/tin-moi-nhat.rss" },
            { name: "Thanh Niên", url: "https://thanhnien.vn/rss/home.rss" },
            { name: "Báo Giao Thông", url: "https://www.baogiaothong.vn/rss/thoi-su.rss" }
          ];"""

# Remove it from the else block
content = content.replace(rss_feeds_def, "")

# Add it at the top level
top_level_def = """const RSS_FEEDS = [
  { name: "Dân Trí", url: "https://dantri.com.vn/rss/home.rss" },
  { name: "VnExpress", url: "https://vnexpress.net/rss/tin-moi-nhat.rss" },
  { name: "Tuổi Trẻ", url: "https://tuoitre.vn/rss/tin-moi-nhat.rss" },
  { name: "Thanh Niên", url: "https://thanhnien.vn/rss/home.rss" },
  { name: "Báo Giao Thông", url: "https://www.baogiaothong.vn/rss/thoi-su.rss" }
];

export function getNewspaperLogo(url: string) {"""

content = content.replace("export function getNewspaperLogo(url: string) {", top_level_def)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Success")