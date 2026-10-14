(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.TrailNature=api;}(typeof globalThis!=='undefined'?globalThis:this,function makeNature(){
 'use strict';
 const SOURCES=Object.freeze({
  wugong:{name:'文化和旅游部 · 武功山草甸与云海',url:'https://www.mct.gov.cn/whzx/qgwhxxlb/jx/202401/t20240102_950613.htm'},
  gorge:{name:'迪庆州政府 · 虎跳峡山地景观',url:'https://www.diqing.gov.cn/zfxxgk_dqzzf/fdzdgknr/zdmslyxx/jyxxgk/ggty/202510/20251010_232970.html'},
  village:{name:'迪庆州政府 · 山村与高路',url:'https://www.diqing.gov.cn/zfxxgk_dqzzf/zhengcewenjian/zdgkwj/dizhengbanfa/202408/20240802_217696.html'},
  qinling:{name:'生态环境部 · 太白山自然保护区',url:'https://www.mee.gov.cn/ywgz/zrstbh/zrbhdjg/200211/t20021107_82958.shtml'},
  taibai:{name:'国家林草局 · 太白山地貌与植被',url:'https://www.forestry.gov.cn/c/www/xtq/12845.jhtml'},
  fog:{name:'美国国家气象局 · 雾的形成',url:'https://www.weather.gov/lmk/fog_tutorial'},
  lichen:{name:'马里兰大学 · 地衣与苔藓',url:'https://extension.umd.edu/resource/lichen-algae-and-moss-trees'}
 });
 const CHECKPOINTS={
  'wugong-meadow':{route:'wugong',title:'山顶为什么像草原？',look:'先看草甸铺在哪里，再找森林与开阔山脊的边界。',fact:'武功山的代表景观是江南湿润山地中的高山草甸。开阔的草坡和低处森林共同组成这里的山野风景。',source:'wugong'},
  'wugong-clouds':{route:'wugong',title:'雾是走到身边的云',look:'留意远山边缘怎样被遮住，又怎样慢慢露出来。',fact:'雾中有悬浮的微小水滴。空气足够湿润并冷却时，水汽可以凝结成小水滴；山里的云雾因而会改变你看见风景的方式。',source:'fog'},
  'wugong-golden':{route:'wugong',title:'一条山脉，不只一座山',look:'从近处草脊看向远处群峰，找一找山的层次。',fact:'武功山位于罗霄山脉北段。眼前的草脊属于更长的山地系统，森林、草甸和云海只是它的不同面貌。',source:'wugong'},
  'tiger-trail':{route:'tiger',title:'高路与江流在不同高度',look:'先找脚边的山径，再找很远下面的江流。',fact:'虎跳峡的金沙江穿行在玉龙、哈巴雪山之间。高路视角里的陡坡、对岸山体和低处江流，让峡谷的高差更容易被看见。',source:'gorge'},
  'tiger-gorge':{route:'tiger',title:'山把江夹在中间',look:'对照两侧山壁、谷底江流和更远的峰顶。',fact:'虎跳峡是深切的山地峡谷。这里的风景不是平地上孤立的几块石头，而是两侧高山、陡坡与江谷形成的整体。',source:'gorge'},
  'tiger-halfway':{route:'tiger',title:'山里也有人过日子',look:'注意路标、屋舍与山坡之间的关系。',fact:'虎跳峡周边山村与徒步高路相连，村民的生活、农作和客栈也构成山地文化。看自然风景时，也可以留意人与山的相处。',source:'village'},
  'aotai-aoshan':{route:'aotai',title:'往高处走，树林会变',look:'比较低处的树冠、针叶树与高处开阔地。',fact:'太白山区域有明显的植被垂直分带。不同高度的环境条件不同，森林、灌丛与高山草甸并非随机混在一起。',source:'qinling'},
  'aotai-ridge':{route:'aotai',title:'石海也是一片风景',look:'留意裸岩、碎石和草丛，不只寻找白雪。',fact:'太白山高处有石海、石河和古冰川遗迹。秦岭高山的辨识度也来自岩石地貌，不能只用一排白色尖峰代表它。',source:'taibai'},
  'aotai-taibai':{route:'aotai',title:'雪不是山的全部',look:'看看山景里还有哪些岩石、植被与云层。',fact:'太白山汇集森林、灌丛、岩石、高山草甸和冰川遗迹，景观还随季节变化。某张雪景照片并不能代表这里全年都被积雪覆盖。',source:'taibai'}
 };
 const OBSERVATIONS={
  "meadow-bird": {
    "route": "wugong",
    "title": "武功山 · 山脊草甸",
    "look": "先看草甸铺在哪里，再找森林与开阔山脊的边界。",
    "fact": "武功山的代表景观是江南湿润山地中的高山草甸。开阔的草坡和低处森林共同组成这里的山野风景。",
    "source": "wugong",
    "checkpointId": "wugong-meadow",
    "place": "武功山 · 山脊草甸"
  },
  "meadow-butterfly": {
    "route": "wugong",
    "title": "武功山 · 云海变化",
    "look": "留意远山边缘怎样被遮住，又怎样慢慢露出来。",
    "fact": "雾中有悬浮的微小水滴。空气足够湿润并冷却时，水汽可以凝结成小水滴；山里的云雾因而会改变你看见风景的方式。",
    "source": "fog",
    "checkpointId": "wugong-clouds",
    "place": "武功山 · 云海变化"
  },
  "meadow-flower": {
    "route": "wugong",
    "title": "武功山 · 罗霄群峰",
    "look": "从近处草脊看向远处群峰，找一找山的层次。",
    "fact": "武功山位于罗霄山脉北段。眼前的草脊属于更长的山地系统，森林、草甸和云海只是它的不同面貌。",
    "source": "wugong",
    "checkpointId": "wugong-golden",
    "place": "武功山 · 罗霄群峰"
  },
  "gorge-goat": {
    "route": "tiger",
    "title": "虎跳峡 · 高路与深谷",
    "look": "先找脚边的山径，再找很远下面的江流。",
    "fact": "虎跳峡的金沙江穿行在玉龙、哈巴雪山之间。高路视角里的陡坡、对岸山体和低处江流，让峡谷的高差更容易被看见。",
    "source": "gorge",
    "checkpointId": "tiger-trail",
    "place": "虎跳峡 · 高路与深谷"
  },
  "gorge-eagle": {
    "route": "tiger",
    "title": "虎跳峡 · 两山夹江",
    "look": "对照两侧山壁、谷底江流和更远的峰顶。",
    "fact": "虎跳峡是深切的山地峡谷。这里的风景不是平地上孤立的几块石头，而是两侧高山、陡坡与江谷形成的整体。",
    "source": "gorge",
    "checkpointId": "tiger-gorge",
    "place": "虎跳峡 · 两山夹江"
  },
  "gorge-sparkle": {
    "route": "tiger",
    "title": "虎跳峡 · 山村与路标",
    "look": "注意路标、屋舍与山坡之间的关系。",
    "fact": "虎跳峡周边山村与徒步高路相连，村民的生活、农作和客栈也构成山地文化。看自然风景时，也可以留意人与山的相处。",
    "source": "village",
    "checkpointId": "tiger-halfway",
    "place": "虎跳峡 · 山村与路标"
  },
  "snow-tracks": {
    "route": "aotai",
    "title": "秦岭 · 林带变化",
    "look": "比较低处的树冠、针叶树与高处开阔地。",
    "fact": "太白山区域有明显的植被垂直分带。不同高度的环境条件不同，森林、灌丛与高山草甸并非随机混在一起。",
    "source": "qinling",
    "checkpointId": "aotai-aoshan",
    "place": "秦岭 · 林带变化"
  },
  "snow-lichen": {
    "route": "aotai",
    "title": "秦岭 · 岩面的地衣",
    "look": "留意岩石上的色块，是贴着石面，还是像薄薄的小叶片。",
    "fact": "地衣是真菌与藻类等伙伴组成的共生体，可以长在岩石上。它与苔藓不同；这里介绍生态知识，不鉴定某个地点的具体物种。",
    "source": "lichen",
    "checkpointId": "aotai-ridge",
    "place": "秦岭 · 岩面的地衣"
  },
  "snow-light": {
    "route": "aotai",
    "title": "太白山 · 石海与古冰川",
    "look": "在太白山区域照片中，找找岩石地貌与季节性积雪。",
    "fact": "太白山高处有石海、石河与古冰川遗迹。大片岩石、高山草甸和季节变化，也是秦岭高山的辨识度。",
    "source": "taibai",
    "checkpointId": "aotai-taibai",
    "place": "太白山 · 石海与古冰川"
  }
};
 for(const set of [SOURCES,CHECKPOINTS,OBSERVATIONS]){for(const value of Object.values(set))Object.freeze(value);Object.freeze(set);}
 const checkpoint=id=>CHECKPOINTS[id]||null,observation=id=>OBSERVATIONS[id]||null,source=id=>SOURCES[id]||null;
 function moment(routeId,progress=0){const entries=Object.values(CHECKPOINTS).filter(e=>e.route===routeId);if(!entries.length)return null;const p=Number.isFinite(progress)?Math.max(0,Math.min(1,progress)):0;return entries[Math.min(entries.length-1,Math.floor(p*entries.length))];}
 return {SOURCES,CHECKPOINTS,OBSERVATIONS,checkpoint,observation,source,moment};
}));
