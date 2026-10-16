// Models media promises and audio routing, not browser autoplay or audible quality.
const test=require('node:test'),assert=require('node:assert/strict');
const {createMusicLayer,WUGONG_MUSIC,WUGONG_THEMES,musicTrack}=require('../dist/runtime.js');
const {fixture}=require('./audio-fixture.cjs');
const flush=async()=>{for(let i=0;i<12;i++)await Promise.resolve();};
const walk={routeId:'wugong',mode:'walk',weather:'clear'};

function musicFixture(hooks=[]){
 const f=fixture(),context=new f.AudioContext(),streams=[],elements=[];
 context.createMediaElementSource=media=>{const node=context.createGain();node.media=media;streams.push(node);return node;};
 function createMedia(){
  const listeners=new Map(),attributes=new Map();
  const media={paused:true,currentTime:0,error:null,plays:0,pauses:0,loads:0,src:'',hook:hooks[elements.length]||null,
   addEventListener(type,fn){if(!listeners.has(type))listeners.set(type,new Set());listeners.get(type).add(fn);},
   removeEventListener(type,fn){listeners.get(type)?.delete(fn);},
   emit(type){for(const fn of listeners.get(type)||[])fn({type});},
   setAttribute(name,value){attributes.set(name,value);},removeAttribute(name){attributes.delete(name);if(name==='src')this.src='';},
   play(){this.plays++;this.paused=false;return Promise.resolve(this.hook?.()).then(()=>this.emit('playing'));},
   pause(){this.pauses++;this.paused=true;},load(){this.loads++;this.error=null;},
  };
  elements.push(media);return media;
 }
 const layer=createMusicLayer({context,destination:context.destination,timers:f.timers,createMedia});
 return {...f,context,streams,elements,layer};
}

test('music is lazy and a game keeps its theme through its reward without restarting',async()=>{
 const f=musicFixture(),m=f.layer;
 m.sync({routeId:'mogan',mode:'walk'});m.sync({routeId:'wugong',mode:'silent'});
 assert.equal(f.elements.length,0);
 m.resume(walk);await flush();
 const media=f.elements[0];media.currentTime=44;
 for(const scene of [{...walk,mode:'moment',momentGame:'puzzle'},{...walk,mode:'reward',momentGame:'puzzle'},{...walk,mode:'photo'}])m.sync(scene);
 for(let i=0;i<100;i++)m.sync({...walk,mode:'photo'});
 assert.equal(f.elements.length,1);assert.equal(f.streams.length,1);assert.equal(media.plays,1);assert.equal(media.currentTime,44);
 assert.equal(media.src,WUGONG_MUSIC.file);assert.equal(media.loop,true);assert.equal(m.state,'playing');m.destroy();
});

test('four game themes are distinct, cached on demand and retained through the matching reward',async()=>{
 const f=musicFixture(),m=f.layer;
 for(const game of ['wind','clouds','greet','puzzle']){
  const scene={...walk,mode:'moment',momentGame:game};m.sync(scene);await flush();f.flushTimers();
  const media=f.elements.find(item=>item.src===WUGONG_THEMES[game].file);assert.ok(media);media.currentTime=17;
  m.sync({...scene,mode:'reward'});assert.equal(media.currentTime,17);assert.equal(media.plays,1);
  assert.equal(f.elements.filter(item=>!item.paused).length,1);
 }
 assert.equal(f.elements.length,4);assert.equal(new Set(f.elements.map(item=>item.src)).size,4);
 m.sync({...walk,mode:'moment',momentId:'meadow-bird'});await flush();f.flushTimers();assert.equal(f.elements.length,4);
 assert.equal(m.track.id,WUGONG_THEMES.wind.id);assert.equal(musicTrack({routeId:'westlake',mode:'moment',momentGame:'wind'}),null);m.destroy();
});

test('a rapid theme change cancels a pending stream and prevents late overlapping music',async()=>{
 let releaseWind;const f=musicFixture([null,()=>new Promise(resolve=>{releaseWind=resolve;})]),m=f.layer;
 m.resume(walk);await flush();m.sync({...walk,mode:'moment',momentGame:'wind'});m.sync({...walk,mode:'moment',momentGame:'clouds'});
 await flush();f.flushTimers();releaseWind();await flush();
 assert.equal(m.track.id,WUGONG_THEMES.clouds.id);assert.equal(f.elements[1].paused,true);assert.equal(f.elements.filter(item=>!item.paused).length,1);
 m.pause(true);assert.ok(f.elements.every(item=>item.paused));m.destroy();
});

test('a retired fade timer cannot stop resumed music, and pauses retain the song position',async()=>{
 const f=musicFixture(),m=f.layer;m.resume(walk);await flush();
 const media=f.elements[0];media.currentTime=82;m.sync({...walk,mode:'silent'});
 assert.equal(m.playing,false);assert.equal(f.timerCount(),1);
 m.sync(walk);f.flushTimers();await flush();
 assert.equal(media.paused,false);assert.equal(media.currentTime,82);assert.equal(media.plays,1);
 m.sync({routeId:'tiger',mode:'walk'});f.flushTimers();assert.equal(media.paused,true);
 m.sync(walk);await flush();assert.equal(media.plays,2);assert.equal(media.currentTime,82);m.destroy();
});

test('late playback completion after hide or destroy cannot restart music and destroy releases media',async()=>{
 const f=musicFixture(),m=f.layer;let release;
 m.sync(walk);await flush();m.pause(true);
 const media=f.elements[0];media.hook=()=>new Promise(resolve=>{release=resolve;});
 m.resume(walk);m.pause(true);release();await flush();assert.equal(media.paused,true);assert.equal(m.playing,false);
 m.resume(walk);m.destroy();release();await flush();
 assert.equal(media.paused,true);assert.equal(media.src,'');assert.equal(f.streams[0].disconnected,true);assert.equal(f.timerCount(),0);
});

test('a music error waits for explicit retry, including after pausing or changing scene',async()=>{
 const f=musicFixture(),m=f.layer;m.resume(walk);await flush();
 const media=f.elements[0];media.error={code:2};media.emit('error');assert.equal(m.state,'error');
 m.sync({...walk,mode:'silent'});f.flushTimers();
 for(let i=0;i<100;i++)m.sync({...walk,mode:'moment',momentGame:'puzzle'});
 assert.equal(media.plays,1);assert.equal(m.state,'error');
 m.sync({...walk,mode:'moment',momentGame:'clouds'});await flush();assert.equal(m.state,'playing');
 m.sync(walk);assert.equal(m.state,'error');assert.equal(media.plays,1);
 m.resume(walk);await flush();assert.equal(media.loads,1);assert.equal(media.plays,2);assert.equal(m.state,'playing');m.destroy();
});

test('a stale rejected play cannot mark a newer successful gesture as failed',async()=>{
 const f=musicFixture(),m=f.layer;let rejectOld;
 m.resume(walk);await flush();const media=f.elements[0];m.pause(true);
 media.hook=()=>new Promise((_,reject)=>{rejectOld=reject;});m.resume(walk);m.pause(true);
 media.hook=null;m.resume(walk);await flush();rejectOld(Error('old request aborted'));await flush();
 assert.equal(m.state,'playing');assert.equal(media.paused,false);m.destroy();
});
