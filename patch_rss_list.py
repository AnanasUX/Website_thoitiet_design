import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

old_rss = """          const RSS_FEEDS = [
            { name: "Dân Trí", url: "https://dantri.com.vn/rss/home.rss" },
            { name: "VnExpress", url: "https://vnexpress.net/rss/tin-moi-nhat.rss" },
            { name: "Kênh 14", url: "https://kenh14.vn/home.rss" },
            { name: "Tuổi Trẻ", url: "https://tuoitre.vn/rss/tin-moi-nhat.rss" },
            { name: "Thanh Niên", url: "https://thanhnien.vn/rss/home.rss" },
            { name: "VietnamNet", url: "https://vietnamnet.vn/rss/tin-moi-nhat.rss" },
            { name: "Lao Động", url: "https://laodong.vn/rss/home.rss" },
            { name: "VTV News", url: "https://vtv.vn/trong-nuoc.rss" },
            { name: "Pháp Luật", url: "https://plo.vn/rss/thoi-su-c2.rss" },
          ];"""

new_rss = """          const RSS_FEEDS = [
            { name: "Dân Trí", url: "https://dantri.com.vn/rss/home.rss" },
            { name: "VnExpress", url: "https://vnexpress.net/rss/tin-moi-nhat.rss" },
            { name: "Tuổi Trẻ", url: "https://tuoitre.vn/rss/tin-moi-nhat.rss" },
            { name: "Thanh Niên", url: "https://thanhnien.vn/rss/home.rss" },
            { name: "Báo Giao Thông", url: "https://www.baogiaothong.vn/rss/thoi-su.rss" }
          ];"""

if old_rss in content:
    content = content.replace(old_rss, new_rss)
    with open("src/App.tsx", "w", encoding="utf-8") as f:
        f.write(content)
    print("Success")
else:
    print("Block not found!")