"""Probe a raw recording and recommend the format (vertical / horizontal). Read-only.

Usage:  python analizar_grabacion.py <video> [--guion guion.txt] [--plataforma short|youtube] [--json out.json]

Decision (most specific wins):
 1. --plataforma, or the script/brief naming it (YouTube / video largo -> horizontal primary;
    Short / Reel / TikTok -> vertical primary).
 2. Otherwise the recording's own orientation after rotation (portrait -> vertical primary,
    landscape -> horizontal primary).
 3. Duration over 180 s -> horizontal primary (too long for a Short).
The channel default is to deliver BOTH formats; this only chooses which one leads and is built and
checked first. A landscape recording turned into a vertical edit needs a face-tracked crop
(untested path, see luisart-editar-short pipeline.md section 1): the report says so.
"""
import argparse, json, re, subprocess, sys, os


def probe(path):
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-print_format", "json", "-show_format", "-show_streams", path],
        capture_output=True, text=True, encoding="utf-8",
    )
    if out.returncode != 0:
        sys.exit("ffprobe falló: " + out.stderr.strip())
    return json.loads(out.stdout)


def frac(s):
    try:
        a, b = s.split("/")
        return float(a) / float(b) if float(b) else 0.0
    except Exception:
        return 0.0


def rotation(v):
    for sd in v.get("side_data_list", []) or []:
        if "rotation" in sd:
            return int(round(float(sd["rotation"])))
    r = (v.get("tags") or {}).get("rotate")
    return int(r) if r else 0


def main():
    sys.stdout.reconfigure(encoding="utf-8")
    ap = argparse.ArgumentParser()
    ap.add_argument("video")
    ap.add_argument("--guion")
    ap.add_argument("--plataforma", choices=["short", "youtube"])
    ap.add_argument("--json")
    a = ap.parse_args()
    if not os.path.exists(a.video):
        sys.exit("No existe: " + a.video)

    info = probe(a.video)
    v = next((s for s in info["streams"] if s["codec_type"] == "video"), None)
    au = next((s for s in info["streams"] if s["codec_type"] == "audio"), None)
    if not v:
        sys.exit("El archivo no tiene video")
    w, h = int(v["width"]), int(v["height"])
    rot = rotation(v)
    if abs(rot) in (90, 270):
        w, h = h, w
    fps_r, fps_a = frac(v.get("r_frame_rate", "0/1")), frac(v.get("avg_frame_rate", "0/1"))
    dur = float(info["format"].get("duration") or v.get("duration") or 0)
    vfr = fps_r > 0 and fps_a > 0 and abs(fps_r - fps_a) > 0.5

    flags = []
    if min(w, h) < 720:
        flags.append(f"Resolución baja ({w}x{h}): probablemente pasó por WhatsApp. Se edita igual; conviene grabar en 1080p.")
    if vfr:
        flags.append(f"Cuadros por segundo variables ({fps_a:.2f} promedio): se convierte a 30 fps constantes al ingerir.")
    if rot:
        flags.append(f"El archivo guarda los píxeles girados {rot}°: se aplica la rotación al ingerir (no agregar transpose).")
    if not au:
        flags.append("No tiene audio: no hay voz que transcribir.")
    elif int(au.get("sample_rate", 48000)) != 48000:
        flags.append(f"Audio a {au.get('sample_rate')} Hz: se convierte a 48 kHz.")

    text = ""
    if a.guion and os.path.exists(a.guion):
        text = open(a.guion, encoding="utf-8").read().lower()
    platform = a.plataforma
    reason = None
    if platform:
        reason = f"plataforma indicada: {platform}"
    elif text:
        if re.search(r"youtube|video largo|horizontal|tutorial completo", text):
            platform, reason = "youtube", "el guion menciona YouTube / video largo / horizontal"
        elif re.search(r"\bshort\b|\breel\b|tiktok|vertical", text):
            platform, reason = "short", "el guion menciona Short / Reel / TikTok / vertical"

    if platform == "youtube":
        primary = "horizontal"
    elif platform == "short":
        primary = "vertical"
    elif dur > 180:
        primary, reason = "horizontal", f"dura {dur:.0f} s (más de 3 min no es un Short)"
    else:
        primary = "vertical" if h >= w else "horizontal"
        reason = f"la grabación es {'vertical' if h >= w else 'horizontal'} ({w}x{h})"

    recorded = "vertical" if h >= w else "horizontal"
    if primary != recorded:
        flags.append(
            f"Se grabó {recorded} pero el formato principal es {primary}: la versión {primary} sale de un recorte que sigue la cara "
            "(camino sin probar todavía; se revisa a ojo antes de entregar)."
        )

    res = {
        "archivo": os.path.abspath(a.video),
        "ancho": w, "alto": h, "rotacion": rot, "orientacion_grabada": recorded,
        "fps_promedio": round(fps_a, 3), "fps_variable": vfr, "duracion_s": round(dur, 2),
        "audio": bool(au), "formato_principal": primary,
        "entregables": ["vertical 1080x1920", "horizontal 1920x1080"] if primary == "vertical" else ["horizontal 1920x1080", "vertical 1080x1920"],
        "motivo": reason, "avisos": flags,
    }
    if a.json:
        json.dump(res, open(a.json, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(json.dumps(res, ensure_ascii=False, indent=1))


if __name__ == "__main__":
    main()
