HỆ THỐNG ANX - QUẢN LÝ TIỀN PHÒNG & THÔNG TIN THÔNG MINH
MASTER SYSTEM PROMPT CHO AI
ĐỌC TÀI LIỆU NÀY
Hỡi AI, nếu bạn đang đọc tài liệu này, bạn đang được chỉ định đóng vai trò là Senior Full-stack Developer phụ trách bảo trì và nâng cấp "Hệ thống Quản lý Tiền phòng & Điện nước AnX". 
Nhiệm vụ của bạn khi đọc tài liệu này:
1. Đọc và ghi nhớ toàn bộ kiến trúc, luồng lệnh (Telegram Bot), cấu trúc API (React Frontend), và các lưu ý bảo mật. Đây là Nguồn Sự Thật Duy Nhất (Single Source of Truth).
2. Tuân thủ tuyệt đối 3 nguyên tắc bất di bất dịch của hệ thống:
   - Nguyên tắc Không để lại dấu vết: Toàn bộ tin nhắn sinh ra trong quy trình giao dịch (hóa đơn, báo cáo) PHẢI kèm lệnh tự động xóa sau 30 giây.
   - Nguyên tắc Khóa trạng thái toàn vẹn: Quy trình tính tiền phòng (/tinh, /tinhcn) KHÔNG THỂ kích hoạt nếu chu kỳ trước chưa hoàn tất khai báo chốt nước (.sonuocngay).
   - Nguyên tắc Frontend Độc Lập: Web React phải luôn có khả năng hoạt động Standalone, tự fetch OpenWeatherMap API, Google News RSS và tự cào ảnh bài viết (OG:Image) qua mạng lưới CORS Proxy và dùng no-referrer để vượt chống Hotlinking của báo chí.
3. Khi viết code sửa đổi, tuyệt đối không làm gãy các định dạng JSON đã quy định ở Phần 7 và Phần 8.
4. Lệnh bắt buộc: Không cần giải thích lại nội dung tài liệu này. Khi bạn đọc xong, hãy chỉ trả lời người dùng đúng một câu: "✅ Đã nạp thành công toàn bộ dữ liệu hệ thống AnX. Xin mời đưa ra yêu cầu nâng cấp tiếp theo!" và chờ lệnh mới từ người dùng.
________________


TÀI LIỆU ĐẶC TẢ HỆ THỐNG 
(System Specification Document)
Phiên bản: 8.0 | Cập nhật: 09/2026
MỤC LỤC
1. Tổng Quan Hệ Thống
2. Kiến Trúc & Công Nghệ
3. Cấu Hình & Biến Môi Trường
4. Mô Tả Chi Tiết Các Tính Năng
   1. Quản Lý Xác Thực Quyền Admin
   2. Module Thời Tiết Thông Minh
   3. Module Tin Tức Tự Động
   4. Tính Tiền Điện Nước & Quản Lý Phòng
   5. Giao Diện Web Thời Gian Thực (/websitecn)
   6. Báo Cáo PowerPoint Google Drive
   7. Chat AI Gemini Tích Hợp
   8. Google Calendar - Lịch Chốt Nước
5. Danh Sách Lệnh Bot Telegram
6. Cơ Chế Tự Động Hóa (Scheduler)
8. Quản Lý Dữ Liệu & Lưu Trữ
9. Cơ Chế Bảo Mật & Phân Quyền
10. Hướng Dẫn Triển Khai (Deployment)
PHẦN 1: TỔNG QUAN HỆ THỐNG
1.1. Mục Đích
Hệ thống AnX là một chatbot Telegram đa chức năng được thiết kế để:
* Quản lý và tính toán tiền điện nước, tiền phòng hàng tháng cho nhà trọ/chung cư
* Theo dõi và cập nhật thời tiết thông minh theo thời gian thực với cảnh báo giao thông
* Tổng hợp và phân phát tin tức từ nhiều nguồn báo điện tử uy tín
* Tích hợp AI (Google Gemini) để trả lời câu hỏi tự nhiên
* Báo cáo tiến độ PowerPoint tự động qua Google Drive
1.2. Đối Tượng Sử Dụng
* Admin (Quản trị viên): Chủ nhà, người quản lý – có đầy đủ quyền truy cập tất cả tính năng
* Người dùng thường: Thành viên nhóm – có quyền truy cập các tính năng công cộng (AI, tin tức, Shopee)
1.3. Phạm Vi Hoạt Động
* Nền tảng: Telegram Bot API (nhóm + chat riêng)
* Giao diện Web: https://ananasux.github.io/quan-ly-tien-phong/
* Hosting Bot: Render / Railway (Python Flask + Long Polling hoặc Webhook)
* Dữ Liệu: File JSON local + Google Docs + Google Drive
PHẦN 2: KIẾN TRÚC & CÔNG NGHỆ
2.1. Ngôn Ngữ & Framework
* Python 3.x (Backend Bot)
* Flask (Web Server / Webhook endpoint)
* React + Vite + TailwindCSS (Frontend Web)
* APScheduler (Tác vụ định kỳ nền)
2.2. Thư Viện Chính
* requests: Gọi Telegram API, OpenWeatherMap API, Google News RSS
* BeautifulSoup4: Phân tích RSS/HTML tin tức
* google-api-python-client: Kết nối Google Drive, Docs, Calendar
* apscheduler: Scheduler chạy ngầm
* flask: Webhook endpoint
* lzstring: Nén dữ liệu để truyền qua URL cho giao diện web
2.3. Dịch Vụ Bên Ngoài Tích Hợp
* Telegram Bot API: Giao tiếp với người dùng
* OpenWeatherMap API: Thời tiết hiện tại, dự báo, chất lượng không khí
* Nominatim (OpenStreetMap): Tìm kiếm tọa độ theo tên địa điểm
* Google News RSS: Tin tức tổng hợp tiếng Việt
* Google Gemini API: Trả lời câu hỏi AI
* Google Drive API v3: Quét file PowerPoint báo cáo
* Google Docs API v1: Lưu trữ logic bộ nhớ, tin tức
* Google Calendar API: Lịch chốt số nước
* YouTube RSS Feed (VTV24): Tin tức video
2.4. Luồng Xử Lý Tổng Quan
[Người dùng] → [Telegram] → [Bot (Flask Webhook / Long Polling)]
                                      ↓
                         [xu_ly_telegram_update()]
                                      ↓
                    [Phân tích lệnh / Phân quyền Admin]
                                      ↓
              ┌──────────────────────────────────────┐
              │  Gọi API bên ngoài trong Thread riêng │
              │  (không block luồng chính)             │
              └──────────────────────────────────────┘
                                      ↓
                         [Trả kết quả về Telegram]
PHẦN 3: CẤU HÌNH & BIẾN MÔI TRƯỜNG
3.1. Biến Bắt Buộc (đặt trong .env hoặc Environment Variables trên server)
TELEGRAM_BOT_TOKEN      = Token bot từ @BotFather (BẮT BUỘC)
OPENWEATHER_API_KEY     = API key từ openweathermap.org
AUTHORIZED_USERNAME     = Username Telegram của Admin (mặc định: anaa2700)
GEMINI_API_KEY          = API key từ Google AI Studio
3.2. Biến Tùy Chọn (có giá trị mặc định)
CALENDAR_ID             = ID Google Calendar (mặc định: mrkun28@gmail.com)
POWERPOINT_FOLDER_ID    = ID thư mục PowerPoint trên Google Drive
DOC_LOGIC_ID            = ID file Google Docs lưu logic bộ nhớ
DOC_NEWS_ID             = ID file Google Docs lưu bản tin tổng hợp
PORT                    = Cổng Flask (mặc định: 10000)
ZALO_WEBHOOK_URL        = URL Webhook Zalo (nếu tích hợp)
3.3. File Cấu Hình Google API
credentials.json: Service Account key từ Google Cloud Console (cần cấp quyền: Drive, Docs, Calendar)
3.4. Thông Số Tính Tiền Mặc Định (cấu hình trong code)
* AN: = 3,500,000 VNĐ (Tiền nhà cố định)
* A3: = 100,000 VNĐ (Phí tiện ích 1)
* A4: = 100,000 VNĐ (Phí tiện ích 2)
* A5: = 100,000 VNĐ (Phí dịch vụ)
* GIA_DIEN: = 3,500 VNĐ/kWh
GIA_NUOC: = 35,000 VNĐ/m³
PHẦN 4: MÔ TẢ CHI TIẾT CÁC TÍNH NĂNG
4.1. Quản Lý Xác Thực Quyền Admin
Hàm: kiem_tra_quyen_admin(chat_id, user_id, username)
Nguyên tắc phân quyền (ưu tiên theo thứ tự):
1. Username khớp với AUTHORIZED_USERNAME → Admin
2. Chat riêng (chat_id == user_id) → Admin (tin nhắn trực tiếp với bot)
Nhóm: Gọi Telegram API getChatMember → Nếu là creator/administrator → Admin
Lưu ý: Hệ thống không lưu danh sách Admin cố định, kiểm tra động mỗi lần nhận lệnh.
4.2. Module Thời Tiết Thông Minh
Hàm chính: lay_thoi_tiet_va_tin_tuc_hien_tai(include_news=True)
Quy trình lấy dữ liệu:
1. Gọi OpenWeatherMap /weather → nhiệt độ, cảm giác, độ ẩm, mô tả, lượng mưa
2. Gọi OpenWeatherMap /forecast → dự báo 3h tới (xác suất mưa, nhiệt độ)
3. Gọi OpenWeatherMap /air_pollution → chỉ số AQI, PM2.5
4. Phân loại trạng thái thời tiết qua xac_dinh_trang_thai_thoi_tiet()
5. Format nội dung tin nhắn đẹp qua format_weather()
* (Nếu include_news=True) Gọi Google News RSS + YouTube VTV24
Các trạng thái thời tiết được xử lý:
* BINH_THUONG: Thời tiết bình thường
* NANG: Nắng (≥28°C, không mưa)
* NANG_GAT: Nắng gắt (≥35°C hoặc cảm giác ≥38°C)
* AM_U: Âm u (độ ẩm >85% không mưa, hoặc mây nhiều)
* MUA_NHO: Mưa nhỏ (có mưa, xác suất <80%)
* MUA_DONG: Mưa dông (kèm sấm, xác suất ≥80%)
* MUA_BAO: Mưa bão (từ khóa bão, cuồng phong)
Bảng điểm đen ngập úng (lay_bang_diem_ngap):
* Chỉ hiển thị khi lượng mưa ≥15mm/h
* Mức NHE: Hiển thị 1-2 điểm ngập
* Mức TO: Hiển thị 3-5 điểm ngập với cảnh báo mức nước
4.3. Module Tin Tức Tự Động
Nguồn RSS được tổng hợp (10 nguồn):
1. Dân Trí (3 chuyên mục)
2. VnExpress (3 chuyên mục)
3. Kênh 14 (3 chuyên mục)
4. Tuổi Trẻ (3 chuyên mục)
5. Thanh Niên (3 chuyên mục)
6. VietnamNet (2 chuyên mục)
7. Lao Động (2 chuyên mục)
8. VTV News (2 chuyên mục)
9. Pháp Luật TP.HCM (1 chuyên mục)
10. Báo Giao Thông (1 chuyên mục)
+ Google News Việt Nam (tổng hợp)
Cơ chế chống trùng lặp:
* Mỗi chat_id có một Set riêng lưu các link đã gửi (sent_articles_set)
* Tự động reset khi Set vượt quá 400 bài (tránh bộ nhớ phình to)
Tự động reset khi số bài chưa gửi ít hơn số yêu cầu
4.4. Tính Tiền Điện Nước & Quản Lý Phòng
Có 2 chế độ tính:
[Chế độ 1] Lệnh /tinh — Nhập từng bước (5 bước):
* B4: Nhập số nước mới (cuối tháng)  [Validate: mới ≥ cũ]
* B5: Nhập số khóa cài đặt
→ Bot tính và gửi hóa đơn đầy đủ (tự xóa sau 30 giây)
[Chế độ 2] Lệnh /tinhcn — Nhập nhanh 1 dòng:
* Format: <SĐ_cũ>;<SĐ_mới>;<SN_cũ>;<SN_mới>;<Số_khóa>
* Ví dụ: 1682;1820;811;819;8
→ Bot tính và gửi hóa đơn ngay lập tức (tự xóa sau 30 giây)
Công thức tính:
* Tiền điện = (SĐ_mới - SĐ_cũ) × 3,500 VNĐ/kWh
* Tiền nước = (SN_mới - SN_cũ) × 35,000 VNĐ/m³
* Phụ phí   = A3 + A4 + A5 = 300,000 VNĐ
TỔNG      = AN + Tiền điện + Tiền nước + Phụ phí
4.5. Giao Diện Web Thời Gian Thực (/websitecn)
Luồng xử lý:
1. Bot nhận lệnh /websitecn
2. Gọi API OpenWeatherMap lấy thời tiết thực tế
3. Gọi hàm lay_tat_ca_bai_viet_ngau_nhien() lấy 10 tin tức mới nhất
4. Đóng gói dữ liệu JSON: { weather: {...}, news: [...] }
5. Nén JSON bằng LZString → tạo URL parameter
6. Tạo link đến GitHub Pages với data đã nén
7. Gửi link cho người dùng qua Telegram
URL cuối cùng:
https://ananasux.github.io/quan-ly-tien-phong/?data=<LZString_compressed>
Giao diện Web (React):
* Responsive: Mobile / Tablet / Desktop (tự động chuyển layout)
* Giải nén LZString từ URL param, merge với defaultData
* Hiển thị: Thông tin thời tiết chi tiết + Danh sách tin tức
Cơ chế an toàn: Nếu thiếu dữ liệu nào → dùng defaultData (không crash)
- Chế Độ Độc Lập (Standalone Real-time): Website (https://ananasux.github.io/Website_thoitiet_design/) có khả năng hoạt động độc lập mà không cần Bot cung cấp payload. 
- Trộn tin tức ngẫu nhiên (Mix RSS): Tự động chọn ngẫu nhiên 2 nguồn báo từ danh sách 11 trang báo lớn (Dân Trí, VnExpress, Tuổi Trẻ, Thanh Niên...) mỗi lần F5, tải tin qua rss2json, xáo trộn (shuffle) và lấy 10 tin mới nhất để đảm bảo sự đa dạng thông tin.
- Cơ chế xử lý ảnh & Vượt Hotlinking: Tải ảnh OpenGraph ngầm (Lazy-load Background) qua mạng lưới CORS Proxy allorigins.win để không block giao diện. Bắt buộc sử dụng thẻ <meta name="referrer" content="no-referrer"> và thuộc tính referrerPolicy="no-referrer" để vượt qua lớp bảo vệ chống câu trộm băng thông (Hotlinking) của các tòa soạn, đảm bảo ảnh luôn hiển thị 100%.
Luồng xử lý:
1. Kết nối Google Drive API bằng credentials.json
2. Quét thư mục POWERPOINT_FOLDER_ID → lấy danh sách thư mục con "TUANx"
3. Với mỗi thư mục TUAN:
   1. Nếu có thư mục con "thu_muc_goc": So sánh file gốc với file đã xử lý
   2. Nếu không có "thu_muc_goc": Quét sâu 2 cấp, tự ghép cặp file
   3. Đánh dấu "(hoàn thành)" cho file đã được xử lý
* Gửi báo cáo đẹp về Telegram (tự xóa sau 2 phút)
Logic ghép cặp file:
* So sánh tên file sau khi chuẩn hóa (loại .pptx, loại khoảng trắng, lowercase)
* Nếu tên file gốc là substring của tên file đã xử lý → coi là hoàn thành
* Tự thêm tiền tố "TuanX_" nếu thiếu
4.7. Chat AI Gemini Tích Hợp
Các lệnh kích hoạt:
* /startgemini hoặc /geminichat: Mở phiên chat AI
* /endgemini: Đóng phiên chat AI
Hành vi khi phiên AI mở:
* Cơ chế tự xóa tin nhắn sau 30 giây bị TẮT
* Mọi tin nhắn không phải lệnh "/" → Gửi đến Gemini API
* Bot trả lời bằng tiếng Việt
Model Gemini (thử lần lượt, fallback tự động):
1. gemini-2.5-flash
2. gemini-2.0-flash
3. gemini-1.5-flash
4. gemini-1.5-flash-latest
5. gemini-1.5-pro
Cơ chế retry: 2 lần mỗi model, delay 1.5s, timeout 50s
4.8. Google Calendar — Lịch Chốt Nước (.sonuocngay)
Luồng xử lý:
1. Admin gõ .sonuocngay
2. Bot hỏi số khối nước tiêu thụ thực tế trong ngày
3. Admin nhập số (VD: 0.5)
4. Bot tính: Số ngày còn lại = CEILING(Số_khóa / Tiêu_thụ_ngày)
5. Ngày chốt nước = Hôm nay + Số ngày còn lại
6. Thêm sự kiện vào Google Calendar
* Thông báo kết quả + trạng thái Calendar (tự xóa sau 30 giây)
Lưu ý: Số_khóa được lấy từ lần tính tiền gần nhất (/tinh hoặc /tinhcn)
________________


PHẦN 5: DANH SÁCH LỆNH BOT TELEGRAM
Lệnh Admin (chỉ Admin mới dùng được):


Lệnh Admin
	Chức năng
	/tinh
	Tính hóa đơn điện nước (từng bước 5 bước)
	/tinhcn
	Tính nhanh hóa đơn (1 dòng: sdcu;sdm;sncm;snm;sk)
	/thoitiethientai
	Thời tiết + tin tức + ghim tin nhắn
	/thoitiet [địa điểm]
	Tra cứu thời tiết theo vùng bất kỳ
	/vung [tên vùng]
	Đổi vùng thời tiết mặc định
	/baocao
	Báo cáo tiến độ PowerPoint (Google Drive)
	/websitecn
	Mở giao diện Web thời tiết & tin tức
	.sonuocngay
	Nhập số nước hàng ngày, tính lịch chốt
	/logicondinh [nội dung]
	Ghi logic mới vào Google Docs bộ nhớ
	Lệnh Công Khai (tất cả người dùng):


Lệnh Công Khai
	Chức năng
	/start, /menu, /help
	Hiển thị menu chính
	/tintuc
	Bản tin tổng hợp 5 báo nóng nhất
	/startgemini
	Mở phiên chat AI Gemini
	/endgemini
	Đóng phiên chat AI Gemini
	/shopee, /shoppe
	Mã giảm giá Shopee hôm nay
	/shopeefd
	Deal ShopeeFood hôm nay
	PHẦN 6: CƠ CHẾ TỰ ĐỘNG HÓA (SCHEDULER)
________________




Job
	Lịch chạy
	Chức năng
	job_thoi_tiet_hang_gio()
	Mỗi giờ :00
	Lấy thời tiết, ghim tin nhắn mới. Giờ 00:00 → Bản tin tổng hợp ngày
	job_tu_dong_day_tin()
	Mỗi giờ :30
	Gửi 5 tin mới nhất cho các nhóm (Cooldown 1h/nhóm)
	job_cap_nhat_docs_tin_tuc()
	00:01 mỗi ngày
	Ghi bản tin ngày vào Google Docs
	* Lưu ý: Mỗi nhóm/chat chỉ nhận tin tức mỗi 1 giờ (user_last_news_sent tracking).
Tin nhắn thời tiết cũ bị xóa và ghim lại mỗi giờ (pinned_weather_msgs).
PHẦN 7: API ENDPOINT & TÍCH HỢP BÊN NGOÀI
________________




URL
	Method
	Mô tả
	/{TELEGRAM_BOT_TOKEN}
	POST
	Telegram Webhook nhận updates
	/webhook
	POST
	Webhook dự phòng (generic)
	/api/daily-news
	GET
	API JSON: thời tiết + tin tức hôm nay
	/ping
	GET
	Health check ("Pong")
	/
	GET
	Trang chủ / version info
	/api/daily-news Response Schema:


{
  "timestamp": "HH:MM DD/MM/YYYY",
  "location": "Tên địa điểm",
  "weather": {
    "current": { "temp", "feels_like", "humidity", "desc", "icon", "pm25", "aqi_level" },
    "forecast_3h": { "temp", "pop", "desc" },
    "status": "TRANG_THAI_THOI_TIET"
  },
  "news": [
    { "title", "description", "link", "image", "source" },
    ...
  ]
}

________________
8.1. File bot_data.json (Lưu trữ local)
Cấu trúc:




{
  "active_auto_news_chats": [list chat_id nhận tin tự động],
  "tracking_data": { "chat_id": so_khoa },
  "active_tracking_chats": [list chat_id theo dõi nước],
  "pinned_weather_msgs": { "chat_id": message_id_ghim },
  "last_weather_alerts": { "chat_id": timestamp },
  "sent_articles_set": { "chat_id": [list link đã gửi] },
  "admin_location": { "lat": float, "lon": float, "name": str },
  "last_report_msgs": { "chat_id": [list message_id báo cáo] },
  "ai_chat_sessions": [list chat_id đang dùng AI]
}
* json_lock (threading.Lock) bảo vệ mọi thao tác đọc/ghi file JSON
queue_lock bảo vệ user_msg_queue (batch delete tin nhắn)
8.3. Cơ Chế Tự Xóa Tin Nhắn
* Tin nhắn người dùng: Tự xóa hàng loạt sau 30 giây (batch delete)
* Hóa đơn tiền nhà và báo cáo: Tự xóa sau 30 giây
* Tin nhắn cảnh báo lỗi: Tự xóa sau 5-10 giây
* Báo cáo PowerPoint: Tự xóa sau 120 giây
Ngoại lệ: Chat đang trong phiên AI (ai_chat_sessions) KHÔNG bị xóa
PHẦN 9: CƠ CHẾ BẢO MẬT & PHÂN QUYỀN
________________


9.1. Bảo Vệ Token
* TELEGRAM_BOT_TOKEN KHÔNG bao giờ hardcode trong code
* Đọc 100% từ biến môi trường hoặc file .env
Bot raise RuntimeError ngay khi khởi động nếu thiếu token
9.2. Phân Quyền Lệnh
* Lệnh Admin: Kiểm tra quyền trước mỗi lệnh nhạy cảm
* Nếu không đủ quyền → Gửi tin cảnh báo + tự xóa sau 5 giây
Không lộ lý do từ chối chi tiết cho người dùng thường
9.3. Bảo Vệ Dữ Liệu
* Hóa đơn tiền nhà tự xóa sau 30 giây (không lưu lâu dài)
* Không log thông tin nhạy cảm ra console
Google credentials.json không được commit lên git
PHẦN 10: HƯỚNG DẪN TRIỂN KHAI (DEPLOYMENT)
________________


10.1. Yêu Cầu Hệ Thống
* Python 3.9+
pip install flask apscheduler requests beautifulsoup4 lzstring google-api-python-client google-auth-httplib2 google-auth-oauthlib
10.2. Triển Khai Trên Render / Railway
1. Fork/Clone repo lên GitHub
2. Tạo Service trên Render, kết nối GitHub repo
3. Cấu hình các Environment Variables (bắt buộc: TELEGRAM_BOT_TOKEN)
4. Upload credentials.json qua Secret Files (nếu dùng Google API)
5. Build command: pip install -r requirements.txt
6. Start command: python main.py
10.3. requirements.txt Tối Thiểu


flask
apscheduler
requests
beautifulsoup4
lxml
lzstring==1.0.4
google-api-python-client
google-auth-httplib2
google-auth-oauthlib
10.4. Chế Độ Hoạt Động
* Long Polling: Khi chạy local hoặc không cấu hình Webhook → Bot tự xóa webhook cũ, bắt đầu polling
Webhook: Khi Telegram gửi updates đến URL server → Cần cấu hình URL Webhook qua Telegram API setWebhook
10.5. Triển Khai Giao Diện Web (GitHub Pages)
1. Cài Node.js + npm
2. cd vào thư mục React frontend
3. npm install
4. Đảm bảo vite.config.ts có: base: '/quan-ly-tien-phong/'
5. npm run build
6. npm run deploy (đẩy thư mục dist/ lên nhánh gh-pages của repo)
Bật GitHub Pages trong Settings → chọn nhánh gh-pages
PHỤ LỤC: SƠ ĐỒ LUỒNG LỆNH /tinhcn
Người dùng gõ: /tinhcn
         ↓
Bot gửi form hướng dẫn nhập nhanh
         ↓
Người dùng gõ: 1682;1820;811;819;8
         ↓
Bot kiểm tra: đủ 5 phần? [Không → Báo lỗi định dạng]
         ↓
Validate: điện mới ≥ điện cũ? [Không → Báo lỗi]
Validate: nước mới ≥ nước cũ? [Không → Báo lỗi]
         ↓
Tính toán hóa đơn
         ↓
Lưu số khóa vào tracking_data
         ↓
Gửi hóa đơn đẹp → Tự xóa sau 30 giây
PHỤ LỤC: SƠ ĐỒ LUỒNG /websitecn
Người dùng gõ: /websitecn
         ↓
Khởi động Thread riêng (không block)
         ↓
Lấy 10 tin tức từ RSS (lay_tat_ca_bai_viet_ngau_nhien)
         ↓
Gọi OpenWeatherMap API lấy thời tiết + AQI thực tế
         ↓
Đóng gói JSON { weather: {...}, news: [...] }
         ↓
Nén bằng LZString → Base64-URL-safe string
         ↓
Tạo URL: https://ananasux.github.io/quan-ly-tien-phong/?data=<compressed>
         ↓
Gửi link cho người dùng qua Telegram
         ↓
[Trên Web] React giải nén LZString → merge với defaultData → Hiển thị UI
Tài liệu này được tạo tự động bởi Hệ thống AnX
Phiên bản: 7.1 | Commit: 48bf762 | Ngày: 25/09/2026