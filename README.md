# Website Thời Tiết Design

## Tổng quan
Dự án web thời tiết xây dựng bằng React, Vite và Tailwind CSS. Theo dõi thời tiết thời gian thực, tin tức và chất lượng không khí.

## Nâng cấp luồng xử lý chức năng định vị (Geolocation) & Chống sai lệch dữ liệu vùng giáp ranh

Để đảm bảo ứng dụng luôn lấy và hiển thị đúng dữ liệu vị trí trên mọi thiết bị (PC, Mobile), hệ thống được thiết kế với 4 luồng ưu tiên xử lý dữ liệu (Fallback) để tránh sai logic hiển thị:

1. Ưu tiên 1: Lấy tọa độ GPS độ chính xác cao
- Sử dụng API navigator.geolocation với cờ enableHighAccuracy: true và timeout: 15000.
- Giúp ép thiết bị di động sử dụng chip GPS phần cứng để lấy tọa độ vật lý chính xác nhất thay vì dựa vào trạm phát sóng di động (BTS) vốn có độ sai số cao.
- Lưu ý: Bắt buộc chạy trên môi trường HTTPS.

2. Ưu tiên 2: Dự phòng định vị qua IP mạng
- Áp dụng khi trình duyệt từ chối quyền truy cập GPS (hoặc khi user test qua môi trường HTTP/Local).
- Hệ thống tự động kích hoạt lời gọi đến API ipapi.co để ước lượng vị trí hiện tại thông qua địa chỉ IP 4G/Wi-Fi.

3. Ưu tiên 3: Dịch ngược tọa độ thông minh (Xử lý lỗi ranh giới)
- Tọa độ (Lat/Lon) được gửi cho API BigDataCloud để lấy tên địa phương.
- Xử lý ngoại lệ vùng giáp ranh (Ví dụ: Tòa Viwaseen Tower nằm giữa Đại Mỗ và Thanh Xuân): Thay vì lấy trường locality mặc định của API (thường bị sai lệch khi ở biên), hệ thống sẽ can thiệp thẳng vào mảng localityInfo.administrative.
- Tiến hành bóc tách và ưu tiên chọn đơn vị hành chính Cấp 6 (adminLevel: 6 - Phường/Xã) chi tiết nhất. Sau đó dùng Regex (replace) để xóa bỏ các hậu tố dư thừa như (phường), (xã), trả về một chuỗi địa danh sạch sẽ và chính xác tuyệt đối.

4. Ưu tiên 4: Dữ liệu tĩnh (Fallback cuối)
- Nếu toàn bộ các API định vị hoặc kết nối mạng đều thất bại, hệ thống rơi về giá trị tĩnh Hà Đông District, VN nhằm đảm bảo ứng dụng luôn có dữ liệu để hiển thị và không bị crash luồng tiếp theo.

## Luồng xử lý dữ liệu
1. Lấy toạ độ (GPS/IP).
2. Dịch ngược toạ độ sang tên Phường/Thành phố.
3. Gọi API OpenWeatherMap (Thời tiết, Dự báo, Chất lượng không khí, UV).
4. Cập nhật giao diện.


## Các tính năng vừa được bổ sung (Bản cập nhật 28/09/2026)

### 1. Phân tích Cảnh Báo & Gợi Ý Lịch Trình Động (Dynamic Real-time Warnings)
- Khối "Cảnh Báo Trọng Tâm" và "Gợi Ý Lịch Trình" không còn dùng văn bản tĩnh. 
- Hệ thống tự động phân tích các chỉ số thời tiết thực tế ngay lúc đó (UV, Nhiệt độ, Mưa, Gió, PM2.5, Tầm nhìn) để sinh ra các cảnh báo tương ứng (Ví dụ: UV > 8 sẽ khuyên mang kính râm, Gió > 30km/h sẽ cảnh báo gió giật).
- Giao diện (UI) sử dụng cấu trúc Tree (nhánh cây `├` và `└`) chuẩn xác như thiết kế.

### 2. Dự báo hàng giờ 1-Tiếng/Lần (Hourly Forecast Interpolation)
- API miễn phí của OpenWeatherMap chỉ hỗ trợ 3-tiếng/lần.
- Hệ thống đã tích hợp thuật toán **Nội suy Tuyến tính (Linear Interpolation)** để chia nhỏ và tính toán mượt mà nhiệt độ, tỷ lệ mưa và icon cho **từng khoảng 1 tiếng một**, kéo dài suốt 24 giờ. Giúp trải nghiệm ngang ngửa gói API OneCall cao cấp.

### 3. Hệ thống Typography & Layout (Tích hợp SF Pro Display)
- **Cập nhật Font chữ:** Đã tải và trích xuất bộ font **SF Pro Display** (chuẩn Apple) và tải cục bộ (`/public/fonts/SFProDisplay`), loại bỏ hoàn toàn font Inter tĩnh.
- **Fluid Typography:** Sử dụng CSS Variables với `clamp()` (VD: `--font-h2: clamp(23px, 2vw, 32px)`) để font chữ tự động co giãn theo màn hình mượt mà.
- **Grid Layout PC:** Khay tin tức trên Desktop đã được chuyển từ `flex` (ép 2 cột) sang CSS Grid hiện đại (`grid-template-columns: repeat(auto-fit, minmax(280px, 1fr))`), cho phép tự động dàn 3 cột hiển thị tuyệt đẹp trên PC.
- **Boxed Layout:** Bọc toàn bộ khung nội dung bằng cấu trúc `width: min(100% - 32px, 1200px); margin-inline: auto;` giúp giao diện không bị bè ngang khi mở ở màn hình lớn.

### 4. Xử lý Trùng lặp & Bộ lọc Tin Tức Hôm Nay (News Feed Opt)
- Cấu trúc lại luồng Infinite Scroll: Lấy toàn bộ bài viết, lọc trùng lặp qua hàm `getUniqueKey` triệt để và gán vào mảng lưu trữ tạm, mỗi lần cuộn chỉ lấy đúng 10 bài mới chưa từng hiển thị.
- Cache-busting (`rnd=...`) để bỏ qua bộ đệm server RSS.
- Áp dụng hàm `isToday` phân tích mốc `pubDate` để chỉ hiển thị các tin tức thuộc lịch ngày hôm nay.
