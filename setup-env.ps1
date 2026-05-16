# Один раз: копирует .env.example -> .env (если .env ещё нет)
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$src = Join-Path $here ".env.example"
$dst = Join-Path $here ".env"

if (Test-Path $dst) {
    Write-Host ".env уже есть — не перезаписываю."
    exit 0
}
if (-not (Test-Path $src)) {
    Write-Host "Нет .env.example"
    exit 1
}
Copy-Item $src $dst
Write-Host "Создан .env — открой его и вставь TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID"
Write-Host $dst
