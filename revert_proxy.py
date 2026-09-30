with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

bad_fetch = """    // Fast fallback proxy chain for fetching article content
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
    };"""

good_fetch = """    const fetchHtml = async () => {
      const url = encodeURIComponent(article.link);
      try {
        const res = await fetch(`https://api.allorigins.win/get?url=${url}`);
        if (res.ok) {
           const data = await res.json();
           return data.contents || "";
        }
      } catch (e) {}
      return "";
    };"""

content = content.replace(bad_fetch, good_fetch)

bad_img_proxy = """              if (!imageUrl && item.link) {
                const proxyUrl = `https://corsproxy.io/?url=${encodeURIComponent(item.link)}`;
                fetch(proxyUrl).then(res => res.text()).then(html => {
                  html = html || "";"""
good_img_proxy = """              if (!imageUrl && item.link) {
                const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(item.link)}`;
                fetch(proxyUrl).then(res => res.json()).then(data => {
                  const html = data.contents || "";"""
                  
content = content.replace(bad_img_proxy, good_img_proxy)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Reverted to allorigins.win proxy.")