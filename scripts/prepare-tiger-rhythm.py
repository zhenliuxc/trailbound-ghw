"""Prepare the pinned CC0 harp recordings; no playback or gameplay validation."""
from pathlib import Path
import array
import hashlib
import json
import math
import sys
import urllib.parse
import urllib.request
import wave

ROOT = Path(__file__).resolve().parents[1]
COMMIT = '440300901dfe9275fd84e0b7763af1f8443ae62e'
BASE = f'https://raw.githubusercontent.com/sgossner/VSCO-2-CE/{COMMIT}/'
SOURCE = ROOT / '.local/source-audio/tiger-rhythm-v5'
OUTPUT = ROOT / 'dist/audio/tiger-rhythm-v5'
SOURCE.mkdir(parents=True, exist_ok=True)
OUTPUT.mkdir(parents=True, exist_ok=True)

def fetch(relative):
    local = SOURCE / Path(relative).name
    if not local.exists():
        request = urllib.request.Request(BASE + urllib.parse.quote(relative), headers={'User-Agent': 'Trailbound-assets'})
        local.write_bytes(urllib.request.urlopen(request, timeout=60).read())
    return local

license_file = fetch('LICENSE')
(OUTPUT / 'VSCO-CC0.txt').write_bytes(license_file.read_bytes())
items = []
for note in ['C3', 'G3', 'D4', 'C5']:
    name = f'KSHarp_{note}_mf.wav'
    relative = f'Strings/Harp/{name}'
    source = fetch(relative)
    with wave.open(str(source), 'rb') as wav:
        channels, width, rate = wav.getnchannels(), wav.getsampwidth(), wav.getframerate()
        if width not in [2, 3, 4]:
            raise ValueError('Unsupported source sample format')
        raw = wav.readframes(min(wav.getnframes(), rate * 7))
    values = []
    for start in range(0, len(raw), width * channels):
        values.append(sum(int.from_bytes(raw[start+c*width:start+(c+1)*width], 'little', signed=True) for c in range(channels)) / channels / (2 ** (width * 8 - 1)))
    onset = next((i for i, value in enumerate(values) if abs(value) > .0015), 0)
    values = values[max(0, onset - int(rate * .002)):]
    count = min(int(len(values) / rate * 22050), 5 * 22050)
    peak = max(abs(value) for value in values) or 1
    gain = min(4, .75 / peak)
    pcm = array.array('h')
    for i in range(count):
        position = i * rate / 22050
        low = min(len(values) - 1, int(position)); high = min(len(values) - 1, low + 1)
        value = values[low] + (values[high] - values[low]) * (position - low)
        envelope = min(1, i / 44, (count - 1 - i) / 11025)
        pcm.append(max(-32768, min(32767, round(value * gain * envelope * 32767))))
    if sys.byteorder != 'little':
        pcm.byteswap()
    target = OUTPUT / f'harp-{note.lower()}.wav'
    with wave.open(str(target), 'wb') as wav:
        wav.setnchannels(1); wav.setsampwidth(2); wav.setframerate(22050); wav.writeframes(pcm.tobytes())
    items.append({'note': note, 'file': f'audio/tiger-rhythm-v5/{target.name}', 'source': BASE + urllib.parse.quote(relative), 'sourceSha256': hashlib.sha256(source.read_bytes()).hexdigest(), 'sha256': hashlib.sha256(target.read_bytes()).hexdigest(), 'bytes': target.stat().st_size, 'seconds': count / 22050})

(OUTPUT / 'credits.json').write_text(json.dumps({
    'generator': 'scripts/prepare-tiger-rhythm.py', 'sourceProject': 'VSCO 2 Community Edition',
    'author': 'Versilian Studios / Sam Gossner and Ivy Audio / Simon Dalzell; sample cutting Elan Hickler / Soundemote',
    'homepage': 'https://vis.versilstudios.com/vsco-community.html', 'repository': 'https://github.com/sgossner/VSCO-2-CE',
    'license': 'CC0 1.0', 'licenseUrl': 'https://creativecommons.org/publicdomain/zero/1.0/', 'sourceCommit': COMMIT,
    'changes': 'Trimmed leading silence with 2 ms margin, mixed to mono, linear resampling to 22050 Hz / 16-bit PCM WAV, limited to 5 s with a 0.5 s tail fade and peak gain. Original recordings retained locally.',
    'composition': 'Original Trailbound 72 BPM harp arrangement encoded in the game, using these recorded samples. Not a field recording or traditional local melody.',
    'cost': {'materialLicenseFee': 0, 'paidSubscriptions': False}, 'files': items,
    'reusedFoley': ['audio/wugong-place-v1.mp3', 'audio/wugong-step-1-v1.mp3', 'audio/wugong-wind-v1.m4a'],
    'reusedLicenseRecords': ['audio/wugong-credits.json', 'audio/wugong-journey-credits-v1.json'],
}, ensure_ascii=False, indent=2) + '\n')
print('Prepared four recorded CC0 harp samples and license records. No playback or gameplay tests run.')
