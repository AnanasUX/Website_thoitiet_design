import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

pattern = r'const RSS_FEEDS = \[.*?\];'

new_rss = """const RSS_FEEDS = [
            { name: "Dân Trí", url: "https://dantri.com.vn/rss/home.rss" },
            { name: "VnExpress", url: "https://vnexpress.net/rss/tin-moi-nhat.rss" },
            { name: "Tuổi Trẻ", url: "https://tuoitre.vn/rss/tin-moi-nhat.rss" },
            { name: "Thanh Niên", url: "https://thanhnien.vn/rss/home.rss" },
            { name: "Báo Giao Thông", url: "https://www.baogiaothong.vn/rss/thoi-su.rss" }
          ];"""

if re.search(pattern, content, re.DOTALL):
    content = re.sub(pattern, new_rss, content, flags=re.DOTALL)
    with open("src/App.tsx", "w", encoding="utf-8") as f:
        f.write(content)
    print("Success via regex")
else:
    print("Pattern not found!")