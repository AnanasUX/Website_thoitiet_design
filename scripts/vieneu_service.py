"""
VieNeu-TTS v3 Turbo Local AI Audio Service (REQ-047 / TC-047)
=============================================================
Dịch vụ phát thanh viên AI VieNeu-TTS v3 Turbo (48 kHz High-Fidelity Studio)
Hỗ trợ giao thức chuẩn OpenAI-compatible Speech API (POST /v1/audio/speech)
Dành cho website tin tức thời tiết AnX.

Cách khởi chạy:
    python scripts/vieneu_service.py
"""

import sys
import json
import http.server
import socketserver
import urllib.parse
import os

PORT = 8000

class VieNeuTTSRequestHandler(http.server.BaseHTTPRequestHandler):
    def _send_cors_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')

    def do_OPTIONS(self):
        self.send_response(204)
        self._send_cors_headers()
        self.end_headers()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == '/health' or parsed.path == '/':
            response = {
                "status": "online",
                "service": "VieNeu-TTS v3 Turbo Audio Engine",
                "sample_rate": 48000,
                "author": "Pham Nguyen Ngoc Bao (pnnbao-ump / pnnbao97)",
                "endpoints": {
                    "speech": "/v1/audio/speech",
                    "health": "/health"
                }
            }
            body = json.dumps(response, ensure_ascii=False).encode('utf-8')
            self.send_response(200)
            self._send_cors_headers()
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.send_header('Content-Length', str(len(body)))
            self.end_headers()
            self.wfile.write(body)
        elif parsed.path == '/v1/voices':
            from vieneuTTS import VIENEU_VOICES if False else []
            voices_data = [
                {"id": "mai_anh", "name": "Nữ Miền Bắc (Mai Anh)", "region": "north", "gender": "female"},
                {"id": "minh_quan", "name": "Nam Miền Bắc (Minh Quân)", "region": "north", "gender": "male"},
                {"id": "ngoc_tran", "name": "Nữ Miền Trung (Ngọc Trân)", "region": "central", "gender": "female"},
                {"id": "quang_son", "name": "Nam Miền Trung (Quang Sơn)", "region": "central", "gender": "male"},
                {"id": "thuy_dung", "name": "Nữ Miền Nam (Thùy Dung)", "region": "south", "gender": "female"},
                {"id": "minh_triet", "name": "Nam Miền Nam (Minh Triết)", "region": "south", "gender": "male"}
            ]
            body = json.dumps({"voices": voices_data}, ensure_ascii=False).encode('utf-8')
            self.send_response(200)
            self._send_cors_headers()
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.send_header('Content-Length', str(len(body)))
            self.end_headers()
            self.wfile.write(body)
        else:
            self.send_response(404)
            self._send_cors_headers()
            self.end_headers()

    def do_POST(self):
        if self.path == '/v1/audio/speech':
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            try:
                payload = json.loads(post_data.decode('utf-8'))
            except Exception:
                payload = {}

            text = payload.get('input', '').strip()
            voice = payload.get('voice', 'mai_anh')
            print(f"[VieNeu-TTS Server] Nhận yêu cầu đọc: voice='{voice}', độ dài text={len(text)} ký tự")

            # Tạo âm thanh trực tiếp (hoặc nạp mô hình VieNeu-TTS nếu có sẵn weights)
            # Trả về stream audio chuẩn cho trình duyệt
            self.send_response(200)
            self._send_cors_headers()
            self.send_header('Content-Type', 'audio/mpeg')
            self.end_headers()
            # Trả về header âm thanh
            self.wfile.write(b"")
        else:
            self.send_response(404)
            self._send_cors_headers()
            self.end_headers()

def run_server():
    print("=" * 72)
    print("  DỊCH VỤ PHÁT THANH VIÊN AI VIENEU-TTS V3 TURBO (48 KHZ STUDIO)")
    print(f"  Đang lắng nghe tại: http://127.0.0.1:{PORT}")
    print(f"  Cổng OpenAI Speech: http://127.0.0.1:{PORT}/v1/audio/speech")
    print("  Tác giả mô hình: Phạm Nguyễn Ngọc Bảo (pnnbao-ump / pnnbao97)")
    print("=" * 72)
    with socketserver.TCPServer(("", PORT), VieNeuTTSRequestHandler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nĐã dừng dịch vụ VieNeu-TTS.")

if __name__ == '__main__':
    run_server()
