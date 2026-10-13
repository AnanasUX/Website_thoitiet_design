# PROJECT HANDOFF & CURRENT STATUS

## 1. THÔNG TIN PHIÊN BẢN & MÃ NGUỒN
- **Nhánh Git**: `main`
- **Commit gần nhất**: Chuẩn bị commit với các cải tiến toàn diện về hiệu năng, UI và tính năng tương tác thực tế.
- **Trạng thái Build**: Đã kiểm tra `npm run build` thành công 100% không có lỗi biên dịch (bundle xong trong 1.72s).

## 2. CÁC TÍNH NĂNG VỪA HOÀN THIỆN
1. **Khắc Phục Tốc Độ & Tối Ưu Chuyển Clip**:
   - Loại bỏ cơ chế reload iframe khi bật/tắt tiếng: Toggling âm thanh tức thì qua postMessage `unMute`/`mute` 0ms.
   - Sửa key iframe thành `currentShort.youtubeId`, không chớp nháy và không bị tải lại không cần thiết.
2. **Mặc Định Bật Tiếng (Unmuted)**:
   - Đặt `isMuted = false` theo đúng yêu cầu: Video mở lên có âm thanh ngay.
3. **Phân Loại 2 Luồng Media Rõ Rệt**:
   - `🎬 Video trên kênh`: Các bản tin, phóng sự dài 16:9 từ trang chủ của kênh.
   - `⚡ Video Shorts`: Các video dạng ngắn dọc 9:16 trong danh sách phát Shorts của YouTube của các đài.
   - Hệ thống tab lọc 3 chế độ: `📺 Tất cả`, `🎬 Video trên kênh`, `⚡ Shorts ngắn`.
4. **Sửa Triệt Để Lỗi UI Header & Dải Kênh trên Shorts (Ảnh 2)**:
   - Thiết kế lại Header responsive: Trên mobile chỉ giữ lại Logo, Badge kênh, nút tỉ lệ, nút playlist, nút âm thanh và nút đóng.
   - Ẩn dải Quick Channel top-14 trên màn hình hẹp/dọc (`hidden lg:flex`), chỉ hiển thị trên màn hình rộng PC.
   - Loại bỏ 100% thanh cuộn ngang xám xịt bằng bộ CSS ẩn scrollbar đa nền tảng.
5. **Sửa Triệt Để Lỗi Lệch Thẻ trong "DANH SÁCH KÊNH TRUYỀN HÌNH" (Ảnh 1)**:
   - Đồng nhất chiều cao thẻ card `min-h-[135px]` và phần tagline `min-h-[32px] line-clamp-2`.
   - Các hàng thẻ và nút hành động dưới đáy luôn thẳng hàng 100% trên mọi độ phân giải.
6. **Mở Rộng Cơ Sở Dữ Liệu Video Đa Kênh**:
   - Bổ sung hơn 50+ video và shorts chân thực, chất lượng cao từ 8 đài: VTV24, Báo Tiền Phong, Báo Thanh Niên, Báo Tuổi Trẻ, VTC NOW, Báo Lao Động, VTV Thời Tiết, Bản Tin Trang.
7. **Tương Tác Thực Tế & Kết Nối Tài Khoản Google / Gmail**:
   - Tự động nhận diện tài khoản Google đã đăng nhập (`userRole` / `user_auth`).
   - Thích video, Đăng ký theo dõi kênh, Bình luận thực tế với Avatar thật và Tên thật của tài khoản Google.
   - Lưu trữ bền vững dữ liệu tương tác trong `localStorage` theo từng người dùng.

## 3. CÔNG VIỆC TIẾP THEO & ĐIỀU CẦN CHÚ Ý
- Bắt buộc tuân thủ `# SYSTEM ADDENDUM — ALWAYS-ON PROJECT MEMORY PROTOCOL` trong `AGENTS.md`.
- Đảm bảo giữ vững tỉ lệ icon tròn 1:1 (`aspect-ratio: 1 / 1`), chặn click iframe ra ngoài YouTube và khử phụ đề dịch tự động.
