"""Encode generated watercolor backgrounds; no scene redraw or compositing."""
from pathlib import Path
from PIL import Image
import hashlib,json
root=Path(__file__).resolve().parents[1]
entries=[]
for e in json.loads((root/'docs/scenes-v1/sources.json').read_text()):
    source=Path(e['sourcePath']);image=Image.open(source).convert('RGB');image.thumbnail((1280,736),Image.Resampling.LANCZOS)
    file='scenes/'+e['id']+'-v1.webp';image.save(root/'dist'/file,'WEBP',quality=86,method=6);data=(root/'dist'/file).read_bytes()
    entries.append(dict(route=e['id'],file=file,width=image.width,height=image.height,bytes=len(data),sha256=hashlib.sha256(data).hexdigest(),sourceGeneratedFile=source.name,sourceSha256=hashlib.sha256(source.read_bytes()).hexdigest()))
(root/'dist/scenes/manifest.json').write_text(json.dumps(dict(version=1,generator='built-in imagegen',stage='runtime-integrated',entries=entries),ensure_ascii=False,indent=2)+'\n')
print('Encoded',len(entries),'full-bleed scene images;',sum(e['bytes'] for e in entries),'bytes')
