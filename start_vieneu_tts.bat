@echo off
title VieNeu-TTS v3 Turbo Audio Engine (Port 8000)
cd /d "%~dp0"
echo =======================================================
echo   VieNeu-TTS v3 Turbo Audio Backend Server
echo   Port: 8000 | Model: pnnbao-ump/VieNeu-TTS-v3-Turbo
echo =======================================================
python scripts/vieneu_service.py
pause
