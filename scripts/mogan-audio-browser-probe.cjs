// Observe the native browser graph; this does not assess listening quality.
const assert=require('node:assert/strict'),native=require('./audio-browser-probe.cjs');
const records=new WeakMap(),themes={rain:'wugong-cirrus-loop-v1.mp3',footsteps:'wugong-reverie-v1.mp3',sling:'wugong-childhood-loop-v1.mp3'};
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function paused(page){for(let i=0;i<100;i++){const s=await native.snapshot(page);if(s.contexts[0]==='suspended'&&s.media.every(m=>m.paused))return;await page.clock.fastForward(40);await wait(50);}throw Error('Native Mogan audio did not pause');}
async function setup(page){records.set(page,{games:[],offset:0,background:false,mute:false});await native.setup(page,{failFirstTheme:false});}
async function walking(page){await native.theme(page,'wugong-a-kind-of-hope-loop-v1.mp3');}
async function beforeGame(page,game,label,click){
 const r=records.get(page),file=themes[game];let m=await native.theme(page,file);
 await page.evaluate(file=>{const m=__qaNative.media.find(m=>(m.currentSrc||m.src).endsWith(file));m.currentTime=m.duration-.3;},file);
 await wait(900);m=await native.theme(page,file);assert.ok(m.time<5,'Native theme must loop at its endpoint');
 if(game==='footsteps'){
  await page.evaluate(()=>window.dispatchEvent(new Event('blur')));await paused(page);
  const before=(await native.snapshot(page)).media.map(m=>m.time);await wait(250);
  assert.ok((await native.snapshot(page)).media.every((m,i)=>Math.abs(m.time-before[i])<.03));r.background=true;
  await page.evaluate(()=>window.dispatchEvent(new Event('focus')));await native.theme(page,file);
  await click(page,'mini-sound');await page.clock.fastForward(650);await paused(page);assert.equal(await page.locator('#mini-sound').getAttribute('aria-pressed'),'false');
  await click(page,'mini-sound');await native.theme(page,file);r.mute=true;
 }
 r.offset=(await native.snapshot(page)).starts.length;r.games.push({game,file,viewport:label,nativeDecodeAndSignal:true,nativeLoop:true});
}
async function reward(page,game){
 const r=records.get(page),m=await native.theme(page,themes[game]),s=await native.snapshot(page),files=s.starts.slice(r.offset).filter(x=>!x.loop).map(x=>x.file.split('/').pop());
 // Pointer pulling should emit recorded line, release and landing samples.
 const expected=game==='rain'?['mini-drop-v1.mp3','mini-splash-v1.mp3']:game==='sling'?['wugong-line-v1.mp3','wugong-flutter-v1.mp3','wugong-cloth-v1.mp3']:[];
 for(const file of expected)assert.ok(files.includes(file),game+' must start recorded '+file+'; got '+files.join(','));
 if(game==='footsteps')assert.ok(files.some(f=>/^wugong-step-[123]-v1\.mp3$/.test(f)),'Timed landings must start recorded steps');
 assert.equal(s.media.filter(m=>m.file===themes[game]).length,1,'Reward reuses the same media element');
 Object.assign(r.games.at(-1),{sampledCues:[...new Set(files)],signalRms:m.rms,rewardKeepsTheme:true});
}
async function collected(page){const r=records.get(page),s=await native.snapshot(page);assert.ok(s.starts.slice(r.offset).some(x=>x.file.endsWith('wugong-place-v1.mp3')));r.games.at(-1).collectSample=true;}
async function finish(page,label,click){
 const r=records.get(page),s=await native.snapshot(page);assert.equal(s.media.length,4);assert.ok(s.maxPlaying<=2);
 if(await page.locator('#sound-toggle').getAttribute('aria-pressed')==='true')await click(page,'sound-toggle');await page.clock.fastForward(650);await paused(page);
 return {viewport:label,games:r.games,cachedThemes:s.media.length,maxPlaying:s.maxPlaying,backgroundSimulation:r.background,inGameMute:r.mute,finalMute:true,listeningNotPerformed:true,physicalPhoneNotTested:true};
}
module.exports={setup,enabled:native.enabled,walking,beforeGame,reward,collected,finish};
