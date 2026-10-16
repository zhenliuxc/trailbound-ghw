(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.TrailRouteMoments=api;}(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const EDITION=3;
 const SOURCES={
  wugong:{name:'武功山景区 · 推荐景点',url:'https://www.wugongshan.cn/act/jqgk/spots.html',fact:'高山草甸与金顶古祭坛是武功山的代表景观；云海是受天气影响的景象。'},
  tiger:{name:'虎跳峡高路 · 公开徒步实录',url:'https://jingxuan.douyin.com/m/video/7623300390808866082',fact:'高路沿峡谷山腰行进，茶马、中途客栈和龙洞瀑布串起眺望雪山与江谷的体验。'},
  aotai:{name:'太白山自然保护区 · 秦岭地貌',url:'https://nyncj.baoji.gov.cn/col4165/col4170/202510/t20251016_1219276.html',fact:'秦岭高处的石海、刃脊与角峰属于冰川遗迹景观。本章为虚拟地貌观察，不是现实穿越推荐；未经批准穿越鳌太线属违法行为。'},
  maclehose:{name:'渔农自然护理署 · 西贡东郊野公园',url:'https://www.afcd.gov.hk/english/country/cou_vis/cou_vis_cou/cou_vis_cou_ske/cou_vis_cou_ske.html',fact:'麦理浩径第二段由浪茄至北潭凹，经过西湾山、海湾和赤径一带。海湾展开、沙滩潮线与村落岸边各有不同的节奏。'},
  changping:{name:'四姑娘山管理局 · 长坪沟',url:'https://www.sgns.cn/understand/cpg',fact:'长坪沟的代表景物包括枯树滩、红石阵、木骡子草甸。红色藻类密集生长在花岗岩上形成红石景观，木骡子可见草甸、溪流与雪山。'},
  mogan:{name:'湖州发布 · 莫干山古道',url:'https://www.thepaper.cn/newsDetail_forward_2597949',fact:'莫干山古道保留石铺小路，串联山林和山居。本作取莫干岭至大坑侧选段的竹林、岭口与林隙意象，不混入其他古道的具体景点。'},
  westlake:{name:'杭州 · 九溪至龙井村',url:'https://www.hzzx.gov.cn/cshz/content/2024-07/08/content_8755727.htm',fact:'九溪烟树—九溪十八涧—龙井村串起浅溪、石径、茶园与茶村。春芽、透光和雨后景物均按虚拟时节演绎，不代表每次都能遇到。'}
 };
 const rows=[
  ['meadow-bird','草浪来信','一阵风翻过草甸','武功山 · 金顶草甸','grass','sweep','breeze','flower','轻轻横划，陪风走过一整片草坡。','风从草甸一端传到另一端，草穗一层一层亮起来。'],
  ['meadow-butterfly','云海开信','山脊从云海里露出来','武功山 · 金顶山脊','cloudsea','wait','breeze','cloud','停住指尖，等云海缓缓让出一道山脊。','我没有催促那片云，山脊终于从白色海面里露出来。','云海片刻'],
  ['meadow-flower','金顶石语','古祭坛的石拱轮廓','武功山 · 金顶古祭坛','altar','turn','trace','stones','左右移动视角，看看石块怎样围成拱顶。','换了一个观看角度，石块围成的拱顶与缝隙都清楚了。'],
  ['gorge-goat','江谷回响','峡谷在脚下展开','虎跳峡 · 高路山径','canyon','panorama','breeze','stones','缓缓横移视线，让近崖、深谷和远山依次展开。','高路旁的近崖移开一点，江谷的纵深一下子展开了。'],
  ['gorge-eagle','雪山同坐','客栈旁的一小段歇脚','虎跳峡 · 中途一带','inn','listen','breeze','sun','轻点近处、谷底和远山，听这一小段歇脚时光。','我在客栈旁多坐了一会儿，近处的轻响和远处的江声有了距离。'],
  ['gorge-sparkle','瀑布来风','龙洞瀑布的一层水雾','虎跳峡 · 龙洞瀑布','waterfall','spray','drip','drop','把视线移向水帘，在水雾里停留一小会儿。','水帘的声音近了，瀑布散开的水雾像一阵凉风。'],
  ['snow-tracks','石海折光','石海里明暗不同的棱面','秦岭 · 虚拟石海','boulders','turn','trace','stones','左右移开视角，看看石海岩块的棱面。','岩块的棱面随着视角换了明暗，石海的层次比想象中更深。'],
  ['snow-lichen','秦岭脊线','刃脊与角峰的剪影','秦岭 · 虚拟山脊','ridge','outline','trace','stones','沿三个亮起的转折，慢慢描出山脊的轮廓。','我沿着明暗交界看清山脊，尖峰与山坳终于连成一条线。'],
  ['snow-light','雾隙见峰','雾里显出的一座角峰','秦岭 · 虚拟角峰','mistpeak','wait','breeze','cloud','停下来听风，等雾中的峰线慢慢显现。','风声留在耳边，雾松开一点，角峰从空白里显了出来。','山雾片刻'],
  ['coast-sand','海湾展开','翻过山坡后出现的海湾','麦理浩径 · 西湾山一带','bay','panorama','breeze','tide','慢慢转动视线，让沙湾与远处山尖完整展开。','山坡后的海湾一点点打开，白沙把碧绿的海水轻轻围住。'],
  ['coast-shell','潮汐收笔','留给下一道浪的一笔','麦理浩径 · 咸田湾沙滩','sand','sand','ripple','tide','在湿沙上画一笔，松手后等潮水把它带走。','我在湿沙上留下一笔，下一道潮水轻轻把它收走。'],
  ['coast-pier','赤径慢潮','村落岸边慢下来的水','麦理浩径 · 赤径','harbour','settle','ripple','pier','轻碰水面，再停一会儿，等村落倒影慢慢平静。','海湾安静下来，岸边的屋舍和小渡头又完整地回到水里。'],
  ['valley-moss','枯树照影','枯树滩里上下相望的枝桠','长坪沟 · 枯树滩','deadtrees','align','ripple','reflection','移动水中的枝影，让它与岸上的树桩对齐。','水中的枝影与岸上的树桩合上了，枯树滩像有两层天空。','浅水片刻'],
  ['valley-bridge','红石微光','花岗岩上的一片红色世界','长坪沟 · 红石阵','redrock','inspect','trace','lichen','移动透镜，在红色石面上停一下，看细小的纹理。','放大后才发现，红石表面藏着一片细小而丰富的红色世界。'],
  ['valley-reflection','木骡子开阔','走出森林后迎来的草甸','长坪沟 · 木骡子','alpine','panorama','breeze','moss','缓缓打开林边的视野，让溪流、草甸和雪山一起出现。','森林在身后让开，溪流、草甸和雪山终于进入同一幅画面。'],
  ['bamboo-drop','竹涛一阵','一阵风穿过竹梢','莫干山 · 莫干岭竹林','bamboowind','sweep','breeze','leaf','轻轻横划，让竹梢把一阵风传向林子深处。','一排竹梢接过风，竹叶的沙沙声沿着林子往远处走。'],
  ['bamboo-step','古道留痕','石铺路上被岁月磨亮的地方','莫干山 · 莫干岭古道','stonepath','inspect','trace','steps','移近透镜，看看石缝、苔色和被脚步磨亮的石面。','石缝里的苔色和磨亮的石面，一起留下了古道走过的岁月。'],
  ['bamboo-leaf','林隙远山','竹林间留出的一小扇窗','莫干山 · 大坑侧山林','forestwindow','panorama','breeze','leaf','缓缓移动视线，从林隙里找出远处的山。','竹影之间让出一小扇窗，远山安静地出现在林隙里。'],
  ['westlake-stones','涉溪清响','沿着石径经过浅溪','西湖 · 九溪溪谷','creeksteps','trail','ripple','stones','从最近的溪石开始，沿石径看水怎样绕过去。','我沿着溪石看过去，浅水绕着石径走出细细的波纹。'],
  ['westlake-tea','一芽春信','茶园里一芽一叶的细节','西湖 · 龙井茶园','teasprig','inspect','leaf','tea','移近透镜，看看新芽与叶脉，不摘下它。','透镜里的新芽与叶脉都清楚了，一点春意留在茶园里，也留在手边。','春日片刻'],
  ['westlake-eaves','一盏龙井','茶村歇脚时舒展的茶叶','西湖 · 龙井村','teacup','brew','drip','tea','轻点茶盏，等叶子在温水里慢慢舒展。','茶叶在温水里慢慢舒展，我也在村口把脚步放缓。'],
  ['westlake-floating-leaf','水绕石行','石头旁打转的一片落叶','西湖 · 九溪溪谷','creekleaf','guide','ripple','leaf','顺着亮起的水路，让落叶转过溪石。','落叶沿着弯弯的水路过去，终于转过了那块石头。'],
  ['westlake-leaf-shadow','茶垄流光','光沿茶垄落下来','西湖 · 龙井茶园','tealight','align','leaf','tea','移动光斑，让它落在茶叶透亮的轮廓上。','光沿茶垄落下来，叶脉被照得透亮，一点温暖停在茶园里。','晴日片刻'],
  ['westlake-basket','村口茶香','一盏茶等人坐下来','西湖 · 龙井村口','villagetea','brew','drip','tea','轻点茶盏，陪叶子慢慢展开，在村口歇一会儿。','一盏茶在村口冒着轻轻的热气，等叶子展开时，我也不着急赶路了。']
 ];
 const PROFILES=Object.fromEntries(rows.map(([id,tag,name,place,scene,play,interaction,icon,prompt,result,condition])=>[id,{edition:EDITION,tag,name,place,scene,play,interaction,icon,prompt,result,condition:condition||'沿途片刻',hint:prompt,memory:place+'，'+name+'。',badge:'badges/'+id+'-v3.svg'}]));
 // Keep collectible identities and existing journal text. Fresh Mogan encounters
 // describe their actual registered games, including the earned reward copy.
 Object.assign(PROFILES['bamboo-drop'],{name:'叶尖落下的一段小调',hint:'看叶尖蓄水，移动竹筒，把滴雨接成一段旋律。',prompt:'看叶尖蓄水，左右移动竹筒，把落雨接成一段旋律。',result:'叶尖先亮起一颗水珠。我挪过竹筒，接住一声又一声轻响；最后一滴落下，竹林里留下了一小段雨的旋律。'});
 Object.assign(PROFILES['bamboo-step'],{name:'跟着脚步走一段古道',hint:'脚印合上时，交替迈左脚、右脚，走过十级石阶。',prompt:'脚印合上时，点亮起的那只脚，走完这段石阶。',result:'我跟着石阶的长短，左脚、右脚，慢慢走过雨后的古道。苔色留在石边，十次轻轻的落脚，把山路接成了自己的节奏。'});
 Object.assign(PROFILES['bamboo-leaf'],{name:'送过竹隙的一枚纸叶',hint:'向后拉开纸叶，松手送到远山窗旁的纸签。',prompt:'向后拉开纸叶，松手送过竹隙，落在远山纸签上。',result:'我把一枚纸叶放上竹弓，试着借一小段风。纸叶穿过竹隙，轻轻停在远山纸签上；林子里的那扇窗，也亮了起来。'});
 // Explicit scenery matches only; unmatched artwork does not invent new encounters.
 const ART_V4={"meadow-bird":"wugong-grass-letter","meadow-butterfly":"wugong-cloud-island","meadow-flower":"wugong-stone-altar","gorge-goat":"tiger-river-below","gorge-eagle":"tiger-halfway-rest","gorge-sparkle":"tiger-longdong-waterfall","snow-tracks":"aotai-rock-facets","snow-lichen":"aotai-ridgeline","coast-sand":"maclehose-bay-reveal","coast-shell":"maclehose-tide-drawing","coast-pier":"maclehose-chek-keng","valley-moss":"changping-tree-double","valley-bridge":"changping-red-stone","valley-reflection":"changping-muluozi","bamboo-drop":"mogan-bamboo-reply","bamboo-step":"mogan-old-stone-path","westlake-stones":"westlake-creek-stones","westlake-tea":"westlake-longjing-bud"};
 for(const [id,art] of Object.entries(ART_V4))PROFILES[id].artV4="badges/"+art+"-v4.webp";
 const ENCOUNTERS=[
  {
    "id": "wugong-wind-hiker",
    "route": "wugong",
    "order": 1.5,
    "at": 0.55,
    "tag": "吊带追风",
    "name": "风口遇见的徒步者",
    "place": "武功山 · 草甸风口",
    "play": "sweep",
    "interaction": "breeze",
    "prompt": "轻轻横划，把草甸上的一阵风送到徒步者身旁。",
    "result": "风吹起衣角，我们隔着草坡挥了挥手。",
    "edition": 3,
    "bonus": true,
    "scene": "encounter-art",
    "icon": "stones",
    "condition": "游戏虚构片刻",
    "hint": "轻轻横划，把草甸上的一阵风送到徒步者身旁。",
    "memory": "武功山 · 草甸风口，风口遇见的徒步者。",
    "artV4": "badges/wugong-wind-hiker-v4.webp",
    "badge": "badges/wugong-wind-hiker-v4.webp"
  },
  {
    "id": "tiger-bell-first",
    "route": "tiger",
    "order": 1.5,
    "at": 0.55,
    "tag": "铃声先到",
    "name": "转弯前传来的铃声",
    "place": "虎跳峡 · 高路转弯处",
    "play": "listen",
    "interaction": "breeze",
    "prompt": "依次轻点画面的左、中、右三处，听铃声沿山路慢慢走近。",
    "result": "先听见铃声，再望见山路上的旅伴。这段相遇轻轻留在了峡谷里。",
    "edition": 3,
    "bonus": true,
    "scene": "encounter-art",
    "icon": "stones",
    "condition": "游戏虚构片刻",
    "hint": "依次轻点画面的左、中、右三处，听铃声沿山路慢慢走近。",
    "memory": "虎跳峡 · 高路转弯处，转弯前传来的铃声。",
    "artV4": "badges/tiger-bell-first-v4.webp",
    "badge": "badges/tiger-bell-first-v4.webp"
  },
  {
    "id": "aotai-takin-first",
    "route": "aotai",
    "order": 1.5,
    "at": 0.55,
    "tag": "牛牛先请",
    "name": "把山径留给羚牛",
    "place": "秦岭 · 虚拟雪地林缘",
    "play": "yield",
    "interaction": "trace",
    "prompt": "轻点画面左侧的退让处，再停住指尖，让羚牛从远处先经过。",
    "result": "我退在路旁，没有靠近或喂食。羚牛从远处慢慢走过，雪地又安静下来。",
    "edition": 3,
    "bonus": true,
    "scene": "encounter-art",
    "icon": "stones",
    "condition": "游戏虚构片刻",
    "hint": "轻点画面左侧的退让处，再停住指尖，让羚牛从远处先经过。",
    "memory": "秦岭 · 虚拟雪地林缘，把山径留给羚牛。",
    "artV4": "badges/aotai-takin-first-v4.webp",
    "badge": "badges/aotai-takin-first-v4.webp"
  },
  {
    "id": "maclehose-sideways-crab",
    "route": "maclehose",
    "order": 1.5,
    "at": 0.73,
    "tag": "横着也能到",
    "name": "沙地上的小小横行者",
    "place": "麦理浩径 · 海湾沙地",
    "play": "trail",
    "interaction": "ripple",
    "prompt": "从左到右点亮沙地上的三个落脚处，远远陪螃蟹横着走回岸边。",
    "result": "小螃蟹横着走过沙地。我留在原处，没有触碰它，也没有挡住它回家的路。",
    "edition": 3,
    "bonus": true,
    "scene": "encounter-art",
    "icon": "stones",
    "condition": "游戏虚构片刻",
    "hint": "从左到右点亮沙地上的三个落脚处，远远陪螃蟹横着走回岸边。",
    "memory": "麦理浩径 · 海湾沙地，沙地上的小小横行者。",
    "artV4": "badges/maclehose-sideways-crab-v4.webp",
    "badge": "badges/maclehose-sideways-crab-v4.webp"
  },
  {
    "id": "westlake-five-more-minutes",
    "route": "westlake",
    "order": 2.5,
    "at": 0.945,
    "tag": "再坐五分钟",
    "name": "茶村里多坐一小会儿",
    "place": "西湖 · 龙井村歇脚处",
    "play": "brew",
    "interaction": "drip",
    "prompt": "轻点茶盏，再陪热气慢慢升起；几秒就好，不必真的等五分钟。",
    "result": "我在茶村坐下来，等热气慢慢升起。这一小段不赶路的时间，也值得留下。",
    "edition": 3,
    "bonus": true,
    "scene": "encounter-art",
    "icon": "stones",
    "condition": "游戏虚构片刻",
    "hint": "轻点茶盏，再陪热气慢慢升起；几秒就好，不必真的等五分钟。",
    "memory": "西湖 · 龙井村歇脚处，茶村里多坐一小会儿。",
    "artV4": "badges/westlake-five-more-minutes-v4.webp",
    "badge": "badges/westlake-five-more-minutes-v4.webp"
  }
];
 for(const entry of ENCOUNTERS)PROFILES[entry.id]=entry;
 PROFILES['tiger-bell-first'].icon='bell';
 for(const id of ['snow-light','bamboo-leaf','westlake-eaves','westlake-floating-leaf','westlake-leaf-shadow','westlake-basket'])PROFILES[id].artV5='badges/'+id+'-v5.webp';
 // Current play descriptions only; saved journal text and badge editions stay untouched.
 Object.assign(PROFILES['meadow-bird'],{name:'借一阵草甸的风',prompt:'上下拖动牵线，陪纸鸢从草坡起飞、穿过侧风，再缓缓放线进入云海。跟着风带调整，脱风后可重新找回航线；方向键也能牵线。',result:'我顺着草浪牵起纸鸢，带它穿过山脊的侧风，再缓缓放线。它沿着一整段风路，飞向了云海。'});
 Object.assign(PROFILES['meadow-butterfly'],{name:'拨开云，看看山',prompt:'点一点或划过云朵，让山脊露出来。',result:'我轻轻拨开山脊前的云。云絮随着风散去，绿色的草脊浮出云海，像一封慢慢打开的信。'});
 Object.assign(PROFILES['meadow-flower'],{name:'把石拱，拼回纸上',prompt:'把下面的六片画片拖进画框。也可以先点画片，再点对应位置。',result:'我把散开的石坛画片一块块拼好，接回拱线、石缝与苔色。一座石坛，在纸上重新完整了。'});
 Object.assign(PROFILES['wugong-wind-hiker'],{name:'在草甸的风里，遇见她',prompt:'和草坡旁的姑娘打声招呼，帮她把人物与远山一起拍进照片。拖动取景、按下快门，可以重拍；给她看过照片并告别，才留下这段相遇。',result:'草甸风口遇见一位笑着招手的姑娘。我帮她把身后的山也拍进照片，给她看过后，在风里说了再见。'});
 for(const id of ['meadow-bird','meadow-butterfly','meadow-flower','wugong-wind-hiker'])PROFILES[id].hint=PROFILES[id].prompt;
 Object.assign(PROFILES['bamboo-drop'],{name:'竹叶落雨，接成一段声音',prompt:'左右移动竹筒，接住八滴竹叶上的雨。接住才会奏响音符，漏接可以继续。',result:'竹叶上的雨落进竹筒，八个清亮的声音串起了这段竹林记忆。'});
 Object.assign(PROFILES['westlake-floating-leaf'],{prompt:'轻点落叶旁的水面，用水纹推它绕过溪石，经过三个金色水口。',result:'我用一圈圈水纹，陪落叶终于转过溪石，漂进下游的光里。'});
 Object.assign(PROFILES['westlake-tea'],{name:'让一芽春信，慢慢透亮',prompt:'交换相邻的茶芽卡，连成三个或更多同类叶形，清开六处露光。可以点选或滑动交换，提示、重排与撤回都可用。',result:'我交换叶形，让相连的春芽一片片舒展。六处露光散开，纸上的茶园重新透亮起来。'});
 Object.assign(PROFILES['bamboo-leaf'],{name:'给远山，送一枚纸叶',prompt:'拉开纸叶，调整角度与力度，松手让它穿过竹隙，停在远山纸签上。碰到竹干可以重来，也可用调整条与按钮发射。',result:'我把一枚纸叶送进竹林的风里。它穿过竹影，稳稳停在远山窗旁的小纸签上。'});
 for(const id of ['meadow-flower','westlake-tea','bamboo-leaf'])PROFILES[id].hint=PROFILES[id].prompt;
 function profile(id){return PROFILES[id]||null;}
 const routeOf=id=>({meadow:'wugong',gorge:'tiger',snow:'aotai',coast:'maclehose',valley:'changping',bamboo:'mogan',westlake:'westlake'})[id.split('-')[0]];
 function evidence(id){const e=PROFILES[id];return e?.bonus?{...SOURCES[e.route],fact:'这一段人物或动物相遇是游戏创作，不代表现实路线必遇。'+SOURCES[e.route].fact}:SOURCES[routeOf(id)]||null;}
 return {EDITION,ENCOUNTERS,PROFILES,SOURCES,profile,evidence};
}));
