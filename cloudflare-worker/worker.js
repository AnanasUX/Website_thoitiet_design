const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
  async fetch(request, env, ctx) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // ========== ROUTE: /proxy?url=... ==========
      // Proxy bất kỳ URL nào (dùng để fetch HTML bài báo từ client)
      if (path === '/proxy') {
        const targetUrl = url.searchParams.get('url');
        if (!targetUrl) {
          return new Response(JSON.stringify({ error: 'Missing url parameter' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
          });
        }

        const response = await fetch(targetUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
          },
          redirect: 'follow',
        });

        const html = await response.text();
        return new Response(html, {
          headers: {
            'Content-Type': 'text/html;charset=UTF-8',
            ...CORS_HEADERS,
            'Cache-Control': 'public, max-age=3600',
          }
        });
      }

      // ========== ROUTE: / (default) — Gold API ==========
      const targetUrl = 'https://be.phuquy.com.vn/jewelry/product-payment-service/api/sync-price-history/get-sync-table-history?_t=' + Date.now();
      
      const response = await fetch(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
          'Referer': 'https://phuquygroup.vn/'
        }
      });

      const data = await response.text();

      return new Response(data, {
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
          ...CORS_HEADERS,
          'Cache-Control': 'no-store'
        }
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...CORS_HEADERS
        }
      });
    }
  },
};
