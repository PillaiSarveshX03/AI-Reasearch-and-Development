@echo off
echo Starting J.A.R.V.I.S. Core Server and Free Neural Voice Engine on http://localhost:8000 ...
where py >nul 2>nul
if %ERRORLEVEL% equ 0 (
    py server.py
) else (
    python server.py
)
pause
