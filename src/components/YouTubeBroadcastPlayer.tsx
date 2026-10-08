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
  // ── Thời sự 24h & Tin tức nóng ──
  {
    id: 'vtv24-chuyendong24h',
    title: 'VTV24 • Bản tin Chuyển Động 24h Mới Nhất - Toàn cảnh dòng chảy tin tức trong ngày',
    channel: 'Trung tâm Tin tức VTV24',
    badge: 'TRỰC TIẾP',
    youtubeId: 'jfKfPfyJRdk',
    category: 'Thời sự 24h',
    duration: '35:20',
    thumbnail: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'vtcnow-thoisu',
    title: 'VTC NOW • Thời sự trực tiếp 24/7 - Cập nhật liên tục tin nóng chính trị, xã hội',
    channel: 'VTC NOW',
    badge: 'TRỰC TIẾP',
    youtubeId: '2iKjP5eZg6c',
    category: 'Thời sự 24h',
    duration: 'Trực tiếp',
    thumbnail: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'thanhnien-tv',
    title: 'Báo Thanh Niên • Bản tin Thời sự Trưa & Chiều - Điểm nóng pháp luật & an ninh trật tự',
    channel: 'Thanh Niên TV',
    badge: 'BẢN TIN',
    youtubeId: 'D_vGf7-U_qM',
    category: 'Thời sự 24h',
    duration: '22:15',
    thumbnail: 'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'tuoitre-tv',
    title: 'Truyền hình Tuổi Trẻ • Tin nhanh 24h - Phóng sự điều tra & Tiêu điểm đời sống đô thị',
    channel: 'Tuổi Trẻ TV',
    badge: 'TIÊU ĐIỂM',
    youtubeId: 'eYq8Gj-W3fI',
    category: 'Thời sự 24h',
    duration: '18:40',
    thumbnail: 'https://images.unsplash.com/photo-1526470608268-f674ce90ebd4?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'tienphong-tv',
    title: 'Báo Tiền Phong • Bản tin Thời sự & Nhịp sống xã hội, Tiếng nói thế hệ trẻ',
    channel: 'Tiền Phong TV',
    badge: 'BẢN TIN',
    youtubeId: 'J---aiyznGQ',
    category: 'Thời sự 24h',
    duration: '15:10',
    thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80'
  },

  // ── Dự báo thời tiết truyền hình ──
  {
    id: 'vtv-thoitiet-homnay',
    title: 'VTV Thời Tiết • Bản tin Dự báo thời tiết cả nước - Cập nhật nhiệt độ và diễn biến mưa giông',
    channel: 'VTV Thời Tiết',
    badge: 'THỜI TIẾT',
    youtubeId: 'V_9w7sU27nQ',
    category: 'Thời tiết TV',
    duration: '06:30',
    thumbnail: 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'vtc14-thoitiet-moitruong',
    title: 'VTC14 • Nhật ký Thời tiết & Môi trường - Cảnh báo triều cường, không khí lạnh và chất lượng không khí',
    channel: 'VTC14',
    badge: 'THỜI TIẾT',
    youtubeId: '4_8Q2G0iYf8',
    category: 'Thời tiết TV',
    duration: '12:45',
    thumbnail: 'https://images.unsplash.com/photo-1516912481808-3406841bd33c?w=600&auto=format&fit=crop&q=80'
  },

  // ── Tài chính - Kinh doanh & Giá vàng ──
  {
    id: 'vtv-money-thitruong',
    title: 'VTV Money • Dòng chảy Tài chính - Thị trường Giá Vàng SJC, Ngoại tệ & Chứng khoán hôm nay',
    channel: 'VTV Money',
    badge: 'TÀI CHÍNH',
    youtubeId: '1Z6F5a3wEis',
    category: 'Tài chính & Vàng',
    duration: '20:10',
    thumbnail: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'vneconomy-taichinh',
    title: 'VnEconomy TV • Nhịp đập Kinh tế - Bất động sản, Lãi suất ngân hàng và Tiêu điểm thị trường vốn',
    channel: 'VnEconomy',
    badge: 'TÀI CHÍNH',
    youtubeId: 'Wn4Hw4f8Uvg',
    category: 'Tài chính & Vàng',
    duration: '16:50',
    thumbnail: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=600&auto=format&fit=crop&q=80'
  },

  // ── Thế giới & Cuộc sống ──
  {
    id: 'vnews-thegioi24h',
    title: 'Truyền hình Thông tấn VNEWS • Bản tin Thế giới 24h - Tiêu điểm địa chính trị & quốc tế nổi bật',
    channel: 'VNEWS',
    badge: 'THẾ GIỚI',
    youtubeId: 'o5Y3iZ69_7E',
    category: 'Thế giới & Cuộc sống',
    duration: '25:00',
    thumbnail: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&auto=format&fit=crop&q=80'
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
      duration: 'Trực tiếp'
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
      items.push(`🌦️ THỜI TIẾT: ${currentWeather.location || 'Hà Nội'} ${currentWeather.temp || 26}°C - ${currentWeather.condition || 'Ổn định'}`);
    }
    items.push('💰 GIÁ VÀNG SJC: Mua vào 88.50 triệu/lượng - Bán ra 90.50 triệu/lượng');
    items.push('📈 VN-INDEX: 1,258.45 (+6.12 điểm)');
    if (liveNews && liveNews.length > 0) {
      liveNews.slice(0, 8).forEach(n => {
        if (n.author) items.push(`⚡ ${n.author.replace(/<[^>]+>/g, '').trim()}`);
      });
    } else {
      items.push('⚡ Bản tin thời sự tổng hợp được cập nhật liên tục 24/7 từ các đầu báo chính thống.');
    }
    return items;
  }, [liveNews, currentWeather]);

  return (
    <>
      {/* ── Main Inline Broadcast Desk Section ─────────────────────────── */}
      <div 
        ref={playerContainerRef} 
        id="youtube-broadcast-section"
        className={`w-full transition-all duration-300 ${isTheater ? 'fixed inset-0 z-[250] bg-black/95 p-4 md:p-8 overflow-y-auto flex flex-col items-center justify-center' : 'mb-6'}`}
      >
        <div className={`w-full ${isTheater ? 'max-w-[1400px]' : 'max-w-full'} bg-gradient-to-b from-[#0a0f1d] via-[#111827] to-[#0a0f1d] rounded-2xl md:rounded-3xl border border-[#1e293b] shadow-[0_12px_40px_rgba(0,0,0,0.35)] overflow-hidden text-white`}>
          
          {/* ── Top Broadcast Header (Studio Banner) ── */}
          <div className="px-4 py-3 md:px-6 md:py-3.5 bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] border-b border-[#334155]/60 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {/* Pulsing Live Pill */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#ef4444]/20 border border-[#ef4444]/40 text-[#ef4444] text-[11px] md:text-[12px] font-bold tracking-wider uppercase animate-pulse">
                <span className="w-2 h-2 rounded-full bg-[#ef4444] shadow-[0_0_8px_#ef4444]"></span>
                <span>{selectedVideo.badge}</span>
              </div>
              
              {/* Studio Title */}
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-[14px] md:text-[16px] tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                    TRUYỀN HÌNH BẢN TIN 24H
                  </span>
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-blue-600/30 text-blue-300 border border-blue-500/30 uppercase">
                    HD LIVE
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 hidden sm:inline-block">
                  Phát sóng trực tiếp từ các kênh tin tức chính thống Việt Nam
                </span>
              </div>
            </div>

            {/* Right: Electronic TV Studio Clock & Quick Controls */}
            <div className="flex items-center gap-2 sm:gap-4 ml-auto">
              <div className="bg-black/40 border border-slate-700/60 px-3 py-1 rounded-lg flex flex-col items-end">
                <span className="font-mono font-bold text-[13px] md:text-[15px] text-amber-400 tracking-wider">
                  {clock || '--:--:--'}
                </span>
                <span className="text-[9px] md:text-[10px] text-slate-400">
                  {dateFormatted || 'Thời sự'}
                </span>
              </div>

              {/* Toggle TV Graphics Button */}
              <button
                onClick={() => setShowTvOverlay(!showTvOverlay)}
                title={showTvOverlay ? 'Tắt lớp đồ họa truyền hình' : 'Bật lớp đồ họa truyền hình'}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[12px] font-medium transition-all cursor-pointer ${showTvOverlay ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'}`}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="15" rx="2" ry="2"></rect><polyline points="17 2 12 7 7 2"></polyline></svg>
                <span className="hidden md:inline">{showTvOverlay ? 'Đồ họa TV: BẬT' : 'Đồ họa TV: TẮT'}</span>
              </button>

              {/* Theater Mode Button */}
              <button
                onClick={() => setIsTheater(!isTheater)}
                title={isTheater ? 'Thoát chế độ Rạp chiếu' : 'Chế độ Rạp chiếu toàn cảnh'}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                {isTheater ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/></svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
                )}
              </button>

              {/* Mini-player button */}
              <button
                onClick={handleToggleMini}
                title="Thu nhỏ thành Mini-TV góc màn hình để vừa đọc báo vừa xem"
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><rect x="11" y="11" width="8" height="8" rx="1"/></svg>
              </button>

              {onClosePlayer && (
                <button
                  onClick={onClosePlayer}
                  title="Đóng trình phát"
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-600 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              )}
            </div>
          </div>

          {/* ── Center Stage: TV News Studio Screen & Playlist ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
            
            {/* Video Main Screen (8 cols on Desktop) */}
            <div className="lg:col-span-8 relative bg-black flex flex-col justify-center items-center overflow-hidden group">
              <div className="w-full relative aspect-video bg-black">
                <iframe
                  title={selectedVideo.title}
                  src={`https://www.youtube-nocookie.com/embed/${selectedVideo.youtubeId}?autoplay=1&mute=0&rel=0&modestbranding=1&playsinline=1`}
                  className="w-full h-full border-0 absolute inset-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />

                {/* ── TV Broadcast Studio Overlays (Khi showTvOverlay bật) ── */}
                {showTvOverlay && (
                  <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-3 md:p-5 z-20">
                    
                    {/* Top Corner Overlays */}
                    <div className="flex items-start justify-between w-full">
                      {/* Left: TV Channel Watermark Bug */}
                      <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 shadow-lg">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping"></div>
                        <span className="font-extrabold tracking-wider text-[11px] md:text-[13px] text-white">
                          {selectedVideo.channel.toUpperCase()}
                        </span>
                      </div>

                      {/* Right: Station ID & Live Temp */}
                      {currentWeather && (
                        <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 text-white text-[11px] md:text-[12px] font-semibold shadow-lg">
                          <span>📍 {currentWeather.location || 'Hà Nội'}</span>
                          <span className="text-amber-400 font-bold">{currentWeather.temp || 26}°C</span>
                        </div>
                      )}
                    </div>

                    {/* Bottom: Lower-Third Graphics (Chân sóng truyền hình) */}
                    <div className="w-full flex flex-col gap-1 transition-all duration-300 drop-shadow-2xl">
                      
                      {/* Lower-Third Tier 1: Red Tag + Main Title Banner */}
                      <div className="flex items-stretch rounded-lg overflow-hidden border border-white/20 shadow-[0_8px_25px_rgba(0,0,0,0.8)] backdrop-blur-md">
                        {/* Red Headline Ribbon */}
                        <div className="bg-gradient-to-r from-[#dc2626] to-[#b91c1c] text-white px-3 md:px-4 py-2 flex items-center justify-center font-black text-[11px] md:text-[13px] tracking-wider uppercase shrink-0">
                          {selectedVideo.badge}
                        </div>
                        {/* Title Text Banner */}
                        <div className="bg-gradient-to-r from-black/85 via-slate-900/85 to-black/75 flex-1 px-3 md:px-4 py-1.5 flex items-center min-w-0">
                          <p className="font-bold text-white text-[12px] md:text-[15px] leading-tight line-clamp-1 drop-shadow">
                            {selectedVideo.title}
                          </p>
                        </div>
                      </div>

                      {/* Lower-Third Tier 2: Breaking News Ticker (Dải chữ chạy) */}
                      <div className="flex items-center h-[26px] md:h-[30px] rounded-lg overflow-hidden bg-black/80 border border-slate-700/60 shadow-lg">
                        <div className="bg-amber-400 text-slate-950 px-2.5 h-full flex items-center justify-center font-black text-[10px] md:text-[11px] tracking-wider uppercase shrink-0">
                          ⚡ TIN NÓNG 24/7
                        </div>
                        <div className="flex-1 overflow-hidden relative h-full flex items-center pl-2">
                          <div className="animate-marquee whitespace-nowrap flex items-center gap-6 text-[11px] md:text-[12px] font-medium text-slate-200">
                            {tickerItems.map((item, idx) => (
                              <span key={idx} className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block"></span>
                                {item}
                              </span>
                            ))}
                            {/* Duplicate for infinite loop */}
                            {tickerItems.map((item, idx) => (
                              <span key={`dup-${idx}`} className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block"></span>
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

              {/* Quick Input Bar under video: Dán link YouTube cá nhân */}
              <div className="w-full bg-[#0b1329] border-t border-[#1e293b] p-3 px-4 flex flex-col sm:flex-row items-center gap-2">
                <form onSubmit={handleCustomSubmit} className="w-full flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={customInput}
                      onChange={(e) => setCustomInput(e.target.value)}
                      placeholder="Dán link YouTube (video, livestream, shorts...) để phát dạng bản tin..."
                      className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2 text-[12px] md:text-[13px] text-white placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all pl-9"
                    />
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  </div>
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-600 text-white px-4 py-2 rounded-xl text-[12px] md:text-[13px] font-bold shrink-0 transition-all shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                    <span>Phát bản tin</span>
                  </button>
                </form>
                {inputError && (
                  <p className="text-red-400 text-[11px] font-medium w-full text-left">{inputError}</p>
                )}
              </div>
            </div>

            {/* Rundown & Playlist Sidebar (4 cols on Desktop) */}
            <div className="lg:col-span-4 bg-[#0d1527] border-t lg:border-t-0 lg:border-l border-[#1e293b] flex flex-col h-full max-h-[560px]">
              
              {/* Category Filter Tabs */}
              <div className="p-3 border-b border-[#1e293b] flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveTab(cat)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] md:text-[12px] font-semibold whitespace-nowrap transition-all cursor-pointer ${activeTab === cat ? 'bg-red-600 text-white shadow-sm' : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Playlist Header */}
              <div className="px-4 py-2.5 bg-[#0f172a] border-b border-[#1e293b] flex items-center justify-between">
                <span className="text-[12px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="8" y1="8" x2="16" y2="8"/><line x1="8" y1="16" x2="14" y2="16"/></svg>
                  Lịch phát sóng ({filteredPlaylist.length})
                </span>
                <span className="text-[11px] text-slate-400">Tự động cập nhật</span>
              </div>

              {/* Playlist Video Items */}
              <div className="flex-1 overflow-y-auto p-2 space-y-2 divide-y divide-slate-800/40">
                {filteredPlaylist.map((item) => {
                  const isCurrent = item.youtubeId === selectedVideo.youtubeId;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedVideo(item)}
                      className={`flex gap-3 p-2 rounded-xl transition-all cursor-pointer group pt-2.5 ${isCurrent ? 'bg-red-950/40 border border-red-500/40 shadow-inner' : 'hover:bg-slate-800/60 border border-transparent'}`}
                    >
                      {/* Video Thumbnail with play icon */}
                      <div className="relative w-[110px] sm:w-[120px] aspect-video rounded-lg overflow-hidden shrink-0 bg-slate-900 border border-white/5">
                        <img
                          src={item.thumbnail || `https://img.youtube.com/vi/${item.youtubeId}/hqdefault.jpg`}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                        {/* Play button overlay */}
                        <div className={`absolute inset-0 flex items-center justify-center bg-black/40 ${isCurrent ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center ${isCurrent ? 'bg-red-600 text-white animate-pulse' : 'bg-white/80 text-black'}`}>
                            <svg className="size-3.5 fill-current ml-0.5" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                          </div>
                        </div>

                        {/* Duration Pill */}
                        <span className="absolute bottom-1 right-1 bg-black/80 px-1 py-0.5 rounded text-[9px] font-mono font-bold text-white">
                          {item.duration || 'Bản tin'}
                        </span>
                      </div>

                      {/* Video Information */}
                      <div className="flex flex-col flex-1 min-w-0 justify-between py-0.5">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase ${isCurrent ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-300'}`}>
                            {item.badge}
                          </span>
                          <span className="text-[11px] text-slate-400 line-clamp-1">
                            {item.channel}
                          </span>
                        </div>
                        <p className={`text-[12px] leading-snug line-clamp-2 font-medium transition-colors ${isCurrent ? 'text-red-400 font-bold' : 'text-slate-200 group-hover:text-white'}`}>
                          {item.title}
                        </p>
                        {isCurrent && (
                          <div className="flex items-center gap-1.5 mt-1 text-red-500 text-[10px] font-bold">
                            <span className="flex gap-0.5 items-end h-3">
                              <span className="w-0.5 h-3 bg-red-500 animate-[bounce_1s_infinite_100ms]"></span>
                              <span className="w-0.5 h-2 bg-red-500 animate-[bounce_1s_infinite_200ms]"></span>
                              <span className="w-0.5 h-3.5 bg-red-500 animate-[bounce_1s_infinite_300ms]"></span>
                            </span>
                            <span>ĐANG PHÁT TRÊN TV</span>
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

      {/* ── Floating Mini-TV (Khung truyền hình thu nhỏ góc màn hình khi cuộn trang) ── */}
      {isMini && (
        <div className="fixed bottom-12 right-4 md:right-6 z-[995] w-[300px] sm:w-[360px] bg-[#0a0f1d] rounded-2xl border-2 border-red-600 shadow-[0_12px_40px_rgba(0,0,0,0.6)] overflow-hidden animate-in slide-in-from-bottom-6 duration-300">
          {/* Mini-TV Header */}
          <div className="px-3 py-1.5 bg-gradient-to-r from-red-600 to-slate-900 flex items-center justify-between text-white">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
              <span className="font-bold text-[11px] uppercase tracking-wider line-clamp-1">
                {selectedVideo.channel}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMini(false)}
                title="Phóng to lại màn hình TV chính"
                className="p-1 hover:bg-white/20 rounded text-white cursor-pointer"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
              </button>
              <button
                onClick={() => {
                  setIsMini(false);
                  if (onClosePlayer) onClosePlayer();
                }}
                title="Đóng bản tin"
                className="p-1 hover:bg-white/20 rounded text-white cursor-pointer"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
          </div>

          {/* Mini-TV Screen */}
          <div className="w-full aspect-video bg-black relative">
            <iframe
              title={selectedVideo.title}
              src={`https://www.youtube-nocookie.com/embed/${selectedVideo.youtubeId}?autoplay=1&mute=0&rel=0`}
              className="w-full h-full border-0 absolute inset-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>

          {/* Mini-TV Footer Title */}
          <div className="px-3 py-1.5 bg-[#0d1527] border-t border-slate-800 text-[11px] text-slate-300 line-clamp-1">
            {selectedVideo.title}
          </div>
        </div>
      )}
    </>
  );
}
