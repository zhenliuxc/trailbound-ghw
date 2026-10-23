"""Package the generated watercolor atlas; leave its original PNG untouched."""
from collections import deque
from pathlib import Path
from PIL import Image
import hashlib
import json

ROOT = Path(__file__).resolve().parents[1]
SOURCE = Path('/workspace/generated_images/exec-7d922569-40ff-42b3-84f4-a467a276b4bb.png')
OUTPUT = ROOT / 'public/sprites/art-play-props-v1.webp'
NAMES = ['closed-tea-bud', 'paired-tea-leaves', 'broad-tea-leaf', 'three-leaf-fan', 'bamboo-fork', 'paper-leaf', 'bamboo-stalk', 'mountain-paper-label']

image = Image.open(SOURCE).convert('RGBA')
image = image.resize((1536, round(image.height * 1536 / image.width)), Image.Resampling.LANCZOS)
image.save(OUTPUT, 'WEBP', quality=92, method=6)
frames = []
for index, name in enumerate(NAMES):
    left = round((index % 4) * image.width / 4)
    top = round((index // 4) * image.height / 2)
    right = round((index % 4 + 1) * image.width / 4)
    bottom = round((index // 4 + 1) * image.height / 2)
    alpha = image.getchannel('A').crop((left, top, right, bottom))
    width, height = alpha.size
    values = alpha.tobytes()
    seen = bytearray(width * height)
    largest = []
    for start, value in enumerate(values):
        if value < 128 or seen[start]:
            continue
        queue = deque([start])
        seen[start] = 1
        component = []
        while queue:
            pixel = queue.popleft()
            component.append(pixel)
            x, y = pixel % width, pixel // width
            for nx, ny in ((x-1, y), (x+1, y), (x, y-1), (x, y+1)):
                if 0 <= nx < width and 0 <= ny < height:
                    near = ny * width + nx
                    if not seen[near] and values[near] >= 128:
                        seen[near] = 1
                        queue.append(near)
        if len(component) > len(largest):
            largest = component
    if largest:
        x0 = max(0, min(p % width for p in largest) - 8)
        y0 = max(0, min(p // width for p in largest) - 8)
        x1 = min(width, max(p % width for p in largest) + 9)
        y1 = min(height, max(p // width for p in largest) + 9)
    else:
        x0, y0, x1, y1 = 0, 0, width, height
    frames.append({'name': name, 'x': left+x0, 'y': top+y0, 'w': x1-x0, 'h': y1-y0})

atlas = {'file': 'sprites/art-play-props-v1.webp', 'columns': 4, 'rows': 2, 'width': image.width, 'height': image.height, 'frames': frames}
script = "(function(root){const atlas=" + json.dumps(atlas, ensure_ascii=False, separators=(',', ':')) + ";if(typeof module==='object'&&module.exports)module.exports=atlas;else root.TrailArtAtlas=atlas;}(typeof globalThis!=='undefined'?globalThis:this));\n"
(ROOT / 'src/legacy/art-play-atlas.js').write_text(script)
manifest = {**atlas, 'generator': 'OpenAI ImageGen', 'source': str(SOURCE), 'source_sha256': hashlib.sha256(SOURCE.read_bytes()).hexdigest(), 'sha256': hashlib.sha256(OUTPUT.read_bytes()).hexdigest(), 'bytes': OUTPUT.stat().st_size, 'processing': 'Proportional resize and WebP encoding; frame rectangles use the dominant alpha component plus an eight-pixel margin. Original PNG retained.'}
(ROOT / 'public/sprites/art-play-props-v1.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({'file': str(OUTPUT), 'width': image.width, 'height': image.height, 'bytes': OUTPUT.stat().st_size, 'frames': frames}))
