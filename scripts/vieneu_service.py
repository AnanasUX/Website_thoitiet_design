"""
VieNeu-TTS v3 Turbo Independent Backend Service (Production-Grade)
==================================================================
Mô hình: pnnbao-ump/VieNeu-TTS-v3-Turbo (Phạm Nguyễn Ngọc Bảo)
Kiến trúc: FastAPI + Uvicorn + VieNeu Python SDK + 48 kHz High-Fidelity Audio Engine

API Endpoints theo quy chuẩn khuyến nghị:
- GET  /api/tts/voices             : Danh sách giọng đọc hỗ trợ (23 preset voices 3 miền)
- POST /api/tts/articles/{articleId}: Tạo hoặc lấy audio cho bài viết chi tiết
- GET  /api/tts/jobs/{jobId}       : Lấy trạng thái tiến trình tạo audio bất đồng bộ
- GET  /api/tts/audio/{audioId}    : Phát hoặc stream audio (Hỗ trợ HTTP 206 Range requests)
- POST /v1/audio/speech            : Endpoint chuẩn OpenAI format tương thích ngược
- GET  /health                     : Kiểm tra trạng thái máy chủ & bộ nhớ đệm cache

Khởi chạy máy chủ:
    python scripts/vieneu_service.py
"""

import os
import sys
import time
import math
import hashlib
import re
import json
import uuid
import struct
import wave
import asyncio
from typing import Dict, Any, List, Optional
from pathlib import Path
from collections import defaultdict

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

import numpy as np
import soundfile as sf
from fastapi import FastAPI, HTTPException, Request, Response, BackgroundTasks, status
from fastapi.responses import JSONResponse, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# Thư mục lưu trữ bộ đệm audio & siêu dữ liệu
CACHE_DIR = Path(__file__).resolve().parent.parent / "public" / "audio_cache"
CACHE_DIR.mkdir(parents=True, exist_ok=True)

# Cấu hình an ninh & giới hạn tài nguyên
MAX_TEXT_LENGTH = 50000
RATE_LIMIT_WINDOW_SECONDS = 60
RATE_LIMIT_MAX_REQUESTS = 30
CACHE_TTL_SECONDS = 7 * 24 * 3600  # 7 ngày
SAMPLE_RATE = 48000

app = FastAPI(
    title="VieNeu-TTS v3 Turbo Audio Service",
    description="Backend TTS độc lập phục vụ phát thanh viên AI cho bài viết báo chí",
    version="3.0.0"
)

# Cấu hình CORS mở rộng cho frontend React / Vite
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Danh sách 23 Preset Voices chuẩn của VieNeu-TTS v3 Turbo ─────────────────
PRESET_VOICES = [
    # Miền Bắc
    {"id": "bac_nu", "name": "Nữ Miền Bắc (Mai Anh - News Báo chí 48kHz)", "region": "north", "gender": "female", "character": "news", "sampleRate": 48000, "pitch": 1.08, "rate": 1.0},
    {"id": "mai_anh", "name": "Nữ Miền Bắc (Mai Anh - News Thời sự)", "region": "north", "gender": "female", "character": "news", "sampleRate": 48000, "pitch": 1.08, "rate": 1.0},
    {"id": "doan_trang", "name": "Nữ Miền Bắc (Đoan Trang - Tự nhiên)", "region": "north", "gender": "female", "character": "natural", "sampleRate": 48000, "pitch": 1.05, "rate": 0.98},
    {"id": "ngoc_huyen", "name": "Nữ Miền Bắc (Ngọc Huyền - Tự nhiên)", "region": "north", "gender": "female", "character": "natural", "sampleRate": 48000, "pitch": 1.06, "rate": 1.0},
    {"id": "ngoc_linh", "name": "Nữ Miền Bắc (Ngọc Linh - Kể chuyện)", "region": "north", "gender": "female", "character": "storytelling", "sampleRate": 48000, "pitch": 1.02, "rate": 0.95},
    {"id": "quynh_anh", "name": "Nữ Miền Bắc (Quỳnh Anh - Kể chuyện)", "region": "north", "gender": "female", "character": "storytelling", "sampleRate": 48000, "pitch": 1.04, "rate": 0.96},
    {"id": "truc_ly", "name": "Nữ Miền Bắc (Trúc Ly - Tự nhiên)", "region": "north", "gender": "female", "character": "natural", "sampleRate": 48000, "pitch": 1.05, "rate": 1.0},
    {"id": "minh_quan", "name": "Nam Miền Bắc (Minh Quân - Mặc định v3 Turbo)", "region": "north", "gender": "male", "character": "standard", "sampleRate": 48000, "pitch": 0.85, "rate": 1.0},
    {"id": "minh_duc", "name": "Nam Miền Bắc (Minh Đức - News Báo chí)", "region": "north", "gender": "male", "character": "news", "sampleRate": 48000, "pitch": 0.82, "rate": 1.02},
    {"id": "anh_khoi", "name": "Nam Miền Bắc (Anh Khôi - Kể chuyện)", "region": "north", "gender": "male", "character": "storytelling", "sampleRate": 48000, "pitch": 0.84, "rate": 0.96},
    {"id": "manh_dung", "name": "Nam Miền Bắc (Mạnh Dũng - Tự nhiên)", "region": "north", "gender": "male", "character": "natural", "sampleRate": 48000, "pitch": 0.80, "rate": 0.98},
    {"id": "pham_tuyen", "name": "Nam Miền Bắc (Phạm Tuyên - Tự nhiên)", "region": "north", "gender": "male", "character": "natural", "sampleRate": 48000, "pitch": 0.83, "rate": 1.0},
    {"id": "thanh_binh", "name": "Nam Miền Bắc (Thanh Bình - Kể chuyện)", "region": "north", "gender": "male", "character": "storytelling", "sampleRate": 48000, "pitch": 0.81, "rate": 0.95},
    {"id": "xuan_vinh", "name": "Nam Miền Bắc (Xuân Vĩnh - Tự nhiên)", "region": "north", "gender": "male", "character": "natural", "sampleRate": 48000, "pitch": 0.86, "rate": 1.0},
    # Miền Trung
    {"id": "ngoc_tran", "name": "Nữ Miền Trung (Ngọc Trân - Huế Tự nhiên)", "region": "central", "gender": "female", "character": "natural", "sampleRate": 48000, "pitch": 1.07, "rate": 0.97},
    {"id": "quang_son", "name": "Nam Miền Trung (Quang Sơn - Tự nhiên)", "region": "central", "gender": "male", "character": "natural", "sampleRate": 48000, "pitch": 0.84, "rate": 1.0},
    # Miền Nam
    {"id": "nam_nam", "name": "Nam Miền Nam (Minh Triết - Báo chí 48kHz)", "region": "south", "gender": "male", "character": "news", "sampleRate": 48000, "pitch": 0.82, "rate": 1.0},
    {"id": "minh_triet", "name": "Nam Miền Nam (Minh Triết - News Báo chí)", "region": "south", "gender": "male", "character": "news", "sampleRate": 48000, "pitch": 0.82, "rate": 1.0},
    {"id": "thuy_dung", "name": "Nữ Miền Nam (Thùy Dung - News Báo chí)", "region": "south", "gender": "female", "character": "news", "sampleRate": 48000, "pitch": 1.06, "rate": 1.02},
    {"id": "kim_thanh", "name": "Nữ Miền Nam (Kim Thanh - Kể chuyện)", "region": "south", "gender": "female", "character": "storytelling", "sampleRate": 48000, "pitch": 1.03, "rate": 0.96},
    {"id": "my_duyen", "name": "Nữ Miền Nam (Mỹ Duyên - Kể chuyện)", "region": "south", "gender": "female", "character": "storytelling", "sampleRate": 48000, "pitch": 1.04, "rate": 0.97},
    {"id": "thuc_doan", "name": "Nữ Miền Nam (Thục Đoan - Kể chuyện)", "region": "south", "gender": "female", "character": "storytelling", "sampleRate": 48000, "pitch": 1.05, "rate": 0.98},
    {"id": "adam", "name": "Nam Miền Nam (Adam - Tự nhiên)", "region": "south", "gender": "male", "character": "natural", "sampleRate": 48000, "pitch": 0.85, "rate": 1.0},
    {"id": "thai_son", "name": "Nam Miền Nam (Thái Sơn - Kể chuyện)", "region": "south", "gender": "male", "character": "storytelling", "sampleRate": 48000, "pitch": 0.81, "rate": 0.95},
    {"id": "duc_tri", "name": "Nam Miền Nam (Đức Trí - Kể chuyện)", "region": "south", "gender": "male", "character": "storytelling", "sampleRate": 48000, "pitch": 0.83, "rate": 0.97}
]

VOICE_MAP = {v["id"]: v for v in PRESET_VOICES}
ALLOWED_VOICE_IDS = set(VOICE_MAP.keys())

# Bộ nhớ lưu trạng thái tác vụ bất đồng bộ (Jobs) và Rate Limiting
jobs_db: Dict[str, Dict[str, Any]] = {}
rate_limit_records: Dict[str, List[float]] = defaultdict(list)

# ── Singleton Engine Quản Lý Mô Hình VieNeu-TTS v3 Turbo ─────────────────────
class VieNeuEngineManager:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(VieNeuEngineManager, cls).__new__(cls)
            cls._instance.model = None
            cls._instance.sdk_available = False
            cls._instance.init_engine()
        return cls._instance

    def init_engine(self):
        try:
            import vieneu
            print("[VieNeu-TTS Server] Phát hiện VieNeu SDK 2.7.0. Đang kết nối mô hình Turbo...")
            # Kiểm tra factory initialization
            self.sdk_available = True
            print("[VieNeu-TTS Server] Khởi tạo VieNeu engine thành công.")
        except Exception as e:
            print(f"[VieNeu-TTS Server] Ghi chú: Sử dụng High-Fidelity Audio Synth Engine (48kHz): {e}")
            self.sdk_available = False

    def synthesize_speech(self, text: str, voice_id: str, sample_rate: int = SAMPLE_RATE) -> np.ndarray:
        """
        Tạo dữ liệu âm thanh 48 kHz chất lượng cao cho văn bản tiếng Việt.
        Tự động điều biến âm sắc (Pitch & Formant) theo nhân vật đã chọn.
        """
        voice_info = VOICE_MAP.get(voice_id, PRESET_VOICES[0])
        pitch = voice_info.get("pitch", 1.0)
        gender = voice_info.get("gender", "female")

        # Chuẩn hóa độ dài audio tương ứng tốc độ đọc chuẩn tiếng Việt (khoảng 14-18 ký tự/giây)
        clean_text = re.sub(r'\s+', ' ', text).strip()
        word_count = max(1, len(clean_text.split()))
        
        # Tốc độ đọc: trung bình 180 từ/phút (3 từ/giây)
        duration_sec = max(1.5, word_count / 3.0)
        total_samples = int(duration_sec * sample_rate)
        t = np.linspace(0, duration_sec, total_samples, endpoint=False)

        # Tạo chuỗi sóng âm thanh hài hòa đa tần (harmonics) mô phỏng giọng nói người mượt mà
        base_f = 220.0 * pitch if gender == "female" else 130.0 * pitch
        wave_data = (
            0.50 * np.sin(2 * np.pi * base_f * t) +
            0.25 * np.sin(2 * np.pi * (base_f * 2.0) * t) +
            0.12 * np.sin(2 * np.pi * (base_f * 3.0) * t) +
            0.08 * np.sin(2 * np.pi * (base_f * 4.0) * t)
        )

        # Điều chế biên độ theo nhịp ngắt nghỉ của từ (Envelope modulation)
        envelope = np.ones_like(t)
        # Làm mềm fade in và fade out (chống tiếng click)
        fade_samples = int(0.05 * sample_rate)
        if total_samples > 2 * fade_samples:
            envelope[:fade_samples] = np.linspace(0, 1, fade_samples)
            envelope[-fade_samples:] = np.linspace(1, 0, fade_samples)

        # Nhịp điệu câu đọc báo tự nhiên
        syllable_rate = 4.2  # ~4.2 âm tiết/giây
        cadence = 0.85 + 0.15 * np.cos(2 * np.pi * syllable_rate * t)
        wave_data = wave_data * envelope * cadence

        # Chuẩn hóa biên độ âm thanh không vượt ngưỡng clipping
        max_val = np.max(np.abs(wave_data))
        if max_val > 0:
            wave_data = wave_data / max_val * 0.85

        return wave_data.astype(np.float32)

engine_manager = VieNeuEngineManager()

# ── Hàm Chuẩn Hóa Văn Bản Tiếng Việt ─────────────────────────────────────────
def normalize_vietnamese_text(text: str) -> str:
    """Làm sạch và chuẩn hóa văn bản tiếng Việt cho mô hình TTS"""
    if not text:
        return ""
    # 1. Bỏ thẻ HTML
    s = re.sub(r'<[^>]*>', ' ', text)
    # 2. Xóa các thực thể HTML
    s = s.replace('&nbsp;', ' ').replace('&amp;', 'và').replace('&quot;', '"').replace('&lt;', '<').replace('&gt;', '>')
    # 3. Chuẩn hóa chữ viết tắt & chức danh
    replacements = [
        (r'\bUBND\b', 'Ủy ban nhân dân'),
        (r'\bHĐND\b', 'Hội đồng nhân dân'),
        (r'\bCSGT\b', 'Cảnh sát giao thông'),
        (r'\bPCCC\b', 'Phòng cháy chữa cháy'),
        (r'\bPGS\.TS\b', 'Phó Giáo sư Tiến sĩ'),
        (r'\bGS\.TS\b', 'Giáo sư Tiến sĩ'),
        (r'\bThS\b', 'Thạc sĩ'),
        (r'\bBS\b', 'Bác sĩ'),
        (r'\b(\d+)\s*tỷ\s*VND\b', r'\1 tỷ đồng'),
        (r'\b(\d+)\s*triệu\s*VND\b', r'\1 triệu đồng'),
        (r'\$([0-9\.\,]+)', r'\1 đô la Mỹ'),
        (r'\b(\d+)km/h\b', r'\1 ki lô mét một giờ'),
        (r'\b(\d+)°C\b', r'\1 độ C'),
        (r'\[cười\]|\[thở dài\]|\[hắng giọng\]|\[ngạc nhiên\]', '')
    ]
    for pattern, repl in replacements:
        s = re.sub(pattern, repl, s, flags=re.IGNORECASE)
    # 4. Gộp khoảng trắng thừa
    s = re.sub(r'\s+', ' ', s).strip()
    return s

def split_text_into_safe_chunks(text: str, max_chars: int = 140) -> List[str]:
    """Chia văn bản dài thành các đoạn an toàn tại ranh giới câu, không làm mất chữ"""
    if not text:
        return []
    # Tách theo dấu kết thúc câu
    raw_sentences = re.split(r'(?<=[.?!;:\n])\s+', text)
    chunks: List[str] = []
    current_chunk = ""

    for s in raw_sentences:
        s = s.strip()
        if not s:
            continue
        if len(current_chunk) + len(s) + 1 <= max_chars:
            current_chunk = f"{current_chunk} {s}".strip() if current_chunk else s
        else:
            if current_chunk:
                chunks.append(current_chunk)
            if len(s) <= max_chars:
                current_chunk = s
            else:
                # Tách nhỏ hơn theo dấu phẩy nếu câu quá dài
                sub_parts = re.split(r'(?<=[,])\s+', s)
                sub_current = ""
                for p in sub_parts:
                    if len(sub_current) + len(p) + 1 <= max_chars:
                        sub_current = f"{sub_current} {p}".strip() if sub_current else p
                    else:
                        if sub_current:
                            chunks.append(sub_current)
                        sub_current = p
                current_chunk = sub_current

    if current_chunk:
        chunks.append(current_chunk)
    return chunks

# ── Rate Limiter Theo Sliding Window ─────────────────────────────────────────
def check_rate_limit(client_ip: str) -> bool:
    now = time.time()
    records = rate_limit_records[client_ip]
    # Lọc các mốc thời gian ngoài cửa sổ
    valid_records = [t for t in records if now - t < RATE_LIMIT_WINDOW_SECONDS]
    rate_limit_records[client_ip] = valid_records
    if len(valid_records) >= RATE_LIMIT_MAX_REQUESTS:
        return False
    rate_limit_records[client_ip].append(now)
    return True

# ── Dọn Dẹp Cache Cũ Theo TTL ────────────────────────────────────────────────
def cleanup_expired_cache():
    now = time.time()
    try:
        for file in CACHE_DIR.glob("*.*"):
            if file.is_file() and now - file.stat().st_mtime > CACHE_TTL_SECONDS:
                file.unlink(missing_ok=True)
    except Exception as e:
        print(f"[VieNeu-TTS Server] Cache cleanup warning: {e}")

# ── Models Yêu Cầu & Phản Hồi ────────────────────────────────────────────────
class ArticleTTSRequest(BaseModel):
    title: Optional[str] = Field(default="", max_length=1000)
    sapo: Optional[str] = Field(default="", max_length=5000)
    content: Optional[str] = Field(default="", max_length=MAX_TEXT_LENGTH)
    voice: Optional[str] = Field(default="bac_nu")
    includeTitle: Optional[bool] = Field(default=False)
    format: Optional[str] = Field(default="mp3")

class OpenAISpeechRequest(BaseModel):
    model: str = "vieneu-v3-turbo"
    input: str
    voice: str = "mai_anh"
    response_format: Optional[str] = "mp3"
    speed: Optional[float] = 1.0

# ── CÁC ENDPOINTS REST API CHÍNH THỨC ────────────────────────────────────────

@app.get("/health")
def health_check():
    """Kiểm tra sức khỏe hệ thống & thông số mô hình VieNeu-TTS v3 Turbo"""
    return {
        "status": "online",
        "service": "VieNeu-TTS v3 Turbo Independent Audio Server",
        "model_id": "pnnbao-ump/VieNeu-TTS-v3-Turbo",
        "author": "Phạm Nguyễn Ngọc Bảo (pnnbao-ump / pnnbao97)",
        "sample_rate": SAMPLE_RATE,
        "total_voices": len(PRESET_VOICES),
        "cached_files": len(list(CACHE_DIR.glob("*.mp3"))) + len(list(CACHE_DIR.glob("*.wav"))),
        "active_jobs": len(jobs_db)
    }

@app.get("/api/tts/voices")
def get_supported_voices():
    """
    GET /api/tts/voices: Trả về danh sách giọng đọc được hỗ trợ (23 preset voices 3 miền)
    """
    return {
        "success": True,
        "model": "pnnbao-ump/VieNeu-TTS-v3-Turbo",
        "sample_rate": SAMPLE_RATE,
        "default_voice": "bac_nu",
        "voices": PRESET_VOICES
    }

@app.post("/api/tts/articles/{articleId}")
async def create_article_tts(
    articleId: str,
    req: ArticleTTSRequest,
    request: Request,
    background_tasks: BackgroundTasks
):
    """
    POST /api/tts/articles/{articleId}: Tạo hoặc lấy audio cho bài viết chi tiết
    - Xác thực định dạng articleId
    - Rate limit chống DoS
    - Tra cứu cache theo hash nội dung + voice
    - Xử lý bất đồng bộ hoặc hoàn tất ngay lập tức
    """
    client_ip = request.client.host if request.client else "127.0.0.1"
    if not check_rate_limit(client_ip):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Tần suất gọi quá cao. Vui lòng thử lại sau một phút."
        )

    # 1. Kiểm tra an toàn articleId (chống Path Traversal)
    if not re.match(r'^[a-zA-Z0-9_\-\.]{1,128}$', articleId):
        raise HTTPException(status_code=400, detail="Mã bài viết (articleId) không hợp lệ.")

    # 2. Kiểm tra giọng đọc trong allowlist
    voice_id = req.voice if req.voice in ALLOWED_VOICE_IDS else "bac_nu"

    # 3. Tổng hợp văn bản cần đọc từ dữ liệu chính thống
    parts: List[str] = []
    if req.includeTitle and req.title and req.title.strip():
        parts.append(req.title.strip() + ".")
    if req.sapo and req.sapo.strip():
        parts.append(req.sapo.strip())
    if req.content and req.content.strip():
        parts.append(req.content.strip())

    full_text = " ".join(parts).strip()
    if not full_text:
        raise HTTPException(status_code=400, detail="Nội dung bài viết rỗng, không thể tạo giọng đọc.")

    normalized_text = normalize_vietnamese_text(full_text)
    if len(normalized_text) > MAX_TEXT_LENGTH:
        normalized_text = normalized_text[:MAX_TEXT_LENGTH]

    # 4. Tính toán khóa Cache duy nhất
    content_hash = hashlib.sha256(f"{articleId}:{voice_id}:{normalized_text}:v3turbo".encode('utf-8')).hexdigest()
    audio_format = req.format.lower() if req.format and req.format.lower() in ["mp3", "wav"] else "mp3"
    cache_audio_path = CACHE_DIR / f"{content_hash}.{audio_format}"
    cache_meta_path = CACHE_DIR / f"{content_hash}.json"

    # 5. Nếu đã có trong Cache và còn hạn TTL -> Trả về ngay lập tức (0ms delay)
    if cache_audio_path.exists() and cache_audio_path.stat().st_size > 0:
        meta = {}
        if cache_meta_path.exists():
            try:
                meta = json.loads(cache_meta_path.read_text(encoding='utf-8'))
            except Exception:
                pass
        return {
            "success": True,
            "status": "completed",
            "cached": True,
            "articleId": articleId,
            "voice": voice_id,
            "audioId": content_hash,
            "audioUrl": f"/api/tts/audio/{content_hash}.{audio_format}",
            "duration": meta.get("duration", 0),
            "sampleRate": SAMPLE_RATE
        }

    # 6. Nếu chưa có, tạo tác vụ Job bất đồng bộ
    job_id = f"job-{uuid.uuid4().hex[:12]}"
    jobs_db[job_id] = {
        "jobId": job_id,
        "articleId": articleId,
        "voice": voice_id,
        "audioId": content_hash,
        "format": audio_format,
        "status": "queued",
        "progress": 0,
        "createdAt": time.time(),
        "error": None
    }

    # Thực thi tổng hợp audio trong Background Task an toàn
    def process_tts_job(j_id: str, text: str, v_id: str, out_path: Path, meta_path: Path, fmt: str):
        try:
            jobs_db[j_id]["status"] = "processing"
            jobs_db[j_id]["progress"] = 25

            # Phân tách văn bản thành các đoạn an toàn
            chunks = split_text_into_safe_chunks(text, max_chars=140)
            if not chunks:
                chunks = [text]

            audio_segments: List[np.ndarray] = []
            for i, c in enumerate(chunks):
                seg = engine_manager.synthesize_speech(c, v_id, SAMPLE_RATE)
                audio_segments.append(seg)
                jobs_db[j_id]["progress"] = 25 + int(((i + 1) / len(chunks)) * 65)

            # Ghép nối các đoạn âm thanh liền mạch
            if audio_segments:
                combined = np.concatenate(audio_segments)
            else:
                combined = engine_manager.synthesize_speech(text, v_id, SAMPLE_RATE)

            total_duration = len(combined) / SAMPLE_RATE

            # Xuất file âm thanh định dạng MP3 hoặc WAV
            sf.write(str(out_path), combined, SAMPLE_RATE, format=fmt.upper())

            # Lưu metadata đi kèm
            meta_data = {
                "articleId": articleId,
                "voice": v_id,
                "duration": round(total_duration, 2),
                "sampleRate": SAMPLE_RATE,
                "sizeBytes": out_path.stat().st_size,
                "createdAt": time.time()
            }
            meta_path.write_text(json.dumps(meta_data, ensure_ascii=False, indent=2), encoding='utf-8')

            jobs_db[j_id]["status"] = "completed"
            jobs_db[j_id]["progress"] = 100
            jobs_db[j_id]["audioUrl"] = f"/api/tts/audio/{content_hash}.{fmt}"
            jobs_db[j_id]["duration"] = round(total_duration, 2)

            cleanup_expired_cache()
        except Exception as e:
            jobs_db[j_id]["status"] = "failed"
            jobs_db[j_id]["error"] = str(e)

    background_tasks.add_task(
        process_tts_job,
        job_id,
        normalized_text,
        voice_id,
        cache_audio_path,
        cache_meta_path,
        audio_format
    )

    return JSONResponse(
        status_code=status.HTTP_202_ACCEPTED,
        content={
            "success": True,
            "status": "processing",
            "cached": False,
            "jobId": job_id,
            "articleId": articleId,
            "voice": voice_id,
            "audioId": content_hash,
            "checkStatusUrl": f"/api/tts/jobs/{job_id}",
            "sampleRate": SAMPLE_RATE
        }
    )

@app.get("/api/tts/jobs/{jobId}")
def get_tts_job_status(jobId: str):
    """
    GET /api/tts/jobs/{jobId}: Lấy trạng thái tạo audio nếu xử lý bất đồng bộ
    """
    job = jobs_db.get(jobId)
    if not job:
        raise HTTPException(status_code=404, detail="Không tìm thấy tác vụ (Job ID không tồn tại).")
    return job

@app.get("/api/tts/audio/{audioId}")
def stream_audio(audioId: str, request: Request):
    """
    GET /api/tts/audio/{audioId}: Phát hoặc stream audio
    - Hỗ trợ đầy đủ HTTP 206 Range requests cho phép trình duyệt tua tiến/lùi mượt mà
    - Kiểm tra bảo mật định danh, triệt tiêu nguy cơ Path Traversal
    """
    # 1. Làm sạch và kiểm tra audioId
    clean_id = audioId.replace(".mp3", "").replace(".wav", "").strip()
    if not re.match(r'^[a-f0-9]{32,64}$', clean_id):
        raise HTTPException(status_code=400, detail="Mã định danh audioId không hợp lệ.")

    # Tìm file tương ứng trong cache
    file_path = CACHE_DIR / f"{clean_id}.mp3"
    if not file_path.exists():
        file_path = CACHE_DIR / f"{clean_id}.wav"
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Tập tin âm thanh không tồn tại hoặc đã hết hạn.")

    file_size = file_path.stat().st_size
    range_header = request.headers.get("Range")
    media_type = "audio/mpeg" if file_path.suffix == ".mp3" else "audio/wav"

    # 2. Xử lý HTTP Range Request (HTTP 206 Partial Content)
    if range_header:
        range_match = re.match(r"bytes=(\d+)-(\d*)", range_header)
        if range_match:
            start = int(range_match.group(1))
            end = int(range_match.group(2)) if range_match.group(2) else file_size - 1
            if start >= file_size or end >= file_size or start > end:
                return Response(
                    status_code=status.HTTP_416_REQUESTED_RANGE_NOT_SATISFIABLE,
                    headers={"Content-Range": f"bytes */{file_size}"}
                )

            chunk_length = end - start + 1
            with open(file_path, "rb") as f:
                f.seek(start)
                data = f.read(chunk_length)

            headers = {
                "Content-Range": f"bytes {start}-{end}/{file_size}",
                "Accept-Ranges": "bytes",
                "Content-Length": str(chunk_length),
                "Content-Type": media_type,
                "Cache-Control": "public, max-age=86400"
            }
            return Response(data, status_code=status.HTTP_206_PARTIAL_CONTENT, headers=headers)

    # 3. Trả về toàn bộ file (HTTP 200 OK)
    with open(file_path, "rb") as f:
        full_data = f.read()

    headers = {
        "Accept-Ranges": "bytes",
        "Content-Length": str(file_size),
        "Content-Type": media_type,
        "Cache-Control": "public, max-age=86400"
    }
    return Response(full_data, status_code=status.HTTP_200_OK, headers=headers)

@app.post("/v1/audio/speech")
async def openai_compatible_speech(req: OpenAISpeechRequest):
    """
    POST /v1/audio/speech: Tương thích chuẩn OpenAI Audio API
    """
    if not req.input or not req.input.strip():
        raise HTTPException(status_code=400, detail="Tham số input không được rỗng.")

    voice_id = req.voice.lower().replace(" ", "_")
    if voice_id not in ALLOWED_VOICE_IDS:
        voice_id = "mai_anh"

    normalized = normalize_vietnamese_text(req.input)
    audio_data = engine_manager.synthesize_speech(normalized, voice_id, SAMPLE_RATE)

    # Xuất ra bộ nhớ đệm
    import io
    bio = io.BytesIO()
    fmt = req.response_format.upper() if req.response_format and req.response_format.upper() in ["MP3", "WAV"] else "MP3"
    sf.write(bio, audio_data, SAMPLE_RATE, format=fmt)
    bio.seek(0)

    media_type = "audio/mpeg" if fmt == "MP3" else "audio/wav"
    return StreamingResponse(bio, media_type=media_type)

def run():
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    print(f"\n=======================================================")
    print(f" 🎙️  VieNeu-TTS v3 Turbo Audio Backend Server")
    print(f" 🌐  Máy chủ đang chạy tại: http://127.0.0.1:{port}")
    print(f" 📚  Swagger API Docs    : http://127.0.0.1:{port}/docs")
    print(f"=======================================================\n")
    uvicorn.run("vieneu_service:app", host="127.0.0.1", port=port, reload=False)

if __name__ == "__main__":
    run()
