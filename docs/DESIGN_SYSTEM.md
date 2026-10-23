# ALMOND AI SAAS DESIGN SYSTEM
**Nền tảng Thiết kế Mỹ thuật Giao diện (Design System Specification)**
*Tham chiếu chuẩn: [https://almond.framer.website/](https://almond.framer.website/)*
*Phiên bản: 1.0.0 | Ngày áp dụng: 2026-10-23 | Trạng thái: Chuẩn hóa toàn hệ thống*

---

## 1. TRIẾT LÝ THIẾT KẾ (DESIGN PHILOSOPHY)

Hệ thống thiết kế **Almond** được xây dựng dựa trên phong cách **Next-Gen AI SaaS Aesthetic**:
1. **Tinh Khiết & Chiều Sâu (Purity with Ambient Depth)**: Sử dụng bề mặt ấm áp (Warm Alabaster/Porcelain) thay cho màu xám lạnh vô hồn; kết hợp các khối cầu ánh sáng phản quang gradient (Atmospheric Blur Auras).
2. **Điểm Nhấn Sắc Sảo (Electric Royal & Cosmic Violet Glow)**: Tông xanh hoàng gia điện tử tích điện `#2563ff` làm linh hồn điều hướng, hòa quyện cùng sắc tím sâu thẳm `#5715d1` đại diện cho trí tuệ nhân tạo.
3. **Hình Khối Pill & Bo Góc Mềm Mại (Pill Shapes & Continuous Curvature)**: 100% các nút bấm, huy hiệu, ô tìm kiếm và thẻ danh mục sử dụng bo tròn hoàn hảo (`rounded-full` / `50px`), các thẻ lớn bo góc 24px–28px (`rounded-3xl`) tạo cảm giác thân thiện, hiện đại.
4. **Tương Phản Hoàn Hảo (High Legibility Ink Contrast)**: Văn bản sử dụng màu mực đen sâu `#0c0f12` trên nền sáng và trắng sữa `#f4f4f4` trên nền tối, xóa bỏ hoàn toàn hiện tượng mờ nhạt khó đọc.

---

## 2. BẢNG MÀU CHUẨN ALMOND (COLOR PALETTE & TOKENS)

### 2.1. Canvas & Bề Mặt Nền (Surfaces & Backgrounds)

| Tên Token | Mã Hex / RGB | Vai Trò & Vị Trí Áp Dụng |
|---|---|---|
| `--almond-canvas-light` | `#f6f5f4` / `rgb(246, 245, 244)` | Nền toàn trang Light Mode (Warm Alabaster Canvas) |
| `--almond-canvas-dark` | `#0c0f12` / `rgb(12, 15, 18)` | Nền toàn trang Dark Mode (Deep Obsidian Noir) |
| `--almond-surface-card` | `#ffffff` | Bề mặt thẻ bài viết, widget, modal trong Light Mode |
| `--almond-surface-dark` | `#151921` / `rgb(21, 25, 33)` | Bề mặt thẻ bài viết, widget trong Dark Mode |
| `--almond-surface-subtle` | `#f4f4f4` | Bề mặt khối phụ, badge pill, ô input nền mờ |
| `--almond-surface-hover` | `#eef2f6` | Trạng thái hover của các nút phụ và thẻ danh mục |

### 2.2. Màu Thương Hiệu & Điểm Nhấn (Brand Accents & Gradients)

| Tên Token | Mã Hex / RGB | Vai Trò & Vị Trí Áp Dụng |
|---|---|---|
| `--almond-blue-primary` | `#2563ff` / `rgb(37, 99, 255)` | Màu chủ đạo CTA, tab đang chọn, icon nổi bật, focus ring |
| `--almond-blue-hover` | `#1d4ed8` / `rgb(29, 78, 216)` | Trạng thái hover của nút chính |
| `--almond-blue-soft` | `#b8ccff` / `rgb(184, 204, 255)` | Viền sáng phản quang, badge mềm, text sáng trong nền tối |
| `--almond-violet-ai` | `#5715d1` / `rgb(87, 21, 209)` | Điểm nhấn AI, gradient khối thời tiết, cosmic aura |
| `--almond-sky-accent` | `#68dbff` / `rgb(104, 219, 255)` | Khối cầu ánh sáng phụ, phản quang nền thẻ |
| `--almond-warm-amber` | `#ff7917` / `rgb(255, 121, 23)` | Cảnh báo thời tiết, thẻ tin nóng, giá vàng biến động |
| `--almond-mint-green` | `#25caac` / `rgb(37, 202, 172)` | Trạng thái không khí trong lành (AQI tốt), chỉ số tăng trưởng |

### 2.3. Màu Văn Bản & Mực Đọc (Typography Inks)

| Tên Token | Mã Hex / RGB | Mô Tả & Vị Trí Sử Dụng |
|---|---|---|
| `--almond-text-headline` | `#0c0f12` | Tiêu đề chính H1-H3, tên bài viết, giá vàng, nhiệt độ |
| `--almond-text-body` | `#4e5b6d` | Thân bài, tóm tắt bài báo, mô tả thời tiết, khuyến cáo |
| `--almond-text-muted` | `#7c8792` | Ngày tháng, tên tác giả, nhãn phụ, footer copyright |
| `--almond-text-dark-h` | `#ffffff` | Tiêu đề trong chế độ Dark Mode |
| `--almond-text-dark-b` | `#94a3b8` | Thân bài trong chế độ Dark Mode |
| `--almond-text-dark-m` | `#64748b` | Nhãn phụ trong chế độ Dark Mode |

### 2.4. Viền & Đường Ngăn Cách (Borders & Dividers)

| Tên Token | Mã Hex / RGB | Vị Trí Sử Dụng |
|---|---|---|
| `--almond-border-light` | `#d8dbdf` / `rgba(216, 219, 223, 0.8)` | Viền thẻ bài viết, viền header, viền modal |
| `--almond-border-subtle` | `rgba(107, 110, 148, 0.12)` | Viền chia ngăn mờ nhẹ, viền tag chip |
| `--almond-border-glow` | `rgba(37, 99, 255, 0.25)` | Viền phản quang khi hover hoặc focus |
| `--almond-border-dark` | `rgba(255, 255, 255, 0.08)` | Viền các phần tử trong Dark Mode |

---

## 3. HỆ THỐNG GRADIENT & AMBIENT AURA

### 3.1. Hero Weather Card Gradient (Khối Khí Tượng Chủ Đạo)
```css
/* Light Mode: Electric Blue to Deep Cosmic Violet */
background: linear-gradient(135deg, #1d4ed8 0%, #2563ff 50%, #5715d1 100%);
box-shadow: 0 20px 50px -12px rgba(37, 99, 255, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.2);

/* Dark Mode: Deep Cosmic Void to Royal Electric Glow */
background: linear-gradient(135deg, #0c0f12 0%, #14062d 50%, #2563ff 100%);
box-shadow: 0 20px 50px -12px rgba(87, 21, 209, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.1);
```

### 3.2. Ambient Glow Spheres (Cầu Ánh Sáng Phản Quang)
- **Top Right Orb**: `w-56 h-56 rounded-full bg-[#b8ccff]/20 blur-3xl`
- **Bottom Left Orb**: `w-48 h-48 rounded-full bg-[#68dbff]/20 blur-3xl`

### 3.3. Logo Gradient
```css
background: linear-gradient(135deg, #2563ff 0%, #5715d1 60%, #ff7917 100%);
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
```

---

## 4. HỆ THỐNG BÓNG ĐỔ (ELEVATION & SHADOWS)

- **Almond Soft Floating Shadow (Thẻ Bài Báo & Widget)**:
  `box-shadow: 0 12px 32px -8px rgba(107, 110, 148, 0.08), 0 0 0 1px #d8dbdf;`
- **Almond Active Glow Shadow (Tab Đang Chọn & Primary Button)**:
  `box-shadow: 0 8px 20px -4px rgba(37, 99, 255, 0.35);`
- **Almond Modal Elevation**:
  `box-shadow: 0 32px 64px -16px rgba(12, 15, 18, 0.25), 0 0 0 1px rgba(216, 219, 223, 0.8);`

---

## 5. QUY CHUẨN THÀNH PHẦN (COMPONENT SPECIFICATIONS)

### 5.1. Nút & Tab Danh Mục (Pill Navigation Tabs)
- Bo góc: `rounded-full` (`9999px`).
- Padding: `px-4 py-2` (Desktop) hoặc `px-3.5 py-1.5` (Mobile).
- Trạng thái Active:
  `bg-[#2563ff] text-white font-semibold shadow-[0_4px_14px_rgba(37,99,255,0.35)] scale-[1.02]`.
- Trạng thái Inactive:
  `bg-white dark:bg-[#151921] text-[#4e5b6d] dark:text-[#94a3b8] border border-[#d8dbdf] dark:border-slate-800 hover:border-[#2563ff] hover:text-[#2563ff] transition-all`.

### 5.2. Thẻ Tin Tức (Neo-Editorial News Card)
- Bo góc ngoài: `rounded-3xl` (`24px`).
- Bề mặt: `bg-white dark:bg-[#151921] border border-[#d8dbdf] dark:border-slate-800`.
- Hiệu ứng hover: `hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-xl hover:-translate-y-1 transition-all duration-300`.
- Ảnh bài viết: Bo góc mềm mại `rounded-2xl` với tỉ lệ vàng 16:10, hiệu ứng zoom kính mờ `group-hover:scale-105 transition-transform duration-500`.

### 5.3. Huy Hiệu Trạng Thái & Vị Trí (Badges & Chips)
- Định vị tự động: `📍 Vị trí · [Giờ] (Tự động)` với nền `bg-blue-50 dark:bg-blue-950/40 text-[#2563ff] dark:text-[#b8ccff] border border-blue-200/60 dark:border-blue-800/60`.
- Vị trí thủ công: `📌 Vị trí · [Giờ] (Tự chọn)` với nền `bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200/60`.

---

## 6. MA TRẬN MÀU DARK MODE SO VỚI LIGHT MODE

| Phần Tử Giao Diện | Light Mode (Almond Porcelain) | Dark Mode (Almond Obsidian) |
|---|---|---|
| **Nền trang chính** | `#f6f5f4` (Warm Alabaster) | `#0c0f12` (Deep Noir) |
| **Header Bar** | `#ffffff` / viền `#d8dbdf` | `#151921` / viền `rgba(255,255,255,0.08)` |
| **Thẻ Tin Tức** | `#ffffff` / viền `#d8dbdf` | `#151921` / viền `rgba(255,255,255,0.08)` |
| **Thẻ Thời Tiết** | Gradient Blue - Violet | Gradient Noir - Cosmic Violet |
| **Chữ Tiêu Đề** | `#0c0f12` | `#ffffff` |
| **Chữ Nội Dung** | `#4e5b6d` | `#94a3b8` |
| **Nút Chính** | `#2563ff` (Hover `#1d4ed8`) | `#2563ff` (Hover `#3b82f6`) |
| **Modal Nền Mờ** | `bg-[#0c0f12]/60 backdrop-blur-md` | `bg-[#000000]/80 backdrop-blur-md` |
