// Ejemplo de carrusel @soyluisart (Pizarra): "5 errores con tus primeros $5,000 MXN". 8 diapositivas 1080x1350 hechas con HTML/CSS y capturadas con Playwright.
// Uso:  node render.cjs <carpeta de salida>      (las imágenes de la marca salen de la bóveda: .inicio/logos)
const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");

const SALIDA = process.argv[2] || path.join(__dirname, "salida");
const LOGOS_DIR = "C:/Users/LART/Documents/Lartyk/.inicio/logos/";
const uri = (n) => "data:image/png;base64," + fs.readFileSync(LOGOS_DIR + n).toString("base64");
const BIT = uri("bit-marca.png"), BIT_PARP = uri("bit-marca-parpadeo.png");
const TOTAL = 8;

const css = `
@import url("https://fonts.googleapis.com/css2?family=Inter+Tight:wght@600;700;800&family=Pixelify+Sans:wght@600;700&family=Space+Grotesk:wght@500;700&family=Shadows+Into+Light+Two&display=swap");
:root { --tinta:#111; --azul:#2F6BFF; --azul-claro:#DCE6FF; --gris:#D6D6D6; --barra:#F4F4F4; --mano:#3A3A3A; }
* { box-sizing: border-box; margin: 0; }
body { background: #888; }
.slide { position: relative; width: 1080px; height: 1350px; overflow: hidden; background-color: #fff; background-image: radial-gradient(circle, #D5D9E2 2.5px, transparent 3px); background-size: 64px 64px; background-position: 28px 32px; font-family: "Inter Tight", sans-serif; color: var(--tinta); }
.top { position: absolute; left: 90px; right: 90px; top: 64px; display: flex; justify-content: space-between; font-family: "Pixelify Sans", monospace; font-weight: 700; font-size: 34px; letter-spacing: .06em; }
.top .serie::before, .top .num::before { content: ""; display: inline-block; width: 18px; height: 18px; background: var(--azul); margin-right: 14px; }
.top .num::before { display: none; }
.pie { position: absolute; left: 90px; right: 90px; bottom: 60px; display: flex; justify-content: space-between; align-items: center; }
.handle { display: flex; align-items: center; gap: 16px; font-family: "Space Grotesk", sans-serif; font-weight: 700; font-size: 32px; padding: 8px 22px 8px 12px; border: 4px solid var(--tinta); border-radius: 8px; background: #fff; box-shadow: 6px 6px 0 var(--gris); }
.handle img { height: 50px; image-rendering: pixelated; }
.desliza { font-family: "Pixelify Sans", monospace; font-weight: 700; font-size: 34px; letter-spacing: .06em; color: var(--azul); }
h1, h2 { font-weight: 800; letter-spacing: -.02em; line-height: 1.02; }
.azul { color: var(--azul); }
.mano { font-family: "Shadows Into Light Two", cursive; color: var(--mano); font-size: 58px; line-height: 1.15; }
.etiqueta { display: inline-block; font-family: "Pixelify Sans", monospace; font-weight: 700; font-size: 40px; padding: 4px 22px; background: var(--azul); color: #fff; border: 4px solid var(--tinta); border-radius: 6px; box-shadow: 6px 6px 0 var(--tinta); letter-spacing: .05em; }
.ventana { border: 5px solid var(--tinta); border-radius: 12px; background: #fff; box-shadow: 12px 12px 0 var(--gris); overflow: hidden; }
.ventana .barra { display: flex; align-items: center; gap: 14px; padding: 12px 22px; background: var(--barra); border-bottom: 5px solid var(--tinta); font-family: "Space Grotesk", sans-serif; font-weight: 700; font-size: 26px; letter-spacing: .06em; text-transform: uppercase; }
.ventana .barra i { display: inline-block; width: 16px; height: 16px; background: var(--tinta); }
.ventana .barra i:last-child { background: var(--azul); margin-left: auto; }
.ventana .cuerpo { padding: 34px 40px; }
.ejemplo { font-family: "Space Grotesk", sans-serif; font-size: 24px; color: #5B6078; margin-top: 18px; }
/* --- portada --- */
.portada h1 { position: absolute; left: 90px; right: 90px; top: 210px; font-size: 128px; }
.portada .mano { position: absolute; left: 90px; right: 420px; top: 830px; font-size: 68px; }
.portada .bit { position: absolute; right: 70px; bottom: 170px; height: 330px; image-rendering: pixelated; }
.portada .flecha { position: absolute; left: 90px; top: 960px; font-size: 44px; font-family: "Pixelify Sans", monospace; color: var(--azul); font-weight: 700; }
/* --- contexto y errores (en flujo vertical) --- */
.contexto, .item { display: flex; flex-direction: column; padding: 190px 90px 250px; gap: 46px; }
.contexto h2, .item h2 { position: static; font-size: 108px; }
.item .etiqueta { position: static; align-self: flex-start; }
.item .cuerpo-item, .item .veredicto, .contexto .mano, .contexto .ventana { position: static; }
.item .veredicto { margin-top: auto; }
.item .veredicto .mano { font-size: 58px; }
.contexto .mano { font-size: 62px; }
.lista { font-size: 42px !important; line-height: 1.4 !important; }
.barras { display: flex; gap: 20px; align-items: flex-end; height: 240px; }
.item .ventana .cuerpo { padding: 40px 44px; }
.barras b { display: block; flex: 1; border: 4px solid var(--tinta); background: var(--azul-claro); }
.barras b.uno { background: var(--azul); }
.comp { display: flex; gap: 26px; align-items: stretch; }
.comp > div { flex: 1; border: 4px solid var(--tinta); border-radius: 8px; padding: 22px 26px; }
.comp .grande { font-family: "Pixelify Sans", monospace; font-weight: 700; font-size: 76px; line-height: 1; }
.comp small { display: block; font-family: "Space Grotesk", sans-serif; font-size: 28px; margin-top: 8px; color: #5B6078; }
.lista { list-style: none; padding: 0; font-family: "Space Grotesk", sans-serif; font-weight: 500; }
.lista li::before { content: ""; display: inline-block; width: 20px; height: 20px; margin-right: 20px; background: var(--azul); }
.ejemplo { font-size: 28px !important; }
/* --- cierre --- */
.cta h2 { position: absolute; left: 90px; right: 90px; top: 210px; font-size: 112px; }
.cta .palabra { position: absolute; left: 90px; top: 640px; font-family: "Pixelify Sans", monospace; font-weight: 700; font-size: 150px; padding: 8px 46px; background: var(--azul); color: #fff; border: 6px solid var(--tinta); border-radius: 10px; box-shadow: 12px 12px 0 var(--tinta); letter-spacing: .05em; }
.cta .mano { position: absolute; left: 90px; right: 330px; top: 900px; }
.cta .bit { position: absolute; right: 70px; bottom: 170px; height: 300px; image-rendering: pixelated; }
`;

const barra = (t) => `<div class="barra"><i></i><i></i>${t}<i></i></div>`;
const cima = (n, serie = "PARTE 1") => `<div class="top"><span class="serie">${serie}</span><span class="num">${String(n).padStart(2, "0")} / ${String(TOTAL).padStart(2, "0")}</span></div>`;
const pie = (ultimo) => `<div class="pie"><div class="handle"><img src="${BIT}">@soyluisart</div>${ultimo ? "<span class='desliza'>GUÁRDALO ✓</span>" : "<span class='desliza'>DESLIZA →</span>"}</div>`;

const slides = [
  // 1 portada
  `<section class="slide portada">${cima(1)}
    <h1>5 errores que cometes con tus primeros <span class="azul">$5,000 MXN</span></h1>
    <div class="mano">(y cómo evitarlos sin volverte experto)</div>
    <img class="bit" src="${BIT}">${pie(false)}</section>`,
  // 2 contexto
  `<section class="slide contexto">${cima(2)}
    <h2>Casi nunca es cuánto tienes. Es <span class="azul">cómo empiezas.</span></h2>
    <div class="mano">Cinco errores, del más común al que más cuesta. Empezamos por el 5.</div>
    <div class="ventana">${barra("Antes de empezar")}<div class="cuerpo"><ul class="lista"><li>Es educativo, no una recomendación personal.</li><li>Los números son de ejemplo, en pesos.</li></ul></div></div>${pie(false)}</section>`,
  // 3 error 5
  `<section class="slide item">${cima(3)}<div class="etiqueta">ERROR 5</div>
    <h2>Ponerlo <span class="azul">todo</span> en una sola cosa</h2>
    <div class="cuerpo-item"><div class="ventana">${barra("Un solo lugar vs repartido")}<div class="cuerpo"><div class="barras"><b class="uno" style="height:200px"></b><b style="height:60px"></b><b style="height:60px"></b><b style="height:60px"></b></div><div class="ejemplo">Dato de ejemplo: $5,000 en 1 lugar vs. repartidos en 4.</div></div></div></div>
    <div class="veredicto"><div class="mano">Si ese único lugar falla, falla todo. Reparte.</div></div>${pie(false)}</section>`,
  // 4 error 4
  `<section class="slide item">${cima(4)}<div class="etiqueta">ERROR 4</div>
    <h2>Invertir sin un <span class="azul">fondo de emergencia</span></h2>
    <div class="cuerpo-item"><div class="ventana">${barra("Primero tu colchón")}<div class="cuerpo"><ul class="lista"><li>Meta: de 3 a 6 meses de gastos.</li><li>Ahí no se toma riesgo.</li><li>Lo demás, ya sí.</li></ul></div></div></div>
    <div class="veredicto"><div class="mano">Sin colchón, la primera urgencia te obliga a vender mal.</div></div>${pie(false)}</section>`,
  // 5 error 3
  `<section class="slide item">${cima(5)}<div class="etiqueta">ERROR 3</div>
    <h2>Ignorar las <span class="azul">comisiones</span></h2>
    <div class="cuerpo-item"><div class="ventana">${barra("Cuánto se va cada año")}<div class="cuerpo"><div class="comp"><div><div class="grande" data-cuenta="0">$0</div><small>sin comisión</small></div><div style="background:var(--azul-claro)"><div class="grande" data-cuenta="100">−$100</div><small>con 2 % anual</small></div></div><div class="ejemplo">Dato de ejemplo: 2 % de $5,000 MXN = $100 al año.</div></div></div></div>
    <div class="veredicto"><div class="mano">Pequeño hoy, grande cuando lo repites años.</div></div>${pie(false)}</section>`,
  // 6 error 2
  `<section class="slide item">${cima(6)}<div class="etiqueta">ERROR 2</div>
    <h2>Perseguir lo que está de <span class="azul">moda</span></h2>
    <div class="cuerpo-item"><div class="ventana">${barra("Antes de comprar, pregúntate")}<div class="cuerpo"><ul class="lista"><li>¿Entiendo cómo gana dinero?</li><li>¿Qué pasa si baja 30 %?</li><li>¿O solo me da miedo perdérmelo?</li></ul></div></div></div>
    <div class="veredicto"><div class="mano">Si no puedes explicarlo en una frase, todavía no.</div></div>${pie(false)}</section>`,
  // 7 error 1
  `<section class="slide item">${cima(7)}<div class="etiqueta">ERROR 1</div>
    <h2>Empezar <span class="azul">sin un plan</span> ni una fecha</h2>
    <div class="cuerpo-item"><div class="ventana">${barra("Tu plan en 3 líneas")}<div class="cuerpo"><ul class="lista"><li>Para qué es este dinero.</li><li>Para cuándo lo necesito.</li><li>Cuánto riesgo aguanto.</li></ul></div></div></div>
    <div class="veredicto"><div class="mano">Sin fecha, todo parece buena idea.</div></div>${pie(false)}</section>`,
  // 8 cierre
  `<section class="slide cta">${cima(8)}
    <h2>¿Quieres el <span class="azul">checklist</span> para empezar bien?</h2>
    <div class="palabra">PLAN</div>
    <div class="mano">Comenta PLAN y te lo mando. Guarda este carrusel para no olvidarlo.</div>
    <img class="bit" src="${BIT}">${pie(true)}</section>`,
];

module.exports = { css, slides, TOTAL, BIT_PARP };
if (require.main === module) (async () => {
  fs.mkdirSync(SALIDA, { recursive: true });
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1350 } });
  await p.setContent(`<html><head><meta charset="utf-8"><style>${css}</style></head><body>${slides.join("")}</body></html>`, { waitUntil: "networkidle" });
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(800);
  const els = await p.$$(".slide");
  for (let i = 0; i < els.length; i++) {
    await els[i].screenshot({ path: path.join(SALIDA, String(i + 1).padStart(2, "0") + ".png") });
  }
  await b.close();
  console.log("diapositivas:", els.length, "->", SALIDA);
})();
