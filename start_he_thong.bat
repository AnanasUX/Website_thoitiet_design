@echo off
title Khoi Chay Website Tin Tuc va VieNeu-TTS
cd /d "%~dp0"
echo =======================================================
echo   KHOI DONG TOAN BO HE THONG WEBSITE VA AI VIENEU-TTS
echo =======================================================
echo 1. Kich hoat Backend AI VieNeu-TTS (Port 8000)...
start "VieNeu-TTS Backend" /min python scripts/vieneu_service.py
timeout /t 2 >nul
echo 2. Khoi chay Vite Web Server...
npm run dev
pause
