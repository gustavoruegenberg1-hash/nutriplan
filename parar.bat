@echo off
chcp 65001 > nul
title NutriPlan - Encerrar Servicos

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0parar.ps1"
