// Pure runtime behavior only. These checks do not verify browser rendering or listening quality.
const test = require('node:test');
const assert = require('node:assert/strict');
const {
  createWugongRoute,
  wugongPhase,
  wugongViewport,
  wugongNearby,
  createMapGait,
  mapWalkFrame,
  layoutMapLabels,
} = require('../dist/runtime.js');

function near(actual, expected, tolerance = 1e-7) {
  assert.ok(Number.isFinite(actual) && Math.abs(actual - expected) <= tolerance, `${actual} differs from ${expected}`);
}

function pathEnd(path) {
  const numbers = path.match(/-?\d+(?:\.\d+)?/g).map(Number);
  return numbers.slice(-2);
}

function labelBox(placement, width, height) {
  return { x: placement.x - width / 2, y: placement.y - height / 2, width, height };
}

function separate(a, b) {
  return a.x + a.width <= b.x || b.x + b.width <= a.x || a.y + a.height <= b.y || b.y + b.height <= a.y;
}

test('the walk reveals forest, climb, meadow, ridge and summit in route order', () => {
  assert.deepEqual([.1, .18, .3, .65, .95].map(progress => wugongPhase(progress).id), [
    'forest', 'climb', 'meadow', 'ridge', 'summit',
  ]);
  assert.deepEqual([.12, .24, .48, .88, 1].map(progress => wugongPhase(progress).id), [
    'climb', 'meadow', 'ridge', 'summit', 'summit',
  ]);
});

test('the cloud sea stays hidden below the ridge and opens gradually on approach', () => {
  assert.equal(wugongPhase(.45).cloudReveal, 0);
  assert.equal(wugongPhase(.6).cloudReveal, 1);
  near(wugongPhase(.52).cloudReveal, .5);
  assert.ok(wugongPhase(.49).cloudReveal < wugongPhase(.55).cloudReveal);
});

test('climbing shortens the suggested stride and increases forward lean', () => {
  const climb = wugongPhase(.18), meadow = wugongPhase(.3);
  assert.ok(climb.strideScale < meadow.strideScale);
  assert.ok(climb.leanDegrees > meadow.leanDegrees);
  assert.ok(Math.abs(wugongPhase(.12001).leanDegrees - wugongPhase(.11999).leanDegrees) < .01);
});

test('the artistic route starts at Zhong An and finishes at the summit position', () => {
  const route = createWugongRoute();
  const start = route.sample(0), finish = route.sample(1);
  assert.deepEqual([start.x, start.y], [170, 705]);
  assert.deepEqual([finish.x, finish.y], [3450, 315]);
});

test('the original meadow and cloud photograph progress lands on the intended scenery', () => {
  const route = createWugongRoute(), meadow = route.sample(.25), clouds = route.sample(.5);
  near(meadow.x, 1170); near(meadow.y, 535);
  near(clouds.x, 2050); near(clouds.y, 450);
});

test('the completed route ends at the hiker rather than ahead or behind it', () => {
  const route = createWugongRoute();
  for (const progress of [.04, .17, .42, .69, .93, 1]) {
    const point = route.sample(progress), end = pathEnd(route.pathUntil(progress));
    near(end[0], point.x, .002); near(end[1], point.y, .002);
  }
  assert.equal(route.pathUntil(1), route.path);
  assert.deepEqual(pathEnd(route.pathUntil(0)), [170, 705]);
});

test('important bends keep the hiker position and facing continuous', () => {
  const route = createWugongRoute();
  for (const progress of [.06, .12, .19, .25, .34, .5, .62, .78, .9]) {
    const before = route.sample(progress - .000001), after = route.sample(progress + .000001);
    const turn = Math.atan2(Math.sin(after.heading - before.heading), Math.cos(after.heading - before.heading));
    assert.ok(Math.hypot(after.x - before.x, after.y - before.y) < .1, `position jumps at ${progress}`);
    assert.ok(Math.abs(turn) < .005, `facing jumps at ${progress}`);
  }
});

test('phone, desktop and wide desktop crops keep their aspect and contain the hiker', () => {
  const route = createWugongRoute();
  for (const [width, height] of [[390, 460], [1280, 640], [1920, 680]]) {
    for (const progress of [0, .18, .5, .78, 1]) {
      const point = route.sample(progress), view = wugongViewport(width, height, progress, point);
      near(view.w / view.h, width / height);
      assert.ok(point.x >= view.x && point.x <= view.x + view.w);
      assert.ok(point.y >= view.y && point.y <= view.y + view.h);
      assert.ok(view.w < 1800, 'the main crop must not expose the whole 3600-unit journey');
      assert.ok(width === 390 ? view.w >= 430 && view.w <= 600 : view.w >= 900 && view.w <= 1250);
    }
  }
});

test('the local lens looks ahead of the path point without a step-dependent camera offset', () => {
  const point = createWugongRoute().sample(.65);
  for (const [width, height] of [[390, 460], [1280, 640], [1920, 680]]) {
    const view = wugongViewport(width, height, .65, point);
    near(view.x + view.w / 2 - point.x, 80);
  }
});

test('nearby stops expose only the camp, viewpoint or summit actions at that place', () => {
  const camp = wugongNearby(.34), rock = wugongNearby(.55), summit = wugongNearby(.97);
  assert.deepEqual([camp.id, rock.id, summit.id], ['camp', 'view-rock', 'summit']);
  assert.deepEqual(camp.actions, ['rest']);
  assert.deepEqual(rock.actions, ['cloudsea', 'photo', 'sketch']);
  assert.deepEqual(summit.actions, ['summit']);
});

test('stop invitations disappear outside their individual approach ranges', () => {
  assert.deepEqual([wugongNearby(.315).id, wugongNearby(.522).id, wugongNearby(1).id], ['camp', 'view-rock', 'summit']);
  assert.deepEqual([.1, .314, .366, .521, .579, .939].map(wugongNearby), [null, null, null, null, null, null]);
});

test('starting the walk plants a foot on the first advancing frame only', () => {
  const gait = createMapGait();
  assert.deepEqual([
    gait.update(0, true, 1).contact,
    gait.update(.016, true, 1).contact,
    gait.update(.016, true, 1).contact,
  ], [false, true, false]);
});

test('contact pulses expire during muted walking instead of accumulating for later playback', () => {
  const gait = createMapGait();
  const mutedContacts = Array.from({ length: 7 }, () => gait.update(.1, true, 1).contact);
  assert.deepEqual(mutedContacts, [true, false, false, false, false, false, true]);
  // The app may start listening here. The model must not replay either earlier pulse.
  assert.equal(gait.update(.016, true, 1).contact, false);
  assert.equal(gait.update(.016, true, 1).contact, false);
});

test('stopping freezes the gait and resuming begins from a planted foot', () => {
  const gait = createMapGait();
  gait.update(.1, true, 1); gait.update(.1, true, 1);
  const before = gait.update(.1, true, 1), stopped = gait.update(10, false, 1);
  near(stopped.clock, before.clock);
  assert.equal(stopped.contact, false);
  const resume = gait.update(0, true, 1);
  assert.equal(mapWalkFrame(resume.clock), 4);
  assert.deepEqual([resume.contact, gait.update(.016, true, 1).contact, gait.update(.016, true, 1).contact], [false, true, false]);
});

test('crowded required endpoint names find space beyond local candidates without covering controls or each other', () => {
  const avoidance = { x: 90, y: 65, width: 180, height: 110 };
  const placements = layoutMapLabels({
    width: 360,
    height: 240,
    boxes: [avoidance],
    labels: [
      { id: 'start', anchor: { x: 175, y: 120 }, width: 100, height: 30, clearance: 12, preferredSide: 'bottom', priority: 100, required: true },
      { id: 'end', anchor: { x: 185, y: 120 }, width: 100, height: 30, clearance: 12, preferredSide: 'top', priority: 100, required: true },
    ],
  });
  const start = placements.get('start'), end = placements.get('end');
  assert.deepEqual([start.visible, end.visible], [true, true]);
  const boxes = [labelBox(start, 100, 30), labelBox(end, 100, 30)];
  for (const box of boxes) {
    assert.equal(separate(box, avoidance), true);
    assert.ok(box.x >= 10 && box.y >= 10 && box.x + box.width <= 350 && box.y + box.height <= 230);
  }
  assert.equal(separate(boxes[0], boxes[1]), true);
});
