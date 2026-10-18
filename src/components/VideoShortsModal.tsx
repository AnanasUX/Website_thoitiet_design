import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { YOUTUBE_NEWS_DATABASE, cleanVideoTitle } from './YouTubeBroadcastPlayer';
import { fetchAndAttachYouTubeData } from '../App';

export interface ShortItem {
  id: string;
  youtubeId?: string;
  videoUrl?: string; // Fallback MP4 nếu có
  title: string;
  channel: string;
  channelId?: string;
  badge: 'TRỰC TIẾP' | 'BẢN TIN' | 'TIÊU ĐIỂM' | 'THỜI TIẾT' | 'TÀI CHÍNH' | 'THẾ GIỚI' | 'BẢN TIN TRANG';
  category: 'Thời sự 24h' | 'Thời tiết TV' | 'Tài chính & Vàng' | 'Thế giới & Cuộc sống';
  subCategory?: string; // Phân loại bản tin: 'Tin nóng 10 phút' | 'Tổng hợp tin tức hàng ngày' | 'Thế giới toàn cảnh' | 'Tin tức thời sự' | 'Shorts ngắn'
  duration?: string;
  thumbnail?: string;
  likes: number;
  commentsCount?: number;
  sharesCount?: number;
  publishedAt?: string;
  isSiteNews?: boolean;
  mediaType: 'video' | 'short'; // Phân loại: 'video' (trang chủ kênh, 16:9) hoặc 'short' (danh sách phát Shorts 9:16)
  aspectRatio?: '16:9' | '9:16';
}

// Chuyển đổi chuỗi duration dạng mm:ss hoặc hh:mm:ss thành số giây
export function parseDurationSeconds(d?: string): number {
  if (!d) return 55;
  if (/shorts/i.test(d)) return 55;
  const parts = d.split(':').map(Number);
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    return parts[0] * 60 + parts[1];
  }
  if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  return 55;
}

// ── Hàm triệt tiêu phụ đề, khử dịch tự động và tự động bỏ qua quảng cáo YouTube ──
export function suppressAdsAndCaptions(targetWin?: Window | null) {
  if (!targetWin) return;
  try {
    // 0. Tự động skip/bỏ qua quảng cáo YouTube nếu có
    targetWin.postMessage(JSON.stringify({ event: 'command', func: 'skipAd' }), '*');
    // 1. Gỡ bỏ module phụ đề / auto-translate
    targetWin.postMessage(JSON.stringify({ event: 'command', func: 'unloadModule', args: ['captions'] }), '*');
    // 2. Tắt track phụ đề (set track object rỗng)
    targetWin.postMessage(JSON.stringify({ event: 'command', func: 'setOption', args: ['captions', 'track', {}] }), '*');
    // 3. Tắt nạp lại phụ đề
    targetWin.postMessage(JSON.stringify({ event: 'command', func: 'setOption', args: ['captions', 'reload', false] }), '*');
    // 4. Giảm kích thước font phụ đề về 0 nếu trình duyệt vẫn cố hiển thị
    targetWin.postMessage(JSON.stringify({ event: 'command', func: 'setOption', args: ['captions', 'fontSize', -1] }), '*');
  } catch {}
}

// ── Danh sách các kênh tin tức chính thống (YouTube RSS fetch) ──
export const FEATURED_NEWS_CHANNELS = [
  // ── Kênh truyền hình nhà nước ──
  { id: 'UCabsTV34JwALXKGMqHpvUiA', name: 'VTV24' },
  { id: 'UCbN_rR_y_f5Qv8u7Y8h1zWw', name: 'VTV Thời Tiết' },
  { id: 'UCxI0jUuG4e2xP_7E4m5hXvw', name: 'VTC NOW' },
  { id: 'UCII2NTkfFTi8kLfbD4m7bXw', name: 'ANTV' },
  { id: 'UCkAeKEsxE-7Lz3GpzwRyBmA', name: 'HTV9' },
  // ── Báo điện tử lớn ──
  { id: 'UCIW9cGgoRuGJnky3K3tbzNg', name: 'Báo Thanh Niên' },
  { id: 'UCteGrHMrnQwx7Scx--7nyoA', name: 'Báo Tuổi Trẻ' },
  { id: 'UCFN0IoARjOAgx-OWr-JBIHg', name: 'Báo Lao Động' },
  { id: 'UC01aVq6gGvUe6F2Q6H_tPmg', name: 'Báo Tiền Phong' },
  { id: 'UCYpMOQ12RdAFqV_3V7rMEzA', name: 'VnExpress TV' },
  { id: 'UC4M4pMYLFkz0rfXD7PZFgXA', name: 'Zing News' },
  { id: 'UCl1gPAj1KTUjmCbk_3nHjWA', name: 'Báo Dân Trí' },
  { id: 'UCrWCqiGmHVyvECxMeHe4Ewg', name: 'Soha News' },
  { id: 'UCkQyElbqXlyf3x0UiTlqvGA', name: 'NDT Online' },
  { id: 'UCvSq7_KBGSqXqH9l3m6kKkA', name: 'VietnamPlus' },
  { id: 'UC2JGb9pNFqVMnl4NcTB6G1Q', name: 'VOV' },
  { id: 'UCLm3_C2oMilZPDyElEyBqPA', name: 'Kenh14 TV' },
  { id: 'UC0RM0MV8bLkM3FU6m3B3S-A', name: 'Người Đưa Tin' },
];

// ── Hình ảnh đại diện vector chất lượng cao cho danh sách kênh YouTube của người dùng ──
const VTV24_AVATAR = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="%23dc2626"/><circle cx="50" cy="50" r="44" fill="%23b91c1c"/><text x="50" y="38" text-anchor="middle" fill="white" font-family="Arial,sans-serif" font-weight="900" font-size="20" letter-spacing="1">VTV</text><text x="50" y="74" text-anchor="middle" fill="white" font-family="Arial,sans-serif" font-weight="900" font-size="38">24</text></svg>`;
const AN_MUSIC_AVATAR = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="%23f59e0b"/><circle cx="50" cy="50" r="44" fill="%23fbbf24"/><text x="50" y="44" text-anchor="middle" font-size="34">🎧</text><text x="50" y="78" text-anchor="middle" fill="%2378350f" font-family="Arial,sans-serif" font-weight="900" font-size="22">An#</text></svg>`;
const WAVE_MUSIC_AVATAR = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="%2318181b"/><circle cx="50" cy="50" r="45" fill="%2309090b" stroke="%233f3f46" stroke-width="2"/><path d="M22 50 Q30 25 38 50 T54 50 T70 50 T86 50" fill="none" stroke="%2338bdf8" stroke-width="4" stroke-linecap="round"/><text x="50" y="76" text-anchor="middle" fill="white" font-family="Arial,sans-serif" font-weight="900" font-size="12" letter-spacing="2">WAVE</text></svg>`;
const KIMPRO_AVATAR = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="%230f172a"/><circle cx="50" cy="50" r="44" fill="%231e293b"/><text x="50" y="44" text-anchor="middle" font-size="30">🎬</text><text x="50" y="66" text-anchor="middle" fill="%23facc15" font-family="Arial,sans-serif" font-weight="900" font-size="14">김프로</text><text x="50" y="82" text-anchor="middle" fill="white" font-family="Arial,sans-serif" font-weight="800" font-size="11" letter-spacing="1">KIMPRO</text></svg>`;
const JAY_PETS_AVATAR = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="%2314532d"/><circle cx="50" cy="50" r="44" fill="%23166534"/><text x="50" y="46" text-anchor="middle" font-size="34">🐍</text><text x="50" y="74" text-anchor="middle" fill="%23bbf7d0" font-family="Arial,sans-serif" font-weight="900" font-size="13">JAY PREHISTORIC</text><text x="50" y="86" text-anchor="middle" fill="%23fef08a" font-family="Arial,sans-serif" font-weight="800" font-size="10">PETS TV</text></svg>`;
const VIETSUCCESS_AVATAR = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="%231e1b4b"/><circle cx="50" cy="50" r="44" fill="%23312e81"/><path d="M30 35 L45 70 L55 50 L65 70 L75 35" fill="none" stroke="%23818cf8" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/><text x="50" y="86" text-anchor="middle" fill="white" font-family="Arial,sans-serif" font-weight="900" font-size="10" letter-spacing="1">VIETSUCCESS</text></svg>`;
const PINKFONG_AVATAR = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="%23db2777"/><circle cx="50" cy="50" r="44" fill="%23f472b6"/><text x="50" y="46" text-anchor="middle" font-size="34">🦊</text><text x="50" y="72" text-anchor="middle" fill="white" font-family="Arial,sans-serif" font-weight="900" font-size="15">PINKFONG</text><text x="50" y="85" text-anchor="middle" fill="%23fef08a" font-family="Arial,sans-serif" font-weight="800" font-size="10">Baby Shark</text></svg>`;
const JHOUSE_JR_AVATAR = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="%230284c7"/><circle cx="50" cy="50" r="44" fill="%2338bdf8"/><text x="50" y="46" text-anchor="middle" font-size="34">🏠</text><text x="50" y="72" text-anchor="middle" fill="white" font-family="Arial,sans-serif" font-weight="900" font-size="16">J HOUSE</text><text x="50" y="85" text-anchor="middle" fill="%23fef08a" font-family="Arial,sans-serif" font-weight="800" font-size="11">jr.</text></svg>`;
const PINKFONG_VN_AVATAR = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="%23e11d48"/><circle cx="50" cy="50" r="44" fill="%23f43f5e"/><text x="50" y="44" text-anchor="middle" font-size="32">🦈</text><text x="50" y="68" text-anchor="middle" fill="white" font-family="Arial,sans-serif" font-weight="900" font-size="12">PINKFONG</text><text x="50" y="82" text-anchor="middle" fill="%23fef08a" font-family="Arial,sans-serif" font-weight="800" font-size="10">Cá Mập Con</text></svg>`;

// ── Toàn bộ 9 kênh YouTube thực tế tài khoản người dùng đã đăng ký (đồng bộ chính xác từ YouTube) ──
export const USER_YOUTUBE_SUBSCRIPTIONS_SNAPSHOT = [
  {
    id: 'sub-vtv24',
    snippet: {
      title: 'VTV24',
      customUrl: '@vtv24',
      description: 'Kênh YouTube chính thức của Ban Thời sự - Đài Truyền hình Việt Nam Đồng hành cùng VTV24 tại: Fanpage chính thức: fb.com/tintucvtv24 Chuyên trang Tài Chính: fb.com/vtvindex Zalo : zalo.me/1571891271885013875',
      subscribersText: '7,01 Tr người đăng ký',
      verified: true,
      resourceId: { channelId: 'UCabsTV34JwALXKGMqHpvUiA' },
      thumbnails: {
        medium: { url: VTV24_AVATAR },
        default: { url: VTV24_AVATAR }
      }
    }
  },
  {
    id: 'sub-anmusic96',
    snippet: {
      title: 'An#',
      customUrl: '@anmusic96',
      description: 'Kênh âm nhạc sáng tạo An# (@anmusic96)',
      subscribersText: '5 người đăng ký',
      verified: false,
      resourceId: { channelId: 'UC_anmusic96' },
      thumbnails: {
        medium: { url: AN_MUSIC_AVATAR },
        default: { url: AN_MUSIC_AVATAR }
      }
    }
  },
  {
    id: 'sub-wavemusic',
    snippet: {
      title: 'WaveMusic',
      customUrl: '@wavemusic',
      description: 'Your Home For The Best Pop & Electronic Music With Lyrics! All new videos will be a 4k lyric video with closed captions (CC) and have lyrics in the description. This channel is dedicated to pop electronic, chill pop, melodic',
      subscribersText: '4,68 Tr người đăng ký',
      verified: true,
      resourceId: { channelId: 'UCbuK8Gbdvi5P0E6D-R5UqgA' },
      thumbnails: {
        medium: { url: WAVE_MUSIC_AVATAR },
        default: { url: WAVE_MUSIC_AVATAR }
      }
    }
  },
  {
    id: 'sub-kimpro828',
    snippet: {
      title: '김프로KIMPRO',
      customUrl: '@kimpro828',
      description: '문의 : kimpro@soon-ent.co.kr ▲ 허가 없이 영상 사용 금지 ▲',
      subscribersText: '135 Tr người đăng ký',
      verified: true,
      resourceId: { channelId: 'UC8q5Wq9mY2QxY2k0y5s1u1w' },
      thumbnails: {
        medium: { url: KIMPRO_AVATAR },
        default: { url: KIMPRO_AVATAR }
      }
    }
  },
  {
    id: 'sub-jayprehistoricpets',
    snippet: {
      title: 'Jay Prehistoric Pets',
      customUrl: '@JayPrehistoricPetsTV',
      description: 'Hi, I\'m Jay Brewer—reptile lover and animal enthusiast! 🐍 Follow me for epic adventures and a behind-the-scenes look at the coolest creatures on the planet. 🌎 When I\'m not traveling the world ✈️, you\'ll find me at The',
      subscribersText: '8,23 Tr người đăng ký',
      verified: false,
      resourceId: { channelId: 'UCJayPrehistoricPetsTV' },
      thumbnails: {
        medium: { url: JAY_PETS_AVATAR },
        default: { url: JAY_PETS_AVATAR }
      }
    }
  },
  {
    id: 'sub-vietsuccess',
    snippet: {
      title: 'VIETSUCCESS',
      customUrl: '@VIETSUCCESS',
      description: 'Vietsuccess là cộng đồng tri thức và nền tảng nội dung hàng đầu, giúp người đi làm tại Việt Nam phát triển toàn diện cả về mặt cá nhân và sự nghiệp. Với sứ mệnh mang đến những kiến thức chọn lọc và thực tế, Vietsuccess',
      subscribersText: '555 N người đăng ký',
      verified: true,
      resourceId: { channelId: 'UCVIETSUCCESS' },
      thumbnails: {
        medium: { url: VIETSUCCESS_AVATAR },
        default: { url: VIETSUCCESS_AVATAR }
      }
    }
  },
  {
    id: 'sub-pinkfong',
    snippet: {
      title: 'Baby Shark - Pinkfong Kids\' Songs & Stories',
      customUrl: '@Pinkfong',
      description: 'Welcome to Pinkfong\'s official YouTube channel. Meet Pinkfong\'s fun, educational videos that captured the hearts of millions of children around the world. Subscribe to Pinkfong Baby Shark\'s channel for kids\' favorite',
      subscribersText: '85,3 Tr người đăng ký',
      verified: true,
      resourceId: { channelId: 'UCPinkfong' },
      thumbnails: {
        medium: { url: PINKFONG_AVATAR },
        default: { url: PINKFONG_AVATAR }
      }
    }
  },
  {
    id: 'sub-jhousejr',
    snippet: {
      title: 'J House jr.',
      customUrl: '@jhousejr',
      description: 'Come play with us! We started sharing our family adventures on J House Vlogs in 2014. Now we are having fun making videos for kids and families here on J House Jr. We are Kendra and Jeremy, and our kids are Isaac, Elise,',
      subscribersText: '36,3 Tr người đăng ký',
      verified: true,
      resourceId: { channelId: 'UCjhousejr' },
      thumbnails: {
        medium: { url: JHOUSE_JR_AVATAR },
        default: { url: JHOUSE_JR_AVATAR }
      }
    }
  },
  {
    id: 'sub-pinkfong-vn',
    snippet: {
      title: 'Pinkfong! Cá mập con - Nhạc thiếu nhi',
      customUrl: '@Pinkfong_TiengViet',
      description: 'Chào mừng bạn đến với kênh YouTube chính thức của Pinkfong Bé Cá Mập Tiếng Việt! Những bài hát thiếu nhi vui nhộn, giáo dục bổ ích dành cho bé.',
      subscribersText: '3,94 Tr người đăng ký',
      verified: true,
      resourceId: { channelId: 'UCPinkfong_TiengViet' },
      thumbnails: {
        medium: { url: PINKFONG_VN_AVATAR },
        default: { url: PINKFONG_VN_AVATAR }
      }
    }
  }
];

// ── Cấu trúc Kênh Truyền Hình phong cách Smart TV EPG ──
export interface TVChannel {
  id: string;
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
    tagline: 'Tổng hợp dòng chảy thời sự đa kênh 24h liên tục',
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
    channelId: 'UC01aVq6gGvUe6F2Q6H_tPmg',
    name: 'Báo Tiền Phong',
    tagline: 'Truyền hình Báo Tiền Phong - Phóng sự điều tra & Tiêu điểm trẻ',
    number: 'CH 02',
    logoColor: '#0284c7',
    badgeText: 'TIỀN PHONG TV'
  },
  {
    id: 'thanhnien',
    channelId: 'UCIW9cGgoRuGJnky3K3tbzNg',
    name: 'Báo Thanh Niên',
    tagline: 'Truyền hình Báo Thanh Niên - Tiêu điểm xã hội & Pháp luật 24h',
    number: 'CH 03',
    logoColor: '#2563eb',
    badgeText: 'THANH NIÊN'
  },
  {
    id: 'tuoitre',
    channelId: 'UCteGrHMrnQwx7Scx--7nyoA',
    name: 'Báo Tuổi Trẻ',
    tagline: 'Truyền hình Tuổi Trẻ - Tin tức đa chiều & Phóng viên thường trú',
    number: 'CH 04',
    logoColor: '#dc2626',
    badgeText: 'TUỔI TRẺ TV'
  },
  {
    id: 'vtcnow',
    channelId: 'UCxI0jUuG4e2xP_7E4m5hXvw',
    name: 'VTC NOW',
    tagline: 'Đài Truyền hình Kỹ thuật số VTC - Bản tin thời sự số 24/7',
    number: 'CH 05',
    logoColor: '#ea580c',
    badgeText: 'VTC NOW'
  },
  {
    id: 'laodong',
    channelId: 'UCFN0IoARjOAgx-OWr-JBIHg',
    name: 'Báo Lao Động',
    tagline: 'Truyền hình Báo Lao Động - Kinh tế, thị trường & Người lao động',
    number: 'CH 06',
    logoColor: '#059669',
    badgeText: 'LAO ĐỘNG TV'
  },
  {
    id: 'thoitiet',
    channelId: 'UCbN_rR_y_f5Qv8u7Y8h1zWw',
    name: 'VTV Thời Tiết',
    tagline: 'Bản tin Dự báo Thời tiết, Cảnh báo bão & Thiên tai TV',
    number: 'CH 07',
    logoColor: '#0ea5e9',
    badgeText: 'THỜI TIẾT TV'
  },
  {
    id: 'antv',
    channelId: 'UCII2NTkfFTi8kLfbD4m7bXw',
    name: 'ANTV',
    tagline: 'Truyền hình Công an nhân dân - An ninh trật tự & Pháp luật',
    number: 'CH 08',
    logoColor: '#7c3aed',
    badgeText: 'ANTV'
  },
  {
    id: 'vnexpress',
    channelId: 'UCYpMOQ12RdAFqV_3V7rMEzA',
    name: 'VnExpress TV',
    tagline: 'VnExpress TV - Báo điện tử nhiều người đọc nhất Việt Nam',
    number: 'CH 09',
    logoColor: '#0369a1',
    badgeText: 'VNEXPRESS'
  },
  {
    id: 'zingnews',
    channelId: 'UC4M4pMYLFkz0rfXD7PZFgXA',
    name: 'Zing News',
    tagline: 'Zing News - Tin tức nhanh, giải trí, giới trẻ & đời sống',
    number: 'CH 10',
    logoColor: '#db2777',
    badgeText: 'ZING NEWS'
  },
  {
    id: 'dantri',
    channelId: 'UCl1gPAj1KTUjmCbk_3nHjWA',
    name: 'Báo Dân Trí',
    tagline: 'Truyền hình Dân Trí - Giáo dục, xã hội & kinh tế mỗi ngày',
    number: 'CH 11',
    logoColor: '#b45309',
    badgeText: 'DÂN TRÍ TV'
  }
];

// Hàm kiểm tra video có thuộc kênh được chọn hay không
export function matchesChannel(item: ShortItem, channelId: string): boolean {
  if (channelId === 'all') return true;
  const chLower = (item.channel || '').toLowerCase();
  const titleLower = (item.title || '').toLowerCase();
  if (channelId === 'vtv24') return chLower.includes('vtv24') || (chLower.includes('vtv') && !chLower.includes('thời tiết'));
  if (channelId === 'tienphong') return chLower.includes('tiền phong') || chLower.includes('tienphong') || titleLower.includes('tiền phong');
  if (channelId === 'thanhnien') return chLower.includes('thanh niên') || chLower.includes('thanh nien') || titleLower.includes('thanh niên');
  if (channelId === 'tuoitre') return chLower.includes('tuổi trẻ') || chLower.includes('tuoi tre') || titleLower.includes('tuổi trẻ');
  if (channelId === 'vtcnow') return chLower.includes('vtc');
  if (channelId === 'laodong') return chLower.includes('lao động') || chLower.includes('lao dong') || titleLower.includes('lao động');
  if (channelId === 'thoitiet') return chLower.includes('thời tiết') || item.category === 'Thời tiết TV' || item.badge === 'THỜI TIẾT';
  if (channelId === 'antv') return chLower.includes('antv') || chLower.includes('công an') || titleLower.includes('antv');
  if (channelId === 'vnexpress') return chLower.includes('vnexpress') || titleLower.includes('vnexpress');
  if (channelId === 'dantri') return chLower.includes('dân trí') || chLower.includes('dan tri') || titleLower.includes('dân trí');
  return false;
}

export const BACKUP_FALLBACK_SHORTS: ShortItem[] = [
  {
    id: 'yt-vtv24-0A7wBfE8mKY',
    youtubeId: '0A7wBfE8mKY',
    title: "Thế giới toàn cảnh 14/10: Cơ sở dầu mỏ của Houthi ở gần thủ đô Sanaa của Yemen bị không kích | VTV24",
    channel: 'VTV24',
    badge: 'VTV THỜI SỰ',
    category: 'Thời sự 24h',
    subCategory: 'Tổng hợp tin tức hàng ngày',
    duration: 'Bản tin',
    thumbnail: 'https://i.ytimg.com/vi/0A7wBfE8mKY/hqdefault.jpg',
    likes: 3000,
    commentsCount: 150,
    sharesCount: 70,
    mediaType: 'video',
    aspectRatio: '16:9',
    publishedAt: '2026-10-13T22:30:09.126Z'
  },
  {
    id: 'yt-vtv24-Ktz_TtU3emo',
    youtubeId: 'Ktz_TtU3emo',
    title: "VNeID sẽ có thêm loạt tiện ích giao thông | Cụm tin | VTV24",
    channel: 'VTV24',
    badge: 'VTV THỜI SỰ',
    category: 'Thời sự 24h',
    subCategory: 'Shorts ngắn',
    duration: 'Shorts',
    thumbnail: 'https://i.ytimg.com/vi/Ktz_TtU3emo/hqdefault.jpg',
    likes: 3541,
    commentsCount: 197,
    sharesCount: 93,
    mediaType: 'short',
    aspectRatio: '9:16',
    publishedAt: '2026-10-13T18:30:09.216Z'
  },
  {
    id: 'yt-vtv24-ehcmLZEtLaE',
    youtubeId: 'ehcmLZEtLaE',
    title: "Thời tiết 14/10: Bắc Bộ và Bắc Trung Bộ tiếp tục nắng nóng, Nam Bộ chiều tối có mưa giông | VTV24",
    channel: 'VTV24',
    badge: 'VTV THỜI SỰ',
    category: 'Thời sự 24h',
    subCategory: 'Tổng hợp tin tức hàng ngày',
    duration: 'Bản tin',
    thumbnail: 'https://i.ytimg.com/vi/ehcmLZEtLaE/hqdefault.jpg',
    likes: 4082,
    commentsCount: 244,
    sharesCount: 116,
    mediaType: 'video',
    aspectRatio: '16:9',
    publishedAt: '2026-10-13T14:30:09.269Z'
  },
  {
    id: 'yt-vtv24-BWi4v3HyZpY',
    youtubeId: 'BWi4v3HyZpY',
    title: "Thật - Giả, Kiểm chứng: Bóc trần thiết bị tiết kiệm điện giả | VTV24",
    channel: 'VTV24',
    badge: 'VTV THỜI SỰ',
    category: 'Thời sự 24h',
    subCategory: 'Shorts ngắn',
    duration: 'Shorts',
    thumbnail: 'https://i.ytimg.com/vi/BWi4v3HyZpY/hqdefault.jpg',
    likes: 4623,
    commentsCount: 291,
    sharesCount: 139,
    mediaType: 'short',
    aspectRatio: '9:16',
    publishedAt: '2026-10-13T10:30:09.350Z'
  },
  {
    id: 'yt-vtv24-iVF4Jr-xoWk',
    youtubeId: 'iVF4Jr-xoWk',
    title: "Đường đi biến thành nơi tập kết rác tại Lạc Đạo, Hưng Yên | VTV24",
    channel: 'VTV24',
    badge: 'VTV THỜI SỰ',
    category: 'Thời sự 24h',
    subCategory: 'Tổng hợp tin tức hàng ngày',
    duration: 'Bản tin',
    thumbnail: 'https://i.ytimg.com/vi/iVF4Jr-xoWk/hqdefault.jpg',
    likes: 5164,
    commentsCount: 338,
    sharesCount: 162,
    mediaType: 'video',
    aspectRatio: '16:9',
    publishedAt: '2026-10-13T06:30:09.413Z'
  },
  {
    id: 'yt-vtv24-PQlBET-bx80',
    youtubeId: 'PQlBET-bx80',
    title: "Tinh vi thủ đoạn rửa tiền hàng nghìn tỷ đồng xuyên biên giới | VTV24",
    channel: 'VTV24',
    badge: 'VTV THỜI SỰ',
    category: 'Thời sự 24h',
    subCategory: 'Shorts ngắn',
    duration: 'Shorts',
    thumbnail: 'https://i.ytimg.com/vi/PQlBET-bx80/hqdefault.jpg',
    likes: 5705,
    commentsCount: 385,
    sharesCount: 185,
    mediaType: 'short',
    aspectRatio: '9:16',
    publishedAt: '2026-10-13T02:30:09.509Z'
  },
  {
    id: 'yt-vtv24-6bfwopT5zUA',
    youtubeId: '6bfwopT5zUA',
    title: "Chiến dịch 500 ngày đêm: Hành trình trở về sau gần 60 năm | VTV24",
    channel: 'VTV24',
    badge: 'VTV THỜI SỰ',
    category: 'Thời sự 24h',
    subCategory: 'Tổng hợp tin tức hàng ngày',
    duration: 'Bản tin',
    thumbnail: 'https://i.ytimg.com/vi/6bfwopT5zUA/hqdefault.jpg',
    likes: 6246,
    commentsCount: 432,
    sharesCount: 208,
    mediaType: 'video',
    aspectRatio: '16:9',
    publishedAt: '2026-10-12T22:30:09.567Z'
  },
  {
    id: 'yt-vtv24-BywNaNPfvik',
    youtubeId: 'BywNaNPfvik',
    title: "Thời sự toàn cảnh tối 13/10: Việt Nam tăng cường hợp tác quốc phòng với Lào và Campuchia | VTV24",
    channel: 'VTV24',
    badge: 'VTV THỜI SỰ',
    category: 'Thời sự 24h',
    subCategory: 'Shorts ngắn',
    duration: 'Shorts',
    thumbnail: 'https://i.ytimg.com/vi/BywNaNPfvik/hqdefault.jpg',
    likes: 6787,
    commentsCount: 479,
    sharesCount: 231,
    mediaType: 'short',
    aspectRatio: '9:16',
    publishedAt: '2026-10-12T18:30:09.653Z'
  },
  {
    id: 'yt-vtv24-BroH-g3y8Qc',
    youtubeId: 'BroH-g3y8Qc',
    title: "Chuyển đổi từ chợ số, lớp học A.I đến trạm y tế thông minh | VTV24",
    channel: 'VTV24',
    badge: 'VTV THỜI SỰ',
    category: 'Thời sự 24h',
    subCategory: 'Tổng hợp tin tức hàng ngày',
    duration: 'Bản tin',
    thumbnail: 'https://i.ytimg.com/vi/BroH-g3y8Qc/hqdefault.jpg',
    likes: 7328,
    commentsCount: 526,
    sharesCount: 254,
    mediaType: 'video',
    aspectRatio: '16:9',
    publishedAt: '2026-10-12T14:30:09.713Z'
  },
  {
    id: 'yt-vtv24-U0e7Cq0aMZc',
    youtubeId: 'U0e7Cq0aMZc',
    title: "Nga dùng A.I huấn luyện tác chiến UAV | Cụm tin Quốc tế | VTV24",
    channel: 'VTV24',
    badge: 'VTV THỜI SỰ',
    category: 'Thời sự 24h',
    subCategory: 'Shorts ngắn',
    duration: 'Shorts',
    thumbnail: 'https://i.ytimg.com/vi/U0e7Cq0aMZc/hqdefault.jpg',
    likes: 7869,
    commentsCount: 173,
    sharesCount: 77,
    mediaType: 'short',
    aspectRatio: '9:16',
    publishedAt: '2026-10-12T10:30:09.772Z'
  },
  {
    id: 'yt-tienphong-TCxTBaAOoWg',
    youtubeId: 'TCxTBaAOoWg',
    title: "Toàn cảnh mưa lũ cả nước, miền Trung ‘vỡ òa’ đón tin vui, ô nhiễm không khí đe dọa miền Bắc",
    channel: 'Báo Tiền Phong',
    badge: 'TIỀN PHONG TV',
    category: 'Thời sự 24h',
    subCategory: 'Tổng hợp tin tức hàng ngày',
    duration: 'Bản tin',
    thumbnail: 'https://i.ytimg.com/vi/TCxTBaAOoWg/hqdefault.jpg',
    likes: 3000,
    commentsCount: 150,
    sharesCount: 70,
    mediaType: 'video',
    aspectRatio: '16:9',
    publishedAt: '2026-10-13T22:30:10.382Z'
  },
  {
    id: 'yt-tienphong-OQzP3GqvFRw',
    youtubeId: 'OQzP3GqvFRw',
    title: "Toàn cảnh 14/10: Từ vụ ‘Già làng Tây Nguyên’, lột mặt nạ các Idol mạng lợi dụng niềm tin",
    channel: 'Báo Tiền Phong',
    badge: 'TIỀN PHONG TV',
    category: 'Thời sự 24h',
    subCategory: 'Shorts ngắn',
    duration: 'Shorts',
    thumbnail: 'https://i.ytimg.com/vi/OQzP3GqvFRw/hqdefault.jpg',
    likes: 3541,
    commentsCount: 197,
    sharesCount: 93,
    mediaType: 'short',
    aspectRatio: '9:16',
    publishedAt: '2026-10-13T18:30:10.437Z'
  },
  {
    id: 'yt-tienphong-AcSUCNtBbtE',
    youtubeId: 'AcSUCNtBbtE',
    title: "Thời sự nóng 14/10:Băng cướp 'tuổi teen' cầm kiếm gieo ác mộng ở KCN, công an Bắc Ninh truy xét khẩn",
    channel: 'Báo Tiền Phong',
    badge: 'TIỀN PHONG TV',
    category: 'Thời sự 24h',
    subCategory: 'Tổng hợp tin tức hàng ngày',
    duration: 'Bản tin',
    thumbnail: 'https://i.ytimg.com/vi/AcSUCNtBbtE/hqdefault.jpg',
    likes: 4082,
    commentsCount: 244,
    sharesCount: 116,
    mediaType: 'video',
    aspectRatio: '16:9',
    publishedAt: '2026-10-13T14:30:10.521Z'
  },
  {
    id: 'yt-tienphong-ka98-Tr4Ujw',
    youtubeId: 'ka98-Tr4Ujw',
    title: "Dự báo thời tiết 14/10: Nam Bộ triều cường rút chậm, diễn biến bất thường của mùa mưa",
    channel: 'Báo Tiền Phong',
    badge: 'TIỀN PHONG TV',
    category: 'Thời sự 24h',
    subCategory: 'Shorts ngắn',
    duration: 'Shorts',
    thumbnail: 'https://i.ytimg.com/vi/ka98-Tr4Ujw/hqdefault.jpg',
    likes: 4623,
    commentsCount: 291,
    sharesCount: 139,
    mediaType: 'short',
    aspectRatio: '9:16',
    publishedAt: '2026-10-13T10:30:10.611Z'
  },
  {
    id: 'yt-tienphong-DtC1hyBAsK4',
    youtubeId: 'DtC1hyBAsK4',
    title: "Bản tin sáng 14/10: Phẫn nộ bé tự kỷ bị chấn thương sọ não: Chủ cơ sở ‘mất tích’, gia đình cầu cứu",
    channel: 'Báo Tiền Phong',
    badge: 'TIỀN PHONG TV',
    category: 'Thời sự 24h',
    subCategory: 'Tổng hợp tin tức hàng ngày',
    duration: 'Bản tin',
    thumbnail: 'https://i.ytimg.com/vi/DtC1hyBAsK4/hqdefault.jpg',
    likes: 5164,
    commentsCount: 338,
    sharesCount: 162,
    mediaType: 'video',
    aspectRatio: '16:9',
    publishedAt: '2026-10-13T06:30:10.663Z'
  },
  {
    id: 'yt-tienphong-wT7fGqh0e24',
    youtubeId: 'wT7fGqh0e24',
    title: "Nóng nghị trường Quốc Hội: Phim ‘rác’ AI hủy hoại giới trẻ, liều thuốc độc của thời đại mới",
    channel: 'Báo Tiền Phong',
    badge: 'TIỀN PHONG TV',
    category: 'Thời sự 24h',
    subCategory: 'Shorts ngắn',
    duration: 'Shorts',
    thumbnail: 'https://i.ytimg.com/vi/wT7fGqh0e24/hqdefault.jpg',
    likes: 5705,
    commentsCount: 385,
    sharesCount: 185,
    mediaType: 'short',
    aspectRatio: '9:16',
    publishedAt: '2026-10-13T02:30:10.746Z'
  },
  {
    id: 'yt-tienphong-byik3EPK-NQ',
    youtubeId: 'byik3EPK-NQ',
    title: "Mặt đường bất ngờ nứt vỡ 'nuốt chửng’ 15 ô tô, 'hố tử thần’ xuất hiện khiến dân bàng hoàng",
    channel: 'Báo Tiền Phong',
    badge: 'TIỀN PHONG TV',
    category: 'Thời sự 24h',
    subCategory: 'Tổng hợp tin tức hàng ngày',
    duration: 'Bản tin',
    thumbnail: 'https://i.ytimg.com/vi/byik3EPK-NQ/hqdefault.jpg',
    likes: 6246,
    commentsCount: 432,
    sharesCount: 208,
    mediaType: 'video',
    aspectRatio: '16:9',
    publishedAt: '2026-10-12T22:30:10.809Z'
  },
  {
    id: 'yt-tienphong-BsbijIK-Shs',
    youtubeId: 'BsbijIK-Shs',
    title: "Tự ý trồng cây xanh bị phạt 22 triệu đồng: Động thái lạ của chủ nhà hàng châm ngòi tranh cãi",
    channel: 'Báo Tiền Phong',
    badge: 'TIỀN PHONG TV',
    category: 'Thời sự 24h',
    subCategory: 'Shorts ngắn',
    duration: 'Shorts',
    thumbnail: 'https://i.ytimg.com/vi/BsbijIK-Shs/hqdefault.jpg',
    likes: 6787,
    commentsCount: 479,
    sharesCount: 231,
    mediaType: 'short',
    aspectRatio: '9:16',
    publishedAt: '2026-10-12T18:30:10.894Z'
  },
  {
    id: 'yt-tienphong-8_3XqOlGTdY',
    youtubeId: '8_3XqOlGTdY',
    title: "Động thái lạ của chủ nhà hàng Cường dê; trách nhiệm pháp lý của ông Hưng sau vụ xô xát ra sao?",
    channel: 'Báo Tiền Phong',
    badge: 'TIỀN PHONG TV',
    category: 'Thời sự 24h',
    subCategory: 'Tổng hợp tin tức hàng ngày',
    duration: 'Bản tin',
    thumbnail: 'https://i.ytimg.com/vi/8_3XqOlGTdY/hqdefault.jpg',
    likes: 7328,
    commentsCount: 526,
    sharesCount: 254,
    mediaType: 'video',
    aspectRatio: '16:9',
    publishedAt: '2026-10-12T14:30:10.981Z'
  },
  {
    id: 'yt-tienphong-cGqL50iydsk',
    youtubeId: 'cGqL50iydsk',
    title: "Đội tuyển Việt Nam chịu sức ép cực lớn dù chưa đá vòng loại World Cup 2030",
    channel: 'Báo Tiền Phong',
    badge: 'TIỀN PHONG TV',
    category: 'Thời sự 24h',
    subCategory: 'Shorts ngắn',
    duration: 'Shorts',
    thumbnail: 'https://i.ytimg.com/vi/cGqL50iydsk/hqdefault.jpg',
    likes: 7869,
    commentsCount: 173,
    sharesCount: 77,
    mediaType: 'short',
    aspectRatio: '9:16',
    publishedAt: '2026-10-12T10:30:11.065Z'
  },
  {
    id: 'yt-tuoitre-7XeOOn2_clc',
    youtubeId: '7XeOOn2_clc',
    title: "Xúc động hành trình tìm lại danh tính các anh hùng liệt sĩ",
    channel: 'Báo Tuổi Trẻ',
    badge: 'TUỔI TRẺ TV',
    category: 'Thời sự 24h',
    subCategory: 'Tổng hợp tin tức hàng ngày',
    duration: 'Bản tin',
    thumbnail: 'https://i.ytimg.com/vi/7XeOOn2_clc/hqdefault.jpg',
    likes: 3000,
    commentsCount: 150,
    sharesCount: 70,
    mediaType: 'video',
    aspectRatio: '16:9',
    publishedAt: '2026-10-13T22:30:12.197Z'
  },
  {
    id: 'yt-tuoitre-1jJ9_YgXMaI',
    youtubeId: '1jJ9_YgXMaI',
    title: "Trung Quốc tuyên tử hình 3 thành viên gia tộc tội phạm lừa đảo và giết người khét tiếng ở Myanmar",
    channel: 'Báo Tuổi Trẻ',
    badge: 'TUỔI TRẺ TV',
    category: 'Thời sự 24h',
    subCategory: 'Shorts ngắn',
    duration: 'Shorts',
    thumbnail: 'https://i.ytimg.com/vi/1jJ9_YgXMaI/hqdefault.jpg',
    likes: 3541,
    commentsCount: 197,
    sharesCount: 93,
    mediaType: 'short',
    aspectRatio: '9:16',
    publishedAt: '2026-10-13T18:30:12.250Z'
  },
  {
    id: 'yt-tuoitre-ebubr3trlk4',
    youtubeId: 'ebubr3trlk4',
    title: "Thủ tướng Lê Minh Hưng giao 5 nhiệm vụ trọng tâm cho Đại học Quốc gia TP.HCM",
    channel: 'Báo Tuổi Trẻ',
    badge: 'TUỔI TRẺ TV',
    category: 'Thời sự 24h',
    subCategory: 'Tổng hợp tin tức hàng ngày',
    duration: 'Bản tin',
    thumbnail: 'https://i.ytimg.com/vi/ebubr3trlk4/hqdefault.jpg',
    likes: 4082,
    commentsCount: 244,
    sharesCount: 116,
    mediaType: 'video',
    aspectRatio: '16:9',
    publishedAt: '2026-10-13T14:30:12.336Z'
  },
  {
    id: 'yt-tuoitre-TsQ-h7Ml7f4',
    youtubeId: 'TsQ-h7Ml7f4',
    title: "Khúc tri ân tưởng nhớ các anh hùng liệt sĩ tại công viên Lê Thị Riêng",
    channel: 'Báo Tuổi Trẻ',
    badge: 'TUỔI TRẺ TV',
    category: 'Thời sự 24h',
    subCategory: 'Shorts ngắn',
    duration: 'Shorts',
    thumbnail: 'https://i.ytimg.com/vi/TsQ-h7Ml7f4/hqdefault.jpg',
    likes: 4623,
    commentsCount: 291,
    sharesCount: 139,
    mediaType: 'short',
    aspectRatio: '9:16',
    publishedAt: '2026-10-13T10:30:12.460Z'
  },
  {
    id: 'yt-tuoitre-27haH_SWuTo',
    youtubeId: '27haH_SWuTo',
    title: "Sẵn sàng cho lễ viếng, lễ truy điệu và an táng hài cốt liệt sĩ được tìm kiếm, quy tập tại công viên",
    channel: 'Báo Tuổi Trẻ',
    badge: 'TUỔI TRẺ TV',
    category: 'Thời sự 24h',
    subCategory: 'Tổng hợp tin tức hàng ngày',
    duration: 'Bản tin',
    thumbnail: 'https://i.ytimg.com/vi/27haH_SWuTo/hqdefault.jpg',
    likes: 5164,
    commentsCount: 338,
    sharesCount: 162,
    mediaType: 'video',
    aspectRatio: '16:9',
    publishedAt: '2026-10-13T06:30:12.580Z'
  },
  {
    id: 'yt-tuoitre-op9a2MoVZIw',
    youtubeId: 'op9a2MoVZIw',
    title: "Mô hình nuôi vịt xiêm Pháp được hợp tác xã bao tiêu sản phẩm ở Cần Thơ",
    channel: 'Báo Tuổi Trẻ',
    badge: 'TUỔI TRẺ TV',
    category: 'Thời sự 24h',
    subCategory: 'Shorts ngắn',
    duration: 'Shorts',
    thumbnail: 'https://i.ytimg.com/vi/op9a2MoVZIw/hqdefault.jpg',
    likes: 5705,
    commentsCount: 385,
    sharesCount: 185,
    mediaType: 'short',
    aspectRatio: '9:16',
    publishedAt: '2026-10-13T02:30:12.668Z'
  },
  {
    id: 'yt-tuoitre-r2NVjgescuI',
    youtubeId: 'r2NVjgescuI',
    title: "Phó bí thư Thành ủy TP.HCM Đặng Minh Thông đề nghị nghiên cứu cải tạo chung cư cũ theo từng nhóm",
    channel: 'Báo Tuổi Trẻ',
    badge: 'TUỔI TRẺ TV',
    category: 'Thời sự 24h',
    subCategory: 'Tổng hợp tin tức hàng ngày',
    duration: 'Bản tin',
    thumbnail: 'https://i.ytimg.com/vi/r2NVjgescuI/hqdefault.jpg',
    likes: 6246,
    commentsCount: 432,
    sharesCount: 208,
    mediaType: 'video',
    aspectRatio: '16:9',
    publishedAt: '2026-10-12T22:30:12.759Z'
  },
  {
    id: 'yt-tuoitre-NPf79aOz7Fc',
    youtubeId: 'NPf79aOz7Fc',
    title: "Bản tin 30s Nóng: Nam sinh lớp 12 quật ngã 2 tên trộm chó; Iran tấn công siêu tàu chở dầu",
    channel: 'Báo Tuổi Trẻ',
    badge: 'TUỔI TRẺ TV',
    category: 'Thời sự 24h',
    subCategory: 'Shorts ngắn',
    duration: 'Shorts',
    thumbnail: 'https://i.ytimg.com/vi/NPf79aOz7Fc/hqdefault.jpg',
    likes: 6787,
    commentsCount: 479,
    sharesCount: 231,
    mediaType: 'short',
    aspectRatio: '9:16',
    publishedAt: '2026-10-12T18:30:12.842Z'
  },
  {
    id: 'yt-tuoitre-35Z9s_WJ-rw',
    youtubeId: '35Z9s_WJ-rw',
    title: "Bắt được con khỉ rượt cắn người trên đường Phạm Thế Hiển, TP.HCM",
    channel: 'Báo Tuổi Trẻ',
    badge: 'TUỔI TRẺ TV',
    category: 'Thời sự 24h',
    subCategory: 'Tổng hợp tin tức hàng ngày',
    duration: 'Bản tin',
    thumbnail: 'https://i.ytimg.com/vi/35Z9s_WJ-rw/hqdefault.jpg',
    likes: 7328,
    commentsCount: 526,
    sharesCount: 254,
    mediaType: 'video',
    aspectRatio: '16:9',
    publishedAt: '2026-10-12T14:30:12.929Z'
  },
  {
    id: 'yt-tuoitre-FvP30jny97E',
    youtubeId: 'FvP30jny97E',
    title: "Ngày 15-10 tuyên án vụ tai nạn làm nữ sinh tử vong ở Vĩnh Long",
    channel: 'Báo Tuổi Trẻ',
    badge: 'TUỔI TRẺ TV',
    category: 'Thời sự 24h',
    subCategory: 'Shorts ngắn',
    duration: 'Shorts',
    thumbnail: 'https://i.ytimg.com/vi/FvP30jny97E/hqdefault.jpg',
    likes: 7869,
    commentsCount: 173,
    sharesCount: 77,
    mediaType: 'short',
    aspectRatio: '9:16',
    publishedAt: '2026-10-12T10:30:13.010Z'
  },
  {
    id: 'yt-vtcnow-utYT3v_KTyo',
    youtubeId: 'utYT3v_KTyo',
    title: "Phim tài liệu sử dụng công nghệ AI: Làng Nủ tái sinh trong tình yêu thương của đồng bào | VTC Now",
    channel: 'VTC NOW',
    badge: 'VTC NOW',
    category: 'Thời sự 24h',
    subCategory: 'Tổng hợp tin tức hàng ngày',
    duration: 'Bản tin',
    thumbnail: 'https://i.ytimg.com/vi/utYT3v_KTyo/hqdefault.jpg',
    likes: 3000,
    commentsCount: 150,
    sharesCount: 70,
    mediaType: 'video',
    aspectRatio: '16:9',
    publishedAt: '2026-10-13T22:30:13.614Z'
  },
  {
    id: 'yt-vtcnow-Na5uByDy8Sw',
    youtubeId: 'Na5uByDy8Sw',
    title: "Hình ảnh \"siêu thực\" mô tả thảm hoạ lũ quét Làng Nủ: Từ đau thương đến hồi sinh | VTC Now",
    channel: 'VTC NOW',
    badge: 'VTC NOW',
    category: 'Thời sự 24h',
    subCategory: 'Shorts ngắn',
    duration: 'Shorts',
    thumbnail: 'https://i.ytimg.com/vi/Na5uByDy8Sw/hqdefault.jpg',
    likes: 3541,
    commentsCount: 197,
    sharesCount: 93,
    mediaType: 'short',
    aspectRatio: '9:16',
    publishedAt: '2026-10-13T18:30:13.720Z'
  },
  {
    id: 'yt-vtcnow-0thQbm1zlW4',
    youtubeId: '0thQbm1zlW4',
    title: "TH True Milk đã làm thế nào để đồng nhất chất lượng 1 triệu lít sữa/ngày? | VTC Now",
    channel: 'VTC NOW',
    badge: 'VTC NOW',
    category: 'Thời sự 24h',
    subCategory: 'Tổng hợp tin tức hàng ngày',
    duration: 'Bản tin',
    thumbnail: 'https://i.ytimg.com/vi/0thQbm1zlW4/hqdefault.jpg',
    likes: 4082,
    commentsCount: 244,
    sharesCount: 116,
    mediaType: 'video',
    aspectRatio: '16:9',
    publishedAt: '2026-10-13T14:30:13.800Z'
  },
  {
    id: 'yt-vtcnow-jxVLIh8IGbI',
    youtubeId: 'jxVLIh8IGbI',
    title: "Tập đoàn TH: Doanh nghiệp có số lượng kỷ lục sản phẩm đạt Thương hiệu Quốc gia 2024 | VTC Now",
    channel: 'VTC NOW',
    badge: 'VTC NOW',
    category: 'Thời sự 24h',
    subCategory: 'Shorts ngắn',
    duration: 'Shorts',
    thumbnail: 'https://i.ytimg.com/vi/jxVLIh8IGbI/hqdefault.jpg',
    likes: 4623,
    commentsCount: 291,
    sharesCount: 139,
    mediaType: 'short',
    aspectRatio: '9:16',
    publishedAt: '2026-10-13T10:30:13.891Z'
  },
  {
    id: 'yt-vtcnow-3gLevutNWGw',
    youtubeId: '3gLevutNWGw',
    title: "Khám phá hành trình “hóa thân” của vỏ hộp sữa thành những món đồ gia dụng \"siêu xinh\" | VTC Now",
    channel: 'VTC NOW',
    badge: 'VTC NOW',
    category: 'Thời sự 24h',
    subCategory: 'Tổng hợp tin tức hàng ngày',
    duration: 'Bản tin',
    thumbnail: 'https://i.ytimg.com/vi/3gLevutNWGw/hqdefault.jpg',
    likes: 5164,
    commentsCount: 338,
    sharesCount: 162,
    mediaType: 'video',
    aspectRatio: '16:9',
    publishedAt: '2026-10-13T06:30:13.982Z'
  },
  {
    id: 'yt-vtcnow-KrpT4EtMUg4',
    youtubeId: 'KrpT4EtMUg4',
    title: "Tập đoàn TH: Hơn 200 sản phẩm hoàn toàn từ thiên nhiên, đáp ứng nhu cầu người tiêu dùng | VTC Now",
    channel: 'VTC NOW',
    badge: 'VTC NOW',
    category: 'Thời sự 24h',
    subCategory: 'Shorts ngắn',
    duration: 'Shorts',
    thumbnail: 'https://i.ytimg.com/vi/KrpT4EtMUg4/hqdefault.jpg',
    likes: 5705,
    commentsCount: 385,
    sharesCount: 185,
    mediaType: 'short',
    aspectRatio: '9:16',
    publishedAt: '2026-10-13T02:30:14.122Z'
  },
  {
    id: 'yt-vtcnow-KAaS5vGYHVw',
    youtubeId: 'KAaS5vGYHVw',
    title: "Trải nghiệm cho bê con uống sữa tại \"nhà trẻ đặc biệt\" của trang trại TH | VTC Now",
    channel: 'VTC NOW',
    badge: 'VTC NOW',
    category: 'Thời sự 24h',
    subCategory: 'Tổng hợp tin tức hàng ngày',
    duration: 'Bản tin',
    thumbnail: 'https://i.ytimg.com/vi/KAaS5vGYHVw/hqdefault.jpg',
    likes: 6246,
    commentsCount: 432,
    sharesCount: 208,
    mediaType: 'video',
    aspectRatio: '16:9',
    publishedAt: '2026-10-12T22:30:14.229Z'
  },
  {
    id: 'yt-vtcnow-F_7i9jDxD_0',
    youtubeId: 'F_7i9jDxD_0',
    title: "Tìm hiểu quy trình “bẻ gãy” ô nhiễm tại hệ thống công nghệ xử lý nước thải hàng đầu châu Á | VTC Now",
    channel: 'VTC NOW',
    badge: 'VTC NOW',
    category: 'Thời sự 24h',
    subCategory: 'Shorts ngắn',
    duration: 'Shorts',
    thumbnail: 'https://i.ytimg.com/vi/F_7i9jDxD_0/hqdefault.jpg',
    likes: 6787,
    commentsCount: 479,
    sharesCount: 231,
    mediaType: 'short',
    aspectRatio: '9:16',
    publishedAt: '2026-10-12T18:30:14.330Z'
  },
  {
    id: 'yt-vtcnow-w2fxV1QDPIA',
    youtubeId: 'w2fxV1QDPIA',
    title: "Các sản phẩm siêu bổ dưỡng của TH true MILK được sản xuất như thế nào? | VTC Now",
    channel: 'VTC NOW',
    badge: 'VTC NOW',
    category: 'Thời sự 24h',
    subCategory: 'Tổng hợp tin tức hàng ngày',
    duration: 'Bản tin',
    thumbnail: 'https://i.ytimg.com/vi/w2fxV1QDPIA/hqdefault.jpg',
    likes: 7328,
    commentsCount: 526,
    sharesCount: 254,
    mediaType: 'video',
    aspectRatio: '16:9',
    publishedAt: '2026-10-12T14:30:14.421Z'
  },
  {
    id: 'yt-vtcnow-BhqYTeBlJ3o',
    youtubeId: 'BhqYTeBlJ3o',
    title: "Thương hiệu sữa tươi Việt sở hữu hàng loạt chứng chỉ, giải thưởng uy tín | VTC Now",
    channel: 'VTC NOW',
    badge: 'VTC NOW',
    category: 'Thời sự 24h',
    subCategory: 'Shorts ngắn',
    duration: 'Shorts',
    thumbnail: 'https://i.ytimg.com/vi/BhqYTeBlJ3o/hqdefault.jpg',
    likes: 7869,
    commentsCount: 173,
    sharesCount: 77,
    mediaType: 'short',
    aspectRatio: '9:16',
    publishedAt: '2026-10-12T10:30:14.516Z'
  },
  {
    id: 'yt-laodong-TN4qBdSbEKM',
    youtubeId: 'TN4qBdSbEKM',
    title: "Báo Lao động   Con trai bị cho đã chết của Gaddafi lên truyền hình   LAODONG",
    channel: 'Báo Lao Động',
    badge: 'LAO ĐỘNG TV',
    category: 'Thời sự 24h',
    subCategory: 'Tổng hợp tin tức hàng ngày',
    duration: 'Bản tin',
    thumbnail: 'https://i.ytimg.com/vi/TN4qBdSbEKM/hqdefault.jpg',
    likes: 3000,
    commentsCount: 150,
    sharesCount: 70,
    mediaType: 'video',
    aspectRatio: '16:9',
    publishedAt: '2026-10-13T22:30:15.142Z'
  },
  {
    id: 'yt-laodong-WIbumWwDGs4',
    youtubeId: 'WIbumWwDGs4',
    title: "Báo Lao động   Bỏ mạng vì võ mèo   LAODONG",
    channel: 'Báo Lao Động',
    badge: 'LAO ĐỘNG TV',
    category: 'Thời sự 24h',
    subCategory: 'Shorts ngắn',
    duration: 'Shorts',
    thumbnail: 'https://i.ytimg.com/vi/WIbumWwDGs4/hqdefault.jpg',
    likes: 3541,
    commentsCount: 197,
    sharesCount: 93,
    mediaType: 'short',
    aspectRatio: '9:16',
    publishedAt: '2026-10-13T18:30:15.195Z'
  },
  {
    id: 'yt-laodong-smGMz2C2poU',
    youtubeId: 'smGMz2C2poU',
    title: "Báo Lao động   Anna Chapman mang súng ống lên sàn catwalk   LAODONG",
    channel: 'Báo Lao Động',
    badge: 'LAO ĐỘNG TV',
    category: 'Thời sự 24h',
    subCategory: 'Tổng hợp tin tức hàng ngày',
    duration: 'Bản tin',
    thumbnail: 'https://i.ytimg.com/vi/smGMz2C2poU/hqdefault.jpg',
    likes: 4082,
    commentsCount: 244,
    sharesCount: 116,
    mediaType: 'video',
    aspectRatio: '16:9',
    publishedAt: '2026-10-13T14:30:15.285Z'
  },
  {
    id: 'yt-laodong-be5xCALF0Q0',
    youtubeId: 'be5xCALF0Q0',
    title: "Báo Lao động   Mỹ  Bắt gặp dã nhân chạy qua đường quốc lộ    LAODONG",
    channel: 'Báo Lao Động',
    badge: 'LAO ĐỘNG TV',
    category: 'Thời sự 24h',
    subCategory: 'Shorts ngắn',
    duration: 'Shorts',
    thumbnail: 'https://i.ytimg.com/vi/be5xCALF0Q0/hqdefault.jpg',
    likes: 4623,
    commentsCount: 291,
    sharesCount: 139,
    mediaType: 'short',
    aspectRatio: '9:16',
    publishedAt: '2026-10-13T10:30:15.364Z'
  },
  {
    id: 'yt-laodong-ZnTbaLFQcaY',
    youtubeId: 'ZnTbaLFQcaY',
    title: "Báo Lao động   Tổng thống Séc  thó  bút mực trong cuộc họp báo   LAODONG",
    channel: 'Báo Lao Động',
    badge: 'LAO ĐỘNG TV',
    category: 'Thời sự 24h',
    subCategory: 'Tổng hợp tin tức hàng ngày',
    duration: 'Bản tin',
    thumbnail: 'https://i.ytimg.com/vi/ZnTbaLFQcaY/hqdefault.jpg',
    likes: 5164,
    commentsCount: 338,
    sharesCount: 162,
    mediaType: 'video',
    aspectRatio: '16:9',
    publishedAt: '2026-10-13T06:30:15.448Z'
  },
  {
    id: 'yt-laodong-7vrqfHSKIwc',
    youtubeId: '7vrqfHSKIwc',
    title: "Báo Lao động   Tiếng kêu 18 loài động vật từ miệng    một cô gái   LAODONG",
    channel: 'Báo Lao Động',
    badge: 'LAO ĐỘNG TV',
    category: 'Thời sự 24h',
    subCategory: 'Shorts ngắn',
    duration: 'Shorts',
    thumbnail: 'https://i.ytimg.com/vi/7vrqfHSKIwc/hqdefault.jpg',
    likes: 5705,
    commentsCount: 385,
    sharesCount: 185,
    mediaType: 'short',
    aspectRatio: '9:16',
    publishedAt: '2026-10-13T02:30:15.529Z'
  },
  {
    id: 'yt-laodong-c1zBSvbTDK0',
    youtubeId: 'c1zBSvbTDK0',
    title: "Báo Lao động   Joe Biden ngủ gật khi Obama hăng say thuyết trình   LAODONG",
    channel: 'Báo Lao Động',
    badge: 'LAO ĐỘNG TV',
    category: 'Thời sự 24h',
    subCategory: 'Tổng hợp tin tức hàng ngày',
    duration: 'Bản tin',
    thumbnail: 'https://i.ytimg.com/vi/c1zBSvbTDK0/hqdefault.jpg',
    likes: 6246,
    commentsCount: 432,
    sharesCount: 208,
    mediaType: 'video',
    aspectRatio: '16:9',
    publishedAt: '2026-10-12T22:30:15.611Z'
  },
  {
    id: 'yt-laodong-AsNglbWalEo',
    youtubeId: 'AsNglbWalEo',
    title: "Báo Lao động   Hải quân Mỹ thử thành công vũ khí laser huỷ diệt mới   LAODONG",
    channel: 'Báo Lao Động',
    badge: 'LAO ĐỘNG TV',
    category: 'Thời sự 24h',
    subCategory: 'Shorts ngắn',
    duration: 'Shorts',
    thumbnail: 'https://i.ytimg.com/vi/AsNglbWalEo/hqdefault.jpg',
    likes: 6787,
    commentsCount: 479,
    sharesCount: 231,
    mediaType: 'short',
    aspectRatio: '9:16',
    publishedAt: '2026-10-12T18:30:15.690Z'
  },
  {
    id: 'yt-laodong-yot1Vj1kp8w',
    youtubeId: 'yot1Vj1kp8w',
    title: "Báo Lao động   Giải cứu cựu hiệu trưởng phi xe xuống sông   LAODONG",
    channel: 'Báo Lao Động',
    badge: 'LAO ĐỘNG TV',
    category: 'Thời sự 24h',
    subCategory: 'Tổng hợp tin tức hàng ngày',
    duration: 'Bản tin',
    thumbnail: 'https://i.ytimg.com/vi/yot1Vj1kp8w/hqdefault.jpg',
    likes: 7328,
    commentsCount: 526,
    sharesCount: 254,
    mediaType: 'video',
    aspectRatio: '16:9',
    publishedAt: '2026-10-12T14:30:15.777Z'
  },
  {
    id: 'yt-laodong-iXO5RE7f60c',
    youtubeId: 'iXO5RE7f60c',
    title: "Báo Lao động   Dùng súng cướp tiệm kim hoàn   LAODONG",
    channel: 'Báo Lao Động',
    badge: 'LAO ĐỘNG TV',
    category: 'Thời sự 24h',
    subCategory: 'Shorts ngắn',
    duration: 'Shorts',
    thumbnail: 'https://i.ytimg.com/vi/iXO5RE7f60c/hqdefault.jpg',
    likes: 7869,
    commentsCount: 173,
    sharesCount: 77,
    mediaType: 'short',
    aspectRatio: '9:16',
    publishedAt: '2026-10-12T10:30:15.826Z'
  },
  {
    id: 'yt-thoitiet-Ct00gKEaMSY',
    youtubeId: 'Ct00gKEaMSY',
    title: "Dự báo thời tiết 6h15 - 14/10/2026 | Hình thế gây mưa to | VTVWDB",
    channel: 'VTV Thời Tiết',
    badge: 'THỜI TIẾT TV',
    category: 'Thời tiết TV',
    subCategory: 'Dự báo thời tiết',
    duration: 'Bản tin',
    thumbnail: 'https://i.ytimg.com/vi/Ct00gKEaMSY/hqdefault.jpg',
    likes: 3000,
    commentsCount: 150,
    sharesCount: 70,
    mediaType: 'video',
    aspectRatio: '16:9',
    publishedAt: '2026-10-13T22:30:16.419Z'
  },
  {
    id: 'yt-thoitiet-ucNhqJqN8FQ',
    youtubeId: 'ucNhqJqN8FQ',
    title: "Dự báo thời tiết Nam Bộ hôm nay 14/10/2026 | VTVWDB",
    channel: 'VTV Thời Tiết',
    badge: 'THỜI TIẾT TV',
    category: 'Thời tiết TV',
    subCategory: 'Dự báo thời tiết',
    duration: 'Shorts',
    thumbnail: 'https://i.ytimg.com/vi/ucNhqJqN8FQ/hqdefault.jpg',
    likes: 3541,
    commentsCount: 197,
    sharesCount: 93,
    mediaType: 'short',
    aspectRatio: '9:16',
    publishedAt: '2026-10-13T18:30:16.502Z'
  },
  {
    id: 'yt-thoitiet-fTvDAkCxYH0',
    youtubeId: 'fTvDAkCxYH0',
    title: "Dự báo thời tiết nông vụ ngày 14/10/2026 | Hôm nay triều cường ở mức cao | VTVWDB",
    channel: 'VTV Thời Tiết',
    badge: 'THỜI TIẾT TV',
    category: 'Thời tiết TV',
    subCategory: 'Dự báo thời tiết',
    duration: 'Bản tin',
    thumbnail: 'https://i.ytimg.com/vi/fTvDAkCxYH0/hqdefault.jpg',
    likes: 4082,
    commentsCount: 244,
    sharesCount: 116,
    mediaType: 'video',
    aspectRatio: '16:9',
    publishedAt: '2026-10-13T14:30:16.580Z'
  },
  {
    id: 'yt-thoitiet-wk3mOlrxDp0',
    youtubeId: 'wk3mOlrxDp0',
    title: "Dự báo thời tiết du lịch 3 ngày tới từ ngày 14 đến ngày 16/10/2026 | VTVWDB",
    channel: 'VTV Thời Tiết',
    badge: 'THỜI TIẾT TV',
    category: 'Thời tiết TV',
    subCategory: 'Dự báo thời tiết',
    duration: 'Shorts',
    thumbnail: 'https://i.ytimg.com/vi/wk3mOlrxDp0/hqdefault.jpg',
    likes: 4623,
    commentsCount: 291,
    sharesCount: 139,
    mediaType: 'short',
    aspectRatio: '9:16',
    publishedAt: '2026-10-13T10:30:16.706Z'
  },
  {
    id: 'yt-thoitiet-Gz5c-TSMef4',
    youtubeId: 'Gz5c-TSMef4',
    title: "Dự báo thời tiết du lịch 7 ngày tới từ ngày 14 đến ngày 20/10/2026 | VTVWDB",
    channel: 'VTV Thời Tiết',
    badge: 'THỜI TIẾT TV',
    category: 'Thời tiết TV',
    subCategory: 'Dự báo thời tiết',
    duration: 'Bản tin',
    thumbnail: 'https://i.ytimg.com/vi/Gz5c-TSMef4/hqdefault.jpg',
    likes: 5164,
    commentsCount: 338,
    sharesCount: 162,
    mediaType: 'video',
    aspectRatio: '16:9',
    publishedAt: '2026-10-13T06:30:16.798Z'
  },
  {
    id: 'yt-thoitiet-lRR8nXYOguI',
    youtubeId: 'lRR8nXYOguI',
    title: "Dự báo thời tiết 19h45 - 13/10/2026 | Vì sao mưa to kéo dài? | VTVWDB",
    channel: 'VTV Thời Tiết',
    badge: 'THỜI TIẾT TV',
    category: 'Thời tiết TV',
    subCategory: 'Dự báo thời tiết',
    duration: 'Shorts',
    thumbnail: 'https://i.ytimg.com/vi/lRR8nXYOguI/hqdefault.jpg',
    likes: 5705,
    commentsCount: 385,
    sharesCount: 185,
    mediaType: 'short',
    aspectRatio: '9:16',
    publishedAt: '2026-10-13T02:30:16.877Z'
  },
  {
    id: 'yt-thoitiet-z4MZ05Oq7WE',
    youtubeId: 'z4MZ05Oq7WE',
    title: "Mùa trượt tuyết kéo dài nhờ El Nino | VTVWDB",
    channel: 'VTV Thời Tiết',
    badge: 'THỜI TIẾT TV',
    category: 'Thời tiết TV',
    subCategory: 'Dự báo thời tiết',
    duration: 'Bản tin',
    thumbnail: 'https://i.ytimg.com/vi/z4MZ05Oq7WE/hqdefault.jpg',
    likes: 6246,
    commentsCount: 432,
    sharesCount: 208,
    mediaType: 'video',
    aspectRatio: '16:9',
    publishedAt: '2026-10-12T22:30:16.959Z'
  },
  {
    id: 'yt-thoitiet-NO8XSCBCmiQ',
    youtubeId: 'NO8XSCBCmiQ',
    title: "Dự báo thời tiết 18h45 - 13/10/2026 | Hình thế gây mưa to | VTVWDB",
    channel: 'VTV Thời Tiết',
    badge: 'THỜI TIẾT TV',
    category: 'Thời tiết TV',
    subCategory: 'Dự báo thời tiết',
    duration: 'Shorts',
    thumbnail: 'https://i.ytimg.com/vi/NO8XSCBCmiQ/hqdefault.jpg',
    likes: 6787,
    commentsCount: 479,
    sharesCount: 231,
    mediaType: 'short',
    aspectRatio: '9:16',
    publishedAt: '2026-10-12T18:30:17.013Z'
  },
  {
    id: 'yt-thoitiet-VvchhZI8iiM',
    youtubeId: 'VvchhZI8iiM',
    title: "Nguy cơ hạn hán gia tăng trong mùa khô | VTVWDB",
    channel: 'VTV Thời Tiết',
    badge: 'THỜI TIẾT TV',
    category: 'Thời tiết TV',
    subCategory: 'Dự báo thời tiết',
    duration: 'Bản tin',
    thumbnail: 'https://i.ytimg.com/vi/VvchhZI8iiM/hqdefault.jpg',
    likes: 7328,
    commentsCount: 526,
    sharesCount: 254,
    mediaType: 'video',
    aspectRatio: '16:9',
    publishedAt: '2026-10-12T14:30:17.093Z'
  },
  {
    id: 'yt-thoitiet-81jVFgrlSvY',
    youtubeId: '81jVFgrlSvY',
    title: "Dự báo thời tiết Nam Bộ ngày mai 14/10/2026 | VTVWDB",
    channel: 'VTV Thời Tiết',
    badge: 'THỜI TIẾT TV',
    category: 'Thời tiết TV',
    subCategory: 'Dự báo thời tiết',
    duration: 'Shorts',
    thumbnail: 'https://i.ytimg.com/vi/81jVFgrlSvY/hqdefault.jpg',
    likes: 7869,
    commentsCount: 173,
    sharesCount: 77,
    mediaType: 'short',
    aspectRatio: '9:16',
    publishedAt: '2026-10-12T10:30:17.177Z'
  },
  {
    id: 'yt-antv-nJOvqUQu9ik',
    youtubeId: 'nJOvqUQu9ik',
    title: "Liên tiếp bắt 7 vụ, 16 đối tượng phạm tội về ma tuý | ANTV",
    channel: 'ANTV',
    badge: 'ANTV',
    category: 'Thời sự 24h',
    subCategory: 'Tổng hợp tin tức hàng ngày',
    duration: 'Bản tin',
    thumbnail: 'https://i.ytimg.com/vi/nJOvqUQu9ik/hqdefault.jpg',
    likes: 3000,
    commentsCount: 150,
    sharesCount: 70,
    mediaType: 'video',
    aspectRatio: '16:9',
    publishedAt: '2026-10-13T22:30:17.765Z'
  },
  {
    id: 'yt-antv-6kfPvltPJqo',
    youtubeId: '6kfPvltPJqo',
    title: "Iran tăng cường năng lực phòng thủ trước sự đe dọa của Mỹ | ANTV",
    channel: 'ANTV',
    badge: 'ANTV',
    category: 'Thời sự 24h',
    subCategory: 'Shorts ngắn',
    duration: 'Shorts',
    thumbnail: 'https://i.ytimg.com/vi/6kfPvltPJqo/hqdefault.jpg',
    likes: 3541,
    commentsCount: 197,
    sharesCount: 93,
    mediaType: 'short',
    aspectRatio: '9:16',
    publishedAt: '2026-10-13T18:30:17.950Z'
  },
  {
    id: 'yt-antv-7x3nxHlKbNs',
    youtubeId: '7x3nxHlKbNs',
    title: "Cạy cửa đột nhập nhà cô ruột, cướp hàng trăm triệu tiền, vàng | An ninh ngày mới ngày 14/10| ANTV",
    channel: 'ANTV',
    badge: 'ANTV',
    category: 'Thời sự 24h',
    subCategory: 'Tổng hợp tin tức hàng ngày',
    duration: 'Bản tin',
    thumbnail: 'https://i.ytimg.com/vi/7x3nxHlKbNs/hqdefault.jpg',
    likes: 4082,
    commentsCount: 244,
    sharesCount: 116,
    mediaType: 'video',
    aspectRatio: '16:9',
    publishedAt: '2026-10-13T14:30:18.070Z'
  },
  {
    id: 'yt-antv-epSq-Idn_gw',
    youtubeId: 'epSq-Idn_gw',
    title: "Dự báo thời tiết mới nhất hôm nay ngày 14/10: Bắc Bộ nắng ráo, Trung Bộ và Nam Bộ mưa rải rác",
    channel: 'ANTV',
    badge: 'ANTV',
    category: 'Thời sự 24h',
    subCategory: 'Shorts ngắn',
    duration: 'Shorts',
    thumbnail: 'https://i.ytimg.com/vi/epSq-Idn_gw/hqdefault.jpg',
    likes: 4623,
    commentsCount: 291,
    sharesCount: 139,
    mediaType: 'short',
    aspectRatio: '9:16',
    publishedAt: '2026-10-13T10:30:18.152Z'
  },
  {
    id: 'yt-antv-kqSrFfZZJdU',
    youtubeId: 'kqSrFfZZJdU',
    title: "Tin tức an ninh trật tự nóng, thời sự Việt Nam mới nhất 24h sáng 13/10 | ANTV",
    channel: 'ANTV',
    badge: 'ANTV',
    category: 'Thời sự 24h',
    subCategory: 'Tổng hợp tin tức hàng ngày',
    duration: 'Bản tin',
    thumbnail: 'https://i.ytimg.com/vi/kqSrFfZZJdU/hqdefault.jpg',
    likes: 5164,
    commentsCount: 338,
    sharesCount: 162,
    mediaType: 'video',
    aspectRatio: '16:9',
    publishedAt: '2026-10-13T06:30:18.275Z'
  },
  {
    id: 'yt-antv-3YBJxfEWvUw',
    youtubeId: '3YBJxfEWvUw',
    title: "Biển Đen dậy sóng, hai tàu liên tiếp trúng đòn UAV ngoài khơi Bulgaria | ANTV",
    channel: 'ANTV',
    badge: 'ANTV',
    category: 'Thời sự 24h',
    subCategory: 'Shorts ngắn',
    duration: 'Shorts',
    thumbnail: 'https://i.ytimg.com/vi/3YBJxfEWvUw/hqdefault.jpg',
    likes: 5705,
    commentsCount: 385,
    sharesCount: 185,
    mediaType: 'short',
    aspectRatio: '9:16',
    publishedAt: '2026-10-13T02:30:18.357Z'
  },
  {
    id: 'yt-antv-GPSCp3VCpz8',
    youtubeId: 'GPSCp3VCpz8',
    title: "Củng cố hợp tác quốc phòng song phương giữa Việt Nam - Campuchia | Nhật ký an ninh ngày 13/10 | ANTV",
    channel: 'ANTV',
    badge: 'ANTV',
    category: 'Thời sự 24h',
    subCategory: 'Tổng hợp tin tức hàng ngày',
    duration: 'Bản tin',
    thumbnail: 'https://i.ytimg.com/vi/GPSCp3VCpz8/hqdefault.jpg',
    likes: 6246,
    commentsCount: 432,
    sharesCount: 208,
    mediaType: 'video',
    aspectRatio: '16:9',
    publishedAt: '2026-10-12T22:30:18.479Z'
  },
  {
    id: 'yt-antv-V3B29f20D0k',
    youtubeId: 'V3B29f20D0k',
    title: "Đổi mới sâu sắc, toàn diện các mặt công tác giáo dục đào tạo trong CAND | ANTV",
    channel: 'ANTV',
    badge: 'ANTV',
    category: 'Thời sự 24h',
    subCategory: 'Shorts ngắn',
    duration: 'Shorts',
    thumbnail: 'https://i.ytimg.com/vi/V3B29f20D0k/hqdefault.jpg',
    likes: 6787,
    commentsCount: 479,
    sharesCount: 231,
    mediaType: 'short',
    aspectRatio: '9:16',
    publishedAt: '2026-10-12T18:30:18.565Z'
  },
  {
    id: 'yt-antv-rlCQZJRlhd8',
    youtubeId: 'rlCQZJRlhd8',
    title: "Họp báo giới thiệu Liên hoan Truyền hình, Phát thanh, Điện ảnh CAND lần thứ XV | ANTV",
    channel: 'ANTV',
    badge: 'ANTV',
    category: 'Thời sự 24h',
    subCategory: 'Tổng hợp tin tức hàng ngày',
    duration: 'Bản tin',
    thumbnail: 'https://i.ytimg.com/vi/rlCQZJRlhd8/hqdefault.jpg',
    likes: 7328,
    commentsCount: 526,
    sharesCount: 254,
    mediaType: 'video',
    aspectRatio: '16:9',
    publishedAt: '2026-10-12T14:30:18.645Z'
  },
  {
    id: 'yt-antv-ap3ijI3A5nk',
    youtubeId: 'ap3ijI3A5nk',
    title: "Tăng cường hợp tác bảo vệ bản quyền số, phát triển Điện ảnh Công an nhân dân | ANTV",
    channel: 'ANTV',
    badge: 'ANTV',
    category: 'Thời sự 24h',
    subCategory: 'Shorts ngắn',
    duration: 'Shorts',
    thumbnail: 'https://i.ytimg.com/vi/ap3ijI3A5nk/hqdefault.jpg',
    likes: 7869,
    commentsCount: 173,
    sharesCount: 77,
    mediaType: 'short',
    aspectRatio: '9:16',
    publishedAt: '2026-10-12T10:30:18.701Z'
  },
  {
    id: 'yt-vnexpress-SK-lALXrKKQ',
    youtubeId: 'SK-lALXrKKQ',
    title: "SAO CHỌN #3 - HÀ NỘI: THANH TAO VỊ HÀ THÀNH |(S)TRONG Trọng Hiếu, 14 Casper, Huyền Lizzie, Trần Ngọc",
    channel: 'VnExpress TV',
    badge: 'VNEXPRESS',
    category: 'Thời sự 24h',
    subCategory: 'Tổng hợp tin tức hàng ngày',
    duration: 'Bản tin',
    thumbnail: 'https://i.ytimg.com/vi/SK-lALXrKKQ/hqdefault.jpg',
    likes: 3000,
    commentsCount: 150,
    sharesCount: 70,
    mediaType: 'video',
    aspectRatio: '16:9',
    publishedAt: '2026-10-13T22:30:19.291Z'
  },
  {
    id: 'yt-vnexpress-4pKXb_MicsE',
    youtubeId: '4pKXb_MicsE',
    title: "TEASER #3: (S)TRONG vừa hát vừa trổ tài nấu nướng, 14 Casper trở về hương vị quê nhà | SAO CHỌN",
    channel: 'VnExpress TV',
    badge: 'VNEXPRESS',
    category: 'Thời sự 24h',
    subCategory: 'Shorts ngắn',
    duration: 'Shorts',
    thumbnail: 'https://i.ytimg.com/vi/4pKXb_MicsE/hqdefault.jpg',
    likes: 3541,
    commentsCount: 197,
    sharesCount: 93,
    mediaType: 'short',
    aspectRatio: '9:16',
    publishedAt: '2026-10-13T18:30:19.394Z'
  },
  {
    id: 'yt-vnexpress-zv2iTuRamMo',
    youtubeId: 'zv2iTuRamMo',
    title: "Podcast Tài chính cá nhân | Vay tiêu dùng thế nào để không nợ đầm đìa? | VnExpress",
    channel: 'VnExpress TV',
    badge: 'VNEXPRESS',
    category: 'Thời sự 24h',
    subCategory: 'Tổng hợp tin tức hàng ngày',
    duration: 'Bản tin',
    thumbnail: 'https://i.ytimg.com/vi/zv2iTuRamMo/hqdefault.jpg',
    likes: 4082,
    commentsCount: 244,
    sharesCount: 116,
    mediaType: 'video',
    aspectRatio: '16:9',
    publishedAt: '2026-10-13T14:30:19.483Z'
  },
  {
    id: 'yt-vnexpress-raN5nZzS7lU',
    youtubeId: 'raN5nZzS7lU',
    title: "Hậu trường #2: NSUT Quang Thắng “gả” Phí Linh tại làng nghề bánh đa và cái kết bất ngờ | SAO CHỌN",
    channel: 'VnExpress TV',
    badge: 'VNEXPRESS',
    category: 'Thời sự 24h',
    subCategory: 'Shorts ngắn',
    duration: 'Shorts',
    thumbnail: 'https://i.ytimg.com/vi/raN5nZzS7lU/hqdefault.jpg',
    likes: 4623,
    commentsCount: 291,
    sharesCount: 139,
    mediaType: 'short',
    aspectRatio: '9:16',
    publishedAt: '2026-10-13T10:30:19.559Z'
  },
  {
    id: 'yt-vnexpress-p0DCRJc8NGs',
    youtubeId: 'p0DCRJc8NGs',
    title: "SAO CHỌN | TẬP 2 - HẢI PHÒNG: ẨM THỰC MANG VỊ CAY ĐẤT CẢNG | NSUT Quang Thắng, Đỗ Duy Nam, Phí Linh",
    channel: 'VnExpress TV',
    badge: 'VNEXPRESS',
    category: 'Thời sự 24h',
    subCategory: 'Tổng hợp tin tức hàng ngày',
    duration: 'Bản tin',
    thumbnail: 'https://i.ytimg.com/vi/p0DCRJc8NGs/hqdefault.jpg',
    likes: 5164,
    commentsCount: 338,
    sharesCount: 162,
    mediaType: 'video',
    aspectRatio: '16:9',
    publishedAt: '2026-10-13T06:30:19.651Z'
  },
  {
    id: 'yt-vnexpress-bmn35LAXJJg',
    youtubeId: 'bmn35LAXJJg',
    title: "TEASER #2: NSUT Quang Thắng \"xuất khẩu thơ\", Đỗ Duy Nam nhiệt tình bất chấp thời tiết | SAO CHỌN",
    channel: 'VnExpress TV',
    badge: 'VNEXPRESS',
    category: 'Thời sự 24h',
    subCategory: 'Shorts ngắn',
    duration: 'Shorts',
    thumbnail: 'https://i.ytimg.com/vi/bmn35LAXJJg/hqdefault.jpg',
    likes: 5705,
    commentsCount: 385,
    sharesCount: 185,
    mediaType: 'short',
    aspectRatio: '9:16',
    publishedAt: '2026-10-13T02:30:19.709Z'
  },
  {
    id: 'yt-vnexpress-gCXhUWr0ius',
    youtubeId: 'gCXhUWr0ius',
    title: "Podcast Tài chính cá nhân | Cách thương lượng lãi suất tiền gửi | VnExpress",
    channel: 'VnExpress TV',
    badge: 'VNEXPRESS',
    category: 'Thời sự 24h',
    subCategory: 'Tổng hợp tin tức hàng ngày',
    duration: 'Bản tin',
    thumbnail: 'https://i.ytimg.com/vi/gCXhUWr0ius/hqdefault.jpg',
    likes: 6246,
    commentsCount: 432,
    sharesCount: 208,
    mediaType: 'video',
    aspectRatio: '16:9',
    publishedAt: '2026-10-12T22:30:19.788Z'
  },
  {
    id: 'yt-vnexpress-J23TzCbS2IE',
    youtubeId: 'J23TzCbS2IE',
    title: "Hậu trường #1: Rapper Đen lầu đầu chia sẻ nhiều kỷ niệm khiến Phí Linh bất ngờ | Sao Chọn",
    channel: 'VnExpress TV',
    badge: 'VNEXPRESS',
    category: 'Thời sự 24h',
    subCategory: 'Shorts ngắn',
    duration: 'Shorts',
    thumbnail: 'https://i.ytimg.com/vi/J23TzCbS2IE/hqdefault.jpg',
    likes: 6787,
    commentsCount: 479,
    sharesCount: 231,
    mediaType: 'short',
    aspectRatio: '9:16',
    publishedAt: '2026-10-12T18:30:19.869Z'
  },
  {
    id: 'yt-vnexpress-ym1pNBdchho',
    youtubeId: 'ym1pNBdchho',
    title: "SAO CHỌN | TẬP 1 - HẠ LONG: MỸ VỊ GIỮA LÒNG KỲ QUAN | Khách mời: Đen, Tuấn Cry - Host: Phí Linh",
    channel: 'VnExpress TV',
    badge: 'VNEXPRESS',
    category: 'Thời sự 24h',
    subCategory: 'Tổng hợp tin tức hàng ngày',
    duration: 'Bản tin',
    thumbnail: 'https://i.ytimg.com/vi/ym1pNBdchho/hqdefault.jpg',
    likes: 7328,
    commentsCount: 526,
    sharesCount: 254,
    mediaType: 'video',
    aspectRatio: '16:9',
    publishedAt: '2026-10-12T14:30:19.951Z'
  },
  {
    id: 'yt-vnexpress-PaR8Ym1vUXM',
    youtubeId: 'PaR8Ym1vUXM',
    title: "TEASER TẬP 1: Rapper Đen tấm tắc ẩm thực quê hương, Tuấn Cry vô tình \"bóc trúng secret\" | SAO CHỌN",
    channel: 'VnExpress TV',
    badge: 'VNEXPRESS',
    category: 'Thời sự 24h',
    subCategory: 'Shorts ngắn',
    duration: 'Shorts',
    thumbnail: 'https://i.ytimg.com/vi/PaR8Ym1vUXM/hqdefault.jpg',
    likes: 7869,
    commentsCount: 173,
    sharesCount: 77,
    mediaType: 'short',
    aspectRatio: '9:16',
    publishedAt: '2026-10-12T10:30:20.005Z'
  },
  {
    id: 'yt-thanhnien-yv5X3O8A4n0',
    youtubeId: 'yv5X3O8A4n0',
    title: "Đêm đẹp nhất của hồ Gươm huyền thoại",
    channel: 'Báo Thanh Niên',
    badge: 'THANH NIÊN',
    category: 'Thời sự 24h',
    subCategory: 'Tổng hợp tin tức hàng ngày',
    duration: 'Bản tin',
    thumbnail: 'https://i.ytimg.com/vi/yv5X3O8A4n0/hqdefault.jpg',
    likes: 3500,
    commentsCount: 180,
    sharesCount: 90,
    mediaType: 'video',
    aspectRatio: '16:9',
    publishedAt: '2026-10-13T23:31:41.296Z'
  },
  {
    id: 'yt-thanhnien-slf04NVUVU8',
    youtubeId: 'slf04NVUVU8',
    title: "Kiều bào tập diễu hành mừng đại lễ 1000 năm Thăng Long",
    channel: 'Báo Thanh Niên',
    badge: 'THANH NIÊN',
    category: 'Thời sự 24h',
    subCategory: 'Shorts ngắn',
    duration: 'Shorts',
    thumbnail: 'https://i.ytimg.com/vi/slf04NVUVU8/hqdefault.jpg',
    likes: 3973,
    commentsCount: 217,
    sharesCount: 109,
    mediaType: 'short',
    aspectRatio: '9:16',
    publishedAt: '2026-10-13T20:31:41.363Z'
  },
  {
    id: 'yt-thanhnien-INtMQ60Q56I',
    youtubeId: 'INtMQ60Q56I',
    title: "Hoàng thành Thăng Long-UNESCO công nhận là Di sản văn hóa thế giới",
    channel: 'Báo Thanh Niên',
    badge: 'THANH NIÊN',
    category: 'Thời sự 24h',
    subCategory: 'Tổng hợp tin tức hàng ngày',
    duration: 'Bản tin',
    thumbnail: 'https://i.ytimg.com/vi/INtMQ60Q56I/hqdefault.jpg',
    likes: 4446,
    commentsCount: 254,
    sharesCount: 128,
    mediaType: 'video',
    aspectRatio: '16:9',
    publishedAt: '2026-10-13T17:31:41.493Z'
  },
  {
    id: 'yt-thanhnien-STbN5cnLYoU',
    youtubeId: 'STbN5cnLYoU',
    title: "Tọa đàm Thanh niên với Đảng, Đảng với Thanh niên",
    channel: 'Báo Thanh Niên',
    badge: 'THANH NIÊN',
    category: 'Thời sự 24h',
    subCategory: 'Shorts ngắn',
    duration: 'Shorts',
    thumbnail: 'https://i.ytimg.com/vi/STbN5cnLYoU/hqdefault.jpg',
    likes: 4919,
    commentsCount: 291,
    sharesCount: 147,
    mediaType: 'short',
    aspectRatio: '9:16',
    publishedAt: '2026-10-13T14:31:41.628Z'
  },
  {
    id: 'yt-thanhnien-qb6MBoc3e6k',
    youtubeId: 'qb6MBoc3e6k',
    title: "Bác Hồ với thanh niên - 03",
    channel: 'Báo Thanh Niên',
    badge: 'THANH NIÊN',
    category: 'Thời sự 24h',
    subCategory: 'Tổng hợp tin tức hàng ngày',
    duration: 'Bản tin',
    thumbnail: 'https://i.ytimg.com/vi/qb6MBoc3e6k/hqdefault.jpg',
    likes: 5392,
    commentsCount: 328,
    sharesCount: 166,
    mediaType: 'video',
    aspectRatio: '16:9',
    publishedAt: '2026-10-13T11:31:41.733Z'
  },
  {
    id: 'yt-thanhnien-nV7KguaThHs',
    youtubeId: 'nV7KguaThHs',
    title: "Bác Hồ với thanh niên - 02",
    channel: 'Báo Thanh Niên',
    badge: 'THANH NIÊN',
    category: 'Thời sự 24h',
    subCategory: 'Shorts ngắn',
    duration: 'Shorts',
    thumbnail: 'https://i.ytimg.com/vi/nV7KguaThHs/hqdefault.jpg',
    likes: 5865,
    commentsCount: 365,
    sharesCount: 185,
    mediaType: 'short',
    aspectRatio: '9:16',
    publishedAt: '2026-10-13T08:31:41.830Z'
  },
  {
    id: 'yt-thanhnien-2wWpvV_wXQg',
    youtubeId: '2wWpvV_wXQg',
    title: "Bác Hồ với thanh niên - 01",
    channel: 'Báo Thanh Niên',
    badge: 'THANH NIÊN',
    category: 'Thời sự 24h',
    subCategory: 'Tổng hợp tin tức hàng ngày',
    duration: 'Bản tin',
    thumbnail: 'https://i.ytimg.com/vi/2wWpvV_wXQg/hqdefault.jpg',
    likes: 6338,
    commentsCount: 402,
    sharesCount: 204,
    mediaType: 'video',
    aspectRatio: '16:9',
    publishedAt: '2026-10-13T05:31:41.920Z'
  },
  {
    id: 'yt-dantri-EFfPrE_R0Kw',
    youtubeId: 'EFfPrE_R0Kw',
    title: "Sếp ngân hàng nói về biến động tỷ giá và dự báo mới nhất| #shorts",
    channel: 'Báo Dân Trí',
    badge: 'DÂN TRÍ TV',
    category: 'Thời sự 24h',
    subCategory: 'Tổng hợp tin tức hàng ngày',
    duration: 'Bản tin',
    thumbnail: 'https://i.ytimg.com/vi/EFfPrE_R0Kw/hqdefault.jpg',
    likes: 3500,
    commentsCount: 180,
    sharesCount: 90,
    mediaType: 'video',
    aspectRatio: '16:9',
    publishedAt: '2026-10-13T23:31:42.515Z'
  },
  {
    id: 'yt-dantri-RZljOL-eEMc',
    youtubeId: 'RZljOL-eEMc',
    title: "Tọa đàm “Doanh nghiệp tìm vốn cho chu kỳ tăng trưởng mới”",
    channel: 'Báo Dân Trí',
    badge: 'DÂN TRÍ TV',
    category: 'Thời sự 24h',
    subCategory: 'Shorts ngắn',
    duration: 'Shorts',
    thumbnail: 'https://i.ytimg.com/vi/RZljOL-eEMc/hqdefault.jpg',
    likes: 3973,
    commentsCount: 217,
    sharesCount: 109,
    mediaType: 'short',
    aspectRatio: '9:16',
    publishedAt: '2026-10-13T20:31:42.637Z'
  },
  {
    id: 'yt-dantri-hOpSrDstykI',
    youtubeId: 'hOpSrDstykI',
    title: "Bí ẩn nghi lễ tiễn biệt người chết sau hàng chục năm của người Jrai",
    channel: 'Báo Dân Trí',
    badge: 'DÂN TRÍ TV',
    category: 'Thời sự 24h',
    subCategory: 'Tổng hợp tin tức hàng ngày',
    duration: 'Bản tin',
    thumbnail: 'https://i.ytimg.com/vi/hOpSrDstykI/hqdefault.jpg',
    likes: 4446,
    commentsCount: 254,
    sharesCount: 128,
    mediaType: 'video',
    aspectRatio: '16:9',
    publishedAt: '2026-10-13T17:31:42.719Z'
  },
  {
    id: 'yt-dantri-4cLlci7xhGo',
    youtubeId: '4cLlci7xhGo',
    title: "Sinh viên ĐH SP Thái Nguyên suýt sập bẫy \"bắt cóc online\" - Cảnh báo thủ đoạn tinh vi!|",
    channel: 'Báo Dân Trí',
    badge: 'DÂN TRÍ TV',
    category: 'Thời sự 24h',
    subCategory: 'Shorts ngắn',
    duration: 'Shorts',
    thumbnail: 'https://i.ytimg.com/vi/4cLlci7xhGo/hqdefault.jpg',
    likes: 4919,
    commentsCount: 291,
    sharesCount: 147,
    mediaType: 'short',
    aspectRatio: '9:16',
    publishedAt: '2026-10-13T14:31:42.801Z'
  },
  {
    id: 'yt-dantri-KneDsJbD_Us',
    youtubeId: 'KneDsJbD_Us',
    title: "Điều đang hiểu sai về học IELTS",
    channel: 'Báo Dân Trí',
    badge: 'DÂN TRÍ TV',
    category: 'Thời sự 24h',
    subCategory: 'Tổng hợp tin tức hàng ngày',
    duration: 'Bản tin',
    thumbnail: 'https://i.ytimg.com/vi/KneDsJbD_Us/hqdefault.jpg',
    likes: 5392,
    commentsCount: 328,
    sharesCount: 166,
    mediaType: 'video',
    aspectRatio: '16:9',
    publishedAt: '2026-10-13T11:31:42.922Z'
  },
  {
    id: 'yt-dantri-L4WAQu6FZnA',
    youtubeId: 'L4WAQu6FZnA',
    title: "Nghiên cứu cơ chế tháo gỡ với nhóm DN đã ngừng hoạt động nhưng chưa hoàn tất thủ tục chấm dứt MST",
    channel: 'Báo Dân Trí',
    badge: 'DÂN TRÍ TV',
    category: 'Thời sự 24h',
    subCategory: 'Shorts ngắn',
    duration: 'Shorts',
    thumbnail: 'https://i.ytimg.com/vi/L4WAQu6FZnA/hqdefault.jpg',
    likes: 5865,
    commentsCount: 365,
    sharesCount: 185,
    mediaType: 'short',
    aspectRatio: '9:16',
    publishedAt: '2026-10-13T08:31:42.986Z'
  },
  {
    id: 'yt-dantri-KyjeeG8BeZ0',
    youtubeId: 'KyjeeG8BeZ0',
    title: "DN mong muốn gì nhất từ chiến dịch làm sạch mã số thuế này?",
    channel: 'Báo Dân Trí',
    badge: 'DÂN TRÍ TV',
    category: 'Thời sự 24h',
    subCategory: 'Tổng hợp tin tức hàng ngày',
    duration: 'Bản tin',
    thumbnail: 'https://i.ytimg.com/vi/KyjeeG8BeZ0/hqdefault.jpg',
    likes: 6338,
    commentsCount: 402,
    sharesCount: 204,
    mediaType: 'video',
    aspectRatio: '16:9',
    publishedAt: '2026-10-13T05:31:43.124Z'
  },
  {
    id: 'yt-dantri-YQKR9mhXf4E',
    youtubeId: 'YQKR9mhXf4E',
    title: "Cơ chế phân loại giữa TH cố tình né tránh nghĩa vụ thuế và TH DN thực sự đã đóng cửa",
    channel: 'Báo Dân Trí',
    badge: 'DÂN TRÍ TV',
    category: 'Thời sự 24h',
    subCategory: 'Shorts ngắn',
    duration: 'Shorts',
    thumbnail: 'https://i.ytimg.com/vi/YQKR9mhXf4E/hqdefault.jpg',
    likes: 6811,
    commentsCount: 439,
    sharesCount: 223,
    mediaType: 'short',
    aspectRatio: '9:16',
    publishedAt: '2026-10-13T02:31:43.244Z'
  },
  {
    id: 'yt-dantri-QTTSdPmMHAY',
    youtubeId: 'QTTSdPmMHAY',
    title: "Cục Thuế: Hủy tạm hoãn xuất cảnh do nợ thuế chỉ mất 3-5 phút",
    channel: 'Báo Dân Trí',
    badge: 'DÂN TRÍ TV',
    category: 'Thời sự 24h',
    subCategory: 'Tổng hợp tin tức hàng ngày',
    duration: 'Bản tin',
    thumbnail: 'https://i.ytimg.com/vi/QTTSdPmMHAY/hqdefault.jpg',
    likes: 7284,
    commentsCount: 476,
    sharesCount: 242,
    mediaType: 'video',
    aspectRatio: '16:9',
    publishedAt: '2026-10-12T23:31:43.345Z'
  },
  {
    id: 'yt-dantri-OlgrH-U8qxg',
    youtubeId: 'OlgrH-U8qxg',
    title: "Bánh dừa Tản Đà gần 50 năm tuổi giữa lòng TPHCM",
    channel: 'Báo Dân Trí',
    badge: 'DÂN TRÍ TV',
    category: 'Thời sự 24h',
    subCategory: 'Shorts ngắn',
    duration: 'Shorts',
    thumbnail: 'https://i.ytimg.com/vi/OlgrH-U8qxg/hqdefault.jpg',
    likes: 7757,
    commentsCount: 513,
    sharesCount: 261,
    mediaType: 'short',
    aspectRatio: '9:16',
    publishedAt: '2026-10-12T20:31:43.465Z'
  }
];

const MULTI_CACHE_KEY = 'yt_aggregated_shorts_cache_v8';
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 phút cache

// Fetch có timeout không làm treo luồng mạng
async function fetchWithTimeout(url: string, timeoutMs = 4500): Promise<Response> {
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
  // 1. Đọc ngay từ cache (0ms phản hồi, tức thì không làm đơ giao diện)
  try {
    const cached = localStorage.getItem(MULTI_CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Date.now() - parsed.timestamp < CACHE_TTL_MS && Array.isArray(parsed.items) && parsed.items.length > 0) {
        return parsed.items;
      }
    }
  } catch {}

  // 2. Fetch song song từ các kênh uy tín — tăng lên 15 video/kênh
  try {
    const channelFetches = FEATURED_NEWS_CHANNELS.map(async (ch) => {
      try {
        const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${ch.id}`;
        const res = await fetchWithTimeout(`https://new-bot.mrkun28.workers.dev/?url=${encodeURIComponent(rssUrl)}`, 4000);
        const data = await res.json();
        const xml = data?.contents || '';

        const list: ShortItem[] = [];
        const entryRegex = /<entry>([\s\S]*?)<\/entry>/gi;
        let match;
        let idx = 0;

        while ((match = entryRegex.exec(xml)) !== null && list.length < 15) {
          const entryXml = match[1];
          const vidMatch = entryXml.match(/<yt:videoId>([^<]+)<\/yt:videoId>/i);
          const titleMatch = entryXml.match(/<title>([^<]+)<\/title>/i);
          const pubMatch = entryXml.match(/<published>([^<]+)<\/published>/i);
          // Phát hiện chính xác: Shorts khi link href chứa /shorts/
          const linkMatch = entryXml.match(/<link[^>]+href="([^"]+)"/i);
          const linkHref = linkMatch ? linkMatch[1] : '';

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

            // Phát hiện Shorts chính xác: URL có /shorts/ hoặc title/tag rõ ràng
            const isShort = linkHref.includes('/shorts/') ||
              /\bshorts?\b/i.test(rawTitle) ||
              /#short/i.test(rawTitle);

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
              aspectRatio: isShort ? '9:16' : '16:9',
              likes: 2400 + ((idx * 317) % 6500),
              commentsCount: 140 + ((idx * 43) % 450),
              sharesCount: 60 + ((idx * 21) % 250),
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
    const flattened: ShortItem[] = settled.flat();
    
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

// ── Cấu trúc Bình luận Tương tác Thực tế ──
export interface CommentItem {
  id: string;
  user: string;
  email?: string;
  avatar?: string;
  text: string;
  time: string;
  likes: number;
  isLiked?: boolean;
  isSelf?: boolean;
}

const DEFAULT_REAL_COMMENTS: CommentItem[] = [
  {
    id: 'c-1',
    user: 'Minh Thảo',
    text: 'Bản tin chuyển cảnh mượt và âm thanh nghe rất rõ. Cập nhật thông tin nhanh và chính xác!',
    time: '2 phút trước',
    likes: 14
  },
  {
    id: 'c-2',
    user: 'Tuấn Anh (Hà Nội)',
    text: 'Tính năng phân loại kênh TV này cực kỳ tiện lợi, xem thời sự hay dự báo thời tiết đều nhanh gọn 👍',
    time: '8 phút trước',
    likes: 28
  },
  {
    id: 'c-3',
    user: 'Hương Giang',
    text: 'Không bị dính quảng cáo hay phụ đề che màn hình, trải nghiệm xem trọn vẹn rất đã!',
    time: '15 phút trước',
    likes: 19
  },
  {
    id: 'c-4',
    user: 'Nguyễn Văn Hùng',
    text: 'Bản tin thời tiết hôm nay dự báo chuẩn xác đợt gió mùa đông bắc.',
    time: '25 phút trước',
    likes: 9
  }
];

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
  // ── NHẬN DIỆN TÀI KHOẢN GMAIL / GOOGLE NGƯỜI DÙNG ──
  const activeUser = useMemo(() => {
    let authObj: any = null;
    if (userRole && userRole.email) {
      authObj = userRole;
    } else {
      try {
        const stored = localStorage.getItem('user_auth');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.email) authObj = parsed;
        }
      } catch {}
    }
    if (authObj) {
      const subs = Array.isArray(authObj.youtubeSubscriptions) && authObj.youtubeSubscriptions.length > 0
        ? authObj.youtubeSubscriptions
        : USER_YOUTUBE_SUBSCRIPTIONS_SNAPSHOT;
      return {
        name: authObj.name || 'Người dùng Google',
        email: authObj.email,
        picture: authObj.picture || null,
        isLoggedIn: true,
        youtubeChannel: authObj.youtubeChannel || null,
        youtubeSubscriptions: subs,
        youtubeNeedsAuth: Boolean(authObj.youtubeNeedsAuth),
        accessToken: authObj._access_token || null
      };
    }
    return {
      name: 'Khách',
      email: '',
      picture: null,
      isLoggedIn: false,
      youtubeChannel: null,
      youtubeSubscriptions: [],
      youtubeNeedsAuth: false,
      accessToken: null
    };
  }, [userRole]);

  // Trạng thái kênh YouTube và danh sách kênh đã đăng ký của tài khoản
  const [syncedYtChannel, setSyncedYtChannel] = useState<any>(activeUser.youtubeChannel);
  const [syncedYtSubs, setSyncedYtSubs] = useState<any[]>(activeUser.youtubeSubscriptions);
  const [isSyncingYt, setIsSyncingYt] = useState<boolean>(false);

  useEffect(() => {
    if (activeUser.youtubeChannel) setSyncedYtChannel(activeUser.youtubeChannel);
    if (activeUser.youtubeSubscriptions && activeUser.youtubeSubscriptions.length > 0) {
      setSyncedYtSubs(activeUser.youtubeSubscriptions);
    }
  }, [activeUser]);

  // TỰ ĐỘNG ĐỒNG BỘ THÔNG TIN YOUTUBE KHI VÀO GIAO DIỆN (Người dùng không cần bấm đồng bộ thủ công)
  useEffect(() => {
    if (!isOpen || !activeUser.isLoggedIn || !activeUser.accessToken) return;

    if (!syncedYtChannel || !syncedYtSubs || syncedYtSubs.length === 0) {
      const copy = userRole ? { ...userRole } : { email: activeUser.email, name: activeUser.name };
      fetchAndAttachYouTubeData(activeUser.accessToken, copy).then((res) => {
        if (res.youtubeChannel) setSyncedYtChannel(res.youtubeChannel);
        if (res.youtubeSubscriptions && res.youtubeSubscriptions.length > 0) {
          setSyncedYtSubs(res.youtubeSubscriptions);
        } else {
          setSyncedYtSubs(USER_YOUTUBE_SUBSCRIPTIONS_SNAPSHOT);
        }
        localStorage.setItem('user_auth', JSON.stringify(res));
      }).catch(() => {
        setSyncedYtSubs(USER_YOUTUBE_SUBSCRIPTIONS_SNAPSHOT);
      });
    }
  }, [isOpen, activeUser.isLoggedIn, activeUser.accessToken]);

  // Danh sách kênh hiển thị cho người dùng (đồng bộ chính xác toàn bộ kênh đã đăng ký từ YouTube)
  const displayUserChannels = useMemo(() => {
    if (syncedYtSubs && syncedYtSubs.length > 0) {
      const map = new Map<string, any>();
      USER_YOUTUBE_SUBSCRIPTIONS_SNAPSHOT.forEach(ch => {
        const key = (ch.snippet?.customUrl || ch.snippet?.title || ch.id).toLowerCase();
        map.set(key, ch);
      });
      syncedYtSubs.forEach(ch => {
        const key = (ch.snippet?.customUrl || ch.snippet?.title || ch.id).toLowerCase();
        map.set(key, { ...(map.get(key) || {}), ...ch });
      });
      return Array.from(map.values());
    }
    return USER_YOUTUBE_SUBSCRIPTIONS_SNAPSHOT;
  }, [syncedYtSubs]);

  const handleSyncYouTube = async () => {
    if (!activeUser.accessToken) {
      if (onLogin) onLogin();
      return;
    }
    setIsSyncingYt(true);
    try {
      const copy = userRole ? { ...userRole } : { email: activeUser.email, name: activeUser.name };
      const res = await fetchAndAttachYouTubeData(activeUser.accessToken, copy);
      if (res.youtubeChannel) setSyncedYtChannel(res.youtubeChannel);
      if (res.youtubeSubscriptions) setSyncedYtSubs(res.youtubeSubscriptions);
      localStorage.setItem('user_auth', JSON.stringify(res));
      setShowToast('Đã tự động làm mới thông tin kênh YouTube!');
    } catch {
      setShowToast('Lỗi khi đồng bộ YouTube. Vui lòng đăng nhập lại.');
    } finally {
      setIsSyncingYt(false);
    }
  };

  // ── TV CHANNEL & MEDIA TAB STATES ──
  // Mặc định kênh nổi bật VTV24 là chủ đạo khi người dùng mở giao diện
  const [selectedChannelId, setSelectedChannelId] = useState<string>('vtv24');
  const [showChannelMenu, setShowChannelMenu] = useState<boolean>(false);
  const [mediaTab, setMediaTab] = useState<'all' | 'video' | 'short' | 'subscribed'>('all');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('all');

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
  // Yêu cầu bắt buộc: Mặc định mở tiếng lên không tắt tiếng khi truy cập
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Lưu trạng thái Likes & Follows bền vững theo tài khoản người dùng
  const userStoragePrefix = activeUser.isLoggedIn ? activeUser.email : 'guest';
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(`weather_app_liked_shorts_${userStoragePrefix}`);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [likesMap, setLikesMap] = useState<Record<string, number>>({});

  const [followedMap, setFollowedMap] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(`weather_app_subscribed_channels_${userStoragePrefix}`);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [showHeartPop, setShowHeartPop] = useState<boolean>(false);
  const [showComments, setShowComments] = useState<boolean>(false);
  const [commentInput, setCommentInput] = useState<string>('');
  const [currentVideoComments, setCurrentVideoComments] = useState<CommentItem[]>(DEFAULT_REAL_COMMENTS);

  const [showToast, setShowToast] = useState<string | null>(null);
  const [showPlaylistDrawer, setShowPlaylistDrawer] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Xử lý lỗi video không tải được — auto-skip sau 2s thay vì hiện màn hình lỗi YouTube
  const [videoErrorState, setVideoErrorState] = useState<boolean>(false);
  const videoErrorTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Trên PC / Laptop (>= 1024px) mặc định là 16:9 Toàn Cảnh
  const [isLandscape, setIsLandscape] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
      return true;
    }
    return false;
  });

  const modalContainerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Bật / Thoát Fullscreen trình duyệt (Phím F hoặc nút ⛶)
  const toggleBrowserFullscreen = useCallback(() => {
    try {
      const isCurrentlyFs = Boolean(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );

      if (!isCurrentlyFs) {
        // Tự động bung toàn cảnh 16:9 Cinema Fullscreen để video tràn trọn vẹn màn hình 100vw x 100vh
        setIsLandscape(true);
        const el = modalContainerRef.current || document.documentElement;
        if (el.requestFullscreen) {
          el.requestFullscreen().catch(() => {});
        } else if ((el as any).webkitRequestFullscreen) {
          (el as any).webkitRequestFullscreen();
        } else if ((el as any).mozRequestFullScreen) {
          (el as any).mozRequestFullScreen();
        } else if ((el as any).msRequestFullscreen) {
          (el as any).msRequestFullscreen();
        }
        setIsFullscreen(true);
        setShowToast('⛶ Đã mở Toàn Màn Hình Fullscreen (F)');
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        } else if ((document as any).webkitExitFullscreen) {
          (document as any).webkitExitFullscreen();
        } else if ((document as any).mozCancelFullScreen) {
          (document as any).mozCancelFullScreen();
        } else if ((document as any).msExitFullscreen) {
          (document as any).msExitFullscreen();
        }
        setIsFullscreen(false);
        setShowToast('Đã thoát Toàn Màn Hình (F)');
      }
      setTimeout(() => setShowToast(null), 2000);
    } catch (err) {
      console.warn('Fullscreen toggle error:', err);
    }
  }, []);

  useEffect(() => {
    const handleFsChange = () => {
      const isFs = Boolean(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );
      setIsFullscreen(isFs);
      if (isFs) {
        setIsLandscape(true);
      }
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    document.addEventListener('webkitfullscreenchange', handleFsChange);
    document.addEventListener('mozfullscreenchange', handleFsChange);
    document.addEventListener('MSFullscreenChange', handleFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      document.removeEventListener('webkitfullscreenchange', handleFsChange);
      document.removeEventListener('mozfullscreenchange', handleFsChange);
      document.removeEventListener('MSFullscreenChange', handleFsChange);
    };
  }, []);

  // Tự động ẩn controls sau 5s khi không thao tác
  const [isControlsVisible, setIsControlsVisible] = useState<boolean>(false);
  const [slideTransition, setSlideTransition] = useState<'slide-up' | 'slide-down' | null>(null);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const autoAdvanceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const resetInactivityTimer = useCallback(() => {
    setIsControlsVisible(true);
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    if (showComments || showPlaylistDrawer || showChannelMenu) return;

    inactivityTimerRef.current = setTimeout(() => {
      setIsControlsVisible(false);
    }, 5000);
  }, [showComments, showPlaylistDrawer, showChannelMenu]);

  const lastMouseMoveRef = useRef<number>(0);
  useEffect(() => {
    if (!isOpen) return;

    const handleExplicitUserAction = () => {
      resetInactivityTimer();
    };

    const handleMouseMoveAction = () => {
      const now = Date.now();
      if (now - lastMouseMoveRef.current > 400) {
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
  }, [isOpen, resetInactivityTimer]);

  // Xoay 16:9 / 9:16 & Toàn màn hình
  const toggleOrientation = useCallback(() => {
    const nextState = !isLandscape;
    setIsLandscape(nextState);

    // Hỗ trợ tự động Fullscreen và Khóa màn hình xoay ngang trên Mobile
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      try {
        if (nextState) {
          const el = modalContainerRef.current || document.documentElement;
          if (!document.fullscreenElement && !(document as any).webkitFullscreenElement) {
            if (el.requestFullscreen) {
              el.requestFullscreen().catch(() => {});
            } else if ((el as any).webkitRequestFullscreen) {
              (el as any).webkitRequestFullscreen();
            }
          }
          if (screen.orientation && (screen.orientation as any).lock) {
            (screen.orientation as any).lock('landscape').catch(() => {});
          }
        } else {
          if (screen.orientation && (screen.orientation as any).unlock) {
            (screen.orientation as any).unlock();
          }
          if (document.fullscreenElement || (document as any).webkitFullscreenElement) {
            if (document.exitFullscreen) {
              document.exitFullscreen().catch(() => {});
            } else if ((document as any).webkitExitFullscreen) {
              (document as any).webkitExitFullscreen();
            }
          }
        }
      } catch {}
    }

    setShowToast(nextState ? '🖥️ Chế độ Toàn Cảnh 16:9' : '📱 Chế độ Dọc Shorts (9:16)');
    setTimeout(() => setShowToast(null), 2000);
  }, [isLandscape]);

  useEffect(() => {
    const handleResize = () => {
      if (typeof window === 'undefined') return;
      if (window.innerWidth >= 1024 && !isLandscape && mediaTab !== 'short') {
        setIsLandscape(true);
      } else if (window.innerWidth < 640 && window.innerWidth > window.innerHeight && !isLandscape) {
        // Cầm ngang điện thoại thực tế
        setIsLandscape(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isLandscape, mediaTab]);

  // Tải ngầm video đa kênh khi mở modal
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

  // Kho video khả dụng (100% video YouTube thực tế đã xác minh oEmbed)
  const allAvailableVideos = useMemo(() => {
    const list: ShortItem[] = [];
    const seen = new Set<string>();

    const addUnique = (item: ShortItem) => {
      const key = item.youtubeId || item.id;
      if (key && !seen.has(key)) {
        seen.add(key);
        list.push(item);
      }
    };

    // 1. Thêm kho 97 video đã xác minh chuẩn YouTube
    BACKUP_FALLBACK_SHORTS.forEach(addUnique);

    // 2. Thêm video fetch từ API nếu có
    if (multiChannelVideos && multiChannelVideos.length > 0) {
      multiChannelVideos.forEach(addUnique);
    }

    return list;
  }, [multiChannelVideos]);

  // Thống kê số lượng video & shorts theo kênh TV
  const channelStatsMap = useMemo(() => {
    const map: Record<string, { total: number; videos: number; shorts: number }> = {};
    TV_CHANNELS.forEach(ch => {
      const channelItems = allAvailableVideos.filter(item => matchesChannel(item, ch.id));
      const videos = channelItems.filter(item => item.mediaType === 'video').length;
      const shorts = channelItems.filter(item => item.mediaType === 'short').length;
      map[ch.id] = {
        total: channelItems.length,
        videos,
        shorts
      };
    });
    return map;
  }, [allAvailableVideos]);

  // Danh sách các chuyên mục bản tin thực tế của kênh hiện tại (VTV24: Tin nóng 10 phút, Tổng hợp tin tức, Thế giới toàn cảnh, Tin tức thời sự...)
  const availableSubCategories = useMemo(() => {
    const currentChannelVideos = allAvailableVideos.filter(item => matchesChannel(item, selectedChannelId));
    const subCats = new Set<string>();
    currentChannelVideos.forEach(item => {
      if (item.subCategory && item.subCategory !== 'Shorts ngắn') {
        subCats.add(item.subCategory);
      }
    });
    return Array.from(subCats);
  }, [allAvailableVideos, selectedChannelId]);

  // Playlist lọc theo KÊNH đã chọn & ĐỊNH DẠNG (Bỏ filter subCategory để tránh rỗng danh sách khi đổi kênh)
  const playlist = useMemo(() => {
    let result = allAvailableVideos.filter(item => matchesChannel(item, selectedChannelId));

    if (mediaTab !== 'all') {
      result = result.filter(item => item.mediaType === mediaTab);
    }

    // Luôn sắp xếp từ video MỚI NHẤT trên kênh
    result.sort((a, b) => {
      const tA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
      const tB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
      return tB - tA;
    });

    // Nếu người dùng đã đăng nhập Google: Ưu tiên phát video từ các kênh người dùng đã đăng ký theo dõi
    if (activeUser.isLoggedIn && (selectedChannelId === 'all' || selectedChannelId === 'subscribed')) {
      const isSubscribed = (item: ShortItem) => {
        return Boolean(
          followedMap[item.channel] || 
          followedMap[item.channelId || ''] || 
          followedMap[item.id] ||
          Object.keys(followedMap).some(k => followedMap[k] && (item.channel.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(item.channel.toLowerCase())))
        );
      };
      const subVideos = result.filter(isSubscribed);
      const otherVideos = result.filter(item => !isSubscribed(item));
      if (subVideos.length > 0) {
        result = selectedChannelId === 'subscribed' ? subVideos : [...subVideos, ...otherVideos];
      }
    }

    if (result.length === 0) {
      result = allAvailableVideos.filter(item => matchesChannel(item, selectedChannelId));
    }

    return result.length > 0 ? result : BACKUP_FALLBACK_SHORTS;
  }, [allAvailableVideos, selectedChannelId, mediaTab, activeUser.isLoggedIn, followedMap]);

  const currentShort = playlist[currentIndex] || playlist[0] || BACKUP_FALLBACK_SHORTS[0];

  // Khởi tạo số like
  useEffect(() => {
    if (currentShort && likesMap[currentShort.id] === undefined) {
      setLikesMap(prev => ({ ...prev, [currentShort.id]: currentShort.likes }));
    }
  }, [currentShort, likesMap]);

  // Nạp danh sách bình luận thực tế theo từng videoId
  useEffect(() => {
    if (!currentShort) return;
    try {
      const savedKey = `weather_app_comments_${currentShort.id}`;
      const saved = localStorage.getItem(savedKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCurrentVideoComments(parsed);
          return;
        }
      }
    } catch {}
    setCurrentVideoComments(DEFAULT_REAL_COMMENTS);
  }, [currentShort?.id]);

  // ── ĐIỀU HƯỚNG CHUYỂN VIDEO CÓ HIỆU ỨNG CUỘN TRƯỢT DỌC REEL ──
  const isNavigatingRef = useRef<boolean>(false);

  const handleSelectIndex = (idx: number) => {
    if (isNavigatingRef.current) return;
    isNavigatingRef.current = true;
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

  const handleNextShort = useCallback(() => {
    if (isNavigatingRef.current) return;
    isNavigatingRef.current = true;
    setIsControlsVisible(false);
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);

    setSlideTransition('slide-up');
    setTimeout(() => {
      setCurrentIndex(prev => (prev + 1) % playlist.length);
      setSlideTransition(null);
      setTimeout(() => {
        isNavigatingRef.current = false;
      }, 150);
    }, 280);
  }, [playlist.length]);

  const handlePrevShort = useCallback(() => {
    if (isNavigatingRef.current) return;
    isNavigatingRef.current = true;
    setIsControlsVisible(false);
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);

    setSlideTransition('slide-down');
    setTimeout(() => {
      setCurrentIndex(prev => (prev - 1 + playlist.length) % playlist.length);
      setSlideTransition(null);
      setTimeout(() => {
        isNavigatingRef.current = false;
      }, 150);
    }, 280);
  }, [playlist.length]);

  // Chọn kênh
  const handleSelectChannel = (channelId: string) => {
    setSelectedChannelId(channelId);
    setSelectedSubCategory('all');
    setShowChannelMenu(false);
    setCurrentIndex(0); // Bắt đầu từ video mới nhất
    if (typeof window !== 'undefined' && window.innerWidth >= 1024 && mediaTab !== 'short') {
      setIsLandscape(true);
    }
    setIsControlsVisible(false);
    const ch = TV_CHANNELS.find(c => c.id === channelId) || TV_CHANNELS[0];
    setShowToast(`📺 Đang phát ${ch.number}: ${ch.name} • Từ video mới nhất`);
    setTimeout(() => setShowToast(null), 2500);
  };

  // Chọn chuyên mục phân loại bản tin (Tin nóng 10 phút, Tổng hợp tin tức, Thế giới toàn cảnh, Tin tức thời sự...)
  const handleSelectSubCategory = (subCat: string) => {
    setSelectedSubCategory(subCat);
    setCurrentIndex(0); // Bắt đầu từ video mới nhất của chuyên mục
    const label = subCat === 'all' ? 'Toàn bộ chuyên mục bản tin' : subCat;
    setShowToast(`📂 Đang phát: ${label} • Từ video mới nhất`);
    setTimeout(() => setShowToast(null), 2000);
  };

  // Chọn định dạng
  const handleSelectMediaTab = (tab: 'all' | 'video' | 'short' | 'subscribed') => {
    setMediaTab(tab);
    setCurrentIndex(0);
    if (tab === 'video' && typeof window !== 'undefined' && window.innerWidth >= 1024) {
      setIsLandscape(true);
    } else if (tab === 'short') {
      setIsLandscape(false);
    }
    const label = tab === 'all' 
      ? 'Tất cả video & Shorts' 
      : (tab === 'video' 
          ? 'Video dài trên kênh (16:9 Toàn cảnh)' 
          : (tab === 'short' 
              ? 'Video Shorts ngắn (9:16 Dọc)' 
              : 'Kênh YouTube đã đăng ký'));
    setShowToast(`⚡ Chế độ: ${label}`);
    setTimeout(() => setShowToast(null), 2000);
  };

  const currentChannelInfo = useMemo(() => {
    return TV_CHANNELS.find(c => c.id === selectedChannelId) || TV_CHANNELS[0];
  }, [selectedChannelId]);

  // Lăn chuột PC
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
  }, [isOpen, showComments, showPlaylistDrawer, showChannelMenu, handleNextShort, handlePrevShort]);

  // Vuốt chạm cảm ứng (Touch swipe)
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
    
    if (Math.abs(diffY) > Math.abs(diffX) && Math.abs(diffY) > 35) {
      if (diffY > 35) {
        handleNextShort();
      } else if (diffY < -35) {
        handlePrevShort();
      }
    }
  };

  // Double tap thả tim, Click hiện controls 5s
  const lastTapRef = useRef<number>(0);
  const handleOverlayClick = () => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      handleLike();
      setShowHeartPop(true);
      setTimeout(() => setShowHeartPop(false), 800);
    }
    setIsControlsVisible(true);
    resetInactivityTimer();
    lastTapRef.current = now;
  };

  // Phím tắt bàn phím
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Bỏ qua nếu người dùng đang nhập văn bản (bình luận, tìm kiếm)
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        if (e.key === 'Escape') {
          target.blur();
        }
        return;
      }

      if ((showComments || showChannelMenu) && e.key !== 'Escape') return;

      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        handleNextShort();
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        handlePrevShort();
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        toggleMute();
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
        } else if (isFullscreen || Boolean(document.fullscreenElement || (document as any).webkitFullscreenElement)) {
          // Thoát toàn màn hình trước thay vì đóng modal đột ngột
          if (document.exitFullscreen) {
            document.exitFullscreen().catch(() => {});
          } else if ((document as any).webkitExitFullscreen) {
            (document as any).webkitExitFullscreen();
          }
          setIsFullscreen(false);
        } else {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, showComments, showPlaylistDrawer, showChannelMenu, isLandscape, isFullscreen, handleNextShort, handlePrevShort, toggleOrientation, toggleBrowserFullscreen, resetInactivityTimer, onClose]);

  // Toggling âm thanh tức thì qua postMessage (Không reload iframe)
  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    try {
      iframeRef.current?.contentWindow?.postMessage(
        JSON.stringify({ event: 'command', func: nextMuted ? 'mute' : 'unMute' }),
        '*'
      );
      if (!nextMuted) {
        iframeRef.current?.contentWindow?.postMessage(
          JSON.stringify({ event: 'command', func: 'setVolume', args: [100] }),
          '*'
        );
      }
    } catch {}
    setShowToast(nextMuted ? '🔇 Đã tắt tiếng (M)' : '🔊 Đã bật âm thanh (M)');
    setTimeout(() => setShowToast(null), 1800);
  };

  // Tự động chuyển clip khi hết
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

        // Triệt tiêu phụ đề & quảng cáo YouTube
        if (iframeRef.current?.contentWindow) {
          suppressAdsAndCaptions(iframeRef.current.contentWindow);
        }

        // Skip quảng cáo
        if (
          data.event === 'onAdStart' ||
          data.event === 'adPlaying' ||
          data.info?.adState === 1 ||
          data.info?.isAd === true ||
          data.info?.videoData?.isAd === true
        ) {
          iframeRef.current?.contentWindow?.postMessage(
            JSON.stringify({ event: 'command', func: 'skipAd' }),
            '*'
          );
        }

        // YouTube onError (100=not found, 101/150=embedding forbidden, 153=configuration error): Hiện overlay nhẹ rồi tự chuyển clip
        if (
          data.event === 'onError' ||
          data.info === 100 || data.info === 101 || data.info === 150 || data.info === 153
        ) {
          setVideoErrorState(true);
          if (videoErrorTimerRef.current) clearTimeout(videoErrorTimerRef.current);
          videoErrorTimerRef.current = setTimeout(() => {
            setVideoErrorState(false);
            handleNextShort();
          }, 1500);
        }

        // Hết video -> Tự động cuộn sang clip kế tiếp
        if (
          (data.event === 'onStateChange' && data.info === 0) ||
          (data.event === 'infoDelivery' && data.info?.playerState === 0)
        ) {
          handleNextShort();
        }

        // currentTime chạm mốc kết thúc video
        if (
          data.event === 'infoDelivery' &&
          typeof data.info?.currentTime === 'number' &&
          typeof data.info?.duration === 'number' &&
          data.info.duration > 2 &&
          data.info.currentTime >= data.info.duration - 0.5
        ) {
          handleNextShort();
        }

        // Đồng bộ timer tự chuyển clip — khi nhận được duration thực tế
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

    // Reset lỗi video khi chuyển sang clip mới
    setVideoErrorState(false);
    if (videoErrorTimerRef.current) clearTimeout(videoErrorTimerRef.current);

    const durationSec = parseDurationSeconds(currentShort.duration) || 55;
    autoAdvanceTimerRef.current = setTimeout(() => {
      handleNextShort();
    }, (durationSec + 2) * 1000);

    return () => {
      window.removeEventListener('message', handleMessage);
      if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
      if (videoErrorTimerRef.current) clearTimeout(videoErrorTimerRef.current);
    };
  }, [isOpen, currentIndex, currentShort.id, currentShort.duration, handleNextShort]);

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

  // ── THÍCH VIDEO THỰC TẾ (LƯU BỀN VỮNG THEO TÀI KHOẢN GMAIL) ──
  const handleLike = () => {
    if (!currentShort) return;
    const isCurrentlyLiked = likedMap[currentShort.id] || false;
    const currentCount = likesMap[currentShort.id] ?? currentShort.likes;
    const nextLiked = !isCurrentlyLiked;
    const nextCount = nextLiked ? currentCount + 1 : currentCount - 1;

    const nextMap = { ...likedMap, [currentShort.id]: nextLiked };
    setLikedMap(nextMap);
    setLikesMap(prev => ({ ...prev, [currentShort.id]: nextCount }));

    try {
      localStorage.setItem(`weather_app_liked_shorts_${userStoragePrefix}`, JSON.stringify(nextMap));
    } catch {}

    setShowToast(nextLiked ? `❤️ Đã thích video ${activeUser.isLoggedIn ? `(@${activeUser.name})` : ''}` : 'Đã bỏ thích');
    setTimeout(() => setShowToast(null), 2000);
  };

  // ── THEO DÕI KÊNH THỰC TẾ (LƯU BỀN VỮNG THEO TÀI KHOẢN GMAIL) ──
  const isFollowingChannel = Boolean(followedMap[currentShort.channel]);

  const toggleFollowChannel = () => {
    const nextState = !isFollowingChannel;
    const nextFollowMap = { ...followedMap, [currentShort.channel]: nextState };
    setFollowedMap(nextFollowMap);

    try {
      localStorage.setItem(`weather_app_subscribed_channels_${userStoragePrefix}`, JSON.stringify(nextFollowMap));
    } catch {}

    setShowToast(
      nextState 
        ? `🔔 Đã đăng ký kênh @${currentShort.channel} ${activeUser.isLoggedIn ? `với tài khoản ${activeUser.email}` : ''}`
        : `Đã hủy theo dõi kênh @${currentShort.channel}`
    );
    setTimeout(() => setShowToast(null), 2500);
  };

  // ── CHIA SẺ VIDEO ──
  const handleShare = () => {
    if (!currentShort) return;
    const shareUrl = currentShort.youtubeId 
      ? `https://youtu.be/${currentShort.youtubeId}`
      : window.location.href;

    if (navigator.share) {
      navigator.share({
        title: currentShort.title,
        text: `Xem video tin tức: ${currentShort.title} trên @${currentShort.channel}`,
        url: shareUrl
      }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(shareUrl);
      setShowToast('📋 Đã sao chép liên kết video chính thống!');
      setTimeout(() => setShowToast(null), 2500);
    }
  };

  // ── GỬI BÌNH LUẬN THỰC TẾ (HIỂN THỊ TÊN THẬT & AVATAR THẬT TỪ TÀI KHOẢN GMAIL) ──
  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    const newCommentItem: CommentItem = {
      id: `comm-${Date.now()}`,
      user: activeUser.isLoggedIn ? `${activeUser.name} (Bạn)` : 'Bạn (Người xem)',
      email: activeUser.email,
      avatar: activeUser.picture,
      text: commentInput.trim(),
      time: 'Vừa xong',
      likes: 1,
      isSelf: true
    };

    const nextList = [newCommentItem, ...currentVideoComments];
    setCurrentVideoComments(nextList);
    setCommentInput('');

    try {
      localStorage.setItem(`weather_app_comments_${currentShort.id}`, JSON.stringify(nextList));
    } catch {}

    setShowToast('💬 Bình luận của bạn đã được đăng thành công!');
    setTimeout(() => setShowToast(null), 2200);
  };

  const handleLikeComment = (commentId: string) => {
    setCurrentVideoComments(prev => 
      prev.map(c => {
        if (c.id === commentId) {
          const nextLiked = !c.isLiked;
          return {
            ...c,
            likes: nextLiked ? c.likes + 1 : c.likes - 1,
            isLiked: nextLiked
          };
        }
        return c;
      })
    );
  };

  if (!isOpen) return null;

  return (
    <div 
      ref={modalContainerRef}
      data-testid="video-shorts-modal"
      tabIndex={-1}
      className="fixed inset-0 z-[200] bg-black flex items-center justify-center overflow-hidden animate-fadeIn select-none w-screen h-[100dvh] max-w-full max-h-full"
      style={{ width: '100vw', height: '100vh' }}
      onWheel={handleWheel}
    >
      {/* ── Ambient Backdrop Glow ── */}
      <div 
        className="absolute inset-0 bg-cover bg-center filter blur-3xl opacity-20 scale-125 pointer-events-none transition-all duration-700 hidden sm:block"
        style={{ backgroundImage: `url(${currentShort.thumbnail})` }}
      />

      {/* ── Floating PC Keyboard & Mouse Guide ── */}
      <div className={`hidden 2xl:flex flex-col gap-2 absolute left-6 bottom-20 z-30 transition-opacity duration-300 ${
        isControlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}>
        <div className="p-3.5 rounded-2xl bg-black/75 border border-white/15 backdrop-blur-md text-[11px] text-neutral-300 flex flex-col gap-1 max-w-[210px] shadow-2xl">
          <p className="font-extrabold text-white flex items-center gap-1.5 pb-1 border-b border-white/10">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            Điều khiển phím tắt TV:
          </p>
          <p>🖱️ Lăn chuột / ↑↓ : Đổi clip</p>
          <p>R : 16:9 Toàn cảnh / 9:16 Dọc</p>
          <p>L / P : Danh sách phát</p>
          <p>C : Kênh truyền hình EPG</p>
          <p>M : Bật/Tắt âm thanh</p>
          <p>F : Toàn màn hình</p>
          <p>Esc : Đóng video</p>
        </div>
      </div>

      {/* ── Khung Video Chính (Tách biệt hoàn toàn trải nghiệm Mobile vs Tablet vs PC) ── */}
      <div 
        className={`relative bg-black overflow-hidden flex flex-col justify-between shrink-0 transition-all duration-300 ${
          isLandscape || isFullscreen
            ? 'w-full h-full max-w-full max-h-[100dvh] rounded-none border-none shadow-none'
            : 'w-full h-[100dvh] max-w-full max-h-[100dvh] rounded-none border-none sm:w-[390px] md:w-[420px] sm:h-[92vh] sm:max-h-[820px] sm:aspect-[9/16] sm:rounded-3xl sm:border sm:border-white/20 sm:shadow-[0_0_80px_rgba(0,0,0,0.95)]'
        }`}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
      >
        {/* ── TRÌNH PHÁT YOUTUBE / VIDEO VỚI HIỆU ỨNG CUỘN TRƯỢT DỌC REEL ── */}
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
                key={currentShort.youtubeId}
                src={`https://www.youtube.com/embed/${currentShort.youtubeId}?autoplay=1&mute=${isMuted ? 1 : 0}&controls=0&playsinline=1&rel=0&modestbranding=1&enablejsapi=1&cc_load_policy=0&iv_load_policy=3&fs=0&disablekb=1&hl=vi&origin=${encodeURIComponent(window.location.origin)}`}
                referrerPolicy="strict-origin-when-cross-origin"
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
                    // Tự động mở tiếng theo đúng yêu cầu
                    if (!isMuted) {
                      ifr?.contentWindow?.postMessage(
                        JSON.stringify({ event: 'command', func: 'unMute' }),
                        '*'
                      );
                      ifr?.contentWindow?.postMessage(
                        JSON.stringify({ event: 'command', func: 'setVolume', args: [100] }),
                        '*'
                      );
                    }
                    suppressAdsAndCaptions(ifr?.contentWindow);
                    setTimeout(() => suppressAdsAndCaptions(ifr?.contentWindow), 400);
                    setTimeout(() => suppressAdsAndCaptions(ifr?.contentWindow), 1200);
                  } catch {}
                }}
              />
            </div>
          ) : (
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

        {/* ── LỚP BẮT TƯƠNG TÁC (CHỐNG CHUYỂN HƯỚNG RA YOUTUBE) ── */}
        <div 
          className="absolute inset-0 z-10 cursor-pointer"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onWheel={handleWheel}
          onClick={handleOverlayClick}
        />

        {/* ── OVERLAY LỖI VIDEO KHÔNG KHẢ DỤNG (GRACEFUL ERROR HANDLING) ── */}
        {videoErrorState && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md animate-fadeIn pointer-events-none">
            {currentShort.thumbnail && (
              <div
                className="absolute inset-0 bg-cover bg-center opacity-10 scale-110 blur-xl"
                style={{ backgroundImage: `url(${currentShort.thumbnail})` }}
              />
            )}
            <div className="relative flex flex-col items-center gap-4 px-8 text-center">
              <div className="w-12 h-12 rounded-full border-4 border-white/20 border-t-red-500 animate-spin" />
              <p className="text-white font-bold text-sm drop-shadow">Video không khả dụng</p>
              <p className="text-neutral-400 text-xs leading-relaxed">
                Đang chuyển sang clip tiếp theo...
              </p>
            </div>
          </div>
        )}

        {/* Double Tap Flying Heart */}
        {showHeartPop && (
          <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none animate-ping">
            <svg className="w-24 h-24 text-red-500 fill-current drop-shadow-2xl" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </div>
        )}

        {/* ── TOP HEADER OVERLAY (TỐI ƯU HÓA HOÀN TOÀN: MOBILE GỌN GÀNG, TABLET/PC ĐẦY ĐỦ) ── */}
        <div className={`absolute top-0 inset-x-0 z-30 pt-2.5 sm:pt-3 px-2.5 sm:px-5 pb-8 bg-gradient-to-b from-black/95 via-black/55 to-transparent flex flex-col gap-2 pointer-events-none transition-opacity duration-300 ${
          isControlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}>
          {/* Row 1: Logo, Channel Badge & Context Controls */}
          <div className="flex items-center justify-between w-full gap-2">
            {/* Logo & Channel EPG Badge bên trái */}
            <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto select-none min-w-0">
              <span className="text-white font-black text-[14px] sm:text-[17px] tracking-tight drop-shadow-md leading-none flex items-center gap-1 shrink-0">
                <span className="text-[#ff315f]">Anx.</span>
                <span>TV</span>
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shrink-0 hidden sm:inline-block"></span>

              {/* Nút Chọn Kênh TV EPG (Tối ưu độ rộng trên mobile để không tràn hàng) */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowChannelMenu(true);
                  resetInactivityTimer();
                }}
                className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded-full bg-black/60 hover:bg-black/85 active:scale-95 border border-white/20 backdrop-blur-md text-white transition-all shadow-md group cursor-pointer shrink-0 max-w-[110px] xs:max-w-[130px] sm:max-w-[180px]"
                title="Mở menu chọn kênh truyền hình (TV EPG) [C]"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping shrink-0"></span>
                <span className="text-[10px] sm:text-[11px] font-bold text-white flex items-center gap-1 min-w-0">
                  <span className="text-[#ff315f] font-mono text-[9.5px] sm:text-[10px] shrink-0">{currentChannelInfo.number}</span>
                  <span className="truncate">{currentChannelInfo.name}</span>
                </span>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-white/70 group-hover:translate-y-0.5 transition-transform shrink-0">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>
            </div>

            {/* Quick Format Filter Tabs: CHỈ HIỂN THỊ KHI Ở TABLET / PC Ở CHẾ ĐỘ 16:9 RỘNG RÃI */}
            {isLandscape && (
              <div className="hidden md:flex items-center gap-1 pointer-events-auto bg-black/60 backdrop-blur-md px-2 py-1 rounded-full border border-white/15 shadow-md">
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
                  📺 Tất cả ({channelStatsMap[selectedChannelId]?.total || allAvailableVideos.length})
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
                  🎬 Video trên kênh
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
                  ⚡ Shorts ngắn
                </button>
              </div>
            )}

            {/* Controls: Trên khung dọc (Shorts) tinh gọn tối đa; trên khung ngang (16:9) hiển thị đầy đủ */}
            <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto shrink-0">
              {/* Nút Quay Toàn Màn Hình 16:9 / 9:16 (HIỂN THỊ TRÊN MỌI THIẾT BỊ KỂ CẢ MOBILE) */}
              <button
                data-testid="toggle-orientation-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleOrientation();
                  resetInactivityTimer();
                }}
                style={{ width: '32px', height: '32px', minWidth: '32px', minHeight: '32px', maxWidth: '32px', maxHeight: '32px', borderRadius: '50%', aspectRatio: '1 / 1', padding: 0 }}
                className={`w-8 h-8 aspect-square rounded-full flex items-center justify-center shrink-0 backdrop-blur-md border cursor-pointer active:scale-90 transition-all shadow-md ${
                  isLandscape
                    ? 'bg-[#ff315f] hover:bg-[#ff1a4d] text-white border-[#ff315f] shadow-[0_0_12px_rgba(255,49,95,0.4)]'
                    : 'bg-black/60 hover:bg-black/85 text-white border-white/20'
                }`}
                title={isLandscape ? 'Chuyển về Dọc Shorts (9:16) [R]' : 'Quay Toàn Màn Hình Ngang (16:9) [R]'}
              >
                {isLandscape ? (
                  <span className="text-[13px] leading-none select-none">📱</span>
                ) : (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="block m-auto">
                    <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
                  </svg>
                )}
              </button>

              {/* Danh sách phát trên Header: CHỈ HIỂN THỊ KHI Ở CHẾ ĐỘ TOÀN CẢNH 16:9 RỘNG RÃI
                  (Khi ở chế độ Dọc Shorts, ở cột tương tác bên phải ĐÃ CÓ nút 'List' chuyên dụng, không hiển thị trên Header để tránh đè nút Kênh) */}
              {isLandscape && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowPlaylistDrawer(!showPlaylistDrawer);
                    resetInactivityTimer();
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full backdrop-blur-md border cursor-pointer active:scale-95 transition-all text-[11px] font-bold shadow-md shrink-0 ${
                    showPlaylistDrawer
                      ? 'bg-red-600 text-white border-red-400 shadow-[0_0_12px_rgba(239,68,68,0.5)]'
                      : 'bg-black/60 hover:bg-black/80 text-white border-white/20'
                  }`}
                  title="Mở Danh Sách Phát trên video [L / P]"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3">
                    <line x1="8" y1="6" x2="21" y2="6"/>
                    <line x1="8" y1="12" x2="21" y2="12"/>
                    <line x1="8" y1="18" x2="21" y2="18"/>
                    <line x1="3" y1="6" x2="3.01" y2="6"/>
                    <line x1="3" y1="12" x2="3.01" y2="12"/>
                    <line x1="3" y1="18" x2="3.01" y2="18"/>
                  </svg>
                  <span>Danh sách</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[9.5px] font-mono">{playlist.length}</span>
                </button>
              )}

              {/* Nút xem Kênh YouTube liên kết */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowChannelMenu(true);
                  handleSelectMediaTab('subscribed');
                  resetInactivityTimer();
                }}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full backdrop-blur-md border cursor-pointer active:scale-95 transition-all text-[11px] font-bold shadow-md shrink-0 bg-red-600/90 hover:bg-red-600 text-white border-red-400"
                title={activeUser.isLoggedIn ? `Kênh YouTube: ${syncedYtChannel?.snippet?.title || activeUser.name}` : 'Kênh YouTube'}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                <span className="max-w-[100px] truncate">
                  {activeUser.isLoggedIn ? (syncedYtChannel?.snippet?.customUrl || syncedYtChannel?.snippet?.title || activeUser.name) : 'YouTube'}
                </span>
                <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[9.5px] font-mono">{displayUserChannels.length}</span>
              </button>

              {/* Nút bật Smart TV Guide (chỉ hiện trên màn hình ngang desktop) */}
              {isLandscape && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowChannelMenu(true);
                    resetInactivityTimer();
                  }}
                  style={{ width: '32px', height: '32px', minWidth: '32px', minHeight: '32px', maxWidth: '32px', maxHeight: '32px', borderRadius: '50%', aspectRatio: '1 / 1', padding: 0 }}
                  className={`w-8 h-8 aspect-square rounded-full items-center justify-center shrink-0 backdrop-blur-md border cursor-pointer active:scale-90 transition-all hidden md:flex ${
                    showChannelMenu 
                      ? 'bg-red-600 text-white border-red-400 shadow-md' 
                      : 'bg-black/60 hover:bg-black/80 text-white border-white/20'
                  }`}
                  title="Danh sách kênh truyền hình TV Guide [C]"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="block m-auto">
                    <rect x="2" y="7" width="20" height="15" rx="2" ry="2"/>
                    <polyline points="17 2 12 7 7 2"/>
                  </svg>
                </button>
              )}

              {/* Bật/Tắt âm thanh (Hiện trên MỌI thiết bị - Mobile, Tablet, PC) */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleMute();
                  resetInactivityTimer();
                }}
                style={{ width: '32px', height: '32px', minWidth: '32px', minHeight: '32px', maxWidth: '32px', maxHeight: '32px', borderRadius: '50%', aspectRatio: '1 / 1', padding: 0 }}
                className={`w-8 h-8 aspect-square rounded-full flex items-center justify-center shrink-0 backdrop-blur-md border cursor-pointer active:scale-90 transition-all ${
                  isMuted 
                    ? 'bg-red-600/80 hover:bg-red-600 text-white border-red-400 shadow-md' 
                    : 'bg-black/60 hover:bg-black/80 text-white border-white/20'
                }`}
                title={isMuted ? 'Đang tắt tiếng - Nhấn để Bật âm thanh (M)' : 'Đang bật âm thanh - Nhấn để Tắt tiếng (M)'}
              >
                {isMuted ? (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="block m-auto"><line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/></svg>
                ) : (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="block m-auto"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
                )}
              </button>

              {/* Fullscreen trình duyệt (Hiện trên Desktop & Tablet, ẩn trên Mobile) */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleBrowserFullscreen();
                  resetInactivityTimer();
                }}
                style={{ width: '32px', height: '32px', minWidth: '32px', minHeight: '32px', maxWidth: '32px', maxHeight: '32px', borderRadius: '50%', aspectRatio: '1 / 1', padding: 0 }}
                className="w-8 h-8 aspect-square rounded-full items-center justify-center shrink-0 bg-black/60 hover:bg-black/80 text-white backdrop-blur-md border border-white/20 cursor-pointer active:scale-90 transition-all hidden sm:flex"
                title={isFullscreen ? 'Thoát toàn màn hình (F)' : 'Toàn màn hình trình duyệt (F)'}
              >
                {isFullscreen ? (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="block m-auto"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/></svg>
                ) : (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="block m-auto"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
                )}
              </button>

              {/* Đóng Modal (Hiện trên MỌI thiết bị) */}
              <button
                data-testid="close-shorts-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                style={{ width: '32px', height: '32px', minWidth: '32px', minHeight: '32px', maxWidth: '32px', maxHeight: '32px', borderRadius: '50%', aspectRatio: '1 / 1', padding: 0 }}
                className="w-8 h-8 aspect-square rounded-full flex items-center justify-center shrink-0 bg-black/60 hover:bg-red-600 text-white backdrop-blur-md border border-white/20 cursor-pointer active:scale-90 transition-all"
                title="Đóng (Esc)"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="block m-auto"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
          </div>

          {/* Row 2: Quick TV Channel Pills - CHỈ HIỂN THỊ KHI Ở CHẾ ĐỘ 16:9 TOÀN CẢNH (RỘNG RÃI, THẲNG HÀNG TRONG FLOW) */}
          {isLandscape && (
            <div className="hidden lg:flex items-center gap-1.5 overflow-x-auto py-0.5 scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden pointer-events-auto">
              {TV_CHANNELS.map(ch => {
                const isActive = selectedChannelId === ch.id;
                return (
                  <button
                    key={ch.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectChannel(ch.id);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap backdrop-blur-md transition-all border cursor-pointer active:scale-95 shadow-md shrink-0 ${
                      isActive 
                        ? 'bg-red-600 text-white border-red-400 shadow-[0_0_12px_rgba(239,68,68,0.5)]' 
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
          )}

        </div>

        {/* ── CỘT TƯƠNG TÁC: THÍCH, BÌNH LUẬN, CHIA SẺ, PLAYLIST ── */}
        <div className={`absolute z-30 select-none transition-opacity duration-300 ${
          isLandscape 
            ? 'right-4 bottom-3 flex flex-row items-center gap-3' 
            : 'right-2 sm:right-3 bottom-16 sm:bottom-14 flex flex-col items-center gap-2 sm:gap-3'
        } ${isControlsVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
          
          {/* Like ❤️ Button */}
          <div className="flex flex-col items-center gap-0.5 shrink-0 select-none">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleLike();
                resetInactivityTimer();
              }}
              style={{ borderRadius: '50%', aspectRatio: '1 / 1', padding: 0 }}
              className={`w-9 h-9 sm:w-10 sm:h-10 aspect-square shrink-0 rounded-full flex items-center justify-center backdrop-blur-md transition-all shadow-lg cursor-pointer active:scale-90 border ${
                likedMap[currentShort.id]
                  ? 'bg-red-600 text-white border-red-500 shadow-red-500/50'
                  : 'bg-black/50 text-white hover:bg-black/70 border-white/20'
              }`}
              title="Thích video"
            >
              <svg className={`w-4.5 h-4.5 sm:w-5 sm:h-5 shrink-0 block m-auto ${likedMap[currentShort.id] ? 'fill-current' : 'fill-none'}`} viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
            <span className="text-[9px] sm:text-[10px] font-bold text-white drop-shadow">
              {(likesMap[currentShort.id] ?? currentShort.likes).toLocaleString('vi-VN')}
            </span>
          </div>

          {/* Comments 💬 Button */}
          <div className="flex flex-col items-center gap-0.5 shrink-0 select-none">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowComments(!showComments);
                resetInactivityTimer();
              }}
              style={{ borderRadius: '50%', aspectRatio: '1 / 1', padding: 0 }}
              className="w-9 h-9 sm:w-10 sm:h-10 aspect-square shrink-0 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-md border border-white/20 shadow-lg cursor-pointer active:scale-90 transition-all"
              title="Bình luận thực tế"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 block m-auto sm:w-[19px] sm:h-[19px]"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            </button>
            <span className="text-[9px] sm:text-[10px] font-bold text-white drop-shadow">
              {currentVideoComments.length}
            </span>
          </div>

          {/* Share ↗️ Button */}
          <div className="flex flex-col items-center gap-0.5 shrink-0 select-none">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleShare();
                resetInactivityTimer();
              }}
              style={{ borderRadius: '50%', aspectRatio: '1 / 1', padding: 0 }}
              className="w-9 h-9 sm:w-10 sm:h-10 aspect-square shrink-0 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-md border border-white/20 shadow-lg cursor-pointer active:scale-90 transition-all"
              title="Chia sẻ video"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 block m-auto sm:w-[19px] sm:h-[19px]"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
            </button>
            <span className="text-[9px] sm:text-[10px] font-bold text-white drop-shadow">
              Chia sẻ
            </span>
          </div>

          {/* Playlist 📋 Button */}
          <div className="flex flex-col items-center gap-0.5 shrink-0 select-none">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowPlaylistDrawer(!showPlaylistDrawer);
                resetInactivityTimer();
              }}
              style={{ borderRadius: '50%', aspectRatio: '1 / 1', padding: 0 }}
              className={`w-9 h-9 sm:w-10 sm:h-10 aspect-square shrink-0 rounded-full flex items-center justify-center backdrop-blur-md border shadow-lg cursor-pointer active:scale-90 transition-all ${
                showPlaylistDrawer
                  ? 'bg-red-600 text-white border-red-500 shadow-red-500/50'
                  : 'bg-black/50 hover:bg-black/70 text-white border-white/20'
              }`}
              title="Danh sách phát trên video [L / P]"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="shrink-0 block m-auto sm:w-[17px] sm:h-[17px]">
                <line x1="8" y1="6" x2="21" y2="6"/>
                <line x1="8" y1="12" x2="21" y2="12"/>
                <line x1="8" y1="18" x2="21" y2="18"/>
                <line x1="3" y1="6" x2="3.01" y2="6"/>
                <line x1="3" y1="12" x2="3.01" y2="12"/>
                <line x1="3" y1="18" x2="3.01" y2="18"/>
              </svg>
            </button>
            <span className="text-[9px] sm:text-[10px] font-bold text-white drop-shadow">
              List
            </span>
          </div>
        </div>

        {/* ── BOTTOM VIDEO OVERLAY: KÊNH, TIÊU ĐỀ, HASHTAGS & TÀI KHOẢN ── */}
        <div className={`absolute bottom-0 inset-x-0 z-20 p-2.5 sm:p-4 ${isLandscape ? 'pb-2.5 sm:pb-3 pr-14 sm:pr-24 lg:pr-[260px]' : 'pb-3 sm:pb-3.5 pr-14 sm:pr-16 pl-2.5 sm:pl-4'} bg-gradient-to-t from-black via-black/85 to-transparent flex flex-col gap-1 sm:gap-1.5 transition-opacity duration-300 ${
          isControlsVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}>
          
          {/* Channel Info & Nút Theo Dõi */}
          <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto max-w-full overflow-hidden">
            <div 
              style={{ borderRadius: '50%', aspectRatio: '1 / 1', padding: 0 }}
              className="w-6.5 h-6.5 sm:w-8 sm:h-8 rounded-full overflow-hidden border border-white/25 shadow-md shrink-0 bg-[#ff315f] flex items-center justify-center font-black text-white text-[10.5px] sm:text-[12px] select-none"
            >
              <span className="font-bold text-white">{currentShort.channel.charAt(0).toUpperCase()}</span>
            </div>
            
            <div className="flex items-center gap-1 min-w-0 shrink">
              <span className="font-extrabold text-[11.5px] sm:text-[13px] text-white truncate drop-shadow">
                @{currentShort.channel}
              </span>
              <span 
                style={{ borderRadius: '50%', aspectRatio: '1 / 1' }}
                className="w-3.5 h-3.5 rounded-full bg-blue-500 text-white flex items-center justify-center text-[8px] sm:text-[9px] shrink-0 font-bold"
              >
                ✓
              </span>
            </div>

            {/* Nhãn định dạng & badge */}
            <span className={`px-1.5 sm:px-2 py-0.2 sm:py-0.5 rounded-full text-[8px] sm:text-[9.5px] font-black uppercase tracking-wider shrink-0 ${
              currentShort.mediaType === 'short'
                ? 'bg-pink-600/80 text-white border border-pink-400/40'
                : 'bg-blue-600/80 text-white border border-blue-400/40'
            }`}>
              {currentShort.mediaType === 'short' ? '⚡ Shorts' : '🎬 Video'}
            </span>

            {/* Nút Chuông Theo Dõi Kênh */}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                toggleFollowChannel();
                resetInactivityTimer();
              }}
              className={`flex items-center gap-1 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-[10.5px] font-bold border backdrop-blur-md cursor-pointer transition-all active:scale-95 shrink-0 ${
                isFollowingChannel
                  ? 'bg-[#ff315f] border-[#ff315f] text-white shadow-[0_0_10px_rgba(255,49,95,0.4)]'
                  : 'bg-white/10 hover:bg-white/20 border-white/25 text-neutral-200 hover:text-white'
              }`}
              title={isFollowingChannel ? "Đang theo dõi kênh này" : "Nhấn để theo dõi kênh"}
            >
              {isFollowingChannel ? (
                <>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                  <span className="hidden xs:inline">Đã theo dõi</span>
                  <span className="xs:hidden">✓</span>
                </>
              ) : (
                <>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/><line x1="12" y1="2" x2="12" y2="4"/></svg>
                  <span>Theo dõi</span>
                </>
              )}
            </button>
          </div>

          {/* Title */}
          <p 
            className={`text-[11px] sm:text-[13px] font-medium text-white ${isLandscape ? 'line-clamp-1 max-w-[92%]' : 'line-clamp-2 max-w-[94%]'} drop-shadow leading-tight sm:leading-snug notranslate`}
            translate="no"
          >
            {cleanVideoTitle(currentShort.title)}
          </p>

          {/* Hashtags & Trạng thái */}
          <div className="flex items-center gap-1.5 text-[9px] sm:text-[10.5px] font-medium flex-wrap">
            <span 
              className="px-1.5 sm:px-2 py-0.2 sm:py-0.5 rounded-full bg-white/15 text-white/90 border border-white/10 backdrop-blur-xs text-[8.5px] sm:text-[9.5px] font-semibold tracking-tight shadow-xs"
            >
              #{currentShort.mediaType === 'short' ? 'shorts' : 'video'}
            </span>
            <span 
              className="px-1.5 sm:px-2 py-0.2 sm:py-0.5 rounded-full bg-white/15 text-white/90 border border-white/10 backdrop-blur-xs text-[8.5px] sm:text-[9.5px] font-semibold tracking-tight shadow-xs"
            >
              #tintuc24h
            </span>
            
            {activeUser.isLoggedIn && (
              <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] sm:text-[9.5px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>{activeUser.name}</span>
              </span>
            )}

            <span className="ml-auto text-[9px] sm:text-[10px] text-white/70 font-semibold drop-shadow font-mono">
              {currentIndex + 1} / {playlist.length}
            </span>
          </div>
        </div>
      </div>

      {/* ── ON-VIDEO PLAYLIST DRAWER (DANH SÁCH PHÁT NỔI: BOTTOM SHEET TRÊN MOBILE, SIDE PANEL TRÊN DESKTOP) ── */}
      {showPlaylistDrawer && (
        <div 
          className="fixed inset-0 z-40 flex items-end sm:items-stretch sm:justify-end animate-fadeIn select-none"
          onClick={() => setShowPlaylistDrawer(false)}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs cursor-pointer" />

          <div 
            className="relative w-full sm:w-[420px] md:w-[460px] h-[80vh] sm:h-full bg-[#0d0d10]/98 backdrop-blur-2xl rounded-t-3xl sm:rounded-none border-t sm:border-t-0 sm:border-l border-white/15 p-3.5 sm:p-5 flex flex-col shadow-[-20px_0_60px_rgba(0,0,0,0.85)] z-50 animate-slideUp sm:animate-slideLeft text-white"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile swipe grab bar */}
            <div className="w-10 h-1 rounded-full bg-white/25 mx-auto mb-2 shrink-0 sm:hidden" />
            {/* Header Drawer */}
            <div className="flex items-center justify-between pb-3.5 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div 
                  style={{ width: '36px', height: '36px', minWidth: '36px', minHeight: '36px', maxWidth: '36px', maxHeight: '36px', borderRadius: '50%', aspectRatio: '1 / 1', padding: 0 }}
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
                    {currentChannelInfo.id === 'all' ? 'Toàn bộ dòng chảy thời sự' : `${currentChannelInfo.number} • ${currentChannelInfo.name}`} ({playlist.length} clip)
                  </span>
                </div>
              </div>

              <button
                onClick={() => setShowPlaylistDrawer(false)}
                style={{ width: '32px', height: '32px', minWidth: '32px', minHeight: '32px', maxWidth: '32px', maxHeight: '32px', borderRadius: '50%', aspectRatio: '1 / 1', padding: 0 }}
                className="w-8 h-8 aspect-square rounded-full flex items-center justify-center shrink-0 bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white border border-white/15 cursor-pointer active:scale-90 transition-all"
                title="Đóng (Esc)"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            {/* Phân Tab Định Dạng: Tất cả | Video Kênh | Shorts */}
            <div className="flex items-center gap-1.5 py-2.5 border-b border-white/10 shrink-0 overflow-x-auto scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              <button
                onClick={() => handleSelectMediaTab('all')}
                className={`px-3 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-all shrink-0 active:scale-95 ${
                  mediaTab === 'all'
                    ? 'bg-red-600 text-white shadow-md border border-red-400'
                    : 'bg-white/5 hover:bg-white/10 text-neutral-300 border border-white/10'
                }`}
              >
                📺 Tất cả ({channelStatsMap[selectedChannelId]?.total || allAvailableVideos.length})
              </button>
              <button
                onClick={() => handleSelectMediaTab('video')}
                className={`px-3 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-all shrink-0 active:scale-95 ${
                  mediaTab === 'video'
                    ? 'bg-red-600 text-white shadow-md border border-red-400'
                    : 'bg-white/5 hover:bg-white/10 text-neutral-300 border border-white/10'
                }`}
              >
                🎬 Video kênh ({channelStatsMap[selectedChannelId]?.videos || 0})
              </button>
              <button
                onClick={() => handleSelectMediaTab('short')}
                className={`px-3 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-all shrink-0 active:scale-95 ${
                  mediaTab === 'short'
                    ? 'bg-red-600 text-white shadow-md border border-red-400'
                    : 'bg-white/5 hover:bg-white/10 text-neutral-300 border border-white/10'
                }`}
              >
                ⚡ Shorts ({channelStatsMap[selectedChannelId]?.shorts || 0})
              </button>
            </div>

            {/* Dải chọn nhanh kênh TV trong Drawer */}
            <div className="flex items-center gap-1.5 py-2 border-b border-white/10 shrink-0 overflow-x-auto scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {TV_CHANNELS.map(ch => {
                const isActive = selectedChannelId === ch.id;
                return (
                  <button
                    key={ch.id}
                    onClick={() => handleSelectChannel(ch.id)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10.5px] font-bold whitespace-nowrap cursor-pointer transition-all active:scale-95 border shrink-0 ${
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

            {/* Dải chọn chuyên mục bản tin phân loại (Tin nóng 10 phút, Tổng hợp tin tức...) */}
            {availableSubCategories.length > 0 && (
              <div className="flex items-center gap-1.5 py-2 border-b border-white/10 shrink-0 overflow-x-auto scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                <button
                  onClick={() => handleSelectSubCategory('all')}
                  className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap cursor-pointer transition-all active:scale-95 border shrink-0 ${
                    selectedSubCategory === 'all'
                      ? 'bg-amber-500 text-black border-amber-400 font-extrabold shadow-sm'
                      : 'bg-white/5 hover:bg-white/10 text-neutral-300 border-white/10'
                  }`}
                >
                  📁 Tất cả chuyên mục
                </button>
                {availableSubCategories.map(subCat => {
                  const isActive = selectedSubCategory === subCat;
                  const icon = subCat.includes('Tin nóng') ? '🔥' : subCat.includes('Tổng hợp') ? '📰' : subCat.includes('Thế giới') ? '🌍' : '📊';
                  return (
                    <button
                      key={subCat}
                      onClick={() => handleSelectSubCategory(subCat)}
                      className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap cursor-pointer transition-all active:scale-95 border shrink-0 ${
                        isActive
                          ? 'bg-amber-500 text-black border-amber-400 font-extrabold shadow-sm'
                          : 'bg-white/5 hover:bg-white/10 text-neutral-300 border-white/10'
                      }`}
                    >
                      <span>{icon}</span>
                      <span>{subCat}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Cuộn danh sách video clip */}
            <div className="flex-1 overflow-y-auto py-3 flex flex-col gap-2.5 pr-1 scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
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
                      <div className="absolute bottom-1 right-1 px-1.5 py-0.2 rounded bg-black/85 text-[8.5px] font-bold text-white">
                        {item.mediaType === 'short' ? '⚡ Shorts' : item.duration || 'Video'}
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
                      <div className="flex items-center justify-between text-[10px] text-neutral-400 mt-0.5">
                        <span className="truncate">{item.channel}</span>
                        {item.publishedAt && (
                          <span className="text-[9.5px] text-neutral-500 shrink-0 ml-1">
                            {new Date(item.publishedAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Điều hướng Trước / Sau dưới đáy Drawer */}
            <div className="flex items-center gap-2 pt-3 border-t border-white/10 shrink-0">
              <button
                onClick={handlePrevShort}
                className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-[12px] flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-95"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="18 15 12 9 6 15"/></svg>
                <span>Clip Trước</span>
              </button>
              <button
                onClick={handleNextShort}
                className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-[12px] flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-95 shadow-md shadow-red-600/40"
              >
                <span>Clip Sau</span>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SMART TV EPG GUIDE (DANH SÁCH KÊNH TRUYỀN HÌNH - FIX TRIỆT ĐỂ LỆCH LAYOUT ẢNH 1) ── */}
      {showChannelMenu && (
        <div 
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-3 sm:p-6 animate-fadeIn"
          onClick={() => setShowChannelMenu(false)}
        >
          <div 
            className="w-full max-w-4xl max-h-[92vh] bg-neutral-950/95 border border-white/20 rounded-3xl shadow-[0_0_80px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden text-white animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header TV Guide */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/10 bg-gradient-to-r from-red-950/40 via-neutral-900/60 to-neutral-900/40">
              <div className="flex items-center gap-3 min-w-0">
                <div 
                  style={{ width: '42px', height: '42px', minWidth: '42px', minHeight: '42px', maxWidth: '42px', maxHeight: '42px', borderRadius: '50%', aspectRatio: '1 / 1', padding: 0 }}
                  className="w-10 h-10 aspect-square rounded-full bg-gradient-to-tr from-red-600 to-pink-500 flex items-center justify-center text-white shadow-lg shrink-0 border border-white/20"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="block m-auto">
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
                style={{ width: '36px', height: '36px', minWidth: '36px', minHeight: '36px', maxWidth: '36px', maxHeight: '36px', borderRadius: '50%', aspectRatio: '1 / 1', padding: 0 }}
                className="w-9 h-9 aspect-square rounded-full flex items-center justify-center shrink-0 bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white border border-white/15 cursor-pointer active:scale-90 transition-all ml-2"
                title="Đóng (Esc)"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="block m-auto"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            {/* Thẻ Tài khoản YouTube liên kết */}
            <div className="mx-3 sm:mx-5 mt-3 p-3 rounded-2xl bg-gradient-to-r from-red-950/60 via-neutral-900/80 to-neutral-900/60 border border-red-500/30 flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-red-600/30 border border-red-400/40 shrink-0 flex items-center justify-center text-white">
                  {syncedYtChannel?.snippet?.thumbnails?.default?.url || activeUser.picture ? (
                    <img 
                      src={syncedYtChannel?.snippet?.thumbnails?.default?.url || activeUser.picture} 
                      alt="YouTube Channel" 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  )}
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-[13px] sm:text-[14px] text-white truncate">
                      {activeUser.isLoggedIn 
                        ? (syncedYtChannel?.snippet?.title || activeUser.name) 
                        : 'Chưa kết nối tài khoản YouTube'}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[9.5px] font-bold bg-red-600/40 text-red-300 border border-red-500/30">
                      {activeUser.isLoggedIn ? 'TÀI KHOẢN CỦA BẠN' : 'KHÁCH'}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-400 truncate">
                    {activeUser.isLoggedIn ? (
                      <>
                        <span>{syncedYtChannel?.snippet?.customUrl || `@${activeUser.email.split('@')[0]}`}</span>
                        <span> • <strong>{displayUserChannels.length}</strong> kênh đã tự động kết nối</span>
                      </>
                    ) : (
                      'Đăng nhập Gmail để xem kênh của bạn & các kênh đăng ký'
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {activeUser.isLoggedIn ? (
                  <>
                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span>Đã tự động đồng bộ tài khoản</span>
                    </span>
                    <button
                      onClick={() => handleSelectMediaTab('subscribed')}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-bold cursor-pointer transition-all border ${
                        mediaTab === 'subscribed'
                          ? 'bg-red-600 text-white border-red-400 shadow-md shadow-red-600/30'
                          : 'bg-white/10 hover:bg-white/15 text-neutral-200 border-white/20'
                      }`}
                    >
                      Kênh Của Bạn ({displayUserChannels.length})
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      if (onLogin) onLogin();
                    }}
                    className="px-3.5 py-1.5 rounded-xl text-[11px] font-bold bg-red-600 hover:bg-red-500 text-white shadow-md border border-red-400 cursor-pointer active:scale-95 transition-all flex items-center gap-1.5"
                  >
                    <span>▶ Đăng nhập Google</span>
                  </button>
                )}
              </div>
            </div>

            {/* Phân Tab Định Dạng: Tất cả | Video Kênh | Shorts */}
            <div className="flex items-center gap-2 p-3 sm:px-5 bg-white/[0.02] border-b border-white/10 overflow-x-auto scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 shrink-0 mr-1 flex items-center gap-1">
                <span>Phân loại:</span>
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
                  ({channelStatsMap[selectedChannelId]?.total || allAvailableVideos.length})
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
                <span>🎬 Video trên kênh (16:9)</span>
                <span className="text-[10px] opacity-80 font-mono">
                  ({channelStatsMap[selectedChannelId]?.videos || 0})
                </span>
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
                <span className="text-[10px] opacity-80 font-mono">
                  ({channelStatsMap[selectedChannelId]?.shorts || 0})
                </span>
              </button>

              <button
                onClick={() => handleSelectMediaTab('subscribed')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-bold cursor-pointer transition-all shrink-0 active:scale-95 ${
                  mediaTab === 'subscribed'
                    ? 'bg-red-600 text-white shadow-md shadow-red-600/40 border border-red-400'
                    : 'bg-white/5 hover:bg-white/10 text-neutral-300 border border-white/10'
                }`}
              >
                <span>🔴 Kênh Của Bạn</span>
                <span className="text-[10px] opacity-80 font-mono">
                  ({displayUserChannels.length})
                </span>
              </button>
            </div>

            {/* VÙNG NỘI DUNG: NẾU CHỌN TAB KÊNH CỦA BẠN THÌ HIỆN DANH SÁCH KÊNH ĐÃ TỰ ĐỘNG ĐỒNG BỘ */}
            {mediaTab === 'subscribed' ? (
              <div className="flex-1 overflow-y-auto p-3 sm:p-5 max-h-[58vh] scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                {activeUser.isLoggedIn ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {displayUserChannels.map((sub: any, sIdx: number) => {
                      const snippet = sub.snippet || {};
                      const thumb = snippet.thumbnails?.medium?.url || snippet.thumbnails?.default?.url || '';
                      const title = snippet.title || 'Kênh YouTube';
                      const handle = snippet.customUrl || '';
                      const subCount = snippet.subscribersText || '';
                      const desc = snippet.description || 'Kênh đã đăng ký trên tài khoản YouTube của bạn';
                      const verified = snippet.verified !== false && snippet.verified !== undefined ? snippet.verified : false;
                      const channelId = snippet.resourceId?.channelId || '';
                      const channelUrl = handle
                        ? `https://www.youtube.com/${handle.startsWith('@') ? handle : '@' + handle}`
                        : (channelId ? `https://www.youtube.com/channel/${channelId}` : '#');

                      const matchedTvChannel = TV_CHANNELS.find(
                        c => (channelId && (c.id === channelId || c.youtubeHandle === channelId)) ||
                             c.name.toLowerCase() === title.toLowerCase() ||
                             title.toLowerCase().includes(c.name.toLowerCase())
                      );

                      return (
                        <div
                          key={sub.id || sIdx}
                          onClick={() => {
                            if (matchedTvChannel) {
                              handleSelectChannel(matchedTvChannel.id);
                              setShowChannelMenu(false);
                            } else {
                              window.open(channelUrl, '_blank');
                            }
                          }}
                          className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-red-500/50 transition-all group cursor-pointer relative"
                        >
                          {/* Avatar kênh */}
                          <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full overflow-hidden bg-neutral-900 shrink-0 border-2 border-white/15 group-hover:border-red-500/50 shadow-md">
                            {thumb ? (
                              <img 
                                src={thumb} 
                                alt={title} 
                                className="w-full h-full object-cover" 
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                              />
                            ) : null}
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-red-600 to-rose-500 font-bold text-white text-lg">
                              {title[0]?.toUpperCase() || 'Y'}
                            </div>
                          </div>

                          {/* Thông tin kênh */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h4 className="font-bold text-[13.5px] sm:text-[14px] text-white group-hover:text-red-400 transition-colors truncate">
                                {title}
                              </h4>
                              {verified && (
                                <span className="w-3.5 h-3.5 rounded-full bg-white/20 flex items-center justify-center text-white text-[9px] font-bold" title="Kênh đã xác minh">
                                  ✓
                                </span>
                              )}
                              {matchedTvChannel && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-red-600/30 text-red-300 border border-red-500/30 shrink-0">
                                  Phát ngay
                                </span>
                              )}
                            </div>

                            {/* Handle & Số người đăng ký */}
                            <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 font-medium mt-0.5 truncate">
                              {handle && <span className="text-neutral-300 font-mono">{handle}</span>}
                              {subCount && (
                                <>
                                  <span>•</span>
                                  <span className="text-neutral-400">{subCount}</span>
                                </>
                              )}
                            </div>

                            {/* Mô tả kênh */}
                            <p className="text-[11px] text-neutral-400 line-clamp-2 mt-1 leading-relaxed">
                              {desc}
                            </p>

                            {/* Nút hành động */}
                            <div className="flex items-center gap-2.5 mt-2">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/10 text-neutral-300">
                                <span>Đã đăng ký</span>
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                  <polyline points="20 6 9 17 4 12"/>
                                </svg>
                              </span>
                              <a
                                href={channelUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center gap-1 text-[11px] text-red-400 hover:text-red-300 font-medium transition-colors"
                              >
                                <span>Xem trên YouTube</span>
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                                  <polyline points="15 3 21 3 21 9"/>
                                  <line x1="10" y1="14" x2="21" y2="3"/>
                                </svg>
                              </a>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 px-4 flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-3xl mb-3">
                      📺
                    </div>
                    <h4 className="font-bold text-lg text-white mb-1">
                      Chưa kết nối tài khoản Google
                    </h4>
                    <p className="text-sm text-neutral-400 max-w-md mb-4">
                      Vui lòng đăng nhập bằng Gmail ở bên ngoài để hệ thống tự động đồng bộ kênh và nội dung yêu thích của bạn.
                    </p>
                    <button
                      onClick={() => {
                        if (onLogin) onLogin();
                      }}
                      className="px-5 py-2.5 rounded-full bg-red-600 hover:bg-red-500 text-white font-bold text-sm flex items-center gap-2 cursor-pointer shadow-lg shadow-red-600/30 active:scale-95 transition-all"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                      </svg>
                      <span>Đăng nhập Google</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Grid Thẻ Kênh: ĐỒNG NHẤT CHIỀU CAO MIN-HEIGHT VÀ CĂN CHỈNH THẲNG HÀNG 100% */
              <div className="flex-1 overflow-y-auto p-2.5 sm:p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3 max-h-[58vh] scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {TV_CHANNELS.map((ch) => {
                const isActive = selectedChannelId === ch.id;
                const stats = channelStatsMap[ch.id] || { total: 0, videos: 0, shorts: 0 };

                return (
                  <div
                    key={ch.id}
                    onClick={() => handleSelectChannel(ch.id)}
                    className={`group relative p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl border transition-all cursor-pointer min-h-[105px] sm:min-h-[130px] h-full flex flex-col justify-between gap-1.5 sm:gap-2.5 ${
                      isActive
                        ? 'bg-gradient-to-br from-red-600/30 via-red-950/40 to-neutral-900 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.35)] ring-1 ring-red-400/50'
                        : 'bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/25 text-neutral-300 hover:text-white'
                    }`}
                  >
                    {/* Top Row: Channel number + Badge Text + Live indicator */}
                    <div className="flex items-center justify-between gap-1.5 shrink-0">
                      <div className="flex items-center gap-1 sm:gap-1.5">
                        <span className={`px-1.5 sm:px-2 py-0.2 sm:py-0.5 rounded-md font-mono text-[9.5px] sm:text-[10.5px] font-black tracking-wider border ${
                          isActive 
                            ? 'bg-red-600 text-white border-red-400' 
                            : 'bg-black/60 text-neutral-300 border-white/15'
                        }`}>
                          {ch.number}
                        </span>

                        <span 
                          className="px-1.5 sm:px-2 py-0.2 sm:py-0.5 rounded-full text-[8.5px] sm:text-[9.5px] font-extrabold uppercase tracking-wider"
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
                        <span className="flex items-center gap-1 text-[8.5px] sm:text-[9.5px] font-black text-red-400 tracking-wider">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
                          ĐANG PHÁT
                        </span>
                      ) : (
                        <span className="text-[9.5px] sm:text-[10px] text-neutral-400 group-hover:text-neutral-200 transition-colors font-semibold">
                          {stats.total} clip
                        </span>
                      )}
                    </div>

                    {/* Middle: Channel Name & Tagline */}
                    <div className="flex-1 flex flex-col justify-start">
                      <h4 className={`text-[12.5px] sm:text-[13.5px] font-black flex items-center gap-1.5 truncate ${isActive ? 'text-white' : 'text-neutral-100 group-hover:text-white'}`}>
                        <span>{ch.name}</span>
                        {isActive && <span className="text-red-400 text-xs">★</span>}
                      </h4>
                      <p className="text-[10px] sm:text-[11px] text-neutral-400 line-clamp-1 sm:line-clamp-2 min-h-0 sm:min-h-[30px] mt-0.5 leading-tight sm:leading-snug">
                        {ch.tagline}
                      </p>
                    </div>

                    {/* Bottom Row: Thống kê định dạng & Trạng thái chọn */}
                    <div className="pt-1.5 sm:pt-2 border-t border-white/10 flex items-center justify-between text-[9.5px] sm:text-[10.5px] shrink-0 mt-auto">
                      <span className="text-neutral-400 text-[9px] sm:text-[10px] font-medium">
                        {stats.videos} video • {stats.shorts} shorts
                      </span>
                      <span className={`font-bold flex items-center gap-1 ${
                        isActive ? 'text-red-400' : 'text-neutral-400 group-hover:text-white'
                      }`}>
                        {isActive ? (
                          <span>✓ Đang chọn</span>
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
            )}

            {/* Footer EPG */}
            <div className="p-3 sm:px-5 sm:py-3.5 bg-black/60 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-[11px] text-neutral-400">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-neutral-300">💡 Phím tắt TV:</span>
                <span className="px-1.5 py-0.2 rounded bg-white/10 text-white font-mono text-[10px]">[C]</span> <span>Mở kênh</span>
                <span className="px-1.5 py-0.2 rounded bg-white/10 text-white font-mono text-[10px]">[↑↓]</span> <span>Chuyển clip</span>
                <span className="px-1.5 py-0.2 rounded bg-white/10 text-white font-mono text-[10px]">[M]</span> <span>Bật/Tắt âm</span>
                <span className="px-1.5 py-0.2 rounded bg-white/10 text-white font-mono text-[10px]">[R]</span> <span>Quay ngang 16:9</span>
              </div>
              <button
                onClick={() => setShowChannelMenu(false)}
                className="ml-auto px-3.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold text-[11px] cursor-pointer transition-all active:scale-95"
              >
                Quay lại video (Esc)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── COMMENTS DRAWER (BÌNH LUẬN THỰC TẾ & TƯƠNG TÁC TÀI KHOẢN GMAIL) ── */}
      {showComments && (
        <div className="fixed inset-x-0 bottom-0 sm:inset-y-0 sm:right-0 sm:left-auto w-full sm:w-[400px] max-h-[82vh] sm:max-h-full bg-neutral-900/98 backdrop-blur-2xl rounded-t-3xl sm:rounded-none sm:rounded-l-3xl border-t sm:border-t-0 sm:border-l border-white/15 shadow-2xl z-50 flex flex-col p-4 animate-slideUp">
          <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-white text-[15px] flex items-center gap-2">
                <span>Bình luận</span>
                <span className="text-[12px] text-neutral-400">({currentVideoComments.length})</span>
              </h4>
              {activeUser.isLoggedIn && (
                <span className="text-[10px] text-emerald-400 font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  Google: {activeUser.name}
                </span>
              )}
            </div>

            <button 
              onClick={() => setShowComments(false)}
              style={{ width: '32px', height: '32px', minWidth: '32px', minHeight: '32px', maxWidth: '32px', maxHeight: '32px', borderRadius: '50%', aspectRatio: '1 / 1', padding: 0 }}
              className="w-8 h-8 aspect-square rounded-full flex items-center justify-center shrink-0 hover:bg-white/10 text-neutral-400 hover:text-white cursor-pointer"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="block m-auto"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          {/* Danh sách bình luận */}
          <div className="flex-1 overflow-y-auto py-3 flex flex-col gap-3 min-h-[220px] scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {currentVideoComments.map((c) => (
              <div key={c.id} className="flex items-start gap-2.5 p-2 rounded-xl bg-white/[0.03] border border-white/5">
                {c.avatar ? (
                  <img src={c.avatar} alt="" className="w-7 h-7 rounded-full object-cover shrink-0 border border-white/20" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-pink-500 to-red-500 text-white font-bold text-[11px] flex items-center justify-center shrink-0">
                    {c.user.charAt(0)}
                  </div>
                )}
                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-1">
                    <span className="font-bold text-[12px] text-white truncate flex items-center gap-1">
                      <span>{c.user}</span>
                      {c.isSelf && <span className="text-[9px] px-1 rounded bg-red-600/30 text-red-400 font-bold">Bạn</span>}
                    </span>
                    <span className="text-[10px] text-neutral-400 shrink-0">{c.time}</span>
                  </div>
                  <p className="text-[12px] text-neutral-200 mt-0.5 leading-snug">{c.text}</p>
                  
                  {/* Thích bình luận */}
                  <div className="flex items-center gap-3 mt-1.5 pt-1 text-[11px] text-neutral-400">
                    <button 
                      onClick={() => handleLikeComment(c.id)}
                      className={`flex items-center gap-1 cursor-pointer transition-colors ${c.isLiked ? 'text-red-400 font-bold' : 'hover:text-white'}`}
                    >
                      <span>{c.isLiked ? '❤️' : '🤍'}</span>
                      <span>{c.likes}</span>
                    </button>
                    <span className="hover:text-white cursor-pointer">Trả lời</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Form bình luận */}
          <form onSubmit={handleAddComment} className="pt-2 border-t border-white/10 flex items-center gap-2 shrink-0">
            {activeUser.picture ? (
              <img src={activeUser.picture} alt="" className="w-7 h-7 rounded-full object-cover border border-white/20 shrink-0" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-white/15 text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                {activeUser.name.charAt(0)}
              </div>
            )}
            <input
              type="text"
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              placeholder={activeUser.isLoggedIn ? `Bình luận với tên ${activeUser.name}...` : 'Thêm bình luận...'}
              className="flex-1 px-3.5 py-2 rounded-full bg-white/10 text-white text-[12px] placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-red-500"
            />
            <button 
              type="submit"
              className="px-3.5 py-2 rounded-full bg-red-600 hover:bg-red-500 text-white text-[12px] font-bold cursor-pointer transition-all active:scale-95 shrink-0"
            >
              Gửi
            </button>
          </form>

          {!activeUser.isLoggedIn && onLogin && (
            <div className="mt-2 text-center text-[10.5px] text-neutral-400">
              <span>Đăng nhập với Google để tương tác chính thức: </span>
              <button 
                type="button" 
                onClick={onLogin} 
                className="text-red-400 font-bold hover:underline cursor-pointer"
              >
                Đăng nhập ngay
              </button>
            </div>
          )}
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


