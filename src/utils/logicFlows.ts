/**
 * CORE BUSINESS LOGIC & DATA FLOW UTILITIES
 * =============================================================================
 * Phân hệ xử lý dữ liệu nghiệp vụ chuẩn hóa cho toàn bộ hệ thống Weather & News App.
 * Đảm bảo 100% tính vẹn toàn, chạy độc lập và có thể kiểm thử tự động (Unit & Integration).
 */

export type ConditionKey = "binh-thuong" | "nang" | "nang-gat" | "am-u" | "mua-nho" | "mua-dong";

// ─────────────────────────────────────────────────────────────────────────────
// LUỒNG 1: WEATHER LOGIC & CALCULATIONS FLOW
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Nhận diện condition key từ nhãn thời tiết người dùng hoặc OpenWeather/CWB API.
 */
export function detectConditionKey(conditionLabel: string): ConditionKey {
  if (!conditionLabel) return "binh-thuong";
  const s = conditionLabel.toLowerCase().trim();
  if (s.includes("dông") || s.includes("dong") || s.includes("bão") || s.includes("sấm") || s.includes("thunder")) return "mua-dong";
  if (s.includes("mưa") || s.includes("mua") || s.includes("rain") || s.includes("drizzle")) return "mua-nho";
  if (s.includes("nắng gắt") || s.includes("nang gat") || s.includes("nắng nóng") || s.includes("extreme heat")) return "nang-gat";
  if (s.includes("nắng") || s.includes("nang") || s.includes("clear") || s.includes("sun")) return "nang";
  if (s.includes("âm u") || s.includes("am u") || s.includes("mây") || s.includes("cloud") || s.includes("sương mù") || s.includes("fog")) return "am-u";
  return "binh-thuong";
}

/**
 * Ánh xạ trạng thái từ Worker / Bot tự động sang ConditionKey chuẩn giao diện.
 */
export function mapBotStatusToCondKey(status: string): ConditionKey {
  if (!status) return "binh-thuong";
  const s = status.toUpperCase().trim();
  if (s === "MUA_BAO" || s === "MUA_DONG" || s === "THUNDERSTORM") return "mua-dong";
  if (s === "MUA_NHO" || s === "MUA_NHE" || s === "MUA_RAO" || s === "RAIN") return "mua-nho";
  if (s === "NANG_GAT" || s === "HOT") return "nang-gat";
  if (s === "NANG" || s === "CLEAR") return "nang";
  if (s === "AM_U" || s === "CLOUDY" || s === "MAY") return "am-u";
  return "binh-thuong";
}

/**
 * Phân cấp chỉ số bụi mịn PM2.5 theo tiêu chuẩn sức khỏe WHO / EPA.
 */
export function pm25Icon(val: number): string {
  if (isNaN(val) || val < 0) return "⚪";
  if (val <= 12.0) return "✅"; // Tốt (Good)
  if (val <= 35.4) return "⚠️"; // Trung bình / Nhạy cảm (Moderate)
  return "❌";                  // Xấu / Nguy hại (Unhealthy)
}

/**
 * Đổi góc la bàn (0° - 360°) thành 16 hướng gió tiếng Việt chuẩn khí tượng.
 */
export function getWindDirection(deg: number): string {
  if (typeof deg !== 'number' || isNaN(deg)) return '';
  const normalized = ((deg % 360) + 360) % 360;
  if (normalized >= 348.75 || normalized < 11.25) return 'Bắc';
  if (normalized >= 11.25 && normalized < 33.75) return 'Bắc Đông Bắc';
  if (normalized >= 33.75 && normalized < 56.25) return 'Đông Bắc';
  if (normalized >= 56.25 && normalized < 78.75) return 'Đông Đông Bắc';
  if (normalized >= 78.75 && normalized < 101.25) return 'Đông';
  if (normalized >= 101.25 && normalized < 123.75) return 'Đông Đông Nam';
  if (normalized >= 123.75 && normalized < 146.25) return 'Đông Nam';
  if (normalized >= 146.25 && normalized < 168.75) return 'Nam Đông Nam';
  if (normalized >= 168.75 && normalized < 191.25) return 'Nam';
  if (normalized >= 191.25 && normalized < 213.75) return 'Nam Tây Nam';
  if (normalized >= 213.75 && normalized < 236.25) return 'Tây Nam';
  if (normalized >= 236.25 && normalized < 258.75) return 'Tây Tây Nam';
  if (normalized >= 258.75 && normalized < 281.25) return 'Tây';
  if (normalized >= 281.25 && normalized < 303.75) return 'Tây Tây Bắc';
  if (normalized >= 303.75 && normalized < 326.25) return 'Tây Bắc';
  if (normalized >= 326.25 && normalized < 348.75) return 'Bắc Tây Bắc';
  return 'Bắc';
}

/**
 * Tính toán toạ độ Bézier Spline mượt mà cho đồ thị nhiệt độ hàng giờ SVG.
 */
export function calculateSplinePoints(
  hourlyData: { temp: number; time?: string }[],
  svgWidth = 500,
  svgHeight = 80,
  padding = 16
): { pathD: string; points: { x: number; y: number; temp: number }[] } {
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
export function parseCurrencyValue(val: string | number | undefined | null): number {
  if (val === null || val === undefined) return 0;
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  let str = String(val).trim();
  // Xử lý dấu chấm phân cách hàng nghìn kiểu Việt Nam: 85.500.000
  if (/\d+\.\d{3}(?:\.\d{3})*/.test(str)) {
    str = str.replace(/\./g, '');
  } else if (str.includes(',')) {
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
export function calculateSpread(buy: number, sell: number): { spread: number; spreadPercent: number } {
  if (buy <= 0 || sell <= 0) return { spread: 0, spreadPercent: 0 };
  const spread = Math.round((sell - buy) * 100) / 100;
  const spreadPercent = Math.round(((sell - buy) / buy) * 10000) / 100;
  return { spread, spreadPercent };
}

/**
 * Format số tiền VND chuẩn đẹp hiển thị trên giao diện (ví dụ: 85.500.000 đ).
 */
export function formatVND(val: number): string {
  if (isNaN(val)) return '0 đ';
  return new Intl.NumberFormat('vi-VN').format(Math.round(val)) + ' đ';
}

/**
 * Tính toán biến động giá (tăng/giảm/đi ngang) giữa 2 phiên giao dịch.
 */
export function calculatePriceChange(current: number, previous: number): {
  diff: number;
  diffPercent: number;
  isUp: boolean;
  isDown: boolean;
  isFlat: boolean;
} {
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
export function getUniqueKey(item: { link?: string; author?: string; title?: string } | null | undefined): string {
  if (!item) return Math.random().toString();
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
export function filterDeduplicatedNews<T extends { link?: string; author?: string; title?: string }>(
  incomingItems: T[],
  existingItems: T[] = []
): T[] {
  if (!incomingItems || !Array.isArray(incomingItems)) return [];
  const existingSet = new Set(existingItems.map(getUniqueKey));
  const result: T[] = [];

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
export function filterNewsByCategory<T extends { category?: string }>(
  items: T[],
  category: string
): T[] {
  if (!items || !Array.isArray(items)) return [];
  if (!category || category === 'Tất cả' || category === 'all') return items;
  const catLower = category.toLowerCase().trim();
  return items.filter(item => {
    const itemCat = (item.category || '').toLowerCase().trim();
    return itemCat === catLower || itemCat.includes(catLower);
  });
}

/**
 * Phân trang cuộn vô cực an toàn (Slice pagination pool).
 */
export function paginateNews<T>(pool: T[], page: number, pageSize = 10): {
  items: T[];
  hasMore: boolean;
  total: number;
} {
  if (!pool || !Array.isArray(pool)) return { items: [], hasMore: false, total: 0 };
  const startIndex = 0;
  const endIndex = Math.min(pool.length, page * pageSize);
  const items = pool.slice(startIndex, endIndex);
  const hasMore = endIndex < pool.length;
  return { items, hasMore, total: pool.length };
}

// ─────────────────────────────────────────────────────────────────────────────
// LUỒNG 4: NEWS FULL-TEXT PARSER & AVATAR GUARD FLOW
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Kiểm tra chuỗi văn bản rác hoặc banner quảng cáo để loại bỏ khỏi thân bài.
 */
export function isBoilerplate(text: string): boolean {
  if (!text) return true;
  const t = text.toLowerCase().trim();
  if (t.length === 0) return true;
  if (
    t === 'đọc tiếp về trang chủ đề' ||
    t.includes('về trang chủ đề') ||
    t === 'trở lại chủ đề' ||
    t === 'đọc tiếp'
  ) return true;
  if (/^(đọc tiếp|về trang chủ đề|trở lại chủ đề|chủ đề:|từ khóa:|xem thêm|tin liên quan|bài viết liên quan|nguồn:)/i.test(t)) return true;
  if (/^theo\s+(nguồn|dân trí|tiền phong|vnexpress|thanh niên|tuổi trẻ|vtv|lao động|báo)/i.test(t)) return true;
  if (/^(bình luận|chia sẻ qua facebook|zalo|copy link|tải app|quảng cáo)/i.test(t)) return true;
  return false;
}

/**
 * Bộ bảo vệ hai lớp (Dual-layer Guard): Nhận diện ảnh avatar tác giả để Byline Bar hiển thị nhỏ
 * và triệt tiêu lỗi phóng to avatar thành ảnh bài viết trong thân bài.
 */
export function isAuthorAvatar(
  imgEl: any,
  captionText = '',
  imgSrc = '',
  authorName = ''
): boolean {
  if (!imgEl) return false;

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
export function validateYouTubeId(id: string | null | undefined): boolean {
  if (!id || typeof id !== 'string') return false;
  return /^[a-zA-Z0-9_-]{11}$/.test(id.trim());
}

/**
 * Kiểm tra video có thuộc kênh truyền hình đang chọn hay không.
 */
export function matchesChannel(
  item: { channel?: string; title?: string; category?: string; badge?: string } | null | undefined,
  channelId: string
): boolean {
  if (!item) return false;
  if (!channelId || channelId === 'all') return true;

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
export function generateChannelPlaylist<T extends { channel?: string; title?: string; category?: string; badge?: string }>(
  allShorts: T[],
  channelId: string,
  fallbackShorts: T[] = []
): T[] {
  if (!allShorts || allShorts.length === 0) return fallbackShorts;
  if (!channelId || channelId === 'all') return allShorts;

  const filtered = allShorts.filter(item => matchesChannel(item, channelId));
  if (filtered.length > 0) return filtered;

  // Empty Playlist Prevention: Thử tìm trong fallbackShorts
  const fallbackFiltered = fallbackShorts.filter(item => matchesChannel(item, channelId));
  if (fallbackFiltered.length > 0) return fallbackFiltered;

  // Nếu vẫn rỗng, trả về toàn bộ allShorts để người dùng không bị kẹt màn hình đen
  return allShorts;
}

/**
 * Kiểm tra mã lỗi phát lại YouTube có thuộc diện tự động bỏ qua (Auto-Recovery) hay không.
 * Mã 100: Video không tồn tại / riêng tư.
 * Mã 101 / 150: Chủ sở hữu cấm phát trên trình duyệt nhúng.
 */
export function shouldAutoRecoverOnPlaybackError(errorCode: number): boolean {
  return [100, 101, 150].includes(errorCode);
}

/**
 * Tính toán trạng thái hiển thị của thanh điều khiển Shorts (ẩn sau 5000ms không hoạt động).
 */
export function calculateControlsVisibility(lastInteractionTime: number, nowTime: number, timeoutMs = 5000): boolean {
  if (lastInteractionTime <= 0) return true;
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
export function isUserAdminQA(userOrRole?: any): boolean {
  if (userOrRole) {
    if (typeof userOrRole === 'object' && userOrRole.email === ADMIN_EMAIL) return true;
    if (typeof userOrRole === 'string' && userOrRole.toLowerCase() === ADMIN_EMAIL) return true;
  }

  // Kiểm tra bộ nhớ localStorage nếu đang chạy trên browser
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const cached = window.localStorage.getItem('user_auth');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed?.email === ADMIN_EMAIL) return true;
      }
    } catch {
      // Ignored
    }
  }

  return false;
}

/**
 * Phân giải URL QA Dashboard tương thích cả Localhost và GitHub Pages subpath.
 */
export function getDashboardUrl(pathname = '', hostname = ''): string {
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
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/**
 * Tính thứ của ngày đầu tiên trong tháng (0 = Chủ Nhật, 1 = Thứ Hai, ... 6 = Thứ Bảy).
 */
export function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

/**
 * Giải mã các thực thể HTML đặc thù (&amp;, &lt;, &gt;, &quot;, &#39;, &nbsp;) và CDATA blocks.
 */
export function decodeHTMLEntities(text: string | null | undefined): string {
  if (!text) return '';
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
    } catch {
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
