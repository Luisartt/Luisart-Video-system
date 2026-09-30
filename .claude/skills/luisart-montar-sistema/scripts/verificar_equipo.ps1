# Read-only check of a computer for the video system. Changes nothing.
# Usage: powershell -File .claude\skills\luisart-montar-sistema\scripts\verificar_equipo.ps1
# It reads brand\paths.json (created by scripts\configurar_rutas.py) when it exists.
$Proyecto = (Resolve-Path (Join-Path $PSScriptRoot "..\..\..\..")).Path
$ErrorActionPreference = "SilentlyContinue"
$falta = 0
function Linea($estado, $nombre, $detalle) {
  $color = @{ OK = "Green"; FALTA = "Red"; AVISO = "Yellow" }[$estado]
  Write-Host ("{0,-6} {1,-28} {2}" -f $estado, $nombre, $detalle) -ForegroundColor $color
  if ($estado -eq "FALTA") { $script:falta++ }
}
function Herramienta($nombre, $cmd, $args1) {
  $c = Get-Command $cmd -ErrorAction SilentlyContinue
  if ($c) { $v = (& $cmd $args1 2>&1 | Select-Object -First 1); Linea "OK" $nombre "$v" } else { Linea "FALTA" $nombre "no esta en PATH" }
}

Write-Host "== Herramientas ==" -ForegroundColor Cyan
Herramienta "Git" "git" "--version"
Herramienta "Git LFS" "git-lfs" "--version"
Herramienta "GitHub CLI" "gh" "--version"
Herramienta "Node.js (24.x)" "node" "-v"
Herramienta "FFmpeg" "ffmpeg" "-version"
Herramienta "yt-dlp" "yt-dlp" "--version"
Herramienta "SoX" "sox" "--version"
Herramienta "Deno" "deno" "--version"
Herramienta "Claude Code" "claude" "--version"
Herramienta "Codex CLI" "codex" "--version"
$py = & py -3.12 --version 2>&1
if ($py -match "3\.12") { Linea "OK" "Python 3.12" "$py" } else { Linea "FALTA" "Python 3.12" "instalar Python.Python.3.12" }

Write-Host "== Equipo ==" -ForegroundColor Cyan
$ram = [math]::Round((Get-CimInstance Win32_ComputerSystem).TotalPhysicalMemory / 1GB, 1)
if ($ram -ge 15) { Linea "OK" "RAM" "$ram GB" } else { Linea "AVISO" "RAM" "$ram GB (recomendado 16): un trabajo pesado a la vez" }
$libre = [math]::Round((Get-PSDrive C).Free / 1GB, 0)
if ($libre -ge 60) { Linea "OK" "Disco libre C:" "$libre GB" } else { Linea "FALTA" "Disco libre C:" "$libre GB (minimo 60)" }
$smi = Get-Command nvidia-smi -ErrorAction SilentlyContinue
if ($smi) {
  $g = (& nvidia-smi --query-gpu=name,driver_version,memory.total --format=csv,noheader 2>&1 | Select-Object -First 1)
  $drv = [double](($g -split ",")[1].Trim())
  if ($drv -ge 551.76) { Linea "OK" "GPU NVIDIA" "$g" } else { Linea "AVISO" "GPU NVIDIA" "$g (driver viejo: sin NVENC, actualizar)" }
} else { Linea "AVISO" "GPU NVIDIA" "no detectada: todo funciona pero mucho mas lento" }

Write-Host "== Rutas (brand\paths.json) ==" -ForegroundColor Cyan
$cfgPath = Join-Path $Proyecto "brand\paths.json"
if (Test-Path $cfgPath) {
  $cfg = Get-Content $cfgPath -Raw | ConvertFrom-Json
  Linea "OK" "paths.json" $cfgPath
  $vault = $cfg.vault
  if ($vault -and (Test-Path (Join-Path $vault "CLAUDE.md"))) { Linea "OK" "Vault" $vault } else { Linea "AVISO" "Vault" "no existe todavia en '$vault' (skill wiki-vault-setup)" }
  if ($cfg.cloud) { if (Test-Path $cfg.cloud) { Linea "OK" "Carpeta en la nube" $cfg.cloud } else { Linea "AVISO" "Carpeta en la nube" "no encontrada: $($cfg.cloud)" } }
} else {
  Linea "AVISO" "paths.json" "todavia no existe: python scripts\configurar_rutas.py --create"
}

Write-Host "== Proyecto ==" -ForegroundColor Cyan
Linea "OK" "Proyecto" $Proyecto
if (Test-Path (Join-Path $Proyecto "node_modules\remotion")) { Linea "OK" "node_modules" "instalado" } else { Linea "FALTA" "node_modules" "correr npm ci" }
$pyv = Join-Path $Proyecto ".venv\Scripts\python.exe"
if (Test-Path $pyv) {
  $t = & $pyv -c "import torch;print(torch.__version__, 'cuda' if torch.cuda.is_available() else 'SIN cuda')" 2>&1
  if ("$t" -match "cuda" -and "$t" -notmatch "SIN") { Linea "OK" ".venv + torch" "$t" } else { Linea "AVISO" ".venv + torch" "$t" }
  foreach ($m in "transformers", "facenet_pytorch", "cv2", "opentimelineio") {
    $r = & $pyv -c "import $m" 2>&1
    if ($LASTEXITCODE -eq 0) { Linea "OK" "python: $m" "" } else { Linea "FALTA" "python: $m" "pip install (ver requirements-venv.txt)" }
  }
} else { Linea "FALTA" ".venv" "crear con py -3.12 -m venv .venv" }
$skills = Get-ChildItem (Join-Path $Proyecto ".claude\skills") -Directory
Linea "OK" "skills" "$($skills.Count) carpetas en .claude\skills"
foreach ($f in "CLAUDE.md", "core\lib\render-settings.ts", "channels\_template\theme.generated.ts") {
  if (Test-Path (Join-Path $Proyecto $f)) { Linea "OK" $f "" } else { Linea "FALTA" $f "" }
}

Write-Host ""
if ($falta -eq 0) { Write-Host "Todo listo. Falta solo la prueba de render." -ForegroundColor Green } else { Write-Host "Faltan $falta cosas." -ForegroundColor Red }
exit ([int]($falta -gt 0))
