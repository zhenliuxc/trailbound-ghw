(function(root,factory){const api=factory(typeof module==='object'&&module.exports?require('./art-play-atlas.js'):root.TrailArtAtlas);if(typeof module==='object'&&module.exports)module.exports=api;else root.TrailArtGames=api;}(typeof globalThis!=='undefined'?globalThis:this,function(Atlas){
 'use strict';
 const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,Number.isFinite(n)?n:a)),ease=n=>{n=clamp(n);return n*n*(3-2*n);};
 const kinds={'meadow-flower':'puzzle','westlake-tea':'match','bamboo-leaf':'sling'};
 const assets={puzzle:{scene:'scenes/wugong-altar-v1.webp'},match:{scene:'badges/westlake-longjing-bud-v4.webp',actor:Atlas.file},sling:{scene:'scenes/mogan-v1.webp',actor:Atlas.file}};
 const routes={puzzle:'wugong',match:'westlake',sling:'mogan'};
 const prompts={puzzle:'把下面的六片画片拖进画框。也可以先点画片，再点对应位置。',match:'交换相邻的茶芽卡，连成三个或更多同类叶形，清开六处露光印记。可点选或滑动交换，提示与重排随时可用。',sling:'按住纸叶向后拉，松手送过竹隙，让它停在远山纸签上。'};
 const results={puzzle:'我把散开的石坛画片一块块拼好，接回拱线、石缝与苔色。一座石坛，在纸上重新完整了。',match:'我交换叶形，让相连的春芽一片片舒展。六处露光散开，纸上的茶园重新透亮起来。',sling:'我把一枚纸叶送进竹林的风里。它穿过竹影，稳稳停在远山窗旁的小纸签上。'};
 const puzzleBoard={x:.15,y:.075,w:.70,h:.70*2/3};
 const matchBoard={x:.085,y:.12,w:.83,h:.83};
 const stamps=[0,2,9,12,15,23];
 const label=Atlas.frames[7],slingOrigin={x:.18,y:.72},target={x:.84-.125*label.w/label.h,y:.405,w:.25*label.w/label.h,h:.25},leafRadius=.026,gravity=.60;
 const stalk=Atlas.frames[6],obstacles=[{x:.46,y:-.015,h:.34},{x:.63,y:.73,h:.29}].map(o=>({...o,w:o.h*stalk.w/stalk.h}));
 function cellPoint(index){return {x:matchBoard.x+(index%5+.5)*matchBoard.w/5,y:matchBoard.y+(Math.floor(index/5)+.5)*matchBoard.h/5};}
 function slotPoint(index){return {x:puzzleBoard.x+(index%3+.5)*puzzleBoard.w/3,y:puzzleBoard.y+(Math.floor(index/3)+.5)*puzzleBoard.h/2};}
 function trayPoint(index){return {x:.20+(index%3)*.30,y:.665+Math.floor(index/3)*.205};}
 function inRect(p,r,padding=0){return p.x>=r.x-padding&&p.x<=r.x+r.w+padding&&p.y>=r.y-padding&&p.y<=r.y+r.h+padding;}
 function boardCell(p,board,n){if(!inRect(p,board))return -1;const c=Math.floor((p.x-board.x)/board.w*n),r=Math.floor((p.y-board.y)/board.h*n);return c>=0&&c<n&&r>=0&&r<n?r*n+c:-1;}
 function matches(cells){
  const found=new Set();for(let y=0;y<5;y++)for(let x=0;x<5;){let to=x+1;while(to<5&&cells[y*5+to]?.type===cells[y*5+x]?.type)to++;if(cells[y*5+x]&&to-x>=3)for(let i=x;i<to;i++)found.add(y*5+i);x=to;}
  for(let x=0;x<5;x++)for(let y=0;y<5;){let to=y+1;while(to<5&&cells[to*5+x]?.type===cells[y*5+x]?.type)to++;if(cells[y*5+x]&&to-y>=3)for(let i=y;i<to;i++)found.add(i*5+x);y=to;}return [...found];
 }
 function legalMove(cells){
  for(let i=0;i<25;i++)for(const j of [i%5<4?i+1:-1,i<20?i+5:-1]){if(j<0)continue;const trial=cells.slice();[trial[i],trial[j]]=[trial[j],trial[i]];if(matches(trial).length)return [i,j];}return null;
 }
 function random(s){s.seed=(Math.imul(s.seed,1664525)+1013904223)>>>0;return s.seed/4294967296;}
 function newCell(s,type,from=null){return {id:++s.cellSerial,type,from};}
 function freshBoard(s){
  for(let attempt=0;attempt<30;attempt++){
   const cells=[];for(let i=0;i<25;i++){const allowed=[0,1,2,3].filter(type=>!(i%5>1&&cells[i-1].type===type&&cells[i-2].type===type)&&!(i>9&&cells[i-5].type===type&&cells[i-10].type===type));cells.push(newCell(s,allowed[Math.floor(random(s)*allowed.length)]));}if(legalMove(cells))return cells;
  }
  return [0,1,0,2,3,1,0,2,3,1,2,0,3,1,2,3,2,1,0,3,0,3,2,1,0].map(type=>newCell(s,type));
 }
 function create(entry,{reduced=false}={}){
  const game=kinds[entry.id],s={id:entry.id,route:entry.route,kind:entry.interaction,game,age:0,acted:false,gesture:'look',x:.5,y:.5,dragging:false,done:false,actor:{x:.5,y:.5,vx:0,vy:0},control:{x:.5,y:.5},play:{type:'minigame',progress:0,complete:false,completedAt:null,reduced},serial:0,events:[],gates:0,near:false,seed:20261016,cellSerial:0,feedback:prompts[game],cursor:0};
  if(game==='puzzle')s.puzzle={selected:null,held:null,pieces:[3,0,5,2,1,4].map((id,tray)=>({id,tray,placed:false,placedAt:null})),guide:true,keyboard:false};
  if(game==='match')s.match={cells:freshBoard(s),remaining:stamps.slice(),selected:null,dragFrom:null,stage:'idle',at:0,swap:null,popping:[],poppedDews:[],chain:0,moves:0,undo:[],hint:null,hintUntil:0};
  if(game==='sling')s.sling={angle:24,power:.50,stage:'ready',charge:false,aiming:false,shot:null,shots:0,at:0,trail:[]};
  return s;
 }
 function copy(state){
  const s={...state,actor:{...state.actor},control:{...state.control},play:{...state.play},events:state.events.slice()};
  if(s.puzzle)s.puzzle={...s.puzzle,pieces:s.puzzle.pieces.map(p=>({...p})),held:s.puzzle.held&&{...s.puzzle.held}};
  if(s.match)s.match={...s.match,cells:s.match.cells.map(c=>({...c})),remaining:s.match.remaining.slice(),undo:s.match.undo.slice(),popping:s.match.popping.slice()};
  if(s.sling)s.sling={...s.sling,shot:s.sling.shot&&{...s.sling.shot},trail:s.sling.trail.slice()};return s;
 }
 function event(s,type,x=.5,y=.5,index=0){s.events.push({serial:++s.serial,type,x,y,index,age:s.age});s.events=s.events.slice(-20);}
 function complete(s){if(s.play.complete)return;s.play.complete=true;s.play.progress=1;s.play.completedAt=s.age;event(s,'complete');}
 function pickPiece(s,id){const p=s.puzzle.pieces.find(p=>p.id===id&&!p.placed);if(!p)return false;s.puzzle.selected=id;s.puzzle.held=null;s.feedback='把这一片放到画里相同的位置。';event(s,'piece-pick',trayPoint(p.tray).x,trayPoint(p.tray).y);return true;}
 function placePiece(s,index){
  const p=s.puzzle.pieces.find(p=>p.id===s.puzzle.selected);if(!p||p.placed||index<0)return;
  const pos=slotPoint(index),from=s.puzzle.held||trayPoint(p.tray);s.puzzle.held=null;s.dragging=false;
  if(p.id===index){p.placed=true;p.placedAt=s.age;p.placeFrom={...from};s.puzzle.selected=null;s.gates=s.puzzle.pieces.filter(p=>p.placed).length;s.play.progress=s.gates/6;s.feedback=s.gates===6?'整幅画拼好了。':'拼好 '+s.gates+' / 6 片，接着放下一片吧。';event(s,'piece-lock',pos.x,pos.y,s.gates);if(s.gates===6)complete(s);}
  else{s.feedback='这片还没接上，换个位置试试。';event(s,'piece-miss',pos.x,pos.y);}
 }
 function puzzleInput(s,p,action,mode){
  if(action==='next'){const free=s.puzzle.pieces.filter(p=>!p.placed),i=free.findIndex(p=>p.id===s.puzzle.selected);if(free.length)pickPiece(s,free[(i+1)%free.length].id);return;}
  if(action==='place'||action==='confirm'){s.puzzle.keyboard=true;if(s.puzzle.selected===null){const next=s.puzzle.pieces.find(p=>!p.placed);if(next)pickPiece(s,next.id);}else placePiece(s,s.cursor);return;}
  if(action==='choose-piece'){s.puzzle.keyboard=true;pickPiece(s,clamp(p.value,0,5));return;}
  if(p.key){s.puzzle.keyboard=true;s.cursor=clamp(Math.floor(s.cursor/3)+(p.dy>0?1:p.dy<0?-1:0),0,1)*3+clamp(s.cursor%3+(p.dx>0?1:p.dx<0?-1:0),0,2);return;}
  if(action)return;
  if(p.phase==='press'){
   s.puzzle.keyboard=false;
   const selected=s.puzzle.pieces.find(piece=>!piece.placed&&Math.hypot(p.x-trayPoint(piece.tray).x,p.y-trayPoint(piece.tray).y)<.105);if(selected)pickPiece(s,selected.id);
   if(s.puzzle.selected!==null){s.puzzle.held={x:p.x,y:p.y};s.dragging=true;}return;
  }
  if(mode==='move'&&s.puzzle.selected!==null){s.puzzle.held={x:clamp(p.x,.04,.96),y:clamp(p.y,.04,.96)};s.dragging=true;return;}
  if(p.phase==='release'){
   const col=Math.floor((p.x-puzzleBoard.x)/puzzleBoard.w*3),row=Math.floor((p.y-puzzleBoard.y)/puzzleBoard.h*2);s.dragging=false;
   if(inRect(p,puzzleBoard)&&col<3&&row<2){s.cursor=row*3+col;if(p.dragged)s.puzzle.held={x:p.x,y:p.y};placePiece(s,s.cursor);}else s.puzzle.held=null;return;
  }
 }
 function snapshot(s){return {cells:s.match.cells.map(c=>({...c,from:null})),remaining:s.match.remaining.slice(),seed:s.seed,cellSerial:s.cellSerial,moves:s.match.moves};}
 function swapCells(s,a,b){
  const m=s.match;if(m.stage!=='idle'||Math.abs(a-b)!==5&&!(Math.floor(a/5)===Math.floor(b/5)&&Math.abs(a-b)===1))return;
  const before=snapshot(s);[m.cells[a],m.cells[b]]=[m.cells[b],m.cells[a]];m.cells[a].from=cellPoint(b);m.cells[b].from=cellPoint(a);const popped=matches(m.cells);
  m.swap={a,b,valid:popped.length>0,before};m.popping=popped;m.stage='swap';m.at=s.age;m.selected=null;m.dragFrom=null;m.hint=null;m.chain=0;s.feedback=popped.length?'叶形接上了，看看露光从哪里散开。':'这两片还连不成一组，会回到原位。';event(s,'card-swap',cellPoint(b).x,cellPoint(b).y);
 }
 function matchInput(s,p,action,mode){
  const m=s.match;if(m.stage!=='idle')return;
  if(action==='hint'){m.hint=legalMove(m.cells);m.hintUntil=s.age+3;s.feedback='纸角轻轻亮起，可以先试这两片。';return;}
  if(action==='shuffle'){m.cells=freshBoard(s);m.selected=null;m.dragFrom=null;m.stage='shuffle';m.at=s.age;m.hint=null;s.feedback='叶形重新排好了，已经清开的露光还在。';event(s,'card-shuffle');return;}
  if(action==='undo'){const old=m.undo.pop();if(old){m.cells=old.cells.map(c=>({...c}));m.remaining=old.remaining.slice();s.seed=old.seed;s.cellSerial=old.cellSerial;m.moves=old.moves;m.selected=null;m.hint=null;s.play.progress=(6-m.remaining.length)/6;s.feedback='回到上一步，再试一种交换。';event(s,'card-shuffle');}return;}
  if(p.key){s.cursor=clamp(Math.floor(s.cursor/5)+(p.dy>0?1:p.dy<0?-1:0),0,4)*5+clamp(s.cursor%5+(p.dx>0?1:p.dx<0?-1:0),0,4);return;}
  if(mode==='move')return;
  const index=action==='confirm'?s.cursor:boardCell(p,matchBoard,5);if(index<0)return;s.cursor=index;
  if(p.phase==='press'){m.dragFrom=index;return;}
  if(p.phase==='release'&&p.dragged&&m.dragFrom!==null){const from=m.dragFrom;m.dragFrom=null;if(from!==index)swapCells(s,from,index);return;}
  m.dragFrom=null;if(m.selected===null){m.selected=index;s.feedback='选中了一片，再选相邻的叶形交换。';}
  else if(m.selected===index)m.selected=null;
  else{const from=m.selected;if(Math.abs(from-index)===5||Math.floor(from/5)===Math.floor(index/5)&&Math.abs(from-index)===1)swapCells(s,from,index);else m.selected=index;}
 }
 function aimPouch(s){const a=s.sling.angle*Math.PI/180,d=.13*s.sling.power;return {x:slingOrigin.x-Math.cos(a)*d,y:slingOrigin.y+Math.sin(a)*d};}
 function launch(s){const q=s.sling;if(q.stage!=='ready')return;q.charge=false;q.aiming=false;const a=q.angle*Math.PI/180,v=.55+q.power*.42,p=aimPouch(s);q.shot={...p,vx:Math.cos(a)*v,vy:-Math.sin(a)*v,spin:0};q.stage='flight';q.at=s.age;q.releasedAt=s.age;q.shots++;q.trail=[];s.dragging=false;s.feedback='纸叶出发了，看看风把它送到哪里。';event(s,'sling-release',p.x,p.y);}
 function slingInput(s,p,action,mode){
  const q=s.sling;if(q.stage!=='ready')return;
  if(action==='angle'){q.angle=clamp(Number(p.value),12,70);return;}
  if(action==='power'){q.power=clamp(Number(p.value),.20,1);return;}
  if(action==='fire'||action==='confirm'){launch(s);return;}
  if(action==='charge'){q.charge=true;q.chargeAt=s.age;q.power=.20;event(s,'sling-draw',slingOrigin.x,slingOrigin.y);return;}
  if(p.key){q.angle=clamp(q.angle-(p.dx||0)*45,12,70);q.power=clamp(q.power-(p.dy||0)*.75,.20,1);return;}
  if(p.phase==='press'){if(Math.hypot(p.x-slingOrigin.x,p.y-slingOrigin.y)<.18||Math.hypot(p.x-aimPouch(s).x,p.y-aimPouch(s).y)<.12){q.aiming=true;s.dragging=true;event(s,'sling-draw',p.x,p.y);}return;}
  if(mode==='move'&&q.aiming){const dx=Math.max(.02,slingOrigin.x-p.x),dy=Math.max(.005,p.y-slingOrigin.y);q.angle=clamp(Math.atan2(dy,dx)*180/Math.PI,12,70);q.power=clamp(Math.hypot(dx,dy)/.16,.20,1);s.feedback='放开纸叶就会飞出；也可以取消，重新拉弓。';return;}
  if(p.phase==='release'&&q.aiming){if(p.dragged)launch(s);else{q.aiming=false;s.dragging=false;}}
 }
 function input(state,p={},mode='tap'){
  if(!state||state.done||state.play.complete)return state;const s=copy(state);s.acted=true;s.gesture=mode==='move'?'drag':'tap';
  if(Number.isFinite(p.x))s.x=clamp(p.x);if(Number.isFinite(p.y))s.y=clamp(p.y);const action=p.action||(p.assist?'confirm':'');
  if(s.game==='puzzle')puzzleInput(s,p,action,mode);else if(s.game==='match')matchInput(s,p,action,mode);else slingInput(s,p,action,mode);return s;
 }
 function release(state){if(!state)return state;const s=copy(state);s.dragging=false;if(s.puzzle)s.puzzle.held=null;if(s.match)s.match.dragFrom=null;if(s.sling){s.sling.aiming=false;s.sling.charge=false;}return s;}
 function beginPop(s){const m=s.match;m.stage='pop';m.at=s.age;m.chain++;const dews=m.popping.filter(i=>m.remaining.includes(i));m.poppedDews=dews;m.remaining=m.remaining.filter(i=>!m.popping.includes(i));s.play.progress=(6-m.remaining.length)/6;s.feedback=dews.length?'露光散开了 '+dews.length+' 处，叶脉更清楚了。':m.chain>1?'叶形接连舒展开，新的组合又出现了。':'叶形舒展开了，留意还有露光的格位。';const center=cellPoint(m.popping[Math.floor(m.popping.length/2)]);event(s,'card-clear',center.x,center.y,m.chain);}
 function collapse(s){const m=s.match,next=Array(25);for(let col=0;col<5;col++){const survivors=[];for(let row=4;row>=0;row--){const i=row*5+col;if(!m.popping.includes(i))survivors.push({...m.cells[i],from:cellPoint(i)});}for(let row=4;row>=0;row--){next[row*5+col]=survivors[4-row]||newCell(s,Math.floor(random(s)*4),{x:cellPoint(col).x,y:matchBoard.y-(5-row)*matchBoard.h/5});}}m.cells=next;m.popping=[];m.poppedDews=[];m.stage='fall';m.at=s.age;}
 function stepMatch(s){
  const m=s.match,elapsed=s.age-m.at,short=s.play.reduced?.10:.28;
  if(m.stage==='shuffle'&&elapsed>=short){m.stage='idle';m.cells.forEach(c=>c.from=null);return;}
  if(m.stage==='swap'&&elapsed>=short){
   if(m.swap.valid){m.undo=[...m.undo,m.swap.before].slice(-12);m.moves++;beginPop(s);}
   else{const {a,b}=m.swap;[m.cells[a],m.cells[b]]=[m.cells[b],m.cells[a]];m.cells[a].from=cellPoint(b);m.cells[b].from=cellPoint(a);m.stage='return';m.at=s.age;event(s,'card-return',cellPoint(a).x,cellPoint(a).y);}return;
  }
  if(m.stage==='return'&&elapsed>=short){m.stage='idle';m.swap=null;m.cells.forEach(c=>c.from=null);return;}
  if(m.stage==='pop'&&elapsed>=(s.play.reduced?.1:.36)){collapse(s);return;}
  if(m.stage==='fall'&&elapsed>=(s.play.reduced?.1:.42)){
   m.cells.forEach(c=>c.from=null);const found=matches(m.cells);if(found.length&&m.chain<16){m.popping=found;beginPop(s);}
   else if(m.remaining.length===0){s.feedback='六处露光都散开了，一芽春信在纸上完整展开。';complete(s);}
   else if(found.length||!legalMove(m.cells)){m.cells=freshBoard(s);m.stage='shuffle';m.at=s.age;s.feedback='这一盘暂时走不通，叶形轻轻换了个位置。';event(s,'card-shuffle');}
   else{m.stage='idle';m.swap=null;s.feedback='还有 '+m.remaining.length+' 处露光，试着把组合接到它们旁边。';}return;
  }
 }
 // Swept collision avoids a fast leaf travelling through a visible stalk or label.
 function segmentHit(a,b,r,padding=0){let lo=0,hi=1;for(const axis of ['x','y']){const delta=b[axis]-a[axis],min=r[axis]-padding,max=r[axis]+r[axis==='x'?'w':'h']+padding;if(Math.abs(delta)<1e-10){if(a[axis]<min||a[axis]>max)return null;}else{let t0=(min-a[axis])/delta,t1=(max-a[axis])/delta;if(t0>t1)[t0,t1]=[t1,t0];lo=Math.max(lo,t0);hi=Math.min(hi,t1);if(lo>hi)return null;}}return lo;}
 function stepSling(s,dt){
  const q=s.sling;if(q.charge)q.power=clamp(.20+(s.age-q.chargeAt)*.65,.20,1);
  if(q.stage==='miss'){if(q.shot){q.shot.x+=q.shot.vx*dt;q.shot.y+=q.shot.vy*dt+gravity*dt*dt/2;q.shot.vy+=gravity*dt;}if(s.age-q.at>.70){q.stage='ready';q.shot=null;q.trail=[];s.feedback='纸叶还在，换个角度或力度再送一次。';}return;}
  if(q.stage!=='flight'||!q.shot)return;const old={x:q.shot.x,y:q.shot.y},a=q.shot,next={x:a.x+a.vx*dt,y:a.y+a.vy*dt+gravity*dt*dt/2};a.vy+=gravity*dt;a.spin+=dt*5;
  const hits=obstacles.map(r=>({t:segmentHit(old,next,r,leafRadius),kind:'stalk'}));hits.push({t:segmentHit(old,next,target,leafRadius),kind:'label'});const first=hits.filter(hit=>hit.t!==null).sort((a,b)=>a.t-b.t)[0];
  if(first){a.x=old.x+(next.x-old.x)*first.t;a.y=old.y+(next.y-old.y)*first.t;if(first.kind==='label'){a.vx=0;a.vy=0;q.stage='caught';q.at=s.age;s.feedback='纸叶停在远山窗旁，这一阵竹林的风也留住了。';event(s,'sling-catch',a.x,a.y);complete(s);}else{a.vx=-Math.abs(a.vx)*.18;a.vy=-.11;q.stage='miss';q.at=s.age;s.feedback='纸叶轻轻碰到竹干，换一条弧线试试。';event(s,'sling-hit',a.x,a.y);}return;}
  a.x=next.x;a.y=next.y;q.trail=[...q.trail,{x:a.x,y:a.y}].slice(-48);
  if(a.x<-.08||a.x>1.08||a.y>1.05||a.y<-.22||s.age-q.at>5){q.stage='miss';q.at=s.age;s.feedback='这一阵风还没把纸叶送到纸签，调整后可以再来。';event(s,'sling-fall',clamp(a.x),clamp(a.y));}
 }
 function tick(state,dt){
  if(!state||state.done||!Number.isFinite(dt)||dt<=0)return state;let s=copy(state),left=Math.min(.25,dt);
  while(left>1e-8){const step=Math.min(left,1/120);s.age+=step;if(s.play.complete)s.done=s.age-s.play.completedAt>finishDuration(s);else{if(s.game==='match')stepMatch(s);if(s.game==='sling')stepSling(s,step);}left-=step;}return s;
 }
 const finishDuration=s=>s.play.reduced?.45:2.6;
 function controls(s){
  if(s.play.complete)return [];
  if(s.game==='puzzle')return [];
  if(s.game==='match')return [{action:'hint',label:'看看提示',disabled:s.match.stage!=='idle'},{action:'shuffle',label:'重新排叶',disabled:s.match.stage!=='idle'},{action:'undo',label:'撤回一步',disabled:s.match.stage!=='idle'||!s.match.undo.length}];
  return [];
 }
 function sample(s){
  const ending=s.play.complete?s.age-s.play.completedAt:0,phase=s.play.complete?(s.play.reduced||ending>1.35?'memory':'soar'):!s.acted?'invite':'play';
  return {art:true,phase,ending,paper:s.play.complete?(s.play.reduced?1:ease((ending-1.2)/.85)):0,title:{puzzle:'把石拱拼回纸上',match:'让一芽春信慢慢透亮',sling:'给远山送一枚纸叶'}[s.game],stage:{puzzle:'石拱与苔色',match:s.match?.chain>1?'叶形接连舒展开':'露光藏在叶脉里',sling:s.sling?.stage==='flight'?'纸叶穿过竹隙':'借一小段竹林的风'}[s.game],kicker:{puzzle:'武功山 · 金顶石语',match:'九溪—龙井村 · 一芽春信',sling:'莫干山 · 林隙远山'}[s.game],counter:s.game==='puzzle'?s.gates+' / 6 片':s.game==='match'?(6-s.match.remaining.length)+' / 6 处露光':s.sling.shots?'第 '+s.sling.shots+' 枚纸叶':'角度与风，刚刚好',cue:s.feedback,controls:controls(s)};
 }
 function key(state,key,phase='down'){
  if(!state||state.done||state.play.complete)return state;
  if(phase==='up')return state.game==='sling'&&key===' '&&state.sling.charge?input(state,{action:'fire'}):state;
  const arrows={ArrowLeft:[-.08,0],ArrowRight:[.08,0],ArrowUp:[0,-.1],ArrowDown:[0,.1]};
  if(arrows[key]){const [dx,dy]=arrows[key];return input(state,{key:true,dx,dy},'move');}
  if(state.game==='puzzle'&&/^[1-6]$/.test(key))return input(state,{action:'choose-piece',value:Number(key)-1});
  if(key===' '&&state.game==='sling')return input(state,{action:'charge'});
  if(key===' '||key==='Enter')return input(state,{action:'confirm'});return state;
 }
 function bounds(height=800){const w=Math.min(800,height*.98);return {x:(800-w)/2,y:(height-w)/2,w,h:w};}
 function point(refs,p){const b=bounds(refs.height||800);return {...p,x:clamp((p.x*800-b.x)/b.w),y:clamp((p.y*(refs.height||800)-b.y)/b.h)};}
 function preview(s,count=22){const p=aimPouch(s),a=s.sling.angle*Math.PI/180,v=.55+s.sling.power*.42,points=[];for(let i=0;i<count;i++){const t=i*.045,q={x:p.x+Math.cos(a)*v*t,y:p.y-Math.sin(a)*v*t+gravity*t*t/2};if(obstacles.some(r=>inRect(q,r,leafRadius))||q.y<0||q.x>1)break;points.push(q);}return points;}
 return {Atlas,kinds,assets,routes,prompts,results,puzzleBoard,matchBoard,stamps,slingOrigin,target,obstacles,leafRadius,gravity,cellPoint,slotPoint,trayPoint,aimPouch,matches,legalMove,create,input,release,tick,sample,controls,key,bounds,point,preview,finishDuration,segmentHit};
}));
