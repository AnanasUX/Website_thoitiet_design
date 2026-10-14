# HỒ SƠ BÀN GIAO & TIẾN ĐỘ DỰ ÁN (PROJECT HANDOFF)

## 1. THÔNG TIN PHIÊN BẢN & MÃ NGUỒN
- **Nhánh Git**: `main`
- **Kết quả Nâng Cấp Hệ Thống Kiểm Thử Thực Tế Đa Màn Hình & Toàn Bộ Tính Năng (`REQ-020` / `TC-020`)**:
  + ✅ **Kiểm thử tự động thực tế kết nối hệ thống (Connected Live E2E Suite)**: Nâng cấp script `scripts/testwebsite.mjs` tích hợp `playwright-core` điều khiển trực tiếp trình duyệt Google Chrome thật. Loại bỏ hoàn toàn kiểm thử regex chuỗi hình thức.
  + ✅ **Kiểm thử xuyên suốt 3 kích thước màn hình chuẩn**:
    1. **Desktop (1440px x 900px)**: Kiểm tra padding-top 10px, padding-left/right 0px; dải danh mục 872px và tương tác click tab; widget thời tiết & 15 đường cong SVG; bảng giá vàng, ngoại tệ, xăng dầu; mở bài viết chi tiết kiểm tra Byline Bar và khử phóng to avatar; mở Video Shorts kiểm tra chế độ 16:9 Cinema, ambient glow, 10 kênh truyền hình, âm thanh unmuted, overlay z-10 và đếm lùi 5s.
    2. **Tablet (768px x 1024px)**: Kiểm tra hiển thị TabletLayout (ẩn Desktop/Mobile); mở Shorts kiểm tra khung rạp chiếu 420px; đồng bộ chiều cao thẻ kênh min-h-[135px].
    3. **Mobile (375px x 812px)**: Kiểm tra hiển thị MobileLayout; mở Shorts qua banner di động; xác minh nút xoay 16:9 được ẩn hoàn toàn (display=none) để chống đè nút header.
  + ✅ **Bộ Giả Lập Màn Hình Trực Tiếp Trên Dashboard (`dashboard.html` & `public/dashboard.html`)**:
    - Tích hợp khung **Connected Live Multi-Screen Simulator** với 3 nút chuyển đổi: `[💻 Desktop (100%)]`, `[📱 Tablet (768px)]`, `[📱 Mobile (375px)]`.
    - Khi bấm `[▶️ Chạy Kiểm Thử Toàn Hệ Thống]`, hệ thống tự động đổi kích thước iframe giả lập, đo đạc DOM thật, tương tác trực tiếp với các phần tử và báo cáo kết quả trung thực sau ~5-7s.
  + ✅ **Kho ảnh chụp bằng chứng thực tế (Screenshot Audit Evidence)**: Chụp và lưu trữ ảnh màn hình thực tế từ Chrome thật tại `qa/screenshots/` và `public/qa/screenshots/` (`screen-desktop-1440.png`, `screen-tablet-768.png`, `screen-mobile-375.png`, `feature-shorts-mobile.png`, `feature-shorts-tablet.png`).
  + ✅ **Phân quyền người dùng nghiêm ngặt (`REQ-021` / `TC-021`)**: Chỉ tài khoản quản trị viên `"mrkun28@gmail.com"` mới nhìn thấy QA Dashboard tại Top Header, Floating Action Widget (góc phải dưới) và Menu Avatar.
  + ✅ **Kết quả kiểm thử toàn diện**: Thực thi lệnh `/testwebsite` (`npm run testwebsite`) đạt **21/21 PASS** (0 FAIL).
  + ✅ **Cổng kiểm duyệt phát hành**: **RELEASE GATE: PASSED**.
- **Trạng thái Build**: ✅ Build thành công 100% không lỗi (`npm run build`).

---

## 2. TỔNG HỢP CÁC TÍNH NĂNG ĐÃ HOÀN TẤT & ĐỐI CHIẾU REQ

1. **[REQ-001 -> REQ-011] Toàn Bộ Phân Hệ Video Shorts & Smart TV Player**:
   - 97 video YouTube thực tế đã xác minh qua oEmbed trên 10 kênh báo đài lớn Việt Nam.
   - Không còn video chết 404, không còn video MP4 nội bộ giả lập.
   - Khắc phục lỗi rỗng playlist khi đổi kênh (`Empty Playlist Prevention`).
   - Tối ưu giao diện đa nền tảng: Mobile header tinh gọn không đè nút; Tablet khung 420px; PC 16:9 Cinema.
   - Tự động phục hồi lỗi nhúng (100/101/150) chuyển video sau 2.2 giây.
   - Mặc định bật tiếng (`unmuted`), overlay chặn click nhảy sang YouTube ngoài ý muốn.
2. **[REQ-012, REQ-013] Hiển Thị Tác Giả Bài Viết Chuẩn Báo Chính Thống (`NewsDetailView`)**:
   - Byline bar nhỏ gọn dưới tiêu đề với logo tròn 1:1, tên tác giả in đậm, ngày giờ và nút "Nghe đọc".
   - Loại bỏ hoàn toàn lỗi phóng to avatar thành ảnh bài viết trong thân bài; không để tên tác giả mồ côi.
3. **[REQ-014, REQ-015] Bố Cục Desktop & Dải Danh Mục Tin Tức (`DesktopLayout`)**:
   - Khung chứa chính có `padding-top: 10px`, `padding-left: 0px`, `padding-right: 0px`.
   - Dải tab danh mục tin tức mở rộng tối đa đạt `872px` (`max-w-[872px]`).
4. **[REQ-016 -> REQ-020] Thời Tiết, Thị Trường, Build & Tự Động Hóa QA**:
   - Dữ liệu thời tiết tức thời & đồ thị SVG spline mượt mà.
   - Bảng giá thị trường vàng, ngoại tệ, xăng dầu hoạt động ổn định.
   - Hệ thống hồ sơ dự án chuẩn hóa (`PROJECT.md`, `REQUIREMENTS.md`, `DECISIONS.md`, `HANDOFF.md`, `CHANGELOG.md`, `TEST_PLAN.md`, `RELEASE_GATE.md`).
   - Lệnh tự động `/testwebsite` (qua `npm run testwebsite`) chạy kiểm thử toàn trang và xuất báo cáo có bằng chứng (21/21 PASS).
5. **[REQ-021] Phân Quyền QA Dashboard & Vị Trí Hiển Thị Tránh Cuộn Vô Cực**:
   - Chỉ tài khoản `mrkun28@gmail.com` nhìn thấy QA Dashboard.
   - Hiển thị trên Top Header (Mobile, Tablet, Desktop), Fixed Floating Widget góc phải dưới và Menu Avatar.

---

## 3. CÁC CÔNG VIỆC TIẾP THEO (NEXT STEPS)
1. Duy trì hệ thống cổng kiểm duyệt `RELEASE_GATE.md` cho mọi thay đổi trong tương lai.
2. Bất kỳ tác nhân nào làm việc trên repository đều phải chạy `npm run testwebsite` trước khi tạo commit hoặc bàn giao.
