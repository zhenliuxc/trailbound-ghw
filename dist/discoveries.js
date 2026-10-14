(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.TrailDiscoveries=api;}(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const KEY='trailbound.field-journal.v1';
 // Travel moments belong to a landscape, rather than to its photo checkpoints.
 // Keep the original IDs and storage key so earlier notebooks can be migrated.
 const CATALOG=[
  {id:'meadow-bird',route:'wugong',order:0,at:.055,place:'武功山 · 草甸风口',name:'一只小鸟掠过草尖',hint:'它停了一下，又顺着风飞走了。',memory:'草甸的风吹过来，一只小鸟从草尖掠过。我没有追它，只看着它飞向山脊。',icon:'bird'},
  {id:'meadow-butterfly',route:'wugong',order:1,at:.325,place:'武功山 · 开阔草脊',name:'一片云擦过山脊',hint:'云影慢慢移过草坡，山像轻轻呼吸了一次。',memory:'一片云从山脊边擦过去。脚边的草先暗下来，又一点点亮了起来。',icon:'cloud'},
  {id:'meadow-flower',route:'wugong',order:2,at:.725,place:'武功山 · 向阳草坡',name:'草坡亮起来的那一刻',hint:'停半步，看光怎样铺到远处的草坡上。',memory:'阳光从云缝落下来，把整片草坡照成了温暖的绿色。那一刻，我忘了还有多远。',icon:'sun'},
  {id:'gorge-goat',route:'tiger',order:0,at:.055,place:'虎跳峡 · 高路转弯处',name:'转角遇见一只山羊',hint:'它站在路边，安静地看了你一眼。',memory:'高路的转弯处，一只山羊抬头看了我一眼。我放轻脚步，把这次短短的相遇留在了峡谷里。',icon:'goat'},
  {id:'gorge-eagle',route:'tiger',order:1,at:.325,place:'虎跳峡 · 临江山壁',name:'一只飞鸟越过江谷',hint:'江声很远，它的影子轻轻越过山壁。',memory:'一只飞鸟顺着山壁越过江谷。金沙江的声音从下面传来，我抬头看了好一会儿。',icon:'eagle'},
  {id:'gorge-sparkle',route:'tiger',order:2,at:.77,place:'虎跳峡 · 金沙江上方',name:'江面闪了一下',hint:'雨后的光落在江面，像一枚小小的银片。',memory:'雨后的光落进金沙江，江面忽然闪了一下。只是一瞬，我却想把它记住。',icon:'sparkle'},
  {id:'snow-tracks',route:'aotai',order:0,at:.055,place:'秦岭 · 薄雪林缘',name:'薄雪里的一串小脚印',hint:'脚印在林边拐了个弯，不知道是谁留下的。',memory:'林边的薄雪里有一串小脚印。我没有跟过去，只觉得这片安静的山也住着别的旅人。',icon:'tracks'},
  {id:'snow-lichen',route:'aotai',order:1,at:.325,place:'秦岭 · 岩脊旁',name:'岩石上的一小片绿',hint:'灰色石面上，有一点贴得很近的绿色。',memory:'在灰色岩脊旁，我看见石面上一小片绿色。走近一点才发现，山里的细小生命也很认真。',icon:'lichen'},
  {id:'snow-light',route:'aotai',order:2,at:.895,place:'太白山区域 · 开阔石海',name:'云缝里的一抹阳光',hint:'云散开一点，光落在雪斑和岩石上。',memory:'风雪之后，云缝里落下一抹阳光。雪斑和岩石都亮了起来，我也慢慢松开了肩膀。',icon:'sun'}
 ];
 const ids=new Set(CATALOG.map(x=>x.id));
 function clean(values){return Array.isArray(values)?[...new Set(values.filter(x=>typeof x==='string'&&ids.has(x)))]:[];}
 function item(id){return CATALOG.find(x=>x.id===id);}
 function create(route,seed=Math.random()*4294967296){let value=Number(seed)>>>0;const random=()=>{value=(Math.imul(value,1664525)+1013904223)>>>0;return value/4294967296;};const pool=CATALOG.filter(x=>x.route===route).sort((a,b)=>a.order-b.order);
  return {route,seed:Number(seed)>>>0,found:[],slots:pool.map((x,i)=>{const at=x.at+random()*(i===2&&route==='aotai'?.01:.025);return {id:x.id,at,until:Math.min(.97,at+.16),side:random()<.5?-1:1};})};
 }
 function visible(state,trip){if(!['walking','paused'].includes(state.status))return null;return trip.slots.find(x=>state.progress>=x.at&&state.progress<=x.until&&!trip.found.includes(x.id))||null;}
 function capture(state,trip,id){const active=visible(state,trip);return active?.id===id?{...trip,found:[...trip.found,id]}:trip;}
 function load(storage){try{const data=JSON.parse(storage?.getItem(KEY)||'null');return data?.version===1?clean(data.found):data?.version===2?clean(cleanMoments(data.moments).map(m=>m.id)):[];}catch(_){return [];}}
 function save(storage,found){try{if(!storage?.setItem)return false;storage.setItem(KEY,JSON.stringify({version:1,found:clean(found)}));return true;}catch(_){return false;}}
 const MAX_MOMENTS=120,WEATHER=new Set(['clear','wind','fog','rain','snow','blizzard']);
 const finite=(value,min,max)=>Number.isFinite(value)?Math.max(min,Math.min(max,value)):null;
 function moment(state,trip,id,{weather=null,now=Date.now()}={}){
  const entry=item(id);if(!entry||entry.route!==trip.route||!trip.found.includes(id))return null;
  return {key:`${now}-${trip.seed}-${id}`,id,route:entry.route,place:entry.place,title:entry.name,memory:entry.memory,icon:entry.icon,progress:finite(state.progress,0,1),elapsed:finite(state.elapsed,0,86400),weather:WEATHER.has(weather)?weather:null,createdAt:finite(now,0,8640000000000000),legacy:false};
 }
 function cleanMoments(values){
  if(!Array.isArray(values))return [];const keys=new Set(),out=[];
  for(const value of values){const entry=item(value?.id);if(!entry||value.route!==entry.route||typeof value.key!=='string'||!value.key||value.key.length>100||keys.has(value.key))continue;keys.add(value.key);
   const text=(name,fallback,max)=>typeof value[name]==='string'&&value[name].trim()?value[name].slice(0,max):fallback;
   out.push({key:value.key,id:entry.id,route:entry.route,place:text('place',entry.place,80),title:text('title',entry.name,80),memory:text('memory',entry.memory,400),icon:entry.icon,progress:finite(value.progress,0,1),elapsed:finite(value.elapsed,0,86400),weather:WEATHER.has(value.weather)?value.weather:null,createdAt:finite(value.createdAt,0,8640000000000000),legacy:!!value.legacy});
  }return out.slice(-MAX_MOMENTS);
 }
 function loadMoments(storage){try{const data=JSON.parse(storage?.getItem(KEY)||'null');if(data?.version===2)return cleanMoments(data.moments);if(data?.version===1)return clean(data.found).map(id=>{const entry=item(id);return {key:'legacy-'+id,id,route:entry.route,place:entry.place.split(' · ')[0],title:'从旧手帐带来的一页',memory:'这是以前在这段路线保存的回忆。新的旅途瞬间会记下当时的风景与心情。',icon:entry.icon,progress:null,elapsed:null,weather:null,createdAt:null,legacy:true};});return [];}catch(_){return [];}}
 function saveMoments(storage,moments){try{if(!storage?.setItem)return false;storage.setItem(KEY,JSON.stringify({version:2,moments:cleanMoments(moments)}));return true;}catch(_){return false;}}
 return {KEY,CATALOG,item,clean,create,visible,capture,load,save,MAX_MOMENTS,moment,cleanMoments,loadMoments,saveMoments};

}));
