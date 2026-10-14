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
  - **Tích hợp nút Toàn Màn Hình Trình Duyệt `[⛶ Fullscreen]` (phím tắt `F` hoặc F11)**:
    - Khi bấm `F` hoặc click nút `[⛶]`: Hệ thống lập tức kích hoạt Fullscreen trình duyệt và tự động bung chế độ Toàn Cảnh 16:9 Cinema (`isLandscape = true`), tràn trọn vẹn 100% màn hình thiết bị (100vw x 100vh), loại bỏ mọi viền bo cong và dải đen thừa thãi.
    - Nút Fullscreen `[⛶]` hiển thị trực quan trên Header ở mọi chế độ hiển thị trên Desktop và Tablet (`hidden sm:flex`).
    - Khi bấm `Escape` trong trạng thái Fullscreen: chỉ thoát chế độ Fullscreen, tuyệt đối không đóng modal video đột ngột.
  - **Danh sách phát hiển thị TRỰC TIẾP TRÊN VIDEO (On-Video Playlist Overlay)**: Không dùng sidebar bên ngoài đẩy video. Danh sách hiển thị dưới dạng drawer kính mờ trượt ra trên video (`z-40`), có thể bật/tắt tự do bằng nút `[📋 Danh sách]` hoặc phím `L`/`P`.
  - Cung cấp nút chuyển đổi trực quan `[🖥️ 16:9 Toàn cảnh]` / `[📱 9:16 Dọc]` (phím tắt `R`).
  - Tuyệt đối không bị vỡ bố cục trên Tablet (kể cả khi cầm đứng hay xoay ngang).
- **Quy chuẩn Header & Chống Đè Nút trên Shorts (Ảnh 2 & Ảnh mới - Đã khắc phục triệt để)**:
  - Header bar tinh gọn, được cấu trúc trong MỘT container `flex-col` duy nhất:
    - *Khung dọc Shorts 9:16 (`!isLandscape`)*:
      + **Trên Mobile (< 640px)**: Header tối giản tuyệt đối, chỉ có 2 cụm: Bên trái (Logo `Anx. TV` + Nút Kênh `[🔴 CH 01 • VTV24 ▾]`) và Bên phải (Nút Âm thanh `[🔊]` + Nút Đóng `[✕]`). Loại bỏ hoàn toàn các nút xoay 16:9, nút playlist trên header, nút fullscreen và nút TV guide để chống đè nút 100%.
      + **Trên Tablet & PC (>= 640px)**: Hiển thị thêm Nút Tỉ lệ `[16:9/9:16]`, Nút Playlist `[📋 Danh sách]`, Nút Fullscreen `[⛶]`.
    - *Chế độ Toàn Cảnh 16:9 (`isLandscape`)*: Cho phép hiển thị thêm bộ lọc Tab trung tâm và Dải Quick TV Channel Pills đặt tự nhiên ở hàng thứ hai (Row 2) trong cùng container, loại bỏ hoàn toàn khả năng va chạm hay chồng lấn z-index.
    - Triệt tiêu 100% thanh cuộn ngang xám xịt trên mọi trình duyệt bằng CSS: `[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden`.
- **Quy chuẩn Icon & Nút tương tác (Bắt buộc không được vi phạm)**:
  - Tất cả icon tròn (avatar, like, comment, share, chuông, âm lượng, đóng, menu) phải có tỉ lệ chính xác 1:1 (`aspect-ratio: 1 / 1`).
  - Phải có kích thước cố định bằng inline styles (`width`, `height`, `minWidth`, `minHeight`, `maxWidth`, `maxHeight`, `borderRadius: 50%`) để không bị méo, bẹp hay kéo dài trên mọi thiết bị và trình duyệt.
- **Màu sắc Hashtags & Nhãn**:
  - Viết thường (#shorts, #tintuc24h, #thoisu).
  - Màu chữ: `font-color: #000000`, nền sáng bán trong suốt (`bg-white/90`), thanh lịch và không gây rối mắt.
- **Logo & Thương hiệu**:
  - Sử dụng avatar / logo chuẩn của trang hoặc logo kênh thay cho chữ viết tắt placeholder.

### 2.2. Trải nghiệm xem & Hành vi tương tác (UX Behaviors)
- **Mặc định BẬT ÂM THANH (Unmuted)**:
  - Khi mở video Shorts / TV, âm thanh mặc định là **BẬT TIẾNG** (`isMuted: false`).
  - Điều khiển bật/tắt tiếng thông qua postMessage `unMute`/`mute` tức thì mà không reload iframe player.
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
  - Triệt tiêu phụ đề tự động dịch (`cc_load_policy=0`, `unloadModule`) và tự động bỏ qua / skip quảng cáo của YouTube.

### 2.3. Hệ Thống Phân Loại Kênh Phong Cách Tivi (Smart TV EPG Guide)
- **Phân Loại 2 Luồng Rõ Rệt**:
  - `🎬 Video trên kênh`: Video bản tin thời sự, phóng sự dài 16:9 từ trang chủ của kênh.
  - `⚡ Video Shorts`: Video dạng ngắn dọc 9:16 nằm trong danh sách phát Shorts của YouTube của các đài.
  - Cung cấp bộ 3 tab lọc: `📺 Tất cả`, `🎬 Video trên kênh`, `⚡ Shorts ngắn`.
- **Menu Chọn Kênh TV (Chuẩn hóa Grid Layout - Ảnh 1 - Đã khắc phục triệt để)**:
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
  - Các thẻ card kênh trong EPG có cấu trúc đồng nhất `min-h-[135px]` và phần tagline `min-h-[32px] line-clamp-2` để đảm bảo hàng đáy (thống kê video & nút chọn kênh) luôn thẳng hàng 100%, không bị xô lệch layout.
- **Phát từ Video Mới Nhất**:
  - Khi người dùng chọn một kênh (ví dụ: `VTV24`), danh sách phát CHỈ phát video của kênh đó.
  - Luôn luôn bắt đầu phát từ **video mới nhất trên kênh** (`currentIndex = 0`).
  - Sắp xếp video theo thời gian xuất bản giảm dần (`publishedAt` mới nhất lên trước).
- **Hệ Thống Phân Loại Chuyên Mục Bản Tin (Sub-Category News Feeds)**:
  - Tích hợp toàn diện các chuyên mục bản tin thực tế từ kênh YouTube của đài (điển hình VTV24):
    + `🔥 Tin nóng 10 phút`
    + `📰 Tổng hợp tin tức hàng ngày`
    + `🌍 Thế giới toàn cảnh`
    + `📊 Tin tức thời sự & Kinh tế`
  - Cho phép người dùng chuyển đổi chuyên mục trực quan qua dải nút chip trên Header (Row 3) và trong Drawer Playlist.
  - **Chống lỗi danh sách rỗng (Empty Playlist)**: Khi người dùng đổi kênh TV, hệ thống không áp đặt cứng bộ lọc chuyên mục của kênh cũ lên kênh mới, luôn đảm bảo kênh mới có danh sách phát đầy đủ video ngay tức thì.

### 2.4. Cơ Sở Dữ Liệu 97 Video YouTube Thực Tế Đã Xác Minh & Cơ Chế Tự Phục Hồi Lỗi
- **Cơ sở dữ liệu 97 video YouTube chuẩn từ 10 kênh báo chí & đài truyền hình lớn**:
  - 100% video được quét và xác thực hoạt động thực tế qua YouTube oEmbed API, loại bỏ toàn bộ ID chết (404) và các đường link video nội bộ MP4 giả lập.
  - Phân bổ 10 kênh chính thống:
    + VTV24: 10 clips
    + Báo Tiền Phong: 10 clips
    + Báo Tuổi Trẻ: 10 clips
    + VTC NOW: 10 clips
    + Báo Lao Động: 10 clips
    + VTV Thời Tiết: 10 clips
    + ANTV: 10 clips
    + VnExpress TV: 10 clips
    + Báo Thanh Niên: 7 clips
    + Báo Dân Trí: 10 clips
- **Cơ Chế Tự Phục Hồi Lỗi (YouTube Embed Error Auto-Recovery)**:
  - Bắt các mã lỗi YouTube player (`onError` = 100, 101, 150 hoặc lỗi nhúng).
  - Tự động hiển thị spinner thông báo êm dịu và tự động nhảy sang video khả dụng kế tiếp sau 2.2 giây, tuyệt đối không để người dùng bị kẹt lại ở màn hình lỗi đen xì.

### 2.5. Tương Tác Thực Tế & Kết Nối Tài Khoản Google / Gmail
- **Nhận diện Tài Khoản**:
  - Tự động nhận diện tài khoản Google đã đăng nhập qua prop `userRole` hoặc `localStorage.getItem('user_auth')`.
  - Hiển thị tên thật và avatar Google thật của người dùng.
- **Thích Video (Like)**:
  - Lưu trạng thái thích vào `localStorage` theo từng tài khoản (`weather_app_liked_shorts_{email}`).
  - Đổi màu tim đỏ, hiệu ứng nảy tim, đếm số lượt thích thực tế.
- **Theo Dõi Kênh (Subscribe / Follow)**:
  - Lưu danh sách kênh đã theo dõi vào `localStorage` (`weather_app_subscribed_channels_{email}`).
  - Chuyển trạng thái sang `[✓ Đã theo dõi 🔔]`.
- **Bình Luận Thực Tế (Real Comments)**:
  - Nạp danh sách bình luận thực tế theo từng `videoId`.
  - Khi người dùng đăng bình luận, lấy ảnh đại diện Google và tên thật của tài khoản, lưu bền vững vào `localStorage` (`weather_app_comments_{videoId}`).
  - Cho phép thả tim bình luận và hiển thị badge `Bạn` cho bình luận của chính mình.
- **Chia Sẻ (Share)**:
  - Tích hợp Web Share API và sao chép liên kết video chính thống nhanh gọn.

### 2.6. Quy Chuẩn Hiển Thị Tác Giả & Nội Dung Chi Tiết Bài Viết (`NewsDetailView`)
- **Tác giả và Ảnh đại diện tác giả (Author Byline)**:
  - Khi bóc tách bài viết từ các trang báo chính thống (như Dân Trí, VnExpress, Tuổi Trẻ, Thanh Niên...):
    + Thông tin tác giả gồm Tên tác giả (`authorName`), Ảnh đại diện tròn (`authorAvatar`) và Thời gian xuất bản (`authorDate`).
    + **BẮT BUỘC hiển thị dưới dạng thanh thông tin tác giả (Byline Bar) nhỏ gọn ngay dưới tiêu đề bài viết**:
      * Ảnh đại diện tác giả là **logo/avatar tròn bé** (`w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover`), tỉ lệ 1:1, viền nhẹ. Nếu không có ảnh thì hiển thị huy hiệu chữ cái đầu tiên.
      * Tên tác giả in đậm trang nhã bên cạnh (`font-semibold text-[14px] sm:text-[15px]`), kèm dấu chấm và ngày giờ xuất bản (`• {date}`).
      * Nút tiện ích "Nghe đọc" phong cách báo chí chính thống với icon loa đỏ thanh lịch.
    + **TUYỆT ĐỐI KHÔNG phóng to ảnh đại diện của tác giả thành ảnh bài viết khổng lồ** (`<figure className="my-5 w-full"><img .../></figure>`).
    + **TUYỆT ĐỐI KHÔNG để tên tác giả bị lọt lại dưới dạng một đoạn văn bản (paragraph `<p>`) mồ côi** trong thân bài.
  - Bộ bóc tách DOM (`parseHTMLToBlocks`):
    + Chủ động quét và trích xuất dữ liệu tác giả từ các cấu trúc DOM báo chí (`a[rel="author"]`, `[data-content-piece*="author"]`, `a[href*="/tac-gia/"]`, `time`, JSON-LD schema).
    + Thực hiện pre-cleaning loại bỏ triệt để các container tác giả khỏi cây DOM của thân bài trước khi trích xuất đoạn văn và hình ảnh.
    + Thêm bộ lọc bảo vệ 2 lớp trong `processNode` và JSX renderer để phát hiện và loại bỏ mọi ảnh có kích thước avatar (24px, 36px, `zoom/36_36`, `avatar`, `rounded-full`) hoặc có `alt`/`caption` trùng tên tác giả.

### 2.7. Quy Chuẩn Khoảng Đệm & Bố Cục Trang Chính (`DesktopLayout`)
- **Khoảng đệm khung chứa chính (Main Container Padding)**:
  - Khung nội dung chính (`max-w-[1536px] mx-auto` chứa cột Thời tiết 420px và cột Tin tức / Thị trường):
    - `padding-top: 10px`: Giảm khoảng đệm trên xuống đúng 10px để nội dung thời tiết và tin tức nằm sát dưới thanh LiveNewsTicker, không bị khoảng trống 64px đẩy xuống quá xa.
    - `padding-left: 0px` và `padding-right: 0px`: Đưa khoảng đệm 2 bên về 0px để tận dụng tối đa chiều rộng của khung 1536px, loại bỏ 32px thụt lề thừa bên trong container.
    - Giữ nguyên `padding-bottom: 64px` (`py-[var(--section-gap)]`) để phần chân trang có khoảng thoáng thẩm mỹ.

- **Dải nút danh mục tin tức (News Category Tabs Bar)**:
  - `max-width: 872px`: Dải nút cuộn danh mục tin tức trên desktop (`DesktopLayout`) mở rộng lên tối đa 872px (`max-w-[872px]`) giúp hiển thị thoải mái nhiều chuyên mục cùng lúc (Tất cả, Thời tiết, Giá vàng, Chính trị, Đời sống, Con người...) mà không bị co cụm sớm ở 650px.

---

## 3. TIÊU CHÍ NGHIỆM THU (ACCEPTANCE CRITERIA)
1. Video phát mượt, mở lên có tiếng ngay, chuyển clip tức thì không bị giật lag hay reload iframe không cần thiết.
2. Không chuyển hướng người dùng sang youtube.com dưới bất kỳ hình thức nào.
3. Không bị vỡ bố cục trên mọi kích thước màn hình (Mobile, Tablet, Desktop); các nút trên Top Header của Mobile không bị chèn ép hoặc đè lên badge kênh.
4. Cơ sở dữ liệu 97 video YouTube từ 10 kênh hoạt động 100%, không còn bất kỳ video nào bị lỗi 404 hoặc bị kẹt màn hình đen.
5. Menu kênh TV hoạt động chính xác: chọn kênh là chỉ phát video của kênh đó và bắt đầu từ video mới nhất, danh sách phát không bao giờ bị rỗng (empty).
6. Các nút tương tác (Like, Subscribe, Comment) hoạt động thực tế với tài khoản Google đã đăng nhập và lưu bền vững.
7. Khi mở bài viết chi tiết có tác giả (ví dụ tác giả trên Dân Trí, VnExpress): ảnh tác giả CHỈ hiển thị là logo avatar tròn nhỏ ở dưới tiêu đề kèm tên tác giả và ngày giờ, tuyệt đối không bị phóng to thành ảnh bài viết mờ nhòe.
8. Trên giao diện Desktop, khung chứa nội dung chính (`max-w-[1536px]`) có padding-top đúng 10px và padding-left/right đúng 0px theo đúng kết quả kiểm thử trên DevTools.
9. Dải nút danh mục tin tức trên Desktop mở rộng đạt chiều rộng tối đa 872px (`max-w-[872px]`), hiển thị thoáng đãng và giảm thiểu thao tác cuộn ngang.
10. Kịch bản kiểm thử toàn trang được văn bản hóa chi tiết, bao quát mọi tính năng, thiết bị và kịch bản biên để bảo đảm chất lượng chuyển giao.

