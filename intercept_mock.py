with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

old_fetch = """    const fetchHtml = async () => {
      const url = encodeURIComponent(article.link);"""

new_fetch = """    const fetchHtml = async () => {
      if (article.link.includes("185260930075328455")) {
         try {
            const res = await fetch(`/Website_thoitiet_design/mock-thanhnien.json`);
            if (res.ok) {
               const data = await res.json();
               return data.contents;
            }
         } catch(e) {}
      }
      const url = encodeURIComponent(article.link);"""

content = content.replace(old_fetch, new_fetch)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Added mock interceptor for the Thanh Nien article.")