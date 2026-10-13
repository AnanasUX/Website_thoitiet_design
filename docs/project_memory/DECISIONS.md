# ARCHITECTURAL DECISIONS & TECHNICAL CHOICES

## 1. CÔNG NGHỆ & THƯ VIỆN CỐT LÕI
- **Frontend Framework**: React 19 + React DOM 19.
- **Build Tooling**: Vite 8, TypeScript 5.7.
- **Styling**: Tailwind CSS v4 với `@tailwindcss/vite` plugin (cấu hình trong `vite.config.ts`, import qua `@import 'tailwindcss';` trong `src/index.css`).
- **Icons**: SVG inline thuần túy và Lucide icons, kiểm soát chặt chẽ kích thước bằng CSS/inline-styles để tránh méo icon.

## 2. KIẾN TRÚC VIDEO SHORTS & MULTI-CHANNEL NEWS
- **YouTube Embed Security & Isolation**:
  - URL nhúng sử dụng miền: `https://www.youtube-nocookie.com/embed/{id}`.
  - Các cờ bảo vệ: `autoplay=1`, `controls=0`, `playsinline=1`, `rel=0`, `modestbranding=1`, `enablejsapi=1`, `cc_load_policy=0`, `iv_load_policy=3`, `fs=0`, `disablekb=1`.
  - Một lớp overlay `div` với `z-index: 10` nằm đè lên iframe để tiếp nhận toàn bộ tương tác cử chỉ (swipe, click, wheel, tap), triệt tiêu hoàn toàn khả năng người dùng bấm vào các liên kết YouTube ra bên ngoài.
- **Lấy dữ liệu video đa kênh từ xa (Data Ingestion)**:
  - Sử dụng Cloudflare Worker Proxy `https://new-bot.mrkun28.workers.dev/?url=` để lấy YouTube RSS feed (`videos.xml?channel_id={id}`) của các đài truyền hình lớn (VTV24, Báo Tiền Phong, Thanh Niên, Tuổi Trẻ, VTC NOW, Lao Động, VTV Thời Tiết).
  - Áp dụng cơ chế **Cache 2 lớp**:
    - Lớp 1: Đọc tức thì từ `localStorage` (`MULTI_CACHE_KEY`) với TTL 30 phút, đảm bảo phản hồi 0ms.
    - Lớp 2: Fetch song song ngầm với timeout 4.5s; nếu mạng chậm hoặc lỗi sẽ dùng `BACKUP_FALLBACK_SHORTS` và `YOUTUBE_NEWS_DATABASE` sẵn có.
- **PC Desktop Widescreen Theater Architecture**:
  - Tự động phát hiện màn hình máy tính (`window.innerWidth >= 1024`): Mặc định chuyển sang `isLandscape = true` (16:9 Toàn Cảnh) để tương thích tối đa với nội dung bản tin truyền hình và phóng sự.
  - Video Player được mở rộng quy mô hiển thị linh hoạt (`min(95vh, 1020px)`), loại bỏ giới hạn cứng `max-w-[1100px]`, chiếm trọn ~85-90% diện tích màn hình.
  - Sidebar Playlist máy tính (`xl:flex`) đồng bộ chiều cao tuyệt đối với player (`h-[min(94vh,940px)] 2xl:h-[min(95vh,1020px)]`), hiển thị ngay từ độ phân giải 1280px (`xl`) để người dùng màn hình laptop/desktop có thể quan sát danh sách phát mà không cần mở drawer.
  - Cung cấp phím tắt `R` và nút chuyển đổi trực quan `[🖥️ 16:9 Toàn cảnh]` / `[📱 9:16 Dọc]` trên header overlay.

## 3. CÁC PHƯƠNG ÁN ĐÃ BỊ TỪ CHỐI / CẦN TRÁNH
- **Từ chối**: Sử dụng nút xem trên YouTube hoặc icon liên kết ngoài mở app YouTube (gây thoát trang, vi phạm trải nghiệm người dùng).
- **Từ chối**: Cho phép phụ đề tự động dịch hiển thị che chắn nội dung video (gây rối mắt và dịch sai ngữ nghĩa).
- **Từ chối**: Đặt kích thước icon bằng flex thông thường mà không có `minWidth/minHeight` hoặc inline style cố định (gây méo icon thành hình oval trên tablet/mobile khi co giãn).
