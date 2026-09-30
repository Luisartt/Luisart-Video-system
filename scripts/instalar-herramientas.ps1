# Installs the tools of the Luisart video system on Windows 10/11 (winget). Safe to re-run:
# it skips what is already installed and never deletes anything.
# Usage (PowerShell, in the repo folder):  powershell -ExecutionPolicy Bypass -File scripts\instalar-herramientas.ps1
$ErrorActionPreference = "Continue"
function Instalar($id) {
  if (winget list --id $id -e 2>$null | Select-String $id) { Write-Host "ya esta: $id" -ForegroundColor DarkGray; return }
  Write-Host "instalando $id" -ForegroundColor Cyan
  winget install --id $id -e --accept-package-agreements --accept-source-agreements
}
"Git.Git", "Git.GitLFS", "GitHub.cli", "OpenJS.NodeJS", "Gyan.FFmpeg", "yt-dlp.yt-dlp",
"Python.Python.3.12", "ChrisBagwell.SoX", "DenoLand.Deno" | ForEach-Object { Instalar $_ }

Write-Host ""
Write-Host "Abre una terminal NUEVA para que el PATH se actualice y corre la parte 2:" -ForegroundColor Yellow
Write-Host "  powershell -ExecutionPolicy Bypass -File scripts\instalar-proyecto.ps1"
