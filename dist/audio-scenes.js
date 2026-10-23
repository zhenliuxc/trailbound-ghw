(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.TrailAudioScenes=api;}(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const clamp=v=>Math.max(0,Math.min(1,Number.isFinite(v)?v:0));
 const smooth=(a,b,p)=>{const t=clamp((p-a)/(b-a));return t*t*(3-2*t);};
 // These are sound-design palettes, not field recordings of the named places.
 // Water/leaf recordings are combined with shaped air, surf and snow textures.
 const ROUTES={
  wugong:{name:'草甸与山风',kind:'wind',cutoff:820,highpass:130,gain:.020,mod:.15,depth:.32,space:.03,steps:'grass',motif:[62,67,69,74]},
  tiger:{name:'峡谷与远江',kind:'river',cutoff:1300,highpass:90,gain:.024,mod:.09,depth:.16,space:.10,steps:'stone',motif:[55,62,67,74]},
  aotai:{name:'雪粒与脊风',kind:'snow',cutoff:2100,highpass:450,gain:.014,mod:.12,depth:.30,space:.02,steps:'snow',motif:[57,64,69,76]},
  maclehose:{name:'海浪与岸风',kind:'surf',cutoff:2700,highpass:170,gain:.024,mod:.115,depth:.68,space:.02,steps:'sand',motif:[60,65,69,72]},
  changping:{name:'溪谷与林风',kind:'stream',cutoff:1650,highpass:150,gain:.013,mod:.16,depth:.18,space:.08,steps:'earth',motif:[62,65,69,74]},
  mogan:{name:'竹叶与滴水',kind:'bamboo',cutoff:2300,highpass:650,gain:.009,mod:.20,depth:.28,space:.04,steps:'stone',motif:[60,62,67,69]},
  westlake:{name:'浅溪、茶园与村口',kind:'stream',cutoff:1800,highpass:180,gain:.011,mod:.17,depth:.16,space:.03,steps:'stone',motif:[60,64,67,72]}
 };
 const MOMENTS={
  'meadow-bird':{zone:'meadow',cue:'wind',game:'wind'},
  'meadow-butterfly':{zone:'ridge',cue:'wind',game:'clouds'},
  'meadow-flower':{zone:'summit',cue:'paper',game:'puzzle'},
  'wugong-wind-hiker':{zone:'meadow',cue:'camera',game:'greet'},
  'gorge-goat':{zone:'gorge',cue:'air',game:'depth'},
  'gorge-eagle':{zone:'inn',cue:'wood',game:'packing'},
  'gorge-sparkle':{zone:'waterfall',cue:'water',game:'score'},
  'tiger-bell-first':{zone:'trail',cue:'bell',game:'bells'},
  'tiger-28-bends-v1':{zone:'high-road',cue:'stone',game:'tiger-climb'},
  'tiger-halfway-view-v1':{zone:'inn',cue:'air',game:'tiger-rest'},
  'tiger-longdong-passage-v1':{zone:'waterfall',cue:'water',game:'tiger-passage'},
  'tiger-middle-river-frame-v1':{zone:'river-close',cue:'camera',game:'tiger-river'},
  'tiger-bends-puzzle-v4':{zone:'high-road',cue:'stone',game:'tiger-climb'},
  'tiger-inn-pairs-v4':{zone:'inn',cue:'paper',game:'tiger-rest'},
  'tiger-waterfall-paint-v4':{zone:'waterfall',cue:'water',game:'tiger-passage'},
  'tiger-river-roundframe-v4':{zone:'river-close',cue:'camera',game:'tiger-river'},
  'snow-tracks':{zone:'rocks',cue:'stone'},
  'snow-lichen':{zone:'ridge',cue:'snow'},
  'snow-light':{zone:'peak',cue:'air'},
  'aotai-takin-first':{zone:'snow',cue:'snow'},
  'aotai-camp-night':{zone:'camp',cue:'snow'},
  'coast-sand':{zone:'bay',cue:'surf'},
  'coast-shell':{zone:'beach',cue:'sand'},
  'coast-pier':{zone:'harbour',cue:'water'},
  'maclehose-sideways-crab':{zone:'beach',cue:'sand'},
  'valley-moss':{zone:'pools',cue:'water'},
  'valley-bridge':{zone:'creek',cue:'stone'},
  'valley-reflection':{zone:'meadow',cue:'air'},
  'bamboo-drop':{zone:'bamboo',cue:'bamboo',game:'rain'},
  'bamboo-step':{zone:'path',cue:'stone',game:'footsteps'},
  'bamboo-leaf':{zone:'forest',cue:'leaf',game:'sling'},
  'westlake-stones':{zone:'creek',cue:'water'},
  'westlake-floating-leaf':{zone:'creek',cue:'water',game:'creek'},
  'westlake-tea':{zone:'tea',cue:'leaf',game:'match'},
  'westlake-leaf-shadow':{zone:'tea',cue:'leaf'},
  'westlake-eaves':{zone:'village',cue:'tea'},
  'westlake-basket':{zone:'village',cue:'tea'},
  'westlake-five-more-minutes':{zone:'village',cue:'tea'}
 };
 const TIGER_GAME_ZONES={'tiger-climb':'high-road','tiger-rest':'inn','tiger-passage':'waterfall','tiger-river':'river-close'};
 const CHECKPOINTS={
  'wugong-meadow':'meadow','wugong-clouds':'ridge','wugong-golden':'summit',
  'tiger-trail':'trail','tiger-gorge':'gorge','tiger-halfway':'inn',
  'aotai-aoshan':'rocks','aotai-ridge':'ridge','aotai-taibai':'peak',
  'maclehose-saiwan':'beach','maclehose-hamtin':'bay','maclehose-chekkeng':'harbour',
  'changping-forest':'forest','changping-valley':'creek','changping-meadow':'meadow',
  'mogan-bamboo':'bamboo','mogan-path':'path','mogan-stream':'creek',
  'westlake-creek':'creek','westlake-path':'tea','westlake-tea':'village'
 };
 function zoneFor(route,progress){return ({wugong:progress<.36?'meadow':progress<.80?'ridge':'summit',tiger:progress<.3?'trail':progress<.72?'gorge':'inn',aotai:progress<.35?'rocks':progress<.8?'ridge':'peak',maclehose:progress<.37?'beach':progress<.75?'bay':'harbour',changping:progress<.34?'forest':progress<.73?'creek':'meadow',mogan:progress<.37?'bamboo':progress<.73?'path':'creek',westlake:progress<.4?'creek':progress<.8?'tea':'village'})[route]||'meadow';}
 function westlakeMix(progress=0){const tea=smooth(.38,.70,progress),village=smooth(.80,.96,progress);return {creek:(.42*(1-tea)+.035)*(1-.95*village),leaves:(.09+.13*tea)*(1-.68*village),drips:.025*village};}
 function routeMix(route,progress,zone){
  if(route==='westlake')return westlakeMix(zone==='creek'?.2:zone==='tea'?.65:zone==='village'?.98:progress);
  if(route==='wugong')return {leaves:zone==='meadow'?.21:zone==='ridge'?.10:.055};
  if(route==='tiger')return {creek:zone==='river-close'?.46:zone==='waterfall'?.39:zone==='gorge'?.27:zone==='inn'?.09:.15,leaves:zone==='river-close'?.008:zone==='inn'?.055:.025};
  if(route==='aotai')return {leaves:zone==='rocks'?.065:.035};
  if(route==='maclehose')return {creek:zone==='harbour'?.09:zone==='beach'?.17:.12,leaves:zone==='bay'?.065:.025};
  if(route==='changping')return {creek:zone==='creek'?.27:zone==='pools'?.19:.12,leaves:zone==='meadow'?.085:.17};
  return {leaves:zone==='bamboo'?.19:zone==='forest'?.20:.12,drips:zone==='creek'?.14:.07};
 }
 function landscape({routeId='wugong',checkpointId=null,progress=0,momentGame=null,momentId=null,mode='walk',weather='clear',riverApproach=1,gorgeOpenness=0}={}){
  const base=ROUTES[routeId]||ROUTES.wugong,entry=MOMENTS[momentId],game=momentGame||entry?.game;
  const zone=(routeId==='tiger'&&TIGER_GAME_ZONES[game])||CHECKPOINTS[checkpointId]||entry?.zone||zoneFor(routeId,clamp(progress));
  const mix=routeMix(routeId,progress,zone),recording={},layers=[{...base,id:'landscape'}];
  if(routeId==='westlake'&&!checkpointId&&!entry)Object.assign(mix,westlakeMix(progress));
  // The same licensed recording can sit at different distances, without fetching duplicate files.
  recording.creek={cutoff:routeId==='tiger'?zone==='waterfall'?3200:950:routeId==='maclehose'?1600:2600,highpass:routeId==='tiger'?75:170,rate:routeId==='tiger'?.84:routeId==='maclehose'?.76:1,pan:routeId==='tiger'?-.16:.08,mod:routeId==='maclehose'?.115:0,depth:zone==='harbour'?.25:.60};
  recording.leaves={cutoff:routeId==='aotai'?1250:routeId==='wugong'?1900:3500,highpass:routeId==='aotai'?200:450,rate:routeId==='aotai'?.75:routeId==='wugong'?.92:1,pan:-.12};
  recording.drips={cutoff:3700,highpass:200,rate:.97,pan:.16};
  if(routeId==='wugong'){layers[0].gain*=(zone==='ridge'?1.15:zone==='summit'?1.30:.80)*.22;layers[0].cutoff=zone==='meadow'?1200:700;}
  if(routeId==='mogan')layers[0].gain*=.30;
  if(routeId==='tiger'&&zone==='waterfall')layers[0]={...layers[0],kind:'spray',cutoff:4200,highpass:550,gain:.027};
  if(routeId==='tiger'&&zone==='high-road'){
   // The picture and the sound share one openness value. The rock shoulder
   // muffles the existing CC0 stream; walking clear reveals its upper detail.
   // These reused recordings are not field recordings of Tiger Leaping Gorge.
   const open=clamp(gorgeOpenness);mix.creek=.045+.155*open;mix.leaves=.050-.022*open;
   recording.creek={...recording.creek,cutoff:430+1220*open,highpass:75,pan:.22-.12*open,mod:.075,depth:.11};
   recording.leaves={...recording.leaves,cutoff:2400,highpass:500,pan:-.24};
   layers[0]={...layers[0],kind:'wind',cutoff:780+360*open,highpass:150,gain:.007+.003*open,mod:.10,depth:.24,space:.07};
  }
  if(routeId==='tiger'&&zone==='inn')layers[0]={...layers[0],cutoff:650,highpass:100,gain:.011,space:.045};
  if(routeId==='tiger'&&zone==='river-close'){
   // The existing CC0 stream recording is sound-design material, not Jinsha field audio.
   // Opening its spectrum and bringing it to the centre expresses the descent in scale.
   const approach=clamp(riverApproach);
   mix.creek=.17+.29*approach;mix.leaves=.025-.017*approach;
   recording.creek={cutoff:1050+3150*approach,highpass:70,rate:.84+.10*approach,pan:0,mod:.075,depth:.10};
   layers[0]={...layers[0],cutoff:1100+2100*approach,highpass:65,gain:.019+.013*approach,mod:.075,depth:.12,space:.08};
  }
  if(routeId==='maclehose'&&zone==='harbour')layers[0]={...layers[0],cutoff:1200,gain:.012,depth:.27,mod:.19};
  if(routeId==='changping'&&zone==='meadow')layers[0]={...layers[0],kind:'wind',gain:.012,cutoff:900};
  if(routeId==='westlake'&&zone!=='creek')layers[0]={...layers[0],kind:'leaves',cutoff:2000,highpass:600,gain:.006};
  if(game==='match'){mix.creek=.025;mix.leaves=.13;mix.drips=0;layers[0].gain*=.5;}
  if(game==='puzzle'){mix.leaves=.035;layers[0].gain*=.50;}
  if(game==='greet'){mix.leaves=.13;layers[0].gain*=.65;}
  if(game==='clouds'){mix.leaves=.07;layers[0].gain*=.85;}
  if(game==='creek'){mix.creek=.31;mix.leaves=.055;mix.drips=0;}
  if(game==='rain'){mix.leaves=.13;mix.drips=.065;layers[0].gain*=.65;}
  if(game==='footsteps'){mix.leaves=.105;mix.drips=.035;layers[0].gain*=.55;}
  if(game==='sling'){mix.leaves=.16;mix.drips=.025;}
  if(['rain','storm'].includes(weather)){
   layers.push({id:'weather',kind:'rain',highpass:1500,cutoff:6000,gain:weather==='storm'?.018:.009,mod:.27,depth:.13,space:0});
   mix.drips=Math.max(mix.drips||0,routeId==='mogan'?.12:routeId==='westlake'?.065:.025);
  }else if(weather==='snow'||weather==='blizzard')layers.push({id:'weather',kind:'snow',highpass:2100,cutoff:5600,gain:weather==='blizzard'?.013:.005,mod:.23,depth:.35,space:0});
  if(weather==='wind'||weather==='blizzard'){layers[0].gain*=1.18;layers[0].depth=Math.min(.7,layers[0].depth+.12);}
  if(routeId==='aotai'&&momentId==='aotai-takin-first'){mix.leaves=.025;mix.drips=0;layers[0].gain*=.45;}
  const scale=mode==='reward'?.36:mode==='choice'?.72:1;
  for(const id of Object.keys(mix))mix[id]*=scale;
  for(const layer of layers)layer.gain*=scale;
  let steps=base.steps;if(routeId==='maclehose'&&zone==='harbour')steps='wood';else if(routeId==='maclehose'&&zone==='bay')steps='earth';else if(routeId==='wugong'&&zone==='summit')steps='stone';
  return {name:zone==='river-close'?'江边的近水声':base.name,zone,game,cue:entry?.cue||'air',mix,recording,layers,steps,motif:base.motif,ambience:layers[0],weather};
 }
 function momentMix(routeId,game=null){return landscape({routeId,momentGame:game,mode:'moment'}).mix;}
 for(const item of Object.values(ROUTES)){Object.freeze(item.motif);Object.freeze(item);}for(const item of Object.values(MOMENTS))Object.freeze(item);
 return {ROUTES:Object.freeze(ROUTES),MOMENTS:Object.freeze(MOMENTS),CHECKPOINTS:Object.freeze(CHECKPOINTS),landscape,momentMix,westlakeMix,zoneFor};
}));
