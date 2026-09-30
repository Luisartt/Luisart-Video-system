"""Fallback transcription when the main Whisper route (transcribe_parts.py, transformers + PyTorch) fails or is too slow.
Writes the SAME json shape: {"text", "words": [{text, start, end}], "splits": []}, so every later step works unchanged.

Usage:
  python transcribe_fallback.py <audio-or-video> <out.json> [--lang spanish|english|auto|<code>] [--backend faster-whisper|mlx] [--model <name>]

Backends (install only the one you use):
  faster-whisper  (default, Windows / macOS / Linux)  pip install faster-whisper
                  Uses the NVIDIA GPU when CUDA is available, otherwise the CPU (int8). No Metal: on a Mac it runs on the CPU.
  mlx             (macOS with Apple Silicon only, fastest on a Mac)  pip install mlx-whisper
                  Model repo default: mlx-community/whisper-large-v3-turbo (check the name on Hugging Face if it fails).
Extract audio first if you pass a video (the script does it with ffmpeg into a temp 16 kHz wav).
"""
import json
import os
import subprocess
import sys
import tempfile

LANG = {"spanish": "es", "english": "en", "portuguese": "pt", "french": "fr", "german": "de", "italian": "it", "auto": None}


def arg(name, default=None):
    return sys.argv[sys.argv.index(name) + 1] if name in sys.argv else default


def to_wav(src, tmp):
    out = os.path.join(tmp, "audio.wav")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", src, "-vn", "-ac", "1", "-ar", "16000", out], check=True)
    return out


def load_samples(wav):
    """16 kHz mono wav -> float32 array (avoids faster-whisper's own PyAV decoding, which breaks with some PyAV versions)."""
    import wave
    import numpy as np
    with wave.open(wav, "rb") as f:
        raw = f.readframes(f.getnframes())
    return np.frombuffer(raw, dtype=np.int16).astype(np.float32) / 32768.0


def run_faster(wav, lang, model):
    from faster_whisper import WhisperModel
    try:
        import ctranslate2
        cuda = ctranslate2.get_cuda_device_count() > 0
    except Exception:  # noqa: BLE001
        cuda = False
    samples = load_samples(wav)

    def go(device, compute):
        m = WhisperModel(model or "large-v3-turbo", device=device, compute_type=compute)
        segs, _info = m.transcribe(samples, language=lang, word_timestamps=True, vad_filter=True, condition_on_previous_text=False)
        words, texts = [], []
        for s in segs:  # a generator: CUDA problems (for example a missing cublas library) show up here
            texts.append(s.text.strip())
            for w in s.words or []:
                words.append({"text": w.word.strip(), "start": round(w.start, 3), "end": round(w.end, 3)})
        return words, texts

    if cuda:
        try:
            return go("cuda", "float16")
        except Exception as e:  # noqa: BLE001
            print(f"CUDA failed ({str(e)[:90]}); falling back to the CPU (int8, slower)", file=sys.stderr)
    return go("cpu", "int8")


def run_mlx(wav, lang, model):
    import mlx_whisper
    r = mlx_whisper.transcribe(wav, path_or_hf_repo=model or "mlx-community/whisper-large-v3-turbo", word_timestamps=True, language=lang)
    words, texts = [], []
    for s in r.get("segments", []):
        texts.append(s["text"].strip())
        for w in s.get("words", []):
            words.append({"text": w["word"].strip(), "start": round(w["start"], 3), "end": round(w["end"], 3)})
    return words, texts


def main():
    if len(sys.argv) < 3:
        sys.exit(__doc__)
    src, out = sys.argv[1], sys.argv[2]
    lang_arg = arg("--lang", "spanish")
    lang = LANG.get(lang_arg.lower(), lang_arg)
    backend = arg("--backend", "faster-whisper")
    with tempfile.TemporaryDirectory() as tmp:
        wav = to_wav(src, tmp)
        words, texts = (run_mlx if backend == "mlx" else run_faster)(wav, lang, arg("--model"))
    json.dump({"text": " ".join(texts), "words": words, "splits": []}, open(out, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(f"wrote {out}: {len(words)} words (backend {backend})")


if __name__ == "__main__":
    main()
