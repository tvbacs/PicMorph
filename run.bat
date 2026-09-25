@echo off
title PicLayout - Expo Mobile App
echo ========================================================
echo   PicLayout - App Tao Layout Anh Dien Thoai (Expo Go)
echo ========================================================
echo.
echo [1/2] Dang kiem tra thu vien...
cd /d "%~dp0"
echo.
echo [2/2] Dang khoi dong Expo Metro Server...
echo * Quet ma QR tren man hinh bang app Expo Go tren dien thoai.
echo * Hoac bam 'w' de mo tren trinh duyet Web.
echo.
npx expo start -c
pause
