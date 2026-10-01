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

## Các tính năng vừa được bổ sung (Bản cập nhật 30/09/2026)

### 1. Biểu đồ Vàng Thực tế (Live Gold Chart & XAU/USD)
- Nguồn dữ liệu thực tế 100% được đồng bộ từ **Yahoo Finance (XAU/USD)**, quy đổi tỷ giá chính xác về VNĐ/Lượng khớp với giá bán ra của Vàng SJC.
- Tích hợp **Tooltip thông minh** hiển thị song song hai đường Dữ liệu Thực tế và Dữ liệu Dự báo giúp dễ dàng đối chiếu.
- Các chỉ số High/Low, Suy Giảm/Tăng Trưởng được tính toán và neo chặt vào giá trị giao dịch thực tế đã xảy ra trên trục Intra-day thời gian thực.

### 2. Tự động cập nhật ngầm (Auto-polling Real-time)
- Thiết lập cơ chế tải dữ liệu hoàn toàn độc lập cho từng khu vực, không cần tải lại trang (F5):
  - **Giá vàng & Biểu đồ**: Tự động quét lấy giá mới nhất mỗi **2 phút/lần**.
  - **Tin tức**: Tự động lấy các bài báo mới nhất mỗi **2 phút/lần** (kèm Skeleton Loading cục bộ).
  - **Thời tiết**: Làm mới số liệu và dự báo mỗi **5 phút/lần**.

### 3. Tối ưu Giao diện & Trải nghiệm (UI/UX)
- Đồng nhất toàn bộ kích thước các Tiêu đề chính (Giá vàng Phú Quý, Thời tiết, Tin tức, Tin Tức Mới Nhất) về đúng chuẩn **18px** trên tất cả nền tảng (PC, Tablet, Mobile) tạo sự cân đối.
- Tinh chỉnh Responsive khắt khe cho Mobile ở Khung Giá Vàng: ép khung lưới 3 cột hiển thị toàn bộ 100% không cần thanh cuộn ngang bằng cách tối ưu padding và giảm tỷ lệ font chữ số liệu phụ.
- Tích hợp **Skeleton Loading** cục bộ khi tải API thay vì chặn màn hình (Blocking Loading).
- Khắc phục lỗi CORS/Cloudflare của Logo nhà mạng Dân Trí, đảm bảo Favicon luôn hiển thị chuẩn.
- Cấu hình Fallback an toàn: Khi API Giá Vàng lỗi hoặc bị chặn, hệ thống tự động đổ dữ liệu dự phòng (static data) nhằm tránh hiện tượng ẩn toàn bộ khối (layout shift).
- Chuẩn hóa hiển thị nguồn tin tức: Tự động phân tách tên tòa soạn và tên chuyên mục bằng dấu chấm tròn (ví dụ: `VnExpress • Giáo dục`, `Dân Trí • Sức mạnh số`) giúp giao diện thẻ bài viết gọn gàng và dễ đọc hơn.


## Bản cập nhật 01/10/2026 (Đồng bộ Dữ liệu Giá Vàng Thực Tế)

### 1. Đồng bộ & Sửa lỗi chênh lệch Giá Vàng (PhuQuyGroup)
- Khắc phục triệt để tình trạng lỗi lệch giá hiển thị trên website so với giá thực tế của trang chủ **Phú Quý Group**.
- Nguyên nhân: Hệ thống Tường lửa (Cloudflare WAF) của máy chủ Phú Quý tự động chặn các luồng request từ các máy chủ Proxy công cộng (như \llorigins\), dẫn đến API bị Timeout (HTTP 522/408). Khi đó, website bị ép rơi vào nhánh \catch\ và sử dụng số liệu dự phòng (static fallback data) lỗi thời.
- Giải pháp tạm thời: Cập nhật thủ công 100% dữ liệu dự phòng tĩnh để khớp tuyệt đối với giá trị giao dịch của ngày hiện tại ở cả 3 khối (24K, NPQ, SJC).

### 2. Kế hoạch Triển khai Backend Độc lập (Cloudflare Worker)
- Để đảm bảo tính Real-time vĩnh viễn không phụ thuộc vào việc cập nhật code thủ công, dự án đã được tích hợp bộ mã nguồn mở rộng chuẩn bị sẵn cho **Cloudflare Worker**.
- Nằm trong thư mục \/cloudflare-worker/worker.js\, luồng xử lý Backend này giúp giả lập Header trình duyệt để vượt mặt tường lửa Edge-to-Edge của Cloudflare.
- Tại file \App.tsx\, biến môi trường \WORKER_URL\ đã được cấu hình sẵn. Chỉ cần deploy Worker và dán link vào biến này, cơ chế Auto-polling của ứng dụng React sẽ tự động kết nối và lấy giá mới nhất từ Phú Quý mà không bị CORS chặn hay báo lỗi 403 Forbidden.
