import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Replace the scraping logic in NewsDetailView
old_logic = """         const elements = mainNode.querySelectorAll('p, img, h1, h2, h3');
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
         }"""

new_logic = """         // Remove garbage elements
         const badSelectors = [
           'script', 'style', 'iframe', 'nav', 'header', 'footer', 
           '.box-tin-lien-quan', '.tin-lien-quan', '.related-news', 
           'aside', '.banner', '.ads', '.ad-container', 'form',
           '.social-share', '.author-info', 'button', '.breadcrumb',
           '#header', '#footer', '.comment-section'
         ];
         badSelectors.forEach(sel => {
            mainNode?.querySelectorAll(sel).forEach(n => n.remove());
         });

         // Process images
         mainNode.querySelectorAll('img').forEach(img => {
            let src = img.getAttribute('data-src') || img.getAttribute('data-original') || img.getAttribute('src');
            if (src && !src.startsWith('http') && !src.startsWith('data:')) {
                try { src = new URL(src, article.link).href; } catch(e){}
            }
            if (src && (src.includes('logo') || src.includes('icon'))) {
               img.remove();
            } else {
               img.setAttribute('src', src || "");
               img.removeAttribute('data-src');
               img.removeAttribute('srcset');
               img.className = "w-full h-auto object-cover rounded-xl my-5 shadow-sm";
            }
         });

         // Process paragraphs and text formatting
         mainNode.querySelectorAll('p').forEach(p => {
            p.className = "mb-4 leading-relaxed text-[#334155] text-[16px] md:text-[18px]";
         });
         
         mainNode.querySelectorAll('a').forEach(a => {
            a.setAttribute('target', '_blank');
            a.className = "text-[#0a84ff] hover:underline";
         });

         mainNode.querySelectorAll('h1, h2, h3, h4').forEach(h => {
            h.className = "font-bold text-[#182033] text-[20px] md:text-[22px] mt-8 mb-4";
         });
         
         mainNode.querySelectorAll('ul, ol').forEach(list => {
            list.className = "pl-6 mb-4 leading-relaxed text-[#334155] text-[16px] md:text-[18px] list-outside";
            if (list.tagName === 'UL') list.classList.add('list-disc');
            if (list.tagName === 'OL') list.classList.add('list-decimal');
         });

         mainNode.querySelectorAll('li').forEach(li => {
            li.className = "mb-2";
         });

         mainNode.querySelectorAll('figcaption, .fig, .caption').forEach(cap => {
            cap.className = "text-center text-[#5f687b] text-[14px] mt-2 mb-6 italic";
         });

         mainNode.querySelectorAll('blockquote').forEach(bq => {
            bq.className = "border-l-4 border-[#0a84ff] pl-4 py-1 my-6 italic text-[#5f687b] bg-[#f4f6fa] rounded-r-lg";
         });

         const html = mainNode.innerHTML.trim();
         
         if (html.length > 200) {
            setFullContent(html);
         } else {
            setFullContent(`<p class="mb-4 leading-relaxed text-[#334155] text-[16px] md:text-[18px]">${article.body}</p>`);
         }"""

if old_logic in content:
    content = content.replace(old_logic, new_logic)
    with open("src/App.tsx", "w", encoding="utf-8") as f:
        f.write(content)
    print("Upgraded scraper to retain full HTML structure.")
else:
    print("Old logic not found! Please check.")