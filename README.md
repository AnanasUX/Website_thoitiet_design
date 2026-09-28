# Website Thời Tiết Design

## Tổng quan
Dự án web thời tiết xây dựng bằng React, Vite và Tailwind CSS. Theo dõi thời tiết thời gian thực, tin tức và chất lượng không khí.

## Chức năng định vị (Geolocation) & Dữ liệu

Hệ thống định vị được thiết kế với độ chính xác cao và nhiều tầng dự phòng (fallback) để đảm bảo luôn lấy được dữ liệu đúng:

1. **Định vị GPS độ chính xác cao (Ưu tiên 1):** Sử dụng 
avigator.geolocation với tuỳ chọn enableHighAccuracy: true. Yêu cầu thiết bị có hỗ trợ và truy cập qua HTTPS.
2. **Dự phòng IP (Ưu tiên 2):** Nếu người dùng từ chối quyền hoặc truy cập qua HTTP (bị trình duyệt chặn GPS), hệ thống tự động gọi API ipapi.co để ước lượng vị trí thông qua mạng di động/Wi-Fi.
3. **Dịch ngược toạ độ thông minh (Reverse Geocoding):** Sử dụng API của BigDataCloud. Hệ thống xử lý đặc biệt mảng localityInfo.administrative để tìm ra đơn vị hành chính cấp 6 (Phường/Xã) chính xác nhất, tránh các lỗi nhận diện sai vùng giáp ranh (ví dụ: Đại Mỗ vs Thanh Xuân). Cắt bỏ các hậu tố thừa như (phường) hoặc (xã) để hiển thị UI sạch sẽ.
4. **Fallback cuối cùng:** Vị trí tĩnh được gán sẵn (Hà Đông District) nếu toàn bộ mạng và định vị lỗi.

## Luồng xử lý dữ liệu
1. Lấy toạ độ (GPS/IP).
2. Dịch ngược toạ độ sang tên Phường/Thành phố.
3. Gọi API OpenWeatherMap (Thời tiết, Dự báo, Chất lượng không khí, UV).
4. Cập nhật giao diện.
