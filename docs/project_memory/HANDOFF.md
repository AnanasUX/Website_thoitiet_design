# PROJECT HANDOFF & CURRENT STATUS

## 1. THÔNG TIN PHIÊN BẢN & MÃ NGUỒN
- **Nhánh Git**: `main`
- **Commit gần nhất**: `1bae5eb (fix(article): render author avatar as small byline icon and prevent enlarging as article image)`
- **Trạng thái Build**: ✅ Build thành công 100% không lỗi (`npm run build` trong 6.73s, `index-CljyEJx1.js` 476.21 kB).

## 2. CÁC TÍNH NĂNG VỪA HOÀN THIỆN
1. **Khắc Phục Triệt Để Lỗi Phóng To Ảnh Tác Giả & Chuẩn Hóa Hiển Thị Tác Giả Bài Viết (Ảnh Người Dùng Gửi)**:
   - **Nguyên nhân gốc rễ**: Khi cào dữ liệu toàn văn từ các trang báo chính thống (như Dân Trí `dantri.com.vn`), vùng chứa bài viết `<article>` bao gồm cả cụm thông tin tác giả (`<a rel="author"><img alt="Hải Nam" src="..." height="24" width="24">...</a>`). Trước đây, hàm duyệt cây DOM `processNode` đã bắt gặp thẻ `<img>` này và ngộ nhận là ảnh bài viết, dẫn đến việc render thành `<figure class="my-5 w-full"><img class="w-full h-auto ..."/>` phóng to mờ nhòe chiếm trọn chiều rộng bài viết kèm caption tên tác giả, và ngay dưới là đoạn text tên tác giả lặp lại.
   - **Giải pháp dứt điểm theo quy chuẩn báo chính thống**:
     + **Trích xuất thông minh**: Trích xuất chính xác Tên tác giả (`authorName`), Ảnh đại diện (`authorAvatar`), và Thời gian xuất bản (`authorDate`) từ cấu trúc DOM báo chí (`a[rel="author"]`, `[data-content-piece*="author"]`, `a[href*="/tac-gia/"]`, `time`, JSON-LD schema).
     + **Tiền loại bỏ (Pre-cleaning)**: Dùng querySelector xóa sạch mọi khối container tác giả (`[data-content-name="article-author"]`, `a[rel="author"]`, `a[href*="/tac-gia/"]`, `.author-avatar`, `.box-author`, `.details__author`, `.article__author`, `time`) trước khi duyệt nội dung thân bài.
     + **Bộ lọc kiểm tra kép (Dual-layer Guard)**: Khử toàn bộ ảnh có kích thước avatar (<= 36px, `zoom/36_36`, `avatar`, `rounded-full`) hoặc caption trùng tên tác giả ở cả `processNode` và JSX rendering loop.
     + **Thanh tác giả chuẩn báo chính thống (Byline Bar)**:
       * Đặt trang nhã ngay dưới tiêu đề bài viết.
       * Ảnh đại diện tác giả là **logo/avatar tròn bé** (`w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-gray-200 aspect-square`), không bao giờ bị méo hay phóng to. Nếu không có ảnh thì hiển thị huy hiệu chữ cái đầu tiên.
       * Tên tác giả in đậm trang nhã (`font-semibold text-[14px] sm:text-[15px] text-[#182033]`), kèm dấu chấm và thời gian xuất bản bài viết (`• {date}`).
       * Nút tiện ích "Nghe đọc" phong cách báo chí hiện đại với biểu tượng loa đỏ nổi bật, chuẩn xác 100% với giao diện gốc của báo Dân Trí như trong ảnh mẫu người dùng gửi (`media_1791941000285_68fb28ae.png`).

2. **Khắc Phục Triệt Để Lỗi Chèn Ép & Đè Nút Trên Top Header Ở Chế Độ Dọc**:
   - **Nguyên nhân gốc rễ**: Khi ở chế độ Dọc Shorts (`!isLandscape`), chiều rộng khung video chỉ khoảng 390px - 420px. Việc render cả nút `[= Danh sách 55]` (chiếm hơn 115px) và nút tỉ lệ `[📱 9:16]` trên Header đã làm cụm điều khiển bên phải vượt quá 310px, đè bẹp dí nút Kênh TV `[🔴 CH 01 • VTV24 ▾]` ở bên trái.
   - **Giải pháp dứt điểm**:
     + Ẩn hoàn toàn nút `[= Danh sách]` trên Header khi ở chế độ dọc (vì ở góc dưới bên phải ĐÃ CÓ nút `[List]` chuyên dụng của Shorts). Nút này CHỈ hiển thị khi ở chế độ Toàn Cảnh 16:9 (`isLandscape`).
     + Chuyển nút Tỉ lệ trong chế độ dọc thành nút tròn nhỏ gọn `32px` `[🖥️]` (ẩn trên mobile, hiện trên tablet/desktop).
     + Giúp tổng chiều rộng cụm nút bên phải giảm từ 310px xuống chỉ còn 128px (trên desktop/tablet) và 64px (trên mobile), giải phóng hơn 180px không gian cho Logo và Nút Kênh TV hiển thị đầy đủ, thoáng đãng 100% không bao giờ bị đè.
   - Loại bỏ hoàn toàn video nội bộ MP4 (`isSiteNews`, cdn tuoitre) và kênh placeholder `site` khỏi cơ sở dữ liệu Shorts.
   - 100% video và Shorts đều lấy từ YouTube với `youtubeId` thật đã xác minh và thumbnail `https://i.ytimg.com/vi/{id}/hqdefault.jpg` chuẩn của YouTube.
   - Bổ sung nhiều nguồn video phong phú từ các đài truyền hình và báo chí lớn: ANTV, VnExpress TV, Báo Dân Trí, Báo Lao Động, Báo Tuổi Trẻ, Báo Thanh Niên, Báo Tiền Phong, VTC NOW, VTV Thời Tiết, VTV24.
   - Nâng cấp bộ nhớ cache RSS lên `yt_aggregated_shorts_cache_v8` và fetch song song từ 18 kênh YouTube uy tín.

2. **Tối Ưu Hóa Responsive Tách Biệt Rạch Ròi Mobile - Tablet - PC**:
   - **Mobile (< 640px)**:
     + Khung video chiếm trọn vẹn màn hình điện thoại 100vw x 100dvh, không viền bo, không bóng thừa.
     + Header siêu tinh gọn: Chỉ duy trì Logo + Nút Kênh EPG bên trái và Nút Âm thanh + Nút Đóng bên phải.
     + Loại bỏ triệt để các nút thừa trên Mobile: Ẩn nút xoay 16:9/9:16, ẩn nút Playlist trên Header (vì đã có ở Action Bar bên phải), ẩn nút TV Guide, ẩn nút Fullscreen.
     + Action Bar bên phải thu nhỏ nút xuống `36px` (`w-9 h-9`), icon nhỏ gọn, không che chắn tiêu đề.
     + Bottom Overlay có khoảng đệm an toàn `pr-13`, tiêu đề 2 dòng gọn gàng, ẩn nhãn tài khoản email dài dòng.
     + Playlist Drawer và Comments Drawer chuyển sang dạng **Bottom Sheet** hiện đại trượt từ đáy màn hình lên với thanh vuốt grab bar.
   - **Tablet (640px - 1023px)**:
     + Khi xem Shorts dọc: Khung video 390px/420px ở giữa màn hình chuẩn rạp chiếu, nền ambient glow.
     + Header bổ sung nút xoay 16:9/9:16, Danh sách phát, Âm thanh, Fullscreen và Đóng.
   - **PC / Desktop (>= 1024px)**:
     + Hỗ trợ đầy đủ chế độ 16:9 Cinema tràn màn hình khi Fullscreen hoặc chuyển ngang.
     + Dải Quick Format Filter Tabs và Quick TV Channel Pills ở chế độ Toàn Cảnh.
     + Bảng phím tắt TV ở góc dưới bên trái (`hidden 2xl:flex`).


## 3. TRẠNG THÁI KIẾN TRÚC HIỆN TẠI
- **Danh sách ID YouTube thực tế hợp lệ** (đã xác minh): `THldZ31vTvI`, `kFDO9Qbua4c`, `0thQbm1zlW4`, `M7lc1UVf-VE`, `Kmx55fnX6jM`, `utYT3v_KTyo`, `xYXS7Dgi5M4`, `819YbuGDpK0`, `ADGo5NaYQNM`, `gusC3mjEV3I`, `3ojcuyMKDvs`, `fQ6NE4ZQOLg`.
- **Sub-category**: UI đã bị xóa; state nội bộ vẫn tồn tại trong code nhưng không hiển thị.
- **Error handling**: `videoErrorState` overlay z-20, spinner đỏ, auto-skip 2.2s.

## 4. CÔNG VIỆC TIẾP THEO & ĐIỀU CẦN CHÚ Ý
- Bắt buộc tuân thủ `# SYSTEM ADDENDUM — ALWAYS-ON PROJECT MEMORY PROTOCOL` trong `AGENTS.md`.
- Đảm bảo giữ vững tỉ lệ icon tròn 1:1 (`aspect-ratio: 1 / 1`), chặn click iframe ra ngoài YouTube và khử phụ đề dịch tự động.
- Nếu cần bổ sung thêm kênh mới: thêm vào `TV_CHANNELS` array + `matchesChannel()` + `FEATURED_NEWS_CHANNELS` + `BACKUP_FALLBACK_SHORTS`.


## 2. CÁC TÍNH NĂNG VỪA HOÀN THIỆN
1. **Kéo Toàn Bộ Video & Phân Loại Bản Tin Kênh VTV24 Về Hệ Thống**:
   - **Tích hợp 28+ video bản tin thực tế từ kênh YouTube VTV24**: Trực tiếp từ ảnh chụp trang chủ kênh do người dùng cung cấp (`media_1791877485527_561c6e75.png`).
   - **Phân loại 4 Chuyên mục bản tin chính của VTV24**:
     + `🔥 Tin nóng 10 phút`: Bản tin 10 phút trên VTVgo (vụ hài cốt liệt sĩ, camera AI Hà Nội, khởi tố buôn lậu vàng, ngày Giải phóng Thủ đô, đất đai, dông lốc...).
     + `📰 Tổng hợp tin tức hàng ngày`: Bản tin thời sự toàn cảnh trưa & tối (Chủ tịch Quốc hội Trần Thanh Mẫn dự họp, triệt phá rửa tiền, thảm họa sạt lở ven biển, Tết Nguyên đán 7 ngày...).
     + `🌍 Thế giới toàn cảnh`: Bản tin quốc tế (Sân bay King Khalid, EU gỡ giám sát Việt Nam, bão Milton, Nga đàm phán hòa bình...).
     + `📊 Tin tức thời sự & Kinh tế`: Trái phiếu và lãi suất toàn cầu, Đường sắt Hà Nội - Lào Cai, Bản tin sáng, Houthi, bầu cử Mỹ...
     + `⚡ Shorts ngắn`: Các clip dọc cảnh báo lừa đảo, thị trường giá vàng...
   - **Hệ thống Lọc Chuyên Mục (Sub-Category Filter Chips)**:
     + Bổ sung dải nút lọc chuyên mục bản tin trực quan trên **Top Header (Row 3)** khi xem ở chế độ Toàn cảnh 16:9.
     + Bổ sung dải nút lọc chuyên mục bản tin bên trong **Playlist Drawer (Danh sách phát)**.
     + Khi người dùng bấm vào chuyên mục bất kỳ, danh sách phát tự động chuyển lọc theo chuyên mục đó và **bắt đầu chạy từ video mới nhất** (`currentIndex = 0`).
2. **Nâng Cấp Phím Tắt "F" & Cơ Chế Toàn Màn Hình Thật Sự (Fullscreen Cinema)**:
   - Tự động chuyển 16:9 Toàn Cảnh khi Fullscreen, tràn trọn vẹn màn hình 100vw x 100vh.
   - Hỗ trợ đầy đủ vendor prefixes của Web Fullscreen API và lắng nghe đa sự kiện `fullscreenchange`.
   - Phím `Escape` chỉ thoát chế độ Fullscreen, không đóng modal video đột ngột.
   - Nút Fullscreen `[⛶]` hiển thị trực quan ở cả 2 chế độ (dọc và ngang) trên Desktop/Tablet.
3. **Phân Loại 2 Luồng Media Rõ Rệt**:
   - `🎬 Video trên kênh` (16:9) vs `⚡ Video Shorts` (9:16) với hệ thống tab 3 chế độ.
4. **Mặc Định Mở Tiếng (Unmuted)**:
   - Video mở lên có âm thanh ngay (`isMuted: false`), toggling âm thanh tức thì qua postMessage 0ms.
5. **Chống Chồng Đè Header & Dải Kênh**:
   - Header gom vào 1 container `flex-col` duy nhất, khóa dải điều khiển mở rộng chỉ hiện khi `isLandscape = true`.
6. **Tương Tác Thực Tế & Kết Nối Tài Khoản Google / Gmail**:
   - Tự động nhận diện tài khoản Google, tương tác Like, Follow, Comment lưu bền vững vào `localStorage`.

## 3. CÔNG VIỆC TIẾP THEO & ĐIỀU CẦN CHÚ Ý
- Bắt buộc tuân thủ `# SYSTEM ADDENDUM — ALWAYS-ON PROJECT MEMORY PROTOCOL` trong `AGENTS.md`.
- Đảm bảo giữ vững tỉ lệ icon tròn 1:1 (`aspect-ratio: 1 / 1`), chặn click iframe ra ngoài YouTube và khử phụ đề dịch tự động.
