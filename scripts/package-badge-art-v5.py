"""Encode the six ImageGen originals for the game without changing their artwork."""
from pathlib import Path
from PIL import Image
import hashlib,json,sys
root=Path(__file__).resolve().parents[1]
sources=json.loads((root/'art/provenance/badges-v5/sources.json').read_text())
entries=[]
for e in sources:
    source=Path(e['sourcePath'])
    im=Image.open(source).convert('RGBA')
    assert im.width==im.height and im.width>=1024
    file='badges/'+e['id']+'-v5.webp'
    # Only proportional reduction and encoding; no redraw, compositing or retouching.
    im.resize((384,384),Image.Resampling.LANCZOS).save(root/'public'/file,'WEBP',quality=90,method=6)
    data=(root/'public'/file).read_bytes()
    out=Image.open(root/'public'/file)
    assert out.size==(384,384) and out.mode=='RGBA' and out.getpixel((0,0))[3]==0
    entries.append(dict(id=e['id'],route=e['route'],name=e['name'],season=e['season'],file=file,width=384,height=384,bytes=len(data),sha256=hashlib.sha256(data).hexdigest(),sourceGeneratedFile=source.name,sourceSha256=hashlib.sha256(source.read_bytes()).hexdigest(),runtimeBound=True))
manifest=dict(artVersion=5,stage='runtime-integrated',runtimeBound=True,generator='built-in imagegen',format='webp',transparent=True,entries=entries)
(root/'public/badges/art-v5.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
# Self-contained review keeps image inspection independent of the private production host.
import base64,html
review=root/'.local/art-review/badges-v5'
review.mkdir(parents=True,exist_ok=True)
cards=[]
for e in entries:
    encoded=base64.b64encode((root/'public'/e['file']).read_bytes()).decode()
    cards.append('<figure><img alt="'+html.escape(e['name'])+'" src="data:image/webp;base64,'+encoded+'"><figcaption>'+html.escape(e['name'])+'<small>'+html.escape(e['season'])+'</small></figcaption></figure>')
(review/'review.html').write_text('<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>补齐六枚水彩标签</title><style>body{background:#f4f1e4;color:#476448;font:16px system-ui;margin:24px auto;max-width:1000px;padding:0 16px}main{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:18px}figure{margin:0;text-align:center}img{width:100%;max-width:300px}small{display:block;font-size:12px;color:#79866e;margin:8px}</style><h1>补齐六枚水彩标签</h1><p>静态素材预览，非游戏浏览器截图。</p><main>'+''.join(cards)+'</main></html>')
print('Encoded',len(entries),'watercolor badges;',sum(e['bytes'] for e in entries),'bytes')
