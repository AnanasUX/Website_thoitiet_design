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
4. **Trải Nghiệm Fullscreen Toàn Cảnh (True Fullscreen Cinema)**:
   - Toàn bộ khung Video Player chuyển sang chế độ **Fullscreen tràn viền 100vw x 100vh** (không còn viền bo ngoài, không còn khoảng trống hay ambient bao quanh khi xem 16:9).
   - Tích hợp nút Toàn Màn Hình Trình Duyệt `[⛶ Fullscreen]` (phím tắt `F` hoặc F11) hỗ trợ chuyển sang chế độ borderless toàn màn hình sạch sẽ.
5. **Danh Sách Phát Hiển Thị TRỰC TIẾP TRÊN VIDEO (On-Video Playlist Overlay)**:
   - Loại bỏ hoàn toàn sidebar cứng bên ngoài gây chèn ép video.
   - Danh sách video chuyển thành **Overlay kính mờ (Frosted Glass Drawer) hiển thị TRÊN video** (`z-40`, trượt từ cạnh phải sang). Video vẫn tiếp tục phát toàn màn hình bên dưới.
   - Khi đóng danh sách (bấm nút `✕`, click vùng mờ bên trái, phím `Esc`, `L`, `P`), video đạt 100% không gian hiển thị không một gợn cản trở.
   - Tích hợp bộ lọc định dạng (`📺 Tất cả`, `🎬 Video kênh`, `⚡ Shorts`) và dải chọn kênh nhanh ngay trong danh sách phát.
6. **Xử Lý Lại Toàn Diện Giao Diện (UI/UX Refinement)**:
   - Header Bar trên cùng: Brand `Anx. TV`, nút chọn kênh EPG `[🔴 CH 01 • VTV24 ▾]`, dải phân tab media đặt ở trung tâm, nút `[📋 Danh sách (${playlist.length})]`, `[🖥️ 16:9 / 📱 9:16]`, `[🔊 / 🔇]`, `[⛶]`, `[✕]`.
   - Right Actions: Nút Thích, Bình luận, Chia sẻ và nút mở nhanh Danh sách phát chuẩn tỉ lệ tròn 1:1.
   - Tự động ẩn controls sau 5 giây không thao tác để giữ trải nghiệm rạp chiếu phim tối đa.

## 3. CÔNG VIỆC TIẾP THEO & ĐIỀU CẦN CHÚ Ý
- Khi tiếp nhận bất kỳ yêu cầu mới nào từ người dùng, **bắt buộc tuân thủ `# SYSTEM ADDENDUM — ALWAYS-ON PROJECT MEMORY PROTOCOL`** được quy định trong `AGENTS.md`.
- Đọc lại `REQUIREMENTS.md` và `DECISIONS.md` trước khi thực hiện thay đổi để đảm bảo không làm mất hoặc phá vỡ các tính năng đã thống nhất.
