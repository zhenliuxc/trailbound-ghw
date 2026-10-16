// Prepared optional QA; run only after the user authorizes tests and starts a local server.
// Chromium with emulated touch/viewport and software WebGL is not physical-phone/listening QA.
const assert=require('node:assert/strict'),fs=require('node:fs/promises'),path=require('node:path');
const {chromium}=require(process.env.TRAILBOUND_PLAYWRIGHT_MODULE||'playwright');
const audioChecks=process.env.TRAILBOUND_TEST_AUDIO==='1'?require('./mogan-audio-browser-probe.cjs'):null;
const base=process.env.TRAILBOUND_TEST_URL||'http://127.0.0.1:4173/',out=process.env.TRAILBOUND_REVIEW_DIR||'/tmp/trailbound-mogan-browser';
assert.ok(/^http:\/\/(127\.0\.0\.1|localhost):\d+\/$/.test(base),'Only an explicit localhost QA server is allowed');
const selected=(process.env.TRAILBOUND_TEST_VIEWPORTS||'desktop,phone').split(',');
assert.ok(selected.every(label=>['desktop','phone'].includes(label)));
const wanted=(process.env.TRAILBOUND_TEST_GAMES||'rain,footsteps,sling').split(',');
assert.ok(wanted.every(game=>['rain','footsteps','sling'].includes(game)));
let browser,currentPage,phase='launch';
const deadline=setTimeout(()=>{console.error('Mogan browser deadline at',phase);browser?.close().finally(()=>process.exit(1));},600000);deadline.unref();
setInterval(()=>console.log('Mogan browser:',phase),15000).unref();
async function advance(page,ms){for(let left=ms;left>0;left-=200)await page.clock.fastForward(Math.min(200,left));}
const visible=(page,id)=>page.locator('#'+id).isVisible();
async function click(page,id){
 await page.locator('#'+id).click({noWaitAfter:true});await advance(page,40);
}
async function point(page,x,y=.8){
 const b=await page.locator('#micro-surface').boundingBox();assert.ok(b);
 if(await page.evaluate(()=>navigator.maxTouchPoints>0))await page.touchscreen.tap(b.x+x*b.width,b.y+y*b.height);else await page.mouse.click(b.x+x*b.width,b.y+y*b.height);
}
async function footPoint(page){
 const box=await page.locator('#micro-surface').boundingBox(),index=parseInt(await page.locator('#mogan-count').innerText(),10)||0,height=Math.max(320,Math.round(800*box.height/box.width));
 return page.evaluate(({index,height})=>{const p=TrailRuntime.stepSpot({age:0,play:{reduced:true},steps:{index,landedAt:-10}},height);return {x:p.x/800,y:p.y/height};},{index,height});
}
async function paintedCue(page){return page.evaluate(()=>{
 const host=document.getElementById('micro-surface');
 for(const app of [...(window.__qaHintApps||[])].reverse()){
  try{
   if(app.canvas.parentElement!==host)continue;
   const root=app.stage.children.find(node=>node.label==='watercolor-hints'),group=root?.children.find(node=>node.visible),sprite=group?.children.find(node=>node instanceof PIXI.Sprite);
   if(!sprite||!sprite.visible)return {visible:false};
   const b=sprite.getBounds();return {visible:true,file:sprite.texture.source.resource?.src||'',width:b.width,height:b.height};
  }catch{ /* An earlier game's application may already be disposed. */ }
 }
 return {visible:false};
});}
async function slingDrag(page,angle,power,tapOnly=false){
 const box=await page.locator('#micro-surface').boundingBox(),height=Math.max(320,Math.round(800*box.height/box.width));
 const points=await page.evaluate(({height,angle,power})=>{const b=TrailRuntime.moganBounds(height),a=angle*Math.PI/180,from=TrailArtGames.aimPouch({sling:{angle:24,power:.5}}),to={x:TrailArtGames.slingOrigin.x-Math.cos(a)*.16*power,y:TrailArtGames.slingOrigin.y+Math.sin(a)*.16*power};return [from,to].map(p=>({x:(b.x+p.x*b.w)/800,y:(b.y+p.y*b.h)/height}));},{height,angle,power});
 if(tapOnly){await point(page,points[0].x,points[0].y);await advance(page,40);return;}
 const [from,to]=points.map(p=>({x:box.x+p.x*box.width,y:box.y+p.y*box.height}));
 if(await page.evaluate(()=>navigator.maxTouchPoints>0)){
  const session=await page.context().newCDPSession(page);
  try{await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...from,id:81}]});await advance(page,40);assert.equal((await paintedCue(page)).visible,false,'the cue leaves the paper leaf while it is held');
   for(let i=1;i<=8;i++)await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:from.x+(to.x-from.x)*i/8,y:from.y+(to.y-from.y)*i/8,id:81}]});
   await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  }finally{await session.detach();}
 }else{await page.mouse.move(from.x,from.y);await page.mouse.down();await advance(page,40);assert.equal((await paintedCue(page)).visible,false,'the cue leaves the paper leaf while it is held');await page.mouse.move(to.x,to.y,{steps:8});await page.mouse.up();}
 await advance(page,40);
}
async function ready(page){
 for(let i=0;i<150;i++){if(await page.locator('#micro-surface').getAttribute('aria-busy')==='false'&&await page.locator('#micro-surface canvas[data-ready="true"]').count())return;await advance(page,40);await new Promise(r=>setTimeout(r,25));}
 throw Error('Mogan canvas/art was not ready');
}
async function game(page,kind,label){
 await ready(page);await advance(page,700);
 if(kind==='footsteps'||kind==='sling'){const cue=await paintedCue(page);assert.equal(cue.visible,true,'the watercolor hint must be rendered');assert.match(cue.file,/hint-brush-v1\.webp$/);assert.ok(cue.width>30&&cue.height>5,'the hint must have a visible painted size');}
 if(audioChecks)await audioChecks.beforeGame(page,kind,label,click);await page.screenshot({path:path.join(out,label+'-'+kind+'.png'),animations:'disabled'});
 if(kind==='rain'){
  const phrase=[0,3,1,4,2,5,3,1];let previous=-1;
  for(let i=0;i<220&&await visible(page,'micro-panel');i++){
   const note=Math.min(7,parseInt(await page.locator('#mogan-count').innerText(),10)||0);if(note!==previous){await point(page,.14+phrase[note]*.143);previous=note;}await advance(page,200);
  }
 }else if(kind==='footsteps'){
  const first=await footPoint(page);await point(page,first.x,first.y);
  for(let i=0;i<250&&await visible(page,'micro-panel');i++){
   await advance(page,150);
   if(await page.locator('#mogan-tools').getAttribute('data-beat')==='open'){const foot=await footPoint(page);await point(page,foot.x,foot.y);}
  }
 }else if(kind==='sling'){
  // A tap without pulling must not shoot or award; then pull and release the painted leaf.
  await slingDrag(page,24,.5,true);await advance(page,1000);assert.equal(await visible(page,'reward-overlay'),false);
  await slingDrag(page,40,.6);await advance(page,4800);
 }else throw Error('Unexpected Mogan game '+kind);
 assert.equal(await visible(page,'micro-panel'),false,kind+' must finish');assert.equal(await visible(page,'reward-overlay'),true,kind+' must show an earned painting');
 if(audioChecks)await audioChecks.reward(page,kind);
 await page.screenshot({path:path.join(out,label+'-'+kind+'-reward.png'),animations:'disabled'});await click(page,'reward-continue');
 // WAAPI completion and the virtual business clock do not share a fixed deadline.
 for(let i=0;i<20&&await visible(page,'reward-overlay');i++){await new Promise(r=>setTimeout(r,100));await advance(page,200);}
 assert.equal(await visible(page,'reward-overlay'),false);
 if(audioChecks)await audioChecks.collected(page,kind);
}
(async()=>{
 await fs.mkdir(out,{recursive:true});
 browser=await chromium.launch({executablePath:process.env.TRAILBOUND_CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const results=[];
 for(const label of selected){
  phase=label+' open';const phone=label==='phone',page=await browser.newPage({viewport:phone?{width:390,height:844}:{width:1280,height:900},hasTouch:phone,isMobile:phone,reducedMotion:phone?'reduce':'no-preference'}),errors=[],failed=[],audioFiles=new Set();
  currentPage=page;page.on('console',m=>{if(m.type()==='warning'||m.type()==='error')console.log('Browser '+m.type()+': '+m.text());});
  page.on('pageerror',e=>errors.push(String(e)));page.on('requestfailed',r=>failed.push({url:r.url(),error:r.failure()?.errorText}));page.on('request',r=>{if(r.url().includes('/audio/'))audioFiles.add(r.url().split('/').pop());});
  if(audioChecks)await audioChecks.setup(page);
  await page.clock.install({time:new Date('2026-10-16T04:00:00Z')});await page.clock.pauseAt(new Date('2026-10-16T04:00:01Z'));await page.goto(base,{waitUntil:'networkidle'});await advance(page,100);
  await page.evaluate(()=>{window.__qaHintApps=[];const init=PIXI.Application.prototype.init;PIXI.Application.prototype.init=async function(...args){const result=await init.apply(this,args);window.__qaHintApps.push(this);return result;};});
  await click(page,'route-mogan');if(audioChecks)await audioChecks.enabled(page,click);else await click(page,'sound-toggle');await click(page,'overlay-action');if(audioChecks)await audioChecks.walking(page);const played=[];
  for(let turn=0;turn<500&&played.length<wanted.length;turn++){
   phase=label+' route '+turn;
   if(await visible(page,'micro-panel')){const kind=await page.locator('#micro-panel').getAttribute('data-game');if(!wanted.includes(kind)){await click(page,'micro-skip');if(/继续/.test(await page.locator('#walk-toggle').innerText()))await click(page,'walk-toggle');await advance(page,5000);continue;}phase=label+' play '+kind;await game(page,kind,label);played.push(kind);if(audioChecks&&/继续/.test(await page.locator('#walk-toggle').innerText()))await click(page,'walk-toggle');}
   else if(await visible(page,'observe-button'))await click(page,'observe-button');
   else if(await visible(page,'photo-panel'))await click(page,'photo-continue');
   else if(await visible(page,'story-panel')){await page.locator('#story-choices button').first().click();await advance(page,50);}
   else await advance(page,600);
  }
  assert.deepEqual(new Set(played),new Set(wanted));assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);
  const saved=await page.evaluate(()=>TrailDiscoveries.loadMoments(localStorage).filter(m=>m.route==='mogan'&&m.earned));assert.equal(saved.length,wanted.length);assert.equal(new Set(saved.map(m=>m.id)).size,wanted.length);
  const audio=audioChecks?await audioChecks.finish(page,label,click):undefined;
  results.push({viewport:label,played,earned:saved.length,pageErrors:errors,failedRequests:failed,audioRequests:[...audioFiles],audio,renderer:'Chromium WebGL via SwiftShader',reducedMotion:phone,physicalPhoneNotTested:true,listeningNotPerformed:true});
  await fs.writeFile(path.join(out,'results.json'),JSON.stringify(results,null,2));await page.close();
 }
 await browser.close();browser=null;console.log(JSON.stringify({passed:true,results},null,2));
})().catch(async e=>{console.error(e);if(currentPage&&!currentPage.isClosed()){await currentPage.clock.resume().catch(()=>{});await currentPage.screenshot({path:path.join(out,'failure.png'),animations:'disabled',timeout:10000}).catch(()=>{});console.error(await currentPage.locator('#micro-panel').evaluate(el=>el.outerHTML,{},{timeout:10000}).catch(()=>''));}await browser?.close();process.exitCode=1;});
