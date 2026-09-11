@echo off
chcp 65001 > nul
title NutriPlan - Inicializador Completo

echo ========================================================
echo   Iniciando NutriPlan com Verificacao de Recursos...
echo ========================================================
echo.

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0iniciar.ps1"

if %errorlevel% neq 0 (
    echo.
    echo [AVISO] Ocorreu uma interrupcao na execucao.
    pause
)
