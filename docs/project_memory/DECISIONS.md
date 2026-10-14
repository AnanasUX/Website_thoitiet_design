# ARCHITECTURAL DECISIONS & TECHNICAL CHOICES

## 1. CÔNG NGHỆ & THƯ VIỆN CỐT LÕI
- **Frontend Framework**: React 19 + React DOM 19.
- **Build Tooling**: Vite 8, TypeScript 5.7.
- **Styling**: Tailwind CSS v4 với `@tailwindcss/vite` plugin (cấu hình trong `vite.config.ts`, import qua `@import 'tailwindcss';` trong `src/index.css`).
- **Icons**: SVG inline thuần túy và Lucide icons, kiểm soát chặt chẽ kích thước bằng CSS/inline-styles để tránh méo icon.

## 2. KIẾN TRÚC VIDEO SHORTS & MULTI-CHANNEL NEWS
- **Mặc định BẬT ÂM THANH (Unmuted Autoplay)**:
  - Video khi mở lên có âm thanh mặc định (`isMuted: false`).
  - Sử dụng postMessage `{ event: 'command', func: 'unMute' }` và `setVolume` 100% khi iframe tải xong.
  - Khi người dùng bật/tắt tiếng, gửi postMessage trực tiếp đến iframe mà KHÔNG thay đổi iframe key hay reload iframe, đảm bảo âm thanh chuyển đổi 0ms không độ trễ.
- **YouTube Embed Security & Isolation**:
  - URL nhúng sử dụng miền: `https://www.youtube-nocookie.com/embed/{id}`.
  - Các cờ bảo vệ: `autoplay=1`, `controls=0`, `playsinline=1`, `rel=0`, `modestbranding=1`, `enablejsapi=1`, `cc_load_policy=0`, `iv_load_policy=3`, `fs=0`, `disablekb=1`.
  - Một lớp overlay `div` với `z-index: 10` nằm đè lên iframe để tiếp nhận toàn bộ tương tác cử chỉ (swipe, click, wheel, tap), triệt tiêu hoàn toàn khả năng người dùng bấm vào các liên kết YouTube ra bên ngoài.
- **Phân Loại 2 Luồng Dữ Liệu Rõ Rệt**:
  - `🎬 Video trên kênh`: Các bản tin phóng sự dài 16:9 lấy từ trang chủ của kênh, tự động ưu tiên chế độ Toàn Cảnh 16:9 trên PC.
  - `⚡ Video Shorts`: Các video dạng ngắn dọc 9:16 lấy từ danh sách phát Shorts của YouTube của các đài.
- **Kiến trúc Header & Responsive Đa Nền Tảng**:
  - Hợp nhất toàn bộ Header và dải Kênh TV vào **MỘT container duy nhất** (`flex flex-col gap-2.5`), triệt tiêu hoàn toàn lỗi chồng đè do sử dụng các div `absolute top-0` và `absolute top-14` riêng rẽ.
  - Ràng buộc trực tiếp các thanh điều khiển mở rộng (Quick Format Tabs & Quick TV Channel Pills) bằng điều kiện `{isLandscape && ...}`:
    - Khi ở chế độ Dọc Shorts 9:16 (`!isLandscape`), header duy trì đúng 1 dòng tối giản duy nhất (Logo + Badge Kênh + Nút điều khiển), không render các tab/dải kênh gây vỡ bố cục trên khung dọc.
    - Người dùng truy cập phân loại Kênh và Định dạng thông qua nút Badge EPG `[🔴 CH 01 ▾]` hoặc Drawer Danh sách phát.
  - Áp dụng kỹ thuật triệt tiêu triệt để scrollbar xám trên mọi trình duyệt (`[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden`).
  - Đồng bộ kích thước card Smart TV Guide với `min-h-[135px]` và tagline `min-h-[32px] line-clamp-2` để giải quyết vĩnh viễn hiện tượng xô lệch chiều cao.
- **Tương Tác Thực Tế & Lưu Trữ Bền Vững**:
  - Tích hợp tài khoản Google đã đăng nhập (`userRole` / `user_auth` trong `localStorage`).
  - Lưu trạng thái Like (`weather_app_liked_shorts_${email}`), Subscribe (`weather_app_subscribed_channels_${email}`), và Bình luận (`weather_app_comments_${videoId}`) trong `localStorage`.

- **Cơ Chế Toàn Màn Hình Thật Sự (True Fullscreen Cinema)**:
  - Khi người dùng kích hoạt Fullscreen (phím `F` hoặc nút `[⛶]`), hệ thống tự động đưa giao diện vào chế độ Toàn Cảnh 16:9 (`isLandscape = true`).
  - Khung video chính giải phóng khỏi tỉ lệ dọc `aspect-[9/16]`, bung trọn 100vw x 100vh để người xem tận hưởng trọn vẹn màn ảnh lớn không viền bo.
  - Sử dụng Web Fullscreen API đa nền tảng kết hợp lắng nghe đa sự kiện `fullscreenchange` để đồng bộ trạng thái chính xác.

- **Cấu Trúc Chuyên Mục Bản Tin (Sub-Category News Feeds Architecture)**:
  - Bổ sung thuộc tính `subCategory` vào mô hình dữ liệu `ShortItem` để đại diện chính xác cho các nhóm bản tin thực tế từ kênh YouTube của đài: `Tin nóng 10 phút`, `Tổng hợp tin tức hàng ngày`, `Thế giới toàn cảnh`, `Tin tức thời sự & Kinh tế`.
  - Tích hợp 2 dải điều khiển lọc chuyên mục: Trên Row 3 của Top Header (cho chế độ Toàn Cảnh 16:9) và bên trong Playlist Drawer (hỗ trợ mọi kích thước màn hình).
- **Kiến Trúc Bóc Tách Tác Giả & Hiển Thị Byline Chuẩn Báo Chí (`NewsDetailView`)**:
  - Tách bạch hoàn toàn giữa **Ảnh đại diện tác giả (Avatar)** và **Ảnh minh họa bài viết (Article Body Image)**.
  - Sử dụng cơ chế bóc tách thông minh 3 tầng:
    1. Trích xuất metadata tác giả (`authorName`, `authorAvatar`, `authorDate`) từ cấu trúc DOM báo chí chính thống (`a[rel="author"]`, `a[href*="/tac-gia/"]`, `time`, JSON-LD schema).
    2. Tiền làm sạch (Pre-cleaning) loại bỏ hoàn toàn các container tác giả khỏi DOM thân bài trước khi trích xuất khối nội dung (`blocks`), chống triệt để tình trạng avatar tác giả và tên tác giả bị rơi vào mảng `blocks`.
    3. Bộ lọc kiểm tra kép (Dual-layer Guard): Kiểm tra kích thước avatar (<= 36px, `zoom/36_36`, `avatar`, `rounded-full`) và so khớp caption với tên tác giả cả trong hàm duyệt node `processNode` lẫn trong JSX rendering loop để bảo đảm 100% không ảnh avatar nào bị bung thành ảnh bài viết.
  - Hiển thị Byline Bar chuẩn mực với avatar tròn nhỏ tỉ lệ 1:1, tên tác giả in đậm, thời gian xuất bản và nút "Nghe đọc" tạo trải nghiệm đọc tin tức chuyên nghiệp chuẩn các báo lớn như Dân Trí, VnExpress.

- **Kiến Trúc Bố Cục & Khoảng Đệm Khung Chính Trên Desktop (`DesktopLayout`)**:
  - Khung nội dung chính (`max-w-[1536px] mx-auto`) áp dụng `style={{ paddingTop: '10px', paddingLeft: '0px', paddingRight: '0px' }}`:
    + Thu hẹp khoảng đệm đỉnh xuống 10px để nội dung thời tiết và bảng tin kết nối trực quan, liền mạch với `LiveNewsTicker` ngay phía trên.
    + Đưa padding trái và phải về 0px giúp tận dụng triệt để chiều rộng của khung 1536px, loại bỏ khoảng hụt lề 32px thừa thãi.
    + Kế thừa `padding-bottom: 64px` từ biến `--section-gap` thông qua lớp `py-[var(--section-gap)]`.

## 3. CÁC PHƯƠNG ÁN ĐÃ BỊ TỪ CHỐI / CẦN TRÁNH
- **Từ chối**: Giữ nguyên khoảng đệm 64px đỉnh và 32px hai bên (`padding: 64px 32px`) trên khung desktop `max-w-[1536px]` (tạo ra khoảng trống quá lớn đẩy nội dung xuống sâu và làm hẹp chiều ngang hiển thị của các khối tin tức / thời tiết).
- **Từ chối**: Phóng to ảnh đại diện tác giả (24px, 36px) thành ảnh bài viết toàn chiều rộng (`w-full`) trong thân bài (gây vỡ hình, mờ nhòe và sai lệch nghiêm trọng với giao diện trang báo chính thống).
- **Từ chối**: Để tên tác giả xuất hiện như một đoạn văn bản (`<p>`) mồ côi trong thân bài đọc chi tiết.
- **Từ chối**: Giữ nguyên khung dọc 9:16 ở giữa màn hình khi người dùng mở Toàn màn hình trên PC (tạo 2 mảng đen khổng lồ và không tận dụng được màn hình rộng).
- **Từ chối**: Đóng modal video khi người dùng bấm phím Escape trong chế độ Fullscreen (Escape chỉ được dùng để thoát Fullscreen trở về cửa sổ bình thường).
- **Từ chối**: Giấu nút Fullscreen khi ở chế độ dọc trên Desktop/Tablet (khiến người dùng không tìm thấy nút phóng to khi thao tác chuột).
- **Từ chối**: Reload iframe khi người dùng bấm Mute (gây chậm, chớp màn hình và đơ luồng phát).
- **Từ chối**: Sử dụng sidebar cứng bên ngoài đặt cạnh video player (làm co nhỏ video, tạo khoảng trống đen thừa thãi và phá vỡ trải nghiệm xem toàn màn hình).
- **Từ chối**: Hiển thị dải Quick Channel Pills trên mobile portrait (gây đè nút Header và xuất hiện thanh cuộn xám).
- **Từ chối**: Sử dụng video MP4 nội bộ lưu trữ tại trang cho luồng Shorts (gây thiếu phong phú, lỗi codec hoặc độ trễ tải, thay vào đó lấy 100% video YouTube chính thống).
- **Từ chối**: Nhồi nhét các nút điều khiển xoay 16:9, playlist drawer trùng lặp hay fullscreen lên Top Header trên Mobile (làm tràn mép và đè lên tên kênh, gây hỏng giao diện di động).
