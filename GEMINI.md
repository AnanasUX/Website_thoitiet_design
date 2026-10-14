# ANTIGRAVITY & GEMINI AGENT PROJECT PROTOCOL

React 19 + Vite 8 + Tailwind CSS v4 project.

## Development & Build Commands
- Dev Server: `npm run dev`
- Build Dashboard Data & App: `npm run build`
- Comprehensive QA Test Suite: `npm run testwebsite` (or `/testwebsite`)

---

# SYSTEM MANDATE — ALWAYS-ON PROJECT MEMORY PROTOCOL

## HỒ SƠ BỘ NHỚ DỰ ÁN (PROJECT MEMORY REGISTRY)
Mọi tác nhân AI (Antigravity / Gemini) khi làm việc với dự án BẮT BUỘC phải đọc và cập nhật các tài liệu lưu trữ chuẩn sau đây:
- **PROJECT**: `docs/PROJECT.md` — Kiến trúc tổng thể, công nghệ và phân hệ chức năng.
- **REQUIREMENTS**: `docs/REQUIREMENTS.md` — Danh mục toàn bộ các yêu cầu gốc mã `REQ-xxx`, nguồn prompt và tiêu chí nghiệm thu.
- **DECISIONS**: `docs/DECISIONS.md` — Quyết định kiến trúc, lựa chọn kỹ thuật, các phương án đã thống nhất và phương án bị loại bỏ.
- **HANDOFF**: `docs/HANDOFF.md` — Trạng thái mới nhất của dự án, nhánh git, commit gần nhất, tiến độ và công việc tiếp theo.
- **CHANGELOG**: `docs/CHANGELOG.md` — Nhật ký thay đổi và phiên bản phát hành.
- **TEST_PLAN**: `docs/qa/TEST_PLAN.md` — Kế hoạch kiểm thử toàn trang, ma trận truy vết `REQ-xxx` <-> `TC-xxx`.
- **RELEASE_GATE**: `docs/qa/RELEASE_GATE.md` — Tiêu chuẩn và checklist bắt buộc trước khi phát hành.
- **PROTOCOL**: `AI_PROJECT_PROTOCOL.md` — Quy trình 5 bước bắt buộc từ tiếp nhận yêu cầu đến kiểm thử và phát hành.

## LỆNH KIỂM THỬ TOÀN TRANG: `/testwebsite`
Khi người dùng nhập `/testwebsite` (hoặc yêu cầu kiểm thử hệ thống trước khi hoàn thành):
1. Tác nhân BẮT BUỘC phải chạy bộ kiểm thử tự động toàn diện: `npm run testwebsite` (hoặc `node scripts/testwebsite.mjs`).
2. Đối chiếu toàn bộ các ca kiểm thử trong `docs/qa/TEST_PLAN.md` (`TC-001` đến `TC-021`) với mã yêu cầu `REQ-xxx`.
3. Kiểm tra các điều kiện trong `docs/qa/RELEASE_GATE.md`.
4. Xuất Báo Cáo Kiểm Duyệt Phát Hành (QA Release Audit Report) chi tiết từng ca kèm bằng chứng (pass/fail) rõ ràng.
5. Tuyệt đối không được bỏ qua hoặc tự nhận hoàn thành nếu chưa chạy kiểm thử thực tế.

## QUY TRÌNH 6 BƯỚC BẮT BUỘC CHO MỌI YÊU CẦU MỚI
1. **Xác định nhiệm vụ & Đọc hồ sơ bộ nhớ**: Đọc `PROJECT.md`, `REQUIREMENTS.md`, `DECISIONS.md`, `HANDOFF.md` trước khi trả lời hoặc viết code.
2. **Kiểm tra hồi quy & Mâu thuẫn**: Đối chiếu yêu cầu mới với các quyết định và yêu cầu hiện hành. Không tự ý loại bỏ hoặc phá vỡ tính năng cũ.
3. **Lập danh sách việc cần làm & Tiêu chí nghiệm thu**: Phân rã công việc cụ thể trước khi chỉnh sửa mã nguồn.
4. **Thực thi sửa code & Kiểm tra build**: Viết mã nguồn sạch, chạy `npm run build` để kiểm tra biên dịch.
5. **Chạy kiểm thử thực tế & Thu thập bằng chứng**: Chạy `npm run testwebsite` để xác minh mọi ca kiểm thử (TC-001..TC-021) đều PASS.
6. **Cập nhật hồ sơ bền vững & Bàn giao**: Cập nhật `REQUIREMENTS.md`, `DECISIONS.md`, `HANDOFF.md`, và xuất báo cáo minh bạch cho người dùng. Tuyệt đối không tuyên bố hoàn thành khi chưa có bằng chứng kiểm thử thực tế.
