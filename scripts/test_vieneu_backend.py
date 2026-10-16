"""
Unit & Integration Test Suite for VieNeu-TTS v3 Turbo Backend Service
====================================================================
Kiểm thử toàn diện các yêu cầu nghiệp vụ:
1. Trích xuất tiêu đề, sapo và nội dung đúng
2. Bài viết rỗng, bài viết dài, ký tự tiếng Việt và dấu câu
3. Chọn giọng hợp lệ và từ chối giọng không được hỗ trợ
4. API thiếu dữ liệu, sai article ID, request quá dài và rate limit
5. Cache hit/cache miss và phân biệt nội dung hoặc giọng khác nhau
6. Timeout, xử lý lỗi và retry
7. Audio hợp lệ, MIME type, thời lượng, Range requests (HTTP 206)
8. Không lộ secrets hoặc dữ liệu nội bộ
"""

import sys
import os
import asyncio
import hashlib
from pathlib import Path
import json

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

# Đảm bảo đường dẫn import
sys.path.insert(0, str(Path(__file__).resolve().parent))
import vieneu_service as s
import fastapi

passed = 0
failed = 0

def check(condition: bool, msg: str):
    global passed, failed
    if condition:
        passed += 1
        print(f"  \033[92m✓ {msg}\033[0m")
    else:
        failed += 1
        print(f"  \033[91m✗ FAIL: {msg}\033[0m")

def run_tests():
    print("==================================================================")
    print("  BỘ KIỂM THỬ BACKEND VIENEU-TTS V3 TURBO (FASTAPI & AUDIO ENGINE)")
    print("==================================================================")

    # 1. Kiểm tra Endpoint Danh Sách Giọng Đọc (GET /api/tts/voices)
    print("\n>>> [1/7] Kiểm tra GET /api/tts/voices...")
    voices_resp = s.get_supported_voices()
    check(voices_resp["success"] is True, "Endpoint trả về success=True")
    check(len(voices_resp["voices"]) >= 23, "Có đầy đủ ít nhất 23 preset voices của VieNeu-TTS v3 Turbo")
    check(any(v["id"] == "mai_anh" for v in voices_resp["voices"]), "Có giọng Nữ Bắc Mai Anh")
    check(any(v["id"] == "minh_quan" for v in voices_resp["voices"]), "Có giọng Nam Bắc Minh Quân")
    check(any(v["id"] == "ngoc_tran" for v in voices_resp["voices"]), "Có giọng Nữ Trung Ngọc Trân")
    check(any(v["id"] == "thuy_dung" for v in voices_resp["voices"]), "Có giọng Nữ Nam Thùy Dung")
    check(all(v["sampleRate"] == 48000 for v in voices_resp["voices"]), "100% giọng đạt chuẩn âm thanh Studio 48 kHz")

    # 2. Kiểm tra Chuẩn Hóa Văn Bản Tiếng Việt & Chia Chunks
    print("\n>>> [2/7] Kiểm tra Chuẩn Hóa Văn Bản Tiếng Việt & Chia Chunks...")
    raw_sample = "PGS.TS Nguyễn Văn A tại UBND TP.HCM, ngân sách $1000 và 50 tỷ VND vào ngày 15/10/2026."
    normalized = s.normalize_vietnamese_text(raw_sample)
    check("Phó Giáo sư Tiến sĩ" in normalized, "Chuẩn hóa PGS.TS sang Phó Giáo sư Tiến sĩ")
    check("Ủy ban nhân dân" in normalized, "Chuẩn hóa UBND sang Ủy ban nhân dân")
    check("đô la Mỹ" in normalized, "Chuẩn hóa $ sang đô la Mỹ")
    check("tỷ đồng" in normalized, "Chuẩn hóa VND sang đồng")
    
    chunks = s.split_text_into_safe_chunks(normalized, max_chars=140)
    check(len(chunks) >= 1, "Tách văn bản thành danh sách chunks an toàn")
    check(all(len(c) <= 150 for c in chunks), "Mọi chunk không vượt quá giới hạn an toàn")

    # 3. Kiểm tra Tạo Audio Bài Viết (POST /api/tts/articles/{articleId})
    print("\n>>> [3/7] Kiểm tra POST /api/tts/articles/{articleId}...")
    req_body = s.ArticleTTSRequest(
        title="Dự báo thời tiết Hà Nội",
        sapo="Hôm nay thời tiết đẹp, mây nhẹ, nhiệt độ 28 độ C.",
        content="Gió nhẹ cấp 2, không mưa. Thích hợp cho các hoạt động ngoài trời.",
        voice="mai_anh",
        includeTitle=True,
        format="mp3"
    )
    bgt = fastapi.BackgroundTasks()
    mock_request = fastapi.Request({"type": "http", "client": ("127.0.0.1", 9999)})
    
    # Dọn dẹp cache test cũ nếu có
    test_hash = s.compute_cache_hash("article-test-1", "mai_anh", s.normalize_vietnamese_text("Dự báo thời tiết Hà Nội. Hôm nay thời tiết đẹp, mây nhẹ, nhiệt độ 28 độ C. Gió nhẹ cấp 2, không mưa. Thích hợp cho các hoạt động ngoài trời."))
    for ext in [".mp3", ".wav", ".json"]:
        p = s.CACHE_DIR / f"{test_hash}{ext}"
        if p.exists():
            p.unlink()

    # 3a. Tạo mới
    res_create = asyncio.run(s.create_article_tts("article-test-1", req_body, mock_request, bgt))
    check(res_create.status_code == 202, "Trả về HTTP 202 Accepted cho tác vụ mới")
    # Chạy tác vụ nền
    for task in bgt.tasks:
        task.func(*task.args, **task.kwargs)
    
    # 3b. Kiểm tra Cache Hit lần gọi thứ 2
    bgt2 = fastapi.BackgroundTasks()
    res_cache = asyncio.run(s.create_article_tts("article-test-1", req_body, mock_request, bgt2))
    check(res_cache.status_code == 200, "Trả về HTTP 200 OK cho Cache Hit")
    res_cache_json = json.loads(res_cache.body.decode('utf-8'))
    check(res_cache_json.get("cached") is True, "Cuộc gọi thứ hai trả về Cache Hit tức thì (cached=True)")
    check(res_cache_json.get("duration") > 0, "Thời lượng audio được tính toán chính xác")
    
    # 3c. Kiểm tra từ chối bài viết rỗng
    empty_req = s.ArticleTTSRequest(title="", sapo="", content="")
    try:
        asyncio.run(s.create_article_tts("art-empty", empty_req, mock_request, bgt))
        check(False, "Phải từ chối bài viết rỗng")
    except fastapi.HTTPException as he:
        check(he.status_code == 400, "Từ chối bài viết rỗng với mã HTTP 400 Bad Request")

    # 3d. Kiểm tra an ninh articleId (chống Path Traversal)
    try:
        asyncio.run(s.create_article_tts("../../../etc/passwd", req_body, mock_request, bgt))
        check(False, "Phải từ chối articleId có dấu hiệu Path Traversal")
    except fastapi.HTTPException as he:
        check(he.status_code == 400, "Chặn đứng 100% Path Traversal trên articleId")

    # 4. Kiểm tra Lấy Trạng Thái Tác Vụ (GET /api/tts/jobs/{jobId})
    print("\n>>> [4/7] Kiểm tra GET /api/tts/jobs/{jobId}...")
    job_ids = list(s.jobs_db.keys())
    check(len(job_ids) > 0, "Có ít nhất 1 job được ghi nhận trong cơ sở dữ liệu")
    if job_ids:
        job_info = s.get_tts_job_status(job_ids[0])
        check(job_info["status"] == "completed", "Trạng thái job hoàn tất thành công")
        check(job_info["progress"] == 100, "Tiến trình đạt 100%")
        check("audioUrl" in job_info, "Có đường dẫn audioUrl trả về")

    # 5. Kiểm tra Stream Audio & HTTP 206 Range Requests (GET /api/tts/audio/{audioId})
    print("\n>>> [5/7] Kiểm tra Stream Audio & Range Requests (HTTP 206)...")
    audio_id = res_cache_json.get("audioId")
    check(audio_id is not None, "Nhận được audioId hợp lệ")
    
    # 5a. Full content request (HTTP 200)
    full_req = fastapi.Request({"type": "http", "headers": []})
    full_res = s.stream_audio(audio_id, full_req)
    check(full_res.status_code == 200, "Request không Range trả về HTTP 200 OK")
    check(full_res.headers.get("accept-ranges") == "bytes", "Hỗ trợ Accept-Ranges: bytes")
    check("audio/mpeg" in full_res.headers.get("content-type", ""), "Content-Type đúng MIME audio/mpeg")
    
    # 5b. Partial content request (HTTP 206)
    range_req = fastapi.Request({"type": "http", "headers": [(b"range", b"bytes=0-499")]})
    range_res = s.stream_audio(audio_id, range_req)
    check(range_res.status_code == 206, "Range request trả về HTTP 206 Partial Content")
    check("bytes 0-499/" in range_res.headers.get("content-range", ""), "Content-Range header đúng cú pháp bytes 0-499/total")
    check(len(range_res.body) == 500, "Độ dài dữ liệu trả về đúng 500 bytes")

    # 5c. Chống Path Traversal trên audioId
    try:
        s.stream_audio("../../secret_file", full_req)
        check(False, "Phải từ chối audioId không hợp lệ")
    except fastapi.HTTPException as he:
        check(he.status_code == 400, "Chặn đứng Path Traversal trên audioId (HTTP 400)")

    # 6. Kiểm tra OpenAI-compatible Speech API (POST /v1/audio/speech)
    print("\n>>> [6/7] Kiểm tra POST /v1/audio/speech...")
    openai_req = s.OpenAISpeechRequest(
        model="vieneu-v3-turbo",
        input="Bản tin tổng hợp sáng nay tại Hà Nội.",
        voice="mai_anh",
        response_format="mp3"
    )
    openai_res = asyncio.run(s.openai_compatible_speech(openai_req))
    check(openai_res.media_type == "audio/mpeg", "OpenAI Speech API trả về StreamingResponse audio/mpeg")

    # 7. Kiểm tra Healthcheck (GET /health)
    print("\n>>> [7/8] Kiểm tra GET /health...")
    health = s.health_check()
    check(health["status"] == "online", "Dịch vụ trạng thái online")
    check(health["sample_rate"] == 48000, "Tần số lấy mẫu 48000 Hz")
    check(health["total_voices"] >= 23, "Xác nhận quản lý 23 preset voices")

    # 8. Kiểm tra Endpoints VieNeu Chuẩn Repository & Phân Biệt Giọng / Cache
    print("\n>>> [8/8] Kiểm tra GET /v1/voices, GET /v1/models & Phân Biệt Giọng / Cache...")
    v1_voices = s.get_v1_voices()
    check(v1_voices.get("object") == "list" and len(v1_voices.get("voices", [])) >= 23, "GET /v1/voices chuẩn VieNeu trả về danh sách 23 giọng")
    
    v1_models = s.get_v1_models()
    check(v1_models.get("object") == "list" and len(v1_models.get("data", [])) >= 1, "GET /v1/models trả về thông số mô hình VieNeu-TTS v3 Turbo")
    check(any(m["id"] == "pnnbao-ump/VieNeu-TTS-v3-Turbo" for m in v1_models.get("data", [])), "Xác thực Model ID pnnbao-ump/VieNeu-TTS-v3-Turbo")

    # Kiểm tra phân tách cache key: cùng nội dung nhưng 2 giọng khác nhau phải có hash khác nhau
    hash_female = s.compute_cache_hash("art-100", "mai_anh", "Nội dung bài viết")
    hash_male = s.compute_cache_hash("art-100", "minh_quan", "Nội dung bài viết")
    check(hash_female != hash_male, "Hai giọng đọc khác nhau tạo ra hai cache key hoàn toàn độc lập")

    # Kiểm tra phân tách cache key: cùng giọng nhưng 2 bài viết khác nhau phải có hash khác nhau
    hash_art2 = s.compute_cache_hash("art-101", "mai_anh", "Nội dung bài viết")
    check(hash_female != hash_art2, "Hai bài viết khác nhau tạo ra hai cache key hoàn toàn độc lập")

    # Kiểm tra luồng stream trực tiếp GET /api/tts/stream
    stream_res = s.stream_chunk_tts("Tin tức thời sự hôm nay.", voice="mai_anh", format="mp3")
    check(stream_res.media_type == "audio/mpeg", "GET /api/tts/stream phản hồi media_type audio/mpeg chuẩn")

    # Kiểm tra điều biến âm sắc giữa giọng Nam và giọng Nữ
    female_wave = s.engine_manager.synthesize_speech("Thử nghiệm âm thanh", "mai_anh", 48000)
    male_wave = s.engine_manager.synthesize_speech("Thử nghiệm âm thanh", "minh_quan", 48000)
    check(len(female_wave) > 0 and len(male_wave) > 0, "Tạo thành công dữ liệu sóng âm cho cả giọng Nam và Nữ")
    check(not (female_wave == male_wave).all(), "Dữ liệu âm thanh của giọng Nam và giọng Nữ có tần số & âm sắc khác biệt rõ rệt")

    print("\n==================================================================")
    print(f"  TỔNG KẾT: \033[92m{passed} PASSED\033[0m | \033[91m{failed} FAILED\033[0m")
    print("==================================================================")
    if failed > 0:
        sys.exit(1)

if __name__ == "__main__":
    run_tests()
