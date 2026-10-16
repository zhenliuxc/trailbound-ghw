// Native Web Audio state checks, not a listening test or a physical-phone autoplay test.
const assert=require('node:assert/strict');
const {chromium}=require(process.env.TRAILBOUND_PLAYWRIGHT_MODULE||'playwright');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.TRAILBOUND_CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
 try{
  const page=await browser.newPage();await page.addInitScript(()=>{const Native=window.AudioContext;window.__qaAudio=[];if(Native)window.AudioContext=class extends Native{constructor(...args){super(...args);window.__qaAudio.push(this);}};});
  await page.goto('http://127.0.0.1:4173/',{waitUntil:'networkidle'});await page.locator('#sound-toggle').click();await page.waitForFunction(()=>document.getElementById('sound-toggle').getAttribute('aria-pressed')==='true');assert.equal(await page.evaluate(()=>__qaAudio.length),1);assert.equal(await page.evaluate(()=>__qaAudio[0].state),'running');console.log('Explicit enable: passed');
  await page.locator('#overlay-action').click();await page.waitForTimeout(200);await page.evaluate(()=>window.dispatchEvent(new Event('blur')));await page.waitForFunction(()=>__qaAudio[0].state==='suspended');console.log('Background suspension: passed');
  await page.evaluate(()=>window.dispatchEvent(new Event('focus')));await page.waitForTimeout(600);assert.equal(await page.evaluate(()=>__qaAudio[0].state),'suspended');console.log('Foreground keeps the paused walk silent: passed');
  await page.locator('#walk-toggle').click();await page.waitForFunction(()=>__qaAudio[0].state==='running');console.log('Explicit walking resume restores audio: passed');
  await page.locator('#sound-toggle').click();await page.waitForFunction(()=>__qaAudio[0].state==='suspended');assert.equal(await page.locator('#sound-toggle').getAttribute('aria-pressed'),'false');console.log(JSON.stringify({passed:true,explicitEnable:true,backgroundSuspension:true,pausedWalkRemainsSilent:true,explicitResume:true,mute:true,listeningNotPerformed:true}));
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
