// Local Chromium scene-lifecycle QA. Emulated phone size is not a physical phone.
const assert=require('node:assert/strict'),fs=require('node:fs/promises'),path=require('node:path');
const {chromium}=require(process.env.TRAILBOUND_PLAYWRIGHT_MODULE||'playwright');
const base=process.env.TRAILBOUND_TEST_URL||'http://127.0.0.1:4173/';
const out=process.env.TRAILBOUND_REVIEW_DIR||'/tmp/trailbound-runtime-browser';
assert.match(base,/^http:\/\/(127\.0\.0\.1|localhost):\d+\/$/);
let browser,phase='launch';
const deadline=setTimeout(()=>{console.error('Runtime browser timeout:',phase);browser?.close().finally(()=>process.exit(1));},180000);deadline.unref();
setInterval(()=>console.log('Runtime browser:',phase),15000).unref();
async function advance(page,ms){for(let left=ms;left>0;left-=200)await page.clock.fastForward(Math.min(200,left));}
async function click(page,selector){
 const target=page.locator(selector).first();await target.evaluate(el=>el.scrollIntoView({block:'nearest',behavior:'instant'}));
 const box=await target.boundingBox();assert.ok(box&&box.width&&box.height,selector+' must be visible');
 const x=box.x+box.width/2,y=box.y+box.height/2;
 assert.equal(await target.evaluate((el,{x,y})=>el.contains(document.elementFromPoint(x,y)),{x,y}),true,selector+' must be reachable');
 await page.mouse.click(x,y);await advance(page,60);
}
async function shown(page,id){return page.locator('#'+id).isVisible();}
async function rainGesture(page){
 await page.locator('#micro-surface').evaluate(el=>el.scrollIntoView({block:'nearest',behavior:'instant'}));
 const box=await page.locator('#micro-surface').boundingBox();
 const a={x:box.x+box.width*.25,y:box.y+box.height*.75},b={x:box.x+box.width*.70,y:a.y};
 if(await page.evaluate(()=>navigator.maxTouchPoints>0)){
  const session=await page.context().newCDPSession(page);
  await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...a,id:1}]});
  await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{...b,id:1}]});
  await advance(page,200);await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await session.detach();
 }else{await page.mouse.move(a.x,a.y);await page.mouse.down();await page.mouse.move(b.x,b.y,{steps:4});await advance(page,200);await page.mouse.up();}
}
(async()=>{
 await fs.mkdir(out,{recursive:true});
 browser=await chromium.launch({executablePath:process.env.TRAILBOUND_CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const results=[];
 for(const [label,viewport]of [['desktop',{width:1280,height:900}],['phone',{width:390,height:844}]]){
  phase=label+' load';
  const page=await browser.newPage({viewport,deviceScaleFactor:1,isMobile:label==='phone',hasTouch:label==='phone',reducedMotion:label==='phone'?'reduce':'no-preference'}),errors=[],failed=[];
  page.on('pageerror',error=>errors.push(String(error)));page.on('requestfailed',request=>failed.push({url:request.url(),error:request.failure()?.errorText}));
  await page.clock.install({time:new Date('2026-10-16T07:00:00Z')});await page.clock.pauseAt(new Date('2026-10-16T07:00:01Z'));
  await page.addInitScript(()=>{
   const request=window.requestAnimationFrame.bind(window),cancel=window.cancelAnimationFrame.bind(window);
   const qa=window.__qaRuntime={pending:new Set(),other:new Map(),fired:0};
   window.requestAnimationFrame=callback=>{
    const stack=new Error().stack||'';
    // Track the injected FrameLoop request adapter, rather than Pixi's independent system ticker.
    const runtime=/at Object\.request \(http:\/\/[^\n]+\/app\.js:/.test(stack)&&stack.includes('/runtime.js:');
    let id=request(time=>{qa.pending.delete(id);qa.other.delete(id);if(runtime)qa.fired++;callback(time);});
    if(runtime)qa.pending.add(id);else qa.other.set(id,{callback:String(callback).slice(0,140),stack});return id;
   };
   window.cancelAnimationFrame=id=>{qa.pending.delete(id);qa.other.delete(id);cancel(id);};
  });
  await page.goto(base,{waitUntil:'networkidle'});
  // A local reader fixture, not a forced gameplay reward. Production storage is never accessed.
  await page.evaluate(()=>{
   const e=TrailDiscoveries.item('bamboo-drop');
   const moment={key:'runtime-reader-fixture',id:e.id,route:e.route,edition:3,earned:true,artVersion:4,tag:e.tag,title:e.tag,place:e.place,memory:'本地测试：保留首次记录的竹雨回忆。',createdAt:1,elapsed:1,progress:.1,icon:e.icon};
   localStorage.setItem(TrailDiscoveries.KEY,JSON.stringify({version:2,moments:[moment]}));
  });
  await page.reload({waitUntil:'networkidle'});await advance(page,200);const saved=await page.evaluate(()=>localStorage.getItem(TrailDiscoveries.KEY));
  phase=label+' journal over walk';await click(page,'#overlay-action');await advance(page,1200);
  assert.equal(await page.evaluate(()=>__qaRuntime.pending.size),1,'the probe must see the running journey clock');
  const walkProgress=await page.locator('#journey-progress').getAttribute('aria-valuenow');
  await click(page,'#journal-list button');assert.equal(await shown(page,'journal-detail'),true);await advance(page,3000);
  assert.equal(await page.locator('#journey-progress').getAttribute('aria-valuenow'),walkProgress);assert.equal(await page.evaluate(()=>__qaRuntime.pending.size),0);
  console.log(JSON.stringify({phase,nonJourneyFrames:await page.evaluate(()=>[...__qaRuntime.other.values()])}));
  await page.screenshot({path:path.join(out,label+'-journal.png'),animations:'disabled'});
  await click(page,'#journal-detail-close');await advance(page,1500);assert.notEqual(await page.locator('#journey-progress').getAttribute('aria-valuenow'),walkProgress);
  phase=label+' background return';await click(page,'#journal-list button');
  await page.evaluate(()=>{window.dispatchEvent(new Event('blur'));window.dispatchEvent(new Event('focus'));});
  await click(page,'#journal-detail-close');await advance(page,1600);assert.equal(await page.locator('#journey-state').innerText(),'停下来看看');assert.equal(await page.evaluate(()=>__qaRuntime.pending.size),0);
  phase=label+' rain open';await click(page,'#route-mogan');await click(page,'#overlay-action');await advance(page,10000);assert.equal(await shown(page,'observe-button'),true);
  await click(page,'#observe-button');assert.equal(await page.locator('#micro-panel').getAttribute('data-game'),'rain');
  await page.waitForFunction(()=>!!document.querySelector('#micro-surface canvas'));await page.waitForTimeout(180);await rainGesture(page);
  const journeyProgress=await page.locator('#journey-progress').getAttribute('aria-valuenow'),gameProgress=await page.locator('#micro-progress').getAttribute('aria-valuenow');assert.notEqual(gameProgress,'100');
  // The current game panel covers this wall entry. Exercise the native dialog/state
  // contract through DOM activation; this is not a claim that an in-game reader button exists.
  phase=label+' journal over minigame';await page.locator('#journal-list button').first().evaluate(el=>el.click());await advance(page,60);const frozen=await page.locator('#micro-progress').getAttribute('aria-valuenow');await advance(page,3000);
  assert.equal(await page.locator('#micro-progress').getAttribute('aria-valuenow'),frozen);assert.equal(await page.evaluate(()=>__qaRuntime.pending.size),0);
  await click(page,'#journal-detail-close');const fired=await page.evaluate(()=>__qaRuntime.fired);await advance(page,600);
  assert.equal(await shown(page,'micro-panel'),true);assert.ok(await page.evaluate(()=>__qaRuntime.fired)>fired);assert.equal(await page.locator('#journey-progress').getAttribute('aria-valuenow'),journeyProgress);
  phase=label+' retry/skip';await click(page,'#mini-retry');assert.equal(await page.locator('#micro-progress').getAttribute('aria-valuenow'),'0');assert.equal(await page.locator('#micro-surface canvas').count(),1);
  await page.screenshot({path:path.join(out,label+'-rain.png'),animations:'disabled'});
  await click(page,'#micro-skip');assert.equal(await shown(page,'reward-overlay'),false);assert.equal(await page.locator('#micro-surface canvas').count(),0);
  assert.equal(await page.evaluate(()=>localStorage.getItem(TrailDiscoveries.KEY)),saved,'reader, partial play and retry never rewrite the saved memory');
  phase=label+' escape and route cleanup';await click(page,'#observe-button');await page.waitForFunction(()=>!!document.querySelector('#micro-surface canvas'));await page.keyboard.press('Escape');await advance(page,60);await click(page,'#route-tiger');
  assert.equal(await shown(page,'micro-panel'),false);assert.equal(await page.locator('#micro-surface canvas').count(),0);assert.equal(await page.evaluate(()=>__qaRuntime.pending.size),0);
  assert.equal(await page.evaluate(()=>localStorage.getItem(TrailDiscoveries.KEY)),saved);assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);
  results.push({viewport:label,journalPausesWalk:true,journalReturnsToWalk:true,backgroundKeepsWalkPaused:true,journalPausesAndReturnsToRain:true,nestedJournalEntry:'programmatic DOM activation; current game panel covers the wall entry',oneFrameClock:true,retryReusesCanvas:true,partialExitNoReward:true,escapeAndRouteChangeCleanCanvas:true,originalStorageUnchanged:true,pageErrors:errors,failedRequests:failed,phoneIsEmulated:label==='phone',renderer:'Chromium WebGL via SwiftShader'});await page.close();
 }
 await browser.close();browser=null;await fs.writeFile(path.join(out,'results.json'),JSON.stringify(results,null,2));console.log(JSON.stringify({passed:true,results},null,2));
})().catch(async error=>{console.error('Runtime browser failed at',phase);console.error(error);if(browser)await browser.close();process.exitCode=1;});
