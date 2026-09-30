#!/usr/bin/env bash
# Installs the tools of the video system on macOS (and Linux with Homebrew). Safe to re-run: it skips what is
# already installed and never deletes anything.   Windows? use scripts/instalar-herramientas.ps1
# Usage:  bash scripts/instalar-herramientas.sh
set -u
OS="$(uname -s)"
ARCH="$(uname -m)"
if [ "$OS" != "Darwin" ] && [ "$OS" != "Linux" ]; then
  echo "This script is for macOS/Linux. On Windows run scripts/instalar-herramientas.ps1"; exit 1
fi

if [ "$OS" = "Darwin" ]; then
  echo "Mac detected ($ARCH)."
  if ! xcode-select -p >/dev/null 2>&1; then
    echo "Installing Apple's Command Line Tools. A window opens: click Install, wait, then run this script again."
    xcode-select --install
    exit 0
  fi
  if [ "$ARCH" != "arm64" ]; then
    echo "NOTE: this is an Intel Mac. Graphics, carousels, stories and Remotion work; the local AI parts (Whisper, person matte,"
    echo "face tracking) need Apple Silicon (M1 or newer). The project install step will skip them."
  fi
fi

if ! command -v brew >/dev/null 2>&1; then
  for b in /opt/homebrew/bin/brew /usr/local/bin/brew /home/linuxbrew/.linuxbrew/bin/brew; do
    [ -x "$b" ] && eval "$("$b" shellenv)" && break
  done
fi
if ! command -v brew >/dev/null 2>&1; then
  echo "Homebrew (the Mac app installer) is not installed. Open https://brew.sh, copy the one-line command from that page into the"
  echo "Terminal, type your Mac password when asked, follow the 'Next steps' it prints, then run this script again."
  exit 1
fi

install() {  # install <formula> [command-to-check]
  local f="$1" c="${2:-$1}"
  if command -v "$c" >/dev/null 2>&1 || brew list --formula "$f" >/dev/null 2>&1; then echo "already: $f"; else echo "installing $f"; brew install "$f"; fi
}
install git
install git-lfs git-lfs
install gh
if ! brew list --formula node@24 >/dev/null 2>&1; then echo "installing node@24"; brew install node@24 || brew install node; fi
brew link --overwrite --force node@24 >/dev/null 2>&1 || true
install ffmpeg
install yt-dlp
install sox
install deno
if ! brew list --formula python@3.12 >/dev/null 2>&1; then echo "installing python@3.12"; brew install python@3.12; fi
git lfs install >/dev/null 2>&1 || true

if [ "$OS" = "Darwin" ] && ! ls /Applications/Obsidian.app >/dev/null 2>&1; then
  echo "(optional) Obsidian, to read and write your wiki:  brew install --cask obsidian"
fi

echo
echo "Open a NEW Terminal window so the PATH refreshes, then run part 2:"
echo "  bash scripts/instalar-proyecto.sh"
