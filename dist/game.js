(function(root,factory){const data=typeof module==='object'&&module.exports?require('./routes.js'):root.TrailRoutes;const api=factory(data);if(typeof module==='object'&&module.exports)module.exports=api;else root.TrailGame=api;}(typeof globalThis!=='undefined'?globalThis:this,function(data){
 'use strict';const {ROUTES,getRoute}=data;const clamp=v=>Math.max(0,Math.min(100,v));
 const WEATHER={clear:{name:'晴朗',icon:'☀',cold:0,wet:0,energy:0,bearing:0,visibility:1},wind:{name:'强风',icon:'≋',cold:3,wet:0,energy:1,bearing:1,visibility:.55},fog:{name:'浓雾',icon:'☁',cold:2,wet:0,energy:0,bearing:6,visibility:.22},rain:{name:'冷雨',icon:'☂',cold:3,wet:8,energy:1,bearing:3,visibility:.4},snow:{name:'大雪',icon:'❄',cold:5,wet:3,energy:2,bearing:7,visibility:.2},blizzard:{name:'暴风雪',icon:'❄',cold:7,wet:5,energy:3,bearing:12,visibility:.1}};
 const cache=new Map();
 function routeOf(s){return getRoute(typeof s==='string'?s:s?.routeId);}
 function meters(a,b){const rad=Math.PI/180;return Math.hypot((a[0]-b[0])*Math.cos((a[1]+b[1])/2*rad),a[1]-b[1])*rad*6371000;}
 function metric(r){r=routeOf(r);if(cache.has(r.id))return cache.get(r.id);const cumulative=[0];for(let i=1;i<r.geo.line.length;i++)cumulative.push(cumulative[i-1]+meters(r.geo.line[i-1],r.geo.line[i]));const v={cumulative,total:cumulative.at(-1)};cache.set(r.id,v);return v;}
 function position(state){const r=routeOf(state),{cumulative,total}=metric(r.id),distance=Math.max(0,Math.min(total,state.distance));let i=1;while(i<cumulative.length-1&&cumulative[i]<distance)i++;const a=r.geo.line[i-1],b=r.geo.line[i],t=(distance-cumulative[i-1])/(cumulative[i]-cumulative[i-1]||1);return {lon:a[0]+(b[0]-a[0])*t,lat:a[1]+(b[1]-a[1])*t,ele:a[2]===null||b[2]===null?null:a[2]+(b[2]-a[2])*t,index:i};}
 function weatherAt(route,turn=0){let type=routeOf(route).weather[0].type;for(const e of routeOf(route).weather){if(e.turn>turn)break;type=e.type;}return {...WEATHER[type],type};}
 function forecast(s){return routeOf(s).weather.find(e=>e.turn>s.turns)||null;}
 function createState(id='wugong'){const r=getRoute(id);return {routeId:r.id,distance:0,energy:90,warmth:r.initialWarmth,wetness:0,bearing:100,steps:0,turns:0,gear:false,warmPacks:2,snacks:2,usedCamps:[],visitedCheckpoints:[],stamps:[],rests:0,retreating:false,status:'ready',lossReason:null,message:r.brief,events:[]};}
 function start(s){return s.status==='ready'?{...s,status:'playing'}:s;}
 function pause(s){return s.status==='playing'?{...s,status:'paused',message:'已暂停，天气与游戏指标停止变化。'}:s;}
 function resume(s){return s.status==='paused'?{...s,status:'playing',message:'继续沿轨迹行进。'}:s;}
 function campAt(s){const fraction=s.distance/metric(s.routeId).total;return [.25,.50,.75].findIndex(f=>Math.abs(fraction-f)<.022);}
 function log(s,type,text){return {...s,events:[...s.events,{turn:s.turns,type,text}].slice(-8)};}
 function advance(s,patch,sheltered=false){let next={...s,...patch,turns:s.turns+1};const w=weatherAt(s.routeId,s.turns);if(routeOf(s).hazards){next.wetness=clamp(next.wetness+(sheltered?-22:w.wet*(next.gear?0.3:1)-(w.wet===0?3:0)));const cold=sheltered?0:Math.ceil((w.cold+(next.wetness>=35?2:0))*(next.gear?0.45:1));next.warmth=clamp(next.warmth-cold);next.bearing=clamp(next.bearing-(sheltered?0:w.bearing));}
 if(next.energy<=0)next={...next,energy:0,status:'lost',lossReason:'energy',message:'体力耗尽，演练结束。'};else if(next.warmth<=0)next={...next,warmth:0,status:'lost',lossReason:'hypothermia',message:'失温危机，演练结束。'};
 if(next.status==='playing'&&next.bearing<=20)next.message+=' 方向感不足，先核对方向。';if(next.status==='playing'&&next.warmth<=25)next.message+=' 保温值危险，优先避险。';
 const changed=weatherAt(s.routeId,next.turns);if(changed.type!==w.type)next=log(next,'weather',`天气转为${changed.name}。`);return next;}
 function move(s,direction){if(s.status!=='playing'||!['forward','back'].includes(direction))return s;if(s.bearing<=20)return {...s,message:'已迷失方向，先核对方向，或选择求援演练。'};
 const r=routeOf(s),{total}=metric(r.id),step=total/32,forward=direction==='forward',distance=Math.max(0,Math.min(total,s.distance+(forward?step:-step)));if(Math.abs(distance-s.distance)<.001)return {...s,message:forward?'已经抵达轨迹末点。':'已经在轨迹起点。'};
 const w=weatherAt(r.id,s.turns),a=position(s),b=position({...s,distance}),climb=a.ele!==null&&b.ele!==null?Math.max(0,b.ele-a.ele):0;let next=advance(s,{distance,steps:s.steps+1,energy:Math.max(0,s.energy-2-w.energy-(climb>80?1:0)),message:forward?'沿实际轨迹前进。':'沿实际轨迹回走。'});
 if(next.status!=='playing')return next;
 for(const cp of r.checkpoints)if(distance>=total*cp.fraction-.001&&!next.visitedCheckpoints.includes(cp.id)){next={...next,visitedCheckpoints:[...next.visitedCheckpoints,cp.id],message:`到达${cp.name}，实景照片已解锁。`};next=log(next,'checkpoint',`打卡：${cp.name}，可展开实景照片。`);}
 for(const [i,f]of [.25,.5,.75].entries())if(s.distance<total*f&&distance>=total*f&&!next.stamps.includes(String(i+1))){next={...next,stamps:[...next.stamps,String(i+1)]};next=log(next,'progress',`已走过路线${Math.round(f*100)}%。`);}
 if(s.retreating&&distance<.001)next={...next,status:'retreated',message:'已沿轨迹安全撤回起点。'};else if(!s.retreating&&distance>=total-.001)next={...next,status:'won',message:'完成这条轨迹的虚拟行程。历史记录不代表现实开放或安全。'};return next;}
 function rest(s){if(s.status!=='playing')return s;const camp=campAt(s);if(camp<0)return {...s,message:'前进或回走至轨迹上的演练补给点才能休息。'};if(s.usedCamps.includes(camp))return {...s,message:'此演练补给已使用，可继续避风等待。'};return advance(s,{energy:clamp(s.energy+35),warmth:clamp(s.warmth+18),rests:s.rests+1,usedCamps:[...s.usedCamps,camp],message:'使用演练补给，体力+35，保温+18。'},true);}
 function act(s,action){if(s.status!=='playing')return s;if(action==='retreat')return {...s,retreating:true,status:s.distance<.001?'retreated':'playing',message:s.distance<.001?'在起点取消行程。':'已选择撤退，请使用回走返回起点。'};if(action==='rescue')return log({...s,status:'rescue',message:'记录求援选择，虚拟演练结束；没有发出真实求救。'},'rescue','停止行进并选择求援演练。');
 if(action==='gear'){if(s.gear)return s;return advance(s,{gear:true,energy:s.energy-1,warmth:clamp(s.warmth+8),message:'已穿戴防护，后续受潮和保温消耗减缓。'});}
 if(action==='navigate')return advance(s,{energy:s.energy-2,bearing:clamp(s.bearing+50),message:'核对方向，恢复方向感。'});
 if(action==='warm'){if(!s.warmPacks)return s;return advance(s,{energy:s.energy-1,warmth:clamp(s.warmth+28),wetness:clamp(s.wetness-10),warmPacks:s.warmPacks-1,message:'使用一份应急保温包。'});}
 if(action==='eat'){if(!s.snacks)return s;return advance(s,{energy:clamp(s.energy+25),snacks:s.snacks-1,message:'使用一份随身食物。'});}
 if(action==='shelter'){if(campAt(s)<0)return {...s,message:'先到演练补给/避险标记附近。它们不是实地设施。'};return advance(s,{energy:s.energy-1,warmth:clamp(s.warmth+18),bearing:clamp(s.bearing+10),message:'在虚拟避险情景中等待一回合。'},true);}return s;}
 function score(s){return s.status==='won'?Math.max(0,1000-s.turns*10+s.energy*3+s.warmth):0;}
 return {ROUTES,getRoute,routeOf,WEATHER,meters,metric,position,weatherAt,forecast,campAt,createState,start,pause,resume,move,rest,act,score};
}));
