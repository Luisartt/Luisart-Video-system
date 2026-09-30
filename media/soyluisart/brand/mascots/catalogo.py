"""Construye el catálogo de mascotas: .inicio/mascotas/catalogo.json (Inicio) y mascotIndex.ts (Remotion).
Uso: python catalogo.py"""
import os, sys, json, glob
REPO = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..", "..")).replace("\\", "/")
sys.path.insert(0, os.path.dirname(__file__))
import sprites2 as S
os.environ.setdefault("MASC_BASE", REPO + "/media/soyluisart/brand/mascots/variantes")
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
import mascotas_gen as GV

M = REPO + "/media/soyluisart/brand/mascots/"
VAULT = os.environ.get("MASCOT_CATALOG_DIR", REPO + "/media/soyluisart/brand/mascots/_catalogo") + "/"
EXPR = ["feliz", "sorpresa", "pensando", "enojado", "guino", "sueno"]
FIG = {"f01-grafica":"Grafi","f02-billete":"Billetin","f03-moneda":"Monedin","f04-lingote":"Lingotin","f05-caja-fuerte":"Caja Fuerte","f06-portafolio":"Portafolio","f07-tarjeta":"Tarjetin","f08-toro":"Toro","f09-oso":"Oso","f10-edificio":"Torre","f11-bolsa":"Bolsita","f12-reloj-arena":"Tiempo","f13-candelabro":"Vela","f14-cartera":"Cartera","f15-bit-traje":"Bit Ejecutivo"}
PAL = {"base": "", "oscuro": " (oscuro)", "alterno": " (alterno)"}

def archivos(tipo, cat, clave):
    d = {}
    for i, e in enumerate(EXPR, 1):
        if tipo == "categorias": d[e] = f"categorias/{cat}/{clave}_{i}-{e}.png"
        else: d[e] = f"{tipo}/{clave}/{i}-{e}.png"
    return d

grupos = []
# variantes de Bit
sets = [{"clave": k, "nombre": GV.V[k][0], "archivos": archivos("variantes", None, k)} for k in sorted(os.listdir(M + "variantes/png"))]
grupos.append({"clave": "variantes", "nombre": "Bit de colores", "sets": sets})
sets = [{"clave": k, "nombre": FIG[k], "archivos": archivos("figuras", None, k)} for k in sorted(os.listdir(M + "figuras/png"))]
grupos.append({"clave": "figuras", "nombre": "Figuras de finanzas", "sets": sets})
for cat in sorted(os.listdir(M + "categorias")):
    if not os.path.isdir(M + "categorias/" + cat): continue
    nombre, figs, bit = S.CATS[cat]
    nombres = {k: n for k, n, _, _ in figs}; nombres[bit[0]] = bit[1]
    sets = []
    for d in sorted(os.listdir(M + f"categorias/{cat}/png")):
        base, pal = d.rsplit("-", 1)
        sets.append({"clave": d, "nombre": nombres[base] + PAL[pal], "archivos": archivos("categorias", cat, d)})
    grupos.append({"clave": cat, "nombre": nombre, "sets": sets})
cat = {"version": 1, "expresiones": EXPR, "grupos": grupos}
os.makedirs(VAULT, exist_ok=True)
open(VAULT + "catalogo.json", "w", encoding="utf-8").write(json.dumps(cat, ensure_ascii=False, indent=1))

# Remotion: la carpeta de recursos es media/, las rutas son relativas a media/soyluisart/brand/mascots/
def ruta_video(tipo, cat, clave, e, i):
    return f"{tipo}/{cat}/png/{clave}/{i}-{e}.png" if tipo == "categorias" else f"{tipo}/png/{clave}/{i}-{e}.png"
idx = {}
for g in grupos:
    tipo = g["clave"] if g["clave"] in ("variantes", "figuras") else "categorias"
    for s in g["sets"]:
        idx[s["clave"] if tipo != "categorias" else s["clave"]] = {"nombre": s["nombre"], "grupo": g["nombre"],
            "rutas": {e: ruta_video(tipo, g["clave"], s["clave"], e, i) for i, e in enumerate(EXPR, 1)}}
ts = "// Generado por scratchpad/pix/catalogo.py (copia en media/soyluisart/brand/mascots/catalogo.py). No editar a mano.\n// Claves: 'lupa-base', 'bit-ia-oscuro', 'f08-toro', '01-noche'... Rutas relativas a media/soyluisart/brand/mascots/.\n"
ts += "export const MASCOT_EXPRESSIONS = " + json.dumps(EXPR) + " as const;\nexport type MascotExpression = (typeof MASCOT_EXPRESSIONS)[number];\n"
ts += "export const MASCOTS: Record<string, { nombre: string; grupo: string; rutas: Record<MascotExpression, string> }> = " + json.dumps(idx, ensure_ascii=False, indent=1) + ";\n"
open(REPO + "/channels/soyluisart/styles/pizarra/mascotIndex.ts", "w", encoding="utf-8").write(ts)
print(len(idx), "sets;", sum(len(g["sets"]) for g in grupos), "en el catálogo;", len(grupos), "grupos")
