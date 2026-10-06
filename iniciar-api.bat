@echo off
chcp 65001 > nul
title NutriPlan v2 - API (NestJS)
echo Iniciando API na porta 3000...
cd /d "%~dp0api"
npm run start:dev
pause
