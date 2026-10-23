const test = require('node:test');
const assert = require('node:assert/strict');
const { buildSync } = require('esbuild');
const vm = require('node:vm');
const code = buildSync({ stdin: { contents: 'export * from "./src/journey/walking-turn"; export * from "./src/maclehose-walk/chapter"; export {path} from "./src/maclehose-walk/route"; export {CHARACTERS} from "./src/characters/catalog";', resolveDir: process.cwd() }, bundle: true, write: false, format: 'cjs' }).outputFiles[0].text;
const box = { exports: {} }; vm.runInThisContext(`(function(module,exports){${code}\n})`)(box, box.exports);
const { WalkingTurn, CoastalJourney, path, CHARACTERS } = box.exports;
const contacts = Object.values(CHARACTERS).map(c => c.walk.frames.map(frame => frame.contactX));
const sample = (at, heading, extra = {}) => ({ at, stride: at / 28, heading, forwardHeading: heading, slope: 0, moving: true, ...extra });

test('the hiker faces the actual first path before taking a step', () => {
  const turning = new WalkingTurn(path.heading(0));
  assert.equal(turning.facing, -1);
  turning.update(sample(0, path.heading(0), { moving: false }), 0, contacts[0], false);
  assert.equal(turning.facing, -1); assert.equal(turning.frame, 2);
});

test('short opposite kinks and near-vertical bends do not repeatedly mirror the person', () => {
  const turning = new WalkingTurn(Math.PI);
  for (let at = .5; at <= 120; at += .5) {
    const heading = Math.floor(at / 5) % 2 ? 0 : Math.PI;
    turning.update(sample(at, heading), 1 / 60, contacts[0], false);
    assert.equal(turning.facing, -1);
  }
  for (let at = 120.5; at <= 200; at += .5) {
    const heading = Math.PI / 2 + Math.sin(at) * .2;
    turning.update(sample(at, heading), 1 / 60, contacts[0], false);
    assert.equal(turning.facing, -1);
  }
});

test('a sustained bend turns on a closed step and preserves the planted foot for both characters', () => {
  for (const offsets of contacts) for (const slope of [0, .4]) {
    const turning = new WalkingTurn(Math.PI);
    let turnedAt = 0;
    for (let at = .5; at <= 40; at += .5) {
      const previous = turning.facing;
      turning.update(sample(at, 0, { slope }), 1 / 60, offsets, false);
      if (previous === turning.facing) continue;
      assert.ok(turning.frame === 2 || turning.frame === 6);
      const footX = offsets[turning.frame] * Math.cos(turning.lean), footY = offsets[turning.frame] * Math.sin(turning.lean);
      assert.ok(Math.abs(turning.offsetX + turning.facing * footX + footX) < .000001);
      assert.ok(Math.abs(turning.offsetY + turning.facing * footY + footY) < .000001);
      turnedAt = at;
    }
    assert.ok(turnedAt > 0 && turnedAt < 24);
    assert.equal(turning.facing, 1); assert.ok(Math.abs(turning.offsetX) < .001);
  }
});

test('current travel and the next path segment must agree before a turn', () => {
  const turning = new WalkingTurn(Math.PI);
  for (let at = .5; at <= 60; at += .5) {
    turning.update(sample(at, 0, { forwardHeading: Math.PI }), 1 / 60, contacts[0], false);
    assert.equal(turning.facing, -1);
  }
});

test('waiting and resizing cannot finish a pending turn or advance a frozen step', () => {
  const turning = new WalkingTurn(Math.PI);
  turning.update(sample(7, 0), .25, contacts[0], false);
  for (let i = 0; i < 100; i++) turning.update(sample(7, 0, { moving: false }), .05, contacts[0], false);
  assert.equal(turning.facing, -1); assert.equal(turning.frame, 2);
  for (let i = 0; i < 100; i++) turning.update(sample(7, 0), 0, contacts[0], false);
  assert.equal(turning.facing, -1);
  turning.update(sample(8, 0), 1 / 30, contacts[0], false);
  assert.equal(turning.facing, -1);
});

test('lean eases toward the bend and reduced motion keeps the body upright', () => {
  const turning = new WalkingTurn(Math.PI);
  turning.update(sample(1, Math.PI, { slope: .4 }), 1 / 60, contacts[0], false);
  assert.ok(turning.lean < 0 && turning.lean > -.01);
  const previous = turning.lean;
  turning.update(sample(2, 0, { slope: .4 }), 1 / 60, contacts[0], false);
  assert.ok(Math.abs(turning.lean - previous) < .01);
  turning.update(sample(3, 0, { slope: .4 }), 1 / 60, contacts[0], true);
  assert.equal(turning.lean, 0);
});

function walkRoute(dt) {
  const journey = new CoastalJourney(), turning = new WalkingTurn(path.heading(0)), turns = [];
  let descendingFacing;
  journey.toggle();
  for (let i = 0; i < 100000 && journey.phase.kind !== 'finished'; i++) {
    if (journey.phase.kind === 'photo') journey.closePhoto(true);
    else if (journey.phase.kind === 'game') journey.closeGame(journey.phase.id, false);
    else if (journey.phase.kind === 'paused') journey.toggle();
    journey.tick(dt);
    const previous = turning.facing;
    turning.update({ at: journey.at, stride: journey.stride, heading: journey.heading, forwardHeading: path.heading(journey.at + 18), slope: path.slope(journey.at), moving: journey.moving }, dt, contacts[0], false);
    if (previous !== turning.facing) turns.push({ at: journey.at, frame: turning.frame, facing: turning.facing });
    if (descendingFacing === undefined && journey.at >= path.at('saiwanShan') + 120) descendingFacing = turning.facing;
  }
  assert.equal(journey.phase.kind, 'finished'); assert.equal(turning.facing, -1);
  assert.equal(descendingFacing, 1);
  for (let i = 0; i < turns.length; i++) {
    assert.ok(turns[i].frame === 2 || turns[i].frame === 6);
    if (i) assert.ok(turns[i].at - turns[i - 1].at >= 24);
  }
  return turns;
}

test('all actual coastal bends remain stable at 30 and 60 frames per second', t => {
  const slow = walkRoute(1 / 30), fast = walkRoute(1 / 60);
  t.diagnostic(JSON.stringify({ turns30: slow, turns60: fast }));
  assert.equal(slow.length, fast.length);
  slow.forEach((turn, i) => {
    assert.equal(turn.facing, fast[i].facing);
    assert.ok(Math.abs(turn.at - fast[i].at) < 14, 'frame-rate differences must stay within one planted half-step');
  });
});
