# CỔNG KIỂM DUYỆT PHÁT HÀNH (RELEASE GATE CHECKLIST)

## 1. NGUYÊN TẮC CỔNG KIỂM DUYỆT
Cổng kiểm duyệt phát hành (Release Gate) là hàng rào kỹ thuật bắt buộc nhằm bảo đảm rằng không có bất kỳ phiên bản nào được bàn giao hoặc phát hành lên production khi chưa đáp ứng đầy đủ các tiêu chuẩn về tính năng, giao diện, bộ nhớ dự án và kết quả kiểm thử.

---

## 2. CHECKLIST KIỂM DUYỆT TRƯỚC KHI PHÁT HÀNH

### A. Tiêu Chí Bộ Nhớ Dự Án & Hồ Sơ Bền Vững (Memory & Docs Gate)
- [x] **MG-1**: Có đầy đủ bộ 6 tài liệu chuẩn trong repository:
  + `AGENTS.md` (Quy tắc bắt buộc cho AI coding assistant)
  + `AI_PROJECT_PROTOCOL.md` (Quy trình quản lý dự án & kiểm thử 5 bước)
  + `docs/PROJECT.md` (Kiến trúc & công nghệ)
  + `docs/REQUIREMENTS.md` (Danh mục yêu cầu mã `REQ-xxx`)
  + `docs/DECISIONS.md` (Quyết định kỹ thuật & phương án loại bỏ)
  + `docs/HANDOFF.md` (Bàn giao phiên bản & commit hash)
- [x] **MG-2**: Tất cả các yêu cầu mới từ prompt người dùng đều đã được chuẩn hóa thành mã định danh `REQ-xxx` và có tiêu chí nghiệm thu rõ ràng.
- [x] **MG-3**: Các quyết định kỹ thuật và phương án bị từ chối được ghi nhận đầy đủ vào `DECISIONS.md`.

### B. Tiêu Chí Kiểm Thử Nghiệp Vụ & Giao Diện (Functional & UI Gate)
- [x] **FG-1**: Toàn bộ 47 ca kiểm thử trong `docs/qa/TEST_PLAN.md` (`TC-001` đến `TC-047`) đều đạt kết quả **PASS**.
- [x] **FG-2**: Không có lỗi hồi quy (regression) trên các tính năng đã hoàn thiện trước đó.
- [x] **FG-3**: Đã xác thực thực tế trên 3 nhóm kích thước viewport:
  + Mobile (< 640px): Header Shorts tinh gọn, không đè nút, badge kênh hiển thị trọn vẹn.
  + Tablet (640px - 1023px): Khung dọc 420px phong cách rạp chiếu, xoay 16:9 và Fullscreen linh hoạt.
  + Desktop (>= 1024px): Toàn cảnh 16:9 Cinema, dải tab danh mục đạt `max-w-[872px]`, padding đỉnh 10px và hai bên 0px.
- [x] **FG-4**: Cơ sở dữ liệu 97 video YouTube từ 10 kênh báo chí và truyền hình lớn hoạt động 100%, 0 video bị lỗi 404, không dùng video MP4 nội bộ giả lập.
- [x] **FG-5**: Chuyển kênh TV không bị rỗng playlist (Empty Playlist Prevention).
- [x] **FG-6**: Hiển thị tác giả bài viết chuẩn báo chính thống: Byline bar nhỏ gọn dưới tiêu đề, không phóng to avatar thành ảnh bài viết mờ nhòe trong thân bài, không để tên tác giả mồ côi.
- [x] **FG-8**: Trình phát AI VieNeu-TTS đọc đúng và đủ toàn bộ thân bài + Sapo, áp dụng giọng nữ hệ thống (`bac_nu` / Google Tiếng Việt / Hoài My) khi bấm nút `article-tts-btn`, TUYỆT ĐỐI KHÔNG TÍNH TIÊU ĐỀ BÀI VIẾT, chuẩn hóa tiếng Việt, đầy đủ Waveform và Progress Bar.



### C. Tiêu Chí Biên Dịch & Đóng Gói (Build & Performance Gate)
- [x] **BG-1**: Lệnh `npm run build` thực thi thành công 100% với mã thoát `0`.
- [x] **BG-2**: Không có lỗi TypeScript (`tsc` 0 error) và không có lỗi đóng gói Vite.
- [x] **BG-3**: Kích thước bundle tối ưu (JavaScript chunk gzip < 150 kB, CSS gzip < 20 kB).

### D. Tiêu Chí Lệnh Tự Động `/testwebsite` (Automation Gate)
- [x] **AG-1**: Script kiểm thử tự động `scripts/testwebsite.mjs` chạy thành công qua lệnh `npm run testwebsite`.
- [x] **AG-2**: Toàn bộ các kiểm tra từ tính vẹn toàn file, quy chuẩn CSS, cơ sở dữ liệu video, bộ lọc tác giả đến build hệ thống đều trả về kết quả đạt (All Passed).

---

## 3. QUY TRÌNH KHI GẶP LỖI CHẶN (BLOCKER INCIDENT PROCEDURE)
Nếu có bất kỳ mục nào trong checklist bị ĐÁNH TRƯỢT (FAIL):
1. **Lập tức dừng phát hành**: Không thông báo hoàn thành với người dùng.
2. **Kích hoạt luồng sửa chữa**: Căn cứ vào mã `TC-xxx` bị lỗi để xác định file mã nguồn cần can thiệp.
3. **Thực hiện kiểm thử lại**: Chạy lại lệnh `/testwebsite` để xác nhận lỗi đã được khắc phục hoàn toàn.
4. **Cập nhật bằng chứng**: Ghi nhận nguyên nhân và giải pháp vào `docs/DECISIONS.md` và `docs/HANDOFF.md`.
