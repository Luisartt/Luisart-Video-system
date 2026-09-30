"""Figuras de finanzas de Bit dibujadas en píxeles (32x32) con primitivas + contorno automático.
Uso: python sprites.py  -> escribe png/<clave>/<n>-<expresion>.png (256 px) y hojas por personaje."""
import os, math, copy
REPO = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..", "..", "..")).replace("\\", "/")
from PIL import Image

OUT = REPO + "/media/soyluisart/brand/mascots/figuras"
N = 32
INK = "#111111"
EXPR = ["feliz", "sorpresa", "pensando", "enojado", "guino", "sueno"]

def hexrgb(h): h = h.lstrip("#"); return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))
def mix(a, b, t):
    A, B = hexrgb(a), hexrgb(b)
    return "#%02X%02X%02X" % tuple(round(A[i] + (B[i] - A[i]) * t) for i in range(3))
lighter = lambda c, t=.32: mix(c, "#FFFFFF", t)
darker = lambda c, t=.30: mix(c, "#000000", t)

class G:
    def __init__(s): s.g = [[None] * N for _ in range(N)]
    def get(s, x, y): return s.g[y][x] if 0 <= x < N and 0 <= y < N else None
    def px(s, x, y, c):
        if 0 <= x < N and 0 <= y < N: s.g[y][x] = c
    def rect(s, x0, y0, x1, y1, c):
        for y in range(y0, y1 + 1):
            for x in range(x0, x1 + 1): s.px(x, y, c)
    def ell(s, cx, cy, rx, ry, c):
        for y in range(N):
            for x in range(N):
                if ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1: s.px(x, y, c)
    def pts(s, lst, c):
        for x, y in lst: s.px(x, y, c)
    def line(s, x0, y0, x1, y1, c):
        n = max(abs(x1 - x0), abs(y1 - y0), 1)
        for i in range(n + 1): s.px(round(x0 + (x1 - x0) * i / n), round(y0 + (y1 - y0) * i / n), c)
    def bevel(s, bases):
        """luz arriba/izquierda, sombra abajo/derecha en los bordes de los colores dados"""
        old = copy.deepcopy(s.g)
        for y in range(N):
            for x in range(N):
                c = old[y][x]
                if c in bases:
                    lt, dk = bases[c]
                    g = lambda a, b: old[b][a] if 0 <= a < N and 0 <= b < N else None
                    if g(x, y - 1) is None or g(x - 1, y) is None: s.g[y][x] = lt
                    elif g(x, y + 1) is None or g(x + 1, y) is None: s.g[y][x] = dk
    def outline(s):
        old = copy.deepcopy(s.g)
        for y in range(N):
            for x in range(N):
                if old[y][x] is None and any(0 <= x + dx < N and 0 <= y + dy < N and old[y + dy][x + dx] is not None for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))):
                    s.g[y][x] = INK
    def png(s, path, scale=8):
        im = Image.new("RGBA", (N, N), (0, 0, 0, 0))
        for y in range(N):
            for x in range(N):
                if s.g[y][x]: im.putpixel((x, y), hexrgb(s.g[y][x]) + (255,))
        im = im.resize((N * scale, N * scale), Image.NEAREST)
        os.makedirs(os.path.dirname(path), exist_ok=True); im.save(path); return im

# ---------- caras (caja de 13x7, coordenadas relativas) ----------
def rc(x, y, w, h): return [(x + i, y + j) for i in range(w) for j in range(h)]
CARA = {
    "feliz": rc(2, 1, 2, 2) + rc(9, 1, 2, 2) + [(4, 4), (8, 4), (5, 5), (6, 5), (7, 5)],
    "sorpresa": rc(2, 0, 2, 3) + rc(9, 0, 2, 3) + [(6, 4), (5, 5), (7, 5), (6, 6)],
    "pensando": rc(2, 2, 2, 2) + rc(9, 2, 2, 2) + [(8, 0), (9, 0), (10, 0), (11, 0), (5, 5), (6, 5), (7, 5)],
    "enojado": [(1, 0), (2, 0), (3, 1), (4, 1), (11, 0), (10, 0), (9, 1), (8, 1)] + rc(2, 2, 2, 2) + rc(9, 2, 2, 2) + [(5, 5), (6, 5), (7, 5), (4, 6), (8, 6)],
    "guino": rc(2, 1, 2, 2) + [(9, 2), (10, 2), (11, 2)] + [(4, 4), (8, 4), (5, 5), (6, 5), (7, 5)],
    "sueno": [(2, 2), (3, 2), (4, 2), (8, 2), (9, 2), (10, 2), (3, 3), (9, 3)] + [(6, 5), (7, 5)],
}
SIMB = {  # símbolos de 5x6 en la esquina superior derecha
    "feliz": ("#F2C231", [(2, 0), (2, 1), (0, 2), (1, 2), (2, 2), (3, 2), (4, 2), (2, 3), (2, 4)]),
    "sorpresa": ("#E5484D", [(2, 0), (2, 1), (2, 2), (2, 4)]),
    "pensando": ("#2F6BFF", [(1, 0), (2, 0), (3, 1), (3, 2), (2, 3), (2, 5)]),
    "enojado": ("#E5484D", [(0, 0), (1, 1), (2, 2), (3, 3), (4, 4), (4, 0), (3, 1), (1, 3), (0, 4)]),
    "guino": ("#F2C231", [(2, 0), (2, 1), (0, 2), (1, 2), (2, 2), (3, 2), (4, 2), (2, 3), (2, 4)]),
    "sueno": ("#7C8AA5", [(0, 0), (1, 0), (2, 0), (2, 1), (1, 2), (0, 3), (1, 3), (2, 3), (3, 3)]),
}
def cara(g, x0, y0, expr, c):
    g.pts([(x0 + x, y0 + y) for x, y in CARA[expr]], c)
def simbolo(g, expr, x0=26, y0=0):
    c, l = SIMB[expr]; g.pts([(x0 + x, y0 + y) for x, y in l], c)

# ---------- personajes: cuerpo (sin cara) -> (grid, x_cara, y_cara, color_cara, simbolo_xy) ----------
def feet(g, xs, y, c="#22283A"):
    for x in xs: g.rect(x, y, x + 3, y + 1, c)

def tarjeta():
    g = G(); card, chip = "#2A3A86", "#E2B33C"
    feet(g, (9, 20), 24); g.rect(9, 22, 12, 23, card); g.rect(20, 22, 23, 23, card)
    g.rect(3, 7, 28, 22, card); g.rect(3, 19, 28, 21, "#3B4FB0")
    g.rect(5, 10, 9, 14, chip); g.line(5, 12, 9, 12, darker(chip)); g.line(7, 10, 7, 14, darker(chip))
    g.bevel({card: (lighter(card, .28), darker(card, .35)), "#3B4FB0": ("#4D63CC", "#2A3A86")})
    g.outline(); return g, 11, 10, "#DCE6FF", (26, 0)

def toro():
    g = G(); gr = "#2F7D4A"; cream = "#F1E2C4"; sn = "#F0C8A0"
    for s_ in (0, 1):
        f = (lambda x: x) if s_ == 0 else (lambda x: 31 - x)
        for (x0, y0, x1, y1) in [(5, 7, 7, 8), (3, 5, 5, 7), (2, 3, 4, 5), (3, 1, 4, 3)]:
            g.rect(min(f(x0), f(x1)), y0, max(f(x0), f(x1)), y1, cream)
    g.rect(9, 24, 22, 28, gr); feet(g, (9, 19), 27, "#3A2A1A")
    g.ell(16, 15, 10, 8.5, gr); g.rect(3, 10, 7, 12, gr); g.rect(25, 10, 29, 12, gr)
    g.ell(16, 20, 5.5, 3.2, sn); g.pts([(14, 20), (18, 20)], "#8A4B2E"); g.pts([(16, 24), (15, 25), (17, 25), (16, 26)], "#E2B33C")
    g.pts([(15, 7), (16, 6), (17, 7), (16, 8), (16, 9)], "#7DE39A")
    g.bevel({gr: (lighter(gr, .25), darker(gr, .3)), sn: (lighter(sn, .3), darker(sn, .2))})
    g.outline(); return g, 10, 10, "#F5F8F0", (13, 0)

def oso():
    g = G(); br = "#7A3B2E"; tan = "#D9A87A"
    g.rect(9, 24, 22, 28, br); feet(g, (9, 19), 27, "#3A1E16")
    g.pts([(14, 25), (18, 25), (15, 26), (17, 26), (16, 27)], "#E5484D")
    g.ell(8, 7, 3.4, 3.4, br); g.ell(24, 7, 3.4, 3.4, br)
    g.ell(16, 15, 10, 8.5, br); g.ell(8, 7, 1.6, 1.6, tan); g.ell(24, 7, 1.6, 1.6, tan)
    g.ell(16, 20, 5, 3, tan); g.rect(15, 19, 17, 20, "#2B1710")
    g.bevel({br: (lighter(br, .25), darker(br, .3)), tan: (lighter(tan, .25), darker(tan, .2))})
    g.outline(); return g, 10, 10, "#FFE6D5", (26, 0)

def edificio():
    g = G(); b = "#33415C"; win = "#F2C231"
    feet(g, (10, 18), 28); g.rect(8, 2, 23, 27, b); g.rect(20, 2, 23, 27, "#2A3550")
    g.rect(15, 0, 16, 1, "#E5484D")
    for y in (4, 7): [g.rect(x, y, x + 1, y + 1, win) for x in (10, 13, 16, 19)]
    for y in (21, 24): [g.rect(x, y, x + 1, y + 1, win) for x in (10, 13, 16, 19)]
    g.bevel({b: (lighter(b, .25), darker(b, .3))})
    g.outline(); return g, 9, 12, win, (26, 0)

def bolsa():
    g = G(); c = "#2E7D4F"; tan = "#C9A46A"; gold = "#F2C231"
    feet(g, (10, 18), 28); g.ell(16, 18, 11, 9, c)
    g.rect(13, 6, 19, 10, c); g.rect(9, 2, 23, 5, c); g.rect(8, 3, 24, 4, c)
    g.rect(12, 9, 20, 10, tan)
    g.pts([(14, 20), (15, 20), (16, 20), (13, 21), (14, 22), (15, 22), (16, 22), (17, 22), (18, 23), (14, 24), (15, 24), (16, 24), (17, 24), (16, 19), (16, 25)], gold)
    g.bevel({c: (lighter(c, .25), darker(c, .3))})
    g.outline(); return g, 9, 12, "#E8FFE9", (26, 0)

def reloj():
    g = G(); glass = "#CFE6FF"; gold = "#C9922F"; sand = "#F2C231"
    feet(g, (10, 18), 29)
    for y in range(4, 16):  # bulbo superior
        w = 9.5 - (y - 4) * (6.5 / 11)
        g.rect(round(16 - w), y, round(15 + w), y, glass)
    g.rect(15, 16, 16, 17, glass)
    for y in range(18, 27):
        w = 1 + (y - 18) * (8.5 / 8)
        g.rect(round(16 - w), y, round(15 + w), y, glass)
    g.rect(6, 1, 25, 3, gold); g.rect(6, 27, 25, 28, gold)
    g.line(16, 14, 16, 22, sand); g.rect(11, 24, 20, 26, sand); g.rect(13, 22, 18, 23, sand)
    g.bevel({gold: (lighter(gold, .3), darker(gold, .3))})
    g.outline(); return g, 9, 6, "#1B2A4A", (27, 0)

def vela():
    g = G(); r = "#D6534F"; c = "#2FA35A"
    g.line(28, 9, 28, 11, INK); g.rect(26, 12, 30, 21, r); g.line(28, 22, 28, 24, INK)
    g.bevel({r: (lighter(r), darker(r))}); g.outline()
    g.rect(15, 1, 16, 6, INK); g.rect(15, 24, 16, 26, INK)
    feet(g, (11, 19), 27, "#154A2A"); g.rect(8, 7, 24, 23, c)
    g.bevel({c: (lighter(c, .25), darker(c, .3))}); g.outline(); return g, 10, 10, "#EFFFF3", (0, 0)

def cartera():
    g = G(); br = "#7A4A2B"; gr = "#3FA05A"
    feet(g, (9, 19), 26, "#3A2415")
    g.rect(0, 8, 4, 13, gr); g.rect(27, 8, 31, 13, gr); g.line(1, 10, 3, 10, darker(gr)); g.line(28, 10, 30, 10, darker(gr))
    g.rect(8, 4, 21, 9, gr); g.pts([(14, 5), (15, 5), (14, 6), (15, 7), (14, 7), (15, 8)], "#E8FFE9")
    g.rect(4, 9, 27, 25, br); g.rect(4, 9, 27, 11, "#9A6338")
    g.rect(24, 15, 26, 18, "#E2B33C")
    g.bevel({br: (lighter(br, .25), darker(br, .3)), gr: (lighter(gr, .3), darker(gr, .3))})
    g.outline(); return g, 8, 13, "#FFF1D6", (26, 0)

def bit_traje():
    g = G(); bl = "#2F6BFF"; sc = "#141C3A"; nv = "#1A2340"; tie = "#2F6BFF"
    g.rect(15, 3, 16, 9, INK); g.rect(14, 1, 17, 2, "#7BA5FF")
    g.rect(6, 9, 25, 21, bl); g.rect(8, 11, 23, 19, sc)
    g.rect(4, 21, 27, 28, nv); g.pts([(14, 21), (15, 22), (16, 22), (17, 21), (13, 22), (18, 22)], "#FFFFFF")
    g.rect(15, 23, 16, 27, tie); g.rect(15, 22, 16, 22, tie)
    for i in range(5): g.px(12 - i // 2, 22 + i, "#FFFFFF") ; g.px(19 + i // 2, 22 + i, "#FFFFFF")
    g.pts([(24, 24), (25, 24), (24, 25)], "#FFFFFF")
    feet(g, (9, 19), 29, "#22283A")
    g.rect(26, 26, 30, 29, "#7A4A2B"); g.rect(27, 25, 29, 25, "#C9A46A"); g.px(28, 27, "#E2B33C")
    g.bevel({bl: ("#7BA5FF", "#1F4FD1"), nv: ("#2A3556", "#101728")})
    g.outline(); return g, 9, 12, "#A9C4FF", (0, 0)

FIG = {
    "f07-tarjeta": ("Tarjetin", tarjeta), "f08-toro": ("Toro", toro), "f09-oso": ("Oso", oso), "f10-edificio": ("Torre", edificio),
    "f11-bolsa": ("Bolsita", bolsa), "f12-reloj-arena": ("Tiempo", reloj), "f13-candelabro": ("Vela", vela),
    "f14-cartera": ("Cartera", cartera), "f15-bit-traje": ("Bit Ejecutivo", bit_traje),
}

def hoja(ims, esc=1):
    w = sum(i.width for i in ims) + 16 * (len(ims) + 1)
    h = max(i.height for i in ims) + 32
    s = Image.new("RGB", (w, h), "white"); x = 16
    for i in ims: s.paste(i, (x, 16), i); x += i.width + 16
    return s

if __name__ == "__main__":
    import sys
    claves = sys.argv[1:] or list(FIG)
    todas = []
    for k in claves:
        nombre, fn = FIG[k]; ims = []
        for i, e in enumerate(EXPR):
            g, fx, fy, fc, (sx, sy) = fn()
            cara(g, fx, fy, e, fc); simbolo(g, e, sx if (sx or sy) else 26, sy)
            ims.append(g.png(f"{OUT}/png/{k}/{i+1}-{e}.png"))
        s = hoja(ims); os.makedirs(f"{OUT}/raw", exist_ok=True); s.save(f"{OUT}/raw/{k}.png"); todas.append(s)
    W = max(s.width for s in todas); H = sum(s.height for s in todas)
    c = Image.new("RGB", (W, H), "white"); y = 0
    for s in todas: c.paste(s, (0, y)); y += s.height
    c.save(f"{OUT}/contacto-diseno.png"); print("ok", c.size)
