@echo off
chcp 65001 > nul
title NutriPlan API - Servidor Backend

echo ========================================================
echo   NutriPlan - Servidor Backend (NestJS)
echo ========================================================
echo.

echo [1/2] Verificando e liberando a porta 3000...
powershell -NoProfile -Command "$c = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue; if ($c) { foreach ($p in $c.OwningProcess) { Stop-Process -Id $p -Force -ErrorAction SilentlyContinue } }"

cd /d "%~dp0api"

echo [2/2] Iniciando o servidor NestJS...
echo * Documentação Swagger: http://localhost:3000/api
echo.

call npm run start:dev

if %errorlevel% neq 0 (
    echo.
    echo [ERRO] O servidor encerrou com erro.
    pause
)
