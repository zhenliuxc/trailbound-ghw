"""Static composition of actual scene primitives, not a browser screenshot or layout test."""
import json, subprocess, math
from pathlib import Path
from PIL import Image, ImageDraw
root=Path(__file__).resolve().parents[1]
code="""const M=require('./dist/mini-games'),D=require('./dist/discoveries');let s=M.create(D.item('meadow-bird'));for(let i=0;i<100;i++){if(i%8===0)s=M.input(s,{y:M.windTarget(s)},'move');s=M.tick(s,.025);}console.log(JSON.stringify({state:s,shapes:M.foreground(s,true)}));"""
data=json.loads(subprocess.check_output(['node','-e',code],cwd=root))
scale=2;im=Image.open(root/'dist/scenes/wugong-v1.webp').convert('RGBA').resize((1600,920),Image.Resampling.LANCZOS)
for f in data['shapes']:
 layer=Image.new('RGBA',im.size);d=ImageDraw.Draw(layer);fill=tuple(bytes.fromhex(f['color'][1:]))+(round(f.get('alpha',1)*255),)
 if f['shape']=='ellipse':d.ellipse(((f['x']-f['rx'])*2,(f['y']-f['ry'])*2,(f['x']+f['rx'])*2,(f['y']+f['ry'])*2),fill=fill)
 elif f['shape'] in ('line','poly'):
  pts=list(zip([x*2 for x in f['points'][::2]],[y*2 for y in f['points'][1::2]]))
  if f['shape']=='line':d.line(pts,fill=fill,width=max(1,round(f['width']*2)))
  else:d.polygon(pts,fill=fill)
 im=Image.alpha_composite(im,layer)
s=data['state'];a=s['actor'];angle=max(-.23,min(.23,a['vy']*1.6))+math.sin(s['age']*2.1)*.025
kite=Image.open(root/'dist/sprites/wugong-swallow-kite-v1.webp').convert('RGBA').resize((348,232),Image.Resampling.LANCZOS).rotate(-angle*180/math.pi,Image.Resampling.BICUBIC,expand=True)
im.alpha_composite(kite,(round(a['x']*1600-kite.width/2),round((a['y']*460-8)*2-kite.height/2)))
out=root/'docs/previews/wind-redesign-static.webp';im.convert('RGB').resize((1000,575),Image.Resampling.LANCZOS).save(out,quality=90)
print(out)
