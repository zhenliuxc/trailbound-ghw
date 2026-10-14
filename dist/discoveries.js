(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.TrailDiscoveries=api;}(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const KEY='trailbound.field-journal.v1';
 // Fictional illustrated observations, not a record of species at real coordinates.
 const CATALOG=[
  {id:'meadow-bird',route:'wugong',icon:'bird',name:'草甸里的小鸟',hint:'草叶里，有个小家伙探出了头。',memory:'看见小鸟从草叶里探头，又跳回风里。'},
  {id:'meadow-butterfly',route:'wugong',icon:'butterfly',name:'随风的蝴蝶',hint:'一对小小的翅膀，跟着风打了个转。',memory:'一只蝴蝶在路边打转，陪我走了一小段。'},
  {id:'meadow-flower',route:'wugong',icon:'flower',name:'路边的一朵花',hint:'不起眼的草丛里，开着一朵小花。',memory:'在路边认出一朵小花，没有摘下它。'},
  {id:'gorge-goat',route:'tiger',icon:'goat',name:'坡上的山羊',hint:'山坡上，有个身影比你走得还轻快。',memory:'看见山羊站在坡上，像个熟悉山路的向导。'},
  {id:'gorge-eagle',route:'tiger',icon:'eagle',name:'盘旋的飞鸟',hint:'抬头，有只鸟借着峡谷的风盘旋。',memory:'望着飞鸟在峡谷上方盘旋，忽然不想赶路。'},
  {id:'gorge-sparkle',route:'tiger',icon:'sparkle',name:'水光的一瞬',hint:'江流上，一小片光忽然亮了。',memory:'记住江流上闪过的一片光，转眼又换了模样。'},
  {id:'snow-tracks',route:'aotai',icon:'tracks',name:'雪上的脚印',hint:'雪地里，留下了一串小小的脚印。',memory:'留意到雪上的小脚印，没有离开山径去追。'},
  {id:'snow-light',route:'aotai',icon:'sun',name:'云隙里的光',hint:'云层打开一道缝，光落在白色山脊上。',memory:'在风雪间看见一束光，给今天留了一个亮点。'},
  {id:'snow-lichen',route:'aotai',icon:'lichen',name:'石上的苔痕',hint:'白雪边的一块石头上，藏着一点绿。',memory:'在石面上发现一小片苔痕，山里还有这样的颜色。'}
 ];
 const ids=new Set(CATALOG.map(x=>x.id));
 function clean(values){return Array.isArray(values)?[...new Set(values.filter(x=>typeof x==='string'&&ids.has(x)))]:[];}
 function item(id){return CATALOG.find(x=>x.id===id);}
 function create(route,seed=Math.random()*4294967296){let value=Number(seed)>>>0;const random=()=>{value=(Math.imul(value,1664525)+1013904223)>>>0;return value/4294967296;};const pool=CATALOG.filter(x=>x.route===(route==='training'?'wugong':route));for(let i=pool.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}
  return {route,found:[],slots:pool.map((x,i)=>{const at=[.055,.325,.725][i]+random()*.025;return {id:x.id,at,until:Math.min(.97,at+.16),side:random()<.5?-1:1};})};
 }
 function visible(state,trip){if(!['walking','paused'].includes(state.status))return null;return trip.slots.find(x=>state.progress>=x.at&&state.progress<=x.until&&!trip.found.includes(x.id))||null;}
 function capture(state,trip,id){const active=visible(state,trip);return active?.id===id?{...trip,found:[...trip.found,id]}:trip;}
 function load(storage){try{const data=JSON.parse(storage?.getItem(KEY)||'null');return data?.version===1?clean(data.found):[];}catch(_){return [];}}
 function save(storage,found){try{if(!storage?.setItem)return false;storage.setItem(KEY,JSON.stringify({version:1,found:clean(found)}));return true;}catch(_){return false;}}
 return {KEY,CATALOG,item,clean,create,visible,capture,load,save};
}));
