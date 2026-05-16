# Zapusk: cd bridge
#          powershell -ExecutionPolicy Bypass -File .\run.ps1

$ErrorActionPreference = "Stop"
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$envFile = Join-Path $here ".env"

if (-not (Test-Path $envFile)) {
    Write-Host "Net faila .env" -ForegroundColor Red
    Write-Host "Skopiruy: copy .env.example .env"
    exit 1
}

Get-Content $envFile -Encoding UTF8 | ForEach-Object {
    $line = $_.Trim()
    if ($line.Length -eq 0) { return }
    if ($line.StartsWith("#")) { return }
    if ($line -notlike "*=*") { return }
    $eq = $line.IndexOf("=")
    $name = $line.Substring(0, $eq).Trim()
    $val = $line.Substring($eq + 1).Trim().Trim('"').Trim("'")
    Set-Item -Path ("Env:" + $name) -Value $val
}

$token = $env:TELEGRAM_BOT_TOKEN
$chatId = $env:TELEGRAM_CHAT_ID
$port = "8790"
if ($env:PORT) { $port = $env:PORT }

if ([string]::IsNullOrWhiteSpace($token) -or [string]::IsNullOrWhiteSpace($chatId)) {
    Write-Host "V .env ukazhi TELEGRAM_BOT_TOKEN i TELEGRAM_CHAT_ID" -ForegroundColor Red
    exit 1
}

function Send-Telegram {
    param([string]$Text)
    $uri = "https://api.telegram.org/bot$token/sendMessage"
    $payload = @{
        chat_id = $chatId
        text = $Text
        parse_mode = "HTML"
    }
    $body = $payload | ConvertTo-Json -Compress
    $r = Invoke-RestMethod -Uri $uri -Method Post -Body $body -ContentType "application/json; charset=utf-8"
    if (-not $r.ok) {
        throw "Telegram error"
    }
}

function Write-JsonResponse {
    param($Context, [int]$StatusCode, $Object)
    $res = $Context.Response
    $json = $Object | ConvertTo-Json -Compress
    $buf = [System.Text.Encoding]::UTF8.GetBytes($json)
    $res.StatusCode = $StatusCode
    $res.ContentType = "application/json; charset=utf-8"
    $res.ContentLength64 = $buf.Length
    $res.OutputStream.Write($buf, 0, $buf.Length)
    $res.Close()
}

$listener = New-Object System.Net.HttpListener
[void]$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()

Write-Host "Bridge rabotaet: http://localhost:$port/" -ForegroundColor Green
Write-Host "Test: http://localhost:$port/api/test" -ForegroundColor Cyan
Write-Host "Stop: Ctrl+C"

while ($listener.IsListening) {
    $ctx = $listener.GetContext()
    $req = $ctx.Request
    $res = $ctx.Response
    [void]$res.Headers.Add("Access-Control-Allow-Origin", "*")
    [void]$res.Headers.Add("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
    [void]$res.Headers.Add("Access-Control-Allow-Headers", "Content-Type")

    if ($req.HttpMethod -eq "OPTIONS") {
        $res.StatusCode = 204
        $res.Close()
        continue
    }

    $path = $req.Url.LocalPath

    try {
        if ($path -eq "/health") {
            Write-JsonResponse $ctx 200 @{ ok = $true; mode = "powershell" }
            continue
        }

        if ($path -eq "/api/test") {
            Send-Telegram "Test: bridge rabotaet. Zayavki s sayta budut zdes."
            Write-JsonResponse $ctx 200 @{ ok = $true }
            continue
        }

        if (($path -eq "/api/entry") -and ($req.HttpMethod -eq "POST")) {
            $reader = New-Object System.IO.StreamReader($req.InputStream, [System.Text.Encoding]::UTF8)
            $raw = $reader.ReadToEnd()
            $reader.Close()
            $data = $raw | ConvertFrom-Json

            $user = [string]$data.robloxUser
            $user = $user.Trim()
            $id = [string]$data.robloxId
            $id = $id.Trim()

            if ([string]::IsNullOrWhiteSpace($user)) {
                throw "Net nika"
            }
            if ($id -notmatch "^[a-zA-Z0-9_.]{3,32}$") {
                throw "Neverniy User ID (bukvy i cifry, 3-32)"
            }

            $fruit = [string]$data.fruitName
            $label = [string]$data.label
            $msg = "Novaya zayavka Blox Fruits`nNik: $user`nUser ID: $id`nPriz: $fruit ($label)"
            Send-Telegram $msg
            Write-JsonResponse $ctx 200 @{ ok = $true }
            continue
        }

        Write-JsonResponse $ctx 404 @{ ok = $false; error = "not found" }
    }
    catch {
        $errMsg = $_.Exception.Message
        Write-JsonResponse $ctx 500 @{ ok = $false; error = $errMsg }
    }
}
