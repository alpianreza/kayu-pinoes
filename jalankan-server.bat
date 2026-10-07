@echo off
title Kayu Pinoes - server produksi
cd /d "%~dp0"
echo.
echo  Server Kayu Pinoes
echo  -------------------
echo  Alamat lokal  : http://localhost:3000
echo  Panel admin   : http://localhost:3000/admin
echo.
echo  Biarkan jendela ini terbuka selama situs dipakai.
echo  Tutup jendela ini untuk menghentikan server.
echo.
call npm run start
echo.
echo  Server berhenti. Tekan tombol apa saja untuk menutup.
pause > nul