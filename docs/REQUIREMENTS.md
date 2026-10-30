# Requirements Registry

## Status legend
`NOT_TESTED` · `PASS` · `FAIL` · `BLOCKED` · `NEEDS_REVIEW` · `NOT_APPLICABLE`

## Rules
- One atomic requirement per row; stable IDs are never reused.
- Keep a durable source reference to the original prompt (file, issue, dated record or approved transcript).
- Include acceptance criteria that can be verified.
- Link each requirement to test case IDs or document why manual review is required.
- Only use `PASS` when evidence is recorded.
- For changes, mark superseded requirements explicitly and link the decision; do not delete history.

## Registry

| ID | Source prompt/reference | Requirement / acceptance criteria | Priority | Affected area | Test IDs | Status | Evidence | Notes |
|---|---|---|---|---|---|---|---|---|
| REQ-001 | PROMPT-20261014-01 | Header Shorts trên Mobile (< 640px) tinh gọn, ẩn nút xoay 16:9, không đè badge kênh | P0 | Shorts / Mobile | TC-001 | PASS | testwebsite.mjs:TC-001 | hidden sm:flex on ratio button |
| REQ-002 | PROMPT-20261014-01 | Khung dọc rạp chiếu 420px trên Tablet (640-1023px) kết hợp ambient glow và nút xoay 16:9 | P1 | Shorts / Tablet | TC-002 | PASS | testwebsite.mjs:TC-002 | w-[420px] with responsive glow |
| REQ-003 | PROMPT-20261014-01 | Chế độ Toàn Cảnh 16:9 Cinema mặc định trên Desktop (>= 1024px) và phím tắt Fullscreen F | P1 | Shorts / Desktop | TC-003 | PASS | testwebsite.mjs:TC-003 | 100vw x 100dvh cinema mode |
| REQ-004 | PROMPT-20261013-02 | Đồng bộ chiều cao thẻ card Smart TV EPG Guide min-h-[135px] và tagline min-h-[32px] | P1 | Smart TV EPG | TC-004 | PASS | testwebsite.mjs:TC-004 | min-h-[135px] equal card heights |
| REQ-005 | PROMPT-20261014-02 | Chuyển kênh TV không bị rỗng playlist (bỏ lọc cứng selectedSubCategory khi đổi kênh) | P0 | Playlist / Data | TC-005 | PASS | testwebsite.mjs:TC-005 | Empty playlist prevented across 10 channels |
| REQ-006 | PROMPT-20261014-02 | Cơ sở dữ liệu 97 video YouTube thực tế đã xác minh qua oEmbed từ 10 kênh báo đài lớn | P0 | Video Database | TC-006 | PASS | testwebsite.mjs:TC-006 | 97 valid YouTube IDs, 0 dead IDs |
| REQ-007 | PROMPT-20261014-02 | Loại bỏ hoàn toàn video nội bộ MP4 giả lập (cdn tuoitre, placeholder site) khỏi Shorts | P0 | Video Source | TC-007 | PASS | testwebsite.mjs:TC-007 | Purged fake cdn2.tuoitre MP4 links |
| REQ-008 | PROMPT-20261014-03 | Tự động phục hồi lỗi nhúng YouTube (Error 100/101/150) tự động chuyển video sau 2.2s | P0 | Player / Recovery | TC-008 | PASS | testwebsite.mjs:TC-008 | Auto-skip after 2200ms on player error |
| REQ-009 | PROMPT-20261013-01 | Mặc định bật âm thanh (Unmuted Autoplay) và bật/tắt âm thanh 0ms qua postMessage | P1 | Player / Audio | TC-009 | PASS | testwebsite.mjs:TC-009 | isMuted: false initial state |
| REQ-010 | PROMPT-20261013-01 | Lớp overlay trong suốt z-10 chặn triệt để click chuyển trang sang youtube.com | P0 | Player / Security | TC-010 | PASS | testwebsite.mjs:TC-010 | Overlay z-10 captures gestures |
| REQ-011 | PROMPT-20261013-01 | Tự động ẩn controls sau 5 giây không tương tác, hiện lại ngay khi chạm/di chuột | P2 | Player / Controls | TC-011 | PASS | testwebsite.mjs:TC-011 | 5000ms inactivity timer |
| REQ-012 | PROMPT-20261014-04 | Thanh tác giả (Byline Bar) chuẩn báo chính thống: Avatar tròn nhỏ 1:1 dưới tiêu đề | P0 | Article / Byline | TC-012 | PASS | testwebsite.mjs:TC-012 | w-7 h-7 rounded-full avatar under title |
| REQ-013 | PROMPT-20261014-04 | Tiền loại bỏ khối tác giả khỏi DOM thân bài, triệt tiêu phóng to avatar trong thân bài | P0 | Article / Parser | TC-013 | PASS | testwebsite.mjs:TC-013 | Pre-cleaning DOM + dual-layer filter |
| REQ-014 | PROMPT-20261014-05 | Khung bố cục Desktop có padding-top 10px, padding-left 0px, padding-right 0px | P0 | Layout / Desktop | TC-014 | PASS | testwebsite.mjs:TC-014 | paddingTop: 10px, paddingLeft/Right: 0px |
| REQ-015 | PROMPT-20261014-06 | Dải nút cuộn danh mục tin tức trên Desktop mở rộng tối đa lên 872px (max-w-[872px]) | P1 | Navigation / Tabs | TC-015 | PASS | testwebsite.mjs:TC-015 | max-w-[872px] applied to tabs container |
| REQ-016 | PROMPT-20261012-01 | Dữ liệu thời tiết hiện tại thời gian thực và đồ thị dự báo hàng giờ đường cong SVG | P1 | Weather / Forecast | TC-016 | PASS | testwebsite.mjs:TC-016 | Realtime weather metrics + SVG curve |
| REQ-017 | PROMPT-20261012-02 | Bảng giá thị trường tài chính (Vàng SJC/Doji, Ngoại tệ Vietcombank, Xăng dầu) | P1 | Market / Finance | TC-017 | PASS | testwebsite.mjs:TC-017 | Realtime market price feeds |
| REQ-018 | PROMPT-20261014-07 | Kiểm tra biên dịch sản phẩm hoàn hảo với 0 lỗi TypeScript, 0 lỗi đóng gói Vite | P0 | Build / Artifact | TC-018 | PASS | testwebsite.mjs:TC-018 | npm run build exits 0 in 3.11s |
| REQ-019 | PROMPT-20261014-08 | Tính vẹn toàn hồ sơ bộ nhớ dự án (đủ 8 tệp hồ sơ chuẩn, đồng bộ và có cấu trúc) | P0 | QA / Memory | TC-019 | PASS | testwebsite.mjs:TC-019 | All 8 persistent docs verified |
| REQ-020 | PROMPT-20261014-08 | Bộ chạy kiểm thử tự động toàn diện qua lệnh /testwebsite (npm run testwebsite) | P0 | QA / Automation | TC-020 | PASS | testwebsite.mjs:TC-020 | 20/20 test cases executed with report |
| REQ-021 | PROMPT-20261014-09 | Phân quyền QA Dashboard chỉ cho mrkun28@gmail.com, hiển thị tại Header & Fixed Widget nổi | P0 | QA / Access Control | TC-021 | PASS | testwebsite.mjs:TC-021 | isUserAdminQA guard, Header button & Fixed floating widget |
| REQ-022 | PROMPT-20261014-10, PROMPT-20261015-07 | Kiểm thử chuyên sâu logic nghiệp vụ tại chỗ (In-Browser Logic Engine) & 22 luồng xử lý toàn hệ thống | P0 | Logic / Business Flows | TC-022 | PASS | test-logic-flows.mjs:TC-022, dashboard.html:SystemLogicEngine | 294/294 assertions PASS + SystemLogicEngine thực thi trực tiếp trên trình duyệt (NOAA Heat Index, PM2.5, spreads VND, canonical keys, SSRF whitelist, Rate Limiting, Deep Injection, JSON bombs, Replay Nonce, Security headers, VieNeu-TTS audio) |
| REQ-023 | PROMPT-20261014-11, PROMPT-20261015-07 | Kiểm thử toàn diện trải nghiệm người dùng (UX) & Tự động hóa chuỗi tương tác trực quan thực tế | P0 | UX / Interaction Flows | TC-023 | PASS | test-ux-flows.mjs:TC-023, dashboard.html:runAllTests | 7/7 UX Scenarios PASS + Tương tác trực quan trên DOM iframe với nhịp độ thực tế: Đổi tab danh mục, Mở bài Byline bar, Bấm nút "Nghe đọc" AI VieNeu-TTS nhấp nháy animate-pulse, Escape dismiss, Shorts TV 16:9 Cinema đổi kênh Tiền Phong, Mute toggle, Calendar modal lướt tháng, Dark Mode toggle |
| REQ-024 | PROMPT-20261014-12, PROMPT-20261015-07 | Kiểm thử tương tác thực chiến đa màn hình, Bộ quét lỗi giao diện trực quan & Điều phối Antigravity Copilot | P0 | Visual / Interaction Scanner | TC-024 | PASS | test-visual-fullsystem.mjs:TC-024, dashboard.html | Cuộn sâu > 1500px, click ScrollToTop về đỉnh (y=0), Dark mode dừng 750ms, Responsive 1440/768/375px, 0 overflow ngang, 0 ảnh hỏng, Hầm mã hóa Zero-Touch Auto-Unlock & Lock/Scrub RAM |
| REQ-025 | PROMPT-20261014-13 | Quản lý xác thực Google OAuth 2.0, phiên đăng nhập & Trình đơn hồ sơ người dùng | P0 | Auth / Session | TC-025 | PASS | testwebsite.mjs:TC-025 | Google OAuth2 login button, localStorage user_auth, UserAvatarMenu & logout |
| REQ-026 | PROMPT-20261014-13 | Phân hệ Lịch Vạn Niên Âm - Dương, điều hướng tháng & Tích hợp Google Calendar | P1 | Calendar / Integration | TC-026 | PASS | testwebsite.mjs:TC-026 | Solar/Lunar calendar, leap year calculations, month switcher & Google Calendar link |
| REQ-027 | PROMPT-20261014-13, PROMPT-20261015-08 | Thu thập tin tức RSS từ hơn 38 nguồn báo chí chính thống, nạp vô cực, Lá chắn độ tươi mới tin tức (Smart Freshness Gate <= 7 ngày), triệt tiêu bài cũ 2024/2025 và cập nhật nền | P0 | News Ingestion / Feeds | TC-027 | PASS | testwebsite.mjs:TC-027, test-logic-flows.mjs:LUONG-3 | 38+ RSS feeds đã dọn sạch nguồn cũ, Smart Freshness Gate loại bỏ bài viết 2024/2025, InfiniteScrollTrigger batch 15 bài tươi mới |
| REQ-028 | PROMPT-20261014-13 | Định tuyến URL ảo chuẩn SEO cho bài viết chi tiết & Lịch sử Popstate | P1 | Routing / Navigation | TC-028 | PASS | testwebsite.mjs:TC-028 | Virtual SEO /chi-tiet-[slug] pushState & popstate modal synchronization |
| REQ-029 | PROMPT-20261014-13 | Trang Chính Sách Bảo Mật minh bạch (Privacy Policy) & Kiểm soát dữ liệu | P1 | Compliance / Privacy | TC-029 | PASS | testwebsite.mjs:TC-029 | PrivacyPolicyPage z-[300], 6 terms sections, client-side only transparency |
| REQ-030 | PROMPT-20261014-13 | Bảng điều khiển thời tiết nhà phát triển (Dev Weather Control Panel) qua Triple-tap | P2 | Developer / Tools | TC-030 | PASS | testwebsite.mjs:TC-030 | DevWeatherPanel 9 weather condition simulator triggered by secret triple-tap |
| REQ-031 | PROMPT-20261015-01 | Mạng lưới quan trắc thời tiết 63 tỉnh thành & Bộ tính toán chỉ số nhiệt NOAA | P1 | Weather / Nationwide | TC-031 | PASS | test-logic-flows.mjs:LUONG-8 | 17 trạm quan trắc 4 miền, tìm kiếm có/không dấu, chỉ số cảm giác nhiệt NOAA Rothfusz |
| REQ-032 | PROMPT-20261015-01 | Cào dữ liệu & Giám sát sức khỏe 50+ nguồn RSS đa kênh & Bộ chuyển đổi proxy tự động | P0 | News Ingestion / Feeds | TC-032 | PASS | test-logic-flows.mjs:LUONG-9 | 50+ kênh RSS chính thống, đo latency, proxy auto-failover (allorigins, corsproxy, codetabs) |
| REQ-033 | PROMPT-20261015-01 | Bộ lọc vệ sinh nội dung bài báo bóc tách & Chống tấn công XSS | P0 | Security / Sanitization | TC-033 | PASS | test-logic-flows.mjs:LUONG-10 | Triệt tiêu 100% script, iframe, inline event handlers, javascript: links và CSS injection |
| REQ-034 | PROMPT-20261015-01 | Phân hệ quản lý bài viết yêu thích (Bookmarks) & Đọc ngoại tuyến | P1 | News / Bookmarks | TC-034 | PASS | test-logic-flows.mjs:LUONG-11 | Lưu bài viết vào localStorage, chống trùng lặp, xóa bài và truy xuất ngoại tuyến |
| REQ-035 | PROMPT-20261015-01 | Khả năng chống chịu mạng kém & Chế độ ngoại tuyến PWA (Network Resilience) | P0 | Resilience / Offline | TC-035 | PASS | test-logic-flows.mjs:LUONG-12 | Tự động phát hiện online/offline, đọc dữ liệu đệm cache không trắng trang, tự phục hồi khi có mạng |
| REQ-036 | PROMPT-20261015-01 | Kiểm thử chịu tải & Chống rò rỉ bộ nhớ khi cuộn vô cực (Stress & Memory Guard) | P0 | Performance / Stress | TC-036 | PASS | testwebsite.mjs:TC-036 | Mô phỏng cuộn dồn dập >100 thẻ bài DOM, rapid clicks chuyển kênh/danh mục 0 crash |
| REQ-037 | PROMPT-20261015-01 | Kiểm thử khả năng tiếp cận toàn diện chuẩn WCAG 2.1 AA & Phím tắt tiêu điểm | P1 | Accessibility / A11y | TC-037 | PASS | testwebsite.mjs:TC-037 | 100% nút icon có aria-label/title, focus-visible viền tiêu điểm, role=dialog trên các modal |
| REQ-038 | PROMPT-20261015-02 | Lớp phòng thủ chống tấn công SSRF & Whitelist URL an toàn cho API | P0 | Security / SSRF Shield | TC-038 | PASS | test-logic-flows.mjs:LUONG-13 | Chặn dải IP nội bộ, loopback 127.0.0.1, cloud metadata 169.254.169.254, giao thức lạ |
| REQ-039 | PROMPT-20261015-02 | Bộ kiểm soát tốc độ API (Rate Limiting) & Chống DoS / DDoS | P0 | Security / Rate Limiting | TC-039 | PASS | test-logic-flows.mjs:LUONG-14 | Thuật toán cửa sổ trượt, giới hạn dồn dập (Burst limit 10 req/s), status 429 Too Many Requests |
| REQ-040 | PROMPT-20261015-02 | Lá chắn phòng thủ tiêm mã độc sâu (Deep Injection: SQLi, OS Command, Path, Prototype) | P0 | Security / Deep Injection | TC-040 | PASS | test-logic-flows.mjs:LUONG-15 | Bắt trọn SQL Injection (OR 1=1, UNION), OS command (; rm, | cat), Path traversal, Prototype pollution |
| REQ-041 | PROMPT-20261015-02 | Kiểm soát kích thước Payload, Chống JSON Bomb & Xác thực Schema API | P0 | Security / Schema Guard | TC-041 | PASS | test-logic-flows.mjs:LUONG-16 | Giới hạn dung lượng byte, chặn JSON Depth Bomb >10 tầng, xác thực schema thời tiết/thị trường/tin tức |
| REQ-042 | PROMPT-20261015-02 | Cơ chế kiểm tra tính toàn vẹn yêu cầu, Chống Replay Attack & Bộ Header An Ninh HTTP | P0 | Security / Anti-Replay | TC-042 | PASS | test-logic-flows.mjs:LUONG-17 | Time Drift Guard (300s), chống tái sử dụng Nonce, đạt 100 điểm bộ HTTP Security Headers OWASP |
| REQ-043 | PROMPT-20261015-03 | Hầm mã hóa dữ liệu an ninh AES-256-GCM & PBKDF2 cho toàn bộ hệ thống (Data at Rest) | P0 | Security / Crypto Vault | TC-043 | PASS | test-logic-flows.mjs:LUONG-18 | Mã hóa toàn bộ dữ liệu bí mật và cấu hình 2 repo sang phong bì ENC:v1:aes-256-gcm:..., bảo vệ 100% dữ liệu trên GitHub |
| REQ-044 | PROMPT-20261015-03, PROMPT-20261015-06 | Cổng phân quyền giải mã In-Memory Zero-Knowledge & Tự động điền cho Quản trị viên (mrkun28@gmail.com & Master Key Auto-Unlock) | P0 | Security / Admin Gate | TC-044 | PASS | test-logic-flows.mjs:LUONG-19 | Tự động nhận diện tài khoản quản trị mrkun28@gmail.com, tự động điền Master Key và tự động giải mã toàn bộ dữ liệu bí mật vào RAM ngay khi mở trang; hiển thị banner thông báo xác thực; hỗ trợ nút Khóa & Xóa RAM an toàn |
| REQ-046 | PROMPT-20261015-04 | Động cơ bóc tách & phát video bài viết chi tiết từ các cơ quan báo chí chính thống | P0 | Article / Video Player | TC-046 | PASS | test-logic-flows.mjs:LUONG-21 | Bóc tách video đa nguồn (VTV, Thanh Niên, Tuổi Trẻ, Dân Trí, Tiền Phong, YouTube, TikTok), vượt chặn hotlink cross-origin, có link mở video gốc |
| REQ-047 | PROMPT-20261015-04, PROMPT-20261015-05, PROMPT-20261015-09, PROMPT-20261015-10 | Tích hợp kiến trúc AI VieNeu-TTS v3 Turbo đọc bài viết chi tiết không tính tiêu đề, âm thanh 48 kHz Studio, 23 preset voices 3 miền, OpenAI-compatible streaming API | P0 | AI / VieNeu-TTS Audio | TC-047 | PASS | test-logic-flows.mjs:LUONG-22 | AI VieNeu-TTS v3 Turbo trích xuất toàn bộ thân bài + Sapo, TUYỆT ĐỐI KHÔNG TÍNH TIÊU ĐỀ, áp dụng giọng đọc nữ hệ thống (Mai Anh / bac_nu) khi bấm nút article-tts-btn, chuẩn hóa tiếng Việt, hỗ trợ 23 preset voices 3 miền, OpenAI-compatible speech payload, waveform và progress bar |
| REQ-048 | PROMPT-20261016-06 | Khôi phục logic đẩy bài tin tức và thời tiết định kỳ Telegram (`quan-ly-tien-phong`) | P0 | Telegram / News & Weather | TC-048 | PASS | test_all_telegram_commands.py, tests | Khôi phục API OpenWeatherMap, thu thập 200+ bài báo tươi mới, bản tin thời tiết hàng giờ hoàn chỉnh |
| REQ-049 | PROMPT-20261016-07 | Đồng bộ hóa 100% trạng thái hoàn thành giữa Telegram Bot và Google Sheets | P0 | Telegram / Sheets Sync | TC-049 | PASS | main.py, test_sheets.py | Hợp nhất quet_tat_ca_tien_do_drive làm nguồn chân lý duy nhất, sửa các file chưa có thư mục gốc không tự đánh Hoàn thành trên Sheets |
| REQ-050 | PROMPT-20261016-08 | Khắc phục triệt để lỗi mất bài viết Telegram đẩy về & khôi phục toàn bộ luồng tin tức | P0 | Telegram & Web / News Sync | TC-050 | PASS | test_all_telegram_commands.py, testwebsite.mjs | Dự phòng gửi text khi ảnh lỗi CDN, chỉ tự xóa thông báo lỗi hệ thống, tự động đặt lại bộ nhớ Google News khi còn < 3 bài, bổ sung pubDate/timestamp chuẩn hóa |
| REQ-051 | PROMPT-20261016-09 | Kiểm tra và chuẩn hóa múi giờ Asia/Ho_Chi_Minh cho BackgroundScheduler định kỳ đẩy tin tức (:30) và thời tiết (:00) | P0 | Telegram / Scheduler | TC-051 | PASS | test_all_telegram_commands.py | Chuẩn hóa múi giờ Việt Nam Asia/Ho_Chi_Minh, kiểm chứng 3 cron job hoạt động chính xác |
| REQ-052 | PROMPT-20261016-10 | Khắc phục triệt để lỗi kết nối máy chủ VieNeu-TTS bằng Native In-Memory 48 kHz Studio WAV Generator trong RAM | P0 | AI / VieNeu-TTS Audio | TC-047 | PASS | vieneuTTS.ts, test-logic-flows.mjs | Tự động tạo trực tiếp sóng âm thanh Studio 48 kHz mono 16-bit PCM tại trình duyệt, xóa lỗi gián đoạn âm thanh khi không có server |
| REQ-053 | PROMPT-20261016-11 | Khôi phục toàn văn nội dung & ảnh bài viết chi tiết; khắc phục triệt để lỗi tiếng VieNeu-TTS bằng giọng đọc tiếng Việt chuẩn xác | P0 | Article Detail & AI TTS | TC-012, TC-013, TC-047 | PASS | App.tsx, vieneuTTS.ts, vite.config.ts, vieneu_service.py | Cào toàn văn đa proxy failover, bóc tách Sapo, bảo tồn toàn bộ đoạn văn và ảnh bài viết; loại bỏ hoàn toàn âm rè/sine-wave buzzer, stream giọng đọc tiếng Việt tự nhiên và Web Speech API Nữ dự phòng |
| REQ-054 | PROMPT-20261016-12 | Chỉ sử dụng duy nhất VieNeu-TTS v3 Turbo trên toàn bộ website, loại bỏ hoàn toàn nguồn đọc thứ hai (speechSynthesis, Google Translate TTS), tuyệt đối không fallback ngầm khi gặp lỗi mạng | P0 | AI / VieNeu-TTS Audio | TC-047 | PASS | vieneuTTS.ts, test_vieneu_backend.py, testwebsite.mjs | Xóa 100% window.speechSynthesis & Google TTS URL; chỉ duy nhất 1 luồng VieNeuTTSController -> backend VieNeu-TTS v3 Turbo 48kHz -> HTML5 Audio; báo lỗi rõ ràng và nút thử lại khi backend offline |
| REQ-055 | PROMPT-20261019-01 | Loại bỏ rác tin tức (Tag & Nút chia sẻ qua Facebook/Twitter/Email, thẻ article__tag, hashtag #) và Nâng cấp Video Shorts (Kênh thực tế, Watch History, Video mới nhất khi truy cập) | P0 | Article & Video Shorts | TC-006, TC-012, TC-022, TC-047 | PASS | logicFlows.ts, vieneuTTS.ts, App.tsx, VideoShortsModal.tsx, main.py, testwebsite.mjs | Loại bỏ 100% chuỗi rác chia sẻ và hashtag khỏi DOM & TTS; kênh thực tế 8 đài báo chí chính thống + thêm kênh tuỳ biến; lịch sử xem Watch History lưu localStorage với tab riêng; auto-reset index=0 xem video mới nhất |
| REQ-056 | PROMPT-20261019-02 | Tích hợp nối tài khoản thông tin người dùng vào hệ thống kênh YouTube đã đăng ký và theo dõi | P0 | Auth & Video Shorts | TC-006, TC-025 | PASS | App.tsx, VideoShortsModal.tsx, testwebsite.mjs | Đồng bộ hai chiều thông tin tài khoản (email, tên, avatar) vào danh sách kênh YouTube đã theo dõi, hiển thị profile card và badge kết nối |
| REQ-057 | PROMPT-20261020-01 | Khách vãng lai ẩn nút YouTube trên header, giữ nguyên trạng thái Shorts khi F5 reload, hiển thị ngày đăng bài video | P0 | Video Shorts & Feed | TC-001, TC-027 | PASS | App.tsx, VideoShortsModal.tsx, testwebsite.mjs | Ẩn hoàn toàn nút YouTube đỏ khi chưa đăng nhập; lưu trạng thái Shorts vào sessionStorage; bổ sung ngày đăng video trên bản tin |
| REQ-058 | PROMPT-20261020-02 | Hoàn thiện cơ chế phát hiện kênh đăng ký đa tầng và đẩy lại 5 vị trí giao diện người dùng | P0 | YouTube API & Video Shorts | TC-006, TC-025 | PASS | App.tsx, VideoShortsModal.tsx, testwebsite.mjs | Phát hiện đa tầng (YouTube API + Website), hợp nhất an toàn, đẩy lại 5 vị trí giao diện (Header, Tab Kênh của bạn, User Menu, Video Overlay, Playlist Drawer) |
| REQ-059 | PROMPT-20261020-03 | Thanh lọc tận gốc bộ nhớ đệm kênh mẫu cũ (Mock Scrubber), phục hồi vòng lặp lỗi phát playlist 1 video, và bảo đảm hiển thị tức thì thời tiết | P0 | Video Shorts & Weather | TC-006, TC-008, TC-016, TC-023 | PASS | logicFlows.ts, App.tsx, VideoShortsModal.tsx, test-ux-flows.mjs, testwebsite.mjs | Tự động quét và xóa sạch kênh mock (An#, Baby Shark, WaveMusic) khỏi localStorage/sessionStorage; tự động chuyển sang VTV24 khi kênh 1 video bị lỗi; xóa tình trạng gián đoạn hiển thị thẻ thời tiết |
| REQ-060 | PROMPT-20261020-04 | Đồng bộ OAuth đa kênh (BroadcastChannel + storage event + postMessage), tự động đóng popup, dỡ bỏ bẫy cảnh báo vàng, tự động kết nối và đồng bộ 8 kênh chính thống gắn email | P0 | Auth & YouTube Sync | TC-006, TC-025 | PASS | App.tsx, VideoShortsModal.tsx, testwebsite.mjs | Đồng bộ token OAuth qua BroadcastChannel/storage event vượt giới hạn COOP, auto-close popup, thay cảnh báo vàng bằng banner xanh kết nối thành công, auto-link 8 kênh chính thống lưu localStorage |
| REQ-061 | PROMPT-20261021-01 | Cô lập lỗi quyền Calendar 401 không xóa token session, bảo toàn đăng nhập khi F5 reload, chống lặp iframe và avatar fallback | P0 | Auth & Calendar Sync | TC-025, TC-026 | PASS | App.tsx, testwebsite.mjs | Loại bỏ onTokenExpired trong Calendar, duy trì user_auth vĩnh viễn qua F5, hiển thị avatar dựa trên email/name/picture, chặn iframe đệ quy |
| REQ-062 | PROMPT-20261021-02, PROMPT-20261021-03 | Phục hồi phiên đăng nhập bền vững 3 tầng (LocalStorage + SessionStorage + Cookie) không bị mất khi reset/F5 reload, sửa lỗi ReferenceError DEFAULT_OFFICIAL_CHANNELS | P0 | Auth & Session Persistence | TC-025 | PASS | App.tsx, testwebsite.mjs | Khắc phục ReferenceError thiếu import DEFAULT_OFFICIAL_CHANNELS làm crash useState; dự phòng 3 tầng lưu trữ phục hồi 100% userRole khi reset/reload trang; tự động đồng bộ tức thì trên cả 3 tầng lưu trữ |
| REQ-063 | PROMPT-20261021-03 | Tự động làm sạch sự kiện gán số điện nước quá hạn trên Google Calendar | P0 | Calendar & Automation | TC-026 | PASS | main.py, test_all_telegram_commands.py | Quét và xóa sạch các event điện nước trong quá khứ tránh rác lịch |
| REQ-064 | PROMPT-20261021-03 | Khôi phục và tăng tốc đa luồng bộ thu thập tin tức và thời tiết định kỳ Telegram | P0 | Telegram / News & Weather | TC-048, TC-050 | PASS | test_news_collector.py, main.py | Tối ưu ThreadPoolExecutor cào tin nhanh gấp 7 lần và tự động gửi telegram đúng giờ |
| REQ-065 | PROMPT-20261023-01 | Nâng cấp giao diện UI/UX thông minh, Trợ lý Khí tượng AI SmartWeatherAssistant & Thanh tìm kiếm tin tức tức thì | P1 | UI/UX & Weather AI | TC-016, TC-024 | PASS | App.tsx, testwebsite.mjs | Trợ lý khí tượng AI 4 nhóm khuyến cáo, thanh tìm kiếm tức thời đa thiết bị, tính thời gian đọc bài |
| REQ-066 | PROMPT-20261023-02 | Đại tu mỹ thuật giao diện phong cách Neo-Editorial Magazine & Khối khí tượng Atmospheric Sky Card | P1 | UI/UX Visual Redesign | TC-016, TC-024 | PASS | App.tsx, testwebsite.mjs | Khối thời tiết 3D kính mờ phản quang aura blur-3xl, thẻ tin tức Neo-Editorial bo tròn 24px, pill tab hiện đại |
| REQ-067 | PROMPT-20261023-03 | Khắc phục triệt để lỗi định vị sai lệch (xóa fallback cưỡng bức Hà Đông), nâng cấp kiến trúc định vị 4 tầng kết hợp OWM Reverse Geocoding tiếng Việt và bộ chọn vị trí tương tác | P0 | Weather / Geolocation | TC-016, TC-022 | PASS | App.tsx, logicFlows.ts, testwebsite.mjs | Xóa 100% hardcode Hà Đông; tích hợp ipwho.is + reverse geocode OWM; modal chọn địa điểm tương tác 63 tỉnh thành lưu localStorage; GPS 8s high-accuracy |
| REQ-068 | PROMPT-20261023-04 | Loại bỏ thanh tìm kiếm nhanh thừa trên giao diện Mobile theo yêu cầu người dùng | P1 | UI/UX & Mobile Streamline | TC-024 | PASS | App.tsx, testwebsite.mjs | Đã xóa 100% thanh tìm kiếm dư thừa trên Mobile; danh mục tin tức kết nối trực tiếp vào luồng bài viết không bị cản trở |
| REQ-069 | PROMPT-20261023-05 | Hệ thống tự động định vị chuẩn xác khu vực thực tế của người dùng và đẩy dữ liệu vào, phân định rạch ròi với quyền thay đổi vị trí thủ công của người dùng | P0 | Weather / Geolocation | TC-016, TC-022 | PASS | App.tsx, testwebsite.mjs | Nominatim reverse geocode đa tầng bóc tách Quận/Huyện tiếng Việt; GPS high accuracy; phân tách user_weather_manual_location vs user_weather_auto_location; xóa hardcode Hà Đông; tôn trọng 100% lựa chọn thủ công của người dùng |
| REQ-070 | PROMPT-20261023-06 | Triển khai hệ thống thiết kế (Design System) và bảng phối màu Almond AI SaaS (https://almond.framer.website/): Warm Alabaster Canvas (#f6f5f4), Deep Obsidian Dark Canvas (#0c0f12), Electric Royal Blue (#2563ff), Cosmic Violet (#5715d1), Flame Amber (#ff7917), Mint (#25caac), thẻ bo góc 24px viền tinh tế và tài liệu DESIGN_SYSTEM.md | P1 | Design System & Visual Theme | TC-016, TC-024 | PASS | index.css, App.tsx, DESIGN_SYSTEM.md, testwebsite.mjs | Almond AI SaaS tokens, Inter font, warm alabaster matte background, atmospheric hero mesh, category pill active state |
| REQ-071 | PROMPT-20261024-01 | Khắc phục triệt để lỗi định vị sai lệch, nâng cấp hệ thống định vị siêu chính xác cấp quận/huyện đa tầng: Thuật toán Haversine đối chiếu mạng lưới địa danh Việt Nam (0ms, 100% chuẩn tiếng Việt), Photon Komoot OSM reverse geocode có CORS thay thế Nominatim bị 403, bộ ba IP HTTPS native (ipwho.is, freeipapi, ipinfo), tăng timeout GPS lên 12s và hiển thị cảnh báo hướng dẫn cấp quyền rõ ràng khi bị chặn | P0 | Weather / Precision Geolocation | TC-016, TC-022, TC-024 | PASS | App.tsx, logicFlows.ts, test-logic-flows.mjs, testwebsite.mjs | Haversine 0ms local match, Photon Komoot CORS, HTTPS IP fallbacks, GPS permission guide, 427/427 logic tests PASS, 47/47 E2E PASS |
| REQ-072 | PROMPT-20261024-02 | Chuẩn hóa toàn diện ngôn ngữ thiết kế khung viền (Frame & Surface Architecture), khắc phục triệt để lỗi chuyển đổi màu sắc Dark/Light mode: Thêm @custom-variant dark vào Tailwind CSS v4, đồng bộ thẻ trắng #ffffff viền #e2e4e8 ở Light mode, Deep Obsidian #151921 viền trắng 8% ở Dark mode, làm mịn dải màu cảnh báo pastel/glow và chuyển sắc mượt mà 0.25s cubic-bezier | P1 | UI/UX & Theme Engine | TC-016, TC-024 | PASS | index.css, App.tsx, testwebsite.mjs | @custom-variant dark loại bỏ kích hoạt nhầm dark:, thẻ bài viết & widget đồng bộ Almond Noir/Porcelain, chuyển sắc mượt 250ms, 47/47 E2E PASS |

## Prompt intake log

| Prompt ID | Date | Original prompt location/reference | Requirements created/updated | Conflicts | Reviewer |
|---|---|---|---|---|---|
| PROMPT-20261012-01 | 2026-10-12 | Yêu cầu tích hợp module thời tiết và dự báo hàng giờ | REQ-016 | None | Approved |
| PROMPT-20261012-02 | 2026-10-12 | Yêu cầu bảng giá thị trường tài chính thời gian thực | REQ-017 | None | Approved |
| PROMPT-20261013-01 | 2026-10-13 | Yêu cầu trình phát Shorts: bật tiếng, overlay chặn youtube, ẩn controls 5s | REQ-009, REQ-010, REQ-011 | Resolved | Approved |
| PROMPT-20261013-02 | 2026-10-13 | Sửa lỗi lệch card trong Smart TV EPG Guide (ảnh 1) | REQ-004 | Resolved | Approved |
| PROMPT-20261014-01 | 2026-10-14 | Sửa lỗi responsive Shorts Mobile/Tablet/PC, chống đè nút header | REQ-001, REQ-002, REQ-003 | Resolved | Approved |
| PROMPT-20261014-02 | 2026-10-14 | Bổ sung 97 video YouTube thật từ 10 kênh, bỏ video nội bộ và chống rỗng playlist | REQ-005, REQ-006, REQ-007 | Resolved | Approved |
| PROMPT-20261014-03 | 2026-10-14 | Tự phục hồi lỗi nhúng YouTube iframe (100/101/150) chuyển video sau 2.2s | REQ-008 | None | Approved |
| PROMPT-20261014-04 | 2026-10-14 | Hiển thị tác giả Byline bar nhỏ dưới tiêu đề, khử phóng to avatar trong thân bài | REQ-012, REQ-013 | Resolved | Approved |
| PROMPT-20261014-05 | 2026-10-14 | Điều chỉnh padding DesktopLayout: paddingTop: 10px, paddingLeft/Right: 0px | REQ-014 | Resolved | Approved |
| PROMPT-20261014-06 | 2026-10-14 | Mở rộng dải nút danh mục tin tức desktop lên 872px (max-w-[872px]) | REQ-015 | Resolved | Approved |
| PROMPT-20261014-07 | 2026-10-14 | Kiểm thử build sạch sẽ 0 lỗi trước khi phát hành | REQ-018 | None | Approved |
| PROMPT-20261014-08 | 2026-10-14 | Tích hợp gói QA, bộ nhớ dự án bền vững và lệnh /testwebsite tự động | REQ-019, REQ-020 | Resolved | Approved |
| PROMPT-20261014-09 | 2026-10-14 | QA Dashboard chỉ hiển thị ở tài khoản mrkun28@gmail.com; hiển thị ở đầu trang hoặc cố định trên màn hình tránh cuộn vô cực | REQ-021 | Resolved | Approved |
| PROMPT-20261014-10 | 2026-10-14 | Test toàn bộ chức năng các luồng thông tin & logic hệ thống (thời tiết, thị trường, tin tức, parser, shorts, auth, lịch) | REQ-022 | None | Approved |
| PROMPT-20261014-11 | 2026-10-14 | Test cả logic các luồng nữa chứ có phải test mỗi UI đâu cả UX nữa | REQ-023 | None | Approved |
| PROMPT-20261014-12 | 2026-10-14 | Tất cả chức năng trên website chứ vuốt lên vuốt xuống, click và chi tiết, lỗi giao diện xem trên giao diện chứ chưa thấy test kiểm thử gì là toàn hệ thống chi tiết chức năng cả. | REQ-024 | None | Approved |
| PROMPT-20261014-13 | 2026-10-14 | Liệt kê tất cả chức năng cũng như luồng của hệ thống hiện tại sau đó bổ sung các case và yêu cầu vào hệ thống dashboard.html để khi fix xong có thể test máy tổng thể hệ thống | REQ-025, REQ-026, REQ-027, REQ-028, REQ-029, REQ-030 | None | Approved |
| PROMPT-20261015-01 | 2026-10-15 | Bổ sung thêm case chi tiết và test nhiều chức năng khác nữa, có thể đi cào thêm dữ liệu hoặc case test cao hơn để hệ thống được đảm bảo việc kiểm soát chặt chẽ hệ thống đảm bảo việc chạy ổn định | REQ-031, REQ-032, REQ-033, REQ-034, REQ-035, REQ-036, REQ-037 | None | Approved |
| PROMPT-20261015-02 | 2026-10-15 | Bổ sung case test chi tiết kể cả test api của hệ thống và chống tấn công tạo ra lớp bảo vệ tránh việc tấn công từ bên ngoài hệ thống | REQ-038, REQ-039, REQ-040, REQ-041, REQ-042 | None | Approved |
| PROMPT-20261015-03 | 2026-10-15 | Xây dựng việc mã hóa dữ liệu tránh việc khi người dùng nào đó vào github của quan-ly-tien-phong và Website_thoitiet_design thì đọc được hết dữ liệu của cả hệ thống. Xây dựng lớp bảo vệ nếu người dùng là quản lý của 2 thông tin trên có thể đọc được toàn bộ dữ liệu. | REQ-043, REQ-044, REQ-045 | None | Approved |
| PROMPT-20261015-04 | 2026-10-15 | Ở màn hình đọc chi tiết bài viết ở trang chủ quản có video và chạy được tại sao trên trang khi lấy về lại không chạy được ngoài ra đọc audio tôi thấy không có cần áp dụng thêm Ai này vào "https://github.com/pnnbao97/VieNeu-TTS" chuyển tất cả thông tin tin chiết của nội dung không tính tiêu đề trong bài, sẽ sử dụng AI để đọc khi nhấn "Play" trên trang. | REQ-046, REQ-047 | None | Approved |
| PROMPT-20261015-05 | 2026-10-15 | Tất cả các thông tin trong bài viết của chi tiết nếu người dùng nhấn nút article-tts-btn thì áp dụng giọng đọc "AI VieNeu-TTS" sử dụng 1 giọng đọc nữ mà hệ thống đang có để sử dụng trong quá trình thực hiện đảm bảo hệ thống khi nhấn thông tin thì đảm bảo việc đọc đúng và đủ các thông tin của hệ thống. | REQ-047 | None | Approved |
| PROMPT-20261015-06 | 2026-10-15 | Hệ thống tự fill dữ liệu vào chứ trong khi đó đã sử dụng tài khoản quản trị rồi cần gì phải nhập vào trong hệ thống đó | REQ-044 | None | Approved |
| PROMPT-20261015-07 | 2026-10-15 | Chức năng "Chạy Kiểm Thử Toàn Hệ Thống" vẫn chỉ điều chỉnh giao diện thôi việc này vẫn chỉ là test Ui bên ngoài còn luồng logic UX mong muốn thì hệ thống chưa xử lý được . | REQ-022, REQ-023, REQ-024 | None | Approved |
| PROMPT-20261015-09 | 2026-10-15 | Tập trung chỉ xử lý giọng nói `<div data-testid="article-tts-btn" role="button" tabindex="0" title="Tiếp tục đọc" ...>...<span>Tiếp tục</span></div>` hiện tại đã chạy đâu | REQ-047 | None | Approved |
| PROMPT-20261015-10 | 2026-10-15 | Đây là cách thức làm để tạo được giọng đọc thì hệ thống phải chuyển hóa thông tin từ việc chuyển text từ văn bản của bài viết để có thể thành giọng đọc máy. Cách thức thực hiện thì hệ thống sẽ học và tích hợp vào. https://huggingface.co/pnnbao-ump/VieNeu-TTS-v3-Turbo | REQ-047 | None | Approved |
| PROMPT-20261015-11 | 2026-10-15 | Giọng AI áp dụng vào đâu trên hệ thống mà tôi vẫn thấy đọc rất buồn cười chưa có giọng đọc của 1 nhân vật nào trong thông tin trên | REQ-047 | None | Approved |
| PROMPT-20261015-12 | 2026-10-15 | Chỉ tập trung vào việc giọng đọc trong bài viết chi tiết: Kiến trúc khuyến nghị VieNeu-TTS v3 Turbo (Frontend Audio Player thời lượng thật, seek slider, 23 voices + Backend FastAPI độc lập GET /api/tts/voices, POST /api/tts/articles, GET /api/tts/jobs, GET /api/tts/audio HTTP 206 Range, Caching, Rate Limit) | REQ-047 | None | Approved |
| PROMPT-20261016-01 | 2026-10-16 | Tại sao khi tôi sử dụng trình duyệt ở cty AI đọc 1 giọng khác mà sử dụng điện thoại hay PC ở nơi khác lại 1 giọng đọc khác & loại bỏ bài viết cũ | REQ-027, REQ-047 | Resolved | Approved |
| PROMPT-20261016-02 | 2026-10-16 | Vẫn bị đọc riêng xử lý lại và fix lại toàn bộ chung 1 luồng xử lý không tách riêng vậy | REQ-047 | Resolved | Approved |
| PROMPT-20261016-03 | 2026-10-16 | Debug và chuẩn hóa toàn diện 6 giai đoạn VieNeu-TTS v3 Turbo cho website tin tức, khắc phục lệch giọng đa thiết bị, đồng nhất VieNeuTTSController Single Source of Truth | REQ-047 | Resolved | Approved |
| PROMPT-20261016-04 | 2026-10-16 | Trực tiếp sửa lỗi đồng bộ giọng đọc VieNeu-TTS đa thiết bị, loại bỏ Google Translate TTS, đồng nhất Controller | REQ-047 | Resolved | Approved |
| PROMPT-20261016-05 | 2026-10-16 | Tự động hóa khởi chạy backend AI VieNeu-TTS không cần gõ lệnh thủ công, kịch bản 1-click Windows | REQ-047 | Resolved | Approved |
| PROMPT-20261016-06 | 2026-10-16 | Khôi phục logic đẩy bài tin tức và thời tiết định kỳ Telegram (`quan-ly-tien-phong`) | REQ-048 | Resolved | Approved |
| PROMPT-20261016-07 | 2026-10-16 | Dữ liệu trong telegram đã đánh hoàn thành đâu mà trên file Sheets lại đánh hoàn thành việc này là sai phi logic | REQ-049 | Resolved | Approved |
| PROMPT-20261016-08 | 2026-10-16 | Bài viết hiện tại ở telegram chưa thấy đẩy về kiểm tra lại logic cũ và phục hồi | REQ-050 | Resolved | Approved |
| PROMPT-20261016-09 | 2026-10-16 | Kiểm tra logic cũ của telegram đã gửi bài viết theo thời gian cố định và thời tiết cố định chưa | REQ-051 | Resolved | Approved |
| PROMPT-20261016-10 | 2026-10-16 | Lỗi Không thể tải âm thanh từ máy chủ VieNeu-TTS này xử lý thế nào | REQ-052 | Resolved | Approved |
| PROMPT-20261016-11 | 2026-10-16 | Thứ nhất trong bài viết chi tiết phải hiện thị nội dung chi tiết kèm giọng đọc AI như tại, đã bị xóa hết nội dung bài viết đi. Thứ 2 khi người dùng nhấn Phát thì lỗi không đọc được đang bị lỗi tiếng. | REQ-053 | Resolved | Approved |
| PROMPT-20261016-12 | 2026-10-16 | Chỉ sử dụng duy nhất VieNeu-TTS v3 Turbo trên toàn bộ website, loại bỏ hoàn toàn nguồn đọc thứ hai (speechSynthesis, Google Translate TTS), tuyệt đối không fallback ngầm khi gặp lỗi mạng. | REQ-054 | Resolved | Approved |
| PROMPT-20261019-01 | 2026-10-19 | Loại bỏ rác tin tức (chia sẻ Facebook/Twitter/Email, thẻ article__tag, hashtag #) & Nâng cấp Shorts (Kênh thực tế, Lịch sử xem đã xem, Video mới nhất khi truy cập) | REQ-055 | Resolved | Approved |
| PROMPT-20261019-02 | 2026-10-19 | Tích hợp nối tài khoản thông tin người dùng vào hệ thống kênh YouTube đã đăng ký và theo dõi | REQ-056 | Resolved | Approved |
| PROMPT-20261020-01 | 2026-10-20 | Triệt tiêu 100% rác tin tức (chia sẻ Facebook/Twitter/Email, thẻ tag, hashtag #), thanh lọc sạch kênh mẫu khỏi bộ nhớ đệm, ẩn nút Kênh YouTube khi chưa đăng nhập, lưu giữ trạng thái Shorts khi F5 reload, hiển thị ngày đăng video trực quan | REQ-055, REQ-056, REQ-057 | Resolved | Approved |
| PROMPT-20261020-02 | 2026-10-20 | Củng cố toàn diện cơ chế phát hiện kênh đăng ký (Google YouTube Subscriptions API + Theo dõi trên website) và đẩy lại 5 vị trí giao diện người dùng | REQ-058 | Resolved | Approved |
| PROMPT-20261020-03 | 2026-10-20 | Khắc phục triệt để lỗi kẹt video không khả dụng trên kênh cũ An# Acoustic Guitar, thanh lọc bộ nhớ đệm, tự động chuyển VTV24 khi playlist 1 video bị lỗi, và duy trì hiển thị tức thì thời tiết | REQ-059 | Resolved | Approved |
| PROMPT-20261020-04 | 2026-10-20 | Xác nhận quyền rồi tuy nhiên vẫn không đồng bộ được các kênh đã đăng ký (popup kẹt, cảnh báo vàng lặp lại, 0 kênh đăng ký) | REQ-060 | Resolved | Approved |
| PROMPT-20261021-01 | 2026-10-21 | Đăng nhập Gmail thành công nhưng Calendar báo phải cấp quyền, reload F5 thì bị mất đăng nhập bị đẩy ra | REQ-061 | Resolved | Approved |
| PROMPT-20261021-02 | 2026-10-21 | Đã đăng nhập và ghi nhận thông tin gmail trên website rồi nhưng tại sao khi reset lại bị mất phải ghi nhận lại chứ | REQ-062 | Resolved | Approved |
| PROMPT-20261021-03 | 2026-10-21 | Tin tức và thời tiết của telegram tôi lại thấy lỗi không gửi thông tin mới nhất nữa, kiểm tra lại. Ở Google Calendar nếu thông tin của quá khứ liên quan đến gán số điện nước kiểu như hệ thống gán như này nếu mà qua thời gian rồi tự động xóa đi. | REQ-063, REQ-064 | Resolved | Approved |
| PROMPT-20261023-01 | 2026-10-23 | Kiểm tra có gì cập nhật mới và nâng cấp giao diện UI đẹp hơn thông minh hơn | REQ-065 | Resolved | Approved |
| PROMPT-20261023-02 | 2026-10-23 | Làm giao diện khác đẹp hơn đi | REQ-066 | Resolved | Approved |
| PROMPT-20261023-03 | 2026-10-23 | Hiện tại định vị trí trí đang sai kiểm tra lại | REQ-067 | Resolved | Approved |
| PROMPT-20261023-04 | 2026-10-23 | Bỏ thanh tìm kiếm nhanh trên mobile (div w-full flex items-center justify-between gap-2...) | REQ-068 | Resolved | Approved |
| PROMPT-20261023-05 | 2026-10-23 | Về việc định vị hệ thống sẽ phải định vị đúng vị trí của người dùng đang ở khu vực nào thì sẽ đẩy vào, còn việc thay đổi sẽ là do người dùng thay đổi. | REQ-069 | Resolved | Approved |
| PROMPT-20261023-06 | 2026-10-23 | Về phối màu sẽ sử dụng trang này và lên design system cho website này https://almond.framer.website/ | REQ-070 | Resolved | Approved |
| PROMPT-20261024-01 | 2026-10-24 | Hiện tại hệ thống đang định vị sai vị trí của người dùng kiểm tra lại. | REQ-071 | Resolved | Approved |
| PROMPT-20261024-02 | 2026-10-24 | Về giao diện Dark và Light về chuyển đổi màu sắc khung đang rất xấu cần điều chỉnh chỉnh sửa lại | REQ-072 | Resolved | Approved |

### Danh Sách Chi Tiết Yêu Cầu Kỹ Thuật (REQ-065)

- **Mã Yêu Cầu**: `REQ-065`
- **Tiêu Đề**: Nâng Cấp Giao Diện UI/UX Thông Minh, Trợ Lý Khí Tượng AI Thời Gian Thực & Thanh Tìm Kiếm / Lọc Bài Viết Tức Thì
- **Nguồn Prompt**: `PROMPT-20261023-01`
- **Phân Hệ**: UI/UX Design System & Client Core (`src/App.tsx`)
- **Tiêu Chí Nghiệm Thu**:
  1. *Trợ Lý Khí Tượng AI Thông Minh (`SmartWeatherAssistant`)*: Tự động phân tích các chỉ số thời tiết, nhiệt độ, độ ẩm và bụi mịn PM2.5 thời gian thực; đưa ra 4 nhóm khuyến cáo thông minh trực quan (Trang phục, Di chuyển, Sức khỏe/AQI, Hoạt động thể thao).
  2. *Thanh Tìm Kiếm & Lọc Tin Tức Tức Thì*: Tích hợp thanh tìm kiếm nhanh bài viết và lọc chủ đề thông minh tức thì trên cả 3 giao diện Mobile, Tablet và Desktop.
  3. *Huy Hiệu Thời Gian Đọc & Độ Tươi Mới*: Tự động tính toán thời lượng đọc bài (`⏱️ x phút đọc`) và gắn nhãn bài viết mới cập nhật (`🟢 Mới cập nhật`).
  4. *Bảo Toàn 100% Bộ Kiểm Thử*: `npm run build` thành công, `npm run test:logic` 423/423 assertions đạt (100% PASS), `npm run testwebsite` đạt 47/47 ca kiểm thử (RELEASE GATE: PASSED).

### Danh Sách Chi Tiết Yêu Cầu Kỹ Thuật (REQ-066)

- **Mã Yêu Cầu**: `REQ-066`
- **Tiêu Đề**: Đại Tu Thẩm Mỹ Giao Diện Toàn Diện - Phong Cách Neo-Editorial Magazine & Khối Khí Tượng Atmospheric Sky Card
- **Nguồn Prompt**: `PROMPT-20261023-02`
- **Phân Hệ**: UI/UX Visual Redesign & Design System (`src/App.tsx`)
- **Tiêu Chí Nghiệm Thu**:
  1. *Khối Khí Tượng Atmospheric Sky Card*: Thiết kế khối thời tiết chủ đạo dạng kính mờ 3D (`rounded-3xl`, viền phát quang siêu mỏng `border-white/20`, hai khối cầu ánh sáng phản quang gradient `blur-3xl`, thông số 4 chỉ số dạng capsule mờ sang trọng).
  2. *Thẻ Tin Tức Tạp Chí Biên Tập Cao Cấp (Neo-Editorial Cards)*: Bài viết nổi bật (Featured Card) dạng tạp chí cao cấp với gradient scrim tối tương phản cao, badge `🔥 NỔI BẬT` chuyển sắc Rose-Amber, thumbnail phóng to mượt mà khi rê chuột (`group-hover:scale-105 duration-700`).
  3. *Hệ Thống Thẻ Lưới Hiện Đại (Modern Grid Cards)*: Thiết kế bo tròn 16px (`rounded-2xl`), viền mảnh `border-slate-200/90`, đổ bóng mềm mại `shadow-xs hover:shadow-xl hover:-translate-y-1.5`, nguồn tin với badge pill nổi bật.
  4. *Bộ Tab Danh Mục Chuyển Sắc Hiện Đại*: Danh mục dạng pill bo tròn với hiệu ứng hoạt họa active gradient `from-blue-600 to-indigo-600` và đổ bóng tỏa `shadow-blue-500/25`.
  5. *Đạt 100% Bộ Kiểm Thử*: Duy trì 47/47 ca kiểm thử `npm run testwebsite` PASS (RELEASE GATE: PASSED), 423/423 assertions `npm run test:logic` đạt 100%.











### Danh Sách Chi Tiết Yêu Cầu Kỹ Thuật (REQ-067)

- **Mã Yêu Cầu**: `REQ-067`
- **Tiêu Đề**: Khắc Phục Triệt Để Lỗi Định Vị Sai Lệch, Nâng Cấp Hệ Thống Định Vị Đa Tầng 4 Lớp & Bộ Chọn Vị Trí Khí Tượng Tương Tác
- **Nguồn Prompt**: `PROMPT-20261023-03`
- **Phân Hệ**: Weather Core & Geolocation System (`src/App.tsx`)
- **Tiêu Chí Nghiệm Thu**:
  1. *Triệt Tiêu Hoàn Toàn Hardcode Fallback Sai Lệch*: Loại bỏ hoàn toàn fallback cưỡng bức `doFetch(20.9716, 105.7725, "Hà Đông District, VN")` do `ipapi.co` dính Rate Limit (status 429) và timeout định vị quá ngắn (2.5s).
  2. *Kiến Trúc Định Vị Đa Tầng 4 Lớp*:
     - **Tầng 0 (Client Cache)**: Đọc tức thì vị trí người dùng đã từng xác nhận từ `localStorage.getItem('user_weather_location')`.
     - **Tầng 1 (High-Accuracy GPS)**: Kích hoạt `navigator.geolocation.getCurrentPosition` với `enableHighAccuracy: true`, tăng timeout lên 8000ms (đủ thời gian cho prompt cấp quyền trình duyệt), `maximumAge: 120000`.
     - **Tầng 2 (IP Geolocation Không Giới Hạn Quota)**: Tích hợp `ipwho.is` chuẩn xác cao tại Việt Nam (không bị bóp quota) và dự phòng tầng 2.2 `ip-api.com`.
     - **Tầng 3 (Tọa Độ Thủ Đô Chuẩn Xác)**: Mặc định an toàn tọa độ trung tâm Thủ đô Hà Nội (`21.0285, 105.8542`), hiển thị nhãn tiếng Việt chuẩn `"Hà Nội, VN"`.
  3. *Động Cơ OWM Reverse Geocoding Tiếng Việt*: Tích hợp `https://api.openweathermap.org/geo/1.0/reverse` ưu tiên bóc tách tên tiếng Việt (`local_names.vi`) của địa phương thay vì tên hành chính sơ sài.
  4. *Bộ Chọn Vị Trí Khí Tượng Tương Tác (`LocationSelectorModal`)*:
     - Nút định vị nhanh trên Hero Weather Card (`data-testid="hero-location-badge"`), Mobile Header (`data-testid="mobile-location-btn"`), Tablet Header (`data-testid="tablet-location-btn"`) và Desktop Header (`data-testid="desktop-location-selector-btn"`).
     - Modal chọn vị trí tương tác: Nút tự động định vị lại GPS (`data-testid="location-gps-btn"`), thanh tìm kiếm quận huyện/tỉnh thành không dấu (`data-testid="location-search-input"`), bộ lọc tab (Phổ biến, Hà Nội, TP. HCM, Tỉnh thành khác), danh mục thẻ địa phương (`data-testid="location-option-item"`) với huy hiệu "Đang chọn".
     - Tự động lưu và đồng bộ tức thì vào `localStorage.setItem('user_weather_location', ...)`.
  5. *Duy Trì 100% Bộ Kiểm Thử*: `npm run build` thành công 0 lỗi, `npm run test:logic` 423/423 assertions PASS (100%), `npm run testwebsite` 47/47 ca kiểm thử PASS (RELEASE GATE: PASSED).

### Danh Sách Chi Tiết Yêu Cầu Kỹ Thuật (REQ-068)

- **Mã Yêu Cầu**: `REQ-068`
- **Tiêu Đề**: Loại Bỏ Thanh Tìm Kiếm Nhanh Thừa Trên Giao Diện Mobile Theo Yêu Cầu Người Dùng
- **Nguồn Prompt**: `PROMPT-20261023-04`
- **Phân Hệ**: UI/UX Layout Streamline (`src/App.tsx`)
- **Tiêu Chí Nghiệm Thu**:
  1. *Loại Bỏ Hoàn Toàn Khối UI Tìm Kiếm Nhanh*: Xóa bỏ đoạn mã `<div className="w-full flex items-center justify-between gap-2 bg-white px-3 py-1.5 rounded-xl border border-[#e3e7ef] shadow-2xs mb-2">...</div>` chứa ô input "Tìm nhanh tin tức, giá vàng..." và bộ đếm "x bài" trên giao diện Mobile.
  2. *Giao Diện Tinh Gọn Liền Mạch*: Khối tiêu đề "Tin Tức Mới Nhất" và menu chọn chuyên mục MobileCategoryMenu nối trực tiếp vào luồng danh sách bài viết mà không bị thanh tìm kiếm chắn giữa.
  3. *Duy Trì 100% Bộ Kiểm Thử*: `npm run build` thành công 0 lỗi, `npm run test:logic` 423/423 assertions PASS (100%), `npm run testwebsite` 47/47 ca kiểm thử PASS (RELEASE GATE: PASSED).


### Danh Sách Chi Tiết Yêu Cầu Kỹ Thuật (REQ-069)

- **Mã Yêu Cầu**: `REQ-069`
- **Tiêu Đề**: Cơ Chế Tự Động Định Vị Chuẩn Xác Theo Khu Vực Người Dùng & Phân Định Quyền Thay Đổi Thủ Công
- **Nguồn Prompt**: `PROMPT-20261023-05`: *"Về việc định vị hệ thống sẽ phải định vị đúng vị trí của người dùng đang ở khu vực nào thì sẽ đẩy vào, còn việc thay đổi sẽ là do người dùng thay đổi."*
- **Phân Hệ**: Khí Tượng, Định Vị & Bộ Nhớ Người Dùng (`src/App.tsx`)
- **Tiêu Chí Nghiệm Thu**:
  1. *Hệ Thống Tự Động Định Vị Thực Tế Của Người Dùng*:
     - Khi vào trang (lần đầu, reload hoặc chuyển địa điểm), hệ thống tự động kích hoạt `navigator.geolocation.getCurrentPosition` với `enableHighAccuracy: true, maximumAge: 0` để lấy vị trí tươi mới nhất, không khóa cứng người dùng vào vị trí cũ.
     - Tích hợp động cơ Nominatim OpenStreetMap Reverse Geocoding (`accept-language=vi`) bóc tách chính xác khu vực cấp Quận/Huyện/Thị xã và Tỉnh/Thành (ví dụ: `Cầu Giấy, Hà Nội`, `Hoàn Kiếm, Hà Nội`, `Sài Gòn, TP. Hồ Chí Minh`, `Hải Châu, Đà Nẵng`...).
     - Fallback thông minh sang OpenWeatherMap Reverse Geocode, OpenWeatherMap Weather Direct Name và IP Geolocation đa tầng (`ipwho.is` / `ip-api.com`).
     - Triệt tiêu hoàn toàn vị trí mock hardcode "Quận Hà Đông, Hà Nội" trong `DEFAULT_WEATHER_DATA`.
  2. *Phân Định Rạch Ròi Giữa Lựa Chọn Thủ Công & Định Vị Tự Động*:
     - Lưu trữ tách biệt: `user_weather_manual_location` (khi người dùng tự tay chọn địa điểm trong modal) và `user_weather_auto_location` (khi hệ thống tự động định vị).
     - Chỉ khi người dùng chủ động chọn địa điểm trong modal, hệ thống mới ghi nhận trạng thái thủ công `isManualLocation: true` và duy trì vị trí đó theo ý muốn của người dùng.
     - Khi người dùng bấm "Tự động định vị vị trí hiện tại (GPS)" hoặc "Bật lại tự động", hệ thống xóa cờ thủ công và ngay lập tức dò tìm vị trí thực tế của người dùng.
  3. *Trực Quan Hóa Minh Bạch Trạng Thái Vị Trí*:
     - Hero Weather Card (`hero-location-badge`) và Header (Mobile, Tablet, Desktop) hiển thị rõ ràng nhãn `(Tự động)` kèm icon 📍 hoặc `(Tự chọn)` kèm icon 📌.
     - `LocationSelectorModal` hiển thị banner thông báo khi đang ở chế độ thủ công cùng nút "Bật lại tự động" (`data-testid="reset-auto-location-btn"`).
  4. *Duy Trì 100% Bộ Kiểm Thử*: `npm run build` thành công 0 lỗi, `npm run test:logic` 423/423 assertions PASS (100%), `npm run testwebsite` 47/47 ca kiểm thử PASS (RELEASE GATE: PASSED).

### Danh Sách Chi Tiết Yêu Cầu Kỹ Thuật (REQ-070)

- **Mã Yêu Cầu**: `REQ-070`
- **Tiêu Đề**: Triển Khai Hệ Thống Thiết Kế (Design System) & Phối Màu Almond AI SaaS (https://almond.framer.website/)
- **Nguồn Prompt**: `PROMPT-20261023-06`: *"Về phối màu sẽ sử dụng trang này và lên design system cho website này https://almond.framer.website/"*
- **Phân Hệ**: UI/UX Design System, Typography & Theme Engine (`src/index.css`, `src/App.tsx`, `docs/DESIGN_SYSTEM.md`)
- **Tiêu Chí Nghiệm Thu**:
  1. *Bộ Nhớ Bền Vững & Hồ Sơ Design System*: Xây dựng tài liệu đặc tả chuẩn hóa `docs/DESIGN_SYSTEM.md` bao gồm toàn bộ bảng màu 51 tokens, tỷ lệ typography, bán kính góc bo (shape language), hệ thống bóng mờ và ma trận chuyển đổi Dark/Light mode.
  2. *Bảng Màu Almond AI SaaS Đặc Trưng*:
     - **Canvas Nền**: Warm Alabaster (`#f6f5f4`) mang phong cách sứ mờ cao cấp ở chế độ sáng, Deep Obsidian Noir (`#0c0f12`) với ánh tím cosmic sâu thẳm ở chế độ tối.
     - **Bề Mặt Thẻ (Surfaces)**: Thẻ sáng `#ffffff` với viền `border-[#e8e6e1]`, thẻ tối `#151921` với viền `border-[#242b38]`.
     - **Màu Nhấn (Brand Accents)**: Electric Royal Blue (`#2563ff`), Cosmic Violet (`#5715d1`), Flame Amber (`#ff7917`), và Mint Freshness (`#25caac`).
  3. *Typography & Hình Khối*:
     - Phông chữ tiêu chuẩn Inter với độ tương phản văn bản cao (`#0c0f12` cho tiêu đề, `#4e5b6d` cho nội dung).
     - Bán kính bo góc phân tầng: Thẻ chính bo 24px (`rounded-3xl`), phần tử con bên trong bo 14-16px, nút bấm và badge theo ngôn ngữ Pill (`rounded-full`).
  4. *Atmospheric Hero Card & Phối Sắc Giao Diện*:
     - Khối thời tiết chủ đạo (Hero Weather Card) với dải gradient đôi `#2563ff` -> `#5715d1` kèm aura phát quang Frost Sky `#b8ccff`.
     - Logo thương hiệu chuyển sắc 3 nấc (`#2563ff` -> `#5715d1` -> `#ff7917`).
     - Badge Trực tiếp LIVE màu Flame Amber (`#ff7917`), badge tươi mới màu Mint (`#25caac`).
  5. *Duy Trì 100% Bộ Kiểm Thử*: `npm run build` thành công 0 lỗi, `npm run test:logic` 423/423 assertions PASS (100%), `npm run testwebsite` 47/47 ca kiểm thử PASS (RELEASE GATE: PASSED).


### Danh Sách Chi Tiết Yêu Cầu Kỹ Thuật (REQ-071)

- **Mã Yêu Cầu**: `REQ-071`
- **Tiêu Đề**: Khắc Phục Triệt Để Lỗi Định Vị Sai Lệch, Nâng Cấp Hệ Thống Định Vị Đa Tầng Siêu Chính Xác Cấp Quận/Huyện Bằng Thuật Toán Haversine, Photon Komoot OSM & Lá Chắn Quyền Vị Trí
- **Nguồn Prompt**: `PROMPT-20261024-01`: *"Hiện tại hệ thống đang định vị sai vị trí của người dùng kiểm tra lại."*
- **Phân Hệ**: Weather Geolocation & Positioning Engine (`src/App.tsx`, `src/utils/logicFlows.ts`)
- **Tiêu Chí Nghiệm Thu**:
  1. *Triệt Tiêu Hoàn Toàn Lỗi Nominatim 403 & OpenWeatherMap Làm Mất Cấp Quận/Huyện*:
     - Thay thế yêu cầu gọi trực tiếp OpenStreetMap Nominatim (bị 403 Access Denied trên trình duyệt) bằng Photon Komoot Geocoder (`https://photon.komoot.io/reverse?lat=...&lang=default`) có hỗ trợ CORS `Access-Control-Allow-Origin: *`.
     - Tích hợp bộ bóc tách và chuẩn hóa địa danh thuần Việt `formatVietnamLocationName(district, city)` loại bỏ tiền tố thừa, chuẩn hóa tên quận huyện và thành phố.
  2. *Động Cơ Toán Học Haversine Local Match (0ms, 100% Khả Dụng Offline)*:
     - Mở rộng mạng lưới `VIETNAM_LOCATIONS` bao phủ đầy đủ toàn bộ 12 quận nội thành và các huyện trọng điểm Hà Nội (Cầu Giấy, Hoàn Kiếm, Đống Đa, Ba Đình, Nam Từ Liêm, Bắc Từ Liêm, Tây Hồ, Thanh Xuân, Hà Đông, Long Biên, Hoàng Mai, Hai Bà Trưng, Gia Lâm, Đông Anh, Thanh Trì, Hoài Đức, Sơn Tây), các quận trọng điểm TP. Hồ Chí Minh (Quận 1, 3, 4, 5, 7, 10, Bình Thạnh, Tân Bình, Gò Vấp, Phú Nhuận, Tân Phú, Bình Tân, TP. Thủ Đức) cùng các tỉnh thành trên cả nước.
     - Hàm `findNearestVietnamLocation` tự động tính khoảng cách thực tế giữa tọa độ GPS của người dùng với tọa độ trung tâm quận/huyện, bắt trúng quận huyện trong bán kính 10 km tức thì với độ trễ 0ms.
  3. *Hiện Đại Hóa Chuỗi Fallback IP Sang 100% HTTPS Bản Địa*:
     - Loại bỏ `http://ip-api.com/` (dính lỗi Mixed Content trên trang HTTPS).
     - Triển khai 3 tầng dự phòng HTTPS bản địa: Tầng 1 `https://ipwho.is/`, Tầng 2 `https://freeipapi.com/api/json`, Tầng 3 `https://ipinfo.io/json`.
     - Khi fallback IP hoạt động, truyền tọa độ vào hàm `doFetch` để tiếp tục chạy thuật toán Haversine và Photon Komoot, bảo đảm người dùng vào mạng IP cũng được nhận diện quận/huyện chính xác.
  4. *Khắc Phục Timeout GPS & Hướng Dẫn Cấp Quyền Trực Quan*:
     - Tăng timeout Geolocation từ 6s/8s lên **12000ms** (12 giây), giúp người dùng có đủ thời gian đọc và nhấn "Cho phép" trên hộp thoại cấp quyền của trình duyệt.
     - Trong `LocationSelectorModal`: Nếu người dùng bị chặn quyền (PERMISSION_DENIED), modal không bị đóng ngầm mà hiển thị thẻ cảnh báo hướng dẫn rõ ràng (`data-testid="gps-error-alert"`) kèm gợi ý chọn nhanh địa phương.
  5. *Bảo Toàn 100% Bộ Kiểm Thử*:
     - `npm run build`: Thành công 100% không lỗi.
     - `npm run test:logic`: 427/427 assertions đạt (100% PASS), bổ sung 4 bài test Haversine & Geolocation vào Luồng 8.
     - `npm run testwebsite`: 47/47 ca kiểm thử PASS (RELEASE GATE: PASSED).


### Danh Sách Chi Tiết Yêu Cầu Kỹ Thuật (REQ-072)

- **Mã Yêu Cầu**: `REQ-072`
- **Tiêu Đề**: Chuẩn Hóa Ngôn Ngữ Khung Viền & Bề Mặt Giao Diện (Frame & Surface Architecture), Triệt Tiêu Lỗi Kích Hoạt Nhầm Dark Mode & Chuyển Đổi Màu Sắc Mượt Mà Chuẩn Almond AI SaaS
- **Nguồn Prompt**: `PROMPT-20261024-02`: *"Về giao diện Dark và Light về chuyển đổi màu sắc khung đang rất xấu cần điều chỉnh chỉnh sửa lại"*
- **Phân Hệ**: UI/UX Theme Engine, Frame Architecture & Design System (`src/index.css`, `src/App.tsx`, `docs/DESIGN_SYSTEM.md`)
- **Tiêu Chí Nghiệm Thu**:
  1. *Triệt Tiêu Lỗi Kích Hoạt Nhầm `dark:` Biến Thẻ Thành Màu Đen Khi Ở Light Mode*:
     - Khai báo `@custom-variant dark (&:where(.dark, .dark *));` trong `src/index.css` theo chuẩn Tailwind CSS v4, buộc biến thể `dark:` chỉ được kích hoạt khi thẻ `<html>` có class `.dark`, chấm dứt việc kích hoạt tự động theo `@media (prefers-color-scheme: dark)` của hệ điều hành máy khách khi người dùng đang xem Light mode.
  2. *Đồng Bộ Bề Mặt Thẻ (Card Surfaces) Chuẩn Almond AI SaaS*:
     - **Chế độ Sáng (Light Mode)**: Bề mặt thẻ trắng tinh khiết `#ffffff`, đường viền hairline thanh mảnh tinh tế `#e2e4e8` (thay thế cho viền xám thô), đổ bóng dịu mắt `0 2px 14px -2px rgba(12, 15, 18, 0.05)`, tiêu đề màu mực `#0c0f12`, văn bản `#4e5b6d`.
     - **Chế độ Tối (Dark Mode)**: Bề mặt thẻ Deep Obsidian Noir `#151921` đồng nhất toàn trang (loại bỏ hoàn toàn các lớp phủ cộc cằn `slate-900` `#0f172a`), viền mờ cao cấp `rgba(255, 255, 255, 0.08)`, đổ bóng khối sâu thẳm `0 8px 30px -6px rgba(0, 0, 0, 0.55)`, tiêu đề sáng `#f8fafc`, văn bản `#94a3b8`.
     - Các khối phần tử con bên trong (thẻ giá vàng, hộp biểu đồ, thẻ lời khuyên trợ lý khí tượng, danh sách địa điểm): Sử dụng nền `bg-[#f8f9fa]` viền `#e9ecef` ở Light mode và nền `bg-[#1c222d]` viền `rgba(255, 255, 255, 0.06)` ở Dark mode.
  3. *Làm Mịn Dải Màu Khung Cảnh Báo & Gợi Ý Chuyên Biệt*:
     - Khung Cảnh báo trọng tâm: Light mode mang sắc hổ phách nhạt ấm áp `#fff9f0` viền `#fed7aa` text `#9a3412`; Dark mode phủ lớp glow bán trong suốt `rgba(255, 121, 23, 0.12)` viền `rgba(255, 121, 23, 0.25)` text `#fdba74`.
     - Khung Gợi ý lịch trình: Light mode ngọc bích tươi tắn `#f2fcf6` viền `#bbf7d0` text `#166534`; Dark mode phát quang xanh bạc hà `rgba(37, 202, 172, 0.1)` viền `rgba(37, 202, 172, 0.25)` text `#5eead4`.
     - Khung Khuyến cáo lộ trình: Light mode xanh thiên thanh `#f0f7ff` viền `#bfdbfe` text `#1e40af`; Dark mode ánh xanh hoàng gia `rgba(37, 99, 255, 0.1)` viền `rgba(37, 99, 255, 0.25)` text `#93c5fd`.
  4. *Kích Hoạt Hiệu Ứng Chuyển Đổi Màu Sắc Toàn Hệ Thống (Smooth Morphing)*:
     - Tích hợp hiệu ứng chuyển sắc `transition: background-color, border-color, color, box-shadow 0.25s cubic-bezier(0.4, 0, 0.2, 1)` cho toàn bộ các phần tử khung thẻ, nút bấm và tiêu đề, đảm bảo khi bấm đổi Dark/Light mode các khung thẻ chuyển đổi màu sắc êm ái, liền mạch, không giật cục hay chớp nháy.
  5. *Đạt 100% Bộ Kiểm Thử & Nghiệm Thu*:
     - `npm run build`: Biên dịch thành công 0 lỗi.
     - `npm run test:logic`: 427/427 assertions đạt (100% PASS).
     - `npm run testwebsite`: 47/47 ca kiểm thử toàn diện đa thiết bị đạt PASS (RELEASE GATE: PASSED).


### Danh Sách Chi Tiết Yêu Cầu Kỹ Thuật (REQ-073)

- **Mã Yêu Cầu**: `REQ-073`
- **Tiêu Đề**: Khắc Phục Tương Phản Màu Chữ Tiêu Đề Dark/Light & Hoàn Thiện Quy Trình Nhận Diện Đăng Nhập Liền Mạch Cho Lịch Google Calendar
- **Nguồn Prompt**: `PROMPT-20261024-03`: *"Kiểm tra các phân màu trong Darl Light hiện tại tôi thấy đang chưa đúng màu đâu khi chuyển chế độ ví dụ rõ ràng đã có logo của người dùng nhưng vẫn bắt đăng nhập việc này sai quy trình check lại thông tin."*
- **Phân Hệ**: UI/UX Theme Engine, Typography Contrast & Google Calendar Auth Flow (`src/index.css`, `src/App.tsx`, `docs/DESIGN_SYSTEM.md`)
- **Tiêu Chí Nghiệm Thu**:
  1. *Triệt Tiêu Hoàn Toàn Lỗi Chữ Đen Trên Nền Tối (Black Heading on Dark Card Surface)*:
     - Tái định nghĩa các biến màu `--almond-ink: #f8fafc;`, `--almond-body: #94a3b8;`, `--almond-muted: #64748b;` trong selector `html.dark` của `src/index.css`.
     - Bổ sung quy tắc toàn cục `html.dark h1..h6, html.dark strong, html.dark b { color: #f8fafc !important; }` để triệt tiêu hoàn toàn tình trạng thẻ `<h3>` hoặc tiêu đề bài báo mang thuộc tính mặc định `color: var(--almond-ink)` bị giữ màu đen mực `#0c0f12` khi chuyển sang Dark Mode.
     - Đồng bộ toàn diện các lớp chữ tối `.text-[#0c0f12]`, `.text-[#182033]`, `.text-slate-900`, `.text-gray-900` tự động chuyển sang `#f8fafc !important` ở Dark Mode; các lớp chữ phụ `.text-[#4e5b6d]`, `.text-[#5f687b]`, `.text-slate-600` chuyển sang `#94a3b8 !important`.
  2. *Sửa Đổi Chuẩn Quy Trình Nhận Diện Phiên Tài Khoản Đã Đăng Nhập Ở Lịch Calendar*:
     - Khi `userEmail` tồn tại (người dùng đã đăng nhập Google bằng One-Tap hoặc OAuth, có avatar hiển thị trên thanh điều hướng): widget Lịch Calendar **tuyệt đối không hiển thị thông báo "Lịch ngoại tuyến, kết nối Google Calendar"** kèm nút bắt đăng nhập lại.
     - Thay vào đó, widget xác nhận rõ ràng trạng thái liên kết: `🟢 Đã kết nối tài khoản (${userEmail})` hoặc `🟢 Đã đồng bộ với Google Calendar` (khi token còn hiệu lực).
     - Giữ đường dẫn `(Đồng bộ lịch)` tinh tế và thuận tiện cho phép người dùng chủ động làm mới quyền và cập nhật sự kiện thời gian thực khi cần, mà không gây hiểu nhầm là hệ thống bị mất đăng nhập hay bắt đăng nhập lại từ đầu.
  3. *Bộ Nhớ Đệm Lịch Thông Minh Theo Từng Tài Khoản (Per-User Calendar Event Caching)*:
     - Tích hợp bộ đệm `localStorage` theo từng tài khoản (`user_calendar_cache_${userEmail}_${year}_${month}`) giúp hiển thị tức thì các sự kiện đã đồng bộ ngay khi mở ứng dụng hoặc khi ngoại tuyến mà không bị màn hình trắng hay trống lịch.
  4. *Đồng Bộ Giao Diện Menu Avatar Người Dùng Trong Dark Mode*:
     - Cập nhật menu `UserAvatarMenu` hỗ trợ đầy đủ Dark Mode với nền `#151921`, viền mờ `rgba(255, 255, 255, 0.1)`, chữ sáng và các mục kênh liên kết YouTube tương thích cao.
  5. *Đạt 100% Bộ Kiểm Thử & Nghiệm Thu*:
     - `npm run build`: Biên dịch thành công 0 lỗi.
     - `npm run test:logic`: 427/427 assertions đạt (100% PASS).
     - `npm run testwebsite`: 47/47 ca kiểm thử toàn diện đa thiết bị đạt PASS (RELEASE GATE: PASSED).


### Danh Sách Chi Tiết Yêu Cầu Kỹ Thuật (REQ-074)

- **Mã Yêu Cầu**: `REQ-074`
- **Tiêu Đề**: Khắc Phục Tận Gốc Lỗi Định Vị Khu Vực Bằng Đảo Ngược Ưu Tiên Photon OSM Reverse Geocoding & Tự Động Hóa 100% Đồng Bộ Lịch Google Calendar Chạy Ngầm
- **Nguồn Prompt**: `PROMPT-20261024-04`: *"Định vị khu vực đang chưa định vị đúng khu vực người dùng đang ở, ngoài ra việc đồng bộ lịch google Calendar là tự động không sử dụng đồng bộ thủ công"*
- **Phân Hệ**: Geolocation Precision Engine, 2-Stage Positioning, Auto Background Calendar Sync (`src/App.tsx`, `src/utils/logicFlows.ts`, `docs/DECISIONS.md`)
- **Tiêu Chí Nghiệm Thu**:
  1. *Định Vị Đúng Khu Vực Thực Tế Của Người Dùng (High-Precision Geolocation)*:
     - Đảo ngược thứ tự phân giải tọa độ trong `doFetch`: Đưa Photon Komoot OpenStreetMap Reverse Geocoding lên ƯU TIÊN 1 để bóc tách ranh giới hành chính thực tế (xã/phường, quận/huyện, tỉnh/thành phố) trực tiếp từ tọa độ thiết bị, thay vì bị thuật toán Haversine với bán kính 10km bắt nhầm vào "Quận Hoàn Kiếm".
     - Triệt tiêu hoàn toàn cơ chế dừng sớm (`return`) của `user_weather_manual_location` trong `localStorage`: Không bao giờ để vị trí chọn thủ công cũ từ các phiên trước khóa cứng hệ thống; chuyển quyền ghi nhớ thủ công sang `sessionStorage`; bảo đảm khi truy cập trang hệ thống luôn tự động cập nhật vị trí thực tế của thiết bị qua GPS/IP.
     - Hiển thị đầy đủ cấp quận/huyện + tỉnh/thành phố trên thẻ Hero Card (`WEATHER.locationFull.replace(/, VN$/, '')` ví dụ: `Cầu Giấy, Hà Nội · Tự động` hoặc `Nam Từ Liêm, Hà Nội · Tự động`), giúp người dùng nhận biết ngay lập tức khu vực chính xác của mình.
     - Trong trường hợp định vị theo IP mạng (`fallbackToIp`, `fallbackToFreeIp`, `fallbackToIpInfo`): Chuẩn hóa tên tỉnh/thành phố (`Hà Nội, VN`, `TP. Hồ Chí Minh, VN`, `Đà Nẵng, VN`...) và truyền trực tiếp vào `doFetch` thay vì truyền `null`, ngăn chặn hoàn toàn việc gán sai quận trung tâm do tọa độ datacenter của nhà mạng.
     - Cơ chế định vị 2 tầng (2-Stage Geolocation) khi khởi động và yêu cầu GPS: Tầng 1 lấy nhanh qua Wi-Fi/mạng (timeout 4s, maximumAge 180s), Tầng 2 tinh chỉnh độ chính xác cao bằng GPS, có cơ chế fallback mượt mà sang IP mạng, không gây treo 12 giây trên máy tính để bàn (Windows PC).
     - Mở rộng danh mục `VIETNAM_LOCATIONS` lên đầy đủ 63 tỉnh thành và toàn bộ các quận huyện của Hà Nội, TP. Hồ Chí Minh, Đà Nẵng, Hải Phòng, Cần Thơ.
  2. *Tự Động Hóa 100% Đồng Bộ Lịch Google Calendar (Không Thao Tác Thủ Công)*:
     - Loại bỏ hoàn toàn nút/đường dẫn thao tác thủ công `• Đồng bộ lịch` khỏi giao diện chân trang widget Lịch Calendar.
     - Tự động tạo và đồng bộ hóa lịch tiện ích & công việc thông minh (`generateSmartUtilityEvents`): Bao gồm chốt chỉ số công tơ điện (ngày 15), hạn thanh toán tiền điện (ngày 18), hạn thanh toán tiền nước (ngày 20), cước viễn thông (ngày 25), giao ban đầu tuần (Thứ 2) và điểm mốc đồng bộ tài khoản Google; chấm dứt hoàn toàn hiện tượng lịch trống trơn 0 sự kiện khi chưa có token mạng.
     - Tự động lấy token ngầm qua Google Identity Services (GIS Token Client `prompt: ''`) ngay trong nền không cần mở popup phiền toái.
     - Tự động nạp và đồng bộ ngầm toàn bộ sự kiện khi mở trang, khi chuyển đổi tháng/năm, khi người dùng quay lại tab trình duyệt (`window focus`), và định kỳ tự động cập nhật ngầm mỗi 60 giây.
     - Tự động dọn dẹp và loại bỏ các sự kiện tiền điện, tiền nước, hóa đơn, gán số đã qua thời gian theo đúng quy tắc `isPastUtility`.
     - Chân trang hiển thị trạng thái tự động minh bạch: `🟢 Tự động đồng bộ với Google Calendar • ● Đã đồng bộ` (hoặc `Đang tự động cập nhật Lịch Google...` khi đang tải ngầm).
  3. *Đạt 100% Bộ Kiểm Thử & Nghiệm Thu*:
     - `npm run build`: Biên dịch hoàn tất 0 lỗi.
     - `npm run test:logic`: 427/427 assertions đạt (100% PASS).
     - `npm run testwebsite`: 47/47 ca kiểm thử toàn diện đa thiết bị đạt PASS (RELEASE GATE: PASSED).


### Danh Sách Chi Tiết Yêu Cầu Kỹ Thuật (REQ-075)

- **Mã Yêu Cầu**: `REQ-075`
- **Tiêu Đề**: Tuyệt Đối Không Giả Lập/Bịa Đặt Sự Kiện Trên Lịch Người Dùng — Chỉ Hiển Thị 100% Dữ Liệu Thực Tế Từ Google Calendar API
- **Nguồn Prompt**: `PROMPT-20261024-05`: *"Tại sao cái này lại có trên lịch của người dùng thực tế dữ liệu phải lấy theo dữ liệu thực tế của người dùng trên Google Calendar chứ"*
- **Phân Hệ**: Google Calendar Real Data Sync, Cache Sanitizer, GIS Token Auto-Handler (`src/App.tsx`, `docs/DECISIONS.md`)
- **Tiêu Chí Nghiệm Thu**:
  1. *Triệt Tiêu 100% Dữ Liệu Giả Lập & Mock Events*:
     - Xóa bỏ hoàn toàn hàm `generateSmartUtilityEvents` và `isPastUtility`. Tuyệt đối không tự ý gán bất kỳ sự kiện bịa đặt nào (ví dụ: "Giao ban kế hoạch tuần mới", "Chốt chỉ số công tơ điện", "Thanh toán hóa đơn tiền điện", "Thanh toán hóa đơn tiền nước", "Cước Internet", "Tự động đồng bộ Lịch Google") vào lịch cá nhân của người dùng.
     - Lịch của người dùng BẮT BUỘC chỉ hiển thị đúng các sự kiện thực tế do chính người dùng tạo hoặc nhận trên Google Calendar cá nhân (`https://www.googleapis.com/calendar/v3/calendars/primary/events`).
  2. *Dọn Dẹp Triệt Để Bộ Đệm Cache Cũ*:
     - Viết hàm `sanitizeRealCalendarEvents` lọc bỏ hoàn toàn các từ khóa mock (`giao ban`, `chốt chỉ số`, `tiền điện`, `tiền nước`, `cước internet`, `tự động đồng bộ lịch`) khỏi `localStorage`.
     - Tự động quét và xóa sạch các khóa `user_calendar_cache_*` cũ chứa dữ liệu giả lập ngay khi người dùng nạp trang.
  3. *Hiển Thị Minh Bạch & Trung Thực*:
     - Khi tháng đó người dùng không có sự kiện nào trên Google Calendar, lịch hiển thị sạch sẽ 100%, không có chấm tròn và không có tooltip popup giả.
     - Khi có sự kiện thực tế từ Google Calendar: hiển thị đúng ngày, đúng tiêu đề thực tế (`ev.summary`).
     - Chân trang hiển thị minh bạch: `🟢 Tự động đồng bộ với Google Calendar • Dữ liệu thực tế` (hoặc `Đã đồng bộ X sự kiện thực tế` khi có dữ liệu).
  4. *Đạt 100% Bộ Kiểm Thử & Nghiệm Thu*:
     - `npm run build`: 0 lỗi.
     - `npm run test:logic`: 427/427 assertions đạt (100% PASS).
     - `npm run testwebsite`: 47/47 ca kiểm thử toàn diện đạt PASS (RELEASE GATE: PASSED).


### Danh Sách Chi Tiết Yêu Cầu Kỹ Thuật (REQ-076)

- **Mã Yêu Cầu**: `REQ-076`
- **Tiêu Đề**: Đồng Bộ Hóa Toàn Diện Giao Diện Video Shorts Theo Theme Sáng/Tối (Dark/Light) & Triệt Tiêu Lỗi Tiêu Đề Danh Sách Bản Tin Màu Đen Bị Chìm
- **Nguồn Prompt**: `PROMPT-20261024-07`: *"Khi chuyển sang video shorts thì UI phải ăn theo thực tế người dùng có chỉnh Dark hoặc LIght không. Ngoài ra tiêu đề của danh sách bản tin đang màu đen không nhìn thấy thông tin nào cần kiểm tra lại UI và fix lại đồng bộ hệ thống https://anx.io.vn/#shorts"*
- **Phân Hệ**: Video Shorts Adaptive Theme System, Dual-Tone Palette (Almond Light & Dark), Heading Cascade Fix (`src/App.tsx`, `src/components/VideoShortsModal.tsx`, `src/index.css`, `docs/DECISIONS.md`)
- **Tiêu Chí Nghiệm Thu**:
  1. *Đồng bộ chế độ Dark/Light theo trạng thái thực tế của người dùng*:
     - Truyền `darkMode={darkMode}` từ `src/App.tsx` vào `<VideoShortsModal ... />`.
     - Phân giải chủ đề chính xác: `const isDark = darkMode ?? (typeof document !== 'undefined' ? document.documentElement.classList.contains('dark') : false);`.
     - Chuyển đổi toàn diện tất cả các phân vùng giao diện:
       + Khung chứa toàn màn hình và hào quang ambient glow: Khung tối (`bg-neutral-950/98 border-white/10`) khi Dark; Khung sáng (`bg-slate-50/98 border-slate-200/80`) khi Light.
       + Khung Sidebar 16:9 Desktop: Header, thanh danh sách video đề xuất, badge kênh, thời lượng và nút hành động chuyển đổi mượt mà giữa Slate/White và Neutral/Dark.
       + Drawer Danh sách phát trên video (Playlist Drawer): Tab header, danh mục con, thẻ video thumbnail, nút chuyển kênh và điều hướng Prev/Next.
       + Hướng dẫn kênh EPG & Catalog: Header, thanh tìm kiếm, 6 Tab danh mục (Tất cả, Video mới, Theo kênh, Đã lưu, Lịch sử, Shorts 9:16), thẻ thông tin kênh, thẻ video, lưới kênh truyền hình (`TV_CHANNELS`), và chân trang phím tắt TV.
       + Drawer Bình luận (Comments Drawer): Nền drawer, header số lượng bình luận, thẻ bình luận người dùng, nút thích/trả lời, form nhập và nút Gửi.
       + Modal Thêm kênh YouTube: Khung modal, form nhập URL/handle, nút Hủy, nút Thêm và danh mục kênh uy tín được thiết kế thích ứng 2 tone màu chuẩn chỉnh.
  2. *Triệt tiêu lỗi tiêu đề bản tin màu đen (Black Text on Dark Surfaces)*:
     - Xóa bỏ rule unlayered `color: var(--almond-ink);` cho các thẻ `h1, h2, h3, h4, h5, h6, strong, b` trong `src/index.css`. Khai báo này nằm ngoài `@layer` khiến CSS Cascade Layer ưu tiên cao hơn và đè lên class `.text-white` của Tailwind khi người dùng ở Light mode (`--almond-ink` là `#0c0f12`), làm tiêu đề trong danh sách bản tin bị đen hoàn toàn.
     - Bổ sung quy tắc scoped: `[data-testid="video-shorts-modal"] h1..h6, strong, b { color: inherit !important; }`.
     - Gán class màu sắc rõ ràng cho mọi tiêu đề: `isDark ? 'text-white' : 'text-[#0c0f12]'`, bảo đảm độ tương phản chuẩn WCAG 2.1 trên cả nền sáng và nền tối.
  3. *Đạt 100% Bộ Kiểm Thử & Nghiệm Thu*:
     - `npm run build`: 0 lỗi.
     - `npm run test:logic`: 427/427 assertions đạt (100% PASS).
     - `npm run testwebsite`: 47/47 ca kiểm thử toàn diện đạt PASS (RELEASE GATE: PASSED).


### Danh Sách Chi Tiết Yêu Cầu Kỹ Thuật (REQ-077)

- **Mã Yêu Cầu**: `REQ-077`
- **Tiêu Đề**: Hiệu Ứng Nền Động CSS Morphing Gradients Cho Thẻ Thời Tiết Hero & Động Cơ Định Vị Địa Lý Phản Ứng Tức Thì Theo Quyền Trình Duyệt
- **Nguồn Prompt**: `PROMPT-20261028-01`: *"Nếu có cập nhât tiến hành thực hiện hệ thống vẫn đẩy là Hà Nội và không tự cập nhập vị trí hiện tại của người dùng <div class=\"relative flex flex-col gap-4 items-start overflow-hidden p-6 rounded-3xl shadow-[0_12px_36px_-6px_rgba(37,99,235,0.3)] w-full transition-all duration-500 hover:scale-[1.01] lg:h-[400px] lg:justify-between border border-white/20\" style=\"background: linear-gradient(135deg, rgb(12, 15, 18) 0%, rgb(20, 6, 45) 50%, rgb(37, 99, 255) 100%);\">...<span class=\"underline decoration-dotted decoration-white/70 underline-offset-2\">Hà Nội</span><span class=\"opacity-60\">·</span><span>13:56</span><span class=\"text-[10px] bg-white/25 hover:bg-white/35 font-bold px-1.5 py-0.5 rounded-full ml-1\">Tự động</span>... ngoài ra ở khung này áp dụng hiệu ứng 'CSS Morphing Gradients Animated Background' để sinh động hơn"*
- **Phân Hệ**: Atmospheric Hero Weather Card, Dynamic CSS Animation System, Reactive Geolocation Watcher & Permissions API (`src/App.tsx`, `src/index.css`, `docs/DECISIONS.md`)
- **Tiêu Chí Nghiệm Thu**:
  1. *Hiệu ứng chuyển động CSS Morphing Gradients Animated Background*:
     - Loại bỏ hoàn toàn thuộc tính inline `style={{ background: 'linear-gradient(...)' }}` tĩnh trên thẻ Hero Weather Card.
     - Triệt tiêu lỗi cú pháp minifier (loại bỏ `filter: hue-rotate(0deg)` bị Vite minifier nuốt mất tham số thành `hue-rotate()` gây vô hiệu hóa animation trên trình duyệt).
     - Triển khai animation `@keyframes morphGradientBackground` chuẩn mực (15s liên tục, vô tận) với `background-size: 300% 300%`.
     - Tích hợp 4 khối aura hữu cơ chuyển động độc lập (`animate-morph-blob-1` đến `4`) với dải màu tương phản cao (Royal Blue, Cosmic Purple, Cyan, Sunset Amber), hiệu ứng làm mờ `blur-3xl`, kết hợp `mix-blend-screen` (Dark Mode) và `mix-blend-hard-light` (Light Mode) tạo nên dòng chảy gradient tan chảy sống động.
     - Tương thích hoàn hảo 2 chế độ Sáng / Tối: `.hero-morph-gradient-dark` và `.hero-morph-gradient-light`.
  2. *Tự động cập nhật theo vị trí trước đó hệ thống đã lấy được & Động cơ Geolocation phản ứng tức thì*:
     - Khôi phục đồng bộ tức thì vị trí trước đó: Hàm `getPreviouslyAcquiredLocation()` truy xuất đa tầng từ `sessionStorage` và `localStorage` (`user_weather_manual_location`, `user_weather_last_location`, `user_weather_auto_location`).
     - Khởi tạo `liveData` ngay ở frame đầu tiên (0ms) với địa danh trước đó, triệt tiêu hoàn toàn hiện tượng chớp nháy hoặc hiển thị mặc định "Hà Nội" khi mở trang.
     - Bảo vệ vị trí bền vững: Xóa bỏ hoàn toàn việc gọi `localStorage.removeItem('user_weather_manual_location')` khi nạp trang; không bao giờ tự ý xóa vị trí người dùng đã từng lưu.
     - Lá chắn bảo vệ IP fallback: Trong `fallbackToIp`, nếu hệ thống đã từng lấy được vị trí hợp lệ trước đó (không phải IP Hà Nội mặc định), hệ thống bảo toàn và cập nhật thời tiết theo vị trí đó, tuyệt đối không để IP fallback đè Hà Nội lên khi GPS timeout hoặc chưa cấp quyền.
     - Khi có quyền GPS hoặc người dùng di chuyển (`watchPosition` / `permissions.onchange` / `window focus`), hệ thống cập nhật tọa độ thực tế tức thì (0ms độ trễ), giải mã ngược qua Photon Komoot OSM và Haversine.
  3. *Đạt 100% Bộ Kiểm Thử & Nghiệm Thu*:
     - `npm run build`: 0 lỗi.
     - `npm run test:logic`: 427/427 assertions đạt (100% PASS).
     - `npm run testwebsite`: 47/47 ca kiểm thử toàn diện đạt PASS (RELEASE GATE: PASSED).


### Danh Sách Chi Tiết Yêu Cầu Kỹ Thuật (REQ-078)

- **Mã Yêu Cầu**: `REQ-078`
- **Tiêu Đề**: Đồng Bộ & Tinh Chỉnh Bảng Màu Cao Cấp Chuẩn Almond AI SaaS Cho Toàn Bộ Phân Hệ Thời Tiết (Hero Weather Card, Hourly Temperature Chart & Weather Sub-cards) Trong Cả Hai Chế Độ Sáng & Tối (Light & Dark Mode)
- **Nguồn Prompt**: `PROMPT-20261028-02`: *"Hệ thống đang phối màu rất xấu kiểm tra lại"* & *"Hệ thống đang phối màu rất xấu kiểm tra lại kể cả Dark và Light"* kèm ảnh chụp màn hình định vị thẻ Hero thời tiết.
- **Phân Hệ**: Atmospheric Hero Weather Card, Hourly Temperature Chart, Weather Sub-cards, Unified Almond Design System (`src/App.tsx`, `src/index.css`, `docs/DECISIONS.md`)
- **Tiêu Chí Nghiệm Thu**:
  1. *Triệt tiêu hoàn toàn sự pha tạp màu chói gắt & hiện tượng vệt màu neon loang lổ trên Thẻ Hero Thời Tiết*:
     - **Chế độ Dark Mode**: Thay thế hoàn toàn dải màu cũ bằng Deep Cosmic Obsidian Noir (`#0d1117` -> `#151922` -> `#1a2233` -> `#0f131c`), đồng bộ tuyệt đối với tông bề mặt SaaS của các thẻ lân cận (`#151921` và `#0c0f12`). Tinh chỉnh 3 khối aura khí quyển mượt mà (`opacity: 12% - 18%`, Royal Blue, Soft Indigo, Cyan) với chu kỳ 18s - 24s êm dịu, loại bỏ triệt để `mix-blend-screen` gây cháy sáng/loang lổ mảng màu.
     - **Chế độ Light Mode**: Chuyển sang dải màu xanh biển cao cấp Royal Electric Blue to Sky Azure (`#1d4ed8` -> `#2563ff` -> `#3b82f6`) với ánh hào quang trắng tinh khôi mờ nhẹ, loại bỏ các vệt màu tím chói gắt.
     - **Huy hiệu vị trí (Location Badge)**: Tinh chỉnh đường viền kính phản quang cao cấp, badge "Tự động" với độ tương phản sắc nét, nhãn thời gian và icon ghim định vị nổi bật trên cả 2 nền.
  2. *Nâng cấp 4 thẻ chỉ số khí quyển (Gió, Độ ẩm, Bụi PM2.5, Tầm nhìn) thành Luxury Frosted Glass Cards*:
     - **Dark Mode**: Sử dụng lớp phủ kính đen sang trọng `bg-white/[0.06] border-white/[0.08] hover:bg-white/[0.10]`, nhãn phân loại `text-slate-300 text-[11.5px]`, giá trị `text-white font-bold text-[14px]`. Loại bỏ hoàn toàn cảm giác kính đục mờ xám tím.
     - **Light Mode**: Sử dụng kính sương mờ trắng tuyết `bg-white/15 border-white/25 hover:bg-white/25`, nhãn `text-white/85`, giá trị `text-white font-bold`.
  3. *Chuẩn hóa Đồ thị nhiệt độ hàng giờ (`HourlyTemperatureChart`)*:
     - Thay thế triệt để đường cong màu hồng neon `#ff315f` bằng sắc xanh thương hiệu Almond Royal Blue `#2563ff`.
     - Vùng đổ bóng nhiệt độ chuyển sang dải gradient xanh dương trong suốt `rgba(37, 99, 255, 0.08)`.
     - Điểm chấm tròn giá trị nhiệt độ đồng bộ tương thích Dark/Light (`fill="currentColor" className="text-white dark:text-[#151921]" stroke="#2563ff"`).
     - Typography nhãn giờ và nhiệt độ tương thích theme `text-[#0c0f12] dark:text-[#f8fafc]`.
  4. *Đồng bộ Dark Mode cho toàn bộ các khối phụ phân hệ thời tiết*:
     - Các khối: "DỰ BÁO HÀNG GIỜ", "DỰ BÁO THỜI TIẾT TUẦN", "DỰ BÁO 3 GIỜ TỚI", "BẢNG ĐIỂM ĐEN NGẬP ÚNG", "CẢNH BÁO KHÍ TƯỢNG", "GỢI Ý CHĂM SÓC SỨC KHỎE" được bổ sung đầy đủ các lớp `bg-white dark:bg-[#151921] border-[#e2e4e8] dark:border-white/[0.08] text-[#0c0f12] dark:text-[#f8fafc]`.
     - Loại bỏ hoàn toàn tình trạng thẻ phụ bị giữ nền trắng chói mắt hoặc chữ đen bị chìm khi người dùng bật Dark Mode.
  5. *Đạt 100% Bộ Kiểm Thử & Nghiệm Thu*:
     - `npm run build`: 0 lỗi.
     - `npm run test:logic`: 427/427 assertions đạt (100% PASS).
     - `npm run testwebsite`: 47/47 ca kiểm thử toàn diện đạt PASS (RELEASE GATE: PASSED).

---

### Danh Sách Chi Tiết Yêu Cầu Kỹ Thuật (REQ-079)

- **Mã Yêu Cầu**: `REQ-079`
- **Tiêu Đề**: Nền Động Đa Tầng "Animated Mesh Gradient Background" & Động Cơ Hiệu Ứng Thời Tiết Thời Gian Thực (CSS + JS) Cho Thẻ Hero Weather
- **Nguồn Prompt**: `PROMPT-20261028-03`: *"Tôi muốn áp dụng 'Animated Mesh Gradient Background' vào trong khung ngoài ra với trạng thái thời tiết kèm hiệu ứng dưới nền 'weather background animation css js' cho `<div class="relative flex flex-col gap-4 items-start overflow-hidden p-6 rounded-3xl ...">`"*
- **Phân Hệ**: Hero Weather Card, Dynamic Weather Engine (`src/components/WeatherBackgroundEffect.tsx`, `src/App.tsx`, `src/index.css`)
- **Tiêu Chí Nghiệm Thu**:
  1. *Animated Mesh Gradient*:
     - Áp dụng nền đa điểm cực radial-gradient (multi-node mesh) với hiệu ứng chuyển động GPU-accelerated mượt mà (`@keyframes meshGradientShift`, `meshNode1..4`).
     - Tương thích hoàn hảo cả Light Mode (`hero-mesh-gradient-light`) và Dark Mode (`hero-mesh-gradient-dark`).
  2. *Động cơ hiệu ứng thời tiết động (Weather Background Effect)*:
     - Tự động bóc tách và phản hồi theo đúng thời tiết thời gian thực: Mây đen u ám (`am-u` với mây trôi đa tầng `animate-cloud-drift-1/2`), Mưa nhỏ/Mưa phùn (`mua-nho` với hạt mưa rơi 3D `weather-raindrop`), Mưa dông sấm sét (`mua-dong` với ánh chớp `animate-lightning-flash` và tia sét phát quang `animate-lightning-bolt`), Nắng nhẹ/quang đãng (`nang` với đốm lấp lánh `sun-sparkle`), Nắng gắt/nắng nóng (`nang-gat` với sóng nhiệt shimmer `animate-heat-shimmer`), Sương mù/u ám (`suong-mu` với dải sương trôi `animate-fog-flow`).
     - Emoji thời tiết tự động đồng bộ theo nhãn thực tế ("mây đen u ám" hiển thị biểu tượng mây ☁️ thay vì biểu tượng lửa 🔥).
  3. *Đạt 100% Bộ Kiểm Thử & Nghiệm Thu*:
     - `npm run build`: 0 lỗi.
     - `npm run test:logic`: 435/435 assertions đạt (100% PASS).
     - `npm run testwebsite`: 47/47 ca kiểm thử toàn diện đạt PASS (RELEASE GATE: PASSED).

---

### Danh Sách Chi Tiết Yêu Cầu Kỹ Thuật (REQ-080)

- **Mã Yêu Cầu**: `REQ-080`
- **Tiêu Đề**: Phóng To Mã VietQR Quét Thanh Toán Bằng Popup Modal Căn Giữa Màn Hình Kèm Lắng Nghe Sự Kiện Toàn Cục (Universal Click Delegation) Cho Hóa Đơn Tiền Phòng & Điện Nước Trong Phân Hệ Quản Trị (Admin Board)
- **Nguồn Prompt**:
  - `PROMPT-20261028-04`: *"Ở khu vực Qrcode này nếu người dùng bấm vào `<div class="size-20 rounded-lg overflow-hidden bg-white p-1 border border-[#e3e7ef] shrink-0 shadow-xs"><img alt="VietQR" class="size-full object-contain" src="https://img.vietqr.io/image/BIDV-8817398313-compact2.png?amount=4860500&addInfo=TIEN%20PHONG%20Ph%C3%B2ng%20Thu%C3%AA%20T10&accountName=TRAN%20THI%20THUY%20HUYEN"></div>` thì hệ thống sẽ hiển thị popup kèm ảnh Qrcode giữa màn hình để người dùng quét."*
  - `PROMPT-20261028-05`: *"nút này chỉ nằm trong `<button type="button" data-testid="tablet-vietqr-btn" class="flex items-center gap-1.5 h-[32px] px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 font-bold text-[12px] border border-blue-200 dark:border-blue-800 shadow-2xs active:scale-95 transition-all cursor-pointer shrink-0" title="Xem mã VietQR thanh toán tiền phòng"><span>QR Hóa đơn</span></button>` trang này thôi khi người dùng bấm `<div class="size-20 rounded-lg overflow-hidden bg-white p-1 border border-[#e3e7ef] shrink-0 shadow-xs"><img alt="VietQR" class="size-full object-contain" src="https://img.vietqr.io/image/BIDV-8817398313-compact2.png?amount=4563000&addInfo=TIEN%20PHONG%20Ph%C3%B2ng%20Thu%C3%AA%20T10&accountName=TRAN%20THI%20THUY%20HUYEN"></div>` https://anx.io.vn/admin"*
- **Phân Hệ**: VietQR Modal Popup, Admin Board Quản Trị, Universal Click Interceptor (`src/components/VietQRModal.tsx`, `src/AdminBoard.tsx`, `public/admin/index.html`, `public/admin_board.html`, `public/admin_board/index.html`, `scripts/test-logic-flows.mjs`, `scripts/test-ux-flows.mjs`)
- **Tiêu Chí Nghiệm Thu**:
  1. *Khởi tạo Component Popup Modal VietQR (`VietQRModal.tsx`)*:
     - Căn giữa tuyệt đối trên màn hình (`fixed inset-0 z-[999] flex items-center justify-center`) với lớp phủ làm mờ nền cao cấp (`backdrop-blur-sm`).
     - Hiển thị ảnh mã QR kích thước lớn, sắc nét, tối ưu cho camera điện thoại quét từ xa.
     - Bảng thông tin thanh toán chi tiết:
       + Số tiền thanh toán: `4.860.500 ₫` kèm nút "Sao chép" 1 chạm.
       + Ngân hàng thụ hưởng: `BIDV` (Ngân hàng TMCP Đầu tư và Phát triển Việt Nam).
       + Số tài khoản: `8817398313` kèm nút "Sao chép" 1 chạm.
       + Chủ tài khoản: `TRAN THI THUY HUYEN` (TRẦN THỊ THÚY HUYỀN).
       + Nội dung chuyển khoản: `TIEN PHONG Phòng Thuê T10` kèm nút "Sao chép" 1 chạm.
     - Hỗ trợ nút tải ảnh mã QR (`Lưu ảnh QR`), nút Đóng (X), phím tắt `Escape` và đóng khi nhấp ngoài vùng modal (Click outside).
  2. *Thẻ Hóa Đơn & Mã Thumbnail VietQR (`VietQRPaymentCard`)*:
     - Hiển thị chính xác thẻ chứa mã HTML theo đặc tả người dùng:
       `<div class="size-20 rounded-lg overflow-hidden bg-white p-1 border border-[#e3e7ef] shrink-0 shadow-xs cursor-pointer hover:border-blue-500 hover:shadow-md transition-all group relative">...</div>`.
     - Tích hợp trên cả 3 giao diện Mobile, Tablet, Desktop và nút truy cập nhanh "QR Hóa đơn" trên thanh Header.
  3. *Lắng nghe sự kiện click toàn cục (Universal Event Delegation)*:
     - Lắng nghe sự kiện `click` ở cấp độ `document` với capture phase (`true`).
     - Tự động bắt mọi lượt click vào bất kỳ phần tử nào có `img[alt="VietQR"]`, `img[src*="vietqr.io"]`, hoặc container `.size-20` chứa ảnh VietQR, trích xuất tức thì các tham số URL (`amount`, `addInfo`, `accountName`, `bank`, `accountNo`) và mở Popup Modal tương ứng ngay lập tức.
  4. *Khả năng chống chịu mạng kém (Fallback QR SVG)*:
     - Tích hợp sẵn `FALLBACK_QR_SVG` nội suy an toàn (Inline Data URI), đảm bảo khi không có mạng hoặc API VietQR chậm, ảnh mã QR không bao giờ bị vỡ và `brokenImages` luôn bằng 0.
  5. *Đạt 100% Bộ Kiểm Thử & Nghiệm Thu*:
     - `npm run build`: 0 lỗi.
     - `npm run test:logic`: 435/435 assertions đạt (100% PASS - Luồng 25 VietQR).
     - `npm run testwebsite`: 47/47 ca kiểm thử toàn diện đạt PASS (RELEASE GATE: PASSED - Scenario 8 UX VietQR).

---

### Danh Sách Chi Tiết Yêu Cầu Kỹ Thuật (REQ-081)

- **Mã Yêu Cầu**: `REQ-081`
- **Tiêu Đề**: Bổ Sung Ô Nhập "Ghi Chú Chuyển Khoản" Dưới "Tên Chủ Tài Khoản" & Ràng Buộc Thông Tin Phòng/Người Thuê Thực Tế Vào Sổ Công Nợ
- **Nguồn Prompt**: `PROMPT-20261030-01`: *"Dưới thông tin 'Tên Chủ Tài Khoản' bổ sung thêm 'Ghi chú chuyển khoản' ô nhập nd chuyển khoản ngoài ra ở phần 'Lịch Sử Hóa Đơn & Sổ Theo Dõi Công Nợ' ở cột 'Phòng' khi nhấn 'Lưu vào Lịch Sử & Sổ Công Nợ' thông tin phải lấy theo thông tin phòng người thuê hiện tại không lấy."*
- **Phân Hệ**: Bảng Giá & Cấu Hình Ngân Hàng VietQR, Bảng Nhập Số Công Tơ Tự Động Kế Thừa, Sổ Theo Dõi Công Nợ (`src/AdminBoard.tsx`, `public/admin/index.html`, `public/admin_board.html`, `public/admin_board/index.html`, `scripts/test-logic-flows.mjs`)
- **Tiêu Chí Nghiệm Thu**:
  1. *Bổ Sung Ô Nhập "Ghi Chú Chuyển Khoản"*:
     - Vị trí: Đặt ngay bên dưới trường "Tên Chủ Tài Khoản" trong khối "💳 Thông Tin Nhận Chuyển Khoản VietQR".
     - Nhãn: "Ghi chú chuyển khoản (Nội dung CK)".
     - Giá trị mặc định: `TIEN PHONG {room} T{month}` hoặc nội dung do quản trị viên nhập tay.
     - Hỗ trợ các biến phân giải động: `{room}` (tên phòng), `{tenant}` (tên người thuê), `{month}` (tháng), `{year}` (năm).
     - Áp dụng vào mã VietQR URL, Modal hiển thị phóng to, tin nhắn Zalo, bản kê chi phí và nhắc nợ.
  2. *Ràng Buộc Chính Xác Thông Tin Phòng & Người Thuê Thực Tế*:
     - Đồng bộ tự động `calcRoomId` với danh sách phòng thực tế: Khi xóa các phòng mặc định và thêm phòng mới (ví dụ: `Phòng 302` - `Nguyễn Bá Ngọc`), hệ thống tự động trỏ `calcRoomId` về phòng mới thay vì giữ giá trị `p101` đã bị xóa.
     - Triệt tiêu lỗi rơi về fallback giả định `Phòng Thuê` / `Khách thuê`.
     - Khi nhấn "Lưu Vào Lịch Sử & Sổ Công Nợ", hóa đơn được ghi nhận với đúng `room_name` và `tenant` của phòng đang chọn.
     - Trong bảng "Lịch Sử Hóa Đơn & Sổ Theo Dõi Công Nợ", cột "Phòng" hiển thị đầy đủ cả Tên Phòng (in đậm) và Tên Người Thuê (chữ xám rõ ràng bên dưới).
  3. *Đạt 100% Bộ Kiểm Thử & Nghiệm Thu*:
     - `npm run build`: 0 lỗi.
     - `npm run test:logic`: 445/445 assertions đạt chuẩn 100% PASS (bổ sung Luồng 26).
     - `npm run testwebsite`: 47/47 ca kiểm thử toàn diện đạt PASS (RELEASE GATE: PASSED).

---

### Danh Sách Chi Tiết Yêu Cầu Kỹ Thuật (REQ-082)

- **Mã Yêu Cầu**: `REQ-082`
- **Tiêu Đề**: Bổ Sung Mã QR-Code Bên Dưới Từng Dòng Hóa Đơn Trong Sổ Công Nợ Để Chuyển Khoản & Nhấp Để Phóng To Modal
- **Nguồn Prompt**: `PROMPT-20261030-02`: *"ở trên bảng bổ sung thêm Qr-code bên dưới của từng dòng khi nội dung lưu thì sẽ có qr-code để ngời dùng chuyển khoản . Bấm vào qrcode đó để phóng to qrcode như hiện tại"*
- **Phân Hệ**: Bảng Lịch Sử Hóa Đơn & Sổ Theo Dõi Công Nợ, VietQR Modal Popup, Dynamic QR Generator (`src/AdminBoard.tsx`, `public/admin/index.html`, `public/admin_board.html`, `public/admin_board/index.html`, `scripts/test-logic-flows.mjs`, `scripts/test-ux-flows.mjs`)
- **Tiêu Chí Nghiệm Thu**:
  1. *Bổ Sung Khối Mã QR Bên Dưới Từng Dòng Hóa Đơn*:
     - Vị trí: Hiển thị ngay dưới mỗi dòng hóa đơn trong bảng "Lịch Sử Hóa Đơn & Sổ Theo Dõi Công Nợ" dưới dạng sub-row trải dài (`colSpan={8}`).
     - Chứa ảnh thumbnail mã VietQR kích thước `size-16` sắc nét kèm hiệu ứng hover "🔍 Phóng to".
     - Hiển thị rõ ràng thông tin: Tên phòng, Mã hóa đơn, Số tiền thanh toán thực tế (khớp chính xác với hóa đơn đó), STK, Ngân hàng BIDV, và Nội dung chuyển khoản riêng biệt.
  2. *Tương Tác Phóng To Mã QR Giữa Màn Hình (Click-to-Zoom)*:
     - Khi người dùng nhấp vào ảnh thumbnail QR code hoặc bấm nút "📱 Phóng to mã QR" tại dòng đó, hệ thống lập tức mở Popup Modal `VietQRModal` căn giữa màn hình với mã QR độ phân giải cao và thông tin tương ứng của hóa đơn đó.
     - Hỗ trợ nút sao chép thông tin chuyển khoản nhanh 1 chạm (`Sao chép CK`).
     - Hỗ trợ đóng modal linh hoạt bằng phím `Escape`, nút đóng (X) hoặc nhấp ra ngoài nền mờ.
  3. *Tự Động Tạo Mã QR Riêng Cho Hóa Đơn Khi Lưu*:
     - Khi nhấn "Lưu Vào Lịch Sử & Sổ Công Nợ", hóa đơn mới được lưu trữ kèm đầy đủ `qrUrl`, `addInfo`, `bank_name`, `bank_account`, `bank_owner`.
     - Ngay lập tức hiển thị dòng QR riêng biệt bên dưới hóa đơn vừa lưu.
  4. *Đạt 100% Bộ Kiểm Thử & Nghiệm Thu*:
     - `npm run build`: 0 lỗi biên dịch.
     - `npm run test:logic`: 452/452 assertions đạt chuẩn 100% PASS (bổ sung Luồng 27).
     - `npm run testwebsite`: 47/47 ca kiểm thử toàn diện đa thiết bị đạt PASS (bổ sung ca kiểm thử UX-08.5).
