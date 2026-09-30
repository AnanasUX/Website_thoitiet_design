import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Define the new NewsDetailView
new_view = """function NewsDetailView({ article, allNews, onClose, onSelectRelated }: { article: any, allNews: any[], onClose: () => void, onSelectRelated: (item: any) => void }) {
  const [fullContent, setFullContent] = useState<string>('');
  const [isLoadingFull, setIsLoadingFull] = useState(false);

  const related = useMemo(() => {
    return allNews.filter((n: any) => n.link !== article.link).sort(() => 0.5 - Math.random()).slice(0, 3);
  }, [article, allNews]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'auto'; };
  }, []);

  useEffect(() => {
    if (!article.link) return;
    setIsLoadingFull(true);
    setFullContent('');
    fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(article.link)}`)
      .then(res => res.json())
      .then(data => {
         const parser = new DOMParser();
         const doc = parser.parseFromString(data.contents, "text/html");
         
         const selectors = [
            '.fck_detail', '.singular-content', '.dt-news__content', 
            '.detail-cmain', '.detail-content', '.maincontent', 
            'article', '.post-content', '.entry-content', '.content-detail'
         ];
         let mainNode = null;
         for (const sel of selectors) {
            mainNode = doc.querySelector(sel);
            if (mainNode) break;
         }
         if (!mainNode) mainNode = doc.body;

         const elements = mainNode.querySelectorAll('p, img, h1, h2, h3');
         let html = '';
         elements.forEach(el => {
            if (el.tagName === 'P') {
               const txt = el.textContent?.trim() || "";
               if (txt.length > 20 && !txt.toLowerCase().includes('đọc thêm') && !txt.toLowerCase().includes('tin liên quan')) {
                  html += `<p class="mb-4 leading-relaxed text-[#334155] text-[16px] md:text-[18px]">${txt}</p>`;
               }
            } else if (el.tagName === 'IMG') {
               let src = el.getAttribute('data-src') || el.getAttribute('src');
               if (src && !src.startsWith('http')) {
                   // attempt to resolve relative urls
                   try {
                     const url = new URL(src, article.link);
                     src = url.href;
                   } catch(e) {}
               }
               if (src && !src.includes('logo') && !src.includes('icon') && !src.startsWith('data:')) {
                  html += `<div class="my-6 rounded-xl overflow-hidden shadow-sm"><img src="${src}" alt="" class="w-full object-cover" /></div>`;
               }
            } else if (el.tagName.startsWith('H')) {
               const txt = el.textContent?.trim() || "";
               if (txt.length > 10) {
                   html += `<h3 class="font-bold text-[#182033] text-[20px] mt-8 mb-3">${txt}</h3>`;
               }
            }
         });
         
         if (html.length > 100) {
            setFullContent(html);
         } else {
            setFullContent(`<p class="mb-4 leading-relaxed text-[#334155] text-[16px] md:text-[18px]">${article.body}</p>`);
         }
      })
      .catch(err => {
         console.error(err);
         setFullContent(`<p class="mb-4 leading-relaxed text-[#334155] text-[16px] md:text-[18px]">${article.body}</p>`);
      })
      .finally(() => {
         setIsLoadingFull(false);
      });
  }, [article.link, article.body]);

  return (
    <div className="fixed inset-0 z-[200] bg-white overflow-y-auto flex flex-col items-center">
      <div className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-[#e3e7ef] px-4 py-3 flex items-center justify-between w-full md:max-w-3xl z-10">
        <button onClick={onClose} className="p-2 -ml-2 rounded-full hover:bg-[#f4f6fa] text-[#182033] flex items-center gap-2">
           <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
           <span className="font-bold text-[16px]">Quay lại</span>
        </button>
      </div>

      <div className="p-5 w-full md:max-w-3xl flex flex-col gap-4 pb-12">
        <div className="flex items-center gap-3 w-full">
           <img alt="" className="rounded-full w-8 h-8 object-cover border border-gray-100" referrerPolicy="no-referrer" src={article.logo || article.img} data-fallback={article.fallbackImg || ""} onError={(e) => { const el = e.currentTarget as HTMLImageElement; if (el.src !== el.dataset.fallback && el.dataset.fallback) { el.src = el.dataset.fallback; } }} />
           <p className="font-medium text-[#5f687b] text-[14px]">{article.src}</p>
        </div>
        
        <h1 className="font-bold text-[#182033] text-[24px] md:text-[28px] leading-[1.3] mt-1">{article.author}</h1>
        
        <div className="w-full h-[250px] md:h-[400px] mt-2 relative rounded-[12px] overflow-hidden">
           <img alt="" className="absolute inset-0 max-w-none object-cover w-full h-full" referrerPolicy="no-referrer" src={article.img} data-fallback={article.fallbackImg || ""} onError={(e) => { const el = e.currentTarget as HTMLImageElement; if (el.src !== el.dataset.fallback && el.dataset.fallback) { el.src = el.dataset.fallback; } }} />
        </div>

        {isLoadingFull ? (
           <div className="flex flex-col gap-4 mt-6 animate-pulse">
              <div className="h-4 bg-[#e3e7ef] rounded w-full"></div>
              <div className="h-4 bg-[#e3e7ef] rounded w-11/12"></div>
              <div className="h-4 bg-[#e3e7ef] rounded w-full"></div>
              <div className="h-[200px] bg-[#e3e7ef] rounded w-full my-4"></div>
              <div className="h-4 bg-[#e3e7ef] rounded w-10/12"></div>
              <div className="h-4 bg-[#e3e7ef] rounded w-full"></div>
           </div>
        ) : (
           <div className="mt-6" dangerouslySetInnerHTML={{ __html: fullContent }} />
        )}

        <a href={article.link} target="_blank" rel="noopener noreferrer" className="mt-4 bg-[#f4f6fa] hover:bg-[#e3e7ef] text-[#182033] font-bold text-center py-3 rounded-xl transition-colors">
          Đọc bài viết gốc trên {article.src.split(' ')[0]}
        </a>

        {/* Related articles */}
        <div className="mt-10 border-t border-[#e3e7ef] pt-8">
           <h2 className="font-bold text-[#182033] text-[20px] mb-4">Bài viết liên quan</h2>
           <div className="flex flex-col gap-4">
             {related.map((item: any, i: number) => (
                <div key={i} className="flex gap-4 cursor-pointer group" onClick={() => { window.scrollTo({top:0, behavior:'smooth'}); onSelectRelated(item); }}>
                   <div className="flex-1 flex flex-col gap-2">
                      <p className="font-bold text-[#182033] text-[15px] line-clamp-3 group-hover:text-[#ff315f] transition-colors">{item.author}</p>
                      <p className="font-medium text-[#5f687b] text-[12px]">{item.src}</p>
                   </div>
                   <div className="w-[100px] h-[75px] shrink-0 rounded-lg overflow-hidden relative">
                      <img alt="" className="absolute inset-0 max-w-none object-cover w-full h-full group-hover:scale-105 transition-transform" referrerPolicy="no-referrer" src={item.img} data-fallback={item.fallbackImg || ""} onError={(e) => { const el = e.currentTarget as HTMLImageElement; if (el.src !== el.dataset.fallback && el.dataset.fallback) { el.src = el.dataset.fallback; } }} />
                   </div>
                </div>
             ))}
           </div>
        </div>
      </div>
    </div>
  );
}"""

idx = content.find("function NewsDetailView")
end_idx = content.find("function MobileLayout", idx)

content = content[:idx] + new_view + "\n\n" + content[end_idx:]

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Updated NewsDetailView with scraping.")