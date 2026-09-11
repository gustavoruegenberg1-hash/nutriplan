@echo off
title NutriPlan - Testes Unitarios e Cobertura

echo ========================================================
echo   NutriPlan - Execucao de Testes Automatizados
echo ========================================================
echo.

cd /d "%~dp0api"

echo Executando testes unitarios com cobertura...
echo.

call npm run test:cov

echo.
echo ========================================================
echo   Fim da execucao dos testes.
echo ========================================================
echo.
pause
