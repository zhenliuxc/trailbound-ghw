(function(root,factory){const api=factory(typeof module==='object'&&module.exports?require('./audio-scenes.js'):root.TrailAudioScenes);if(typeof module==='object'&&module.exports)module.exports=api;else root.TrailAudio=api;}(typeof globalThis!=='undefined'?globalThis:this,function(Scene){
 'use strict';
 // Licensed recorded foley and a streamed Wugong score supplement the designed
 // soundscapes. Exact authors, sources and processing live in audio/*credits.json.
 const PROFILES={
  'wugong-meadow':{route:'wugong',title:'草叶间的晨光',instrument:'pluck',tempo:82,melody:[72,76,79,81,79,76,74,72],chord:[48,55,64],ambience:{kind:'grass',cutoff:1050,gain:.024},effect:'birds',space:.14},
  'wugong-clouds':{route:'wugong',title:'云海慢慢展开',instrument:'air',tempo:56,melody:[74,81,78,76,71,78,76,74],chord:[50,57,66],ambience:{kind:'wind',cutoff:390,gain:.027},effect:'breeze',space:.27},
  'wugong-golden':{route:'wugong',title:'金顶的一束光',instrument:'bell',tempo:72,melody:[79,84,86,88,91,88,86,84],chord:[48,55,67],ambience:{kind:'wind',cutoff:520,gain:.025},effect:'chimes',space:.21},
  'tiger-trail':{route:'tiger',title:'石径上的脚步',instrument:'wood',tempo:92,melody:[62,69,74,66,69,64,62,57],chord:[38,45,54],ambience:{kind:'river',cutoff:920,gain:.036},effect:'stone',space:.12},
  'tiger-gorge':{route:'tiger',title:'峡谷回应了江声',instrument:'air',tempo:52,melody:[60,67,74,76,72,67,64,60],chord:[36,43,55],ambience:{kind:'river',cutoff:1450,gain:.060},effect:'echo',space:.30},
  'tiger-halfway':{route:'tiger',title:'半途，歇一会儿',instrument:'pluck',tempo:88,melody:[67,71,74,69,67,74,71,67],chord:[43,50,59],ambience:{kind:'river',cutoff:670,gain:.023},effect:'wood',space:.16},
  'aotai-aoshan':{route:'aotai',title:'鳌山风中的低钟',instrument:'wood',tempo:62,melody:[57,64,69,60,64,62,60,57],chord:[33,40,52],ambience:{kind:'wind',cutoff:310,gain:.030},effect:'lowbell',space:.23},
  'aotai-ridge':{route:'aotai',title:'雪粒与远山',instrument:'bell',tempo:58,melody:[74,77,81,76,74,69,77,74],chord:[38,45,53],ambience:{kind:'snow',cutoff:760,gain:.037},effect:'snow',space:.25},
  'aotai-taibai':{route:'aotai',title:'把山野带回今天',instrument:'air',tempo:66,melody:[74,81,78,86,83,81,76,74],chord:[50,57,66],ambience:{kind:'wind',cutoff:280,gain:.019},effect:'clearbell',space:.24}
 };
 Object.assign(PROFILES,{
  "maclehose-saiwan": {
    "route": "maclehose",
    "title": "潮线与海风",
    "instrument": "pluck",
    "tempo": 76,
    "melody": [
      72,
      79,
      81,
      76,
      74,
      79,
      76,
      72
    ],
    "chord": [
      48,
      55,
      64
    ],
    "ambience": {
      "kind": "surf",
      "cutoff": 720,
      "gain": 0.038
    },
    "effect": "breeze",
    "space": 0.2
  },
  "maclehose-hamtin": {
    "route": "maclehose",
    "title": "咸田湾的蓝",
    "instrument": "air",
    "tempo": 54,
    "melody": [
      67,
      74,
      79,
      81,
      76,
      74,
      71,
      67
    ],
    "chord": [
      43,
      50,
      59
    ],
    "ambience": {
      "kind": "surf",
      "cutoff": 980,
      "gain": 0.047
    },
    "effect": "breeze",
    "space": 0.2
  },
  "maclehose-chekkeng": {
    "route": "maclehose",
    "title": "渡头下的静水",
    "instrument": "wood",
    "tempo": 66,
    "melody": [
      64,
      71,
      76,
      73,
      71,
      68,
      66,
      64
    ],
    "chord": [
      40,
      47,
      56
    ],
    "ambience": {
      "kind": "shore",
      "cutoff": 470,
      "gain": 0.022
    },
    "effect": "wood",
    "space": 0.2
  },
  "changping-forest": {
    "route": "changping",
    "title": "苔木边的脚步",
    "instrument": "wood",
    "tempo": 78,
    "melody": [
      62,
      65,
      69,
      72,
      69,
      67,
      65,
      62
    ],
    "chord": [
      38,
      45,
      54
    ],
    "ambience": {
      "kind": "forest",
      "cutoff": 630,
      "gain": 0.02
    },
    "effect": "wood",
    "space": 0.2
  },
  "changping-valley": {
    "route": "changping",
    "title": "水声在树林里",
    "instrument": "bell",
    "tempo": 62,
    "melody": [
      74,
      79,
      83,
      86,
      81,
      79,
      76,
      74
    ],
    "chord": [
      50,
      57,
      66
    ],
    "ambience": {
      "kind": "stream",
      "cutoff": 1320,
      "gain": 0.034
    },
    "effect": "birds",
    "space": 0.2
  },
  "changping-meadow": {
    "route": "changping",
    "title": "走出森林的那一刻",
    "instrument": "air",
    "tempo": 64,
    "melody": [
      69,
      76,
      81,
      83,
      79,
      76,
      74,
      69
    ],
    "chord": [
      45,
      52,
      61
    ],
    "ambience": {
      "kind": "stream",
      "cutoff": 870,
      "gain": 0.024
    },
    "effect": "clearbell",
    "space": 0.2
  },
  "mogan-bamboo": {
    "route": "mogan",
    "title": "竹间雨滴",
    "instrument": "bell",
    "tempo": 68,
    "melody": [
      76,
      79,
      83,
      88,
      83,
      81,
      79,
      76
    ],
    "chord": [
      52,
      59,
      68
    ],
    "ambience": {
      "kind": "bamboo",
      "cutoff": 1690,
      "gain": 0.026
    },
    "effect": "drops",
    "space": 0.2
  },
  "mogan-path": {
    "route": "mogan",
    "title": "旧石阶慢慢拐弯",
    "instrument": "wood",
    "tempo": 84,
    "melody": [
      67,
      72,
      76,
      79,
      74,
      72,
      69,
      67
    ],
    "chord": [
      43,
      50,
      59
    ],
    "ambience": {
      "kind": "bamboo",
      "cutoff": 890,
      "gain": 0.021
    },
    "effect": "stone",
    "space": 0.2
  },
  "mogan-stream": {
    "route": "mogan",
    "title": "一片叶子与山泉",
    "instrument": "pluck",
    "tempo": 74,
    "melody": [
      71,
      76,
      78,
      83,
      80,
      78,
      75,
      71
    ],
    "chord": [
      47,
      54,
      63
    ],
    "ambience": {
      "kind": "stream",
      "cutoff": 1130,
      "gain": 0.03
    },
    "effect": "drops",
    "space": 0.2
  }
});
 Object.assign(PROFILES,{
  "westlake-creek": {
    "route": "westlake",
    "title": "石头旁的细水声",
    "instrument": "wood",
    "tempo": 72,
    "melody": [
      65,
      72,
      77,
      74,
      72,
      69,
      67,
      65
    ],
    "chord": [
      41,
      48,
      57
    ],
    "ambience": {
      "kind": "stream",
      "cutoff": 1250,
      "gain": 0.031
    },
    "effect": "drops",
    "space": 0.18
  },
  "westlake-path": {
    "route": "westlake",
    "title": "石径转入树荫",
    "instrument": "pluck",
    "tempo": 80,
    "melody": [
      69,
      74,
      78,
      81,
      78,
      76,
      73,
      69
    ],
    "chord": [
      45,
      52,
      61
    ],
    "ambience": {
      "kind": "forest",
      "cutoff": 760,
      "gain": 0.021
    },
    "effect": "stone",
    "space": 0.18
  },
  "westlake-tea": {
    "route": "westlake",
    "title": "茶村慢下来的午后",
    "instrument": "air",
    "tempo": 60,
    "melody": [
      72,
      77,
      81,
      84,
      79,
      77,
      74,
      72
    ],
    "chord": [
      48,
      55,
      64
    ],
    "ambience": {
      "kind": "leaves",
      "cutoff": 640,
      "gain": 0.02
    },
    "effect": "breeze",
    "space": 0.18
  }
});
 for(const id of ['westlake-creek','westlake-path','westlake-tea'])PROFILES[id].instrument='felt';
 const SAMPLES={creek:'audio/westlake-creek-v1.mp3',leaves:'audio/westlake-leaves-v1.mp3',drips:'audio/westlake-drips-v1.mp3',drop:'audio/mini-drop-v1.mp3',splash:'audio/mini-splash-v1.mp3',paper:'audio/mini-paper-v1.mp3',wugongPaper:'audio/wugong-paper-v1.mp3',wugongPlace:'audio/wugong-place-v1.mp3',wugongCloth:'audio/wugong-cloth-v1.mp3',wugongClick:'audio/wugong-click-v1.mp3',wugongTurn:'audio/wugong-turn-v1.mp3',wugongLine:'audio/wugong-line-v1.mp3',wugongFlutter:'audio/wugong-flutter-v1.mp3',wugongStep1:'audio/wugong-step-1-v1.mp3',wugongStep2:'audio/wugong-step-2-v1.mp3',wugongStep3:'audio/wugong-step-3-v1.mp3'};
 const WUGONG_STEPS=['wugongStep1','wugongStep2','wugongStep3'];
 const MOGAN_FOLEY=['drop','splash','wugongPaper','wugongPlace','wugongCloth','wugongLine','wugongFlutter',...WUGONG_STEPS];
 const TIGER_FOLEY=['wugongClick',...WUGONG_STEPS,'paper','drop','splash','wugongCloth','wugongPlace','wugongLine','wugongTurn'];
 const MINI_SAMPLES={tiger:TIGER_FOLEY,aotai:['paper'],maclehose:['paper','splash'],changping:['paper','splash'],westlake:['splash','drop','paper'],mogan:['drop','paper'],wugong:['wugongPaper','wugongPlace','wugongCloth','wugongClick','wugongTurn','wugongLine','wugongFlutter']};
 const momentMix=Scene.momentMix,westlakeMix=Scene.westlakeMix;
 for(const p of Object.values(PROFILES)){Object.freeze(p.melody);Object.freeze(p.chord);Object.freeze(p.ambience);Object.freeze(p);}Object.freeze(PROFILES);
 const hz=midi=>440*Math.pow(2,(midi-69)/12);
 function profile(id){return PROFILES[id]||null;}
 function score(id){const p=profile(id);if(!p)return [];const beat=60/p.tempo,events=p.melody.map((midi,i)=>({kind:'note',at:i*beat,midi,length:beat*(p.instrument==='air'?1.7:1.1),gain:p.instrument==='felt'?.030:p.instrument==='bell'?.038:.047,instrument:p.instrument,pan:(i%3-1)*.19,space:p.space}));for(const [i,midi]of p.chord.entries())events.push({kind:'note',at:.08+i*.05,midi,length:beat*7.6,gain:.010,instrument:'air',pan:(i-1)*.22,space:p.space});
  const effect=(kind,at,extra={})=>events.push({kind,at,...extra});
  if(p.effect==='birds'){effect('chirp',.25,{frequency:2100,pan:-.3});effect('chirp',1.25,{frequency:2600,pan:.25});}
  else if(p.effect==='drops'){effect('tap',.3,{frequency:1350});effect('tap',1.7,{frequency:1750});}
  else if(p.effect==='breeze')effect('texture',.3,{cutoff:800,length:1.3,gain:.018});
  else if(p.effect==='stone'||p.effect==='wood'){effect('tap',.15,{frequency:p.effect==='stone'?240:170});effect('tap',.55,{frequency:p.effect==='stone'?310:220});}
  else if(p.effect==='echo'){effect('note',.05,{midi:55,length:2.4,gain:.023,instrument:'wood',pan:-.22,space:.35});effect('note',.8,{midi:55,length:2.0,gain:.012,instrument:'wood',pan:.22,space:.35});}
  else if(p.effect==='snow')effect('texture',.15,{cutoff:2700,length:.7,gain:.016});
  else effect('note',.15,{midi:p.effect==='lowbell'?45:p.effect==='clearbell'?86:91,length:2.7,gain:.022,instrument:'bell',pan:0,space:.28});
  return events.sort((a,b)=>a.at-b.at);
 }
 function noise(length,seed=19){const out=new Float32Array(length);let brown=0;for(let i=0;i<length;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;brown=(brown+(seed/4294967296*2-1)*.10)/1.035;out[i]=brown;}return out;}
 function selection(scene={}){
  const {routeId='wugong',checkpointId=null,weather='clear',mode='walk',progress=0,momentGame=null,momentId=null}=scene;
  if(mode==='silent')return {key:'silent:'+routeId,silent:true};const p=mode==='photo'?profile(checkpointId):null,landscape=Scene.landscape(scene);
  return {key:[mode,routeId,p?checkpointId:'',mode==='moment'||mode==='reward'?momentId||momentGame||'':'',weather,landscape.zone].join(':'),routeId,progress,profile:p,landscape,mix:landscape.mix,ambience:landscape.ambience,events:p&&!['wugong','mogan'].includes(routeId)?score(checkpointId):[]};
 }
 function create({AudioContext=null,navigator=null,fetch=null,timers=globalThis,createMusic=null,onError=()=>{},onStateChange=()=>{}}={}){let context=null,master=null,reverb=null,reverbGain=null,noiseBuffer=null,brightBuffer=null,waterBuffer=null,music=null,sceneRequest=null,enabled=false,currentKey='',group=null,groups=[],suspendTimer=null,disposed=false,lastInteraction=-Infinity;const buffers=new Map(),loads=new Map(),loops=new Map(),automation=new WeakMap(),textureMods=new WeakMap(),textureFilters=new WeakMap();
  function cancelSuspend(){if(suspendTimer!==null){timers.clearTimeout?.(suspendTimer);suspendTimer=null;}}
  function disconnect(node){try{node.disconnect();}catch(_){}}
  function disposeGroup(g){if(!g||g.disposed)return;g.disposed=true;for(const v of g.voices){v.source.onended=null;try{v.source.stop();}catch(_){}v.chain.forEach(disconnect);}g.voices.clear();disconnect(g.ambienceBus);disconnect(g.effectsBus);disconnect(g.musicBus);disconnect(g.bus);groups=groups.filter(x=>x!==g);}
  function retire(g,fade=.4){if(!g||g.disposed)return;g.retired=true;const now=context.currentTime;g.bus.gain.cancelScheduledValues(now);g.bus.gain.setValueAtTime(g.bus.gain.value,now);g.bus.gain.linearRampToValueAtTime(0,now+fade);for(const v of g.voices)try{v.source.stop(now+fade+.02);}catch(_){}if(!g.voices.size)disposeGroup(g);}
  function clear(immediate=false){for(const g of [...groups])immediate?disposeGroup(g):retire(g);group=null;currentKey='';}
  function track(g,source,chain){const v={source,chain};g.voices.add(v);source.onended=()=>{chain.forEach(disconnect);g.voices.delete(v);if(g.retired&&!g.voices.size)disposeGroup(g);};return source;}
  function output(g,gain,pan=0,space=0,role='effects'){
   const chain=[gain];let last=gain;
   if(context.createStereoPanner){const p=context.createStereoPanner();p.pan.value=pan;gain.connect(p);last=p;chain.push(p);}
   last.connect(g[role+'Bus']||g.bus);
   if(space&&reverb){const send=context.createGain();send.gain.value=space;last.connect(send);send.connect(reverb);chain.push(send);}return chain;
  }
  // Avoid resetting a fade to its final target on every animation frame.
  function ramp(param,value,duration=.7){
   const now=context.currentTime,old=automation.get(param);if(old&&Math.abs(old.to-value)<.004)return;
   const held=old?old.from+(old.to-old.from)*Math.max(0,Math.min(1,(now-old.at)/old.duration)):param.value;
   if(param.cancelAndHoldAtTime)param.cancelAndHoldAtTime(now);else{param.cancelScheduledValues(now);param.setValueAtTime(held,now);}
   param.linearRampToValueAtTime(value,now+duration);automation.set(param,{from:held,to:value,at:now,duration});
  }
  function canCue(channel,gap=.12){
   if(!enabled||!group||group.retired||group.disposed||context?.state!=='running'||group.voices.size>86)return false;
   const now=context.currentTime,previous=group.cues.get(channel)??-Infinity;if(now-previous<gap)return false;group.cues.set(channel,now);return true;
  }
  function duck(g,strength=.70,length=.38){
   const now=context.currentTime;if(now-(g.lastDuck??-1)<.10)return;g.lastDuck=now;
   const param=g.ambienceBus.gain;automation.delete(param);if(param.cancelAndHoldAtTime)param.cancelAndHoldAtTime(now);else{param.cancelScheduledValues(now);param.setValueAtTime(param.value,now);}
   param.linearRampToValueAtTime(strength,now+.035);param.linearRampToValueAtTime(1,now+length);
   if(g.routeId==='wugong')music?.duck(Math.max(.76,strength),Math.max(.55,length));
   else if(g.routeId==='mogan')music?.duck(Math.max(.66,strength),Math.max(.55,length));
  }
  function tone(g,event,base=context.currentTime+.04){
   if(g.voices.size>86)return false;
   const start=base+(event.at||0),length=Math.max(.045,event.length),partials=event.instrument==='felt'?[[1,.72],[2,.15],[3,.035]]:event.instrument==='bell'?[[1,.72],[2.71,.12],[4.08,.025]]:event.instrument==='air'?[[1,.75],[2,.10],[.5,.08]]:[[1,.84],[2,.09]];
   for(const [ratio,weight]of partials){const source=context.createOscillator(),gain=context.createGain(),attack=event.instrument==='air'?Math.min(.20,length*.23):event.instrument==='felt'?.025:.008;source.type=event.instrument==='wood'?'triangle':'sine';source.frequency.setValueAtTime(hz(event.midi)*ratio,start);gain.gain.setValueAtTime(.0001,start);gain.gain.linearRampToValueAtTime(event.gain*weight,start+attack);if(event.instrument==='air')gain.gain.setValueAtTime(event.gain*weight*.65,start+length*.60);gain.gain.exponentialRampToValueAtTime(.0001,start+length);source.connect(gain);track(g,source,[source,...output(g,gain,event.pan||0,event.space||0,event.role||'effects')]).start(start);source.stop(start+length+.025);}return true;
  }
  function texture(g,settings,base=context.currentTime+.02,loop=false){
   const source=context.createBufferSource(),filter=context.createBiquadFilter(),high=context.createBiquadFilter(),gain=context.createGain(),start=base+(settings.at||0),bright=['surf','rain','snow','spray','sand','stone'].includes(settings.kind),water=['river','stream','bamboo','leaves'].includes(settings.kind);
   source.buffer=bright?brightBuffer:water?waterBuffer:noiseBuffer;source.loop=loop;
   high.type='highpass';high.frequency.value=settings.highpass||60;high.Q.value=.5;filter.type=settings.filter||'lowpass';filter.frequency.value=settings.cutoff||1600;filter.Q.value=settings.q||.55;
   if(loop)textureFilters.set(gain,{high,filter});
   gain.gain.value=loop?settings.gain:0;
   if(loop&&settings.mod){const sway=context.createOscillator(),depth=context.createGain();sway.type='sine';sway.frequency.value=settings.mod;depth.gain.value=settings.gain*(settings.depth||.2);sway.connect(depth);depth.connect(gain.gain);track(g,sway,[sway,depth]).start(start);textureMods.set(gain,depth);}
   if(!loop){gain.gain.setValueAtTime(.0001,start);gain.gain.linearRampToValueAtTime(settings.gain,start+Math.min(settings.attack||.035,settings.length*.25));gain.gain.exponentialRampToValueAtTime(.0001,start+settings.length);}
   source.connect(high);high.connect(filter);filter.connect(gain);track(g,source,[source,high,filter,...output(g,gain,settings.pan||0,settings.space||0,loop?'ambience':'effects')]).start(start);if(!loop)source.stop(start+settings.length+.025);return gain;
  }
  function effect(g,e,base){if(e.kind==='texture'){texture(g,e,base);return;}if(e.kind==='note'){tone(g,e,base);return;}const source=context.createOscillator(),gain=context.createGain(),start=base+e.at,length=e.kind==='chirp'?.28:.09;source.type='sine';source.frequency.setValueAtTime(e.frequency,start);source.frequency.exponentialRampToValueAtTime(e.frequency*(e.kind==='chirp'?1.28:.6),start+length*.65);gain.gain.setValueAtTime(.0001,start);gain.gain.linearRampToValueAtTime(e.kind==='chirp'?.010:.026,start+.015);gain.gain.exponentialRampToValueAtTime(.0001,start+length);source.connect(gain);track(g,source,[source,...output(g,gain,e.pan||0,.12)]).start(start);source.stop(start+length+.02);}
  function init(){if(!AudioContext)throw Error('Web Audio unavailable');context=new AudioContext();context.addEventListener?.('statechange',()=>{if(!disposed)onStateChange();});master=context.createGain();master.gain.value=.7;const compressor=context.createDynamicsCompressor?.();if(compressor){compressor.threshold.value=-16;compressor.knee.value=18;compressor.ratio.value=3;master.connect(compressor);compressor.connect(context.destination);}else master.connect(context.destination);
   noiseBuffer=context.createBuffer(1,Math.ceil(context.sampleRate*3),context.sampleRate);noiseBuffer.getChannelData(0).set(noise(noiseBuffer.length));brightBuffer=context.createBuffer(1,Math.ceil(context.sampleRate*4),context.sampleRate);waterBuffer=context.createBuffer(1,brightBuffer.length,context.sampleRate);const bright=brightBuffer.getChannelData(0),water=waterBuffer.getChannelData(0);let seed=7381,pink=0;for(let i=0;i<bright.length;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const white=seed/4294967296*2-1;pink=.97*pink+.03*white;bright[i]=white*.38+pink*.42;water[i]=white*.12+pink*.78;}if(context.createConvolver){reverb=context.createConvolver();const impulse=context.createBuffer(2,Math.ceil(context.sampleRate*1.6),context.sampleRate);for(let c=0;c<2;c++){const data=impulse.getChannelData(c),raw=noise(data.length,101+c);for(let i=0;i<data.length;i++)data[i]=raw[i]*Math.pow(1-i/data.length,2.4);}reverb.buffer=impulse;reverbGain=context.createGain();reverbGain.gain.value=.13;reverb.connect(reverbGain);reverbGain.connect(master);}
   if(createMusic)music=createMusic({context,destination:master,timers,onStateChange});
  }
  // WebKit's default ambient session obeys the iPhone Ring/Silent switch.
  // Request media playback only after the visitor explicitly enables sound.
  function playbackSession(){try{if(navigator?.audioSession)navigator.audioSession.type='playback';}catch(_){}}
  async function enable(scene=null){if(disposed)return false;cancelSuspend();try{playbackSession();if(!context)init();const resumed=context.resume();if(scene)music?.resume(scene);await resumed;if(disposed||context?.state!=='running')throw Error('Audio playback did not resume');enabled=true;currentKey='';return true;}catch(error){enabled=false;music?.pause(true);clear(true);if(!disposed)onError(error);return false;}}
  function suspendAfter(delay){cancelSuspend();if(timers.setTimeout)suspendTimer=timers.setTimeout(()=>{suspendTimer=null;clear(true);context?.suspend?.().catch?.(onError);},delay);else{clear(true);context?.suspend?.().catch?.(onError);}}
  function loadSample(id){
   if(!SAMPLES[id])return Promise.resolve(null);if(buffers.has(id))return Promise.resolve(buffers.get(id));if(loads.has(id))return loads.get(id);if(!fetch||!context?.decodeAudioData)return Promise.resolve(null);
   const owner=context,promise=Promise.resolve().then(()=>fetch(SAMPLES[id])).then(r=>{if(!r.ok)throw Error('Sound sample unavailable');return r.arrayBuffer();}).then(data=>owner.decodeAudioData(data)).then(buffer=>{if(!disposed&&owner===context)buffers.set(id,buffer);return buffer;}).catch(()=>{loads.delete(id);return null;});loads.set(id,promise);return promise;
  }
  function preloadFoley(g,ids){
   let index=0;const worker=async()=>{while(enabled&&!disposed&&group===g&&!g.retired&&!g.disposed&&index<ids.length){const id=ids[index++];await loadSample(id);}};
   // Short foley uses at most two workers per current scene, alongside one leaf
   // bed. The long score is streamed separately and never decodeAudioData'd.
   worker();worker();
  }
  function loopBuffer(id,buffer){
   if(loops.has(id))return loops.get(id);if(!buffer.getChannelData||!buffer.sampleRate||buffer.duration<2)return buffer;
   const seam=Math.floor(buffer.sampleRate*.22),length=buffer.length-seam,joined=context.createBuffer(buffer.numberOfChannels,length,buffer.sampleRate);
   for(let channel=0;channel<buffer.numberOfChannels;channel++){
    const input=buffer.getChannelData(channel),output=joined.getChannelData(channel);output.set(input.subarray(seam,buffer.length-seam));
    for(let i=0;i<seam;i++){const t=i/seam;output[length-seam+i]=input[buffer.length-seam+i]*Math.cos(t*Math.PI/2)+input[i]*Math.sin(t*Math.PI/2);}
   }
   loops.set(id,joined);return joined;
  }
  function recorded(g,id,buffer){
   if(g.samples.has(id)||g.disposed||g.retired||!(g.mix[id]>0))return;
   const style=g.landscape.recording[id]||{},source=context.createBufferSource(),gain=context.createGain(),high=context.createBiquadFilter(),filter=context.createBiquadFilter(),bed=loopBuffer(id,buffer);
   source.buffer=bed;source.loop=true;if(source.playbackRate)source.playbackRate.value=style.rate||1;high.type='highpass';high.frequency.value=style.highpass||80;filter.type='lowpass';filter.frequency.value=style.cutoff||4000;filter.Q.value=.5;gain.gain.value=0;
   const chain=output(g,gain,style.pan||0,0,'ambience'),panner=chain.find(node=>node.pan);
   source.connect(high);high.connect(filter);filter.connect(gain);track(g,source,[source,high,filter,...chain]).start(context.currentTime,bed.duration?context.currentTime%Math.max(.1,bed.duration-.1):0);
   if(style.mod){const sway=context.createOscillator(),depth=context.createGain();sway.type='sine';sway.frequency.value=style.mod;depth.gain.value=(g.mix[id]||0)*(style.depth||.3);sway.connect(depth);depth.connect(gain.gain);track(g,sway,[sway,depth]).start(context.currentTime);g.modulations.set(id,depth);}
   g.samples.set(id,{gain,source,high,filter,panner});updateMix(g,g.mix);
  }
  function updateMix(g,mix){
   g.mix=mix;
   let wanted=0,ready=0;
   for(const [id,target]of Object.entries(mix)){
    wanted+=target;const item=g.samples.get(id),level=target*(id==='leaves'&&g.windLevel!==undefined?.8+g.windLevel*.45:1);
    if(item){ready+=target;ramp(item.gain.gain,level,1.15);const style=g.landscape.recording[id]||{};ramp(item.filter.frequency,style.cutoff||4000,1.15);ramp(item.high.frequency,style.highpass||80,1.15);if(item.panner)ramp(item.panner.pan,style.pan||0,1.15);if(item.source.playbackRate)ramp(item.source.playbackRate,style.rate||1,.8);if(g.modulations.has(id))ramp(g.modulations.get(id).gain,level*(style.depth||.3),1.15);}
    if(target>0&&!g.requested.has(id)){g.requested.add(id);loadSample(id).then(buffer=>{if(!buffer||disposed||!enabled||group!==g||g.retired||g.disposed)return;recorded(g,id,buffer);onStateChange();});}
   }
   // Keep a quiet designed wind/wave layer; a leaf download must not silence the whole scene.
   if(g.fallback){const primary=g.landscape.layers[0],coverage=wanted?ready/wanted:0,level=primary.gain*(1-coverage*(g.routeId==='wugong'?.90:.55))*(g.windLevel===undefined?1:.8+g.windLevel*.55);ramp(g.fallback.gain,level,1.15);if(textureMods.has(g.fallback))ramp(textureMods.get(g.fallback).gain,level*(primary.depth||.2),1.15);const filters=textureFilters.get(g.fallback);if(filters){ramp(filters.filter.frequency,primary.cutoff||1600,1.15);ramp(filters.high.frequency,primary.highpass||60,1.15);}}
  }
  function setScene(scene){
   if(!enabled||!context||disposed)return false;sceneRequest=scene;music?.sync(scene);const next=selection(scene);
   if(next.key===currentKey){if(group){group.landscape=next.landscape;updateMix(group,next.mix);for(const [id,item]of group.beds){const target=next.landscape.layers.find(layer=>layer.id===id);if(target&&id!=='landscape')ramp(item.gain,target.gain,1.15);}}if(!next.silent&&context.state!=='running')context.resume().catch(onError);return false;}
   cancelSuspend();if(group)retire(group);group=null;currentKey=next.key;if(next.silent){suspendAfter(480);return true;}
   context.resume().catch(onError);const bus=context.createGain(),ambienceBus=context.createGain(),effectsBus=context.createGain(),musicBus=context.createGain();bus.gain.setValueAtTime(0,context.currentTime);bus.gain.linearRampToValueAtTime(1,context.currentTime+.55);effectsBus.gain.value=.86;musicBus.gain.value=.45;ambienceBus.connect(bus);effectsBus.connect(bus);musicBus.connect(bus);bus.connect(master);
   group={bus,ambienceBus,effectsBus,musicBus,voices:new Set(),retired:false,disposed:false,samples:new Map(),modulations:new Map(),requested:new Set(),mix:next.mix,routeId:next.routeId,landscape:next.landscape,beds:new Map(),cues:new Map(),stepCount:0};groups.push(group);while(groups.length>3)disposeGroup(groups[0]);
   for(const settings of next.landscape.layers){const gain=texture(group,settings,context.currentTime,true);group.beds.set(settings.id,gain);if(settings.id==='landscape')group.fallback=group.ambienceGain=gain;}
   group.lastWind=-1;group.lastTug=-1;group.lastRipple=-1;
   if(scene.routeId==='wugong')preloadFoley(group,[...(scene.mode==='walk'?WUGONG_STEPS:[]),...MINI_SAMPLES.wugong]);
   else if(scene.routeId==='mogan')preloadFoley(group,MOGAN_FOLEY);
   else if(scene.routeId==='tiger')preloadFoley(group,TIGER_FOLEY);
   else{const preload=scene.mode==='walk'?['paper']:['moment','reward'].includes(scene.mode)?MINI_SAMPLES[scene.routeId]||['paper']:[];for(const id of preload)loadSample(id);}
   updateMix(group,next.mix);const base=context.currentTime+.12;for(const e of next.events)e.kind==='note'?tone(group,{...e,role:'music'},base):effect(group,e,base);return true;
  }
  function interact(kind,{x=.5,icon=null,playType=null}={}){
   if(!['ripple','leaf','drip','watch','breeze','trace'].includes(kind)||!canCue('observe',.18))return false;
   const p=Math.max(0,Math.min(1,Number.isFinite(x)?x:.5)),pan=(p-.5)*.5,start=context.currentTime+.012,cue=group.landscape.cue;
   if(group.routeId==='wugong'){transient(cue==='paper'?'wugongPaper':'wugongCloth',pan,cue==='paper'?.18:.11,1);return true;}
   if(icon==='bell'||cue==='bell'){tone(group,{at:0,midi:76+Math.min(2,Math.floor(p*3))*2,length:.9,gain:.014,instrument:'bell',pan,space:.16},start);duck(group,.8);return true;}
   if(playType==='brew'||cue==='tea'){
    texture(group,{kind:'stream',cutoff:2800,highpass:900,length:.55,gain:.013,pan,space:.03},start);transient('drop',pan,.14,1.1);return true;
   }
   if(playType==='sand'||cue==='sand'){
    texture(group,{kind:'sand',cutoff:4300,highpass:1700,length:.17,gain:.016,pan,attack:.012},start);return true;
   }
   if(cue==='snow'||group.routeId==='aotai'){
    texture(group,{kind:'snow',cutoff:3100,highpass:1100,length:playType==='outline'?.16:.24,gain:.011,pan},start);return true;
   }
   if(playType==='rhythm'||cue==='bamboo'){
    transient('drop',pan,.25,1.02);tone(group,{at:.025,midi:[60,62,67][Math.min(2,Math.floor(p*3))],length:.18,gain:.009,instrument:'wood',pan,space:.04},start);return true;
   }
   if(cue==='water'||['guide','echo','spray','settle'].includes(playType)||kind==='ripple'){
    const level=playType==='spray'?.22:playType==='settle'?.12:.19;
    if(!transient('splash',pan,level,.94+p*.13))texture(group,{kind:'stream',cutoff:2200,highpass:650,length:.30,gain:.015,pan},start);
    if(playType==='echo')tone(group,{at:.08,midi:[62,65,69][Math.min(2,Math.floor(p*3))],length:.42,gain:.008,instrument:'felt',pan:-pan,space:.14},start);return true;
   }
   if(cue==='stone'||cue==='wood'||playType==='trail'){
    texture(group,{kind:'stone',cutoff:cue==='wood'?1300:2400,highpass:250,length:.10,gain:.012,pan,attack:.008},start);
    tone(group,{at:0,midi:cue==='wood'?44:49,length:.065,gain:.006,instrument:'wood',pan,space:.025},start);return true;
   }
   if(cue==='leaf'||kind==='leaf'){if(!transient('paper',pan,.14,1+p*.08))texture(group,{kind:'leaves',cutoff:3400,highpass:850,length:.2,gain:.012,pan},start);return true;}
   const surf=cue==='surf'||group.routeId==='maclehose',listen=playType==='listen';
   texture(group,{kind:surf?'surf':group.routeId==='tiger'?'river':'wind',cutoff:listen?850+(1-p)*1250:surf?2200:1100,highpass:surf?350:120,length:listen?.65:.42,gain:listen?.012+(1-p)*.012:.013,pan,space:group.routeId==='tiger'?.12:.025},start);return true;
  }
  function wind(energy=0,completed=false){
   if(!enabled||!group||group.routeId!=='wugong'||!currentKey.startsWith('moment:')||context?.state!=='running')return false;
   const level=completed?.08:Math.round(Math.max(0,Math.min(1,energy))*8)/8;if(level===group.lastWind)return false;group.lastWind=group.windLevel=level;updateMix(group,group.mix);return true;
  }
  // Never replay an interaction after a late network response. Only already decoded
  // buffers can start a transient; the synthesized fallback responds immediately.
  function transient(id,pan,gain=.55,rate=1,options={}){
   const buffer=buffers.get(id);if(!buffer||!group||group.disposed||group.retired)return false;
   const source=context.createBufferSource(),volume=context.createGain(),start=context.currentTime+.006,length=buffer.duration/rate;
   source.buffer=buffer;if(source.playbackRate)source.playbackRate.value=rate;
   volume.gain.setValueAtTime(0,start);volume.gain.linearRampToValueAtTime(gain,start+.008);volume.gain.setValueAtTime(gain,start+Math.max(.01,length-.06));volume.gain.linearRampToValueAtTime(0,start+length);
   const chain=[source];let last=source;if(options.cutoff){const filter=context.createBiquadFilter();filter.type='lowpass';filter.frequency.value=options.cutoff;last.connect(filter);last=filter;chain.push(filter);}last.connect(volume);track(group,source,[...chain,...output(group,volume,pan,options.space??.08)]).start(start);source.stop(start+length+.01);return true;
  }
  function wugongMini(event,pan){
   // Recorded material, rather than a rising scale on every successful action.
   // Missing/late foley is skipped. It must never replay an old gesture.
   if(event==='complete'){
    if(group.completedAudio)return false;group.completedAudio=true;duck(group,.68,1.0);transient('wugongPaper',0,.22,.96);return true;
   }
   if(event==='shutter'){duck(group,.72,.65);transient('wugongClick',pan,.43,1,{space:0,cutoff:6200});return true;}
   if(event==='piece-lock'){duck(group,.80,.55);transient('wugongPlace',pan,.32,1,{space:.025});return true;}
   if(event==='piece-pick'||event==='piece-miss'){transient('wugongTurn',pan,event==='piece-pick'?.22:.10,1,{space:.02,cutoff:event==='piece-miss'?2200:5000});return true;}
   if(event==='reveal'||event==='collect'){duck(group,.76,.8);transient(event==='collect'?'wugongPlace':'wugongPaper',0,event==='collect'?.28:.36,1,{space:.025});return true;}
   if(event==='cloud-clear'){duck(group,.84,.8);transient('wugongCloth',pan,.17,.90,{space:0,cutoff:2400});return true;}
   if(['wind-send','wind-turn','flight-phase','lift','tug','wind-blocked','slip'].includes(event)){const open=event==='lift'||event==='flight-phase';transient(open?'wugongFlutter':'wugongLine',pan,open?.20:.13,event==='wind-turn'?.94:1,{space:0,cutoff:3200});return true;}
   if(['hello','offer','goodbye','reply','call','detail'].includes(event)){transient('wugongCloth',pan,.075,1,{space:0,cutoff:2600});return true;}
   if(event==='show-photo'){transient('wugongPaper',pan,.22,1,{space:.02});return true;}
   // Looking and focusing stay quiet; the shutter is the audible commitment.
   if(['frame','focus','inspect','early'].includes(event))return true;
   return false;
  }
  function moganMini(event,pan,index){
   // Every note is a recorded droplet at an authored playback rate, not an oscillator.
   if(event==='catch'){duck(group,.68,.72);const notes=[0,4,7,4,2,5,4,0];transient('drop',pan,.40,Math.pow(2,notes[Math.max(0,Math.min(7,index))]/12),{space:.11,cutoff:4800});transient('splash',pan,.095,1,{space:.025,cutoff:2600});return true;}
   if(event==='step-land'){duck(group,.72,.65);transient(WUGONG_STEPS[Math.max(0,index)%3],pan,.42,1,{space:.02,cutoff:3800});return true;}
   if(event==='rain-miss'){transient('drop',pan,.11,.86,{space:0,cutoff:1800});return true;}
   if(event==='begin'||event==='step-miss'){transient('wugongCloth',pan,.08,1,{space:0,cutoff:2300});return true;}
   if(event==='sling-draw'){transient('wugongLine',pan,.22,.96,{space:0,cutoff:3400});return true;}
   if(event==='sling-release'){duck(group,.82,.6);transient('wugongFlutter',pan,.24,1,{space:.02,cutoff:4300});return true;}
   if(event==='sling-hit'||event==='sling-fall'){transient(event==='sling-hit'?'wugongPlace':'wugongCloth',pan,.13,.96,{space:0,cutoff:2200});return true;}
   if(event==='sling-catch'){duck(group,.72,.8);transient('wugongCloth',pan,.13,1,{space:.02});return true;}
   if(event==='complete'){if(group.completedAudio)return false;group.completedAudio=true;duck(group,.66,.9);transient('wugongPaper',0,.20,.97,{space:.03});return true;}
   if(event==='reveal'||event==='collect'){duck(group,.72,.8);transient(event==='collect'?'wugongPlace':'wugongPaper',0,event==='collect'?.29:.32,1,{space:.02});return true;}
   return false;
  }
  function tigerMini(event,pan,index,start){
   // CC0 metal-click foley already credited in wugong-credits.json; no camera or local river recording is claimed.
   if(event==='shutter'){duck(group,.90,.30);transient('wugongClick',pan,.34,1,{space:0,cutoff:6200});return true;}
   if(event==='trail-arrive'){transient('wugongCloth',pan,.085,.96,{space:0,cutoff:2300});return true;}
   // Scene transitions carry the changing water bed. Looking, pausing and choosing a frame stay quiet.
   if(['frame-ready','trail-stop','river-arrive','pause','frame','focus','inspect','viewport'].includes(event))return true;
   if(event==='depth-paper'||event==='depth-return'||event==='score-edit'){transient('paper',pan,event==='depth-return'?.08:.15,1,{space:.02});return true;}
   if(event==='depth-view'){texture(group,{kind:'wind',cutoff:1200,highpass:180,length:.4,gain:.012,pan,space:.14},start);return true;}
   if(event==='pack-pick'||event==='pack-return'){transient('wugongCloth',pan,event==='pack-return'?.09:.16,1,{space:0,cutoff:3000});return true;}
   if(event==='pack-turn'){transient('wugongTurn',pan,.15,1,{space:0});return true;}
   if(event==='pack-place'){transient('wugongPlace',pan,.20,.96,{space:.02,cutoff:3600});return true;}
   if(event==='pack-close'){transient('wugongLine',pan,.24,.9,{space:.02});transient('wugongCloth',pan,.14,1,{space:0});return true;}
   if(event==='score-water'){transient('splash',pan,.22,.90,{space:.15,cutoff:3200});texture(group,{kind:'river',cutoff:2300,highpass:140,length:.34,gain:.014,pan,space:.16},start);return true;}
   if(event==='score-drop'){transient('drop',pan,.30,Math.pow(2,[0,4,7,4,2,5,4,0][Math.max(0,Math.min(7,index))]/12),{space:.20,cutoff:4800});return true;}
   if(event==='score-wind'){texture(group,{kind:'wind',cutoff:1450,highpass:320,length:.38,gain:.022,pan,space:.14},start);return true;}
   if(event==='trail-bell'){tone(group,{at:0,midi:78,length:index===0?.65:.95,gain:index===0?.008:index===1?.015:.022,instrument:'bell',pan,space:index===0?.25:.14},start);return true;}
   // One event arrives at the visible footfall. Never queue a missing sample
   // or manufacture steps while the player is standing still.
   if(event==='road-step')return transient(WUGONG_STEPS[Math.max(0,index)%WUGONG_STEPS.length],pan,.10,.96,{space:.025,cutoff:3400});
   if(event==='trail-step'){
    const step=Math.max(0,index)%WUGONG_STEPS.length,highRoad=group.landscape.zone==='high-road';
    return transient(WUGONG_STEPS[step],pan,highRoad?.23:.25,highRoad?[.94,.98,.96][step]:.94,{space:highRoad?.025:.04,cutoff:highRoad?3700:3300});
   }
   if(event==='complete'){if(group.completedAudio)return false;group.completedAudio=true;duck(group,.72,.9);transient('paper',0,.20,.96,{space:.08});return true;}
   if(event==='reveal'||event==='collect'){duck(group,.76,.6);transient(event==='collect'?'wugongPlace':'paper',0,event==='collect'?.25:.22,1,{space:.04});return true;}
   return false;
  }
  function mini(game,event,{x=.5,index=0}={}){
   const channel=['piece-pick','card-swap','card-return'].includes(event)?'paper':event,interval=({frame:.22,focus:.24,inspect:.24,tug:.25,ripple:.14,'cloud-clear':.08,'card-clear':.10,miss:.24,catch:.08,goal:.12,reveal:.6,collect:.6})[channel]??.065;
   if(!canCue(channel,interval))return false;
   const pan=(Math.max(0,Math.min(1,Number.isFinite(x)?x:.5))-.5)*.65,start=context.currentTime+.012,motif=group.landscape.motif;
   if(group.routeId==='wugong')return wugongMini(event,pan);
   if(group.routeId==='mogan')return moganMini(event,pan,index);
   if(group.routeId==='tiger')return tigerMini(event,pan,index,start);
   if(['piece-pick','card-swap','card-return','sling-draw'].includes(event)){
    if(!transient('paper',pan,event==='sling-draw'?.19:.14,event==='card-return'?.88:1.05))texture(group,{kind:'leaves',cutoff:3300,highpass:800,length:.10,gain:.012,pan},start);
    if(event==='sling-draw')texture(group,{kind:'wind',cutoff:900,highpass:200,length:.20,gain:.008,pan},start);return true;
   }
   if(event==='piece-lock'){
    duck(group,.66);transient('paper',pan,.22,.97);tone(group,{at:.025,midi:[60,62,64,67,69,72][Math.max(0,index-1)%6],length:.29,gain:.016,instrument:'felt',pan,space:.07},start);return true;
   }
   if(event==='piece-miss'){transient('paper',pan,.10,.88);texture(group,{kind:'leaves',cutoff:1800,highpass:500,length:.09,gain:.006,pan},start);return true;}
   if(event==='card-shuffle'){transient('paper',-.12,.24,.95);transient('paper',.12,.12,1.09);return true;}
   if(event==='card-clear'){
    duck(group,.68);transient('paper',pan,.19,1.04+Math.min(index,5)*.025);const midi=[64,67,69,72,76][Math.max(0,index-1)%5];tone(group,{at:.025,midi,length:.36,gain:.017,instrument:'felt',pan,space:.10},start);return true;
   }
   if(event==='sling-release'){transient('paper',pan,.17,1.24);texture(group,{kind:'wind',cutoff:2500,highpass:450,length:.23,gain:.020,pan,panEnd:.25},start);return true;}
   if(event==='sling-hit'||event==='sling-fall'){
    transient('paper',pan,.10,.91);if(event==='sling-hit'){texture(group,{kind:'bamboo',cutoff:1450,highpass:300,length:.09,gain:.020,pan,attack:.006},start);tone(group,{at:.01,midi:55,length:.10,gain:.012,instrument:'wood',pan,space:.04},start);}return true;
   }
   if(event==='sling-catch'){duck(group,.65);transient('paper',pan,.26,.98);tone(group,{at:.04,midi:69,length:.48,gain:.016,instrument:'felt',pan,space:.10},start);return true;}
   if(event==='cloud-clear'){
    duck(group,.78);texture(group,{kind:'wind',cutoff:1550,highpass:220,length:.66,gain:.029,pan,space:.06},start);transient('paper',pan,.055,1.13);return true;
   }
   if(['wind-send','wind-turn','flight-phase','lift'].includes(event)){
    const soaring=event==='lift'||index===2;texture(group,{kind:'wind',cutoff:soaring?800:1550,highpass:100,length:event==='wind-turn'?.55:1.1,gain:.024,pan,space:.04},start);
    if(event==='flight-phase'||event==='lift')transient('paper',pan,.11,soaring?.94:1.12);return true;
   }
   if(event==='wind-blocked'||event==='slip'){texture(group,{kind:'wind',cutoff:620,highpass:120,length:.29,gain:.020,pan},start);return true;}
   if(event==='frame'||event==='focus'||event==='inspect'){if(!transient('paper',pan,.045,1.10))texture(group,{kind:'leaves',cutoff:2100,highpass:900,length:.07,gain:.005,pan},start);return true;}
   if(['hello','offer','show-photo','goodbye'].includes(event)){
    const midi={hello:67,offer:64,'show-photo':72,goodbye:69}[event];transient('paper',pan,event==='show-photo'?.17:.065,1.04);tone(group,{at:.06,midi,length:.44,gain:.010,instrument:'felt',pan,space:.10},start);return true;
   }
   if(event==='shutter'){
    duck(group,.66);texture(group,{kind:'stone',cutoff:4800,highpass:1500,length:.038,gain:.032,pan,attack:.003},start);texture(group,{kind:'stone',cutoff:3200,highpass:950,length:.05,gain:.021,pan,attack:.003,at:.052},start);tone(group,{at:.007,midi:85,length:.045,gain:.008,instrument:'wood',pan,space:0},start);return true;
   }
   if(event==='detail'||event==='reply'||event==='call'){
    tone(group,{at:.02,midi:motif[Math.max(0,index-1)%motif.length],length:.48,gain:.014,instrument:'felt',pan,space:.12},start);return true;
   }
   if(event==='early')return true;
   if(event==='tug'){if(!transient('paper',pan,.16,1.10))texture(group,{kind:'wind',cutoff:2200,highpass:850,length:.11,gain:.011,pan},start);return true;}
   if(event==='reveal'||event==='collect'){
    duck(group,.60,.5);if(!transient('paper',0,event==='collect'?.23:.28,event==='collect'?1.10:.94))texture(group,{kind:'leaves',cutoff:2600,highpass:600,length:.24,gain:.014},start);
    tone(group,{at:.065,midi:motif[event==='collect'?3:2],length:event==='collect'?.28:.5,gain:.012,instrument:'felt',pan:0,space:.08},start);return true;
   }
   if(event==='complete'){
    if(group.completedAudio)return false;group.completedAudio=true;duck(group,.54,.8);
    const notes=game==='rain'?[60,67,72]:[motif[0],motif[2],motif[3]];for(const [i,midi]of notes.entries())tone(group,{at:i*.13,midi,length:.52,gain:.015,instrument:'felt',pan:0,space:.10},start);return true;
   }
   if(event==='catch'||event==='goal'){
    duck(group,.72);if(game==='rain'){
     if(!transient('drop',pan,.47,1+(index%3)*.025))effect(group,{kind:'tap',at:0,frequency:1100,pan},start);
     tone(group,{at:.015,midi:[60,62,64,67,69,72,74,76][Math.max(0,index-1)%8],length:.24,gain:.020,instrument:'wood',pan,space:.05},start);
    }else{transient('splash',pan,.19,1.03);tone(group,{at:.05,midi:[62,65,69][Math.max(0,index-1)%3],length:.35,gain:.014,instrument:'felt',pan,space:.08},start);}return true;
   }
   if(event==='ripple'){if(!transient('splash',pan,.28,1+(index%3)*.025))texture(group,{kind:'stream',cutoff:2500,highpass:700,length:.3,gain:.020,pan},start);return true;}
   if(event==='bump'||event==='miss'){
    if(game==='rain'){if(!transient('drop',pan,.13,.93))texture(group,{kind:'rain',cutoff:2500,highpass:1200,length:.11,gain:.009,pan},start);}
    else texture(group,{kind:'stone',cutoff:1500,highpass:180,length:.085,gain:.012,pan,attack:.009},start);return true;
   }
   return false;
  }
  function disable(){enabled=false;sceneRequest=null;music?.pause();clear();if(context)suspendAfter(480);}
  function hide(){cancelSuspend();sceneRequest=null;music?.pause(true);clear(true);context?.suspend?.().catch?.(onError);}
  function retryMusic(){if(!enabled||disposed||!sceneRequest||context?.state!=='running')return false;music?.resume(sceneRequest);return !!music;}
  function step(routeId){
   if(!currentKey.startsWith('walk:')||!group||group.routeId!==routeId||!canCue('step',.24))return false;
   const material=group.landscape.steps,pan=(group.stepCount++%2?1:-1)*.045,start=context.currentTime+.006;
   if(routeId==='wugong'||routeId==='mogan'){transient(WUGONG_STEPS[(group.stepCount-1)%WUGONG_STEPS.length],pan,material==='stone'?.27:.22,1,{space:0,cutoff:material==='stone'?4800:2700});return true;}
   const settings={snow:{kind:'snow',highpass:1400,cutoff:4800,length:.17,gain:.020},sand:{kind:'sand',highpass:900,cutoff:3400,length:.14,gain:.019},grass:{kind:'leaves',highpass:650,cutoff:3200,length:.13,gain:.023},earth:{kind:'stone',highpass:330,cutoff:2100,length:.11,gain:.020},stone:{kind:'stone',highpass:180,cutoff:2700,length:.075,gain:.023},wood:{kind:'bamboo',highpass:200,cutoff:1500,length:.09,gain:.019}}[material];
   texture(group,{...settings,pan,attack:.008},start);if(material==='stone'||material==='wood')tone(group,{at:.003,midi:material==='wood'?43:47,length:.055,gain:.007,instrument:'wood',pan,space:0},start);return true;
  }
  function destroy(){disposed=true;enabled=false;sceneRequest=null;cancelSuspend();music?.destroy();music=null;clear(true);buffers.clear();loads.clear();loops.clear();context?.close?.().catch?.(onError);context=null;}
  return {enable,disable,hide,setScene,interact,mini,wind,step,retryMusic,destroy,get musicState(){return music?.state||'unavailable';},get enabled(){return enabled;},get running(){return enabled&&context?.state==='running';},get playing(){return enabled&&!!group&&context?.state==='running';},get key(){return currentKey;},get available(){return !!AudioContext;},get voiceCount(){return groups.reduce((n,g)=>n+g.voices.size,0);},get groupCount(){return groups.length;}};
 }
 return {scenes:Scene,PROFILES,SAMPLES,MINI_SAMPLES,momentMix,westlakeMix,profile,score,noise,selection,hz,create};
}));
