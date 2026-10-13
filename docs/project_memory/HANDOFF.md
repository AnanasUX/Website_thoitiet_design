# PROJECT HANDOFF & CURRENT STATUS

## 1. THÔNG TIN PHIÊN BẢN & MÃ NGUỒN
- **Nhánh Git**: `main`
- **Commit gần nhất**: `fa360c1` (chuẩn bị commit)
- **Trạng thái Build**: ✅ Build thành công 100% không lỗi (`npm run build` trong 445ms, 471.36 kB).

## 2. CÁC TÍNH NĂNG VỪA HOÀN THIỆN
1. **Lấy Shorts 100% YouTube Chính Thống, Không Lấy Video Tại Trang**:
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
