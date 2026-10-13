# PROJECT HANDOFF & CURRENT STATUS

## 1. THÔNG TIN PHIÊN BẢN & MÃ NGUỒN
- **Nhánh Git**: `main`
- **Commit gần nhất**: `264d884 (docs: establish always-on project memory protocol in AGENTS.md and initialize docs/project_memory)`
- **Trạng thái Build**: Đã kiểm tra `npm run build` thành công 100% không có lỗi biên dịch.

## 2. CÁC TÍNH NĂNG VỪA HOÀN THIỆN
1. **Menu Chọn Kênh TV (Smart TV EPG Channel Guide)**:
   - Danh sách 8 kênh truyền hình báo chí chính thống (`CH 00` -> `CH 08`).
   - Khi chọn một kênh (ví dụ: VTV24), player chỉ phát video của kênh đó và bắt đầu từ video mới nhất.
   - Thêm dải chọn nhanh kênh (Quick TV Channel Pills) và hỗ trợ phím tắt `C` để mở menu kênh TV.
2. **Bộ Lọc Phân Tab Media**:
   - Tích hợp 3 tab: `Tất cả`, `🎬 Video trên kênh` (bản tin, phóng sự 16:9), `⚡ Shorts ngắn` (9:16).
3. **Tự động ẩn Controls sau 5s & Chặn YouTube Redirect**:
   - Controls tự động ẩn sau 5s khi xem video, chạm vào thì hiện lại.
   - Khi chuyển video không làm lộ controls ẩn.
   - Chặn tuyệt đối nút nhảy trang sang YouTube; triệt tiêu phụ đề dịch tự động và skip quảng cáo.
   - Chuẩn hóa 100% icon thành hình tròn tỉ lệ 1:1, không méo mó trên mọi thiết bị.

## 3. CÔNG VIỆC TIẾP THEO & ĐIỀU CẦN CHÚ Ý
- Khi tiếp nhận bất kỳ yêu cầu mới nào từ người dùng, **bắt buộc tuân thủ `# SYSTEM ADDENDUM — ALWAYS-ON PROJECT MEMORY PROTOCOL`** được quy định trong `AGENTS.md`.
- Đọc lại `REQUIREMENTS.md` và `DECISIONS.md` trước khi thực hiện thay đổi để đảm bảo không làm mất hoặc phá vỡ các tính năng đã thống nhất.
