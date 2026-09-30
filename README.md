# Luisart Video System

Sistema para convertir una grabación (más un guion) en videos terminados para **@soyluisart**
(IA, finanzas y negocios en español, México): transcripción con Whisper, cortes, animaciones en
[Remotion](https://www.remotion.dev), efectos de sonido, subtítulos que respetan la cara, versiones
vertical y horizontal y revisión independiente con Codex. Lo opera un asistente de IA (Claude Code);
la persona que graba solo elige el estilo.

## Qué hay aquí
| Carpeta / archivo | Contenido |
|---|---|
| `AGENTS.md` | guía completa para cualquier asistente de IA (roles, reglas, flujo de punta a punta) |
| `GUIDELINES.md`, `PROJECTS.md` | máquina, herramientas verificadas, estado de los videos |
| `.claude/skills/luisart-*` | las skills: reglas, editar, sonido, animaciones, revisión Codex, guion, procesar referencias, **montar el sistema**, **configurar estilo**, **producir desde guion** |
| `.claude/agents/` | subagentes (investigador, editor, animador) |
| `channels/soyluisart/` | `CHANNEL.md` ★ (fuente de verdad), estilos (`styles/`: Luisart/pizarra, Kallaway, Terminal, Documental), animaciones, prototipos |
| `core/` | raíz de Remotion, render con candado, QA, scripts de Python (matte, face track) |
| `media/soyluisart/brand/` | marca propia (logos y mascotas) |
| `TOOLS.md` | todas las herramientas, versiones y fuentes |
| `scripts/` | instaladores para Windows |

## Empezar en una computadora nueva (Windows)
```powershell
git clone https://github.com/Luisartt/Luisart-Video-system.git
cd Luisart-Video-system
powershell -ExecutionPolicy Bypass -File scripts\instalar-herramientas.ps1
# terminal nueva:
powershell -ExecutionPolicy Bypass -File scripts\instalar-proyecto.ps1
powershell -File .claude\skills\luisart-montar-sistema\scripts\verificar_equipo.ps1
npm run studio
```
Con Claude Code abierto en la carpeta, basta decir "monta el sistema en esta computadora": la skill
`luisart-montar-sistema` hace el resto y prueba con un render.

## Notas
- Los renders, la voz y la transcripción usan la GPU de uno en uno (`core/scripts/*-locked.ts`).
- El video de referencia `videos/2026-09-27-per-barato` está como código de ejemplo pero **no se
  registra** en el estudio: necesita la grabación y los medios, que no se publican.
- Las rutas de las skills asumen `C:\Users\<usuario>\Documents\Proyectos\tubeai-video` y una bóveda
  privada en `Documents\Lartyk`; ajústalas si tu estructura es distinta (la skill de montaje lo explica).
- Sin licencia explícita: todos los derechos reservados hasta que se decida una.
