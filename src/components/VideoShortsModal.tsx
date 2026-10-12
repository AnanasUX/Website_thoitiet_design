import React, { useState, useEffect, useRef, useMemo } from 'react';

export interface ShortItem {
  id: string;
  title: string;
  channel: string;
  badge: 'TRỰC TIẾP' | 'BẢN TIN' | 'TIÊU ĐIỂM' | 'THỜI TIẾT' | 'TÀI CHÍNH' | 'THẾ GIỚI';
  videoUrl: string;
  category: 'Thời sự 24h' | 'Thời tiết TV' | 'Tài chính & Vàng' | 'Thế giới & Cuộc sống';
  duration?: string;
  thumbnail?: string;
  likes: number;
  commentsCount?: number;
  sharesCount?: number;
}

export const SHORTS_DATABASE: ShortItem[] = [
  {
    id: 'short-thoisu-1',
    title: 'Thời sự 24h • Bị nhắc nhở vì chèn ép khi xin đường, người đàn ông đi xe máy chặn đầu ô tô',
    channel: 'Tuổi Trẻ Shorts',
    badge: 'TRỰC TIẾP',
    videoUrl: 'https://cdn2.tuoitre.vn/471584752817336320/2026/10/12/ha-noi-17917882728071979895065.mp4',
    category: 'Thời sự 24h',
    duration: '0:58',
    thumbnail: 'https://cdn2.tuoitre.vn/471584752817336320/2026/10/12/quy-chuan00004318still141-17917883369831355170827.jpg',
    likes: 4210,
    commentsCount: 382,
    sharesCount: 145
  },
  {
    id: 'short-thoisu-2',
    title: 'Ấm lòng mùa tựu trường • 138 tân sinh viên nghèo vượt khó nhận học bổng Tiếp sức đến trường',
    channel: 'VTV24 • Tuổi Trẻ Media',
    badge: 'TIÊU ĐIỂM',
    videoUrl: 'https://cdn2.tuoitre.vn/471584752817336320/2026/10/12/138-tan-sinh-vien-khu-vuc-dong-bang-song-hong-va-bac-trung-bo-duoc-nhan-hoc-bong-tiep-suc-den-truong-17917817464291809412039.mp4',
    category: 'Thời sự 24h',
    duration: '1:15',
    thumbnail: 'https://cdn2.tuoitre.vn/471584752817336320/2026/10/12/img-1791781649342475651614.jpeg',
    likes: 8940,
    commentsCount: 520,
    sharesCount: 890
  },
  {
    id: 'short-thoisu-3',
    title: 'Tin quốc tế khẩn • Hiện trường sân bay Saudi Arabia bị tập kích bất ngờ khiến nhiều người thương vong',
    channel: 'VTV Thời sự Quốc tế',
    badge: 'THẾ GIỚI',
    videoUrl: 'https://cdn2.tuoitre.vn/471584752817336320/2026/10/12/ban-sua-saudi-1791789927949697724726.mp4',
    category: 'Thế giới & Cuộc sống',
    duration: '0:42',
    thumbnail: 'https://cdn2.tuoitre.vn/471584752817336320/2026/10/12/gif-saudi-17917876145991101125005.gif',
    likes: 2190,
    commentsCount: 184,
    sharesCount: 92
  },
  {
    id: 'short-thoisu-4',
    title: 'Nóng trên cao tốc • Cảnh sát giao thông phát hiện tài xế dương tính ma túy khi đang lưu thông',
    channel: 'Báo Thanh Niên Shorts',
    badge: 'BẢN TIN',
    videoUrl: 'https://cdn2.tuoitre.vn/471584752817336320/2026/10/12/matuy-17917782757521358952476.mp4',
    category: 'Thời sự 24h',
    duration: '0:50',
    thumbnail: 'https://cdn2.tuoitre.vn/471584752817336320/2026/10/12/quy-chuan00012315still140-17917784637421791585753.jpg',
    likes: 3410,
    commentsCount: 265,
    sharesCount: 310
  },
  {
    id: 'short-kinhte-1',
    title: 'Tiêu dùng thông minh • Sạp thịt sạch có Tick xanh truy xuất nguồn gốc hút khách mua online',
    channel: 'VnEconomy Media',
    badge: 'TÀI CHÍNH',
    videoUrl: 'https://cdn2.tuoitre.vn/471584752817336320/2026/10/12/thit-heo-sach-cc-17917866325351337523585.mp4',
    category: 'Tài chính & Vàng',
    duration: '1:05',
    thumbnail: 'https://cdn2.tuoitre.vn/471584752817336320/2026/10/12/thiet-heo-vcvc-17917870136251202285694.png',
    likes: 1870,
    commentsCount: 142,
    sharesCount: 65
  },
  {
    id: 'short-thoitiet-1',
    title: 'Thời tiết 60s • Dự báo thời tiết cả nước - Cảnh báo mưa lớn, lũ quét và đợt không khí lạnh mới',
    channel: 'VTV Thời Tiết Shorts',
    badge: 'THỜI TIẾT',
    videoUrl: 'https://cdn2.tuoitre.vn/471584752817336320/2026/10/12/ha-noi-17917882728071979895065.mp4',
    category: 'Thời tiết TV',
    duration: '0:59',
    thumbnail: 'https://images.unsplash.com/photo-1592210454359-9043f067919b?w=600&auto=format&fit=crop&q=70',
    likes: 5420,
    commentsCount: 412,
    sharesCount: 480
  },
  {
    id: 'short-taichinh-1',
    title: 'Kinh tế 60s • Giá vàng miếng SJC biến động mạnh, tỷ giá ngân hàng và xu hướng thị trường vốn',
    channel: 'VTV24 Tài Chính',
    badge: 'TÀI CHÍNH',
    videoUrl: 'https://cdn2.tuoitre.vn/471584752817336320/2026/10/12/thit-heo-sach-cc-17917866325351337523585.mp4',
    category: 'Tài chính & Vàng',
    duration: '1:02',
    thumbnail: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=600&auto=format&fit=crop&q=70',
    likes: 6730,
    commentsCount: 588,
    sharesCount: 910
  }
];

interface VideoShortsModalProps {
  isOpen: boolean;
  onClose: () => void;
  liveNews?: any[];
  initialCategory?: string;
}

export function VideoShortsModal({
  isOpen,
  onClose,
  liveNews = [],
  initialCategory = 'Tất cả'
}: VideoShortsModalProps) {
  // Kết hợp danh sách Short từ database và các bài viết có video từ tin tức RSS
  const playlist = useMemo(() => {
    const list: ShortItem[] = [...SHORTS_DATABASE];
    if (liveNews && liveNews.length > 0) {
      liveNews.forEach((n, idx) => {
        if (n.videoSrc || (n.link && /video/i.test(n.link))) {
          const item: ShortItem = {
            id: `rss-short-${idx}`,
            title: n.author || n.title || 'Bản tin video nóng',
            channel: n.src || 'Báo điện tử 24H',
            badge: 'BẢN TIN',
            videoUrl: n.videoSrc || SHORTS_DATABASE[idx % SHORTS_DATABASE.length].videoUrl,
            category: 'Thời sự 24h',
            duration: '0:55',
            thumbnail: n.img || n.logo,
            likes: 1200 + ((idx * 173) % 4000),
            commentsCount: 110 + (idx * 23) % 300,
            sharesCount: 45 + (idx * 17) % 200
          };
          if (!list.some(x => x.title === item.title)) {
            list.unshift(item);
          }
        }
      });
    }
    return list;
  }, [liveNews]);

  const [activeCategory, setActiveCategory] = useState<string>(initialCategory || 'Tất cả');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});
  const [likesMap, setLikesMap] = useState<Record<string, number>>({});
  const [isBuffering, setIsBuffering] = useState<boolean>(false);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const [showHeartPop, setShowHeartPop] = useState<boolean>(false);
  const [showPlayPop, setShowPlayPop] = useState<boolean>(false);
  const [showComments, setShowComments] = useState<boolean>(false);
  const [commentInput, setCommentInput] = useState<string>('');
  const [commentsList, setCommentsList] = useState<Array<{ user: string; text: string; time: string }>>([
    { user: 'Minh Thảo', text: 'Thông tin rất nhanh và hữu ích, cảm ơn bạn biên tập!', time: 'Vừa xong' },
    { user: 'Tuấn Anh', text: 'Xem dạng shorts này tiện và cuốn hơn hẳn đọc báo chữ.', time: '5 phút trước' },
    { user: 'Hương Giang', text: 'Đoạn video chuẩn nét, âm thanh rõ ràng 👍', time: '12 phút trước' }
  ]);
  const [showToast, setShowToast] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const touchStartY = useRef<number>(0);

  const categories = ['Tất cả', 'Thời sự 24h', 'Thời tiết TV', 'Tài chính & Vàng', 'Thế giới & Cuộc sống'];

  const filteredPlaylist = useMemo(() => {
    if (activeCategory === 'Tất cả') return playlist;
    return playlist.filter(item => item.category === activeCategory);
  }, [activeCategory, playlist]);

  const currentShort = filteredPlaylist[currentIndex] || filteredPlaylist[0] || SHORTS_DATABASE[0];

  // Khởi tạo số like
  useEffect(() => {
    if (currentShort && likesMap[currentShort.id] === undefined) {
      setLikesMap(prev => ({ ...prev, [currentShort.id]: currentShort.likes }));
    }
  }, [currentShort, likesMap]);

  // Phím tắt bàn phím PC: ↑ ↓ để chuyển video, Space để dừng/phát, M để tắt tiếng, Esc để đóng
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (showComments && e.key !== 'Escape') return; // Không can thiệp khi đang gõ bình luận

      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        handleNextShort();
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        handlePrevShort();
      } else if (e.key === ' ') {
        e.preventDefault();
        togglePlayPause();
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        setIsMuted(m => !m);
      } else if (e.key === 'Escape') {
        if (showComments) {
          setShowComments(false);
        } else {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, showComments, currentIndex, filteredPlaylist.length]);

  // Khóa scroll trang khi mở Shorts modal
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Thử phát video
      setIsPlaying(true);
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(() => {
          setIsMuted(true);
          videoRef.current?.play().catch(() => {});
        });
      }
    } else {
      document.body.style.overflow = '';
      if (videoRef.current) {
        videoRef.current.pause();
      }
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Xử lý đổi short
  const handleSelectIndex = (idx: number) => {
    const validIdx = (idx + filteredPlaylist.length) % filteredPlaylist.length;
    setCurrentIndex(validIdx);
    setIsPlaying(true);
    setIsBuffering(false);
    if (progressBarRef.current) {
      progressBarRef.current.style.width = '0%';
    }
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  };

  const handleNextShort = () => {
    handleSelectIndex(currentIndex + 1);
  };

  const handlePrevShort = () => {
    handleSelectIndex(currentIndex - 1);
  };

  // Cập nhật progress bar trực tiếp qua DOM Ref (tránh re-render 60fps)
  const handleTimeUpdate = () => {
    if (videoRef.current && videoRef.current.duration) {
      const p = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      if (progressBarRef.current) {
        progressBarRef.current.style.width = `${p}%`;
      }
    }
  };

  // Tua video khi chạm progress bar
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, clickX / rect.width));
    if (progressBarRef.current) {
      progressBarRef.current.style.width = `${pct * 100}%`;
    }
    if (videoRef.current && videoRef.current.duration) {
      videoRef.current.currentTime = pct * videoRef.current.duration;
    }
  };

  // Toggle Play / Pause
  const togglePlayPause = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play().catch(() => {});
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
      setShowPlayPop(true);
      setTimeout(() => setShowPlayPop(false), 500);
    }
  };

  // Double tap to like
  const lastTapRef = useRef<number>(0);
  const handleVideoClick = () => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      // Double tap!
      handleLike();
      setShowHeartPop(true);
      setTimeout(() => setShowHeartPop(false), 800);
    } else {
      togglePlayPause();
    }
    lastTapRef.current = now;
  };

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
    if (navigator.share) {
      navigator.share({
        title: currentShort.title,
        text: `Xem video Shorts: ${currentShort.title}`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(window.location.href);
      setShowToast('Đã sao chép liên kết video vào bộ nhớ tạm!');
      setTimeout(() => setShowToast(null), 2500);
    }
  };

  // Gửi bình luận
  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    setCommentsList(prev => [
      { user: 'Bạn (Người xem)', text: commentInput.trim(), time: 'Vừa xong' },
      ...prev
    ]);
    setCommentInput('');
  };

  // Touch swipe gestures trên mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndY = e.changedTouches[0].clientY;
    const diff = touchStartY.current - touchEndY;
    if (diff > 50) {
      // Vuốt lên -> Tiếp theo
      handleNextShort();
    } else if (diff < -50) {
      // Vuốt xuống -> Trước đó
      handlePrevShort();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center overflow-hidden animate-fadeIn select-none">
      
      {/* ── Top Bar Điều Hướng (Responsive Header) ── */}
      <div className="w-full max-w-[1400px] h-14 px-4 sm:px-6 flex items-center justify-between z-30 shrink-0 border-b border-white/10 bg-black/40 backdrop-blur-md">
        
        {/* Logo Shorts & Brand */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-gradient-to-r from-[#ff0050] to-[#00f2fe] p-[2px] rounded-xl shadow-lg">
            <div className="bg-black px-2.5 py-1 rounded-[10px] flex items-center gap-1.5 text-white font-black text-[13px] tracking-wider">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              <span>⚡ SHORTS</span>
            </div>
          </div>
          <span className="hidden sm:inline font-bold text-white text-[15px] tracking-tight">
            Tin tức Video 24H
          </span>
        </div>

        {/* Chuyên mục lọc nhanh (Tabs) */}
        <div className="hidden md:flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setActiveCategory(cat);
                setCurrentIndex(0);
              }}
              className={`px-3 py-1.5 rounded-full text-[12px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === cat
                  ? 'bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-md'
                  : 'bg-white/10 hover:bg-white/20 text-neutral-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Action Controls & Close */}
        <div className="flex items-center gap-2">
          {/* Mute/Unmute */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 sm:px-3 sm:py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-[12px] font-semibold flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
            title={isMuted ? 'Bật âm thanh (M)' : 'Tắt tiếng (M)'}
          >
            {isMuted ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/></svg>
                <span className="hidden sm:inline">Tắt tiếng</span>
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
                <span className="hidden sm:inline">Âm lượng</span>
              </>
            )}
          </button>

          {/* Close button */}
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 hover:bg-red-600 hover:text-white text-neutral-200 text-[13px] font-bold cursor-pointer transition-all active:scale-95 border border-white/10"
            title="Thoát Shorts (Esc)"
          >
            <span>Thoát</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      </div>

      {/* ── Main Stage: Responsive Frame ── */}
      <div className="w-full flex-1 flex items-center justify-center p-0 sm:p-4 relative overflow-hidden">
        
        {/* Floating PC Next/Prev Navigation Buttons (Left & Right Flanks) */}
        <div className="hidden lg:flex flex-col gap-3 absolute left-12 top-1/2 -translate-y-1/2 z-20">
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md text-[11px] text-neutral-400 flex flex-col gap-1.5 max-w-[150px]">
            <p className="font-bold text-neutral-200">Phím tắt nhanh:</p>
            <p>↑ / ↓ : Chuyển video</p>
            <p>Space : Dừng / Phát</p>
            <p>M : Âm lượng</p>
            <p>Esc : Đóng video</p>
          </div>
        </div>

        {/* Video Frame (Tỷ lệ 9:16 Chuẩn Shorts / TikTok) */}
        <div 
          className="relative w-full h-full sm:h-[calc(100vh-100px)] sm:max-h-[820px] sm:w-[410px] aspect-[9/16] bg-black sm:rounded-3xl overflow-hidden shadow-[0_20px_70px_rgba(0,0,0,0.9)] sm:border sm:border-white/20 flex flex-col justify-between"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* HTML5 Native Video Stream (GPU Accelerated) */}
          <video
            ref={videoRef}
            key={currentShort.id || currentShort.videoUrl}
            src={currentShort.videoUrl}
            poster={currentShort.thumbnail}
            playsInline
            autoPlay
            preload="auto"
            muted={isMuted}
            disablePictureInPicture
            onWaiting={() => setIsBuffering(true)}
            onPlaying={() => setIsBuffering(false)}
            onCanPlay={() => setIsBuffering(false)}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleNextShort}
            onClick={handleVideoClick}
            className="w-full h-full object-cover absolute inset-0 cursor-pointer transform-gpu will-change-transform"
          />

          {/* Buffering Loading Indicator */}
          {isBuffering && (
            <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none bg-black/40 backdrop-blur-[2px]">
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full border-4 border-white/20 border-t-red-500 animate-spin"></div>
                <span className="text-white text-xs font-semibold drop-shadow">Đang tải video...</span>
              </div>
            </div>
          )}

          {/* Invisible next video preload to eliminate lag on next swipe */}
          {filteredPlaylist[(currentIndex + 1) % filteredPlaylist.length]?.videoUrl && (
            <video
              src={filteredPlaylist[(currentIndex + 1) % filteredPlaylist.length].videoUrl}
              preload="auto"
              muted
              className="hidden"
            />
          )}

          {/* Double Tap Flying Heart Animation */}
          {showHeartPop && (
            <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none animate-ping">
              <svg className="w-24 h-24 text-red-500 fill-current drop-shadow-2xl" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </div>
          )}

          {/* Single Tap Play/Pause Feedback Indicator */}
          {showPlayPop && (
            <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
              <div className="w-16 h-16 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center scale-110 transition-transform shadow-2xl">
                {isPlaying ? (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                ) : (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                )}
              </div>
            </div>
          )}

          {/* Top Video Overlay: Tag, Category & Sound indicator */}
          <div className="relative z-20 p-4 pt-3 flex items-center justify-between bg-gradient-to-b from-black/85 via-black/40 to-transparent pointer-events-none">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white text-[11px] font-bold">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
              <span>{currentShort.badge}</span>
              <span className="text-neutral-400">· {currentShort.category}</span>
            </div>
            
            {/* Quick sound toggle inside video frame */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMuted(!isMuted);
              }}
              className="pointer-events-auto p-2 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md border border-white/20 cursor-pointer active:scale-90 transition-transform"
            >
              {isMuted ? (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/></svg>
              ) : (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
              )}
            </button>
          </div>

          {/* Right Action Column (TikTok / YouTube Shorts style: Like, Comment, Share, Next) */}
          <div className="absolute right-3 bottom-16 sm:bottom-14 z-20 flex flex-col items-center gap-3.5 select-none">
            
            {/* Like ❤️ Button */}
            <button
              onClick={handleLike}
              className="flex flex-col items-center gap-1 group cursor-pointer active:scale-90 transition-transform"
              title="Thích video"
            >
              <div className={`w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-md transition-all shadow-lg ${
                likedMap[currentShort.id]
                  ? 'bg-red-600 text-white shadow-red-500/50'
                  : 'bg-black/50 text-white hover:bg-black/70 border border-white/15'
              }`}>
                <svg className={`w-6 h-6 ${likedMap[currentShort.id] ? 'fill-current' : 'fill-none'}`} viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <span className="text-[11px] font-bold text-white drop-shadow">
                {(likesMap[currentShort.id] ?? currentShort.likes).toLocaleString('vi-VN')}
              </span>
            </button>

            {/* Comments 💬 Button */}
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex flex-col items-center gap-1 group cursor-pointer active:scale-90 transition-transform"
              title="Bình luận"
            >
              <div className="w-11 h-11 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-md border border-white/15 shadow-lg">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              </div>
              <span className="text-[11px] font-bold text-white drop-shadow">
                {currentShort.commentsCount || 140}
              </span>
            </button>

            {/* Share ↗️ Button */}
            <button
              onClick={handleShare}
              className="flex flex-col items-center gap-1 group cursor-pointer active:scale-90 transition-transform"
              title="Chia sẻ video"
            >
              <div className="w-11 h-11 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-md border border-white/15 shadow-lg">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
              </div>
              <span className="text-[11px] font-bold text-white drop-shadow">
                Chia sẻ
              </span>
            </button>

            {/* Next Short ⬇ Button */}
            <button
              onClick={handleNextShort}
              className="flex flex-col items-center gap-1 group cursor-pointer active:scale-90 transition-transform"
              title="Video tiếp theo"
            >
              <div className="w-11 h-11 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center backdrop-blur-md border border-white/25 shadow-lg">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
              </div>
              <span className="text-[10px] font-bold text-neutral-300 drop-shadow">
                Tiếp
              </span>
            </button>

            {/* Spinning Vinyl Record Icon (TikTok Style) */}
            <div className="w-9 h-9 rounded-full bg-neutral-900 border-2 border-neutral-700 flex items-center justify-center mt-1 animate-spin duration-[4000ms]">
              <div className="w-3.5 h-3.5 rounded-full bg-red-600"></div>
            </div>
          </div>

          {/* Bottom Video Overlay: Channel, Title, Hashtags & Progress Bar */}
          <div className="relative z-20 p-4 pb-2 bg-gradient-to-t from-black via-black/80 to-transparent flex flex-col gap-2">
            
            {/* Channel Info & Badge */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center font-black text-white text-[12px] shadow-md shrink-0">
                {currentShort.channel.charAt(0)}
              </div>
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="font-extrabold text-[13px] text-white truncate drop-shadow">
                  @{currentShort.channel}
                </span>
                <span className="w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px] shrink-0 font-bold">
                  ✓
                </span>
              </div>
              <button 
                onClick={() => {
                  setShowToast('Đã đăng ký theo dõi kênh!');
                  setTimeout(() => setShowToast(null), 2000);
                }}
                className="ml-auto px-2.5 py-0.5 rounded-full bg-white text-black hover:bg-neutral-200 text-[11px] font-bold cursor-pointer shrink-0 transition-all active:scale-95"
              >
                Theo dõi
              </button>
            </div>

            {/* Title & Description */}
            <p className="text-[13px] sm:text-[13.5px] font-medium text-white line-clamp-2 drop-shadow leading-snug">
              {currentShort.title}
            </p>

            {/* Hashtags */}
            <div className="flex items-center gap-1.5 text-[11px] text-neutral-300 font-semibold drop-shadow">
              <span className="text-pink-400">#Shorts</span>
              <span className="text-cyan-400">#TinTuc24h</span>
              <span className="text-yellow-400">#ThoiSu</span>
            </div>

            {/* Draggable / Clickable Progress Bar */}
            <div 
              onClick={handleSeek}
              className="w-full h-1.5 bg-white/20 hover:h-2.5 rounded-full cursor-pointer relative overflow-hidden transition-all mt-1"
            >
              <div 
                ref={progressBarRef}
                className="h-full bg-gradient-to-r from-red-600 to-pink-500 rounded-full relative"
                style={{ width: '0%' }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white rounded-full shadow-md"></div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Desktop Shorts Sidebar Rundown (PC View: Right Side) ── */}
        <div className="hidden xl:flex flex-col gap-3 w-[340px] h-[calc(100vh-100px)] max-h-[820px] ml-6 bg-neutral-900/80 rounded-3xl border border-white/10 p-4 backdrop-blur-md z-20">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <h3 className="font-extrabold text-white text-[15px] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              Danh sách Video Shorts
            </h3>
            <span className="text-[11px] text-neutral-400 font-bold">
              {currentIndex + 1} / {filteredPlaylist.length}
            </span>
          </div>

          {/* List of other shorts */}
          <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col gap-2.5 pr-1">
            {filteredPlaylist.map((item, idx) => {
              const isSelected = idx === currentIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelectIndex(idx)}
                  className={`flex items-center gap-3 p-2 rounded-2xl cursor-pointer transition-all border ${
                    isSelected
                      ? 'bg-red-600/20 border-red-500/50 shadow-md'
                      : 'bg-white/5 hover:bg-white/10 border-transparent text-neutral-300'
                  }`}
                >
                  <div className="w-16 h-22 rounded-xl bg-black relative overflow-hidden shrink-0 border border-white/10">
                    <img 
                      src={item.thumbnail} 
                      alt="" 
                      className="w-full h-full object-cover" 
                    />
                    <div className="absolute bottom-1 right-1 px-1 py-0.2 rounded bg-black/80 text-[9px] font-bold text-white">
                      {item.duration || '0:50'}
                    </div>
                    {isSelected && (
                      <div className="absolute inset-0 bg-red-600/30 flex items-center justify-center">
                        <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping"></span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">
                      {item.badge}
                    </span>
                    <p className={`text-[12px] font-semibold line-clamp-2 ${isSelected ? 'text-white' : 'text-neutral-200'}`}>
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

          {/* Up & Down Quick Navigation on PC */}
          <div className="flex items-center gap-2 pt-2 border-t border-white/10">
            <button
              onClick={handlePrevShort}
              className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-[12px] flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-95"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="18 15 12 9 6 15"/></svg>
              <span>Short Trước</span>
            </button>
            <button
              onClick={handleNextShort}
              className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-[12px] flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-95 shadow-md shadow-red-600/40"
            >
              <span>Short Sau</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
          </div>
        </div>

      </div>

      {/* ── Slide-up Comments Sheet (Tương tác bình luận giống TikTok) ── */}
      {showComments && (
        <div className="absolute inset-x-0 bottom-0 sm:bottom-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 w-full sm:w-[420px] max-h-[75vh] bg-[#121212] rounded-t-3xl sm:rounded-3xl border border-white/15 shadow-2xl z-40 flex flex-col p-4 animate-slideUp">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h4 className="font-bold text-white text-[15px] flex items-center gap-2">
              Bình luận ({commentsList.length})
            </h4>
            <button 
              onClick={() => setShowComments(false)}
              className="p-1.5 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white cursor-pointer"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          {/* List of comments */}
          <div className="flex-1 overflow-y-auto no-scrollbar py-3 flex flex-col gap-3 min-h-[220px]">
            {commentsList.map((cmt, idx) => (
              <div key={idx} className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-pink-500 to-indigo-500 flex items-center justify-center text-white text-[11px] font-bold shrink-0">
                  {cmt.user.charAt(0)}
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[12px] text-neutral-300">{cmt.user}</span>
                    <span className="text-[10px] text-neutral-500">{cmt.time}</span>
                  </div>
                  <p className="text-[13px] text-white mt-0.5 leading-snug">{cmt.text}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Comment input form */}
          <form onSubmit={handleAddComment} className="pt-2 border-t border-white/10 flex items-center gap-2">
            <input
              type="text"
              placeholder="Thêm bình luận của bạn..."
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              className="flex-1 bg-white/10 text-white placeholder-neutral-500 text-[13px] px-3.5 py-2 rounded-full outline-none border border-white/10 focus:border-red-500"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-full bg-red-600 hover:bg-red-500 text-white font-bold text-[12px] cursor-pointer transition-all active:scale-95"
            >
              Gửi
            </button>
          </form>
        </div>
      )}

      {/* Toast notification */}
      {showToast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-neutral-900/90 text-white text-[13px] font-semibold px-4 py-2 rounded-full border border-white/20 shadow-2xl backdrop-blur-md animate-bounce">
          {showToast}
        </div>
      )}

    </div>
  );
}
