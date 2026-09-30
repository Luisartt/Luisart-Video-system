"""Repertorio por categorías de contenido: 20 figuras (x3 paletas) + 10 Bit temáticos (x2 paletas).
python sprites2.py [categoria...]  -> categorias/<cat>/png/<fig>-<pal>/<n>-<expr>.png + raw/<fig>-<pal>.png + contacto.png"""
import os, sys, colorsys
REPO = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..", "..", "..")).replace("\\", "/")
from PIL import Image
sys.path.insert(0, os.path.dirname(__file__))
from sprites import G, cara, simbolo, EXPR, INK, hexrgb, mix, lighter, darker, feet, hoja

OUT = REPO + "/media/soyluisart/brand/mascots/categorias"

def poly(g, pts, c):
    n = len(pts)
    for y in range(32):
        for x in range(32):
            px, py, inside, j = x + .5, y + .5, False, n - 1
            for i in range(n):
                xi, yi, xj, yj = pts[i][0], pts[i][1], pts[j][0], pts[j][1]
                if (yi > py) != (yj > py) and px < (xj - xi) * (py - yi) / (yj - yi) + xi: inside = not inside
                j = i
            if inside: g.px(x, y, c)

def luma(c): r, gg, b = hexrgb(c); return .299 * r + .587 * gg + .114 * b
def contraste(c): return "#141826" if luma(c) > 140 else "#F2F6FF"
def girar(c, dh, ds=1.0, dv=1.0):
    r, gg, b = [v / 255 for v in hexrgb(c)]; h, s, v = colorsys.rgb_to_hsv(r, gg, b)
    r, gg, b = colorsys.hsv_to_rgb((h + dh) % 1, min(1, s * ds), min(1, v * dv))
    return "#%02X%02X%02X" % (round(r * 255), round(gg * 255), round(b * 255))

def paletas(p):
    """3 paletas por figura: base, oscuro (cuerpo casi negro) y alterno (matiz girado)"""
    osc = dict(p); osc["m"] = mix(p["m"], "#0E1322", .68); osc["s"] = mix(p["s"], "#0E1322", .45)
    alt = dict(p); alt["m"] = girar(p["m"], .55, .9); alt["s"] = girar(p["s"], .55, .9)
    return [("base", p), ("oscuro", osc), ("alterno", alt)]

BEV = lambda c: (lighter(c, .25), darker(c, .3))

# ---------------- figuras (p: m principal, s secundario, a acento) -> g, fx, fy, superficie de la cara, símbolo ----------------
def lupa(p):
    g = G(); glass = "#DCEBFF"
    for i in range(7): g.rect(23 + i, 21 + i, 25 + i, 23 + i, p["s"])
    g.rect(29, 27, 31, 29, p["a"])
    g.ell(16, 14, 11, 11, p["m"]); g.ell(16, 14, 8.6, 8.6, glass)
    feet(g, (7, 14), 26, "#22283A")
    g.pts([(11, 8), (12, 7), (13, 7)], "#FFFFFF")
    g.bevel({p["m"]: BEV(p["m"]), p["s"]: BEV(p["s"])}); g.outline(); return g, 10, 11, glass, (26, 0)

def canasta(p):
    g = G(); egg = "#FFF3DA"
    g.rect(7, 5, 24, 6, p["s"]); g.rect(7, 5, 8, 13, p["s"]); g.rect(23, 5, 24, 13, p["s"])
    g.ell(11, 12, 3.2, 3.4, egg); g.ell(16, 11, 3.2, 3.8, egg); g.ell(21, 12, 3.2, 3.4, egg)
    g.rect(5, 14, 26, 26, p["m"]); g.line(5, 19, 26, 19, darker(p["m"], .25)); g.line(5, 24, 26, 24, darker(p["m"], .25))
    for x in range(7, 26, 4): g.line(x, 14, x, 26, darker(p["m"], .15))
    g.pts([(11, 10), (17, 8)], a := p["a"]) if False else None
    feet(g, (9, 19), 27, "#3A2415")
    g.bevel({p["m"]: BEV(p["m"])}); g.outline(); return g, 9, 16, "#F3E2C0", (26, 0)

def _face_plate(g, x0, y0, x1, y1, c): g.rect(x0, y0, x1, y1, c)

def pastel(p):
    g = G()
    g.ell(14, 17, 10.6, 10.6, p["m"])
    for y in range(32):
        for x in range(32):
            if ((x - 17) ** 2 + (y - 14) ** 2) <= 10.6 ** 2 and x > 17 and y < 14: g.px(x, y, p["a"])
    for y in range(32):
        for x in range(32):
            if ((x - 14) ** 2 + (y - 17) ** 2) <= 10.6 ** 2 and x > 14 and y < 17 and ((x - 17) ** 2 + (y - 14) ** 2) > 10.6 ** 2: g.px(x, y, None)
    feet(g, (7, 17), 27, "#22283A")
    g.bevel({p["m"]: BEV(p["m"]), p["a"]: BEV(p["a"])}); g.outline(); return g, 8, 14, p["m"], (26, 0)

def factura(p):
    g = G(); paper = "#FBFBF6"
    pts = [(7, 2), (24, 2), (24, 25), (22, 27), (20, 25), (18, 27), (16, 25), (14, 27), (12, 25), (10, 27), (8, 25), (7, 26)]
    poly(g, [(x, y) for x, y in [(7, 2), (25, 2), (25, 26)] + [(25 - i * 2.25, 26 + (1.2 if i % 2 == 0 else 0)) for i in range(1, 9)] + [(7, 26)]], paper)
    g.rect(7, 2, 24, 5, p["m"]); g.line(9, 7, 20, 7, "#B8BFCC"); g.line(9, 9, 16, 9, "#B8BFCC")
    g.rect(9, 22, 22, 23, p["a"])
    feet(g, (9, 19), 27, "#22283A")
    g.bevel({p["m"]: BEV(p["m"])}); g.outline(); return g, 9, 12, paper, (26, 0)

def termometro(p):
    g = G(); glass = "#EAF3FF"
    g.rect(12, 1, 19, 14, glass); g.rect(14, 5, 17, 15, p["m"])
    for y in (3, 6, 9, 12): g.line(21, y, 24, y, p["s"])
    g.ell(16, 20, 9.5, 8.5, p["m"])
    feet(g, (10, 19), 28, "#22283A")
    g.bevel({p["m"]: BEV(p["m"])}); g.outline(); return g, 10, 16, p["m"], (24, 0)

def globo(p):
    g = G(); land = p["a"]
    g.ell(16, 15, 12.5, 12.5, p["m"])
    g.ell(8, 9, 4, 3, land); g.ell(24, 19, 4, 4, land); g.ell(21, 6, 3, 2, land); g.ell(8, 22, 3, 2.5, land)
    feet(g, (9, 19), 28, "#22283A")
    g.bevel({p["m"]: BEV(p["m"])}); g.outline(); return g, 10, 12, p["m"], (27, 0)

def dado(p):
    g = G(); white = p["m"]
    g.rect(4, 4, 27, 26, white)
    for x, y in ((6, 6), (24, 6), (6, 23), (24, 23)): g.rect(x, y, x + 1, y + 1, p["a"])
    feet(g, (8, 20), 27, "#22283A")
    g.bevel({white: BEV(white)}); g.outline(); return g, 9, 11, white, (26, 0)

def contrato(p):
    g = G(); cream = p["m"]
    g.rect(7, 4, 24, 24, cream); g.rect(5, 1, 26, 4, p["s"]); g.rect(5, 24, 26, 27, p["s"])
    g.line(9, 6, 22, 6, "#B8A98A"); g.line(9, 8, 17, 8, "#B8A98A")
    g.ell(20, 21, 2.4, 2.4, p["a"]); g.line(9, 22, 15, 22, "#8A7A5A")
    feet(g, (9, 19), 28, "#22283A")
    g.bevel({cream: BEV(cream), p["s"]: BEV(p["s"])}); g.outline(); return g, 9, 10, cream, (26, 0)

def etiqueta(p):
    g = G()
    poly(g, [(6, 8), (25, 8), (27, 10), (27, 25), (5, 25), (5, 10)], p["m"])
    g.ell(16, 12, 1.8, 1.8, None) if False else None
    g.rect(15, 10, 16, 11, "#FFFFFF")
    g.line(16, 8, 16, 3, p["s"]); g.line(16, 3, 22, 1, p["s"])
    g.pts([(22, 22), (23, 21), (24, 20), (22, 20), (24, 22)], p["a"])
    feet(g, (8, 20), 26, "#22283A")
    g.bevel({p["m"]: BEV(p["m"])}); g.outline(); return g, 9, 13, p["m"], (26, 0)

def embudo(p):
    g = G()
    poly(g, [(2, 4), (29, 4), (18, 18), (18, 23), (13, 23), (13, 18)], p["m"])
    g.rect(2, 3, 29, 5, p["s"])
    g.pts([(15, 26), (16, 26), (15, 27), (16, 27)], p["a"]); g.pts([(11, 27)], p["a"]); g.pts([(20, 26)], p["a"])
    g.bevel({p["m"]: BEV(p["m"]), p["s"]: BEV(p["s"])}); g.outline(); return g, 9, 6, p["m"], (26, 8)

def foco(p):
    g = G(); glass = p["m"]
    g.ell(16, 12, 10.5, 10.5, glass)
    g.rect(12, 21, 19, 26, p["s"]); g.line(12, 23, 19, 23, darker(p["s"], .3)); g.rect(14, 27, 17, 28, p["s"])
    g.pts([(9, 8), (10, 6), (11, 5)], lighter(glass, .6))
    feet(g, (9, 20), 27, "#22283A") if False else None
    g.bevel({glass: BEV(glass), p["s"]: BEV(p["s"])}); g.outline(); return g, 10, 9, glass, (26, 0)

def ajedrez(p):
    g = G()
    g.rect(7, 5, 24, 24, p["m"])
    for x0 in (7, 13, 19): g.rect(x0, 2, x0 + 3 if x0 < 19 else 24, 5, p["m"])
    g.rect(5, 24, 26, 27, p["s"])
    feet(g, (8, 20), 28, "#22283A")
    g.bevel({p["m"]: BEV(p["m"]), p["s"]: BEV(p["s"])}); g.outline(); return g, 9, 10, p["m"], (26, 0)

def trofeo(p):
    g = G()
    for cx in (4, 27): g.ell(cx, 9, 3.2, 4, p["s"]); g.ell(cx, 9, 1.4, 2.2, None)
    poly(g, [(6, 3), (25, 3), (23, 17), (19, 19), (12, 19), (8, 17)], p["m"])
    g.rect(14, 19, 17, 23, p["s"]); g.rect(10, 23, 21, 26, p["s"])
    g.pts([(15, 14), (16, 13), (17, 14), (16, 15), (16, 12), (16, 16)], p["a"])
    feet(g, (9, 20), 27, "#22283A")
    g.bevel({p["m"]: BEV(p["m"]), p["s"]: BEV(p["s"])}); g.outline(); return g, 10, 5, p["m"], (0, 0)

def brujula(p):
    g = G()
    g.ell(16, 15, 12.5, 12.5, p["s"]); g.ell(16, 15, 10, 10, p["m"])
    g.rect(15, 3, 16, 4, p["a"]); g.rect(15, 26, 16, 27, "#FFFFFF"); g.rect(3, 14, 4, 15, "#FFFFFF"); g.rect(27, 14, 28, 15, "#FFFFFF")
    poly(g, [(16, 5), (18, 10), (14, 10)], p["a"])
    feet(g, (9, 19), 28, "#22283A") if False else None
    g.bevel({p["s"]: BEV(p["s"])}); g.outline(); return g, 10, 12, p["m"], (26, 0)

def engrane(p):
    g = G()
    for (x0, y0, x1, y1) in [(14, 1, 17, 4), (14, 26, 17, 29), (1, 13, 4, 16), (27, 13, 30, 16), (24, 4, 27, 7), (4, 4, 7, 7), (24, 23, 27, 26), (4, 23, 7, 26)]: g.rect(x0, y0, x1, y1, p["s"])
    g.ell(15.5, 14.5, 12, 12, p["m"])
    g.bevel({p["m"]: BEV(p["m"]), p["s"]: BEV(p["s"])}); g.outline(); return g, 9, 12, p["m"], (0, 0)

def estrella(p):
    import math
    g = G(); pts = []
    for i in range(10):
        r = 15 if i % 2 == 0 else 8.8; a = -math.pi / 2 + i * math.pi / 5
        pts.append((16 + r * math.cos(a), 16.5 + r * math.sin(a)))
    poly(g, pts, p["m"]);
    g.bevel({p["m"]: BEV(p["m"])}); g.outline(); return g, 9, 13, p["m"], (26, 0)

def chip(p):
    g = G()
    g.rect(7, 7, 24, 24, p["m"])
    for v in (10, 14, 18, 22):
        g.rect(v, 3, v + 1, 6, p["s"]); g.rect(v, 25, v + 1, 28, p["s"]); g.rect(3, v, 6, v + 1, p["s"]); g.rect(25, v, 28, v + 1, p["s"])
    g.pts([(9, 9), (10, 9), (11, 9), (9, 10), (9, 11)], p["a"]); g.pts([(22, 22), (21, 22), (20, 22), (22, 21), (22, 20)], p["a"])
    g.bevel({p["m"]: BEV(p["m"])}); g.outline(); return g, 9, 12, p["m"], (26, 0)

def nube(p):
    g = G()
    g.ell(9, 17, 7, 6, p["m"]); g.ell(17, 12, 8.5, 8.5, p["m"]); g.ell(24, 18, 6.5, 5.5, p["m"]); g.rect(8, 17, 25, 23, p["m"])
    feet(g, (10, 19), 24, "#22283A")
    g.pts([(8, 27), (9, 28)], p["a"]) if False else None
    g.bevel({p["m"]: BEV(p["m"])}); g.outline(); return g, 9, 11, p["m"], (26, 0)

def nopal(p):
    g = G()
    g.ell(23, 6, 4.5, 4.8, p["m"]); g.ell(16, 15, 10.5, 11, p["m"])
    g.ell(23, 3, 1.6, 1.4, p["a"])
    for x, y in [(9, 8), (23, 12), (12, 22), (21, 23), (7, 16), (25, 17), (21, 4), (24, 8)]: g.px(x, y, lighter(p["m"], .55))
    g.rect(9, 25, 22, 29, p["s"]); g.rect(8, 25, 23, 26, darker(p["s"], .1))
    g.bevel({p["m"]: BEV(p["m"]), p["s"]: BEV(p["s"])}); g.outline(); return g, 10, 11, p["m"], (0, 0)

def chile(p):
    g = G()
    g.rect(14, 4, 18, 6, p["s"]); g.pts([(17, 3), (18, 3), (19, 4), (19, 5)], p["s"]); g.rect(13, 5, 19, 6, p["s"])
    g.ell(16, 16, 9.5, 10.5, p["m"])
    poly(g, [(9, 22), (23, 22), (17, 29), (15, 29)], p["m"])
    g.bevel({p["m"]: BEV(p["m"]), p["s"]: BEV(p["s"])}); g.outline(); return g, 10, 12, p["m"], (26, 0)

# ---------------- Bit temático ----------------
def bit_base(m, acc):
    g = G(); sc = "#141C3A"
    g.rect(15, 3, 16, 8, INK); g.rect(14, 1, 17, 2, lighter(m, .5))
    g.rect(6, 8, 25, 24, m); g.rect(8, 10, 23, 21, sc)
    g.pts([(21, 23), (22, 23)], "#3DDC84"); g.pts([(24, 23)], "#FFB020")
    feet(g, (9, 19), 25, "#22283A")
    return g

def bit_cat(clave, m, acc_fn):
    g = bit_base(m, None)
    acc_fn(g, m)
    g.bevel({m: BEV(m)}); g.outline()
    return g, 9, 12, "#141C3A", (26, 0)

def acc_analista(g, m):
    for i, h in enumerate((2, 3, 4)): g.rect(8 + i * 3, 24 - h, 9 + i * 3, 23, "#3DDC84")
def acc_auditor(g, m):
    g.rect(5, 5, 26, 7, "#2E9E5B"); g.rect(9, 3, 22, 5, "#2E9E5B"); g.rect(26, 18, 30, 27, "#C9A46A"); g.rect(27, 17, 29, 18, "#7C8AA5"); g.line(27, 21, 29, 21, "#FFFFFF"); g.line(27, 23, 29, 23, "#FFFFFF")
def acc_economista(g, m):
    poly(g, [(9, 22), (14, 24), (9, 26)], "#E5484D"); poly(g, [(19, 22), (14, 24), (19, 26)], "#E5484D"); g.rect(13, 23, 14, 25, "#B3272C")
def acc_riesgo(g, m):
    for x in range(6, 26):
        if (x // 2) % 2 == 0: g.rect(x, 22, x, 24, "#F2C231")
        else: g.rect(x, 22, x, 24, INK)
def acc_vendedor(g, m):
    g.rect(3, 12, 5, 17, "#22283A"); g.line(4, 18, 6, 20, "#22283A"); g.rect(6, 19, 8, 20, "#E5484D")
    g.rect(26, 15, 30, 22, "#E5484D"); g.pts([(27, 17), (29, 20), (28, 18), (28, 19)], "#FFFFFF")
def acc_estratega(g, m):
    g.rect(17, 0, 22, 3, "#E5484D"); g.rect(16, 0, 16, 8, INK)
def acc_lider(g, m):
    poly(g, [(9, 8), (9, 3), (12, 6), (16, 2), (20, 6), (23, 3), (23, 8)], "#F2C231"); g.rect(9, 7, 23, 8, "#E2A81F")
def acc_nivel5(g, m):
    for x, y in [(15, 0), (16, 0), (14, 1), (15, 1), (16, 1), (17, 1), (15, 2), (16, 2)]: g.px(x, y, "#F2C231")
    g.rect(8, 22, 9, 23, "#F2C231"); g.rect(11, 22, 12, 23, "#F2C231")
def acc_ia(g, m):
    for y in (11, 15, 19): g.rect(3, y, 5, y + 1, "#E2B33C"); g.rect(26, y, 28, y + 1, "#E2B33C")
    g.rect(14, 0, 17, 1, "#7DF9FF"); g.pts([(11, 22), (12, 22), (13, 22), (13, 23)], "#7DF9FF")
def acc_mexa(g, m):
    g.rect(6, 22, 11, 24, "#0B8A43"); g.rect(12, 22, 19, 24, "#FFFFFF"); g.rect(20, 22, 25, 24, "#CE1126")
    g.rect(2, 7, 29, 8, "#D8B36A"); g.rect(10, 3, 21, 6, "#D8B36A"); g.rect(10, 5, 21, 5, "#CE1126")


# ---------------- Bolsa de valores y CFA ----------------
FONT = {"C": ["111", "100", "100", "100", "111"], "F": ["111", "100", "110", "100", "100"], "A": ["010", "101", "111", "101", "101"]}
def letras(g, x, y, s, c):
    for k, ch in enumerate(s):
        for j, row in enumerate(FONT[ch]):
            for i, v in enumerate(row):
                if v == "1": g.px(x + k * 4 + i, y + j, c)

def campana(p):
    g = G()
    g.rect(14, 1, 17, 3, p["s"]); g.ell(16, 13, 8.5, 9.5, p["m"])
    poly(g, [(7, 16), (25, 16), (28, 24), (4, 24)], p["m"]); g.rect(3, 23, 28, 25, p["s"])
    g.ell(16, 28, 2.6, 2.4, p["a"])
    g.bevel({p["m"]: BEV(p["m"]), p["s"]: BEV(p["s"])}); g.outline(); return g, 10, 11, p["m"], (26, 0)

def certificado(p):
    g = G(); paper = p["m"]
    g.rect(4, 4, 27, 25, paper); g.rect(4, 4, 27, 5, p["s"]); g.rect(4, 24, 27, 25, p["s"]); g.rect(4, 4, 5, 25, p["s"]); g.rect(26, 4, 27, 25, p["s"])
    g.line(9, 7, 22, 7, p["s"]); g.line(11, 9, 20, 9, p["s"])
    g.ell(23, 21, 2.6, 2.6, p["a"]); g.pts([(22, 23), (24, 23), (22, 24), (24, 24)], p["a"])
    feet(g, (9, 19), 26, "#22283A")
    g.bevel({paper: BEV(paper)}); g.outline(); return g, 9, 12, paper, (0, 0)

def pantalla(p):
    g = G()
    g.rect(2, 4, 29, 24, p["m"]); g.rect(14, 25, 17, 27, p["s"]); g.rect(9, 28, 22, 29, p["s"])
    for x, up in ((4, True), (11, False), (18, True), (25, False)):
        c = "#3DDC84" if up else "#E5484D"
        pts = [(x + 1, 20), (x, 21), (x + 1, 21), (x + 2, 21)] if up else [(x, 20), (x + 1, 20), (x + 2, 20), (x + 1, 21)]
        g.pts(pts, c); g.pts([(x, 22), (x + 1, 22), (x + 2, 22)], c)
    g.bevel({p["m"]: BEV(p["m"]), p["s"]: BEV(p["s"])}); g.outline(); return g, 9, 8, p["m"], (26, 0) if False else (0, 0)

def templo(p):
    g = G()
    poly(g, [(2, 12), (16, 2), (29, 12)], p["m"]); g.rect(3, 12, 28, 13, p["s"])
    g.rect(5, 14, 26, 24, p["m"])
    for x in (5, 6): g.rect(x, 14, x, 24, p["s"])
    for x in (25, 26): g.rect(x, 14, x, 24, p["s"])
    g.rect(3, 25, 28, 26, p["s"]); g.rect(15, 5, 16, 6, p["a"]); g.rect(14, 8, 17, 9, p["a"])
    feet(g, (9, 19), 27, "#22283A")
    g.bevel({p["m"]: BEV(p["m"]), p["s"]: BEV(p["s"])}); g.outline(); return g, 9, 15, p["m"], (0, 0)

def libro_cfa(p):
    g = G()
    g.rect(6, 3, 25, 26, p["m"]); g.rect(6, 3, 8, 26, p["s"]); g.rect(7, 27, 25, 28, "#F4EFE0")
    letras(g, 12, 5, "CFA", p["a"])
    feet(g, (9, 19), 29, "#22283A")
    g.bevel({p["m"]: BEV(p["m"]), p["s"]: BEV(p["s"])}); g.outline(); return g, 10, 12, p["m"], (0, 0)

def birrete(p):
    g = G()
    g.rect(8, 11, 23, 23, p["m"]); poly(g, [(16, 2), (30, 8), (16, 13), (2, 8)], p["s"])
    g.line(28, 8, 28, 13, p["a"]); g.rect(27, 13, 29, 15, p["a"])
    feet(g, (9, 19), 24, "#22283A")
    g.bevel({p["m"]: BEV(p["m"]), p["s"]: BEV(p["s"])}); g.outline(); return g, 10, 14, p["m"], (0, 0)

def medalla(p):
    g = G()
    poly(g, [(8, 1), (14, 1), (20, 12), (14, 12)], p["a"]); poly(g, [(24, 1), (18, 1), (12, 12), (18, 12)], p["s"])
    g.ell(16, 19, 10.5, 10.5, p["m"]); g.ell(16, 19, 8.6, 8.6, lighter(p["m"], .25))
    g.pts([(16, 11), (15, 12), (16, 12), (17, 12), (16, 13)], darker(p["m"], .4))
    g.bevel({p["m"]: BEV(p["m"])}); g.outline(); return g, 10, 16, lighter(p["m"], .25), (26, 0)

def calculadora(p):
    g = G(); lcd = "#C9E8B4"
    g.rect(6, 2, 25, 28, p["m"]); g.rect(8, 4, 23, 14, lcd)
    for j, y in enumerate((17, 20, 23, 26)):
        for x in (8, 12, 16, 20): g.rect(x, y, x + 2, y + 1, p["a"] if j == 0 else "#E8ECF4")
    feet(g, (9, 19), 29, "#22283A")
    g.bevel({p["m"]: BEV(p["m"])}); g.outline(); return g, 9, 6, lcd, (26, 0)

def acc_corredor(g, m):
    g.rect(26, 11, 30, 21, "#22283A"); g.rect(25, 12, 26, 20, "#22283A"); g.rect(27, 12, 29, 13, "#7C8AA5")
    g.rect(7, 22, 11, 23, "#FFFFFF"); g.rect(26, 2, 30, 8, "#FFFFFF"); g.line(27, 4, 29, 4, "#B8BFCC"); g.line(27, 6, 29, 6, "#B8BFCC")
def acc_cfa(g, m):
    g.rect(15, 3, 16, 8, INK); poly(g, [(16, 0), (28, 4), (16, 8), (4, 4)], "#141826"); g.rect(11, 4, 21, 8, "#141826")
    g.line(27, 4, 27, 9, "#F2C231"); g.rect(26, 9, 28, 10, "#F2C231")

# categoría -> (nombre ES, [(clave figura, nombre, fn, paleta base)], (clave bit, nombre, acc, color, color oscuro))
CATS = {
 "01-inversion-mercados": ("Inversión y mercados", [("lupa", "Lupa", lupa, dict(m="#2F6BFF", s="#8A4B2E", a="#E5484D")), ("canasta", "Canasta de huevos (diversificar)", canasta, dict(m="#B9803E", s="#8A5A2B", a="#FFFFFF"))], ("bit-analista", "Bit Analista", acc_analista, "#2F6BFF")),
 "02-finanzas-empresa": ("Finanzas de la empresa", [("pastel", "Gráfica de pastel", pastel, dict(m="#7B4FD6", s="#5A34B0", a="#F2C231")), ("factura", "Factura", factura, dict(m="#2F6BFF", s="#1F4FD1", a="#3DDC84"))], ("bit-auditor", "Bit Auditor", acc_auditor, "#1F8A70")),
 "03-economia": ("Economía y macroeconomía", [("termometro", "Termómetro de inflación", termometro, dict(m="#E5484D", s="#3A3F4B", a="#FFFFFF")), ("globo", "Globo terráqueo", globo, dict(m="#2F8DE8", s="#1F4FD1", a="#3DBE6B"))], ("bit-economista", "Bit Economista", acc_economista, "#3D5AFE")),
 "04-derivados-credito": ("Derivados y crédito", [("dado", "Dado de riesgo", dado, dict(m="#F4F1E8", s="#3A3F4B", a="#E5484D")), ("contrato", "Contrato", contrato, dict(m="#F3E2B8", s="#B8863B", a="#E5484D"))], ("bit-riesgo", "Bit Riesgo", acc_riesgo, "#8A5CF6")),
 "05-marketing-ventas": ("Marketing y ventas", [("etiqueta", "Etiqueta de oferta", etiqueta, dict(m="#F2762E", s="#3A3F4B", a="#FFFFFF")), ("embudo", "Embudo de ventas", embudo, dict(m="#2F6BFF", s="#1F4FD1", a="#F2C231"))], ("bit-vendedor", "Bit Vendedor", acc_vendedor, "#F2762E")),
 "06-estrategia-negocio": ("Estrategia y negocio", [("foco", "Foco de ideas", foco, dict(m="#F2C231", s="#7C8AA5", a="#FFFFFF")), ("ajedrez", "Torre de ajedrez", ajedrez, dict(m="#3A3F4B", s="#22283A", a="#F2C231"))], ("bit-estratega", "Bit Estratega", acc_estratega, "#2F6BFF")),
 "07-liderazgo-talento": ("Liderazgo y talento", [("trofeo", "Trofeo", trofeo, dict(m="#F2C231", s="#C9922F", a="#E5484D")), ("brujula", "Brújula", brujula, dict(m="#F3E7CF", s="#8A5A2B", a="#E5484D"))], ("bit-lider", "Bit Líder", acc_lider, "#B0262B")),
 "08-de-bueno-a-excelente": ("De bueno a excelente", [("engrane", "Engrane (volante de inercia)", engrane, dict(m="#7C8AA5", s="#5B6680", a="#F2C231")), ("estrella", "Estrella", estrella, dict(m="#F2C231", s="#C9922F", a="#FFFFFF"))], ("bit-nivel5", "Bit Nivel 5", acc_nivel5, "#2F6BFF")),
 "09-tecnologia-ia": ("Tecnología, IA y productividad", [("chip", "Chip de IA", chip, dict(m="#4B2EA6", s="#E2B33C", a="#7DF9FF")), ("nube", "Nube de datos", nube, dict(m="#BFD9FF", s="#7BA5FF", a="#FFFFFF"))], ("bit-ia", "Bit IA", acc_ia, "#7C4DFF")),
 "10-sistema-financiero-mx": ("Sistema financiero mexicano", [("nopal", "Nopal", nopal, dict(m="#2E9E5B", s="#B9673A", a="#E5484D")), ("chile", "Chilito", chile, dict(m="#D6262B", s="#2E9E5B", a="#FFFFFF"))], ("bit-mexa", "Bit Mexicano", acc_mexa, "#0B8A43")),
 "11-bolsa-de-valores": ("Bolsa de valores", [("campana", "Campana de apertura", campana, dict(m="#F2C231", s="#C9922F", a="#E5484D")), ("certificado", "Certificado de acción", certificado, dict(m="#F3E9CC", s="#2E7D4F", a="#E5484D")), ("pantalla", "Pantalla de precios", pantalla, dict(m="#0F1626", s="#5B6680", a="#3DDC84")), ("templo", "Edificio de la bolsa", templo, dict(m="#DAD6C8", s="#9A9583", a="#2F6BFF"))], ("bit-corredor", "Bit Corredor", acc_corredor, "#F2762E")),
 "12-cfa": ("CFA", [("libro", "Libro del currículo CFA", libro_cfa, dict(m="#1F4FD1", s="#12308A", a="#F2C231")), ("birrete", "Birrete", birrete, dict(m="#22283A", s="#3A4258", a="#F2C231")), ("medalla", "Medalla del Charter", medalla, dict(m="#F2C231", s="#E5484D", a="#2F6BFF")), ("calculadora", "Calculadora financiera", calculadora, dict(m="#2A3346", s="#7C8AA5", a="#F2762E"))], ("bit-cfa", "Bit CFA", acc_cfa, "#1F4FD1")),
}

def hacer(cat):
    nombre, figs, bit = CATS[cat]
    filas = []; resumen = []
    base = f"{OUT}/{cat}"
    def sets():
        for k, nom, fn, pal in figs:
            for pn, pp in paletas(pal): yield f"{k}-{pn}", nom, (lambda pp=pp, fn=fn: fn(pp))
        bk, bn, acc, col = bit
        for pn, colr in (("base", col), ("oscuro", mix(col, "#0E1322", .7))):
            yield f"{bk}-{pn}", bn, (lambda c=colr, a=acc, b=bk: bit_cat(b, c, a))
    for clave, nom, mk in sets():
        ims = []
        for i, e in enumerate(EXPR):
            g, fx, fy, surf, (sx, sy) = mk()
            cara(g, fx, fy, e, contraste(surf)); simbolo(g, e, sx, sy)
            ims.append(g.png(f"{base}/png/{clave}/{i+1}-{e}.png"))
        s = hoja(ims); os.makedirs(f"{base}/raw", exist_ok=True); s.save(f"{base}/raw/{clave}.png"); filas.append(s)
        resumen.append((clave, nom))
    W = max(s.width for s in filas); H = sum(s.height for s in filas)
    c = Image.new("RGB", (W, H), "white"); y = 0
    for s in filas: c.paste(s, (0, y)); y += s.height
    c.save(f"{base}/contacto.png"); return resumen

if __name__ == "__main__":
    for cat in (sys.argv[1:] or CATS): print(cat, len(hacer(cat)))
