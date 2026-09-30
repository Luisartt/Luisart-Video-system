// Repertorio de mascotas para carruseles (y cualquier HTML que se renderice con Playwright).
// Uso:
//   const { mascota, buscar, catalogo } = require("../mascotas.cjs");
//   `<img src="${mascota("lupa-base", "pensando")}" style="height:220px;image-rendering:pixelated">`
// Claves de personaje: 'lupa-base', 'lupa-oscuro', 'lupa-alterno', 'bit-ia-oscuro', 'f08-toro', '01-noche'... (mira catalogo()).
// Caras: feliz, sorpresa, pensando, enojado, guino, sueno.
// Devuelve un data URI (así el HTML es autocontenido). Las imágenes están en media/soyluisart/brand/mascots/ y en la bóveda (wiki/Content Creation/Designs/Mascots/).
const fs = require("fs");
const path = require("path");

const RAIZ = path.resolve(__dirname, "../../../media/soyluisart/brand/mascots");
const EXPRESIONES = ["feliz", "sorpresa", "pensando", "enojado", "guino", "sueno"];

let _cat = null;
function catalogo() {
  if (_cat) return _cat;
  const lista = [];
  const leer = (tipo, cat) => {
    const base = cat ? path.join(RAIZ, "categorias", cat, "png") : path.join(RAIZ, tipo, "png");
    if (!fs.existsSync(base)) return;
    for (const clave of fs.readdirSync(base)) lista.push({ clave, grupo: cat || tipo, carpeta: path.join(base, clave) });
  };
  leer("variantes"); leer("figuras");
  const cats = path.join(RAIZ, "categorias");
  if (fs.existsSync(cats)) for (const c of fs.readdirSync(cats)) if (fs.statSync(path.join(cats, c)).isDirectory()) leer("categorias", c);
  return (_cat = lista);
}

// Todos los personajes cuyo nombre contiene el texto (p. ej. buscar("toro"), buscar("bit-"), buscar("02-finanzas"))
const buscar = texto => catalogo().filter(x => x.clave.includes(texto) || x.grupo.includes(texto)).map(x => x.clave);

function archivo(clave, cara = "feliz") {
  const i = EXPRESIONES.indexOf(cara);
  if (i < 0) throw new Error(`Cara desconocida "${cara}". Usa: ${EXPRESIONES.join(", ")}`);
  const p = catalogo().find(x => x.clave === clave);
  if (!p) throw new Error(`Personaje desconocido "${clave}". Ejemplos: ${catalogo().slice(0, 6).map(x => x.clave).join(", ")}...`);
  return path.join(p.carpeta, `${i + 1}-${cara}.png`);
}

const mascota = (clave, cara) => "data:image/png;base64," + fs.readFileSync(archivo(clave, cara)).toString("base64");

module.exports = { mascota, archivo, buscar, catalogo, EXPRESIONES };
