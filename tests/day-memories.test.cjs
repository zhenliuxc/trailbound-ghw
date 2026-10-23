const test = require('node:test');
const assert = require('node:assert/strict');
const { buildSync } = require('esbuild');
const code = buildSync({ entryPoints: ['src/runtime/day-memories/model.ts'], bundle: true, write: false, format: 'cjs' }).outputFiles[0].text;
const moduleBox = { exports: {} }; new Function('module', 'exports', code)(moduleBox, moduleBox.exports);
const { DayMemoryState, DAY_MEMORIES } = moduleBox.exports;
const create = id => new DayMemoryState({ id, route: id.startsWith('valley') ? 'changping' : id.startsWith('bamboo') ? 'mogan' : 'westlake', edition: 3 }, false);
function tick(s, seconds) { for(let i=0; i<Math.ceil(seconds/.05);i++)s.tick(.05); }
function tap(s,x,y) { s.input({x,y,phase:'press'}); s.input({x,y,phase:'release'}); }
function drag(s,from,to) { s.input({...from,phase:'press'}); for(let i=1;i<=20;i++)s.input({x:from.x+(to.x-from.x)*i/20,y:from.y+(to.y-from.y)*i/20},true);s.input({...to,phase:'release'}); }
const solve = {
  'valley-moss': s => {drag(s,{x:.7,y:.7},{x:.47,y:.7});tick(s,1);},
  'valley-bridge': s => {for(const y of [.43,.59,.75])drag(s,{x:.28,y},{x:.72,y});},
  'valley-reflection': s => drag(s,{x:.12,y:.64},{x:.9,y:.64}),
  'bamboo-drop': s => {for(const x of [.28,.67,.43,.72]){tap(s,x,.8);tick(s,3.4);}},
  'bamboo-step': s => {for(const y of [.82,.69,.56])drag(s,{x:.35,y},{x:.8,y});},
  'bamboo-leaf': s => {tick(s,1);tap(s,.5,.6);},
  'westlake-floating-leaf': s => {for(let i=0;i<8;i++){s.key('Enter','down');s.key('Enter','up');tick(s,.55);}},
  'westlake-stones': s => {for(const [x,y] of [[.34,.79],[.52,.69],[.69,.58]]){tap(s,x,y);tick(s,1.3);}},
  'westlake-tea': s => {for(const [x,y] of [[.28,.46],[.74,.46],[.51,.73]])tap(s,x,y);},
  'westlake-eaves': s => {s.input({x:.5,y:.65,phase:'press'});tick(s,2);s.input({phase:'release'});tick(s,4.1);},
};
for (const id of Object.keys(DAY_MEMORIES)) {
  test(`${id}: deliberate play completes, then holds the view before reward`, () => {
    const s=create(id);solve[id](s);assert.equal(s.phase,'reveal');
    assert.equal(s.done,false);tick(s,8);assert.equal(s.play.complete,true);assert.equal(s.done,true);
  });
  test(`${id}: waiting or tapping outside the picture does not collect a badge`, () => {
    const s=create(id);s.input({x:.5,y:.6,action:'outside-scene'});tick(s,120);assert.equal(s.play.complete,false);assert.equal(s.done,false);assert.equal(s.acted,false);
  });
}
test('reflection keeps its position on pointer release, and stops dragging outside',()=>{
  const s=create('valley-moss');drag(s,{x:.7,y:.7},{x:.47,y:.7});assert.equal(s.dragging,false);tick(s,1);assert.equal(s.phase,'reveal');
});
test('tea rejects mature leaves and repeated picking does not add progress',()=>{
  const s=create('westlake-tea');tap(s,.52,.46);assert.equal(s.play.progress,0);tap(s,.28,.46);tap(s,.28,.46);assert.equal(s.play.progress,1/3);
});
test('stream stones must be connected, and cannot be skipped during a step',()=>{
  const s=create('westlake-stones');tap(s,.69,.58);tick(s,2);assert.equal(s.play.progress,0);tap(s,.34,.79);tap(s,.52,.69);tick(s,1.3);assert.equal(s.play.progress,1/3);
});
test('tea needs water and a release; blur cannot silently finish the game',()=>{
  const s=create('westlake-eaves');s.input({phase:'press'});tick(s,1);s.input({phase:'release'});tick(s,10);assert.equal(s.play.complete,false);
  s.input({phase:'press'});tick(s,1);s.release();tick(s,10);assert.equal(s.play.complete,false);
  s.input({phase:'release'});tick(s,8);assert.equal(s.play.complete,true);
});
