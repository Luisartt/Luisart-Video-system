# Videos: con o sin videos de referencia / Videos: with or without reference videos

Para editar tus videos hay **dos rutas**. Las dos son válidas y puedes cambiar de una a otra cuando quieras.
*There are two routes to style your videos. Both are valid and you can switch at any time.*

## Ruta A — Con videos de referencia (recomendada si ya sabes qué te gusta)
Le mandas a la IA videos que te gusten y ella **copia sus principios** (no su identidad): ritmo de cortes, subtítulos, animaciones,
sonido, gancho y forma de hablar.

**Qué tienes que mandar**
1. **De 1 a 5 referencias** (con 1 ya se puede empezar; lo ideal son 3 de 1–3 creadores).
2. **Enlaces públicos** (YouTube, TikTok, Instagram, X…) o archivos de video. Si un sitio pide iniciar sesión, la IA no entra por ti:
   mándale el archivo.
3. **Una línea por referencia** diciendo qué te gustó y si quieres copiar la **edición**, el **guion**, o **las dos**.

**Cómo mandarlas:** con Obsidian Web Clipper (un clic) a la bandeja `rawcc`, o una carpeta con `links.txt` y tus notas. Luego dices
**"procesa rawcc"** (paso S07 de `luisart-init-skills`).

**Qué hace la IA:** descarga, transcribe con Whisper, analiza cuadro por cuadro la edición y el guion, hace pruebas de render de lo copiable,
escribe la nota de análisis en tu wiki y propone qué copiar. Con eso `luisart-configurar-estilo` arma tu **perfil de estilo**.
Las referencias **solo proponen**: tus reglas y estilos cambian únicamente cuando tú lo decides.

## Ruta B — Sin videos de referencia: solo con tu design system
No necesitas mandar ningún video. Tu estilo sale de lo que ya definiste:
- tu **design system** (creado desde cero con `design-system-create` **o** importado con `design-system-import`): colores, tipografías,
  formas, movimiento, sonido y zonas seguras;
- los **elementos base** del kit (título, cifra, gráfica, nombre en pantalla, "dos ejemplos lado a lado", subtítulos) ya pintados con tus tokens;
- las **reglas por defecto** de `channels/_template/CHANNEL.template.md` (las ajustas en el paso S09).

La IA te propone un estilo inicial, te enseña una pieza de muestra y lo afinas con frases como "más rápido", "menos pesado", "más serio".

## ¿Cuál elijo?
| Situación | Ruta |
|---|---|
| Ya admiras a un creador o un estilo de edición concreto | **A** |
| No sabes qué te gusta todavía / quieres empezar ya | **B** (y agrega referencias después) |
| Quieres que tu video se vea igual que tu marca gráfica | **B** |
| Quieres copiar un ritmo o una forma de hablar específica | **A** |

**Se pueden combinar:** empieza con B, y cuando encuentres un video que te encante, mándalo (Ruta A) y actualiza tu estilo con
`luisart-configurar-estilo`. En ambos casos el resto del camino (guion → grabación → edición → revisión) es idéntico.
