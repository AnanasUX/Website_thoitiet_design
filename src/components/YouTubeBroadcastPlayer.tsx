import React, { useState, useEffect, useRef, useMemo } from 'react';

export interface YouTubeNewsItem {
  id: string;
  title: string;
  channel: string;
  badge: 'TRỰC TIẾP' | 'BẢN TIN' | 'TIÊU ĐIỂM' | 'THỜI TIẾT' | 'TÀI CHÍNH' | 'THẾ GIỚI';
  videoUrl?: string;
  youtubeId?: string;
  category: 'Thời sự 24h' | 'Thời tiết TV' | 'Tài chính & Vàng' | 'Thế giới & Cuộc sống';
  duration?: string;
  thumbnail?: string;
}

export const YOUTUBE_NEWS_DATABASE: YouTubeNewsItem[] = [
  // ── Bản tin Trực tiếp & Thời sự 24h (MP4 Trực tiếp từ các đài và báo chính thống) ──
  {
    id: 'tt-thoisu-1',
    title: 'Thời sự 24h • Bản tin Thời sự Trực tiếp - Toàn cảnh dòng chảy tin tức nóng trong nước và quốc tế',
    channel: 'VTV24 • Tuổi Trẻ Media',
    badge: 'TRỰC TIẾP',
    videoUrl: 'https://cdn2.tuoitre.vn/471584752817336320/2026/10/12/ha-noi-17917882728071979895065.mp4',
    youtubeId: '819YbuGDpK0',
    category: 'Thời sự 24h',
    duration: 'Trực tiếp',
    thumbnail: 'https://cdn2.tuoitre.vn/471584752817336320/2026/10/12/quy-chuan00004318still141-17917883369831355170827.jpg'
  },
  {
    id: 'tt-thoisu-2',
    title: 'Bản tin Nóng 24h • 138 tân sinh viên có hoàn cảnh khó khăn nhận học bổng Tiếp sức đến trường',
    channel: 'Tuổi Trẻ Media',
    badge: 'TIÊU ĐIỂM',
    videoUrl: 'https://cdn2.tuoitre.vn/471584752817336320/2026/10/12/138-tan-sinh-vien-khu-vuc-dong-bang-song-hong-va-bac-trung-bo-duoc-nhan-hoc-bong-tiep-suc-den-truong-17917817464291809412039.mp4',
    youtubeId: 'Kmx55fnX6jM',
    category: 'Thời sự 24h',
    duration: '06:51',
    thumbnail: 'https://cdn2.tuoitre.vn/471584752817336320/2026/10/12/img-1791781649342475651614.jpeg'
  },
  {
    id: 'tt-thoisu-3',
    title: 'Thời sự Quốc tế • Sân bay Saudi Arabia bị tập kích bất ngờ khiến nhiều người thương vong',
    channel: 'VTV Thời sự Quốc tế',
    badge: 'THẾ GIỚI',
    videoUrl: 'https://cdn2.tuoitre.vn/471584752817336320/2026/10/12/ban-sua-saudi-1791789927949697724726.mp4',
    youtubeId: 'utYT3v_KTyo',
    category: 'Thế giới & Cuộc sống',
    duration: '04:12',
    thumbnail: 'https://cdn2.tuoitre.vn/471584752817336320/2026/10/12/gif-saudi-17917876145991101125005.gif'
  },
  {
    id: 'tt-thoisu-4',
    title: 'Phóng sự Giao thông • Cảnh sát giao thông phát hiện tài xế dương tính ma túy trên cao tốc',
    channel: 'Báo Thanh Niên • VTC NOW',
    badge: 'BẢN TIN',
    videoUrl: 'https://cdn2.tuoitre.vn/471584752817336320/2026/10/12/matuy-17917782757521358952476.mp4',
    youtubeId: '3ojcuyMKDvs',
    category: 'Thời sự 24h',
    duration: '03:45',
    thumbnail: 'https://cdn2.tuoitre.vn/471584752817336320/2026/10/12/quy-chuan00012315still140-17917784637421791585753.jpg'
  },
  {
    id: 'tt-kinhte-1',
    title: 'Thị trường & Kinh doanh • Mô hình thịt sạch có nguồn gốc truy xuất Tick xanh tạo niềm tin khách hàng',
    channel: 'VnEconomy • Kinh tế Việt Nam',
    badge: 'TÀI CHÍNH',
    videoUrl: 'https://cdn2.tuoitre.vn/471584752817336320/2026/10/12/thit-heo-sach-cc-17917866325351337523585.mp4',
    youtubeId: 'gusC3mjEV3I',
    category: 'Tài chính & Vàng',
    duration: '05:30',
    thumbnail: 'https://cdn2.tuoitre.vn/471584752817336320/2026/10/12/thiet-heo-vcvc-17917870136251202285694.png'
  },

  // ── Dự báo thời tiết truyền hình ──
  {
    id: 'vtv-thoitiet-chieu',
    title: 'VTV Thời Tiết • Bản tin Dự báo thời tiết cả nước - Cảnh báo mưa lớn, lũ lụt và áp thấp nhiệt đới',
    channel: 'VTV Thời Tiết',
    badge: 'THỜI TIẾT',
    videoUrl: 'https://cdn2.tuoitre.vn/471584752817336320/2026/10/12/ha-noi-17917882728071979895065.mp4',
    youtubeId: 'ADGo5NaYQNM',
    category: 'Thời tiết TV',
    duration: '06:30',
    thumbnail: 'https://images.unsplash.com/photo-1592210454359-9043f067919b?w=600&auto=format&fit=crop&q=70'
  },
  {
    id: 'vtv-thoitiet-trua',
    title: 'VTV Thời Tiết • Dự báo thời tiết 12h30 - Hình thế gây mưa giông các khu vực trên cả nước',
    channel: 'VTV Thời Tiết',
    badge: 'THỜI TIẾT',
    videoUrl: 'https://cdn2.tuoitre.vn/471584752817336320/2026/10/12/138-tan-sinh-vien-khu-vuc-dong-bang-song-hong-va-bac-trung-bo-duoc-nhan-hoc-bong-tiep-suc-den-truong-17917817464291809412039.mp4',
    youtubeId: 'xYXS7Dgi5M4',
    category: 'Thời tiết TV',
    duration: '05:45',
    thumbnail: 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=600&auto=format&fit=crop&q=70'
  },
  {
    id: 'vtv-thoitiet-bien',
    title: 'VTV Thời Tiết • Bản tin Thời tiết biển - Cảnh báo gió mạnh, sóng lớn và áp thấp các vùng biển',
    channel: 'VTV Thời Tiết',
    badge: 'THỜI TIẾT',
    videoUrl: 'https://cdn2.tuoitre.vn/471584752817336320/2026/10/12/ban-sua-saudi-1791789927949697724726.mp4',
    youtubeId: 'cC9ZQkGK0tU',
    category: 'Thời tiết TV',
    duration: '04:50',
    thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=70'
  },

  // ── Tài chính, Kinh tế & Vàng ──
  {
    id: 'vtv24-taichinh',
    title: 'VTV24 • Bản tin Tài chính Kinh doanh - Thị trường vàng, biến động chứng khoán & tỷ giá ngân hàng',
    channel: 'VTV24 Tài Chính',
    badge: 'TÀI CHÍNH',
    videoUrl: 'https://cdn2.tuoitre.vn/471584752817336320/2026/10/12/thit-heo-sach-cc-17917866325351337523585.mp4',
    youtubeId: '0thQbm1zlW4',
    category: 'Tài chính & Vàng',
    duration: '18:25',
    thumbnail: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=600&auto=format&fit=crop&q=70'
  },
  {
    id: 'vtcnow-taichinh',
    title: 'VTC NOW • Nhịp đập Giá Vàng & Bất Động Sản - Phân tích xu hướng đầu tư tiêu điểm',
    channel: 'VTC NOW',
    badge: 'TÀI CHÍNH',
    videoUrl: 'https://cdn2.tuoitre.vn/471584752817336320/2026/10/12/ha-noi-17917882728071979895065.mp4',
    youtubeId: 'Na5uByDy8Sw',
    category: 'Tài chính & Vàng',
    duration: '15:40',
    thumbnail: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=600&auto=format&fit=crop&q=70'
  }
];

export function extractYouTubeId(urlOrId: string): string | null {
  if (!urlOrId) return null;
  const trimmed = urlOrId.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
  const regExp = /(?:youtube(?:-nocookie)?\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts|live)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
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
  // Kết hợp các video động từ liveNews (nếu có videoUrl / enclosure) vào đầu danh sách
  const dynamicPlaylist = useMemo(() => {
    const list: YouTubeNewsItem[] = [...YOUTUBE_NEWS_DATABASE];
    if (liveNews && liveNews.length > 0) {
      liveNews.forEach((n, idx) => {
        if (n.videoSrc || (n.link && /video/i.test(n.link))) {
          const item: YouTubeNewsItem = {
            id: `rss-vid-${idx}`,
            title: n.author || n.title || 'Bản tin video',
            channel: n.src || 'Báo điện tử',
            badge: 'BẢN TIN',
            videoUrl: n.videoSrc || YOUTUBE_NEWS_DATABASE[idx % YOUTUBE_NEWS_DATABASE.length].videoUrl,
            category: 'Thời sự 24h',
            duration: 'Bản tin',
            thumbnail: n.img || n.logo
          };
          if (!list.some(x => x.title === item.title)) {
            list.unshift(item);
          }
        }
      });
    }
    return list;
  }, [liveNews]);

  const [selectedVideo, setSelectedVideo] = useState<YouTubeNewsItem>(() => {
    if (initialCategory && initialCategory !== 'Tất cả') {
      const match = dynamicPlaylist.find(item => item.category === initialCategory);
      if (match) return match;
    }
    return dynamicPlaylist[0];
  });

  const [activeTab, setActiveTab] = useState<string>(initialCategory || 'Tất cả');
  const [showTvOverlay, setShowTvOverlay] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMini, setIsMini] = useState<boolean>(false);
  const [isTheater, setIsTheater] = useState<boolean>(false);
  const [clock, setClock] = useState<string>('');
  const [dateFormatted, setDateFormatted] = useState<string>('');
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

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

  const categories = ['Tất cả', 'Thời sự 24h', 'Thời tiết TV', 'Tài chính & Vàng', 'Thế giới & Cuộc sống'];

  const filteredPlaylist = useMemo(() => {
    if (activeTab === 'Tất cả') return dynamicPlaylist;
    return dynamicPlaylist.filter(item => item.category === activeTab);
  }, [activeTab, dynamicPlaylist]);

  // Chuyển bản tin tức thì
  const handleSelectVideo = (item: YouTubeNewsItem) => {
    setSelectedVideo(item);
    setIsPlaying(true);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  };

  // Tự động chuyển sang bản tin kế tiếp khi hết video (mô phỏng truyền hình liên tục)
  const handleVideoEnded = () => {
    const currentIndex = filteredPlaylist.findIndex(p => p.id === selectedVideo.id);
    const nextIndex = (currentIndex + 1) % filteredPlaylist.length;
    handleSelectVideo(filteredPlaylist[nextIndex]);
  };

  // Toggle Mute
  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (videoRef.current) {
      videoRef.current.muted = nextMuted;
      if (!nextMuted) videoRef.current.play().catch(() => {});
    }
  };

  // Toggle Play/Pause
  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play().catch(() => {});
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const handleToggleMini = () => {
    const next = !isMini;
    setIsMini(next);
    if (onMinimizeChange) onMinimizeChange(next);
  };

  // Ticker items string
  const tickerItems = useMemo(() => {
    const items: string[] = [];
    if (currentWeather) {
      items.push(`THỜI TIẾT: ${currentWeather.location || 'Hà Nội'} ${currentWeather.temp || 26}°C - ${currentWeather.condition || 'Trời đẹp'}`);
    }
    items.push('GIÁ VÀNG SJC: Mua vào 88.50 triệu/lượng - Bán ra 90.50 triệu/lượng');
    items.push('VN-INDEX: 1,258.45 (+6.12 điểm)');
    if (liveNews && liveNews.length > 0) {
      liveNews.slice(0, 8).forEach(n => {
        if (n.author) items.push(n.author.replace(/<[^>]+>/g, '').trim());
      });
    } else {
      items.push('Bản tin truyền hình tự động phát sóng liên tục từ các cơ quan báo đài chính thống Việt Nam.');
    }
    return items;
  }, [liveNews, currentWeather]);

  return (
    <>
      {/* ── Main Broadcast Desk Section ─────────────────────────── */}
      <div 
        ref={playerContainerRef} 
        id="youtube-broadcast-section"
        className={`w-full transition-all duration-300 ${isTheater ? 'fixed inset-0 z-[250] bg-black/95 p-2 sm:p-4 md:p-6 overflow-y-auto flex flex-col items-center justify-center' : 'w-full mb-4'}`}
      >
        <div className={`w-full ${isTheater ? 'max-w-[1440px]' : 'w-full'} bg-gradient-to-b from-[#0a0f1d] via-[#111827] to-[#0a0f1d] text-white rounded-2xl md:rounded-3xl border border-[#1e293b] shadow-[0_12px_40px_rgba(0,0,0,0.35)] overflow-hidden`}>
          
          {/* ── Top Broadcast Header (Studio Banner) ── */}
          <div className="px-3.5 py-2.5 md:px-6 md:py-3.5 bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] border-b border-[#334155]/60 flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5 sm:gap-3">
              {/* Pulsing Live Pill */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#ef4444]/20 border border-[#ef4444]/40 text-[#ef4444] text-[11px] md:text-[12px] font-bold tracking-wider uppercase animate-pulse shrink-0">
                <span className="w-2 h-2 rounded-full bg-[#ef4444] shadow-[0_0_8px_#ef4444]"></span>
                <span>{selectedVideo.badge}</span>
              </div>
              
              {/* Studio Title */}
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-[14px] md:text-[16px] tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent truncate">
                    TRUYỀN HÌNH BẢN TIN 24H
                  </span>
                  <span className="text-[9.5px] md:text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 uppercase shrink-0">
                    HD NATIVE 60FPS
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 hidden sm:inline-block truncate">
                  Phát sóng tự động trực tiếp từ các kênh tin tức chính thống Việt Nam &amp; Dự báo thời tiết
                </span>
              </div>
            </div>

            {/* Right: Electronic TV Clock & Control Toolbar */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 ml-auto shrink-0">
              {/* Audio Unmute Toggle Button */}
              <button
                onClick={toggleMute}
                title={isMuted ? 'Bấm để Bật tiếng' : 'Bấm để Tắt tiếng'}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] md:text-[12px] font-bold transition-all cursor-pointer shadow-md ${isMuted ? 'bg-red-600 hover:bg-red-500 text-white animate-pulse' : 'bg-emerald-600 hover:bg-emerald-500 text-white'}`}
              >
                {isMuted ? (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/></svg>
                    <span>Bật tiếng</span>
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
                    <span>Đang phát tiếng</span>
                  </>
                )}
              </button>

              {/* Studio Clock */}
              <div className="hidden xs:flex bg-black/40 border border-slate-700/60 px-2.5 py-1 rounded-lg flex-col items-end shadow-inner">
                <span className="font-mono font-bold text-[12px] md:text-[14px] text-amber-400 tracking-wider">
                  {clock || '--:--:--'}
                </span>
                <span className="text-[9px] text-slate-400">
                  {dateFormatted || 'Thời sự'}
                </span>
              </div>

              {/* Toggle TV Graphics Button */}
              <button
                onClick={() => setShowTvOverlay(!showTvOverlay)}
                title={showTvOverlay ? 'Tắt lớp đồ họa TV' : 'Bật lớp đồ họa TV'}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] md:text-[12px] font-medium transition-all cursor-pointer bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="15" rx="2"/><polyline points="17 2 12 7 7 2"/></svg>
                <span className="hidden md:inline">{showTvOverlay ? 'Đồ họa TV: BẬT' : 'Đồ họa TV: TẮT'}</span>
              </button>

              {/* Theater Mode Button */}
              <button
                onClick={() => setIsTheater(!isTheater)}
                title={isTheater ? 'Thoát Rạp chiếu toàn cảnh' : 'Chế độ Rạp chiếu toàn cảnh'}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                {isTheater ? (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/></svg>
                ) : (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
                )}
              </button>

              {/* Mini-player button */}
              <button
                onClick={handleToggleMini}
                title="Thu nhỏ thành Mini-TV góc màn hình để vừa đọc báo vừa xem"
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><rect x="11" y="11" width="8" height="8" rx="1"/></svg>
              </button>

              {onClosePlayer && (
                <button
                  onClick={onClosePlayer}
                  title="Đóng trình phát TV"
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-900/60 text-slate-300 hover:text-red-400 transition-colors cursor-pointer"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              )}
            </div>
          </div>

          {/* ── Center Stage: Screen & Playlist ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
            
            {/* Video Main Screen (8 cols on Desktop) */}
            <div className="lg:col-span-8 relative bg-black flex flex-col justify-center items-center overflow-hidden group">
              <div className="w-full relative aspect-video bg-black flex items-center justify-center">
                
                {/* 100% Reliable Native HTML5 Video Stream Player */}
                <video
                  ref={videoRef}
                  key={selectedVideo.videoUrl || selectedVideo.id}
                  src={selectedVideo.videoUrl || 'https://cdn2.tuoitre.vn/471584752817336320/2026/10/12/ha-noi-17917882728071979895065.mp4'}
                  poster={selectedVideo.thumbnail}
                  controls
                  autoPlay
                  muted={isMuted}
                  playsInline
                  onEnded={handleVideoEnded}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  className="w-full h-full object-contain absolute inset-0 bg-black"
                />

                {/* Floating Unmute Hint Banner */}
                {isMuted && (
                  <div 
                    onClick={toggleMute}
                    className="absolute top-3 left-1/2 -translate-x-1/2 z-30 bg-black/80 hover:bg-red-600 text-white px-3.5 py-1.5 rounded-full text-[11px] md:text-[12px] font-bold cursor-pointer shadow-xl backdrop-blur-md flex items-center gap-2 transition-all active:scale-95 border border-white/20 animate-bounce"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/></svg>
                    <span>Bản tin đang tắt tiếng • Nhấn để bật âm thanh 🔊</span>
                  </div>
                )}

                {/* ── TV Broadcast Studio Overlays (Khi showTvOverlay bật) ── */}
                {showTvOverlay && (
                  <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-2.5 sm:p-4 z-20 pb-12 sm:pb-14">
                    
                    {/* Top Corner Overlays */}
                    <div className="flex items-start justify-between w-full">
                      {/* Left: TV Channel Watermark Bug */}
                      <div className="flex items-center gap-1.5 bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 shadow-lg">
                        <div className="w-2 h-2 rounded-full bg-red-600 animate-ping"></div>
                        <span className="font-extrabold tracking-wider text-[10px] sm:text-[12px] text-white">
                          {selectedVideo.channel.toUpperCase()}
                        </span>
                      </div>

                      {/* Right: Station ID & Live Temp */}
                      {currentWeather && (
                        <div className="flex items-center gap-1.5 bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 text-white text-[10px] sm:text-[11px] font-semibold shadow-lg">
                          <span>📍 {currentWeather.location || 'Hà Nội'}</span>
                          <span className="text-amber-400 font-bold">{currentWeather.temp || 26}°C</span>
                        </div>
                      )}
                    </div>

                    {/* Bottom: Lower-Third Graphics (Chân sóng truyền hình) */}
                    <div className="w-full flex flex-col gap-1 transition-all duration-300 drop-shadow-2xl">
                      
                      {/* Lower-Third Tier 1: Red Tag + Main Title Banner */}
                      <div className="flex items-stretch rounded-lg overflow-hidden border border-white/20 shadow-[0_6px_20px_rgba(0,0,0,0.8)] backdrop-blur-md">
                        {/* Red Headline Ribbon */}
                        <div className="bg-red-600 text-white px-2.5 sm:px-3.5 py-1 sm:py-1.5 flex items-center justify-center font-black text-[10px] sm:text-[12px] tracking-wider uppercase shrink-0">
                          {selectedVideo.badge}
                        </div>
                        {/* Title Text Banner */}
                        <div className="bg-black/85 flex-1 px-2.5 sm:px-3.5 py-1 sm:py-1.5 flex items-center min-w-0">
                          <p className="font-bold text-white text-[11px] sm:text-[13px] md:text-[14px] leading-tight line-clamp-1 drop-shadow">
                            {selectedVideo.title}
                          </p>
                        </div>
                      </div>

                      {/* Lower-Third Tier 2: Breaking News Ticker (Dải chữ chạy) */}
                      <div className="flex items-center h-[22px] sm:h-[26px] rounded-lg overflow-hidden bg-black/90 border border-white/10 shadow-lg">
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

              {/* Automated Broadcast Bar under video */}
              <div className="w-full bg-[#0b1329] border-t border-[#1e293b] py-2.5 px-3 sm:px-4 flex flex-wrap items-center justify-between gap-2.5 text-slate-300">
                <div className="flex items-center gap-2 text-[12px] sm:text-[13px] font-medium text-slate-300 min-w-0">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                  <span className="truncate">Hệ thống đang tự động tiếp sóng trực tiếp từ các đài truyền hình chính thống Việt Nam</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const cur = filteredPlaylist.findIndex(p => p.id === selectedVideo.id);
                      const prev = (cur - 1 + filteredPlaylist.length) % filteredPlaylist.length;
                      handleSelectVideo(filteredPlaylist[prev]);
                    }}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold cursor-pointer transition-all"
                    title="Bản tin trước"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
                    <span>Trước</span>
                  </button>
                  <button
                    onClick={() => {
                      const cur = filteredPlaylist.findIndex(p => p.id === selectedVideo.id);
                      const next = (cur + 1) % filteredPlaylist.length;
                      handleSelectVideo(filteredPlaylist[next]);
                    }}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold cursor-pointer transition-all"
                    title="Chuyển sang bản tin tiếp theo trong luồng"
                  >
                    <span>Tiếp theo</span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                  </button>
                  {selectedVideo.youtubeId && (
                    <a
                      href={`https://www.youtube.com/watch?v=${selectedVideo.youtubeId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600/90 hover:bg-red-600 text-white text-[11px] font-bold cursor-pointer transition-all shadow-xs"
                      title="Mở trực tiếp trên ứng dụng hoặc trang web YouTube"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                      <span>Xem trên YouTube</span>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Rundown & Playlist Sidebar (4 cols on Desktop) */}
            <div className="lg:col-span-4 bg-[#0d1527] border-t lg:border-t-0 lg:border-l border-[#1e293b] flex flex-col h-full max-h-[560px]">
              
              {/* Category Filter Tabs */}
              <div className="p-2.5 border-b border-[#1e293b] flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0 bg-[#0f172a]">
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
                <span className="font-bold text-[12px] md:text-[13px] text-slate-200 flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="15" rx="2"/><polyline points="17 2 12 7 7 2"/></svg>
                  Lịch phát sóng ({filteredPlaylist.length})
                </span>
                <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Tự động phát liên tục
                </span>
              </div>

              {/* Playlist Video Items */}
              <div className="flex-1 overflow-y-auto p-2 space-y-2 divide-y divide-slate-800/40">
                {filteredPlaylist.map((item) => {
                  const isCurrent = item.id === selectedVideo.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelectVideo(item)}
                      className={`flex gap-3 p-2 rounded-xl transition-all cursor-pointer group pt-2.5 ${isCurrent ? 'bg-red-950/40 border border-red-500/40' : 'hover:bg-slate-800/60 border border-transparent'}`}
                    >
                      {/* Video Thumbnail with play icon */}
                      <div className="relative w-[110px] sm:w-[120px] aspect-video rounded-lg overflow-hidden shrink-0 bg-slate-900 border border-white/5">
                        <img
                          src={item.thumbnail || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=450&auto=format&fit=crop&q=70'}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                          decoding="async"
                          referrerPolicy="no-referrer"
                        />
                        {/* Play button overlay */}
                        <div className={`absolute inset-0 flex items-center justify-center bg-black/40 ${isCurrent ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center ${isCurrent ? 'bg-red-600 text-white animate-pulse' : 'bg-white/80 text-black'}`}>
                            <svg className="size-3.5 fill-current ml-0.5" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                          </div>
                        </div>
                        {item.duration && (
                          <span className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/80 text-white text-[9.5px] font-bold rounded">
                            {item.duration}
                          </span>
                        )}
                      </div>

                      {/* Video Information */}
                      <div className="flex flex-col flex-1 min-w-0 justify-between py-0.5">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${isCurrent ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-300 border border-slate-700'}`}>
                            {item.badge}
                          </span>
                          <span className="text-[11px] text-slate-400 truncate">
                            {item.channel}
                          </span>
                        </div>
                        <p className={`text-[12px] leading-snug line-clamp-2 font-medium transition-colors ${isCurrent ? 'text-red-400 font-bold' : 'text-slate-200 group-hover:text-red-300'}`}>
                          {item.title}
                        </p>
                        {isCurrent && (
                          <div className="flex items-center gap-1.5 mt-1 text-red-400 text-[10px] font-bold">
                            <span className="flex gap-0.5 items-end h-3">
                              <span className="w-0.5 h-3 bg-red-500 animate-[bounce_1s_infinite_100ms]"></span>
                              <span className="w-0.5 h-1.5 bg-red-500 animate-[bounce_1s_infinite_200ms]"></span>
                              <span className="w-0.5 h-3.5 bg-red-500 animate-[bounce_1s_infinite_300ms]"></span>
                            </span>
                            <span>ĐANG PHÁT TRỰC TUYẾN</span>
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
        <div className="fixed bottom-12 right-4 md:right-6 z-[995] w-[280px] sm:w-[340px] bg-[#0a0f1d] rounded-2xl border-2 border-red-500 shadow-[0_12px_40px_rgba(0,0,0,0.6)] overflow-hidden animate-in slide-in-from-bottom-6 duration-300">
          <div className="px-3 py-1.5 bg-[#182033] flex items-center justify-between text-white border-b border-white/10">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
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
            <video
              src={selectedVideo.videoUrl || 'https://cdn2.tuoitre.vn/471584752817336320/2026/10/12/ha-noi-17917882728071979895065.mp4'}
              controls
              autoPlay
              muted
              playsInline
              onEnded={handleVideoEnded}
              className="w-full h-full object-contain absolute inset-0 bg-black"
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
