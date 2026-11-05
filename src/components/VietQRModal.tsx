import React, { useState, useEffect, useCallback } from 'react';

export interface VietQRData {
  qrUrl: string;
  bank?: string;
  accountNo?: string;
  accountName?: string;
  amount?: string | number;
  addInfo?: string;
}

export const FALLBACK_QR_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" width="240" height="240"><rect width="240" height="240" fill="%23ffffff"/><rect x="20" y="20" width="60" height="60" fill="%231e3a8a" rx="8"/><rect x="32" y="32" width="36" height="36" fill="%23ffffff" rx="4"/><rect x="42" y="42" width="16" height="16" fill="%232563eb" rx="2"/><rect x="160" y="20" width="60" height="60" fill="%231e3a8a" rx="8"/><rect x="172" y="32" width="36" height="36" fill="%23ffffff" rx="4"/><rect x="182" y="42" width="16" height="16" fill="%232563eb" rx="2"/><rect x="20" y="160" width="60" height="60" fill="%231e3a8a" rx="8"/><rect x="32" y="172" width="36" height="36" fill="%23ffffff" rx="4"/><rect x="42" y="182" width="16" height="16" fill="%232563eb" rx="2"/><rect x="95" y="25" width="15" height="15" fill="%231e293b"/><rect x="120" y="25" width="15" height="15" fill="%231e293b"/><rect x="95" y="50" width="15" height="15" fill="%231e293b"/><rect x="120" y="65" width="15" height="15" fill="%231e293b"/><rect x="25" y="95" width="15" height="15" fill="%231e293b"/><rect x="50" y="105" width="15" height="15" fill="%231e293b"/><rect x="95" y="95" width="50" height="50" fill="%232563eb" rx="10"/><text x="120" y="126" font-family="sans-serif" font-size="14" font-weight="bold" fill="%23ffffff" text-anchor="middle">BIDV</text><rect x="160" y="95" width="15" height="15" fill="%231e293b"/><rect x="185" y="105" width="15" height="15" fill="%231e293b"/><rect x="205" y="95" width="15" height="15" fill="%231e293b"/><rect x="95" y="160" width="15" height="15" fill="%231e293b"/><rect x="120" y="170" width="15" height="15" fill="%231e293b"/><rect x="95" y="195" width="15" height="15" fill="%231e293b"/><rect x="120" y="205" width="15" height="15" fill="%231e293b"/><rect x="160" y="160" width="25" height="25" fill="%231e293b"/><rect x="195" y="160" width="25" height="25" fill="%232563eb"/><rect x="160" y="195" width="25" height="25" fill="%232563eb"/><rect x="195" y="195" width="25" height="25" fill="%231e293b"/></svg>`;

export const DEFAULT_VIETQR_DATA: VietQRData = {
  qrUrl: 'https://img.vietqr.io/image/BIDV-8817398313-compact2.png?amount=4860500&addInfo=TIEN%20PHONG%20Ph%C3%B2ng%20Thu%C3%AA%20T10&accountName=TRAN%20THI%20THUY%20HUYEN',
  bank: 'BIDV (Ngân hàng TMCP Đầu tư và Phát triển Việt Nam)',
  accountNo: '8817398313',
  accountName: 'TRAN THI THUY HUYEN',
  amount: '4860500',
  addInfo: 'TIEN PHONG Phòng Thuê T10'
};

interface VietQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  data?: VietQRData | null;
  darkMode?: boolean;
}

/**
 * Format currency number to Vietnamese Dong string (e.g., 4860500 -> "4.860.500 ₫")
 */
export function formatVND(val?: string | number): string {
  if (!val) return '0 ₫';
  const num = typeof val === 'number' ? val : parseInt(val.toString().replace(/\D/g, ''), 10);
  if (isNaN(num)) return `${val} ₫`;
  return `${num.toLocaleString('vi-VN')} ₫`;
}

/**
 * High-definition centered VietQR scan modal
 */
export function VietQRModal({ isOpen, onClose, data, darkMode = false }: VietQRModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const qrInfo = data || DEFAULT_VIETQR_DATA;

  // Handle ESC key to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const copyToClipboard = useCallback((text: string, fieldName: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    }).catch(err => {
      console.warn('Clipboard copy failed:', err);
    });
  }, []);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="vietqr-modal-title"
      data-testid="vietqr-popup-modal"
      className="fixed inset-0 z-[999] flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      style={{ backgroundColor: 'rgba(10, 15, 29, 0.72)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`relative w-full max-w-[480px] rounded-3xl p-5 sm:p-6 shadow-[0_24px_64px_-12px_rgba(0,0,0,0.5)] border transition-all duration-300 transform scale-100 animate-in fade-in zoom-in-95 ${
          darkMode
            ? 'bg-[#151922] border-white/10 text-white'
            : 'bg-white border-[#e3e7ef] text-[#182033]'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-inherit/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white flex items-center justify-center shadow-md shadow-blue-500/20 font-black text-sm">
              QR
            </div>
            <div>
              <h3 id="vietqr-modal-title" className="font-extrabold text-[16px] sm:text-[17px] leading-tight">
                Quét Mã VietQR Thanh Toán
              </h3>
              <p className={`text-[12px] ${darkMode ? 'text-slate-400' : 'text-[#64748b]'}`}>
                Chuyển khoản nhanh 24/7 qua Napas 247
              </p>
            </div>
          </div>

          <button
            type="button"
            data-testid="vietqr-modal-close-btn"
            onClick={onClose}
            aria-label="Đóng popup QR"
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              darkMode
                ? 'bg-white/10 hover:bg-white/20 text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* QR Code Center Image */}
        <div className="flex flex-col items-center justify-center mb-4">
          <div className="relative p-3 rounded-2xl bg-white border border-slate-200/90 shadow-sm max-w-[280px] sm:max-w-[300px] w-full aspect-square flex items-center justify-center group overflow-hidden">
            <img
              src={qrInfo.qrUrl}
              alt="Mã VietQR"
              data-testid="vietqr-modal-image"
              onError={(e) => {
                const target = e.currentTarget;
                if (target.src !== FALLBACK_QR_SVG) {
                  target.src = FALLBACK_QR_SVG;
                }
              }}
              className="w-full h-full object-contain rounded-xl select-none"
            />
            <div className="absolute inset-0 pointer-events-none rounded-2xl border-2 border-blue-500/20"></div>
          </div>
          <p className="mt-2 text-[12px] font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
            <span className="inline-block animate-pulse">📷</span>
            <span>Mở ứng dụng Ngân hàng hoặc Ví để quét mã</span>
          </p>
        </div>

        {/* Payment Details Card */}
        <div className={`p-3.5 rounded-2xl border mb-4 text-[13px] flex flex-col gap-2.5 ${
          darkMode ? 'bg-white/[0.04] border-white/10' : 'bg-[#f8fafc] border-[#e2e8f0]'
        }`}>
          {/* Số tiền */}
          <div className="flex items-center justify-between gap-2">
            <span className={darkMode ? 'text-slate-400' : 'text-slate-500'}>Số tiền thanh toán:</span>
            <div className="flex items-center gap-2">
              <span className="font-black text-[17px] text-emerald-600 dark:text-emerald-400">
                {formatVND(qrInfo.amount)}
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(qrInfo.amount ? qrInfo.amount.toString() : '4860500', 'amount')}
                className={`text-[11px] font-bold px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                  copiedField === 'amount'
                    ? 'bg-emerald-500 text-white'
                    : darkMode ? 'bg-white/10 hover:bg-white/20 text-slate-300' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {copiedField === 'amount' ? '✓ Đã chép' : 'Sao chép'}
              </button>
            </div>
          </div>

          {/* Ngân hàng */}
          <div className="flex items-center justify-between gap-2 border-t border-inherit/40 pt-2">
            <span className={darkMode ? 'text-slate-400' : 'text-slate-500'}>Ngân hàng:</span>
            <span className="font-bold text-right truncate max-w-[240px]">
              {qrInfo.bank || 'BIDV'}
            </span>
          </div>

          {/* Số tài khoản */}
          <div className="flex items-center justify-between gap-2 border-t border-inherit/40 pt-2">
            <span className={darkMode ? 'text-slate-400' : 'text-slate-500'}>Số tài khoản:</span>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-[14px] text-blue-600 dark:text-blue-400">
                {qrInfo.accountNo || '8817398313'}
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(qrInfo.accountNo || '8817398313', 'accountNo')}
                className={`text-[11px] font-bold px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                  copiedField === 'accountNo'
                    ? 'bg-emerald-500 text-white'
                    : darkMode ? 'bg-white/10 hover:bg-white/20 text-slate-300' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {copiedField === 'accountNo' ? '✓ Đã chép' : 'Sao chép'}
              </button>
            </div>
          </div>

          {/* Chủ tài khoản */}
          <div className="flex items-center justify-between gap-2 border-t border-inherit/40 pt-2">
            <span className={darkMode ? 'text-slate-400' : 'text-slate-500'}>Chủ tài khoản:</span>
            <span className="font-bold uppercase text-[12.5px] truncate max-w-[240px]">
              {qrInfo.accountName || 'TRAN THI THUY HUYEN'}
            </span>
          </div>

          {/* Nội dung chuyển khoản */}
          <div className="flex items-center justify-between gap-2 border-t border-inherit/40 pt-2">
            <span className={darkMode ? 'text-slate-400' : 'text-slate-500'}>Nội dung CK:</span>
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-semibold text-amber-600 dark:text-amber-400 truncate max-w-[170px]" title={qrInfo.addInfo}>
                {qrInfo.addInfo || 'TIEN PHONG Phòng Thuê T10'}
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(qrInfo.addInfo || 'TIEN PHONG Phòng Thuê T10', 'addInfo')}
                className={`text-[11px] font-bold px-2 py-0.5 rounded-md transition-all cursor-pointer shrink-0 ${
                  copiedField === 'addInfo'
                    ? 'bg-emerald-500 text-white'
                    : darkMode ? 'bg-white/10 hover:bg-white/20 text-slate-300' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {copiedField === 'addInfo' ? '✓ Đã chép' : 'Sao chép'}
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center gap-2.5">
          <a
            href={qrInfo.qrUrl}
            target="_blank"
            rel="noopener noreferrer"
            download="VietQR_Payment.png"
            className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold text-[13px] text-center shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="1" x2="12" y2="3"></line>
            </svg>
            <span>Lưu ảnh QR</span>
          </a>

          <button
            type="button"
            onClick={onClose}
            className={`py-2.5 px-5 rounded-xl font-bold text-[13px] transition-all cursor-pointer ${
              darkMode
                ? 'bg-white/10 hover:bg-white/20 text-slate-200'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * VietQRPaymentCard: Interactive Bill / Rent Payment Card matching the user's exact specification
 */
export function VietQRPaymentCard({
  data = DEFAULT_VIETQR_DATA,
  onOpenModal,
  darkMode = false
}: {
  data?: VietQRData;
  onOpenModal?: (item: VietQRData) => void;
  darkMode?: boolean;
}) {
  const qrData = data || DEFAULT_VIETQR_DATA;

  const handleClick = () => {
    if (onOpenModal) {
      onOpenModal(qrData);
    }
  };

  return (
    <div
      data-testid="vietqr-payment-card"
      className={`w-full p-4 rounded-[var(--card-radius)] border shadow-[0px_4px_12px_0px_rgba(23,33,51,0.06)] flex items-center justify-between gap-4 transition-all duration-300 ${
        darkMode ? 'bg-[#151921] border-white/10 text-white' : 'bg-white border-[#e3e7ef] text-[#182033]'
      }`}
    >
      <div className="flex flex-col min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 font-extrabold text-[11px]">
            HÓA ĐƠN ANX
          </span>
          <span className="font-bold text-[14px] truncate">
            {qrData.addInfo || 'TIEN PHONG Phòng Thuê T10'}
          </span>
        </div>

        <p className="font-black text-[20px] text-emerald-600 dark:text-emerald-400 leading-tight">
          {formatVND(qrData.amount)}
        </p>

        <p className={`text-[12px] mt-1 ${darkMode ? 'text-slate-400' : 'text-[#64748b]'}`}>
          {qrData.bank?.split('(')[0].trim() || 'BIDV'} • STK: <span className="font-mono font-bold">{qrData.accountNo}</span> • {qrData.accountName}
        </p>
        <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium mt-0.5 flex items-center gap-1 cursor-pointer" onClick={handleClick}>
          <span>🔍 Nhấp mã QR để phóng to quét mã thanh toán</span>
        </span>
      </div>

      {/* The EXACT thumbnail div specified by the user */}
      <div
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(); } }}
        className="size-20 rounded-lg overflow-hidden bg-white p-1 border border-[#e3e7ef] shrink-0 shadow-xs cursor-pointer hover:border-blue-500 hover:shadow-md transition-all group relative"
        title="Nhấp để phóng to mã QR quét thanh toán"
        data-testid="vietqr-thumbnail-trigger"
      >
        <img
          alt="VietQR"
          className="size-full object-contain group-hover:scale-105 transition-transform"
          src={qrData.qrUrl}
          onError={(e) => {
            const target = e.currentTarget;
            if (target.src !== FALLBACK_QR_SVG) {
              target.src = FALLBACK_QR_SVG;
            }
          }}
        />
        <div className="absolute inset-0 bg-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg pointer-events-none flex items-end justify-center pb-1">
          <span className="bg-blue-600 text-white text-[9px] font-bold px-1 rounded shadow-xs">Phóng to</span>
        </div>
      </div>
    </div>
  );
}
