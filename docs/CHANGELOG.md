# Lịch Sử Thay Đổi Dự Án (Changelog)

## Phiên bản 1.0.0 (2026-10-14) - Bản Phát Hành Tích Hợp Toàn Diện

### 1. Phân Hệ Video Shorts & Smart TV Player
- Tích hợp 97 video YouTube thực tế đã xác thực 100% qua YouTube oEmbed API từ 10 kênh báo đài lớn Việt Nam (VTV24, Báo Tiền Phong, Tuổi Trẻ, VTC NOW, Lao Động, VTV Thời Tiết, ANTV, VnExpress, Thanh Niên, Dân Trí).
- Loại bỏ hoàn toàn video lỗi 404 (`mBwR5jE57gA`) và các link MP4 nội bộ giả lập (`cdn2.tuoitre.vn`).
- Khắc phục lỗi rỗng playlist khi đổi kênh TV (bỏ ràng buộc lọc cứng `selectedSubCategory`).
- Tách biệt và tối ưu responsive 3 nhóm thiết bị: Mobile (ẩn nút xoay 16:9, chống đè nút header), Tablet (khung rạp chiếu 420px + ambient glow), Desktop (mặc định Toàn Cảnh 16:9 Cinema, phím tắt Fullscreen `F`).
- Tự động phục hồi lỗi nhúng YouTube (`onError` 100/101/150) chuyển video kế tiếp sau 2.2 giây.
- Mặc định bật âm thanh (`unmuted`), lớp overlay trong suốt `z-10` chặn chuyển trang sang youtube.com, tự ẩn controls sau 5 giây không tương tác.

### 2. Phân Hệ Đọc Bài Viết Chi Tiết & Tác Giả Chuẩn Báo Chính Thống
- Thiết lập thanh tác giả (Byline Bar) trang nhã dưới tiêu đề với logo tròn 1:1 (`w-7 h-7 sm:w-8 sm:h-8 rounded-full`), tên tác giả in đậm, ngày giờ và nút "Nghe đọc".
- Thực hiện pre-cleaning loại bỏ container tác giả khỏi DOM thân bài.
- Bộ lọc kép khử 100% tình trạng avatar tác giả bị phóng to thành ảnh bài viết trong thân bài; loại bỏ tên tác giả mồ côi.

### 3. Phân Hệ Bố Cục Desktop & Dải Danh Mục Tin Tức
- Khung bố cục chính `DesktopLayout` áp dụng `style={{ paddingTop: '10px', paddingLeft: '0px', paddingRight: '0px' }}` theo đúng thông số DevTools yêu cầu.
- Nâng cấp chiều rộng tối đa dải nút cuộn danh mục tin tức lên `872px` (`max-w-[872px]`), mở rộng tầm nhìn các chuyên mục.

### 4. Hệ Thống Quản Lý Yêu Cầu, Bộ Nhớ Dự Án & Tự Động Hóa QA
- Tích hợp bộ hồ sơ bộ nhớ dự án chuẩn hóa: `PROJECT.md`, `REQUIREMENTS.md`, `DECISIONS.md`, `HANDOFF.md`, `docs/qa/TEST_PLAN.md`, `docs/qa/RELEASE_GATE.md`, `AI_PROJECT_PROTOCOL.md`, `AGENTS.md`.
- Kích hoạt lệnh kiểm thử tự động `/testwebsite` qua script `scripts/testwebsite.mjs`.
- Sửa lỗi lệch chỉ số cột và hoàn thiện script kiểm tra registry `scripts/validate-registry.mjs`.
- Bổ sung quy trình CI tự động `.github/workflows/qa-registry.yml`.

### 5. Phân Quyền QA Dashboard & Kiểm Thử Toàn Diện Logic Luồng (REQ-021 & REQ-022)
- Cấu hình phân quyền nghiêm ngặt: Chỉ tài khoản `mrkun28@gmail.com` mới có quyền truy cập QA Dashboard trên Top Header, Floating Widget và Menu Avatar.
- Xây dựng module xử lý logic độc lập `src/utils/logicFlows.ts` bao phủ 7 luồng thông tin: Thời tiết, Tài chính (hỗ trợ phân tách hàng nghìn chấm và thập phân phẩy), Lọc trùng tin tức (chuẩn hóa URL canonical), Trình bóc tách bài viết & Chống phóng to avatar tác giả, Video Shorts & TV đa kênh, Auth phân quyền, Lịch vạn niên (thuật toán năm nhuận).
- Thiết lập bộ test logic chuyên sâu `scripts/test-logic-flows.mjs` với 134 assertions tự động đạt tỷ lệ 100% PASS.
- Nâng cấp `dashboard.html` bổ sung cửa sổ Nhật Ký Thực Thi Thời Gian Thực (`#liveConsoleOutput`) với live tags và tương tác DOM thực tế trên iframe hệ thống.

### 6. Kiểm Thử Toàn Diện Trải Nghiệm Người Dùng (UX) & Tương Tác Luồng Thực Tế (REQ-023)
- Tích hợp tính năng Text-to-Speech (Audio Reader) tiếng Việt (`vi-VN`) vào nút "Nghe đọc" trong Byline Bar của `NewsDetailView`, kèm trạng thái "Đang đọc...", animation pulse và hỗ trợ tạm dừng/tiếp tục.
- Khóa cuộn trang nền `document.body.style.overflow = "hidden"` khi mở modal bài viết và hỗ trợ phím `Escape` để thoát modal nhanh chóng.
- Xây dựng bộ kiểm thử 7 kịch bản UX (`scripts/test-ux-flows.mjs`) kiểm tra: Audio TTS, phím tắt Shorts (`Space`, `M`, `ArrowDown`, `ESC`), Tooltip đồ thị giá vàng và tự ẩn khi mouseleave, chọn chuyên mục với highlight pill hồng, Dark mode toggle và touch targets công thái học.
### 7. Kiểm Thử Tương Tác Sâu Đa Màn Hình, Bộ Quét Lỗi Trực Quan & Động Cơ Antigravity Copilot Pro (REQ-024)
- Xây dựng bộ kiểm thử tương tác thực chiến 5 giai đoạn (`scripts/test-visual-fullsystem.mjs`):
  1. Thao tác cuộn sâu Desktop > 1500px & kiểm tra nút `ScrollToTop` cuộn mượt về đỉnh (`scrollY = 0`).
  2. Click mở modal bài viết chi tiết, cuộn bài, kích hoạt Web Speech API TTS tiếng Việt ("Đang đọc..."), xem bài liên quan và phím `Escape` thoát bài.
  3. Tương tác Shorts Player 16:9 Cinema, phím tắt `Space`/`M`, Dark Mode toggle và điều hướng lịch âm dương.
  4. Bố cục Tablet (768px) & Cử chỉ vuốt chạm Mobile (375px).
  5. Bộ quét lỗi giao diện trực quan tự động (Visual Defect Scanner): 0 lỗi tràn viền ngang (Horizontal Overflow), 0 ảnh hỏng (Broken Images) và vùng chạm công thái học $\ge 40\text{px}$.
- Tích hợp Động Cơ Điều Phối Lỗi Tự Động Antigravity Copilot Pro cho tài khoản quản trị `mrkun28@gmail.com`:
  - Hiển thị huy hiệu Pro Tier và cờ liên kết tự động.
  - Khi có lỗi kiểm thử (`problems > 0`), hệ thống tự động phát âm báo, kích hoạt modal điều phối `#copilotModal`, định dạng chỉ thị chuẩn `AI_PROJECT_PROTOCOL.md` và lưu vào `localStorage.antigravity_active_task`.
  - Bổ sung nút `[🧪 Thử Nghiệm Báo Lỗi]` (`copilotSimulateBugBtn`) cho phép mô phỏng báo lỗi thử nghiệm và khôi phục trạng thái PASS 100%.
- Nâng cấp bộ kiểm thử toàn diện `/testwebsite` đạt **24/24 PASS (100% ĐẠT, 0 FAIL)**, thông qua cổng kiểm duyệt phát hành **RELEASE GATE: PASSED**.

### 8. Mở Rộng Hệ Thống 30/30 Yêu Cầu & Ca Kiểm Thử Toàn Diện (REQ-025 -> REQ-030)
- Tích hợp và chuẩn hóa 6 phân hệ nâng cao vào ma trận yêu cầu và kiểm thử tự động:
  1. **REQ-025 / TC-025**: Quản lý xác thực Google OAuth 2.0, phiên đăng nhập bền vững (`user_auth`) và UserAvatarMenu.
  2. **REQ-026 / TC-026**: Lịch Vạn Niên Âm - Dương, điều hướng tháng trước/sau và nút tích hợp Google Calendar.
  3. **REQ-027 / TC-027**: Thu thập tin tức RSS từ hơn 38 nguồn báo chí chính thống qua proxy, 10 chuyên mục và cuộn nạp vô cực.
  4. **REQ-028 / TC-028**: Định tuyến URL ảo chuẩn SEO `/Website_thoitiet_design/chi-tiet-[slug]` và đồng bộ popstate khôi phục trang chủ.
  5. **REQ-029 / TC-029**: Trang Chính Sách Bảo Mật minh bạch (`PrivacyPolicyPage`) overlay z-[300] chuẩn Google OAuth Client.
  6. **REQ-030 / TC-030**: Bảng điều khiển thời tiết nhà phát triển (`DevWeatherPanel`) kích hoạt qua triple-tap logo Anx.
- Đồng bộ dữ liệu kiểm thử trực tiếp trên `dashboard.html` (Live Execution Console, Fallback Data, Test Definitions, Runner Execution Loop) hỗ trợ kiểm tra thời gian thực 30 ca.
- Thực thi toàn diện lệnh kiểm duyệt `/testwebsite` (`npm run testwebsite`) đạt **30/30 PASS (100% ĐẠT, 0 FAIL)**, xác thực thành công **RELEASE GATE: PASSED**.

