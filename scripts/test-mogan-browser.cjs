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
async function ready(page){
 for(let i=0;i<150;i++){if(await page.locator('#micro-surface').getAttribute('aria-busy')==='false'&&await page.locator('#micro-surface canvas[data-ready="true"]').count())return;await advance(page,40);await new Promise(r=>setTimeout(r,25));}
 throw Error('Mogan canvas/art was not ready');
}
async function game(page,kind,label){
 await ready(page);if(audioChecks)await audioChecks.beforeGame(page,kind,label,click);await page.screenshot({path:path.join(out,label+'-'+kind+'.png'),animations:'disabled'});
 if(kind==='rain'){
  const phrase=[0,3,1,4,2,5,3,1];let previous=-1;
  for(let i=0;i<220&&await visible(page,'micro-panel');i++){
   const note=Math.min(7,parseInt(await page.locator('#mogan-count').innerText(),10)||0);if(note!==previous){await point(page,.14+phrase[note]*.143);previous=note;}await advance(page,200);
  }
 }else if(kind==='footsteps'){
  await click(page,'mogan-start');
  for(let i=0;i<250&&await visible(page,'micro-panel');i++){
   await advance(page,150);
   for(const side of ['left','right'])if(await page.locator('#mogan-foot-'+side).getAttribute('data-ready')==='true')await click(page,'mogan-foot-'+side);
  }
 }else if(kind==='sling'){
  // First confirm an unadjusted shot earns nothing, then use the actual fine controls.
  await click(page,'mogan-start');await advance(page,3600);assert.equal(await visible(page,'reward-overlay'),false);
  await click(page,'mogan-tune');
  for(const [id,value]of [['mogan-angle',40],['mogan-power',60]])await page.locator('#'+id).evaluate((el,value)=>{el.value=String(value);el.dispatchEvent(new Event('input',{bubbles:true}));},value);
  await click(page,'mogan-start');await advance(page,4800);
 }else throw Error('Unexpected Mogan game '+kind);
 assert.equal(await visible(page,'micro-panel'),false,kind+' must finish');assert.equal(await visible(page,'reward-overlay'),true,kind+' must show an earned painting');
 if(audioChecks)await audioChecks.reward(page,kind);
 await page.screenshot({path:path.join(out,label+'-'+kind+'-reward.png'),animations:'disabled'});await click(page,'reward-continue');await new Promise(r=>setTimeout(r,850));await advance(page,850);assert.equal(await visible(page,'reward-overlay'),false);
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
