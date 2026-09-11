@echo off
chcp 65001 > nul
title NutriPlan Web - Frontend (React + Vite)

echo ========================================================
echo   NutriPlan - Frontend Web (React + Vite)
echo ========================================================
echo.

echo [1/2] Verificando e liberando a porta 5173...
powershell -NoProfile -Command "$c = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue; if ($c) { foreach ($p in $c.OwningProcess) { Stop-Process -Id $p -Force -ErrorAction SilentlyContinue } }"

cd /d "%~dp0web"

echo [2/2] Iniciando o servidor frontend...
echo.

call npm run dev

if %errorlevel% neq 0 (
    echo.
    echo [ERRO] O servidor frontend encerrou com erro.
    pause
)
