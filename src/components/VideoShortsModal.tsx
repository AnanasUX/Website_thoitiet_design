import React, { useState, useEffect, useRef, useMemo } from 'react';
import { YOUTUBE_NEWS_DATABASE, cleanVideoTitle } from './YouTubeBroadcastPlayer';

export interface ShortItem {
  id: string;
  youtubeId?: string;
  videoUrl?: string; // Fallback MP4 nếu có
  title: string;
  channel: string;
  channelId?: string;
  badge: 'TRỰC TIẾP' | 'BẢN TIN' | 'TIÊU ĐIỂM' | 'THỜI TIẾT' | 'TÀI CHÍNH' | 'THẾ GIỚI' | 'BẢN TIN TRANG';
  category: 'Thời sự 24h' | 'Thời tiết TV' | 'Tài chính & Vàng' | 'Thế giới & Cuộc sống';
  duration?: string;
  thumbnail?: string;
  likes: number;
  commentsCount?: number;
  sharesCount?: number;
  publishedAt?: string;
  isSiteNews?: boolean;
  mediaType?: 'video' | 'short';
}

// Chuyển đổi chuỗi duration dạng mm:ss hoặc hh:mm:ss thành số giây
export function parseDurationSeconds(d?: string): number {
  if (!d) return 50;
  if (/shorts/i.test(d)) return 50;
  const parts = d.split(':').map(Number);
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    return parts[0] * 60 + parts[1];
  }
  if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  return 50;
}

// ── Hàm tắt triệt để phụ đề, dịch tự động và quảng cáo trên trình phát YouTube Shorts ──
export function suppressAdsAndCaptions(targetWin?: Window | null) {
  if (!targetWin) return;
  try {
    // 0. Tự động skip/bỏ qua quảng cáo YouTube nếu có
    targetWin.postMessage(JSON.stringify({ event: 'command', func: 'skipAd' }), '*');
    // 1. Gỡ bỏ hoàn toàn module phụ đề/dịch tự động
    targetWin.postMessage(JSON.stringify({ event: 'command', func: 'unloadModule', args: ['captions'] }), '*');
    // 2. Tắt track phụ đề (set track object rỗng)
    targetWin.postMessage(JSON.stringify({ event: 'command', func: 'setOption', args: ['captions', 'track', {}] }), '*');
    // 3. Tắt nạp lại phụ đề
    targetWin.postMessage(JSON.stringify({ event: 'command', func: 'setOption', args: ['captions', 'reload', false] }), '*');
    // 4. Giảm kích thước font phụ đề về 0 nếu trình duyệt vẫn cố hiển thị
    targetWin.postMessage(JSON.stringify({ event: 'command', func: 'setOption', args: ['captions', 'fontSize', -1] }), '*');
  } catch {}
}

// ── Danh sách các nguồn tin tức & phóng sự lớn nhất trong ngày ──
export const FEATURED_NEWS_CHANNELS = [
  { id: 'UCabsTV34JwALXKGMqHpvUiA', name: 'VTV24' },
  { id: 'UCIW9cGgoRuGJnky3K3tbzNg', name: 'Báo Thanh Niên' },
  { id: 'UCteGrHMrnQwx7Scx--7nyoA', name: 'Báo Tuổi Trẻ' },
  { id: 'UCFN0IoARjOAgx-OWr-JBIHg', name: 'Báo Lao Động' }
];

// ── Cấu trúc Kênh Truyền Hình phong cách Smart TV ──
export interface TVChannel {
  id: string; // 'all' | 'vtv24' | 'tienphong' | 'thanhnien' | 'tuoitre' | 'vtcnow' | 'laodong' | 'thoitiet' | 'site'
  channelId?: string;
  name: string;
  tagline: string;
  number: string;
  logoColor: string;
  badgeText: string;
}

export const TV_CHANNELS: TVChannel[] = [
  {
    id: 'all',
    name: 'Tất Cả Kênh',
    tagline: 'Tổng hợp dòng chảy thời sự đa kênh 24h',
    number: 'CH 00',
    logoColor: '#ff315f',
    badgeText: 'TỔNG HỢP'
  },
  {
    id: 'vtv24',
    channelId: 'UCabsTV34JwALXKGMqHpvUiA',
    name: 'VTV24',
    tagline: 'Trung tâm Tin tức VTV24 - Chuyển động 24h & Thời sự nóng',
    number: 'CH 01',
    logoColor: '#e11d48',
    badgeText: 'VTV THỜI SỰ'
  },
  {
    id: 'tienphong',
    name: 'Báo Tiền Phong',
    tagline: 'Kênh truyền hình Tiền Phong - Tin nóng, chính luận & phóng sự điều tra',
    number: 'CH 02',
    logoColor: '#0284c7',
    badgeText: 'TIỀN PHONG TV'
  },
  {
    id: 'thanhnien',
    name: 'Báo Thanh Niên',
    tagline: 'Truyền hình Báo Thanh Niên - Tiêu điểm xã hội & pháp luật 24h',
    number: 'CH 03',
    logoColor: '#2563eb',
    badgeText: 'THANH NIÊN'
  },
  {
    id: 'tuoitre',
    name: 'Báo Tuổi Trẻ',
    tagline: 'Truyền hình Tuổi Trẻ - Tin tức đa chiều, phóng sự & phóng viên thường trú',
    number: 'CH 04',
    logoColor: '#dc2626',
    badgeText: 'TUỔI TRẺ TV'
  },
  {
    id: 'vtcnow',
    name: 'VTC NOW',
    tagline: 'Đài Truyền hình Kỹ thuật số VTC - Bản tin thời sự cập nhật từng phút',
    number: 'CH 05',
    logoColor: '#ea580c',
    badgeText: 'VTC NOW'
  },
  {
    id: 'laodong',
    name: 'Báo Lao Động',
    tagline: 'Truyền hình Báo Lao Động - Kinh tế, thị trường & người lao động',
    number: 'CH 06',
    logoColor: '#059669',
    badgeText: 'LAO ĐỘNG TV'
  },
  {
    id: 'thoitiet',
    name: 'VTV Thời Tiết',
    tagline: 'Bản tin Dự báo Thời tiết, Cảnh báo bão & Thiên tai TV',
    number: 'CH 07',
    logoColor: '#0ea5e9',
    badgeText: 'THỜI TIẾT TV'
  },
  {
    id: 'site',
    name: 'Bản Tin Trang',
    tagline: 'Video bản tin nội bộ và tin tức trực tiếp từ website',
    number: 'CH 08',
    logoColor: '#8b5cf6',
    badgeText: 'BẢN TIN TRANG'
  }
];

// Hàm kiểm tra video có thuộc kênh được chọn hay không
export function matchesChannel(item: ShortItem, channelId: string): boolean {
  if (channelId === 'all') return true;
  const chLower = (item.channel || '').toLowerCase();
  const titleLower = (item.title || '').toLowerCase();
  if (channelId === 'vtv24') return chLower.includes('vtv24') || chLower.includes('vtv') || titleLower.includes('vtv24');
  if (channelId === 'tienphong') return chLower.includes('tiền phong') || chLower.includes('tienphong') || item.badge === 'BẢN TIN TRANG' || titleLower.includes('tiền phong');
  if (channelId === 'thanhnien') return chLower.includes('thanh niên') || chLower.includes('thanh nien') || titleLower.includes('thanh niên');
  if (channelId === 'tuoitre') return chLower.includes('tuổi trẻ') || chLower.includes('tuoi tre') || titleLower.includes('tuổi trẻ');
  if (channelId === 'vtcnow') return chLower.includes('vtc') || titleLower.includes('vtc');
  if (channelId === 'laodong') return chLower.includes('lao động') || chLower.includes('lao dong') || titleLower.includes('lao động');
  if (channelId === 'thoitiet') return chLower.includes('thời tiết') || item.category === 'Thời tiết TV' || item.badge === 'THỜI TIẾT';
  if (channelId === 'site') return Boolean(item.isSiteNews);
  return false;
}

// ── Kho video phong phú trên các kênh chính thức (Phân loại theo đài) ──
export const BACKUP_FALLBACK_SHORTS: ShortItem[] = [
  // ── VTV24 ──
  {
    id: 'yt-vtv24-01',
    youtubeId: 'THldZ31vTvI',
    title: 'Chuyển động 24h trưa • Tin tức thời sự cập nhật, tình hình quốc tế và các sự kiện nổi bật trong ngày',
    channel: 'VTV24',
    badge: 'TRỰC TIẾP',
    category: 'Thời sự 24h',
    thumbnail: 'https://i.ytimg.com/vi/THldZ31vTvI/hqdefault.jpg',
    likes: 8520,
    commentsCount: 612,
    sharesCount: 490,
    mediaType: 'video',
    publishedAt: '2026-10-13T05:00:00.000Z'
  },
  {
    id: 'yt-vtv24-02',
    youtubeId: 'kFDO9Qbua4c',
    title: 'VTV24 Tiêu điểm • Cảnh báo những thủ đoạn lừa đảo tị nạn và bẫy việc làm trên không gian mạng',
    channel: 'VTV24',
    badge: 'TIÊU ĐIỂM',
    category: 'Thời sự 24h',
    thumbnail: 'https://i.ytimg.com/vi/kFDO9Qbua4c/hqdefault.jpg',
    likes: 4890,
    commentsCount: 320,
    sharesCount: 210,
    mediaType: 'video',
    publishedAt: '2026-10-13T03:45:00.000Z'
  },
  {
    id: 'yt-vtv24-03',
    youtubeId: '0thQbm1zlW4',
    title: 'Kinh tế 24h • Biến động giá vàng miếng SJC, thị trường tài chính và khuyến nghị nhà đầu tư',
    channel: 'VTV24',
    badge: 'TÀI CHÍNH',
    category: 'Tài chính & Vàng',
    thumbnail: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=600&auto=format&fit=crop&q=70',
    likes: 5410,
    commentsCount: 390,
    sharesCount: 260,
    mediaType: 'video',
    publishedAt: '2026-10-13T01:30:00.000Z'
  },

  // ── BÁO TIỀN PHONG ──
  {
    id: 'yt-tp-01',
    youtubeId: 'Kmx55fnX6jM',
    title: 'Tiền Phong TV • Bản tin Thời sự nóng: Phân tích chính sách kinh tế mới và tiêu điểm xã hội',
    channel: 'Báo Tiền Phong',
    badge: 'BẢN TIN',
    category: 'Thời sự 24h',
    thumbnail: 'https://cdn2.tuoitre.vn/471584752817336320/2026/10/12/img-1791781649342475651614.jpeg',
    likes: 6240,
    commentsCount: 410,
    sharesCount: 230,
    mediaType: 'video',
    publishedAt: '2026-10-13T04:15:00.000Z'
  },
  {
    id: 'yt-tp-02',
    youtubeId: '819YbuGDpK0',
    title: 'Phóng sự Tiền Phong • Điều tra trật tự an toàn giao thông và quy chuẩn văn minh đô thị',
    channel: 'Báo Tiền Phong',
    badge: 'TIÊU ĐIỂM',
    category: 'Thời sự 24h',
    thumbnail: 'https://cdn2.tuoitre.vn/471584752817336320/2026/10/12/quy-chuan00004318still141-17917883369831355170827.jpg',
    likes: 5410,
    commentsCount: 380,
    sharesCount: 195,
    mediaType: 'short',
    publishedAt: '2026-10-13T02:30:00.000Z'
  },

  // ── BÁO THANH NIÊN ──
  {
    id: 'yt-tn-01',
    youtubeId: 'fQ6NE4ZQOLg',
    title: 'Tiêu điểm Thanh Niên • Báo động thực trạng kỹ năng mềm của sinh viên và cơ hội việc làm',
    channel: 'Báo Thanh Niên',
    badge: 'TIÊU ĐIỂM',
    category: 'Thời sự 24h',
    thumbnail: 'https://i.ytimg.com/vi/fQ6NE4ZQOLg/hqdefault.jpg',
    likes: 6730,
    commentsCount: 588,
    sharesCount: 420,
    mediaType: 'video',
    publishedAt: '2026-10-13T04:40:00.000Z'
  },
  {
    id: 'yt-tn-02',
    youtubeId: '3ojcuyMKDvs',
    title: 'Nóng trên cao tốc • Cảnh sát giao thông phát hiện tài xế vi phạm khi đang lưu thông',
    channel: 'Báo Thanh Niên',
    badge: 'BẢN TIN',
    category: 'Thời sự 24h',
    thumbnail: 'https://cdn2.tuoitre.vn/471584752817336320/2026/10/12/quy-chuan00012315still140-17917784637421791585753.jpg',
    likes: 3840,
    commentsCount: 290,
    sharesCount: 160,
    mediaType: 'short',
    publishedAt: '2026-10-13T01:15:00.000Z'
  },

  // ── BÁO TUỔI TRẺ ──
  {
    id: 'yt-tt-01',
    youtubeId: '819YbuGDpK0',
    title: 'Thời sự Tuổi Trẻ • Tiếp sức đến trường: Trao học bổng cho tân sinh viên nghèo vượt khó',
    channel: 'Báo Tuổi Trẻ',
    badge: 'TIÊU ĐIỂM',
    category: 'Thời sự 24h',
    thumbnail: 'https://i.ytimg.com/vi/819YbuGDpK0/hqdefault.jpg',
    likes: 5120,
    commentsCount: 340,
    sharesCount: 210,
    mediaType: 'video',
    publishedAt: '2026-10-13T03:50:00.000Z'
  },
  {
    id: 'yt-tt-02',
    youtubeId: 'utYT3v_KTyo',
    title: 'Thời sự quốc tế • Toàn cảnh các diễn biến địa chính trị nóng và ảnh hưởng kinh tế',
    channel: 'Báo Tuổi Trẻ',
    badge: 'THẾ GIỚI',
    category: 'Thế giới & Cuộc sống',
    thumbnail: 'https://cdn2.tuoitre.vn/471584752817336320/2026/10/12/gif-saudi-17917876145991101125005.gif',
    likes: 4210,
    commentsCount: 280,
    sharesCount: 175,
    mediaType: 'short',
    publishedAt: '2026-10-13T00:50:00.000Z'
  },

  // ── VTC NOW ──
  {
    id: 'yt-vtc-01',
    youtubeId: 'Na5uByDy8Sw',
    title: 'VTC NOW • Nhịp đập tài chính: Phân tích đà tăng trưởng của dòng vốn và kinh tế thị trường',
    channel: 'VTC NOW',
    badge: 'TÀI CHÍNH',
    category: 'Tài chính & Vàng',
    thumbnail: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=600&auto=format&fit=crop&q=70',
    likes: 4210,
    commentsCount: 305,
    sharesCount: 180,
    mediaType: 'video',
    publishedAt: '2026-10-13T04:20:00.000Z'
  },

  // ── BÁO LAO ĐỘNG ──
  {
    id: 'yt-ld-01',
    youtubeId: 'gusC3mjEV3I',
    title: 'Tiêu dùng thông minh • Thị trường vàng biến động và khuyến cáo đối với người lao động',
    channel: 'Báo Lao Động',
    badge: 'TÀI CHÍNH',
    category: 'Tài chính & Vàng',
    thumbnail: 'https://i.ytimg.com/vi/gusC3mjEV3I/hqdefault.jpg',
    likes: 3100,
    commentsCount: 195,
    sharesCount: 110,
    mediaType: 'short',
    publishedAt: '2026-10-13T02:10:00.000Z'
  },

  // ── VTV THỜI TIẾT ──
  {
    id: 'yt-thoitiet-01',
    youtubeId: 'etXSh6fn_As',
    title: 'Thời tiết ngày mới • Bắc Bộ ngày nắng hanh, Nam Bộ mưa tăng diện rộng từ chiều tối',
    channel: 'VTV Thời Tiết',
    badge: 'THỜI TIẾT',
    category: 'Thời tiết TV',
    thumbnail: 'https://i.ytimg.com/vi/etXSh6fn_As/hqdefault.jpg',
    likes: 7210,
    commentsCount: 482,
    sharesCount: 345,
    mediaType: 'video',
    publishedAt: '2026-10-13T05:10:00.000Z'
  },
  {
    id: 'yt-thoitiet-02',
    youtubeId: 'ADGo5NaYQNM',
    title: 'Dự báo xu thế thời tiết • Các đợt không khí lạnh dồn dập tràn về miền Bắc trong tuần',
    channel: 'VTV Thời Tiết',
    badge: 'THỜI TIẾT',
    category: 'Thời tiết TV',
    thumbnail: 'https://i.ytimg.com/vi/ADGo5NaYQNM/hqdefault.jpg',
    likes: 8120,
    commentsCount: 650,
    sharesCount: 520,
    mediaType: 'video',
    publishedAt: '2026-10-13T03:00:00.000Z'
  },
  {
    id: 'yt-thoitiet-03',
    youtubeId: 'xYXS7Dgi5M4',
    title: 'Bản tin nhanh • Hình thế thời tiết gây mưa giông cục bộ và chỉ số tia cực tím UV',
    channel: 'VTV Thời Tiết',
    badge: 'THỜI TIẾT',
    category: 'Thời tiết TV',
    thumbnail: 'https://i.ytimg.com/vi/xYXS7Dgi5M4/hqdefault.jpg',
    likes: 4320,
    commentsCount: 312,
    sharesCount: 190,
    mediaType: 'short',
    publishedAt: '2026-10-13T01:30:00.000Z'
  }
];

const MULTI_CACHE_KEY = 'yt_aggregated_shorts_cache_v5';
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 phút cache

// Fetch có timeout không làm treo luồng mạng
async function fetchWithTimeout(url: string, timeoutMs = 5000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    return res;
  } catch (e) {
    clearTimeout(timer);
    throw e;
  }
}

// ── Hàm tổng hợp và đan xen tin tức từ nhiều kênh lớn nhất trong ngày ──
async function fetchAggregatedNewsShorts(): Promise<ShortItem[]> {
  // 1. Đọc ngay từ cache (0ms phản hồi, tránh treo giao diện)
  try {
    const cached = localStorage.getItem(MULTI_CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Date.now() - parsed.timestamp < CACHE_TTL_MS && Array.isArray(parsed.items) && parsed.items.length > 0) {
        return parsed.items;
      }
    }
  } catch {}

  // 2. Fetch song song từ các kênh uy tín
  try {
    const channelFetches = FEATURED_NEWS_CHANNELS.map(async (ch) => {
      try {
        const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${ch.id}`;
        const res = await fetchWithTimeout(`https://new-bot.mrkun28.workers.dev/?url=${encodeURIComponent(rssUrl)}`, 4500);
        const data = await res.json();
        const xml = data?.contents || '';

        const list: ShortItem[] = [];
        const entryRegex = /<entry>([\s\S]*?)<\/entry>/gi;
        let match;
        let idx = 0;

        while ((match = entryRegex.exec(xml)) !== null && list.length < 12) {
          const entryXml = match[1];
          const vidMatch = entryXml.match(/<yt:videoId>([^<]+)<\/yt:videoId>/i);
          const titleMatch = entryXml.match(/<title>([^<]+)<\/title>/i);
          const pubMatch = entryXml.match(/<published>([^<]+)<\/published>/i);

          if (vidMatch && titleMatch) {
            const vid = vidMatch[1];
            let rawTitle = titleMatch[1].replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
            rawTitle = cleanVideoTitle(rawTitle);

            let category: 'Thời sự 24h' | 'Thời tiết TV' | 'Tài chính & Vàng' | 'Thế giới & Cuộc sống' = 'Thời sự 24h';
            if (/thời tiết|mưa|bão|nắng|lũ|áp thấp|triều cường|không khí lạnh|nhiệt độ/i.test(rawTitle)) {
              category = 'Thời tiết TV';
            } else if (/vàng|tài chính|giá vàng|kinh tế|thị trường|chứng khoán|đô la|bất động sản|lãi suất/i.test(rawTitle)) {
              category = 'Tài chính & Vàng';
            } else if (/thế giới|quốc tế|nga|ukraine|mỹ|israel|trung quốc|iran|nhật bản/i.test(rawTitle)) {
              category = 'Thế giới & Cuộc sống';
            }

            let badge: 'TRỰC TIẾP' | 'BẢN TIN' | 'TIÊU ĐIỂM' | 'THỜI TIẾT' | 'TÀI CHÍNH' | 'THẾ GIỚI' = 'BẢN TIN';
            if (category === 'Thời tiết TV') badge = 'THỜI TIẾT';
            else if (category === 'Tài chính & Vàng') badge = 'TÀI CHÍNH';
            else if (category === 'Thế giới & Cuộc sống') badge = 'THẾ GIỚI';
            else if (idx === 0) badge = 'TIÊU ĐIỂM';

            const isShort = /shorts/i.test(rawTitle) || /#short/i.test(rawTitle);

            list.push({
              id: `yt-${vid}`,
              youtubeId: vid,
              title: rawTitle,
              channel: ch.name,
              channelId: ch.id,
              badge,
              category,
              thumbnail: `https://i.ytimg.com/vi/${vid}/hqdefault.jpg`,
              duration: isShort ? 'Shorts' : 'Bản tin',
              mediaType: isShort ? 'short' : 'video',
              likes: 1800 + ((idx * 317) % 6500),
              commentsCount: 95 + ((idx * 43) % 450),
              sharesCount: 40 + ((idx * 21) % 250),
              publishedAt: pubMatch ? pubMatch[1] : new Date(Date.now() - idx * 3600000).toISOString()
            });
            idx++;
          }
        }
        return list;
      } catch {
        return [];
      }
    });

    const settled = await Promise.all(channelFetches);
    
    // Đan xen và phân loại các video từ các kênh uy tín
    const flattened: ShortItem[] = settled.flat();
    
    // Sắp xếp video theo thời gian xuất bản mới nhất lên đầu
    flattened.sort((a, b) => {
      const tA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
      const tB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
      return tB - tA;
    });

    if (flattened.length > 0) {
      try {
        localStorage.setItem(MULTI_CACHE_KEY, JSON.stringify({
          items: flattened,
          timestamp: Date.now()
        }));
      } catch {}
      return flattened;
    }
  } catch (err) {
    console.warn('Lỗi khi fetch đa kênh tin tức:', err);
  }

  return BACKUP_FALLBACK_SHORTS;
}

interface VideoShortsModalProps {
  isOpen: boolean;
  onClose: () => void;
  liveNews?: any[];
  userRole?: any;
  onLogin?: () => void;
  initialCategory?: string;
}

export function VideoShortsModal({
  isOpen,
  onClose,
  liveNews = [],
  userRole,
  onLogin,
  initialCategory = 'Tất cả'
}: VideoShortsModalProps) {
  // ── TV CHANNEL & MEDIA TAB STATES (PHÂN LOẠI KÊNH & ĐỊNH DẠNG VIDEO TIVI) ──
  const [selectedChannelId, setSelectedChannelId] = useState<string>('all');
  const [showChannelMenu, setShowChannelMenu] = useState<boolean>(false);
  const [mediaTab, setMediaTab] = useState<'all' | 'video' | 'short'>('all');

  // Danh sách video đa kênh
  const [multiChannelVideos, setMultiChannelVideos] = useState<ShortItem[]>(() => {
    try {
      const cached = localStorage.getItem(MULTI_CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed.items) && parsed.items.length > 0) return parsed.items;
      }
    } catch {}
    return BACKUP_FALLBACK_SHORTS;
  });

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});
  const [likesMap, setLikesMap] = useState<Record<string, number>>({});
  const [followedMap, setFollowedMap] = useState<Record<string, boolean>>({});
  const [showHeartPop, setShowHeartPop] = useState<boolean>(false);
  const [showComments, setShowComments] = useState<boolean>(false);
  const [commentInput, setCommentInput] = useState<string>('');
  const [commentsList, setCommentsList] = useState<Array<{ user: string; text: string; time: string }>>([
    { user: 'Minh Thảo', text: 'Tin tức đan xen nhiều đài xem rất cuốn và tiện lợi, cập nhật chuẩn xác!', time: 'Vừa xong' },
    { user: 'Tuấn Anh', text: 'Lướt chuyển clip mượt mà, không bị khựng đơ như trước 👍', time: '5 phút trước' },
    { user: 'Hương Giang', text: 'Hình ảnh sắc nét, giao diện cực kỳ thoáng và chuyên nghiệp.', time: '12 phút trước' }
  ]);
  const [showToast, setShowToast] = useState<string | null>(null);
  const [showPlaylistDrawer, setShowPlaylistDrawer] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Khởi tạo isLandscape: Trên PC / Laptop (>= 1024px) mặc định là 16:9 Toàn Cảnh để giao diện rộng lớn, không bị bé tẹo
  const [isLandscape, setIsLandscape] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
      return true;
    }
    return false;
  });
  const modalContainerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Bật / Thoát chế độ Toàn Màn Hình Fullscreen trình duyệt
  const toggleBrowserFullscreen = () => {
    try {
      if (!document.fullscreenElement) {
        modalContainerRef.current?.requestFullscreen?.().catch(() => {});
        setIsFullscreen(true);
        setShowToast('⛶ Đã mở Toàn Màn Hình Fullscreen');
      } else {
        document.exitFullscreen?.().catch(() => {});
        setIsFullscreen(false);
        setShowToast('Đã thoát Toàn Màn Hình');
      }
      setTimeout(() => setShowToast(null), 2000);
    } catch {}
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Tự động ẩn các nút điều khiển & tiêu đề (chỉ xuất hiện khi người dùng chủ động chạm/tương tác)
  const [isControlsVisible, setIsControlsVisible] = useState<boolean>(false);
  const [slideTransition, setSlideTransition] = useState<'slide-up' | 'slide-down' | null>(null);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const autoAdvanceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const resetInactivityTimer = () => {
    setIsControlsVisible(true);
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    // Nếu đang mở Drawer bình luận, playlist hoặc Menu Kênh TV thì không tự ẩn controls
    if (showComments || showPlaylistDrawer || showChannelMenu) return;

    inactivityTimerRef.current = setTimeout(() => {
      setIsControlsVisible(false);
    }, 5000);
  };

  const lastMouseMoveRef = useRef<number>(0);
  useEffect(() => {
    if (!isOpen) return;

    // Chỉ khi có tác động chủ động từ người dùng (click, chạm tap, rê chuột, bấm phím) mới đánh thức hiển thị controls
    const handleExplicitUserAction = () => {
      resetInactivityTimer();
    };

    const handleMouseMoveAction = () => {
      const now = Date.now();
      if (now - lastMouseMoveRef.current > 350) {
        lastMouseMoveRef.current = now;
        resetInactivityTimer();
      }
    };

    window.addEventListener('mousedown', handleExplicitUserAction);
    window.addEventListener('touchstart', handleExplicitUserAction, { passive: true });
    window.addEventListener('keydown', handleExplicitUserAction);
    window.addEventListener('mousemove', handleMouseMoveAction, { passive: true });

    return () => {
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
      window.removeEventListener('mousedown', handleExplicitUserAction);
      window.removeEventListener('touchstart', handleExplicitUserAction);
      window.removeEventListener('keydown', handleExplicitUserAction);
      window.removeEventListener('mousemove', handleMouseMoveAction);
    };
  }, [isOpen, showComments, showPlaylistDrawer, showChannelMenu]);

  // Xoay ngang / dọc màn hình để xem trọn vẹn video (Chuyển chế độ 16:9 Toàn cảnh / 9:16 Dọc)
  const toggleOrientation = () => {
    const nextState = !isLandscape;
    setIsLandscape(nextState);
    setShowToast(nextState ? '🖥️ Chế độ Toàn Cảnh 16:9 (Rộng tối đa trên PC)' : '📱 Chế độ Dọc Shorts (9:16)');
    setTimeout(() => setShowToast(null), 2200);
  };

  // Lắng nghe thay đổi kích thước và xoay màn hình tự nhiên
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > window.innerHeight && window.innerHeight < 600 && !isLandscape) {
        setIsLandscape(true);
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [isLandscape]);

  // Tải ngầm danh sách video đa kênh khi mở modal
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    fetchAggregatedNewsShorts().then((items) => {
      if (!isMounted) return;
      if (items.length > 0) {
        setMultiChannelVideos(items);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // ── HANDLERS CHỌN KÊNH TV VÀ CHỌN ĐỊNH DẠNG MEDIA ──
  const handleSelectChannel = (channelId: string) => {
    setSelectedChannelId(channelId);
    setShowChannelMenu(false);
    setCurrentIndex(0); // Luôn bắt đầu từ video mới nhất của kênh theo đúng yêu cầu
    if (typeof window !== 'undefined' && window.innerWidth >= 1024 && mediaTab !== 'short') {
      setIsLandscape(true); // Trên PC ưu tiên mở 16:9 toàn cảnh rộng rãi cho video kênh
    }
    setIsControlsVisible(false);
    const ch = TV_CHANNELS.find(c => c.id === channelId) || TV_CHANNELS[0];
    setShowToast(`📺 Đang phát ${ch.number}: ${ch.name} • Từ video mới nhất`);
    setTimeout(() => setShowToast(null), 2500);
  };

  const handleSelectMediaTab = (tab: 'all' | 'video' | 'short') => {
    setMediaTab(tab);
    setCurrentIndex(0);
    if (tab === 'video' && typeof window !== 'undefined' && window.innerWidth >= 1024) {
      setIsLandscape(true); // Trên PC tự chuyển sang chế độ Toàn cảnh 16:9 cho video kênh
    } else if (tab === 'short') {
      setIsLandscape(false); // Chuyển về chế độ dọc 9:16 cho tab shorts
    }
    const label = tab === 'all' ? 'Tất cả video & Shorts' : (tab === 'video' ? 'Video dài trên kênh (16:9 Toàn cảnh)' : 'Video Shorts ngắn (9:16)');
    setShowToast(`⚡ Chế độ: ${label}`);
    setTimeout(() => setShowToast(null), 2000);
  };

  const currentChannelInfo = useMemo(() => {
    return TV_CHANNELS.find(c => c.id === selectedChannelId) || TV_CHANNELS[0];
  }, [selectedChannelId]);

  // Toàn bộ kho video tổng hợp sẵn sàng phân loại theo kênh
  const allAvailableVideos = useMemo(() => {
    const list: ShortItem[] = [];
    const seen = new Set<string>();

    const addUnique = (item: ShortItem) => {
      const key = item.youtubeId || item.videoUrl || item.title;
      if (key && !seen.has(key)) {
        seen.add(key);
        list.push(item);
      }
    };

    // 1. Thêm các video từ API đa kênh
    if (multiChannelVideos && multiChannelVideos.length > 0) {
      multiChannelVideos.forEach(addUnique);
    }

    // 2. Thêm kho video bản tin dự phòng chất lượng cao
    BACKUP_FALLBACK_SHORTS.forEach(addUnique);

    // 3. Thêm các video từ YOUTUBE_NEWS_DATABASE
    if (Array.isArray(YOUTUBE_NEWS_DATABASE)) {
      YOUTUBE_NEWS_DATABASE.forEach((item, idx) => {
        addUnique({
          id: `db-${item.id || idx}`,
          youtubeId: item.youtubeId,
          videoUrl: item.videoUrl,
          title: item.title,
          channel: item.channel,
          badge: item.badge,
          category: item.category,
          duration: item.duration,
          thumbnail: item.thumbnail,
          likes: item.likes || 2500,
          commentsCount: 120,
          sharesCount: 65,
          mediaType: item.duration?.includes('0:') ? 'short' : 'video',
          publishedAt: new Date(Date.now() - (idx + 1) * 7200000).toISOString()
        });
      });
    }

    // 4. Thêm các bài viết có video từ liveNews của trang web
    if (liveNews && liveNews.length > 0) {
      liveNews.forEach((n, idx) => {
        if (n.videoSrc || (n.link && /video/i.test(n.link))) {
          addUnique({
            id: `site-live-${idx}`,
            videoUrl: n.videoSrc,
            title: n.author || n.title || 'Bản tin thời sự nóng trong ngày',
            channel: n.src || 'Bản Tin Trang',
            badge: 'BẢN TIN TRANG',
            category: 'Thời sự 24h',
            duration: '0:55',
            thumbnail: n.img || n.logo,
            likes: 1900 + ((idx * 173) % 4000),
            commentsCount: 115 + (idx * 23) % 300,
            sharesCount: 50 + (idx * 17) % 200,
            isSiteNews: true,
            mediaType: 'short',
            publishedAt: n.date || new Date(Date.now() - (idx + 2) * 3600000).toISOString()
          });
        }
      });
    }

    return list;
  }, [multiChannelVideos, liveNews]);

  // Đếm số lượng video khả dụng theo từng kênh TV
  const channelCountMap = useMemo(() => {
    const map: Record<string, number> = {};
    TV_CHANNELS.forEach(ch => {
      map[ch.id] = allAvailableVideos.filter(item => matchesChannel(item, ch.id)).length;
    });
    return map;
  }, [allAvailableVideos]);

  // Playlist hiển thị theo KÊNH đã chọn & ĐỊNH DẠNG (Video / Shorts / Tất cả)
  const playlist = useMemo(() => {
    // 1. Lọc theo kênh được chọn
    let result = allAvailableVideos.filter(item => matchesChannel(item, selectedChannelId));

    // 2. Lọc theo định dạng Media Tab (Phân tab video và short trên video)
    if (mediaTab !== 'all') {
      result = result.filter(item => {
        if (mediaTab === 'short') {
          return item.mediaType === 'short' || /shorts/i.test(item.duration || '') || /#short/i.test(item.title);
        }
        if (mediaTab === 'video') {
          return item.mediaType === 'video' || (!item.duration?.includes('0:') && !/#short/i.test(item.title));
        }
        return true;
      });
    }

    // 3. Luôn sắp xếp từ video MỚI NHẤT trên kênh theo đúng yêu cầu người dùng
    result.sort((a, b) => {
      const tA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
      const tB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
      return tB - tA;
    });

    // 4. Fallback nếu kênh chưa có clip phù hợp bộ lọc
    if (result.length === 0) {
      result = allAvailableVideos.filter(item => matchesChannel(item, selectedChannelId));
    }

    return result.length > 0 ? result : BACKUP_FALLBACK_SHORTS;
  }, [allAvailableVideos, selectedChannelId, mediaTab]);

  const currentShort = playlist[currentIndex] || playlist[0] || BACKUP_FALLBACK_SHORTS[0];

  // Khởi tạo số like
  useEffect(() => {
    if (currentShort && likesMap[currentShort.id] === undefined) {
      setLikesMap(prev => ({ ...prev, [currentShort.id]: currentShort.likes }));
    }
  }, [currentShort, likesMap]);

  // ── ĐIỀU HƯỚNG CHUYỂN VIDEO CÓ HIỆU ỨNG CUỘN TRƯỢT DỌC & ẨN TOÀN BỘ CONTROLS NỘI DUNG ──
  const isNavigatingRef = useRef<boolean>(false);

  const handleSelectIndex = (idx: number) => {
    if (isNavigatingRef.current) return;
    isNavigatingRef.current = true;
    // Khi chuyển video: Giữ ẩn toàn bộ icon nội dung ẩn theo đúng yêu cầu
    setIsControlsVisible(false);
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);

    setSlideTransition('slide-up');
    setTimeout(() => {
      const validIdx = (idx + playlist.length) % playlist.length;
      setCurrentIndex(validIdx);
      setSlideTransition(null);
      setTimeout(() => {
        isNavigatingRef.current = false;
      }, 150);
    }, 280);
  };

  const handleNextShort = () => {
    if (isNavigatingRef.current) return;
    isNavigatingRef.current = true;
    // Khi chuyển video: Không xuất hiện các icon nội dung ẩn
    setIsControlsVisible(false);
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);

    // Hiệu ứng cuộn trượt dọc sang video kế tiếp (Scroll up reel)
    setSlideTransition('slide-up');
    setTimeout(() => {
      setCurrentIndex(prev => (prev + 1) % playlist.length);
      setSlideTransition(null);
      setTimeout(() => {
        isNavigatingRef.current = false;
      }, 150);
    }, 280);
  };

  const handlePrevShort = () => {
    if (isNavigatingRef.current) return;
    isNavigatingRef.current = true;
    // Khi chuyển video: Không xuất hiện các icon nội dung ẩn
    setIsControlsVisible(false);
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);

    // Hiệu ứng cuộn trượt dọc quay lại video trước (Scroll down reel)
    setSlideTransition('slide-down');
    setTimeout(() => {
      setCurrentIndex(prev => (prev - 1 + playlist.length) % playlist.length);
      setSlideTransition(null);
      setTimeout(() => {
        isNavigatingRef.current = false;
      }, 150);
    }, 280);
  };

  // ── PC: LĂN CHUỘT (MOUSE WHEEL) ĐỂ CHUYỂN CLIP ──
  const handleWheel = (e: React.WheelEvent) => {
    if (showComments || showPlaylistDrawer || showChannelMenu) return;
    if (isNavigatingRef.current) return;

    if (e.deltaY > 25) {
      handleNextShort();
    } else if (e.deltaY < -25) {
      handlePrevShort();
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleWindowWheel = (e: WheelEvent) => {
      if (showComments || showPlaylistDrawer || showChannelMenu) return;
      if (isNavigatingRef.current) return;

      if (e.deltaY > 25) {
        handleNextShort();
      } else if (e.deltaY < -25) {
        handlePrevShort();
      }
    };

    window.addEventListener('wheel', handleWindowWheel, { passive: true });
    return () => window.removeEventListener('wheel', handleWindowWheel);
  }, [isOpen, showComments, showPlaylistDrawer, showChannelMenu, playlist.length]);

  // ── TABLET & MOBILE: VUỐT CẢM ỨNG (TOUCH SWIPE) ĐỂ CHUYỂN CLIP ──
  const touchStartY = useRef<number>(0);
  const touchStartX = useRef<number>(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (isNavigatingRef.current || showChannelMenu || showComments || showPlaylistDrawer) return;
    const diffY = touchStartY.current - e.changedTouches[0].clientY;
    const diffX = touchStartX.current - e.changedTouches[0].clientX;
    
    // Nhận diện vuốt dọc nếu chênh lệch Y lớn hơn X và biên độ > 35px
    if (Math.abs(diffY) > Math.abs(diffX) && Math.abs(diffY) > 35) {
      if (diffY > 35) {
        handleNextShort();
      } else if (diffY < -35) {
        handlePrevShort();
      }
    }
  };

  // Double tap để thả tim, Chạm vào màn hình thì LUÔN HIỂN THỊ lại toàn bộ thông tin và đếm lùi 5s không tác động mới ẩn
  const lastTapRef = useRef<number>(0);
  const handleOverlayClick = () => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      handleLike();
      setShowHeartPop(true);
      setTimeout(() => setShowHeartPop(false), 800);
    }
    // Đúng yêu cầu người dùng: Chạm vào thì tất cả thông tin ẩn đều hiển thị lên, sau 5s không có tác động mới tự ẩn
    setIsControlsVisible(true);
    resetInactivityTimer();
    lastTapRef.current = now;
  };

  // Phím tắt bàn phím PC: ↑ ↓ để chuyển video, M để tắt tiếng, R để quay ngang, C để mở kênh TV, Esc để đóng
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((showComments || showChannelMenu) && e.key !== 'Escape') return;

      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        handleNextShort();
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        handlePrevShort();
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        setIsMuted(m => !m);
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        toggleOrientation();
      } else if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        setShowChannelMenu(prev => !prev);
        resetInactivityTimer();
      } else if (e.key === 'l' || e.key === 'L' || e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        setShowPlaylistDrawer(prev => !prev);
        resetInactivityTimer();
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleBrowserFullscreen();
        resetInactivityTimer();
      } else if (e.key === 'Escape') {
        if (showChannelMenu) {
          setShowChannelMenu(false);
        } else if (showComments) {
          setShowComments(false);
        } else if (showPlaylistDrawer) {
          setShowPlaylistDrawer(false);
        } else {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, showComments, showPlaylistDrawer, showChannelMenu, isLandscape, currentIndex, playlist.length]);

  // Tự động đảo / cuộn chuyển tiếp video khi hết (YouTube API + Timer dự phòng)
  useEffect(() => {
    if (!isOpen) return;

    const handleMessage = (e: MessageEvent) => {
      try {
        let data = e.data;
        if (typeof data === 'string') {
          try {
            data = JSON.parse(data);
          } catch {
            return;
          }
        }
        if (!data || typeof data !== 'object') return;

        // Triệt tiêu phụ đề, dịch tự động và chặn quảng cáo khi YouTube phát
        if (iframeRef.current?.contentWindow) {
          suppressAdsAndCaptions(iframeRef.current.contentWindow);
        }

        // Tự động bỏ qua / skip quảng cáo ngay lập tức
        if (
          data.event === 'onAdStart' ||
          data.event === 'adPlaying' ||
          data.info?.adState === 1 ||
          data.info?.isAd === true ||
          data.info?.videoData?.isAd === true
        ) {
          if (iframeRef.current?.contentWindow) {
            iframeRef.current.contentWindow.postMessage(
              JSON.stringify({ event: 'command', func: 'skipAd' }),
              '*'
            );
          }
        }

        // YouTube onError (101, 150): Tự động nhảy sang video sau
        if (data.event === 'onError' || data.info === 101 || data.info === 150) {
          setShowToast('Video giới hạn nhúng, tự chuyển clip tiếp theo');
          setTimeout(() => {
            handleNextShort();
          }, 500);
        }

        // 1. YouTube onStateChange = 0 (hết video) hoặc infoDelivery (playerState = 0): Tự động cuộn sang clip kế tiếp
        if (
          (data.event === 'onStateChange' && data.info === 0) ||
          (data.event === 'infoDelivery' && data.info?.playerState === 0)
        ) {
          handleNextShort();
        }

        // 2. Tự động chuyển clip khi currentTime chạm mốc kết thúc video
        if (
          data.event === 'infoDelivery' &&
          typeof data.info?.currentTime === 'number' &&
          typeof data.info?.duration === 'number' &&
          data.info.duration > 2 &&
          data.info.currentTime >= data.info.duration - 0.5
        ) {
          handleNextShort();
        }

        // 3. Khi YouTube báo thời lượng thực tế của clip (duration), đồng bộ timer tự động chuyển clip chính xác
        if (typeof data.info?.duration === 'number' && data.info.duration > 2) {
          if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
          const current = typeof data.info?.currentTime === 'number' ? data.info.currentTime : 0;
          const timeLeft = Math.max(1, data.info.duration - current);
          autoAdvanceTimerRef.current = setTimeout(() => {
            handleNextShort();
          }, (timeLeft + 0.6) * 1000);
        }
      } catch {}
    };

    window.addEventListener('message', handleMessage);

    // Timer dự phòng tự động chuyển tiếp nếu video kết thúc mà bị chặn postMessage cross-origin
    const durationSec = parseDurationSeconds(currentShort.duration) || 50;
    autoAdvanceTimerRef.current = setTimeout(() => {
      handleNextShort();
    }, (durationSec + 2) * 1000);

    return () => {
      window.removeEventListener('message', handleMessage);
      if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
    };
  }, [isOpen, currentIndex, currentShort.id, playlist.length]);

  // Khóa scroll trang nền khi mở Shorts
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Thích video
  const handleLike = () => {
    if (!currentShort) return;
    const isCurrentlyLiked = likedMap[currentShort.id] || false;
    const currentCount = likesMap[currentShort.id] ?? currentShort.likes;
    
    setLikedMap(prev => ({ ...prev, [currentShort.id]: !isCurrentlyLiked }));
    setLikesMap(prev => ({
      ...prev,
      [currentShort.id]: isCurrentlyLiked ? currentCount - 1 : currentCount + 1
    }));
  };

  // Chia sẻ
  const handleShare = () => {
    if (!currentShort) return;
    const shareUrl = window.location.href;

    if (navigator.share) {
      navigator.share({
        title: currentShort.title,
        text: `Xem video Shorts: ${currentShort.title}`,
        url: shareUrl
      }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(shareUrl);
      setShowToast('Đã sao chép liên kết video!');
      setTimeout(() => setShowToast(null), 2500);
    }
  };

  // Gửi bình luận
  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    setCommentsList(prev => [
      { user: userRole?.name ? `${userRole.name} (Bạn)` : 'Bạn (Người xem)', text: commentInput.trim(), time: 'Vừa xong' },
      ...prev
    ]);
    setCommentInput('');
  };

  // Trạng thái theo dõi kênh hiện tại
  const isFollowingChannel = Boolean(followedMap[currentShort.channel]);

  const toggleFollowChannel = () => {
    const nextState = !isFollowingChannel;
    setFollowedMap(prev => ({ ...prev, [currentShort.channel]: nextState }));
    setShowToast(nextState ? `Đã theo dõi @${currentShort.channel}` : `Đã hủy theo dõi @${currentShort.channel}`);
    setTimeout(() => setShowToast(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div 
      ref={modalContainerRef}
      className="fixed inset-0 z-[200] bg-black flex items-center justify-center overflow-hidden animate-fadeIn select-none w-screen h-[100dvh]"
      onWheel={handleWheel}
    >
      
      {/* ── Ambient Backdrop (Sáng đẹp trên màn hình Tablet & PC) ── */}
      <div 
        className="absolute inset-0 bg-cover bg-center filter blur-3xl opacity-20 scale-125 pointer-events-none transition-all duration-700 hidden sm:block"
        style={{ backgroundImage: `url(${currentShort.thumbnail})` }}
      />

      {/* ── Floating PC Keyboard & Mouse Hint (Trợ năng tinh gọn trên PC) ── */}
      <div className={`hidden 2xl:flex flex-col gap-2 absolute left-6 bottom-20 z-30 transition-opacity duration-300 ${
        isControlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}>
        <div className="p-3 rounded-2xl bg-black/60 border border-white/15 backdrop-blur-md text-[10.5px] text-neutral-300 flex flex-col gap-1 max-w-[200px] shadow-2xl">
          <p className="font-extrabold text-white flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            Phím tắt điều khiển:
          </p>
          <p>🖱️ Lăn chuột / ↑↓ : Đổi clip</p>
          <p>R : 16:9 Toàn cảnh / 9:16 Dọc</p>
          <p>L / P : Danh sách phát</p>
          <p>C : Danh sách kênh TV</p>
          <p>M : Bật/Tắt âm thanh</p>
          <p>F : Toàn màn hình</p>
          <p>Esc : Đóng video</p>
        </div>
      </div>

      {/* ── Khung Video Chính (Chiếm trọn toàn màn hình Fullscreen Cinema) ── */}
      <div 
        className={`relative bg-black overflow-hidden flex flex-col justify-between shrink-0 transition-all duration-300 ${
          isLandscape
            ? 'w-full h-full max-w-full max-h-[100dvh] rounded-none border-none shadow-none'
            : 'w-full h-[100dvh] sm:w-auto sm:h-full aspect-[9/16] max-w-[100vw] sm:rounded-2xl sm:border sm:border-white/15 sm:shadow-[0_0_80px_rgba(0,0,0,0.95)]'
        }`}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
      >
        {/* ── TRÌNH PHÁT YOUTUBE SHORTS HOẶC VIDEO BẢN TIN TRANG (HIỆU ỨNG TỰ ĐỘNG CUỘN TRƯỢT DỌC REEL) ── */}
        <div 
          className={`w-full h-full absolute inset-0 transition-all duration-300 ease-out pointer-events-auto ${
            slideTransition === 'slide-up'
              ? '-translate-y-full opacity-40 scale-95'
              : slideTransition === 'slide-down'
              ? 'translate-y-full opacity-40 scale-95'
              : 'translate-y-0 opacity-100 scale-100'
          }`}
        >
          {currentShort.youtubeId ? (
            <div className="w-full h-full absolute inset-0 bg-black overflow-hidden pointer-events-auto notranslate" translate="no">
              <iframe
                ref={iframeRef}
                key={`${currentShort.youtubeId}-${isMuted ? 'muted' : 'unmuted'}`}
                src={`https://www.youtube-nocookie.com/embed/${currentShort.youtubeId}?autoplay=1&mute=${isMuted ? 1 : 0}&controls=0&playsinline=1&rel=0&modestbranding=1&enablejsapi=1&cc_load_policy=0&iv_load_policy=3&fs=0&disablekb=1&hl=vi&origin=${encodeURIComponent(window.location.origin)}&widget_referrer=${encodeURIComponent(window.location.origin)}`}
                title={cleanVideoTitle(currentShort.title)}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                className="w-full h-full border-0 absolute inset-0 z-0 bg-black pointer-events-auto"
                onLoad={(e) => {
                  const ifr = e.target as HTMLIFrameElement;
                  try {
                    ifr?.contentWindow?.postMessage(
                      JSON.stringify({ event: 'listening' }),
                      '*'
                    );
                    // Triệt tiêu ngay quảng cáo, phụ đề và dịch tự động của YouTube
                    suppressAdsAndCaptions(ifr?.contentWindow);
                    setTimeout(() => suppressAdsAndCaptions(ifr?.contentWindow), 400);
                    setTimeout(() => suppressAdsAndCaptions(ifr?.contentWindow), 1200);
                    setTimeout(() => suppressAdsAndCaptions(ifr?.contentWindow), 2500);
                  } catch {}
                }}
              />
            </div>
          ) : (
            /* Fallback video MP4 nếu có bài viết từ tin tức bản tin trang */
            <video
              key={currentShort.id || currentShort.videoUrl}
              src={currentShort.videoUrl}
              poster={currentShort.thumbnail}
              playsInline
              autoPlay
              onEnded={handleNextShort}
              muted={isMuted}
              className="w-full h-full object-cover absolute inset-0 cursor-pointer"
            />
          )}
        </div>

        {/* ── LỚP BẮT CỬ CHỈ VUỐT CHẠM (MOBILE/TABLET) VÀ LĂN CHUỘT (PC) ── */}
        <div 
          className="absolute inset-0 z-10 cursor-pointer"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onWheel={handleWheel}
          onClick={handleOverlayClick}
        />

        {/* Double Tap Flying Heart Animation */}
        {showHeartPop && (
          <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none animate-ping">
            <svg className="w-24 h-24 text-red-500 fill-current drop-shadow-2xl" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </div>
        )}

        {/* ── Top Header Overlay (Tràn 100% nổi trên video, tinh gọn và thoáng đãng) ── */}
        <div className="absolute top-0 inset-x-0 z-30 pt-3 px-4 sm:px-6 pb-10 bg-gradient-to-b from-black/95 via-black/50 to-transparent flex items-center justify-between pointer-events-none">
          {/* Logo Brand & Chọn Kênh bên trái (LUÔN HIỂN THỊ cả khi controls tự ẩn, theo đúng yêu cầu) */}
          <div className="flex flex-col min-w-0 pointer-events-auto select-none pl-1">
            <div className="flex items-center gap-2">
              <span className="text-white font-black text-[16px] tracking-tight drop-shadow-md leading-none flex items-center gap-1">
                <span className="text-[#ff315f]">Anx.</span>
                <span>TV</span>
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shrink-0"></span>

              {/* Nút Chọn Kênh TV (Phong cách Smart TV EPG) */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowChannelMenu(true);
                  resetInactivityTimer();
                }}
                className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/60 hover:bg-black/85 active:scale-95 border border-white/20 backdrop-blur-md text-white transition-all shadow-md group cursor-pointer"
                title="Mở menu chọn kênh truyền hình & phân loại (TV EPG) [C]"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping shrink-0"></span>
                <span className="text-[11px] font-bold text-white flex items-center gap-1">
                  <span className="text-[#ff315f] font-mono text-[10px]">{currentChannelInfo.number}</span>
                  <span className="max-w-[70px] sm:max-w-[120px] truncate">{currentChannelInfo.name}</span>
                </span>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-white/70 group-hover:translate-y-0.5 transition-transform shrink-0">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>
            </div>
            <span className="text-[10.5px] text-white/80 font-medium drop-shadow mt-0.5 truncate">
              {isLandscape ? 'Toàn cảnh 16:9 • Fullscreen' : `${currentChannelInfo.tagline.split('-')[0].trim() || 'Thời Tiết & Tin Tức 24h'}`}
            </span>
          </div>

          {/* Quick Format Filter Tabs in center of Header (Desktop/Tablet) */}
          <div className="hidden md:flex items-center gap-1 pointer-events-auto bg-black/50 backdrop-blur-md px-2 py-1 rounded-full border border-white/15 shadow-md">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSelectMediaTab('all');
                resetInactivityTimer();
              }}
              className={`px-3 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-all active:scale-95 ${
                mediaTab === 'all'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-neutral-300 hover:text-white hover:bg-white/10'
              }`}
            >
              📺 Tất cả
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSelectMediaTab('video');
                resetInactivityTimer();
              }}
              className={`px-3 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-all active:scale-95 ${
                mediaTab === 'video'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-neutral-300 hover:text-white hover:bg-white/10'
              }`}
            >
              🎬 Video kênh
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSelectMediaTab('short');
                resetInactivityTimer();
              }}
              className={`px-3 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-all active:scale-95 ${
                mediaTab === 'short'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-neutral-300 hover:text-white hover:bg-white/10'
              }`}
            >
              ⚡ Shorts
            </button>
          </div>

          {/* Controls: Tỉ lệ, Playlist, Âm thanh, Fullscreen, Đóng (Tự động ẩn sau 5s khi không tương tác) */}
          <div className={`flex items-center gap-2 pointer-events-auto transition-opacity duration-300 ${
            isControlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}>
            {/* Nút Chuyển Đổi Kích Thước: 16:9 Toàn Cảnh / 9:16 Dọc */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleOrientation();
                resetInactivityTimer();
              }}
              style={{ height: '36px', borderRadius: '18px', padding: '0 12px' }}
              className={`flex items-center gap-1.5 backdrop-blur-md border cursor-pointer active:scale-95 transition-all text-[11px] font-bold shadow-md ${
                isLandscape
                  ? 'bg-[#ff315f] text-white border-[#ff315f] shadow-[0_0_12px_rgba(255,49,95,0.5)]'
                  : 'bg-black/60 hover:bg-black/80 text-white border-white/20'
              }`}
              title={isLandscape ? "Đang ở chế độ Toàn Cảnh 16:9 - Bấm để xem Dọc 9:16 [Phím R]" : "Đang ở chế độ Dọc 9:16 - Bấm để phóng to Toàn Cảnh 16:9 [Phím R]"}
            >
              <span className="text-[12px]">{isLandscape ? '🖥️' : '📱'}</span>
              <span className="hidden sm:inline">{isLandscape ? '16:9 Toàn cảnh' : '9:16 Dọc'}</span>
              <span className="text-[9px] opacity-75 font-mono bg-white/20 px-1 py-0.2 rounded">R</span>
            </button>

            {/* Nút Bật/Tắt Danh Sách Phát trên Video */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowPlaylistDrawer(!showPlaylistDrawer);
                resetInactivityTimer();
              }}
              style={{ height: '36px', borderRadius: '18px', padding: '0 12px' }}
              className={`flex items-center gap-1.5 backdrop-blur-md border cursor-pointer active:scale-95 transition-all text-[11px] font-bold shadow-md ${
                showPlaylistDrawer
                  ? 'bg-red-600 text-white border-red-400 shadow-[0_0_12px_rgba(239,68,68,0.5)]'
                  : 'bg-black/60 hover:bg-black/80 text-white border-white/20'
              }`}
              title="Mở Danh Sách Phát trực tiếp trên video [Phím L / P]"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3">
                <line x1="8" y1="6" x2="21" y2="6"/>
                <line x1="8" y1="12" x2="21" y2="12"/>
                <line x1="8" y1="18" x2="21" y2="18"/>
                <line x1="3" y1="6" x2="3.01" y2="6"/>
                <line x1="3" y1="12" x2="3.01" y2="12"/>
                <line x1="3" y1="18" x2="3.01" y2="18"/>
              </svg>
              <span>Danh sách ({playlist.length})</span>
              <span className="text-[9px] opacity-75 font-mono bg-white/20 px-1 py-0.2 rounded hidden sm:inline">L</span>
            </button>

            {/* Nút Chọn Kênh TV */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowChannelMenu(true);
                resetInactivityTimer();
              }}
              style={{ width: '36px', height: '36px', minWidth: '36px', minHeight: '36px', maxWidth: '36px', maxHeight: '36px', borderRadius: '50%', aspectRatio: '1 / 1', padding: 0, margin: 0, boxSizing: 'border-box' }}
              className={`w-9 h-9 aspect-square rounded-full flex items-center justify-center shrink-0 min-h-0 p-0 m-0 backdrop-blur-md border cursor-pointer active:scale-90 transition-all ${
                showChannelMenu 
                  ? 'bg-red-600 text-white border-red-400 shadow-md' 
                  : 'bg-black/60 hover:bg-black/80 text-white border-white/20'
              }`}
              title="Danh sách kênh truyền hình (TV Channels) [C]"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="shrink-0 block m-auto">
                <rect x="2" y="7" width="20" height="15" rx="2" ry="2"/>
                <polyline points="17 2 12 7 7 2"/>
              </svg>
            </button>

            {/* Quick sound toggle */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMuted(!isMuted);
                resetInactivityTimer();
              }}
              style={{ width: '36px', height: '36px', minWidth: '36px', minHeight: '36px', maxWidth: '36px', maxHeight: '36px', borderRadius: '50%', aspectRatio: '1 / 1', padding: 0, margin: 0, boxSizing: 'border-box' }}
              className={`w-9 h-9 aspect-square rounded-full flex items-center justify-center shrink-0 min-h-0 p-0 m-0 backdrop-blur-md border cursor-pointer active:scale-90 transition-all ${
                isMuted 
                  ? 'bg-red-600/80 hover:bg-red-600 text-white border-red-400 shadow-md' 
                  : 'bg-black/60 hover:bg-black/80 text-white border-white/20'
              }`}
              title={isMuted ? 'Đang tắt tiếng - Nhấn để Bật âm thanh (M)' : 'Đang bật âm thanh - Nhấn để Tắt tiếng (M)'}
            >
              {isMuted ? (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="shrink-0 block m-auto"><line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/></svg>
              ) : (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="shrink-0 block m-auto"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
              )}
            </button>

            {/* Browser Fullscreen Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleBrowserFullscreen();
                resetInactivityTimer();
              }}
              style={{ width: '36px', height: '36px', minWidth: '36px', minHeight: '36px', maxWidth: '36px', maxHeight: '36px', borderRadius: '50%', aspectRatio: '1 / 1', padding: 0, margin: 0, boxSizing: 'border-box' }}
              className="w-9 h-9 aspect-square rounded-full flex items-center justify-center shrink-0 min-h-0 p-0 m-0 bg-black/60 hover:bg-black/80 text-white backdrop-blur-md border border-white/20 cursor-pointer active:scale-90 transition-all"
              title={isFullscreen ? 'Thoát toàn màn hình (F / Esc)' : 'Toàn màn hình trình duyệt (F)'}
            >
              {isFullscreen ? (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="shrink-0 block m-auto"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/></svg>
              ) : (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="shrink-0 block m-auto"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
              )}
            </button>

            {/* Close Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              style={{ width: '36px', height: '36px', minWidth: '36px', minHeight: '36px', maxWidth: '36px', maxHeight: '36px', borderRadius: '50%', aspectRatio: '1 / 1', padding: 0, margin: 0, boxSizing: 'border-box' }}
              className="w-9 h-9 aspect-square rounded-full flex items-center justify-center shrink-0 min-h-0 p-0 m-0 bg-black/60 hover:bg-red-600 text-white backdrop-blur-md border border-white/20 cursor-pointer active:scale-90 transition-all"
              title="Đóng (Esc)"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="shrink-0 block m-auto"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        </div>

        {/* ── Quick TV Channel Pills Bar (Dải chọn nhanh kênh TV như trên Smart TV) ── */}
        <div className={`absolute top-14 inset-x-0 z-30 px-3.5 transition-opacity duration-300 pointer-events-auto ${
          isControlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}>
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {TV_CHANNELS.map(ch => {
              const isActive = selectedChannelId === ch.id;
              return (
                <button
                  key={ch.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectChannel(ch.id);
                  }}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap backdrop-blur-md transition-all border cursor-pointer active:scale-95 shadow-md ${
                    isActive 
                      ? 'bg-red-600 text-white border-red-400 shadow-[0_0_12px_rgba(239,68,68,0.6)]' 
                      : 'bg-black/60 hover:bg-black/85 text-white/90 border-white/15'
                  }`}
                >
                  <span className={`text-[9.5px] font-mono px-1 py-0.2 rounded ${isActive ? 'bg-black/30 text-white' : 'bg-white/10 text-white/70'}`}>
                    {ch.number}
                  </span>
                  <span>{ch.name}</span>
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping shrink-0"></span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Cột Tương Tác: Like, Comment, Share, YouTube (Icon tròn 100% không bị méo, tự ẩn khi không tương tác) ── */}
        <div className={`absolute z-30 select-none transition-opacity duration-300 ${
          isLandscape 
            ? 'right-4 bottom-3 flex flex-row items-center gap-3' 
            : 'right-3 bottom-16 flex flex-col items-center gap-3.5'
        } ${isControlsVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
          
          {/* Like ❤️ Button */}
          <div className="flex flex-col items-center gap-1 shrink-0 select-none">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleLike();
                resetInactivityTimer();
              }}
              style={{ width: '42px', height: '42px', minWidth: '42px', minHeight: '42px', maxWidth: '42px', maxHeight: '42px', borderRadius: '50%', aspectRatio: '1 / 1', padding: 0, margin: 0, boxSizing: 'border-box' }}
              className={`w-[42px] h-[42px] aspect-square shrink-0 rounded-full flex items-center justify-center backdrop-blur-md transition-all shadow-lg cursor-pointer active:scale-90 border ${
                likedMap[currentShort.id]
                  ? 'bg-red-600 text-white border-red-500 shadow-red-500/50'
                  : 'bg-black/50 text-white hover:bg-black/70 border-white/20'
              }`}
              title="Thích video"
            >
              <svg className={`w-5 h-5 shrink-0 block m-auto ${likedMap[currentShort.id] ? 'fill-current' : 'fill-none'}`} viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
            <span className="text-[10px] font-bold text-white drop-shadow">
              {(likesMap[currentShort.id] ?? currentShort.likes).toLocaleString('vi-VN')}
            </span>
          </div>

          {/* Comments 💬 Button */}
          <div className="flex flex-col items-center gap-1 shrink-0 select-none">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowComments(!showComments);
                resetInactivityTimer();
              }}
              style={{ width: '42px', height: '42px', minWidth: '42px', minHeight: '42px', maxWidth: '42px', maxHeight: '42px', borderRadius: '50%', aspectRatio: '1 / 1', padding: 0, margin: 0, boxSizing: 'border-box' }}
              className="w-[42px] h-[42px] aspect-square shrink-0 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-md border border-white/20 shadow-lg cursor-pointer active:scale-90 transition-all"
              title="Bình luận"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 block m-auto"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            </button>
            <span className="text-[10px] font-bold text-white drop-shadow">
              {currentShort.commentsCount || 140}
            </span>
          </div>

          {/* Share ↗️ Button */}
          <div className="flex flex-col items-center gap-1 shrink-0 select-none">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleShare();
                resetInactivityTimer();
              }}
              style={{ width: '42px', height: '42px', minWidth: '42px', minHeight: '42px', maxWidth: '42px', maxHeight: '42px', borderRadius: '50%', aspectRatio: '1 / 1', padding: 0, margin: 0, boxSizing: 'border-box' }}
              className="w-[42px] h-[42px] aspect-square shrink-0 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-md border border-white/20 shadow-lg cursor-pointer active:scale-90 transition-all"
              title="Chia sẻ video"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 block m-auto"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
            </button>
            <span className="text-[10px] font-bold text-white drop-shadow">
              Chia sẻ
            </span>
          </div>

          {/* Playlist 📋 Button */}
          <div className="flex flex-col items-center gap-1 shrink-0 select-none">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowPlaylistDrawer(!showPlaylistDrawer);
                resetInactivityTimer();
              }}
              style={{ width: '42px', height: '42px', minWidth: '42px', minHeight: '42px', maxWidth: '42px', maxHeight: '42px', borderRadius: '50%', aspectRatio: '1 / 1', padding: 0, margin: 0, boxSizing: 'border-box' }}
              className={`w-[42px] h-[42px] aspect-square shrink-0 rounded-full flex items-center justify-center backdrop-blur-md border shadow-lg cursor-pointer active:scale-90 transition-all ${
                showPlaylistDrawer
                  ? 'bg-red-600 text-white border-red-500 shadow-red-500/50'
                  : 'bg-black/50 hover:bg-black/70 text-white border-white/20'
              }`}
              title="Danh sách phát trên video [Phím L / P]"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="shrink-0 block m-auto">
                <line x1="8" y1="6" x2="21" y2="6"/>
                <line x1="8" y1="12" x2="21" y2="12"/>
                <line x1="8" y1="18" x2="21" y2="18"/>
                <line x1="3" y1="6" x2="3.01" y2="6"/>
                <line x1="3" y1="12" x2="3.01" y2="12"/>
                <line x1="3" y1="18" x2="3.01" y2="18"/>
              </svg>
            </button>
            <span className="text-[10px] font-bold text-white drop-shadow">
              List
            </span>
          </div>
        </div>

        {/* ── Bottom Video Overlay: Kênh, Tiêu Đề & Hashtags (Tự động ẩn sau 5s khi không thao tác) ── */}
        <div className={`absolute bottom-0 inset-x-0 z-20 p-4 ${isLandscape ? 'pb-3 pr-[260px]' : 'pb-4 pr-16'} bg-gradient-to-t from-black via-black/85 to-transparent flex flex-col gap-2 transition-opacity duration-300 ${
          isControlsVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}>
          
          {/* Channel Info, Logo Trang, Nhãn BẢN TIN TRANG & Nút Chuông (Icon tròn 100% không méo) */}
          <div className="flex items-center gap-2 pointer-events-auto max-w-full overflow-hidden">
            <div 
              style={{ width: '32px', height: '32px', minWidth: '32px', minHeight: '32px', maxWidth: '32px', maxHeight: '32px', borderRadius: '50%', aspectRatio: '1 / 1', padding: 0, margin: 0, boxSizing: 'border-box' }}
              className="w-8 h-8 rounded-full overflow-hidden border border-white/25 shadow-md shrink-0 bg-[#ff315f] flex items-center justify-center font-black text-white text-[12px] select-none"
            >
              {currentShort.isSiteNews || currentShort.badge === 'BẢN TIN TRANG' ? (
                <span className="font-bold text-[11px] text-white tracking-tight">Anx</span>
              ) : (
                <span className="font-bold text-[12px] text-white">{currentShort.channel.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div className="flex items-center gap-1 min-w-0 shrink">
              <span className="font-extrabold text-[13px] text-white truncate drop-shadow">
                @{currentShort.channel}
              </span>
              <span 
                style={{ width: '14px', height: '14px', minWidth: '14px', minHeight: '14px', maxWidth: '14px', maxHeight: '14px', borderRadius: '50%', aspectRatio: '1 / 1', padding: 0, margin: 0, boxSizing: 'border-box' }}
                className="w-3.5 h-3.5 rounded-full bg-blue-500 text-white flex items-center justify-center text-[9px] shrink-0 font-bold"
              >
                ✓
              </span>
            </div>

            {/* Nhãn nổi bật: BẢN TIN TRANG (nếu là video của trang web) hoặc chuyên mục */}
            {currentShort.badge === 'BẢN TIN TRANG' ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-600 text-white shadow-md border border-red-400/40 shrink-0 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                BẢN TIN TRANG
              </span>
            ) : (
              <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-white/20 text-white/90 backdrop-blur-sm shrink-0">
                {currentShort.badge}
              </span>
            )}

            {/* Nút icon chuông quan tâm / theo dõi kênh (chuẩn hình tròn width = height = 32px) */}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                toggleFollowChannel();
                resetInactivityTimer();
              }}
              style={{ width: '32px', height: '32px', minWidth: '32px', minHeight: '32px', maxWidth: '32px', maxHeight: '32px', borderRadius: '50%', aspectRatio: '1 / 1', padding: 0, margin: 0, boxSizing: 'border-box' }}
              className={`w-8 h-8 aspect-square rounded-full flex items-center justify-center shrink-0 min-h-0 p-0 m-0 border backdrop-blur-md cursor-pointer transition-all active:scale-90 ml-1 ${
                isFollowingChannel
                  ? 'bg-[#ff315f] border-[#ff315f] text-white shadow-[0_0_10px_rgba(255,49,95,0.5)]'
                  : 'bg-white/10 hover:bg-white/20 border-white/25 text-neutral-300 hover:text-white'
              }`}
              title={isFollowingChannel ? "Đang theo dõi kênh" : "Nhấn để quan tâm/theo dõi kênh"}
            >
              {isFollowingChannel ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="shrink-0 block m-auto"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="shrink-0 block m-auto"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/><line x1="12" y1="2" x2="12" y2="4"/></svg>
              )}
            </button>
          </div>

          {/* Title & Description */}
          <p 
            className={`text-[13px] sm:text-[13.5px] font-medium text-white ${isLandscape ? 'line-clamp-1 max-w-[90%]' : 'line-clamp-2'} drop-shadow leading-snug notranslate`}
            translate="no"
          >
            {cleanVideoTitle(currentShort.title)}
          </p>

          {/* Hashtags (chữ thường, màu #000000, nền sáng thanh lịch tránh sặc sỡ) & Số thứ tự clip */}
          <div className="flex items-center gap-1.5 text-[11px] font-medium flex-wrap">
            <span 
              className="px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-sm text-[10px] font-bold tracking-tight shadow-sm"
              style={{ color: '#000000' }}
            >
              #shorts
            </span>
            <span 
              className="px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-sm text-[10px] font-bold tracking-tight shadow-sm"
              style={{ color: '#000000' }}
            >
              #tintuc24h
            </span>
            <span 
              className="px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-sm text-[10px] font-bold tracking-tight shadow-sm"
              style={{ color: '#000000' }}
            >
              #thoisu
            </span>
            <span className="ml-auto text-[10px] text-white/70 font-semibold drop-shadow">
              {currentIndex + 1} / {playlist.length}
            </span>
          </div>
        </div>
      </div>

      {/* ── On-Video Playlist Overlay (Danh Sách Hiển Thị Trực Tiếp TRÊN VIDEO) ── */}
      {showPlaylistDrawer && (
        <div 
          className="absolute inset-0 z-40 flex justify-end animate-fadeIn select-none"
          onClick={() => setShowPlaylistDrawer(false)}
        >
          {/* Backdrop mờ phía sau - bấm ra ngoài để đóng danh sách */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-xs cursor-pointer" />

          {/* Panel Danh Sách Nổi Trực Tiếp Trên Video (Kính mờ cao cấp) */}
          <div 
            className="relative w-full sm:w-[420px] md:w-[460px] h-full bg-[#0d0d10]/92 backdrop-blur-2xl border-l border-white/15 p-4 sm:p-5 flex flex-col shadow-[-20px_0_60px_rgba(0,0,0,0.85)] z-50 animate-slideLeft text-white"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header: Tiêu đề danh sách, số clip & nút Đóng */}
            <div className="flex items-center justify-between pb-3.5 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div 
                  style={{ width: '36px', height: '36px', minWidth: '36px', minHeight: '36px', maxWidth: '36px', maxHeight: '36px', borderRadius: '50%', aspectRatio: '1 / 1', padding: 0, margin: 0, boxSizing: 'border-box' }}
                  className="w-9 h-9 aspect-square rounded-full bg-gradient-to-tr from-red-600 to-pink-500 flex items-center justify-center text-white shadow-lg shrink-0 border border-white/20"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3">
                    <line x1="8" y1="6" x2="21" y2="6"/>
                    <line x1="8" y1="12" x2="21" y2="12"/>
                    <line x1="8" y1="18" x2="21" y2="18"/>
                    <line x1="3" y1="6" x2="3.01" y2="6"/>
                    <line x1="3" y1="12" x2="3.01" y2="12"/>
                    <line x1="3" y1="18" x2="3.01" y2="18"/>
                  </svg>
                </div>
                <div className="flex flex-col min-w-0">
                  <h3 className="font-extrabold text-[15px] text-white flex items-center gap-2 truncate">
                    <span>DANH SÁCH PHÁT</span>
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0"></span>
                  </h3>
                  <span className="text-[11px] text-neutral-400 truncate">
                    {currentChannelInfo.id === 'all' ? 'Bản Tin Đa Kênh Tổng Hợp' : `${currentChannelInfo.number} • ${currentChannelInfo.name}`} ({playlist.length} clip)
                  </span>
                </div>
              </div>

              <button
                onClick={() => setShowPlaylistDrawer(false)}
                style={{ width: '32px', height: '32px', minWidth: '32px', minHeight: '32px', maxWidth: '32px', maxHeight: '32px', borderRadius: '50%', aspectRatio: '1 / 1', padding: 0, margin: 0, boxSizing: 'border-box' }}
                className="w-8 h-8 aspect-square rounded-full flex items-center justify-center shrink-0 min-h-0 p-0 m-0 bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white border border-white/15 cursor-pointer active:scale-90 transition-all"
                title="Đóng danh sách (Esc)"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            {/* Quick Format Filter Tabs: Tất cả | Video Kênh | Shorts */}
            <div className="flex items-center gap-1.5 py-2.5 border-b border-white/10 shrink-0 overflow-x-auto no-scrollbar">
              <button
                onClick={() => handleSelectMediaTab('all')}
                className={`px-3 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-all shrink-0 active:scale-95 ${
                  mediaTab === 'all'
                    ? 'bg-red-600 text-white shadow-md border border-red-400'
                    : 'bg-white/5 hover:bg-white/10 text-neutral-300 border border-white/10'
                }`}
              >
                📺 Tất cả ({multiChannelVideos.length})
              </button>
              <button
                onClick={() => handleSelectMediaTab('video')}
                className={`px-3 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-all shrink-0 active:scale-95 ${
                  mediaTab === 'video'
                    ? 'bg-red-600 text-white shadow-md border border-red-400'
                    : 'bg-white/5 hover:bg-white/10 text-neutral-300 border border-white/10'
                }`}
              >
                🎬 Video kênh
              </button>
              <button
                onClick={() => handleSelectMediaTab('short')}
                className={`px-3 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-all shrink-0 active:scale-95 ${
                  mediaTab === 'short'
                    ? 'bg-red-600 text-white shadow-md border border-red-400'
                    : 'bg-white/5 hover:bg-white/10 text-neutral-300 border border-white/10'
                }`}
              >
                ⚡ Shorts
              </button>
            </div>

            {/* Dải chọn nhanh kênh TV trực tiếp trong drawer */}
            <div className="flex items-center gap-1.5 py-2 border-b border-white/10 shrink-0 overflow-x-auto no-scrollbar">
              {TV_CHANNELS.map(ch => {
                const isActive = selectedChannelId === ch.id;
                return (
                  <button
                    key={ch.id}
                    onClick={() => handleSelectChannel(ch.id)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10.5px] font-bold whitespace-nowrap cursor-pointer transition-all active:scale-95 border ${
                      isActive 
                        ? 'bg-red-600 text-white border-red-400 shadow-sm' 
                        : 'bg-white/5 hover:bg-white/10 text-neutral-300 border-white/10'
                    }`}
                  >
                    <span className="font-mono text-[9px] opacity-80">{ch.number}</span>
                    <span>{ch.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Cuộn danh sách video clip */}
            <div className="flex-1 overflow-y-auto no-scrollbar py-3 flex flex-col gap-2.5 pr-1">
              {playlist.map((item, idx) => {
                const isSelected = idx === currentIndex;
                return (
                  <div
                    key={`${item.id}-${idx}`}
                    onClick={() => {
                      handleSelectIndex(idx);
                      if (typeof window !== 'undefined' && window.innerWidth < 640) {
                        setShowPlaylistDrawer(false);
                      }
                    }}
                    className={`flex items-center gap-3 p-2.5 rounded-2xl cursor-pointer transition-all border ${
                      isSelected
                        ? 'bg-red-600/25 border-red-500 shadow-md ring-1 ring-red-500/40'
                        : 'bg-white/5 hover:bg-white/10 border-transparent text-neutral-300'
                    }`}
                  >
                    <div className="w-20 h-14 sm:w-22 sm:h-15 rounded-xl bg-black relative overflow-hidden shrink-0 border border-white/10">
                      <img 
                        src={item.thumbnail} 
                        alt="" 
                        className="w-full h-full object-cover" 
                      />
                      <div className="absolute bottom-1 right-1 px-1.5 py-0.2 rounded bg-black/80 text-[9px] font-bold text-white">
                        {item.duration || 'Shorts'}
                      </div>
                      {isSelected && (
                        <div className="absolute inset-0 bg-red-600/40 flex items-center justify-center">
                          <span className="w-3 h-3 rounded-full bg-white animate-ping"></span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded ${
                          item.badge === 'BẢN TIN TRANG'
                            ? 'bg-red-600/30 text-red-400 font-black'
                            : 'bg-white/10 text-neutral-300'
                        }`}>
                          {item.badge}
                        </span>
                        {isSelected && (
                          <span className="text-[9.5px] font-bold text-red-400 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                            Đang phát
                          </span>
                        )}
                      </div>
                      <p className={`text-[12px] font-semibold line-clamp-2 mt-0.5 leading-snug ${isSelected ? 'text-white font-bold' : 'text-neutral-200'}`}>
                        {item.title}
                      </p>
                      <span className="text-[10px] text-neutral-400 mt-0.5 truncate">
                        {item.channel}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Điều hướng Trước / Sau dưới chân drawer */}
            <div className="flex items-center gap-2 pt-3 border-t border-white/10 shrink-0">
              <button
                onClick={handlePrevShort}
                className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-[12px] flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-95"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="18 15 12 9 6 15"/></svg>
                <span>Clip Trước</span>
              </button>
              <button
                onClick={handleNextShort}
                className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-[12px] flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-95 shadow-md shadow-red-600/40"
              >
                <span>Clip Sau</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Smart TV Channel Guide & Media Selector (Menu Chọn Kênh Truyền Hình Phong Cách Tivi EPG) ── */}
      {showChannelMenu && (
        <div 
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-3 sm:p-6 animate-fadeIn"
          onClick={() => setShowChannelMenu(false)}
        >
          <div 
            className="w-full max-w-3xl max-h-[92vh] bg-neutral-950/95 border border-white/20 rounded-3xl shadow-[0_0_80px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden text-white animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header: TV Guide Title & Close */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/10 bg-gradient-to-r from-red-950/40 via-neutral-900/60 to-neutral-900/40">
              <div className="flex items-center gap-3 min-w-0">
                <div 
                  style={{ width: '42px', height: '42px', minWidth: '42px', minHeight: '42px', maxWidth: '42px', maxHeight: '42px', borderRadius: '50%', aspectRatio: '1 / 1', padding: 0, margin: 0, boxSizing: 'border-box' }}
                  className="w-10 h-10 aspect-square rounded-full bg-gradient-to-tr from-red-600 to-pink-500 flex items-center justify-center text-white shadow-lg shrink-0 border border-white/20"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="shrink-0 block m-auto">
                    <rect x="2" y="7" width="20" height="15" rx="2" ry="2"/>
                    <polyline points="17 2 12 7 7 2"/>
                  </svg>
                </div>
                <div className="flex flex-col min-w-0">
                  <h3 className="text-[16px] sm:text-[18px] font-black text-white flex items-center gap-2 tracking-tight">
                    <span>DANH SÁCH KÊNH TRUYỀN HÌNH</span>
                    <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-600/30 text-red-400 border border-red-500/30">
                      SMART TV EPG
                    </span>
                  </h3>
                  <p className="text-[12px] text-neutral-400 truncate">
                    Chọn kênh để phát tức thì từ video mới nhất • Đang xem: <span className="text-white font-bold">{currentChannelInfo.number} • {currentChannelInfo.name}</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowChannelMenu(false)}
                style={{ width: '36px', height: '36px', minWidth: '36px', minHeight: '36px', maxWidth: '36px', maxHeight: '36px', borderRadius: '50%', aspectRatio: '1 / 1', padding: 0, margin: 0, boxSizing: 'border-box' }}
                className="w-9 h-9 aspect-square rounded-full flex items-center justify-center shrink-0 min-h-0 p-0 m-0 bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white border border-white/15 cursor-pointer active:scale-90 transition-all ml-2"
                title="Đóng (Esc)"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="shrink-0 block m-auto"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            {/* Phân Tab Định Dạng: Tất cả | Video Kênh | Shorts (Đáp ứng yêu cầu: sau chạy ngon lành thì phân tab video và short) */}
            <div className="flex items-center gap-2 p-3 sm:px-5 bg-white/[0.02] border-b border-white/10 overflow-x-auto no-scrollbar">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 shrink-0 mr-1 flex items-center gap-1">
                <span>Định dạng:</span>
              </span>

              <button
                onClick={() => handleSelectMediaTab('all')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-bold cursor-pointer transition-all shrink-0 active:scale-95 ${
                  mediaTab === 'all'
                    ? 'bg-red-600 text-white shadow-md shadow-red-600/40 border border-red-400'
                    : 'bg-white/5 hover:bg-white/10 text-neutral-300 border border-white/10'
                }`}
              >
                <span>📺 Tất cả</span>
                <span className="text-[10px] opacity-80 font-mono">
                  ({channelCountMap[selectedChannelId] !== undefined ? channelCountMap[selectedChannelId] : allAvailableVideos.length})
                </span>
              </button>

              <button
                onClick={() => handleSelectMediaTab('video')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-bold cursor-pointer transition-all shrink-0 active:scale-95 ${
                  mediaTab === 'video'
                    ? 'bg-red-600 text-white shadow-md shadow-red-600/40 border border-red-400'
                    : 'bg-white/5 hover:bg-white/10 text-neutral-300 border border-white/10'
                }`}
              >
                <span>🎬 Video trên kênh (Tin tức / Phóng sự)</span>
              </button>

              <button
                onClick={() => handleSelectMediaTab('short')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-bold cursor-pointer transition-all shrink-0 active:scale-95 ${
                  mediaTab === 'short'
                    ? 'bg-red-600 text-white shadow-md shadow-red-600/40 border border-red-400'
                    : 'bg-white/5 hover:bg-white/10 text-neutral-300 border border-white/10'
                }`}
              >
                <span>⚡ Shorts ngắn (9:16)</span>
              </button>
            </div>

            {/* Grid danh sách kênh truyền hình TV_CHANNELS */}
            <div className="flex-1 overflow-y-auto no-scrollbar p-3.5 sm:p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-[56vh]">
              {TV_CHANNELS.map((ch) => {
                const isActive = selectedChannelId === ch.id;
                const count = channelCountMap[ch.id] || 0;

                return (
                  <div
                    key={ch.id}
                    onClick={() => handleSelectChannel(ch.id)}
                    className={`group relative p-3 sm:p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-2.5 ${
                      isActive
                        ? 'bg-gradient-to-br from-red-600/30 via-red-950/40 to-neutral-900 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.35)] scale-[1.01]'
                        : 'bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/25 text-neutral-300 hover:text-white'
                    }`}
                  >
                    {/* Top Row: Channel number + Logo + Live Badge */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-md font-mono text-[11px] font-black tracking-wider border ${
                          isActive 
                            ? 'bg-red-600 text-white border-red-400' 
                            : 'bg-black/60 text-neutral-300 border-white/15'
                        }`}>
                          {ch.number}
                        </span>

                        <span 
                          className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider"
                          style={{
                            backgroundColor: `${ch.logoColor}25`,
                            color: ch.logoColor,
                            border: `1px solid ${ch.logoColor}50`
                          }}
                        >
                          {ch.badgeText}
                        </span>
                      </div>

                      {isActive ? (
                        <span className="flex items-center gap-1 text-[10px] font-black text-red-400 tracking-wider">
                          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                          ĐANG PHÁT
                        </span>
                      ) : (
                        <span className="text-[11px] text-neutral-400 group-hover:text-neutral-200 transition-colors font-semibold">
                          {count} clip
                        </span>
                      )}
                    </div>

                    {/* Middle: Channel Name & Tagline */}
                    <div>
                      <h4 className={`text-[14px] font-black flex items-center gap-1.5 ${isActive ? 'text-white' : 'text-neutral-100 group-hover:text-white'}`}>
                        <span>{ch.name}</span>
                        {isActive && <span className="text-red-400">★</span>}
                      </h4>
                      <p className="text-[11px] text-neutral-400 line-clamp-2 mt-0.5 leading-snug">
                        {ch.tagline}
                      </p>
                    </div>

                    {/* Bottom: Action Button / Status */}
                    <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px]">
                      <span className="text-neutral-400 text-[10px]">
                        {ch.id === 'all' ? 'Đan xen các kênh' : 'Phát từ video mới nhất'}
                      </span>
                      <span className={`font-bold flex items-center gap-1 ${
                        isActive ? 'text-red-400' : 'text-neutral-400 group-hover:text-white'
                      }`}>
                        {isActive ? (
                          <>
                            <span>✓ Đang chọn</span>
                          </>
                        ) : (
                          <>
                            <span>Bật kênh</span>
                            <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer: Gợi ý phím tắt tiện ích */}
            <div className="p-3 sm:px-5 sm:py-3.5 bg-black/60 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-[11px] text-neutral-400">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-neutral-300">💡 Phím tắt TV:</span>
                <span className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono text-[10px]">[C]</span> <span>Mở kênh</span>
                <span className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono text-[10px]">[↑ / ↓]</span> <span>Chuyển clip</span>
                <span className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono text-[10px]">[M]</span> <span>Bật/Tắt âm</span>
                <span className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono text-[10px]">[R]</span> <span>Quay ngang 16:9</span>
              </div>
              <button
                onClick={() => setShowChannelMenu(false)}
                className="ml-auto px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold text-[11px] cursor-pointer transition-all active:scale-95"
              >
                Quay lại video (Esc)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Comments Drawer ── */}
      {showComments && (
        <div className="absolute inset-x-0 bottom-0 sm:inset-y-0 sm:right-0 sm:left-auto w-full sm:w-[380px] max-h-[80vh] sm:max-h-full bg-neutral-900/95 backdrop-blur-xl sm:rounded-l-3xl border-t sm:border-l border-white/15 shadow-2xl z-40 flex flex-col p-4 animate-slideUp">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h4 className="font-bold text-white text-[15px] flex items-center gap-2">
              <span>Bình luận</span>
              <span className="text-[12px] text-neutral-400">({commentsList.length})</span>
            </h4>
            <button 
              onClick={() => setShowComments(false)}
              style={{ width: '32px', height: '32px', minWidth: '32px', minHeight: '32px', maxWidth: '32px', maxHeight: '32px', padding: 0 }}
              className="w-8 h-8 min-w-[32px] min-h-[32px] max-w-[32px] max-h-[32px] aspect-square rounded-full flex items-center justify-center shrink-0 min-h-0 p-0 hover:bg-white/10 text-neutral-400 hover:text-white cursor-pointer"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar py-3 flex flex-col gap-3 min-h-[220px]">
            {commentsList.map((c, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-pink-500 to-red-500 text-white font-bold text-[11px] flex items-center justify-center shrink-0">
                  {c.user.charAt(0)}
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="font-bold text-[12px] text-white truncate">{c.user}</span>
                    <span className="text-[10px] text-neutral-400">{c.time}</span>
                  </div>
                  <p className="text-[12px] text-neutral-200 mt-0.5 leading-snug">{c.text}</p>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleAddComment} className="pt-2 border-t border-white/10 flex items-center gap-2">
            <input
              type="text"
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              placeholder="Thêm bình luận..."
              className="flex-1 px-3 py-2 rounded-full bg-white/10 text-white text-[12px] placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-red-500"
            />
            <button 
              type="submit"
              className="px-3 py-2 rounded-full bg-red-600 hover:bg-red-500 text-white text-[12px] font-bold cursor-pointer transition-all active:scale-95 shrink-0"
            >
              Gửi
            </button>
          </form>
        </div>
      )}

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[300] px-4 py-2 rounded-full bg-neutral-900/90 text-white text-[12px] font-semibold border border-white/20 shadow-2xl backdrop-blur-md animate-bounce">
          {showToast}
        </div>
      )}
    </div>
  );
}
