(function(root,factory){const G=typeof module==='object'&&module.exports?require('./game.js'):root.TrailGame;const api=factory(G);if(typeof module==='object'&&module.exports)module.exports=api;else root.TrailJourney=api;}(typeof globalThis!=='undefined'?globalThis:this,function(G){
 'use strict';
 const clamp=v=>Math.max(0,Math.min(100,v));
 const STORIES={
 wugong:{duration:110,openingTitle:'去草甸上，借一阵风。',opening:'草甸一直铺到云边，风先跑上了山脊。沿着小路去看看，今天的云会在哪个转弯露面。',thoughts:[[0,'清晨的步道很安静，鞋底落在石阶上。'],[.07,'树林让开了。远处的山脊露出一点轮廓。'],[.28,'大片草甸铺到天边，风把草叶吹向同一个方向。'],[.47,'雾慢慢薄了。光从云层的缝隙里照下来。'],[.7,'衣角已经干了，脚步也找回了自己的节奏。'],[.9,'最后一段上坡。身后那些弯，已经走过了。']],events:[
 {id:'ridge-breeze',at:.14,kicker:'路上遇见 · 一阵风',title:'山脊上的风，忽然大了。',copy:'风把帽檐掀起，草叶沙沙作响。你停在路旁，听见自己的呼吸。',weather:'wind',choices:[{id:'slow',label:'放慢脚步，听一会儿风',note:'多留一段风景，稍稍恢复体力',pace:.85,energy:8,warmth:5,memory:'在山脊停了一会儿，听风穿过草甸。',echo:'你拢了拢衣领，开始按自己的节奏走。'},{id:'press',label:'趁天亮，继续赶路',note:'走得更快，也会更累',pace:1.18,energy:-14,warmth:-5,memory:'趁着天亮，快步走过了风口。',echo:'脚步快了起来。山脊上的风留在了身后。'}]},
 {id:'mist',at:.58,kicker:'路上遇见 · 云雾',title:'刚才看得见的山，藏进雾里了。',copy:'附近的路仍在，远处却只剩灰白。你看见一个模糊的路标。',weather:'fog',choices:[{id:'wait',weatherAfter:'clear',label:'停一停，等雾散开',note:'行程放慢，心里更踏实',pace:.9,energy:10,warmth:3,memory:'等过一场雾，才发现眼前还有更远的山。',echo:'几阵风过去，山脊重新露了出来。'},{id:'rush',label:'沿着眼前的路继续走',note:'省下时间，错过一段视野',pace:1.15,energy:-12,warmth:-8,memory:'走进了雾里，靠近处的路标继续前行。',echo:'脚步声像被雾吞掉了。你走得更小心。'}]}
 ]},
 tiger:{duration:110,openingTitle:'转个弯，听见一整条江。',opening:'江水在山脚下奔跑，山径在山腰间拐弯。先别急着拍照，下一个转弯，峡谷会把自己展开。',thoughts:[[0,'山路贴着坡面向前延伸。远处传来低低的江声。'],[.06,'拐过一段弯，峡谷忽然出现在眼前。'],[.29,'山壁把风声放大了。江流在很远的下面。'],[.46,'云从对面山头移开，峡谷有了明暗的层次。'],[.72,'走到这里，你已经分得清风声和江声。'],[.9,'路上遇见的那块路标，成了今天的小小纪念。']],events:[
 {id:'gorge-stop',at:.14,kicker:'路上遇见 · 江声',title:'拐弯之后，整个峡谷都打开了。',copy:'刚才看不到的江流，在两面山壁之间奔涌。风声里，你分出了水的声音。',weather:'clear',choices:[{id:'listen',label:'坐一会儿，听江声',note:'走得慢一点，记住这个瞬间',pace:.85,energy:10,warmth:3,memory:'坐在峡谷的风里，听了好一会儿江声。',echo:'你没有急着拿手机。就这样看了一会儿。'},{id:'keep',label:'一边走，一边看',note:'保持较快的脚步',pace:1.15,energy:-12,warmth:0,memory:'让江声伴着脚步，继续沿山径走。',echo:'峡谷没有离开，只是在每个转弯里换了一种样子。'}]},
 {id:'rain',at:.58,kicker:'路上遇见 · 一场雨',title:'第一滴雨，落在了帽檐上。',copy:'雨点渐渐密起来，山壁的颜色变深。你的脚步放轻了。',weather:'rain',choices:[{id:'cover',label:'停下穿好雨衣，再走',note:'装备由小人自动整理',pace:.9,energy:5,warmth:12,memory:'穿好雨衣，走过一段有江声的雨路。',echo:'雨点敲着雨衣，你重新迈开了步子。'},{id:'fast',label:'加快脚步赶过这段',note:'更累，也会受些冷',pace:1.22,energy:-15,warmth:-18,memory:'赶过了那场雨，衣角沾着峡谷的水汽。',echo:'鞋底发出湿湿的声音，你开始惦记下一处歇脚。'}]}
 ]},
 aotai:{duration:120,openingTitle:'把脚步放轻，听雪落下。',opening:'秦岭的山脊披着薄雪，风把远山时藏时露。跟着脚印走一会儿，也把停下来的从容留给自己。',thoughts:[[0,'脚踩在积雪里，声音变得沉闷。山脊很安静。'],[.07,'树越来越矮，开阔处的风开始擦过脸颊。'],[.27,'身后那一串脚印，在白色里慢慢淡去。'],[.46,'雪粒打在背包上。你把注意力放回每一步。'],[.66,'云层流动得很快，远处的山忽隐忽现。'],[.86,'能停下来，也是这段旅程的一部分。']],events:[
 {id:'snow-wind',at:.42,kicker:'路上遇见 · 风雪',title:'风把雪卷起来，前方变得模糊。',copy:'帽檐上结了一层薄白，手指也有些僵。你感觉到，这段路需要重新判断。',weather:'blizzard',choices:[{id:'protect',label:'停下整理防护，缓一缓',note:'小人自动穿戴，不需要管理物资',pace:.8,energy:10,warmth:20,memory:'在风雪变大时停下来，整理好防护再走。',echo:'你把围领拉高。呼吸慢下来，脚步也稳了。'},{id:'push',label:'继续向前，走过这段',note:'体力和保温都会下降',pace:1.15,energy:-20,warmth:-30,memory:'顶着一段风雪前进，感到手指越来越冷。',echo:'步子快了，身体却开始发冷。你想起了刚才那个停下的机会。'}]},
 {id:'cold-choice',at:.82,kicker:'路上遇见 · 重新判断',title:'风还在吹，你想先缓一缓。',copy:'你留意到自己的疲惫和寒意。接下来，选择怎样结束这段旅程。',weather:'snow',choices:[{id:'recover',label:'避风休息，恢复后再走',note:'休息融入故事，无需点物资按钮',pace:.9,energy:18,warmth:24,memory:'先休息恢复，才继续剩下的一段路。',echo:'这次，你没有催促自己。缓过来之后，山径仍在。'},{id:'return',label:'到这里就好，结束这次徒步',note:'这也是一个完整的结局',end:'retreated',energy:0,warmth:0,memory:'在风雪里选择及时结束虚拟行程。',echo:'你决定把剩下的路留在地图上。平安的选择，也是旅程的结尾。'}]}
 ]}
 };
 Object.assign(STORIES,{
  "maclehose": {
    "duration": 115,
    "openingTitle": "山的另一边，海在等你。",
    "opening": "先听见风，再看见蓝。山径绕过一个弯，海湾把沙滩和浪花一起送到眼前。",
    "thoughts": [
      [
        0,
        "山径从低低的灌木间升起，海风带来一点咸味。"
      ],
      [
        0.2,
        "越过山脊，弯弯的海岸展开了。"
      ],
      [
        0.39,
        "沙滩上留着浅浅的潮痕，浪花反复改写它。"
      ],
      [
        0.55,
        "海水有很多种蓝，近处和远处不一样。"
      ],
      [
        0.72,
        "离开开阔海湾，脚步转进安静的山村。"
      ],
      [
        0.84,
        "赤径的水很平，渡头下还有另一座山的倒影。"
      ]
    ],
    "events": [
      {
        "id": "coast-wind",
        "at": 0.14,
        "kicker": "路上遇见 · 海风",
        "title": "海风把背包带轻轻拉紧。",
        "copy": "你翻上一段山脊。再走几步，就能看见山后的海。",
        "weather": "wind",
        "choices": [
          {
            "id": "listen",
            "label": "慢一点，听听海风",
            "note": "按自己的节奏走一会儿",
            "pace": 0.9,
            "energy": 6,
            "warmth": 0,
            "memory": "在西贡山脊上，把风声听成了海的前奏。",
            "echo": "风从肩旁过去。你把步子放慢了一点。"
          },
          {
            "id": "follow",
            "label": "跟着山径往海边走",
            "note": "按自己的节奏走一会儿",
            "pace": 1.1,
            "energy": -5,
            "warmth": 0,
            "memory": "顺着海风，走向还看不见的海湾。",
            "echo": "海风一直在，山径也一直向前。"
          }
        ]
      },
      {
        "id": "coast-rest",
        "at": 0.66,
        "kicker": "路上遇见 · 转弯",
        "title": "沙滩的声音，留在了身后。",
        "copy": "山路再次拐向内陆。鞋底上还带着一点沙。",
        "weather": "clear",
        "choices": [
          {
            "id": "sand",
            "label": "停下来，倒掉鞋里的细沙",
            "note": "按自己的节奏走一会儿",
            "pace": 0.9,
            "energy": 8,
            "warmth": 0,
            "memory": "离开咸田湾时，我倒出鞋里的一点沙。海还在身后响。",
            "echo": "鞋里轻快了。你继续沿着山径走。"
          },
          {
            "id": "walk",
            "label": "继续走，听潮声慢慢变远",
            "note": "按自己的节奏走一会儿",
            "pace": 1.06,
            "energy": -3,
            "warmth": 0,
            "memory": "把潮声留在身后，向赤径的小山村走去。",
            "echo": "一层山挡住了海，潮声也变轻了。"
          }
        ]
      }
    ]
  },
  "changping": {
    "duration": 120,
    "openingTitle": "沿着溪声，走进森林深处。",
    "opening": "树荫把声音放轻，溪水却一路说个不停。穿过苔木和栈道，看看森林最后藏着哪一片草甸。",
    "thoughts": [
      [
        0,
        "栈道旁的苔木湿润，树林像一座安静的屋子。"
      ],
      [
        0.1,
        "鞋底落在木板上，声音比泥路轻。"
      ],
      [
        0.29,
        "溪水绕过圆石，树枝在水面上晃。"
      ],
      [
        0.48,
        "山壁隐在薄雾里，林子显得更深了。"
      ],
      [
        0.7,
        "树间的缝隙越来越宽，风带来了草的味道。"
      ],
      [
        0.88,
        "草甸让出了远山的轮廓。走到这里，就想多看一会儿。"
      ]
    ],
    "events": [
      {
        "id": "valley-sound",
        "at": 0.14,
        "kicker": "路上遇见 · 木栈道",
        "title": "这里的脚步声，听起来不一样。",
        "copy": "木板轻轻回应鞋底。边上的溪水，把声音接了过去。",
        "weather": "fog",
        "choices": [
          {
            "id": "soft",
            "label": "放轻脚步，听水从哪里来",
            "note": "按自己的节奏走一会儿",
            "pace": 0.9,
            "energy": 6,
            "warmth": 0,
            "memory": "在长坪沟的木栈道上，我分出了脚步和溪水的声音。",
            "echo": "你把脚步放轻，水声变得更清楚了。"
          },
          {
            "id": "steady",
            "label": "保持节奏，继续穿过树林",
            "note": "按自己的节奏走一会儿",
            "pace": 1.08,
            "energy": -4,
            "warmth": 0,
            "memory": "木板的轻响陪我走过了长坪沟的树林。",
            "echo": "一步一步，林子慢慢向后退去。"
          }
        ]
      },
      {
        "id": "valley-open",
        "at": 0.61,
        "kicker": "路上遇见 · 草甸",
        "title": "前面，树林开始让开了。",
        "copy": "树冠之间出现一片更亮的天空。溪流沿着草甸向前弯去。",
        "weather": "clear",
        "choices": [
          {
            "id": "pause",
            "label": "在林缘歇一会儿",
            "note": "按自己的节奏走一会儿",
            "pace": 0.88,
            "energy": 10,
            "warmth": 2,
            "memory": "长坪沟的树林让开时，我在林缘歇了一小会儿。",
            "echo": "坐过一会儿，再站起来，远山显得更清楚了。"
          },
          {
            "id": "meadow",
            "label": "走到开阔处看看",
            "note": "按自己的节奏走一会儿",
            "pace": 1.12,
            "energy": -6,
            "warmth": 0,
            "memory": "从树林走进草甸，长坪沟一下子变宽了。",
            "echo": "风从开阔处吹来，你向草甸走去。"
          }
        ]
      }
    ]
  },
  "mogan": {
    "duration": 105,
    "openingTitle": "今天，跟着竹影慢慢走。",
    "opening": "雨把石阶洗亮了，竹叶还在滴答。顺着摇晃的竹影走，山泉会在前面接过这支小曲。",
    "thoughts": [
      [
        0,
        "竹叶上还有雨，石阶是深深的灰色。"
      ],
      [
        0.08,
        "一滴水落下来，正好敲在背包上。"
      ],
      [
        0.28,
        "竹竿把远处的景物切成细细的绿色。"
      ],
      [
        0.46,
        "旧石阶拐了个弯，苔藓住在石缝里。"
      ],
      [
        0.69,
        "竹叶沙沙响着，山泉在不远处回应。"
      ],
      [
        0.9,
        "这一小段古道走完了，脚步也安静下来。"
      ]
    ],
    "events": [
      {
        "id": "bamboo-rain",
        "at": 0.14,
        "kicker": "路上遇见 · 竹间细雨",
        "title": "几滴细雨，又落进竹林。",
        "copy": "竹叶把雨分成许多细小的声音，石阶的颜色慢慢变深。",
        "weather": "rain",
        "choices": [
          {
            "id": "shelter",
            "label": "在路旁缓一缓，整理雨衣",
            "note": "按自己的节奏走一会儿",
            "pace": 0.88,
            "energy": 8,
            "warmth": 5,
            "memory": "在莫干山的竹林里，听了一阵落在叶尖的细雨。",
            "echo": "雨衣整理好了。竹叶上的雨仍在滴答。"
          },
          {
            "id": "slowstep",
            "label": "放慢脚步，沿石阶走",
            "note": "按自己的节奏走一会儿",
            "pace": 0.95,
            "energy": 2,
            "warmth": 2,
            "memory": "我放慢了脚步，走过莫干山一段湿湿的石阶。",
            "echo": "脚步放轻，雨声反而清楚了。"
          }
        ]
      },
      {
        "id": "bamboo-clear",
        "at": 0.62,
        "kicker": "路上遇见 · 竹叶声",
        "title": "雨停了，竹林还在响。",
        "copy": "叶尖的水滴接着落下。刚才是雨声，现在是竹林自己的声音。",
        "weather": "clear",
        "choices": [
          {
            "id": "stay",
            "label": "停一停，等一滴水落下",
            "note": "按自己的节奏走一会儿",
            "pace": 0.85,
            "energy": 8,
            "warmth": 0,
            "memory": "雨停之后，我在莫干山等一滴水从竹叶尖落下。",
            "echo": "滴答。一片竹叶轻轻弹回去。"
          },
          {
            "id": "ahead",
            "label": "继续走，去听听山泉",
            "note": "按自己的节奏走一会儿",
            "pace": 1.08,
            "energy": -4,
            "warmth": 0,
            "memory": "沿着莫干岭古道，把竹叶声走成了山泉声。",
            "echo": "石阶慢慢下降，你听见了小溪。"
          }
        ]
      }
    ]
  }
});
 STORIES.westlake={
  "duration": 110,
  "openingTitle": "把一段午后，泡进茶香里。",
  "opening": "雨把九溪洗亮了。溪水绕过石头，茶树接住云缝里的阳光。沿着十八涧慢慢走，给今天留一点树荫、一点茶香。",
  "thoughts": [
    [
      0,
      "树林把山路盖住，溪水从石头旁流过去。"
    ],
    [
      0.09,
      "水绕过一块石头，声音忽然变得清脆。"
    ],
    [
      0.28,
      "石板路弯向树林深处，鞋底留下轻轻的响声。"
    ],
    [
      0.46,
      "树影之间透出茶园，整齐的茶垄沿着坡面展开。"
    ],
    [
      0.68,
      "茶树尖的一点新绿，把你的目光留住了。"
    ],
    [
      0.88,
      "走近龙井村口，屋檐下的影子安静地铺在石路上。"
    ]
  ],
  "events": [
    {
      "id": "westlake-water",
      "at": 0.14,
      "kicker": "路上遇见 · 溪声",
      "title": "同一条溪水，换了一种声音。",
      "copy": "水流遇到几块小石头，细细的响声从脚边传来。",
      "weather": "clear",
      "choices": [
        {
          "id": "water-listen",
          "label": "停一停，听水从石缝经过",
          "note": "让脚步缓一缓",
          "pace": 0.9,
          "energy": 8,
          "warmth": 0,
          "memory": "在九溪的石板路旁，我听了一阵绕过石头的水声。",
          "echo": "溪水一直流。你带着它的声音继续走。"
        },
        {
          "id": "water-walk",
          "label": "让水声陪着脚步往前走",
          "note": "保持自己的步伐",
          "pace": 1.08,
          "energy": -4,
          "warmth": 0,
          "memory": "让九溪的水声陪着脚步，走进了更深的树荫。",
          "echo": "转过一个弯，水声也跟着换了方向。"
        }
      ]
    },
    {
      "id": "westlake-teahill",
      "at": 0.61,
      "kicker": "路上遇见 · 茶园",
      "title": "树林让开，茶垄出现在坡上。",
      "copy": "一行行茶树沿着山坡铺开，石径从它们旁边经过。",
      "weather": "clear",
      "choices": [
        {
          "id": "tea-slow",
          "label": "沿着茶园边的石径慢慢看",
          "note": "把这一段走得悠闲些",
          "pace": 0.86,
          "energy": 7,
          "warmth": 0,
          "memory": "走出九溪树林后，我沿着龙井茶园边的石径慢慢看了一会儿。",
          "echo": "新叶有深浅不同的绿，远处的茶村也清楚了。"
        },
        {
          "id": "tea-village",
          "label": "继续走，到村口歇一会儿",
          "note": "跟着山径走向茶村",
          "pace": 1.06,
          "energy": -3,
          "warmth": 0,
          "memory": "循着茶园旁的路，一直走到了龙井村口。",
          "echo": "石板路接上村里的小路，屋檐的影子越来越近。"
        }
      ]
    }
  ]
};
 function routeOf(s){return G.getRoute(typeof s==='string'?s:s.routeId);}
 function storyOf(s){return STORIES[routeOf(s).id];}
 function stops(s){return [...storyOf(s).events.map(e=>({...e,kind:'choice'})),...routeOf(s).checkpoints.map(cp=>({id:cp.id,at:cp.fraction,kind:'photo',checkpoint:cp}))].sort((a,b)=>a.at-b.at);}
 function create(id='wugong'){const r=G.getRoute(id);return {routeId:r.id,status:'ready',progress:0,elapsed:0,pace:1,energy:90,warmth:r.initialWarmth,resolved:[],visited:[],memories:[],pending:null,echo:storyOf(r.id).opening,weather:null};}
 function start(s){return s.status==='ready'?{...s,status:'walking'}:s;}
 function pause(s){return s.status==='walking'?{...s,status:'paused'}:s;}
 function resume(s){return s.status==='paused'?{...s,status:'walking'}:s;}
 function tick(s,dt){if(s.status!=='walking'||!Number.isFinite(dt)||dt<=0)return s;dt=Math.min(1,dt);const progress=Math.min(1,s.progress+dt*s.pace/storyOf(s).duration),next=stops(s).find(e=>!s.resolved.includes(e.id)&&e.at<=progress+1e-9);if(next){const visited=next.kind==='photo'&&!s.visited.includes(next.id)?[...s.visited,next.id]:s.visited;return {...s,progress:next.at,elapsed:s.elapsed+dt,visited,status:'encounter',pending:next,weather:next.weather||s.weather,echo:next.kind==='photo'?`走到了${next.checkpoint.name}。停一停，看看真实的风景。`:next.copy};}return {...s,progress,elapsed:s.elapsed+dt,energy:clamp(s.energy-dt*.22),warmth:clamp(s.warmth-dt*(s.routeId==='aotai'?.10:.025)),status:progress>=1?'finished':'walking'};}
 function choose(s,id){if(s.status!=='encounter'||s.pending?.kind!=='choice')return s;const choice=s.pending.choices.find(c=>c.id===id);if(!choice)return s;const resolved=[...s.resolved,s.pending.id];return {...s,status:choice.end||'walking',pending:null,resolved,energy:clamp(s.energy+choice.energy),warmth:clamp(s.warmth+choice.warmth),pace:choice.pace||s.pace,weatherOverride:choice.weatherAfter||s.weatherOverride,memories:[...s.memories,choice.memory],echo:choice.echo};}
 function continuePhoto(s){if(s.status!=='encounter'||s.pending?.kind!=='photo')return s;return {...s,status:s.progress>=1?'finished':'walking',resolved:[...s.resolved,s.pending.id],pending:null,echo:'把风景收进行囊，继续走自己的路。'};}
 function thought(s){if(s.pending)return s.echo;let text=storyOf(s).thoughts[0][1];for(const [at,value]of storyOf(s).thoughts){if(at>s.progress)break;text=value;}return text;}
 function weather(s){if(s.weatherOverride)return s.weatherOverride;if(s.weather&&s.pending?.kind==='choice')return s.weather;if(s.routeId==='westlake')return s.progress>.25&&s.progress<.39?'fog':'clear';if(s.routeId==='maclehose')return s.progress<.3?'wind':'clear';if(s.routeId==='changping')return s.progress<.32?'fog':'clear';if(s.routeId==='mogan')return s.progress>.14&&s.progress<.43?'rain':s.progress<.14?'fog':'clear';if(s.routeId==='aotai')return s.progress>.88?'clear':s.progress>.42&&s.progress<.6?'blizzard':'snow';if(s.routeId==='tiger')return s.progress>.58&&s.progress<.75?'rain':'clear';return s.progress>.58&&s.progress<.68?'fog':s.progress>.14&&s.progress<.3?'wind':'clear';}
 function feeling(s){if(s.warmth<35)return '寒意明显，想先歇一歇';if(s.energy<35)return '脚步有些沉，想慢一点';if(s.pace<1)return '步伐舒缓，心里很安静';return '脚步轻快，风景在前方';}
 function ending(s){if(s.status==='retreated')return {title:'把平安，带回今天。',copy:'这次没有走完整条路线，但你留意到了自己的状态，也做出了结束行程的选择。'};if(s.pace<1)return {title:'山径很长，你走出了自己的节奏。',copy:'你没有急着把每一段路走完。那些停下来听风、看云的时刻，也留在了今天的旅程里。'};return {title:'回头看，已经走过这么多弯。',copy:'一路的脚步与选择，把地图变成了一段记忆。下次，也可以试着走得慢一些。'};}
 return {STORIES,routeOf,storyOf,stops,create,start,pause,resume,tick,choose,continuePhoto,thought,weather,feeling,ending};
}));
