@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo ========================================
echo   تمريني - تشغيل السيرفر المحلي
echo ========================================
echo.
echo افتح هذا العنوان في Safari على الايفون (نفس شبكة الواي فاي):
echo.
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
  for /f "tokens=* delims= " %%b in ("%%a") do echo     http://%%b:8780
)
echo.
echo اترك هذه النافذة مفتوحة اثناء التثبيت. اغلقها بعد ما تضيف التطبيق للشاشة الرئيسية.
echo.
python -m http.server 8780
pause
