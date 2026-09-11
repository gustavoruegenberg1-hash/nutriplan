# ==============================================================================
# NutriPlan - Encerrador de Processos (Backend e Frontend)
# ==============================================================================

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "   NutriPlan - Encerrando Servicos" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

function Kill-Port([int]$port, [string]$name) {
    Write-Host "Verificando porta $port ($name)..." -NoNewline -ForegroundColor Gray
    $connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    $killed = $false
    foreach ($conn in $connections) {
        $procId = $conn.OwningProcess
        if ($procId -and $procId -ne 0 -and $procId -ne $PID) {
            try {
                Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
                $killed = $true
            } catch {}
        }
    }
    if ($killed) {
        Write-Host " [Encerrado com sucesso]" -ForegroundColor Green
    } else {
        Write-Host " [Nao estava em execucao]" -ForegroundColor DarkGray
    }
}

Kill-Port 3000 "Backend API NestJS"
Kill-Port 5173 "Frontend Vite"

Write-Host ""
Write-Host "Todos os recursos do NutriPlan foram liberados!" -ForegroundColor Green
Write-Host "Para iniciar novamente, basta executar iniciar-tudo.bat" -ForegroundColor Gray
Start-Sleep -Seconds 2
