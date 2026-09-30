with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

import re

old_fetch = """    fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(article.link)}`)
      .then(res => res.json())
      .then(data => {
         const parser = new DOMParser();
         const doc = parser.parseFromString(data.contents || "", "text/html");"""

new_fetch = """    // Fast fallback proxy chain for fetching article content
    const fetchHtml = async () => {
      const url = encodeURIComponent(article.link);
      try {
        const res = await fetch(`https://corsproxy.io/?url=${url}`);
        if (res.ok) return await res.text();
      } catch (e) {}
      try {
        const res = await fetch(`https://api.codetabs.com/v1/proxy?quest=${url}`);
        if (res.ok) return await res.text();
      } catch (e) {}
      const res = await fetch(`https://api.allorigins.win/get?url=${url}`);
      const data = await res.json();
      return data.contents || "";
    };

    fetchHtml()
      .then(html => {
         const parser = new DOMParser();
         const doc = parser.parseFromString(html || "", "text/html");"""

content = content.replace(old_fetch, new_fetch)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Updated scraper to use fast proxies.")