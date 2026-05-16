# Proverka tokena: powershell -ExecutionPolicy Bypass -File .\check-token.ps1

$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$envFile = Join-Path $here ".env"

if (-not (Test-Path $envFile)) {
    Write-Host "FAIL: net faila .env" -ForegroundColor Red
    exit 1
}

Get-Content $envFile -Encoding UTF8 | ForEach-Object {
    $line = $_.Trim()
    if ($line.Length -eq 0 -or $line.StartsWith("#")) { return }
    if ($line -notlike "*=*") { return }
    $eq = $line.IndexOf("=")
    $name = $line.Substring(0, $eq).Trim()
    $val = $line.Substring($eq + 1).Trim().Trim('"').Trim("'")
    Set-Item -Path ("Env:" + $name) -Value $val
}

$token = $env:TELEGRAM_BOT_TOKEN
if ([string]::IsNullOrWhiteSpace($token)) {
    Write-Host "FAIL: TELEGRAM_BOT_TOKEN pustoy" -ForegroundColor Red
    exit 1
}

if ($token -notmatch "^[0-9]+:[A-Za-z0-9_-]+$") {
    Write-Host "FAIL: token vyglyadit nepravilno (dolzhen byt: 123456789:ABC...)" -ForegroundColor Red
    Write-Host "Dlina: $($token.Length)"
    exit 1
}

$uri = "https://api.telegram.org/bot$token/getMe"
try {
    $r = Invoke-RestMethod -Uri $uri -Method Get
    if ($r.ok) {
        Write-Host "OK: bot @" $r.result.username -ForegroundColor Green
        exit 0
    }
    Write-Host "FAIL:" $r -ForegroundColor Red
    exit 1
}
catch {
    Write-Host "FAIL 401 = neverniy token. V BotFather: /mybots -> bot -> API Token -> Revoke -> noviy token" -ForegroundColor Red
    Write-Host $_.Exception.Message
    exit 1
}
