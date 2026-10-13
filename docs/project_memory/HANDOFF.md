# PROJECT HANDOFF & CURRENT STATUS

## 1. THÔNG TIN PHIÊN BẢN & MÃ NGUỒN
- **Nhánh Git**: `main`
- **Commit mới nhất**: Chuẩn bị commit tính năng Fullscreen phím F.
- **Trạng thái Build**: Đã kiểm tra `npm run build` thành công 100% không có lỗi biên dịch (bundle xong trong 457ms).

## 2. CÁC TÍNH NĂNG VỪA HOÀN THIỆN
1. **Nâng Cấp Phím Tắt "F" & Cơ Chế Toàn Màn Hình Thật Sự (Fullscreen Cinema)**:
   - **Tự động chuyển 16:9 Toàn Cảnh khi Fullscreen**: Khi người dùng bấm `F` (hoặc click nút `[⛶]` trên Header), hệ thống tự động kích hoạt `setIsLandscape(true)` và `setIsFullscreen(true)`, giải phóng khung video bung trọn 100% màn hình máy tính (100vw x 100vh), loại bỏ hoàn toàn viền bo tròn trắng và kích thước dọc hẹp 9:16 ở giữa màn hình.
   - **Tương thích toàn diện Web Fullscreen API**: Hỗ trợ đầy đủ các vendor prefixes: `requestFullscreen`, `webkitRequestFullscreen`, `mozRequestFullScreen`, `msRequestFullscreen` và `exitFullscreen`, `webkitExitFullscreen`,...
   - **Lắng nghe đa sự kiện `fullscreenchange`**: Bắt chính xác sự kiện thay đổi trạng thái fullscreen (`fullscreenchange`, `webkitfullscreenchange`, `mozfullscreenchange`, `MSFullscreenChange`) để đồng bộ UI chuẩn xác.
   - **Xử lý phím Escape thông minh**: Khi đang ở chế độ Fullscreen, nếu người dùng bấm `Escape`, hệ thống chỉ thoát Fullscreen và giữ nguyên modal video đang phát, không làm tắt văng modal ra ngoài.
   - **Nút Fullscreen [⛶] luôn khả dụng trên Desktop/Tablet**: Bỏ điều kiện ràng buộc `isLandscape`, cho phép nút Toàn Màn Hình xuất hiện trên Header ở mọi chế độ để người dùng có thể nhấp chuột trực tiếp ngoài phím F.
2. **Khắc Phục Tốc Độ & Tối Ưu Chuyển Clip**:
   - Loại bỏ cơ chế reload iframe khi bật/tắt tiếng: Toggling âm thanh tức thì qua postMessage `unMute`/`mute` 0ms.
   - Sửa key iframe thành `currentShort.youtubeId`, không chớp nháy và không bị tải lại không cần thiết.
3. **Mặc Định Bật Tiếng (Unmuted)**:
   - Đặt `isMuted = false` theo đúng yêu cầu: Video mở lên có âm thanh ngay.
4. **Phân Loại 2 Luồng Media Rõ Rệt**:
   - `🎬 Video trên kênh`: Các bản tin, phóng sự dài 16:9 từ trang chủ của kênh.
   - `⚡ Video Shorts`: Các video dạng ngắn dọc 9:16 trong danh sách phát Shorts của YouTube của các đài.
   - Hệ thống tab lọc 3 chế độ: `📺 Tất cả`, `🎬 Video trên kênh`, `⚡ Shorts ngắn`.
5. **Sửa Triệt Để Lỗi Chồng Đè Header & Dải Kênh trên Shorts (Ảnh 2 & Ảnh mới)**:
   - Thay thế kiến trúc đa div bằng **MỘT container flex-col duy nhất**.
   - Khóa chặt việc hiển thị các tab phân loại trung tâm và dải Quick TV Channel pills chỉ khi `isLandscape = true`.
   - Ở chế độ Dọc Shorts 9:16 (`!isLandscape`), header duy trì đúng 1 dòng sạch sẽ.
   - Loại bỏ 100% thanh cuộn ngang xám xịt bằng bộ CSS ẩn scrollbar đa nền tảng.
6. **Sửa Triệt Để Lỗi Lệch Thẻ trong "DANH SÁCH KÊNH TRUYỀN HÌNH" (Ảnh 1)**:
   - Đồng nhất chiều cao thẻ card `min-h-[135px]` và tagline `min-h-[32px] line-clamp-2`.
7. **Mở Rộng Cơ Sở Dữ Liệu Video Đa Kênh**:
   - Bổ sung hơn 50+ video và shorts chân thực, chất lượng cao từ 8 đài chính thống.
8. **Tương Tác Thực Tế & Kết Nối Tài Khoản Google / Gmail**:
   - Tự động nhận diện tài khoản Google đã đăng nhập (`userRole` / `user_auth`).
   - Thích video, Đăng ký theo dõi kênh, Bình luận thực tế lưu trữ bền vững trong `localStorage`.

## 3. CÔNG VIỆC TIẾP THEO & ĐIỀU CẦN CHÚ Ý
- Bắt buộc tuân thủ `# SYSTEM ADDENDUM — ALWAYS-ON PROJECT MEMORY PROTOCOL` trong `AGENTS.md`.
- Đảm bảo giữ vững tỉ lệ icon tròn 1:1 (`aspect-ratio: 1 / 1`), chặn click iframe ra ngoài YouTube và khử phụ đề dịch tự động.
