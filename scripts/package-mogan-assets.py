"""Extract generated sprite regions, preserve alpha, and package the game atlas.

This only crops, scales uniformly and encodes existing ImageGen pixels. It does
not repaint the assets or replace their background/alpha. Originals stay intact.
"""
from pathlib import Path
import argparse
import hashlib
import json
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument('source', type=Path)
args = parser.parse_args()
image = Image.open(args.source).convert('RGBA')
regions = [
    ('moss-granite-step', (0, 0, 1030, 485)),
    ('left-hiking-shoe', (1050, 0, 1445, 515)),
    ('right-hiking-shoe', (230, 485, 600, 1024)),
    # The upper shoe ends just above this row; do not include its heel fragment.
    ('bamboo-sprig', (850, 520, 1536, 1024)),
]
atlas = Image.new('RGBA', (1024, 1024))
frames, tip = [], None
for index, (name, box) in enumerate(regions):
    cell = image.crop(box)
    alpha = cell.getchannel('A')
    visible = alpha.point(lambda a: 255 if a > 96 else 0).getbbox()
    if visible is None:
        raise ValueError('No visible material in ' + name)
    x0, y0, x1, y1 = visible
    x0, y0 = max(0, x0-6), max(0, y0-6)
    x1, y1 = min(cell.width, x1+6), min(cell.height, y1+6)
    crop = cell.crop((x0, y0, x1, y1))
    crop.thumbnail((480, 480), Image.Resampling.LANCZOS)
    left = (index % 2)*512+(512-crop.width)//2
    top = (index // 2)*512+(512-crop.height)//2
    atlas.paste(crop, (left, top))
    frames.append({'name': name, 'x': left, 'y': top, 'w': crop.width, 'h': crop.height,
                   'sourceCrop': [box[0]+x0, box[1]+y0, box[0]+x1, box[1]+y1]})
    if name == 'bamboo-sprig':
        # Store the actual lowest leaf tip for both emission and leaf placement.
        a = crop.getchannel('A')
        for y in range(crop.height-1, -1, -1):
            xs = [x for x in range(crop.width) if a.getpixel((x, y)) > 128]
            if xs:
                tip = {'x': sum(xs)/len(xs)/crop.width, 'y': y/crop.height}
                break
output = ROOT/'public/sprites/mogan-props-v1.webp'
atlas.save(output, 'WEBP', quality=92, method=6)
runtime = {'file': 'sprites/mogan-props-v1.webp', 'width': atlas.width, 'height': atlas.height,
           'frames': [{k: f[k] for k in ('name', 'x', 'y', 'w', 'h')} for f in frames], 'tip': tip}
manifest = {**runtime, 'generator': 'OpenAI ImageGen', 'source': str(args.source),
            'sourceSize': list(image.size), 'sourceSha256': hashlib.sha256(args.source.read_bytes()).hexdigest(),
            'sha256': hashlib.sha256(output.read_bytes()).hexdigest(), 'bytes': output.stat().st_size,
            'processing': 'Extract explicit non-overlapping source regions; crop transparent margins; uniform resize; WebP encoding. Original alpha retained, no repainting.',
            'sourceFrames': frames}
(ROOT/'public/sprites/mogan-props-v1.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2)+'\n')
shared = json.loads((ROOT/'public/sprites/art-play-props-v1.json').read_text())
shared = {key: shared[key] for key in ('file', 'width', 'height', 'frames')}
code = '// Generated asset coordinates. Recreate with scripts/package-mogan-assets.py.\n'
code += 'export const MOGAN_PROPS = '+json.dumps(runtime, ensure_ascii=False, indent=2)+' as const;\n'
code += 'export const SHARED_PROPS = '+json.dumps(shared, ensure_ascii=False, indent=2)+' as const;\n'
(ROOT/'src/runtime/mogan/assets.ts').write_text(code)
print(json.dumps({'file': str(output), 'bytes': output.stat().st_size, 'frames': runtime['frames'], 'tip': tip}))
