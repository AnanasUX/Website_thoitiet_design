# QUYẾT ĐỊNH KIẾN TRÚC & LỰA CHỌN KỸ THUẬT (ARCHITECTURAL DECISIONS)

## 1. CÔNG NGHỆ & THƯ VIỆN CỐT LÕI
- **Frontend Framework**: React 19 + React DOM 19.
- **Build Tooling**: Vite 8, TypeScript 5.7.
- **Styling**: Tailwind CSS v4 với `@tailwindcss/vite` plugin (cấu hình trong `vite.config.ts`, import qua `@import 'tailwindcss';` trong `src/index.css`).
- **Icons**: SVG inline thuần túy và Lucide icons, kiểm soát chặt chẽ kích thước bằng CSS/inline-styles để tránh méo icon.

---

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
- **Kiến Trúc Cơ Sở Dữ Liệu 97 Video YouTube Thực Tế & Cơ Chế Khôi Phục Lỗi**:
  - Tích hợp sẵn 97 video tin tức & Shorts YouTube chính thống đã qua xác thực trực tiếp bằng YouTube oEmbed API trên 10 kênh báo đài lớn hàng đầu Việt Nam.
  - Không dựa dẫm đơn độc vào các CORS proxy công cộng (như Cloudflare worker hay corsproxy.io vốn hay bị chặn hoặc dính CAPTCHA của Google), bảo đảm người dùng luôn có video để xem 100% trong mọi điều kiện mạng.
  - Cơ chế tự phục hồi lỗi nhúng (Error Auto-Recovery): Lắng nghe mã lỗi `100`, `101`, `150` từ YouTube player để lập tức hiển thị spinner êm dịu và tự động chuyển sang video tiếp theo sau 2.2 giây, ngăn ngừa triệt để tình trạng kẹt màn hình lỗi xám hoặc đen.
- **Chống Lỗi Danh Sách Phát Trống (Empty Playlist Prevention)**:
  - Loại bỏ hoàn toàn điều kiện lọc cứng `selectedSubCategory` trong hàm tính toán `playlist` (`useMemo`). Khi người dùng chuyển sang kênh mới (ví dụ từ VTV24 sang Tiền Phong hay Lao Động), playlist luôn trả về toàn bộ danh sách video của kênh đó mà không bị rỗng do kênh mới không có chuyên mục giống hệt kênh cũ.
- **Kiến Trúc Header & Responsive Đa Nền Tảng (Mobile, Tablet, PC)**:
  - *Trên Mobile (< 640px)*: Header tinh gọn tối đa, ẩn nút xoay tỉ lệ 16:9/9:16 trên Top Header (`hidden sm:flex`), chỉ hiển thị Logo + Badge kênh ở bên trái và Âm thanh + Đóng ở bên phải. Điều này triệt tiêu hoàn toàn nguy cơ đè nút hoặc chèn ép badge kênh trên màn hình hẹp (360px - 390px). Các bảng Drawer (Bình luận, Playlist, EPG Guide) trượt lên dạng Bottom Sheet từ đáy màn hình.
  - *Trên Tablet (640px - 1023px)*: Khung dọc rạp chiếu 420px ở giữa màn hình kèm hiệu ứng ambient glow, cho phép xoay ngang 16:9 linh hoạt và bật Toàn màn hình `[⛶ Fullscreen]`.
  - *Trên PC (>= 1024px)*: Mặc định bật chế độ Toàn Cảnh 16:9 Cinema, dải phím tắt TV (`Space`, `↑`/`↓`, `M`, `L`, `C`, `F`, `R`) và cuộn chuột mượt mà.
  - Hợp nhất toàn bộ Header và dải Kênh TV vào **MỘT container duy nhất** (`flex flex-col gap-2.5`), triệt tiêu hoàn toàn lỗi chồng đè do sử dụng các div `absolute top-0` và `absolute top-14` riêng rẽ.
  - Ràng buộc trực tiếp các thanh điều khiển mở rộng (Quick Format Tabs & Quick TV Channel Pills) bằng điều kiện `{isLandscape && ...}`.
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
  - Dải thanh cuộn danh mục tin tức: Nâng cấp chiều rộng tối đa lên `872px` (`max-w-[872px]`) thay vì `650px`, mở rộng tầm nhìn các chuyên mục và tối ưu hóa không gian màn hình lớn.

- **Kiến Trúc Phân Quyền & Vị Trí Hiển Thị Bảng QA Dashboard (`isUserAdminQA`)**:
  - *Phân quyền quản trị nghiêm ngặt*: Nút truy cập và widget `[🛡️ QA Dashboard]` CHỈ hiển thị duy nhất khi tài khoản người dùng đăng nhập là `"mrkun28@gmail.com"` (kiểm tra qua `userRole?.email` và fallback `localStorage.getItem('user_auth')`). Tuyệt đối ẩn hoàn toàn khỏi mọi tài khoản người dùng khác và người dùng ẩn danh (khách).
  - *Giải pháp tiếp cận vượt qua Cuộn Vô Cực (Infinite Scroll Resolution)*: Do website tích hợp tính năng tải tin tức vô cực (`InfiniteScrollTrigger`), chân trang (Footer) liên tục bị đẩy xuống dưới sâu và hầu như người dùng không thể cuộn tới đáy. Do đó, nút truy cập QA Dashboard được bố trí tại 3 vị trí chiến lược:
    1. **Top Header**: Nút ghim cố định trên thanh tiêu đề của cả Mobile (`MobileLayout`), Tablet (`TabletLayout`) và Desktop (`DesktopLayout`) cạnh Avatar.
    2. **Fixed Floating Action Widget**: Widget nổi cố định ở góc dưới bên phải màn hình (`fixed bottom-6 right-6 z-[999] pointer-events-auto`) luôn nổi trên mọi tầng nội dung và cuộn trang.
    3. **Menu Avatar Quản Trị**: Mục `🛡️ QA Dashboard (Admin)` trong dropdown menu người dùng.
    4. **Site Footer**: Bọc trong điều kiện bảo vệ `{isUserAdminQA(userRole) && (...)}`.
  - *Định tuyến tuyệt đối trên GitHub Pages (`getDashboardUrl`)*: Tránh lỗi 404 khi người dùng nhấp vào link `href="/dashboard.html"` (dẫn tới tên miền gốc `https://ananasux.github.io/dashboard.html` không tồn tại trang). Hàm `getDashboardUrl()` tự động phát hiện môi trường lưu trữ GitHub Pages và điều hướng chính xác về `https://ananasux.github.io/Website_thoitiet_design/dashboard.html`.
  - *Bộ Máy Tự Động Kiểm Thử Trực Tiếp (In-Browser Automated Test Runner) & Phân Hệ Xử Lý Bug Antigravity*:
    + Loại bỏ các nút thủ công không cần thiết (`Mở requirements.json`, `Mở test-cases.json`, `Chọn tệp JSON báo cáo`).
    + Tích hợp nút kiểm thử thời gian thực **`[▶️ Chạy Kiểm Thử Toàn Hệ Thống]`** kích hoạt trình kiểm thử tự động trực tiếp trên trình duyệt, có thanh tiến trình live progress 0% ➔ 100% và chỉ số thời gian chạy.
    + Tích hợp phân hệ **"Phân Tích Sự Cố & Phương Án Xử Lý Antigravity"**: Nếu phát hiện ca thất bại, tự động gom lỗi theo mức độ ưu tiên P0/P1/P2 và cung cấp nút 1-click **`🤖 Sao chép Lệnh Sửa Cho Antigravity`** tạo prompt kỹ thuật chuẩn xác gồm file cần sửa và phương án khắc phục; nếu đạt 100% thì hiển thị chứng nhận **Release Gate: PASSED**.

---

## 3. CÁC PHƯƠNG ÁN ĐÃ BỊ TỪ CHỐI / CẦN TRÁNH
- **Từ chối**: Sử dụng video ID YouTube chưa được kiểm chứng hoặc chứa video 404 chết (gây lỗi đen màn hình player).
- **Từ chối**: Áp bộ lọc `selectedSubCategory` cứng vào `playlist` khi chuyển kênh (khiến playlist bị trống 0 video khi người dùng đổi sang các kênh không có chuyên mục trùng khớp).
- **Từ chối**: Hiển thị nút xoay tỉ lệ `[16:9/9:16]` trên Top Header của màn hình điện thoại thoại di động (< 640px) gây chèn ép, đè lấn badge kênh TV `[CH 01...]`.
- **Từ chối**: Giới hạn dải danh mục tin tức ở `650px` trên PC (làm co hẹp tầm nhìn, buộc người dùng phải cuộn ngang để bấm các danh mục cơ bản như Đời sống, Con người, Doanh nghiệp).
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
- **Từ chối**: Chỉ đặt nút QA Dashboard ở chân trang Footer mà không có ở Header hay Floating Widget (khiến người dùng không thể bấm được do tính năng tải vô cực liên tục đẩy Footer xuống).
- **Từ chối**: Hiển thị công khai QA Dashboard cho mọi tài khoản hoặc khách vãng lai chưa đăng nhập (đây là công cụ quản trị kỹ thuật chỉ cấp phép cho mrkun28@gmail.com).
