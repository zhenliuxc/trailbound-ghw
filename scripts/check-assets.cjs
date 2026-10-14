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
