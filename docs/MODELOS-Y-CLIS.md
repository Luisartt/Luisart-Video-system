# Guía de modelos y CLIs / Models and CLIs guide

Qué modelo usar para cada tarea, con opciones. *Which model to use for each task, with options.*
Es una **guía, no una obligación**: cambia de proveedor cuando te convenga y anota en
`brand/brand.json` lo que elegiste. Los modelos y precios cambian rápido: **confirma nombres exactos y
precios en la documentación de cada proveedor** antes de gastar.

> Marcas de confianza: ✅ = se usó y verificó en este sistema · ◻ = opción sugerida, no probada aquí.

## 1. El operador (quien maneja todo el sistema)
| Herramienta | Para qué | Nota |
|---|---|---|
| ✅ **Claude Code** (CLI) | el asistente que lee `CLAUDE.md`, corre las skills, instala, renderiza y te guía | iniciar sesión tú una vez: ejecuta `claude` en la carpeta del repo |
| ✅ **Codex CLI** (OpenAI) | revisión independiente de cada entrega y generación de imágenes con ChatGPT | iniciar sesión tú: `codex login` |
| ◻ Gemini CLI | segunda opinión o transcripciones muy largas | ver `luisart-procesar-material` |

Probablemente ya los tienes instalados. Por si acaso (necesitan Node.js):
```bash
npm install -g @anthropic-ai/claude-code   # Claude Code
npm install -g @openai/codex               # Codex CLI
claude --version && codex --version        # comprobar
```
Consulta las páginas oficiales de instalación si tu sistema pide otro método (por ejemplo el
instalador nativo de Claude Code). Nunca pegues llaves o contraseñas en el chat: inicia sesión en el
navegador cuando la herramienta lo pida.

## 2. Imágenes e ilustraciones (B-roll)
Regla de este sistema: **las imágenes no llevan texto, números, logos ni caras**; todo texto y gráfico
se construye en Remotion con tus tokens.

| Opción | Cuándo | Cómo |
|---|---|---|
| ✅ **Imágenes de ChatGPT vía Codex CLI** (por defecto) | estilo consistente, ya incluido en tu suscripción, sin API aparte | `codex exec` con el prompt, una llamada a la vez; guarda en `media/<slug>/automated-research/<video>/` con `SOURCES.md` |
| ◻ **API de Higgsfield** (acceso a varios modelos de imagen y video, p. ej. Seedance) | cuando quieres varios modelos en una sola cuenta o clips de video generados | llave en `.env` (nunca en git); ver la documentación de Higgsfield |
| ✅/◻ **fal.ai** | modelos de imagen/video por cola (en este repo: `npm run fal -- <endpoint> <input.json> --out <dir> --name <base>`) | llave `FAL_KEY` en `.env`; registra gasto en `fal-spend.csv` (local) |
| ◻ Modelos locales (Stable Diffusion/Flux) | cero costo por imagen, requieren GPU potente | fuera del alcance de este repo |

Sobre nombres: el autor del sistema usa "GPT" (imagen) por Codex y menciona **Seedance 2.5** a través de
Higgsfield para video generado. Los nombres exactos de versión (y si existe esa versión) **confírmalos
en el proveedor**; en este repo solo quedó verificado ChatGPT-por-Codex y Seedance vía fal.ai (se
acabó el crédito durante las pruebas).

**Elegir:** ¿necesitas ilustraciones fijas para un fondo? → ChatGPT por Codex. ¿Quieres un clip de 5–10 s
generado (movimiento de cámara, escena)? → un modelo de video (Seedance/otros) por Higgsfield o fal.
Siempre marca lo generado por IA en `SOURCES.md` y respeta las reglas de la plataforma donde publiques.

## 3. Voz, transcripción y audio
| Tarea | Modelo | Nota |
|---|---|---|
| ✅ Transcripción | **Whisper large-v3-turbo** (local, GPU) | `transcribe_parts.py`, corta en pausas ≤ 28 s para no alucinar; idioma `spanish|english|auto` |
| ✅ Quitar el fondo de la persona | **Robust Video Matting** (local) | `core/scripts/py/matte.py` |
| ✅ Seguir la cara (subtítulos que la respetan) | **facenet-pytorch (MTCNN)** (local) | `core/scripts/py/face_track.py` |
| ◻ Voz sintética | **Qwen3-TTS** (local, instalado; uso limitado) | **nunca clones una voz sin permiso explícito de su dueño** |
| ✅ Música y efectos | los eliges tú; licencias limpias | ver `media/soyluisart/audio/LICENCIAS.md` (cómo se consiguió la biblioteca de ejemplo; los audios no vienen en el repo) |

## 4. Quién hace qué (para gastar poco)
- Planear, escribir, editar código, analizar y guiarte: **Claude Code** (modelo más capaz que tengas).
- Tareas repetitivas y de lectura (resumir una transcripción larga, clasificar referencias): un modelo
  más pequeño/rápido basta; cambia el modelo del CLI si te conviene.
- Revisión final independiente: **Codex** (otro proveedor = ojos distintos).
- Render y Whisper: **tu GPU**, de uno en uno.

## 5. Checklist de llaves y cuentas (todo opcional salvo lo marcado)
- [ ] Claude Code con sesión iniciada (necesario)
- [ ] Codex CLI con sesión iniciada (recomendado: revisión e imágenes)
- [ ] GitHub (`gh auth login`) si vas a subir tu propio repo
- [ ] `.env` con `FAL_KEY` u otras llaves solo si usas esos servicios (**`.env` está en `.gitignore`; no lo subas**)
