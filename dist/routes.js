(function(root,factory){const geo=typeof module==='object'&&module.exports?{...require('./geography.js'),...require('./geography-extra.js')}:{...root.TrailGeography,...root.TrailGeographyExtra};const api=factory(geo);if(typeof module==='object'&&module.exports)module.exports=api;else root.TrailRoutes=api;}(typeof globalThis!=='undefined'?globalThis:this,function(geo){
 const checkpoints={"wugong":[{"id":"wugong-meadow","name":"山脊草甸","fraction":0.25,"photo":{"title":"Wugong Mountains, 17 June 2018, Picture12.jpg","source":"https://commons.wikimedia.org/wiki/File:Wugong_Mountains,_17_June_2018,_Picture12.jpg","author":"Huangdan2060","license":"CC0","licenseUrl":"http://creativecommons.org/publicdomain/zero/1.0/deed.en","file":"photos/wugong-meadow.webp","alt":"武功山绿色山脊草甸和步道"}},{"id":"wugong-clouds","name":"云海观景","fraction":0.5,"photo":{"title":"武功山的云海.jpg","source":"https://commons.wikimedia.org/wiki/File:%E6%AD%A6%E5%8A%9F%E5%B1%B1%E7%9A%84%E4%BA%91%E6%B5%B7.jpg","author":"Leeinm","license":"CC BY 4.0","licenseUrl":"https://creativecommons.org/licenses/by/4.0","file":"photos/wugong-clouds.webp","alt":"武功山的云海"}},{"id":"wugong-golden","name":"金顶远眺","fraction":1,"photo":{"title":"Wugongshan 8350.jpg","source":"https://commons.wikimedia.org/wiki/File:Wugongshan_8350.jpg","author":"Doctoroftcm","license":"CC BY-SA 3.0","licenseUrl":"https://creativecommons.org/licenses/by-sa/3.0","file":"photos/wugong-ridge.webp","alt":"武功山山脊，远处最高峰为金顶"}}],"tiger":[{"id":"tiger-trail","name":"高路山径","fraction":0.25,"photo":{"title":"Tiger Leaping Gorge trail 08.JPG","source":"https://commons.wikimedia.org/wiki/File:Tiger_Leaping_Gorge_trail_08.JPG","author":"BrokenSphere","license":"CC BY-SA 3.0","licenseUrl":"https://creativecommons.org/licenses/by-sa/3.0","file":"photos/tiger-trail.webp","alt":"虎跳峡高路上的山径"}},{"id":"tiger-gorge","name":"峡谷眺望","fraction":0.5,"photo":{"title":"Hiking the Tiger Leaping Gorge.jpg","source":"https://commons.wikimedia.org/wiki/File:Hiking_the_Tiger_Leaping_Gorge.jpg","author":"Jo Schmaltz","license":"CC BY-SA 2.0","licenseUrl":"https://creativecommons.org/licenses/by-sa/2.0","file":"photos/tiger-gorge.webp","alt":"从徒步路线上俯瞰虎跳峡与金沙江"}},{"id":"tiger-halfway","name":"中途路标","fraction":0.75,"photo":{"title":"Tiger Leaping Gorge trail 36.JPG","source":"https://commons.wikimedia.org/wiki/File:Tiger_Leaping_Gorge_trail_36.JPG","author":"BrokenSphere","license":"CC BY-SA 3.0","licenseUrl":"https://creativecommons.org/licenses/by-sa/3.0","file":"photos/tiger-halfway.webp","alt":"虎跳峡徒步路线上的Halfway路标"}}],"aotai":[{"id":"aotai-aoshan","name":"鳌山白起庙","fraction":0.24,"photo":{"title":"鳌山白起庙 - panoramio.jpg","source":"https://commons.wikimedia.org/wiki/File:%E9%B3%8C%E5%B1%B1%E7%99%BD%E8%B5%B7%E5%BA%99_-_panoramio.jpg","author":"江工坊jumperhomes.com","license":"CC BY 3.0","licenseUrl":"https://creativecommons.org/licenses/by/3.0","file":"photos/aotai-aoshan.webp","alt":"鳌山白起庙实拍"}},{"id":"aotai-ridge","name":"秦岭山脊","fraction":0.7,"photo":{"title":"Mountain Taibai No.1.jpg","source":"https://commons.wikimedia.org/wiki/File:Mountain_Taibai_No.1.jpg","author":"Wenmingxing","license":"CC BY-SA 4.0","licenseUrl":"https://creativecommons.org/licenses/by-sa/4.0","file":"photos/aotai-ridge.webp","alt":"太白山的秦岭山脊实景"}},{"id":"aotai-taibai","name":"太白山远眺","fraction":1,"photo":{"title":"Mountain Taibai No.2.jpg","source":"https://commons.wikimedia.org/wiki/File:Mountain_Taibai_No.2.jpg","author":"Wenmingxing","license":"CC BY-SA 4.0","licenseUrl":"https://creativecommons.org/licenses/by-sa/4.0","file":"photos/aotai-taibai.webp","alt":"太白山区域山景实拍"}}]};
 Object.assign(checkpoints,{
  "maclehose": [
    {
      "id": "maclehose-saiwan",
      "name": "西湾沙滩",
      "fraction": 0.3744,
      "photo": {
        "title": "Sai Wan.jpg",
        "source": "https://commons.wikimedia.org/wiki/File:Sai_Wan.jpg",
        "author": "Smallpei",
        "license": "CC BY-SA 4.0",
        "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
        "file": "photos/maclehose-saiwan.webp",
        "alt": "香港西贡西湾的沙滩、海浪和绿色岬角"
      }
    },
    {
      "id": "maclehose-hamtin",
      "name": "咸田海湾",
      "fraction": 0.5251,
      "photo": {
        "title": "Ham Tin Wan beach.jpg",
        "source": "https://commons.wikimedia.org/wiki/File:Ham_Tin_Wan_beach.jpg",
        "author": "Kaldari",
        "license": "CC0",
        "licenseUrl": "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
        "file": "photos/maclehose-hamtin.webp",
        "alt": "香港西贡咸田湾的沙滩与海湾"
      }
    },
    {
      "id": "maclehose-chekkeng",
      "name": "赤径村落",
      "fraction": 0.7795,
      "photo": {
        "title": "ChekKeng3.JPG",
        "source": "https://commons.wikimedia.org/wiki/File:ChekKeng3.JPG",
        "author": "山民主義",
        "license": "CC BY-SA 4.0",
        "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
        "file": "photos/maclehose-chekkeng.webp",
        "alt": "香港赤径村附近的小渡头与平静海湾"
      }
    }
  ],
  "changping": [
    {
      "id": "changping-forest",
      "name": "苔木森林",
      "fraction": 0.25,
      "photo": {
        "title": "Xiaojin, Aba, Sichuan, China - panoramio (42).jpg",
        "source": "https://commons.wikimedia.org/wiki/File:Xiaojin,_Aba,_Sichuan,_China_-_panoramio_(42).jpg",
        "author": "jetsun",
        "license": "CC BY-SA 3.0",
        "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
        "file": "photos/changping-forest.webp",
        "alt": "长坪沟溪边的苔木与针叶林"
      }
    },
    {
      "id": "changping-valley",
      "name": "溪谷云雾",
      "fraction": 0.5,
      "photo": {
        "title": "Xiaojin, Aba, Sichuan, China - panoramio (52).jpg",
        "source": "https://commons.wikimedia.org/wiki/File:Xiaojin,_Aba,_Sichuan,_China_-_panoramio_(52).jpg",
        "author": "jetsun",
        "license": "CC BY-SA 3.0",
        "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
        "file": "photos/changping-valley.webp",
        "alt": "长坪沟林间溪谷与山间云雾"
      }
    },
    {
      "id": "changping-meadow",
      "name": "草甸远眺",
      "fraction": 1,
      "photo": {
        "title": "Xiaojin, Aba, Sichuan, China - panoramio (57).jpg",
        "source": "https://commons.wikimedia.org/wiki/File:Xiaojin,_Aba,_Sichuan,_China_-_panoramio_(57).jpg",
        "author": "jetsun",
        "license": "CC BY-SA 3.0",
        "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
        "file": "photos/changping-meadow.webp",
        "alt": "长坪沟开阔的花草地与山壁"
      }
    }
  ],
  "mogan": [
    {
      "id": "mogan-bamboo",
      "name": "竹林深处",
      "fraction": 0.25,
      "photo": {
        "title": "Mount Mogan bamboo forest.jpg",
        "source": "https://commons.wikimedia.org/wiki/File:Mount_Mogan_bamboo_forest.jpg",
        "author": "Walter Grassroot",
        "license": "CC BY-SA 4.0",
        "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
        "file": "photos/mogan-bamboo.webp",
        "alt": "莫干山云雾中的竹林"
      }
    },
    {
      "id": "mogan-path",
      "name": "山间步道",
      "fraction": 0.5,
      "photo": {
        "title": "Mount Mogan Path3.jpg",
        "source": "https://commons.wikimedia.org/wiki/File:Mount_Mogan_Path3.jpg",
        "author": "Walter Grassroot",
        "license": "CC BY-SA 4.0",
        "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
        "file": "photos/mogan-path.webp",
        "alt": "莫干山树林中的木制山间步道"
      }
    },
    {
      "id": "mogan-stream",
      "name": "山泉小溪",
      "fraction": 1,
      "photo": {
        "title": "Mount Mogan River.jpg",
        "source": "https://commons.wikimedia.org/wiki/File:Mount_Mogan_River.jpg",
        "author": "Walter Grassroot",
        "license": "CC BY-SA 4.0",
        "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
        "file": "photos/mogan-stream.webp",
        "alt": "莫干山石间流淌的溪水"
      }
    }
  ]
});
 checkpoints.westlake=[
  {
    "id": "westlake-creek",
    "name": "九溪溪谷",
    "fraction": 0.25,
    "photo": {
      "title": "Jiuxi 20161004.jpg",
      "source": "https://commons.wikimedia.org/wiki/File:Jiuxi_20161004.jpg",
      "author": "Tyg728",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
      "file": "photos/westlake-creek.webp",
      "alt": "九溪十八涧的溪流、树林与游人"
    }
  },
  {
    "id": "westlake-path",
    "name": "十八涧石径",
    "fraction": 0.5,
    "photo": {
      "title": "九溪十八涧.jpg",
      "source": "https://commons.wikimedia.org/wiki/File:%E4%B9%9D%E6%BA%AA%E5%8D%81%E5%85%AB%E6%B6%A7.jpg",
      "author": "三猎",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
      "file": "photos/westlake-path.webp",
      "alt": "九溪十八涧树林中的石板步道"
    }
  },
  {
    "id": "westlake-tea",
    "name": "龙井茶村",
    "fraction": 1,
    "photo": {
      "title": "Longjing tea village Hangzhou.jpg",
      "source": "https://commons.wikimedia.org/wiki/File:Longjing_tea_village_Hangzhou.jpg",
      "author": "Niklas Dougherty",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
      "file": "photos/westlake-tea.webp",
      "alt": "龙井村的房屋与周围茶园"
    }
  }
];
 const routes=[
 {id:'wugong',geoId:'wugong',name:'武功山',subtitle:'中庵—金顶步道',region:'江西 · 草甸与云海',hazards:true,theme:'meadow',initialWarmth:100,brief:'沿水彩山径看草甸、云海与金顶远眺。牵线飞行、拨云见山、邂逅帮拍与石坛拼图串起沿途四段小事，每到打卡点解锁实景。',notice:'本关是中庵至金顶附近的OSM连通步道选段，不是整个武功山穿越。地图数据不代表实时开放情况。',weather:[{turn:0,type:'clear'},{turn:4,type:'fog'},{turn:10,type:'rain'},{turn:16,type:'wind'},{turn:22,type:'clear'}]},
 {id:'tiger',geoId:'tiger',name:'虎跳峡',subtitle:'高路走向 · 实景打卡',region:'云南 · 峡谷与山径',hazards:true,theme:'gorge',initialWarmth:95,brief:'沿参考高路走向穿过卡通峡谷。解锁山径、峡谷和中途路标的实景照片，留意雨雾与体力。',notice:'由公开往返GPX切出去程。属于历史记录；官方通告限制擅自进入高路等未开发区域，游戏不表示当前可通行。',weather:[{turn:0,type:'clear'},{turn:3,type:'rain'},{turn:9,type:'fog'},{turn:15,type:'rain'},{turn:21,type:'clear'}]},
 {id:'aotai',geoId:'aotai',name:'鳌太线',subtitle:'秦岭走向 · 风雪演练',region:'陕西 · 秦岭',hazards:true,theme:'snow',initialWarmth:72,brief:'沿秦岭历史路线走向展开虚拟风雪演练。解锁鳌山与太白山区域实景，也要及时保温、辨向或撤回。',notice:'真实历史GPX，不是当前可用的穿越许可。鳌太未经批准穿越违法；原文件末点原样保留，不延伸到山峰。卡通地形为插画，打卡站为沿途区域的近似展示。',weather:[{turn:0,type:'snow'},{turn:4,type:'blizzard'},{turn:10,type:'fog'},{turn:14,type:'snow'},{turn:20,type:'wind'},{turn:26,type:'clear'}]}
 ];
 routes.push(...[
  {
    "id": "maclehose",
    "name": "麦理浩径第二段",
    "subtitle": "浪茄—北潭凹",
    "region": "香港 · 海湾与山径",
    "theme": "coast",
    "initialWarmth": 100,
    "brief": "从山脊走向沙滩，让潮声陪你走过西贡的海湾。",
    "notice": "路线取自香港渔农自然护理署第二段GPX。沿途照片展示所在海湾；具体拍摄位置不与游戏小人位置一一对应。",
    "weather": [
      {
        "turn": 0,
        "type": "clear"
      },
      {
        "turn": 4,
        "type": "wind"
      },
      {
        "turn": 18,
        "type": "clear"
      }
    ],
    "geoId": "maclehose",
    "hazards": false
  },
  {
    "id": "changping",
    "name": "四姑娘山长坪沟",
    "subtitle": "喇嘛寺附近—木骡子",
    "region": "四川 · 森林与溪谷",
    "theme": "forest",
    "initialWarmth": 95,
    "brief": "沿着林间栈道进入溪谷，直到树林让开一片草甸。",
    "notice": "采用OSM喇嘛寺附近至木骡子附近的连通步道去程，属于地图选段。游戏在木骡子附近结束，不接入长穿毕翻山段。",
    "weather": [
      {
        "turn": 0,
        "type": "fog"
      },
      {
        "turn": 9,
        "type": "clear"
      },
      {
        "turn": 19,
        "type": "wind"
      },
      {
        "turn": 25,
        "type": "clear"
      }
    ],
    "geoId": "changping",
    "hazards": false
  },
  {
    "id": "mogan",
    "name": "莫干山竹林步道",
    "subtitle": "莫干岭古道选段",
    "region": "浙江 · 竹林与石阶",
    "theme": "bamboo",
    "initialWarmth": 100,
    "brief": "接一筒叶尖雨，走出石阶的节奏，再把纸叶送过竹隙。",
    "notice": "采用OSM莫干岭古道西坡至大坑侧的连通选段。照片展示莫干山区域风景，不标记精确摄影机位。",
    "weather": [
      {
        "turn": 0,
        "type": "fog"
      },
      {
        "turn": 5,
        "type": "rain"
      },
      {
        "turn": 14,
        "type": "clear"
      }
    ],
    "geoId": "mogan",
    "hazards": false
  }
]);
 routes.push({
  "id": "westlake",
  "geoId": "westlake",
  "name": "西湖·九溪龙井",
  "subtitle": "九溪十八涧—龙井村",
  "region": "杭州 · 溪谷与茶园",
  "hazards": false,
  "theme": "tea",
  "initialWarmth": 100,
  "brief": "沿九溪十八涧的石板路听溪声，慢慢走进龙井茶园。",
  "notice": "九溪烟树附近至龙井村口的连通步道选段，末段经过村路；地图用于虚拟旅程。",
  "weather": [
    {
      "turn": 0,
      "type": "clear"
    },
    {
      "turn": 5,
      "type": "fog"
    },
    {
      "turn": 13,
      "type": "clear"
    }
  ]
});
 for(const r of routes){r.geo=geo[r.geoId];r.checkpoints=Object.freeze(checkpoints[r.geoId].map(c=>Object.freeze({...c,photo:Object.freeze(c.photo)})));Object.freeze(r.weather);Object.freeze(r);}const ROUTES=Object.freeze(routes);function getRoute(id='wugong'){return ROUTES.find(r=>r.id===id)||ROUTES[0];}return {ROUTES,getRoute};
}));
