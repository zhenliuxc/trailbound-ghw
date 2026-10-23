import type { Point, Rect } from './model';

type Ctx=CanvasRenderingContext2D;
const grain=(i:number)=>{const n=Math.sin(i*127.1+311.7)*43758.5453;return n-Math.floor(n);};
export function paperLayer(doc:Document):HTMLCanvasElement{
 const canvas=doc.createElement('canvas');canvas.width=256;canvas.height=256;
 const ctx=canvas.getContext('2d');if(!ctx)return canvas;
 for(let i=0;i<5100;i++){const value=i%3?'#716853':'#fff8df';ctx.globalAlpha=.025+grain(i+13)*.04;ctx.fillStyle=value;ctx.fillRect(grain(i)*256,grain(i+7)*256,.6+grain(i+9)*1.5,.4+grain(i+11)*.7);}
 ctx.lineWidth=.45;ctx.strokeStyle='#978b6a';ctx.globalAlpha=.045;
 for(let i=0;i<70;i++){const x=grain(i+40)*256,y=grain(i+61)*256;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+grain(i+20)*5,y+1);ctx.stroke();}
 return canvas;
}
export function snowContact(ctx:Ctx,at:Point,width:number,depth=7):void{
 ctx.save();ctx.translate(at.x,at.y);ctx.fillStyle='#70858a';
 for(let i=0;i<5;i++){ctx.globalAlpha=.025+i*.007;ctx.beginPath();ctx.ellipse((grain(i+7)-.5)*width*.12,1+i*.2,width*(.42-i*.035),depth*(.8-i*.09),-.035,0,Math.PI*2);ctx.fill();}
 ctx.strokeStyle='#f9f3e1';ctx.globalAlpha=.65;ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(-width*.3,depth*.3);ctx.quadraticCurveTo(0,depth*.7,width*.31,depth*.2);ctx.stroke();ctx.restore();
}
export function snowMark(ctx:Ctx,at:Point,size:number,angle:number,hoof=false):void{
 ctx.save();ctx.translate(at.x,at.y);ctx.rotate(angle);ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle='#718b8b';ctx.lineWidth=hoof?size*.42:size*.7;ctx.globalAlpha=.27;
 for(const x of hoof?[-size*.32,size*.32]:[0]){ctx.beginPath();ctx.moveTo(x-size*.1,-size*.48);ctx.quadraticCurveTo(x-size*.28,0,x+size*.04,size*.48);ctx.stroke();}
 ctx.globalAlpha=.4;ctx.lineWidth=.8;ctx.strokeStyle='#fff9e9';ctx.beginPath();ctx.moveTo(-size*.65,size*.6);ctx.quadraticCurveTo(0,size*.9,size*.6,size*.5);ctx.stroke();ctx.restore();
}
export function washPaper(ctx:Ctx,texture:HTMLCanvasElement,rect:Rect):void{
 const pattern=ctx.createPattern(texture,'repeat');if(!pattern)return;
 ctx.save();ctx.globalCompositeOperation='multiply';ctx.globalAlpha=.5;ctx.fillStyle=pattern;ctx.fillRect(rect.x,rect.y,rect.width,rect.height);ctx.restore();
}
