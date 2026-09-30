# Modelos y CLIs / Models and CLIs

Guía corta. *Short guide.* No hace falta elegir modelos: cada herramienta escoge el suyo.

## Las dos herramientas que operan el sistema
| Herramienta | Para qué |
|---|---|
| **Claude Code** (CLI) | el asistente que lee `CLAUDE.md`, corre las skills, instala, renderiza y te guía |
| **Codex CLI** (OpenAI) | revisión independiente de cada entrega y generación de imágenes |

Probablemente ya los tienes. Por si acaso (necesitan Node.js), y luego inicia sesión tú cuando lo pidan
(`claude`, `codex login`):
```bash
npm install -g @anthropic-ai/claude-code
npm install -g @openai/codex
claude --version && codex --version
```
Nunca pegues llaves o contraseñas en el chat.

## Imágenes y clips generados
Dos caminos; la herramienta elige el modelo:
1. **Vía Codex** (por defecto): `codex exec` con el prompt. Sin API aparte.
2. **API de Higgsfield**: si prefieres su servicio; pon tu llave en `.env` (está en `.gitignore`).

Las imágenes no llevan texto, números, logos ni caras: todo texto y gráfico se construye en Remotion con tus
tokens. Marca lo generado por IA en `SOURCES.md`.

## Local (ya incluido en el sistema)
- Transcripción: **Whisper** (`transcribe_parts.py`). Todo audio y video pasa por Whisper antes de resumirse.
- Quitar fondo y seguir la cara: `core/scripts/py/matte.py` y `face_track.py`.
- Nunca se clona una voz sin permiso explícito de su dueña o dueño; la música la eliges tú.
