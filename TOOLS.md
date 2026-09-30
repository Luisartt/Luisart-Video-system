# Herramientas que necesita el sistema

Todo se instala con `scripts/instalar-herramientas` (programas) y `scripts/instalar-proyecto` (dependencias del proyecto):
`.ps1` en Windows, `.sh` en Mac/Linux. Instrucciones paso a paso: `docs/INSTALACION.md`. Versiones con las que se construyó y verificó (2026-09-30).

## Programas (Windows: winget · Mac: Homebrew)
| Herramienta | Para qué | Versión probada | winget id (Windows) · fórmula brew (Mac) |
|---|---|---|---|
| Git + Git LFS + GitHub CLI | repositorios | git 2.55 · lfs 3.7 · gh 2.101 | `Git.Git` `Git.GitLFS` `GitHub.cli` |
| Node.js | Remotion y scripts | 24.19 | `OpenJS.NodeJS` |
| FFmpeg | audio/video, contact sheets | 9.0.1 | `Gyan.FFmpeg` |
| yt-dlp | descargar referencias | 2026.08.19 | `yt-dlp.yt-dlp` |
| Python 3.12 (exactamente) | Whisper, matte, face track | 3.12.10 | `Python.Python.3.12` |
| SoX | procesar audio | 14.4.2 | `ChrisBagwell.SoX` |
| Deno | utilidades de yt-dlp | 2.9 | `DenoLand.Deno` |
| Claude Code | el asistente que lo opera | 2.1 | instalador oficial de Anthropic |
| Codex CLI | revisión independiente e imágenes | 0.159 | `npm i -g @openai/codex` |

## Remotion (todo en `package.json`, fijado en `package-lock.json`)
`remotion`, `@remotion/cli`, `bundler`, `renderer`, `captions`, `fonts`, `google-fonts`,
`layout-utils`, `media-utils`, `noise`, `paths`, `shapes`, `transitions`, `zod-types`: todos
**4.0.529**; `react` y `react-dom` 19.3; `zod` 4.5; TypeScript 5; `tsx`; Playwright.
`npm ci` instala exactamente eso. **Licencia de Remotion:** gratis para individuos y equipos
pequeños; las empresas de más de 3 personas necesitan una licencia de pago
(<https://www.remotion.pro/license>). Revisa tu caso antes de un uso comercial.

## Python (`requirements-venv.txt`)
PyTorch 2.5.1 + CUDA 12.1, `transformers` 4.57 (Whisper large-v3-turbo), `qwen-tts`, `crisperwhisper`,
`facenet-pytorch` (`--no-deps`), `opencv`, `OpenTimelineIO`, `librosa`, `soundfile`. Los modelos se
descargan solos la primera vez (~1.6 GB el de Whisper).

## Skills de terceros (no incluidas; `python scripts/instalar_fuentes.py --install` las instala; detalle en `docs/FUENTES.md`)
| Skill | Fuente |
|---|---|
| remotion-best-practices (+10) | `npx skills add remotion-dev/skills` |
| **agent-reach** (investigar en internet) | https://github.com/Panniantong/agent-reach |
| design-taste-frontend, redesign-existing-projects, industrial-brutalist-ui, brandkit, full-output-enforcement | https://github.com/leonxlnx/taste-skill |
| impeccable | https://github.com/pbakaus/impeccable |
| playwright-cli | https://github.com/microsoft/playwright-cli |
| img2threejs | https://github.com/img2threejs/img2threejs |
| awesome-design-md (referencias de diseño) | https://github.com/voltagent/awesome-design-md |

## Publicación (opcional)
| Herramienta | Para qué | Nota |
|---|---|---|
| **Buffer** (cuenta + conector MCP) | programar Instagram y otras redes | plan gratis para empezar; ver `docs/BUFFER.md` |
| Playwright (ya en `package.json`) | `tools/buffer/` sube archivos con tu sesión guardada | la sesión queda en `.profiles/buffer` (ignorada por git) |

## Tarjeta de video
NVIDIA con driver ≥ 551.76 para codificar con NVENC (probado con RTX 4050 Laptop 6 GB). Sin GPU todo
funciona, más lento; ajusta `core/lib/render-settings.ts`.

## Lo que NO está en este repositorio (a propósito)
- Música y efectos de sonido (las licencias prohíben redistribuirlos sueltos): `media/soyluisart/audio/LICENCIAS.md`
  lista cada archivo con su URL de origen para volver a bajarlo.
- Grabaciones, renders, `archive/`, modelos, `node_modules`, `.venv`.
- Llaves (`.env`), la bóveda de conocimiento (privada) y el material de cursos.
- Frames y análisis de videos de otros creadores, y las marcas de clientes.
