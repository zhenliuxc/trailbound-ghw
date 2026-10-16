// Optional browser QA: provide a local static server and Playwright, not a production URL.
// This checks Chromium with emulated viewports; it is not physical-phone or audio-listening QA.
const assert=require('node:assert/strict'),fs=require('node:fs/promises'),path=require('node:path');
const {chromium}=require(process.env.TRAILBOUND_PLAYWRIGHT_MODULE||'playwright');
const base=process.env.TRAILBOUND_TEST_URL||'http://127.0.0.1:4173/',out=process.env.TRAILBOUND_REVIEW_DIR||'/tmp/trailbound-wugong-browser';
const selected=(process.env.TRAILBOUND_TEST_GAMES||'wind,clouds,greet,puzzle').split(',');
assert.ok(selected.length&&selected.every(game=>['wind','clouds','greet','puzzle'].includes(game))&&new Set(selected).size===selected.length);
assert.ok(/^http:\/\/(127\.0\.0\.1|localhost):\d+\/$/.test(base),'Use an explicitly local QA server');
let browser,phase='starting';
const deadline=setTimeout(()=>{console.error('Browser QA timeout at',phase);browser?.close().finally(()=>process.exit(1));},360000);deadline.unref();
setInterval(()=>console.log('Browser QA:',phase),15000).unref();
async function advance(page,ms){for(let left=ms;left>0;left-=200)await page.clock.fastForward(Math.min(200,left));}
async function click(page,id){
 await page.locator('#'+id).evaluate(el=>el.scrollIntoView({block:'nearest',behavior:'instant'}));
 const b=await page.locator('#'+id).boundingBox();assert.ok(b&&b.width>0&&b.height>0,id+' must be visible');
 const clear=await page.evaluate(({id,x,y})=>{const hit=document.elementFromPoint(x,y);return hit===document.getElementById(id)||document.getElementById(id).contains(hit);},{id,x:b.x+b.width/2,y:b.y+b.height/2});assert.equal(clear,true,id+' must not be covered');
 await page.mouse.click(b.x+b.width/2,b.y+b.height/2);await advance(page,60);
}
async function visible(page,id){return page.locator('#'+id).isVisible();}
async function screenPoint(page,p){
 await page.locator('#micro-surface').evaluate(el=>el.scrollIntoView({block:'nearest',behavior:'instant'}));
 const b=await page.locator('#micro-surface').boundingBox();
 const q=await page.evaluate(({p,w,h})=>{const game=document.getElementById('micro-panel').dataset.game,H=800*h/w;if(game==='puzzle'){const b=TrailArtGames.bounds(H);return {x:(b.x+b.w*p.x)/800,y:(b.y+b.h*p.y)/H};}if(game==='clouds'||game==='greet'){const b=TrailWugongStories.bounds(H,game==='greet'?16/9:1.5);return {x:(b.x+b.w*p.x)/800,y:(b.y+b.h*p.y)/H};}return p;},{p,w:b.width,h:b.height});
 assert.ok(b.x+q.x*b.width>=0&&b.x+q.x*b.width<page.viewportSize().width);assert.ok(b.y+q.y*b.height>=0&&b.y+q.y*b.height<page.viewportSize().height);
 return {x:b.x+q.x*b.width,y:b.y+q.y*b.height};
}
async function point(page,p){
 const q=await screenPoint(page,p);if(await page.evaluate(()=>navigator.maxTouchPoints>0))await page.touchscreen.tap(q.x,q.y);else await page.mouse.click(q.x,q.y);await advance(page,40);
}
async function drag(page,from,to){
 const a=await screenPoint(page,from),b=await screenPoint(page,to),touch=await page.evaluate(()=>navigator.maxTouchPoints>0),session=touch?await page.context().newCDPSession(page):null;
 if(touch)await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...a,id:1}]});else{await page.mouse.move(a.x,a.y);await page.mouse.down();}
 for(let i=1;i<=12;i++){const p={x:a.x+(b.x-a.x)*i/12,y:a.y+(b.y-a.y)*i/12};if(touch)await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{...p,id:1}]});else await page.mouse.move(p.x,p.y);await advance(page,20);}
 if(touch){await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await session.detach();}else await page.mouse.up();await advance(page,80);
}
async function waitArt(page){
 for(let i=0;i<120;i++){await advance(page,40);await new Promise(r=>setTimeout(r,15));if(await page.evaluate(()=>document.getElementById('micro-surface').getAttribute('aria-busy')!=='true'&&!!document.querySelector('#micro-surface canvas[data-ready="true"]')))return;}
 throw Error('Artwork or GPU canvas was not ready: '+await page.locator('#micro-surface').getAttribute('aria-busy'));
}
async function play(page,game,label){
 phase=label+' wait artwork '+game;await waitArt(page);phase=label+' operate '+game;assert.equal(await page.locator('#micro-surface canvas[data-ready="true"]').count(),1);
 await page.screenshot({path:path.join(out,label+'-'+game+'.png'),animations:'disabled'});
 if(game==='wind'){
  const start=await page.evaluate(()=>performance.now());
  for(let i=0;i<160&&await visible(page,'micro-panel');i++){
   const p=await page.evaluate(start=>{const s=TrailMiniGames.create(TrailDiscoveries.item('meadow-bird'));s.travel=Number(document.getElementById('micro-progress').getAttribute('aria-valuenow'))/100;s.age=(performance.now()-start)/1000;s.actor.x=.24+s.travel*.37;return {x:.35,y:TrailMiniGames.windTarget(s)};},start);
   await point(page,p);await advance(page,560);if(i===10)await page.screenshot({path:path.join(out,label+'-wind-flight.png'),animations:'disabled'});
  }
 }else if(game==='clouds'){
  assert.equal(await visible(page,'wugong-tools'),false);const clouds=await page.evaluate(()=>TrailWugongStories.cloudSeeds);await point(page,{x:.02,y:.04});assert.equal(await page.locator('#micro-progress').getAttribute('aria-valuenow'),'0');await point(page,clouds[0]);await point(page,clouds[0]);assert.equal(await page.locator('#micro-progress').getAttribute('aria-valuenow'),'33');await drag(page,{x:.35,y:.46},{x:.95,y:.46});await advance(page,4400);
 }else if(game==='greet'){
  await click(page,'wugong-primary');await click(page,'wugong-primary');await point(page,{x:.55,y:.47});await click(page,'wugong-primary');assert.match(await page.locator('#wugong-primary').innerText(),/给她/);await page.screenshot({path:path.join(out,label+'-photograph.png'),animations:'disabled'});await click(page,'wugong-primary');await click(page,'wugong-primary');await advance(page,4800);
 }else if(game==='puzzle'){
  assert.equal(await page.locator('#art-actions button').count(),0);const first=await page.evaluate(()=>({from:TrailArtGames.trayPoint(0),to:TrailArtGames.slotPoint(3)}));await drag(page,first.from,first.to);assert.equal(await page.locator('#art-count').innerText(),'1 / 6 片');
  for(const i of [0,1,2,4,5]){await page.locator('#micro-surface').focus();await page.keyboard.press(String(i+1));await page.keyboard.press('q');await page.keyboard.press('e');await point(page,await page.evaluate(i=>TrailArtGames.slotPoint(i),i));}
  await advance(page,2900);
 }else throw Error('Unexpected Wugong game '+game);
 assert.equal(await visible(page,'micro-panel'),false,game+' must finish');assert.equal(await visible(page,'reward-overlay'),true,game+' must reveal earned painting');
 await page.screenshot({path:path.join(out,label+'-'+game+'-reward.png'),animations:'disabled'});await click(page,'reward-continue');await advance(page,1000);await new Promise(r=>setTimeout(r,850));await advance(page,80);assert.equal(await visible(page,'reward-overlay'),false);
}
(async()=>{
 await fs.mkdir(out,{recursive:true});phase='launch';browser=await chromium.launch({executablePath:process.env.TRAILBOUND_CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const results=[];
 for(const [label,viewport]of [['desktop',{width:1280,height:900}],['phone',{width:390,height:844}]]){
  phase=label+' create page';const page=await browser.newPage({viewport,deviceScaleFactor:1,isMobile:label==='phone',hasTouch:label==='phone',reducedMotion:label==='phone'?'reduce':'no-preference'}),errors=[],failed=[];page.on('pageerror',error=>errors.push(String(error)));page.on('requestfailed',request=>failed.push({url:request.url(),error:request.failure()?.errorText}));
  phase=label+' clock';await page.clock.install({time:new Date('2026-10-16T04:00:00Z')});await page.clock.pauseAt(new Date('2026-10-16T04:00:01Z'));phase=label+' load';await page.goto(base,{waitUntil:'networkidle'});await advance(page,200);phase=label+' start';await click(page,'overlay-action');const games=[];
  for(let turn=0;turn<500&&games.length<selected.length;turn++){phase=label+' route step '+turn;if(turn%20===0)console.log(JSON.stringify({phase,journey:await page.locator('#journey-state').innerText(),progress:await page.locator('#journey-progress').getAttribute('aria-valuenow')}));
   if(await visible(page,'micro-panel')){const game=await page.locator('#micro-panel').getAttribute('data-game');if(!selected.includes(game)){await click(page,'micro-skip');if(/继续/.test(await page.locator('#walk-toggle').innerText()))await click(page,'walk-toggle');await advance(page,5000);continue;}phase=label+' play '+game;console.log(phase);await play(page,game,label);games.push(game);}
   else if(await visible(page,'observe-button'))await click(page,'observe-button');
   else if(await visible(page,'photo-panel'))await click(page,'photo-continue');
   else if(await visible(page,'story-panel')){const button=page.locator('#story-choices button').first();await button.click({force:true});await advance(page,100);}
   else await advance(page,500);
  }
  assert.deepEqual(new Set(games),new Set(selected));assert.deepEqual(errors,[],'No uncaught page errors');assert.deepEqual(failed,[],'No failed requests');
  const journal=await page.evaluate(()=>TrailDiscoveries.loadMoments(localStorage).filter(m=>m.route==='wugong'&&m.earned));assert.equal(journal.length,selected.length);assert.equal(new Set(journal.map(m=>m.id)).size,selected.length);
  results.push({viewport:label,games,earned:journal.length,pageErrors:errors,failedRequests:failed,renderer:'Chromium WebGL via SwiftShader',reducedMotion:label==='phone'});await page.close();
 }
 await browser.close();browser=null;await fs.writeFile(path.join(out,'results.json'),JSON.stringify(results,null,2));console.log(JSON.stringify({passed:true,results,screenshots:out},null,2));
})().catch(async error=>{console.error(error);if(browser)await browser.close();process.exitCode=1;});
