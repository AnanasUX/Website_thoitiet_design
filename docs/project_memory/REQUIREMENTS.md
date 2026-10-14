# DANH MỤC YÊU CẦU DỰ ÁN (PROJECT REQUIREMENTS MATRIX)

## 1. NGUYÊN TẮC QUẢN LÝ YÊU CẦU
Mỗi yêu cầu từ người dùng hoặc hệ thống đều được cấp một mã định danh duy nhất (`REQ-xxx`), kèm nguồn gốc prompt, trạng thái triển khai, tiêu chí nghiệm thu và liên kết trực tiếp tới ca kiểm thử (`TC-xxx`) trong `docs/qa/TEST_PLAN.md`.

---

## 2. MA TRẬN YÊU CẦU CHUẨN HÓA

### Nhóm 1: Video Shorts & Trung Tâm Smart TV Player

#### [REQ-001] Header Shorts Trên Mobile Tinh Gọn, Chống Đè Nút
- **Nguồn Prompt**: Yêu cầu người dùng ("Giao diện phần short vẫn lỗi về hiển thị ở Mobile... giao diện lỗi hết tối ưu giao diện những chức năng thừa bỏ qua").
- **Mô tả**: Trên màn hình di động (< 640px), thanh Header chỉ hiển thị Logo `Anx. TV` + Nút Kênh `[🔴 CH 01 • VTV24 ▾]` ở bên trái và Nút Âm thanh + Đóng ở bên phải. Ẩn hoàn toàn nút xoay 16:9 (`hidden sm:flex`).
- **Tiêu chí nghiệm thu**: Tuyệt đối không có hiện tượng chèn ép, đè lấn badge kênh; không có thanh cuộn ngang xám.
- **Ca kiểm thử liên kết**: `TC-001`.
- **Trạng thái**: ✅ Hoàn thành.

#### [REQ-002] Khung Rạp Chiếu Tablet 420px & Nút Xoay Tỉ Lệ Linh Hoạt
- **Nguồn Prompt**: Yêu cầu người dùng ("tablet, PC phải khác nhau chứ sao giống nhau được").
- **Mô tả**: Trên máy tính bảng (640px - 1023px), giao diện dọc hiển thị khung 420px ở giữa với hiệu ứng ambient glow; hỗ trợ nút xoay ngang 16:9 và nút Toàn màn hình `[⛶]`.
- **Tiêu chí nghiệm thu**: Hiển thị cân đối ở cả 2 hướng xoay dọc và xoay ngang của tablet, không vỡ layout.
- **Ca kiểm thử liên kết**: `TC-002`.
- **Trạng thái**: ✅ Hoàn thành.

#### [REQ-003] Chế Độ Toàn Cảnh 16:9 Cinema & Phím Tắt Fullscreen Trên Desktop
- **Nguồn Prompt**: Yêu cầu trải nghiệm TV Cinema trên PC.
- **Mô tả**: Màn hình >= 1024px mặc định mở ở chế độ Toàn Cảnh 16:9 Cinema; phím tắt `F` bung Toàn màn hình trình duyệt 100vw x 100vh; phím `Escape` chỉ thoát Fullscreen, không đóng modal.
- **Tiêu chí nghiệm thu**: Video chiếm trọn màn hình không viền bo; phím tắt `Space`, `↑`/`↓`, `M`, `L`, `C`, `F`, `R` hoạt động trơn tru.
- **Ca kiểm thử liên kết**: `TC-003`.
- **Trạng thái**: ✅ Hoàn thành.

#### [REQ-004] Đồng Bộ Chiều Cao Thẻ Card Kênh Smart TV EPG Guide
- **Nguồn Prompt**: Yêu cầu khắc phục lỗi lệch card EPG ("Ảnh 1: các thẻ kênh bị cao thấp không đều").
- **Mô tả**: Đặt `min-h-[135px]` cho card kênh và `min-h-[32px] line-clamp-2` cho tagline để bảo đảm hàng đáy (thống kê video & nút chọn kênh) luôn thẳng hàng 100%.
- **Tiêu chí nghiệm thu**: 10 thẻ kênh trên lưới EPG có chiều cao đồng nhất tuyệt đối.
- **Ca kiểm thử liên kết**: `TC-004`.
- **Trạng thái**: ✅ Hoàn thành.

#### [REQ-005] Chuyển Kênh TV Không Bị Rỗng Playlist (Empty Playlist Prevention)
- **Nguồn Prompt**: Yêu cầu người dùng về chuyển kênh thời sự ("chọn kênh thì chỉ phát video của kênh đó").
- **Mô tả**: Khi người dùng chuyển sang bất kỳ kênh nào, danh sách phát không bị áp đặt bộ lọc chuyên mục cứng của kênh cũ.
- **Tiêu chí nghiệm thu**: Cả 10 kênh khi chọn đều có danh sách video phong phú (`playlist.length >= 7`), không bao giờ rỗng (0 clip).
- **Ca kiểm thử liên kết**: `TC-005`.
- **Trạng thái**: ✅ Hoàn thành.

#### [REQ-006] Cơ Sở Dữ Liệu 97 Video YouTube Thực Tế Đã Xác Minh 100%
- **Nguồn Prompt**: Yêu cầu người dùng ("Về short video sẽ lấy chủ yếu trên youtube không lấy tại trang bổ sung thêm các trang khác để có nhiều video").
- **Mô tả**: Tích hợp 97 video tin tức & Shorts YouTube thực tế từ 10 kênh lớn, đã quét và xác thực qua YouTube oEmbed API, loại bỏ toàn bộ ID 404 (như `mBwR5jE57gA`).
- **Tiêu chí nghiệm thu**: 100% video phát mượt, hình ảnh âm thanh sắc nét, thuộc các kênh chính thống Việt Nam.
- **Ca kiểm thử liên kết**: `TC-006`.
- **Trạng thái**: ✅ Hoàn thành.

#### [REQ-007] Loại Bỏ Toàn Bộ Video Nội Bộ MP4 Giả Lập Khỏi Danh Sách Shorts
- **Nguồn Prompt**: Yêu cầu người dùng ("không lấy tại trang").
- **Mô tả**: Xóa sạch các link MP4 nội bộ (`isSiteNews`, cdn tuoitre) và kênh placeholder `site` khỏi cơ sở dữ liệu Shorts.
- **Tiêu chí nghiệm thu**: 100% nguồn phát trong Shorts là video YouTube chính thống.
- **Ca kiểm thử liên kết**: `TC-007`.
- **Trạng thái**: ✅ Hoàn thành.

#### [REQ-008] Tự Động Phục Hồi Lỗi Nhúng YouTube (Error Auto-Recovery)
- **Nguồn Prompt**: Yêu cầu tối ưu trải nghiệm xem video không bị gián đoạn.
- **Mô tả**: Bắt mã lỗi nhúng YouTube (`onError` = 100, 101, 150), hiển thị spinner cảnh báo êm dịu và tự động nhảy sang video kế tiếp sau 2.2 giây.
- **Tiêu chí nghiệm thu**: Người dùng không bao giờ bị kẹt lại ở màn hình lỗi đen xì.
- **Ca kiểm thử liên kết**: `TC-008`.
- **Trạng thái**: ✅ Hoàn thành.

#### [REQ-009] Mặc Định Bật Âm Thanh (Unmuted Autoplay) & Chuyển Tiếng Không Gián Đoạn
- **Nguồn Prompt**: Quy chuẩn phát video có tiếng ngay.
- **Mô tả**: Video mở lên mặc định có tiếng (`isMuted: false`); điều khiển mute/unMute thông qua postMessage trực tiếp mà không reload iframe.
- **Tiêu chí nghiệm thu**: Âm thanh phát tức thì; bật tắt tiếng không làm chớp hình hay reload video.
- **Ca kiểm thử liên kết**: `TC-009`.
- **Trạng thái**: ✅ Hoàn thành.

#### [REQ-010] Chặn Tuyệt Đối Nhảy Trang Sang YouTube Ngoài Ý Muốn
- **Nguồn Prompt**: Yêu cầu bảo mật trải nghiệm người dùng trong ứng dụng.
- **Mô tả**: Đặt lớp overlay trong suốt (`z-10`) hứng toàn bộ tương tác click/tap trên video, triệt tiêu phụ đề tự động và ẩn nút liên kết ngoài.
- **Tiêu chí nghiệm thu**: Thao tác click vào video chỉ Play/Pause, không bao giờ mở trang `youtube.com`.
- **Ca kiểm thử liên kết**: `TC-010`.
- **Trạng thái**: ✅ Hoàn thành.

#### [REQ-011] Tự Động Ẩn Controls Sau 5 Giây Không Tương Tác
- **Nguồn Prompt**: Trải nghiệm xem video Shorts không bị rối mắt.
- **Mô tả**: Toàn bộ nút công cụ và tiêu đề mờ dần sau 5 giây không có tương tác, chạm vào màn hình hiện lại ngay.
- **Tiêu chí nghiệm thu**: Đếm lùi 5s chính xác, hiển thị lại tức thì khi có chuột/chạm.
- **Ca kiểm thử liên kết**: `TC-011`.
- **Trạng thái**: ✅ Hoàn thành.

---

### Nhóm 2: Đọc Bài Viết & Tác Giả Chuẩn Báo Chính Thống

#### [REQ-012] Thanh Tác Giả (Byline Bar) Chuẩn Báo Chính Thống Dưới Tiêu Đề
- **Nguồn Prompt**: Yêu cầu người dùng ("bài viết có tác giả như này thì chỉ là ảnh logo bé ở dưới tiêu đề kèm tên tác giả thôi chứ không phóng to là ảnh bài viết đây là trang chính thống hiển thị yêu cầu sửa lại").
- **Mô tả**: Dưới tiêu đề bài viết hiển thị thanh Byline Bar trang nhã: Logo tròn nhỏ 1:1 (`w-7 h-7 sm:w-8 sm:h-8 rounded-full`), tên tác giả in đậm (`font-semibold`), dấu chấm `•`, thời gian xuất bản và nút "Nghe đọc".
- **Tiêu chí nghiệm thu**: Hiển thị chính xác theo ảnh mẫu báo Dân Trí người dùng cung cấp (`media_1791941000285_68fb28ae.png`).
- **Ca kiểm thử liên kết**: `TC-012`.
- **Trạng thái**: ✅ Hoàn thành.

#### [REQ-013] Tiền Loại Bỏ Khối Tác Giả & Khử Phóng To Avatar Trong Thân Bài
- **Nguồn Prompt**: Yêu cầu người dùng (khắc phục lỗi avatar tác giả bị phóng to thành ảnh bài viết mờ nhòe).
- **Mô tả**: Pre-cleaning xóa bỏ mọi container tác giả khỏi DOM thân bài; bộ lọc kép loại bỏ ảnh avatar (<= 36px, `zoom/36_36`, `avatar`, `rounded-full`) và loại bỏ đoạn text tên tác giả mồ côi.
- **Tiêu chí nghiệm thu**: 0 ảnh avatar tác giả bị biến thành ảnh bài viết; 0 tên tác giả bị lọt vào mảng đoạn văn thân bài.
- **Ca kiểm thử liên kết**: `TC-013`.
- **Trạng thái**: ✅ Hoàn thành.

---

### Nhóm 3: Bố Cục Desktop & Điều Hướng

#### [REQ-014] Khung Bố Cục Chính Trên Desktop Có Padding-Top 10px, Padding-Left/Right 0px
- **Nguồn Prompt**: Yêu cầu người dùng ("Phần padding trên trang đang lớn điều chỉnh như sau <div class='flex gap-[var(--grid-gap)] items-start px-[var(--page-padding)] py-[var(--section-gap)] w-full max-w-[1536px] mx-auto' style='padding-top: 10px;padding-left: 0px;padding-right: 0px;'>").
- **Mô tả**: Áp dụng đúng thông số inline style vào container chính `DesktopLayout`.
- **Tiêu chí nghiệm thu**: Khoảng đệm đỉnh giảm xuống 10px kết nối sát với LiveNewsTicker; hai bên 0px tận dụng tối đa chiều rộng; đáy giữ 64px.
- **Ca kiểm thử liên kết**: `TC-014`.
- **Trạng thái**: ✅ Hoàn thành.

#### [REQ-015] Nâng Cấp Chiều Rộng Tối Đa Dải Danh Mục Tin Tức Lên 872px
- **Nguồn Prompt**: Yêu cầu người dùng ("cập nhật thông tin thành thông số này kiểm tra và nâng cấp .max-w-[650px] { max-width: 872px; }").
- **Mô tả**: Thay thế class `max-w-[650px]` bằng `max-w-[872px]` trên container dải nút danh mục tin tức (`DesktopLayout`).
- **Tiêu chí nghiệm thu**: Dải danh mục đạt chiều rộng tối đa 872px trên màn hình lớn, hiển thị nhiều chuyên mục cùng lúc không bị co ngắn.
- **Ca kiểm thử liên kết**: `TC-015`.
- **Trạng thái**: ✅ Hoàn thành.

---

### Nhóm 4: Thời Tiết, Thị Trường & Vận Hành Hệ Thống

#### [REQ-016] Dữ Liệu Thời Tiết Hiện Tại & Đồ Thị Dự Báo Hàng Giờ SVG Spline
- **Mô tả**: Hiển thị nhiệt độ, độ ẩm, sức gió, tầm nhìn, bụi mịn PM2.5 thời gian thực; đồ thị dự báo hàng giờ bằng đường cong SVG mượt mà.
- **Tiêu chí nghiệm thu**: Dữ liệu hiển thị trực quan, không giật lag.
- **Ca kiểm thử liên kết**: `TC-016`.
- **Trạng thái**: ✅ Hoàn thành.

#### [REQ-017] Bảng Giá Thị Trường Tài Chính (Vàng, Ngoại Tệ, Dầu)
- **Mô tả**: Cập nhật giá vàng SJC, Doji, Phú Quý, Bảo Tín Minh Châu; tỷ giá Vietcombank; giá xăng dầu.
- **Tiêu chí nghiệm thu**: Phân biệt biến động tăng (xanh)/giảm (đỏ) rõ nét.
- **Ca kiểm thử liên kết**: `TC-017`.
- **Trạng thái**: ✅ Hoàn thành.

#### [REQ-018] Biên Dịch Hệ Thống Hoàn Hảo (Zero Build Error)
- **Mô tả**: `npm run build` thực thi thành công không lỗi TypeScript hoặc CSS.
- **Tiêu chí nghiệm thu**: Exit code 0, file bundle hợp lệ.
- **Ca kiểm thử liên kết**: `TC-018`.
- **Trạng thái**: ✅ Hoàn thành.

#### [REQ-019] Tính Vẹn Toàn Hồ Sơ Bộ Nhớ Dự Án
- **Mô tả**: Mọi tài liệu chuẩn (`PROJECT.md`, `REQUIREMENTS.md`, `DECISIONS.md`, `HANDOFF.md`, `TEST_PLAN.md`, `RELEASE_GATE.md`) tồn tại đầy đủ và đồng bộ.
- **Tiêu chí nghiệm thu**: 100% tài liệu được cập nhật phiên bản mới nhất.
- **Ca kiểm thử liên kết**: `TC-019`.
- **Trạng thái**: ✅ Hoàn thành.

#### [REQ-020] Bộ Chạy Kiểm Thử Tự Động Qua Lệnh `/testwebsite`
- **Mô tả**: Hỗ trợ lệnh `/testwebsite` (hoặc `npm run testwebsite`) tự động kiểm tra toàn bộ hệ thống và in báo cáo kết quả có bằng chứng.
- **Tiêu chí nghiệm thu**: Script thực thi nhanh, đưa ra kết luận đạt/chưa đạt rõ ràng.
- **Ca kiểm thử liên kết**: `TC-020`.
- **Trạng thái**: ✅ Hoàn thành.
