@echo off
chcp 65001 > nul
title NutriPlan v2 - Inicializador
echo ========================================================
echo   Iniciando NutriPlan v2 (API + Web)
echo ========================================================
echo.
start "NutriPlan v2 - API (NestJS)" cmd /k "%~dp0iniciar-api.bat"
start "NutriPlan v2 - Web (Vite)" cmd /k "%~dp0iniciar-web.bat"
echo Aplicativo iniciado!
echo Backend:  http://localhost:3000
echo Frontend: http://localhost:5173
echo.
