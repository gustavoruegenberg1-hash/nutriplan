@echo off
chcp 65001 > nul
title NutriPlan - NutriLife Game (Porta 5174)

echo ========================================================
echo   Iniciando NutriLife Sim (Ankama 2D Isométrico)...
echo   Porta: http://localhost:5174
echo ========================================================
echo.

cd /d "%~dp0game"
npm run dev

pause
