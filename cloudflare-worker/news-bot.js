// NEWS-BOT: Cloudflare Worker - Cào RSS + Nội dung chi tiết bài viết
// Lưu cache vào KV Storage, Frontend chỉ gọi 1 lần để lấy toàn bộ dữ liệu

const RSS_FEEDS = [
  { category: "Thời sự", name: "VnExpress", url: "https://vnexpress.net/rss/thoi-su.rss" },
  { category: "Thời sự", name: "Tuổi Trẻ", url: "https://tuoitre.vn/rss/thoi-su.rss" },
  { category: "Thời sự", name: "Thanh Niên", url: "https://thanhnien.vn/rss/thoi-su.rss" },
  { category: "Công nghệ", name: "VnExpress • Số Hóa", url: "https://vnexpress.net/rss/so-hoa.rss" },
  { category: "Công nghệ", name: "GenK", url: "https://genk.vn/rss/home.rss" },
  { category: "Kinh tế", name: "CafeF", url: "https://cafef.vn/rss/home.rss" },
  { category: "Kinh tế", name: "VnExpress • Kinh doanh", url: "https://vnexpress.net/rss/kinh-doanh.rss" },
  { category: "Giải trí", name: "VnExpress • Giải trí", url: "https://vnexpress.net/rss/giai-tri.rss" },
  { category: "Thể thao", name: "VnExpress • Thể thao", url: "https://vnexpress.net/rss/the-thao.rss" },
];

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'vi-VN,vi;q=0.9,en;q=0.7',
};

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// ==================== HÀM PARSE RSS XML ====================
function parseRSS(xml, feedName, category) {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match;
  while ((match = itemRegex.exec(xml)) !== null && items.length < 5) {
    const block = match[1];
    const title = (block.match(/<title><!\[CDATA\[(.*?)\]\]>|<title>(.*?)<\/title>/) || [])[1] || (block.match(/<title>(.*?)<\/title>/) || [])[1] || '';
    const link = (block.match(/<link>(.*?)<\/link>/) || [])[1] || '';
    const desc = (block.match(/<description><!\[CDATA\[([\s\S]*?)\]\]>|<description>([\s\S]*?)<\/description>/) || [])[1] || '';
    const pubDate = (block.match(/<pubDate>(.*?)<\/pubDate>/) || [])[1] || '';
    
    // Lấy ảnh từ enclosure hoặc description
    let image = '';
    const enclosure = block.match(/<enclosure[^>]+url=["']([^"']+)["']/);
    if (enclosure) image = enclosure[1];
    if (!image) {
      const imgMatch = desc.match(/<img[^>]+src=["']([^"']+)["']/i);
      if (imgMatch) image = imgMatch[1];
    }
    if (!image) {
      const mediaContent = block.match(/<media:content[^>]+url=["']([^"']+)["']/);
      if (mediaContent) image = mediaContent[1];
    }
    
    // Bỏ HTML trong description
    const cleanDesc = desc.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#39;/g, "'").replace(/&quot;/g, '"').trim();
    
    if (title && link) {
      items.push({
        title: title.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"'),
        link: link.trim(),
        description: cleanDesc.substring(0, 300),
        image: image.replace(/&amp;/g, '&'),
        pubDate,
        source: feedName,
        category,
      });
    }
  }
  return items;
}

// ==================== HÀM CÀO NỘI DUNG CHI TIẾT BÀI VIẾT ====================
async function scrapeArticle(url) {
  try {
    const res = await fetch(url, { headers: HEADERS, redirect: 'follow' });
    if (!res.ok) return null;
    const html = await res.text();
    
    // Tìm nội dung chính dựa vào CSS selector phổ biến của các báo Việt Nam
    const contentSelectors = [
      // VnExpress
      /<article[^>]*class="[^"]*fck_detail[^"]*"[^>]*>([\s\S]*?)<\/article>/i,
      /<div[^>]*class="[^"]*fck_detail[^"]*"[^>]*>([\s\S]*?)<\/div>\s*(?:<div[^>]*class="[^"]*box-tinlienquan|<div[^>]*class="[^"]*related)/i,
      // Tuổi Trẻ
      /<div[^>]*class="[^"]*detail-cmain[^"]*"[^>]*>([\s\S]*?)<\/div>\s*(?:<div[^>]*class="[^"]*detail-relate)/i,
      /<div[^>]*id="main-detail-body"[^>]*>([\s\S]*?)<\/div>/i,
      // Thanh Niên
      /<div[^>]*class="[^"]*detail__content[^"]*"[^>]*>([\s\S]*?)<\/div>\s*(?:<div[^>]*class="[^"]*detail-relate)/i,
      // GenK/CafeF (Admicro network)
      /<div[^>]*class="[^"]*knc-content[^"]*"[^>]*>([\s\S]*?)<\/div>\s*(?:<div[^>]*class="[^"]*related)/i,
      // Generic fallback - tìm article tag
      /<article[^>]*>([\s\S]*?)<\/article>/i,
    ];

    let content = '';
    for (const regex of contentSelectors) {
      const m = html.match(regex);
      if (m && m[1] && m[1].length > 200) {
        content = m[1];
        break;
      }
    }
    
    // Nếu không tìm thấy bằng selector, lấy tất cả thẻ <p> trong body
    if (!content || content.length < 200) {
      const allPs = [];
      const pRegex = /<p[^>]*>([\s\S]*?)<\/p>/gi;
      let pMatch;
      while ((pMatch = pRegex.exec(html)) !== null) {
        const text = pMatch[1].replace(/<[^>]+>/g, '').trim();
        if (text.length > 30) allPs.push(text);
      }
      if (allPs.length > 3) {
        content = allPs.map(p => `<p>${p}</p>`).join('\n');
      }
    }
    
    if (!content || content.length < 100) return null;

    // Trích xuất tất cả ảnh trong bài viết
    const images = [];
    const imgRegex = /<img[^>]+(?:src|data-src)=["']([^"']+)["'][^>]*>/gi;
    let imgMatch;
    while ((imgMatch = imgRegex.exec(content)) !== null) {
      let src = imgMatch[1];
      if (src && !src.includes('logo') && !src.includes('icon') && !src.includes('pixel') && !src.includes('1x1')) {
        if (src.startsWith('/')) {
          try { src = new URL(src, url).href; } catch(e) {}
        }
        images.push(src.replace(/&amp;/g, '&'));
      }
    }

    // Trích xuất caption ảnh
    const captions = [];
    const capRegex = /<figcaption[^>]*>([\s\S]*?)<\/figcaption>/gi;
    let capMatch;
    while ((capMatch = capRegex.exec(content)) !== null) {
      captions.push(capMatch[1].replace(/<[^>]+>/g, '').trim());
    }

    // Lấy các đoạn văn (paragraphs) - bỏ HTML tags
    const paragraphs = [];
    const paraRegex = /<p[^>]*>([\s\S]*?)<\/p>/gi;
    let paraMatch;
    while ((paraMatch = paraRegex.exec(content)) !== null) {
      let text = paraMatch[1]
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<[^>]+>/g, '')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&#39;/g, "'")
        .replace(/&quot;/g, '"')
        .replace(/&nbsp;/g, ' ')
        .trim();
      if (text.length > 10) paragraphs.push(text);
    }

    // Lấy các heading
    const headings = [];
    const hRegex = /<h[234][^>]*>([\s\S]*?)<\/h[234]>/gi;
    let hMatch;
    while ((hMatch = hRegex.exec(content)) !== null) {
      headings.push(hMatch[1].replace(/<[^>]+>/g, '').trim());
    }

    return {
      paragraphs,
      images,
      captions,
      headings,
    };
  } catch (err) {
    return null;
  }
}

// ==================== HÀM CHÍNH: CÀO TOÀN BỘ ====================
async function crawlAllNews() {
  const allArticles = [];
  
  // Bước 1: Fetch tất cả RSS feeds song song
  const feedPromises = RSS_FEEDS.map(async (feed) => {
    try {
      const res = await fetch(feed.url, { headers: HEADERS });
      if (!res.ok) return [];
      const xml = await res.text();
      return parseRSS(xml, feed.name, feed.category);
    } catch (e) {
      return [];
    }
  });

  const feedResults = await Promise.all(feedPromises);
  const rssArticles = feedResults.flat();

  // Bước 2: Cào nội dung chi tiết cho từng bài (giới hạn 20 bài để tránh timeout)
  const topArticles = rssArticles.slice(0, 20);
  
  const detailPromises = topArticles.map(async (article) => {
    const detail = await scrapeArticle(article.link);
    return {
      ...article,
      fullContent: detail, // null nếu cào thất bại
    };
  });

  const articlesWithContent = await Promise.all(detailPromises);
  return articlesWithContent;
}

// ==================== CLOUDFLARE WORKER HANDLER ====================
export default {
  async fetch(request, env, ctx) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // API: /api/scrape - Cào trực tiếp 1 bài viết theo URL (On-demand)
        if (path === '/api/scrape') {
          const targetUrl = url.searchParams.get('url');
          if (!targetUrl) {
            return new Response(JSON.stringify({ success: false, error: 'Missing url parameter' }), {
              headers: { 'Content-Type': 'application/json;charset=UTF-8', ...CORS_HEADERS }
            });
          }
          
          const detail = await scrapeArticle(targetUrl);
          return new Response(JSON.stringify({ success: !!detail, data: detail }), {
            headers: { 'Content-Type': 'application/json;charset=UTF-8', ...CORS_HEADERS, 'Cache-Control': 'public, max-age=3600' }
          });
        }
        
        // API: /api/news - Trả về toàn bộ tin tức đã cào xong (có cache 5 phút)
      if (path === '/api/news' || path === '/') {
        const category = url.searchParams.get('category') || '';
        const cacheKey = `news_${category || 'all'}`;
        
        // Kiểm tra cache trong KV (nếu có binding)
        if (env.NEWS_CACHE) {
          const cached = await env.NEWS_CACHE.get(cacheKey);
          if (cached) {
            return new Response(cached, {
              headers: { 'Content-Type': 'application/json;charset=UTF-8', ...CORS_HEADERS, 'X-Cache': 'HIT' }
            });
          }
        }

        // Không có cache -> Cào mới
        let articles = await crawlAllNews();
        
        // Lọc theo category nếu có
        if (category) {
          articles = articles.filter(a => a.category === category);
        }

        const json = JSON.stringify({
          success: true,
          crawledAt: new Date().toISOString(),
          totalArticles: articles.length,
          articles,
        });

        // Lưu vào KV cache 5 phút
        if (env.NEWS_CACHE) {
          ctx.waitUntil(env.NEWS_CACHE.put(cacheKey, json, { expirationTtl: 300 }));
        }

        return new Response(json, {
          headers: { 'Content-Type': 'application/json;charset=UTF-8', ...CORS_HEADERS, 'X-Cache': 'MISS' }
        });
      }

      // Fallback
      return new Response(JSON.stringify({ error: 'Not found. Use /api/news' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
      });

    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
      });
    }
  },
};
