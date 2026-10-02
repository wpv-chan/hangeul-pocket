"""Generate the authored vocabulary audio with Piper ko_KR-kss-medium.

Run in a temporary Python environment with piper-tts installed. Model/config
paths are explicit arguments; the model is not shipped to users. macOS
afconvert encodes AAC playable by Safari and Chrome. See audio/README.md.
"""
import json
import subprocess
import sys
import tempfile
import wave
from pathlib import Path

from piper import PiperVoice

root = Path(__file__).resolve().parents[1]
voice = PiperVoice.load(sys.argv[1], config_path=sys.argv[2])
entries = json.loads((root / "audio/sources.json").read_text())
with tempfile.TemporaryDirectory() as scratch:
    for index, entry in enumerate(entries):
        target = root / "audio" / (entry["file"] + ".m4a")
        if target.exists() and target.stat().st_size > 1024:
            continue
        wav = Path(scratch) / "sample.wav"
        with wave.open(str(wav), "wb") as output:
            voice.synthesize_wav(entry["text"], output)
        subprocess.run(["afconvert", str(wav), str(target), "-f", "m4af", "-d", "aac ", "-b", "48000"], check=True)
        if index % 100 == 0:
            print(f"Generated {index + 1}/{len(entries)}", flush=True)
print(f"Complete: {len(entries)} audio clips", flush=True)
