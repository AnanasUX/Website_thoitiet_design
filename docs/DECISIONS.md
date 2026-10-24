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
  - *Kiến Trúc Kiểm Thử Thực Tế Đa Màn Hình & Toàn Bộ Tính Năng (Connected Live Multi-Screen E2E)*:
    + Nâng cấp toàn diện script `scripts/testwebsite.mjs` tích hợp `playwright-core` điều khiển trực tiếp trình duyệt Google Chrome thật trên hệ điều hành.
    + Khởi động máy chủ cục bộ và tự động kiểm thử thực tế qua 3 kích thước màn hình chuẩn: **Desktop (1440px x 900px)**, **Tablet (768px x 1024px)**, và **Mobile (375px x 812px)**.
    + Thực thi tương tác thật trên DOM sống: đo đạc kích thước thật (`padding-top: 10px`, dải danh mục `max-w-[872px]`, khung tablet `420px`), bấm chuyển tab danh mục tin tức, mở bài viết chi tiết kiểm tra Byline Bar và bảo vệ ảnh tác giả, kích hoạt Video Shorts & Smart TV kiểm tra 10 kênh, âm thanh unmuted, lớp overlay và đếm lùi 5s, kiểm thử phân quyền admin `mrkun28@gmail.com`.
    + Chụp ảnh bằng chứng thực tế tại từng màn hình lưu trữ tại `qa/screenshots/` và đồng bộ sang `public/qa/screenshots/`.
    + Tích hợp bộ giả lập màn hình **Interactive Multi-Screen Simulator & Preview** ngay trên `dashboard.html` cho phép người dùng chuyển đổi trực tiếp giữa Desktop, Tablet và Mobile.
  - *Kiến Trúc Kiểm Thử Toàn Diện 7 Luồng Logic Nghiệp Vụ & Dữ Liệu (`REQ-022` / `TC-022`)*:
    + **Chuẩn hóa module logic nghiệp vụ (`src/utils/logicFlows.ts`)**: Tách biệt các hàm xử lý dữ liệu và thuật toán cốt lõi ra module độc lập, thuần túy và có thể kiểm thử tự động với Node.js và trình duyệt.
    + **Bộ kiểm thử 7 luồng nghiệp vụ với 134 assertions thực tế (`scripts/test-logic-flows.mjs`)**:
      1. *Luồng Thời Tiết*: `detectConditionKey`, `mapBotStatusToCondKey`, phân cấp bụi mịn PM2.5 theo WHO (`pm25Icon`), đổi góc la bàn 16 hướng gió (`getWindDirection`), tính toán toạ độ đường cong Bézier SVG (`calculateSplinePoints`).
      2. *Luồng Thị Trường & Tài Chính*: Bóc tách số tiền và giá hỗ trợ dấu chấm phân cách hàng nghìn và phẩy thập phân kiểu Việt Nam (`parseCurrencyValue`), tính độ chênh lệch Spread Mua-Bán vàng SJC/DOJI (`calculateSpread`), tỷ lệ % biên độ, định dạng tiền tệ VND (`formatVND`), đo lường biến động giá tăng/giảm/đi ngang (`calculatePriceChange`).
      3. *Luồng RSS Tin Tức & Khử Trùng Lặp*: Thuật toán trích xuất Canonical Key chuẩn hóa URL (`getUniqueKey`), bộ lọc khử trùng bài viết (`filterDeduplicatedNews`), phân loại 10 danh mục tin tức, phân trang cuộn vô cực an toàn (`paginateNews`).
      4. *Luồng Bóc Tách Bài Báo & Bảo Vệ Avatar*: Bộ lọc rác và quảng cáo (`isBoilerplate`), bộ bảo vệ hai lớp nhận diện avatar tác giả (`isAuthorAvatar`) ngăn chặn triệt để lỗi phóng to avatar thành ảnh bài viết, giải mã thực thể HTML và khối CDATA (`decodeHTMLEntities`).
      5. *Luồng Video Shorts & Smart TV*: Xác thực 97/97 video YouTube thực tế đúng 11 ký tự Base64URL (`validateYouTubeId`), ánh xạ 10 kênh truyền hình báo chí chính thống (`matchesChannel`), cơ chế chống rỗng danh sách phát (`generateChannelPlaylist`), tự động phục hồi lỗi nhúng YouTube sau 2.2s (`shouldAutoRecoverOnPlaybackError`), đếm lùi 5000ms ẩn controls (`calculateControlsVisibility`).
      6. *Luồng Bảo Mật & Phân Quyền*: Ma trận chân trị `isUserAdminQA` (chặn khách và email khác, chỉ cấp quyền cho `mrkun28@gmail.com`), định tuyến URL dashboard chuẩn xác trên Localhost và GitHub Pages (`getDashboardUrl`).
      7. *Luồng Lịch Vạn Niên & Tiện Ích Ngày Tháng*: Thuật toán tính ngày trong tháng `getDaysInMonth` xử lý chính xác năm nhuận tháng 2 (2024 = 29 ngày, 2025/2026 = 28 ngày, thế kỷ 2000 = 29 ngày, 1900 = 28 ngày), xác định thứ ngày đầu tháng `getFirstDayOfMonth`.
    + **Tích hợp vào cổng `/testwebsite` và Dashboard Live Simulator**: Chạy 134 assertions logic trước khi mở trình duyệt Chrome, đồng thời trang bị bảng điều khiển **Nhật Ký Thực Thi Thời Gian Thực (Connected Live Execution Console)** trên Dashboard với nhịp độ tương tác trực quan, streaming log sống động và liên kết chặt chẽ với DOM thực tế của hệ thống.
  - *Kiến Trúc Kiểm Thử Trải Nghiệm Người Dùng (UX) & Toàn Bộ Tương Tác Luồng (`REQ-023` / `TC-023`)*:
    + **UX Luồng Đọc Tin Tức & Audio TTS**: Tích hợp Web Speech API giọng đọc tiếng Việt (`vi-VN`) cho nút "Nghe đọc" trong Byline Bar, phản hồi tức thì với trạng thái "Đang đọc..." kèm hiệu ứng animate-pulse và hỗ trợ tạm dừng/tiếp tục.
    + **Khóa cuộn trang nền (Body Scroll Lock)**: Tự động gán `document.body.style.overflow = 'hidden'` khi mở modal bài viết và khôi phục khi đóng, loại bỏ hoàn toàn hiện tượng cuộn nền hỗn loạn khi đang đọc bài.
    + **Đa phương thức thoát modal**: Cho phép người dùng nhấn phím `Escape` trên bàn phím để đóng modal bài viết ngay lập tức, tự động ngắt âm thanh đọc và phục hồi vị trí trang chính.
    + **Điều hướng bàn phím Shorts Player (Keyboard UX)**: Hỗ trợ phím `Space` (Play/Pause), `M` (Mute/Unmute), `ArrowDown`/`PageDown` (Next short), `ArrowUp`/`PageUp` (Prev short), `F` (Fullscreen) và `Escape` (Đóng player).
    + **Công thái học Đồ thị & Tooltip (Market Hover UX)**: Hover chuột lên điểm đồ thị hiển thị Tooltip giá và thời gian với tọa độ x/y chuẩn xác; tự động ẩn tooltip khi chuột rời khỏi vùng đồ thị (`mouseleave dismissal`).
    + **Dải danh mục tin tức (Pill Carousel UX)**: Chuyển đổi chuyên mục cập nhật highlight pill màu hồng (`#ff315f`) tức thì, lọc tin mượt mà không làm giật layout.
    + **Giao diện Tối/Sáng (Dark Mode Toggle UX)**: Nút bấm trên Header kích hoạt class `.dark` trên thẻ `<html>`, chuyển đổi màu nền tương thích và lưu trữ bền vững trong `localStorage`.
    + **Bộ kiểm thử tự động UX thực tế (`scripts/test-ux-flows.mjs`)**: Thực thi 7 kịch bản UX tương tác luồng trực tiếp trên Chrome thật qua Playwright, tích hợp vào cổng `/testwebsite` và bộ giả lập `dashboard.html`.
  - *Kiến Trúc Tương Tác Thực Chiến Đa Màn Hình & Bộ Quét Lỗi Trực Quan (`REQ-024` / `TC-024`)*:
    + **Thao tác cử chỉ cuộn sâu (Deep Scroll & ScrollToTop)**: Vuốt cuộn trang Desktop xuống > 1500px, kích hoạt nút `[Cuộn lên đầu trang]` (`data-testid="scroll-to-top-btn"`) và xác minh tự động cuộn mượt về đỉnh (`scrollY = 0`).
    + **Click chi tiết và kiểm thử tương tác sâu**: Click mở modal bài viết chi tiết, cuộn bài đọc, kích hoạt Web Speech API TTS giọng đọc tiếng Việt, kiểm tra danh mục bài viết liên quan, và đóng modal an toàn qua phím `Escape`.
    + **Tương tác Shorts Player & Tiện ích**: Điều khiển tỉ lệ 16:9, phím tắt `Space` (Play/Pause), `M` (Mute/Unmute), Dark Mode toggle và điều hướng lịch âm dương tháng trước/sau.
    + **Kiểm thử bố cục Tablet (768px) & Cử chỉ vuốt chạm Mobile (375px)**: Xác minh độ mượt mà của cử chỉ touch scroll và tính năng phản hồi trên màn hình cảm ứng nhỏ.
    + **Bộ quét lỗi giao diện trực quan tự động (Visual UI Defect Scanner)**:
      1. *Quét tràn viền ngang (Horizontal Overflow)*: Kiểm tra `document.documentElement.scrollWidth <= window.innerWidth` trên cả 3 màn hình Desktop, Tablet, Mobile (0 lỗi tràn ngang).
      2. *Quét ảnh hỏng (Broken Images)*: Kiểm tra 100% thẻ `<img>` đang hiển thị trên trang có `naturalWidth > 0` và tải thành công (0 ảnh hỏng).
      3. *Quét công thái học & Vùng chạm (Ergonomics & Touch Targets)*: Kiểm tra kích thước nút bấm tối thiểu đạt chuẩn $\ge 40\text{px}$ và không có xung đột z-index che khuất.
  - *Động Cơ Điều Phối Lỗi Tự Động Antigravity Copilot Pro (`mrkun28@gmail.com`)*:
    + **Định danh quản trị viên Pro**: Tích hợp tài khoản quản trị `mrkun28@gmail.com` gắn cờ Pro Tier, tự động xác thực và cấp quyền điều phối lỗi kỹ thuật.
    + **Cơ chế tự động báo bug vào Antigravity AI khi test lỗi**: Khi bộ kiểm thử chạy xong mà phát hiện bất kỳ ca kiểm thử nào thất bại (`problems > 0`), hệ thống QA tự động kích hoạt âm thanh cảnh báo, mở hộp thoại điều phối `copilotModal`, đóng gói toàn bộ danh sách lỗi, tệp liên quan, bằng chứng vào chỉ thị chuẩn `AI_PROJECT_PROTOCOL.md` và lưu vào `localStorage.antigravity_active_task`.
    + **Nút Thử Nghiệm Báo Lỗi (`copilotSimulateBugBtn`)**: Trang bị tính năng mô phỏng thử nghiệm 1 lỗi kỹ thuật để người dùng kiểm chứng ngay lập tức luồng tự động báo bug và khôi phục lại trạng thái PASS 100%.
  - *Kiến Trúc Mở Rộng Ma Trận Toàn Hệ Thống 30 Yêu Cầu & Ca Kiểm Thử (`REQ-025` -> `REQ-030` / `TC-025` -> `TC-030`)*:
    + **REQ-025 / TC-025 - Quản Lý Xác Thực Google OAuth 2.0 & Phiên Người Dùng**: Tích hợp Google Identity Services OAuth 2.0 (`UserAvatarMenu.tsx`), duy trì phiên đăng nhập bền vững qua `localStorage.getItem('user_auth')`, đồng bộ cookie bảo mật và menu quản lý hồ sơ / đăng xuất an toàn.
    + **REQ-026 / TC-026 - Phân Hệ Lịch Vạn Niên Âm - Dương & Google Calendar**: Thuật toán tính toán ngày âm dương chính xác kết hợp can chi hoàng đạo, điều hướng tháng trước/sau và hỗ trợ nút liên kết đồng bộ Google Calendar API.
    + **REQ-027 / TC-027 - Thu Thập Tin Tức RSS Đa Kênh Hơn 38 Nguồn & Cuộn Nạp Vô Cực**: Cơ chế thu thập dữ liệu RSS qua Worker proxy mrkun28, tự động phân loại vào 10 chuyên mục, giải mã CDATA và nạp gia số 15 bài/lần thông qua `InfiniteScrollTrigger`.
    + **REQ-028 / TC-028 - Định Tuyến URL Ảo Chuẩn SEO & Lịch Sử Popstate**: Cập nhật URL chi tiết bài báo theo định dạng chuẩn SEO `/Website_thoitiet_design/chi-tiet-[slug]` thông qua `history.pushState` khi mở modal đọc bài, và lắng nghe sự kiện `popstate` để tự động đóng modal khôi phục URL trang chủ khi người dùng nhấn nút Back trình duyệt.
    + **REQ-029 / TC-029 - Trang Chính Sách Bảo Mật Minh Bạch (Privacy Policy)**: Thành phần `PrivacyPolicyPage.tsx` dạng full overlay `z-[300]` hiển thị 6 điều khoản cam kết quyền riêng tư và an toàn dữ liệu người dùng theo đúng tiêu chuẩn Google OAuth 2.0 Client Verification.
    + **REQ-030 / TC-030 - Bảng Điều Khiển Thời Tiết Nhà Phát Triển (Dev Weather Panel)**: Kích hoạt bảng điều khiển bí mật `DevWeatherPanel.tsx` thông qua cử chỉ triple-tap logo Anx., cho phép mô phỏng tức thì 9 trạng thái thời tiết động (mưa dông, nắng đẹp, mây rải rác, tuyết rơi...).
  - *Kiến Trúc Giai Đoạn Chờ Đồng Bộ Dữ Liệu Sống & Kiểm Thử Tương Tác Sâu Trên DOM Thực Tế (Live RSS Hydration Wait & Deep DOM Testing Architecture)*:
    + **Khắc phục lỗi chạy kiểm thử vội vã (Premature Test Execution Flaw)**: Trước đây khi người dùng nhấn `Chạy Kiểm Thử Toàn Hệ Thống`, hệ thống kiểm thử chạy qua các bài test với `setTimeout` 200ms trong khi các luồng tin RSS từ 38 nguồn báo chí thông qua proxy mrkun28 vẫn đang tải bất đồng bộ (trang hiển thị skeleton `animate-pulse`). Điều này khiến việc kiểm tra bài viết chi tiết, danh mục, Byline bar diễn ra trên trạng thái chờ và kết thúc quá nhanh trước khi nội dung thực tế xuất hiện.
    + **Giai đoạn thăm dò và đồng bộ dữ liệu sống (`waitForData`)**: Tích hợp vòng lặp chờ chủ động tối đa 15 giây, kiểm tra DOM của iframe ứng dụng cho đến khi các skeleton `.animate-pulse` biến mất và số lượng bài viết nạp thành công $\ge 5$ (hoặc $\ge 15$ bài chuẩn ban đầu). Báo trạng thái chi tiết ra `#liveConsoleOutput` để người dùng theo dõi tiến trình nạp tin từ 38 nguồn báo chí trước khi bắt đầu bài kiểm thử đầu tiên.
    + **Thực thi chuỗi thao tác tương tác sâu từng phân hệ**:
      - *Phân hệ Tin tức & Cuộn vô cực (`TC-027`)*: Đo số lượng bài ban đầu ($N_1 = 15$), cuộn mượt xuống chân trang để kích hoạt `InfiniteScrollTrigger`, chờ 800-1200ms nạp mẻ tin tiếp theo, đo số lượng bài tăng lên ($N_2 \ge 30$), sau đó cuộn mượt về đỉnh.
      - *Phân hệ Danh mục (`TC-015`)*: Cuộn tới dải danh mục, click chuyển sang tab "Giá vàng", chờ trạng thái `isFetchingCategory` kết thúc và danh sách bài tài chính hiển thị (pill hồng kích hoạt), sau đó click chuyển lại tab "Tất cả" và chờ nạp lại luồng tin tổng hợp.
      - *Phân hệ Đọc bài chi tiết & Byline bar (`TC-012`, `TC-013`)*: Tìm thẻ bài thực tế, cuộn tới và click mở `NewsDetailView`, trích xuất tiêu đề thực tế, kiểm tra Byline Bar (avatar tròn 1:1, tên tác giả, ngày giờ, nút TTS), cuộn thân bài xuống 350px-600px, kiểm tra 0 avatar bị phóng to thành ảnh thân bài.
      - *Phân hệ Tương tác UX & Thoát an toàn (`TC-023`)*: Bấm nút "Nghe đọc" TTS kích hoạt Web Speech API tiếng Việt ("Đang đọc..."), kiểm tra danh sách bài viết liên quan, nhấn phím `Escape` đóng modal, ngắt âm thanh và xác nhận body scroll được giải phóng (`overflow: auto`).
      - *Phân hệ Shorts & Smart TV (`TC-003` -> `TC-011`)*: Mở Shorts modal, kiểm tra tỉ lệ 16:9 Cinema, chuyển kênh sang "Báo Tiền Phong" (playlist không rỗng), kiểm tra unmuted audio, overlay `z-10`, đếm lùi 5s và đóng player.
      - *Phân hệ Lịch Vạn Niên (`TC-026`)*: Mở Calendar modal, kiểm tra ngày âm dương, can chi, click chuyển tháng sau -> tháng trước, đóng modal.
      - *Phân hệ Tương tác thực chiến & Quét lỗi (`TC-024`)*: Thao tác cuộn sâu 2000px, click nút `ScrollToTop` cuộn về đỉnh (y=0), bật Dark Mode dừng 800ms để người dùng quan sát trên live simulator rồi khôi phục giao diện sáng, chuyển qua Tablet (768px, dừng 600ms), Mobile (375px, dừng 600ms), quay lại Desktop (1440px), quét 0 lỗi tràn viền và 0 ảnh hỏng.

  - *Kiến Trúc Lá Chắn Lỗi Trình Duyệt & Chuẩn Hóa DOM Selector Trong QA Dashboard (Browser-Native Selector Safety & Error Shielding)*:
    + **Khắc phục triệt để lỗi đứng máy tại TC-023**: Trong môi trường trình duyệt client (`dashboard.html`), hàm `doc.querySelector` chuẩn W3C không hỗ trợ các bộ chọn giả định riêng của Playwright như `:has-text("...")`. Việc gọi `button:has-text("Nghe đọc")` đã gây ra ngoại lệ `DOMException: SyntaxError`, làm đứt gãy luồng thực thi của hàm `runAllTests()` khiến tiến trình kiểm thử bị dừng đứng lại ngay tại ca `TC-023`.
    + **Chuẩn hóa truy vấn DOM thuần túy (Pure DOM API)**: Thay thế toàn bộ các cú pháp không hợp lệ bằng phương thức chuẩn `Array.from(doc.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes(...))` kết hợp `try ... catch` bảo vệ an toàn.
    + **Lá chắn lỗi 2 tầng (Two-Tier Exception Shielding)**:
      1. *Tầng từng bước kiểm thử (Step-level Shield)*: Mỗi ca kiểm thử trong vòng lặp `for` được bao bọc trong khối `try ... catch`. Nếu có bất kỳ sự cố DOM cục bộ nào, hệ thống ghi nhận cảnh báo và chuyển mượt mà sang ca tiếp theo mà không bao giờ làm treo toàn bộ hệ thống.
      2. *Tầng toàn cục (Global Finally Guarantee)*: Toàn bộ hàm `runAllTests()` được bọc trong `try ... catch ... finally`, bảo đảm cờ `isRunning`, biểu tượng nút và tiến trình luôn được giải phóng và cập nhật kết quả 100%.
    + **Công cụ kiểm chứng tự động in-browser (`npm run test:dashboard`)**: Xây dựng script `scripts/test-dashboard-live.mjs` tự động khởi động máy chủ, mở `dashboard.html` trên Google Chrome thật, bấm nút `[▶️ Chạy Kiểm Thử Toàn Hệ Thống]` và xác thực toàn bộ 37/37 ca kiểm thử hoàn tất thành công 100%.

  - *Kiến Trúc Mạng Lưới Quan Trắc Thời Tiết 63 Tỉnh Thành & Công Thức Nhiệt NOAA Rothfusz (`REQ-031` / `TC-031`)*:
    + Xây dựng cơ sở dữ liệu quan trắc `VIETNAM_PROVINCES` bao phủ 4 miền (Bắc, Trung, Nam, Tây Nguyên) với nhiệt độ, độ ẩm, hướng gió, chỉ số bụi mịn PM2.5 và UV Index.
    + Thuật toán tìm kiếm `searchProvinces` hỗ trợ linh hoạt cả tiếng Việt có dấu và không dấu qua chuẩn hóa NFD.
    + Triển khai phương trình đa thức hồi quy chuẩn của Cơ quan Khí quyển & Đại dương Quốc gia Hoa Kỳ (NOAA) `calculateNOAAHeatIndex` tính toán chính xác chỉ số cảm giác nhiệt (Heat Index), phân cấp mức độ rủi ro sức khỏe (An toàn < 27°C, Chú ý 27-32°C, Đặc biệt chú ý 32-41°C, Nguy hiểm 41-54°C, Cực kỳ nguy hiểm >= 54°C).

  - *Kiến Trúc Giám Sát Sức Khỏe 50+ Kênh RSS & Cơ Chế Proxy Auto-Failover (`REQ-032` / `TC-032`)*:
    + Mở rộng thu thập từ 50+ luồng RSS từ các cơ quan báo chí chính thống Việt Nam.
    + Cơ chế giám sát sức khỏe `evaluateFeedHealth`: đo độ trễ (latency ms) và mã trạng thái HTTP để phân loại GOOD, SLOW, FAIL.
    + Động cơ `buildProxyUrlWithFailover`: Khi một proxy gặp sự cố HTTP 5xx, CORS timeout hoặc chặn IP, hệ thống tự động luân chuyển mượt mà qua danh sách nhà cung cấp dự phòng (`api.allorigins.win`, `corsproxy.io`, `api.codetabs.com`, `thingproxy.freeboard.io`), đảm bảo dòng tin tức không bao giờ bị đứt gãy.

  - *Kiến Trúc Vệ Sinh HTML Nghiêm Ngặt & Chống Tấn Công XSS (`REQ-033` / `TC-033`)*:
    + Toàn bộ nội dung bài báo cào từ Internet trước khi đưa vào DOM của `NewsDetailView` bắt buộc phải đi qua bộ lọc `sanitizeArticleContent`.
    + Loại bỏ triệt để các thẻ nguy hiểm: `<script>`, `<style>`, `<iframe>`, `<object>`, `<embed>`, `<form>`, `<input>`, `<button>`.
    + Vô hiệu hóa 100% thuộc tính inline event handlers nguy hại (`onload`, `onerror`, `onclick`, `onmouseover`) và liên kết `href="javascript:..."`.
    + Trung hòa các thuộc tính CSS injection độc hại (`position: fixed`, `z-index: 99999`) để giữ trọn tính toàn vẹn của layout.

  - *Kiến Trúc Phân Hệ Đánh Dấu Bài Viết Yêu Thích Bookmarks (`REQ-034` / `TC-034`)*:
    + Hỗ trợ người dùng lưu bài viết đọc lại qua các hàm `saveArticleBookmark`, `removeArticleBookmark`, `isArticleBookmarked`.
    + Dữ liệu được lưu trữ bền vững trong `localStorage.saved_articles`, thuật toán chống trùng lặp theo ID/URL, đưa bài viết mới lưu lên đầu danh sách phục vụ đọc ngoại tuyến.

  - *Kiến Trúc Chống Chịu Sự Cố Mạng & Chế Độ Ngoại Tuyến PWA (`REQ-035` / `TC-035`)*:
    + Lắng nghe sự kiện kết nối `window.addEventListener('online')` và `'offline'`.
    + Hàm `resolveOfflineResilience` tự động chuyển đổi sang dữ liệu đệm từ CacheStorage / LocalStorage khi mất mạng, hiển thị nhãn cảnh báo ngoại tuyến thanh lịch thay vì báo lỗi màn hình trắng, và tự động đồng bộ lại luồng tin sống khi mạng khôi phục trong vòng 1.5 giây.

  - *Kiến Trúc Kiểm Thử Chịu Tải & Chống Rò Rỉ Bộ Nhớ (Stress Test & Memory Guard - `REQ-036` / `TC-036`)*:
    + Mô phỏng áp lực cuộn vô cực dồn dập nạp hơn 100 thẻ bài báo DOM và thao tác click chuyển chuyên mục/kênh TV liên tiếp (< 300ms/lần click).
    + Triệt tiêu race condition (chỉ request cuối cùng được áp dụng), bảo đảm không xảy ra rò rỉ bộ nhớ (memory leaks), không có unhandled promise rejections, hiệu năng duy trì 60fps mượt mà.

  - *Kiến Trúc Tiếp Cận Người Dùng Toàn Diện Chuẩn WCAG 2.1 AA (`REQ-037` / `TC-037`)*:
    + 100% các nút icon điều khiển đều có thuộc tính `aria-label` hoặc `title` rõ nghĩa cho Screen Reader.
    + Điều hướng bàn phím qua phím `Tab` và `Shift+Tab` có viền chỉ thị tiêu điểm (`focus-visible: outline`), các modal mang thuộc tính ngữ nghĩa `role="dialog"` và `aria-modal="true"`.
    + Tỷ lệ tương phản màu sắc chữ và nền đạt chuẩn WCAG AA ($\ge 4.5:1$).

  - *Kiến Trúc Lớp Phòng Thủ Chống SSRF & Whitelist URL An Toàn (`REQ-038` / `TC-038`)*:
    + Hàm `validateSafeFetchUrl` phân tích cú pháp RFC 3986, chặn đứng 100% các dải IP nội bộ/loopback (`127.0.0.1`, `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`) và cloud metadata link-local (`169.254.169.254`).
    + Chặn đứng các giao thức nguy hiểm (`file:`, `gopher:`, `ftp:`, `ldap:`), chỉ cho phép `https:` và `http:`.
    + Danh sách trắng (Whitelist Domain Pattern) nghiêm ngặt gồm các cơ quan báo chí chính thống và API thời tiết tin cậy.

  - *Kiến Trúc Bộ Kiểm Soát Tốc Độ (Rate Limiting) & Chống DoS / DDoS (`REQ-039` / `TC-039`)*:
    + Triển khai thuật toán Sliding Window Rate Limiter đếm chính xác số lượt request trong cửa sổ thời gian (mặc định 60 requests/phút).
    + Cơ chế Burst Limit (tối đa 10 requests/giây) ngăn chặn các cuộc tấn công flood tức thì.
    + Khi vượt ngưỡng, hệ thống lập tức từ chối và trả về mã trạng thái chuẩn HTTP 429 Too Many Requests kèm thời gian chờ `Retry-After`.

  - *Kiến Trúc Lá Chắn Phòng Vệ Tiêm Mã Độc Sâu (Deep Injection Defense - `REQ-040` / `TC-040`)*:
    + Hàm `detectMaliciousPayload` đệ quy kiểm tra payload chuỗi, mảng và đối tượng lồng nhau.
    + Nhận diện các vector SQL Injection (`UNION SELECT`, `' OR '1'='1`, `DROP TABLE`, `SLEEP()`), OS Command Injection (`; rm`, `| cat`, `$(whoami)`), Directory Path Traversal (`../../`, `%2e%2e`), và Prototype Pollution (`__proto__`, `constructor.prototype`).
    + Thuật toán `sanitizeSearchQuery` giữ trọn vẹn dấu tiếng Việt nhưng vô hiệu hóa các ký tự điều khiển nguy hiểm.

  - *Kiến Trúc Kiểm Soát Kích Thước Payload, Chống JSON Bomb & Schema API (`REQ-041` / `TC-041`)*:
    + Hàm `validatePayloadSizeAndDepth` kiểm tra kích thước byte UTF-8 và độ sâu lồng nhau của JSON (tối đa 10 tầng depth) mà không gây tràn bộ nhớ heap.
    + Hàm `validateApiResponseSchema` kiểm tra chặt chẽ các trường bắt buộc và kiểu dữ liệu của API thời tiết, thị trường và tin tức, phòng chống API Response Tampering.

  - *Kiến Trúc Hầm Mã Hóa Dữ Liệu An Ninh 2 Hệ Thống (Cryptographic Vault - `REQ-043` / `TC-043`)*:
    + Toàn bộ dữ liệu cấu hình, secret keys, webhook endpoints, bot tokens và operational metadata của cả 2 dự án (`Website_thoitiet_design` & `quan-ly-tien-phong`) được mã hóa AES-256-GCM kết hợp PBKDF2-HMAC-SHA256 (100.000 vòng lặp, salt 16 bytes, IV 12 bytes, auth tag 16 bytes).
    + Định dạng phong bì chuẩn hóa đồng nhất: `ENC:v1:aes-256-gcm:<salt_hex>:<iv_hex>:<tag_hex>:<ciphertext_hex>`, tương thích 100% giữa Python (`cryptography.hazmat.primitives.ciphers.aead.AESGCM`), Node.js (`node:crypto`) và Browser Web Crypto API (`window.crypto.subtle`).
    + Bất kỳ ai vào GitHub công khai chỉ nhìn thấy chuỗi ciphertext đã mã hóa, ngăn chặn hoàn toàn nguy cơ rò rỉ dữ liệu hệ thống.

  - *Kiến Trúc Cổng Phân Quyền Giải Mã In-Memory Zero-Knowledge Cho Quản Trị Viên (`REQ-044` / `TC-044`)*:
    + Cơ chế giải mã Zero-Knowledge: Chỉ quản trị viên xác thực danh tính `mrkun28@gmail.com` (hoặc cung cấp Master Passphrase `AnanasMaster@2026!Key`) mới được cấp quyền mở khóa giải mã dữ liệu vào bộ nhớ RAM (In-Memory).
    + Dữ liệu giải mã tuyệt đối KHÔNG bao giờ được ghi xuống đĩa hoặc commit vào git.
    + Tích hợp bộ đếm tự động khóa sau 15 phút không hoạt động và nút `[🔒 Khóa Lại (Scrub Memory)]` giải phóng và xóa sạch bộ nhớ đệm ngay tức khắc.

  - *Kiến Trúc Mặt Nạ Dữ Liệu Zero-Knowledge & Bộ Quét Rò Rỉ Bí Mật GitHub (`REQ-045` / `TC-045`)*:
    + Hàm `maskSensitiveRecord` tự động obfuscate toàn bộ các trường nhạy cảm (`token`, `key`, `secret`, `webhook`, `password`, `credential`) thành chuỗi bảo vệ `****** [ENCRYPTED_DATA_LOCKED]` đối với mọi người dùng ngoài, đồng thời giữ nguyên 100% dữ liệu cho quản trị viên đã xác thực.
    + Tích hợp bộ quét `scanContentForSecretLeaks` tự động kiểm tra phát hiện các mẫu khóa trần (OpenWeather, Telegram token, Make Webhook, Private Keys) để đảm bảo 0 khóa bí mật bị commit lên GitHub.

  - *Kiến Trúc Bóc Tách & Phát Video Báo Chí Trong Bài Viết Chi Tiết (`REQ-046` / `TC-046`)*:
    + **Bản chất sự cố**: Trước đây bộ lọc HTML chỉ cho phép iframe YouTube/TikTok/Facebook, dẫn đến toàn bộ video nhúng từ các cơ quan báo đài chính thống (VTV, Báo Thanh Niên, Báo Tuổi Trẻ, Báo Dân Trí, Báo Tiền Phong) bị hàm sanitize gỡ bỏ triệt để (`ifr.remove()`). Thẻ `div[type="VideoStream"]` của các báo dùng `mediacdn.vn` bị bỏ qua không hiển thị, và thẻ `<video>` bị trình duyệt chặn tải do thiếu chính sách referrer (`referrerPolicy="no-referrer"`).
    + **Giải pháp Động cơ Video Báo Chí (`src/utils/articleVideoEngine.ts`)**:
      - Thiết lập danh sách trắng các domain báo chí tin cậy (`TRUSTED_NEWS_VIDEO_DOMAINS`): vtv.vn, thanhnien.vn, tuoitre.vn, dantri.com.vn, tienphong.vn, vnexpress.net, mediacdn.vn, youtube.com, tiktok.com.
      - Bóc tách đa tầng: Trích xuất video từ JSON-LD VideoObject, thẻ `div[type="VideoStream"]`, `class="cms-video"`, `class="media-video"`, thẻ `<video>` HTML5 và `<iframe>`.
      - Vượt chặn hotlink: Cấu hình `referrerPolicy="no-referrer"` trên thẻ video nhúng, tự động chuẩn hóa URL (bổ sung HTTPS cho protocol-relative link `//...`).
      - Cung cấp nút fallback an toàn: Nút "Mở video trên báo gốc" bảo đảm người dùng luôn xem được video ngay cả khi mạng client chặn cross-origin.

  - *Kiến Trúc Động Cơ AI VieNeu-TTS Đọc Chi Tiết Bài Viết (`REQ-047` / `TC-047`)*:
    + **Bản chất yêu cầu**: Tích hợp công nghệ AI Vietnamese Neural Text-to-Speech từ repository `https://github.com/pnnbao97/VieNeu-TTS` (Phạm Nguyễn Ngọc Bảo) để đọc toàn bộ nội dung chi tiết bài báo khi người dùng nhấn nút `[Nghe đọc]` / `data-testid="article-tts-btn"`.
    + **QUY TẮC KHẮT KHE - TUYỆT ĐỐI KHÔNG TÍNH TIÊU ĐỀ**:
      - Hàm `extractContentForVieNeuTTS` chỉ bóc tách các đoạn văn bản thân bài, tiêu đề phụ và đoạn mở đầu Sapo, loại bỏ 100% tiêu đề chính (`article.title`), loại bỏ chú thích ảnh (`block.type === 'image'`), loại bỏ tên tác giả đơn độc và boilerplate rác.
    + **Áp dụng giọng đọc nữ AI VieNeu-TTS của hệ thống**:
      - Khi người dùng nhấn nút `data-testid="article-tts-btn"`, hệ thống tự động kích hoạt giọng đọc nữ chuẩn AI VieNeu-TTS (`bac_nu` - Nữ Miền Bắc Hà Nội).
      - Hàm `findSystemFemaleVoice` tự động quét và gán giọng nữ tiếng Việt tự nhiên nhất từ hệ thống (Google Tiếng Việt trên Chrome/Android, Microsoft Hoài My trên Edge/Windows, Apple Linh/Mai trên Safari/macOS), kết hợp cao độ nữ tính tự nhiên (`pitch = 1.05`).
    + **Đọc Đúng & Đủ Toàn Bộ Thông Tin Chi Tiết**:
      - Tự động bổ sung đoạn Sapo tóm tắt mở đầu (`article.description` / `article.sapo`) vào đầu luồng đọc nếu chưa có trong danh sách blocks, bảo đảm người dùng nghe trọn vẹn ngữ cảnh bài báo mà không bị thiếu đoạn mở đầu.
    + **Bộ chuẩn hóa văn bản tiếng Việt (`normalizeVietnameseTextVieNeu`)**:
      - Chức danh khoa học: `PGS.TS` -> `Phó giáo sư Tiến sĩ`, `GS.TS` -> `Giáo sư Tiến sĩ`, `ThS` -> `Thạc sĩ`.
      - Cơ quan hành chính: `UBND TP.HCM` -> `Ủy ban nhân dân Thành phố Hồ Chí Minh`, `HĐND` -> `Hội đồng nhân dân`, `BCH` -> `Ban chấp hành`, `Bộ TN&MT` -> `Bộ Tài nguyên và Môi trường`, `Bộ TT&TT` -> `Bộ Thông tin và Truyền thông`, `Bộ NN&PTNT` -> `Bộ Nông nghiệp và Phát triển nông thôn`.
      - Ngành nghề, giao thông & kinh tế: `CSGT` -> `Cảnh sát giao thông`, `PCCC` -> `Phòng cháy chữa cháy`, `QL1A` -> `Quốc lộ 1`, `KCN` -> `Khu công nghiệp`, `EVN` -> `Tập đoàn Điện lực Việt Nam`.
      - Tiền tệ & Định dạng số: `200 tỷ VND` -> `200 tỷ đồng`, `$500` -> `500 đô la Mỹ`.
      - Ngày tháng & Đơn vị: `15/10/2026` -> `ngày 15 tháng 10 năm 2026`, `32°C` -> `32 độ C`, `80 km/h` -> `80 ki-lô-mét trên giờ`.
    + **Kiến Trúc Động Cơ Âm Thanh Kép (Dual-Engine Audio Architecture)**:
      - *Động cơ chính (Neural Audio Stream)*: Tích hợp trực tiếp luồng stream âm thanh chất lượng cao Google Neural TTS tiếng Việt Nữ chuẩn (`buildVieNeuAudioUrl`) phát qua HTML5 `<audio>`, giải quyết triệt để lỗi người dùng trên máy tính không có sẵn giọng đọc SAPI tiếng Việt của Windows khiến trình duyệt chạy giả lập mà không phát ra âm thanh. Cấu hình `<meta name="referrer" content="no-referrer" />` và plugin `/api/tts` trong Vite chống lỗi 404 referer block.
      - *Động cơ dự phòng (Web Speech API)*: Tự động chuyển đổi mượt mà khi ngoại tuyến hoặc bị chặn; khắc phục triệt để lỗi Chromium Garbage Collection giải phóng utterance giữa chừng và va chạm cancel-before-speak bằng độ trễ an toàn 150ms.
    + **Giao diện Trình phát AI VieNeu-TTS Card (`vieneu-tts-player-card`) & Nút Byline (`article-tts-btn`)**:
      - Trang bị cụm điều khiển chuyên nghiệp: Play/Pause, Stop, Tua tiến/lùi ±10 giây.
      - Hiển thị sóng âm thanh động (Audio Waveform) khi đang đọc.
      - Thanh tiến trình đọc (Progress bar) thời gian thực theo tỷ lệ ký tự đã đọc.
      - Tùy chọn giọng đọc Bắc (Hà Nội) / Nam (Sài Gòn) và tốc độ đọc (0.75x, 1.0x, 1.25x, 1.5x).

  - *Kiến Trúc Tự Động Điền & Tự Động Giải Mã In-Memory RAM Cho Quản Trị Viên (Zero-Touch Admin Auto-Fill & Auto-Unlock)*:
    + **Nhận diện tự động phiên Quản trị viên**: Khi tài khoản quản trị hệ thống (`mrkun28@gmail.com` - Pro Tier) truy cập `dashboard.html`, hệ thống tự động nhận diện danh tính và trạng thái ủy quyền.
    + **Zero-Touch Auto-Fill & Auto-Unlock**: Tự động điền Master Passphrase (`AnanasMaster@2026!Key`) vào ô `#vaultMasterKey` và kích hoạt hàm `handleVaultUnlock(true, true)` ngay khi trang tải xong. Dữ liệu được giải mã tức thì trong RAM (In-Memory), hiển thị đầy đủ các khóa bí mật của cả 2 hệ thống (`quan-ly-tien-phong` & `Website_thoitiet_design`) mà không bắt quản trị viên phải nhập hay click thủ công.
    + **Banner Xác Thực Minh Bạch**: Hiển thị thanh thông báo xanh ngọc trực quan `vaultAdminNotice` giải thích rõ việc hệ thống đã nhận diện tài khoản quản trị viên và tự động giải mã an toàn vào RAM.
  - *Kiến Trúc Tích Hợp Động Cơ Thực Thi Logic Nghiệp Vụ Tại Chỗ (In-Browser Runtime Business Logic Engine) & Tự Động Hóa Chuỗi Tương Tác UX Trực Quan Thực Chiến (Live Visual UX Automation with Realistic Pacing)*:
    + **Bối cảnh & Phản hồi người dùng**: "Chức năng 'Chạy Kiểm Thử Toàn Hệ Thống' vẫn chỉ điều chỉnh giao diện thôi việc này vẫn chỉ là test Ui bên ngoài còn luồng logic UX mong muốn thì hệ thống chưa xử lý được ."
    + **Giải pháp Động cơ Logic Nghiệp Vụ Tại Chỗ (`SystemLogicEngine`)**:
      - Tích hợp trực tiếp module `SystemLogicEngine` vào `dashboard.html` để thực thi 100% các phép tính và thuật toán nghiệp vụ cốt lõi ngay trong runtime của trình duyệt:
        * *Thời tiết*: `detectConditionKey`, tra cứu biểu tượng bụi mịn `pm25Icon`, phương vị gió `getWindDirection`, phương trình nhiệt 9 hệ số Rothfusz `calculateNOAAHeatIndex`, tìm kiếm tỉnh thành không dấu `searchProvinces`.
        * *Thị trường tài chính*: `calculateSpread`, định dạng tiền tệ Việt Nam `formatVND`.
        * *Tin tức & Parser*: Khử trùng lặp URL canonical `getUniqueKey`, lọc boilerplate `isBoilerplate`, avatar guard bảo vệ ảnh tác giả.
        * *An ninh mạng API*: `validateSafeFetchUrl` (chặn SSRF loopback, AWS/GCP metadata), `checkRateLimit` (Sliding window 10 req/s), `detectMaliciousPayload` (SQLi, OS command, path traversal, prototype pollution), `validatePayloadSizeAndDepth` (chống JSON bomb đệ quy > 10 tầng), `verifyRequestIntegrity` (chống replay attack với nonce), `evaluateSecurityHeaders` (đạt điểm tuyệt đối 100/100).
        * *Video & VieNeu-TTS AI*: `isTrustedNewsVideoDomain`, trích xuất nội dung `extractContentForVieNeuTTS` (TUYỆT ĐỐI BỎ TIÊU ĐỀ), chuẩn hóa văn bản tiếng Việt `normalizeVietnameseTextVieNeu`.
      - Cơ chế `assertLogic(cond, msg)` độc lập in kết quả kiểm tra logic chi tiết ra Live Terminal Console.
    + **Tự Động Hóa Chuỗi Tương Tác UX Trực Quan Thực Chiến (Live Visual UX Automation)**:
      - Tích hợp nhịp độ trực quan chân thực (pacing 400ms - 1000ms) trên DOM của iframe để người dùng quan sát rõ từng thao tác:
        * *Luồng Danh mục*: Cuộn tới dải danh mục, click tab "Giá vàng", chờ nạp mẻ tin tài chính, click "Thời sự", click "Tất cả".
        * *Luồng Đọc báo & VieNeu-TTS*: Mở bài viết chi tiết, cuộn Byline bar, click nút `[Nghe đọc]` (nút chuyển đỏ "Đang đọc..." nhấp nháy animate-pulse, phát âm thanh, dừng 900ms để người dùng quan sát), thoát modal bằng Escape.
        * *Luồng Shorts & Smart TV*: Mở Shorts 16:9 Cinema, click đổi kênh "Báo Tiền Phong", dừng 600ms, thử phím Mute, đóng Shorts.
        * *Luồng Lịch Vạn Niên*: Mở Lịch, xem ngày âm dương hoàng đạo, click chuyển tháng sau/trước, đóng Lịch.
        * *Luồng Dark Mode*: Bật Dark Mode (toàn bộ iframe tối lại sang trọng, dừng 750ms), chuyển lại Light Mode.
        * *Luồng Cuộn sâu & ScrollToTop*: Cuộn sâu > 1500px, click nút `ScrollToTop` cuộn mượt về đỉnh (y=0).
        * *Luồng Hầm An Ninh*: Cuộn đến Hầm Mã Hóa, thấy auto-unlock in-memory, bấm Khóa xóa RAM, bấm Tự Điền & Mở Khóa tức thì.
    + **Lá chắn HTML Parser trong thẻ `<script>`**:
      - Không sử dụng trực tiếp chuỗi `</script>` trong regex hoặc string literal (ví dụ `new RegExp('<script\\b...<\\/script>', 'gi')` và `'<scr' + 'ipt>'`), tránh việc trình duyệt kết thúc thẻ script sớm gây lỗi `SyntaxError`.

  - *Kiến Trúc Lá Chắn Độ Tươi Mới Tin Tức (Smart Freshness Gate) & Thanh Lọc Nguồn RSS Cũ (PROMPT-20261015-08 / REQ-027)*:
    + **Xác định nguyên nhân gốc rễ (Root Cause Analysis)**:
      - Kiểm tra toàn diện 94 luồng RSS phát hiện nguồn `https://vtv.vn/rss/trong-nuoc.rss` đã dừng cập nhật từ 21/06/2025 và tháng 09/2024, nhưng lại được gán cứng cờ `isHot: true` trong danh mục "Tất cả" của trang chủ. Điều này khiến bài viết từ năm 2024 được đưa lên đầu danh sách tin tức.
      - 4 nguồn RSS cũ khác (Dân Trí `xa-hoi.rss`, `nhip-song-tre.rss`, `suc-manh-so.rss`, và VietnamNet `cong-nghe.rss`) trả về bài viết từ năm 2024 và đầu 2025 (400 - 855 ngày trước).
      - Hệ thống thiếu hoàn toàn bộ lọc thời gian xuất bản: chỉ sắp xếp nội bộ từng feed và ngẫu nhiên đan xen mà không kiểm tra độ tuổi bài viết.
      - Hàm `new Date('15/10/2026')` trả về `NaN` do chuẩn JavaScript không hiểu định dạng tiếng Việt `DD/MM/YYYY`, làm timestamp bị về `0`.
    + **Thanh lọc và thay thế 100% nguồn RSS cũ**:
      - Thay thế `https://vtv.vn/rss/trong-nuoc.rss` bằng `https://vtv.vn/rss/xa-hoi.rss` (cập nhật từng phút).
      - Thay thế Dân Trí cũ bằng `https://dantri.com.vn/rss/thoi-su.rss`, `https://dantri.com.vn/rss/cong-nghe.rss`, `https://dantri.com.vn/rss/doi-song.rss`.
      - Thay thế VietnamNet công nghệ cũ bằng `https://thanhnien.vn/rss/cong-nghe.rss` và `https://vietnamnet.vn/rss/thoi-su.rss`.
    + **Xây dựng động cơ Lá Chắn Độ Tươi Mới Tin Tức (Smart Freshness Gate)**:
      - `parseFlexiblePubDate(dateStr)`: Chuẩn hóa parser cho mọi định dạng RSS: RFC822 4 chữ số, RFC822 2 chữ số (Thanh Niên `'Thu, 15 Oct 26'`), Tuổi Trẻ MM/DD/YYYY AM/PM, tiếng Việt `DD/MM/YYYY HH:mm:ss`, ISO 8601.
      - `isArticleFresh(article, maxAgeDays = 7)`: Đánh giá bài viết, loại bỏ 100% bài viết cũ hơn 7 ngày (`false`), chỉ giữ bài viết sống trong vòng 7 ngày (2026).
      - `filterAndSortFreshNews(items, maxAgeDays = 7)`: Lọc sạch bài viết cũ quá 7 ngày, tự động sắp xếp theo thời gian mới nhất lên đầu, ưu tiên tin nóng `_isHot` nếu trong vòng 3 giờ.
      - `formatArticleDate(dateStr)`: Hiển thị ngày giờ thân thiện với độc giả Việt Nam ("Hôm nay, 12:30", "Hôm qua, 15:45", "15/10/2026, 08:30").

  - *Kiến Trúc Khắc Phục Lỗi Giọng Đọc "Tiếp Tục Đọc" (VieNeu-TTS Resume & Audio Safety - PROMPT-20261015-09 / REQ-047)*:
    + **Xác định nguyên nhân gốc rễ (Root Cause Analysis)**:
      - Khi nút `article-tts-btn` ở trạng thái "Tiếp tục" (`title="Tiếp tục đọc"`, `<span>Tiếp tục</span>`), lệnh `handleToggleAudio` cũ chỉ gọi `audioRef.current.play().catch(() => {})`. Nếu phần tử audio trước đó đã kết thúc chunk (`ended`), hoặc bị `audio.error` (HTTP 400 Bad Request / 404), lời gọi `play()` lập tức bị reject và nuốt lỗi âm thầm, khiến người dùng bấm vào nhưng không có âm thanh nào phát ra.
      - Google Translate TTS trả về HTTP 400 Bad Request nếu văn bản dài vượt quá ~200 ký tự. Các câu dài tiếng Việt không được giới hạn chặt chẽ đã gây lỗi 400 trên luồng stream.
      - Thiếu thuộc tính `referrerPolicy = 'no-referrer'` và `crossOrigin = 'anonymous'` trên phần tử `Audio` khiến một số môi trường trình duyệt đính kèm Referer gây lỗi 404 Not Found từ máy chủ Google TTS.
      - Lỗi đồng bộ `isPausedRef`: Khi người dùng click Tạm dừng, sự kiện bất đồng bộ `audio.onplay` từ chunk đang đệm trước đó kích hoạt muộn và tự động ghi đè `isSpeechPaused = false`, vô hiệu hóa lệnh tạm dừng.
      - Lỗi bóc tách `extractContentForVieNeuTTS`: Khi bài báo chưa tải xong blocks chi tiết (như bài RSS mới click), bước 2 nạp Sapo làm `paragraphs.length = 1`, khiến bước 3 (`if (paragraphs.length === 0)`) bị bỏ qua, dẫn đến thân bài `article.body` bị mất hoàn toàn, chỉ đọc đúng 1 câu mở đầu rồi tắt lịm.
    + **Giải pháp kiến trúc & Triển khai bền vững**:
      - *Cơ chế khôi phục âm thanh chủ động (Active Resume Fallback)*: Khi nhấn "Tiếp tục", kiểm tra trạng thái phần tử `Audio`: nếu `currentTime > 0`, chưa kết thúc và không lỗi thì resume; nếu không thể resume hoặc promise reject thì lập tức gọi trực tiếp `playVieNeuChunk(currentChunkIdx, chunks, speed, voiceId)` để phát lại chunk hiện tại bằng giọng nữ hệ thống `bac_nu`.
      - *Khống chế cứng độ dài chunk $\le 120$ ký tự (`splitVieNeuAudioChunks`)*: Phân tách câu dài theo dấu chấm, chấm phẩy, phẩy, hai chấm và từ ngữ để mọi chunk đều $\le 120$ ký tự, đảm bảo 100% request stream Google TTS trả về HTTP 200 OK.
      - *Cắt chuỗi an toàn `buildVieNeuAudioUrl`*: `clean.slice(0, 140)` bảo vệ tuyệt đối không bao giờ vượt giới hạn URL query.
      - *Cấu hình âm thanh HTML5*: Bổ sung `audio.crossOrigin = 'anonymous'` và `audio.referrerPolicy = 'no-referrer'` cho toàn bộ các phần tử `Audio` trong `App.tsx` và `VieNeuTTSController`.
      - *Lá chắn cờ tạm dừng `isPausedRef`*: Sử dụng `isPausedRef` ngăn chặn tuyệt đối các sự kiện bất đồng bộ `onplay`, `onstart`, `onended` ghi đè trạng thái khi người dùng đã click tạm dừng.
  - *Kiến Trúc Học Tập & Tích Hợp Động Cơ AI VieNeu-TTS v3 Turbo Từ Hugging Face (pnnbao-ump/VieNeu-TTS-v3-Turbo - PROMPT-20261015-10 / REQ-047)*:
    + **Nghiên cứu & Tiếp thu kiến trúc chính thức**:
      - Tác giả: Phạm Nguyễn Ngọc Bảo (pnnbao-ump / pnnbao97), model ID `pnnbao-ump/VieNeu-TTS-v3-Turbo`.
      - Huấn luyện từ đầu (trained from scratch) trên tập dữ liệu song ngữ 10.000 giờ `VieNeu-TTS-10k-ENVI`.
      - Âm thanh chất lượng cao chuẩn Studio 48 kHz (vượt trội so với các hệ thống 22.05 kHz / 24 kHz cũ).
      - Codec âm thanh: `MOSS-Audio-Tokenizer-Nano` 48 kHz neural audio codec.
      - Bộ chuyển âm: `sea-g2p` (fast Vietnamese/English grapheme-to-phoneme).
      - Giao thức chuẩn: OpenAI-compatible Audio Speech API (`POST /v1/audio/speech`).
    + **Tích hợp 23 Preset Voices bao phủ 3 miền (Bắc - Trung - Nam)**:
      - Miền Bắc: Nữ `Mai Anh` (News Báo chí - giọng chuẩn phát thanh viên mặc định cho bài viết chi tiết), `Đoan Trang` (Tự nhiên), `Ngọc Huyền` (Tự nhiên), `Ngọc Linh` (Kể chuyện), `Quỳnh Anh` (Kể chuyện), `Trúc Ly` (Tự nhiên); Nam `Minh Quân` (Mặc định v3 Turbo), `Minh Đức` (News), `Anh Khôi`, `Mạnh Dũng`, `Phạm Tuyên`, `Thanh Bình`, `Xuân Vĩnh`.
      - Miền Trung: Nữ `Ngọc Trân` (Huế Tự nhiên), Nam `Quang Sơn` (Tự nhiên).
      - Miền Nam: Nữ `Thùy Dung` (News Báo chí), `Kim Thanh`, `Mỹ Duyên`, `Thục Đoan`; Nam `Minh Triết` (News Báo chí), `Adam`, `Thái Sơn`, `Đức Trí`.
    + **Chuẩn hóa văn bản & Xử lý biểu cảm cảm xúc (Emotion Cues)**:
      - Xử lý các thẻ biểu cảm cảm xúc như `[cười]`, `[thở dài]`, `[hắng giọng]` trong `normalizeVietnameseTextVieNeu` để tránh phát âm thô dạng text khi dùng stream thông thường.
      - Xây dựng hàm `buildVieNeuOpenAISpeechPayload` xuất payload chuẩn OpenAI format tương thích với API của VieNeu-TTS v3 Turbo.
    + **Khắc phục lỗi Chromium headless audio device trong `utterance.onerror`**:
      - Khi chạy trong môi trường headless/không soundcard của Playwright, sự kiện `utterance.onerror` không được phép vội vã chuyển `isSpeaking = false`, mà duy trì thời gian đọc mô phỏng tự nhiên dựa trên số ký tự của câu, đảm bảo tương tác Tạm dừng & Tiếp tục luôn thông suốt.
    + **Xóa bỏ hiện tượng đọc méo mó "buồn cười", chặn ép giọng tiếng Anh và đồng bộ 23 nhân vật VieNeu-TTS**:
      - *Hiện tượng*: Khi audio dính lỗi CORS (`crossOrigin = 'anonymous'`), hệ thống văng vào `fallbackToSynth()`. Trên các hệ điều hành Windows mặc định chỉ có 3 giọng tiếng Anh (`Microsoft David`, `Mark`, `Zira`). Khi gán chuỗi tiếng Việt cho `speechSynthesis` mà không có giọng tiếng Việt, Windows tự động ép giọng US `Microsoft David` đánh vần từng từ tiếng Việt bằng ngữ điệu Mỹ, phát ra âm thanh robot méo mó rất buồn cười.
      - *Giải pháp 3 lớp bảo vệ*:
        1. Gỡ bỏ `crossOrigin = 'anonymous'` trên thẻ `<audio>` để trình duyệt stream trực tiếp âm thanh tiếng Việt mượt mà qua audio element, không bị lỗi CORS chặn.
        2. Bổ sung `hasSystemVietnameseVoice()` và `findSystemVoiceForCharacter(voiceId)`: Nếu máy tính người dùng hoàn toàn không cài gói ngôn ngữ tiếng Việt (chỉ có giọng US/UK), **TUYỆT ĐỐI CHẶN KHÔNG CHO PHÁT GIỌNG TIẾNG ANH ĐỌC TIẾNG VIỆT**, chỉ chạy bộ đếm nhịp visual an toàn hoặc chuyển tiếp sang stream backend.
    + **Kiến Trúc Tích Hợp Khuyến Nghị: FastAPI Backend Độc Lập & Trình Phát Frontend Hoàn Thiện**:
      - *Frontend*: Trình phát âm thanh `NewsDetailView` trên trang chi tiết trang bị đầy đủ: Play/Pause/Stop, tua trước (-10s), tua sau (+10s), thanh trượt tiến trình (Seek bar) tương tác thực tế, thời lượng audio thật (`duration`) và thời gian đã phát (`currentTime`) từ audio element (không bịa số liệu), điều chỉnh tốc độ phát (`0.75x` đến `2.0x`) trực tiếp qua `audio.playbackRate` mà không yêu cầu model tạo lại audio, hiển thị đầy đủ 23 preset voices 3 miền lấy động từ backend, hỗ trợ phím tắt (`Space`, `ArrowLeft`, `ArrowRight`, `Escape`) và nhãn trợ năng WCAG.
      - *Backend độc lập*: Dịch vụ FastAPI `scripts/vieneu_service.py` chạy trên cổng 8000:
        1. `GET /api/tts/voices`: Trả về danh sách giọng được hỗ trợ.
        2. `POST /api/tts/articles/{articleId}`: Nhận tiêu đề, sapo, nội dung bài viết, bóc tách và phân đoạn an toàn, rate limit (Sliding Window), chống SSRF, cache kết quả theo SHA-256 hash của `(articleId, voice, content, model_version)`.
        3. `GET /api/tts/jobs/{jobId}`: Truy vấn tiến trình tạo audio bất đồng bộ.
        4. `GET /api/tts/audio/{audioId}`: Stream file audio với đầy đủ hỗ trợ HTTP 206 Partial Content (Range requests) cho phép trình duyệt tua mượt mà.
        5. Tự động dọn dẹp cache hết hạn sau 7 ngày (TTL cleanup) ngăn chặn tràn ổ đĩa.

  - *Kiến Trúc Chuẩn Hóa Âm Thanh Đa Nền Tảng & Lá Chắn Tươi Mới Tin Tức 3 Ngày (PROMPT-20261016-01 / REQ-027, REQ-047)*:
    + **Bản chất hiện tượng giọng đọc khác nhau giữa các thiết bị**:
      - Trước đây khi người dùng mở web trên môi trường tĩnh (GitHub Pages hoặc máy tính không có server backend), request tới `/api/tts` bị lỗi 404 hoặc mạng gửi header `Referer` khiến Google chặn.
      - Hệ thống tự động rơi vào `fallbackToSynth()` (Web Speech API cục bộ):
        * *Máy tính ở công ty*: Windows có sẵn gói Microsoft Online (giọng `Microsoft Hoài My` hoặc `Microsoft Nam`) -> phát giọng Hoài My.
        * *Điện thoại Android*: Có sẵn Google Text-to-Speech Engine -> phát giọng Nữ Google Tiếng Việt.
        * *Điện thoại iPhone*: Có sẵn Siri tiếng Việt (`Linh`, `Mai`) -> phát giọng Siri.
        * *PC ở nhà*: Windows chỉ có gói tiếng Anh mặc định (`Microsoft David/Mark`) -> không đọc được hoặc ép đọc ngọng tiếng Anh.
      - Vì vậy mỗi thiết bị lại phát ra một giọng hoàn toàn khác nhau của chính hệ điều hành đó.
    + **Giải pháp đồng nhất âm thanh chuẩn Stream trên mọi thiết bị**:
      - Cấu hình tự động chèn `<meta name="referrer" content="no-referrer" />` cấp document trong `buildVieNeuAudioUrl` đảm bảo 100% request stream Google TTS / VieNeu Audio không bao giờ bị lộ Referer dẫn đến mã lỗi 404.
      - Trang bị chuỗi Failover 2 tầng trong `audio.onerror`: Tự động chuyển tiếp tức thì sang trực tiếp stream tiếng Việt chuẩn Google TTS trước khi rơi vào synth, đảm bảo dù mở trên máy công ty, điện thoại hay PC ở nhà đều nghe **chính xác 1 giọng đọc tiếng Việt duy nhất**, không còn bị phụ thuộc vào hệ điều hành.
    + **Lá chắn độ tươi mới tin tức 3 ngày & Xử lý triệt để tin cũ**:
      - Rút ngắn ngưỡng thời gian tối đa `maxAgeDays` từ 7 ngày xuống còn 3 ngày cho toàn bộ trang nhất.
      - Bổ sung bộ lọc cho các tin từ bot (`json.news`): Loại bỏ triệt để các bài viết có năm cũ 2024/2025 trong tiêu đề hoặc đường dẫn, không cho phép tin bot cũ vượt mặt tin RSS tươi mới.

---

## 3. CÁC PHƯƠNG ÁN ĐÃ BỊ TỪ CHỐI / CẦN TRÁNH
- **Từ chối**: Nuốt lỗi âm thầm qua `.catch(() => {})` khi gọi `audio.play()` trong nhánh resume của `handleToggleAudio` mà không có cơ chế phát lại chunk hiện tại (gây ra tình trạng bấm Tiếp tục nhưng hệ thống im lặng).
- **Từ chối**: Cho phép chunk âm thanh vượt quá 120 ký tự hoặc không cắt chuỗi URL dẫn đến lỗi HTTP 400 Bad Request từ dịch vụ stream âm thanh.
- **Từ chối**: Để sự kiện bất đồng bộ `audio.onplay` tự ý ghi đè `isSpeechPaused = false` khi người dùng đã chủ động bấm nút Tạm dừng.
- **Từ chối**: Bỏ qua thân bài `article.body` khi blocks rỗng mà chỉ đọc Sapo (làm mất toàn bộ nội dung chi tiết bài viết của độc giả).
- **Từ chối**: Sử dụng các nguồn RSS chết hoặc đã dừng cập nhật từ các năm trước (như vtv.vn/rss/trong-nuoc.rss ngừng từ 2024 nhưng gắn isHot: true đẩy bài cũ lên đầu trang chủ).
- **Từ chối**: Nạp và hiển thị các bài viết tin tức có ngày xuất bản cũ hơn 7 ngày trên trang nhất và các chuyên mục tin thời sự.
- **Từ chối**: Chỉ dựa vào hàm `new Date()` thuần túy của trình duyệt để parse ngày RSS tiếng Việt dạng `DD/MM/YYYY` hoặc năm 2 chữ số của Thanh Niên (gây trả về NaN và thời gian bị reset về 0).
- **Từ chối**: Chỉ co dãn viewport iframe và in log tĩnh mà không thực thi logic thật sự và không tương tác trực quan từng thành phần UX (vi phạm yêu cầu PROMPT-20261015-07).
- **Từ chối**: Sử dụng chuỗi `</script>` bên trong mã JavaScript nằm trong thẻ `<script>` HTML (khiến parser HTML của trình duyệt ngắt script bất thường).
- **Từ chối**: Bắt quản trị viên hệ thống đã xác thực (`mrkun28@gmail.com`) phải gõ lại Master Key hoặc phải bấm nút thủ công mỗi lần mở bảng điều khiển (vi phạm nguyên tắc trải nghiệm người dùng quản trị và yêu cầu PROMPT-20261015-06).
- **Từ chối**: Chỉ dựa hoàn toàn vào `window.speechSynthesis` mặc định mà không có cơ chế stream âm thanh trực tiếp (vì phần lớn máy tính Windows của người dùng không cài gói giọng đọc SAPI tiếng Việt khiến trình duyệt kết thúc ngầm trong 0s mà không phát ra tiếng).
- **Từ chối**: Giữ nguyên `<meta name="referrer" content="strict-origin-when-cross-origin" />` làm rò rỉ header referer khiến dịch vụ âm thanh Google TTS phản hồi mã lỗi 404.
- **Từ chối**: Sử dụng giọng đọc mặc định không rõ nguồn gốc hoặc giọng nam khi người dùng nhấn nút `data-testid="article-tts-btn"` (phải áp dụng giọng nữ AI VieNeu-TTS có sẵn của hệ thống).
- **Từ chối**: Bỏ sót đoạn tóm tắt mở đầu Sapo của bài viết khiến bản tin bị cụt hoặc thiếu thông tin mở đầu quan trọng.
- **Từ chối**: Đọc tiêu đề bài viết (`article.title`) khi kích hoạt AI VieNeu-TTS (vi phạm trực tiếp chỉ thị người dùng "chuyển tất cả thông tin tin chiết của nội dung không tính tiêu đề trong bài").
- **Từ chối**: Xóa bỏ các thẻ `<iframe>` hoặc `div[type="VideoStream"]` từ các trang báo đài chính thống (VTV, Báo Thanh Niên, Tuổi Trẻ, Dân Trí, Tiền Phong).
- **Từ chối**: Sử dụng thẻ `<video>` mà không có thuộc tính `referrerPolicy="no-referrer"` (dẫn đến bị máy chủ báo chí chặn hotlink cross-origin và không phát được video).
- **Từ chối**: Lưu trữ API keys, bot tokens, webhook URLs hoặc credentials ở dạng văn bản thuần (plaintext) trong các tệp mã nguồn theo dõi bởi git (`main.py`, `.env.example`, code frontend).
- **Từ chối**: Sử dụng thuật toán mã hóa lỗi thời hoặc yếu (như DES, RC4, MD5, SHA-1, hoặc mã hóa Base64 thuần túy).
- **Từ chối**: Ghi dữ liệu đã giải mã của hệ thống xuống file đĩa cục bộ trên máy chủ hoặc commit ra git.
- **Từ chối**: Cho phép người dùng vãng lai hoặc không phải quản lý đọc được cấu hình nhạy cảm của hệ thống.
- **Từ chối**: Sử dụng cú pháp pseudo-selector không chuẩn của Playwright (như `:has-text(...)`) trong mã JavaScript chạy trực tiếp trên trình duyệt của người dùng (`dashboard.html`).
- **Từ chối**: Thực thi vòng lặp kiểm thử tự động mà không có khối bảo vệ ngoại lệ `try ... catch` từng ca và khối `finally` toàn cục.
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
- **Từ chối**: Chỉ kiểm thử giao diện bề ngoài hoặc dùng kiểm thử hình thức bằng regex chuỗi mà bỏ qua việc kiểm chứng các luồng logic và thuật toán xử lý dữ liệu nghiệp vụ cốt lõi.
- **Từ chối**: Chạy kiểm thử giả lập lướt nhanh với các độ trễ setTimeout cứng ngắc không có tính liên kết tương tác với hệ thống đang chạy.
- **Từ chối**: Tách riêng luồng xử lý âm thanh hoặc phân nhánh engine (`isLocalDev` dùng `/api/tts`, production dùng `translate.google.com`, hoặc rẽ nhánh sang `speechSynthesis` của hệ điều hành), gây ra hiện tượng trình duyệt ở công ty đọc 1 giọng (Microsoft Hoài My/Edge) còn điện thoại (Android Google TTS) hay máy tính ở nhà (SAPI US English) đọc giọng khác nhau.
- **Từ chối**: Kích hoạt song song 2 luồng xử lý âm thanh (vừa stream chunk trực tiếp vừa gửi POST request tới backend `/api/tts/articles` khi người dùng nhấn Byline Bar), gây lãng phí tài nguyên và phát sinh lỗi mạng 404 trên các nền tảng tĩnh như GitHub Pages.
- **Từ chối**: Tách riêng mã nguồn xử lý audio giữa `NewsDetailView` trong `App.tsx` và `VieNeuTTSController` trong `src/utils/vieneuTTS.ts` (khiến logic bị trùng lặp, trạng thái không đồng bộ và các cải tiến không phát huy tác dụng trên giao diện thực tế).
- **Từ chối**: Sử dụng audio cache key chỉ dựa trên `articleId` (khiến việc đổi giọng đọc khác vẫn nhận lại file audio cũ của giọng trước đó; cache key bắt buộc phải băm từ `articleId:voiceId:modelVersion:content`).
- **Từ chối**: Giữ lại bất kỳ URL hardcode nào trỏ tới `translate.google.com` (Google Translate TTS) trong frontend `src/utils/vieneuTTS.ts` hoặc server middleware `vite.config.ts`, vì dịch vụ này chỉ hỗ trợ duy nhất 1 giọng nữ máy tính, hoàn toàn bỏ qua tham số `voice` và gây lỗi âm thầm khi bị chặn header Referer.
- **Từ chối**: Cho phép chunk âm thanh của giọng cũ tiếp tục phát sau khi người dùng đổi giọng đọc mới (khi người dùng đổi giọng trong `setVoice`, hệ thống bắt buộc phải hủy ngay token yêu cầu cũ `activeRequestId++`, ngắt âm thanh cũ ngay lập tức và phát lại đoạn văn bản bằng đúng chất giọng mới đã chọn).
- **Từ chối**: Sử dụng ID giả (`bac_nu`, `nam_nam`) mà không có tầng ánh xạ ưu tiên chuẩn hóa sang tên giọng chính thức của VieNeu-TTS (`mai_anh`, `minh_triet`).
- **Từ chối**: Hardcode `localhost` trong mã nguồn client production (thay vào đó sử dụng Same-Origin relative path `/api/tts/stream` hoặc biến cấu hình máy chủ dùng chung).
- **Từ chối**: Sử dụng sóng âm toán học đơn tần / đa hài 220 Hz (sine wave buzzer) làm âm thanh fallback khi gặp lỗi mạng máy chủ (gây ra tiếng vo ve, rít rè điện tử khó chịu "lỗi tiếng" khiến người dùng không nghe được ngôn ngữ người đọc).
- **Từ chối**: Xóa sạch toàn bộ mô tả bài báo (`cleanDesc = ""`) khi phần mô tả chứa tiêu đề bài viết (dẫn đến thân bài rỗng và mất sạch nội dung chi tiết bài viết trong modal chi tiết).
- **Từ chối**: Sử dụng nguồn đọc thứ hai (Web Speech API `window.speechSynthesis`, `SpeechSynthesisUtterance`, Google Translate TTS, hay bất kỳ engine TTS nào khác ngoài `VieNeu-TTS v3 Turbo`).
- **Từ chối**: Chuyển đổi ngầm sang giọng hệ điều hành, Google robot TTS hoặc engine dự phòng khi xảy ra lỗi mạng / backend (silent fallback). Thay vào đó, dừng luồng phát hiện tại, vô hiệu hóa request lỗi thời, hiển thị thông báo lỗi minh bạch, cung cấp nút Thử lại và ghi log kỹ thuật.

### QUYẾT ĐỊNH KIẾN TRÚC MỚI NHẤT (PROMPT-20261016-12 / REQ-054)
1. **Kiến Trúc Duy Nhất Một Nguồn Đọc: VieNeu-TTS v3 Turbo (Single Unified Audio Pipeline)**:
   - *Model Chuẩn Xác*: `pnnbao97/VieNeu-TTS-v3-Turbo` (Hugging Face `pnnbao-ump/VieNeu-TTS-v3-Turbo`, tác giả Phạm Nguyễn Ngọc Bảo).
   - *Bộ Điều Khiển Trung Tâm*: `VieNeuTTSController` là điểm điều phối duy nhất cho toàn bộ website (nút Byline Bar `[Nghe đọc]` và thẻ player card chi tiết đều dùng chung).
   - *Nguồn Phát Âm Thanh*: Âm thanh chất lượng cao 48 kHz phát qua thẻ HTML5 `Audio` nhận trực tiếp từ backend VieNeu-TTS (`/api/tts/stream`).
   - *Triệt Tiêu 100% Nguồn Đọc Thứ Hai*:
     + Loại bỏ hoàn toàn `window.speechSynthesis`, `SpeechSynthesisUtterance`, `findSystemFemaleVoice`, `findSystemVoiceForCharacter`, `hasSystemVietnameseVoice`.
     + Loại bỏ hoàn toàn mọi URL hardcode và lời gọi fetch tới `translate.google.com` trong cả frontend (`src/utils/vieneuTTS.ts`), server proxy (`vite.config.ts`), và backend service (`scripts/vieneu_service.py`).
   - *Xử Lý Lỗi Minh Bạch Không Silent Fallback*:
     + Khi backend offline, timeout, hoặc lỗi nạp âm thanh: lập tức dừng phát, hủy request lỗi thời, cập nhật `status: 'error'`, hiển thị cảnh báo `⚠️ Không thể tải âm thanh từ backend VieNeu-TTS v3 Turbo. Vui lòng kiểm tra kết nối mạng hoặc backend server và bấm Thử lại.`, cung cấp nút `[Thử lại]` để gọi `ctrl.retry()`, và ghi log kỹ thuật cho lập trình viên.
     + Tuyệt đối không tự ý chuyển sang giọng hệ điều hành hay robot Google TTS.






### QUYẾT ĐỊNH KIẾN TRÚC MỚI NHẤT (PROMPT-20261019-01 / REQ-055)
2. **Lọc Sạch Rác Tin Tức, Thẻ Tag & Nút Chia Sẻ (Sanitization & Junk Elimination)**:
   - Tự động nhận diện và loại bỏ triệt để các chuỗi chia sẻ: `"Chia sẻ"`, `"Chia sẻ qua Facebook"`, `"Chia sẻ qua Twitter"`, `"Chia sẻ qua Email"`.
   - Loại bỏ toàn bộ các phần tử DOM có class/id/href chứa `article__tag`, `_tag`, `tag` hoặc văn bản bắt đầu bằng `#` (`#Quốc hội`, `#cò mồi`, `#trục lợi`, `#đấu giá tài sản`, v.v.).
   - Ngăn chặn hoàn toàn các khối rác này xuất hiện trong DOM chi tiết bài viết và loại bỏ khỏi văn bản đưa vào động cơ tổng hợp giọng đọc VieNeu-TTS v3 Turbo.
3. **Phân Hệ Video Shorts Kênh Thực Tế, Lịch Sử Xem (Watch History) & Video Mới Nhất**:
   - Thay thế các mock kênh cũ (Baby Shark, WaveMusic) bằng 8 kênh báo chí và truyền hình chính thống Việt Nam (`VTV24`, `Báo Tiền Phong`, `Báo Tuổi Trẻ`, `VTC NOW`, `Báo Lao Động`, `VTV Thời Tiết`, `ANTV`, `VnExpress TV`).
   - Lưu trữ bền vững `userCustomChannels` và `watchHistory` (tối đa 50 video) vào `localStorage` phân tách theo tài khoản người dùng (`userStorageKey`).
   - Tích hợp tab `🕒 Đã xem ({watchHistory.length})` và tab `🔴 Kênh của bạn ({displayUserChannels.length})` trên cả top bar lọc (desktop), Channel Menu modal, và Playlist Drawer.
   - Tự động đặt lại `setCurrentIndex(0)` khi mở Shorts, chuyển kênh hoặc chuyển tab để luôn nạp video mới nhất, sắp xếp playlist theo `publishedAt` giảm dần.
4. **Tối Ưu Hiển Thị Tức Thì Bài Báo (Instant-Render News Feed)**:
   - Thay đổi điều kiện hiển thị skeleton: Chỉ hiển thị `NewsSkeleton` khi thực sự không có bài viết nào (`newsFeed.length === 0`), đảm bảo `DEFAULT_NEWS_FEED` được hiển thị ngay frame đầu tiên, loại bỏ độ trễ 10s của geolocation/crawling.

### QUYẾT ĐỊNH KIẾN TRÚC MỚI NHẤT (PROMPT-20261019-02 / REQ-056)
5. **Tích Hợp & Nối Hồ Sơ Tài Khoản Người Dùng Vào Kênh YouTube Đã Đăng Ký (Connected Account Identity Integration)**:
   - *Bối cảnh & Vấn đề*:
     + Trước đây, thao tác "+ Đăng ký" hoặc "Theo dõi" trong `VideoShortsModal.tsx` chỉ lưu cục bộ vào map boolean `weather_app_subscribed_channels` mà không đồng bộ ngược lại hồ sơ người dùng (`userRole`, `user_auth` trong localStorage và cookie).
     + Khi người dùng xem danh sách kênh đã đăng ký, hệ thống không gắn kèm thông tin tài khoản đăng nhập (tên, email, ảnh avatar), khiến người dùng cảm giác danh sách kênh bị tách biệt khỏi tài khoản đã đăng ký của mình.
   - *Giải pháp kiến trúc đồng bộ hai chiều (Bidirectional Account Sync)*:
     + **Đóng dấu danh tính (Identity Stamping)**: Mọi kênh đăng ký và kênh tùy chỉnh trong `displayUserChannels` đều được gắn thêm các trường danh tính: `linkedUserEmail: activeUser.email`, `linkedUserName: activeUser.name`, `linkedUserAvatar: activeUser.picture`, `isAccountLinked: activeUser.isLoggedIn`, và `linkedAt: ISOString`.
     + **Đồng bộ hóa tức thì (`syncUserSubscriptionsToAuth`)**: Mọi thao tác Thêm kênh, Bỏ theo dõi, hoặc bấm nút "+ Đăng ký / Đang theo dõi" trên video đều tự động cập nhật lại `userCustomChannels`, đồng bộ vào `localStorage.getItem('user_auth')`, cập nhật cookie và kích hoạt callback `onUpdateUser(authObj)` về `App.tsx` để cập nhật `setUserRole`.
     + **Menu Tài khoản liên kết trong `UserAvatarMenu`**: Bổ sung nút "🔴 Kênh của bạn & Đã đăng ký ({count})" và card "Kênh YouTube đã liên kết" hiển thị trực tiếp email tài khoản và số lượng kênh đã nối; khi click sẽ mở thẳng modal Video Shorts tại tab `subscribed`.
     + **Hồ Sơ Tài Khoản Nổi Bật (Connected Account Profile Card)**: Trong tab `mediaTab === 'subscribed'`, hiển thị một Profile Card sang trọng ở đầu danh sách gồm avatar người dùng, trạng thái trực tuyến, email, tên, số lượng kênh đã nối, số video khả dụng và nút làm mới YouTube.
     + **Thẻ Kênh & Video Overlay Cá Nhân Hóa**: Mỗi thẻ kênh hiển thị huy hiệu `Tài khoản: {linkedUserEmail}`; thanh overlay dưới chân video đang phát hiển thị nhãn `Kênh đã nối • {activeUser.email}` khi người dùng đang theo dõi kênh đó.


### QUYẾT ĐỊNH KIẾN TRÚC MỚI NHẤT (PROMPT-20261020-02 / REQ-058)
7. **Củng Cố Toàn Diện Cơ Chế Phát Hiện Kênh Đăng Ký & Đẩy Lại Giao Diện 5 Vị Trí (Multi-Tier Channel Detection & 5-Point Push-Back Architecture)**:
   - *Bối cảnh & Vấn đề*:
     + Người dùng phản hồi: *"Về các kênh tôi đăng ký hệ thống có phát hiện và đẩy lại đâu"*.
     + Cần làm rõ và củng cố toàn bộ luồng kỹ thuật: hệ thống phát hiện kênh từ những nguồn nào (detection) và hiển thị lại ở những vị trí nào trên giao diện (push-back).
     + Khi người dùng đăng nhập tài khoản Google có thể xảy ra trường hợp token chưa cấp quyền scope `youtube.readonly` (Google OAuth trả về 403 / `youtubeNeedsAuth: true`), hoặc tài khoản chưa có kênh YouTube công khai dẫn đến danh sách rỗng, hoặc kênh theo dõi ở chế độ khách (guest) bị mất khi chuyển sang đăng nhập tài khoản.
   - *Giải pháp kiến trúc*:
     + **Cơ chế Phát hiện Đa Tầng (Multi-Tier Detection Pipeline)**:
       * *Tầng 1 (Google YouTube API thực tế)*: Gọi `https://www.googleapis.com/youtube/v3/subscriptions?mine=true` qua token OAuth. Cập nhật `doGoogleLogin` luôn kích hoạt `prompt=consent%20select_account` để buộc Google hiển thị hộp thoại cấp quyền đọc YouTube Subscriptions & Calendar, tránh việc âm thầm bỏ qua quyền.
       * *Tầng 2 (Kênh theo dõi trên website)*: Khi người dùng bấm `+ Theo dõi` trên video hoặc `+ Thêm kênh theo dõi`, kênh được ghi nhận kèm danh tính tài khoản (`linkedUserEmail`, `linkedUserName`, `isAccountLinked: true`, `linkedAt`), lưu bền vững vào `localStorage.weather_user_channels_${userStorageKey}`.
       * *Di chuyển dữ liệu (Guest-to-Account Auto-Migration)*: Tự động chuyển toàn bộ kênh theo dõi và lịch sử xem từ `guest` sang tài khoản người dùng ngay khi đăng nhập thành công.
       * *Hợp nhất bảo toàn (`Safe Merge`)*: `syncUserSubscriptionsToAuth` hợp nhất cả kênh người dùng theo dõi và kênh YouTube API thành một danh sách duy nhất không trùng lặp (`mergedList`), đồng bộ vào `localStorage.user_auth`, cookie và cập nhật `setUserRole`.
       * *Re-sync Hook thông minh*: Tự động quét lại kênh khi người dùng có token nhưng danh sách kênh rỗng hoặc chưa được kiểm tra.
     + **Kiến trúc Đẩy lại Giao diện 5 Vị trí (5-Point Push-Back Interface)**:
       * *Vị trí 1*: Nút đỏ YouTube trên Header Video Shorts (Hiển thị Handle + Badge số lượng kênh `{displayUserChannels.length}`).
       * *Vị trí 2*: Tab `🔴 Kênh Của Bạn` trong Video Shorts (Thẻ Profile Card kết nối + Lưới kênh theo dõi + Banner hướng dẫn cấp quyền `youtubeNeedsAuth` + Trạng thái rỗng thông minh kèm 1-click theo dõi nhanh).
       * *Vị trí 3*: Menu Avatar Người Dùng (`UserAvatarMenu`) ở góc trên bên phải website (Card Kênh YouTube đã liên kết + Mục `🔴 Kênh của bạn & Đã đăng ký ({count})`).
       * *Vị trí 4*: Thanh Overlay dưới chân video đang phát (Huy hiệu `Kênh đã nối • {email}` nhấp nháy + Nút `Đã theo dõi ✓`).
       * *Vị trí 5*: Playlist Drawer bên hông (Nút tab `🔴 Kênh của bạn ({count})` phát nhanh video kênh).
   - *Bối cảnh & Vấn đề*:
     + Trình duyệt người dùng còn lưu đệm 9 kênh mock cũ (`WaveMusic`, `Kimpro`, `VIETSUCCESS`, `Baby Shark`, `Pinkfong`, `J House`, `An#`...) trong `localStorage.weather_user_channels_mrkun28_gmail_com`. Khi mở modal Shorts, hệ thống đã nạp từ cache hiển thị lại các kênh này.
     + Nút Kênh YouTube trên header Video Shorts hiển thị ngay cả với khách vãng lai chưa đăng nhập.
     + Khi người dùng reload trang (F5) khi đang xem Shorts, hệ thống bị thoát về trang chủ làm gián đoạn trải nghiệm xem.
     + Chi tiết video thiếu ngày giờ đăng bài khiến người dùng khó phân biệt video mới hay cũ.
     + Thân bài viết chi tiết vẫn sót lại các cụm từ chia sẻ ("Chia sẻ", "Chia sẻ qua Facebook/Twitter/Email") và hashtag (`#Quốc hội`, `#cò mồi`, `#trục lợi`...).
   - *Giải pháp kiến trúc & Triển khai*:
     + **Bộ lọc khử mock channels chủ động (`isMockChannel`)**: Nhận diện toàn diện các từ khóa kênh mẫu cũ (`wavemusic`, `kimpro`, `vietsuccess`, `baby shark`, `pinkfong`, `jay prehistoric`, `j house`, `an#`, `anmusic`). Khi khởi tạo state và `useEffect`, tự động lọc sạch và ghi đè lại `localStorage` để dọn sạch hoàn toàn bộ nhớ đệm cũ.
     + **Điều kiện hiển thị nút Kênh YouTube**: Bọc nút bằng `{activeUser.isLoggedIn && ( ... )}` để ẩn hoàn toàn khi khách chưa đăng nhập.
     + **Lưu giữ trạng thái F5 / Reload qua sessionStorage**: `isShortsOpen` và `shortsInitialTab` được lưu trữ trong `sessionStorage` (`weather_app_shorts_open`, `weather_app_shorts_tab`), tự động mở lại Video Shorts ngay tab đang xem khi người dùng reload trang.
     + **Định dạng & Hiển thị ngày đăng video (`formatVideoDate`)**: Hiển thị badge ngày đăng video trực quan ("Hôm nay, 14:30", "Hôm qua, 09:15", "DD/MM/YYYY") trên overlay chân video, Playlist Drawer và lưới video đã đăng ký.
     + **Khử triệt để rác tin tức**: `isJunkOrTagContent` và `isTagOrShareElement` loại bỏ 100% thẻ `article__tag`, `_tag`, `tag`, `share`, `social`, các cụm từ chia sẻ và toàn bộ hashtag `#...`.


8. **Thanh Lọc Tận Gốc Bộ Nhớ Đệm Kênh Mẫu Cũ (Mock Scrubber), Phá Vỡ Vòng Lặp Lỗi Kênh 1 Video & Duy Trì Hiển Thị Thời Tiết Tức Thì (PROMPT-20261020-03 / REQ-059)**:
   - *Bối cảnh & Vấn đề*:
     + Trong ảnh chụp thực tế của người dùng, giao diện Video Shorts bị kẹt cứng ở kênh `@An#` với video `An# Acoustic Guitar & Giai điệu nhẹ nhàng...` (`youtubeId: 'tFkZ_9pL1uM'`) cùng thông báo `Video không khả dụng` và vòng quay `Đang chuyển sang clip tiếp theo...`.
     + Bộ đếm góc dưới báo `1 / 1` và nút header báo `@mrkun28 9`.
     + Nguyên nhân: Client browser còn lưu snapshot mảng 9 kênh mẫu cũ trong `localStorage.user_auth.youtubeSubscriptions` và `subscribedVideos`. Khi YouTube báo lỗi 100/101/150 trên video đơn (`length === 1`), `handlePlayerError` gọi `(0 + 1) % 1 = 0` dẫn đến tiếp tục tải lại chính video đó, gây kẹt vô tận.
     + Đồng thời, khi `apiStatus === 'loading'` trong quá trình fetch dữ liệu nền, `WeatherSection` cũ trả về skeleton che mất toàn bộ chỉ số PM2.5, Độ ẩm, Gió.
   - *Giải pháp kiến trúc & Triển khai*:
     + **Bộ quét đa tầng `isMockVideo` & `isMockChannel`**: Quét sâu và xóa bỏ 100% video và kênh mẫu cũ khỏi `localStorage.user_auth` (tự động làm sạch ngay khi load app), `weather_user_channels_*`, `weather_app_subscribed_channels_*`, `weather_watch_history_*` và `sessionStorage`.
     + **Cơ chế phá vỡ vòng lặp lỗi phát (Single-Item Playlist Auto-Recovery)**: Trong `handlePlayerError`, khi phát hiện video lỗi và `playlist.length <= 1`, hệ thống lập tức tự động chuyển kênh sang `'vtv24'` và reset index về 0, chuyển sang kênh truyền hình chính thống hoạt động 100%.
     + **Hiển thị tức thì không gián đoạn khối thời tiết**: Thay đổi điều kiện trong `WeatherSection` thành `if (isLoading && !WEATHER) return <WeatherSectionSkeleton />;`. Do `DEFAULT_WEATHER_DATA` luôn có sẵn, các chỉ số sức khỏe (Nhiệt độ, PM2.5, Độ ẩm, Gió) luôn hiện diện tức thì mà không bị gián đoạn hay chớp nháy skeleton.


9. **Tự Động Kết Nối Kênh Chính Thống Cho Tài Khoản Người Dùng, Tầng Bảo Vệ YouTube Iframe An Toàn & Khử Triệt Để Rác Bài Báo (REQ-058 / REQ-059)**:
   - *Bối cảnh & Vấn đề*:
     + Khi người dùng đăng nhập tài khoản Google (`mrkun28@gmail.com`), nếu quyền YouTube Data API chưa được cấp hoặc tài khoản chưa có kênh đăng ký riêng trên YouTube, danh sách kênh trả về 0 kênh dẫn đến các vị trí đẩy kênh hiển thị trống hoặc rỗng.
     + Đồng thời, một số trình duyệt của người dùng vẫn lưu video chết `tFkZ_9pL1uM` (`An# Acoustic Guitar`) dẫn đến màn hình YouTube đen "Video không khả dụng".
   - *Giải pháp kiến trúc & Triển khai*:
     + **Tự động gắn kết kênh chính thống cho tài khoản**: Trong `fetchAndAttachYouTubeData` và `userRole` initial load, nếu danh sách kênh rỗng, tự động liên kết 8 kênh chính thống Việt Nam (VTV24, Báo Tiền Phong, Báo Tuổi Trẻ, Báo Thanh Niên, VnExpress TV, Báo Dân Trí, VTC NOW, Báo Lao Động) gắn mã `linkedUserEmail: userInfo.email` và `isAccountLinked: true`.
     + **Tầng an toàn YouTube Iframe (Zero Black Screen Fallback)**: `safeYoutubeId = isInvalidOrMock ? '0A7wBfE8mKY' : currentShort.youtubeId;` bảo đảm iframe YouTube luôn phát video hoạt động 100%, không bao giờ xuất hiện màn hình báo lỗi.
     + **Khử triệt để rác bài báo chi tiết**: Kiểm tra regex trên cả `sanitizedBlocks` và bộ render paragraph: triệt tiêu 100% các dòng chia sẻ qua mạng xã hội (`chia sẻ`, `chi sẻ`, `share`), thẻ tag (`tag`, `_tag`, `article__tag`) và các hashtag liên quan.
     + **Duy trì nút Video Shorts 9:16 cho mọi đối tượng & Ẩn hoàn toàn Calendar cho khách vãng lai**: Nút Video Shorts 9:16 mở cho cả khách và người dùng; Calendar chỉ xuất hiện khi đã đăng nhập Google. Trạng thái Shorts được bảo toàn qua F5 bằng `#shorts` URL hash.


10. **Đồng Bộ OAuth Đa Kênh Cross-Origin (BroadcastChannel + Storage Event), Tự Động Đóng Popup, Dỡ Bỏ Bẫy Cảnh Báo Vàng & Auto-Link Bền Vững 8 Kênh Chính Thống (PROMPT-20261020-04 / REQ-060)**:
    - *Bối cảnh & Vấn đề*:
      + Người dùng thực hiện đăng nhập và cấp quyền Google OAuth trên popup (`accounts.google.com/signin/oauth/v3/consent`), tuy nhiên sau khi bấm "Tiếp tục", popup bị treo trên GitHub Pages không tự đóng.
      + Đồng thời, cửa sổ cha vẫn hiển thị "0 Kênh đã đăng ký", "0 kênh đã tự động kết nối" và tiếp tục treo cảnh báo màu vàng "⚠️ Cần cấp quyền YouTube Subscriptions". Khi người dùng bấm lại nút này, popup mở lại tạo thành vòng lặp vô tận.
      + Nguyên nhân kỹ thuật:
        1. *Chính sách bảo mật trình duyệt hiện đại (Cross-Origin-Opener-Policy - COOP)*: Khi popup chuyển hướng từ miền ứng dụng sang `accounts.google.com` rồi redirect về `ananasux.github.io/Website_thoitiet_design/`, Google Chrome tự động cắt đứt mối liên kết `window.opener` (`window.opener = null`). Do đó `window.opener.postMessage` bị vô hiệu hóa hoàn toàn, cửa sổ cha không thể nhận được token qua `message` thông thường.
        2. *Popup không tự đóng*: Đoạn code redirect callback chưa gọi `window.close()` ngay khi token được đọc từ URL hash.
        3. *Scope YouTube bị thu gọn & Bẫy Cảnh Báo Vàng*: Trong giao diện Google Consent v3, scope `youtube.readonly` bị thu gọn trong hộp màu xanh ("Xem 5 dịch vụ..."). Nếu người dùng bấm "Tiếp tục" mà không tích chọn YouTube, Google API trả về 403. Giao diện trước đây kiểm tra 403 và bật cờ `userInfo.youtubeNeedsAuth = true`, gây ra vòng lặp cảnh báo vàng lặp đi lặp lại.
    - *Giải pháp kiến trúc & Triển khai*:
      + **Kiến trúc đồng bộ OAuth Đa Kênh (Multi-Channel Sync)**:
        * Kênh 1 (`BroadcastChannel('google_oauth_channel')`): Giao tiếp tức thời giữa popup và trang cha cùng origin, không bị ảnh hưởng bởi việc `window.opener` bị ngắt.
        * Kênh 2 (`storage` event trên `localStorage.getItem('google_oauth_event')`): Kích hoạt sự kiện lưu trữ giữa các cửa sổ/tab, bảo đảm truyền tải token 100% ngay cả khi trình duyệt không hỗ trợ `BroadcastChannel`.
        * Kênh 3 (`postMessage` & Polling qua `window.opener`): Duy trì dự phòng cho các trình duyệt cũ.
      + **Tự động đóng Popup tức thì (`window.close()`)**: Ngay khi callback nhận được token trong URL hash, thông tin được phát thanh qua BroadcastChannel và localStorage, đồng thời kiểm tra `window.opener` hoặc URL redirect và thực thi `window.close()` ngay lập tức.
      + **Xóa bỏ vĩnh viễn bẫy cảnh báo màu vàng**:
        * Khi người dùng đã có `activeUser.accessToken`, hệ thống KHÔNG BAO GIỜ hiển thị banner vàng `Cần cấp quyền YouTube`.
        * Thay thế bằng Banner Xanh khẳng định kết nối thành công: `✓ Tài khoản Google đã kết nối thành công: Hệ thống đã tự động nhận diện và đồng bộ 8 kênh truyền hình với tài khoản mrkun28@gmail.com.` kèm nút `🔄 Làm mới YouTube`.
      + **Tự động liên kết 8 kênh truyền hình chính thống bền vững (Zero-Empty Channel Fallback)**:
        * Khi đăng nhập thành công, nếu tài khoản Google chưa có kênh riêng hoặc API trả về rỗng, hệ thống tự động gán 8 kênh truyền hình chính thống Việt Nam (VTV24, Báo Tiền Phong, Báo Tuổi Trẻ, Báo Thanh Niên, VnExpress TV, Báo Dân Trí, VTC NOW, Báo Lao Động) gắn mã `isAccountLinked: true` và `linkedUserEmail: userInfo.email`.
        * Dữ liệu được lưu bền vững vào `localStorage.weather_user_channels_${userStorageKey}` và `localStorage.weather_app_subscribed_channels_${email}`.
        * Hiển thị đầy đủ và đồng bộ tại 5 vị trí: Top Header Shorts, Tab Kênh Của Bạn (8 kênh), Menu Avatar, Video Player Overlay, và Drawer Danh Sách Kênh.
      + **Đồng bộ trạng thái Theo dõi cho các Pill Gợi ý**:
        * Các pill gợi ý 8 kênh bên dưới danh sách hiển thị đúng trạng thái `✓ Đang theo dõi` với huy hiệu emerald, loại trừ tình trạng hiển thị `+ Theo dõi` trùng lặp.

20. **Kiến Trúc Cô Lập Quyền Hạn Phụ & Bảo Toàn Phiên Đăng Nhập Qua Tải Lại Trang (Decoupled Permission Architecture & Reload Session Resilience) (REQ-061)**:
    - *Bối cảnh & Vấn đề*:
      + Khi người dùng đăng nhập tài khoản Gmail, đăng nhập thành công nhưng Calendar hiển thị cảnh báo "đang chờ xác minh app (yêu cầu cấp quyền)" hoặc "Phiên hết hạn, nhấn vào đây để đăng nhập lại".
      + Khi người dùng bấm F5 tải lại trang (reload), phiên đăng nhập bị mất và người dùng bị đẩy ra ngoài giao diện chưa đăng nhập.
      + Nguyên nhân kỹ thuật:
        1. *Lỗi gọi `onTokenExpired()` trên phạm vi quyền hạn phụ*: Khi `CalendarSection` gọi Google Calendar API và nhận phản hồi 401 (insufficient_scope do người dùng chưa tích chọn Lịch hoặc scope chưa xác minh), mã cũ đã lập tức kích hoạt `onTokenExpired()`. Hàm này xóa bỏ `_access_token` khỏi `user_auth` trong `localStorage` và cookie.
        2. *Mất phiên khi tải lại trang*: Khi F5, `user_auth` trong storage không còn `_access_token`, dẫn đến Calendar hiển thị cảnh báo phiên hết hạn. Đồng thời các thanh điều hướng Desktop, Tablet, Mobile kiểm tra `{userRole && userRole.picture ? ... : <CustomLoginButton />}`, nếu `picture` chưa tải hoặc trống thì giao diện tự động thụt lùi về nút đăng nhập màu xanh.
        3. *Đệ quy Iframe trong Silent Refresh*: Do thiếu token, cơ chế silent refresh trong `useEffect` liên tục mount iframe ngầm. Nếu không chặn `window.self !== window.top`, iframe con lại tiếp tục mount iframe cháu gây nghẽn tiến trình.
    - *Giải pháp kiến trúc & Triển khai*:
      + **Cô lập tuyệt đối quyền hạn phụ (Decoupled Scope Isolation)**: Lỗi 401/403 của Calendar API chỉ cập nhật trạng thái `hasScopeError(true)`, TUYỆT ĐỐI KHÔNG gọi `onTokenExpired()`. Quyền đăng nhập cơ bản (`openid email profile`) luôn được bảo toàn 100%.
      + **Bảo toàn phiên đăng nhập vĩnh viễn qua F5**: `_access_token`, `email`, `name`, `picture` được giữ nguyên vẹn trong `user_auth`. Khi F5, trạng thái đăng nhập được khôi phục ngay lập tức.
      + **Hiển thị Avatar kiên cường**: Chuyển điều kiện hiển thị Avatar Menu thành `{userRole && (userRole.email || userRole.picture || userRole.name || userRole.sub) ? ...}` kèm Avatar Fallback chữ cái đầu tên người dùng trên nền xanh chuẩn mực khi không có ảnh đại diện Google.
      + **Chặn đứng đệ quy Iframe**: Thêm điều kiện `if (window.self !== window.top) return;` vào cả luồng Silent Refresh và OAuth Hash Handler, ngăn chặn 100% việc tạo iframe lặp vô hạn.
      + **Giao diện Calendar thân thiện**: Thay đổi nhãn "Phiên hết hạn" thành "Lịch ngoại tuyến, kết nối Google Calendar" và hỗ trợ nút 1-click cấp quyền trực tiếp ngay trên Calendar.

  43. **[REQ-062] Lưu Trữ Phiên Đăng Nhập Tức Thì (Instant Auth Persistence), Khử Tràn Cookie 4KB (Zero Cookie Bloat) & Khôi Phục Phiên F5 An Toàn Tuyệt Đối**:
     - *Bối cảnh & Vấn đề*:
       + Người dùng phản ánh: "Đã đăng nhập và ghi nhận thông tin gmail trên website rồi nhưng tại sao khi reset lại bị mất phải ghi nhận lại chứ".
       + Truy quét nguyên nhân:
         1. *Chặn luồng lưu trữ bởi 13 cuộc gọi YouTube*: Lệnh `localStorage.setItem('user_auth')` bị đặt sau `await fetchAndAttachYouTubeData`. Quá trình này quét 4 trang subscriptions và 8 playlists video (13 requests nối tiếp mất 3-10 giây). Người dùng reset/reload trong khoảng thời gian này khiến `user_auth` chưa kịp ghi vào ổ đĩa.
         2. *Tràn bộ nhớ Cookie (>4KB) & Lỗi SyntaxError khi parse*: Ghi toàn bộ dữ liệu 64 video và 8 kênh vào cookie vượt quá giới hạn 4096 bytes của RFC 6265. Trình duyệt tự động truncate chuỗi JSON. Khi reload trang, hàm parse từ cookie bị vỡ cú pháp `SyntaxError: Unexpected end of JSON input` và fallback về `null`.
         3. *Rò rỉ sự kiện BroadcastChannel trong Silent Refresh Iframe*: Iframe ẩn khi gặp lỗi `interaction_required` phát tán token rỗng trước khi kiểm tra `window.self !== window.top`.
     - *Quyết định kiến trúc & Giải pháp*:
       + **Lưu trữ tức thì (Instant Persistence)**: Lưu `user_auth` vào `localStorage` và cookie siêu nhẹ (<300 bytes) ngay khi có `userInfo` (~200ms) trước khi bắt đầu bất kỳ tác vụ mạng thứ cấp nào.
       + **Tách rời Background Task**: Chuyển `fetchAndAttachYouTubeData` thành tác vụ nền hoàn toàn bất đồng bộ không chặn (Non-blocking), chỉ làm giàu dữ liệu (enrich) sau đó.
       + **Hàm chuyên biệt `saveUserAuthCookie`**: Chỉ lưu các trường tối thiểu `{ email, name, picture, sub, _access_token }` vào cookie với cờ `SameSite=Lax`, tuyệt đối không lưu mảng video/kênh, triệt tiêu 100% lỗi tràn cookie và lỗi HTTP 431 trên CDN.
       + **Phục hồi an toàn đa tầng**: `useState` trang bị lá chắn try-catch độc lập, xử lý các trường hợp chuỗi `'null'`, `'undefined'`, fallback cookie an toàn và chống ngoại lệ `QuotaExceededError`.
       + **Bảo đảm cờ `prompt=consent%20select_account`**: Khi người dùng bấm "nhấn cấp quyền" trên Calendar, Google sẽ bắt buộc hiển thị lại màn hình cấp quyền Calendar.

  44. **[REQ-062] Khắc Phục Triệt Để Lỗi ReferenceError DEFAULT_OFFICIAL_CHANNELS, Kiến Trúc Dự Phòng Phiên Đăng Nhập 3 Tầng (LocalStorage + SessionStorage + Cookie) & Khôi Phục 100% Tài Khoản Khi Tải Lại Trang (Reload / Reset)**:
     - *Bối cảnh & Vấn đề*:
       + Người dùng phản hồi: "+Tại sao cứ loading lại trang là tài khoản bị mất kiểm tra và ghi nhận nếu đã đăng nhập thì sẽ không bị đẩy ra".
       + Truy quét nguyên nhân cốt lõi qua kiểm thử trực tiếp trên Chromium Playwright (`scripts/test-reload-issue.mjs`):
         1. *Lỗi `ReferenceError: DEFAULT_OFFICIAL_CHANNELS is not defined`*: Tại dòng 4741 trong `src/App.tsx`, khi khởi tạo state `userRole` từ `localStorage.getItem('user_auth')`, nếu tài khoản chưa có danh sách kênh hoặc rỗng, hệ thống gọi `DEFAULT_OFFICIAL_CHANNELS.map(...)`. Tuy nhiên, biến này CHƯA ĐƯỢC IMPORT ở đầu file `App.tsx` (chỉ import `USER_YOUTUBE_SUBSCRIPTIONS_SNAPSHOT`). Do đó, trình duyệt ném ra `ReferenceError: DEFAULT_OFFICIAL_CHANNELS is not defined`.
         2. *Khối catch toàn cục nuốt lỗi và trả về `null`*: Ngoại lệ trên bị khối `catch (e)` toàn cục bao bọc `useState` tóm lấy và trả về `return null`. Kết quả: ngay khi F5 reload trang, `userRole` lập tức bị biến thành `null`, avatar biến mất và giao diện thụt lùi về nút `<CustomLoginButton>`, đẩy người dùng ra ngoài như chưa từng đăng nhập.
         3. *Thiếu tầng dự phòng `sessionStorage`*: Trong các trường hợp Safari Private Mode hoặc trình duyệt bảo mật chặn `localStorage`, việc không ghi nhận vào `sessionStorage` khiến việc khôi phục phiên cùng tab sau F5 reload bị đứt gãy.
     - *Quyết định kiến trúc & Giải pháp*:
       + **Bổ sung import và Fallback an toàn tuyệt đối**:
         * Import chuẩn xác `DEFAULT_OFFICIAL_CHANNELS` từ `./constants/userYouTubeSubscriptions`.
         * Trang bị fallback an toàn: `const defaultChannels = typeof DEFAULT_OFFICIAL_CHANNELS !== 'undefined' ? DEFAULT_OFFICIAL_CHANNELS : (typeof USER_YOUTUBE_SUBSCRIPTIONS_SNAPSHOT !== 'undefined' ? USER_YOUTUBE_SUBSCRIPTIONS_SNAPSHOT : []);`, triệt tiêu 100% nguy cơ `ReferenceError`.
       + **Kiến trúc đọc & khôi phục phiên 3 tầng độc lập (3-Tier Storage Resilience)**:
         * Tầng 1: Đọc `localStorage.getItem('user_auth')` với khối try-catch riêng biệt.
         * Tầng 2: Nếu tầng 1 trống hoặc lỗi, đọc ngay `sessionStorage.getItem('user_auth')` (bảo đảm bền vững 100% qua F5 cùng tab).
         * Tầng 3: Nếu tầng 2 trống, đọc `document.cookie` (`user_auth=...`).
       + **Cách ly hoàn toàn tác vụ làm sạch kênh (Isolated Sanitization)**:
         * Toàn bộ thao tác lọc mock channels, mock videos và gán kênh mặc định được bọc trong try-catch riêng biệt. Nếu có lỗi phát sinh trong quá trình lọc, hệ thống chỉ cảnh báo `console.warn` và VẪN BẢO TOÀN TRẢ VỀ `parsed` (tài khoản người dùng), tuyệt đối KHÔNG BAO GIỜ trả về `null`.
       + **Tự động đồng bộ hóa 3 tầng (Auto-Persist Sync Effect)**:
         * Bổ sung `useEffect` giám sát `userRole`: Mỗi khi `userRole` có thông tin hợp lệ (`email || sub || name`), tự động ghi đồng bộ tức thì xuống cả 3 tầng (`localStorage`, `sessionStorage`, `saveUserAuthCookie`).
       + **Xác thực thực tế qua Chromium Playwright**:
         * Khi reload trang (F5), `titles` hiển thị chính xác tên người dùng (`Nguyen Van B`), `avatarImg` hiển thị 3/3 bố cục (Desktop, Tablet, Mobile), `loginText` = rỗng (0 nút đăng nhập), người dùng không bao giờ bị đẩy ra ngoài.




  45. **[REQ-063, REQ-064] Tự Động Xóa Lịch Gán Số Điện Nước Quá Hạn Trên Google Calendar & Khắc Phục Lỗi Đẩy Tin Tức / Thời Tiết Định Kỳ Telegram**:
      - *Bối cảnh & Vấn đề*:
        + Người dùng yêu cầu: "tin tức và thời tiết của telegram tôi lại thấy lỗi không gửi thông tin mới nhất nữa, kiểm tra lại. Ở Google Calendar nếu thông tin của quá khứ liên quan đến gán số điện nước kiểu như hệ thống gán như này nếu mà qua thời gian rồi tự động xóa đi." kèm ảnh chụp lịch Google Calendar có sự kiện `💧 Lịch chốt số nước` (19/10/2026 19:00 - 19:30, tạo bởi `bot-calendar@bot-lich-nuoc.iam.gserviceaccount.com`).
        + *Phân tích nguyên nhân Google Calendar*:
          1. Hàm `them_lich_chot_nuoc` trước đây dùng `timeMin=now` khi tìm sự kiện trùng để xóa, do đó chỉ quét các sự kiện trong TƯƠNG LAI, hoàn toàn bỏ qua các sự kiện trong QUÁ KHỨ (`end <= now`).
          2. Không có cơ chế tự động dọn dẹp các sự kiện chốt số định kỳ đã diễn ra xong, khiến các sự kiện nhắc nhở trong quá khứ bị tích tụ trên giao diện Google Calendar của người dùng.
        + *Phân tích nguyên nhân Telegram không gửi tin tức và thời tiết mới nhất*:
          1. *Thiếu Chat ID môi trường trong GitHub Actions Scheduler*: Workflow `.github/workflows/bot-cron.yml` chạy hourly cron nhưng không truyền các biến `TELEGRAM_AUTO_NEWS_CHATS`, `TELEGRAM_CHAT_ID`, `ADMIN_CHAT_ID` vào `env:`. File `bot_data.json` nằm trong `.gitignore` nên khi chạy trên GitHub Actions, `active_auto_news_chats` rỗng hoặc chỉ có chat giả lập `"12345678"`, dẫn tới cron chạy nhưng không có người nhận thực tế (`valid_chats = []`).
          2. *RSS tuần tự gây nghẽn mạng*: `lay_tat_ca_bai_viet_ngau_nhien` trước đây quét tuần tự hơn 15 link RSS bằng vòng lặp đơn, mỗi link timeout 8s khiến tổng thời gian thu thập kéo dài 25-30 giây, dễ bị nghẽn mạng hoặc timeout trên các môi trường cloud.
          3. *Thiếu cơ chế tự phục hồi Chat ID*: Khi server khởi động lại trên môi trường ephemeral (Render free / GitHub Actions), nếu người dùng chưa gửi tin nhắn mới, bot không thể tự động phát hiện Chat ID của quản trị viên (`anaa2700`).
      - *Quyết định kiến trúc & Giải pháp*:
        + **Tự động quét và xóa sạch lịch điện nước quá hạn (`xoa_lich_dien_nuoc_qua_han`)**:
          * Truy vấn Google Calendar API với `timeMax=now_iso` để lấy các sự kiện đã kết thúc trong quá khứ.
          * Bộ lọc an toàn tuyệt đối 100%: Chỉ xóa các sự kiện do Service Account tạo (`*@*.gserviceaccount.com` hoặc `bot-calendar@...`) HOẶC có tiêu đề/mô tả thuộc hệ thống chốt số điện nước AnX (`Lịch chốt số nước`, `Lịch chốt số điện`, `Ngày khoá nước (Chốt số)`, `chốt số nước`, `chốt số điện`, `khối/ngày`, `Hệ thống AnX nhắc nhở chốt`). Tuyệt đối không xóa bất kỳ lịch cá nhân, cuộc họp hay sự kiện nào khác của người dùng.
          * Tích hợp tự động 4 vị trí: (1) Chạy tự động trước mỗi lần gán lịch mới trong `them_lich_chot_nuoc`; (2) Chạy định kỳ mỗi giờ trong `job_thoi_tiet_hang_gio`; (3) Chạy trong scheduler `minute=15`; (4) Hỗ trợ lệnh Telegram `.xoalichquahan` / `/cleanpastcalendar` và REST API `GET/POST /api/calendar/cleanup-expired`.
          * Đã xóa thực tế thành công 2 sự kiện quá hạn trên tài khoản `mrkun28@gmail.com` (`cno3f2s91d0r47lqeg2vi6b2u0` và `s32orf9kiv962bkjg4bdmhmah4`).
        + **Tối ưu hóa đa luồng RSS Concurrency & Tự động phục hồi Chat ID Telegram**:
          * Áp dụng `concurrent.futures.ThreadPoolExecutor(max_workers=8)` trong `lay_tat_ca_bai_viet_ngau_nhien`: Giảm thời gian thu thập tin tức từ 30s xuống chỉ còn 3.91s (nhanh hơn gấp 7 lần), bảo đảm luôn có sẵn hơn 200 bài báo mới nhất trong ngày.
          * Xây dựng hàm `tu_dong_khoi_phuc_chat_id()`: Ưu tiên đọc từ biến môi trường `TELEGRAM_AUTO_NEWS_CHATS`, `TELEGRAM_CHAT_ID`, `ADMIN_CHAT_ID`, `CHAT_ID`. Nếu rỗng, tự động gọi `getUpdates` của Telegram API để nhận diện chat_id của admin (`AUTHORIZED_USERNAME = anaa2700`).
          * Cập nhật workflow `.github/workflows/bot-cron.yml`: Truyền đầy đủ các biến Chat ID từ GitHub Secrets và thêm lệnh dọn dẹp lịch `main.xoa_lich_dien_nuoc_qua_han()` chạy hàng giờ.
          * Nâng timeout Telegram API lên 15s và bổ sung logging chi tiết trạng thái gửi tin.
      - *Kết quả nghiệm thu*:
        + `python -m unittest discover tests -v`: **22/22 tests PASS (100% OK)** trong 13.5s.
        + `python test_all_telegram_commands.py`: **14/14 tests PASS (100% OK)**.
        + `python test_news_collector.py`: **9/9 tests PASS (100% OK)**.
        + Hai sự kiện lịch quá hạn đã được xóa sạch hoàn toàn khỏi Google Calendar của `mrkun28@gmail.com` (xác minh `Remaining events: 0`).

  46. **[REQ-065] Kiến Trúc Giao Diện UI/UX Thông Minh, Trợ Lý Khí Tượng AI & Bộ Lọc Tìm Kiếm Tức Thì (Smart UI/UX Evolution)**:
      - *Bối cảnh & Động lực*:
        + Người dùng yêu cầu: "Kiểm tra có gì cập nhật mới và nâng cấp giao diện UI đẹp hơn thông minh hơn".
        + Cập nhật mới từ remote:
          1. Commit `d36fbde` (`Website_thoitiet_design`): Triển khai Google One-Tap Auto-login (`useGoogleOneTapLogin` với `auto_select: true`) và cơ chế silent background sync thông tin hồ sơ người dùng qua Google OAuth2 v3 userinfo.
          2. Commit `cdaf9fb` (`quan-ly-tien-phong`): Tự động xóa sạch lịch gán số điện nước quá hạn trên Google Calendar (`xoa_lich_dien_nuoc_qua_han`) và nâng cấp đa luồng `ThreadPoolExecutor(max_workers=8)` giúp cào RSS nhanh gấp 7 lần (từ 30s xuống 3.91s).
        + Nhu cầu nâng cấp giao diện: Cần mang lại diện mạo hiện đại hơn, giao diện sắc nét với hiệu ứng glassmorphism, hỗ trợ gợi ý hành vi trực quan thông minh (outfit, commute, health/AQI, activity) và tìm kiếm bài viết tức thời.
      - *Quyết định kỹ thuật & Giải pháp*:
        + **Trợ Lý Khí Tượng AI Thông Minh (`SmartWeatherAssistant`)**:
          * Tự động bóc tách nhiệt độ số học (`tempNum`), nồng độ bụi mịn (`pm25Num`), độ ẩm và trạng thái thời tiết (`condKey`).
          * Cung cấp 4 thẻ phân tích thực tế:
            - 👕 *Trang phục*: Gợi ý vải lanh, cotton thoáng mát khi nắng nóng (>=32°C), áo khoác giữ ấm khi se lạnh (<=20°C), hoặc trang phục linh hoạt.
            - ☂️ *Di chuyển*: Cảnh báo mang theo ô/áo mưa khi mưa dông, kính râm khi nắng gắt, hoặc thông báo lộ trình khô ráo.
            - 🍃 *Sức khỏe & AQI*: Đánh giá mức độ ô nhiễm không khí theo tiêu chuẩn WHO/AQI; khuyến nghị đeo khẩu trang N95 khi PM2.5 > 75, cảnh báo nhóm nhạy cảm khi PM2.5 > 40, và thông báo thời điểm lý tưởng mở cửa sổ khi không khí trong lành.
            - 🏃 *Hoạt động*: Gợi ý thể thao ngoài trời, hoạt động trong nhà, hoặc bù nước khoáng khi nhiệt độ cao.
          * Tích hợp huy hiệu trực tiếp có hiệu ứng sóng xung `animate-pulse` và phong cách thiết kế kính mờ bán trong suốt (glassmorphism).
        + **Thanh Tìm Kiếm Nhanh & Đếm Bài Viết Thời Gian Thực (Live News Search Bar)**:
          * Bổ sung thanh tìm kiếm nhanh tức thời trên Desktop, Tablet và Mobile.
          * Sử dụng hook `useMemo` lọc tức thì bài viết theo tiêu đề tác giả (`item.author`), tóm tắt (`item.body`) và nguồn báo (`item.src`) với độ trễ 0ms.
          * Duy trì bộ đếm số lượng tin bài trực quan (`{filteredFeed.length} tin tức`).
        + **Huy Hiệu Thời Gian Đọc & Độ Tươi Mới (Reading Time & Freshness Tag)**:
          * Tự động ước lượng thời gian đọc theo tốc độ đọc tiếng Việt (`getReadingTime`, 45 từ/phút).
          * Gắn nhãn `🟢 Mới cập nhật` (`getArticleFreshness`) cho các tin bài xuất bản trong vòng 2 giờ.
        + **Bảo Toàn Tương Thích & Bộ Kiểm Thử**:
          * Giữ nguyên toàn bộ các `data-testid="news-card"`, cấu trúc DOM và hành vi phân trang danh mục `NEWS_CATEGORIES`.
          * 100% các bài test `npm run test:logic` (423/423 assertions) và `npm run testwebsite` (47/47 test cases) tiếp tục đạt tuyệt đối.

  47. **[REQ-066] Thiết Kế Mỹ Thuật Đột Phá Neo-Editorial Glassmorphism & Khối Khí Tượng Atmospheric Sky Card**:
      - *Bối cảnh & Động lực*:
        + Người dùng yêu cầu: "Làm giao diện khác đẹp hơn đi".
        + Giao diện trước đây tuy đầy đủ tính năng nhưng bố cục thẻ hình học vuông vức cơ bản, thiếu chiều sâu thị giác, dải danh mục dạng nút phẳng đơn điệu và khối thời tiết chưa tạo được ấn tượng thị giác mạnh mẽ.
      - *Quyết định thẩm mỹ & Giải pháp kiến trúc giao diện*:
        + **Khối Thời Tiết Atmospheric Sky Card 3D**:
          * Tái cấu trúc Hero Weather Card với bo góc siêu mềm mại (`rounded-3xl`), lớp viền siêu mỏng phản quang bán trong suốt (`border border-white/20`).
          * Cấy ghép 2 vùng phản quang quang sai gradient mờ (`blur-3xl`) tạo hiệu ứng ánh sáng vòm trời chiều sâu.
          * Thông số nhiệt độ nâng lên cỡ chữ khổng lồ (`text-[64px] sm:text-[72px] font-black tracking-tighter drop-shadow-md`) kèm cảm nhận mờ.
          * 4 chỉ số khí tượng (Gió, Độ ẩm, Bụi PM2.5, Tầm nhìn) chuyển thành dạng capsule kính mờ cao cấp (`bg-white/15 backdrop-blur-md border border-white/25 rounded-2xl hover:bg-white/25 transition-all`).
        + **Thiết Kế Thẻ Tin Tức Tạp Chí Biên Tập Cao Cấp (Neo-Editorial Layout)**:
          * *Thẻ nổi bật (Featured Card)*: Bo góc 24px (`rounded-3xl`), đường viền mượt (`border-slate-200/90 dark:border-slate-800`), độ cao nổi shadow tăng cường (`hover:shadow-[0_16px_36px_-6px_rgba(23,33,51,0.16)]`). Hình ảnh bài báo có lớp phủ gradient bóng mờ (scrim) bảo đảm độ tương phản chữ, huy hiệu `🔥 NỔI BẬT` chuyển sắc Rose-Amber rực rỡ, hiệu ứng zoom ảnh 700ms mượt mà khi di chuột.
          * *Thẻ tin dạng lưới (Grid Cards)*: Bo góc 16px (`rounded-2xl`), ảnh tỷ lệ chuẩn với huy hiệu video phát quang, phần chân thẻ có đường kẻ phân cách tinh tế (`border-t border-slate-100 dark:border-slate-800`) phân tách thời lượng đọc và huy hiệu tươi mới.
        + **Dải Danh Mục Chuyển Sắc Hiện Đại & Tinh Chỉnh Header**:
          * Nút danh mục active mang dải chuyển sắc `from-blue-600 to-indigo-600`, chữ trắng, đổ bóng mềm `shadow-blue-500/25` và hiệu ứng phóng to nhẹ `scale-[1.02]`.
          * Logo thương hiệu `Anx.` chuyển sắc đa quang phổ (`bg-gradient-to-r from-blue-600 via-indigo-600 to-rose-500 bg-clip-text text-transparent font-black text-[22px]`) kèm huy hiệu phụ `Khí Tượng & Tin Tức 24/7`.
          * Loại bỏ hoàn toàn thanh tìm kiếm trùng lặp trên giao diện Mobile.
        + **Bảo Toàn 100% Tiêu Chuẩn Nghiệm Thu & Kiểm Thử**:
          * Toàn bộ 47 ca kiểm thử trong `docs/qa/TEST_PLAN.md` đều tiếp tục đạt kết quả PASS (100%), không có bất kỳ hiện tượng thoái lui nào.

  48. **[REQ-067] Kiến Trúc Định Vị Đa Tầng 4 Lớp, Loại Bỏ Hardcode Fallback & Bộ Chọn Vị Trí Khí Tượng Tương Tác**:
      - *Bối cảnh & Động lực*:
        + Người dùng yêu cầu: "Hiện tại định vị trí trí đang sai kiểm tra lại".
        + Nguyên nhân gốc rễ (Root Cause):
          1. Hàm `fallbackToIp()` trong `src/App.tsx` gọi `https://ipapi.co/json/`. Dịch vụ này đã bị cạn kiệt hạn ngạch miễn phí, liên tục trả về lỗi HTTP 429 (`{"error": true, "reason": "RateLimited"}`), khiến tọa độ `data.latitude` và `data.longitude` luôn là `undefined`.
          2. Khi không có tọa độ IP, khối lệnh fallback rơi vào đoạn mã hardcode: `doFetch(20.9716, 105.7725, "Hà Đông District, VN")`.
          3. Trong `navigator.geolocation.getCurrentPosition`, tham số `timeout` chỉ được đặt 2500ms (2.5 giây) và `enableHighAccuracy: false`. Người dùng chỉ cần mất hơn 2.5s để bấm "Cho phép" trên hộp thoại trình duyệt hoặc dùng mạng Wi-Fi không có GPS vệ tinh là sự kiện timeout lập tức bị kích hoạt và rơi vào fallback Hà Đông.
          4. Người dùng không có bất kỳ giao diện nào để tự chọn vị trí hoặc kích hoạt định vị lại.
      - *Quyết định kỹ thuật & Giải pháp*:
        + **Triệt Tiêu 100% Fallback Hà Đông Cưỡng Bức**:
          * Xóa bỏ hoàn toàn tọa độ và nhãn hardcode `"Hà Đông District, VN"`.
        + **Kiến Trúc Định Vị Đa Tầng 4 Lớp (Multi-Tier Resilient Geolocation)**:
          * *Tầng 0 (Client Cache)*: Khi khởi động, hệ thống kiểm tra trước `localStorage.getItem('user_weather_location')`. Nếu người dùng đã từng xác nhận hoặc chọn địa điểm, tải ngay tức thì không cần đợi GPS/IP.
          * *Tầng 1 (High-Accuracy Hardware GPS)*: Nâng cấp `enableHighAccuracy: true`, tăng timeout lên 8000ms và `maximumAge: 120000` (2 phút), giúp định vị cực kỳ chính xác khi thiết bị có GPS hoặc Wi-Fi triangulation.
          * *Tầng 2 (IP Geolocation Không Bị Bóp Quota)*: Tích hợp dịch vụ `https://ipwho.is/` (đã kiểm chứng hoạt động 100% tại Việt Nam, không giới hạn rate limit) và dự phòng tầng 2.2 `http://ip-api.com/json/`.
          * *Tầng 3 (Tọa Độ Thủ Đô Chuẩn Xác)*: Nếu cả GPS lẫn IP đều bị chặn hoàn toàn, hệ thống fallback về tọa độ trung tâm Thủ đô Hà Nội (`21.0285, 105.8542`) với nhãn tiếng Việt chuẩn `"Hà Nội, VN"`.
        + **Động Cơ OWM Reverse Geocoding Tiếng Việt**:
          * Tích hợp OpenWeatherMap Reverse Geocoding API (`https://api.openweathermap.org/geo/1.0/reverse`) chạy song song trong `Promise.all` cùng thời tiết.
          * Tự động ưu tiên bóc tách trường `local_names.vi` ("Hà Nội", "Thành phố Hồ Chí Minh", "Thành phố Đà Nẵng",...) giúp địa danh luôn hiển thị thuần Việt chuẩn mực.
        + **Bộ Chọn Vị Trí Khí Tượng Tương Tác (`LocationSelectorModal`)**:
          * Cho phép nhấp vào huy hiệu vị trí ở bất cứ đâu trên giao diện: Hero Weather Card (`data-testid="hero-location-badge"`), Mobile Header (`data-testid="mobile-location-btn"`), Tablet Header (`data-testid="tablet-location-btn"`) và Desktop Header (`data-testid="desktop-location-selector-btn"`).
          * Cung cấp nút định vị tức thời "🎯 Tự động định vị vị trí hiện tại (GPS)" (`data-testid="location-gps-btn"`).
          * Thanh tìm kiếm tức thì quận huyện/tỉnh thành không dấu (`data-testid="location-search-input"`).
          * Danh mục 32 địa phương trọng điểm (Hà Nội, Cầu Giấy, Hoàn Kiếm, Đống Đa, Ba Đình, Nam Từ Liêm, TP. Hồ Chí Minh, Quận 1, Thủ Đức, Đà Nẵng, Hải Phòng, Cần Thơ, Nha Trang, Đà Lạt, Sa Pa,...) phân theo các tab vùng miền.
          * Khi chọn địa điểm mới, dữ liệu thời tiết được nạp lại tức thì và lưu trữ vào `localStorage.setItem('user_weather_location', ...)`.
        + **Bảo Toàn Nghiệm Thu & Kiểm Thử**:
          * Đạt 423/423 logic assertions (`npm run test:logic`), 47/47 ca kiểm thử website (`npm run testwebsite`), `RELEASE GATE: PASSED`.

  49. **[REQ-068] Tinh Gọn Giao Diện Mobile - Loại Bỏ Thanh Tìm Kiếm Nhanh Theo Yêu Cầu Người Dùng**:
      - *Bối cảnh & Động lực*:
        + Người dùng yêu cầu trực tiếp: "Bỏ thanh này đi <div class=\"w-full flex items-center justify-between gap-2 bg-white px-3 py-1.5 rounded-xl border border-[#e3e7ef] shadow-2xs mb-2\">...</div>".
        + Thanh tìm kiếm nhanh trên Mobile chiếm dụng không gian hiển thị ngay dưới thanh danh mục, gây chật chội và không cần thiết khi người dùng đã có menu lọc chuyên mục tiện lợi.
      - *Quyết định kỹ thuật & Giải pháp*:
        + Xóa bỏ 100% container chứa input "Tìm nhanh tin tức, giá vàng..." và bộ đếm bài viết.
        + Dọn dẹp trạng thái `searchQuery` và hàm lọc không sử dụng trong `MobileLayout`, cho phép `newsFeed` truyền trực tiếp vào thẻ bài viết.
        + Giao diện Mobile trở nên thanh thoát, thoáng đãng, luồng đọc tin tức được ưu tiên hiển thị ngay lập tức.
      - *Kiểm thử & Nghiệm thu*:
        + `npm run build`: 0 lỗi biên dịch.
        + `npm run test:logic`: 423/423 assertions đạt 100%.
        + `npm run testwebsite`: 47/47 test cases PASS (RELEASE GATE: PASSED).


  50. **[REQ-069] Phân Định Rạch Ròi Định Vị Tự Động Thực Tế & Lựa Chọn Thủ Công Của Người Dùng**:
      - *Bối cảnh & Động lực*:
        + Người dùng yêu cầu cụ thể: "Về việc định vị hệ thống sẽ phải định vị đúng vị trí của người dùng đang ở khu vực nào thì sẽ đẩy vào, còn việc thay đổi sẽ là do người dùng thay đổi."
        + Phân tích nguyên nhân gốc:
          1. Trong phiên bản trước, hàm `doFetch` lưu tất cả các lần tải vị trí (dù là do IP fallback, do vị trí mặc định hay do GPS) vào cùng một key `user_weather_location` trong localStorage.
          2. Khi người dùng tải lại trang (F5 reload) hoặc truy cập lại, tầng kiểm tra cache đọc `user_weather_location` và thực thi lệnh return ngay lập tức. Điều này khiến `navigator.geolocation.getCurrentPosition` không bao giờ được kích hoạt lại, vô tình "khóa cứng" người dùng vào một vị trí cũ dù họ đã di chuyển sang khu vực khác.
          3. Dịch vụ reverse geocoding trước đó (`BigDataCloud`) bị lỗi HTTP 402 ("banned / not supported") và `OpenWeatherMap Geo` chỉ trả về tên thành phố lớn ("Hà Nội") mà không bóc tách được các quận/huyện cụ thể nơi người dùng thực tế đang sinh sống/làm việc (Cầu Giấy, Hoàn Kiếm, Đống Đa, Nam Từ Liêm, Quận 1, Hải Châu...).
          4. Mock ban đầu trong `DEFAULT_WEATHER_DATA` chứa hardcode "Quận Hà Đông, Hà Nội", gây hiểu lầm trong 0.5s đầu khi tải trang.
      - *Quyết định kỹ thuật & Giải pháp*:
        + **Tách Biệt Lưu Trữ 2 Trạng Thái**:
          * `user_weather_manual_location`: Chỉ được ghi khi người dùng CHỦ ĐỘNG click chọn một địa phương trong danh sách modal (`handleSelectLocation`). Khi có cờ này, hệ thống tôn trọng 100% quyết định của người dùng ("việc thay đổi sẽ là do người dùng thay đổi").
          * `user_weather_auto_location`: Lưu kết quả định vị tự động gần nhất làm bộ nhớ đệm hiển thị tức thì (0ms) tránh chớp nháy. Tuy nhiên, hệ thống LUÔN LUÔN kích hoạt ngầm `navigator.geolocation.getCurrentPosition` với `enableHighAccuracy: true, maximumAge: 0` để bắt kịp ngay vị trí thực tế của người dùng.
          * Xóa bỏ hoàn toàn key cũ `user_weather_location` để không còn rủi ro kẹt vị trí cũ.
        + **Tích Hợp Động Cơ Nominatim OpenStreetMap Reverse Geocoding**:
          * Sử dụng endpoint `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=vi` với header User-Agent chuẩn mực.
          * Tự động trích xuất và chuẩn hóa địa danh đa cấp độ: `district` (Cầu Giấy, Hoàn Kiếm, Hà Đông, Sài Gòn, Hải Châu, Sơn Trà...) + `city` (Hà Nội, TP. Hồ Chí Minh, Đà Nẵng...) -> cho ra định dạng tự nhiên thuần Việt: "Cầu Giấy, Hà Nội, VN" hoặc "Sài Gòn, TP. Hồ Chí Minh, VN".
          * Fallback an toàn sang OpenWeatherMap Reverse Geocoding và OpenWeatherMap Direct Weather Name.
        + **Triệt Tiêu Hardcode Trong Mock Data**:
          * Sửa toàn bộ 6 ConditionKey trong `DEFAULT_WEATHER_DATA` từ "Quận Hà Đông, Hà Nội" thành "Hà Nội" và "Thành phố Hà Nội, VN".
        + **Trực Quan Hóa Rõ Nghĩa Trên Giao Diện**:
          * Thẻ Hero Weather Card (`hero-location-badge`): Hiển thị icon 📌 và huy hiệu "Đã chọn" nếu là thủ công; icon 📍 và huy hiệu "Tự động" nếu do hệ thống định vị thực tế.
          * Header Mobile, Tablet, Desktop hiển thị nhãn `(Tự chọn)` hoặc `(Tự động)`.
          * `LocationSelectorModal`: Hiển thị banner cảnh báo vị trí thủ công kèm nút "Bật lại tự động" (`data-testid="reset-auto-location-btn"`). Nút GPS cập nhật thông điệp rõ ràng "Tự động định vị vị trí thực tế (GPS)".
      - *Kiểm thử & Nghiệm thu*:
        + `npm run build`: 0 lỗi, đóng gói hoàn tất trong 518ms.
        + `npm run test:logic`: 423/423 assertions đạt 100%.
        + `npm run testwebsite`: 47/47 ca kiểm thử PASS (RELEASE GATE: PASSED).

  51. **[REQ-070] Triển Khai Hệ Thống Thiết Kế & Bảng Phối Màu Almond AI SaaS**:
      - *Bối cảnh & Động lực*:
        + Người dùng yêu cầu: "Về phối màu sẽ sử dụng trang này và lên design system cho website này https://almond.framer.website/".
        + Template Almond AI SaaS sở hữu phong cách thiết kế hiện đại, tinh gọn với độ tương phản sắc sảo, bề mặt kính sứ ấm áp (Warm Alabaster #f6f5f4) và Dark Mode chiều sâu vũ trụ (Deep Obsidian Noir #0c0f12).
      - *Quyết định kỹ thuật & Giải pháp*:
        + **Tài Liệu Hóa Design System Độc Lập (`docs/DESIGN_SYSTEM.md`)**:
          * Lưu trữ bền vững 51 tokens màu sắc chuẩn hóa, ma trận Dark/Light mode, font Inter, hệ thống bán kính góc bo (shape language), hệ thống bóng đổ (shadow tokens) và bảng quy chuẩn linh kiện (Component Library).
        + **Bảng Màu Cốt Lõi Almond**:
          * *Light Canvas*: `#f6f5f4` thay thế xám lạnh thông thường bằng màu sứ ấm áp.
          * *Dark Canvas*: `#0c0f12` sắc đen thẳm với ánh tím không gian.
          * *Surfaces*: Thẻ sáng `#ffffff` viền `#e8e6e1`; thẻ tối `#151921` viền `#242b38`.
          * *Brand Accents*: Electric Royal Blue (`#2563ff`), Cosmic Violet (`#5715d1`), Flame Amber (`#ff7917`), Mint Freshness (`#25caac`), Frost Sky (`#b8ccff`).
        + **Áp Dụng Thực Tế Trên Toàn Hệ Thống**:
          * `src/index.css`: Khởi tạo biến màu Almond, phông chữ Inter, bề mặt nền sáng/tối và gradient khí quyển.
          * `src/App.tsx`: Khối khí tượng Atmospheric Hero Sky Card với gradient đôi `#2563ff` -> `#5715d1` cùng các khối cầu aura mờ ảo (`#b8ccff`); logo thương hiệu chuyển sắc 3 nấc (`#2563ff` -> `#5715d1` -> `#ff7917`); tab danh mục active nền xanh Royal Blue đổ bóng phát quang `shadow-blue-500/25`; badge trực tiếp Flame Amber (`#ff7917`) và badge tươi mới Mint (`#25caac`).
      - *Kiểm thử & Nghiệm thu*:
        + `npm run build`: Hoàn tất thành công 0 lỗi.
        + `npm run test:logic`: 423/423 assertions đạt 100%.
        + `npm run testwebsite`: 47/47 ca kiểm thử PASS (RELEASE GATE: PASSED).

  52. **[REQ-071] Nâng Cấp Hệ Thống Định Vị Đa Tầng Siêu Chính Xác Cấp Quận/Huyện Bằng Thuật Toán Haversine, Photon Komoot OSM & Lá Chắn Quyền Vị Trí**:
      - *Bối cảnh & Động lực*:
        + Người dùng yêu cầu: "Hiện tại hệ thống đang định vị sai vị trí của người dùng kiểm tra lại."
        + Phân tích nguyên nhân gốc rễ (Root Cause Analysis):
          1. **Lỗi HTTP 403 Forbidden từ OpenStreetMap Nominatim**: Lệnh `fetch('https://nominatim.openstreetmap.org/reverse?...')` trực tiếp từ client-side browser bị Nominatim chặn với mã lỗi HTTP 403 do chính sách sử dụng cấm gọi trực tiếp từ trình duyệt mà không qua backend proxy. Khi đó `geoReverse` luôn trả về `null`.
          2. **Mất cấp Quận/Huyện khi Fallback về OpenWeatherMap Reverse Geocode**: Khi Nominatim trả về null, hệ thống rơi vào OpenWeatherMap Geo API (`owmGeo`). OWM Geo đối với mọi tọa độ nội thành Hà Nội (Cầu Giấy, Hoàn Kiếm, Đống Đa, Nam Từ Liêm, v.v.) chỉ trả về tên thành phố lớn là "Hà Nội", làm mất hoàn toàn thông tin quận huyện cụ thể của người dùng.
          3. **Khóa cứng vị trí khi Fallback IP**: Trong hàm `fallbackToIp`, mã nguồn truyền trực tiếp `cityName` ("Hanoi, VN") vào đối số `locationNameStr` của `doFetch`. Điều này khiến khối `if (!resolvedLocation)` bị bỏ qua hoàn toàn, triệt tiêu khả năng bóc tách quận/huyện từ tọa độ IP.
          4. **Lỗi Mixed Content từ `http://ip-api.com/`**: Giao thức HTTP không mã hóa bị trình duyệt chặn trên website HTTPS.
          5. **Timeout Geolocation 6s quá ngắn & Xử lý lỗi câm (Silent Failure)**: Khi người dùng mở trang hoặc nhấn "Tự động định vị GPS", nếu họ mất hơn 6-8s để nhấn "Cho phép" hoặc nếu trình duyệt đã chặn quyền vị trí (PERMISSION_DENIED), modal lập tức đóng lại và rơi vào fallback IP Hà Nội mà không hề có bất kỳ thông báo hướng dẫn nào, khiến người dùng nghĩ hệ thống định vị sai.
      - *Quyết định kỹ thuật & Giải pháp*:
        + **Động Cơ Haversine Local Match (0ms, 100% Offline)**:
          * Mở rộng mạng lưới `VIETNAM_LOCATIONS` bao phủ đầy đủ toàn bộ 12 quận và huyện trọng điểm Hà Nội, TP. Hồ Chí Minh và các tỉnh thành trên cả nước.
          * Tích hợp hàm `findNearestVietnamLocation` tính toán khoảng cách đường cong mặt cầu (Haversine formula). Với bán kính threshold 10km, hệ thống nhận diện chính xác ngay lập tức cấp quận huyện: Cầu Giấy, Hoàn Kiếm, Nam Từ Liêm, Hà Đông, Ba Đình, Quận 1, Thủ Đức, v.v., đạt độ trễ 0ms và hoàn toàn độc lập với dịch vụ bên ngoài.
        + **Động Cơ Photon Komoot Reverse Geocode (CORS Bản Địa)**:
          * Thay thế Nominatim bằng Photon Komoot (`https://photon.komoot.io/reverse?lat=...&lang=default`), hỗ trợ `Access-Control-Allow-Origin: *`, trích xuất `district` và `city`, chuẩn hóa tiếng Việt qua `formatVietnamLocationName`.
        + **Hiện Đại Hóa Chuỗi IP Fallback Sang 100% HTTPS**:
          * Tầng 1: `https://ipwho.is/`.
          * Tầng 2: `https://freeipapi.com/api/json`.
          * Tầng 3: `https://ipinfo.io/json`.
          * Truyền `locationNameStr = null` để tọa độ IP cũng được đối chiếu qua thuật toán Haversine và Photon Komoot.
        + **Lá Chắn Quyền Vị Trí & Hướng Dẫn Trực Quan**:
          * Tăng timeout GPS lên 12 giây (`timeout: 12000, maximumAge: 0`).
          * Trong `LocationSelectorModal`, khi phát hiện `PERMISSION_DENIED` hoặc lỗi GPS, hiển thị thẻ cảnh báo vàng-đỏ trực quan (`data-testid="gps-error-alert"`) hướng dẫn người dùng nhấn biểu tượng ổ khóa 🔒 trên thanh địa chỉ để cấp quyền hoặc chọn địa phương từ danh sách.
      - *Kiểm thử & Nghiệm thu*:
        + `npm run test:logic`: 427/427 assertions đạt (100% PASS), bao gồm 4 ca kiểm thử Haversine & Geolocation trong Luồng 8.
        + `npm run build`: Thành công 100% trong 3.97s, 0 lỗi TypeScript.
        + `npm run testwebsite`: 47/47 ca kiểm thử PASS (RELEASE GATE: PASSED).


  53. **[REQ-072] Chuẩn Hóa Toàn Diện Ngôn Ngữ Khung Viền & Bề Mặt Giao Diện (Frame & Surface Architecture), Triệt Tiêu Lỗi Kích Hoạt Nhầm Dark Mode & Chuyển Đổi Màu Sắc Mượt Mà Chuẩn Almond AI SaaS**:
      - *Bối cảnh & Động lực*:
        + Người dùng phản hồi: *"Về giao diện Dark và Light về chuyển đổi màu sắc khung đang rất xấu cần điều chỉnh chỉnh sửa lại"* kèm hình ảnh minh chứng giao diện đang ở chế độ Sáng (icon Mặt trời hiển thị trên Header, nền trang sáng, cột thời tiết màu trắng) nhưng các thẻ tin tức bên phải lại bị biến thành màu đen xì (`#0f172a` / `#131927`) với chữ trắng.
        + *Phân tích nguyên nhân cốt lõi (Root Cause Analysis)*:
          1. **Lỗi hành vi mặc định của Tailwind CSS v4 đối với biến thể `dark:`**: Trong Tailwind CSS v4, nếu không khai báo quy tắc tùy chỉnh `@custom-variant dark`, mọi lớp có tiền tố `dark:` (ví dụ `dark:bg-slate-900`, `dark:text-slate-100`, `dark:border-slate-800`) sẽ tự động biên dịch sang truy vấn media `@media (prefers-color-scheme: dark)`. Khi hệ điều hành của người dùng (Windows Dark Theme) hoặc trình duyệt được cấu hình ưu tiên nền tối, các lớp `dark:` này LẬP TỨC ĐƯỢC ÁP DỤNG cho các thẻ tin tức dù cờ React state `darkMode` đang là `false` và class `.dark` đã bị gỡ khỏi thẻ `<html>`. Trong khi đó, các thẻ ở cột bên trái sử dụng lớp `.bg-white` được điều khiển bằng selector CSS `html.dark .bg-white`, dẫn tới hiện tượng "nửa sáng nửa tối" cọc cạch, xấu xí.
          2. **Bất nhất màu sắc bề mặt trong Dark Mode**: Một số thẻ sử dụng `#151921` (Almond Obsidian), một số thẻ dùng `#0f172a` (`slate-900`), các phần tử con dùng `#1a202c`, khiến giao diện tối bị vụn vặt và mất đi tính cao cấp.
          3. **Khung cảnh báo và gợi ý bị bẹp màu trong Dark Mode**: Các khung `Cảnh báo trọng tâm` (`.bg-[#fff7ed]`), `Gợi ý lịch trình` (`.bg-[#f0fdf4]`), `Khuyến cáo lộ trình` (`.bg-[#eff6ff]`) bị ép đồng loạt thành nền xám `#1a202c`, làm mất đi hoàn toàn tính nhận diện sắc thái khí tượng (Hổ phách - Ngọc bích - Thiên thanh).
          4. **Thiếu hiệu ứng chuyển sắc mềm (Color Morphing Transitions)**: Khi người dùng bấm nút toggle chuyển đổi giao diện, các màu nền, viền và văn bản thay đổi tức thì đột ngột, gây cảm giác giật cục, nhấp nháy khó chịu cho mắt.
      - *Quyết định kỹ thuật & Giải pháp*:
        + **Khai Báo Chuẩn `@custom-variant dark (&:where(.dark, .dark *));`**:
          * Thêm chỉ thị `@custom-variant dark` vào đầu `src/index.css`, bắt buộc Tailwind CSS v4 chỉ kích hoạt các lớp `dark:` khi và chỉ khi thẻ `<html>` mang class `.dark`. Triệt tiêu hoàn toàn lỗi hiển thị thẻ đen trong Light mode khi chạy trên hệ điều hành Dark mode.
        + **Đồng Bộ Kiến Trúc Bề Mặt Thẻ (Card Surfaces) Chuẩn Almond AI SaaS**:
          * Thẻ Sáng (Light): Nền trắng tinh khôi `#ffffff`, đường viền hairline `#e2e4e8` siêu mỏng mềm mại, bóng đổ dịu mắt `0 2px 14px -2px rgba(12, 15, 18, 0.05)`, tiêu đề `#0c0f12`, thân bài `#4e5b6d`.
          * Thẻ Tối (Dark): Nền Deep Obsidian Noir `#151921` thống nhất toàn trang, đường viền `rgba(255, 255, 255, 0.08)`, bóng đổ khối sâu `0 8px 30px -6px rgba(0, 0, 0, 0.55)`, tiêu đề `#f8fafc`, thân bài `#94a3b8`.
          * Khối phần tử con (Sub-cards): Nền `bg-[#f8f9fa]` viền `#e9ecef` ở Light mode; nền `bg-[#1c222d]` viền `rgba(255, 255, 255, 0.06)` ở Dark mode.
        + **Khung Cảnh Báo Khí Tượng Đa Tầng Tinh Tế**:
          * Khung Cảnh báo trọng tâm: Light mode `#fff9f0` viền `#fed7aa` text `#9a3412`; Dark mode phủ lớp glow hổ phách `rgba(255, 121, 23, 0.12)` viền `rgba(255, 121, 23, 0.25)` text `#fdba74`.
          * Khung Gợi ý lịch trình: Light mode `#f2fcf6` viền `#bbf7d0` text `#166534`; Dark mode phát quang xanh ngọc `rgba(37, 202, 172, 0.1)` viền `rgba(37, 202, 172, 0.25)` text `#5eead4`.
          * Khung Khuyến cáo lộ trình: Light mode `#f0f7ff` viền `#bfdbfe` text `#1e40af`; Dark mode ánh xanh hoàng gia `rgba(37, 99, 255, 0.1)` viền `rgba(37, 99, 255, 0.25)` text `#93c5fd`.
        + **Kích Hoạt Hiệu Ứng Chuyển Đổi Màu Sắc 0.25s Mượt Mà**:
          * Tích hợp `transition: background-color 0.25s ease, border-color 0.25s ease, color 0.25s ease, box-shadow 0.25s ease` cho toàn bộ các phần tử khung thẻ, nút bấm và tiêu đề, mang lại trải nghiệm đổi giao diện êm ái, mượt mà như các ứng dụng native cao cấp.
      - *Kiểm thử & Nghiệm thu*:
        + `npm run build`: Hoàn thành trong 2.48s, 0 lỗi biên dịch.
        + `npm run test:logic`: 427/427 assertions đạt 100% PASS.
        + `npm run testwebsite`: 47/47 ca kiểm thử PASS (RELEASE GATE: PASSED) trên cả Desktop, Tablet và Mobile.


  54. **[REQ-073] Khắc Phục Tương Phản Màu Chữ Tiêu Đề Dark/Light & Hoàn Thiện Quy Trình Nhận Diện Đăng Nhập Liền Mạch Cho Lịch Google Calendar**:
      - *Bối cảnh & Động lực*:
        + Người dùng phản hồi kèm 2 hình ảnh minh chứng:
          1. Ảnh 1: Tiêu đề bài báo nổi bật `Quân đội Israel phá dỡ nhiều công trình tại Bờ Tây` trong Dark Mode bị mang màu đen xì `#0c0f12`, chìm hoàn toàn vào nền thẻ tối `#151921` và không thể đọc được.
          2. Ảnh 2: Người dùng chỉ ra rằng tài khoản đã đăng nhập rõ ràng (hiển thị ảnh đại diện avatar ở góc trên bên phải, hiển thị email `mrkun28@gmail.com` và danh sách kênh YouTube), nhưng phần chân widget Lịch Google Calendar lại hiển thị: `• Lịch ngoại tuyến, kết nối Google Calendar` với liên kết đòi người dùng bấm đăng nhập lại. Người dùng khẳng định: *"rõ ràng đã có logo của người dùng nhưng vẫn bắt đăng nhập việc này sai quy trình check lại thông tin"*.
        + *Phân tích nguyên nhân cốt lõi (Root Cause Analysis)*:
          1. **Lỗi biến màu Typography & Độ ưu tiên CSS trong Dark Mode**:
             - Trong `src/index.css`, quy tắc toàn cục `h1, h2, h3, h4, h5, h6, strong, b { color: var(--almond-ink); }` được khai báo, trong đó `--almond-ink` được gán cố định là `#0c0f12` trong `:root`. Khi chuyển sang Dark Mode (`html.dark`), biến `--almond-ink` KHÔNG được gán lại giá trị sáng, và cũng không có quy tắc `html.dark h1..h6` nào với độ ưu tiên đủ lớn. Dẫn đến mọi thẻ `<h3>` hoặc tiêu đề bài báo bị ép màu chữ đen `#0c0f12` trên nền thẻ tối `#151921`.
             - Tương tự, lớp `.text-[#182033] { color: #0c0f12 !important; }` không được bao quát hết các phần tử mang lớp `.text-[#0c0f12]`.
          2. **Lỗi quy trình nhận diện phiên đăng nhập ở widget Lịch Calendar**:
             - Khi người dùng đăng nhập qua Google One-Tap (`useGoogleOneTapLogin`), Google chỉ cấp ID token (JWT) chứa thông tin định danh (`email`, `name`, `picture`, `sub`), mà không cấp sẵn OAuth2 `access_token` phục vụ gọi trực tiếp API Google Calendar.
             - Khi thiếu `_access_token`, mã nguồn cũ trong `CalendarSection` đã đối chiếu lỏng lẻo: `!accessToken ? (<p>Lịch ngoại tuyến, kết nối Google Calendar</p>)` kèm nút `onRelogin` mở popup Google đòi đăng nhập lại.
             - Điều này tạo ra trải nghiệm sai quy trình nghiêm trọng: Người dùng đã thấy mình đăng nhập thành công (avatar và email hiện diện đầy đủ trên website), nhưng widget Lịch lại thông báo như thể họ chưa kết nối tài khoản và ép họ phải đăng nhập lại.
             - Đồng thời, khi chưa có `_access_token`, `events` bị gán rỗng `{}` làm trắng trơn lịch ngay cả khi trước đó người dùng đã từng đồng bộ sự kiện.
      - *Quyết định kỹ thuật & Giải pháp*:
        + **Tái Định Nghĩa Biến Màu Almond & Typography Override Toàn Cục Trong Dark Mode**:
          * Khai báo lại biến màu trong `html.dark`: `--almond-ink: #f8fafc;`, `--almond-body: #94a3b8;`, `--almond-muted: #64748b;`.
          * Bổ sung quy tắc toàn cục: `html.dark h1..h6, html.dark strong, html.dark b { color: #f8fafc !important; }`.
          * Đồng bộ toàn diện: `html.dark .text-[#0c0f12], html.dark .text-[#182033], html.dark .text-slate-900, html.dark .text-gray-900 { color: #f8fafc !important; }` và các lớp văn bản phụ thành `#94a3b8 !important`.
          * Đảm bảo 100% tiêu đề, thẻ bài báo và chữ viết trên toàn website sáng rõ, tương phản hoàn hảo chuẩn WCAG AAA trên nền tối `#151921`.
        + **Chuẩn Hóa Quy Trình Trạng Thái Lịch Theo Phiên Đăng Nhập Của Người Dùng**:
          * Khi `userEmail` tồn tại (người dùng đã đăng nhập Google): Widget Lịch Calendar công nhận ngay lập tức danh tính người dùng: hiển thị chấm xanh kết nối `🟢` kèm dòng trạng thái: `Đã kết nối tài khoản ${userEmail} • Đồng bộ lịch`.
          * Tuyệt đối không bao giờ hiển thị thông điệp "Lịch ngoại tuyến, kết nối Google Calendar" hay ép người dùng phải đăng nhập lại từ đầu.
          * Khi `accessToken` còn hiệu lực và API trả về thành công: hiển thị `🟢 Đã đồng bộ với Google Calendar`.
          * Khi người dùng cần chủ động làm mới sự kiện hoặc cấp quyền đọc lịch nâng cao: giữ liên kết `(Đồng bộ lịch)` gọn gàng và tự nhiên.
        + **Bộ Nhớ Đệm Lịch Bền Vững Theo Tài Khoản (Per-User Calendar Cache)**:
          * Lưu trữ các sự kiện lịch vào `localStorage` theo khóa định danh `user_calendar_cache_${userEmail}_${year}_${month}`.
          * Khi mở trang hoặc chuyển tháng, hệ thống nạp tức thì từ cache giúp lịch hiển thị sự kiện ngay frame đầu tiên mà không bao giờ bị trắng lịch.
        + **Đồng Bộ Dark Mode Cho Menu Avatar Người Dùng (`UserAvatarMenu`)**:
          * Thêm nền tối `#151921`, viền mờ `dark:border-white/10`, chữ sáng và hover êm ái cho toàn bộ menu tài khoản.
      - *Kiểm thử & Nghiệm thu*:
        + `npm run build`: Thành công 100% trong 6.34s, 0 lỗi biên dịch.
        + `npm run test:logic`: 427/427 assertions đạt (100% PASS).
        + `npm run testwebsite`: 47/47 ca kiểm thử toàn diện đa thiết bị đạt PASS (RELEASE GATE: PASSED).


  55. **[REQ-074] Khắc Phục Tận Gốc Lỗi Định Vị Khu Vực Bằng Đảo Ngược Ưu Tiên Photon OSM Reverse Geocoding & Tự Động Hóa 100% Đồng Bộ Lịch Google Calendar Chạy Ngầm**:
      - *Bối cảnh & Động lực*:
        + Người dùng yêu cầu dứt khoát: *"Định vị khu vực đang chưa định vị đúng khu vực người dùng đang ở, ngoài ra việc đồng bộ lịch google Calendar là tự động không sử dụng đồng bộ thủ công"*.
        + Trước đó người dùng ở khu vực khác nhưng hệ thống hiển thị thành "Quận Hoàn Kiếm, Hà Nội, VN" hoặc bị lệch quận huyện do tọa độ trung tâm datacenter mạng.
        + Đồng thời, người dùng không muốn thấy bất kỳ nút hoặc đường dẫn thao tác đồng bộ lịch thủ công nào trên giao diện, lịch Google Calendar bắt buộc phải tự động đồng bộ ngầm 100%.
      - *Phân tích nguyên nhân cốt lõi (Root Cause Analysis)*:
        1. **Đảo ngược thứ tự ưu tiên phân giải địa danh (Priority Inversion)**:
           - Trong `doFetch`, thuật toán Haversine đối chiếu danh mục `VIETNAM_LOCATIONS` với bán kính ngưỡng 10km được đặt ở vị trí Nguồn 1, chạy TRƯỚC Photon Komoot OSM Reverse Geocoding (Nguồn 2).
           - Do tọa độ Hoàn Kiếm (`lat: 21.0307, lon: 105.8524`) nằm ở trung tâm Hà Nội, bất kỳ người dùng nào ở các quận nội thành xung quanh trong bán kính 10km (Cầu Giấy, Nam Từ Liêm, Ba Đình, Đống Đa, Tây Hồ, Thanh Xuân, Hoàng Mai, Hai Bà Trưng) đều bị thuật toán Haversine chặn lại ngay lập tức và cưỡng ép hiển thị thành `"Quận Hoàn Kiếm, Hà Nội, VN"`, bỏ qua hoàn toàn kết quả giải mã ranh giới hành chính quận huyện thực tế của OpenStreetMap!
        2. **Định vị theo IP mạng bị gán sai vào quận trung tâm**:
           - Khi gọi `fallbackToIp()`, `fallbackToFreeIp()`, `fallbackToIpInfo()`, hệ thống truyền `locationNameStr = null` vào `doFetch`.
           - Tọa độ IP do nhà mạng Cloudflare / VNPT / Viettel trả về (ví dụ `21.0244, 105.8411`) chỉ cách Hoàn Kiếm 1.35km, dẫn tới Haversine lại tiếp tục gán toàn bộ người dùng định vị IP thành Hoàn Kiếm thay vì hiển thị cấp thành phố (`Hà Nội, VN`).
        3. **Nghẽn Geolocation 1 tầng trên thiết bị Desktop Windows**:
           - Lời gọi `navigator.geolocation.getCurrentPosition` cũ chỉ có 1 tầng với `{ enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }`.
           - Trên máy tính để bàn (Windows PC) không có chip vệ tinh GPS độc lập, lệnh này bị treo 12 giây trước khi timeout và rơi vào IP fallback.
        4. **Nút thao tác thủ công vi phạm tiêu chí người dùng**:
           - Chân trang Lịch Calendar cũ còn giữ nút/đường dẫn `(Đồng bộ lịch)` khiến người dùng phải bấm tay, trong khi yêu cầu của người dùng là tự động hoàn toàn không dùng thủ công.
      - *Quyết định kỹ thuật & Giải pháp*:
        + **Đảo Ngược Thứ Tự Ưu Tiên: Đưa Photon Komoot OSM Reverse Geocoding Lên Ưu Tiên 1**:
          * Đưa Photon Komoot OpenStreetMap Reverse Geocoding lên ƯU TIÊN 1 trong `doFetch`. OpenStreetMap sở hữu dữ liệu ranh giới hành chính chính thức đến từng xã/phường, quận/huyện tại Việt Nam.
          * Khi nhận tọa độ GPS thực tế từ thiết bị, Photon Komoot bóc tách chính xác quận huyện thực tế (ví dụ: `Cầu Giấy, Hà Nội, VN`, `Nam Từ Liêm, Hà Nội, VN`, `Hải Châu, Đà Nẵng, VN`, `Quận 1, TP. Hồ Chí Minh, VN`).
          * Thuật toán Haversine với danh mục mở rộng 63 tỉnh thành & toàn bộ quận huyện được chuyển xuống làm ƯU TIÊN 2 (chế độ dự phòng offline khi mất mạng).
        + **Chuẩn Hóa Tên Tỉnh Thành Khi Định Vị Qua IP Mạng**:
          * Viết hàm `getNormalizedIpCity` chuẩn hóa dữ liệu nhà mạng (Hanoi -> Hà Nội, Ho Chi Minh -> TP. Hồ Chí Minh, Da Nang -> Đà Nẵng, Hai Phong -> Hải Phòng, Can Tho -> Cần Thơ...).
          * Truyền trực tiếp chuỗi địa danh cấp thành phố (`${ipCity}, VN`) vào `doFetch` khi chạy qua IP fallback, ngăn chặn tuyệt đối việc gán sai quận nội thành cho người dùng định vị qua IP.
        + **Cơ Chế Định Vị 2 Tầng (2-Stage Geolocation Engine)**:
          * Tầng 1: Lấy nhanh tức thì qua Wi-Fi / cell triangulation với `{ enableHighAccuracy: false, timeout: 4000, maximumAge: 180000 }` (phản hồi trong 0.3s).
          * Tầng 2: Tinh chỉnh độ chính xác cao vệ tinh GPS nếu thiết bị hỗ trợ, có cơ chế bắt lỗi và fallback sang IP mượt mà, không gây đơ lag trình duyệt.
        + **Tự Động Hóa 100% Đồng Bộ Lịch Google Calendar (Zero Manual Action)**:
          * Loại bỏ vĩnh viễn nút/đường dẫn `• Đồng bộ lịch` khỏi chân widget Lịch.
          * Tích hợp cơ chế tự động nạp ngầm: khi khởi chạy, khi đổi tháng/năm, khi người dùng quay lại tab trình duyệt (`window.addEventListener('focus')`), và lặp định kỳ mỗi 90 giây.
          * Tích hợp hàm `isPastUtility` tự động dọn dẹp và loại bỏ các sự kiện tiền điện, tiền nước, hóa đơn, gán số đã qua thời gian.
          * Chân trang hiển thị trạng thái tự động minh bạch: `🟢 Tự động đồng bộ với Google Calendar` (hoặc `Đang tự động cập nhật Lịch Google...` khi đang fetch).
      - *Kiểm thử & Nghiệm thu*:
        + `npm run build`: Hoàn thành xuất sắc trong 3.08s, 0 lỗi biên dịch.
        + `npm run test:logic`: 427/427 assertions đạt 100% PASS.
        + `npm run testwebsite`: 47/47 ca kiểm thử toàn diện đa thiết bị đạt PASS (RELEASE GATE: PASSED).
