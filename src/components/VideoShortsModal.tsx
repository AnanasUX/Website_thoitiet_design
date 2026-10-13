import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
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

// ── Danh sách các kênh tin tức chính thống ──
export const FEATURED_NEWS_CHANNELS = [
  { id: 'UCabsTV34JwALXKGMqHpvUiA', name: 'VTV24' },
  { id: 'UCIW9cGgoRuGJnky3K3tbzNg', name: 'Báo Thanh Niên' },
  { id: 'UCteGrHMrnQwx7Scx--7nyoA', name: 'Báo Tuổi Trẻ' },
  { id: 'UCFN0IoARjOAgx-OWr-JBIHg', name: 'Báo Lao Động' },
  { id: 'UC01aVq6gGvUe6F2Q6H_tPmg', name: 'Báo Tiền Phong' },
  { id: 'UCxI0jUuG4e2xP_7E4m5hXvw', name: 'VTC NOW' },
  { id: 'UCbN_rR_y_f5Qv8u7Y8h1zWw', name: 'VTV Thời Tiết' }
];

// ── Cấu trúc Kênh Truyền Hình phong cách Smart TV EPG ──
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
    id: 'site',
    name: 'Bản Tin Trang',
    tagline: 'Video bản tin nội bộ và đồ họa thời tiết trực tiếp từ website',
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

// ── CƠ SỞ DỮ LIỆU VIDEO PHONG PHÚ: PHÂN LOẠI RÕ RỆT (VIDEO KÊNH 16:9 VS SHORTS 9:16) ──
export const BACKUP_FALLBACK_SHORTS: ShortItem[] = [
  // ══════════════════ 1. VTV24 (KÊNH TRUYỀN HÌNH CHÍNH THỐNG VTV24) ══════════════════
  // ── [VIDEO NỔI BẬT ĐẦU TRANG] ──
  {
    id: 'yt-vtv24-feat-01',
    youtubeId: 'd0x854Vv78M',
    title: 'Thời sự toàn cảnh tối 10/10: Tết Nguyên đán Đinh Mùi 2027 nghỉ 7 ngày liên tục | VTV24',
    channel: 'VTV24',
    badge: 'TRỰC TIẾP',
    category: 'Thời sự 24h',
    subCategory: 'Tổng hợp tin tức hàng ngày',
    duration: '31:17',
    thumbnail: 'https://i.ytimg.com/vi/d0x854Vv78M/hqdefault.jpg',
    likes: 40200,
    commentsCount: 2150,
    sharesCount: 1680,
    mediaType: 'video',
    aspectRatio: '16:9',
    publishedAt: '2026-10-10T19:00:00.000Z'
  },

  // ── [PHÂN LOẠI 1: TIN NÓNG 10 PHÚT TRÊN VTVgo] ──
  {
    id: 'yt-vtv24-tn-01',
    youtubeId: 'mBwR5jE57gA',
    title: 'TP. Hồ Chí Minh sẵn sàng đưa 731 hài cốt liệt sĩ về an táng trang trọng | VTV24',
    channel: 'VTV24',
    badge: 'TIÊU ĐIỂM',
    category: 'Thời sự 24h',
    subCategory: 'Tin nóng 10 phút',
    duration: '10:27',
    thumbnail: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=70',
    likes: 1320,
    commentsCount: 95,
    sharesCount: 78,
    mediaType: 'video',
    aspectRatio: '16:9',
    publishedAt: '2026-10-13T13:00:00.000Z'
  },
  {
    id: 'yt-vtv24-tn-02',
    youtubeId: 'f6UuO3z_gW0',
    title: 'TIN NÓNG 10 PHÚT 12/10: Camera AI tại Hà Nội phát hiện vi phạm giao thông | VTV24',
    channel: 'VTV24',
    badge: 'TIÊU ĐIỂM',
    category: 'Thời sự 24h',
    subCategory: 'Tin nóng 10 phút',
    duration: '8:54',
    thumbnail: 'https://images.unsplash.com/photo-1508873696983-2df5293cb395?w=600&auto=format&fit=crop&q=70',
    likes: 16400,
    commentsCount: 780,
    sharesCount: 520,
    mediaType: 'video',
    aspectRatio: '16:9',
    publishedAt: '2026-10-12T13:00:00.000Z'
  },
  {
    id: 'yt-vtv24-tn-03',
    youtubeId: 'm_1b8eY-VqA',
    title: 'TIN NÓNG 10 PHÚT ngày 11/10: Khởi tố 7 bị can trong vụ án buôn lậu và trốn thuế | VTV24',
    channel: 'VTV24',
    badge: 'TIÊU ĐIỂM',
    category: 'Thời sự 24h',
    subCategory: 'Tin nóng 10 phút',
    duration: '10:28',
    thumbnail: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=70',
    likes: 28500,
    commentsCount: 1420,
    sharesCount: 890,
    mediaType: 'video',
    aspectRatio: '16:9',
    publishedAt: '2026-10-11T13:00:00.000Z'
  },
  {
    id: 'yt-vtv24-tn-04',
    youtubeId: '4G6uY8L_rEw',
    title: 'Tin nóng 10 phút 10/10/2026: Nhiều hoạt động chào mừng 72 năm ngày Giải phóng Thủ đô | VTV24',
    channel: 'VTV24',
    badge: 'BẢN TIN',
    category: 'Thời sự 24h',
    subCategory: 'Tin nóng 10 phút',
    duration: '8:30',
    thumbnail: 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=600&auto=format&fit=crop&q=70',
    likes: 15300,
    commentsCount: 640,
    sharesCount: 410,
    mediaType: 'video',
    aspectRatio: '16:9',
    publishedAt: '2026-10-10T13:00:00.000Z'
  },
  {
    id: 'yt-vtv24-tn-05',
    youtubeId: 'jV0-8w7x9qA',
    title: 'TIN NÓNG 10 PHÚT 09/10: Khởi tố 2 bị can trong vụ sai phạm đất đai và tài sản công | VTV24',
    channel: 'VTV24',
    badge: 'TIÊU ĐIỂM',
    category: 'Thời sự 24h',
    subCategory: 'Tin nóng 10 phút',
    duration: '10:55',
    thumbnail: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=600&auto=format&fit=crop&q=70',
    likes: 17200,
    commentsCount: 810,
    sharesCount: 560,
    mediaType: 'video',
    aspectRatio: '16:9',
    publishedAt: '2026-10-09T13:00:00.000Z'
  },
  {
    id: 'yt-vtv24-tn-06',
    youtubeId: 'v_3vQ7L_9xA',
    title: 'Tin nóng 10 phút 07/10: Cây cổ thụ bật gốc, nhiều tuyến đường ngập sâu sau dông lốc | VTV24',
    channel: 'VTV24',
    badge: 'THỜI TIẾT',
    category: 'Thời sự 24h',
    subCategory: 'Tin nóng 10 phút',
    duration: '9:28',
    thumbnail: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=600&auto=format&fit=crop&q=70',
    likes: 14800,
    commentsCount: 590,
    sharesCount: 380,
    mediaType: 'video',
    aspectRatio: '16:9',
    publishedAt: '2026-10-07T13:00:00.000Z'
  },

  // ── [PHÂN LOẠI 2: TỔNG HỢP TIN TỨC HÀNG NGÀY (THỜI SỰ TOÀN CẢNH TRƯA & TỐI)] ──
  {
    id: 'yt-vtv24-th-01',
    youtubeId: 'THldZ31vTvI',
    title: 'TSTC trưa 13/10: Triệt phá đường dây rửa tiền xuyên quốc gia hàng nghìn tỷ | VTV24',
    channel: 'VTV24',
    badge: 'TRỰC TIẾP',
    category: 'Thời sự 24h',
    subCategory: 'Tổng hợp tin tức hàng ngày',
    duration: '28:31',
    thumbnail: 'https://i.ytimg.com/vi/THldZ31vTvI/hqdefault.jpg',
    likes: 24600,
    commentsCount: 1320,
    sharesCount: 970,
    mediaType: 'video',
    aspectRatio: '16:9',
    publishedAt: '2026-10-13T12:00:00.000Z'
  },
  {
    id: 'yt-vtv24-th-02',
    youtubeId: 'kFDO9Qbua4c',
    title: 'Thời sự toàn cảnh tối 12/10: Chủ tịch Quốc hội Trần Thanh Mẫn dự phiên họp Quốc hội | VTV24',
    channel: 'VTV24',
    badge: 'TRỰC TIẾP',
    category: 'Thời sự 24h',
    subCategory: 'Tổng hợp tin tức hàng ngày',
    duration: '37:11',
    thumbnail: 'https://i.ytimg.com/vi/kFDO9Qbua4c/hqdefault.jpg',
    likes: 45200,
    commentsCount: 2410,
    sharesCount: 1840,
    mediaType: 'video',
    aspectRatio: '16:9',
    publishedAt: '2026-10-12T19:00:00.000Z'
  },
  {
    id: 'yt-vtv24-th-03',
    youtubeId: '0thQbm1zlW4',
    title: 'TSTC trưa 12/10: Ít nhất 139 người thiệt mạng trong thảm họa lũ lụt và sạt lở ven biển | VTV24',
    channel: 'VTV24',
    badge: 'TRỰC TIẾP',
    category: 'Thời sự 24h',
    subCategory: 'Tổng hợp tin tức hàng ngày',
    duration: '23:51',
    thumbnail: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?w=600&auto=format&fit=crop&q=70',
    likes: 35100,
    commentsCount: 1890,
    sharesCount: 1450,
    mediaType: 'video',
    aspectRatio: '16:9',
    publishedAt: '2026-10-12T12:00:00.000Z'
  },
  {
    id: 'yt-vtv24-th-04',
    youtubeId: 'M7lc1UVf-VE',
    title: 'Thời sự toàn cảnh tối 11/10: Chủ tịch Quốc hội Trần Thanh Mẫn tham dự chuỗi sự kiện đối ngoại | VTV24',
    channel: 'VTV24',
    badge: 'TRỰC TIẾP',
    category: 'Thời sự 24h',
    subCategory: 'Tổng hợp tin tức hàng ngày',
    duration: '43:33',
    thumbnail: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=600&auto=format&fit=crop&q=70',
    likes: 74500,
    commentsCount: 3820,
    sharesCount: 2910,
    mediaType: 'video',
    aspectRatio: '16:9',
    publishedAt: '2026-10-11T19:00:00.000Z'
  },
  {
    id: 'yt-vtv24-th-05',
    youtubeId: '7yqJ9vGqV1k',
    title: 'Thời sự toàn cảnh trưa 11/10: Chủ tịch Quốc hội thăm chính thức và ký kết hợp tác quốc tế | VTV24',
    channel: 'VTV24',
    badge: 'TRỰC TIẾP',
    category: 'Thời sự 24h',
    subCategory: 'Tổng hợp tin tức hàng ngày',
    duration: '21:01',
    thumbnail: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=70',
    likes: 106400,
    commentsCount: 5120,
    sharesCount: 4230,
    mediaType: 'video',
    aspectRatio: '16:9',
    publishedAt: '2026-10-11T12:00:00.000Z'
  },
  {
    id: 'yt-vtv24-th-06',
    youtubeId: 'Kmx55fnX6jM',
    title: 'Thời sự toàn cảnh trưa 10/10: Tình hình an ninh kinh tế và các vấn đề xã hội được quan tâm | VTV24',
    channel: 'VTV24',
    badge: 'TRỰC TIẾP',
    category: 'Thời sự 24h',
    subCategory: 'Tổng hợp tin tức hàng ngày',
    duration: '25:40',
    thumbnail: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=600&auto=format&fit=crop&q=70',
    likes: 29800,
    commentsCount: 1350,
    sharesCount: 920,
    mediaType: 'video',
    aspectRatio: '16:9',
    publishedAt: '2026-10-10T12:00:00.000Z'
  },

  // ── [PHÂN LOẠI 3: THẾ GIỚI TOÀN CẢNH (BẢN TIN QUỐC TẾ)] ──
  {
    id: 'yt-vtv24-tg-01',
    youtubeId: 'utYT3v_KTyo',
    title: 'Thế giới toàn cảnh 13/10: Sân bay quốc tế King Khalid mở rộng đón làn sóng khách quốc tế | VTV24',
    channel: 'VTV24',
    badge: 'THẾ GIỚI',
    category: 'Thế giới & Cuộc sống',
    subCategory: 'Thế giới toàn cảnh',
    duration: '16:25',
    thumbnail: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&auto=format&fit=crop&q=70',
    likes: 26400,
    commentsCount: 1180,
    sharesCount: 820,
    mediaType: 'video',
    aspectRatio: '16:9',
    publishedAt: '2026-10-13T09:00:00.000Z'
  },
  {
    id: 'yt-vtv24-tg-02',
    youtubeId: 'W4iP2Xb4qB4',
    title: 'Thế giới toàn cảnh ngày 12/10: Sân bay King Khalid đón kỷ lục hành khách và nâng tầm kết nối | VTV24',
    channel: 'VTV24',
    badge: 'THẾ GIỚI',
    category: 'Thế giới & Cuộc sống',
    subCategory: 'Thế giới toàn cảnh',
    duration: '13:54',
    thumbnail: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=600&auto=format&fit=crop&q=70',
    likes: 131200,
    commentsCount: 6540,
    sharesCount: 4890,
    mediaType: 'video',
    aspectRatio: '16:9',
    publishedAt: '2026-10-12T09:00:00.000Z'
  },
  {
    id: 'yt-vtv24-tg-03',
    youtubeId: 't2FGBb5uLhM',
    title: 'Thế giới toàn cảnh ngày 11/10: Sân bay King Khalid triển khai công nghệ AI tự động hóa vận hành | VTV24',
    channel: 'VTV24',
    badge: 'THẾ GIỚI',
    category: 'Thế giới & Cuộc sống',
    subCategory: 'Thế giới toàn cảnh',
    duration: '15:54',
    thumbnail: 'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=600&auto=format&fit=crop&q=70',
    likes: 105000,
    commentsCount: 4920,
    sharesCount: 3670,
    mediaType: 'video',
    aspectRatio: '16:9',
    publishedAt: '2026-10-11T09:00:00.000Z'
  },
  {
    id: 'yt-vtv24-tg-04',
    youtubeId: '2dF9eHjK9wY',
    title: 'Thế giới toàn cảnh 10/10: EU đưa Việt Nam và Panama ra khỏi danh sách giám sát đặc biệt | VTV24',
    channel: 'VTV24',
    badge: 'THẾ GIỚI',
    category: 'Thế giới & Cuộc sống',
    subCategory: 'Thế giới toàn cảnh',
    duration: '17:20',
    thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=70',
    likes: 209000,
    commentsCount: 9840,
    sharesCount: 7120,
    mediaType: 'video',
    aspectRatio: '16:9',
    publishedAt: '2026-10-10T09:00:00.000Z'
  },
  {
    id: 'yt-vtv24-tg-05',
    youtubeId: 'o3vQ8i9E2xQ',
    title: 'Thế giới toàn cảnh ngày 09/10: Mỹ khẩn trương ứng phó siêu bão Milton đổ bộ tàn phá | VTV24',
    channel: 'VTV24',
    badge: 'THẾ GIỚI',
    category: 'Thế giới & Cuộc sống',
    subCategory: 'Thế giới toàn cảnh',
    duration: '14:20',
    thumbnail: 'https://images.unsplash.com/photo-1527482797697-8795b05a13fe?w=600&auto=format&fit=crop&q=70',
    likes: 51200,
    commentsCount: 2430,
    sharesCount: 1890,
    mediaType: 'video',
    aspectRatio: '16:9',
    publishedAt: '2026-10-09T09:00:00.000Z'
  },
  {
    id: 'yt-vtv24-tg-06',
    youtubeId: 'jT2R-q1M9cA',
    title: 'Thế giới toàn cảnh 08/10: Nga bác bỏ thông tin về các cuộc đàm phán bí mật với phương Tây | VTV24',
    channel: 'VTV24',
    badge: 'THẾ GIỚI',
    category: 'Thế giới & Cuộc sống',
    subCategory: 'Thế giới toàn cảnh',
    duration: '20:35',
    thumbnail: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=70',
    likes: 61400,
    commentsCount: 3120,
    sharesCount: 2340,
    mediaType: 'video',
    aspectRatio: '16:9',
    publishedAt: '2026-10-08T09:00:00.000Z'
  },

  // ── [PHÂN LOẠI 4: TIN TỨC THỜI SỰ & KINH TẾ] ──
  {
    id: 'yt-vtv24-ts-01',
    youtubeId: 'xK0vQ9P1L1k',
    title: 'Lợi suất trái phiếu và bài toán lãi suất toàn cầu | VTV24',
    channel: 'VTV24',
    badge: 'TÀI CHÍNH',
    category: 'Tài chính & Vàng',
    subCategory: 'Tin tức thời sự',
    duration: '8:07',
    thumbnail: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&auto=format&fit=crop&q=70',
    likes: 5200,
    commentsCount: 310,
    sharesCount: 220,
    mediaType: 'video',
    aspectRatio: '16:9',
    publishedAt: '2026-10-13T12:30:00.000Z'
  },
  {
    id: 'yt-vtv24-ts-02',
    youtubeId: 'p5V8x9Z1y3c',
    title: 'Đường sắt Hà Nội - Lào Cai tăng chuyến, giảm ga dừng thúc đẩy giao thương du lịch | VTV24',
    channel: 'VTV24',
    badge: 'BẢN TIN',
    category: 'Thời sự 24h',
    subCategory: 'Tin tức thời sự',
    duration: '9:30',
    thumbnail: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=600&auto=format&fit=crop&q=70',
    likes: 3600,
    commentsCount: 240,
    sharesCount: 180,
    mediaType: 'video',
    aspectRatio: '16:9',
    publishedAt: '2026-10-13T10:30:00.000Z'
  },
  {
    id: 'yt-vtv24-ts-03',
    youtubeId: '819YbuGDpK0',
    title: 'BẢN TIN SÁNG 13/10: Nga miễn thị thực cho công dân một số nước và các điểm tin nóng | VTV24',
    channel: 'VTV24',
    badge: 'BẢN TIN',
    category: 'Thời sự 24h',
    subCategory: 'Tin tức thời sự',
    duration: '12:45',
    thumbnail: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&auto=format&fit=crop&q=70',
    likes: 20400,
    commentsCount: 1150,
    sharesCount: 840,
    mediaType: 'video',
    aspectRatio: '16:9',
    publishedAt: '2026-10-13T06:30:00.000Z'
  },
  {
    id: 'yt-vtv24-ts-04',
    youtubeId: '3ojcuyMKDvs',
    title: 'Houthi liên tiếp tấn công sân bay Ả Rập Xêút | Cụm tin quốc tế | VTV24',
    channel: 'VTV24',
    badge: 'THẾ GIỚI',
    category: 'Thế giới & Cuộc sống',
    subCategory: 'Tin tức thời sự',
    duration: '10:51',
    thumbnail: 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=600&auto=format&fit=crop&q=70',
    likes: 25800,
    commentsCount: 1390,
    sharesCount: 990,
    mediaType: 'video',
    aspectRatio: '16:9',
    publishedAt: '2026-10-12T15:00:00.000Z'
  },
  {
    id: 'yt-vtv24-ts-05',
    youtubeId: 'Kmx55fnX6jM',
    title: 'Băn khoăn của cử tri Mỹ trước bầu cử giữa kỳ và những tác động kinh tế mới | VTV24',
    channel: 'VTV24',
    badge: 'THẾ GIỚI',
    category: 'Thế giới & Cuộc sống',
    subCategory: 'Tin tức thời sự',
    duration: '8:47',
    thumbnail: 'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=600&auto=format&fit=crop&q=70',
    likes: 90200,
    commentsCount: 4890,
    sharesCount: 3720,
    mediaType: 'video',
    aspectRatio: '16:9',
    publishedAt: '2026-10-12T14:00:00.000Z'
  },

  // ── [SHORTS TRÊN KÊNH VTV24 (9:16 DỌC)] ──
  {
    id: 'yt-vtv24-s01',
    youtubeId: '819YbuGDpK0',
    title: 'VTV24 Shorts • Cảnh báo nóng: Bẫy lừa đảo trúng thưởng và giả mạo tài khoản ngân hàng',
    channel: 'VTV24',
    badge: 'TIÊU ĐIỂM',
    category: 'Thời sự 24h',
    subCategory: 'Shorts ngắn',
    duration: '0:58',
    thumbnail: 'https://cdn2.tuoitre.vn/471584752817336320/2026/10/12/quy-chuan00004318still141-17917883369831355170827.jpg',
    likes: 18400,
    commentsCount: 1120,
    sharesCount: 950,
    mediaType: 'short',
    aspectRatio: '9:16',
    publishedAt: '2026-10-13T06:00:00.000Z'
  },
  {
    id: 'yt-vtv24-s02',
    youtubeId: 'xYXS7Dgi5M4',
    title: 'VTV24 Shorts • Giá vàng hôm nay biến động mạnh, chuyên gia khuyến cáo thận trọng lướt sóng',
    channel: 'VTV24',
    badge: 'TÀI CHÍNH',
    category: 'Tài chính & Vàng',
    subCategory: 'Shorts ngắn',
    duration: '0:48',
    thumbnail: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=600&auto=format&fit=crop&q=70',
    likes: 15200,
    commentsCount: 890,
    sharesCount: 710,
    mediaType: 'short',
    aspectRatio: '9:16',
    publishedAt: '2026-10-13T04:30:00.000Z'
  },
  {
    id: 'yt-vtv24-s03',
    youtubeId: 'ADGo5NaYQNM',
    title: 'VTV24 Shorts • Cảnh báo bão và hình thái thời tiết mưa lớn dông lốc nguy hiểm tại các tỉnh ven biển',
    channel: 'VTV24',
    badge: 'THỜI TIẾT',
    category: 'Thời tiết TV',
    subCategory: 'Shorts ngắn',
    duration: '0:59',
    thumbnail: 'https://images.unsplash.com/photo-1592210454359-9043f067919b?w=600&auto=format&fit=crop&q=70',
    likes: 12800,
    commentsCount: 670,
    sharesCount: 520,
    mediaType: 'short',
    aspectRatio: '9:16',
    publishedAt: '2026-10-12T16:30:00.000Z'
  },
  {
    id: 'yt-vtv24-s04',
    youtubeId: 'gusC3mjEV3I',
    title: 'VTV24 Shorts • Thị trường tiêu dùng: Sức mua các mặt hàng thiết yếu tại các siêu thị lớn tăng cao',
    channel: 'VTV24',
    badge: 'TÀI CHÍNH',
    category: 'Tài chính & Vàng',
    subCategory: 'Shorts ngắn',
    duration: '1:05',
    thumbnail: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=600&auto=format&fit=crop&q=70',
    likes: 14100,
    commentsCount: 780,
    sharesCount: 610,
    mediaType: 'short',
    aspectRatio: '9:16',
    publishedAt: '2026-10-12T08:00:00.000Z'
  },

  // ══════════════════ 2. BÁO TIỀN PHONG ══════════════════
  // Video trên kênh (16:9)
  {
    id: 'yt-tp-v01',
    youtubeId: 'Kmx55fnX6jM',
    title: 'Tiền Phong TV • Bản tin Thời sự nóng: Phân tích chính sách kinh tế mới và tiêu điểm xã hội',
    channel: 'Báo Tiền Phong',
    badge: 'BẢN TIN',
    category: 'Thời sự 24h',
    duration: '18:40',
    thumbnail: 'https://cdn2.tuoitre.vn/471584752817336320/2026/10/12/img-1791781649342475651614.jpeg',
    likes: 9240,
    commentsCount: 610,
    sharesCount: 430,
    mediaType: 'video',
    aspectRatio: '16:9',
    publishedAt: '2026-10-13T04:15:00.000Z'
  },
  {
    id: 'yt-tp-v02',
    youtubeId: 'fQ6NE4ZQOLg',
    title: 'Phóng sự Tiền Phong • Điều tra trật tự an toàn giao thông và quy chuẩn văn minh đô thị',
    channel: 'Báo Tiền Phong',
    badge: 'TIÊU ĐIỂM',
    category: 'Thời sự 24h',
    duration: '12:20',
    thumbnail: 'https://i.ytimg.com/vi/fQ6NE4ZQOLg/hqdefault.jpg',
    likes: 7410,
    commentsCount: 480,
    sharesCount: 320,
    mediaType: 'video',
    aspectRatio: '16:9',
    publishedAt: '2026-10-13T02:30:00.000Z'
  },
  {
    id: 'yt-tp-v03',
    youtubeId: 'ADGo5NaYQNM',
    title: 'Diễn đàn Tiền Phong • Đồng hành cùng thanh niên khởi nghiệp và các chương trình an sinh xã hội',
    channel: 'Báo Tiền Phong',
    badge: 'BẢN TIN',
    category: 'Thời sự 24h',
    duration: '15:10',
    thumbnail: 'https://i.ytimg.com/vi/ADGo5NaYQNM/hqdefault.jpg',
    likes: 5820,
    commentsCount: 310,
    sharesCount: 220,
    mediaType: 'video',
    aspectRatio: '16:9',
    publishedAt: '2026-10-12T15:00:00.000Z'
  },
  // Shorts trên kênh (9:16)
  {
    id: 'yt-tp-s01',
    youtubeId: '819YbuGDpK0',
    title: 'Tiền Phong Shorts • Người đàn ông đi xe máy chặn đầu ô tô: Lời nhắc nhở về văn hóa giao thông',
    channel: 'Báo Tiền Phong',
    badge: 'TIÊU ĐIỂM',
    category: 'Thời sự 24h',
    duration: '0:55',
    thumbnail: 'https://cdn2.tuoitre.vn/471584752817336320/2026/10/12/quy-chuan00004318still141-17917883369831355170827.jpg',
    likes: 14200,
    commentsCount: 940,
    sharesCount: 680,
    mediaType: 'short',
    aspectRatio: '9:16',
    publishedAt: '2026-10-13T05:20:00.000Z'
  },
  {
    id: 'yt-tp-s02',
    youtubeId: 'xYXS7Dgi5M4',
    title: 'Tiền Phong Shorts • 60 giây điểm nhanh các tin tức thời sự nóng nhất sáng nay',
    channel: 'Báo Tiền Phong',
    badge: 'BẢN TIN',
    category: 'Thời sự 24h',
    duration: '0:59',
    thumbnail: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=600&auto=format&fit=crop&q=70',
    likes: 11200,
    commentsCount: 680,
    sharesCount: 490,
    mediaType: 'short',
    aspectRatio: '9:16',
    publishedAt: '2026-10-13T03:00:00.000Z'
  },

  // ══════════════════ 3. BÁO THANH NIÊN ══════════════════
  // Video trên kênh (16:9)
  {
    id: 'yt-tn-v01',
    youtubeId: 'fQ6NE4ZQOLg',
    title: 'Tiêu điểm Thanh Niên • Báo động thực trạng kỹ năng mềm của sinh viên và cơ hội việc làm',
    channel: 'Báo Thanh Niên',
    badge: 'TIÊU ĐIỂM',
    category: 'Thời sự 24h',
    duration: '14:30',
    thumbnail: 'https://i.ytimg.com/vi/fQ6NE4ZQOLg/hqdefault.jpg',
    likes: 8730,
    commentsCount: 560,
    sharesCount: 390,
    mediaType: 'video',
    aspectRatio: '16:9',
    publishedAt: '2026-10-13T04:40:00.000Z'
  },
  {
    id: 'yt-tn-v02',
    youtubeId: 'Kmx55fnX6jM',
    title: 'Thời sự Thanh Niên • Cận cảnh tuyến cao tốc Bắc - Nam thi công thần tốc vượt tiến độ',
    channel: 'Báo Thanh Niên',
    badge: 'BẢN TIN',
    category: 'Thời sự 24h',
    duration: '11:50',
    thumbnail: 'https://cdn2.tuoitre.vn/471584752817336320/2026/10/12/img-1791781649342475651614.jpeg',
    likes: 7120,
    commentsCount: 430,
    sharesCount: 290,
    mediaType: 'video',
    aspectRatio: '16:9',
    publishedAt: '2026-10-13T01:50:00.000Z'
  },
  // Shorts trên kênh (9:16)
  {
    id: 'yt-tn-s01',
    youtubeId: '819YbuGDpK0',
    title: 'Thanh Niên Shorts • Dự báo xu thế tiêu dùng và thị trường bán lẻ những tháng cuối năm',
    channel: 'Báo Thanh Niên',
    badge: 'TIÊU ĐIỂM',
    category: 'Thời sự 24h',
    duration: '0:50',
    thumbnail: 'https://images.unsplash.com/photo-1555421689-491a97ff2040?w=600&auto=format&fit=crop&q=70',
    likes: 13500,
    commentsCount: 780,
    sharesCount: 560,
    mediaType: 'short',
    aspectRatio: '9:16',
    publishedAt: '2026-10-13T04:10:00.000Z'
  },
  {
    id: 'yt-tn-s02',
    youtubeId: 'THldZ31vTvI',
    title: 'Thanh Niên Shorts • Bắt trọn khoảnh khắc cầu vồng đôi xuất hiện rực rỡ sau cơn mưa rào',
    channel: 'Báo Thanh Niên',
    badge: 'THỜI TIẾT',
    category: 'Thời tiết TV',
    duration: '0:42',
    thumbnail: 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=600&auto=format&fit=crop&q=70',
    likes: 16800,
    commentsCount: 910,
    sharesCount: 740,
    mediaType: 'short',
    aspectRatio: '9:16',
    publishedAt: '2026-10-13T02:15:00.000Z'
  },

  // ══════════════════ 4. BÁO TUỔI TRẺ ══════════════════
  // Video trên kênh (16:9)
  {
    id: 'yt-tt-v01',
    youtubeId: 'M7lc1UVf-VE',
    title: 'Phóng sự Tuổi Trẻ • Hành trình vượt khó của những kỹ sư trẻ đưa trí tuệ nhân tạo vào y tế cơ sở',
    channel: 'Báo Tuổi Trẻ',
    badge: 'TIÊU ĐIỂM',
    category: 'Thời sự 24h',
    duration: '16:30',
    thumbnail: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&auto=format&fit=crop&q=70',
    likes: 9150,
    commentsCount: 620,
    sharesCount: 450,
    mediaType: 'video',
    aspectRatio: '16:9',
    publishedAt: '2026-10-13T03:50:00.000Z'
  },
  {
    id: 'yt-tt-v02',
    youtubeId: 'kFDO9Qbua4c',
    title: 'Tuổi Trẻ TV • Hà Nội mở rộng các tuyến xe buýt điện xanh và lộ trình giảm phát thải đô thị',
    channel: 'Báo Tuổi Trẻ',
    badge: 'BẢN TIN',
    category: 'Thời sự 24h',
    duration: '10:45',
    thumbnail: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=600&auto=format&fit=crop&q=70',
    likes: 7240,
    commentsCount: 410,
    sharesCount: 310,
    mediaType: 'video',
    aspectRatio: '16:9',
    publishedAt: '2026-10-12T14:30:00.000Z'
  },
  // Shorts trên kênh (9:16)
  {
    id: 'yt-tt-s01',
    youtubeId: '819YbuGDpK0',
    title: 'Tuổi Trẻ Shorts • Trải nghiệm tàu Metro Bến Thành - Suối Tiên giờ cao điểm đông vui',
    channel: 'Báo Tuổi Trẻ',
    badge: 'TIÊU ĐIỂM',
    category: 'Thời sự 24h',
    duration: '0:54',
    thumbnail: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=600&auto=format&fit=crop&q=70',
    likes: 19500,
    commentsCount: 1350,
    sharesCount: 1100,
    mediaType: 'short',
    aspectRatio: '9:16',
    publishedAt: '2026-10-13T05:10:00.000Z'
  },
  {
    id: 'yt-tt-s02',
    youtubeId: 'xYXS7Dgi5M4',
    title: 'Tuổi Trẻ Shorts • Ấm lòng chuyến xe 0 đồng chở bệnh nhân nghèo về quê sum vầy',
    channel: 'Báo Tuổi Trẻ',
    badge: 'BẢN TIN',
    category: 'Thời sự 24h',
    duration: '0:58',
    thumbnail: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&auto=format&fit=crop&q=70',
    likes: 22100,
    commentsCount: 1680,
    sharesCount: 1450,
    mediaType: 'short',
    aspectRatio: '9:16',
    publishedAt: '2026-10-13T01:40:00.000Z'
  },

  // ══════════════════ 5. VTC NOW ══════════════════
  // Video trên kênh (16:9)
  {
    id: 'yt-vtc-v01',
    youtubeId: 'THldZ31vTvI',
    title: 'VTC NOW Thời sự 19h • Bản tin Thời sự trực tiếp, tổng hợp thông tin quan trọng nhất cả nước',
    channel: 'VTC NOW',
    badge: 'TRỰC TIẾP',
    category: 'Thời sự 24h',
    duration: '45:00',
    thumbnail: 'https://i.ytimg.com/vi/THldZ31vTvI/hqdefault.jpg',
    likes: 11300,
    commentsCount: 790,
    sharesCount: 520,
    mediaType: 'video',
    aspectRatio: '16:9',
    publishedAt: '2026-10-13T04:00:00.000Z'
  },
  {
    id: 'yt-vtc-v02',
    youtubeId: '0thQbm1zlW4',
    title: 'VTC NOW Kinh tế số • Xu hướng thanh toán không dùng tiền mặt và an toàn bảo mật tài khoản',
    channel: 'VTC NOW',
    badge: 'TÀI CHÍNH',
    category: 'Tài chính & Vàng',
    duration: '15:20',
    thumbnail: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&auto=format&fit=crop&q=70',
    likes: 6780,
    commentsCount: 420,
    sharesCount: 290,
    mediaType: 'video',
    aspectRatio: '16:9',
    publishedAt: '2026-10-12T17:00:00.000Z'
  },
  // Shorts trên kênh (9:16)
  {
    id: 'yt-vtc-s01',
    youtubeId: 'xYXS7Dgi5M4',
    title: 'VTC NOW Shorts • Điểm nhanh 3 tin công nghệ và an ninh mạng đáng chú ý trong ngày',
    channel: 'VTC NOW',
    badge: 'TIÊU ĐIỂM',
    category: 'Thời sự 24h',
    duration: '0:49',
    thumbnail: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=70',
    likes: 12400,
    commentsCount: 690,
    sharesCount: 510,
    mediaType: 'short',
    aspectRatio: '9:16',
    publishedAt: '2026-10-13T03:30:00.000Z'
  },

  // ══════════════════ 6. BÁO LAO ĐỘNG ══════════════════
  // Video trên kênh (16:9)
  {
    id: 'yt-ld-v01',
    youtubeId: 'Kmx55fnX6jM',
    title: 'Lao Động TV • Tiêu điểm tiền lương, bảo hiểm xã hội và quyền lợi thiết thực của người lao động',
    channel: 'Báo Lao Động',
    badge: 'TIÊU ĐIỂM',
    category: 'Thời sự 24h',
    duration: '17:40',
    thumbnail: 'https://cdn2.tuoitre.vn/471584752817336320/2026/10/12/img-1791781649342475651614.jpeg',
    likes: 8420,
    commentsCount: 590,
    sharesCount: 410,
    mediaType: 'video',
    aspectRatio: '16:9',
    publishedAt: '2026-10-13T03:10:00.000Z'
  },
  {
    id: 'yt-ld-v02',
    youtubeId: 'fQ6NE4ZQOLg',
    title: 'Phóng sự Lao Động • Cuộc sống công nhân tăng ca những tháng cuối năm tại khu công nghiệp lớn',
    channel: 'Báo Lao Động',
    badge: 'BẢN TIN',
    category: 'Thời sự 24h',
    duration: '13:15',
    thumbnail: 'https://i.ytimg.com/vi/fQ6NE4ZQOLg/hqdefault.jpg',
    likes: 6850,
    commentsCount: 470,
    sharesCount: 330,
    mediaType: 'video',
    aspectRatio: '16:9',
    publishedAt: '2026-10-12T15:45:00.000Z'
  },
  // Shorts trên kênh (9:16)
  {
    id: 'yt-ld-s01',
    youtubeId: '819YbuGDpK0',
    title: 'Lao Động Shorts • Những điểm mới về rút BHXH một lần người lao động nhất định cần biết',
    channel: 'Báo Lao Động',
    badge: 'TIÊU ĐIỂM',
    category: 'Thời sự 24h',
    duration: '0:56',
    thumbnail: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=600&auto=format&fit=crop&q=70',
    likes: 17200,
    commentsCount: 1140,
    sharesCount: 920,
    mediaType: 'short',
    aspectRatio: '9:16',
    publishedAt: '2026-10-13T04:50:00.000Z'
  },

  // ══════════════════ 7. VTV THỜI TIẾT ══════════════════
  // Video trên kênh (16:9)
  {
    id: 'yt-tt-tv-v01',
    youtubeId: 'ADGo5NaYQNM',
    title: 'Dự báo thời tiết VTV • Xu thế thời tiết cả nước 10 ngày tới: Không khí lạnh dồn dập tràn về',
    channel: 'VTV Thời Tiết',
    badge: 'THỜI TIẾT',
    category: 'Thời tiết TV',
    duration: '08:50',
    thumbnail: 'https://i.ytimg.com/vi/ADGo5NaYQNM/hqdefault.jpg',
    likes: 9850,
    commentsCount: 710,
    sharesCount: 560,
    mediaType: 'video',
    aspectRatio: '16:9',
    publishedAt: '2026-10-13T04:30:00.000Z'
  },
  {
    id: 'yt-tt-tv-v02',
    youtubeId: 'kFDO9Qbua4c',
    title: 'Cảnh báo thời tiết nguy hiểm • Khuyến cáo phòng chống rét hại và triều cường vùng ven biển',
    channel: 'VTV Thời Tiết',
    badge: 'THỜI TIẾT',
    category: 'Thời tiết TV',
    duration: '10:20',
    thumbnail: 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=600&auto=format&fit=crop&q=70',
    likes: 7640,
    commentsCount: 520,
    sharesCount: 380,
    mediaType: 'video',
    aspectRatio: '16:9',
    publishedAt: '2026-10-12T16:20:00.000Z'
  },
  // Shorts trên kênh (9:16)
  {
    id: 'yt-tt-tv-s01',
    youtubeId: 'xYXS7Dgi5M4',
    title: 'VTV Thời Tiết Shorts • Nhiệt độ các miền hôm nay: Miền Bắc se lạnh, Miền Nam nắng ráo',
    channel: 'VTV Thời Tiết',
    badge: 'THỜI TIẾT',
    category: 'Thời tiết TV',
    duration: '0:45',
    thumbnail: 'https://i.ytimg.com/vi/xYXS7Dgi5M4/hqdefault.jpg',
    likes: 16500,
    commentsCount: 890,
    sharesCount: 730,
    mediaType: 'short',
    aspectRatio: '9:16',
    publishedAt: '2026-10-13T05:45:00.000Z'
  },
  {
    id: 'yt-tt-tv-s02',
    youtubeId: '819YbuGDpK0',
    title: 'VTV Thời Tiết Shorts • Chỉ số tia cực tím UV tăng cao và các biện pháp bảo vệ làn da',
    channel: 'VTV Thời Tiết',
    badge: 'THỜI TIẾT',
    category: 'Thời tiết TV',
    duration: '0:50',
    thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=70',
    likes: 14100,
    commentsCount: 680,
    sharesCount: 540,
    mediaType: 'short',
    aspectRatio: '9:16',
    publishedAt: '2026-10-13T02:00:00.000Z'
  },

  // ══════════════════ 8. BẢN TIN TRANG (WEBSITE ANX) ══════════════════
  // Video trên kênh (16:9)
  {
    id: 'yt-site-v01',
    youtubeId: '0thQbm1zlW4',
    title: 'Bản Tin Trang Anx • Cập nhật radar mây vệ tinh thời gian thực và bản đồ gió tương tác',
    channel: 'Bản Tin Trang',
    badge: 'BẢN TIN TRANG',
    category: 'Thời tiết TV',
    duration: '04:15',
    thumbnail: 'https://images.unsplash.com/photo-1592210454359-9043f067919b?w=600&auto=format&fit=crop&q=70',
    likes: 4500,
    commentsCount: 290,
    sharesCount: 210,
    isSiteNews: true,
    mediaType: 'video',
    aspectRatio: '16:9',
    publishedAt: '2026-10-13T04:00:00.000Z'
  },
  // Shorts trên kênh (9:16)
  {
    id: 'yt-site-s01',
    videoUrl: 'https://cdn2.tuoitre.vn/471584752817336320/2026/10/12/ha-noi-17917882728071979895065.mp4',
    title: 'Bản Tin Trang Shorts • Theo dõi chỉ số chất lượng không khí AQI và thời tiết giờ tới',
    channel: 'Bản Tin Trang',
    badge: 'BẢN TIN TRANG',
    category: 'Thời tiết TV',
    duration: '0:45',
    thumbnail: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=600&auto=format&fit=crop&q=70',
    likes: 6200,
    commentsCount: 380,
    sharesCount: 260,
    isSiteNews: true,
    mediaType: 'short',
    aspectRatio: '9:16',
    publishedAt: '2026-10-13T03:00:00.000Z'
  }
];

const MULTI_CACHE_KEY = 'yt_aggregated_shorts_cache_v6';
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

  // 2. Fetch song song từ các kênh uy tín
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

        while ((match = entryRegex.exec(xml)) !== null && list.length < 10) {
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

            // Phân biệt chính xác giữa video dài trên kênh và shorts ngắn
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
    if (userRole && userRole.email) {
      return {
        name: userRole.name || 'Người dùng Google',
        email: userRole.email,
        picture: userRole.picture || null,
        isLoggedIn: true
      };
    }
    try {
      const stored = localStorage.getItem('user_auth');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.email) {
          return {
            name: parsed.name || 'Người dùng Google',
            email: parsed.email,
            picture: parsed.picture || null,
            isLoggedIn: true
          };
        }
      }
    } catch {}
    return {
      name: 'Khách',
      email: '',
      picture: null,
      isLoggedIn: false
    };
  }, [userRole]);

  // ── TV CHANNEL & MEDIA TAB STATES ──
  const [selectedChannelId, setSelectedChannelId] = useState<string>('all');
  const [showChannelMenu, setShowChannelMenu] = useState<boolean>(false);
  const [mediaTab, setMediaTab] = useState<'all' | 'video' | 'short'>('all');
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

  // Xoay 16:9 / 9:16
  const toggleOrientation = () => {
    const nextState = !isLandscape;
    setIsLandscape(nextState);
    setShowToast(nextState ? '🖥️ Chế độ Toàn Cảnh 16:9' : '📱 Chế độ Dọc Shorts (9:16)');
    setTimeout(() => setShowToast(null), 2000);
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024 && !isLandscape && mediaTab !== 'short') {
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

  // Kho video khả dụng
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

    // 1. Thêm kho video phong phú BACKUP_FALLBACK_SHORTS
    BACKUP_FALLBACK_SHORTS.forEach(addUnique);

    // 2. Thêm video fetch từ API nếu có
    if (multiChannelVideos && multiChannelVideos.length > 0) {
      multiChannelVideos.forEach(addUnique);
    }

    // 3. Thêm từ YOUTUBE_NEWS_DATABASE
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
          aspectRatio: item.duration?.includes('0:') ? '9:16' : '16:9',
          publishedAt: new Date(Date.now() - (idx + 1) * 7200000).toISOString()
        });
      });
    }

    // 4. Thêm bài viết có video từ liveNews
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
            aspectRatio: '9:16',
            publishedAt: n.date || new Date(Date.now() - (idx + 2) * 3600000).toISOString()
          });
        }
      });
    }

    return list;
  }, [multiChannelVideos, liveNews]);

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

  // Playlist lọc theo KÊNH đã chọn, ĐỊNH DẠNG & CHUYÊN MỤC PHÂN LOẠI BẢN TIN
  const playlist = useMemo(() => {
    let result = allAvailableVideos.filter(item => matchesChannel(item, selectedChannelId));

    if (mediaTab !== 'all') {
      result = result.filter(item => item.mediaType === mediaTab);
    }

    if (selectedSubCategory !== 'all') {
      result = result.filter(item => item.subCategory === selectedSubCategory);
    }

    // Luôn sắp xếp từ video MỚI NHẤT trên kênh
    result.sort((a, b) => {
      const tA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
      const tB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
      return tB - tA;
    });

    if (result.length === 0) {
      result = allAvailableVideos.filter(item => matchesChannel(item, selectedChannelId));
    }

    return result.length > 0 ? result : BACKUP_FALLBACK_SHORTS;
  }, [allAvailableVideos, selectedChannelId, mediaTab, selectedSubCategory]);

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
  const handleSelectMediaTab = (tab: 'all' | 'video' | 'short') => {
    setMediaTab(tab);
    setCurrentIndex(0);
    if (tab === 'video' && typeof window !== 'undefined' && window.innerWidth >= 1024) {
      setIsLandscape(true);
    } else if (tab === 'short') {
      setIsLandscape(false);
    }
    const label = tab === 'all' ? 'Tất cả video & Shorts' : (tab === 'video' ? 'Video dài trên kênh (16:9 Toàn cảnh)' : 'Video Shorts ngắn (9:16 Dọc)');
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

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, showComments, showPlaylistDrawer, showChannelMenu, isLandscape, isFullscreen, handleNextShort, handlePrevShort, toggleBrowserFullscreen, resetInactivityTimer, onClose]);

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

        // YouTube onError (101, 150): Tự chuyển clip sau
        if (data.event === 'onError' || data.info === 101 || data.info === 150) {
          setTimeout(() => {
            handleNextShort();
          }, 500);
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

        // Đồng bộ timer tự chuyển clip
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

    const durationSec = parseDurationSeconds(currentShort.duration) || 55;
    autoAdvanceTimerRef.current = setTimeout(() => {
      handleNextShort();
    }, (durationSec + 2) * 1000);

    return () => {
      window.removeEventListener('message', handleMessage);
      if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
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

      {/* ── Khung Video Chính (Fullscreen Cinema 100vw x 100vh) ── */}
      <div 
        className={`relative bg-black overflow-hidden flex flex-col justify-between shrink-0 transition-all duration-300 ${
          isLandscape || isFullscreen
            ? 'w-full h-full max-w-full max-h-[100dvh] rounded-none border-none shadow-none'
            : 'w-full h-[100dvh] sm:w-auto sm:h-full aspect-[9/16] max-w-[100vw] sm:rounded-2xl sm:border sm:border-white/15 sm:shadow-[0_0_80px_rgba(0,0,0,0.95)]'
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

        {/* Double Tap Flying Heart */}
        {showHeartPop && (
          <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none animate-ping">
            <svg className="w-24 h-24 text-red-500 fill-current drop-shadow-2xl" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </div>
        )}

        {/* ── TOP HEADER OVERLAY (THIẾT KẾ ĐỒNG NHẤT KHÔNG CHỒNG ĐÈ GIAO DIỆN) ── */}
        <div className={`absolute top-0 inset-x-0 z-30 pt-3 px-3 sm:px-5 pb-8 bg-gradient-to-b from-black/95 via-black/55 to-transparent flex flex-col gap-2.5 pointer-events-none transition-opacity duration-300 ${
          isControlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}>
          {/* Row 1: Logo, Channel & Controls */}
          <div className="flex items-center justify-between w-full">
            {/* Logo & Channel EPG Badge bên trái */}
            <div className="flex items-center gap-2 pointer-events-auto select-none min-w-0">
              <span className="text-white font-black text-[15px] sm:text-[17px] tracking-tight drop-shadow-md leading-none flex items-center gap-1 shrink-0">
                <span className="text-[#ff315f]">Anx.</span>
                <span>TV</span>
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shrink-0 hidden sm:inline-block"></span>

              {/* Nút Chọn Kênh TV EPG */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowChannelMenu(true);
                  resetInactivityTimer();
                }}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 hover:bg-black/85 active:scale-95 border border-white/20 backdrop-blur-md text-white transition-all shadow-md group cursor-pointer shrink-0"
                title="Mở menu chọn kênh truyền hình (TV EPG) [C]"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping shrink-0"></span>
                <span className="text-[11px] font-bold text-white flex items-center gap-1">
                  <span className="text-[#ff315f] font-mono text-[10px]">{currentChannelInfo.number}</span>
                  <span className="max-w-[70px] sm:max-w-[130px] truncate">{currentChannelInfo.name}</span>
                </span>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-white/70 group-hover:translate-y-0.5 transition-transform shrink-0">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>
            </div>

            {/* Quick Format Filter Tabs: CHỈ HIỂN THỊ KHI Ở CHẾ ĐỘ TOÀN CẢNH 16:9 RỘNG RÃI */}
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

            {/* Controls: Tỉ lệ, Playlist, Kênh TV, Âm thanh, Fullscreen, Đóng */}
            <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto shrink-0">
              {/* Chuyển đổi tỉ lệ 16:9 / 9:16 */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleOrientation();
                  resetInactivityTimer();
                }}
                style={{ height: '34px', borderRadius: '17px', padding: '0 10px' }}
                className={`flex items-center gap-1 backdrop-blur-md border cursor-pointer active:scale-95 transition-all text-[11px] font-bold shadow-md shrink-0 ${
                  isLandscape
                    ? 'bg-[#ff315f] text-white border-[#ff315f] shadow-[0_0_12px_rgba(255,49,95,0.4)]'
                    : 'bg-black/60 hover:bg-black/80 text-white border-white/20'
                }`}
                title={isLandscape ? "Xem chế độ Dọc 9:16 Shorts [R]" : "Xem chế độ Toàn Cảnh 16:9 [R]"}
              >
                <span className="text-[12px]">{isLandscape ? '🖥️' : '📱'}</span>
                <span className="hidden sm:inline">{isLandscape ? '16:9' : '9:16'}</span>
              </button>

              {/* Danh sách phát trên video */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowPlaylistDrawer(!showPlaylistDrawer);
                  resetInactivityTimer();
                }}
                style={{ height: '34px', borderRadius: '17px', padding: '0 10px' }}
                className={`flex items-center gap-1.5 backdrop-blur-md border cursor-pointer active:scale-95 transition-all text-[11px] font-bold shadow-md shrink-0 ${
                  showPlaylistDrawer
                    ? 'bg-red-600 text-white border-red-400 shadow-[0_0_12px_rgba(239,68,68,0.5)]'
                    : 'bg-black/60 hover:bg-black/80 text-white border-white/20'
                }`}
                title="Mở Danh Sách Phát trực tiếp trên video [L / P]"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3">
                  <line x1="8" y1="6" x2="21" y2="6"/>
                  <line x1="8" y1="12" x2="21" y2="12"/>
                  <line x1="8" y1="18" x2="21" y2="18"/>
                  <line x1="3" y1="6" x2="3.01" y2="6"/>
                  <line x1="3" y1="12" x2="3.01" y2="12"/>
                  <line x1="3" y1="18" x2="3.01" y2="18"/>
                </svg>
                <span className="hidden sm:inline">Danh sách</span>
                <span className="px-1 py-0.2 rounded-full bg-white/20 text-[9.5px] font-mono">{playlist.length}</span>
              </button>

              {/* Nút bật Smart TV Guide (chỉ hiện trên màn hình ngang desktop) */}
              {isLandscape && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowChannelMenu(true);
                    resetInactivityTimer();
                  }}
                  style={{ width: '34px', height: '34px', minWidth: '34px', minHeight: '34px', maxWidth: '34px', maxHeight: '34px', borderRadius: '50%', aspectRatio: '1 / 1', padding: 0 }}
                  className={`w-[34px] h-[34px] aspect-square rounded-full items-center justify-center shrink-0 backdrop-blur-md border cursor-pointer active:scale-90 transition-all hidden md:flex ${
                    showChannelMenu 
                      ? 'bg-red-600 text-white border-red-400 shadow-md' 
                      : 'bg-black/60 hover:bg-black/80 text-white border-white/20'
                  }`}
                  title="Danh sách kênh truyền hình TV Guide [C]"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="block m-auto">
                    <rect x="2" y="7" width="20" height="15" rx="2" ry="2"/>
                    <polyline points="17 2 12 7 7 2"/>
                  </svg>
                </button>
              )}

              {/* Bật/Tắt âm thanh (Mặc định là BẬT ÂM THANH theo yêu cầu) */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleMute();
                  resetInactivityTimer();
                }}
                style={{ width: '34px', height: '34px', minWidth: '34px', minHeight: '34px', maxWidth: '34px', maxHeight: '34px', borderRadius: '50%', aspectRatio: '1 / 1', padding: 0 }}
                className={`w-[34px] h-[34px] aspect-square rounded-full flex items-center justify-center shrink-0 backdrop-blur-md border cursor-pointer active:scale-90 transition-all ${
                  isMuted 
                    ? 'bg-red-600/80 hover:bg-red-600 text-white border-red-400 shadow-md' 
                    : 'bg-black/60 hover:bg-black/80 text-white border-white/20'
                }`}
                title={isMuted ? 'Đang tắt tiếng - Nhấn để Bật âm thanh (M)' : 'Đang bật âm thanh - Nhấn để Tắt tiếng (M)'}
              >
                {isMuted ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="block m-auto"><line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/></svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="block m-auto"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
                )}
              </button>

              {/* Fullscreen trình duyệt (hiện trên màn hình desktop & tablet) */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleBrowserFullscreen();
                  resetInactivityTimer();
                }}
                style={{ width: '34px', height: '34px', minWidth: '34px', minHeight: '34px', maxWidth: '34px', maxHeight: '34px', borderRadius: '50%', aspectRatio: '1 / 1', padding: 0 }}
                className="w-[34px] h-[34px] aspect-square rounded-full items-center justify-center shrink-0 bg-black/60 hover:bg-black/80 text-white backdrop-blur-md border border-white/20 cursor-pointer active:scale-90 transition-all hidden sm:flex"
                title={isFullscreen ? 'Thoát toàn màn hình (F)' : 'Toàn màn hình trình duyệt (F)'}
              >
                {isFullscreen ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="block m-auto"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/></svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="block m-auto"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
                )}
              </button>

              {/* Đóng Modal */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                style={{ width: '34px', height: '34px', minWidth: '34px', minHeight: '34px', maxWidth: '34px', maxHeight: '34px', borderRadius: '50%', aspectRatio: '1 / 1', padding: 0 }}
                className="w-[34px] h-[34px] aspect-square rounded-full flex items-center justify-center shrink-0 bg-black/60 hover:bg-red-600 text-white backdrop-blur-md border border-white/20 cursor-pointer active:scale-90 transition-all"
                title="Đóng (Esc)"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="block m-auto"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
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

          {/* Row 3: Quick Sub-Category Filter Pills nếu kênh có phân loại bản tin (VTV24: Tin nóng 10 phút, Tổng hợp thời sự, Thế giới toàn cảnh...) */}
          {isLandscape && availableSubCategories.length > 0 && (
            <div className="hidden sm:flex items-center gap-1.5 overflow-x-auto py-0.5 scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden pointer-events-auto">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
                <span>📂 Chuyên mục:</span>
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectSubCategory('all');
                }}
                className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold whitespace-nowrap backdrop-blur-md transition-all border cursor-pointer active:scale-95 shadow-md shrink-0 ${
                  selectedSubCategory === 'all'
                    ? 'bg-amber-500 text-black border-amber-400 font-extrabold shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                    : 'bg-black/60 hover:bg-black/85 text-white/90 border-white/15'
                }`}
              >
                <span>Tất cả bản tin ({allAvailableVideos.filter(i => matchesChannel(i, selectedChannelId) && (mediaTab === 'all' || i.mediaType === mediaTab)).length})</span>
              </button>
              {availableSubCategories.map(subCat => {
                const isActive = selectedSubCategory === subCat;
                const icon = subCat.includes('Tin nóng') ? '🔥' : subCat.includes('Tổng hợp') ? '📰' : subCat.includes('Thế giới') ? '🌍' : '📊';
                const count = allAvailableVideos.filter(i => matchesChannel(i, selectedChannelId) && i.subCategory === subCat && (mediaTab === 'all' || i.mediaType === mediaTab)).length;
                return (
                  <button
                    key={subCat}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectSubCategory(subCat);
                    }}
                    className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold whitespace-nowrap backdrop-blur-md transition-all border cursor-pointer active:scale-95 shadow-md shrink-0 ${
                      isActive
                        ? 'bg-amber-500 text-black border-amber-400 font-extrabold shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                        : 'bg-black/60 hover:bg-black/85 text-white/90 border-white/15'
                    }`}
                  >
                    <span>{icon}</span>
                    <span>{subCat}</span>
                    <span className={`text-[9px] px-1 py-0.2 rounded font-mono ${isActive ? 'bg-black/30 text-black' : 'bg-white/10 text-white/70'}`}>
                      {count}
                    </span>
                    {isActive && <span className="w-1.5 h-1.5 rounded-full bg-black animate-ping shrink-0"></span>}
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
            : 'right-3 bottom-14 flex flex-col items-center gap-3'
        } ${isControlsVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
          
          {/* Like ❤️ Button */}
          <div className="flex flex-col items-center gap-0.5 shrink-0 select-none">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleLike();
                resetInactivityTimer();
              }}
              style={{ width: '40px', height: '40px', minWidth: '40px', minHeight: '40px', maxWidth: '40px', maxHeight: '40px', borderRadius: '50%', aspectRatio: '1 / 1', padding: 0 }}
              className={`w-10 h-10 aspect-square shrink-0 rounded-full flex items-center justify-center backdrop-blur-md transition-all shadow-lg cursor-pointer active:scale-90 border ${
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
          <div className="flex flex-col items-center gap-0.5 shrink-0 select-none">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowComments(!showComments);
                resetInactivityTimer();
              }}
              style={{ width: '40px', height: '40px', minWidth: '40px', minHeight: '40px', maxWidth: '40px', maxHeight: '40px', borderRadius: '50%', aspectRatio: '1 / 1', padding: 0 }}
              className="w-10 h-10 aspect-square shrink-0 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-md border border-white/20 shadow-lg cursor-pointer active:scale-90 transition-all"
              title="Bình luận thực tế"
            >
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 block m-auto"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            </button>
            <span className="text-[10px] font-bold text-white drop-shadow">
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
              style={{ width: '40px', height: '40px', minWidth: '40px', minHeight: '40px', maxWidth: '40px', maxHeight: '40px', borderRadius: '50%', aspectRatio: '1 / 1', padding: 0 }}
              className="w-10 h-10 aspect-square shrink-0 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-md border border-white/20 shadow-lg cursor-pointer active:scale-90 transition-all"
              title="Chia sẻ video"
            >
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 block m-auto"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
            </button>
            <span className="text-[10px] font-bold text-white drop-shadow">
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
              style={{ width: '40px', height: '40px', minWidth: '40px', minHeight: '40px', maxWidth: '40px', maxHeight: '40px', borderRadius: '50%', aspectRatio: '1 / 1', padding: 0 }}
              className={`w-10 h-10 aspect-square shrink-0 rounded-full flex items-center justify-center backdrop-blur-md border shadow-lg cursor-pointer active:scale-90 transition-all ${
                showPlaylistDrawer
                  ? 'bg-red-600 text-white border-red-500 shadow-red-500/50'
                  : 'bg-black/50 hover:bg-black/70 text-white border-white/20'
              }`}
              title="Danh sách phát trên video [L / P]"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="shrink-0 block m-auto">
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

        {/* ── BOTTOM VIDEO OVERLAY: KÊNH, TIÊU ĐỀ, HASHTAGS & TÀI KHOẢN ── */}
        <div className={`absolute bottom-0 inset-x-0 z-20 p-3 sm:p-4 ${isLandscape ? 'pb-3 pr-[260px]' : 'pb-3.5 pr-14'} bg-gradient-to-t from-black via-black/80 to-transparent flex flex-col gap-1.5 transition-opacity duration-300 ${
          isControlsVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}>
          
          {/* Channel Info & Nút Theo Dõi */}
          <div className="flex items-center gap-2 pointer-events-auto max-w-full overflow-hidden">
            <div 
              style={{ width: '32px', height: '32px', minWidth: '32px', minHeight: '32px', maxWidth: '32px', maxHeight: '32px', borderRadius: '50%', aspectRatio: '1 / 1', padding: 0 }}
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
                style={{ width: '14px', height: '14px', minWidth: '14px', minHeight: '14px', maxWidth: '14px', maxHeight: '14px', borderRadius: '50%', aspectRatio: '1 / 1' }}
                className="w-3.5 h-3.5 rounded-full bg-blue-500 text-white flex items-center justify-center text-[9px] shrink-0 font-bold"
              >
                ✓
              </span>
            </div>

            {/* Nhãn định dạng & badge */}
            <span className={`px-2 py-0.5 rounded-full text-[9.5px] font-black uppercase tracking-wider shrink-0 ${
              currentShort.mediaType === 'short'
                ? 'bg-pink-600/80 text-white border border-pink-400/40'
                : 'bg-blue-600/80 text-white border border-blue-400/40'
            }`}>
              {currentShort.mediaType === 'short' ? '⚡ Shorts' : '🎬 Video'}
            </span>

            {/* Nút Chuông Theo Dõi Kênh (Đồng bộ tài khoản Gmail) */}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                toggleFollowChannel();
                resetInactivityTimer();
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10.5px] font-bold border backdrop-blur-md cursor-pointer transition-all active:scale-95 ml-1 shrink-0 ${
                isFollowingChannel
                  ? 'bg-[#ff315f] border-[#ff315f] text-white shadow-[0_0_10px_rgba(255,49,95,0.4)]'
                  : 'bg-white/10 hover:bg-white/20 border-white/25 text-neutral-200 hover:text-white'
              }`}
              title={isFollowingChannel ? "Đang theo dõi kênh này" : "Nhấn để theo dõi kênh"}
            >
              {isFollowingChannel ? (
                <>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                  <span>Đã theo dõi</span>
                </>
              ) : (
                <>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/><line x1="12" y1="2" x2="12" y2="4"/></svg>
                  <span>Theo dõi</span>
                </>
              )}
            </button>
          </div>

          {/* Title */}
          <p 
            className={`text-[12.5px] sm:text-[13.5px] font-medium text-white ${isLandscape ? 'line-clamp-1 max-w-[90%]' : 'line-clamp-2'} drop-shadow leading-snug notranslate`}
            translate="no"
          >
            {cleanVideoTitle(currentShort.title)}
          </p>

          {/* Hashtags & Trạng thái tài khoản người dùng */}
          <div className="flex items-center gap-1.5 text-[11px] font-medium flex-wrap">
            <span 
              className="px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-sm text-[10px] font-bold tracking-tight shadow-sm"
              style={{ color: '#000000' }}
            >
              #{currentShort.mediaType === 'short' ? 'shorts' : 'video'}
            </span>
            <span 
              className="px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-sm text-[10px] font-bold tracking-tight shadow-sm"
              style={{ color: '#000000' }}
            >
              #tintuc24h
            </span>
            
            {activeUser.isLoggedIn && (
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9.5px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>{activeUser.name}</span>
              </span>
            )}

            <span className="ml-auto text-[10px] text-white/70 font-semibold drop-shadow">
              {currentIndex + 1} / {playlist.length}
            </span>
          </div>
        </div>
      </div>

      {/* ── ON-VIDEO PLAYLIST DRAWER (DANH SÁCH PHÁT NỔI TRÊN VIDEO) ── */}
      {showPlaylistDrawer && (
        <div 
          className="absolute inset-0 z-40 flex justify-end animate-fadeIn select-none"
          onClick={() => setShowPlaylistDrawer(false)}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-xs cursor-pointer" />

          <div 
            className="relative w-full sm:w-[420px] md:w-[460px] h-full bg-[#0d0d10]/95 backdrop-blur-2xl border-l border-white/15 p-4 sm:p-5 flex flex-col shadow-[-20px_0_60px_rgba(0,0,0,0.85)] z-50 animate-slideLeft text-white"
            onClick={(e) => e.stopPropagation()}
          >
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
                        {item.subCategory && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 truncate max-w-[130px]">
                            {item.subCategory}
                          </span>
                        )}
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
            </div>

            {/* Grid Thẻ Kênh: ĐỒNG NHẤT CHIỀU CAO MIN-HEIGHT VÀ CĂN CHỈNH THẲNG HÀNG 100% */}
            <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 max-h-[58vh] scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {TV_CHANNELS.map((ch) => {
                const isActive = selectedChannelId === ch.id;
                const stats = channelStatsMap[ch.id] || { total: 0, videos: 0, shorts: 0 };

                return (
                  <div
                    key={ch.id}
                    onClick={() => handleSelectChannel(ch.id)}
                    className={`group relative p-3.5 rounded-2xl border transition-all cursor-pointer min-h-[135px] h-full flex flex-col justify-between gap-2.5 ${
                      isActive
                        ? 'bg-gradient-to-br from-red-600/30 via-red-950/40 to-neutral-900 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.35)] ring-1 ring-red-400/50'
                        : 'bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/25 text-neutral-300 hover:text-white'
                    }`}
                  >
                    {/* Top Row: Channel number + Badge Text + Live indicator */}
                    <div className="flex items-center justify-between gap-2 shrink-0">
                      <div className="flex items-center gap-1.5">
                        <span className={`px-2 py-0.5 rounded-md font-mono text-[10.5px] font-black tracking-wider border ${
                          isActive 
                            ? 'bg-red-600 text-white border-red-400' 
                            : 'bg-black/60 text-neutral-300 border-white/15'
                        }`}>
                          {ch.number}
                        </span>

                        <span 
                          className="px-2 py-0.5 rounded-full text-[9.5px] font-extrabold uppercase tracking-wider"
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
                        <span className="flex items-center gap-1 text-[9.5px] font-black text-red-400 tracking-wider">
                          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                          ĐANG PHÁT
                        </span>
                      ) : (
                        <span className="text-[10px] text-neutral-400 group-hover:text-neutral-200 transition-colors font-semibold">
                          {stats.total} clip
                        </span>
                      )}
                    </div>

                    {/* Middle: Channel Name & Tagline (CỐ ĐỊNH MIN-HEIGHT ĐỂ KHÔNG BAO GIỜ BỊ LỆCH) */}
                    <div className="flex-1 flex flex-col justify-start">
                      <h4 className={`text-[13.5px] font-black flex items-center gap-1.5 truncate ${isActive ? 'text-white' : 'text-neutral-100 group-hover:text-white'}`}>
                        <span>{ch.name}</span>
                        {isActive && <span className="text-red-400">★</span>}
                      </h4>
                      <p className="text-[11px] text-neutral-400 line-clamp-2 min-h-[32px] mt-0.5 leading-snug">
                        {ch.tagline}
                      </p>
                    </div>

                    {/* Bottom Row: Thống kê định dạng & Trạng thái chọn */}
                    <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10.5px] shrink-0 mt-auto">
                      <span className="text-neutral-400 text-[10px] font-medium">
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
        <div className="absolute inset-x-0 bottom-0 sm:inset-y-0 sm:right-0 sm:left-auto w-full sm:w-[400px] max-h-[82vh] sm:max-h-full bg-neutral-900/95 backdrop-blur-2xl sm:rounded-l-3xl border-t sm:border-l border-white/15 shadow-2xl z-40 flex flex-col p-4 animate-slideUp">
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
