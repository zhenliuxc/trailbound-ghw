(function(root,factory){const api=factory(typeof module==='object'&&module.exports?require('./route-moments.js'):root.TrailRouteMoments);if(typeof module==='object'&&module.exports)module.exports=api;else root.TrailDiscoveries=api;}(typeof globalThis!=='undefined'?globalThis:this,function(R){
 'use strict';
 const KEY='trailbound.field-journal.v1';
 // Travel moments belong to a landscape, rather than to its photo checkpoints.
 // Keep the original IDs and storage key so earlier notebooks can be migrated.
 const CATALOG=[
  {id:'meadow-bird',route:'wugong',order:0,at:.275,place:'武功山 · 草甸风口',name:'一只小鸟掠过草尖',hint:'它停了一下，又顺着风飞走了。',memory:'草甸的风吹过来，一只小鸟从草尖掠过。我没有追它，只看着它飞向山脊。',icon:'bird'},
  {id:'meadow-butterfly',route:'wugong',order:1,at:.52,place:'武功山 · 开阔草脊',name:'一片云擦过山脊',hint:'云影慢慢移过草坡，山像轻轻呼吸了一次。',memory:'一片云从山脊边擦过去。脚边的草先暗下来，又一点点亮了起来。',icon:'cloud'},
  {id:'meadow-flower',route:'wugong',order:2,at:.88,place:'武功山 · 向阳草坡',name:'草坡亮起来的那一刻',hint:'停半步，看光怎样铺到远处的草坡上。',memory:'阳光从云缝落下来，把整片草坡照成了温暖的绿色。那一刻，我忘了还有多远。',icon:'sun'},
  {id:'gorge-goat',route:'tiger',order:0,at:.055,place:'虎跳峡 · 高路转弯处',name:'转角遇见一只山羊',hint:'它站在路边，安静地看了你一眼。',memory:'高路的转弯处，一只山羊抬头看了我一眼。我放轻脚步，把这次短短的相遇留在了峡谷里。',icon:'goat'},
  {id:'gorge-eagle',route:'tiger',order:1,at:.325,place:'虎跳峡 · 临江山壁',name:'一只飞鸟越过江谷',hint:'江声很远，它的影子轻轻越过山壁。',memory:'一只飞鸟顺着山壁越过江谷。金沙江的声音从下面传来，我抬头看了好一会儿。',icon:'eagle'},
  {id:'gorge-sparkle',route:'tiger',order:2,at:.77,place:'虎跳峡 · 金沙江上方',name:'江面闪了一下',hint:'雨后的光落在江面，像一枚小小的银片。',memory:'雨后的光落进金沙江，江面忽然闪了一下。只是一瞬，我却想把它记住。',icon:'sparkle'},
  {id:'snow-tracks',route:'aotai',order:0,at:.055,place:'秦岭 · 薄雪林缘',name:'薄雪里的一串小脚印',hint:'脚印在林边拐了个弯，不知道是谁留下的。',memory:'林边的薄雪里有一串小脚印。我没有跟过去，只觉得这片安静的山也住着别的旅人。',icon:'tracks'},
  {id:'snow-lichen',route:'aotai',order:1,at:.325,place:'秦岭 · 岩脊旁',name:'岩石上的一小片绿',hint:'灰色石面上，有一点贴得很近的绿色。',memory:'在灰色岩脊旁，我看见石面上一小片绿色。走近一点才发现，山里的细小生命也很认真。',icon:'lichen'},
  {id:'snow-light',route:'aotai',order:2,at:.895,place:'太白山区域 · 开阔石海',name:'云缝里的一抹阳光',hint:'云散开一点，光落在雪斑和岩石上。',memory:'风雪之后，云缝里落下一抹阳光。雪斑和岩石都亮了起来，我也慢慢松开了肩膀。',icon:'sun'}
 ];
 CATALOG.push(...[
  {
    "id": "coast-sand",
    "route": "maclehose",
    "order": 0,
    "at": 0.39,
    "place": "麦理浩径 · 西湾沙滩",
    "name": "潮水画下的一条线",
    "hint": "浪退下去，沙滩留下了一条细细的弧线。",
    "memory": "潮水从西湾的沙滩退下去，留了一条细细的线。我看着下一道浪把它慢慢改写。",
    "icon": "tide"
  },
  {
    "id": "coast-shell",
    "route": "maclehose",
    "order": 1,
    "at": 0.55,
    "place": "麦理浩径 · 咸田海湾",
    "name": "一枚留在沙上的贝壳",
    "hint": "它还留在原地，等下一道浪。",
    "memory": "咸田湾的湿沙上躺着一枚小贝壳。我把它留在原处，只把这一眼收进了手帐。",
    "icon": "shell"
  },
  {
    "id": "coast-pier",
    "route": "maclehose",
    "order": 2,
    "at": 0.84,
    "place": "麦理浩径 · 赤径海湾",
    "name": "渡头下的倒影",
    "hint": "小渡头和远山，在水里又出现了一次。",
    "memory": "走到赤径海湾时，水很平。小渡头下面还有一座倒着的山，随着细细的波纹轻轻晃。",
    "icon": "pier"
  },
  {
    "id": "valley-moss",
    "route": "changping",
    "order": 0,
    "at": 0.055,
    "place": "长坪沟 · 林间栈道",
    "name": "老树枝上的绒绒绿",
    "hint": "苔藓沿着老树枝，铺出一小段绿色。",
    "memory": "长坪沟的栈道边，一根老树枝上长满绒绒的苔藓。它静静躺在林子里，让我也放轻了脚步。",
    "icon": "moss"
  },
  {
    "id": "valley-bridge",
    "route": "changping",
    "order": 1,
    "at": 0.325,
    "place": "长坪沟 · 溪边木道",
    "name": "跨过水声的一小段木板",
    "hint": "水从木板下面经过，声音没有停。",
    "memory": "林间木道跨过了长坪沟的一段小溪。我踩过去时，脚步在上面，水声在下面。",
    "icon": "bridge"
  },
  {
    "id": "valley-reflection",
    "route": "changping",
    "order": 2,
    "at": 0.77,
    "place": "长坪沟 · 木骡子附近",
    "name": "水里还有一座远山",
    "hint": "溪水转弯处，远山的轮廓倒了过来。",
    "memory": "木骡子附近，溪水在草甸边转了个弯。远山的轮廓落进水里，我站着看它轻轻散开。",
    "icon": "reflection"
  },
  {
    "id": "bamboo-drop",
    "route": "mogan",
    "order": 0,
    "at": 0.055,
    "place": "莫干山 · 莫干岭竹林",
    "name": "竹叶尖上的一滴雨",
    "hint": "叶尖弯下来，好像正托住一点重量。",
    "memory": "雨后的莫干岭古道，一片竹叶尖托着小小的水滴。我停半步，看它把整个竹林缩进一点亮里。",
    "icon": "drop"
  },
  {
    "id": "bamboo-step",
    "route": "mogan",
    "order": 1,
    "at": 0.325,
    "place": "莫干山 · 古道石阶",
    "name": "石阶拐弯的地方",
    "hint": "石缝里有苔藓，转角还藏着下一段路。",
    "memory": "莫干岭的旧石阶拐了个弯。石缝里的苔藓很软，脚下的路却被很多脚步磨得平滑。",
    "icon": "steps"
  },
  {
    "id": "bamboo-leaf",
    "route": "mogan",
    "order": 2,
    "at": 0.77,
    "place": "莫干山 · 大坑侧溪边",
    "name": "一片竹叶落在石上",
    "hint": "叶子很轻，溪水从旁边过去。",
    "memory": "走到莫干山的溪边，一片竹叶轻轻落在石头上。水一直流，叶子却安安静静留在那里。",
    "icon": "leaf"
  }
]);
 CATALOG.push(...[
  {
    "id": "westlake-stones",
    "route": "westlake",
    "order": 0,
    "at": 0.055,
    "place": "西湖 · 九溪溪谷",
    "name": "水绕过石头的一小圈",
    "hint": "水在灰色石头旁，绕出了细细的波纹。",
    "memory": "九溪的浅水绕过一块灰色石头，打了一个很小的转。我站在石径上，听见这几步路有自己的声音。",
    "icon": "stones"
  },
  {
    "id": "westlake-tea",
    "route": "westlake",
    "order": 1,
    "at": 0.66,
    "place": "西湖 · 龙井茶园",
    "name": "茶树尖的一点新绿",
    "hint": "一小片新叶，比旁边的叶子亮一些。",
    "memory": "走到龙井茶园边，茶树尖的一小片新叶，比整片茶山更先留住了我的目光。它正在慢慢展开。",
    "icon": "tea"
  },
  {
    "id": "westlake-eaves",
    "route": "westlake",
    "order": 2,
    "at": 0.895,
    "place": "西湖 · 龙井村口",
    "name": "屋檐下的一小段安静",
    "hint": "瓦片的影子，轻轻铺在村里的石路上。",
    "memory": "龙井村口，一段灰瓦屋檐把影子铺在石路上。墙边有一张小竹凳，我忽然很想在这里坐一会儿。",
    "icon": "eaves"
  }
]);
 CATALOG.push(
  {id:'westlake-floating-leaf',route:'westlake',order:0,at:.055,place:'西湖 · 九溪溪谷',name:'石头旁打转的一片落叶',hint:'那片叶子绕了好久，还没转过石头。',memory:'九溪的水绕过石头，一片落叶慢慢打转。我看了一会儿，水声把脚步也放轻了。',icon:'leaf',interaction:'ripple'},
  {id:'westlake-leaf-shadow',route:'westlake',order:1,at:.66,place:'西湖 · 龙井茶园',name:'茶叶间漏下的一点光',hint:'云缝里的光，把叶脉照得很清楚。',memory:'龙井茶园里，光从茶叶间漏下来。叶影轻轻摇着，我把这一点温暖留在了手边。',icon:'tea',interaction:'leaf'},
  {id:'westlake-basket',route:'westlake',order:2,at:.895,place:'西湖 · 龙井村口',name:'一只等雨停的竹篮',hint:'竹篮安静放在凳上，屋檐还在滴水。',memory:'龙井村口的屋檐下，一只竹篮安静等着雨停。我听过一串细细的滴水声，把这段午后也放慢了。',icon:'basket',interaction:'drip'}
 );
 for(const entry of CATALOG.filter(x=>x.route==='westlake'))entry.interaction=entry.interaction||({stones:'ripple',tea:'leaf',eaves:'drip'})[entry.icon];
 const interactions={'meadow-bird':'watch','meadow-butterfly':'breeze','meadow-flower':'breeze','gorge-goat':'watch','gorge-eagle':'watch','gorge-sparkle':'ripple','snow-tracks':'trace','snow-lichen':'trace','snow-light':'breeze','coast-sand':'ripple','coast-shell':'trace','coast-pier':'ripple','valley-moss':'trace','valley-bridge':'ripple','valley-reflection':'ripple','bamboo-drop':'drip','bamboo-step':'trace','bamboo-leaf':'breeze'};
 for(const entry of CATALOG)if(interactions[entry.id])entry.interaction=interactions[entry.id];
 const LEGACY=Object.fromEntries(CATALOG.map(e=>[e.id,{...e}]));
 for(const entry of CATALOG)Object.assign(entry,R.profile(entry.id));
 CATALOG.push(...R.ENCOUNTERS.map(e=>({...e})));
 // Old tiger identities remain readable; new trips arrive at explicit landmarks.
 // The journey owns arrival, so these entries do not invent progress fractions.
 for(const entry of CATALOG)if(entry.route==='tiger')entry.legacyOnly=true;
 const TIGER_MANUAL_IDS=Object.freeze(['tiger-28-bends-v1','tiger-middle-river-frame-v1','tiger-halfway-view-v1','tiger-longdong-passage-v1','tiger-bends-puzzle-v4','tiger-inn-pairs-v4','tiger-waterfall-paint-v4','tiger-river-roundframe-v4']);
 CATALOG.push(
  {id:TIGER_MANUAL_IDS[0],route:'tiger',order:0,edition:3,manualOnly:true,reward:true,place:'虎跳峡 · 二十八道拐',name:'沿着高路，走过二十八道拐',tag:'二十八道拐',hint:'顺着山路转弯，让江谷在脚下慢慢展开。',memory:'沿着高路转过一重重弯，金沙江渐渐落在脚下，峡谷的高差也变得清楚。',result:'沿着高路转过一重重弯，金沙江渐渐落在脚下，峡谷的高差也变得清楚。',interaction:'trace',icon:'steps',artV5:'scenes/tiger-high-v2.webp',badge:'scenes/tiger-high-v2.webp'},
  {id:TIGER_MANUAL_IDS[1],route:'tiger',order:3,edition:3,manualOnly:true,reward:true,place:'虎跳峡 · 中虎跳江边',name:'在江边，留下自己的取景',tag:'江边取景',hint:'移动取景，按下快门，把眼前的江流留在手帐。',memory:'走到江边，我把奔流与两侧山壁放进同一幅取景。江声近了，这一眼由我自己留下。',result:'走到江边，我把奔流与两侧山壁放进同一幅取景。江声近了，这一眼由我自己留下。',interaction:'watch',icon:'river',artV5:'scenes/tiger-river-v2.webp',badge:'scenes/tiger-river-v2.webp'},
  {id:TIGER_MANUAL_IDS[2],route:'tiger',order:1,edition:3,manualOnly:true,reward:false,place:'虎跳峡 · 中途客栈',name:'在中途客栈，看一会儿山',tag:null,hint:'坐下来看看远山，也听听远处的江声。',memory:'在中途客栈歇脚，远山与江谷仍留在眼前。',result:'在中途客栈歇脚，远山与江谷仍留在眼前。',interaction:'watch',icon:'sun'},
  {id:TIGER_MANUAL_IDS[3],route:'tiger',order:2,edition:3,manualOnly:true,reward:false,place:'虎跳峡 · 龙洞瀑布',name:'经过龙洞瀑布',tag:null,hint:'沿着山路经过水帘，感受近处的水声。',memory:'山路经过龙洞瀑布，水帘的声音在耳边近了又远。',result:'山路经过龙洞瀑布，水帘的声音在耳边近了又远。',interaction:'watch',icon:'drop'}
 );
 CATALOG.push(
  {id:'tiger-bends-puzzle-v4',route:'tiger',order:0,edition:3,manualOnly:true,reward:true,place:'虎跳峡 · 二十八道拐',name:'转过山弯',tag:'山弯初见',hint:'从小人前方起笔，沿浅色山路画一个 S 弯。',memory:'我沿着山坡画下一道 S 弯，小人循着山路走上山肩。山弯转过，金沙江的白浪在峡谷里奔流，江声慢慢涌了上来。',result:'转过山弯，江已在脚下。',interaction:'drag',icon:'steps',artV5:'badges/tiger-memories-v4/bends.webp',badge:'badges/tiger-memories-v4/bends.webp'},
  {id:'tiger-inn-pairs-v4',route:'tiger',order:1,edition:3,manualOnly:true,reward:true,place:'虎跳峡 · 中途客栈',name:'记住山色',tag:'半山灯火',hint:'翻开四张画片，找到两对相同的风景。',memory:'在中途客栈的桌边认出两对山影与窗灯。山色暗下来，窗里亮起暖光，今晚就在这里歇脚。',result:'山色暗下来，一扇窗亮了。',interaction:'tap',icon:'sun',artV5:'badges/tiger-memories-v4/inn.webp',badge:'badges/tiger-memories-v4/inn.webp'},
  {id:'tiger-waterfall-paint-v4',route:'tiger',order:2,edition:3,manualOnly:true,reward:true,place:'虎跳峡 · 龙洞瀑布',name:'涂一页山色',tag:'崖间飞瀑',hint:'蘸一点颜色，把岩壁与草木两处留白涂上山色。',memory:'在龙洞瀑布附近停下，用自己选的颜色涂过岩壁与草木。水声落在山径边，山色留在这一页。',result:'水落在石上，山色落在纸上。',interaction:'drag',icon:'drop',artV5:'badges/tiger-memories-v4/waterfall.webp',badge:'badges/tiger-memories-v4/waterfall.webp'},
  {id:'tiger-river-roundframe-v4',route:'tiger',order:3,edition:3,manualOnly:true,reward:true,place:'虎跳峡 · 中虎跳江边',name:'把江声留下',tag:'江声入峡',hint:'拖动圆形取景窗，把巨石和白浪一起装进去，松手拍下。',memory:'沿张老师小路来到中虎跳江边，把江心巨石与白浪装进圆窗，留下这一刻亲手选定的构图。',result:'这一次，江就在眼前。',interaction:'drag',icon:'river',artV5:'badges/tiger-memories-v4/river.webp',badge:'badges/tiger-memories-v4/river.webp'}
 );
 CATALOG.push({id:'wugong-camp-stars',route:'wugong',order:1,edition:3,manualOnly:true,reward:true,place:'武功山 · 观音宕／星空营地',name:'星夜入帐',tag:'观音宕星夜',hint:'对照纸上的小星图，连接夜空里的七颗星。',memory:'在观音宕放下背包，帐篷里的灯亮了。我对照手帐，把夜空中的七颗星慢慢连起来。山风、远山和这一夜的暖光，也一起留在了纸上。',result:'七颗星连成了今晚的记忆。',interaction:'trace',icon:'sparkle',artV5:'scenes/wugong-camp-night-v1/night-v1.webp',badge:'scenes/wugong-camp-night-v1/night-v1.webp'});
 CATALOG.push(
  {id:'wugong-forest-leaves',route:'wugong',order:0,edition:3,manualOnly:true,reward:true,place:'武功山 · 东江村上山林间',name:'林间的叶影',tag:'林间叶影',hint:'翻开两张纸叶，找到四对相同的叶形。',memory:'上山的林间石路边，我歇了歇脚，把四对叶影一一认出来。叶子还留在林间，清凉的树影留在了手帐里。',result:'四对叶影都找到了。',interaction:'tap',icon:'leaf',artV5:'scenes/wugong-forest-leaves-v1/forest-v1.webp',badge:'scenes/wugong-forest-leaves-v1/forest-v1.webp'},
  {id:'wugong-homeward-pages',route:'wugong',order:5,edition:3,manualOnly:true,reward:true,place:'武功山 · 福星谷下山林间',name:'把来路排进手帐',tag:'归途山色',hint:'把四幅小画按林间、草甸、星夜、金顶的先后排好。',memory:'下山回到林荫里，我把上山的林间、草甸、观音宕的夜色和金顶，按走过的顺序排好。这一程的山色，终于连成了完整的一页。',result:'来时的山路，在纸上连了起来。',interaction:'drag',icon:'mountain',artV5:'scenes/wugong-v1.webp',badge:'scenes/wugong-v1.webp'}
 );
 const ids=new Set(CATALOG.map(x=>x.id));
 function clean(values){return Array.isArray(values)?[...new Set(values.filter(x=>typeof x==='string'&&ids.has(x)))]:[];}
 function item(id){return CATALOG.find(x=>x.id===id);}
 function create(route,seed=Math.random()*4294967296,{recent=[]}={}){let value=Number(seed)>>>0;const random=()=>{value=(Math.imul(value,1664525)+1013904223)>>>0;return value/4294967296;};const scheduled=x=>x.route===route&&!x.legacyOnly&&!x.manualOnly;let pool=CATALOG.filter(x=>scheduled(x)&&!x.bonus).sort((a,b)=>a.order-b.order);
  if(route==='westlake'){
   const previous=new Set(recent.slice(-3));pool=[0,1,2].map(order=>{const candidates=pool.filter(x=>x.order===order),weights=candidates.map(x=>previous.has(x.id)?1:3);let roll=random()*weights.reduce((a,b)=>a+b,0),pick=candidates.at(-1);for(let i=0;i<candidates.length;i++){roll-=weights[i];if(roll<0){pick=candidates[i];break;}}return pick;});
   if(pool.every(x=>previous.has(x.id))){const index=Math.floor(random()*3),alternate=CATALOG.find(x=>scheduled(x)&&x.order===index&&!previous.has(x.id));if(alternate)pool[index]=alternate;}
  }
  pool.push(...CATALOG.filter(x=>scheduled(x)&&x.bonus));pool.sort((a,b)=>a.at-b.at);
  const slots=pool.map((x,i)=>{const at=x.at+random()*(x.bonus?.003:i===2&&route==='aotai'?.01:.025);return {id:x.id,at,until:Math.min(route==='westlake'&&i===0?.135:.97,at+.16),side:random()<.5?-1:1};});
  for(let i=0;i<slots.length-1;i++)slots[i].until=Math.min(slots[i].until,slots[i+1].at-.005);
  return {route,seed:Number(seed)>>>0,afterRain:route==='westlake',found:[],slots};
 }

 function visible(state,trip){if(!['walking','paused'].includes(state.status))return null;return trip.slots.find(x=>state.progress>=x.at&&state.progress<=x.until&&!trip.found.includes(x.id))||null;}
 function capture(state,trip,id){const active=visible(state,trip);return active?.id===id?{...trip,found:[...trip.found,id]}:trip;}
 // The caller authorizes this landmark. Capture alone never earns a reward.
 function captureManual(trip,id){const entry=item(id);return entry?.manualOnly===true&&TIGER_MANUAL_IDS.includes(id)&&entry.route===trip?.route&&Array.isArray(trip.found)&&!trip.found.includes(id)?{...trip,found:[...trip.found,id]}:trip;}
 function load(storage){try{const data=JSON.parse(storage?.getItem(KEY)||'null');return data?.version===1?clean(data.found):data?.version===2?clean(cleanMoments(data.moments).map(m=>m.id)):[];}catch(_){return [];}}
 function save(storage,found){try{if(!storage?.setItem)return false;storage.setItem(KEY,JSON.stringify({version:1,found:clean(found)}));return true;}catch(_){return false;}}
 const MAX_MOMENTS=10000,WEATHER=new Set(['clear','wind','fog','rain','snow','blizzard']);
 const MAX_CAPTURE_BYTES=300*1024,MAX_CAPTURE_ART_LENGTH=4*Math.ceil(MAX_CAPTURE_BYTES/3)+32;
 // Canvas captures are bounded raster data URLs, never arbitrary URLs or SVG.
 // Check the declared format against its magic bytes without decoding the image.
 function safeCaptureArt(value){
  if(typeof value!=='string'||value.length>MAX_CAPTURE_ART_LENGTH)return null;
  const match=/^data:image\/(webp|jpeg|png);base64,([A-Za-z0-9+/]+={0,2})$/.exec(value);
  if(!match)return null;
  const encoded=match[2],padding=encoded.endsWith('==')?2:encoded.endsWith('=')?1:0;
  if(encoded.length%4!==0||encoded.length/4*3-padding>MAX_CAPTURE_BYTES)return null;
  const alphabet='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',header=[];
  let bits=0,buffer=0;
  for(let i=0;i<Math.min(encoded.length-padding,24);i++){buffer=(buffer<<6)|alphabet.indexOf(encoded[i]);bits+=6;if(bits>=8){bits-=8;header.push((buffer>>bits)&255);}}
  const has=(bytes,offset=0)=>bytes.every((byte,index)=>header[offset+index]===byte);
  const matches=match[1]==='png'?has([137,80,78,71,13,10,26,10]):match[1]==='jpeg'?has([255,216,255]):has([82,73,70,70])&&has([87,69,66,80],8);
  return matches?value:null;
 }
 const finite=(value,min,max)=>Number.isFinite(value)?Math.max(min,Math.min(max,value)):null;
 function moment(state,trip,id,{weather=null,now=Date.now(),experience=null}={}){
  const entry=item(id);if(!entry||entry.route!==trip?.route||!trip.found?.includes(id))return null;
  const matched=experience?.id===id,earned=entry.reward!==false&&matched&&experience.edition===3&&experience.earned===true;
  const captureArt=earned?safeCaptureArt(experience.captureArt):null;
  // A supplied but invalid/oversize photo is a failed capture, not a stock image.
  if(earned&&experience.captureArt!=null&&!captureArt)return null;
  return {...(entry.artV5?{artVersion:5}:entry.artV4?{artVersion:4}:{}),edition:3,earned,tag:earned?entry.tag:null,key:`${now}-${trip.seed}-${id}`,id,route:entry.route,place:entry.place,title:matched&&typeof experience.title==='string'?experience.title:entry.name,memory:matched&&typeof experience.memory==='string'?experience.memory:entry.memory,...(matched?{interaction:experience.interaction}:{}),...(captureArt?{captureArt,artSource:'capture'}:{}),icon:entry.icon,progress:finite(state.progress,0,1),elapsed:finite(state.elapsed,0,86400),weather:WEATHER.has(weather)?weather:null,createdAt:finite(now,0,8640000000000000),legacy:false};
 }
 function cleanMoments(values){
  if(!Array.isArray(values))return [];const keys=new Set(),out=[];
  for(const value of values){const entry=item(value?.id);if(!entry||value.route!==entry.route||typeof value.key!=='string'||!value.key||value.key.length>100||keys.has(value.key))continue;keys.add(value.key);
   const text=(name,fallback,max)=>typeof value[name]==='string'&&value[name].trim()?value[name].slice(0,max):fallback;
   const current=value.edition===3||entry.bonus===true||entry.manualOnly===true,base=current?entry:LEGACY[entry.id]||entry,earned=entry.reward!==false&&value.earned===true,captureArt=current&&earned?safeCaptureArt(value.captureArt):null;out.push({...(current&&value.artVersion===5&&entry.artV5?{artVersion:5}:current&&value.artVersion===4&&entry.artV4?{artVersion:4}:{}),...(current?{edition:3,earned,tag:earned?entry.tag:null}:{}),...(captureArt?{captureArt,artSource:'capture'}:{}),key:value.key,id:entry.id,route:entry.route,place:text('place',base.place,80),title:text('title',base.name,80),memory:text('memory',base.memory,400),...(['look','tap','drag'].includes(value.interaction)?{interaction:value.interaction}:{}),icon:current?entry.icon:typeof value.icon==='string'&&value.icon.length<32?value.icon:base.icon,progress:finite(value.progress,0,1),elapsed:finite(value.elapsed,0,86400),weather:WEATHER.has(value.weather)?value.weather:null,createdAt:finite(value.createdAt,0,8640000000000000),legacy:!!value.legacy});
  }return out.slice(-MAX_MOMENTS);
 }
 function loadMoments(storage){try{const data=JSON.parse(storage?.getItem(KEY)||'null');if(data?.version===2)return cleanMoments(data.moments);if(data?.version===1)return clean(data.found).map(id=>{const entry=LEGACY[id]||item(id);return {key:'legacy-'+id,id,route:entry.route,place:entry.place.split(' · ')[0],title:'从旧手帐带来的一页',memory:'这是以前在这段路线保存的回忆。新的旅途瞬间会记下当时的风景与心情。',icon:entry.icon,progress:null,elapsed:null,weather:null,createdAt:null,legacy:true};});return [];}catch(_){return [];}}
 function saveMoments(storage,moments){try{if(!storage?.setItem||!Array.isArray(moments))return false;if(moments.some(value=>value?.captureArt!=null&&!safeCaptureArt(value.captureArt)))return false;storage.setItem(KEY,JSON.stringify({version:2,moments:cleanMoments(moments)}));return true;}catch(_){return false;}}
 const hasTag=moment=>item(moment?.id)?.reward===false?false:moment?.edition===3?moment.earned===true:!!moment;
 function tagArt(moment){if(moment?.edition!==3||!hasTag(moment))return null;const captureArt=safeCaptureArt(moment.captureArt);if(captureArt)return captureArt;const entry=item(moment.id)||R.profile(moment.id);return (moment.artVersion===5?entry?.artV5:moment.artVersion===4?entry?.artV4:entry?.badge)||entry?.artV5||entry?.artV4||entry?.badge||null;}
 return {LEGACY,hasTag,tagArt,KEY,CATALOG,item,clean,create,visible,capture,captureManual,TIGER_MANUAL_IDS,load,save,MAX_MOMENTS,MAX_CAPTURE_BYTES,MAX_CAPTURE_ART_LENGTH,safeCaptureArt,moment,cleanMoments,loadMoments,saveMoments};

}));
