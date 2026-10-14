(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.TrailDiscoveries=api;}(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const KEY='trailbound.field-journal.v1';
 // Local landscape topics. Legacy IDs retain browser journal compatibility; they do not claim exact visits.
 const CATALOG=[
  {
    "id": "meadow-bird",
    "route": "wugong",
    "order": 0,
    "checkpointId": "wugong-meadow",
    "name": "武功山 · 山脊草甸",
    "hint": "看开阔草坡和树林之间的边界。",
    "memory": "在武功山记下高山草甸与森林的边界。",
    "icon": "place:wugong-meadow"
  },
  {
    "id": "meadow-butterfly",
    "route": "wugong",
    "order": 1,
    "checkpointId": "wugong-clouds",
    "name": "武功山 · 云海变化",
    "hint": "看看远山怎样藏进云里，又露出来。",
    "memory": "在武功山观察云海怎样改变远山的轮廓。",
    "icon": "place:wugong-clouds"
  },
  {
    "id": "meadow-flower",
    "route": "wugong",
    "order": 2,
    "checkpointId": "wugong-golden",
    "name": "武功山 · 罗霄群峰",
    "hint": "从眼前草脊看向更远的峰群。",
    "memory": "在武功山把一层层山脊与罗霄山脉连了起来。",
    "icon": "place:wugong-golden"
  },
  {
    "id": "gorge-goat",
    "route": "tiger",
    "order": 0,
    "checkpointId": "tiger-trail",
    "name": "虎跳峡 · 高路与深谷",
    "hint": "对照山径的位置和谷底的江流。",
    "memory": "在虎跳峡留意高路与谷底江流之间的高差。",
    "icon": "place:tiger-trail"
  },
  {
    "id": "gorge-eagle",
    "route": "tiger",
    "order": 1,
    "checkpointId": "tiger-gorge",
    "name": "虎跳峡 · 两山夹江",
    "hint": "从江流抬头，看两侧高山与陡坡。",
    "memory": "在虎跳峡认识两侧高山与金沙江形成的整体。",
    "icon": "place:tiger-gorge"
  },
  {
    "id": "gorge-sparkle",
    "route": "tiger",
    "order": 2,
    "checkpointId": "tiger-halfway",
    "name": "虎跳峡 · 山村与路标",
    "hint": "看看山坡上的屋舍和路标怎样相连。",
    "memory": "在虎跳峡把山村生活也收进了山地风景。",
    "icon": "place:tiger-halfway"
  },
  {
    "id": "snow-tracks",
    "route": "aotai",
    "order": 0,
    "checkpointId": "aotai-aoshan",
    "name": "秦岭 · 林带变化",
    "hint": "比较低处树冠与高处开阔地。",
    "memory": "在秦岭留意随高度变化的森林、灌丛与开阔地。",
    "icon": "place:aotai-aoshan"
  },
  {
    "id": "snow-lichen",
    "route": "aotai",
    "order": 1,
    "checkpointId": "aotai-ridge",
    "name": "秦岭 · 岩面的地衣",
    "hint": "灰色裸岩上也有值得观察的色块。",
    "memory": "在秦岭岩石主题便笺里认识了地衣与苔藓的区别。",
    "icon": "place:aotai-ridge"
  },
  {
    "id": "snow-light",
    "route": "aotai",
    "order": 2,
    "checkpointId": "aotai-taibai",
    "name": "太白山 · 石海与古冰川",
    "hint": "看看裸岩、碎石与雪斑之间的层次。",
    "memory": "在太白山区域便笺里认识了石海和古冰川遗迹。",
    "icon": "place:aotai-taibai"
  }
];
 const ids=new Set(CATALOG.map(x=>x.id));
 function clean(values){return Array.isArray(values)?[...new Set(values.filter(x=>typeof x==='string'&&ids.has(x)))]:[];}
 function item(id){return CATALOG.find(x=>x.id===id);}
 function create(route,seed=Math.random()*4294967296){let value=Number(seed)>>>0;const random=()=>{value=(Math.imul(value,1664525)+1013904223)>>>0;return value/4294967296;};const pool=CATALOG.filter(x=>x.route===route).sort((a,b)=>a.order-b.order);
  return {route,found:[],slots:pool.map((x,i)=>{const at=[.055,.325,.725][i]+random()*.025;return {id:x.id,at,until:Math.min(.97,at+.16),side:random()<.5?-1:1};})};
 }
 function visible(state,trip){if(!['walking','paused'].includes(state.status))return null;return trip.slots.find(x=>state.progress>=x.at&&state.progress<=x.until&&!trip.found.includes(x.id))||null;}
 function capture(state,trip,id){const active=visible(state,trip);return active?.id===id?{...trip,found:[...trip.found,id]}:trip;}
 function load(storage){try{const data=JSON.parse(storage?.getItem(KEY)||'null');return data?.version===1?clean(data.found):[];}catch(_){return [];}}
 function save(storage,found){try{if(!storage?.setItem)return false;storage.setItem(KEY,JSON.stringify({version:1,found:clean(found)}));return true;}catch(_){return false;}}
 return {KEY,CATALOG,item,clean,create,visible,capture,load,save};
}));
