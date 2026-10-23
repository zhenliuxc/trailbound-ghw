import assert from 'node:assert/strict';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { build } from 'esbuild';

const root = fileURLToPath(new URL('../', import.meta.url)), output = path.join(root, '.build/full-route-check');
await mkdir(output, { recursive: true });
await build({ absWorkingDir: root, entryPoints: ['src/wugong-meadow/terrain.ts', 'src/wugong-meadow/journey.ts', 'src/wugong-walk/environment.ts'], outdir: output, outbase: 'src', outExtension: { '.js': '.mjs' }, bundle: true, platform: 'node', format: 'esm', packages: 'external' });
const { createWugongTerrain } = await import(pathToFileURL(path.join(output, 'wugong-meadow/terrain.mjs')));
const { WugongJourney } = await import(pathToFileURL(path.join(output, 'wugong-meadow/journey.mjs')));
const { SceneEnvironment } = await import(pathToFileURL(path.join(output, 'wugong-walk/environment.mjs')));
const terrain = createWugongTerrain(JSON.parse(await readFile(path.join(root, 'dist/scenes/wugong-relief-height-v2.json'), 'utf8')));
const journey = new WugongJourney(terrain), weather = new SceneEnvironment(journey.environment), events = [];
journey.openStop('summit'); assert.equal(journey.hasVisited('summit'), false); journey.closeVisit(true); assert.equal(journey.mode.kind, 'ready');
journey.toggle();
let frames = 0;
while (journey.mode.kind !== 'finished') {
  assert.ok(frames++ < 100000, 'The full journey must finish without teleporting');
  if (journey.mode.kind === 'visiting') {
    events.push({ id: journey.mode.id, distance: journey.distance, day: journey.day });
    const at = journey.distance; journey.advance(1); assert.equal(journey.distance, at, 'A photo dialog must pause walking');
    journey.closeVisit(true);
    if (journey.mode.kind === 'camp') {
      journey.advance(8); assert.equal(journey.distance, at);
      journey.openStop('start'); journey.closeVisit(true); assert.equal(journey.mode.kind, 'camp', 'Browsing an earlier photo must preserve camp rest');
      weather.setTime('night'); weather.advance(20, journey.environment); assert.ok(weather.frame.night > .9);
      journey.toggle(); assert.equal(journey.day, 2); weather.setTime('journey');
    }
  }
  journey.advance(1 / 60); weather.advance(1 / 60, journey.environment);
}
assert.deepEqual(events.map(event => event.id), ['start', 'slope', 'meadow', 'camp', 'horse', 'summit', 'end']);
assert.deepEqual(events.map(event => event.day), [1, 1, 1, 1, 2, 2, 2]);
assert.equal(journey.distance, terrain.length); assert.ok(terrain.length > 600);
const end = journey.distance; journey.advance(10); assert.equal(journey.distance, end);
journey.reset(); assert.equal(journey.distance, 0); assert.equal(journey.day, 1); assert.equal(journey.hasVisited('summit'), false);
assert.equal(journey.mode.kind, 'visiting');
journey.startAtCamp(); assert.equal(journey.day, 2); assert.equal(journey.hasVisited('start'), false);
journey.toggle();
while (journey.mode.kind !== 'visiting') journey.advance(1 / 30);
assert.equal(journey.mode.id, 'horse', 'The public second-day entrance must start at camp and continue forward');
const departure = new WugongJourney(terrain); departure.openStop('start'); assert.equal(departure.hasVisited('start'), true); departure.closeVisit(true); assert.equal(departure.mode.kind, 'walking');
const result = { result: 'passed', routeSceneLength: terrain.length, events, frames, scope: 'Actual journey state machine and shared weather clock. No browser, DOM, GPU or phone emulation.' };
const proof = path.join(root, 'docs/previews/wugong-full-3d'); await mkdir(proof, { recursive: true });
await writeFile(path.join(proof, 'journey-check.json'), JSON.stringify(result, null, 2) + '\n');
process.stdout.write(JSON.stringify(result, null, 2) + '\n');
