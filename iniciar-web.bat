@echo off
chcp 65001 > nul
title NutriPlan v2 - Frontend (Vite/React)
echo Iniciando Frontend na porta 5173...
cd /d "%~dp0web"
npm run dev
pause
