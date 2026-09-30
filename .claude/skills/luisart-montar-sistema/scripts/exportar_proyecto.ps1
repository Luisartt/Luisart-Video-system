# Copies the tubeai-video project (code, skills, brand, SFX) to a destination WITHOUT the heavy or
# rebuildable folders. Adds and updates files only; deletes nothing at the destination.
# Usage: powershell -File exportar_proyecto.ps1 [-Destino "G:\My Drive\lartyk\proyecto-tubeai-video"] [-Simular]
param(
  [string]$Origen = (Join-Path $env:USERPROFILE "Documents\Proyectos\tubeai-video"),
  [string]$Destino = "G:\My Drive\lartyk\proyecto-tubeai-video",
  [switch]$Simular
)
if (-not (Test-Path (Join-Path $Origen "package.json"))) { Write-Host "No encuentro el proyecto en $Origen"; exit 1 }
if (-not (Test-Path (Split-Path $Destino))) { Write-Host "No existe $(Split-Path $Destino): ¿Google Drive está montado?"; exit 1 }

# Excluded: rebuildable (node_modules, .venv), per-job output (out, archive, recordings), third-party
# clones (tools\design-repos), caches. Files over 200 MB are skipped (raw videos).
$xd = @("node_modules", ".venv", "out", "archive", "recordings", "design-repos", ".git", "__pycache__", ".cache", "_setup-test")
$args2 = @($Origen, $Destino, "/E", "/XD") + $xd + @("/MAX:200000000", "/XF", "*.mov", "/R:1", "/W:1", "/NFL", "/NDL", "/NP")
if ($Simular) { $args2 += "/L" }
& robocopy @args2
$code = $LASTEXITCODE
# robocopy: 0-7 = success variants, >= 8 = failure
if ($code -ge 8) { Write-Host "Falló la copia (código $code)"; exit 1 }
Write-Host ""
if ($Simular) { Write-Host "Simulación: no se copió nada." } else { Write-Host "Proyecto copiado a $Destino" }
Write-Host "En la otra computadora: copiar esa carpeta a Documents\Proyectos\tubeai-video y seguir la skill luisart-montar-sistema (paso 4 en adelante)."
exit 0
