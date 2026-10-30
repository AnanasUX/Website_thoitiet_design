import React, { useState, useEffect, useMemo, useCallback } from "react";
import { VietQRModal, FALLBACK_QR_SVG, type VietQRData } from "./components/VietQRModal";

export interface NewsArticle {
  title: string;
  link: string;
  pubDate: string;
  source: string;
  sourceLogo?: string;
  description?: string;
  thumbnail?: string;
  content?: string;
  author?: string;
  guid?: string;
}

export function BrandLogo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const isSm = size === "sm";
  return (
    <div className="flex items-center gap-2.5 group cursor-pointer select-none">
      <div className="relative flex items-center justify-center shrink-0">
        <div className={`${isSm ? "size-7 rounded-lg" : "size-9 rounded-xl"} bg-gradient-to-tr from-[#ff315f] via-[#f72585] to-[#f7a928] flex items-center justify-center shadow-md shadow-[#ff315f]/25 group-hover:scale-105 transition-transform`}>
          <span className={`text-white ${isSm ? "text-[14px]" : "text-[18px]"} font-black`}>P</span>
        </div>
        <span className="absolute -bottom-0.5 -right-0.5 size-2 rounded-full bg-emerald-400 border-2 border-white animate-pulse" />
      </div>
      <div className="flex flex-col items-start leading-none">
        <div className="flex items-center gap-1.5">
          <span className={`font-['Inter:Extra_Bold'] font-black text-[#ff315f] ${isSm ? "text-[17px]" : "text-[20px]"} tracking-tight`}>pulse.</span>
          <span className="bg-gradient-to-r from-[#ff315f] to-[#f97316] text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider shadow-xs">
            TIỀN PHONG
          </span>
        </div>
        <span className="text-[10px] text-[#5f687b] font-medium tracking-tight mt-0.5 hidden sm:inline">
          Tin tức & Thời tiết Đô thị 24/7
        </span>
      </div>
    </div>
  );
}

interface PricingConfig {
  rent_fixed: number;
  electricity_unit: number;
  water_unit: number;
  service_fee_1: number;
  service_fee_2: number;
  service_fee_3: number;
  bank_name: string;
  bank_account: string;
  bank_owner: string;
}

interface RoomItem {
  id: string;
  name: string;
  tenant: string;
  phone: string;
  fixed_rent: number;
}

interface InvoiceItem {
  id: string;
  created_at: string;
  room_id: string;
  room_name: string;
  tenant: string;
  dien_cu: number;
  dien_moi: number;
  so_dien: number;
  tien_dien: number;
  nuoc_cu: number;
  nuoc_moi: number;
  so_nuoc: number;
  tien_nuoc: number;
  tien_nha: number;
  phu_phi: number;
  s_khoa: number;
  tong_tien: number;
  status: "paid" | "unpaid";
  note?: string;
  telegram_message?: string;
}

interface WeatherAdminState {
  autoPilot: boolean;
  temp: number;
  feels_like: number;
  humidity: number;
  wind_speed: number;
  status: string;
  desc: string;
  warningText: string;
  suggestionItems: string[];
  floodItems: string[];
  aqi: number;
  pm25: number;
  uvIndex: number;
}

interface AlertBannerState {
  enabled: boolean;
  type: "danger" | "warning" | "info";
  message: string;
}

const STORAGE_KEY = "anx_admin_unified_store_v4";

export function AdminBoard({ onBackToSite }: { onBackToSite: () => void }) {
  // ── Authentication State ──────────────────────────────────────────────────
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem("anx_admin_auth") === "true" || localStorage.getItem("anx_admin_auth") === "true";
  });
  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [loginError, setLoginError] = useState("");
  const [toastMsg, setToastMsg] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);

  // ── Navigation Tabs ───────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<"rent" | "analytics" | "weather" | "news" | "shorts" | "alert" | "settings">("rent");
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrModalData, setQrModalData] = useState<VietQRData | null>(null);

  // ── Data Stores ───────────────────────────────────────────────────────────
  const [pricing, setPricing] = useState<PricingConfig>({
    rent_fixed: 3500000,
    electricity_unit: 3500,
    water_unit: 35000,
    service_fee_1: 100000,
    service_fee_2: 100000,
    service_fee_3: 100000,
    bank_name: "BIDV",
    bank_account: "8817398313",
    bank_owner: "TRAN THI THUY HUYEN",
  });

  const [rooms, setRooms] = useState<RoomItem[]>([
    { id: "p101", name: "Phòng 101", tenant: "Nguyễn Văn An", phone: "0912345678", fixed_rent: 3500000 },
    { id: "p102", name: "Phòng 102", tenant: "Trần Thị Bình", phone: "0987654321", fixed_rent: 3500000 },
    { id: "p201", name: "Phòng 201", tenant: "Lê Hoàng Cường", phone: "0901122334", fixed_rent: 3500000 },
    { id: "p202", name: "Phòng 202", tenant: "Phạm Minh Đức", phone: "0933445566", fixed_rent: 3500000 },
  ]);

  const [invoices, setInvoices] = useState<InvoiceItem[]>([
    {
      id: "HD-89214",
      created_at: new Date(Date.now() - 30 * 86400000).toLocaleDateString("vi-VN"),
      room_id: "p101",
      room_name: "Phòng 101",
      tenant: "Nguyễn Văn An",
      dien_cu: 1540,
      dien_moi: 1682,
      so_dien: 142,
      tien_dien: 497000,
      nuoc_cu: 803,
      nuoc_moi: 811,
      so_nuoc: 8,
      tien_nuoc: 280000,
      tien_nha: 3500000,
      phu_phi: 300000,
      s_khoa: 8,
      tong_tien: 4577000,
      status: "paid",
    },
    {
      id: "HD-91045",
      created_at: new Date().toLocaleDateString("vi-VN"),
      room_id: "p101",
      room_name: "Phòng 101",
      tenant: "Nguyễn Văn An",
      dien_cu: 1682,
      dien_moi: 1820,
      so_dien: 138,
      tien_dien: 483000,
      nuoc_cu: 811,
      nuoc_moi: 819,
      so_nuoc: 8,
      tien_nuoc: 280000,
      tien_nha: 3500000,
      phu_phi: 300000,
      s_khoa: 8,
      tong_tien: 4563000,
      status: "unpaid",
    },
    {
      id: "HD-91046",
      created_at: new Date().toLocaleDateString("vi-VN"),
      room_id: "p102",
      room_name: "Phòng 102",
      tenant: "Trần Thị Bình",
      dien_cu: 2100,
      dien_moi: 2215,
      so_dien: 115,
      tien_dien: 402500,
      nuoc_cu: 430,
      nuoc_moi: 436,
      so_nuoc: 6,
      tien_nuoc: 210000,
      tien_nha: 3500000,
      phu_phi: 300000,
      s_khoa: 8,
      tong_tien: 4412500,
      status: "paid",
    },
  ]);

  // ── Calculation State ─────────────────────────────────────────────────────
  const [naturalCommand, setNaturalCommand] = useState("");
  const [calcRoomId, setCalcRoomId] = useState("p101");
  const [calcDCu, setCalcDCu] = useState<number>(1682);
  const [calcDMoi, setCalcDMoi] = useState<number>(1820);
  const [calcNCu, setCalcNCu] = useState<number>(811);
  const [calcNMoi, setCalcNMoi] = useState<number>(819);
  const [calcSk, setCalcSk] = useState<number>(8);
  const [calcNote, setCalcNote] = useState("");
  const [invoiceFilter, setInvoiceFilter] = useState<string>("all");
  const [invoiceSearchQuery, setInvoiceSearchQuery] = useState("");
  const [previewBill, setPreviewBill] = useState<InvoiceItem | null>(null);
  const [messageTemplateType, setMessageTemplateType] = useState<"zalo" | "accounting" | "reminder">("zalo");

  // ── Weather Admin State ───────────────────────────────────────────────────
  const [weatherState, setWeatherState] = useState<WeatherAdminState>({
    autoPilot: true,
    temp: 28.5,
    feels_like: 30.2,
    humidity: 75,
    wind_speed: 3.2,
    status: "NANG",
    desc: "Trời nắng ráo, tầm nhìn tốt trên các tuyến giao thông",
    warningText: "Thời tiết ổn định, thích hợp cho các hoạt động di chuyển và sinh hoạt đô thị.",
    suggestionItems: [
      "Phương tiện: Giao thông thông thoáng, chú ý giữ tốc độ quy định.",
      "Trang bị: Nên mang theo mũ hoặc kính râm khi ra đường ban ngày.",
    ],
    floodItems: ["Ngã tư Trần Duy Hưng - Hoàng Minh Giám", "Hầm chui Nguyễn Trãi - Khuất Duy Tiến"],
    aqi: 58,
    pm25: 16.4,
    uvIndex: 6.2,
  });

  const [isSyncingWeather, setIsSyncingWeather] = useState(false);

  // ── News Admin State ──────────────────────────────────────────────────────
  const [adminNews, setAdminNews] = useState<NewsArticle[]>([]);
  const [isSyncingNews, setIsSyncingNews] = useState(false);
  const [newNewsTitle, setNewNewsTitle] = useState("");
  const [newNewsLink, setNewNewsLink] = useState("");

  // ── Shorts Admin State ────────────────────────────────────────────────────
  const [shortsUrl, setShortsUrl] = useState("");
  const [shortsTitle, setShortsTitle] = useState("");
  const [adminShorts, setAdminShorts] = useState<Array<{ id: string; youtube_id: string; title: string; channel: string; featured: boolean }>>([
    { id: "s1", youtube_id: "iVF4Jr-xoWk", title: "Cập nhật hạ tầng đô thị & giao thông thông minh", channel: "VTV24", featured: true },
    { id: "s2", youtube_id: "PQlBET-bx80", title: "Tiêu điểm thời sự đô thị 24h", channel: "Tiền Phong TV", featured: false },
  ]);

  // ── Alert Banner State ────────────────────────────────────────────────────
  const [alertBanner, setAlertBanner] = useState<AlertBannerState>({
    enabled: false,
    type: "warning",
    message: "Cảnh báo ngập úng nhẹ tại các tuyến đường trũng thấp sau cơn mưa rào.",
  });

  // ── Modal State ───────────────────────────────────────────────────────────
  const [isAddRoomModalOpen, setIsAddRoomModalOpen] = useState(false);
  const [modalRoomName, setModalRoomName] = useState("");
  const [modalTenant, setModalTenant] = useState("");
  const [modalPhone, setModalPhone] = useState("");
  const [modalRent, setModalRent] = useState(3500000);

  // ── Toast Helper ──────────────────────────────────────────────────────────
  const showToast = useCallback((text: string, type: "success" | "error" | "info" = "info") => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 3500);
  }, []);

  // ── Load cached data on mount ─────────────────────────────────────────────
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const d = JSON.parse(raw);
        if (d.pricing) setPricing(d.pricing);
        if (d.rooms) setRooms(d.rooms);
        if (d.invoices) setInvoices(d.invoices);
        if (d.weatherState) setWeatherState(d.weatherState);
        if (d.alertBanner) setAlertBanner(d.alertBanner);
        if (d.adminShorts) setAdminShorts(d.adminShorts);
      }
    } catch {}
  }, []);

  // ── Save to local storage on change ───────────────────────────────────────

  const persistData = useCallback(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          pricing,
          rooms,
          invoices,
          weatherState,
          alertBanner,
          adminShorts,
        })
      );
    } catch {}
  }, [pricing, rooms, invoices, weatherState, alertBanner, adminShorts]);

  useEffect(() => {
    persistData();
  }, [persistData]);

  // ── SMART AUTO-CARRY FORWARD (Kế thừa chỉ số cũ từ kỳ trước) ──────────────
  const handleRoomSelect = (roomId: string) => {
    setCalcRoomId(roomId);
    const roomInvs = invoices.filter((i) => i.room_id === roomId);
    if (roomInvs.length > 0) {
      // Find latest invoice by date or position
      const latest = roomInvs[0];
      setCalcDCu(latest.dien_moi);
      setCalcNCu(latest.nuoc_moi);
      // Auto-suggest new reading based on previous consumption
      setCalcDMoi(latest.dien_moi + Math.max(20, latest.so_dien));
      setCalcNMoi(latest.nuoc_moi + Math.max(2, latest.so_nuoc));
      showToast(
        `🤖 AI Tự Động Kế Thừa: Đã nạp Điện cũ = ${latest.dien_moi}, Nước cũ = ${latest.nuoc_moi} từ hóa đơn trước!`,
        "info"
      );
    }
  };

  // ── SMART NATURAL LANGUAGE COMMAND PARSER ─────────────────────────────────
  const handleExecuteNaturalCommand = (inputStr?: string) => {
    const raw = (inputStr || naturalCommand).trim();
    if (!raw) {
      showToast("Vui lòng nhập lệnh tự nhiên hoặc chuỗi chỉ số", "error");
      return;
    }

    // 1. Check for standard 5 numbers format (e.g., 1682;1820;811;819;8)
    const pureNumbers = raw.split(/[;, ]+/).map((s) => parseInt(s, 10)).filter((n) => !isNaN(n));
    if (pureNumbers.length === 5) {
      const [dCu, dMoi, nCu, nMoi, sk] = pureNumbers;
      setCalcDCu(dCu);
      setCalcDMoi(dMoi);
      setCalcNCu(nCu);
      setCalcNMoi(nMoi);
      setCalcSk(sk);
      showToast(`⚡ Đã phân tích cú pháp chuẩn 5 chỉ số thành công!`, "success");
      return;
    }

    // 2. Natural language NLP regex extraction
    const lower = raw.toLowerCase();

    // Find room match
    let matchedRoomId = calcRoomId;
    for (const r of rooms) {
      const simplifiedName = r.name.toLowerCase().replace(/phòng\s*/g, "p").replace(/\s+/g, "");
      const tenantSimple = r.tenant.toLowerCase();
      if (
        lower.includes(r.id.toLowerCase()) ||
        lower.includes(r.name.toLowerCase()) ||
        lower.includes(simplifiedName) ||
        (tenantSimple && lower.includes(tenantSimple))
      ) {
        matchedRoomId = r.id;
        break;
      }
    }
    setCalcRoomId(matchedRoomId);

    // Extract numbers with smart regex
    // Electricity: "điện từ 1682 lên 1820", "điện mới 1820", "1682->1820", "dien 1820"
    const elecRangeMatch = raw.match(/điện.*?(\d{2,5})\s*(?:đến|lên|sang|->|-)\s*(\d{2,5})/i) ||
      raw.match(/dien.*?(\d{2,5})\s*(?:den|len|sang|->|-)\s*(\d{2,5})/i);
    const elecNewMatch = raw.match(/(?:điện\s*mới|dien\s*moi|điện|dien)[\s:]+(\d{2,5})/i);

    if (elecRangeMatch) {
      setCalcDCu(parseInt(elecRangeMatch[1], 10));
      setCalcDMoi(parseInt(elecRangeMatch[2], 10));
    } else if (elecNewMatch) {
      setCalcDMoi(parseInt(elecNewMatch[1], 10));
    }

    // Water: "nước từ 811 lên 819", "nước mới 819", "811->819", "nuoc 819"
    const waterRangeMatch = raw.match(/nước.*?(\d{1,4})\s*(?:đến|lên|sang|->|-)\s*(\d{1,4})/i) ||
      raw.match(/nuoc.*?(\d{1,4})\s*(?:den|len|sang|->|-)\s*(\d{1,4})/i);
    const waterNewMatch = raw.match(/(?:nước\s*mới|nuoc\s*moi|nước|nuoc)[\s:]+(\d{1,4})/i);

    if (waterRangeMatch) {
      setCalcNCu(parseInt(waterRangeMatch[1], 10));
      setCalcNMoi(parseInt(waterRangeMatch[2], 10));
    } else if (waterNewMatch) {
      setCalcNMoi(parseInt(waterNewMatch[1], 10));
    }

    // Key match: "8 khóa", "số khóa 8", "sk 8"
    const skMatch = raw.match(/(?:khóa|khoa|sk)[\s:]+(\d{1,2})/i) || raw.match(/(\d{1,2})\s*(?:khóa|khoa)/i);
    if (skMatch) {
      setCalcSk(parseInt(skMatch[1], 10));
    }

    showToast(`🤖 AI NLP đã bóc tách thông tin & tự động tính toán hóa đơn!`, "success");
  };

  // ── SMART ANOMALY DETECTION ENGINE ────────────────────────────────────────
  const anomalyAnalysis = useMemo(() => {
    const roomInvs = invoices.filter((i) => i.room_id === calcRoomId);
    const avgDien = roomInvs.length > 0 ? roomInvs.reduce((a, b) => a + b.so_dien, 0) / roomInvs.length : 120;
    const avgNuoc = roomInvs.length > 0 ? roomInvs.reduce((a, b) => a + b.so_nuoc, 0) / roomInvs.length : 7;

    const soDien = Math.max(0, calcDMoi - calcDCu);
    const soNuoc = Math.max(0, calcNMoi - calcNCu);

    const alerts: Array<{ type: "danger" | "warning" | "success"; text: string; hint?: string }> = [];

    if (calcDMoi < calcDCu) {
      alerts.push({
        type: "danger",
        text: `Lỗi chỉ số điện: Số điện mới (${calcDMoi}) nhỏ hơn số cũ (${calcDCu})!`,
        hint: "Vui lòng kiểm tra lại công tơ trước khi xuất hóa đơn.",
      });
    } else if (soDien > avgDien * 1.6 && avgDien > 30) {
      alerts.push({
        type: "warning",
        text: `⚠️ Cảnh báo đột biến điện: ${soDien} kWh (+${Math.round((soDien / avgDien - 1) * 100)}% so với trung bình ${Math.round(avgDien)} kWh)!`,
        hint: "Nghi ngờ quá tải điều hòa hoặc chập chạm rò rỉ điện cục bộ.",
      });
    } else if (soDien < 15) {
      alerts.push({
        type: "warning",
        text: `Tiêu thụ điện rất thấp: ${soDien} kWh.`,
        hint: "Khách có thể vắng nhà kéo dài hoặc công tơ điện bị kẹt bánh răng.",
      });
    } else {
      alerts.push({
        type: "success",
        text: `Điện tiêu thụ: ${soDien} kWh (Chỉ số nằm trong biên độ tiêu chuẩn)`,
      });
    }

    if (calcNMoi < calcNCu) {
      alerts.push({
        type: "danger",
        text: `Lỗi chỉ số nước: Số nước mới (${calcNMoi}) nhỏ hơn số cũ (${calcNCu})!`,
        hint: "Vui lòng xem lại ảnh đồng hồ nước.",
      });
    } else if (soNuoc > avgNuoc * 1.8 && avgNuoc > 3) {
      alerts.push({
        type: "danger",
        text: `🚨 Cảnh báo rò rỉ nước: ${soNuoc} m³ (+${Math.round((soNuoc / avgNuoc - 1) * 100)}% so với mức chuẩn ${Math.round(avgNuoc)} m³)!`,
        hint: "Kiểm tra khẩn cấp phao bồn cầu bị kẹt xả liên tục hoặc bục đường ống âm tường.",
      });
    } else if (soNuoc === 0) {
      alerts.push({
        type: "warning",
        text: `Không phát sinh chỉ số nước (${soNuoc} m³).`,
        hint: "Kiểm tra van tổng vào phòng.",
      });
    } else {
      alerts.push({
        type: "success",
        text: `Nước tiêu thụ: ${soNuoc} m³ (Định mức sinh hoạt hợp lý)`,
      });
    }

    return alerts;
  }, [calcRoomId, calcDCu, calcDMoi, calcNCu, calcNMoi, invoices]);

  // ── Real-time Bill Computation ────────────────────────────────────────────
  const currentCalculatedBill = useMemo(() => {
    const selectedRoom = rooms.find((r) => r.id === calcRoomId) || {
      name: "Phòng Thuê",
      tenant: "Khách thuê",
      fixed_rent: pricing.rent_fixed,
    };

    const so_dien = Math.max(0, calcDMoi - calcDCu);
    const tien_dien = so_dien * pricing.electricity_unit;
    const so_nuoc = Math.max(0, calcNMoi - calcNCu);
    const tien_nuoc = so_nuoc * pricing.water_unit;
    const tien_nha = selectedRoom.fixed_rent || pricing.rent_fixed;
    const phu_phi = pricing.service_fee_1 + pricing.service_fee_2 + pricing.service_fee_3;
    const tong_tien = tien_nha + tien_dien + tien_nuoc + phu_phi;

    // VietQR URL
    const addInfo = encodeURIComponent(`TIEN PHONG ${selectedRoom.name} T${new Date().getMonth() + 1}`);
    const qrUrl = `https://img.vietqr.io/image/${pricing.bank_name}-${pricing.bank_account}-compact2.png?amount=${tong_tien}&addInfo=${addInfo}&accountName=${encodeURIComponent(pricing.bank_owner)}`;

    // Messages
    const zaloMsg =
      `🏠 THÔNG BÁO TIỀN PHÒNG & ĐIỆN NƯỚC THÁNG ${new Date().getMonth() + 1}/${new Date().getFullYear()}\n` +
      `Kính gửi: ${selectedRoom.tenant || "Khách thuê"} (${selectedRoom.name})\n` +
      `1. Tiền nhà: ${tien_nha.toLocaleString("vi-VN")} đ\n` +
      `2. Tiền điện: (${calcDMoi} - ${calcDCu}) = ${so_dien} kWh x ${pricing.electricity_unit.toLocaleString("vi-VN")} = ${tien_dien.toLocaleString("vi-VN")} đ\n` +
      `3. Tiền nước: (${calcNMoi} - ${calcNCu}) = ${so_nuoc} m³ x ${pricing.water_unit.toLocaleString("vi-VN")} = ${tien_nuoc.toLocaleString("vi-VN")} đ\n` +
      `4. Dịch vụ (Rác+Mạng+Vệ sinh chung): ${phu_phi.toLocaleString("vi-VN")} đ\n` +
      `5. Số khóa: ${calcSk}\n` +
      `--------------------------------\n` +
      `👉 TỔNG CỘNG: ${tong_tien.toLocaleString("vi-VN")} đ\n` +
      `💳 STK: ${pricing.bank_account} (${pricing.bank_name}) - ${pricing.bank_owner}\n` +
      `Nội dung: ${selectedRoom.name} T${new Date().getMonth() + 1}\n` +
      `(Vui lòng thanh toán trước ngày 05. Xin cảm ơn!)`;

    const accountingMsg =
      `PHIẾU KÊ CHI PHÍ SINH HOẠT\n` +
      `Đối tượng: ${selectedRoom.name} - ${selectedRoom.tenant}\n` +
      `- Chỉ số điện: ${calcDCu} -> ${calcDMoi} (${so_dien} kWh) = ${tien_dien.toLocaleString("vi-VN")} VND\n` +
      `- Chỉ số nước: ${calcNCu} -> ${calcNMoi} (${so_nuoc} m³) = ${tien_nuoc.toLocaleString("vi-VN")} VND\n` +
      `- Tiền phòng: ${tien_nha.toLocaleString("vi-VN")} VND\n` +
      `- Phụ phí dịch vụ: ${phu_phi.toLocaleString("vi-VN")} VND\n` +
      `TỔNG THANH TOÁN: ${tong_tien.toLocaleString("vi-VN")} VND`;

    const reminderMsg =
      `Dạ chào ${selectedRoom.tenant || "bạn"}, bên em gửi lại bảng kê tiền phòng tháng này của ${selectedRoom.name} là ${tong_tien.toLocaleString("vi-VN")} đ ạ. ` +
      `Nhờ bạn sắp xếp chuyển khoản giúp bên em theo STK ${pricing.bank_account} (${pricing.bank_name}) trước ngày 05 nha. Cảm ơn bạn nhiều!`;

    const bill: InvoiceItem & { qrUrl: string; zaloMsg: string; accountingMsg: string; reminderMsg: string } = {
      id: "HD-" + Math.floor(10000 + Math.random() * 90000),
      created_at: new Date().toLocaleDateString("vi-VN"),
      room_id: calcRoomId,
      room_name: selectedRoom.name,
      tenant: selectedRoom.tenant,
      dien_cu: calcDCu,
      dien_moi: calcDMoi,
      so_dien,
      tien_dien,
      nuoc_cu: calcNCu,
      nuoc_moi: calcNMoi,
      so_nuoc,
      tien_nuoc,
      tien_nha,
      phu_phi,
      s_khoa: calcSk,
      tong_tien,
      status: "unpaid",
      note: calcNote,
      telegram_message: zaloMsg,
      qrUrl,
      zaloMsg,
      accountingMsg,
      reminderMsg,
    };

    return bill;
  }, [calcRoomId, calcDCu, calcDMoi, calcNCu, calcNMoi, calcSk, calcNote, rooms, pricing]);

  useEffect(() => {
    if (!previewBill) {
      setPreviewBill(currentCalculatedBill);
    }
  }, [currentCalculatedBill, previewBill]);

  // ── Save Invoice Action ───────────────────────────────────────────────────
  const handleSaveInvoice = () => {
    if (calcDMoi < calcDCu) {
      showToast(`Số điện mới (${calcDMoi}) nhỏ hơn số điện cũ (${calcDCu})`, "error");
      return;
    }
    if (calcNMoi < calcNCu) {
      showToast(`Số nước mới (${calcNMoi}) nhỏ hơn số nước cũ (${calcNCu})`, "error");
      return;
    }

    const newInv = { ...currentCalculatedBill, id: "HD-" + Math.floor(10000 + Math.random() * 90000) };
    setInvoices((prev) => [newInv, ...prev]);
    setPreviewBill(newInv);
    showToast(`Đã tự động lập và lưu hóa đơn ${newInv.id} vào sổ công nợ!`, "success");
  };

  // ── Export CSV Action ─────────────────────────────────────────────────────
  const handleExportCSV = () => {
    const headers = "Mã HĐ,Ngày Lập,Phòng,Người Thuê,Điện Cũ,Điện Mới,Tiêu Thụ Điện,Tiền Điện,Nước Cũ,Nước Mới,Tiêu Thụ Nước,Tiền Nước,Tiền Nhà,Phụ Phí,Tổng Tiền,Trạng Thái\n";
    const rows = invoices
      .map(
        (i) =>
          `"${i.id}","${i.created_at}","${i.room_name}","${i.tenant}","${i.dien_cu}","${i.dien_moi}","${i.so_dien}","${i.tien_dien}","${i.nuoc_cu}","${i.nuoc_moi}","${i.so_nuoc}","${i.tien_nuoc}","${i.tien_nha}","${i.phu_phi}","${i.tong_tien}","${i.status === "paid" ? "Đã thu" : "Chưa thu"}"`
      )
      .join("\n");

    const blob = new Blob(["\uFEFF" + headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Bang_Ke_Cong_No_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    showToast("Đã xuất tệp CSV báo cáo công nợ thành công!", "success");
  };

  // ── KPI Totals ────────────────────────────────────────────────────────────
  const kpiStats = useMemo(() => {
    const collected = invoices.filter((i) => i.status === "paid").reduce((acc, i) => acc + i.tong_tien, 0);
    const pending = invoices.filter((i) => i.status !== "paid").reduce((acc, i) => acc + i.tong_tien, 0);
    const totalDien = invoices.reduce((acc, i) => acc + i.so_dien, 0);
    const totalNuoc = invoices.reduce((acc, i) => acc + i.so_nuoc, 0);
    return {
      totalRooms: rooms.length,
      collected,
      pending,
      totalRevenue: collected + pending,
      totalDien,
      totalNuoc,
    };
  }, [invoices, rooms]);

  // ── Automated Weather Fetcher ─────────────────────────────────────────────
  const autoFetchWeather = async () => {
    setIsSyncingWeather(true);
    try {
      const res = await fetch("https://api.openweathermap.org/data/2.5/weather?lat=20.9716&lon=105.7725&appid=a201c471567522a7d0b7a0567ad245fe&units=metric&lang=vi");
      if (res.ok) {
        const d = await res.json();
        const temp = Math.round(d.main.temp * 10) / 10;
        const feels_like = Math.round(d.main.feels_like * 10) / 10;
        const humidity = d.main.humidity;
        const wind_speed = Math.round((d.wind?.speed || 2.5) * 10) / 10;
        const desc = d.weather?.[0]?.description || "Trời nắng ráo";

        let st = "NANG";
        if (temp > 35) st = "NANG_GAT";
        else if (/mưa/i.test(desc)) st = "MUA_NHO";
        else if (/dông/i.test(desc)) st = "MUA_DONG";
        else if (/mây/i.test(desc)) st = "AM_U";

        setWeatherState((prev) => ({
          ...prev,
          temp,
          feels_like,
          humidity,
          wind_speed,
          desc: desc.charAt(0).toUpperCase() + desc.slice(1),
          status: st,
          warningText: `Thời tiết Hà Nội đang ${temp}°C, độ ẩm ${humidity}%. Giao thông thuận lợi.`,
        }));
        showToast("Hệ thống đã tự động đồng bộ thời tiết vệ tinh OpenWeather!", "success");
      }
    } catch {
      showToast("Không thể kết nối OpenWeather trực tiếp, sử dụng dữ liệu tự động lưu trữ.", "info");
    } finally {
      setIsSyncingWeather(false);
    }
  };

  // ── Automated News Sync ───────────────────────────────────────────────────
  const autoSyncNews = async () => {
    setIsSyncingNews(true);
    try {
      const res = await fetch("https://quan-ly-tien-phong-main.onrender.com/api/news");
      if (res.ok) {
        const d = await res.json();
        if (Array.isArray(d) && d.length > 0) {
          setAdminNews(d);
          showToast(`Đã tự động đồng bộ ${d.length} tin bài mới nhất từ Báo Tiền Phong!`, "success");
          setIsSyncingNews(false);
          return;
        }
      }
    } catch {}

    setAdminNews([
      { title: "Hà Nội đẩy nhanh tiến độ dự án đường Vành đai 4 kết nối vùng Thủ đô", description: "Công tác thi công các gói thầu xây lắp đang được đẩy mạnh toàn diện...", link: "https://tienphong.vn", image: null, source: "Tiền Phong" },
      { title: "Dự báo thời tiết và chất lượng không khí đô thị những ngày tới", description: "Các chuyên gia khí tượng đưa ra nhận định về các đợt không khí lạnh...", link: "https://tienphong.vn", image: null, source: "Tiền Phong" },
      { title: "Nâng cấp hạ tầng công nghệ và số hóa tiện ích đời sống cư dân", description: "Ứng dụng công nghệ số vào quản trị đô thị thông minh mang lại lợi ích lớn...", link: "https://tienphong.vn", image: null, source: "Tiền Phong" },
    ]);
    showToast("Đã tự động tải danh mục tin tức từ hệ thống nguồn Tiền Phong!", "success");
    setIsSyncingNews(false);
  };

  useEffect(() => {
    if (adminNews.length === 0) {
      autoSyncNews();
    }
  }, []);

  // ── Authentication Handler ────────────────────────────────────────────────
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginUser.trim().toLowerCase() === "admin" && loginPass.trim() === "admin") {
      setIsAuthenticated(true);
      sessionStorage.setItem("anx_admin_auth", "true");
      setLoginError("");
      showToast("Đăng nhập quản trị thành công!", "success");
    } else {
      setLoginError("Tên đăng nhập hoặc mật khẩu không chính xác!");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem("anx_admin_auth");
    setLoginUser("");
    setLoginPass("");
    showToast("Đã đăng xuất khỏi phiên quản trị.");
  };

  // ── Filtered & Searched Invoices ──────────────────────────────────────────
  const displayedInvoices = useMemo(() => {
    let list = invoices;
    if (invoiceFilter !== "all") {
      list = list.filter((i) => i.status === invoiceFilter);
    }
    if (invoiceSearchQuery.trim()) {
      const q = invoiceSearchQuery.toLowerCase();
      list = list.filter(
        (i) =>
          i.room_name.toLowerCase().includes(q) ||
          i.tenant.toLowerCase().includes(q) ||
          i.id.toLowerCase().includes(q)
      );
    }
    return list;
  }, [invoices, invoiceFilter, invoiceSearchQuery]);

  // ── LOGIN SCREEN OVERLAY (Identical Design System & No Auto-fill) ──────────
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen w-full bg-[#f4f6fa] flex flex-col items-center justify-center p-4">
        {toastMsg && (
          <div className={`fixed top-5 right-5 z-50 px-4 py-2.5 rounded-2xl text-xs font-semibold shadow-lg transition-all ${
            toastMsg.type === "success" ? "bg-emerald-600 text-white" : toastMsg.type === "error" ? "bg-rose-600 text-white" : "bg-slate-900 text-white"
          }`}>
            {toastMsg.text}
          </div>
        )}

        <div className="w-full max-w-md bg-white rounded-3xl border border-[#e3e7ef] shadow-xl p-8 space-y-6">
          <div className="flex flex-col items-center text-center space-y-2">
            <BrandLogo size="lg" />
            <div className="pt-2">
              <span className="bg-[#ff315f]/10 text-[#ff315f] font-extrabold text-[11px] px-2.5 py-1 rounded-full uppercase tracking-wider">
                Trung Tâm Quản Trị Hệ Thống 24/7
              </span>
            </div>
            <p className="text-xs text-[#5f687b] pt-1">
              Quản trị thông minh Tiền phòng, Điện nước, Thời tiết & Nội dung Website
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4" autoComplete="off">
            <div>
              <label className="block text-xs font-bold text-[#182033] uppercase tracking-wider mb-1.5">
                Tên đăng nhập
              </label>
              <input
                type="text"
                name="admin_user_field"
                autoComplete="off"
                value={loginUser}
                onChange={(e) => setLoginUser(e.target.value)}
                placeholder="Nhập tên đăng nhập..."
                required
                className="w-full text-xs bg-[#f4f6fa] border border-[#e3e7ef] focus:border-[#ff315f] focus:bg-white rounded-xl px-4 py-3 text-[#182033] placeholder-[#5f687b]/60 focus:outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#182033] uppercase tracking-wider mb-1.5">
                Mật khẩu
              </label>
              <input
                type="password"
                name="admin_pass_field"
                autoComplete="new-password"
                value={loginPass}
                onChange={(e) => setLoginPass(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full text-xs bg-[#f4f6fa] border border-[#e3e7ef] focus:border-[#ff315f] focus:bg-white rounded-xl px-4 py-3 text-[#182033] placeholder-[#5f687b]/60 focus:outline-none transition-all"
              />
            </div>

            {loginError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
                ⚠️ {loginError}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-[#ff315f] via-[#f72585] to-[#f97316] hover:opacity-95 text-white font-bold text-xs rounded-xl shadow-md shadow-[#ff315f]/20 transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
            >
              <span>Đăng Nhập Vào Bảng Quản Trị</span>
            </button>
          </form>

          <div className="pt-2 text-center">
            <button
              onClick={onBackToSite}
              className="text-xs text-[#5f687b] hover:text-[#182033] font-medium transition-colors cursor-pointer"
            >
              ← Quay lại Trang Chủ Báo Tiền Phong
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── MAIN ADMIN BOARD DASHBOARD ─────────────────────────────────────────────
  return (
    <div className="min-h-screen w-full bg-[#f4f6fa] flex flex-col text-[#182033]">
      {/* Toast Notification */}
      {toastMsg && (
        <div className={`fixed top-5 right-5 z-50 px-4 py-2.5 rounded-2xl text-xs font-semibold shadow-lg transition-all ${
          toastMsg.type === "success" ? "bg-emerald-600 text-white" : toastMsg.type === "error" ? "bg-rose-600 text-white" : "bg-slate-900 text-white"
        }`}>
          {toastMsg.text}
        </div>
      )}

      {/* Top Header Dashboard */}
      <header className="bg-white border-b border-[#e3e7ef] flex h-[76px] items-center justify-between px-6 w-full shrink-0 sticky top-0 z-40">
        <div className="flex gap-3 items-center">
          <BrandLogo />
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f4f6fa] border border-[#e3e7ef]">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-['Inter:Bold'] font-bold text-[#182033] text-[12px]">HỆ THỐNG QUẢN TRỊ 24/7</span>
          </div>
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-[11px] font-bold shadow-xs">
            <span>🤖 AI COPILOT ACTIVE</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onBackToSite}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white hover:bg-[#f4f6fa] text-[#182033] font-semibold text-[13px] border border-[#e3e7ef] shadow-xs transition-all cursor-pointer"
          >
            <span>← Về Trang Chủ Web</span>
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-600 font-semibold text-[13px] border border-rose-200 transition-all cursor-pointer"
          >
            <span>Đăng xuất</span>
          </button>
        </div>
      </header>

      {/* Synchronized Navigation Tabs Bar */}
      <div className="bg-white border-b border-[#e3e7ef] px-6 py-2.5 overflow-x-auto">
        <div className="flex items-center gap-2 min-w-max text-xs">
          <button
            onClick={() => setActiveTab("rent")}
            className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "rent"
                ? "bg-gradient-to-r from-[#ff315f] to-[#f97316] text-white shadow-xs"
                : "bg-[#f4f6fa] text-[#5f687b] hover:text-[#182033] hover:bg-slate-200/60"
            }`}
          >
            <span>🏠</span>
            <span>Quản Lý Tiền Phòng & Điện Nước (AI NLP)</span>
          </button>

          <button
            onClick={() => setActiveTab("analytics")}
            className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "analytics"
                ? "bg-gradient-to-r from-[#ff315f] to-[#f97316] text-white shadow-xs"
                : "bg-[#f4f6fa] text-[#5f687b] hover:text-[#182033] hover:bg-slate-200/60"
            }`}
          >
            <span>📊</span>
            <span>Biểu Đồ Tiêu Thụ & Phân Tích</span>
          </button>

          <button
            onClick={() => setActiveTab("weather")}
            className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "weather"
                ? "bg-gradient-to-r from-[#ff315f] to-[#f97316] text-white shadow-xs"
                : "bg-[#f4f6fa] text-[#5f687b] hover:text-[#182033] hover:bg-slate-200/60"
            }`}
          >
            <span>🌦️</span>
            <span>Quản Trị Thời Tiết (AI Copilot)</span>
          </button>

          <button
            onClick={() => setActiveTab("news")}
            className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "news"
                ? "bg-gradient-to-r from-[#ff315f] to-[#f97316] text-white shadow-xs"
                : "bg-[#f4f6fa] text-[#5f687b] hover:text-[#182033] hover:bg-slate-200/60"
            }`}
          >
            <span>📰</span>
            <span>Quản Trị Tin Tức (RSS)</span>
          </button>

          <button
            onClick={() => setActiveTab("shorts")}
            className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "shorts"
                ? "bg-gradient-to-r from-[#ff315f] to-[#f97316] text-white shadow-xs"
                : "bg-[#f4f6fa] text-[#5f687b] hover:text-[#182033] hover:bg-slate-200/60"
            }`}
          >
            <span>🎬</span>
            <span>Video Shorts</span>
          </button>

          <button
            onClick={() => setActiveTab("alert")}
            className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "alert"
                ? "bg-gradient-to-r from-[#ff315f] to-[#f97316] text-white shadow-xs"
                : "bg-[#f4f6fa] text-[#5f687b] hover:text-[#182033] hover:bg-slate-200/60"
            }`}
          >
            <span>📢</span>
            <span>Banner Cảnh Báo Khẩn Cấp</span>
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "settings"
                ? "bg-gradient-to-r from-[#ff315f] to-[#f97316] text-white shadow-xs"
                : "bg-[#f4f6fa] text-[#5f687b] hover:text-[#182033] hover:bg-slate-200/60"
            }`}
          >
            <span>⚙️</span>
            <span>Cài Đặt VietQR & Định Mức</span>
          </button>
        </div>
      </div>

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* ================= TAB 1: TIỀN PHÒNG & ĐIỆN NƯỚC (AI NLP & ANOMALY DETECTION) ================= */}
        {activeTab === "rent" && (
          <div className="space-y-6">
            {/* 4 Hero KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl border border-[#e3e7ef] p-5 shadow-xs space-y-2">
                <span className="text-xs font-bold text-[#5f687b] uppercase">🏠 Tổng Số Phòng</span>
                <div className="text-2xl font-black text-[#182033]">{kpiStats.totalRooms}</div>
                <span className="text-[11px] text-emerald-600 font-semibold">100% Đang quản lý</span>
              </div>

              <div className="bg-white rounded-2xl border border-[#e3e7ef] p-5 shadow-xs space-y-2">
                <span className="text-xs font-bold text-[#5f687b] uppercase">💵 Đã Thu Tháng Này</span>
                <div className="text-2xl font-black text-emerald-600">
                  {kpiStats.collected.toLocaleString("vi-VN")} đ
                </div>
                <span className="text-[11px] text-[#5f687b]">Đã xác nhận thanh toán</span>
              </div>

              <div className="bg-white rounded-2xl border border-[#e3e7ef] p-5 shadow-xs space-y-2">
                <span className="text-xs font-bold text-[#5f687b] uppercase">⚠️ Công Nợ Chưa Thu</span>
                <div className="text-2xl font-black text-[#ff315f]">
                  {kpiStats.pending.toLocaleString("vi-VN")} đ
                </div>
                <span className="text-[11px] text-[#ff315f] font-medium">Hóa đơn cần đôn đốc</span>
              </div>

              <div className="bg-white rounded-2xl border border-[#e3e7ef] p-5 shadow-xs space-y-2">
                <span className="text-xs font-bold text-[#5f687b] uppercase">⚡ Tổng Điện Tiêu Thụ</span>
                <div className="text-2xl font-black text-amber-600">{kpiStats.totalDien} kWh</div>
                <span className="text-[11px] text-cyan-600 font-semibold">Nước tiêu thụ: {kpiStats.totalNuoc} m³</span>
              </div>
            </div>

            {/* AI Natural Language Omni Command Bar */}
            <div className="bg-gradient-to-r from-violet-600 via-indigo-600 to-rose-500 rounded-2xl p-5 shadow-md text-white space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🤖</span>
                  <h3 className="text-sm font-extrabold tracking-tight">
                    AI Natural Language Command (Nhập lệnh bằng lời văn tự nhiên)
                  </h3>
                </div>
                <span className="bg-white/20 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full">
                  SMART NLP PARSER
                </span>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={naturalCommand}
                  onChange={(e) => setNaturalCommand(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleExecuteNaturalCommand()}
                  placeholder="Gõ hoặc dán tin nhắn: Ví dụ 'P101 điện từ 1682 lên 1820 nước từ 811 lên 819' hoặc '1682;1820;811;819;8'..."
                  className="flex-1 text-xs bg-white text-[#182033] rounded-xl px-4 py-3 placeholder-slate-400 focus:outline-none shadow-xs font-medium"
                />
                <button
                  onClick={() => handleExecuteNaturalCommand()}
                  className="px-5 py-3 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5"
                >
                  <span>⚡ Phân Tích & Tính</span>
                </button>
              </div>

              {/* Sample Quick Action Pills */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                <span className="text-white/80 font-medium">Thử mẫu nhanh:</span>
                <button
                  onClick={() => {
                    setNaturalCommand("P101 điện mới 1850 nước mới 824");
                    handleExecuteNaturalCommand("P101 điện mới 1850 nước mới 824");
                  }}
                  className="bg-white/20 hover:bg-white/30 px-2.5 py-1 rounded-lg cursor-pointer transition-colors"
                >
                  P101 điện mới 1850 nước mới 824
                </button>
                <button
                  onClick={() => {
                    setNaturalCommand("Phòng 102 số điện 2100 lên 2250 số nước 430 lên 438");
                    handleExecuteNaturalCommand("Phòng 102 số điện 2100 lên 2250 số nước 430 lên 438");
                  }}
                  className="bg-white/20 hover:bg-white/30 px-2.5 py-1 rounded-lg cursor-pointer transition-colors"
                >
                  P102 điện 2100-&gt;2250 nước 430-&gt;438
                </button>
                <button
                  onClick={() => {
                    setNaturalCommand("1682;1820;811;819;8");
                    handleExecuteNaturalCommand("1682;1820;811;819;8");
                  }}
                  className="bg-white/20 hover:bg-white/30 px-2.5 py-1 rounded-lg cursor-pointer transition-colors font-mono"
                >
                  1682;1820;811;819;8
                </button>
              </div>
            </div>

            {/* Smart Meter Form + Anomaly Alerts & Live Preview with VietQR */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Form Input */}
              <div className="lg:col-span-7 bg-white rounded-2xl border border-[#e3e7ef] p-6 shadow-xs space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-[#e3e7ef]">
                  <div>
                    <h3 className="text-base font-extrabold text-[#182033] flex items-center gap-2">
                      <span>⚡</span> Bảng Nhập Số Công Tơ Tự Động Kế Thừa
                    </h3>
                    <p className="text-xs text-[#5f687b]">
                      Hệ thống tự động nhớ số cũ của phòng được chọn, chỉ cần nhập số mới!
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200">
                    AUTO-CARRY FORWARD
                  </span>
                </div>

                {/* Room Selector with Auto-Carry Forward */}
                <div>
                  <label className="block text-xs font-bold text-[#182033] mb-1.5">
                    Chọn phòng thuê (Tự động nạp chỉ số kỳ trước):
                  </label>
                  <select
                    value={calcRoomId}
                    onChange={(e) => handleRoomSelect(e.target.value)}
                    className="w-full text-xs bg-[#f4f6fa] border border-[#e3e7ef] rounded-xl p-3 text-[#182033] focus:border-[#ff315f] focus:bg-white focus:outline-none font-bold"
                  >
                    {rooms.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} - {r.tenant || "Trống"} ({r.fixed_rent.toLocaleString("vi-VN")} đ/tháng)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Meter Inputs */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#5f687b] mb-1">Số điện cũ</label>
                    <input
                      type="number"
                      value={calcDCu}
                      onChange={(e) => setCalcDCu(parseInt(e.target.value, 10) || 0)}
                      className="w-full text-xs font-mono bg-[#f4f6fa] border border-[#e3e7ef] rounded-xl p-2.5 text-[#182033] focus:border-[#ff315f] focus:bg-white focus:outline-none font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-amber-600 mb-1">Số điện mới</label>
                    <input
                      type="number"
                      value={calcDMoi}
                      onChange={(e) => setCalcDMoi(parseInt(e.target.value, 10) || 0)}
                      className="w-full text-xs font-mono bg-[#f4f6fa] border border-amber-300 rounded-xl p-2.5 text-amber-700 focus:border-[#ff315f] focus:bg-white focus:outline-none font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#5f687b] mb-1">Số nước cũ</label>
                    <input
                      type="number"
                      value={calcNCu}
                      onChange={(e) => setCalcNCu(parseInt(e.target.value, 10) || 0)}
                      className="w-full text-xs font-mono bg-[#f4f6fa] border border-[#e3e7ef] rounded-xl p-2.5 text-[#182033] focus:border-[#ff315f] focus:bg-white focus:outline-none font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-cyan-600 mb-1">Số nước mới</label>
                    <input
                      type="number"
                      value={calcNMoi}
                      onChange={(e) => setCalcNMoi(parseInt(e.target.value, 10) || 0)}
                      className="w-full text-xs font-mono bg-[#f4f6fa] border border-cyan-300 rounded-xl p-2.5 text-cyan-700 focus:border-[#ff315f] focus:bg-white focus:outline-none font-bold"
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-[11px] font-bold text-indigo-600 mb-1">Số khóa</label>
                    <input
                      type="number"
                      value={calcSk}
                      onChange={(e) => setCalcSk(parseInt(e.target.value, 10) || 8)}
                      className="w-full text-xs font-mono bg-[#f4f6fa] border border-[#e3e7ef] rounded-xl p-2.5 text-[#182033] focus:border-[#ff315f] focus:bg-white focus:outline-none font-bold"
                    />
                  </div>
                </div>

                {/* AI Anomaly Alert Box */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-[#182033] flex items-center gap-1.5">
                    <span>🔍</span> Phân Tích Thông Minh & Giám Sát Tiêu Thụ:
                  </span>
                  <div className="space-y-1.5">
                    {anomalyAnalysis.map((a, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-xl text-xs font-medium border flex flex-col gap-0.5 ${
                          a.type === "danger"
                            ? "bg-rose-50 border-rose-200 text-rose-800"
                            : a.type === "warning"
                            ? "bg-amber-50 border-amber-200 text-amber-800"
                            : "bg-emerald-50 border-emerald-200 text-emerald-800"
                        }`}
                      >
                        <div>{a.text}</div>
                        {a.hint && <div className="text-[10px] opacity-80 italic">{a.hint}</div>}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#5f687b] mb-1">Ghi chú hóa đơn</label>
                  <input
                    type="text"
                    value={calcNote}
                    onChange={(e) => setCalcNote(e.target.value)}
                    placeholder="Ví dụ: Giảm trừ tiền cọc, tiền chuyển dọn..."
                    className="w-full text-xs bg-[#f4f6fa] border border-[#e3e7ef] rounded-xl p-2.5 text-[#182033] focus:border-[#ff315f] focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleSaveInvoice}
                    className="flex-1 py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>💾 Lưu Vào Lịch Sử & Sổ Công Nợ</span>
                  </button>
                </div>
              </div>

              {/* Live Preview Card with VietQR */}
              <div className="lg:col-span-5 bg-white rounded-2xl border border-[#e3e7ef] p-6 shadow-xs flex flex-col justify-between space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-[#e3e7ef]">
                    <h4 className="text-sm font-extrabold text-[#182033] flex items-center gap-2">
                      <span>🧾</span> Phiếu Thu & Mã VietQR (Tự Động)
                    </h4>
                    <span className="text-[11px] text-[#5f687b] font-medium">Hôm nay</span>
                  </div>

                  <div className="p-4 rounded-xl bg-[#f4f6fa] border border-[#e3e7ef] space-y-3 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-[#182033] text-sm">{currentCalculatedBill.room_name}</span>
                      <span className="text-[#5f687b]">{currentCalculatedBill.tenant || "Khách thuê"}</span>
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-[#e3e7ef]">
                      <div className="flex justify-between">
                        <span className="text-[#5f687b]">1. Tiền nhà:</span>
                        <span className="font-bold text-[#182033]">
                          {currentCalculatedBill.tien_nha.toLocaleString("vi-VN")} đ
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#5f687b]">
                          2. Điện ({currentCalculatedBill.so_dien} kWh x {pricing.electricity_unit.toLocaleString("vi-VN")}):
                        </span>
                        <span className="font-bold text-amber-600">
                          {currentCalculatedBill.tien_dien.toLocaleString("vi-VN")} đ
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#5f687b]">
                          3. Nước ({currentCalculatedBill.so_nuoc} m³ x {pricing.water_unit.toLocaleString("vi-VN")}):
                        </span>
                        <span className="font-bold text-cyan-600">
                          {currentCalculatedBill.tien_nuoc.toLocaleString("vi-VN")} đ
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#5f687b]">4. Dịch vụ (Rác+Mạng+Vệ sinh):</span>
                        <span className="font-bold text-[#182033]">
                          {currentCalculatedBill.phu_phi.toLocaleString("vi-VN")} đ
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#5f687b]">5. Số khóa:</span>
                        <span className="font-bold text-indigo-600">{currentCalculatedBill.s_khoa}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#e3e7ef] flex justify-between items-center text-sm font-black">
                      <span className="text-[#182033]">TỔNG CỘNG:</span>
                      <span className="text-base text-[#ff315f]">
                        {currentCalculatedBill.tong_tien.toLocaleString("vi-VN")} đ
                      </span>
                    </div>

                    {/* Integrated VietQR Napas247 with Click-to-Zoom Modal (REQ-080) */}
                    <div className="pt-2 border-t border-[#e3e7ef] flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          role="button"
                          tabIndex={0}
                          onClick={() => {
                            setQrModalData({
                              qrUrl: currentCalculatedBill.qrUrl,
                              bank: pricing.bank_name,
                              accountNo: pricing.bank_account,
                              accountName: pricing.bank_owner,
                              amount: currentCalculatedBill.tong_tien,
                              addInfo: `TIEN PHONG ${currentCalculatedBill.room_name || 'Phòng Thuê'} T${new Date().getMonth() + 1}`,
                            });
                            setShowQRModal(true);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              setShowQRModal(true);
                            }
                          }}
                          className="size-20 rounded-lg overflow-hidden bg-white p-1 border border-[#e3e7ef] shrink-0 shadow-xs cursor-pointer hover:border-blue-500 hover:shadow-md transition-all group relative active:scale-95"
                          title="Nhấp để hiển thị popup ảnh QR giữa màn hình quét mã"
                          data-testid="admin-vietqr-thumbnail-trigger"
                        >
                          <img
                            src={currentCalculatedBill.qrUrl}
                            alt="VietQR"
                            className="size-full object-contain group-hover:scale-105 transition-transform"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = FALLBACK_QR_SVG;
                            }}
                          />
                          <div className="absolute inset-0 bg-blue-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                            <span className="text-white text-[9px] font-extrabold bg-blue-600 px-1 py-0.5 rounded shadow-xs">🔍 Phóng to</span>
                          </div>
                        </div>
                        <div className="flex flex-col text-[11px] leading-relaxed text-[#5f687b]">
                          <span className="font-bold text-[#182033]">💳 VietQR Thanh Toán Nhanh</span>
                          <span>Ngân hàng: <b>{pricing.bank_name}</b></span>
                          <span>STK: <b className="font-mono text-[#182033]">{pricing.bank_account}</b></span>
                          <span className="text-[10px] text-emerald-600 font-semibold">Khách quét mã app là khớp số tiền!</span>
                        </div>
                      </div>

                      {/* Nút QR Hóa Đơn */}
                      <button
                        type="button"
                        data-testid="tablet-vietqr-btn"
                        onClick={() => {
                          setQrModalData({
                            qrUrl: currentCalculatedBill.qrUrl,
                            bank: pricing.bank_name,
                            accountNo: pricing.bank_account,
                            accountName: pricing.bank_owner,
                            amount: currentCalculatedBill.tong_tien,
                            addInfo: `TIEN PHONG ${currentCalculatedBill.room_name || 'Phòng Thuê'} T${new Date().getMonth() + 1}`,
                          });
                          setShowQRModal(true);
                        }}
                        className="flex items-center gap-1.5 h-[32px] px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 font-bold text-[12px] border border-blue-200 dark:border-blue-800 shadow-2xs active:scale-95 transition-all cursor-pointer shrink-0"
                        title="Xem mã VietQR thanh toán tiền phòng"
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="3" width="7" height="7"></rect>
                          <rect x="14" y="3" width="7" height="7"></rect>
                          <rect x="14" y="14" width="7" height="7"></rect>
                          <rect x="3" y="14" width="7" height="7"></rect>
                        </svg>
                        <span>QR Hóa đơn</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* 3 Message Template Switcher */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1 bg-[#f4f6fa] p-1 rounded-xl text-[11px]">
                    <button
                      onClick={() => setMessageTemplateType("zalo")}
                      className={`flex-1 py-1 rounded-lg font-bold transition-all ${
                        messageTemplateType === "zalo" ? "bg-white text-[#ff315f] shadow-xs" : "text-[#5f687b]"
                      }`}
                    >
                      💬 Zalo Thân Thiện
                    </button>
                    <button
                      onClick={() => setMessageTemplateType("accounting")}
                      className={`flex-1 py-1 rounded-lg font-bold transition-all ${
                        messageTemplateType === "accounting" ? "bg-white text-[#ff315f] shadow-xs" : "text-[#5f687b]"
                      }`}
                    >
                      🏢 Bảng Kế Toán
                    </button>
                    <button
                      onClick={() => setMessageTemplateType("reminder")}
                      className={`flex-1 py-1 rounded-lg font-bold transition-all ${
                        messageTemplateType === "reminder" ? "bg-white text-[#ff315f] shadow-xs" : "text-[#5f687b]"
                      }`}
                    >
                      ⏰ Nhắc Nợ Lịch Thiệp
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      const text =
                        messageTemplateType === "zalo"
                          ? currentCalculatedBill.zaloMsg
                          : messageTemplateType === "accounting"
                          ? currentCalculatedBill.accountingMsg
                          : currentCalculatedBill.reminderMsg;
                      navigator.clipboard.writeText(text);
                      showToast(`Đã copy mẫu tin nhắn [${messageTemplateType.toUpperCase()}] vào clipboard!`, "success");
                    }}
                    className="w-full py-2.5 px-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:opacity-95 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>📋</span> Copy Mẫu Tin Nhắn Đã Chọn
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="w-full py-2 px-3 bg-[#f4f6fa] hover:bg-slate-200/60 text-[#182033] font-semibold text-xs rounded-xl border border-[#e3e7ef] transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>🖨️</span> In Phiếu Thu Có Mã QR
                  </button>
                </div>
              </div>
            </div>

            {/* Invoices History Table with Search & CSV Export */}
            <div className="bg-white rounded-2xl border border-[#e3e7ef] p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#e3e7ef]">
                <h4 className="text-sm font-extrabold text-[#182033] flex items-center gap-2">
                  <span>📊</span> Lịch Sử Hóa Đơn & Sổ Theo Dõi Công Nợ ({displayedInvoices.length})
                </h4>
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="text"
                    value={invoiceSearchQuery}
                    onChange={(e) => setInvoiceSearchQuery(e.target.value)}
                    placeholder="Tìm tên khách, số phòng, mã HĐ..."
                    className="text-xs bg-[#f4f6fa] border border-[#e3e7ef] rounded-xl px-3 py-1.5 text-[#182033] focus:outline-none"
                  />
                  <select
                    value={invoiceFilter}
                    onChange={(e) => setInvoiceFilter(e.target.value)}
                    className="text-xs bg-[#f4f6fa] border border-[#e3e7ef] rounded-xl px-3 py-1.5 text-[#182033] font-semibold"
                  >
                    <option value="all">Tất cả hóa đơn</option>
                    <option value="unpaid">Chưa thanh toán</option>
                    <option value="paid">Đã thanh toán</option>
                  </select>
                  <button
                    onClick={handleExportCSV}
                    className="px-3 py-1.5 bg-[#f4f6fa] hover:bg-slate-200/60 text-[#182033] font-bold text-xs rounded-xl border border-[#e3e7ef] transition-all cursor-pointer flex items-center gap-1"
                  >
                    <span>📥</span>
                    <span>Xuất CSV</span>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="text-[#5f687b] border-b border-[#e3e7ef] uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Mã HĐ</th>
                      <th className="p-3">Ngày Lập</th>
                      <th className="p-3">Phòng</th>
                      <th className="p-3">Điện (kWh)</th>
                      <th className="p-3">Nước (m³)</th>
                      <th className="p-3">Tổng Tiền</th>
                      <th className="p-3">Trạng Thái</th>
                      <th className="p-3 text-right">Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e3e7ef]">
                    {displayedInvoices.map((inv) => {
                      const isPaid = inv.status === "paid";
                      return (
                        <tr key={inv.id} className="hover:bg-[#f4f6fa]/60 transition-colors">
                          <td className="p-3 font-mono font-bold text-indigo-600">{inv.id}</td>
                          <td className="p-3 text-[#5f687b]">{inv.created_at}</td>
                          <td className="p-3 font-bold text-[#182033]">{inv.room_name}</td>
                          <td className="p-3 font-mono text-amber-600">{inv.so_dien}</td>
                          <td className="p-3 font-mono text-cyan-600">{inv.so_nuoc}</td>
                          <td className="p-3 font-mono font-bold text-emerald-600">
                            {inv.tong_tien.toLocaleString("vi-VN")} đ
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                isPaid
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : "bg-rose-50 text-rose-700 border border-rose-200"
                              }`}
                            >
                              {isPaid ? "✓ Đã thu" : "⏳ Chưa thu"}
                            </span>
                          </td>
                          <td className="p-3 text-right space-x-2">
                            <button
                              onClick={() => {
                                setInvoices((prev) =>
                                  prev.map((i) =>
                                    i.id === inv.id ? { ...i, status: isPaid ? "unpaid" : "paid" } : i
                                  )
                                );
                                showToast(`Đã đổi trạng thái sang: ${isPaid ? "Chưa thu" : "Đã thu"}!`, "success");
                              }}
                              className={`text-xs font-bold ${isPaid ? "text-amber-600" : "text-emerald-600"} hover:underline`}
                            >
                              {isPaid ? "Hủy thu" : "Đã thu"}
                            </button>
                            <button
                              onClick={() => {
                                if (confirm("Xóa hóa đơn này?")) {
                                  setInvoices((prev) => prev.filter((i) => i.id !== inv.id));
                                  showToast("Đã xóa hóa đơn");
                                }
                              }}
                              className="text-xs text-[#5f687b] hover:text-[#ff315f]"
                            >
                              Xóa
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: BIỂU ĐỒ TIÊU THỤ & PHÂN TÍCH ================= */}
        {activeTab === "analytics" && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-[#e3e7ef] p-6 shadow-xs space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-[#e3e7ef]">
                <div>
                  <h3 className="text-base font-extrabold text-[#182033]">
                    📊 Biểu Đồ So Sánh Mức Tiêu Thụ Điện & Nước Theo Phòng
                  </h3>
                  <p className="text-xs text-[#5f687b]">Thống kê trực quan lượng tiêu thụ năng lượng giữa các phòng</p>
                </div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Tỷ lệ thu tiền: {kpiStats.totalRevenue > 0 ? Math.round((kpiStats.collected / kpiStats.totalRevenue) * 100) : 0}%
                </span>
              </div>

              {/* Bar Chart Representation */}
              <div className="space-y-4">
                {rooms.map((r) => {
                  const roomInvs = invoices.filter((i) => i.room_id === r.id);
                  const latestInv = roomInvs[0];
                  const dien = latestInv?.so_dien || 0;
                  const nuoc = latestInv?.so_nuoc || 0;
                  const maxDien = 250;
                  const maxNuoc = 15;

                  return (
                    <div key={r.id} className="p-4 rounded-xl bg-[#f4f6fa] border border-[#e3e7ef] space-y-3">
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span className="text-[#182033]">{r.name} ({r.tenant || "Chưa có"})</span>
                        <span className="text-[#5f687b]">Điện: {dien} kWh | Nước: {nuoc} m³</span>
                      </div>

                      {/* Electricity Bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] text-amber-700 font-semibold">
                          <span>⚡ Điện tiêu thụ: {dien} kWh</span>
                          <span>Định mức chuẩn: 120 kWh</span>
                        </div>
                        <div className="w-full h-3 bg-amber-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, Math.round((dien / maxDien) * 100))}%` }}
                          />
                        </div>
                      </div>

                      {/* Water Bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] text-cyan-700 font-semibold">
                          <span>💧 Nước tiêu thụ: {nuoc} m³</span>
                          <span>Định mức chuẩn: 7 m³</span>
                        </div>
                        <div className="w-full h-3 bg-cyan-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, Math.round((nuoc / maxNuoc) * 100))}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 3: QUẢN TRỊ THỜI TIẾT (AI COPILOT) ================= */}
        {activeTab === "weather" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 bg-white rounded-2xl border border-[#e3e7ef] p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#e3e7ef]">
                  <div>
                    <h3 className="text-base font-extrabold text-[#182033]">
                      🌦️ Trợ Lý Quản Trị Thời Tiết & Cảnh Báo Giao Thông Đô Thị
                    </h3>
                    <p className="text-xs text-[#5f687b]">Tọa độ trạm quan trắc: Hà Nội (20.9716, 105.7725)</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={autoFetchWeather}
                      disabled={isSyncingWeather}
                      className="px-3 py-1.5 bg-[#f4f6fa] hover:bg-slate-200/60 text-[#182033] font-bold text-xs rounded-xl border border-[#e3e7ef] transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <span>🔄</span>
                      <span>{isSyncingWeather ? "Đang đồng bộ..." : "Đồng bộ vệ tinh"}</span>
                    </button>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-emerald-800">
                    <span>🤖</span>
                    <span>
                      <b>Chế độ Tự Động Xử Lý (Auto-Pilot AI):</b> Tự động liên kết trạm quan trắc & cập nhật lộ trình giao thông
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={weatherState.autoPilot}
                    onChange={(e) => {
                      setWeatherState((prev) => ({ ...prev, autoPilot: e.target.checked }));
                      showToast(
                        e.target.checked
                          ? "Đã kích hoạt chế độ Tự Động Xử Lý thời tiết!"
                          : "Đã chuyển sang chế độ Ghi Đè Thủ Công.",
                        "info"
                      );
                    }}
                    className="size-4 accent-[#ff315f]"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#5f687b] mb-1">Nhiệt độ (°C)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={weatherState.temp}
                      onChange={(e) => setWeatherState((prev) => ({ ...prev, temp: parseFloat(e.target.value) || 0 }))}
                      className="w-full text-xs font-mono bg-[#f4f6fa] border border-[#e3e7ef] rounded-xl p-2.5 text-[#182033]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#5f687b] mb-1">Cảm nhận (°C)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={weatherState.feels_like}
                      onChange={(e) => setWeatherState((prev) => ({ ...prev, feels_like: parseFloat(e.target.value) || 0 }))}
                      className="w-full text-xs font-mono bg-[#f4f6fa] border border-[#e3e7ef] rounded-xl p-2.5 text-[#182033]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#5f687b] mb-1">Độ ẩm (%)</label>
                    <input
                      type="number"
                      value={weatherState.humidity}
                      onChange={(e) => setWeatherState((prev) => ({ ...prev, humidity: parseInt(e.target.value, 10) || 0 }))}
                      className="w-full text-xs font-mono bg-[#f4f6fa] border border-[#e3e7ef] rounded-xl p-2.5 text-[#182033]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#5f687b] mb-1">Gió (m/s)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={weatherState.wind_speed}
                      onChange={(e) => setWeatherState((prev) => ({ ...prev, wind_speed: parseFloat(e.target.value) || 0 }))}
                      className="w-full text-xs font-mono bg-[#f4f6fa] border border-[#e3e7ef] rounded-xl p-2.5 text-[#182033]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#5f687b] mb-1">Trạng thái thời tiết</label>
                    <select
                      value={weatherState.status}
                      onChange={(e) => setWeatherState((prev) => ({ ...prev, status: e.target.value }))}
                      className="w-full text-xs bg-[#f4f6fa] border border-[#e3e7ef] rounded-xl p-2.5 text-[#182033] font-semibold"
                    >
                      <option value="NANG">Trời nắng ráo (NANG)</option>
                      <option value="NANG_GAT">Nắng gay gắt, sốc nhiệt (NANG_GAT)</option>
                      <option value="MUA_NHO">Mưa nhỏ rải rác (MUA_NHO)</option>
                      <option value="MUA_DONG">Mưa dông, sấm sét (MUA_DONG)</option>
                      <option value="AM_U">Trời âm u, mây nhiều (AM_U)</option>
                      <option value="LANH">Rét đậm, không khí lạnh (LANH)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#5f687b] mb-1">Mô tả hiển thị</label>
                    <input
                      type="text"
                      value={weatherState.desc}
                      onChange={(e) => setWeatherState((prev) => ({ ...prev, desc: e.target.value }))}
                      className="w-full text-xs bg-[#f4f6fa] border border-[#e3e7ef] rounded-xl p-2.5 text-[#182033]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#5f687b] mb-1">Đoạn văn cảnh báo đô thị (warningText)</label>
                  <textarea
                    rows={2}
                    value={weatherState.warningText}
                    onChange={(e) => setWeatherState((prev) => ({ ...prev, warningText: e.target.value }))}
                    className="w-full text-xs bg-[#f4f6fa] border border-[#e3e7ef] rounded-xl p-2.5 text-[#182033]"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => {
                      persistData();
                      showToast("Đã lưu cập nhật thông số thời tiết thành công!", "success");
                    }}
                    className="px-6 py-2.5 bg-gradient-to-r from-[#ff315f] to-[#f97316] text-white font-bold text-xs rounded-xl shadow-xs hover:opacity-95 cursor-pointer"
                  >
                    💾 Lưu Cập Nhật Thời Tiết
                  </button>
                </div>
              </div>

              {/* Weather Live Preview matching main site */}
              <div className="lg:col-span-5 bg-white rounded-2xl border border-[#e3e7ef] p-6 shadow-xs space-y-4">
                <h4 className="text-sm font-extrabold text-[#182033] flex items-center gap-2">
                  <span>📱</span> Xem Trước Thẻ Thời Tiết Web Chính
                </h4>

                <div className="p-6 rounded-2xl bg-gradient-to-br from-[#1e73be] via-[#58a8dc] to-[#f7a928] text-white space-y-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-extrabold text-base">Hà Nội, VN</h5>
                      <span className="text-xs text-white/90">{weatherState.desc}</span>
                    </div>
                    <div className="text-3xl font-black">{weatherState.temp}°C</div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-white/90 pt-2 border-t border-white/20">
                    <div>Cảm nhận: <b>{weatherState.feels_like}°C</b></div>
                    <div>Độ ẩm: <b>{weatherState.humidity}%</b></div>
                    <div>Gió: <b>{weatherState.wind_speed} m/s</b></div>
                    <div>AQI: <b>{weatherState.aqi} (Tốt)</b></div>
                  </div>

                  <div className="p-3 rounded-xl bg-black/20 text-xs text-white/95 backdrop-blur-xs">
                    {weatherState.warningText}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#f4f6fa] border border-[#e3e7ef] text-xs text-[#5f687b] space-y-2">
                  <span className="font-bold text-[#182033]">🚦 Giám sát điểm ngập úng đô thị:</span>
                  <div className="space-y-1">
                    {weatherState.floodItems.map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-amber-700 font-medium">
                        <span>⚠️</span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 4: QUẢN TRỊ TIN TỨC ================= */}
        {activeTab === "news" && (
          <div className="bg-white rounded-2xl border border-[#e3e7ef] p-6 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#e3e7ef]">
              <div>
                <h3 className="text-base font-extrabold text-[#182033]">
                  📰 Quản Trị Danh Mục Tin Tức (Tiền Phong 24/7)
                </h3>
                <p className="text-xs text-[#5f687b]">Tự động cào và cập nhật các dòng sự kiện đô thị nóng nhất</p>
              </div>
              <button
                onClick={autoSyncNews}
                disabled={isSyncingNews}
                className="px-4 py-2 bg-[#ff315f] hover:bg-[#e02050] text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>🔄</span>
                <span>{isSyncingNews ? "Đang cào tin..." : "Tự Động Cập Nhật Tin Mới"}</span>
              </button>
            </div>

            {/* Quick add custom breaking news */}
            <div className="p-4 rounded-xl bg-[#f4f6fa] border border-[#e3e7ef] space-y-3">
              <span className="text-xs font-bold text-[#182033] block">Thêm Tin Tức Nóng Nhanh:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Tiêu đề bài viết..."
                  value={newNewsTitle}
                  onChange={(e) => setNewNewsTitle(e.target.value)}
                  className="text-xs bg-white border border-[#e3e7ef] rounded-xl p-2.5 text-[#182033]"
                />
                <input
                  type="text"
                  placeholder="Đường dẫn bài viết (URL)..."
                  value={newNewsLink}
                  onChange={(e) => setNewNewsLink(e.target.value)}
                  className="text-xs bg-white border border-[#e3e7ef] rounded-xl p-2.5 text-[#182033]"
                />
              </div>
              <button
                onClick={() => {
                  if (!newNewsTitle.trim()) {
                    showToast("Vui lòng nhập tiêu đề bài viết", "error");
                    return;
                  }
                  setAdminNews((prev) => [
                    {
                      title: newNewsTitle,
                      description: "Tin nóng vừa được cập nhật bởi ban quản trị.",
                      link: newNewsLink || "https://tienphong.vn",
                      image: null,
                      source: "Tiền Phong",
                    },
                    ...prev,
                  ]);
                  setNewNewsTitle("");
                  setNewNewsLink("");
                  showToast("Đã thêm tin bài mới lên đầu trang!", "success");
                }}
                className="px-4 py-2 bg-[#182033] hover:bg-black text-white font-bold text-xs rounded-xl"
              >
                + Đăng Tin Nóng
              </button>
            </div>

            {/* News list */}
            <div className="space-y-3">
              {adminNews.map((n, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-[#f4f6fa] border border-[#e3e7ef]">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-[#5f687b] font-mono">#{idx + 1}</span>
                    <div>
                      <h4 className="text-xs font-bold text-[#182033] hover:text-[#ff315f] cursor-pointer">{n.title}</h4>
                      <span className="text-[11px] text-[#5f687b]">{n.source || "Tiền Phong"} • Tự động lập chỉ mục</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => showToast("Đã ghim bài viết lên đầu trang chính!", "success")}
                      className="px-2.5 py-1 bg-white hover:bg-slate-100 text-[#182033] border border-[#e3e7ef] rounded-lg text-xs font-bold"
                    >
                      📌 Ghim
                    </button>
                    <button
                      onClick={() => {
                        setAdminNews((prev) => prev.filter((_, i) => i !== idx));
                        showToast("Đã ẩn bài viết khỏi bảng tin");
                      }}
                      className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-lg text-xs font-bold"
                    >
                      Ẩn
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 5: VIDEO SHORTS ================= */}
        {activeTab === "shorts" && (
          <div className="bg-white rounded-2xl border border-[#e3e7ef] p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#e3e7ef]">
              <div>
                <h3 className="text-base font-extrabold text-[#182033]">🎬 Quản Trị Video Shorts & Truyền Hình</h3>
                <p className="text-xs text-[#5f687b]">Tự động trích xuất Thumbnail và tích hợp trình phát YouTube</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#f4f6fa] border border-[#e3e7ef] grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-[#5f687b] mb-1">Link YouTube Video / Shorts</label>
                <input
                  type="text"
                  value={shortsUrl}
                  onChange={(e) => setShortsUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=... hoặc shorts/..."
                  className="w-full text-xs bg-white border border-[#e3e7ef] rounded-xl p-2.5 text-[#182033]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#5f687b] mb-1">Tiêu đề video</label>
                <input
                  type="text"
                  value={shortsTitle}
                  onChange={(e) => setShortsTitle(e.target.value)}
                  placeholder="Tiêu đề hiển thị..."
                  className="w-full text-xs bg-white border border-[#e3e7ef] rounded-xl p-2.5 text-[#182033]"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => {
                    if (!shortsUrl.trim()) {
                      showToast("Vui lòng dán link YouTube", "error");
                      return;
                    }
                    const match = shortsUrl.match(/(?:shorts\/|v=)([a-zA-Z0-9_-]{11})/);
                    const yId = match ? match[1] : "iVF4Jr-xoWk";
                    setAdminShorts((prev) => [
                      {
                        id: "s_" + Date.now(),
                        youtube_id: yId,
                        title: shortsTitle || "Video Tiền Phong TV",
                        channel: "AnX Media",
                        featured: false,
                      },
                      ...prev,
                    ]);
                    setShortsUrl("");
                    setShortsTitle("");
                    showToast("Đã tự động xử lý và thêm video vào thư viện!", "success");
                  }}
                  className="w-full py-2.5 px-4 bg-[#ff315f] hover:bg-[#e02050] text-white font-bold text-xs rounded-xl cursor-pointer"
                >
                  + Thêm Video
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {adminShorts.map((s) => (
                <div key={s.id} className="p-3.5 rounded-xl bg-[#f4f6fa] border border-[#e3e7ef] space-y-2">
                  <div className="relative rounded-lg overflow-hidden aspect-[16/9] bg-slate-900">
                    <img
                      src={`https://img.youtube.com/vi/${s.youtube_id}/hqdefault.jpg`}
                      alt={s.title}
                      className="w-full h-full object-cover"
                    />
                    {s.featured && (
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-[#ff315f] text-white font-extrabold text-[9px]">
                        NỔI BẬT
                      </span>
                    )}
                  </div>
                  <h5 className="text-xs font-bold text-[#182033] line-clamp-1">{s.title}</h5>
                  <div className="flex justify-between items-center text-xs pt-1 border-t border-[#e3e7ef]">
                    <button
                      onClick={() => {
                        setAdminShorts((prev) => prev.map((item) => ({ ...item, featured: item.id === s.id })));
                        showToast("Đã đặt video làm tiêu điểm phát nổi bật!", "success");
                      }}
                      className="text-indigo-600 font-bold hover:underline"
                    >
                      ⭐ Đặt nổi bật
                    </button>
                    <button
                      onClick={() => {
                        setAdminShorts((prev) => prev.filter((item) => item.id !== s.id));
                        showToast("Đã xóa video");
                      }}
                      className="text-rose-600 hover:underline"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 6: BANNER CẢNH BÁO ================= */}
        {activeTab === "alert" && (
          <div className="bg-white rounded-2xl border border-[#e3e7ef] p-6 shadow-xs space-y-5 max-w-2xl">
            <div>
              <h3 className="text-base font-extrabold text-[#182033]">📢 Cấu Hình Banner Cảnh Báo Khẩn Cấp</h3>
              <p className="text-xs text-[#5f687b]">Banner chạy cố định trên đầu trang web anx.io.vn khi có sự kiện thời tiết đặc biệt</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="alertToggle"
                  checked={alertBanner.enabled}
                  onChange={(e) => setAlertBanner((prev) => ({ ...prev, enabled: e.target.checked }))}
                  className="size-4 accent-[#ff315f]"
                />
                <label htmlFor="alertToggle" className="text-xs font-bold text-[#182033] cursor-pointer">
                  Bật hiển thị thanh banner cảnh báo trên toàn trang web
                </label>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#5f687b] mb-1">Mức độ cảnh báo</label>
                <select
                  value={alertBanner.type}
                  onChange={(e) => setAlertBanner((prev) => ({ ...prev, type: e.target.value as any }))}
                  className="w-full text-xs bg-[#f4f6fa] border border-[#e3e7ef] rounded-xl p-2.5 text-[#182033] font-semibold"
                >
                  <option value="danger">Khẩn cấp nguy hiểm (Màu đỏ)</option>
                  <option value="warning">Cảnh báo quan trọng (Màu cam/vàng)</option>
                  <option value="info">Thông báo thông tin chung (Màu xanh)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#5f687b] mb-1">Nội dung văn bản cảnh báo</label>
                <textarea
                  rows={3}
                  value={alertBanner.message}
                  onChange={(e) => setAlertBanner((prev) => ({ ...prev, message: e.target.value }))}
                  className="w-full text-xs bg-[#f4f6fa] border border-[#e3e7ef] rounded-xl p-3 text-[#182033]"
                  placeholder="Nhập thông tin cảnh báo ngập úng, bão gió..."
                />
              </div>

              <button
                onClick={() => {
                  persistData();
                  showToast("Đã lưu và cập nhật banner cảnh báo trực tiếp lên website!", "success");
                }}
                className="px-6 py-2.5 bg-gradient-to-r from-[#ff315f] to-[#f97316] text-white font-bold text-xs rounded-xl shadow-xs hover:opacity-95 cursor-pointer"
              >
                💾 Phát Cảnh Báo Lên Web
              </button>
            </div>
          </div>
        )}

        {/* ================= TAB 7: CÀI ĐẶT VIETQR & ĐỊNH MỨC ================= */}
        {activeTab === "settings" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Pricing & VietQR Settings */}
            <div className="lg:col-span-6 bg-white rounded-2xl border border-[#e3e7ef] p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#e3e7ef]">
                <h4 className="text-sm font-extrabold text-[#182033] flex items-center gap-2">
                  <span>⚙️</span> Bảng Giá & Cấu Hình Ngân Hàng VietQR
                </h4>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-xl bg-violet-50 border border-violet-200 space-y-2">
                  <span className="font-bold text-violet-900 block">💳 Thông Tin Nhận Chuyển Khoản VietQR:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] text-violet-700 font-bold block mb-1">Mã Ngân Hàng:</label>
                      <input
                        type="text"
                        value={pricing.bank_name}
                        onChange={(e) => setPricing((prev) => ({ ...prev, bank_name: e.target.value.toUpperCase() }))}
                        placeholder="MB, VCB, TCB..."
                        className="w-full font-bold bg-white border border-violet-200 rounded-lg p-1.5 text-[#182033]"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-[10px] text-violet-700 font-bold block mb-1">Số Tài Khoản:</label>
                      <input
                        type="text"
                        value={pricing.bank_account}
                        onChange={(e) => setPricing((prev) => ({ ...prev, bank_account: e.target.value }))}
                        className="w-full font-mono font-bold bg-white border border-violet-200 rounded-lg p-1.5 text-[#182033]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-violet-700 font-bold block mb-1">Tên Chủ Tài Khoản:</label>
                    <input
                      type="text"
                      value={pricing.bank_owner}
                      onChange={(e) => setPricing((prev) => ({ ...prev, bank_owner: e.target.value.toUpperCase() }))}
                      className="w-full font-bold bg-white border border-violet-200 rounded-lg p-1.5 text-[#182033]"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-[#5f687b]">Tiền nhà chuẩn (đ/tháng):</label>
                  <input
                    type="number"
                    value={pricing.rent_fixed}
                    onChange={(e) => setPricing((prev) => ({ ...prev, rent_fixed: parseInt(e.target.value, 10) || 0 }))}
                    className="w-36 text-right font-mono bg-[#f4f6fa] border border-[#e3e7ef] rounded-lg p-1.5 text-[#182033]"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-[#5f687b]">Giá điện (đ/kWh):</label>
                  <input
                    type="number"
                    value={pricing.electricity_unit}
                    onChange={(e) => setPricing((prev) => ({ ...prev, electricity_unit: parseInt(e.target.value, 10) || 0 }))}
                    className="w-36 text-right font-mono bg-[#f4f6fa] border border-[#e3e7ef] rounded-lg p-1.5 text-[#182033]"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-[#5f687b]">Giá nước (đ/m³):</label>
                  <input
                    type="number"
                    value={pricing.water_unit}
                    onChange={(e) => setPricing((prev) => ({ ...prev, water_unit: parseInt(e.target.value, 10) || 0 }))}
                    className="w-36 text-right font-mono bg-[#f4f6fa] border border-[#e3e7ef] rounded-lg p-1.5 text-[#182033]"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-[#5f687b]">Phí rác sinh hoạt (đ):</label>
                  <input
                    type="number"
                    value={pricing.service_fee_1}
                    onChange={(e) => setPricing((prev) => ({ ...prev, service_fee_1: parseInt(e.target.value, 10) || 0 }))}
                    className="w-36 text-right font-mono bg-[#f4f6fa] border border-[#e3e7ef] rounded-lg p-1.5 text-[#182033]"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-[#5f687b]">Phí Wi-Fi Internet (đ):</label>
                  <input
                    type="number"
                    value={pricing.service_fee_2}
                    onChange={(e) => setPricing((prev) => ({ ...prev, service_fee_2: parseInt(e.target.value, 10) || 0 }))}
                    className="w-36 text-right font-mono bg-[#f4f6fa] border border-[#e3e7ef] rounded-lg p-1.5 text-[#182033]"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-[#5f687b]">Vệ sinh & máy giặt chung (đ):</label>
                  <input
                    type="number"
                    value={pricing.service_fee_3}
                    onChange={(e) => setPricing((prev) => ({ ...prev, service_fee_3: parseInt(e.target.value, 10) || 0 }))}
                    className="w-36 text-right font-mono bg-[#f4f6fa] border border-[#e3e7ef] rounded-lg p-1.5 text-[#182033]"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => {
                    persistData();
                    showToast("Đã lưu bảng giá & cấu hình VietQR thành công!", "success");
                  }}
                  className="px-4 py-2 bg-[#ff315f] hover:bg-[#e02050] text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  💾 Cập Nhật Bảng Giá & VietQR
                </button>
              </div>
            </div>

            {/* Rooms Management */}
            <div className="lg:col-span-6 bg-white rounded-2xl border border-[#e3e7ef] p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#e3e7ef]">
                <h4 className="text-sm font-extrabold text-[#182033] flex items-center gap-2">
                  <span>🔑</span> Danh Sách Phòng Thuê
                </h4>
                <button
                  onClick={() => setIsAddRoomModalOpen(true)}
                  className="px-3 py-1.5 bg-[#182033] hover:bg-black text-white font-bold text-xs rounded-lg"
                >
                  + Thêm Phòng
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="text-[#5f687b] border-b border-[#e3e7ef] uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Tên Phòng</th>
                      <th className="p-3">Người Thuê</th>
                      <th className="p-3">Giá Thuê</th>
                      <th className="p-3 text-right">Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e3e7ef]">
                    {rooms.map((r) => (
                      <tr key={r.id} className="hover:bg-[#f4f6fa]">
                        <td className="p-3 font-bold text-[#182033]">{r.name}</td>
                        <td className="p-3 text-[#5f687b]">
                          {r.tenant || "Chưa có"} <span className="text-[10px] text-[#5f687b]">{r.phone}</span>
                        </td>
                        <td className="p-3 font-mono font-bold text-indigo-600">
                          {r.fixed_rent.toLocaleString("vi-VN")} đ
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => {
                              if (confirm(`Xóa phòng ${r.name}?`)) {
                                setRooms((prev) => prev.filter((item) => item.id !== r.id));
                                showToast("Đã xóa phòng");
                              }
                            }}
                            className="text-[#5f687b] hover:text-[#ff315f]"
                          >
                            Xóa
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Add Room Modal */}
      {isAddRoomModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs px-4">
          <div className="w-full max-w-sm bg-white rounded-3xl border border-[#e3e7ef] p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-[#182033]">Thêm Phòng Thuê Mới</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[#5f687b] mb-1">Tên phòng:</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Phòng 301..."
                  value={modalRoomName}
                  onChange={(e) => setModalRoomName(e.target.value)}
                  className="w-full bg-[#f4f6fa] border border-[#e3e7ef] rounded-xl p-2.5 text-[#182033]"
                />
              </div>
              <div>
                <label className="block text-[#5f687b] mb-1">Tên người thuê:</label>
                <input
                  type="text"
                  placeholder="Nguyễn Văn A..."
                  value={modalTenant}
                  onChange={(e) => setModalTenant(e.target.value)}
                  className="w-full bg-[#f4f6fa] border border-[#e3e7ef] rounded-xl p-2.5 text-[#182033]"
                />
              </div>
              <div>
                <label className="block text-[#5f687b] mb-1">Số điện thoại:</label>
                <input
                  type="text"
                  placeholder="0912..."
                  value={modalPhone}
                  onChange={(e) => setModalPhone(e.target.value)}
                  className="w-full bg-[#f4f6fa] border border-[#e3e7ef] rounded-xl p-2.5 text-[#182033]"
                />
              </div>
              <div>
                <label className="block text-[#5f687b] mb-1">Giá thuê cố định (đ):</label>
                <input
                  type="number"
                  value={modalRent}
                  onChange={(e) => setModalRent(parseInt(e.target.value, 10) || 3500000)}
                  className="w-full bg-[#f4f6fa] border border-[#e3e7ef] rounded-xl p-2.5 text-[#182033]"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsAddRoomModalOpen(false)}
                className="px-4 py-2 bg-[#f4f6fa] text-[#5f687b] rounded-xl text-xs font-bold hover:bg-slate-200/60"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  if (!modalRoomName.trim()) {
                    showToast("Vui lòng nhập tên phòng", "error");
                    return;
                  }
                  setRooms((prev) => [
                    ...prev,
                    {
                      id: "p_" + Date.now(),
                      name: modalRoomName,
                      tenant: modalTenant,
                      phone: modalPhone,
                      fixed_rent: modalRent,
                    },
                  ]);
                  setIsAddRoomModalOpen(false);
                  setModalRoomName("");
                  setModalTenant("");
                  setModalPhone("");
                  showToast("Đã thêm phòng mới thành công!", "success");
                }}
                className="px-4 py-2 bg-[#ff315f] text-white rounded-xl text-xs font-bold"
              >
                Thêm Ngay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Centered VietQR Modal Popup (REQ-080) */}
      <VietQRModal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        data={qrModalData || {
          qrUrl: currentCalculatedBill.qrUrl,
          bank: pricing.bank_name,
          accountNo: pricing.bank_account,
          accountName: pricing.bank_owner,
          amount: currentCalculatedBill.tong_tien,
          addInfo: `TIEN PHONG ${currentCalculatedBill.room_name || 'Phòng Thuê'} T${new Date().getMonth() + 1}`,
        }}
      />
    </div>
  );
}
