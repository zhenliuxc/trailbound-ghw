// Observe native Chromium media/Web Audio while the existing Wugong UI driver plays.
// This measures decode/output/lifecycle, not listening quality or physical hardware.
const assert=require('node:assert/strict');
const records=new WeakMap();
const themes={wind:'wugong-childhood-loop-v1.mp3',clouds:'wugong-cirrus-loop-v1.mp3',greet:'wugong-a-kind-of-hope-loop-v1.mp3',puzzle:'wugong-reverie-v1.mp3'};
const cues={wind:['wugong-line-v1.mp3','wugong-flutter-v1.mp3'],clouds:['wugong-cloth-v1.mp3'],greet:['wugong-click-v1.mp3'],puzzle:['wugong-turn-v1.mp3','wugong-place-v1.mp3']};
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function poll(page,fn,description){for(let i=0;i<160;i++){const value=await fn();if(value)return value;await page.clock.fastForward(30);await wait(75);}throw Error('Native audio timeout: '+description+' '+JSON.stringify(await snapshot(page)));}
async function snapshot(page){return page.evaluate(()=>window.__qaNative.snapshot());}
async function setup(page){
 records.set(page,{expected:new WeakSet(),failures:[],games:[],seen:new Set(),offset:0,background:false,mute:false});
 await page.route('**/audio/wugong-childhood-loop-v1.mp3',async route=>{const r=records.get(page);r.expected.add(route.request());r.failures.push('intentional first-theme request failure');await route.abort('failed');});
 await page.addInitScript(()=>{
  const media=[],streams=[],contexts=[],starts=[],requests=[],decoded=new WeakMap(),arrays=new WeakMap();let maxPlaying=0;
  const update=()=>{maxPlaying=Math.max(maxPlaying,media.filter(m=>!m.paused&&m.readyState>=2).length);};
  const NativeAudio=window.Audio;window.Audio=new Proxy(NativeAudio,{construct(Target,args){const m=Reflect.construct(Target,args);media.push(m);for(const event of ['playing','pause','emptied'])m.addEventListener(event,update);return m;}});
  const nativeFetch=window.fetch.bind(window);window.fetch=async(...args)=>{const response=await nativeFetch(...args),url=String(args[0]);if(url.includes('audio/')){requests.push(url);const original=response.arrayBuffer.bind(response);response.arrayBuffer=async()=>{const data=await original();arrays.set(data,url);return data;};}return response;};
  const NativeContext=window.AudioContext;
  window.AudioContext=class extends NativeContext{
   constructor(...args){super(...args);contexts.push(this);}
   decodeAudioData(data,...args){return super.decodeAudioData(data,...args).then(buffer=>{decoded.set(buffer,arrays.get(data)||'');return buffer;});}
   createBufferSource(){const source=super.createBufferSource(),start=source.start.bind(source);source.start=(...args)=>{if(decoded.has(source.buffer))starts.push({file:decoded.get(source.buffer),loop:source.loop,at:this.currentTime});return start(...args);};return source;}
   createMediaElementSource(m){const source=super.createMediaElementSource(m),meter=super.createAnalyser();meter.fftSize=256;source.connect(meter);const entry={media:m,meter,volume:null};streams.push(entry);const connect=source.connect.bind(source);source.connect=(node,...args)=>{if(node instanceof GainNode)entry.volume=node;return connect(node,...args);};return source;}
  };
  window.__qaNative={snapshot(){return {contexts:contexts.map(c=>c.state),requests:requests.slice(),starts:starts.slice(),maxPlaying,media:streams.map(s=>{const d=new Float32Array(s.meter.fftSize);s.meter.getFloatTimeDomainData(d);return {file:(s.media.currentSrc||s.media.src||'').split('/').pop(),paused:s.media.paused,ready:s.media.readyState,time:s.media.currentTime,duration:s.media.duration,gain:s.volume?.gain.value||0,rms:Math.sqrt(d.reduce((sum,x)=>sum+x*x,0)/d.length)};})};},media};
 });
}
function expectedFailure(page,request){return records.get(page)?.expected.has(request)||false;}
async function enabled(page,click){
 assert.equal((await snapshot(page)).media.length,0);assert.equal((await snapshot(page)).requests.length,0);
 await click(page,'sound-toggle');await poll(page,async()=>await page.locator('#sound-toggle').getAttribute('aria-pressed')==='true','explicit sound enable');
 assert.deepEqual((await snapshot(page)).contexts,['running']);assert.equal((await snapshot(page)).media.length,0,'Ready screen must not prefetch themes');
}
async function theme(page,file){return poll(page,async()=>{const s=await snapshot(page),m=s.media.find(m=>m.file===file&&!m.paused&&m.ready>=2&&m.gain>.005&&m.rms>1e-5);return m||false;},file+' decoded and produces a non-zero signal');}
async function walking(page){await theme(page,themes.puzzle);}
async function beforeGame(page,game,label,click){
 const r=records.get(page);
 if(game==='wind'){
  await poll(page,()=>page.locator('#mini-music-retry').isVisible(),'visible failed-music retry');
  assert.equal(await page.locator('#mini-sound').getAttribute('aria-pressed'),'true','Music failure must not mute effects');
  await page.unroute('**/audio/wugong-childhood-loop-v1.mp3');await click(page,'mini-music-retry');
 }
 let m=await theme(page,themes[game]);
 if(!r.seen.has(themes[game])){
  r.seen.add(themes[game]);await page.evaluate(file=>{const m=__qaNative.media.find(m=>(m.currentSrc||m.src).endsWith(file));m.currentTime=m.duration-.3;},themes[game]);
  await wait(900);m=await theme(page,themes[game]);assert.ok(m.time<5,'Native media must loop at its real endpoint');
 }
 if(game==='clouds'){
  await page.evaluate(()=>window.dispatchEvent(new Event('blur')));await poll(page,async()=>{const s=await snapshot(page);return s.contexts[0]==='suspended'&&s.media.every(m=>m.paused);},'background suspends every cached theme');
  const paused=(await snapshot(page)).media.map(m=>m.time);await wait(250);const after=(await snapshot(page)).media.map(m=>m.time);assert.ok(after.every((n,i)=>Math.abs(n-paused[i])<.03));r.background=true;
  await page.evaluate(()=>window.dispatchEvent(new Event('focus')));await theme(page,themes[game]);
  await click(page,'mini-sound');await page.clock.fastForward(650);await poll(page,async()=>{const s=await snapshot(page);return s.contexts[0]==='suspended'&&s.media.every(m=>m.paused);},'in-game mute pauses all themes');
  assert.equal(await page.locator('#mini-sound').getAttribute('aria-pressed'),'false');await click(page,'mini-sound');await theme(page,themes[game]);r.mute=true;
 }
 r.offset=(await snapshot(page)).starts.length;r.games.push({game,file:themes[game],nativeDecodeAndSignal:true,loop:true,viewport:label});
}
async function reward(page,game){
 const r=records.get(page),m=await theme(page,themes[game]),s=await snapshot(page),started=s.starts.slice(r.offset).filter(x=>!x.loop).map(x=>x.file.split('/').pop());
 for(const file of cues[game])assert.ok(started.includes(file),game+' must emit native sampled '+file+'; got '+started.join(','));
 assert.equal(s.media.filter(x=>x.file===themes[game]).length,1,'Reward reuses its game media element');
 r.games.at(-1).rewardKeepsTheme=true;r.games.at(-1).sampledCues=[...new Set(started)];r.games.at(-1).signalRms=m.rms;
}
async function collected(page,game){
 const r=records.get(page),s=await snapshot(page);assert.ok(s.starts.slice(r.offset).some(x=>x.file.endsWith('wugong-place-v1.mp3')),'Collect should play the recorded placement');r.games.at(-1).collectSample=true;
}
async function finish(page,label,click){
 const r=records.get(page),s=await snapshot(page);assert.ok(s.maxPlaying<=2,'At most current/outgoing streams play');assert.equal(s.media.length,4,'Four themes created lazily and reused');
 if(await page.locator('#sound-toggle').getAttribute('aria-pressed')==='true')await click(page,'sound-toggle');await page.clock.fastForward(650);
 await poll(page,async()=>{const t=await snapshot(page);return t.contexts[0]==='suspended'&&t.media.every(m=>m.paused);},'final mute');
 return {viewport:label,games:r.games,maxPlaying:s.maxPlaying,cachedThemes:s.media.length,initialMusicRequestFailed:r.failures.length>0,retryRecovered:true,backgroundSimulation:r.background,inGameMute:r.mute,finalMute:true,listeningNotPerformed:true,physicalPhoneNotTested:true};
}
module.exports={setup,expectedFailure,enabled,walking,beforeGame,reward,collected,finish};
