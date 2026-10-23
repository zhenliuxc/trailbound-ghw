const test = require('node:test');
const assert = require('node:assert/strict');
const { buildSync } = require('esbuild');
const vm = require('node:vm');
const source = buildSync({ stdin: { contents: 'export * from "./src/aotai-walk/chapter"; export * from "./src/aotai-walk/geography"; export * from "./src/aotai-walk/photos"; export * from "./src/runtime/aotai-games/model"; export * from "./src/runtime/aotai-games/takin";', resolveDir: process.cwd() }, bundle: true, write: false, format: 'cjs' }).outputFiles[0].text;
const box = { exports: {} }; vm.runInThisContext(`(function(module,exports){${source}\n})`)(box, box.exports); const R = box.exports;
const D = require('../dist/discoveries.js'), Journal = require('../dist/journal.js');
const wait = (s, seconds) => { for (let i = 0; i < seconds * 20; i++) s = R.tickAotai(s, .05); return s; };
const tap = (s, p) => R.actAotai(R.actAotai(s, { ...p, phase: 'press' }), { ...p, phase: 'release' });
const center = r => ({ x: r.x + r.width / 2, y: r.y + r.height / 2 });
const key = (s, k) => R.keyAotai(s, k, 'down');
function travel(collected = true) {
  const journey = new R.AotaiJourney(), games = [], photos = [], camps = [], phases = new Set(); journey.toggle();
  for (let i = 0; i < 20000 && journey.phase.kind !== 'finished'; i++) {
    const phase = journey.phase; phases.add(phase.kind);
    if (phase.kind === 'resting' && camps[camps.length - 1] !== phase.camp) camps.push(phase.camp);
    if (phase.kind === 'game') { games.push(phase.id); journey.closeGame(phase.id, collected); }
    else if (phase.kind === 'photo') { photos.push(phase.id); journey.closePhoto(true); }
    else if (phase.kind === 'paused') journey.toggle();
    journey.tick(.05);
  }
  return { journey, games, photos, camps, phases };
}
test('the historical journey reaches Tangyu after four camps, four games, summit return and transport', () => {
  const run = travel(); assert.equal(run.journey.phase.kind, 'finished'); assert.equal(run.journey.day, 5);
  assert.deepEqual(run.camps, ['penjing', 'shuiwo', 'camp2800', 'dashihe']);
  assert.deepEqual(run.games, ['snow-tracks', 'snow-lichen', 'aotai-takin-first', 'aotai-camp-night']);
  assert.deepEqual(run.photos, ['aoshan', 'ridge', 'taibai']); assert.equal(run.journey.earned.size, 4);
  assert.equal(run.journey.at, R.path.length);
  for (const phase of ['resting', 'night', 'dawn', 'transfer']) assert.ok(run.phases.has(phase), phase);
});
test('skipping all games still reaches the end without earned badges', () => { const run = travel(false); assert.equal(run.journey.phase.kind, 'finished'); assert.equal(run.journey.earned.size, 0); assert.equal(run.games.length, 4); });
test('stale game close callbacks cannot advance or award a different active discovery', () => {
  const j = new R.AotaiJourney(); j.toggle(); for (let i = 0; i < 4000 && j.phase.kind !== 'game'; i++) { if (j.phase.kind === 'photo') j.closePhoto(true); j.tick(.05); }
  const at = j.at; j.closeGame('aotai-camp-night', true); assert.equal(j.phase.id, 'snow-tracks'); assert.equal(j.at, at); assert.equal(j.earned.size, 0);
  j.closeGame('snow-tracks', false); assert.equal(j.phase.kind, 'paused'); j.closeGame('snow-tracks', true); assert.equal(j.earned.size, 0);
});
test('arrival-photo dismissal pauses, reopening it never consumes the next ridge event', () => {
  const j = new R.AotaiJourney(); j.toggle();
  for (let i = 0; i < 5000 && j.phase.kind !== 'photo'; i++) { if (j.phase.kind === 'game') j.closeGame(j.phase.id, true); j.tick(.05); }
  assert.equal(j.phase.id, 'aoshan'); j.closePhoto(false); assert.equal(j.phase.kind, 'paused');
  const at = j.at; j.openPhoto('aoshan'); j.closePhoto(true); assert.equal(j.at, at); assert.equal(j.phase.kind, 'paused');
  j.toggle(); for (let i = 0; i < 4000 && j.phase.kind !== 'game'; i++) j.tick(.05); assert.equal(j.phase.id, 'snow-tracks');
});
test('blank taps and idle time cannot complete any Aotai game', () => { for (const id of R.AOTAI_IDS) { const s = wait(tap(new R.AotaiState(id, false), { x: 990, y: 10 }), 25); assert.equal(s.play.complete, false, id); assert.equal(s.done, false, id); } });
const press = (s, p) => R.actAotai(s, { ...p, phase:'press' });
const release = (s, p) => R.actAotai(s, { ...p, phase:'release' });
function pushBall(s) { const offset=R.layout(s).snowOffset; press(s,{x:168,y:352+offset}); R.moveAotai(s,{x:268,y:380+offset}); release(s,{x:268,y:380+offset}); return s; }
test('the Matter.js snowball rolls through the visible rock trough into its hollow on both layouts', () => {
  for(const portrait of [false,true]) { const s=new R.AotaiState('snow-tracks',false);s.portrait=portrait;pushBall(s);wait(s,14);assert.equal(s.done,true);assert.ok(s.session.world.impacts>2);s.session.world.dispose(); }
});
test('cancelling a snowball push never launches or earns a badge', () => {
  const s=new R.AotaiState('snow-tracks',false);press(s,{x:168,y:352});R.moveAotai(s,{x:268,y:380});R.releaseAotai(s);release(s,{x:268,y:380});wait(s,15);assert.equal(s.session.motion.kind,'ready');assert.equal(s.play.complete,false);s.session.world.dispose();
});
function climb(s) { key(s,'Enter');wait(s,8);R.keyAotai(s,'Enter','up');wait(s,6);assert.equal(s.session.rested,true);key(s,'Enter');wait(s,12);R.keyAotai(s,'Enter','up');return s; }
test('the ridge needs a real pause behind the fixed shelter, then held walking to its crest', () => {
  const s=new R.AotaiState('snow-lichen',false);key(s,'Enter');wait(s,12);assert.equal(s.done,false);assert.equal(s.session.progress,.48);assert.equal(s.session.rested,false);
  const point=R.windPoint(s);R.keyAotai(s,'Enter','up');wait(s,6);assert.equal(s.session.rested,true);assert.deepEqual(R.windPoint(s),point);key(s,'Enter');wait(s,12);assert.equal(s.done,true);
});
function holdGround(s,x,y,seconds){press(s,{x:x*1000,y:y*R.layout(s).height});wait(s,seconds);R.releaseAotai(s);return s;}
function retreat(s){return holdGround(s,.23,.84,6);}
test('backing along the road does not clear the passage; holding toward the platform does', () => {
  const s=new R.AotaiState('aotai-takin-first',false);wait(s,10.2);holdGround(s,.23,R.trailY(.23),5);
  assert.equal(s.session.phase.kind,'yielding');assert.equal(R.passageClear(s.session.actor,720),false);assert.match(s.feedback,/里面/);
  retreat(s);assert.equal(R.passageClear(s.session.actor,720),true);assert.equal(s.session.phase.kind,'adult');assert.equal(s.done,false);
});
test('releasing the ground stops retreat immediately, and idle waiting cannot earn the encounter', () => {
  const s=new R.AotaiState('aotai-takin-first',false);wait(s,10.1);holdGround(s,.23,.84,1);const at={...s.session.actor};wait(s,4);assert.deepEqual(s.session.actor,at);assert.equal(s.done,false);assert.equal(R.passageClear(at,720),false);
});
test('adult passage is followed by a smaller animal; early return pauses it and retreat recovers', () => {
  for(const portrait of [false,true]) {const s=new R.AotaiState('aotai-takin-first',false);s.portrait=portrait;wait(s,10.1);retreat(s);
    for(let i=0;i<240&&s.session.phase.kind!=='calf-reveal';i++)wait(s,.1);assert.equal(s.session.phase.kind,'calf-reveal');
    holdGround(s,.43,R.trailY(.43),6);assert.equal(R.passageClear(s.session.actor,R.layout(s).height),false);
    wait(s,2);assert.equal(s.session.phase.kind,'calf');const at=s.session.phase.progress;wait(s,4);assert.equal(s.session.phase.progress,at);assert.equal(s.done,false);
    retreat(s);wait(s,32);assert.equal(s.done,true);assert.equal(s.play.complete,true);assert.ok(s.age>=60);}
});
test('reduced motion preserves both animals and the spatial yielding rule', () => {
  const s=new R.AotaiState('aotai-takin-first',true);wait(s,6.2);holdGround(s,.23,R.trailY(.23),5);assert.equal(s.session.phase.kind,'yielding');retreat(s);wait(s,34);assert.equal(s.done,true);
});
function rope(s,index,target=R.layout(s).pegs[index]){const l=R.layout(s);press(s,l.loose[index]);R.moveAotai(s,target);release(s,target);return s;}
test('camp requires two correct tied ropes before the lantern can be lit on both layouts', () => {
  for(const portrait of [false,true]){const s=new R.AotaiState('aotai-camp-night',false);s.portrait=portrait;tap(s,R.layout(s).lamp);assert.equal(s.session.phase.kind,'ropes');rope(s,0);assert.equal(s.play.progress,.35);rope(s,1);assert.equal(s.session.phase.kind,'lamp');assert.equal(s.done,false);tap(s,R.layout(s).lamp);wait(s,4.6);assert.equal(s.done,true);}
});
test('wrong and cancelled rope drops never tie or grant the camp badge', () => {
  const s=new R.AotaiState('aotai-camp-night',false);rope(s,0,{x:500,y:300});assert.equal(s.session.phase.tied,'none');press(s,R.layout(s).loose[0]);R.moveAotai(s,R.layout(s).pegs[0]);R.releaseAotai(s);release(s,R.layout(s).pegs[0]);wait(s,20);assert.equal(s.session.phase.tied,'none');assert.equal(s.done,false);
});
test('keyboard controls preserve the snowball, ridge, encounter and camp goals', () => {
  let s=new R.AotaiState('snow-tracks',true);key(s,'Enter');wait(s,14);assert.equal(s.done,true);s.session.world.dispose();
  s=climb(new R.AotaiState('snow-lichen',true));assert.equal(s.done,true);
  s=new R.AotaiState('aotai-takin-first',true);wait(s,6.2);key(s,'ArrowLeft');wait(s,3);R.keyAotai(s,'ArrowLeft','up');key(s,'ArrowDown');wait(s,4);R.keyAotai(s,'ArrowDown','up');wait(s,34);assert.equal(s.done,true);
  s=new R.AotaiState('aotai-camp-night',true);
  for(const index of [0,1]){key(s,'Enter');for(let i=0;i<20&&s.session.phase.kind==='ropes'&&s.session.phase.drag;i++) {const p=s.session.phase.drag.point,t=R.layout(s).pegs[index];if(Math.hypot(p.x-t.x,p.y-t.y)<60){key(s,'Enter');break;}key(s,Math.abs(p.x-t.x)>30?(p.x<t.x?'ArrowRight':'ArrowLeft'):(p.y<t.y?'ArrowDown':'ArrowUp'));}}
  assert.equal(s.session.phase.kind,'lamp');key(s,'Enter');wait(s,2);assert.equal(s.done,true);
});
test('the new Dashihe memory coexists with a historical mist badge without rewriting it', () => {
 const old={key:'old-fog',id:'snow-light',route:'aotai',place:'旧雾峰',title:'雾后山光',memory:'第一次的雾',icon:'snow',edition:3,earned:true,createdAt:42,artVersion:5};
 const fresh={...old,key:'new-camp',id:'aotai-camp-night',place:'大石河',title:'雪夜营灯',createdAt:123};const entries=Journal.remember([old],fresh).moments;
 assert.equal(entries.length,2);assert.equal(entries.find(m=>m.id==='snow-light').createdAt,42);assert.equal(D.tagArt(old),'badges/snow-light-v5.webp');assert.equal(D.tagArt(fresh),'badges/aotai-camp-night-v1.webp');
});
test('same earned badge keeps the first journal date and memory', () => {
  const first = { key:'first-aotai', id:'snow-tracks', route:'aotai', place:'秦岭 · 石海', title:'石海纹理', memory:'第一次的石海', icon:'stones', edition:3, earned:true, createdAt:100, artVersion:5 };
  const result = Journal.remember([first], { ...first, key:'second-aotai', memory:'第二次', createdAt:200 });
  assert.equal(result.moments.length, 1); assert.equal(result.moments[0].memory, '第一次的石海'); assert.equal(result.moments[0].createdAt, 100);
  assert.equal(D.tagArt(first), 'badges/aotai-rock-facets-v4.webp');
});
test('only Baiqi Temple is labelled as a named-place photo; both Taibai photos stay regional', () => {
  assert.equal(R.PHOTOS.aoshan.locality, 'exact-place'); assert.equal(R.PHOTOS.ridge.locality, 'regional'); assert.equal(R.PHOTOS.taibai.locality, 'regional');
  assert.match(R.PHOTOS.ridge.caption, /非.*定点/); assert.match(R.PHOTOS.taibai.caption, /区域/);
});

test('major places follow the chosen west-to-east historical route, with an explicit summit return', () => {
  assert.deepEqual(R.path.stations.map(s => s.id), [
    'tangkou','yaopeng','camp2900','penjing','baiqi','aoshan','xipaoma','yaowang','maijie','shuiwo',
    'feiji','liang','camp2800','nantian','pyramid','xiyuan','taibailiang','dashihe','dongyuan','wanxian',
    'leigong','dongpaoma','dayehai','baxian','dayehai','dawengong','xiaowengong','shangban','xiaban','tangyu',
  ]);
  const stops = R.path.stations, summit = stops.findIndex(s => s.id === 'baxian');
  assert.deepEqual(R.path.sample(stops[summit-1].at), R.path.sample(stops[summit+1].at));
  assert.ok(R.path.at('baxian') < R.path.at('dawengong'));
  assert.ok(R.path.slope(R.path.between('shuiwo','feiji',.5)) > .2);
  assert.ok(R.path.slope(R.path.between('feiji','camp2800',.8)) < -.2);
});
test('each game belongs to its intended terrain and all encounters are strictly ordered', () => {
  const games = R.STEPS.filter(s => s.kind === 'game');
  const terrain = [['baiqi','aoshan'],['feiji','liang'],['camp2800','nantian']];
  games.slice(0,3).forEach((game,i) => { assert.ok(game.at > R.path.at(terrain[i][0])); assert.ok(game.at < R.path.at(terrain[i][1])); });
  assert.equal(games[3].id,'aotai-camp-night');assert.equal(games[3].at,R.path.at('dashihe'));assert.deepEqual(games[3].continuation,{kind:'camp',id:'dashihe'});
  for(let i=1;i<R.STEPS.length;i++) assert.ok(R.STEPS[i].at>R.STEPS[i-1].at);
});
test('the scenic-area exit uses transport after walking ends at Xiaban Temple', () => {
  const j = new R.AotaiJourney(); j.toggle();
  for(let i=0;i<20000 && j.phase.kind!=='transfer';i++) {
    if(j.phase.kind==='photo')j.closePhoto(true);
    if(j.phase.kind==='game')j.closeGame(j.phase.id,false);
    if(j.phase.kind==='paused')j.toggle();
    j.tick(.05);
  }
  assert.equal(j.phase.kind,'transfer'); assert.equal(j.at,R.path.at('xiaban')); assert.equal(j.moving,false);
  const stride=j.stride; j.tick(3.5); assert.ok(j.at>R.path.at('xiaban')); assert.equal(j.stride,stride);
  j.tick(3.5); assert.equal(j.phase.kind,'finished'); assert.equal(j.at,R.path.length);
});

test('the walking route stays on connected mountain faces, including the summit spur', () => {
  for(let i=0;i<R.path.points.length;i++) {
    if(R.path.lengths[i]>R.path.at('xiaban'))break;
    const p=R.path.points[i];assert.ok(p.y>=R.surfaceCrest(p.x)+18,`route floats above its mountain at ${p.x},${p.y}`);
  }
});
test('each winter camp keeps its identity through night and the later dawn', () => {
  const j=new R.AotaiJourney(), nights=[],dawns=[];j.toggle();
  for(let i=0;i<20000&&j.phase.kind!=='finished';i++){
    const p=j.phase;
    if(p.kind==='night'&&nights[nights.length-1]!==p.camp){nights.push(p.camp);assert.ok(j.minute>=18*60);}
    if(p.kind==='dawn'&&dawns[dawns.length-1]!==p.camp){dawns.push(p.camp);assert.equal(j.minute,7.5*60);assert.equal(j.night,1);}
    if(p.kind==='photo')j.closePhoto(true);if(p.kind==='game')j.closeGame(p.id,false);if(p.kind==='paused')j.toggle();
    j.tick(.05);
  }
  assert.deepEqual(nights,['penjing','shuiwo','camp2800','dashihe']);assert.deepEqual(dawns,nights);
});
