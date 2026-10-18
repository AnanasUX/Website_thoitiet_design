// ── Live API integration ──────────────────────────────────────────────────────
// Bot truyền URL API qua query param ?api=<encoded_url>
// Ví dụ: https://website.../  ?api=https%3A%2F%2Fbot-server%2Fapi%2Fdaily-news
// Nếu không có ?api thì dùng mock data (chế độ preview thiết kế)


import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { VideoShortsModal } from "./components/VideoShortsModal";
import {
  type ConditionKey,
  detectConditionKey,
  mapBotStatusToCondKey,
  pm25Icon,
  getWindDirection,
  calculateSplinePoints,
  parseCurrencyValue,
  calculateSpread,
  formatVND,
  calculatePriceChange,
  getUniqueKey,
  filterDeduplicatedNews,
  filterNewsByCategory,
  paginateNews,
  parseFlexiblePubDate,
  isArticleFresh,
  filterAndSortFreshNews,
  formatArticleDate,
  isBoilerplate,
  isAuthorAvatar,
  validateYouTubeId,
  matchesChannel,
  generateChannelPlaylist,
  shouldAutoRecoverOnPlaybackError,
  calculateControlsVisibility,
  isUserAdminQA,
  getDashboardUrl,
  getDaysInMonth,
  getFirstDayOfMonth,
  decodeHTMLEntities,
  extractArticleVideos,
  isTrustedNewsVideoDomain,
  buildSafeVideoEmbedUrl,
  extractContentForVieNeuTTS,
  extractArticleContentDetailed,
  normalizeVietnameseTextVieNeu,
  splitVieNeuAudioChunks,
  buildVieNeuAudioUrl,
  getCharacterVoiceModulation,
  formatAudioTime,
  fetchBackendTTSVoices,
  VIENEU_VOICES,
  VIENEU_SPEED_OPTIONS,
  VIENEU_CENTRAL_CONFIG,
  VieNeuTTSController,
  type VieNeuPlayerState
} from "./utils/logicFlows";

export {
  type ConditionKey,
  detectConditionKey,
  mapBotStatusToCondKey,
  pm25Icon,
  getWindDirection,
  calculateSplinePoints,
  parseCurrencyValue,
  calculateSpread,
  formatVND,
  calculatePriceChange,
  getUniqueKey,
  filterDeduplicatedNews,
  filterNewsByCategory,
  paginateNews,
  isBoilerplate,
  isAuthorAvatar,
  validateYouTubeId,
  matchesChannel,
  generateChannelPlaylist,
  shouldAutoRecoverOnPlaybackError,
  calculateControlsVisibility,
  isUserAdminQA,
  getDashboardUrl,
  getDaysInMonth,
  getFirstDayOfMonth,
  decodeHTMLEntities,
};

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

// ── Shared weather section ────────────────────────────────────────────────────

interface LiveOverrides {
  warningText?: string;
  suggestionItems?: string[];
  floodItems?: string[];
  routeItems?: string[];
  weatherNews?: { title: string, link: string, source: string, body?: string, img?: string }[];
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
            <img className="w-8 h-8 drop-shadow-sm" src={`https://openweathermap.org/img/wn/${p.icon}.png`} alt="" loading="lazy" decoding="async" />
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
  onArticleClick,
}: {
  compact?: boolean;
  condKey: ConditionKey;
  liveData?: Record<ConditionKey, WeatherEntry>;
  liveOverrides?: LiveOverrides;
  darkMode?: boolean;
  isLoading?: boolean;
  onArticleClick?: (article: any) => void;
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
                    <img src={`https://openweathermap.org/img/wn/${day.icon}.png`} className="w-9 h-9 drop-shadow-sm" loading="lazy" decoding="async" alt="" />
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
                    <div
                      onClick={() => {
                        if (onArticleClick) {
                          onArticleClick({
                            ...news,
                            title: news.title || (news as any).author || "Tin tức",
                            author: news.title || (news as any).author || "Tin tức",
                            src: news.source || (news as any).src || "Thời tiết",
                            link: news.link || (news as any).url,
                            body: news.body || `Dự báo thời tiết chi tiết từ ${news.source || 'Trung tâm Khí tượng'}.`,
                            img: news.img || (news as any).image || "https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=800&auto=format&fit=crop&q=80",
                          });
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      className="font-medium text-[#0a84ff] hover:underline line-clamp-2 cursor-pointer"
                    >
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
type LiveNewsItem = { img: string; fallbackImg?: string; logo?: string; author: string; src: string; body: string; link?: string; pubDate?: string; isVideo?: boolean; isShort?: boolean; videoSrc?: string; fullContent?: { paragraphs: string[]; images: string[]; captions: string[]; headings: string[] } | null };

// ── Default mock news articles ────────────────────────────────────────────────
const DEFAULT_NEWS_FEED: LiveNewsItem[] = [
  { img: imgNews1, author: "Dự báo thời tiết hôm nay: Mưa dông rải rác ở Bắc Bộ, nắng ấm phương Nam", src: "VnExpress · Hôm nay", body: "Trung tâm Dự báo Khí tượng Thủy văn Quốc gia cập nhật bản tin thời tiết 24 giờ tới cho các vùng trên cả nước.", pubDate: "Thu, 15 Oct 2026 12:00:00 +0700" },
  { img: imgNews2, author: "Thị trường vàng hôm nay: Giá vàng SJC duy trì vùng đỉnh, giao dịch sôi động", src: "Thanh Niên · 11:30 AM", body: "Giá vàng trong nước biến động sát nhịp thế giới, các doanh nghiệp vàng lớn điều chỉnh biên độ mua bán linh hoạt.", pubDate: "Thu, 15 Oct 2026 11:30:00 +0700" },
  { img: imgNews3, author: "Hà Nội và các tỉnh thành đẩy mạnh chuyển đổi số và phát triển kinh tế xanh", src: "Tiền Phong · 10:45 AM", body: "Nhiều mô hình đô thị thông minh và giải pháp giao thông xanh được triển khai đồng bộ mang lại hiệu quả cao.", pubDate: "Thu, 15 Oct 2026 10:45:00 +0700" },
  { img: imgNews4, author: "Thị trường công nghệ: Trí tuệ nhân tạo AI tạo đột phá trong quản lý đô thị", src: "Dân Trí · 09:50 AM", body: "Các doanh nghiệp công nghệ Việt Nam ứng dụng sâu rộng mô hình AI phục vụ dự báo thiên tai và giám sát môi trường.", pubDate: "Thu, 15 Oct 2026 09:50:00 +0700" },
  { img: imgNews5, author: "Đội tuyển Việt Nam chuẩn bị kế hoạch thi đấu vòng loại châu lục 2026", src: "Tuổi Trẻ · 09:15 AM", body: "Ban huấn luyện đội tuyển quốc gia lên phương án tập huấn thể lực và kỹ chiến thuật cho các giải đấu lớn.", pubDate: "Thu, 15 Oct 2026 09:15:00 +0700" },
];

// ── Mobile Layout ────────────────────────────────────────────────────────────


function MobileCategoryMenu({ activeCategory, setActiveCategory }: { activeCategory: string, setActiveCategory: (c: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="flex items-center gap-[6px] px-[12px] py-[6px] bg-white border border-[#e3e7ef] rounded-full text-[13px] font-semibold text-[#182033] shadow-sm active:scale-95 transition-transform cursor-pointer"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
        <span>{activeCategory}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
      </button>
      
      {isOpen && (
        <>
          <div className="fixed inset-0 z-[140]" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full right-0 mt-2 bg-white border border-[#e3e7ef] rounded-[16px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-2 z-[150] w-[280px]">
            <div className="grid grid-cols-2 gap-[6px]">
              {NEWS_CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => {
                    setActiveCategory(cat);
                    setIsOpen(false);
                  }}
                  className={`text-left px-3 py-[8px] rounded-[10px] text-[13px] transition-all cursor-pointer ${activeCategory === cat ? 'bg-[#ff315f] text-white font-bold' : 'hover:bg-[#f4f6fa] text-[#5f687b] font-medium'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}


const articleContentCache = new Map<string, any[]>();

function NewsDetailView({ article, allNews, onClose, onSelectRelated }: { article: any, allNews: any[], onClose: () => void, onSelectRelated: (item: any) => void }) {
  const [fullContent, setFullContent] = useState<string>('RICH_RENDER');
  const [isLoadingFull, setIsLoadingFull] = useState(false);
  const [contentBlocks, setContentBlocks] = useState<any[]>(article.contentBlocks || []);
  // ── Phân hệ AI VieNeu-TTS Audio Player Thống Nhất 1 Luồng Duy Nhất (REQ-047 / TC-047) ──
  const controllerRef = useRef<VieNeuTTSController | null>(null);
  const [playerState, setPlayerState] = useState<VieNeuPlayerState>({
    status: 'idle',
    currentChunkIndex: 0,
    totalChunks: 0,
    progressPercent: 0,
    selectedVoice: VIENEU_CENTRAL_CONFIG.defaultVoice,
    playbackSpeed: 1.0,
    currentTime: 0,
    duration: 0,
    isFallback: false,
    currentlySpeakingText: '',
    articleId: ''
  });
  const [backendVoicesList, setBackendVoicesList] = useState<any[]>(VIENEU_VOICES);

  // Khởi tạo VieNeuTTSController duy nhất và kết nối lắng nghe trạng thái (Single Unified Controller)
  useEffect(() => {
    const ctrl = new VieNeuTTSController((st) => {
      setPlayerState({ ...st });
    });
    controllerRef.current = ctrl;
    setPlayerState(ctrl.getState());

    return () => {
      ctrl.stop();
    };
  }, []);

  // Nạp danh sách giọng đọc từ backend VieNeu nếu có
  useEffect(() => {
    fetchBackendTTSVoices().then(voices => {
      if (voices && Array.isArray(voices) && voices.length > 0) {
        setBackendVoicesList(voices);
      }
    }).catch(() => {});
  }, []);

  // Khi chuyển bài viết (article thay đổi), dừng ngay lập tức mọi âm thanh đang phát
  useEffect(() => {
    controllerRef.current?.stop();
  }, [article.link, article.id]);

  const stopAllAudio = useCallback(() => {
    controllerRef.current?.stop();
  }, []);

  const isSpeaking = playerState.status === 'playing' || playerState.status === 'paused';
  const isSpeechPaused = playerState.status === 'paused';
  const currentChunkIdx = playerState.currentChunkIndex;
  const vieNeuProgress = playerState.progressPercent;
  const audioCurrentTime = playerState.currentTime;
  const audioDuration = playerState.duration;
  const currentlySpeakingText = playerState.currentlySpeakingText;
  const vieNeuVoice = playerState.selectedVoice;
  const vieNeuSpeed = playerState.playbackSpeed;

  const related = useMemo(() => {
    const pool = Array.isArray(allNews) && allNews.length > 0 ? allNews : DEFAULT_NEWS_FEED;
    const currentClean = (article.link || '').split('?')[0];
    const filtered = pool.filter((n: any) => {
      const l = (n.link || '').split('?')[0];
      return l !== currentClean && n.author !== article.author;
    });
    return filtered.slice(0, 6);
  }, [article, allNews]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        stopAllAudio();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => { 
      document.body.style.overflow = 'auto'; 
      window.removeEventListener('keydown', handleKeyDown);
      stopAllAudio();
    };
  }, [onClose, stopAllAudio]);

  const handleToggleAudio = () => {
    const ctrl = controllerRef.current;
    if (!ctrl) return;

    if (playerState.status === 'playing') {
      ctrl.pause();
      return;
    }
    if (playerState.status === 'paused') {
      ctrl.resume();
      return;
    }

    // NGƯỜI DÙNG BẤM "NGHE ĐỌC" LẦN ĐẦU:
    // BẢO ĐẢM ĐỌC ĐÚNG VÀ ĐỦ CÁC THÔNG TIN CHI TIẾT (TUYỆT ĐỐI KHÔNG TÍNH TIÊU ĐỀ)
    const bodyText = extractContentForVieNeuTTS(article, contentBlocks);
    const cleanToRead = bodyText || (article.body || article.description || '').replace(/<[^>]*>/g, '').trim();

    if (!cleanToRead) {
      alert('Không tìm thấy nội dung chi tiết bài viết để đọc.');
      return;
    }

    ctrl.loadArticle(article.id || article.link || 'art-current', cleanToRead, vieNeuVoice || 'bac_nu');
    ctrl.play();
  };

  const handleSeekBackward = () => {
    controllerRef.current?.seekBackward(10);
  };

  const handleSeekForward = () => {
    controllerRef.current?.seekForward(10);
  };

  const handleSeekChange = (newVal: number) => {
    const ctrl = controllerRef.current;
    if (!ctrl) return;
    const st = ctrl.getState();
    if (st.totalChunks > 0) {
      const targetIdx = Math.min(
        st.totalChunks - 1,
        Math.floor((newVal / 100) * st.totalChunks)
      );
      ctrl.seekToChunk(targetIdx);
    }
  };

  const handleVoiceChange = (vId: string) => {
    controllerRef.current?.setVoice(vId);
  };

  const handleSpeedChange = (spd: number) => {
    controllerRef.current?.setSpeed(spd);
  };

  useEffect(() => {
    if (!article.link) return;
    
    const renderContent = (fc: any) => {
      if (!fc || !fc.paragraphs || fc.paragraphs.length === 0) return null;
      let html = '';
      let imgIdx = 0;
      
      fc.headings?.forEach((h: string) => {
        html += `<h2 class="font-bold text-[#182033] text-[20px] md:text-[22px] mt-8 mb-4 font-sans">${h}</h2>`;
      });
      
      fc.paragraphs.forEach((p: string, i: number) => {
        html += `<p class="mb-4 leading-relaxed text-[#334155] text-[16px] md:text-[18px]">${p}</p>`;
        if ((i + 1) % 3 === 0 && imgIdx < (fc.images?.length || 0)) {
          const rawSrc = fc.images[imgIdx];
          if (rawSrc && !/avatar|tac-gia|tac_gia|author/i.test(rawSrc)) {
            html += `<img src="${getProxyImageUrl(rawSrc)}" class="w-full h-auto object-cover rounded-xl my-5 shadow-sm" loading="lazy" decoding="async" referrerPolicy="no-referrer" />`;
            if (fc.captions && fc.captions[imgIdx]) {
              html += `<p class="text-center text-[#5f687b] text-[14px] mt-2 mb-6 italic">${fc.captions[imgIdx]}</p>`;
            }
          }
          imgIdx++;
        }
      });
      
      while (imgIdx < (fc.images?.length || 0)) {
        const rawSrc = fc.images[imgIdx];
        if (rawSrc && !/avatar|tac-gia|tac_gia|author/i.test(rawSrc)) {
          html += `<img src="${getProxyImageUrl(rawSrc)}" class="w-full h-auto object-cover rounded-xl my-5 shadow-sm" loading="lazy" decoding="async" referrerPolicy="no-referrer" />`;
          if (fc.captions && fc.captions[imgIdx]) {
            html += `<p class="text-center text-[#5f687b] text-[14px] mt-2 mb-6 italic">${fc.captions[imgIdx]}</p>`;
          }
        }
        imgIdx++;
      }
      return html;
    };
    
    // ── Hàm cào bài viết trực tiếp qua Worker Proxy (client-side DOMParser) ──
    const parseHTMLToBlocks = (htmlStr: string, baseUrl: string) => {
      // 1. Trích xuất video toàn diện qua Article Video Engine (REQ-046 / TC-046)
      const extractedVideos: any[] = extractArticleVideos(htmlStr, baseUrl);

      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlStr, 'text/html');

      // Giữ lại các iframe video hợp lệ từ báo chí chính thống (VTV, Thanh Niên, Tuổi Trẻ, Dân Trí, Tiền Phong...) và YouTube/TikTok
      doc.querySelectorAll('iframe').forEach(ifr => {
        let src = (ifr.getAttribute('src') || ifr.getAttribute('data-src') || '').trim();
        const isVideoIframe = isTrustedNewsVideoDomain(src) || /youtube\.com\/(?:embed|shorts)|youtu\.be|tiktok\.com\/embed|facebook\.com\/plugins\/video|player\.vimeo\.com|dailymotion\.com\/embed/i.test(src);
        if (!isVideoIframe) {
          ifr.remove();
        } else {
          const safeIfrUrl = buildSafeVideoEmbedUrl(src, baseUrl);
          ifr.setAttribute('src', safeIfrUrl);
          ifr.setAttribute('data-keep-video', 'true');
        }
      });

      // Tiêu đề gốc của chính trang chi tiết
      const pageTitle = (
        doc.querySelector('h1')?.textContent ||
        doc.querySelector('meta[property="og:title"]')?.getAttribute('content') ||
        ''
      ).replace(/\s+/g, ' ').trim();

      // Trích xuất thông tin tác giả, avatar tác giả và thời gian xuất bản từ trang báo chính thống
      let authorName = '';
      let authorAvatar = '';
      let authorDate = '';

      // 1. Trích xuất thời gian xuất bản
      const timeEl = doc.querySelector('time, [data-slot="date"], .date-time, .datetime, .dt-text-13px, meta[property="article:published_time"]');
      if (timeEl) {
        const rawTime = timeEl.getAttribute('content') || timeEl.textContent?.trim() || '';
        if (rawTime && (/\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2}|-\s*\d{1,2}:\d{2}/.test(rawTime) || rawTime.length > 8)) {
          authorDate = rawTime.replace(/\s+/g, ' ').trim();
        }
      }

      // 2. Trích xuất Avatar tác giả (ưu tiên ảnh nhỏ, rounded-full, nằm trong khối author)
      const authorAvatarEl = doc.querySelector(
        'a[data-content-piece*="avatar"] img, a[rel="author"] img, [data-content-piece*="author-position_1-avatar"] img, .author-avatar img, .avatar-author img, [class*="author"] img[class*="rounded-full"], [class*="author"] img[class*="avatar"], .box-author img'
      );
      if (authorAvatarEl) {
        const rawAvatar = authorAvatarEl.getAttribute('data-src') || authorAvatarEl.getAttribute('data-original') || authorAvatarEl.getAttribute('src') || '';
        if (rawAvatar && !rawAvatar.startsWith('data:') && !rawAvatar.includes('blank.gif') && !rawAvatar.includes('1x1')) {
          authorAvatar = rawAvatar.trim();
        }
        if (!authorName) {
          authorName = authorAvatarEl.getAttribute('alt')?.trim() || '';
        }
      }

      // 3. Trích xuất Tên tác giả
      if (!authorName) {
        const authorNameEl = doc.querySelector(
          '[data-content-piece*="author-position_1-name"], a[rel="author"], a[href*="/tac-gia/"], .author-name, .author_name, .details__author, .article__author, [itemprop="author"], .box-author .name, .author'
        );
        if (authorNameEl) {
          authorName = authorNameEl.textContent?.trim() || '';
        }
      }

      // 4. Fallback từ JSON-LD schema và dataLayer
      if (!authorName || !authorAvatar || !authorDate) {
        const ldScripts = doc.querySelectorAll('script[type="application/ld+json"]');
        for (let i = 0; i < ldScripts.length; i++) {
          try {
            const raw = ldScripts[i].textContent || '';
            const clean = raw.trim().replace(/[\u0000-\u001F\u007F-\u009F]/g, c => (c === '\n' || c === '\r' ? ' ' : ''));
            if (!clean) continue;
            const parsed = JSON.parse(clean);
            const list = Array.isArray(parsed) ? parsed : [parsed];
            for (const item of list) {
              if (!authorName && item.author) {
                const a = Array.isArray(item.author) ? item.author[0] : item.author;
                authorName = typeof a === 'string' ? a : (a.name || '');
                if (!authorAvatar && a && a.image) {
                  authorAvatar = typeof a.image === 'string' ? a.image : (a.image.url || '');
                }
              }
              if (!authorDate && item.datePublished) {
                try {
                  const d = new Date(item.datePublished);
                  if (!isNaN(d.getTime())) {
                    authorDate = d.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
                  }
                } catch(e) {}
              }
            }
          } catch(e) {}
        }

        // Bổ sung quét window.dataLayer cho VietnamNet và các báo điện tử
        if (!authorName || !authorDate) {
          const dlAuthorMatch = htmlStr.match(/['"]ArticleAuthor['"]\s*:\s*['"]([^'"]+)['"]/i);
          if (dlAuthorMatch && dlAuthorMatch[1] && !authorName) {
            authorName = dlAuthorMatch[1].trim();
          }
          const dlDateMatch = htmlStr.match(/['"]ArticlePublishDate['"]\s*:\s*['"]([^'"]+)['"]/i);
          if (dlDateMatch && dlDateMatch[1] && !authorDate) {
            try {
              const d = new Date(dlDateMatch[1]);
              if (!isNaN(d.getTime())) {
                authorDate = d.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
              }
            } catch(e) {}
          }
        }
      }

      // Trích xuất Sapo (đoạn mở đầu đặc thù của báo chí) trước khi gỡ bỏ các khối phụ
      let sapoText = '';
      const sapoEl = doc.querySelector('.content-detail-sapo, .singular-sapo, .article__sapo, .sapo, .lead, h2.description, h2.sapo, .detail-sapo, .content-sapo');
      if (sapoEl) {
        sapoText = sapoEl.textContent?.trim() || '';
      }

      // Pre-cleaning selector loại bỏ rác, quảng cáo, script và các khối tác giả để KHÔNG bị parse thành ảnh hay đoạn văn trong thân bài
      doc.querySelectorAll(`
        script, style, nav, footer, header, .ads, .ad, .advertisement, .qc, .banner, .banner-ads,
        ins.adsbygoogle, .google-auto-placed, [class*="ad-"], [id*="ad-"], [class*="banner"],
        .social, .comment, iframe:not([data-keep-video="true"]), .return-thread-body-btn, 
        .readmore-body-btn, .box-author-detail, .author-info, .bread-crumb, 
        .breadcrumb, .share, .like-fb, .content-detail-top, .back-to-top,
        [data-content-name="article-author"], [data-content-piece*="author"],
        a[rel="author"], a[href*="/tac-gia/"], .author-avatar, .article-author, .dt-author,
        .box-author, .details__author, .article__author,
        [data-module="article-audio-new"], [data-module="article-audio"], time
      `).forEach(el => el.remove());

      const contentSelectors = [
        '#maincontent', '.maincontent', '#main-content', '.main-content',
        'article.fck_detail', '.fck_detail', '[data-role="content"]', '.detail-cmain',
        '#main-detail-body', '.detail-content [data-role="content"]', '#articleContent', 
        '.singular-content', '.e-magazine__body', '.the-article-body', '.knc-content', 
        '.post-content', '.entry-content', '.article-content',
        '.article__body', '.zce-content-body', '.cms-body', 
        '.content-detail', '.detail-content-body', '.content-body', '.post-detail',
        '.noidung', '.news-content', '.detail-content', 'article'
      ];

      let mainContent = null;
      for (const sel of contentSelectors) {
        const candidate = doc.querySelector(sel);
        if (candidate && ((candidate.querySelectorAll('p').length >= 2 || candidate.querySelectorAll('img').length >= 2) || (candidate.textContent?.trim().length || 0) > 100)) {
          mainContent = candidate;
          break;
        }
      }
      
      // Fallback linh động (Heuristic): Tự động tìm vùng nội dung chính dựa trên mật độ thẻ <p>
      if (!mainContent) {
        let maxScore = 0;
        doc.querySelectorAll('div, article, section, main').forEach(el => {
          const pCount = el.querySelectorAll('p').length;
          const aCount = el.querySelectorAll('a').length;
          const score = pCount - (aCount * 0.2);
          
          if (el.tagName.toLowerCase() === 'body') return;
          
          if (score > maxScore && pCount >= 3) {
            maxScore = score;
            mainContent = el;
          }
        });
      }
      
      if (!mainContent) mainContent = doc.body;

      // Hàm khử sạch inline styles làm nhảy kích thước font chữ và đảm bảo dùng font hệ thống
      const sanitizeInnerHtml = (rawHtml: string) => {
        return rawHtml
          .replace(/<\/?font[^>]*>/gi, '')
          .replace(/\s*style="[^"]*"/gi, (match) => {
            return match.replace(/(font-size|font-family|line-height|color)\s*:[^;"]+;?/gi, '');
          })
          .replace(/\s*style="\s*"/gi, '');
      };

      const norm = (s: string) => (s || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
      const isBoilerplate = (text: string) => {
        const t = (text || '').toLowerCase().trim();
        if (!t) return true;
        if (t === 'đọc tiếp về trang chủ đề' || t.includes('về trang chủ đề') || t === 'trở lại chủ đề' || t === 'đọc tiếp') return true;
        if (/^(đọc tiếp|về trang chủ đề|trở lại chủ đề|chủ đề:|từ khóa:|xem thêm|tin liên quan|bài viết liên quan|nguồn:)/i.test(t)) return true;
        if (/^theo\s+(nguồn|dân trí|tiền phong|vnexpress|thanh niên|tuổi trẻ|vtv|lao động|báo)/i.test(t)) return true;
        if (/BEGIN COMPONENT|END COMPONENT/i.test(t)) return true;
        return false;
      };

      const blocks: any[] = [];
      const processNode = (node: Node) => {
        if (!node) return;
        if (node.nodeType === Node.TEXT_NODE) {
          const text = node.textContent?.trim();
          if (text) blocks.push({ type: 'text', content: text, tag: 'p' });
          return;
        }
        if (node.nodeType !== Node.ELEMENT_NODE) return;
        const el = node as HTMLElement;
        const tag = el.tagName.toLowerCase();

        if (tag === 'script' || tag === 'style' || el.style.display === 'none') return;
        if (el.classList?.contains('link-source-wrapper') || el.classList?.contains('link-source-detail')) return;

        const getBestImgSrc = (imgEl: Element | null) => {
          if (!imgEl) return '';
          let s = imgEl.getAttribute('data-large-src') ||
                  imgEl.getAttribute('data-src') ||
                  imgEl.getAttribute('data-original') ||
                  imgEl.getAttribute('data-lazy-src') ||
                  imgEl.getAttribute('data-actualsrc') ||
                  imgEl.getAttribute('data-cdn-src') ||
                  imgEl.getAttribute('src') || '';

          if (!s || s.startsWith('data:') || s.includes('blank.gif') || s.includes('placeholder') || s.includes('1x1')) {
            const srcset = imgEl.getAttribute('data-srcset') || imgEl.getAttribute('srcset');
            if (srcset) {
              const candidate = srcset.split(',')[0]?.trim().split(' ')[0];
              if (candidate && !candidate.startsWith('data:')) s = candidate;
            }
          }

          if (s) {
            s = s.trim();
            if (s.startsWith('//')) s = 'https:' + s;
            else if (s.startsWith('/')) {
              try { s = new URL(s, baseUrl).href; } catch(e){}
            }
            s = s.replace(/https?:\/\/[a-z0-9\.]*dantri\.dev/g, 'https://icdn.dantri.com.vn');
            s = s.replace('.dev', '.com.vn');
          }
          return s;
        };

        // Nhận diện và bóc tách các khối bài viết liên quan trong thân bài
        const isRelatedBlock = el.classList?.contains('article-relate') ||
                               el.classList?.contains('box-tinlienquan') ||
                               el.classList?.contains('detail-relate') ||
                               el.classList?.contains('article-related') ||
                               el.classList?.contains('box-relate') ||
                               el.classList?.contains('relate-container') ||
                               el.classList?.contains('readmore-body-box') ||
                               el.getAttribute('type') === 'RelatedOneNews' ||
                               el.classList?.contains('story__heading') ||
                               el.classList?.contains('ck-cms-insert-neww-group') ||
                               el.classList?.contains('vnn-template-noneditable') ||
                               el.classList?.contains('insert-wiki-group') ||
                               el.classList?.contains('vnn-content-related');

        if (isRelatedBlock) {
          const anchors = el.querySelectorAll('a');
          const anchorList = anchors.length > 0 ? Array.from(anchors) : (tag === 'a' ? [el as HTMLAnchorElement] : []);
          for (const anchor of anchorList) {
            let rHref = anchor.getAttribute('href') || '';
            if (rHref && !rHref.startsWith('javascript:')) {
              if (rHref.startsWith('/')) {
                try { rHref = new URL(rHref, baseUrl).href; } catch(e){}
              }
              const rTitle = anchor.textContent?.trim() || el.textContent?.trim() || 'Bài viết liên quan';
              if (rTitle && rTitle.length > 15 && !isBoilerplate(rTitle)) {
                const rImgEl = anchor.querySelector('img') || el.querySelector('img');
                const rImg = rImgEl ? getBestImgSrc(rImgEl) : '';
                blocks.push({
                  type: 'related-link',
                  title: rTitle.replace(/^(bài viết liên quan|tin liên quan|xem thêm)\s*[:\-]\s*/i, '').trim(),
                  link: rHref,
                  img: rImg ? getProxyImageUrl(rImg) : ''
                });
              }
            }
          }
          return;
        }

        const isAuthorAvatar = (imgEl: Element | null, captionText: string, imgSrc: string) => {
          if (!imgEl) return false;
          const cleanCap = (captionText || '').trim().toLowerCase();
          const cleanAuth = (authorName || '').trim().toLowerCase();
          if (cleanAuth && cleanCap && (cleanCap === cleanAuth || cleanCap.includes(cleanAuth))) return true;
          if (imgEl.classList?.contains('dt-rounded-full') || imgEl.classList?.contains('avatar')) return true;
          if (imgEl.getAttribute('height') === '24' || imgEl.getAttribute('width') === '24') return true;
          if (imgEl.getAttribute('height') === '36' || imgEl.getAttribute('width') === '36') return true;
          if (/zoom\/(?:24|36|48)_(?:24|36|48)|avatar|author|tac-gia|tac_gia/i.test(imgSrc)) return true;
          if (imgEl.closest?.('[rel="author"], [href*="/tac-gia/"], [data-content-piece*="author"]')) return true;
          return false;
        };

        if (tag === 'figure' || tag === 'picture') {
          const img = el.querySelector('img');
          const capEl = el.querySelector('figcaption, [class*="caption"], [class*="desc"]');
          const caption = capEl?.textContent?.trim() || img?.getAttribute('alt') || '';
          if (img) {
            const src = getBestImgSrc(img);
            if (isAuthorAvatar(img, caption, src)) return;
            if (src && !src.startsWith('data:') && !src.includes('1x1') && !src.includes('blank.gif') && !src.endsWith('.svg') && !src.includes('icon')) {
              blocks.push({ type: 'image', src: getProxyImageUrl(src), caption });
              if (caption && caption.length > 20 && !isBoilerplate(caption)) {
                blocks.push({ type: 'text', content: caption, tag: 'p', isCaptionText: true });
              }
            }
          }
          return;
        }

        if (tag === 'img') {
          const src = getBestImgSrc(el);
          const caption = el.getAttribute('alt') || '';
          if (isAuthorAvatar(el, caption, src)) return;
          if (src && !src.startsWith('data:') && !src.includes('1x1') && !src.includes('blank.gif')) {
            blocks.push({ type: 'image', src: getProxyImageUrl(src), caption });
          }
          return;
        }

        if (tag === 'iframe') {
          let src = (el.getAttribute('src') || el.getAttribute('data-src') || '').trim();
          if (src) {
            const isVideoIframe = isTrustedNewsVideoDomain(src) || /youtube\.com\/(?:embed|shorts)|youtu\.be|tiktok\.com\/embed|facebook\.com\/plugins\/video|player\.vimeo\.com|dailymotion\.com\/embed/i.test(src);
            if (isVideoIframe) {
              const safeSrc = buildSafeVideoEmbedUrl(src, baseUrl);
              const isShort = /shorts|tiktok/i.test(safeSrc);
              blocks.push({ type: 'iframe', src: safeSrc, isShort });
            }
          }
          return;
        }

        if (tag === 'video') {
          let src = el.getAttribute('src');
          if (!src) {
            const source = el.querySelector('source');
            if (source) src = source.getAttribute('src');
          }
          if (src) {
             const safeSrc = buildSafeVideoEmbedUrl(src, baseUrl);
             const poster = el.getAttribute('poster') || '';
             const isShort = /shorts|tiktok|reels/i.test(safeSrc);
             blocks.push({ type: 'video', src: safeSrc, poster, isShort });
          }
          return;
        }

        // Bóc tách container video đặc thù của báo chí (Thanh Niên, Tuổi Trẻ, GenK, Kenh14, Tiền Phong, VTV...)
        const isVideoStream = el.getAttribute('type') === 'VideoStream' || el.hasAttribute('data-vid') || el.classList?.contains('cms-video') || el.classList?.contains('vne_video_player') || el.classList?.contains('media-video') || el.classList?.contains('video-content') || el.hasAttribute('data-video-src');
        if (isVideoStream) {
          const dataVid = el.getAttribute('data-vid') || el.getAttribute('data-video-src') || el.getAttribute('data-src') || '';
          const dataThumb = el.getAttribute('data-thumb') || el.getAttribute('poster') || '';
          const dataWidth = parseInt(el.getAttribute('data-width') || '0');
          const dataHeight = parseInt(el.getAttribute('data-height') || '0');
          const isShort = (dataHeight > dataWidth && dataWidth > 0) || /shorts|tiktok|reels/i.test(dataVid);

          let cleanSrc = '';
          if (dataVid && (dataVid.includes('.mp4') || dataVid.includes('mediacdn') || dataVid.includes('cdn'))) {
            cleanSrc = dataVid.trim();
            if (cleanSrc.startsWith('//')) cleanSrc = 'https:' + cleanSrc;
            else if (!cleanSrc.startsWith('http')) cleanSrc = 'https://' + cleanSrc.replace(/^\/+/, '');
          } else if (dataVid && dataVid.includes('vid=')) {
            const vidParam = dataVid.match(/[?&]vid=([^&]+)/i);
            if (vidParam) {
              let dv = decodeURIComponent(vidParam[1]);
              if (!dv.startsWith('http')) dv = 'https://' + dv.replace(/^\/+/, '');
              cleanSrc = dv;
            }
          }

          if (cleanSrc) {
            blocks.push({
              type: 'video',
              src: cleanSrc,
              poster: dataThumb,
              isShort
            });
            return;
          }
        }

        if (tag === 'p' || tag.startsWith('h') || tag === 'blockquote') {
          const imgs = el.querySelectorAll('img, video');
          if (imgs.length > 0) {
            Array.from(el.childNodes).forEach(processNode);
          } else {
            const cleanHtml = sanitizeInnerHtml(el.innerHTML.trim());
            const textContent = el.textContent?.trim();
            if (textContent && authorName && textContent.toLowerCase() === authorName.toLowerCase()) {
              return; // BỎ QUA tên tác giả bị lọt lại dưới dạng đoạn văn đơn độc
            }
            if (cleanHtml && textContent) {
              const children = Array.from(el.children);
              const isOnlyStrong = children.length === 1 && (children[0].tagName === 'STRONG' || children[0].tagName === 'B') && children[0].textContent?.trim() === textContent;
              const isHeading = tag.startsWith('h') || (tag === 'p' && isOnlyStrong && textContent.length < 120 && !textContent.endsWith('.'));
              blocks.push({ 
                type: tag === 'blockquote' ? 'quote' : (isHeading ? 'heading' : 'text'), 
                content: cleanHtml, 
                tag: isHeading ? (tag.startsWith('h') ? tag : 'h3') : tag 
              });
            }
          }
          return;
        }

        Array.from(el.childNodes).forEach(processNode);
      };

      processNode(mainContent);

      // Chèn các video bóc tách được từ JSON-LD / schema nếu chưa có trong blocks
      if (extractedVideos.length > 0) {
        extractedVideos.forEach(v => {
          if (!blocks.some(b => (b.type === 'video' || b.type === 'iframe') && b.src === v.src)) {
            const firstContentIdx = blocks.findIndex(b => b.type === 'text' || b.type === 'heading');
            if (firstContentIdx !== -1) {
              blocks.splice(firstContentIdx + 1, 0, v);
            } else {
              blocks.unshift(v);
            }
          }
        });
      }

      // Quét bổ sung toàn bộ figcaption CHỈ KHI bài viết dạng Photo Story / Phóng sự ảnh (dưới 3 đoạn văn thuần)
      const textParagraphsCount = blocks.filter(b => b.type === 'text').length;
      if (textParagraphsCount < 3) {
        const currentTextSet = new Set(blocks.filter(b => b.type === 'text').map(b => (b.content || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()));
        doc.querySelectorAll('figcaption, [class*="caption"], [class*="desc"]').forEach(fc => {
          const fcTxt = fc.textContent?.trim() || '';
          const cleanFcTxt = fcTxt.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
          if (cleanFcTxt.length > 25 && !currentTextSet.has(cleanFcTxt) && !isBoilerplate(cleanFcTxt)) {
            currentTextSet.add(cleanFcTxt);
            blocks.push({ type: 'text', content: fcTxt, tag: 'p' });
          }
        });
      }
      const cleanedBlocks = blocks.filter(b => {
        if (b.type === 'image' || b.type === 'video') return true;
        const text = norm(b.content || '');
        return !isBoilerplate(text);
      });

      const resBlocks: any[] = [];
      if (pageTitle) {
        resBlocks.push({ type: 'title', content: pageTitle });
      }
      // Luôn luôn tạo khối Tác giả (Byline Bar) chuẩn báo chính thống & Nút Nghe đọc TTS (REQ-012, REQ-047)
      resBlocks.push({
        type: 'author',
        name: authorName || (article.src || article.source || 'Ban biên tập'),
        avatar: authorAvatar ? getProxyImageUrl(authorAvatar) : (article.logo || ''),
        date: authorDate || article.pubDate || 'Vừa xong'
      });

      // Bổ sung khối Sapo mở đầu đặc thù của bài báo chính thống
      if (sapoText) {
        resBlocks.push({ type: 'sapo', content: sapoText, tag: 'p' });
      }

      const filtered = cleanedBlocks.filter(b => {
        const text = norm(b.content || '');
        if (b.type !== 'image' && b.type !== 'video' && text === pageTitle) return false;
        if (sapoText && text === sapoText) return false;
        return true;
      });
      resBlocks.push(...filtered);
      return resBlocks;
    };

    const buildFallbackBlocks = () => {
      const fallbackBlocks: any[] = [];
      const title = article.author || article.title || "Tin tức";
      fallbackBlocks.push({ type: 'title', content: title });

      fallbackBlocks.push({
        type: 'author',
        name: article.src || article.source || "Ban biên tập",
        avatar: article.logo || "",
        date: article.pubDate || "Vừa xong"
      });

      if (article.videoSrc) {
        fallbackBlocks.push({ type: 'video', src: article.videoSrc, poster: article.img, caption: title });
      } else if (article.img) {
        fallbackBlocks.push({ type: 'image', src: article.img, caption: title, isMainArticleImage: true });
      }

      // Khôi phục và bóc tách toàn diện nội dung bài viết từ description / content / body
      const rawHtml = article.content || article.description || article.desc || article.summary || article.body || "";
      if (rawHtml) {
        // Kiểm tra xem có chứa các thẻ HTML như <p>, <img>, <h3> hay không
        if (/<(p|div|img|h[2-4]|blockquote)[^>]*>/i.test(rawHtml)) {
          try {
            const parser = new DOMParser();
            const tempDoc = parser.parseFromString(rawHtml, 'text/html');
            const nodes = tempDoc.body.querySelectorAll('p, img, h2, h3, h4, blockquote');
            if (nodes.length > 0) {
              nodes.forEach(n => {
                const tn = n.tagName.toLowerCase();
                if (tn === 'img') {
                  const s = n.getAttribute('src') || n.getAttribute('data-src');
                  if (s && !s.startsWith('data:') && !s.includes('1x1')) {
                    fallbackBlocks.push({ type: 'image', src: getProxyImageUrl(s), caption: n.getAttribute('alt') || title });
                  }
                } else if (tn.startsWith('h')) {
                  const hText = n.textContent?.trim();
                  if (hText) fallbackBlocks.push({ type: 'heading', content: hText, tag: tn });
                } else if (tn === 'blockquote') {
                  const qText = n.textContent?.trim();
                  if (qText) fallbackBlocks.push({ type: 'quote', content: qText });
                } else {
                  const pText = n.textContent?.trim();
                  if (pText && pText !== title && !title.includes(pText)) {
                    fallbackBlocks.push({ type: 'text', content: pText, tag: 'p' });
                  }
                }
              });
            }
          } catch (_e) {}
        }
      }

      // Nếu chưa có đoạn văn bản nào được thêm từ HTML:
      if (!fallbackBlocks.some(b => b.type === 'text' || b.type === 'heading')) {
        let cleanText = (article.body || article.description || article.desc || article.summary || "")
          .replace(/<[^>]*>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();

        if (cleanText) {
          if (cleanText.toLowerCase().startsWith(title.toLowerCase())) {
            cleanText = cleanText.slice(title.length).replace(/^[\s:\-\–—]+/, '').trim();
          }
          const sentences = cleanText.split(/(?<=[.?!])\s+/).filter(Boolean);
          if (sentences.length > 2) {
            for (let i = 0; i < sentences.length; i += 2) {
              const para = sentences.slice(i, i + 2).join(' ');
              if (para) fallbackBlocks.push({ type: 'text', content: para, tag: 'p' });
            }
          } else {
            fallbackBlocks.push({ type: 'text', content: cleanText, tag: 'p' });
          }
        } else {
          fallbackBlocks.push({ type: 'text', content: `Bản tin được cập nhật và tổng hợp từ nguồn báo chí chính thống ${article.src || 'Thời sự 24h'}.`, tag: 'p' });
        }
      }

      fallbackBlocks.push({
        type: 'quote',
        content: `Nguồn phát hành: ${article.src || 'Báo điện tử'}. Bấm nút "Đọc bài viết gốc" bên dưới để xem toàn văn trực tiếp tại nguồn phát hành.`
      });

      return fallbackBlocks;
    };

    const scrapeViaProxy = async (articleUrl: string) => {
      const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
      const proxies = [
        ...(isLocal ? [`http://localhost:5000/api/article-detail?url=${encodeURIComponent(articleUrl)}`] : []),
        (u: string) => `https://new-bot.mrkun28.workers.dev/api/news?url=${encodeURIComponent(u)}`,
        (u: string) => `https://new-bot.mrkun28.workers.dev/?url=${encodeURIComponent(u)}`,
        (u: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
        (u: string) => `https://corsproxy.io/?${encodeURIComponent(u)}`
      ];

      for (const item of proxies) {
        try {
          const reqUrl = typeof item === 'function' ? item(articleUrl) : item;
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 7000);
          const res = await fetch(reqUrl, { signal: controller.signal });
          clearTimeout(timeoutId);
          if (!res.ok) continue;

          let html = '';
          const contentType = res.headers.get('content-type') || '';
          if (contentType.includes('application/json')) {
            const data = await res.json();
            // Nếu là response từ backend /api/article-detail
            if (data && Array.isArray(data.paragraphs) && data.paragraphs.length > 0) {
              const blocks: any[] = [];
              if (data.title) blocks.push({ type: 'title', content: data.title });
              if (data.author || data.published_at || data.published_time) {
                blocks.push({
                  type: 'author',
                  name: data.author || article.author || 'Tòa soạn',
                  date: data.published_at || data.published_time || ''
                });
              }
              if (data.summary || data.sapo) {
                blocks.push({ type: 'sapo', content: data.summary || data.sapo });
              }
              let imgIdx = 0;
              const imgs = Array.isArray(data.images) ? data.images : [];
              data.paragraphs.forEach((p: string, pIdx: number) => {
                if (p !== data.summary && p !== data.sapo && p !== data.title) {
                  blocks.push({ type: 'text', content: p, tag: 'p' });
                }
                if ((pIdx + 1) % 3 === 0 && imgIdx < imgs.length) {
                  blocks.push({ type: 'image', src: getProxyImageUrl(imgs[imgIdx].url), caption: imgs[imgIdx].caption });
                  imgIdx++;
                }
              });
              while (imgIdx < imgs.length) {
                blocks.push({ type: 'image', src: getProxyImageUrl(imgs[imgIdx].url), caption: imgs[imgIdx].caption });
                imgIdx++;
              }
              if (blocks.some((b: any) => b.type === 'text' || b.type === 'sapo')) {
                return blocks;
              }
            }
            html = data.contents || data.data || '';
          } else {
            html = await res.text();
          }

          if (html && html.length > 500) {
            let blocks = parseHTMLToBlocks(html, articleUrl);

            // Nếu là bài phóng sự ảnh hoặc bài dẫn nguồn có ít hơn 2 đoạn văn/ảnh có chú thích:
            const meaningfulCount = (blocks || []).filter((b: any) => b.type === 'text' || (b.type === 'image' && b.caption && b.caption.length > 20)).length;
            const sourceMatch = html.match(/(?:Link bài gốc|Nguồn|Theo)\s*:\s*(https?:\/\/[^\s<"']+)/i);
            if (meaningfulCount < 2 && sourceMatch && sourceMatch[1] && !sourceMatch[1].includes(articleUrl)) {
              try {
                const sourceUrl = sourceMatch[1];
                for (const getSrcProxy of proxies) {
                  try {
                    const srcReqUrl = typeof getSrcProxy === 'function' ? getSrcProxy(sourceUrl) : getSrcProxy;
                    const sRes = await fetch(srcReqUrl, { signal: AbortSignal.timeout(6000) });
                    if (!sRes.ok) continue;
                    let sHtml = '';
                    const sContentType = sRes.headers.get('content-type') || '';
                    if (sContentType.includes('application/json')) {
                      const sData = await sRes.json();
                      sHtml = sData.contents || sData.data || '';
                    } else {
                      sHtml = await sRes.text();
                    }
                    if (sHtml && sHtml.length > 500) {
                      const sourceBlocks = parseHTMLToBlocks(sHtml, sourceUrl);
                      if (sourceBlocks && sourceBlocks.filter((b: any) => b.type === 'text').length >= 3) {
                        return sourceBlocks;
                      }
                    }
                  } catch (_sErr) {}
                }
              } catch (_followErr) {}
            }

            if (blocks && blocks.some((b: any) => b.type === 'text' || b.type === 'sapo' || b.type === 'heading' || (b.type === 'image' && b.caption))) {
              return blocks;
            }
          }
        } catch (_err) {
          // Thử proxy tiếp theo
        }
      }
      return null;
    };
    
    let cleanLink = (article.link || '').replace(/<\!\[CDATA\[/g, '').replace(/\]\]>/g, '').trim();

    // 1. Kiểm tra bộ nhớ cache trong phiên (0ms tức thì)
    if (cleanLink && articleContentCache.has(cleanLink)) {
      setContentBlocks(articleContentCache.get(cleanLink)!);
      setFullContent("RICH_RENDER");
      setIsLoadingFull(false);
      return;
    }

    if (article.contentBlocks && article.contentBlocks.length > 0) {
      setContentBlocks(article.contentBlocks);
      setFullContent("RICH_RENDER");
      setIsLoadingFull(false);
      return;
    }

    if (article.fullContent && article.fullContent.paragraphs && article.fullContent.paragraphs.length > 0) {
      const html = renderContent(article.fullContent);
      if (html) { setFullContent(html); setIsLoadingFull(false); return; }
    }

    // 2. Hiển thị ngay lập tức (0ms optimistic render) với ảnh đại diện & mô tả đã có
    const initialBlocks = buildFallbackBlocks();
    setContentBlocks(initialBlocks);
    setFullContent("RICH_RENDER");

    // 3. Tải nền nội dung chi tiết & ảnh toàn văn qua proxy
    if (cleanLink && cleanLink.startsWith('http')) {
      setIsLoadingFull(true);
      scrapeViaProxy(cleanLink).then(blocks => {
        if (blocks && blocks.some((b: any) => b.type !== 'title')) {
          setContentBlocks(blocks);
          articleContentCache.set(cleanLink, blocks);
        }
        setIsLoadingFull(false);
      }).catch(() => {
        setIsLoadingFull(false);
      });
    } else {
      setIsLoadingFull(false);
    }
  }, [article.link, article.author, article.title, article.body, article.fullContent]);
  const detailContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (detailContainerRef.current) {
      detailContainerRef.current.scrollTop = 0;
    }
  }, [article.link]);

  return (
    <div ref={detailContainerRef} data-testid="news-detail-modal" className="fixed inset-0 z-[200] bg-white overflow-y-auto flex flex-col items-center">
      <div className="sticky top-0 bg-[inherit] border-b border-[#e3e7ef] px-4 py-3 flex items-center justify-between w-full md:max-w-3xl z-10">
        <button onClick={onClose} data-testid="close-article-btn" className="p-2 -ml-2 rounded-full hover:bg-[#f4f6fa] text-[#182033] flex items-center gap-2">
           <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
           <span className="font-bold text-[16px]">Quay lại</span>
        </button>
      </div>

      <div className="p-5 w-full md:max-w-3xl flex flex-col gap-4 pb-12">
        <div className="flex items-center gap-3 w-full">
            <img alt="" className="rounded-full w-8 h-8 object-cover border border-gray-100" referrerPolicy="no-referrer" src={article.logo || getNewspaperLogo(article.link || "") || article.img} loading="lazy" decoding="async" data-fallback={article.fallbackImg || ""} onError={(e) => { const el = e.currentTarget as HTMLImageElement; if (el.src !== el.dataset.fallback && el.dataset.fallback) { el.src = el.dataset.fallback; } else { el.src = "https://www.google.com/s2/favicons?domain=vnexpress.net&sz=128"; } }} />
            <p className="font-medium text-[#5f687b] text-[14px]">{article.src}</p>
         </div>

          {isLoadingFull && (
            <div className="flex items-center gap-2 py-1 px-3 bg-red-50 text-red-600 rounded-lg text-[12px] font-semibold w-fit animate-pulse mb-1">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping shrink-0" />
              <span>Đang đồng bộ toàn văn & ảnh gốc...</span>
            </div>
          )}

          {fullContent === "ERROR" ? (
            <div className="mt-6 flex flex-col items-center justify-center p-8 bg-[#f8fafc] rounded-xl border border-[#e2e8f0] text-center" style={{ backgroundColor: 'inherit' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-4"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
              <p className="text-[#475569] text-[16px] font-bold mb-2">Không thể tự động bóc tách bài viết</p>
              <p className="text-[#64748b] text-[14px]">Trang báo gốc đã cấu hình chặn hệ thống tự động. Vui lòng nhấn nút <b>"Xem bài viết gốc"</b> bên dưới để đọc nhé.</p>
            </div>
          ) : contentBlocks && contentBlocks.length > 0 ? (
            <div 
              className="mt-2 flex flex-col gap-4"
              onClick={(e) => {
                const target = (e.target as HTMLElement).closest('a');
                if (target && target.href && !target.classList.contains('original-article-btn')) {
                  e.preventDefault();
                  const href = target.href;
                  const text = target.textContent?.trim() || "Bài viết liên quan";
                  onSelectRelated({
                    author: text,
                    title: text,
                    link: href,
                    img: article.img,
                    src: article.src || 'Tin liên quan'
                  });
                }
              }}
            >
              {contentBlocks.map((block: any, idx: number) => {
                if (block.type === 'title') return <h1 key={idx} className="font-bold text-[#182033] text-[24px] md:text-[28px] leading-[1.3] font-sans">{block.content}</h1>;
                if (block.type === 'author') {
                  return (
                    <div key={idx} className="w-full">
                      <div className="flex items-center justify-between py-2.5 my-1 border-b border-gray-100 w-full text-slate-600">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {block.avatar ? (
                          <img
                            src={block.avatar}
                            alt={block.name || 'Tác giả'}
                            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-gray-200 shrink-0 aspect-square shadow-2xs"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              const el = e.currentTarget as HTMLImageElement;
                              el.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-red-50 text-red-600 border border-red-200 flex items-center justify-center font-bold text-xs shrink-0 aspect-square">
                            {(block.name || 'TG').charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="flex items-center gap-2 min-w-0 flex-wrap">
                          <span className="font-semibold text-[14px] sm:text-[15px] text-[#182033] truncate">
                            {block.name}
                          </span>
                          {block.date && (
                            <span className="text-[12px] sm:text-[13px] text-gray-400 shrink-0">
                              • {formatArticleDate(block.date)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div 
                        data-testid="article-tts-btn"
                        onClick={handleToggleAudio}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleToggleAudio();
                          }
                        }}
                        role="button"
                        tabIndex={0}
                        title={isSpeaking ? (isSpeechPaused ? "Tiếp tục đọc" : "Tạm dừng đọc") : "Nghe đọc bản tin"}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border transition-all text-[11px] font-medium shrink-0 cursor-pointer select-none ${
                          isSpeaking && !isSpeechPaused 
                            ? 'bg-red-500 text-white border-red-600 shadow-sm animate-pulse' 
                            : (isSpeechPaused ? 'bg-amber-50 text-amber-700 border-amber-300' : 'bg-slate-50 border-slate-200/80 text-slate-600 hover:bg-slate-100')
                        }`}
                      >
                        {isSpeaking && !isSpeechPaused ? (
                          <>
                            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                            <span>Đang đọc...</span>
                          </>
                        ) : isSpeechPaused ? (
                          <>
                            <svg className="w-3.5 h-3.5 text-amber-600" viewBox="0 0 24 24" fill="currentColor">
                              <polygon points="5 3 19 12 5 21 5 3"/>
                            </svg>
                            <span>Tiếp tục</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-3.5 h-3.5 text-red-600" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                            </svg>
                            <span>Nghe đọc</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* BẢNG ĐIỀU KHIỂN AI VIENEU-TTS CHUYÊN DỤNG (REQ-047 / TC-047) */}
                    <div data-testid="vieneu-tts-player-card" className="my-3 p-3.5 bg-gradient-to-r from-red-50/80 via-slate-50 to-blue-50/70 border border-red-100 rounded-2xl shadow-xs">
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-red-600 text-white flex items-center justify-center text-xs font-bold shadow-2xs">
                            AI
                          </div>
                          <div>
                            <span className="font-bold text-[13px] text-slate-800 flex items-center gap-1.5 flex-wrap">
                              VieNeu-TTS v3 Turbo
                              <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-bold">48 kHz Studio</span>
                              <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-medium">Phạm Nguyễn Ngọc Bảo</span>
                            </span>
                            <p className="text-[11px] text-slate-500 font-medium">
                              Bóc tách đọc trọn vẹn thân bài và Sapo (Tuyệt đối không đọc tiêu đề)
                            </p>
                          </div>
                        </div>

                        {/* Sóng âm thanh động khi đang phát */}
                        {isSpeaking && !isSpeechPaused && (
                          <div className="flex items-center gap-0.5 h-4 px-2 bg-red-500/10 rounded-full">
                            <span className="w-1 h-3 bg-red-500 rounded-full animate-bounce"></span>
                            <span className="w-1 h-4 bg-red-500 rounded-full animate-bounce [animation-delay:0.15s]"></span>
                            <span className="w-1 h-2.5 bg-red-500 rounded-full animate-bounce [animation-delay:0.3s]"></span>
                            <span className="w-1 h-3.5 bg-red-500 rounded-full animate-bounce [animation-delay:0.45s]"></span>
                          </div>
                        )}
                      </div>

                      {/* Thanh tiến trình phát trực quan & tua thời gian thực */}
                      <div className="w-full flex flex-col gap-1 mb-3">
                        <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 font-semibold px-0.5">
                          <span>{formatAudioTime(audioCurrentTime)}</span>
                          <span className="text-[10px] text-slate-400 font-sans font-medium">
                            {isSpeaking ? (isSpeechPaused ? 'Tạm dừng' : 'Đang phát') : (vieNeuProgress >= 100 ? 'Hoàn tất' : 'Sẵn sàng')}
                          </span>
                          <span>{audioDuration > 0 ? formatAudioTime(audioDuration) : (isSpeaking ? '...' : '00:00')}</span>
                        </div>
                        <div className="relative w-full flex items-center">
                          <input
                            type="range"
                            min={0}
                            max={audioDuration > 0 ? Math.floor(audioDuration) : 100}
                            value={audioDuration > 0 ? Math.floor(audioCurrentTime) : vieNeuProgress}
                            onChange={(e) => handleSeekChange(Number(e.target.value))}
                            className="w-full h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-red-600 focus:outline-hidden"
                            aria-label="Thanh tua tiến trình đọc bài viết"
                          />
                        </div>
                      </div>

                      {/* Hộp hiển thị nhả chữ / phụ đề đang đọc - Cố định chiều cao tuyệt đối chống giật khung */}
                      <div className="mb-2.5 px-3 py-2 bg-white/95 rounded-xl border border-red-100/90 text-[11px] sm:text-[12px] shadow-2xs h-[52px] flex items-center overflow-hidden transition-all">
                        <div className="flex items-start gap-1.5 w-full min-w-0">
                          {isSpeaking && currentlySpeakingText ? (
                            <>
                              <span className="font-bold text-red-600 inline-flex items-center gap-1 shrink-0 mt-0.5 select-none">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span>
                                Đang đọc:
                              </span>
                              <span className="italic font-medium text-slate-800 line-clamp-2 leading-relaxed transition-opacity duration-150">
                                "{currentlySpeakingText}"
                              </span>
                            </>
                          ) : (
                            <div className="flex items-center gap-1.5 text-slate-400 text-[11px] select-none">
                              <svg className="size-3.5 text-red-500/70 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                              </svg>
                              <span className="truncate">
                                {vieNeuProgress >= 100 ? 'Đã hoàn tất đọc toàn bài viết.' : 'Sẵn sàng đọc bài viết và sapo bằng giọng đọc AI tự nhiên'}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Cảnh báo lỗi kết nối máy chủ giọng đọc nếu có kèm nút Thử lại */}
                      {playerState.errorMessage && (
                        <div className="mb-2.5 p-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <svg className="size-4 text-amber-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                            <span className="truncate">{playerState.errorMessage}</span>
                          </div>
                          <button
                            onClick={() => controllerRef.current?.retry()}
                            className="px-2.5 py-1 bg-amber-600 text-white rounded font-medium text-[11px] hover:bg-amber-700 transition-colors shrink-0 cursor-pointer"
                          >
                            Thử lại
                          </button>
                        </div>
                      )}

                      {/* Hàng điều khiển Play/Pause/Seek/Tốc độ/Giọng đọc */}
                      <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={handleSeekBackward}
                            disabled={!isSpeaking}
                            title="Tua lùi 10 giây"
                            aria-label="Tua lùi 10 giây"
                            className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-white rounded-lg transition-all disabled:opacity-40 cursor-pointer"
                          >
                            <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 17l-5-5 5-5M18 17l-5-5 5-5"/></svg>
                          </button>

                          <button
                            data-testid="vieneu-play-btn"
                            onClick={handleToggleAudio}
                            aria-label={isSpeaking ? (isSpeechPaused ? "Tiếp tục đọc" : "Tạm dừng đọc") : "Phát âm thanh AI"}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all shadow-xs cursor-pointer ${
                              isSpeaking && !isSpeechPaused
                                ? 'bg-red-600 text-white hover:bg-red-700'
                                : (isSpeechPaused ? 'bg-amber-500 text-white' : 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100')
                            }`}
                          >
                            {isSpeaking && !isSpeechPaused ? (
                              <>
                                <svg className="size-3.5 fill-current" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                                <span>Tạm dừng</span>
                              </>
                            ) : isSpeechPaused ? (
                              <>
                                <svg className="size-3.5 fill-current" viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                                <span>Tiếp tục</span>
                              </>
                            ) : (
                              <>
                                <svg className="size-3.5 fill-current" viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                                <span>Phát AI</span>
                              </>
                            )}
                          </button>

                          <button
                            onClick={handleSeekForward}
                            disabled={!isSpeaking}
                            title="Tua tới 10 giây"
                            aria-label="Tua tới 10 giây"
                            className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-white rounded-lg transition-all disabled:opacity-40 cursor-pointer"
                          >
                            <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 17l5-5-5-5M6 17l5-5-5-5"/></svg>
                          </button>

                          {isSpeaking && (
                            <button
                              onClick={stopAllAudio}
                              title="Dừng đọc"
                              aria-label="Dừng đọc"
                              className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-white rounded-lg transition-all cursor-pointer"
                            >
                              <svg className="size-4 fill-current" viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12"/></svg>
                            </button>
                          )}
                        </div>

                        {/* Chọn giọng đọc 3 miền & tốc độ */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <select
                            value={vieNeuVoice}
                            onChange={(e) => handleVoiceChange(e.target.value)}
                            aria-label="Chọn giọng đọc AI 3 miền"
                            className="bg-white border border-slate-200 text-slate-700 py-1 px-2 rounded-lg text-[11px] font-medium outline-hidden max-w-[170px] truncate"
                          >
                            <optgroup label="Miền Bắc (Hà Nội)">
                              {backendVoicesList.filter(v => v.region === 'north').map(v => (
                                <option key={v.id} value={v.id}>{v.name}</option>
                              ))}
                            </optgroup>
                            <optgroup label="Miền Trung (Huế / Đà Nẵng)">
                              {backendVoicesList.filter(v => v.region === 'central').map(v => (
                                <option key={v.id} value={v.id}>{v.name}</option>
                              ))}
                            </optgroup>
                            <optgroup label="Miền Nam (Sài Gòn)">
                              {backendVoicesList.filter(v => v.region === 'south').map(v => (
                                <option key={v.id} value={v.id}>{v.name}</option>
                              ))}
                            </optgroup>
                          </select>

                          <button
                            type="button"
                            onClick={() => controllerRef.current?.previewVoice(vieNeuVoice)}
                            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 font-bold text-[11px] border border-red-200 transition-all cursor-pointer shrink-0 active:scale-95 shadow-2xs"
                            title="Nghe thử mẫu phát âm của giọng đọc AI đang chọn"
                          >
                            <svg className="size-3 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <path d="M3 18v-6a9 9 0 0 1 18 0v6"/>
                              <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>
                            </svg>
                            <span>Nghe thử mẫu</span>
                          </button>

                          <select
                            value={vieNeuSpeed}
                            onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
                            aria-label="Điều chỉnh tốc độ phát"
                            className="bg-white border border-slate-200 text-slate-700 py-1 px-1.5 rounded-lg text-[11px] font-medium outline-hidden"
                          >
                            <option value="0.75">0.75x</option>
                            <option value="1.0">1.0x (Chuẩn)</option>
                            <option value="1.25">1.25x</option>
                            <option value="1.5">1.5x</option>
                            <option value="2.0">2.0x</option>
                          </select>
                        </div>
                      </div>

                      {/* Trạng thái công nghệ giọng đọc VieNeu-TTS */}
                      <div className="mt-2.5 pt-2 border-t border-red-100/60 flex items-center justify-between text-[10px] text-slate-500 flex-wrap gap-1">
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          <span>Động cơ: <strong className="text-slate-700">VieNeu-TTS Neural Audio</strong></span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-slate-600 font-semibold bg-white px-2 py-0.5 rounded border border-slate-200/60 shadow-2xs">
                            {(() => {
                              const currentVoiceObj = backendVoicesList.find(v => v.id === vieNeuVoice);
                              const regionName = currentVoiceObj?.region === 'north' ? 'Miền Bắc' : (currentVoiceObj?.region === 'central' ? 'Miền Trung' : 'Miền Nam');
                              const genderName = currentVoiceObj?.gender === 'male' ? 'Nam' : 'Nữ';
                              const charName = currentVoiceObj?.character === 'news' ? 'Báo chí' : (currentVoiceObj?.character === 'storytelling' ? 'Kể chuyện' : 'Tự nhiên');
                              return `🎙️ ${regionName} • ${genderName} • ${charName}`;
                            })()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }
                if (block.type === 'sapo') {
                  return (
                    <div key={idx} className="my-2.5 p-4 bg-slate-50 border-l-4 border-red-600 rounded-r-xl font-bold text-[17px] md:text-[18px] text-[#1e293b] leading-relaxed italic shadow-2xs">
                      {block.content}
                    </div>
                  );
                }
                if (block.type === 'text') return <p key={idx} dangerouslySetInnerHTML={{ __html: block.content }} className="text-[17px] leading-relaxed font-sans" />;
                if (block.type === 'heading') {
                  if (block.tag === 'h2') {
                    return <h2 key={idx} dangerouslySetInnerHTML={{ __html: block.content }} className="font-sans text-[20px] md:text-[22px] font-bold text-[#182033] mt-5 mb-2.5 leading-snug" />;
                  }
                  if (block.tag === 'h3') {
                    return <h3 key={idx} dangerouslySetInnerHTML={{ __html: block.content }} className="font-sans text-[18px] md:text-[19px] font-bold text-[#182033] mt-4 mb-2 leading-snug" />;
                  }
                  return <h4 key={idx} dangerouslySetInnerHTML={{ __html: block.content }} className="font-sans text-[16px] md:text-[17px] font-semibold text-[#182033] mt-3.5 mb-1.5 leading-snug" />;
                }
                if (block.type === 'quote') return <blockquote key={idx} dangerouslySetInnerHTML={{ __html: block.content }} className="pl-4 border-l-4 border-[#0055D4] italic my-4" />;
                if (block.type === 'related-link') {
                  return (
                    <div
                      key={idx}
                      onClick={() => onSelectRelated({
                        author: block.title,
                        title: block.title,
                        link: block.link,
                        img: block.img || article.img,
                        src: article.src || 'Tin liên quan'
                      })}
                      className="my-4 p-3.5 bg-red-50/70 border border-red-200/60 border-l-4 border-l-red-600 rounded-r-xl flex items-center gap-3 cursor-pointer hover:bg-red-100/70 transition-all shadow-xs group"
                    >
                      {block.img && !/avatar|tac-gia|tac_gia/i.test(block.img) && (
                        <div className="w-16 h-12 rounded-lg overflow-hidden shrink-0 bg-slate-200 border border-slate-200">
                          <img src={block.img} alt="" className="w-16 h-12 object-cover group-hover:scale-105 transition-transform" referrerPolicy="no-referrer" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <span className="text-[10.5px] uppercase font-bold text-red-600 block mb-0.5 tracking-wider">Bài viết liên quan</span>
                        <p className="text-[14px] font-semibold text-[#182033] line-clamp-2 group-hover:text-red-600 transition-colors">{block.title}</p>
                      </div>
                      <svg className="size-4 text-slate-400 group-hover:text-red-500 shrink-0 ml-1 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"/></svg>
                    </div>
                  );
                }
                if (block.type === 'image') {
                  // Khử triệt để trường hợp avatar tác giả bị lọt vào làm ảnh bài viết (nhưng luôn bảo tồn ảnh đại diện bài viết)
                  if (
                    !block.isMainArticleImage && (
                      block.isAvatar || 
                      (block.src && /avatar|tac-gia/i.test(block.src)) ||
                      (block.caption && contentBlocks.some((b: any) => b.type === 'author' && b.name && b.name.toLowerCase() === block.caption.toLowerCase())) ||
                      isAuthorAvatar({ src: block.src, className: '' }, block.caption, block.src, article.author)
                    )
                  ) {
                    return null;
                  }
                  return (
                    <figure key={idx} className="my-5 w-full">
                      <div className="relative w-full rounded-xl overflow-hidden bg-slate-100 shadow-xs flex items-center justify-center min-h-[160px]">
                        <img
                          src={block.src}
                          alt={block.caption || ''}
                          className="w-full h-auto object-cover rounded-xl transition-all duration-300"
                          loading={idx <= 1 ? "eager" : "lazy"}
                          fetchPriority={idx <= 1 ? "high" : "auto"}
                          decoding="async"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            const el = e.currentTarget as HTMLImageElement;
                            if (!el.src.includes('unsplash.com')) {
                              el.src = "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=450&auto=format&fit=crop&q=70";
                            }
                          }}
                        />
                      </div>
                      {block.caption && <figcaption className="text-center text-[13px] md:text-[14px] mt-2 italic text-[#5f687b]" dangerouslySetInnerHTML={{__html: block.caption}}></figcaption>}
                    </figure>
                  );
                }
                if (block.type === 'video') {
                  if (block.isShort) {
                    return (
                      <div key={idx} className="my-6 flex flex-col items-center justify-center w-full">
                        <div className="relative w-full max-w-[340px] aspect-[9/16] bg-black rounded-2xl overflow-hidden shadow-2xl border border-gray-800">
                          <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600/95 text-white text-[12px] font-bold backdrop-blur-md shadow-lg pointer-events-none">
                            <svg className="size-3.5 fill-current" viewBox="0 0 24 24"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM10 17l-3.5-3.5 1.41-1.41L10 14.17l5.59-5.59L17 10l-7 7z"/></svg>
                            <span>Video Short</span>
                          </div>
                          <video
                            controls
                            playsInline
                            preload="metadata"
                            referrerPolicy="no-referrer"
                            poster={block.poster}
                            src={block.src}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        {block.caption && <p className="text-center text-[13px] text-gray-500 mt-2 italic max-w-[340px]">{block.caption}</p>}
                      </div>
                    );
                  }
                  return (
                    <figure key={idx} className="my-6 w-full">
                      <div className="w-full relative aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
                        <div className="absolute top-3 left-3 z-10 flex items-center gap-2 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full text-white text-[11px] font-bold border border-white/10 pointer-events-none">
                          <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
                          <span>BẢN TIN TRUYỀN HÌNH</span>
                        </div>
                        <video controls playsInline preload="metadata" referrerPolicy="no-referrer" poster={block.poster} src={block.src} className="w-full h-full object-contain" />
                      </div>
                      <div className="mt-2 flex items-center justify-between text-[12px] text-gray-500">
                        {block.caption ? <figcaption className="italic text-gray-600">{block.caption}</figcaption> : <span></span>}
                        {block.src && (
                          <a
                            href={block.src}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-red-600 hover:text-red-700 font-medium hover:underline shrink-0"
                          >
                            <span>Mở video gốc</span>
                            <svg className="size-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/></svg>
                          </a>
                        )}
                      </div>
                    </figure>
                  );
                }
                if (block.type === 'iframe') {
                  let finalSrc = block.src;
                  if (/youtube\.com|youtu\.be/i.test(finalSrc)) {
                    const ytMatch = finalSrc.match(/(?:embed\/|shorts\/|v=|\/v\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
                    if (ytMatch && ytMatch[1]) {
                      finalSrc = `https://www.youtube.com/embed/${ytMatch[1]}?rel=0&modestbranding=1&iv_load_policy=3&fs=0&controls=1&playsinline=1`;
                    }
                  }
                  if (block.isShort) {
                    return (
                      <div key={idx} className="my-6 flex flex-col items-center justify-center w-full">
                        <div className="relative w-full max-w-[340px] aspect-[9/16] bg-black rounded-2xl overflow-hidden shadow-2xl border border-gray-800">
                          <iframe
                            src={finalSrc}
                            referrerPolicy="strict-origin-when-cross-origin"
                            className="w-full h-full border-0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          />
                        </div>
                      </div>
                    );
                  }
                  return (
                    <div key={idx} className="my-6 w-full relative aspect-video rounded-2xl overflow-hidden shadow-2xl bg-black border border-slate-800">
                      <div className="absolute top-3 left-3 z-10 flex items-center gap-2 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full text-white text-[11px] font-bold border border-white/10 pointer-events-none">
                        <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
                        <span>BẢN TIN TRUYỀN HÌNH</span>
                      </div>
                      <iframe
                        src={finalSrc}
                        referrerPolicy="strict-origin-when-cross-origin"
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      />
                    </div>
                  );
                }
               return null;
             })}
           </div>
        ) : (
           <div className="mt-6 text-[17px] leading-relaxed font-sans detail-html-content" dangerouslySetInnerHTML={{ __html: fullContent }} />
        )}



        {/* Nút xem bài viết gốc */}
        <a href={article.link?.replace(/<\!\[CDATA\[/g, '').replace(/\]\]>/g, '').trim()} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 mt-6 py-3 px-6 rounded-xl bg-[#182033] text-white font-bold text-[15px] hover:bg-[#2a3550] transition-colors w-full">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
          Xem bài viết gốc
        </a>

        {/* Related articles */}
        <div className="mt-10 border-t border-[#e3e7ef] pt-8">
           <div className="flex items-center justify-between mb-5">
             <h2 className="font-bold text-[#182033] text-[20px] flex items-center gap-2">
               <span className="w-1.5 h-6 bg-[#ff315f] rounded-full inline-block"></span>
               Bài viết liên quan
             </h2>
             <span className="text-[13px] text-[#5f687b] font-medium">{related.length} bài gợi ý</span>
           </div>
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             {related.map((item: any, i: number) => (
                <div key={i} className="flex gap-3 p-3 rounded-xl border border-[#e3e7ef]/80 hover:border-[#ff315f]/40 hover:shadow-sm bg-white cursor-pointer group transition-all" onClick={() => {
                   if (detailContainerRef.current) detailContainerRef.current.scrollTo({top:0, behavior:'smooth'});
                   window.scrollTo({top:0, behavior:'smooth'});
                   onSelectRelated(item);
                 }}>
                   <div className="w-[96px] h-[72px] shrink-0 rounded-lg overflow-hidden relative bg-[#f1f4f9]">
                      <img alt="" className="absolute inset-0 max-w-none object-cover group-hover:scale-105 transition-transform duration-300" referrerPolicy="no-referrer" src={item.img && !/avatar|tac-gia|tac_gia/i.test(item.img) ? item.img : (item.fallbackImg || "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&auto=format&fit=crop&q=70")} loading="lazy" decoding="async" data-fallback={item.fallbackImg || ""} onError={(e) => { const el = e.currentTarget as HTMLImageElement; if (el.src !== el.dataset.fallback && el.dataset.fallback) { el.src = el.dataset.fallback; } else if (!el.src.includes('unsplash.com')) { el.src = "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&auto=format&fit=crop&q=70"; } }} />
                   </div>
                   <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <p className="font-bold text-[#182033] text-[13px] sm:text-[14px] line-clamp-2 group-hover:text-[#ff315f] transition-colors leading-snug">{item.author || item.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#eef2f6] text-[#5f687b] truncate max-w-[120px]">{item.src || "Tin tức"}</span>
                        {item.pubDate && <span className="text-[11px] text-[#8e98a8]">{formatArticleDate(item.pubDate)}</span>}
                      </div>
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
  onRelogin,
  onOpenShorts
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
    onOpenShorts?: () => void;
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
          <div onClick={() => setDarkMode(!darkMode)} role="button" tabIndex={0} data-testid="dark-mode-toggle" className="ml-2 w-[32px] h-[32px] rounded-full bg-[#f4f6fa] flex items-center justify-center text-[#182033] hover:bg-[#e3e7ef] transition-colors shrink-0 aspect-square cursor-pointer" title={darkMode ? "Chuyển sang giao diện Sáng" : "Chuyển sang giao diện Tối"}>
              {darkMode ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
              )}
          </div>

          <QADashboardHeaderButton userRole={userRole} />

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
          <WeatherSection isLoading={isLoading} condKey={condKey} liveData={liveData} liveOverrides={liveOverrides} darkMode={darkMode} onArticleClick={onArticleClick} />
        </div>

        <div className="flex flex-col gap-[var(--grid-gap)] items-start w-full">
          <MarketSection />
          {userRole && userRole.email ? (
            <div className="w-full">
            <CalendarSection userEmail={userRole.email} accessToken={userRole._access_token} onTokenExpired={onTokenExpired} onRelogin={onRelogin} />
            </div>
          ) : (
            <div className="w-full bg-[#f8fafc] p-6 rounded-[var(--card-radius)] border border-dashed border-[#cbd5e1] flex flex-col items-center justify-center text-center gap-3">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              <p className="text-[#64748b] text-[14px] max-w-[200px]">Đăng nhập Google để xem Lịch cá nhân</p>
            </div>
          )}

          {/* ── Banner Video Shorts (Thay thế Bản tin TV cũ) ── */}
          <div
            onClick={onOpenShorts}
            className="w-full bg-[#182033] text-white rounded-2xl p-3 px-3.5 flex items-center justify-between cursor-pointer shadow-sm hover:shadow-md transition-all active:scale-[0.99] border border-[#e3e7ef]/10"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-[#ff315f] flex items-center justify-center text-white shrink-0 shadow-xs">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[9.5px] font-black px-1.5 py-0.2 rounded bg-[#ff315f]/25 text-[#ff315f] border border-[#ff315f]/30 uppercase tracking-wider">SHORTS</span>
                  <span className="font-bold text-[13px] text-white truncate">Video Shorts 24H</span>
                </div>
                <span className="text-[11px] text-slate-300 truncate">Tin tức video ngắn định dạng 9:16 chuẩn nét</span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-[#ff315f] bg-white/10 px-2.5 py-1 rounded-full shrink-0">
              <span>Xem ngay</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
            </div>
          </div>

          {/* ── Category Bar Mobile: Sticky Category Row (Chỉ hiển thị nút lọc dạng dropdown trên Mobile) ── */}
          <div className="flex items-center justify-between w-full sticky top-[calc(var(--header-height)-1px)] bg-[#f4f6fa] z-[90] py-2 mt-[-4px]">
            <p className="font-bold text-[#182033] text-[17px]">Tin Tức Mới Nhất</p>
            <MobileCategoryMenu activeCategory={activeCategory || "Tất cả"} setActiveCategory={setActiveCategory || (() => {})} />
          </div>

          {(isFetchingCategory || isLoading) ? <NewsSkeleton /> : (<>
          {newsFeed.map((item, i) => (
              <div key={i} onClick={() => onArticleClick && onArticleClick(item)}  className="bg-white flex flex-col gap-[14px] items-start overflow-hidden p-[var(--card-padding)] rounded-[var(--card-radius)] shadow-[0px_4px_12px_0px_rgba(23,33,51,0.1)] hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(23,33,51,0.2)] transition-all duration-300 w-full no-underline group cursor-pointer"
            >
              <div className="flex flex-col gap-2 items-start w-full">
                  <div className="flex gap-[10px] items-center w-full">
                    <img alt="" className="rounded-full shrink-0 size-6 object-cover border border-gray-100" referrerPolicy="no-referrer" src={item.logo || item.img} loading="lazy" decoding="async" data-fallback={item.fallbackImg || ""} onError={(e) => { const el = e.currentTarget as HTMLImageElement; if (el.src !== el.dataset.fallback && el.dataset.fallback) { el.src = el.dataset.fallback; } else { el.src = "https://www.google.com/s2/favicons?domain=vnexpress.net&sz=128"; } }} />
                    <p className="font-normal text-[#5f687b] text-[12px]">{item.src}</p>
                  </div>
                  <p className="font-semibold text-[#182033] text-[length:var(--font-h4)] line-clamp-3 w-full leading-snug">{item.author}</p>
                </div>
              <p className="font-normal text-[#182033] text-[length:var(--font-body)] mt-2">{item.body}</p>
              <div className="h-[180px] relative rounded-[10px] w-full overflow-hidden">
                <img alt="" className="absolute inset-0 max-w-none object-cover size-full group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" src={item.img} loading={i === 0 ? "eager" : "lazy"} decoding="async" data-fallback={item.fallbackImg || ""} onError={(e) => { const el = e.currentTarget as HTMLImageElement; if (el.src !== el.dataset.fallback && el.dataset.fallback) { el.src = el.dataset.fallback; } else if (!el.src.includes('unsplash.com')) { el.src = "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&auto=format&fit=crop&q=70"; } }} />
                {(item.isVideo || item.link?.includes('/video/') || item.link?.includes('video.') || item.isShort) && (
                  <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/70 text-white text-[11px] font-semibold backdrop-blur-md shadow-md">
                    <svg className="size-3 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                    <span>{item.isShort ? '⚡ Short' : '▶ Video'}</span>
                  </div>
                )}
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
  onRelogin,
  onOpenShorts
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
    onOpenShorts?: () => void;
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
        <div className="flex items-center gap-2">
          <div className="bg-[#f4f6fa] flex items-center h-[32px] px-3 py-1 rounded-full shrink-0">
            <p className="font-normal text-[#5f687b] text-[12px] whitespace-nowrap">
              {dateStr} · {timeStr}
            </p>
          </div>

          {/* Nút Video Shorts trên Tablet Header */}
          <button
            onClick={onOpenShorts}
            className="flex items-center gap-1.5 h-[32px] px-3 py-1.5 rounded-full bg-[#ff315f] hover:bg-[#e02650] text-white font-bold text-[12px] shadow-sm active:scale-95 transition-all cursor-pointer shrink-0"
            title="Xem Video Shorts 9:16 (TikTok & YouTube Shorts)"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            <span>Shorts</span>
          </button>

          <div 
            data-testid="dark-mode-toggle"
            onClick={() => setDarkMode && setDarkMode(!darkMode)} 
            role="button" 
            tabIndex={0} 
            style={{ width: '32px', height: '32px', minWidth: '32px', minHeight: '32px', borderRadius: '50%' }}
            className="w-[32px] h-[32px] rounded-full bg-[#f4f6fa] flex items-center justify-center text-[#182033] hover:bg-[#e3e7ef] transition-colors shrink-0 cursor-pointer"
            title={darkMode ? "Chuyển sang giao diện Sáng" : "Chuyển sang giao diện Tối"}
          >
            {darkMode ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
            )}
          </div>
          <QADashboardHeaderButton userRole={userRole} />
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
          <WeatherSection compact isLoading={isLoading} condKey={condKey} liveData={liveData} liveOverrides={liveOverrides} darkMode={darkMode} onArticleClick={onArticleClick} />
        </div>

        {/* News panel */}
        <div className={`flex flex-1 flex-col gap-[var(--grid-gap)] items-start min-w-0 overflow-hidden transition-all duration-700 ease-in-out ${isLoading ? 'opacity-50 blur-[2px] grayscale-[0.3]' : 'opacity-100 blur-0 grayscale-0'}`}>
          <MarketSection />
          {userRole && userRole.email ? (
            <div className="w-full">
            <CalendarSection userEmail={userRole.email} accessToken={userRole._access_token} onTokenExpired={onTokenExpired} onRelogin={onRelogin} />
            </div>
          ) : (
            <div className="w-full bg-[#f8fafc] p-6 rounded-[var(--card-radius)] border border-dashed border-[#cbd5e1] flex flex-col items-center justify-center text-center gap-3">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              <p className="text-[#64748b] text-[14px] max-w-[200px]">Đăng nhập Google để xem Lịch cá nhân</p>
            </div>
          )}

          {/* Sticky Tin tức Header with MobileCategoryMenu dropdown */}
          <div className="flex items-center justify-between w-full mb-1 sticky top-[var(--header-height)] bg-[#f4f6fa] z-[90] py-2 mt-[-4px]">
            <div className="flex flex-col gap-[2px] items-start">
              <div className="flex items-center gap-2">
                <p className="font-semibold leading-[26px] text-[#182033] text-[18px]">
                  Tin tức
                </p>
                <div className="bg-[#f7a928] px-2 py-0.5 rounded-full flex items-center">
                  <p className="font-bold text-[10px] text-white">LIVE</p>
                </div>
              </div>
              <p className="font-normal text-[#5f687b] text-[12px]">
                {WEATHER.location} · {newsFeed.length} bài mới nhất
              </p>
            </div>
            <MobileCategoryMenu activeCategory={activeCategory || "Tất cả"} setActiveCategory={setActiveCategory || (() => {})} />
          </div>

          {(isFetchingCategory || isLoading) ? <NewsSkeleton /> : (<>
          {/* Featured article */}
          {featured && (
            <div onClick={() => onArticleClick && onArticleClick(featured)}  className="bg-white flex flex-col items-start overflow-hidden rounded-[var(--card-radius)] shadow-[0px_4px_12px_0px_rgba(23,33,51,0.1)] hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(23,33,51,0.2)] transition-all duration-300 w-full no-underline group cursor-pointer"
            >
              <div className="h-[180px] relative rounded-tl-2xl rounded-tr-2xl w-full overflow-hidden">
                <img alt="" className="absolute inset-0 max-w-none object-cover size-full group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" src={featured.img} loading="eager" fetchPriority="high" decoding="async" data-fallback={featured.fallbackImg || ""} onError={(e) => { const el = e.currentTarget as HTMLImageElement; if (el.src !== el.dataset.fallback && el.dataset.fallback) { el.src = el.dataset.fallback; } else if (!el.src.includes('unsplash.com')) { el.src = "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&auto=format&fit=crop&q=70"; } }} />
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
                <img alt="" className="absolute inset-0 max-w-none object-cover size-full group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" src={item.img} loading="lazy" decoding="async" data-fallback={item.fallbackImg || ""} onError={(e) => { const el = e.currentTarget as HTMLImageElement; if (el.src !== el.dataset.fallback && el.dataset.fallback) { el.src = el.dataset.fallback; } else if (!el.src.includes('unsplash.com')) { el.src = "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&auto=format&fit=crop&q=70"; } }} />
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
  onRelogin,
  onOpenShorts
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
    onOpenShorts?: () => void;
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
        <div className="flex items-center gap-2.5">
          <div className="bg-[#f4f6fa] flex items-center h-[32px] px-3 py-1 rounded-full shrink-0">
            <p className="font-normal text-[#5f687b] text-[12px] whitespace-nowrap">
              {dateStr} · {timeStr}
            </p>
          </div>

          {/* Nút Video Shorts trên Desktop Header */}
          <button
            onClick={onOpenShorts}
            className="flex items-center gap-1.5 h-[32px] px-3.5 py-1.5 rounded-full bg-[#ff315f] hover:bg-[#e02650] text-white font-bold text-[12px] shadow-sm active:scale-95 transition-all cursor-pointer shrink-0"
            title="Xem Video Shorts 9:16 (TikTok & YouTube Shorts)"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            <span>Video Shorts 9:16</span>
          </button>

          <div 
            data-testid="dark-mode-toggle"
            onClick={() => setDarkMode && setDarkMode(!darkMode)} 
            role="button" 
            tabIndex={0} 
            style={{ width: '32px', height: '32px', minWidth: '32px', minHeight: '32px', borderRadius: '50%' }}
            className="w-[32px] h-[32px] rounded-full bg-[#f4f6fa] flex items-center justify-center text-[#182033] hover:bg-[#e3e7ef] transition-colors shrink-0 cursor-pointer"
            title={darkMode ? "Chuyển sang giao diện Sáng" : "Chuyển sang giao diện Tối"}
          >
            {darkMode ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
            )}
          </div>
          <QADashboardHeaderButton userRole={userRole} />
          {userRole && userRole.picture ? (
            <UserAvatarMenu userRole={userRole} onLogout={onLogout || (() => {})} />
          ) : (
            <CustomLoginButton onLoginSuccess={onLoginSuccess} />
          )}
        </div>
      </div>

      <LiveNewsTicker news={newsFeed} liveData={liveData} condKey={condKey} />

      <div 
        className="flex gap-[var(--grid-gap)] items-start px-[var(--page-padding)] py-[var(--section-gap)] w-full max-w-[1536px] mx-auto"
        style={{ paddingTop: '10px', paddingLeft: '0px', paddingRight: '0px' }}
      >
        {/* Weather column */}
        <div className="flex flex-col gap-[var(--grid-gap)] items-start shrink-0 w-[420px]">
          <WeatherSection compact isLoading={isLoading} condKey={condKey} liveData={liveData} liveOverrides={liveOverrides} darkMode={darkMode} onArticleClick={onArticleClick} />
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
          <div className="flex-[3] min-w-[250px] bg-[#f8fafc] p-6 rounded-[var(--card-radius)] border border-dashed border-[#cbd5e1] flex flex-col items-center justify-center text-center gap-3">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            <p className="text-[#64748b] text-[14px] max-w-[200px]">Đăng nhập Google để xem Lịch cá nhân của bạn</p>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between w-full mb-1 sticky top-[var(--header-height)] bg-[#f4f6fa] z-[90] py-3 mt-[-12px]">
        <div className="flex gap-[10px] items-center shrink-0">
          <p className="font-semibold leading-[26px] text-[#182033] text-[18px]">
            Tin Tức Mới Nhất
          </p>
          <div className="bg-[#f7a928] flex items-start px-[10px] py-[3px] rounded-full shrink-0">
            <p className="font-bold text-[11px] text-white">LIVE</p>
          </div>
        </div>
        {/* Menu scroll danh mục trên PC theo đúng yêu cầu */}
        <div className="flex overflow-x-auto gap-2 items-center max-w-[872px] scrollbar-hide py-1">
          {NEWS_CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory && setActiveCategory(cat)}
              className={`shrink-0 whitespace-nowrap px-3.5 py-[5px] rounded-full font-semibold text-[13px] transition-all cursor-pointer ${
                activeCategory === cat
                  ? 'bg-[#ff315f] text-white shadow-md'
                  : 'bg-white text-[#5f687b] border border-[#e3e7ef] hover:border-[#cbd5e1] hover:text-[#182033]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

          {(isFetchingCategory || isLoading) ? <NewsSkeleton /> : (<>
          {/* Featured feed card */}
          {featured && (
            <div data-testid="news-card" onClick={() => onArticleClick && onArticleClick(featured)}  className="bg-white flex flex-col gap-[14px] items-start overflow-hidden p-[var(--card-padding)] rounded-[var(--card-radius)] shadow-[0px_4px_12px_0px_rgba(23,33,51,0.1)] hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(23,33,51,0.2)] transition-all duration-300 w-full no-underline group cursor-pointer"
            >
              <div className="flex gap-[10px] items-center overflow-hidden w-full">
                <div className="bg-[#ffe8ee] flex flex-col items-center justify-center overflow-hidden rounded-full shrink-0 size-11 border border-gray-100">
                  <img alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" src={featured.logo || featured.img} loading="lazy" decoding="async" data-fallback={featured.fallbackImg || ""} onError={(e) => { const el = e.currentTarget as HTMLImageElement; if (el.src !== el.dataset.fallback && el.dataset.fallback) { el.src = el.dataset.fallback; } else { el.src = "https://www.google.com/s2/favicons?domain=vnexpress.net&sz=128"; } }} />
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
                <img alt="" className="absolute inset-0 max-w-none object-cover size-full group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" src={featured.img} loading="eager" fetchPriority="high" decoding="async" data-fallback={featured.fallbackImg || ""} onError={(e) => { const el = e.currentTarget as HTMLImageElement; if (el.src !== el.dataset.fallback && el.dataset.fallback) { el.src = el.dataset.fallback; } else if (!el.src.includes('unsplash.com')) { el.src = "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&auto=format&fit=crop&q=70"; } }} />
                {(featured.isVideo || featured.link?.includes('/video/') || featured.link?.includes('video.') || featured.isShort) && (
                  <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/70 text-white text-[11px] font-semibold backdrop-blur-md shadow-md">
                    <svg className="size-3 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                    <span>{featured.isShort ? '⚡ Short' : '▶ Video'}</span>
                  </div>
                )}
              </div>
              {featured.body && (
                <p className="font-normal text-[#5f687b] text-[length:var(--font-body)] line-clamp-2 mt-3">{featured.body}</p>
              )}
            </div>
          )}

          {/* News grid */}
            <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-[var(--grid-gap)] w-full">
              {grid.map((item, i) => (
                <div key={i} data-testid="news-card" onClick={() => onArticleClick && onArticleClick(item)}  className="bg-white flex flex-col items-start overflow-hidden rounded-[var(--card-radius)] shadow-[0px_4px_12px_0px_rgba(23,33,51,0.1)] hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(23,33,51,0.2)] transition-all duration-300 w-full no-underline group cursor-pointer"
                >
                <div className="h-[140px] relative w-full overflow-hidden">
                  <img alt="" className="absolute inset-0 max-w-none object-cover size-full group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" src={item.img} loading={i < 4 ? "eager" : "lazy"} decoding="async" data-fallback={item.fallbackImg || ""} onError={(e) => { const el = e.currentTarget as HTMLImageElement; if (el.src !== el.dataset.fallback && el.dataset.fallback) { el.src = el.dataset.fallback; } else if (!el.src.includes('unsplash.com')) { el.src = "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&auto=format&fit=crop&q=70"; } }} />
                  {(item.isVideo || item.link?.includes('/video/') || item.link?.includes('video.') || item.isShort) && (
                    <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/70 text-white text-[10px] font-semibold backdrop-blur-md shadow-md">
                      <svg className="size-2.5 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                      <span>{item.isShort ? '⚡ Short' : '▶ Video'}</span>
                    </div>
                  )}
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
      if (entries[0].isIntersecting && !isLoading && hasMoreNews) {
        onTrigger();
      }
    }, { rootMargin: '150px' });
    if (targetRef.current) observer.observe(targetRef.current);
    
    // 2. Backup scroll event
    const handleScroll = () => {
      if (!targetRef.current || isLoading || !hasMoreNews) return;
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
  }, [onTrigger, isLoading, hasMoreNews]);
  
  return (
    <div ref={targetRef} className="w-full flex flex-col items-center justify-center gap-4 py-8 pb-12">
      <button 
        onClick={onTrigger} 
        disabled={isLoading || !hasMoreNews}
        className="px-[16px] py-[10px] bg-[#e3e7ef] text-[#182033] font-semibold rounded-[8px] min-h-[44px] active:scale-95 transition-transform disabled:opacity-50"
      >
        {!hasMoreNews ? "Đã tải hết tin tức hiện có" : isLoading ? "⏳ Đang tải thêm 15 bài..." : "↓ Tải thêm tin tức"}
      </button>
      <div className="w-full text-center py-2 text-[10px] text-gray-400">Phiên bản: 15:30 (Truyền hình Tự động - HTML5 Native)</div>
    </div>
  );
}


// ── Live Components ────────────────────────────────────────────────────────────

function LiveNewsTicker({ news, liveData, condKey }: { news: LiveNewsItem[], liveData?: any, condKey?: string }) {
  const WEATHER = (liveData ?? DEFAULT_WEATHER_DATA)[condKey || 'HaNoi'];
  const topNews = news.slice(0, 5);
  
  if (!news.length) return null;

  return (
    <div className="w-full bg-white text-[#182033] flex items-center h-[32px] overflow-hidden border-b border-[#e3e7ef] z-20 shrink-0 select-none">
      <div className="bg-[#ff315f] text-white font-bold text-[11px] px-3 py-1 flex items-center justify-center shrink-0 z-10 h-full tracking-wider uppercase shadow-xs">
        <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse mr-1.5"></div>
        Tin nóng
      </div>
      <div className="flex-1 overflow-hidden h-full flex items-center relative pl-2" style={{ WebkitMaskImage: 'linear-gradient(to right, transparent, black 1%, black 99%, transparent)', maskImage: 'linear-gradient(to right, transparent, black 1%, black 99%, transparent)' }}>
        <div className="animate-marquee whitespace-nowrap flex items-center gap-6 text-[12.5px] font-medium min-w-full hover:[animation-play-state:paused]">
          {topNews.map((n, i) => (
            <span key={i} className="flex items-center gap-2 cursor-pointer hover:text-[#0055D4] transition-colors" title={n.author}>
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff315f]"></span>
              {n.author}
            </span>
          ))}
          <span className="flex items-center gap-2 text-[#0055D4] font-semibold cursor-pointer">
             <span className="w-1.5 h-1.5 rounded-full bg-[#0055D4]"></span>
             Thời tiết hôm nay: {WEATHER.temp}°, {WEATHER.condition}
          </span>
          <span className="flex items-center gap-2 text-[#10b981] font-semibold cursor-pointer">
             <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span>
             VN-Index: 1250.32 (+5.2 điểm)
          </span>
          {/* Duplicate to create infinite marquee effect without gap */}
          {topNews.map((n, i) => (
            <span key={'dup-'+i} className="flex items-center gap-2 cursor-pointer hover:text-[#0055D4] transition-colors" title={n.author}>
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff315f]"></span>
              {n.author}
            </span>
          ))}
          <span className="flex items-center gap-2 text-[#0055D4] font-semibold cursor-pointer">
             <span className="w-1.5 h-1.5 rounded-full bg-[#0055D4]"></span>
             Thời tiết hôm nay: {WEATHER.temp}°, {WEATHER.condition}
          </span>
        </div>
      </div>
    </div>
  );
}

function LiveTimelineSection({ news, onArticleClick }: { news: LiveNewsItem[], onArticleClick?: (article: any) => void }) {
  const recentNews = news.slice(0, 5);
  return (
    <div className="w-full bg-white p-4 rounded-[var(--card-radius)] shadow-[0px_4px_12px_0px_rgba(23,33,51,0.06)] border border-[#e3e7ef] flex flex-col relative overflow-hidden group">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#e3e7ef]">
        <div className="relative flex items-center justify-center w-2.5 h-2.5">
          <div className="absolute w-full h-full bg-[#0055D4] rounded-full animate-ping opacity-75"></div>
          <div className="relative w-1.5 h-1.5 bg-[#0055D4] rounded-full"></div>
        </div>
        <h2 className="font-bold text-[#182033] text-[length:var(--font-h5)]">Tin mới cập nhật</h2>
      </div>

      <div className="flex flex-col relative before:absolute before:left-[4px] before:top-1.5 before:bottom-1.5 before:w-[1px] before:bg-[#e3e7ef]">
        {recentNews.map((item, idx) => {
          const pubDateStr = (item as any).pubDate || "";
          const time = formatArticleDate(pubDateStr);
          return (
            <div key={idx} onClick={() => onArticleClick && onArticleClick(item)} className="relative pl-5 pb-3.5 last:pb-0 group/item cursor-pointer">
              <div className="absolute left-[0px] top-1 w-[9px] h-[9px] rounded-full bg-white border-2 border-[#0055D4] group-hover/item:bg-[#0055D4] transition-all z-10"></div>
              <div className="flex items-center gap-2 mb-0.5">
                <p className="text-[length:var(--font-caption)] font-semibold text-[#0055D4]">{time}</p>
                <p className="text-[length:var(--font-caption)] text-[#5f687b] opacity-80">{item.src}</p>
              </div>
              <h3 className="text-[length:var(--font-small)] font-medium text-[#182033] leading-[1.4] group-hover/item:text-[#0055D4] transition-colors line-clamp-2" title={item.author}>{item.author}</h3>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export const NEWS_CATEGORIES = [
  "Tất cả",
  "Thời tiết",
  "Giá vàng",
  "Chính trị",
  "Đời sống",
  "Con người",
  "Doanh nghiệp",
  "Công nghệ",
  "Kỹ thuật khoa học",
  "Giải trí"
];

export const DEFAULT_CAT_IMAGE: Record<string, string> = {
  "Tất cả": "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=450&auto=format&fit=crop&q=70",
  "Trang chủ": "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=450&auto=format&fit=crop&q=70",
  "Tin nổi bật": "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=450&auto=format&fit=crop&q=70",
  "Thời tiết": "https://images.unsplash.com/photo-1592210454359-9043f067919b?w=450&auto=format&fit=crop&q=70",
  "Giá vàng": "https://images.unsplash.com/photo-1610375461246-83df859d849d?w=450&auto=format&fit=crop&q=70",
  "Chính trị": "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=450&auto=format&fit=crop&q=70",
  "Đời sống": "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=450&auto=format&fit=crop&q=70",
  "Con người": "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=450&auto=format&fit=crop&q=70",
  "Doanh nghiệp": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=450&auto=format&fit=crop&q=70",
  "Công nghệ": "https://images.unsplash.com/photo-1518770660439-4636190af475?w=450&auto=format&fit=crop&q=70",
  "Kỹ thuật khoa học": "https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=450&auto=format&fit=crop&q=70",
  "Giải trí": "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=450&auto=format&fit=crop&q=70"
};

export const RSS_FEEDS_DB = [
  // Video Shorts tự động
  { category: "Giải trí", name: "Tuổi Trẻ • Video", url: "https://tuoitre.vn/rss/video.rss", isVideo: true },
  { category: "Giải trí", name: "Thanh Niên • Video", url: "https://thanhnien.vn/rss/video.rss", isVideo: true },
  { category: "Giải trí", name: "VnExpress • Video", url: "https://video.vnexpress.net/rss/tin-tuc.rss", isVideo: true },
  { category: "Giải trí", name: "Dân Trí • Video", url: "https://dantri.com.vn/rss/video.rss", isVideo: true },
  { category: "Giải trí", name: "Báo Giao Thông • Video", url: "https://baogiaothong.vn/rss/video.rss", isVideo: true },
  { category: "Giải trí", name: "VTV • Video Truyền hình", url: "https://vtv.vn/rss/truyen-hinh.rss", isVideo: true },

  // Thời tiết & Môi trường
  { category: "Thời tiết", name: "VTV • Xã hội & Thời tiết", url: "https://vtv.vn/rss/xa-hoi.rss" },
  { category: "Thời tiết", name: "Dân Trí • Thời sự", url: "https://dantri.com.vn/rss/thoi-su.rss" },
  { category: "Thời tiết", name: "Tuổi Trẻ • Thời sự", url: "https://tuoitre.vn/rss/thoi-su.rss" },
  { category: "Thời tiết", name: "VnExpress • Thời sự", url: "https://vnexpress.net/rss/thoi-su.rss" },
  { category: "Thời tiết", name: "Tiền Phong • Xã hội", url: "https://tienphong.vn/rss/xa-hoi-2.rss" },
  { category: "Thời tiết", name: "Thanh Niên • Thời sự", url: "https://thanhnien.vn/rss/thoi-su.rss" },
  { category: "Thời tiết", name: "VietnamNet • Thời sự", url: "https://vietnamnet.vn/rss/thoi-su.rss" },
  { category: "Thời tiết", name: "TTXVN • Xã hội", url: "https://baotintuc.vn/rss/xa-hoi.rss" },
  { category: "Thời tiết", name: "Báo Giao Thông", url: "https://baogiaothong.vn/rss/giao-thong.rss" },

  // Giá vàng & Thị trường tài chính
  { category: "Giá vàng", name: "VTV • Kinh tế & Vàng", url: "https://vtv.vn/rss/kinh-te.rss" },
  { category: "Giá vàng", name: "Thanh Niên • Kinh tế", url: "https://thanhnien.vn/rss/kinh-te.rss" },
  { category: "Giá vàng", name: "Tuổi Trẻ • Kinh doanh", url: "https://tuoitre.vn/rss/kinh-doanh.rss" },
  { category: "Giá vàng", name: "Dân Trí • Kinh doanh", url: "https://dantri.com.vn/rss/kinh-doanh.rss" },
  { category: "Giá vàng", name: "VnExpress • Kinh doanh", url: "https://vnexpress.net/rss/kinh-doanh.rss" },
  { category: "Giá vàng", name: "VietnamNet • Kinh doanh", url: "https://vietnamnet.vn/rss/kinh-doanh.rss" },
  { category: "Giá vàng", name: "Tiền Phong • Kinh tế", url: "https://tienphong.vn/rss/kinh-te-3.rss" },
  { category: "Giá vàng", name: "TTXVN • Kinh tế", url: "https://baotintuc.vn/rss/kinh-te.rss" },
  { category: "Giá vàng", name: "Soha • Kinh doanh", url: "https://soha.vn/rss/kinh-doanh.rss" },

  // Chính trị & Thời sự chính thống
  { category: "Chính trị", name: "VTV • Xã hội & Thời sự", url: "https://vtv.vn/rss/xa-hoi.rss" },
  { category: "Chính trị", name: "VietnamNet • Chính trị", url: "https://vietnamnet.vn/rss/chinh-tri.rss" },
  { category: "Chính trị", name: "TTXVN • Thời sự xã hội", url: "https://baotintuc.vn/rss/thoi-su-xa-hoi.rss" },
  { category: "Chính trị", name: "VietnamNet • Thời sự", url: "https://vietnamnet.vn/rss/thoi-su.rss" },
  { category: "Chính trị", name: "VnExpress • Thời sự", url: "https://vnexpress.net/rss/thoi-su.rss" },
  { category: "Chính trị", name: "Tuổi Trẻ • Thời sự", url: "https://tuoitre.vn/rss/thoi-su.rss" },
  { category: "Chính trị", name: "Thanh Niên • Thời sự", url: "https://thanhnien.vn/rss/thoi-su.rss" },
  { category: "Chính trị", name: "Dân Trí • Thời sự", url: "https://dantri.com.vn/rss/thoi-su.rss" },
  { category: "Chính trị", name: "Tiền Phong • Xã hội", url: "https://tienphong.vn/rss/xa-hoi-2.rss" },
  { category: "Chính trị", name: "CAND • Thời sự", url: "https://cand.com.vn/rss/thoi-su-c1105.rss" },
  { category: "Chính trị", name: "Báo Giao Thông • Thời sự", url: "https://baogiaothong.vn/rss/thoi-su.rss" },

  // Đời sống
  { category: "Đời sống", name: "VTV • Đời sống & Xã hội", url: "https://vtv.vn/rss/xa-hoi.rss" },
  { category: "Đời sống", name: "VnExpress • Đời sống", url: "https://vnexpress.net/rss/doi-song.rss" },
  { category: "Đời sống", name: "Dân Trí • Đời sống", url: "https://dantri.com.vn/rss/doi-song.rss" },
  { category: "Đời sống", name: "Thanh Niên • Đời sống", url: "https://thanhnien.vn/rss/doi-song.rss" },
  { category: "Đời sống", name: "VietnamNet • Đời sống", url: "https://vietnamnet.vn/rss/doi-song.rss" },
  { category: "Đời sống", name: "Tuổi Trẻ • Nhịp sống trẻ", url: "https://tuoitre.vn/rss/nhip-song-tre.rss" },
  { category: "Đời sống", name: "Tiền Phong • Giới trẻ", url: "https://tienphong.vn/rss/gioi-tre-11.rss" },
  { category: "Đời sống", name: "Soha • Đời sống", url: "https://soha.vn/rss/doi-song.rss" },

  // Con người & Xã hội
  { category: "Con người", name: "VnExpress • Tâm sự", url: "https://vnexpress.net/rss/tam-su.rss" },
  { category: "Con người", name: "Dân Trí • Nhân ái", url: "https://dantri.com.vn/rss/tam-long-nhan-ai.rss" },
  { category: "Con người", name: "Dân Trí • Đời sống", url: "https://dantri.com.vn/rss/doi-song.rss" },
  { category: "Con người", name: "Thanh Niên • Giới trẻ", url: "https://thanhnien.vn/rss/gioi-tre.rss" },
  { category: "Con người", name: "Tuổi Trẻ • Nhịp sống trẻ", url: "https://tuoitre.vn/rss/nhip-song-tre.rss" },
  { category: "Con người", name: "TTXVN • Con người & Xã hội", url: "https://baotintuc.vn/rss/thoi-su-xa-hoi.rss" },
  { category: "Con người", name: "VietnamNet • Đời sống", url: "https://vietnamnet.vn/rss/doi-song.rss" },

  // Doanh nghiệp
  { category: "Doanh nghiệp", name: "VTV • Doanh nghiệp & Kinh tế", url: "https://vtv.vn/rss/kinh-te.rss" },
  { category: "Doanh nghiệp", name: "Thanh Niên • Kinh tế", url: "https://thanhnien.vn/rss/kinh-te.rss" },
  { category: "Doanh nghiệp", name: "Tuổi Trẻ • Kinh doanh", url: "https://tuoitre.vn/rss/kinh-doanh.rss" },
  { category: "Doanh nghiệp", name: "VnExpress • Kinh doanh", url: "https://vnexpress.net/rss/kinh-doanh.rss" },
  { category: "Doanh nghiệp", name: "Dân Trí • Kinh doanh", url: "https://dantri.com.vn/rss/kinh-doanh.rss" },
  { category: "Doanh nghiệp", name: "VietnamNet • Kinh doanh", url: "https://vietnamnet.vn/rss/kinh-doanh.rss" },
  { category: "Doanh nghiệp", name: "Tiền Phong • Kinh tế", url: "https://tienphong.vn/rss/kinh-te-3.rss" },
  { category: "Doanh nghiệp", name: "TTXVN • Kinh tế", url: "https://baotintuc.vn/rss/kinh-te.rss" },
  { category: "Doanh nghiệp", name: "Soha • Doanh nghiệp", url: "https://soha.vn/rss/kinh-doanh.rss" },

  // Công nghệ
  { category: "Công nghệ", name: "VTV • Công nghệ & Đổi mới", url: "https://vtv.vn/rss/cong-nghe.rss" },
  { category: "Công nghệ", name: "VnExpress • Số Hóa", url: "https://vnexpress.net/rss/so-hoa.rss" },
  { category: "Công nghệ", name: "Thanh Niên • Công nghệ", url: "https://thanhnien.vn/rss/cong-nghe.rss" },
  { category: "Công nghệ", name: "Dân Trí • Công nghệ", url: "https://dantri.com.vn/rss/cong-nghe.rss" },
  { category: "Công nghệ", name: "Tuổi Trẻ • Công nghệ", url: "https://tuoitre.vn/rss/cong-nghe.rss" },
  { category: "Công nghệ", name: "GenK", url: "https://genk.vn/rss/home.rss" },

  // Kỹ thuật khoa học
  { category: "Kỹ thuật khoa học", name: "VTV • Khoa học", url: "https://vtv.vn/rss/cong-nghe.rss" },
  { category: "Kỹ thuật khoa học", name: "VnExpress • Khoa học", url: "https://vnexpress.net/rss/khoa-hoc.rss" },
  { category: "Kỹ thuật khoa học", name: "Tuổi Trẻ • Khoa học", url: "https://tuoitre.vn/rss/khoa-hoc.rss" },
  { category: "Kỹ thuật khoa học", name: "Dân Trí • Khoa học", url: "https://dantri.com.vn/rss/khoa-hoc.rss" },
  { category: "Kỹ thuật khoa học", name: "TTXVN • Thế giới & Khoa học", url: "https://baotintuc.vn/rss/the-gioi.rss" },

  // Giải trí
  { category: "Giải trí", name: "VTV • Văn hóa & Showbiz", url: "https://vtv.vn/rss/van-hoa-giai-tri.rss" },
  { category: "Giải trí", name: "TTXVN • Văn hóa & Nghệ thuật", url: "https://baotintuc.vn/rss/van-hoa.rss" },
  { category: "Giải trí", name: "VnExpress • Giải trí", url: "https://vnexpress.net/rss/giai-tri.rss" },
  { category: "Giải trí", name: "Tuổi Trẻ • Giải trí", url: "https://tuoitre.vn/rss/giai-tri.rss" },
  { category: "Giải trí", name: "Thanh Niên • Giải trí", url: "https://thanhnien.vn/rss/giai-tri.rss" },
  { category: "Giải trí", name: "Dân Trí • Giải trí", url: "https://dantri.com.vn/rss/giai-tri.rss" },
  { category: "Giải trí", name: "Tiền Phong • Giải trí", url: "https://tienphong.vn/rss/giai-tri-3.rss" },
  { category: "Giải trí", name: "Tiền Phong • Hoa hậu", url: "https://tienphong.vn/rss/hoa-hau-245.rss" },
  { category: "Giải trí", name: "Soha • Giải trí", url: "https://soha.vn/rss/giai-tri.rss" },
  { category: "Giải trí", name: "Ngôi Sao • Showbiz", url: "https://ngoisao.vnexpress.net/rss/showbiz.rss" },
  { category: "Giải trí", name: "Kenh14 • Star", url: "https://kenh14.vn/rss/home.rss" }
];

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
    <div className="w-full flex flex-col gap-3 bg-white p-[var(--card-padding)] rounded-[var(--card-radius)] shadow-[0px_4px_12px_0px_rgba(23,33,51,0.06)] border border-[#e3e7ef] lg:h-[400px]">
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
    <div className="w-full min-h-[300px] bg-white p-5 rounded-[var(--card-radius)] shadow-[0px_4px_12px_0px_rgba(23,33,51,0.06)] border border-[#e3e7ef] flex flex-col lg:h-[400px]">
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
    if (domain.includes('dantri')) return 'https://dantri.com.vn/favicon.ico';
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
  } catch (e) {
    return "";
  }
}

export function getProxyImageUrl(url: string, width = 450, quality = 75) {
  if (!url || typeof url !== 'string') return "";
  let cleanUrl = url.trim();
  if (cleanUrl.startsWith("//")) cleanUrl = "https:" + cleanUrl;
  if (!cleanUrl.startsWith("http")) return cleanUrl;
  
  cleanUrl = cleanUrl.replace('.dev', '.com.vn');
  // Normalize Dantri .dev mirrors to official CDN
  cleanUrl = cleanUrl.replace(/https?:\/\/[a-z0-9\.]*dantri\.dev/g, 'https://icdn.dantri.com.vn');
  if (cleanUrl.includes("dantri.dev")) {
    cleanUrl = cleanUrl.replace("dantri.dev", "icdn.dantri.com.vn");
  }
  
  // Các CDN báo chí Việt Nam tải trực tiếp siêu tốc (50ms) với referrerPolicy="no-referrer", không qua proxy chậm
  const bypassDomains = [
    'dantri.com.vn',
    'icdn.dantri.com.vn',
    'cdnphoto.dantri.com.vn',
    'cdnweb.dantri.com.vn',
    'vnecdn.net',
    'mediacdn.vn',
    'vnncdn.net',
    'tuoitre.vn',
    'thanhnien.vn',
    'vietnamnet.vn',
    'vtv.vn',
    'tienphong.vn',
    'kenh14.vn',
    'cafebiz.vn',
    'cafef.vn',
    'genk.vn',
    'soha.vn',
    'vtcnews.vn',
    'vtc.vn',
    'laodong.vn',
    'nld.com.vn',
    'plo.vn',
    'znews.vn',
    'zingnews.vn',
    'unsplash.com',
    'google.com/s2/favicons',
    'ytimg.com',
    'wsrv.nl'
  ];
  if (bypassDomains.some(d => cleanUrl.includes(d))) {
    return cleanUrl;
  }
  
  if (cleanUrl.startsWith("http") && !cleanUrl.includes("wsrv.nl")) {
    return `https://wsrv.nl/?url=${encodeURIComponent(cleanUrl)}&w=${width}&q=${quality}&output=webp`;
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

function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const toggleVisibility = () => setIsVisible(window.scrollY > 300);
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);
  return isVisible ? (
    <button 
      data-testid="scroll-to-top-btn"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
      className="fixed bottom-6 right-5 z-[80] bg-white border border-[#e3e7ef] shadow-[0_4px_16px_rgba(23,33,51,0.18)] hover:-translate-y-1 active:scale-90 transition-all duration-300 rounded-full size-11 flex items-center justify-center text-[#ff315f] group cursor-pointer"
      title="Cuộn lên đầu trang"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-y-0.5 transition-transform duration-300"><path d="M18 15l-6-6-6 6"/></svg>
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
    <div onClick={() => setActiveTooltipDay(null)} className="w-full h-full min-h-[300px] bg-white p-5 rounded-[var(--card-radius)] shadow-[0px_4px_12px_0px_rgba(23,33,51,0.06)] border border-[#e3e7ef] flex flex-col lg:h-[400px]" style={{ fontFamily: 'inherit' }}>
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

  const formatGoldDisplayName = (name: string): string => {
    if (!name) return name;
    if (name.includes('Vàng trang sức')) return 'Vàng trang sức';
    if (name.includes('Nhẫn tròn Phú Quý')) return 'Nhẫn tròn Phú Quý';
    return name;
  };

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
    <div className={`w-full flex flex-col gap-3 bg-white p-[var(--card-padding)] rounded-[var(--card-radius)] shadow-[0px_4px_12px_0px_rgba(23,33,51,0.06)] border border-[#e3e7ef] transition-opacity duration-700 ease-in-out lg:h-[400px] lg:justify-between opacity-100`}>
      <div className="flex items-center justify-between w-full mb-1">
        <h2 className="font-bold leading-[26px] text-[#182033] text-[length:var(--font-h4)]">Giá vàng Phú Quý</h2>
        <div className="bg-[#fff4e5] px-2 py-0.5 rounded-full flex items-center shrink-0">
          <div className="w-1.5 h-1.5 rounded-full bg-[#f7a928] animate-pulse mr-1"></div>
          <p className="font-bold text-[length:var(--font-caption)] text-[#f7a928]">LIVE</p>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-1.5 sm:gap-2 w-full mt-1">
        {displayData.map((item, idx) => (
          <div key={idx} className="flex flex-col border border-[#e3e7ef] rounded-[8px] sm:rounded-[12px] p-1.5 sm:p-3 bg-[#f8fafc] w-full min-w-0 overflow-hidden">
            <p className="font-bold text-[#182033] text-[length:var(--font-caption)] sm:text-[length:var(--font-body)] line-clamp-1 sm:line-clamp-2 mb-1 sm:mb-2 leading-tight" title={formatGoldDisplayName(item.productTypeName)}>{formatGoldDisplayName(item.productTypeName)}</p>
            <div className="flex justify-between items-center w-full gap-0.5 sm:gap-1">
              <p className="text-[#5f687b] text-[10px] sm:text-[length:var(--font-caption)]">Mua</p>
              <p className="font-semibold text-[#16a34a] text-[length:var(--font-caption)] sm:text-[length:var(--font-body)] whitespace-nowrap tracking-tighter sm:tracking-normal">{item.priceIn.toLocaleString('vi-VN')}</p>
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

export async function fetchAndAttachYouTubeData(accessToken: string, userInfo: any) {
  if (!accessToken || !userInfo) return userInfo;
  try {
    const chRes = await fetch('https://www.googleapis.com/youtube/v3/channels?part=snippet,contentDetails,statistics&mine=true', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    if (chRes.ok) {
      const chData = await chRes.json();
      if (chData.items && chData.items.length > 0) {
        userInfo.youtubeChannel = chData.items[0];
      } else {
        userInfo.youtubeChannel = {
          id: 'mine',
          snippet: {
            title: userInfo.name || 'Kênh YouTube của tôi',
            description: `Tài khoản Google liên kết: ${userInfo.email}`,
            customUrl: userInfo.email ? `@${userInfo.email.split('@')[0]}` : '@user',
            thumbnails: {
              default: { url: userInfo.picture || '' },
              medium: { url: userInfo.picture || '' },
              high: { url: userInfo.picture || '' }
            }
          },
          statistics: {
            subscriberCount: '0',
            videoCount: '0',
            viewCount: '0'
          }
        };
      }
    } else if (chRes.status === 403 || chRes.status === 401) {
      userInfo.youtubeNeedsAuth = true;
    }
  } catch (err) {
    console.warn('[YouTube API] Không thể lấy kênh của tài khoản:', err);
  }

  try {
    const subRes = await fetch('https://www.googleapis.com/youtube/v3/subscriptions?part=snippet&mine=true&maxResults=50', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    if (subRes.ok) {
      const subData = await subRes.json();
      if (subData.items && Array.isArray(subData.items)) {
        userInfo.youtubeSubscriptions = subData.items;
      }
    } else if (subRes.status === 403 || subRes.status === 401) {
      userInfo.youtubeNeedsAuth = true;
    }
  } catch (err) {
    console.warn('[YouTube API] Không thể lấy danh sách kênh đã đăng ký:', err);
  }

  if (!userInfo.youtubeChannel && userInfo.email) {
    userInfo.youtubeChannel = {
      id: 'mine',
      snippet: {
        title: userInfo.name || 'Tài khoản YouTube của tôi',
        description: `Tài khoản Google liên kết: ${userInfo.email}`,
        customUrl: userInfo.email ? `@${userInfo.email.split('@')[0]}` : '@user',
        thumbnails: {
          default: { url: userInfo.picture || '' },
          medium: { url: userInfo.picture || '' },
          high: { url: userInfo.picture || '' }
        }
      },
      statistics: {
        subscriberCount: '0',
        videoCount: '0',
        viewCount: '0'
      }
    };
  }

  return userInfo;
}

export function doGoogleLogin(onSuccess: (res: any) => void, loginHint?: string) {
  const basePath = window.location.pathname.includes('/Website_thoitiet_design') ? '/Website_thoitiet_design/' : '/';
  const redirectUri = window.location.origin + basePath;
  // Bổ sung quyền đọc thông tin kênh YouTube và danh sách kênh đã đăng ký của tài khoản Gmail
  const scope = 'openid email profile https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/calendar.readonly';
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

        // Tải thông tin kênh YouTube và các kênh đã đăng ký của tài khoản
        await fetchAndAttachYouTubeData(accessToken, userInfo);

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

export function QADashboardHeaderButton({ userRole }: { userRole?: any }) {
  if (!isUserAdminQA(userRole)) return null;
  return (
    <a
      href={getDashboardUrl()}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-1.5 h-[32px] px-3 rounded-full bg-[#ecfdf3] hover:bg-[#d1fadf] border border-[#a6f4c5] text-[#027a48] font-bold text-[12px] shadow-sm transition-all cursor-pointer shrink-0"
      title="Bảng Giám Sát & Kiểm Thử QA (Dành riêng cho mrkun28@gmail.com)"
    >
      <span className="w-2 h-2 rounded-full bg-[#12b76a] animate-pulse"></span>
      <span>🛡️ QA</span>
    </a>
  );
}

export function QADashboardFloatingWidget({ userRole }: { userRole?: any }) {
  if (!isUserAdminQA(userRole)) return null;
  return (
    <div className="fixed bottom-6 right-6 z-[999] pointer-events-auto">
      <a
        href={getDashboardUrl()}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 bg-[#111827] hover:bg-[#1f2937] text-white px-3.5 py-2.5 rounded-full shadow-2xl border-2 border-[#12b76a] hover:scale-105 active:scale-95 transition-all cursor-pointer group"
        title="Bảng Giám Sát & Kiểm Thử QA Toàn Hệ Thống (Dành riêng cho mrkun28@gmail.com)"
      >
        <span className="w-2.5 h-2.5 rounded-full bg-[#12b76a] animate-pulse shadow-[0_0_8px_#12b76a]"></span>
        <span className="font-bold text-[13px] tracking-wide text-white flex items-center gap-1.5">
          <span>🛡️</span>
          <span>QA Dashboard</span>
        </span>
        <span className="text-[10px] bg-[#067647] text-white px-1.5 py-0.5 rounded-full font-mono font-bold">ADMIN</span>
      </a>
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
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-[#e3e7ef] py-2 z-[500] flex flex-col overflow-hidden">
            <div className="px-4 py-2 border-b border-[#e3e7ef] flex flex-col mb-1">
              <span className="text-[13px] font-semibold text-[#182033] line-clamp-1">{userRole.name}</span>
              <span className="text-[11px] text-[#5f687b] line-clamp-1">{userRole.email}</span>
            </div>
            {userRole.youtubeChannel && (
              <div className="px-4 py-2 border-b border-[#e3e7ef] bg-red-50/60 flex flex-col gap-0.5">
                <div className="flex items-center gap-1.5 text-red-600 font-bold text-[11px]">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                  <span>Kênh YouTube:</span>
                </div>
                <span className="text-[12px] font-semibold text-slate-800 line-clamp-1">
                  {userRole.youtubeChannel.snippet?.title || userRole.name}
                </span>
                <span className="text-[10px] text-slate-500">
                  {userRole.youtubeChannel.snippet?.customUrl || ''} 
                  {userRole.youtubeSubscriptions?.length ? ` • ${userRole.youtubeSubscriptions.length} kênh theo dõi` : ''}
                </span>
              </div>
            )}
            {isUserAdminQA(userRole) && (
              <a 
                href={getDashboardUrl()} 
                target="_blank" 
                rel="noopener noreferrer" 
                onClick={() => setIsOpen(false)} 
                className="px-4 py-2 text-left text-[13px] text-[#027a48] hover:bg-[#ecfdf3] font-semibold transition-colors w-full flex items-center gap-2 border-b border-[#e3e7ef]"
              >
                <span>🛡️</span>
                <span>QA Dashboard (Admin)</span>
              </a>
            )}
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
  const [isShortsOpen, setIsShortsOpen] = useState(false);
  
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

  // Handle OAuth2 redirect callback (access_token or error in URL hash)
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && (hash.includes('access_token=') || hash.includes('error='))) {
      if (window.opener) {
        window.opener.postMessage({ type: 'GOOGLE_LOGIN_SUCCESS', hash: hash }, '*');
        window.close();
        return;
      }

      const params = new URLSearchParams(hash.substring(1));
      const error = params.get('error');
      const accessToken = params.get('access_token');
      
      // Clean URL hash immediately
      window.history.replaceState(null, '', window.location.pathname + window.location.search);

      if (error) {
         sessionStorage.setItem('google_silent_failed', '1');
         return;
      }

      if (accessToken) {
        sessionStorage.removeItem('google_silent_failed');
        fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
          .then(r => r.json())
          .then(async userInfo => {
            userInfo._access_token = accessToken;
            // Tải thông tin kênh YouTube và các kênh đã đăng ký của tài khoản
            await fetchAndAttachYouTubeData(accessToken, userInfo);
            const authStr = JSON.stringify(userInfo);
            localStorage.setItem('user_auth', authStr);
            document.cookie = `user_auth=${encodeURIComponent(authStr)}; path=/; max-age=31536000`;
            setUserRole(userInfo);
          })
          .catch(err => console.error("Lỗi lấy thông tin Google:", err));
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

  // Tự động đồng bộ thông tin kênh YouTube nếu người dùng đã đăng nhập và có token
  useEffect(() => {
    if (userRole && userRole._access_token && (!userRole.youtubeChannel || !userRole.youtubeSubscriptions)) {
      const token = userRole._access_token;
      const copy = { ...userRole };
      fetchAndAttachYouTubeData(token, copy).then((synced) => {
        if (synced.youtubeChannel || (synced.youtubeSubscriptions && synced.youtubeSubscriptions.length > 0)) {
          setUserRole(synced);
          localStorage.setItem('user_auth', JSON.stringify(synced));
        }
      });
    }
  }, [userRole]);
  
  // Check for expired token on load or silently refresh using top-level redirect
  useEffect(() => {
    if (userRole && userRole.email && !userRole._access_token) {
      if (!sessionStorage.getItem('google_silent_failed')) {
        const basePath = window.location.pathname.includes('/Website_thoitiet_design') ? '/Website_thoitiet_design/' : '/';
        const redirectUri = window.location.origin + basePath;
        const scope = 'openid email profile https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/calendar.readonly';
        const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=${encodeURIComponent(scope)}&prompt=none&login_hint=${encodeURIComponent(userRole.email)}`;
        window.location.replace(authUrl);
      }
    }
  }, [userRole]);


  const handleRelogin = () => {
    doGoogleLogin(setUserRole, userRole?.email);
  };

  const handleArticleSelect = (article: any) => {
    if (!article) return;
    // Ghép dữ liệu chi tiết từ bot đã cào sẵn
    let cleanLink = article.link ? article.link.replace(/<\!\[CDATA\[/g, '').replace(/\]\]>/g, '').trim().split('?')[0] : '';
    const preCrawled = preCrawledRef.current.get(cleanLink);
    const enriched = preCrawled 
      ? { ...article, fullContent: preCrawled.fullContent }
      : { ...article };
    if (!enriched.author && enriched.title) enriched.author = enriched.title;
    if (!enriched.title && enriched.author) enriched.title = enriched.author;
    setSelectedArticle(enriched);
    if (enriched) {
      const slug = toSlug(enriched.author || enriched.title || 'bai-viet');
      window.history.pushState({ articleSlug: slug }, '', `/Website_thoitiet_design/chi-tiet-${slug}`);
    }
  };

  const closeArticle = () => {
    setSelectedArticle(null);
    window.history.pushState({}, '', `/Website_thoitiet_design/`);
  };

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


  const lastActivityRef = useRef(Date.now());

  useEffect(() => {
    const handleWheel = (e: any) => {
      lastActivityRef.current = Date.now();
      if (e.ctrlKey) {
        e.preventDefault();
      }
    };
    const handleKeydown = (e: any) => {
      lastActivityRef.current = Date.now();
      if (e.ctrlKey && (e.key === '=' || e.key === '-' || e.key === '+' || e.key === '0')) {
        e.preventDefault();
      }
    };
    const updateActivity = () => { lastActivityRef.current = Date.now(); };
    document.addEventListener('wheel', handleWheel, { passive: false });
    document.addEventListener('keydown', handleKeydown, { passive: false });
    document.addEventListener('mousemove', updateActivity, { passive: true });
    document.addEventListener('touchstart', updateActivity, { passive: true });
    document.addEventListener('scroll', updateActivity, { passive: true });
    return () => {
      document.removeEventListener('wheel', handleWheel);
      document.removeEventListener('keydown', handleKeydown);
      document.removeEventListener('mousemove', updateActivity);
      document.removeEventListener('touchstart', updateActivity);
      document.removeEventListener('scroll', updateActivity);
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
    
    await new Promise(res => setTimeout(res, 400));
    
    try {
      const getUniqueKey = (item: any) => {
        if (item.link) return item.link.split('?')[0].replace(/^https?:\/\//, '').toLowerCase();
        if (item.author) return item.author.trim().toLowerCase();
        return Math.random().toString();
      };
      
      const existingKeys = new Set((liveNews || []).map(getUniqueKey));
      
      const trulyNewItems = (fullNewsPool.current || []).filter(item => !existingKeys.has(getUniqueKey(item)));
      
      if (trulyNewItems.length === 0) {
        setHasMoreNews(false);
        return;
      }
      
      const picked = trulyNewItems.slice(0, 15); // Lấy tiếp 15 bài từ kho pool
      
      if (trulyNewItems.length <= 15) {
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

  // Handle direct URL slug on load and browser back/forward buttons
  useEffect(() => {
    const syncArticleFromUrl = () => {
      const path = window.location.pathname;
      const match = path.match(/\/chi-tiet-([a-zA-Z0-9_-]+)/);
      if (!match) {
        setSelectedArticle(null);
        return;
      }

      const slug = match[1];
      if (selectedArticle && toSlug(selectedArticle.author || selectedArticle.title || '') === slug) {
        return;
      }

      const pool = [...(liveNews || []), ...(fullNewsPool.current || [])];
      const found = pool.find(item => {
        const itemSlug = toSlug(item.author || item.title || "");
        return itemSlug === slug || itemSlug.includes(slug) || slug.includes(itemSlug);
      });

      if (found) {
        handleArticleSelect(found);
      } else {
        let link = "";
        let author = slug.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        let img = "https://image.tienphong.vn/w890/Uploaded/2026/rnrnumu/2026_10_17/to-lam-thuy-si-8-6170.jpg";
        let body = "";

        if (slug.includes("to-lam") && slug.includes("thuy-si")) {
          author = "Tổng Bí thư, Chủ tịch nước Tô Lâm cùng Tổng thống Thụy Sĩ đi dạo Hồ Gươm";
          link = "https://tienphong.vn/tong-bi-thu-chu-tich-nuoc-to-lam-cung-tong-thong-thuy-si-di-dao-ho-guom-post1886196.tpo";
          body = "Tối 17/10, Tổng Bí thư, Chủ tịch nước Tô Lâm và Phu nhân Ngô Phương Ly cùng Tổng thống Thụy Sĩ Guy Parmelin và Phu nhân dạo phố đi bộ hồ Hoàn Kiếm, tham quan các nét văn hóa đặc sắc của Thủ đô Hà Nội.";
        } else if (slug.includes("startup-ai") || slug.includes("ty-phu-tu-than")) {
          author = "Phát hiện một nam sinh bỏ đại học sáng lập startup AI trị giá 10 tỷ USD sau 2 năm thành tỷ phú tự thân trẻ nhất thế giới";
          link = "https://soha.vn/phat-hien-mot-nam-sinh-bo-dai-hoc-sang-lap-startup-ai-tri-gia-10-ty-usd-sau-2-nam-thanh-ty-phu-tu-than-tre-nhat-the-gioi-198261016135659085.htm";
          body = "Ở tuổi 22, Surya Midha trở thành tỷ phú tự thân trẻ nhất thế giới sau khi startup trí tuệ nhân tạo Mercor đạt định giá 10 tỷ USD chỉ sau 2 năm thành lập.";
        } else if (slug.includes("hoa-sua") || slug.includes("cat-tia-cay")) {
          author = "Hoa sữa nở nồng nặc, người dân có được tự ý cắt tỉa cây trước nhà?";
          link = "https://vietnamnet.vn/hoa-sua-no-nong-nac-nguoi-dan-co-duoc-tu-y-cat-tia-cay-truoc-nha-2565458.html";
          body = "Hoa sữa nở rộ, tỏa mùi hương nồng nặc, ảnh hưởng đến sinh hoạt của người dân. Vậy người dân có được tự ý cắt tỉa cây trước nhà hay phải kiến nghị cơ quan chức năng xử lý?";
          img = "https://static-images.vnncdn.net/vps_images_publish/000001/000003/2026/10/16/w-hoa-sua-1-659-2715.jpg?width=0&s=8l_0esTDp-pWhzwy8qWwiA";
        } else {
          link = `https://tienphong.vn/${slug}.tpo`;
        }

        const provisional = {
          author,
          title: author,
          src: link.includes('vietnamnet') ? "Báo VietNamNet" : (link.includes('soha') ? "Báo Soha" : "Báo Tiền Phong"),
          img,
          fallbackImg: img,
          link,
          body
        };
        handleArticleSelect(provisional);
      }
    };

    syncArticleFromUrl();
    window.addEventListener('popstate', syncArticleFromUrl);
    return () => window.removeEventListener('popstate', syncArticleFromUrl);
  }, [liveNews]);

  
  



  
  useEffect(() => {
    let isCancelled = false;
    let timer: any;

    const fetchSingleFeed = async (feed: { name: string; url: string; category?: string; isHot?: boolean }) => {
      // 1. Thử rss2json trước (timeout 2.5s)
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2500);
        const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.url + (feed.url.includes("?") ? "&" : "?") + "rnd=" + Date.now())}`, {
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        const data = await res.json();
        if (data.status === "ok" && Array.isArray(data.items) && data.items.length > 0) {
          return data.items.map((item: any) => ({
            ...item,
            _sourceName: feed.name,
            _isHot: (feed as any).isHot
          }));
        }
      } catch {}

      // 2. Fallback sang Worker Proxy mrkun28 siêu tốc không bị chặn CORS/rate-limit
      try {
        const pUrl = `https://new-bot.mrkun28.workers.dev/?url=${encodeURIComponent(feed.url)}`;
        const res = await fetch(pUrl);
        const data = await res.json();
        if (data && data.contents) {
          const xml = data.contents;
          const items: any[] = [];
          const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
          let match;
          while ((match = itemRegex.exec(xml)) !== null) {
            const itemXml = match[1];
            const titleMatch = itemXml.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i);
            const linkMatch = itemXml.match(/<link>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/link>/i);
            const descMatch = itemXml.match(/<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/i);
            const pubDateMatch = itemXml.match(/<pubDate>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/pubDate>/i);
            const encMatch = itemXml.match(/<enclosure[^>]+url=["']([^"']+)["']/i);
            const mediaMatch = itemXml.match(/<media:(?:content|thumbnail)[^>]+url=["']([^"']+)["']/i);

            const title = titleMatch ? titleMatch[1].replace(/<!\[CDATA\[|\]\]>/g, '').trim() : "";
            const link = linkMatch ? linkMatch[1].replace(/<!\[CDATA\[|\]\]>/g, '').trim() : "";
            const desc = descMatch ? descMatch[1].replace(/<!\[CDATA\[|\]\]>/g, '').trim() : "";
            const pubDate = pubDateMatch ? pubDateMatch[1].replace(/<!\[CDATA\[|\]\]>/g, '').trim() : "";

            const descImgMatch = desc.match(/<img[^>]+src=["']([^"']+)["']/i) || itemXml.match(/<img[^>]+src=["']([^"']+)["']/i);
            const thumb = encMatch ? encMatch[1] : (mediaMatch ? mediaMatch[1] : (descImgMatch ? descImgMatch[1] : ""));

            if (title && link) {
              items.push({
                title,
                link,
                description: desc,
                pubDate,
                thumbnail: thumb,
                _sourceName: feed.name,
                _isHot: (feed as any).isHot
              });
            }
          }
          return items;
        }
      } catch {}

      return [];
    };
    
    const fetchCategoryNews = async (isBackground = false) => {
      if (!isBackground) setIsFetchingCategory(true);
      try {
        const catFeeds = activeCategory === "Tất cả" ? RSS_FEEDS_DB : RSS_FEEDS_DB.filter(f => f.category === activeCategory);
        if (catFeeds.length === 0) return;
        
        let selectedFeeds = activeCategory === "Tất cả"
          ? [
              { category: "Tin nổi bật", name: "Tin Nổi Bật", url: "https://vnexpress.net/rss/tin-noi-bat.rss", isHot: true },
              { category: "Trang chủ", name: "Dân Trí", url: "https://dantri.com.vn/rss/home.rss", isHot: true },
              { category: "Thời sự VTV", name: "VTV Thời Sự", url: "https://vtv.vn/rss/xa-hoi.rss", isHot: true },
              { category: "Thời sự VietnamNet", name: "VietnamNet Thời Sự", url: "https://vietnamnet.vn/rss/thoi-su.rss", isHot: true },
              { category: "TTXVN", name: "Báo Tin Tức TTXVN", url: "https://baotintuc.vn/rss/thoi-su-xa-hoi.rss", isHot: true },
              ...[...catFeeds].sort(() => 0.5 - Math.random()).slice(0, 38)
            ]
          : [...catFeeds];
        
        const results = await Promise.all(selectedFeeds.map(fetchSingleFeed));
        if (isCancelled) return;
        
        const fallbackImages = [imgNews1, imgNews2, imgNews3, imgNews4, imgNews5];
        const mappedFeeds = results.map(feedArticles => {
          return feedArticles.map((item: any, idx: number) => {
            let imageUrl = "";
            if (typeof item.thumbnail === 'string' && item.thumbnail.startsWith('http')) imageUrl = item.thumbnail;
            if (!imageUrl && typeof item.image === 'string' && item.image.startsWith('http')) imageUrl = item.image;
            if (!imageUrl && item.enclosure && typeof item.enclosure.link === 'string' && item.enclosure.link.startsWith('http')) imageUrl = item.enclosure.link;
            if (!imageUrl && typeof item.enclosure === 'string' && item.enclosure.startsWith('http')) imageUrl = item.enclosure;
            if (!imageUrl && item.description && typeof item.description === 'string') {
              const imgMatch = item.description.match(/<img[^>]+src=["']([^"']+)["']/i);
              if (imgMatch) imageUrl = imgMatch[1];
            }
            if (!imageUrl && item.content && typeof item.content === 'string') {
              const imgMatch2 = item.content.match(/<img[^>]+src=["']([^"']+)["']/i);
              if (imgMatch2) imageUrl = imgMatch2[1];
            }
            if (imageUrl) {
              imageUrl = imageUrl.replace(/&amp;/g, '&').trim();
              imageUrl = imageUrl.replace(/https?:\/\/[a-z0-9\.]*dantri\.dev/g, 'https://icdn.dantri.com.vn');
              imageUrl = imageUrl.replace('.dev', '.com.vn');
            }
            
            if (item.link) {
              item.link = item.link.replace(/https?:\/\/[a-z0-9\.]*dantri\.dev/g, 'https://dantri.com.vn');
            }
            
            if (imageUrl && (imageUrl.includes("1x1") || imageUrl.includes("pixel") || imageUrl.includes("favicon") || item.link?.includes("news.google.com"))) {
              imageUrl = ""; 
            }
            
            const catFallback = DEFAULT_CAT_IMAGE[item.category || activeCategory] || fallbackImages[idx % fallbackImages.length];
            const finalImage = imageUrl ? getProxyImageUrl(imageUrl) : catFallback;
            
            let cleanDesc = "";
            if (item.description) {
               cleanDesc = item.description.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
            }
            if (cleanDesc && item.title) {
               if (cleanDesc.toLowerCase().startsWith(item.title.toLowerCase())) {
                  cleanDesc = cleanDesc.slice(item.title.length).replace(/^[\s:\-\–—]+/, '').trim();
               } else if (cleanDesc.includes(item.title)) {
                  cleanDesc = cleanDesc.replace(item.title, '').replace(/^[\s:\-\–—]+/, '').trim();
               }
            }
            
            const isVid = !!item._isVideo || /video/i.test(item.link || '') || /video/i.test(item.title || '') || (item.enclosure?.type && item.enclosure.type.includes('video'));
            const isSh = isVid && (/short|tiktok|reel/i.test(item.link || '') || /short|reel|tiktok/i.test(item.title || ''));
            const videoLink = (item.enclosure?.type?.includes('video') ? item.enclosure.link : '') || (item.videoUrl || '');
            return {
              img: finalImage,
              logo: getNewspaperLogo(item.link || ""),
              fallbackImg: catFallback,
              title: decodeHTMLEntities(item.title ?? "Tin tức"),
              author: decodeHTMLEntities(item.title ?? "Tin tức"),
              src: item.source || item._sourceName || "Tin tức",
              body: decodeHTMLEntities(cleanDesc || item.title || ""),
              description: item.description || "",
              content: item.content || item['content:encoded'] || item.description || "",
              link: item.link,
              pubDate: item.pubDate,
              _isHot: item._isHot,
              isVideo: isVid,
              isShort: isSh,
              videoSrc: videoLink
            };
          }).filter(Boolean);
        });
        
        let validFeeds = mappedFeeds.filter(f => f.length > 0);

        // Lọc chuyên sâu theo từ khóa cho các mục đặc thù (Thời tiết, Giá vàng)
        if (activeCategory === "Thời tiết") {
          const WEATHER_KEYWORDS = /thời tiết|mưa|nắng|áp thấp|bão|triều cường|lũ|nhiệt độ|dự báo|khí tượng|gió|hạn hán|sạt lở|rét|lạnh|không khí lạnh|sóng biển|mây|sương mù/i;
          validFeeds = validFeeds.map(feed => {
            const matches = feed.filter((item: any) => WEATHER_KEYWORDS.test(item.author || '') || WEATHER_KEYWORDS.test(item.body || ''));
            return matches.length > 0 ? matches : feed;
          }).filter(f => f.length > 0);
        } else if (activeCategory === "Giá vàng") {
          const GOLD_KEYWORDS = /vàng|sjc|vàng miếng|vàng nhẫn|bạc|kim hoàn|ngoại tệ|đô la|usd|bảng anh|lãi suất|tỷ giá|ngân hàng|chứng khoán|tiền tệ/i;
          validFeeds = validFeeds.map(feed => {
            const matches = feed.filter((item: any) => GOLD_KEYWORDS.test(item.author || '') || GOLD_KEYWORDS.test(item.body || ''));
            return matches.length > 0 ? matches : feed;
          }).filter(f => f.length > 0);
        }
        
        // Sắp xếp bài viết trong từng feed theo thứ tự mới nhất
        validFeeds.forEach(feed => {
          feed.sort((a: any, b: any) => {
            const timeA = parseFlexiblePubDate(a.pubDate);
            const timeB = parseFlexiblePubDate(b.pubDate);
            return timeB - timeA;
          });
        });

        const hotNews: any[] = [];
        const normalNews: any[] = [];

        // Đan xen các nguồn báo để tạo độ phong phú và giữ bài mới ở trên
        while(validFeeds.length > 0) {
           validFeeds.sort(() => 0.5 - Math.random());
           for (let i = validFeeds.length - 1; i >= 0; i--) {
               const feed = validFeeds[i];
               const takeCount = Math.floor(Math.random() * 3) + 2;
               const taken = feed.splice(0, takeCount);
               
               taken.forEach((item: any) => {
                   if (item._isHot) hotNews.push(item);
                   else normalNews.push(item);
               });

               if (feed.length === 0) {
                   validFeeds.splice(i, 1);
               }
           }
        }
        
        const rawMixed = [...hotNews, ...normalNews];
        // Áp dụng Lá chắn độ tươi mới tin tức (Smart Freshness Gate):
        // 1. Khống chế cứng tin mới trong 3 ngày (loại bỏ triệt để các bài viết cũ hơn 3 ngày)
        // 2. Sắp xếp tin mới nhất lên đầu, ưu tiên tin nóng nếu trong vòng 3h.
        const mixedNews = filterAndSortFreshNews(rawMixed, 3);
        
        if (!isBackground) {
          const existingLinks = new Set(mixedNews.map(n => n.link));
          // Lọc bot items: chỉ giữ các bài tươi mới (trong 3 ngày), loại trừ triệt để tin cũ
          const botItems = activeCategory === "Tất cả"
            ? (fullNewsPool.current || [])
                .filter(n => (n as any)._isBot && !existingLinks.has(n.link))
                .filter(n => isArticleFresh(n, 3))
            : [];
          const finalPool = filterAndSortFreshNews([...botItems, ...mixedNews], 3);
          fullNewsPool.current = finalPool;
          setLiveNews(finalPool.slice(0, 15));
        } else {
          const existingLinks = new Set((fullNewsPool.current || []).map(n => n.link));
          const newItems = mixedNews.filter(n => !existingLinks.has(n.link));
          if (newItems.length > 0) {
            const combined = filterAndSortFreshNews([...newItems, ...fullNewsPool.current], 3);
            fullNewsPool.current = combined;
            setLiveNews(combined.slice(0, 15));
          }
        }
        setHasMoreNews(fullNewsPool.current.length > 15);
      } catch (e) {
        console.error(e);
      } finally {
        if (!isBackground) setIsFetchingCategory(false);
      }
    };
    
    fetchCategoryNews(false);
    timer = setInterval(() => { 
      const idleTime = Date.now() - lastActivityRef.current;
      // Chỉ tự động tải thêm tin tức nếu người dùng không tương tác trong vòng 30 giây (idle)
      if (idleTime > 30000) {
        fetchCategoryNews(true); 
      }
    }, 2 * 60 * 1000);
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

      const newsArr = json.news as Array<{ title?: string; source?: string; link?: string; description?: string, image?: string, pubDate?: string, date?: string }>;
      if (Array.isArray(newsArr) && newsArr.length > 0) {
          const images = [imgNews1, imgNews2, imgNews3, imgNews4, imgNews5];
          const allMapped: LiveNewsItem[] = newsArr
            .filter(item => {
              const dStr = (item as any).pubDate || (item as any).date;
              if (dStr) {
                return isArticleFresh({ pubDate: dStr }, 3);
              }
              if ((item as any).timestamp && (item as any).timestamp > 0) {
                const ts = (item as any).timestamp * 1000;
                return (Date.now() - ts) <= 3 * 24 * 3600 * 1000;
              }
              const text = `${item.title || ''} ${item.link || ''}`;
              return !/202[0-5]|201\d/i.test(text);
            })
            .map((item, i) => {
              let itemPubDate = (item as any).pubDate || (item as any).date;
              if (!itemPubDate && (item as any).timestamp) {
                itemPubDate = new Date((item as any).timestamp * 1000).toISOString();
              }
              return {
                img:    item.image ? getProxyImageUrl(item.image) : images[i % images.length],
                logo: getNewspaperLogo(item.link || ""),
                fallbackImg: images[i % images.length],
                author: decodeHTMLEntities(item.title       ?? "Tin tức"),
                src:    item.source      ?? "Tin tức",
                body:   decodeHTMLEntities(item.description ?? ""),
                link:   item.link,
                pubDate: itemPubDate || new Date().toISOString(),
                _isBot: true,
              } as any;
            });
          
          const existingLinks = new Set((fullNewsPool.current || []).map(n => n.link));
          const trulyNewBotItems = allMapped.filter(n => !n.link || !existingLinks.has(n.link));
          
          if (fullNewsPool.current.length === 0) {
            const freshPool = filterAndSortFreshNews(allMapped, 3);
            fullNewsPool.current = freshPool;
            setLiveNews(freshPool.slice(0, 15));
          } else if (trulyNewBotItems.length > 0) {
            const merged = filterAndSortFreshNews([...trulyNewBotItems, ...fullNewsPool.current], 3);
            fullNewsPool.current = merged;
            setLiveNews(merged.slice(0, 15));
          }
          setHasMoreNews(true);
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

          Promise.all([
            fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=vi`).then(r => r.json()),
            fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=vi`).then(r => r.json()),
            fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`).then(r => r.json()),
            fetch('https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent('https://news.google.com/rss/search?q=thời+tiết+hà+nội&hl=vi&gl=VN&ceid=VN:vi'))
              .then(r => r.json())
              .then(data => data.items || [])
              .catch(() => []),
            fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=vi`)
              .then(r => r.json())
              .catch(() => null),
            fetch(`https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${apiKey}`).then(r => r.json()).catch(() => ({ value: 0 }))
          ]).then(([weather, forecast, aqi, weatherNewsRaw, geoReverse, uviRes]) => {
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
          



          const weatherNews = weatherNewsRaw.slice(0, 4).map((item: any) => {
            const titleMatch = item.title ? item.title.match(/(.+) - (.+)/) : null;
            const title = decodeHTMLEntities(titleMatch ? titleMatch[1] : item.title);
            const source = titleMatch ? titleMatch[2] : (item.source || "Thời tiết");
            const rawDesc = item.description || item.content || "";
            const desc = rawDesc.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
            const img = item.enclosure?.link || item.thumbnail || "https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=800&auto=format&fit=crop&q=80";
            return {
              title,
              link: item.link,
              source,
              body: desc || `Thông tin thời tiết và tình hình khí tượng thủy văn mới nhất từ ${source}.`,
              img: img
            };
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
            weatherNews: weatherNews.length > 0 ? weatherNews : undefined
          };
          
          processJson(jsonPayload);
          
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
      fetch(apiUrl)
        .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
        .then((json) => {
          processJson(json as Record<string, unknown>);
        })
        .catch(() => setApiStatus("error"));
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
    <div className="min-h-screen w-full bg-[#f4f6fa] pb-[40px]">
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
        <MobileLayout activeCategory={activeCategory} setActiveCategory={setActiveCategory} condKey={condKey} liveData={liveData} liveNews={liveNews} isFetchingCategory={isFetchingCategory} isLoading={apiStatus === 'loading'} darkMode={darkMode} setDarkMode={setDarkMode} liveOverrides={liveOverrides} onArticleClick={handleArticleSelect} userRole={userRole} onLoginSuccess={setUserRole} onLogout={handleLogout} onTokenExpired={handleTokenExpired} onRelogin={handleRelogin} onOpenShorts={() => setIsShortsOpen(true)} />
      </div>
      <div className="hidden md:block xl:hidden w-full">
        <TabletLayout activeCategory={activeCategory} setActiveCategory={setActiveCategory} condKey={condKey} liveData={liveData} liveNews={liveNews} isFetchingCategory={isFetchingCategory} isLoading={apiStatus === 'loading'} darkMode={darkMode} setDarkMode={setDarkMode} liveOverrides={liveOverrides} onArticleClick={handleArticleSelect} userRole={userRole} onLoginSuccess={setUserRole} onLogout={handleLogout} onTokenExpired={handleTokenExpired} onRelogin={handleRelogin} onOpenShorts={() => setIsShortsOpen(true)} />
      </div>
      <div className="hidden xl:block w-full">
        <DesktopLayout activeCategory={activeCategory} setActiveCategory={setActiveCategory} condKey={condKey} liveData={liveData} liveNews={liveNews} isFetchingCategory={isFetchingCategory} isLoading={apiStatus === 'loading'} darkMode={darkMode} setDarkMode={setDarkMode} liveOverrides={liveOverrides} onArticleClick={handleArticleSelect} userRole={userRole} onLoginSuccess={setUserRole} onLogout={handleLogout} onTokenExpired={handleTokenExpired} onRelogin={handleRelogin} onOpenShorts={() => setIsShortsOpen(true)} />
      </div>


      {/* Video Shorts Modal (Trải nghiệm TikTok / YouTube Shorts) */}
      <VideoShortsModal
        isOpen={isShortsOpen}
        onClose={() => setIsShortsOpen(false)}
        liveNews={liveNews}
        userRole={userRole}
        onLogin={handleRelogin}
      />

      <InfiniteScrollTrigger onTrigger={fetchMoreNews} isLoading={isLoadingMore} hasMoreNews={hasMoreNews} />
      <ScrollToTop />

      {selectedArticle && (
        <NewsDetailView 
          key={selectedArticle.link || selectedArticle.author || selectedArticle.title}
          article={selectedArticle} 
          allNews={fullNewsPool.current && fullNewsPool.current.length > 0 ? fullNewsPool.current : (liveNews && liveNews.length > 0 ? liveNews : DEFAULT_NEWS_FEED)} 
          onClose={closeArticle} 
          onSelectRelated={handleArticleSelect} 
        />
      )}

      {/* Site Footer */}
      <footer className="w-full border-t border-[#e3e7ef] bg-white py-4 px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-[12px] text-[#94a3b8]">
        <p>© 2026 <span className="font-semibold text-[#5f687b]">Anx.</span> — Thời tiết &amp; Tin tức</p>
        <div className="flex items-center gap-4">
          {isUserAdminQA(userRole) && (
            <a 
              href={getDashboardUrl()} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center gap-1 font-semibold text-[#067647] hover:text-[#05603a] bg-[#ecfdf3] px-2.5 py-0.5 rounded-full border border-[#abefc6] transition-colors text-[11px]" 
              title="Mở bảng kiểm thử và giám sát chất lượng QA (mrkun28@gmail.com)"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#12b76a] animate-pulse"></span>
              🛡️ QA Dashboard
            </a>
          )}
          <button onClick={() => setShowPrivacyPolicy(true)} className="hover:text-[#3a7bd5] underline underline-offset-2 transition-colors">
            Chính sách Bảo mật
          </button>
          <a href="https://github.com/AnanasUX" target="_blank" rel="noopener" className="hover:text-[#3a7bd5] transition-colors">GitHub</a>
        </div>
      </footer>

      {/* Floating QA Dashboard Widget for Admin mrkun28@gmail.com */}
      <QADashboardFloatingWidget userRole={userRole} />

      {/* Privacy Policy Overlay */}
      {showPrivacyPolicy && (
        <PrivacyPolicyPage onClose={() => setShowPrivacyPolicy(false)} />
      )}
    </div>
  );
}
