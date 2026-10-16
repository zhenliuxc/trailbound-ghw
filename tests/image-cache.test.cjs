const test=require('node:test'),assert=require('node:assert/strict'),Cache=require('../dist/image-cache.js');
function fixture(){const images=[];class Image{constructor(){this.attributes={};images.push(this);}setAttribute(k,v){this.attributes[k]=v;}decode(){return Promise.resolve();}}return {Image,images};}
const flush=()=>new Promise(resolve=>setImmediate(resolve));
test('art prefetch limits concurrent requests, decodes and reuses image nodes',async()=>{
 const f=fixture(),c=Cache.create(f.Image);c.prefetch(['a','b','c']);assert.equal(f.images.length,2);const a=c.request('a','high');assert.equal(a.image,f.images[0]);assert.equal(f.images[0].attributes.fetchpriority,'high');f.images[0].onload();await flush();assert.equal(a.state,'ready');assert.equal(f.images.length,3);assert.equal(c.request('a').image,a.image);assert.equal(c.active,2);
});
test('route switch cancels obsolete queued art; failures can retry and cache is bounded',async()=>{
 const f=fixture(),c=Cache.create(f.Image,{limit:3,concurrency:1});c.prefetch(['old1','old2','old3']);const old=c.request('old2');c.prefetch(['new1','new2']);assert.equal((await old.promise).state,'cancelled');f.images[0].onerror();assert.equal(f.images[1].attributes.src,'new1');f.images[1].onload();await flush();f.images[2].onload();await flush();assert.ok(c.size<=3);const retry=c.request('old1','high');assert.equal(retry.state,'loading');assert.equal(f.images.at(-1).attributes.src,'old1');
});
test('failed decode is visible as an error and never marked ready',async()=>{
 const f=fixture(),c=Cache.create(f.Image);const a=c.request('a');a.image.decode=()=>Promise.reject(Error('decode'));a.image.onload();await flush();assert.equal(a.state,'error');assert.equal(c.active,0);
});
