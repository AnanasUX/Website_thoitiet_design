/**
 * SECURITY SHIELD & API CYBER DEFENSE ENGINE
 * ==========================================
 * Cung cấp các lớp phòng vệ an ninh chuyên sâu cho hệ thống Web, API fetching và dữ liệu đầu vào:
 * 1. Chống SSRF (Server-Side Request Forgery) & Danh sách trắng URL an toàn (Safe URL Fetch & SSRF Shield)
 * 2. Bộ kiểm soát lưu lượng (Rate Limiting) & Chống tấn công từ chối dịch vụ (DDoS / DoS / Request Flood)
 * 3. Lá chắn phòng thủ tiêm mã độc sâu (Deep Injection: SQLi, OS Command, Path Traversal, Prototype Pollution)
 * 4. Kiểm soát kích thước Payload, Chống JSON Bomb & Xác thực Schema API (Payload & Schema Guard)
 * 5. Kiểm tra tính toàn vẹn yêu cầu, Chống tấn công phát lại (Anti-Replay Attack) & Đánh giá HTTP Security Headers
 */
// ─────────────────────────────────────────────────────────────────────────────
// PHÂN HỆ 1: CHỐNG SSRF & DANH SÁCH TRẮNG URL AN TOÀN (REQ-038)
// ─────────────────────────────────────────────────────────────────────────────
const PRIVATE_IP_PATTERNS = [
    /^127\.\d{1,3}\.\d{1,3}\.\d{1,3}$/, // Loopback 127.0.0.0/8
    /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/, // Private Class A 10.0.0.0/8
    /^172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}$/, // Private Class B 172.16.0.0/12
    /^192\.168\.\d{1,3}\.\d{1,3}$/, // Private Class C 192.168.0.0/16
    /^169\.254\.\d{1,3}\.\d{1,3}$/, // Link-local / Cloud Metadata 169.254.0.0/16
    /^0\.0\.0\.0$/, // Wildcard
];
const ALLOWED_PROTOCOLS = new Set(['https:', 'http:']);
const TRUSTED_DOMAINS_WHITELIST = [
    'vnexpress.net',
    'tienphong.vn',
    'tuoitre.vn',
    'thanhnien.vn',
    'dantri.com.vn',
    'vtv.vn',
    'vtcnews.vn',
    'laodong.vn',
    'vietnamnet.vn',
    'sggp.org.vn',
    'baogiaothong.vn',
    'nld.com.vn',
    'open-meteo.com',
    'googleapis.com',
    'youtube.com',
    'ytimg.com',
    'github.io',
    'allorigins.win',
    'corsproxy.io',
    'codetabs.com',
    'freeboard.io'
];
export function validateSafeFetchUrl(rawUrl) {
    if (!rawUrl || typeof rawUrl !== 'string') {
        return { isSafe: false, reason: 'URL rỗng hoặc không đúng định dạng chuỗi' };
    }
    const trimmed = rawUrl.trim();
    // Kiểm tra độ dài URL (chống Buffer Overflow / DoS qua URL quá dài)
    if (trimmed.length > 2048) {
        return { isSafe: false, reason: 'URL vượt quá chiều dài cho phép (tối đa 2048 ký tự)' };
    }
    let parsed;
    try {
        parsed = new URL(trimmed);
    }
    catch {
        return { isSafe: false, reason: 'URL không hợp lệ theo chuẩn RFC 3986' };
    }
    // 1. Kiểm tra giao thức (Protocol Guard)
    if (!ALLOWED_PROTOCOLS.has(parsed.protocol)) {
        return {
            isSafe: false,
            reason: `Giao thức ${parsed.protocol} bị chặn vì rủi ro an ninh (chỉ chấp nhận http:, https:)`
        };
    }
    const hostname = parsed.hostname.toLowerCase();
    // 2. Chặn localhost & metadata đặc biệt
    if (hostname === 'localhost' ||
        hostname === '127.0.0.1' ||
        hostname === '::1' ||
        hostname.endsWith('.localhost') ||
        hostname === 'metadata.google.internal' ||
        hostname === 'instance-data') {
        return { isSafe: false, reason: 'Phát hiện mục tiêu tấn công nội bộ SSRF (Loopback / Cloud Metadata)' };
    }
    // 3. Kiểm tra dải IP riêng tư (Private IP Ranges)
    for (const pattern of PRIVATE_IP_PATTERNS) {
        if (pattern.test(hostname)) {
            return { isSafe: false, reason: `Phát hiện dải địa chỉ IP nội bộ bị cấm truy cập (${hostname})` };
        }
    }
    // 4. Kiểm tra cổng (Port Guard): Chặn các port nội bộ nguy hiểm (SSH 22, Telnet 23, Redis 6379, MySQL 3306, MongoDB 27017)
    if (parsed.port) {
        const portNum = parseInt(parsed.port, 10);
        const standardPorts = [80, 443, 8080, 8443];
        if (!standardPorts.includes(portNum)) {
            return { isSafe: false, reason: `Cổng ${parsed.port} không thuộc danh mục cổng web công khai an toàn` };
        }
    }
    // 5. Kiểm tra Danh sách trắng domain hoặc đuôi domain hợp lệ
    const isWhitelisted = TRUSTED_DOMAINS_WHITELIST.some(d => hostname === d || hostname.endsWith('.' + d));
    if (!isWhitelisted) {
        return {
            isSafe: false,
            reason: `Domain ${hostname} không nằm trong danh mục nguồn tin cậy của hệ thống`
        };
    }
    return { isSafe: true, normalizedUrl: parsed.toString() };
}
const DEFAULT_RATE_CONFIG = {
    maxRequests: 60, // 60 request
    windowMs: 60000, // trong 1 phút
    burstLimit: 10 // Tối đa 10 request/giây
};
// Bộ nhớ đệm lưu trữ phiên truy cập
const rateLimitStore = new Map();
export function checkRateLimit(clientId, endpoint, config = DEFAULT_RATE_CONFIG, now = Date.now()) {
    if (!clientId) {
        return { allowed: false, statusCode: 429, remaining: 0, resetMs: config.windowMs, retryAfterSeconds: Math.ceil(config.windowMs / 1000), reason: 'Client Identifier không xác định' };
    }
    const key = `${clientId}::${endpoint}`;
    let record = rateLimitStore.get(key);
    if (!record) {
        record = { timestamps: [] };
        rateLimitStore.set(key, record);
    }
    // Dọn dẹp các mốc thời gian ngoài cửa sổ trượt (Sliding Window Purge)
    const windowStart = now - config.windowMs;
    record.timestamps = record.timestamps.filter(t => t > windowStart);
    // 1. Kiểm tra giới hạn dồn dập (Burst Check trong 1000ms gần nhất)
    if (config.burstLimit) {
        const burstStart = now - 1000;
        const burstCount = record.timestamps.filter(t => t > burstStart).length;
        if (burstCount >= config.burstLimit) {
            return {
                allowed: false,
                statusCode: 429,
                remaining: 0,
                resetMs: 1000,
                retryAfterSeconds: 1,
                reason: `Vượt quá giới hạn dồn dập tức thì (Burst limit ${config.burstLimit} req/giây)`
            };
        }
    }
    // 2. Kiểm tra giới hạn toàn cửa sổ (Window Limit)
    if (record.timestamps.length >= config.maxRequests) {
        const oldest = record.timestamps[0];
        const resetMs = Math.max(0, oldest + config.windowMs - now);
        const retryAfter = Math.ceil(resetMs / 1000);
        return {
            allowed: false,
            statusCode: 429,
            remaining: 0,
            resetMs,
            retryAfterSeconds: retryAfter,
            reason: `Tần suất vượt quá giới hạn an toàn (${config.maxRequests} req / ${config.windowMs / 1000}s)`
        };
    }
    // Chấp thuận request và ghi nhận timestamp mới
    record.timestamps.push(now);
    const remaining = config.maxRequests - record.timestamps.length;
    return {
        allowed: true,
        statusCode: 200,
        remaining,
        resetMs: config.windowMs,
        retryAfterSeconds: 0
    };
}
export function resetRateLimits() {
    rateLimitStore.clear();
}
// ─────────────────────────────────────────────────────────────────────────────
// PHÂN HỆ 3: LÁ CHẮN PHÒNG VỆ TIÊM MÃ ĐỘC SÂU (REQ-040)
// ─────────────────────────────────────────────────────────────────────────────
// Regex nhận diện các vector tấn công SQL Injection
const SQLI_PATTERNS = [
    /(\bUNION\s+(?:ALL\s+)?SELECT\b)/i,
    /(\b(?:OR|AND)\s+['"]?\d+['"]?\s*=\s*['"]?\d+)/i,
    /(\b(?:OR|AND)\s+['"][^'"]+['"]\s*=\s*['"][^'"]+['"])/i,
    /(;\s*DROP\s+TABLE\b)/i,
    /(;\s*DELETE\s+FROM\b)/i,
    /(;\s*INSERT\s+INTO\b)/i,
    /(;\s*UPDATE\s+[^;]+SET\b)/i,
    /(\bEXEC(?:\s+XP_)?\b)/i,
    /(\bSLEEP\s*\(\s*\d+\s*\))/i,
    /(\bBENCHMARK\s*\(\s*\d+\s*,)/i,
    /(\bSELECT\b.+\bFROM\b.+\bWHERE\b)/i,
    /(--|#|\/\*)/
];
// Regex nhận diện OS Command Injection
const CMD_INJECTION_PATTERNS = [
    /(?:^|[;&|`])\s*(?:rm\s+-rf|rmdir|mkfs|dd|chmod|chown)\b/i,
    /(?:^|[;&|`])\s*(?:cat\s+\/etc\/(?:passwd|shadow)|type\s+C:\\windows)/i,
    /(?:^|[;&|`])\s*(?:whoami|hostname|uname\s+-a|ipconfig|ifconfig|netstat)\b/i,
    /(?:^|[;&|`])\s*(?:curl|wget|nc|ncat|bash|sh|powershell|cmd\.exe)\b/i,
    /\$\((?:[^\)]*(?:curl|wget|whoami|bash|sh|rm)[^\)]*)\)/i,
    /`[^`]*(?:curl|wget|whoami|bash|sh|rm)[^`]*`/i
];
// Regex nhận diện Path Traversal
const PATH_TRAVERSAL_PATTERN = /(?:\.\.[/\\])+|%2e%2e%2f|%2e%2e%5c|%2e%2e\/|\.\.%2f/i;
export function detectMaliciousPayload(input) {
    if (input === null || input === undefined) {
        return { isMalicious: false, sanitizedValue: input };
    }
    // 1. Kiểm tra đối tượng Object chống Prototype Pollution
    if (typeof input === 'object' && !Array.isArray(input)) {
        const keys = Object.keys(input);
        for (const key of keys) {
            if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
                return {
                    isMalicious: true,
                    attackType: 'PROTOTYPE_POLLUTION',
                    threatDetails: `Phát hiện nỗ lực làm ô nhiễm Prototype với khóa nguy hiểm: ${key}`
                };
            }
        }
        // Đệ quy quét các thuộc tính lồng bên trong
        for (const val of Object.values(input)) {
            const childRes = detectMaliciousPayload(val);
            if (childRes.isMalicious)
                return childRes;
        }
        return { isMalicious: false, sanitizedValue: input };
    }
    // 2. Quét mảng dữ liệu
    if (Array.isArray(input)) {
        for (const item of input) {
            const childRes = detectMaliciousPayload(item);
            if (childRes.isMalicious)
                return childRes;
        }
        return { isMalicious: false, sanitizedValue: input };
    }
    // 3. Quét chuỗi văn bản (String Payload)
    if (typeof input === 'string') {
        const str = input.trim();
        // Kiểm tra Path Traversal
        if (PATH_TRAVERSAL_PATTERN.test(str)) {
            return {
                isMalicious: true,
                attackType: 'PATH_TRAVERSAL',
                threatDetails: 'Phát hiện vector tấn công duyệt thư mục trái phép (Directory Path Traversal)'
            };
        }
        // Kiểm tra SQL Injection
        for (const pattern of SQLI_PATTERNS) {
            if (pattern.test(str)) {
                return {
                    isMalicious: true,
                    attackType: 'SQLI',
                    threatDetails: `Phát hiện payload SQL Injection nghi vấn: ${str.substring(0, 60)}`
                };
            }
        }
        // Kiểm tra Command Injection
        for (const pattern of CMD_INJECTION_PATTERNS) {
            if (pattern.test(str)) {
                return {
                    isMalicious: true,
                    attackType: 'COMMAND_INJECTION',
                    threatDetails: `Phát hiện vector tiêm lệnh hệ điều hành: ${str.substring(0, 60)}`
                };
            }
        }
        return { isMalicious: false, sanitizedValue: str };
    }
    return { isMalicious: false, sanitizedValue: input };
}
/**
 * Vệ sinh chuỗi tìm kiếm đầu vào an toàn, giữ nguyên dấu tiếng Việt nhưng vô hiệu hóa ký tự phá cú pháp.
 */
export function sanitizeSearchQuery(rawQuery) {
    if (!rawQuery || typeof rawQuery !== 'string')
        return '';
    return rawQuery
        .replace(/[;`$<>]/g, '')
        .replace(/--/g, '')
        .replace(/\/\*/g, '')
        .replace(/\*\//g, '')
        .trim()
        .substring(0, 150);
}
/**
 * Kiểm soát dung lượng Byte và độ sâu lồng nhau của Payload (Chống DoS / JSON Depth Bomb).
 */
export function validatePayloadSizeAndDepth(rawInput, maxSizeBytes = 102400, // 100 KB
maxDepth = 10 // Tối đa 10 tầng lồng nhau
) {
    if (!rawInput || typeof rawInput !== 'string') {
        return { isValid: true, byteSize: 0, depth: 0 };
    }
    const byteSize = new Blob([rawInput]).size;
    if (byteSize > maxSizeBytes) {
        return {
            isValid: false,
            byteSize,
            depth: 0,
            error: `Dung lượng payload ${byteSize} bytes vượt quá ngưỡng cho phép (${maxSizeBytes} bytes)`
        };
    }
    // Đếm độ sâu JSON bằng stack phân tích cú pháp ký tự ngoặc
    let currentDepth = 0;
    let maxEncounteredDepth = 0;
    let inString = false;
    let escapeNext = false;
    for (let i = 0; i < rawInput.length; i++) {
        const ch = rawInput[i];
        if (escapeNext) {
            escapeNext = false;
            continue;
        }
        if (ch === '\\' && inString) {
            escapeNext = true;
            continue;
        }
        if (ch === '"') {
            inString = !inString;
            continue;
        }
        if (!inString) {
            if (ch === '{' || ch === '[') {
                currentDepth++;
                if (currentDepth > maxEncounteredDepth)
                    maxEncounteredDepth = currentDepth;
                if (currentDepth > maxDepth) {
                    return {
                        isValid: false,
                        byteSize,
                        depth: currentDepth,
                        error: `Phát hiện rủi ro JSON Bomb: Độ sâu lồng nhau ${currentDepth} vượt quá giới hạn an toàn (${maxDepth})`
                    };
                }
            }
            else if (ch === '}' || ch === ']') {
                currentDepth = Math.max(0, currentDepth - 1);
            }
        }
    }
    return { isValid: true, byteSize, depth: maxEncounteredDepth };
}
/**
 * Xác thực cấu trúc Schema của các API dữ liệu chính thống.
 */
export function validateApiResponseSchema(data, schemaType) {
    const errors = [];
    if (!data || typeof data !== 'object') {
        return { isValid: false, schemaType, errors: ['Dữ liệu phản hồi rỗng hoặc không phải là Object'] };
    }
    switch (schemaType) {
        case 'weather':
            if (typeof data.temp !== 'number')
                errors.push('Thiếu hoặc sai kiểu dữ liệu trường nhiệt độ (temp: number)');
            if (typeof data.humidity !== 'number')
                errors.push('Thiếu hoặc sai kiểu dữ liệu trường độ ẩm (humidity: number)');
            if (!data.condition || typeof data.condition !== 'string')
                errors.push('Thiếu trường trạng thái thời tiết (condition: string)');
            break;
        case 'market':
            if (!Array.isArray(data.goldPrices) && !data.goldSjc) {
                errors.push('Thiếu dữ liệu bảng giá vàng (goldPrices: array hoặc goldSjc: object)');
            }
            if (!Array.isArray(data.currencyRates) && !data.usdRate) {
                errors.push('Thiếu dữ liệu tỷ giá ngoại tệ (currencyRates: array hoặc usdRate: object)');
            }
            break;
        case 'news':
            if (!Array.isArray(data.items) && !Array.isArray(data)) {
                errors.push('Cấu trúc tin tức bắt buộc phải là mảng hoặc chứa items: array');
            }
            else {
                const list = Array.isArray(data.items) ? data.items : data;
                if (list.length > 0) {
                    const first = list[0];
                    if (!first.title || typeof first.title !== 'string')
                        errors.push('Bài viết thiếu tiêu đề (title: string)');
                    if (!first.link || typeof first.link !== 'string')
                        errors.push('Bài viết thiếu liên kết (link: string)');
                }
            }
            break;
        default:
            errors.push(`Loại schema không được hỗ trợ: ${schemaType}`);
    }
    return {
        isValid: errors.length === 0,
        schemaType,
        errors
    };
}
// ─────────────────────────────────────────────────────────────────────────────
// PHÂN HỆ 5: REQUEST INTEGRITY, ANTI-REPLAY ATTACK & SECURITY HEADERS (REQ-042)
// ─────────────────────────────────────────────────────────────────────────────
const usedNonceStore = new Set();
/**
 * Kiểm tra tính toàn vẹn yêu cầu và chống tấn công phát lại (Anti-Replay Attack).
 * Quy tắc:
 * 1. Timestamp không được lệch quá maxDriftSec (mặc định 300s = 5 phút) so với đồng hồ hệ thống.
 * 2. Nonce (chuỗi ngẫu nhiên dùng một lần) không được xuất hiện lại trong cùng phiên.
 */
export function verifyRequestIntegrity(timestampMs, nonce, nowMs = Date.now(), maxDriftSec = 300) {
    if (!timestampMs || isNaN(timestampMs)) {
        return { isValid: false, reason: 'Yêu cầu thiếu timestamp hợp lệ' };
    }
    if (!nonce || typeof nonce !== 'string' || nonce.trim().length < 8) {
        return { isValid: false, reason: 'Nonce không hợp lệ (tối thiểu 8 ký tự)' };
    }
    // 1. Kiểm tra độ lệch thời gian (Time Drift Guard)
    const driftSec = Math.abs(nowMs - timestampMs) / 1000;
    if (driftSec > maxDriftSec) {
        return {
            isValid: false,
            reason: `Độ lệch thời gian ${Math.round(driftSec)}s vượt quá ngưỡng cho phép (${maxDriftSec}s), có nguy cơ Replay Attack`
        };
    }
    // 2. Kiểm tra Nonce tái sử dụng (Reused Nonce Guard)
    const nonceKey = `${nonce}_${Math.floor(timestampMs / 1000)}`;
    if (usedNonceStore.has(nonceKey)) {
        return {
            isValid: false,
            reason: 'Phát hiện Nonce đã được sử dụng trước đó (Replay Attack Detected)'
        };
    }
    usedNonceStore.add(nonceKey);
    // Dọn dẹp cache Nonce cũ để tránh rò rỉ bộ nhớ
    if (usedNonceStore.size > 5000) {
        usedNonceStore.clear();
    }
    return { isValid: true };
}
export function resetNonceStore() {
    usedNonceStore.clear();
}
/**
 * Đánh giá tính đầy đủ của bộ HTTP Security Headers theo tiêu chuẩn an ninh OWASP.
 */
export function evaluateSecurityHeaders(headers) {
    const normHeaders = {};
    for (const [k, v] of Object.entries(headers || {})) {
        normHeaders[k.toLowerCase()] = v;
    }
    const requiredHeaders = [
        { name: 'content-security-policy', weight: 30, desc: 'Chính sách bảo mật nội dung (CSP)' },
        { name: 'x-content-type-options', expected: 'nosniff', weight: 20, desc: 'Chống sniffing MIME type' },
        { name: 'x-frame-options', expected: ['sameorigin', 'deny'], weight: 20, desc: 'Chống Clickjacking (X-Frame-Options)' },
        { name: 'strict-transport-security', weight: 15, desc: 'Ép buộc kết nối HTTPS (HSTS)' },
        { name: 'referrer-policy', weight: 15, desc: 'Bảo vệ rò rỉ referrer' }
    ];
    let score = 0;
    const missingHeaders = [];
    const recommendations = [];
    for (const item of requiredHeaders) {
        const val = normHeaders[item.name];
        if (!val) {
            missingHeaders.push(item.name);
            recommendations.push(`Bổ sung header ${item.name} để ${item.desc}`);
        }
        else {
            if (item.expected) {
                const valLower = val.toLowerCase();
                const matches = Array.isArray(item.expected)
                    ? item.expected.some(exp => valLower.includes(exp))
                    : valLower.includes(item.expected);
                if (matches) {
                    score += item.weight;
                }
                else {
                    recommendations.push(`Header ${item.name} có giá trị '${val}' chưa đạt khuyến nghị chuẩn`);
                    score += Math.floor(item.weight / 2);
                }
            }
            else {
                score += item.weight;
            }
        }
    }
    return {
        score,
        totalChecks: requiredHeaders.length,
        missingHeaders,
        passed: score >= 80,
        recommendations
    };
}
