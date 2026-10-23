import { Container, Graphics, GraphicsPath } from 'pixi.js';
import { path, PLACE_ORDER, PLACES, WORLD } from './route';
import type { Point } from '../wugong-walk/model';

export const noise=(i:number):number=>{const n=Math.sin(i*127.1+311.7)*43758.5453;return n-Math.floor(n);};
const COAST='M-2000 -2000H-400C-40-800 190-200 240 0C255 65 252 115 294 144C316 176 351 179 381 154C404 135 421 105 414 75C406 33 426 22 490 0C520-160 650-700 900-2000H1000C1090-650 1140 60 930 291C949 317 892 354 841 347C802 341 782 333 768 349C758 367 772 395 813 414C847 430 875 443 887 471C899 498 829 545 785 542C740 539 724 512 695 513C680 529 696 553 743 578C780 599 824 612 829 642C837 671 784 701 788 729C792 758 785 765 753 779C733 789 724 811 743 838C790 1020 650 1230 730 1800H-2000Z';
interface SurfArc {readonly a:Point;readonly c:Point;readonly b:Point}
export const SURF_ARCS:readonly SurfArc[]=[
  {a:{x:830,y:348},c:{x:736,y:331},b:{x:809,y:406}},
  {a:{x:781,y:542},c:{x:640,y:474},b:{x:739,y:577}},
  {a:{x:785,y:749},c:{x:699,y:778},b:{x:741,y:834}},
];
function shape(d:string,fill:string,stroke='none',width=0,alpha=1):Graphics {
  const g=new Graphics(),outline=new GraphicsPath(d);
  if(fill!=='none')g.path(outline).fill(fill);
  if(stroke!=='none')g.path(outline).stroke({color:stroke,width,cap:'round',join:'round'});
  g.alpha=alpha;return g;
}
function line(layer:Container,d:string,color:string,width=1,alpha=.35):void{layer.addChild(shape(d,'none',color,width,alpha));}
function clearOfTrail(x:number,y:number,pad:number):boolean {
  return !path.points.some(p=>Math.abs(p.x-x*3)<pad*3&&Math.abs(p.y-y*3)<pad*3);
}
function rock(g:Graphics,x:number,y:number,r:number,seed:number):void {
  g.ellipse(x+1,y+r*.35,r*1.1,r*.48).fill({color:'#657b70',alpha:.14});
  g.moveTo(x-r,y).lineTo(x-r*.7,y-r*.67).lineTo(x+r*.3,y-r*.87).lineTo(x+r,y-r*.14)
    .lineTo(x+r*.72,y+r*.47).lineTo(x-r*.58,y+r*.46).closePath().fill(seed%3?'#b6bbac':'#a4b2a7');
  g.moveTo(x-r*.7,y-r*.67).lineTo(x+r*.3,y-r*.87).lineTo(x+r*.5,y-r*.24).lineTo(x-r*.25,y-r*.08).closePath().fill({color:'#dddcc8',alpha:.8});
  if(r>3)g.moveTo(x-r*.13,y-r*.64).lineTo(x+r*.12,y-r*.1).lineTo(x-r*.18,y+r*.33).stroke({color:'#87978b',width:.55,alpha:.65});
}
function shrub(g:Graphics,x:number,y:number,r:number,seed:number,wood:boolean):void {
  const h=r*(wood?1.08:.58),base=y+(wood?3:1);
  g.ellipse(x+1,base+2,r*1.3,r*.28).fill({color:'#61775f',alpha:.12});
  if(wood)g.moveTo(x,base).lineTo(x,y-h*.7).stroke({color:'#8c9674',width:1.5,alpha:.7});
  g.moveTo(x-r,y).bezierCurveTo(x-r*1.2,y-h*.65,x-r*.55,y-h*1.2,x-r*.12,y-h)
    .bezierCurveTo(x+r*.45,y-h*1.35,x+r*1.12,y-h*.6,x+r,y-h*.13)
    .bezierCurveTo(x+r*.7,y+h*.2,x-r*.6,y+h*.23,x-r,y).fill(seed%3?'#809b76':'#91a780');
  g.ellipse(x-r*.25,y-h*.6,r*.47,h*.22).fill({color:'#b2c095',alpha:.6});
  g.moveTo(x+r*.25,y-h*.12).quadraticCurveTo(x+r*.56,y-h*.19,x+r*.64,y-h*.42).stroke({color:'#607f65',width:.65,alpha:.55});
}
function relief(land:Container):void {
  land.addChild(shape(COAST,'#cbd5b3'));
  land.addChild(shape('M-160 288C-130 131 22 143 155 199C242 245 277 211 333 154C380 219 342 283 275 311C168 348 74 293-26 355C-86 394-128 435-160 488C-220 484-215 350-160 288Z','#b9c9a6','none',0,.65));
  land.addChild(shape('M-80 681C2 554 103 523 216 537C292 553 338 532 380 488C404 552 359 612 300 645C213 686 192 750 111 792C11 847-47 839-80 906C-170 898-180 765-80 681Z','#bdcba8','none',0,.75));
  land.addChild(shape('M488-120C612-21 683 39 792 92C885 141 883 222 921 287C854 252 807 221 753 186C672 149 626 124 577 76C531 36 509-33 488-120Z','#bac8a4','none',0,.7));
  line(land,'M-70 318C47 248 137 265 191 289S280 277 307 235M12 718C92 671 168 647 204 604M595 1C662 59 724 93 783 118S854 187 878 231','#97b08d',1.1,.22);
  land.addChild(shape('M-100 1350C80 1050 273 698 283 582C297 488 363 453 416 480C457 500 493 473 555 420C585 462 593 518 620 556C668 629 670 944 712 1350Z','#afc098'));
  land.addChild(shape('M150 1350C260 1000 360 697 377 614C389 545 465 509 555 420C534 489 537 549 509 586C468 646 498 712 466 769C449 902 448 1126 456 1350Z','#8fa580','none',0,.52));
  land.addChild(shape('M65 362C154 288 216 341 291 320C368 296 409 196 470 135C503 172 538 199 554 249C579 319 656 299 720 330C685 380 639 409 589 379C548 354 497 327 458 351C395 393 378 449 308 430C232 409 167 430 65 438C17 439 20 399 65 362Z','#afc19b'));
  land.addChild(shape('M216 403C317 376 362 315 396 273C428 232 454 185 470 135C486 190 478 240 509 280C544 318 588 319 625 351C543 332 495 308 456 337C399 384 375 419 318 422Z','#8da580','none',0,.43));
  // Short interlocking spurs, instead of one uninterrupted triangular slope.
  for(const [d,color,alpha] of [
    ['M555 420C566 491 595 516 632 546C665 571 671 608 692 636C655 611 635 584 607 571C558 547 539 491 555 420Z','#d9dcad',.64],
    ['M518 464C494 521 483 551 445 580C399 613 405 663 376 703C382 649 367 605 407 569C452 529 493 504 518 464Z','#6f9178',.18],
    ['M545 512C568 557 565 605 590 640C619 682 632 733 634 782C608 731 596 701 566 675C535 638 537 572 545 512Z','#bfcba3',.72],
    ['M474 588C457 648 455 687 421 730C391 769 384 823 365 868C362 815 354 775 389 725C428 671 428 622 474 588Z','#73967c',.19],
    ['M470 135C476 190 512 208 544 228C587 254 607 290 655 305C597 305 581 280 549 269C500 250 471 207 470 135Z','#d2d7aa',.57],
    ['M449 190C425 248 400 276 379 316C356 358 315 376 293 405C307 361 331 333 347 296C377 251 422 224 449 190Z','#75947b',.19],
    ['M680 370C709 400 708 443 729 469C741 487 768 499 788 516C750 516 717 498 700 470C681 437 692 403 680 370Z','#b2c39c',.68],
  ] satisfies readonly (readonly [string,string,number])[])land.addChild(shape(d,color,'none',0,alpha));
  for(let i=0;i<7;i++){
    const t=i*13;
    line(land,`M${342+t} ${806-t*.7}C${364+t} ${731-t*.6} ${386+t} ${689-t} ${406+t} ${639-t}S${493+t*.4} ${502-t*.5} ${539+t*.15} ${450-t*.7}`,'#819b7d',.7,.25);
    line(land,`M${271+t} ${364+t*.35}C${336+t} ${345+t*.1} ${374+t*.6} ${265+t*.4} ${441+t*.2} ${199+t*.3}`,'#7c987c',.65,.24);
  }
  line(land,'M384 797C405 732 431 679 452 626C482 553 534 492 555 441M287 352C345 328 382 284 415 228M578 334C535 304 495 280 487 241','#688c73',1.25,.26);
  line(land,'M575 466C581 505 604 525 635 548M486 160C497 192 526 211 547 218','#ebebc7',1.5,.42);
}
function beaches(land:Container,details:Container):void {
  const bays=[
    {shore:'M841 347C802 341 782 333 768 349C758 367 772 395 813 414',width:27,x:764,y:358},
    {shore:'M785 542C740 539 724 512 695 513C680 529 696 553 743 578',width:27,x:690,y:528},
    {shore:'M788 729C792 758 785 765 753 779C733 789 724 811 743 838',width:23,x:728,y:793},
  ];
  const grain=new Graphics();
  for(const [index,bay] of bays.entries()){
    line(land,bay.shore,'#ede4c6',bay.width,1);
    line(land,bay.shore,'#cfceb2',4,.72);
    line(land,bay.shore,'#f9efcf',.8,.64);
    for(let i=0;i<32;i++){
      const x=bay.x+(noise(i+index*71)-.5)*20,y=bay.y+(noise(i+index*97+5)-.5)*23;
      grain.ellipse(x,y,.2+noise(i+41)*.4,.2).fill({color:'#a9ac87',alpha:.4});
    }
    for(let i=0;i<5;i++)line(details,`M${bay.x-7+i*1.6} ${bay.y+8+i*2.2}q6-2 12 .7`,'#c6c6a1',.48,.4);
  }
  details.addChild(grain);
  line(land,'M292 166Q338 195 385 170','#7f9f81',4,.35);
}
function vegetation(details:Container):void {
  const canopy=new Graphics(),meadow=new Graphics();details.addChild(meadow,canopy);
  const patches=[
    {x:666,y:719,rx:48,ry:54,wood:false},{x:605,y:638,rx:65,ry:61,wood:false},
    {x:525,y:564,rx:47,ry:58,wood:false},{x:424,y:702,rx:70,ry:58,wood:true},
    {x:369,y:578,rx:65,ry:36,wood:true},{x:616,y:478,rx:39,ry:44,wood:false},
    {x:704,y:426,rx:35,ry:33,wood:false},{x:600,y:292,rx:59,ry:30,wood:false},
    {x:477,y:253,rx:44,ry:42,wood:false},{x:379,y:274,rx:47,ry:50,wood:true},
    {x:268,y:273,rx:53,ry:26,wood:true},{x:207,y:374,rx:71,ry:40,wood:true},
    {x:233,y:204,rx:48,ry:33,wood:true},{x:604,y:790,rx:47,ry:51,wood:false},
    {x:726,y:636,rx:38,ry:35,wood:false},{x:806,y:470,rx:29,ry:24,wood:false},
  ];
  for(const [index,patch] of patches.entries())for(let i=0;i<19;i++){
    const n=index*83+i,angle=noise(n+13)*Math.PI*2,r=Math.sqrt(noise(n+34));
    const x=patch.x+Math.cos(angle)*patch.rx*r,y=patch.y+Math.sin(angle)*patch.ry*r;
    if(!clearOfTrail(x,y,10))continue;
    shrub(canopy,x,y,2.4+noise(n+19)*(patch.wood?5.3:3.2),n,patch.wood);
  }
  for(let i=0;i<510;i++){
    const x=190+noise(i+231)*555,y=180+noise(i+757)*690;
    if(!clearOfTrail(x,y,5))continue;
    meadow.ellipse(x,y,2+noise(i+113)*5,.65+noise(i+27)).fill({color:i%3?'#b8c69a':'#7f9c77',alpha:.25});
    if(i%4===0)meadow.moveTo(x-2,y).quadraticCurveTo(x-2,y-2,x-4,y-2.5).moveTo(x,y).quadraticCurveTo(x+1,y-2.5,x+3,y-2.7).stroke({color:'#839c73',width:.55,alpha:.45});
  }
}
function rockShelves(details:Container):void {
  const g=new Graphics();details.addChild(g);
  for(const [index,p] of [{x:783,y:418},{x:861,y:464},{x:775,y:702},{x:747,y:752},{x:551,y:435},{x:477,y:154}].entries())for(let i=0;i<7;i++){
    const x=p.x+(noise(index*37+i)-.5)*19,y=p.y+(noise(index*71+i+9)-.5)*14;
    if(clearOfTrail(x,y,6))rock(g,x,y,1.9+noise(index*41+i+7)*3,index+i);
  }
  for(let i=0;i<110;i++){
    const at=noise(i+41)*path.length,p=path.sample(at),angle=path.heading(at),side=i%2?1:-1;
    if(Math.abs(path.slope(at))<.055)continue;
    const offset=7+noise(i+61)*6;
    rock(g,p.x/3+Math.sin(angle)*side*offset,p.y/3-Math.cos(angle)*side*offset,.6+noise(i)*1.5,i);
  }
}
function house(g:Graphics,x:number,y:number,w:number,seed:number):void {
  const h=w*.65;
  g.ellipse(x+w*.6,y+h+2,w*.8,h*.35).fill({color:'#607969',alpha:.14});
  g.moveTo(x,y).lineTo(x+w,y-1).lineTo(x+w,y+h).lineTo(x,y+h+1).closePath().fill(seed%2?'#e8e1cd':'#eee7d6');
  g.moveTo(x+w,y-1).lineTo(x+w+3,y-4).lineTo(x+w+3,y+h-2).lineTo(x+w,y+h).closePath().fill('#bcc6ae');
  g.moveTo(x-1,y).lineTo(x+w*.42,y-h*.6).lineTo(x+w+3,y-4).lineTo(x+w,y+1).closePath().fill(seed%3?'#82978a':'#a99d83');
  g.moveTo(x+w*.42,y-h*.6).lineTo(x+w+2,y-3).stroke({color:'#5c7b70',width:.65,alpha:.7});
  g.rect(x+w*.17,y+h*.2,w*.17,h*.25).rect(x+w*.68,y+h*.2,w*.15,h*.25).fill({color:'#6e8c7e',alpha:.75});
  g.rect(x+w*.43,y+h*.3,w*.18,h*.7).fill('#9b9f87');
}
function villages(land:Container,details:Container,waterfront:Container):void {
  const yards=new Graphics(),houses=new Graphics();details.addChild(yards,houses);
  for(const [index,p] of [{x:337,y:218},{x:354,y:220},{x:371,y:215},{x:383,y:231},{x:650,y:476},{x:662,y:465},{x:716,y:317}].entries()){
    if(!clearOfTrail(p.x+5,p.y+3,9))continue;
    yards.roundRect(p.x-5,p.y+2,21,15,3).fill({color:'#e0dec0',alpha:.7});
    house(houses,p.x,p.y,8+index%3*1.5,index);
    line(details,`M${p.x-3} ${p.y+14}q11 3 20-1`,'#9fac8e',.6,.65);
  }
  line(land,'M320 210Q333 201 342 192L341 174','#e7e2c9',3,.9);
  const pier=new Graphics();waterfront.addChild(pier);
  pier.moveTo(341,187).lineTo(340,165).lineTo(352,164).stroke({color:'#566f63',width:4.2,alpha:.2});
  pier.moveTo(340,185).lineTo(339,163).lineTo(351,162).stroke({color:'#acaa89',width:3});
  for(let i=0;i<10;i++)pier.moveTo(337.5,165+i*2).lineTo(340.5,165+i*2).stroke({color:'#e3ddbe',width:.55,alpha:.85});
  for(const [x,y] of [[337,164],[338,179],[350,161]])pier.circle(x,y,.8).fill('#6d8270');
  for(const [x,y] of [[356,165],[349,151]]){
    pier.moveTo(x,y-3).quadraticCurveTo(x+6,y-1,x+3,y+4).quadraticCurveTo(x-3,y+3,x,y-3).fill('#9b9b7c');
    pier.moveTo(x+.7,y-1.5).lineTo(x+2.2,y+2.2).stroke({color:'#ede7c8',width:1});
  }
}
function hikingTrail(world:Container):void {
  const trail=new Graphics();world.addChild(trail);
  const trace=()=>path.points.forEach((p,i)=>i?trail.lineTo(p.x,p.y):trail.moveTo(p.x,p.y));
  trace();trail.stroke({color:'#647f66',width:14,alpha:.14,cap:'round',join:'round'});
  trace();trail.stroke({color:'#f2eedb',width:6.5,alpha:.94,cap:'round',join:'round'});
  // Sparse groups of stone treads leave the ridge path continuous.
  for(let at=50;at<path.length-30;at+=119){
    if(Math.abs(path.slope(at))<.15)continue;
    for(let i=0;i<3;i++){
      const p=path.sample(at+i*8),angle=path.heading(at+i*8),nx=Math.sin(angle)*4,ny=-Math.cos(angle)*4;
      trail.moveTo(p.x-nx,p.y-ny).lineTo(p.x+nx,p.y+ny).stroke({color:'#9ba78c',width:1.3,alpha:.58});
    }
  }
}
function placeGrounds(land:Container,details:Container):void {
  const connections=new Graphics(),places=new Graphics();land.addChild(connections);details.addChild(places);
  for(const id of PLACE_ORDER){
    const place=PLACES[id],x=place.site.x/3,y=place.site.y/3;
    const road=path.sample(path.at(id));
    connections.moveTo(road.x/3,road.y/3).quadraticCurveTo(x+4,(y+road.y/3)/2,x,y)
      .stroke({color:'#e9e5ce',width:1.9,alpha:.9,cap:'round',join:'round'});
    places.ellipse(x,y+3,16,5.5).fill({color:'#6a806a',alpha:.12});
    if(id==='longke'){
      places.ellipse(x,y+1,20,9).fill({color:'#e7dfbb',alpha:.85});
      // A trail post and worn stepping stones at the inland edge of the beach.
      for(let i=0;i<5;i++)places.ellipse(x+6+i*3.3,y-1-i*1.4,2,1).fill({color:'#b7ba9b',alpha:.6});
      places.moveTo(x-9,y).lineTo(x-9,y-17).stroke({color:'#8b9070',width:1.4});
      places.moveTo(x-12,y-17).lineTo(x-2,y-17).lineTo(x-1,y-10).lineTo(x-12,y-10).closePath().fill('#f0ead1');
      places.moveTo(x-9,y-15).lineTo(x-4,y-15).moveTo(x-9,y-12).lineTo(x-6,y-12).stroke({color:'#74876a',width:.6});
      rock(places,x-20,y+3,4.5,1);shrub(places,x-23,y-6,5,2,false);
    }else if(id==='saiwanShan'){
      places.moveTo(x-24,y+3).quadraticCurveTo(x-7,y-20,x+8,y-17).lineTo(x+22,y+2).quadraticCurveTo(x+5,y+11,x-24,y+3).fill({color:'#b9c39f',alpha:.9});
      for(const [dx,dy,r] of [[-16,0,5],[7,-6,6],[15,2,3]] )rock(places,x+dx,y+dy,r,2);
      places.moveTo(x-2,y+2).lineTo(x-1,y-11).lineTo(x+3,y-12).lineTo(x+5,y+1).closePath().fill('#e0dfc9');
      places.moveTo(x-1,y-11).lineTo(x+3,y-12).lineTo(x+4,y-7).lineTo(x,y-6).closePath().fill('#f5f0d8');
      places.moveTo(x+1,y-6).lineTo(x+2,y-3).stroke({color:'#899c81',width:.7});
      for(let i=0;i<4;i++)places.moveTo(x-12+i*6,y+5).quadraticCurveTo(x-14+i*6,y+1,x-16+i*6,y).stroke({color:'#819971',width:.7,alpha:.65});
    }else if(id==='saiwan'||id==='hamtin'){
      places.ellipse(x,y+1,21,9).fill({color:'#d8d8b9',alpha:.9});
      house(places,x-12,y-10,11,id==='saiwan'?1:3);house(places,x+5,y-17,9,2);
      places.moveTo(x-18,y+6).quadraticCurveTo(x,y+11,x+20,y+3).stroke({color:'#a9b395',width:.8,alpha:.7});
      shrub(places,x-21,y-11,6,3,true);shrub(places,x+20,y-3,4,1,false);
      for(let i=0;i<3;i++)places.roundRect(x-6+i*3,y+1-i*1.1,2.2,1.1,.35).fill({color:'#a5b198',alpha:.7});
      if(id==='hamtin'){
        // A small beach-side clearing; the photo marker remains beside the village.
        places.moveTo(x+12,y+6).quadraticCurveTo(x+27,y+7,x+29,y+19).stroke({color:'#e3dab8',width:2.4,cap:'round'});
        rock(places,x+24,y+11,2.8,1);
      }
    }else if(id==='taiLongAu'){
      places.moveTo(x-29,y+8).quadraticCurveTo(x-21,y-10,x-10,y-12).lineTo(x-3,y+1).lineTo(x+8,y-2)
        .quadraticCurveTo(x+14,y-18,x+26,y-17).lineTo(x+32,y+10).quadraticCurveTo(x+3,y+15,x-29,y+8).fill({color:'#b1c39c',alpha:.9});
      places.moveTo(x-17,y+6).quadraticCurveTo(x-4,y+7,x+8,y-2).stroke({color:'#ece7ce',width:2.1,cap:'round'});
      places.moveTo(x-4,y+2).lineTo(x-4,y-13).stroke({color:'#7c8e6c',width:1.4});
      places.moveTo(x-10,y-12).lineTo(x+4,y-12).lineTo(x+7,y-9).lineTo(x+4,y-6).lineTo(x-10,y-6).closePath().fill('#e5ddbb');
      places.moveTo(x-8,y-9).lineTo(x+2,y-9).stroke({color:'#8a9775',width:.65});
      shrub(places,x-25,y,5,4,false);rock(places,x+24,y+5,5,3);
    }else if(id==='chekKeng'){
      places.ellipse(x,y+1,23,9).fill({color:'#cdd1b1',alpha:.8});
      house(places,x-13,y-8,11,0);house(places,x+3,y-11,9,1);
      // This village lane joins the existing waterfront and pier to its north.
      places.moveTo(x,y+3).quadraticCurveTo(x+8,y-9,340,185).stroke({color:'#e3dfc7',width:2.1,cap:'round'});
      places.moveTo(x-16,y+8).lineTo(x+17,y+7).stroke({color:'#9ea98d',width:1});
      shrub(places,x-24,y-9,6,4,true);
    }else{
      places.ellipse(x,y,22,10).fill('#c4ceb0');
      for(let i=0;i<5;i++)places.moveTo(x-7,y-13+i*2.5).lineTo(x+7,y-13+i*2.5).stroke({color:'#eee8cf',width:1.6});
      for(const [dx,dy] of [[-22,-7],[-17,7],[23,-9],[26,7]])shrub(places,x+dx,y+dy,7.5,dx,true);
      places.moveTo(x+8,y+2).lineTo(x+8,y-16).stroke({color:'#7b8969',width:1.6});
      places.roundRect(x+3,y-17,12,8,1).fill('#ece6cb');
      places.moveTo(x+6,y-14).lineTo(x+12,y-14).moveTo(x+6,y-12).lineTo(x+10,y-12).stroke({color:'#748565',width:.7});
      rock(places,x-11,y+5,4,1);
    }
  }
}
export function drawCoast(world:Container,waves:Graphics,details:Container):void {
  world.addChild(new Graphics().rect(0,0,WORLD.width,WORLD.height).fill('#a9ccca'));
  const sea=new Container(),land=new Container(),waterfront=new Container();
  for(const layer of [sea,land,waterfront])layer.scale.set(3);
  const coastMask=shape(COAST,'#fff');coastMask.scale.set(3);world.addChild(coastMask,sea,land);
  land.mask=coastMask;sea.setMask({mask:coastMask,inverse:true});waves.setMask({mask:coastMask,inverse:true});
  for(const [width,color,alpha] of [[72,'#7daeb0',.15],[43,'#b6d8c9',.24],[19,'#d6e6ce',.3]] satisfies readonly (readonly [number,string,number])[])line(sea,COAST,color,width,alpha);
  sea.addChild(shape('M291 148Q333 179 381 153L386 170Q336 193 294 165Z','#b8c9b2','none',0,.55));
  for(let i=0;i<4;i++)line(sea,`M${303+i*3} ${156+i*4}q29 12 65-1`,'#92b8a7',.65,.4);
  relief(land);
  beaches(land,details);vegetation(details);rockShelves(details);villages(land,details,waterfront);
  placeGrounds(land,details);
  land.addChild(details);
  hikingTrail(world);world.addChild(waterfront,waves);
}
