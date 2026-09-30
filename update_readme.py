import os

new_content = """
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
"""

with open("README.md", "a", encoding="utf-8") as f:
    f.write(new_content)

print("Appended updates to README.md")