// Generated from src/runtime/index.ts. Edit src/, then run npm run build.
"use strict";
var TrailRuntime = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // .build/typescript/runtime/index.js
  var index_exports = {};
  __export(index_exports, {
    BEAT_SECONDS: () => BEAT_SECONDS,
    CHAPTERS: () => CHAPTERS,
    CUP: () => CUP,
    MAP_CHARACTER_FILE: () => MAP_CHARACTER_FILE,
    MAP_WALK_FILE: () => MAP_WALK_FILE,
    MOGAN_GAMES: () => MOGAN_GAMES,
    MOGAN_MEMORIES: () => MOGAN_MEMORIES,
    MOGAN_MUSIC: () => MOGAN_MUSIC,
    MOGAN_ROUTE_ASSETS: () => MOGAN_ROUTE_ASSETS,
    MOGAN_THEMES: () => MOGAN_THEMES,
    RAIN_PHRASE: () => RAIN_PHRASE,
    ROUTE_SUMMARIES: () => ROUTE_SUMMARIES,
    TIGER_GAMES: () => TIGER_GAMES,
    TIGER_ROUTE_ASSETS: () => TIGER_ROUTE_ASSETS,
    TIGER_TRAIL_ROUTE_ASSETS: () => TIGER_TRAIL_ROUTE_ASSETS,
    TRAIL_GAMES: () => TRAIL_GAMES,
    WUGONG_MAP_ASSETS: () => WUGONG_MAP_ASSETS,
    WUGONG_MUSIC: () => WUGONG_MUSIC,
    WUGONG_THEMES: () => WUGONG_THEMES,
    WUGONG_WAYPOINTS: () => WUGONG_WAYPOINTS,
    WUGONG_WAYPOINT_HEIGHT: () => WUGONG_WAYPOINT_HEIGHT,
    WUGONG_WAYPOINT_LABEL_WIDTH: () => WUGONG_WAYPOINT_LABEL_WIDTH,
    WUGONG_WAYPOINT_SIZE: () => WUGONG_WAYPOINT_SIZE,
    bellDirection: () => bellDirection,
    canPack: () => canPack,
    chapterFor: () => chapterFor,
    createDom: () => createDom,
    createFrameLoop: () => createFrameLoop,
    createJournalController: () => createJournalController,
    createJournalStore: () => createJournalStore,
    createMapCharacter: () => createMapCharacter,
    createMapGait: () => createMapGait,
    createMapHeading: () => createMapHeading,
    createMiniGameController: () => createMiniGameController,
    createMoganGames: () => createMoganGames,
    createMoganState: () => createMoganState,
    createMusicLayer: () => createMusicLayer,
    createProceduralMapCharacter: () => createProceduralMapCharacter,
    createRewardController: () => createRewardController,
    createRouteMapPicker: () => createRouteMapPicker,
    createSceneCharacter: () => createSceneCharacter,
    createSceneManager: () => createSceneManager,
    createTigerGames: () => createTigerGames,
    createTigerState: () => createTigerState,
    createTigerTrailGames: () => createTigerTrailGames,
    createVisualRoute: () => createVisualRoute,
    createWugongOverviewRoute: () => createWugongOverviewRoute,
    createWugongRoute: () => createWugongRoute,
    createWugongScene: () => createWugongScene,
    createWugongStops: () => createWugongStops,
    createWugongWaypoint: () => createWugongWaypoint,
    inputMogan: () => inputMogan,
    inputTiger: () => inputTiger,
    installLegacyHomeGames: () => installLegacyHomeGames,
    itemCells: () => itemCells,
    keyMogan: () => keyMogan,
    keyTiger: () => keyTiger,
    layoutMapLabels: () => layoutMapLabels,
    leafTip: () => leafTip,
    mapFollowViewport: () => mapFollowViewport,
    mapMarkerAnchor: () => mapMarkerAnchor,
    mapSymbols: () => mapSymbols,
    mapViewport: () => mapViewport,
    mapWalkFrame: () => mapWalkFrame,
    moganBounds: () => stageBounds,
    moganFrame: () => moganFrame,
    musicLevel: () => musicLevel,
    musicTrack: () => musicTrack,
    releaseMogan: () => releaseMogan,
    releaseTiger: () => releaseTiger,
    roundJournalArt: () => roundJournalArt,
    scoreReady: () => scoreReady,
    stepFoot: () => stepFoot,
    stepSpot: () => stepSpot,
    stepTiming: () => stepTiming,
    stonePose: () => stonePose,
    tickMogan: () => tickMogan,
    tickTiger: () => tickTiger,
    tigerJournalArt: () => tigerJournalArt,
    wugongNearby: () => wugongNearby,
    wugongPhase: () => wugongPhase,
    wugongViewport: () => wugongViewport
  });

  // .build/typescript/runtime/dom.js
  function createDom(document2) {
    function get(id) {
      const element = document2.getElementById(id);
      if (!element)
        throw new Error(`Missing game element: ${id}`);
      return element;
    }
    function html(tag, text2, parent, className) {
      const element = document2.createElement(tag);
      if (text2)
        element.textContent = text2;
      if (className)
        element.setAttribute("class", className);
      parent?.appendChild(element);
      return element;
    }
    function text(id, value) {
      const element = get(id);
      if (element.textContent !== value)
        element.textContent = value;
    }
    return { document: document2, get, html, text };
  }
  var EventBindings = class {
    cleanups = [];
    listen(target, type, listener) {
      const handler = listener;
      target.addEventListener(type, handler);
      this.cleanups.push(() => target.removeEventListener?.(type, handler));
    }
    destroy() {
      for (const cleanup of this.cleanups.splice(0))
        cleanup();
    }
  };

  // .build/typescript/content/day-photos.js
  var DAY_PHOTOS = {
    "changping-forest": {
      "title": "Xiaojin, Aba, Sichuan, China - panoramio (42).jpg",
      "source": "https://commons.wikimedia.org/wiki/File:Xiaojin,_Aba,_Sichuan,_China_-_panoramio_(42).jpg",
      "author": "jetsun",
      "license": "CC BY-SA 3.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
      "file": "photos/changping-forest.webp",
      "alt": "长坪沟溪边的苔木与针叶林",
      "caption": "长坪沟森林实拍 · 区域配图，非枯树滩定点"
    },
    "changping-valley": {
      "title": "Xiaojin, Aba, Sichuan, China - panoramio (52).jpg",
      "source": "https://commons.wikimedia.org/wiki/File:Xiaojin,_Aba,_Sichuan,_China_-_panoramio_(52).jpg",
      "author": "jetsun",
      "license": "CC BY-SA 3.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
      "file": "photos/changping-valley.webp",
      "alt": "长坪沟林间溪谷与山间云雾",
      "caption": "长坪沟溪谷实拍 · 区域配图，非红石阵定点"
    },
    "changping-meadow": {
      "title": "Xiaojin, Aba, Sichuan, China - panoramio (57).jpg",
      "source": "https://commons.wikimedia.org/wiki/File:Xiaojin,_Aba,_Sichuan,_China_-_panoramio_(57).jpg",
      "author": "jetsun",
      "license": "CC BY-SA 3.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
      "file": "photos/changping-meadow.webp",
      "alt": "长坪沟开阔的花草地与山壁",
      "caption": "长坪沟草甸实拍 · 区域配图，未核准木骡子机位"
    },
    "mogan-bamboo": {
      "title": "Mount Mogan bamboo forest.jpg",
      "source": "https://commons.wikimedia.org/wiki/File:Mount_Mogan_bamboo_forest.jpg",
      "author": "Walter Grassroot",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
      "file": "photos/mogan-bamboo.webp",
      "alt": "莫干山云雾中的竹林",
      "caption": "莫干山竹林实拍 · 区域配图"
    },
    "mogan-path": {
      "title": "Mount Mogan Path3.jpg",
      "source": "https://commons.wikimedia.org/wiki/File:Mount_Mogan_Path3.jpg",
      "author": "Walter Grassroot",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
      "file": "photos/mogan-path.webp",
      "alt": "莫干山树林中的木制山间步道",
      "caption": "莫干山木制步道实拍 · 区域配图，非莫干岭石阶"
    },
    "mogan-stream": {
      "title": "Mount Mogan River.jpg",
      "source": "https://commons.wikimedia.org/wiki/File:Mount_Mogan_River.jpg",
      "author": "Walter Grassroot",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
      "file": "photos/mogan-stream.webp",
      "alt": "莫干山石间流淌的溪水",
      "caption": "莫干山溪水实拍 · 区域配图"
    },
    "westlake-creek": {
      "title": "Jiuxi 20161004.jpg",
      "source": "https://commons.wikimedia.org/wiki/File:Jiuxi_20161004.jpg",
      "author": "Tyg728",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
      "file": "photos/westlake-creek.webp",
      "alt": "九溪十八涧的溪流、树林与游人",
      "caption": "九溪十八涧溪流实拍 · 2016 年"
    },
    "westlake-path": {
      "title": "九溪十八涧.jpg",
      "source": "https://commons.wikimedia.org/wiki/File:%E4%B9%9D%E6%BA%AA%E5%8D%81%E5%85%AB%E6%B6%A7.jpg",
      "author": "三猎",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
      "file": "photos/westlake-path.webp",
      "alt": "九溪十八涧树林中的石板步道",
      "caption": "九溪十八涧石径实拍"
    },
    "westlake-tea": {
      "title": "Longjing tea village Hangzhou.jpg",
      "source": "https://commons.wikimedia.org/wiki/File:Longjing_tea_village_Hangzhou.jpg",
      "author": "Niklas Dougherty",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
      "file": "photos/westlake-tea.webp",
      "alt": "龙井村的房屋与周围茶园",
      "caption": "龙井村与周围茶园实拍"
    }
  };

  // .build/typescript/content/day-routes.js
  var p = (x, y, elevation) => ({ x, y, elevation });
  var water = '<path d="M4 22q10-8 20 0t20 0M5 32q10-8 20 0t20 0M9 42q8-6 16 0t16 0"/>';
  var leaf = '<path d="M10 41Q5 10 40 9Q42 37 10 41ZM10 41l24-25M17 32l-1-12M24 26l10 1"/>';
  var mountain = '<path d="m3 43 14-26 9 14 10-22 12 34H3ZM12 27l5 4 4-5"/>';
  var steps = '<path d="M4 43h13V32h11V21h14V9M8 34h9M21 22h7M34 11h8"/>';
  var tea = '<path d="M10 27h27q-1 17-14 17T10 27ZM37 29q14-2 8 9h-9M17 20q-7-6 0-13M27 20q-7-6 0-13"/>';
  var DAY_ROUTES = {
    changping: {
      id: "changping",
      name: "四姑娘山长坪沟",
      region: "四川 · 阿坝",
      title: "走过十月彩林，望见山谷尽头。",
      subtitle: "喇嘛寺 → 枯树滩 → 干海子 → 木骡子 · 原路返回",
      note: "沿溪走进彩林，在木骡子折返。",
      ending: "回到喇嘛寺，带回枝影、铃声、远山与一片秋色。",
      itinerary: "out-and-back",
      world: { width: 3e3, height: 1900 },
      startMinute: 8 * 60 + 30,
      durationMinute: 8 * 60,
      waypoints: [p(770, 1660, 3250), p(900, 1540, 3290), p(1070, 1530, 3340), p(1160, 1380, 3400), p(1320, 1310, 3470), p(1420, 1150, 3500), p(1300, 1030, 3520), p(1450, 900, 3540), p(1640, 910, 3570), p(1780, 800, 3590), p(1785, 670, 3630), p(1990, 620, 3660), p(2190, 620, 3690), p(2320, 500, 3720), p(2480, 430, 3760)],
      places: [
        { id: "lama", name: "喇嘛寺", knot: 0, feature: "temple", symbol: "temple" },
        { id: "forest", name: "原始森林", knot: 2, feature: "forest", symbol: "forest", photo: DAY_PHOTOS["changping-forest"] },
        { id: "deadtrees", name: "枯树滩", knot: 4, feature: "water", symbol: "snag" },
        { id: "valley", name: "溪谷", knot: 6, feature: "water", symbol: "stream", labelSide: "left", photo: DAY_PHOTOS["changping-valley"] },
        { id: "lower-meadow", name: "下干海子", knot: 7, feature: "meadow", symbol: "dry-basin", labelSide: "right" },
        { id: "upper-meadow", name: "上干海子", knot: 9, feature: "meadow", symbol: "dry-basin", labelSide: "left" },
        { id: "redrock", name: "红石阵", knot: 11, feature: "redrock", symbol: "redrock", labelSide: "right" },
        { id: "muluozi", name: "木骡子", knot: 14, feature: "meadow", symbol: "alpine-meadow", photo: DAY_PHOTOS["changping-meadow"] }
      ],
      events: [
        { entry: "changping-branch-reflection", knot: 4, place: "长坪沟 · 枯树滩", line: "溪声轻下来，枝桠在浅水里又长了一次。", motif: water },
        { entry: "changping-bell-cord", knot: 8, place: "长坪沟 · 干海子马道休息处", line: "休息处的布垫上，一枚小铃被叠起的绳圈压住。", motif: '<path d="M13 35h26l-4-19q-9-10-17 0ZM10 36h32M22 41q4 5 8 0M24 8V4h5v4"/>' },
        { entry: "changping-valley-path", knot: 13, place: "长坪沟 · 木骡子林缘", line: "林子将要让开，手帐里的小径还差一段。", motif: mountain },
        { entry: "changping-autumn-print", knot: 5, leg: "return", place: "长坪沟 · 返程彩林栈道", line: "下午的光落在纸上，一片落叶露出细细的叶脉。", motif: leaf }
      ],
      weather: [{ from: 0, kind: "fog", name: "十月 · 晨雾彩林" }, { from: 0.15, kind: "clear", name: "薄云渐开" }, { from: 0.4, kind: "wind", name: "午间 · 草甸山风" }, { from: 0.61, kind: "clear", name: "返程 · 午后暖光" }],
      sources: [{ name: "四姑娘山管理局 · 长坪沟", url: "https://www.sgns.cn/understand/cpg" }]
    },
    mogan: {
      id: "mogan",
      name: "莫干山竹林步道",
      region: "浙江 · 德清",
      title: "听着竹声，走过雨后的古道。",
      subtitle: "莫干岭西坡 → 竹林石阶 → 岭口 → 大坑侧山林",
      note: "竹叶接住雨滴，脚步慢慢穿过青绿。",
      ending: "走到大坑侧山林，把竹声与雨后的古道留下。",
      world: { width: 3e3, height: 1900 },
      startMinute: 9 * 60,
      durationMinute: 3 * 60,
      waypoints: [p(360, 1500, 340), p(510, 1350, 375), p(710, 1400, 400), p(780, 1210, 435), p(960, 1160, 465), p(1030, 990, 500), p(1260, 1020, 530), p(1370, 850, 560), p(1550, 760, 590), p(1740, 830, 570), p(1860, 1040, 520), p(2090, 1030, 485), p(2220, 1190, 450), p(2460, 1260, 420), p(2660, 1390, 395)],
      places: [
        { id: "west", name: "莫干岭西坡", knot: 0, feature: "gate", symbol: "trailhead" },
        { id: "bamboo", name: "竹林", knot: 2, feature: "bamboo", symbol: "bamboo", photo: DAY_PHOTOS["mogan-bamboo"] },
        { id: "stone", name: "古道石阶", knot: 5, feature: "ridge", symbol: "steps" },
        { id: "pass", name: "莫干岭口", knot: 8, feature: "ridge", symbol: "pass" },
        { id: "forest", name: "林间步道", knot: 10, feature: "forest", symbol: "forest", photo: DAY_PHOTOS["mogan-path"] },
        { id: "stream", name: "山涧", knot: 13, feature: "water", symbol: "stream", photo: DAY_PHOTOS["mogan-stream"] },
        { id: "dakeng", name: "大坑侧山林", knot: 14, feature: "forest", symbol: "forest" }
      ],
      events: [
        { entry: "bamboo-drop", knot: 3, place: "莫干山 · 莫干岭竹林", line: "雨停了一会儿，叶尖还在落下清亮的水珠。", motif: water },
        { entry: "bamboo-step", knot: 6, place: "莫干山 · 莫干岭古道", line: "雨后的落叶伏在石阶上，古道在竹林里拐了个弯。", motif: steps },
        { entry: "bamboo-leaf", knot: 11, place: "莫干山 · 大坑侧山林", line: "竹梢一齐转向远山，一阵风从林隙里经过。", motif: leaf }
      ],
      weather: [{ from: 0, kind: "rain", name: "细雨 · 竹林" }, { from: 0.29, kind: "fog", name: "雨歇 · 薄雾" }, { from: 0.62, kind: "clear", name: "林隙微光" }],
      sources: [{ name: "湖州发布 · 莫干山古道背景资料", url: "https://www.thepaper.cn/newsDetail_forward_2597949" }]
    },
    westlake: {
      id: "westlake",
      name: "九溪龙井",
      region: "浙江 · 杭州",
      title: "沿着溪水，走进春日的茶园。",
      subtitle: "九溪烟树 → 九溪十八涧 → 龙井茶园 → 龙井村",
      note: "听溪水绕过石头，茶香在前面的村里。",
      ending: "龙井村的一盏茶，把今天的溪声留得更久一点。",
      world: { width: 3e3, height: 1900 },
      startMinute: 9 * 60,
      durationMinute: 2.5 * 60,
      waypoints: [p(660, 1580, 70), p(810, 1460, 76), p(1030, 1460, 80), p(1180, 1280, 88), p(1390, 1330, 95), p(1560, 1170, 106), p(1400, 1050, 115), p(1490, 880, 127), p(1700, 800, 135), p(1930, 860, 148), p(2160, 740, 160), p(2300, 610, 172), p(2150, 510, 185), p(2270, 380, 195), p(2460, 330, 205)],
      places: [
        { id: "yan-shu", name: "九溪烟树", knot: 0, feature: "water", symbol: "lake" },
        { id: "creek", name: "九溪溪谷", knot: 2, feature: "water", symbol: "stream", photo: DAY_PHOTOS["westlake-creek"] },
        { id: "path", name: "九溪十八涧", knot: 5, feature: "forest", symbol: "stepping-stones", photo: DAY_PHOTOS["westlake-path"] },
        { id: "tea", name: "龙井茶园", knot: 10, feature: "tea", symbol: "tea" },
        { id: "village", name: "龙井村", knot: 14, feature: "village", symbol: "village", photo: DAY_PHOTOS["westlake-tea"] }
      ],
      events: [
        { entry: "westlake-floating-leaf", knot: 3, place: "九溪龙井 · 九溪溪谷", line: "一片落叶在溪石旁打转，还没有找到下游的水路。", motif: leaf },
        { entry: "westlake-stones", knot: 7, place: "九溪龙井 · 十八涧石径", line: "浅水从石头之间绕过，近处和远处是不同的声音。", motif: water },
        { entry: "westlake-tea", knot: 10, place: "九溪龙井 · 龙井茶园", line: "嫩芽和新叶在晨光里透亮，茶垄铺过缓缓的山坡。", motif: leaf },
        { entry: "westlake-eaves", knot: 13, place: "九溪龙井 · 龙井村口", line: "村口的茶盏冒起热气，可以在这里歇一会儿。", motif: tea }
      ],
      weather: [{ from: 0, kind: "fog", name: "春日 · 溪谷薄雾" }, { from: 0.25, kind: "clear", name: "树隙晴光" }, { from: 0.7, kind: "clear", name: "午前 · 茶园微风" }],
      sources: [{ name: "杭州政协网 · 九溪至龙井徒步线", url: "https://www.hzzx.gov.cn/cshz/content/2024-07/08/content_8755727.htm" }]
    }
  };

  // .build/typescript/content/wugong.js
  var WUGONG_EVENTS = {
    leaves: {
      id: "leaves",
      entry: "wugong-forest-leaves",
      title: "林间的叶影",
      place: "武功山 · 东江村上山林间",
      story: "爬过一段林间石路，树影落在手帐上。歇口气，翻开纸叶，找找相同的叶形。",
      action: "翻开叶影小画",
      day: 1,
      trigger: "trail"
    },
    kite: {
      id: "kite",
      entry: "meadow-bird",
      title: "借一阵草甸的风",
      place: "武功山 · 山脊草甸",
      story: "转过山肩，草甸上的风正好。背包里有一只纸鸢，要不要让它飞一会儿？",
      action: "放一会儿纸鸢",
      day: 1,
      trigger: "trail"
    },
    encounter: {
      id: "encounter",
      entry: "wugong-wind-hiker",
      title: "在营地遇见她",
      place: "武功山 · 观音宕草甸",
      story: "坐下休息时，旁边的旅人走过来，想请你帮她拍一张草甸里的照片。",
      action: "帮她拍张照片",
      day: 1,
      trigger: "archive"
    },
    stars: {
      id: "stars",
      entry: "wugong-camp-stars",
      title: "星夜入帐",
      place: "武功山 · 观音宕／星空营地",
      story: "帐篷亮起暖光，坐下来，对着手帐认一认今晚的星星。",
      action: "认一认星星",
      day: 1,
      trigger: "camp"
    },
    clouds: {
      id: "clouds",
      entry: "meadow-butterfly",
      title: "山脊上的云",
      place: "武功山 · 吊马桩山脊",
      story: "清晨离开观音宕，往吊马桩的山脊上浮起了云。拨开近处的云，看看藏在后面的山。",
      action: "拨云看山",
      day: 2,
      trigger: "trail"
    },
    stones: {
      id: "stones",
      entry: "meadow-flower",
      title: "古祭坛边的石语",
      place: "武功山 · 金顶古祭坛",
      story: "看过金顶远景，沿山肩再走几步。古祭坛旁的石色与山色，正好拼成一幅小画。",
      action: "拼好金顶石语",
      day: 2,
      trigger: "trail"
    },
    return: {
      id: "return",
      entry: "wugong-homeward-pages",
      title: "把来路排进手帐",
      place: "武功山 · 福星谷下山林间",
      story: "从草甸下到福星谷，石阶重新走进林荫。坐在路边歇一会儿，把林间、草甸、星夜与金顶的小画按走过的顺序排好，再沿中庵方向下山。",
      action: "整理这一程的小画",
      day: 2,
      trigger: "trail"
    }
  };

  // .build/typescript/content/tiger.js
  var EVENTS = {
    climb: { entry: "tiger-bends-puzzle-v4", place: "虎跳峡 · 二十八道拐", line: "山径在岩壁边弯成一个 S，江声从谷底传来。", motif: '<path d="M6 44h10V33h10V22h10V11h9M4 36l12-20 9 8 9-18 12 23"/>' },
    "inn-pairs": { entry: "tiger-inn-pairs-v4", place: "虎跳峡 · 中途客栈", line: "暮色落进峡谷，桌上留着几张小画片。", motif: '<path d="M5 12h18v25H5ZM28 17h18v25H28ZM10 31l5-9 5 9M33 34h8V24h-8Z"/>' },
    "waterfall-paint": { entry: "tiger-waterfall-paint-v4", place: "虎跳峡 · 龙洞瀑布", line: "水声落在身后，纸上还留着两处山色。", motif: '<path d="M10 4q-4 11 0 22M19 4q-4 11 0 22M4 34q7-5 13 0t13 0M29 46l4-12L45 8l5 3-15 28Z"/>' },
    "river-frame": { entry: "tiger-river-roundframe-v4", place: "虎跳峡 · 中虎跳江边", line: "白浪擦过巨石，远处的江声已经来到眼前。", motif: '<path d="M2 18q7-8 15 0t15 0t15 0M2 32q7-8 15 0t15 0t15 0M18 41l4-9 8 1 5 8Z"/>' }
  };

  // .build/typescript/content/aotai.js
  var CUES = {
    "snow-tracks": { entry: "snow-tracks", place: "鳌山 · 石海", line: "离开白起庙，石海沿着鳌山大梁铺开。", motif: '<path d="m5 31 8-19 12-5 16 12 4 19H12Z M13 12l7 15 21-8M20 27l-8 11M20 27l14 11"/>' },
    "snow-lichen": { entry: "snow-lichen", place: "飞机梁 · 连峰", line: "爬出水窝子的谷地，一道道山梁在眼前展开。", motif: '<path d="m3 34 9-12 8 5 9-16 7 9 12-5M3 41h45"/>' },
    "aotai-takin-first": { entry: "aotai-takin-first", place: "2800营地 · 林缘", line: "前方岩后，传来沉重的踩雪声。", motif: '<path d="M8 25q6-13 21-8l7 6v9H12ZM13 32v10M28 32v10M30 17l-2-8M36 23l8-3 3 9-11 3M43 20l1-8"/>' },
    "aotai-camp-night": { entry: "aotai-camp-night", place: "大石河 · 雪夜营地", line: "走下石海，背风的河谷里可以歇脚了。", motif: '<path d="m5 40 19-30 20 30ZM24 10v30M10 40l14-19 15 19M3 42h44M29 27h7v9h-7Z"/>' }
  };

  // .build/typescript/content/maclehose.js
  var CUES2 = {
    "coast-sand": { entry: "coast-sand", place: "麦理浩径 · 西湾山山肩", line: "前面的石阶绕进山肩，海风从岩壁外吹来。", motif: '<path d="m3 29 10-15 9 10 8-16 15 25M4 40q8-6 16 0t16 0t12 0"/>' },
    "maclehose-sideways-crab": { entry: "maclehose-sideways-crab", place: "麦理浩径 · 西湾沙滩", line: "一只小螃蟹停在漂木前，细小的脚印拐了个弯。", motif: '<path d="M15 25q10-10 20 0v10H15ZM15 27l-8-8M35 27l8-8M15 32l-9 7M35 32l9 7M20 21l-2-7M30 21l2-7"/>' },
    "coast-shell": { entry: "coast-shell", place: "麦理浩径 · 咸田湾沙滩", line: "浪退下去，留出一小片湿润的沙。", motif: '<path d="M4 17q7-6 14 0t14 0t14 0M8 41q8-12 17-2t14-8M6 28q10-6 20 0t20 0"/>' },
    "maclehose-woodland-echo": { entry: "maclehose-woodland-echo", place: "麦理浩径 · 大浪坳上坡林缘", line: "海浪声远了，枝叶之间传来几声清亮的回应。", motif: '<path d="M5 38q20-6 40 0M16 34q-7-18 7-19q12 0 9 13l-8 8ZM31 19l8 2-7 4M21 35v5M27 34v5M39 12q6 4 2 9"/>' },
    "coast-pier": { entry: "coast-pier", place: "麦理浩径 · 赤径渡头", line: "渡头旁，一只小木船随着缓流轻轻晃着。", motif: '<path d="M5 27h38M12 27v15M34 27v15M7 19h21M9 19v8M26 19v8M5 47q9-5 18 0t18 0"/>' }
  };

  // .build/typescript/content/catalog.js
  var DAY_PRESENTATION = {
    changping: { name: "四姑娘山", symbol: "summit", art: { title: "四姑娘山长坪沟", className: "day-art-page", styles: ["day-art.css?v=remaining-routes-1"] } },
    mogan: { name: "莫干山", symbol: "bamboo", art: { title: "莫干山", className: "day-art-page", styles: ["mogan-games.css", "day-art.css?v=remaining-routes-1"] } },
    westlake: { name: "九溪龙井", symbol: "tea", art: { title: "九溪龙井", className: "day-art-page", styles: ["day-art.css?v=remaining-routes-1"] } }
  };
  var CHAPTERS = [
    {
      id: "wugong",
      name: "武功山",
      mapPage: "wugong-walk.html",
      artPage: "wugong-art.html",
      mapEntry: "src/wugong-walk/scroll/main.ts",
      atlas: { name: "武功山", region: "江西 · 萍乡", symbol: "alpine-meadow" },
      events: [WUGONG_EVENTS.kite, WUGONG_EVENTS.encounter, WUGONG_EVENTS.clouds, WUGONG_EVENTS.stones],
      artPresentation: { title: "武功山", className: "", styles: [] },
      cover: {
        kicker: "东江村经典反穿 · 两天一夜",
        title: "沿着草甸，把山野收进手帐。",
        copy: "从东江村穿过林间与草甸，在观音宕过夜。第二天经过吊马桩和金顶，沿景区山路下到大门。走到风景里，留下一幅手绘。",
        action: "从东江村出发 →",
        hint: "跟随山路 · 沿途实景 · 手绘互动与旅行手帐"
      }
    },
    {
      id: "tiger",
      name: "虎跳峡",
      mapPage: "tiger-walk.html",
      artPage: "tiger-art.html",
      mapEntry: "src/tiger-walk/main.ts",
      atlas: { name: "虎跳峡", region: "云南 · 迪庆", symbol: "rapids" },
      events: Object.values(EVENTS),
      artPresentation: { title: "虎跳峡", className: "tiger-art-page", styles: ["tiger-trail.css", "tiger-art.css?v=tiger-paper-badges-2", "tiger-memories.css?v=trip-photos-8"] },
      cover: {
        kicker: "虎跳峡高路 · 两天一夜",
        title: "从高路，走到金沙江边。",
        copy: "从桥头越过二十八道拐，在中途客栈住一晚。清晨经龙洞瀑布走到中峡客栈，也可沿小路下到中虎跳江边，再循原路返回。",
        action: "从桥头出发 →",
        hint: "中途客栈过夜 · 沿途实景 · 手绘收藏"
      }
    },
    {
      id: "aotai",
      name: "鳌太线",
      mapPage: "aotai-walk.html",
      artPage: "aotai-art.html",
      mapEntry: "src/aotai-walk/main.ts",
      atlas: { name: "鳌太线", region: "陕西 · 秦岭", symbol: "ridge" },
      events: Object.values(CUES),
      artPresentation: { title: "鳌太线", className: "aotai-art-page", styles: ["aotai-art.css?v=shared-components-1"] },
      cover: {
        kicker: "鳌太线 · 冬季历史路线",
        title: "循着山脊，走进云与石之间。",
        copy: "从塘口村上鳌山，翻过飞机梁、金字塔与太白梁，走向大爷海和拔仙台。沿历史路线上下山，在途中歇脚过夜，把山野相遇收进手帐，最后经下板寺向汤峪方向离山。",
        action: "走进秦岭 →",
        hint: "历史路线示意 · 多程过夜 · 手绘收藏"
      }
    },
    {
      id: "maclehose",
      name: "麦理浩径",
      mapPage: "maclehose-walk.html",
      artPage: "maclehose-art.html",
      mapEntry: "src/maclehose-walk/main.ts",
      atlas: { name: "麦理浩径", region: "香港 · 西贡", symbol: "beach" },
      events: Object.values(CUES2),
      artPresentation: { title: "麦理浩径", className: "coast-art-page", styles: ["maclehose-art.css?v=sand-brush-18"] },
      cover: {
        kicker: "麦理浩径第二段 · 一日海岸",
        title: "翻过山，海就在那里。",
        copy: "从浪茄翻过西湾山，走过西湾与咸田湾的沙岸。越过大浪坳，在赤径的潮水边歇脚，再沿林间山径走到北潭凹。",
        action: "从浪茄出发 →",
        hint: "浪茄 → 北潭凹 · 海岸实景 · 手绘收藏"
      }
    },
    ...Object.values(DAY_ROUTES).map((route) => ({
      id: route.id,
      name: route.name,
      mapPage: `${route.id}-walk.html`,
      artPage: `${route.id}-art.html`,
      mapEntry: "src/day-walk/main.ts",
      atlas: { name: DAY_PRESENTATION[route.id].name, region: route.region, symbol: DAY_PRESENTATION[route.id].symbol },
      events: route.events,
      artPresentation: DAY_PRESENTATION[route.id].art,
      cover: {
        kicker: `${route.region} · ${route.id === "changping" ? "十月彩林 · 一日往返" : route.id === "mogan" ? "古道选段" : "溪谷与茶园"}`,
        title: route.title,
        copy: `${route.subtitle}。${route.note}`,
        action: `从${route.places[0].name}出发 →`,
        hint: "沿途实景 · 手绘互动 · 旅行手帐"
      }
    }))
  ];
  function chapterFor(id) {
    return CHAPTERS.find((chapter) => chapter.id === id) ?? null;
  }
  var ROUTE_SUMMARIES = CHAPTERS.map(({ id, name }) => ({ id, name }));

  // .build/typescript/runtime/route-map-geometry.generated.js
  var ROUTE_MAP_GEOMETRY = { "width": 960, "height": 620, "bounds": [[138.01223549799778, 23.999999999999886], [821.9877645020022, 595.9999999999998]], "landPath": "M744.3,507.5L743.7,509.5L743.3,511.5L743.3,513.4L743.7,515.3L743.7,517.1L743.7,518.8L742.2,518.6L741.2,517.5L740.7,515.5L739.3,513.3L738.8,512.6L737.1,511.5L735.6,511.1L734.4,510.3L734.6,510.3L733.6,509.1L732.8,507.8L731,503.9L730.4,503L729.7,502.2L729.4,501.3L729.4,500.3L729.7,498.8L729.8,497.3L729.2,495.3L729,493.3L729.3,492.4L734.1,479.3L735.5,476.4L736.4,475L737.1,473.4L737.7,471.5L738.5,469.7L739.1,469L742.7,466.9L743.7,465.3L744.5,464.7L745.6,464.6L746.4,465.1L747.2,465.8L747.9,466.1L749.7,466.6L750.6,467.2L751.1,468.4L750.3,469.8L750,471L750.1,472.3L750.6,473.9L750.9,475.5L750.3,479.6L749.3,482.3L749.2,483.6L749.3,486.6L749,489.8L748.9,493.7L748.5,497.9L748.1,499.6L747.5,501.3L746.1,504.7ZM702.3,483.4L703.1,484.3L702.9,485L700.9,484.9L700.7,484.3L701.5,484.3ZM699.2,484.2L698.9,485.2L698,485.2L697.9,484.5L697.7,484.3L697.8,483.7L698,483.5L699,483.9ZM732.5,368.1L731.5,368.7L727.9,368L725.3,367L723.5,365.5L723.2,364.8L724.9,364.6L726.6,365L727.2,365.9L727.9,366.1L728.4,366.5L731.7,367.3L732.2,367.6ZM742.4,390.5L742.3,390.9L740.5,390.3L738.7,390.4L737.9,389.7L737.6,388.5L739.5,388.3L742,389L742.6,389.4ZM741.6,395.2L741.6,395.5L740.3,394.7L739.7,394.6L739.8,394L740.6,393.7L741.4,394.9ZM744.1,391.4L744.1,392.1L743.7,392.1L743,390.9L743.2,390.5L743.9,390.5ZM720.2,465.8L719.3,466.7L718.6,466.5L718.4,465.5L718.6,464.6L718.1,464L718.4,463.2L719.1,462.9L719.5,463.3L720,463.5L720.1,463.7L720.2,464.2L719.9,465.1L720.3,465.5ZM590.6,549L591.1,549.5L592.6,549.1L592.9,549.8L592.9,550.1L592.4,550.9L591.2,550.4L590,550.6L589.1,550.6L588.8,550.2L589.4,549.4ZM733.4,421.9L732.3,422.4L731.9,422.5L731.7,421.4L732.5,420.2L732.9,420.4L733.3,421ZM635.4,518.4L635.6,519.1L634.4,518.1L634,518.1L633.4,517.7L633.1,517L633.9,516.9L634.8,517.7ZM625.8,538.5L625.5,538.8L625,538.3L624.8,537.4L624.5,537L625.2,536.4L625.4,535.8L626.3,535.8L626.6,536L626,536.7L625.8,537ZM623.5,538L622.1,538.5L621.8,538.4L622.2,537.6L623.5,536.9ZM554.3,543.9L553.3,543.1L551.7,541.8L551.1,541.7L549.3,542.4L546.8,542.7L546.2,542L545,542.6L543.8,541L542.4,540.9L540.7,539.7L540,539.1L539.8,538.1L539.3,537.7L538.6,537.7L537.8,537.3L536.6,536.8L535.7,536.5L535.2,536.8L534.7,536.9L534.6,536.3L534.6,534.4L534.5,532.7L534.2,531.9L533.6,531.4L533,531.1L532.7,530.3L532.9,528.6L533.4,527.4L534.1,527.2L535.1,526.4L535.6,525.2L536.2,524.1L533.9,522.6L532.7,522.1L531.3,522.4L529.7,522.9L528.8,523L528.4,522.8L527.4,521.4L526.9,521.2L525.7,521.1L524.7,521.2L524.2,521.8L523.3,522L522.4,522L521.5,521.3L520.2,520.3L518.1,519.6L517.8,518.9L517.3,517.9L516.5,517.1L515.2,515.9L514.1,515.3L513.6,515.7L512.8,516.4L510,517.7L508.8,518.3L508.1,518.7L507.6,519.2L507.4,520.7L507.1,522.2L506.3,523L505.5,523.6L504.7,523.7L503.9,523.7L503.2,523.9L500.9,525.5L499.8,525.4L498.9,524.5L498.5,523.8L497.5,523.9L496.2,524.7L495.6,526.1L495.3,527.3L495,527.9L494.5,528.1L494.1,528.1L490.1,524.3L489.8,524.1L489.1,524.9L488.4,526.8L487.9,527.2L487.6,527.1L486,524.5L485.5,524.3L485.2,524.4L484.6,525.2L483.5,526.3L482.7,527L482.7,527.8L481.8,528.5L480.7,529.2L480.4,529.3L479.7,529L478.8,528L478.2,527L476.6,526L474.8,525.2L473.7,524.5L473,524.3L472.3,524.6L472,525L471.5,525.9L470.4,527.5L469.4,528.7L468.5,529.5L467.8,530.1L467.3,529.5L466.3,529.1L465.1,529L463.6,529.8L462.4,528.1L462.1,528.1L461.6,528.2L461.1,528.5L460.7,529.4L460.3,530.7L459.5,531.5L458.8,531.8L459,532.5L459.3,533.3L459.3,533.9L459.5,535L459.8,536L461.2,537.8L461.7,538.7L461.8,539.5L461.8,542.2L461.7,543.4L461.3,545.6L461.2,546.9L461.8,547.5L462.4,548.2L462.3,548.6L462.1,548.7L461.2,549.4L460.9,549.5L460.3,549.2L459.6,548.9L459.1,548.6L458.5,548.1L457,548.1L454.6,548.7L454.1,548.5L453.7,548.1L453.6,547.2L453.8,546.2L453.6,545.5L453.1,545.1L453.5,543.3L452.7,542.5L452.8,542.3L452.6,540.3L452.7,539.8L452.5,539.7L451.9,539.5L451,539.8L448.2,540.9L445.8,543.2L444.7,543.7L443.6,543.9L442.3,543.4L440.9,543.1L438.9,543.6L437.9,543.2L437.5,542.7L437.1,542L437.4,541L437.3,540.3L436.5,539.9L435.6,539.6L435.1,538.6L434.9,537.6L435.2,536.4L435.3,535L434.9,534.3L433.6,533.9L430.2,533.1L427.2,532.6L425.9,532.7L424.9,532.5L424.3,532.2L424.1,531.7L424.1,531.1L424.7,529.7L425.3,528.3L426.8,526.4L427,525L427,523.3L427.8,521.2L429.1,519.7L429.7,519.2L429.6,518.5L429.2,517.8L428.5,517.4L427.4,516.9L425.7,516.7L423.3,516.1L420.5,514.9L421,513.1L421,512L420.7,511L420.2,510.3L419.9,509.7L420.5,508.1L420,506.2L419.3,505.5L418.5,504.5L418.6,503.5L419,502.6L421,500.7L421.1,500.2L420.6,500.2L420,500.2L417.4,500.8L417.1,500.3L416.2,500L414.3,499.8L412.1,499.8L409.2,500.3L406.5,501.3L405.3,502.1L404.2,502.6L403.4,502.7L402.5,502.2L402.6,501L404.6,498.9L404.9,497.4L404.5,496L404.5,494.9L404,494.2L403.1,493.8L402.7,493L402.9,490.8L403.8,488.6L405.1,488L405.9,487.7L406.1,487.3L405.9,485.7L406,484.7L406.9,482.8L407.7,481.4L409.1,481.7L409.8,481.4L410.5,480.9L411.3,480.1L411.9,479.1L412.7,476.7L413.1,476.3L414.9,476.9L415.4,476.6L416.5,475.3L417.5,473.6L418.9,473.1L419.8,473.1L420.3,472.6L420.3,471.7L419.5,470.3L419.2,469.2L419.4,468.6L420.7,468.3L421,467.5L421,465.8L421.6,463.8L422.1,461.4L422.3,459.6L422.4,458.2L422.3,456.8L422.3,454.1L421.9,451.8L422.1,450.9L422.2,448.2L422,445.8L421.3,445.3L420,444.5L419.3,444.3L418.7,444.5L418.4,445.3L417.8,446.1L417.1,445.8L416.8,445L416.4,444L415.2,439.1L415.1,437.8L415,436.4L414.5,435.7L414,435.2L412.9,433.5L412.3,432.8L412,432.7L411.3,432.8L410.7,432.7L410.2,431.9L409.8,430.9L409.3,430.4L408.5,430L407.7,430.1L407.1,430.9L406.7,431.3L406,432.4L404.9,433.9L404.4,434.4L403.9,434.1L402.1,432.3L401.2,431.8L399.8,432.1L397.8,431.6L397,431.5L395.5,430L394.8,429.8L392.3,430.4L391.7,431L391.4,431L390.8,430.6L390.3,430.2L390.3,429.9L391,429.3L391.1,428.9L391.1,428.4L392.2,427.3L394.9,425L394.6,424L393.8,421.9L393.7,420.9L393.3,420.4L392.1,420.7L389.4,422.3L389.1,422L389.2,421.4L389.1,419.5L390,419L391.2,418.5L392.2,417.8L392.5,417.2L392.3,417L390.9,417.1L390.4,416.7L389.6,414.9L389,414.2L388.5,413.7L386.3,414.4L383.9,415.4L381.1,416.8L381,417.7L380.7,417.9L380.1,418.4L379.5,419.1L379.1,419.3L378.6,419.2L377.6,418.9L375.9,417.9L374,417L373.5,417L370.9,416.3L370.9,415.9L370.5,415L369.8,414.2L369.1,413.9L366.9,415.2L364.4,416L362.9,417.2L361.6,418.4L360.3,418.5L360.2,419.3L359.6,420L358.5,420.7L356.4,421.7L355,422.1L350.8,422.2L349.3,422.4L348.6,422.9L347.8,424.4L347.1,425.7L345.8,426.7L343.5,428L340.9,428.9L340.1,429.7L339.9,430.2L340.2,430.4L340.4,430.8L340.4,431.4L340,431.9L338.2,432.8L337.2,433.2L336.3,433.4L335.3,433.4L334.3,433.1L334.1,432.9L333.6,433.1L332.7,433.2L331.9,433.1L330.1,434.1L329.1,434L328,433.6L326.5,433.1L325.4,433L325.5,432.3L325.9,430.5L325.5,430L324,429.3L322.3,428.4L321.6,427.6L321.2,427.4L320.5,427.4L319.4,427.9L318.3,428.6L317.5,428.5L316.7,428L316.1,427.4L313.5,426.4L312.4,426.1L310.3,425.9L308.6,425.5L308.4,425.2L308.4,424.8L308.8,424.1L309.1,423.4L308.9,422.9L307.3,422.1L305.8,421.5L304.1,421.1L302.9,421.2L301.7,421.6L300.7,422.5L299.3,422.8L297.6,423.3L296.7,423.9L295.3,425.3L293.3,427L291.4,428.6L290.3,430.3L289.1,431.3L287.9,431.9L286.7,434.1L286,433.2L285.3,432L285.3,430.6L287,427L287.6,425.5L287.4,424.8L287.3,423.2L286.7,422.6L285,421.5L284.5,421.4L283.7,421.8L283,422.1L282.2,422.3L280,422.6L278.1,422.6L277.6,422.7L277.4,423.1L277.5,423.7L276.3,423.3L275.1,423L274.1,422.8L271.5,423.4L270.7,423.4L269.8,423.1L268.6,422.8L266.2,422.4L264.2,421.8L262.8,420.1L261.8,419.3L260.6,418.6L259.4,418L259.1,417.1L258.8,416.7L257.8,416.4L256.9,416.5L256.1,418.3L255.6,418.5L254.5,418.5L253.5,417.8L252.2,416.6L251.8,415.4L251.4,414.9L250.5,415.3L250.2,416.6L249.8,417.5L248.8,417.7L248.3,417.3L248.1,416.3L247.4,413.8L246.6,412.3L245.7,411.2L242.1,410.5L239.4,409.7L238.3,409.1L238,408.1L238.8,406.5L239.6,405.3L239.7,404.9L239.3,404.7L238.5,404.4L235.5,404.7L234.7,404.4L234.3,404L233.7,403.6L233.3,403.1L233.1,402.5L230.9,400.5L230.3,399.6L229.2,398.3L228.2,397.4L227.9,395.3L227.7,393.4L227.6,392.3L226.6,391.6L225.6,390.9L223.5,391.3L221.7,391.6L220.6,391.4L219.3,389.1L218.4,386.8L217.2,384.7L216.4,383.5L214.5,383L212.6,381.5L210.3,378.6L208.7,376.5L205.7,373.8L205,372.8L204.9,372.1L204.7,370.7L204.3,369.3L202,368.1L199.3,367.1L196.2,367.1L193.1,370.3L191.9,370.8L191,370.6L190.5,369.5L190.2,368.4L190.1,367.2L188.9,366L187.5,364.5L186.9,363.5L186.1,362.8L185.2,362.3L183.7,361.2L182,359.9L181.1,359.5L181.2,359L181.8,357.9L181.9,356.7L181.4,356.1L180.5,356L178.9,353.8L178.8,353.8L178.8,353.7L178.4,353.1L177.6,352.2L175.9,351.8L174.5,351.7L173.8,350.7L172.7,349.3L172.5,349L172.2,348.5L171.4,346.1L170.5,343.3L169.8,342.7L169.3,342.8L168.5,343.9L168.2,343.7L167.5,343.6L166.7,343.9L166,343.8L165.6,343.5L165.5,343.2L166.2,341.5L165.9,340.9L166.6,339.8L167.5,339L167.1,338L166.6,336.7L166.8,335.7L167.6,334.6L168,333.6L168,333.2L167.6,332.5L166.1,328.9L166.1,328.6L165.9,327.5L166.2,326L166.2,324.9L166,324L166.2,323.6L166.5,323.5L168,323.7L169.3,324L170.3,323.9L170.6,324.7L170.5,325.6L170.6,326.1L171.2,327.2L172,328.3L173.1,328.5L174,328.4L175.2,327.2L175.8,327.1L176.4,327.2L176.4,327.1L176.6,326.2L177.4,324.2L177.6,323.4L177.5,322.5L177.8,321.7L178,320.5L177.5,319.4L177.2,319L177.2,318.5L177.7,317.8L178.1,316.9L178,316L177.6,315.4L177.1,314.6L176.5,313.6L176.3,312.9L175.8,312L175.3,310.8L175.8,308.5L176.3,306.1L176.4,304.9L176.5,302.9L176.7,302.3L177.1,301.8L179.7,300.9L180.4,300.5L180.6,300.1L180.7,299.4L180.5,298.5L179.8,297.7L178.8,296.4L177.9,295.1L176.2,294L174,292.6L173.7,291.8L173.6,289.9L173.4,287L173.2,283.9L172.9,281.9L173.1,281.1L174.2,279.1L174.3,278.6L173.9,278.4L173.1,278.4L172.3,278.6L171.9,278.2L171.5,277.7L171.4,277.6L171.4,277.5L170.4,277.5L168.5,277.1L167.9,276.9L167,276.6L165.3,275.6L163,274.2L160.8,272.5L159.6,271.4L159.2,271L158.3,269.9L157.7,269L158,267.3L157.4,267.2L155.8,267.4L154.1,267.3L153.2,267L152.9,266.7L152.9,264.7L152.7,264.1L152,263.7L151.4,263.1L151.1,262.5L151.2,261.9L151.8,261.4L152.3,261L153.4,257.8L153.5,256.6L153.5,255.6L153.3,254.3L153,253.4L152.4,252.4L151.4,251.4L150.4,250.8L148.8,250.8L148.5,250.5L148.6,248.2L148.4,247.6L146.3,246L145.3,245.5L143.9,245.3L143.2,245.3L142.7,244.8L142,244L141.2,243.4L140.2,243L139.4,243L139.3,242.8L139.1,242.3L138,240.7L138.1,240.3L140.6,239.9L142.1,239.9L142.9,239.7L143,239.9L143.1,240.5L143.9,241.1L144.5,241.2L144.9,241.1L146.2,240.8L147.2,240.3L147.9,239.8L148,238.8L147,237.2L146.4,236.3L146.3,235.8L146.9,234.6L147.6,233.4L147.6,232.9L147.5,232.4L147.8,231L147.8,229.1L147.5,228L147.7,226.6L148.1,225.4L149.4,223.7L149.4,222.8L148.9,221.8L146.7,219.6L144.2,217.9L143.2,217.5L142.5,217.3L141.5,217.8L140.7,218.7L140.1,218.5L139,217.7L138.5,216.8L138.4,215.3L138.5,213.4L138.5,212.8L138.8,212.3L139.2,212L140,211.9L140.3,211.5L140.4,211L140,210.2L139.7,209.1L139.3,206.9L139.8,206L140.5,204.6L140.7,203.8L141.7,203.9L143.1,203.9L143.8,203.5L144.5,202.9L144.7,202.5L144.8,200.8L144.6,200L144.7,199.4L145.1,199L145.7,198.4L146.8,197.1L147.7,196.4L148.1,196.3L148.9,196.3L150.8,196.6L152.9,196.6L155.8,195.3L156.7,195L157.8,195L158.5,195.3L158.7,195.1L158.7,193.7L158.9,193.3L159.3,193L159.7,193L161.1,194.1L162.3,194.4L163.9,194.5L167.7,193.3L168.1,193.5L168.3,193.9L168.3,195.3L167.8,198.2L168,198.6L170.2,199.4L172,198.8L172.7,198.8L173.7,199.3L174.4,199L175.1,198.8L175.4,200.2L176.5,199.9L177.7,199.3L178.5,198.5L179.4,197.7L180.3,196.6L180.8,195.5L181.2,195L181.9,194.6L184,192.5L185.1,192.2L186.1,192.2L188.1,193.3L189.3,193.6L192.6,194.9L194.2,194.9L195.5,194.7L197,195.3L199,195.4L202.4,193.1L202.6,192.4L203,191.8L204.1,191.3L205.4,191L208,190.1L213.2,189L215.1,188.5L215.8,188.7L217.6,188.5L220.9,188.2L222.1,186.9L223,186.8L226.5,187.5L226.7,187.4L226.9,187.2L227,186L227,185.1L227.3,184.9L227.7,184.5L227.8,183.9L227.8,181.9L228,180L228.2,178.4L228.4,177.8L229.1,176.8L229.9,176L232,175.7L233.3,175.7L233.6,175.2L232.6,174.5L232,173.8L232,173.4L232.1,173L232.4,172.7L233.8,172.4L235.2,172.1L236.6,172.9L236.9,172.7L237.2,172.1L237,171.3L237,170.2L236.5,169.5L236.6,168.8L237.3,167.8L237.3,165.6L237.1,163.6L236.9,160.2L236.4,159.1L236.4,157.6L236.1,156.7L236.5,155.6L236.7,154.8L237,153.2L237.3,151.5L237.9,149.8L238.6,148.8L238.6,148.3L238.9,148L239.5,148.1L239.9,147.7L239.8,147.1L238.8,146.5L237.9,145.6L236.5,145.3L235,145.1L234.4,144.5L234,143.8L234,143.4L235.1,142.7L236.5,142.1L238.5,142.1L240.6,142L241.8,141.8L243.2,141.9L244.8,142.1L245.5,142.4L247.7,142.3L251.1,141.9L254.3,141.7L255.4,141.3L255.9,142.1L256,143.4L256.6,144.3L257.4,144.8L257.9,144.9L259.4,144.8L261.1,144.8L261.6,145.1L262.2,146L263,146.8L263.5,146.9L264,146.5L264.6,145.7L265.1,144.6L265.5,143.3L265.5,142.5L265.3,142.2L264,141.4L262.8,140.3L262.8,139.6L262.9,139.2L263.6,138.1L265,136.1L266.5,133.4L267.5,131.2L269.8,128L271.8,124.6L274.9,119.8L275.4,118.8L276,117.2L276.2,116.5L276.9,116.3L277.9,116.9L280.3,118.7L282.1,120.2L282.8,120.7L284,121.3L285.8,122.2L287,122.3L288,122.3L289.3,122.5L291.3,123.3L291.9,123.4L292.7,123.7L293.1,124.3L293.2,125.5L293.5,126.1L294.3,126.1L296.1,125.4L297.3,124.8L298.9,123.9L300.2,124L301.6,124L302.2,123.6L303,122.3L304,121.4L304.4,120.2L304.3,119.2L304,117.6L304.2,116.6L304.6,113.6L304.7,110.9L305.5,108.9L306.7,106.7L307.1,106L307.7,105.1L308.5,104.1L309.4,103.9L311.8,104.1L314.1,104.1L315.3,103.8L316.5,103.7L317.2,103.5L318.7,102L319.5,101.2L320.4,98.7L320.3,97.4L320.8,96.4L321.4,95.9L322.4,95.4L322.9,95.4L324.1,95.4L325.9,95.8L326.8,96.3L327.8,96.6L328.4,96.5L328.9,96.1L329.6,96L330.5,96L331.6,95.9L332.1,96L332.1,96.7L331.9,97.3L331.9,98.1L332.2,98.7L332,99.2L331.4,99.4L330.8,99.7L330.6,100.3L331.1,101.1L331.2,101.8L332.3,102.5L333.1,103.1L333.3,103.6L333.1,104.1L332.6,104.5L332.1,105L332,105.4L332.1,105.8L332.9,106.2L333.8,106.9L335.3,107.7L336.2,109L337.2,109.5L337.5,110.6L337.4,112.1L338.3,113.1L339.8,114.4L340.6,114.8L341,115.5L341.7,116.4L342.4,116.7L343.2,117L344.7,116.5L346.3,116.7L347.1,117.2L347.7,118.8L348.2,119.4L348.4,119.9L348.9,120.4L349.5,120.5L350.4,120.3L351,119.7L351.7,120L351.9,120.4L351.9,121.2L352.1,122.2L353,123L354.2,123.6L354.3,123.9L354.4,124.9L354.6,125.6L355,126.5L355.2,128L355.1,129.3L355.2,130L355.6,131.2L356.3,133.1L356.9,134.7L357.7,135.2L358.4,135.8L358.7,136.9L359.2,139.1L359.1,140.5L359,141.6L359.2,142.1L359.2,142.6L358.2,144.7L357.5,145.7L357.3,146.5L357.5,148L357.8,149.2L357.7,150.3L357.1,151L356.2,151.9L355.8,152.4L355.1,152.8L353.9,154.6L353.1,156.6L352.9,157.7L353.1,158.5L353.6,159.5L353.6,160.2L354.3,162.1L354.5,163.1L354.8,163.2L355.3,163L356.4,163.1L357.3,163.6L358.1,164.5L359,165L360.5,165.1L361.2,165.7L361.9,166.1L363.6,166.5L364.9,166.6L366.8,166.9L368.3,167.6L371,168.4L372.7,168.6L375.1,168.5L376.4,168.9L380.5,170L382.9,170.9L384.4,171.8L385.3,173L386.4,174.8L387.3,175.7L389.9,176.4L391.5,178.6L392.9,179.5L395.1,181.6L396.8,182.6L398.7,183.5L402.1,183.5L402.3,183.8L401.9,184.8L401.6,186.2L401.5,187.2L401.8,187.8L403,188.2L403.6,188.8L403.9,189.8L404.2,190.4L405,193.4L406.3,198L406.3,199.7L406.8,200.8L408.6,202.7L409.4,204.1L410.8,205.5L411.2,206.8L411.2,208.4L411.5,208.8L414.3,208.7L416.7,208.7L421,208.6L426.8,209.9L432.7,211.1L438.1,212.2L440.7,212.7L446.6,213.8L450,213L452.6,212.4L453.8,212.6L458.7,213.7L461.6,214.2L465.2,215L467.8,215.3L469.8,215.3L470.8,215.6L471.7,216L472.3,216.6L474.1,219.3L475.2,220.6L477.3,221.5L482.1,222.7L484.7,223.4L487.8,224.1L489.8,225.3L492.1,226.6L495.1,228.2L498.5,227.6L502,226.8L504.3,226.4L504.3,229.8L507.5,230L508.5,230L509.9,230.8L510.7,230.4L511.4,229.7L512.4,228.5L513.7,228L516.1,226.7L516.7,226.4L520.1,224.5L525.3,222.2L527.6,221L528.3,220.8L529.6,220.2L530.5,219.8L532.1,219.4L534.2,219.2L536.5,218.7L541.7,217.8L542.4,217.7L545.3,217.3L546.6,216.9L548.4,217L550.9,217L552.5,217.2L554.7,216.9L557.6,216.6L560,216.5L561.2,216.2L562.9,215.3L564,214.5L565.8,213.6L568.1,212.7L569.6,211.8L570.6,211.2L571.9,210.7L572.2,210L572.5,209.5L573.2,208.7L574.3,207.2L575.1,205.8L575.6,205.2L576.5,203.8L577.3,202.8L578.3,201.4L579.2,200.9L580.3,200.5L583.2,199L583.8,198.7L584.2,198.6L585.2,197.5L586.1,196.5L586.6,195.8L587.8,195.5L588.4,195L588.4,194.3L588.2,193.3L587.6,192.4L587,191.6L585.2,190L584.2,189L583.2,187.8L582.7,186.6L582.1,185.8L581.7,185.1L581.7,184.3L582.5,182.8L582.7,181.9L583,180.2L583.7,177.8L584.2,176.6L584.9,175.5L586.5,173.9L587.9,173.5L588.8,173.7L590.8,173.6L592.1,173.5L593.2,174.2L594.4,175.6L595.6,176L599.5,176.8L601.2,176.9L602.3,176.9L604.1,177.1L604.7,177.2L605.6,177.3L606.3,177L607.3,175.9L608.6,174.7L609.1,174.4L610.2,173.8L610.7,173.3L611.5,172L612.7,170.9L614.1,169.3L614.7,168.2L614.8,167.5L614.9,166.7L615.4,166.3L616.2,165.8L617.3,165.6L619.3,166.1L622,165.6L622.6,165.4L624.9,164.8L626,164.4L627.5,163.9L628.6,162.6L630,161L631.1,160.1L631.8,159.8L632.7,158.9L633,157.9L632.8,157.2L632.6,156.6L633,155.3L633.8,153.1L634.6,152L635.3,151.1L635.6,149.8L636.2,149.4L636.9,149.1L637.9,148.2L638.6,147.9L640,148.1L641.9,148L643.1,147.9L643.8,147.7L644,147.2L643.9,146.5L644.1,144.8L644.2,144.3L644.5,144L645.6,143.8L646.5,144.3L647.1,144.7L647.9,144.6L648.6,144.2L649.5,142.8L651.1,141.8L652,141.5L653.5,140.7L654.6,140.8L656.5,140.7L657.2,140.4L658,140.5L658.6,139.5L659.2,139.2L660.4,139.4L661.3,140L662.9,140.6L664.7,140.7L666.2,140.3L667.8,140.4L668.8,140.3L669.1,139.9L670.3,139L670.5,138L670.2,137.1L670.2,136L669.7,135.3L668.7,134.3L668.3,133.6L668.1,132.6L667.5,131.8L666.2,130.8L665.3,130.4L663.4,128.7L662.8,128.3L662.6,128L662.3,127.4L661.7,127.2L660.8,126.8L660.3,126.3L659.9,125.5L659.7,124.9L658.9,124.5L658.2,124.3L657.4,124.1L656,123.8L655.2,122.8L653.6,121.1L652.8,120.6L650,120.7L649,120.4L647.9,120.7L647.3,121.1L645.8,121.3L645.1,121.6L644.3,123L643.2,124.8L642.3,125.9L641.7,127L641.4,127.4L640.7,127.3L639.6,126.2L638.1,125.4L636.8,125.1L636.2,124.9L634.7,124.8L633.6,125L632.2,125.6L630.7,125.7L630.1,125.5L629.2,125.6L627.6,126.9L626.9,128.2L626,128.7L625,128L623.8,127.2L622.7,126.1L621.9,125.1L621.2,122.2L622.4,121.2L623.8,120L623.7,118.5L623.5,116.7L623.6,114.8L624.8,112.9L625.3,111.3L625.3,110.4L625.8,108.8L626.3,107.1L626.9,104.9L628.1,101L629.5,96.4L630.2,94L632.5,95.1L633.9,95.7L636.3,96.5L638.7,96.4L641.2,97.3L642.4,97.5L643,97.4L645.8,94.1L648.2,91.4L651,89L653.3,88.5L654.9,87.7L655.9,86.7L656.4,85.2L656.3,83.2L655.7,82L654.5,81.8L654.2,81.4L654.6,80.9L654.9,80L655,78.8L655.4,77.5L656.3,76.3L656.7,75L656.6,73.7L657,72.2L657.9,70.7L658.3,69.4L658.3,68.3L658.6,66.8L659.8,64.1L660.3,61.1L661.7,58.9L664,56.4L665.4,54.2L665.7,52.1L665.4,50.4L664.4,49L664,47.5L664.2,45.8L663.6,44.7L662.2,44.2L660.6,44.2L658.8,44.9L657.7,44.6L657.3,43.3L657.6,42.1L658.7,41.1L660.3,38.7L662.5,35L664.9,32.7L668.8,31.5L671.9,29.9L675,28.2L677.3,27.3L677.7,27.5L679.1,27.4L681.2,26.8L683.1,26L684.9,24.9L686.3,24.4L687.5,24.6L688.1,24.5L688.6,24.5L688.8,24.4L689.2,24L690.6,24.3L693.3,25.5L695,26L695.6,25.7L696.3,26L697.3,27L698.4,27.4L700.1,27.4L702,28.3L702.7,28.2L702.8,27.5L703.3,27L704.3,26.6L705.8,26.9L708,27.8L709.3,28.2L709.7,27.9L710.3,28L710.8,28.6L711,29.3L711,29.7L711.6,30.3L712.1,30.2L713,30.3L713.9,31.3L714.6,31.7L715.1,32L715.3,32.4L715.4,32.7L715.4,33.1L715.2,33.6L715.3,34.1L715.7,34.6L716.9,34.8L717.3,35.2L717.5,35.7L718,36.3L718.9,36.8L719.3,37.4L719.2,37.9L719.5,38.2L720,38.5L720.3,39.6L720.5,40.2L721.2,40.8L721.7,42.3L722.5,43.9L724.4,45.8L725.1,46.9L725.3,48.4L725.7,49.1L726.4,49.3L726.9,49.8L727,50.7L727.4,51.2L727.7,51.8L727.8,52.7L728.2,53.5L728.7,54L729.1,54.8L729.5,55.9L730.8,57.5L733.2,59.5L734.7,61.2L735.4,62.4L735.7,63.5L735.5,64.5L735.6,65.1L736,65.5L736.3,66L736.3,66.7L737.1,67.3L739.3,68.3L739.1,70.6L739.2,72.2L739.7,73.7L740.4,74.7L741.5,75.1L742.1,75.7L742.5,76.3L743.7,76.9L745.8,77.2L748.2,76.8L751,75.6L752.8,75L753.5,75.2L753.9,75.7L753.8,76.5L754.5,76.8L755.7,76.8L756.6,77L757.3,77.6L757.9,77.6L758.5,77.2L759.1,77.1L759.8,77.3L760.2,77.1L760.4,76.5L761,76.4L761.6,76.3L762.2,77.2L762.9,77.6L763.7,77.5L765.3,78.4L768.7,81.3L770.6,82.1L772.3,82L774.3,81.6L775.4,82.7L775.2,84.3L775.4,85.5L776,85.8L777,87.1L778.1,87.6L778.4,88.2L779,88.8L779.2,90.2L779,92.4L779.7,94L781.2,95L782.3,96.2L782.8,97.4L783.3,98.1L783.8,98.2L785,97.8L786.9,96.8L788.4,96.4L789.5,96.8L791.9,96.2L795.4,94.5L797.8,93.7L798.8,93.6L799.4,92.5L799.7,90.5L800.1,89.4L800.8,89.3L801.7,88.4L802.8,86.7L803.8,85.6L805.5,85.2L807.2,84.8L808.1,83.9L808.7,82.5L810.1,81L813.4,78.5L814.2,78L814.7,78L815.9,77.8L817.2,78L818.5,78.7L818.9,79.3L819.1,80.2L819,80.8L818.7,81.4L818.6,82.5L819.1,83.1L820.2,84.5L821,85.4L822,86.5L821.9,87.1L821.8,88.1L821.3,89.9L820.9,90.7L820.5,91.4L819.5,91.9L819.1,92.2L818.7,92.6L818.6,93.2L818.3,93.7L818,94.6L818.1,95.3L818.7,96.2L819.2,97.2L818.8,98.3L818.7,99.8L818.6,100.2L818.7,101.4L818.7,101.7L819.2,104L819,105.7L818.6,107.7L819.1,108.7L819.6,109.6L819.5,110.1L819.6,110.5L819.7,111.5L819.5,111.9L818.9,112.8L818.6,113.6L819,114.7L819,115.7L818.8,116.6L818.6,117.2L818.1,117.8L817.8,118.2L817.8,119.3L817.9,120.1L817.9,121L818.3,121.7L818.2,122.5L817.5,123.3L817.1,123.7L816.7,124L816.1,125L816.1,127.8L816.4,129.4L817,130.7L816.1,131.9L815.5,132.8L815,132.7L814.4,132.6L813,132.7L812.4,132.7L811,132.6L808.9,132.6L806.7,132.5L805.4,132.5L804.4,132.5L803.5,132.3L802.7,131.6L802.2,132.1L801.9,133.2L801.1,134.1L801,135.2L800.8,136.1L800.2,137.5L799.9,138L798.2,139.3L797.8,139.6L796.3,140.2L795.8,140.7L795.5,141.5L795.5,142.2L796.1,142.8L797.1,144.1L797.6,145L798.6,146.8L801.6,152.4L801.5,153.5L802.3,158.1L802.6,158.9L802.9,160.2L803.2,161.1L803.6,161.3L804,161.5L804.4,162L804.6,162.8L804.5,163.5L804.6,164.8L804.7,166.6L804.4,167.4L804.3,168L804.1,168.5L804.4,169.7L804.5,170.5L803.9,171L803.3,171.7L802.4,171.7L801.7,172L800.9,172.6L799.4,173.4L798.6,174.1L798.3,174.6L798.1,175.1L798.1,175.5L798.4,175.7L799.4,175.6L800.2,176.2L800.5,177L800,177.7L799.5,177.3L799,177.2L797.8,176.8L796.8,176.1L796,175.4L795.5,173.4L795.4,173.2L794.3,173L793.8,172.6L793.3,172.4L792.7,172.8L792.1,172.7L791.7,172.5L791.2,172.6L790.9,173.2L791,174.3L790.7,176.3L791,177.4L791.1,179L791.3,181L791.1,181.5L790.4,181.7L790.1,181.9L789.9,182.7L789.4,182.9L788.9,182.6L788.1,182.4L787.5,182.6L787,183.1L786.5,184.1L786.3,184.9L786.3,185.6L786.4,186.4L785.9,187.3L785.4,187.9L784.4,189.3L784.1,189.9L783.1,190.1L782.1,190.3L780.8,191L778.6,191.7L777.2,191.8L775.6,192.4L774.4,193.1L774.3,193.7L774.6,194.5L775,194.9L775.4,195.2L776.2,196.1L777,197L778,197.5L778.5,198.2L778.7,198.8L778.5,199.8L778.2,201L777.8,201.9L777.3,201.9L776.6,201.7L776,201.3L774.9,201.4L772.3,202.3L771,202.4L770.2,202.2L769.1,202.4L767.3,202.2L766.2,202.3L765.7,202.1L765.4,201.3L764.8,200.9L764.4,200.3L763.5,199.6L762.9,199.3L762.2,199.2L761.7,199.9L761.1,200.5L760.6,200.5L760.4,200.7L760.2,201.1L759.3,202.2L759.2,202.9L759.1,204.5L759.2,206.1L759,206.7L758.6,206.9L758.2,207.5L757.6,209.2L757.1,210.7L756,211.9L755.6,212.8L755.5,213.6L754.8,214.9L753.5,215.4L752.6,215.9L751.9,216.1L751.6,216.6L751.4,217.4L751.3,217.7L750.7,217.8L750.2,218.5L749,220L747.9,220.5L746.6,221.7L745.4,222.6L745,223.1L744.9,223.5L744.8,224L744.2,224.3L743.6,224.4L742.5,225.8L742,226.9L739.7,229.6L738.9,231L738.9,232.6L738.7,232.5L738,234L736.4,235.6L732.4,236.7L731,236.1L730.6,236.8L730.4,237.7L729.4,238.2L727.8,238.6L726.9,239.3L726.6,240L724.3,240.6L723.6,241.6L722.3,242.2L717,246.8L715.9,248.6L715,250.6L714.3,251.6L713.6,252.4L713,252.8L712.4,253.5L711.7,253.7L710.9,253.5L710.2,253.8L709.8,254.6L710.4,255.5L710.2,255.9L708.7,256.7L706.4,257.5L705.5,258.3L705.2,258.7L704.8,259L704,257.8L703.6,256.2L704.5,255.6L705.4,255.3L709.9,252.2L709,250.6L709.3,249.7L710.2,248.3L710.8,247.6L710.4,247.5L707.2,248.4L705.4,248.7L704.4,248.8L704.5,247.7L704.2,246.7L703.9,246.3L705.3,244.9L706,244.5L706.6,244.4L706.4,243.7L705.8,242.7L706,241.2L709.1,239L709.6,237.4L710.7,235.8L712.5,232L712.6,231.4L713,229.7L713,229L711.7,228.3L711.1,227L707.4,225.3L706.7,223.3L706.5,223.4L706.2,224.9L705.9,225.5L704.4,225.8L703.5,225.4L699.3,225.7L698.4,226.8L697.7,228.4L696.9,229.6L696.1,230.2L695.4,231.3L692.9,237.3L691.7,238L686.1,242.2L683.2,244L681.2,246.7L680.6,248.2L680.1,249.8L680,252.3L678.3,255.4L677.6,256.1L676.9,256.5L675.8,256.6L675,256.9L673.5,256.8L671.7,258L669.8,259.1L667.7,257.3L666.4,257L664.4,257.9L663.5,258.9L662.1,263.5L661.6,266L661.8,267.1L663.4,270L665,271.5L668.2,273.1L674.8,273.6L676.2,272.9L677.8,272.7L679.7,273.7L681.1,275.7L681.4,277.1L681.5,277.6L681.9,278L682.3,278.7L681.7,279.4L681.2,279.8L681.1,282.1L681.4,284.6L682.1,285.3L683.7,286.3L686,287L688,286.9L691.7,285.8L693,284.1L692.8,283.4L692.7,282.6L695.7,279.9L697.3,277.6L696.9,277.1L696.5,276.9L696.8,276.6L697.8,276.3L702.1,273.5L706,274.6L708.3,276.2L710.4,276.1L712,276.9L713.8,277.4L716,277.1L717.8,277L718.2,276.1L718.7,275.5L719.3,275.5L720.2,276.4L722.4,276.8L724.3,276.4L725.6,275.9L726.4,276.1L725.5,277.6L726.1,279.6L725.3,280.4L724.7,281.7L725.3,282.3L725.8,282.5L725.9,283.4L725.2,284L724,285.5L723.2,285.6L722.8,285.4L722.4,285L722.1,284.3L721.5,284L720.1,284L718.7,284.4L715.8,286.9L712.9,288.9L709.8,290.7L708.9,291.6L708.1,291.9L706.7,291.6L705.8,291.8L705.7,292.2L707,293.1L707.4,293.8L707.4,294.5L706.8,294.9L705.9,294.5L705.2,295.3L705,296.5L705.4,299.1L705,299.8L703.6,300.4L702.1,301.5L701.5,301.2L701.2,300.7L701.2,299.5L700.9,298.9L700.2,299.1L699.2,299.6L698.5,300.5L698.3,301.1L699.6,302.4L700.7,302.4L701,302.7L700.3,303.6L698.4,305.1L698.2,306.1L697.7,307.1L697,307.9L696.6,308.8L695.9,309.3L694.9,309.9L693.8,311.9L693,313.8L691.9,314.8L691.4,317.9L689.9,319.7L689.6,322.3L690.3,323.8L692.2,323.5L693.2,323.9L695.5,325.6L698.1,326.5L700.6,326.9L703.9,328.3L704.9,329L705.9,330.5L707.9,334.9L709.2,337L709.5,338.2L711.3,340.2L713.4,343.9L715.7,347L716.5,349.6L716.1,350.9L716.4,352.4L718.4,353.6L722.6,354.6L723.3,355L724.2,355.7L724.7,358.2L725.4,358.9L726,359.3L728.6,360L729.7,360.7L731,361.9L731.6,363.2L732,364.9L730.7,365.2L729.6,365.2L724.9,363.7L723.8,363.8L722.3,364.4L720,364.3L717.2,362.2L715.4,361.7L713.5,361.7L709.4,364.5L708.3,364.5L708,364.8L707.6,365.3L709.7,365.4L711.6,364.4L713.4,363L716.3,363.1L716.9,364L717.7,365.5L719.8,366.2L721.4,366.4L723.6,367.5L725.9,369.4L730.4,371.2L732.4,373.3L733.3,374.8L734.3,376.9L733,377.9L731.8,378.2L729.9,378.9L728.6,379.9L727.4,381.5L723.6,384.4L723.1,385.9L722.7,387.2L721.8,387.9L719.2,387.8L716.8,388.2L714.3,390.2L713.8,391L714.2,390.8L714.6,390.5L715.9,390.6L717.6,389.4L719.9,391.7L723.4,390.7L726.4,388L727.7,387.7L728.9,387.9L730.2,388.5L734.2,391.7L736,391.8L737.9,392.4L738.9,392.4L739.8,392.5L737.7,394.3L735.2,397.8L734,398.8L733.2,399.7L735.6,398.9L737.1,397.2L737.9,396.7L738.7,396.9L739.4,398.6L739.6,404.2L738.8,404.4L737.7,403.1L736.6,402.8L735.9,403.2L734.2,403.5L733.7,404.3L733.3,405.3L734.4,405.3L736.6,406.7L736.9,407.5L736.5,408.2L735.1,408.2L737,409.1L736.8,410.5L736.3,411.1L735.4,411.6L735,412.8L736.2,414.5L737.4,416.7L737.8,417.9L736.3,417.6L734.4,419.4L733.4,419.7L732.3,417.9L731.4,418.4L730.8,419.1L730.3,421.3L729.6,423.3L728.7,424L727.6,424L726.8,424.2L727.1,424.7L728.1,425.1L728.2,425.8L726.6,428.4L726.4,429.4L726.6,430.1L725.6,431.2L726.5,432.6L726.3,433.7L725.7,435.3L724.8,436.5L723.9,438.2L722.6,439.4L721.2,442.9L720.9,444.7L721,446.4L720.5,447L719.5,447.9L718.3,447.8L718.1,446.6L717.6,446.6L717.2,445.9L716.9,445L716.9,444.2L716.5,444.5L716.3,445.5L715.6,446.3L714.8,446.1L713.8,445.7L714,446.5L714.6,447.3L714.9,448.1L716.1,448.1L717.1,449L718,450.4L718.2,450.9L718.8,451.5L719,452.1L717.9,452.8L716.6,454L715.1,455.9L713.8,457.3L712.5,457.5L711.7,457.5L710.4,457L709.1,456.9L711.2,458.9L712.2,459.2L713.4,458.9L714.4,457.9L716.1,457.8L716.7,459L716.5,460.6L715.9,462.6L715.9,464.3L717.4,466.6L717.6,467.3L717.2,467.7L715.8,467.3L714.6,466.6L713.5,467L712.3,466.8L711.2,467.3L710.8,467.9L711.3,468.8L712.4,469.4L713.2,470.5L712.6,471L709.5,471.2L708.9,471.5L708.2,472.9L709.1,474.7L708.6,476L707.4,476.4L705.9,477.6L704.9,478L705,478.4L705.8,478.7L706.3,479.2L705.7,481.3L704.4,482.2L702.2,482.1L700.6,482.8L699.1,482.2L697.6,482.4L696.7,483.5L696.7,484.8L695.7,485L695.2,485L694.4,485.2L694.6,485.9L695.1,486.4L697.2,486.4L697.7,487.1L697.9,488.4L696,490.9L695.3,492.5L693.9,492.6L693,493.9L692.7,495.6L691.9,495.4L690.3,495.9L689.9,496.7L690.4,497L690.5,497.5L690.1,499.4L689.4,500L689,499.3L688.6,498.2L688,498.2L687.2,499.4L686.2,500.3L685.3,500.7L684.5,500.1L682.7,499.9L682.4,503.1L681,504.4L680.4,504.8L679.2,505L680,505.4L680.4,506.1L680,507L678.8,507.3L678.2,507.9L678.3,510.7L677.7,511.8L675.9,512L674.4,511.6L674,512.1L673.9,512.6L673.2,513.2L671.9,513.5L668.9,515.1L667.5,514.9L665.8,514.6L664.6,515.2L664.4,516.2L663.9,517L662.2,517.1L660.8,516.4L659.3,515.9L657.9,516.6L656.8,517.9L655.4,518.4L655.3,519.1L654.7,519.6L653.1,519.6L652.4,517.8L651.5,517.7L650.7,518.7L650.5,519.4L650.1,520L650.4,521.4L649.6,521.5L648.4,520.7L647.2,520.7L646.2,521.6L645.6,521.5L645,521.3L644.1,521.4L643.7,521.7L643,521.9L642.6,522.4L642.6,522.4L641.3,522.2L639.7,521.2L638.4,519.3L637,518.3L636.3,517.4L635.9,515.7L635.6,514.9L635.6,514L635.9,513.2L634.5,513.7L633.5,514.6L633.8,515.5L633.6,516.4L632,517L632.1,517.3L632.2,517.7L633.6,518.8L634,519.8L634.5,520.3L635.7,521.7L635.9,524.8L636.5,525.6L636.4,526.4L636.1,527.6L636.1,527.6L635.8,527.3L635.3,527.4L635.1,527.8L635.1,528.2L635.1,528.2L634.2,528.5L633.5,528.8L633,529.2L632.2,530.1L630.4,530.5L629.4,528.5L628.3,530L628.2,532.9L627.8,533.4L627.1,533.9L625.6,533L624.4,533.8L623.5,534.5L623.2,535.2L622.5,535.9L621.1,535.4L620,534.5L620.2,533.7L620,533.2L619.5,532.9L618.9,533L619.3,533.9L619.6,535.8L619.1,536.3L618.4,536.8L616.7,536.6L615.6,536L614.1,535.5L612.9,535.5L612.8,536.7L612,537.7L611.3,537.8L610.6,537.7L609.7,538.8L609.3,539.6L608.2,540.5L605.1,541L604.1,541.9L602.6,541.9L601.5,542.1L600.8,542.1L600.2,541.7L599.6,541.8L599.3,543.1L597.6,543.8L596,544L594.4,545.8L593.2,546.9L592.2,547.1L591.5,546.8L591.1,545.2L590.7,545.1L590.6,546.5L590.3,547.8L589.7,548.5L587.7,550.1L587.2,551.6L587.7,552.9L590.5,553.1L590.9,553.9L590.6,554.5L590,555L589.8,555.8L593,558.1L593.1,559.1L592.7,559.6L592.2,560.8L590.7,561.8L587.3,562.5L584.5,562.2L583.6,561.1L583.6,560.3L584.3,560.5L585.1,560.4L584.9,559.7L584.5,559.3L583.2,558.7L582.1,557L582.2,555.6L581.6,554.5L580.9,553.6L580.3,553.1L579.9,552.4L580.4,550.2L580,549L581.1,547.3L581.3,545.6L583.4,544.9L583.5,543.2L581.9,543.2L580.8,542L580.6,542.6L579.8,542.7L578.3,540.4L577.9,540.1L577.2,540.1L577.7,542.6L576.1,543.6L574.8,544L572.9,544.3L571.9,544.6L570.9,544.4L571.1,543.7L571.6,542.7L571.1,542L570,541.5L568.4,541.6L567.2,541.5L566.1,541.6L565.7,541.3L564.6,540.1L563.7,539.4L563.3,538.7L563.7,537.8L563.3,537.3L561.6,537.4L561.7,538.6L561.9,540L562.4,541.1L562.1,541.7L561.3,542.1L560.3,541L559.9,540.7L559.5,540.8L559.2,542L558.4,543L556.9,542.9L555.7,543.6ZM599.1,566.2L599.9,566.9L600.5,567.9L601,569.8L601.4,571.5L599.9,572.7L598.6,573.3L596.1,577.7L595.6,579.1L595.1,579.7L595,580.3L595.1,580.9L594.5,583L594,585.6L593.7,586.7L592.9,587.5L591.9,588L591.3,588.1L590.7,588.3L589.3,589.8L587.7,590.9L588,591.4L588,591.9L587.3,592.4L586.5,592.4L584.2,592.9L583.4,593.7L582.6,595.2L582.3,595.4L580.9,595.8L579.8,596L577.9,595.1L577,594.8L574.5,594.5L572.1,593.9L570.5,593.2L567,591.4L566.5,587.9L565.8,586.1L565.7,585.4L565.7,579.6L566,579L566.4,578.4L567.8,577.1L569.5,576L571.8,573.7L573.5,572.7L574.9,571.2L574.1,571.3L573.4,571.2L574,570L574.7,569.3L575.4,568.9L577,569.1L578.4,568.8L579.4,567.7L580.5,567.4L584.3,567.5L587,566.9L588.3,565.9L588.9,565.8L590.9,566L591.7,566.9L591.6,566.3L591.6,565.6L592,565.6L594.6,566.8L594.5,565.2L594.7,564.8L595.4,564.1L595.8,564.1L596.9,565.3L597.9,565.9ZM635.1,528.2L635.1,527.8L635.3,527.4L635.8,527.3L636.1,527.6L636.1,527.7L635.4,528L635.2,528.1ZM642.6,522.4L642.6,522.4L643,521.9L643.7,521.7L644.1,521.4L645,521.3L645.6,521.5L646.2,521.6L646.2,521.7L646.6,522.2L646.6,522.9L647.2,523.2L647.4,523.8L646.8,524.2L646.8,525L646.6,525.5L644.6,524.8L643,524.6L641.6,524.9L641.1,524.4L640.9,523.9L642.5,522.9ZM646.2,526.9L645.8,527.2L644.7,526.1L644.6,525.7L645.4,525.6L646.3,526L646.3,526.5ZM642.7,527.2L641,527.4L640.6,527.3L640.4,527L640.9,526.3L643.2,525.2L642.7,526.2Z", "relief": [{ "kind": "mountain", "path": "M168.7,160L167.3,159.5L165.1,158.5L168.4,159.9ZM165.1,158.5L159.3,156.2L167.3,159.5L168.8,160.1L168.7,160L172.5,161.6L176.3,161.9L188.5,157.6L267.6,173.1L269.6,172.8L270.5,172.7L279.8,169.2L294.3,170.7L305.8,171.7L319.4,177.9L345,182.6L365.8,180.9L396.8,189L397.7,189.4L398.4,190.1L398.9,191L399.3,192.4L399.4,194.2L399.1,198.7L398.2,202.2L396.6,204.9L394.6,207L392.1,208.3L389.4,209L383.4,208.7L381.9,208.3L380.7,207.6L378.7,205.8L375,200.8L372.9,198.9L370.6,197.8L350.7,194.8L347.9,195.4L345.9,196.9L345.1,199.4L339.1,200.5L336.3,200.5L334.8,200.1L326.6,194.3L325.1,194L323.6,194.3L322.2,195.3L321.8,195.8L321.5,196.4L320.8,198.6L320.6,199.2L320.2,199.6L319.8,200.1L305.7,208.1L300.7,209L297.5,208.7L274.4,199.5L247,198.6L183.1,210.1L155.6,205.2L135.7,197.1L135.3,196.7L135.1,196.1L135.3,195.3L136.3,192.9L142,184.2L149.2,168.2L149.7,166.4L149.9,158.1L150.3,156.8L151.8,155L153.7,154.3L155.8,154.4Z", "marks": "M150,158l4,-5l4,5m-4,-5l1,4M157,171l4,-5l4,5m-4,-5l1,4M171,171l4,-5l4,5m-4,-5l1,4M185,171l4,-5l4,5m-4,-5l1,4M199,171l4,-5l4,5m-4,-5l1,4M213,171l4,-5l4,5m-4,-5l1,4M227,171l4,-5l4,5m-4,-5l1,4M241,171l4,-5l4,5m-4,-5l1,4M150,184l4,-5l4,5m-4,-5l1,4M164,184l4,-5l4,5m-4,-5l1,4M178,184l4,-5l4,5m-4,-5l1,4M192,184l4,-5l4,5m-4,-5l1,4M206,184l4,-5l4,5m-4,-5l1,4M220,184l4,-5l4,5m-4,-5l1,4M234,184l4,-5l4,5m-4,-5l1,4M248,184l4,-5l4,5m-4,-5l1,4M262,184l4,-5l4,5m-4,-5l1,4M276,184l4,-5l4,5m-4,-5l1,4M290,184l4,-5l4,5m-4,-5l1,4M304,184l4,-5l4,5m-4,-5l1,4M318,184l4,-5l4,5m-4,-5l1,4M332,184l4,-5l4,5m-4,-5l1,4M360,184l4,-5l4,5m-4,-5l1,4M143,197l4,-5l4,5m-4,-5l1,4M157,197l4,-5l4,5m-4,-5l1,4M171,197l4,-5l4,5m-4,-5l1,4M185,197l4,-5l4,5m-4,-5l1,4M199,197l4,-5l4,5m-4,-5l1,4M213,197l4,-5l4,5m-4,-5l1,4M227,197l4,-5l4,5m-4,-5l1,4M241,197l4,-5l4,5m-4,-5l1,4M255,197l4,-5l4,5m-4,-5l1,4M269,197l4,-5l4,5m-4,-5l1,4M283,197l4,-5l4,5m-4,-5l1,4M297,197l4,-5l4,5m-4,-5l1,4M311,197l4,-5l4,5m-4,-5l1,4M325,197l4,-5l4,5m-4,-5l1,4M339,197l4,-5l4,5m-4,-5l1,4M353,197l4,-5l4,5m-4,-5l1,4M367,197l4,-5l4,5m-4,-5l1,4M381,197l4,-5l4,5m-4,-5l1,4M395,197l4,-5l4,5m-4,-5l1,4M178,210l4,-5l4,5m-4,-5l1,4M388,210l4,-5l4,5m-4,-5l1,4" }, { "kind": "mountain", "path": "M238.2,395.3L271.3,402.5L276,401.4L280.7,401.2L339.7,413.7L349.2,418L351.3,418.6L353.5,418.7L354.9,418.4L359,415.9L365.9,414.7L371.4,412.4L373.3,411.6L377.1,408.2L377.8,407.9L378.6,407.7L379.5,407.6L380.3,407.8L381.1,408.1L381.9,408.6L382.5,409.4L383.1,410.3L383.4,410.9L383.5,411.2L383.5,411.4L383.6,411.8L383.4,412.3L383.1,412.6L373.5,416.2L372.6,416.8L371.8,417.5L371,418.9L370.8,420.2L371,421.5L371.7,422.8L376.4,427.8L376.7,428.5L376.7,429.1L376.4,430.2L376.3,431L376.4,431.9L376.7,432.6L376.8,433.1L370.6,437.8L362,444.1L354.5,446.7L324.2,447.1L296.1,442.2L295.3,442.1L292.5,440.8L290.2,439.2L286.4,436.7L285.1,436.3L283.5,436.2L283,436.3L277,437.7L270.3,437.8L260.2,434L238,425.3L229.7,419.1L219.2,414.8L217.6,413.7L215,411.1L212.5,409.3L201.8,405.8L200.7,405L196.6,398.7L167.1,365.6L146.4,340.9L134,319.3L132,315.7L131.2,312.3L131.2,311L131.2,309.5L132,307.4L133.4,305.7L141.8,300.6L143.8,298.8L145,298L146.5,297.7L154.5,298.9L159.3,299.6L160.6,300.6L165.8,307.7L167.7,310.3L233.5,392Z", "marks": "M143,301l4,-5l4,5m-4,-5l1,4M136,314l4,-5l4,5m-4,-5l1,4M150,314l4,-5l4,5m-4,-5l1,4M164,314l4,-5l4,5m-4,-5l1,4M143,327l4,-5l4,5m-4,-5l1,4M157,327l4,-5l4,5m-4,-5l1,4M171,327l4,-5l4,5m-4,-5l1,4M150,340l4,-5l4,5m-4,-5l1,4M164,340l4,-5l4,5m-4,-5l1,4M178,340l4,-5l4,5m-4,-5l1,4M157,353l4,-5l4,5m-4,-5l1,4M171,353l4,-5l4,5m-4,-5l1,4M185,353l4,-5l4,5m-4,-5l1,4M164,366l4,-5l4,5m-4,-5l1,4M178,366l4,-5l4,5m-4,-5l1,4M192,366l4,-5l4,5m-4,-5l1,4M206,366l4,-5l4,5m-4,-5l1,4M185,379l4,-5l4,5m-4,-5l1,4M199,379l4,-5l4,5m-4,-5l1,4M213,379l4,-5l4,5m-4,-5l1,4M192,392l4,-5l4,5m-4,-5l1,4M206,392l4,-5l4,5m-4,-5l1,4M220,392l4,-5l4,5m-4,-5l1,4M199,405l4,-5l4,5m-4,-5l1,4M213,405l4,-5l4,5m-4,-5l1,4M227,405l4,-5l4,5m-4,-5l1,4M241,405l4,-5l4,5m-4,-5l1,4M255,405l4,-5l4,5m-4,-5l1,4M269,405l4,-5l4,5m-4,-5l1,4M283,405l4,-5l4,5m-4,-5l1,4M220,418l4,-5l4,5m-4,-5l1,4M234,418l4,-5l4,5m-4,-5l1,4M248,418l4,-5l4,5m-4,-5l1,4M262,418l4,-5l4,5m-4,-5l1,4M276,418l4,-5l4,5m-4,-5l1,4M290,418l4,-5l4,5m-4,-5l1,4M304,418l4,-5l4,5m-4,-5l1,4M318,418l4,-5l4,5m-4,-5l1,4M332,418l4,-5l4,5m-4,-5l1,4M360,418l4,-5l4,5m-4,-5l1,4M255,431l4,-5l4,5m-4,-5l1,4M269,431l4,-5l4,5m-4,-5l1,4M283,431l4,-5l4,5m-4,-5l1,4M297,431l4,-5l4,5m-4,-5l1,4M311,431l4,-5l4,5m-4,-5l1,4M325,431l4,-5l4,5m-4,-5l1,4M339,431l4,-5l4,5m-4,-5l1,4M353,431l4,-5l4,5m-4,-5l1,4M367,431l4,-5l4,5m-4,-5l1,4M304,444l4,-5l4,5m-4,-5l1,4M318,444l4,-5l4,5m-4,-5l1,4M332,444l4,-5l4,5m-4,-5l1,4M346,444l4,-5l4,5m-4,-5l1,4M360,444l4,-5l4,5m-4,-5l1,4" }, { "kind": "plateau", "path": "M493.3,307.2L494.5,313.7L495.6,319.3L497.3,328.2L496.6,342.9L498.5,362.4L497.5,381.7L495.3,389.2L495,389.8L489.1,395.3L484.3,403.6L486.2,409.6L484.6,415.2L481.7,420.9L476.1,426.8L472.1,428.5L468.5,430L468.3,430L461.8,430.9L431.9,444.9L429.3,446.1L425.9,447.5L423.2,448.6L389.7,437.3L381.6,431.3L380.1,430.3L376.7,432.6L376.7,432.6L376.8,433.1L370.6,437.8L362,444.1L354.5,446.7L324.2,447.1L296.1,442.2L295.3,442.1L294.7,441.8L289.9,440.9L287.3,438.6L285.4,437L283,436.3L283,436.3L277,437.7L270.3,437.8L266,436.2L260.2,434L238,425.3L229.7,419.1L219.2,414.8L217.6,413.7L215,411.1L212.5,409.3L201.8,405.8L200.7,405L196.6,398.7L167.1,365.6L146.4,340.9L134,319.3L134,319.3L133.5,319.7L124.8,305.9L122.6,301.9L121,298.8L117.2,291.8L112.9,281.5L112.7,281.1L112.7,281.1L108.8,274.9L121.1,253.8L142.1,237.5L143.9,237.3L148.7,237L161.5,236L171.8,236.9L173.1,237L189.8,254.9L201.2,261.3L208.9,269.6L210,270.7L210.5,271.1L212.3,272.4L215.5,274.8L215.8,274.8L228.6,273.7L243.4,275.3L244.4,275.2L247.9,274.8L267.7,272.7L274.7,269.4L293,260.4L294.6,260.7L299.3,261.6L304.2,258.5L310.2,254.5L321.4,254.1L329.6,253.7L399.1,248L399.3,248.1L408.5,249.9L408.7,250L410.6,250.3L412.9,251L420.1,253.1L432.9,256.6L437.7,257.9L438.1,258L439.1,258.2L442.7,260.6L444.6,261.8L446.5,263.1L448.2,264.2L455.1,271.8L461,278.1L461.5,278.3L470.5,280.7L476.5,282.3L477,282.9L480.7,286.4L483.9,290.8L487.1,295.2L492.5,302.5Z", "marks": "" }, { "kind": "mountain", "path": "M460.3,190.5L457.6,191.4L440.1,191.2L434.4,189.6L432,188.9L431.1,189.1L430.3,189.5L429.2,190.5L428.7,191L424.9,195.9L423.9,197.2L420.9,199.6L419.4,200.4L417.8,200.9L416.1,201L414.4,200.7L412.7,200L411.1,198.7L402.1,186.5L399.7,183.2L398.4,182.2L397,181.6L374.7,178.3L364.7,173.6L355.9,171.6L351.3,167.7L346.2,158.3L344.2,148.8L343.6,142.4L341.7,135.7L338.3,128.3L333.7,122.2L316.8,110.4L293.6,102.3L293,100L291,94.5L289.1,77.2L288.7,75.1L287.9,73.2L286.3,71.4L280.1,64.6L279,62.7L278.4,60.5L278.4,58.1L278.8,55.6L279.6,53.2L280.7,50.8L282.1,48.7L289.5,39.7L290.5,38.9L293,37.9L297.6,37.6L305,40.3L320,45.6L329.3,48.7L334.1,52.7L338.3,58L342.3,66.4L343.4,70.3L343.2,73.1L343,75.8L342.8,80.3L344,81.9L352.1,91.9L352.5,94.9L352.8,95.6L353.9,97.1L355.2,98.2L362.9,101.4L364.2,102.4L373.4,119.5L375.1,121.7L377.1,123.4L382.3,126L401.5,141.8L408.9,143.9L423.5,155.5L444,164.8L453.5,174.7L459.4,178.7L460.5,179.7L460.7,179.9L461.8,181.5L462.6,183.3L462.7,183.5L463,185.4L462.9,187.1L462.4,188.5L461.5,189.6Z", "marks": "M297,41l4,-5l4,5m-4,-5l1,4M290,54l4,-5l4,5m-4,-5l1,4M304,54l4,-5l4,5m-4,-5l1,4M318,54l4,-5l4,5m-4,-5l1,4M283,67l4,-5l4,5m-4,-5l1,4M297,67l4,-5l4,5m-4,-5l1,4M311,67l4,-5l4,5m-4,-5l1,4M325,67l4,-5l4,5m-4,-5l1,4M290,80l4,-5l4,5m-4,-5l1,4M304,80l4,-5l4,5m-4,-5l1,4M318,80l4,-5l4,5m-4,-5l1,4M332,80l4,-5l4,5m-4,-5l1,4M297,93l4,-5l4,5m-4,-5l1,4M311,93l4,-5l4,5m-4,-5l1,4M325,93l4,-5l4,5m-4,-5l1,4M339,93l4,-5l4,5m-4,-5l1,4M304,106l4,-5l4,5m-4,-5l1,4M318,106l4,-5l4,5m-4,-5l1,4M332,106l4,-5l4,5m-4,-5l1,4M346,106l4,-5l4,5m-4,-5l1,4M360,106l4,-5l4,5m-4,-5l1,4M325,119l4,-5l4,5m-4,-5l1,4M339,119l4,-5l4,5m-4,-5l1,4M353,119l4,-5l4,5m-4,-5l1,4M367,119l4,-5l4,5m-4,-5l1,4M346,132l4,-5l4,5m-4,-5l1,4M360,132l4,-5l4,5m-4,-5l1,4M374,132l4,-5l4,5m-4,-5l1,4M353,145l4,-5l4,5m-4,-5l1,4M367,145l4,-5l4,5m-4,-5l1,4M381,145l4,-5l4,5m-4,-5l1,4M395,145l4,-5l4,5m-4,-5l1,4M346,158l4,-5l4,5m-4,-5l1,4M360,158l4,-5l4,5m-4,-5l1,4M374,158l4,-5l4,5m-4,-5l1,4M388,158l4,-5l4,5m-4,-5l1,4M402,158l4,-5l4,5m-4,-5l1,4M416,158l4,-5l4,5m-4,-5l1,4M353,171l4,-5l4,5m-4,-5l1,4M367,171l4,-5l4,5m-4,-5l1,4M381,171l4,-5l4,5m-4,-5l1,4M395,171l4,-5l4,5m-4,-5l1,4M409,171l4,-5l4,5m-4,-5l1,4M423,171l4,-5l4,5m-4,-5l1,4M437,171l4,-5l4,5m-4,-5l1,4M402,184l4,-5l4,5m-4,-5l1,4M416,184l4,-5l4,5m-4,-5l1,4M430,184l4,-5l4,5m-4,-5l1,4M444,184l4,-5l4,5m-4,-5l1,4M458,184l4,-5l4,5m-4,-5l1,4M409,197l4,-5l4,5m-4,-5l1,4" }, { "kind": "mountain", "path": "M288,271.5L297.1,275.1L317,278.2L320.5,278.7L341.1,281.5L344.9,283.4L357.5,296.1L357.9,296.4L359.6,297.6L361.4,298.8L375.6,303.2L381.4,305L385.4,306.1L387.2,306.7L387.4,306.7L390.8,305.9L393.8,305.3L395.1,305.3L397.1,306.1L417.2,314.6L419.7,314.4L422.2,314.2L422.3,314.2L422.7,314.1L424.2,313.6L424.4,313.6L428.9,310.9L430.1,310.7L432.7,311L435.2,312L437.4,313.5L438.2,314.4L438.9,315.5L439.8,318.3L440.3,321.3L440.4,324.1L440.3,325.5L439.9,326.6L439.5,327.6L438.8,328.4L438,329L437.1,329.3L436.1,329.5L432.9,329.2L416.6,323.9L289,302.2L281,303.9L225.7,294.1L219.8,294.7L213.8,294.2L207,292.3L203.9,290.7L190.9,277.6L188.7,275.9L187.4,275.3L183.9,273.5L181.8,271.8L180.1,269.2L179.9,268.8L178.7,265.6L178.4,263.7L178.3,261.7L178.5,259.9L179.2,258.3L180.5,256.6L182.1,255.6L183.9,255.1L187.8,255.3L194.6,257.7L200.9,261.8L208.9,269.6L210.5,271.1L210.9,271.5L212.3,272.4L215.8,274.8L216.3,275.1L218,275.4L228.6,273.7L244.4,275.2L245.5,275.3L247.9,274.8L274.7,269.4L279.1,268.4Z", "marks": "M178,262l4,-5l4,5m-4,-5l1,4M192,262l4,-5l4,5m-4,-5l1,4M185,275l4,-5l4,5m-4,-5l1,4M199,275l4,-5l4,5m-4,-5l1,4M255,275l4,-5l4,5m-4,-5l1,4M269,275l4,-5l4,5m-4,-5l1,4M283,275l4,-5l4,5m-4,-5l1,4M206,288l4,-5l4,5m-4,-5l1,4M220,288l4,-5l4,5m-4,-5l1,4M234,288l4,-5l4,5m-4,-5l1,4M248,288l4,-5l4,5m-4,-5l1,4M262,288l4,-5l4,5m-4,-5l1,4M276,288l4,-5l4,5m-4,-5l1,4M290,288l4,-5l4,5m-4,-5l1,4M304,288l4,-5l4,5m-4,-5l1,4M318,288l4,-5l4,5m-4,-5l1,4M332,288l4,-5l4,5m-4,-5l1,4M255,301l4,-5l4,5m-4,-5l1,4M269,301l4,-5l4,5m-4,-5l1,4M283,301l4,-5l4,5m-4,-5l1,4M297,301l4,-5l4,5m-4,-5l1,4M311,301l4,-5l4,5m-4,-5l1,4M325,301l4,-5l4,5m-4,-5l1,4M339,301l4,-5l4,5m-4,-5l1,4M353,301l4,-5l4,5m-4,-5l1,4M346,314l4,-5l4,5m-4,-5l1,4M360,314l4,-5l4,5m-4,-5l1,4M374,314l4,-5l4,5m-4,-5l1,4M388,314l4,-5l4,5m-4,-5l1,4M402,314l4,-5l4,5m-4,-5l1,4M430,314l4,-5l4,5m-4,-5l1,4M423,327l4,-5l4,5m-4,-5l1,4" }, { "kind": "mountain", "path": "M485,294.8L478.5,310.4L476.4,313.7L474.6,315.9L473.3,316.3L472.8,315.9L471.8,314.4L471.5,314.2L471.1,314L461.4,314.2L457.5,313.3L446.3,307.2L441.5,302.6L438.8,301.1L435.8,300.4L427.9,300.5L426.1,300L424.6,298.7L419.4,291.5L417.8,290.4L407.9,289.3L405.4,288.1L404.1,287.1L404,286.1L403.3,285.4L397.6,282.9L391.9,279L389.6,276.2L383.8,272.7L383,271.6L382.8,270.4L383.3,269L384.2,268.2L385.3,267.7L392.9,268.2L393.9,267.9L394.6,267.5L394.8,267L394.8,266.5L394.4,265.8L392.2,263.8L384.1,260.4L383,259.3L382.6,257.9L383,256L384.3,253.8L385.9,252L387.7,250.6L391.7,248.9L399.1,248L399.3,248.1L406.5,249.8L420.1,253.1L430.2,255.4L432.9,256.6L443.4,261.3L444.6,261.8L445.9,262.4L446.5,263.1L446.7,263.3L459.8,278L461.7,279.5L462.8,280.1L473.7,281.9L476.5,282.3L478.1,283.2L479.6,284.3L482.1,287.2L483.9,290.8L485,293Z", "marks": "M388,262l4,-5l4,5m-4,-5l1,4M402,262l4,-5l4,5m-4,-5l1,4M416,262l4,-5l4,5m-4,-5l1,4M430,262l4,-5l4,5m-4,-5l1,4M395,275l4,-5l4,5m-4,-5l1,4M409,275l4,-5l4,5m-4,-5l1,4M423,275l4,-5l4,5m-4,-5l1,4M437,275l4,-5l4,5m-4,-5l1,4M451,275l4,-5l4,5m-4,-5l1,4M402,288l4,-5l4,5m-4,-5l1,4M416,288l4,-5l4,5m-4,-5l1,4M430,288l4,-5l4,5m-4,-5l1,4M444,288l4,-5l4,5m-4,-5l1,4M458,288l4,-5l4,5m-4,-5l1,4M472,288l4,-5l4,5m-4,-5l1,4M423,301l4,-5l4,5m-4,-5l1,4M437,301l4,-5l4,5m-4,-5l1,4M451,301l4,-5l4,5m-4,-5l1,4M465,301l4,-5l4,5m-4,-5l1,4M479,301l4,-5l4,5m-4,-5l1,4M458,314l4,-5l4,5m-4,-5l1,4M472,314l4,-5l4,5m-4,-5l1,4" }, { "kind": "mountain", "path": "M672,381.8L671.8,382.5L658.4,401.1L657.6,401.6L656.8,402L656,402.1L655.1,402L654.2,401.6L653.4,400.8L652.8,399.9L651.5,396.3L651,395.5L650.3,394.8L649.2,394.3L646.4,393.4L645.7,393.1L645.2,392.6L644.7,392L644.3,391.2L644.1,390.2L644,389.7L643.9,389.6L643.8,389.4L643.1,388.9L642.4,388.7L637.5,388.5L635.1,387.7L627.8,387.9L624.5,387.2L622.2,387.5L621.5,387.5L619.6,386.8L617.8,385.6L616.1,384.1L614.9,382.4L614,380.4L612.7,371L612.8,369.8L613.1,368.8L613.6,367.9L614.3,367.2L615.4,366.6L618.8,365.9L621.7,365.7L622.4,365.9L622.9,366.1L627.2,369.5L629.1,370.5L630.9,370.8L643,369.9L649.8,370.5L661.8,374.7L670.3,379.3L671.1,379.9L671.6,380.5L671.9,381.1Z", "marks": "M619,379l4,-5l4,5m-4,-5l1,4M633,379l4,-5l4,5m-4,-5l1,4M647,379l4,-5l4,5m-4,-5l1,4M661,379l4,-5l4,5m-4,-5l1,4M654,392l4,-5l4,5m-4,-5l1,4" }, { "kind": "mountain", "path": "M627.5,505.6L624.2,506.6L616.5,512.1L614.8,512.8L610.1,513.1L608,512.8L605.8,511.9L602,509.2L600.1,508.3L599.1,508.1L598.1,508L597,508.2L594,506.9L582.6,505.4L582.2,505.2L581.6,504.7L581,504.2L580.1,502.9L579.6,501.4L579.3,499.9L579.2,497.1L579.1,496.7L579,496.4L578.6,495.9L578.2,495.6L575.5,494.9L575,494.6L574.1,493.7L573.6,492.6L573.5,491.4L573.7,490.2L574.1,488.9L575.3,486.7L577,484.6L577.2,484.3L577.4,483.9L577.7,481.6L578.6,478.8L578.7,478.2L578.6,477.8L582.5,474.4L583.9,473.7L585.2,473.4L602.9,472.3L604.4,472.6L605.8,473.2L608.4,475.4L608.9,475.7L610,476L631.2,477.6L634.8,478.5L637,479.5L638.3,480.4L639.4,481.5L639.9,482.2L640.2,482.9L640.4,483.6L640.5,484.5L640.4,485.1L640.1,485.6L639.8,485.9L637.5,487L636.6,487.9L635.9,489L634.9,494.6L634.4,496L633.6,497.2L631.1,499.7L630.5,500.7L628.9,504.3L628.5,504.8L628,505.2Z", "marks": "M577,483l4,-5l4,5m-4,-5l1,4M591,483l4,-5l4,5m-4,-5l1,4M605,483l4,-5l4,5m-4,-5l1,4M619,483l4,-5l4,5m-4,-5l1,4M633,483l4,-5l4,5m-4,-5l1,4M584,496l4,-5l4,5m-4,-5l1,4M598,496l4,-5l4,5m-4,-5l1,4M612,496l4,-5l4,5m-4,-5l1,4M626,496l4,-5l4,5m-4,-5l1,4M591,509l4,-5l4,5m-4,-5l1,4M605,509l4,-5l4,5m-4,-5l1,4M619,509l4,-5l4,5m-4,-5l1,4" }, { "kind": "mountain", "path": "M679.4,472.9L678.7,473.2L677.8,473.2L670.5,471L668.2,469.8L665.9,468L664.1,466.1L661.9,461.6L661.7,460.8L661.6,460.1L662.5,450.4L664.6,441.9L667,436L667.3,435.5L676.9,425.3L678,424.6L680.9,423.7L682.5,423.6L691.9,425.1L692.5,425.4L693.3,426.4L693.6,427.9L692.5,451L692.8,453L691.9,464.1L690.6,467.3L689.7,468.6L688.6,469.5Z", "marks": "M675,431l4,-5l4,5m-4,-5l1,4M689,431l4,-5l4,5m-4,-5l1,4M668,444l4,-5l4,5m-4,-5l1,4M682,444l4,-5l4,5m-4,-5l1,4M675,457l4,-5l4,5m-4,-5l1,4M668,470l4,-5l4,5m-4,-5l1,4M682,470l4,-5l4,5m-4,-5l1,4" }, { "kind": "mountain", "path": "M378.2,265.6L377,270.6L376.9,271.8L377,272.8L371.2,272.2L369.6,271.4L362.9,266.3L360.8,265.3L344.5,264.5L343.7,264.8L343.5,265.3L343.8,266L344.4,266.8L349.3,270.4L349.9,271.2L350.3,272.1L350.4,272.3L350.6,273.2L350.8,274.4L350.7,276.5L350.6,277.3L350.3,278.5L349.7,279.4L348.9,279.9L348,280.2L347,280.2L340.6,278.4L334.4,277.9L331.9,277.1L331.3,277L330.7,277.1L327.3,278.2L320.5,278.7L319.4,278.8L317,278.2L315.1,277.7L314.1,277.3L314.2,276.7L297.1,275.1L288.8,271.6L286.3,269.6L285,267.8L284.9,266.2L285.7,264.8L287.1,263.5L290.8,261.6L294.6,260.7L304.2,258.5L321.4,254.1L324.1,253.4L329.6,253.7L376.7,255.4L376.2,258.8L376.2,259.7L376.4,260.5L377.9,263.6L378.2,264.5Z", "marks": "M304,262l4,-5l4,5m-4,-5l1,4M318,262l4,-5l4,5m-4,-5l1,4M332,262l4,-5l4,5m-4,-5l1,4M346,262l4,-5l4,5m-4,-5l1,4M360,262l4,-5l4,5m-4,-5l1,4M297,275l4,-5l4,5m-4,-5l1,4M311,275l4,-5l4,5m-4,-5l1,4M325,275l4,-5l4,5m-4,-5l1,4M339,275l4,-5l4,5m-4,-5l1,4" }, { "kind": "plateau", "path": "M527.9,493.9L527.7,506.6L527.3,507.8L526.3,509.2L525,510.4L521.6,512.3L508.4,515.4L502.1,515.5L498.8,514.4L479.5,503.8L474.1,505.3L472.5,505.7L468.9,505.5L458.3,502.1L446.9,493.7L439.2,491.7L438.6,491.5L435.3,489.9L433.7,488.6L430.7,484.7L426.4,476L425.4,474.8L417.8,468.8L415.8,466.2L414.8,464.6L413.6,461.5L413.2,459L413.6,457L413.7,456.8L414.8,455L416.4,453.4L425.9,447.5L426.5,447.1L429.3,446.1L465.9,431.9L468.3,430L469.3,429.3L470.2,428.8L472.1,428.5L474.6,428.1L476.4,427.2L483.8,421.9L485.6,421.3L487.5,421.3L489,421.8L490.1,422.4L490.2,422.5L491.1,423.4L496,428.1L496.7,429.8L498.3,431.3L500.2,432.1L503,433.3L512.2,435.5L516.4,437.7L531.9,452.9L534.3,455.2L539.3,462.7L540.7,466.7L540.9,470.9L539.8,475.3L537.1,480L529.6,489.4L528.6,491.5Z", "marks": "" }, { "kind": "basin", "path": "M513.1,382.2L514.5,382.3L521.6,380.6L522.4,380.6L523.1,380.8L523.8,381.1L527.2,384L527.8,384.3L535.4,385.9L536.6,386.6L537.6,387.6L538.2,388.9L538,389.3L537.8,389.9L538.1,395L537,400.4L536.1,402.8L535.7,403.5L535.8,404.4L536.9,405.4L545.1,409.7L546.5,410.7L547.1,411.8L547,412.5L546.9,413L546.7,413.4L546.5,413.7L546.1,413.9L536.9,417.4L536.1,417.7L532.2,419.2L526,425.9L523.7,428.4L522.8,429L520.6,429.2L514.8,429.8L500.9,431.1L500,430.8L498.6,430L491.1,423.4L490.1,422.4L488.1,420.6L487.2,419.3L486.7,417.6L486.9,402.5L487.8,399.7L489.2,397.3L490.1,396.3L492.1,394.7L498.7,385.8L504.1,380.5L506.3,379.3L507.2,379L508.2,378.8L509,378.9L509.8,379.1L510.5,379.5L510.8,379.8L511.9,381.5L512.2,381.8L512.5,382Z", "marks": "" }, { "kind": "basin", "path": "M313,223.7L315.9,224.9L321.7,225.6L323.6,226.4L329.4,231.1L338.9,236.3L340.2,237.8L341.1,239.7L341.3,242.1L340.8,244.7L339.8,246.8L338.4,248.5L336.7,249.7L332.9,251.3L315,252.2L300.1,258.5L287.2,260.7L271.8,266.9L265.2,267.8L264.2,268.2L262.1,269.7L248.1,273.6L242.8,273.7L228.1,271L219.2,272.6L217.3,272.4L210.7,268.5L207.3,264.8L185.8,250.1L180.6,241.2L175.2,234.7L174.8,234L174.5,232.5L174.3,229.6L174.1,228.9L173.4,227.4L170.3,223.1L168.7,219.5L168.3,217.6L168.4,215.9L168.9,214.3L169.9,212.9L171.5,211.9L173.8,211.3L176.2,211.2L190.1,214.5L225.6,206.2L232.9,202.4L237.7,201.1L297.6,209L299.8,210.3L309.3,221Z", "marks": "" }, { "kind": "mountain", "path": "M621.8,320.6L614.3,323.1L613,323.2L612.2,322.8L611.8,322.1L611.7,321L612.3,312.2L610.5,301.6L608.8,296.9L608.3,294.7L608.3,293L609,288.8L608.9,287.7L608.7,286.8L606.6,282.7L606.3,281.7L605.9,279.5L606.1,277.5L606.5,275.7L609.5,268.9L610,267L610.2,265L607.9,236.5L606.6,232.4L606.5,231.6L606.6,230.9L606.9,230.1L607.3,229.5L607.8,229L609,228.4L611.4,227.9L611.9,227.6L614.2,225.3L614.8,225L615.5,224.7L617.2,224.6L620.6,225.6L622.2,226.4L623.7,227.7L624.4,228.5L624.9,229.4L625.3,230.4L625.9,232.7L626,234.4L625.7,237.5L624.2,243.2L623.8,245.8L624,248.1L625.6,254L625.6,254.3L625.5,254.4L625.2,254.6L625,254.8L625,255L625.2,256.2L625.2,256.8L624.5,259.2L624.4,259.9L624.7,262.4L624.6,263L623.7,266L623.4,268.1L624.9,282.4L626.3,296L626.8,300.2L627.6,308.2L627.4,309.8L627,311.3L623.4,318.9L622.6,319.9Z", "marks": "M612,236l4,-5l4,5m-4,-5l1,4M619,249l4,-5l4,5m-4,-5l1,4M612,262l4,-5l4,5m-4,-5l1,4M619,275l4,-5l4,5m-4,-5l1,4M612,288l4,-5l4,5m-4,-5l1,4M619,301l4,-5l4,5m-4,-5l1,4M612,314l4,-5l4,5m-4,-5l1,4" }, { "kind": "mountain", "path": "M611.8,333.1L617.7,342.1L618,343.2L617.8,343.8L617.1,344.3L616.8,344.9L616.9,345.5L617.2,346.2L621.2,351.7L629.3,359.4L629.7,360L629.9,360.7L630,361.3L629.9,361.9L627.6,365.6L627.3,365.9L626.9,366.1L626.5,366.1L626,365.9L610.4,352.1L607.9,350.9L607.2,350.7L605.8,350.9L605.9,351.8L606.2,352.7L607,354.2L607.2,354.9L607.1,355.6L606.7,356.2L605.7,356.8L604.7,357.1L603.8,357.3L603,357.2L598.9,355.8L599,356.5L599.2,357.1L600.2,358.7L600.4,359.3L600.5,360L600.4,360.7L600.3,361L599.1,362.5L599,362.7L598.8,363.3L598.7,364.5L598.6,364.8L598.5,365L597.4,366L595.9,366.4L585.4,364.2L581.6,365L574.6,367.8L572.7,368.2L561.4,367.7L560.2,367.3L556.7,365L543.8,359.4L521.6,361L517.8,360.5L516.1,359.7L514.7,358.6L513.2,356.6L512,354.2L511,351.6L510.5,349L510.4,348L510.5,347.2L510.7,346.5L511.2,345.2L513.8,341.8L515.2,340.5L516.7,339.6L519.9,338.6L526.1,338.3L533.7,339.8L540.1,339.9L546.5,342.5L564,342L588.2,333.7L591.6,333.6L600.2,334.9L602.1,334.6L605.7,332.7L608,331.5L609.3,331.3L609.5,331.4L610.5,331.8Z", "marks": "M584,340l4,-5l4,5m-4,-5l1,4M598,340l4,-5l4,5m-4,-5l1,4M521,353l4,-5l4,5m-4,-5l1,4M535,353l4,-5l4,5m-4,-5l1,4M549,353l4,-5l4,5m-4,-5l1,4M563,353l4,-5l4,5m-4,-5l1,4M577,353l4,-5l4,5m-4,-5l1,4M591,353l4,-5l4,5m-4,-5l1,4M605,353l4,-5l4,5m-4,-5l1,4M556,366l4,-5l4,5m-4,-5l1,4M570,366l4,-5l4,5m-4,-5l1,4M584,366l4,-5l4,5m-4,-5l1,4" }, { "kind": "plateau", "path": "M501,290.1L536.7,294.7L539.8,294.3L541.3,293.6L541.7,293.5L541.7,293.5L562.7,291.8L567,291.4L568,291.6L569.9,292.5L574.2,296.5L575.6,297.8L577.4,300.4L579.5,304.9L580.3,305.9L580.8,306.4L584.3,308.1L586.2,310L588,312.5L588.4,313.4L588.5,313.6L588.6,314.2L588.6,315.1L588.6,315.2L588.5,316L587.4,319.3L587.3,320.1L587.4,320.9L589,323.8L589.3,324.8L589.5,326.1L589.3,327.2L588.9,328.1L588.2,328.9L578.2,336.1L575.6,336.8L563.6,336.8L557.7,337.8L553.9,339.1L539.5,338.5L525.8,334.8L516.7,334.6L515.3,334.1L514.1,333.3L507.8,326.9L507,326.5L501.9,325.9L501.1,325.6L499.3,324.3L497.6,322.5L496.1,320.4L495.6,319.3L495,318.1L493.7,313.9L493.3,307.2L492.8,299.9L493.1,296.9L494,294.6L495.3,292.7L496.9,291.4L498.9,290.5Z", "marks": "" }, { "kind": "basin", "path": "M328.7,158.2L338.3,173L338.8,174.6L338.7,175.4L338.3,176.1L337.8,176.5L331.2,177.6L311,173.1L306.9,169.9L288,163.2L286.4,163.9L284.8,164.2L284.1,164.1L284,164.1L283.2,163.8L276.1,162L275,161.2L273.3,159.2L270.3,155.6L270.1,155L269.9,154.4L269.8,153.7L269.8,152.9L270.1,151.1L270.9,150.2L271.9,150L277.1,151.4L278.1,151.2L278.4,150.9L280.5,148.4L282.5,146.7L283.5,146.2L302.2,143.7L321.2,148.5L326.2,153.2L327.6,155.4Z", "marks": "" }, { "kind": "basin", "path": "M424.4,307L424.8,308.1L424.9,309.3L424.8,310.6L424.2,313.6L424.2,313.7L422.7,314.1L422.2,314.2L422.1,314.3L419.9,314.4L419.7,314.4L415.3,313.6L399.9,306.8L397.1,306.1L393.7,305.3L390.8,305.9L387.2,306.7L387.1,306.7L386.7,306.7L385.4,306.1L384.2,305.6L381.4,305L378.9,304.4L375.6,303.2L359.6,297.6L358.8,297.3L357.9,296.4L350,288.2L349.5,287.4L349,286.4L348.9,285.7L348.9,285.2L349,284.9L349.7,284L350.1,283.2L351,279.8L351.1,278.9L350.7,276.5L350.2,273.1L350.4,272.3L350.9,270.7L352.5,269.5L354.9,269L360.5,269.9L379.1,279.3L385.7,287.2L388.1,289.3L421.2,303.6L423,304.9L423.9,305.9Z", "marks": "" }], "rivers": ["M412.1,331.7L411.6,330.9L411,330.4L409.5,330M418.4,328.3L417.6,330.2L416.9,331L415.4,331.4", "M494.3,431.5L495.6,432.1L497.7,432.2L501,432L503.1,431.4L504.1,430.3L504.9,429.8L505.3,429.5L506.7,429.2L507.8,429.2L508.6,429.6L509.3,429.6L509.9,429.6L510.2,429.8L510.7,430.3L511.3,430.7L511.8,430.5L512.2,430L512.9,429.7L514.1,429.7L514.9,429.4L515.2,428.7L515.9,428.3L517,428L517.6,427.7L518,427.6L518.6,427.8L519.3,427.9L520.2,427.6L520.8,427.8L521.1,428.5L521.4,428.8L521.9,428.9L522.2,428.6L522.3,428.1L522.1,427.6L521.5,427.2L521.5,426.6L521.9,425.9L523,425.4L524.8,425L525.7,424.3L525.9,423.2L527.1,422L529.6,420.5L530.7,419.5L530.5,419L530.8,418.1L531.4,417L532,416.6L532.6,417L533.4,417.1L534.5,417L535.8,416L537.1,414.2L538.3,413.8L539.2,414.8L540.4,415.1L541.8,414.8L542.8,413.9L543.3,412.6L544.3,412L545.7,412.2L548.4,409.5L554.4,401L555.5,399.2L555.8,398.2L555.8,397.4L556.1,396.6L556.8,396L560.2,395.2L569.5,393.7L570.7,393.2L571.4,393.2L572,393.6L573.3,393.4L575.2,392.7L576.5,392.5L577.3,392.9L578.6,392.9L580.5,392.6L583,392.8L587.8,394.1L589.8,395L590.8,395.2L591.5,395L592.4,395.2L593.3,395.9L594.5,397.5L595.9,400L596.9,401.4L597.4,401.5L597.6,401.8L597.5,402.4L597.6,402.9L598,403.3L598.4,403.3L598.9,402.9L600.5,401.5L601.6,400.9L602.2,400.9L602.9,401.4L603.7,402.3L604.9,402.7L606.6,402.6L607.5,402.8L607.8,403.3L607.7,404.1L607.2,405.2L607.8,406L609.4,406.7L610,408.1L609.9,410.2L610.3,411L611.4,410.5L612.1,410L612.4,410.1L612.8,410.4L612.9,410.6L613.3,410.6L613.3,410.4L613.6,410L614.3,409.7L614.7,409.9L614.6,410.1L614.8,410.4L615.3,410.5L615.8,410.6L616.7,410.2L617.5,410.4L617.7,411.2L617.6,411.5L617.3,412.6L617.5,413.7L617.9,414L618.4,414L618.8,414.1L619,414.3L619.4,414.5L620,414.6L620.4,414.5", "M412.1,331.7L415.4,331.4M418.4,328.3L420.6,328.5L421.7,329.4L422.5,330.9L423.7,332L425.1,332.7L425.9,333.3L426,334.1L426,335.3L425.8,335.9L425.3,336.5L425.6,337.5L426.6,338.9L427.8,339.8L429,340.3L429.7,340.1L429.8,339.3L430.3,338.9L431,338.7L432.1,339L433.4,339.6L434,341.6L433.9,345L434.5,347.6L436,349.4L436.9,350.4L437.4,350.3L437.7,350L437.8,349.5L438.5,349.5L439.6,350L440.8,350.2L442.1,350L443.9,350.8L446.3,352.7L448,353.2L448.9,352.3L449.2,351.6L449.9,350.9L451.3,350.3L453.3,349.1L454.6,348.5L455.3,348.5L456.3,349.3L457.8,351L458.6,351.2L458.9,350L460.2,350.3L462.4,351.9L464.7,352.8L467,352.8L468.9,353.9L470.2,356.1L471.3,357.5L472.1,358L473.7,357.8L476.2,356.9L477.5,356.2L477.5,355.6L477.1,355L476.3,354.5L475.9,353.7L475.6,352.4L475.5,352.1L475.1,351.2L474.1,349.7L472.8,348.7L471.2,348.2L469.5,347.2L467.6,345.6L465.4,344.4L463.1,343.5L461.6,342.2L461.1,340.6L460.1,339.6L458.8,339.2L457.9,338.3L457.6,337L456.8,336.5L455.6,336.7L454.4,336.4L453.3,335.3L452.3,334.6L451.3,334.4L450.5,332.6L449.6,327.9L450.1,327.3L449.9,326.4L449.1,325L449.2,323.2L450.4,320.8L451.4,319.7L452.4,319.7L454.2,318.3L456.8,315.6L458.8,314.3L460.2,314.3L460.9,314.5L461.1,314.9L462.2,315.3L464.3,315.7L466.2,315.5L467.9,314.5L469.6,314.6L471.2,315.6L472.4,317L473.2,318.8L474.7,319.5L476.9,319.1L480.1,319.4L484.3,320.3L487.2,320.3L488.7,319.3L489,318.5L487.9,317.9L488.2,316.8L489.9,315.3L492.1,315L494.7,316L496.5,316.5L497.5,316.4L498,315.9L497.9,315.1L498.5,314L499.8,312.6L502,310.9L505,309.1L506.5,307.9L506.6,307.2L506.2,306.3L505.4,305.2L504.2,304.4L502.7,303.9L501.8,302.9L501.5,301.5L501.6,300.6L502.1,299.4L503.3,299L504.2,298.3L504.9,297.3L506.3,296.5L509.6,295.7L510.1,294.9L512,294.6L515.4,294.4L518.1,294L519.9,293.3L521.2,291.8L521.9,289.5L522.8,287.8L523.8,286.9L524.7,285.5L525.3,283.8L526.4,282.1L527.8,280.6L528.7,278.7L529,276.5L529.9,274.3L531.5,272.2L532.4,270.6L532.6,269.7L532.3,268L531.5,265.6L531.2,263.4L531.3,261.4L531.2,259.1L530.5,255.1L534.3,250.9L535.5,249.1L535.4,248.5L535.8,247.5L536.5,246.1L538.1,244.8L540.7,243.7L542.1,242.8L542.4,242.1L543.7,241.6L546.2,241.4L547.6,241.5L548,242L548.8,242.3L550,242.2L551,242.7L551.9,243.9L553.1,244.9L554.6,245.8L555.9,246.2L557.2,246L558.9,246.2L561,246.8L562.7,246.8L563.9,246.1L564.8,246L565.5,246.6L567.2,246.5L570.1,245.9L572.7,246.3L575.2,247.9L577.3,248.9L578.9,249.3L580.2,249.3L581.1,248.9L582.7,249.6L585,251.4L586.2,252.9L586.5,253.9L586.5,255.1L586.1,256.3L586.3,257.4L587,258.4L587,259.6L586.4,261L585.4,262L584.5,262.3L584,262.5L583.9,263L583.9,263.4L584.4,264.1L584.5,265L584,266.8L583.3,268.1L582.5,268.9L582.2,269.5L582.4,270.1L582.2,271.5L581.5,273.7L581.3,275.1L581.5,275.8L580.5,277.6L578.2,280.6L577.2,282.9L577.4,284.6L578.4,286.5L580.2,288.7L581,290.5L580.8,291.9L580.4,292.8L579.8,293.3L579.6,294.1L579.8,295.2L579.3,296.7L578,298.8L577.2,299.9L576.8,299.9L576.7,300.2L577,300.5L577.1,301.5L576.9,303L577,303.9L577.4,304.3L577.5,304.6L577.2,304.9L577.4,305.7L578.2,306.9L578.5,309L578.3,312L578.9,315.6L580.2,319.7L580.4,322.8L579.1,325.8L578,327.6L577.4,329.2L577.1,331.1L577,333.3L577.3,336.9L579.8,337.4L581.7,337.1L584,336.4L585.1,335.7L586.1,335L586.8,334.6L587.7,333.8L589.5,333.2L592.1,332.6L593.8,331.8L594.5,330.6L595.5,329.7L596.8,328.9L600.4,329.4L606.1,331.3L610,332L611.9,331.5L613.7,330.7L615.3,329.5L616.6,328.9L617.8,328.7L619.4,328.9L621.6,329.5L623.1,329.5L623.9,328.9L626.3,328.6L630.3,328.6L632.9,328.1L634.3,327.1L634.7,326.5M398.2,326L405.5,327.8L409.5,330", "M634.8,326.4L635,325.8L634.9,324.5L635.3,323.1L636.5,321.4L637.9,320.1L639.5,319.1L640.3,318.3L640.2,317.8L640.7,316.8L641.5,315.4L643.1,314.1L645.3,312.7L646.3,311.8L646.2,311.3L646.4,310.9L646.8,310.4L647.3,310.2L648,308.6L648.5,308L648.9,307.4L650.2,306.3L652.7,303.9L654.1,302.2L654.2,301.4L654.7,300.2L655.6,298.6L657.1,297.3L659,296.4L660.3,294.8L661.2,292.6L662.4,291.1L663.9,290.2L664.9,289.3L665.2,288.5L666.2,287.9L667.8,287.6L669.5,286.9L671.3,285.8L672.5,284.3L673,282.5L673.9,281.4L675.3,281L676.9,279.8L678.9,277.9L680.3,277.1L681.4,277.1", "M432.8,437.9L433,442.2L433.7,445.4L435,448.9L436.6,451.8L438.5,454.2L439.6,455.9L439.7,457.1L440.1,457.4L440.7,456.8L441.1,455.7L441.2,454L441.9,452.5L443.2,451.1L443.8,449.8L443.5,448.6L443.7,447.3L444.5,446L444.9,444.8L445,443.6L445.4,443L446.3,443L446.7,444.4L446.8,447L447.2,448.6L447.8,449.1L448.1,450.1L448.1,451.5L447.7,452.5L446.8,453L446.6,453.5L447,454L447,455.4L446.6,457.7L446.2,459L445.8,459.3L445.7,461L446,464L446,465.9L445.6,466.7L445.7,467.5L446,468.2L447.8,468.8L450.8,469.3L453.1,468.9L454.7,467.5L456.6,466.7L458.7,466.4L460.1,465.5L460.8,464L462.2,463.2L464.2,463.2L465.7,463.9L466.7,465.5L467,467L466.7,468.6L466.3,469.6L465.8,470.2L465.6,471.1L465.6,472.4L466.4,473L468,472.8L469.5,471.9L470.7,470.1L472.5,468.7L474.7,467.6L476,467.1L476.4,467.4L476.6,467.9L476.5,468.5L476.7,469L477.4,469.3L478.4,468.9L479.6,467.8L480.6,467.3L481.4,467.3L481.8,466.9L481.9,465.9L482.1,465.3L482.6,464.9L482.3,463.1L481.2,460.1L480.7,457.1L480.7,454.4L480.9,452.4L481.4,451.3L481.8,450.9L482.2,451.2L482.9,451.1L484.3,450.6L485.1,449.1L485.6,448.5L486.2,448.3L486.4,448L486.3,447.6L486.9,447L488,446L489,444.7L489.8,443.1L489.8,442L489,441.4L488.6,440.8L488.7,440.1L489.2,439.3L490.7,437.9L491.2,437.7L491.7,437.9L492.2,438.3L493,438.1L494.1,437.2L494.4,436L493.8,434.4L493.7,433.1L494.3,431.5M424.7,381.6L427.9,385.7L428.5,387.6L427.7,388.5L426.9,388.6L426.1,387.9L425.6,388.1L425.2,389.2L425.6,390.5L426.9,391.9L427.4,393.1L427.2,394L427.7,395L428.8,396.3L429.1,397.1L428.7,397.6L428.8,400.8L429.5,406.7L429.5,410.6L428.9,412.7L428.9,415.3L429.7,420L429.8,429.5L430.6,434L432.8,437.8", "M620.4,414.5L620.9,414.1L621.4,413.2L625.3,408.3L627.4,406.3L628.3,406.4L629.6,405.7L631.3,404.3L631.4,403.2L629.9,402.2L629.5,401.4L630.2,400.9L630.9,400.8L631.5,401.2L632.5,399.9L634.4,395.9L634.6,395.5L635.7,394.3L636.7,394.3L638,395L639.4,395.2L641,394.8L641.8,395.3L641.8,396.6L642.6,397.4L644.2,397.8L645.1,398.5L645.3,399.5L645.8,400.1L646.6,400.2L648,401.5L649.9,403.8L651.8,404.9L653.6,404.9L655.2,405.4L656.6,406.2L658.5,406.3L661,405.6L661.5,405.3M661.4,405.9L661.5,405.3M661.5,405.3L663,404.7L664.5,403.7L665.7,402.5L666.4,401.3L667.3,400.3L668.5,399.6L669.3,398.4L669.7,396.7L669.8,395.5L669.6,394.7L670.4,393.9L672.4,392.9L673.4,391.8L673.3,390.7L673.6,389.9L674.7,389.5L678.2,387.7L679.6,385.8L679.9,383.2L680.6,381.9L681.6,382.1L682.3,381.6L682.5,380.5L683.6,379.5L685.5,378.7L686.4,377.8L686.1,376.8L686.3,375.1L686.8,372.8L687.9,369.7L689.7,365.8L693,363.3L697.6,362.2L700.3,361.8L701.8,361.5L703.5,361.6L705,363.1L706.1,363.9L708,364.8"], "labels": [{ "name": "青藏高原", "kind": "land", "x": 289.13, "y": 349.33 }, { "name": "塔里木盆地", "kind": "land", "x": 243.75, "y": 229.15 }, { "name": "天山", "kind": "land", "x": 296.43, "y": 178.48 }, { "name": "东海", "kind": "sea", "x": 794.7, "y": 395.39 }, { "name": "南海", "kind": "sea", "x": 677.08, "y": 567.38 }], "anchors": { "wugong": { "x": 637.44, "y": 444.42 }, "tiger": { "x": 441.78, "y": 452.49 }, "aotai": { "x": 543.27, "y": 348.62 }, "maclehose": { "x": 647.78, "y": 523.72 }, "changping": { "x": 481.71, "y": 393.47 }, "mogan": { "x": 708.31, "y": 386.03 }, "westlake": { "x": 712.72, "y": 391.65 } } };

  // .build/typescript/runtime/map-labels.js
  var edge = 10;
  var gap = 6;
  var clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  var overlaps = (a, b) => a.x < b.x + b.width + gap && a.x + a.width + gap > b.x && a.y < b.y + b.height + gap && a.y + a.height + gap > b.y;
  function layoutMapLabels(layout) {
    const placements = /* @__PURE__ */ new Map();
    const occupied = [...layout.boxes];
    const labels = [...layout.labels].sort((a, b) => b.priority - a.priority || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
    for (const label2 of labels) {
      const vertical = label2.clearance + label2.height / 2 + gap;
      const horizontal = label2.clearance + label2.width / 2 + gap;
      const side = label2.preferredSide === "top" ? -1 : 1;
      const offsets = [];
      const remembered = layout.previous?.get(label2.id);
      if (remembered?.visible)
        offsets.push(remembered.offset);
      if (label2.preferredOffset)
        offsets.push(label2.preferredOffset);
      for (const direction of [side, -side]) {
        for (const shift of [0, -0.3, 0.3, -0.6, 0.6])
          offsets.push({ x: label2.width * shift, y: direction * vertical });
      }
      for (const direction of [-1, 1]) {
        for (const shift of [0, -0.35, 0.35])
          offsets.push({ x: direction * horizontal, y: label2.height * shift });
      }
      let placement = { x: label2.anchor.x, y: label2.anchor.y, visible: false, offset: { x: 0, y: 0 } };
      for (const offset of offsets) {
        const x = clamp(label2.anchor.x + offset.x, edge + label2.width / 2, layout.width - edge - label2.width / 2);
        const y = clamp(label2.anchor.y + offset.y, edge + label2.height / 2, layout.height - edge - label2.height / 2);
        const box = { x: x - label2.width / 2, y: y - label2.height / 2, width: label2.width, height: label2.height };
        if (box.x < edge || box.y < edge || box.x + box.width > layout.width - edge || box.y + box.height > layout.height - edge)
          continue;
        const anchorBox = { x: label2.anchor.x - label2.clearance, y: label2.anchor.y - label2.clearance, width: label2.clearance * 2, height: label2.clearance * 2 };
        if (overlaps(box, anchorBox) || occupied.some((other) => overlaps(box, other)))
          continue;
        placement = { x, y, visible: true, offset: { x: x - label2.anchor.x, y: y - label2.anchor.y } };
        break;
      }
      if (!placement.visible && label2.required) {
        let nearest = Infinity;
        const anchorBox = { x: label2.anchor.x - label2.clearance, y: label2.anchor.y - label2.clearance, width: label2.clearance * 2, height: label2.clearance * 2 };
        for (let y = edge + label2.height / 2; y <= layout.height - edge - label2.height / 2; y += 16) {
          for (let x = edge + label2.width / 2; x <= layout.width - edge - label2.width / 2; x += 16) {
            const distance3 = (x - label2.anchor.x) ** 2 + (y - label2.anchor.y) ** 2;
            if (distance3 >= nearest)
              continue;
            const box = { x: x - label2.width / 2, y: y - label2.height / 2, width: label2.width, height: label2.height };
            if (overlaps(box, anchorBox) || occupied.some((other) => overlaps(box, other)))
              continue;
            nearest = distance3;
            placement = { x, y, visible: true, offset: { x: x - label2.anchor.x, y: y - label2.anchor.y } };
          }
        }
      }
      if (placement.visible)
        occupied.push({ x: placement.x - label2.width / 2, y: placement.y - label2.height / 2, width: label2.width, height: label2.height });
      placements.set(label2.id, placement);
    }
    return placements;
  }

  // .build/typescript/journey/landmark-symbol.js
  var SYMBOLS = {
    temple: '<path d="M6 26V14h20v12M4 14l6-5h12l6 5M10 9l6-5 6 5M12 26v-7h8v7M4 26h24"/>',
    forest: '<path d="m9 5-6 10h4l-4 7h12l-4-7h4ZM9 22v6M23 20v8"/><path d="M23 7c-5-2-9 4-6 8-3 5 7 9 10 3 5-2 3-9-1-9Z"/>',
    snag: '<path d="m11 23 1-18m0 7L6 7m6 3 6-6M23 23l-1-13m1 7 5-5M5 26q5-3 10 0t13 0"/>',
    stream: '<path d="M14 4c16 6-16 12-4 24M22 4c16 6-16 12-4 24M4 16l3-3 3 3-4 2ZM23 24l3-3 3 3-4 2Z"/>',
    "dry-basin": '<path d="M3 12q5 2 8 8h10q3-6 8-8M3 17q4 1 7 7h12q3-6 7-7M11 28h11M14 17l-2-4m5 4 1-4"/>',
    redrock: '<path d="m4 24 4-10 9-2 5 10-4 5H7ZM17 12l5-6 6 3 1 10-7 3"/><path d="m9 16 6-1 3 6-8 2Zm14-6 3 1 1 5-5 1Z" fill="#ad7c67" stroke="none"/>',
    "alpine-meadow": '<path d="M3 17q8-11 15-6t11 3M3 25q8-9 15-5t11 2M9 15l-1-4m2 3 2-4M22 24l-1-4m2 3 2-4M15 27v-4"/>',
    village: '<path d="m3 15 7-7 8 7M6 14v13h10V14m-6 13v-7h3v7M18 12l5-5 6 6m-10 1v13h8V13M21 18h3"/>',
    gate: '<path d="M6 27V13m20 14V13M4 13h24M7 9h18M11 6h10M10 13v14m12-14v14M4 27h8m8 0h8M10 17h12"/>',
    switchbacks: '<path d="m3 22 11-17 8 8 7-4M5 27h16q9 0 2-5l-10-4q-5-2 2-5l7-2"/>',
    ridge: '<path d="m3 24 5-9 5 4 5-13 5 7 5-4M3 28l6-8 5 4 5-13 5 7 5-4"/>',
    summit: '<path d="M3 27 13 5 29 27ZM9 14l4 3 4-6M13 17l-1 10"/>',
    camp: '<path d="m4 27 12-21 12 21ZM11 27l5-12 5 12M13 6h6"/>',
    inn: '<path d="m4 13 12-8 12 8M7 12v15h18V12M10 27v-8h12v8m-12-4h12M13 19v4"/>',
    waterfall: '<path d="M3 10h8V5h16M11 10v12m6-14v16m6-16v14M5 26q5-4 10 0t13 0"/>',
    rapids: '<path d="m13 14 4-7 6 2 3 8-7 2ZM3 12l5 3-4 4 6 2m17-1 3 3-5 3M3 27l6-3 7 4 6-2"/>',
    beach: '<path d="M8 5c15 0 17 15 3 23M6 8c12 0 14 11 4 17M22 10q3-2 6 0m-5 6q3-2 5 0"/><circle cx="9" cy="14" r="1" fill="currentColor" stroke="none"/><circle cx="8" cy="20" r="1" fill="currentColor" stroke="none"/>',
    pass: '<path d="m3 20 6-13 4 9q3 5 6 0l4-9 6 13M9 7l-1 8m15-8 1 8M12 28l4-9 4 9"/>',
    pier: '<path d="M5 10h22M8 10v13m16-13v13M11 9V5m10 4V5M7 6h18M12 11v9h8v-9M4 27q6-4 12 0t12 0"/>',
    trailhead: '<path d="M16 5v23M5 8h18l5 5-5 5H5ZM9 13h11M10 28h12"/>',
    bamboo: '<path d="m10 29-1-25m9 25 2-26M7 10h4m-4 8h4m-3 7h4M18 8h4m-5 8h4m-4 8h4M9 18l-5-5m15-1 6-4m-7 15 7-4"/><path d="M4 14Q1 11 2 5q4 5 2 9ZM5 15Q0 15 2 10q3 2 3 5ZM24 9q0-6 6-7-2 6-6 7Zm0 1q5-3 7-1-3 4-7 1Zm0 10q0-5 6-7-1 6-6 7Zm0 1q5-2 6 2-4 1-6-2Z" fill="currentColor" stroke="none"/>',
    steps: '<path d="M5 27h7v-7h7v-7h7V6M5 21h6m2-7h5m2-7h5"/>',
    tea: '<path d="M16 21V9m0 8Q6 17 6 8q9 0 10 9Zm0-4Q20 4 27 6q-1 9-11 7ZM4 25q12-6 24 0M7 29q9-4 18 0"/>',
    "stone-sea": '<path d="m4 13 5-6 5 3-1 7-7 1ZM19 10l5-4 5 6-3 6-7-2ZM5 25l3-5 7 3-1 6-7-1Zm14 2 1-6 7 1 1 6Z"/>',
    lake: '<path d="M8 13c-7 4-3 14 7 14s16-7 11-12c-4-3-6 0-10-2s-6-2-8 0ZM11 19q5-3 10 0M8 11V5m0 3-3-2m18 6V6m0 3 3-3"/>',
    "stepping-stones": '<path d="M3 7q5-3 10 0t15 0M3 27q5-3 10 0t15 0M4 18l4-5 5 1 1 5-7 2ZM18 16l4-5 5 2 1 5-7 2Z"/>',
    viewpoint: '<path d="M3 13h11l-3 7 3 8M3 27l8-7M17 10h12M18 16q6-3 10 0M20 23q4-2 8 0"/><circle cx="23" cy="5" r="2"/>'
  };
  function landmarkSymbol(symbol) {
    return `<svg xmlns="http://www.w3.org/2000/svg" class="trail-landmark-symbol" viewBox="0 0 40 40" fill="none" color="#4b6854" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle class="trail-landmark-rim" cx="20" cy="20" r="18" fill="#fbf8e9" fill-opacity=".94" stroke="#a4ad8a" stroke-width="1.1"/><g transform="translate(4 4)" stroke-width="1.85">${SYMBOLS[symbol]}</g></svg>`;
  }

  // .build/typescript/runtime/route-map-picker.js
  var NS = "http://www.w3.org/2000/svg";
  var PLACEMENT = {
    wugong: { x: -55, y: 52 },
    tiger: { x: -102, y: 48 },
    aotai: { x: 0, y: -48 },
    maclehose: { x: 100, y: 52 },
    changping: { x: -95, y: -11 },
    mogan: { x: 86, y: -32 },
    westlake: { x: 86, y: 34 }
  };
  function createRouteMapPicker(options) {
    const { root, routes, onChoose } = options, doc = root.ownerDocument;
    const lifecycle = new AbortController(), { signal } = lifecycle;
    let selected = options.selected, disposed = false;
    function svg(tag) {
      return doc.createElementNS(NS, tag);
    }
    const frame = doc.createElement("div");
    frame.className = "atlas-frame";
    const map = svg("svg");
    map.classList.add("atlas-map");
    map.setAttribute("aria-hidden", "true");
    const definitions = svg("defs");
    definitions.innerHTML = '<linearGradient id="atlas-wash" x2=".75" y2="1"><stop stop-color="#e9e5ce"/><stop offset=".45" stop-color="#dce2c6"/><stop offset="1" stop-color="#b7cdb6"/></linearGradient><pattern id="atlas-grain" width="9" height="9" patternUnits="userSpaceOnUse"><circle cx="2" cy="3" r=".6" fill="#738165" opacity=".12"/><circle cx="7" cy="8" r=".5" fill="#fffceb" opacity=".6"/></pattern>';
    const clip = svg("clipPath");
    clip.id = "atlas-land-clip";
    const clipOutline = svg("path");
    clipOutline.setAttribute("d", ROUTE_MAP_GEOMETRY.landPath);
    clip.append(clipOutline);
    definitions.append(clip);
    map.append(definitions);
    const land = svg("g");
    land.classList.add("atlas-land");
    const shore = svg("path");
    shore.setAttribute("d", ROUTE_MAP_GEOMETRY.landPath);
    shore.classList.add("atlas-shore");
    const coast = svg("path");
    coast.setAttribute("d", ROUTE_MAP_GEOMETRY.landPath);
    coast.classList.add("atlas-coast");
    const outline2 = svg("path");
    outline2.setAttribute("d", ROUTE_MAP_GEOMETRY.landPath);
    outline2.classList.add("atlas-outline");
    const terrain = svg("g");
    terrain.setAttribute("clip-path", "url(#atlas-land-clip)");
    for (const region2 of ROUTE_MAP_GEOMETRY.relief) {
      const area = svg("path");
      area.setAttribute("d", region2.path);
      area.classList.add("atlas-relief", `atlas-relief-${region2.kind}`);
      terrain.append(area);
      if (region2.marks) {
        const marks = svg("path");
        marks.setAttribute("d", region2.marks);
        marks.classList.add("atlas-mountains");
        terrain.append(marks);
      }
    }
    for (const river of ROUTE_MAP_GEOMETRY.rivers) {
      const water2 = svg("path");
      water2.setAttribute("d", river);
      water2.classList.add("atlas-river");
      terrain.append(water2);
    }
    const grain = svg("path");
    grain.setAttribute("d", ROUTE_MAP_GEOMETRY.landPath);
    grain.setAttribute("fill", "url(#atlas-grain)");
    land.append(shore, coast, outline2, terrain, grain);
    for (const label2 of ROUTE_MAP_GEOMETRY.labels) {
      const text = svg("text");
      text.setAttribute("x", String(label2.x));
      text.setAttribute("y", String(label2.y));
      text.classList.add("atlas-geography", `atlas-geography-${label2.kind}`);
      text.textContent = label2.name;
      land.append(text);
    }
    map.append(land);
    frame.append(map);
    const compass = doc.createElement("span");
    compass.className = "atlas-compass";
    compass.setAttribute("aria-hidden", "true");
    compass.innerHTML = '<span>北</span><svg viewBox="0 0 32 40" fill="none"><path d="m16 4-8 28 8-6 8 6Z" stroke="currentColor"/><path d="M16 4v22l-8 6Z" fill="currentColor"/><path d="M3 21h26" stroke="currentColor" opacity=".35"/></svg>';
    frame.append(compass);
    const leaders = svg("g"), dots = svg("g");
    map.append(leaders, dots);
    const status = doc.createElement("p");
    status.className = "atlas-status";
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");
    const markers = [], ids = /* @__PURE__ */ new Set();
    for (const route of routes) {
      const chapter = chapterFor(route.id);
      if (ids.has(route.id) || !chapter)
        throw new Error("路线地图目录无法读取");
      ids.add(route.id);
      const label2 = chapter.atlas, button = doc.createElement("button");
      button.type = "button";
      button.id = `route-${route.id}`;
      button.className = "atlas-place";
      button.setAttribute("aria-label", `${route.name} · ${label2.region} · 查看旅程封面`);
      button.setAttribute("aria-controls", "journey-stage");
      button.dataset.route = route.id;
      const symbol = doc.createElement("span");
      symbol.className = "atlas-place-symbol";
      symbol.innerHTML = landmarkSymbol(label2.symbol);
      const words = doc.createElement("span");
      words.className = "atlas-place-words";
      const name = doc.createElement("strong");
      name.textContent = label2.name;
      const place2 = doc.createElement("small");
      place2.textContent = label2.region;
      words.append(name, place2);
      button.append(symbol, words);
      button.addEventListener("click", () => onChoose(route.id), { signal });
      frame.append(button);
      const line2 = svg("path");
      line2.classList.add("atlas-leader");
      leaders.append(line2);
      const dot = svg("circle");
      dot.classList.add("atlas-dot");
      dot.setAttribute("r", "3.5");
      dot.addEventListener("click", () => onChoose(route.id), { signal });
      dots.append(dot);
      const highlight = (active) => {
        line2.classList.toggle("is-hovered", active);
        dot.classList.toggle("is-hovered", active);
      };
      button.addEventListener("pointerenter", () => highlight(true), { signal });
      button.addEventListener("pointerleave", () => highlight(false), { signal });
      button.addEventListener("focus", () => highlight(true), { signal });
      button.addEventListener("blur", () => highlight(false), { signal });
      markers.push({ id: route.id, button, line: line2, dot });
    }
    if (ids.size !== CHAPTERS.length)
      throw new Error("路线地图缺少地点");
    root.replaceChildren(frame, status);
    function setSelected(id) {
      selected = id;
      for (const marker of markers) {
        const active = marker.id === id;
        marker.button.setAttribute("aria-pressed", String(active));
        marker.line.classList.toggle("is-selected", active);
        marker.dot.classList.toggle("is-selected", active);
      }
      const chapter = id ? chapterFor(id) : null;
      status.textContent = chapter ? `已选 ${chapter.atlas.name}，旅程封面已展开。` : "点一处山野，展开这趟旅程。";
    }
    function layout() {
      if (disposed)
        return;
      const width = frame.clientWidth;
      if (width <= 0)
        return;
      const narrow = width < 520, viewportHeight = doc.defaultView?.innerHeight ?? 900;
      let height = narrow ? Math.max(430, width + 20) : Math.max(440, Math.min(650, viewportHeight - 260, width * 0.66));
      frame.dataset.layout = narrow ? "narrow" : "wide";
      const [[left, top], [right, bottom]] = ROUTE_MAP_GEOMETRY.bounds;
      const landWidth = right - left, landHeight = bottom - top;
      const scale = Math.min((width - (narrow ? 100 : 150)) / landWidth, (height - (narrow ? 150 : 70)) / landHeight);
      const origin = { x: (narrow ? 20 : (width - landWidth * scale) / 2) - left * scale, y: (narrow ? 58 : 14) - top * scale };
      land.setAttribute("transform", `translate(${origin.x} ${origin.y}) scale(${scale})`);
      const anchors = (id) => ({ x: origin.x + ROUTE_MAP_GEOMETRY.anchors[id].x * scale, y: origin.y + ROUTE_MAP_GEOMETRY.anchors[id].y * scale });
      if (narrow)
        height = anchors("westlake").y + 234;
      frame.style.height = `${height}px`;
      map.setAttribute("viewBox", `0 0 ${width} ${height}`);
      const leftColumn = Math.min(100, Math.max(58, anchors("tiger").x - 60));
      const compactPositions = {
        aotai: { x: Math.min(width - 156, anchors("aotai").x), y: anchors("changping").y - 82 },
        changping: { x: leftColumn, y: anchors("changping").y - 22 },
        tiger: { x: leftColumn, y: anchors("tiger").y + 86 },
        mogan: { x: width - 58, y: anchors("mogan").y - 46 },
        westlake: { x: width - 58, y: anchors("westlake").y + 58 },
        wugong: { x: width - 58, y: anchors("westlake").y + 124 },
        maclehose: { x: width * 0.5, y: anchors("westlake").y + 190 }
      };
      const positions = layoutMapLabels({
        width,
        height,
        boxes: markers.map((marker) => {
          const p2 = anchors(marker.id), radius = narrow ? 3 : 8;
          return { x: p2.x - radius, y: p2.y - radius, width: radius * 2, height: radius * 2 };
        }),
        labels: markers.map((marker) => ({
          id: marker.id,
          anchor: anchors(marker.id),
          width: marker.button.offsetWidth,
          height: marker.button.offsetHeight,
          clearance: narrow ? 3 : 6,
          preferredOffset: narrow ? { x: compactPositions[marker.id].x - anchors(marker.id).x, y: compactPositions[marker.id].y - anchors(marker.id).y } : PLACEMENT[marker.id],
          preferredSide: ["tiger", "wugong", "westlake", "maclehose"].includes(marker.id) ? "bottom" : "top",
          priority: { aotai: 120, mogan: 110, westlake: 110, changping: 108, tiger: 107, wugong: 106, maclehose: 105 }[marker.id],
          required: true
        }))
      });
      for (const marker of markers) {
        const anchor = anchors(marker.id), desired = positions.get(marker.id) ?? anchor;
        const halfWidth = marker.button.offsetWidth / 2, halfHeight = marker.button.offsetHeight / 2;
        const center = { x: Math.max(halfWidth + 13, Math.min(width - halfWidth - 13, desired.x)), y: Math.max(halfHeight + 8, Math.min(height - halfHeight - 8, desired.y)) };
        marker.button.style.left = `${center.x}px`;
        marker.button.style.top = `${center.y}px`;
        const edge2 = { x: Math.max(center.x - halfWidth, Math.min(center.x + halfWidth, anchor.x)), y: Math.max(center.y - halfHeight, Math.min(center.y + halfHeight, anchor.y)) };
        marker.line.setAttribute("d", `M${anchor.x},${anchor.y}L${edge2.x},${edge2.y}`);
        marker.dot.setAttribute("cx", String(anchor.x));
        marker.dot.setAttribute("cy", String(anchor.y));
      }
    }
    const observer = new ResizeObserver(layout);
    observer.observe(frame);
    doc.defaultView?.addEventListener("resize", layout, { signal });
    setSelected(selected);
    layout();
    return { setSelected, destroy() {
      if (disposed)
        return;
      disposed = true;
      lifecycle.abort();
      observer.disconnect();
    } };
  }

  // .build/typescript/runtime/scene-manager.js
  function createSceneManager(options) {
    const sessions = [];
    let serial = 0;
    let background = false;
    function enter(name, returnStatus = options.status()) {
      const session = { id: ++serial, name, returnStatus };
      sessions.push(session);
      options.pause();
      return session;
    }
    function leave(session, resume = true) {
      if (!session)
        return;
      const index = sessions.indexOf(session);
      if (index < 0)
        return;
      const wasTop = index === sessions.length - 1;
      sessions.splice(index, 1);
      if (wasTop && sessions.length === 0 && resume && session.returnStatus === "walking" && !background && !options.hidden())
        options.resume();
    }
    return {
      enter,
      leave,
      get active() {
        return sessions.at(-1)?.name ?? "journey";
      },
      get background() {
        return background;
      },
      isTop(session) {
        return !!session && sessions.at(-1) === session;
      },
      canAnimate(hasMini) {
        if (background || options.hidden())
          return false;
        const active = sessions.at(-1)?.name;
        return active === "minigame" ? hasMini : !active && options.status() === "walking";
      },
      suspend() {
        background = true;
        for (const session of sessions)
          session.returnStatus = "paused";
        options.pause();
      },
      foreground() {
        background = false;
      },
      reset() {
        sessions.splice(0);
      }
    };
  }

  // .build/typescript/runtime/frame-loop.js
  function createFrameLoop(options) {
    let pending = null;
    let lastTime = null;
    let generation = 0;
    function stop() {
      generation++;
      if (pending !== null)
        options.cancel(pending);
      pending = null;
      lastTime = null;
    }
    function ensure() {
      if (!options.active()) {
        stop();
        return;
      }
      if (pending !== null)
        return;
      const version = generation;
      pending = options.request((time) => {
        if (version !== generation)
          return;
        pending = null;
        if (!options.active()) {
          stop();
          return;
        }
        const dt = lastTime === null ? 0 : Math.max(0, Math.min(options.maxDelta ?? 0.25, (time - lastTime) / 1e3));
        lastTime = time;
        options.update(dt);
        if (version === generation)
          ensure();
      });
    }
    return { ensure, stop };
  }

  // .build/typescript/runtime/map-viewport.js
  var canonical = () => ({ x: 0, y: 0, w: 720, h: 600 });
  var valid = (width, height) => Number.isFinite(width) && Number.isFinite(height) && width > 0 && height > 0;
  var clamp2 = (n, min, max) => Math.max(min, Math.min(max, n));
  function mapViewport(width, height, desktop) {
    if (!desktop || !valid(width, height))
      return canonical();
    const ratio = width / height, h = Math.max(600, height / 1.45), w = Math.max(720, h * ratio), fittedH = w / ratio;
    return { x: (720 - w) / 2, y: (600 - fittedH) / 2, w, h: fittedH };
  }
  function mapFollowViewport(width, height, full, point, desktop, photo = false) {
    if (!valid(width, height))
      return { ...full };
    const ratio = width / height, h = desktop ? Math.max(full.h / 1.14, height / 1.6) : Math.min(600, 470 / ratio), w = desktop ? h * ratio : 470;
    const minX = desktop ? full.x : 0, maxX = desktop ? full.x + full.w - w : 720 - w;
    const minY = (desktop ? full.y : 0) - (photo ? 80 : 0), maxY = (desktop ? full.y + full.h : 600) - h + (photo ? 400 : 0);
    return { x: clamp2(point.x - w / 2, minX, Math.max(minX, maxX)), y: clamp2(point.y - h * (photo ? 0.24 : 0.54), minY, Math.max(minY, maxY)), w, h };
  }
  function mapSymbols(width, height, view, full) {
    const scale = valid(width, height) ? (full ? Math.min : Math.max)(width / view.w, height / view.h) : 1;
    const safeScale = Math.max(1e-3, scale), frameHeight = valid(width, height) ? height : 600;
    const markerPixels = clamp2(frameHeight * 0.05, 36, 44), discoveryPixels = clamp2(frameHeight * 0.075, 48, 64), hikerPixels = clamp2(frameHeight * 0.08, 44, 68);
    return {
      scale: safeScale,
      offsetX: (width - view.w * safeScale) / 2 - view.x * safeScale,
      offsetY: (height - view.h * safeScale) / 2 - view.y * safeScale,
      marker: markerPixels / (42 * safeScale),
      discovery: discoveryPixels / (48 * safeScale),
      hiker: hikerPixels / (48 * safeScale),
      font: 12 / safeScale,
      markerPixels,
      discoveryPixels,
      hikerPixels
    };
  }
  function mapMarkerAnchor(point, width, height, view, full, insets = {}) {
    const metrics = mapSymbols(width, height, view, full), left = Math.min(width / 2, insets.left ?? 48), right = Math.max(left, width - (insets.right ?? 48));
    const top = Math.min(height / 2, insets.top ?? 94), bottom = Math.max(top, height - (insets.bottom ?? 72));
    return {
      x: (clamp2(point.x * metrics.scale + metrics.offsetX, left, right) - metrics.offsetX) / metrics.scale,
      y: (clamp2(point.y * metrics.scale + metrics.offsetY, top, bottom) - metrics.offsetY) / metrics.scale
    };
  }

  // .build/typescript/runtime/visual-route.js
  var clamp3 = (value, low, high) => Math.max(low, Math.min(high, value));
  var distance = (a, b) => Math.hypot(b.x - a.x, b.y - a.y);
  var mix = (a, b, t) => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
  var coordinate = (point) => `${point.x.toFixed(3)},${point.y.toFixed(3)}`;
  var command = (a, b, end) => `C${coordinate(a)} ${coordinate(b)} ${coordinate(end)}`;
  function sourceAt(source2, progress) {
    const first = source2[0], last = source2[source2.length - 1];
    if (progress <= first.progress)
      return { ...first, progress };
    if (progress >= last.progress)
      return { ...last, progress };
    let low = 1, high = source2.length - 1;
    while (low < high) {
      const middle = low + high >>> 1;
      if (source2[middle].progress < progress)
        low = middle + 1;
      else
        high = middle;
    }
    const a = source2[low - 1], b = source2[low], t = (progress - a.progress) / (b.progress - a.progress);
    return { ...mix(a, b, t), progress, elevation: a.elevation === null || b.elevation === null ? null : a.elevation + (b.elevation - a.elevation) * t };
  }
  function simplify(source2, anchors, tolerance) {
    const protectedProgress = /* @__PURE__ */ new Set([0, 1, ...anchors.map((value) => clamp3(value, 0, 1))]);
    const merged = new Map(source2.map((point) => [point.progress, point]));
    for (const progress of protectedProgress)
      merged.set(progress, sourceAt(source2, progress));
    const points = [...merged.values()].sort((a, b) => a.progress - b.progress);
    const protectedIndices = points.flatMap((point, index) => protectedProgress.has(point.progress) ? [index] : []);
    const keep = new Set(protectedIndices), stack = [];
    for (let i = 1; i < protectedIndices.length; i++)
      stack.push([protectedIndices[i - 1], protectedIndices[i]]);
    while (stack.length) {
      const range = stack.pop();
      if (!range)
        break;
      const [start, end] = range, a = points[start], b = points[end];
      const dx = b.x - a.x, dy = b.y - a.y, squaredLength = dx * dx + dy * dy;
      let greatest = tolerance * tolerance, furthest = -1;
      for (let i = start + 1; i < end; i++) {
        const point = points[i], t = squaredLength ? clamp3(((point.x - a.x) * dx + (point.y - a.y) * dy) / squaredLength, 0, 1) : 0;
        const squaredDistance = (point.x - a.x - t * dx) ** 2 + (point.y - a.y - t * dy) ** 2;
        if (squaredDistance > greatest) {
          greatest = squaredDistance;
          furthest = i;
        }
      }
      if (furthest >= 0) {
        keep.add(furthest);
        stack.push([start, furthest], [furthest, end]);
      }
    }
    return points.filter((_, index) => keep.has(index));
  }
  function tangent(points, index) {
    const point = points[index], before = points[Math.max(0, index - 1)], after = points[Math.min(points.length - 1, index + 1)];
    const incomingLength = distance(before, point), outgoingLength = distance(point, after);
    if (!incomingLength)
      return outgoingLength ? { x: (after.x - point.x) / outgoingLength, y: (after.y - point.y) / outgoingLength } : { x: 0, y: 0 };
    if (!outgoingLength)
      return { x: (point.x - before.x) / incomingLength, y: (point.y - before.y) / incomingLength };
    const slope = (axis) => {
      const incoming = (point[axis] - before[axis]) / incomingLength, outgoing = (after[axis] - point[axis]) / outgoingLength;
      return incoming * outgoing > 0 ? 2 * incoming * outgoing / (incoming + outgoing) : 0;
    };
    return { x: slope("x"), y: slope("y") };
  }
  function curveAt(segment, t) {
    const u = 1 - t;
    return {
      x: u ** 3 * segment.start.x + 3 * u * u * t * segment.controlA.x + 3 * u * t * t * segment.controlB.x + t ** 3 * segment.end.x,
      y: u ** 3 * segment.start.y + 3 * u * u * t * segment.controlA.y + 3 * u * t * t * segment.controlB.y + t ** 3 * segment.end.y
    };
  }
  function curveTangent(segment, t) {
    const u = 1 - t;
    const x = 3 * u * u * (segment.controlA.x - segment.start.x) + 6 * u * t * (segment.controlB.x - segment.controlA.x) + 3 * t * t * (segment.end.x - segment.controlB.x);
    const y = 3 * u * u * (segment.controlA.y - segment.start.y) + 6 * u * t * (segment.controlB.y - segment.controlA.y) + 3 * t * t * (segment.end.y - segment.controlB.y);
    const magnitude = Math.hypot(x, y);
    if (magnitude > 1e-8)
      return { x: x / magnitude, y: y / magnitude };
    const chord = distance(segment.start, segment.end);
    return chord ? { x: (segment.end.x - segment.start.x) / chord, y: (segment.end.y - segment.start.y) / chord } : { x: 1, y: 0 };
  }
  function tAtDistance(segment, value) {
    if (!segment.length)
      return 0;
    const target = clamp3(value, 0, segment.length);
    let low = 1, high = segment.arc.length - 1;
    while (low < high) {
      const middle = low + high >>> 1;
      if (segment.arc[middle].distance < target)
        low = middle + 1;
      else
        high = middle;
    }
    const a = segment.arc[low - 1], b = segment.arc[low], fraction = (target - a.distance) / (b.distance - a.distance || 1);
    return a.t + (b.t - a.t) * fraction;
  }
  function createVisualRoute(options) {
    const source2 = [];
    if (!options.points.length || options.points.length !== options.progress.length)
      throw new RangeError("A visual route needs matching points and progress.");
    for (const [index, point] of options.points.entries()) {
      const progress = options.progress[index], previous = source2[source2.length - 1];
      if (!Number.isFinite(point[0]) || !Number.isFinite(point[1]) || !Number.isFinite(progress) || progress < 0 || progress > 1 || previous && progress < previous.progress)
        throw new RangeError("Visual route coordinates and ordered progress must be finite.");
      const knot = { x: point[0], y: point[1], progress, elevation: typeof point[2] === "number" && Number.isFinite(point[2]) ? point[2] : null };
      if (previous?.progress === progress)
        source2[source2.length - 1] = knot;
      else
        source2.push(knot);
    }
    const anchors = (options.anchors ?? []).filter(Number.isFinite);
    const knots2 = simplify(source2, anchors, Math.max(0, options.tolerance ?? 8));
    const tangents = knots2.map((_, index) => tangent(knots2, index)), segments = [];
    const sampledPoints = [], sampledProgress = [];
    const first = knots2[0], move = `M${coordinate(first)}`, prefixes = [move];
    let length = 0;
    sampledPoints.push([first.x, first.y, sourceAt(source2, 0).elevation]);
    sampledProgress.push(0);
    for (let i = 1; i < knots2.length; i++) {
      const start = knots2[i - 1], end = knots2[i], span = distance(start, end), handle = Math.min(Math.max(0, options.cornerRadius ?? 12), span / 3);
      const control = (point, direction, sign) => {
        const scale = handle / Math.max(1, Math.hypot(direction.x, direction.y));
        return { x: clamp3(point.x + sign * direction.x * scale, Math.min(start.x, end.x), Math.max(start.x, end.x)), y: clamp3(point.y + sign * direction.y * scale, Math.min(start.y, end.y), Math.max(start.y, end.y)) };
      };
      const controlA = control(start, tangents[i - 1], 1), controlB = control(end, tangents[i], -1);
      const segment = { start, end, controlA, controlB, startDistance: length, length: 0, arc: [{ t: 0, distance: 0 }], command: command(controlA, controlB, end) };
      const steps2 = Math.max(6, Math.ceil(span / 3));
      let previous = start;
      for (let step = 1; step <= steps2; step++) {
        const t = step / steps2, point = curveAt(segment, t);
        segment.length += distance(previous, point);
        segment.arc.push({ t, distance: segment.length });
        previous = point;
      }
      for (const step of segment.arc.slice(1)) {
        const point = curveAt(segment, step.t), fraction = segment.length ? step.distance / segment.length : step.t;
        const progress = start.progress + (end.progress - start.progress) * fraction;
        sampledPoints.push([point.x, point.y, sourceAt(source2, progress).elevation]);
        sampledProgress.push(progress);
      }
      length += segment.length;
      segments.push(segment);
      prefixes.push(`${prefixes[prefixes.length - 1]} ${segment.command}`);
    }
    function atProgress(progress) {
      const value = clamp3(progress, 0, 1);
      let low = 0, high = segments.length - 1;
      while (low < high) {
        const middle = low + high >>> 1;
        if (segments[middle].end.progress < value)
          low = middle + 1;
        else
          high = middle;
      }
      const segment = segments[low], fraction = (value - segment.start.progress) / (segment.end.progress - segment.start.progress);
      const travelled = clamp3(fraction, 0, 1) * segment.length;
      return { index: low, segment, t: tAtDistance(segment, travelled), distance: segment.startDistance + travelled };
    }
    function atDistance(value) {
      const target = clamp3(value, 0, length);
      let low = 0, high = segments.length - 1;
      while (low < high) {
        const middle = low + high >>> 1, segment2 = segments[middle];
        if (segment2.startDistance + segment2.length < target)
          low = middle + 1;
        else
          high = middle;
      }
      const segment = segments[low];
      return curveAt(segment, tAtDistance(segment, target - segment.startDistance));
    }
    return {
      path: prefixes[prefixes.length - 1],
      length,
      points: sampledPoints,
      progress: sampledProgress,
      sample(progress) {
        const current = atProgress(progress), point = curveAt(current.segment, current.t), tangent2 = curveTangent(current.segment, current.t);
        return { ...point, elevation: sourceAt(source2, clamp3(progress, 0, 1)).elevation, heading: Math.atan2(tangent2.y, tangent2.x), tangentX: tangent2.x, tangentY: tangent2.y };
      },
      pathUntil(progress) {
        if (progress >= 1)
          return prefixes[prefixes.length - 1];
        if (progress <= 0)
          return move;
        const { index, segment, t } = atProgress(progress);
        const a = mix(segment.start, segment.controlA, t), b = mix(segment.controlA, segment.controlB, t), c = mix(segment.controlB, segment.end, t);
        const ab = mix(a, b, t), bc = mix(b, c, t);
        return `${prefixes[index]} ${command(a, ab, mix(ab, bc, t))}`;
      },
      heading(progress, lookAhead = 28) {
        const current = atProgress(progress), window = Math.max(1, lookAhead);
        const end = Math.min(length, current.distance + window), start = Math.max(0, Math.min(current.distance, length - window));
        const a = atDistance(start), b = atDistance(end);
        if (distance(a, b) > 0.01)
          return Math.atan2(b.y - a.y, b.x - a.x);
        const tangent2 = curveTangent(current.segment, current.t);
        return Math.atan2(tangent2.y, tangent2.x);
      }
    };
  }

  // .build/typescript/runtime/map-heading.js
  var horizontalDeadzone = 0.28;
  var angularDeadzone = 8 * Math.PI / 180;
  var turnDuration = 0.22;
  function createMapHeading() {
    let filteredAngle = 0;
    let facing = 1;
    let candidate = null;
    let candidateTime = 0;
    function clearCandidate() {
      candidate = null;
      candidateTime = 0;
    }
    function reset(angle) {
      filteredAngle = Number.isFinite(angle) ? Math.atan2(Math.sin(angle), Math.cos(angle)) : 0;
      facing = Math.cos(filteredAngle) < -horizontalDeadzone ? -1 : 1;
      clearCandidate();
      return facing;
    }
    function update(angle, dt, moving) {
      if (!moving) {
        clearCandidate();
        return facing;
      }
      if (!Number.isFinite(angle) || !Number.isFinite(dt) || dt <= 0)
        return facing;
      const step = Math.min(dt, 0.1);
      const difference = Math.atan2(Math.sin(angle - filteredAngle), Math.cos(angle - filteredAngle));
      if (Math.abs(difference) > angularDeadzone) {
        filteredAngle += difference * (1 - Math.exp(-step * 6));
        filteredAngle = Math.atan2(Math.sin(filteredAngle), Math.cos(filteredAngle));
      }
      const horizontal = Math.cos(filteredAngle);
      const next = horizontal > horizontalDeadzone ? 1 : horizontal < -horizontalDeadzone ? -1 : null;
      if (next === null || next === facing) {
        clearCandidate();
        return facing;
      }
      if (candidate !== next) {
        candidate = next;
        candidateTime = 0;
      }
      candidateTime += step;
      if (candidateTime >= turnDuration) {
        facing = next;
        clearCandidate();
      }
      return facing;
    }
    return { reset, update };
  }

  // .build/typescript/runtime/map-gait.js
  var cycleSeconds = 1.24;
  var frameEnds = [0.18, 0.32, 0.42, 0.5, 0.68, 0.82, 0.92, 1];
  function mapWalkFrame(clock) {
    const phase = (clock / cycleSeconds % 1 + 1) % 1;
    const frame = frameEnds.findIndex((end) => phase < end);
    return Math.max(0, frame);
  }
  function createMapGait() {
    let clock = 0, cadence = 0, moving = false, starting = false;
    return {
      reset() {
        clock = 0;
        cadence = 0;
        moving = false;
        starting = false;
      },
      update(dt, walking, pace) {
        if (!walking) {
          moving = false;
          cadence = 0;
          starting = false;
          return { clock, contact: false };
        }
        if (!moving) {
          clock = Math.ceil(clock / (cycleSeconds / 2)) * (cycleSeconds / 2);
          cadence = 0.45;
          moving = true;
          starting = true;
        }
        const step = Number.isFinite(dt) ? Math.max(0, Math.min(0.25, dt)) : 0;
        if (!step)
          return { clock, contact: false };
        const target = Number.isFinite(pace) ? Math.max(0.65, Math.min(1.4, pace)) : 1;
        cadence += (target - cadence) * (1 - Math.exp(-step * 8));
        const before = Math.floor(clock / (cycleSeconds / 2) + 1e-7);
        clock += step * cadence;
        const contact = starting || Math.floor(clock / (cycleSeconds / 2) + 1e-7) > before;
        starting = false;
        return { clock, contact };
      }
    };
  }

  // .build/typescript/runtime/map-walk-art.js
  var MAP_WALK_FILE = "characters/trailbound-walk-v2.webp";
  var MAP_WALK_WIDTH = 1774;
  var MAP_WALK_HEIGHT = 887;
  var MAP_WALK_SCALE = 54 / 429;
  var MAP_WALK_FRAMES = [
    [112, 9, 275, 435, 153, 434],
    [542, 11, 258, 433, 148, 432],
    [978, 11, 255, 436, 142, 436],
    [1399, 11, 264, 435, 151, 434],
    [124, 448, 286, 425, 161, 424],
    [546, 451, 260, 422, 159, 421],
    [984, 447, 243, 428, 136, 427],
    [1395, 449, 278, 426, 155, 425]
  ];

  // .build/typescript/runtime/wugong-rest-art.js
  var WUGONG_REST_FILE = "characters/wugong-rest-view-v1.webp";
  var WUGONG_REST_WIDTH = 1774;
  var WUGONG_REST_HEIGHT = 887;
  var WUGONG_REST_FRAMES = {
    sit: { "x": 166, "y": 170, "width": 694, "height": 652, "footX": 456, "footY": 642 },
    view: { "x": 1153, "y": 81, "width": 404, "height": 746, "footX": 255, "footY": 734 }
  };

  // .build/typescript/runtime/map-character.js
  var MAP_CHARACTER_FILE = "characters/trailbound-chibi-v1.webp";
  var stillFrames = [
    [0, 0, 362, 376, 217, 371, 349],
    [362, 0, 362, 376, 198, 370, 348],
    [724, 0, 362, 376, 192, 371, 344],
    [1086, 0, 362, 376, 184, 370, 347]
  ];
  function createMapCharacter(document2, cache, onChange) {
    function required(id) {
      const element = document2.getElementById(id);
      if (!element)
        throw new Error(`Missing map character placement: ${id}`);
      return element;
    }
    const crop = required("hiker-art-crop");
    const image = required("hiker-art-image");
    const status = required("hiker-art-status");
    const ns = "http://www.w3.org/2000/svg";
    function node2(tag, attrs4, parent) {
      const element = document2.createElementNS(ns, tag);
      for (const [name, value] of Object.entries(attrs4))
        element.setAttribute(name, value);
      parent.append(element);
      return element;
    }
    const defs = node2("defs", {}, crop);
    const bodyMask = node2("mask", { id: "hiker-kit-body", maskUnits: "userSpaceOnUse", x: "0", y: "0", width: "2000", height: "1200" }, defs);
    node2("rect", { x: "0", y: "0", width: "2000", height: "1200", fill: "white" }, bodyMask);
    const packHole = node2("path", { fill: "black" }, bodyMask), scarfHole = node2("path", { fill: "black" }, bodyMask);
    const packClip = node2("clipPath", { id: "hiker-pack-clip", clipPathUnits: "userSpaceOnUse" }, defs);
    const packShape = node2("path", {}, packClip);
    const scarfClip = node2("clipPath", { id: "hiker-scarf-clip", clipPathUnits: "userSpaceOnUse" }, defs);
    const scarfShape = node2("path", {}, scarfClip);
    const pack = node2("g", { display: "none" }, crop), scarf = node2("g", { display: "none" }, crop);
    const packImage = node2("image", { x: "0", y: "0", "clip-path": "url(#hiker-pack-clip)" }, pack);
    const scarfImage = node2("image", { x: "0", y: "0", "clip-path": "url(#hiker-scarf-clip)" }, scarf);
    let stillAsset = "loading", walkAsset = "loading";
    let restAsset = "loading";
    let disposed = false, previousFrame = "", previousFile = "";
    let latest = { clock: 0, walking: false, reduced: false, action: "walk" };
    function paint(pose) {
      if (disposed)
        return;
      latest = pose;
      const animate = pose.walking && !pose.reduced && walkAsset === "ready";
      const useRest = pose.action === "rest" && restAsset === "ready";
      const fallbackWalk = stillAsset !== "ready" && walkAsset === "ready";
      const useWalk = animate || fallbackWalk;
      const ready = useRest || useWalk || stillAsset === "ready";
      crop.setAttribute("visibility", ready ? "visible" : "hidden");
      const unavailable = pose.walking && !pose.reduced && walkAsset === "failed";
      status.setAttribute("visibility", ready && !unavailable ? "hidden" : "visible");
      status.setAttribute("y", ready ? "31" : "-8");
      status.textContent = unavailable ? "步行画作暂未加载" : stillAsset === "failed" && walkAsset === "failed" ? "人物暂未加载" : "人物载入中…";
      if (!ready)
        return;
      const index = useWalk ? animate ? mapWalkFrame(pose.clock) : 0 : pose.action === "photo" ? 2 : pose.action === "finish" || pose.action === "ready" ? 0 : 1;
      const file = useRest ? WUGONG_REST_FILE : useWalk ? MAP_WALK_FILE : MAP_CHARACTER_FILE;
      const rest = WUGONG_REST_FRAMES.sit;
      const [x, y, width, height, footX, footY] = useRest ? [rest.x, rest.y, rest.width, rest.height, rest.footX, rest.footY] : useWalk ? MAP_WALK_FRAMES[index] : stillFrames[index];
      const kit = !!pose.kitMotion && animate;
      const fx = x + footX, fy = y + footY;
      if (kit) {
        pack.setAttribute("transform", `rotate(${(Math.sin(pose.clock * 4.2 - 0.5) * 0.65).toFixed(3)} ${fx - 93} ${fy - 188})`);
        scarf.setAttribute("transform", `rotate(${(Math.sin(pose.clock * 5.1) * 1.8).toFixed(3)} ${fx - 65} ${fy - 263})`);
      }
      const key = `${file}:${index}:${kit}`;
      if (previousFrame === key)
        return;
      previousFrame = key;
      if (previousFile !== file) {
        previousFile = file;
        for (const art of [image, packImage, scarfImage]) {
          art.setAttribute("href", file);
          art.setAttribute("width", String(useRest ? WUGONG_REST_WIDTH : useWalk ? MAP_WALK_WIDTH : 1448));
          art.setAttribute("height", String(useRest ? WUGONG_REST_HEIGHT : useWalk ? MAP_WALK_HEIGHT : 1086));
        }
      }
      if (kit) {
        const packPath = `M${fx - 112} ${fy - 260}Q${fx - 148} ${fy - 242} ${fx - 151} ${fy - 176}Q${fx - 157} ${fy - 112} ${fx - 89} ${fy - 109}L${fx - 45} ${fy - 145}L${fx - 61} ${fy - 235}Z`;
        const scarfPath = `M${fx - 65} ${fy - 278}Q${fx - 122} ${fy - 280} ${fx - 149} ${fy - 247}L${fx - 111} ${fy - 249}L${fx - 122} ${fy - 236}L${fx - 62} ${fy - 260}Z`;
        packHole.setAttribute("d", packPath);
        packShape.setAttribute("d", packPath);
        scarfHole.setAttribute("d", scarfPath);
        scarfShape.setAttribute("d", scarfPath);
        image.setAttribute("mask", "url(#hiker-kit-body)");
      } else
        image.removeAttribute("mask");
      pack.setAttribute("display", kit ? "" : "none");
      scarf.setAttribute("display", kit ? "" : "none");
      const scale = useRest ? 54 / rest.height : useWalk ? MAP_WALK_SCALE : 54 / stillFrames[index][6];
      crop.setAttribute("viewBox", `${x} ${y} ${width} ${height}`);
      crop.setAttribute("x", String(-footX * scale));
      crop.setAttribute("y", String(17.2 - footY * scale));
      crop.setAttribute("width", String(width * scale));
      crop.setAttribute("height", String(height * scale));
    }
    function reveal(kind, ok) {
      if (disposed)
        return;
      if (kind === "still")
        stillAsset = ok ? "ready" : "failed";
      else if (kind === "walk")
        walkAsset = ok ? "ready" : "failed";
      else
        restAsset = ok ? "ready" : "failed";
      paint(latest);
      onChange();
    }
    const loaders = [];
    function load(kind, file, width, height) {
      const entry = cache?.request(file, "high");
      if (entry)
        entry.promise.then((asset) => reveal(kind, asset.state === "ready" && asset.image.naturalWidth === width && asset.image.naturalHeight === height), () => reveal(kind, false));
      else {
        const loader = document2.createElement("img");
        loader.decoding = "async";
        loader.onload = () => reveal(kind, loader.naturalWidth === width && loader.naturalHeight === height);
        loader.onerror = () => reveal(kind, false);
        loader.src = file;
        loaders.push(loader);
      }
    }
    load("still", MAP_CHARACTER_FILE, 1448, 1086);
    load("walk", MAP_WALK_FILE, MAP_WALK_WIDTH, MAP_WALK_HEIGHT);
    load("rest", WUGONG_REST_FILE, WUGONG_REST_WIDTH, WUGONG_REST_HEIGHT);
    return { paint, destroy() {
      disposed = true;
      defs.remove();
      pack.remove();
      scarf.remove();
      image.removeAttribute("mask");
      for (const loader of loaders) {
        loader.onload = null;
        loader.onerror = null;
      }
    } };
  }

  // .build/typescript/runtime/procedural-map-character.js
  var cycleSeconds2 = 1.24;
  var tau = Math.PI * 2;
  var number = (value) => value.toFixed(3);
  function createProceduralMapCharacter(document2) {
    const facing = document2.getElementById("hiker-facing");
    if (!facing)
      throw new Error("Missing map character placement: hiker-facing");
    const hiddenArt = ["hiker-art-crop", "hiker-art-status"].flatMap((id) => {
      const element = document2.getElementById(id);
      if (!element)
        return [];
      const visibility = element.getAttribute("visibility");
      element.setAttribute("visibility", "hidden");
      return [{ element, visibility }];
    });
    function node2(tag, attrs4, parent) {
      const element = document2.createElementNS("http://www.w3.org/2000/svg", tag);
      for (const [name, value] of Object.entries(attrs4))
        element.setAttribute(name, value);
      parent.append(element);
      return element;
    }
    const details = [];
    function detailGroup(parent) {
      const group = node2("g", { visibility: "hidden", "pointer-events": "none" }, parent);
      details.push(group);
      return group;
    }
    const figure = node2("g", { id: "procedural-map-hiker", transform: "translate(0 -3.096) scale(1.18)", "stroke-linecap": "round", "stroke-linejoin": "round" }, facing);
    const legBack = node2("path", { fill: "none", stroke: "#969176", "stroke-width": "3.5" }, figure);
    const shoeBack = node2("path", { fill: "none", stroke: "#685b48", "stroke-width": "2" }, figure);
    const torso = node2("g", {}, figure);
    const pack = node2("g", {}, torso);
    node2("path", { d: "M-13-13Q-14-18-8-18Q-3-18-2-13L-2 2Q-6 6-13 3Z", fill: "#879267", stroke: "#657452", "stroke-width": ".75" }, pack);
    node2("path", { d: "M-12-7Q-8-9-4-7V0Q-8 2-12 0Z", fill: "#a1a879", stroke: "#71805a", "stroke-width": ".55" }, pack);
    node2("path", { d: "M-11-14H-4M-10-18Q-7-21-4-17M-10-5H-6", fill: "none", stroke: "#c7cba1", "stroke-width": ".8" }, pack);
    node2("rect", { x: "-16", y: "-4", width: "4", height: "8", rx: "1.5", fill: "#8ea7a2", stroke: "#657f7b", "stroke-width": ".5" }, pack);
    node2("path", { d: "M-15-4V-6H-13V-4", fill: "#647b70" }, pack);
    const packDetail = detailGroup(pack);
    node2("path", { d: "M-12-13Q-11-16-8-16H-4M-11-5V-1M-5-5V-1", fill: "none", stroke: "#c5cca1", "stroke-width": ".5" }, packDetail);
    node2("path", { d: "M-11-15V-10H-9V-15M-5-15V-10H-3V-14", fill: "none", stroke: "#6d7654", "stroke-width": ".65" }, packDetail);
    node2("rect", { x: "-10.8", y: "-10.2", width: "2", height: "1.6", rx: ".3", fill: "#d8cf9b", stroke: "#74805a", "stroke-width": ".3" }, packDetail);
    node2("path", { d: "M-13 2L-4 3.1Q-1 5-3 6.5L-13 5.2Z", fill: "#c1b48e", stroke: "#887e5e", "stroke-width": ".6" }, packDetail);
    node2("ellipse", { cx: "-3.3", cy: "4.7", rx: "1.6", ry: "1.8", fill: "#ded0a8", stroke: "#928664", "stroke-width": ".45" }, packDetail);
    node2("path", { d: "M-3.5 3.5Q-2 4-2.9 5.2Q-3.8 5.9-4 4.7M-10 2.4L-10 5.5M-6 2.8L-6 5.9M-14.7-3V1", fill: "none", stroke: "#8b835f", "stroke-width": ".4" }, packDetail);
    const armBack = node2("path", { fill: "none", stroke: "#6c8188", "stroke-width": "3" }, torso);
    const handBack = node2("circle", { r: "1.5", fill: "#dec19c" }, torso);
    node2("path", { d: "M-4-13Q0-15 4-12L7 3Q1 5-5 3Z", fill: "#829aa0", stroke: "#5d7a81", "stroke-width": ".7" }, torso);
    node2("path", { d: "M-3-12Q0-9 3-12M1-10V2M3-4H5V-1H3", fill: "none", stroke: "#b3c3bf", "stroke-width": ".65" }, torso);
    node2("path", { d: "M-4-12Q-2-7-3 1", fill: "none", stroke: "#697455", "stroke-width": "1.3" }, torso);
    const coatDetail = detailGroup(torso);
    node2("path", { d: "M-2-11Q0-10 2-11M-2-3H0V0H-2ZM2-9L4-5M-3 2Q1 3 5 2", fill: "none", stroke: "#c1cfca", "stroke-width": ".45" }, coatDetail);
    node2("path", { d: "M-3-8H4", fill: "none", stroke: "#596f67", "stroke-width": ".9" }, coatDetail);
    node2("rect", { x: "-.2", y: "-8.7", width: "1.8", height: "1.4", rx: ".3", fill: "#c8c49b", stroke: "#68745a", "stroke-width": ".3" }, coatDetail);
    const scarf = node2("g", {}, torso);
    node2("path", { d: "M-4-16Q-10-18-17-12L-16-9Q-9-13-1-14Z", fill: "#aa6658", stroke: "#88574e", "stroke-width": ".5" }, scarf);
    node2("path", { d: "M-5-15Q0-17 5-15L4-12Q0-13-4-12Z", fill: "#b67662", stroke: "#955f50", "stroke-width": ".5" }, torso);
    node2("path", { d: "M-5-24Q-4-29 2-27Q7-26 6-22L8-20L6-19Q6-15 1-15L-3-17Q-6-19-5-24Z", fill: "#e3c39f", stroke: "#aa9274", "stroke-width": ".55" }, torso);
    node2("path", { d: "M-5-23Q-1-21-3-18L-5-19Z", fill: "#776857" }, torso);
    node2("path", { d: "M3-17Q5-16 6-18", fill: "none", stroke: "#af816c", "stroke-width": ".45" }, torso);
    node2("path", { d: "M-7-23Q-7-30 1-29Q8-28 8-23Z", fill: "#c4b88c", stroke: "#968c67", "stroke-width": ".65" }, torso);
    node2("path", { d: "M-6-23Q1-24 7-23L7-21Q0-20-6-22Z", fill: "#88916c" }, torso);
    node2("path", { d: "M-9-22Q1-19 11-21Q8-23 5-23", fill: "#d5c79b", stroke: "#978e6c", "stroke-width": ".65" }, torso);
    node2("circle", { cx: "3.8", cy: "-20", r: ".65", fill: "#51594a" }, torso);
    const headDetail = detailGroup(torso);
    node2("path", { d: "M-4-27Q0-29 4-26M-6-22.2Q1-21 7-21.8M-7-21Q0-18.9 9-20.5", fill: "none", stroke: "#e6dab3", "stroke-width": ".45" }, headDetail);
    node2("path", { d: "M-2-27L-3-24M3-26L4-23M-3.8-19Q-2-20-2-18M2.9-21.4L4.4-21.4", fill: "none", stroke: "#8f8062", "stroke-width": ".35" }, headDetail);
    node2("path", { d: "M-3-16L-1-15M-3-15L-1-14", fill: "none", stroke: "#d5a38b", "stroke-width": ".4" }, headDetail);
    const armFront = node2("path", { fill: "none", stroke: "#90a6a9", "stroke-width": "3.3" }, torso);
    const handFront = node2("circle", { r: "1.6", fill: "#e3c39f" }, torso);
    const camera = node2("g", { visibility: "hidden" }, torso);
    node2("rect", { x: "6", y: "-20", width: "10", height: "6", rx: "1.4", fill: "#506a66", stroke: "#d5d8ba", "stroke-width": ".6" }, camera);
    node2("circle", { cx: "11.5", cy: "-17", r: "2", fill: "#acc5bf", stroke: "#375450", "stroke-width": ".8" }, camera);
    const legFront = node2("path", { fill: "none", stroke: "#aca587", "stroke-width": "3.8" }, figure);
    const shoeFront = node2("path", { fill: "none", stroke: "#584c3d", "stroke-width": "2" }, figure);
    const bootBackDetail = detailGroup(figure);
    const bootFrontDetail = detailGroup(figure);
    for (const boot of [bootBackDetail, bootFrontDetail]) {
      node2("path", { d: "M-1 1.05H2.7M-.6-.9L.2-.4M.3-.9L1-.4", fill: "none", stroke: "#c0ad84", "stroke-width": ".4" }, boot);
      node2("path", { d: "M-1.1 1.5H2.8", fill: "none", stroke: "#4e493a", "stroke-width": ".35" }, boot);
    }
    let disposed = false;
    let detailed = false;
    function leg(path, shoe, boot, phase, offset, bob, moving) {
      const t = (phase + offset) % 1;
      const swing = Math.max(0, (t - 0.62) / 0.38);
      const x = moving ? t < 0.62 ? 3.9 - t / 0.62 * 7.8 : -3.9 + swing * 7.8 : offset ? 2.5 : -2.5;
      const y = 16.1 - (moving ? Math.sin(swing * Math.PI) * 3.1 : 0);
      const hipX = offset ? 1 : -1, hipY = 3.1 - bob;
      const dx = x - hipX, dy = y - hipY, length = Math.hypot(dx, dy);
      const along = length / 2;
      const bend = Math.sqrt(Math.max(0, 7.4 * 7.4 - along * along));
      const kneeX = hipX + dx / 2 + dy / length * bend;
      const kneeY = hipY + dy / 2 - dx / length * bend;
      path.setAttribute("d", `M${number(hipX)} ${number(hipY)}L${number(kneeX)} ${number(kneeY)}L${number(x)} ${number(y)}`);
      shoe.setAttribute("d", `M${number(x - 1)} ${number(y + 0.1)}L${number(x + 2.6)} ${number(y + 0.1)}`);
      boot.setAttribute("transform", `translate(${number(x)} ${number(y)})`);
    }
    function arm(path, hand, shoulderX, elbowX, elbowY, handX, handY) {
      path.setAttribute("d", `M${shoulderX}-8Q${number(elbowX)} ${number(elbowY)} ${number(handX)} ${number(handY)}`);
      hand.setAttribute("cx", number(handX));
      hand.setAttribute("cy", number(handY));
    }
    function paint(pose) {
      if (disposed)
        return;
      if (detailed !== !!pose.detailed) {
        detailed = !!pose.detailed;
        for (const detail of details)
          detail.setAttribute("visibility", detailed ? "visible" : "hidden");
        figure.setAttribute("data-detail", detailed ? "wugong" : "standard");
      }
      const moving = pose.walking && !pose.reduced;
      const phase = (pose.clock / cycleSeconds2 % 1 + 1) % 1;
      const swing = moving ? Math.sin(phase * tau) : 0;
      const bob = moving ? 0.3 * (1 - Math.cos(phase * tau * 2)) : 0;
      leg(legBack, shoeBack, bootBackDetail, phase, 0.5, bob, moving);
      leg(legFront, shoeFront, bootFrontDetail, phase, 0, bob, moving);
      torso.setAttribute("transform", `translate(0 ${number(-bob)})`);
      pack.setAttribute("transform", `rotate(${number(swing * 0.8)} -7 -12)`);
      scarf.setAttribute("transform", `rotate(${number(moving ? Math.sin(phase * tau - 0.4) * 3 : 0)} -2 -15)`);
      camera.setAttribute("visibility", pose.action === "photo" ? "visible" : "hidden");
      arm(armBack, handBack, -4, -7 + swing, -3, -6 + swing * 2, 2);
      arm(armFront, handFront, 4, 7 - swing, -3, 6 - swing * 2, 2);
      if (pose.action === "photo") {
        arm(armFront, handFront, 4, 10, -10, 11, -16);
        arm(armBack, handBack, -4, 0, -13, 7, -16);
      } else if (pose.action === "look" || pose.action === "discover") {
        arm(armFront, handFront, 4, 10, -13, 7, -22);
      } else if (pose.action === "shelter") {
        arm(armFront, handFront, 4, 9, -5, 3, -13);
        arm(armBack, handBack, -4, -7, -3, 0, -11);
      } else if (pose.action === "finish") {
        arm(armFront, handFront, 4, 11, -14, 12, -22);
      }
    }
    paint({ clock: 0, walking: false, reduced: false, action: "ready" });
    return {
      paint,
      destroy() {
        if (disposed)
          return;
        disposed = true;
        figure.remove();
        for (const { element, visibility } of hiddenArt) {
          if (visibility === null)
            element.removeAttribute("visibility");
          else
            element.setAttribute("visibility", visibility);
        }
      }
    };
  }

  // .build/typescript/runtime/wugong-overview.js
  var knots = [
    { progress: 0, x: 118, y: 462 },
    { progress: 0.08, x: 180, y: 434 },
    { progress: 0.16, x: 174, y: 377 },
    { progress: 0.25, x: 285, y: 335 },
    { progress: 0.38, x: 358, y: 350 },
    { progress: 0.5, x: 434, y: 278 },
    { progress: 0.64, x: 502, y: 280 },
    { progress: 0.78, x: 557, y: 224 },
    { progress: 0.88, x: 542, y: 175 },
    { progress: 1, x: 598, y: 126 }
  ];
  function createWugongOverviewRoute(bounds = { x: 0, y: 0, w: 720, h: 600 }) {
    const points = knots.map((knot) => [
      bounds.x + bounds.w * knot.x / 720,
      bounds.y + bounds.h * knot.y / 600
    ]);
    return createVisualRoute({
      points,
      progress: knots.map((knot) => knot.progress),
      anchors: [0, 0.25, 0.5, 1],
      tolerance: 0,
      cornerRadius: 26
    });
  }
  var WUGONG_WAYPOINTS = [
    { kind: "start", name: "中庵 · 起点", fraction: 0, stateId: "wugong-start", checkpointId: null },
    { kind: "meadow", name: "山脊草甸", fraction: 0.25, stateId: "wugong-meadow", checkpointId: "wugong-meadow" },
    { kind: "clouds", name: "云海观景", fraction: 0.5, stateId: "wugong-clouds", checkpointId: "wugong-clouds" },
    { kind: "end", name: "金顶 · 终点", fraction: 1, stateId: "wugong-end", checkpointId: "wugong-golden" }
  ];

  // .build/typescript/runtime/wugong-waypoint.js
  var WUGONG_WAYPOINT_SIZE = 44;
  var WUGONG_WAYPOINT_LABEL_WIDTH = 86;
  var WUGONG_WAYPOINT_HEIGHT = 72;
  function createWugongWaypoint({ document: document2, parent, kind, label: label2 }) {
    function svg(tag, attrs4, host) {
      const element = document2.createElementNS("http://www.w3.org/2000/svg", tag);
      for (const [key, value] of Object.entries(attrs4))
        element.setAttribute(key, String(value));
      host.append(element);
      return element;
    }
    const sign = svg("g", { class: "wugong-waypoint-sign" }, parent);
    svg("rect", { x: -24, y: -35, width: 48, height: 48, rx: 12, fill: "transparent", "aria-hidden": "true" }, sign);
    svg("rect", { x: -22, y: -33, width: WUGONG_WAYPOINT_SIZE, height: WUGONG_WAYPOINT_SIZE, rx: 10, fill: "#fffdf1", stroke: "#9bab86", "stroke-width": 1.3, class: "wugong-waypoint-tile" }, sign);
    const glyph = svg("g", { transform: "translate(0 -11)", fill: "none", stroke: "#607b53", "stroke-width": 1.6, "stroke-linecap": "round", "stroke-linejoin": "round", "aria-hidden": "true" }, sign);
    switch (kind) {
      case "start":
        svg("path", { d: "M-12 12V-8M12 12V-8M-15-8H15M-11-8L0-15L11-8M-9 12H9M-6 12L-5 1H5L6 12M-8-3H8" }, glyph);
        break;
      case "meadow":
        svg("path", { d: "M-12 12Q-11 1-15-4M-6 12Q-8-2-3-13M0 12Q-1-5 5-12M6 12Q6 1 13-5M-14 13H14" }, glyph);
        svg("path", { d: "M5-8Q1-12 5-15Q9-14 8-11Z", fill: "#c8b47e", stroke: "#af9f70", "stroke-width": 0.8 }, glyph);
        break;
      case "clouds":
        svg("path", { d: "M-12 7Q-18 2-12-3Q-12-11-5-10Q0-17 7-10Q16-11 15-3Q22 4 13 8H-12ZM-12 13H12M-6 16H6" }, glyph);
        break;
      case "end":
        svg("path", { d: "M-15 12L-6-4L0 4L6-8L16 12ZM6-8V-17L15-14L6-11M-8 12L-4 7M8 12L6 6" }, glyph);
        break;
      default: {
        const exhaustive = kind;
        return exhaustive;
      }
    }
    svg("rect", { x: -WUGONG_WAYPOINT_LABEL_WIDTH / 2, y: 17, width: WUGONG_WAYPOINT_LABEL_WIDTH, height: 18, rx: 6, fill: "#fffdf1ed" }, sign);
    const text = svg("text", { y: 30, "text-anchor": "middle", fill: "#526d4b", "font-size": 11, "font-weight": 600, class: "wugong-waypoint-label" }, sign);
    text.textContent = label2;
    return { sign, label: text };
  }

  // .build/typescript/runtime/scene-character.js
  var CHARACTER_FILE = "characters/trailbound-realistic-v1.webp";
  function createSceneCharacter(document2) {
    const storyPanel = document2.getElementById("story-panel");
    const storyCopy = document2.getElementById("story-copy");
    const photoPanel = document2.getElementById("photo-panel");
    const photoTop = photoPanel?.querySelector(".photo-top");
    if (!storyPanel || !storyCopy || !photoPanel || !photoTop) {
      throw new Error("Missing story or photo character placement");
    }
    function portrait(pose, label2) {
      const frame = document2.createElement("span");
      frame.className = `scene-character scene-character-${pose}`;
      frame.hidden = true;
      frame.setAttribute("role", "img");
      frame.setAttribute("aria-label", label2);
      const bounds = pose === "dialogue" ? { x: 380, y: 24, width: 401, height: 843 } : { x: 1057, y: 25, width: 357, height: 848 };
      frame.style.setProperty("--scene-character-ratio", String(bounds.width / bounds.height));
      const art = document2.createElement("span");
      art.className = "scene-character-art";
      art.setAttribute("aria-hidden", "true");
      const status = document2.createElement("span");
      status.className = "scene-character-status";
      status.textContent = "人物画作展开中";
      status.setAttribute("aria-hidden", "true");
      frame.append(art, status);
      return { frame, art, status, label: label2, bounds };
    }
    const dialogue = portrait("dialogue", "戴草帽、背着背包的旅人，停步交谈");
    const view = portrait("view", "戴草帽、背着背包的旅人，停步看风景");
    const storyContent = document2.createElement("div");
    storyContent.className = "scene-character-story";
    storyCopy.before(storyContent);
    storyContent.append(dialogue.frame, storyCopy);
    photoTop.prepend(view.frame);
    const portraits = [dialogue, view];
    const source2 = document2.createElement("img");
    source2.decoding = "async";
    let asset = { kind: "loading" };
    let destroyed = false;
    function showAsset() {
      if (destroyed)
        return;
      for (const item of portraits) {
        item.frame.dataset.asset = asset.kind;
        item.frame.setAttribute("aria-label", asset.kind === "failed" ? "人物插画暂未加载，场景文字仍可阅读" : item.label);
        if (asset.kind === "ready") {
          const bounds = item.bounds;
          item.art.style.backgroundImage = `url("${CHARACTER_FILE}")`;
          item.art.style.backgroundSize = `${1774 / bounds.width * 100}% ${887 / bounds.height * 100}%`;
          item.art.style.backgroundPosition = `${bounds.x / (1774 - bounds.width) * 100}% ${bounds.y / (887 - bounds.height) * 100}%`;
          item.status.hidden = true;
        } else {
          item.status.hidden = false;
          item.status.textContent = asset.kind === "failed" ? "人物插画暂未加载" : "人物画作展开中";
        }
      }
    }
    source2.onload = () => {
      const reveal = () => {
        if (destroyed)
          return;
        asset = source2.naturalWidth === 1774 && source2.naturalHeight === 887 ? { kind: "ready" } : { kind: "failed" };
        showAsset();
      };
      if (source2.decode)
        source2.decode().then(reveal, reveal);
      else
        reveal();
    };
    source2.onerror = () => {
      if (destroyed)
        return;
      asset = { kind: "failed" };
      showAsset();
    };
    showAsset();
    source2.src = CHARACTER_FILE;
    return {
      render(visibility) {
        if (destroyed)
          return;
        dialogue.frame.hidden = !visibility.dialogue;
        view.frame.hidden = !visibility.photo;
        storyPanel.classList.toggle("has-scene-character", visibility.dialogue);
        photoPanel.classList.toggle("has-scene-character", visibility.photo);
      },
      destroy() {
        if (destroyed)
          return;
        destroyed = true;
        source2.onload = null;
        source2.onerror = null;
        dialogue.frame.hidden = true;
        view.frame.hidden = true;
        storyContent.before(storyCopy);
        storyContent.remove();
        view.frame.remove();
        storyPanel.classList.remove("has-scene-character");
        photoPanel.classList.remove("has-scene-character");
      }
    };
  }

  // .build/typescript/runtime/wugong-world.js
  var WUGONG_BOUNDS = Object.freeze({ x: 0, y: 0, w: 3600, h: 900 });
  var WUGONG_PATH_KNOTS = [
    { progress: 0, x: 170, y: 705, elevation: 0 },
    { progress: 0.06, x: 420, y: 670, elevation: 42 },
    { progress: 0.12, x: 560, y: 580, elevation: 105 },
    { progress: 0.19, x: 880, y: 610, elevation: 168 },
    { progress: 0.25, x: 1170, y: 535, elevation: 204 },
    { progress: 0.34, x: 1540, y: 580, elevation: 251 },
    { progress: 0.5, x: 2050, y: 450, elevation: 353 },
    { progress: 0.62, x: 2390, y: 520, elevation: 408 },
    { progress: 0.78, x: 2770, y: 390, elevation: 502 },
    { progress: 0.9, x: 3100, y: 430, elevation: 565 },
    { progress: 1, x: 3450, y: 315, elevation: 640 }
  ];
  var summitPhase = { id: "summit", title: "金顶山巅", start: 0.88, end: 1, slope: 0.72 };
  var WUGONG_PHASES = [
    { id: "forest", title: "林间起步", start: 0, end: 0.12, slope: 0.3 },
    { id: "climb", title: "石阶上坡", start: 0.12, end: 0.24, slope: 0.92 },
    { id: "meadow", title: "草甸舒展", start: 0.24, end: 0.48, slope: 0.2 },
    { id: "ridge", title: "山脊云海", start: 0.48, end: 0.88, slope: 0.48 },
    summitPhase
  ];
  var WUGONG_STOPS = [
    { id: "camp", title: "草甸营地", fraction: 0.34, radius: 0.025, kind: "resting", actions: ["rest"] },
    { id: "view-rock", title: "云海观景石", fraction: 0.55, radius: 0.028, kind: "viewpoint", actions: ["cloudsea", "photo", "sketch"] },
    { id: "summit", title: "金顶停一停", fraction: 0.97, radius: 0.03, kind: "summit", actions: ["summit"] }
  ];
  var clamp4 = (value, low, high) => Math.max(low, Math.min(high, value));
  function smoothstep(start, end, value) {
    const t = clamp4((value - start) / (end - start), 0, 1);
    return t * t * (3 - 2 * t);
  }
  function createWugongRoute() {
    const points = WUGONG_PATH_KNOTS.map((knot) => [knot.x, knot.y, knot.elevation]);
    const progress = WUGONG_PATH_KNOTS.map((knot) => knot.progress);
    return createVisualRoute({ points, progress, anchors: progress, tolerance: 0, cornerRadius: 90 });
  }
  function wugongPhase(progress) {
    const p2 = clamp4(progress, 0, 1);
    let phase = summitPhase;
    let previous = WUGONG_PHASES[0];
    for (const candidate of WUGONG_PHASES) {
      if (p2 < candidate.end) {
        phase = candidate;
        break;
      }
      previous = candidate;
    }
    const blend = smoothstep(phase.start, phase.start + 0.025, p2);
    const slope = previous.slope + (phase.slope - previous.slope) * blend;
    return {
      ...phase,
      slope,
      cloudReveal: smoothstep(0.46, 0.58, p2),
      leanDegrees: 1.5 + slope * 5.5,
      strideScale: 1 - slope * 0.22
    };
  }
  function wugongViewport(width, height, progress, point) {
    const screenWidth = Number.isFinite(width) && width > 0 ? width : 720;
    const screenHeight = Number.isFinite(height) && height > 0 ? height : 480;
    const ratio = screenWidth / screenHeight;
    const w = screenWidth >= 900 ? clamp4(screenWidth * 0.82, 900, 1250) : clamp4(screenWidth * 1.12, 430, 600);
    const h = w / ratio;
    const reveal = smoothstep(0.46, 0.58, clamp4(progress, 0, 1));
    const minX = WUGONG_BOUNDS.x - 160;
    const maxX = WUGONG_BOUNDS.x + WUGONG_BOUNDS.w + 160 - w;
    const minY = WUGONG_BOUNDS.y - 100;
    const maxY = WUGONG_BOUNDS.y + WUGONG_BOUNDS.h + 100 - h;
    return {
      x: clamp4(point.x + 80 - w / 2, minX, maxX),
      y: maxY < minY ? (minY + maxY) / 2 : clamp4(point.y - h * (0.58 + reveal * 0.04), minY, maxY),
      w,
      h
    };
  }
  function wugongNearby(progress) {
    const p2 = clamp4(progress, 0, 1);
    let nearest = null;
    let shortest = Infinity;
    for (const stop of WUGONG_STOPS) {
      const distance3 = Math.abs(p2 - stop.fraction);
      if (distance3 <= stop.radius + Number.EPSILON && distance3 < shortest) {
        nearest = stop;
        shortest = distance3;
      }
    }
    return nearest;
  }

  // .build/typescript/runtime/wugong-prop-art.js
  var WUGONG_PROP_FILE = "sprites/wugong-map-props-v1.webp";
  var WUGONG_PROP_WIDTH = 1254;
  var WUGONG_PROP_HEIGHT = 1254;
  var WUGONG_PROPS = {
    tree: { "x": 29, "y": 39, "width": 628, "height": 703, "footX": 308, "footY": 681 },
    grass: { "x": 657, "y": 175, "width": 569, "height": 538, "footX": 289, "footY": 518 },
    camp: { "x": 35, "y": 886, "width": 587, "height": 285, "footX": 291, "footY": 264 },
    rock: { "x": 670, "y": 797, "width": 555, "height": 417, "footX": 277, "footY": 396 }
  };

  // .build/typescript/runtime/wugong-scene.js
  var NS2 = "http://www.w3.org/2000/svg";
  var WUGONG_MAP_ASSETS = ["scenes/wugong-terrain-v1.webp", WUGONG_PROP_FILE, "scenes/wugong-cloudsea-v1.webp"];
  function createWugongScene(options) {
    const { document: document2, background, foreground } = options;
    function svg(tag, attrs4, parent) {
      const node2 = document2.createElementNS(NS2, tag);
      for (const [key, value] of Object.entries(attrs4))
        node2.setAttribute(key, String(value));
      parent.append(node2);
      return node2;
    }
    const under = svg("g", { "data-wugong-layer": "terrain", "pointer-events": "none" }, background);
    svg("rect", { x: -800, y: -800, width: 5200, height: 2500, fill: "#e9ead2" }, under);
    const terrain = svg("image", { href: WUGONG_MAP_ASSETS[0], x: -120, y: -80, width: 3840, height: 1060, preserveAspectRatio: "xMidYMid slice" }, under);
    const defs = svg("defs", {}, under);
    const gradient = svg("linearGradient", { id: "wugong-distance-fade", x1: 0, y1: 0, x2: 0, y2: 1, gradientUnits: "objectBoundingBox" }, defs);
    svg("stop", { offset: 0, "stop-color": "white" }, gradient);
    svg("stop", { offset: 0.5, "stop-color": "white" }, gradient);
    svg("stop", { offset: 1, "stop-color": "black" }, gradient);
    const mask = svg("mask", { id: "wugong-distance-mask", maskUnits: "userSpaceOnUse", x: 1500, y: -250, width: 2300, height: 620 }, defs);
    svg("rect", { x: 1500, y: -250, width: 2300, height: 620, fill: "url(#wugong-distance-fade)" }, mask);
    const distance3 = svg("g", { mask: "url(#wugong-distance-mask)", opacity: 0, "data-wugong-layer": "distance" }, under);
    svg("image", { href: WUGONG_MAP_ASSETS[2], x: 1500, y: -250, width: 2300, height: 900, preserveAspectRatio: "xMidYMid slice" }, distance3);
    const behind = svg("g", { "data-wugong-layer": "plants-behind" }, background);
    const front = svg("g", { "data-wugong-layer": "plants-front" }, foreground);
    const haze = svg("g", { "pointer-events": "none", "data-wugong-layer": "near-mist" }, foreground);
    const mist = svg("image", { href: WUGONG_MAP_ASSETS[2], x: 1700, y: 50, width: 1900, height: 600, preserveAspectRatio: "xMidYMid slice", mask: "url(#wugong-distance-mask)", opacity: 0 }, haze);
    const props = [];
    const status = document2.createElement("span");
    status.className = "wugong-art-status";
    status.setAttribute("role", "status");
    background.ownerSVGElement?.parentElement?.append(status);
    let disposed = false;
    const assets = new Map(WUGONG_MAP_ASSETS.map((file) => [file, "loading"]));
    const loaders = [];
    function prop(kind, x, y, height, interactive = false) {
      const frame = WUGONG_PROPS[kind], scale = height / frame.height;
      const group = svg("g", { transform: `translate(${x} ${y})`, "data-wugong-prop": kind }, behind);
      const crop = svg("svg", { x: -frame.footX * scale, y: -frame.footY * scale, width: frame.width * scale, height, viewBox: `${frame.x} ${frame.y} ${frame.width} ${frame.height}`, overflow: "hidden", "pointer-events": interactive ? "auto" : "none" }, group);
      svg("image", { href: WUGONG_PROP_FILE, x: 0, y: 0, width: WUGONG_PROP_WIDTH, height: WUGONG_PROP_HEIGHT }, crop);
      if (interactive) {
        group.setAttribute("role", "button");
        group.setAttribute("tabindex", "-1");
        group.setAttribute("aria-label", kind === "camp" ? "在营地停留" : "在观景石停留");
        group.addEventListener("click", options.onStop);
        group.addEventListener("keydown", (event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            options.onStop();
          }
        });
      }
      props.push({ node: group, x, y, kind, front: false });
    }
    function mount(route) {
      for (const item of props)
        item.node.remove();
      props.length = 0;
      for (const [x, y, height] of [[220, 760, 330], [530, 680, 370], [790, 745, 390], [990, 520, 280]])
        prop("tree", x, y, height);
      for (const fraction of [0.04, 0.11, 0.21, 0.29, 0.39, 0.46, 0.59, 0.67, 0.76, 0.84, 0.94]) {
        const point = route.sample(fraction);
        prop("grass", point.x + 25, point.y + 24, 58 + fraction * 18);
      }
      const camp = route.sample(0.34), rock = route.sample(0.55), summit = route.sample(0.97);
      prop("camp", camp.x + 50, camp.y - 8, 120, true);
      prop("rock", rock.x + 35, rock.y + 26, 95, true);
      prop("rock", summit.x + 35, summit.y + 24, 105, true);
    }
    function update(frame) {
      background.style.display = foreground.style.display = frame.visible ? "" : "none";
      status.hidden = !frame.visible || [...assets.values()].every((value) => value === "ready");
      if (!frame.visible)
        return;
      status.textContent = [...assets.values()].some((value) => value === "failed") ? "部分山路画作暂未载入，仍可沿路行走与查看照片" : "山路画作正慢慢展开…";
      const phase = wugongPhase(frame.progress), time = frame.reduced ? 0 : frame.elapsed;
      distance3.setAttribute("opacity", String(phase.cloudReveal * 0.84));
      distance3.setAttribute("transform", `translate(${Math.sin(time * 0.035) * 6} 0)`);
      mist.setAttribute("opacity", String(phase.cloudReveal * 0.16));
      haze.setAttribute("transform", `translate(${Math.sin(time * 0.07) * 18} ${Math.cos(time * 0.04) * 3})`);
      for (const item of props) {
        const isFront = frame.y < item.y + 2;
        if (isFront !== item.front) {
          (isFront ? front : behind).append(item.node);
          item.front = isFront;
        }
        const near = Math.abs(frame.x - item.x) < 200;
        if (item.kind === "camp" || item.kind === "rock") {
          item.node.setAttribute("tabindex", near ? "0" : "-1");
          item.node.style.pointerEvents = near ? "auto" : "none";
        }
        const angle = item.kind === "grass" && !frame.reduced ? Math.sin(time * 0.9 + item.x) * 1.2 : 0;
        item.node.setAttribute("transform", `translate(${item.x} ${item.y}) rotate(${angle})`);
      }
    }
    function settled(file, ok) {
      if (disposed)
        return;
      assets.set(file, ok ? "ready" : "failed");
      if (file === WUGONG_MAP_ASSETS[0] && !ok)
        terrain.setAttribute("visibility", "hidden");
      options.onChange();
    }
    for (const file of WUGONG_MAP_ASSETS) {
      const entry = options.cache?.request(file, "high");
      if (entry)
        entry.promise.then((asset) => settled(file, asset.state === "ready"), () => settled(file, false));
      else {
        const loader = document2.createElement("img");
        loader.onload = () => settled(file, true);
        loader.onerror = () => settled(file, false);
        loader.src = file;
        loaders.push(loader);
      }
    }
    return { mount, update, destroy() {
      disposed = true;
      background.replaceChildren();
      foreground.replaceChildren();
      status.remove();
      for (const loader of loaders) {
        loader.onload = loader.onerror = null;
      }
    } };
  }

  // .build/typescript/runtime/wugong-stops.js
  var STOP_COPY = {
    camp: { invitation: "在营地坐一会儿", copy: "山路在这里缓下来。放下背包，陪草尖上的风坐一会儿。" },
    "view-rock": { invitation: "去观景石看看", copy: "在石边停一停。云海、沿途实景和一张小画，都可以慢慢看。" },
    summit: { invitation: "在金顶停一会儿", copy: "最后一段山路，金顶已在眼前。停下看看来时的山脊，再慢慢走到终点。" }
  };
  var VISTAS = {
    ridge: { title: "翻过山肩，云海展开", copy: "脚步停一下。风越过近处的草坡，远山在云间显出来。", art: "scenes/wugong-cloudsea-v1.webp" },
    summit: { title: "金顶就在眼前", copy: "山路还剩最后一段。沿着风，望向走过的群山。", art: "scenes/wugong-v1.webp" },
    clouds: { title: "在云边坐一会儿", copy: "云缓缓从山坳里流过，草尖接住了山脊上的风。", art: "scenes/wugong-cloudsea-v1.webp" }
  };
  var OVERVIEW_POINTS = [{ x: 12, y: 72 }, { x: 48, y: 54 }, { x: 91, y: 60 }, { x: 132, y: 34 }, { x: 176, y: 26 }, { x: 212, y: 12 }];
  function createWugongStops(options) {
    const { document: document2, host, scenes, reduced, onChange, onAction } = options;
    function html(tag, className, parent) {
      const node2 = document2.createElement(tag);
      node2.className = className;
      parent.append(node2);
      return node2;
    }
    function svg(tag, attrs4, parent) {
      const node2 = document2.createElementNS("http://www.w3.org/2000/svg", tag);
      for (const [name, value] of Object.entries(attrs4))
        node2.setAttribute(name, value);
      parent.append(node2);
      return node2;
    }
    const hud = html("section", "wugong-map-hud", host);
    hud.setAttribute("aria-label", "武功山山路");
    const chapter = html("div", "wugong-map-chapter", hud);
    const kicker = html("small", "", chapter);
    kicker.textContent = "武功山 · 中庵至金顶";
    const chapterTitle = html("strong", "", chapter);
    chapterTitle.textContent = "林间起步";
    const nearButton = html("button", "wugong-near-stop", chapter);
    nearButton.type = "button";
    nearButton.hidden = true;
    const overview = html("figure", "wugong-mini-overview", hud);
    const mini = svg("svg", { viewBox: "0 0 224 94", role: "img", "aria-label": "中庵至金顶全程概览" }, overview);
    const road = OVERVIEW_POINTS.map((point, index) => {
      const previous = OVERVIEW_POINTS[index - 1];
      if (!previous)
        return `M${point.x} ${point.y}`;
      const middle = (previous.x + point.x) / 2;
      return `C${middle} ${previous.y} ${middle} ${point.y} ${point.x} ${point.y}`;
    }).join(" ");
    svg("path", { d: road, fill: "none", stroke: "#e9dfc3", "stroke-width": "7", "stroke-linecap": "round" }, mini);
    svg("path", { d: road, fill: "none", stroke: "#b19b73", "stroke-width": "2.5", "stroke-linecap": "round" }, mini);
    for (const [x, y] of [[12, 72], [212, 12]])
      svg("circle", { cx: String(x), cy: String(y), r: "3", fill: "#607e60" }, mini);
    const traveller = svg("circle", { cx: "12", cy: "72", r: "4", fill: "#9c7754", stroke: "#fffaf0", "stroke-width": "2" }, mini);
    const miniLabels = ["林间", "石阶", "草甸", "山脊", "金顶"];
    for (const [index, label2] of miniLabels.entries()) {
      const node2 = svg("text", { x: String(18 + index * 46), y: "91", "text-anchor": "middle" }, mini);
      node2.textContent = label2;
    }
    const caption = html("figcaption", "", overview);
    caption.textContent = "中庵 · 起点　→　金顶 · 终点";
    const overlay = html("section", "wugong-stop-overlay", host);
    overlay.hidden = true;
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", "山路停留");
    let presentation = null, latest = null;
    let nearby = null, lastProgress = null, disposed = false;
    let panelCleanup = null;
    let stopDrawing = null;
    const sketchStrokes = [];
    const seen = /* @__PURE__ */ new Set(), pending = /* @__PURE__ */ new Set();
    function clearPanel() {
      panelCleanup?.();
      panelCleanup = null;
      overlay.replaceChildren();
    }
    function cleanup(callback) {
      const previous = panelCleanup;
      panelCleanup = () => {
        previous?.();
        callback();
      };
    }
    function pose(parent, kind, className) {
      const frame = WUGONG_REST_FRAMES[kind];
      const crop = svg("svg", { viewBox: `${frame.x} ${frame.y} ${frame.width} ${frame.height}`, class: className, role: "img", "aria-label": kind === "sit" ? "背包放在身旁，坐在石边的徒步小人" : "停在山脊上远眺的徒步小人" }, parent);
      const image = svg("image", { href: WUGONG_REST_FILE, width: String(WUGONG_REST_WIDTH), height: String(WUGONG_REST_HEIGHT) }, crop);
      const fail = () => {
        crop.style.display = "none";
      };
      image.addEventListener("error", fail);
      cleanup(() => image.removeEventListener("error", fail));
      return crop;
    }
    function close(resume = true, notify = true, restoreFocus = true) {
      const previous = presentation;
      if (!previous)
        return;
      presentation = null;
      overlay.hidden = true;
      clearPanel();
      scenes.leave(previous.session, resume);
      if (notify && !disposed)
        onChange();
      if (restoreFocus && previous.focus?.isConnected)
        previous.focus.focus({ preventScroll: true });
    }
    function button(parent, label2, action, className = "") {
      const node2 = html("button", `wugong-stop-action ${className}`, parent);
      node2.type = "button";
      node2.textContent = label2;
      node2.onclick = action;
      return node2;
    }
    function heading(card, title, copy2) {
      const closeButton = button(card, "×", () => close(), "wugong-stop-close");
      closeButton.setAttribute("aria-label", "回到山路");
      const eyebrow = html("small", "wugong-stop-kicker", card);
      eyebrow.textContent = "山径 · 停一停";
      const titleNode = html("h2", "", card);
      titleNode.textContent = title;
      const paragraph = html("p", "wugong-stop-copy", card);
      paragraph.textContent = copy2;
      overlay.setAttribute("aria-label", title);
      return paragraph;
    }
    function handoff(action, checkpointId) {
      if (!latest?.unlockedPhotos.includes(checkpointId))
        return;
      close(false, false, false);
      onAction(action, checkpointId);
      if (!disposed)
        onChange();
    }
    function paintStop(place2) {
      clearPanel();
      overlay.className = "wugong-stop-overlay";
      const card = html("div", "wugong-stop-card", overlay);
      const copy2 = heading(card, place2.title, STOP_COPY[place2.id].copy);
      const camp = place2.id === "camp" ? html("div", "wugong-camp-scene", card) : null;
      if (camp) {
        camp.hidden = true;
        pose(camp, "sit", "wugong-camp-person");
      }
      const actions = html("div", "wugong-stop-actions", card);
      if (place2.id === "camp") {
        const sit = button(actions, "放下背包，坐下休息", () => {
          sit.disabled = true;
          sit.textContent = "已经坐下，慢慢歇一会儿";
          if (camp)
            camp.hidden = false;
          card.setAttribute("data-resting", "true");
          copy2.textContent = "坐在草甸边，背包靠在身旁。风慢慢穿过草尖，山路可以等一等。";
          onAction("rest");
          if (!disposed)
            onChange();
        });
      } else {
        if (place2.id === "view-rock")
          button(actions, "看一会儿云海", () => {
            const previous = presentation;
            if (!previous)
              return;
            presentation = { kind: "vista", id: "clouds", automatic: false, age: 0, session: previous.session, focus: previous.focus };
            paintVista("clouds");
            onChange();
          });
        const checkpointId = place2.id === "summit" ? "wugong-golden" : "wugong-clouds";
        const unlocked = latest?.unlockedPhotos.includes(checkpointId) ?? false;
        button(actions, unlocked ? "查看沿途真实照片" : "抵达金顶后解锁实景", () => handoff("photo", checkpointId)).disabled = !unlocked;
        button(actions, "画一笔，留住眼前风景", () => {
          const previous = presentation;
          if (!previous)
            return;
          presentation = { kind: "sketch", place: place2, session: previous.session, focus: previous.focus };
          paintSketch(place2);
          onChange();
        });
      }
      button(actions, "继续行走", () => close(), "wugong-stop-continue");
    }
    function paintSketch(place2) {
      clearPanel();
      overlay.className = "wugong-stop-overlay wugong-sketch";
      const card = html("div", "wugong-stop-card wugong-sketch-card", overlay);
      const hint = heading(card, "把眼前山脊画下来", "按住鼠标或手指拖动画线。淡淡的山脊只是参考，可以自由画。这张草稿保留到本次路线重玩前。");
      hint.setAttribute("aria-live", "polite");
      const canvas = html("canvas", "wugong-sketch-paper", card);
      canvas.width = 960;
      canvas.height = 600;
      canvas.tabIndex = 0;
      canvas.setAttribute("aria-label", "山脊速写纸，按住鼠标或手指拖动画线");
      let pen = null;
      const tools = html("div", "wugong-sketch-tools", card);
      const undo = button(tools, "撤回上一笔", () => {
        finish2();
        sketchStrokes.pop();
        redraw();
      });
      const erase = button(tools, "重新画", () => {
        finish2();
        sketchStrokes.splice(0);
        redraw();
      });
      button(tools, "回到停留处", () => {
        const previous = presentation;
        if (!previous)
          return;
        presentation = { kind: "stop", place: place2, session: previous.session, focus: previous.focus };
        paintStop(place2);
        onChange();
      }, "wugong-stop-continue");
      const context = canvas.getContext("2d");
      if (!context) {
        canvas.hidden = true;
        undo.disabled = true;
        erase.disabled = true;
        hint.textContent = "这台设备暂时无法打开速写纸。仍可以回到观景石看云海，或继续行走。";
        return;
      }
      function redraw() {
        if (!context)
          return;
        context.clearRect(0, 0, 960, 600);
        context.fillStyle = "#fbf7e9";
        context.fillRect(0, 0, 960, 600);
        context.lineCap = "round";
        context.lineJoin = "round";
        context.lineWidth = 1.5;
        context.strokeStyle = "#85927755";
        context.beginPath();
        context.moveTo(55, 370);
        context.bezierCurveTo(160, 375, 210, 220, 315, 285);
        context.bezierCurveTo(405, 325, 485, 155, 560, 230);
        context.bezierCurveTo(660, 325, 750, 225, 905, 300);
        context.stroke();
        context.strokeStyle = "#526b59";
        context.fillStyle = "#526b59";
        context.lineWidth = 2.5;
        for (const stroke of sketchStrokes) {
          const first = stroke[0];
          if (!first)
            continue;
          context.beginPath();
          context.moveTo(first.x * 960, first.y * 600);
          for (const point2 of stroke.slice(1))
            context.lineTo(point2.x * 960, point2.y * 600);
          if (stroke.length === 1) {
            context.arc(first.x * 960, first.y * 600, 1.25, 0, Math.PI * 2);
            context.fill();
          } else
            context.stroke();
        }
        undo.disabled = sketchStrokes.length === 0;
        erase.disabled = sketchStrokes.length === 0;
      }
      function point(event) {
        const rect = canvas.getBoundingClientRect();
        return { x: Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width)), y: Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height)) };
      }
      function canDraw() {
        return presentation?.kind === "sketch" && !latest?.blocked && !document2.hidden && scenes.isTop(presentation.session);
      }
      function finish2() {
        const current = pen;
        pen = null;
        if (current && canvas.hasPointerCapture(current.id))
          canvas.releasePointerCapture(current.id);
      }
      function down(event) {
        if (pen || event.button !== 0 || !event.isPrimary || !canDraw())
          return;
        event.preventDefault();
        canvas.focus({ preventScroll: true });
        const stroke = [point(event)];
        sketchStrokes.push(stroke);
        pen = { id: event.pointerId, stroke };
        canvas.setPointerCapture(event.pointerId);
        redraw();
      }
      function move(event) {
        if (!pen || event.pointerId !== pen.id)
          return;
        if (!canDraw()) {
          finish2();
          return;
        }
        event.preventDefault();
        const rect = canvas.getBoundingClientRect();
        if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) {
          finish2();
          return;
        }
        const coalesced = event.getCoalescedEvents?.();
        for (const sample of coalesced?.length ? coalesced : [event]) {
          const next = point(sample), previous = pen.stroke.at(-1);
          if (!previous || Math.hypot(next.x - previous.x, next.y - previous.y) > 8e-4)
            pen.stroke.push(next);
        }
        redraw();
      }
      function end(event) {
        if (pen?.id === event.pointerId)
          finish2();
      }
      function visibility() {
        if (document2.hidden)
          finish2();
      }
      function key(event) {
        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") {
          event.preventDefault();
          undo.click();
        }
      }
      canvas.addEventListener("pointerdown", down);
      canvas.addEventListener("pointermove", move);
      const endEvents = ["pointerup", "pointercancel", "lostpointercapture", "pointerleave"];
      for (const name of endEvents)
        canvas.addEventListener(name, end);
      canvas.addEventListener("keydown", key);
      document2.addEventListener("visibilitychange", visibility);
      document2.defaultView?.addEventListener("blur", finish2);
      stopDrawing = finish2;
      cleanup(() => {
        finish2();
        stopDrawing = null;
        canvas.removeEventListener("pointerdown", down);
        canvas.removeEventListener("pointermove", move);
        for (const name of endEvents)
          canvas.removeEventListener(name, end);
        canvas.removeEventListener("keydown", key);
        document2.removeEventListener("visibilitychange", visibility);
        document2.defaultView?.removeEventListener("blur", finish2);
      });
      redraw();
      canvas.focus({ preventScroll: true });
    }
    function paintVista(id) {
      clearPanel();
      overlay.className = "wugong-stop-overlay wugong-vista";
      overlay.setAttribute("data-vista", id);
      overlay.setAttribute("data-reduced", String(reduced));
      const landscape = html("div", "wugong-vista-landscape", overlay);
      const image = html("img", "wugong-vista-art", landscape);
      image.alt = "";
      image.decoding = "async";
      const failure = html("p", "wugong-vista-error", landscape);
      failure.hidden = true;
      failure.textContent = "远景画作暂未加载。仍可以在这里停一会儿，或回到山路。";
      const failed = () => {
        if (disposed)
          return;
        image.hidden = true;
        failure.hidden = false;
      };
      image.addEventListener("error", failed);
      image.src = VISTAS[id].art;
      panelCleanup = () => image.removeEventListener("error", failed);
      html("div", "wugong-vista-haze wugong-vista-haze-far", landscape);
      html("div", "wugong-vista-haze wugong-vista-haze-near", landscape);
      const grass = html("img", "wugong-vista-grass", landscape);
      grass.alt = "";
      grass.onerror = () => {
        grass.hidden = true;
      };
      grass.src = "sprites/wugong-meadow-grass-v1.webp";
      const previousCleanup = panelCleanup;
      panelCleanup = () => {
        previousCleanup?.();
        grass.onerror = null;
      };
      pose(landscape, "view", "wugong-vista-person");
      const card = html("div", "wugong-stop-card wugong-vista-caption", overlay);
      heading(card, VISTAS[id].title, VISTAS[id].copy);
      button(card, "回到山路", () => close(), "wugong-stop-continue");
      const control = card.querySelector("button");
      control?.focus({ preventScroll: true });
    }
    function openStop(place2) {
      if (disposed || presentation || !latest || latest.blocked)
        return;
      const active = document2.activeElement;
      presentation = { kind: "stop", place: place2, session: scenes.enter("photo"), focus: active instanceof HTMLElement ? active : null };
      overlay.hidden = false;
      nearButton.hidden = true;
      paintStop(place2);
      overlay.querySelector("button")?.focus({ preventScroll: true });
      onChange();
    }
    function openVista(id) {
      const active = document2.activeElement;
      presentation = { kind: "vista", id, automatic: true, age: 0, session: scenes.enter("photo"), focus: active instanceof HTMLElement ? active : null };
      seen.add(id);
      pending.delete(id);
      overlay.hidden = false;
      nearButton.hidden = true;
      paintVista(id);
      onChange();
    }
    function onNearby() {
      if (nearby)
        openStop(nearby);
    }
    function onKey(event) {
      if (!presentation || !scenes.isTop(presentation.session))
        return;
      event.stopPropagation();
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }
      if (event.key !== "Tab")
        return;
      const controls = [...overlay.querySelectorAll("button:not(:disabled),canvas[tabindex]")];
      const first = controls[0], last = controls.at(-1);
      if (event.shiftKey && document2.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document2.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    }
    nearButton.addEventListener("click", onNearby);
    overlay.addEventListener("keydown", onKey);
    function update(frame) {
      if (disposed)
        return;
      latest = frame;
      const progress = Math.max(0, Math.min(1, frame.progress));
      chapterTitle.textContent = frame.phaseTitle;
      overview.setAttribute("data-expanded", String(!!frame.overview));
      const portion = progress * (OVERVIEW_POINTS.length - 1), index = Math.min(OVERVIEW_POINTS.length - 2, Math.floor(portion));
      const a = OVERVIEW_POINTS[index], b = OVERVIEW_POINTS[index + 1];
      if (a && b) {
        const t = portion - index, u = 1 - t, middle = (a.x + b.x) / 2;
        const x = u * u * u * a.x + 3 * u * u * t * middle + 3 * u * t * t * middle + t * t * t * b.x;
        const y = (u * u * u + 3 * u * u * t) * a.y + (3 * u * t * t + t * t * t) * b.y;
        traveller.setAttribute("cx", String(x));
        traveller.setAttribute("cy", String(y));
      }
      mini.setAttribute("aria-label", `中庵至金顶全程概览，已走${Math.round(progress * 100)}%`);
      for (const [id, gate] of [["ridge", 0.48], ["summit", 0.91]]) {
        if (lastProgress === null && progress >= gate)
          seen.add(id);
        else if (lastProgress !== null && lastProgress < gate && progress >= gate && !seen.has(id))
          pending.add(id);
      }
      lastProgress = progress;
      if (presentation) {
        const current = presentation, paused = frame.blocked || !scenes.isTop(current.session);
        overlay.hidden = paused;
        overlay.setAttribute("data-frozen", String(paused));
        if (paused)
          stopDrawing?.();
        if (!paused && current.kind === "vista") {
          current.age += Math.max(0, Math.min(0.1, frame.dt));
          overlay.style.setProperty("--wugong-vista-clock", `${current.age.toFixed(3)}s`);
          if (current.automatic && !reduced && current.age >= 5)
            close();
        }
      } else if (!frame.blocked && frame.walking && !frame.overview) {
        const next = pending.values().next().value;
        if (next)
          openVista(next);
      }
      nearby = wugongNearby(progress);
      nearButton.hidden = frame.blocked || !!presentation || !!frame.overview || !nearby;
      if (nearby)
        nearButton.textContent = STOP_COPY[nearby.id].invitation;
      hud.setAttribute("data-blocked", String(frame.blocked || !!presentation));
    }
    function reset() {
      close(false, false, false);
      latest = null;
      nearby = null;
      lastProgress = null;
      seen.clear();
      pending.clear();
      sketchStrokes.splice(0);
      nearButton.hidden = true;
      chapterTitle.textContent = "林间起步";
    }
    return {
      update,
      reset,
      openNearby: onNearby,
      get active() {
        return presentation !== null;
      },
      destroy() {
        if (disposed)
          return;
        disposed = true;
        reset();
        nearButton.removeEventListener("click", onNearby);
        overlay.removeEventListener("keydown", onKey);
        hud.remove();
        overlay.remove();
      }
    };
  }

  // .build/typescript/runtime/mini-game-view.js
  function createMiniGameView({ dom, api, platform: games, sound }) {
    const { get: $, text, html } = dom;
    let actionKey = null;
    const artReady = (refs) => !!refs.art && refs.contentState === "ready";
    function storyTools(s, refs, flow) {
      const controls = flow.controls;
      $("wugong-tools").hidden = !controls;
      if (!controls)
        return;
      text("wugong-speaker", controls.speaker);
      text("wugong-line", controls.line);
      const loading = refs.contentState === "loading", failed = refs.contentState === "error";
      if ((s.game === "clouds" || s.stage === "camera") && (loading || failed))
        text("wugong-line", failed ? "画作暂未加载，请点「重新试一次」重新展开。" : "画作正在展开，稍等片刻就能操作。");
      for (const [id, action] of [["wugong-primary", controls.primary], ["wugong-secondary", controls.secondary]]) {
        const button = $(id);
        button.hidden = !action;
        if (action) {
          text(id, action.label);
          button.setAttribute("data-action", action.action);
          button.disabled = !!action.disabled || action.action === "shutter" && (loading || failed);
        }
      }
      $("wugong-zoom").hidden = !controls.zoom;
      $("wugong-zoom-in").disabled = (s.camera?.zoom ?? 1) >= 1.44;
      $("wugong-zoom-out").disabled = (s.camera?.zoom ?? 1) <= 0.86;
    }
    function artTools(s, refs) {
      if (!games)
        return;
      const flow = games.artFlow(s), waiting = !artReady(refs);
      $("micro-panel").setAttribute("data-phase", flow.phase);
      $("art-tools").hidden = false;
      text("art-kicker", flow.kicker);
      text("art-count", flow.counter);
      text("art-title", s.play.complete ? "这一幅，慢慢完整了" : flow.title);
      text("art-cue", waiting ? refs.contentState === "error" ? "画作暂未加载，请点「重新试一次」重新展开。" : "水彩画作正在展开，准备好就能操作。" : flow.cue);
      const key = flow.controls.map((c) => c.action).join("|");
      if (key !== actionKey) {
        $("art-actions").replaceChildren();
        for (const control of flow.controls) {
          const button = html("button", control.label, $("art-actions"));
          button.type = "button";
          button.setAttribute("data-action", control.action);
        }
        actionKey = key;
      }
      for (const control of flow.controls) {
        const button = $("art-actions").querySelector('[data-action="' + control.action + '"]');
        if (!button)
          continue;
        if (button.textContent !== control.label)
          button.textContent = control.label;
        button.disabled = waiting || !!control.disabled;
        button.setAttribute("data-primary", String(!!control.primary));
      }
      const hints = { puzzle: "1–6 选片 · 方向键选格 · Enter 放下", match: "方向键选格 · Enter 选中／交换 · R 重试", sling: "方向键调整 · 按住空格蓄力、松开发射 · R 重试" };
      text("art-key-hint", s.game && s.game in hints ? hints[s.game] : "");
      $("micro-surface").setAttribute("aria-busy", String(refs.contentState === "loading"));
    }
    function wugong(s, refs) {
      if (!games)
        return;
      const flow = games.wugongFlow(s), panel = $("micro-panel");
      panel.setAttribute("data-phase", flow.phase);
      panel.setAttribute("data-story-stage", s.stage || "");
      text("wind-stage-name", flow.stage);
      text("wind-count", flow.counter || flow.count + " / " + flow.total + " " + flow.unit);
      text("wind-cue", flow.cue);
      $("wind-steady-fill").style.width = flow.hold * 100 + "%";
      $("wind-hud").setAttribute("data-in-wind", String(!!s.near));
      for (let i = 0; i < 3; i++)
        $("wind-feather-" + i).setAttribute("data-earned", String(i < (s.gates || 0)));
      if (flow.story)
        storyTools(s, refs, flow);
      const title = flow.story ? flow.phase === "memory" ? "这一刻，值得留下" : flow.phase === "soar" ? s.game === "clouds" ? "草脊，浮出云海" : "下次山里见" : "" : flow.phase === "invite" ? flow.title : flow.phase === "caught" ? "这一处，留住了" : flow.phase === "soar" ? "把一段石语留在心里" : flow.phase === "memory" ? "这一刻，值得留下" : "";
      $("wind-chapter").hidden = !title;
      text("wind-chapter-title", title);
      text("wind-chapter-kicker", flow.kicker);
      text("wind-chapter-copy", flow.phase === "invite" ? flow.invitation : flow.phase === "memory" ? "正在展开你的手绘纪念" : s.game === "greet" ? "相遇很短，笑容留在了画里。" : s.game === "clouds" ? "雾散在山坳，云仍留在谷中。" : "石头留在原处，回忆带在身边。");
    }
    function wind(s, refs) {
      if (!games)
        return;
      const flow = games.flow(s), gates = s.gates || 0, stage = games.windNames[Math.min(2, gates)];
      $("micro-panel").setAttribute("data-phase", flow.phase);
      text("wind-stage-name", stage);
      text("wind-count", flow.counter);
      text("wind-cue", flow.cue);
      $("wind-steady-fill").style.width = flow.energy * 100 + "%";
      $("wind-hud").setAttribute("data-in-wind", String(!!s.windNear));
      for (let i = 0; i < 3; i++)
        $("wind-feather-" + i).setAttribute("data-earned", String(i < gates));
      const title = flow.phase === "invite" ? "借一阵草甸的风" : flow.phase === "caught" ? flow.cue : flow.phase === "soar" ? "把风借给远方" : flow.phase === "memory" ? "这一刻，值得留下" : "";
      text("wind-chapter-title", title);
      $("wind-chapter").hidden = !title;
      text("wind-chapter-kicker", flow.phase === "invite" ? "武功山 · 山野小事" : flow.phase === "caught" ? stage : "草浪来信");
      text("wind-chapter-copy", flow.phase === "invite" ? "让草浪告诉你，风往哪里去。" : flow.phase === "caught" ? gates === 1 ? "侧风会带动纸鸢，顺着风带继续飞。" : "山脊已在身后，缓缓放线，借远处的气流。" : flow.phase === "memory" ? "正在展开你的手绘纪念" : "纸鸢越过山脊，云海在眼前展开。");
      if (refs.contentState !== "ready")
        text("wind-cue", refs.contentState === "error" ? "纸鸢画作暂未加载，点「重新试一次」重新展开。" : "水彩纸鸢正在展开，准备好就能起飞。");
    }
    function water2(s) {
      if (!games)
        return;
      const flow = games.waterFlow(s), rain2 = s.game === "rain";
      $("micro-panel").setAttribute("data-phase", flow.phase === "settle" ? "soar" : flow.phase);
      text("wind-stage-name", rain2 ? "把雨接成一首歌" : ["初入浅溪", "绕过青石", "漂向下游"][Math.min(2, s.gates || 0)]);
      text("wind-count", flow.count + " / " + flow.total + (rain2 ? " 滴雨" : " 处水口"));
      text("wind-cue", flow.cue);
      $("wind-steady-fill").style.width = s.play.progress * 100 + "%";
      $("wind-hud").setAttribute("data-in-wind", String(flow.pulse > 0));
      for (let i = 0; i < 3; i++)
        $("wind-feather-" + i).setAttribute("data-earned", String(i < (s.gates || 0)));
      const title = flow.phase === "invite" ? rain2 ? "听一筒竹林的雨" : "陪一片叶子顺流而下" : flow.phase === "memory" ? "这一刻，值得留下" : flow.phase === "settle" ? rain2 ? "八滴雨，一段回声" : "把溪声寄向远方" : "";
      $("wind-chapter").hidden = !title;
      text("wind-chapter-title", title);
      text("wind-chapter-kicker", rain2 ? "莫干山 · 竹雨成曲" : "九溪 · 一叶顺流");
      text("wind-chapter-copy", flow.phase === "invite" ? rain2 ? "看叶尖蓄水，让竹筒等在雨滴下面。" : "水纹有方向，轻轻拨水，绕过青石。" : flow.phase === "memory" ? "正在展开你的手绘纪念" : rain2 ? "雨滴在竹筒里，留下最后一圈涟漪。" : "落叶慢慢漂远，溪水还在轻轻流。");
    }
    function update(s, refs) {
      if (refs.mogan || refs.tiger || refs.directInput) {
      } else if (s.game && games?.artAssets[s.game])
        artTools(s, refs);
      else if (s.game && games?.wugongAssets[s.game])
        wugong(s, refs);
      else if (s.game === "wind")
        wind(s, refs);
      else if (s.game)
        water2(s);
      if (s.game || refs.directInput) {
        $("mini-retry").disabled = s.play.complete;
        text("mini-sound", sound() ? "声音 · 开" : "声音 · 点击开启");
        $("mini-sound").setAttribute("aria-pressed", String(sound()));
      }
      const progress = Math.round(s.play.progress * 100);
      $("micro-progress").setAttribute("aria-valuenow", String(progress));
      $("micro-progress-fill").style.width = progress + "%";
      const status = refs.art && !artReady(refs) ? $("art-cue").textContent || "" : s.game === "clouds" && refs.contentState !== "ready" ? refs.contentState === "error" ? "云海暂未加载，请点「重新试一次」。" : "云海正在展开…" : api.status(s) + (s.game === "clouds" ? " · " + (s.gates || 0) + " / 3" : "");
      text("micro-result", status);
    }
    return { update, reset() {
      actionKey = null;
    }, artReady };
  }

  // .build/typescript/runtime/mini-game-controller.js
  function createMiniGameController(options) {
    const { dom, scenes, platform: games, catalog: D } = options, { get: $, text } = dom;
    const bindings = new EventBindings();
    const registered = /* @__PURE__ */ new Map();
    let api = options.api;
    let current = null;
    let currentEntry = null;
    let refs = null;
    let session = null;
    let pendingPoint = null;
    let pointer = null;
    let soundSerial = 0;
    let genericCompletionSound = false;
    const view = createMiniGameView({ dom, api: { ...options.api, status: (state) => api.status(state) }, platform: games, sound: options.sound });
    const surface = $("micro-surface");
    const soundTheme = () => api.soundTheme ?? current?.game;
    const directInput = () => api.input === "direct" || !!refs?.directInput;
    function interactive() {
      return !!current && scenes.isTop(session) && !scenes.background && !dom.document.hidden;
    }
    function paint() {
      if (current && refs)
        api.paint(refs, current, options.reduced);
    }
    function updateStatus() {
      if (!current || !refs)
        return;
      view.update(current, refs);
      api.present?.(current, refs);
      const theme2 = soundTheme();
      if (theme2) {
        if (current.game === "wind" && games && !refs.directInput)
          options.audio.wind?.(games.flow(current).energy, current.play.complete);
        for (const event of current.events || [])
          if (event.serial > soundSerial) {
            options.audio.mini?.(theme2, event.type, { x: event.x, index: event.index ?? (current.caught || current.gates) });
            soundSerial = event.serial;
          }
      }
    }
    function clearPointer() {
      pendingPoint = null;
      const previous = pointer;
      pointer = null;
      if (previous)
        try {
          if (surface.hasPointerCapture?.(previous.id))
            surface.releasePointerCapture(previous.id);
        } catch {
        }
    }
    function pause() {
      clearPointer();
      if (current)
        current = api.release(current);
    }
    function inputReady(input = {}) {
      if (!interactive() || !current || !refs)
        return false;
      if ((refs.mogan || refs.tiger || refs.directInput) && refs.contentState !== "ready")
        return false;
      if (refs.art && !view.artReady(refs))
        return false;
      if ((current.game === "wind" || current.game === "clouds") && refs.contentState !== "ready")
        return false;
      if (refs.story && refs.contentState !== "ready" && (input.action === "shutter" || input.assist && current.game === "greet" && current.stage === "camera"))
        return false;
      return true;
    }
    function perform(input = {}) {
      if (!inputReady(input) || !current)
        return;
      const next = api.act(current, input);
      if (next === current)
        return;
      current = next;
      if (!current.game && !directInput()) {
        paint();
        options.audio.interact?.(current.kind, { x: current.x, icon: D.item(current.id).icon, playType: current.play.type });
      }
      updateStatus();
      options.refresh();
    }
    function begin(entry, returnStatus) {
      if (current)
        finish2(false, false);
      options.stopLoop();
      session = scenes.enter("minigame", returnStatus);
      api = registered.get(entry.id) || options.api;
      current = api.create(entry, { reduced: options.reduced, weather: options.weather?.() });
      currentEntry = entry;
      soundSerial = 0;
      genericCompletionSound = false;
      pendingPoint = null;
      view.reset();
      $("mini-retry").disabled = false;
      $("micro-art").replaceChildren();
      refs = api.draw(options.svg, $("micro-art"), entry);
      if (api.input === "direct")
        refs.directInput = true;
      refs.waitsForArt = !!(refs.art || refs.story || refs.mogan || refs.tiger || refs.directInput || current.game === "wind");
      if (refs.waitsForArt)
        refs.contentState = "loading";
      surface.setAttribute("aria-busy", String(refs.waitsForArt));
      paint();
      $("wugong-tools").hidden = true;
      $("art-tools").hidden = true;
      $("mogan-tools").hidden = !refs.mogan;
      $("tiger-tools").hidden = !refs.tiger;
      $("micro-panel").setAttribute("data-tiger", String(!!refs.tiger));
      $("micro-panel").setAttribute("data-mogan", String(!!refs.mogan));
      $("micro-panel").setAttribute("data-art-game", String(!!refs.art));
      $("micro-panel").setAttribute("data-game", current.game || "");
      $("micro-panel").setAttribute("data-direct", String(directInput()));
      $("wind-hud").hidden = !current.game || !!refs.art || !!refs.mogan || !!refs.tiger || !!refs.directInput;
      const labels = { wind: "武功山 · 借风", clouds: "武功山 · 拨云见山", altar: "武功山 · 金顶石语", greet: "武功山 · 风口相遇", creek: "九溪 · 推叶", rain: "莫干山 · 接雨" };
      $("mini-place-label").textContent = current.game && current.game in labels ? labels[current.game] : "";
      $("mini-controls").hidden = !current.game && !directInput();
      options.cache?.request(entry.artV5 || entry.artV4 || entry.badge, "high");
      text("micro-place", entry.place + " · " + entry.condition);
      text("micro-title", entry.name);
      text("micro-instruction", api.instruction(entry));
      const keyHints = { puzzle: "1–6 选片，方向键选格，Enter 放下。", match: "方向键选卡，Enter 选中或交换。", sling: "方向键调整，按住空格蓄力、松开发射。", greet: "方向键取景，＋／－调整远近，空格拍照。", clouds: "方向键选择云朵，空格或 Enter 吹散。" };
      const keyHint = current.game && current.game in keyHints ? keyHints[current.game] : "";
      surface.setAttribute("aria-label", (dom.get("micro-instruction").textContent || "") + (keyHint ? " 键盘辅助：" + keyHint : ""));
      updateStatus();
      $("micro-panel").hidden = false;
      options.refresh();
      const assets = api.assets?.(entry) || current.game && (games?.artAssets[current.game] || games?.wugongAssets[current.game] || games?.waterAssets[current.game]);
      const scene = assets && assets.scene || "scenes/" + entry.route + "-v1.webp";
      const actor = entry.id === "meadow-bird" ? "sprites/wugong-swallow-kite-v1.webp" : assets && assets.actor;
      const front = entry.id === "meadow-bird" ? "sprites/wugong-meadow-grass-v1.webp" : current.game === "creek" ? assets && assets.stone : assets && assets.front;
      const sceneAsset = options.cache?.request(scene, "high") || null;
      const actorAsset = actor ? options.cache?.request(actor, "high") || null : null;
      const frontAsset = front ? options.cache?.request(front, "high") || null : null;
      const hintAsset = assets && assets.hint ? options.cache?.request(assets.hint, "high") || null : null;
      const openingRefs = refs;
      if (openingRefs.waitsForArt && !api.mount) {
        openingRefs.contentState = sceneAsset ? "loading" : "error";
        const assetsToWait = [sceneAsset, actorAsset, frontAsset].filter((asset) => !!asset);
        Promise.all(assetsToWait.map((asset) => asset.promise)).then((items) => {
          if (openingRefs.disposed || refs !== openingRefs)
            return;
          openingRefs.contentState = sceneAsset && items.every((item) => item.state === "ready") && (!actor || actorAsset) && (!front || frontAsset) ? "ready" : "error";
          surface.setAttribute("aria-busy", "false");
          updateStatus();
        });
      }
      if (api.mount) {
        const adapter = api;
        Promise.resolve().then(() => {
          if (!openingRefs.disposed && refs === openingRefs)
            return adapter.mount?.(openingRefs, { pixi: options.pixi, host: surface, cache: options.cache, entry });
        }).catch(() => {
          if (openingRefs.disposed || refs !== openingRefs)
            return;
          openingRefs.contentState = "error";
          surface.setAttribute("aria-busy", "false");
          paint();
          updateStatus();
        });
      } else
        games?.mount(openingRefs, options.pixi, surface, sceneAsset, actorAsset, frontAsset, hintAsset);
      surface.focus({ preventScroll: true });
      options.ensureLoop();
    }
    function finish2(record = true, resume = true) {
      if (!current || !currentEntry || !refs || !session)
        return;
      const finished = current, closingRefs = refs, closing = session, entry = currentEntry;
      pause();
      const outcome = record && finished.play.complete === true ? api.outcome(finished, entry) : null;
      current = null;
      currentEntry = null;
      refs = null;
      session = null;
      try {
        if (api.dispose)
          api.dispose(closingRefs);
        else
          games?.dispose(closingRefs);
      } catch {
      }
      closingRefs.disposed = true;
      $("micro-panel").hidden = true;
      options.stopLoop();
      let rewardShown = false;
      if (outcome)
        rewardShown = options.onFinished({ state: finished, entry, outcome, returnStatus: closing.returnStatus });
      scenes.leave(closing, resume && !rewardShown);
      options.onClosed?.(finished.id, finished.play.complete === true, resume);
      options.refresh();
      if (resume && !rewardShown)
        $("walk-toggle").focus({ preventScroll: true });
    }
    function update(dt) {
      if (!interactive() || !current || !refs)
        return;
      if ((refs.mogan || refs.tiger || refs.directInput) && refs.contentState !== "ready") {
        updateStatus();
        paint();
        return;
      }
      if (pendingPoint) {
        current = api.move(current, pendingPoint);
        pendingPoint = null;
      }
      current = api.tick(current, dt);
      if (!soundTheme() && current.play.complete && !genericCompletionSound) {
        genericCompletionSound = true;
        options.audio.mini?.("memory", "complete");
      }
      updateStatus();
      paint();
      if (current.done)
        finish2(true);
    }
    function point(event) {
      const rect = surface.getBoundingClientRect();
      const p2 = { x: (event.clientX - rect.left) / rect.width, y: (event.clientY - rect.top) / rect.height };
      return refs && api.point ? api.point(refs, p2) : refs && games ? games.point(refs, p2) : p2;
    }
    function retry() {
      if (!interactive() || !current || !currentEntry || current.play.complete || !refs)
        return;
      const entry = currentEntry;
      pause();
      if (refs.waitsForArt && refs.contentState === "error") {
        const returnStatus = session?.returnStatus;
        finish2(false, false);
        begin(entry, returnStatus);
        return;
      }
      current = api.create(entry, { reduced: options.reduced, weather: options.weather?.() });
      soundSerial = 0;
      genericCompletionSound = false;
      updateStatus();
      paint();
      surface.focus({ preventScroll: true });
      options.ensureLoop();
    }
    function action(name, value) {
      if (!interactive() || !current || !refs)
        return;
      if ((refs.mogan || refs.tiger || refs.directInput) && refs.contentState !== "ready")
        return;
      if (refs.art && !view.artReady(refs))
        return;
      pause();
      perform({ action: name, value });
    }
    function cancelGesture() {
      pause();
      paint();
      updateStatus();
    }
    function keydown(event) {
      if (!interactive() || !current || !refs)
        return;
      if ((current.game || directInput()) && event.key.toLowerCase() === "r") {
        event.preventDefault();
        retry();
        return;
      }
      if (event.ctrlKey || event.altKey || event.metaKey)
        return;
      const arrows = { ArrowLeft: [-0.08, 0], ArrowRight: [0.08, 0], ArrowUp: [0, -0.1], ArrowDown: [0, 0.1] };
      if (api.key) {
        if (event.repeat && !arrows[event.key]) {
          event.preventDefault();
          return;
        }
        if (!inputReady())
          return;
        const next = api.key(current, event.key, "down");
        if (next) {
          event.preventDefault();
          current = next;
          paint();
          updateStatus();
          options.ensureLoop();
        }
        return;
      }
      if (refs.art) {
        const supported = !!arrows[event.key] || ["Enter", " "].includes(event.key) || current.game === "puzzle" && /^[1-6]$/.test(event.key);
        if (!supported)
          return;
        event.preventDefault();
        if (!view.artReady(refs) || event.repeat && !arrows[event.key] || !games)
          return;
        current = games.artKey(current, event.key);
        paint();
        updateStatus();
        options.ensureLoop();
        return;
      }
      if (arrows[event.key]) {
        event.preventDefault();
        if (!inputReady())
          return;
        const [dx, dy] = arrows[event.key];
        current = api.release(api.move(current, { x: current.x + dx, y: current.y + dy, key: true, dx, dy }));
        paint();
        updateStatus();
        options.ensureLoop();
        return;
      }
      if (current.game !== "clouds" && current.game !== "greet")
        return;
      let name = null;
      if (event.key === "Enter" || event.key === " ")
        name = current.game === "clouds" ? "blow" : current.stage === "camera" ? "shutter" : current.stage === "review" && !current.capture?.ok ? "retake" : "advance";
      else if (current.game === "greet" && ["+", "=", "-", "_"].includes(event.key))
        name = ["-", "_"].includes(event.key) ? "zoom-out" : "zoom-in";
      if (!name)
        return;
      event.preventDefault();
      if (!event.repeat)
        action(name);
    }
    function bind() {
      bindings.listen($("micro-skip"), "click", () => finish2());
      bindings.listen(surface, "click", (event) => {
        if (event.detail > 0)
          return;
        perform({ assist: true });
      });
      bindings.listen(surface, "keydown", keydown);
      bindings.listen(surface, "keyup", (event) => {
        if (interactive() && current && (refs?.mogan || refs?.tiger || refs?.directInput) && api.key && inputReady()) {
          const next = api.key(current, event.key, "up");
          if (next) {
            event.preventDefault();
            current = next;
            paint();
            updateStatus();
            options.ensureLoop();
          }
          return;
        }
        if (!interactive() || !current || !refs?.art || event.key !== " " || !games)
          return;
        event.preventDefault();
        if (!view.artReady(refs))
          return;
        current = games.artKey(current, event.key, "up");
        paint();
        updateStatus();
        options.ensureLoop();
      });
      bindings.listen(surface, "pointerdown", (event) => {
        if (!inputReady() || pointer || event.isPrimary === false || event.button !== void 0 && event.button !== 0 || !current)
          return;
        event.stopPropagation?.();
        pointer = { id: event.pointerId, x: event.clientX, y: event.clientY, drag: false };
        surface.setPointerCapture?.(event.pointerId);
        if (current.game || directInput())
          perform({ ...point(event), ...refs?.art || refs?.mogan || refs?.tiger || directInput() || current.game === "clouds" ? { phase: "press" } : {} });
      });
      bindings.listen(surface, "pointermove", (event) => {
        if (!interactive() || !current)
          return;
        if (!pointer) {
          if (event.pointerType === "mouse" && api.hover && inputReady()) {
            const next = api.hover(current, point(event));
            if (next !== current) {
              current = next;
              options.ensureLoop();
            }
          }
          return;
        }
        if (pointer.id !== event.pointerId)
          return;
        event.stopPropagation?.();
        if (Math.hypot(event.clientX - pointer.x, event.clientY - pointer.y) > 8)
          pointer.drag = true;
        if (!pointer.drag)
          return;
        const input = { ...point(event), gesture: "drag" };
        if (current.game || directInput()) {
          pendingPoint = input;
          options.ensureLoop();
          return;
        }
        if (!current.acted) {
          const rect = surface.getBoundingClientRect();
          perform({ x: (pointer.x - rect.left) / rect.width, y: (pointer.y - rect.top) / rect.height, gesture: "drag" });
        }
        if (current)
          current = api.move(current, input);
        updateStatus();
        paint();
      });
      bindings.listen(surface, "pointerup", (event) => {
        if (!interactive() || !pointer || pointer.id !== event.pointerId || !current)
          return;
        event.stopPropagation?.();
        const dragged = pointer.drag, input = { ...point(event), gesture: dragged ? "drag" : "tap" };
        if (refs?.art || refs?.mogan || refs?.tiger || refs?.directInput || current.game === "clouds") {
          pendingPoint = null;
          if (dragged && refs && (view.artReady(refs) || (refs.mogan || refs.tiger || refs.directInput || current.game === "clouds") && refs.contentState === "ready"))
            current = api.move(current, input);
          perform({ ...input, phase: "release", dragged });
        } else if (dragged) {
          pendingPoint = null;
          current = api.release(api.move(current, input));
        } else
          perform(input);
        pointer = null;
        if (surface.hasPointerCapture?.(event.pointerId))
          surface.releasePointerCapture(event.pointerId);
        paint();
      });
      bindings.listen(surface, "pointercancel", cancelGesture);
      bindings.listen(surface, "lostpointercapture", (event) => {
        if (pointer?.id === event.pointerId)
          cancelGesture();
      });
      bindings.listen(surface, "blur", () => {
        if (current?.sling?.charge)
          cancelGesture();
        if (refs?.mountain || refs?.directInput) {
          cancelGesture();
          return;
        }
        if (current?.game?.startsWith("tiger-") && api.key) {
          const heldKeys = current.game === "tiger-climb" ? ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " ", "Enter"] : ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"];
          for (const key of heldKeys) {
            current = api.key(current, key, "up") || current;
          }
          paint();
          updateStatus();
        }
      });
      bindings.listen($("mini-retry"), "click", retry);
      bindings.listen($("mini-sound"), "click", async () => {
        await options.toggleSound();
        updateStatus();
      });
      bindings.listen($("art-actions"), "click", (event) => {
        const button = event.target.closest?.("button[data-action]");
        const name = button?.getAttribute("data-action");
        if (button && !button.disabled && name)
          action(name);
      });
      for (const id of ["wugong-primary", "wugong-secondary"])
        bindings.listen($(id), "click", () => {
          const name = $(id).getAttribute("data-action");
          if (name)
            action(name);
        });
      bindings.listen($("wugong-zoom-in"), "click", () => action("zoom-in"));
      bindings.listen($("wugong-zoom-out"), "click", () => action("zoom-out"));
    }
    bind();
    return {
      get state() {
        return current;
      },
      get active() {
        return current !== null;
      },
      get soundTheme() {
        return soundTheme();
      },
      begin,
      finish: finish2,
      update,
      pause,
      retry,
      action,
      /** New typed adapters can be installed without adding a dispatch branch to app.js. */
      registerGame(ids, adapter) {
        for (const id of ids)
          registered.set(id, adapter);
      },
      destroy() {
        finish2(false, false);
        bindings.destroy();
        registered.clear();
      }
    };
  }

  // .build/typescript/runtime/mogan/rules.js
  var MOGAN_GAMES = Object.freeze({ "bamboo-drop": "rain", "bamboo-step": "footsteps", "bamboo-leaf": "sling" });
  var CUP = Object.freeze({ width: 132, anchorY: 0.184, mouthY: 0.73, mouthRadius: 38 * 1.32, waterRadius: 34 * 1.32, waterDepth: 14 * 1.32 });
  var RAIN_PHRASE = Object.freeze([0, 3, 1, 4, 2, 5, 3, 1]);
  var RAIN_NOTES = Object.freeze([60, 64, 67, 64, 62, 65, 64, 60]);
  var MOGAN_TITLES = { rain: "听一筒竹林的雨", footsteps: "沿着石阶慢慢走", sling: "给远山送一枚纸叶" };
  var MOGAN_PROMPTS = {
    rain: "轻点画面开始，移动鼠标或滑动手指，让竹筒接住叶尖的雨滴。",
    footsteps: "轻点脚印出发，等脚印亮起时再点，慢慢走过石阶。",
    sling: "按住纸叶向后拉，松手送过竹隙，落在远山纸签上。"
  };
  var MOGAN_MEMORIES = {
    rain: "叶尖先亮起一颗水珠。我挪过竹筒，接住一声又一声轻响；最后一滴落下，竹林里留下了一小段雨的旋律。",
    footsteps: "我跟着石阶的长短，左脚、右脚，慢慢走过雨后的古道。苔色留在石边，十次轻轻的落脚，把山路接成了自己的节奏。",
    sling: "我把一枚纸叶放上竹弓，试着借一小段风。纸叶穿过竹隙，轻轻停在远山纸签上；林子里的那扇窗，也亮了起来。"
  };
  var clamp5 = (n, a = 0, b = 1) => Math.max(a, Math.min(b, Number.isFinite(n) ? n : a));
  var ease = (n) => {
    const t = clamp5(n);
    return t * t * (3 - 2 * t);
  };
  function createMoganState(entry, reduced, legacy, weather = "clear") {
    const kind = MOGAN_GAMES[entry.id];
    if (kind === "sling")
      return { ...legacy.create(entry, { reduced }), weather, feedback: "拉住纸叶往后，借一小段风，把它送到竹隙后的纸签。" };
    const base = {
      id: entry.id,
      route: "mogan",
      kind: entry.interaction,
      game: kind,
      weather,
      age: 0,
      acted: false,
      dragging: false,
      gesture: "look",
      done: false,
      x: 0.5,
      y: 0.73,
      play: { type: "minigame", progress: 0, complete: false, completedAt: null, reduced },
      serial: 0,
      events: [],
      feedback: MOGAN_PROMPTS[kind]
    };
    return kind === "rain" ? { ...base, game: "rain", rain: { cupX: 0.5, targetX: 0.5, caught: 0, nextIn: 0.9, attempt: 0, drop: null } } : { ...base, game: "footsteps", steps: { index: 0, clock: 0, landedAt: -10, recovery: 0, slow: false, mistakes: 0 } };
  }
  function clone(s) {
    const shared = { ...s, play: { ...s.play }, events: s.events.slice() };
    return s.game === "rain" ? { ...shared, game: "rain", rain: { ...s.rain, drop: s.rain.drop && { ...s.rain.drop } } } : { ...shared, game: "footsteps", steps: { ...s.steps } };
  }
  function emit(s, type, x = 0.5, y = 0.5, index = 0) {
    const event = { serial: ++s.serial, type, x, y, index, age: s.age };
    s.events.push(event);
    s.events = s.events.slice(-18);
    return event;
  }
  function complete(s) {
    if (s.play.complete)
      return;
    s.play.complete = true;
    s.play.progress = 1;
    s.play.completedAt = s.age;
    emit(s, "complete");
  }
  function leafTip(index, age, reduced) {
    return { x: 0.14 + index * 0.143 + (reduced ? 0 : Math.sin(age * 1.1 + index) * 6e-3), y: 0.205 + index % 3 * 0.027 + (reduced ? 0 : Math.sin(age * 0.8 + index * 1.7) * 3e-3) };
  }
  function stepFoot(index) {
    return index % 2 ? "right" : "left";
  }
  function stonePose(s, ordinal, height) {
    const moving = s.play.reduced ? 0 : 1 - ease((s.age - s.steps.landedAt) / 0.48);
    const relative = ordinal - s.steps.index + moving, q = clamp5(1 - relative / 6, 0, 1.24);
    return { x: 400 + Math.sin(ordinal * 0.73) * 24 * q, y: height * (0.18 + 0.67 * Math.pow(q, 1.7)), width: 100 + 555 * Math.pow(q, 1.6), q };
  }
  function stepSpot(s, height) {
    const index = Math.min(9, s.steps.index), p2 = stonePose(s, index, height), foot = stepFoot(index);
    return { x: p2.x + (foot === "left" ? -1 : 1) * p2.width * 0.135, y: p2.y - p2.width * 0.11, rx: p2.width * 0.12, ry: p2.width * 0.17, foot };
  }
  function stepTiming(s) {
    const length = [1.55, 1.65, 1.95, 1.55, 2.1, 1.65, 1.55, 1.9, 1.6, 2.05][Math.min(9, s.steps.index)] * (s.steps.slow ? 1.5 : 1);
    const window = s.steps.slow ? 0.62 : 0.44;
    return { length, window, open: length - window, close: length + window, progress: clamp5(s.steps.clock / length) };
  }
  function inputMogan(state, p2, legacy, mode = "tap") {
    if (state.game === "sling")
      return legacy.input(state, p2, mode);
    if (state.done || state.play.complete)
      return state;
    if (state.game === "footsteps" && (mode === "move" || p2.phase === "press" || p2.action === "outside-step"))
      return state;
    const s = clone(state), action = p2.action || (p2.assist ? state.game === "footsteps" && state.acted ? "step" : "begin" : "");
    s.gesture = mode === "move" ? "drag" : "tap";
    if (s.game === "rain") {
      if (!s.acted) {
        s.acted = true;
        emit(s, "begin");
        s.feedback = "竹筒跟着鼠标或指尖走，接住叶尖落下的雨滴。";
      }
      if (action === "left" || action === "right")
        s.rain.targetX = clamp5(s.rain.targetX + (action === "left" ? -0.09 : 0.09), 0.08, 0.92);
      else if (Number.isFinite(p2.x))
        s.rain.targetX = clamp5(p2.x, 0.08, 0.92);
      s.x = s.rain.targetX;
      s.dragging = mode === "move";
      return s;
    }
    if (action === "slow") {
      s.steps.slow = !s.steps.slow;
      s.steps.clock = 0;
      s.steps.recovery = 0;
      s.feedback = s.steps.slow ? "把脚步放慢，等脚印轻轻合上。" : "按自己的节奏，继续往上走。";
      return s;
    }
    if (!s.acted) {
      s.acted = true;
      s.steps.clock = 0;
      emit(s, "begin");
      s.feedback = "等脚印亮起，再轻轻点一下。";
      return s;
    }
    const foot = action === "step" ? stepFoot(s.steps.index) : action === "left" || action === "right" ? action : null;
    if (!foot || s.steps.recovery > 0)
      return s;
    if (foot !== stepFoot(s.steps.index)) {
      s.feedback = "这一级轮到" + (stepFoot(s.steps.index) === "left" ? "左脚" : "右脚") + "，换另一只脚试试。";
      return s;
    }
    const timing = stepTiming(s);
    if (s.steps.clock < timing.open) {
      s.feedback = "再等一点点，脚印合上时落脚。";
      return s;
    }
    if (s.steps.clock > timing.close)
      return s;
    const index = s.steps.index;
    emit(s, "step-land", foot === "left" ? 0.4 : 0.6, 0.77, index);
    s.steps.index++;
    s.steps.clock = 0;
    s.steps.landedAt = s.age;
    s.play.progress = s.steps.index / 10;
    if (s.steps.index === 10) {
      s.feedback = "十级石阶走过了，竹林里的路还在向前。";
      complete(s);
    } else
      s.feedback = "跟着下一个脚印，亮起时再轻点。";
    return s;
  }
  function rainTick(s, dt) {
    const r = s.rain, oldCupX = r.cupX;
    r.cupX += (r.targetX - r.cupX) * (1 - Math.exp(-dt * 13));
    if (!s.acted)
      return;
    if (!r.drop) {
      r.nextIn -= dt;
      if (r.nextIn <= 0) {
        const tip = leafTip(RAIN_PHRASE[r.caught], s.age, !!s.play.reduced);
        r.drop = { ...tip, speed: 0.29 };
        r.attempt++;
      }
      return;
    }
    const d = r.drop, oldY = d.y;
    d.y += d.speed * dt;
    const crossed = oldY < CUP.mouthY && d.y >= CUP.mouthY;
    if (crossed) {
      const t = (CUP.mouthY - oldY) / (d.y - oldY), cupX = oldCupX + (r.cupX - oldCupX) * t;
      if (Math.abs(d.x - cupX) < (CUP.mouthRadius - 5) / 800) {
        const note = r.caught;
        emit(s, "catch", d.x, CUP.mouthY, note).offsetX = d.x - cupX;
        r.caught++;
        s.caught = r.caught;
        s.play.progress = r.caught / RAIN_PHRASE.length;
        r.drop = null;
        r.nextIn = r.caught === 4 ? 1.6 : 0.85;
        s.feedback = r.caught === 4 ? "前半句接住了，听雨声留一个小小的停顿。" : "接住第 " + r.caught + " 个声音，下一颗水珠正在叶尖等你。";
        if (r.caught === RAIN_PHRASE.length) {
          s.feedback = "最后一滴落进竹筒，八个声音合成了这段竹林回忆。";
          complete(s);
        }
        return;
      }
    }
    if (d.y > 0.94) {
      emit(s, "rain-miss", d.x, 0.94, r.caught);
      r.drop = null;
      r.nextIn = 1.1;
      s.feedback = "这滴落回了石阶。同一个声音还会再来，不用着急。";
    }
  }
  function tickMogan(state, dt, legacy) {
    if (state.game === "sling")
      return legacy.tick(state, dt);
    if (state.done || !Number.isFinite(dt) || dt <= 0)
      return state;
    const s = clone(state);
    let remaining = Math.min(0.25, dt);
    while (remaining > 1e-8) {
      const step = Math.min(remaining, 1 / 120);
      remaining -= step;
      s.age += step;
      if (s.play.complete) {
        s.done = s.age - (s.play.completedAt ?? s.age) >= (s.play.reduced ? 0.45 : 2.35);
        continue;
      }
      if (s.game === "rain")
        rainTick(s, step);
      else if (s.acted) {
        if (s.steps.recovery > 0) {
          s.steps.recovery = Math.max(0, s.steps.recovery - step);
          continue;
        }
        if (s.age - s.steps.landedAt < 0.35)
          continue;
        s.steps.clock += step;
        if (s.steps.clock > stepTiming(s).close) {
          s.steps.clock = 0;
          s.steps.recovery = 0.65;
          s.steps.mistakes++;
          s.feedback = "在这一级歇一歇，等脚印再合上。走过的路都还在。";
          emit(s, "step-miss", stepFoot(s.steps.index) === "left" ? 0.4 : 0.6, 0.77);
        }
      }
    }
    return s;
  }
  function releaseMogan(s, legacy) {
    return s.game === "sling" ? legacy.release(s) : { ...s, dragging: false };
  }
  function keyMogan(s, key, phase, legacy) {
    if (s.game === "sling")
      return ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Enter", " "].includes(key) ? legacy.key(s, key, phase) : null;
    if (phase === "up")
      return null;
    if (s.game === "rain" && ["ArrowLeft", "ArrowRight", "a", "A", "d", "D"].includes(key))
      return inputMogan(s, { action: ["ArrowLeft", "a", "A"].includes(key) ? "left" : "right" }, legacy);
    if (s.game === "footsteps" && ["ArrowLeft", "ArrowRight", "a", "A", "d", "D"].includes(key))
      return inputMogan(s, { action: ["ArrowLeft", "a", "A"].includes(key) ? "left" : "right" }, legacy);
    if (key === "Enter" || key === " ")
      return inputMogan(s, { action: s.game === "footsteps" && s.acted ? "step" : "begin" }, legacy);
    return null;
  }

  // .build/typescript/runtime/mogan/assets.js
  var MOGAN_PROPS = {
    "file": "sprites/mogan-props-v1.webp",
    "width": 1024,
    "height": 1024,
    "frames": [
      {
        "name": "moss-granite-step",
        "x": 16,
        "y": 177,
        "w": 480,
        "h": 158
      },
      {
        "name": "left-hiking-shoe",
        "x": 651,
        "y": 16,
        "w": 233,
        "h": 480
      },
      {
        "name": "right-hiking-shoe",
        "x": 139,
        "y": 528,
        "w": 233,
        "h": 480
      },
      {
        "name": "bamboo-sprig",
        "x": 528,
        "y": 549,
        "w": 480,
        "h": 437
      }
    ],
    "tip": {
      "x": 0.95,
      "y": 0.9839816933638444
    }
  };
  var SHARED_PROPS = {
    "file": "sprites/art-play-props-v1.webp",
    "width": 1536,
    "height": 768,
    "frames": [
      {
        "name": "closed-tea-bud",
        "x": 99,
        "y": 26,
        "w": 169,
        "h": 350
      },
      {
        "name": "paired-tea-leaves",
        "x": 393,
        "y": 75,
        "w": 367,
        "h": 282
      },
      {
        "name": "broad-tea-leaf",
        "x": 810,
        "y": 80,
        "w": 317,
        "h": 274
      },
      {
        "name": "three-leaf-fan",
        "x": 1161,
        "y": 34,
        "w": 352,
        "h": 333
      },
      {
        "name": "bamboo-fork",
        "x": 82,
        "y": 399,
        "w": 241,
        "h": 339
      },
      {
        "name": "paper-leaf",
        "x": 447,
        "y": 457,
        "w": 269,
        "h": 246
      },
      {
        "name": "bamboo-stalk",
        "x": 918,
        "y": 393,
        "w": 86,
        "h": 353
      },
      {
        "name": "mountain-paper-label",
        "x": 1253,
        "y": 398,
        "w": 170,
        "h": 326
      }
    ]
  };

  // .build/typescript/runtime/hint-asset.js
  var HINT_ART = {
    "file": "sprites/hint-brush-v1.webp",
    "width": 384,
    "height": 96,
    "tip": {
      "x": 0.9921875,
      "y": 0.4635416666666667
    }
  };

  // .build/typescript/runtime/hint-art.js
  function hintPose(key, at, width = 96, rotation = 0, alpha = 1) {
    return { key, x: at.x, y: at.y, width, rotation, alpha };
  }
  var pencilPaths = [
    [[20, 61], [84, 60], [151, 52], [220, 44], [295, 44], [380, 45]],
    [[332, 16], [348, 29], [380, 45], [347, 61], [329, 78]]
  ];
  var attrs = (node2, values) => {
    for (const [key, value] of Object.entries(values))
      if (node2.getAttribute(key) !== String(value))
        node2.setAttribute(key, String(value));
  };
  function createSvgHints(svg, parent) {
    const root = svg("g", { "pointer-events": "none", "aria-hidden": "true", "data-hint-style": "watercolor-brush" }, parent);
    const nodes = /* @__PURE__ */ new Map();
    let disposed = false;
    return {
      paint(poses) {
        if (disposed)
          return;
        for (const node2 of nodes.values())
          attrs(node2, { display: "none" });
        for (const pose of poses) {
          let node2 = nodes.get(pose.key);
          if (!node2) {
            node2 = svg("g", {}, root);
            nodes.set(pose.key, node2);
            const pencil = svg("g", {}, node2);
            for (const [color, width] of [["#fff9e9", 17], ["#647955", 7]]) {
              for (const points of pencilPaths)
                svg("polyline", { points: points.map((p2) => p2.join(",")).join(" "), fill: "none", stroke: color, "stroke-width": width, "stroke-linecap": "round", "stroke-linejoin": "round" }, pencil);
            }
            const image = svg("image", { width: HINT_ART.width, height: HINT_ART.height, preserveAspectRatio: "xMidYMid meet" }, node2);
            image.addEventListener("load", () => {
              if (!disposed)
                attrs(pencil, { display: "none" });
            });
            image.addEventListener("error", () => {
              if (!disposed) {
                attrs(image, { display: "none" });
                attrs(pencil, { display: "" });
              }
            });
            image.setAttribute("href", HINT_ART.file);
          }
          attrs(node2, { display: "", opacity: pose.alpha, transform: "translate(" + pose.x + " " + pose.y + ") rotate(" + pose.rotation * 180 / Math.PI + ") scale(" + pose.width / HINT_ART.width + ") translate(" + -HINT_ART.tip.x * HINT_ART.width + " " + -HINT_ART.tip.y * HINT_ART.height + ")" });
        }
      },
      dispose() {
        if (disposed)
          return;
        disposed = true;
        root.remove();
        nodes.clear();
      }
    };
  }
  function createPixiHints(P, parent, entry, changed) {
    const root = new P.Container();
    root.label = "watercolor-hints";
    root.eventMode = "none";
    parent.addChild(root);
    const nodes = /* @__PURE__ */ new Map();
    let disposed = false, texture = null;
    if (entry)
      entry.promise.then((item) => {
        if (disposed || item.state !== "ready")
          return;
        try {
          texture = P.Texture.from(item.image, true);
          for (const node2 of nodes.values()) {
            node2.sprite.texture = texture;
            node2.sprite.visible = true;
            node2.pencil.visible = false;
          }
          changed?.();
        } catch {
        }
      }).catch(() => {
      });
    return {
      paint(poses) {
        if (disposed)
          return;
        for (const node2 of nodes.values())
          node2.root.visible = false;
        for (const pose of poses) {
          let node2 = nodes.get(pose.key);
          if (!node2) {
            const group = new P.Container(), pencil = new P.Graphics(), sprite3 = new P.Sprite(texture || P.Texture.EMPTY);
            for (const [color, width] of [[16775657, 17], [6584661, 7]])
              for (const points of pencilPaths) {
                pencil.moveTo(points[0][0], points[0][1]);
                for (const point of points.slice(1))
                  pencil.lineTo(point[0], point[1]);
                pencil.stroke({ color, width, cap: "round", join: "round" });
              }
            sprite3.visible = !!texture;
            pencil.visible = !texture;
            group.addChild(pencil, sprite3);
            root.addChild(group);
            nodes.set(pose.key, node2 = { root: group, sprite: sprite3, pencil });
          }
          node2.root.visible = true;
          node2.root.position.set(pose.x, pose.y);
          node2.root.rotation = pose.rotation;
          node2.root.pivot.set(HINT_ART.tip.x * HINT_ART.width, HINT_ART.tip.y * HINT_ART.height);
          node2.root.scale.set(pose.width / HINT_ART.width);
          node2.root.alpha = pose.alpha;
        }
      },
      dispose() {
        if (disposed)
          return;
        disposed = true;
        root.destroy({ children: true });
        texture?.destroy(true);
        texture = null;
        nodes.clear();
      }
    };
  }

  // .build/typescript/runtime/mogan/scene-model.js
  var stageBounds = (height) => {
    const side = Math.min(800, height * 0.98);
    return { x: (800 - side) / 2, y: (height - side) / 2, w: side, h: side };
  };
  function ellipse(list, x, y, rx, ry, color, alpha = 1, stroke) {
    list.push({ type: "ellipse", x, y, rx, ry, color, alpha, stroke });
  }
  function line(list, points, color, stroke, alpha = 1) {
    list.push({ type: "line", points, color, stroke, alpha });
  }
  function sprite(frame, key, resource, at, width, options = {}) {
    frame.sprites.push({ key, resource, x: at.x, y: at.y, width, anchorX: 0.5, anchorY: 0.5, rotation: 0, alpha: 1, flip: false, bend: 0, ...options });
  }
  function rain(frame, s, height) {
    const r = s.rain, x = r.cupX * 800, y = CUP.mouthY * height;
    for (let i = 0; i < 6; i++) {
      const tip = leafTip(i, s.age, !!s.play.reduced);
      sprite(frame, "rain-leaf-" + i, "front", { x: tip.x * 800, y: tip.y * height }, 148, { frame: 3, anchorX: MOGAN_PROPS.tip.x, anchorY: MOGAN_PROPS.tip.y, alpha: 0.93 });
    }
    const next = leafTip(RAIN_PHRASE[Math.min(7, r.caught)], s.age, !!s.play.reduced), growing = clamp5(1 - r.nextIn / 0.85);
    if (!r.drop && !s.play.complete) {
      ellipse(frame.effects, next.x * 800, next.y * height + 2, 2.3 + growing * 3.3, 3.5 + growing * 5, "#d0e5d8", 0.92);
      ellipse(frame.effects, next.x * 800 - 1, next.y * height, 1.1, 2, "#fffcee", 0.95);
      if (s.acted)
        line(frame.ambient, [{ x: next.x * 800 - 14, y: y + 3 }, { x: next.x * 800 - 2, y: y + 1 }, { x: next.x * 800 + 13, y: y + 3 }], "#e8eee2", 1.5, 0.35);
    }
    const shadowY = y + CUP.width * 480 / 386 * (1 - CUP.anchorY);
    ellipse(frame.ambient, x + 3, shadowY + 3, 57, 9, "#224b42", 0.14);
    sprite(frame, "cup", "actor", { x, y }, CUP.width, { anchorY: CUP.anchorY });
    frame.clip = { x, y, rx: CUP.mouthRadius - 3, ry: 18 };
    const waterY = y + 4 - r.caught * 0.5;
    ellipse(frame.water, x, waterY, CUP.waterRadius, CUP.waterDepth, "#6aab99", 0.26 + r.caught * 0.025);
    ellipse(frame.water, x, waterY, CUP.waterRadius - 2, CUP.waterDepth - 2, "#e3efd5", 0.52, 1);
    for (const e of s.events) {
      const age = s.age - e.age;
      if (e.type !== "catch" || age < 0 || age > 0.8)
        continue;
      const q = age / 0.8, impactX = x + (e.offsetX ?? 0) * 800;
      ellipse(frame.water, impactX * (1 - q) + x * q, waterY, 3 + q * 41, 2 + q * 15, "#fff6d7", 1 - q, 1.6);
      if (!s.play.reduced)
        for (let j = 0; j < 5; j++) {
          ellipse(frame.effects, impactX + (j - 2) * q * 12, y - Math.sin(q * Math.PI) * (14 + j % 2 * 8), 1.3, 2.1, "#e6f2dc", (1 - q) * 0.85);
        }
    }
    if (r.drop && !s.play.complete) {
      const d = r.drop;
      ellipse(frame.effects, d.x * 800, d.y * height, 4.5, 8, "#bedfd5", 0.98);
      ellipse(frame.effects, d.x * 800 - 1, d.y * height - 2, 1.2, 3.5, "#fffceb", 0.93);
    }
  }
  function footsteps(frame, s, height) {
    const step = s.steps, target = Math.min(9, step.index), timing = stepTiming(s), resource = "actor";
    for (let ordinal = Math.min(9, step.index + 6); ordinal >= Math.max(0, step.index - 1); ordinal--) {
      const p2 = stonePose(s, ordinal, height);
      if (p2.y > height * 1.35)
        continue;
      sprite(frame, "stone-" + ordinal, resource, p2, p2.width, { frame: 0, alpha: 0.56 + p2.q * 0.4 });
      const landed = ordinal < step.index;
      if (landed || ordinal === target && !s.play.complete) {
        const left = stepFoot(ordinal) === "left", x = p2.x + (left ? -1 : 1) * p2.width * 0.135, y = p2.y - p2.width * 0.05;
        const ready = !s.acted || step.clock >= timing.open;
        sprite(frame, "shoe-" + ordinal, resource, { x, y }, p2.width * 0.112, { frame: left ? 1 : 2, anchorY: 0.78, rotation: left ? -0.035 : 0.035, alpha: landed ? 0.76 : ready ? 0.98 : 0.42 + timing.progress * 0.16 });
        if (!landed && !step.recovery) {
          const spot = stepSpot(s, height);
          frame.hints.push(hintPose("next-footstep", { x: spot.x + (left ? -1 : 1) * spot.rx * 0.5, y: spot.y }, clamp5(p2.width * 0.17, 64, 100), left ? 0 : Math.PI, ready ? 0.95 : 0.2));
        }
      }
    }
    sprite(frame, "path-branch-left", resource, { x: 0, y: height * 0.15 }, 210, { frame: 3, anchorX: 0.15, anchorY: 0.2, rotation: -0.2, alpha: 0.75, bend: s.play.reduced ? 0 : Math.sin(s.age * 0.8) * 4 });
    sprite(frame, "path-branch-right", resource, { x: 800, y: height * 0.32 }, 180, { frame: 3, anchorX: 0.15, anchorY: 0.2, rotation: 0.2, flip: true, alpha: 0.8, bend: s.play.reduced ? 0 : Math.sin(s.age * 0.9 + 1) * 4 });
    const recent = s.events.filter((e) => e.type === "step-land").at(-1), age = recent ? s.age - recent.age : 9;
    if (recent && age < 0.55 && !s.play.reduced) {
      const p2 = stonePose(s, recent.index ?? 0, height), x = p2.x + ((recent.index ?? 0) % 2 ? 1 : -1) * p2.width * 0.135;
      const y = p2.y - p2.width * 0.04;
      for (const side of [-1, 1])
        line(frame.effects, [{ x: x + side * 16, y: y + 9 }, { x: x + side * 25, y: y + 7 }, { x: x + side * 32, y: y + 10 }], "#e5e9d5", 2, 0.55 * (1 - age / 0.55));
    }
  }
  function sling(frame, s, height, legacy) {
    const b = stageBounds(height), toWorld = (p2) => ({ x: b.x + p2.x * b.w, y: b.y + p2.y * b.h }), q = s.sling;
    for (const [i, obstacle] of legacy.obstacles.entries()) {
      const source2 = SHARED_PROPS.frames[6], at = toWorld(obstacle);
      sprite(frame, "bamboo-stalk-" + i, "actor", at, obstacle.h * b.w * source2.w / source2.h, { frame: 6, anchorX: 0, anchorY: 0 });
    }
    const target = toWorld(legacy.target), labelFrame = SHARED_PROPS.frames[7];
    sprite(frame, "paper-label", "actor", target, legacy.target.h * b.w * labelFrame.w / labelFrame.h, { frame: 7, anchorX: 0, anchorY: 0 });
    const forkFrame = SHARED_PROPS.frames[4], forkWidth = 0.26 * b.w * forkFrame.w / forkFrame.h;
    const fork = { x: b.x + legacy.slingOrigin.x * b.w, y: b.y + 0.685 * b.h };
    sprite(frame, "bamboo-fork", "actor", fork, forkWidth, { frame: 4, anchorY: 0 });
    let pouch = legacy.aimPouch(s);
    if (q.stage !== "ready") {
      const t = s.play.reduced ? 10 : s.age - (q.releasedAt ?? q.at), spring = Math.exp(-t * 11) * Math.cos(t * 26);
      pouch = { x: legacy.slingOrigin.x + (pouch.x - legacy.slingOrigin.x) * spring, y: legacy.slingOrigin.y + (pouch.y - legacy.slingOrigin.y) * spring };
    }
    const ends = [{ x: fork.x - forkWidth * 0.33, y: fork.y + b.h * 0.0156 }, toWorld(pouch), { x: fork.x + forkWidth * 0.33, y: fork.y + b.h * 0.0156 }];
    line(frame.effects, ends, "#5c634b", 3, 0.93);
    line(frame.effects, ends.map((p2) => ({ x: p2.x, y: p2.y - 1 })), "#e8dab4", 0.85, 0.83);
    const leaf2 = q.shot || legacy.aimPouch(s), angle = q.shot ? Math.atan2(q.shot.vy, q.shot.vx || 1e-3) * 0.3 : -0.25;
    sprite(frame, "paper-leaf", "actor", toWorld(leaf2), 0.057 * b.w, { frame: 5, rotation: angle + (s.play.reduced ? 0 : q.stage === "flight" ? Math.sin(s.age * 8) * 0.06 : 0) });
    if (q.stage === "ready" && !q.aiming && !s.play.complete) {
      const handle = toWorld(leaf2);
      frame.hints.push(hintPose("pull-paper-leaf", { x: handle.x - 16, y: handle.y + 10 }, 88, -0.55, s.play.reduced ? 0.9 : 0.82 + Math.sin(s.age * 1.5) * 0.08));
    }
    if (q.stage === "ready" && !s.play.complete)
      for (const [i, p2] of legacy.preview(s, 18).entries()) {
        const world = toWorld(p2);
        ellipse(frame.effects, world.x, world.y, 2, 2, "#fff9dc", 0.75 * (1 - i / 23));
      }
    if (q.trail.length > 1 && !s.play.reduced)
      line(frame.effects, q.trail.map(toWorld), "#fff4d7", 1.3, 0.25);
    sprite(frame, "sling-canopy-left", "front", { x: 30, y: height * 0.08 }, 235, { frame: 3, anchorX: 0.12, anchorY: 0.1, alpha: 0.75, bend: s.play.reduced ? 0 : Math.sin(s.age * 0.85) * 6 });
    sprite(frame, "sling-canopy-right", "front", { x: 800, y: height * 0.11 }, 215, { frame: 3, anchorX: 0.15, anchorY: 0.1, flip: true, alpha: 0.8, bend: s.play.reduced ? 0 : Math.sin(s.age * 0.7 + 1) * 5 });
    const caught = s.events.filter((e) => e.type === "sling-catch").at(-1), age = caught ? s.age - caught.age : 9;
    if (caught && age < 1.5) {
      const center = toWorld(caught), amount = s.play.reduced ? 0.6 : age / 1.5;
      ellipse(frame.effects, center.x, center.y, 12 + amount * 54, 10 + amount * 37, "#f7e2ad", 1 - amount, 1.6);
    }
  }
  function moganFrame(s, height, legacy) {
    const elapsed = s.play.complete ? s.age - (s.play.completedAt ?? s.age) : 0;
    const frame = { sprites: [], ambient: [], water: [], effects: [], hints: [], clip: null, alpha: s.play.reduced ? 1 : 0.5 + 0.5 * ease(s.age / 0.65), paper: s.play.complete ? s.play.reduced ? 1 : ease((elapsed - 0.65) / 1.2) : 0 };
    sprite(frame, "background", "scene", { x: 400, y: height / 2 }, Math.max(800, height * 1280 / 720));
    if (s.weather === "fog") {
      frame.ambient.push({ type: "rect", x: 0, y: 0, w: 800, h: height, color: "#e3eadc", alpha: 0.23 });
      ellipse(frame.ambient, 455, height * 0.42, 500, height * 0.14, "#f1f3e9", 0.19);
    } else if (s.weather === "rain" || s.weather === "storm") {
      frame.ambient.push({ type: "rect", x: 0, y: 0, w: 800, h: height, color: "#728c82", alpha: s.weather === "storm" ? 0.28 : 0.16 });
      if (!s.play.reduced)
        for (let i = 0; i < 14; i++) {
          const px = (i * 91 + s.age * 5) % 840 - 20, py = (i * 69 + s.age * 105) % height;
          line(frame.effects, [{ x: px, y: py }, { x: px - 1, y: py + 8 }], "#edf5e3", 1, 0.16);
        }
    }
    if (s.game === "rain")
      rain(frame, s, height);
    else if (s.game === "footsteps")
      footsteps(frame, s, height);
    else
      sling(frame, s, height, legacy);
    return frame;
  }
  var chapterNames = { rain: "竹涛一阵", footsteps: "古道留痕", sling: "林隙远山" };

  // .build/typescript/runtime/mogan/scene.js
  var MOGAN_BACKGROUND = "scenes/mogan-v1.webp";
  var MOGAN_ROUTE_ASSETS = [MOGAN_BACKGROUND, "sprites/bamboo-cup-v2.webp", MOGAN_PROPS.file, SHARED_PROPS.file, HINT_ART.file];
  function moganAssets(game) {
    return { scene: MOGAN_BACKGROUND, actor: game === "rain" ? "sprites/bamboo-cup-v2.webp" : game === "footsteps" ? MOGAN_PROPS.file : SHARED_PROPS.file, hint: HINT_ART.file, ...game === "footsteps" ? {} : { front: MOGAN_PROPS.file } };
  }
  function source(game, resource) {
    if (resource === "scene")
      return { file: MOGAN_BACKGROUND, width: 1280, height: 720 };
    if (resource === "front" || game === "footsteps")
      return MOGAN_PROPS;
    return game === "rain" ? { file: "sprites/bamboo-cup-v2.webp", width: 386, height: 480 } : SHARED_PROPS;
  }
  function region(game, pose) {
    const image = source(game, pose.resource);
    return pose.frame === void 0 ? { x: 0, y: 0, w: image.width, h: image.height } : image.frames[pose.frame];
  }
  var attrs2 = (node2, values) => {
    for (const [name, value] of Object.entries(values))
      if (node2.getAttribute(name) !== String(value))
        node2.setAttribute(name, String(value));
  };
  var sequence = 0;
  function fallback(svg, parent, game) {
    const root = svg("g", {}, parent), defs = svg("defs", {}, root), clipId = "mogan-water-" + ++sequence;
    const clip = svg("clipPath", { id: clipId }, defs), clipEllipse = svg("ellipse", {}, clip);
    const background = svg("g", {}, root), ambient = svg("g", {}, root), actors = svg("g", {}, root), water2 = svg("g", { "clip-path": "url(#" + clipId + ")" }, root), effects = svg("g", {}, root);
    const hints = createSvgHints(svg, root);
    const paper2 = svg("rect", { x: 0, y: 0, width: 800, height: 800, fill: "#fff8e6", opacity: 0 }, root);
    const nodes = /* @__PURE__ */ new Map(), pools = /* @__PURE__ */ new Map();
    let lastOrder = "";
    function shapes(layer, items) {
      const pool = pools.get(layer) || [];
      pools.set(layer, pool);
      items.forEach((shape, i) => {
        const tag = shape.type === "line" ? "polyline" : shape.type;
        let node2 = pool[i];
        if (node2?.tagName.toLowerCase() !== tag) {
          const next = svg(tag, {}, layer);
          node2?.remove();
          pool[i] = node2 = next;
        }
        if (!node2)
          pool[i] = node2 = svg(tag, {}, layer);
        attrs2(node2, { opacity: Math.max(0, Math.min(1, shape.alpha)), fill: shape.stroke ? "none" : shape.color, stroke: shape.stroke ? shape.color : "none", "stroke-width": shape.stroke || 0, "stroke-linecap": "round", "stroke-linejoin": "round", display: "" });
        if (shape.type === "ellipse")
          attrs2(node2, { cx: shape.x, cy: shape.y, rx: Math.max(0, shape.rx), ry: Math.max(0, shape.ry) });
        else if (shape.type === "rect")
          attrs2(node2, { x: shape.x, y: shape.y, width: shape.w, height: shape.h });
        else
          attrs2(node2, { points: shape.points.map((p2) => p2.x + "," + p2.y).join(" ") });
      });
      for (let i = items.length; i < pool.length; i++)
        attrs2(pool[i], { display: "none" });
    }
    return {
      paint(frame, height) {
        parent.setAttribute("viewBox", "0 0 800 " + height);
        attrs2(root, { opacity: frame.alpha });
        for (const node2 of nodes.values())
          attrs2(node2, { display: "none" });
        for (const pose of frame.sprites) {
          const spec = source(game, pose.resource), box = region(game, pose);
          let node2 = nodes.get(pose.key);
          if (!node2) {
            node2 = svg("svg", { overflow: "hidden", preserveAspectRatio: "none", viewBox: [box.x, box.y, box.w, box.h].join(" ") }, pose.key === "background" ? background : actors);
            svg("image", { href: spec.file, width: spec.width, height: spec.height }, node2);
            nodes.set(pose.key, node2);
          }
          const height2 = pose.width * box.h / box.w;
          attrs2(node2, { x: -pose.anchorX * pose.width, y: -pose.anchorY * height2, width: pose.width, height: height2, display: "", opacity: Math.min(1, pose.alpha), transform: "translate(" + pose.x + " " + pose.y + ") rotate(" + pose.rotation * 180 / Math.PI + ") scale(" + (pose.flip ? -1 : 1) + " 1)" });
        }
        const order = frame.sprites.filter((pose) => pose.key !== "background").map((pose) => pose.key).join("|");
        if (order !== lastOrder) {
          for (const pose of frame.sprites)
            if (pose.key !== "background")
              actors.appendChild(nodes.get(pose.key));
          lastOrder = order;
        }
        shapes(ambient, frame.ambient);
        shapes(water2, frame.water);
        shapes(effects, frame.effects);
        hints.paint(frame.hints);
        if (frame.clip)
          attrs2(clipEllipse, { cx: frame.clip.x, cy: frame.clip.y, rx: frame.clip.rx, ry: frame.clip.ry });
        attrs2(paper2, { height, opacity: frame.paper * 0.26 });
      },
      dispose() {
        hints.dispose();
        root.remove();
        nodes.clear();
        pools.clear();
      }
    };
  }
  async function renderer(P, host, game, resources, hintAsset, height, displayWidth, cancelled, onLost) {
    const app = new P.Application();
    const resolution = (width) => Math.min(2, Math.max(0.5, width / 800 * Math.min(2, globalThis.devicePixelRatio || 1)));
    let disposed = false;
    const textures = /* @__PURE__ */ new Map(), crops = /* @__PURE__ */ new Map(), nodes = /* @__PURE__ */ new Map();
    let lastOrder = "";
    let hints = null;
    const background = new P.Container(), ambient = new P.Graphics(), actors = new P.Container(), water2 = new P.Graphics(), mask = new P.Graphics(), effects = new P.Graphics(), paper2 = new P.Graphics();
    function dispose() {
      if (disposed)
        return;
      disposed = true;
      hints?.dispose();
      hints = null;
      try {
        app.destroy(true, { children: true });
      } catch {
      }
      for (const crop of crops.values())
        crop.destroy(false);
      for (const texture of textures.values())
        texture.destroy(true);
      crops.clear();
      textures.clear();
      nodes.clear();
    }
    try {
      let shapes2 = function(graphic, items) {
        graphic.clear();
        for (const shape of items) {
          if (shape.type === "ellipse")
            graphic.ellipse(shape.x, shape.y, Math.max(0, shape.rx), Math.max(0, shape.ry));
          else if (shape.type === "rect")
            graphic.rect(shape.x, shape.y, shape.w, shape.h);
          else {
            if (!shape.points.length)
              continue;
            graphic.moveTo(shape.points[0].x, shape.points[0].y);
            for (const p2 of shape.points.slice(1))
              graphic.lineTo(p2.x, p2.y);
          }
          const style = { color: parseInt(shape.color.slice(1), 16), alpha: Math.max(0, Math.min(1, shape.alpha)) };
          if (shape.stroke)
            graphic.stroke({ ...style, width: shape.stroke, cap: "round", join: "round" });
          else
            graphic.fill(style);
        }
      };
      var shapes = shapes2;
      await app.init({ width: 800, height, resolution: resolution(displayWidth), autoDensity: true, antialias: true, autoStart: false, preference: "webgl", backgroundAlpha: 0 });
      if (cancelled()) {
        dispose();
        return null;
      }
      app.stage.eventMode = "none";
      app.stage.addChild(background, ambient, actors, water2, mask, effects, paper2);
      water2.mask = mask;
      hints = createPixiHints(P, app.stage, hintAsset, () => {
        if (!disposed)
          app.render();
      });
      app.stage.addChild(paper2);
      for (const [key, entry] of resources) {
        const texture = P.Texture.from(entry.image, true);
        textures.set(key, texture);
        if (app.renderer.prepare)
          await app.renderer.prepare.upload(texture);
        else
          app.renderer.texture.bind(texture);
        if (cancelled()) {
          dispose();
          return null;
        }
      }
      app.canvas.className = "mini-game-canvas mogan-canvas";
      app.canvas.setAttribute("aria-hidden", "true");
      app.canvas.setAttribute("data-ready", "true");
      app.canvas.addEventListener("webglcontextlost", (event) => {
        event.preventDefault();
        dispose();
        onLost();
      });
      host.appendChild(app.canvas);
      return {
        canvas: app.canvas,
        paint(frame, height2, displayWidth2) {
          if (disposed)
            return;
          const scale = resolution(displayWidth2);
          if (app.screen.height !== height2 || Math.abs(app.renderer.resolution - scale) > 0.015)
            app.renderer.resize(800, height2, scale);
          app.stage.alpha = frame.alpha;
          for (const record of nodes.values())
            record.node.visible = false;
          for (const pose of frame.sprites) {
            const box = region(game, pose), id = pose.resource + ":" + (pose.frame ?? "full");
            let texture = crops.get(id);
            if (!texture) {
              const parent = textures.get(pose.resource);
              if (!parent)
                continue;
              texture = pose.frame === void 0 ? parent : new P.Texture({ source: parent.source, frame: new P.Rectangle(box.x, box.y, box.w, box.h) });
              if (pose.frame !== void 0)
                crops.set(id, texture);
            }
            let record = nodes.get(pose.key);
            if (!record) {
              const node3 = pose.frame === 3 ? new P.MeshPlane({ texture, verticesX: 7, verticesY: 5 }) : new P.Sprite(texture);
              record = { node: node3, texture, ...node3 instanceof P.MeshPlane ? { original: new Float32Array(node3.geometry.getBuffer("aPosition").data) } : {} };
              (pose.key === "background" ? background : actors).addChild(node3);
              nodes.set(pose.key, record);
            }
            const node2 = record.node;
            node2.visible = true;
            node2.position.set(pose.x, pose.y);
            node2.pivot.set(box.w * pose.anchorX, box.h * pose.anchorY);
            node2.scale.set(pose.width / box.w * (pose.flip ? -1 : 1), pose.width / box.w);
            node2.rotation = pose.rotation;
            node2.alpha = Math.min(1, pose.alpha);
            if (record.original && node2 instanceof P.MeshPlane) {
              const buffer = node2.geometry.getBuffer("aPosition"), values = buffer.data;
              for (let i = 0; i < values.length; i += 2) {
                values[i] = record.original[i];
                values[i + 1] = record.original[i + 1] + Math.sin(record.original[i] / box.w * Math.PI * 2) * pose.bend * record.original[i + 1] / box.h;
              }
              buffer.update();
            }
          }
          const order = frame.sprites.filter((pose) => pose.key !== "background").map((pose) => pose.key).join("|");
          if (order !== lastOrder) {
            let i = 0;
            for (const pose of frame.sprites)
              if (pose.key !== "background")
                actors.setChildIndex(nodes.get(pose.key).node, i++);
            lastOrder = order;
          }
          shapes2(ambient, frame.ambient);
          shapes2(water2, frame.water);
          shapes2(effects, frame.effects);
          hints?.paint(frame.hints);
          mask.clear();
          if (frame.clip)
            mask.ellipse(frame.clip.x, frame.clip.y, frame.clip.rx, frame.clip.ry).fill(16777215);
          paper2.clear();
          if (frame.paper)
            paper2.rect(0, 0, 800, height2).fill({ color: 16775398, alpha: frame.paper * 0.26 });
          app.render();
        },
        dispose
      };
    } catch (error) {
      console.warn("Mogan renderer uses the watercolor fallback:", error);
      dispose();
      return null;
    }
  }
  function drawMogan(svg, parent, game) {
    parent.removeAttribute("visibility");
    parent.setAttribute("viewBox", "0 0 800 800");
    return { mogan: true, game, parent, fallback: fallback(svg, parent, game), height: 800, displayWidth: 800, loaded: false, gpu: null, resize: null, latest: null, host: null, waitsForArt: true, contentState: "loading", disposed: false };
  }
  function paintMogan(refs, state, legacy) {
    if (refs.disposed)
      return;
    refs.latest = state;
    if (!refs.loaded)
      return;
    const frame = moganFrame(state, refs.height, legacy);
    if (refs.gpu) {
      try {
        refs.gpu.paint(frame, refs.height, refs.displayWidth);
        refs.parent.setAttribute("visibility", "hidden");
        return;
      } catch {
        refs.gpu.dispose();
        refs.gpu = null;
      }
    }
    refs.parent.setAttribute("visibility", "visible");
    refs.fallback.paint(frame, refs.height);
  }
  async function mountMogan(refs, host, cache, pixi, legacy) {
    refs.host = host;
    const resize = () => {
      if (refs.disposed)
        return;
      const box = host.getBoundingClientRect();
      refs.displayWidth = box.width > 0 ? box.width : 800;
      refs.height = box.width > 0 ? Math.max(320, Math.round(800 * box.height / box.width)) : 800;
      if (refs.latest)
        paintMogan(refs, refs.latest, legacy);
    };
    resize();
    if (globalThis.ResizeObserver) {
      refs.resize = new ResizeObserver(resize);
      refs.resize.observe(host);
    }
    const resources = /* @__PURE__ */ new Map(), assets = moganAssets(refs.game);
    const hintAsset = cache?.request(assets.hint, "high") || null;
    for (const key of ["scene", "actor", "front"]) {
      const file = assets[key];
      if (!file)
        continue;
      const entry = cache?.request(file, "high");
      if (!entry) {
        refs.contentState = "error";
        return;
      }
      resources.set(key, entry);
    }
    await Promise.all([...resources.values()].map((entry) => entry.promise));
    if (refs.disposed)
      return;
    if ([...resources.values()].some((entry) => entry.state !== "ready")) {
      refs.contentState = "error";
      return;
    }
    refs.loaded = true;
    if (refs.latest)
      paintMogan(refs, refs.latest, legacy);
    const P = pixi;
    if (typeof P?.Application === "function") {
      await new Promise((resolve) => setTimeout(resolve, 0));
      if (refs.disposed)
        return;
      refs.gpu = await renderer(P, host, refs.game, resources, hintAsset, refs.height, refs.displayWidth, () => !!refs.disposed, () => {
        refs.gpu = null;
        if (!refs.disposed && refs.latest)
          paintMogan(refs, refs.latest, legacy);
      });
    }
    if (refs.disposed) {
      refs.gpu?.dispose();
      refs.gpu = null;
      return;
    }
    refs.contentState = "ready";
    if (refs.latest)
      paintMogan(refs, refs.latest, legacy);
  }
  function disposeMogan(refs) {
    if (refs.disposed)
      return;
    refs.disposed = true;
    refs.resize?.disconnect();
    refs.resize = null;
    refs.gpu?.dispose();
    refs.gpu = null;
    refs.fallback.dispose();
    refs.latest = null;
    refs.host = null;
    refs.parent.removeAttribute("visibility");
  }

  // .build/typescript/runtime/mogan/adapter.js
  function createMoganGames({ dom, legacy, onAction }) {
    const { get: $, text } = dom, bindings = new EventBindings();
    function present(base, view) {
      const s = base, refs = view;
      const waiting = refs.contentState !== "ready", complete3 = s.play.complete;
      $("mogan-tools").hidden = false;
      $("micro-panel").setAttribute("data-phase", waiting ? "loading" : complete3 ? "memory" : !s.acted ? "invite" : "play");
      text("micro-title", MOGAN_TITLES[s.game]);
      text("mogan-kicker", "莫干山 · " + chapterNames[s.game]);
      text("mogan-count", s.game === "rain" ? s.rain.caught + " / 8 声" : s.game === "footsteps" ? s.steps.index + " / 10 级" : complete3 ? "纸叶已送到" : "穿过竹隙，送给远山");
      const status = waiting ? refs.contentState === "error" ? "画作暂时没有展开，点「重新试一次」可重新加载。" : "竹林画作正在展开，准备好就能出发。" : s.feedback;
      text("mogan-cue", status);
      text("micro-result", status);
      $("micro-surface").setAttribute("aria-busy", String(refs.contentState === "loading"));
      $("micro-surface").setAttribute("aria-label", MOGAN_PROMPTS[s.game] + (s.game === "rain" ? " 键盘左右方向键或 A、D 移动，Enter 开始，R 重试。" : s.game === "footsteps" ? " Enter 或空格点脚印，也可用 A/D 或左右方向键落脚；R 重试。" : " 方向键调整，空格蓄力、松开发射，R 重试。"));
      $("mogan-settings").hidden = s.game !== "footsteps" || complete3;
      $("mogan-slow").disabled = waiting;
      $("mogan-notes").hidden = s.game !== "rain";
      $("mogan-tools").setAttribute("data-beat", "");
      if (s.game === "rain") {
        for (const [i, note] of [...$("mogan-notes").children].entries()) {
          note.setAttribute("data-earned", String(i < s.rain.caught));
          note.setAttribute("data-next", String(i === s.rain.caught));
        }
      } else if (s.game === "footsteps") {
        const timing = stepTiming(s), open = s.acted && s.steps.clock >= timing.open && s.steps.clock <= timing.close && !s.steps.recovery && !complete3;
        $("mogan-tools").setAttribute("data-beat", open ? "open" : "wait");
        $("mogan-slow").setAttribute("aria-pressed", String(s.steps.slow));
        text("mogan-slow", s.steps.slow ? "恢复步速" : "慢一点");
      }
    }
    const adapter = {
      create: (entry, options) => createMoganState(entry, options.reduced, legacy, options.weather),
      act: (s, p2) => inputMogan(s, p2, legacy),
      move: (s, p2) => inputMogan(s, p2, legacy, "move"),
      hover: (base, p2) => {
        const s = base;
        return s.game === "rain" && s.acted && !s.play.complete ? releaseMogan(inputMogan(s, p2, legacy, "move"), legacy) : s;
      },
      release: (s) => releaseMogan(s, legacy),
      tick: (s, dt) => tickMogan(s, dt, legacy),
      draw: (svg, parent, entry) => drawMogan(svg, parent, MOGAN_GAMES[entry.id]),
      paint: (refs, state) => paintMogan(refs, state, legacy),
      instruction: (entry) => MOGAN_PROMPTS[MOGAN_GAMES[entry.id]],
      status: (state) => state.feedback,
      outcome(state, entry) {
        const s = state;
        return { id: s.id, edition: entry.edition, earned: s.play.complete === true, interaction: s.gesture, memory: MOGAN_MEMORIES[s.game], title: s.play.complete ? entry.tag : entry.name };
      },
      assets: (entry) => moganAssets(MOGAN_GAMES[entry.id]),
      mount: (refs, context) => mountMogan(refs, context.host, context.cache, context.pixi, legacy),
      dispose: (refs) => disposeMogan(refs),
      point(view, p2) {
        const refs = view;
        if (refs.game === "footsteps") {
          const s = refs.latest;
          if (!s || s.game !== "footsteps")
            return { ...p2, action: "outside-step" };
          const spot = stepSpot(s, refs.height), padding = 22 * 800 / Math.max(1, refs.displayWidth);
          const distance3 = Math.hypot(((p2.x ?? -1) * 800 - spot.x) / Math.max(spot.rx, padding), ((p2.y ?? -1) * refs.height - spot.y) / Math.max(spot.ry, padding));
          return { ...p2, action: distance3 <= 1 ? "step" : "outside-step" };
        }
        if (refs.game !== "sling")
          return p2;
        const b = stageBounds(refs.height);
        return { ...p2, x: ((p2.x ?? 0) * 800 - b.x) / b.w, y: ((p2.y ?? 0) * refs.height - b.y) / b.h };
      },
      present,
      key: (s, key, phase) => keyMogan(s, key, phase, legacy)
    };
    bindings.listen($("mogan-slow"), "click", () => onAction("slow"));
    return { adapter, destroy: () => bindings.destroy() };
  }

  // .build/typescript/runtime/tiger/rules.js
  var TIGER_GAMES = Object.freeze({ "gorge-goat": "depth", "gorge-eagle": "packing", "gorge-sparkle": "score", "tiger-bell-first": "bells" });
  var TITLES = { depth: "江谷回响", packing: "雪山同坐", score: "瀑布来风", bells: "铃声先到" };
  var PROMPTS = {
    depth: "点左右观景处比较远近，再拖动画片，按从近到远排列。",
    packing: "把五件随身物品拖进背包，留出袋口，再合上背包。",
    score: "点格子编一段八拍瀑声：用上两种声音，留一拍空白，再试听。",
    bells: "看铃纹、听方向，点山路岔口，沿铃声找到驮队。"
  };
  var MEMORIES = {
    depth: "我在高路边换了两个站位。近崖移得快，远峰几乎不动；石径、金沙江和雪山，终于在四张画片里排出了峡谷的深浅。",
    packing: "客栈的椅子朝着雪山。我把水壶、雨衣、手帐、饭盒和围巾慢慢收进背包，留出袋口，带着这段歇脚继续走。",
    score: "水帘、落滴与谷风，被我编进了八拍小曲。留白的一拍里，江谷仍在回应；这一段瀑声留在了手帐里。",
    bells: "铃声先从山路转角传来。我在两个岔口辨清方向，终于看见赶路人与驮骡；我侧身让路，等他们慢慢经过。"
  };
  var DEPTH_NAMES = ["近崖", "脚下石径", "金沙江", "远处雪峰"];
  var VOICES = ["水帘", "落滴", "谷风"];
  var BEAT_SECONDS = 0.48;
  var BAG = { columns: 5, rows: 4 };
  var ITEMS = [
    { name: "水壶", frame: 1, cells: [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }] },
    { name: "雨衣", frame: 2, cells: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }] },
    { name: "手帐", frame: 3, cells: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }] },
    { name: "饭盒", frame: 4, cells: [{ x: 0, y: 0 }, { x: 1, y: 0 }] },
    { name: "围巾", frame: 5, cells: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }] }
  ];
  var clamp6 = (n, a, b) => Math.max(a, Math.min(b, n));
  var copyNotes = (notes) => notes.map((row) => row.slice());
  function createTigerState(entry, reduced) {
    const game = TIGER_GAMES[entry.id];
    const base = { id: entry.id, route: "tiger", kind: entry.interaction, game, age: 0, acted: false, dragging: false, gesture: "look", done: false, x: 0.5, y: 0.5, play: { type: "minigame", progress: 0, complete: false, completedAt: null, reduced }, serial: 0, events: [], feedback: PROMPTS[game] };
    if (game === "depth")
      return { ...base, game, depth: { order: [2, 0, 3, 1], selected: -1, held: -1, target: -1, view: 0, camera: 0, seen: 1 } };
    if (game === "packing")
      return { ...base, game, bag: { poses: ITEMS.map(() => ({ rotation: 0, cell: null })), selected: -1, cursor: { x: 0, y: 0 }, held: null, closed: false } };
    if (game === "score")
      return { ...base, game, score: { notes: VOICES.map(() => Array(8).fill(false)), history: [], revision: 0, audition: -1, playing: false, clock: 0, beat: -1, cursor: 0 } };
    return { ...base, game, bells: { junction: 0, wrong: false, nextCue: 0.45, pulseAt: -10, movedAt: -10, passing: false, nextStep: 0.15 } };
  }
  function clone2(s) {
    return structuredClone(s);
  }
  function emit2(s, type, x = 0.5, index = 0) {
    s.events.push({ serial: ++s.serial, type, x, index, age: s.age });
    s.events = s.events.slice(-24);
  }
  function complete2(s) {
    if (s.play.complete)
      return;
    s.play.complete = true;
    s.play.progress = 1;
    s.play.completedAt = s.age;
    emit2(s, "complete");
  }
  function itemCells(index, rotation) {
    let cells = ITEMS[index].cells.map((c) => ({ ...c }));
    for (let i = 0; i < (rotation % 4 + 4) % 4; i++) {
      cells = cells.map((c) => ({ x: -c.y, y: c.x }));
      const minX = Math.min(...cells.map((c) => c.x)), minY = Math.min(...cells.map((c) => c.y));
      cells = cells.map((c) => ({ x: c.x - minX, y: c.y - minY }));
    }
    return cells;
  }
  function itemSize(index, rotation) {
    const cells = itemCells(index, rotation);
    return { x: 1 + Math.max(...cells.map((c) => c.x)), y: 1 + Math.max(...cells.map((c) => c.y)) };
  }
  function canPack(s, index, cell, rotation = s.bag.poses[index].rotation) {
    if (!Number.isInteger(cell.x) || !Number.isInteger(cell.y))
      return false;
    const occupied = /* @__PURE__ */ new Set();
    s.bag.poses.forEach((p2, i) => {
      if (i !== index && p2.cell)
        for (const c of itemCells(i, p2.rotation))
          occupied.add(p2.cell.x + c.x + ":" + (p2.cell.y + c.y));
    });
    return itemCells(index, rotation).every((c) => {
      const x = cell.x + c.x, y = cell.y + c.y;
      return x >= 0 && y >= 0 && x < BAG.columns && y < BAG.rows && !occupied.has(x + ":" + y);
    });
  }
  function packedPiece(s, x, y) {
    const col = Math.floor(x), row = Math.floor(y);
    return s.bag.poses.findIndex((p2, i) => p2.cell && itemCells(i, p2.rotation).some((c) => p2.cell.x + c.x === col && p2.cell.y + c.y === row));
  }
  function scoreReady(s) {
    return s.score.notes.filter((row) => row.some(Boolean)).length >= 2 && Array.from({ length: 8 }, (_, i) => i).some((i) => s.score.notes.every((row) => !row[i]));
  }
  function bellDirection(s) {
    return s.bells.junction === 0 ? 0 : 1;
  }
  function cue(s) {
    s.bells.pulseAt = s.age;
    s.bells.nextCue = s.bells.wrong ? 2.1 : 1.6;
    emit2(s, "trail-bell", bellDirection(s) === 0 ? 0.08 : 0.92, s.bells.wrong ? 0 : s.bells.junction + 1);
  }
  function changeDepth(s, from, to) {
    if (from < 0 || to < 0 || from === to)
      return;
    s.depth.order.splice(to, 0, s.depth.order.splice(from, 1)[0]);
    s.depth.selected = to;
    s.feedback = "按近到远排好四张画片，再看看是否与江谷一致。";
    emit2(s, "depth-paper", 0.15 + to * 0.23);
  }
  function place(s, index, cell) {
    if (!canPack(s, index, cell)) {
      s.feedback = "这里放不下：物件不能叠在一起，也不能越过内袋边缘。";
      emit2(s, "pack-return");
      return;
    }
    s.bag.poses[index].cell = cell;
    s.bag.cursor = cell;
    s.bag.selected = index;
    const count = s.bag.poses.filter((p2) => p2.cell).length;
    s.play.progress = count / ITEMS.length * 0.85;
    s.feedback = count === ITEMS.length ? "五件都收好了，袋口也留出来了。合上背包，继续走。" : ITEMS[index].name + "放好了，还可以转一转或取出来重放。";
    emit2(s, "pack-place", (cell.x + 0.5) / BAG.columns);
  }
  function editScore(s, edit) {
    s.score.history.push(copyNotes(s.score.notes));
    s.score.history = s.score.history.slice(-20);
    edit();
    s.score.revision++;
    s.score.audition = -1;
    s.score.playing = false;
    s.score.beat = -1;
    s.score.clock = 0;
    s.play.progress = scoreReady(s) ? 0.5 : 0.15;
    s.feedback = scoreReady(s) ? "声音与留白都有了，完整试听一遍，再决定留下。" : "点亮两种声音，至少留一整拍空白，让瀑声有呼吸。";
  }
  function scoreBeat(s, beat) {
    s.score.beat = beat;
    s.score.notes.forEach((row, voice) => {
      if (row[beat])
        emit2(s, ["score-water", "score-drop", "score-wind"][voice], 0.18 + beat / 7 * 0.64, beat);
    });
  }
  function inputTiger(state, p2, move = false) {
    if (state.done || state.play.complete)
      return state;
    const action = p2.action || "", value = p2.value ?? -1;
    if (move) {
      if (state.game === "packing" && state.bag.held) {
        const s2 = clone2(state);
        if (Number.isFinite(p2.x) && Number.isFinite(p2.y))
          s2.bag.held.at = { x: p2.x - s2.bag.held.grab.x, y: p2.y - s2.bag.held.grab.y };
        s2.dragging = true;
        return s2;
      }
      if (state.game === "depth" && state.depth.held >= 0) {
        const s2 = clone2(state);
        s2.depth.target = action === "depth-card" ? value : -1;
        s2.dragging = true;
        return s2;
      }
      return state;
    }
    if (p2.phase === "press") {
      if (state.game === "depth" && action === "depth-card" && value >= 0 && value < 4) {
        const s2 = clone2(state);
        s2.depth.held = value;
        s2.depth.target = value;
        if (s2.depth.selected < 0)
          s2.depth.selected = value;
        s2.acted = true;
        s2.gesture = "tap";
        return s2;
      }
      if (state.game === "packing" && (action === "pack-piece" || action === "pack-cell")) {
        const s2 = clone2(state), index = action === "pack-piece" ? value : s2.bag.selected;
        if (index < 0 || index >= ITEMS.length)
          return state;
        const old = s2.bag.poses[index].cell, fromBag = action === "pack-piece" && old && Number.isFinite(p2.x) && Number.isFinite(p2.y);
        const grab = fromBag ? { x: p2.x - old.x, y: p2.y - old.y } : { x: 0.5, y: 0.5 };
        s2.bag.selected = index;
        s2.bag.held = { piece: index, grab, at: { x: (p2.x ?? -10) - grab.x, y: (p2.y ?? -10) - grab.y } };
        s2.acted = true;
        s2.gesture = "drag";
        s2.feedback = ITEMS[index].name + " · 拖进内袋，或先旋转再放。";
        emit2(s2, "pack-pick");
        return s2;
      }
      return state;
    }
    const s = clone2(state);
    s.dragging = false;
    s.gesture = p2.gesture || "tap";
    if (s.game === "depth") {
      if (action === "depth-card" && value >= 0 && value < 4) {
        const from = p2.dragged && s.depth.held >= 0 ? s.depth.held : s.depth.selected;
        if (from >= 0 && from !== value)
          changeDepth(s, from, value);
        else
          s.depth.selected = value;
        s.depth.held = -1;
        s.depth.target = -1;
        s.acted = true;
      } else if (action === "view" && (value === 0 || value === 1)) {
        s.depth.view = value;
        s.depth.seen |= 1 << value;
        s.acted = true;
        emit2(s, "depth-view", value ? 0.8 : 0.2);
        s.feedback = "换个站位：近崖和石径移动得明显，江水较慢，雪峰几乎不动。";
      } else if (action === "check-depth") {
        s.acted = true;
        if (s.depth.seen !== 3)
          s.feedback = "再点另一边的观景处，比较一次远近，再来排画片。";
        else if (s.depth.order.some((id, i) => id !== i)) {
          s.feedback = "江谷的深浅还没排好。换个站位，再看谁移动得更明显。";
          emit2(s, "depth-return");
        } else {
          s.feedback = "近崖、石径、金沙江、远处雪峰——江谷的纵深排好了。";
          complete2(s);
        }
      } else {
        s.depth.held = -1;
        s.depth.target = -1;
      }
      if (!s.play.complete)
        s.play.progress = (s.depth.seen === 3 ? 0.2 : 0.05) + s.depth.order.filter((id, i) => id === i).length * 0.15;
      return s;
    }
    if (s.game === "packing") {
      if (s.bag.held) {
        const held = s.bag.held;
        if (action === "pack-cell" && (p2.dragged || p2.phase === "release") || action === "pack-piece" && p2.dragged && Number.isFinite(p2.x)) {
          place(s, held.piece, { x: Math.floor((p2.x ?? -10) - held.grab.x + 0.5), y: Math.floor((p2.y ?? -10) - held.grab.y + 0.5) });
        }
        s.bag.held = null;
        return s;
      }
      if (action === "select-piece" && value >= 0 && value < ITEMS.length) {
        s.bag.selected = value;
        s.feedback = ITEMS[value].name + "已选中，点内袋放下。";
      } else if (action === "pack-cell" && s.bag.selected >= 0)
        place(s, s.bag.selected, { x: Math.floor(p2.x ?? s.bag.cursor.x), y: Math.floor(p2.y ?? s.bag.cursor.y) });
      else if (action === "rotate" && s.bag.selected >= 0) {
        const i = s.bag.selected, pose = s.bag.poses[i], rotation = (pose.rotation + 1) % 4;
        if (!pose.cell || canPack(s, i, pose.cell, rotation)) {
          pose.rotation = rotation;
          s.feedback = ITEMS[i].name + "转了一个方向。";
          emit2(s, "pack-turn");
        } else
          s.feedback = "原处转不开，先取出来，再换个方向放。";
      } else if (action === "take-out" && s.bag.selected >= 0) {
        s.bag.poses[s.bag.selected].cell = null;
        s.play.progress = s.bag.poses.filter((p3) => p3.cell).length / ITEMS.length * 0.85;
        s.feedback = ITEMS[s.bag.selected].name + "取出来了，可以重新摆放。";
        emit2(s, "pack-pick");
      } else if (action === "close-bag") {
        if (s.bag.poses.every((pose) => pose.cell)) {
          s.bag.closed = true;
          s.feedback = "背包合上了。雪山还在窗外，带着轻快的行李继续走。";
          emit2(s, "pack-close");
          complete2(s);
        } else
          s.feedback = "还有物品没收好，把五件都放进内袋，再合上背包。";
      } else
        return state;
      s.acted = true;
      return s;
    }
    if (s.game === "score") {
      if (action === "note" && value >= 0 && value < 24) {
        const row = Math.floor(value / 8), beat = value % 8;
        editScore(s, () => {
          s.score.notes[row][beat] = !s.score.notes[row][beat];
        });
        s.score.cursor = value;
        emit2(s, "score-edit", 0.18 + beat / 7 * 0.64);
      } else if (action === "undo" && s.score.history.length) {
        s.score.notes = s.score.history.pop();
        s.score.revision++;
        s.score.audition = -1;
        s.score.playing = false;
        s.score.beat = -1;
        s.feedback = "撤回了上一笔，改动后的瀑声需要重新试听。";
        s.play.progress = scoreReady(s) ? 0.5 : 0.15;
      } else if (action === "audition") {
        if (s.score.playing) {
          s.score.playing = false;
          s.score.beat = -1;
          s.feedback = "试听停下了。完整听完一遍，才能留下这一段。";
        } else {
          s.score.playing = true;
          s.score.clock = 0;
          s.score.audition = -1;
          scoreBeat(s, 0);
          s.feedback = "八拍正在走，空白的一拍也会轻轻经过。";
        }
      } else if (action === "save-score") {
        if (!scoreReady(s))
          s.feedback = "用上至少两种声音，并留一整拍空白，再完整试听。";
        else if (s.score.playing || s.score.audition !== s.score.revision)
          s.feedback = "改过的声音，需要从头完整试听一遍。";
        else {
          s.feedback = "这一段有声音，也有留白。把自己的瀑声收进手帐。";
          complete2(s);
        }
      } else
        return state;
      s.acted = true;
      return s;
    }
    if (action === "listen-bell" && s.bells.junction < 2) {
      cue(s);
      s.feedback = s.bells.wrong ? "铃声隔着山壁，显得更远了。先沿原路返回岔口。" : "铃纹与声音指向同一边，沿那个方向走。";
    } else if (action === "return" && s.bells.wrong) {
      s.bells.wrong = false;
      s.bells.movedAt = s.age;
      s.bells.nextCue = 0.35;
      s.feedback = "回到岔口了。听清方向，再选一条山路。";
      emit2(s, "trail-step");
    } else if (action === "branch" && (value === 0 || value === 1) && s.bells.junction < 2 && !s.bells.wrong) {
      if (value !== bellDirection(s)) {
        s.bells.wrong = true;
        s.feedback = "这条小路绕到了山壁，铃声更远了。沿原路返回。";
      } else {
        s.bells.junction++;
        s.play.progress = s.bells.junction * 0.4;
        s.feedback = s.bells.junction === 1 ? "铃声更近了。前面还有一个转弯。" : "转角后是赶路人和驮骡。侧身让他们先过吧。";
      }
      s.bells.movedAt = s.age;
      s.bells.nextCue = 0.4;
      emit2(s, "trail-step", value ? 0.8 : 0.2);
    } else if (action === "let-pass" && s.bells.junction === 2) {
      s.bells.passing = true;
      s.bells.movedAt = s.age;
      s.feedback = "我在山路边让出身位，铃声和脚步慢慢经过。";
      complete2(s);
    } else
      return state;
    s.acted = true;
    return s;
  }
  function releaseTiger(s) {
    if (s.game === "depth")
      return { ...s, dragging: false, depth: { ...s.depth, held: -1, target: -1 } };
    if (s.game === "packing")
      return { ...s, dragging: false, bag: { ...s.bag, held: null } };
    return s;
  }
  function tickTiger(state, dt) {
    if (state.done || !Number.isFinite(dt) || dt <= 0)
      return state;
    const s = clone2(state), step = Math.min(0.25, dt);
    s.age += step;
    if (s.play.complete) {
      if (s.game === "bells" && s.bells.passing) {
        s.bells.nextStep -= step;
        if (s.bells.nextStep <= 0) {
          s.bells.nextStep += 0.44;
          emit2(s, "trail-step", 0.5 - Math.min(0.4, (s.age - s.bells.movedAt) * 0.15), Math.floor((s.age - s.bells.movedAt) / 0.44));
        }
      }
      s.done = s.age - (s.play.completedAt ?? s.age) >= (s.play.reduced ? 0.6 : 2.5);
      return s;
    }
    if (s.game === "depth")
      s.depth.camera += (s.depth.view - s.depth.camera) * (s.play.reduced ? 1 : 1 - Math.exp(-step * 6));
    if (s.game === "score" && s.score.playing) {
      const old = s.score.beat;
      s.score.clock += step;
      const beat = Math.floor(s.score.clock / BEAT_SECONDS);
      for (let i = old + 1; i <= Math.min(7, beat); i++)
        scoreBeat(s, i);
      if (beat >= 8) {
        s.score.playing = false;
        s.score.beat = -1;
        s.score.audition = s.score.revision;
        s.play.progress = scoreReady(s) ? 0.9 : 0.3;
        s.feedback = scoreReady(s) ? "八拍试听完了，喜欢的话，就留下这段瀑声。" : "试听完了，再用上两种声音、留一整拍空白。";
      }
    }
    if (s.game === "bells" && s.bells.junction < 2) {
      s.bells.nextCue -= step;
      if (s.bells.nextCue <= 0)
        cue(s);
    }
    return s;
  }
  function keyTiger(s, key, phase) {
    if (phase === "up" || s.play.complete)
      return null;
    const index = Number(key) - 1;
    if (s.game === "depth") {
      if (/^[1-4]$/.test(key)) {
        const n = clone2(s);
        n.depth.selected = index;
        n.feedback = DEPTH_NAMES[n.depth.order[index]] + "已选中，用左右键移动画片。";
        return n;
      }
      if (key === "ArrowLeft" || key === "ArrowRight") {
        const n = clone2(s), from = n.depth.selected < 0 ? 0 : n.depth.selected;
        changeDepth(n, from, clamp6(from + (key === "ArrowLeft" ? -1 : 1), 0, 3));
        n.acted = true;
        return n;
      }
      if (key.toLowerCase() === "a" || key.toLowerCase() === "d")
        return inputTiger(s, { action: "view", value: key.toLowerCase() === "a" ? 0 : 1 });
      if (key === "Enter")
        return inputTiger(s, { action: "check-depth" });
    } else if (s.game === "packing") {
      if (/^[1-5]$/.test(key))
        return inputTiger(s, { action: "select-piece", value: index });
      if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(key)) {
        const n = clone2(s);
        n.bag.cursor.x = clamp6(n.bag.cursor.x + (key === "ArrowLeft" ? -1 : key === "ArrowRight" ? 1 : 0), 0, 4);
        n.bag.cursor.y = clamp6(n.bag.cursor.y + (key === "ArrowUp" ? -1 : key === "ArrowDown" ? 1 : 0), 0, 3);
        return n;
      }
      if (key === "Enter")
        return inputTiger(s, { action: "pack-cell", x: s.bag.cursor.x, y: s.bag.cursor.y });
      if (key.toLowerCase() === "q")
        return inputTiger(s, { action: "rotate" });
      if (key === "Delete" || key === "Backspace")
        return inputTiger(s, { action: "take-out" });
      if (key.toLowerCase() === "c")
        return inputTiger(s, { action: "close-bag" });
    } else if (s.game === "score") {
      if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(key)) {
        const n = clone2(s), col = n.score.cursor % 8, row = Math.floor(n.score.cursor / 8);
        n.score.cursor = clamp6(row + (key === "ArrowUp" ? -1 : key === "ArrowDown" ? 1 : 0), 0, 2) * 8 + clamp6(col + (key === "ArrowLeft" ? -1 : key === "ArrowRight" ? 1 : 0), 0, 7);
        return n;
      }
      if (key === "Enter" || key === " ")
        return inputTiger(s, { action: "note", value: s.score.cursor });
      if (key.toLowerCase() === "p")
        return inputTiger(s, { action: "audition" });
      if (key.toLowerCase() === "z")
        return inputTiger(s, { action: "undo" });
      if (key.toLowerCase() === "s")
        return inputTiger(s, { action: "save-score" });
    } else {
      if (key === "ArrowLeft" || key === "ArrowRight")
        return inputTiger(s, { action: "branch", value: key === "ArrowLeft" ? 0 : 1 });
      if (key === "ArrowDown" || key === "Backspace")
        return inputTiger(s, { action: "return" });
      if (key === "Enter" || key === " ")
        return inputTiger(s, { action: s.bells.junction === 2 ? "let-pass" : "listen-bell" });
    }
    return null;
  }

  // .build/typescript/runtime/tiger/assets.js
  var TIGER_BACKGROUND = "scenes/tiger-v1.webp";
  var TIGER_PROPS = "sprites/tiger-props-v2.webp";
  var TIGER_SCENES = { depth: TIGER_BACKGROUND, packing: "scenes/tiger-rest-v1.webp", score: "scenes/tiger-waterfall-v1.webp", bells: TIGER_BACKGROUND };
  var TIGER_PAINTINGS = {
    depth: "badges/tiger-river-below-v4.webp",
    packing: "badges/tiger-halfway-rest-v4.webp",
    score: "badges/tiger-longdong-waterfall-v4.webp",
    bells: "badges/tiger-bell-first-v4.webp"
  };
  var PROP_FRAMES = [
    { x: 28, y: 22, w: 449, h: 431 },
    { x: 568, y: 46, w: 145, h: 388 },
    { x: 787, y: 133, w: 465, h: 260 },
    { x: 75, y: 477, w: 308, h: 306 },
    { x: 448, y: 521, w: 378, h: 246 },
    { x: 862, y: 436, w: 376, h: 375 },
    { x: 40, y: 788, w: 443, h: 449 },
    { x: 491, y: 791, w: 467, h: 451 },
    { x: 1005, y: 822, w: 198, h: 390 }
  ];
  var TIGER_ROUTE_ASSETS = [.../* @__PURE__ */ new Set([...Object.values(TIGER_SCENES), TIGER_PROPS, ...Object.values(TIGER_PAINTINGS)])];

  // .build/typescript/runtime/tiger/scene.js
  var colors = { ink: "#334d49", muted: "#64766a", paper: "#faf4e4", gold: "#aa8551", blue: "#6c969d", green: "#819b77" };
  var inside = (r, x, y) => x >= r.x && y >= r.y && x < r.x + r.w && y < r.y + r.h;
  var set = (node2, attrs4) => {
    for (const [name, v] of Object.entries(attrs4))
      if (node2.getAttribute(name) !== String(v))
        node2.setAttribute(name, String(v));
  };
  function node(r, key, tag, attrs4, parent = r.root) {
    let el = r.nodes.get(key);
    if (!el) {
      el = r.svg(tag, {}, parent);
      r.nodes.set(key, el);
    }
    r.live.add(key);
    set(el, { ...attrs4, display: "" });
    return el;
  }
  function label(r, key, text, x, y, size = 14, fill = colors.ink, anchor = "start", parent) {
    const el = node(r, key, "text", { x, y, fill, "font-size": size, "text-anchor": anchor, "font-family": 'Georgia, "Songti SC", "Noto Serif SC", serif', "paint-order": "stroke", stroke: "#faf4e477", "stroke-width": 0.7 }, parent);
    if (el.textContent !== text)
      el.textContent = text;
    return el;
  }
  function paper(r, key, box, selected = false, parent) {
    return node(r, key, "rect", { x: box.x, y: box.y, width: box.w, height: box.h, rx: 9, fill: colors.paper, "fill-opacity": selected ? 0.96 : 0.85, stroke: selected ? colors.gold : "#b8b69c", "stroke-opacity": selected ? 0.9 : 0.5, "stroke-width": selected ? 2 : 1 }, parent);
  }
  function sprite2(r, key, frame, box, rotation = 0, opacity = 1) {
    const source2 = PROP_FRAMES[frame];
    const g = node(r, key, "g", { transform: "translate(" + (box.x + box.w / 2) + " " + (box.y + box.h / 2) + ") rotate(" + rotation * 90 + ")", opacity });
    const crop = node(r, key + "-crop", "svg", { x: -box.w / 2, y: -box.h / 2, width: box.w, height: box.h, viewBox: [source2.x, source2.y, source2.w, source2.h].join(" "), preserveAspectRatio: "xMidYMid meet", overflow: "hidden" }, g);
    node(r, key + "-image", "image", { href: TIGER_PROPS, width: 1280, height: 1280 }, crop);
  }
  function painting(r, key, file, box, opacity = 1) {
    node(r, key, "image", { href: file, x: box.x, y: box.y, width: box.w, height: box.h, opacity, preserveAspectRatio: "xMidYMid meet" });
  }
  function chip(r, key, text, box, selected, action, value) {
    paper(r, key, box, selected);
    label(r, key + "-label", text, box.x + box.w / 2, box.y + box.h / 2 + 5, 14, colors.ink, "middle");
    r.layout.hits.push({ ...box, action, value });
  }
  function backdrop(r, s) {
    node(r, "background", "image", { href: TIGER_SCENES[s.game], x: 0, y: 0, width: r.width, height: r.height, preserveAspectRatio: s.game === "packing" || s.game === "score" ? "xMinYMid slice" : "xMidYMid slice", opacity: s.game === "packing" ? 0.85 : 1 });
    node(r, "wash", "rect", { width: r.width, height: r.height, fill: colors.paper, opacity: s.game === "packing" ? 0.14 : 0.08 });
  }
  function depthScene(r, s) {
    const { width: w, height: h } = r, gap2 = Math.max(7, w * 9e-3), p2 = Math.max(12, w * 0.018);
    const cardH = Math.max(82, Math.min(150, h * 0.25)), stripY = h - cardH - 16;
    const scene = node(r, "depth-scene", "svg", { x: 0, y: 0, width: w, height: stripY - 24, viewBox: "0 0 1280 720", preserveAspectRatio: "xMidYMid slice", overflow: "hidden" });
    node(r, "depth-base", "image", { href: TIGER_BACKGROUND, width: 1280, height: 720 }, scene);
    const masks = ["0,0 1280,0 1280,315 0,315", "420,270 940,270 850,720 390,720", "780,0 1280,0 1280,720 650,720 810,400", "0,0 425,0 540,300 390,720 0,720"];
    const amount = [3, 14, 33, 58];
    for (let i = 0; i < 4; i++) {
      const layer = node(r, "depth-layer-" + i, "g", { transform: "translate(" + (s.depth.camera - 0.5) * amount[i] + " 0)" }, scene);
      const clipId = "tiger-depth-" + i, clip = node(r, "depth-clip-" + i, "clipPath", { id: clipId }, layer);
      node(r, "depth-mask-" + i, "polygon", { points: masks[i] }, clip);
      node(r, "depth-art-" + i, "image", { href: TIGER_BACKGROUND, width: 1280, height: 720, "clip-path": "url(#" + clipId + ")" }, layer);
    }
    const buttonW = Math.min(145, (w - p2 * 2 - 10) / 2);
    chip(r, "left-view", (s.depth.seen & 1 ? "✓ " : "") + "左边观景", { x: p2, y: 12, w: buttonW, h: 44 }, s.depth.view === 0, "view", 0);
    chip(r, "right-view", (s.depth.seen & 2 ? "✓ " : "") + "右边观景", { x: w - p2 - buttonW, y: 12, w: buttonW, h: 44 }, s.depth.view === 1, "view", 1);
    const strip = { x: 0, y: stripY - 24, w, h: cardH + 40 };
    node(r, "depth-paper", "rect", { x: strip.x, y: strip.y, width: strip.w, height: strip.h, fill: colors.paper, opacity: 0.95 });
    label(r, "depth-direction", "近处  →  远处", p2, stripY - 6, 13, colors.muted);
    const cw = (w - p2 * 2 - gap2 * 3) / 4, cards = [];
    const crop = ["0 90 470 580", "700 300 580 420", "450 315 360 405", "290 0 690 285"];
    s.depth.order.forEach((id, i) => {
      const box = { x: p2 + i * (cw + gap2), y: stripY + 3, w: cw, h: cardH - 5 };
      cards.push(box);
      paper(r, "card-" + i, box, s.depth.selected === i || s.depth.target === i);
      const thumb = node(r, "card-thumb-" + i, "svg", { x: box.x + 4, y: box.y + 4, width: box.w - 8, height: box.h - 32, viewBox: crop[id], preserveAspectRatio: "xMidYMid slice", overflow: "hidden" });
      node(r, "card-picture-" + i, "image", { href: TIGER_BACKGROUND, width: 1280, height: 720 }, thumb);
      label(r, "card-title-" + i, DEPTH_NAMES[id], box.x + box.w / 2, box.y + box.h - 10, w < 420 ? 12 : 14, colors.ink, "middle");
      r.layout.hits.push({ ...box, action: "depth-card", value: i });
    });
    r.layout.cards = cards;
  }
  function packScene(r, s) {
    const { width: w, height: h } = r, wide = w >= 700;
    const c = Math.max(12, Math.min(wide ? w * 0.62 / 7.3 : (w - 16) / 7.3, wide ? (h - 15) / 7.3 : h * 0.66 / 7.3));
    const bagW = c * 7.3, bagH = c * 7.3, bx = wide ? (w * 0.62 - bagW) / 2 : (w - bagW) / 2, by = wide ? (h - bagH) / 2 : 0;
    sprite2(r, "backpack", 0, { x: bx, y: by, w: bagW, h: bagH });
    const grid = { x: bx + c * 1.15, y: by + c * 1.3, w: c * 5, h: c * 4, cell: c };
    r.layout.grid = grid;
    const rim = { x: grid.x - 2, y: grid.y - Math.max(18, c * 0.55), w: grid.w + 4, h: Math.max(16, c * 0.5) };
    node(r, "bag-rim", "rect", { x: rim.x, y: rim.y, width: rim.w, height: rim.h, rx: 7, fill: "#e4d3a9", opacity: 0.94 });
    label(r, "bag-rim-label", s.bag.closed ? "收好了，继续走" : "袋口 · 留空", rim.x + rim.w / 2, rim.y + rim.h / 2 + 4, Math.min(13, Math.max(10, c * 0.3)), colors.ink, "middle");
    if (s.bag.closed) {
      node(r, "bag-closed", "rect", { x: grid.x, y: grid.y, width: grid.w, height: grid.h, rx: 18, fill: "#8e8b62", opacity: 0.92 });
      label(r, "bag-closed-label", "五件行李，一段歇脚", grid.x + grid.w / 2, grid.y + grid.h / 2, Math.min(17, c * 0.38), colors.paper, "middle");
    } else {
      for (let y = 0; y < BAG.rows; y++)
        for (let x = 0; x < BAG.columns; x++)
          node(r, "bag-cell-" + x + "-" + y, "rect", { x: grid.x + x * c, y: grid.y + y * c, width: c, height: c, fill: "#d8c7a5", "fill-opacity": 0.6, stroke: "#655d4380", "stroke-width": 0.65 });
      s.bag.poses.forEach((pose, i) => {
        if (!pose.cell || s.bag.held?.piece === i)
          return;
        const cells = itemCells(i, pose.rotation), size = itemSize(i, pose.rotation), original = itemSize(i, 0);
        cells.forEach((cell, j) => node(r, "packed-cell-" + i + "-" + j, "rect", { x: grid.x + (pose.cell.x + cell.x) * c + 1, y: grid.y + (pose.cell.y + cell.y) * c + 1, width: c - 2, height: c - 2, rx: 4, fill: "#faf0cf", "fill-opacity": 0.35, stroke: s.bag.selected === i ? colors.gold : "#6d755650", "stroke-width": s.bag.selected === i ? 1.8 : 0.5 }));
        const cx = grid.x + (pose.cell.x + size.x / 2) * c, cy = grid.y + (pose.cell.y + size.y / 2) * c;
        sprite2(r, "packed-item-" + i, ITEMS[i].frame, { x: cx - original.x * c / 2, y: cy - original.y * c / 2, w: original.x * c - 4, h: original.y * c - 4 }, pose.rotation);
      });
      const cursor = s.bag.cursor;
      node(r, "bag-cursor", "rect", { x: grid.x + cursor.x * c + 3, y: grid.y + cursor.y * c + 3, width: c - 6, height: c - 6, rx: 3, fill: "none", stroke: "#526b6480", "stroke-width": 1, "stroke-dasharray": "3 4" });
    }
    const tray = wide ? { x: w * 0.64, y: 34, w: w * 0.34 - 12, h: h - 45 } : { x: 10, y: Math.min(h * 0.66 + 3, bagH), w: w - 20, h: h - Math.min(h * 0.66 + 3, bagH) - 6 };
    const cols = wide ? 2 : 3, rows = wide ? 3 : 2, tw = tray.w / cols, th = tray.h / rows;
    const trays = [];
    if (wide) {
      painting(r, "rest-painting", TIGER_PAINTINGS.packing, { x: Math.max(6, bx - c * 0.8), y: 8, w: Math.min(90, w * 0.1), h: Math.min(90, h * 0.2) }, 0.85);
      label(r, "rest-location", "雪山前，歇一歇", tray.x, 22, 14, colors.muted);
    }
    ITEMS.forEach((item, i) => {
      const box = { x: tray.x + i % cols * tw + 3, y: tray.y + Math.floor(i / cols) * th + 3, w: tw - 6, h: th - 6 };
      trays.push(box);
      paper(r, "tray-" + i, box, s.bag.selected === i);
      if (!s.bag.poses[i].cell) {
        const rotation = s.bag.poses[i].rotation, iw = box.w - 16, ih = Math.max(12, box.h - 28), sw = rotation % 2 ? ih : iw, sh = rotation % 2 ? iw : ih;
        sprite2(r, "tray-item-" + i, item.frame, { x: box.x + box.w / 2 - sw / 2, y: box.y + 4 + ih / 2 - sh / 2, w: sw, h: sh }, rotation);
      } else
        label(r, "tray-check-" + i, "✓", box.x + box.w / 2, box.y + box.h * 0.5, 22, colors.green, "middle");
      label(r, "tray-name-" + i, item.name, box.x + box.w / 2, box.y + box.h - 7, Math.min(14, Math.max(11, th * 0.18)), colors.ink, "middle");
      r.layout.hits.push({ ...box, action: "pack-piece", value: i });
    });
    r.layout.trays = trays;
    if (s.bag.held && !s.bag.closed) {
      const { piece: i, at } = s.bag.held, rotation = s.bag.poses[i].rotation, cell = { x: Math.floor(at.x + 0.5), y: Math.floor(at.y + 0.5) };
      const valid2 = canPack(s, i, cell), size = itemSize(i, rotation), original = itemSize(i, 0);
      for (const [j, part] of itemCells(i, rotation).entries())
        node(r, "preview-" + j, "rect", { x: grid.x + (cell.x + part.x) * c + 2, y: grid.y + (cell.y + part.y) * c + 2, width: c - 4, height: c - 4, rx: 4, fill: valid2 ? "#a7b58b" : "#bd9276", "fill-opacity": 0.55, stroke: valid2 ? "#5e7958" : "#925d4c", "stroke-width": 1.5 });
      const cx = grid.x + (at.x + size.x / 2) * c, cy = grid.y + (at.y + size.y / 2) * c;
      sprite2(r, "held-item", ITEMS[i].frame, { x: cx - original.x * c / 2, y: cy - original.y * c / 2, w: original.x * c - 4, h: original.y * c - 4 }, rotation, 0.92);
    }
  }
  function scoreScene(r, s) {
    const { width: w, height: h } = r, wide = w >= 580;
    const art = { x: 0, y: 0, w: w * 0.31, h };
    if (!wide)
      label(r, "score-caption", "八拍水帘 · 点格子落一笔声音", w / 2, 28, 14, colors.ink, "middle");
    const board = { x: wide ? w * 0.32 : 12, y: wide ? Math.max(30, h * 0.12) : 62, w: wide ? w * 0.66 - 5 : w - 24, h: wide ? h * 0.76 : h - 72 };
    const split = !wide, cols = split ? 4 : 8, rows = split ? 6 : 3, labelW = 37;
    const cellW = (board.w - labelW) / cols, cellH = Math.min(wide ? 140 : 60, (board.h - (split ? 40 : 22)) / rows);
    const notes = [];
    paper(r, "score-paper", { x: board.x - 5, y: board.y - 21, w: board.w + 10, h: rows * cellH + (split ? 40 : 22) }, false);
    for (let beat = 0; beat < 8; beat++) {
      const half = split ? Math.floor(beat / 4) : 0, col = beat % cols;
      const x = board.x + labelW + col * cellW, baseY = board.y + half * (cellH * 3 + 24);
      label(r, "beat-number-" + beat, String(beat + 1), x + cellW / 2, baseY - 5, 12, colors.muted, "middle");
      for (let voice = 0; voice < 3; voice++) {
        const i = voice * 8 + beat, box = { x: x + 3, y: baseY + voice * cellH, w: cellW - 6, h: cellH - 5 };
        notes[i] = box;
        const active = s.score.notes[voice][beat], current = s.score.playing && s.score.beat === beat;
        const color = [colors.blue, "#a08c5b", colors.green][voice];
        node(r, "note-" + i, "rect", { x: box.x, y: box.y, width: box.w, height: box.h, rx: 7, fill: active ? color : "#f4ebd7", "fill-opacity": active ? 0.6 : 0.8, stroke: current ? colors.ink : s.score.cursor === i ? colors.gold : "#a6b4a0", "stroke-width": current ? 2.4 : 1, "stroke-dasharray": s.score.cursor === i && !current ? "3 3" : "none" });
        if (active) {
          const yy = box.y + box.h / 2, xx = box.x + box.w / 2;
          node(r, "note-mark-" + i, "path", { d: voice === 0 ? "M " + (xx - 9) + " " + (yy - 4) + " q 5 -8 10 0 t 10 0 M " + (xx - 9) + " " + (yy + 5) + " q 5 -8 10 0 t 10 0" : voice === 1 ? "M " + xx + " " + (yy - 10) + " q -13 15 0 19 q 13 -4 0 -19 Z" : "M " + (xx - 11) + " " + yy + " q 20 -12 21 -3 q 0 7 -9 5 M " + (xx - 8) + " " + (yy + 8) + " q 10 -4 17 -2", stroke: "#fffbed", "stroke-width": 1.7, fill: voice === 1 ? "#fffbed" : "none", "stroke-linecap": "round" });
        }
        r.layout.hits.push({ ...box, action: "note", value: i });
        if (col === 0)
          label(r, "voice-" + half + "-" + voice, VOICES[voice], board.x + 2, box.y + box.h / 2 + 5, 13, colors.ink);
      }
    }
    r.layout.notes = notes;
    if (s.score.playing) {
      const q = s.score.clock / BEAT_SECONDS - Math.floor(s.score.clock / BEAT_SECONDS);
      for (let voice = 0; voice < 3; voice++)
        if (s.score.notes[voice][s.score.beat]) {
          const box = notes[voice * 8 + s.score.beat];
          node(r, "beat-ripple-" + voice, "ellipse", { cx: box.x + box.w / 2, cy: box.y + box.h / 2, rx: Math.max(2, box.w * 0.38 * q), ry: Math.max(2, box.h * 0.38 * q), fill: "none", stroke: "#fffef0", "stroke-width": 2, opacity: s.play.reduced ? 0.7 : 1 - q });
        }
      if (wide) {
        const water2 = s.score.notes[0][s.score.beat], drop = s.score.notes[1][s.score.beat], wind = s.score.notes[2][s.score.beat];
        for (let i = 0; i < 9; i++) {
          const x = art.x + art.w * (0.3 + i * 0.041), y = art.y + art.h * (0.3 + (q + i * 0.08) % 1 * 0.4);
          node(r, "fall-line-" + i, "path", { d: "M " + x + " " + y + " q " + (wind ? 9 : 3) + " 14 0 " + (water2 ? 37 : 12), fill: "none", stroke: "#eef5e3", "stroke-width": drop && i % 2 ? 3 : 1.5, opacity: water2 || drop || wind ? 0.65 : 0 });
        }
      }
    }
  }
  function bellsScene(r, s) {
    const { width: w, height: h } = r, b = s.bells, found = b.junction === 2;
    if (b.wrong)
      node(r, "wrong-wash", "rect", { width: w, height: h, fill: "#6b6456", opacity: 0.32 });
    const title = found ? "转角后的山路旅伴" : b.wrong ? "山壁前的小路" : "第" + (b.junction + 1) + "个转弯";
    paper(r, "trail-caption", { x: Math.max(10, w / 2 - 135), y: 12, w: Math.min(270, w - 20), h: 42 });
    label(r, "trail-title", title, w / 2, 39, 16, colors.ink, "middle");
    if (!found) {
      const dir = bellDirection(s), x = w * (dir === 0 ? 0.18 : 0.82), y = h * 0.28, elapsed = s.age - b.pulseAt, q = Math.min(1, elapsed / 1.4);
      sprite2(r, "bell", 8, { x: x - 20, y: y - 42, w: 40, h: 78 }, 0, b.wrong ? 0.5 : 1);
      for (let i = 0; i < 3; i++) {
        const radius = 17 + i * 10 + (s.play.reduced ? 0 : q * 32);
        node(r, "bell-pulse-" + i, "path", { d: "M " + (x + (dir === 0 ? 1 : -1) * radius * 0.6) + " " + (y - radius) + " Q " + (x + (dir === 0 ? 1 : -1) * radius * 1.55) + " " + y + " " + (x + (dir === 0 ? 1 : -1) * radius * 0.6) + " " + (y + radius), stroke: "#fbf4d2", "stroke-width": 2, fill: "none", opacity: b.wrong ? 0.2 : s.play.reduced ? 0.65 : Math.max(0.08, (1 - q) * 0.8) });
      }
      label(r, "bell-distance", b.wrong ? "隔着山壁 · 更远" : b.junction ? "近一些了" : "铃声在转角后", x, y + 65, w < 430 ? 12 : 14, "#fdf7e8", "middle");
      if (b.wrong)
        chip(r, "trail-back", "↶ 沿原路返回", { x: w / 2 - 82, y: h - 75, w: 164, h: 48 }, false, "return");
      else {
        const pathY = h - 80, pathW = Math.min(210, w * 0.41);
        for (let dir2 = 0; dir2 < 2; dir2++) {
          const box = { x: dir2 === 0 ? w * 0.07 : w * 0.93 - pathW, y: pathY, w: pathW, h: 54 };
          node(r, "trail-path-" + dir2, "path", { d: "M " + w / 2 + " " + (h + 8) + " Q " + (dir2 ? w * 0.7 : w * 0.3) + " " + h * 0.7 + " " + (dir2 ? w * 0.83 : w * 0.17) + " " + h * 0.55, stroke: "#f6edcf", "stroke-width": 6, "stroke-opacity": 0.6, fill: "none", "stroke-linecap": "round" });
          chip(r, "trail-choice-" + dir2, dir2 === 0 ? "↖ 左边山路" : "右边山路 ↗", box, false, "branch", dir2);
        }
      }
    } else {
      const elapsed = s.age - b.movedAt, drift = s.play.reduced ? 0 : b.passing ? -elapsed * w * 0.27 : (1 - Math.min(1, elapsed / 1.2)) * w * 0.35;
      const size = Math.min(w * 0.68, h * 1.05), pose = s.play.reduced ? 6 : Math.floor(s.age / 0.38) % 2 + 6;
      sprite2(r, "mule-guide", pose, { x: w * 0.51 - size / 2 + drift, y: h - size - 12, w: size, h: size });
      if (!b.passing)
        label(r, "guide-line", "「借过，慢慢走。」", w / 2, h - 17, 15, colors.ink, "middle");
    }
  }
  function drawTiger(svg, parent, game) {
    const root = svg("g", { class: "tiger-scene" }, parent);
    return { tiger: true, game, root, svg, width: 800, height: 500, nodes: /* @__PURE__ */ new Map(), live: /* @__PURE__ */ new Set(), layout: { hits: [] }, contentState: "loading" };
  }
  function paintTiger(r, s) {
    if (r.disposed)
      return;
    r.latest = s;
    r.live.clear();
    r.layout = { hits: [] };
    set(r.root.parentElement, { viewBox: "0 0 " + r.width + " " + r.height, preserveAspectRatio: "none" });
    backdrop(r, s);
    if (r.contentState === "ready") {
      if (s.game === "depth")
        depthScene(r, s);
      else if (s.game === "packing")
        packScene(r, s);
      else if (s.game === "score")
        scoreScene(r, s);
      else
        bellsScene(r, s);
    } else {
      node(r, "loading-paper", "rect", { x: 0, y: 0, width: r.width, height: r.height, fill: colors.paper, opacity: 0.84 });
      label(r, "loading-label", r.contentState === "error" ? "画作未能展开，可重试或继续走。" : "江谷画作正在展开…", r.width / 2, r.height / 2, 16, colors.ink, "middle");
    }
    for (const [key, el] of r.nodes)
      if (!r.live.has(key))
        set(el, { display: "none" });
  }
  function tigerPoint(r, p2) {
    const x = (p2.x ?? -1) * r.width, y = (p2.y ?? -1) * r.height;
    const grid = r.layout.grid;
    if (r.game === "packing" && grid && r.latest?.game === "packing") {
      const gx = (x - grid.x) / grid.cell, gy = (y - grid.y) / grid.cell;
      if (inside(grid, x, y)) {
        const piece = packedPiece(r.latest, gx, gy);
        return { ...p2, action: piece >= 0 ? "pack-piece" : "pack-cell", value: piece, x: gx, y: gy };
      }
      const hit2 = r.layout.hits.find((b) => inside(b, x, y));
      const action = hit2?.action === "pack-piece" && r.latest.bag.poses[hit2.value].cell ? "select-piece" : hit2?.action || "outside";
      return { ...p2, action, value: hit2?.value, x: gx, y: gy };
    }
    const hit = r.layout.hits.find((b) => inside(b, x, y));
    return { ...p2, action: hit?.action || "outside", value: hit?.value };
  }
  function tigerAssets(game) {
    return { scene: TIGER_SCENES[game], actor: TIGER_PROPS, front: TIGER_PAINTINGS[game] };
  }
  async function mountTiger(r, host, cache) {
    r.host = host;
    const resize = () => {
      if (r.disposed)
        return;
      const box = host.getBoundingClientRect();
      if (box.width <= 0 || box.height <= 0)
        return;
      r.width = box.width;
      r.height = box.height;
      if (r.latest)
        paintTiger(r, r.latest);
    };
    if (typeof ResizeObserver !== "undefined") {
      r.observer = new ResizeObserver(resize);
      r.observer.observe(host);
    }
    resize();
    if (!cache) {
      r.contentState = "error";
      return;
    }
    const paths = [TIGER_SCENES[r.game], TIGER_PROPS, TIGER_PAINTINGS[r.game]];
    const results = await Promise.all(paths.map((path) => cache.request(path, "high")?.promise));
    if (r.disposed)
      return;
    r.contentState = results.every((asset) => asset?.state === "ready") ? "ready" : "error";
    if (r.latest)
      paintTiger(r, r.latest);
  }
  function disposeTiger(r) {
    r.disposed = true;
    r.observer?.disconnect();
    r.latest = void 0;
    r.root.remove();
    r.nodes.clear();
    r.live.clear();
  }

  // .build/typescript/runtime/tiger/adapter.js
  var KEY_HINTS = {
    depth: "A／D 换观景处；1–4 选画片，左右键移动；Enter 查看排序。",
    packing: "1–5 选物件，方向键选格，Enter 放下；Q 旋转，Delete 取出，C 合包。",
    score: "方向键选节拍，Enter 开关；P 试听，Z 撤回，S 留下。",
    bells: "左右键选山路，下键返回；Enter 再听一次或让驮队先过。"
  };
  function createTigerGames({ dom, onAction }) {
    const { get: $, text, html } = dom, bindings = new EventBindings();
    let actionKey = "";
    function present(base, view) {
      const s = base, refs = view, waiting = refs.contentState !== "ready";
      $("tiger-tools").hidden = false;
      $("micro-panel").setAttribute("data-phase", waiting ? "loading" : s.play.complete ? "memory" : s.acted ? "play" : "invite");
      text("micro-title", TITLES[s.game]);
      const feedback = waiting ? refs.contentState === "error" ? "画作未能展开，点「重新试一次」可重新加载，也可以继续走。" : "江谷画作正在展开，准备好就能操作。" : s.feedback;
      text("micro-result", feedback);
      text("tiger-key-hint", KEY_HINTS[s.game]);
      $("micro-surface").setAttribute("aria-busy", String(refs.contentState === "loading"));
      let focus = "";
      if (s.game === "score") {
        const row = Math.floor(s.score.cursor / 8), beat = s.score.cursor % 8;
        focus = " 当前选择：" + VOICES[row] + "第" + (beat + 1) + "拍，" + (s.score.notes[row][beat] ? "有声音。" : "空白。");
      }
      if (s.game === "packing")
        focus = " 当前格：第" + (s.bag.cursor.x + 1) + "列、第" + (s.bag.cursor.y + 1) + "行。" + (s.bag.selected >= 0 ? "已选" + ITEMS[s.bag.selected].name + "。" : "");
      $("micro-surface").setAttribute("aria-label", PROMPTS[s.game] + " " + KEY_HINTS[s.game] + " R 重试。" + focus);
      const controls = [];
      if (s.game === "depth") {
        text("tiger-count", (s.depth.seen === 3 ? "两个观景处已看过" : "再看看另一边") + " · 四张画片");
        controls.push({ action: "check-depth", label: "看看排好了吗", primary: true });
      } else if (s.game === "packing") {
        const count = s.bag.poses.filter((p2) => p2.cell).length, selected = s.bag.selected;
        text("tiger-count", count + " / 5 件已收好" + (selected >= 0 ? " · " + ITEMS[selected].name : ""));
        controls.push({ action: "rotate", label: "旋转物件 ↻", disabled: selected < 0 }, { action: "take-out", label: "取出来", disabled: selected < 0 || !s.bag.poses[selected].cell }, { action: "close-bag", label: "合上背包", disabled: count < 5, primary: true });
      } else if (s.game === "score") {
        const voices = s.score.notes.filter((row) => row.some(Boolean)).length, rests = Array.from({ length: 8 }, (_, i) => i).filter((i) => s.score.notes.every((row) => !row[i])).length;
        text("tiger-count", voices + " 种声音 · " + rests + " 拍留白" + (s.score.audition === s.score.revision ? " · 已完整试听" : s.score.playing ? " · 试听中" : ""));
        controls.push({ action: "audition", label: s.score.playing ? "停止试听" : "试听八拍" }, { action: "undo", label: "撤回一笔", disabled: !s.score.history.length }, { action: "save-score", label: "留下这段瀑声", disabled: !scoreReady(s) || s.score.playing || s.score.audition !== s.score.revision, primary: true });
      } else {
        text("tiger-count", s.bells.junction === 2 ? "已经遇见山路旅伴" : s.bells.junction + 1 + " / 2 个转弯" + (s.bells.wrong ? " · 先沿原路返回" : " · 铃纹与声音同向"));
        if (s.bells.junction < 2)
          controls.push({ action: "listen-bell", label: "再听一次铃声" });
        else
          controls.push({ action: "let-pass", label: "让驮队先过", primary: true });
      }
      const key = s.game + ":" + controls.map((c) => c.action).join(",");
      if (key !== actionKey) {
        $("tiger-actions").replaceChildren();
        for (const control of controls) {
          const b = html("button", control.label, $("tiger-actions"));
          b.type = "button";
          b.setAttribute("data-action", control.action);
        }
        actionKey = key;
      }
      for (const control of controls) {
        const button = $("tiger-actions").querySelector('[data-action="' + control.action + '"]');
        if (!button)
          continue;
        if (button.textContent !== control.label)
          button.textContent = control.label;
        button.disabled = waiting || s.play.complete || !!control.disabled;
        button.setAttribute("data-primary", String(!!control.primary));
      }
    }
    const adapter = {
      create: (entry, options) => createTigerState(entry, options.reduced),
      act: (s, p2) => inputTiger(s, p2),
      move: (s, p2) => inputTiger(s, p2, true),
      release: (s) => releaseTiger(s),
      tick: (s, dt) => tickTiger(s, dt),
      draw: (svg, parent, entry) => drawTiger(svg, parent, TIGER_GAMES[entry.id]),
      paint: (refs, state) => paintTiger(refs, state),
      instruction: (entry) => PROMPTS[TIGER_GAMES[entry.id]],
      status: (s) => s.feedback,
      outcome(state, entry) {
        const s = state;
        let memory = MEMORIES[s.game];
        if (s.game === "score" && s.play.complete)
          memory += " 我的编排：" + s.score.notes.map((row, i) => VOICES[i] + "在第" + row.map((on, j) => on ? j + 1 : 0).filter(Boolean).join("、") + "拍").filter((_, i) => s.score.notes[i].some(Boolean)).join("；") + "。";
        return { id: s.id, edition: entry.edition, earned: s.play.complete === true, interaction: s.gesture, memory, title: s.play.complete ? entry.tag : entry.name };
      },
      assets: (entry) => tigerAssets(TIGER_GAMES[entry.id]),
      mount: (refs, context) => mountTiger(refs, context.host, context.cache),
      dispose: (refs) => disposeTiger(refs),
      point: (refs, p2) => tigerPoint(refs, p2),
      key: (s, key, phase) => keyTiger(s, key, phase),
      present
    };
    bindings.listen($("tiger-actions"), "click", (event) => {
      const button = event.target.closest?.("button[data-action]"), action = button?.getAttribute("data-action");
      if (button && !button.disabled && action)
        onAction(action);
    });
    return { adapter, destroy: () => bindings.destroy() };
  }

  // .build/typescript/journey/geometry.js
  function curve(knots2, subdivisions = 15) {
    if (knots2.length < 2)
      return [...knots2];
    const points = [];
    const sample = (a, b, c, d, t) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t * t + (-a + 3 * b - 3 * c + d) * t * t * t);
    for (let i = 0; i < knots2.length - 1; i++) {
      const a = knots2[Math.max(0, i - 1)], b = knots2[i], c = knots2[i + 1], d = knots2[Math.min(knots2.length - 1, i + 2)];
      for (let j = 0; j < subdivisions; j++)
        points.push({ x: sample(a.x, b.x, c.x, d.x, j / subdivisions), y: sample(a.y, b.y, c.y, d.y, j / subdivisions) });
    }
    points.push(knots2[knots2.length - 1]);
    return points;
  }

  // .build/typescript/runtime/tiger-trail/geometry.js
  var WORLD = Object.freeze({ width: 1e3, height: 720 });
  var PAINTED_CLIMB = [
    [380, 1010],
    [298, 965],
    [225, 916],
    [176, 878],
    [165, 844],
    [191, 813],
    [270, 783],
    [364, 745],
    [452, 705],
    [535, 667],
    [615, 632],
    [662, 605],
    [659, 583],
    [608, 560],
    [537, 538],
    [463, 515],
    [385, 492],
    [309, 470],
    [268, 448],
    [267, 425],
    [308, 404],
    [368, 385],
    [425, 367],
    [478, 345],
    [521, 320],
    [549, 298],
    [563, 278],
    [589, 265],
    [626, 259],
    [653, 260]
  ];
  var CLIMB_PATH = curve(PAINTED_CLIMB.map(([x, y]) => ({ x: x * WORLD.width / 1478, y: y * WORLD.height / 1064 })), 7);
  var PASSAGE_PATH = [
    { x: 90, y: 447 },
    { x: 220, y: 432 },
    { x: 335, y: 420 },
    { x: 405, y: 410 },
    { x: 530, y: 396 },
    { x: 650, y: 385 },
    { x: 760, y: 374 }
  ];
  var DESCENT_PATH = [
    { x: 230, y: 118 },
    { x: 500, y: 172 },
    { x: 640, y: 240 },
    { x: 350, y: 308 },
    { x: 255, y: 370 },
    { x: 590, y: 430 },
    { x: 730, y: 500 },
    { x: 585, y: 573 },
    { x: 680, y: 631 }
  ];
  var clamp7 = (value, low, high) => Math.max(low, Math.min(high, value));
  var distance2 = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  function makeTrail(points) {
    const cumulative = [0];
    for (let i = 1; i < points.length; i++)
      cumulative.push(cumulative[i - 1] + distance2(points[i - 1], points[i]));
    return { points, cumulative, length: cumulative[cumulative.length - 1] || 0 };
  }
  var CLIMB_TRAIL = makeTrail(CLIMB_PATH);
  var PASSAGE_TRAIL = makeTrail(PASSAGE_PATH);
  var DESCENT_TRAIL = makeTrail(DESCENT_PATH);
  function pointAt(trail, at) {
    const d = clamp7(Number.isFinite(at) ? at : 0, 0, trail.length);
    let index = 0;
    while (index < trail.points.length - 2 && trail.cumulative[index + 1] <= d)
      index++;
    const a = trail.points[index] || { x: 0, y: 0 }, b = trail.points[index + 1] || a;
    const length = distance2(a, b), ratio = length > 0 ? (d - (trail.cumulative[index] || 0)) / length : 0;
    return {
      x: a.x + (b.x - a.x) * ratio,
      y: a.y + (b.y - a.y) * ratio,
      distance: d,
      segment: index,
      heading: Math.atan2(b.y - a.y, b.x - a.x)
    };
  }
  function turnAhead(trail, at, within2 = 48) {
    const a = pointAt(trail, at), b = pointAt(trail, Math.min(trail.length, at + within2));
    return Math.abs(Math.atan2(Math.sin(b.heading - a.heading), Math.cos(b.heading - a.heading)));
  }

  // .build/typescript/runtime/tiger-trail/rules.js
  var TRAIL_GAMES = {
    "tiger-28-bends-v1": "tiger-climb",
    "tiger-middle-river-frame-v1": "tiger-river",
    "tiger-halfway-view-v1": "tiger-rest",
    "tiger-longdong-passage-v1": "tiger-passage"
  };
  var TITLES2 = {
    "tiger-climb": "二十八道拐 · 山路慢行",
    "tiger-river": "中虎跳江边 · 留下这一江激流",
    "tiger-rest": "中途客栈 · 在山腰歇一会儿",
    "tiger-passage": "龙洞瀑布 · 沿崖经过"
  };
  var PROMPTS2 = {
    "tiger-climb": "按住画面往山上走，松手停下看风景。",
    "tiger-river": "拖动画面取景，按下快门；选一帧喜欢的，定格这幅画。",
    "tiger-rest": "拖动画面看看对岸山景，歇好了就继续走。",
    "tiger-passage": "水帘落在沿崖小径旁。停一会儿看看，也可以继续行程。"
  };
  var MAX_CAPTURES = 5;
  var ARROWS = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"];
  var MOVEMENT_KEYS = { a: "ArrowLeft", d: "ArrowRight", w: "ArrowUp", s: "ArrowDown" };
  var keyName = (key) => MOVEMENT_KEYS[key.toLowerCase()] || key;
  var hasPoint = (p2) => Number.isFinite(p2.x) && Number.isFinite(p2.y);
  var scenePoint = (p2) => ({ x: clamp7(p2.x, 0, WORLD.width), y: clamp7(p2.y, 0, WORLD.height) });
  function walkStart(trail) {
    const start = pointAt(trail, 0);
    return {
      distance: 0,
      progress: 0,
      position: { x: start.x, y: start.y },
      heading: start.heading,
      speed: 0,
      held: false,
      arrivedAt: null,
      nextStep: 0
    };
  }
  function createTrailState(entry, options) {
    const game = TRAIL_GAMES[entry.id] || "tiger-rest";
    const zoom = game === "tiger-river" ? 1.25 : game === "tiger-rest" ? 1.12 : game === "tiger-climb" ? 1.52 : 1;
    const start = pointAt(CLIMB_TRAIL, 0);
    return {
      id: entry.id,
      route: "tiger",
      kind: game,
      game,
      age: 0,
      acted: false,
      dragging: false,
      gesture: "tap",
      done: false,
      x: 0.5,
      y: 0.5,
      play: {
        type: game,
        progress: 0,
        complete: false,
        completedAt: null,
        reduced: options.reduced
      },
      events: [],
      serial: 0,
      feedback: PROMPTS2[game],
      camera: { x: game === "tiger-climb" ? start.x + 105 : 500, y: game === "tiger-climb" ? start.y - 88 : 360, zoom },
      viewport: { width: WORLD.width / zoom, height: WORLD.height / zoom },
      climb: walkStart(CLIMB_TRAIL),
      passage: walkStart(PASSAGE_TRAIL),
      rest: { panX: 0 },
      river: {
        phase: options.riverArrival === "river" ? "river" : "descent",
        descentProgress: options.riverArrival === "river" || options.reduced ? 1 : 0,
        waveClock: 0,
        captures: [],
        selected: -1,
        selectionLocked: false,
        captureRequest: null,
        captureSerial: 0,
        burst: false,
        burstRemaining: 0,
        nextCaptureAt: 0
      },
      pointer: null,
      keys: []
    };
  }
  function copy(state) {
    return {
      ...state,
      play: { ...state.play },
      camera: { ...state.camera },
      viewport: { ...state.viewport },
      climb: { ...state.climb, position: { ...state.climb.position } },
      passage: { ...state.passage, position: { ...state.passage.position } },
      rest: { ...state.rest },
      river: {
        ...state.river,
        captures: state.river.captures.slice(),
        captureRequest: state.river.captureRequest ? { ...state.river.captureRequest, camera: { ...state.river.captureRequest.camera } } : null
      },
      pointer: state.pointer ? { ...state.pointer } : null,
      keys: state.keys.slice(),
      events: state.events.slice(-31)
    };
  }
  function emit3(state, type, x = 0.5, index) {
    state.events.push({ serial: ++state.serial, type, x: clamp7(x, 0, 1), ...index === void 0 ? {} : { index } });
    if (state.events.length > 32)
      state.events.shift();
  }
  function stopWalking(state) {
    for (const walk of [state.climb, state.passage]) {
      walk.held = false;
      walk.speed = 0;
    }
    state.pointer = null;
    state.keys = [];
    state.dragging = false;
  }
  function finish(state) {
    stopWalking(state);
    state.play.complete = true;
    state.play.progress = 1;
    state.play.completedAt = state.age;
    state.river.burst = false;
    state.river.burstRemaining = 0;
    state.river.captureRequest = null;
    emit3(state, "complete");
  }
  function requestCapture(state) {
    const river = state.river;
    if (river.phase !== "river" || river.captureRequest || river.captures.length >= MAX_CAPTURES)
      return false;
    river.captureRequest = { id: ++river.captureSerial, age: state.age, waveClock: river.waveClock, camera: { ...state.camera } };
    state.acted = true;
    emit3(state, "shutter", 0.5, river.captureRequest.id);
    return true;
  }
  function attachTrailCapture(state, url, requestId) {
    const request = state.river.captureRequest;
    if (state.done || state.play.complete || state.game !== "tiger-river" || state.river.phase !== "river" || !request || requestId !== void 0 && request.id !== requestId)
      return state;
    if (!/^data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(url) || url.length > 3e5) {
      return rejectTrailCapture(state, request.id);
    }
    const next = copy(state);
    next.river.captures.push({ ...request, camera: { ...request.camera }, url });
    if (!next.river.selectionLocked)
      next.river.selected = next.river.captures.length - 1;
    next.river.captureRequest = null;
    next.play.progress = 0.5;
    next.feedback = next.river.captures.length === MAX_CAPTURES ? "五帧都在这里了。选一张喜欢的，收进手帐。" : "这一帧留下了。可以换个构图再拍，也可以选好收进手帐。";
    if (next.river.captures.length >= MAX_CAPTURES) {
      next.river.burst = false;
      next.river.burstRemaining = 0;
    }
    emit3(next, "frame-ready", 0.5, next.river.selected);
    return next;
  }
  function rejectTrailCapture(state, requestId) {
    if (!state.river.captureRequest || requestId !== void 0 && state.river.captureRequest.id !== requestId)
      return state;
    const next = copy(state);
    next.river.captureRequest = null;
    next.river.burst = false;
    next.river.burstRemaining = 0;
    next.feedback = "这一帧没能保存，可以再拍一次；已经拍好的画面还在。";
    return next;
  }
  function beginWalk(state, point) {
    const walk = state.climb;
    if (walk.arrivedAt !== null)
      return;
    walk.held = true;
    state.pointer = point;
    state.feedback = PROMPTS2[state.game];
    state.acted = true;
    state.dragging = true;
    state.gesture = "hold";
  }
  function rememberViewport(state, input) {
    if (Number.isFinite(input.viewWidth) && input.viewWidth > 0)
      state.viewport.width = Math.min(WORLD.width, input.viewWidth);
    if (Number.isFinite(input.viewHeight) && input.viewHeight > 0)
      state.viewport.height = Math.min(WORLD.height, input.viewHeight);
  }
  function viewCamera(state, camera) {
    const halfW = Math.min(WORLD.width, state.viewport.width) / 2;
    const halfH = Math.min(WORLD.height, state.viewport.height) / 2;
    return {
      zoom: clamp7(camera.zoom, 1, 1.8),
      x: clamp7(camera.x, halfW, WORLD.width - halfW),
      y: clamp7(camera.y, halfH, WORLD.height - halfH)
    };
  }
  function pan(state, point) {
    if (!state.pointer)
      return;
    const dx = point.x - state.pointer.x, dy = point.y - state.pointer.y;
    const before = state.camera;
    state.camera = viewCamera(state, { ...before, x: before.x - dx, y: before.y - dy });
    state.pointer = { x: point.x + state.camera.x - before.x, y: point.y + state.camera.y - before.y };
    state.rest.panX = (state.camera.x - 500) / 500;
    state.dragging = true;
    state.acted = true;
    state.gesture = "drag";
  }
  function moveTrail(state, input) {
    if (state.done || state.play.complete || state.game === "tiger-climb" || !hasPoint(input))
      return state;
    const next = copy(state), point = scenePoint(input);
    rememberViewport(next, input);
    if (next.pointer && (next.game === "tiger-rest" || next.river.phase === "river"))
      pan(next, point);
    else
      return state;
    return next;
  }
  function inputTrail(state, input) {
    if (input.action === "viewport") {
      const next2 = copy(state);
      rememberViewport(next2, input);
      if (next2.game === "tiger-rest" || next2.game === "tiger-river")
        next2.camera = viewCamera(next2, next2.camera);
      return next2;
    }
    if (state.done || state.play.complete)
      return state;
    if (input.phase === "release" && !input.action)
      return releaseTrail(state);
    const next = copy(state), action = input.action || "";
    rememberViewport(next, input);
    if (input.phase === "press" && !action) {
      if (!hasPoint(input))
        return state;
      const point = scenePoint(input);
      if (next.game === "tiger-climb")
        beginWalk(next, point);
      else if (next.game === "tiger-rest" || next.river.phase === "river") {
        next.pointer = point;
        next.dragging = true;
        next.acted = true;
        next.gesture = "drag";
      }
      return next;
    }
    if (input.phase === "press")
      return state;
    if (next.game === "tiger-rest" || next.game === "tiger-passage") {
      if (action === "continue") {
        stopWalking(next);
        next.done = true;
        next.acted = true;
        next.play.complete = false;
        next.play.completedAt = null;
        next.feedback = "继续沿高路行进。";
        return next;
      }
    }
    if (next.game === "tiger-climb")
      return state;
    if (next.game === "tiger-river") {
      if (action === "continue-to-river" && next.river.phase === "descent") {
        next.river.phase = "river";
        next.river.descentProgress = 1;
        next.acted = true;
        next.feedback = PROMPTS2[next.game];
        emit3(next, "river-arrive");
        return next;
      }
      if (next.river.phase !== "river")
        return state;
      if (action === "shutter") {
        if (!requestCapture(next))
          next.feedback = next.river.captures.length >= MAX_CAPTURES ? "已有五帧，先选一张收好，或重新取景。" : "正在留下这一帧。";
        return next;
      }
      if (action === "burst") {
        if (next.river.burst) {
          next.river.burst = false;
          next.river.burstRemaining = 0;
          next.feedback = "连拍停下了，选一帧喜欢的。";
          return next;
        }
        const remaining = MAX_CAPTURES - next.river.captures.length - (next.river.captureRequest ? 1 : 0);
        if (remaining <= 0) {
          next.feedback = "已有五帧，选一张喜欢的，或重新取景。";
          return next;
        }
        next.river.burst = true;
        next.river.burstRemaining = remaining;
        if (requestCapture(next))
          next.river.burstRemaining--;
        next.river.nextCaptureAt = next.age + 0.65;
        next.feedback = "连拍中，最多留下五帧；也可以再按一次停下。";
        return next;
      }
      if (action === "stop-burst") {
        next.river.burst = false;
        next.river.burstRemaining = 0;
        next.feedback = "连拍停下了，选一帧喜欢的。";
        return next;
      }
      if (action === "select-frame" && Number.isInteger(input.value) && input.value >= 0 && input.value < next.river.captures.length) {
        next.river.selected = input.value;
        next.river.selectionLocked = true;
        next.river.burst = false;
        next.river.burstRemaining = 0;
        next.feedback = "选中了这一帧。喜欢的话，就收进手帐。";
        next.acted = true;
        return next;
      }
      if (action === "keep" || action === "collect") {
        if (next.river.captureRequest || next.river.burst) {
          next.feedback = "先停下连拍，选一帧喜欢的画面。";
          return next;
        }
        const selected = next.river.captures[next.river.selected];
        if (!selected?.url) {
          next.feedback = "先按快门留下画面，再选一帧收进手帐。";
          return next;
        }
        next.acted = true;
        next.feedback = "这一江激流和自己的构图，留在了手帐里。";
        finish(next);
        return next;
      }
      if (action === "retake" || action === "clear-frames") {
        next.river.captures = [];
        next.river.selected = -1;
        next.river.selectionLocked = false;
        next.river.captureRequest = null;
        next.river.burst = false;
        next.river.burstRemaining = 0;
        next.play.progress = 0;
        next.feedback = "重新取景。之前已经收好的手帐不会改变。";
        return next;
      }
    }
    if (action === "zoom" && Number.isFinite(input.value) && (next.game === "tiger-river" || next.game === "tiger-rest")) {
      const zoom = clamp7(input.value, 1, 1.8), ratio = next.camera.zoom / zoom;
      next.viewport.width = Math.min(WORLD.width, next.viewport.width * ratio);
      next.viewport.height = Math.min(WORLD.height, next.viewport.height * ratio);
      next.camera = viewCamera(next, { ...next.camera, zoom });
      next.acted = true;
      next.rest.panX = (next.camera.x - 500) / 500;
      return next;
    }
    return state;
  }
  function releaseTrail(state) {
    if (!state.pointer && !state.keys.length && !state.climb.held && !state.passage.held && !state.river.burst)
      return state;
    const next = copy(state);
    stopWalking(next);
    next.river.burst = false;
    next.river.burstRemaining = 0;
    return next;
  }
  function advanceClimb(state, dt) {
    const walk = state.climb, trail = CLIMB_TRAIL;
    if (walk.arrivedAt !== null)
      return;
    if (!walk.held && !state.keys.length) {
      walk.speed = 0;
      return;
    }
    const direction = pointAt(trail, walk.distance + 12).heading;
    const uphill = Math.max(0, -Math.sin(direction)), bend = Math.min(1, turnAhead(trail, walk.distance, 28) / 1.4);
    const pace = 78 * (1 - uphill * 0.27) * (1 - bend * 0.37);
    walk.speed += (pace - walk.speed) * (1 - Math.exp(-dt * 7));
    const travelled = Math.min(walk.speed * dt, trail.length - walk.distance);
    walk.distance += travelled;
    const position = pointAt(trail, walk.distance);
    const behind = pointAt(trail, walk.distance - 6), ahead = pointAt(trail, walk.distance + 10);
    const heading = Math.atan2(ahead.y - behind.y, ahead.x - behind.x);
    walk.heading += Math.atan2(Math.sin(heading - walk.heading), Math.cos(heading - walk.heading)) * (1 - Math.exp(-dt * 10));
    walk.position = { x: position.x, y: position.y };
    walk.progress = walk.distance / trail.length;
    state.play.progress = walk.progress * 0.94;
    state.x = position.x / WORLD.width;
    state.y = position.y / WORLD.height;
    if (travelled > 0) {
      walk.nextStep -= travelled;
      if (walk.nextStep <= 0) {
        walk.nextStep += 20;
        emit3(state, "trail-step", state.x, Math.floor(walk.distance / 20));
      }
    }
    if (trail.length - walk.distance <= 0.2) {
      const end = pointAt(trail, trail.length);
      walk.distance = trail.length;
      walk.progress = 1;
      walk.position = { x: end.x, y: end.y };
      walk.arrivedAt = state.age;
      stopWalking(state);
      state.feedback = "转上山肩了。停下脚步，看看谷底的金沙江。";
      emit3(state, "trail-arrive", end.x / WORLD.width);
    }
  }
  function tickTrail(state, dt) {
    if (state.done || !Number.isFinite(dt) || dt <= 0)
      return state;
    const next = copy(state), elapsed = Math.min(0.12, dt);
    next.age += elapsed;
    if (next.play.complete) {
      next.done = next.age - (next.play.completedAt ?? next.age) >= (next.play.reduced ? 0.25 : 0.85);
      return next;
    }
    if (next.game === "tiger-climb") {
      const walk = next.climb;
      const steps2 = Math.max(1, Math.ceil(elapsed / (1 / 60)));
      for (let i = 0; i < steps2; i++)
        advanceClimb(next, elapsed / steps2);
      const follow = next.play.reduced ? 1 : 1 - Math.exp(-elapsed * 3.8);
      const target = walk.arrivedAt !== null ? { x: 590, y: 355, zoom: 1.02 } : {
        x: clamp7(walk.position.x + 105, 0, WORLD.width),
        y: clamp7(walk.position.y - 88, 0, WORLD.height),
        zoom: 1.52 - walk.progress * 0.15
      };
      next.camera.x += (target.x - next.camera.x) * follow;
      next.camera.y += (target.y - next.camera.y) * follow;
      next.camera.zoom += (target.zoom - next.camera.zoom) * follow;
      if (walk.arrivedAt !== null && next.age - walk.arrivedAt >= (next.play.reduced ? 0.65 : 2.1))
        finish(next);
    }
    if (next.game === "tiger-passage") {
      const walk = next.passage;
      walk.progress = next.play.reduced ? 1 : Math.min(1, walk.progress + elapsed / 7);
      walk.distance = walk.progress * PASSAGE_TRAIL.length;
      const position = pointAt(PASSAGE_TRAIL, walk.distance);
      walk.position = { x: position.x, y: position.y };
      walk.heading = position.heading;
      if (walk.progress >= 1 && walk.arrivedAt === null)
        walk.arrivedAt = next.age;
      walk.speed = walk.arrivedAt !== null ? 0 : PASSAGE_TRAIL.length / 7;
      next.play.progress = 0;
      next.play.complete = false;
    }
    if (next.game === "tiger-river") {
      if (next.river.phase === "descent")
        next.river.descentProgress = Math.min(1, next.river.descentProgress + elapsed / 3.4);
      else {
        next.river.waveClock += elapsed;
        if (next.river.burst && next.river.burstRemaining > 0 && !next.river.captureRequest && next.age >= next.river.nextCaptureAt) {
          if (requestCapture(next))
            next.river.burstRemaining--;
          next.river.nextCaptureAt = next.age + 0.65;
        }
        if (next.river.burstRemaining <= 0 && !next.river.captureRequest)
          next.river.burst = false;
      }
    }
    if ((next.game === "tiger-rest" || next.game === "tiger-river" && next.river.phase === "river") && next.keys.length) {
      const dx = Number(next.keys.includes("ArrowRight")) - Number(next.keys.includes("ArrowLeft"));
      const dy = Number(next.keys.includes("ArrowDown")) - Number(next.keys.includes("ArrowUp"));
      next.camera = viewCamera(next, {
        ...next.camera,
        x: next.camera.x + dx * elapsed * 180 / next.camera.zoom,
        y: next.camera.y + dy * elapsed * 180 / next.camera.zoom
      });
      next.rest.panX = (next.camera.x - 500) / 500;
    }
    return next;
  }
  function keyTrail(state, key, phase = "down") {
    const normalized = keyName(key);
    if (ARROWS.includes(normalized) || state.game === "tiger-climb" && (normalized === " " || normalized === "Enter")) {
      const next = copy(state);
      next.keys = phase === "up" ? next.keys.filter((item) => item !== normalized) : [.../* @__PURE__ */ new Set([...next.keys, normalized])];
      if (phase === "down" && !next.done && !next.play.complete) {
        next.acted = true;
        next.gesture = "keyboard";
      }
      if (!next.keys.length && !next.climb.held) {
        next.climb.speed = 0;
        next.passage.speed = 0;
      }
      return next;
    }
    if (phase === "up")
      return ["Enter", " ", "+", "=", "-", "_", "b", "B", "k", "K"].includes(key) ? state : null;
    if (state.done || state.play.complete)
      return null;
    if (key === "Enter" || key === " ") {
      if (state.game === "tiger-rest" || state.game === "tiger-passage")
        return inputTrail(state, { action: "continue" });
      return inputTrail(state, { action: state.river.phase === "descent" ? "continue-to-river" : "shutter" });
    }
    if ((key === "+" || key === "=") && (state.game === "tiger-river" || state.game === "tiger-rest"))
      return inputTrail(state, { action: "zoom", value: state.camera.zoom + 0.15 });
    if ((key === "-" || key === "_") && (state.game === "tiger-river" || state.game === "tiger-rest"))
      return inputTrail(state, { action: "zoom", value: state.camera.zoom - 0.15 });
    if ((key === "b" || key === "B") && state.game === "tiger-river")
      return inputTrail(state, { action: "burst" });
    if ((key === "k" || key === "K") && state.game === "tiger-river")
      return inputTrail(state, { action: "keep" });
    if (/^[1-5]$/.test(key) && state.game === "tiger-river")
      return inputTrail(state, { action: "select-frame", value: Number(key) - 1 });
    return null;
  }

  // .build/typescript/runtime/tiger-trail/scene.js
  var FILES = {
    high: "scenes/tiger-climb-walk-v3.webp",
    river: "scenes/tiger-river-v2.webp",
    rest: "scenes/tiger-halfway-v2.webp",
    passage: "scenes/tiger-longdong-v2.webp",
    hiker: MAP_WALK_FILE
  };
  var TIGER_TRAIL_ROUTE_ASSETS = Object.values(FILES);
  function tigerTrailAssets(game) {
    const scene = game === "tiger-climb" ? FILES.high : game === "tiger-river" ? FILES.river : game === "tiger-rest" ? FILES.rest : FILES.passage;
    return { scene, ...game === "tiger-climb" || game === "tiger-passage" ? { actor: FILES.hiker } : {} };
  }
  var clamp8 = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
  var smooth = (n) => {
    const q = clamp8(n, 0, 1);
    return q * q * (3 - 2 * q);
  };
  var attrs3 = (node2, values) => {
    for (const [key, value] of Object.entries(values))
      if (node2.getAttribute(key) !== String(value))
        node2.setAttribute(key, String(value));
  };
  function imageRect(entry) {
    const ratio = (entry.image.naturalWidth || 1280) / (entry.image.naturalHeight || 720);
    const width = Math.max(WORLD.width, WORLD.height * ratio), height = width / ratio;
    return { x: (WORLD.width - width) / 2, y: (WORLD.height - height) / 2, width, height };
  }
  function project(camera, height) {
    const scale = Math.max(1, height / WORLD.height) * clamp8(camera.zoom, 1, 1.8);
    const vw = WORLD.width / scale, vh = height / scale;
    const cx = vw < WORLD.width ? clamp8(camera.x, vw / 2, WORLD.width - vw / 2) : WORLD.width / 2;
    const cy = vh < WORLD.height ? clamp8(camera.y, vh / 2, WORLD.height - vh / 2) : WORLD.height / 2;
    return { scale, x: WORLD.width / 2 - cx * scale, y: height / 2 - cy * scale, width: WORLD.width, height };
  }
  function walkingFrame(stride) {
    return Math.floor(Math.max(0, stride) / 4) % 8;
  }
  function stageFrame(state, height, capture = false) {
    const climb = state.game === "tiger-climb", river = state.game === "tiger-river", passage = state.game === "tiger-passage";
    const camera = { ...state.camera }, progress = climb ? state.climb.progress : passage ? state.passage.progress : river ? state.river.descentProgress : 0;
    const request = capture ? state.river.captureRequest : null;
    if (request)
      Object.assign(camera, request.camera);
    else if (passage) {
      camera.x = state.passage.position.x + 90;
      camera.y = state.passage.position.y - 50;
      camera.zoom = 1.12 - progress * 0.05;
    } else if (river && state.river.phase === "descent") {
      const q = smooth(progress);
      camera.y -= (1 - q) * 110;
      camera.zoom += (1 - q) * 0.18;
    }
    let actor = null;
    if (climb) {
      const facing = Math.cos(state.climb.heading) < 0 ? -1 : 1;
      actor = { at: state.climb.position, width: 38 - smooth(progress) * 10, frame: walkingFrame(state.climb.distance), rotation: clamp8(Math.sin(state.climb.heading) * facing * 0.1, -0.08, 0.06), alpha: 1, mirror: facing };
    } else if (passage)
      actor = { at: state.passage.position, width: 40 - progress * 10, frame: walkingFrame(state.passage.distance), rotation: -0.025, alpha: 1, mirror: Math.cos(state.passage.heading) < 0 ? -1 : 1 };
    return {
      camera,
      projection: project(camera, height),
      age: request?.age ?? state.age,
      wave: request?.waveClock ?? (river ? state.river.waveClock : state.age),
      reduced: !!state.play.reduced,
      actor,
      river,
      passage,
      rest: state.game === "tiger-rest",
      capture
    };
  }
  var HIGH_FLOW = [
    { x: 0.674, y: 0.654 },
    { x: 0.675, y: 0.682 },
    { x: 0.68, y: 0.71 },
    { x: 0.705, y: 0.744 },
    { x: 0.721, y: 0.772 },
    { x: 0.745, y: 0.811 },
    { x: 0.777, y: 0.841 },
    { x: 0.828, y: 0.876 },
    { x: 0.878, y: 0.911 },
    { x: 0.919, y: 0.946 },
    { x: 0.957, y: 0.983 },
    { x: 0.98, y: 1 }
  ];
  var HIGH_WATER = [
    ...HIGH_FLOW.map((p2) => ({ x: p2.x - (15e-4 + (p2.y - 0.65) * 0.024), y: p2.y })),
    ...HIGH_FLOW.slice().reverse().map((p2) => ({ x: p2.x + (15e-4 + (p2.y - 0.65) * 0.024), y: p2.y }))
  ];
  var RIVER_WATER = [
    { x: 0, y: 0.54 },
    { x: 0.15, y: 0.532 },
    { x: 0.29, y: 0.526 },
    { x: 0.36, y: 0.516 },
    { x: 0.46, y: 0.512 },
    { x: 0.56, y: 0.513 },
    { x: 0.65, y: 0.521 },
    { x: 0.72, y: 0.523 },
    { x: 0.82, y: 0.541 },
    { x: 0.87, y: 0.565 },
    { x: 1, y: 0.584 },
    { x: 1, y: 1 },
    { x: 0, y: 1 }
  ];
  var RIVER_ROCKS = [
    [{ x: 0.497, y: 0.647 }, { x: 0.52, y: 0.6 }, { x: 0.54, y: 0.584 }, { x: 0.548, y: 0.548 }, { x: 0.568, y: 0.516 }, { x: 0.589, y: 0.521 }, { x: 0.61, y: 0.545 }, { x: 0.638, y: 0.565 }, { x: 0.675, y: 0.588 }, { x: 0.707, y: 0.618 }, { x: 0.724, y: 0.664 }, { x: 0.713, y: 0.701 }, { x: 0.657, y: 0.716 }, { x: 0.6, y: 0.699 }, { x: 0.551, y: 0.673 }],
    [{ x: 0, y: 0.55 }, { x: 0.041, y: 0.537 }, { x: 0.083, y: 0.536 }, { x: 0.12, y: 0.566 }, { x: 0.156, y: 0.612 }, { x: 0.156, y: 0.637 }, { x: 0.097, y: 0.644 }, { x: 0, y: 0.641 }],
    [{ x: 0.736, y: 0.731 }, { x: 0.745, y: 0.699 }, { x: 0.781, y: 0.705 }, { x: 0.805, y: 0.709 }, { x: 0.85, y: 0.681 }, { x: 0.875, y: 0.711 }, { x: 0.862, y: 0.727 }, { x: 0.85, y: 0.754 }, { x: 0.809, y: 0.777 }, { x: 0.759, y: 0.766 }],
    [{ x: 0.874, y: 0.79 }, { x: 0.887, y: 0.755 }, { x: 0.91, y: 0.735 }, { x: 0.933, y: 0.746 }, { x: 0.965, y: 0.762 }, { x: 1, y: 0.77 }, { x: 1, y: 0.886 }, { x: 0.958, y: 0.864 }, { x: 0.9, y: 0.837 }],
    [{ x: 0, y: 0.874 }, { x: 0.042, y: 0.868 }, { x: 0.094, y: 0.875 }, { x: 0.139, y: 0.874 }, { x: 0.195, y: 0.858 }, { x: 0.234, y: 0.858 }, { x: 0.272, y: 0.867 }, { x: 0.326, y: 0.858 }, { x: 0.365, y: 0.879 }, { x: 0.397, y: 0.936 }, { x: 0.424, y: 1 }, { x: 0, y: 1 }],
    [{ x: 0.509, y: 0.516 }, { x: 0.523, y: 0.502 }, { x: 0.539, y: 0.507 }, { x: 0.553, y: 0.52 }],
    [{ x: 0.637, y: 0.53 }, { x: 0.644, y: 0.509 }, { x: 0.654, y: 0.51 }, { x: 0.665, y: 0.531 }],
    [{ x: 0.71, y: 0.539 }, { x: 0.724, y: 0.514 }, { x: 0.74, y: 0.513 }, { x: 0.755, y: 0.536 }]
  ];
  var FALL_FLOW = [
    { x: 0.234, y: 0.025 },
    { x: 0.26, y: 0.12 },
    { x: 0.29, y: 0.24 },
    { x: 0.308, y: 0.34 },
    { x: 0.33, y: 0.43 },
    { x: 0.357, y: 0.51 },
    { x: 0.376, y: 0.563 },
    { x: 0.401, y: 0.613 },
    { x: 0.421, y: 0.704 },
    { x: 0.447, y: 0.794 },
    { x: 0.479, y: 0.885 },
    { x: 0.505, y: 0.956 },
    { x: 0.521, y: 1 }
  ];
  var FALL_WATER = [
    ...FALL_FLOW.map((p2) => ({ x: p2.x - (p2.y < 0.5 ? 4e-3 : 8e-3), y: p2.y })),
    ...FALL_FLOW.slice().reverse().map((p2) => ({ x: p2.x + (p2.y < 0.5 ? 5e-3 : 0.01), y: p2.y }))
  ];
  var FALL_LEDGE = [{ x: 0.32, y: 0.565 }, { x: 0.46, y: 0.565 }, { x: 0.46, y: 0.605 }, { x: 0.32, y: 0.605 }];
  function waterPolygon(frame, rect) {
    return (frame.river ? RIVER_WATER : frame.passage ? FALL_WATER : HIGH_WATER).map((p2) => ({ x: rect.x + p2.x * rect.width, y: rect.y + p2.y * rect.height }));
  }
  function waterHoles(frame, rect) {
    return (frame.river ? RIVER_ROCKS : frame.passage ? [FALL_LEDGE] : []).map((rock) => rock.map((p2) => ({ x: rect.x + p2.x * rect.width, y: rect.y + p2.y * rect.height })));
  }
  function within(p2, polygon) {
    let yes = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const a = polygon[i], b = polygon[j];
      if (a.y > p2.y !== b.y > p2.y && p2.x < (b.x - a.x) * (p2.y - a.y) / (b.y - a.y) + a.x)
        yes = !yes;
    }
    return yes;
  }
  function waves(frame, rect) {
    const polygon = waterPolygon(frame, rect), holes = waterHoles(frame, rect), count = frame.river ? 38 : frame.rest ? 0 : frame.passage ? 14 : 16;
    const time = frame.reduced ? 1.7 : frame.wave;
    const result = [];
    for (let i = 0; i < count; i++) {
      const q = ((time * (frame.river ? 0.095 : frame.passage ? 0.18 : 0.035) + i * 0.137) % 1 + 1) % 1;
      const flow = frame.passage ? FALL_FLOW : HIGH_FLOW;
      const section = Math.min(flow.length - 2, Math.floor(q * (flow.length - 1))), t = q * (flow.length - 1) - section;
      const a = flow[section], b = flow[section + 1];
      const x = frame.river ? rect.x + (0.43 + q * 0.4 + Math.sin(i * 5.71) * (0.02 + q * 0.14)) * rect.width : rect.x + (a.x + (b.x - a.x) * t) * rect.width;
      const y = frame.river ? rect.y + (0.51 + q * 0.5) * rect.height : rect.y + (a.y + (b.y - a.y) * t) * rect.height;
      if (!within({ x, y }, polygon) || holes.some((hole) => within({ x, y }, hole)))
        continue;
      result.push({ x, y, length: (frame.river ? 12 : frame.passage ? 9 : 5) + q * (frame.river ? 30 : 8), alpha: Math.sin(q * Math.PI) * (frame.river ? 0.45 : frame.passage ? 0.25 : 0.35), bend: 3 + Math.sin(time * 1.2 + i) * 2 });
    }
    return result;
  }
  function actorCrop(entry, frame) {
    const [x, y, width, height] = MAP_WALK_FRAMES[frame];
    return { x, y, width, height };
  }
  var HIKER_ANCHORS = MAP_WALK_FRAMES.map(([, , width, height, footX, footY]) => ({ x: footX / width, y: footY / height }));
  var svgSequence = 0;
  function fallback2(svg, parent, game) {
    const root = svg("g", { class: "tiger-trail-fallback" }, parent), defs = svg("defs", {}, root);
    const clipId = "tiger-trail-water-" + ++svgSequence;
    const waterClip = svg("mask", { id: clipId, maskUnits: "userSpaceOnUse", maskContentUnits: "userSpaceOnUse", x: 0, y: 0, width: WORLD.width, height: WORLD.height }, defs);
    const waterShape = svg("polygon", { fill: "white" }, waterClip);
    const rockShapes = RIVER_ROCKS.map(() => svg("polygon", { fill: "black" }, waterClip));
    const paper2 = svg("rect", { x: 0, y: 0, width: WORLD.width, height: 720, fill: "#f3edda" }, root);
    const world = svg("g", {}, root), background = svg("image", { href: tigerTrailAssets(game).scene }, world);
    const river = svg("g", { mask: "url(#" + clipId + ")" }, world);
    const waveNodes = Array.from({ length: 38 }, () => svg("path", { fill: "none", stroke: "#fff6d9", "stroke-linecap": "round", "stroke-width": 2.1 }, river));
    const shadow = svg("ellipse", { fill: "#243b32", opacity: 0.2 }, world), hiker = svg("g", {}, world);
    const crop = svg("svg", { overflow: "hidden", preserveAspectRatio: "none" }, hiker), actor = svg("image", { href: FILES.hiker }, crop);
    const loading = svg("text", { x: 500, y: 360, "data-loading": "true", "text-anchor": "middle", fill: "#476152", "font-family": "Georgia, Songti SC, serif", "font-size": 19 }, root);
    loading.textContent = "江谷画作正在展开…";
    return {
      root,
      paint(frame, resources) {
        const p2 = frame.projection;
        attrs3(parent, { viewBox: "0 0 " + p2.width + " " + p2.height, preserveAspectRatio: "none" });
        attrs3(paper2, { height: p2.height });
        attrs3(loading, { y: p2.height / 2, display: resources.has("scene") ? "none" : "" });
        attrs3(world, { transform: "translate(" + p2.x + " " + p2.y + ") scale(" + p2.scale + ")" });
        const scene = resources.get("scene");
        if (!scene)
          return;
        const rect = imageRect(scene);
        attrs3(background, { ...rect, preserveAspectRatio: "none" });
        attrs3(waterShape, { points: waterPolygon(frame, rect).map((v) => v.x + "," + v.y).join(" ") });
        const holes = waterHoles(frame, rect);
        for (let i = 0; i < rockShapes.length; i++)
          attrs3(rockShapes[i], holes[i] ? { points: holes[i].map((v) => v.x + "," + v.y).join(" "), display: "" } : { display: "none" });
        const lines = waves(frame, rect);
        for (let i = 0; i < waveNodes.length; i++) {
          const line2 = lines[i];
          attrs3(waveNodes[i], line2 ? {
            display: "",
            opacity: line2.alpha,
            "stroke-width": frame.passage ? 1.05 : 2.1,
            d: "M" + line2.x + " " + line2.y + " q" + (frame.passage ? line2.length * 0.14 : line2.length * 0.45) + " " + (frame.passage ? line2.length * 0.5 : -line2.bend) + " " + (frame.passage ? line2.length * 0.45 : line2.length) + " " + (frame.passage ? line2.length : 0)
          } : { display: "none" });
        }
        const art = resources.get("actor");
        if (frame.actor && art) {
          const pose = frame.actor, region2 = actorCrop(art, pose.frame), ah = pose.width * region2.height / region2.width, anchor = HIKER_ANCHORS[pose.frame];
          attrs3(hiker, { display: "", transform: "translate(" + pose.at.x + " " + pose.at.y + ") rotate(" + pose.rotation * 180 / Math.PI + ") scale(" + pose.mirror + " 1)" });
          attrs3(crop, { viewBox: [region2.x, region2.y, region2.width, region2.height].join(" "), x: -pose.width * anchor.x, y: -ah * anchor.y, width: pose.width, height: ah });
          attrs3(actor, { width: art.image.naturalWidth, height: art.image.naturalHeight });
          attrs3(shadow, { display: "", cx: pose.at.x, cy: pose.at.y + 2, rx: 12, ry: 3.5 });
        } else {
          attrs3(hiker, { display: "none" });
          attrs3(shadow, { display: "none" });
        }
      },
      dispose() {
        root.remove();
      }
    };
  }
  function encodeCapture(source2) {
    const budget = 3e5;
    for (const quality of [0.82, 0.7, 0.58]) {
      const url = source2.toDataURL("image/webp", quality);
      if (url.length <= budget && /^data:image\/(?:webp|png|jpeg);base64,/.test(url))
        return url;
    }
    for (const side of [800, 640, 480, 320]) {
      const scale = Math.min(1, side / Math.max(source2.width, source2.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(source2.width * scale));
      canvas.height = Math.max(1, Math.round(source2.height * scale));
      const context = canvas.getContext("2d");
      if (!context)
        throw new Error("Canvas is unavailable.");
      context.fillStyle = "#f3edda";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(source2, 0, 0, canvas.width, canvas.height);
      for (const format of ["image/webp", "image/jpeg"]) {
        const url = canvas.toDataURL(format, side >= 640 ? 0.7 : 0.62);
        if (url.length <= budget && /^data:image\/(?:webp|png|jpeg);base64,/.test(url))
          return url;
      }
    }
    throw new Error("The frozen painting exceeds the journal image budget.");
  }
  async function renderer2(P, host, resources, initialHeight, displayWidth, cancelled, onLost) {
    const app = new P.Application(), textures = /* @__PURE__ */ new Map(), crops = [];
    let disposed = false;
    const resolution = (height) => Math.max(0.25, Math.min(2, displayWidth() / WORLD.width * Math.min(2, globalThis.devicePixelRatio || 1), Math.sqrt(3e6 / (WORLD.width * height))));
    const scene = new P.Container(), paper2 = new P.Graphics(), world = new P.Container();
    const waterMask = new P.Sprite(P.Texture.EMPTY), whitewater = new P.Graphics(), shadow = new P.Graphics();
    let maskTexture = null, maskKey = "";
    let background = null, water2 = null, original = null, hiker = null;
    const loss = (event) => {
      event.preventDefault();
      dispose();
      onLost();
    };
    function dispose() {
      if (disposed)
        return;
      disposed = true;
      try {
        app.canvas?.removeEventListener("webglcontextlost", loss);
      } catch {
      }
      try {
        app.destroy(true, { children: true });
      } catch {
      }
      for (const texture of crops)
        texture.destroy(false);
      for (const texture of textures.values())
        texture.destroy(true);
      maskTexture?.destroy(true);
      maskTexture = null;
      textures.clear();
      crops.length = 0;
    }
    try {
      let setWaterMask2 = function(frame, rect) {
        const key = frame.river ? "river" : frame.passage ? "passage" : "high";
        if (maskKey === key)
          return;
        const canvas = document.createElement("canvas");
        canvas.width = WORLD.width;
        canvas.height = WORLD.height;
        const context = canvas.getContext("2d");
        if (!context)
          throw new Error("The river mask could not be made.");
        const polygon = (points) => {
          context.beginPath();
          context.moveTo(points[0].x, points[0].y);
          for (const p2 of points.slice(1))
            context.lineTo(p2.x, p2.y);
          context.closePath();
          context.fill();
        };
        context.fillStyle = "#ffffff";
        polygon(waterPolygon(frame, rect));
        context.globalCompositeOperation = "destination-out";
        for (const hole of waterHoles(frame, rect))
          polygon(hole);
        const previous = maskTexture;
        maskTexture = P.Texture.from(canvas, true);
        waterMask.texture = maskTexture;
        previous?.destroy(true);
        maskKey = key;
      }, paint2 = function(frame) {
        if (disposed)
          return;
        const projection = frame.projection, res = resolution(projection.height);
        if (app.screen.height !== projection.height || Math.abs(app.renderer.resolution - res) > 0.01)
          app.renderer.resize(WORLD.width, projection.height, res);
        paper2.clear().rect(0, 0, WORLD.width, projection.height).fill(15986138);
        world.scale.set(projection.scale);
        world.position.set(projection.x, projection.y);
        const rect = imageRect(resources.get("scene"));
        background.position.set(rect.x, rect.y);
        background.width = rect.width;
        background.height = rect.height;
        const activeWater = !frame.rest;
        water2.visible = activeWater;
        whitewater.visible = activeWater;
        waterMask.visible = activeWater;
        if (activeWater) {
          setWaterMask2(frame, rect);
          water2.position.set(rect.x, rect.y);
          water2.width = rect.width;
          water2.height = rect.height;
          const buffer = water2.geometry.getBuffer("aPosition"), values = buffer.data;
          for (let i = 0; i < values.length; i += 2) {
            const x = original[i], y = original[i + 1], q = y / sceneTexture.height;
            values[i] = x + (frame.reduced ? 0 : Math.sin(y * 0.043 + frame.wave * 1.3) * (frame.river ? 2.4 : frame.passage ? 0.38 : 1.05) * q);
            values[i + 1] = y + (frame.reduced ? 0 : Math.sin(x * 0.034 + y * 0.01 - frame.wave * 1.8) * (frame.river ? 1.9 : frame.passage ? 0.55 : 0.7) * q);
          }
          buffer.update();
          whitewater.clear();
          for (const wave of waves(frame, rect))
            whitewater.moveTo(wave.x, wave.y).quadraticCurveTo(wave.x + wave.length * (frame.passage ? 0.14 : 0.45), wave.y + (frame.passage ? wave.length * 0.5 : -wave.bend), wave.x + wave.length * (frame.passage ? 0.45 : 1), wave.y + (frame.passage ? wave.length : 0)).stroke({ color: 16775133, width: frame.river ? 2.1 : frame.passage ? 1.05 : 1.3, alpha: wave.alpha, cap: "round" });
        }
        shadow.clear();
        if (hiker) {
          hiker.visible = !!frame.actor;
          if (frame.actor) {
            const a = frame.actor, anchor = HIKER_ANCHORS[a.frame];
            hiker.texture = crops[a.frame];
            hiker.anchor.set(anchor.x, anchor.y);
            hiker.position.set(a.at.x, a.at.y);
            hiker.width = a.width;
            hiker.scale.y = Math.abs(hiker.scale.x);
            hiker.scale.x = Math.abs(hiker.scale.x) * a.mirror;
            hiker.rotation = a.rotation;
            hiker.alpha = a.alpha;
            shadow.ellipse(a.at.x, a.at.y + 2, 12, 3.5).fill({ color: 2374450, alpha: 0.2 });
          }
        }
        app.render();
      };
      var setWaterMask = setWaterMask2, paint = paint2;
      await app.init({ width: WORLD.width, height: initialHeight, resolution: resolution(initialHeight), autoDensity: true, antialias: true, autoStart: false, preference: "webgl", backgroundAlpha: 0 });
      if (cancelled()) {
        dispose();
        return null;
      }
      app.stage.eventMode = "none";
      app.stage.addChild(scene);
      scene.addChild(paper2, world);
      for (const [key, entry] of resources) {
        const texture = P.Texture.from(entry.image, true);
        textures.set(key, texture);
        if (app.renderer.prepare)
          await app.renderer.prepare.upload(texture);
        else
          app.renderer.texture.bind(texture);
        if (cancelled()) {
          dispose();
          return null;
        }
      }
      const sceneTexture = textures.get("scene");
      background = new P.Sprite(sceneTexture);
      world.addChild(background);
      water2 = new P.MeshPlane({ texture: sceneTexture, verticesX: 28, verticesY: 20 });
      original = new Float32Array(water2.geometry.getBuffer("aPosition").data);
      water2.alpha = 0.72;
      world.addChild(water2, waterMask, whitewater, shadow);
      water2.mask = waterMask;
      whitewater.mask = waterMask;
      const art = resources.get("actor"), actorTexture = textures.get("actor");
      if (art && actorTexture) {
        for (let i = 0; i < 8; i++) {
          const r = actorCrop(art, i);
          crops.push(new P.Texture({ source: actorTexture.source, frame: new P.Rectangle(r.x, r.y, r.width, r.height) }));
        }
        hiker = new P.Sprite(crops[0]);
        hiker.anchor.set(0.5, 0.88);
        world.addChild(hiker);
      }
      app.canvas.className = "mini-game-canvas tiger-trail-canvas";
      app.canvas.setAttribute("aria-hidden", "true");
      app.canvas.setAttribute("data-ready", "true");
      app.canvas.addEventListener("webglcontextlost", loss);
      host.appendChild(app.canvas);
      return {
        canvas: app.canvas,
        paint: paint2,
        dispose,
        capture(frame) {
          if (disposed)
            throw new Error("The painted scene has closed.");
          paint2({ ...frame, capture: true });
          const canvas = app.renderer.extract.canvas({ target: scene, frame: new P.Rectangle(0, 0, WORLD.width, frame.projection.height), resolution: Math.min(1, 960 / Math.max(WORLD.width, frame.projection.height)), clearColor: "#f3edda", antialias: true });
          return encodeCapture(canvas);
        }
      };
    } catch (error) {
      console.warn("Tiger trail uses its painted SVG fallback:", error);
      dispose();
      return null;
    }
  }
  function drawTigerTrail(svg, parent, game) {
    parent.removeAttribute("visibility");
    attrs3(parent, { viewBox: "0 0 1000 720", preserveAspectRatio: "xMidYMid meet" });
    return { tiger: true, tigerTrail: true, game, parent, fallback: fallback2(svg, parent, game), gpu: null, resources: /* @__PURE__ */ new Map(), loaded: false, height: 720, displayWidth: 1e3, latest: null, host: null, resize: null, captureBusy: false, generation: 0, embedded: /* @__PURE__ */ new Map(), waitsForArt: true, contentState: "loading", disposed: false };
  }
  function paintTigerTrail(refs, state) {
    if (refs.disposed)
      return;
    refs.latest = state;
    const frame = stageFrame(state, refs.height);
    if (refs.gpu) {
      try {
        refs.gpu.paint(frame);
        refs.parent.setAttribute("visibility", "hidden");
        return;
      } catch {
        refs.gpu.dispose();
        refs.gpu = null;
      }
    }
    refs.parent.removeAttribute("visibility");
    refs.fallback.paint(frame, refs.resources);
    const loading = refs.fallback.root.querySelector("[data-loading]");
    if (loading)
      loading.textContent = refs.contentState === "error" ? "画作暂未展开，可以重试或继续行程。" : "江谷画作正在展开…";
  }
  function tigerTrailViewport(refs, state = refs.latest) {
    const p2 = project(state?.camera || { x: 500, y: 360, zoom: 1 }, refs.height);
    return { action: "viewport", viewWidth: p2.width / p2.scale, viewHeight: p2.height / p2.scale };
  }
  function tigerTrailPoint(refs, point) {
    if (!refs.latest)
      return point;
    const p2 = stageFrame(refs.latest, refs.height).projection;
    return {
      ...point,
      x: ((point.x ?? 0) * p2.width - p2.x) / p2.scale,
      y: ((point.y ?? 0) * p2.height - p2.y) / p2.scale,
      viewWidth: p2.width / p2.scale,
      viewHeight: p2.height / p2.scale,
      ...point.dx === void 0 ? {} : { dx: point.dx * p2.width / p2.scale },
      ...point.dy === void 0 ? {} : { dy: point.dy * p2.height / p2.scale }
    };
  }
  async function mountTigerTrail(refs, host, cache, pixi) {
    if (refs.disposed)
      return;
    const generation = ++refs.generation;
    refs.host = host;
    refs.gpu?.dispose();
    refs.gpu = null;
    refs.loaded = false;
    refs.resources.clear();
    refs.contentState = "loading";
    const cancelled = () => !!refs.disposed || refs.generation !== generation;
    const resize = () => {
      if (cancelled())
        return;
      const box = host.getBoundingClientRect();
      refs.displayWidth = box.width > 0 ? box.width : 1e3;
      refs.height = box.width > 0 && box.height > 0 ? Math.max(1, Math.round(WORLD.width * box.height / box.width)) : 720;
      if (refs.latest)
        paintTigerTrail(refs, refs.latest);
    };
    resize();
    refs.resize?.disconnect();
    if (globalThis.ResizeObserver) {
      refs.resize = new ResizeObserver(resize);
      refs.resize.observe(host);
    }
    const assets = tigerTrailAssets(refs.game), pending = [];
    for (const key of ["scene", "actor"]) {
      const file = assets[key];
      if (!file)
        continue;
      const entry = cache?.request(file, "high");
      if (!entry) {
        refs.contentState = "error";
        return;
      }
      pending.push([key, entry]);
    }
    await Promise.all(pending.map(([, entry]) => entry.promise));
    if (cancelled())
      return;
    if (pending.some(([, entry]) => entry.state !== "ready")) {
      refs.contentState = "error";
      return;
    }
    refs.resources = new Map(pending);
    refs.loaded = true;
    const P = pixi;
    if (typeof P?.Application === "function") {
      await new Promise((resolve) => setTimeout(resolve, 0));
      if (cancelled())
        return;
      refs.gpu = await renderer2(P, host, refs.resources, refs.height, () => refs.displayWidth, cancelled, () => {
        refs.gpu = null;
        if (!refs.disposed && refs.latest)
          paintTigerTrail(refs, refs.latest);
      });
    }
    if (cancelled()) {
      refs.gpu?.dispose();
      refs.gpu = null;
      return;
    }
    refs.contentState = "ready";
    if (refs.latest)
      paintTigerTrail(refs, refs.latest);
  }
  async function svgCapture(refs, frame) {
    refs.fallback.paint({ ...frame, capture: true }, refs.resources);
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    svg.setAttribute("viewBox", "0 0 1000 " + refs.height);
    const scale = Math.min(1, 960 / Math.max(WORLD.width, refs.height));
    svg.setAttribute("width", String(Math.round(WORLD.width * scale)));
    svg.setAttribute("height", String(Math.round(refs.height * scale)));
    const clone3 = refs.fallback.root.cloneNode(true);
    clone3.querySelectorAll("[data-capture-hide]").forEach((node2) => node2.remove());
    svg.appendChild(clone3);
    for (const node2 of clone3.querySelectorAll("image")) {
      const href = node2.getAttribute("href");
      if (!href)
        continue;
      let embedded = refs.embedded.get(href);
      if (!embedded) {
        const key = Object.entries(tigerTrailAssets(refs.game)).find(([, file]) => file === href)?.[0];
        const image = key && refs.resources.get(key)?.image;
        if (!image) {
          node2.remove();
          continue;
        }
        const canvas = document.createElement("canvas");
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        const context = canvas.getContext("2d");
        if (!context)
          throw new Error("Canvas is unavailable.");
        context.drawImage(image, 0, 0);
        embedded = canvas.toDataURL("image/png");
        refs.embedded.set(href, embedded);
      }
      node2.setAttribute("href", embedded);
    }
    const url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(svg)], { type: "image/svg+xml;charset=utf-8" }));
    try {
      const image = new Image();
      await new Promise((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () => reject(new Error("The frozen painting could not be rendered."));
        image.src = url;
      });
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(WORLD.width * scale);
      canvas.height = Math.round(refs.height * scale);
      const context = canvas.getContext("2d");
      if (!context)
        throw new Error("Canvas is unavailable.");
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      return encodeCapture(canvas);
    } finally {
      URL.revokeObjectURL(url);
    }
  }
  async function captureTigerTrail(refs, state = refs.latest) {
    if (refs.disposed || !refs.loaded || !state || refs.captureBusy)
      return null;
    refs.captureBusy = true;
    const generation = refs.generation;
    try {
      const frame = stageFrame(state, refs.height, true), url = refs.gpu ? refs.gpu.capture(frame) : await svgCapture(refs, frame);
      return refs.disposed || generation !== refs.generation ? null : url;
    } catch (error) {
      console.warn("The river photograph could not be saved:", error);
      return null;
    } finally {
      refs.captureBusy = false;
      if (!refs.disposed && refs.latest)
        paintTigerTrail(refs, refs.latest);
    }
  }
  function disposeTigerTrail(refs) {
    if (refs.disposed)
      return;
    refs.disposed = true;
    refs.generation++;
    refs.resize?.disconnect();
    refs.resize = null;
    refs.gpu?.dispose();
    refs.gpu = null;
    refs.fallback.dispose();
    refs.resources.clear();
    refs.embedded.clear();
    refs.latest = null;
    refs.host = null;
    refs.parent.removeAttribute("visibility");
  }

  // .build/typescript/runtime/tiger-trail/adapter.js
  var KEYS = {
    "tiger-climb": "按住空格或方向键前进，松开停下；走到山肩会自动留下记忆。",
    "tiger-river": "方向键取景，＋／－调整远近；空格拍照，B 连拍，1–5 选片，K 定格。",
    "tiger-rest": "方向键看看山景；Enter 继续走。",
    "tiger-passage": "Enter 继续走。"
  };
  var MEMORIES2 = {
    "tiger-climb": "沿二十八道拐的一段折返小径走上高处，山壁逐渐退开，金沙江落在深深的谷底。",
    "tiger-river": "沿张老师小路来到中虎跳江边，白浪掠过江中巨石。我选下这一帧，把自己的构图和奔流的一刻留在手帐里。",
    "tiger-rest": "在中途客栈歇了歇，看看峡谷对面的山。",
    "tiger-passage": "沿高路经过龙洞瀑布，水声短暂靠近，又落在身后。"
  };
  function createTigerTrailGames({ dom, onAction, riverArrived = false }) {
    const { get: $, text, html } = dom, bindings = new EventBindings();
    let generation = 0, pending = null, busy = false;
    let actionKey = "", framesKey = "", current = null;
    let activeRefs = null;
    let shutterPointer = null, shutterHeldAt = 0, holdingBurst = false, ignoreClick = false;
    const strip = $("tiger-frame-strip");
    const zoom = $("tiger-trail-zoom");
    const withViewport = (state) => activeRefs && !activeRefs.disposed ? inputTrail(state, tigerTrailViewport(activeRefs, state)) : state;
    function renderFrames(s) {
      strip.hidden = s.game !== "tiger-river" || !s.river.captures.length;
      const key = s.id + ":" + s.river.captures.map((frame) => frame.id).join(",");
      if (key !== framesKey) {
        strip.replaceChildren();
        s.river.captures.forEach((frame, index) => {
          const button = html("button", null, strip, "tiger-frame");
          button.type = "button";
          button.dataset.frame = String(index);
          button.setAttribute("aria-label", "选择第 " + (index + 1) + " 帧");
          const picture = html("img", null, button);
          picture.src = frame.url;
          picture.alt = "刚刚拍下的江景，第 " + (index + 1) + " 帧";
          html("span", String(index + 1), button);
        });
        framesKey = key;
      }
      strip.querySelectorAll("button[data-frame]").forEach((button, index) => {
        button.setAttribute("aria-pressed", String(index === s.river.selected));
        button.disabled = s.play.complete;
      });
    }
    function present(base, view) {
      const s = base, refs = view, waiting = refs.contentState !== "ready";
      current = s;
      $("tiger-tools").hidden = false;
      $("micro-panel").setAttribute("data-trail", "true");
      $("micro-panel").setAttribute("data-trail-game", s.game);
      $("micro-panel").setAttribute("data-phase", waiting ? "loading" : s.play.complete ? "memory" : s.game === "tiger-river" ? s.river.phase : s.acted ? "play" : "invite");
      text("micro-title", TITLES2[s.game]);
      text("tiger-key-hint", KEYS[s.game]);
      text("micro-result", waiting ? refs.contentState === "error" ? "画作未能展开，可以重新加载，或继续旅程。" : "山与江正在展开……" : s.feedback);
      text("micro-skip", s.game === "tiger-river" ? "返回高路 →" : "继续走 →");
      $("micro-surface").setAttribute("aria-busy", String(refs.contentState === "loading"));
      $("micro-surface").setAttribute("aria-label", PROMPTS2[s.game] + " " + KEYS[s.game] + " R 重试。");
      const controls = [];
      if (s.game === "tiger-climb") {
        text("tiger-count", s.climb.arrivedAt !== null ? "山肩 · 江在脚下" : s.climb.progress < 0.32 ? "沿着石壁，慢慢起步" : s.climb.progress < 0.7 ? "转过山弯，继续向上" : "山肩将近，峡谷渐渐展开");
      } else if (s.game === "tiger-rest") {
        text("tiger-count", "中途客栈 · 看山歇脚");
        controls.push({ action: "continue", label: "歇好了，继续走", primary: true });
      } else if (s.game === "tiger-passage") {
        text("tiger-count", "龙洞瀑布 · 沿高路经过");
        controls.push({ action: "continue", label: "继续沿高路走", primary: true });
      } else if (s.river.phase === "descent") {
        text("tiger-count", "张老师小路 ↓ 中虎跳江边 · 行程示意");
        controls.push({ action: "continue-to-river", label: "来到江边，看看激流", primary: true });
      } else {
        text("tiger-count", s.river.captureRequest ? "正在留下这一帧…" : s.river.burst ? "连拍中 · 最多五帧" : s.river.captures.length ? "已拍 " + s.river.captures.length + " 帧 · 点小图选一张" : "拖动取景 · 轻按拍照，按住连拍");
        controls.push({ action: "shutter", label: "拍下这一刻", primary: true, disabled: !!s.river.captureRequest || s.river.captures.length >= 5 });
        if (s.river.burst)
          controls.push({ action: "stop-burst", label: "停止连拍" });
        if (s.river.captures.length)
          controls.push({ action: "retake", label: "重新取景", disabled: !!s.river.captureRequest }, { action: "keep", label: "定格这一帧", primary: true, disabled: !!s.river.captureRequest || s.river.burst || s.river.selected < 0 });
      }
      const key = s.id + ":" + controls.map((c) => c.action).join(",");
      if (key !== actionKey) {
        $("tiger-actions").replaceChildren();
        for (const control of controls) {
          const b = html("button", control.label, $("tiger-actions"));
          b.type = "button";
          b.dataset.trailAction = control.action;
        }
        actionKey = key;
      }
      for (const control of controls) {
        const button = $("tiger-actions").querySelector('[data-trail-action="' + control.action + '"]');
        if (!button)
          continue;
        if (button.textContent !== control.label)
          button.textContent = control.label;
        button.disabled = waiting || s.play.complete || !!control.disabled;
        button.setAttribute("data-primary", String(!!control.primary));
      }
      const zoomVisible = s.game === "tiger-river" && s.river.phase === "river";
      $("tiger-trail-lens").hidden = !zoomVisible;
      zoom.disabled = waiting || s.play.complete;
      if (dom.document.activeElement !== zoom)
        zoom.value = String(s.camera.zoom);
      renderFrames(s);
    }
    const adapter = {
      create(entry, options) {
        generation++;
        pending = null;
        busy = false;
        actionKey = "";
        framesKey = "";
        shutterPointer = null;
        holdingBurst = false;
        ignoreClick = false;
        return createTrailState(entry, { ...options, riverArrival: riverArrived ? "river" : "descent" });
      },
      act: (state, point) => inputTrail(withViewport(state), point),
      move: (state, point) => moveTrail(state, point),
      release(state) {
        shutterPointer = null;
        holdingBurst = false;
        return releaseTrail(state);
      },
      tick(state, dt) {
        let s = withViewport(state);
        if (pending && pending.generation === generation && pending.id === s.id) {
          const result = pending;
          pending = null;
          s = result.url ? attachTrailCapture(s, result.url, result.request) : rejectTrailCapture(s, result.request);
        }
        if (shutterPointer !== null && !holdingBurst && s.age - shutterHeldAt >= 0.45) {
          holdingBurst = true;
          s = inputTrail(s, { action: "burst" });
        }
        return tickTrail(s, dt);
      },
      draw: (svg, parent, entry) => drawTigerTrail(svg, parent, TRAIL_GAMES[entry.id]),
      paint(view, state) {
        const refs = view, s = state;
        activeRefs = refs;
        paintTigerTrail(refs, s);
        const request = s.river.captureRequest;
        if (!request || busy || pending || refs.captureBusy || refs.contentState !== "ready")
          return;
        busy = true;
        const started = generation;
        void captureTigerTrail(refs, s).then((url) => {
          if (generation === started && !refs.disposed)
            pending = { generation: started, id: s.id, request: request.id, url };
        }, () => {
          if (generation === started && !refs.disposed)
            pending = { generation: started, id: s.id, request: request.id, url: null };
        }).finally(() => {
          if (generation === started)
            busy = false;
        });
      },
      instruction: (entry) => PROMPTS2[TRAIL_GAMES[entry.id]],
      status: (state) => state.feedback,
      outcome(state, entry) {
        const s = state, captured = s.game === "tiger-river" ? s.river.captures[s.river.selected]?.url : null;
        return {
          id: s.id,
          edition: entry.edition,
          earned: s.play.complete,
          interaction: s.gesture,
          memory: MEMORIES2[s.game],
          title: s.play.complete ? entry.tag : entry.name,
          ...captured ? { captureArt: captured, artSource: "capture" } : {}
        };
      },
      assets: (entry) => tigerTrailAssets(TRAIL_GAMES[entry.id]),
      mount: (refs, context) => mountTigerTrail(refs, context.host, context.cache, context.pixi),
      dispose(refs) {
        generation++;
        pending = null;
        busy = false;
        current = null;
        activeRefs = null;
        shutterPointer = null;
        holdingBurst = false;
        strip.replaceChildren();
        strip.hidden = true;
        $("tiger-trail-lens").hidden = true;
        $("micro-panel").removeAttribute("data-trail");
        $("micro-panel").removeAttribute("data-trail-game");
        disposeTigerTrail(refs);
      },
      point: (refs, point) => tigerTrailPoint(refs, point),
      key: (state, key, phase) => keyTrail(withViewport(state), key, phase),
      present
    };
    const actions = $("tiger-actions");
    bindings.listen(actions, "click", (event) => {
      const button = event.target.closest("button[data-trail-action]");
      const action = button?.dataset.trailAction;
      if (!button || button.disabled || !action)
        return;
      if (action === "shutter" && ignoreClick && event.detail > 0) {
        ignoreClick = false;
        return;
      }
      onAction(action);
    });
    bindings.listen(actions, "pointerdown", (event) => {
      const button = event.target.closest('[data-trail-action="shutter"]');
      if (!button || button.disabled || !current || event.button !== 0)
        return;
      onAction("shutter");
      shutterPointer = event.pointerId;
      shutterHeldAt = current.age;
      holdingBurst = false;
      ignoreClick = true;
      actions.setPointerCapture(event.pointerId);
    });
    const endShutter = (event) => {
      if (shutterPointer !== event.pointerId)
        return;
      const wasBurst = holdingBurst;
      shutterPointer = null;
      holdingBurst = false;
      if (actions.hasPointerCapture(event.pointerId))
        actions.releasePointerCapture(event.pointerId);
      if (wasBurst)
        onAction("stop-burst");
    };
    bindings.listen(actions, "pointerup", endShutter);
    bindings.listen(actions, "pointercancel", endShutter);
    bindings.listen(actions, "lostpointercapture", endShutter);
    bindings.listen(strip, "click", (event) => {
      const button = event.target.closest("button[data-frame]");
      if (button && !button.disabled)
        onAction("select-frame", Number(button.dataset.frame));
    });
    bindings.listen(zoom, "input", () => onAction("zoom", Number(zoom.value)));
    return { adapter, destroy: () => bindings.destroy() };
  }

  // .build/typescript/runtime/legacy-game-registry.js
  function installLegacyHomeGames(options) {
    const { mini, dom, platform, legacy } = options, onAction = mini.action;
    const mogan = platform && legacy ? createMoganGames({ dom, legacy, onAction }) : null;
    if (mogan)
      mini.registerGame(Object.keys(MOGAN_GAMES), mogan.adapter);
    const tiger = createTigerGames({ dom, onAction });
    mini.registerGame(Object.keys(TIGER_GAMES), tiger.adapter);
    const trail = createTigerTrailGames({ dom, onAction });
    mini.registerGame(Object.keys(TRAIL_GAMES), trail.adapter);
    const installed = /* @__PURE__ */ new Set([
      ...mogan ? Object.keys(MOGAN_GAMES) : [],
      ...Object.keys(TIGER_GAMES),
      ...Object.keys(TRAIL_GAMES)
    ]);
    const tigerKinds = TIGER_GAMES, moganKinds = MOGAN_GAMES;
    let destroyed = false;
    return {
      has: (entryId) => installed.has(entryId),
      kindFor(entryId) {
        if (!entryId)
          return void 0;
        return TRAIL_GAMES[entryId] || tigerKinds[entryId] || (legacy ? moganKinds[entryId] : void 0) || platform?.kinds[entryId];
      },
      destroy() {
        if (destroyed)
          return;
        destroyed = true;
        mogan?.destroy();
        tiger.destroy();
        trail.destroy();
      }
    };
  }

  // .build/typescript/runtime/reward-controller.js
  function createRewardController(options) {
    const { dom, scenes, catalog: D } = options, { get: $ } = dom;
    const bindings = new EventBindings();
    let current = null;
    let session = null;
    let collecting = false;
    let flight = null;
    let bodyOverflow = "";
    let imageEntry = null;
    let imageListener = null;
    function close(resume = true) {
      if (!current)
        return;
      const wasMini = !!options.gameKind(current.id), closing = session;
      current = null;
      session = null;
      collecting = false;
      flight?.cancel();
      flight = null;
      if (imageEntry && imageEntry.onChange === imageListener)
        imageEntry.onChange = null;
      imageEntry = null;
      imageListener = null;
      $("wind-keepsake").hidden = true;
      $("reward-overlay").hidden = true;
      $("app-main").removeAttribute("inert");
      dom.document.body.style.overflow = bodyOverflow;
      scenes.leave(closing, resume);
      options.refresh();
      if (resume) {
        $("walk-toggle").focus({ preventScroll: true });
        if (wasMini && !options.reduced && !options.autoCollect)
          $("journey-stage").animate?.([{ opacity: 0.6, transform: "scale(.985)" }, { opacity: 1, transform: "scale(1)" }], { duration: 450, easing: "ease-out" });
      }
    }
    function show(moment, returnStatus) {
      if (!D.hasTag(moment) || options.autoCollect && (!moment.earned || moment.edition !== 3))
        return false;
      if (current)
        close(false);
      current = moment;
      collecting = false;
      session = scenes.enter("reward", returnStatus);
      const game = options.gameKind(moment.id);
      $("reward-overlay").setAttribute("data-wind", String(!!game));
      $("reward-overlay").setAttribute("data-collecting", "false");
      $("reward-overlay").setAttribute("data-auto", String(!!options.autoCollect));
      $("reward-continue").disabled = false;
      $("reward-continue").hidden = !!options.autoCollect;
      $("reward-continue").textContent = game ? "收进手帐，继续走 →" : "收好徽章 →";
      const file = D.tagArt(moment), cached = options.cache?.request(file, "high") || null;
      const display = () => {
        if (current !== moment)
          return;
        let image = $("reward-art");
        if (options.presentArt && current) {
          const framed = cached?.state === "ready" ? options.presentArt(cached.image, current) : null;
          const source2 = framed?.src || file;
          if (source2 && image.getAttribute("src") !== source2)
            image.setAttribute("src", source2);
        } else if (cached?.state === "ready" && cached.image !== image) {
          image.removeAttribute("id");
          cached.image.id = "reward-art";
          cached.image.setAttribute("class", "reward-art");
          image.replaceWith(cached.image);
          image = cached.image;
        }
        if (!cached && file)
          image.setAttribute("src", file);
        image.setAttribute("alt", (moment.tag || moment.title) + " · 手绘水彩徽章");
        image.hidden = !!cached && cached.state !== "ready";
        $("reward-loading").hidden = !cached || cached.state === "ready";
        $("reward-loading").textContent = cached?.state === "error" ? "画作暂未加载，可收好后在手帐查看。" : "正在展开手绘纪念…";
      };
      if (cached) {
        imageEntry = cached;
        imageListener = display;
        cached.onChange = display;
      }
      display();
      $("reward-title").textContent = moment.tag || moment.title;
      $("reward-place").textContent = moment.place;
      $("reward-copy").textContent = D.item(moment.id).result;
      $("reward-overlay").hidden = false;
      $("app-main").setAttribute("inert", "");
      bodyOverflow = dom.document.body.style.overflow || "";
      dom.document.body.style.overflow = "hidden";
      options.stopLoop();
      options.refresh();
      if (options.autoCollect) {
        $("reward-dialog").setAttribute("tabindex", "-1");
        $("reward-dialog").focus({ preventScroll: true });
      } else
        $("reward-continue").focus({ preventScroll: true });
      options.audio.mini?.(game || "memory", "reveal");
      if (options.autoCollect && !dom.document.hidden)
        collect();
      return true;
    }
    function collect() {
      if (!current || collecting)
        return;
      if (options.onCollected?.(current) === false) {
        $("reward-continue").hidden = false;
        $("reward-continue").textContent = "重试保存";
        $("reward-continue").focus({ preventScroll: true });
        return;
      }
      if (options.autoCollect)
        $("reward-continue").hidden = true;
      const game = options.gameKind(current.id);
      options.audio.mini?.(game || "memory", "collect");
      const targetElement = $(options.autoCollect ? "reward-overlay" : "reward-dialog");
      if (!targetElement.animate || !options.autoCollect && (!game || options.reduced)) {
        close();
        return;
      }
      collecting = true;
      const moment = current;
      $("reward-continue").disabled = true;
      $("reward-overlay").setAttribute("data-collecting", "true");
      $("wind-keepsake").hidden = !!options.autoCollect;
      let animation;
      try {
        if (options.autoCollect) {
          const hold = options.reduced ? 1200 : 1500, fade = options.reduced ? 180 : 950;
          animation = flight = targetElement.animate([{ opacity: 1 }, { opacity: 1, offset: hold / (hold + fade) }, { opacity: 0 }], { duration: hold + fade, easing: "ease-in-out", fill: "forwards" });
        } else {
          const box = $("reward-dialog").getBoundingClientRect(), target = $("wind-keepsake").getBoundingClientRect();
          const dx = target.left + target.width / 2 - box.left - box.width / 2, dy = target.top + target.height / 2 - box.top - box.height / 2;
          animation = flight = targetElement.animate([{ transform: "translate(0,0) scale(1) rotate(0)", opacity: 1 }, { transform: "translate(0,-16px) scale(1.025) rotate(-2deg)", opacity: 1, offset: 0.2 }, { transform: `translate(${dx}px,${dy}px) scale(.08) rotate(6deg)`, opacity: 0 }], { duration: 680, easing: "cubic-bezier(.55,0,.25,1)", fill: "forwards" });
        }
      } catch {
        close();
        return;
      }
      const finish2 = () => {
        if (current === moment && flight === animation)
          close();
      };
      animation.finished.then(finish2, finish2);
    }
    bindings.listen($("reward-continue"), "click", collect);
    function visibilityChanged() {
      if (!options.autoCollect || !current)
        return;
      if (dom.document.hidden)
        flight?.pause?.();
      else if (flight)
        flight.play?.();
      else if ($("reward-continue").hidden)
        collect();
    }
    if (options.autoCollect)
      dom.document.addEventListener("visibilitychange", visibilityChanged);
    return {
      get current() {
        return current;
      },
      get open() {
        return current !== null;
      },
      show,
      close,
      collect,
      handleKey(event) {
        if (!current)
          return false;
        if (event.key === "Escape") {
          event.preventDefault();
          close();
        } else if (event.key === "Tab") {
          event.preventDefault();
          $($("reward-continue").hidden ? "reward-dialog" : "reward-continue").focus({ preventScroll: true });
        }
        return true;
      },
      destroy() {
        close(false);
        bindings.destroy();
        dom.document.removeEventListener("visibilitychange", visibilityChanged);
      }
    };
  }

  // .build/typescript/runtime/private-photo.js
  function isPhotoPointId(value) {
    return value === "jx-creek" || value === "jx-tea";
  }
  var PEN_NAMES = ["松间客", "溪边客", "茶山客", "听雨人", "望云人", "寻叶人"];
  function isPenName(value) {
    return PEN_NAMES.some((name) => name === value);
  }
  function parsePrivatePhoto(value) {
    if (!value || typeof value !== "object" || !("kind" in value) || value.kind !== "private-local" || !("id" in value) || typeof value.id !== "string" || !value.id || !("route" in value) || value.route !== "westlake" || !("point" in value) || typeof value.point !== "string" || !("sceneVersion" in value) || typeof value.sceneVersion !== "string" || !("createdAt" in value) || typeof value.createdAt !== "number" || !Number.isFinite(value.createdAt) || !("image" in value) || typeof value.image !== "string" || !/^data:image\/(webp|png);base64,[A-Za-z0-9+/=]+$/.test(value.image) || !("body" in value) || typeof value.body !== "string" || !("anchor" in value) || typeof value.anchor !== "number" || !Number.isInteger(value.anchor) || value.anchor < 0 || value.anchor > 2 || !("zoom" in value) || typeof value.zoom !== "number" || !Number.isFinite(value.zoom) || value.zoom < 1 || value.zoom > 1.3 || !("attribution" in value) || !value.attribution || typeof value.attribution !== "object" || !("kind" in value.attribution))
      return null;
    if (!isPhotoPointId(value.point))
      return null;
    let attribution;
    if (value.attribution.kind === "anonymous")
      attribution = { kind: "anonymous" };
    else if (value.attribution.kind === "pen-name" && "name" in value.attribution && isPenName(value.attribution.name))
      attribution = { kind: "pen-name", name: value.attribution.name };
    else
      return null;
    return { id: value.id, kind: "private-local", route: "westlake", point: value.point, sceneVersion: value.sceneVersion, createdAt: value.createdAt, image: value.image, body: value.body, anchor: value.anchor, zoom: value.zoom, attribution };
  }

  // .build/typescript/runtime/private-photo-store.js
  var PRIVATE_PHOTO_DB = "trailbound-private-photos-v1";
  var PRIVATE_PHOTO_DB_VERSION = 1;
  var PRIVATE_PHOTO_CHANGED = "trailbound-private-photo-saved";
  function createPrivatePhotoStore(factory) {
    let opening = null;
    function open() {
      if (opening)
        return opening;
      opening = new Promise((resolve, reject) => {
        if (!factory) {
          reject(new Error("浏览器未提供本地照片存储"));
          return;
        }
        const request = factory.open(PRIVATE_PHOTO_DB, PRIVATE_PHOTO_DB_VERSION);
        request.onupgradeneeded = () => {
          request.result.createObjectStore("photos", { keyPath: "id" });
        };
        request.onsuccess = () => {
          request.result.onversionchange = () => {
            request.result.close();
            opening = null;
          };
          resolve(request.result);
        };
        request.onerror = () => reject(request.error);
        request.onblocked = () => reject(new Error("请合上其他旧版本页面后重试"));
      });
      opening.catch(() => {
        opening = null;
      });
      return opening;
    }
    return {
      async read() {
        try {
          const db = await open();
          const photos = await new Promise((resolve, reject) => {
            const request = db.transaction("photos", "readonly").objectStore("photos").getAll();
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
              const rows = request.result;
              resolve(Array.isArray(rows) ? rows.map(parsePrivatePhoto).filter((photo) => photo !== null).sort((a, b) => b.createdAt - a.createdAt) : []);
            };
          });
          return { kind: "loaded", photos };
        } catch {
          return { kind: "error", message: "本机私藏暂时无法读取，原有照片没有被删除。可以重试。" };
        }
      },
      async save(photo) {
        const snapshot = parsePrivatePhoto(photo);
        if (!snapshot)
          return { kind: "error", message: "这张照片还没准备好，请重新拍下这一眼。" };
        try {
          const db = await open();
          await new Promise((resolve, reject) => {
            const tx = db.transaction("photos", "readwrite");
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
            tx.onabort = () => reject(tx.error);
            tx.objectStore("photos").put(snapshot);
          });
          return { kind: "stored", photo: snapshot };
        } catch {
          return { kind: "error", message: "这张照片还没保存成功，请腾出空间后重试。编辑内容仍留在这里。" };
        }
      },
      async close() {
        const pending = opening;
        opening = null;
        if (pending) {
          try {
            (await pending).close();
          } catch {
          }
        }
      }
    };
  }

  // .build/typescript/runtime/journal-store.js
  function createJournalStore({ catalog, data, storage }) {
    const read = () => catalog.loadMoments(storage);
    function save(moment) {
      if (!catalog.hasTag(moment) || moment.edition === 3 && !moment.earned) {
        return { kind: "error", message: "完成互动后才会记入手帐。" };
      }
      const result = data.remember(read(), moment);
      if (result.status === "full")
        return { kind: "error", message: "手帐已满，原有回忆已保留。可以先留在这里看看画。" };
      if (result.status !== "unchanged" && !catalog.saveMoments(storage, result.moments)) {
        return { kind: "error", message: "暂时无法保存手帐，可以重试。" };
      }
      return { kind: "stored", existing: result.status === "unchanged", change: result.status, moments: result.moments };
    }
    return { read, save };
  }

  // .build/typescript/content/look-here.js
  var GLIMPSE_POINTS = [
    {
      id: "jx-creek",
      name: "九溪 · 溪林停步处",
      zone: [2, 5.7],
      paper: { x: 1455, y: 1435 },
      bounds: { x: 1060, y: 1190, width: 760, height: 570 },
      anchors: [{ x: 1380, y: 1190, width: 440, height: 330 }, { x: 1435, y: 1255, width: 360, height: 270 }, { x: 1300, y: 1370, width: 480, height: 360 }],
      labels: ["溪弯与树影", "石边的水纹", "树下的水岸"],
      recommendations: ["溪水在石头旁拐了一个小弯。", "树影落在水边，颜色又深了一层。", "先停一停，听听石头之间的水声。"],
      caption: "溪水在石头旁拐了一个小弯。你也看见了吗？"
    },
    {
      id: "jx-tea",
      name: "九溪 · 茶坡转角",
      zone: [9, 12.8],
      paper: { x: 2250, y: 825 },
      bounds: { x: 1850, y: 610, width: 720, height: 540 },
      anchors: [{ x: 1850, y: 785, width: 440, height: 330 }, { x: 1930, y: 690, width: 400, height: 300 }, { x: 1850, y: 740, width: 520, height: 390 }],
      labels: ["转角与茶坡", "沿径望坡", "溪岸望茶垄"],
      recommendations: ["茶垄顺着山坡，一层一层弯过去。", "转过这个弯，眼前的绿又换了一种。", "把这一坡的春色，留在午前的光里。"],
      caption: "茶垄顺着山坡，一层一层弯过去。"
    }
  ];
  function glimpsePoint(id) {
    return GLIMPSE_POINTS.find((point) => point.id === id);
  }

  // .build/typescript/content/tiger-badges.js
  var TIGER_BADGE_ART = {
    bends: { file: "badges/tiger-memories-v4/bends.webp", x: 0.5, y: 0.5, radius: 0.4 },
    inn: { file: "badges/tiger-memories-v4/inn.webp", x: 0.5, y: 0.5, radius: 0.4 },
    waterfall: { file: "badges/tiger-memories-v4/waterfall.webp", x: 0.5, y: 0.48, radius: 0.4 },
    river: { file: "badges/tiger-memories-v4/river.webp", x: 0.5, y: 0.48, radius: 0.4 }
  };
  var TIGER_BADGE_ENTRIES = {
    "tiger-bends-puzzle-v4": TIGER_BADGE_ART.bends,
    "tiger-inn-pairs-v4": TIGER_BADGE_ART.inn,
    "tiger-waterfall-paint-v4": TIGER_BADGE_ART.waterfall,
    "tiger-river-roundframe-v4": TIGER_BADGE_ART.river
  };
  var TIGER_LEGACY_BADGE_TILES = {
    "gorge-goat": { column: 0, row: 1 },
    "gorge-eagle": { column: 1, row: 1 },
    "gorge-sparkle": { column: 2, row: 1 }
  };
  function tigerBadgeArt(id) {
    switch (id) {
      case "tiger-bends-puzzle-v4":
        return TIGER_BADGE_ENTRIES[id];
      case "tiger-inn-pairs-v4":
        return TIGER_BADGE_ENTRIES[id];
      case "tiger-waterfall-paint-v4":
        return TIGER_BADGE_ENTRIES[id];
      case "tiger-river-roundframe-v4":
        return TIGER_BADGE_ENTRIES[id];
      default:
        return null;
    }
  }
  function tigerLegacyBadgeTile(id) {
    switch (id) {
      case "gorge-goat":
        return TIGER_LEGACY_BADGE_TILES[id];
      case "gorge-eagle":
        return TIGER_LEGACY_BADGE_TILES[id];
      case "gorge-sparkle":
        return TIGER_LEGACY_BADGE_TILES[id];
      default:
        return null;
    }
  }

  // .build/typescript/runtime/badge-paper.js
  var PAPER_BADGE = { size: 768, center: 384, outerRadius: 360, artRadius: 336 };
  var PAPER_BADGE_ART = {
    x: PAPER_BADGE.center,
    y: PAPER_BADGE.center,
    radius: PAPER_BADGE.artRadius
  };
  function circle(ctx, radius) {
    ctx.moveTo(PAPER_BADGE.center + radius, PAPER_BADGE.center);
    ctx.arc(PAPER_BADGE.center, PAPER_BADGE.center, radius, 0, Math.PI * 2);
  }
  function paintPaperEdge(ctx) {
    const { center, outerRadius, artRadius } = PAPER_BADGE;
    ctx.save();
    ctx.beginPath();
    circle(ctx, outerRadius);
    circle(ctx, artRadius - 0.5);
    ctx.clip("evenodd");
    ctx.fillStyle = "#f3edda";
    ctx.fillRect(0, 0, PAPER_BADGE.size, PAPER_BADGE.size);
    for (let i = 0; i < 760; i++) {
      const angle = i * 2.3999632297;
      const radius = artRadius + i * 37 % 97 / 97 * (outerRadius - artRadius);
      const x = center + Math.cos(angle) * radius, y = center + Math.sin(angle) * radius;
      ctx.strokeStyle = i % 3 ? "#a58c6119" : "#ffffff75";
      ctx.lineWidth = 0.65;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(angle + 0.7) * 2, y + Math.sin(angle + 0.7) * 2);
      ctx.stroke();
    }
    ctx.restore();
    ctx.save();
    ctx.lineCap = "round";
    for (const line2 of [
      { radius: outerRadius - 2.5, color: "#a58c61", width: 2.5 },
      { radius: artRadius + 2, color: "#89947c", width: 1.35 }
    ]) {
      ctx.strokeStyle = line2.color;
      ctx.lineWidth = line2.width;
      ctx.beginPath();
      for (let i = 0; i <= 192; i++) {
        const angle = i / 192 * Math.PI * 2;
        const radius = line2.radius + Math.sin(angle * 13) * 0.35 + Math.sin(angle * 29) * 0.15;
        const x = center + Math.cos(angle) * radius, y = center + Math.sin(angle) * radius;
        if (i)
          ctx.lineTo(x, y);
        else
          ctx.moveTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();
    }
    ctx.restore();
  }
  function composePaperBadge(doc, paint) {
    const canvas = doc.createElement("canvas");
    canvas.width = canvas.height = PAPER_BADGE.size;
    const ctx = canvas.getContext("2d");
    if (!ctx)
      return null;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.save();
    ctx.beginPath();
    circle(ctx, PAPER_BADGE.artRadius);
    ctx.clip();
    paint(ctx, PAPER_BADGE_ART);
    ctx.restore();
    paintPaperEdge(ctx);
    return canvas;
  }
  function paintBadgeImage(ctx, image, source2, target) {
    const scale = target.radius / source2.radius;
    ctx.drawImage(image, target.x - source2.x * scale, target.y - source2.y * scale, image.naturalWidth * scale, image.naturalHeight * scale);
  }
  function encodePaperBadge(canvas, maxLength = Infinity) {
    try {
      for (const quality of [0.9, 0.8, 0.68]) {
        const url = canvas.toDataURL("image/webp", quality);
        if (url.startsWith("data:image/webp;base64,") && url.length < maxLength)
          return url;
      }
    } catch {
    }
    return null;
  }

  // .build/typescript/runtime/tiger-badge.js
  var presentedArt = /* @__PURE__ */ new WeakMap();
  function tigerLegacyBadgeFile(moment) {
    return moment.route === "tiger" && moment.edition !== 3 && tigerLegacyBadgeTile(moment.id) ? "badges/moments-v1.webp" : null;
  }
  function tigerJournalArt(image, moment) {
    if (moment.route !== "tiger" || !image.naturalWidth || !image.naturalHeight)
      return null;
    const width = image.naturalWidth, height = image.naturalHeight;
    const original = image.currentSrc || image.src;
    const cacheKey = `${moment.id}|${Boolean(moment.captureArt)}|${original}`;
    const cached = presentedArt.get(image)?.get(cacheKey);
    if (cached)
      return cached;
    const art = tigerBadgeArt(moment.id), tile = tigerLegacyBadgeTile(moment.id);
    const rectangular = Math.abs(width / height - 1) > 0.05;
    const atlas = !!tile && /(?:^|\/)moments-v1\.webp(?:[?#]|$)/.test(original);
    let source2;
    if (atlas && tile) {
      source2 = { x: (tile.column + 0.5) * width / 3, y: (tile.row + 0.5) * height / 3, radius: Math.min(width, height) / 3 * 0.41 };
    } else if (rectangular) {
      source2 = { x: width / 2, y: height / 2, radius: Math.min(width, height) / 2 };
    } else if (moment.captureArt && art) {
      if (width === PAPER_BADGE.size && height === PAPER_BADGE.size)
        return { src: original };
      source2 = { x: width / 2, y: height / 2, radius: width * 249 / 576 };
    } else {
      source2 = { x: width * (art?.x ?? 0.5), y: height * (art?.y ?? 0.5), radius: Math.min(width, height) * (art?.radius ?? 0.41) };
    }
    const canvas = composePaperBadge(image.ownerDocument, (ctx, target) => paintBadgeImage(ctx, image, source2, target));
    const src = canvas && encodePaperBadge(canvas);
    if (!src)
      return null;
    const keepOriginal = !atlas && (rectangular || Boolean(moment.captureArt && !art));
    const presentation = { src, ...keepOriginal ? { original } : {} };
    const cache = presentedArt.get(image) ?? /* @__PURE__ */ new Map();
    cache.set(cacheKey, presentation);
    presentedArt.set(image, cache);
    return presentation;
  }

  // .build/typescript/runtime/journal-route-filter.js
  function createJournalRouteFilter({ dom, routes, onChange }) {
    const root = dom.get("journal-route");
    const bindings = new EventBindings();
    const choices = [{ id: "all", name: "全部路线" }, ...routes];
    root.replaceChildren();
    function reveal(label2) {
      if (root.scrollWidth <= root.clientWidth)
        return;
      const bounds = root.getBoundingClientRect(), item = label2.getBoundingClientRect();
      if (item.left < bounds.left + 6)
        root.scrollLeft += item.left - bounds.left - 6;
      else if (item.right > bounds.right - 6)
        root.scrollLeft += item.right - bounds.right + 6;
    }
    const tabs = choices.map((choice) => {
      const label2 = dom.html("label", null, root, "journal-route-option");
      const input = dom.html("input", null, label2);
      input.type = "radio";
      input.name = "journal-route";
      input.value = choice.id;
      input.checked = choice.id === "all";
      input.setAttribute("aria-controls", "journal-list");
      const paper2 = dom.html("span", null, label2, "journal-route-tab");
      dom.html("span", choice.name, paper2, "journal-route-name");
      const count = dom.html("span", null, paper2, "journal-route-total");
      count.setAttribute("aria-hidden", "true");
      bindings.listen(input, "change", () => {
        if (!input.checked)
          return;
        reveal(label2);
        onChange(choice.id);
      });
      bindings.listen(input, "focus", () => reveal(label2));
      return { ...choice, input, count };
    });
    return {
      render(selected, moments) {
        const counts = /* @__PURE__ */ new Map([["all", moments.length]]);
        for (const moment of moments)
          counts.set(moment.route, (counts.get(moment.route) ?? 0) + 1);
        for (const tab of tabs) {
          const count = counts.get(tab.id) ?? 0;
          tab.input.checked = tab.id === selected;
          tab.input.setAttribute("aria-label", `${tab.name}，${count}段回忆`);
          tab.count.textContent = String(count);
          tab.count.hidden = count === 0;
        }
      },
      destroy() {
        bindings.destroy();
      }
    };
  }

  // .build/typescript/runtime/journal-controller.js
  function createJournalController(options) {
    const { dom, catalog: D, data, scenes } = options;
    const { get: $, html } = dom;
    const bindings = new EventBindings();
    const pictures = /* @__PURE__ */ new Map();
    const store = createJournalStore({ catalog: D, data, storage: options.storage });
    let photoFactory = null;
    try {
      photoFactory = dom.document.defaultView?.indexedDB ?? null;
    } catch {
    }
    const photoStore = createPrivatePhotoStore(photoFactory);
    let privatePhotos = [], photoReadGeneration = 0, destroyed = false;
    let records = store.read();
    let tripMoments = [];
    let route = "all";
    let pageSize = data.PAGE_SIZE;
    let session = null;
    let trigger = null;
    let bodyOverflow = "";
    let entries = [];
    let index = 0;
    let flip = null;
    let swipe = null;
    const routeFilter = createJournalRouteFilter({ dom, routes: options.routes, onChange(selected) {
      route = selected;
      pageSize = data.PAGE_SIZE;
      render();
    } });
    function tagImage(parent, file, label2, reading, moment) {
      const key = file + "|" + label2;
      const cached = reading && pictures.get(key);
      if (cached) {
        parent.appendChild(cached);
        return cached;
      }
      const panel = reading ? html("div", null, parent, "journal-art-view") : null;
      const badge2 = html("span", null, panel ?? parent, "journal-badge-art journal-tag-art");
      badge2.setAttribute("role", "img");
      badge2.setAttribute("aria-label", label2 + " · 手绘收藏标签");
      const status = html("span", "画作展开中", badge2, "journal-art-status");
      const image = html("img", null, badge2, "journal-tag-image");
      status.setAttribute("aria-hidden", "true");
      image.setAttribute("alt", "");
      image.setAttribute("loading", reading ? "eager" : "lazy");
      image.setAttribute("decoding", "async");
      image.style.opacity = "0";
      if (panel)
        pictures.set(key, panel);
      let presented = false;
      image.onload = () => {
        if (!presented && options.presentArt) {
          presented = true;
          const presentation = options.presentArt(image, moment);
          if (presentation) {
            const original = presentation.original;
            if (panel && original) {
              const ratio = image.naturalWidth / image.naturalHeight;
              const toggle = html("button", "查看完整原画", panel, "journal-original-toggle");
              toggle.type = "button";
              toggle.setAttribute("aria-pressed", "false");
              let showOriginal = false;
              toggle.addEventListener("click", () => {
                showOriginal = !showOriginal;
                toggle.setAttribute("aria-pressed", String(showOriginal));
                toggle.textContent = showOriginal ? "返回圆形徽章" : "查看完整原画";
                badge2.setAttribute("aria-label", label2 + (showOriginal ? " · 完整原画" : " · 手绘收藏标签"));
                badge2.style.aspectRatio = showOriginal ? String(ratio) : "1";
                image.hidden = false;
                image.style.opacity = "0";
                status.hidden = false;
                status.textContent = "画作展开中";
                image.src = showOriginal ? original : presentation.src;
              });
            }
            if (image.src !== presentation.src) {
              image.src = presentation.src;
              return;
            }
          }
        }
        const loadedSource = image.src;
        const reveal = () => {
          if (image.src !== loadedSource)
            return;
          status.hidden = true;
          image.hidden = false;
          image.style.opacity = "1";
        };
        if (reading && image.decode)
          image.decode().then(reveal, reveal);
        else
          reveal();
      };
      image.onerror = () => {
        status.textContent = "画作暂未加载";
        image.hidden = true;
        badge2.setAttribute("aria-label", label2 + " · 画作暂未加载，文字回忆仍可阅读");
      };
      image.setAttribute("src", file);
      return panel ?? badge2;
    }
    function badge(parent, moment, reading = false) {
      if (moment.edition === 3 && !D.hasTag(moment)) {
        const note = html("span", null, parent, "journal-memory-label");
        const svg = dom.document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("viewBox", "0 0 72 44");
        svg.setAttribute("aria-hidden", "true");
        const path = dom.document.createElementNS("http://www.w3.org/2000/svg", "path");
        for (const [key, value] of Object.entries({ d: "M8 34L25 12L37 28L47 18L65 34M20 34H54M26 38H47", fill: "none", stroke: "currentColor", "stroke-width": "1.3", "stroke-linecap": "round", "stroke-linejoin": "round" }))
          path.setAttribute(key, value);
        svg.appendChild(path);
        note.appendChild(svg);
        html("span", "沿途记事", note);
        html("small", "未获得标签", note);
        return note;
      }
      const file = D.tagArt(moment) ?? tigerLegacyBadgeFile(moment);
      if (file)
        return tagImage(parent, file, moment.tag || moment.title, reading, moment);
      const entryIndex = Math.max(0, D.CATALOG.findIndex((entry) => entry.id === moment.id));
      const i = entryIndex % 9;
      const node2 = html("span", null, parent, "journal-badge-art");
      node2.setAttribute("role", "img");
      node2.setAttribute("aria-label", moment.title + "的山野徽章");
      node2.style.backgroundImage = `url('badges/${["moments-v1", "moments-expansion-v1", "moments-westlake-v2"][Math.floor(entryIndex / 9)]}.webp')`;
      node2.style.backgroundPosition = `${i % 3 * 50}% ${Math.floor(i / 3) * 50}%`;
      return node2;
    }
    function render(append = false) {
      const list = $("journal-list");
      const moments = data.page(records, "all", D.MAX_MOMENTS).entries;
      const all = [...moments.map((value) => ({ kind: "moment", value })), ...privatePhotos.map((value) => ({ kind: "private", value }))];
      all.sort((a, b) => (b.value.createdAt ?? 0) - (a.value.createdAt ?? 0));
      const filtered = all.filter((item) => route === "all" || item.value.route === route);
      const visible = filtered.slice(0, pageSize), remaining = filtered.length - visible.length;
      routeFilter.render(route, all.map((item) => item.value));
      $("journal-count").textContent = `${all.length}个瞬间`;
      const intro = dom.document.querySelector(".journal-intro");
      if (intro)
        intro.textContent = privatePhotos.length ? "点开一页手帐，翻看沿途回忆。" : "点开一枚徽章，翻看沿途回忆。";
      $("trip-count").textContent = `本次记下${options.tripCount()}个瞬间`;
      const routeName = options.routes.find((r) => r.id === route)?.name || "全部路线";
      $("journal-filter-count").textContent = filtered.length ? `${routeName} · ${filtered.length}段回忆${remaining ? `，已展示${visible.length}段` : ""}` : `${routeName} · 等待新的回忆`;
      $("journal-more").hidden = remaining === 0;
      $("journal-more").textContent = `再翻${Math.min(data.PAGE_SIZE, remaining)}段回忆 ↓`;
      const offset = append ? list.children.length : 0;
      if (!append)
        list.replaceChildren();
      if (!filtered.length) {
        const empty = html("li", null, list, "journal-empty");
        html("strong", "这一页，留给下一次相遇", empty);
        html("p", "一阵风、一片落叶，或一段安静的水声。沿途收下的手绘和回忆，会一起留在这里。", empty);
        return;
      }
      for (const item of visible.slice(offset)) {
        if (item.kind === "private") {
          const photo = item.value, name = glimpsePoint(photo.point)?.name ?? "九溪私藏";
          const li2 = html("li", null, list, "journal-entry found");
          li2.dataset.route = photo.route;
          li2.dataset.kind = "private-photo";
          const button2 = html("button", null, li2, "journal-wall-button");
          button2.type = "button";
          button2.setAttribute("aria-label", `翻看私藏照片 · ${name}`);
          button2.setAttribute("aria-haspopup", "dialog");
          button2.setAttribute("aria-controls", "journal-detail");
          const image = html("img", null, button2, "journal-private-image");
          image.alt = name + "的游戏场景私藏";
          image.loading = "lazy";
          image.src = photo.image;
          image.onerror = () => {
            image.hidden = true;
            html("span", "照片暂未展开，文字仍可阅读", button2);
          };
          html("strong", name.replace("九溪 · ", ""), button2, "journal-wall-title");
          html("small", "九溪龙井 · 仅本机私藏", button2, "journal-wall-place");
          html("span", "翻看私藏 ↗", button2, "journal-wall-hint").setAttribute("aria-hidden", "true");
          button2.addEventListener("click", () => openPrivate(photo, button2));
          continue;
        }
        const moment = item.value;
        const li = html("li", null, list, "journal-entry found");
        li.setAttribute("data-route", moment.route);
        li.setAttribute("data-moment", moment.key);
        li.setAttribute("data-kind", D.hasTag(moment) ? "tag" : "note");
        const button = html("button", null, li, "journal-wall-button");
        for (const [key, value] of Object.entries({ type: "button", "aria-haspopup": "dialog", "aria-controls": "journal-detail", "aria-expanded": "false", "aria-label": "翻看" + moment.title + " · " + moment.place }))
          button.setAttribute(key, value);
        badge(button, moment);
        html("strong", moment.title, button, "journal-wall-title");
        html("small", moment.place.split(" · ")[0], button, "journal-wall-place");
        html("span", "翻看回忆 ↗", button, "journal-wall-hint").setAttribute("aria-hidden", "true");
        button.addEventListener("click", () => open(moment, button));
      }
    }
    function openPrivate(photo, button) {
      if (session || options.rewardOpen())
        return;
      entries = [];
      index = 0;
      const name = glimpsePoint(photo.point)?.name ?? "九溪私藏", page = $("journal-detail-page");
      page.replaceChildren();
      const art = html("div", null, page, "journal-illustration");
      const image = html("img", null, art, "journal-private-detail-image");
      image.alt = name + "的游戏场景私藏";
      image.src = photo.image;
      image.onerror = () => {
        image.hidden = true;
        html("p", "照片暂未展开，文字仍可阅读。", art);
      };
      const copy2 = html("div", null, page, "journal-copy");
      html("p", name, copy2, "journal-location");
      html("h3", "我的这一眼", copy2, "journal-entry-title").id = "journal-detail-title";
      if (photo.body)
        html("p", photo.body, copy2, "journal-memory");
      html("p", "只保存在这台设备，尚未公开。", copy2, "journal-entry-meta");
      if (photo.attribution.kind === "pen-name")
        html("p", `留笺人：${photo.attribution.name}`, copy2, "journal-entry-meta");
      const date = new Date(photo.createdAt), time = html("time", date.toLocaleString("zh-CN"), copy2, "journal-time");
      time.dateTime = date.toISOString();
      $("journal-detail-route").textContent = "九溪龙井";
      $("journal-detail-position").textContent = "私藏";
      $("journal-detail-announcement").textContent = name + " · 本机私藏";
      $("journal-detail-hint").textContent = "这一眼，只留给自己";
      for (const id of ["journal-detail-prev", "journal-detail-next"]) {
        $(id).hidden = true;
        $(id).setAttribute("aria-disabled", "true");
      }
      $("journal-detail").setAttribute("aria-modal", "true");
      $("journal-detail").showModal();
      session = scenes.enter("journal");
      trigger = button;
      button.setAttribute("aria-expanded", "true");
      bodyOverflow = dom.document.body.style.overflow || "";
      dom.document.body.style.overflow = "hidden";
      options.pauseInteraction();
      options.stopLoop();
      options.refresh();
      $("journal-detail-close").focus({ preventScroll: true });
    }
    function renderDetail(direction = 0) {
      const moment = entries[index];
      if (!moment)
        return;
      const page = $("journal-detail-page");
      flip?.cancel();
      flip = null;
      page.replaceChildren();
      page.scrollTop = 0;
      if (D.hasTag(moment)) {
        const art = html("div", null, page, "journal-illustration");
        badge(art, moment, true);
        html("span", "一幅手绘，留住这一刻", art, "journal-art-caption");
      }
      const copy2 = html("div", null, page, "journal-copy");
      html("p", moment.place, copy2, "journal-location");
      html("h3", moment.title, copy2, "journal-entry-title").id = "journal-detail-title";
      html("p", moment.memory, copy2, "journal-memory");
      const meta = html("div", null, copy2, "journal-entry-meta");
      if (typeof moment.createdAt === "number" && Number.isFinite(moment.createdAt)) {
        const date = new Date(moment.createdAt);
        const time = html("time", date.toLocaleString("zh-CN", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }), meta, "journal-time");
        time.setAttribute("datetime", date.toISOString());
      } else
        html("span", "从旧手帐留下", meta, "journal-time");
      if (!D.hasTag(moment))
        html("span", "沿途记事", meta, "journal-entry-kind");
      const weather = moment.weather && options.weather[moment.weather];
      if (weather)
        html("span", weather.name, meta, "journal-entry-weather");
      const proof = moment.edition === 3 ? options.evidence(moment.id) : null;
      const observation = proof ? null : options.observation(moment.id);
      const note = proof || observation;
      const source2 = proof || observation && options.source(observation.source);
      if (note && source2) {
        const detail = html("details", null, copy2, "journal-place-note");
        html("summary", "关于这片山野", detail);
        html("p", note.fact, detail);
        const link = html("a", source2.name + " ↗", detail, "journal-source");
        link.setAttribute("href", source2.url);
        link.setAttribute("target", "_blank");
        link.setAttribute("rel", "noopener noreferrer");
      }
      $("journal-detail-route").textContent = options.routes.find((r) => r.id === moment.route)?.name || moment.place;
      $("journal-detail-position").textContent = `${index + 1} / ${entries.length}`;
      $("journal-detail-announcement").textContent = `第${index + 1}段，共${entries.length}段：${moment.title}`;
      const previous = entries[index - 1], next = entries[index + 1];
      const controls = [["journal-detail-prev", previous, "上一枚"], ["journal-detail-next", next, "下一枚"]];
      for (const [id, entry, label2] of controls) {
        $(id).hidden = false;
        $(id).setAttribute("aria-disabled", String(!entry));
        $(id).setAttribute("aria-label", entry ? label2 + "：" + entry.title : label2 === "上一枚" ? "已是第一枚" : "已是最后一枚");
      }
      $("journal-detail-hint").textContent = entries.length === 1 ? "这一刻，值得留住" : !previous ? "从这一枚，慢慢翻看" : !next ? "已翻到最后一枚" : "左右翻看沿途回忆";
      const keep = /* @__PURE__ */ new Set();
      for (const entry of [previous, moment, next]) {
        if (!entry || !D.hasTag(entry))
          continue;
        const file = D.tagArt(entry) ?? tigerLegacyBadgeFile(entry);
        if (!file)
          continue;
        const label2 = entry.tag || entry.title, key = file + "|" + label2;
        keep.add(key);
        if (!pictures.has(key))
          tagImage(html("div"), file, label2, true, entry);
      }
      for (const key of pictures.keys())
        if (!keep.has(key))
          pictures.delete(key);
      if (direction && !options.reduced && page.animate)
        flip = page.animate([{ opacity: 0.35, transform: `translateX(${direction * 16}px)` }, { opacity: 1, transform: "translateX(0)" }], { duration: 220, easing: "ease-out" });
    }
    function open(moment, button) {
      if (session || options.rewardOpen())
        return;
      entries = data.page(records, route, D.MAX_MOMENTS).entries;
      index = entries.findIndex((entry) => entry.route === moment.route && entry.id === moment.id);
      if (index < 0)
        return;
      renderDetail();
      $("journal-detail").setAttribute("aria-modal", "true");
      $("journal-detail").showModal();
      session = scenes.enter("journal");
      trigger = button;
      button.setAttribute("aria-expanded", "true");
      bodyOverflow = dom.document.body.style.overflow || "";
      dom.document.body.style.overflow = "hidden";
      options.pauseInteraction();
      options.stopLoop();
      options.refresh();
      $("journal-detail-close").focus({ preventScroll: true });
    }
    function closed(resume = true) {
      if (!session)
        return;
      const closing = session;
      session = null;
      dom.document.body.style.overflow = bodyOverflow;
      swipe = null;
      flip?.cancel();
      flip = null;
      trigger?.setAttribute("aria-expanded", "false");
      scenes.leave(closing, resume);
      options.refresh();
      if (trigger?.isConnected)
        trigger.focus({ preventScroll: true });
      trigger = null;
      entries = [];
      pictures.clear();
      $("journal-detail-page").replaceChildren();
    }
    function close(resume = true) {
      closed(resume);
      $("journal-detail").close();
    }
    function turn(direction) {
      const next = index + direction;
      if (!session || next < 0 || next >= entries.length)
        return;
      index = next;
      renderDetail(direction);
    }
    function remember(moment) {
      const result = store.save(moment);
      if (result.kind === "error") {
        $("journal-storage").textContent = result.message;
        return result;
      }
      records = result.moments;
      if (!tripMoments.some((entry) => entry.route === moment.route && entry.id === moment.id))
        tripMoments.push(moment);
      $("journal-storage").textContent = "回忆自动保存在这个浏览器，相同的片刻只留一页。";
      const message = result.change === "unchanged" ? "再次遇见，手帐中已留存" : result.change === "upgraded" ? "手帐已补上手绘" : "刚刚收下标签";
      $("discovery-status").textContent = `${message}「${moment.title}」 · ${moment.place}`;
      render();
      options.onRemember(moment);
      return result;
    }
    function renderEnding() {
      const section = $("ending-journal"), list = $("ending-badges"), detail = $("ending-detail");
      const collected = tripMoments.filter((moment) => D.hasTag(moment));
      section.hidden = !collected.length;
      list.replaceChildren();
      detail.textContent = "";
      for (const moment of collected) {
        const button = html("button", null, list, "ending-badge-button");
        button.setAttribute("type", "button");
        button.setAttribute("aria-expanded", "false");
        button.setAttribute("aria-controls", "ending-detail");
        button.setAttribute("aria-label", "翻看" + moment.title);
        badge(button, moment);
        html("small", moment.title, button);
        button.addEventListener("click", () => {
          const expanded = button.getAttribute("aria-expanded") === "true";
          for (const b of Array.from(list.children))
            b.setAttribute("aria-expanded", "false");
          button.setAttribute("aria-expanded", String(!expanded));
          detail.textContent = expanded ? "" : moment.place + " · " + moment.memory;
        });
      }
    }
    function bind() {
      const dialog = $("journal-detail");
      bindings.listen($("journal-detail-close"), "click", () => close());
      bindings.listen($("journal-detail-prev"), "click", () => turn(-1));
      bindings.listen($("journal-detail-next"), "click", () => turn(1));
      bindings.listen(dialog, "close", () => closed());
      bindings.listen(dialog, "keydown", (event) => {
        event.stopPropagation();
        const target = event.target;
        if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || target.isContentEditable || /^(INPUT|SELECT|TEXTAREA)$/.test(target.tagName))
          return;
        if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
          event.preventDefault();
          turn(event.key === "ArrowLeft" ? -1 : 1);
        }
      });
      const page = $("journal-detail-page");
      bindings.listen(page, "pointerdown", (event) => {
        swipe = null;
        if (event.pointerType !== "touch" || !event.isPrimary || event.target.closest?.("button,a,summary,details"))
          return;
        swipe = { id: event.pointerId, x: event.clientX, y: event.clientY, time: event.timeStamp, scroll: page.scrollTop };
      });
      bindings.listen(page, "pointerup", (event) => {
        const start = swipe;
        swipe = null;
        if (!start || start.id !== event.pointerId || event.timeStamp - start.time > 650 || Math.abs(page.scrollTop - start.scroll) > 8)
          return;
        const dx = event.clientX - start.x, dy = event.clientY - start.y;
        if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.7)
          turn(dx < 0 ? 1 : -1);
      });
      bindings.listen(page, "pointercancel", () => {
        swipe = null;
      });
      bindings.listen($("journal-more"), "click", () => {
        const previous = $("journal-list").children.length;
        pageSize += data.PAGE_SIZE;
        render(true);
        $("journal-list").children[previous]?.querySelector("button")?.focus();
      });
    }
    function reloadPhotos() {
      if (!photoFactory)
        return;
      const token = ++photoReadGeneration;
      void photoStore.read().then((result) => {
        if (destroyed || token !== photoReadGeneration)
          return;
        if (result.kind === "loaded") {
          const unchanged = result.photos.length === privatePhotos.length && result.photos.every((photo, i) => {
            const previous = privatePhotos[i];
            return previous && photo.id === previous.id && photo.createdAt === previous.createdAt && photo.point === previous.point && photo.image === previous.image && photo.body === previous.body && photo.anchor === previous.anchor && photo.zoom === previous.zoom && photo.attribution.kind === previous.attribution.kind && (photo.attribution.kind === "anonymous" || previous.attribution.kind === "pen-name" && photo.attribution.name === previous.attribution.name);
          });
          if (unchanged)
            return;
          privatePhotos = result.photos;
          render();
        } else
          $("journal-storage").textContent = result.message;
      });
    }
    function reload() {
      records = store.read();
      render();
      reloadPhotos();
    }
    const browser = dom.document.defaultView;
    const storageChanged = (event) => {
      if (event.storageArea === options.storage)
        reload();
    };
    browser?.addEventListener("storage", storageChanged);
    browser?.addEventListener(PRIVATE_PHOTO_CHANGED, reloadPhotos);
    browser?.addEventListener("focus", reloadPhotos);
    bind();
    reloadPhotos();
    return {
      get open() {
        return session !== null;
      },
      get records() {
        return records;
      },
      render,
      renderEnding,
      remember,
      close,
      reload,
      resetTrip() {
        tripMoments = [];
      },
      recent(routeId) {
        return records.filter((moment) => moment.route === routeId).slice(-3).map((moment) => moment.id);
      },
      destroy() {
        destroyed = true;
        photoReadGeneration++;
        close(false);
        routeFilter.destroy();
        bindings.destroy();
        browser?.removeEventListener("storage", storageChanged);
        browser?.removeEventListener(PRIVATE_PHOTO_CHANGED, reloadPhotos);
        browser?.removeEventListener("focus", reloadPhotos);
        void photoStore.close();
      }
    };
  }

  // .build/typescript/runtime/journal-badge.js
  var ROUND_BADGE_IDS = /* @__PURE__ */ new Set(["wugong-forest-leaves", "wugong-camp-stars", "wugong-homeward-pages"]);
  var SIZE = 640;
  var CENTER = SIZE / 2;
  var outline = (radius) => Array.from({ length: 145 }, (_, i) => {
    const a = i / 144 * Math.PI * 2, r = radius + Math.sin(a * 11) * 0.8 + Math.sin(a * 23) * 0.35;
    return `${i ? "L" : "M"}${CENTER + Math.cos(a) * r},${CENTER + Math.sin(a) * r}`;
  }).join(" ") + "Z";
  var outer = outline(302);
  var inner = outline(279);
  var gold = outline(295);
  var ink = outline(285);
  var sprigs = Array.from({ length: 18 }, (_, i) => {
    const a = 0.25 + i / 17 * 1.1, sign = i % 2 ? 1 : -1, x = CENTER + sign * Math.sin(a) * 292, y = CENTER + Math.cos(a) * 292;
    return `M${x},${y}q${sign * 7},-12 ${sign * 1},-18q${-sign * 9},9 ${-sign * 1},18Z`;
  });
  function circularBadge(image, options = {}) {
    if (!image.naturalWidth || !image.naturalHeight)
      return null;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = SIZE;
    const ctx = canvas.getContext("2d");
    if (!ctx)
      return null;
    let x = 0, y = 0, width = image.naturalWidth, height = image.naturalHeight;
    if (options.legacyPaper) {
      x = width * 24 / 900;
      y = height * 24 / 660;
      width *= 852 / 900;
      height *= 530 / 660;
    }
    const side = Math.min(width, height), centerX = options.camp ? 0.36 : 0.5;
    x += Math.max(0, Math.min(width - side, width * centerX - side / 2));
    y += (height - side) / 2;
    ctx.save();
    ctx.beginPath();
    ctx.arc(CENTER, CENTER, 280, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(image, x, y, side, side, 40, 40, 560, 560);
    ctx.restore();
    ctx.fillStyle = "#f3edd9";
    ctx.fill(new Path2D(`${outer} ${inner}`), "evenodd");
    ctx.strokeStyle = "#b69a61";
    ctx.lineWidth = 2.4;
    ctx.stroke(new Path2D(gold));
    ctx.strokeStyle = "#a6a67b";
    ctx.lineWidth = 1.1;
    ctx.stroke(new Path2D(ink));
    ctx.fillStyle = "#b4a777";
    ctx.globalAlpha = 0.8;
    for (const d of sprigs)
      ctx.fill(new Path2D(d));
    ctx.globalAlpha = 1;
    return canvas;
  }
  function roundJournalArt(image, moment) {
    if (moment.route === "tiger")
      return tigerJournalArt(image, moment);
    if (!ROUND_BADGE_IDS.has(moment.id) || image.naturalWidth <= image.naturalHeight * 1.1)
      return null;
    const canvas = circularBadge(image, { camp: moment.id === "wugong-camp-stars", legacyPaper: !!moment.captureArt && moment.id !== "wugong-camp-stars" });
    return canvas ? { src: canvas.toDataURL("image/webp", 0.88) } : null;
  }

  // .build/typescript/runtime/music-layer.js
  var WUGONG_MUSIC = Object.freeze({
    id: "wugong-reverie",
    file: "audio/wugong-reverie-v1.mp3",
    title: "Reverie",
    author: "Scott Buckley",
    source: "https://www.scottbuckley.com.au/library/reverie/",
    license: "CC BY 4.0"
  });
  var theme = (slug, title) => Object.freeze({
    id: "wugong-" + slug,
    file: "audio/wugong-" + slug + "-loop-v1.mp3",
    title,
    author: "Scott Buckley",
    source: "https://www.scottbuckley.com.au/library/" + slug + "/",
    license: "CC BY 4.0"
  });
  var WUGONG_THEMES = Object.freeze({
    wind: theme("childhood", "Childhood"),
    clouds: theme("cirrus", "Cirrus"),
    greet: theme("a-kind-of-hope", "A Kind Of Hope"),
    puzzle: WUGONG_MUSIC
  });
  var MOGAN_MUSIC = WUGONG_THEMES.greet;
  var MOGAN_THEMES = Object.freeze({ rain: WUGONG_THEMES.clouds, footsteps: WUGONG_MUSIC, sling: WUGONG_THEMES.wind });
  var momentGames = Object.freeze({
    "meadow-bird": "wind",
    "meadow-butterfly": "clouds",
    "wugong-wind-hiker": "greet",
    "meadow-flower": "puzzle",
    "bamboo-drop": "rain",
    "bamboo-step": "footsteps",
    "bamboo-leaf": "sling"
  });
  function musicLevel(scene) {
    if (!["wugong", "mogan"].includes(scene.routeId || "") || !scene.mode || scene.mode === "silent")
      return 0;
    const game = scene.momentGame || momentGames[scene.momentId || ""];
    let level = scene.mode === "photo" ? 0.47 : scene.mode === "choice" ? 0.24 : scene.mode === "reward" ? 0.42 : 0.4;
    if (scene.mode === "moment")
      level = game === "greet" ? 0.25 : game === "puzzle" ? 0.35 : game === "clouds" ? 0.32 : 0.29;
    if (scene.routeId === "mogan") {
      level = scene.mode === "moment" ? game === "footsteps" ? 0.2 : game === "rain" ? 0.24 : 0.3 : scene.mode === "reward" ? 0.34 : scene.mode === "choice" ? 0.2 : 0.33;
    }
    if (scene.weather === "storm")
      level *= 0.65;
    else if (scene.weather === "rain")
      level *= 0.82;
    return level;
  }
  function musicTrack(scene) {
    if (!musicLevel(scene))
      return null;
    const game = scene.momentGame || momentGames[scene.momentId || ""];
    if (scene.routeId === "mogan") {
      if ((scene.mode === "moment" || scene.mode === "reward") && game && Object.hasOwn(MOGAN_THEMES, game))
        return MOGAN_THEMES[game];
      return MOGAN_MUSIC;
    }
    if ((scene.mode === "moment" || scene.mode === "reward") && game && Object.hasOwn(WUGONG_THEMES, game))
      return WUGONG_THEMES[game];
    return WUGONG_MUSIC;
  }
  function createTrackLayer({ context, destination, track, createMedia = () => typeof Audio === "function" ? new Audio() : null, timers = globalThis, onStateChange = () => {
  } }) {
    let media = null;
    let source2 = null;
    let volume = null;
    let state = "off";
    let desired = false, destroyed = false, failed = false, pending = false;
    let failureState = "error";
    let epoch = 0, target = 0;
    let stopTimer = null;
    let fade = null;
    let lastDuck = -Infinity;
    const listeners = [];
    function publish(next) {
      if (state === next || destroyed)
        return;
      state = next;
      onStateChange();
    }
    function cancelStop() {
      if (stopTimer !== null)
        timers.clearTimeout(stopTimer);
      stopTimer = null;
    }
    function hold() {
      if (!volume)
        return 0;
      const now = context.currentTime, param = volume.gain;
      const held = fade ? fade.from + (fade.to - fade.from) * Math.max(0, Math.min(1, (now - fade.at) / fade.duration)) : param.value;
      if (param.cancelAndHoldAtTime)
        param.cancelAndHoldAtTime(now);
      else {
        param.cancelScheduledValues(now);
        param.setValueAtTime(held, now);
      }
      return held;
    }
    function ramp(level, duration) {
      if (!volume)
        return;
      const from = hold(), now = context.currentTime;
      volume.gain.linearRampToValueAtTime(level, now + duration);
      fade = { from, to: level, at: now, duration };
    }
    function silence() {
      if (!volume)
        return;
      volume.gain.cancelScheduledValues(context.currentTime);
      volume.gain.setValueAtTime(0, context.currentTime);
      fade = null;
    }
    function listen(type, fn) {
      const listener = fn;
      media.addEventListener(type, listener);
      listeners.push([type, listener]);
    }
    function prepare() {
      if (media)
        return true;
      if (typeof context.createMediaElementSource !== "function") {
        failed = true;
        state = failureState = "unavailable";
        return false;
      }
      try {
        media = createMedia();
        if (!media) {
          failed = true;
          state = failureState = "unavailable";
          return false;
        }
        media.preload = "none";
        media.loop = true;
        media.setAttribute("playsinline", "");
        source2 = context.createMediaElementSource(media);
        volume = context.createGain();
        volume.gain.value = 0;
        source2.connect(volume);
        volume.connect(destination);
        listen("playing", () => {
          if (!desired || destroyed || failed) {
            media?.pause();
            return;
          }
          failed = false;
          ramp(target, 2.4);
          publish("playing");
        });
        listen("waiting", () => {
          if (desired) {
            silence();
            publish("loading");
          }
        });
        listen("error", () => {
          if (!desired || destroyed)
            return;
          failed = true;
          pending = false;
          ++epoch;
          failureState = "error";
          silence();
          media?.pause();
          publish("error");
        });
        media.src = track.file;
        return true;
      } catch (_) {
        failed = true;
        source2?.disconnect();
        volume?.disconnect();
        source2 = null;
        volume = null;
        media?.pause();
        if (media)
          for (const [type, fn] of listeners)
            media.removeEventListener(type, fn);
        listeners.length = 0;
        media = null;
        state = failureState = "unavailable";
        return false;
      }
    }
    function play() {
      if (pending || failed || !media || !desired || destroyed)
        return;
      if (!media.paused) {
        if (state === "paused") {
          state = "playing";
          ramp(target, 1.4);
        }
        return;
      }
      const token = ++epoch;
      pending = true;
      state = "loading";
      try {
        Promise.resolve(media.play()).then(() => {
          if (destroyed || !desired) {
            media?.pause();
            return;
          }
          if (token !== epoch)
            return;
          pending = false;
          ramp(target, 2.4);
          publish("playing");
        }).catch((error) => {
          if (token !== epoch || destroyed || !desired)
            return;
          pending = false;
          failed = true;
          silence();
          media?.pause();
          failureState = error instanceof Error && error.name === "NotAllowedError" ? "blocked" : "error";
          publish(failureState);
        });
      } catch (_) {
        pending = false;
        failed = true;
        silence();
        state = failureState = "error";
      }
    }
    function pause(immediate = false, duration = 0.32) {
      if (destroyed)
        return;
      desired = false;
      pending = false;
      const token = ++epoch;
      cancelStop();
      if (!media)
        return;
      if (immediate || media.paused) {
        silence();
        media.pause();
      } else {
        ramp(0, duration);
        stopTimer = timers.setTimeout(() => {
          stopTimer = null;
          if (token === epoch && !desired)
            media?.pause();
        }, Math.round(duration * 1e3) + 20);
      }
      state = "paused";
    }
    function sync(scene) {
      if (destroyed)
        return;
      const next = musicLevel(scene);
      if (!next) {
        if (desired)
          pause();
        return;
      }
      cancelStop();
      const wasDesired = desired, changed = Math.abs(next - target) > 2e-3;
      target = next;
      desired = true;
      if (failed) {
        state = failureState;
        return;
      }
      if (!prepare())
        return;
      if (!wasDesired && !media.paused) {
        state = "playing";
        ramp(target, 1.4);
      } else if (changed && state === "playing")
        ramp(target, 1.2);
      play();
    }
    function resume(scene) {
      if (destroyed)
        return;
      failed = false;
      if (media?.error)
        media.load();
      sync(scene);
    }
    function duck(strength = 0.78, length = 0.65) {
      if (!volume || !desired || state !== "playing" || context.currentTime - lastDuck < 0.12)
        return;
      lastDuck = context.currentTime;
      const now = context.currentTime;
      hold();
      const lower = target * Math.max(0.5, Math.min(1, strength));
      volume.gain.linearRampToValueAtTime(lower, now + 0.04);
      volume.gain.linearRampToValueAtTime(target, now + length);
      fade = { from: lower, to: target, at: now + 0.04, duration: length - 0.04 };
    }
    function destroy() {
      if (destroyed)
        return;
      pause(true);
      destroyed = true;
      cancelStop();
      if (media) {
        for (const [type, fn] of listeners)
          media.removeEventListener(type, fn);
        media.removeAttribute("src");
        media.load();
      }
      source2?.disconnect();
      volume?.disconnect();
      media = null;
      source2 = null;
      volume = null;
    }
    return { sync, resume, pause, duck, destroy, get state() {
      return state;
    }, get playing() {
      return desired && state === "playing";
    } };
  }
  function createMusicLayer(options) {
    const layers = /* @__PURE__ */ new Map();
    let requested = null;
    let previous = null;
    let desired = false, destroyed = false;
    function fadePrevious(duration) {
      const id = previous;
      previous = null;
      if (id && id !== requested?.id)
        layers.get(id)?.pause(false, duration);
    }
    function getLayer(track) {
      let layer = layers.get(track.id);
      if (!layer) {
        layer = createTrackLayer({ ...options, track, onStateChange: () => {
          if (destroyed)
            return;
          if (desired && requested?.id === track.id) {
            const current = layers.get(track.id);
            if (current?.state === "playing")
              fadePrevious(0.95);
            else if (current && ["error", "blocked", "unavailable"].includes(current.state))
              fadePrevious(0.32);
          }
          options.onStateChange?.();
        } });
        layers.set(track.id, layer);
      }
      return layer;
    }
    function pause(immediate = false) {
      desired = false;
      previous = null;
      for (const layer of layers.values())
        layer.pause(immediate);
    }
    function select(scene, retry) {
      if (destroyed)
        return;
      const track = musicTrack(scene);
      if (!track) {
        if (desired)
          pause();
        return;
      }
      if (requested?.id !== track.id) {
        const outgoing = requested && layers.get(requested.id)?.playing ? requested.id : previous;
        for (const [id, layer] of layers)
          if (id !== track.id && id !== outgoing)
            layer.pause(true);
        previous = outgoing !== track.id ? outgoing : null;
        requested = track;
      }
      desired = true;
      if (previous)
        layers.get(previous)?.sync(scene);
      const current = getLayer(track);
      retry ? current.resume(scene) : current.sync(scene);
      if (current.state === "playing")
        fadePrevious(0.95);
      else if (["error", "blocked", "unavailable"].includes(current.state))
        fadePrevious(0.32);
    }
    function destroy() {
      if (destroyed)
        return;
      destroyed = true;
      desired = false;
      previous = null;
      for (const layer of layers.values())
        layer.destroy();
      layers.clear();
    }
    return {
      sync: (scene) => select(scene, false),
      resume: (scene) => select(scene, true),
      pause,
      duck: (strength, length) => {
        if (desired && requested)
          layers.get(requested.id)?.duck(strength, length);
      },
      destroy,
      get track() {
        return requested;
      },
      get state() {
        return requested ? layers.get(requested.id)?.state || "off" : "off";
      },
      get playing() {
        return !!(desired && requested && layers.get(requested.id)?.playing);
      }
    };
  }
  return __toCommonJS(index_exports);
})();
if (typeof module === 'object' && module.exports) module.exports = TrailRuntime;
