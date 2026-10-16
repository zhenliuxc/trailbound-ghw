// Native Chromium audio graph and waveform QA. No claim of listening or physical-phone QA.
const assert=require('node:assert/strict'),fs=require('node:fs/promises'),path=require('node:path');
const {chromium}=require(process.env.TRAILBOUND_PLAYWRIGHT_MODULE||'playwright'),D=require('../dist/discoveries.js');
const base=process.env.TRAILBOUND_TEST_URL||'http://127.0.0.1:4173/',out=process.env.TRAILBOUND_REVIEW_DIR||'/tmp/trailbound-scene-audio-browser';
assert.ok(/^http:\/\/(localhost|127\.0\.0\.1):\d+\/$/.test(base));
const routes=['wugong','tiger','aotai','maclehose','changping','mogan','westlake'],entries=D.CATALOG.filter(item=>item.edition===3).map(({id,route,interaction,play,icon})=>({id,route,interaction,play,icon}));
let browser,phase='starting';const timer=setTimeout(()=>{console.error('Audio QA timeout:',phase);browser?.close().finally(()=>process.exit(1));},180000);timer.unref();
setInterval(()=>console.log('Audio QA:',phase),15000).unref();
async function level(page){
 const values=[];for(let i=0;i<4;i++){values.push(await page.evaluate(()=>{const data=new Float32Array(qaContexts[0].qaMeter.fftSize);qaContexts[0].qaMeter.getFloatTimeDomainData(data);return {rms:Math.sqrt(data.reduce((n,v)=>n+v*v,0)/data.length),peak:Math.max(...data.map(Math.abs))};}));await page.waitForTimeout(65);}
 return {rms:values.reduce((sum,x)=>sum+x.rms,0)/values.length,peak:Math.max(...values.map(x=>x.peak))};
}
(async()=>{
 await fs.mkdir(out,{recursive:true});browser=await chromium.launch({executablePath:process.env.TRAILBOUND_CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--use-angle=swiftshader','--enable-unsafe-swiftshader']});const results=[];
 for(const [label,viewport]of [['desktop',{width:1280,height:900}],['phone',{width:390,height:844}]]){
  phase=label+' setup';const page=await browser.newPage({viewport,isMobile:label==='phone',hasTouch:label==='phone'}),errors=[],failed=[];page.on('pageerror',e=>errors.push(String(e)));page.on('requestfailed',r=>failed.push(r.url()));
  await page.route(base+'__scene_audio__.html',route=>route.fulfill({contentType:'text/html',body:'<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body><button id="enable">开启声音</button><script src="audio-scenes.js"></script><script src="audio.js"></script></body></html>'}));
  await page.goto(base+'__scene_audio__.html');await page.evaluate(()=>{
   window.qaContexts=[];window.qaRequests=[];
   class MeterContext extends window.AudioContext{constructor(){super();this.qaMeter=this.createAnalyser();this.qaMeter.fftSize=4096;this.qaMeter.connect(super.destination);qaContexts.push(this);}get destination(){return this.qaMeter||super.destination;}}
   window.qaPlayer=TrailAudio.create({AudioContext:MeterContext,navigator,fetch:(...args)=>{qaRequests.push(args[0]);return fetch(...args);}});
   document.getElementById('enable').onclick=async()=>{await qaPlayer.enable();qaPlayer.setScene({routeId:'wugong',mode:'walk'});};
  });assert.equal(await page.evaluate(()=>qaContexts.length),0);assert.equal(await page.evaluate(()=>qaRequests.length),0);await page.locator('#enable').click();await page.waitForFunction(()=>qaPlayer.playing);
  const routeLevels=[];
  for(const routeId of routes){phase=label+' '+routeId;await page.evaluate(routeId=>qaPlayer.setScene({routeId,mode:'walk',weather:routeId==='aotai'?'snow':'clear',progress:.3}),routeId);await page.waitForTimeout(1000);const sound=await level(page);assert.ok(sound.rms>0.000002,routeId+' must produce non-silent audio');assert.ok(sound.peak<.98,routeId+' must leave output headroom');routeLevels.push({routeId,...sound});}
  for(const item of entries){phase=label+' '+item.id;const result=await page.evaluate(item=>{
   const game=TrailAudioScenes.MOMENTS[item.id]?.game;qaPlayer.setScene({routeId:item.route,mode:'moment',momentId:item.id,momentGame:game});
   const events={wind:'tug',clouds:'cloud-clear',puzzle:'piece-lock',greet:'shutter',creek:'ripple',rain:'catch',match:'card-clear',sling:'sling-release'};
   const responded=game?qaPlayer.mini(game,events[game],{x:.6,index:1}):qaPlayer.interact(item.interaction,{x:.6,playType:item.play,icon:item.icon});
   return {responded,key:qaPlayer.key,voices:qaPlayer.voiceCount};
  },item);assert.equal(result.responded,true,item.id+' must respond audibly');assert.ok(result.voices<=130);await page.waitForTimeout(120);}
  const requests=await page.evaluate(()=>qaRequests);assert.equal(requests.length,new Set(requests).size,'decoded assets are reused');assert.ok(requests.length<=6);
  await page.evaluate(()=>qaPlayer.hide());await page.waitForFunction(()=>qaContexts[0].state==='suspended');assert.equal(await page.evaluate(()=>qaPlayer.voiceCount),0);
  const hidden=await page.evaluate(()=>qaPlayer.mini('rain','catch'));assert.equal(hidden,false);await page.evaluate(()=>qaPlayer.destroy());assert.equal(await page.evaluate(()=>qaContexts[0].state),'closed');assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);
  results.push({viewport:label,routeLevels,artworkScenes:entries.length,assetRequests:requests.length,pageErrors:errors,failedRequests:failed,backgroundStopsVoices:true,disabledEventsStaySilent:true,listeningNotPerformed:true,physicalPhoneNotTested:true});await page.close();
 }
 await browser.close();browser=null;await fs.writeFile(path.join(out,'results.json'),JSON.stringify(results,null,2));console.log(JSON.stringify({passed:true,results},null,2));
})().catch(async error=>{console.error(error);if(browser)await browser.close();process.exitCode=1;});
