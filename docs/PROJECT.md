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
│   ├── components/             # Các component tách biệt độc lập
│   │   ├── VideoShortsModal.tsx# Trình phát Video Shorts & Trung tâm Smart TV EPG
│   │   └── YouTubeBroadcastPlayer.tsx # Trình phát luồng trực tiếp tin tức
│   ├── assets/                 # Tài nguyên hình ảnh, biểu tượng tĩnh
│   ├── App.tsx                 # Điều phối giao diện trung tâm; chứa DesktopLayout, TabletLayout, MobileLayout, NewsDetailModal, WeatherSection, MarketWatch...
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
- Lệnh tự động `/testwebsite` (hoặc `npm run testwebsite`) thực thi toàn bộ 47 kịch bản kiểm thử, đối chiếu mã `REQ-xxx` và `TC-xxx`.
- Cổng kiểm duyệt phát hành (`RELEASE_GATE.md`) ngăn chặn việc phát hành khi chưa đủ bằng chứng hoặc còn lỗi chặn.

---

## 6. PHÂN HỆ AN NINH MẠNG & HẦM MÃ HÓA DỮ LIỆU (SECURITY & CRYPTO VAULT)
1. **Lá Chắn Bảo Mật API Đa Tầng (`src/utils/securityShield.ts`)**:
   - Phòng thủ SSRF (chặn loopback, private IP, metadata cloud).
   - Kiểm soát tốc độ API Sliding Window (Rate Limiter 10 req/s, chống DoS/DDoS).
   - Phòng thủ tiêm mã độc sâu (SQLi, Command Injection, Path Traversal, Prototype Pollution).
   - Giới hạn kích thước Payload ($\le 512\text{KB}$), chặn JSON Bomb và kiểm tra Schema API.
   - Kiểm tra tính toàn vẹn yêu cầu, chống Replay Attack (Nonce + Time drift $\le 300\text{s}$) và thẩm định HTTP Security Headers.
2. **Hầm Mã Hóa Dữ Liệu 2 Hệ Thống & Cổng Giải Mã Zero-Knowledge In-Memory (`src/utils/cryptoVault.ts`)**:
   - Chuẩn mã hóa NIST **AES-256-GCM** kết hợp **PBKDF2-HMAC-SHA256** (100.000 vòng lặp) bảo vệ toàn bộ dữ liệu tại nghỉ trên GitHub của cả 2 kho `AnanasUX/quan-ly-tien-phong` và `AnanasUX/Website_thoitiet_design`.
   - Cổng giải mã In-Memory trong RAM cho tài khoản quản trị (`mrkun28@gmail.com` hoặc có Master Key), không lưu đĩa, tự động khóa sau 15 phút và xóa sạch RAM (Scrub Memory).
   - Mặt nạ dữ liệu nhạy cảm cho người dùng ngoài và bộ quét phát hiện rò rỉ khóa bí mật GitHub (`scanContentForSecretLeaks`).

---

## 7. ĐỘNG CƠ BÓC TÁCH & PHÁT VIDEO BÁO CHÍ (`src/utils/articleVideoEngine.ts`)
- **Danh sách trắng domain báo chí chính thống**: Hỗ trợ VTV, Báo Thanh Niên, Báo Tuổi Trẻ, Báo Dân Trí, Báo Tiền Phong, VnExpress, MediaCDN, YouTube, TikTok.
- **Bóc tách video đa tầng**: Bóc tách từ JSON-LD VideoObject, thẻ `div[type="VideoStream"]`, `class="cms-video"`, thẻ `<video>` HTML5 và `<iframe>` nhúng.
- **Bảo mật và Tương thích phát**: Thẻ video nhúng cấu hình `referrerPolicy="no-referrer"` vượt chặn hotlink cross-origin, URL chuẩn hóa HTTPS và nút fallback "Mở video gốc".

---

## 8. ĐỘNG CƠ AI CHUYỂN ĐỔI VĂN BẢN THÀNH GIỌNG NÓI VIENEU-TTS (`src/utils/vieneuTTS.ts`)
- **Công nghệ cốt lõi**: Tích hợp kiến trúc Vietnamese Neural Text-to-Speech v3 Turbo 48 kHz High-Fidelity Studio Speech (`pnnbao-ump/VieNeu-TTS-v3-Turbo` - Phạm Nguyễn Ngọc Bảo).
- **Hợp nhất bộ điều khiển duy nhất (Single Source of Truth)**: Toàn bộ giao diện Byline Bar `[data-testid="article-tts-btn"]` và Audio Player Card `[data-testid="vieneu-play-btn"]` được đồng nhất vào một thể hiện `VieNeuTTSController` duy nhất.
- **Triệt tiêu lệch giọng đa thiết bị & Loại bỏ hoàn toàn Google Translate TTS**: 100% URL stream âm thanh trỏ về Same-Origin endpoint `/api/tts/stream?text=...&voice=...` không hardcode localhost. Khi FastAPI daemon cổng 8000 hoạt động, proxy chuyển tiếp nguyên bản; khi daemon tắt, middleware Vite tự động tổng hợp sóng âm Studio 48 kHz mono 16-bit PCM (Native In-Memory WAV Synthesis) phân biệt rõ rệt âm sắc Nam/Nữ và từng nhân vật, đảm bảo mọi thiết bị (PC công ty, PC ở nhà, điện thoại) phát ra CÙNG 1 GIỌNG ĐỌC ĐỒNG NHẤT.
- **Ánh xạ giọng đọc chuẩn quy (`resolveVieNeuVoice`)**: Đối chiếu 23 preset voices, tự động ánh xạ alias `bac_nu` -> `mai_anh` và `nam_nam` -> `minh_triet`.
- **Hủy yêu cầu tức thời khi đổi giọng**: Hủy token yêu cầu cũ `activeRequestId++`, dừng audio cũ ngay lập tức và phát lại đoạn văn bản bằng đúng giọng mới, không bao giờ để chunk cũ tiếp tục phát.
- **Quy tắc trích xuất khắt khe**: Bóc tách toàn bộ nội dung thân bài + Sapo, **TUYỆT ĐỐI KHÔNG TÍNH TIÊU ĐỀ BÀI VIẾT** (`article.title`), loại bỏ chú thích ảnh và boilerplate tác giả.
- **Chuẩn hóa văn bản tiếng Việt**: Quy đổi chức danh học thuật (PGS.TS), cơ quan nhà nước (UBND TP.HCM), tiền tệ (200 tỷ VND, \$500), ngày tháng (15/10/2026), nhiệt độ và tốc độ.
- **Trình phát AI Player Card**: Tích hợp thanh điều khiển phát/dừng, tua ±10s, sóng âm thanh động (Audio Waveform), thanh tiến trình đọc thời gian thực, tùy chọn giọng đọc 3 miền Bắc - Trung - Nam, tốc độ đọc 0.75x - 1.5x, hiển thị câu đang đọc thời gian thực và banner báo lỗi mạng kèm nút `[Thử lại]`.



