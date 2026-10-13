# PROJECT HANDOFF & CURRENT STATUS

## 1. THÔNG TIN PHIÊN BẢN & MÃ NGUỒN
- **Nhánh Git**: `main`
- **Commit mới nhất**: Chuẩn bị commit tính năng tích hợp toàn bộ chuyên mục bản tin VTV24.
- **Trạng thái Build**: Đã kiểm tra `npm run build` thành công 100% không có lỗi biên dịch (bundle xong trong 450ms).

## 2. CÁC TÍNH NĂNG VỪA HOÀN THIỆN
1. **Kéo Toàn Bộ Video & Phân Loại Bản Tin Kênh VTV24 Về Hệ Thống**:
   - **Tích hợp 28+ video bản tin thực tế từ kênh YouTube VTV24**: Trực tiếp từ ảnh chụp trang chủ kênh do người dùng cung cấp (`media_1791877485527_561c6e75.png`).
   - **Phân loại 4 Chuyên mục bản tin chính của VTV24**:
     + `🔥 Tin nóng 10 phút`: Bản tin 10 phút trên VTVgo (vụ hài cốt liệt sĩ, camera AI Hà Nội, khởi tố buôn lậu vàng, ngày Giải phóng Thủ đô, đất đai, dông lốc...).
     + `📰 Tổng hợp tin tức hàng ngày`: Bản tin thời sự toàn cảnh trưa & tối (Chủ tịch Quốc hội Trần Thanh Mẫn dự họp, triệt phá rửa tiền, thảm họa sạt lở ven biển, Tết Nguyên đán 7 ngày...).
     + `🌍 Thế giới toàn cảnh`: Bản tin quốc tế (Sân bay King Khalid, EU gỡ giám sát Việt Nam, bão Milton, Nga đàm phán hòa bình...).
     + `📊 Tin tức thời sự & Kinh tế`: Trái phiếu và lãi suất toàn cầu, Đường sắt Hà Nội - Lào Cai, Bản tin sáng, Houthi, bầu cử Mỹ...
     + `⚡ Shorts ngắn`: Các clip dọc cảnh báo lừa đảo, thị trường giá vàng...
   - **Hệ thống Lọc Chuyên Mục (Sub-Category Filter Chips)**:
     + Bổ sung dải nút lọc chuyên mục bản tin trực quan trên **Top Header (Row 3)** khi xem ở chế độ Toàn cảnh 16:9.
     + Bổ sung dải nút lọc chuyên mục bản tin bên trong **Playlist Drawer (Danh sách phát)**.
     + Khi người dùng bấm vào chuyên mục bất kỳ, danh sách phát tự động chuyển lọc theo chuyên mục đó và **bắt đầu chạy từ video mới nhất** (`currentIndex = 0`).
2. **Nâng Cấp Phím Tắt "F" & Cơ Chế Toàn Màn Hình Thật Sự (Fullscreen Cinema)**:
   - Tự động chuyển 16:9 Toàn Cảnh khi Fullscreen, tràn trọn vẹn màn hình 100vw x 100vh.
   - Hỗ trợ đầy đủ vendor prefixes của Web Fullscreen API và lắng nghe đa sự kiện `fullscreenchange`.
   - Phím `Escape` chỉ thoát chế độ Fullscreen, không đóng modal video đột ngột.
   - Nút Fullscreen `[⛶]` hiển thị trực quan ở cả 2 chế độ (dọc và ngang) trên Desktop/Tablet.
3. **Phân Loại 2 Luồng Media Rõ Rệt**:
   - `🎬 Video trên kênh` (16:9) vs `⚡ Video Shorts` (9:16) với hệ thống tab 3 chế độ.
4. **Mặc Định Mở Tiếng (Unmuted)**:
   - Video mở lên có âm thanh ngay (`isMuted: false`), toggling âm thanh tức thì qua postMessage 0ms.
5. **Chống Chồng Đè Header & Dải Kênh**:
   - Header gom vào 1 container `flex-col` duy nhất, khóa dải điều khiển mở rộng chỉ hiện khi `isLandscape = true`.
6. **Tương Tác Thực Tế & Kết Nối Tài Khoản Google / Gmail**:
   - Tự động nhận diện tài khoản Google, tương tác Like, Follow, Comment lưu bền vững vào `localStorage`.

## 3. CÔNG VIỆC TIẾP THEO & ĐIỀU CẦN CHÚ Ý
- Bắt buộc tuân thủ `# SYSTEM ADDENDUM — ALWAYS-ON PROJECT MEMORY PROTOCOL` trong `AGENTS.md`.
- Đảm bảo giữ vững tỉ lệ icon tròn 1:1 (`aspect-ratio: 1 / 1`), chặn click iframe ra ngoài YouTube và khử phụ đề dịch tự động.
