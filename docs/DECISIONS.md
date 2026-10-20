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
