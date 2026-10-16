"""Prepare local Wugong music/foley assets. Production processing, not a test runner.

Usage: python3 scripts/prepare-wugong-audio.py /absolute/source-cache
Source cache filenames and pinned redistribution URLs are recorded below. The
composer/Kenney pages are authoritative for licensing; GitHub mirrors were used
because direct downloads from their hosts were unavailable in this workspace.
"""
import hashlib
import json
import pathlib
import re
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parents[1]
CACHE = pathlib.Path(sys.argv[1])
OUT = ROOT / 'dist/audio'
MUSIC_MIRROR = 'https://raw.githubusercontent.com/shuangboxu/alpenruhe/9b0c29f82764159630ce875537f9fa70e3d538ab/public/assets/audio/music/sb_reverie.mp3'
FOLEY_MIRROR = 'https://raw.githubusercontent.com/Zcrafting34/telefono-descompuesto/b2a42938a39c7ac6901dd94fa9fa66240b552db5/src/assets/kenney_rpg-audio/Audio/'


def duration(file):
    return float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', str(file)], text=True).strip())


def ffmpeg(source, destination, filters, rate, channels, bitrate, metadata=()):
    args = ['ffmpeg', '-y', '-hide_banner', '-loglevel', 'error', '-i', str(source), '-vn', '-map_metadata', '-1', '-af', filters, '-ar', str(rate), '-ac', str(channels), '-c:a', 'libmp3lame', '-b:a', bitrate]
    for tag in metadata:
        args.extend(['-metadata', tag])
    subprocess.run(args + [str(destination)], check=True)


def entry(id, file, source_file, **details):
    data = (OUT / file).read_bytes()
    return dict(id=id, file='audio/' + file, bytes=len(data), sha256=hashlib.sha256(data).hexdigest(), duration=round(duration(OUT / file), 3), sourceFileSha256=hashlib.sha256(source_file.read_bytes()).hexdigest(), **details)


song = CACHE / 'reverie.mp3'
song_file = 'wugong-reverie-v1.mp3'
song_duration = duration(song)
ffmpeg(song, OUT / song_file, f'loudnorm=I=-18:TP=-2:LRA=8,afade=t=in:d=2.5,afade=t=out:st={song_duration-5.2:.4f}:d=5.2', 44100, 2, '96k', ('title=Reverie', 'artist=Scott Buckley', 'copyright=CC BY 4.0; www.scottbuckley.com.au'))
music = entry('wugong-reverie', song_file, song, source='https://www.scottbuckley.com.au/library/reverie/', originalDownload='https://www.scottbuckley.com.au/library/wp-content/uploads/2020/03/sb_reverie.mp3', acquiredFrom=MUSIC_MIRROR, originalTitle='Reverie', author='Scott Buckley', license='CC BY 4.0', licenseUrl='https://creativecommons.org/licenses/by/4.0/', attribution="'Reverie' by Scott Buckley — released under CC-BY 4.0. www.scottbuckley.com.au", changes='Complete composition retained; loudness adjusted to -18 LUFS target / -2 dBTP, 2.5s entrance and 5.2s exit fades, stereo 44.1kHz MP3 96kbps. Runtime streaming, gain changes and looping at the quiet endpoints. No claim of a new composition or local recording.')
music['games'] = ['puzzle']
music['otherUses'] = ['walking', 'postcards']
music_entries = [music]
mirror_bgm = 'https://raw.githubusercontent.com/Alndaly/kinda.info/2976cd6e5f5f6e1537f0bd2e1ff379aa3dd60e53/public/audio/bgm/'
themes = [
    ('wind', 'childhood', 'Childhood', 'childhood.mp3', '2019/01/sb_childhood.mp3', mirror_bgm + 'childhood.mp3', 'Pinned source is a full-work 128kbps web transcode, not the original composer MP3.'),
    ('clouds', 'cirrus', 'Cirrus', 'cirrus.mp3', '2023/03/Cirrus.mp3', 'https://raw.githubusercontent.com/Allen-cubber/zzx/fc6ae82400b3386983b0741f00c830c56707afe3/static/audio/travel/cirrus-scott-buckley.mp3', 'Pinned redistribution; source-file hash identifies the acquired bytes.'),
    ('greet', 'a-kind-of-hope', 'A Kind Of Hope', 'a-kind-of-hope.mp3', '2022/10/AKindOfHope.mp3', mirror_bgm + 'a-kind-of-hope.mp3', 'Pinned source is a full-work 128kbps web transcode, not the original composer MP3.'),
]
for game, slug, title, filename, upstream, mirror, note in themes:
    src = CACHE / filename
    target = 'wugong-' + slug + '-loop-v1.mp3'
    # Take the first 76s and blend its last 2s into its first 2s. The resulting
    # 74s cycle has continuous audio endpoints. Musical phrasing still needs ears.
    graph = '[0:a]atrim=end=76,asetpts=PTS-STARTPTS,loudnorm=I=-18:TP=-2:LRA=8,asplit=3[h][b][t];[h]atrim=end=2,asetpts=PTS-STARTPTS[head];[b]atrim=start=2:end=74,asetpts=PTS-STARTPTS[body];[t]atrim=start=74:end=76,asetpts=PTS-STARTPTS[tail];[tail]afade=t=out:d=2:curve=tri[tf];[head]afade=t=in:d=2:curve=tri[hf];[tf][hf]amix=inputs=2:duration=longest:normalize=0[seam];[body][seam]concat=n=2:v=0:a=1[out]'
    subprocess.run(['ffmpeg', '-y', '-hide_banner', '-loglevel', 'error', '-i', str(src), '-filter_complex', graph, '-map', '[out]', '-map_metadata', '-1', '-ar', '44100', '-ac', '2', '-c:a', 'libmp3lame', '-b:a', '96k', '-metadata', 'title=' + title, '-metadata', 'artist=Scott Buckley', '-metadata', 'copyright=CC BY 4.0; www.scottbuckley.com.au', str(OUT / target)], check=True)
    music_entries.append(entry('wugong-' + slug, target, src, games=[game], source='https://www.scottbuckley.com.au/library/' + slug + '/', originalDownload='https://www.scottbuckley.com.au/library/wp-content/uploads/' + upstream, acquiredFrom=mirror, sourceFileNote=note, originalTitle=title, author='Scott Buckley', license='CC BY 4.0', licenseUrl='https://creativecommons.org/licenses/by/4.0/', attribution=f"'{title}' by Scott Buckley — released under CC-BY 4.0. www.scottbuckley.com.au", changes='Adapted from source excerpt 0–76s; 2s linear tail/head crossfade produces a 74s cycle. Loudness target -18 LUFS / -2 dBTP; stereo 44.1kHz MP3 96kbps. This is licensed existing music, not an original/exclusive Trailbound composition.'))

items = [
    ('wugongPaper', 'bookFlip1.ogg', 'wugong-paper-v1.mp3', 'Book-page turn used for painting reveal and puzzle pickup.'),
    ('wugongPlace', 'bookPlace1.ogg', 'wugong-place-v1.mp3', 'Book placement used as soft paper-piece contact and collecting foley.'),
    ('wugongCloth', 'cloth1.ogg', 'wugong-cloth-v1.mp3', 'Cloth handling used for kite line, clothing and conversational movement foley.'),
    ('wugongClick', 'metalClick.ogg', 'wugong-click-v1.mp3', 'Generic mechanical metal click used as camera-shutter foley; not a recording of a camera.'),
    ('wugongTurn', 'bookFlip2.ogg', 'wugong-turn-v1.mp3', 'A separate page turn for puzzle pickup, distinct from the painting reveal.'),
    ('wugongLine', 'beltHandle1.ogg', 'wugong-line-v1.mp3', 'Recorded belt handling used as a kite-line tug foley, not a recording of a kite string.'),
    ('wugongFlutter', 'cloth2.ogg', 'wugong-flutter-v1.mp3', 'A second cloth sample for the kite opening and lifting; not a wind field recording.'),
    ('wugongStep1', 'footstep00.ogg', 'wugong-step-1-v1.mp3', 'Generic footstep, not a field recording of Wugong or a claimed grass/stone surface.'),
    ('wugongStep2', 'footstep01.ogg', 'wugong-step-2-v1.mp3', 'Generic footstep variant; runtime filtering adapts its distance/material impression.'),
    ('wugongStep3', 'footstep04.ogg', 'wugong-step-3-v1.mp3', 'Generic footstep variant; not a local trail recording.'),
]
effects = []
for id, name, file, use in items:
    source_file = CACHE / name
    # Peak matching is part of source preparation. Avoid integrated-loudness
    # normalization on sub-second foley, where gated LUFS may be undefined.
    measure = subprocess.run(['ffmpeg', '-hide_banner', '-i', str(source_file), '-af', 'volumedetect', '-f', 'null', '-'], text=True, capture_output=True, check=True).stderr
    peak = float(re.search(r'max_volume:\s*(-?[\d.]+)', measure).group(1))
    gain = min(12, -6 - peak)
    length = duration(source_file)
    ffmpeg(source_file, OUT / file, f'highpass=f=85,lowpass=f=7000,volume={gain:.3f}dB,afade=t=in:d=0.005,afade=t=out:st={max(.01,length-.035):.4f}:d=0.035', 32000, 1, '64k')
    effects.append(entry(id, file, source_file, source='https://kenney.nl/assets/rpg-audio', originalTitle='RPG Audio / ' + name, acquiredFrom=FOLEY_MIRROR + name, author='Kenney Vleugels (Kenney.nl)', license='CC0', licenseUrl='https://creativecommons.org/publicdomain/zero/1.0/', changes=f'Mono 32kHz MP3 64kbps, high/low-pass filtering, peak matching and short endpoint fades. {use}'))

manifest = dict(version=2, cost=dict(materialLicenseFee=0, currency='CNY', paidSubscriptions=False, paidCommissions=False), scope='Wugong route only: four freely licensed game themes and material foley. Existing six soundscape recordings remain unchanged.', budgets=dict(musicBytes=6000000, musicFileBytes=3000000, effectsBytes=100000), music=music_entries, effects=effects)
(OUT / 'wugong-credits.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
(OUT / 'KENNEY-RPG-LICENSE.txt').write_bytes((CACHE / 'License.txt').read_bytes())
print('Prepared four free licensed music themes and ten short foley assets. No gameplay tests or listening checks were run.')
