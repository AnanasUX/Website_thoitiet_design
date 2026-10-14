# HƯỚNG DẪN TÍCH HỢP HỆ THỐNG QA VÀO WEBSITE (QA INTEGRATION GUIDE)

## 1. MỤC TIÊU
Tích hợp bộ nhớ dự án bền vững, cơ chế quản lý yêu cầu có truy vết và cổng kiểm duyệt phát hành trước khi triển khai thực tế.

## 2. CÁC TÀI LIỆU CHUẨN ĐÃ ĐƯỢC TÍCH HỢP
1. `AGENTS.md`: Bộ quy tắc bắt buộc tối cao cho AI coding assistant.
2. `AI_PROJECT_PROTOCOL.md`: Quy trình kỹ thuật 5 bước từ tiếp nhận yêu cầu đến kiểm thử và phát hành.
3. `docs/PROJECT.md`: Thông tin toàn cảnh kiến trúc dự án và stack công nghệ.
4. `docs/REQUIREMENTS.md`: Bảng quản lý yêu cầu chuẩn hóa 9 cột với mã định danh `REQ-001` đến `REQ-020`.
5. `docs/DECISIONS.md`: Quyết định kiến trúc, mâu thuẫn kỹ thuật và các phương án bị từ chối.
6. `docs/HANDOFF.md`: Trạng thái bàn giao phiên bản hiện tại và công việc tiếp theo.
7. `docs/CHANGELOG.md`: Lịch sử các thay đổi và tính năng hoàn thiện.
8. `docs/qa/TEST_PLAN.md`: Kế hoạch kiểm thử toàn trang với mã ca kiểm thử `TC-001` đến `TC-020`.
9. `docs/qa/RELEASE_GATE.md`: Tiêu chuẩn và checklist bắt buộc trước khi phát hành.
10. `docs/qa/TEST_CASE_TEMPLATE.md`: Biểu mẫu thiết kế ca kiểm thử chuẩn.
11. `scripts/validate-registry.mjs`: Script kiểm tra cú pháp và bằng chứng của bảng yêu cầu.
12. `scripts/testwebsite.mjs`: Bộ chạy kiểm thử tự động toàn diện qua lệnh `/testwebsite`.
13. `.github/workflows/qa-registry.yml`: Quy trình CI tự động kiểm tra registry trên GitHub Actions.

## 3. CÂU LỆNH THỰC THI KIỂM THỬ
- Kiểm tra tính hợp lệ và bằng chứng của bảng yêu cầu:
  ```bash
  npm run qa:registry
  ```
- Chạy kiểm thử toàn trang và xuất Báo Cáo Kiểm Duyệt Phát Hành:
  ```bash
  npm run testwebsite
  ```
  *(Hoặc nhập lệnh `/testwebsite` trực tiếp trong phiên làm việc với AI)*.
