// ── Live API integration ──────────────────────────────────────────────────────
// Bot truyền URL API qua query param ?api=<encoded_url>
// Ví dụ: https://website.../  ?api=https%3A%2F%2Fbot-server%2Fapi%2Fdaily-news
// Nếu không có ?api thì dùng mock data (chế độ preview thiết kế)

import { useState, useEffect, useRef } from "react";

const assetPathPrefix = (import.meta.env.BASE_URL === "/" ? "" : import.meta.env.BASE_URL.replace(/\/$/, "")) + "/assets";

function useCurrentTime() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);
  return now;
}

const imgMoreHorizontal = `${assetPathPrefix}/eff74.svg`;
const imgSearch = `${assetPathPrefix}/ad518.svg`;
const imgNews1 = `${assetPathPrefix}/c0fcf.png`;
const imgNews2 = `${assetPathPrefix}/d5053.png`;
const imgNews3 = `${assetPathPrefix}/a9902.png`;
const imgNews4 = `${assetPathPrefix}/79d9c.png`;
const imgNews5 = `${assetPathPrefix}/5b63a.png`;
const imgTabletNews3 = `${assetPathPrefix}/192b8.png`;
const imgTabletNews4 = `${assetPathPrefix}/645e7.png`;
const imgTabletNews5 = `${assetPathPrefix}/ef83c.png`;
const imgDesktopNews3 = `${assetPathPrefix}/d84e7.png`;
const imgDesktopNews4 = `${assetPathPrefix}/6ef75.png`;
const imgDesktopNews5 = `${assetPathPrefix}/740c6.png`;

// ── Weather condition theme map ───────────────────────────────────────────────

type ConditionKey = "binh-thuong" | "nang" | "nang-gat" | "am-u" | "mua-nho" | "mua-dong";

interface WeatherTheme {
  key: ConditionKey;
  gradient: string;
  emoji: string;
  label: string;
  warningText: string;
  suggestionItems: string[];
  showFlood: boolean;
  floodItems?: string[];
  showRouteAdvisory: boolean;
  routeItems?: string[];
  video?: { title: string, link: string };
}

const WEATHER_THEMES: Record<ConditionKey, WeatherTheme> = {
  "binh-thuong": {
    key: "binh-thuong",
    gradient: "linear-gradient(135deg, #506477 0%, #73879a 50%, #9aa9b5 100%)",
    emoji: "☁️",
    label: "Bình thường",
    warningText: "Thời tiết ổn định, ít biến động. Không có hiện tượng bất thường đáng chú ý.",
    suggestionItems: [
      "• Điều khiển phương tiện: Giao thông thuận lợi, chú ý tốc độ theo quy định.",
      "• Trang bị: Không cần trang bị đặc biệt.",
    ],
    showFlood: false,
    showRouteAdvisory: false,
  },
  "nang": {
    key: "nang",
    gradient: "linear-gradient(135deg, #1e73be 0%, #58a8dc 50%, #f7a928 100%)",
    emoji: "☀️",
    label: "Nắng",
    warningText: "Trời nắng đẹp, tầm nhìn tốt. Chỉ số UV ở mức trung bình đến cao.",
    suggestionItems: [
      "• Điều khiển phương tiện: Giao thông thuận lợi, chú ý chống chói khi lái xe.",
      "• Trang bị: Nên đội mũ, đeo kính râm, bôi kem chống nắng nếu ra ngoài lâu.",
    ],
    showFlood: false,
    showRouteAdvisory: false,
  },
  "nang-gat": {
    key: "nang-gat",
    gradient: "linear-gradient(135deg, #b93815 0%, #ef6c20 50%, #f7a928 100%)",
    emoji: "🔥",
    label: "Nắng gắt",
    warningText: "Nắng nóng gay gắt, chỉ số UV rất cao. Nguy cơ say nắng, mất nước cao nếu hoạt động ngoài trời lâu.",
    suggestionItems: [
      "• Điều khiển phương tiện: Hạn chế di chuyển giờ cao điểm nắng (11h–15h). Để xe ở nơi có bóng râm, kiểm tra áp suất lốp.",
      "• Trang bị: Đội mũ rộng vành, đeo kính râm UV400, mang theo nước uống, bôi kem chống nắng SPF50+.",
    ],
    showFlood: false,
    showRouteAdvisory: false,
  },
  "am-u": {
    key: "am-u",
    gradient: "linear-gradient(135deg, #34495e 0%, #52697e 50%, #75889a 100%)",
    emoji: "🌥️",
    label: "Âm u",
    warningText: "Trời nhiều mây, ánh sáng yếu. Có thể chuyển mưa nhẹ trong vài giờ tới nếu độ ẩm tăng cao.",
    suggestionItems: [
      "• Điều khiển phương tiện: Tầm nhìn hơi giảm, nên bật đèn chiếu gần khi đi vào khu vực tối.",
      "• Trang bị: Mang theo áo mưa mỏng phòng trường hợp mưa bất ngờ.",
    ],
    showFlood: false,
    showRouteAdvisory: false,
  },
  "mua-nho": {
    key: "mua-nho",
    gradient: "linear-gradient(135deg, #1e3a5f 0%, #2d6a9f 50%, #4c93c3 100%)",
    emoji: "🌦️",
    label: "Mưa nhỏ",
    warningText: "Mưa nhỏ diện rộng, tầm nhìn giảm nhẹ. Mặt đường bắt đầu ướt, ma sát giảm.",
    suggestionItems: [
      "• Điều khiển phương tiện: Giảm tốc độ, giữ khoảng cách an toàn, tránh phanh gấp.",
      "• Trang bị: Nên mặc áo mưa, bọc kỹ thiết bị điện tử.",
    ],
    showFlood: true,
    floodItems: ["• Chưa ghi nhận dữ liệu điểm ngập đáng chú ý."],
    showRouteAdvisory: false,
  },
  "mua-dong": {
    key: "mua-dong",
    gradient: "linear-gradient(135deg, #111827 0%, #293a55 50%, #475569 100%)",
    emoji: "⛈️",
    label: "Mưa dông",
    warningText: "Mưa dông kèm sấm chớp, gió giật mạnh cục bộ. Nguy cơ ngập úng nhanh, cây đổ, mất điện.",
    suggestionItems: [
      "• Điều khiển phương tiện: Tránh đi dưới cây lớn, biển quảng cáo. Giảm tốc độ, bật đèn khi tầm nhìn giảm.",
      "• Trang bị: Áo mưa bộ rời, ủng cao su, tránh dùng ô khi có gió mạnh.",
    ],
    showFlood: true,
    floodItems: [
      "• Văn Quán | 32–58cm | CẤM XE GẦM THẤP — Hồ Văn Quán, Chiến Thắng. Nguy cơ thủy kích",
      "• Phúc La | 26–52cm | CẤM XE GẦM THẤP — Khu Viện K, KĐT Xa La. Nước dâng nhanh",
      "• Hà Cầu | 19–32cm | ĐI CHẬM — Chợ Hà Đông, Lê Lợi. Khu vực trũng",
      "• Vạn Phúc | 19–32cm | ĐI CHẬM — Ngã tư Vạn Phúc, Tố Hữu. Khu vực trũng",
      "• Tân Triều | 39–65cm | CẤM XE GẦM THẤP — Triều Khúc, ngõ 66. Nguy cơ ngập sâu",
    ],
    showRouteAdvisory: true,
    routeItems: [
      "• Đường tránh ngập: Ưu tiên các tuyến đường cao, tránh khu vực trũng.",
      "• Giao thông công cộng: Ưu tiên tàu điện/metro nếu có.",
      "• Khuyến cáo: Không cố đi vào vùng ngập sâu.",
    ],
  },
};

// ── Detect condition key from real weather data ───────────────────────────────

function detectConditionKey(conditionLabel: string): ConditionKey {
  const s = conditionLabel.toLowerCase();
  if (s.includes("dông") || s.includes("dong")) return "mua-dong";
  if (s.includes("mưa") || s.includes("mua")) return "mua-nho";
  if (s.includes("nắng gắt") || s.includes("nang gat")) return "nang-gat";
  if (s.includes("nắng") || s.includes("nang")) return "nang";
  if (s.includes("âm u") || s.includes("am u")) return "am-u";
  return "binh-thuong";
}

// ── Weather data type ─────────────────────────────────────────────────────────
type WeatherEntry = {
  time: string; location: string; locationFull: string;
  temp: string; feelsLike: string; conditionLabel: string;
  humidity: string; pm25: string; wind: string; forecastText: string;
};

// ── Default mock data (fallback khi chưa có API) ──────────────────────────────
const DEFAULT_WEATHER_DATA: Record<ConditionKey, WeatherEntry> = {
  "binh-thuong": { time: "08:00", location: "Quận Hà Đông, Hà Nội", locationFull: "Quận Hà Đông, Thành phố Hà Nội", temp: "26.0°C", feelsLike: "27.0°C", conditionLabel: "Bình thường", humidity: "60%", pm25: "18.50 µg/m³", wind: "8 km/h", forecastText: "~26°C | Trời đẹp | Mưa: 5%" },
  "nang":        { time: "10:30", location: "Quận Hà Đông, Hà Nội", locationFull: "Quận Hà Đông, Thành phố Hà Nội", temp: "31.0°C", feelsLike: "34.0°C", conditionLabel: "Nắng", humidity: "55%", pm25: "22.10 µg/m³", wind: "10 km/h", forecastText: "~32°C | Nắng | Mưa: 2%" },
  "nang-gat":   { time: "13:00", location: "Quận Hà Đông, Hà Nội", locationFull: "Quận Hà Đông, Thành phố Hà Nội", temp: "38.5°C", feelsLike: "43.2°C", conditionLabel: "Nắng gắt", humidity: "42%", pm25: "35.80 µg/m³", wind: "6 km/h", forecastText: "~39°C | Nắng gắt | Mưa: 0%" },
  "am-u":       { time: "14:00", location: "Quận Hà Đông, Hà Nội", locationFull: "Quận Hà Đông, Thành phố Hà Nội", temp: "27.0°C", feelsLike: "29.5°C", conditionLabel: "Âm u", humidity: "75%", pm25: "20.00 µg/m³", wind: "9 km/h", forecastText: "~27°C | Âm u | Mưa: 8%" },
  "mua-nho":    { time: "16:55", location: "Quận Hà Đông, Hà Nội", locationFull: "Quận Hà Đông, Thành phố Hà Nội", temp: "29.5°C", feelsLike: "33.3°C", conditionLabel: "Mưa nhỏ", humidity: "68%", pm25: "14.33 µg/m³", wind: "12 km/h", forecastText: "~29.5°C | Mưa nhỏ | Mưa: 13%" },
  "mua-dong":   { time: "17:30", location: "Quận Hà Đông, Hà Nội", locationFull: "Quận Hà Đông, Thành phố Hà Nội", temp: "25.0°C", feelsLike: "24.0°C", conditionLabel: "Mưa dông", humidity: "88%", pm25: "12.00 µg/m³", wind: "35 km/h", forecastText: "~24°C | Mưa dông | Mưa: 80%" },
};

// ── Ánh xạ trạng thái bot (BINH_THUONG, MUA_DONG …) → ConditionKey ───────────
function mapBotStatusToCondKey(status: string): ConditionKey {
  const s = status.toUpperCase();
  if (s === "MUA_BAO" || s === "MUA_DONG") return "mua-dong";
  if (s === "MUA_NHO" || s === "MUA_NHE") return "mua-nho";
  if (s === "NANG_GAT") return "nang-gat";
  if (s === "NANG") return "nang";
  if (s === "AM_U") return "am-u";
  return "binh-thuong";
}

// ── PM2.5 icon helper ─────────────────────────────────────────────────────────
function pm25Icon(val: number): string {
  if (val <= 12) return "✅";
  if (val <= 35.4) return "⚠️";
  return "❌";
}

// ── Shared weather section ────────────────────────────────────────────────────

interface LiveOverrides {
  warningText?: string;
  suggestionItems?: string[];
  floodItems?: string[];
  routeItems?: string[];
}

function WeatherSection({
  compact = false,
  condKey,
  liveData,
  liveOverrides,
}: {
  compact?: boolean;
  condKey: ConditionKey;
  liveData?: Record<ConditionKey, WeatherEntry>;
  liveOverrides?: LiveOverrides;
}) {
  const baseTheme = WEATHER_THEMES[condKey];
  const WEATHER = (liveData ?? DEFAULT_WEATHER_DATA)[condKey];

  // Use live data if available, otherwise fall back to theme defaults
  const warningText = liveOverrides?.warningText ?? baseTheme.warningText;
  const suggestionItems = liveOverrides?.suggestionItems ?? baseTheme.suggestionItems;
  const floodItems = liveOverrides?.floodItems ?? baseTheme.floodItems;
  const routeItems = liveOverrides?.routeItems ?? baseTheme.routeItems;
  const showFlood = liveOverrides ? (liveOverrides.floodItems != null && liveOverrides.floodItems.length > 0) : baseTheme.showFlood;
  const showRouteAdvisory = liveOverrides ? (liveOverrides.routeItems != null && liveOverrides.routeItems.length > 0) : baseTheme.showRouteAdvisory;

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Hero card */}
      <div
        className="flex flex-col gap-4 items-start overflow-hidden p-6 rounded-2xl shadow-[0px_4px_12px_0px_rgba(23,33,51,0.1)] w-full"
          style={{ background: "linear-gradient(21deg, rgb(72 141 203) 0%, rgb(51 106 214) 50%, rgb(79 196 255) 100%)" }}
      >
        <p className="font-['Inter:Semi_Bold'] font-semibold text-[13px] text-white whitespace-nowrap">
          📍 {compact ? WEATHER.location : WEATHER.locationFull} · {WEATHER.time}
        </p>
        <div className="flex flex-col gap-1 items-start w-full">
          <p className="font-['Inter:Extra_Bold'] font-extrabold leading-none text-[60px] text-white whitespace-nowrap">
            {WEATHER.temp}
          </p>
          <p className="font-['Inter:Semi_Bold'] font-semibold text-[18px] text-white whitespace-nowrap">
            {baseTheme.emoji} {baseTheme.label}
          </p>
          <p className="font-['Inter:Regular'] font-normal text-[14px] text-[rgba(255,255,255,0.8)] whitespace-nowrap">
            Cảm nhận {WEATHER.feelsLike}
          </p>
        </div>
        <div className="flex gap-2 items-start w-full text-[13px]">
          <div className="bg-[rgba(255,255,255,0.09)] border border-[rgba(255,255,255,0.2)] flex flex-1 flex-col gap-2 items-start min-w-0 overflow-hidden p-4 rounded-2xl">
            <p className="font-['Inter:Bold'] font-bold text-white whitespace-nowrap">💧 Độ ẩm</p>
            <p className="font-['Inter:Regular'] font-normal leading-5 text-[rgba(255,255,255,0.75)]">{WEATHER.humidity}</p>
          </div>
          <div className="bg-[rgba(255,255,255,0.09)] border border-[rgba(255,255,255,0.2)] flex flex-1 flex-col gap-2 items-start min-w-0 overflow-hidden p-4 rounded-2xl">
            <p className="font-['Inter:Bold'] font-bold text-white whitespace-nowrap">PM2.5</p>
            <p className="font-['Inter:Regular'] font-normal leading-5 text-[rgba(255,255,255,0.75)]">{WEATHER.pm25}</p>
          </div>
        </div>
      </div>

      {/* Forecast */}
      <div className="bg-white border border-[#e3e7ef] flex flex-col gap-2 items-start overflow-hidden p-4 rounded-2xl text-[13px] w-full">
        <p className="font-['Inter:Bold'] font-bold text-[#182033] whitespace-nowrap">DỰ BÁO 3 GIỜ TỚI</p>
        <p className="font-['Inter:Regular'] font-normal leading-5 text-[#5f687b] w-full">{WEATHER.forecastText}</p>
      </div>

      {/* Warning – only show when we have real warning text */}
      {warningText && (
        <div className="bg-[#fff7ed] border border-[#e3e7ef] flex flex-col gap-2 items-start overflow-hidden p-4 rounded-2xl text-[13px] w-full">
          <p className="font-['Inter:Bold'] font-bold text-[#182033] whitespace-nowrap">🚨 CẢNH BÁO TRỌNG TÂM</p>
          <div className="flex flex-col gap-1 w-full">
              {warningText.split('\n').map((line, i) => (
                <p key={i} className="font-['Inter:Regular'] font-normal leading-5 text-[#5f687b] w-full">{line}</p>
              ))}
            </div>
        </div>
      )}

      {/* Suggestion – only show when we have items */}
      {suggestionItems && suggestionItems.length > 0 && (
        <div className="bg-[#f0fdf4] border border-[#e3e7ef] flex flex-col gap-2 items-start overflow-hidden p-4 rounded-2xl text-[13px] w-full">
          <p className="font-['Inter:Bold'] font-bold text-[#182033] whitespace-nowrap">💡 GỢI Ý LỊCH TRÌNH THỰC TẾ</p>
          <div className="flex flex-col gap-0 w-full">
            {suggestionItems.map((line, i) => (
              <p key={i} className="font-['Inter:Regular'] font-normal leading-5 text-[#5f687b]">{line}</p>
            ))}
          </div>
        </div>
      )}

      {/* Flood blackspots */}
      {showFlood && floodItems && floodItems.length > 0 && (
        <div className="bg-white border border-[#e3e7ef] flex flex-col gap-2 items-start overflow-hidden p-4 rounded-2xl text-[13px] w-full">
          <p className="font-['Inter:Bold'] font-bold text-[#182033] whitespace-nowrap">
            BẢNG ĐIỂM ĐEN NGẬP ÚNG (Hà Nội)
          </p>
          <div className="flex flex-col gap-0 w-full">
            {floodItems.map((line, i) => (
              <p key={i} className="font-['Inter:Regular'] font-normal leading-5 text-[#5f687b]">{line}</p>
            ))}
          </div>
        </div>
      )}

      {/* Route advisory */}
      {showRouteAdvisory && routeItems && routeItems.length > 0 && (
        <div className="bg-[#eff6ff] border border-[#e3e7ef] flex flex-col gap-2 items-start overflow-hidden p-4 rounded-2xl text-[13px] w-full">
          <p className="font-['Inter:Bold'] font-bold text-[#182033] whitespace-nowrap">KHUYẾN CÁO LỘ TRÌNH</p>
          <div className="flex flex-col gap-0 w-full">
            {routeItems.map((line, i) => (
              <p key={i} className="font-['Inter:Regular'] font-normal leading-5 text-[#5f687b]">{line}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Live news item type ───────────────────────────────────────────────────────
type LiveNewsItem = { img: string; fallbackImg?: string; logo?: string; author: string; src: string; body: string; link?: string };

// ── Default mock news articles ────────────────────────────────────────────────
const DEFAULT_NEWS_FEED: LiveNewsItem[] = [
  { img: imgNews1, author: "Cạnh đảo nổi dừng Tết, làng đảo Hà Đông vào mùa cao điểm", src: "eva.vn · 10:09 AM", body: "Người dân làng chài tấp nập chuẩn bị cho mùa du lịch cao điểm năm nay sau kỳ nghỉ Tết." },
  { img: imgNews2, author: "Quần ống rộng giúp quý cô mặc đẹp cả tuần", src: "Thanh Niên · 09:45 AM", body: "Từ đi làm đến đi chơi, bí quyết phối đồ với quần ống rộng phong cách công sở hiện đại." },
  { img: imgNews3, author: "Hà Nội: Dự báo mưa lớn chiều tối nay", src: "VnExpress · 09:15 AM", body: "Cơ quan khí tượng thủy văn cảnh báo mưa vừa đến mưa to có thể xảy ra tại nhiều quận huyện." },
  { img: imgNews4, author: "Chứng khoán Việt Nam tăng mạnh phiên đầu tuần", src: "CafeF · 08:50 AM", body: "VN-Index bứt phá vượt ngưỡng kháng cự, dòng tiền đổ mạnh vào nhóm cổ phiếu vốn hóa lớn." },
  { img: imgNews5, author: "Đội tuyển Việt Nam chốt danh sách AFF Cup 2025", src: "Tuổi Trẻ · 08:20 AM", body: "HLV trưởng đội tuyển Việt Nam công bố 25 cầu thủ tập trung cho vòng loại AFF Cup sắp tới." },
];

// ── Mobile Layout ────────────────────────────────────────────────────────────

function MobileLayout({
  condKey,
  liveData,
  liveNews,
  liveOverrides,
}: {
  condKey: ConditionKey;
  liveData?: Record<ConditionKey, WeatherEntry>;
  liveNews?: LiveNewsItem[];
  liveOverrides?: LiveOverrides;
}) {
  const WEATHER = (liveData ?? DEFAULT_WEATHER_DATA)[condKey];
  const newsFeed = liveNews ?? DEFAULT_NEWS_FEED;
  return (
    <div className="bg-[#f4f6fa] flex flex-col items-start w-full">
      <div className="bg-white border-b border-[#e3e7ef] flex h-[72px] items-center justify-between px-4 w-full shrink-0">
        <p className="font-['Inter:Bold'] font-bold text-[#ff315f] text-[20px]">Anx.</p>
        <p className="font-['Inter:Regular'] font-normal text-[#5f687b] text-[11px]">
          {WEATHER.location} · Cập nhật {WEATHER.time}
        </p>
      </div>

      <div className="flex flex-col gap-5 items-start pb-8 pt-4 px-4 w-full">
        <div className="flex flex-col gap-3 items-start w-full">
          <p className="font-['Inter:Semi_Bold'] font-semibold leading-[26px] text-[#182033] text-[20px]">Thời tiết</p>
          <WeatherSection condKey={condKey} liveData={liveData} liveOverrides={liveOverrides} />
        </div>

        <div className="flex flex-col gap-3 items-start w-full">
          <p className="font-['Inter:Semi_Bold'] font-semibold leading-[26px] text-[#182033] text-[20px]">
            Tin Tức Mới Nhất • {newsFeed.length} bài
          </p>
          {newsFeed.map((item, i) => (
            <a
              key={i}
              href={item.link ?? "#"}
              target={item.link ? "_blank" : undefined}
              rel="noopener noreferrer"
              className="bg-white flex flex-col gap-[14px] items-start overflow-hidden p-4 rounded-2xl shadow-[0px_4px_12px_0px_rgba(23,33,51,0.1)] w-full no-underline"
            >
              <div className="flex gap-[10px] items-center overflow-hidden w-full">
                <img alt="" className="rounded-full shrink-0 size-11 object-cover" referrerPolicy="no-referrer" src={item.logo || item.img} data-fallback={item.fallbackImg || ""} onError={(e) => { const el = e.currentTarget; if (el.src !== el.dataset.fallback && el.dataset.fallback) { el.src = el.dataset.fallback; } }} />
                <div className="flex flex-1 flex-col items-start min-w-0 overflow-hidden">
                  <p className="font-['Inter:Semi_Bold'] font-semibold text-[#182033] text-[14px] line-clamp-1">{item.author}</p>
                  <p className="font-['Inter:Regular'] font-normal text-[#5f687b] text-[12px]">{item.src}</p>
                </div>
                <div className="relative shrink-0 size-5">
                  <img alt="" className="absolute inset-0 size-full" src={imgMoreHorizontal} />
                </div>
              </div>
              <p className="font-['Inter:Regular'] font-normal leading-[21px] text-[#182033] text-[14px]">{item.body}</p>
              <div className="h-[180px] relative rounded-[10px] w-full overflow-hidden">
                <img alt="" className="absolute inset-0 max-w-none object-cover size-full" referrerPolicy="no-referrer" src={item.img} data-fallback={item.fallbackImg || ""} onError={(e) => { const el = e.currentTarget; if (el.src !== el.dataset.fallback && el.dataset.fallback) { el.src = el.dataset.fallback; } }} />
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Tablet Layout ────────────────────────────────────────────────────────────

function TabletLayout({
  condKey,
  liveData,
  liveNews,
  liveOverrides,
}: {
  condKey: ConditionKey;
  liveData?: Record<ConditionKey, WeatherEntry>;
  liveNews?: LiveNewsItem[];
  liveOverrides?: LiveOverrides;
}) {
  const WEATHER  = (liveData ?? DEFAULT_WEATHER_DATA)[condKey];
  const newsFeed = liveNews ?? DEFAULT_NEWS_FEED;
  const [featured, ...rest] = newsFeed;
  return (
    <div className="bg-[#f4f6fa] flex flex-col items-start w-full">
      <div className="bg-white border-b border-[#e3e7ef] flex h-[72px] items-center justify-between px-6 w-full shrink-0">
        <div className="flex gap-3 items-center">
          <p className="font-['Inter:Bold'] font-bold text-[#ff315f] text-[20px] whitespace-nowrap">Anx.</p>
          <p className="font-['Inter:Medium'] font-medium text-[#5f687b] text-[13px] whitespace-nowrap">
            📍 {WEATHER.location}
          </p>
        </div>
        <p className="font-['Inter:Regular'] font-normal text-[#5f687b] text-[11px] whitespace-nowrap">
          Cập nhật {WEATHER.time} CH
        </p>
      </div>

      <div className="flex gap-5 items-start p-5 w-full">
        {/* Weather column */}
        <div className="flex flex-col gap-3 items-start shrink-0 w-[calc(50%-10px)] max-w-[560px]">
          <WeatherSection compact condKey={condKey} liveData={liveData} liveOverrides={liveOverrides} />
        </div>

        {/* News panel – dữ liệu động từ bot */}
        <div className="flex flex-1 flex-col gap-3 items-start min-w-0 overflow-hidden">
          <div className="flex flex-col gap-[2px] items-start">
            <p className="font-['Inter:Bold'] font-bold text-[#182033] text-[20px] tracking-[-0.3px]">Tin tức</p>
            <p className="font-['Inter:Regular'] font-normal text-[#5f687b] text-[12px]">
              {WEATHER.location} · {newsFeed.length} bài mới nhất
            </p>
          </div>

          {/* Featured article */}
          {featured && (
            <a
              href={featured.link ?? "#"}
              target={featured.link ? "_blank" : undefined}
              rel="noopener noreferrer"
              className="bg-white flex flex-col items-start overflow-hidden rounded-2xl shadow-[0px_4px_12px_0px_rgba(23,33,51,0.1)] w-full no-underline"
            >
              <div className="h-[180px] relative rounded-tl-2xl rounded-tr-2xl w-full overflow-hidden">
                <img alt="" className="absolute inset-0 max-w-none object-cover size-full" referrerPolicy="no-referrer" src={featured.img} data-fallback={featured.fallbackImg || ""} onError={(e) => { const el = e.currentTarget; if (el.src !== el.dataset.fallback && el.dataset.fallback) { el.src = el.dataset.fallback; } }} />
                <div className="absolute bg-[#ff315f] left-3 top-3 flex items-start px-[10px] py-1 rounded-[6px]">
                  <p className="font-['Inter:Bold'] font-bold text-[10px] text-white tracking-[0.5px] uppercase">NỔI BẬT</p>
                </div>
              </div>
              <div className="flex flex-col gap-2 items-start p-[14px] w-full">
                <p className="font-['Inter:Bold'] font-bold leading-[22px] text-[#182033] text-[15px] w-full line-clamp-2">
                  {featured.author}
                </p>
                <p className="font-['Inter:Regular'] font-normal leading-[18px] text-[#5f687b] text-[12px] w-full line-clamp-2">
                  {featured.body}
                </p>
                <div className="flex items-center justify-between pt-1 w-full">
                  <div className="flex gap-[6px] items-center">
                    <div className="bg-[#f7a928] rounded-[4px] size-2" />
                    <p className="font-['Inter:Semi_Bold'] font-semibold text-[#ff315f] text-[11px]">{featured.src}</p>
                  </div>
                </div>
              </div>
            </a>
          )}

          {/* Remaining articles */}
          {rest.map((item, i) => (
            <a
              key={i}
              href={item.link ?? "#"}
              target={item.link ? "_blank" : undefined}
              rel="noopener noreferrer"
              className="bg-white flex gap-3 items-center overflow-hidden p-3 rounded-[10px] shadow-[0px_4px_12px_0px_rgba(23,33,51,0.1)] w-full no-underline"
            >
              <div className="relative rounded-[10px] shrink-0 size-[72px] overflow-hidden bg-[#f4f6fa]">
                <img alt="" className="absolute inset-0 max-w-none object-cover size-full" referrerPolicy="no-referrer" src={item.img} data-fallback={item.fallbackImg || ""} onError={(e) => { const el = e.currentTarget; if (el.src !== el.dataset.fallback && el.dataset.fallback) { el.src = el.dataset.fallback; } }} />
              </div>
              <div className="flex flex-1 flex-col gap-1 items-start min-w-0 overflow-hidden">
                <div className="bg-[#ffe8ee] flex items-start px-[7px] py-[2px] rounded-[4px]">
                  <p className="font-['Inter:Bold'] font-bold text-[#ff315f] text-[10px]">{item.src}</p>
                </div>
                <p className="font-['Inter:Semi_Bold'] font-semibold leading-[19px] text-[#182033] text-[13px] line-clamp-2 w-full">{item.author}</p>
                <p className="font-['Inter:Regular'] font-normal text-[#5f687b] text-[11px] line-clamp-1 w-full">{item.body}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Desktop Layout ───────────────────────────────────────────────────────────

function DesktopLayout({
  condKey,
  liveData,
  liveNews,
  liveOverrides,
}: {
  condKey: ConditionKey;
  liveData?: Record<ConditionKey, WeatherEntry>;
  liveNews?: LiveNewsItem[];
  liveOverrides?: LiveOverrides;
}) {
  const WEATHER  = (liveData ?? DEFAULT_WEATHER_DATA)[condKey];
  const newsFeed = liveNews ?? DEFAULT_NEWS_FEED;
  const [featured, ...grid] = newsFeed;
  const now = useCurrentTime();
  const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    const dayName = days[now.getDay()];
    const dateStr = `${dayName}, ${now.getDate()} tháng ${now.getMonth() + 1}`;
  const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  return (
    <div className="bg-[#f4f6fa] flex flex-col items-start w-full">
      <div className="bg-white border-b border-[#e3e7ef] flex h-[72px] items-center justify-between px-6 w-full shrink-0">
        <div className="flex gap-4 items-center">
          <p className="font-['Inter:Bold'] font-bold text-[#182033] text-[18px] whitespace-nowrap">Anx.</p>
          <div className="bg-[#f4f6fa] flex items-start px-3 py-1 rounded-full">
            <p className="font-['Inter:Regular'] font-normal text-[#5f687b] text-[12px] whitespace-nowrap">
              {dateStr} · {timeStr}
            </p>
          </div>
        </div>

      </div>

      <div className="flex gap-6 items-start p-6 w-full">
        {/* Weather column */}
        <div className="flex flex-col gap-4 items-start shrink-0 w-[420px]">
          <WeatherSection compact condKey={condKey} liveData={liveData} liveOverrides={liveOverrides} />
        </div>

        {/* News column – dữ liệu động từ bot */}
        <div className="flex flex-1 flex-col gap-4 items-start min-w-0 overflow-hidden">
          <div className="flex items-center justify-between w-full">
            <div className="flex gap-[10px] items-center">
              <p className="font-['Inter:Bold'] font-bold text-[#182033] text-[20px] whitespace-nowrap">Tin Tức Mới Nhất</p>
              <div className="bg-[#f7a928] flex items-start px-[10px] py-[3px] rounded-full">
                <p className="font-['Inter:Bold'] font-bold text-[11px] text-white">LIVE</p>
              </div>
            </div>
            
          </div>

          {/* Featured feed card */}
          {featured && (
            <a
              href={featured.link ?? "#"}
              target={featured.link ? "_blank" : undefined}
              rel="noopener noreferrer"
              className="bg-white flex flex-col gap-[14px] items-start overflow-hidden p-4 rounded-2xl shadow-[0px_4px_12px_0px_rgba(23,33,51,0.1)] w-full no-underline"
            >
              <div className="flex gap-[10px] items-center overflow-hidden w-full">
                <div className="bg-[#ffe8ee] flex flex-col items-center justify-center overflow-hidden rounded-full shrink-0 size-11">
                  <p className="font-['Inter:Bold'] font-bold text-[#ff315f] text-[15.84px]">
                    📰
                  </p>
                </div>
                <div className="flex flex-1 flex-col items-start min-w-0 overflow-hidden">
                  <p className="font-['Inter:Semi_Bold'] font-semibold text-[#182033] text-[14px] line-clamp-1">{featured.src}</p>
                  <p className="font-['Inter:Regular'] font-normal text-[#5f687b] text-[12px]">{WEATHER.time}</p>
                </div>
              </div>
              <p className="font-['Inter:Regular'] font-normal leading-[21px] text-[#182033] text-[14px] w-full line-clamp-3">
                {featured.author}
              </p>
              <div className="h-[180px] relative rounded-[10px] w-full overflow-hidden">
                <img alt="" className="absolute inset-0 max-w-none object-cover size-full" referrerPolicy="no-referrer" src={featured.img} data-fallback={featured.fallbackImg || ""} onError={(e) => { const el = e.currentTarget; if (el.src !== el.dataset.fallback && el.dataset.fallback) { el.src = el.dataset.fallback; } }} />
              </div>
              {featured.body && (
                <p className="font-['Inter:Regular'] font-normal text-[#5f687b] text-[13px] line-clamp-2">{featured.body}</p>
              )}
            </a>
          )}

          {/* News grid */}
          <div className="flex flex-wrap gap-3 items-start w-full">
            {grid.map((item, i) => (
              <a
                key={i}
                href={item.link ?? "#"}
                target={item.link ? "_blank" : undefined}
                rel="noopener noreferrer"
                className="bg-white flex flex-col items-start overflow-hidden rounded-2xl shadow-[0px_4px_12px_0px_rgba(23,33,51,0.1)] w-[calc(50%-6px)] no-underline"
              >
                <div className="h-[140px] relative w-full overflow-hidden">
                  <img alt="" className="absolute inset-0 max-w-none object-cover size-full" referrerPolicy="no-referrer" src={item.img} data-fallback={item.fallbackImg || ""} onError={(e) => { const el = e.currentTarget; if (el.src !== el.dataset.fallback && el.dataset.fallback) { el.src = el.dataset.fallback; } }} />
                </div>
                <div className="flex flex-col gap-[6px] items-start p-[14px] w-full">
                  <div className="flex gap-2 items-center">
                    <div className="bg-[#ffe8ee] flex items-start px-2 py-[3px] rounded-full">
                      <p className="font-['Inter:Semi_Bold'] font-semibold text-[#ff315f] text-[11px]">{item.src}</p>
                    </div>
                  </div>
                  <p className="font-['Inter:Bold'] font-bold leading-5 text-[#182033] text-[14px] w-full line-clamp-2">{item.author}</p>
                  <p className="font-['Inter:Regular'] font-normal leading-[18px] text-[#5f687b] text-[12px] w-full line-clamp-2">{item.body}</p>
                </div>
              </a>
            ))}
          </div>

          <div className="flex items-start justify-center py-2 w-full">
            
          </div>
        </div>
      </div>
    </div>
  );
}


// ── Condition options ─────────────────────────────────────────────────────────

const CONDITION_OPTIONS: { key: ConditionKey; emoji: string; label: string; desc: string }[] = [
  { key: "binh-thuong", emoji: "☁️", label: "Bình thường", desc: "Trời đẹp, ít biến động" },
  { key: "nang",        emoji: "☀️", label: "Nắng",        desc: "Tầm nhìn tốt, UV trung bình" },
  { key: "nang-gat",   emoji: "🔥", label: "Nắng gắt",   desc: "UV rất cao, nguy cơ say nắng" },
  { key: "am-u",       emoji: "🌥️", label: "Âm u",       desc: "Nhiều mây, có thể mưa nhẹ" },
  { key: "mua-nho",    emoji: "🌦️", label: "Mưa nhỏ",    desc: "Đường ướt, tầm nhìn giảm nhẹ" },
  { key: "mua-dong",   emoji: "⛈️", label: "Mưa dông",   desc: "Sấm chớp, gió giật, ngập úng" },
];

// ── Dev weather panel (hidden) ────────────────────────────────────────────────

function DevWeatherPanel({
  condKey,
  onSelect,
  onClose,
}: {
  condKey: ConditionKey;
  onSelect: (k: ConditionKey) => void;
  onClose: () => void;
}) {
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]"
        onClick={onClose}
      />
      {/* Bottom sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-[0px_-8px_32px_rgba(0,0,0,0.18)] overflow-hidden">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="bg-[#d1d5db] rounded-full h-1 w-10" />
        </div>
        <div className="px-5 pt-2 pb-2 flex items-center justify-between border-b border-[#f0f2f5]">
          <div>
            <p className="font-['Inter:Bold'] font-bold text-[#182033] text-[15px]">Chọn trạng thái thời tiết</p>
            <p className="font-['Inter:Regular'] font-normal text-[#9aa3b0] text-[12px] mt-[2px]">Dữ liệu thực tế sẽ tự cập nhật khi tích hợp API</p>
          </div>
          <button onClick={onClose} className="text-[#9aa3b0] text-[20px] leading-none hover:text-[#182033] transition-colors">✕</button>
        </div>
        <div className="flex flex-col gap-0 pb-6 pt-1 overflow-y-auto max-h-[60vh]">
          {CONDITION_OPTIONS.map(opt => {
            const active = condKey === opt.key;
            return (
              <button
                key={opt.key}
                onClick={() => { onSelect(opt.key); onClose(); }}
                className={`flex items-center gap-4 px-5 py-[14px] w-full text-left transition-colors ${
                  active ? "bg-[#f4f6fa]" : "hover:bg-[#fafafa]"
                }`}
              >
                <span className="text-[28px] shrink-0 leading-none">{opt.emoji}</span>
                <div className="flex flex-1 flex-col items-start min-w-0">
                  <p className={`font-['Inter:Semi_Bold'] font-semibold text-[14px] ${active ? "text-[#182033]" : "text-[#182033]"}`}>
                    {opt.label}
                  </p>
                  <p className="font-['Inter:Regular'] font-normal text-[#9aa3b0] text-[12px]">{opt.desc}</p>
                </div>
                {active && (
                  <span className="shrink-0 size-5 rounded-full bg-[#182033] flex items-center justify-center text-white text-[11px]">✓</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}

// ── Root ─────────────────────────────────────────────────────────────────────

export function getNewspaperLogo(url: string) {
  if (!url || typeof url !== 'string') return "";
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
  } catch (e) {
    return "";
  }
}

export function getProxyImageUrl(url: string) {
  if (!url || typeof url !== 'string') return "";
  let cleanUrl = url.trim();
  if (cleanUrl.startsWith("//")) cleanUrl = "https:" + cleanUrl;
  if (cleanUrl.startsWith("http") && !cleanUrl.includes("wsrv.nl")) {
    return `https://wsrv.nl/?url=${encodeURIComponent(cleanUrl)}`;
  }
  return cleanUrl;
}

export default function App() {
  const [condKey, setCondKey] = useState<ConditionKey>("mua-nho");
  const [panelOpen, setPanelOpen] = useState(false);
  const [liveData, setLiveData] = useState<Record<ConditionKey, WeatherEntry> | undefined>(undefined);
  const [liveNews, setLiveNews] = useState<LiveNewsItem[] | undefined>(undefined);
  const [liveOverrides, setLiveOverrides] = useState<LiveOverrides | undefined>(undefined);
  const [apiStatus, setApiStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loadingRef = useRef(false);

  const fetchMoreNews = async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setIsLoadingMore(true);
    try {
      const feed = RSS_FEEDS[Math.floor(Math.random() * RSS_FEEDS.length)];
      const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.url)}`);
      const data = await res.json();
      const items = data.items || [];
      const picked = items.sort(() => 0.5 - Math.random()).slice(0, 5);
      const images = [imgNews1, imgNews2, imgNews3, imgNews4, imgNews5];
      
      const newMapped: LiveNewsItem[] = picked.map((item: any, i: number) => {
        let imageUrl = item.thumbnail || (item.enclosure && item.enclosure.link) || "";
        if (!imageUrl && item.description) {
          const imgMatch = item.description.match(/<img[^>]+src=["']([^"']+)["']/i);
          if (imgMatch) imageUrl = imgMatch[1];
        }
        if (!imageUrl && item.content) {
          const imgMatch2 = item.content.match(/<img[^>]+src=["']([^"']+)["']/i);
          if (imgMatch2) imageUrl = imgMatch2[1];
        }
        if (imageUrl) imageUrl = imageUrl.replace(/&amp;/g, '&');
        
        let cleanDesc = item.description ? item.description.replace(/<[^>]+>/g, '').trim() : "";
        
        return {
          img: imageUrl ? getProxyImageUrl(imageUrl) : images[i % images.length],
          logo: getNewspaperLogo(item.link || ""),
          fallbackImg: images[i % images.length],
          author: item.title ?? "Tin tức",
          src: feed.name,
          body: cleanDesc,
          link: item.link
        };
      });
      setLiveNews(prev => [...(prev || []), ...newMapped]);
    } catch (err) {
      console.error(err);
    } finally {
      loadingRef.current = false;
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 300) {
        fetchMoreNews();
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);


  const tapCount = useRef(0);
  const tapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Load live data: ?data=<base64json> (bot-embedded) hoặc ?api=<url> (fetch) ───
  useEffect(() => {
    const params  = new URLSearchParams(window.location.search);
    const rawData = params.get("data");   // base64 JSON từ bot
    const cData   = params.get("cdata");  // zlib compressed base64 JSON từ bot
    const apiUrl  = params.get("api");    // URL API fallback

    function processJson(json: Record<string, unknown>) {
      const w    = (json.weather as Record<string, unknown>) ?? {};
      const cur  = (w.current  as Record<string, unknown>) ?? {};
      const fore = (w.forecast_3h as Record<string, unknown>) ?? {};
      const status: string = (w.status as string) ?? "BINH_THUONG";
      const key  = mapBotStatusToCondKey(status);
      setCondKey(key);

      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      let rawLoc = json.location;
      if (typeof rawLoc === 'object' && rawLoc !== null && (rawLoc as any).name) {
          rawLoc = (rawLoc as any).name;
      }
      const locStr = (typeof rawLoc === 'string' ? rawLoc : "Hà Nội");
      const loc = locStr.split(",")[0].trim();
      const pm25Val = Number(cur.pm25 ?? 15);
      const icon    = pm25Icon(pm25Val);
      const windMs  = Number(cur.wind_speed ?? 0);
      const wind    = windMs > 0 ? `${Math.round(windMs * 3.6)} km/h` : "—";
      const forecastText = `~${(fore.temp as number) ?? cur.temp}°C | ${WEATHER_THEMES[key].label} | Mưa: ${(fore.pop as number) ?? 0}%`;

      const entry: WeatherEntry = {
        time:           timeStr,
        location:       loc,
        locationFull:   locStr,
        temp:           `${cur.temp}°C`,
        feelsLike:      `${cur.feels_like}°C`,
        conditionLabel: (cur.desc as string) ?? WEATHER_THEMES[key].label,
        humidity:       `${cur.humidity ?? 60}%`,
        pm25:           `${pm25Val} µg/m³`,
        wind,
        forecastText,
      };

      const newData = { ...DEFAULT_WEATHER_DATA };
      (Object.keys(newData) as ConditionKey[]).forEach((k) => { newData[k] = entry; });
      setLiveData(newData);

      const newsArr = json.news as Array<{ title?: string; source?: string; link?: string; description?: string, image?: string }>;
      if (Array.isArray(newsArr) && newsArr.length > 0) {
        const images = [imgNews1, imgNews2, imgNews3, imgNews4, imgNews5];
        const shuffledNews = [...newsArr].sort(() => Math.random() - 0.5);
          const mapped: LiveNewsItem[] = shuffledNews.slice(0, 10).map((item, i) => ({
          img:    item.image ? getProxyImageUrl(item.image) : images[i % images.length],
          logo: getNewspaperLogo(item.link || ""),
          fallbackImg: images[i % images.length],
          author: item.title       ?? "Tin tức",
          src:    item.source      ?? "Tin tức",
          body:   item.description ?? "",
          link:   item.link,
        }));
        setLiveNews(mapped);
      }

      // Store dynamic overrides in React state (not mutating WEATHER_THEMES)
      setLiveOverrides({
        warningText: (json.warningText as string) || "",
        suggestionItems: (json.suggestionItems as string[]) || [],
        floodItems: (json.floodItems as string[]) || [],
        routeItems: (json.routeItems as string[]) || [],
      });

      setApiStatus("ok");
    }

    // ── Ưu tiên ?data= (bot đã fetch sẵn, decode base64 là dùng được luôn) ──
    
    // 🟢 Ưu tiên ?cdata= (bot đã nén zlib + base64) 🟢
    if (cData) {
      (async () => {
        try {
          setApiStatus("loading");
          const b64 = cData.replace(/-/g, "+").replace(/_/g, "/");
          const binaryStr = atob(b64);
          const bytes = new Uint8Array(binaryStr.length);
          for (let i = 0; i < binaryStr.length; i++) {
            bytes[i] = binaryStr.charCodeAt(i);
          }
          const ds = new DecompressionStream("deflate");
          const writer = ds.writable.getWriter();
          writer.write(bytes);
          writer.close();
          const reader = ds.readable.getReader();
          const chunks = [];
          let totalLen = 0;
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            chunks.push(value);
            totalLen += value.length;
          }
          const decompressed = new Uint8Array(totalLen);
          let offset = 0;
          for (const chunk of chunks) {
            decompressed.set(chunk, offset);
            offset += chunk.length;
          }
          const decodedStr = new TextDecoder("utf-8").decode(decompressed);
          const json = JSON.parse(decodedStr);
          processJson(json);
        } catch (e) {
          console.error(e);
          setApiStatus("error");
        }
      })();
      return;
    }

    if (rawData) {
      try {
        setApiStatus("loading");
        // base64url → base64 chuẩn rồi decode
        const b64 = rawData.replace(/-/g, "+").replace(/_/g, "/");
        const binaryStr = atob(b64);
        const bytes = new Uint8Array([...binaryStr].map((char) => char.charCodeAt(0)));
        const decodedStr = new TextDecoder("utf-8").decode(bytes);
        const json = JSON.parse(decodedStr) as Record<string, unknown>;
        processJson(json);
      } catch {
        setApiStatus("error");
      }
      return;
    }

    // ── Fallback: ?api=URL (fetch trực tiếp từ bot API) ──

    // Nếu không có dữ liệu từ Bot và không có apiUrl, trang web tự động fetch dữ liệu thực tế
    if (!cData && !rawData && !apiUrl) {
        setApiStatus("loading");
        const apiKey = "a201c471567522a7d0b7a0567ad245fe";
        const lat = 20.9716;
        const lon = 105.7725;
        
        const RSS_FEEDS = [
            { name: "Dân Trí", url: "https://dantri.com.vn/rss/home.rss" },
            { name: "VnExpress", url: "https://vnexpress.net/rss/tin-moi-nhat.rss" },
            { name: "Tuổi Trẻ", url: "https://tuoitre.vn/rss/tin-moi-nhat.rss" },
            { name: "Thanh Niên", url: "https://thanhnien.vn/rss/home.rss" },
            { name: "Báo Giao Thông", url: "https://www.baogiaothong.vn/rss/thoi-su.rss" }
          ];
        
        // Randomly select 2 RSS feeds to fetch to mix news without hitting rate limits
        const shuffledFeeds = [...RSS_FEEDS].sort(() => 0.5 - Math.random()).slice(0, 2);
        
        const newsPromises = shuffledFeeds.map(feed => 
          fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.url)}`)
            .then(r => r.json())
            .then(data => (data.items || []).map((item: any) => ({ ...item, _sourceName: feed.name })))
            .catch(() => [])
        );

        Promise.all([
          fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=vi`).then(r => r.json()),
          fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=vi`).then(r => r.json()),
          fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`).then(r => r.json()),
          Promise.all(newsPromises)
        ]).then(([weather, forecast, aqi, newsArrays]) => {
          const c_temp = Math.round(weather.main?.temp || 0);
          const feels_like = Math.round(weather.main?.feels_like || 0);
          const humidity = weather.main?.humidity || 0;
          const c_desc = weather.weather?.[0]?.description || "";
          const iconCode = weather.weather?.[0]?.icon || "";
          const c_icon = iconCode.includes("d") ? "☀️" : "🌙";
          
          const n_item = forecast.list?.[0] || {};
          const n_temp = Math.round(n_item.main?.temp || c_temp);
          const n_pop = Math.round((n_item.pop || 0) * 100);
          const n_desc = n_item.weather?.[0]?.description || c_desc;
          
          const pm25 = aqi.list?.[0]?.components?.pm2_5 || 0;
          const aqi_level = aqi.list?.[0]?.main?.aqi || 1;
          
          let trang_thai = "NANG";
          if (n_pop > 50) trang_thai = "MUA";
          else if (c_temp > 35) trang_thai = "NANG_GAT";
          
          // Combine all news from the 2 fetched feeds, shuffle them, and take 10
          let allNews = newsArrays.flat().sort(() => 0.5 - Math.random());
          const rawItems = allNews.slice(0, 10);
          
          // 1. Gửi dữ liệu ngay lập tức để UI render (chỉ trong 1-2s)
          const baseNewsItems = rawItems.map((item: any) => {
            let imageUrl = item.thumbnail || (item.enclosure && item.enclosure.link) || "";
            if (!imageUrl && item.description) {
              const imgMatch = item.description.match(/<img[^>]+src=["']([^"']+)["']/i);
              if (imgMatch) imageUrl = imgMatch[1];
            }
            if (!imageUrl && item.content) {
              const imgMatch2 = item.content.match(/<img[^>]+src=["']([^"']+)["']/i);
              if (imgMatch2) imageUrl = imgMatch2[1];
            }
            
            if (imageUrl) {
              imageUrl = imageUrl.replace(/&amp;/g, '&');
            }
            
                          let cleanDesc = "";
              if (item.description && typeof item.description === 'string') {
                  cleanDesc = item.description.replace(/<[^>]+>/g, '').trim();
                  cleanDesc = cleanDesc.replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ');
              } else if (item.content && typeof item.content === 'string') {
                  cleanDesc = item.content.replace(/<[^>]+>/g, '').trim();
                  cleanDesc = cleanDesc.replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ');
              }
              
              return {
                title: item.title,
                link: item.link,
                source: item.source || item._sourceName || "Báo Mới",
                time: new Date(item.pubDate || Date.now()).toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' }),
                image: imageUrl,
                description: cleanDesc
              };
          });


          const jsonPayload = {
            location: "Quận Hà Đông, VN",
            weather: {
              current: { temp: c_temp, feels_like, humidity, desc: c_desc, icon: c_icon, pm25, aqi_level },
              forecast_3h: { temp: n_temp, pop: n_pop, desc: n_desc },
              status: trang_thai
            },
            news: baseNewsItems.length > 0 ? baseNewsItems : undefined
          };
          
          processJson(jsonPayload);

          // 2. Tải ảnh OG ngầm ở Background (không block UI)
          baseNewsItems.forEach((item: any, idx: number) => {
            if (!item.image && item.link) {
              const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(item.link)}`;
              fetch(proxyUrl).then(res => res.json()).then(data => {
                const html = data.contents || "";
                const ogMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) 
                             || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
                if (ogMatch) {
                  const newImg = getProxyImageUrl(ogMatch[1]);
                  setLiveNews((prev: any) => {
                    if (!prev) return prev;
                    const next = [...prev];
                    if (next[idx]) {
                      next[idx] = { ...next[idx], img: newImg };
                    }
                    return next;
                  });
                }
              }).catch(() => {});
            }
          });
          
        }).catch((e: any) => {
        console.error("Standalone fetch error:", e);
        setApiStatus("error"); // Fallback to mock if fetch fails entirely
      });
      return;
    }

    if (apiUrl) {
      setApiStatus("loading");
      fetch(apiUrl)
        .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
        .then((json) => processJson(json as Record<string, unknown>))
        .catch(() => setApiStatus("error"));
    }
  }, []);

  // Triple-tap the Anx. logo (or version tag) to open the hidden dev panel
  function handleSecretTap() {
    tapCount.current += 1;
    if (tapTimer.current) clearTimeout(tapTimer.current);
    tapTimer.current = setTimeout(() => { tapCount.current = 0; }, 600);
    if (tapCount.current >= 3) {
      tapCount.current = 0;
      setPanelOpen(true);
    }
  }

    if (apiStatus === "loading") {
    return (
      <div className="w-full h-screen bg-white">
        <div className="fixed top-2 left-1/2 -translate-x-1/2 z-50 bg-[#182033]/80 text-white text-[12px] px-4 py-1 rounded-full backdrop-blur-sm">
          ⏳ Đang tải dữ liệu thực tế…
        </div>
      </div>
    );
  }

  const theme = WEATHER_THEMES[condKey];

  return (
    <div className="min-h-screen w-full bg-[#f4f6fa]">
      {/* Live API status indicator */}
      {apiStatus === "error" && (
        <div className="fixed top-2 left-1/2 -translate-x-1/2 z-50 bg-red-500/80 text-white text-[12px] px-4 py-1 rounded-full backdrop-blur-sm">
          ⚠️ Không thể tải dữ liệu – hiển thị dữ liệu mẫu
        </div>
      )}


      {/* Hidden floating trigger — bottom-right corner, blends in */}
      

      {panelOpen && (
        <DevWeatherPanel
          condKey={condKey}
          onSelect={setCondKey}
          onClose={() => setPanelOpen(false)}
        />
      )}

      <div className="md:hidden">
        <MobileLayout condKey={condKey} liveData={liveData} liveNews={liveNews} liveOverrides={liveOverrides} />
        {isLoadingMore && <div className="text-center py-4 text-[13px] text-[#5f687b] font-['Inter:Medium'] font-medium">⏳ Đang tải thêm tin tức...</div>}
      </div>
      <div className="hidden md:block xl:hidden">
        <TabletLayout condKey={condKey} liveData={liveData} liveNews={liveNews} liveOverrides={liveOverrides} />
      </div>
      <div className="hidden xl:block">
        <DesktopLayout condKey={condKey} liveData={liveData} liveNews={liveNews} liveOverrides={liveOverrides} />
      </div>
    </div>
  );
}
