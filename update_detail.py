import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Inject NewsDetailView
news_detail_view = """
function NewsDetailView({ article, allNews, onClose, onSelectRelated }: { article: any, allNews: any[], onClose: () => void, onSelectRelated: (item: any) => void }) {
  const related = React.useMemo(() => {
    return allNews.filter((n: any) => n.link !== article.link).sort(() => 0.5 - Math.random()).slice(0, 3);
  }, [article, allNews]);

  React.useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'auto'; };
  }, []);

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

        <p className="font-normal text-[#334155] text-[16px] md:text-[18px] leading-relaxed mt-4 whitespace-pre-wrap">{article.body}</p>

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
}

"""
content = content.replace("function MobileLayout", news_detail_view + "function MobileLayout")

# 2. Update signatures of layouts to accept onArticleClick
for layout in ["MobileLayout", "TabletLayout", "DesktopLayout"]:
    content = content.replace(
        f"setDarkMode?: (d: boolean) => void;",
        f"setDarkMode?: (d: boolean) => void;\n    onArticleClick?: (article: any) => void;"
    )
    content = content.replace(
        f"liveOverrides,\n}}: {{",
        f"liveOverrides,\n  onArticleClick,\n}}: {{"
    )

# 3. Update the `a` tags in all three layouts
old_a_tag = """href={item.link ?? "#"}
              target={item.link ? "_blank" : undefined}
              rel="noopener noreferrer"
              className="bg-white flex flex-col gap-[14px] items-start overflow-hidden p-[var(--card-padding)] rounded-[var(--card-radius)] shadow-[0px_4px_12px_0px_rgba(23,33,51,0.1)] hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(23,33,51,0.2)] transition-all duration-300 w-full no-underline group" """

new_a_tag = """href="#"
              onClick={(e) => { e.preventDefault(); if (onArticleClick) onArticleClick(item); }}
              className="bg-white flex flex-col gap-[14px] items-start overflow-hidden p-[var(--card-padding)] rounded-[var(--card-radius)] shadow-[0px_4px_12px_0px_rgba(23,33,51,0.1)] hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(23,33,51,0.2)] transition-all duration-300 w-full no-underline group cursor-pointer" """

content = content.replace(old_a_tag, new_a_tag)


# DesktopLayout specifically has a slightly different mapping for the first item and the remaining list!
# I will use a regex to catch all `href={item.link ?? "#"}` blocks that look like the wrapper links.
content = re.sub(r'href=\{item\.link \?\? "#"\}\s*target=\{item\.link \? "_blank" : undefined\}\s*rel="noopener noreferrer"\s*className="([^"]+)"',
                 r'href="#" onClick={(e) => { e.preventDefault(); if (onArticleClick) onArticleClick(item); }} className="\1 cursor-pointer"', content)

# There's also `firstNews` in Tablet and Desktop!
content = re.sub(r'href=\{firstNews\.link \?\? "#"\}\s*target=\{firstNews\.link \? "_blank" : undefined\}\s*rel="noopener noreferrer"\s*className="([^"]+)"',
                 r'href="#" onClick={(e) => { e.preventDefault(); if (onArticleClick) onArticleClick(firstNews); }} className="\1 cursor-pointer"', content)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Injected NewsDetailView and updated layouts.")