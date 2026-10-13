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
  likes?: number;
}

export const YOUTUBE_NEWS_DATABASE: YouTubeNewsItem[] = [
  // ── Bản tin Shorts Thời sự & Video Nóng (Định dạng dọc 9:16 chuẩn Shorts) ──
  {
    id: 'tt-thoisu-1',
    title: 'Thời sự 24h • Bị nhắc nhở vì chèn ép khi xin đường, người đàn ông đi xe máy chặn đầu ô tô',
    channel: 'Tuổi Trẻ Shorts',
    badge: 'TRỰC TIẾP',
    videoUrl: 'https://cdn2.tuoitre.vn/471584752817336320/2026/10/12/ha-noi-17917882728071979895065.mp4',
    youtubeId: '819YbuGDpK0',
    category: 'Thời sự 24h',
    duration: '0:58',
    thumbnail: 'https://cdn2.tuoitre.vn/471584752817336320/2026/10/12/quy-chuan00004318still141-17917883369831355170827.jpg',
    likes: 1240
  },
  {
    id: 'tt-thoisu-2',
    title: 'Ấm lòng mùa tựu trường • 138 tân sinh viên nghèo vượt khó nhận học bổng Tiếp sức đến trường',
    channel: 'VTV24 • Tuổi Trẻ Media',
    badge: 'TIÊU ĐIỂM',
    videoUrl: 'https://cdn2.tuoitre.vn/471584752817336320/2026/10/12/138-tan-sinh-vien-khu-vuc-dong-bang-song-hong-va-bac-trung-bo-duoc-nhan-hoc-bong-tiep-suc-den-truong-17917817464291809412039.mp4',
    youtubeId: 'Kmx55fnX6jM',
    category: 'Thời sự 24h',
    duration: '1:15',
    thumbnail: 'https://cdn2.tuoitre.vn/471584752817336320/2026/10/12/img-1791781649342475651614.jpeg',
    likes: 3820
  },
  {
    id: 'tt-thoisu-3',
    title: 'Tin quốc tế khẩn • Hiện trường sân bay Saudi Arabia bị tập kích bất ngờ khiến nhiều người thương vong',
    channel: 'VTV Thời sự Quốc tế',
    badge: 'THẾ GIỚI',
    videoUrl: 'https://cdn2.tuoitre.vn/471584752817336320/2026/10/12/ban-sua-saudi-1791789927949697724726.mp4',
    youtubeId: 'utYT3v_KTyo',
    category: 'Thế giới & Cuộc sống',
    duration: '0:42',
    thumbnail: 'https://cdn2.tuoitre.vn/471584752817336320/2026/10/12/gif-saudi-17917876145991101125005.gif',
    likes: 915
  },
  {
    id: 'tt-thoisu-4',
    title: 'Nóng trên cao tốc • Cảnh sát giao thông phát hiện tài xế dương tính ma túy khi đang lưu thông',
    channel: 'Báo Thanh Niên Shorts',
    badge: 'BẢN TIN',
    videoUrl: 'https://cdn2.tuoitre.vn/471584752817336320/2026/10/12/matuy-17917782757521358952476.mp4',
    youtubeId: '3ojcuyMKDvs',
    category: 'Thời sự 24h',
    duration: '0:50',
    thumbnail: 'https://cdn2.tuoitre.vn/471584752817336320/2026/10/12/quy-chuan00012315still140-17917784637421791585753.jpg',
    likes: 1840
  },
  {
    id: 'tt-kinhte-1',
    title: 'Tiêu dùng thông minh • Sạp thịt sạch có Tick xanh truy xuất nguồn gốc hút khách mua online',
    channel: 'VnEconomy Media',
    badge: 'TÀI CHÍNH',
    videoUrl: 'https://cdn2.tuoitre.vn/471584752817336320/2026/10/12/thit-heo-sach-cc-17917866325351337523585.mp4',
    youtubeId: 'gusC3mjEV3I',
    category: 'Tài chính & Vàng',
    duration: '1:05',
    thumbnail: 'https://cdn2.tuoitre.vn/471584752817336320/2026/10/12/thiet-heo-vcvc-17917870136251202285694.png',
    likes: 670
  },

  // ── Dự báo thời tiết Shorts TV ──
  {
    id: 'vtv-thoitiet-chieu',
    title: 'Thời tiết 60s • Dự báo thời tiết cả nước - Cảnh báo mưa lớn, lũ quét và đợt không khí lạnh mới',
    channel: 'VTV Thời Tiết Shorts',
    badge: 'THỜI TIẾT',
    videoUrl: 'https://cdn2.tuoitre.vn/471584752817336320/2026/10/12/ha-noi-17917882728071979895065.mp4',
    youtubeId: 'ADGo5NaYQNM',
    category: 'Thời tiết TV',
    duration: '0:59',
    thumbnail: 'https://images.unsplash.com/photo-1592210454359-9043f067919b?w=600&auto=format&fit=crop&q=70',
    likes: 2150
  },
  {
    id: 'vtv-thoitiet-trua',
    title: 'Bản tin nhanh • Hình thế gây mưa giông cục bộ và chỉ số tia UV tại các thành phố lớn',
    channel: 'VTV Thời Tiết',
    badge: 'THỜI TIẾT',
    videoUrl: 'https://cdn2.tuoitre.vn/471584752817336320/2026/10/12/138-tan-sinh-vien-khu-vuc-dong-bang-song-hong-va-bac-trung-bo-duoc-nhan-hoc-bong-tiep-suc-den-truong-17917817464291809412039.mp4',
    youtubeId: 'xYXS7Dgi5M4',
    category: 'Thời tiết TV',
    duration: '0:48',
    thumbnail: 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=600&auto=format&fit=crop&q=70',
    likes: 1430
  },
  {
    id: 'vtv-thoitiet-bien',
    title: 'Cảnh báo biển • Gió giật mạnh cấp 7-8, sóng lớn nguy hiểm tại khu vực Bắc Biển Đông',
    channel: 'VTV Thời Tiết Biển',
    badge: 'THỜI TIẾT',
    videoUrl: 'https://cdn2.tuoitre.vn/471584752817336320/2026/10/12/ban-sua-saudi-1791789927949697724726.mp4',
    youtubeId: 'cC9ZQkGK0tU',
    category: 'Thời tiết TV',
    duration: '0:55',
    thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=70',
    likes: 980
  },

  // ── Tài chính, Giá Vàng & Thị trường ──
  {
    id: 'vtv24-taichinh',
    title: 'Kinh tế 60s • Giá vàng miếng SJC biến động mạnh, tỷ giá ngân hàng và xu hướng thị trường vốn',
    channel: 'VTV24 Tài Chính',
    badge: 'TÀI CHÍNH',
    videoUrl: 'https://cdn2.tuoitre.vn/471584752817336320/2026/10/12/thit-heo-sach-cc-17917866325351337523585.mp4',
    youtubeId: '0thQbm1zlW4',
    category: 'Tài chính & Vàng',
    duration: '1:02',
    thumbnail: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=600&auto=format&fit=crop&q=70',
    likes: 4100
  },
  {
    id: 'vtcnow-taichinh',
    title: 'Nhịp đập tài chính • Phân tích nhịp tăng của VN-Index và dòng tiền đổ vào các nhóm ngành dẫn dắt',
    channel: 'VTC NOW Thị Trường',
    badge: 'TÀI CHÍNH',
    videoUrl: 'https://cdn2.tuoitre.vn/471584752817336320/2026/10/12/ha-noi-17917882728071979895065.mp4',
    youtubeId: 'Na5uByDy8Sw',
    category: 'Tài chính & Vàng',
    duration: '0:52',
  },
  {
    id: 'tt-thoisu-5',
    title: 'Thời sự 24h • Tiêu điểm công nghệ và các mô hình chuyển đổi số tiêu biểu toàn quốc',
    channel: 'Báo Tuổi Trẻ Media',
    badge: 'TIÊU ĐIỂM',
    videoUrl: 'https://cdn2.tuoitre.vn/471584752817336320/2026/10/12/138-tan-sinh-vien-khu-vuc-dong-bang-song-hong-va-bac-trung-bo-duoc-nhan-hoc-bong-tiep-suc-den-truong-17917817464291809412039.mp4',
    youtubeId: '819YbuGDpK0',
    category: 'Thời sự 24h',
    duration: '1:10',
    thumbnail: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=70',
    likes: 2780
  },
  {
    id: 'tt-thegioi-2',
    title: 'Thế giới toàn cảnh • Những chuyển động địa chính trị đáng chú ý và tác động chuỗi cung ứng',
    channel: 'VTV Thời sự Quốc tế',
    badge: 'THẾ GIỚI',
    videoUrl: 'https://cdn2.tuoitre.vn/471584752817336320/2026/10/12/ban-sua-saudi-1791789927949697724726.mp4',
    youtubeId: 'THldZ31vTvI',
    category: 'Thế giới & Cuộc sống',
    duration: '0:58',
    thumbnail: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=600&auto=format&fit=crop&q=70',
    likes: 3120
  }
];

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
  // Tự động chuyển đổi các bài viết có video trong liveNews thành Shorts
  const dynamicPlaylist = useMemo(() => {
    const list: YouTubeNewsItem[] = [...YOUTUBE_NEWS_DATABASE];
    if (liveNews && liveNews.length > 0) {
      liveNews.forEach((n, idx) => {
        if (n.videoSrc || (n.link && /video/i.test(n.link))) {
          const item: YouTubeNewsItem = {
            id: `rss-short-${idx}`,
            title: n.author || n.title || 'Bản tin video',
            channel: n.src || 'Báo điện tử',
            badge: 'BẢN TIN',
            videoUrl: n.videoSrc || YOUTUBE_NEWS_DATABASE[idx % YOUTUBE_NEWS_DATABASE.length].videoUrl,
            category: 'Thời sự 24h',
            duration: '0:55',
            thumbnail: n.img || n.logo,
            likes: 1000 + (idx * 137) % 5000
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
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [likeCount, setLikeCount] = useState<number>(selectedVideo.likes || 1200);
  const [progress, setProgress] = useState<number>(0);
  const [isMini, setIsMini] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);

  const categories = ['Tất cả', 'Thời sự 24h', 'Thời tiết TV', 'Tài chính & Vàng', 'Thế giới & Cuộc sống'];

  const filteredPlaylist = useMemo(() => {
    if (activeTab === 'Tất cả') return dynamicPlaylist;
    return dynamicPlaylist.filter(item => item.category === activeTab);
  }, [activeTab, dynamicPlaylist]);

  // Cập nhật số like khi đổi video
  useEffect(() => {
    setIsLiked(false);
    setLikeCount(selectedVideo.likes || Math.floor(Math.random() * 2000 + 800));
    setProgress(0);
  }, [selectedVideo.id]);

  // Cập nhật thanh tiến trình chạy mượt
  const handleTimeUpdate = () => {
    if (videoRef.current && videoRef.current.duration) {
      const p = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(p);
    }
  };

  // Chọn video Short
  const handleSelectVideo = (item: YouTubeNewsItem) => {
    setSelectedVideo(item);
    setIsPlaying(true);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  };

  // Tự động chuyển Short tiếp theo khi hết video (vòng lặp feed Shorts)
  const handleNextShort = () => {
    const curIdx = filteredPlaylist.findIndex(p => p.id === selectedVideo.id);
    const nextIdx = (curIdx + 1) % filteredPlaylist.length;
    handleSelectVideo(filteredPlaylist[nextIdx]);
  };

  const handlePrevShort = () => {
    const curIdx = filteredPlaylist.findIndex(p => p.id === selectedVideo.id);
    const prevIdx = (curIdx - 1 + filteredPlaylist.length) % filteredPlaylist.length;
    handleSelectVideo(filteredPlaylist[prevIdx]);
  };

  // Toggle Play / Pause khi bấm vào video
  const handleTogglePlay = () => {
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

  // Toggle Mute
  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (videoRef.current) {
      videoRef.current.muted = nextMuted;
      if (!nextMuted) videoRef.current.play().catch(() => {});
    }
  };

  // Like interaction
  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLiked) {
      setIsLiked(false);
      setLikeCount(c => c - 1);
    } else {
      setIsLiked(true);
      setLikeCount(c => c + 1);
    }
  };

  return (
    <>
      <div 
        ref={playerContainerRef} 
        id="youtube-broadcast-section"
        className="w-full mb-6 flex flex-col gap-5"
      >
        {/* Header Chuyên Mục Shorts */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] p-3.5 sm:p-4 rounded-2xl border border-slate-800 text-white shadow-lg">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600 text-white text-[12px] font-black tracking-wider uppercase shadow-[0_0_12px_rgba(239,68,68,0.5)] animate-pulse">
              <span>⚡ SHORTS</span>
            </div>
            <div>
              <h2 className="font-extrabold text-[16px] sm:text-[18px] tracking-tight text-white flex items-center gap-2">
                Bản Tin Video Shorts 24H
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Lướt xem tức thì</span>
              </h2>
              <p className="text-[11px] sm:text-[12px] text-slate-400">
                Cập nhật dòng chảy thời sự, dự báo thời tiết &amp; tài chính dạng video ngắn 9:16
              </p>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveTab(cat)}
                className={`px-3 py-1.5 rounded-xl text-[12px] font-bold whitespace-nowrap transition-all cursor-pointer ${activeTab === cat ? 'bg-red-600 text-white shadow-md' : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* ── Main Stage: Vertical Shorts Screen (Center) + Rundown Sidebar (Right) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          {/* Cột Trình Phát Video Shorts (9:16 Feed Container) */}
          <div className="lg:col-span-5 xl:col-span-4 flex justify-center w-full">
            <div className="w-full max-w-[380px] aspect-[9/16] relative bg-[#05070e] rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.7)] border-2 border-slate-800 flex flex-col justify-between group select-none">
              
              {/* Native HTML5 Video Element */}
              <video
                ref={videoRef}
                key={selectedVideo.videoUrl || selectedVideo.id}
                src={selectedVideo.videoUrl}
                poster={selectedVideo.thumbnail}
                playsInline
                autoPlay
                muted={isMuted}
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleNextShort}
                onClick={handleTogglePlay}
                className="w-full h-full object-cover absolute inset-0 cursor-pointer"
              />

              {/* Pause / Play Indicator khi tap */}
              {!isPlaying && (
                <div 
                  onClick={handleTogglePlay}
                  className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 cursor-pointer backdrop-blur-xs"
                >
                  <div className="w-16 h-16 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-2xl scale-110 transition-transform">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                  </div>
                </div>
              )}

              {/* Top Video Overlay: Badge & Sound Toggle */}
              <div className="relative z-20 p-3.5 flex items-center justify-between bg-gradient-to-b from-black/80 via-black/30 to-transparent pointer-events-auto">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-white text-[11px] font-bold">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                  <span>{selectedVideo.badge}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={toggleMute}
                    className="p-2 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md border border-white/15 cursor-pointer transition-all active:scale-90"
                    title={isMuted ? "Bật âm thanh" : "Tắt tiếng"}
                  >
                    {isMuted ? (
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/></svg>
                    ) : (
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
                    )}
                  </button>
                  <button
                    onClick={handleNextShort}
                    className="p-2 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md border border-white/15 cursor-pointer transition-all active:scale-90"
                    title="Short tiếp theo"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                  </button>
                </div>
              </div>

              {/* Right Sidebar: Quick Actions (Like, Next, Prev, Share) */}
              <div className="absolute right-3 bottom-24 z-20 flex flex-col items-center gap-3.5 pointer-events-auto">
                {/* Heart / Like Button */}
                <button 
                  onClick={handleLike}
                  className="flex flex-col items-center gap-1 group cursor-pointer"
                >
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-md border transition-all active:scale-125 ${isLiked ? 'bg-red-600 border-red-500 text-white shadow-[0_0_15px_#ef4444]' : 'bg-black/60 border-white/15 text-white hover:bg-black/80'}`}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                  </div>
                  <span className="text-[10px] font-bold text-white drop-shadow">{likeCount}</span>
                </button>

                {/* Short Trước */}
                <button 
                  onClick={handlePrevShort}
                  className="w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 border border-white/15 text-white flex items-center justify-center backdrop-blur-md cursor-pointer transition-all active:scale-90"
                  title="Short trước đó"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="18 15 12 9 6 15"/></svg>
                </button>

                {/* Short Tiếp Theo */}
                <button 
                  onClick={handleNextShort}
                  className="w-10 h-10 rounded-full bg-red-600 hover:bg-red-500 border border-red-400 text-white flex items-center justify-center backdrop-blur-md shadow-lg cursor-pointer transition-all active:scale-90 animate-bounce"
                  title="Lướt Short tiếp theo"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
                </button>
              </div>

              {/* Bottom Video Details Overlay */}
              <div className="relative z-20 p-4 pb-3.5 bg-gradient-to-t from-black/95 via-black/70 to-transparent flex flex-col gap-2 pointer-events-none">
                {/* Channel Pill */}
                <div className="flex items-center gap-2 pointer-events-auto">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center text-white font-black text-[11px] shadow-md border border-white/20">
                    {selectedVideo.channel.charAt(0)}
                  </div>
                  <span className="text-white font-extrabold text-[12px] tracking-wide drop-shadow truncate">
                    {selectedVideo.channel}
                  </span>
                  <span className="text-[10px] bg-red-600/80 text-white font-black px-1.5 py-0.2 rounded">
                    ⚡ 9:16
                  </span>
                </div>

                {/* News Title */}
                <p className="text-white font-bold text-[13px] sm:text-[14px] leading-snug line-clamp-3 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                  {selectedVideo.title}
                </p>

                {/* Thời tiết / Vàng ticker */}
                {currentWeather && (
                  <div className="flex items-center gap-2 text-[10px] text-amber-300 font-semibold drop-shadow">
                    <span>📍 {currentWeather.location || 'Hà Nội'}: {currentWeather.temp || 26}°C</span>
                    <span>• SJC: 90.50 tr/lượng</span>
                  </div>
                )}
              </div>

              {/* Progress bar at the very bottom */}
              <div className="w-full h-1 bg-white/20 relative z-30">
                <div 
                  className="h-full bg-gradient-to-r from-red-600 via-amber-400 to-red-500 transition-all duration-100" 
                  style={{ width: `${progress}%` }}
                />
              </div>

            </div>
          </div>

          {/* Cột Danh Sách Shorts Dạng Lưới 9:16 (Rundown Grid) */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h3 className="font-extrabold text-[#182033] text-[16px] sm:text-[18px] flex items-center gap-2">
                <span className="w-2 h-5 bg-red-600 rounded-full inline-block"></span>
                Kho Video Shorts Mới Nhất ({filteredPlaylist.length})
              </h3>
              <span className="text-[12px] text-[#5f687b] font-medium">Bấm để lướt xem ngay</span>
            </div>

            {/* Grid 9:16 Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3.5">
              {filteredPlaylist.map((item) => {
                const isCurrent = item.id === selectedVideo.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelectVideo(item)}
                    className={`group relative aspect-[9/16] rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300 border-2 ${isCurrent ? 'border-red-600 scale-[1.02] ring-4 ring-red-500/20' : 'border-slate-200 hover:border-red-400'}`}
                  >
                    {/* Thumbnail Image */}
                    <img
                      src={item.thumbnail || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=450&auto=format&fit=crop&q=70'}
                      alt={item.title}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 bg-slate-900"
                      loading="lazy"
                      decoding="async"
                      referrerPolicy="no-referrer"
                    />

                    {/* Dark gradient shadow */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/30 group-hover:from-black/95 transition-all" />

                    {/* Top Tag: Shorts & Duration */}
                    <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10">
                      <span className="px-2 py-0.5 rounded-full bg-red-600 text-white font-black text-[9px] uppercase tracking-wider shadow-md">
                        ⚡ SHORT
                      </span>
                      {item.duration && (
                        <span className="px-1.5 py-0.5 rounded bg-black/70 text-white font-bold text-[9.5px] backdrop-blur-xs">
                          {item.duration}
                        </span>
                      )}
                    </div>

                    {/* Center Animated Play / Equalizer when Current */}
                    {isCurrent ? (
                      <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                        <div className="px-2.5 py-1 rounded-full bg-red-600/90 text-white font-extrabold text-[11px] flex items-center gap-1.5 shadow-lg backdrop-blur-md">
                          <span className="flex gap-0.5 items-end h-3">
                            <span className="w-0.5 h-3 bg-white animate-[bounce_1s_infinite_100ms]"></span>
                            <span className="w-0.5 h-1.5 bg-white animate-[bounce_1s_infinite_200ms]"></span>
                            <span className="w-0.5 h-3.5 bg-white animate-[bounce_1s_infinite_300ms]"></span>
                          </span>
                          <span>ĐANG PHÁT</span>
                        </div>
                      </div>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                        </div>
                      </div>
                    )}

                    {/* Bottom Title & Channel Info */}
                    <div className="absolute bottom-2.5 left-2.5 right-2.5 z-10 flex flex-col gap-1">
                      <span className="text-[10px] text-amber-300 font-bold truncate">
                        {item.channel}
                      </span>
                      <p className="text-white font-bold text-[12px] leading-snug line-clamp-2 drop-shadow group-hover:text-amber-200 transition-colors">
                        {item.title}
                      </p>
                      <div className="flex items-center justify-between text-[10px] text-slate-300 pt-0.5">
                        <span>❤️ {item.likes || 1200}</span>
                        <span className="text-red-400 font-semibold">Xem ngay →</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
