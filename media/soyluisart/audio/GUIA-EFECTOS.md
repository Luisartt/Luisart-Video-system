# Guía de efectos de sonido — @soyluisart

Biblioteca: `media/soyluisart/audio/efectos/<categoría>/` · **207 efectos** (111 de la primera tanda + 96 nuevos del
2026-09-27, ver «Ampliación» al final) · todos WAV 48 kHz estéreo 16 bit, con el silencio inicial recortado (el sonido
empieza en el frame 0 del archivo). Los originales descargados están en `archive/soyluisart/audio-originales/efectos/_originales/` (fuera de media para no copiarlos en cada render).
Categorías nuevas: `marker/` (rotulador, tiza, subrayador), `paper/` (páginas, post-its, grapadora), `correct-wrong/`
(quiz), `counter/` (números que cuentan), `clock/`, `camera/`, `bubble/`, `bass/`, `sparkle/`.
Licencias y URL de cada archivo: `LICENCIAS.md`. Versión legible por máquina (para el agente editor): `efectos/sfx-index.json`.

## Cómo leer esta guía (convenciones para colocar efectos automáticamente)

- **fps = 30.** Todos los offsets están en frames a 30 fps.
- **Evento** = el frame en el que el gráfico se ve completo / aterriza (en el kit de tarjetas es `LAND_FRAME`), el frame
  totalmente cubierto de una transición, o el primer frame de la palabra dicha.
- **Pico (f)** = primer frame, dentro del archivo, en que el sonido llega a 3 dB de su máximo (medido con ffmpeg en ventanas de 10 ms) — es el «golpe» que se percibe.
- **Regla de colocación por defecto:** `inicio del audio = frame del evento − pico`. Así el golpe del sonido cae
  exactamente en el evento. En la columna «Dónde» esto aparece como «Inicia N f antes del evento».
- Si el inicio calculado queda antes del frame 0 del vídeo (p. ej. un whoosh en el frame 0), no lo muevas: empieza en 0
  y **recorta el principio del archivo** N frames (`<Audio trimBefore={N}>`; el proyecto usa Remotion
  4.0.529, donde `startFrom` está obsoleto).
- **Volumen** = valor `volume` de `<Audio>` en Remotion, pensado para una voz a ~−16 LUFS. Los archivos llegan con picos
  cercanos a 0 dBFS; 0,35 ≈ −9 dB, 0,3 ≈ −10 dB, 0,25 ≈ −12 dB, 0,2 ≈ −14 dB, 0,15 ≈ −16 dB, 0,1 ≈ −20 dB.
  Acentos: 0,25–0,4. Camas/texturas bajo la voz: 0,08–0,2. Ajusta ±3 dB de oído.
- Ruta en Remotion (publicDir = `media`): `staticFile("soyluisart/audio/efectos/ui/ui-click-mouse-01.wav")`.
- **Estilo:** T = Terminal (UI tech azul/negro), D = Documental (cine, grano, barras amarillas), A = ambos. En la
  ampliación se usa además **Luisart** (pizarra blanca de los Shorts) y **Todos** (sirve en los tres estilos).
- **Volumen de la tanda 2:** los 96 efectos nuevos están normalizados a **pico −3 dBFS** (los antiguos llegan a ~0 dBFS),
  así que sus volúmenes sugeridos son ~3 dB más altos (0,35–0,45 en acentos). En `sfx-index.json` llevan el campo `added`.

## Reglas generales

1. **Los whooshes (y swooshes/sweeps) son SOLO para la apertura del vídeo (pico en el frame 0) y para transiciones
   reales entre escenas** (entrada/salida de la pizarra, cambio de capítulo, scan/flash/wipe de sección). **Nunca** en
   cada elemento que aparece, ni en un punch-in, ni al cambiar de tarjeta, página o gráfico dentro de la misma escena
   (eso lleva un sonido pequeño y específico: click, pop, marcador, papel). (Regla del usuario, 2026-09-27.)
2. Los elementos que aparecen llevan sonidos pequeños y específicos: click/tap de UI para bloques de texto y chips,
   teclado mecánico para texto tecleado o decrypt, split-flap para tickers, pop suave para tags pequeños, sello/thud
   para sellos, ding/chime para resultados.
3. **Un acento por beat.** Si dos gráficos diseñados como UN solo beat aterrizan a menos de 6 f, suena solo el más
   importante; cada evento gráfico distinto lleva su propio sonido específico.
   Máximo ~1 acento fuerte (impacto, braam, ka-ching, ding de palabra clave) cada 5–8 s.
4. **La voz manda.** Ningún efecto fuerte encima de una palabra clave dicha: colócalo en el hueco entre palabras o
   bájalo a ≤ 0,2. Clicks y pops a 0,3 no molestan; impactos sí.
5. **Música: por defecto NO hay.** Solo se usa si el usuario aporta el archivo
   (`media/soyluisart/user-provided/musica/`, ver CHANNEL.md); nunca se elige una cama por él. Si la aporta: voz a
   ~−16 LUFS integrados, cama a **−20 a −24 LUFS** bajo la voz (ducking). Los efectos se suman por encima, no se duckean.
6. **Sincroniza al frame.** Los golpes (clicks, pops, impactos) con pico en f0–f2 van 0–1 frame **antes** del
   aterrizaje; los que tienen pico tardío (whooshes, risers) se adelantan su pico completo.
7. Los archivos largos (tecleo 24–26 s, split-flap 2 min, room tone 2 min, escáner 11 s) son **camas**: recórtalos a
   la duración del gráfico con fade-out de 3–10 f. Nunca dejes que suenen enteros.
8. Varía: alterna los 2–3 archivos de la misma familia (p. ej. teclas `typing-mechanical-key-single-01` /
   `typing-key-single-02` / `typing-single-key-01`) para que no suene a bucle.
9. Mismo sonido para el mismo tipo de elemento en todo el vídeo (coherencia de marca).

## Mapa de sonido por defecto (por tipo de elemento)

«Pre-roll» = frames antes del evento en que empieza el archivo (ya calculado con el pico). Vol = volumen Remotion.

| Tipo de elemento | IDs de la biblioteca | Efecto(s) por defecto | Timing | Vol |
|---|---|---|---|---|
| Palabra cinética detrás de la cabeza | behind-head words (Shorts kinetic) | `efectos/typing/typing-mechanical-key-single-01.wav` alternando con `efectos/typing/typing-key-single-02.wav`; si la palabra se escribe letra a letra: `efectos/typing/typing-key-presses-short-02.wav` | Tecla: pre-roll 0–1 f antes del frame en que la palabra aparece. Ráfaga: desde el primer carácter, cortar en el último. Solo la palabra-gancho del hook puede sumar `efectos/impact/impact-bass-hit-short-01.wav` (vol 0,2, pre-roll 0 f) | 0,3 |
| Bloque de subtítulos (caption chunk) | SLA-doc-captions-highlight-*, captions Terminal | Ninguno por bloque. Solo la palabra resaltada: `efectos/pop/pop-sharp-01.wav` (T/D) | Pre-roll 1 f antes del frame en que se colorea la palabra; máx. 1 cada 5–8 s | 0,25 |
| Tarjeta / chip que aterriza | tarjetas de la pizarra, LessonCard, SearchPill, YouTubeCard, StatCallout, chips | `efectos/ui/ui-click-mouse-01.wav` (principal) · `efectos/ui/ui-click-tone-01.wav` (Terminal) · secundarios: `efectos/ui/ui-click-mouse-02.wav` o `efectos/pop/pop-dry-03.wav` | En `LAND_FRAME − 1` (igual que el kit actual) | 0,3–0,35 |
| Tag pequeño / icono / emoji | tags mono [01], iconos | `efectos/pop/pop-soft-01.wav` · alternativa `efectos/pop/pop-minimal-01.wav` | 1 f antes de que el tag sea visible | 0,3 |
| Split-flap / ticker | SLA-term-ticker-gain, -loss, -watchlist (+ -v) | `efectos/ticker/ticker-split-flap-01.wav` recortado + al asentarse el precio `efectos/data/data-bleep-01.wav` | Split-flap desde el primer frame en que giran los tiles hasta que paran (fade-out 3 f). Bleep: pre-roll 1 f antes del frame en que se fija el último tile. Ganancia: opcional `efectos/money/money-coins-clink-01.wav` (pre-roll 2 f). Pérdida: opcional `efectos/impact/impact-bass-hit-short-01.wav` a 0,2 | 0,3 (flap) / 0,3 |
| Número contando (count-up) | SLA-term-keyword-stat, SLA-doc-big-number-*, StatCallout | `efectos/tension/tension-ticking-counter-01.wav` durante el conteo; al fijarse: Terminal `efectos/data/data-bleep-01.wav` · Documental `efectos/impact/impact-cinematic-boom-01.wav` | Ticking: del primer al último frame del conteo, cortar seco. Remate: pre-roll 1 f (bleep) / 3 f (boom) antes del frame final | 0,2 / 0,3 |
| Gráfico que se dibuja (chart draw-on) | SLA-term-chart-up, SLA-term-chart-down | `efectos/data/data-ui-progress-01.wav` recortado bajo el dibujado; marcadores buy/sell: `efectos/pop/pop-minimal-01.wav`; etiqueta de valor final: `efectos/data/data-bleep-01.wav` | Cama desde el primer frame del trazo hasta el último (fade 6 f). Pops 1 f antes de cada marcador. Chart-down puede cerrar con `efectos/impact/impact-sub-drop-01.wav` a 0,2 | 0,2 / 0,3 |
| Logos con beams / red de logos | SLA-term-beams-3-logos, -5-logos, -versus · SLA-doc-logo-network-* | Terminal: `efectos/data/data-loading-system-01.wav` desde el primer frame + `efectos/ui/ui-tech-select-01.wav` por logo que aterriza + `efectos/ui/ui-option-select-01.wav` cuando el hub/VS se ilumina. Documental: `efectos/pop/pop-soft-01.wav` por logo + `efectos/impact/impact-sub-boom-01.wav` (0,2) en el anillo “sonar” del centro | Clicks/pops 1 f antes de cada logo; sub-boom pre-roll 4 f antes del sonar | 0,25–0,3 |
| Lower third | SLA-term-lower-third-*, SLA-doc-lower-third-* | Terminal: `efectos/ui/ui-click-tone-01.wav` al aterrizar el panel + `efectos/typing/typing-mechanical-short-01.wav` bajo la línea tecleada. Documental: `efectos/ui/ui-click-classic-02.wav` al aterrizar, sin tecleo | Click en aterrizaje −1 f; tecleo desde el primer carácter, recortar al último | 0,3 / 0,25 |
| Título / tarjeta de capítulo | SLA-term-title-left/-center/-subtitle · SLA-doc-part-title-* · SLA-doc-stamp-chapter | Terminal: `efectos/typing/typing-mechanical-run-01.wav` bajo las líneas tecleadas + `efectos/typing/typing-key-hard-single-03.wav` en el último carácter. Documental: `efectos/impact/impact-cinematic-boom-01.wav` al aparecer el título (+ opcional `efectos/riser/riser-short-01.wav` para que su pico caiga ahí) | Tecleo del 1.er al último carácter; tecla dura −0 f. Boom pre-roll 3 f; riser pre-roll 46 f | 0,25 / 0,3 |
| Énfasis (ahora subrayado/texto, sin barra detrás) | SLA-doc-emphasis-yellow, -stacked, -red | `efectos/impact/impact-bass-hit-short-01.wav`; la roja (advertencia seria) puede usar `efectos/impact/impact-braam-01.wav` | Bass hit pre-roll 0 f antes del frame en que la barra llega a su ancho total; braam pre-roll 14 f | 0,3 |
| Revelación de número grande | SLA-doc-big-number-percent, -money, -versus, -drop | Riser + remate: `efectos/riser/riser-short-01.wav` → `efectos/impact/impact-cinematic-boom-01.wav` (percent/versus) · `efectos/money/money-cash-register-kaching-01.wav` (money) · `efectos/impact/impact-braam-01.wav` (drop) | Riser pre-roll 46 f (su pico = frame en que el número queda fijo). Boom 3 f · ka-ching 5 f · braam 14 f antes del mismo frame | 0,25 riser / 0,3 remate |
| Entrada a la pizarra (board scene) | escena pizarra/board de los Shorts | `efectos/whoosh/whoosh-air-fast-04.wav` (es una transición real) | Pre-roll 12 f para que el pico caiga en el corte seco a la pizarra (Luisart corta en seco, sin wipe). Salida: `efectos/whoosh/whoosh-wind-short-06.wav` pre-roll 5 f antes del corte de vuelta a la cara. Las tarjetas dentro de la pizarra = clicks | 0,35 |
| Transición scan (Terminal) | SLA-term-transition-scan, -scan-chapter (+ -v) | `efectos/transition/transition-tech-slide-01.wav` + opcional cama `efectos/data/data-scanner-sweep-01.wav` a 0,15 | Slide: empieza 2 f antes del primer frame del barrido. Scan-chapter: añadir `efectos/typing/typing-key-presses-short-02.wav` bajo el titular. Para cambio de sección grande: `efectos/whoosh/whoosh-tech-scifi-01.wav` recortado a 2 s, pre-roll 30 f antes del frame cubierto | 0,35 |
| Transición flash (Documental) | SLA-doc-transition-flash (pico en frame 15 del clip) | `efectos/whoosh/whoosh-fast-01.wav` + opcional `efectos/film/film-camera-flash-01.wav` | Whoosh: inicio = inicio del clip + 15 − 21 = **-6 f** respecto al inicio del clip. Flash de cámara: inicio en clip +13 f | 0,4 / 0,25 |
| Transición wipe (Documental) | SLA-doc-transition-wipe, -wipe-amber (cubre en frame 15) | `efectos/transition/transition-air-sweep-04.wav` (wipe normal) · `efectos/transition/transition-swipe-fast-01.wav` (amber) | Inicio = clip + 15 − 7 = **clip + 8 f** (swipe: clip + 9 f) | 0,3 |
| Sello / fecha / lugar | SLA-doc-stamp-place-year, -date | `efectos/typing/typing-typewriter-01.wav` recortado a los caracteres + `efectos/typing/typing-typewriter-bell-01.wav` al terminar; sello estampado: `efectos/misc/misc-stamp-01.wav` o `efectos/impact/impact-thud-01.wav` | Máquina desde el 1.er carácter; campana pre-roll 1 f tras el último carácter; sello pre-roll 0 f antes del impacto visual | 0,25 / 0,35 |
| Cita | SLA-doc-quote-short, -long | `efectos/ui/ui-click-classic-02.wav` en la primera palabra; textura opcional `efectos/film/film-vinyl-crackle-01.wav` a 0,08 | Click −1 f; crackle como cama bajo toda la cita | 0,3 |
| Línea de tiempo | SLA-doc-timeline-3-points, -5-points | `efectos/pop/pop-minimal-01.wav` por punto | 1 f antes de cada punto | 0,3 |
| Checklist de pasos | SLA-term-checklist-3-steps, -5-steps | `efectos/ui/ui-option-select-01.wav` por paso marcado + `efectos/reaction/reaction-success-chime-01.wav` al completar | Tick −0 f; chime pre-roll 10 f antes del “done” | 0,3 |
| Callout (caja/subrayado) | SLA-term-callout-box, -underline | `efectos/ui/ui-click-digital-01.wav` cuando el marco se cierra; si señala un error: `efectos/glitch/glitch-digital-01.wav` | Click −1 f; glitch pre-roll 0 f | 0,3 / 0,25 |
| Comparativa | SLA-term-compare-* | `efectos/ui/ui-click-select-01.wav` por fila; ganador: `efectos/notification/notification-ding-keyword-01.wav` | Click pre-roll 0 f; ding pre-roll 1 f | 0,3 |
| Palabra clave destacada | SLA-term-keyword-single/-stacked | `efectos/ui/ui-tech-select-01.wav`; si es LA idea del vídeo: `efectos/notification/notification-ding-keyword-01.wav` | −1 f / pre-roll 1 f | 0,3 |
| CTA («guárdalo», «sígueme») | CTA final / intermedio | `efectos/notification/notification-bell-ding-01.wav` cuando aparece el texto del CTA + `efectos/ui/ui-click-mouse-01.wav` si se “pulsa” un botón | Ding pre-roll 0 f; click −1 f | 0,3 |
| Outro / end card | pantalla final | `efectos/whoosh/whoosh-soft-02.wav` en la entrada (es transición); si hay logo: `efectos/whoosh/whoosh-into-hit-02.wav` | Whoosh pre-roll 19 f antes del frame en que la end card cubre; logo pre-roll 19 f antes de que el logo quede fijo | 0,3 |

**Añadidos 2026-09-27 (tanda 2).** Tipos de elemento que antes no tenían sonido propio:

| Tipo de elemento | Dónde aparece | Efecto(s) por defecto | Timing | Vol |
|---|---|---|---|---|
| Flecha / subrayado / círculo dibujado a mano | Luisart | `efectos/marker/marker-pen-line-01.wav` (trazo corto) · círculo con chirrido: recorte de `efectos/marker/marker-whiteboard-squeak-01.wav` · tachado: `efectos/marker/marker-chalk-line-01.wav` | Desde el primer frame del trazo; corta cuando termina el trazo (fade 3 f) | 0,35–0,4 |
| Nota manuscrita (Shadows Into Light) | Luisart | `efectos/marker/marker-pencil-letters-01.wav` (1 s) · frase larga: cama `efectos/marker/marker-whiteboard-write-02.wav` | Desde el primer carácter; cierra con `efectos/marker/marker-cap-click-01.wav` si el dibujo termina ahí | 0,3–0,35 |
| Resaltado tipo marcador fosforito | Documental / Luisart | un trazo de `efectos/marker/marker-highlighter-01.wav` (0,07–0,6 s) | Arranca con la barra; corta al llegar a su ancho total | 0,35 |
| Post-it que se pega / se quita | Luisart | pegar: `efectos/paper/paper-sticky-note-01.wav` (golpe a 2,02 s) · quitar: `efectos/paper/paper-sticky-note-peel-01.wav` | Pegar: pre-roll 61 f (o `trimBefore=55`) | 0,4 |
| Hoja/tarjeta de papel que cae o se voltea | Todos | cae: `efectos/paper/paper-slap-drop-01.wav` · voltea: `efectos/paper/paper-page-flip-01.wav` · pasa página: `efectos/paper/paper-page-turn-01.wav` | Pre-roll 4 f (pico ~130 ms) | 0,4 |
| Checklist: casilla marcada | Todos | `efectos/ui/ui-checkbox-tick-01.wav` (0,1 s; más limpio que `ui-option-select-01`) | 1 f antes del tick visible | 0,45 |
| Quiz: acierto / error | Luisart y Terminal | acierto: `efectos/correct-wrong/correct-notification-01.wav` (Terminal: `correct-tone-03`) · error: `efectos/correct-wrong/wrong-buzz-02.wav` (serio: `wrong-buzzer-long-03`; cómico: `wrong-funny-low-04`) | 1 f antes del ✓ / ✗ | 0,3–0,35 |
| Precio que aparece junto a un producto | Todos | `efectos/data/data-scanner-beep-store-03.wav` · lista rítmica: `data-scanner-beep-single-04.wav` por ítem | 1 f antes de la etiqueta | 0,35 |
| Número que sube (alternativas al ticking) | Luisart / Terminal | Luisart: `efectos/counter/counter-score-casino-01.wav` · Terminal: `counter-money-machine-01.wav` · dinero en billetes: `counter-banknote-02.wav` · cifras barajándose: `counter-number-shuffle-01.wav` | Desde el primer frame del conteo; corta seco al fijarse + remate (`data-bleep-confirm-03` o `correct-tone-03`) | 0,25–0,3 |
| Captura de pantalla / foto | Todos | `efectos/camera/camera-shutter-hard-01.wav` (archivo: `camera-shutter-vintage-02`) · punch-in que "enfoca": primer ajuste de `camera-autofocus-01` | Pre-roll 1–3 f | 0,4 |
| Salto de tiempo («10 años después») | Todos | `efectos/clock/clock-knob-spin-01.wav` o `clock-tick-single-01.wav`; urgencia: cama `clock-tick-tock-close-01.wav` | Knob 1 f antes del cambio de fecha | 0,25–0,4 |
| Burbuja de chat / icono pequeño (alternativa a `pop/`) | Luisart | `efectos/bubble/bubble-soap-01.wav` · `bubble-egg-pop-02.wav` · ráfaga de iconos: `bubble-pop-soft-04.wav` | 1 f antes | 0,4 |
| Prompt que se envía / texto que se borra | Terminal | enviar: `efectos/typing/typing-mechanical-enter-01.wav` · borrar: cama `typing-backspace-run-01.wav` · chat en móvil: `typing-smartphone-01.wav` | Enter 1 f antes del envío; camas del 1.er al último carácter | 0,3–0,4 |
| Tarjeta que se desliza DENTRO de la pantalla (no es transición) | Todos | `efectos/ui/ui-swipe-soft-01.wav` · `ui-swipe-right-01.wav` · sube: `ui-swipe-up-01.wav` | 1 f antes del inicio del movimiento | 0,35–0,4 |
| Revelación con grave (en vez de whoosh) | Todos | `efectos/bass/bass-drop-01.wav` · caída de un dato: `bass-drop-deep-03.wav` · Terminal: `bass-hit-futuristic-01.wav` | Golpe inmediato: 1 f antes de la revelación | 0,35 |
| Resultado "mágico" de la IA (antes/después) | Todos | `efectos/sparkle/sparkle-touch-01.wav` | Pre-roll 11 f (pico a 370 ms) | 0,3 |

## Ganchos de atención y entradas

**Recordatorio:** whoosh = apertura del vídeo + transiciones reales. Dentro de una sección, lo que aparece suena con
clicks, teclas, pops, flaps, sellos o dings (ver mapa de arriba).

### Pre-roll de cada whoosh / swoosh (para que el pico caiga en la transición)

Evento = frame totalmente cubierto de la transición (o primer frame del plano nuevo en un corte seco).

| Archivo | Duración | Pico | Empieza antes del evento | Carácter |
|---|---|---|---|---|
| `efectos/transition/transition-air-sweep-04.wav` | 0.81 s | f7 (220 ms) | **7 f** | Barrido de aire rápido. |
| `efectos/transition/transition-pop-whoosh-01.wav` | 0.17 s | f0 (10 ms) | **0 f** | Mini whoosh con pop ligero (0,17 s), estilo explainer. |
| `efectos/transition/transition-sweep-fast-03.wav` | 0.77 s | f7 (220 ms) | **7 f** | Sweep rápido con leve tono. |
| `efectos/transition/transition-sweep-short-02.wav` | 0.41 s | f8 (260 ms) | **8 f** | Sweep corto (0,4 s). |
| `efectos/transition/transition-swipe-fast-01.wav` | 0.72 s | f6 (210 ms) | **6 f** | Swipe/barrido corto y limpio. |
| `efectos/transition/transition-swoosh-fast-02.wav` | 0.51 s | f1 (40 ms) | **1 f** | Swish rapidísimo, casi un “fft”. |
| `efectos/transition/transition-swoosh-short-01.wav` | 0.88 s | f8 (250 ms) | **8 f** | Swoosh cortito (0,3 s audible), agudo. |
| `efectos/transition/transition-tech-slide-01.wav` | 1.64 s | f2 (70 ms) | **2 f** | Deslizamiento tecnológico con textura digital. |
| `efectos/whoosh/whoosh-air-fast-04.wav` | 1.73 s | f12 (400 ms) | **12 f** | Aire rápido con algo de cuerpo. |
| `efectos/whoosh/whoosh-air-quick-03.wav` | 1.51 s | f5 (180 ms) | **5 f** | Whoosh de aire rápido y brillante. |
| `efectos/whoosh/whoosh-air-zoom-05.wav` | 1.21 s | f10 (320 ms) | **10 f** | Zoom de aire, sensación de acercamiento. |
| `efectos/whoosh/whoosh-cinematic-fast-03.wav` | 1.33 s | f31 (1040 ms) | **31 f** | Whoosh cinematográfico que crece y corta seco al final (pico al final). |
| `efectos/whoosh/whoosh-epic-07.wav` | 2.49 s | f16 (540 ms) | **16 f** | Whoosh épico con cuerpo y reverb. |
| `efectos/whoosh/whoosh-fast-01.wav` | 1.95 s | f21 (690 ms) | **21 f** | Whoosh cinematográfico rápido, medio-grave. |
| `efectos/whoosh/whoosh-fast-02.wav` | 1.76 s | f21 (690 ms) | **21 f** | Whoosh rápido clásico de transición, seco. |
| `efectos/whoosh/whoosh-heavy-01.wav` | 5.02 s | f57 (1910 ms) | **57 f** | Whoosh largo y pesado de tráiler (descenso). |
| `efectos/whoosh/whoosh-heavy-02.wav` | 6.60 s | f9 (300 ms) | **9 f** | Whoosh de túnel con mucha reverb, pesado. |
| `efectos/whoosh/whoosh-into-hit-01.wav` | 9.13 s | f78 (2600 ms) | **78 f** | Whoosh de tráiler que termina en golpe fuerte. |
| `efectos/whoosh/whoosh-into-hit-02.wav` | 3.52 s | f19 (630 ms) | **19 f** | Whoosh + impacto de presentación (logo reveal). |
| `efectos/whoosh/whoosh-into-hit-deep-03.wav` | 3.90 s | f8 (260 ms) | **8 f** | Whoosh + impacto grave profundo. |
| `efectos/whoosh/whoosh-short-realistic-09.wav` | 1.98 s | f18 (610 ms) | **18 f** | Whoosh realista, objeto que pasa cerca. |
| `efectos/whoosh/whoosh-soft-01.wav` | 0.51 s | f3 (90 ms) | **3 f** | Soplo de aire corto y limpio, sin graves (0,5 s). |
| `efectos/whoosh/whoosh-soft-02.wav` | 2.24 s | f19 (620 ms) | **19 f** | Aire que pasa, suave y redondo, cola corta. |
| `efectos/whoosh/whoosh-sub-large-08.wav` | 7.56 s | f15 (500 ms) | **15 f** | Whoosh grande con sub-grave. |
| `efectos/whoosh/whoosh-tech-scifi-01.wav` | 14.62 s | f30 (1000 ms) | **30 f** | Whoosh digital/sci-fi diseñado, con cola electrónica larga (recortar a ~2 s). |
| `efectos/whoosh/whoosh-wind-short-06.wav` | 1.39 s | f5 (150 ms) | **5 f** | Ráfaga de viento muy corta. |

Reverse / risers (misma lógica: el pico al final cae en el evento):
- `efectos/riser/riser-reverse-cymbal-01.wav`: empieza **76 f** antes del evento (2.5 s).
- `efectos/riser/riser-reverse-crash-01.wav`: empieza **79 f** antes del evento (2.6 s).
- `efectos/riser/riser-short-01.wav`: empieza **46 f** antes del evento (1.5 s).
- `efectos/riser/riser-cinematic-01.wav`: empieza **63 f** antes del evento (2.1 s).
- `efectos/riser/riser-cinematic-trailer-02.wav`: empieza **50 f** antes del evento (1.7 s).
- `efectos/riser/riser-stutter-short-03.wav`: empieza **141 f** antes del evento (4.7 s).

### Los primeros 1–2 s de un Short (elige UNA receta, no las sumes)

Todas empiezan en el frame 0; si el pre-roll no cabe, recorta el inicio del archivo (`trimBefore`).

1. **Tech / Terminal:** `efectos/glitch/glitch-break-01.wav` en f0 (vol 0,3) + la primera palabra detrás de la cabeza con
   `efectos/typing/typing-mechanical-key-single-01.wav`. Alternativa: `efectos/whoosh/whoosh-tech-scifi-01.wav` recortado a 1,5 s.
2. **Dato impactante / finanzas:** `efectos/whoosh/whoosh-into-hit-02.wav` recortado para que el golpe (f19) caiga en la
   primera palabra clave (si la palabra está en f10, usa `trimBefore=9`). O `efectos/impact/impact-sub-boom-01.wav` en la cifra.
3. **Alarma / pérdida / “cuidado”:** `efectos/impact/impact-braam-01.wav` con `trimBefore=14` para que el braam suene
   en f0, bajo el primer dato rojo (SLA-doc-emphasis-red / SLA-term-ticker-loss).
4. **Giro inesperado / mito:** `efectos/reaction/reaction-record-scratch-01.wav` justo cuando se niega el mito.
5. **Documental largo:** `efectos/whoosh/whoosh-heavy-01.wav` o `efectos/whoosh/whoosh-into-hit-deep-03.wav` con el golpe en el
   primer título; luego silencio breve (6–10 f) antes de la voz.
6. **Pregunta directa al espectador:** `efectos/notification/notification-ping-01.wav` en la aparición de la pregunta (efecto
   “notificación”), vol 0,3.

Después del gancho: el siguiente sonido fuerte no antes de ~3 s. En Shorts, el primer cambio de escena real (p. ej.
entrada a la pizarra) lleva whoosh; todo lo demás son clicks/teclas/pops.

### Sonidos de atención (no-whoosh) para usar a lo largo del vídeo

- **Revelación:** braam (`efectos/impact/impact-braam-01.wav`), riser→impacto (`efectos/riser/riser-short-01.wav` →
  `efectos/impact/impact-cinematic-boom-01.wav`), sub drop (`efectos/impact/impact-sub-drop-01.wav`, `efectos/impact/impact-sub-boom-01.wav`).
- **Stabs digitales:** `efectos/glitch/glitch-quick-01.wav`, `efectos/glitch/glitch-break-01.wav`.
- **Palabra clave:** `efectos/notification/notification-ding-keyword-01.wav` / `efectos/notification/notification-bell-ding-01.wav`.
- **Aparición brillante:** `efectos/notification/notification-ping-01.wav`, pops (`efectos/pop/`).
- **Momento foto:** `efectos/film/film-camera-shutter-01.wav`, `efectos/film/film-camera-flash-01.wav`.
- **Giro:** `efectos/reaction/reaction-record-scratch-01.wav`.

## Catálogo completo por categoría

Columnas: archivo · duración · pico · cómo suena · cuándo usarlo · dónde exactamente · volumen · estilo · combina con.

### Whooshes (SOLO apertura del vídeo y transiciones reales) — `efectos/whoosh/` (18)

| Archivo | Dur. | Pico | Suena | Cuándo | Dónde | Vol | Estilo | Combina con |
|---|---|---|---|---|---|---|---|---|
| `whoosh-air-fast-04.wav` | 1.73 s | f12 | Aire rápido con algo de cuerpo. | Transición de sección en vídeo largo; entrada a la pizarra. | Empieza **12 f** antes del evento (pico a 400 ms). | 0.35 (-9 dB) | Ambos | escena pizarra (entrada), SLA-doc-transition-wipe |
| `whoosh-air-quick-03.wav` | 1.51 s | f5 | Whoosh de aire rápido y brillante. | Transición rápida entre secciones en Shorts. | Empieza **5 f** antes del evento (pico a 180 ms). | 0.35 (-9 dB) | Ambos | SLA-term-transition-scan, SLA-doc-transition-wipe-v |
| `whoosh-air-zoom-05.wav` | 1.21 s | f10 | Zoom de aire, sensación de acercamiento. | Transición real con zoom-in de cámara entre escenas (NO en un punch-in dentro de la misma toma). | Empieza **10 f** antes del evento (pico a 320 ms). | 0.35 (-9 dB) | Ambos | punch-in de cámara, SLA-term-transition-scan |
| `whoosh-cinematic-fast-03.wav` | 1.33 s | f31 | Whoosh cinematográfico que crece y corta seco al final (pico al final). | Transición que “aterriza” en un título de capítulo. | Empieza **31 f** antes del evento (pico a 1040 ms). | 0.4 (-8 dB) | Documental | SLA-doc-part-title-*, SLA-doc-transition-flash |
| `whoosh-epic-07.wav` | 2.49 s | f16 | Whoosh épico con cuerpo y reverb. | Apertura del vídeo (primer frame del hook) o salto a la sección clave. | Empieza **16 f** antes del evento (pico a 540 ms). | 0.4 (-8 dB) | Ambos | intro GridIntro, SLA-doc-transition-flash |
| `whoosh-fast-01.wav` | 1.95 s | f21 | Whoosh cinematográfico rápido, medio-grave. | Transición entre partes (capítulos) del documental. | Empieza **21 f** antes del evento (pico a 690 ms). | 0.4 (-8 dB) | Documental | SLA-doc-transition-wipe, SLA-doc-transition-wipe-amber |
| `whoosh-fast-02.wav` | 1.76 s | f21 | Whoosh rápido clásico de transición, seco. | Transición entre secciones; también primer corte del hook. | Empieza **21 f** antes del evento (pico a 690 ms). | 0.4 (-8 dB) | Ambos | SLA-term-transition-scan, SLA-doc-transition-wipe |
| `whoosh-heavy-01.wav` | 5.02 s | f57 | Whoosh largo y pesado de tráiler (descenso). | Apertura cinematográfica del vídeo largo; entrada a la “parte final”. | Empieza **57 f** antes del evento (pico a 1910 ms). | 0.4 (-8 dB) | Documental | SLA-doc-part-title-two-line, SLA-doc-transition-flash |
| `whoosh-heavy-02.wav` | 6.60 s | f9 | Whoosh de túnel con mucha reverb, pesado. | Transición dramática (antes/después, caída de una empresa). | Empieza **9 f** antes del evento (pico a 300 ms). | 0.35 (-9 dB) | Documental | SLA-doc-transition-wipe, SLA-doc-big-number-drop |
| `whoosh-into-hit-01.wav` | 9.13 s | f78 | Whoosh de tráiler que termina en golpe fuerte. | Primer 1–2 s de un Short/vídeo: whoosh→golpe justo en la primera palabra clave o título. | Empieza **78 f** antes del evento (pico a 2600 ms). | 0.35 (-9 dB) | Documental | hook, SLA-doc-part-title-*, SLA-doc-big-number-* |
| `whoosh-into-hit-02.wav` | 3.52 s | f19 | Whoosh + impacto de presentación (logo reveal). | Aparición del logo/título del vídeo en la apertura. | Empieza **19 f** antes del evento (pico a 630 ms). | 0.35 (-9 dB) | Ambos | intro GridIntro (handle), SLA-term-title-center |
| `whoosh-into-hit-deep-03.wav` | 3.90 s | f8 | Whoosh + impacto grave profundo. | Apertura seria (documental) o revelación de la tesis del vídeo. | Empieza **8 f** antes del evento (pico a 260 ms). | 0.35 (-9 dB) | Documental | SLA-doc-part-title-two-line, SLA-doc-emphasis-red |
| `whoosh-short-realistic-09.wav` | 1.98 s | f18 | Whoosh realista, objeto que pasa cerca. | Transición natural entre escenas de B-roll. | Empieza **18 f** antes del evento (pico a 610 ms). | 0.35 (-9 dB) | Documental | cortes de B-roll, SLA-doc-transition-wipe |
| `whoosh-soft-01.wav` | 0.51 s | f3 | Soplo de aire corto y limpio, sin graves (0,5 s). | Transición suave entre dos bloques del mismo tema; cambio de plano A-roll → B-roll dentro de una sección. | Empieza **3 f** antes del evento (pico a 90 ms). | 0.35 (-9 dB) | Ambos | SLA-doc-transition-wipe, cortes simples |
| `whoosh-soft-02.wav` | 2.24 s | f19 | Aire que pasa, suave y redondo, cola corta. | Transición tranquila en vídeos largos (calma/historia); entrada a una cita. | Empieza **19 f** antes del evento (pico a 620 ms). | 0.3 (-10 dB) | Documental | SLA-doc-transition-wipe, SLA-doc-quote-* |
| `whoosh-sub-large-08.wav` | 7.56 s | f15 | Whoosh grande con sub-grave. | Transición de capítulo en vídeo largo; entrada del título de parte. | Empieza **15 f** antes del evento (pico a 500 ms). | 0.35 (-9 dB) | Documental | SLA-doc-part-title-*, SLA-term-transition-scan-chapter |
| `whoosh-tech-scifi-01.wav` | 14.62 s | f30 | Whoosh digital/sci-fi diseñado, con cola electrónica larga (recortar a ~2 s). | Apertura de vídeos de IA/tech; transición hacia una sección técnica. | Inicia ~40 f antes del frame totalmente cubierto del scan; recorta a 2–2,5 s con fade-out de 8 f. | 0.3 (-10 dB) | Terminal | SLA-term-transition-scan, SLA-term-transition-scan-chapter |
| `whoosh-wind-short-06.wav` | 1.39 s | f5 | Ráfaga de viento muy corta. | Cambio de escena rápido en Shorts; salida de la pizarra. | Empieza **5 f** antes del evento (pico a 150 ms). | 0.35 (-9 dB) | Ambos | escena pizarra (salida), SLA-term-transition-scan-v |

### Swooshes / swipes de transición — `efectos/transition/` (8)

| Archivo | Dur. | Pico | Suena | Cuándo | Dónde | Vol | Estilo | Combina con |
|---|---|---|---|---|---|---|---|---|
| `transition-air-sweep-04.wav` | 0.81 s | f7 | Barrido de aire rápido. | Wipe del documental (panel carbón). | Empieza **7 f** antes del evento (pico a 220 ms). | 0.3 (-10 dB) | Documental | SLA-doc-transition-wipe |
| `transition-pop-whoosh-01.wav` | 0.17 s | f0 | Mini whoosh con pop ligero (0,17 s), estilo explainer. | Solo transiciones reales entre escenas (NO en cambios de viñeta/tarjeta ni en cada elemento). | Empieza 1 f antes del evento (golpe inmediato). | 0.3 (-10 dB) | Terminal | escena pizarra: paso de una tarjeta a otra |
| `transition-sweep-fast-03.wav` | 0.77 s | f7 | Sweep rápido con leve tono. | Transición de sección en Terminal. | Empieza **7 f** antes del evento (pico a 220 ms). | 0.3 (-10 dB) | Terminal | SLA-term-transition-scan |
| `transition-sweep-short-02.wav` | 0.41 s | f8 | Sweep corto (0,4 s). | Transición mínima entre dos escenas (no entre gráficos de la misma escena). | Empieza **8 f** antes del evento (pico a 260 ms). | 0.3 (-10 dB) | Ambos | SLA-term-transition-scan (versión suave) |
| `transition-swipe-fast-01.wav` | 0.72 s | f6 | Swipe/barrido corto y limpio. | Swipe lateral de pantalla completa entre escenas (no cambio de gráfico dentro de la pizarra). | Empieza **6 f** antes del evento (pico a 210 ms). | 0.3 (-10 dB) | Ambos | SLA-doc-transition-wipe-amber, escena pizarra |
| `transition-swoosh-fast-02.wav` | 0.51 s | f1 | Swish rapidísimo, casi un “fft”. | Transiciones reales de Shorts muy rápidas (no cambios de tarjeta/página). | Empieza 1 f antes del evento (golpe inmediato). | 0.3 (-10 dB) | Ambos | cambio de tarjeta en la pizarra, wipes |
| `transition-swoosh-short-01.wav` | 0.88 s | f8 | Swoosh cortito (0,3 s audible), agudo. | Wipe o barrido de pantalla corto entre escenas (no cambio de página en la pizarra). | Empieza **8 f** antes del evento (pico a 250 ms). | 0.3 (-10 dB) | Ambos | SLA-doc-transition-wipe, SLA-term-transition-scan-v |
| `transition-tech-slide-01.wav` | 1.64 s | f2 | Deslizamiento tecnológico con textura digital. | Scan de transición Terminal (el sonido “oficial” del scan). | Inicia 2 f antes del primer frame del barrido; dura bajo todo el scan. | 0.35 (-9 dB) | Terminal | SLA-term-transition-scan, SLA-term-transition-scan-chapter |

### Risers y reversos (el pico cae en la revelación) — `efectos/riser/` (7)

| Archivo | Dur. | Pico | Suena | Cuándo | Dónde | Vol | Estilo | Combina con |
|---|---|---|---|---|---|---|---|---|
| `riser-cinematic-01.wav` | 3.73 s | f63 | Riser cinematográfico con cola de boom (pico a 2,7 s). | Antes del título de capítulo o de la gran revelación del documental. | Empieza **63 f** antes del evento (pico a 2090 ms). | 0.25 (-12 dB) | Documental | SLA-doc-part-title-*, SLA-doc-big-number-money |
| `riser-cinematic-trailer-02.wav` | 1.90 s | f50 | Riser de tráiler, corta seco en el pico (1,9 s). | Justo antes de un corte duro a un dato o a la tesis. | Empieza **50 f** antes del evento (pico a 1670 ms). | 0.25 (-12 dB) | Documental | SLA-doc-transition-flash, SLA-doc-emphasis-* |
| `riser-reverse-crash-01.wav` | 2.77 s | f79 | Crash invertido corto (2,7 s). | Igual que el anterior pero más brillante; útil en Shorts. | Empieza **79 f** antes del evento (pico a 2620 ms). | 0.25 (-12 dB) | Ambos | SLA-doc-transition-flash, cortes a cámara |
| `riser-reverse-cymbal-01.wav` | 2.97 s | f76 | Platillo invertido (2,9 s) que “absorbe” hacia el golpe. | Entrar a un corte o a un golpe; clásico antes del drop. | Empieza **76 f** antes del evento (pico a 2540 ms). | 0.25 (-12 dB) | Ambos | SLA-doc-transition-flash, impact-* |
| `riser-reverse-impact-01.wav` | 9.97 s | f0 | Impacto de tráiler con cola larga descendente (el golpe está al inicio). | Golpe grande + cola para cerrar una sección dramática. | Colocar el frame 0 en el evento (el golpe está al principio); recortar a 3–4 s con fade. | 0.3 (-10 dB) | Documental | SLA-doc-big-number-drop, SLA-doc-emphasis-red |
| `riser-short-01.wav` | 5.02 s | f46 | Subida corta y tensa (~1,8 s hasta el pico). | Antes de revelar un número o dato clave. | Empieza **46 f** antes del evento (pico a 1540 ms). | 0.25 (-12 dB) | Ambos | SLA-doc-big-number-*, SLA-term-keyword-stat |
| `riser-stutter-short-03.wav` | 6.37 s | f141 | Riser espacial con tartamudeo digital (6 s, pico al final). | Build-up largo antes de una revelación tech; recortar desde el inicio si se quiere más corto. | Empieza **141 f** antes del evento (pico a 4710 ms). | 0.2 (-14 dB) | Terminal | SLA-term-beams-*, SLA-term-keyword-stat |

### Impactos, braams y sub drops — `efectos/impact/` (8)

| Archivo | Dur. | Pico | Suena | Cuándo | Dónde | Vol | Estilo | Combina con |
|---|---|---|---|---|---|---|---|---|
| `impact-bass-hit-short-01.wav` | 1.04 s | f0 | Golpe de bajo corto y seco. | Palabra clave de peso, entrada de una barra de énfasis. | Empieza 1 f antes del evento (golpe inmediato). | 0.3 (-10 dB) | Ambos | SLA-doc-emphasis-*, SLA-term-keyword-single |
| `impact-braam-01.wav` | 8.63 s | f14 | BRAAM tonal oscuro (estilo Inception). | Dato alarmante, caída de mercado, “esto cambia todo”. | Empieza **14 f** antes del evento (pico a 480 ms). | 0.3 (-10 dB) | Documental | SLA-doc-big-number-drop, SLA-doc-emphasis-red, SLA-term-ticker-loss |
| `impact-cinematic-big-02.wav` | 7.51 s | f53 | Impacto grande con cola larga (pico a 1,75 s). | Momento climático del vídeo largo (una vez por vídeo). | Empieza **53 f** antes del evento (pico a 1750 ms). | 0.3 (-10 dB) | Documental | SLA-doc-big-number-money, SLA-doc-part-title-two-line |
| `impact-cinematic-boom-01.wav` | 2.00 s | f3 | Boom cinematográfico corto. | Revelación de un número grande o título. | Empieza **3 f** antes del evento (pico a 90 ms). | 0.3 (-10 dB) | Documental | SLA-doc-big-number-*, SLA-doc-part-title-* |
| `impact-sub-boom-01.wav` | 3.73 s | f4 | Boom de sub-grave (se siente más que se oye). | Refuerzo bajo un golpe o título; revelación en Shorts. | Empieza **4 f** antes del evento (pico a 130 ms). | 0.35 (-9 dB) | Ambos | SLA-doc-big-number-*, SLA-term-keyword-stat |
| `impact-sub-drop-01.wav` | 7.30 s | f27 | Sub drop profundo (caída de tono). | Después de un riser, cuando entra el dato; o al empezar el beat. | Empieza **27 f** antes del evento (pico a 900 ms). | 0.35 (-9 dB) | Ambos | SLA-doc-big-number-drop, SLA-term-chart-down |
| `impact-thud-01.wav` | 2.78 s | f1 | Golpe sordo (thud) con cola suave. | Sello que cae, tarjeta pesada que aterriza, “pum” de conclusión. | Empieza 1 f antes del evento (golpe inmediato). | 0.35 (-9 dB) | Ambos | SLA-doc-stamp-*, conclusión de la pizarra |
| `impact-trailer-epic-03.wav` | 4.86 s | f28 | Impacto épico de tráiler. | Título de apertura, primer frame del gancho documental. | Empieza **28 f** antes del evento (pico a 920 ms). | 0.3 (-10 dB) | Documental | SLA-doc-part-title-*, hook |

### Clicks y taps de interfaz (sonido por defecto para elementos que aparecen) — `efectos/ui/` (12)

| Archivo | Dur. | Pico | Suena | Cuándo | Dónde | Vol | Estilo | Combina con |
|---|---|---|---|---|---|---|---|---|
| `ui-click-classic-02.wav` | 0.19 s | f1 | Click clásico, seco (80 ms). | Texto que aparece de golpe, bloque de texto. | Empieza 1 f antes del evento (golpe inmediato). | 0.35 (-9 dB) | Ambos | bloques de texto, SLA-doc-quote-* |
| `ui-click-device-04.wav` | 1.05 s | f0 | Click de dispositivo, plástico. | Botón en pantalla, “play”, subtítulo que aparece. | Empieza 1 f antes del evento (golpe inmediato). | 0.3 (-10 dB) | Ambos | captions por bloques |
| `ui-click-digital-01.wav` | 0.86 s | f0 | Click digital tipo HUD. | Chip/tag que aparece en Terminal. | Empieza 1 f antes del evento (golpe inmediato). | 0.3 (-10 dB) | Terminal | SLA-term-callout-box, tags |
| `ui-click-key-01.wav` | 1.01 s | f0 | Click de tecla suelto. | Palabra que aparece detrás de la cabeza (una tecla por palabra). | Empieza 1 f antes del evento (golpe inmediato). | 0.35 (-9 dB) | Terminal | palabra cinética detrás de la cabeza |
| `ui-click-mouse-01.wav` | 0.32 s | f0 | Click de ratón (el más popular de Pixabay). | Cursor que hace click; aparición de una tarjeta. | Empieza 1 f antes del evento (golpe inmediato). | 0.35 (-9 dB) | Ambos | tarjetas, SearchPill, YouTubeCard |
| `ui-click-mouse-02.wav` | 0.49 s | f0 | Click de ratón más suave. | Aparición de chips secundarios. | Empieza 1 f antes del evento (golpe inmediato). | 0.3 (-10 dB) | Ambos | chips, captions por bloques |
| `ui-click-mouse-double-03.wav` | 1.04 s | f0 | Doble click de ratón. | Abrir algo, “entrar” en una app o archivo. | Empieza 1 f antes del evento (golpe inmediato). | 0.3 (-10 dB) | Ambos | YouTubeCard, capturas de pantalla |
| `ui-click-select-01.wav` | 1.10 s | f0 | Click de selección limpio. | Seleccionar una opción, aparición de un chip. | Empieza 1 f antes del evento (golpe inmediato). | 0.3 (-10 dB) | Terminal | SLA-term-compare-*, chips |
| `ui-click-tone-01.wav` | 0.20 s | f0 | Click con tono agradable, muy corto (40 ms). | Tarjeta/chip que aterriza; ítem de lista. | Empieza 1 f antes del evento (golpe inmediato). | 0.35 (-9 dB) | Terminal | tarjetas de la pizarra, SLA-term-checklist-* |
| `ui-option-select-01.wav` | 1.45 s | f0 | Tono de interfaz “opción elegida”. | Paso completado en una checklist. | Empieza 1 f antes del evento (golpe inmediato). | 0.3 (-10 dB) | Terminal | SLA-term-checklist-3-steps / -5-steps |
| `ui-tech-select-01.wav` | 0.50 s | f0 | Selección tecnológica corta y brillante. | Etiqueta [01] o tag mono que aparece. | Empieza 1 f antes del evento (golpe inmediato). | 0.3 (-10 dB) | Terminal | tags mono, SLA-term-keyword-* |
| `ui-zoom-out-01.wav` | 1.04 s | f5 | UI zoom-out digital. | Gráfico que se aleja o panel que se encoge al salir. | Empieza **5 f** antes del evento (pico a 180 ms). | 0.3 (-10 dB) | Terminal | salida de paneles Terminal |

### Teclado mecánico, teclas y máquina de escribir — `efectos/typing/` (13)

| Archivo | Dur. | Pico | Suena | Cuándo | Dónde | Vol | Estilo | Combina con |
|---|---|---|---|---|---|---|---|---|
| `typing-asmr-soft-01.wav` | 7.84 s | f74 | Tecleo suave estilo ASMR. | Escena tranquila de alguien escribiendo; fondo bajo voz. | Como cama bajo el plano; fade in/out 8 f. | 0.15 (-16 dB) | Ambos | B-roll de ordenador |
| `typing-key-hard-single-03.wav` | 0.20 s | f0 | Tecla dura, seca (70 ms). | Última tecla (Enter) al terminar de escribir. | Empieza 1 f antes del evento (golpe inmediato). | 0.35 (-9 dB) | Terminal | fin del type line, SLA-term-title-* |
| `typing-key-presses-short-02.wav` | 1.61 s | f0 | 3–4 teclas seguidas (1,6 s). | Palabra corta tecleada (≈4–8 letras). | Empieza 1 f antes del evento (golpe inmediato). | 0.3 (-10 dB) | Terminal | SLA-term-keyword-single, comando $ |
| `typing-key-single-02.wav` | 1.21 s | f0 | Una tecla de portátil, suave. | Alternar con la anterior para que no suene repetido. | Empieza 1 f antes del evento (golpe inmediato). | 0.3 (-10 dB) | Terminal | decrypt/type line |
| `typing-keyboard-01.wav` | 26.29 s | f421 | Tecleo de oficina continuo (26 s). | Cama larga bajo B-roll de oficina; recortar. | Como cama; fade in/out 10 f. | 0.15 (-16 dB) | Ambos | B-roll |
| `typing-keyboard-fast-01.wav` | 25.33 s | f342 | Tecleo rápido continuo (25 s). | Montaje de “trabajo intenso”; recortar. | Como cama; fade in/out 10 f. | 0.15 (-16 dB) | Ambos | montajes |
| `typing-mechanical-fast-02.wav` | 8.01 s | f38 | Tecleo mecánico rápido (8 s). | Decrypt rápido o texto que “se escribe solo”. | Desde el primer carácter hasta el último; fade-out 4 f. | 0.25 (-12 dB) | Terminal | decrypt text, SLA-term-checklist-* |
| `typing-mechanical-key-single-01.wav` | 1.30 s | f0 | Una tecla mecánica (130 ms). | Cada letra/palabra de un texto tecleado corto; palabra cinética. | Empieza 1 f antes del evento (golpe inmediato). | 0.3 (-10 dB) | Terminal | decrypt, palabra detrás de la cabeza, SLA-term-lower-third-* |
| `typing-mechanical-run-01.wav` | 8.02 s | f8 | Tecleo mecánico continuo HD (8 s). | Texto largo tecleado; recortar a la duración del tecleo. | Desde el primer carácter visible hasta el último; fade-out 4 f. | 0.25 (-12 dB) | Terminal | SLA-term-title-*, SLA-term-lower-third-*, SearchPill |
| `typing-mechanical-short-01.wav` | 2.40 s | f5 | Ráfaga corta de teclado mecánico (2,4 s). | Título o comando corto que se teclea. | Empieza **5 f** antes del evento (pico a 160 ms). | 0.3 (-10 dB) | Terminal | SLA-term-title-left (command), SearchPill |
| `typing-single-key-01.wav` | 0.15 s | f0 | Tecla de portátil muy corta. | Relleno entre teclas en ráfagas. | Empieza 1 f antes del evento (golpe inmediato). | 0.3 (-10 dB) | Terminal | decrypt |
| `typing-typewriter-01.wav` | 24.37 s | f12 | Máquina de escribir antigua (24 s). | Texto que se escribe en estilo Documental (fechas, lugares). | Desde el primer carácter hasta el último; recortar. | 0.25 (-12 dB) | Documental | SLA-doc-stamp-place-year, SLA-doc-stamp-date, SLA-doc-stamp-chapter |
| `typing-typewriter-bell-01.wav` | 1.66 s | f1 | Campanita + retorno de máquina de escribir. | Final de un sello tecleado o de una cita. | Empieza 1 f antes del evento (golpe inmediato). | 0.3 (-10 dB) | Documental | fin de SLA-doc-stamp-*, SLA-doc-quote-* |

### Pops — `efectos/pop/` (6)

| Archivo | Dur. | Pico | Suena | Cuándo | Dónde | Vol | Estilo | Combina con |
|---|---|---|---|---|---|---|---|---|
| `pop-bubble-01.wav` | 0.94 s | f0 | Pop de burbuja. | Burbuja de comentario/chat que aparece. | Empieza 1 f antes del evento (golpe inmediato). | 0.35 (-9 dB) | Ambos | burbujas, notificaciones en pantalla |
| `pop-bubble-alert-02.wav` | 0.37 s | f1 | Pop de alerta con tono. | Aparición de una notificación falsa en pantalla. | Empieza 1 f antes del evento (golpe inmediato). | 0.3 (-10 dB) | Ambos | mockups de notificación |
| `pop-dry-03.wav` | 0.28 s | f0 | Pop seco de alerta. | Chip de dato secundario. | Empieza 1 f antes del evento (golpe inmediato). | 0.3 (-10 dB) | Ambos | chips, captions |
| `pop-minimal-01.wav` | 1.47 s | f0 | Pop mínimo y limpio. | Punto de línea de tiempo, marcador en un gráfico. | Empieza 1 f antes del evento (golpe inmediato). | 0.3 (-10 dB) | Ambos | SLA-doc-timeline-*, marcadores buy/sell de SLA-term-chart-* |
| `pop-sharp-01.wav` | 0.99 s | f0 | Pop agudo muy corto. | Palabra resaltada en subtítulos. | Empieza 1 f antes del evento (golpe inmediato). | 0.3 (-10 dB) | Ambos | SLA-doc-captions-highlight-* |
| `pop-soft-01.wav` | 0.53 s | f0 | Pop suave, redondo (el más popular). | Tag pequeño, emoji, icono que aparece. | Empieza 1 f antes del evento (golpe inmediato). | 0.35 (-9 dB) | Ambos | tags, iconos, LessonCard |

### Notificaciones y dings — `efectos/notification/` (5)

| Archivo | Dur. | Pico | Suena | Cuándo | Dónde | Vol | Estilo | Combina con |
|---|---|---|---|---|---|---|---|---|
| `notification-bell-ding-01.wav` | 1.52 s | f0 | Ding de campana de atención. | Punto clave / lección (“apunta esto”). | Empieza 1 f antes del evento (golpe inmediato). | 0.3 (-10 dB) | Ambos | LessonCard, SLA-term-callout-* |
| `notification-ding-keyword-01.wav` | 2.68 s | f1 | “Ding” de campana clásico. | Palabra clave o idea importante (máx. 1–2 por vídeo); resultado correcto. | Empieza 1 f antes del evento (golpe inmediato). | 0.3 (-10 dB) | Ambos | SLA-doc-captions-highlight-*, SLA-term-keyword-* |
| `notification-message-pop-01.wav` | 1.01 s | f0 | Pop de mensaje muy corto. | Mensaje de chat que entra. | Empieza 1 f antes del evento (golpe inmediato). | 0.35 (-9 dB) | Ambos | burbujas de chat |
| `notification-ping-01.wav` | 2.37 s | f0 | Notificación moderna tipo app (Pixabay trending). | Mensaje/alerta que llega; “te llega un aviso”. | Empieza 1 f antes del evento (golpe inmediato). | 0.3 (-10 dB) | Ambos | mockups de móvil, alertas |
| `notification-pop-hard-01.wav` | 1.17 s | f0 | Pop-click duro. | Aparición de un icono con fuerza. | Empieza 1 f antes del evento (golpe inmediato). | 0.3 (-10 dB) | Ambos | iconos, logos individuales |

### Glitch / digital — `efectos/glitch/` (4)

| Archivo | Dur. | Pico | Suena | Cuándo | Dónde | Vol | Estilo | Combina con |
|---|---|---|---|---|---|---|---|---|
| `glitch-break-01.wav` | 1.07 s | f0 | Rotura digital seca al inicio. | Stab de atención en los primeros frames de un Short tech. | Empieza 1 f antes del evento (golpe inmediato). | 0.3 (-10 dB) | Terminal | hook, SLA-term-title-center |
| `glitch-digital-01.wav` | 2.85 s | f0 | Glitch HD con estática (Pixabay trending). | Error de IA, “alucinación”, algo que falla. | Empieza 1 f antes del evento (golpe inmediato). | 0.25 (-12 dB) | Terminal | SLA-term-callout-box (error), SLA-doc-emphasis-red |
| `glitch-quick-01.wav` | 1.76 s | f30 | Glitch digital rápido. | Palabra o gráfico que “se corrompe”; corte glitch entre planos. | Empieza **30 f** antes del evento (pico a 990 ms). | 0.3 (-10 dB) | Terminal | decrypt, SLA-term-keyword-* |
| `glitch-text-intro-01.wav` | 4.57 s | f18 | Glitch de intro de texto (textura larga). | Título tech que aparece con glitch. | Empieza **18 f** antes del evento (pico a 610 ms). | 0.25 (-12 dB) | Terminal | SLA-term-title-*, SLA-term-transition-scan-chapter |

### Datos, bleeps, carga y escáner — `efectos/data/` (5)

| Archivo | Dur. | Pico | Suena | Cuándo | Dónde | Vol | Estilo | Combina con |
|---|---|---|---|---|---|---|---|---|
| `data-bleep-01.wav` | 0.59 s | f1 | Bleep high-tech corto. | Valor que se actualiza, dato que aparece en Terminal. | Empieza 1 f antes del evento (golpe inmediato). | 0.3 (-10 dB) | Terminal | SLA-term-keyword-stat, readouts |
| `data-computer-processing-01.wav` | 9.45 s | f10 | Procesamiento de ordenador (9 s). | IA “pensando”; cama bajo una animación de cálculo; recortar. | Como cama bajo el proceso; fade 6 f. | 0.2 (-14 dB) | Terminal | SLA-term-checklist-*, SLA-term-beams-* |
| `data-loading-system-01.wav` | 2.62 s | f0 | Carga de sistema sci-fi. | Panel Terminal que “arranca”; logos conectándose. | Inicia en el primer frame del panel; pico cuando el panel queda completo. | 0.25 (-12 dB) | Terminal | SLA-term-beams-*, SLA-term-compare-* |
| `data-scanner-sweep-01.wav` | 10.73 s | f45 | Escáner sci-fi (barrido con pulso). | Bajo toda una transición scan o un callout que analiza una zona. | Bajo todo el barrido; recortar a su duración. | 0.2 (-14 dB) | Terminal | SLA-term-transition-scan, SLA-term-callout-box |
| `data-ui-progress-01.wav` | 11.97 s | f80 | Secuencia UI de progreso de datos (12 s). | Barra de progreso, gráfico que se dibuja; recortar. | Desde el inicio del dibujado hasta el final; fade 6 f. | 0.2 (-14 dB) | Terminal | SLA-term-chart-up / -down, barra de progreso de la checklist |

### Ticker / split-flap / teletipo — `efectos/ticker/` (2)

| Archivo | Dur. | Pico | Suena | Cuándo | Dónde | Vol | Estilo | Combina con |
|---|---|---|---|---|---|---|---|---|
| `ticker-split-flap-01.wav` | 123.47 s | f288 | Panel split-flap real (aeropuerto/estación), 2 min. | Tiles del ticker girando; recortar al tiempo de giro. | Desde el primer frame que giran los tiles hasta que se detienen; fade-out 3 f. | 0.3 (-10 dB) | Terminal | SLA-term-ticker-gain / -loss / -watchlist |
| `ticker-teletype-01.wav` | 22.78 s | f17 | Teletipo / impresora de margarita. | Datos que se imprimen, noticias financieras llegando. | Bajo la aparición de filas de datos; recortar. | 0.2 (-14 dB) | Ambos | SLA-term-ticker-watchlist, titulares |

### Dinero — `efectos/money/` (4)

| Archivo | Dur. | Pico | Suena | Cuándo | Dónde | Vol | Estilo | Combina con |
|---|---|---|---|---|---|---|---|---|
| `money-bag-drop-01.wav` | 1.12 s | f0 | Bolsa de dinero que cae. | Gran suma que “aterriza”, inversión grande. | Empieza 1 f antes del evento (golpe inmediato). | 0.3 (-10 dB) | Ambos | SLA-doc-big-number-money |
| `money-cash-register-ding-02.wav` | 2.04 s | f12 | Caja registradora que se abre con “ding”. | Precio o cobro; variante más suave del ka-ching. | Empieza **12 f** antes del evento (pico a 410 ms). | 0.3 (-10 dB) | Ambos | SLA-term-ticker-gain, precios en tarjetas |
| `money-cash-register-kaching-01.wav` | 2.67 s | f5 | Caja registradora “ka-ching” (compra). | Ganancia, precio, “esto te ahorra dinero” (máx. 1 por vídeo). | Empieza **5 f** antes del evento (pico a 150 ms). | 0.3 (-10 dB) | Ambos | SLA-doc-big-number-money, SLA-term-ticker-gain |
| `money-coins-clink-01.wav` | 1.00 s | f2 | Monedas tintineando. | Cifra pequeña de dinero, dividendos, ahorro. | Empieza **2 f** antes del evento (pico a 50 ms). | 0.3 (-10 dB) | Ambos | SLA-term-keyword-stat, StatCallout |

### Film, cámara y texturas — `efectos/film/` (7)

| Archivo | Dur. | Pico | Suena | Cuándo | Dónde | Vol | Estilo | Combina con |
|---|---|---|---|---|---|---|---|---|
| `film-burn-01.wav` | 3.83 s | f2 | Film burn (quemado de película). | Transición de archivo con quemado de película. | Empieza **2 f** antes del evento (pico a 80 ms). | 0.25 (-12 dB) | Documental | transiciones con film burn, SLA-doc-transition-flash |
| `film-camera-digital-shutter-02.wav` | 1.51 s | f9 | Obturador digital. | Screenshot en Terminal. | Empieza **9 f** antes del evento (pico a 300 ms). | 0.35 (-9 dB) | Terminal | capturas de pantalla |
| `film-camera-flash-01.wav` | 1.98 s | f2 | Flash de cámara (disparo + carga). | Flash blanco de transición documental; foto de archivo. | Empieza **2 f** antes del evento (pico a 60 ms). | 0.35 (-9 dB) | Documental | SLA-doc-transition-flash |
| `film-camera-shutter-01.wav` | 0.21 s | f1 | Obturador de cámara clásico (90 ms). | Foto/captura que aparece congelada; freeze frame. | Empieza 1 f antes del evento (golpe inmediato). | 0.35 (-9 dB) | Ambos | capturas, freeze frames, SLA-doc-stamp-* |
| `film-projector-01.wav` | 8.36 s | f229 | Proyector de cine antiguo en marcha. | Material de archivo / “flashback” histórico; cama corta. | Como cama bajo el archivo; fade 10 f. | 0.15 (-16 dB) | Documental | B-roll de archivo con grano |
| `film-room-tone-01.wav` | 119.84 s | f80 | Room tone (ambiente de sala) 2 min. | Rellenar silencios de cortes de voz para que no “caiga” el audio. | Bajo toda la pista de voz si hay cortes audibles. | 0.08 (-22 dB) | Ambos | cortes de A-roll |
| `film-vinyl-crackle-01.wav` | 9.71 s | f10 | Crepitar de vinilo / polvo. | Textura bajo material antiguo o cita histórica. | Como cama; fade 10 f; muy bajo. | 0.1 (-20 dB) | Documental | SLA-doc-quote-*, archivo |

### Tensión, reloj y latidos — `efectos/tension/` (4)

| Archivo | Dur. | Pico | Suena | Cuándo | Dónde | Vol | Estilo | Combina con |
|---|---|---|---|---|---|---|---|---|
| `tension-heartbeat-fast-01.wav` | 9.87 s | f8 | Latidos rápidos (10 s). | Tensión antes de revelar un riesgo/pérdida. | Como cama los 2–4 s previos; fade out en la revelación. | 0.2 (-14 dB) | Documental | SLA-doc-big-number-drop |
| `tension-heartbeat-impact-01.wav` | 3.47 s | f2 | Un latido-impacto profundo. | Pausa dramática, silencio antes del dato. | Empieza **2 f** antes del evento (pico a 70 ms). | 0.3 (-10 dB) | Documental | SLA-doc-emphasis-*, SLA-doc-big-number-* |
| `tension-tick-tock-01.wav` | 16.84 s | f30 | Tic-tac de reloj (17 s). | Cuenta atrás, urgencia, “tienes poco tiempo”; recortar. | Como cama bajo la parte urgente; fade 8 f. | 0.2 (-14 dB) | Ambos | cuentas atrás, SLA-doc-timeline-* |
| `tension-ticking-counter-01.wav` | 9.84 s | f1 | Contador eléctrico tic-tic rápido. | Número contando (count-up) en Terminal. | Desde el inicio del conteo hasta que el número se detiene; cortar seco. | 0.2 (-14 dB) | Terminal | SLA-term-keyword-stat, StatCallout, SLA-doc-big-number-* |

### Reacciones (error, acierto, scratch, risas) — `efectos/reaction/` (5)

| Archivo | Dur. | Pico | Suena | Cuándo | Dónde | Vol | Estilo | Combina con |
|---|---|---|---|---|---|---|---|---|
| `reaction-crowd-laugh-01.wav` | 4.02 s | f9 | Risa de público. | Solo para chiste claro (raro en este canal). | Empieza **9 f** antes del evento (pico a 310 ms). | 0.2 (-14 dB) | Ambos | momentos cómicos |
| `reaction-drum-joke-01.wav` | 2.44 s | f0 | Redoble de chiste (ba-dum-tss). | Remate de chiste o ironía. | Empieza 1 f antes del evento (golpe inmediato). | 0.25 (-12 dB) | Ambos | momentos cómicos |
| `reaction-error-buzzer-01.wav` | 2.55 s | f0 | Zumbador grave de respuesta incorrecta. | Mito/errores comunes (“esto es falso”). | Empieza 1 f antes del evento (golpe inmediato). | 0.25 (-12 dB) | Ambos | SLA-doc-emphasis-red, SLA-term-callout-box (error) |
| `reaction-record-scratch-01.wav` | 1.10 s | f0 | Scratch de disco (“espera, ¿qué?”). | Corte cómico o giro inesperado; parar la música. | Empieza 1 f antes del evento (golpe inmediato). | 0.3 (-10 dB) | Ambos | giros de guion, hook |
| `reaction-success-chime-01.wav` | 2.46 s | f10 | Chime de respuesta correcta. | Resultado correcto, “así sí”. | Empieza **10 f** antes del evento (pico a 330 ms). | 0.3 (-10 dB) | Ambos | SLA-term-checklist (paso final), LessonCard |

### Varios (sello, papel, censura) — `efectos/misc/` (3)

| Archivo | Dur. | Pico | Suena | Cuándo | Dónde | Vol | Estilo | Combina con |
|---|---|---|---|---|---|---|---|---|
| `misc-censor-beep-01.wav` | 1.48 s | f0 | Pitido de censura. | Tapar una palabra o cifra “secreta” (efecto cómico). | Empieza 1 f antes del evento (golpe inmediato). | 0.2 (-14 dB) | Ambos | captions |
| `misc-paper-slide-01.wav` | 1.07 s | f10 | Papel deslizándose. | Documento/informe que entra en pantalla. | Empieza **10 f** antes del evento (pico a 330 ms). | 0.3 (-10 dB) | Documental | documentos, recortes de prensa |
| `misc-stamp-01.wav` | 1.11 s | f0 | Sello de goma golpeando papel. | Sello/etiqueta que se estampa (“APROBADO”, fecha). | Empieza 1 f antes del evento (golpe inmediato). | 0.35 (-9 dB) | Documental | SLA-doc-stamp-*, etiquetas sobre documentos |

## Ampliación 2026-09-27 (tanda 2): 96 efectos nuevos

Pedido: más variedad sin abusar del whoosh. Nada de esto es un whoosh: los swipes de `ui/` son deslizamientos pequeños
DENTRO de un gráfico (no transiciones). Referencia de estilo: Santiago Castellanos usa SFX escasos y discretos (clics de
30–60 ms a ~−18 dB en ~1 de cada 2 iconos y en el botón CTA, ver `automated-research/style-refs/santiago/ANALISIS.md` §9);
los packs de «retention editing» de 2026 repiten las mismas familias: clicks/taps para texto, cámara, pops, dings,
impactos/sub drops, glitch y risers. Esta tanda cubre las que faltaban (pizarra, papel, quiz, contadores, reloj, cámara).

Normalizados a **pico −3 dBFS** (volumen sugerido ~3 dB más alto que la tanda 1). «cama» en la columna Pico = archivo
largo o con varios golpes: se recorta a la duración del gráfico siguiendo la columna «Dónde». Pico y «Empieza N f antes»
se midieron igual que en la tanda 1 (ventanas de 10 ms, primer punto a 3 dB del máximo).

Comprobación automática: cada archivo se pasó por un clasificador de audio (AudioSet) para confirmar que suena a lo que dice
su título; se descartaron 3 candidatos dudosos (uno parecía voz robótica, otro un estornudo, otro una cinta que sonaba a flatulencia).

### Rotulador, tiza y lápiz (pizarra) — `efectos/marker/` (9 nuevos)

| Archivo | Dur. | Pico | Suena | Cuándo | Dónde | Vol | Estilo | Combina con |
|---|---|---|---|---|---|---|---|---|
| `marker-pen-line-01.wav` | 0.34 s | f0 | Trazo corto de rotulador (0,3 s). | Subrayado o flecha que se dibuja en la pizarra. | Empieza 1 f antes del evento (golpe inmediato). | 0.4 (-8 dB) | Luisart | subrayado a mano, flecha, círculo en la pizarra |
| `marker-chalk-line-01.wav` | 0.36 s | f0 | Raya de tiza rápida, rasposa. | Tachar algo (mito, precio viejo) con una línea. | Empieza 1 f antes del evento (golpe inmediato). | 0.35 (-9 dB) | Luisart | tachado, SLA-term-callout-underline |
| `marker-pencil-letters-01.wav` | 1.06 s | f1 | Lápiz escribiendo letras rápidas (1 s), estilo explainer. | Palabra corta manuscrita (nota Shadows Into Light) que aparece. | Empieza **1 f** antes del evento (pico a 20 ms). | 0.35 (-9 dB) | Luisart | nota manuscrita de la pizarra |
| `marker-whiteboard-write-01.wav` | 59.20 s | cama | Rotulador en pizarra blanca, escritura real larga (59 s). | Cama bajo un texto o diagrama que se dibuja poco a poco. | Cama: desde el primer trazo visible hasta el último; recorta y haz fade-out de 4 f. Varía el punto de entrada para que no suene igual. | 0.3 (-10 dB) | Luisart | diagramas dibujados, escena pizarra |
| `marker-whiteboard-write-02.wav` | 22.39 s | cama | Rotulador en pizarra con pausas entre palabras (22 s). | Cama para una frase manuscrita larga. | Cama: recorta un tramo con trazos (p. ej. 3,8–6 s) a la duración del dibujado; fade-out 4 f. | 0.3 (-10 dB) | Luisart | nota manuscrita larga |
| `marker-whiteboard-squeak-01.wav` | 5.47 s | cama | Chirrido de rotulador en pizarra (varios, 5 s). | Círculo o marca rápida con chirrido (énfasis cómico). | Recorta un chirrido (hay golpes en 0,07 / 0,6 / 1,6 / 1,9 s); el más fuerte está en 2,05 s. | 0.3 (-10 dB) | Luisart | círculo alrededor de un número |
| `marker-highlighter-01.wav` | 14.41 s | cama | Subrayador fosforito pasando por papel (14 s de trazos). | Resaltar una palabra o cifra (barra de énfasis tipo marcador). | Recorta un solo trazo (0,07–0,6 s) para cada resaltado; como cama si hay varios. | 0.35 (-9 dB) | Todos | SLA-doc-emphasis-yellow, resaltado en la pizarra |
| `marker-cap-click-01.wav` | 0.37 s | f6 | Clic de tapa de rotulador (snap seco). | Final de un dibujo en la pizarra ("listo"), o antes de empezar a escribir. | Empieza **6 f** antes del evento (pico a 210 ms). | 0.4 (-8 dB) | Luisart | cierre de la escena pizarra |
| `marker-scribble-01.wav` | 11.36 s | cama | Garabato de rotulador rápido (11 s de trazos). | Tachar, rellenar o garabatear algo con energía. | Recorta 0,3–1 s de garabato a la duración de la animación; fade-out 3 f. | 0.3 (-10 dB) | Luisart | tachado, relleno de casillas |

### Papel, páginas y post-its — `efectos/paper/` (9 nuevos)

| Archivo | Dur. | Pico | Suena | Cuándo | Dónde | Vol | Estilo | Combina con |
|---|---|---|---|---|---|---|---|---|
| `paper-page-turn-01.wav` | 0.40 s | f4 | Pasar una página (corto, seco). | Cambiar de tarjeta/página dentro de la pizarra o de un documento. | Empieza **4 f** antes del evento (pico a 120 ms). | 0.4 (-8 dB) | Todos | DocumentCard, cambio de página |
| `paper-page-chime-01.wav` | 1.04 s | f7 | Página que pasa + campanita suave. | Pasar al siguiente punto de una lista con un toque amable. | Empieza **7 f** antes del evento (pico a 220 ms). | 0.35 (-9 dB) | Luisart | listas numeradas, stepper |
| `paper-quick-move-01.wav` | 0.79 s | f5 | Papel que se mueve rápido (hoja sobre mesa). | Documento o recorte que entra deslizándose. | Empieza **5 f** antes del evento (pico a 170 ms). | 0.35 (-9 dB) | Documental | recortes de prensa, DocumentCard |
| `paper-crumple-01.wav` | 0.80 s | f4 | Arrugar papel rápido. | Descartar una idea ("a la basura"), plan que no sirve. | Empieza **4 f** antes del evento (pico a 140 ms). | 0.35 (-9 dB) | Todos | mito descartado, tarjeta que sale |
| `paper-stapler-01.wav` | 0.19 s | f2 | Grapadora (clac metálico). | Adjuntar un dato/fuente a una tarjeta; cerrar un bloque. | Empieza **2 f** antes del evento (pico a 50 ms). | 0.4 (-8 dB) | Todos | fuente citada, nota adjunta |
| `paper-slap-drop-01.wav` | 0.49 s | f4 | Periódico que cae plano (slap de papel). | Hoja o tarjeta de papel que "aterriza" de golpe sobre la mesa. | Empieza **4 f** antes del evento (pico a 130 ms). | 0.4 (-8 dB) | Todos | titular de prensa que cae, tarjeta de papel |
| `paper-sticky-note-01.wav` | 2.23 s | f61 | Post-it: despegar + pegar (golpe principal al final). | Nota adhesiva que se pega en la pizarra. | El golpe de pegado está en 2,02 s: empieza **61 f** antes del frame en que la nota queda pegada (o recorta con trimBefore=55 para oír solo el pegado). | 0.4 (-8 dB) | Luisart | post-its en la pizarra |
| `paper-sticky-note-peel-01.wav` | 5.30 s | cama | Despegar post-its (varios, 5 s). | Quitar notas / "borrar" opciones de la pizarra. | Recorta un despegue (0,7–1,2 s); empieza en el frame en que la nota empieza a moverse. | 0.35 (-9 dB) | Luisart | post-its que se van |
| `paper-page-flip-01.wav` | 0.60 s | f4 | Hoja que se voltea (page flip). | Voltear una tarjeta o página en la pizarra. | Empieza **4 f** antes del evento (pico a 140 ms). | 0.4 (-8 dB) | Todos | flip de tarjeta |

### Clicks, checkbox y swipes de interfaz (ampliación) — `efectos/ui/` (10 nuevos)

| Archivo | Dur. | Pico | Suena | Cuándo | Dónde | Vol | Estilo | Combina con |
|---|---|---|---|---|---|---|---|---|
| `ui-click-mouse-hard-05.wav` | 0.42 s | f0 | Clic de ratón duro, con rebote. | Cursor que hace clic en un botón real (demo de herramienta de IA). | Empieza 1 f antes del evento (golpe inmediato). | 0.45 (-7 dB) | Todos | capturas de pantalla, cursores |
| `ui-click-mouse-close-06.wav` | 0.20 s | f0 | Clic de ratón muy cercano y seco. | Clic sutil en una opción; alternar con ui-click-mouse-01. | Empieza 1 f antes del evento (golpe inmediato). | 0.45 (-7 dB) | Todos | tarjetas, chips |
| `ui-checkbox-tick-01.wav` | 0.12 s | f0 | Tick de casilla (checkbox) moderno, 0,1 s. | Marcar una casilla de una checklist. | Empieza 1 f antes del evento (golpe inmediato). | 0.45 (-7 dB) | Todos | SLA-term-checklist-*, listas de la pizarra |
| `ui-click-plastic-bubble-01.wav` | 0.07 s | f0 | Clic de plástico tipo burbuja, cortísimo (70 ms). | Chip o etiqueta pequeña que aparece (más suave que un pop). | Empieza 1 f antes del evento (golpe inmediato). | 0.45 (-7 dB) | Luisart | chips, etiquetas pixel |
| `ui-tone-soft-01.wav` | 0.60 s | f4 | Tono corto de interfaz, amable. | Panel o ventana retro-brutalista que se abre. | Empieza **4 f** antes del evento (pico a 120 ms). | 0.4 (-8 dB) | Luisart | ventanas de la pizarra |
| `ui-click-tech-01.wav` | 0.41 s | f1 | Clic tecnológico con brillo metálico. | Tag mono [01] o chip en Terminal. | Empieza **1 f** antes del evento (pico a 30 ms). | 0.4 (-8 dB) | Terminal | tags mono, SLA-term-keyword-* |
| `ui-swipe-confirm-01.wav` | 0.38 s | f1 | Swipe corto de UI con confirmación (0,4 s). | Deslizar una tarjeta/notificación dentro de la pantalla (no es transición). | Empieza **1 f** antes del evento (pico a 30 ms). | 0.4 (-8 dB) | Todos | mockups de móvil, tarjetas que se deslizan |
| `ui-swipe-soft-01.wav` | 0.86 s | f1 | Swipe de navegación suave con "boing" ligero. | Carrusel de tarjetas que pasa a la siguiente. | Empieza **1 f** antes del evento (pico a 30 ms). | 0.35 (-9 dB) | Todos | carruseles, cambio de tarjeta en la pizarra |
| `ui-swipe-right-01.wav` | 0.67 s | f0 | Swipe de UI hacia la derecha. | Deslizar a la derecha ("siguiente", elegir opción B). | Empieza 1 f antes del evento (golpe inmediato). | 0.4 (-8 dB) | Todos | comparativas, carruseles |
| `ui-swipe-up-01.wav` | 1.03 s | f0 | Swipe hacia arriba con tono brillante. | Algo que sube: gráfico/tarjeta que entra desde abajo, "sube" un precio. | Empieza 1 f antes del evento (golpe inmediato). | 0.35 (-9 dB) | Todos | tarjetas que suben, stat que crece |

### Tonos y dings (ampliación) — `efectos/notification/` (6 nuevos)

| Archivo | Dur. | Pico | Suena | Cuándo | Dónde | Vol | Estilo | Combina con |
|---|---|---|---|---|---|---|---|---|
| `notification-success-tone-01.wav` | 1.61 s | f7 | Tono de éxito de software (dos notas). | Proceso completado, la IA termina una tarea. | Empieza **7 f** antes del evento (pico a 250 ms). | 0.35 (-9 dB) | Terminal | demo de herramienta, checklist completada |
| `notification-quick-tone-01.wav` | 1.15 s | f0 | Tono digital rápido (una nota). | Aviso pequeño en pantalla, dato que se actualiza. | Empieza 1 f antes del evento (golpe inmediato). | 0.35 (-9 dB) | Terminal | readouts, badges |
| `notification-confirm-tone-01.wav` | 1.19 s | f0 | Tono de confirmación limpio, tipo "ding" digital. | Confirmar una respuesta o una elección. | Empieza 1 f antes del evento (golpe inmediato). | 0.35 (-9 dB) | Todos | respuesta correcta suave, CTA |
| `notification-access-tone-01.wav` | 1.95 s | f0 | Tono de acceso concedido (ascendente, 2 s). | "Desbloqueado": herramienta nueva, acceso, truco revelado. | Empieza 1 f antes del evento (golpe inmediato). | 0.35 (-9 dB) | Terminal | revelación de herramienta de IA |
| `notification-service-bell-01.wav` | 0.90 s | f0 | Timbre de mostrador (ding metálico clásico). | "Pedido listo", punto clave, remate de una lista. | Empieza 1 f antes del evento (golpe inmediato). | 0.35 (-9 dB) | Todos | LessonCard, remate de lista |
| `notification-bell-chime-soft-01.wav` | 1.62 s | f1 | Campanita suave y relajante. | Palabra clave en un vídeo calmado; alternativa suave al ding. | Empieza **1 f** antes del evento (pico a 40 ms). | 0.3 (-10 dB) | Todos | keyword highlight, storytelling |

### Teclas sueltas, Enter, móvil y borrado (ampliación) — `efectos/typing/` (8 nuevos)

| Archivo | Dur. | Pico | Suena | Cuándo | Dónde | Vol | Estilo | Combina con |
|---|---|---|---|---|---|---|---|---|
| `typing-backspace-run-01.wav` | 10.66 s | cama | Tecleo de portátil con retrocesos (10,7 s). | Texto que se BORRA letra a letra (corregir una frase, "no, mejor…"). | Cama: desde el primer carácter borrado hasta el último; fade-out 3 f. | 0.3 (-10 dB) | Terminal | texto que se borra, SearchPill |
| `typing-smartphone-01.wav` | 4.03 s | cama | Tecleo en pantalla de móvil (4 s). | Mensaje escrito en un chat/app de IA en móvil. | Cama: desde el primer carácter hasta el último; recorta y fade-out 3 f. | 0.3 (-10 dB) | Todos | mockups de chat, prompts en móvil |
| `typing-typewriter-return-01.wav` | 1.44 s | f24 | Retorno de máquina de escribir (carro + campana). | Fin de línea en texto estilo Documental; cambio de línea. | Empieza **24 f** antes del evento (pico a 810 ms). | 0.35 (-9 dB) | Documental | SLA-doc-stamp-*, citas |
| `typing-key-single-04.wav` | 1.74 s | f0 | Una tecla suelta (portátil). | Palabra cinética detrás de la cabeza; alternar con las otras teclas. | Empieza 1 f antes del evento (golpe inmediato). | 0.4 (-8 dB) | Todos | palabra detrás de la cabeza |
| `typing-mechanical-enter-01.wav` | 1.84 s | f0 | Enter de teclado mecánico, contundente. | Enviar el prompt / ejecutar el comando. | Empieza 1 f antes del evento (golpe inmediato). | 0.4 (-8 dB) | Terminal | SearchPill (enviar), comando $ |
| `typing-spacebar-01.wav` | 0.24 s | f4 | Barra espaciadora (clac grave). | Separar palabras en tecleo rápido; pausa/play. | Empieza **4 f** antes del evento (pico a 140 ms). | 0.4 (-8 dB) | Terminal | decrypt, typewriter |
| `typing-mechanical-key-soft-02.wav` | 0.60 s | f5 | Tecla mecánica suave. | Tecleo tranquilo, una tecla por palabra en vídeos calmados. | Empieza **5 f** antes del evento (pico a 160 ms). | 0.4 (-8 dB) | Todos | palabra detrás de la cabeza (versión suave) |
| `typing-mechanical-key-by-key-01.wav` | 18.77 s | cama | Teclado mecánico tecla a tecla (18,8 s, pausado). | Cama de tecleo lento y nítido (ASMR) bajo un texto largo. | Cama: recorta a la duración del tecleo; fade-out 4 f. | 0.3 (-10 dB) | Terminal | SLA-term-title-*, lower thirds |

### Acierto / error (quiz) — `efectos/correct-wrong/` (9 nuevos)

| Archivo | Dur. | Pico | Suena | Cuándo | Dónde | Vol | Estilo | Combina con |
|---|---|---|---|---|---|---|---|---|
| `correct-notification-01.wav` | 1.01 s | f0 | Notificación de respuesta correcta (ding brillante). | "Correcto": dato verdadero, opción ganadora. | Empieza 1 f antes del evento (golpe inmediato). | 0.35 (-9 dB) | Todos | quiz, comparativa ganadora |
| `correct-positive-02.wav` | 0.86 s | f0 | Respuesta correcta, melodía positiva corta. | Acierto con más celebración (final de un quiz). | Empieza 1 f antes del evento (golpe inmediato). | 0.35 (-9 dB) | Luisart | quiz, checklist completada |
| `correct-tone-03.wav` | 1.67 s | f0 | Tono de respuesta correcta (ding limpio). | Check verde en un gráfico; versión sobria del acierto. | Empieza 1 f antes del evento (golpe inmediato). | 0.35 (-9 dB) | Terminal | SLA-term-compare-*, check |
| `correct-win-04.wav` | 1.56 s | f0 | Notificación de logro/ganar (arpegio corto). | Logro desbloqueado, meta alcanzada ("llegaste a 1 M"). | Empieza 1 f antes del evento (golpe inmediato). | 0.3 (-10 dB) | Todos | hitos, metas de ahorro |
| `wrong-fail-notification-01.wav` | 1.74 s | f4 | Notificación de fallo (melodía descendente). | "Error común": opción equivocada en un quiz. | Empieza **4 f** antes del evento (pico a 130 ms). | 0.3 (-10 dB) | Luisart | mitos, errores comunes |
| `wrong-buzz-02.wav` | 0.30 s | f1 | Buzz de concurso, corto (0,3 s). | "¡Falso!" rápido sobre un mito. | Empieza **1 f** antes del evento (pico a 20 ms). | 0.3 (-10 dB) | Todos | SLA-doc-emphasis-red, tachado |
| `wrong-buzzer-long-03.wav` | 0.98 s | f1 | Buzzer largo de error (1 s). | Error grave, alarma de "no hagas esto". | Empieza **1 f** antes del evento (pico a 30 ms). | 0.3 (-10 dB) | Todos | advertencias, ticker-loss |
| `wrong-funny-low-04.wav` | 1.44 s | f2 | Fallo cómico, tono grave. | Ironía o fallo gracioso ("y así perdió todo"). | Empieza **2 f** antes del evento (pico a 70 ms). | 0.3 (-10 dB) | Luisart | momentos cómicos |
| `wrong-mech-05.wav` | 0.61 s | f3 | Respuesta incorrecta con sonido mecánico/electrónico. | Error en Terminal (la IA falla, alucinación). | Empieza **3 f** antes del evento (pico a 90 ms). | 0.3 (-10 dB) | Terminal | SLA-term-callout-box (error) |

### Dinero y cajas registradoras (ampliación) — `efectos/money/` (7 nuevos)

| Archivo | Dur. | Pico | Suena | Cuándo | Dónde | Vol | Estilo | Combina con |
|---|---|---|---|---|---|---|---|---|
| `money-coins-handling-02.wav` | 0.52 s | f2 | Monedas en la mano (tintineo corto). | Cifra pequeña de dinero, propina, céntimos. | Empieza **2 f** antes del evento (pico a 80 ms). | 0.4 (-8 dB) | Todos | StatCallout, precios |
| `money-coins-03.wav` | 0.44 s | f6 | Puñado de monedas (seco). | Ahorro pequeño, "calderilla". | Empieza **6 f** antes del evento (pico a 190 ms). | 0.4 (-8 dB) | Todos | ahorro, comisiones |
| `money-gold-coin-prize-01.wav` | 1.66 s | f4 | Moneda de oro/premio con brillo (tipo videojuego). | Ganancia o recompensa en tono lúdico (Luisart). | Empieza **4 f** antes del evento (pico a 130 ms). | 0.35 (-9 dB) | Luisart | iconos pixel de moneda |
| `money-coin-bag-touch-01.wav` | 0.61 s | f0 | Bolsa de monedas que se toca/apoya. | Dinero acumulado, "el colchón" que aparece. | Empieza 1 f antes del evento (golpe inmediato). | 0.4 (-8 dB) | Todos | SLA-doc-big-number-money (versión suave) |
| `money-cash-register-chaching-03.wav` | 0.98 s | f1 | Caja registradora "cha-ching" limpia. | Venta, ingreso, "esto te hace ganar dinero" (máx. 1 por vídeo). | Empieza **1 f** antes del evento (pico a 20 ms). | 0.35 (-9 dB) | Todos | SLA-term-ticker-gain, precios |
| `money-cash-register-retro-04.wav` | 1.83 s | f2 | Caja registradora retro con cajón de monedas. | Momento "ka-ching" más teatral (hook de dinero). | Empieza **2 f** antes del evento (pico a 50 ms). | 0.35 (-9 dB) | Documental | hook de finanzas, big number money |
| `money-cash-register-kaching-05.wav` | 1.02 s | f2 | Ka-ching con campana y cola. | Alternativa de ka-ching para no repetir. | Empieza **2 f** antes del evento (pico a 80 ms). | 0.35 (-9 dB) | Todos | precios, ganancias |

### Escáner y bleeps (ampliación) — `efectos/data/` (5 nuevos)

| Archivo | Dur. | Pico | Suena | Cuándo | Dónde | Vol | Estilo | Combina con |
|---|---|---|---|---|---|---|---|---|
| `data-scanner-beeps-02.wav` | 5.85 s | cama | Pitidos de escáner de tienda (varios, 5,8 s). | Productos/precios escaneados uno tras otro. | Recorta un pitido (0,14 s) por producto, o usa la secuencia como cama. | 0.3 (-10 dB) | Todos | listas de precios, supermercado |
| `data-bleep-notify-02.wav` | 0.42 s | f0 | Bleep high-tech de notificación. | Dato que se actualiza en Terminal; alternar con data-bleep-01. | Empieza 1 f antes del evento (golpe inmediato). | 0.35 (-9 dB) | Terminal | readouts, SLA-term-keyword-stat |
| `data-bleep-confirm-03.wav` | 0.49 s | f2 | Bleep de confirmación tecnológico. | Valor que se fija al final de un conteo. | Empieza **2 f** antes del evento (pico a 60 ms). | 0.35 (-9 dB) | Terminal | count-up (remate) |
| `data-scanner-beep-store-03.wav` | 0.32 s | f0 | Beep de escáner de supermercado (doble). | Precio que aparece junto a un producto. | Empieza 1 f antes del evento (golpe inmediato). | 0.35 (-9 dB) | Todos | etiquetas de precio |
| `data-scanner-beep-single-04.wav` | 0.15 s | f1 | Un solo beep de escáner (150 ms). | Cada ítem de una lista de precios (rítmico). | Empieza **1 f** antes del evento (pico a 30 ms). | 0.35 (-9 dB) | Todos | listas de precios |

### Ticks de glitch (ampliación) — `efectos/glitch/` (4 nuevos)

| Archivo | Dur. | Pico | Suena | Cuándo | Dónde | Vol | Estilo | Combina con |
|---|---|---|---|---|---|---|---|---|
| `glitch-tick-small-01.wav` | 1.46 s | f18 | Glitch pequeño de ciencia ficción con varios ticks. | Texto que parpadea/se corrompe un instante. | Empieza **18 f** antes del evento (pico a 590 ms). | 0.3 (-10 dB) | Terminal | decrypt, glitch de texto |
| `glitch-tick-electric-02.wav` | 0.54 s | f0 | Tick eléctrico pequeño. | Parpadeo de un elemento, cursor que falla. | Empieza 1 f antes del evento (golpe inmediato). | 0.35 (-9 dB) | Terminal | cursor, chips que parpadean |
| `glitch-static-short-01.wav` | 0.60 s | f4 | Estática corta (0,6 s). | Corte glitch mínimo entre dos gráficos Terminal. | Empieza **4 f** antes del evento (pico a 140 ms). | 0.3 (-10 dB) | Terminal | cortes glitch |
| `glitch-crackles-01.wav` | 1.86 s | f32 | Chasquidos de glitch (crackles). | Imagen/pantalla que "se rompe" un momento. | Empieza **32 f** antes del evento (pico a 1080 ms). | 0.3 (-10 dB) | Terminal | error de IA |

### Contadores de números — `efectos/counter/` (5 nuevos)

| Archivo | Dur. | Pico | Suena | Cuándo | Dónde | Vol | Estilo | Combina con |
|---|---|---|---|---|---|---|---|---|
| `counter-score-casino-01.wav` | 3.49 s | cama | Contador de casino (tic-tic con tono, 3,5 s). | Número que sube rápido (puntos, dinero). | Desde el primer frame del conteo; corta seco en el frame final + remate (bleep/ding). | 0.3 (-10 dB) | Luisart | count-up, StatCallout |
| `counter-money-machine-01.wav` | 10.01 s | cama | Contador digital tipo máquina (10 s de ticks sintéticos). | Count-up largo en Terminal. | Cama: desde el primer frame del conteo hasta que se fija; corta seco. | 0.25 (-12 dB) | Terminal | SLA-term-keyword-stat, count-up |
| `counter-banknote-02.wav` | 3.24 s | cama | Máquina contadora de billetes (3,2 s). | Contar dinero, "fajos" que pasan. | Cama bajo el conteo de dinero; fade-out 3 f. | 0.3 (-10 dB) | Todos | SLA-doc-big-number-money |
| `counter-number-shuffle-01.wav` | 16.17 s | cama | Números barajándose (tonos de algoritmo, 16 s). | Cifras que cambian al azar antes de fijarse (scramble de números). | Cama bajo el scramble; corta seco cuando se fija el número. | 0.25 (-12 dB) | Terminal | decrypt de cifras, split-flap numérico |
| `counter-high-score-fill-01.wav` | 14.89 s | cama | Relleno de puntuación arcade (14,9 s). | Barra o contador que se llena (estilo videojuego). | Cama: recorta a la duración del relleno; corta seco al llenarse. | 0.25 (-12 dB) | Luisart | barras de progreso, steppers |

### Reloj y tic-tac — `efectos/clock/` (5 nuevos)

| Archivo | Dur. | Pico | Suena | Cuándo | Dónde | Vol | Estilo | Combina con |
|---|---|---|---|---|---|---|---|---|
| `clock-tick-single-01.wav` | 0.73 s | f2 | Un tic de mecanismo de reloj. | Un paso del tiempo ("1 año después"), aguja que avanza. | Empieza **2 f** antes del evento (pico a 80 ms). | 0.4 (-8 dB) | Todos | SLA-doc-timeline-* |
| `clock-ticking-fast-01.wav` | 2.25 s | cama | Reloj de pared rápido (2,2 s, 7 tics). | Urgencia corta, "el tiempo corre". | Cama corta; los tics caen cada ~0,3 s desde 0,3 s. | 0.3 (-10 dB) | Todos | cuenta atrás |
| `clock-tick-tock-close-01.wav` | 11.58 s | cama | Tic-tac cercano y nítido (11,6 s, 2 tics/s). | Cama de tensión bajo una explicación con plazo. | Cama: fade-in/out 6 f; tics cada 0,5 s desde 0,07 s. | 0.25 (-12 dB) | Todos | interés compuesto con el tiempo, plazos |
| `clock-knob-spin-01.wav` | 0.59 s | f0 | Giro de rueda de reloj (ratchet corto). | "Adelantar el tiempo", ajustar una fecha. | Empieza 1 f antes del evento (golpe inmediato). | 0.4 (-8 dB) | Todos | saltos de tiempo |
| `clock-tick-02.wav` | 39.14 s | cama | Tic de reloj de pared lento (1 tic/s, 39 s). | Cama muy sutil de espera o de reflexión. | Cama: tics cada 1 s; fade-in/out 10 f. | 0.25 (-12 dB) | Documental | silencios dramáticos |

### Cámara: obturador y autofoco — `efectos/camera/` (3 nuevos)

| Archivo | Dur. | Pico | Suena | Cuándo | Dónde | Vol | Estilo | Combina con |
|---|---|---|---|---|---|---|---|---|
| `camera-shutter-hard-01.wav` | 0.48 s | f1 | Obturador de cámara duro. | Captura de pantalla / "foto" de un dato. | Empieza **1 f** antes del evento (pico a 40 ms). | 0.4 (-8 dB) | Todos | capturas, freeze frame |
| `camera-shutter-vintage-02.wav` | 0.73 s | f3 | Obturador de cámara antigua (mecánico). | Foto de archivo, polaroid que aparece. | Empieza **3 f** antes del evento (pico a 90 ms). | 0.4 (-8 dB) | Documental | polaroids, fotos de archivo |
| `camera-autofocus-01.wav` | 4.00 s | cama | Autofoco de cámara (zumbido corto + clic, 4 s). | Zoom/punch-in que "enfoca" un detalle. | Recorta 0,07–0,6 s (primer ajuste) para un punch-in; entero para un zoom lento. | 0.3 (-10 dB) | Todos | punch-in 115 %, zoom a captura |

### Burbujas y pops blandos — `efectos/bubble/` (5 nuevos)

| Archivo | Dur. | Pico | Suena | Cuándo | Dónde | Vol | Estilo | Combina con |
|---|---|---|---|---|---|---|---|---|
| `bubble-soap-01.wav` | 0.26 s | f0 | Burbuja de jabón (pop blando, 0,25 s). | Icono pequeño o emoji que aparece; más suave que pop-soft-01. | Empieza 1 f antes del evento (golpe inmediato). | 0.4 (-8 dB) | Luisart | iconos pixel, emojis |
| `bubble-egg-pop-02.wav` | 0.25 s | f0 | Pop corto y redondo. | Bocadillo o chip que aparece. | Empieza 1 f antes del evento (golpe inmediato). | 0.4 (-8 dB) | Luisart | bocadillos pixel |
| `bubble-pop-03.wav` | 0.43 s | f0 | Bubble pop claro ("plop"). | Burbuja de chat o nota que aparece. | Empieza 1 f antes del evento (golpe inmediato). | 0.4 (-8 dB) | Todos | burbujas de chat |
| `bubble-pop-soft-04.wav` | 0.21 s | f0 | Pop de burbuja muy suave y corto (0,2 s). | Pops en ráfaga (cada ítem de una fila de iconos). | Empieza 1 f antes del evento (golpe inmediato). | 0.4 (-8 dB) | Todos | filas de iconos, waffles |
| `bubble-pop-05.wav` | 0.97 s | f0 | Plop de burbuja con cola (1 s). | Elemento que aparece con más presencia (icono principal). | Empieza 1 f antes del evento (golpe inmediato). | 0.35 (-9 dB) | Todos | Bit (personaje) que aparece |

### Graves: sub, golpes y bass drops — `efectos/bass/` (5 nuevos)

| Archivo | Dur. | Pico | Suena | Cuándo | Dónde | Vol | Estilo | Combina con |
|---|---|---|---|---|---|---|---|---|
| `bass-sub-knock-01.wav` | 2.32 s | cama | Pulso de sub-grave (7 golpes, ~0,26 s entre sí). | Tensión bajo un dato serio; latido electrónico. | Cama corta: el primer golpe está en 0,3 s; el más fuerte en 1,62 s. | 0.35 (-9 dB) | Terminal | SLA-term-ticker-loss, datos de riesgo |
| `bass-hit-futuristic-01.wav` | 1.45 s | f4 | Golpe de bajo futurista (1,5 s). | Palabra clave de peso en Terminal. | Empieza **4 f** antes del evento (pico a 120 ms). | 0.35 (-9 dB) | Terminal | SLA-term-keyword-single, SLA-term-title-center |
| `bass-drop-01.wav` | 2.08 s | f1 | Bass drop (caída de tono grave, 2 s). | Justo después de una pregunta: "la respuesta es…"; cambio de energía. | Empieza **1 f** antes del evento (pico a 20 ms). | 0.35 (-9 dB) | Todos | revelación, entrada del beat |
| `bass-drop-02.wav` | 2.58 s | f1 | Bass drop con modulación (2,6 s). | Revelación en Shorts (alternativa al anterior). | Empieza **1 f** antes del evento (pico a 40 ms). | 0.3 (-10 dB) | Todos | hook, revelación |
| `bass-drop-deep-03.wav` | 3.99 s | f0 | Bass drop profundo (4 s, cola larga). | Dato que "cae" (desplome, pérdida). | Empieza 1 f antes del evento (golpe inmediato). | 0.35 (-9 dB) | Documental | SLA-doc-big-number-drop, SLA-term-chart-down |

### Risers sutiles (ampliación) — `efectos/riser/` (2 nuevos)

| Archivo | Dur. | Pico | Suena | Cuándo | Dónde | Vol | Estilo | Combina con |
|---|---|---|---|---|---|---|---|---|
| `riser-subtle-scifi-04.wav` | 2.71 s | f4 | Swell sci-fi corto y suave (2,7 s). | Pequeña subida antes de revelar algo (riser sutil). | Empieza **4 f** antes del evento (pico a 140 ms). | 0.25 (-12 dB) | Terminal | antes de SLA-term-keyword-stat |
| `riser-subtle-angelic-05.wav` | 8.34 s | f26 | Swell "angelical" de presentación (8 s, pad). | Momento inspirador, "imagina que…"; revelación suave. | Empieza **26 f** antes del frame clave (pico a 870 ms) y déjalo desvanecer; recorta a 3–4 s con fade 10 f. | 0.2 (-14 dB) | Todos | CTA, final inspirador |

### Sellos (ampliación) — `efectos/misc/` (3 nuevos)

| Archivo | Dur. | Pico | Suena | Cuándo | Dónde | Vol | Estilo | Combina con |
|---|---|---|---|---|---|---|---|---|
| `misc-stamp-02.wav` | 0.56 s | f2 | Sello de goma (golpe + rebote). | Sello "APROBADO"/"FALSO" que se estampa. | Empieza **2 f** antes del evento (pico a 50 ms). | 0.4 (-8 dB) | Todos | SLA-doc-stamp-*, sellos en la pizarra |
| `misc-stamp-office-03.wav` | 4.26 s | cama | Sello de oficina (varios golpes, 4,3 s). | Varios sellos seguidos (checklist de documentos). | Usa el primer golpe (0,07–0,35 s) por sello; el resto del archivo son más golpes. | 0.4 (-8 dB) | Documental | documentos, trámites |
| `misc-stamp-04.wav` | 0.54 s | f0 | Sello seco y corto. | Alternativa de sello para no repetir. | Empieza 1 f antes del evento (golpe inmediato). | 0.4 (-8 dB) | Todos | SLA-doc-stamp-* |

### Destello "magia de IA" — `efectos/sparkle/` (1 nuevo)

| Archivo | Dur. | Pico | Suena | Cuándo | Dónde | Vol | Estilo | Combina con |
|---|---|---|---|---|---|---|---|---|
| `sparkle-touch-01.wav` | 1.54 s | f11 | Destello mágico corto (cristalino). | "Magia" de la IA: algo que se genera solo, antes/después. | Empieza **11 f** antes del evento (pico a 370 ms). | 0.3 (-10 dB) | Todos | revelación de resultado de IA, Bit |

## Licencias (resumen)

Todo (las dos tandas) viene de **Pixabay** (Pixabay Content License: uso gratis, comercial, sin atribución, incluido YouTube/TikTok
monetizado; prohibido revender el audio suelto) y **Mixkit** (Mixkit Sound Effects Free License: uso comercial gratis,
sin atribución, en vídeos para YouTube/redes). Ningún archivo requiere cuenta ni atribución. Detalle por archivo en
`LICENCIAS.md`.
