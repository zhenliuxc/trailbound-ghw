import { Graphics } from 'pixi.js';
import type { Point2D } from '../../runtime/projection';

export const noise = (seed: number): number => { const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453; return value - Math.floor(value); };
export const polygon = (g: Graphics, points: readonly Point2D[], color: string, alpha = 1) => g.poly(points.flatMap(p => [p.x,p.y])).fill({ color, alpha });
export const line = (g: Graphics, points: readonly Point2D[], color: string, width: number, alpha = 1) => {
  g.moveTo(points[0].x, points[0].y); for (const p of points.slice(1)) g.lineTo(p.x, p.y);
  g.stroke({ color, width, alpha, cap: 'round', join: 'round' });
};
export function roundedLand(g: Graphics, points: readonly Point2D[], color: string, alpha = 1): void {
  const first = points[0], last = points.at(-1)!;
  g.moveTo((first.x + last.x) / 2, (first.y + last.y) / 2);
  points.forEach((point, i) => { const next = points[(i + 1) % points.length]; g.quadraticCurveTo(point.x, point.y, (point.x + next.x) / 2, (point.y + next.y) / 2); });
  g.closePath().fill({ color, alpha });
}
export function mountain(g: Graphics, x: number, y: number, w: number, h: number, snow: boolean, tone: number): void {
  const crest = [{x:x-w*.56,y:y+h*.88},{x:x-w*.35,y:y+h*.56},{x:x-w*.26,y:y+h*.33},{x:x-w*.17,y:y+h*.34},{x:x-w*.04,y:y+h*.02},{x,y},{x:x+w*.11,y:y+h*.19},{x:x+w*.2,y:y+h*.15},{x:x+w*.31,y:y+h*.44},{x:x+w*.51,y:y+h*.88}];
  roundedLand(g,crest,tone ? '#8e9f98' : '#9eafa3');
  roundedLand(g,[crest[0],crest[1],crest[2],crest[3],crest[4],crest[5],{x:x-w*.08,y:y+h*.44},{x:x-w*.08,y:y+h*.82}],tone ? '#b9c5ad':'#b9c5b4');
  roundedLand(g,[crest[5],crest[6],crest[7],crest[8],crest[9],{x:x+w*.1,y:y+h*.67},{x:x+w*.06,y:y+h*.28}],'#6f8683',.55);
  if(snow) {
    roundedLand(g,[crest[3],crest[4],crest[5],crest[6],crest[7],{x:x+w*.26,y:y+h*.32},{x:x+w*.15,y:y+h*.26},{x:x+w*.08,y:y+h*.35},{x:x-w*.01,y:y+h*.17},{x:x-w*.1,y:y+h*.33}],'#e8eade');
    line(g,[{x:x-w*.03,y:y+h*.33},{x:x-w*.09,y:y+h*.51},{x:x-w*.08,y:y+h*.64}],'#d7dfd5',4,.7);
  }
  for(let i=0;i<7;i++) {const bx=x+w*(i*.07-.24),by=y+h*(.34+i*.055);g.moveTo(bx,by).bezierCurveTo(bx-w*.03,by+h*.17,bx-w*.13,by+h*.19,bx-w*.14,by+h*.35).stroke({color:'#68857b',width:2.2,alpha:.27});}
}
export function hill(g:Graphics,x:number,y:number,w:number,h:number,color:string):void {
  g.moveTo(x-w,y+h*.5).bezierCurveTo(x-w*.7,y+h*.12,x-w*.42,y-h*.08,x-w*.17,y)
    .bezierCurveTo(x+w*.14,y-h*.4,x+w*.52,y+h*.08,x+w,y+h*.5)
    .quadraticCurveTo(x+w*.25,y+h*1.4,x-w,y+h*.5).fill(color);
  g.moveTo(x-w*.8,y+h*.53).bezierCurveTo(x-w*.2,y+h*.05,x+w*.05,y+h*.2,x+w*.7,y+h*.49).stroke({color:'#e4e6c8',width:2,alpha:.18});
}
export function tree(g:Graphics,x:number,y:number,size:number,pine:boolean,tone:number,autumn=false):void {
  g.ellipse(x+4,y+3,size*.37,size*.12).fill({color:'#536b51',alpha:.1});
  g.moveTo(x,y).lineTo(x,y-size*.7).stroke({color:'#7b8062',width:size*.055,cap:'round'});
  if(pine) {
    for(let j=0;j<5;j++) roundedLand(g,[{x,y:y-size*(1-j*.13)},{x:x-size*(.11+j*.035),y:y-size*(.69-j*.13)},{x:x-size*.025,y:y-size*(.73-j*.13)},{x:x+size*(.1+j*.035),y:y-size*(.7-j*.13)}],tone?'#5f7c69':'#73917a');
    g.moveTo(x-size*.02,y-size*.83).lineTo(x-size*.1,y-size*.68).stroke({color:'#b4c1a1',width:size*.035,alpha:.7});
  } else {
    g.ellipse(x-size*.18,y-size*.57,size*.3,size*.29).fill(autumn ? tone ? '#b79760' : '#b48a64' : tone?'#75936b':'#87a477');
    g.ellipse(x+size*.18,y-size*.7,size*.33,size*.29).fill(autumn ? tone ? '#d1b672' : '#c6a077' : tone?'#88a176':'#9bb284');
    g.ellipse(x-size*.02,y-size*.83,size*.27,size*.2).fill({color:autumn?'#e8d49a':'#bccb9c',alpha:.45});
  }
}
export function house(g:Graphics,x:number,y:number,temple=false):void {
  g.roundRect(x-30,y-38,60,38,2).fill(temple?'#d4c2a0':'#dfd6b8');
  polygon(g,[{x:x-40,y:y-35},{x:x-20,y:y-58},{x:x+20,y:y-58},{x:x+40,y:y-35}],temple?'#967b63':'#7b8982');
  g.rect(x-9,y-23,18,23).fill('#72786a');
  for(const d of [-20,20])g.rect(x+d-4,y-25,8,9).fill('#a2ad99');
  if(temple) {g.moveTo(x-35,y-37).lineTo(x+35,y-37).stroke({color:'#bba06c',width:3});g.rect(x-16,y-72,32,16).fill('#d3c4a5');polygon(g,[{x:x-25,y:y-70},{x,y:y-85},{x:x+25,y:y-70}],'#927b62');}
}
export function river(g: Graphics, points: readonly Point2D[], width: number): void {
  for (const [color, size] of [['#8faeaa', width], ['#b5cdc0', width * .68], ['#e8ecda', 2]] as const) {
    g.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length - 1; i++) {
      const p = points[i], next = points[i + 1];
      g.quadraticCurveTo(p.x, p.y, (p.x + next.x) / 2, (p.y + next.y) / 2);
    }
    const end = points.at(-1)!; g.lineTo(end.x, end.y).stroke({ color, width: size, cap: 'round', join: 'round' });
  }
}

