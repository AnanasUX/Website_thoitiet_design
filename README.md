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
