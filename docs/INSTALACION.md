# Instalación: Windows y Mac / Installation: Windows and Mac

Sirve para las dos. La IA puede hacer casi todo por ti; aquí están los pasos exactos por si prefieres hacerlos tú o
para entender qué pasa. *Works on both. The AI can do almost everything for you; here are the exact steps.*

## 1. Qué necesitas / What you need
| | Windows | Mac |
|---|---|---|
| Sistema | Windows 10 u 11 | macOS 13 o más nuevo |
| Procesador | cualquiera; **tarjeta NVIDIA** recomendada para Whisper y render rápidos | **Apple Silicon (M1 o más nuevo)** recomendado; un Mac Intel sirve para gráficos, carruseles e historias, **no** para la IA local |
| RAM / disco libre | 16 GB · 60 GB | 16 GB · 60 GB |
| Terminal | PowerShell | Terminal (Cmd+Espacio, escribe "Terminal") |
| Instalador de programas | `winget` (ya viene) | `Homebrew` (<https://brew.sh>) |
| Cuentas | GitHub (para tu copia), Claude, y opcional Codex, Buffer | igual |

## 2. La forma fácil: que lo haga la IA / The easy way
1. Instala **Claude Code** siguiendo las instrucciones oficiales (<https://claude.com/claude-code>) e inicia sesión.
2. Clona el repositorio y ábrelo con Claude Code:
   ```bash
   git clone https://github.com/Luisartt/Luisart-Video-system.git
   cd Luisart-Video-system
   claude
   ```
   (En Windows necesitas Git: `winget install Git.Git`. En Mac, al escribir `git` te ofrece instalar las herramientas de Apple.)
3. La skill `luisart-init-skills` arranca sola, detecta tu sistema (Windows o Mac) y corre los pasos de abajo por ti.
   Solo te pedirá tu contraseña o iniciar sesión cuando sea inevitable.

## 3. Windows, paso a paso (PowerShell)
```powershell
# 1) Herramientas (Git, Node, FFmpeg, yt-dlp, Python 3.12, SoX, Deno)
powershell -ExecutionPolicy Bypass -File scripts\instalar-herramientas.ps1
# 2) Cierra y abre PowerShell. Dependencias del proyecto (Remotion, Python con CUDA, Codex)
powershell -ExecutionPolicy Bypass -File scripts\instalar-proyecto.ps1
# 3) Verifica
powershell -File .claude\skills\luisart-montar-sistema\scripts\verificar_equipo.ps1
# 4) Prueba de render (debe crear out\test.png)
npx remotion still core/index.ts TPL-title-card out/test.png --frame=60
```
Notas: si `winget` pregunta por términos de uso, acepta. Mantén la laptop **conectada a la corriente** al renderizar.
Para forzar codificación por hardware: `set REMOTION_HW=required` (por defecto usa NVENC si existe).

## 4. Mac, paso a paso (Terminal)
```bash
# 0) Una sola vez: si Terminal pide "herramientas de línea de comandos", acepta y espera
xcode-select --install
# 1) Homebrew: copia UNA línea de https://brew.sh, pégala, escribe tu contraseña del Mac y sigue las "Next steps" que imprime
# 2) Herramientas (Git, Node 24, FFmpeg, yt-dlp, Python 3.12, SoX, Deno)
bash scripts/instalar-herramientas.sh
# 3) Abre una ventana NUEVA de Terminal. Dependencias del proyecto (Remotion, Python con Metal, Codex)
bash scripts/instalar-proyecto.sh
# 4) Verifica
bash .claude/skills/luisart-montar-sistema/scripts/verificar_equipo.sh
# 5) Prueba de render (debe crear out/test.png)
npx remotion still core/index.ts TPL-title-card out/test.png --frame=60
```
Notas para Mac:
- **Apple Silicon:** PyTorch usa **Metal (MPS)** para Whisper, el recorte de persona y el seguimiento de cara; el render de video usa
  **VideoToolbox** (codificación por hardware) cuando está disponible. La transcripción con Whisper será más lenta que con una NVIDIA.
- **Mac Intel:** el instalador omite la IA local (Whisper, matte, cara). Carruseles, historias, gráficos, Buffer y wiki funcionan igual.
- Renders largos: `caffeinate -i <comando>` evita que el Mac se duerma. Conecta el cargador.
- La primera vez macOS puede preguntar si Terminal puede acceder a **Documentos**/**Escritorio**: permite.
- Si `node` o `python3.12` "no se encuentran" tras instalar: cierra y abre Terminal, o corre `eval "$(/opt/homebrew/bin/brew shellenv)"`.
- Obsidian (opcional, para tu wiki): `brew install --cask obsidian`.

## 5. Después de instalar (igual en los dos)
```bash
python scripts/configurar_rutas.py --create --channel mi-marca   # en Mac: python3 ...
npm run studio                                                    # ver y probar los gráficos
```
y sigue con `luisart-init-skills` (marca → design system → gráficos → wiki → estilo → primer video).

## 6. Diferencias entre sistemas / Differences
| Tema | Windows | Mac |
|---|---|---|
| Python del proyecto | `.venv\Scripts\python.exe` | `.venv/bin/python` (las skills usan el marcador `{PYTHON}`) |
| Scripts de instalación | `.ps1` | `.sh` |
| Aceleración de IA | CUDA (NVIDIA) | Metal/MPS (Apple Silicon) |
| Render de video | NVENC (NVIDIA) | VideoToolbox |
| OpenGL de Remotion | `angle` | el predeterminado |
| Fuentes de ejemplo para FFmpeg `drawtext` | `C:/Windows/Fonts/arial.ttf` | `/System/Library/Fonts/Supplemental/Arial.ttf` |
| Evitar suspensión | Configuración → Energía | `caffeinate -i` |
| Carpeta de la nube | `G:\My Drive\…` | `~/Library/CloudStorage/GoogleDrive-…/My Drive/…` |

## 7. Si algo falla: la IA busca la alternativa según tu sistema / If something fails
Corre `python scripts/diagnosticar.py --save` (python3 en Mac): detecta tu sistema (Windows, Mac Apple Silicon, Mac Intel, Linux) y guarda
las recomendaciones en `brand/system.json`. La skill **`os-fallbacks`** tiene las tablas de alternativas por sistema (instaladores,
Whisper, recorte de persona, seguimiento de cara, render, navegador, descargas, permisos, rutas, suspensión) y la IA las aplica sola.
Ejemplo real: si la GPU NVIDIA falla por una librería de CUDA, la transcripción alternativa (`transcribe_fallback.py`) vuelve sola a CPU.

## 8. Problemas frecuentes / Troubleshooting
- **`npm ci` falla por permisos** (Mac): no uses `sudo`; cierra Terminal y repite tras `bash scripts/instalar-herramientas.sh`.
- **El render se queda sin memoria:** baja la concurrencia: `REMOTION_CONCURRENCY=2` (Windows: `set REMOTION_CONCURRENCY=2`).
- **Whisper tarda mucho en Mac:** es normal la primera vez (descarga ~1.6 GB) y es más lento que en NVIDIA; usa audio corto para probar.
- **`torch` sin aceleración:** corre el verificador; en Mac debe decir `MPS True`, en Windows `CUDA True`.
- **Estado de pruebas:** el sistema se construyó y probó en **Windows**. Los scripts de **Mac** siguen los procedimientos oficiales de
  Homebrew, PyTorch (MPS) y Remotion y se revisaron por sintaxis, pero **no se han ejecutado todavía en un Mac real**: si algo falla,
  dile a la IA el mensaje de error y lo corrige, y anótalo en un *issue* del repositorio.
