"""Record Mogan's reuse of already packaged free music and foley; no downloads."""
from pathlib import Path
import json

ROOT = Path(__file__).resolve().parents[1]
current = json.loads((ROOT/'public/audio/wugong-credits.json').read_text())
earlier = json.loads((ROOT/'public/audio/credits.json').read_text())
tracks = {row['originalTitle']: row for row in current['music']}
effects = {row['id']: row for row in current['effects']+earlier['entries']}
music = []
for scene, title in [('rain', 'Cirrus'), ('footsteps', 'Reverie'), ('sling', 'Childhood'), ('walk/photo', 'A Kind Of Hope')]:
    row = tracks[title]
    music.append({key: row[key] for key in ('file', 'author', 'source', 'license', 'licenseUrl', 'sha256', 'bytes')} | {'title': title, 'scene': scene, 'processing': 'Reuses the unchanged packaged recording; scene gain, crossfades and short ducking at runtime.'})
sounds = []
for sample, usage in [('drop', 'Caught rain notes and quieter misses; caught notes use authored playback-rate offsets'), ('splash', 'Small water impact under a caught note'), ('leaves', 'Bamboo leaf ambience'), ('drips', 'Distant wet-forest drips'), ('wugongStep1', 'Stone step variation 1'), ('wugongStep2', 'Stone step variation 2'), ('wugongStep3', 'Stone step variation 3'), ('wugongPaper', 'Paper leaf arrives, painting unfolds'), ('wugongPlace', 'Quiet collision and collection'), ('wugongCloth', 'Clothing/leaf foley, retry or missed beat'), ('wugongLine', 'Recorded belt handling as slingshot tension foley'), ('wugongFlutter', 'Recorded cloth as paper leaf release foley')]:
    row = effects[sample]
    sounds.append({key: row[key] for key in ('file', 'author', 'source', 'license', 'licenseUrl', 'sha256', 'bytes')} | {'sample': sample, 'usage': usage, 'changes': row['changes']})
manifest = {'version': 1, 'route': 'mogan', 'cost': {'materialLicenseFee': 0, 'newAudioBytes': 0, 'paidSubscriptions': False, 'paidCommissions': False},
            'music': music, 'effects': sounds, 'sourceManifests': ['audio/wugong-credits.json', 'audio/credits.json'],
            'disclosure': 'Existing freely licensed recordings reused without duplicating files. Not local field recordings, not an exclusive score. Water-drop derivatives retain CC BY-SA 3.0; Kenney material is CC0. Recorded belt/cloth/footsteps are foley, not an authentic bamboo instrument or location recording.'}
(ROOT/'public/audio/mogan-credits.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2)+'\n')
print('Recorded Mogan free audio reuse: four music assignments, twelve recorded sources, no new audio files.')
