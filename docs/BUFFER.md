# Buffer: recomendación y setup / Buffer: recommendation and setup

**Recomendación:** programa tus publicaciones con [Buffer](https://buffer.com). *Recommendation: schedule your
posts with Buffer.* Un solo lugar para Instagram, TikTok, YouTube y otras redes, cola con horarios recomendados y un
plan gratis para empezar (al 2026-09-30: 3 canales y 10 publicaciones programadas; **confirma el plan vigente** en su
página de precios). Cualquier programador sirve; este repositorio documenta y automatiza Buffer.

## Regla de oro / Golden rule
La IA **programa, nunca publica "ahora"**, y **solo después de que tú digas que el post quedó listo** ("ya quedó",
"súbelo", "prográmalo"). Nunca elige tu música. Nunca escribe tu contraseña ni guarda llaves. *The AI schedules, never
publishes "now", only after you say it is done; never picks music; never types your password or stores keys.*

## Dos piezas, dos tareas / Two pieces, two jobs
| Pieza | Sirve para | Cómo se conecta |
|---|---|---|
| **Conector de Buffer (MCP)** | escribir/editar captions, listar, **verificar el orden y el estado**, editar y borrar posts programados | en tu cliente de IA: agrega el conector de Buffer y autoriza con tu cuenta (OAuth). Si tu cliente pide una llave, créala en `publish.buffer.com/settings/api` y pégala **en los ajustes del conector, nunca en el chat** |
| **Navegador con sesión guardada** (`tools/buffer/`) | **subir los archivos** (imágenes y videos) y programar, porque la subida pasa por el compositor web | `node tools/buffer/abrir.cjs` una vez; tú inicias sesión en esa ventana; queda guardada en `.profiles/buffer` (ignorada por git; **no la borres**) |

## Setup paso a paso / Step by step
1. **Cuenta:** crea o abre tu cuenta en Buffer y **conecta tus redes** (por ejemplo Instagram Business/Creator).
2. **Conector:** agrégalo en tu cliente (ver arriba) y pídele a la IA `list_channels` para comprobar que ve tus canales.
3. **Sesión guardada:** la IA corre `node tools/buffer/abrir.cjs`; se abre una ventana de Chromium; **inicia sesión tú**; déjala
   abierta (o ciérrala: la sesión queda).
4. **Prueba sin riesgo:** pide a la IA un borrador de prueba con una imagen y revisa en Buffer; bórralo.
5. **Ritmo:** puedes dejar varias publicaciones en cola; se programan una tras otra a la hora que Buffer recomienda, nunca dos
   a la misma hora.

## Flujo de publicación / Publishing flow
1. **Detectar el formato** (la IA mira los archivos con `ffprobe`; solo pregunta si es ambiguo):
   | Formato | Cómo se reconoce | Tipo en Buffer |
   |---|---|---|
   | Carrusel | 2–10 archivos iguales 1080×1350 (4:5), numerados `01…N` | Post |
   | Reel | 1 video vertical 1080×1920 (9:16), ~5–90 s | Reel |
   | Historia (Story) | 1 imagen o video 9:16, corto, sin caption | Story |
   | Post simple | 1 imagen 1080×1350 | Post |
2. **Preparar:** archivos finales numerados, caption listo (**máx. 5 hashtags** en Instagram, < 2,200 caracteres).
3. **Programar:** `node tools/buffer/publicar.cjs --type carousel|reel|story --files "…" --caption caption.txt [--time "6:30 PM"]`.
4. **Verificar:** con el conector, `list_posts` (estado `scheduled`, modo `automatic`, hora, archivos) y **el orden 01…N**; si
   dos se intercambiaron, corrígelo con `edit_post`. Borra borradores sobrantes.
5. **Cerrar:** anota en tu wiki (`Publicaciones terminadas`) el id del post, fecha y hora; y dile a la persona qué quedó
   programado, cuándo y qué falta (música, app móvil).

## Problemas conocidos / Known issues
- Un solo video hace que Buffer cambie a "Reel": el script vuelve a marcar el tipo correcto tras el primer archivo.
- Más de 5 hashtags deshabilita "Schedule Post". Un archivo en tamaño equivocado se recorta: exporta en el formato correcto.
- Una nota de "Music" obliga al modo "Notify Me" (app móvil): sin ella, publicación automática.
- Subida fallida o parcial: borra el borrador y rehaz el post completo.
- La web de Buffer cambia: la primera vez corre `publicar.cjs` con la ventana visible y corrige los selectores que ya no coincidan.
  El flujo de carrusel se probó en uso real; Reel e Historia siguen los mismos pasos pero **verifícalos la primera vez**.
