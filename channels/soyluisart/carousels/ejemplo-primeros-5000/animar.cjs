// Versión con movimiento sutil del carrusel de ejemplo: 8 videos de 5 s (30 fps, sin sonido), pensados para subirse como diapositivas de video.
// Cada cuadro se captura "buscando" el tiempo de las animaciones CSS, así el resultado es exacto y repetible.
// Uso:  node animar.cjs <carpeta de salida> [diapositiva]    (necesita ffmpeg en el PATH)
const { chromium } = require("playwright");
const { css, slides, TOTAL, BIT_PARP } = require("./render.cjs");
const path = require("path");
const fs = require("fs");
const { execFileSync } = require("child_process");

const SALIDA = process.argv[2] || path.join(__dirname, "animado");
const SOLO = process.argv[3] ? Number(process.argv[3]) : null;
const DUR = 5000, FPS = 30, CUADROS = (DUR / 1000) * FPS;

const movimiento = `
/* --- movimiento: entradas en el primer segundo y movimiento suave que se repite (periodos que dividen 5 s) --- */
.slide { animation: fondo 5s linear infinite; }
@keyframes fondo { from { background-position: 28px 32px; } to { background-position: 92px 96px; } }
.top, .pie { animation: aparece .5s both; }
@keyframes aparece { from { opacity: 0; } to { opacity: 1; } }
.palabra-m { display: inline-block; opacity: 0; transform: translateY(18px); animation: palabra .38s cubic-bezier(.2,.9,.3,1.2) both; animation-delay: calc(.25s + var(--i) * .07s); }
@keyframes palabra { to { opacity: 1; transform: none; } }
.etiqueta { animation: etiqueta .4s steps(4) both; animation-delay: .1s; }
@keyframes etiqueta { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: none; } }
.ventana, .contexto .ventana { animation: sube .6s cubic-bezier(.2,.9,.3,1.1) both; animation-delay: 1s; }
@keyframes sube { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: none; } }
.lista li { animation: sube .45s ease-out both; animation-delay: calc(1.5s + var(--n) * .28s); }
.barras b { transform-origin: bottom; animation: crece .7s cubic-bezier(.2,.9,.3,1.05) both; animation-delay: calc(1.5s + var(--n) * .12s); }
@keyframes crece { from { transform: scaleY(0); } to { transform: none; } }
.comp > div { animation: sube .5s ease-out both; animation-delay: calc(1.5s + var(--n) * .25s); }
.veredicto .mano, .contexto .mano, .portada .mano, .cta .mano { animation: sube .6s ease-out both; animation-delay: 2.5s; }
.portada .mano, .contexto .mano { animation-delay: 1.3s; }
/* marcador azul bajo la palabra clave del título */
.azul { background-image: linear-gradient(transparent 86%, #DCE6FF 86%); background-repeat: no-repeat; background-size: 0% 100%; animation: marcador .7s ease-out both; animation-delay: 1.1s; }
@keyframes marcador { to { background-size: 100% 100%; } }
/* Bit flota a saltitos, parpadea y el cursor de la barra late */
.portada .bit, .cta .bit { animation: flota 1.25s steps(1) infinite, aparece .5s both; }
@keyframes flota { 0%, 49.9% { transform: translateY(0); } 50%, 100% { transform: translateY(-9px); } }
.portada .bit-parp, .cta .bit-parp { opacity: 0; animation: flota 1.25s steps(1) infinite, parpadea 5s steps(1) infinite; }
@keyframes parpadea { 0%, 75.9% { opacity: 0; } 76%, 80% { opacity: 1; } 80.1%, 100% { opacity: 0; } }
.handle img { animation: flota2 1.25s steps(1) infinite; }
@keyframes flota2 { 0%, 49.9% { transform: translateY(0); } 50%, 100% { transform: translateY(-3px); } }
.ventana .barra i:last-child { animation: latido 1.25s steps(1) infinite; }
@keyframes latido { 0%, 49.9% { opacity: 1; } 50%, 100% { opacity: .25; } }
.desliza { animation: empuja 1.25s steps(1) infinite; }
@keyframes empuja { 0%, 49.9% { transform: translateX(0); } 50%, 100% { transform: translateX(10px); } }
.cta .palabra { animation: pulsa 2.5s steps(1) infinite, sube .6s ease-out both; animation-delay: 0s, 1.2s; }
@keyframes pulsa { 0%, 79.9% { transform: none; box-shadow: 12px 12px 0 #111; } 80%, 100% { transform: translate(8px, 8px); box-shadow: 4px 4px 0 #111; } }
.top .serie::before { animation: latido 1.25s steps(1) infinite; }
`;

// palabras del título en <span class="palabra-m" style="--i:n"> (conserva los <span class="azul">)
const envolver = (parp) => {
  document.querySelectorAll('.bit').forEach((b) => { const c = b.cloneNode(); c.src = parp; c.classList.add('bit-parp'); b.after(c); });
  const partir = (nodo, ctx) => {
    for (const hijo of Array.from(nodo.childNodes)) {
      if (hijo.nodeType === 3) {
        const frag = document.createDocumentFragment();
        for (const parte of hijo.textContent.split(/(\s+)/)) {
          if (!parte) continue;
          if (/^\s+$/.test(parte)) { frag.appendChild(document.createTextNode(parte)); continue; }
          const sp = document.createElement("span");
          sp.className = "palabra-m";
          sp.style.setProperty("--i", String(ctx.i++));
          sp.textContent = parte;
          frag.appendChild(sp);
        }
        hijo.replaceWith(frag);
      } else if (hijo.nodeType === 1) partir(hijo, ctx);
    }
  };
  document.querySelectorAll(".slide h1, .slide h2").forEach((t) => partir(t, { i: 0 }));
  document.querySelectorAll(".lista li, .barras b, .comp > div").forEach((el) => {
    const hermanos = Array.from(el.parentElement.children);
    el.style.setProperty("--n", String(hermanos.indexOf(el)));
  });
};

(async () => {
  fs.mkdirSync(SALIDA, { recursive: true });
  const navegador = await chromium.launch();
  for (let n = 1; n <= TOTAL; n++) {
    if (SOLO && n !== SOLO) continue;
    const p = await navegador.newPage({ viewport: { width: 1080, height: 1350 } });
    await p.setContent(`<html><head><meta charset="utf-8"><style>${css}${movimiento} body{margin:0} .slide[hidden]{display:none !important}</style></head><body>${slides.join("")}</body></html>`, { waitUntil: "networkidle" });
    await p.evaluate((k) => document.querySelectorAll('.slide').forEach((e, i) => { e.hidden = i !== k; }), n - 1);
    await p.evaluate(envolver, BIT_PARP);
    await p.evaluate(() => document.fonts.ready);
    await p.waitForTimeout(500);
    const carpeta = path.join(__dirname, "_cuadros", String(n).padStart(2, "0"));
    fs.rmSync(carpeta, { recursive: true, force: true });
    fs.mkdirSync(carpeta, { recursive: true });
    for (let c = 0; c < CUADROS; c++) {
      const ms = (c / FPS) * 1000;
      await p.evaluate((t) => {
        document.getAnimations().forEach((a) => { a.pause(); a.currentTime = t; });
        const q = Math.min(1, Math.max(0, (t - 1500) / 900));
        document.querySelectorAll("[data-cuenta]").forEach((e) => { e.textContent = (e.textContent.startsWith("−") ? "−" : "") + "$" + Math.round(Number(e.dataset.cuenta) * q).toLocaleString("en-US"); });
      }, ms);
      await p.screenshot({ path: path.join(carpeta, String(c).padStart(4, "0") + ".jpg"), type: "jpeg", quality: 94 });
    }
    const mp4 = path.join(SALIDA, String(n).padStart(2, "0") + ".mp4");
    execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-framerate", String(FPS), "-i", path.join(carpeta, "%04d.jpg"), "-c:v", "libx264", "-preset", "slow", "-crf", "17", "-pix_fmt", "yuv420p", "-movflags", "+faststart", mp4]);
    await p.close();
    console.log("listo", mp4);
  }
  await navegador.close();
})();
