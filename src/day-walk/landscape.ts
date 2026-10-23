import { Container, Graphics } from 'pixi.js';
import type { Point2D } from '../runtime/projection';
import type { DayRoute, DayRouteId, DayTrail } from '../journey/day-route';

import { noise, roundedLand, line, mountain, hill, tree, house, river } from './landscape/primitives';
import { drawMogan } from './landscape/mogan';
import { drawWestlake } from './landscape/westlake';
import type { LandscapeEffects } from './landscape/effects';
export { noise } from './landscape/primitives';

function changpingForestPatch(g: Graphics, x: number, y: number, width: number, height: number, seed: number, count: number): void {
  roundedLand(g, Array.from({ length: 10 }, (_, j) => {
    const a = j / 10 * Math.PI * 2, r = .8 + noise(seed * 11 + j) * .25;
    return { x: x + Math.cos(a) * width * r, y: y + Math.sin(a) * height * r };
  }), seed % 2 ? '#718c74' : '#859a78', .25);
  const trees = Array.from({ length: count }, (_, j) => ({
    x: x + (noise(seed * 17 + j + 34) - .5) * width * 1.7,
    y: y + (noise(seed * 23 + j + 58) - .5) * height * 1.4,
    size: 30 + noise(seed * 13 + j + 63) * 34, pine: j % 3 !== 0, tone: j % 2,
  })).sort((a, b) => a.y - b.y);
  for (const t of trees) tree(g, t.x, t.y, t.size, t.pine, t.tone, true);
  for (let j = 0; j < 5; j++) {
    const rx = x + (noise(seed * 3 + j + 5) - .5) * width * 2, ry = y + height * .8 + j * 9;
    g.ellipse(rx + 3, ry + 3, 10, 4).fill({ color: '#627c69', alpha: .15 });
    roundedLand(g, [{ x: rx - 9, y: ry + 2 }, { x: rx - 4, y: ry - 8 }, { x: rx + 7, y: ry - 6 }, { x: rx + 12, y: ry + 3 }], '#b8bea4');
  }
}

function changpingNearSlopes(terrain: Graphics, details: Graphics, trail: DayTrail): void {
  const bank = trail.points.filter((_, i, points) => i % 8 === 0 || i === points.length - 1)
    .map(p => ({ x: p.x + 220, y: p.y + 185 }));
  roundedLand(terrain, [...bank, { x: 3700, y: 590 }, { x: 3700, y: 2600 }, { x: 760, y: 2600 }], '#9eaf94');
  for (const [i, at] of [.04, .23, .42, .61, .79].entries()) {
    const p = trail.sample(trail.length * at), x = p.x + 215, y = p.y + 175;
    roundedLand(terrain, [
      { x: x - 35, y: y + 110 }, { x: x + 45, y: y - 15 }, { x: x + 230, y: y - 80 },
      { x: x + 520, y: y - 205 }, { x: x + 730, y: y - 45 }, { x: x + 820, y: y + 300 },
      { x: x + 560, y: y + 475 }, { x: x + 145, y: y + 380 },
    ], i % 2 ? '#8ca187' : '#94a98b');
    roundedLand(terrain, [
      { x, y: y + 100 }, { x: x + 185, y: y - 10 }, { x: x + 520, y: y - 205 },
      { x: x + 370, y: y + 70 }, { x: x + 240, y: y + 250 }, { x: x + 60, y: y + 255 },
    ], '#bdc5a1', .48);
    roundedLand(terrain, [
      { x: x + 520, y: y - 205 }, { x: x + 730, y: y - 45 }, { x: x + 820, y: y + 300 },
      { x: x + 545, y: y + 340 }, { x: x + 370, y: y + 70 },
    ], '#6e8a77', .28);
    terrain.moveTo(x + 520, y - 177).bezierCurveTo(x + 350, y - 80, x + 300, y + 40, x + 95, y + 170)
      .stroke({ color: '#d3d4ae', width: 3, alpha: .45 });
    for (let j = 0; j < 4; j++) {
      terrain.moveTo(x + 580 + j * 36, y - 80 + j * 62)
        .bezierCurveTo(x + 425, y + j * 72, x + 470, y + 190 + j * 42, x + 270, y + 260 + j * 30)
        .stroke({ color: '#648173', width: 2.5, alpha: .24 });
    }
  }
  roundedLand(terrain, [
    { x: 1060, y: 2440 }, { x: 1290, y: 2010 }, { x: 1670, y: 1680 }, { x: 2060, y: 1610 },
    { x: 2470, y: 1830 }, { x: 3260, y: 1940 }, { x: 3700, y: 2490 }, { x: 2450, y: 2870 },
  ], '#acb997', .66);
  for (let i = 0; i < 6; i++) {
    terrain.moveTo(1020 + i * 70, 2330 + i * 56)
      .bezierCurveTo(1490, 1610 + i * 110, 2280, 1870 + i * 105, 3220, 2150 + i * 73)
      .stroke({ color: i % 2 ? '#6d8974' : '#d3d5b3', width: 3, alpha: .17 });
  }
  // These connected groves cover the near valley wall, clear of the walking path.
  for (const [i, [x, y]] of [
    [880, 2370], [1100, 2040], [1350, 2230], [1690, 2120], [2020, 2350],
    [2360, 2200], [2740, 2070], [3020, 2310], [1650, 1730], [1960, 1850],
    [2310, 1720], [2670, 1560], [3000, 1810], [3250, 1470],
  ].entries()) {
    changpingForestPatch(details, x, y, 180 + noise(i + 78) * 70, 90 + noise(i + 92) * 45, i + 30, 26);
  }
  for (let patch = 0; patch < 13; patch++) {
    const p = trail.sample(trail.length * (.015 + patch * .06));
    const x = p.x + 345 + patch % 3 * 105, y = p.y + 210 + noise(patch + 84) * 100;
    const width = 115 + noise(patch + 42) * 75, height = 65 + noise(patch + 29) * 60;
    changpingForestPatch(details, x, y, width, height, patch, 13);
  }
}

function changpingMeadow(g: Graphics, p: Point2D, openValley: boolean): void {
  const x = p.x + 65, y = p.y + 48, radius = openValley ? 145 : 92;
  roundedLand(g, [{ x: x - radius, y }, { x: x - radius * .5, y: y - 25 }, { x: x + radius * .4, y: y - 20 }, { x: x + radius, y: y + 10 }, { x: x + radius * .4, y: y + 36 }, { x: x - radius * .6, y: y + 28 }], '#d2c9a2', .85);
  g.moveTo(x - radius * .8, y + 10).quadraticCurveTo(x, y + 39, x + radius * .8, y + 11)
    .stroke({ color: '#b4b78f', width: 3, alpha: .7 });
  for (let i = 0; i < 15; i++) {
    const a = i / 15 * Math.PI * 2, gx = x + Math.cos(a) * radius * .78, gy = y + 9 + Math.sin(a) * 22;
    g.moveTo(gx - 4, gy - 7).quadraticCurveTo(gx, gy - 6, gx, gy + 2).lineTo(gx + 3, gy - 9)
      .stroke({ color: i % 3 ? '#9b9d72' : '#b89d65', width: 1.7, cap: 'round' });
  }
}

function drawChangping(world: Container, trail: DayTrail): void {
  const back=new Graphics(),terrain=new Graphics(),water=new Graphics(),details=new Graphics(),road=new Graphics(),sites=new Graphics();
  world.addChild(back,terrain,water,details,road,sites);
  back.rect(-4000,-3000,11000,8500).fill('#d8e0d8');
  back.rect(-4000,90,11000,7000).fill('#becbb5');
  {
    hill(terrain,900,600,1250,1000,'#9cad9c'); hill(terrain,2500,550,1050,1250,'#91a896');
    mountain(terrain,340,260,780,1270,true,1); mountain(terrain,910,100,900,1070,true,0);
    mountain(terrain,1500,90,740,800,true,1); mountain(terrain,2200,40,780,480,true,0);
    mountain(terrain,2880,180,850,970,true,1);
    changpingNearSlopes(terrain,details,trail);
    const valley=trail.points.map(p=>({x:p.x+80,y:p.y+55}));
    line(terrain,valley,'#a8b49a',430);line(terrain,valley,'#c1c5a0',300);line(terrain,valley,'#d6d2ae',175);
    hill(terrain,580,1600,520,440,'#8ea984');
    const stream=[{x:350,y:2300},{x:485,y:2090},{x:705,y:1920},{x:815,y:1815},...trail.points.map((p,i)=>({x:p.x+80+Math.sin(i*.08)*16,y:p.y+92}))];
    line(terrain,stream,'#cbd0ad',60,.55);
    river(water,stream,36);
    for(const at of [.12,.38,.63,.86]) {
      const q=trail.sample(trail.length*at);
      const channel=[{x:q.x+660,y:q.y+120},{x:q.x+475,y:q.y+200},{x:q.x+320,y:q.y+165},{x:q.x+215,y:q.y+115},{x:q.x+80,y:q.y+92}];
      line(terrain,channel,'#91a58d',27,.55);river(water,channel,10);
    }
    for(let i=0;i<24;i++) {const q=trail.sample(trail.length*i/24);water.ellipse(q.x+83,q.y+96,8,4).fill('#81988d');}
    const meadow=trail.sample(trail.length*.92);
    hill(details,meadow.x,meadow.y+55,255,140,'#d2c8a1');
    for(let i=0;i<28;i++) {const x=meadow.x+(noise(i+50)-.5)*410,y=meadow.y+30+noise(i+15)*95;details.moveTo(x,y).lineTo(x-3,y-8).stroke({color:'#97ad79',width:1.5});}
  }
  // Broad foliage groups follow the valley; the trail itself remains unobstructed.
  for(let i=0;i<225;i++) {
    const at=trail.length*noise(i+13),p=trail.sample(at),side=i%2?1:-1;
    const x=p.x+side*(100+noise(i+41)*330),y=p.y+(noise(i+26)-.5)*200;
    if(at>trail.length*.85)continue;
    if(trail.points.some((q,j)=>j%4===0&&Math.hypot(q.x-x,q.y-y)<61))continue;
    const size=26+noise(i+59)*44;
    tree(details,x,y,size,i%3===0,i%2,true);
  }
  for(let i=0;i<160;i++) {
    const p=trail.sample(trail.length*i/160),d=i%2?24:-24,x=p.x+d+noise(i+86)*17,y=p.y+6;
    details.ellipse(x,y,3+noise(i)*5,2+noise(i+14)*2).fill({color:'#8b9989',alpha:.6});
    if(i%4===0)details.moveTo(x-8,y+4).quadraticCurveTo(x-5,y-4,x-1,y-6).stroke({color:'#9eae7b',width:1.5,alpha:.7});
    if(i%7===0) {details.ellipse(x+12,y+5,13,6).fill({color:'#758d70',alpha:.25});details.ellipse(x+9,y+1,11,5).fill('#a3ad98');}
  }
  line(road,trail.points,'#aab39b',13,.6);
  line(road,trail.points,'#ddd9bd',8);
  for(let at=12;at<trail.length;at+=45) {
    const p=trail.sample(at),heading=trail.heading(at),nx=-Math.sin(heading),ny=Math.cos(heading);
    road.ellipse(p.x+nx*3,p.y+ny*3,2,1.2).fill({color:'#a6aa91',alpha:.6});
  }
  for(const place of trail.route.places) {
    const p=trail.sample(trail.knotDistances[place.knot]);
    if(place.feature==='temple')house(sites,p.x-55,p.y-36,true);
    if(place.feature==='redrock')for(let i=0;i<9;i++) {const x=p.x+45+noise(i)*85,y=p.y+30+noise(i+8)*65;sites.ellipse(x,y,12+noise(i+11)*15,7+noise(i+12)*7).fill(i%2?'#af8c75':'#b59c84');sites.ellipse(x-3,y-4,8,3).fill({color:'#d1ac8d',alpha:.6});}
    if(place.id==='deadtrees')for(let i=0;i<5;i++) {const x=p.x+75+i*23,y=p.y+85+Math.sin(i)*22;line(sites,[{x,y},{x:x+4,y:y-58}],'#818b77',4);line(sites,[{x:x+2,y:y-30},{x:x-15,y:y-47}],'#818b77',3);line(sites,[{x:x+3,y:y-40},{x:x+18,y:y-55}],'#818b77',3);}
    if(place.feature==='meadow')changpingMeadow(sites,p,place.id==='muluozi');
    if(place.feature==='gate') {line(sites,[{x:p.x-35,y:p.y-16},{x:p.x-35,y:p.y-55},{x:p.x+10,y:p.y-55},{x:p.x+10,y:p.y-16}],'#8c987a',4);}
  }
}

const landscapes = { changping: drawChangping, mogan: drawMogan, westlake: drawWestlake } satisfies Record<DayRouteId, (world: Container, trail: DayTrail) => LandscapeEffects | void>;

export function drawLandscape(world: Container, route: DayRoute, trail: DayTrail): LandscapeEffects | undefined {
  return landscapes[route.id](world, trail) ?? undefined;
}
