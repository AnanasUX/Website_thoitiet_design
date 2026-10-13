import React, { useState, useEffect, useRef, useMemo } from 'react';

export interface ShortItem {
  id: string;
  youtubeId?: string;
  videoUrl?: string; // Fallback MP4 nếu có
  title: string;
  channel: string;
  badge: 'TRỰC TIẾP' | 'BẢN TIN' | 'TIÊU ĐIỂM' | 'THỜI TIẾT' | 'TÀI CHÍNH' | 'THẾ GIỚI';
  category: 'Thời sự 24h' | 'Thời tiết TV' | 'Tài chính & Vàng' | 'Thế giới & Cuộc sống';
  duration?: string;
  thumbnail?: string;
  likes: number;
  commentsCount?: number;
  sharesCount?: number;
  publishedAt?: string;
}

// ── Danh sách các nguồn tin tức & phóng sự lớn nhất trong ngày ──
export const FEATURED_NEWS_CHANNELS = [
  { id: 'UCabsTV34JwALXKGMqHpvUiA', name: 'VTV24' },
  { id: 'UCIW9cGgoRuGJnky3K3tbzNg', name: 'Báo Thanh Niên' },
  { id: 'UCr8i-5AIxdiJbI0HdGdUzIA', name: 'Báo Lao Động' }
];

// ── Kho video Shorts dự phòng chất lượng cao (100% embeddable, bảo đảm không bao giờ lỗi) ──
export const BACKUP_FALLBACK_SHORTS: ShortItem[] = [
  {
    id: 'yt-etXSh6fn_As',
    youtubeId: 'etXSh6fn_As',
    title: 'Thời tiết ngày mới: Bắc Bộ ngày nắng hanh, Nam Bộ mưa tăng diện rộng từ chiều tối',
    channel: 'VTV Thời Tiết',
    badge: 'THỜI TIẾT',
    category: 'Thời tiết TV',
    thumbnail: 'https://i.ytimg.com/vi/etXSh6fn_As/hqdefault.jpg',
    likes: 4210,
    commentsCount: 382,
    sharesCount: 145
  },
  {
    id: 'yt-THldZ31vTvI',
    youtubeId: 'THldZ31vTvI',
    title: 'Thế giới toàn cảnh: Sân bay quốc tế King Khalid tại thủ đô Arập Xêút tiếp tục đóng cửa',
    channel: 'VTV24',
    badge: 'THẾ GIỚI',
    category: 'Thế giới & Cuộc sống',
    thumbnail: 'https://i.ytimg.com/vi/THldZ31vTvI/hqdefault.jpg',
    likes: 5420,
    commentsCount: 412,
    sharesCount: 290
  },
  {
    id: 'yt-fQ6NE4ZQOLg',
    youtubeId: 'fQ6NE4ZQOLg',
    title: 'Tiêu điểm xã hội: Báo động thực trạng 83% sinh viên ra trường thiếu hụt kỹ năng mềm',
    channel: 'Báo Thanh Niên',
    badge: 'TIÊU ĐIỂM',
    category: 'Thời sự 24h',
    thumbnail: 'https://i.ytimg.com/vi/fQ6NE4ZQOLg/hqdefault.jpg',
    likes: 6730,
    commentsCount: 588,
    sharesCount: 420
  },
  {
    id: 'yt-kFDO9Qbua4c',
    youtubeId: 'kFDO9Qbua4c',
    title: 'Sự thật về hồ sơ tị nạn chính trị và những chiêu trò lừa đảo trên mạng',
    channel: 'VTV24',
    badge: 'BẢN TIN',
    category: 'Thời sự 24h',
    thumbnail: 'https://i.ytimg.com/vi/kFDO9Qbua4c/hqdefault.jpg',
    likes: 3890,
    commentsCount: 240,
    sharesCount: 180
  },
  {
    id: 'yt-ADGo5NaYQNM',
    youtubeId: 'ADGo5NaYQNM',
    title: 'Dự báo xu thế thời tiết: Các đợt không khí lạnh dồn dập tràn về miền Bắc',
    channel: 'VTV Thời Tiết',
    badge: 'THỜI TIẾT',
    category: 'Thời tiết TV',
    thumbnail: 'https://i.ytimg.com/vi/ADGo5NaYQNM/hqdefault.jpg',
    likes: 8120,
    commentsCount: 650,
    sharesCount: 520
  },
  {
    id: 'yt-gusC3mjEV3I',
    youtubeId: 'gusC3mjEV3I',
    title: 'Tiêu dùng thông minh: Thị trường vàng biến động, khuyến cáo nhà đầu tư',
    channel: 'Báo Lao Động',
    badge: 'TÀI CHÍNH',
    category: 'Tài chính & Vàng',
    thumbnail: 'https://i.ytimg.com/vi/gusC3mjEV3I/hqdefault.jpg',
    likes: 3100,
    commentsCount: 195,
    sharesCount: 110
  }
];

const MULTI_CACHE_KEY = 'yt_aggregated_shorts_cache_v4';
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
            const rawTitle = titleMatch[1].replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'");

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

            list.push({
              id: `yt-${vid}`,
              youtubeId: vid,
              title: rawTitle,
              channel: ch.name,
              badge,
              category,
              thumbnail: `https://i.ytimg.com/vi/${vid}/hqdefault.jpg`,
              duration: 'Shorts',
              likes: 1800 + ((idx * 317) % 6500),
              commentsCount: 95 + ((idx * 43) % 450),
              sharesCount: 40 + ((idx * 21) % 250),
              publishedAt: pubMatch ? pubMatch[1] : ''
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
    
    // 3. Đan xen các bài viết từ các kênh (VTV24 -> Thanh Niên -> Lao Động -> VTV24...)
    const interleaved: ShortItem[] = [];
    const maxLen = Math.max(...settled.map(l => l.length), 0);
    for (let i = 0; i < maxLen; i++) {
      for (let c = 0; c < settled.length; c++) {
        if (settled[c][i]) {
          interleaved.push(settled[c][i]);
        }
      }
    }

    if (interleaved.length > 0) {
      try {
        localStorage.setItem(MULTI_CACHE_KEY, JSON.stringify({
          items: interleaved,
          timestamp: Date.now()
        }));
      } catch {}
      return interleaved;
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

  // Kết hợp danh sách: Đa kênh YouTube + các bài viết RSS có video nếu có
  const playlist = useMemo(() => {
    const list: ShortItem[] = multiChannelVideos.length > 0 ? [...multiChannelVideos] : [...BACKUP_FALLBACK_SHORTS];

    if (liveNews && liveNews.length > 0) {
      liveNews.forEach((n, idx) => {
        if (n.videoSrc || (n.link && /video/i.test(n.link))) {
          const item: ShortItem = {
            id: `rss-short-${idx}`,
            videoUrl: n.videoSrc,
            title: n.author || n.title || 'Bản tin video thời sự nóng',
            channel: n.src || 'Báo điện tử 24H',
            badge: 'BẢN TIN',
            category: 'Thời sự 24h',
            duration: '0:55',
            thumbnail: n.img || n.logo,
            likes: 1200 + ((idx * 173) % 4000),
            commentsCount: 110 + (idx * 23) % 300,
            sharesCount: 45 + (idx * 17) % 200
          };
          if (!list.some(x => x.title === item.title)) {
            list.splice(idx * 3, 0, item);
          }
        }
      });
    }

    return list;
  }, [multiChannelVideos, liveNews]);

  const currentShort = playlist[currentIndex] || playlist[0] || BACKUP_FALLBACK_SHORTS[0];

  // Khởi tạo số like
  useEffect(() => {
    if (currentShort && likesMap[currentShort.id] === undefined) {
      setLikesMap(prev => ({ ...prev, [currentShort.id]: currentShort.likes }));
    }
  }, [currentShort, likesMap]);

  // ── KHÓA ĐIỀU HƯỚNG CHỐNG TREO/LAG (THROTTLE 700MS) ──
  const isNavigatingRef = useRef<boolean>(false);

  const handleSelectIndex = (idx: number) => {
    const validIdx = (idx + playlist.length) % playlist.length;
    setCurrentIndex(validIdx);
  };

  const handleNextShort = () => {
    if (isNavigatingRef.current) return;
    isNavigatingRef.current = true;
    setCurrentIndex(prev => (prev + 1) % playlist.length);
    setTimeout(() => {
      isNavigatingRef.current = false;
    }, 700);
  };

  const handlePrevShort = () => {
    if (isNavigatingRef.current) return;
    isNavigatingRef.current = true;
    setCurrentIndex(prev => (prev - 1 + playlist.length) % playlist.length);
    setTimeout(() => {
      isNavigatingRef.current = false;
    }, 700);
  };

  // ── PC: LĂN CHUỘT (MOUSE WHEEL) ĐỂ CHUYỂN CLIP ──
  const handleWheel = (e: React.WheelEvent) => {
    if (showComments || showPlaylistDrawer) return;
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
      if (showComments || showPlaylistDrawer) return;
      if (isNavigatingRef.current) return;

      if (e.deltaY > 25) {
        handleNextShort();
      } else if (e.deltaY < -25) {
        handlePrevShort();
      }
    };

    window.addEventListener('wheel', handleWindowWheel, { passive: true });
    return () => window.removeEventListener('wheel', handleWindowWheel);
  }, [isOpen, showComments, showPlaylistDrawer, playlist.length]);

  // ── TABLET & MOBILE: VUỐT CẢM ỨNG (TOUCH SWIPE) ĐỂ CHUYỂN CLIP ──
  const touchStartY = useRef<number>(0);
  const touchStartX = useRef<number>(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (isNavigatingRef.current) return;
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

  // Double tap để thả tim
  const lastTapRef = useRef<number>(0);
  const handleOverlayClick = () => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      handleLike();
      setShowHeartPop(true);
      setTimeout(() => setShowHeartPop(false), 800);
    }
    lastTapRef.current = now;
  };

  // Phím tắt bàn phím PC: ↑ ↓ để chuyển video, M để tắt tiếng, Esc để đóng
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (showComments && e.key !== 'Escape') return;

      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        handleNextShort();
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        handlePrevShort();
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        setIsMuted(m => !m);
      } else if (e.key === 'Escape') {
        if (showComments) {
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
  }, [isOpen, showComments, showPlaylistDrawer, currentIndex, playlist.length]);

  // Tự động phục hồi lỗi từ YouTube API và tự chuyển video khi hết
  useEffect(() => {
    if (!isOpen) return;

    const handleMessage = (e: MessageEvent) => {
      try {
        if (typeof e.data === 'string') {
          const data = JSON.parse(e.data);
          // YouTube onError (101, 150): Tự động nhảy sang video sau
          if (data.event === 'onError') {
            setShowToast('Video giới hạn nhúng, tự chuyển clip tiếp theo');
            setTimeout(() => {
              handleNextShort();
            }, 600);
          }
          // YouTube onStateChange = 0 (hết video): Tự động chuyển tiếp
          if (data.event === 'onStateChange' && data.info === 0) {
            handleNextShort();
          }
        }
      } catch {}
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [isOpen, currentIndex, playlist.length]);

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
    const shareUrl = currentShort.youtubeId 
      ? `https://www.youtube.com/shorts/${currentShort.youtubeId}`
      : window.location.href;

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
      className="fixed inset-0 z-[200] bg-black flex items-center justify-center overflow-hidden animate-fadeIn select-none w-screen h-[100dvh]"
      onWheel={handleWheel}
    >
      
      {/* ── Ambient Backdrop (Sáng đẹp trên màn hình Tablet & PC) ── */}
      <div 
        className="absolute inset-0 bg-cover bg-center filter blur-3xl opacity-20 scale-125 pointer-events-none transition-all duration-700 hidden sm:block"
        style={{ backgroundImage: `url(${currentShort.thumbnail})` }}
      />

      {/* ── Floating PC Keyboard & Mouse Hint (Trợ năng trên PC) ── */}
      <div className="hidden 2xl:flex flex-col gap-3 absolute left-8 top-1/2 -translate-y-1/2 z-20">
        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md text-[11px] text-neutral-400 flex flex-col gap-1.5 max-w-[170px] shadow-xl">
          <p className="font-extrabold text-neutral-200 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            Điều khiển PC:
          </p>
          <p>🖱️ Lăn chuột : Chuyển clip</p>
          <p>↑ / ↓ : Chuyển clip</p>
          <p>M : Bật/Tắt âm thanh</p>
          <p>Esc : Đóng video</p>
        </div>
      </div>

      {/* ── Khung Video Shorts 100% Chiều Cao (Responsive Fullscreen 100% tỷ lệ 9:16) ── */}
      <div 
        className="relative w-full h-[100dvh] sm:w-[460px] md:w-[480px] sm:max-h-[100dvh] aspect-[9/16] bg-black sm:rounded-2xl overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.95)] sm:border sm:border-white/15 flex flex-col justify-between shrink-0"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
      >
        {/* ── TRÌNH PHÁT YOUTUBE SHORTS CHUẨN 9:16 ── */}
        {currentShort.youtubeId ? (
          <div className="w-full h-full absolute inset-0 bg-black overflow-hidden pointer-events-auto">
            <iframe
              key={`${currentShort.youtubeId}-${isMuted ? 'muted' : 'unmuted'}`}
              src={`https://www.youtube-nocookie.com/embed/${currentShort.youtubeId}?autoplay=1&mute=${isMuted ? 1 : 0}&loop=1&playlist=${currentShort.youtubeId}&controls=1&playsinline=1&rel=0&modestbranding=1&enablejsapi=1&origin=${encodeURIComponent(window.location.origin)}`}
              title={currentShort.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="w-full h-full border-0 absolute inset-0 z-0 bg-black pointer-events-auto"
            />
          </div>
        ) : (
          /* Fallback video MP4 nếu có bài viết từ tin tức */
          <video
            key={currentShort.id || currentShort.videoUrl}
            src={currentShort.videoUrl}
            poster={currentShort.thumbnail}
            playsInline
            autoPlay
            loop
            muted={isMuted}
            className="w-full h-full object-cover absolute inset-0 cursor-pointer"
          />
        )}

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
        <div className="absolute top-0 inset-x-0 z-30 pt-3 px-3.5 pb-8 bg-gradient-to-b from-black/85 via-black/35 to-transparent flex items-center justify-between pointer-events-none">
          {/* Logo Brand tinh tế bên trái (Đã bỏ logo SHORTS gradient và nút chọn kênh thừa) */}
          <div className="flex items-center gap-2 pointer-events-auto">
            <span className="text-white font-extrabold text-[14px] tracking-tight drop-shadow">
              Anx. Shorts
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
            <span className="text-[11px] text-white/70 font-semibold drop-shadow hidden xs:inline">
              Tin nóng 24h
            </span>
          </div>

          {/* Controls: Âm thanh, Playlist, Đóng */}
          <div className="flex items-center gap-1.5 pointer-events-auto">
            {/* Quick sound toggle */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMuted(!isMuted);
              }}
              className={`p-2 rounded-full backdrop-blur-md border cursor-pointer active:scale-90 transition-all ${
                isMuted 
                  ? 'bg-red-600/80 hover:bg-red-600 text-white border-red-400 shadow-md' 
                  : 'bg-black/60 hover:bg-black/80 text-white border-white/20'
              }`}
              title={isMuted ? 'Đang tắt tiếng - Nhấn để Bật âm thanh (M)' : 'Đang bật âm thanh - Nhấn để Tắt tiếng (M)'}
            >
              {isMuted ? (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/></svg>
              ) : (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
              )}
            </button>

            {/* Playlist Drawer Toggle Button */}
            <button
              onClick={() => setShowPlaylistDrawer(!showPlaylistDrawer)}
              className="p-2 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md border border-white/20 cursor-pointer active:scale-90 transition-transform"
              title="Danh sách Shorts"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-black/60 hover:bg-red-600 text-white backdrop-blur-md border border-white/20 cursor-pointer active:scale-90 transition-all"
              title="Đóng (Esc)"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        </div>

        {/* ── Cột Tương Tác Bên Phải (Right Action Column: Like, Comment, Share, YouTube) ── */}
        <div className="absolute right-3 bottom-16 z-30 flex flex-col items-center gap-3.5 select-none pointer-events-auto">
          
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

          {/* Nút Xem trên YouTube (Đồng bộ thiết kế kính mờ thanh thoát, không còn màu đỏ chót tách biệt) */}
          {currentShort.youtubeId && (
            <a
              href={`https://www.youtube.com/shorts/${currentShort.youtubeId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-1 group cursor-pointer active:scale-90 transition-transform"
              title="Xem trực tiếp trên YouTube"
            >
              <div className="w-11 h-11 rounded-full bg-black/50 hover:bg-black/75 text-white flex items-center justify-center backdrop-blur-md border border-white/15 shadow-lg group-hover:border-red-500/50 transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-white group-hover:text-red-500 transition-colors"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </div>
              <span className="text-[11px] font-bold text-white drop-shadow">
                YouTube
              </span>
            </a>
          )}
        </div>

        {/* ── Bottom Video Overlay: Kênh, Tiêu Đề & Hashtags ── */}
        <div className="absolute bottom-0 inset-x-0 z-20 p-4 pb-4 pr-16 bg-gradient-to-t from-black via-black/85 to-transparent flex flex-col gap-2 pointer-events-none">
          
          {/* Channel Info & Nút Chuông Theo Dõi Kênh Tinh Tế */}
          <div className="flex items-center gap-2 pointer-events-auto">
            <div className="w-8 h-8 rounded-full bg-[#ff315f] flex items-center justify-center font-black text-white text-[12px] shadow-md shrink-0">
              {currentShort.channel.charAt(0)}
            </div>
            <div className="flex items-center gap-1 min-w-0">
              <span className="font-extrabold text-[13px] text-white truncate drop-shadow">
                @{currentShort.channel}
              </span>
              <span className="w-3.5 h-3.5 rounded-full bg-blue-500 text-white flex items-center justify-center text-[9px] shrink-0 font-bold">
                ✓
              </span>
            </div>

            {/* Nút icon chuông quan tâm / theo dõi kênh (nhỏ gọn, sang trọng, không choán diện tích) */}
            <button 
              onClick={toggleFollowChannel}
              className={`p-1.5 rounded-full border backdrop-blur-md cursor-pointer transition-all active:scale-90 ml-1.5 ${
                isFollowingChannel
                  ? 'bg-[#ff315f] border-[#ff315f] text-white shadow-[0_0_10px_rgba(255,49,95,0.5)]'
                  : 'bg-white/10 hover:bg-white/20 border-white/20 text-neutral-300 hover:text-white'
              }`}
              title={isFollowingChannel ? "Đang theo dõi kênh" : "Nhấn để quan tâm/theo dõi kênh"}
            >
              {isFollowingChannel ? (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              ) : (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/><line x1="12" y1="2" x2="12" y2="4"/></svg>
              )}
            </button>
          </div>

          {/* Title & Description */}
          <p className="text-[13px] sm:text-[13.5px] font-medium text-white line-clamp-2 drop-shadow leading-snug">
            {currentShort.title}
          </p>

          {/* Hashtags & Số thứ tự clip */}
          <div className="flex items-center gap-2 text-[11px] font-semibold drop-shadow">
            <span className="text-pink-400">#Shorts</span>
            <span className="text-cyan-400">#TinTuc24h</span>
            <span className="text-yellow-400">#ThoiSu</span>
            <span className="ml-auto text-[10px] text-neutral-400 font-bold">
              {currentIndex + 1} / {playlist.length}
            </span>
          </div>
        </div>
      </div>

      {/* ── Desktop / Tablet Playlist Sidebar (Drawer linh hoạt trên PC) ── */}
      <div className={`hidden xl:flex flex-col gap-3 w-[340px] h-[calc(100vh-40px)] max-h-[820px] ml-5 bg-neutral-900/90 rounded-2xl border border-white/10 p-4 backdrop-blur-md z-20 transition-all ${
        showPlaylistDrawer ? 'flex' : 'hidden xl:flex'
      }`}>
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <div className="flex flex-col">
            <h3 className="font-extrabold text-white text-[14px] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              Bản Tin Shorts Tổng Hợp
            </h3>
            <span className="text-[11px] text-neutral-400">
              Đan xen VTV24 · Thanh Niên · Lao Động
            </span>
          </div>
          <span className="text-[11px] text-neutral-400 font-bold">
            {currentIndex + 1} / {playlist.length}
          </span>
        </div>

        {/* List of other shorts */}
        <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col gap-2.5 pr-1">
          {playlist.map((item, idx) => {
            const isSelected = idx === currentIndex;
            return (
              <div
                key={`${item.id}-${idx}`}
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
                    {item.duration || 'Shorts'}
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

        {/* Up & Down Quick Navigation on PC Sidebar */}
        <div className="flex items-center gap-2 pt-2 border-t border-white/10">
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

      {/* ── Mobile / Tablet Slide-up Playlist Drawer ── */}
      {showPlaylistDrawer && (
        <div className="xl:hidden absolute inset-x-0 bottom-0 max-h-[70vh] bg-[#121212] rounded-t-3xl border-t border-white/15 shadow-2xl z-40 flex flex-col p-4 animate-slideUp">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h4 className="font-bold text-white text-[15px] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              Danh sách Shorts Đa Kênh ({playlist.length})
            </h4>
            <button 
              onClick={() => setShowPlaylistDrawer(false)}
              className="p-1.5 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white cursor-pointer"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto no-scrollbar py-2 flex flex-col gap-2 min-h-[220px]">
            {playlist.map((item, idx) => {
              const isSelected = idx === currentIndex;
              return (
                <div
                  key={`${item.id}-${idx}`}
                  onClick={() => {
                    handleSelectIndex(idx);
                    setShowPlaylistDrawer(false);
                  }}
                  className={`flex items-center gap-3 p-2 rounded-2xl cursor-pointer transition-all border ${
                    isSelected
                      ? 'bg-red-600/20 border-red-500/50 shadow-md'
                      : 'bg-white/5 hover:bg-white/10 border-transparent text-neutral-300'
                  }`}
                >
                  <div className="w-14 h-20 rounded-xl bg-black relative overflow-hidden shrink-0 border border-white/10">
                    <img 
                      src={item.thumbnail} 
                      alt="" 
                      className="w-full h-full object-cover" 
                    />
                    {isSelected && (
                      <div className="absolute inset-0 bg-red-600/30 flex items-center justify-center">
                        <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
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
              className="p-1.5 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white cursor-pointer"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
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
