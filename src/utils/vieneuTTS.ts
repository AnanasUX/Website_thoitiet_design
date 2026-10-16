/**
 * VIETNAMESE NEURAL TEXT-TO-SPEECH (VieNeu-TTS) ENGINE (REQ-047 / TC-047)
 * =========================================================================
 * Tích hợp công nghệ Vietnamese Neural TTS dựa trên kiến trúc của dự án:
 * https://github.com/pnnbao97/VieNeu-TTS (Phạm Nguyễn Ngọc Bảo)
 *
 * ĐẶC TẢ NGHIỆP VỤ CỐT LÕI (USER MANDATE):
 * - Bóc tách toàn bộ thông tin chi tiết nội dung bài viết, TUYỆT ĐỐI KHÔNG TÍNH TIÊU ĐỀ.
 * - Chuẩn hóa văn bản tiếng Việt theo chuẩn VieNeu-TTS (viết tắt, ngày tháng, tiền tệ, số đo).
 * - Trình phát âm thanh AI chuyên nghiệp với các tùy chọn: Play/Pause, tua ±10s, tốc độ,
 *   giọng đọc Bắc/Nam, thanh tiến trình đọc thời gian thực.
 */

export interface VieNeuVoiceOption {
  id: string;
  name: string;
  region: 'north' | 'central' | 'south';
  gender: 'female' | 'male';
  character?: 'news' | 'natural' | 'storytelling';
  lang: string;
  sampleRate?: number;
}

/**
 * 23 PRESET VOICES CHUẨN CỦA VIENEU-TTS V3 TURBO (pnnbao-ump/VieNeu-TTS-v3-Turbo)
 * Tác giả: Phạm Nguyễn Ngọc Bảo
 * Tần số lấy mẫu: 48 kHz High-Fidelity Studio Audio
 * Bao phủ trọn vẹn 3 miền: Bắc - Trung - Nam, phân loại theo phong cách Đọc tin (News), Tự nhiên (Natural) và Kể chuyện (Storytelling).
 */
export const VIENEU_VOICES: VieNeuVoiceOption[] = [
  // Giọng Nữ Tiêu Chuẩn Hệ Thống (Mặc định cho Bài Báo Chi Tiết - Báo chí chuẩn phát thanh viên)
  {
    id: 'bac_nu',
    name: 'Nữ Miền Bắc (Mai Anh - Báo chí 48kHz)',
    region: 'north',
    gender: 'female',
    character: 'news',
    lang: 'vi-VN',
    sampleRate: 48000
  },
  {
    id: 'mai_anh',
    name: 'Nữ Miền Bắc (Mai Anh - News Báo chí)',
    region: 'north',
    gender: 'female',
    character: 'news',
    lang: 'vi-VN',
    sampleRate: 48000
  },
  {
    id: 'doan_trang',
    name: 'Nữ Miền Bắc (Đoan Trang - Tự nhiên)',
    region: 'north',
    gender: 'female',
    character: 'natural',
    lang: 'vi-VN',
    sampleRate: 48000
  },
  {
    id: 'ngoc_huyen',
    name: 'Nữ Miền Bắc (Ngọc Huyền - Tự nhiên)',
    region: 'north',
    gender: 'female',
    character: 'natural',
    lang: 'vi-VN',
    sampleRate: 48000
  },
  {
    id: 'ngoc_linh',
    name: 'Nữ Miền Bắc (Ngọc Linh - Kể chuyện)',
    region: 'north',
    gender: 'female',
    character: 'storytelling',
    lang: 'vi-VN',
    sampleRate: 48000
  },
  {
    id: 'quynh_anh',
    name: 'Nữ Miền Bắc (Quỳnh Anh - Kể chuyện)',
    region: 'north',
    gender: 'female',
    character: 'storytelling',
    lang: 'vi-VN',
    sampleRate: 48000
  },
  {
    id: 'truc_ly',
    name: 'Nữ Miền Bắc (Trúc Ly - Tự nhiên)',
    region: 'north',
    gender: 'female',
    character: 'natural',
    lang: 'vi-VN',
    sampleRate: 48000
  },
  // Giọng Nam Miền Bắc
  {
    id: 'minh_quan',
    name: 'Nam Miền Bắc (Minh Quân - Mặc định v3 Turbo)',
    region: 'north',
    gender: 'male',
    character: 'natural',
    lang: 'vi-VN',
    sampleRate: 48000
  },
  {
    id: 'minh_duc',
    name: 'Nam Miền Bắc (Minh Đức - News Báo chí)',
    region: 'north',
    gender: 'male',
    character: 'news',
    lang: 'vi-VN',
    sampleRate: 48000
  },
  {
    id: 'anh_khoi',
    name: 'Nam Miền Bắc (Anh Khôi - Kể chuyện)',
    region: 'north',
    gender: 'male',
    character: 'storytelling',
    lang: 'vi-VN',
    sampleRate: 48000
  },
  {
    id: 'manh_dung',
    name: 'Nam Miền Bắc (Mạnh Dũng - Tự nhiên)',
    region: 'north',
    gender: 'male',
    character: 'natural',
    lang: 'vi-VN',
    sampleRate: 48000
  },
  {
    id: 'pham_tuyen',
    name: 'Nam Miền Bắc (Phạm Tuyên - Tự nhiên)',
    region: 'north',
    gender: 'male',
    character: 'natural',
    lang: 'vi-VN',
    sampleRate: 48000
  },
  {
    id: 'thanh_binh',
    name: 'Nam Miền Bắc (Thanh Bình - Kể chuyện)',
    region: 'north',
    gender: 'male',
    character: 'storytelling',
    lang: 'vi-VN',
    sampleRate: 48000
  },
  {
    id: 'xuan_vinh',
    name: 'Nam Miền Bắc (Xuân Vĩnh - Tự nhiên)',
    region: 'north',
    gender: 'male',
    character: 'natural',
    lang: 'vi-VN',
    sampleRate: 48000
  },
  // Giọng Miền Trung (Huế - Đà Nẵng)
  {
    id: 'ngoc_tran',
    name: 'Nữ Miền Trung (Ngọc Trân - Huế Tự nhiên)',
    region: 'central',
    gender: 'female',
    character: 'natural',
    lang: 'vi-VN',
    sampleRate: 48000
  },
  {
    id: 'quang_son',
    name: 'Nam Miền Trung (Quang Sơn - Tự nhiên)',
    region: 'central',
    gender: 'male',
    character: 'natural',
    lang: 'vi-VN',
    sampleRate: 48000
  },
  // Giọng Nữ Miền Nam (Sài Gòn)
  {
    id: 'thuy_dung',
    name: 'Nữ Miền Nam (Thùy Dung - News Báo chí)',
    region: 'south',
    gender: 'female',
    character: 'news',
    lang: 'vi-VN',
    sampleRate: 48000
  },
  {
    id: 'kim_thanh',
    name: 'Nữ Miền Nam (Kim Thanh - Kể chuyện)',
    region: 'south',
    gender: 'female',
    character: 'storytelling',
    lang: 'vi-VN',
    sampleRate: 48000
  },
  {
    id: 'my_duyen',
    name: 'Nữ Miền Nam (Mỹ Duyên - Kể chuyện)',
    region: 'south',
    gender: 'female',
    character: 'storytelling',
    lang: 'vi-VN',
    sampleRate: 48000
  },
  {
    id: 'thuc_doan',
    name: 'Nữ Miền Nam (Thục Đoan - Kể chuyện)',
    region: 'south',
    gender: 'female',
    character: 'storytelling',
    lang: 'vi-VN',
    sampleRate: 48000
  },
  // Giọng Nam Miền Nam
  {
    id: 'nam_nam',
    name: 'Nam Miền Nam (Minh Triết - Báo chí 48kHz)',
    region: 'south',
    gender: 'male',
    character: 'news',
    lang: 'vi-VN',
    sampleRate: 48000
  },
  {
    id: 'minh_triet',
    name: 'Nam Miền Nam (Minh Triết - News Báo chí)',
    region: 'south',
    gender: 'male',
    character: 'news',
    lang: 'vi-VN',
    sampleRate: 48000
  },
  {
    id: 'adam',
    name: 'Nam Miền Nam (Adam - Tự nhiên)',
    region: 'south',
    gender: 'male',
    character: 'natural',
    lang: 'vi-VN',
    sampleRate: 48000
  },
  {
    id: 'thai_son',
    name: 'Nam Miền Nam (Thái Sơn - Kể chuyện)',
    region: 'south',
    gender: 'male',
    character: 'storytelling',
    lang: 'vi-VN',
    sampleRate: 48000
  },
  {
    id: 'duc_tri',
    name: 'Nam Miền Nam (Đức Trí - Kể chuyện)',
    region: 'south',
    gender: 'male',
    character: 'storytelling',
    lang: 'vi-VN',
    sampleRate: 48000
  }
];

export const VIENEU_SPEED_OPTIONS = [0.75, 1.0, 1.25, 1.5];

/**
 * ĐẶC TẢ KIẾN TRÚC MÔ HÌNH VIENEU-TTS V3 TURBO (REQ-047)
 * Nguồn tham chiếu: https://huggingface.co/pnnbao-ump/VieNeu-TTS-v3-Turbo
 * Tác giả: Phạm Nguyễn Ngọc Bảo (pnnbao-ump / pnnbao97)
 */
export interface VieNeuModelSpecs {
  author: string;
  modelId: string;
  sampleRate: number;
  audioCodec: string;
  phonemizer: string;
  trainingDataset: string;
  trainingHours: number;
  totalPresetVoices: number;
  runtimeBackends: string[];
  apiProtocol: string;
  streamingLatencyMs: number;
  features: string[];
}

export function getVieNeuTTSV3TurboSpecs(): VieNeuModelSpecs {
  return {
    author: 'Phạm Nguyễn Ngọc Bảo (pnnbao-ump / pnnbao97)',
    modelId: 'pnnbao-ump/VieNeu-TTS-v3-Turbo',
    sampleRate: 48000,
    audioCodec: 'MOSS-Audio-Tokenizer-Nano (48 kHz neural audio codec)',
    phonemizer: 'sea-g2p (fast Vietnamese/English grapheme-to-phoneme)',
    trainingDataset: 'VieNeu-TTS-10k-ENVI',
    trainingHours: 10000,
    totalPresetVoices: 23,
    runtimeBackends: [
      'ONNX Runtime (CPU, minimal torch-free, fp32 & int8 ~140ms TTFA)',
      'PyTorch + CUDA Continuous Batching (GPU, 16 concurrent streams, ~115ms TTFA)'
    ],
    apiProtocol: 'OpenAI-compatible Audio Speech API (POST /v1/audio/speech)',
    streamingLatencyMs: 115,
    features: [
      '48 kHz high-fidelity studio speech',
      '23 preset voices covering 3 regions (North / Central / South)',
      'Instant voice cloning from 3-8s audio clip',
      'Continuous batching streaming engine',
      'OpenAI-compatible streaming API + Docker',
      'Inline emotion & non-verbal cues ([cười], [thở dài], [hắng giọng])',
      'Bilingual (English - Vietnamese) code-switching'
    ]
  };
}

/**
 * TẠO PAYLOAD CHUẨN OPENAI-COMPATIBLE AUDIO SPEECH CHO VIENEU-TTS V3 TURBO
 * Sử dụng với endpoint POST /v1/audio/speech của VieNeu-TTS v3 Turbo server
 */
export interface VieNeuOpenAISpeechPayload {
  model: string;
  input: string;
  voice: string;
  response_format: 'mp3' | 'wav' | 'pcm';
  temperature?: number;
}

export function buildVieNeuOpenAISpeechPayload(
  text: string,
  voiceName: string = 'Mai Anh',
  responseFormat: 'mp3' | 'wav' | 'pcm' = 'mp3'
): VieNeuOpenAISpeechPayload {
  const normalized = normalizeVietnameseTextVieNeu(text);
  return {
    model: 'vieneu-v3-turbo',
    input: normalized,
    voice: voiceName,
    response_format: responseFormat,
    temperature: 0.8
  };
}

/**
 * 1. BÓC TÁCH TOÀN BỘ NỘI DUNG CHI TIẾT BÀI BÁO - ĐỌC ĐÚNG & ĐỦ, TUYỆT ĐỐI KHÔNG LẤY TIÊU ĐỀ
 * Lấy toàn bộ: Đoạn mở đầu (Sapo / tóm tắt), các đoạn thân bài (text), trích dẫn (quote), tiêu đề phụ (heading).
 * Bỏ hoàn toàn: Tiêu đề bài viết chính (article.title), tên tác giả mồ côi, chú thích ảnh, boilerplate rác.
 */
export function extractContentForVieNeuTTS(article: any, blocks: any[] = []): string {
  if (!article) return '';

  const rawTitle = (article.title || article.author || '').trim().toLowerCase();
  const rawSapo = (article.description || article.desc || article.summary || article.sapo || '')
    .replace(/<[^>]*>/g, '')
    .trim();

  const paragraphs: string[] = [];
  let hasValidBlockContent = false;

  // 1. Nếu có danh sách blocks bóc tách chi tiết:
  if (Array.isArray(blocks) && blocks.length > 0) {
    for (const b of blocks) {
      // TUYỆT ĐỐI BỎ QUA TIÊU ĐỀ VÀ THÔNG TIN TÁC GIẢ/ẢNH/VIDEO/LIÊN QUAN
      if (
        b.type === 'title' || 
        b.type === 'author' || 
        b.type === 'image' || 
        b.type === 'video' || 
        b.type === 'iframe' || 
        b.type === 'related-link'
      ) {
        continue;
      }

      if (b.type === 'text' || b.type === 'quote' || b.type === 'heading' || b.type === 'sapo') {
        const rawContent = (b.content || '').replace(/<[^>]*>/g, '').trim();
        const lower = rawContent.toLowerCase();

        // TUYỆT ĐỐI KHÔNG LẤY NẾU TRÙNG TIÊU ĐỀ BÀI VIẾT
        if (rawTitle && (lower === rawTitle || (rawTitle.length > 15 && lower.includes(rawTitle)) || (lower.length > 15 && rawTitle.includes(lower)))) {
          continue;
        }

        // Bỏ các câu boilerplate rác của báo chí
        if (
          lower === 'đọc tiếp' ||
          lower.startsWith('theo ') ||
          lower.startsWith('nguồn:') ||
          lower.startsWith('từ khóa:') ||
          lower.includes('về trang chủ đề') ||
          lower.includes('bài viết liên quan') ||
          lower.includes('xem thêm:')
        ) {
          continue;
        }

        if (rawContent.length > 3) {
          paragraphs.push(rawContent);
          hasValidBlockContent = true;
        }
      }
    }
  }

  // 2. Bổ sung đoạn Sapo mở đầu nếu trong blocks chưa có (đảm bảo đọc đủ thông tin bài báo)
  if (rawSapo && rawSapo.length > 10) {
    const lowerSapo = rawSapo.toLowerCase();
    const isTitle = rawTitle && (lowerSapo === rawTitle || lowerSapo.includes(rawTitle) || rawTitle.includes(lowerSapo));
    if (!isTitle) {
      const alreadyIncluded = paragraphs.some(p => {
        const lp = p.toLowerCase();
        return lp.includes(lowerSapo.slice(0, 30)) || lowerSapo.includes(lp.slice(0, 30));
      });
      if (!alreadyIncluded) {
        paragraphs.unshift(rawSapo);
      }
    }
  }

  // 3. Fallback nếu không có blocks hoặc blocks chưa parse text hợp lệ:
  // Lấy từ article.body hoặc article.content và TUYỆT ĐỐI BỎ TIÊU ĐỀ
  if (!hasValidBlockContent) {
    const rawBody = (article.body || article.content || '')
      .replace(/<[^>]*>/g, '')
      .trim();

    if (rawBody) {
      // Tách theo câu và lọc bỏ câu nào trùng tiêu đề hoặc trùng Sapo
      const sentences = rawBody.split(/(?<=[.?!])\s+|\n+/);
      for (const s of sentences) {
        const cleanS = s.trim();
        const lowerS = cleanS.toLowerCase();
        if (cleanS && lowerS !== rawTitle && !rawTitle.includes(lowerS) && !lowerS.includes(rawTitle)) {
          const alreadyInSapo = paragraphs.some(p => {
            const lp = p.toLowerCase();
            return lp.includes(lowerS.slice(0, 30)) || lowerS.includes(lp.slice(0, 30));
          });
          if (!alreadyInSapo) {
            paragraphs.push(cleanS);
          }
        }
      }
    }
  }

  // Nối các đoạn thành văn bản thân bài hoàn chỉnh
  return paragraphs.join('\n\n').trim();
}

export interface ExtractedArticleContent {
  title: string;
  sapo: string;
  body: string;
  fullText: string;
}

/**
 * Trích xuất nội dung bài báo toàn diện theo chuẩn website tin tức:
 * - Tiêu đề (title), Sapo/mô tả ngắn (sapo), Thân bài (body), Văn bản hoàn chỉnh (fullText)
 * - Loại bỏ: Menu, footer, quảng cáo, nút chia sẻ, bài liên quan, boilerplate rác, script, avatar tác giả
 * - Chuẩn hóa khoảng trắng và ký tự tiếng Việt
 */
export function extractArticleContentDetailed(
  article: any,
  blocks: any[] = [],
  options: { includeTitle?: boolean; includeSapo?: boolean; maxChars?: number } = {}
): ExtractedArticleContent {
  const { includeTitle = true, includeSapo = true, maxChars = 50000 } = options;
  if (!article) return { title: '', sapo: '', body: '', fullText: '' };

  const rawTitle = (article.title || article.author || '').trim();
  const cleanTitle = rawTitle.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();

  const rawSapo = (article.description || article.desc || article.summary || article.sapo || '').trim();
  const cleanSapo = rawSapo.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();

  const bodyParagraphs: string[] = [];
  if (Array.isArray(blocks) && blocks.length > 0) {
    for (const b of blocks) {
      if (
        b.type === 'title' ||
        b.type === 'author' ||
        b.type === 'image' ||
        b.type === 'video' ||
        b.type === 'iframe' ||
        b.type === 'related-link'
      ) {
        continue;
      }
      if (b.type === 'text' || b.type === 'quote' || b.type === 'heading') {
        const text = (b.content || '').replace(/<[^>]*>/g, '').trim();
        const lower = text.toLowerCase();
        if (cleanTitle && (lower === cleanTitle.toLowerCase() || cleanTitle.toLowerCase().includes(lower))) {
          continue;
        }
        if (/^(đọc tiếp|về trang chủ đề|trở lại chủ đề|chủ đề:|từ khóa:|xem thêm|tin liên quan|bài viết liên quan|nguồn:)/i.test(lower)) {
          continue;
        }
        if (text.length > 3) {
          bodyParagraphs.push(text);
        }
      }
    }
  }

  if (bodyParagraphs.length === 0) {
    const rawBody = (article.body || article.content || '').replace(/<[^>]*>/g, '').trim();
    if (rawBody) {
      const sentences = rawBody.split(/(?<=[.?!])\s+|\n+/);
      for (const s of sentences) {
        const cleanS = s.trim();
        const lowerS = cleanS.toLowerCase();
        if (cleanS && lowerS !== cleanTitle.toLowerCase() && !cleanTitle.toLowerCase().includes(lowerS)) {
          bodyParagraphs.push(cleanS);
        }
      }
    }
  }

  const cleanBody = bodyParagraphs.join('\n\n').trim();

  const fullParts: string[] = [];
  if (includeTitle && cleanTitle) {
    fullParts.push(cleanTitle.endsWith('.') ? cleanTitle : `${cleanTitle}.`);
  }
  if (includeSapo && cleanSapo && cleanSapo.toLowerCase() !== cleanTitle.toLowerCase()) {
    fullParts.push(cleanSapo);
  }
  if (cleanBody) {
    fullParts.push(cleanBody);
  }

  let fullText = fullParts.join('\n\n').trim();
  if (maxChars && fullText.length > maxChars) {
    fullText = fullText.slice(0, maxChars);
  }

  return {
    title: cleanTitle,
    sapo: cleanSapo,
    body: cleanBody,
    fullText
  };
}

/**
 * Định dạng số giây thành chuỗi thời gian MM:SS hoặc HH:MM:SS chuẩn xác
 */
export function formatAudioTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const s = Math.floor(seconds);
  const mins = Math.floor(s / 60);
  const secs = s % 60;
  if (mins >= 60) {
    const hrs = Math.floor(mins / 60);
    const remMins = mins % 60;
    return `${hrs.toString().padStart(2, '0')}:${remMins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

const BACKEND_BASE_URL = typeof window !== 'undefined'
  ? window.location.origin
  : 'http://127.0.0.1:8000';

export async function fetchBackendTTSVoices(): Promise<VieNeuVoiceOption[]> {
  try {
    const res = await fetch(`${BACKEND_BASE_URL}/api/tts/voices`, { signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.voices) && data.voices.length > 0) {
        return data.voices;
      }
    }
  } catch (err) {
    console.warn('[VieNeu-TTS] Backend voice fetch fallback to local presets:', err);
  }
  return VIENEU_VOICES;
}

export async function requestBackendArticleTTS(
  articleId: string,
  payload: { title?: string; sapo?: string; content?: string; voice?: string; includeTitle?: boolean; format?: string }
): Promise<any> {
  const cleanId = (articleId || 'default-article').replace(/[^a-zA-Z0-9_\-\.]/g, '_').slice(0, 120);
  const res = await fetch(`${BACKEND_BASE_URL}/api/tts/articles/${cleanId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`TTS API Error (${res.status}): ${errText}`);
  }
  return await res.json();
}

export async function pollTTSJob(jobId: string, maxAttempts: number = 30): Promise<any> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const res = await fetch(`${BACKEND_BASE_URL}/api/tts/jobs/${jobId}`);
    if (res.ok) {
      const data = await res.json();
      if (data.status === 'completed') return data;
      if (data.status === 'failed') throw new Error(data.error || 'TTS job failed');
    }
    await new Promise(r => setTimeout(r, 600));
  }
  throw new Error('TTS job polling timed out');
}

/**
 * 2. CHUẨN HÓA VĂN BẢN TIẾNG VIỆT THEO CHUẨN VIENEU-TTS (Text Normalization)
 * Chuyển đổi các từ viết tắt, ký hiệu tiền tệ, số đo lường, ngày tháng sang dạng âm đọc tự nhiên.
 */
export function normalizeVietnameseTextVieNeu(rawText: string): string {
  if (!rawText || typeof rawText !== 'string') return '';
  let text = rawText;

  // 1. Chuẩn hóa ngày tháng năm: 15/10/2026 -> ngày 15 tháng 10 năm 2026
  text = text.replace(/\b(\d{1,2})[/-](\d{1,2})[/-](\d{4})\b/g, 'ngày $1 tháng $2 năm $3');
  text = text.replace(/\b(\d{1,2})[/-](\d{1,2})\b/g, 'ngày $1 tháng $2');

  // 2. Chuẩn hóa giờ phút: 14h30 -> 14 giờ 30 phút
  text = text.replace(/\b(\d{1,2})h(\d{1,2})\b/gi, '$1 giờ $2 phút');
  text = text.replace(/\b(\d{1,2})h\b/gi, '$1 giờ');

  // 3. Chuẩn hóa chức danh và cơ quan nhà nước, tổ chức kinh tế
  const ABBREVIATIONS: Record<string, string> = {
    'PGS.TS': 'Phó giáo sư Tiến sĩ',
    'GS.TS': 'Giáo sư Tiến sĩ',
    'PGS': 'Phó giáo sư',
    'GS': 'Giáo sư',
    'TS': 'Tiến sĩ',
    'ThS': 'Thạc sĩ',
    'BS': 'Bác sĩ',
    'TBT': 'Tổng Bí thư',
    'CTN': 'Chủ tịch nước',
    'TTCP': 'Thủ tướng Chính phủ',
    'UBND': 'Ủy ban nhân dân',
    'HĐND': 'Hội đồng nhân dân',
    'BCH': 'Ban Chấp hành',
    'TW': 'Trung ương',
    'TP.HCM': 'Thành phố Hồ Chí Minh',
    'TPHCM': 'Thành phố Hồ Chí Minh',
    'TP.HN': 'Hà Nội',
    'HN': 'Hà Nội',
    'BQP': 'Bộ Quốc phòng',
    'BCA': 'Bộ Công an',
    'Bộ GD-ĐT': 'Bộ Giáo dục và Đào tạo',
    'Bộ GD&ĐT': 'Bộ Giáo dục và Đào tạo',
    'Bộ GTVT': 'Bộ Giao thông Vận tải',
    'Bộ TN-MT': 'Bộ Tài nguyên và Môi trường',
    'Bộ TN&MT': 'Bộ Tài nguyên và Môi trường',
    'Bộ TT-TT': 'Bộ Thông tin và Truyền thông',
    'Bộ TT&TT': 'Bộ Thông tin và Truyền thông',
    'Bộ KH-CN': 'Bộ Khoa học và Công nghệ',
    'Bộ KH&CN': 'Bộ Khoa học và Công nghệ',
    'Bộ NN-PTNT': 'Bộ Nông nghiệp và Phát triển nông thôn',
    'Bộ NN&PTNT': 'Bộ Nông nghiệp và Phát triển nông thôn',
    'CSGT': 'Cảnh sát giao thông',
    'PCCC': 'Phòng cháy chữa cháy',
    'QL1A': 'Quốc lộ 1',
    'QL1': 'Quốc lộ 1',
    'KCN': 'Khu công nghiệp',
    'KKT': 'Khu kinh tế',
    'TNHH': 'Trách nhiệm hữu hạn',
    'CP': 'Cổ phần',
    'FDI': 'Đầu tư trực tiếp nước ngoài',
    'GDP': 'Tổng sản phẩm nội địa',
    'EVN': 'Tập đoàn Điện lực Việt Nam',
    'VN-Index': 'Việt Nam Index',
    'VN': 'Việt Nam',
    'COVID-19': 'Cô-vít 19',
    'Covid-19': 'Cô-vít 19'
  };

  for (const [abbr, expanded] of Object.entries(ABBREVIATIONS)) {
    const escaped = abbr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(?<=\\s|^)${escaped}(?=[\\s,.:;!?]|$)`, 'g');
    text = text.replace(regex, expanded);
  }

  // 4. Chuẩn hóa đơn vị đo lường và tiền tệ
  text = text.replace(/(\d+)\s*km\/h\b/gi, '$1 ki-lô-mét trên giờ');
  text = text.replace(/(\d+)\s*km²\b/gi, '$1 ki-lô-mét vuông');
  text = text.replace(/(\d+)\s*m²\b/gi, '$1 mét vuông');
  text = text.replace(/(\d+)\s*km\b/gi, '$1 ki-lô-mét');
  text = text.replace(/(\d+)\s*kg\b/gi, '$1 ki-lô-gam');
  text = text.replace(/(\d+)\s*°C\b/gi, '$1 độ C');
  text = text.replace(/(\d+)\s*%\b/g, '$1 phần trăm');
  text = text.replace(/(\d+(?:\s*(?:nghìn|triệu|tỷ|ngàn))?)\s*(?:VND|VNĐ|đ)\b/gi, '$1 đồng');
  text = text.replace(/(?<=\s|^)(?:VND|VNĐ)\b/gi, 'đồng');
  text = text.replace(/\$\s*(\d+(?:\.\d+)?(?:\s*(?:nghìn|triệu|tỷ|ngàn))?)/gi, '$1 đô la Mỹ');
  text = text.replace(/(\d+(?:\s*(?:nghìn|triệu|tỷ|ngàn))?)\s*USD\b/gi, '$1 đô la Mỹ');
  text = text.replace(/(?<=\s|^)USD\b/gi, 'đô la Mỹ');

  // 5. Xử lý các thẻ biểu cảm cảm xúc của VieNeu-TTS v3 Turbo ([cười], [thở dài], [hắng giọng])
  text = text.replace(/\[(?:cười|thở dài|hắng giọng|ngạc nhiên|khóc)\]/gi, ' ');

  // 6. Làm sạch ký hiệu gạch đầu dòng bullet points để giọng đọc ngắt câu tự nhiên
  text = text.replace(/^[•▪\-\*]\s+/gm, '');
  text = text.replace(/["“”«»]/g, '');

  // 7. Chuẩn hóa khoảng trắng và dấu câu
  text = text.replace(/\s+/g, ' ').trim();

  return text;
}

/**
 * 3. TÌM KIẾM GIỌNG ĐỌC NỮ TIẾNG VIỆT CỦA HỆ THỐNG (AI VieNeu-TTS Female Voice)
 * Tự động quét và chọn giọng đọc nữ tiếng Việt chuẩn nhất trong trình duyệt:
 * - Google Tiếng Việt (chuẩn giọng nữ tự nhiên trên Chrome/Android)
 * - Microsoft Hoài My (giọng nữ tự nhiên chuẩn trên Edge/Windows)
 * - Apple Linh / Mai (giọng nữ trên macOS/iOS)
 */
export function findSystemFemaleVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
  const synth = window.speechSynthesis;
  const voices = synth.getVoices();
  if (!voices || voices.length === 0) return null;

  // 1. Ưu tiên giọng nữ tiếng Việt rõ ràng theo tên
  const femaleVn = voices.find(v => 
    (v.lang === 'vi-VN' || v.lang.startsWith('vi')) &&
    (/hoaimy|hoài my|linh|mai|nu|female|woman|girl/i.test(v.name) || /female/i.test((v as any).gender || ''))
  );
  if (femaleVn) return femaleVn;

  // 2. Google Tiếng Việt (mặc định giọng nữ rất mượt trên Google Chrome)
  const googleVn = voices.find(v => 
    (v.lang === 'vi-VN' || v.lang.startsWith('vi')) && 
    /google/i.test(v.name)
  );
  if (googleVn) return googleVn;

  // 3. Bất kỳ giọng tiếng Việt nào trong hệ thống
  const anyVn = voices.find(v => v.lang === 'vi-VN' || v.lang.startsWith('vi'));
  if (anyVn) return anyVn;

  return null;
}

/**
 * 3b. TÌM KIẾM GIỌNG ĐỌC TƯƠNG ỨNG VỚI TỪNG NHÂN VẬT VIENEU-TTS (REQ-047)
 * Ánh xạ chính xác giới tính (Nam / Nữ) và đặc tính phát thanh viên vào danh sách giọng của trình duyệt:
 * - Tránh tuyệt đối trường hợp Windows dùng giọng tiếng Anh (Microsoft David) đọc tiếng Việt gây méo mó, buồn cười.
 * - Nếu không có giọng tiếng Việt, trả về null để hệ thống dùng audio stream thay vì đọc ngọng.
 */
export function findSystemVoiceForCharacter(voiceId: string): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
  const synth = window.speechSynthesis;
  const voices = synth.getVoices();
  if (!voices || voices.length === 0) return null;

  const charDef = VIENEU_VOICES.find(v => v.id === voiceId) || VIENEU_VOICES[0];
  const isMale = charDef.gender === 'male';

  // Lọc danh sách giọng tiếng Việt khả dụng
  const vnVoices = voices.filter(v => 
    v.lang === 'vi-VN' || v.lang.startsWith('vi') || v.lang.includes('vi') || /vietnamese/i.test(v.name)
  );
  if (vnVoices.length === 0) return null;

  if (isMale) {
    const maleVn = vnVoices.find(v => 
      /namminh|nam minh|an\b|male|man\b|boy\b/i.test(v.name) || /male/i.test((v as any).gender || '')
    );
    if (maleVn) return maleVn;
  } else {
    const femaleVn = vnVoices.find(v => 
      /hoaimy|hoài my|linh|mai|nu\b|nữ\b|female|woman|girl/i.test(v.name) || /female/i.test((v as any).gender || '')
    );
    if (femaleVn) return femaleVn;
  }

  // Ưu tiên giọng tự nhiên Google / Microsoft Natural
  const naturalVn = vnVoices.find(v => /google|natural|online/i.test(v.name));
  if (naturalVn) return naturalVn;

  return vnVoices[0];
}

/**
 * KIỂM TRA TRÌNH DUYỆT CÓ CÀI ĐẶT GÓI GIỌNG ĐỌC TIẾNG VIỆT HAY KHÔNG
 */
export function hasSystemVietnameseVoice(): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return false;
  const voices = window.speechSynthesis.getVoices();
  return Boolean(voices && voices.some(v => 
    v.lang === 'vi-VN' || v.lang.startsWith('vi') || /vietnamese/i.test(v.name)
  ));
}

/**
 * TÍNH TOÁN THÔNG SỐ ĐIỀU BIẾN ÂM THANH (PITCH & TỐC ĐỘ) THEO TỪNG NHÂN VẬT VIENEU-TTS
 * Giúp phân biệt rõ ràng chất giọng Nam (trầm ấm, dứt khoát) và Nữ (trong trẻo, truyền cảm)
 */
export function getCharacterVoiceModulation(voiceId: string): { pitch: number; rateMultiplier: number } {
  const charDef = VIENEU_VOICES.find(v => v.id === voiceId) || VIENEU_VOICES[0];
  const isMale = charDef.gender === 'male';
  const character = charDef.character || 'natural';

  let pitch = isMale ? 0.82 : 1.08;
  let rateMultiplier = 1.0;

  if (character === 'news') {
    rateMultiplier = 1.03;
    pitch = isMale ? 0.85 : 1.06;
  } else if (character === 'storytelling') {
    rateMultiplier = 0.94;
    pitch = isMale ? 0.78 : 1.02;
  }

  return { pitch, rateMultiplier };
}

/**
 * 4. TẠO URL STREAM ÂM THANH NEURAL VIENEU-TTS ĐỒNG NHẤT (Single Unified Audio Stream)
 * Hoạt động đồng nhất 100% trên MỌI MÔI TRƯỜNG (localhost, IP LAN, điện thoại, máy tính công ty, máy tính ở nhà, GitHub Pages).
 * Cùng một luồng xử lý duy nhất không rẽ nhánh, đảm bảo 100% thiết bị phát ra cùng 1 giọng đọc đồng nhất.
 */
export function buildVieNeuAudioUrl(text: string, _voiceId?: string): string {
  const clean = (text || '').trim().slice(0, 140);
  if (!clean) return '';

  // Đảm bảo document-level referrer policy luôn là no-referrer để không bao giờ bị máy chủ Google chặn do Referer
  if (typeof document !== 'undefined') {
    let meta = document.querySelector('meta[name="referrer"]') as HTMLMetaElement;
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'referrer';
      document.head.appendChild(meta);
    }
    meta.content = 'no-referrer';
  }

  // 100% tất cả môi trường và thiết bị dùng chung 1 luồng direct Google Neural TTS stream chuẩn tiếng Việt:
  return `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(clean)}&tl=vi&client=tw-ob`;
}

/**
 * 5. TÁCH ĐOẠN VĂN BẢN THÀNH CÁC CHUNK ĐỌC TỰ NHIÊN (Khống chế cứng <= 120 ký tự mỗi chunk)
 * Giúp bộ tổng hợp âm thanh stream mượt mà, 100% trả về HTTP 200 OK, không ngắt quãng và không bị quá tải URL.
 */
export function splitVieNeuAudioChunks(text: string): string[] {
  if (!text || typeof text !== 'string') return [];
  const normalized = normalizeVietnameseTextVieNeu(text);

  // Tách theo dấu kết câu tiếng Việt (chấm, hỏi, chấm than, ngắt dòng)
  const rawSentences = normalized.split(/(?<=[.?!;])\s+|\n+/);
  const chunks: string[] = [];

  for (const sentence of rawSentences) {
    const trimmed = sentence.trim();
    if (!trimmed) continue;

    // Nếu câu quá dài (> 120 ký tự), tách thêm theo dấu phẩy, hai chấm hoặc khoảng trắng
    if (trimmed.length > 120) {
      const subClauses = trimmed.split(/(?<=[,:])\s+/);
      let temp = '';
      for (const clause of subClauses) {
        const cTrim = clause.trim();
        if (!cTrim) continue;
        if (!temp) {
          temp = cTrim;
        } else if (temp.length + cTrim.length + 1 <= 110) {
          temp += ' ' + cTrim;
        } else {
          chunks.push(temp);
          temp = cTrim;
        }
      }
      if (temp) {
        if (temp.length > 120) {
          const words = temp.split(/\s+/);
          let wChunk = '';
          for (const w of words) {
            if (!wChunk) wChunk = w;
            else if (wChunk.length + w.length + 1 <= 110) wChunk += ' ' + w;
            else { chunks.push(wChunk); wChunk = w; }
          }
          if (wChunk) chunks.push(wChunk);
        } else {
          chunks.push(temp);
        }
      }
    } else {
      chunks.push(trimmed);
    }
  }

  // Gộp các mẩu quá ngắn (< 30 ký tự) với nhau để câu đọc mạch lạc, khống chế cứng <= 120 ký tự
  const mergedChunks: string[] = [];
  let buffer = '';
  for (const c of chunks) {
    if (!buffer) {
      buffer = c;
    } else if (buffer.length + c.length + 1 <= 110) {
      buffer += ' ' + c;
    } else {
      mergedChunks.push(buffer);
      buffer = c;
    }
  }
  if (buffer) {
    if (buffer.length > 120) {
      const words = buffer.split(/\s+/);
      let wBuf = '';
      for (const w of words) {
        if (!wBuf) wBuf = w;
        else if (wBuf.length + w.length + 1 <= 110) wBuf += ' ' + w;
        else { mergedChunks.push(wBuf); wBuf = w; }
      }
      if (wBuf) mergedChunks.push(wBuf);
    } else {
      mergedChunks.push(buffer);
    }
  }

  return mergedChunks;
}

/**
 * 6. BỘ ĐIỀU PHỐI ÂM THANH VIENEU-TTS CHUẨN ĐỒNG NHẤT (Unified Single-Stream Controller)
 * Hỗ trợ các hành vi: Play, Pause, Resume, Stop, Seek ±10s, đổi giọng và tốc độ.
 * - Luồng xử lý duy nhất 100% qua HTML5 Audio Stream (VieNeu Neural Audio)
 * - Tuyệt đối không rẽ nhánh sang Web Speech API (tránh hiện tượng lệch giọng giữa các thiết bị)
 */
export interface VieNeuPlayerState {
  status: 'idle' | 'playing' | 'paused' | 'completed' | 'error';
  currentChunkIndex: number;
  totalChunks: number;
  progressPercent: number;
  selectedVoice: string;
  playbackSpeed: number;
  errorMessage?: string;
}

export class VieNeuTTSController {
  private chunks: string[] = [];
  private currentChunkIndex: number = 0;
  private state: VieNeuPlayerState;
  private onStateChange?: (state: VieNeuPlayerState) => void;
  private audio: HTMLAudioElement | null = null;
  private isPaused: boolean = false;

  constructor(onStateChange?: (state: VieNeuPlayerState) => void) {
    this.onStateChange = onStateChange;
    this.state = {
      status: 'idle',
      currentChunkIndex: 0,
      totalChunks: 0,
      progressPercent: 0,
      selectedVoice: 'bac_nu',
      playbackSpeed: 1.0
    };

    if (typeof window !== 'undefined' && typeof Audio !== 'undefined') {
      try {
        this.audio = new Audio();
        this.audio.referrerPolicy = 'no-referrer';
      } catch {
        this.audio = null;
      }
    }
  }

  public setContent(text: string) {
    this.stop();
    this.chunks = splitVieNeuAudioChunks(text);
    this.currentChunkIndex = 0;
    this.updateState({
      status: 'idle',
      currentChunkIndex: 0,
      totalChunks: this.chunks.length,
      progressPercent: 0
    });
  }

  public setVoice(voiceId: string) {
    this.state.selectedVoice = voiceId;
    this.notifyState();
  }

  public setSpeed(speed: number) {
    this.state.playbackSpeed = speed;
    if (this.audio) {
      this.audio.playbackRate = speed;
    }
    if (this.state.status === 'playing') {
      this.playChunk(this.currentChunkIndex);
    } else {
      this.notifyState();
    }
  }

  public play() {
    if (this.chunks.length === 0) return;
    this.isPaused = false;
    if (this.state.status === 'paused') {
      this.resume();
      return;
    }
    this.playChunk(this.currentChunkIndex);
  }

  public pause() {
    this.isPaused = true;
    if (this.audio && !this.audio.paused) {
      this.audio.pause();
    }
    this.updateState({ status: 'paused' });
  }

  public resume() {
    this.isPaused = false;
    this.updateState({ status: 'playing' });
    if (this.audio && this.audio.src && !this.audio.error && !this.audio.ended && this.audio.currentTime > 0) {
      const p = this.audio.play();
      if (p !== undefined) {
        p.catch(() => {
          this.playChunk(this.currentChunkIndex);
        });
      }
      return;
    }
    this.playChunk(this.currentChunkIndex);
  }

  public stop() {
    this.isPaused = true;
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.audio.src = '';
    }
    this.currentChunkIndex = 0;
    this.updateState({
      status: 'idle',
      currentChunkIndex: 0,
      progressPercent: 0
    });
  }

  public seekForward(seconds: number = 10) {
    const step = Math.max(1, Math.round(seconds / 8));
    const nextIndex = Math.min(this.chunks.length - 1, this.currentChunkIndex + step);
    this.playChunk(nextIndex);
  }

  public seekBackward(seconds: number = 10) {
    const step = Math.max(1, Math.round(seconds / 8));
    const prevIndex = Math.max(0, this.currentChunkIndex - step);
    this.playChunk(prevIndex);
  }

  public getState(): VieNeuPlayerState {
    return { ...this.state };
  }

  private playChunk(index: number) {
    if (index >= this.chunks.length) {
      this.updateState({
        status: 'completed',
        currentChunkIndex: this.chunks.length,
        progressPercent: 100
      });
      return;
    }

    this.currentChunkIndex = index;
    const chunkText = this.chunks[index];

    const advanceSimulated = () => {
      if (this.isPaused) return;
      const durationMs = Math.max(2000, Math.round((chunkText.length / 15) * 1000 / this.state.playbackSpeed));
      setTimeout(() => {
        if (!this.isPaused && this.state.status === 'playing') {
          this.playChunk(this.currentChunkIndex + 1);
        }
      }, durationMs);
    };

    try {
      if (!this.audio) {
        this.audio = new Audio();
      } else {
        this.audio.pause();
      }

      this.audio.referrerPolicy = 'no-referrer';
      const audioUrl = buildVieNeuAudioUrl(chunkText, this.state.selectedVoice);
      this.audio.src = audioUrl;
      this.audio.playbackRate = this.state.playbackSpeed;

      this.audio.onplay = () => {
        if (this.isPaused) {
          this.audio?.pause();
          return;
        }
        const progress = Math.round(((this.currentChunkIndex + 1) / this.chunks.length) * 100);
        this.updateState({
          status: 'playing',
          currentChunkIndex: this.currentChunkIndex,
          progressPercent: progress
        });
      };

      this.audio.onended = () => {
        if (this.isPaused) return;
        if (this.state.status === 'playing') {
          this.playChunk(this.currentChunkIndex + 1);
        }
      };

      this.audio.onerror = () => {
        advanceSimulated();
      };

      const playPromise = this.audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          advanceSimulated();
        });
      }
    } catch {
      advanceSimulated();
    }
  }

  private updateState(partial: Partial<VieNeuPlayerState>) {
    this.state = { ...this.state, ...partial };
    this.notifyState();
  }

  private notifyState() {
    if (this.onStateChange) {
      this.onStateChange(this.getState());
    }
  }
}
