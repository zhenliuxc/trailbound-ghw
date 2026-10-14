const test=require('node:test'),assert=require('node:assert/strict'),G=require('../dist/game'),{harness}=require('./dom-harness.cjs');
const flush=async()=>{await Promise.resolve();await Promise.resolve();};
test('selected-route photos load and decode before the first checkpoint, then reopen with no new request',async()=>{
 for(const route of G.ROUTES){
  const h=harness(undefined,{images:true});h.click('route-'+route.id);
  const images=route.checkpoints.map(cp=>h.photoImages.find(image=>image.getAttribute('src')===cp.photo.file));
  assert.ok(images.every(Boolean));assert.equal(h.$('photo-panel').hidden,true);
  images.forEach(image=>image.load());await flush();assert.ok(images.every(image=>image.decodeCalls===1));
  const requests=h.photoRequests.length;h.click('overlay-action');h.toPhoto();
  assert.equal(h.$('checkpoint-photo'),images[0]);assert.equal(h.$('checkpoint-photo').hidden,false);assert.equal(h.$('photo-loading').hidden,true);
  h.click('photo-continue');h.click('checkpoint-'+route.checkpoints[0].id);
  assert.equal(h.$('checkpoint-photo'),images[0]);assert.equal(h.photoRequests.length,requests);assert.equal(h.pendingFrames(),0);
  h.click('photo-close');assert.equal(h.pendingFrames(),1);
 }
});
test('a slow photo exposes its loading state without blocking continue or advancing photo dwell time',async()=>{
 let finishDecode;const h=harness(undefined,{images:true,decode:()=>new Promise(resolve=>{finishDecode=resolve;})});
 h.click('overlay-action');h.toPhoto();const image=h.$('checkpoint-photo'),progress=h.$('journey-progress').attributes['aria-valuenow'];
 assert.equal(h.$('photo-loading').hidden,false);assert.equal(image.hidden,true);image.load();await flush();assert.equal(image.hidden,true);
 h.advance(20);assert.equal(h.$('journey-progress').attributes['aria-valuenow'],progress);assert.equal(h.pendingFrames(),0);
 finishDecode();await flush();assert.equal(image.hidden,false);assert.equal(h.$('photo-loading').hidden,true);
 h.click('photo-continue');assert.equal(h.pendingFrames(),1);
});
test('a late load or failure from another route cannot change the currently displayed photo',async()=>{
 const h=harness(undefined,{images:true});h.click('overlay-action');h.toPhoto();const old=h.$('checkpoint-photo');
 h.click('route-tiger');h.click('overlay-action');h.toPhoto();const current=h.$('checkpoint-photo');
 current.load();await flush();old.fail();old.load();await flush();
 assert.equal(h.$('checkpoint-photo'),current);assert.equal(current.hidden,false);assert.equal(h.$('photo-error').hidden,true);assert.equal(h.$('photo-title').textContent,'高路山径');
});
test('preload failures retry when opening a photo, and a failed visible photo still permits continuation',async()=>{
 const h=harness(undefined,{images:true}),file=G.getRoute('wugong').checkpoints[0].photo.file,first=h.photoImages[0];
 first.fail();h.click('overlay-action');h.toPhoto();const retry=h.$('checkpoint-photo');assert.notEqual(retry,first);assert.equal(h.photoRequests.filter(src=>src===file).length,2);
 retry.fail();assert.equal(h.$('photo-error').hidden,false);assert.equal(h.$('photo-loading').hidden,true);assert.equal(retry.hidden,true);
 h.click('photo-continue');assert.equal(h.pendingFrames(),1);h.click('checkpoint-wugong-meadow');const next=h.$('checkpoint-photo');next.load();await flush();assert.equal(next.hidden,false);assert.equal(h.$('photo-error').hidden,true);
});
