import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Change button text
old_btn = """{isLoading ? "⏳ Đang tải thêm 10 bài..." : "↓ Tải thêm tin tức"}"""
new_btn = """{isLoading ? "⏳ Đang tải thêm 10 bài..." : "↓ Tải thêm tin (bản mới nhất)"}"""
content = content.replace(old_btn, new_btn)

# Add alert on error
old_catch = """      } catch (err) {
        console.error(err);
      } finally {"""
new_catch = """      } catch (err: any) {
        console.error(err);
        alert("Lỗi tải tin: " + (err.message || err));
      } finally {"""
content = content.replace(old_catch, new_catch)

# Check res.ok
old_fetch = """      const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.url)}`);
      const data = await res.json();"""
new_fetch = """      const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.url)}`);
      if (!res.ok) throw new Error("HTTP " + res.status);
      const data = await res.json();"""
content = content.replace(old_fetch, new_fetch)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Success")