import { MapCamera, mapCharacterScale, type MapProjection, type MapView } from '../journey/map-camera';
import { Application, Container, Graphics } from 'pixi.js';
import { CharacterFigure, CharacterLibrary, type CharacterSprite } from '../characters/pixi';
import { DEFAULT_CHARACTER, type CharacterId } from '../characters/catalog';
import { clamp } from '../wugong-walk/model';
import type { CoastalJourney } from './chapter';
import { path, WORLD } from './route';
import { drawCoast, noise, SURF_ARCS } from './terrain';
import { WalkingTurn } from '../journey/walking-turn';

export type View=MapView;
export type Projection=MapProjection;
export class CoastalScene {
  private readonly app=new Application();
  private readonly world=new Container();
  private readonly terrainDetails=new Container();
  private readonly waves=new Graphics();
  private readonly shade=new Graphics();
  private readonly sky=new Graphics();
  private readonly walker=new Container();
  private readonly figure=new CharacterFigure();
  private readonly people=new CharacterLibrary();
  private readonly turning=new WalkingTurn(path.heading(0));
  private walk:readonly CharacterSprite[]=[];
  private actions:readonly CharacterSprite[]=[];
  private contacts:readonly number[]=[];
  private selected:CharacterId=DEFAULT_CHARACTER;
  private width=1200;private height=650;
  private readonly camera=new MapCamera();
  private initialized=false;private disposed=false;
  get mode():View{return this.camera.mode;}
  set mode(mode:View){this.camera.mode=mode;}
  constructor(private readonly canvas:HTMLCanvasElement){}
  get character():CharacterId{return this.selected;}
  private use(pack:Awaited<ReturnType<CharacterLibrary['load']>>):void {this.walk=pack.walk;this.actions=pack.actions;this.contacts=pack.walk.map(frame=>frame.contactX);this.selected=pack.id;this.figure.reset();this.turning.resetFooting();}
  async setCharacter(id:CharacterId,signal:AbortSignal):Promise<void>{
    const pack=await this.people.load(id,signal);if(this.disposed||signal.aborted)throw new DOMException('已离开选角','AbortError');this.use(pack);
  }
  async load(signal:AbortSignal):Promise<void>{
    await this.app.init({canvas:this.canvas,autoStart:false,sharedTicker:false,preference:'webgl',antialias:true,background:'#a9ccca',autoDensity:true,resolution:Math.min(2,devicePixelRatio||1),width:this.width,height:this.height});
    this.initialized=true;this.app.stop();
    if(this.disposed||signal.aborted)throw new DOMException('已离开海岸','AbortError');
    const pack=await this.people.initial(signal);if(this.disposed||signal.aborted)throw new DOMException('已离开海岸','AbortError');this.use(pack);
    this.app.stage.addChild(this.world,this.shade,this.sky);drawCoast(this.world,this.waves,this.terrainDetails);
    const shadow=new Graphics().ellipse(0,1,12,3).fill({color:'#536f5a',alpha:.18});
    this.walker.addChild(shadow,this.figure);this.world.addChild(this.walker);
  }
  resize(width:number,height:number):void{
    this.width=width;this.height=height;this.camera.resize(width,height);
    if(this.initialized){this.app.renderer.resolution=Math.min(2,devicePixelRatio||1,Math.sqrt(2800000/Math.max(1,width*height)));this.app.renderer.resize(width,height);}
  }
  paint(journey:CoastalJourney,dt:number,reduced:boolean):Projection {
    const at=journey.point,fit=Math.min((this.width-48)/WORLD.width,(this.height-120)/WORLD.height);
    const targetZoom=this.mode==='overview'?Math.max(.06,fit):this.width<650?.5:.73;
    const z=targetZoom,ahead=path.sample(journey.at+120),hw=this.width/2/z,hh=this.height/2/z;
    const bounded=(value:number,half:number,extent:number)=>half*2>=extent?extent/2:clamp(value,half,extent-half);
    const target=this.mode==='overview'?{x:WORLD.width/2,y:WORLD.height/2}:{x:bounded(at.x+(ahead.x-at.x)*.35+this.width*.10/z,hw,WORLD.width),y:bounded(at.y+(ahead.y-at.y)*.25+this.height*.08/z,hh,WORLD.height)};
    const projection=this.camera.project({center:target,scaleX:z,scaleY:z},dt,reduced);
    this.world.scale.set(projection.scaleX,projection.scaleY);this.world.position.set(projection.x,projection.y);
    this.terrainDetails.alpha=clamp(.65+(projection.scaleX-.12)*1.2,.65,1);
    this.turning.update({at:journey.at,stride:journey.stride,heading:journey.heading,forwardHeading:path.heading(journey.at+18),slope:path.slope(journey.at),moving:journey.moving},dt,this.contacts,reduced);
    const rest=journey.phase.kind==='paused'&&journey.idle>3&&Math.abs(path.slope(journey.at))<.1,frame=rest?this.actions[2]:this.walk[this.turning.frame];
    this.figure.show(frame,dt,rest,reduced);
    const size=mapCharacterScale(projection);
    this.walker.position.set(at.x,at.y);this.walker.scale.set(size.x,size.y);
    this.figure.scale.set(this.turning.facing,1);this.figure.rotation=this.turning.lean;
    this.figure.position.set(this.turning.offsetX,this.turning.offsetY);
    this.waves.clear();
    for(let i=0;i<55;i++){
      const p=(i/55+(reduced?0:journey.clock*.004))%1;
      const wx=(740+noise(i+12)*285)*3,wy=(305+p*545)*3;
      this.waves.moveTo(wx,wy).quadraticCurveTo(wx+35,wy-8,wx+65+noise(i+38)*32,wy-3).stroke({color:'#eaf3e4',width:1.5,alpha:.14+noise(i)*.15});
    }
    for(const arc of SURF_ARCS)for(let i=0;i<3;i++){
      const p=reduced?i/3:(i/3+journey.clock*.018)%1;
      const dx=6+p*13,dy=p*3;
      this.waves.moveTo((arc.a.x+dx)*3,(arc.a.y+dy)*3)
        .quadraticCurveTo((arc.c.x+dx)*3,(arc.c.y+dy)*3,(arc.b.x+dx)*3,(arc.b.y+dy)*3)
        .stroke({color:'#f2f3de',width:2.3,alpha:.29*Math.sin(Math.PI*p)});
    }
    // The inner inlet has small, nearly still reflections instead of ocean surf.
    for(let i=0;i<7;i++){const wx=865+i*28,wy=340+Math.sin(i*2.2)*70;this.waves.moveTo(wx,wy).quadraticCurveTo(wx+17,wy+(reduced?0:Math.sin(journey.clock*.7+i)*2),wx+40,wy).stroke({color:'#e4f0dc',width:2,alpha:.22});}
    this.shade.clear().rect(0,0,this.width,this.height).fill({color:'#c49c66',alpha:Math.max(0,journey.progress-.45)*.06});
    this.sky.clear();
    if(!reduced)for(let i=0;i<3;i++){const cx=this.width*.80+i*135+Math.sin(journey.clock*.018+i)*15,cy=105+i*180;this.sky.ellipse(cx,cy,54,11).ellipse(cx+32,cy-5,37,12).fill({color:'#f8f5e8',alpha:.1});}
    this.app.render();return projection;
  }
  destroy():void {if(this.disposed)return;this.disposed=true;if(this.initialized)this.app.destroy({removeView:false},{children:true,texture:false,textureSource:false});this.people.destroy();}
}
