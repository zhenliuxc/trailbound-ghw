const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const dir=path.join(__dirname,'../dist'),html=fs.readFileSync(path.join(dir,'index.html'),'utf8');
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length,'Duplicate HTML IDs');
for(const match of html.matchAll(/(?:src|href)="([^"#][^"]*)"/g)){
  const ref=match[1];if(ref==='./'||/^https?:/.test(ref))continue;assert.ok(fs.existsSync(path.join(dir,ref)),`Missing asset: ${ref}`);
}
for(const match of html.matchAll(/<use[^>]+href="#([^"]+)"/g))assert.ok(ids.includes(match[1]),`Missing SVG symbol: ${match[1]}`);
assert.match(html,/name="viewport"/);assert.match(html,/lang="zh-CN"/);assert.match(html,/aria-live="polite"/);
console.log('PASS: local assets, unique IDs, SVG symbol references, viewport and accessible status.');
const routes=require('../dist/routes.js').ROUTES;
for(const r of routes)for(const cp of r.checkpoints){const file=path.join(dir,cp.photo.file),buffer=fs.readFileSync(file);assert.equal(buffer.toString('ascii',0,4),'RIFF');assert.equal(buffer.toString('ascii',8,12),'WEBP');assert.ok(cp.photo.author&&cp.photo.license&&cp.photo.licenseUrl&&cp.photo.source&&cp.photo.alt,'Incomplete photo attribution');}
assert.ok(!html.includes('tile.openstreetmap.org'));
console.log('PASS: all checkpoint photos are packaged WebP assets with authorship, license, source and alt text.');
const crypto=require('node:crypto');
const bundled=fs.readFileSync(path.join(dir,'vendor/pixi-8.22.0.min.js')),upstream=fs.readFileSync(path.join(__dirname,'../node_modules/pixi.js/dist/pixi.min.js'));
assert.equal(crypto.createHash('sha256').update(bundled).digest('hex'),crypto.createHash('sha256').update(upstream).digest('hex'),'Vendored PixiJS differs from installed upstream distribution');
assert.ok(fs.existsSync(path.join(dir,'vendor/PIXI-LICENSE.txt')));
console.log('PASS: pinned PixiJS browser bundle matches the installed upstream package and includes its license.');
const badges=JSON.parse(fs.readFileSync(path.join(dir,'badges/manifest.json'),'utf8')),moments=require('../dist/discoveries.js').CATALOG.filter(e=>!e.bonus);
assert.equal(badges.version,2);assert.equal(badges.columns,3);assert.equal(badges.rows,3);assert.equal(badges.cell,192);assert.equal(badges.entries.length,moments.length);
for(const [index,entry] of badges.entries.entries()){
 assert.equal(entry.id,moments[index].id,'Badge art does not match the journal moment');assert.equal(entry.column,index%3);assert.equal(entry.row,Math.floor(index%9/3));assert.equal(entry.atlas,badges.atlases[Math.floor(index/9)].file);
 const buffer=fs.readFileSync(path.join(dir,entry.file));assert.equal(buffer.toString('ascii',8,12),'WEBP');assert.equal(crypto.createHash('sha256').update(buffer).digest('hex'),entry.sha256);
}
for(const sheet of badges.atlases){const atlas=fs.readFileSync(path.join(dir,sheet.file));assert.equal(atlas.toString('ascii',8,12),'WEBP');assert.equal(atlas.length,sheet.bytes);assert.ok(atlas.length<200000,'Badge atlas is too large for a small journal gallery');}
console.log('PASS: all generated badges map to their moments through lightweight WebP atlases.');

const audio=require('../dist/audio.js'),recordings=JSON.parse(fs.readFileSync(path.join(dir,'audio/credits.json')));let recordedBytes=0;
for(const entry of recordings.entries){const data=fs.readFileSync(path.join(dir,entry.file));recordedBytes+=data.length;assert.equal(entry.file,audio.SAMPLES[entry.id]);assert.equal(data.length,entry.bytes);assert.equal(crypto.createHash('sha256').update(data).digest('hex'),entry.sha256);assert.ok(entry.author&&entry.source&&entry.license&&entry.licenseUrl&&entry.changes);}
assert.ok(recordedBytes<600000);console.log('PASS: lightweight recorded sound materials retain verified sources, licenses and hashes.');

const current=JSON.parse(fs.readFileSync(path.join(dir,'badges/landscape-v3.json'),'utf8'));
assert.equal(current.edition,3);assert.equal(current.entries.length,moments.length);
for(const e of moments){const art=current.entries.find(a=>a.id===e.id);assert.equal(art.tag,e.tag);assert.equal(art.scene,e.scene);assert.equal(art.play,e.play);assert.equal(art.file,e.badge);const b=fs.readFileSync(path.join(dir,art.file));assert.equal(b.length,art.bytes);assert.equal(crypto.createHash('sha256').update(b).digest('hex'),art.sha256);assert.match(b.toString(),/viewBox="0 0 192 192"/);assert.ok(!/<script|<foreignObject|(?:href|src)="https?:|<image/.test(b.toString()));}
console.log('PASS: all 24 current interaction labels have matching native SVG artwork and hashes; historical atlases remain intact.');

const v4=require("../dist/badges/art-v4.json"),D=require("../dist/discoveries.js");
assert.equal(v4.runtimeBound,true);assert.equal(v4.runtimeBoundCount,23);
for(const a of v4.entries){assert.ok(a.runtimeBound&&a.runtimeMomentIds.length);const b=fs.readFileSync(path.join(dir,a.file));assert.equal(crypto.createHash("sha256").update(b).digest("hex"),a.sha256);for(const id of a.runtimeMomentIds){assert.equal(D.item(id).artV4,a.file);assert.equal(D.item(id).route,a.route);}}
console.log("PASS: all 23 watercolor images are bound to route-correct playable moments.");

const additions=require('../dist/badges/art-v5.json');
assert.equal(additions.artVersion,5);assert.equal(additions.entries.length,6);
for(const a of additions.entries){const e=D.item(a.id),bytes=fs.readFileSync(path.join(dir,a.file));assert.equal(e.artV5,a.file);assert.equal(e.route,a.route);assert.equal(a.runtimeBound,true);assert.equal(bytes.toString('ascii',8,12),'WEBP');assert.equal(bytes.length,a.bytes);assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),a.sha256);}
assert.ok(D.CATALOG.every(e=>e.artV5||e.artV4));
console.log('PASS: all 29 collectible types have runtime watercolor artwork; six new revisions preserve their historical SVG files.');

const scenes=require('../dist/scenes/manifest.json');assert.equal(scenes.entries.length,7);
for(const e of scenes.entries){const data=fs.readFileSync(path.join(dir,e.file));assert.equal(data.toString('ascii',8,12),'WEBP');assert.equal(data.length,e.bytes);assert.equal(crypto.createHash('sha256').update(data).digest('hex'),e.sha256);assert.ok(routes.some(r=>r.id===e.route));assert.equal(e.file,'scenes/'+e.route+'-v1.webp');}
assert.ok(!html.includes('journal-import'));
console.log('PASS: seven illustrated scene backgrounds are packaged for their routes; removed journal import is absent.');

const windLayers=require('../dist/sprites/wind-layers.json');
for(const a of windLayers.entries){const b=fs.readFileSync(path.join(dir,a.file));assert.equal(b.toString('ascii',8,12),'WEBP');assert.equal(b.length,a.bytes);assert.equal(crypto.createHash('sha256').update(b).digest('hex'),a.sha256);assert.ok(b.length<220000);assert.ok(fs.readFileSync(path.join(dir,'wind-scene.js'),'utf8').includes(a.file));}
console.log('PASS: generated Wugong foreground is packaged, hash-verified and used by the scene.');

const waterLayers=require('../dist/sprites/water-layers.json'),water=require('../dist/water-scene.js');
for(const a of waterLayers.entries){const b=fs.readFileSync(path.join(dir,a.file));assert.equal(b.toString('ascii',8,12),'WEBP');assert.equal(b.length,a.bytes);assert.equal(crypto.createHash('sha256').update(b).digest('hex'),a.sha256);assert.ok(b.length<350000);assert.ok(Object.values(water.assets).some(group=>Object.values(group).includes(a.file)));}
assert.ok(html.indexOf('src="water-scene.js"')<html.indexOf('src="mini-games.js"'));
console.log('PASS: water encounter artwork is packaged, hash-verified and loaded before gameplay.');
