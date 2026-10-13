# PROJECT REQUIREMENTS & SPECIFICATIONS

## 1. TỔNG QUAN HỆ THỐNG
Dự án Web Ứng Dụng Thời Tiết, Thị Trường & Bản Tin Thời Sự Đa Kênh (Weather & News Web App).
Ứng dụng kết hợp tính năng dự báo thời tiết trực quan, bảng giá thị trường (vàng, tỷ giá, dầu, uvi) và trung tâm bản tin video tin tức với trải nghiệm Shorts / TV hiện đại.

---

## 2. QUY CHUẨN TRÌNH PHÁT VIDEO SHORTS & BẢN TIN TRANG (`VideoShortsModal.tsx`)

### 2.1. Giao diện & Hiển thị trên mọi nền tảng
- **Đa thiết bị (Mobile, Tablet, Desktop)**:
  - **Trải nghiệm Fullscreen Cinema Toàn Màn Hình**: Trình phát chiếm trọn 100% diện tích hiển thị (100vw x 100vh), không viền bo ngoài, không ambient bao quanh khi ở chế độ 16:9.
  - Hỗ trợ xem dạng dọc chuẩn Shorts (9:16) và chế độ quay ngang toàn cảnh (16:9), tự động ưu tiên 16:9 trên PC/Desktop.
  - Tích hợp nút Toàn Màn Hình Trình Duyệt `[⛶ Fullscreen]` (phím tắt `F` hoặc F11).
  - **Danh sách phát hiển thị TRÊN VIDEO (On-Video Playlist Overlay)**: Không dùng sidebar bên ngoài đẩy video. Danh sách hiển thị dưới dạng drawer kính mờ trượt ra trên video (`z-40`), có thể bật/tắt tự do bằng nút `[📋 Danh sách]` hoặc phím `L`/`P`.
  - Cung cấp nút chuyển đổi trực quan `[🖥️ 16:9 Toàn cảnh]` / `[📱 9:16 Dọc]` (phím tắt `R`).
  - Tuyệt đối không bị vỡ bố cục trên Tablet (kể cả khi cầm đứng hay xoay ngang).
- **Quy chuẩn Icon & Nút tương tác (Bắt buộc không được vi phạm)**:
  - Tất cả icon tròn (avatar, like, comment, share, chuông, âm lượng, đóng, menu) phải có tỉ lệ chính xác 1:1 (`aspect-ratio: 1 / 1`).
  - Phải có kích thước cố định bằng inline styles (`width`, `height`, `minWidth`, `minHeight`, `maxWidth`, `maxHeight`, `borderRadius: 50%`) để không bị méo, bẹp hay kéo dài trên mọi thiết bị và trình duyệt.
- **Màu sắc Hashtags & Nhãn**:
  - Viết thường (#shorts, #tintuc24h, #thoisu).
  - Màu chữ: `font-color: #000000`, nền sáng bán trong suốt (`bg-white/90`), thanh lịch và không gây rối mắt.
- **Logo & Thương hiệu**:
  - Sử dụng avatar / logo chuẩn của trang hoặc logo kênh thay cho chữ viết tắt placeholder.

### 2.2. Trải nghiệm xem & Hành vi tương tác (UX Behaviors)
- **Cơ chế Tự động ẩn Controls sau 5 giây**:
  - Khi người dùng đang xem video mà không có tương tác, sau đúng 5 giây, toàn bộ thanh công cụ, icon, tiêu đề và hashtags tự động ẩn đi.
  - Chỉ duy trì hiển thị biểu tượng thương hiệu `Anx. Shorts` và thông tin kênh/logo để giữ khung hình thoáng đãng tối đa.
  - Khi người dùng chạm vào màn hình (click, tap, gõ phím), toàn bộ thông tin lập tức xuất hiện trở lại và đếm lùi lại 5 giây.
- **Chuyển video không làm lộ controls ẩn**:
  - Khi cuộn chuyển video (lăn chuột, vuốt chạm hoặc tự động chuyển), các nút và nội dung ẩn không được tự động bật lên, trừ khi người dùng chủ động chạm/tương tác.
- **Tự động chuyển tiếp khi hết video**:
  - Khi video kết thúc (`onStateChange = 0` hoặc hết thời lượng), hệ thống tự động lướt reel cuộn dọc sang video kế tiếp trong playlist.
- **Chặn nhảy trang sang YouTube & Bảo mật trải nghiệm**:
  - Ẩn toàn bộ nút mở ngoài, nút chia sẻ ngoài và icon YouTube.
  - Lớp overlay trong suốt `z-10` hứng toàn bộ click/tap trên video, ngăn chặn tuyệt đối việc người dùng bấm vào iframe dẫn đến chuyển trang sang YouTube ngoài ý muốn.
  - Triệt tiêu phụ đề tự động dịch (`cc_load_policy=0`) và tự động bỏ qua / skip quảng cáo của YouTube.

### 2.3. Hệ Thống Phân Loại Kênh Phong Cách Tivi (Smart TV EPG Guide)
- **Menu Chọn Kênh TV**:
  - Cung cấp menu chọn kênh trực quan chuẩn EPG với số hiệu kênh:
    - `CH 00`: Tất Cả Kênh (TỔNG HỢP)
    - `CH 01`: VTV24 (Chuyển động 24h & Thời sự nóng)
    - `CH 02`: Báo Tiền Phong (Tiền Phong TV)
    - `CH 03`: Báo Thanh Niên (Thanh Niên TV)
    - `CH 04`: Báo Tuổi Trẻ (Tuổi Trẻ TV)
    - `CH 05`: VTC NOW (Kỹ thuật số VTC)
    - `CH 06`: Báo Lao Động (Lao Động TV)
    - `CH 07`: VTV Thời Tiết (Thời Tiết TV)
    - `CH 08`: Bản Tin Trang (Tin tức nội bộ website)
- **Phát từ Video Mới Nhất**:
  - Khi người dùng chọn một kênh (ví dụ: `VTV24`), danh sách phát CHỈ phát video của kênh đó.
  - Luôn luôn bắt đầu phát từ **video mới nhất trên kênh** (`currentIndex = 0`).
  - Sắp xếp video theo thời gian xuất bản giảm dần (`publishedAt` mới nhất lên trước).
- **Nguồn video đa dạng (Video trên kênh & Shorts)**:
  - Lấy video tin tức, phóng sự trên kênh kết hợp video ngắn.
  - Hỗ trợ phân tab định dạng:
    - `📺 Tất cả`: Toàn bộ nội dung của kênh.
    - `🎬 Video trên kênh`: Lọc video tin tức, phóng sự dài 16:9.
    - `⚡ Shorts ngắn`: Lọc video ngắn dạng dọc 9:16.
- **Phím tắt điều khiển TV**:
  - `C`: Bật/Tắt Menu Kênh Truyền Hình.
  - `↑` / `↓` hoặc Lăn chuột: Chuyển clip.
  - `M`: Bật/Tắt âm thanh.
  - `R`: Quay ngang màn hình (16:9).
  - `Esc`: Đóng menu hoặc đóng modal.

---

## 3. TIÊU CHÍ NGHIỆM THU (ACCEPTANCE CRITERIA)
1. Video Shorts phát mượt, tự động chuyển clip khi hết mà không bị dừng hình.
2. Không chuyển hướng người dùng sang youtube.com dưới bất kỳ hình thức nào.
3. Không bị vỡ bố cục trên mọi kích thước màn hình (Mobile, Tablet dọc, Tablet ngang, PC).
4. Menu kênh TV hoạt động chính xác: chọn kênh là chỉ phát video của kênh đó và bắt đầu từ video mới nhất.
5. Sau 5 giây không thao tác thì controls tự ẩn; chạm lại thì hiện lại.
