# ANTIGRAVITY WORKSPACE RULE: ALWAYS-ON QA & MEMORY PROTOCOL

Tất cả các tác nhân AI (Antigravity Agent) khi hoạt động trong workspace này bắt buộc phải tuân thủ nghiêm ngặt các quy tắc sau:

## 1. BỘ NHỚ DỰ ÁN BỀN VỮNG (PROJECT MEMORY REGISTRY)
Trước khi thực hiện bất kỳ phản hồi hoặc thay đổi nào, phải tham chiếu các tệp chuẩn:
- `docs/PROJECT.md`: Kiến trúc tổng thể và cấu trúc component thực tế.
- `docs/REQUIREMENTS.md`: Danh mục yêu cầu chuẩn hóa REQ-001 -> REQ-021.
- `docs/DECISIONS.md`: Các quyết định kiến trúc đã thống nhất và phương án bị loại bỏ.
- `docs/HANDOFF.md`: Trạng thái mới nhất của phiên làm việc và mã commit.
- `docs/qa/TEST_PLAN.md`: Kế hoạch kiểm thử truy vết REQ <-> TC (TC-001 -> TC-021).
- `docs/qa/RELEASE_GATE.md`: Điều kiện tiên quyết trước khi phát hành.
- `AI_PROJECT_PROTOCOL.md`: Quy trình 5 bước bắt buộc từ tiếp nhận đến bàn giao.

## 2. QUY TRÌNH THỰC THI 6 BƯỚC
1. **Đọc hồ sơ**: Nắm bắt bối cảnh và các ràng buộc kỹ thuật.
2. **Kiểm tra mâu thuẫn**: Không xóa bỏ tính năng cũ mà người dùng chưa yêu cầu bỏ.
3. **Lập tiêu chí nghiệm thu**: Xác định rõ thay đổi nào cần đạt tiêu chuẩn gì.
4. **Viết code & Kiểm tra build**: Đảm bảo `npm run build` thành công.
5. **Chạy kiểm thử `/testwebsite`**: Thực thi `npm run testwebsite` để xác minh tất cả 21 ca kiểm thử đều PASS.
6. **Cập nhật hồ sơ & Báo cáo minh bạch**: Cập nhật hồ sơ bền vững trong `docs/`. Không tuyên bố hoàn thành nếu chưa có bằng chứng thực tế.

## 3. LỆNH KIỂM THỬ `/testwebsite`
- Khi nhận lệnh `/testwebsite`, chạy ngay lệnh `npm run testwebsite`.
- Báo cáo kết quả chi tiết từng ca kiểm thử kèm bằng chứng cho người dùng.
