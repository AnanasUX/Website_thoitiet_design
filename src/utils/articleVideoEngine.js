/**
 * ARTICLE VIDEO INGESTION & PLAYBACK ENGINE (REQ-046 / TC-046)
 * ==============================================================
 * Module chuyên trách bóc tách, chuẩn hóa và tối ưu hiển thị video nhúng
 * từ các cơ quan báo đài chính thống Việt Nam (VTV, Thanh Niên, Tuổi Trẻ,
 * Dân Trí, Tiền Phong, VnExpress, Kenh14/GenK/Soha...) và các nền tảng video (YouTube, TikTok).
 */
// Danh sách domain máy chủ video và CDN tin cậy của các báo chí Việt Nam
export const TRUSTED_NEWS_VIDEO_DOMAINS = [
    'vtv.vn',
    'player.vtv.vn',
    'video.thanhnien.vn',
    'thanhnien.vn',
    'tv.tuoitre.vn',
    'video.tuoitre.vn',
    'tuoitre.vn',
    'video.dantri.com.vn',
    'dantri.com.vn',
    'icdn.dantri.com.vn',
    'tienphong.vn',
    'static.tienphong.vn',
    'vnexpress.net',
    'video.vnexpress.net',
    'vnecdn.net',
    'd1.vnecdn.net',
    'mediacdn.vn',
    'channel.mediacdn.vn',
    'sohacdn.com',
    'vcmedia.vn',
    'youtube.com',
    'youtu.be',
    'youtube-nocookie.com',
    'tiktok.com',
    'facebook.com',
    'vimeo.com'
];
/**
 * Kiểm tra xem URL video có thuộc về nguồn phát hành báo chí hoặc nền tảng video tin cậy không
 */
export function isTrustedNewsVideoDomain(rawUrl) {
    if (!rawUrl || typeof rawUrl !== 'string')
        return false;
    try {
        const urlObj = new URL(rawUrl.startsWith('//') ? 'https:' + rawUrl : rawUrl);
        const host = urlObj.hostname.toLowerCase();
        return TRUSTED_NEWS_VIDEO_DOMAINS.some(domain => host === domain || host.endsWith('.' + domain));
    }
    catch {
        return false;
    }
}
/**
 * Chuẩn hóa URL video nhúng để phát mượt mà, hỗ trợ giao thức https và tham số embed an toàn
 */
export function buildSafeVideoEmbedUrl(rawUrl, baseUrl = '') {
    if (!rawUrl || typeof rawUrl !== 'string')
        return '';
    let cleanUrl = rawUrl.trim();
    // Khắc phục relative protocol //
    if (cleanUrl.startsWith('//')) {
        cleanUrl = 'https:' + cleanUrl;
    }
    else if (cleanUrl.startsWith('/')) {
        try {
            cleanUrl = new URL(cleanUrl, baseUrl || 'https://thanhnien.vn').href;
        }
        catch {
            cleanUrl = 'https://' + cleanUrl.replace(/^\/+/, '');
        }
    }
    // Khắc phục YouTube embed
    if (/youtube\.com|youtu\.be/i.test(cleanUrl)) {
        const ytMatch = cleanUrl.match(/(?:embed\/|shorts\/|v=|\/v\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
        if (ytMatch && ytMatch[1]) {
            return `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?rel=0&modestbranding=1&iv_load_policy=3&fs=0&controls=1&playsinline=1`;
        }
    }
    // Khắc phục TikTok embed
    if (/tiktok\.com/i.test(cleanUrl)) {
        const ttMatch = cleanUrl.match(/\/video\/(\d+)/);
        if (ttMatch && ttMatch[1]) {
            return `https://www.tiktok.com/embed/v2/${ttMatch[1]}`;
        }
    }
    // Báo Thanh Niên embed player (video.thanhnien.vn)
    if (cleanUrl.includes('video.thanhnien.vn') && !cleanUrl.includes('embed') && !cleanUrl.includes('.mp4')) {
        cleanUrl = cleanUrl.replace('video.thanhnien.vn/', 'video.thanhnien.vn/embed/');
    }
    return cleanUrl;
}
/**
 * Trích xuất toàn bộ video từ chuỗi HTML trang báo (hỗ trợ DOMParser và regex)
 */
export function extractArticleVideos(htmlStr, baseUrl = '') {
    if (!htmlStr || typeof htmlStr !== 'string')
        return [];
    const videos = [];
    const addVideoIfNotExists = (video) => {
        if (!video.src)
            return;
        const isDup = videos.some(v => v.src === video.src);
        if (!isDup) {
            videos.push(video);
        }
    };
    // 1. Trích xuất từ JSON-LD schema (VideoObject)
    const ldJsonMatches = htmlStr.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi) || [];
    for (const s of ldJsonMatches) {
        if (s.includes('VideoObject') || s.includes('contentUrl') || s.includes('embedUrl')) {
            try {
                let jsonText = s.replace(/<script[^>]*>|<\/script>/gi, '').trim();
                jsonText = jsonText.replace(/[\u0000-\u001F\u007F-\u009F]/g, c => (c === '\n' || c === '\r' ? ' ' : ''));
                const parsed = JSON.parse(jsonText);
                const list = Array.isArray(parsed) ? parsed : [parsed];
                for (const item of list) {
                    const obj = item['@type'] === 'VideoObject' ? item : (item.video || null);
                    if (obj && (obj.contentUrl || obj.embedUrl)) {
                        const rawVUrl = (obj.contentUrl || obj.embedUrl || '').trim();
                        const safeUrl = buildSafeVideoEmbedUrl(rawVUrl, baseUrl);
                        const thumb = Array.isArray(obj.thumbnailUrl) ? obj.thumbnailUrl[0] : (obj.thumbnailUrl || '');
                        const isShort = /PT(?:0M|1M|2M)/.test(obj.duration || '') || /short|reel/i.test(safeUrl);
                        let provider = 'html5';
                        if (/vtv\.vn/i.test(safeUrl))
                            provider = 'vtv';
                        else if (/thanhnien\.vn/i.test(safeUrl))
                            provider = 'thanhnien';
                        else if (/tuoitre\.vn/i.test(safeUrl))
                            provider = 'tuoitre';
                        else if (/dantri\.com\.vn/i.test(safeUrl))
                            provider = 'dantri';
                        else if (/tienphong\.vn/i.test(safeUrl))
                            provider = 'tienphong';
                        else if (/vnexpress\.net|vnecdn/i.test(safeUrl))
                            provider = 'vnexpress';
                        else if (/youtube|youtu\.be/i.test(safeUrl))
                            provider = 'youtube';
                        else if (/tiktok/i.test(safeUrl))
                            provider = 'tiktok';
                        addVideoIfNotExists({
                            type: safeUrl.includes('embed') || safeUrl.includes('iframe') ? 'iframe' : 'video',
                            src: safeUrl,
                            poster: thumb,
                            caption: obj.name || obj.description || 'Bản tin truyền hình',
                            isShort,
                            provider,
                            title: obj.name || ''
                        });
                    }
                }
            }
            catch { }
        }
    }
    // 2. Trích xuất OpenGraph video metadata (og:video, og:video:url, og:video:secure_url)
    const ogVideoMatch = htmlStr.match(/<meta\s+property=["']og:video(?::secure_url|:url)?["']\s+content=["']([^"']+)["']/i);
    if (ogVideoMatch && ogVideoMatch[1]) {
        const rawOgUrl = ogVideoMatch[1].trim();
        if (isTrustedNewsVideoDomain(rawOgUrl) || rawOgUrl.endsWith('.mp4') || rawOgUrl.includes('/video')) {
            const safeOg = buildSafeVideoEmbedUrl(rawOgUrl, baseUrl);
            addVideoIfNotExists({
                type: safeOg.includes('embed') ? 'iframe' : 'video',
                src: safeOg,
                provider: 'html5',
                caption: 'Video bản tin gốc'
            });
        }
    }
    // 3. Trích xuất container video đặc thù của báo chí Việt Nam
    // Thẻ <div type="VideoStream" data-vid="..." data-src="..." data-thumb="..."> (Thanh Niên, Kenh14, VTV, Tuổi Trẻ)
    const videoStreamRegex = /<(?:div|figure)[^>]+(?:type=["']VideoStream["']|class=["'][^"']*(?:cms-video|vne_video_player|media-video|video-content)[^"']*)[^>]*>/gi;
    let vsMatch;
    while ((vsMatch = videoStreamRegex.exec(htmlStr)) !== null) {
        const tagSnippet = vsMatch[0];
        const srcMatch = tagSnippet.match(/data-(?:vid|video-src|src|video)=["']([^"']+)["']/i) ||
            tagSnippet.match(/src=["']([^"']+)["']/i);
        const thumbMatch = tagSnippet.match(/data-(?:thumb|poster)=["']([^"']+)["']/i) ||
            tagSnippet.match(/poster=["']([^"']+)["']/i);
        if (srcMatch && srcMatch[1]) {
            let rawSrc = srcMatch[1].trim();
            // Giải mã tham số vid= nếu có
            if (rawSrc.includes('vid=')) {
                const vp = rawSrc.match(/[?&]vid=([^&]+)/i);
                if (vp)
                    rawSrc = decodeURIComponent(vp[1]);
            }
            const safeSrc = buildSafeVideoEmbedUrl(rawSrc, baseUrl);
            const safeThumb = thumbMatch ? thumbMatch[1].trim() : '';
            let provider = 'html5';
            if (/vtv\.vn/i.test(safeSrc))
                provider = 'vtv';
            else if (/thanhnien\.vn/i.test(safeSrc))
                provider = 'thanhnien';
            else if (/tuoitre\.vn/i.test(safeSrc))
                provider = 'tuoitre';
            else if (/dantri\.com\.vn/i.test(safeSrc))
                provider = 'dantri';
            else if (/tienphong\.vn/i.test(safeSrc))
                provider = 'tienphong';
            else if (/vnexpress\.net/i.test(safeSrc))
                provider = 'vnexpress';
            addVideoIfNotExists({
                type: safeSrc.includes('embed') ? 'iframe' : 'video',
                src: safeSrc,
                poster: safeThumb,
                caption: 'Bản tin truyền hình thời sự',
                isShort: /short|reel/i.test(safeSrc),
                provider
            });
        }
    }
    // 4. Trích xuất thẻ <video> trực tiếp
    const videoTagRegex = /<video[^>]*>([\s\S]*?)<\/video>|<video[^>]+src=["']([^"']+)["'][^>]*>/gi;
    let vtMatch;
    while ((vtMatch = videoTagRegex.exec(htmlStr)) !== null) {
        const wholeTag = vtMatch[0];
        let vSrc = vtMatch[2] || '';
        if (!vSrc) {
            const sourceMatch = wholeTag.match(/<source[^>]+src=["']([^"']+)["']/i);
            if (sourceMatch)
                vSrc = sourceMatch[1];
        }
        const posterMatch = wholeTag.match(/poster=["']([^"']+)["']/i);
        if (vSrc) {
            const safeSrc = buildSafeVideoEmbedUrl(vSrc, baseUrl);
            addVideoIfNotExists({
                type: 'video',
                src: safeSrc,
                poster: posterMatch ? posterMatch[1].trim() : '',
                provider: 'html5',
                caption: 'Video phóng sự thực tế'
            });
        }
    }
    // 5. Trích xuất thẻ <iframe> báo chí và YouTube/TikTok
    const iframeRegex = /<iframe[^>]+src=["']([^"']+)["'][^>]*>/gi;
    let ifrMatch;
    while ((ifrMatch = iframeRegex.exec(htmlStr)) !== null) {
        const rawIfrSrc = ifrMatch[1].trim();
        if (isTrustedNewsVideoDomain(rawIfrSrc)) {
            const safeIfr = buildSafeVideoEmbedUrl(rawIfrSrc, baseUrl);
            let provider = 'html5';
            if (/youtube|youtu\.be/i.test(safeIfr))
                provider = 'youtube';
            else if (/tiktok/i.test(safeIfr))
                provider = 'tiktok';
            else if (/vtv/i.test(safeIfr))
                provider = 'vtv';
            else if (/thanhnien/i.test(safeIfr))
                provider = 'thanhnien';
            else if (/tuoitre/i.test(safeIfr))
                provider = 'tuoitre';
            else if (/dantri/i.test(safeIfr))
                provider = 'dantri';
            else if (/tienphong/i.test(safeIfr))
                provider = 'tienphong';
            addVideoIfNotExists({
                type: 'iframe',
                src: safeIfr,
                provider,
                caption: 'Bản tin phóng sự',
                isShort: /shorts|tiktok/i.test(safeIfr)
            });
        }
    }
    return videos;
}
