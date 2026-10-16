// Prepared for the user's next approved test run. These model rules, not listening or physical phones.
const test=require('node:test'),assert=require('node:assert/strict');
const R=require('../dist/runtime.js'),D=require('../dist/discoveries.js'),A=require('../dist/art-games.js');
const make=(id,reduced=false)=>R.createMoganState(D.item(id),reduced,A);
const act=(s,action,value)=>R.inputMogan(s,{action,value},A);
function advance(s,seconds){for(let left=seconds;left>1e-8;left-=.025)s=R.tickMogan(s,Math.min(left,.025),A);return s;}

test('Mogan waits for a deliberate start and never earns a painting by waiting',()=>{
 for(const id of Object.keys(R.MOGAN_GAMES)){const s=advance(make(id),60);assert.equal(s.play.complete,false,id);assert.equal(s.done,false);assert.equal(s.acted,false);}
});
test('a drop below the rim cannot be rescued retroactively, and misses repeat the unearned note',()=>{
 let s=act(make('bamboo-drop'),'begin');s.rain.cupX=.8;s.rain.targetX=.8;
 s.rain.drop={x:.25,y:R.CUP.mouthY+.005,speed:.29};s=R.inputMogan(s,{x:.25},A,'move');s=advance(s,1);
 assert.equal(s.rain.caught,0);assert.equal(s.play.progress,0);assert.equal(s.play.complete,false);assert.ok(s.events.some(e=>e.type==='rain-miss'));
});
test('visible leaf drops can complete the phrase in both motion modes, with one delayed completion',()=>{
 for(const reduced of [false,true]){
  let s=make('bamboo-drop',reduced);
  for(let i=0;i<2600&&!s.play.complete;i++){
   const x=.14+R.RAIN_PHRASE[Math.min(7,s.rain.caught)]*.143;s=R.inputMogan(s,{x,y:.8},A,'move');s=R.tickMogan(s,.025,A);
  }
  assert.equal(s.play.complete,true);assert.equal(s.rain.caught,8);assert.equal(s.done,false);
  const caught=s.events.filter(e=>e.type==='catch');assert.equal(caught.length,8);assert.deepEqual(caught.map(e=>e.index),[0,1,2,3,4,5,6,7]);
  assert.equal(s.events.filter(e=>e.type==='complete').length,1);assert.equal(advance(s,3).done,true);
 }
});
test('stone steps reject early and wrong feet, retain progress on a miss, and offer slower timing',()=>{
 let s=act(make('bamboo-step'),'begin');s=act(s,'left');assert.equal(s.steps.index,0);
 s=advance(s,R.stepTiming(s).length);s=act(s,'right');assert.equal(s.steps.index,0);s=act(s,'left');assert.equal(s.steps.index,1);
 s=advance(s,4);assert.equal(s.steps.index,1);assert.ok(s.steps.mistakes>0);
 const before=R.stepTiming(s).length;s=act(s,'slow');assert.equal(s.steps.index,1);assert.ok(R.stepTiming(s).length>before);
});
test('ten alternating timed landings earn the stone-path painting, while cancellation adds nothing',()=>{
 let s=act(make('bamboo-step'),'begin');
 for(let i=0;i<10;i++){
  s=advance(s,Math.max(0,.35-(s.age-s.steps.landedAt))+R.stepTiming(s).length+.05);const expected=R.stepFoot(i);
  const cancelled=R.inputMogan(s,{x:expected==='left'?.4:.6,y:.8,phase:'press'},A);assert.equal(cancelled.steps.index,i);
  s=act(s,expected);assert.equal(s.steps.index,i+1);
 }
 assert.equal(s.play.complete,true);assert.equal(s.events.filter(e=>e.type==='step-land').length,10);assert.equal(s.events.filter(e=>e.type==='complete').length,1);
});
test('slingshot keeps swept collision controls and cancelling charge never launches a leaf',()=>{
 let s=make('bamboo-leaf');s=R.keyMogan(s,' ','down',A);s=advance(s,.5);s=R.releaseMogan(s,A);s=R.keyMogan(s,' ','up',A);
 assert.equal(s.sling.shots,0);s=act(act(s,'angle',40),'power',.6);s=advance(act(s,'fire'),1.8);
 assert.equal(s.play.complete,true);assert.equal(s.sling.stage,'caught');assert.equal(s.events.filter(e=>e.type==='sling-catch').length,1);
});
test('portrait and landscape rain keep the sprite, water and clipping at one rigid mouth origin',()=>{
 let s=act(make('bamboo-drop'),'right');s=advance(s,.8);
 for(const height of [600,800]){const f=R.moganFrame(s,height,A),cup=f.sprites.find(p=>p.key==='cup');assert.equal(cup.width,R.CUP.width);assert.equal(cup.x,f.clip.x);assert.equal(cup.y,f.clip.y);assert.equal(cup.y,R.CUP.mouthY*height);assert.equal(cup.rotation,0);assert.equal(f.water[0].x,cup.x);}
});
test('Mogan themes use existing free files and keep their game theme for the corresponding reward',()=>{
 for(const [id,game]of Object.entries(R.MOGAN_GAMES)){
  const scene={routeId:'mogan',mode:'moment',momentId:id};assert.equal(R.musicTrack(scene).file,R.MOGAN_THEMES[game].file);
  assert.equal(R.musicTrack({...scene,mode:'reward'}).file,R.musicTrack(scene).file);
 }
 assert.equal(R.musicTrack({routeId:'mogan',mode:'walk'}).file,R.MOGAN_MUSIC.file);assert.equal(R.musicTrack({routeId:'mogan',mode:'silent'}),null);
 assert.ok(Object.values(R.MOGAN_THEMES).every(t=>Object.values(R.WUGONG_THEMES).some(old=>old.file===t.file)));
});
