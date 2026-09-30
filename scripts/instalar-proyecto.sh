#!/usr/bin/env bash
# Part 2 for macOS/Linux: project dependencies (Remotion and every npm package, the Python environment, AI CLIs).
# Run from anywhere; it works inside the repository folder. Windows? use scripts/instalar-proyecto.ps1
# Usage:  bash scripts/instalar-proyecto.sh
set -eu
cd "$(dirname "$0")/.."
OS="$(uname -s)"; ARCH="$(uname -m)"

echo "== npm ci (Remotion 4.0.529 and the @remotion/* packages) =="
npm ci

echo "== Playwright's browser (used by carousels, stories and Buffer tools) =="
npx playwright install chromium

PY="$(command -v python3.12 || true)"
if [ -z "$PY" ]; then echo "python3.12 not found. Run scripts/instalar-herramientas.sh first."; exit 1; fi
echo "== Python 3.12 environment (.venv) =="
"$PY" -m venv .venv
VPY=".venv/bin/python"
"$VPY" -m pip install --upgrade pip

if [ "$OS" = "Darwin" ] && [ "$ARCH" != "arm64" ]; then
  echo "Intel Mac: installing only the light packages (the AI parts need Apple Silicon)."
  "$VPY" -m pip install pillow numpy opencv-python-headless
else
  echo "== PyTorch =="
  if [ "$OS" = "Darwin" ]; then
    "$VPY" -m pip install torch==2.5.1 torchaudio==2.5.1 torchvision==0.20.1   # Apple Silicon build with Metal (MPS)
  elif command -v nvidia-smi >/dev/null 2>&1; then
    "$VPY" -m pip install torch==2.5.1 torchaudio==2.5.1 torchvision==0.20.1 --index-url https://download.pytorch.org/whl/cu121
  else
    "$VPY" -m pip install torch==2.5.1 torchaudio==2.5.1 torchvision==0.20.1 --index-url https://download.pytorch.org/whl/cpu
  fi
  echo "== the other Python packages =="
  TMP="$(mktemp)"
  grep -v -E "^(torch|torchaudio|torchvision|facenet-pytorch|colorama)==" requirements-venv.txt > "$TMP"
  "$VPY" -m pip install -r "$TMP"
  rm -f "$TMP"
  # --no-deps: otherwise facenet-pytorch replaces the torch build
  "$VPY" -m pip install --no-deps facenet-pytorch==2.6.0
  "$VPY" -c "import torch; print('torch', torch.__version__, '| CUDA', torch.cuda.is_available(), '| Metal (MPS)', getattr(torch.backends,'mps',None) is not None and torch.backends.mps.is_available())"
fi

echo "== AI command-line tools (you sign in yourself when they ask) =="
npm install -g @openai/codex || echo "(could not install Codex globally; see docs/MODELOS-Y-CLIS.md)"

echo
echo "Next: bash .claude/skills/luisart-montar-sistema/scripts/verificar_equipo.sh"
echo "Tip for long renders on a Mac: run them with  caffeinate -i <command>  so the Mac does not sleep."
