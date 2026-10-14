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
- Kích hoạt lệnh kiểm thử tự động `/testwebsite` qua script `scripts/testwebsite.mjs` đạt kết quả 20/20 PASS.
- Sửa lỗi lệch chỉ số cột và hoàn thiện script kiểm tra registry `scripts/validate-registry.mjs`.
- Bổ sung quy trình CI tự động `.github/workflows/qa-registry.yml`.
