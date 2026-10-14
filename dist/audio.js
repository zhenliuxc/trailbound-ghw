(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.TrailAudio=api;}(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 // Original short scores and synthesized scenery; no field recordings or borrowed music.
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
 for(const p of Object.values(PROFILES)){Object.freeze(p.melody);Object.freeze(p.chord);Object.freeze(p.ambience);Object.freeze(p);}Object.freeze(PROFILES);
 const hz=midi=>440*Math.pow(2,(midi-69)/12);
 function profile(id){return PROFILES[id]||null;}
 function score(id){const p=profile(id);if(!p)return [];const beat=60/p.tempo,events=p.melody.map((midi,i)=>({kind:'note',at:i*beat,midi,length:beat*(p.instrument==='air'?1.7:1.1),gain:p.instrument==='bell'?.038:.047,instrument:p.instrument,pan:(i%3-1)*.19,space:p.space}));for(const [i,midi]of p.chord.entries())events.push({kind:'note',at:.08+i*.05,midi,length:beat*7.6,gain:.010,instrument:'air',pan:(i-1)*.22,space:p.space});
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
 function selection({routeId,checkpointId=null,weather='clear',mode='walk'}){if(mode==='silent')return {key:`silent:${routeId}`,silent:true};const p=mode==='photo'?profile(checkpointId):null;const ambience=p?.ambience||({westlake:{kind:'stream',cutoff:1020,gain:.027},maclehose:{kind:'surf',cutoff:780,gain:.034},changping:{kind:'stream',cutoff:1100,gain:.028},mogan:{kind:'bamboo',cutoff:1280,gain:.022}}[routeId])||{kind:routeId==='tiger'?'river':routeId==='aotai'?'snow':'wind',cutoff:routeId==='tiger'?950:routeId==='aotai'?620:430,gain:routeId==='tiger'?.033:.025};return {key:`${mode}:${routeId}:${p?checkpointId:''}:${weather}`,profile:p,ambience:{...ambience,gain:ambience.gain*(weather==='blizzard'?1.3:1)},events:p?score(checkpointId):[]};}
 function create({AudioContext=null,timers=globalThis,onError=()=>{}}={}){let context=null,master=null,reverb=null,reverbGain=null,noiseBuffer=null,enabled=false,currentKey='',group=null,groups=[],suspendTimer=null,disposed=false;
  function cancelSuspend(){if(suspendTimer!==null){timers.clearTimeout?.(suspendTimer);suspendTimer=null;}}
  function disconnect(node){try{node.disconnect();}catch(_){}}
  function disposeGroup(g){if(!g||g.disposed)return;g.disposed=true;for(const v of g.voices){v.source.onended=null;try{v.source.stop();}catch(_){}v.chain.forEach(disconnect);}g.voices.clear();disconnect(g.bus);groups=groups.filter(x=>x!==g);}
  function retire(g,fade=.4){if(!g||g.disposed)return;g.retired=true;const now=context.currentTime;g.bus.gain.cancelScheduledValues(now);g.bus.gain.setValueAtTime(g.bus.gain.value,now);g.bus.gain.linearRampToValueAtTime(0,now+fade);for(const v of g.voices)try{v.source.stop(now+fade+.02);}catch(_){}if(!g.voices.size)disposeGroup(g);}
  function clear(immediate=false){for(const g of [...groups])immediate?disposeGroup(g):retire(g);group=null;currentKey='';}
  function track(g,source,chain){const v={source,chain};g.voices.add(v);source.onended=()=>{chain.forEach(disconnect);g.voices.delete(v);if(g.retired&&!g.voices.size)disposeGroup(g);};return source;}
  function output(g,gain,pan=0,space=0){const chain=[gain];let last=gain;if(context.createStereoPanner){const p=context.createStereoPanner();p.pan.value=pan;gain.connect(p);last=p;chain.push(p);}last.connect(g.bus);if(space&&reverb){const send=context.createGain();send.gain.value=space;last.connect(send);send.connect(reverb);chain.push(send);}return chain;}
  function tone(g,event,base=context.currentTime+.08){const start=base+event.at,length=Math.max(.06,event.length),partials=event.instrument==='bell'?[[1,.72],[2.71,.18],[4.08,.06]]:event.instrument==='air'?[[1,.72],[2,.16],[.5,.10]]:[[1,.78],[2,.17]];for(const [ratio,weight]of partials){const source=context.createOscillator(),gain=context.createGain(),attack=event.instrument==='air'?Math.min(.28,length*.22):.012;source.type=event.instrument==='wood'?'triangle':'sine';source.frequency.setValueAtTime(hz(event.midi)*ratio,start);gain.gain.value=0;gain.gain.setValueAtTime(.0001,start);gain.gain.linearRampToValueAtTime(event.gain*weight,start+attack);if(event.instrument==='air')gain.gain.setValueAtTime(event.gain*weight*.75,start+length*.62);gain.gain.exponentialRampToValueAtTime(.0001,start+length);source.connect(gain);track(g,source,[source,...output(g,gain,event.pan,event.space)]).start(start);source.stop(start+length+.03);}}
  function texture(g,settings,base=context.currentTime+.08,loop=false){const source=context.createBufferSource(),filter=context.createBiquadFilter(),gain=context.createGain(),start=base+(settings.at||0);source.buffer=noiseBuffer;source.loop=loop;filter.type='lowpass';filter.frequency.value=settings.cutoff;filter.Q.value=.6;gain.gain.value=loop?settings.gain:0;if(loop&&settings.kind==='surf'){const swell=context.createOscillator(),depth=context.createGain();swell.type='sine';swell.frequency.value=.14;depth.gain.value=settings.gain*.45;swell.connect(depth);depth.connect(gain.gain);track(g,swell,[swell,depth]).start(start);}
   if(!loop){gain.gain.setValueAtTime(.0001,start);gain.gain.linearRampToValueAtTime(settings.gain,start+.04);gain.gain.exponentialRampToValueAtTime(.0001,start+settings.length);}source.connect(filter);filter.connect(gain);track(g,source,[source,filter,...output(g,gain,0,0)]).start(start);if(!loop)source.stop(start+settings.length+.03);}
  function effect(g,e,base){if(e.kind==='texture'){texture(g,e,base);return;}if(e.kind==='note'){tone(g,e,base);return;}const source=context.createOscillator(),gain=context.createGain(),start=base+e.at,length=e.kind==='chirp'?.28:.09;source.type='sine';source.frequency.setValueAtTime(e.frequency,start);source.frequency.exponentialRampToValueAtTime(e.frequency*(e.kind==='chirp'?1.28:.6),start+length*.65);gain.gain.setValueAtTime(.0001,start);gain.gain.linearRampToValueAtTime(e.kind==='chirp'?.010:.026,start+.015);gain.gain.exponentialRampToValueAtTime(.0001,start+length);source.connect(gain);track(g,source,[source,...output(g,gain,e.pan||0,.12)]).start(start);source.stop(start+length+.02);}
  function init(){if(!AudioContext)throw Error('Web Audio unavailable');context=new AudioContext();master=context.createGain();master.gain.value=.7;const compressor=context.createDynamicsCompressor?.();if(compressor){compressor.threshold.value=-24;compressor.knee.value=20;compressor.ratio.value=4;master.connect(compressor);compressor.connect(context.destination);}else master.connect(context.destination);
   noiseBuffer=context.createBuffer(1,Math.ceil(context.sampleRate*3),context.sampleRate);noiseBuffer.getChannelData(0).set(noise(noiseBuffer.length));if(context.createConvolver){reverb=context.createConvolver();const impulse=context.createBuffer(2,Math.ceil(context.sampleRate*1.6),context.sampleRate);for(let c=0;c<2;c++){const data=impulse.getChannelData(c),raw=noise(data.length,101+c);for(let i=0;i<data.length;i++)data[i]=raw[i]*Math.pow(1-i/data.length,2.4);}reverb.buffer=impulse;reverbGain=context.createGain();reverbGain.gain.value=.13;reverb.connect(reverbGain);reverbGain.connect(master);}
  }
  async function enable(){if(disposed)return false;cancelSuspend();try{if(!context)init();await context.resume();enabled=true;currentKey='';return true;}catch(error){enabled=false;clear(true);onError(error);return false;}}
  function suspendAfter(delay){cancelSuspend();if(timers.setTimeout)suspendTimer=timers.setTimeout(()=>{suspendTimer=null;clear(true);context?.suspend?.().catch?.(onError);},delay);else{clear(true);context?.suspend?.().catch?.(onError);}}
  function setScene(scene){if(!enabled||!context)return false;const next=selection(scene);if(next.key===currentKey)return false;cancelSuspend();if(group)retire(group);group=null;currentKey=next.key;if(next.silent){suspendAfter(480);return true;}context.resume().catch(onError);const bus=context.createGain();bus.gain.setValueAtTime(0,context.currentTime);bus.gain.linearRampToValueAtTime(1,context.currentTime+.55);bus.connect(master);group={bus,voices:new Set(),retired:false,disposed:false};groups.push(group);while(groups.length>3)disposeGroup(groups[0]);texture(group,next.ambience,context.currentTime,true);const base=context.currentTime+.12;for(const e of next.events)e.kind==='note'?tone(group,e,base):effect(group,e,base);return true;}
  function disable(){enabled=false;clear();if(context)suspendAfter(480);}
  function hide(){cancelSuspend();clear(true);context?.suspend?.().catch?.(onError);}
  function step(routeId){if(!enabled||!group||context?.state!=='running'||!currentKey.startsWith('walk:'))return;tone(group,{at:0,midi:routeId==='aotai'?41:48,length:.075,gain:.023,instrument:'wood',pan:0,space:0});}
  function destroy(){disposed=true;enabled=false;cancelSuspend();clear(true);context?.close?.().catch?.(onError);context=null;}
  return {enable,disable,hide,setScene,step,destroy,get enabled(){return enabled;},get key(){return currentKey;},get available(){return !!AudioContext;},get voiceCount(){return groups.reduce((n,g)=>n+g.voices.size,0);},get groupCount(){return groups.length;}};
 }
 return {PROFILES,profile,score,noise,selection,hz,create};
}));
