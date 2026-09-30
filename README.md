# Luisart Video System

🇬🇧 [English README](README.en.md)

**Clónalo y haz tu propia marca, tu propio estilo y tus propios videos con una IA que te guía paso a paso.**
No necesitas saber programar: la IA hace todo lo técnico; tú decides y, cuando hace falta, inicias sesión.

Es el sistema real con el que se edita el canal **@soyluisart** (IA, finanzas y negocios en español),
empaquetado para que cualquiera lo use: transcripción con Whisper, cortes, animaciones en
[Remotion](https://www.remotion.dev) que siguen *tu* design system, efectos de sonido, subtítulos que
respetan la cara, versiones vertical y horizontal y revisión independiente con Codex.

## Empezar (3 pasos)
1. **Clona** el repositorio y ábrelo con [Claude Code](https://claude.com/claude-code) en esa carpeta.
   ```bash
   git clone https://github.com/Luisartt/Luisart-Video-system.git
   cd Luisart-Video-system
   claude
   ```
2. **La guía arranca sola**: un hook de sesión y `CLAUDE.md` hacen que la IA ejecute la skill maestra
   **`luisart-init-skills`** (o escribe `/luisart-init-skills`), que corre **todas las skills en orden** y te pregunta,
   una cosa a la vez, en tu idioma.
3. **Sigue las etapas.** Puedes parar y retomar: tu avance queda en `brand/PROGRESS.md`.

## Lo que la guía hace contigo
| Etapa | Qué pasa | Skill |
|---|---|---|
| 0–1 | idioma, nivel, quién eres y de qué tratan tus videos | `video-system-start` (la dirige `luisart-init-skills`, pasos S01–S17 en `steps.json`) |
| 2 | instalar y verificar la computadora (Remotion, FFmpeg, Python, Whisper, CLIs) | `luisart-montar-sistema` |
| 3 | **Design system: crear uno o importar uno** (sitio web, CSS, tokens, DESIGN.md, PDF, Figma) | `design-system-create` / `design-system-import` |
| 4 | **Referencias** en muchos sitios, enseñándote a armar un tablero (solo enlaces y notas) | `design-references-research` |
| 5 | **Gráficos** en tu marca: título, cifra, gráfica, nombre en pantalla, "dos ejemplos lado a lado" | `graphics-from-design-system` |
| 5b | **Tu wiki**: notas, bandejas RAW (`rawcc` referencias, `rawc` aprendizaje), base de datos por categoría | `wiki-vault-setup` |
| 6 | tu estilo de edición y las reglas de tu canal | `luisart-configurar-estilo` |
| 7 | guion + grabación → análisis, transcripción, vertical/horizontal, edición | `luisart-guion`, `luisart-producir-desde-guion`, `luisart-editar-short` |
| 8 | revisión independiente, entrega y **programar en Buffer** (recomendado) | `luisart-revision-codex`, `buffer-publishing-setup` |

## Qué hay en el repositorio
| Ruta | Contenido |
|---|---|
| `CLAUDE.md` | instrucciones para la IA: arranque guiado, mapeo de nombres, reglas duras |
| `.claude/skills/` | todas las skills (guía, design system, referencias, gráficos, wiki, estilos, edición, revisión…) |
| `channels/_template/` | kit inicial de gráficos **basado en tokens** (tu marca → `tokens.json` → tema → gráficos) |
| `channels/soyluisart/` | ejemplo completo de un canal real: reglas, 4 estilos, biblioteca de animaciones |
| `brand/` | **tu** marca: `brand.json`, `PROGRESS.md`, `paths.json` (tus rutas, editable), `design-system/tokens.json`, `references/` |
| `vault-template/` | esqueleto de tu wiki: manual `CLAUDE.md`, bandejas, plantillas, Web Clipper |
| `docs/BUFFER.md`, `tools/buffer/` | recomendación y setup de Buffer + scripts para programar posts |
| `docs/MODELOS-Y-CLIS.md` | qué modelos y CLIs usar (imágenes, video, voz, revisión) con opciones |
| `scripts/` | instaladores (Windows), herramientas de diseño (contraste, importar tokens, revisar robots.txt) |
| `core/` | raíz de Remotion, render con candado, QA, matte y seguimiento de cara |
| `TOOLS.md` | todas las herramientas con versiones y fuentes |

## Herramientas de diseño (las corre la IA por ti)
```bash
python scripts/design/importar_tokens.py --url https://tu-sitio.com   # importar colores y tipografías
python scripts/design/contraste.py brand/design-system/tokens.json     # ¿se lee bien en un teléfono?
python scripts/design/generar_theme.py                                 # tokens → tema de Remotion
python scripts/design/revisar_robots.py godly.design ...               # ¿este sitio deja leer a una IA?
python scripts/configurar_rutas.py --create --channel mi-marca         # crea carpetas y brand/paths.json
python scripts/progreso.py --list                                      # tu avance en la corrida guiada
npm run studio                                                         # ver y probar los gráficos
```

## Notas importantes
- **Repositorio público:** nunca subas llaves (`.env` está ignorado), grabaciones, audio con licencia, imágenes
  de otros ni tu wiki personal (va en *su propio repositorio privado*).
- **Audio:** no se incluye música ni efectos (licencias). `media/soyluisart/audio/LICENCIAS.md` explica cómo se
  consiguió la biblioteca de ejemplo con licencias limpias.
- **Remotion:** gratis para individuos y equipos pequeños; empresas de más de 3 personas necesitan licencia
  (<https://www.remotion.pro/license>).
- **Licencia:** [MIT](LICENSE). Úsalo, cámbialo y compártelo. Las skills de terceros que se instalan aparte tienen sus propias licencias (ver `TOOLS.md`).
- **Hook de sesión:** `.claude/settings.json` ejecuta `scripts/hook-inicio.mjs`, que solo lee `brand/` e
  imprime un texto. Revísalo si quieres: son 25 líneas.
- Las skills `luisart-*` y `AGENTS.md` vienen del canal original; cada carpeta que mencionan es un marcador que
  configuras en `brand/paths.json` (ver `CLAUDE.md`).
