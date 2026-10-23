"""Fetch only the selected Kenney ZIP members, with ZIP CRC verification."""
from concurrent.futures import ThreadPoolExecutor
from hashlib import sha256
from io import BytesIO
import json
from pathlib import Path
import re
import struct
from urllib.request import Request, urlopen
from zipfile import ZipFile

ROOT = Path(__file__).resolve().parents[2]
CACHE = ROOT / '.local/assets/wugong-environment'
URL = 'https://kenney.nl/media/pages/assets/nature-kit/37ac38a37b-1677698939/kenney_nature-kit.zip'
CACHE.mkdir(parents=True, exist_ok=True)

def request_range(start, end=None):
    value = f'bytes={start}-{end}' if end is not None else f'bytes=-{start}'
    with urlopen(Request(URL, headers={'Range': value}), timeout=60) as response:
        content_range = response.headers.get('Content-Range', '')
        match = re.fullmatch(r'bytes (\d+)-(\d+)/(\d+)', content_range)
        if response.status != 206 or not match:
            raise RuntimeError('The asset server no longer supports range downloads')
        first, last, length = map(int, match.groups())
        data = response.read()
        if len(data) != last - first + 1:
            raise RuntimeError('The asset range download was incomplete')
        return first, length, data

index_path = CACHE / 'nature-index.zip'
if index_path.exists():
    archive = bytearray(index_path.read_bytes())
else:
    first, length, tail = request_range(400000)
    archive = bytearray(length)
    archive[first:] = tail
    eocd = tail.rfind(b'PK\x05\x06')
    if eocd < 0:
        raise RuntimeError('Cannot find the official ZIP directory')
    _, _, _, _, _, size, offset, _ = struct.unpack('<4s4H2IH', tail[eocd:eocd + 22])
    if offset < first:
        begin, _, directory = request_range(offset, first - 1)
        archive[begin:first] = directory
    index_path.write_bytes(archive)

members = ['Models/GLTF format/tree_oak.glb', 'Models/GLTF format/tree_detailed.glb', 'License.txt']
with ZipFile(BytesIO(archive)) as source:
    infos = [source.getinfo(name) for name in members]

def fetch_member(info):
    destination = CACHE / 'nature' / info.filename
    if destination.exists():
        return info, destination.read_bytes()
    begin, _, data = request_range(info.header_offset, info.header_offset + info.compress_size + 1023)
    return info, (begin, data)

results = list(ThreadPoolExecutor(max_workers=3).map(fetch_member, infos))
for info, result in results:
    if isinstance(result, tuple):
        begin, data = result
        archive[begin:begin + len(data)] = data
manifest = []
with ZipFile(BytesIO(archive)) as source:
    for info, result in results:
        data = source.read(info.filename) if isinstance(result, tuple) else result
        import zlib
        if zlib.crc32(data) != info.CRC:
            raise RuntimeError(f'The cached Kenney member changed: {info.filename}')
        destination = CACHE / 'nature' / info.filename
        destination.parent.mkdir(parents=True, exist_ok=True)
        destination.write_bytes(data)
        manifest.append({'member': info.filename, 'bytes': len(data), 'sha256': sha256(data).hexdigest(), 'zipCRC': f'{info.CRC:08x}'})
(CACHE / 'nature-sources.json').write_text(json.dumps({'url': URL, 'members': manifest}, indent=2) + '\n')
print('Fetched and CRC-checked the two Nature Kit trees and their actual license.')

survival = ROOT / '.local/assets/wugong-hiker/kenney-survival-kit.zip'
if not survival.exists():
    source_url = 'https://kenney.nl/media/pages/assets/survival-kit/4065a8185b-1712149243/kenney_survival-kit.zip'
    with urlopen(source_url, timeout=60) as response:
        data = response.read()
    survival.parent.mkdir(parents=True, exist_ok=True)
    survival.write_bytes(data)
if sha256(survival.read_bytes()).hexdigest() != 'c3586341b5932c87eb43d75d915434f47daed168b17ed36a03e8ca9977c7443e':
    raise RuntimeError('Preserving a changed or incomplete Survival Kit ZIP')
with ZipFile(survival) as source:
    selected = ['License.txt', 'Models/GLB format/Textures/colormap.png']
    selected += [f'Models/GLB format/{name}.glb' for name in ['tent', 'tent-canvas', 'rock-a', 'rock-b', 'signpost', 'tree-log']]
    for name in selected:
        destination = CACHE / name
        destination.parent.mkdir(parents=True, exist_ok=True)
        destination.write_bytes(source.read(name))
print('Extracted CRC-checked Survival Kit parts, including the tent fabric.')
