# HỒ SƠ DỰ ÁN (PROJECT OVERVIEW & ARCHITECTURE)

## 1. TỔNG QUAN HỆ THỐNG
- **Tên dự án**: Website Ứng Dụng Thời Tiết, Thị Trường & Bản Tin Thời Sự Đa Kênh (Weather & News Web App).
- **Mục tiêu**: Cung cấp nền tảng số hiện đại tích hợp thông tin thời tiết thời gian thực, bảng giá tài chính/hàng hóa (vàng, ngoại tệ, xăng dầu, chỉ số UVI, chất lượng không khí PM2.5) cùng trung tâm tin tức thời sự đa kênh chuẩn truyền hình số (Smart TV) và video ngắn (Shorts).
- **Môi trường hoạt động**: Web (Desktop, Tablet, Mobile) và Mobile App (PWA, Android APK qua Capacitor).

---

## 2. NGĂN XẾP CÔNG NGHỆ (TECH STACK)
- **Frontend Framework**: React 19 (`react` 19.0.0, `react-dom` 19.0.0).
- **Build Tooling**: Vite 8 (`vite` 8.0.5), TypeScript 5.7 (`typescript` 5.7.0).
- **CSS Engine**: Tailwind CSS v4 (`@tailwindcss/vite` 4.0.0, `@import 'tailwindcss'` trong `src/index.css`).
- **PWA & Hybrid**: `vite-plugin-pwa` 1.3.0, `@capacitor/core` 8.5.2, `@capacitor/cli` 8.5.2.
- **Data Parsing & DOM**: `@mozilla/readability` 0.6.0, `jsdom` 30.1.2.
- **Authentication**: `@react-oauth/google` 0.13.5, `jwt-decode` 4.0.0.

---

## 3. CẤU TRÚC THƯ MỤC CHUẨN
```
Website_thoitiet_design/
├── AGENTS.md                   # Quy tắc bắt buộc cho AI coding assistant
├── AI_PROJECT_PROTOCOL.md      # Quy trình quản lý yêu cầu, lập kế hoạch, kiểm thử và bàn giao
├── docs/                       # Hệ thống hồ sơ bộ nhớ dự án bền vững
│   ├── PROJECT.md              # Kiến trúc, công nghệ và phân hệ chức năng
│   ├── REQUIREMENTS.md         # Danh mục yêu cầu chuẩn hóa kèm mã REQ-xxx
│   ├── DECISIONS.md            # Các quyết định kỹ thuật, mâu thuẫn và phương án loại trừ
│   ├── HANDOFF.md              # Trạng thái phiên làm việc, commit và nhiệm vụ kế tiếp
│   └── qa/
│       ├── TEST_PLAN.md        # Kế hoạch kiểm thử với mã kiểm thử TC-xxx
│       └── RELEASE_GATE.md     # Cổng kiểm duyệt phát hành trước khi triển khai
├── scripts/
│   ├── testwebsite.mjs         # Test runner tự động thực thi qua lệnh /testwebsite
│   └── build-apk.cjs           # Script đóng gói APK Android
├── src/
│   ├── components/             # Các khối giao diện nghiệp vụ
│   │   ├── VideoShortsModal.tsx# Trình phát Video Shorts & Trung tâm Smart TV EPG
│   │   ├── NewsDetailView.tsx  # Trình đọc bài viết chi tiết & Thanh tác giả Byline
│   │   ├── DesktopLayout.tsx   # Bố cục màn hình máy tính & dải tab chuyên mục 872px
│   │   ├── TabletLayout.tsx    # Bố cục máy tính bảng
│   │   ├── MobileLayout.tsx    # Bố cục di động
│   │   ├── WeatherCard.tsx     # Khối hiển thị thời tiết hiện tại
│   │   ├── HourlyForecast.tsx  # Biểu đồ đường cong nhiệt độ theo giờ (SVG)
│   │   ├── MarketWatch.tsx     # Bảng giá vàng, tỷ giá ngoại tệ, xăng dầu
│   │   └── ...
│   ├── services/               # Tầng dịch vụ lấy dữ liệu (API, Scraper, Cache)
│   ├── App.tsx                 # Điều phối giao diện trung tâm
│   ├── main.tsx                # Điểm khởi tạo ứng dụng React
│   └── index.css               # Điểm nhập CSS toàn cục & cấu hình Tailwind v4
└── package.json                # Định nghĩa thư viện & câu lệnh dự án
```

---

## 4. CÁC PHÂN HỆ CHỨC NĂNG CỐT LÕI
1. **Phân hệ Video Shorts & Trung tâm Smart TV (`VideoShortsModal.tsx`)**:
   - 97 video tin tức & Shorts thực tế từ 10 kênh báo chí và truyền hình hàng đầu Việt Nam (VTV24, Báo Tiền Phong, Báo Tuổi Trẻ, VTC Now, Báo Lao Động, VTV Thời Tiết, ANTV, VnExpress TV, Báo Thanh Niên, Báo Dân Trí).
   - Tự động bật tiếng (`unmuted`), hỗ trợ xoay ngang 16:9 Cinema và Toàn màn hình trình duyệt (phím `F`).
   - Tối ưu giao diện đáp ứng (Responsive Separation): Mobile (header tinh gọn chống đè nút), Tablet (khung rạp chiếu 420px), PC (Toàn cảnh 16:9 mặc định).
   - Cơ chế tự phục hồi lỗi nhúng (Error Auto-Recovery) chuyển video sau 2.2 giây khi gặp lỗi mã 100/101/150.
2. **Phân hệ Đọc Bài Viết Chi Tiết & Tác Giả Chuẩn Báo Chính Thống (`NewsDetailView.tsx`)**:
   - Trích xuất thông minh thông tin tác giả (`authorName`, `authorAvatar`, `authorDate`).
   - Thanh tác giả (Byline Bar) trang nhã dưới tiêu đề với logo tròn 1:1 (`w-7 h-7 sm:w-8 sm:h-8 rounded-full`), tên tác giả in đậm, ngày giờ và nút "Nghe đọc".
   - Bộ lọc kiểm tra kép (Dual-layer Guard) ngăn chặn hoàn toàn việc phóng to ảnh avatar tác giả thành ảnh bài viết trong thân bài.
3. **Phân hệ Bố Cục Desktop & Dải Danh Mục Tin Tức (`DesktopLayout.tsx`)**:
   - Khung chứa chính (`max-w-[1536px]`) có `padding-top: 10px`, `padding-left: 0px`, `padding-right: 0px`, kết nối trực quan với thanh tin vắn `LiveNewsTicker`.
   - Dải nút cuộn danh mục tin tức mở rộng tối đa **872px** (`max-w-[872px]`), hiển thị thoáng đãng và giảm thao tác cuộn ngang.
4. **Phân hệ Thời Tiết & Chất Lượng Môi Trường**:
   - Dữ liệu thời tiết tức thời tại trạm quan trắc (nhiệt độ, cảm nhận, độ ẩm, sức gió, tầm nhìn, bụi PM2.5).
   - Biểu đồ dự báo nhiệt độ hàng giờ bằng đường cong SVG mượt mà.
5. **Phân hệ Thị Trường & Tài Chính**:
   - Bảng giá vàng trong nước (SJC, Doji, Phú Quý, Bảo Tín Minh Châu), tỷ giá ngoại tệ Vietcombank, giá xăng dầu Petrolimex.

---

## 5. CƠ CHẾ BẢO ĐẢM CHẤT LƯỢNG (QA & RELEASE GATE)
- Lệnh tự động `/testwebsite` (hoặc `npm run testwebsite`) thực thi toàn bộ kịch bản kiểm thử, đối chiếu mã `REQ-xxx` và `TC-xxx`.
- Cổng kiểm duyệt phát hành (`RELEASE_GATE.md`) ngăn chặn việc phát hành khi chưa đủ bằng chứng hoặc còn lỗi chặn.
