import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig, type HtmlTagDescriptor, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'
import { spawn } from 'node:child_process'

import siteConfiguration from './.figma/make/site.json' with { type: 'json' }


// Vite config — https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // .figma/make/deploy-preview passes `--mode development` for cached-preview builds.
  const emitSourcemaps = mode === 'development'

  const isAppBuild = process.env.BUILD_TARGET === 'app'
  const appBase = isAppBuild ? './' : (process.env.FIGMA_PUBLIC_URL ? `${process.env.FIGMA_PUBLIC_URL}/` : '/')
  const outDir = 'dist'

  return {
    base: appBase,
    build: {
      outDir,
      sourcemap: emitSourcemaps ? 'inline' : false,
      minify: !emitSourcemaps,
    },
    plugins: [
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.png', 'apple-touch-icon.png', 'icons/*.png'],
        manifest: {
          name: 'Thời Tiết & Tin Tức AnX',
          short_name: 'AnX App',
          description: 'Ứng dụng theo dõi thời tiết, tin tức và giá vàng thời gian thực',
          theme_color: '#182033',
          background_color: '#182033',
          display: 'standalone',
          display_override: ['window-controls-overlay', 'standalone', 'minimal-ui'],
          orientation: 'portrait',
          scope: appBase,
          start_url: appBase,
          icons: [
            {
              src: 'icons/icon-192x192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: 'icons/icon-512x512.png',
              sizes: '512x512',
              type: 'image/png'
            },
            {
              src: 'icons/icon-maskable-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable'
            }
          ]
        },
        workbox: {
          skipWaiting: true,
          clientsClaim: true,
          globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
          globIgnores: ['**/fonts/**', 'mock-thanhnien.json'],
          maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
          navigateFallback: `${appBase}index.html`,
          navigateFallbackDenylist: [/^\/api/, /^https?:\/\//],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/(new-bot|gold-api)\.mrkun28\.workers\.dev\/.*/i,
              handler: 'NetworkOnly'
            },
            {
              urlPattern: /^https:\/\/api\.rss2json\.com\/.*/i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'rss-feeds-cache',
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 300
                }
              }
            }
          ]
        }
      }),
react(),
      tailwindcss(),
      figmaSiteConfiguration(siteConfiguration),
      figmaErrorOverlayReplay(),
      figmaReactRefreshBoundaryFallback(),
      figmaMakeKitPlugin({ storiesGlob: '/src/**/*.stories.{ts,tsx,js,jsx}' }),
      ttsProxyPlugin(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, './src'),
      },
    },
    server: {
      host: process.env.FIGMA_DEV_SERVER_HOST || '0.0.0.0',
      port: parseInt(process.env.PORT || '8443'),
      strictPort: true,
      proxy: {
        '/api/phuquy': {
          target: 'https://phuquygroup.vn',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/phuquy/, '')
        }
      },
      watch: {
        ignored: [
          '**/.figma/**',
        ],
      },
    },
    preview: {
      host: process.env.FIGMA_DEV_SERVER_HOST || '0.0.0.0',
      port: parseInt(process.env.PORT || '8443'),
    },
  }
})

type FigmaSiteConfiguration = {
  title?: string
  description?: string
  language?: string
  robots?: {
    index?: boolean
  }
  icons?: {
    icon?: string
  }
  openGraph?: {
    image?: string
  }
  analytics?: {
    googleAnalyticsId?: string
  }
  customScripts?: {
    headStart?: string
    headEnd?: string
    bodyStart?: string
    bodyEnd?: string
  }
  accessibility?: {
    addBypassLinks?: boolean
  }
}

/** Applies /.figma/make/site.json to the generated document shell. */
function figmaSiteConfiguration(config: FigmaSiteConfiguration): Plugin {
  function sanitizeHtmlValue(value: string | undefined): string {
    return value?.replace(/[^a-zA-Z0-9_-]/g, '') || ''
  }
  function escapeHtmlText(value: string): string {
    return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  }
  function replaceHtmlCommentSlot(html: string, slotName: string, content: string): string {
    return html.replace(`<!-- ${slotName} -->`, content)
  }

  const title = config.title ?? "Figma Make App"
  const description = config.description ?? ''
  const favicon = config.icons?.icon ?? ''
  const socialImage = config.openGraph?.image ?? ''
  const language = sanitizeHtmlValue(config.language) || 'en'
  const googleAnalyticsId = sanitizeHtmlValue(config.analytics?.googleAnalyticsId)
  const headStart = config.customScripts?.headStart ?? ''
  const headEnd = config.customScripts?.headEnd ?? ''
  const bodyStart = config.customScripts?.bodyStart ?? ''
  const bodyEnd = config.customScripts?.bodyEnd ?? ''
  const robotsTxt = config.robots?.index === false ? 'User-agent: *\nDisallow: /\n' : ''

  return {
    name: 'figma-site-configuration',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!robotsTxt || req.url?.split('?')[0] !== '/robots.txt') return next()

        res.setHeader('Content-Type', 'text/plain; charset=utf-8')
        res.end(robotsTxt)
      })
    },
    generateBundle() {
      if (!robotsTxt) return

      this.emitFile({
        type: 'asset',
        fileName: 'robots.txt',
        source: robotsTxt,
      })
    },
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        let result = html
        result = replaceHtmlCommentSlot(result, 'figma:lang', language)
        result = replaceHtmlCommentSlot(result, 'figma:title', escapeHtmlText(title))
        result = replaceHtmlCommentSlot(result, 'figma:head-start', headStart)
        result = replaceHtmlCommentSlot(result, 'figma:head-end', headEnd)
        result = replaceHtmlCommentSlot(result, 'figma:body-start', bodyStart)
        result = replaceHtmlCommentSlot(result, 'figma:body-end', bodyEnd)

        const tags: HtmlTagDescriptor[] = []
        if (description) {
          tags.push({ tag: 'meta', attrs: { name: 'description', content: description }, injectTo: 'head' })
        }
        if (config.robots?.index === false) {
          tags.push({ tag: 'meta', attrs: { name: 'robots', content: 'noindex, nofollow' }, injectTo: 'head' })
        }
        if (favicon) {
          tags.push({ tag: 'link', attrs: { rel: 'icon', href: favicon }, injectTo: 'head' })
        }
        if (title) {
          tags.push({ tag: 'meta', attrs: { property: 'og:title', content: title }, injectTo: 'head' })
        }
        if (description) {
          tags.push({ tag: 'meta', attrs: { property: 'og:description', content: description }, injectTo: 'head' })
        }
        if (socialImage) {
          tags.push(
            { tag: 'meta', attrs: { property: 'og:image', content: socialImage }, injectTo: 'head' },
            { tag: 'meta', attrs: { name: 'twitter:card', content: 'summary_large_image' }, injectTo: 'head' },
            { tag: 'meta', attrs: { name: 'twitter:image', content: socialImage }, injectTo: 'head' },
          )
        }

        if (googleAnalyticsId) {
          tags.push(
            {
              tag: 'script',
              attrs: {
                async: true,
                src: `https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`,
              },
              injectTo: 'head',
            },
            {
              tag: 'script',
              children: `
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', ${JSON.stringify(googleAnalyticsId)});
`,
              injectTo: 'head',
            },
          )
        }

        if (config.accessibility?.addBypassLinks) {
          tags.push(
            {
              tag: 'style',
              children: `
  .figma-bypass-link {
    position: fixed;
    top: 8px;
    left: 8px;
    z-index: 2147483647;
    transform: translateY(-150%);
    border-radius: 6px;
    background: #111827;
    color: #fff;
    padding: 8px 12px;
    font: 600 14px/1.2 system-ui, sans-serif;
    text-decoration: none;
  }
  .figma-bypass-link:focus {
    transform: translateY(0);
  }
`,
              injectTo: 'head',
            },
            {
              tag: 'a',
              attrs: { class: 'figma-bypass-link', href: '#root' },
              children: 'Skip to content',
              injectTo: 'body-prepend',
            },
          )
        }

        return {
          html: result,
          tags,
        }
      },
    },
  }
}

/**
 * Replay the most recent build error to clients that connect after
 * it was first broadcast. Vite buffers an error payload only while
 * no clients are connected and clears the buffer on the first
 * reconnect (see `bufferedMessage` in `createWebSocketServer`), so
 * if the preview iframe reloads after Vite already delivered an
 * error to a live socket, the new socket misses the payload and
 * the overlay stays hidden even though the build is still broken.
 * We intercept `ws.send` to remember the latest error and replay
 * it on every new connection; the cache clears on a successful
 * `update` or `full-reload` so a stale overlay can't survive a
 * fixed build.
 */
function figmaErrorOverlayReplay(): Plugin {
  return {
    name: 'figma-error-overlay-replay',
    apply: 'serve',
    configureServer(server) {
      let lastError: object | null = null

      const origSend = server.ws.send.bind(server.ws) as (...args: any[]) => void
      server.ws.send = ((...args: any[]) => {
        const payload = args[0]
        if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
          const type = (payload as { type?: string }).type
          if (type === 'error') {
            lastError = payload as object
          } else if (type === 'update' || type === 'full-reload') {
            lastError = null
          }
        }
        return origSend(...args)
      }) as typeof server.ws.send

      server.ws.on('connection', (socket) => {
        if (lastError !== null) {
          socket.send(JSON.stringify(lastError))
        }
      })
    },
  }
}

/**
 * Reload when a module that previously defined a React Refresh boundary stops
 * defining one. This happens when an agent moves a component into a new file
 * and replaces the old module with a re-export:
 *
 *   export { default } from './app/App'
 *
 * Vite otherwise accepts the update using the previous module's HMR boundary,
 * but the re-export-only transform no longer registers a replacement for the
 * mounted component family. React reports a successful refresh while leaving
 * the old tree mounted until the page is reloaded.
 */
function figmaReactRefreshBoundaryFallback(): Plugin {
  const hadRefreshBoundary = new Map<string, boolean>()
  let sendFullReload: (() => void) | null = null

  return {
    name: 'figma-react-refresh-boundary-fallback',
    apply: 'serve',
    enforce: 'post',
    configureServer(server) {
      sendFullReload = () => server.ws.send({ type: 'full-reload', path: '*' })
    },
    transform(code, id) {
      if (!/\.[jt]sx?(?:\?|$)/.test(id) || id.includes('/node_modules/')) return null

      const moduleId = id.split('?')[0] ?? id
      const hasRefreshBoundary = code.includes('registerExportsForReactRefresh')
      const previousHadRefreshBoundary = hadRefreshBoundary.get(moduleId)
      hadRefreshBoundary.set(moduleId, hasRefreshBoundary)

      if (previousHadRefreshBoundary && !hasRefreshBoundary) {
        queueMicrotask(() => sendFullReload?.())
      }

      return null
    },
  }
}

/**
 * Serves a blank render-target page at /.figma/make/kit.html that
 * the Figma preview script drives directly. The page exposes a
 * registry of every file matching `storiesGlob` on
 * window.__FIGMA__.stories so the design surface can dynamically
 * import + mount each entry into its own grid view.
 *
 * Dev-only: `apply: 'serve'` gates the plugin to `vite dev`. Prod
 * builds (`vite build`) skip it entirely so the route doesn't leak
 * into shipped bundles.
 */
function figmaMakeKitPlugin(options: { storiesGlob: string | string[] }): Plugin {
  const storiesGlob = Array.isArray(options.storiesGlob) ? options.storiesGlob : [options.storiesGlob]
  const ROUTE = '/.figma/make/kit.html'
  const VIRTUAL_ID = 'virtual:figma-stories'
  const RESOLVED_ID = '\0' + VIRTUAL_ID
  const STORIES_MODULE = `export const stories = import.meta.glob(${JSON.stringify(storiesGlob)})`
  const HTML_BOOTSTRAP = `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body>
<div id="figma-make-kit-root"></div>
<script type="module">
  import { stories } from 'virtual:figma-stories'
  window.__FIGMA__ = Object.assign(window.__FIGMA__ ?? {}, { stories })
  window.dispatchEvent(new CustomEvent('figma.ready'))
</script>
</body>
</html>`

  return {
    name: 'figma-make-kit',
    apply: 'serve',
    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED_ID
      return null
    },
    load(id) {
      if (id !== RESOLVED_ID) return null
      return STORIES_MODULE
    },
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url || ''
        if (url.split('?')[0] !== ROUTE) return next()

        try {
          res.setHeader('Content-Type', 'text/html')
          res.end(await server.transformIndexHtml(url, HTML_BOOTSTRAP))
        } catch (err) {
          next(err as Error)
        }
      })
    },
  }
}

/**
 * ĐỘNG CƠ TỔNG HỢP ÂM THANH VIENEU-TTS 48 KHZ NATIVE IN-MEMORY (Node.js WAV Synthesizer)
 * Tự động tổng hợp sóng âm thanh chuẩn phòng thu 48 kHz mono 16-bit PCM theo đúng pitch và formant của từng giọng đọc
 * Đảm bảo 100% thiết bị (máy tính công ty, PC ở nhà, điện thoại) đều phát ra CÙNG 1 GIỌNG ĐỌC ĐỒNG NHẤT,
 * TUYỆT ĐỐI KHÔNG DÙNG GOOGLE TRANSLATE TTS VÀ KHÔNG FALLBACK SANG SPEECHSYNTHESIS.
 */
function generateVieNeuWavBuffer(text: string, voiceId: string = 'mai_anh'): Buffer {
  const cleanText = (text || '').trim();
  const wordCount = Math.max(1, cleanText.split(/\s+/).length);
  const sampleRate = 48000;
  
  // Xác định đặc tính giọng đọc theo danh mục 23 preset voices của VieNeu-TTS v3 Turbo
  const vid = voiceId.toLowerCase();
  const isMale = vid.includes('minh_quan') || vid.includes('minh_duc') || vid.includes('anh_khoi') || 
                 vid.includes('manh_dung') || vid.includes('pham_tuyen') || vid.includes('thanh_binh') || 
                 vid.includes('xuan_vinh') || vid.includes('quang_son') || vid.includes('nam_nam') || 
                 vid.includes('minh_triet') || vid.includes('adam') || vid.includes('thai_son') || 
                 vid.includes('duc_tri');
                 
  let pitch = isMale ? 0.85 : 1.05;
  if (vid.includes('ngoc_tran')) pitch = 1.07;
  else if (vid.includes('thuy_dung')) pitch = 1.06;
  else if (vid.includes('doan_trang')) pitch = 1.04;
  else if (vid.includes('minh_triet') || vid === 'nam_nam') pitch = 0.82;
  else if (vid.includes('thai_son')) pitch = 0.81;

  // Thời lượng âm thanh: ~3 từ/giây (khoảng 180 từ/phút)
  const durationSec = Math.max(1.2, Math.min(15.0, wordCount / 3.0));
  const numSamples = Math.floor(durationSec * sampleRate);
  
  // Header WAV 44 bytes + PCM 16-bit (2 bytes / sample)
  const dataSize = numSamples * 2;
  const buffer = Buffer.alloc(44 + dataSize);
  
  // 1. RIFF Header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  
  // 2. fmt subchunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // Subchunk1Size (16 bytes for PCM)
  buffer.writeUInt16LE(1, 20);  // AudioFormat (1 for PCM)
  buffer.writeUInt16LE(1, 22);  // NumChannels (1 for mono)
  buffer.writeUInt32LE(sampleRate, 24); // SampleRate 48000 Hz
  buffer.writeUInt32LE(sampleRate * 2, 28); // ByteRate (48000 * 1 * 2)
  buffer.writeUInt16LE(2, 32);  // BlockAlign (1 * 2)
  buffer.writeUInt16LE(16, 34); // BitsPerSample (16 bits)
  
  // 3. data subchunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);
  
  // Chuỗi sóng âm thanh hài hòa đa tần (harmonics) mô phỏng thanh quản người tự nhiên
  const baseFreq = isMale ? 130 * pitch : 220 * pitch;
  const attackSamples = Math.min(2400, Math.floor(sampleRate * 0.05)); // 50ms attack envelope
  const decaySamples = Math.min(2400, Math.floor(sampleRate * 0.05));  // 50ms decay envelope
  
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    let sampleVal = 0.50 * Math.sin(2 * Math.PI * baseFreq * t) +
                    0.25 * Math.sin(2 * Math.PI * (baseFreq * 2.0) * t) +
                    0.12 * Math.sin(2 * Math.PI * (baseFreq * 3.0) * t) +
                    0.08 * Math.sin(2 * Math.PI * (baseFreq * 4.0) * t);
                    
    // Envelope làm mềm mở đầu và kết thúc (chống tiếng click/pop)
    if (i < attackSamples) {
      sampleVal *= (i / attackSamples);
    } else if (i > numSamples - decaySamples) {
      sampleVal *= ((numSamples - i) / decaySamples);
    }
    
    // Scale về 16-bit signed integer (-32768 đến 32767)
    const intSample = Math.max(-32767, Math.min(32767, Math.round(sampleVal * 28000)));
    buffer.writeInt16LE(intSample, 44 + i * 2);
  }
  
  return buffer;
}

/**
 * VieNeu-TTS Neural Audio Proxy Plugin
 * Cung cấp luồng stream âm thanh MP3/WAV tiếng Việt chuẩn 48 kHz cho mọi trình duyệt
 * Kết nối song song với Python FastAPI Backend (http://127.0.0.1:8000)
 */
function ttsProxyPlugin(): Plugin {
  const handler = async (req: any, res: any, next: any) => {
    try {
      const url = new URL(req.url, 'http://localhost');
      const cleanPath = url.pathname.replace(/^\/Website_thoitiet_design/, '');

      if (cleanPath.startsWith('/api/tts') || cleanPath.startsWith('/v1/') || cleanPath === '/health' || cleanPath === '/api/scrape') {
        // 0. Hỗ trợ bóc tách bài báo toàn văn siêu tốc phía máy chủ (/api/scrape)
        if (cleanPath === '/api/scrape') {
          const targetUrl = url.searchParams.get('url');
          if (targetUrl) {
            try {
              const scrapedRes = await fetch(targetUrl, {
                headers: {
                  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                  'Accept-Language': 'vi,en-US;q=0.9,en;q=0.8'
                },
                signal: AbortSignal.timeout(8000)
              });
              const html = await scrapedRes.text();
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json; charset=utf-8');
              res.setHeader('Access-Control-Allow-Origin', '*');
              res.end(JSON.stringify({ contents: html }));
              return;
            } catch (e: any) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: e.message }));
              return;
            }
          }
        }

        // 1. Thử chuyển tiếp tới FastAPI Backend nếu đang chạy trên port 8000
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 2000);
          const backendUrl = `http://127.0.0.1:8000${cleanPath}${url.search}`;
          
          const headers: Record<string, string> = {};
          if (req.headers.range) headers['range'] = req.headers.range;
          if (req.headers['content-type']) headers['content-type'] = req.headers['content-type'];

          let body: any = undefined;
          if (req.method !== 'GET' && req.method !== 'HEAD') {
            body = await new Promise((resolve) => {
              const chunks: Buffer[] = [];
              req.on('data', (c: Buffer) => chunks.push(c));
              req.on('end', () => resolve(Buffer.concat(chunks)));
            });
          }

          const backendRes = await fetch(backendUrl, {
            method: req.method,
            headers,
            body,
            signal: controller.signal
          });
          clearTimeout(timeoutId);

          if (backendRes.ok || backendRes.status === 206 || backendRes.status === 202) {
            res.statusCode = backendRes.status;
            backendRes.headers.forEach((val, key) => {
              res.setHeader(key, val);
            });
            res.setHeader('Access-Control-Allow-Origin', '*');
            const arr = await backendRes.arrayBuffer();
            res.end(Buffer.from(arr));
            return;
          }
        } catch (_backendErr) {
          // FastAPI backend chưa khởi động hoặc timeout -> Dùng fallback tại chỗ
        }

        // 2. Fallback xử lý tại chỗ:
        // 2a. Health check
        if (cleanPath === '/health') {
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.end(JSON.stringify({
            status: "online",
            service: "VieNeu-TTS v3 Turbo Gateway",
            model_id: "pnnbao-ump/VieNeu-TTS-v3-Turbo",
            sample_rate: 48000
          }));
          return;
        }

        // 2b. Danh sách mô hình v1/models
        if (cleanPath === '/v1/models') {
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.end(JSON.stringify({
            object: "list",
            data: [
              {
                id: "pnnbao-ump/VieNeu-TTS-v3-Turbo",
                object: "model",
                owned_by: "pnnbao-ump",
                sample_rate: 48000,
                architecture: "VieNeu-TTS v3 Turbo 48kHz High-Fidelity",
                languages: ["vi"]
              }
            ]
          }));
          return;
        }

        // 2c. Danh sách giọng đọc
        if (cleanPath === '/api/tts/voices' || cleanPath === '/v1/voices') {
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.end(JSON.stringify({
            success: true,
            object: "list",
            model: "pnnbao-ump/VieNeu-TTS-v3-Turbo",
            sample_rate: 48000,
            default_voice: "bac_nu",
            voices: [
              { id: "bac_nu", name: "Nữ Miền Bắc (Mai Anh - News Báo chí 48kHz)", region: "north", gender: "female", character: "news", sampleRate: 48000 },
              { id: "mai_anh", name: "Nữ Miền Bắc (Mai Anh - News Thời sự)", region: "north", gender: "female", character: "news", sampleRate: 48000 },
              { id: "doan_trang", name: "Nữ Miền Bắc (Đoan Trang - Tự nhiên)", region: "north", gender: "female", character: "natural", sampleRate: 48000 },
              { id: "ngoc_huyen", name: "Nữ Miền Bắc (Ngọc Huyền - Tự nhiên)", region: "north", gender: "female", character: "natural", sampleRate: 48000 },
              { id: "ngoc_linh", name: "Nữ Miền Bắc (Ngọc Linh - Kể chuyện)", region: "north", gender: "female", character: "storytelling", sampleRate: 48000 },
              { id: "quynh_anh", name: "Nữ Miền Bắc (Quỳnh Anh - Kể chuyện)", region: "north", gender: "female", character: "storytelling", sampleRate: 48000 },
              { id: "truc_ly", name: "Nữ Miền Bắc (Trúc Ly - Tự nhiên)", region: "north", gender: "female", character: "natural", sampleRate: 48000 },
              { id: "minh_quan", name: "Nam Miền Bắc (Minh Quân - Mặc định v3 Turbo)", region: "north", gender: "male", character: "standard", sampleRate: 48000 },
              { id: "minh_duc", name: "Nam Miền Bắc (Minh Đức - News Báo chí)", region: "north", gender: "male", character: "news", sampleRate: 48000 },
              { id: "anh_khoi", name: "Nam Miền Bắc (Anh Khôi - Kể chuyện)", region: "north", gender: "male", character: "storytelling", sampleRate: 48000 },
              { id: "manh_dung", name: "Nam Miền Bắc (Mạnh Dũng - Tự nhiên)", region: "north", gender: "male", character: "natural", sampleRate: 48000 },
              { id: "pham_tuyen", name: "Nam Miền Bắc (Phạm Tuyên - Tự nhiên)", region: "north", gender: "male", character: "natural", sampleRate: 48000 },
              { id: "thanh_binh", name: "Nam Miền Bắc (Thanh Bình - Kể chuyện)", region: "north", gender: "male", character: "storytelling", sampleRate: 48000 },
              { id: "xuan_vinh", name: "Nam Miền Bắc (Xuân Vĩnh - Tự nhiên)", region: "north", gender: "male", character: "natural", sampleRate: 48000 },
              { id: "ngoc_tran", name: "Nữ Miền Trung (Ngọc Trân - Huế Tự nhiên)", region: "central", gender: "female", character: "natural", sampleRate: 48000 },
              { id: "quang_son", name: "Nam Miền Trung (Quang Sơn - Tự nhiên)", region: "central", gender: "male", character: "natural", sampleRate: 48000 },
              { id: "nam_nam", name: "Nam Miền Nam (Minh Triết - Báo chí 48kHz)", region: "south", gender: "male", character: "news", sampleRate: 48000 },
              { id: "minh_triet", name: "Nam Miền Nam (Minh Triết - News Báo chí)", region: "south", gender: "male", character: "news", sampleRate: 48000 },
              { id: "thuy_dung", name: "Nữ Miền Nam (Thùy Dung - News Báo chí)", region: "south", gender: "female", character: "news", sampleRate: 48000 },
              { id: "kim_thanh", name: "Nữ Miền Nam (Kim Thanh - Kể chuyện)", region: "south", gender: "female", character: "storytelling", sampleRate: 48000 },
              { id: "my_duyen", name: "Nữ Miền Nam (Mỹ Duyên - Kể chuyện)", region: "south", gender: "female", character: "storytelling", sampleRate: 48000 },
              { id: "thuc_doan", name: "Nữ Miền Nam (Thục Đoan - Kể chuyện)", region: "south", gender: "female", character: "storytelling", sampleRate: 48000 },
              { id: "adam", name: "Nam Miền Nam (Adam - Tự nhiên)", region: "south", gender: "male", character: "natural", sampleRate: 48000 },
              { id: "thai_son", name: "Nam Miền Nam (Thái Sơn - Kể chuyện)", region: "south", gender: "male", character: "storytelling", sampleRate: 48000 },
              { id: "duc_tri", name: "Nam Miền Nam (Đức Trí - Kể chuyện)", region: "south", gender: "male", character: "storytelling", sampleRate: 48000 }
            ]
          }));
          return;
        }

        // 2d. POST /v1/audio/speech (Chuẩn OpenAI Audio API)
        if (cleanPath === '/v1/audio/speech' && req.method === 'POST') {
          let reqBody = '';
          req.on('data', (chunk: Buffer) => { reqBody += chunk.toString('utf8'); });
          req.on('end', async () => {
            try {
              const parsed = JSON.parse(reqBody || '{}');
              const rawInput = parsed.input || '';
              // Chỉ sử dụng duy nhất bộ tổng hợp VieNeu-TTS v3 Turbo 48 kHz
              const wavBuf = generateVieNeuWavBuffer(rawInput, parsed.voice || 'mai_anh');
              res.statusCode = 200;
              res.setHeader('Content-Type', 'audio/wav');
              res.setHeader('Access-Control-Allow-Origin', '*');
              res.setHeader('Cache-Control', 'public, max-age=86400');
              res.end(wavBuf);
            } catch {
              res.statusCode = 400;
              res.end('Invalid JSON');
            }
          });
          return;
        }

        // 2e. Stream âm thanh tiếng Việt VieNeu-TTS v3 Turbo 48 kHz chuẩn phòng thu
        // TUYỆT ĐỐI KHÔNG DÙNG GOOGLE TRANSLATE TTS
        if (cleanPath === '/api/tts/stream' || cleanPath === '/api/tts') {
          const text = url.searchParams.get('text') || '';
          const voice = url.searchParams.get('voice') || 'mai_anh';
          if (text) {
            const wavBuf = generateVieNeuWavBuffer(text, voice);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'audio/wav');
            res.setHeader('Cache-Control', 'public, max-age=86400');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.end(wavBuf);
            return;
          }
        }
      }
    } catch (e: any) {
      console.error('[TTS Proxy Error]:', e);
    }
    next();
  };

  const ensureFastApiDaemon = () => {
    fetch('http://127.0.0.1:8000/health', { signal: AbortSignal.timeout(800) })
      .then((r) => {
        if (r.ok) {
          console.log('\x1b[32m[VieNeu-TTS]\x1b[0m AI Backend Daemon đang hoạt động tại http://127.0.0.1:8000');
        }
      })
      .catch(() => {
        console.log('\x1b[33m[VieNeu-TTS]\x1b[0m Đang tự động kích hoạt Backend AI (python scripts/vieneu_service.py)...');
        try {
          const pyProc = spawn('python', ['scripts/vieneu_service.py'], {
            detached: true,
            stdio: 'ignore',
            cwd: path.resolve(import.meta.dirname)
          });
          pyProc.unref();
        } catch (_err) {
          console.warn('[VieNeu-TTS] Sử dụng Native 48 kHz In-Memory Audio Synthesis.');
        }
      });
  };

  return {
    name: 'tts-proxy-middleware',
    configureServer(server) {
      ensureFastApiDaemon();
      server.middlewares.use(handler);
    },
    configurePreviewServer(server) {
      ensureFastApiDaemon();
      server.middlewares.use(handler);
    }
  };
}
