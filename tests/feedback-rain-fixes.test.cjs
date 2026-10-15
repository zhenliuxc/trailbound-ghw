const test=require('node:test'),assert=require('node:assert/strict');
const Q=require('../dist/water-scene'),M=require('../dist/mini-games'),D=require('../dist/discoveries'),{harness}=require('./dom-harness.cjs');
function dropState(y,x=.5){let s=M.create(D.item('bamboo-drop'));s.acted=true;s.spawn=10;s.actor.x=.5;s.control.x=.5;s.drops=[{x,y,speed:.3}];return s;}
test('rain is earned only by crossing inside the visible mouth, never by moving under a past drop',()=>{
 const edge=Q.cup.mouthY;
 let s=M.tick(dropState(edge-.002),.025);assert.equal(s.caught,1);assert.equal(s.drops.length,0);const hit=s.events.find(e=>e.type==='catch');assert.equal(hit.y,edge);assert.equal(hit.offsetX,0);
 s=M.tick(dropState(edge+.002),.025);assert.equal(s.caught,0);assert.equal(s.drops.length,1);
 s=M.tick(dropState(edge-.002,.5+.07),.025);assert.equal(s.caught,0); // Old catch width erroneously accepted this.
 for(let i=0;i<50;i++)s=M.tick(M.input(s,{x:.57},'move'),.025);assert.equal(s.caught,0);assert.ok(s.events.some(e=>e.type==='miss'));
});
test('the bamboo vessel stays rigid and its clipped water follows its mouth on both viewport shapes',async()=>{
 const P=await import('pixi.js');for(const height of [460,800]){const app={stage:new P.Container(),screen:{height},renderer:{prepare:{upload:async()=>{}}}},v=Q.create(P,app,'rain',{gates:M.gates,rocks:M.rocks,rockShapes:[],drawPixi:M.drawPixi});
 await v.install('scene',{state:'ready',image:new P.TextureSource({width:1280,height:720})});await v.install('actor',{state:'ready',image:new P.TextureSource({width:386,height:480})});
 const rig=v.root.children.find(c=>c.children?.some(n=>n instanceof P.Sprite&&n.texture.width===386)),body=rig.children.find(c=>c instanceof P.Sprite),surface=rig.children.find(c=>c.mask);
 assert.ok(surface);assert.equal(surface.parent,body.parent);let s=dropState(Q.cup.mouthY-.002);v.paint(s);const scale=body.scale.x;
 s=M.tick(s,.025);v.paint(s);assert.equal(body.rotation,0);assert.equal(body.scale.x,scale);assert.equal(body.scale.y,scale);assert.equal(rig.x,s.actor.x*800);assert.equal(rig.y,Q.cup.mouthY*height);assert.equal(body.y,0);assert.ok(rig.y+(480*(1-Q.cup.anchorY)*scale)<height);
 s=M.tick(M.input(s,{x:.8},'move'),.2);v.paint(s);assert.ok(rig.x>400);assert.equal(body.scale.y,scale);assert.equal(surface.x,0);assert.equal(surface.y,0);v.dispose();app.stage.destroy();
 }
});
test('ordinary notes are explicit paper entries, preserve history and do not become earned badges',()=>{
 const entry=D.item('meadow-bird'),base={key:'plain',id:entry.id,route:entry.route,edition:3,earned:false,tag:null,title:'草甸风口的纸鸢',memory:'原来的未完成记录',place:entry.place,createdAt:1},raw=JSON.stringify({version:2,moments:[base,{...base,key:'earned',earned:true,tag:entry.tag,artVersion:4,title:entry.tag}]});let writes=0;const h=harness({getItem:()=>raw,setItem:()=>writes++}),cards=h.$('journal-list').children,note=cards.find(c=>c.getAttribute('data-moment')==='plain'),badge=cards.find(c=>c.getAttribute('data-moment')==='earned');
 assert.equal(note.getAttribute('data-kind'),'note');assert.equal(note.querySelector('small').textContent,'未获得标签');assert.ok(note.querySelector('svg'));assert.equal(note.querySelector('img'),null);assert.equal(badge.getAttribute('data-kind'),'tag');assert.match(badge.querySelector('img').getAttribute('src'),/grass-letter/);assert.equal(h.$('journal-tag-count').textContent,'1枚互动标签');note.querySelector('button').emit('click');assert.equal(h.$('journal-page').querySelector('p').textContent,base.memory);assert.equal(writes,0);
});
test('a missing badge image exposes an explicit fallback and leaves the saved memory readable',()=>{
 const e=D.item('bamboo-drop'),record={key:'rain',id:e.id,route:e.route,edition:3,earned:true,artVersion:4,tag:e.tag,title:e.tag,memory:'记下八滴雨',place:e.place,createdAt:1},h=harness({getItem:()=>JSON.stringify({version:2,moments:[record]}),setItem(){}}),card=h.$('journal-list').children[0],image=card.querySelector('img'),wrapper=card.querySelector('span');
 assert.equal(image.getAttribute('loading'),'lazy');image.onerror();assert.equal(image.hidden,true);assert.match(wrapper.getAttribute('aria-label'),/暂未加载/);assert.equal(wrapper.querySelector('span').textContent,'画作暂未加载');card.querySelector('button').emit('click');assert.equal(h.$('journal-page').querySelector('p').textContent,record.memory);assert.equal(h.$('journal-tag-count').textContent,'1枚互动标签');
 const other=h.$('collection-list').children.find(c=>c.getAttribute('data-tag')===e.id).querySelector('img');other.onload();assert.equal(other.style.opacity,'1');
});
