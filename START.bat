@echo off
cd /d "%~dp0"
echo Zapusk Telegram bridge...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0run.ps1"
pause
