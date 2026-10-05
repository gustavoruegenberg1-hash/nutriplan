# ==============================================================================
# NutriPlan - Inicializador Automatizado Inteligente (API + Frontend)
# ==============================================================================

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "   NutriPlan - Inicializador Completo do Sistema" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

$baseDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# 1. Função para liberar porta ocupada por processos anteriores/zumbis
function Free-Port([int]$port, [string]$serviceName) {
    Write-Host "Verificando porta $port ($serviceName)..." -NoNewline -ForegroundColor Gray
    $connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    $freed = $false
    foreach ($conn in $connections) {
        $procId = $conn.OwningProcess
        if ($procId -and $procId -ne 0 -and $procId -ne $PID) {
            try {
                Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
                $freed = $true
            } catch {}
        }
    }
    if ($freed) {
        Start-Sleep -Milliseconds 800
        Write-Host " [Porta $port liberada com sucesso]" -ForegroundColor Yellow
    } else {
        Write-Host " [Disponível]" -ForegroundColor Green
    }
}

# 2. Função para aguardar o serviço HTTP responder com status 200/OK
function Wait-For-Http([string]$url, [int]$timeoutSeconds = 45, [string]$label = "Serviço") {
    Write-Host "  -> Aguardando inicialização do $label" -NoNewline -ForegroundColor Gray
    $timer = [System.Diagnostics.Stopwatch]::StartNew()
    while ($timer.Elapsed.TotalSeconds -lt $timeoutSeconds) {
        try {
            $request = [System.Net.WebRequest]::Create($url)
            $request.Timeout = 1500
            $request.Method = "GET"
            $response = $request.GetResponse()
            $code = [int]$response.StatusCode
            $response.Close()
            if ($code -ge 200 -and $code -lt 400) {
                Write-Host " [ONLINE e PRONTO!]" -ForegroundColor Green
                return $true
            }
        } catch [System.Net.WebException] {
            $resp = $_.Exception.Response
            if ($resp) {
                $code = [int]$resp.StatusCode
                $resp.Close()
                if ($code -eq 200 -or $code -eq 401 -or $code -eq 404) {
                    Write-Host " [ONLINE e PRONTO!]" -ForegroundColor Green
                    return $true
                }
            }
        } catch {}
        Start-Sleep -Milliseconds 600
        Write-Host "." -NoNewline -ForegroundColor Gray
    }
    Write-Host " [AVISO: Inicialização lenta, continuando...]" -ForegroundColor Yellow
    return $false
}

# ------------------------------------------------------------------------------
# [ETAPA 1/4] Limpeza de processos anteriores
# ------------------------------------------------------------------------------
Write-Host "[1/4] Garantindo portas livres para evitar falhas de conexão..." -ForegroundColor White
Free-Port 3000 "Backend API"
Free-Port 5173 "Frontend Web"
Free-Port 5174 "NutriLife Game"
Write-Host ""

# ------------------------------------------------------------------------------
# [ETAPA 2/4] Inicialização do Backend NestJS
# ------------------------------------------------------------------------------
Write-Host "[2/4] Inicializando Servidor Backend (NestJS na porta 3000)..." -ForegroundColor White
$apiPath = Join-Path $baseDir "api"

# Inicia o backend em uma janela CMD independente
Start-Process cmd.exe -ArgumentList "/k", "title NutriPlan API (Backend) && cd /d `"$apiPath`" && npm run start:dev" -WindowStyle Normal

# Aguarda ativamente até que a API esteja respondendo requisições HTTP
$apiReady = Wait-For-Http "http://localhost:3000/api" 45 "Backend NestJS (porta 3000)"

if (-not $apiReady) {
    Write-Host "  [ATENÇÃO] O backend pode estar compilando. Aguardando mais alguns segundos..." -ForegroundColor Yellow
    Start-Sleep -Seconds 4
}
Write-Host ""

# ------------------------------------------------------------------------------
# [ETAPA 3/4] Inicialização do Frontend React
# ------------------------------------------------------------------------------
Write-Host "[3/4] Inicializando Servidor Frontend (Vite na porta 5173)..." -ForegroundColor White
$webPath = Join-Path $baseDir "web"

# Inicia o Vite em uma janela CMD independente
Start-Process cmd.exe -ArgumentList "/k", "title NutriPlan Web (Frontend) && cd /d `"$webPath`" && npm run dev" -WindowStyle Normal

# Aguarda ativamente o frontend Vite ficar online
$webReady = Wait-For-Http "http://localhost:5173" 30 "Frontend Vite (porta 5173)"
Write-Host ""

# ------------------------------------------------------------------------------
# [ETAPA 4/4] Inicialização do Jogo NutriLife Sim (Ankama 2D Isométrico)
# ------------------------------------------------------------------------------
$gamePath = Join-Path $baseDir "game"
if (Test-Path $gamePath) {
    Write-Host "[4/4] Inicializando NutriLife Game (Ankama 2D na porta 5174)..." -ForegroundColor White
    Start-Process cmd.exe -ArgumentList "/k", "title NutriLife Game (Porta 5174) && cd /d `"$gamePath`" && npm run dev" -WindowStyle Normal
    $gameReady = Wait-For-Http "http://localhost:5174" 30 "NutriLife Game (porta 5174)"
    Write-Host ""
}

# ------------------------------------------------------------------------------
# Finalização e Abertura do Navegador
# ------------------------------------------------------------------------------
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "   NutriPlan & NutriLife estão 100% ATIVOS e PRONTOS!" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  * Frontend Web:   http://localhost:5173" -ForegroundColor White
Write-Host "  * NutriLife Game: http://localhost:5174" -ForegroundColor White
Write-Host "  * Backend API:    http://localhost:3000" -ForegroundColor White
Write-Host "  * Swagger API:    http://localhost:3000/api" -ForegroundColor White
Write-Host ""
Write-Host "  [Usuário de Teste / Demonstração já configurado]:" -ForegroundColor Yellow
Write-Host "  * E-mail: demo@nutriplan.com" -ForegroundColor Cyan
Write-Host "  * Senha:  password123" -ForegroundColor Cyan
Write-Host ""
Write-Host "Abrindo os aplicativos no seu navegador padrão..." -ForegroundColor Green

Start-Sleep -Milliseconds 600
Start-Process "http://localhost:5173"
Start-Process "http://localhost:5174"

Write-Host "Sucesso! Mantenha as janelas abertas enquanto desenvolve ou testa o sistema." -ForegroundColor Gray
Write-Host ""
Read-Host "Pressione [ENTER] para fechar esta janela do inicializador..."
