import React, { useState, useEffect, useRef, useMemo } from 'react';

export interface YouTubeNewsItem {
  id: string;
  title: string;
  channel: string;
  badge: 'TRỰC TIẾP' | 'BẢN TIN' | 'TIÊU ĐIỂM' | 'THỜI TIẾT' | 'TÀI CHÍNH' | 'THẾ GIỚI';
  youtubeId: string;
  category: 'Thời sự 24h' | 'Thời tiết TV' | 'Tài chính & Vàng' | 'Thế giới & Cuộc sống';
  duration?: string;
  thumbnail?: string;
}

export const YOUTUBE_NEWS_DATABASE: YouTubeNewsItem[] = [
  // ── Bản tin Trực tiếp & Thời sự 24h ──
  {
    id: 'htv-live-20g',
    title: '🔴 TRỰC TIẾP: Thời sự HTV 20G - Bản tin Thời sự Trực tiếp & Tin tức tổng hợp hôm nay',
    channel: 'HTV Tin Tức',
    badge: 'TRỰC TIẾP',
    youtubeId: 'kXf-0r-DvCM',
    category: 'Thời sự 24h',
    duration: 'Trực tiếp',
    thumbnail: 'https://i.ytimg.com/vi/kXf-0r-DvCM/hqdefault.jpg'
  },
  {
    id: 'thanhnien-live',
    title: '🔴 TRỰC TIẾP: Bản tin Nóng & Thời sự Báo Thanh Niên - Phản ánh nhịp sống 24h',
    channel: 'Báo Thanh Niên',
    badge: 'TRỰC TIẾP',
    youtubeId: 'Kmx55fnX6jM',
    category: 'Thời sự 24h',
    duration: 'Trực tiếp',
    thumbnail: 'https://i.ytimg.com/vi/Kmx55fnX6jM/hqdefault.jpg'
  },
  {
    id: 'vtv24-thoisu',
    title: 'VTV24 • Bản tin Chuyển Động 24h - Cập nhật toàn cảnh dòng chảy tin tức trong nước và quốc tế',
    channel: 'VTV24',
    badge: 'BẢN TIN',
    youtubeId: '819YbuGDpK0',
    category: 'Thời sự 24h',
    duration: '35:20',
    thumbnail: 'https://i.ytimg.com/vi/819YbuGDpK0/hqdefault.jpg'
  },
  {
    id: 'vtcnow-thoisu',
    title: 'VTC NOW • Thời sự 24h - Bản tin Tiêu điểm và Tin tức chính trị xã hội nổi bật',
    channel: 'VTC NOW',
    badge: 'BẢN TIN',
    youtubeId: 'utYT3v_KTyo',
    category: 'Thời sự 24h',
    duration: '28:15',
    thumbnail: 'https://i.ytimg.com/vi/utYT3v_KTyo/hqdefault.jpg'
  },
  {
    id: 'vtc1-thoisu',
    title: 'VTC1 • Bản tin Thời sự Mới Nhất - Phân tích chuyên sâu các sự kiện nổi bật trong ngày',
    channel: 'VTC1 - TIN TỨC',
    badge: 'BẢN TIN',
    youtubeId: '3ojcuyMKDvs',
    category: 'Thời sự 24h',
    duration: '30:00',
    thumbnail: 'https://i.ytimg.com/vi/3ojcuyMKDvs/hqdefault.jpg'
  },
  {
    id: 'tuoitre-thoisu',
    title: 'Báo Tuổi Trẻ • Tin nhanh 24h - Phóng sự điều tra & Tiêu điểm đời sống dân sinh',
    channel: 'Tuổi Trẻ Media',
    badge: 'TIÊU ĐIỂM',
    youtubeId: 'KIeY_PcD-sE',
    category: 'Thời sự 24h',
    duration: '18:40',
    thumbnail: 'https://i.ytimg.com/vi/KIeY_PcD-sE/hqdefault.jpg'
  },
  {
    id: 'vtv24-tieudiem',
    title: 'VTV24 • Tiêu điểm Pháp luật & Đời sống - Cụm tin tức nhanh trong ngày',
    channel: 'VTV24',
    badge: 'TIÊU ĐIỂM',
    youtubeId: '57ASWX0FbiI',
    category: 'Thời sự 24h',
    duration: '15:10',
    thumbnail: 'https://i.ytimg.com/vi/57ASWX0FbiI/hqdefault.jpg'
  },
  {
    id: 'thanhnien-danso',
    title: 'Báo Thanh Niên • Nhịp sống Đô thị - Phóng sự đời sống người dân và giao thông',
    channel: 'Báo Thanh Niên',
    badge: 'BẢN TIN',
    youtubeId: 'nuJj_IYnIyM',
    category: 'Thời sự 24h',
    duration: '12:35',
    thumbnail: 'https://i.ytimg.com/vi/nuJj_IYnIyM/hqdefault.jpg'
  },

  // ── Dự báo thời tiết truyền hình ──
  {
    id: 'vtv-thoitiet-chieu',
    title: 'VTV Thời Tiết • Bản tin Dự báo thời tiết cả nước - Cảnh báo mưa lớn, lũ lụt và áp thấp',
    channel: 'VTV Thời Tiết',
    badge: 'THỜI TIẾT',
    youtubeId: 'ADGo5NaYQNM',
    category: 'Thời tiết TV',
    duration: '06:30',
    thumbnail: 'https://i.ytimg.com/vi/ADGo5NaYQNM/hqdefault.jpg'
  },
  {
    id: 'vtv-thoitiet-trua',
    title: 'VTV Thời Tiết • Dự báo thời tiết 12h30 - Hình thế gây mưa lớn các khu vực trên cả nước',
    channel: 'VTV Thời Tiết',
    badge: 'THỜI TIẾT',
    youtubeId: 'xYXS7Dgi5M4',
    category: 'Thời tiết TV',
    duration: '05:45',
    thumbnail: 'https://i.ytimg.com/vi/xYXS7Dgi5M4/hqdefault.jpg'
  },
  {
    id: 'vtv-thoitiet-bien',
    title: 'VTV Thời Tiết • Bản tin Thời tiết biển - Cảnh báo gió mạnh, sóng lớn các vùng biển',
    channel: 'VTV Thời Tiết',
    badge: 'THỜI TIẾT',
    youtubeId: 'cC9ZQkGK0tU',
    category: 'Thời tiết TV',
    duration: '04:50',
    thumbnail: 'https://i.ytimg.com/vi/cC9ZQkGK0tU/hqdefault.jpg'
  },
  {
    id: 'vtv-thoitiet-canhbao',
    title: 'VTV Thời Tiết • Cảnh báo thời tiết & Chất lượng không khí hôm nay',
    channel: 'VTV Thời Tiết',
    badge: 'THỜI TIẾT',
    youtubeId: 'yepJrd41iCA',
    category: 'Thời tiết TV',
    duration: '05:15',
    thumbnail: 'https://i.ytimg.com/vi/yepJrd41iCA/hqdefault.jpg'
  },
  {
    id: 'tuoitre-thoitiet-ngap',
    title: 'Báo Tuổi Trẻ • Mưa lớn ngập lụt đô thị và cảnh báo triều cường TP.HCM',
    channel: 'Tuổi Trẻ Media',
    badge: 'THỜI TIẾT',
    youtubeId: '2CVousMq-zg',
    category: 'Thời tiết TV',
    duration: '07:20',
    thumbnail: 'https://i.ytimg.com/vi/2CVousMq-zg/hqdefault.jpg'
  },

  // ── Tài chính - Kinh doanh & Giá vàng ──
  {
    id: 'vtc-kinhte',
    title: 'VTC NOW • Thị trường Kinh tế - Tiêu điểm dòng tiền, xuất nhập khẩu và doanh nghiệp',
    channel: 'VTC NOW',
    badge: 'TÀI CHÍNH',
    youtubeId: '0thQbm1zlW4',
    category: 'Tài chính & Vàng',
    duration: '20:10',
    thumbnail: 'https://i.ytimg.com/vi/0thQbm1zlW4/hqdefault.jpg'
  },
  {
    id: 'vtcnow-taichinh',
    title: 'VTC NOW • Bản tin Kinh tế - Tài chính & Giá Vàng SJC, Ngoại tệ hôm nay',
    channel: 'VTC NOW',
    badge: 'TÀI CHÍNH',
    youtubeId: 'Na5uByDy8Sw',
    category: 'Tài chính & Vàng',
    duration: '16:50',
    thumbnail: 'https://i.ytimg.com/vi/Na5uByDy8Sw/hqdefault.jpg'
  },

  // ── Thế giới & Cuộc sống ──
  {
    id: 'vtv24-thegioi',
    title: 'VTV24 • Thế Giới 24h - Dòng chảy tin tức quốc tế và phong cách sống hiện đại',
    channel: 'VTV24',
    badge: 'THẾ GIỚI',
    youtubeId: 'sGa3-eGdYC4',
    category: 'Thế giới & Cuộc sống',
    duration: '22:00',
    thumbnail: 'https://i.ytimg.com/vi/sGa3-eGdYC4/hqdefault.jpg'
  },
  {
    id: 'tuoitre-phapluat',
    title: 'Báo Tuổi Trẻ • Tiêu điểm Thời sự - Phóng sự điều tra & An ninh trật tự',
    channel: 'Tuổi Trẻ Media',
    badge: 'THẾ GIỚI',
    youtubeId: 'lLtmNYcgLFA',
    category: 'Thế giới & Cuộc sống',
    duration: '14:30',
    thumbnail: 'https://i.ytimg.com/vi/lLtmNYcgLFA/hqdefault.jpg'
  }
];

export function extractYouTubeId(urlOrId: string): string | null {
  if (!urlOrId) return null;
  const trimmed = urlOrId.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts|live)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
  const match = trimmed.match(regExp);
  return match ? match[1] : null;
}

export function YouTubeBroadcastPlayer({
  liveNews = [],
  currentWeather,
  onMinimizeChange,
  initialCategory,
  onClosePlayer,
}: {
  liveNews?: any[];
  currentWeather?: any;
  onMinimizeChange?: (minimized: boolean) => void;
  initialCategory?: string;
  onClosePlayer?: () => void;
}) {
  const [selectedVideo, setSelectedVideo] = useState<YouTubeNewsItem>(YOUTUBE_NEWS_DATABASE[0]);
  const [activeTab, setActiveTab] = useState<string>('Tất cả');
  const [showTvOverlay, setShowTvOverlay] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [isMini, setIsMini] = useState<boolean>(false);
  const [isTheater, setIsTheater] = useState<boolean>(false);
  const [customInput, setCustomInput] = useState<string>('');
  const [inputError, setInputError] = useState<string>('');
  const [clock, setClock] = useState<string>('');
  const [dateFormatted, setDateFormatted] = useState<string>('');
  const playerContainerRef = useRef<HTMLDivElement>(null);

  // Digital studio clock ticking
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      const s = String(now.getSeconds()).padStart(2, '0');
      setClock(`${h}:${m}:${s}`);

      const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
      const dayName = days[now.getDay()];
      setDateFormatted(`${dayName}, ${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`);
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInput.trim()) return;
    const yId = extractYouTubeId(customInput);
    if (!yId) {
      setInputError('Link YouTube không hợp lệ. Vui lòng kiểm tra lại URL hoặc ID video.');
      return;
    }
    setInputError('');
    const newVideoItem: YouTubeNewsItem = {
      id: `custom-${Date.now()}`,
      title: `Bản tin Trực tuyến • Video YouTube (${yId})`,
      channel: 'Kênh Người Dùng',
      badge: 'TIÊU ĐIỂM',
      youtubeId: yId,
      category: 'Thời sự 24h',
      duration: 'Trực tiếp',
      thumbnail: `https://i.ytimg.com/vi/${yId}/hqdefault.jpg`
    };
    setSelectedVideo(newVideoItem);
    setCustomInput('');
  };

  const categories = ['Tất cả', 'Thời sự 24h', 'Thời tiết TV', 'Tài chính & Vàng', 'Thế giới & Cuộc sống'];

  const filteredPlaylist = useMemo(() => {
    if (activeTab === 'Tất cả') return YOUTUBE_NEWS_DATABASE;
    return YOUTUBE_NEWS_DATABASE.filter(item => item.category === activeTab);
  }, [activeTab]);

  const handleToggleMini = () => {
    const next = !isMini;
    setIsMini(next);
    if (onMinimizeChange) onMinimizeChange(next);
  };

  // Ticker items string
  const tickerItems = useMemo(() => {
    const items: string[] = [];
    if (currentWeather) {
      items.push(`THỜI TIẾT: ${currentWeather.location || 'Hà Nội'} ${currentWeather.temp || 26}°C - ${currentWeather.condition || 'Ổn định'}`);
    }
    items.push('GIÁ VÀNG SJC: Mua vào 88.50 triệu/lượng - Bán ra 90.50 triệu/lượng');
    items.push('VN-INDEX: 1,258.45 (+6.12 điểm)');
    if (liveNews && liveNews.length > 0) {
      liveNews.slice(0, 8).forEach(n => {
        if (n.author) items.push(n.author.replace(/<[^>]+>/g, '').trim());
      });
    } else {
      items.push('Bản tin thời sự tổng hợp được phát sóng trực tiếp từ các đài truyền hình chính thống.');
    }
    return items;
  }, [liveNews, currentWeather]);

  return (
    <>
      {/* ── Main Broadcast Desk Section ─────────────────────────── */}
      <div 
        ref={playerContainerRef} 
        id="youtube-broadcast-section"
        className={`w-full transition-all duration-300 ${isTheater ? 'fixed inset-0 z-[250] bg-black/95 p-3 md:p-6 overflow-y-auto flex flex-col items-center justify-center' : 'w-full mb-4'}`}
      >
        <div className={`w-full ${isTheater ? 'max-w-[1400px]' : 'w-full'} bg-white dark:bg-[#1c1c1e] rounded-[var(--card-radius)] border border-[#e3e7ef] dark:border-[#38383a] shadow-[0px_4px_16px_0px_rgba(23,33,51,0.08)] overflow-hidden`}>
          
          {/* ── Top Broadcast Header (Studio Banner) ── */}
          <div className="px-3.5 py-2.5 md:px-5 md:py-3 bg-[#f8fafc] dark:bg-[#2c2c2e] border-b border-[#e3e7ef] dark:border-[#38383a] flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5">
              {/* Pulsing Live Pill */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#ffe8ee] text-[#ff315f] text-[11px] font-bold tracking-wider uppercase shrink-0">
                <span className="w-2 h-2 rounded-full bg-[#ff315f] animate-ping"></span>
                <span>{selectedVideo.badge}</span>
              </div>
              
              {/* Studio Title */}
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[14px] md:text-[16px] text-[#182033] dark:text-white truncate">
                    Truyền Hình Bản Tin 24H
                  </span>
                  <span className="text-[9px] md:text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#ff315f] text-white uppercase shrink-0">
                    LIVE HD
                  </span>
                </div>
                <span className="text-[11px] text-[#5f687b] dark:text-[#a0a6b5] hidden sm:inline-block truncate">
                  Phát sóng trực tiếp VTV24, VTC, HTV, Tuổi Trẻ, Thanh Niên &amp; Dự báo thời tiết
                </span>
              </div>
            </div>

            {/* Right: Electronic TV Clock & Control Toolbar */}
            <div className="flex items-center gap-1.5 sm:gap-2 ml-auto shrink-0">
              {/* Audio Unmute Toggle Button */}
              <button
                onClick={() => setIsMuted(!isMuted)}
                title={isMuted ? 'Nhấn để Bật âm thanh' : 'Nhấn để Tắt tiếng'}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] md:text-[12px] font-bold transition-all cursor-pointer shadow-xs ${isMuted ? 'bg-[#ff315f] text-white animate-pulse' : 'bg-emerald-600 text-white'}`}
              >
                {isMuted ? (
                  <>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/></svg>
                    <span>Bật tiếng</span>
                  </>
                ) : (
                  <>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
                    <span>Có tiếng</span>
                  </>
                )}
              </button>

              {/* Studio Clock */}
              <div className="hidden xs:flex bg-white dark:bg-black/40 border border-[#e3e7ef] dark:border-slate-700 px-2.5 py-0.5 rounded-lg flex-col items-end shadow-xs">
                <span className="font-mono font-bold text-[12px] md:text-[13px] text-[#182033] dark:text-amber-400">
                  {clock || '--:--:--'}
                </span>
                <span className="text-[9px] text-[#5f687b] dark:text-[#a0a6b5]">
                  {dateFormatted || 'Thời sự'}
                </span>
              </div>

              {/* Toggle TV Graphics Button */}
              <button
                onClick={() => setShowTvOverlay(!showTvOverlay)}
                title={showTvOverlay ? 'Tắt lớp đồ họa TV' : 'Bật lớp đồ họa TV'}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] md:text-[12px] font-semibold transition-all cursor-pointer ${showTvOverlay ? 'bg-[#f4f6fa] dark:bg-slate-800 text-[#182033] dark:text-white border border-[#e3e7ef] dark:border-slate-700' : 'bg-[#e3e7ef] text-[#5f687b]'}`}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="15" rx="2"/><polyline points="17 2 12 7 7 2"/></svg>
                <span className="hidden md:inline">{showTvOverlay ? 'Đồ họa TV' : 'Ẩn đồ họa'}</span>
              </button>

              {/* Theater Mode Button */}
              <button
                onClick={() => setIsTheater(!isTheater)}
                title={isTheater ? 'Thoát Rạp chiếu' : 'Toàn cảnh Rạp chiếu'}
                className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-[#f4f6fa] dark:bg-slate-800 hover:bg-[#e3e7ef] text-[#182033] dark:text-slate-300 flex items-center justify-center transition-colors cursor-pointer border border-[#e3e7ef] dark:border-slate-700"
              >
                {isTheater ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/></svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
                )}
              </button>

              {/* Mini-player button */}
              <button
                onClick={handleToggleMini}
                title="Thu nhỏ góc màn hình để vừa đọc báo vừa xem"
                className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-[#f4f6fa] dark:bg-slate-800 hover:bg-[#e3e7ef] text-[#182033] dark:text-slate-300 flex items-center justify-center transition-colors cursor-pointer border border-[#e3e7ef] dark:border-slate-700"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><rect x="11" y="11" width="8" height="8" rx="1"/></svg>
              </button>

              {onClosePlayer && (
                <button
                  onClick={onClosePlayer}
                  title="Đóng trình phát"
                  className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-[#f4f6fa] dark:bg-slate-800 hover:bg-[#ffe8ee] text-[#5f687b] hover:text-[#ff315f] flex items-center justify-center transition-colors cursor-pointer border border-[#e3e7ef] dark:border-slate-700"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              )}
            </div>
          </div>

          {/* ── Center Stage: Screen & Playlist ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
            
            {/* Video Main Screen (8 cols on Desktop) */}
            <div className="lg:col-span-8 relative bg-black flex flex-col justify-center items-center overflow-hidden group">
              <div className="w-full relative aspect-video bg-black">
                {/* Responsive Embedded YouTube Player */}
                <iframe
                  key={`${selectedVideo.youtubeId}-${isMuted}`}
                  title={selectedVideo.title}
                  src={`https://www.youtube.com/embed/${selectedVideo.youtubeId}?autoplay=1&mute=${isMuted ? 1 : 0}&enablejsapi=1&playsinline=1&rel=0`}
                  className="w-full h-full border-0 absolute inset-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />

                {/* Unmute floating hint when muted */}
                {isMuted && (
                  <div 
                    onClick={() => setIsMuted(false)}
                    className="absolute top-3 left-1/2 -translate-x-1/2 z-30 bg-black/75 hover:bg-[#ff315f] text-white px-3 py-1 rounded-full text-[11px] font-semibold cursor-pointer shadow-lg backdrop-blur-md flex items-center gap-1.5 transition-all active:scale-95 border border-white/20"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/></svg>
                    <span>Nhấn để bật âm thanh bản tin</span>
                  </div>
                )}

                {/* ── TV Broadcast Studio Overlays (Khi showTvOverlay bật) ── */}
                {showTvOverlay && (
                  <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-2.5 sm:p-4 z-20 pb-8 sm:pb-10">
                    
                    {/* Top Corner Overlays */}
                    <div className="flex items-start justify-between w-full">
                      {/* Left: TV Channel Watermark Bug */}
                      <div className="flex items-center gap-1.5 bg-black/70 backdrop-blur-md px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md border border-white/10 shadow-lg">
                        <div className="w-2 h-2 rounded-full bg-red-600 animate-ping"></div>
                        <span className="font-extrabold tracking-wider text-[10px] sm:text-[12px] text-white">
                          {selectedVideo.channel.toUpperCase()}
                        </span>
                      </div>

                      {/* Right: Station ID & Live Temp */}
                      {currentWeather && (
                        <div className="flex items-center gap-1.5 bg-black/70 backdrop-blur-md px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md border border-white/10 text-white text-[10px] sm:text-[11px] font-semibold shadow-lg">
                          <span>📍 {currentWeather.location || 'Hà Nội'}</span>
                          <span className="text-amber-400 font-bold">{currentWeather.temp || 26}°C</span>
                        </div>
                      )}
                    </div>

                    {/* Bottom: Lower-Third Graphics (Chân sóng truyền hình) */}
                    <div className="w-full flex flex-col gap-1 transition-all duration-300 drop-shadow-2xl">
                      
                      {/* Lower-Third Tier 1: Red Tag + Main Title Banner */}
                      <div className="flex items-stretch rounded-md sm:rounded-lg overflow-hidden border border-white/20 shadow-[0_6px_20px_rgba(0,0,0,0.8)] backdrop-blur-md">
                        {/* Red Headline Ribbon */}
                        <div className="bg-[#ff315f] text-white px-2.5 sm:px-3.5 py-1 sm:py-1.5 flex items-center justify-center font-black text-[10px] sm:text-[12px] tracking-wider uppercase shrink-0">
                          {selectedVideo.badge}
                        </div>
                        {/* Title Text Banner */}
                        <div className="bg-black/80 flex-1 px-2.5 sm:px-3.5 py-1 sm:py-1.5 flex items-center min-w-0">
                          <p className="font-bold text-white text-[11px] sm:text-[13px] md:text-[14px] leading-tight line-clamp-1 drop-shadow">
                            {selectedVideo.title}
                          </p>
                        </div>
                      </div>

                      {/* Lower-Third Tier 2: Breaking News Ticker (Dải chữ chạy) */}
                      <div className="flex items-center h-[22px] sm:h-[26px] rounded-md sm:rounded-lg overflow-hidden bg-black/85 border border-white/10 shadow-lg">
                        <div className="bg-amber-400 text-slate-950 px-2 h-full flex items-center justify-center font-black text-[9px] sm:text-[10px] tracking-wider uppercase shrink-0">
                          ⚡ TIN NÓNG
                        </div>
                        <div className="flex-1 overflow-hidden relative h-full flex items-center pl-2">
                          <div className="animate-marquee whitespace-nowrap flex items-center gap-5 text-[10px] sm:text-[11px] font-medium text-slate-200">
                            {tickerItems.map((item, idx) => (
                              <span key={idx} className="flex items-center gap-1.5">
                                <span className="w-1 h-1 rounded-full bg-amber-400 inline-block"></span>
                                {item}
                              </span>
                            ))}
                            {/* Duplicate for infinite loop */}
                            {tickerItems.map((item, idx) => (
                              <span key={`dup-${idx}`} className="flex items-center gap-1.5">
                                <span className="w-1 h-1 rounded-full bg-amber-400 inline-block"></span>
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                    </div>

                  </div>
                )}
              </div>

              {/* Quick Input Bar under video */}
              <div className="w-full bg-[#f8fafc] dark:bg-[#182033] border-t border-[#e3e7ef] dark:border-slate-800 p-2.5 px-3 sm:px-4 flex flex-col sm:flex-row items-center gap-2">
                <form onSubmit={handleCustomSubmit} className="w-full flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={customInput}
                      onChange={(e) => setCustomInput(e.target.value)}
                      placeholder="Dán link YouTube (video, livestream, shorts...) để phát trực tiếp..."
                      className="w-full bg-white dark:bg-slate-900 border border-[#e3e7ef] dark:border-slate-700 rounded-xl px-3 py-1.5 text-[12px] text-[#182033] dark:text-white placeholder-[#94a3b8] focus:outline-none focus:border-[#ff315f] focus:ring-1 focus:ring-[#ff315f] transition-all pl-8.5"
                    />
                    <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#94a3b8] size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  </div>
                  <button
                    type="submit"
                    className="bg-[#ff315f] hover:bg-[#e02650] text-white px-3.5 py-1.5 rounded-xl text-[12px] font-bold shrink-0 transition-all shadow-xs active:scale-95 flex items-center gap-1 cursor-pointer"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                    <span>Phát video</span>
                  </button>
                </form>
                {inputError && (
                  <p className="text-red-500 text-[11px] font-medium w-full text-left">{inputError}</p>
                )}
              </div>
            </div>

            {/* Rundown & Playlist Sidebar (4 cols on Desktop) */}
            <div className="lg:col-span-4 bg-white dark:bg-[#1c1c1e] border-t lg:border-t-0 lg:border-l border-[#e3e7ef] dark:border-[#38383a] flex flex-col h-full max-h-[520px]">
              
              {/* Category Filter Tabs */}
              <div className="p-2 border-b border-[#e3e7ef] dark:border-[#38383a] flex items-center gap-1 overflow-x-auto no-scrollbar shrink-0 bg-[#f8fafc] dark:bg-[#2c2c2e]">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveTab(cat)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all cursor-pointer ${activeTab === cat ? 'bg-[#ff315f] text-white shadow-xs' : 'bg-white dark:bg-slate-800 text-[#5f687b] dark:text-slate-300 border border-[#e3e7ef] dark:border-slate-700 hover:bg-[#f4f6fa]'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Playlist Header */}
              <div className="px-3.5 py-2 bg-white dark:bg-[#1c1c1e] border-b border-[#e3e7ef] dark:border-[#38383a] flex items-center justify-between">
                <span className="text-[12px] font-bold text-[#182033] dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="8" y1="8" x2="16" y2="8"/><line x1="8" y1="16" x2="14" y2="16"/></svg>
                  Danh sách phát ({filteredPlaylist.length})
                </span>
                <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                  Trực tuyến
                </span>
              </div>

              {/* Playlist Video Items */}
              <div className="flex-1 overflow-y-auto p-2 space-y-1 divide-y divide-[#e3e7ef]/60 dark:divide-slate-800/60">
                {filteredPlaylist.map((item) => {
                  const isCurrent = item.youtubeId === selectedVideo.youtubeId;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedVideo(item)}
                      className={`flex gap-2.5 p-2 rounded-xl transition-all cursor-pointer group pt-2 ${isCurrent ? 'bg-[#fff1f4] dark:bg-red-950/30 border border-[#ff315f]/30' : 'hover:bg-[#f8fafc] dark:hover:bg-slate-800/60 border border-transparent'}`}
                    >
                      {/* Video Thumbnail with play icon */}
                      <div className="relative w-[100px] sm:w-[110px] aspect-video rounded-lg overflow-hidden shrink-0 bg-slate-900 border border-black/10">
                        <img
                          src={item.thumbnail || `https://i.ytimg.com/vi/${item.youtubeId}/hqdefault.jpg`}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                        {/* Play button overlay */}
                        <div className={`absolute inset-0 flex items-center justify-center bg-black/40 ${isCurrent ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isCurrent ? 'bg-[#ff315f] text-white animate-pulse' : 'bg-white/80 text-black'}`}>
                            <svg className="size-3 fill-current ml-0.5" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                          </div>
                        </div>
                        {item.duration && (
                          <span className="absolute bottom-1 right-1 px-1 py-0.2 bg-black/80 text-white text-[9px] font-bold rounded">
                            {item.duration}
                          </span>
                        )}
                      </div>

                      {/* Video Information */}
                      <div className="flex flex-col flex-1 min-w-0 justify-between py-0.5">
                        <div className="flex items-center gap-1 mb-0.5">
                          <span className={`text-[8.5px] font-bold px-1.5 py-0.5 rounded uppercase ${isCurrent ? 'bg-[#ff315f] text-white' : 'bg-[#f4f6fa] dark:bg-slate-800 text-[#5f687b] dark:text-slate-300'}`}>
                            {item.badge}
                          </span>
                          <span className="text-[10px] text-[#5f687b] dark:text-[#a0a6b5] line-clamp-1">
                            {item.channel}
                          </span>
                        </div>
                        <p className={`text-[11.5px] leading-snug line-clamp-2 font-medium transition-colors ${isCurrent ? 'text-[#ff315f] font-bold' : 'text-[#182033] dark:text-slate-200 group-hover:text-[#ff315f]'}`}>
                          {item.title}
                        </p>
                        {isCurrent && (
                          <div className="flex items-center gap-1 mt-1 text-[#ff315f] text-[9.5px] font-bold">
                            <span className="flex gap-0.5 items-end h-2.5">
                              <span className="w-0.5 h-2.5 bg-[#ff315f] animate-[bounce_1s_infinite_100ms]"></span>
                              <span className="w-0.5 h-1.5 bg-[#ff315f] animate-[bounce_1s_infinite_200ms]"></span>
                              <span className="w-0.5 h-3 bg-[#ff315f] animate-[bounce_1s_infinite_300ms]"></span>
                            </span>
                            <span>ĐANG PHÁT</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>

          </div>

        </div>
      </div>

      {/* ── Floating Mini-TV ── */}
      {isMini && (
        <div className="fixed bottom-12 right-4 md:right-6 z-[995] w-[280px] sm:w-[340px] bg-[#0a0f1d] rounded-2xl border-2 border-[#ff315f] shadow-[0_12px_40px_rgba(0,0,0,0.6)] overflow-hidden animate-in slide-in-from-bottom-6 duration-300">
          <div className="px-3 py-1.5 bg-[#182033] flex items-center justify-between text-white border-b border-white/10">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="w-2 h-2 rounded-full bg-[#ff315f] animate-ping"></span>
              <span className="font-bold text-[11px] uppercase tracking-wider line-clamp-1">
                {selectedVideo.channel}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsMini(false)}
                className="w-5 h-5 rounded hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white"
                title="Phóng to lại"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
              </button>
              <button
                onClick={() => setIsMini(false)}
                className="w-5 h-5 rounded hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white"
                title="Đóng"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
          </div>

          <div className="w-full aspect-video relative bg-black">
            <iframe
              title={selectedVideo.title}
              src={`https://www.youtube.com/embed/${selectedVideo.youtubeId}?autoplay=1&mute=${isMuted ? 1 : 0}&playsinline=1`}
              className="w-full h-full border-0 absolute inset-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          </div>

          <div className="px-3 py-1.5 bg-[#0f172a] text-[11px] text-slate-300 line-clamp-1 border-t border-white/10">
            {selectedVideo.title}
          </div>
        </div>
      )}
    </>
  );
}
