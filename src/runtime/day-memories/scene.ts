import type { ImageCache, MiniInput, MiniViewRefs } from '../contracts';
import { CHARACTERS, readCharacterId } from '../../characters/catalog';
import { DAY_MEMORIES, DayMemoryState, rainX, STEP_LEAVES } from './model';
import { isWestlakeSceneId, WESTLAKE_SCENES } from '../../content/westlake-scenes';
import { paintWestlake } from './westlake-scene';
import { westlakeInput } from './westlake-layout';

export class DayMemoryView implements MiniViewRefs {
  readonly directInput = true;
  contentState: 'loading' | 'ready' | 'error' = 'loading';
  disposed = false;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private observer: ResizeObserver | null = null;
  private images = new Map<string, HTMLImageElement>();
  private width = 1000; private height = 700;
  private readonly character = CHARACTERS[readCharacterId()];
  private latest: DayMemoryState | null = null;
  constructor(readonly route: string, readonly id: string) {}
  get background(): string { return isWestlakeSceneId(this.id) ? WESTLAKE_SCENES[this.id].background : `scenes/day-route-v2/${this.route}.webp`; }
  input(point: MiniInput): MiniInput {
    return isWestlakeSceneId(this.id) ? westlakeInput(WESTLAKE_SCENES[this.id].kind, { ...point, viewWidth: this.width, viewHeight: this.height }) : point;
  }
  async mount(host: HTMLElement, cache?: ImageCache): Promise<void> {
    const canvas = document.createElement('canvas'); this.canvas = canvas; canvas.className = 'mini-game-canvas day-memory-canvas'; canvas.setAttribute('aria-hidden','true');
    const ctx = canvas.getContext('2d'); if (!ctx) throw new Error('画作无法展开'); this.ctx = ctx;
    const props = isWestlakeSceneId(this.id)
      ? WESTLAKE_SCENES[this.id].kind === 'leaf' ? ['sprites/creek-leaf-v1.webp']
        : WESTLAKE_SCENES[this.id].kind === 'stones' ? [this.character.walk.file, 'sprites/mogan-props-v1.webp']
          : WESTLAKE_SCENES[this.id].kind === 'tea' ? ['sprites/art-play-props-v1.webp']
            : ['sprites/art-play-props-v1.webp', 'scenes/day-route-v2/teacup.webp']
      : [this.character.walk.file, 'sprites/creek-leaf-v1.webp', 'sprites/art-play-props-v1.webp', 'sprites/mogan-props-v1.webp', 'sprites/bamboo-cup-v2.webp', 'scenes/day-route-v2/teacup.webp'];
    const files = [this.background, ...props];
    const resources = await Promise.all(files.map(file => cache?.request(file,'high')?.promise));
    if (this.disposed) return;
    if (resources.some(asset => asset?.state !== 'ready')) { this.contentState = 'error'; return; }
    resources.forEach((asset,i) => { if (asset) this.images.set(files[i],asset.image); });
    host.append(canvas); this.contentState = 'ready';
    const resize = () => {
      const box = host.getBoundingClientRect(), dpr = Math.min(2,devicePixelRatio || 1);
      this.width = Math.max(1,box.width); this.height = Math.max(1,box.height);
      canvas.width = Math.round(this.width*dpr); canvas.height = Math.round(this.height*dpr);
      ctx.setTransform(dpr,0,0,dpr,0,0); if(this.latest) this.paint(this.latest);
    };
    this.observer = new ResizeObserver(resize); this.observer.observe(host); resize(); host.setAttribute('aria-busy','false');
  }
  dispose(): void { this.disposed = true; this.observer?.disconnect(); this.canvas?.remove(); this.images.clear(); }
  paint(s: DayMemoryState): void {
    this.latest = s; const ctx = this.ctx, bg = this.images.get(this.background);
    if (!ctx || !bg || this.disposed) return;
    const w = this.width, h = this.height, unit = Math.min(w,h*1.45), scene = s.scene, t = s.reduced ? 0 : s.age;
    ctx.clearRect(0,0,w,h); ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
    if (isWestlakeSceneId(this.id)) {
      paintWestlake({ctx,images:this.images,character:this.character,id:this.id,state:s,width:w,height:h});
      this.canvas?.setAttribute('data-scene',WESTLAKE_SCENES[this.id].kind);
      this.canvas?.setAttribute('data-place',WESTLAKE_SCENES[this.id].place);
      return;
    }
    const focus = scene.kind === 'reflection' ? .14 : scene.kind === 'lichen' ? .78 : this.route === 'mogan' ? .64 : .5;
    const cover = Math.max(w/bg.naturalWidth,h/bg.naturalHeight), cropX = (bg.naturalWidth*cover-w)*focus;
    ctx.drawImage(bg,-cropX,(h-bg.naturalHeight*cover)/2,bg.naturalWidth*cover,bg.naturalHeight*cover);
    const image = (file: string,x: number,y: number,width: number,rotation=0,alpha=1) => {
      const img = this.images.get(file); if(!img)return; const height = width*img.naturalHeight/img.naturalWidth;
      ctx.save();ctx.translate(x*w,y*h);ctx.rotate(rotation);ctx.globalAlpha=alpha;ctx.drawImage(img,-width/2,-height/2,width,height);ctx.restore();
    };
    const ring = (x:number,y:number,r:number,alpha=.7) => {ctx.save();ctx.strokeStyle=`rgba(248,242,208,${alpha})`;ctx.lineWidth=Math.max(1,unit*.003);ctx.beginPath();ctx.ellipse(x*w,y*h,r*unit,r*unit*.28,0,0,Math.PI*2);ctx.stroke();ctx.restore();};
    const atlas = (frame:number,x:number,y:number,size:number,rotation=0,alpha=1) => {
      const img=this.images.get('sprites/art-play-props-v1.webp');if(!img)return;
      const regions=[[99,26,169,350],[393,75,367,282],[810,80,317,274],[1161,34,352,333],[82,399,241,339],[447,457,269,246]];
      const [sx,sy,sw,sh]=regions[frame],height=size*sh/sw;
      ctx.save();ctx.translate(x*w,y*h);ctx.rotate(rotation);ctx.globalAlpha=alpha;ctx.drawImage(img,sx,sy,sw,sh,-size/2,-height/2,size,height);ctx.restore();
    };
    const hiker=(x:number,y:number,walk:number) => {
      const img=this.images.get(this.character.walk.file);if(!img)return;
      const frame=this.character.walk.frames[walk > 0 ? Math.floor(walk*8)%8 : 2],size=Math.max(34,Math.min(66,unit*.09)),scale=size/frame.height;
      ctx.save();ctx.fillStyle='#3f4c4133';ctx.beginPath();ctx.ellipse(x*w,y*h+1,size*.24,size*.06,0,0,Math.PI*2);ctx.fill();ctx.drawImage(img,frame.x,frame.y,frame.width,frame.height,x*w-frame.footX*scale,y*h-frame.footY*scale,frame.width*scale,frame.height*scale);ctx.restore();
    };
    const reveal=Math.min(1,s.reveal/4);
    if (scene.kind === 'reflection') {
      ctx.save();ctx.beginPath();ctx.rect(w*.08,h*.58,w*.84,h*.32);ctx.clip();ctx.globalAlpha=.26;
      ctx.translate(w*scene.offset,h*1.07);ctx.scale(1,-.45);ctx.drawImage(bg,-cropX,0,bg.naturalWidth*cover,bg.naturalHeight*cover);ctx.restore();
      for(let i=0;i<6;i++)ring(.25+i*.1,.67+Math.sin(i)*.055,.06+Math.sin(t*.8+i)*.008,.22);
      if(s.phase==='play') {ring(.5,.7,.12,.6);ctx.fillStyle='#fff8e6c9';ctx.font=`${Math.max(12,unit*.02)}px serif`;ctx.textAlign='center';ctx.fillText('← 轻拖枝影 →',w*.5,h*.9);}
    } else if(scene.kind==='lichen') {
      const rw=w*.68,rh=Math.min(h*.58,rw*.8),rx=(w-rw)/2,ry=h*.34;
      ctx.save();ctx.beginPath();ctx.ellipse(w*.5,ry+rh*.5,rw*.5,rh*.5,-.08,0,Math.PI*2);ctx.clip();ctx.drawImage(bg,bg.naturalWidth*.55,bg.naturalHeight*.65,bg.naturalWidth*.45,bg.naturalHeight*.35,rx,ry,rw,rh);ctx.restore();
      const lx=s.x*w,ly=s.y*h,lr=unit*.115;
      ctx.save();ctx.beginPath();ctx.arc(lx,ly,lr,0,Math.PI*2);ctx.clip();ctx.drawImage(bg,bg.naturalWidth*(.57+(s.x-.25)*.45),bg.naturalHeight*(.66+(s.y-.35)*.25),bg.naturalWidth*.13,bg.naturalHeight*.13,lx-lr,ly-lr,lr*2,lr*2);ctx.restore();
      ctx.strokeStyle='#a1885d';ctx.lineWidth=3;ctx.beginPath();ctx.arc(lx,ly,lr,0,Math.PI*2);ctx.moveTo(lx+lr*.7,ly+lr*.7);ctx.lineTo(lx+lr*1.25,ly+lr*1.25);ctx.stroke();
    } else if(scene.kind==='vista') {
      const opened=s.phase==='reveal'?Math.min(1,scene.opened+reveal):scene.opened;
      ctx.save();ctx.globalAlpha=1-opened*.95;
      const strip=bg.naturalWidth*.28;
      ctx.drawImage(bg,0,0,strip,bg.naturalHeight,-opened*w*.45,0,w*.43,h);
      ctx.drawImage(bg,bg.naturalWidth-strip,0,strip,bg.naturalHeight,w*.57+opened*w*.45,0,w*.43,h);ctx.restore();
      hiker(.76+reveal*.04,.9-reveal*.06,s.phase==='reveal'&&reveal<1?s.reveal:0);
    } else if(scene.kind==='rain') {
      image('sprites/bamboo-cup-v2.webp',scene.cup,.81,unit*.18);
      const dx=rainX(s);ctx.fillStyle='#a2cad6';ctx.strokeStyle='#eaf0dd';ctx.lineWidth=1;
      ctx.beginPath();ctx.ellipse(dx*w,scene.drop*h,Math.max(3,unit*.008),Math.max(5,unit*.013),0,0,Math.PI*2);ctx.fill();ctx.stroke();
      const sprig=this.images.get('sprites/mogan-props-v1.webp');if(sprig)ctx.drawImage(sprig,528,549,480,437,dx*w-unit*.13,.04*h,unit*.26,unit*.24);
      for(let i=0;i<4;i++)ring(.4+i*.065,.94,.012,i<scene.count?1:.25);
    } else if(scene.kind==='steps') {
      for(const [i,p] of STEP_LEAVES.entries())if(!scene.cleared.has(i))image('sprites/creek-leaf-v1.webp',p.x,p.y,unit*.065,i*.8);
      hiker(.45+reveal*.23,.91-reveal*.35,s.phase==='reveal'&&reveal<1?s.reveal:0);
    } else if(scene.kind==='wind') {
      const x=s.phase==='play'?.3:.3+reveal*.43,y=s.phase==='play'?.68:.68-reveal*.32-Math.sin(reveal*Math.PI)*.1;
      atlas(5,x,y,unit*(.12-reveal*.05),s.phase==='play'?scene.gust*.28:reveal*2);
      const sprig=this.images.get('sprites/mogan-props-v1.webp');if(sprig){ctx.save();ctx.translate(w*.73,h*.23);ctx.rotate(scene.gust*.13);ctx.drawImage(sprig,528,549,480,437,-unit*.17,-unit*.08,unit*.34,unit*.31);ctx.restore();}
      if(scene.gust>.05&&s.phase==='play')ring(.3,.79,.06,.65);
    }
    if (s.phase==='reveal') {ctx.fillStyle=`rgba(251,247,225,${Math.min(.12,s.reveal*.025)})`;ctx.fillRect(0,0,w,h);}
    this.canvas?.setAttribute('data-scene',DAY_MEMORIES[s.id].kind);
  }
}
