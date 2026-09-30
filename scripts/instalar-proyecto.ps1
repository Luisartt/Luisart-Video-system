# Part 2: project dependencies (Remotion and every npm package, the Python environment with CUDA
# torch, AI CLIs). Run from the repo root in a NEW terminal after instalar-herramientas.ps1.
$ErrorActionPreference = "Stop"
Write-Host "npm ci (Remotion 4.0.529 y paquetes @remotion/*)" -ForegroundColor Cyan
npm ci
Write-Host "Python 3.12 venv" -ForegroundColor Cyan
py -3.12 -m venv .venv
$py = ".venv\Scripts\python.exe"
& $py -m pip install --upgrade pip
& $py -m pip install torch==2.5.1 torchaudio==2.5.1 torchvision==0.20.1 --index-url https://download.pytorch.org/whl/cu121
$req = Get-Content requirements-venv.txt | Where-Object { $_ -notmatch "^(torch|torchaudio|torchvision|facenet-pytorch)==" }
$tmp = New-TemporaryFile
Set-Content $tmp $req
& $py -m pip install -r $tmp --extra-index-url https://download.pytorch.org/whl/cu121
# --no-deps: otherwise facenet-pytorch replaces the CUDA torch build
& $py -m pip install --no-deps facenet-pytorch==2.6.0
Write-Host "CLIs (inicia sesion tu cuando lo pidan)" -ForegroundColor Cyan
npm install -g @openai/codex
Write-Host ""
Write-Host "Skills de terceros (Remotion): npx skills add remotion-dev/skills" -ForegroundColor Yellow
Write-Host "Verificacion: powershell -File .claude\skills\luisart-montar-sistema\scripts\verificar_equipo.ps1"
