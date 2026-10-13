# PROJECT HANDOFF & CURRENT STATUS

## 1. THÔNG TIN PHIÊN BẢN & MÃ NGUỒN
- **Nhánh Git**: `main`
- **Commit gần nhất**: `ce673a3 (fix(shorts): define missing parseDurationSeconds, suppressAdsAndCaptions, and fix duplicate server in vite.config)`
- **Trạng thái Build**: Đã kiểm tra `npm run build` thành công 100% không có lỗi biên dịch.

## 2. CÁC TÍNH NĂNG VỪA HOÀN THIỆN
1. **Sửa lỗi Runtime (Hotfix)**:
   - Khắc phục triệt để lỗi `ReferenceError: parseDurationSeconds is not defined`.
   - Khôi phục và khai báo đầy đủ các helper functions: `parseDurationSeconds`, `suppressAdsAndCaptions`, `FEATURED_NEWS_CHANNELS`, biến `vid`.
   - Khắc phục cấu hình trùng lặp khóa `server` trong `vite.config.ts`.
2. **Menu Chọn Kênh TV (Smart TV EPG Channel Guide)**:
   - Danh sách 8 kênh truyền hình báo chí chính thống (`CH 00` -> `CH 08`).
   - Khi chọn một kênh (ví dụ: VTV24), player chỉ phát video của kênh đó và bắt đầu từ video mới nhất.
   - Thêm dải chọn nhanh kênh (Quick TV Channel Pills) và hỗ trợ phím tắt `C` để mở menu kênh TV.
3. **Bộ Lọc Phân Tab Media**:
   - Tích hợp 3 tab: `Tất cả`, `🎬 Video trên kênh` (bản tin, phóng sự 16:9), `⚡ Shorts ngắn` (9:16).
4. **Tối Ưu Trải Nghiệm Màn Hình PC (Widescreen Theater & Auto-Orientation)**:
   - Tự động nhận diện thiết bị PC (`window.innerWidth >= 1024`), mặc định mở ở chế độ **16:9 Toàn Cảnh** rực rỡ, không bị co cụm thành dải hẹp giữa màn hình.
   - Gỡ bỏ giới hạn cố định `max-w-[1100px]`, mở rộng khung video lên đến `min(95vh, 1020px)` và chiều rộng linh hoạt `1400px - 1700px` trên màn hình lớn.
   - Bổ sung nút chuyển đổi tức thì `[🖥️ 16:9 Toàn cảnh]` / `[📱 9:16 Dọc]` (phím tắt `R`) ngay trên thanh điều khiển.
   - Đồng bộ chiều cao tuyệt đối giữa Video Player và Desktop Playlist Sidebar trên màn hình `xl:` và `2xl:`.
5. **Tự động ẩn Controls sau 5s & Chặn YouTube Redirect**:
   - Controls tự động ẩn sau 5s khi xem video, chạm vào thì hiện lại.
   - Khi chuyển video không làm lộ controls ẩn.
   - Chặn tuyệt đối nút nhảy trang sang YouTube; triệt tiêu phụ đề dịch tự động và skip quảng cáo.
   - Chuẩn hóa 100% icon thành hình tròn tỉ lệ 1:1, không méo mó trên mọi thiết bị.

## 3. CÔNG VIỆC TIẾP THEO & ĐIỀU CẦN CHÚ Ý
- Khi tiếp nhận bất kỳ yêu cầu mới nào từ người dùng, **bắt buộc tuân thủ `# SYSTEM ADDENDUM — ALWAYS-ON PROJECT MEMORY PROTOCOL`** được quy định trong `AGENTS.md`.
- Đọc lại `REQUIREMENTS.md` và `DECISIONS.md` trước khi thực hiện thay đổi để đảm bảo không làm mất hoặc phá vỡ các tính năng đã thống nhất.
