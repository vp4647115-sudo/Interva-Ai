# Run backend (port 8000) and frontend (port 3000) in the same window.
# Press Ctrl+C to stop both.
$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot
$venvPy = Join-Path $root 'backend\.venv\Scripts\python.exe'
$venvUvicorn = Join-Path $root 'backend\.venv\Scripts\uvicorn.exe'
$venvAlembic = Join-Path $root 'backend\.venv\Scripts\alembic.exe'

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
  if (Test-Path 'D:\programe\nodejs') {
    $env:Path = "D:\programe\nodejs;" + $env:Path
  }
}

if (-not (Test-Path $venvPy)) {
  Write-Error "Missing .venv at $root\backend\.venv."
  exit 1
}

# 1. Migrate DB
Write-Host "==> Running alembic migrations" -ForegroundColor Cyan
Push-Location (Join-Path $root 'backend')
try { & $venvAlembic upgrade head } finally { Pop-Location }

# 2. Start backend in background
# Note: uvicorn --reload is disabled on Windows because the multiprocessing
# reload worker can fail with WinError 5 when run via Start-Process.
Write-Host "==> Starting backend on http://localhost:8000" -ForegroundColor Cyan
$backend = Start-Process -FilePath $venvUvicorn `
  -ArgumentList 'app.main:app','--host','0.0.0.0','--port','8000' `
  -WorkingDirectory (Join-Path $root 'backend') `
  -PassThru -NoNewWindow

# 3. Start frontend in background
Write-Host "==> Starting frontend on http://localhost:3000" -ForegroundColor Cyan
$frontend = Start-Process -FilePath 'cmd.exe' `
  -ArgumentList '/c','cd /d',(Join-Path $root 'frontend'),'&&','npm','run','dev' `
  -PassThru -NoNewWindow

Write-Host ""
Write-Host "Backend PID:  $($backend.Id)" -ForegroundColor Yellow
Write-Host "Frontend PID: $($frontend.Id)" -ForegroundColor Yellow
Write-Host "Open: http://localhost:3000" -ForegroundColor Green
Write-Host "Press Ctrl+C in this window to stop both servers." -ForegroundColor Green

try {
  Wait-Process -Id $backend.Id, $frontend.Id -ErrorAction SilentlyContinue
} finally {
  Stop-Process -Id $backend.Id, $frontend.Id -ErrorAction SilentlyContinue
  Write-Host "Stopped." -ForegroundColor Yellow
}
