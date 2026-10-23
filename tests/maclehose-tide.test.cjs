const test = require('node:test');
const assert = require('node:assert/strict');
const { buildSync } = require('esbuild');
const vm = require('node:vm');
const source = buildSync({ stdin: { contents: 'export * from "./src/runtime/coast-memories/tide/model"; export { createTide } from "./src/runtime/coast-memories/tide/adapter"; export { tideCamera } from "./src/runtime/coast-memories/tide/view";', resolveDir: process.cwd() }, bundle: true, write: false, format: 'cjs' }).outputFiles[0].text;
const box = { exports: {} }; vm.runInThisContext(`(function(module,exports){${source}\n})`)(box, box.exports);
const { createTide, tideCamera, QUIET_TIME, WASH_TIME } = box.exports;
const D = require('../dist/discoveries.js');
const api = createTide({ get() { throw Error('No DOM rendering in rule checks'); }, text() {} });
const entry = D.item('coast-shell');
const fresh = reduced => api.create(entry, { reduced: !!reduced });
const wait = (s, seconds) => { for (let i = 0; i < Math.ceil(seconds * 50); i++) api.tick(s, .02); return s; };
const stroke = (s, points) => { api.act(s, { ...points[0], phase: 'press' }); for (const point of points.slice(1)) api.move(s, point); api.act(s, { phase: 'release' }); };

test('two separate drags keep their exact marks and do not join across the gap', () => {
  const s = fresh(); stroke(s, [{x:350,y:420},{x:450,y:400},{x:500,y:440}]);
  wait(s, 2); stroke(s, [{x:600,y:460},{x:680,y:500}]);
  assert.deepEqual(s.strokes, [[{x:350,y:420},{x:450,y:400},{x:500,y:440}],[{x:600,y:460},{x:680,y:500}]]);
  assert.equal(s.phase.kind, 'pause'); assert.equal(api.outcome(s, entry).earned, false);
});

test('lifting the brush preserves the picture and a new stroke resets the quiet interval', () => {
  const s = fresh(); stroke(s, [{x:350,y:420},{x:500,y:440}]);
  wait(s, QUIET_TIME - .2); assert.equal(s.phase.kind, 'pause');
  stroke(s, [{x:600,y:460},{x:680,y:500}]); wait(s, 3);
  assert.equal(s.phase.kind, 'pause'); assert.equal(s.strokes.length, 2); assert.equal(s.play.complete, false);
});

test('the tide cannot start while a stroke is still held', () => {
  const s = fresh(); api.act(s, {x:350,y:420,phase:'press'}); api.move(s,{x:550,y:460}); wait(s,30);
  assert.equal(s.phase.kind, 'drawing'); assert.equal(s.play.complete, false);
  api.act(s,{phase:'release'}); wait(s,QUIET_TIME + .2);
  assert.equal(s.phase.kind, 'washing'); assert.equal(s.play.complete, false);
});

test('a finished picture is only earned after the wave has crossed and receded', () => {
  const s = fresh(); stroke(s,[{x:350,y:420},{x:550,y:460}]);
  wait(s,QUIET_TIME + .1); assert.equal(s.phase.kind, 'washing'); assert.equal(api.outcome(s,entry).earned,false);
  wait(s,WASH_TIME + .1); assert.equal(s.phase.kind,'memory'); assert.equal(api.outcome(s,entry).earned,true); assert.equal(s.done,false);
  wait(s,1.3); assert.equal(s.done,true);
});

test('tapping or dragging over sea and foreground grass cannot earn the badge', () => {
  for (const points of [[{x:500,y:120},{x:700,y:160}],[{x:100,y:600},{x:200,y:620}],[{x:500,y:420},{x:500,y:420}]]) {
    const s = fresh(); stroke(s,points); wait(s,30); assert.equal(api.outcome(s,entry).earned,false);
  }
});

test('a cancelled active stroke does not survive or finish in the background', () => {
  const s = fresh(); api.act(s,{x:350,y:420,phase:'press'}); api.move(s,{x:550,y:460}); api.release(s); wait(s,30);
  assert.deepEqual(s.strokes,[]); assert.equal(s.phase.kind,'ready'); assert.equal(api.outcome(s,entry).earned,false);
});

test('leaving the sand stops the stroke without extending it through rocks or plants', () => {
  const s = fresh(); api.act(s,{x:350,y:420,phase:'press'}); api.move(s,{x:450,y:420}); api.move(s,{x:100,y:600}); api.move(s,{x:550,y:460});
  assert.deepEqual(s.strokes,[[{x:350,y:420},{x:450,y:420}]]); assert.equal(s.phase.kind,'pause');
});

test('reduced motion and keyboard drawing preserve the same earned result', () => {
  const s = fresh(true); api.key(s,' ','down'); for (let i=0;i<7;i++) api.key(s,'ArrowRight','down'); api.key(s,' ','up');
  assert.equal(s.strokes[0].length,8); assert.equal(s.phase.kind,'pause'); wait(s,10);
  assert.equal(api.outcome(s,entry).earned,true); assert.equal(s.done,true);
});

test('portrait and wide brush coordinates map onto the same visible sand', () => {
  for (const [width,height] of [[414,727],[780,300],[1400,594]]) {
    const camera=tideCamera(width,height), point={x:600,y:460}, screen=camera.toScreen(point), world=camera.toWorld(screen);
    assert.ok(screen.x>0&&screen.x<width&&screen.y>0&&screen.y<height);
    const s=fresh(); api.act(s,{...world,phase:'press'}); api.move(s,{x:world.x+90,y:world.y+20}); api.act(s,{phase:'release'});
    assert.ok(Math.abs(s.strokes[0][0].x-600)<1e-8&&Math.abs(s.strokes[0][0].y-460)<1e-8);
  }
});
