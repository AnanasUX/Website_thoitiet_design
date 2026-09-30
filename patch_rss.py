import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Move RSS_FEEDS outside App
old_rss = """          const RSS_FEEDS = [
            { name: "Dân Trí", url: "https://dantri.com.vn/rss/tin-moi-nhat.rss" },
            { name: "VnExpress", url: "https://vnexpress.net/rss/tin-moi-nhat.rss" },
            { name: "Tuổi Trẻ", url: "https://tuoitre.vn/rss/tin-moi-nhat.rss" },
            { name: "Thanh Niên", url: "https://thanhnien.vn/rss/home.rss" },
            { name: "Báo Giao Thông", url: "https://www.baogiaothong.vn/rss/thoi-su.rss" }
          ];"""

if "const RSS_FEEDS" in content and old_rss in content:
    content = content.replace(old_rss, "")
    rss_top = """const RSS_FEEDS = [
  { name: "Dân Trí", url: "https://dantri.com.vn/rss/tin-moi-nhat.rss" },
  { name: "VnExpress", url: "https://vnexpress.net/rss/tin-moi-nhat.rss" },
  { name: "Tuổi Trẻ", url: "https://tuoitre.vn/rss/tin-moi-nhat.rss" },
  { name: "Thanh Niên", url: "https://thanhnien.vn/rss/home.rss" },
  { name: "Báo Giao Thông", url: "https://www.baogiaothong.vn/rss/thoi-su.rss" }
];
"""
    content = content.replace("export function getNewspaperLogo", rss_top + "\nexport function getNewspaperLogo")

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Success")