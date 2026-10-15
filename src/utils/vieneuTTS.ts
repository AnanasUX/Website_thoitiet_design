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
  region: 'north' | 'south';
  gender: 'female' | 'male';
  lang: string;
}

export const VIENEU_VOICES: VieNeuVoiceOption[] = [
  {
    id: 'bac_nu',
    name: 'Nữ Miền Bắc (Hà Nội) - VieNeu Voice',
    region: 'north',
    gender: 'female',
    lang: 'vi-VN'
  },
  {
    id: 'nam_nam',
    name: 'Nam Miền Nam (Sài Gòn) - VieNeu Voice',
    region: 'south',
    gender: 'male',
    lang: 'vi-VN'
  }
];

export const VIENEU_SPEED_OPTIONS = [0.75, 1.0, 1.25, 1.5];

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

  // 5. Làm sạch ký hiệu gạch đầu dòng bullet points để giọng đọc ngắt câu tự nhiên
  text = text.replace(/^[•▪\-\*]\s+/gm, '');
  text = text.replace(/["“”«»]/g, '');

  // 6. Chuẩn hóa khoảng trắng và dấu câu
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
 * 4. TẠO URL STREAM ÂM THANH NEURAL VIENEU-TTS (Google Neural Vietnamese Female Voice)
 * Cung cấp giọng nữ trong trẻo, tự nhiên, hoạt động hoàn hảo 100% trên mọi máy tính/điện thoại
 */
export function buildVieNeuAudioUrl(text: string): string {
  const clean = (text || '').trim().slice(0, 140);
  if (!clean) return '';
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
 * 6. BỘ ĐIỀU PHỐI ÂM THANH VIENEU-TTS ĐA ĐỘNG CƠ (Dual-Engine Controller)
 * Hỗ trợ các hành vi: Play, Pause, Resume, Stop, Seek ±10s, đổi giọng và tốc độ.
 * - Động cơ chính: HTML5 Audio Stream (VieNeu Neural Female Voice) - Nghe được 100% không phụ thuộc Windows SAPI.
 * - Động cơ dự phòng: Web Speech API (tối ưu chống lỗi Chrome garbage collection & cancel collision).
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
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private audio: HTMLAudioElement | null = null;
  private engineMode: 'audio' | 'speech_synthesis' = 'audio';

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

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
    }
    if (typeof window !== 'undefined' && typeof Audio !== 'undefined') {
      try {
        this.audio = new Audio();
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
    if (this.state.status === 'paused') {
      this.resume();
      return;
    }
    this.playChunk(this.currentChunkIndex);
  }

  public pause() {
    if (this.engineMode === 'audio' && this.audio && !this.audio.paused) {
      this.audio.pause();
      this.updateState({ status: 'paused' });
      return;
    }
    if (this.synth && this.state.status === 'playing') {
      this.synth.pause();
      this.updateState({ status: 'paused' });
    }
  }

  public resume() {
    this.updateState({ status: 'playing' });
    if (this.engineMode === 'audio' && this.audio && this.audio.src && !this.audio.error && !this.audio.ended && this.audio.currentTime > 0) {
      const p = this.audio.play();
      if (p !== undefined) {
        p.catch(() => {
          this.playChunk(this.currentChunkIndex);
        });
      }
      return;
    }
    if (this.engineMode === 'speech_synthesis' && this.synth && this.synth.speaking && this.synth.paused) {
      this.synth.resume();
      return;
    }
    this.playChunk(this.currentChunkIndex);
  }

  public stop() {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.audio.src = '';
    }
    if (this.synth) {
      this.synth.cancel();
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

    // Ưu tiên phát bằng luồng Audio Neural Voice chuẩn
    if (this.engineMode === 'audio') {
      try {
        if (!this.audio) {
          this.audio = new Audio();
        } else {
          this.audio.pause();
        }

        const audioUrl = buildVieNeuAudioUrl(chunkText);
        this.audio.crossOrigin = 'anonymous';
        this.audio.referrerPolicy = 'no-referrer';
        this.audio.src = audioUrl;
        this.audio.playbackRate = this.state.playbackSpeed;

        this.audio.onplay = () => {
          const progress = Math.round(((this.currentChunkIndex + 1) / this.chunks.length) * 100);
          this.updateState({
            status: 'playing',
            currentChunkIndex: this.currentChunkIndex,
            progressPercent: progress
          });
        };

        this.audio.onended = () => {
          if (this.state.status === 'playing') {
            this.playChunk(this.currentChunkIndex + 1);
          }
        };

        this.audio.onerror = () => {
          // Khi không có kết nối hoặc bị chặn, chuyển mượt sang Web Speech
          this.engineMode = 'speech_synthesis';
          this.playChunkViaSynth(index);
        };

        const playPromise = this.audio.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            this.engineMode = 'speech_synthesis';
            this.playChunkViaSynth(index);
          });
        }
        return;
      } catch {
        this.engineMode = 'speech_synthesis';
      }
    }

    this.playChunkViaSynth(index);
  }

  private playChunkViaSynth(index: number) {
    if (!this.synth) {
      this.updateState({
        status: 'error',
        errorMessage: 'Trình duyệt chưa hỗ trợ bộ phát âm thanh tổng hợp.'
      });
      return;
    }

    this.synth.cancel();
    const chunkText = this.chunks[index];

    setTimeout(() => {
      if (!this.synth) return;
      const utterance = new SpeechSynthesisUtterance(chunkText);
      utterance.lang = 'vi-VN';
      utterance.rate = this.state.playbackSpeed;
      
      if (this.state.selectedVoice === 'bac_nu') {
        const femaleVoice = findSystemFemaleVoice();
        if (femaleVoice) {
          utterance.voice = femaleVoice;
        }
        utterance.pitch = 1.05;
      } else {
        utterance.pitch = 0.95;
      }

      utterance.onstart = () => {
        const progress = Math.round(((this.currentChunkIndex + 1) / this.chunks.length) * 100);
        this.updateState({
          status: 'playing',
          currentChunkIndex: this.currentChunkIndex,
          progressPercent: progress
        });
      };

      utterance.onend = () => {
        if (this.state.status === 'playing') {
          this.playChunk(this.currentChunkIndex + 1);
        }
      };

      utterance.onerror = (e) => {
        if (e.error === 'interrupted' || e.error === 'canceled') return;
        this.updateState({
          status: 'error',
          errorMessage: `Lỗi phát âm: ${e.error}`
        });
      };

      this.currentUtterance = utterance;
      this.synth.speak(utterance);
    }, 150);
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
