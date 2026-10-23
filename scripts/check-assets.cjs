const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const dir=path.join(__dirname,'../dist'),html=fs.readFileSync(path.join(dir,'index.html'),'utf8');
const siteUrl=new URL('https://trailbound.invalid/');
const scripts=[...html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"/g)].map(match=>new URL(match[1],siteUrl).pathname.replace(/^\/+/,''));
function assertScriptBefore(dependency,consumer){
 const first=scripts.indexOf(dependency),second=scripts.indexOf(consumer);
 assert.ok(first>=0,`Missing script: ${dependency}`);assert.ok(second>=0,`Missing script: ${consumer}`);
 assert.ok(first<second,`${dependency} must load before ${consumer}`);
}
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length,'Duplicate HTML IDs');
for(const match of html.matchAll(/(?:src|href)="([^"#][^"]*)"/g)){
  const ref=match[1],url=new URL(ref,siteUrl);if(url.origin!==siteUrl.origin)continue;
  const file=decodeURIComponent(url.pathname).replace(/^\/+/, '');
  assert.ok(fs.existsSync(path.join(dir,file)),`Missing asset: ${ref}`);
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
const badges=JSON.parse(fs.readFileSync(path.join(dir,'badges/manifest.json'),'utf8')),D=require('../dist/discoveries.js');
assert.equal(badges.version,2);assert.equal(badges.columns,3);assert.equal(badges.rows,3);assert.equal(badges.cell,192);assert.equal(badges.entries.length,24);
assert.equal(new Set(badges.entries.map(entry=>entry.id)).size,badges.entries.length,'Duplicate historical badge IDs');
for(const [index,entry] of badges.entries.entries()){
 // The journal's historical atlas fallback still uses these original catalog positions.
 assert.equal(entry.id,D.CATALOG[index]?.id,'Historical atlas position no longer matches the journal moment');assert.equal(entry.column,index%3);assert.equal(entry.row,Math.floor(index%9/3));assert.equal(entry.atlas,badges.atlases[Math.floor(index/9)].file);
 const buffer=fs.readFileSync(path.join(dir,entry.file));assert.equal(buffer.toString('ascii',8,12),'WEBP');assert.equal(buffer.length,entry.bytes);assert.equal(crypto.createHash('sha256').update(buffer).digest('hex'),entry.sha256);
}
for(const sheet of badges.atlases){const atlas=fs.readFileSync(path.join(dir,sheet.file));assert.equal(atlas.toString('ascii',8,12),'WEBP');assert.equal(atlas.length,sheet.bytes);assert.ok(atlas.length<200000,'Badge atlas is too large for a small journal gallery');}
console.log('PASS: all 24 historical badges retain their journal atlas positions, file hashes and lightweight WebP atlases.');

const audio=require('../dist/audio.js'),recordings=JSON.parse(fs.readFileSync(path.join(dir,'audio/credits.json')));let recordedBytes=0;
for(const entry of recordings.entries){const data=fs.readFileSync(path.join(dir,entry.file));recordedBytes+=data.length;assert.equal(entry.file,audio.SAMPLES[entry.id]);assert.equal(data.length,entry.bytes);assert.equal(crypto.createHash('sha256').update(data).digest('hex'),entry.sha256);assert.ok(entry.author&&entry.source&&entry.license&&entry.licenseUrl&&entry.changes);}
assert.ok(recordedBytes<600000);console.log('PASS: lightweight recorded sound materials retain verified sources, licenses and hashes.');

const wugongAudio=JSON.parse(fs.readFileSync(path.join(dir,'audio/wugong-credits.json'))),runtime=require('../dist/runtime.js');
let musicBytes=0,foleyBytes=0;
const themeFiles=new Set(Object.values(runtime.WUGONG_THEMES).map(track=>track.file));
assert.deepEqual(new Set(wugongAudio.music.map(track=>track.file)),themeFiles);
assert.equal(themeFiles.size,4);assert.equal(wugongAudio.music.length,4);assert.equal(wugongAudio.cost.materialLicenseFee,0);assert.equal(wugongAudio.cost.paidSubscriptions,false);assert.equal(wugongAudio.cost.paidCommissions,false);
for(const entry of [...wugongAudio.music,...wugongAudio.effects]){
 const data=fs.readFileSync(path.join(dir,entry.file));assert.equal(data.length,entry.bytes);assert.equal(crypto.createHash('sha256').update(data).digest('hex'),entry.sha256);
 assert.ok(entry.author&&entry.source&&entry.acquiredFrom&&entry.license&&entry.licenseUrl&&entry.changes&&entry.sourceFileSha256);
 if(wugongAudio.music.includes(entry)){assert.ok(themeFiles.has(entry.file));assert.ok(entry.duration>60&&entry.duration<230);assert.ok(entry.attribution);assert.equal(entry.license,'CC BY 4.0');assert.ok(entry.bytes<wugongAudio.budgets.musicFileBytes);musicBytes+=data.length;}
 else{assert.equal(entry.file,audio.SAMPLES[entry.id]);foleyBytes+=data.length;}
}
assert.ok(musicBytes<wugongAudio.budgets.musicBytes&&wugongAudio.budgets.musicBytes<=6000000);assert.ok(wugongAudio.budgets.musicFileBytes<=3000000);
assert.ok(foleyBytes<wugongAudio.budgets.effectsBytes&&wugongAudio.budgets.effectsBytes<=100000);
assert.ok(fs.existsSync(path.join(dir,'audio/KENNEY-RPG-LICENSE.txt')));
console.log('PASS: four free Wugong themes and short foley retain attribution, provenance, hashes and separate streaming/effects budgets.');

const moganAudio=JSON.parse(fs.readFileSync(path.join(dir,'audio/mogan-credits.json')));
assert.equal(moganAudio.cost.materialLicenseFee,0);assert.equal(moganAudio.cost.newAudioBytes,0);
assert.equal(moganAudio.music.length,4);
for(const entry of [...moganAudio.music,...moganAudio.effects]){
 const bytes=fs.readFileSync(path.join(dir,entry.file));assert.equal(bytes.length,entry.bytes);assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),entry.sha256);assert.ok(entry.author&&entry.source&&entry.license&&entry.licenseUrl);
}
for(const [game,track]of Object.entries(runtime.MOGAN_THEMES))assert.equal(moganAudio.music.find(row=>row.scene===game).file,track.file);
const moganProps=JSON.parse(fs.readFileSync(path.join(dir,'sprites/mogan-props-v1.json'))),moganBytes=fs.readFileSync(path.join(dir,moganProps.file));
assert.equal(moganBytes.length,moganProps.bytes);assert.equal(crypto.createHash('sha256').update(moganBytes).digest('hex'),moganProps.sha256);assert.ok(moganBytes.length<350000);assert.equal(moganProps.frames.length,4);
for(const frame of moganProps.frames)assert.ok(frame.x>=0&&frame.y>=0&&frame.w>0&&frame.h>0&&frame.x+frame.w<=moganProps.width&&frame.y+frame.h<=moganProps.height);
assert.ok(moganProps.tip.x>=0&&moganProps.tip.x<=1&&moganProps.tip.y>=0&&moganProps.tip.y<=1);
assert.deepEqual(Object.keys(runtime.MOGAN_GAMES).sort(),['bamboo-drop','bamboo-leaf','bamboo-step']);
console.log('PASS: Mogan registered games retain packaged watercolor props, source metadata and free audio reuse without duplicate downloads.');

const hint=require('../dist/hint-art.js'),hintManifest=JSON.parse(fs.readFileSync(path.join(dir,'sprites/hint-brush-v1.json'))),hintBytes=fs.readFileSync(path.join(dir,hintManifest.file));
assert.equal(hintBytes.length,hintManifest.bytes);assert.equal(crypto.createHash('sha256').update(hintBytes).digest('hex'),hintManifest.sha256);assert.ok(hintBytes.length<30000);
for(const key of ['file','width','height','tip'])assert.deepEqual(hint.HINT_ART[key],hintManifest[key]);
assert.ok(hintManifest.tip.x>0&&hintManifest.tip.x<=1&&hintManifest.tip.y>0&&hintManifest.tip.y<1);
assert.ok(runtime.MOGAN_ROUTE_ASSETS.includes(hintManifest.file));
for(const file of ['water-scene.js','mini-games.js'])assertScriptBefore('hint-art.js',file);
console.log('PASS: the lightweight watercolor hint retains its source, alpha-preserving packaging metadata and shared tip anchor.');

const current=JSON.parse(fs.readFileSync(path.join(dir,'badges/landscape-v3.json'),'utf8'));
const profiles=require('../dist/route-moments.js');
assert.equal(current.edition,3);assert.deepEqual(current.entries.map(entry=>entry.id),badges.entries.map(entry=>entry.id));
for(const art of current.entries){const e=profiles.profile(art.id);assert.ok(e,`Missing historical profile: ${art.id}`);assert.equal(art.tag,e.tag);assert.equal(art.scene,e.scene);assert.equal(art.play,e.play);assert.equal(art.file,e.badge);const b=fs.readFileSync(path.join(dir,art.file));assert.equal(b.length,art.bytes);assert.equal(crypto.createHash('sha256').update(b).digest('hex'),art.sha256);assert.match(b.toString(),/viewBox="0 0 192 192"/);assert.ok(!/<script|<foreignObject|(?:href|src)="https?:|<image/.test(b.toString()));}
console.log('PASS: all 24 historical interaction labels retain their profile mappings, native SVG artwork and hashes.');

const v4=require("../dist/badges/art-v4.json");
assert.equal(v4.runtimeBound,true);assert.equal(v4.runtimeBoundCount,23);
for(const a of v4.entries){assert.ok(a.runtimeBound&&a.runtimeMomentIds.length);const b=fs.readFileSync(path.join(dir,a.file));assert.equal(crypto.createHash("sha256").update(b).digest("hex"),a.sha256);for(const id of a.runtimeMomentIds){assert.equal(D.item(id).artV4,a.file);assert.equal(D.item(id).route,a.route);}}
console.log("PASS: all 23 watercolor images are bound to route-correct playable moments.");

const additions=require('../dist/badges/art-v5.json');
assert.equal(additions.artVersion,5);assert.equal(additions.entries.length,6);
for(const a of additions.entries){const e=D.item(a.id),bytes=fs.readFileSync(path.join(dir,a.file));assert.equal(e.artV5,a.file);assert.equal(e.route,a.route);assert.equal(a.runtimeBound,true);assert.equal(bytes.toString('ascii',8,12),'WEBP');assert.equal(bytes.length,a.bytes);assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),a.sha256);}
const collectibleMoments=D.CATALOG.filter(entry=>entry.reward!==false);
for(const entry of collectibleMoments){
 const file=entry.artV5||entry.artV4;
 assert.ok(file,`Missing runtime watercolor artwork: ${entry.id}`);
 assert.equal(D.tagArt({id:entry.id,edition:3,earned:true,artVersion:entry.artV5?5:4}),file,`Journal artwork selection differs from the current reward: ${entry.id}`);
 const bytes=fs.readFileSync(path.join(dir,file));assert.equal(bytes.toString('ascii',0,4),'RIFF',file);assert.equal(bytes.toString('ascii',8,12),'WEBP',file);
}
console.log(`PASS: all ${collectibleMoments.length} collectible types resolve to packaged runtime watercolor artwork; six v5 revisions preserve their historical SVG files.`);

const scenes=require('../dist/scenes/manifest.json');assert.equal(scenes.entries.length,7);
for(const e of scenes.entries){const data=fs.readFileSync(path.join(dir,e.file));assert.equal(data.toString('ascii',8,12),'WEBP');assert.equal(data.length,e.bytes);assert.equal(crypto.createHash('sha256').update(data).digest('hex'),e.sha256);assert.ok(routes.some(r=>r.id===e.route));assert.equal(e.file,'scenes/'+e.route+'-v1.webp');}
assert.ok(!html.includes('journal-import'));
console.log('PASS: seven illustrated scene backgrounds are packaged for their routes; removed journal import is absent.');

const windLayers=require('../dist/sprites/wind-layers.json');
for(const a of windLayers.entries){const b=fs.readFileSync(path.join(dir,a.file));assert.equal(b.toString('ascii',8,12),'WEBP');assert.equal(b.length,a.bytes);assert.equal(crypto.createHash('sha256').update(b).digest('hex'),a.sha256);assert.ok(b.length<220000);assert.ok(fs.readFileSync(path.join(dir,'wind-scene.js'),'utf8').includes(a.file));}
console.log('PASS: generated Wugong foreground is packaged, hash-verified and used by the scene.');

const waterLayers=require('../dist/sprites/water-layers.json'),water=require('../dist/water-scene.js');
for(const a of waterLayers.entries){const b=fs.readFileSync(path.join(dir,a.file));assert.equal(b.toString('ascii',8,12),'WEBP');assert.equal(b.length,a.bytes);assert.equal(crypto.createHash('sha256').update(b).digest('hex'),a.sha256);assert.ok(b.length<350000);assert.ok(a.supersededBy?waterLayers.entries.some(e=>e.file===a.supersededBy):Object.values(water.assets).some(group=>Object.values(group).includes(a.file)));}
assertScriptBefore('water-scene.js','mini-games.js');
console.log('PASS: water encounter artwork is packaged, hash-verified and loaded before gameplay.');

const artProps=require('../dist/sprites/art-play-props-v1.json'),artAtlas=require('../dist/art-play-atlas.js'),artGames=require('../dist/art-games.js');
const propBytes=fs.readFileSync(path.join(dir,artProps.file));
assert.equal(propBytes.length,artProps.bytes);assert.equal(crypto.createHash('sha256').update(propBytes).digest('hex'),artProps.sha256);assert.ok(propBytes.length<350000);
assert.deepEqual(artAtlas.frames,artProps.frames);assert.equal(artAtlas.frames.length,8);
for(const frame of artAtlas.frames){assert.ok(frame.w>0&&frame.h>0&&frame.x>=0&&frame.y>=0&&frame.x+frame.w<=artAtlas.width&&frame.y+frame.h<=artAtlas.height);}
for(const group of Object.values(artGames.assets))for(const file of Object.values(group))assert.ok(fs.existsSync(path.join(dir,file)),file);
for(const file of ['art-play-atlas.js','art-games.js','art-game-scene.js'])assertScriptBefore(file,'mini-games.js');
console.log('PASS: watercolor play atlas, frame bounds and three artwork-game resources are packaged.');
