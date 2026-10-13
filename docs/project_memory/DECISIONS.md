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
- **Kiến trúc Fullscreen Cinema & Danh Sách Nổi Trên Video (On-Video Playlist Overlay)**:
  - Video Player hoạt động ở chế độ **Fullscreen tràn viền 100vw x 100vh** (không bo góc, không viền, không ambient ngoài lề khi ở 16:9).
  - Tích hợp chuẩn Web Fullscreen API (`toggleBrowserFullscreen`) qua phím tắt `F` hoặc nút trên header bar.
  - Loại bỏ hoàn toàn mô hình Sidebar chia cột cố định bên ngoài. Thay thế bằng **On-Video Playlist Drawer Overlay** (`z-40`, kính mờ `backdrop-blur-2xl bg-[#0d0d10]/92`) nổi ngay trên bề mặt video, trượt từ cạnh phải sang.
  - Video vẫn tiếp tục phát liền mạch toàn màn hình phía dưới trong khi người dùng duyệt danh sách hoặc lọc kênh.

## 3. CÁC PHƯƠNG ÁN ĐÃ BỊ TỪ CHỐI / CẦN TRÁNH
- **Từ chối**: Sử dụng sidebar cứng bên ngoài đặt cạnh video player (làm co nhỏ video, tạo khoảng trống đen thừa thãi và phá vỡ trải nghiệm xem toàn màn hình).
- **Từ chối**: Sử dụng nút xem trên YouTube hoặc icon liên kết ngoài mở app YouTube (gây thoát trang, vi phạm trải nghiệm người dùng).
- **Từ chối**: Cho phép phụ đề tự động dịch hiển thị che chắn nội dung video (gây rối mắt và dịch sai ngữ nghĩa).
- **Từ chối**: Đặt kích thước icon bằng flex thông thường mà không có `minWidth/minHeight` hoặc inline style cố định (gây méo icon thành hình oval trên tablet/mobile khi co giãn).
