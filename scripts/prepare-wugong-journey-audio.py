"""Prepare licensed nature recordings for the Wugong map, without changing other routes.

Usage: python3 scripts/prepare-wugong-journey-audio.py
Sources are cached privately in .local/audio-source. Apple's afconvert produces
small AAC files; this is asset preparation, not listening or browser validation.
"""
import hashlib
import json
import pathlib
import subprocess
import wave

ROOT = pathlib.Path(__file__).resolve().parents[1]
CACHE = ROOT / '.local/audio-source'
OUT = ROOT / 'dist/audio'
SOURCES = [
    ('woodland', 'woodland.mp3', 'Joseph SARDIN', 'Wind in a Tree', 'https://bigsoundbank.com/wind-in-a-tree-s0659.html', 'https://bigsoundbank.com/UPLOAD/mp3/0659.mp3'),
    ('rain', 'rain.mp3', 'Joseph SARDIN', 'Rain on Puddle', 'https://bigsoundbank.com/rain-on-puddle-s1290.html', 'https://bigsoundbank.com/UPLOAD/mp3/1290.mp3'),
    ('wind', 'wind.wav', 'Thimras', 'Park ambiences / open field wind', 'https://opengameart.org/content/park-ambiences', 'https://opengameart.org/sites/default/files/park_ambience_wind.wav'),
]
entries = []
for id, name, author, title, source, download in SOURCES:
    original = CACHE / name
    pcm = CACHE / (id + '-decoded.wav')
    excerpt = CACHE / (id + '-excerpt.wav')
    input_file = original
    duration = 32
    if id == 'wind':
        # The source download is large. Only its complete 3–19s PCM range is
        # needed; a local HTTP prefix is sufficient and is identified honestly.
        duration = 16
        input_file = CACHE / 'wind-source-range.wav'
        with wave.open(str(original), 'rb') as reader:
            params = reader.getparams(); reader.setpos(params.framerate * 3)
            frames = reader.readframes(params.framerate * duration)
            if len(frames) != params.framerate * duration * params.nchannels * params.sampwidth:
                raise ValueError('Wind source prefix does not contain the complete selected range')
        with wave.open(str(input_file), 'wb') as writer:
            writer.setparams(params); writer.writeframes(frames)
    subprocess.run(['/usr/bin/afconvert', '-f', 'WAVE', '-d', 'LEI16@32000', '-c', '1', str(input_file), str(pcm)], check=True)
    with wave.open(str(pcm), 'rb') as reader:
        rate = reader.getframerate()
        if id != 'wind': reader.setpos(min(rate * 3, reader.getnframes() // 4))
        frames = reader.readframes(rate * duration)
    # Gentle endpoint fades prevent a click when the recording loops.
    import array
    samples = array.array('h', frames)
    fade = min(rate, len(samples) // 4)
    for i in range(fade):
        samples[i] = int(samples[i] * i / fade)
        samples[-i - 1] = int(samples[-i - 1] * i / fade)
    with wave.open(str(excerpt), 'wb') as writer:
        writer.setnchannels(1); writer.setsampwidth(2); writer.setframerate(rate)
        writer.writeframes(samples.tobytes())
    output = OUT / f'wugong-{id}-v1.m4a'
    subprocess.run(['/usr/bin/afconvert', '-f', 'm4af', '-d', 'aac', '-b', '64000', str(excerpt), str(output)], check=True)
    entries.append(dict(file='audio/' + output.name, bytes=output.stat().st_size, sha256=hashlib.sha256(output.read_bytes()).hexdigest(), sourceFileSha256=hashlib.sha256(input_file.read_bytes()).hexdigest(), sourceHashScope='Decoded source range 3–19 seconds, WAV header rewritten; source acquired as an HTTP prefix' if id == 'wind' else 'Complete downloaded source MP3', author=author, title=title, source=source, download=download, license='CC0', licenseUrl='https://creativecommons.org/publicdomain/zero/1.0/', changes=f'Excerpt 3–{3+duration} seconds, mono 32kHz AAC 64kbps, one-second endpoint fades. Runtime gain follows the map weather. Not recorded at Wugong Mountain.'))
(OUT / 'wugong-journey-credits-v1.json').write_text(json.dumps(dict(scope='Wugong map only', cost=0, entries=entries), ensure_ascii=False, indent=2) + '\n')
print('Prepared three licensed nature loops. No listening or gameplay tests performed.')
