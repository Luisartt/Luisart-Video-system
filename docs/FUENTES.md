# Fuentes y créditos / Sources and credits

Este sistema se construyó sobre el trabajo abierto de otras personas. Aquí está **de dónde salió cada pieza**, su licencia y qué tomamos.
*This system stands on other people's open work: where each piece comes from, its licence and what we took.*
Se instalan con `python scripts/instalar_fuentes.py --install` (lista completa y legible por máquina: `third-party/sources.json`).
**Las licencias cambian: revisa cada repositorio antes de redistribuir algo.**

## 1. Skills y repositorios que se instalan con un comando
| Fuente | Repositorio | Licencia | Qué tomamos / para qué sirve |
|---|---|---|---|
| **Agent Reach** | https://github.com/Panniantong/agent-reach | MIT | La skill `agent-reach`: lee internet público (YouTube, Instagram, X, Reddit, GitHub, web, RSS…) para referencias e investigación |
| **Remotion skills** | https://github.com/remotion-dev/skills | ver el repo | Buenas prácticas para construir video en Remotion (`remotion-best-practices` y 10 más) |
| **Playwright CLI** | https://github.com/microsoft/playwright-cli | Apache-2.0 | Revisar diseños en un navegador real (teléfono/escritorio, claro/oscuro) |
| **Taste skills** | https://github.com/leonxlnx/taste-skill | MIT | Dirección de diseño: `design-taste-frontend`, `redesign-existing-projects`, `industrial-brutalist-ui`, `brandkit`, `full-output-enforcement` |
| **Impeccable** | https://github.com/pbakaus/impeccable | Apache-2.0 | `/impeccable critique` y `/impeccable audit` antes de entregar un diseño |
| **awesome-design-md** | https://github.com/voltagent/awesome-design-md | MIT | Colección de `DESIGN.md` de marcas conocidas (74 al instalar): se toman **principios**, no identidad (`design-system-import`) |
| **img2threejs** (opcional) | https://github.com/img2threejs/img2threejs | Apache-2.0 | Convertir una imagen en una escena 3D (solo si pides 3D) |

## 2. Herramientas y modelos que el sistema usa (se instalan con los scripts de `scripts/`)
| Herramienta | Repositorio / sitio | Licencia | Para qué |
|---|---|---|---|
| **Remotion** | https://github.com/remotion-dev/remotion | licencia propia de Remotion (gratis para individuos y equipos pequeños; empresas de más de 3 personas necesitan licencia: <https://www.remotion.pro/license>) | Construir el video desde código con tu design system |
| **Whisper** (modelo `large-v3-turbo`) | https://github.com/openai/whisper | MIT | Transcripción de todo audio y video |
| **faster-whisper** | https://github.com/SYSTRAN/faster-whisper | MIT | Transcripción alternativa (CPU/CUDA) |
| **mlx-whisper** (Mac con Apple Silicon) | https://github.com/ml-explore/mlx-examples | MIT | Transcripción alternativa rápida en Mac |
| **Robust Video Matting** | https://github.com/PeterL1n/RobustVideoMatting | **GPL-3.0** (se descarga en uso con `torch.hub`; no se incluye en este repo) | Recortar a la persona del fondo |
| **facenet-pytorch** | https://github.com/timesler/facenet-pytorch | MIT | Seguir la cara para subtítulos que la respetan |
| **Qwen3-TTS** | https://github.com/QwenLM/Qwen3-TTS | Apache-2.0 | Voz sintética (nunca se clona una voz sin permiso) |
| **CrisperWhisper** | https://github.com/nyrahealth/CrisperWhisper | revisar el repo | Instalado como opción; no es la ruta principal |
| **yt-dlp** | https://github.com/yt-dlp/yt-dlp | Unlicense | Descargar referencias públicas |
| **Playwright** | https://github.com/microsoft/playwright | Apache-2.0 | Carruseles, historias y sesión de Buffer |
| **Obsidian Web Clipper** | https://github.com/obsidianmd/obsidian-clipper | MIT | Guardar referencias en las bandejas `rawcc` y `rawc` con un clic |
| **Claude Code**, **Codex CLI** | https://claude.com/claude-code · https://github.com/openai/codex | de cada proveedor | El operador del sistema y la revisión independiente |
| **Buffer**, **Obsidian**, **Higgsfield** | servicios/aplicaciones | sus términos | Programar publicaciones, tu wiki, imágenes y clips generados |

## 3. Sitios de referencia (solo enlaces)
La lista de galerías y sitios de diseño y movimiento, con su política de acceso de IA, está en
`.claude/skills/design-references-research/references/sites.md`.

## 4. Cómo se usa todo esto
`luisart-init-skills` paso S02b ejecuta la skill `install-third-party-skills`, que corre `scripts/instalar_fuentes.py`. Después, cada skill del
sistema llama a estas fuentes cuando las necesita (por ejemplo `design-references-research` usa Agent Reach y `design-system-import`
consulta los `DESIGN.md` de awesome-design-md). Para agregar una fuente nueva, añade una entrada a `third-party/sources.json`.
