#!/usr/bin/env bash
# Read-only check of a macOS/Linux computer for the video system. Changes nothing.
# Usage:  bash .claude/skills/luisart-montar-sistema/scripts/verificar_equipo.sh
# Windows? use verificar_equipo.ps1 (same folder).
PROJ="$(cd "$(dirname "$0")/../../../.." && pwd)"
OS="$(uname -s)"; ARCH="$(uname -m)"
missing=0
GREEN=$'\033[32m'; RED=$'\033[31m'; YEL=$'\033[33m'; CYAN=$'\033[36m'; OFF=$'\033[0m'
line() { # line <OK|FALTA|AVISO> <name> <detail>
  local c="$GREEN"; [ "$1" = FALTA ] && { c="$RED"; missing=$((missing + 1)); }; [ "$1" = AVISO ] && c="$YEL"
  printf "%s%-6s %-28s %s%s\n" "$c" "$1" "$2" "$3" "$OFF"
}
tool() { # tool <label> <command> <version args>
  if command -v "$2" >/dev/null 2>&1; then line OK "$1" "$("$2" $3 2>&1 | head -1)"; else line FALTA "$1" "not in PATH"; fi
}

echo "${CYAN}== Tools ==${OFF}"
tool "Git" git --version
tool "Git LFS" git-lfs --version
tool "GitHub CLI" gh --version
tool "Node.js (24.x)" node -v
tool "FFmpeg" ffmpeg -version
tool "yt-dlp" yt-dlp --version
tool "SoX" sox --version
tool "Deno" deno --version
tool "Claude Code" claude --version
tool "Codex CLI" codex --version
if command -v python3.12 >/dev/null 2>&1; then line OK "Python 3.12" "$(python3.12 --version 2>&1)"; else line FALTA "Python 3.12" "brew install python@3.12"; fi

echo "${CYAN}== Computer ==${OFF}"
if [ "$OS" = "Darwin" ]; then
  ram=$(( $(sysctl -n hw.memsize) / 1073741824 )); chip="$(sysctl -n machdep.cpu.brand_string 2>/dev/null)"
  free=$(df -g / | awk 'NR==2{print $4}')
  if [ "$ARCH" = "arm64" ]; then line OK "Chip" "$chip (Apple Silicon: Whisper and matte run on Metal)"; else line AVISO "Chip" "$chip (Intel: no local AI parts)"; fi
else
  ram=$(( $(awk '/MemTotal/{print $2}' /proc/meminfo) / 1048576 )); free=$(df -BG / | awk 'NR==2{gsub("G","",$4);print $4}')
  if command -v nvidia-smi >/dev/null 2>&1; then line OK "GPU NVIDIA" "$(nvidia-smi --query-gpu=name,driver_version --format=csv,noheader | head -1)"; else line AVISO "GPU" "none detected: everything works, slower"; fi
fi
if [ "${ram:-0}" -ge 15 ]; then line OK "RAM" "${ram} GB"; else line AVISO "RAM" "${ram} GB (16 recommended): one heavy job at a time"; fi
if [ "${free:-0}" -ge 60 ]; then line OK "Free disk" "${free} GB"; else line FALTA "Free disk" "${free} GB (minimum 60)"; fi

echo "${CYAN}== Paths (brand/paths.json) ==${OFF}"
if [ -f "$PROJ/brand/paths.json" ]; then
  line OK "paths.json" "$PROJ/brand/paths.json"
  if command -v python3 >/dev/null 2>&1; then
    v="$(python3 -c "import json;print(json.load(open('$PROJ/brand/paths.json'))['vault'])" 2>/dev/null)"
    if [ -n "$v" ] && [ -f "$v/CLAUDE.md" ]; then line OK "Vault" "$v"; else line AVISO "Vault" "not created yet in '$v' (skill wiki-vault-setup)"; fi
  fi
else
  line AVISO "paths.json" "not created yet: python3 scripts/configurar_rutas.py --create"
fi

echo "${CYAN}== Project ==${OFF}"
line OK "Project" "$PROJ"
if [ -d "$PROJ/node_modules/remotion" ]; then line OK "node_modules" "installed"; else line FALTA "node_modules" "run npm ci"; fi
VPY="$PROJ/.venv/bin/python"
if [ -x "$VPY" ]; then
  t="$("$VPY" -c "import torch;print(torch.__version__,'| CUDA',torch.cuda.is_available(),'| MPS',getattr(torch.backends,'mps',None) is not None and torch.backends.mps.is_available())" 2>&1 | tail -1)"
  case "$t" in *"CUDA True"*|*"MPS True"*) line OK ".venv + torch" "$t";; *) line AVISO ".venv + torch" "$t (no GPU acceleration)";; esac
  for m in transformers facenet_pytorch cv2 opentimelineio; do
    if "$VPY" -c "import $m" >/dev/null 2>&1; then line OK "python: $m" ""; else line FALTA "python: $m" "pip install (see requirements-venv.txt)"; fi
  done
else
  line FALTA ".venv" "run scripts/instalar-proyecto.sh"
fi
n=$(ls -d "$PROJ"/.claude/skills/*/ 2>/dev/null | wc -l | tr -d ' ')
line OK "skills" "$n folders in .claude/skills"
for f in CLAUDE.md core/lib/render-settings.ts channels/_template/theme.generated.ts; do
  if [ -e "$PROJ/$f" ]; then line OK "$f" ""; else line FALTA "$f" ""; fi
done

echo
if [ "$missing" -eq 0 ]; then echo "${GREEN}All set. Only the test render is left.${OFF}"; else echo "${RED}$missing things missing.${OFF}"; fi
exit $(( missing > 0 ))
