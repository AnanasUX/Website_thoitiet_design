import re

with open("README.md", "r", encoding="utf-8") as f:
    content = f.read()

# I will just append a sub-item to the UI/UX section of the 30/09/2026 updates.
# Section 3 is: ### 3. Tối ưu Giao diện & Trải nghiệm (UI/UX)
new_bullet = "- Chuẩn hóa hiển thị nguồn tin tức: Tự động phân tách tên tòa soạn và tên chuyên mục bằng dấu chấm tròn (ví dụ: `VnExpress • Giáo dục`, `Dân Trí • Sức mạnh số`) giúp giao diện thẻ bài viết gọn gàng và dễ đọc hơn.\n"

# Let's insert it before the empty line that follows the UI/UX section, or at the end of the file.
content = content.replace(
    "- Cấu hình Fallback an toàn: Khi API Giá Vàng lỗi hoặc bị chặn, hệ thống tự động đổ dữ liệu dự phòng (static data) nhằm tránh hiện tượng ẩn toàn bộ khối (layout shift).",
    "- Cấu hình Fallback an toàn: Khi API Giá Vàng lỗi hoặc bị chặn, hệ thống tự động đổ dữ liệu dự phòng (static data) nhằm tránh hiện tượng ẩn toàn bộ khối (layout shift).\n" + new_bullet
)

with open("README.md", "w", encoding="utf-8") as f:
    f.write(content)

print("Updated README.md")