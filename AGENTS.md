# figma-make-app

React + Vite + Tailwind CSS project running inside Figma Make.

## Development Server

A Vite development server is **already running** on `$PORT` (default 8443). You don't need to start it manually.

- Preview URL: The user can access the running app through the preview panel
- Hot reload: Changes to source files are reflected immediately

## Project Structure

This is the canonical project structure. Start with task-relevant files below. Only follow imports or inspect other files when required, when a documented path is missing, or when the repository contradicts this guide.

- `src/main.tsx` - React entrypoint; imports `src/index.css` and mounts `src/App.tsx` into the `#root` element
- `src/App.tsx` - Primary application component and the usual starting point for UI work
- `src/index.css` - Global CSS entrypoint and Tailwind CSS v4 import
- `index.html` - Vite HTML shell containing the `#root` element and loading `src/main.tsx`
- `package.json` - Project dependencies and the Vite build, development, preview, and formatting scripts
- `vite.config.ts` - Vite configuration with React, Tailwind CSS v4, and Figma Make plugins plus the `@` alias for `src`
- `.mise.toml` - Toolchain versions for Node.js and pnpm

## Dependencies

- Runtime: React 19 and React DOM 19
- Styling: Tailwind CSS v4 with the `@tailwindcss/vite` plugin
- Build tooling: Vite 8, TypeScript 5.7, and `@vitejs/plugin-react`
- Formatting: oxfmt

## Styling

This project uses **Tailwind CSS v4** through the `@tailwindcss/vite` plugin configured in `vite.config.ts`. `src/index.css` imports Tailwind with `@import 'tailwindcss';`. Use Tailwind utility classes directly in JSX and put global CSS or Tailwind v4 theme customization in `src/index.css`. This scaffold does not need a Tailwind config file or PostCSS config.

`src/main.tsx` imports `src/index.css`, so global font wiring belongs in `src/index.css`. Keep CSS `@import` statements first, then add any `@font-face` rules and font-family defaults there.

---

# SYSTEM ADDENDUM — ALWAYS-ON PROJECT MEMORY PROTOCOL

## HỒ SƠ BỘ NHỚ DỰ ÁN (PROJECT MEMORY REGISTRY)
Mọi tác nhân khi làm việc với dự án BẮT BUỘC phải đọc và cập nhật các tài liệu lưu trữ chuẩn sau đây:
- **HANDOFF**: `docs/project_memory/HANDOFF.md` — Trạng thái mới nhất của dự án, nhánh git, commit gần nhất, tiến độ và công việc tiếp theo.
- **REQUIREMENTS**: `docs/project_memory/REQUIREMENTS.md` — Toàn bộ các yêu cầu chức năng, phi chức năng, quy chuẩn giao diện và tiêu chí nghiệm thu đã chốt.
- **DECISIONS**: `docs/project_memory/DECISIONS.md` — Quyết định kiến trúc, lựa chọn kỹ thuật, các phương án đã thống nhất và phương án bị loại bỏ.

## 1. PHẠM VI ÁP DỤNG

Quy tắc này áp dụng cho MỌI tin nhắn mới của người dùng trong phạm vi dự án, không chỉ khi bắt đầu dự án hoặc khi được yêu cầu lập kế hoạch.

Không được tự ý bỏ qua quy trình này vì câu hỏi ngắn, yêu cầu sửa lỗi nhỏ, yêu cầu bổ sung tính năng, yêu cầu viết code hoặc yêu cầu tiếp tục công việc cũ.

## 2. BẮT BUỘC ĐỌC TRƯỚC KHI TRẢ LỜI

Khi nhận bất kỳ tin nhắn mới nào liên quan đến dự án, hãy thực hiện theo thứ tự:

BƯỚC 1 — Xác định dự án và nhiệm vụ liên quan.

BƯỚC 2 — Đọc hồ sơ trạng thái mới nhất của dự án, bao gồm HANDOFF, REQUIREMENTS, DECISIONS và các tài liệu liên quan trực tiếp.

BƯỚC 3 — Đọc các yêu cầu cũ, quyết định, giới hạn và điều kiện nghiệm thu có liên quan đến câu hỏi mới.

BƯỚC 4 — Kiểm tra xem yêu cầu mới có mâu thuẫn với quyết định hoặc yêu cầu hiện hành hay không.

BƯỚC 5 — Xác định nội dung nào đã được xác nhận, nội dung nào chưa được xác minh và nội dung nào còn thiếu.

BƯỚC 6 — Sau khi đối chiếu, mới trả lời, lập kế hoạch, viết code hoặc thực hiện thay đổi.

Nếu câu hỏi chỉ mang tính trao đổi thông thường và không ảnh hưởng đến dự án, không cần đọc toàn bộ hồ sơ; chỉ truy xuất phần ngữ cảnh thực sự liên quan.

Không được tuyên bố đã đọc tài liệu nếu chưa truy cập và đọc được tài liệu đó.

## 3. BẮT BUỘC GHI NHẬN THÔNG TIN MỚI

Sau mỗi tin nhắn, phân loại thông tin thành:

- Yêu cầu mới.
- Thay đổi yêu cầu hiện hành.
- Quyết định đã được xác nhận.
- Ý tưởng hoặc đề xuất chưa được chấp thuận.
- Thông tin bối cảnh.
- Kết quả thực hiện.
- Lỗi hoặc vấn đề mới.
- Thông tin tạm thời, chưa xác minh hoặc không cần lưu lâu dài.

Chỉ cập nhật trạng thái chính thức khi có đủ căn cứ.

Không biến một ý tưởng thành yêu cầu bắt buộc nếu người dùng chưa chấp thuận.

Không tự ghi đè quyết định cũ khi chưa xác định rõ phạm vi thay thế.

## 4. QUY TẮC GHI NHỚ THEO MỨC ĐỘ QUAN TRỌNG

Ưu tiên lưu:
1. Các yêu cầu bắt buộc và điều kiện không được vi phạm.
2. Các quyết định đã xác nhận và phương án đã bị từ chối.
3. Trạng thái nhiệm vụ và kết quả kiểm thử.
4. Các thay đổi ảnh hưởng đến kiến trúc hoặc hành vi hệ thống.
5. Những lỗi chưa giải quyết và công việc tiếp theo.

Không cần lưu mọi câu nói, câu hỏi thông thường hoặc thông tin không có giá trị sử dụng lâu dài vào bộ nhớ dự án.

## 5. KIỂM TRA SAU KHI THỰC HIỆN

Sau mỗi thay đổi, đối chiếu kết quả với:
- Yêu cầu mới.
- Các yêu cầu cũ có liên quan.
- Quyết định đã chốt.
- Các chức năng có nguy cơ bị ảnh hưởng.
- Tiêu chí nghiệm thu.

Nếu phát hiện vi phạm, phải sửa hoặc báo cáo rõ; không được âm thầm bỏ qua.

## 6. CẬP NHẬT HỒ SƠ NGAY SAU KHI CÓ THAY ĐỔI

Khi có yêu cầu, quyết định hoặc kết quả mới cần lưu:
1. Cập nhật tài liệu nguồn chuẩn có liên quan.
2. Cập nhật trạng thái nhiệm vụ.
3. Ghi lịch sử thay đổi khi cần.
4. Kiểm tra tính nhất quán giữa các tài liệu.
5. Xác nhận tài liệu đã thực sự được lưu thành công nếu công cụ cung cấp bằng chứng lưu.

Nếu không có quyền ghi file, không có công cụ lưu hoặc thao tác lưu thất bại, phải thông báo rõ. Không được giả vờ đã lưu thông tin.

## 7. BẮT BUỘC ĐỐI CHIẾU TRƯỚC KHI KẾT THÚC MỖI LƯỢT

Trước khi kết thúc câu trả lời liên quan đến dự án, tự kiểm tra:
- Tôi đã sử dụng đúng trạng thái mới nhất chưa?
- Có yêu cầu cũ nào liên quan bị bỏ sót không?
- Có quyết định nào bị mâu thuẫn không?
- Có thông tin nào tôi đang suy đoán nhưng chưa xác minh không?
- Có trạng thái hoặc quyết định mới nào cần lưu không?
- Tôi có đang tuyên bố hoàn thành vượt quá những gì đã kiểm chứng không?

Chỉ trình bày kết quả sau khi đã đối chiếu.

## 8. KHI KHÔNG THỂ ĐỌC HOẶC GHI NHỚ

Nếu hồ sơ không truy cập được:
- Nêu rõ phần dữ liệu không thể truy cập.
- Không khẳng định đã kiểm tra hồ sơ.
- Yêu cầu người dùng cung cấp tài liệu hoặc kết nối nguồn dữ liệu phù hợp khi cần thiết.
- Chỉ tiếp tục những việc có thể thực hiện an toàn mà không phụ thuộc vào dữ liệu còn thiếu.

Nếu không thể ghi dữ liệu bền vững:
- Phân biệt rõ thông tin mới chỉ được ghi nhận trong hội thoại với thông tin đã được lưu vào tài liệu.
- Cung cấp nội dung cập nhật để người dùng lưu lại nếu cần.

## 9. KHỞI ĐỘNG LẠI SAU KHI CHUYỂN PHIÊN

Ở đầu mỗi phiên mới, đọc hồ sơ bàn giao mới nhất và kiểm tra phiên bản thực tế của dự án trước khi tiếp tục.

Không coi nội dung trong trí nhớ mô hình là bằng chứng duy nhất cho trạng thái dự án.

Nếu có khác biệt giữa hồ sơ và trạng thái thực tế, ghi nhận khác biệt và xác minh trước khi thay đổi.

## 10. NGUYÊN TẮC KHÔNG NGOẠI LỆ

Không được bỏ qua quy trình chỉ vì muốn trả lời nhanh.

Không được hy sinh yêu cầu đã xác nhận để tối ưu riêng nhiệm vụ mới.

Không được tự nhận đã lưu, đã kiểm tra hoặc đã hoàn thành nếu chưa thực hiện.

Ưu tiên nguồn dữ liệu chuẩn mới nhất, tính nhất quán, khả năng truy vết và bằng chứng thực tế.

Đây là quy trình vận hành thường trực cho toàn bộ vòng đời dự án.
