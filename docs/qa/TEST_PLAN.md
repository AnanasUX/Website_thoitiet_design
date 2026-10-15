# KẾ HOẠCH KIỂM THỬ TOÀN TRANG (FULL-SITE TEST PLAN)

## 1. TỔNG QUAN & MA TRẬN YÊU CẦU (TRACEABILITY MATRIX)

| Mã Ca Kiểm Thử (TC) | Tên Chức Năng / Kịch Bản | Mã Yêu Cầu (REQ) | Độ Ưu Tiên | Phương Pháp Xác Minh | Trạng Thái |
|:---:|:---|:---:|:---:|:---:|:---:|
| **TC-001** | Header Shorts trên Mobile: Gọn gàng, không đè nút, ẩn nút xoay 16:9 | REQ-001 | P0 (Bắt buộc) | Automated + UI Inspection | ✅ PASS |
| **TC-002** | Khung rạp chiếu Tablet (420px) & Nút xoay tỉ lệ linh hoạt | REQ-002 | P1 (Cao) | Automated + UI Inspection | ✅ PASS |
| **TC-003** | Chế độ Toàn Cảnh 16:9 Cinema & Phím tắt Fullscreen `F` trên Desktop | REQ-003 | P1 (Cao) | Automated + Hotkey Event | ✅ PASS |
| **TC-004** | Đồng bộ chiều cao thẻ card trong Smart TV EPG Guide (`min-h-[135px]`) | REQ-004 | P1 (Cao) | Automated + CSS Assertion | ✅ PASS |
| **TC-005** | Chuyển kênh TV không bị rỗng playlist (Empty Playlist Prevention) | REQ-005 | P0 (Bắt buộc) | Automated Data Assertion | ✅ PASS |
| **TC-006** | Cơ sở dữ liệu 97 video YouTube thực tế đã xác minh, 0 video 404 | REQ-006 | P0 (Bắt buộc) | Automated YouTube ID Regex & API | ✅ PASS |
| **TC-007** | Loại bỏ hoàn toàn video nội bộ MP4 giả lập khỏi danh sách Shorts | REQ-007 | P0 (Bắt buộc) | Automated Source Scan | ✅ PASS |
| **TC-008** | Cơ chế tự phục hồi lỗi YouTube Embed (100/101/150) tự nhảy sau 2.2s | REQ-008 | P0 (Bắt buộc) | Automated Handler Verification | ✅ PASS |
| **TC-009** | Mặc định bật tiếng (`unmuted`) và bật/tắt âm thanh mượt mà qua postMessage | REQ-009 | P1 (Cao) | Automated State Assertion | ✅ PASS |
| **TC-010** | Lớp overlay trong suốt chặn triệt để click nhảy trang sang youtube.com | REQ-010 | P0 (Bắt buộc) | Automated DOM Layer Assertion | ✅ PASS |
| **TC-011** | Tự động ẩn controls sau 5 giây không tương tác | REQ-011 | P2 (Trung bình) | Timer Logic Assertion | ✅ PASS |
| **TC-012** | Thanh tác giả (Byline Bar) chuẩn báo chính thống: Avatar tròn nhỏ dưới tiêu đề | REQ-012 | P0 (Bắt buộc) | Automated DOM & Class Check | ✅ PASS |
| **TC-013** | Tiền loại bỏ khối tác giả, triệt tiêu phóng to avatar tác giả trong thân bài | REQ-013 | P0 (Bắt buộc) | Automated Parser & Image Filter | ✅ PASS |
| **TC-014** | Bố cục Desktop: Khung chính có padding-top 10px, padding-left/right 0px | REQ-014 | P0 (Bắt buộc) | Automated Style Assertion | ✅ PASS |
| **TC-015** | Dải nút danh mục tin tức trên Desktop mở rộng tối đa 872px (`max-w-[872px]`) | REQ-015 | P1 (Cao) | Automated Style Assertion | ✅ PASS |
| **TC-016** | Dữ liệu thời tiết hiện tại & Biểu đồ dự báo hàng giờ SVG spline mượt mà | REQ-016 | P1 (Cao) | Component Render Assertion | ✅ PASS |
| **TC-017** | Bảng giá thị trường (Giá vàng SJC/Doji, Ngoại tệ Vietcombank, Xăng dầu) | REQ-017 | P1 (Cao) | Data Ingestion Assertion | ✅ PASS |
| **TC-018** | Kiểm tra biên dịch sản phẩm (Vite build sạch sẽ, 0 lỗi TypeScript) | REQ-018 | P0 (Bắt buộc) | Build Runner (`npm run build`) | ✅ PASS |
| **TC-019** | Tính vẹn toàn bộ nhớ dự án (Tất cả tài liệu chuẩn tồn tại và đồng nhất) | REQ-019 | P0 (Bắt buộc) | Registry Validator | ✅ PASS |
| **TC-020** | Bộ chạy kiểm thử tự động `/testwebsite` xuất báo cáo có bằng chứng | REQ-020 | P0 (Bắt buộc) | CLI Test Runner Script | ✅ PASS |
| **TC-021** | Phân quyền QA Dashboard (mrkun28@gmail.com) & Hiển thị Header/Widget cố định | REQ-021 | P0 (Bắt buộc) | Automated Role & Placement Assertion | ✅ PASS |
| **TC-022** | Kiểm thử chuyên sâu 7 luồng logic và xử lý thông tin nghiệp vụ toàn hệ thống | REQ-022 | P0 (Bắt buộc) | Automated Logic Assertions (`test-logic-flows.mjs`) | ✅ PASS |
| **TC-023** | Kiểm thử toàn diện trải nghiệm người dùng (UX) và các luồng tương tác thực tế | REQ-023 | P0 (Bắt buộc) | Chrome Playwright UX Flows (`test-ux-flows.mjs`) | ✅ PASS |
| **TC-024** | Kiểm thử tương tác thực chiến đa màn hình & Bộ quét lỗi giao diện trực quan | REQ-024 | P0 (Bắt buộc) | Playwright Full-System Scanner | ✅ PASS |
| **TC-025** | Quản lý xác thực Google OAuth 2.0, phiên đăng nhập & Trình đơn hồ sơ người dùng | REQ-025 | P0 (Bắt buộc) | Automated Session & Menu Check | ✅ PASS |
| **TC-026** | Phân hệ Lịch Vạn Niên Âm - Dương, điều hướng tháng & Tích hợp Google Calendar | REQ-026 | P1 (Cao) | Automated Leap Year & Navigation | ✅ PASS |
| **TC-027** | Thu thập tin tức RSS từ hơn 38 nguồn báo chí, nạp vô cực & Cập nhật nền | REQ-027 | P0 (Bắt buộc) | Automated RSS Ingestion & Infinite Scroll | ✅ PASS |
| **TC-028** | Định tuyến URL ảo chuẩn SEO cho bài viết chi tiết & Lịch sử Popstate | REQ-028 | P1 (Cao) | Automated PushState/Popstate Assertion | ✅ PASS |
| **TC-029** | Trang Chính Sách Bảo Mật minh bạch (Privacy Policy) & Kiểm soát dữ liệu | REQ-029 | P1 (Cao) | Automated Modal z-[300] & Terms Check | ✅ PASS |
| **TC-030** | Bảng điều khiển thời tiết nhà phát triển (Dev Weather Control Panel) qua Triple-tap | REQ-030 | P2 (Trung bình) | Automated Triple-tap Gesture & State Check | ✅ PASS |
| **TC-031** | Mạng lưới quan trắc thời tiết 63 tỉnh thành & Bộ tính toán chỉ số nhiệt NOAA | REQ-031 | P1 (Cao) | Automated 4-Region Weather & NOAA Formula | ✅ PASS |
| **TC-032** | Cào dữ liệu & Giám sát sức khỏe 50+ nguồn RSS đa kênh & Bộ chuyển đổi proxy tự động | REQ-032 | P0 (Bắt buộc) | Automated Latency Evaluation & Proxy Failover | ✅ PASS |
| **TC-033** | Bộ lọc vệ sinh nội dung bài báo bóc tách & Chống tấn công XSS | REQ-033 | P0 (Bắt buộc) | Automated HTML Security Sanitization Tests | ✅ PASS |
| **TC-034** | Phân hệ quản lý bài viết yêu thích (Bookmarks) & Đọc ngoại tuyến | REQ-034 | P1 (Cao) | Automated LocalStorage Bookmarks Lifecycle | ✅ PASS |
| **TC-035** | Khả năng chống chịu mạng kém & Chế độ ngoại tuyến PWA (Network Resilience) | REQ-035 | P0 (Bắt buộc) | Automated Offline Simulation & Fallback Cache | ✅ PASS |
| **TC-036** | Kiểm thử chịu tải & Chống rò rỉ bộ nhớ khi cuộn vô cực (Stress & Memory Guard) | REQ-036 | P0 (Bắt buộc) | Automated High-Stress Scrolling & Rapid Click | ✅ PASS |
| **TC-037** | Kiểm thử khả năng tiếp cận toàn diện chuẩn WCAG 2.1 AA & Phím tắt tiêu điểm | REQ-037 | P1 (Cao) | Automated Aria-Labels, Focus-Visible & WCAG | ✅ PASS |

---

## 2. CHI TIẾT TỪNG CA KIỂM THỬ (TEST CASE SPECIFICATIONS)

### Nhóm 1: Video Shorts & Smart TV Player

#### TC-001: Header Shorts trên Mobile (< 640px)
- **Mục tiêu**: Đảm bảo trên màn hình hẹp (360px - 390px), Header không bị nhồi nhét, các nút không bị đè lên nhau và badge kênh hiển thị trọn vẹn.
- **Tiền điều kiện**: Modal `VideoShortsModal` được mở ở viewport `< 640px`.
- **Các bước thực hiện**:
  1. Kiểm tra lớp CSS của nút xoay tỉ lệ 16:9/9:16 trên Top Header.
  2. Kiểm tra các nút bên phải (chỉ còn nút Âm thanh và nút Đóng `✕`).
  3. Kiểm tra độ rộng badge kênh `[🔴 CH 01 • VTV24 ▾]`.
- **Kết quả mong đợi**: Nút xoay 16:9 mang lớp `hidden sm:flex` (ẩn hoàn toàn trên mobile). Badge kênh có không gian hiển thị đầy đủ, không bị đè nút.
- **Bằng chứng**: Code verified trong `src/components/VideoShortsModal.tsx`.

#### TC-005: Chuyển kênh TV không bị rỗng playlist (Empty Playlist Prevention)
- **Mục tiêu**: Khi chuyển sang bất kỳ kênh nào trong số 10 kênh báo đài, danh sách phát luôn có đầy đủ video của kênh đó.
- **Các bước thực hiện**:
  1. Duyệt qua 10 kênh: VTV24, Báo Tiền Phong, Báo Tuổi Trẻ, VTC NOW, Báo Lao Động, VTV Thời Tiết, ANTV, VnExpress, Báo Thanh Niên, Báo Dân Trí.
  2. Lấy playlist tương ứng với từng kênh.
  3. Kiểm tra độ dài playlist (`playlist.length`).
- **Kết quả mong đợi**: Mỗi kênh luôn có `playlist.length >= 7`, không bao giờ bằng 0.

#### TC-006: Cơ sở dữ liệu 97 video YouTube thực tế đã xác minh
- **Mục tiêu**: Xác thực 100% video trong `BACKUP_FALLBACK_SHORTS` là video YouTube thực tế, hợp lệ và đã qua oEmbed API.
- **Các bước thực hiện**:
  1. Duyệt mảng `BACKUP_FALLBACK_SHORTS`.
  2. Kiểm tra định dạng `youtubeId` theo chuẩn YouTube regex: `^[a-zA-Z0-9_-]{11}$`.
  3. Xác thực không có video ID chết (như `mBwR5jE57gA` đã được loại bỏ).
- **Kết quả mong đợi**: Đủ 97 video hợp lệ, không có ID nào bị trùng lặp hoặc sai định dạng.

#### TC-008: Tự phục hồi lỗi nhúng YouTube (Error Auto-Recovery)
- **Mục tiêu**: Khi gặp sự cố mạng hoặc video bị giới hạn quyền nhúng (lỗi 100/101/150), hệ thống không bị treo màn hình đen.
- **Kết quả mong đợi**: Hàm xử lý lỗi bắt `event.data` thuộc `[100, 101, 150]`, hiển thị spinner cảnh báo và kích hoạt `setTimeout(..., 2200)` tự động nhảy sang video khả dụng tiếp theo.

---

### Nhóm 2: Đọc Bài Viết & Tác Giả Chuẩn Báo Chính Thống

#### TC-012: Thanh tác giả (Byline Bar) chuẩn báo chính thống
- **Mục tiêu**: Thông tin tác giả xuất hiện trang nhã ngay dưới tiêu đề bài viết.
- **Kết quả mong đợi**:
  + Avatar tròn nhỏ tỉ lệ 1:1 (`w-7 h-7 sm:w-8 sm:h-8 rounded-full`).
  + Tên tác giả in đậm (`font-semibold`).
  + Dấu chấm ngăn cách và thời gian xuất bản (`• {date}`).
  + Nút "Nghe đọc" với icon loa đỏ sang trọng.

#### TC-013: Triệt tiêu phóng to avatar tác giả trong thân bài
- **Mục tiêu**: Bảo đảm không có ảnh avatar tác giả nào (24px, 36px) bị biến thành ảnh bài viết toàn chiều rộng trong thân bài.
- **Kết quả mong đợi**: Hàm `parseHTMLToBlocks` thực hiện pre-cleaning loại bỏ thẻ tác giả, kết hợp bộ lọc kép loại bỏ ảnh avatar và caption trùng tên tác giả.

---

### Nhóm 3: Bố Cục Desktop & Điều Hướng

#### TC-014: Padding khung chứa chính DesktopLayout
- **Mục tiêu**: Khung nội dung chính (`max-w-[1536px]`) có `padding-top: 10px`, `padding-left: 0px`, `padding-right: 0px`.
- **Kết quả mong đợi**: Thuộc tính inline style `style={{ paddingTop: '10px', paddingLeft: '0px', paddingRight: '0px' }}` áp dụng chính xác trên container chính.

#### TC-015: Dải nút danh mục tin tức mở rộng 872px
- **Mục tiêu**: Dải nút cuộn danh mục có class `max-w-[872px]` thay vì `max-w-[650px]`.
- **Kết quả mong đợi**: Container cuộn ngang mang class `max-w-[872px]`, hiển thị thoáng đãng và giảm thao tác cuộn.

---

### Nhóm 4: Build & Vẹn Toàn Hồ Sơ Dự Án

#### TC-018: Biên dịch sản phẩm Vite Build
- **Mục tiêu**: `npm run build` thực thi thành công không lỗi.
- **Kết quả mong đợi**: Mã thoát 0, tạo file `dist/assets/index-*.js` và `dist/assets/index-*.css`.

#### TC-019 & TC-020: Vẹn toàn bộ nhớ & Báo cáo `/testwebsite`
- **Mục tiêu**: Khi chạy lệnh `/testwebsite`, test runner tự động kiểm tra toàn bộ 21 ca kiểm thử và in bảng báo cáo tổng kết có bằng chứng xác minh.

---

### Nhóm 5: Phân Quyền & Giám Sát Chất Lượng Quản Trị

#### TC-021: Phân quyền QA Dashboard chỉ cho tài khoản mrkun28@gmail.com & Hiển thị Header/Fixed Widget
- **Mục tiêu**: Bảng điều khiển QA Dashboard chỉ được phép hiển thị khi đăng nhập đúng email `mrkun28@gmail.com`. Do trang áp dụng tải tin vô cực (infinite scroll) đẩy footer ra xa tầm mắt, nút truy cập bắt buộc phải nằm ở đầu trang (Header) và ghim cố định trên màn hình (Floating Widget).
- **Tiền điều kiện**: Ứng dụng chạy trên web; tài khoản xác thực qua `userRole` hoặc `localStorage`.
- **Các bước thực hiện**:
  1. Kiểm tra hàm `isUserAdminQA` trong `src/App.tsx`: trả về `true` với email `mrkun28@gmail.com` và `false` với tất cả các email khác hoặc khi chưa đăng nhập.
  2. Kiểm tra `QADashboardHeaderButton` xuất hiện trên thanh Header của `MobileLayout`, `TabletLayout`, và `DesktopLayout`.
  3. Kiểm tra `QADashboardFloatingWidget` được render tại gốc `App`, có thuộc tính fixed bottom right (`fixed bottom-6 right-6 z-[999]`).
  4. Kiểm tra menu dropdown Avatar (`UserAvatarMenu`) có mục `🛡️ QA Dashboard (Admin)` được bảo vệ bởi `isUserAdminQA(userRole)`.
  5. Kiểm tra link QA Dashboard ở chân trang `Site Footer` được bảo vệ bởi `{isUserAdminQA(userRole) && (...)}`.
- **Kết quả mong đợi**: Người dùng vãng lai hoặc tài khoản khác không bao giờ nhìn thấy nút QA Dashboard. Khi đăng nhập `mrkun28@gmail.com`, người dùng luôn thấy nút QA tại Header và nút nổi cố định ở góc màn hình bất kể cuộn trang đến độ sâu nào.

---

### Nhóm 6: Kiểm Thử Toàn Diện Luồng Logic & Dữ Liệu Nghiệp Vụ

#### TC-022: Kiểm thử 7 Luồng Logic & Dữ Liệu Nghiệp Vụ Toàn Hệ Thống
- **Mục tiêu**: Đảm bảo 100% các thuật toán tính toán, chuyển đổi dữ liệu và nghiệp vụ cốt lõi chạy chính xác tuyệt đối, không giả lập, không dựa vào kiểm tra chuỗi hình thức.
- **Tiền điều kiện**: Chạy qua `node scripts/test-logic-flows.mjs` hoặc lệnh tự động `/testwebsite`.
- **7 Phân Hệ Kiểm Thử Thực Tế**:
  1. **Luồng Thời Tiết (Weather Logic Flow)**:
     - Chuyển đổi trạng thái `detectConditionKey` và `mapBotStatusToCondKey` (10 condition keys chuẩn).
     - Phân cấp chỉ số bụi PM2.5 `pm25Icon` theo chuẩn WHO (Tốt <=12, Nhạy cảm <=35.4, Nguy hại >35.4).
     - Đổi góc la bàn 0°-360° sang 16 hướng gió tiếng Việt (`getWindDirection`).
     - Tính toán toạ độ Bézier Spline (`calculateSplinePoints`) mượt mà cho đồ thị nhiệt độ SVG.
  2. **Luồng Thị Trường & Tài Chính (Market Finance Flow)**:
     - Bóc tách số tiền và giá (`parseCurrencyValue`) hỗ trợ dấu chấm phân cách hàng nghìn và dấu phẩy thập phân kiểu Việt Nam.
     - Tính độ chênh lệch Spread Mua-Bán vàng SJC, DOJI (`calculateSpread`) và % biên độ.
     - Định dạng tiền tệ VND (`formatVND`) chuẩn đẹp.
     - Đo lường biến động giá tăng/giảm/đi ngang (`calculatePriceChange`).
  3. **Luồng Tin Tức & Khử Trùng Lặp (News Ingestion & Deduplication Flow)**:
     - Trích xuất khoá duy nhất chuẩn hoá (`getUniqueKey`) loại bỏ query params, hash và giao thức.
     - Lọc khử trùng lặp tin tức (`filterDeduplicatedNews`) ngăn chặn hiển thị bài viết trùng.
     - Lọc theo 10 danh mục chủ đề (`filterNewsByCategory`).
     - Phân trang cuộn vô cực an toàn (`paginateNews`).
  4. **Luồng Bóc Tách Bài Báo & Bảo Vệ Avatar (Parser & Avatar Guard Flow)**:
     - Bộ lọc rác và banner quảng cáo (`isBoilerplate`).
     - Bộ bảo vệ hai lớp nhận diện avatar tác giả (`isAuthorAvatar`), ngăn chặn triệt để lỗi phóng to avatar thành ảnh bài viết.
     - Giải mã thực thể HTML và khối CDATA (`decodeHTMLEntities`).
  5. **Luồng Video Shorts & Smart TV (Shorts & TV State Machine Flow)**:
     - Xác thực 97/97 video YouTube thực tế đúng chuẩn 11 ký tự Base64URL (`validateYouTubeId`).
     - Ánh xạ video vào 10 kênh truyền hình báo chí chính thống (`matchesChannel`).
     - Khắc phục rỗng danh sách phát (`generateChannelPlaylist` - Empty Playlist Prevention).
     - Cơ chế Error Auto-Recovery tự động chuyển video sau 2.2 giây khi gặp lỗi nhúng 100/101/150 (`shouldAutoRecoverOnPlaybackError`).
     - Bộ đếm thời gian 5000ms tự động làm mờ và ẩn controls (`calculateControlsVisibility`).
  6. **Luồng Bảo Mật & Phân Quyền (Auth & Security Flow)**:
     - Ma trận chân trị hàm `isUserAdminQA` (Khách = false, Email khác = false, `mrkun28@gmail.com` = true).
     - Phân giải URL dashboard (`getDashboardUrl`) tương thích Localhost và GitHub Pages.
  7. **Luồng Lịch Vạn Niên & Tiện Ích Ngày Tháng (Calendar & Dates Flow)**:
     - Tính số ngày trong tháng (`getDaysInMonth`) xử lý chính xác năm nhuận tháng 2 (2024 = 29 ngày, 2025/2026 = 28 ngày, 2000 = 29 ngày, 1900 = 28 ngày).
     - Xác định thứ của ngày đầu tháng (`getFirstDayOfMonth`).
- **Kết quả mong đợi**: 134/134 assertions logic ĐẠT (PASS 100%), 0 lỗi hồi quy, hệ thống hoàn toàn đồng bộ giữa code và dữ liệu.

### Nhóm 7: Kiểm Thử Trải Nghiệm Người Dùng (UX) & Tương Tác Luồng Thực Tế

#### TC-023: Kiểm thử toàn diện 7 Kịch bản Trải nghiệm Người dùng (UX Scenarios)
- **Mục tiêu**: Đảm bảo toàn bộ tương tác người dùng (User Experience / UX) qua bàn phím, chuột, cảm ứng, phản hồi trạng thái âm thanh và chuyển động thị giác đều mượt mà, phản hồi lập tức và chuẩn công thái học.
- **Tiền điều kiện**: Chạy trên Google Chrome thật qua Playwright (`scripts/test-ux-flows.mjs` hoặc lệnh `/testwebsite`).
- **7 Kịch Bản Trải Nghiệm Người Dùng Thực Tế**:
  1. **UX Luồng Đọc Tin Tức, Audio TTS & Khóa Cuộn Body**:
     - Mở bài viết chi tiết, kiểm tra khóa cuộn trang nền `document.body.style.overflow = "hidden"` (Body scroll lock).
     - Nút "Nghe đọc" trong Byline Bar phản hồi tức thì, kích hoạt Web Speech API tiếng Việt và cập nhật trạng thái "Đang đọc..." kèm hiệu ứng animate-pulse.
     - Phím tắt `Escape` đóng modal ngay lập tức, ngắt audio và khôi phục cuộn trang nền.
  2. **UX Trình Phát Shorts & Smart TV Player (Keyboard Shortcuts & Inactivity)**:
     - Phím `Space`: Tạm dừng / Phát tiếp video tức thời.
     - Phím `M`: Bật/Tắt âm thanh (Mute/Unmute toggle).
     - Phím `ArrowDown`: Chuyển video kế tiếp mượt mà không khựng hình.
     - Phím `Escape`: Đóng trình phát Shorts, khôi phục trang chính.
  3. **UX Đồ Thị Giá Vàng & Tooltip Trực Quan (Market Tooltip UX)**:
     - Tương tác di chuột hiển thị Tooltip giá tại đúng tọa độ, phân biệt rõ "Thực tế: ... Tr" và "Dự kiến: ... Tr".
     - Tự động ẩn Tooltip khi chuột rời khỏi vùng đồ thị (`mouseleave dismissal`).
  4. **UX Dải Danh Mục Tin Tức & Phản Hồi Trực Quan (Category Pills UX)**:
     - Chuyển đổi chuyên mục cập nhật highlight pill màu hồng (`#ff315f`) tức thì.
     - Lọc danh sách bài viết theo chuyên mục mượt mà, không giật layout.
  5. **UX Chuyển Đổi Giao Diện Tối / Sáng (Dark Mode Toggle UX)**:
     - Click nút Dark Mode trên Header: Cập nhật class `.dark` trên thẻ `<html>` và lưu `localStorage`.
     - Click lại: Phục hồi giao diện sáng thanh lịch.
  6. **UX Thời Tiết Công Thái Học & Cuộn Ngang Dự Báo (Weather UX)**:
     - Hiển thị đầy đủ thông số sức khỏe (nhiệt độ, PM2.5, độ ẩm, gió).
     - Khung dự báo 24h hỗ trợ cuộn ngang mượt mà (`overflow-x-auto scrollbar-hide`).
  7. **UX Đa Màn Hình & Vùng Chạm Ngón Tay (Touch Targets & a11y)**:
     - Các phần tử tương tác đáp ứng chuẩn công thái học (touch area >= 40px), không bị đè nút điều khiển.
- **Kết quả mong đợi**: 7/7 kịch bản UX tương tác luồng ĐẠT (PASS 100%), trải nghiệm liền mạch và tự nhiên.

### Nhóm 8: Kiểm Thử Toàn Diện Tương Tác Thực Chiến Đa Màn Hình & Bộ Quét Lỗi Giao Diện Trực Quan

#### TC-024: Kiểm thử thực chiến hành động người dùng (cuộn trang, cuộn ngang, click chi tiết mọi phân hệ, dark mode) và Bộ quét lỗi giao diện trực quan
- **Mục tiêu**: Mô phỏng 100% chuỗi hành động của người dùng thực tế: vuốt cuộn lên/xuống toàn trang, kiểm tra nút ScrollToTop, click mở chi tiết từng bài báo (NewsDetailView), cuộn bài viết, nghe đọc TTS, mở Video Shorts 16:9, tương tác Lịch Vạn Niên, chuyển đổi Dark Mode, và quét sạch toàn bộ lỗi giao diện trực quan (tràn viền ngang, ảnh hỏng, xung đột z-index, touch targets, runtime errors) trên cả Desktop, Tablet và Mobile.
- **Tiền điều kiện**: Chạy trên Chrome thật qua Playwright (`scripts/test-visual-fullsystem.mjs` hoặc lệnh `/testwebsite`).
- **5 Giai Đoạn Kiểm Thử Thực Chiến & Quét Lỗi Trực Quan**:
  1. **Giai đoạn 1: Desktop - Thao tác Vuốt Cuộn Toàn Trang & Nút Scroll To Top**:
     - Cuộn từng bước từ đỉnh xuống 400px -> 1000px -> 1800px -> 2600px để kích hoạt toàn bộ lazy loading và infinite scroll.
     - Kiểm tra nút "Cuộn lên đầu trang" (`ScrollToTop`) tự động xuất hiện khi `scrollY > 300`.
     - Click nút ScrollToTop -> xác nhận trang cuộn mượt mà về đỉnh (`scrollY === 0`).
     - Chụp ảnh bằng chứng: `screen-desktop-scrolled.png`.
  2. **Giai đoạn 2: Desktop - Click & Xem Chi Tiết Bài Báo (News Detail View)**:
     - Click vào card tin tức -> Modal toàn màn hình mở ra (`[data-testid="news-detail-modal"]`).
     - Kiểm tra cuộn trang nền bị khóa (`document.body.style.overflow = "hidden"`).
     - Cuộn đọc 350px bên trong bài viết, kiểm tra thanh tác giả Byline Bar.
     - Bấm nút "Nghe đọc" -> Kích hoạt Web Speech API tiếng Việt và trạng thái "Đang đọc...".
     - Chụp ảnh bằng chứng: `screen-desktop-news-detail.png`.
     - Nhấn phím `Escape` -> Đóng modal, dừng audio, khôi phục cuộn trang nền (`overflow: auto`).
  3. **Giai đoạn 3: Desktop - Tương Tác Các Phân Hệ Khác (Shorts, Thị Trường, Lịch, Dark Mode)**:
     - Mở trình phát Shorts 16:9 Cinema, thử phím `Space` và `M`, chụp ảnh `screen-desktop-shorts.png`, đóng modal bằng `Escape`.
     - Click nút Dark Mode -> Thẻ `<html>` chuyển class `.dark`, giao diện tối sang trọng, chụp ảnh `screen-desktop-darkmode.png`, click lại phục hồi Light Mode.
     - Tương tác Lịch Vạn Niên: Click nút chuyển tháng tới và lùi tháng, cập nhật mượt mà.
  4. **Giai đoạn 4: Audit Thiết Bị Di Động & Máy Tính Bảng (Tablet 768px & Mobile 375px)**:
     - Tablet (768px): Cuộn trang, chụp ảnh `screen-tablet-full.png`, kiểm tra bố cục rạp chiếu 2 cột không vỡ layout.
     - Mobile (375px): Cử chỉ vuốt chạm cuộn xuống 450px, chụp ảnh `screen-mobile-scrolled.png`, kiểm tra header tinh gọn không đè nút.
  5. **Giai đoạn 5: Bộ Quét Lỗi Giao Diện Trực Quan (Visual UI Defect & Layout Scanner)**:
     - Quét tràn viền ngang: Kiểm tra toàn bộ DOM trên Mobile và Desktop, đảm bảo `scrollWidth <= clientWidth + 2` (0 lỗi overflow).
     - Quét ảnh hỏng: Duyệt mọi thẻ `<img>`, đảm bảo `naturalWidth > 0` và `naturalHeight > 0` (0 ảnh hỏng).
     - Quét công thái học vùng chạm: Toàn bộ nút bấm đáp ứng kích thước chuẩn tiếp cận, không bị đè lấn.
     - Lắng nghe Console errors: 0 uncaught runtime exceptions trong suốt toàn bộ phiên.
- **Kết quả mong đợi**: 5/5 giai đoạn tương tác thực chiến ĐẠT (PASS 100%), 0 lỗi tràn viền, 0 ảnh hỏng, đủ điều kiện phát hành.

### Nhóm 9: Kiểm Thử Toàn Diện Các Phân Hệ Nâng Cao & Luồng Hệ Thống Mở Rộng

#### TC-025: Quản lý xác thực Google OAuth 2.0, phiên đăng nhập & Trình đơn hồ sơ người dùng
- **Mục tiêu**: Thẩm định luồng xác thực đăng nhập Google, lưu trữ thông tin người dùng an toàn trong `localStorage` và `cookie`, hiển thị giao diện người dùng (`UserAvatarMenu`) và đăng xuất an toàn.
- **Tiêu chí nghiệm thu**: Khách thấy nút đăng nhập Google; khi đăng nhập hiển thị avatar + tên người dùng; click đăng xuất xóa token và cookie phiên sạch sẽ.

#### TC-026: Phân hệ Lịch Vạn Niên Âm - Dương, điều hướng tháng & Tích hợp Google Calendar cá nhân
- **Mục tiêu**: Thẩm định khối hiển thị lịch dương và lịch âm hoàng đạo, thuật toán năm nhuận `getDaysInMonth`, chuyển tháng trước/sau và trạng thái liên kết Google Calendar API.
- **Tiêu chí nghiệm thu**: Hiển thị đầy đủ ngày âm/dương, chuyển tháng mượt mà không lỗi rendering, tính chính xác năm nhuận.

#### TC-027: Thu thập tin tức RSS từ hơn 38 nguồn báo chí chính thống, nạp vô cực & Cập nhật nền
- **Mục tiêu**: Thẩm định luồng nạp tin tức RSS đa kênh, cơ chế phân trang vô cực `InfiniteScrollTrigger` (15 bài/lần) và tự động làm mới nền sau 2 phút khi người dùng idle > 30s.
- **Tiêu chí nghiệm thu**: Tải tin phong phú, cuộn xuống nạp thêm bài mới, cập nhật thanh LiveNewsTicker và timeline liên tục.

#### TC-028: Định tuyến URL ảo chuẩn SEO cho bài viết chi tiết & Đồng bộ lịch sử Popstate
- **Mục tiêu**: Thẩm định cơ chế cập nhật URL chuẩn SEO `/Website_thoitiet_design/chi-tiet-[slug]` qua `history.pushState` khi mở bài báo và khôi phục về `/Website_thoitiet_design/` khi nhấn nút Back/Escape qua `popstate`.
- **Tiêu chí nghiệm thu**: Trải nghiệm SPA mượt mà, URL chuẩn SEO phản ánh đúng bài viết, không tải lại toàn trang.

#### TC-029: Trang Chính Sách Bảo Mật minh bạch (Privacy Policy) & Kiểm soát dữ liệu người dùng
- **Mục tiêu**: Thẩm định trang Chính Sách Bảo Mật toàn diện mở từ chân trang Footer với modal overlay `z-[300]`, minh bạch 6 phần điều khoản thu thập, xử lý client-side và quyền thu hồi Google.
- **Tiêu chí nghiệm thu**: Modal mở nhanh, cuộn đọc đầy đủ 6 phần điều khoản, bấm "Quay lại" đóng modal an toàn.

#### TC-030: Bảng điều khiển thời tiết nhà phát triển (Dev Weather Control Panel) qua cử chỉ Triple-tap
- **Mục tiêu**: Thẩm định cử chỉ gõ 3 lần liên tiếp (Triple-tap) vào logo Anx. để mở bảng điều khiển `DevWeatherPanel` bí mật, ép chọn nhanh 9 hình thái thời tiết phục vụ kiểm thử giao diện trực quan.
- **Tiêu chí nghiệm thu**: Cử chỉ triple-tap nhạy bén, bảng điều khiển mở ra cho phép chọn 9 trạng thái thời tiết, đổi màu gradient và lời khuyên tức thời.

---

### Nhóm 10: Kiểm Thử Chuyên Sâu, Thu Thập Dữ Liệu & Chịu Tải Toàn Hệ Thống (TC-031..037)

#### TC-031: Mạng lưới quan trắc thời tiết 63 tỉnh thành & Bộ tính toán chỉ số nhiệt NOAA
- **Mục tiêu**: Thẩm định cơ sở dữ liệu quan trắc trải dài 4 miền (Bắc, Trung, Nam, Tây Nguyên), thuật toán tìm kiếm không dấu/có dấu và công thức tính toán chỉ số cảm giác nhiệt (Heat Index) theo chuẩn NOAA của Hoa Kỳ.
- **Tiêu chí nghiệm thu**: Hỗ trợ đầy đủ trạm quan trắc trọng điểm, tính toán Heat Index chính xác tuyệt đối theo phương trình đa thức Rothfusz, phân cấp mức độ nguy hiểm (An toàn, Chú ý, Nguy hiểm).

#### TC-032: Cào dữ liệu & Giám sát sức khỏe 50+ nguồn RSS đa kênh & Bộ chuyển đổi proxy tự động
- **Mục tiêu**: Thẩm định khả năng cào dữ liệu từ 50+ kênh RSS báo chí chính thống, đo đạc độ trễ mạng (latency ms) và cơ chế Proxy Auto-Failover tự động chuyển đổi nhà cung cấp (allorigins, corsproxy, codetabs) khi một proxy gặp sự cố.
- **Tiêu chí nghiệm thu**: Đo latency chính xác, phát hiện và phân loại GOOD/SLOW/FAIL, tự động chuyển proxy khi lỗi mà không gián đoạn luồng nạp tin tức.

#### TC-033: Bộ lọc vệ sinh nội dung bài báo bóc tách & Chống tấn công XSS
- **Mục tiêu**: Thẩm định bộ lọc bảo mật `sanitizeArticleContent` bảo vệ tuyệt đối view đọc bài báo khỏi mọi nguy cơ tiêm mã độc Cross-Site Scripting (XSS).
- **Tiêu chí nghiệm thu**: Triệt tiêu 100% thẻ `<script>`, `<iframe>` lạ, thuộc tính inline event handlers (`onerror`, `onload`, `onclick`), links `javascript:`, và các style độc hại (`position: fixed`, `z-index: 99999`).

#### TC-034: Phân hệ quản lý bài viết yêu thích (Bookmarks) & Đọc ngoại tuyến
- **Mục tiêu**: Thẩm định quy trình lưu trữ bài viết yêu thích vào `localStorage`, thuật toán chống trùng lặp dữ liệu, kiểm tra trạng thái đánh dấu và xóa bài viết khỏi danh sách.
- **Tiêu chí nghiệm thu**: Thêm bài viết mới đưa lên đầu danh sách, lưu trùng không nhân bản phần tử, xóa bài cập nhật trạng thái UI tức thời.

#### TC-035: Khả năng chống chịu mạng kém & Chế độ ngoại tuyến PWA (Network Resilience)
- **Mục tiêu**: Thẩm định khả năng hoạt động liên tục khi xảy ra sự cố ngắt kết nối Internet (Offline Mode) thông qua lắng nghe sự kiện `online`/`offline` và cơ chế nạp dữ liệu đệm cache dự phòng.
- **Tiêu chí nghiệm thu**: Khi mất mạng, hiển thị thông báo ngoại tuyến thanh lịch, tải dữ liệu từ cache mà không trắng trang; khi có mạng trở lại, tự động nạp mới thời gian thực trong 1.5 giây.

#### TC-036: Kiểm thử chịu tải & Chống rò rỉ bộ nhớ khi cuộn vô cực (Stress & Memory Guard)
- **Mục tiêu**: Thẩm định độ ổn định của DOM và hiệu năng bộ nhớ khi cuộn vô cực liên tục qua hơn 100 bài báo DOM, kèm theo thử nghiệm click dồn dập chuyển đổi 9 danh mục và 10 kênh Smart TV (< 300ms/lần click).
- **Tiêu chí nghiệm thu**: 0 lỗi rò rỉ bộ nhớ (memory leaks), không bị race condition, 0 unhandled promise rejections, hiệu năng duy trì 60fps mượt mà.

#### TC-037: Kiểm thử khả năng tiếp cận toàn diện chuẩn WCAG 2.1 AA & Phím tắt tiêu điểm
- **Mục tiêu**: Thẩm định tiêu chuẩn khả năng tiếp cận người dùng theo khuyến nghị WCAG 2.1 AA: nhãn `aria-label`/`title` cho mọi nút biểu tượng, viền chỉ thị tiêu điểm `focus-visible` khi dùng phím `Tab`, và thuộc tính `role="dialog"` trên toàn bộ các modal.
- **Tiêu chí nghiệm thu**: 100% nút icon có nhãn tiếp cận, điều hướng bàn phím mượt mà và tỷ lệ tương phản màu sắc đạt chuẩn $\ge 4.5:1$.

---

### Nhóm 11: Kiểm Thử An Ninh Hệ Thống, Bảo Vệ API & Chống Tấn Công Từ Bên Ngoài (TC-038..TC-042)

#### TC-038: Lớp phòng thủ chống tấn công SSRF & Danh sách trắng URL an toàn cho API
- **Mục tiêu**: Ngăn chặn triệt để các cuộc tấn công Server-Side Request Forgery (SSRF) qua các API fetcher và proxy bằng cách chặn dải IP nội bộ, loopback, cloud metadata và áp dụng whitelist domain.
- **Tiêu chí nghiệm thu**: Chặn 100% các địa chỉ `127.0.0.1`, `localhost`, `10.x.x.x`, `192.168.x.x`, `169.254.169.254`, giao thức nguy hiểm `file://`, `gopher://`, và chỉ cho phép domain thuộc whitelist chính thống.

#### TC-039: Bộ kiểm soát tốc độ API (Rate Limiting) & Chống tấn công từ chối dịch vụ DoS / DDoS
- **Mục tiêu**: Bảo vệ các endpoint API không bị quá tải hoặc bị tê liệt bởi các đợt tấn công từ chối dịch vụ (DoS/DDoS) hoặc spam request liên tục.
- **Tiêu chí nghiệm thu**: Thuật toán Sliding Window Rate Limiter đếm chính xác số request, kích hoạt chặn ngay lập tức khi phát hiện Burst Attack (vượt 10 req/s), trả về mã HTTP `429 Too Many Requests` và header `Retry-After`.

#### TC-040: Lá chắn phòng thủ tiêm mã độc sâu (Deep Injection: SQLi, OS Command, Path Traversal, Prototype)
- **Mục tiêu**: Bảo vệ hệ thống khỏi các vector tiêm mã độc nguy hiểm từ bên ngoài thông qua các ô tìm kiếm, query params và request payload.
- **Tiêu chí nghiệm thu**: Bắt trọn 100% các mẫu SQL Injection (`OR 1=1`, `UNION SELECT`), OS Command Injection (`; rm`, `| cat`, `$(whoami)`), Path Traversal (`../../`, `%2e%2e`), và Prototype Pollution (`__proto__`, `constructor.prototype`), đồng thời bảo toàn văn bản tìm kiếm tiếng Việt bình thường (0 false positives).

#### TC-041: Kiểm soát kích thước Payload, Chống JSON Bomb & Xác thực Schema API
- **Mục tiêu**: Chống lại các cuộc tấn công gây cạn kiệt bộ nhớ hoặc treo CPU bằng cách gửi payload khổng lồ hoặc JSON Bomb lồng nhau sâu hàng chục tầng, đồng thời kiểm tra Schema phản hồi của API để chống giả mạo dữ liệu.
- **Tiêu chí nghiệm thu**: Giới hạn byte size an toàn, chặn ngay JSON có độ sâu lồng nhau $> 10$ tầng, và xác thực hợp lệ các schema cốt lõi (thời tiết, thị trường, tin tức).

#### TC-042: Cơ chế kiểm tra tính toàn vẹn yêu cầu, Chống tấn công phát lại Anti-Replay & Bộ Header An Ninh HTTP
- **Mục tiêu**: Ngăn chặn kẻ tấn công nghe lén và gửi lại gói tin hợp lệ (Replay Attack), kiểm tra tính toàn vẹn yêu cầu và đánh giá sự hiện diện của bộ HTTP Security Headers tiêu chuẩn OWASP.
- **Tiêu chí nghiệm thu**: Bắt trọn request mang Nonce trùng lặp hoặc timestamp lệch quá $\pm 300$ giây, và xác nhận bộ 5 header an ninh (`Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `HSTS`, `Referrer-Policy`) đạt điểm tối đa (100 điểm, passed=true).

---

### Nhóm 12: Hầm Mã Hóa Dữ Liệu An Ninh & Cổng Phân Quyền Giải Mã Quản Trị Viên (TC-043..TC-045)

#### TC-043: Hầm mã hóa dữ liệu an ninh AES-256-GCM & PBKDF2 cho toàn bộ hệ thống (Data at Rest)
- **Mục tiêu**: Toàn bộ cấu hình hệ thống, API keys, credentials, webhook URLs và dữ liệu nội bộ của 2 dự án (`Website_thoitiet_design` & `quan-ly-tien-phong`) được mã hóa AES-256-GCM kết hợp PBKDF2 (100.000 vòng lặp) trước khi commit lên GitHub. Bất kỳ ai vào repository công khai chỉ thấy chuỗi ciphertext `ENC:v1:aes-256-gcm:...`.
- **Tiêu chí nghiệm thu**: Phong bì mã hóa đủ 4 trường (`salt:iv:tag:ciphertext`), giải mã chính xác 100% với Master Key, từ chối giải mã an toàn khi dùng mật khẩu sai, và dữ liệu cấu hình lưu trữ công khai hoàn toàn ở dạng mã hóa.

#### TC-044: Cổng phân quyền giải mã In-Memory Zero-Knowledge cho quản trị viên (mrkun28@gmail.com & Master Key)
- **Mục tiêu**: Thiết lập cổng giải mã bảo mật Zero-Knowledge In-Memory: chỉ quản trị viên xác thực danh tính `mrkun28@gmail.com` hoặc có Master Key bí mật mới được phép giải mã dữ liệu vào bộ nhớ RAM. Tuyệt đối không ghi bản rõ xuống đĩa hay git, hỗ trợ cơ chế tự động khóa và xóa sạch bộ nhớ (Scrub Memory).
- **Tiêu chí nghiệm thu**: Xác thực quyền quản lý `mrkun28@gmail.com` chính xác, mở khóa thành công trong RAM khi đủ điều kiện, từ chối ngay kẻ lạ, và thao tác `lockSystemVault` dọn sạch RAM ngay lập tức.

#### TC-045: Mặt nạ dữ liệu Zero-Knowledge & Bộ quét chống rò rỉ bí mật công khai trên GitHub
- **Mục tiêu**: Tự động che giấu (mask) toàn bộ các trường nhạy cảm đối với người dùng ngoài, đồng thời tích hợp bộ quét phát hiện rò rỉ khóa bí mật công khai (Secret Leak Prevention Scanner) để bảo đảm 0 private key, 0 bot token, 0 API key trần bị lọt vào kho mã nguồn git.
- **Tiêu chí nghiệm thu**: Hàm `maskSensitiveRecord` che giấu trường nhạy cảm cho người ngoài và giữ nguyên cho quản lý; bộ quét `scanContentForSecretLeaks` phát hiện chính xác các mẫu khóa trần và xác nhận mã nguồn sạch không chứa rò rỉ.

---

### Nhóm 13: Bóc Tách & Phát Video Báo Chí và Trình Phát AI VieNeu-TTS (TC-046..TC-047)

#### TC-046: Bóc tách & Phát video nhúng báo chí chính thống trong chi tiết bài viết
- **Mục tiêu**: Khắc phục triệt để lỗi video nhúng trong bài viết chi tiết bị lọc bỏ hoặc không phát được khi lấy tin về từ các cơ quan báo đài chính thống (VTV, Thanh Niên, Tuổi Trẻ, Dân Trí, Tiền Phong, VnExpress, YouTube, TikTok).
- **Tiêu chí nghiệm thu**: 
  1. Nhận diện chính xác danh sách trắng domain báo chí (`TRUSTED_NEWS_VIDEO_DOMAINS`).
  2. Bóc tách video đa tầng từ JSON-LD VideoObject, thẻ `type="VideoStream"`, thẻ `class="cms-video"`, thẻ `<video>` HTML5 và `<iframe>`.
  3. Tự động chuẩn hóa URL HTTPS và cấu hình `referrerPolicy="no-referrer"` trên thẻ video nhúng để vượt qua cơ chế chặn hotlink cross-origin của các báo.
  4. Cung cấp nút fallback an toàn "Mở video gốc" để người dùng luôn xem được video.

#### TC-047: Động cơ AI VieNeu-TTS đọc toàn bộ nội dung chi tiết bài viết không tính tiêu đề
- **Mục tiêu**: Tích hợp công nghệ AI Vietnamese Neural Text-to-Speech từ repository `https://github.com/pnnbao97/VieNeu-TTS` (Phạm Nguyễn Ngọc Bảo) để đọc toàn bộ nội dung chi tiết bài báo khi người dùng nhấn "Play".
- **Tiêu chí nghiệm thu**:
  1. **TUYỆT ĐỐI KHÔNG TÍNH TIÊU ĐỀ**: Bóc tách toàn bộ thân bài, loại bỏ 100% tiêu đề bài viết (`article.title`), loại bỏ chú thích ảnh, boilerplate tác giả.
  2. Chuẩn hóa tiếng Việt (`normalizeVietnameseTextVieNeu`): Xử lý hoàn hảo chức danh học thuật (PGS.TS), cơ quan nhà nước (UBND TP.HCM), tiền tệ (200 tỷ VND, \$500), ngày tháng (15/10/2026), nhiệt độ và tốc độ.
  3. Chia phân đoạn audio ($\le 250$ ký tự) để phát mượt mà không timeout.
  4. Giao diện Trình phát AI Card (`vieneu-tts-player-card`): Đầy đủ Play/Pause, Stop, Tua ±10s, sóng âm thanh động (Waveform), thanh tiến trình đọc thời gian thực và menu chọn giọng Bắc/Nam, tốc độ 0.75x - 1.5x.





