/**
 * CORE BUSINESS LOGIC & DATA FLOW UTILITIES
 * =============================================================================
 * Phân hệ xử lý dữ liệu nghiệp vụ chuẩn hóa cho toàn bộ hệ thống Weather & News App.
 * Đảm bảo 100% tính vẹn toàn, chạy độc lập và có thể kiểm thử tự động (Unit & Integration).
 */
// ─────────────────────────────────────────────────────────────────────────────
// LUỒNG 1: WEATHER LOGIC & CALCULATIONS FLOW
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Nhận diện condition key từ nhãn thời tiết người dùng hoặc OpenWeather/CWB API.
 */
export function detectConditionKey(conditionLabel) {
    if (!conditionLabel)
        return "binh-thuong";
    const s = conditionLabel.toLowerCase().trim();
    if (s.includes("dông") || s.includes("dong") || s.includes("bão") || s.includes("sấm") || s.includes("thunder"))
        return "mua-dong";
    if (s.includes("mưa") || s.includes("mua") || s.includes("rain") || s.includes("drizzle"))
        return "mua-nho";
    if (s.includes("nắng gắt") || s.includes("nang gat") || s.includes("nắng nóng") || s.includes("extreme heat"))
        return "nang-gat";
    if (s.includes("nắng") || s.includes("nang") || s.includes("clear") || s.includes("sun"))
        return "nang";
    if (s.includes("âm u") || s.includes("am u") || s.includes("mây") || s.includes("cloud") || s.includes("sương mù") || s.includes("fog"))
        return "am-u";
    return "binh-thuong";
}
/**
 * Ánh xạ trạng thái từ Worker / Bot tự động sang ConditionKey chuẩn giao diện.
 */
export function mapBotStatusToCondKey(status) {
    if (!status)
        return "binh-thuong";
    const s = status.toUpperCase().trim();
    if (s === "MUA_BAO" || s === "MUA_DONG" || s === "THUNDERSTORM")
        return "mua-dong";
    if (s === "MUA_NHO" || s === "MUA_NHE" || s === "MUA_RAO" || s === "RAIN")
        return "mua-nho";
    if (s === "NANG_GAT" || s === "HOT")
        return "nang-gat";
    if (s === "NANG" || s === "CLEAR")
        return "nang";
    if (s === "AM_U" || s === "CLOUDY" || s === "MAY")
        return "am-u";
    return "binh-thuong";
}
/**
 * Phân cấp chỉ số bụi mịn PM2.5 theo tiêu chuẩn sức khỏe WHO / EPA.
 */
export function pm25Icon(val) {
    if (isNaN(val) || val < 0)
        return "⚪";
    if (val <= 12.0)
        return "✅"; // Tốt (Good)
    if (val <= 35.4)
        return "⚠️"; // Trung bình / Nhạy cảm (Moderate)
    return "❌"; // Xấu / Nguy hại (Unhealthy)
}
/**
 * Đổi góc la bàn (0° - 360°) thành 16 hướng gió tiếng Việt chuẩn khí tượng.
 */
export function getWindDirection(deg) {
    if (typeof deg !== 'number' || isNaN(deg))
        return '';
    const normalized = ((deg % 360) + 360) % 360;
    if (normalized >= 348.75 || normalized < 11.25)
        return 'Bắc';
    if (normalized >= 11.25 && normalized < 33.75)
        return 'Bắc Đông Bắc';
    if (normalized >= 33.75 && normalized < 56.25)
        return 'Đông Bắc';
    if (normalized >= 56.25 && normalized < 78.75)
        return 'Đông Đông Bắc';
    if (normalized >= 78.75 && normalized < 101.25)
        return 'Đông';
    if (normalized >= 101.25 && normalized < 123.75)
        return 'Đông Đông Nam';
    if (normalized >= 123.75 && normalized < 146.25)
        return 'Đông Nam';
    if (normalized >= 146.25 && normalized < 168.75)
        return 'Nam Đông Nam';
    if (normalized >= 168.75 && normalized < 191.25)
        return 'Nam';
    if (normalized >= 191.25 && normalized < 213.75)
        return 'Nam Tây Nam';
    if (normalized >= 213.75 && normalized < 236.25)
        return 'Tây Nam';
    if (normalized >= 236.25 && normalized < 258.75)
        return 'Tây Tây Nam';
    if (normalized >= 258.75 && normalized < 281.25)
        return 'Tây';
    if (normalized >= 281.25 && normalized < 303.75)
        return 'Tây Tây Bắc';
    if (normalized >= 303.75 && normalized < 326.25)
        return 'Tây Bắc';
    if (normalized >= 326.25 && normalized < 348.75)
        return 'Bắc Tây Bắc';
    return 'Bắc';
}
/**
 * Tính toán toạ độ Bézier Spline mượt mà cho đồ thị nhiệt độ hàng giờ SVG.
 */
export function calculateSplinePoints(hourlyData, svgWidth = 500, svgHeight = 80, padding = 16) {
    if (!hourlyData || hourlyData.length === 0) {
        return { pathD: '', points: [] };
    }
    const temps = hourlyData.map(d => d.temp);
    const minTemp = Math.min(...temps);
    const maxTemp = Math.max(...temps);
    const tempRange = maxTemp === minTemp ? 1 : maxTemp - minTemp;
    const usableHeight = svgHeight - padding * 2;
    const stepX = (svgWidth - padding * 2) / Math.max(1, hourlyData.length - 1);
    const points = hourlyData.map((d, i) => {
        const x = padding + i * stepX;
        const y = svgHeight - padding - ((d.temp - minTemp) / tempRange) * usableHeight;
        return { x, y, temp: d.temp };
    });
    if (points.length === 1) {
        return { pathD: `M ${points[0].x} ${points[0].y}`, points };
    }
    let pathD = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
    for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[i === 0 ? 0 : i - 1];
        const p1 = points[i];
        const p2 = points[i + 1];
        const p3 = points[i + 2] || p2;
        const cp1x = p1.x + (p2.x - p0.x) / 6;
        const cp1y = p1.y + (p2.y - p0.y) / 6;
        const cp2x = p2.x - (p3.x - p1.x) / 6;
        const cp2y = p2.y - (p3.y - p1.y) / 6;
        pathD += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    }
    return { pathD, points };
}
// ─────────────────────────────────────────────────────────────────────────────
// LUỒNG 2: MARKET WATCH & FINANCIAL DATA FLOW
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Chuẩn hóa số tiền hoặc giá từ các chuỗi format khác nhau (VND, nghìn đồng, dấu chấm/phẩy).
 */
export function parseCurrencyValue(val) {
    if (val === null || val === undefined)
        return 0;
    if (typeof val === 'number')
        return isNaN(val) ? 0 : val;
    let str = String(val).trim();
    // Xử lý dấu chấm phân cách hàng nghìn kiểu Việt Nam: 85.500.000
    if (/\d+\.\d{3}(?:\.\d{3})*/.test(str)) {
        str = str.replace(/\./g, '');
    }
    else if (str.includes(',')) {
        // Xử lý dấu phẩy thập phân: 85,50 -> 85.5
        str = str.replace(/\./g, '').replace(',', '.');
    }
    const cleaned = str.replace(/[^0-9.-]/g, '').trim();
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
}
/**
 * Tính chênh lệch giá Mua - Bán (Spread) và tỷ lệ % chênh lệch.
 */
export function calculateSpread(buy, sell) {
    if (buy <= 0 || sell <= 0)
        return { spread: 0, spreadPercent: 0 };
    const spread = Math.round((sell - buy) * 100) / 100;
    const spreadPercent = Math.round(((sell - buy) / buy) * 10000) / 100;
    return { spread, spreadPercent };
}
/**
 * Format số tiền VND chuẩn đẹp hiển thị trên giao diện (ví dụ: 85.500.000 đ).
 */
export function formatVND(val) {
    if (isNaN(val))
        return '0 đ';
    return new Intl.NumberFormat('vi-VN').format(Math.round(val)) + ' đ';
}
/**
 * Tính toán biến động giá (tăng/giảm/đi ngang) giữa 2 phiên giao dịch.
 */
export function calculatePriceChange(current, previous) {
    if (!previous || previous <= 0) {
        return { diff: 0, diffPercent: 0, isUp: false, isDown: false, isFlat: true };
    }
    const diff = Math.round((current - previous) * 100) / 100;
    const diffPercent = Math.round((diff / previous) * 10000) / 100;
    return {
        diff,
        diffPercent,
        isUp: diff > 0,
        isDown: diff < 0,
        isFlat: diff === 0
    };
}
// ─────────────────────────────────────────────────────────────────────────────
// LUỒNG 3: RSS NEWS INGESTION & DEDUPLICATION FLOW
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Trích xuất khoá duy nhất (Canonical Key) cho bài báo để triệt tiêu bài trùng lặp.
 */
export function getUniqueKey(item) {
    if (!item)
        return Math.random().toString();
    if (item.link) {
        return item.link
            .split('?')[0]
            .split('#')[0]
            .replace(/^https?:\/\//i, '')
            .replace(/\/+$/, '')
            .toLowerCase();
    }
    if (item.title) {
        return item.title.trim().toLowerCase().replace(/[\s\-_]+/g, '-');
    }
    if (item.author) {
        return item.author.trim().toLowerCase();
    }
    return Math.random().toString();
}
/**
 * Thuật toán lọc khử trùng lặp tin tức theo Canonical Key.
 */
export function filterDeduplicatedNews(incomingItems, existingItems = []) {
    if (!incomingItems || !Array.isArray(incomingItems))
        return [];
    const existingSet = new Set(existingItems.map(getUniqueKey));
    const result = [];
    for (const item of incomingItems) {
        const key = getUniqueKey(item);
        if (!existingSet.has(key)) {
            existingSet.add(key);
            result.push(item);
        }
    }
    return result;
}
/**
 * Lọc tin tức theo danh mục chủ đề ("Tất cả", "Thời tiết", "Giá vàng",...).
 */
export function filterNewsByCategory(items, category) {
    if (!items || !Array.isArray(items))
        return [];
    if (!category || category === 'Tất cả' || category === 'all')
        return items;
    const catLower = category.toLowerCase().trim();
    return items.filter(item => {
        const itemCat = (item.category || '').toLowerCase().trim();
        return itemCat === catLower || itemCat.includes(catLower);
    });
}
/**
 * Phân trang cuộn vô cực an toàn (Slice pagination pool).
 */
export function paginateNews(pool, page, pageSize = 10) {
    if (!pool || !Array.isArray(pool))
        return { items: [], hasMore: false, total: 0 };
    const startIndex = 0;
    const endIndex = Math.min(pool.length, page * pageSize);
    const items = pool.slice(startIndex, endIndex);
    const hasMore = endIndex < pool.length;
    return { items, hasMore, total: pool.length };
}
/**
 * Chuẩn hóa và parse ngày giờ phát hành bài báo linh hoạt từ nhiều định dạng RSS:
 * - RFC822 4 chữ số: "Thu, 15 Oct 2026 12:36:39 +07:00"
 * - RFC822 2 chữ số (Thanh Niên): "Thu, 15 Oct 26 12:39:31 +0700"
 * - Tuổi Trẻ định dạng: "10/15/2026 11:00:00 AM"
 * - Tiếng Việt: "15/10/2026 11:30:00" hoặc "15-10-2026"
 * - ISO 8601: "2026-10-15T08:00:00Z"
 * Trả về timestamp mili-giây (0 nếu không parse được).
 */
export function parseFlexiblePubDate(dateStr) {
    if (!dateStr || typeof dateStr !== 'string')
        return 0;
    const trimmed = dateStr.trim();
    if (!trimmed)
        return 0;
    // 1. Thử trực tiếp Date.parse
    let ts = new Date(trimmed).getTime();
    if (!isNaN(ts) && ts > 0)
        return ts;
    // 2. Xử lý năm 2 chữ số trong RFC822 (ví dụ: 'Thu, 15 Oct 26 12:39:31 +0700')
    const rfc2DigitYear = trimmed.replace(/\b([A-Za-z]+),\s*(\d{1,2})\s+([A-Za-z]+)\s+(\d{2})\b/, (_m, dayName, d, mName, yy) => {
        const fullYear = parseInt(yy, 10) < 50 ? '20' + yy : '19' + yy;
        return `${dayName}, ${d} ${mName} ${fullYear}`;
    });
    ts = new Date(rfc2DigitYear).getTime();
    if (!isNaN(ts) && ts > 0)
        return ts;
    // 3. Khớp định dạng ngày tháng tiếng Việt: DD/MM/YYYY HH:mm:ss hoặc DD-MM-YYYY
    const vnMatch = trimmed.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})(?:\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/);
    if (vnMatch) {
        const d = parseInt(vnMatch[1], 10);
        const m = parseInt(vnMatch[2], 10) - 1;
        const y = parseInt(vnMatch[3], 10);
        const hh = parseInt(vnMatch[4] || '0', 10);
        const mm = parseInt(vnMatch[5] || '0', 10);
        const ss = parseInt(vnMatch[6] || '0', 10);
        return new Date(y, m, d, hh, mm, ss).getTime();
    }
    return 0;
}
/**
 * Kiểm tra xem một bài viết có tươi mới (trong vòng maxAgeDays ngày) hay không.
 * Mặc định: tối đa 7 ngày tính từ thời điểm đối chiếu (refTimeMs).
 * Nếu bài viết có ngày phát hành quá 7 ngày (hoặc từ năm 2024, 2025) -> Trả về false.
 */
export function isArticleFresh(article, maxAgeDays = 7, referenceTimeMs = Date.now()) {
    if (!article)
        return false;
    const ts = parseFlexiblePubDate(article.pubDate);
    if (ts <= 0) {
        // Nếu có tiêu đề hoặc link chứa năm cũ (2024, 2025, 2023...), triệt để loại bỏ!
        const textToCheck = `${article.title || ''} ${article.link || ''} ${article.pubDate || ''}`;
        if (/(?:202[0-5]|201\d)[\/\-_]?/i.test(textToCheck)) {
            return false;
        }
        // Không có ngày xuất bản -> Nếu không rõ ngày và không chứa dấu hiệu bài cũ, giữ lại để không chặn nhầm tin vừa cào
        return true;
    }
    const maxAgeMs = maxAgeDays * 24 * 60 * 60 * 1000;
    // Không chấp nhận bài viết trong tương lai quá 24h (do sai lệch timezone)
    if (ts > referenceTimeMs + 24 * 60 * 60 * 1000)
        return false;
    // Loại bỏ bài viết cũ hơn ngưỡng ngày quy định
    return (referenceTimeMs - ts) <= maxAgeMs;
}
/**
 * Bộ lọc và sắp xếp đảm bảo 100% độ tươi mới của tin tức:
 * 1. Triệt tiêu hoàn toàn các bài viết cũ hơn maxAgeDays (mặc định 7 ngày).
 * 2. Sắp xếp thứ tự bài viết mới nhất lên đầu (Newest first).
 * 3. Nếu hai bài xuất bản sát nhau (trong vòng 3 giờ), ưu tiên bài _isHot lên trước.
 */
export function filterAndSortFreshNews(items, maxAgeDays = 7, referenceTimeMs = Date.now()) {
    if (!items || !Array.isArray(items))
        return [];
    // 1. Lọc bỏ các bài cũ hơn ngưỡng ngày quy định
    const freshItems = items.filter(item => isArticleFresh(item, maxAgeDays, referenceTimeMs));
    // 2. Sắp xếp thời gian giảm dần (Mới nhất lên đầu)
    return freshItems.sort((a, b) => {
        const timeA = parseFlexiblePubDate(a.pubDate);
        const timeB = parseFlexiblePubDate(b.pubDate);
        // Nếu thời gian chênh lệch > 3 giờ, bài mới hơn luôn xếp trước
        if (Math.abs(timeB - timeA) > 3 * 3600 * 1000) {
            return timeB - timeA;
        }
        // Nếu thời gian phát hành sát nhau (trong vòng 3h), ưu tiên bài tin nóng
        if (a._isHot && !b._isHot)
            return -1;
        if (!a._isHot && b._isHot)
            return 1;
        return timeB - timeA;
    });
}
/**
 * Định dạng ngày giờ bài viết thân thiện với người đọc Việt Nam:
 * - Hôm nay: "Hôm nay, 12:30"
 * - Hôm qua: "Hôm qua, 09:15"
 * - Khác: "15/10/2026, 12:30"
 */
export function formatArticleDate(dateStr, refTime = Date.now()) {
    if (!dateStr || typeof dateStr !== 'string')
        return 'Vừa xong';
    const ts = parseFlexiblePubDate(dateStr);
    if (ts <= 0)
        return dateStr.split('T')[0] || dateStr;
    const d = new Date(ts);
    const now = new Date(refTime);
    const pad = (n) => (n < 10 ? '0' + n : '' + n);
    const timeStr = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
    // Kiểm tra cùng ngày
    const isToday = d.getDate() === now.getDate() &&
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear();
    if (isToday)
        return `Hôm nay, ${timeStr}`;
    // Kiểm tra hôm qua
    const yesterday = new Date(refTime - 24 * 60 * 60 * 1000);
    const isYesterday = d.getDate() === yesterday.getDate() &&
        d.getMonth() === yesterday.getMonth() &&
        d.getFullYear() === yesterday.getFullYear();
    if (isYesterday)
        return `Hôm qua, ${timeStr}`;
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}
/**
 * Định dạng ngày giờ xuất bản video trực quan cho Video Shorts.
 * Ví dụ: "Hôm nay, 14:30", "Hôm qua, 09:15", "13/10/2026"
 */
export function formatVideoDate(dateStr, refTime = Date.now()) {
    if (!dateStr)
        return '';
    return formatArticleDate(dateStr, refTime);
}
// ─────────────────────────────────────────────────────────────────────────────
// LUỒNG 4: NEWS FULL-TEXT PARSER & AVATAR GUARD FLOW
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Kiểm tra chuỗi văn bản là thẻ tag hoặc nút chia sẻ mạng xã hội để loại bỏ triệt để.
 * Ví dụ: "Chia sẻ", "Chi sẻ", "Chia sẻ qua Facebook", "Chia sẻ qua Twitter", "Chia sẻ qua Email", "#Quốc hội", "#cò mồi", "#trục lợi", "#đấu giá tài sản", "#Luật Đấu giá tài sản", v.v.
 */
export function isJunkOrTagContent(text) {
    if (!text)
        return true;
    // Giải mã các thực thể HTML phổ biến nếu có
    const decoded = text
        .replace(/&nbsp;/gi, ' ')
        .replace(/&#35;/gi, '#')
        .replace(/&amp;/gi, '&')
        .replace(/&quot;/gi, '"');
    const t = decoded.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    if (!t)
        return true;
    // 1. Toàn bộ Hashtag: bắt đầu bằng # hoặc chuỗi chứa các hashtag chính trị, pháp luật, đời sống
    if (t.startsWith('#'))
        return true;
    if (/^#[\s\S]+/u.test(t))
        return true;
    if (t.includes('#')) {
        // Nếu chuỗi chứa hashtag (#Quốc hội, #cò mồi, #trục lợi, #đấu giá tài sản, #Luật Đấu giá tài sản...)
        const withoutTags = t.replace(/#[\p{L}\d\s_\-]+/gu, '').replace(/[,;.\-]/g, '').trim();
        if (!withoutTags || withoutTags.length < 25)
            return true;
    }
    // Bổ sung nhận diện danh sách từ khóa thẻ bài viết đơn lẻ
    if (/^(quốc hội|cò mồi|trục lợi|đấu giá tài sản|luật đấu giá tài sản|tin nóng|thời sự)$/i.test(t))
        return true;
    const lower = t.toLowerCase();
    // 2. Chia sẻ / Chi sẻ qua các kênh mạng xã hội:
    if (lower === 'chia sẻ' || lower === 'chi sẻ' || lower === 'share' || lower === 'chia se' || lower === 'chi se')
        return true;
    if (/^(chia\s*sẻ|chi\s*sẻ|chia\s*se|chi\s*se|share)\b/i.test(lower))
        return true;
    if (/^(chia\s*sẻ|chi\s*sẻ|chia\s*se|chi\s*se|share)\s*(qua|lên|với|tới|bài viết|liên kết|ngay|trên|:)?/i.test(lower))
        return true;
    if (/(chia\s*sẻ|chi\s*sẻ|chia\s*se|chi\s*se)\s+(qua|lên|bài|với|trên)\s+(facebook|twitter|email|zalo|messenger|threads|linkedin|mạng xã hội)/i.test(lower))
        return true;
    if (/(chia\s*sẻ|chi\s*sẻ|chia\s*se|chi\s*se)\s+qua\s+(facebook|twitter|email|zalo)/i.test(lower))
        return true;
    if (/chia\s*sẻ\s+qua/i.test(lower))
        return true;
    if (/chi\s*sẻ\s+qua/i.test(lower))
        return true;
    if (/^(facebook|twitter|zalo|email|copy link|sao chép liên kết)$/i.test(lower))
        return true;
    // 3. Thẻ tags & Chủ đề:
    if (/^(thẻ|từ khóa|tags?|chủ đề|nhãn|chuyên mục)\s*[:\-]/i.test(lower))
        return true;
    if (/^(tag|tags|_tag|article__tag)\b/i.test(lower))
        return true;
    return false;
}
/**
 * Kiểm tra phần tử DOM là thẻ tag hoặc thanh chia sẻ mạng xã hội.
 * Nếu phát hiện trên trang chính có thẻ "article__tag" hoặc có "_tag"; "tag" thì không lấy.
 * Nếu phát hiện có "Chia sẻ" / "Chi sẻ" qua các kênh thì cũng loại bỏ không hiển thị ra.
 */
export function isTagOrShareElement(el) {
    if (!el)
        return false;
    const tag = String(el.tagName || '').toLowerCase();
    if (tag === 'tag' || tag === 'tags' || tag === 'article-tag')
        return true;
    const cls = (typeof el.className === 'string' ? el.className : (el.classList ? Array.from(el.classList).join(' ') : '')).toLowerCase();
    const id = String(el.id || '').toLowerCase();
    const href = String(el.getAttribute ? (el.getAttribute('href') || '') : (el.href || '')).toLowerCase();
    const rel = String(el.getAttribute ? (el.getAttribute('rel') || '') : (el.rel || '')).toLowerCase();
    // 1. Kiểm tra phần tử cha (ancestor) có thuộc khối tag hoặc share không
    try {
        if (el.closest) {
            const parentTag = el.closest(`
        [class*="article__tag"], [class*="_tag"], [class*="tag"], [id*="tag"],
        [class*="share"], [id*="share"], [class*="social"], [id*="social"],
        [class*="chia-se"], [class*="chiase"], [class*="chi-se"], [id*="chia-se"], [id*="chiase"]
      `);
            if (parentTag)
                return true;
        }
    }
    catch { }
    // 2. Yêu cầu: "Nếu phát hiện trên trang chính có thẻ 'article__tag' hoặc có '_tag'; 'tag' thì không lấy"
    if (cls.includes('article__tag') ||
        cls.includes('_tag') ||
        cls.includes('tag') ||
        id.includes('article__tag') ||
        id.includes('_tag') ||
        id.includes('tag') ||
        rel === 'tag' ||
        href.includes('/tag/') ||
        href.includes('/tags/') ||
        href.includes('/tu-khoa/') ||
        href.includes('_tag') ||
        href.includes('article__tag')) {
        return true;
    }
    // 3. Yêu cầu: "Nếu phát hiện có 'Chia sẻ' qua các kênh thì cũng loại bỏ không hiển thị ra"
    if (cls.includes('share') ||
        cls.includes('chia-se') ||
        cls.includes('chiase') ||
        cls.includes('chi-se') ||
        cls.includes('social') ||
        id.includes('share') ||
        id.includes('chia-se') ||
        id.includes('chiase') ||
        id.includes('chi-se') ||
        id.includes('social') ||
        href.includes('facebook.com/sharer') ||
        href.includes('twitter.com/intent/tweet') ||
        href.includes('zalo.me/share') ||
        href.startsWith('mailto:?subject=')) {
        return true;
    }
    // 4. Kiểm tra trực tiếp nội dung văn bản bên trong phần tử
    const text = (el.textContent || '').trim();
    if (text && isJunkOrTagContent(text)) {
        return true;
    }
    return false;
}
/**
 * Kiểm tra xem một kênh YouTube có phải là kênh mẫu / mock cũ cần loại bỏ triệt để hay không.
 * Các kênh mẫu cũ: WaveMusic, Kimpro, Jay Prehistoric Pets, Pinkfong, Baby Shark, J House, An#...
 */
export function isMockChannel(channel) {
    if (!channel)
        return false;
    const title = (channel?.snippet?.title || channel?.title || channel?.name || '').toLowerCase();
    const customUrl = (channel?.snippet?.customUrl || channel?.customUrl || '').toLowerCase();
    const id = String(channel?.id || channel?.snippet?.resourceId?.channelId || '').toLowerCase();
    const desc = (channel?.snippet?.description || channel?.description || '').toLowerCase();
    const mockKeywords = [
        'wavemusic', 'wave music', 'kimpro', '김프로', 'jay prehistoric', 'jaypets',
        'vietsuccess', 'baby shark', 'pinkfong', 'cá mập con', 'j house', 'jhouse', 'an#', 'anmusic',
        'acoustic guitar', 'an acoustic', 'an music', 'uc_anmusic96'
    ];
    return mockKeywords.some(kw => title.includes(kw) || customUrl.includes(kw) || id.includes(kw) || desc.includes(kw));
}
/**
 * Kiểm tra xem một video YouTube có phải là video mẫu / mock cũ (ví dụ: An# Acoustic Guitar, Baby Shark, WaveMusic...)
 * cần loại bỏ triệt để khỏi hệ thống hay không.
 */
export function isMockVideo(item) {
    if (!item)
        return false;
    const channel = String(item.channel || item.channelTitle || '').toLowerCase();
    const title = String(item.title || '').toLowerCase();
    const id = String(item.id || '').toLowerCase();
    const youtubeId = String(item.youtubeId || '').toLowerCase();
    const channelId = String(item.channelId || '').toLowerCase();
    const category = String(item.category || '').toLowerCase();
    const subCategory = String(item.subCategory || '').toLowerCase();
    const mockKeywords = [
        'wavemusic', 'wave music', 'kimpro', '김프로', 'jay prehistoric', 'jaypets',
        'vietsuccess', 'baby shark', 'pinkfong', 'cá mập con', 'j house', 'jhouse',
        'an#', 'anmusic', 'acoustic guitar', 'tfkz_9pl1um', 'xqzsoesa55w', '60ithlz5wea',
        'fkopy74weus', '2vv-bfvoq4g', '7u_cm_8n5te', 'an acoustic', 'giai điệu nhẹ nhàng',
        'thư giãn buổi tối', 'an_music', 'uc_anmusic96'
    ];
    return mockKeywords.some(kw => channel.includes(kw) ||
        title.includes(kw) ||
        id.includes(kw) ||
        youtubeId.includes(kw) ||
        channelId.includes(kw) ||
        category.includes(kw) ||
        subCategory.includes(kw));
}
/**
 * Kiểm tra chuỗi văn bản rác hoặc banner quảng cáo để loại bỏ khỏi thân bài.
 */
export function isBoilerplate(text) {
    if (!text)
        return true;
    if (isJunkOrTagContent(text))
        return true;
    const t = text.toLowerCase().trim();
    if (t.length === 0)
        return true;
    if (t === 'đọc tiếp về trang chủ đề' ||
        t.includes('về trang chủ đề') ||
        t === 'trở lại chủ đề' ||
        t === 'đọc tiếp')
        return true;
    if (/^(đọc tiếp|về trang chủ đề|trở lại chủ đề|chủ đề:|từ khóa:|xem thêm|tin liên quan|bài viết liên quan|nguồn:)/i.test(t))
        return true;
    if (/^theo\s+(nguồn|dân trí|tiền phong|vnexpress|thanh niên|tuổi trẻ|vtv|lao động|báo)/i.test(t))
        return true;
    if (/^(bình luận|chia sẻ qua facebook|zalo|copy link|tải app|quảng cáo)/i.test(t))
        return true;
    return false;
}
/**
 * Bộ bảo vệ hai lớp (Dual-layer Guard): Nhận diện ảnh avatar tác giả để Byline Bar hiển thị nhỏ
 * và triệt tiêu lỗi phóng to avatar thành ảnh bài viết trong thân bài.
 */
export function isAuthorAvatar(imgEl, captionText = '', imgSrc = '', authorName = '') {
    if (!imgEl)
        return false;
    const cls = (typeof imgEl.className === 'string' ? imgEl.className : (imgEl.classList ? Array.from(imgEl.classList).join(' ') : '')) || '';
    const alt = (imgEl.getAttribute ? imgEl.getAttribute('alt') : imgEl.alt) || '';
    const src = imgSrc || (imgEl.getAttribute ? (imgEl.getAttribute('src') || imgEl.getAttribute('data-src')) : imgEl.src) || '';
    const w = imgEl.getAttribute ? (imgEl.getAttribute('width') || imgEl.width) : imgEl.width;
    const h = imgEl.getAttribute ? (imgEl.getAttribute('height') || imgEl.height) : imgEl.height;
    const cleanCap = (captionText || '').trim().toLowerCase();
    const cleanAlt = String(alt).trim().toLowerCase();
    const cleanAuth = String(authorName).trim().toLowerCase();
    // 1. Khớp tên tác giả trong caption hoặc alt text
    if (cleanAuth && (cleanCap === cleanAuth || cleanCap.includes(cleanAuth) || cleanAlt === cleanAuth || cleanAlt.includes(cleanAuth))) {
        return true;
    }
    // 2. Class định danh avatar tròn nhỏ
    if (/dt-rounded-full|rounded-full|avatar|author-avatar|author-img/i.test(cls)) {
        return true;
    }
    // 3. Kích thước hình học nhỏ vuông (24px, 36px, 48px)
    if (String(w) === '24' || String(w) === '36' || String(w) === '48' || String(h) === '24' || String(h) === '36' || String(h) === '48') {
        return true;
    }
    // 4. URL chứa dấu hiệu avatar thu nhỏ của các CMS báo điện tử
    if (/zoom\/(?:24|36|48)_(?:24|36|48)|avatar|author|thumb_w\/40|\/tac-gia\//i.test(src)) {
        return true;
    }
    // 5. Nằm trong vùng chứa thông tin tác giả
    if (typeof imgEl.closest === 'function') {
        if (imgEl.closest('[rel="author"], [href*="/tac-gia/"], [data-content-piece*="author"]')) {
            return true;
        }
    }
    return false;
}
// ─────────────────────────────────────────────────────────────────────────────
// LUỒNG 5: VIDEO SHORTS & SMART TV LOGIC FLOW
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Kiểm tra định dạng YouTube ID chuẩn 11 ký tự Base64URL.
 */
export function validateYouTubeId(id) {
    if (!id || typeof id !== 'string')
        return false;
    return /^[a-zA-Z0-9_-]{11}$/.test(id.trim());
}
/**
 * Kiểm tra video có thuộc kênh truyền hình đang chọn hay không.
 */
export function matchesChannel(item, channelId) {
    if (!item)
        return false;
    if (!channelId || channelId === 'all')
        return true;
    const chLower = (item.channel || '').toLowerCase();
    const titleLower = (item.title || '').toLowerCase();
    switch (channelId) {
        case 'vtv24':
            return chLower.includes('vtv24') || (chLower.includes('vtv') && !chLower.includes('thời tiết'));
        case 'tienphong':
            return chLower.includes('tiền phong') || chLower.includes('tienphong') || titleLower.includes('tiền phong');
        case 'thanhnien':
            return chLower.includes('thanh niên') || chLower.includes('thanh nien') || titleLower.includes('thanh niên');
        case 'tuoitre':
            return chLower.includes('tuổi trẻ') || chLower.includes('tuoi tre') || titleLower.includes('tuổi trẻ');
        case 'vtcnow':
            return chLower.includes('vtc');
        case 'laodong':
            return chLower.includes('lao động') || chLower.includes('lao dong') || titleLower.includes('lao động');
        case 'thoitiet':
            return chLower.includes('thời tiết') || item.category === 'Thời tiết TV' || item.badge === 'THỜI TIẾT';
        case 'antv':
            return chLower.includes('antv') || chLower.includes('công an') || titleLower.includes('antv');
        case 'vnexpress':
            return chLower.includes('vnexpress') || titleLower.includes('vnexpress');
        case 'dantri':
            return chLower.includes('dân trí') || chLower.includes('dan tri') || titleLower.includes('dân trí');
        default:
            return false;
    }
}
/**
 * Tạo playlist theo kênh với cơ chế chống rỗng (Empty Playlist Prevention).
 */
export function generateChannelPlaylist(allShorts, channelId, fallbackShorts = []) {
    if (!allShorts || allShorts.length === 0)
        return fallbackShorts;
    if (!channelId || channelId === 'all')
        return allShorts;
    const filtered = allShorts.filter(item => matchesChannel(item, channelId));
    if (filtered.length > 0)
        return filtered;
    // Empty Playlist Prevention: Thử tìm trong fallbackShorts
    const fallbackFiltered = fallbackShorts.filter(item => matchesChannel(item, channelId));
    if (fallbackFiltered.length > 0)
        return fallbackFiltered;
    // Nếu vẫn rỗng, trả về toàn bộ allShorts để người dùng không bị kẹt màn hình đen
    return allShorts;
}
/**
 * Kiểm tra mã lỗi phát lại YouTube có thuộc diện tự động bỏ qua (Auto-Recovery) hay không.
 * Mã 100: Video không tồn tại / riêng tư.
 * Mã 101 / 150: Chủ sở hữu cấm phát trên trình duyệt nhúng.
 */
export function shouldAutoRecoverOnPlaybackError(errorCode) {
    return [100, 101, 150].includes(errorCode);
}
/**
 * Tính toán trạng thái hiển thị của thanh điều khiển Shorts (ẩn sau 5000ms không hoạt động).
 */
export function calculateControlsVisibility(lastInteractionTime, nowTime, timeoutMs = 5000) {
    if (lastInteractionTime <= 0)
        return true;
    return nowTime - lastInteractionTime < timeoutMs;
}
// ─────────────────────────────────────────────────────────────────────────────
// LUỒNG 6: AUTH, AUTHORIZATION & ROUTING FLOW
// ─────────────────────────────────────────────────────────────────────────────
const ADMIN_EMAIL = 'mrkun28@gmail.com';
/**
 * Kiểm tra đặc quyền quản trị viên QA Dashboard cho tài khoản mrkun28@gmail.com.
 * Nghiêm ngặt: Khách vãng lai và tài khoản khác luôn trả về false.
 */
export function isUserAdminQA(userOrRole) {
    if (userOrRole) {
        if (typeof userOrRole === 'object' && userOrRole.email === ADMIN_EMAIL)
            return true;
        if (typeof userOrRole === 'string' && userOrRole.toLowerCase() === ADMIN_EMAIL)
            return true;
    }
    // Kiểm tra bộ nhớ localStorage nếu đang chạy trên browser
    if (typeof window !== 'undefined' && window.localStorage) {
        try {
            const cached = window.localStorage.getItem('user_auth');
            if (cached) {
                const parsed = JSON.parse(cached);
                if (parsed?.email === ADMIN_EMAIL)
                    return true;
            }
        }
        catch {
            // Ignored
        }
    }
    return false;
}
/**
 * Phân giải URL QA Dashboard tương thích cả Localhost và GitHub Pages subpath.
 */
export function getDashboardUrl(pathname = '', hostname = '') {
    if (typeof window !== 'undefined') {
        if (window.location.hostname.includes('github.io') || window.location.pathname.includes('/Website_thoitiet_design')) {
            const origin = window.location.origin || '';
            return `${origin}/Website_thoitiet_design/dashboard.html`;
        }
        const origin = window.location.origin || '';
        return `${origin}/dashboard.html`;
    }
    const isGh = hostname.includes('github.io') || pathname.includes('/Website_thoitiet_design');
    return isGh ? '/Website_thoitiet_design/dashboard.html' : '/dashboard.html';
}
// ─────────────────────────────────────────────────────────────────────────────
// LUỒNG 7: CALENDAR, DATES & UTILITIES FLOW
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Tính số ngày trong tháng chính xác tuyệt đối, bao gồm kiểm tra năm nhuận tháng 2.
 * (month: 0-indexed, 0 = Tháng 1 ... 1 = Tháng 2 ... 11 = Tháng 12)
 */
export function getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
}
/**
 * Tính thứ của ngày đầu tiên trong tháng (0 = Chủ Nhật, 1 = Thứ Hai, ... 6 = Thứ Bảy).
 */
export function getFirstDayOfMonth(year, month) {
    return new Date(year, month, 1).getDay();
}
/**
 * Giải mã các thực thể HTML đặc thù (&amp;, &lt;, &gt;, &quot;, &#39;, &nbsp;) và CDATA blocks.
 */
export function decodeHTMLEntities(text) {
    if (!text)
        return '';
    let decoded = text.replace(/<!\[CDATA\[(.*?)\]\]>/gs, '$1');
    if (typeof DOMParser !== 'undefined') {
        try {
            const doc = new DOMParser().parseFromString(decoded, 'text/html');
            doc.querySelectorAll('script, style, noscript, iframe').forEach(el => el.remove());
            decoded = doc.body.textContent || '';
            if (decoded.includes('&')) {
                const doc2 = new DOMParser().parseFromString(decoded, 'text/html');
                doc2.querySelectorAll('script, style, noscript, iframe').forEach(el => el.remove());
                decoded = doc2.body.textContent || '';
            }
            return decoded;
        }
        catch {
            // Fallback below
        }
    }
    return decoded
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&apos;/g, "'")
        .replace(/&nbsp;/g, ' ')
        .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)));
}
export const VIETNAM_PROVINCES = [
    // Miền Bắc
    { id: 'ha-noi', name: 'Hà Nội', region: 'Bac', temp: 28, condition: 'nang', humidity: 65, windSpeed: 14, windDeg: 45, pm25: 38.5, uvIndex: 6.5 },
    { id: 'hai-phong', name: 'Hải Phòng', region: 'Bac', temp: 27, condition: 'nang', humidity: 70, windSpeed: 22, windDeg: 90, pm25: 22.0, uvIndex: 6.0 },
    { id: 'quang-ninh', name: 'Quảng Ninh', region: 'Bac', temp: 26, condition: 'am-u', humidity: 75, windSpeed: 18, windDeg: 60, pm25: 18.2, uvIndex: 5.2 },
    { id: 'lao-cai', name: 'Lào Cai (Sa Pa)', region: 'Bac', temp: 19, condition: 'am-u', humidity: 88, windSpeed: 8, windDeg: 0, pm25: 8.5, uvIndex: 4.0 },
    { id: 'lang-son', name: 'Lạng Sơn', region: 'Bac', temp: 23, condition: 'binh-thuong', humidity: 68, windSpeed: 12, windDeg: 30, pm25: 15.0, uvIndex: 5.5 },
    // Miền Trung
    { id: 'da-nang', name: 'Đà Nẵng', region: 'Trung', temp: 30, condition: 'nang', humidity: 60, windSpeed: 16, windDeg: 120, pm25: 14.5, uvIndex: 8.2 },
    { id: 'hue', name: 'Thừa Thiên Huế', region: 'Trung', temp: 29, condition: 'binh-thuong', humidity: 72, windSpeed: 10, windDeg: 110, pm25: 16.0, uvIndex: 7.8 },
    { id: 'nha-trang', name: 'Nha Trang (Khánh Hòa)', region: 'Trung', temp: 31, condition: 'nang', humidity: 62, windSpeed: 18, windDeg: 135, pm25: 11.2, uvIndex: 9.0 },
    { id: 'vinh', name: 'Vinh (Nghệ An)', region: 'Trung', temp: 28, condition: 'am-u', humidity: 78, windSpeed: 15, windDeg: 80, pm25: 26.0, uvIndex: 6.0 },
    { id: 'quy-nhon', name: 'Quy Nhơn (Bình Định)', region: 'Trung', temp: 30, condition: 'nang', humidity: 64, windSpeed: 17, windDeg: 140, pm25: 12.8, uvIndex: 8.5 },
    // Tây Nguyên
    { id: 'da-lat', name: 'Đà Lạt (Lâm Đồng)', region: 'TayNguyen', temp: 21, condition: 'binh-thuong', humidity: 82, windSpeed: 11, windDeg: 200, pm25: 7.2, uvIndex: 6.8 },
    { id: 'pleiku', name: 'Pleiku (Gia Lai)', region: 'TayNguyen', temp: 25, condition: 'nang', humidity: 58, windSpeed: 16, windDeg: 220, pm25: 10.5, uvIndex: 7.5 },
    { id: 'buon-ma-thuot', name: 'Buôn Ma Thuột (Đắk Lắk)', region: 'TayNguyen', temp: 27, condition: 'nang', humidity: 55, windSpeed: 14, windDeg: 210, pm25: 13.0, uvIndex: 8.0 },
    // Miền Nam
    { id: 'tp-ho-chi-minh', name: 'TP. Hồ Chí Minh', region: 'Nam', temp: 33, condition: 'nang-gat', humidity: 72, windSpeed: 15, windDeg: 180, pm25: 42.0, uvIndex: 10.5 },
    { id: 'can-tho', name: 'Cần Thơ', region: 'Nam', temp: 32, condition: 'nang', humidity: 75, windSpeed: 12, windDeg: 190, pm25: 19.5, uvIndex: 9.8 },
    { id: 'vung-tau', name: 'Bà Rịa - Vũng Tàu', region: 'Nam', temp: 30, condition: 'nang', humidity: 68, windSpeed: 24, windDeg: 160, pm25: 15.0, uvIndex: 9.2 },
    { id: 'ca-mau', name: 'Cà Mau', region: 'Nam', temp: 31, condition: 'mua-nho', humidity: 85, windSpeed: 19, windDeg: 200, pm25: 11.0, uvIndex: 7.0 },
];
/**
 * Tìm kiếm tỉnh thành hỗ trợ có dấu và không dấu.
 */
export function searchProvinces(query, list = VIETNAM_PROVINCES) {
    if (!query || !query.trim())
        return list;
    const q = removeVietnameseTones(query.trim().toLowerCase());
    return list.filter(p => {
        const nameNorm = removeVietnameseTones(p.name.toLowerCase());
        const idNorm = p.id.toLowerCase();
        return nameNorm.includes(q) || idNorm.includes(q);
    });
}
function removeVietnameseTones(str) {
    return str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'd');
}
/**
 * Tính chỉ số nhiệt độ cảm nhận (Heat Index) theo công thức chuẩn NOAA của Hoa Kỳ.
 * Nhận vào: tempC (độ Celsius), humidity (độ ẩm tương đối %).
 * Trả về: Heat Index (°C) làm tròn 1 chữ số thập phân.
 */
export function calculateNOAAHeatIndex(tempC, humidity) {
    if (tempC < 20 || isNaN(tempC) || isNaN(humidity))
        return tempC;
    const tF = tempC * 1.8 + 32;
    const rh = Math.max(0, Math.min(100, humidity));
    let hiF = 0.5 * (tF + 61.0 + (tF - 68.0) * 1.2 + rh * 0.094);
    if (hiF >= 80) {
        hiF =
            -42.379 +
                2.04901523 * tF +
                10.14333127 * rh -
                0.22475541 * tF * rh -
                0.00683783 * tF * tF -
                0.05481717 * rh * rh +
                0.00122874 * tF * tF * rh +
                0.00085282 * tF * rh * rh -
                0.00000199 * tF * tF * rh * rh;
        // Hiệu chỉnh nếu độ ẩm thấp
        if (rh < 13 && tF >= 80 && tF <= 112) {
            const adj = ((13 - rh) / 4) * Math.sqrt((17 - Math.abs(tF - 95)) / 17);
            hiF -= adj;
        }
        // Hiệu chỉnh nếu độ ẩm cao
        else if (rh > 85 && tF >= 80 && tF <= 87) {
            const adj = ((rh - 85) / 10) * ((87 - tF) / 5);
            hiF += adj;
        }
    }
    const hiC = (hiF - 32) / 1.8;
    return Math.round(hiC * 10) / 10;
}
export function getHeatIndexSeverity(heatIndexC) {
    if (heatIndexC < 27)
        return { level: 'SAFE', label: 'An toàn', color: '#10b981' };
    if (heatIndexC < 32)
        return { level: 'CAUTION', label: 'Chú ý: Cần bổ sung nước', color: '#f59e0b' };
    if (heatIndexC < 41)
        return { level: 'EXTREME_CAUTION', label: 'Đặc biệt chú ý: Dễ kiệt sức vì nóng', color: '#ea580c' };
    if (heatIndexC < 54)
        return { level: 'DANGER', label: 'Nguy hiểm: Nguy cơ sốc nhiệt cao', color: '#ef4444' };
    return { level: 'EXTREME_DANGER', label: 'Cực kỳ nguy hiểm: Đột quỵ nhiệt', color: '#7f1d1d' };
}
// ─────────────────────────────────────────────────────────────────────────────
// LUỒNG 9: RSS HEALTH MONITOR & PROXY AUTO-FAILOVER (REQ-032)
// ─────────────────────────────────────────────────────────────────────────────
export const PROXY_PROVIDERS = [
    'https://api.allorigins.win/raw?url=',
    'https://corsproxy.io/?',
    'https://api.codetabs.com/v1/proxy?quest=',
    'https://thingproxy.freeboard.io/fetch/'
];
export function buildProxyUrlWithFailover(rawUrl, failoverIndex = 0) {
    if (!rawUrl)
        return '';
    const idx = Math.abs(failoverIndex) % PROXY_PROVIDERS.length;
    const prefix = PROXY_PROVIDERS[idx];
    return `${prefix}${encodeURIComponent(rawUrl)}`;
}
export function evaluateFeedHealth(latencyMs, statusCode) {
    if (statusCode !== 200)
        return { isHealthy: false, rating: 'FAIL' };
    if (latencyMs <= 1500)
        return { isHealthy: true, rating: 'GOOD' };
    if (latencyMs <= 4500)
        return { isHealthy: true, rating: 'SLOW' };
    return { isHealthy: false, rating: 'FAIL' };
}
// ─────────────────────────────────────────────────────────────────────────────
// LUỒNG 10: STRICT HTML SANITIZATION & CONTENT SECURITY GUARD (REQ-033)
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Vệ sinh sạch sẽ HTML bài báo cào từ Internet, loại bỏ triệt để mã độc XSS, iframe, scripts.
 */
export function sanitizeArticleContent(rawHtml) {
    if (!rawHtml)
        return '';
    let sanitized = rawHtml;
    // 1. Loại bỏ các thẻ nguy hiểm hoàn toàn
    sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    sanitized = sanitized.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
    sanitized = sanitized.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
    sanitized = sanitized.replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '');
    sanitized = sanitized.replace(/<embed\b[^>]*>/gi, '');
    sanitized = sanitized.replace(/<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi, '');
    sanitized = sanitized.replace(/<input\b[^>]*>/gi, '');
    sanitized = sanitized.replace(/<button\b[^<]*(?:(?!<\/button>)<[^<]*)*<\/button>/gi, '');
    // 2. Loại bỏ các thuộc tính thực thi JavaScript nguy hại
    sanitized = sanitized.replace(/\son\w+\s*=\s*(['"]).*?\1/gi, '');
    sanitized = sanitized.replace(/\son\w+\s*=\s*[^>\s]+/gi, '');
    sanitized = sanitized.replace(/href\s*=\s*(['"])\s*javascript:.*?\1/gi, 'href="#"');
    sanitized = sanitized.replace(/src\s*=\s*(['"])\s*javascript:.*?\1/gi, 'src=""');
    // 3. Vô hiệu hóa position: fixed hoặc z-index cao trong inline styles
    sanitized = sanitized.replace(/position\s*:\s*fixed/gi, 'position: relative');
    sanitized = sanitized.replace(/z-index\s*:\s*\d+/gi, 'z-index: 1');
    return sanitized.trim();
}
export function saveArticleBookmark(article, existingList = []) {
    if (!article || !article.title)
        return existingList;
    const id = article.id || article.link || article.title;
    const filtered = existingList.filter(item => item.id !== id);
    const newItem = {
        id,
        title: article.title,
        link: article.link || '#',
        source: article.source || 'Tin tức',
        savedAt: Date.now(),
        imageUrl: article.imageUrl || article.image,
    };
    return [newItem, ...filtered];
}
export function removeArticleBookmark(articleId, existingList = []) {
    if (!articleId)
        return existingList;
    return existingList.filter(item => item.id !== articleId);
}
export function isArticleBookmarked(articleId, existingList = []) {
    if (!articleId || !existingList)
        return false;
    return existingList.some(item => item.id === articleId);
}
export function resolveOfflineResilience(isOnline, liveArticles, cachedArticles) {
    if (isOnline && liveArticles && liveArticles.length > 0) {
        return {
            isOnline: true,
            statusLabel: 'Trực tuyến • Tin tức thời gian thực',
            displayArticlesCount: liveArticles.length,
            isUsingOfflineCache: false,
        };
    }
    // Mất mạng nhưng có dữ liệu đệm cache
    const count = (cachedArticles && cachedArticles.length > 0) ? cachedArticles.length : liveArticles.length;
    return {
        isOnline: isOnline,
        statusLabel: 'Chế độ Ngoại tuyến • Đọc dữ liệu đã lưu trữ',
        displayArticlesCount: count,
        isUsingOfflineCache: true,
    };
}
// ─────────────────────────────────────────────────────────────────────────────
// LUỒNG 13 - 17: SECURITY SHIELD & API CYBER DEFENSE (REQ-038 -> REQ-042)
// ─────────────────────────────────────────────────────────────────────────────
export { validateSafeFetchUrl, checkRateLimit, resetRateLimits, detectMaliciousPayload, sanitizeSearchQuery, validatePayloadSizeAndDepth, validateApiResponseSchema, verifyRequestIntegrity, resetNonceStore, evaluateSecurityHeaders } from './securityShield.js';
// ─────────────────────────────────────────────────────────────────────────────
// LUỒNG 18 - 20: CRYPTOGRAPHIC VAULT & ADMIN DATA PROTECTION (REQ-043 -> REQ-045)
// ─────────────────────────────────────────────────────────────────────────────
export { encryptVaultData, decryptVaultData, isAuthorizedManager, verifyMasterKey, unlockSystemVault, lockSystemVault, isVaultUnlocked, getUnlockedVaultData, maskSensitiveRecord, scanContentForSecretLeaks, ENCRYPTED_SYSTEM_VAULT, ENVELOPE_PREFIX as VAULT_ENVELOPE_PREFIX, AUTHORIZED_ADMIN_EMAIL as VAULT_ADMIN_EMAIL } from './cryptoVault.js';
// ─────────────────────────────────────────────────────────────────────────────
// LUỒNG 21: BÓC TÁCH & PHÁT VIDEO BÁO CHÍ CHÍNH THỐNG (REQ-046)
// ─────────────────────────────────────────────────────────────────────────────
export { extractArticleVideos, isTrustedNewsVideoDomain, buildSafeVideoEmbedUrl, TRUSTED_NEWS_VIDEO_DOMAINS } from './articleVideoEngine.js';
// ─────────────────────────────────────────────────────────────────────────────
// LUỒNG 22: ĐỘNG CƠ AI VIENEU-TTS ĐỌC BÀI BÁO KHÔNG ĐỌC TIÊU ĐỀ (REQ-047)
// ─────────────────────────────────────────────────────────────────────────────
export { extractContentForVieNeuTTS, extractArticleContentDetailed, normalizeVietnameseTextVieNeu, splitVieNeuAudioChunks, buildVieNeuAudioUrl, getVieNeuApiBaseUrl, resolveVieNeuVoice, getCharacterVoiceModulation, formatAudioTime, fetchBackendTTSVoices, requestBackendArticleTTS, pollTTSJob, VIENEU_VOICES, VIENEU_SPEED_OPTIONS, VIENEU_CENTRAL_CONFIG, computeVieNeuAudioCacheKey, VieNeuTTSController, getVieNeuTTSV3TurboSpecs, buildVieNeuOpenAISpeechPayload } from './vieneuTTS.js';
