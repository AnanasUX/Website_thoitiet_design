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
- **Mục tiêu**: Khi chạy lệnh `/testwebsite`, test runner tự động kiểm tra toàn bộ 20 ca kiểm thử và in bảng báo cáo tổng kết có bằng chứng xác minh.
