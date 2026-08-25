@echo off
echo Starting J.A.R.V.I.S. Core Server on http://localhost:8000 ...
where py >nul 2>nul
if %ERRORLEVEL% equ 0 (
    py -m http.server 8000
) else (
    where npx >nul 2>nul
    if %ERRORLEVEL% equ 0 (
        npx serve . -l 8000
    ) else (
        python -m http.server 8000
    )
)
pause
