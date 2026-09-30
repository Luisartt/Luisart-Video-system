# Read-only check of a computer for the @soyluisart editing system. Changes nothing.
# Usage: powershell -File verificar_equipo.ps1 [-Proyecto "C:\Users\<user>\Documents\Proyectos\tubeai-video"]
param([string]$Proyecto = (Join-Path $env:USERPROFILE "Documents\Proyectos\tubeai-video"))
$ErrorActionPreference = "SilentlyContinue"
$falta = 0
function Linea($estado, $nombre, $detalle) {
  $color = @{ OK = "Green"; FALTA = "Red"; AVISO = "Yellow" }[$estado]
  Write-Host ("{0,-6} {1,-28} {2}" -f $estado, $nombre, $detalle) -ForegroundColor $color
  if ($estado -eq "FALTA") { $script:falta++ }
}
function Herramienta($nombre, $cmd, $args1) {
  $c = Get-Command $cmd -ErrorAction SilentlyContinue
  if ($c) { $v = (& $cmd $args1 2>&1 | Select-Object -First 1); Linea "OK" $nombre "$v" } else { Linea "FALTA" $nombre "no está en PATH" }
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
if ($libre -ge 60) { Linea "OK" "Disco libre C:" "$libre GB" } else { Linea "FALTA" "Disco libre C:" "$libre GB (mínimo 60)" }
$smi = Get-Command nvidia-smi -ErrorAction SilentlyContinue
if ($smi) {
  $g = (& nvidia-smi --query-gpu=name,driver_version,memory.total --format=csv,noheader 2>&1 | Select-Object -First 1)
  $drv = [double](($g -split ",")[1].Trim())
  if ($drv -ge 551.76) { Linea "OK" "GPU NVIDIA" "$g" } else { Linea "AVISO" "GPU NVIDIA" "$g (driver viejo: sin NVENC, actualizar)" }
} else { Linea "AVISO" "GPU NVIDIA" "no detectada: todo funciona pero mucho más lento" }

Write-Host "== Vault ==" -ForegroundColor Cyan
$vault = Join-Path $env:USERPROFILE "Documents\Lartyk"
if (Test-Path (Join-Path $vault "CLAUDE.md")) { Linea "OK" "Vault" $vault } else { Linea "FALTA" "Vault" "no está en $vault (clonar Luisartt/lartyk)" }
if (Test-Path "G:\My Drive\lartyk") { Linea "OK" "Google Drive lartyk" "G:\My Drive\lartyk" } else { Linea "AVISO" "Google Drive lartyk" "no montado en G:" }

Write-Host "== Proyecto ==" -ForegroundColor Cyan
if (Test-Path (Join-Path $Proyecto "package.json")) { Linea "OK" "Proyecto" $Proyecto } else { Linea "FALTA" "Proyecto" "no está en $Proyecto"; Write-Host "`nFaltan $falta cosas."; exit 1 }
if (Test-Path (Join-Path $Proyecto "node_modules\remotion")) { Linea "OK" "node_modules" "instalado" } else { Linea "FALTA" "node_modules" "correr npm ci" }
$pyv = Join-Path $Proyecto ".venv\Scripts\python.exe"
if (Test-Path $pyv) {
  $t = & $pyv -c "import torch;print(torch.__version__, 'cuda' if torch.cuda.is_available() else 'SIN cuda')" 2>&1
  if ("$t" -match "cuda" -and "$t" -notmatch "SIN") { Linea "OK" ".venv + torch" "$t" } else { Linea "AVISO" ".venv + torch" "$t" }
  foreach ($m in "transformers", "facenet_pytorch", "cv2", "opentimelineio") {
    $r = & $pyv -c "import $m" 2>&1
    if ($LASTEXITCODE -eq 0) { Linea "OK" "python: $m" "" } else { Linea "FALTA" "python: $m" "pip install" }
  }
} else { Linea "FALTA" ".venv" "crear con py -3.12 -m venv .venv" }
foreach ($s in "luisart-reglas", "luisart-editar-short", "luisart-diseno-sonoro", "luisart-animaciones-pizarra", "luisart-revision-codex", "luisart-guion", "luisart-montar-sistema", "luisart-configurar-estilo", "luisart-producir-desde-guion") {
  if (Test-Path (Join-Path $Proyecto ".claude\skills\$s\SKILL.md")) { Linea "OK" "skill $s" "" } else { Linea "FALTA" "skill $s" "" }
}
foreach ($f in "channels\soyluisart\CHANNEL.md", "core\lib\render-settings.ts", "media\soyluisart\audio\efectos") {
  if (Test-Path (Join-Path $Proyecto $f)) { Linea "OK" $f "" } else { Linea "FALTA" $f "" }
}

Write-Host ""
if ($falta -eq 0) { Write-Host "Todo listo. Falta solo la prueba de render (paso 9)." -ForegroundColor Green } else { Write-Host "Faltan $falta cosas." -ForegroundColor Red }
exit ([int]($falta -gt 0))
