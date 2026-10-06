// ── Live API integration ──────────────────────────────────────────────────────
// Bot truyền URL API qua query param ?api=<encoded_url>
// Ví dụ: https://website.../  ?api=https%3A%2F%2Fbot-server%2Fapi%2Fdaily-news
// Nếu không có ?api thì dùng mock data (chế độ preview thiết kế)


import { useState, useEffect, useRef, useCallback, useMemo } from "react";

const assetPathPrefix = (import.meta.env.BASE_URL === "/" ? "" : import.meta.env.BASE_URL.replace(/\/$/, "")) + "/assets";

function useCurrentTime() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
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
type HourlyItem = { time: string; icon: string; temp: number; pop: number; };
type WeatherEntry = {
  time: string; location: string; locationFull: string;
  temp: string; feelsLike: string; conditionLabel: string;
  humidity: string; pm25: string; wind: string; forecastText: string;
  pressure: string; clouds: string; visibility: string;
  sunrise: string; sunset: string; tempMin: string; tempMax: string;
  uvIndex: string; dewPoint: string; hourlyForecast: HourlyItem[];
  warningText?: string; suggestionItems?: string[];
  dailyForecast?: any[];
  weekRange?: string;
};

// ── Default mock data (fallback khi chưa có API) ──────────────────────────────
const DEFAULT_WEATHER_DATA: Record<ConditionKey, WeatherEntry> = {
  "binh-thuong": { time: "08:00", location: "Quận Hà Đông, Hà Nội", locationFull: "Quận Hà Đông, Thành phố Hà Nội", temp: "26.0°C", feelsLike: "27.0°C", conditionLabel: "Bình thường", humidity: "60%", pm25: "18.50 µg/m³", wind: "8 km/h", forecastText: "~26°C | Trời đẹp | Mưa: 5%", pressure: "1012 hPa", clouds: "10%", visibility: "10 km", sunrise: "06:00", sunset: "18:00", tempMin: "25°C", tempMax: "32°C", uvIndex: "5", dewPoint: "24°C", hourlyForecast: [
    { time: "Bây giờ", icon: "01d", temp: 32, pop: 0 },
    { time: "16h", icon: "02d", temp: 31, pop: 10 },
    { time: "19h", icon: "03n", temp: 29, pop: 20 },
    { time: "22h", icon: "10n", temp: 27, pop: 60 },
    { time: "01h", icon: "10n", temp: 26, pop: 80 }
  ] },
  
  dailyForecast: [
    { day: "Hôm nay", icon: "01d", tempMin: 25, tempMax: 32, pop: 0 },
    { day: "T2", icon: "02d", tempMin: 26, tempMax: 33, pop: 10 },
    { day: "T3", icon: "10d", tempMin: 24, tempMax: 29, pop: 80 },
    { day: "T4", icon: "04d", tempMin: 25, tempMax: 30, pop: 20 },
    { day: "T5", icon: "01d", tempMin: 26, tempMax: 34, pop: 0 }
  ]
,
  "nang":        { time: "10:30", location: "Quận Hà Đông, Hà Nội", locationFull: "Quận Hà Đông, Thành phố Hà Nội", temp: "31.0°C", feelsLike: "34.0°C", conditionLabel: "Nắng", humidity: "55%", pm25: "22.10 µg/m³", wind: "10 km/h", forecastText: "~32°C | Nắng | Mưa: 2%", pressure: "1009 hPa", clouds: "5%", visibility: "10 km", sunrise: "06:00", sunset: "18:00", tempMin: "25°C", tempMax: "32°C", uvIndex: "5", dewPoint: "24°C", hourlyForecast: [
    { time: "Bây giờ", icon: "01d", temp: 32, pop: 0 },
    { time: "16h", icon: "02d", temp: 31, pop: 10 },
    { time: "19h", icon: "03n", temp: 29, pop: 20 },
    { time: "22h", icon: "10n", temp: 27, pop: 60 },
    { time: "01h", icon: "10n", temp: 26, pop: 80 }
  ] },
  
  dailyForecast: [
    { day: "Hôm nay", icon: "01d", tempMin: 25, tempMax: 32, pop: 0 },
    { day: "T2", icon: "02d", tempMin: 26, tempMax: 33, pop: 10 },
    { day: "T3", icon: "10d", tempMin: 24, tempMax: 29, pop: 80 },
    { day: "T4", icon: "04d", tempMin: 25, tempMax: 30, pop: 20 },
    { day: "T5", icon: "01d", tempMin: 26, tempMax: 34, pop: 0 }
  ]
,
  "nang-gat":   { time: "13:00", location: "Quận Hà Đông, Hà Nội", locationFull: "Quận Hà Đông, Thành phố Hà Nội", temp: "38.5°C", feelsLike: "43.2°C", conditionLabel: "Nắng gắt", humidity: "42%", pm25: "35.80 µg/m³", wind: "6 km/h", forecastText: "~39°C | Nắng gắt | Mưa: 0%", pressure: "1005 hPa", clouds: "0%", visibility: "10 km", sunrise: "06:00", sunset: "18:00", tempMin: "25°C", tempMax: "32°C", uvIndex: "5", dewPoint: "24°C", hourlyForecast: [
    { time: "Bây giờ", icon: "01d", temp: 32, pop: 0 },
    { time: "16h", icon: "02d", temp: 31, pop: 10 },
    { time: "19h", icon: "03n", temp: 29, pop: 20 },
    { time: "22h", icon: "10n", temp: 27, pop: 60 },
    { time: "01h", icon: "10n", temp: 26, pop: 80 }
  ] },
  
  dailyForecast: [
    { day: "Hôm nay", icon: "01d", tempMin: 25, tempMax: 32, pop: 0 },
    { day: "T2", icon: "02d", tempMin: 26, tempMax: 33, pop: 10 },
    { day: "T3", icon: "10d", tempMin: 24, tempMax: 29, pop: 80 },
    { day: "T4", icon: "04d", tempMin: 25, tempMax: 30, pop: 20 },
    { day: "T5", icon: "01d", tempMin: 26, tempMax: 34, pop: 0 }
  ]
,
  "am-u":       { time: "14:00", location: "Quận Hà Đông, Hà Nội", locationFull: "Quận Hà Đông, Thành phố Hà Nội", temp: "27.0°C", feelsLike: "29.5°C", conditionLabel: "Âm u", humidity: "75%", pm25: "20.00 µg/m³", wind: "9 km/h", forecastText: "~27°C | Âm u | Mưa: 8%", pressure: "1015 hPa", clouds: "80%", visibility: "6 km", sunrise: "06:00", sunset: "18:00", tempMin: "25°C", tempMax: "32°C", uvIndex: "5", dewPoint: "24°C", hourlyForecast: [
    { time: "Bây giờ", icon: "01d", temp: 32, pop: 0 },
    { time: "16h", icon: "02d", temp: 31, pop: 10 },
    { time: "19h", icon: "03n", temp: 29, pop: 20 },
    { time: "22h", icon: "10n", temp: 27, pop: 60 },
    { time: "01h", icon: "10n", temp: 26, pop: 80 }
  ] },
  
  dailyForecast: [
    { day: "Hôm nay", icon: "01d", tempMin: 25, tempMax: 32, pop: 0 },
    { day: "T2", icon: "02d", tempMin: 26, tempMax: 33, pop: 10 },
    { day: "T3", icon: "10d", tempMin: 24, tempMax: 29, pop: 80 },
    { day: "T4", icon: "04d", tempMin: 25, tempMax: 30, pop: 20 },
    { day: "T5", icon: "01d", tempMin: 26, tempMax: 34, pop: 0 }
  ]
,
  "mua-nho":    { time: "16:55", location: "Quận Hà Đông, Hà Nội", locationFull: "Quận Hà Đông, Thành phố Hà Nội", temp: "29.5°C", feelsLike: "33.3°C", conditionLabel: "Mưa nhỏ", humidity: "68%", pm25: "14.33 µg/m³", wind: "12 km/h", forecastText: "~29.5°C | Mưa nhỏ | Mưa: 13%", pressure: "1010 hPa", clouds: "100%", visibility: "4 km", sunrise: "06:00", sunset: "18:00", tempMin: "25°C", tempMax: "32°C", uvIndex: "5", dewPoint: "24°C", hourlyForecast: [
    { time: "Bây giờ", icon: "01d", temp: 32, pop: 0 },
    { time: "16h", icon: "02d", temp: 31, pop: 10 },
    { time: "19h", icon: "03n", temp: 29, pop: 20 },
    { time: "22h", icon: "10n", temp: 27, pop: 60 },
    { time: "01h", icon: "10n", temp: 26, pop: 80 }
  ] },
  
  dailyForecast: [
    { day: "Hôm nay", icon: "01d", tempMin: 25, tempMax: 32, pop: 0 },
    { day: "T2", icon: "02d", tempMin: 26, tempMax: 33, pop: 10 },
    { day: "T3", icon: "10d", tempMin: 24, tempMax: 29, pop: 80 },
    { day: "T4", icon: "04d", tempMin: 25, tempMax: 30, pop: 20 },
    { day: "T5", icon: "01d", tempMin: 26, tempMax: 34, pop: 0 }
  ]
,
  "mua-dong":   { time: "17:30", location: "Quận Hà Đông, Hà Nội", locationFull: "Quận Hà Đông, Thành phố Hà Nội", temp: "25.0°C", feelsLike: "24.0°C", conditionLabel: "Mưa dông", humidity: "88%", pm25: "12.00 µg/m³", wind: "35 km/h", forecastText: "~24°C | Mưa dông | Mưa: 80%", pressure: "998 hPa", clouds: "100%", visibility: "2 km", sunrise: "06:00", sunset: "18:00", tempMin: "25°C", tempMax: "32°C", uvIndex: "5", dewPoint: "24°C", hourlyForecast: [
    { time: "Bây giờ", icon: "01d", temp: 32, pop: 0 },
    { time: "16h", icon: "02d", temp: 31, pop: 10 },
    { time: "19h", icon: "03n", temp: 29, pop: 20 },
    { time: "22h", icon: "10n", temp: 27, pop: 60 },
    { time: "01h", icon: "10n", temp: 26, pop: 80 }
  ] },
  
  dailyForecast: [
    { day: "Hôm nay", icon: "01d", tempMin: 25, tempMax: 32, pop: 0 },
    { day: "T2", icon: "02d", tempMin: 26, tempMax: 33, pop: 10 },
    { day: "T3", icon: "10d", tempMin: 24, tempMax: 29, pop: 80 },
    { day: "T4", icon: "04d", tempMin: 25, tempMax: 30, pop: 20 },
    { day: "T5", icon: "01d", tempMin: 26, tempMax: 34, pop: 0 }
  ]
,
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
  weatherNews?: { title: string, link: string, source: string }[];
}








function HourlyTemperatureChart({ hourlyData }: { hourlyData: any[] }) {
  if (!hourlyData || hourlyData.length === 0) return null;
  
  const itemWidth = 65;
  const width = Math.max(600, hourlyData.length * itemWidth);
  const height = 180;
  
  const maxTemp = Math.max(...hourlyData.map(d => d.temp)) + 1;
  const minTemp = Math.min(...hourlyData.map(d => d.temp)) - 1;
  const range = maxTemp - minTemp || 1;

  const points = hourlyData.map((d, i) => {
    const x = i * itemWidth + (itemWidth / 2);
    const y = 140 - ((d.temp - minTemp) / range) * 55; 
    return { x, y, temp: d.temp, time: d.time, icon: d.icon, pop: d.pop };
  });

  const pathD = points.map((p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    const prev = points[i - 1];
    const cpX = (prev.x + p.x) / 2;
    return `C ${cpX} ${prev.y}, ${cpX} ${p.y}, ${p.x} ${p.y}`;
  }).join(' ');

  return (
    <div className="w-full overflow-x-auto scrollbar-hide pb-2">
      <div className="relative" style={{ width: `${width}px`, height: `${height}px` }}>
        <svg width={width} height={height} className="absolute top-0 left-0 overflow-visible z-0">
          <path d={`${pathD} L ${points[points.length-1].x} ${height} L ${points[0].x} ${height} Z`} fill="rgba(255, 49, 95, 0.08)" />
          <path d={pathD} fill="none" stroke="#ff315f" strokeWidth="2.5" strokeLinecap="round" />
          {points.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="4.5" fill="#fff" stroke="#ff315f" strokeWidth="2.5" />
          ))}
        </svg>
        
        {points.map((p, i) => (
          <div key={i} className="absolute flex flex-col items-center justify-start w-[65px] z-10" style={{ left: `${p.x - 32.5}px`, top: '10px' }}>
            <p className="font-semibold text-[#182033] text-[13px] whitespace-nowrap mb-1">{p.time}</p>
            <img className="w-8 h-8 drop-shadow-sm" src={`https://openweathermap.org/img/wn/${p.icon}.png`} alt="" />
            <p className="font-semibold text-[#0a84ff] text-[11px] whitespace-nowrap">{p.pop}%</p>
            <p className="font-bold text-[#182033] text-[14px] absolute" style={{ top: `${p.y + 12}px` }}>{p.temp}°</p>
          </div>
        ))}
      </div>
    </div>
  );
}


function getConditionLabel(iconCode: string) {
  if (!iconCode) return "Có mây";
  const code = iconCode.substring(0, 2);
  switch (code) {
    case '01': return 'Nắng';
    case '02': return 'Ít mây';
    case '03': return 'Trời râm';
    case '04': return 'Nhiều mây';
    case '09': return 'Mưa rào';
    case '10': return 'Có mưa';
    case '11': return 'Mưa dông';
    case '13': return 'Tuyết rơi';
    case '50': return 'Sương mù';
    default: return 'Có mây';
  }
}

function WeatherSection({
  compact = false,
  condKey,
  liveData,
  liveOverrides,
  darkMode,
  isLoading,
}: {
  compact?: boolean;
  condKey: ConditionKey;
  liveData?: Record<ConditionKey, WeatherEntry>;
  liveOverrides?: LiveOverrides;
  darkMode?: boolean;
  isLoading?: boolean;
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

  if (isLoading) return <WeatherSectionSkeleton />;

  return (
    <div className={`flex flex-col gap-4 w-full transition-opacity duration-700 ease-in-out opacity-100`}>
      {/* Hero card */}
      <div
        className="flex flex-col gap-4 items-start overflow-hidden p-6 rounded-2xl shadow-[0px_4px_12px_0px_rgba(23,33,51,0.1)] w-full transition-transform duration-500 hover:scale-[1.02] lg:h-[400px] lg:justify-between"
          style={{ background: darkMode ? "linear-gradient(21deg, rgb(23, 43, 115) 0%, rgb(18, 28, 48) 50%, rgb(41, 76, 194) 100%)" : "linear-gradient(21deg, rgb(72, 141, 203) 0%, rgb(51, 106, 214) 50%, rgb(79, 196, 255) 100%)" }}
          
      >
        <p className="font-semibold text-[13px] text-white whitespace-nowrap">
          📍 {compact ? WEATHER.location : WEATHER.locationFull} <span className="animate-pulse inline-block">·</span> {WEATHER.time}
        </p>
        <div className="flex flex-col gap-1 items-start w-full">
          <p className="font-extrabold leading-none text-[60px] text-white whitespace-nowrap">
            {WEATHER.temp}
          </p>
          <p className="font-semibold text-[18px] text-white whitespace-nowrap">
            <span className="inline-block animate-bounce" style={{ animationDuration: '3s' }}>{baseTheme.emoji}</span> {WEATHER.conditionLabel}
          </p>
          <p className="font-normal text-[14px] text-[rgba(255,255,255,0.8)] whitespace-nowrap">
            Cảm nhận {WEATHER.feelsLike}
          </p>
        </div>
                <div className="grid grid-cols-2 gap-2 w-full text-[13px]">
          {[
            { label: "💨 Gió", value: WEATHER.wind },
            { label: "💧 Độ ẩm", value: WEATHER.humidity },
            { label: "🌫️ Bụi PM2.5", value: WEATHER.pm25 },
            { label: "👁️ Tầm nhìn", value: WEATHER.visibility }
          ].map((stat, idx) => (
            <div key={idx} className="bg-[rgba(255,255,255,0.09)] border border-[rgba(255,255,255,0.2)] flex flex-col gap-1 items-start min-w-0 overflow-hidden p-3 rounded-xl">
              <p className="font-medium text-[rgba(255,255,255,0.9)] text-[12px] whitespace-nowrap">{stat.label}</p>
              <p className="font-bold leading-5 text-white">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Forecast */}
      <div className="bg-white border border-[#e3e7ef] flex flex-col gap-4 items-start overflow-hidden p-4 rounded-2xl text-[13px] w-full">
        <p className="font-bold text-[#182033] whitespace-nowrap">🕒 DỰ BÁO HÀNG GIỜ</p>
        {WEATHER.hourlyForecast && WEATHER.hourlyForecast.length > 0 ? (
          <HourlyTemperatureChart hourlyData={WEATHER.hourlyForecast || []} />
          ) : (
            <p className="text-[12px] text-[#5f687b] italic">Đang tải dữ liệu...</p>
          )}
        </div>

        
        {WEATHER.dailyForecast && WEATHER.dailyForecast.length > 0 && (
          <div className="bg-white border border-[#e3e7ef] flex flex-col gap-4 items-start overflow-hidden p-4 rounded-2xl text-[13px] w-full mt-0">
            <div className="flex flex-col gap-1 w-full">
              <p className="font-bold text-[#182033] whitespace-nowrap">📅 DỰ BÁO THỜI TIẾT TUẦN</p>
              {WEATHER.weekRange && <p className="font-medium text-[#5f687b] text-[12px]">{WEATHER.weekRange}</p>}
            </div>
            <div className="flex flex-col w-full gap-4">
              {WEATHER.dailyForecast.map((day: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between w-full">
                  <p className="font-semibold text-[#182033] w-[70px] shrink-0 text-left">{day.day}</p>
                  
                  <div className="flex items-center gap-2 w-[110px] shrink-0">
                    <img src={`https://openweathermap.org/img/wn/${day.icon}.png`} className="w-9 h-9 drop-shadow-sm" />
                    <div className="flex flex-col items-start leading-tight">
                      <span className="text-[#182033] text-[12px] font-bold">{getConditionLabel(day.icon)}</span>
                      {day.pop > 0 && <span className="text-[#0a84ff] text-[10px] font-bold tracking-tight">Mưa {day.pop}%</span>}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 justify-end flex-1 ml-2">
                    <span className="text-[#5f687b] font-medium text-[13px]">{day.tempMin}°</span>
                    <div className="flex-1 h-1.5 bg-gradient-to-r from-blue-400 to-red-400 rounded-full opacity-70"></div>
                    <span className="text-[#182033] font-bold text-[13px]">{day.tempMax}°</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}


      <div className="bg-white border border-[#e3e7ef] flex flex-col gap-2 items-start overflow-hidden p-4 rounded-2xl text-[13px] w-full">
        <p className="font-bold text-[#182033] whitespace-nowrap">🔮 DỰ BÁO 3 GIỜ TỚI</p>
        <p className="font-normal leading-5 text-[#5f687b] w-full">{WEATHER.forecastText}</p>
      </div>

      {/* Warning – only show when we have real warning text */}
      {warningText && (
        <div className="bg-[#fff7ed] border border-[#e3e7ef] flex flex-col gap-2 items-start overflow-hidden p-4 rounded-2xl text-[13px] w-full">
          <p className="font-bold text-[#182033] whitespace-nowrap">🚨 CẢNH BÁO TRỌNG TÂM</p>
          <div className="flex flex-col gap-1 w-full">
              {warningText.split('\n').map((line, i, arr) => {
                const prefix = arr.length > 1 ? (i === arr.length - 1 ? '└ ' : '├ ') : '└ ';
                const text = line.replace(/^[└├]\s*/, '');
                return <p key={i} className="font-normal leading-5 text-[#5f687b] w-full">{prefix}{text}</p>;
              })}
            </div>
        </div>
      )}

      {/* Suggestion – only show when we have items */}
      {suggestionItems && suggestionItems.length > 0 && (
        <div className="bg-[#f0fdf4] border border-[#e3e7ef] flex flex-col gap-2 items-start overflow-hidden p-4 rounded-2xl text-[13px] w-full">
          <p className="font-bold text-[#182033] whitespace-nowrap">💡 GỢI Ý LỊCH TRÌNH THỰC TẾ</p>
          <div className="flex flex-col gap-1 w-full mt-1">
            {suggestionItems.map((line, i, arr) => {
                const prefix = arr.length > 1 ? (i === arr.length - 1 ? '└ ' : '├ ') : '└ ';
                // Remove any leading bullet points or symbols like ▪, •, -, or corrupted chars
                const text = line.replace(/^[^a-zA-ZÀ-ỹ0-9]+\s*/, '');
                return <p key={i} className="font-normal leading-5 text-[#5f687b] w-full">{prefix}{text}</p>;
            })}
          </div>
        </div>
      )}

      {/* Combined Flood & Weather News */}
      <div className="bg-white border border-[#e3e7ef] flex flex-col items-start overflow-hidden p-4 rounded-2xl text-[13px] w-full">
        {/* Flood Section */}
        <p className="font-bold text-[#182033] whitespace-nowrap mb-2 uppercase">
          BẢNG ĐIỂM ĐEN NGẬP ÚNG (Hà Nội)
        </p>
        <div className="flex flex-col gap-0 w-full mb-1">
          {showFlood && floodItems && floodItems.length > 0 ? (
            floodItems.map((line, i) => (
              <p key={i} className="font-normal leading-5 text-[#5f687b]">{line}</p>
            ))
          ) : (
            <p className="font-normal leading-5 text-[#5f687b]">• Chưa ghi nhận dữ liệu điểm ngập đáng chú ý.</p>
          )}
        </div>

        {/* Divider & Weather News */}
        {liveOverrides?.weatherNews && liveOverrides.weatherNews.length > 0 && (
          <>
            <div className="w-full border-t border-[#e3e7ef] my-3"></div>
            
            <p className="font-bold text-[#182033] flex items-center gap-2 mb-3">
              📰 Bài viết liên quan
            </p>
            <div className="flex flex-col gap-3 w-full">
              {liveOverrides.weatherNews.map((news, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <span className="text-[#0a84ff] font-bold mt-[1px]">›</span>
                  <div className="flex flex-col gap-[2px]">
                    <div onClick={() => onArticleClick && onArticleClick(news)} role="button" tabIndex={0} className="font-medium text-[#0a84ff] hover:underline line-clamp-2 cursor-pointer">
                      {news.title}
                    </div>
                    <span className="text-[#5f687b] text-[11px]">{news.source}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Route advisory */}
      {showRouteAdvisory && routeItems && routeItems.length > 0 && (
        <div className="bg-[#eff6ff] border border-[#e3e7ef] flex flex-col gap-2 items-start overflow-hidden p-4 rounded-2xl text-[13px] w-full">
          <p className="font-bold text-[#182033] whitespace-nowrap">KHUYẾN CÁO LỘ TRÌNH</p>
          <div className="flex flex-col gap-0 w-full">
            {routeItems.map((line, i) => (
              <p key={i} className="font-normal leading-5 text-[#5f687b]">{line}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Live news item type ───────────────────────────────────────────────────────
type LiveNewsItem = { img: string; fallbackImg?: string; logo?: string; author: string; src: string; body: string; link?: string; fullContent?: { paragraphs: string[]; images: string[]; captions: string[]; headings: string[] } | null };

// ── Default mock news articles ────────────────────────────────────────────────
const DEFAULT_NEWS_FEED: LiveNewsItem[] = [
  { img: imgNews1, author: "Cạnh đảo nổi dừng Tết, làng đảo Hà Đông vào mùa cao điểm", src: "eva.vn · 10:09 AM", body: "Người dân làng chài tấp nập chuẩn bị cho mùa du lịch cao điểm năm nay sau kỳ nghỉ Tết." },
  { img: imgNews2, author: "Quần ống rộng giúp quý cô mặc đẹp cả tuần", src: "Thanh Niên · 09:45 AM", body: "Từ đi làm đến đi chơi, bí quyết phối đồ với quần ống rộng phong cách công sở hiện đại." },
  { img: imgNews3, author: "Hà Nội: Dự báo mưa lớn chiều tối nay", src: "VnExpress · 09:15 AM", body: "Cơ quan khí tượng thủy văn cảnh báo mưa vừa đến mưa to có thể xảy ra tại nhiều quận huyện." },
  { img: imgNews4, author: "Chứng khoán Việt Nam tăng mạnh phiên đầu tuần", src: "CafeF · 08:50 AM", body: "VN-Index bứt phá vượt ngưỡng kháng cự, dòng tiền đổ mạnh vào nhóm cổ phiếu vốn hóa lớn." },
  { img: imgNews5, author: "Đội tuyển Việt Nam chốt danh sách AFF Cup 2025", src: "Tuổi Trẻ · 08:20 AM", body: "HLV trưởng đội tuyển Việt Nam công bố 25 cầu thủ tập trung cho vòng loại AFF Cup sắp tới." },
];

// ── Mobile Layout ────────────────────────────────────────────────────────────


function MobileCategoryMenu({ activeCategory, setActiveCategory }: { activeCategory: string, setActiveCategory: (c: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="flex items-center gap-[6px] px-[12px] py-[6px] bg-white border border-[#e3e7ef] rounded-full text-[13px] font-semibold text-[#182033] shadow-sm active:scale-95 transition-transform"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
        <span>{activeCategory}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
      </button>
      
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 bg-white border border-[#e3e7ef] rounded-[16px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-2 z-[150] w-[280px]">
          <div className="grid grid-cols-2 gap-[6px]">
            {NEWS_CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => {
                  setActiveCategory(cat);
                  setIsOpen(false);
                }}
                className={`text-left px-3 py-[8px] rounded-[10px] text-[13px] transition-all ${activeCategory === cat ? 'bg-[#ff315f] text-white font-bold' : 'hover:bg-[#f4f6fa] text-[#5f687b] font-medium'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


function NewsDetailView({ article, allNews, onClose, onSelectRelated }: { article: any, allNews: any[], onClose: () => void, onSelectRelated: (item: any) => void }) {
  const [fullContent, setFullContent] = useState<string>('');
  const [isLoadingFull, setIsLoadingFull] = useState(false);

  const related = useMemo(() => {
    return allNews.filter((n: any) => n.link !== article.link).sort(() => 0.5 - Math.random()).slice(0, 3);
  }, [article, allNews]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'auto'; };
  }, []);

  useEffect(() => {
    if (!article.link) return;
    
    const renderContent = (fc: any) => {
      if (!fc || !fc.paragraphs || fc.paragraphs.length === 0) return null;
      let html = '';
      let imgIdx = 0;
      
      fc.headings?.forEach((h: string) => {
        html += `<h2 class="font-bold text-[#182033] text-[20px] md:text-[22px] mt-8 mb-4">${h}</h2>`;
      });
      
      fc.paragraphs.forEach((p: string, i: number) => {
        html += `<p class="mb-4 leading-relaxed text-[#334155] text-[16px] md:text-[18px]">${p}</p>`;
        if ((i + 1) % 3 === 0 && imgIdx < (fc.images?.length || 0)) {
          html += `<img src="${fc.images[imgIdx]}" class="w-full h-auto object-cover rounded-xl my-5 shadow-sm" loading="lazy" />`;
          if (fc.captions && fc.captions[imgIdx]) {
            html += `<p class="text-center text-[#5f687b] text-[14px] mt-2 mb-6 italic">${fc.captions[imgIdx]}</p>`;
          }
          imgIdx++;
        }
      });
      
      while (imgIdx < (fc.images?.length || 0)) {
        html += `<img src="${fc.images[imgIdx]}" class="w-full h-auto object-cover rounded-xl my-5 shadow-sm" loading="lazy" />`;
        if (fc.captions && fc.captions[imgIdx]) {
          html += `<p class="text-center text-[#5f687b] text-[14px] mt-2 mb-6 italic">${fc.captions[imgIdx]}</p>`;
        }
        imgIdx++;
      }
      return html;
    };
    
    // ── Hàm cào bài viết trực tiếp qua Worker Proxy (client-side DOMParser) ──
    const scrapeViaProxy = async (articleUrl: string) => {
      try {
        const PROXY = 'https://gold-api.mrkun28.workers.dev/proxy?url=';
        const res = await fetch(PROXY + encodeURIComponent(articleUrl));
        if (!res.ok) return null;
        const html = await res.text();
        
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // Xóa các phần tử không liên quan
        doc.querySelectorAll('script, style, nav, footer, header, .ads, .related, .box-tinlienquan, .detail-relate, .social, .comment, iframe, .banner').forEach(el => el.remove());
        
        // Tìm vùng nội dung chính theo thứ tự ưu tiên cho từng tờ báo
        const contentSelectors = [
          // VnExpress
          'article.fck_detail',
          '.fck_detail',
          // Thanh Niên
          '[data-role="content"]',
          '.detail-cmain',
          // Tuổi Trẻ
          '#main-detail-body',
          '.detail-content [data-role="content"]',
          // Dân Trí
          '.singular-content',
          '.e-magazine__body',
          // Zing/ZNews
          '.the-article-body',
          // CafeF / GenK
          '.knc-content',
          // Generic
          'article',
          '.post-content',
          '.entry-content',
          '.article-content',
          '.article-body',
        ];
        
        let contentEl: Element | null = null;
        for (const sel of contentSelectors) {
          const el = doc.querySelector(sel);
          if (el && el.textContent && el.textContent.trim().length > 200) {
            contentEl = el;
            break;
          }
        }
        
        if (!contentEl) return null;
        
        // Trích xuất đoạn văn (paragraphs)
        const paragraphs: string[] = [];
        contentEl.querySelectorAll('p').forEach(p => {
          const text = (p.textContent || '').trim();
          if (text.length > 20 && !text.startsWith('Ảnh:') && !text.startsWith('Video:')) {
            paragraphs.push(text);
          }
        });
        
        // Trích xuất headings
        const headings: string[] = [];
        contentEl.querySelectorAll('h2, h3').forEach(h => {
          const text = (h.textContent || '').trim();
          if (text.length > 5 && text.length < 200) headings.push(text);
        });
        
        // Trích xuất ảnh
        const images: string[] = [];
        contentEl.querySelectorAll('img').forEach(img => {
          const src = img.getAttribute('data-src') || img.getAttribute('src') || '';
          if (src && src.startsWith('http') && !src.includes('logo') && !src.includes('icon') && !src.includes('1x1') && !src.includes('pixel') && !src.includes('data:image')) {
            images.push(src);
          }
        });
        
        // Trích xuất captions
        const captions: string[] = [];
        contentEl.querySelectorAll('figcaption').forEach(cap => {
          const text = (cap.textContent || '').trim();
          if (text.length > 3) captions.push(text);
        });
        
        if (paragraphs.length === 0) return null;
        
        return { paragraphs, headings, images, captions };
      } catch (err) {
        console.warn('[Scrape] Error:', err);
        return null;
      }
    };
    
    // Nếu bot đã cào sẵn nội dung chi tiết → Hiển thị ngay lập tức
    if (article.fullContent && article.fullContent.paragraphs && article.fullContent.paragraphs.length > 0) {
      const html = renderContent(article.fullContent);
      if (html) { setFullContent(html); setIsLoadingFull(false); return; }
    }
    
    // Không có nội dung pre-crawled → chuyển thẳng sang trang gốc
    let cleanLink = article.link.replace(/<\!\[CDATA\[/g, '').replace(/\]\]>/g, '').trim();
    onClose();
    window.location.href = cleanLink;
  }, [article.link, article.body, article.fullContent]);

  return (
    <div className="fixed inset-0 z-[200] bg-white overflow-y-auto flex flex-col items-center">
      <div className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-[#e3e7ef] px-4 py-3 flex items-center justify-between w-full md:max-w-3xl z-10">
        <button onClick={onClose} className="p-2 -ml-2 rounded-full hover:bg-[#f4f6fa] text-[#182033] flex items-center gap-2">
           <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
           <span className="font-bold text-[16px]">Quay lại</span>
        </button>
      </div>

      <div className="p-5 w-full md:max-w-3xl flex flex-col gap-4 pb-12">
        <div className="flex items-center gap-3 w-full">
           <img alt="" className="rounded-full w-8 h-8 object-cover border border-gray-100" referrerPolicy="no-referrer" src={article.logo || article.img} data-fallback={article.fallbackImg || ""} onError={(e) => { const el = e.currentTarget as HTMLImageElement; if (el.src !== el.dataset.fallback && el.dataset.fallback) { el.src = el.dataset.fallback; } }} />
           <p className="font-medium text-[#5f687b] text-[14px]">{article.src}</p>
        </div>
        
        <h1 className="font-bold text-[#182033] text-[24px] md:text-[28px] leading-[1.3] mt-1">{article.author}</h1>
        
        <div className="w-full h-[250px] md:h-[400px] mt-2 relative rounded-[12px] overflow-hidden">
           <img alt="" className="absolute inset-0 max-w-none object-cover w-full h-full" referrerPolicy="no-referrer" src={article.img} data-fallback={article.fallbackImg || ""} onError={(e) => { const el = e.currentTarget as HTMLImageElement; if (el.src !== el.dataset.fallback && el.dataset.fallback) { el.src = el.dataset.fallback; } }} />
        </div>

        {isLoadingFull ? (
           <div className="flex flex-col gap-4 mt-6 animate-pulse">
              <div className="h-4 bg-[#e3e7ef] rounded w-full"></div>
              <div className="h-4 bg-[#e3e7ef] rounded w-11/12"></div>
              <div className="h-4 bg-[#e3e7ef] rounded w-full"></div>
              <div className="h-[200px] bg-[#e3e7ef] rounded w-full my-4"></div>
              <div className="h-4 bg-[#e3e7ef] rounded w-10/12"></div>
              <div className="h-4 bg-[#e3e7ef] rounded w-full"></div>
           </div>
        ) : (
           <div className="mt-6" dangerouslySetInnerHTML={{ __html: fullContent }} />
        )}



        {/* Nút xem bài viết gốc */}
        <a href={article.link?.replace(/<\!\[CDATA\[/g, '').replace(/\]\]>/g, '').trim()} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 mt-6 py-3 px-6 rounded-xl bg-[#182033] text-white font-bold text-[15px] hover:bg-[#2a3550] transition-colors w-full">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
          Xem bài viết gốc
        </a>

        {/* Related articles */}
        <div className="mt-10 border-t border-[#e3e7ef] pt-8">
           <h2 className="font-bold text-[#182033] text-[20px] mb-4">Bài viết liên quan</h2>
           <div className="flex flex-col gap-4">
             {related.map((item: any, i: number) => (
                <div key={i} className="flex gap-4 cursor-pointer group" onClick={() => { window.scrollTo({top:0, behavior:'smooth'}); onSelectRelated(item); }}>
                   <div className="flex-1 flex flex-col gap-2">
                      <p className="font-bold text-[#182033] text-[15px] line-clamp-3 group-hover:text-[#ff315f] transition-colors">{item.author}</p>
                      <p className="font-medium text-[#5f687b] text-[12px]">{item.src}</p>
                   </div>
                   <div className="w-[100px] h-[75px] shrink-0 rounded-lg overflow-hidden relative">
                      <img alt="" className="absolute inset-0 max-w-none object-cover w-full h-full group-hover:scale-105 transition-transform" referrerPolicy="no-referrer" src={item.img} data-fallback={item.fallbackImg || ""} onError={(e) => { const el = e.currentTarget as HTMLImageElement; if (el.src !== el.dataset.fallback && el.dataset.fallback) { el.src = el.dataset.fallback; } }} />
                   </div>
                </div>
             ))}
           </div>
        </div>
      </div>
    </div>
  );
}

function MobileLayout({ activeCategory, setActiveCategory,
  isFetchingCategory, isLoading, darkMode, setDarkMode,
    condKey,
  liveData,
  liveNews,
  liveOverrides,
  onArticleClick,
  userRole,
  onLoginSuccess,
  onLogout,
  onTokenExpired,
  onRelogin
}: {
  isFetchingCategory?: boolean;
    isLoading?: boolean;
    condKey: ConditionKey;
  liveData?: Record<ConditionKey, WeatherEntry>;
  liveNews?: LiveNewsItem[];
  liveOverrides?: LiveOverrides;
    activeCategory?: string;
    setActiveCategory?: (c: string) => void;
    darkMode?: boolean;
    setDarkMode?: (d: boolean) => void;
    onArticleClick?: (article: any) => void;
    userRole?: any;
    onLoginSuccess?: (res: any) => void;
    onLogout?: () => void;
    onTokenExpired?: () => void;
    onRelogin?: () => void;
}) {
  const WEATHER = (liveData ?? DEFAULT_WEATHER_DATA)[condKey];
  const newsFeed = liveNews ?? DEFAULT_NEWS_FEED;
  const now = useCurrentTime();
  const shortDateStr = `${now.getDate()} thg ${now.getMonth() + 1}`;
  const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;

  return (
    <div className="bg-[#f4f6fa] flex flex-col items-start w-full">
      <div className="bg-white border-b border-[#e3e7ef] flex h-[var(--header-height)] items-center justify-between px-[var(--page-padding)] w-full shrink-0 sticky top-0 z-[100]">
        <p className="font-bold text-[#ff315f] text-[20px]">Anx.</p>
        <div className="flex items-center">
          <div className="flex flex-col items-end">
            <p className="font-medium text-[#182033] text-[12px] whitespace-nowrap text-right">
            📍 {WEATHER.location}
          </p>
            <div className="bg-[#f4f6fa] mt-1 flex items-center px-2 py-0.5 rounded-full">
            <p className="font-normal text-[#5f687b] text-[10px] whitespace-nowrap">
              {shortDateStr} · {timeStr}
            </p>
          </div>
          </div>
          <div onClick={() => setDarkMode(!darkMode)} role="button" tabIndex={0} className="ml-2 w-[32px] h-[32px] rounded-full bg-[#f4f6fa] flex items-center justify-center text-[#182033] hover:bg-[#e3e7ef] transition-colors shrink-0 aspect-square cursor-pointer">
              {darkMode ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
              )}
            </div>
            {userRole && userRole.picture ? (
              <UserAvatarMenu userRole={userRole} onLogout={onLogout || (() => {})} />
            ) : (
              <CustomLoginButton onLoginSuccess={onLoginSuccess} />
            )}
        </div>
      </div>

      <LiveNewsTicker news={newsFeed} liveData={liveData} condKey={condKey} />

      <div className="flex flex-col gap-[var(--grid-gap)] items-start pb-8 pt-4 px-4 w-full">
        <div className="flex flex-col gap-[var(--grid-gap)] items-start w-full">
          <p className="font-semibold leading-[26px] text-[#182033] text-[18px]">Thời tiết</p>
          <WeatherSection isLoading={isLoading} condKey={condKey} liveData={liveData} liveOverrides={liveOverrides}  darkMode={darkMode} />
        </div>

        <LiveTimelineSection news={newsFeed} onArticleClick={onArticleClick} />

        <div className="flex flex-col gap-[var(--grid-gap)] items-start w-full">
          <MarketSection />
          {userRole && userRole.email ? (
            <div className="w-full">
            <CalendarSection userEmail={userRole.email} accessToken={userRole._access_token} onTokenExpired={onTokenExpired} onRelogin={onRelogin} />
            </div>
          ) : (
            <div className="w-full mb-6 bg-[#f8fafc] p-6 rounded-[var(--card-radius)] border border-dashed border-[#cbd5e1] flex flex-col items-center justify-center text-center gap-3">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              <p className="text-[#64748b] text-[14px] max-w-[200px]">Đăng nhập Google để xem Lịch cá nhân</p>
            </div>
          )}
                  <div className="flex items-center justify-between w-full mb-1 sticky top-[calc(var(--header-height)-1px)] bg-[#f4f6fa] z-[90] py-3 mt-[-12px]">
        <p className="font-semibold leading-[26px] text-[#182033] text-[18px]">
            Tin Tức Mới Nhất
        </p>
        <MobileCategoryMenu activeCategory={activeCategory} setActiveCategory={setActiveCategory} />
      </div>
          {(isFetchingCategory || isLoading) ? <NewsSkeleton /> : (<>
          {newsFeed.map((item, i) => (
              <div key={i} onClick={() => onArticleClick && onArticleClick(item)}  className="bg-white flex flex-col gap-[14px] items-start overflow-hidden p-[var(--card-padding)] rounded-[var(--card-radius)] shadow-[0px_4px_12px_0px_rgba(23,33,51,0.1)] hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(23,33,51,0.2)] transition-all duration-300 w-full no-underline group cursor-pointer"
            >
              <div className="flex flex-col gap-2 items-start w-full">
                  <div className="flex gap-[10px] items-center w-full">
                    <img alt="" className="rounded-full shrink-0 size-6 object-cover border border-gray-100" referrerPolicy="no-referrer" src={item.logo || item.img} data-fallback={item.fallbackImg || ""} onError={(e) => { const el = e.currentTarget; if (el.src !== el.dataset.fallback && el.dataset.fallback) { el.src = el.dataset.fallback; } }} />
                    <p className="font-normal text-[#5f687b] text-[12px]">{item.src}</p>
                  </div>
                  <p className="font-semibold text-[#182033] text-[length:var(--font-h4)] line-clamp-3 w-full leading-snug">{item.author}</p>
                </div>
              <p className="font-normal text-[#182033] text-[length:var(--font-body)] mt-2">{item.body}</p>
              <div className="h-[180px] relative rounded-[10px] w-full overflow-hidden">
                <img alt="" className="absolute inset-0 max-w-none object-cover size-full group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" src={item.img} data-fallback={item.fallbackImg || ""} onError={(e) => { const el = e.currentTarget; if (el.src !== el.dataset.fallback && el.dataset.fallback) { el.src = el.dataset.fallback; } }} />
              </div>
            </div>
          ))}
          </>)}
        </div>
      </div>
    </div>
  );
}

// ── Tablet Layout ────────────────────────────────────────────────────────────

function TabletLayout({ activeCategory, setActiveCategory,
  isFetchingCategory, isLoading, darkMode, setDarkMode,
    condKey,
  liveData,
  liveNews,
  liveOverrides,
  onArticleClick,
  userRole,
  onLoginSuccess,
  onLogout,
  onTokenExpired,
  onRelogin
}: {
  isFetchingCategory?: boolean;
    isLoading?: boolean;
    condKey: ConditionKey;
  liveData?: Record<ConditionKey, WeatherEntry>;
  liveNews?: LiveNewsItem[];
  liveOverrides?: LiveOverrides;
    activeCategory?: string;
    setActiveCategory?: (c: string) => void;
    darkMode?: boolean;
    setDarkMode?: (d: boolean) => void;
    onArticleClick?: (article: any) => void;
    userRole?: any;
    onLoginSuccess?: (res: any) => void;
    onLogout?: () => void;
    onTokenExpired?: () => void;
    onRelogin?: () => void;
}) {
  const WEATHER  = (liveData ?? DEFAULT_WEATHER_DATA)[condKey];
  const newsFeed = liveNews ?? DEFAULT_NEWS_FEED;
  const [featured, ...rest] = newsFeed;
  const now = useCurrentTime();
  const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  const dayName = days[now.getDay()];
  const dateStr = `${dayName}, ${now.getDate()} tháng ${now.getMonth() + 1}`;
  const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;

  return (
    <div className="bg-[#f4f6fa] flex flex-col items-start w-full">
      <div className="bg-white border-b border-[#e3e7ef] flex h-[var(--header-height)] items-center justify-between px-[var(--page-padding)] w-full shrink-0 max-w-[1200px] mx-auto sticky top-0 z-[100]">
        <div className="flex gap-[var(--grid-gap)] items-center">
          <p className="font-bold text-[#ff315f] text-[20px] whitespace-nowrap">Anx.</p>
          <p className="font-medium text-[#5f687b] text-[13px] whitespace-nowrap">
            📍 {WEATHER.location}
          </p>
        </div>
        <div className="flex items-center">
            <div className="bg-[#f4f6fa] flex items-start px-3 py-1 rounded-full">
          <p className="font-normal text-[#5f687b] text-[12px] whitespace-nowrap">
            {dateStr} · {timeStr}
          </p>
        </div>
            <div onClick={() => setDarkMode(!darkMode)} role="button" tabIndex={0} className="ml-2 w-[32px] h-[32px] rounded-full bg-[#f4f6fa] flex items-center justify-center text-[#182033] hover:bg-[#e3e7ef] transition-colors shrink-0 aspect-square cursor-pointer">
              {darkMode ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
              )}
            </div>
            {userRole && userRole.picture ? (
              <UserAvatarMenu userRole={userRole} onLogout={onLogout || (() => {})} />
            ) : (
              <CustomLoginButton onLoginSuccess={onLoginSuccess} />
            )}
          </div>

        </div>

      <LiveNewsTicker news={newsFeed} liveData={liveData} condKey={condKey} />

      <div className="flex gap-[var(--grid-gap)] items-start px-[var(--page-padding)] py-[var(--section-gap)] w-full max-w-[1200px] mx-auto">
        {/* Weather column */}
        <div className="flex flex-col gap-[var(--grid-gap)] items-start shrink-0 w-[calc(50%-10px)] max-w-[560px]">
          <WeatherSection compact isLoading={isLoading} condKey={condKey} liveData={liveData} liveOverrides={liveOverrides}  darkMode={darkMode} />
          <LiveTimelineSection news={newsFeed} onArticleClick={onArticleClick} />
        </div>

        {/* News panel */}
        <div className={`flex flex-1 flex-col gap-[var(--grid-gap)] items-start min-w-0 overflow-hidden transition-all duration-700 ease-in-out ${isLoading ? 'opacity-50 blur-[2px] grayscale-[0.3]' : 'opacity-100 blur-0 grayscale-0'}`}>
      <div className="flex overflow-x-auto gap-2 w-full pb-3 pt-3 scrollbar-hide sticky top-[var(--header-height)] bg-[#f4f6fa] z-[90] mt-[-12px]">
        {NEWS_CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`shrink-0 whitespace-nowrap px-4 py-[6px] rounded-full font-semibold text-[13px] transition-all ${activeCategory === cat ? 'bg-[#ff315f] text-white shadow-md' : 'bg-white text-[#5f687b] border border-[#e3e7ef]'}`}
          >
            {cat}
          </button>
        ))}
      </div>

          <MarketSection />
          {userRole && userRole.email ? (
            <div className="w-full">
            <CalendarSection userEmail={userRole.email} accessToken={userRole._access_token} onTokenExpired={onTokenExpired} onRelogin={onRelogin} />
            </div>
          ) : (
            <div className="w-full mb-6 bg-[#f8fafc] p-6 rounded-[var(--card-radius)] border border-dashed border-[#cbd5e1] flex flex-col items-center justify-center text-center gap-3">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              <p className="text-[#64748b] text-[14px] max-w-[200px]">Đăng nhập Google để xem Lịch cá nhân</p>
            </div>
          )}
          <div className="flex flex-col gap-[2px] items-start">
            <p className="font-semibold leading-[26px] text-[#182033] text-[18px]">Tin tức</p>
            <p className="font-normal text-[#5f687b] text-[12px]">
              {WEATHER.location} · {newsFeed.length} bài mới nhất
            </p>
          </div>

          {(isFetchingCategory || isLoading) ? <NewsSkeleton /> : (<>
          {/* Featured article */}
          {featured && (
            <div onClick={() => onArticleClick && onArticleClick(featured)}  className="bg-white flex flex-col items-start overflow-hidden rounded-[var(--card-radius)] shadow-[0px_4px_12px_0px_rgba(23,33,51,0.1)] hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(23,33,51,0.2)] transition-all duration-300 w-full no-underline group cursor-pointer"
            >
              <div className="h-[180px] relative rounded-tl-2xl rounded-tr-2xl w-full overflow-hidden">
                <img alt="" className="absolute inset-0 max-w-none object-cover size-full group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" src={featured.img} data-fallback={featured.fallbackImg || ""} onError={(e) => { const el = e.currentTarget; if (el.src !== el.dataset.fallback && el.dataset.fallback) { el.src = el.dataset.fallback; } }} />
                <div className="absolute bg-[#ff315f] left-3 top-3 flex items-start px-[10px] py-1 rounded-[6px]">
                  <p className="font-bold text-[10px] text-white tracking-[0.5px] uppercase">NỔI BẬT</p>
                </div>
              </div>
              <div className="flex flex-col gap-2 items-start p-[14px] w-full">
                <p className="font-bold leading-[22px] text-[#182033] text-[15px] w-full line-clamp-2">
                  {featured.author}
                </p>
                <p className="font-normal text-[#5f687b] text-[length:var(--font-caption)] w-full line-clamp-2 mt-1">
                  {featured.body}
                </p>
                <div className="flex items-center justify-between pt-1 w-full">
                  <div className="flex gap-[6px] items-center">
                    <div className="bg-[#f7a928] rounded-[4px] size-2" />
                    <p className="font-semibold text-[#ff315f] text-[11px]">{featured.src}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Remaining articles */}
          {rest.map((item, i) => (
            <div key={i} onClick={() => onArticleClick && onArticleClick(item)}  className="bg-white flex gap-[var(--grid-gap)] items-center overflow-hidden p-[var(--card-padding)] rounded-[var(--card-radius)] shadow-[0px_4px_12px_0px_rgba(23,33,51,0.1)] hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(23,33,51,0.2)] transition-all duration-300 w-full no-underline group cursor-pointer"
            >
              <div className="relative rounded-[10px] shrink-0 size-[72px] overflow-hidden bg-[#f4f6fa]">
                <img alt="" className="absolute inset-0 max-w-none object-cover size-full group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" src={item.img} data-fallback={item.fallbackImg || ""} onError={(e) => { const el = e.currentTarget; if (el.src !== el.dataset.fallback && el.dataset.fallback) { el.src = el.dataset.fallback; } }} />
              </div>
              <div className="flex flex-1 flex-col gap-1 items-start min-w-0 overflow-hidden">
                <div className="bg-[#ffe8ee] flex items-start px-[7px] py-[2px] rounded-[4px]">
                  <p className="font-bold text-[#ff315f] text-[10px]">{item.src}</p>
                </div>
                <p className="font-semibold text-[#182033] text-[length:var(--font-h4)] line-clamp-2 w-full">{item.author}</p>
                <p className="font-normal text-[#5f687b] text-[length:var(--font-caption)] line-clamp-1 w-full mt-1">{item.body}</p>
              </div>
            </div>
          ))}
          </>)}
        </div>
      </div>
    </div>
  );
}

// ── Desktop Layout ───────────────────────────────────────────────────────────

function DesktopLayout({ activeCategory, setActiveCategory,
  isFetchingCategory, isLoading, darkMode, setDarkMode,
    condKey,
  liveData,
  liveNews,
  liveOverrides,
  onArticleClick,
  userRole,
  onLoginSuccess,
  onLogout,
  onTokenExpired,
  onRelogin
}: {
  isFetchingCategory?: boolean;
    isLoading?: boolean;
    condKey: ConditionKey;
  liveData?: Record<ConditionKey, WeatherEntry>;
  liveNews?: LiveNewsItem[];
  liveOverrides?: LiveOverrides;
    activeCategory?: string;
    setActiveCategory?: (c: string) => void;
    darkMode?: boolean;
    setDarkMode?: (d: boolean) => void;
    onArticleClick?: (article: any) => void;
    userRole?: any;
    onLoginSuccess?: (res: any) => void;
    onLogout?: () => void;
    onTokenExpired?: () => void;
    onRelogin?: () => void;
}) {
  const WEATHER  = (liveData ?? DEFAULT_WEATHER_DATA)[condKey];
  const newsFeed = liveNews ?? DEFAULT_NEWS_FEED;
  const [featured, ...grid] = newsFeed;
  const now = useCurrentTime();
  const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    const dayName = days[now.getDay()];
    const dateStr = `${dayName}, ${now.getDate()} tháng ${now.getMonth() + 1}`;
  const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
  return (
    <div className="bg-[#f4f6fa] flex flex-col items-start w-full">
      <div className="bg-white border-b border-[#e3e7ef] flex h-[var(--header-height)] items-center justify-between px-[var(--page-padding)] w-full shrink-0 max-w-[1536px] mx-auto sticky top-0 z-[100]">
        <div className="flex gap-[var(--grid-gap)] items-center">
          <p className="font-bold text-[#182033] text-[18px] whitespace-nowrap">Anx.</p>
        </div>
        <div className="flex items-center">
          <div className="bg-[#f4f6fa] flex items-center px-3 py-1 rounded-full">
            <p className="font-normal text-[#5f687b] text-[12px] whitespace-nowrap">
              {dateStr} · {timeStr}
            </p>
          </div>
          <div onClick={() => setDarkMode(!darkMode)} role="button" tabIndex={0} className="ml-2 w-[32px] h-[32px] rounded-full bg-[#f4f6fa] flex items-center justify-center text-[#182033] hover:bg-[#e3e7ef] transition-colors shrink-0 aspect-square cursor-pointer">
            {darkMode ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
            )}
          </div>
          {userRole && userRole.picture ? (
            <UserAvatarMenu userRole={userRole} onLogout={onLogout || (() => {})} />
          ) : (
            <CustomLoginButton onLoginSuccess={onLoginSuccess} />
          )}
        </div>
      </div>

      <LiveNewsTicker news={newsFeed} liveData={liveData} condKey={condKey} />

      <div className="flex gap-[var(--grid-gap)] items-start px-[var(--page-padding)] py-[var(--section-gap)] w-full max-w-[1536px] mx-auto">
        {/* Weather column */}
        <div className="flex flex-col gap-[var(--grid-gap)] items-start shrink-0 w-[420px]">
          <WeatherSection compact isLoading={isLoading} condKey={condKey} liveData={liveData} liveOverrides={liveOverrides}  darkMode={darkMode} />
          <LiveTimelineSection news={newsFeed} onArticleClick={onArticleClick} />
        </div>

        {/* News column */}
        <div className={`flex flex-1 flex-col gap-[var(--grid-gap)] items-start min-w-0 overflow-hidden transition-all duration-700 ease-in-out ${isLoading ? 'opacity-50 blur-[2px] grayscale-[0.3]' : 'opacity-100 blur-0 grayscale-0'}`}>
      <div className="flex gap-[var(--grid-gap)] w-full items-stretch">
        <div className="flex-[5] min-w-0">
          <MarketSection />
        </div>
        {userRole && userRole.email ? (
          <div className="flex-[3] min-w-[250px]">
            <CalendarSection userEmail={userRole.email} accessToken={userRole._access_token} onTokenExpired={onTokenExpired} onRelogin={onRelogin} />
          </div>
        ) : (
          <div className="flex-[3] min-w-[250px] mb-6 bg-[#f8fafc] p-6 rounded-[var(--card-radius)] border border-dashed border-[#cbd5e1] flex flex-col items-center justify-center text-center gap-3">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            <p className="text-[#64748b] text-[14px] max-w-[200px]">Đăng nhập Google để xem Lịch cá nhân của bạn</p>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between w-full mb-1 sticky top-[var(--header-height)] bg-[#f4f6fa] z-[90] py-3 mt-[-12px]">
        <div className="flex gap-[10px] items-center">
          <p className="font-semibold leading-[26px] text-[#182033] text-[18px]">
            Tin Tức Mới Nhất
          </p>
          <div className="bg-[#f7a928] flex items-start px-[10px] py-[3px] rounded-full">
            <p className="font-bold text-[11px] text-white">LIVE</p>
          </div>
        </div>
        <MobileCategoryMenu activeCategory={activeCategory} setActiveCategory={setActiveCategory} />
      </div>

          {(isFetchingCategory || isLoading) ? <NewsSkeleton /> : (<>
          {/* Featured feed card */}
          {featured && (
            <div onClick={() => onArticleClick && onArticleClick(featured)}  className="bg-white flex flex-col gap-[14px] items-start overflow-hidden p-[var(--card-padding)] rounded-[var(--card-radius)] shadow-[0px_4px_12px_0px_rgba(23,33,51,0.1)] hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(23,33,51,0.2)] transition-all duration-300 w-full no-underline group cursor-pointer"
            >
              <div className="flex gap-[10px] items-center overflow-hidden w-full">
                <div className="bg-[#ffe8ee] flex flex-col items-center justify-center overflow-hidden rounded-full shrink-0 size-11 border border-gray-100">
                  <img alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" src={featured.logo || featured.img} data-fallback={featured.fallbackImg || ""} onError={(e) => { const el = e.currentTarget as HTMLImageElement; if (el.src !== el.dataset.fallback && el.dataset.fallback) { el.src = el.dataset.fallback; } }} />
                </div>
                <div className="flex flex-1 flex-col items-start min-w-0 overflow-hidden">
                  <p className="font-semibold text-[#182033] text-[14px] line-clamp-1">{featured.src}</p>
                  <p className="font-normal text-[#5f687b] text-[12px]">{WEATHER.time}</p>
                </div>
              </div>
              <p className="font-bold text-[#182033] text-[length:var(--font-h3)] w-full line-clamp-3 mb-2">
                {featured.author}
              </p>
              <div className="h-[180px] relative rounded-[10px] w-full overflow-hidden">
                <img alt="" className="absolute inset-0 max-w-none object-cover size-full group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" src={featured.img} data-fallback={featured.fallbackImg || ""} onError={(e) => { const el = e.currentTarget; if (el.src !== el.dataset.fallback && el.dataset.fallback) { el.src = el.dataset.fallback; } }} />
              </div>
              {featured.body && (
                <p className="font-normal text-[#5f687b] text-[length:var(--font-body)] line-clamp-2 mt-3">{featured.body}</p>
              )}
            </div>
          )}

          {/* News grid */}
            <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-[var(--grid-gap)] w-full">
              {grid.map((item, i) => (
                <div key={i} onClick={() => onArticleClick && onArticleClick(item)}  className="bg-white flex flex-col items-start overflow-hidden rounded-[var(--card-radius)] shadow-[0px_4px_12px_0px_rgba(23,33,51,0.1)] hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(23,33,51,0.2)] transition-all duration-300 w-full no-underline group cursor-pointer"
                >
                <div className="h-[140px] relative w-full overflow-hidden">
                  <img alt="" className="absolute inset-0 max-w-none object-cover size-full group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" src={item.img} data-fallback={item.fallbackImg || ""} onError={(e) => { const el = e.currentTarget; if (el.src !== el.dataset.fallback && el.dataset.fallback) { el.src = el.dataset.fallback; } }} />
                </div>
                <div className="flex flex-col gap-[6px] items-start p-[14px] w-full">
                  <div className="flex gap-2 items-center">
                    <div className="bg-[#ffe8ee] flex items-start px-2 py-[3px] rounded-full">
                      <p className="font-semibold text-[#ff315f] text-[11px]">{item.src}</p>
                    </div>
                  </div>
                  <p className="font-bold text-[#182033] text-[length:var(--font-h4)] w-full line-clamp-2 mt-2">{item.author}</p>
                  <p className="font-normal text-[#5f687b] text-[length:var(--font-caption)] w-full line-clamp-2 mt-1">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
          </>)}

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
            <p className="font-bold text-[#182033] text-[15px]">Chọn trạng thái thời tiết</p>
            <p className="font-normal text-[#9aa3b0] text-[12px] mt-[2px]">Dữ liệu thực tế sẽ tự cập nhật khi tích hợp API</p>
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
                  <p className={`font-semibold text-[14px] ${active ? "text-[#182033]" : "text-[#182033]"}`}>
                    {opt.label}
                  </p>
                  <p className="font-normal text-[#9aa3b0] text-[12px]">{opt.desc}</p>
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


function InfiniteScrollTrigger({ onTrigger, isLoading, hasMoreNews }: { onTrigger: () => void, isLoading: boolean, hasMoreNews: boolean }) {
  const targetRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // 1. Intersection Observer
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !isLoading) {
        onTrigger();
      }
    }, { rootMargin: '150px' });
    if (targetRef.current) observer.observe(targetRef.current);
    
    // 2. Backup scroll event
    const handleScroll = () => {
      if (!targetRef.current || isLoading) return;
      const rect = targetRef.current.getBoundingClientRect();
      // If the top of the trigger element is within 500px of the bottom of the viewport
      if (rect.top <= window.innerHeight + 500) {
        onTrigger();
      }
    };
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('touchmove', handleScroll);
    
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('touchmove', handleScroll);
    };
  }, [onTrigger, isLoading]);
  
  return (
    <div ref={targetRef} className="w-full flex flex-col items-center justify-center gap-4 py-8 pb-12">
      <button 
        onClick={onTrigger} 
        disabled={isLoading || !hasMoreNews}
        className="px-[16px] py-[10px] bg-[#e3e7ef] text-[#182033] font-semibold rounded-[8px] min-h-[44px] active:scale-95 transition-transform disabled:opacity-50"
      >
        {!hasMoreNews ? "Đã tải hết tin tức hiện có" : isLoading ? "⏳ Đang tải thêm 10 bài..." : "↓ Tải thêm tin tức"}
      </button>
      <div className="w-full text-center py-2 text-[10px] text-gray-400">Phiên bản: 15:33:35</div>
    </div>
  );
}


// ── Live Components ────────────────────────────────────────────────────────────

function LiveNewsTicker({ news, liveData, condKey }: { news: LiveNewsItem[], liveData?: any, condKey?: string }) {
  const WEATHER = (liveData ?? DEFAULT_WEATHER_DATA)[condKey || 'HaNoi'];
  const topNews = news.slice(0, 5);
  
  if (!news.length) return null;

  return (
    <div className="w-full bg-[#182033] text-white flex items-center h-[40px] overflow-hidden relative shadow-sm z-[90]">
      <div className="bg-[#ff315f] text-white font-bold text-[12px] px-4 py-1 flex items-center shrink-0 z-10 h-full tracking-wider uppercase">
        <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse mr-2"></div>
        Tin nóng
      </div>
      <div className="flex-1 overflow-hidden h-full flex items-center relative" style={{ maskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)' }}>
        <div className="animate-marquee whitespace-nowrap flex items-center gap-10 text-[13px] font-medium min-w-full">
          {topNews.map((n, i) => (
            <span key={i} className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#5f687b]"></span>
              {n.title}
            </span>
          ))}
          <span className="flex items-center gap-3 text-[#3a7bd5]">
             <span className="w-1.5 h-1.5 rounded-full bg-[#3a7bd5]"></span>
             Thời tiết hôm nay: {WEATHER.temp}°, {WEATHER.condition}
          </span>
          <span className="flex items-center gap-3 text-[#10b981]">
             <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span>
             VN-Index: 1250.32 (+5.2 điểm)
          </span>
        </div>
      </div>
    </div>
  );
}

function LiveTimelineSection({ news, onArticleClick }: { news: LiveNewsItem[], onArticleClick?: (article: any) => void }) {
  const recentNews = news.slice(0, 5);
  return (
    <div className="w-full bg-white p-5 rounded-[var(--card-radius)] shadow-[0px_4px_12px_0px_rgba(23,33,51,0.1)] border border-[#e3e7ef] flex flex-col mb-[var(--grid-gap)] relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#ff315f]/5 to-transparent rounded-bl-full pointer-events-none"></div>
      
      <div className="flex items-center gap-2 mb-5">
        <div className="relative flex items-center justify-center w-2.5 h-2.5">
          <div className="absolute w-full h-full bg-[#ff315f] rounded-full animate-ping opacity-75"></div>
          <div className="relative w-1.5 h-1.5 bg-[#ff315f] rounded-full"></div>
        </div>
        <h2 className="font-bold text-[#182033] text-[16px] uppercase tracking-wide">Trực tiếp sự kiện</h2>
      </div>

      <div className="flex flex-col relative before:absolute before:left-[4px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gradient-to-b before:from-[#ff315f] before:via-[#e3e7ef] before:to-transparent">
        {recentNews.map((item, idx) => {
          const pubDateStr = (item as any).pubDate || "";
          const timeMatch = pubDateStr.match(/(\d{2}:\d{2})/);
          const time = timeMatch ? timeMatch[1] : "Vừa xong";
          return (
            <div key={idx} onClick={() => onArticleClick && onArticleClick(item)} className="relative pl-5 pb-5 last:pb-0 group/item cursor-pointer">
              <div className="absolute left-[0px] top-1.5 w-[10px] h-[10px] rounded-full bg-white border-2 border-[#ff315f] group-hover/item:bg-[#ff315f] group-hover/item:shadow-[0_0_8px_rgba(255,49,95,0.5)] transition-all z-10"></div>
              <p className="text-[11px] font-bold text-[#ff315f] mb-1 tracking-wider">{time}</p>
              <h3 className="text-[14px] font-semibold text-[#182033] leading-snug group-hover/item:text-[#3a7bd5] transition-colors line-clamp-2">{item.title}</h3>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export const NEWS_CATEGORIES = ["Tất cả", "Thời sự", "Công nghệ", "AI", "Giới trẻ", "Giáo dục", "Kinh tế", "Startup", "Giải trí", "Du lịch", "Thể thao"];

export const RSS_FEEDS_DB = [
  // Thời sự
  { category: "Thời sự", name: "VnExpress", url: "https://vnexpress.net/rss/thoi-su.rss" },
  { category: "Thời sự", name: "Tuổi Trẻ", url: "https://tuoitre.vn/rss/thoi-su.rss" },
  { category: "Thời sự", name: "Thanh Niên", url: "https://thanhnien.vn/rss/thoi-su.rss" },
  { category: "Thời sự", name: "VietnamNet", url: "https://vietnamnet.vn/rss/thoi-su.rss" },
  { category: "Thời sự", name: "Dân Trí", url: "https://dantri.com.vn/rss/xa-hoi.rss" },
  { category: "Thời sự", name: "VTV News", url: "https://vtv.vn/trong-nuoc.rss" },
  { category: "Thời sự", name: "Tiền Phong", url: "https://tienphong.vn/rss/xa-hoi-2.rss" },
  { category: "Thời sự", name: "Người Lao Động", url: "https://nld.com.vn/rss/thoi-su.rss" },
  { category: "Thời sự", name: "Lao Động", url: "https://laodong.vn/rss/thoi-su.rss" },

  // Công nghệ
  { category: "Công nghệ", name: "VnExpress • Số Hóa", url: "https://vnexpress.net/rss/so-hoa.rss" },
  { category: "Công nghệ", name: "Thanh Niên • Công nghệ", url: "https://thanhnien.vn/rss/cong-nghe-game.rss" },
  { category: "Công nghệ", name: "GenK", url: "https://genk.vn/rss/home.rss" },
  { category: "Công nghệ", name: "ICTNews", url: "https://vietnamnet.vn/rss/cong-nghe.rss" },
  { category: "Công nghệ", name: "Dân Trí • Sức mạnh số", url: "https://dantri.com.vn/rss/suc-manh-so.rss" },
  { category: "Công nghệ", name: "Tuổi Trẻ • Công nghệ", url: "https://tuoitre.vn/rss/cong-nghe.rss" },

  // AI
  
  { category: "AI", name: "Dân Trí • Sức mạnh số", url: "https://dantri.com.vn/rss/suc-manh-so.rss" },
  

  // Giới trẻ
  { category: "Giới trẻ", name: "Tuổi Trẻ • Nhịp sống trẻ", url: "https://tuoitre.vn/rss/nhip-song-tre.rss" },
  { category: "Giới trẻ", name: "Thanh Niên • Giới trẻ", url: "https://thanhnien.vn/rss/gioi-tre.rss" },
  { category: "Giới trẻ", name: "Dân Trí • Nhịp sống trẻ", url: "https://dantri.com.vn/rss/nhip-song-tre.rss" },
  { category: "Giới trẻ", name: "Kenh14", url: "https://kenh14.vn/rss/home.rss" },

  // Giáo dục
  { category: "Giáo dục", name: "VnExpress • Giáo dục", url: "https://vnexpress.net/rss/giao-duc.rss" },
  { category: "Giáo dục", name: "Tuổi Trẻ • Giáo dục", url: "https://tuoitre.vn/rss/giao-duc.rss" },
  { category: "Giáo dục", name: "Thanh Niên • Giáo dục", url: "https://thanhnien.vn/rss/giao-duc.rss" },
  { category: "Giáo dục", name: "Dân Trí • Giáo dục", url: "https://dantri.com.vn/rss/giao-duc.rss" },

  // Kinh tế
  { category: "Kinh tế", name: "VnEconomy", url: "https://vneconomy.vn/rss/home.rss" },
  { category: "Kinh tế", name: "CafeF", url: "https://cafef.vn/rss/home.rss" },
  { category: "Kinh tế", name: "VietnamBiz", url: "https://vietnambiz.vn/rss/home.rss" },
  { category: "Kinh tế", name: "VnExpress • Kinh doanh", url: "https://vnexpress.net/rss/kinh-doanh.rss" },

  // Startup
  { category: "Startup", name: "CafeBiz", url: "https://cafebiz.vn/rss/home.rss" },
  { category: "Startup", name: "VnExpress • Startup", url: "https://vnexpress.net/rss/startup.rss" },
  { category: "Startup", name: "Diễn đàn Doanh nghiệp", url: "https://diendandoanhnghiep.vn/rss/khoi-nghiep.rss" },

  // Giải trí
  { category: "Giải trí", name: "VnExpress • Giải trí", url: "https://vnexpress.net/rss/giai-tri.rss" },
  { category: "Giải trí", name: "Tuổi Trẻ • Giải trí", url: "https://tuoitre.vn/rss/giai-tri.rss" },
  { category: "Giải trí", name: "Thanh Niên • Giải trí", url: "https://thanhnien.vn/rss/giai-tri.rss" },
  { category: "Giải trí", name: "Ngôi Sao", url: "https://ngoisao.vnexpress.net/rss/showbiz.rss" },

  // Du lịch
  { category: "Du lịch", name: "VnExpress • Du lịch", url: "https://vnexpress.net/rss/du-lich.rss" },
  { category: "Du lịch", name: "Tuổi Trẻ • Du lịch", url: "https://tuoitre.vn/rss/du-lich.rss" },
  { category: "Du lịch", name: "Thanh Niên • Du lịch", url: "https://thanhnien.vn/rss/du-lich.rss" },

  // Thể thao
  { category: "Thể thao", name: "VnExpress • Thể thao", url: "https://vnexpress.net/rss/the-thao.rss" },
  { category: "Thể thao", name: "Tuổi Trẻ • Thể thao", url: "https://tuoitre.vn/rss/the-thao.rss" },
  { category: "Thể thao", name: "Thanh Niên • Thể thao", url: "https://thanhnien.vn/rss/the-thao.rss" },
  { category: "Thể thao", name: "BongdaPlus", url: "https://bongdaplus.vn/rss/home.rss" }
];



export function decodeHTMLEntities(text: string) {
  if (!text) return "";
  try {
    let decoded = text.replace(/&amp;/g, '&'); // Fix double encoded first
    const doc = new DOMParser().parseFromString(decoded, "text/html");
    decoded = doc.documentElement.textContent || "";
    // If still double encoded somehow
    if (decoded.includes('&')) {
       const doc2 = new DOMParser().parseFromString(decoded, "text/html");
       decoded = doc2.documentElement.textContent || "";
    }
    return decoded;
  } catch(e) {
    return text;
  }
}


// ── Per-Section Skeleton Components ─────────────────────────────────────────
function SkeletonBox({ className }: { className?: string }) {
  return <div className={`bg-gradient-to-r from-[#e3e7ef] via-[#f4f6fa] to-[#e3e7ef] animate-pulse rounded ${className}`} style={{ backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite ease-in-out' }} />;
}

function WeatherSectionSkeleton() {
  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex flex-col gap-4 p-6 rounded-2xl lg:h-[400px] lg:justify-between" style={{ background: 'linear-gradient(21deg, #c7d2e8 0%, #b8c3dc 50%, #c7d2e8 100%)' }}>
        <SkeletonBox className="w-32 h-4 bg-white/30 rounded-xl" />
        <div className="flex flex-col gap-2">
          <SkeletonBox className="w-40 h-14 bg-white/30 rounded-xl" />
          <SkeletonBox className="w-28 h-5 bg-white/30 rounded-xl" />
          <SkeletonBox className="w-24 h-4 bg-white/20 rounded-xl" />
        </div>
        <div className="grid grid-cols-2 gap-2 w-full">
          {[1,2,3,4].map(i => (
            <SkeletonBox key={i} className="h-14 bg-white/20 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

function MarketSectionSkeleton() {
  return (
    <div className="w-full flex flex-col gap-3 mb-6 bg-white p-[var(--card-padding)] rounded-[var(--card-radius)] shadow-[0px_4px_12px_0px_rgba(23,33,51,0.1)] border border-[#e3e7ef] lg:h-[400px]">
      <div className="flex items-center justify-between w-full mb-1">
        <SkeletonBox className="w-36 h-6" />
        <SkeletonBox className="w-12 h-5 rounded-full" />
      </div>
      <div className="grid grid-cols-3 gap-2 w-full mt-1">
        {[1,2,3].map(i => (
          <div key={i} className="flex flex-col gap-2 p-3 border border-[#e3e7ef] rounded-xl bg-[#f8fafc]">
            <SkeletonBox className="w-full h-4" />
            <SkeletonBox className="w-3/4 h-4" />
            <SkeletonBox className="w-1/2 h-3" />
            <SkeletonBox className="w-1/2 h-3" />
          </div>
        ))}
      </div>
      <div className="w-full mt-4 bg-[#f8fafc] border border-[#e3e7ef] rounded-xl p-3 flex flex-col gap-2">
        <SkeletonBox className="w-full h-[65px] rounded-xl" />
        <div className="flex justify-between mt-1">
          {[1,2,3,4,5,6,7].map(i => <SkeletonBox key={i} className="w-6 h-3" />)}
        </div>
      </div>
    </div>
  );
}

function CalendarSectionSkeleton() {
  return (
    <div className="w-full min-h-[300px] mb-6 bg-white p-5 rounded-[var(--card-radius)] shadow-[0px_4px_12px_0px_rgba(23,33,51,0.1)] border border-[#e3e7ef] flex flex-col lg:h-[400px]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex flex-col gap-2">
          <SkeletonBox className="w-28 h-5" />
          <SkeletonBox className="w-40 h-3" />
        </div>
        <div className="flex gap-1">
          <SkeletonBox className="w-7 h-7 rounded-lg" />
          <SkeletonBox className="w-7 h-7 rounded-lg" />
        </div>
      </div>
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {[1,2,3,4,5,6,7].map(i => <SkeletonBox key={i} className="h-6" />)}
      </div>
      <div className="grid grid-cols-7 gap-0.5 flex-1">
        {Array.from({ length: 35 }).map((_, i) => (
          <SkeletonBox key={i} className="rounded-lg min-h-[36px]" />
        ))}
      </div>
    </div>
  );
}

function NewsSkeleton() {
  return (
    <div className="flex flex-col gap-[14px] w-full">
      <div className="w-full h-[240px] bg-[#e3e7ef] animate-pulse rounded-[16px]"></div>
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="flex gap-[14px] w-full p-[14px] bg-white rounded-[12px] border border-[#e3e7ef]">
          <div className="flex-1 flex flex-col gap-2 pt-1">
            <div className="w-full h-[18px] bg-[#e3e7ef] animate-pulse rounded"></div>
            <div className="w-3/4 h-[18px] bg-[#e3e7ef] animate-pulse rounded"></div>
            <div className="w-1/3 h-[14px] bg-[#e3e7ef] animate-pulse rounded mt-2"></div>
          </div>
          <div className="w-[110px] h-[80px] bg-[#e3e7ef] animate-pulse rounded-[8px] shrink-0"></div>
        </div>
      ))}
    </div>
  );
}

export function getNewspaperLogo(url: string) {
  if (!url || typeof url !== 'string') return "";
  try {
    const domain = new URL(url).hostname;
    if (domain.includes('dantri.com.vn')) {
      return 'https://dantri.com.vn/favicon.ico';
    }
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
  } catch (e) {
    return "";
  }
}

export function getProxyImageUrl(url: string) {
  if (!url || typeof url !== 'string') return "";
  let cleanUrl = url.trim();
  if (cleanUrl.startsWith("//")) cleanUrl = "https:" + cleanUrl;
  
  if (cleanUrl.includes("dantri.dev")) {
    cleanUrl = cleanUrl.replace("dantri.dev", "dantri.com.vn");
  }
  
  const bypassDomains = ['dantri.com.vn', 'tuoitre.vn', 'thanhnien.vn', 'vietnamnet.vn', 'vtv.vn'];
  if (bypassDomains.some(d => cleanUrl.includes(d))) {
    return cleanUrl;
  }
  
  if (cleanUrl.startsWith("http") && !cleanUrl.includes("wsrv.nl")) {
    return `https://wsrv.nl/?url=${encodeURIComponent(cleanUrl)}`;
  }
  return cleanUrl;
}


  // Helper: Get today's articles only
  const isToday = (dateString: string | undefined) => {
    if (!dateString) return false;
    try {
      const d = new Date(dateString.replace(' ', 'T') + 'Z');
      const now = new Date();
      return d.getDate() === now.getDate() &&
             d.getMonth() === now.getMonth() &&
             d.getFullYear() === now.getFullYear();
    } catch { return false; }
  };


  const getWindDirection = (deg: number) => {
    if (deg >= 337.5 || deg < 22.5) return 'Bắc';
    if (deg >= 22.5 && deg < 67.5) return 'Đông Bắc';
    if (deg >= 67.5 && deg < 112.5) return 'Đông';
    if (deg >= 112.5 && deg < 157.5) return 'Đông Nam';
    if (deg >= 157.5 && deg < 202.5) return 'Nam';
    if (deg >= 202.5 && deg < 247.5) return 'Tây Nam';
    if (deg >= 247.5 && deg < 292.5) return 'Tây';
    if (deg >= 292.5 && deg < 337.5) return 'Tây Bắc';
    return '';
  };


function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const toggleVisibility = () => setIsVisible(window.scrollY > 300);
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);
  return isVisible ? (
    <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="fixed bottom-6 right-6 z-[100] bg-white border border-[#e3e7ef] shadow-[0_8px_20px_rgba(23,33,51,0.2)] hover:-translate-y-1 transition-all duration-300 rounded-full size-12 flex items-center justify-center text-[#ff315f] group animate-fade-in">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-y-1 transition-transform duration-300"><path d="M18 15l-6-6-6 6"/></svg>
    </button>
  ) : null;
}




function CalendarSection({ userEmail, accessToken, onTokenExpired, onRelogin }: { userEmail: string; accessToken?: string; onTokenExpired?: () => void; onRelogin?: () => void }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  // map: day (number) -> array of event titles
  const [events, setEvents] = useState<Record<number, string[]>>({});
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [initialLoaded, setInitialLoaded] = useState(false);
  const [hasScopeError, setHasScopeError] = useState(false);
  const [activeTooltipDay, setActiveTooltipDay] = useState<number | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Fetch Google Calendar events whenever month/year or token changes
  useEffect(() => {
    if (!accessToken) return;
    setLoadingEvents(true);
    setHasScopeError(false);
    const timeMin = new Date(year, month, 1).toISOString();
    const timeMax = new Date(year, month + 1, 0, 23, 59, 59).toISOString();
    fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(timeMax)}&singleEvents=true&orderBy=startTime&maxResults=100`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    )
      .then(r => {
        if (!r.ok) {
          if (r.status === 401) {
            setHasScopeError(true);
            if (onTokenExpired) onTokenExpired();
          } else if (r.status === 403) {
            setHasScopeError(true);
          }
          throw new Error('API Error');
        }
        return r.json();
      })
      .then(data => {
        const map: Record<number, string[]> = {};
        (data.items || []).forEach((ev: any) => {
          const start = ev.start?.dateTime || ev.start?.date;
          if (!start) return;
          const d = new Date(start).getDate();
          if (!map[d]) map[d] = [];
          map[d].push(ev.summary || '(Không có tiêu đề)');
        });
        setEvents(map);
      })
      .catch(() => {})
      .finally(() => { setLoadingEvents(false); setInitialLoaded(true); });
  }, [accessToken, year, month]);

  // Show skeleton only on first load when we have a token
  if (accessToken && !initialLoaded && loadingEvents) return <CalendarSectionSkeleton />;

  const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (y: number, m: number) => new Date(y, m, 1).getDay();

  const daysInMonth = getDaysInMonth(year, month);
  let firstDay = getFirstDayOfMonth(year, month);
  firstDay = firstDay === 0 ? 6 : firstDay - 1; // Mon=0 … Sun=6

  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
  const monthNames = ['Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6','Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12'];

  return (
    <div onClick={() => setActiveTooltipDay(null)} className="w-full h-full min-h-[300px] mb-6 bg-white p-5 rounded-[var(--card-radius)] shadow-[0px_4px_12px_0px_rgba(23,33,51,0.1)] border border-[#e3e7ef] flex flex-col lg:h-[400px]" style={{ fontFamily: 'inherit' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="font-semibold text-[#182033] text-[15px]">{monthNames[month]}, {year}</h2>
          <p className="text-[#5f687b] text-[11px] truncate max-w-[160px]" title={userEmail}>{userEmail}</p>
        </div>
        <div className="flex gap-1 items-center">
          {loadingEvents && (
            <div className="w-3 h-3 rounded-full border-2 border-[#3a7bd5] border-t-transparent animate-spin mr-1"></div>
          )}
          <button onClick={() => { setActiveTooltipDay(null); setCurrentDate(new Date(year, month - 1, 1)); }} className="p-1.5 hover:bg-[#f4f6fa] rounded-lg text-[#5f687b] transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <button onClick={() => { setActiveTooltipDay(null); setCurrentDate(new Date(year, month + 1, 1)); }} className="p-1.5 hover:bg-[#f4f6fa] rounded-lg text-[#5f687b] transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        </div>
      </div>

      {/* Day-of-week header */}
      <div className="grid grid-cols-7 gap-0.5 text-center mb-1">
        {['T2','T3','T4','T5','T6','T7','CN'].map(d => (
          <div key={d} className="text-[#94a3b8] text-[11px] font-semibold py-1">{d}</div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-0.5 flex-1">
        {days.map((day, idx) => {
          const isToday = isCurrentMonth && day === today.getDate();
          const dayEvents = day ? (events[day] || []) : [];
          const hasEvent = dayEvents.length > 0;

          return (
            <div key={idx} 
                 onClick={(e) => { 
                   if (hasEvent) {
                     e.stopPropagation();
                     setActiveTooltipDay(activeTooltipDay === day ? null : day);
                   }
                 }}
                 className={`relative flex flex-col items-center justify-center rounded-lg min-h-[36px] transition-colors group
              ${day ? 'cursor-pointer hover:bg-[#f4f6fa]' : ''}
              ${isToday ? 'bg-[#3a7bd5] hover:bg-[#2b68c2] font-bold' : ''}
            `}>
              <span className={`text-[13px] leading-none ${isToday ? 'text-white' : 'text-[#182033]'}`}>{day || ''}</span>
              {hasEvent && (
                <div className={`w-1.5 h-1.5 rounded-full mt-0.5 ${isToday ? 'bg-white' : 'bg-[#f7a928]'}`}></div>
              )}
              {/* Tooltip */}
              {hasEvent && (
                <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 ${activeTooltipDay === day ? 'flex' : 'hidden md:group-hover:flex'} flex-col items-center z-50 w-max max-w-[200px]`}>
                  <div className="bg-[#182033] text-white text-[11px] py-2 px-3 rounded-lg shadow-xl flex flex-col gap-1 text-left pointer-events-auto" style={{ fontFamily: 'inherit' }}>
                    {dayEvents.map((title, ti) => (
                      <div key={ti} className="flex items-start gap-1.5">
                        <span className="text-[#f7a928] mt-0.5 shrink-0">•</span>
                        <span className="leading-tight">{title}</span>
                      </div>
                    ))}
                  </div>
                  <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-[#182033]"></div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer: Calendar Sync Status */}
      <div className="mt-3 pt-3 border-t border-[#f1f5f9] flex items-center gap-2">
        {!userEmail ? (
          <>
            <div className="w-1.5 h-1.5 rounded-full bg-[#94a3b8] shrink-0"></div>
            <p className="text-[#94a3b8] text-[11px] leading-tight">Chưa đăng nhập để đồng bộ Lịch</p>
          </>
        ) : !accessToken ? (
          <>
            <div className="w-1.5 h-1.5 rounded-full bg-[#f7a928] shrink-0"></div>
            <p className="text-[#94a3b8] text-[11px] leading-tight">Phiên hết hạn, <span onClick={onRelogin} className="font-semibold text-[#f7a928] cursor-pointer hover:underline">nhấn vào đây để đăng nhập lại</span></p>
          </>
        ) : hasScopeError ? (
          <>
            <div className="w-1.5 h-1.5 rounded-full bg-[#f7a928] animate-pulse shrink-0"></div>
            <p className="text-[#94a3b8] text-[11px] leading-tight">
              Đồng bộ Lịch — <span className="text-[#f7a928] font-semibold">đang chờ xác minh app (yêu cầu cấp quyền)</span>
            </p>
          </>
        ) : (
          <>
            <div className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse shrink-0"></div>
            <p className="text-[#10b981] text-[11px] leading-tight font-semibold">Đã đồng bộ với Google Calendar</p>
          </>
        )}
      </div>
    </div>
  );
}

function MarketSection() {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [goldData, setGoldData] = useState<any[]>([]);
  const [chartData, setChartData] = useState<{ real: number[], forecast: number[] }>({ real: [], forecast: [] });
  const [loading, setLoading] = useState(true);

  const generateDynamicData = (currentPrice: number) => {
      const currentHour = new Date().getHours();
      
      const real = new Array(currentHour + 1).fill(0);
      real[currentHour] = currentPrice;
      for (let i = currentHour - 1; i >= 0; i--) {
        const change = real[i+1] * (Math.random() * 0.008 - 0.004); 
        real[i] = Math.round((real[i+1] + change) / 10000) * 10000;
      }
      
      const forecast = new Array(25).fill(0);
      for (let i=0; i<=currentHour; i++) {
         forecast[i] = Math.round((real[i] * (1 + (Math.random()*0.004 - 0.002)))/10000)*10000;
      }
      for(let i=currentHour+1; i<25; i++) {
         const trend = (Math.random() > 0.4 ? 1 : -1); 
         const change = forecast[i-1] * (Math.random() * 0.006 * trend);
         forecast[i] = Math.round((forecast[i-1] + change)/10000)*10000;
      }

      return { real, forecast };
    };

    useEffect(() => {
    let isMounted = true;
    const fetchMarket = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000); 
        
        // THAY URL BẰNG LINK CLOUDFLARE WORKER CỦA BẠN VÀO ĐÂY
        const WORKER_URL = 'https://gold-api.mrkun28.workers.dev'; 
        const fetchUrl = WORKER_URL 
            ? WORKER_URL 
            : 'https://api.allorigins.win/raw?url=' + encodeURIComponent('https://be.phuquy.com.vn/jewelry/product-payment-service/api/sync-price-history/get-sync-table-history?_t=' + Date.now());

        const [pqRes] = await Promise.allSettled([
          fetch(fetchUrl, { signal: controller.signal })
        ]);
        
        clearTimeout(timeoutId);
        if (!isMounted) return;

        let finalGoldData = [];
        let chartBasePrice = 14410000;

        if (pqRes.status === 'fulfilled') {
          const pqJson = await pqRes.value.json();
          if (pqJson && pqJson.data) {
            const keys = ['24K', 'NPQ', 'SJC'];
            const filtered = pqJson.data.filter((item: any) => keys.includes(item.productType));
            if (filtered.length > 0) {
              const fallback = [
                { productType: '24K', productTypeName: 'Vàng trang sức 999.9', priceIn: 13750000, priceOut: 14250000 },
                { productType: 'NPQ', productTypeName: 'Nhẫn tròn Phú Quý 999.9', priceIn: 14050000, priceOut: 14350000 },
                { productType: 'SJC', productTypeName: 'Vàng miếng SJC', priceIn: 14050000, priceOut: 14380000 }
              ];
              finalGoldData = keys.map(k => filtered.find((i:any) => i.productType === k) || fallback.find((i:any) => i.productType === k));
              const npq = finalGoldData.find((i: any) => i.productType === 'NPQ') || finalGoldData[1];
              chartBasePrice = npq.priceOut;
            }
          }
        }
        
        if (finalGoldData.length === 0) {
           finalGoldData = [
            { productTypeName: 'Vàng trang sức 999.9', priceIn: 13750000, priceOut: 14250000 },
            { productTypeName: 'Nhẫn tròn Phú Quý 999.9', priceIn: 14050000, priceOut: 14350000 },
            { productTypeName: 'Vàng miếng SJC', priceIn: 14050000, priceOut: 14380000 }
          ];
        }

        setGoldData(finalGoldData);
        setChartData(prev => prev.real.length ? prev : generateDynamicData(chartBasePrice));
        setLoading(false);
      } catch (err) {
        if (isMounted) {
          setGoldData([
            { productTypeName: 'Vàng trang sức 999.9', priceIn: 13750000, priceOut: 14250000 },
            { productTypeName: 'Nhẫn tròn Phú Quý 999.9', priceIn: 14050000, priceOut: 14350000 },
            { productTypeName: 'Vàng miếng SJC', priceIn: 14050000, priceOut: 14380000 }
          ]);
          setChartData(prev => prev.real.length ? prev : generateDynamicData(14350000));
          setLoading(false);
        }
      }
    };
    fetchMarket();
    const intervalId = setInterval(fetchMarket, 60000);
    return () => { isMounted = false; clearInterval(intervalId); };
  }, []);

  

  const displayData = goldData.length ? goldData : [
    { productTypeName: 'Vàng trang sức 999.9', priceIn: 13750000, priceOut: 14250000 },
            { productTypeName: 'Nhẫn tròn Phú Quý 999.9', priceIn: 14050000, priceOut: 14350000 },
            { productTypeName: 'Vàng miếng SJC', priceIn: 14050000, priceOut: 14380000 }
  ];

  const hasChart = chartData.real.length > 0;
  const rawReal = hasChart ? chartData.real.filter(v => v > 0) : new Array(12).fill(0);
  const rawForecast = hasChart ? chartData.forecast : new Array(25).fill(0);

  const axisMin = hasChart ? Math.min(...chartData.real, ...chartData.forecast) * 0.999 : 0;
  const axisMax = hasChart ? Math.max(...chartData.real, ...chartData.forecast) * 1.001 : 1;
  const r = axisMax - axisMin || 1;

  const ptsReal = rawReal.map((v, i) => ({ 
    x: (i / (rawForecast.length - 1)) * 300, 
    y: 60 - ((v - axisMin) / r) * 55 
  }));
  const ptsForecast = rawForecast.map((v, i) => ({ 
    x: (i / (rawForecast.length - 1)) * 300, 
    y: 60 - ((v - axisMin) / r) * 55 
  }));

  const pathReal = ptsReal.map((p, i) => i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`).join(" ");
  const pathForecast = ptsForecast.map((p, i) => i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`).join(" ");

  if (loading && goldData.length === 0) return <MarketSectionSkeleton />;

  return (
    <div className={`w-full flex flex-col gap-3 mb-6 bg-white p-[var(--card-padding)] rounded-[var(--card-radius)] shadow-[0px_4px_12px_0px_rgba(23,33,51,0.1)] border border-[#e3e7ef] transition-opacity duration-700 ease-in-out lg:h-[400px] lg:justify-between opacity-100`}>
      <div className="flex items-center justify-between w-full mb-1">
        <h2 className="font-semibold leading-[26px] text-[#182033] text-[18px]">Giá vàng Phú Quý</h2>
        <div className="bg-[#fff4e5] px-2 py-0.5 rounded-full flex items-center shrink-0">
          <div className="w-1.5 h-1.5 rounded-full bg-[#f7a928] animate-pulse mr-1"></div>
          <p className="font-bold text-[10px] text-[#f7a928]">LIVE</p>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-1.5 sm:gap-2 w-full mt-1">
        {displayData.map((item, idx) => (
          <div key={idx} className="flex flex-col border border-[#e3e7ef] rounded-[8px] sm:rounded-[12px] p-1.5 sm:p-3 bg-[#f8fafc] w-full min-w-0 overflow-hidden">
            <p className="font-bold text-[#182033] text-[11px] sm:text-[14px] line-clamp-1 sm:line-clamp-2 mb-1 sm:mb-2 leading-tight" title={item.productTypeName}>{item.productTypeName}</p>
            <div className="flex justify-between items-center w-full gap-0.5 sm:gap-1">
              <p className="text-[#5f687b] text-[10px] sm:text-[12px]">Mua</p>
              <p className="font-semibold text-[#16a34a] text-[12px] sm:text-[14px] whitespace-nowrap tracking-tighter sm:tracking-normal">{item.priceIn.toLocaleString('vi-VN')}</p>
            </div>
            <div className="flex justify-between items-center w-full mt-0.5 sm:mt-1 gap-0.5 sm:gap-1">
              <p className="text-[#5f687b] text-[10px] sm:text-[12px]">Bán</p>
              <p className="font-semibold text-[#ef4444] text-[12px] sm:text-[14px] whitespace-nowrap tracking-tighter sm:tracking-normal">{item.priceOut.toLocaleString('vi-VN')}</p>
            </div>
          </div>
        ))}
      </div>
      
            {/* Chart */}
      <div className="w-full mt-4 bg-[#f8fafc] border border-[#e3e7ef] rounded-[12px] p-2 relative flex flex-col gap-2 overflow-hidden">
        
        {/* Legend */}
        <div className="flex items-center justify-end gap-3 px-1 w-full">
          <div className="flex items-center gap-1.5">
             <div className="w-3 h-0.5 bg-[#16a34a]"></div>
             <span className="text-[9px] text-[#5f687b] font-bold uppercase tracking-wider">Thực tế</span>
          </div>
          <div className="flex items-center gap-1.5">
             <div className="w-3 h-[1px] border-t-2 border-dashed border-[#cbd5e1]"></div>
             <span className="text-[9px] text-[#5f687b] font-bold uppercase tracking-wider">Dự kiến</span>
          </div>
        </div>

        <div className="relative w-full h-[65px]">
          {/* Tooltip on hover */}
          {hoverIdx !== null && hoverIdx < rawForecast.length && (
            <div className="absolute z-50 bg-[#182033] text-white text-[10px] px-2.5 py-2 rounded-md whitespace-nowrap shadow-[0px_4px_12px_rgba(0,0,0,0.3)] pointer-events-none transform -translate-x-1/2 -translate-y-[calc(100%+6px)]"
                 style={{ left: `${(hoverIdx / (rawForecast.length - 1)) * 100}%`, top: hoverIdx < rawReal.length ? `${ptsReal[hoverIdx].y}px` : `${ptsForecast[hoverIdx].y}px` }}>
              <p className="font-bold border-b border-[#334155] pb-1 mb-1.5 text-center">{hoverIdx}:00</p>
              <div className="flex flex-col gap-1">
                {hoverIdx < rawReal.length && (
                  <div className="flex justify-between gap-4 text-[#10b981]">
                    <span>Thực tế:</span>
                    <span className="font-bold">{(rawReal[hoverIdx]/1000000).toFixed(2)} Tr</span>
                  </div>
                )}
                <div className="flex justify-between gap-4 text-[#cbd5e1]">
                  <span>Dự kiến:</span>
                  <span className="font-bold">{(rawForecast[hoverIdx]/1000000).toFixed(2)} Tr</span>
                </div>
              </div>
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[5px] border-t-[#182033]"></div>
            </div>
          )}

          <svg viewBox="0 0 300 65" className="absolute top-0 left-0 w-full h-[65px] overflow-visible preserve-3d" preserveAspectRatio="none">
             {/* Forecast line (dashed) */}
             <path d={pathForecast} fill="none" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4 4" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
             {/* Real line (solid green) */}
             <path d={pathReal} fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
          </svg>
          
          {/* Real points drawn as absolute divs to avoid ellipse distortion */}
          {rawReal.map((v, i) => (
            <div key={`real-point-${i}`} className="absolute rounded-full bg-white pointer-events-none" 
                 style={{ 
                   left: `calc(${(i / (rawForecast.length - 1)) * 100}% - 2.5px)`, 
                   top: `calc(${60 - ((v - axisMin) / r) * 55}px - 2.5px)`,
                   width: '5px', height: '5px', border: '1.5px solid #16a34a'
                 }}></div>
          ))}

          {/* Full height hover capture zones */}
          <div className="absolute inset-0 flex w-full h-full z-20">
            {rawForecast.map((_, i) => (
              <div key={`hover-${i}`} className="absolute top-0 h-full cursor-crosshair"
                   style={{ left: `calc(${(i / (rawForecast.length - 1)) * 100}% - 8px)`, width: '16px' }}
                   onMouseEnter={() => setHoverIdx(i)} onMouseLeave={() => setHoverIdx(null)}>
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-between text-[8px] sm:text-[9px] text-[#5f687b] mt-1 font-medium px-[2px]">
          <span>00:00</span>
          <span>04:00</span>
          <span>08:00</span>
          <span>12:00</span>
          <span>16:00</span>
          <span>20:00</span>
          <span>23:59</span>
        </div>
      </div>
    </div>
  );
}



function toSlug(str: string) {
  return str.toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d").replace(/Đ/g, "d")
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, '');
}


const GOOGLE_CLIENT_ID = '808045911964-1s7hoh6jv3mo3ks3d0qt0d1bhfp19htj.apps.googleusercontent.com';

export function doGoogleLogin(onSuccess: (res: any) => void, loginHint?: string) {
  const redirectUri = window.location.origin + window.location.pathname;
  const scope = 'openid email profile https://www.googleapis.com/auth/calendar.readonly';
  let authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=${encodeURIComponent(scope)}`;
  if (loginHint) {
    authUrl += `&login_hint=${encodeURIComponent(loginHint)}`;
  } else {
    authUrl += `&prompt=select_account`;
  }

  const w = 500, h = 600;
  const left = window.screenX + (window.outerWidth - w) / 2;
  const top = window.screenY + (window.outerHeight - h) / 2;
  const popup = window.open(authUrl, 'google-login', `width=${w},height=${h},left=${left},top=${top}`);

  const handleToken = async (hash: string) => {
    const params = new URLSearchParams(hash);
    const accessToken = params.get('access_token');
    if (accessToken) {
      try {
        const userInfo = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${accessToken}` },
        }).then(r => r.json());

        userInfo._access_token = accessToken;
        const authStr = JSON.stringify(userInfo);
        localStorage.setItem('user_auth', authStr);
        document.cookie = `user_auth=${encodeURIComponent(authStr)}; path=/; max-age=31536000`;
        onSuccess(userInfo);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const timer = setInterval(async () => {
    try {
      if (!popup || popup.closed) {
        clearInterval(timer);
        return;
      }
      const popupUrl = popup.location.href;
      if (popupUrl.includes('access_token=')) {
        clearInterval(timer);
        const hash = popup.location.hash.substring(1);
        popup.close();
        handleToken(hash);
      }
    } catch (_) {}
  }, 500);

  const messageListener = (event: MessageEvent) => {
    if (event.data?.type === 'GOOGLE_LOGIN_SUCCESS') {
      window.removeEventListener('message', messageListener);
      clearInterval(timer);
      if (popup) popup.close();
      handleToken(event.data.hash.substring(1));
    }
  };
  window.addEventListener('message', messageListener);
}

function CustomLoginButton({ onLoginSuccess }: { onLoginSuccess: (res: any) => void }) {
  const handleLogin = () => doGoogleLogin(onLoginSuccess);

  return (
    <div onClick={handleLogin} title="Đăng nhập Google" role="button" tabIndex={0} className="ml-2 w-[32px] h-[32px] rounded-full flex items-center justify-center hover:opacity-80 transition-all shrink-0 aspect-square cursor-pointer" style={{ backgroundColor: '#3a7bd5', color: '#ffffff' }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
    </div>
  );
}

function UserAvatarMenu({ userRole, onLogout }: { userRole: any; onLogout: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="relative ml-2 shrink-0">
      <div onClick={() => setIsOpen(!isOpen)} className="w-[32px] h-[32px] rounded-full overflow-hidden border border-[rgba(255,255,255,0.2)] cursor-pointer hover:ring-2 hover:ring-[#3a7bd5] transition-all">
        <img src={userRole.picture} alt={userRole.name || "User"} title={userRole.name || "User"} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
      </div>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-[400]" onClick={() => setIsOpen(false)}></div>
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-[#e3e7ef] py-2 z-[500] flex flex-col overflow-hidden">
            <div className="px-4 py-2 border-b border-[#e3e7ef] flex flex-col mb-1">
              <span className="text-[13px] font-semibold text-[#182033] line-clamp-1">{userRole.name}</span>
              <span className="text-[11px] text-[#5f687b] line-clamp-1">{userRole.email}</span>
            </div>
            <button onClick={() => { setIsOpen(false); onLogout(); }} className="px-4 py-2 text-left text-[13px] text-[#ef4444] hover:bg-[#fef2f2] font-medium transition-colors w-full flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
              Đăng xuất
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ── Privacy Policy Page ────────────────────────────────────────────────────
function PrivacyPolicyPage({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[300] bg-[#f4f6fa] overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-[#e3e7ef] px-6 py-4 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="p-2 -ml-2 rounded-full hover:bg-[#f4f6fa] text-[#182033] flex items-center gap-2 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
            <span className="font-semibold text-[15px]">Quay lại</span>
          </button>
        </div>
        <p className="font-bold text-[#182033] text-[15px]">Anx. — Chính sách Bảo mật</p>
        <div className="w-20" />
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-10 flex flex-col gap-8">

        {/* Hero */}
        <div className="bg-white rounded-2xl p-8 shadow-[0px_4px_12px_0px_rgba(23,33,51,0.08)] border border-[#e3e7ef]">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-[#3a7bd5] flex items-center justify-center shrink-0">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <div>
              <h1 className="font-bold text-[#182033] text-[22px]">Chính sách Bảo mật</h1>
              <p className="text-[#5f687b] text-[13px]">Privacy Policy — Anx. Weather & News</p>
            </div>
          </div>
          <p className="text-[#5f687b] text-[14px] leading-relaxed">
            Chúng tôi cam kết bảo vệ quyền riêng tư của bạn. Tài liệu này giải thích cách ứng dụng <strong>Anx.</strong> ({window.location.origin}) thu thập, sử dụng và bảo vệ thông tin của bạn.
          </p>
          <p className="text-[#94a3b8] text-[12px] mt-3">Cập nhật lần cuối: Tháng 10, 2026</p>
        </div>

        {/* Section helper */}
        {[
          {
            icon: '📋',
            title: '1. Thông tin chúng tôi thu thập',
            content: (
              <div className="flex flex-col gap-4">
                <div>
                  <p className="font-semibold text-[#182033] text-[14px] mb-1">a) Thông tin tài khoản Google (khi bạn đăng nhập)</p>
                  <ul className="list-disc list-inside text-[#5f687b] text-[14px] flex flex-col gap-1 ml-2">
                    <li>Địa chỉ email</li>
                    <li>Tên hiển thị</li>
                    <li>Ảnh đại diện (avatar)</li>
                    <li>Google User ID (định danh tài khoản)</li>
                  </ul>
                  <p className="text-[#94a3b8] text-[12px] mt-2 italic">Chúng tôi <strong>không</strong> thu thập mật khẩu Google của bạn.</p>
                </div>
                <div>
                  <p className="font-semibold text-[#182033] text-[14px] mb-1">b) Dữ liệu sử dụng tự động</p>
                  <ul className="list-disc list-inside text-[#5f687b] text-[14px] flex flex-col gap-1 ml-2">
                    <li>Vị trí địa lý (chỉ dùng để lấy dữ liệu thời tiết — yêu cầu sự cho phép của bạn)</li>
                    <li>Cài đặt giao diện (chế độ tối/sáng, danh mục tin tức)</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-[#182033] text-[14px] mb-1">c) Dữ liệu Google Calendar (sắp ra mắt)</p>
                  <ul className="list-disc list-inside text-[#5f687b] text-[14px] flex flex-col gap-1 ml-2">
                    <li>Tiêu đề sự kiện, ngày giờ bắt đầu/kết thúc từ Google Calendar của bạn</li>
                    <li>Chỉ đọc lịch chính (primary calendar), không chỉnh sửa hay xóa</li>
                    <li>Tính năng này sẽ được bật sau khi hoàn tất xét duyệt của Google</li>
                  </ul>
                </div>
              </div>
            )
          },
          {
            icon: '🎯',
            title: '2. Mục đích sử dụng thông tin',
            content: (
              <ul className="list-disc list-inside text-[#5f687b] text-[14px] flex flex-col gap-2 ml-2">
                <li>Hiển thị tên, ảnh đại diện và email của bạn trên giao diện ứng dụng</li>
                <li>Cá nhân hóa trải nghiệm người dùng (giao diện, lịch cá nhân)</li>
                <li>Duy trì phiên đăng nhập trong trình duyệt của bạn</li>
                <li>Hiển thị sự kiện Google Calendar trực quan trên widget lịch (khi được duyệt)</li>
                <li>Chúng tôi <strong>không</strong> bán, cho thuê hay chia sẻ thông tin của bạn cho bên thứ ba vì mục đích thương mại</li>
              </ul>
            )
          },
          {
            icon: '💾',
            title: '3. Lưu trữ dữ liệu',
            content: (
              <div className="flex flex-col gap-3">
                <p className="text-[#5f687b] text-[14px]">Thông tin đăng nhập của bạn được lưu <strong>cục bộ trên trình duyệt</strong> của bạn thông qua:</p>
                <ul className="list-disc list-inside text-[#5f687b] text-[14px] flex flex-col gap-1 ml-2">
                  <li><code className="bg-[#f8fafc] px-1.5 py-0.5 rounded text-[13px]">localStorage</code> — lưu thông tin profile</li>
                  <li><code className="bg-[#f8fafc] px-1.5 py-0.5 rounded text-[13px]">Cookie</code> — duy trì phiên đăng nhập</li>
                </ul>
                <p className="text-[#5f687b] text-[14px]">Dữ liệu <strong>không được gửi lên máy chủ của chúng tôi</strong>. Mọi xử lý diễn ra hoàn toàn ở phía trình duyệt của bạn (client-side only).</p>
                <p className="text-[#5f687b] text-[14px]">Bạn có thể xóa dữ liệu bất cứ lúc nào bằng cách đăng xuất hoặc xóa dữ liệu trình duyệt.</p>
              </div>
            )
          },
          {
            icon: '🔗',
            title: '4. Dịch vụ bên thứ ba',
            content: (
              <div className="flex flex-col gap-3">
                <p className="text-[#5f687b] text-[14px]">Ứng dụng kết nối với các API bên thứ ba sau:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { name: 'Google OAuth 2.0', purpose: 'Xác thực đăng nhập', link: 'https://policies.google.com/privacy' },
                    { name: 'Google Calendar API', purpose: 'Đọc sự kiện lịch (sắp ra mắt)', link: 'https://policies.google.com/privacy' },
                    { name: 'OpenWeatherMap', purpose: 'Dữ liệu thời tiết thực tế', link: 'https://openweathermap.org/privacy-policy' },
                    { name: 'BigDataCloud / Open-Meteo', purpose: 'Geocoding & dự báo thời tiết', link: 'https://www.bigdatacloud.com/privacy' },
                  ].map(s => (
                    <div key={s.name} className="bg-[#f8fafc] border border-[#e3e7ef] rounded-xl p-3">
                      <p className="font-semibold text-[#182033] text-[13px]">{s.name}</p>
                      <p className="text-[#5f687b] text-[12px]">{s.purpose}</p>
                    </div>
                  ))}
                </div>
              </div>
            )
          },
          {
            icon: '🛡️',
            title: '5. Quyền của bạn',
            content: (
              <ul className="list-disc list-inside text-[#5f687b] text-[14px] flex flex-col gap-2 ml-2">
                <li><strong>Quyền truy cập:</strong> Bạn có thể xem thông tin đang được lưu thông qua giao diện ứng dụng</li>
                <li><strong>Quyền xóa:</strong> Đăng xuất sẽ xóa toàn bộ dữ liệu cá nhân khỏi trình duyệt</li>
                <li><strong>Quyền thu hồi:</strong> Bạn có thể thu hồi quyền truy cập của ứng dụng tại <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener" className="text-[#3a7bd5] underline">myaccount.google.com/permissions</a></li>
                <li><strong>Quyền từ chối vị trí:</strong> Bạn có thể từ chối cấp quyền vị trí, ứng dụng sẽ dùng dữ liệu thời tiết mặc định</li>
              </ul>
            )
          },
          {
            icon: '📞',
            title: '6. Liên hệ',
            content: (
              <div className="flex flex-col gap-2 text-[#5f687b] text-[14px]">
                <p>Nếu bạn có bất kỳ câu hỏi nào về chính sách bảo mật này, vui lòng liên hệ:</p>
                <div className="bg-[#f8fafc] border border-[#e3e7ef] rounded-xl p-4 flex flex-col gap-1">
                  <p className="font-semibold text-[#182033]">Anx. — Nhà phát triển</p>
                  <p>Website: <a href="https://ananasux.github.io/Website_thoitiet_design" className="text-[#3a7bd5] underline">ananasux.github.io/Website_thoitiet_design</a></p>
                  <p>GitHub: <a href="https://github.com/AnanasUX" className="text-[#3a7bd5] underline" target="_blank" rel="noopener">github.com/AnanasUX</a></p>
                </div>
              </div>
            )
          },
        ].map(section => (
          <div key={section.title} className="bg-white rounded-2xl p-6 shadow-[0px_4px_12px_0px_rgba(23,33,51,0.06)] border border-[#e3e7ef]">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[20px]">{section.icon}</span>
              <h2 className="font-bold text-[#182033] text-[16px]">{section.title}</h2>
            </div>
            {section.content}
          </div>
        ))}

        {/* Footer */}
        <div className="text-center text-[#94a3b8] text-[12px] pb-4">
          <p>© 2026 Anx. — Mọi quyền được bảo lưu.</p>
          <p className="mt-1">Chính sách này có thể được cập nhật theo thời gian. Phiên bản hiện tại: <strong>1.0</strong></p>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  
  // Trạng thái quản lý quyền người dùng (Role Management)
  const [userRole, setUserRole] = useState<any>(() => {
    try {
      let saved = localStorage.getItem('user_auth');
      if (!saved) {
        // Fallback to cookie if localStorage is empty
        const match = document.cookie.match(new RegExp('(^| )user_auth=([^;]+)'));
        if (match) saved = decodeURIComponent(match[2]);
      }
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error("Lỗi khi đọc user_auth:", e);
      return null;
    }
  });

  // (Đã gỡ bỏ useGoogleOneTapLogin để tránh tình trạng popup tự động hiện lên liên tục gây khó chịu)
  // Chỉ sử dụng nút Đăng nhập thủ công ở trên Header.

  // Handle OAuth2 redirect callback (access_token in URL hash)
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.includes('access_token=')) {
      if (window.opener) {
        // We are inside the popup window. Send the token to the parent window and close.
        window.opener.postMessage({ type: 'GOOGLE_LOGIN_SUCCESS', hash: hash }, '*');
        window.close();
        return; // Dừng luôn không load gì thêm ở popup
      }

      // Nếu không phải popup (người dùng redirect thẳng), tự xử lý ở đây
      if (!userRole) {
        const params = new URLSearchParams(hash.substring(1));
        const accessToken = params.get('access_token');
        if (accessToken) {
          // Clean URL hash immediately
          window.history.replaceState(null, '', window.location.pathname + window.location.search);
          // Fetch user info
          fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${accessToken}` },
          })
            .then(r => r.json())
            .then(userInfo => {
              userInfo._access_token = accessToken;
              const authStr = JSON.stringify(userInfo);
              localStorage.setItem('user_auth', authStr);
              document.cookie = `user_auth=${encodeURIComponent(authStr)}; path=/; max-age=31536000`;
              setUserRole(userInfo);
            })
            .catch(err => console.error("Lỗi lấy thông tin Google:", err));
        }
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user_auth');
    document.cookie = "user_auth=; path=/; max-age=0";
    setUserRole(null);
  };

  const handleTokenExpired = () => {
    if (userRole) {
      const updated = { ...userRole };
      delete updated._access_token;
      setUserRole(updated);
      const authStr = JSON.stringify(updated);
      localStorage.setItem('user_auth', authStr);
      document.cookie = `user_auth=${encodeURIComponent(authStr)}; path=/; max-age=31536000`;
    }
  };

  const handleRelogin = () => {
    doGoogleLogin(setUserRole, userRole?.email);
  };

  const handleArticleSelect = (article: any) => {
    // Ghép dữ liệu chi tiết từ bot đã cào sẵn
    let cleanLink = article.link ? article.link.replace(/<\!\[CDATA\[/g, '').replace(/\]\]>/g, '').trim().split('?')[0] : '';
    const preCrawled = preCrawledRef.current.get(cleanLink);
    const enriched = preCrawled 
      ? { ...article, fullContent: preCrawled.fullContent }
      : article;
    setSelectedArticle(enriched);
    if (enriched) {
      const slug = toSlug(enriched.author);
      window.history.pushState({ articleSlug: slug }, '', `/Website_thoitiet_design/chi-tiet-${slug}`);
    }
  };

  const closeArticle = () => {
    setSelectedArticle(null);
    window.history.pushState({}, '', `/Website_thoitiet_design/`);
  };

  // Auto-fullscreen on first user interaction
  useEffect(() => {
    const handleFirstInteraction = () => {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(err => console.log("Fullscreen request failed:", err));
      }
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
    };
    
    document.addEventListener('click', handleFirstInteraction);
    document.addEventListener('touchstart', handleFirstInteraction, { passive: true });
    document.addEventListener('keydown', handleFirstInteraction);
    
    return () => {
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
    };
  }, []);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (!path.includes('/chi-tiet-')) {
        setSelectedArticle(null);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

    // Force Fullscreen on first user interaction (browser security requires a gesture)
  useEffect(() => {
    const enterFullscreen = () => {
      const elem = document.documentElement as any;
      if (!document.fullscreenElement) {
        try {
          if (elem.requestFullscreen) {
            elem.requestFullscreen().catch(() => {});
          } else if (elem.webkitRequestFullscreen) { /* Safari */
            elem.webkitRequestFullscreen();
          } else if (elem.msRequestFullscreen) { /* IE11 */
            elem.msRequestFullscreen();
          }
        } catch (e) {
          console.warn("Fullscreen request failed", e);
        }
      }
    };

    const handleInteraction = () => {
      enterFullscreen();
      // Remove listeners after first successful attempt
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
    };

    window.addEventListener('click', handleInteraction);
    window.addEventListener('touchstart', handleInteraction);

    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
    };
  }, []);

useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);


  useEffect(() => {
    const handleWheel = (e: any) => {
      if (e.ctrlKey) {
        e.preventDefault();
      }
    };
    const handleKeydown = (e: any) => {
      if (e.ctrlKey && (e.key === '=' || e.key === '-' || e.key === '+' || e.key === '0')) {
        e.preventDefault();
      }
    };
    document.addEventListener('wheel', handleWheel, { passive: false });
    document.addEventListener('keydown', handleKeydown, { passive: false });
    return () => {
      document.removeEventListener('wheel', handleWheel);
      document.removeEventListener('keydown', handleKeydown);
    };
  }, []);



  const [condKey, setCondKey] = useState<ConditionKey>("mua-nho");
  const [panelOpen, setPanelOpen] = useState(false);
  const [liveData, setLiveData] = useState<Record<ConditionKey, WeatherEntry> | undefined>(undefined);
  const [liveNews, setLiveNews] = useState<LiveNewsItem[] | undefined>(undefined);
  const preCrawledRef = useRef<Map<string, any>>(new Map());
  const [activeCategory, setActiveCategory] = useState("Tất cả");
  const [liveOverrides, setLiveOverrides] = useState<LiveOverrides | undefined>(undefined);
  const [apiStatus, setApiStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isFetchingCategory, setIsFetchingCategory] = useState(false);
    const fullNewsPool = useRef<any[]>([]);
    const [hasMoreNews, setHasMoreNews] = useState(true);
  const loadingRef = useRef(false);

    const fetchMoreNews = useCallback(async () => {
    if (loadingRef.current || !hasMoreNews) return;
    loadingRef.current = true;
    setIsLoadingMore(true);
    
    await new Promise(res => setTimeout(res, 800));
    
    try {
      const getUniqueKey = (item: any) => {
        if (item.author) return item.author.trim().toLowerCase();
        return item.link ? item.link.split('?')[0].replace(/^https?:\/\//, '') : Math.random().toString();
      };
      
      const existingKeys = new Set((liveNews || []).map(getUniqueKey));
      
      const trulyNewItems = (fullNewsPool.current || []).filter(item => !existingKeys.has(getUniqueKey(item)));
      
      if (trulyNewItems.length === 0) {
        setHasMoreNews(false);
        return;
      }
      
      const picked = trulyNewItems.slice(0, 15); // Lấy theo thứ tự đã mix sẵn
      
      if (trulyNewItems.length <= 10) {
        setHasMoreNews(false);
      }
      
      setLiveNews(prev => {
        const next = [...(prev || []), ...picked];
        return next;
      });
    } catch (err) {
      console.error(err);
    } finally {
      loadingRef.current = false;
      setIsLoadingMore(false);
    }
  }, [liveNews, hasMoreNews]);

  
  



  
  useEffect(() => {
    let isCancelled = false;
    let timer: any;
    
    const fetchCategoryNews = async (isBackground = false) => {
      if (!isBackground) setIsFetchingCategory(true);
      try {
        const catFeeds = activeCategory === "Tất cả" ? RSS_FEEDS_DB : RSS_FEEDS_DB.filter(f => f.category === activeCategory);
        if (catFeeds.length === 0) return;
        
        // Fetch up to 10 feeds from this category
        const selectedFeeds = catFeeds.sort(() => 0.5 - Math.random()).slice(0, 15);
        
        const promises = selectedFeeds.map(feed => 
          fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.url + (feed.url.includes("?") ? "&" : "?") + "rnd=" + Date.now())}`)
            .then(r => r.json())
            .then(data => (data.items || []).map((item: any) => ({ ...item, _sourceName: feed.name })))
            .catch(() => [])
        );
        
        const results = await Promise.all(promises);
        if (isCancelled) return;
        
        
        const mappedFeeds = results.map(feedArticles => {
          return feedArticles.map((item: any) => {
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
            
            if (imageUrl && (imageUrl.includes("1x1") || imageUrl.includes("pixel") || imageUrl.includes("favicon") || item.link?.includes("news.google.com"))) {
              imageUrl = ""; 
            }
            
            // QUAN TRỌNG: Loại bỏ bài viết nếu không có ảnh
            if (!imageUrl || imageUrl.trim() === "") return null;
            
            let cleanDesc = "";
            if (item.description) {
               cleanDesc = item.description.replace(/<[^>]+>/g, '').trim();
               cleanDesc = cleanDesc.replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ');
            }
            
            if (cleanDesc.includes(item.title) || item.title.includes(cleanDesc.substring(0, 30))) {
               cleanDesc = "";
            }
            
            return {
              img: imageUrl,
              logo: getNewspaperLogo(item.link || ""),
              fallbackImg: imageUrl,
              author: decodeHTMLEntities(item.title ?? "Tin tức"),
              src: item.source || item._sourceName || "Tin tức",
              body: decodeHTMLEntities(cleanDesc),
              link: item.link
            };
          }).filter(Boolean); // Remove nulls (articles without images)
        });
        
        // Remove empty feeds
        let validFeeds = mappedFeeds.filter(f => f.length > 0);
        
        // Bốc ngẫu nhiên theo tỉ lệ 1, 2, 3, 4 bài từ mỗi nguồn để tạo sự phong phú
        // Chỉ lấy bài viết trong vòng 24h qua (mới nhất trong ngày)
        const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
        
        let recentFeeds = validFeeds.map(feed => {
            return feed.filter(item => new Date(item.pubDate || 0).getTime() > oneDayAgo);
        }).filter(feed => feed.length > 0);
        
        // Nếu số lượng bài quá ít do lọc 24h, fallback về lấy tất cả
        if (recentFeeds.flat().length < 15) {
            recentFeeds = validFeeds;
        }

        // Bốc ngẫu nhiên theo tỉ lệ 1, 2, 3, 4 bài từ mỗi nguồn để tạo sự phong phú nguồn (chống hiện tượng 1 báo chiếm sóng)
        const mixedNews = [];
        while(recentFeeds.length > 0) {
           // Đảo lộn thứ tự các nguồn báo
           recentFeeds.sort(() => 0.5 - Math.random());
           for (let i = recentFeeds.length - 1; i >= 0; i--) {
               const feed = recentFeeds[i];
               // Bốc ngẫu nhiên từ 1 đến 4 bài của nguồn này
               const takeCount = Math.floor(Math.random() * 4) + 1;
               const taken = feed.splice(0, takeCount);
               mixedNews.push(...taken);
               if (feed.length === 0) {
                   recentFeeds.splice(i, 1);
               }
           }
        }
        
        if (!isBackground) {
          fullNewsPool.current = mixedNews;
          setLiveNews(mixedNews.slice(0, 15));
        } else {
          const existingLinks = new Set(fullNewsPool.current.map(n => n.link));
          const newItems = mixedNews.filter(n => !existingLinks.has(n.link));
          if (newItems.length > 0) {
            fullNewsPool.current = [...newItems, ...fullNewsPool.current];
            setLiveNews((prev: any) => {
              const current = prev || [];
              const uniqueNew = newItems.filter(n => !current.find((c: any) => c.link === n.link));
              return [...uniqueNew, ...current];
            });
          }
        }
        setHasMoreNews(fullNewsPool.current.length > 10);
      } catch (e) {
        console.error(e);
      } finally {
        if (!isBackground) setIsFetchingCategory(false);
      }
    };
    
    fetchCategoryNews(false);
    timer = setInterval(() => { fetchCategoryNews(true); }, 2 * 60 * 1000);
    return () => { isCancelled = true; clearInterval(timer); };
  }, [activeCategory]);


  const tapCount = useRef(0);
  const tapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Load live data: ?data=<base64json> (bot-embedded) hoặc ?api=<url> (fetch) ───
  useEffect(() => {
    const loadData = () => {
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

      const entry: Partial<WeatherEntry> = {
        time:           timeStr,
        location:       loc,
        locationFull:   locStr,
        temp:           `${cur.temp}°C`,
        feelsLike:      `${cur.feels_like}°C`,
        conditionLabel: (cur.desc as string) ?? WEATHER_THEMES[key].label,
        humidity:       `${cur.humidity ?? 60}%`,
        pm25:           `${pm25Val} µg/m³ ${icon}`,
        wind,
        forecastText,
        ...(cur.pressure !== undefined && { pressure: `${cur.pressure} hPa` }),
        ...(cur.visibility !== undefined && { visibility: `${Number(cur.visibility)/1000} km` }),
        ...(cur.clouds !== undefined && { clouds: `${cur.clouds}%` }),
        ...(cur.uvIndex !== undefined && { uvIndex: `${cur.uvIndex}` }),
        ...(cur.dewPoint !== undefined && { dewPoint: `${cur.dewPoint}°C` }),
        ...(cur.sunrise !== undefined && { sunrise: `${cur.sunrise}` }),
        ...(cur.sunset !== undefined && { sunset: `${cur.sunset}` }),
        ...(cur.tempMin !== undefined && { tempMin: `${cur.tempMin}°C` }),
        ...(cur.tempMax !== undefined && { tempMax: `${cur.tempMax}°C` }),
        ...(w.hourlyForecast !== undefined && { hourlyForecast: w.hourlyForecast as any }),
        ...(w.dailyForecast !== undefined && { dailyForecast: w.dailyForecast as any }),
        ...(w.weekRange !== undefined && { weekRange: w.weekRange as string })
      };

      setLiveData(prev => {
        const base = prev ? prev[key] : DEFAULT_WEATHER_DATA[key];
        const merged: WeatherEntry = { ...base, ...entry };
        const newData = { ...(prev || DEFAULT_WEATHER_DATA) };
        (Object.keys(newData) as ConditionKey[]).forEach((k) => { newData[k] = merged; });
        return newData;
      });

      const newsArr = json.news as Array<{ title?: string; source?: string; link?: string; description?: string, image?: string }>;
      if (Array.isArray(newsArr) && newsArr.length > 0) {
          const images = [imgNews1, imgNews2, imgNews3, imgNews4, imgNews5];
          const allMapped: LiveNewsItem[] = newsArr.map((item, i) => ({
            img:    item.image ? getProxyImageUrl(item.image) : images[i % images.length],
            logo: getNewspaperLogo(item.link || ""),
            fallbackImg: images[i % images.length],
            author: decodeHTMLEntities(item.title       ?? "Tin tức"),
            src:    item.source      ?? "Tin tức",
            body:   decodeHTMLEntities(item.description ?? ""),
            link:   item.link,
          }));
          
          fullNewsPool.current = allMapped;
          
          const shuffledPool = [...allMapped].sort(() => Math.random() - 0.5);
          setLiveNews(shuffledPool.slice(0, 15));
        }

      // Store dynamic overrides in React state (not mutating WEATHER_THEMES)
      setLiveOverrides({
        warningText: (json.warningText as string) || undefined,
        suggestionItems: (Array.isArray(json.suggestionItems) && json.suggestionItems.length > 0) ? (json.suggestionItems as string[]) : undefined,
        floodItems: (Array.isArray(json.floodItems) && json.floodItems.length > 0) ? (json.floodItems as string[]) : undefined,
        routeItems: (Array.isArray(json.routeItems) && json.routeItems.length > 0) ? (json.routeItems as string[]) : undefined,
        weatherNews: (Array.isArray(json.weatherNews) && json.weatherNews.length > 0) ? (json.weatherNews as any) : undefined,
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
        
        const doFetch = (lat: number, lon: number, locationNameStr: string | null = null) => {
          const apiKey = "a201c471567522a7d0b7a0567ad245fe";
          
          // Fetch from ALL feeds to get the absolute newest articles across the board
          const shuffledFeeds = [...RSS_FEEDS_DB].sort(() => 0.5 - Math.random()).slice(0, 5);
          
          const newsPromises = shuffledFeeds.map(feed => 
            fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.url + (feed.url.includes("?") ? "&" : "?") + "rnd=" + Date.now())}`)
              .then(r => r.json())
              .then(data => (data.items || []).map((item: any) => ({ ...item, _sourceName: feed.name })))
              .catch(() => [])
          );

          Promise.all([
            fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=vi`).then(r => r.json()),
            fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=vi`).then(r => r.json()),
            fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`).then(r => r.json()),
            Promise.all(newsPromises),
            fetch('https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent('https://news.google.com/rss/search?q=thời+tiết+hà+nội&hl=vi&gl=VN&ceid=VN:vi'))
              .then(r => r.json())
              .then(data => data.items || [])
              .catch(() => []),
            fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=vi`)
              .then(r => r.json())
              .catch(() => null),
            fetch(`https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${apiKey}`).then(r => r.json()).catch(() => ({ value: 0 }))
          ]).then(([weather, forecast, aqi, newsArrays, weatherNewsRaw, geoReverse, uviRes]) => {
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
          
          const nowSec = Math.floor(Date.now() / 1000);
          const points = [
            { dt: nowSec, temp: c_temp, pop: (n_item.pop || 0), icon: iconCode || "01d" },
            ...(forecast.list || []).map((item: any) => ({
              dt: item.dt, temp: item.main?.temp || 0, pop: item.pop || 0, icon: item.weather?.[0]?.icon || "01d"
            }))
          ];
          
          let startHourSec = nowSec - (nowSec % 3600);
          let interpolatedHourly: any[] = [];
          
          for (let i = 0; i < 24; i++) {
            const targetSec = startHourSec + i * 3600;
            let p0 = points[0];
            let p1 = points[1] || points[0];
            for (let j = 0; j < points.length - 1; j++) {
              if (points[j].dt <= targetSec && points[j+1].dt >= targetSec) { p0 = points[j]; p1 = points[j+1]; break; }
              else if (points[j].dt > targetSec) { p0 = points[0]; p1 = points[1] || points[0]; break; }
              else if (j === points.length - 2) { p0 = points[j]; p1 = points[j+1]; }
            }
            let fraction = 0;
            if (p1.dt > p0.dt) fraction = Math.max(0, Math.min(1, (targetSec - p0.dt) / (p1.dt - p0.dt)));
            const stepTemp = p0.temp + (p1.temp - p0.temp) * fraction;
            const stepPop = p0.pop + (p1.pop - p0.pop) * fraction;
            const icon = fraction < 0.5 ? p0.icon : p1.icon;
            interpolatedHourly.push({
              time: `${new Date(targetSec * 1000).getHours()}h`,
              icon: icon,
              temp: Math.round(stepTemp),
              pop: Math.round(stepPop * 100)
            });
          }
          
          let trang_thai = "NANG";
          if (n_pop > 50) trang_thai = "MUA";
          else if (c_temp >= 35 || feels_like >= 35) trang_thai = "NANG_GAT";
          
          // Combine all news, sort by newest (pubDate), and take top 10
          let allNews = newsArrays.flat().sort((a, b) => {
            const dateA = new Date(a.pubDate || 0).getTime();
            const dateB = new Date(b.pubDate || 0).getTime();
            return dateB - dateA;
          });
          const rawItems = allNews;
          
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
                title: decodeHTMLEntities(item.title),
                link: item.link,
                source: item.source || item._sourceName || "Báo Mới",
                time: new Date(item.pubDate || Date.now()).toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' }),
                image: imageUrl,
                description: decodeHTMLEntities(cleanDesc)
              };
          });


          const weatherNews = weatherNewsRaw.slice(0, 3).map((item: any) => {
            const titleMatch = item.title ? item.title.match(/(.+) - (.+)/) : null;
            const title = decodeHTMLEntities(titleMatch ? titleMatch[1] : item.title);
            const source = titleMatch ? titleMatch[2] : (item.source || "Google News");
            return { title, link: item.link, source };
          });

          let resolvedLocation = locationNameStr;
          if (!resolvedLocation) {
             let bestLocality = geoReverse?.locality;
             if (geoReverse?.localityInfo?.administrative) {
                 const admin6s = geoReverse.localityInfo.administrative.filter((a: any) => a.adminLevel === 6 || a.adminLevel === 7 || a.adminLevel === 8);
                 if (admin6s.length > 0) {
                     bestLocality = admin6s[0].name;
                 }
             }
             if (bestLocality) {
                 bestLocality = bestLocality.replace(/ \(phường\)/i, "").replace(/ \(xã\)/i, "");
                 resolvedLocation = `${bestLocality}, ${geoReverse.principalSubdivision || 'VN'}`;
             } else if (geoReverse?.city) {
                 resolvedLocation = `${geoReverse.city}, VN`;
             } else {
                 resolvedLocation = (weather.name || "Hà Nội") + ", VN";
             }
          }

          let dewPoint = c_temp;
          if (humidity > 0) {
            const a = 17.27, b = 237.7;
            const alpha = ((a * c_temp) / (b + c_temp)) + Math.log(humidity / 100.0);
            dewPoint = Math.round((b * alpha) / (a - alpha));
          }

          
          
          const now = new Date();
          const dayOfWeek = now.getDay() || 7; // 1 (Mon) to 7 (Sun)
          const monday = new Date(now);
          monday.setDate(now.getDate() - dayOfWeek + 1);
          monday.setHours(0, 0, 0, 0);
          
          const sunday = new Date(monday);
          sunday.setDate(monday.getDate() + 6);
          sunday.setHours(23, 59, 59, 999);

          const fmtDate = (d: Date) => `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
          const weekRange = `${fmtDate(monday)} - ${fmtDate(sunday)}`;

          const dailyMap: Record<number, any> = {};
          if (forecast && forecast.list) {
            forecast.list.forEach((item: any) => {
              const date = new Date(item.dt * 1000);
              
              // Only include days that fall within the current week (Monday to Sunday)
              // If it's next week, ignore it.
              if (date.getTime() > sunday.getTime()) return;

              const dateStr = date.getDate();
              if (!dailyMap[dateStr]) {
                dailyMap[dateStr] = {
                  date: date,
                  tempMin: item.main.temp_min,
                  tempMax: item.main.temp_max,
                  icon: item.weather[0].icon,
                  pop: Math.round((item.pop || 0) * 100)
                };
              } else {
                dailyMap[dateStr].tempMin = Math.min(dailyMap[dateStr].tempMin, item.main.temp_min);
                dailyMap[dateStr].tempMax = Math.max(dailyMap[dateStr].tempMax, item.main.temp_max);
                dailyMap[dateStr].pop = Math.max(dailyMap[dateStr].pop, Math.round((item.pop || 0) * 100));
                if (date.getHours() >= 11 && date.getHours() <= 15) {
                  dailyMap[dateStr].icon = item.weather[0].icon;
                }
              }
            });
          }
          const dailyForecastData = Object.values(dailyMap).sort((a: any, b: any) => a.date.getTime() - b.date.getTime()).map((d: any) => {
            const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
            const dayName = days[d.date.getDay()];
            return {
               day: dayName,
               icon: d.icon,
               tempMin: Math.round(d.tempMin),
               tempMax: Math.round(d.tempMax),
               pop: d.pop
            };
          });
          

          const formatTime = (ts: number) => {
            if (!ts) return "--:--";
            return new Date(ts * 1000).toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' });
          };

          const jsonPayload = {
            location: resolvedLocation,
            weather: {
              current: { 
                temp: c_temp, 
                feels_like, 
                humidity, 
                desc: c_desc, 
                icon: c_icon, 
                pm25, 
                aqi_level,
                pressure: weather.main?.pressure,
                visibility: weather.visibility,
                clouds: weather.clouds?.all,
                wind_speed: weather.wind?.speed,
                uvIndex: Math.round(uviRes?.value || 0),
                dewPoint: dewPoint,
                sunrise: formatTime(weather.sys?.sunrise),
                sunset: formatTime(weather.sys?.sunset),
                tempMin: Math.round(weather.main?.temp_min || c_temp),
                tempMax: Math.round(weather.main?.temp_max || c_temp)
              },
              forecast_3h: { temp: n_temp, pop: n_pop, desc: n_desc },
              status: trang_thai,
              hourlyForecast: interpolatedHourly,
              dailyForecast: dailyForecastData,
              weekRange: weekRange
            },
            news: baseNewsItems.length > 0 ? baseNewsItems : undefined,
            weatherNews: weatherNews.length > 0 ? weatherNews : undefined
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
      }; // end doFetch

      const fallbackToIp = () => {
        fetch("https://ipapi.co/json/")
          .then(res => res.json())
          .then(data => {
            // LƯU SESSION COOKIE IP NGƯỜI DÙNG NHƯ YÊU CẦU
            if (data.ip) {
              localStorage.setItem('user_session_ip', data.ip);
              document.cookie = `user_session_ip=${data.ip}; path=/; max-age=31536000`;
            }

            if (data.latitude && data.longitude) {
              doFetch(data.latitude, data.longitude, `${data.city || "Hanoi"}, ${data.country || "VN"}`);
            } else {
              doFetch(20.9716, 105.7725, "Hà Đông District, VN");
            }
          })
          .catch(() => {
            doFetch(20.9716, 105.7725, "Hà Đông District, VN");
          });
      };

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            doFetch(pos.coords.latitude, pos.coords.longitude);
          },
          (err) => {
            console.warn("Geolocation failed:", err);
            fallbackToIp();
          },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
        );
      } else {
        fallbackToIp();
      }
      return;
    }

    if (apiUrl) {
      // Silent load in background, keep old news visible
      
      
      const isToday = (dateStr: string) => {
        if (!dateStr) return false;
        const d = new Date(dateStr).getTime();
        const now = Date.now();
        // last 24 hours
        return (now - d) < 24 * 60 * 60 * 1000;
      };

      const feedsToFetch = activeCategory === "Tất cả" 
        ? [...RSS_FEEDS_DB].sort(() => 0.5 - Math.random()).slice(0, 15)
        : [...RSS_FEEDS_DB].filter(f => f.category === activeCategory).slice(0, 10);

      const newsPromises = feedsToFetch.map(feed => 
        fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.url + (feed.url.includes("?") ? "&" : "?") + "rnd=" + Date.now())}`)
          .then(r => r.json())
          .then(data => (data.items || []).map((item: any) => ({ ...item, _sourceName: feed.name })))
          .catch(() => [])
      );
      
      Promise.all([
        fetch(apiUrl).then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }),
        Promise.all(newsPromises)
      ]).then(([json, newsArrays]) => {
        
        // Group by feed
        const grouped: Record<string, any[]> = {};
        newsArrays.forEach((arr) => {
          if (!arr || arr.length === 0) return;
          const src = arr[0]._sourceName;
          grouped[src] = arr.filter((item: any) => isToday(item.pubDate));
        });

        // Interleave
        const interleavedNews: any[] = [];
        let hasMore = true;
        while(hasMore) {
          hasMore = false;
          for (const src of Object.keys(grouped)) {
            // Take 2-4 items randomly per feed per round
            const count = Math.floor(Math.random() * 3) + 2; 
            const chunk = grouped[src].splice(0, count);
            if (chunk.length > 0) {
              interleavedNews.push(...chunk);
              hasMore = true;
            }
          }
        }

        // Final sort chunked (to keep recent vibes but interleaved)
        // Actually interleaving is enough, we just map them now.

        let processedNews = interleavedNews.map((item: any) => {
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
             title: decodeHTMLEntities(item.title),
             link: item.link,
             source: item._sourceName,
             pubDate: item.pubDate,
             description: cleanDesc,
             image: imageUrl
           };
        });

        // FILTER OUT ALL NEWS WITHOUT IMAGES (as requested by user)
        processedNews = processedNews.filter((item: any) => item.image && item.image.trim() !== "");

        json.news = processedNews;

        
        const baseNewsItems = json.news;
        setTimeout(() => {
          baseNewsItems.forEach((item: any, idx: number) => {
            let imageUrl = item.image;
            if (!imageUrl && item.link) {
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
                    if (next[idx]) next[idx] = { ...next[idx], img: newImg };
                    return next;
                  });
                }
              });
            }
          });
        }, 1000);
        
        processJson(json as Record<string, unknown>);
      }).catch(() => setApiStatus("error"));
    }
    }; // end loadData

    loadData();
    const intervalId = setInterval(loadData, 90 * 1000); // 1.5 minutes (90s) for Real-time Gold updates
    return () => clearInterval(intervalId);
  }, []);

  // ── Pre-fetch bài viết chi tiết từ News Bot Worker ──
  useEffect(() => {
    const NEWS_BOT_URL = 'https://new-bot.mrkun28.workers.dev/api/news';
    fetch(NEWS_BOT_URL)
      .then(r => r.json())
      .then((data: any) => {
        if (data.success && data.articles) {
          data.articles.forEach((a: any) => {
            if (a.link) {
              let c = a.link.replace(/<\!\[CDATA\[/g, '').replace(/\]\]>/g, '').trim();
              c = c.split('?')[0];
              preCrawledRef.current.set(c, a);
            }
          });
          console.log(`[News Bot] Pre-crawled ${data.articles.length} articles`);
        }
      })
      .catch(err => console.warn('[News Bot] Failed:', err));
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

      <div className="md:hidden w-full">
        <MobileLayout activeCategory={activeCategory} setActiveCategory={setActiveCategory} condKey={condKey} liveData={liveData} liveNews={liveNews} isFetchingCategory={isFetchingCategory} isLoading={apiStatus === 'loading'} darkMode={darkMode} setDarkMode={setDarkMode} liveOverrides={liveOverrides} onArticleClick={handleArticleSelect} userRole={userRole} onLoginSuccess={setUserRole} onLogout={handleLogout} onTokenExpired={handleTokenExpired} onRelogin={handleRelogin} />
        
      </div>
      <div className="hidden md:block xl:hidden w-full">
        <TabletLayout activeCategory={activeCategory} setActiveCategory={setActiveCategory} condKey={condKey} liveData={liveData} liveNews={liveNews} isFetchingCategory={isFetchingCategory} isLoading={apiStatus === 'loading'} darkMode={darkMode} setDarkMode={setDarkMode} liveOverrides={liveOverrides} onArticleClick={handleArticleSelect} userRole={userRole} onLoginSuccess={setUserRole} onLogout={handleLogout} onTokenExpired={handleTokenExpired} onRelogin={handleRelogin} />
      </div>
      <div className="hidden xl:block w-full">
        <DesktopLayout activeCategory={activeCategory} setActiveCategory={setActiveCategory} condKey={condKey} liveData={liveData} liveNews={liveNews} isFetchingCategory={isFetchingCategory} isLoading={apiStatus === 'loading'} darkMode={darkMode} setDarkMode={setDarkMode} liveOverrides={liveOverrides} onArticleClick={handleArticleSelect} userRole={userRole} onLoginSuccess={setUserRole} onLogout={handleLogout} onTokenExpired={handleTokenExpired} onRelogin={handleRelogin} />
      </div>
      <InfiniteScrollTrigger onTrigger={fetchMoreNews} isLoading={isLoadingMore} hasMoreNews={hasMoreNews} />
      <ScrollToTop />

      {selectedArticle && (
        <NewsDetailView 
          article={selectedArticle} 
          allNews={liveNews} 
          onClose={closeArticle} 
          onSelectRelated={handleArticleSelect} 
        />
      )}

      {/* Site Footer */}
      <footer className="w-full border-t border-[#e3e7ef] bg-white py-4 px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-[12px] text-[#94a3b8]">
        <p>© 2026 <span className="font-semibold text-[#5f687b]">Anx.</span> — Thời tiết &amp; Tin tức</p>
        <div className="flex items-center gap-4">
          <button onClick={() => setShowPrivacyPolicy(true)} className="hover:text-[#3a7bd5] underline underline-offset-2 transition-colors">
            Chính sách Bảo mật
          </button>
          <a href="https://github.com/AnanasUX" target="_blank" rel="noopener" className="hover:text-[#3a7bd5] transition-colors">GitHub</a>
        </div>
      </footer>

      {/* Privacy Policy Overlay */}
      {showPrivacyPolicy && (
        <PrivacyPolicyPage onClose={() => setShowPrivacyPolicy(false)} />
      )}
    </div>
  );
}
