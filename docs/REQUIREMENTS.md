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
| REQ-022 | PROMPT-20261014-10 | Kiểm thử chuyên sâu 7 luồng logic và xử lý thông tin nghiệp vụ toàn hệ thống | P0 | Logic / Business Flows | TC-022 | PASS | test-logic-flows.mjs:TC-022 | 134/134 assertions PASS covering all 7 core flows |
| REQ-023 | PROMPT-20261014-11 | Kiểm thử toàn diện trải nghiệm người dùng (UX) và các luồng tương tác thực tế | P0 | UX / Interaction Flows | TC-023 | PASS | test-ux-flows.mjs:TC-023 | 7/7 UX Scenarios PASS: Audio TTS, Escape dismiss, Shorts Shortcuts, Tooltip, Category Pills, Dark Mode, Touch Targets |
| REQ-024 | PROMPT-20261014-12 | Kiểm thử toàn diện tương tác thực chiến đa màn hình (cuộn, click mọi khối) & Bộ quét lỗi giao diện trực quan | P0 | Visual / Interaction Scanner | TC-024 | PASS | test-visual-fullsystem.mjs:TC-024 | 5 phases: Scroll/ScrollToTop, News Detail/TTS, Shorts/Calendar/DarkMode, Tablet/Mobile, 0 overflow, 0 broken imgs |
| REQ-025 | PROMPT-20261014-13 | Quản lý xác thực Google OAuth 2.0, phiên đăng nhập & Trình đơn hồ sơ người dùng | P0 | Auth / Session | TC-025 | PASS | testwebsite.mjs:TC-025 | Google OAuth2 login button, localStorage user_auth, UserAvatarMenu & logout |
| REQ-026 | PROMPT-20261014-13 | Phân hệ Lịch Vạn Niên Âm - Dương, điều hướng tháng & Tích hợp Google Calendar | P1 | Calendar / Integration | TC-026 | PASS | testwebsite.mjs:TC-026 | Solar/Lunar calendar, leap year calculations, month switcher & Google Calendar link |
| REQ-027 | PROMPT-20261014-13 | Thu thập tin tức RSS từ hơn 38 nguồn báo chí, nạp vô cực & Cập nhật nền | P0 | News Ingestion / Feeds | TC-027 | PASS | testwebsite.mjs:TC-027 | 38+ RSS feeds, InfiniteScrollTrigger batch 15 articles, idle auto-refresh |
| REQ-028 | PROMPT-20261014-13 | Định tuyến URL ảo chuẩn SEO cho bài viết chi tiết & Lịch sử Popstate | P1 | Routing / Navigation | TC-028 | PASS | testwebsite.mjs:TC-028 | Virtual SEO /chi-tiet-[slug] pushState & popstate modal synchronization |
| REQ-029 | PROMPT-20261014-13 | Trang Chính Sách Bảo Mật minh bạch (Privacy Policy) & Kiểm soát dữ liệu | P1 | Compliance / Privacy | TC-029 | PASS | testwebsite.mjs:TC-029 | PrivacyPolicyPage z-[300], 6 terms sections, client-side only transparency |
| REQ-030 | PROMPT-20261014-13 | Bảng điều khiển thời tiết nhà phát triển (Dev Weather Control Panel) qua Triple-tap | P2 | Developer / Tools | TC-030 | PASS | testwebsite.mjs:TC-030 | DevWeatherPanel 9 weather condition simulator triggered by secret triple-tap |

## Prompt intake log

| Prompt ID | Date | Original prompt location/reference | Requirements created/updated | Conflicts | Reviewer |
|---|---|---|---|---|---|
| PROMPT-20261012-01 | 2026-10-12 | Yêu cầu tích hợp module thời tiết và dự báo hàng giờ | REQ-016 | None | Approved |
| PROMPT-20261012-02 | 2026-10-12 | Yêu cầu bảng giá thị trường tài chính thời gian thực | REQ-017 | None | Approved |
| PROMPT-20261013-01 | 2026-10-13 | Yêu cầu trình phát Shorts: bật tiếng, overlay chặn youtube, ẩn controls 5s | REQ-009, REQ-010, REQ-011 | Resolved | Approved |
| PROMPT-20261013-02 | 2026-10-13 | Sửa lỗi lệch card trong Smart TV EPG Guide (Ảnh 1) | REQ-004 | Resolved | Approved |
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


