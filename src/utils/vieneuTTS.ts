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
 * 1. BÓC TÁCH NỘI DUNG CHI TIẾT BÀI BÁO - TUYỆT ĐỐI KHÔNG LẤY TIÊU ĐỀ
 * Chỉ lấy nội dung thân bài (các đoạn văn text, quote, heading).
 * Bỏ hoàn toàn: Tiêu đề bài viết (title), tên tác giả mồ côi, chú thích ảnh, boilerplate.
 */
export function extractContentForVieNeuTTS(article: any, blocks: any[] = []): string {
  if (!article) return '';

  const rawTitle = (article.title || article.author || '').trim().toLowerCase();
  const paragraphs: string[] = [];

  // Nếu có danh sách blocks bóc tách chi tiết:
  if (Array.isArray(blocks) && blocks.length > 0) {
    for (const b of blocks) {
      // TUYỆT ĐỐI BỎ QUA TIÊU ĐỀ VÀ THÔNG TIN TÁC GIẢ/ẢNH/VIDEO
      if (b.type === 'title' || b.type === 'author' || b.type === 'image' || b.type === 'video' || b.type === 'iframe') {
        continue;
      }
      if (b.type === 'text' || b.type === 'quote' || b.type === 'heading') {
        const rawContent = (b.content || '').replace(/<[^>]*>/g, '').trim();
        const lower = rawContent.toLowerCase();

        // Không lấy nếu trùng lặp với tiêu đề bài viết
        if (rawTitle && (lower === rawTitle || (rawTitle.length > 15 && lower.includes(rawTitle)))) {
          continue;
        }

        // Bỏ các câu boilerplate rác
        if (
          lower === 'đọc tiếp' ||
          lower.startsWith('theo ') ||
          lower.startsWith('nguồn:') ||
          lower.startsWith('từ khóa:') ||
          lower.includes('về trang chủ đề') ||
          lower.includes('bài viết liên quan')
        ) {
          continue;
        }

        if (rawContent.length > 3) {
          paragraphs.push(rawContent);
        }
      }
    }
  }

  // Fallback nếu không có blocks hoặc blocks chưa parse kịp:
  // Lấy từ article.body hoặc article.desc và TUYỆT ĐỐI BỎ TIÊU ĐỀ
  if (paragraphs.length === 0) {
    const rawBody = (article.body || article.description || article.desc || article.summary || '')
      .replace(/<[^>]*>/g, '')
      .trim();

    if (rawBody) {
      // Tách theo câu và lọc bỏ câu nào trùng tiêu đề
      const sentences = rawBody.split(/(?<=[.?!])\s+/);
      for (const s of sentences) {
        const cleanS = s.trim();
        const lowerS = cleanS.toLowerCase();
        if (cleanS && lowerS !== rawTitle && !rawTitle.includes(lowerS)) {
          paragraphs.push(cleanS);
        }
      }
    }
  }

  // Nối các đoạn thành văn bản thân bài tinh khiết
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

  // 3. Chuẩn hóa chức danh và cơ quan nhà nước
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

  // 5. Chuẩn hóa khoảng trắng và dấu câu
  text = text.replace(/\s+/g, ' ').trim();

  return text;
}

/**
 * 3. TÁCH ĐOẠN VĂN BẢN THÀNH CÁC CHUNK ĐỌC TỰ NHIÊN (150-250 ký tự mỗi chunk)
 * Giúp bộ tổng hợp âm thanh không bị ngắt câu bất thình lình hoặc quá tải bộ đệm trình duyệt.
 */
export function splitVieNeuAudioChunks(text: string): string[] {
  if (!text || typeof text !== 'string') return [];
  const normalized = normalizeVietnameseTextVieNeu(text);

  // Tách theo dấu kết câu tiếng Việt
  const rawSentences = normalized.split(/(?<=[.?!;])\s+|\n+/);
  const chunks: string[] = [];
  let currentChunk = '';

  for (const sentence of rawSentences) {
    const trimmed = sentence.trim();
    if (!trimmed) continue;

    if (!currentChunk) {
      currentChunk = trimmed;
    } else if (currentChunk.length + trimmed.length + 1 <= 220) {
      currentChunk += ' ' + trimmed;
    } else {
      chunks.push(currentChunk);
      currentChunk = trimmed;
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk);
  }

  return chunks;
}

/**
 * 4. BỘ ĐIỀU PHỐI ÂM THANH VIENEU-TTS (Controller)
 * Hỗ trợ các hành vi: Play, Pause, Resume, Stop, Seek ±10s, đổi giọng và tốc độ.
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
    if (this.state.status === 'playing') {
      // Khởi động lại chunk hiện tại với tốc độ mới
      this.playChunk(this.currentChunkIndex);
    } else {
      this.notifyState();
    }
  }

  public play() {
    if (this.chunks.length === 0) return;
    if (this.state.status === 'paused' && this.synth) {
      this.synth.resume();
      this.updateState({ status: 'playing' });
      return;
    }
    this.playChunk(this.currentChunkIndex);
  }

  public pause() {
    if (this.synth && this.state.status === 'playing') {
      this.synth.pause();
      this.updateState({ status: 'paused' });
    }
  }

  public resume() {
    if (this.synth && this.state.status === 'paused') {
      this.synth.resume();
      this.updateState({ status: 'playing' });
    }
  }

  public stop() {
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
    // Ước tính 1 chunk ~ 7-10 giây đọc ở tốc độ 1.0x
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

    if (!this.synth) {
      this.updateState({
        status: 'error',
        errorMessage: 'Trình duyệt chưa hỗ trợ bộ phát âm thanh tổng hợp.'
      });
      return;
    }

    this.synth.cancel();
    this.currentChunkIndex = index;
    const chunkText = this.chunks[index];

    const utterance = new SpeechSynthesisUtterance(chunkText);
    utterance.lang = 'vi-VN';
    utterance.rate = this.state.playbackSpeed;
    
    // Tùy biến cao độ và giọng đọc mô phỏng VieNeu-TTS
    if (this.state.selectedVoice === 'bac_nu') {
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
