(function() {
  "use strict";
  const G = window.TrailGame, J = window.TrailJourney, M = window.TrailMotion, D = window.TrailDiscoveries, L = window.TrailLife, K = window.TrailNature, X = window.TrailMiniGames ? window.TrailMiniGames.enhance(window.TrailMicroMoments) : window.TrailMicroMoments, $ = (id) => document.getElementById(id), NS = "http://www.w3.org/2000/svg", R = 6378137, rad = Math.PI / 180;
  const tigerRoute = window.TrailTigerRoute;
  // Landmark chapters and the retained real photographs share the high trail.
  if (tigerRoute) J.STORIES.tiger.events = [];
  let state = J.create("wugong"), projection = null, view = { x: 0, y: 0, w: 720, h: 600 }, overview = false, photoId = null, photoFromAlbum = false, photoSession = null, uiKey = "", echoUntil = 0, echo = "", sound = false, soundBusy = false, audioBackground = false, soundError = "", scenePlan = null, sceneRenderer = null, cloudNodes = [], mistNodes = [], gaitClock = 0, hikerFacing = 1, lastWeather = null;
  const motionReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches || false;
  const audioPlayer = window.TrailAudio.create({ AudioContext: window.AudioContext || window.webkitAudioContext, navigator: window.navigator, fetch: window.fetch?.bind(window), timers: window, createMusic: window.TrailRuntime.createMusicLayer, onStateChange: () => {
    uiKey = "";
    render();
  }, onError: () => {
    sound = false;
    soundError = audioPlayer.available ? "声音未能开启，再试一次" : "此浏览器暂无音效";
    audioPlayer.disable();
    uiKey = "";
    render();
  } });
  const artCache = window.TrailImageCache?.create(window.Image);
  let choiceResult = null;
  let storage = null;
  try {
    storage = localStorage;
  } catch (_) {
  }
  let trip = D.create(state.routeId), natureId = null, natureNode = null, naturePoint = null, natureArt = null, natureLabel = null, lifeActors = [], footprints = [], actionStarted = -Infinity;
  // Reuse decoded image nodes: private hosting may revalidate another request for the same file.
  const photoCache = new Map();
  /** @type {typeof import('./runtime/index')} */
  const Runtime = window.TrailRuntime;
  const mapHeading = Runtime.createMapHeading();
  const mapGait = Runtime.createMapGait();
  let visualRoute = null, visualRouteId = null;
  let fullMapView = { x: 0, y: 0, w: 720, h: 600 }, mapResizeTimer = null;
  let mapScreen = { width: 720, height: 600, desktop: false }, mapSizing = Runtime.mapSymbols(720, 600, view, true), mapMarkers = [], endpointMarkers = [], mapObserver = null;
  let mapLabelPositions = new Map(), mapControlBoxes = [];
  let tigerJourney = null, tigerPanelKey = "", lastRiverApproach = -1, lastMountainSoundStage = "", lastGorgeOpenness = -1;
  const dom = Runtime.createDom(document);
  const mapCharacter = Runtime.createProceduralMapCharacter(document);
  const sceneCharacter = Runtime.createSceneCharacter(document);
  const miniGameKind = (id) => Runtime.TRAIL_GAMES?.[id] || Runtime.TIGER_GAMES[id] || window.TrailArtGames && Runtime.MOGAN_GAMES[id] || window.TrailMiniGames?.kinds[id];
  const scenes = Runtime.createSceneManager({ status: () => state.status, pause: () => {
    state = J.pause(state);
  }, resume: () => {
    state = J.resume(state);
  }, hidden: () => document.hidden });
  const rewardController = Runtime.createRewardController({ dom, scenes, catalog: D, cache: artCache, audio: audioPlayer, reduced: motionReduced, gameKind: miniGameKind, refresh: refreshRuntime, stopLoop: cancelLoop });
  const journalController = Runtime.createJournalController({
    presentArt: Runtime.roundJournalArt,
    dom,
    scenes,
    catalog: D,
    data: window.TrailJournal,
    routes: G.ROUTES,
    weather: G.WEATHER,
    storage,
    reduced: motionReduced,
    tripCount: () => trip.found.length,
    rewardOpen: () => rewardController.open,
    pauseInteraction: () => miniController.pause(),
    stopLoop: cancelLoop,
    refresh: refreshRuntime,
    evidence: (id) => window.TrailRouteMoments.evidence(id),
    observation: (id) => K.observation(id),
    source: (id) => K.source(id),
    onRemember: (moment) => {
      actionStarted = state.elapsed;
      playTransition("discovery", moment.title, null, D.item(moment.id).icon);
      state = { ...state, memories: [...state.memories, moment.memory] };
      echo = moment.memory;
      echoUntil = state.elapsed + 7;
      refreshRuntime();
    }
  });
  const miniController = Runtime.createMiniGameController({
    dom,
    scenes,
    api: X,
    platform: window.TrailMiniGames,
    weather: () => J.weather(state),
    pixi: window.PIXI,
    svg,
    cache: artCache,
    catalog: D,
    audio: audioPlayer,
    reduced: motionReduced,
    sound: () => sound,
    toggleSound,
    stopLoop: cancelLoop,
    ensureLoop,
    refresh: refreshRuntime,
    onFinished: (finished) => {
      const next = D.item(finished.state.id)?.manualOnly ? D.captureManual(trip, finished.state.id) : D.capture(state, trip, finished.state.id);
      if (next === trip) return false;
      const moment = D.moment(state, next, finished.state.id, { weather: J.weather(state), experience: finished.outcome });
      if (!moment || !D.hasTag(moment)) {
        $("discovery-status").textContent = "这次取景还没保存下来，可以重新打开江景再拍一张。";
        return false;
      }
      trip = next;
      journalController.remember(moment);
      return rewardController.show(moment, finished.returnStatus);
    },
    onClosed: (id, earned, resume) => closeTigerStage(id, earned, resume)
  });
  const moganGames = window.TrailMiniGames && window.TrailArtGames ? Runtime.createMoganGames({ dom, legacy: window.TrailArtGames, onAction: (name, value) => miniController.action(name, value) }) : null;
  if (moganGames) miniController.registerGame(Object.keys(Runtime.MOGAN_GAMES), moganGames.adapter);
  const tigerGames = Runtime.createTigerGames({ dom, onAction: (name, value) => miniController.action(name, value) });
  miniController.registerGame(Object.keys(Runtime.TIGER_GAMES), tigerGames.adapter);
  const tigerTrailGames = Runtime.createTigerTrailGames?.({ dom, onAction: (name, value) => miniController.action(name, value) });
  if (tigerTrailGames) miniController.registerGame(Object.keys(Runtime.TRAIL_GAMES), tigerTrailGames.adapter);
  const loop = Runtime.createFrameLoop({ request: (callback) => window.requestAnimationFrame(callback), cancel: (id) => window.cancelAnimationFrame(id), active: () => scenes.canAnimate(miniController.active), update: frame });
  function refreshRuntime() {
    uiKey = "";
    render();
    updatePosition(0);
    ensureLoop();
  }
  function resetTigerJourney() {
    tigerPanelKey = "";
    tigerJourney = state.routeId === "tiger" && tigerRoute ? {
      phase: "high", handled: new Set(), activeStage: null, nextStage: null,
      anchors: tigerRoute.anchors(J.routeOf(state).geo.line),
      stops: tigerRoute.highStops(J.routeOf(state).geo.line).filter(stop => stop.anchor && stop.gameId && stop.gameId !== "tiger-28-bends-v1"),
      returnClock: 0, branchTaken: false, focusPanel: false
    } : null;
  }
  function beginTigerStage(id, returnStatus = "walking") {
    const entry = D.item(id);
    if (!tigerJourney || !entry || !tigerTrailGames || miniController.active || rewardController.open) return false;
    tigerJourney.activeStage = id;
    tigerJourney.handled.add(id);
    tigerJourney.nextStage = null;
    if (id === "tiger-middle-river-frame-v1") tigerJourney.phase = "river";
    miniController.begin(entry, returnStatus);
    return true;
  }
  function closeTigerStage(id, earned, resume) {
    if (!tigerJourney || !Runtime.TRAIL_GAMES?.[id] || !resume) return;
    const active = tigerJourney.activeStage === id;
    tigerJourney.activeStage = null;
    if (id === "tiger-middle-river-frame-v1") {
      // Reaching the river is not the end of the out-and-back journey.
      tigerJourney.phase = "riverside";
      tigerJourney.focusPanel = true;
      state = { ...state, status: "paused", pending: null };
    } else if (active && id === "tiger-halfway-view-v1") {
      // Longdong has a sourced sequence but no verified coordinate. Present it
      // as a separate passage after 中途客栈, never as a fabricated map pin.
      tigerJourney.nextStage = "tiger-longdong-passage-v1";
    }
    tigerPanelKey = "";
  }
  function finishTigerJourney() {
    if (!tigerJourney) return;
    tigerJourney.phase = "complete";
    tigerJourney.nextStage = null;
    const memory = tigerJourney.branchTaken ? "从中虎跳江边沿张老师小路原路返回，回到中峡客栈一带，今天的旅程在这里结束。" : "从桥头沿高路走到中峡客栈一带，今天的旅程在高路终点收束。";
    apply({ ...state, status: "finished", progress: 1, pending: null, memories: [...state.memories, memory] });
    $("replay").focus({ preventScroll: true });
  }
  function tigerRoutePanel() {
    let panel = $("tiger-route-panel");
    if (panel) return panel;
    panel = html("section", null, $("journey-stage"), "tiger-route-panel");
    panel.id = "tiger-route-panel"; panel.hidden = true;
    panel.setAttribute("aria-labelledby", "tiger-route-title");
    const card = html("div", null, panel, "tiger-route-card");
    for (const [tag, suffix, className] of [["p", "kicker", "eyebrow"], ["h2", "title", ""], ["p", "copy", ""], ["ol", "diagram", "tiger-route-diagram"], ["div", "actions", "tiger-route-actions"]]) {
      const node = html(tag, null, card, className); node.id = "tiger-route-" + suffix;
    }
    return panel;
  }
  function renderTigerRoute() {
    const flow = tigerJourney, phase = flow?.phase;
    const panelVisible = !!flow && ["junction", "connector", "riverside", "returning"].includes(phase) && !miniController.active && !rewardController.open && !photoId && !photoFromAlbum;
    const panel = flow ? tigerRoutePanel() : $("tiger-route-panel");
    if (panel) panel.hidden = !panelVisible;
    $("map-frame").hidden = panelVisible;
    $("map-frame").setAttribute("data-tiger-leg", flow && ["river", "riverside", "returning"].includes(phase) ? "river" : "high");
    $("checkpoint-list").closest(".album").hidden = state.routeId === "wugong" && state.status === "ready";
    if (!panelVisible) { tigerPanelKey = ""; return; }
    panel.setAttribute("data-phase", phase);
    const returnStep = Math.min(3, Math.floor(flow.returnClock / (motionReduced ? .5 : 1.8)));
    const key = [phase, returnStep, state.status, trip.found.includes("tiger-middle-river-frame-v1")].join("|");
    if (key === tigerPanelKey) return;
    tigerPanelKey = key;
    const content = {
      junction: ["高路终点 · 中峡客栈一带", "高路走完了，江还在下面", "可以在这里结束今天的高路，也可以接入张老师小路，去中虎跳江边看一看。江边支线会沿原小路返回这里。"],
      connector: ["江边支线 · 路线顺序示意", "从高路，走向金沙江边", "先从中峡客栈一带前往张老师客栈，再沿张老师小路下行。这张图表达经过顺序，线条不表示实际距离。"],
      riverside: ["支线目的地 · 中虎跳江边", "江流到了眼前，回程也在原路上", trip.found.includes("tiger-middle-river-frame-v1") ? "这次亲手留下的取景已经交给手帐。沿张老师小路原路返回，再回到中峡客栈一带结束旅程。" : "可以再看一会儿江景，也可以沿张老师小路原路返回。观看与经过不会自动增加收藏。"],
      returning: ["原路返回 · 路线顺序示意", state.status === "paused" ? "在回程的小路上歇一会儿" : "沿着来时的小路，回到高路终点", "从江边沿张老师小路返回，经张老师客栈，再回到中峡客栈一带。原路往返，没有接入另一条下山线。"]
    }[phase];
    $("tiger-route-kicker").textContent = content[0];
    $("tiger-route-title").textContent = content[1];
    $("tiger-route-copy").textContent = content[2];
    const steps = phase === "junction" ? ["起点 · 桥头一带", "二十八道拐与高路", "终点 · 中峡客栈一带"] : phase === "returning" ? ["支线目的地 · 中虎跳江边", "沿张老师小路原路上行", "经过张老师客栈", "终点 · 回到中峡客栈一带"] : ["主线终点 · 中峡客栈一带", "支线入口 · 张老师小路", "支线目的地 · 中虎跳江边", "原路返回 · 中峡客栈一带"];
    const current = phase === "junction" ? 2 : phase === "riverside" ? 2 : phase === "returning" ? returnStep : 0;
    $("tiger-route-diagram").replaceChildren();
    for (const [index, label] of steps.entries()) {
      const step = html("li", label, $("tiger-route-diagram"), "tiger-route-step");
      step.setAttribute("data-passed", String(index < current));
      if (index === current) step.setAttribute("aria-current", "step");
    }
    $("tiger-route-actions").replaceChildren();
    const action = (label, run, primary = true) => {
      const button = html("button", label, $("tiger-route-actions"), primary ? "primary-button" : "text-button");
      button.type = "button";
      button.addEventListener("click", () => {
        if (tigerJourney !== flow || flow.phase !== phase) return;
        run();
        if (!panel.hidden && !miniController.active && !rewardController.open) ($("tiger-route-actions").querySelector("button") || $("walk-toggle")).focus({ preventScroll: true });
      });
    };
    if (phase === "junction") {
      action("去中虎跳江边 →", () => { flow.phase = "connector"; flow.branchTaken = true; refreshRuntime(); });
      action("在高路终点结束", finishTigerJourney, false);
    } else if (phase === "connector") {
      action("沿张老师小路下行 →", () => beginTigerStage("tiger-middle-river-frame-v1", "paused"));
      action("留在高路终点", () => { flow.phase = "junction"; flow.branchTaken = false; refreshRuntime(); }, false);
    } else if (phase === "riverside") {
      action("沿原小路返回 →", () => { flow.phase = "returning"; flow.returnClock = 0; apply({ ...state, status: "walking" }); });
      action("再看看江景", () => beginTigerStage("tiger-middle-river-frame-v1", "paused"), false);
    } else {
      const note = html("p", state.status === "paused" ? "点下方“继续返回”，接着走完来时的路。" : "回程正在继续，可以随时停一会儿。", $("tiger-route-actions"));
      note.setAttribute("role", "status");
    }
    if (flow.focusPanel) {
      flow.focusPanel = false;
      $("tiger-route-actions").querySelector("button")?.focus({ preventScroll: true });
    }
  }
  function tickTigerFlow(dt) {
    const flow = tigerJourney;
    if (!flow) return false;
    if (flow.phase === "high" && flow.nextStage && state.status === "walking") {
      if (beginTigerStage(flow.nextStage)) return true;
    }
    if (flow.phase === "returning") {
      if (state.status === "walking") {
        const step = Math.max(0, Math.min(.25, dt));
        flow.returnClock += step; state = { ...state, elapsed: state.elapsed + step };
        if (flow.returnClock >= (motionReduced ? 2 : 7.2)) { finishTigerJourney(); return true; }
      }
      render(); return true;
    }
    if (flow.phase !== "high") { state = J.pause(state); render(); return true; }
    return false;
  }
  function interceptTigerStop(previous, next) {
    const flow = tigerJourney;
    if (!flow || flow.phase !== "high" || previous.status !== "walking") return false;
    // Journey.tick owns photo encounters. Let the photograph finish before a
    // chapter opens, so its pending event cannot be discarded or marked seen.
    if (next.pending?.kind === "photo") return false;
    const stop = flow.stops.find(candidate => !flow.handled.has(candidate.gameId) && candidate.fraction <= next.progress + 1e-9);
    if (stop) {
      state = { ...next, progress: Math.max(previous.progress, stop.fraction), status: "walking", pending: null };
      updatePosition(0);
      if (!beginTigerStage(stop.gameId)) { flow.handled.add(stop.gameId); render(); }
      return true;
    }
    if (next.progress >= 1) {
      state = { ...next, progress: 1, status: "paused", pending: null };
      flow.phase = "junction"; render(); updatePosition(0);
      $("tiger-route-actions").querySelector("button")?.focus({ preventScroll: true });
      return true;
    }
    return false;
  }
  function preparePhoto(cp, priority = "low") {
    const file = cp.photo.file;
    let entry = photoCache.get(file);
    if (entry && !entry.failed) {
      if (priority === "high") entry.image.setAttribute("fetchpriority", "high");
      return entry;
    }
    if (!window.Image) return null;
    const image = new window.Image();
    entry = { image, ready: false, failed: false, onChange: null };
    photoCache.set(file, entry);
    image.setAttribute("decoding", "async");
    image.setAttribute("fetchpriority", priority);
    image.onload = () => {
      const ready = () => {
        entry.ready = true;
        entry.failed = false;
        entry.onChange?.();
      };
      try {
        if (image.decode) image.decode().then(ready, ready);
        else ready();
      } catch (_) {
        ready();
      }
    };
    image.onerror = () => {
      entry.failed = true;
      entry.ready = false;
      entry.onChange?.();
    };
    image.setAttribute("src", file);
    return entry;
  }
  function prepareRoutePhotos() {
    const cps = J.routeOf(state).checkpoints, keep = new Set(cps.map((cp) => cp.photo.file));
    for (const [file, e] of photoCache) if (!keep.has(file)) {
      e.onChange = null;
      photoCache.delete(file);
    }
    cps.forEach((cp, i) => preparePhoto(cp, i === 0 ? "high" : "low"));
    const gameArt = state.routeId === "westlake" ? Object.values(window.TrailMiniGames?.waterAssets?.creek || {}) : state.routeId === "tiger" ? Runtime.TIGER_TRAIL_ROUTE_ASSETS || Runtime.TIGER_ROUTE_ASSETS : state.routeId === "mogan" ? Runtime.MOGAN_ROUTE_ASSETS : state.routeId === "wugong" ? Object.values(window.TrailMiniGames?.wugongAssets || {}).flatMap(Object.values) : [];
    const art = D.CATALOG.filter((e) => e.route === state.routeId && !e.legacyOnly).map((e) => e.artV5 || e.artV4 || e.badge).filter(Boolean);
    artCache?.prefetch([.../* @__PURE__ */ new Set([...gameArt, ...window.TrailMiniGames?.artRouteAssets(state.routeId) || [], "scenes/" + state.routeId + "-v1.webp", ...art])]);
  }
  function showPhotoImage(cp) {
    const entry = preparePhoto(cp, "high"), previous = $("checkpoint-photo"), image = entry?.image || previous;
    if (image !== previous) {
      previous.removeAttribute("id");
      image.id = "checkpoint-photo";
      previous.replaceWith(image);
    }
    image.setAttribute("alt", cp.photo.alt);
    image.setAttribute("fetchpriority", "high");
    const update = (ready, failed = false) => {
      if (photoId !== cp.id || $("checkpoint-photo") !== image) return;
      image.hidden = !ready;
      image.setAttribute("aria-busy", !ready && !failed);
      $("photo-loading").hidden = ready || failed;
      $("photo-error").hidden = !failed;
    };
    if (entry) {
      entry.onChange = () => update(entry.ready, entry.failed);
      entry.onChange();
    } else {
      update(false);
      image.onload = () => update(true);
      image.onerror = () => update(false, true);
      if (image.getAttribute("src") !== cp.photo.file) image.setAttribute("src", cp.photo.file);
      if (image.complete && image.naturalWidth > 0) update(true);
    }
  }
  function svg(tag, attrs, parent) {
    const el = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
    if (parent) parent.appendChild(el);
    return el;
  }
  function html(tag, text, parent, cls) {
    const el = document.createElement(tag);
    if (text) el.textContent = text;
    if (cls) el.setAttribute("class", cls);
    if (parent) parent.appendChild(el);
    return el;
  }
  function natureIcon(parent, name) {
    if (name === "cloud") {
      svg("path", { d: "M-21 8Q-27 1-19-5Q-14-9-8-6Q-5-18 7-14Q17-13 17-4Q29-3 24 7Q20 12 10 10H-12Q-18 12-21 8Z", fill: "#f7fcf1", stroke: "#8ea89c", "stroke-width": 1.5 }, parent);
      return;
    }
    if (name.startsWith("place:")) {
      window.TrailCheckpoints.draw(svg, parent, name.slice(6));
      return;
    }
    const shape = (tag, attrs) => svg(tag, attrs, parent), path = (d, color, width = 2) => shape("path", { d, fill: "none", stroke: color, "stroke-width": width, "stroke-linecap": "round", "stroke-linejoin": "round" });
    if (name === "bird" || name === "eagle") {
      L.bird(svg, parent, name === "eagle");
    } else if (name === "stones") {
      path("M-20 9Q-7 4 2 9T20 9", "#83b5ac", 2);
      for (const [x, y] of [[-12, 0], [0, -5], [12, 1]]) shape("ellipse", { cx: x, cy: y, rx: 7, ry: 4, fill: "#acb3a0", stroke: "#839985", "stroke-width": 1.2 });
      path("M-10 15H10", "#a4cbb5", 1.6);
    } else if (name === "tea") {
      path("M0 18V-13", "#668450", 2);
      shape("path", { d: "M0 2Q-20 0-19-13Q-5-15 0 2M1-2Q20-17 19-3Q13 7 1-2Z", fill: "#a9c879", stroke: "#709452", "stroke-width": 1.3 });
      path("M0-8Q-6-18 0-23Q6-19 0-8", "#a6c568", 3);
    } else if (name === "basket") {
      shape("path", { d: "M-17-5Q0-18 17-5L12 14Q0 21-12 14Z", fill: "#d2b679", stroke: "#a1885a", "stroke-width": 1.5 });
      for (let i = -2; i < 3; i++) path(`M${i * 6}-5V15`, "#9f875a", 1);
      path("M-14 3H14M-13 9H13", "#9f875a", 1);
    } else if (name === "eaves") {
      shape("path", { d: "M-17-3H17V17H-17Z", fill: "#efe4c7", stroke: "#b6af8a", "stroke-width": 1.2 });
      shape("path", { d: "M-22-4Q-12-7 0-17Q12-7 22-4L16 0H-16Z", fill: "#7b9383", stroke: "#54755f", "stroke-width": 1.3 });
      path("M-4 17V5H4V17", "#a28f65", 2);
    } else if (name === "tide") {
      path("M-18-8Q-8-2 0-8T18-8", "#78aeb8", 2.5);
      path("M-19 3Q-8 10 2 3T20 3", "#b9cfbc", 3);
      path("M-15 15Q0 10 15 15", "#c8b17f", 1.5);
    } else if (name === "shell") {
      shape("path", { d: "M0 15L-17-5Q-14-18 0-18Q14-18 17-5Z", fill: "#e7d6b3", stroke: "#ac9470", "stroke-width": 1.5 });
      for (const x of [-12, -6, 0, 6, 12]) path(`M0 13L${x}-12`, "#bc9f7d", 1);
    } else if (name === "pier" || name === "bridge") {
      path("M-19-2H19M-17 6H17", "#aa8760", 4);
      path("M-15-10V14M15-10V14", "#7f785c", 2.5);
      path("M-17 17Q-8 13 0 17T18 17", "#78aeb8", 2);
    } else if (name === "moss") {
      path("M-19 9L17-6", "#8b785d", 9);
      for (const [x, y] of [[-12, 6], [-3, 2], [7, -2], [13, -5]]) shape("ellipse", { cx: x, cy: y - 3, rx: 6, ry: 4, fill: "#83a367" });
    } else if (name === "reflection") {
      shape("path", { d: "M-17 0L-2-17L14 0Z", fill: "#9bb4a4" });
      shape("path", { d: "M-17 5L-2 19L14 5Z", fill: "#a5c8c1", opacity: 0.65 });
      path("M-20 3H20M-10 11H13", "#74a6ae", 1.5);
    } else if (name === "drop") {
      shape("path", { d: "M0-17C-2-8-12 0-10 8Q0 21 10 8C12 0 2-8 0-17Z", fill: "#95c7c6", stroke: "#6c9c99", "stroke-width": 1.5 });
      path("M-5 4Q-7 11-1 12", "#f2f7dc", 2);
    } else if (name === "steps") {
      path("M-19 16H19V10H13V4H7V-2H1V-8H-5V-14H-15", "#b4b197", 3);
      path("M-16 19H17", "#94a581", 2);
    } else if (name === "leaf") {
      shape("path", { d: "M-17 13Q-25-12 18-17Q18 7-17 13Z", fill: "#bfc08a", stroke: "#8f9f65", "stroke-width": 1.5 });
      path("M-17 13L14-13", "#8f9f65", 1.4);
    } else if (name === "butterfly") {
      const small = svg("g", { transform: "scale(.5)" }, parent);
      parent.motionWings = L.butterfly(svg, small).map((part) => part.node);
    } else if (name === "flower") {
      path("M0 4V19M0 12Q-12 4-10 13Q-5 17 0 15", "#688752", 2);
      for (let i = 0; i < 5; i++) {
        const angle = i * Math.PI * 2 / 5;
        shape("circle", { cx: Math.cos(angle) * 7, cy: Math.sin(angle) * 7 - 5, r: 5.5, fill: "#de957b" });
      }
      shape("circle", { cx: 0, cy: -5, r: 3.5, fill: "#f1d589" });
    } else if (name === "goat") {
      shape("ellipse", { cx: -2, cy: 2, rx: 12, ry: 7, fill: "#e7d7b0" });
      shape("ellipse", { cx: 11, cy: -4, rx: 5, ry: 7, fill: "#d2ba88" });
      path("M8-9Q3-17 9-17M13-10Q18-18 13-18", "#756e51", 2);
      path("M-10 7L-12 17M-2 8L0 17M6 6L9 15M-13 0L-18-5", "#7e785c", 3);
      shape("circle", { cx: 13, cy: -5, r: 1, fill: "#3e5143" });
    } else if (name === "tracks") {
      for (const [x, y] of [[-7, 9], [6, -7]]) {
        shape("ellipse", { cx: x, cy: y, rx: 4.5, ry: 6, fill: "#96ada8", transform: `rotate(15 ${x} ${y})` });
        for (const dx of [-4, 0, 4]) shape("circle", { cx: x + dx, cy: y - 8, r: 1.8, fill: "#96ada8" });
      }
    } else if (name === "lichen") {
      shape("path", { d: "M-17 12L-13-7L1-15L17-3L18 12Z", fill: "#b0b4a1", stroke: "#8d9d8c", "stroke-width": 2 });
      for (const [x, y, r] of [[-6, -1, 5], [3, 5, 6], [9, -4, 4]]) shape("circle", { cx: x, cy: y, r, fill: "#89a36b" });
    } else if (name === "sun") {
      for (let i = 0; i < 8; i++) {
        const a = i * Math.PI / 4;
        path(`M${Math.cos(a) * 12} ${Math.sin(a) * 12}L${Math.cos(a) * 17} ${Math.sin(a) * 17}`, "#d8af55", 2);
      }
      shape("circle", { cx: 0, cy: 0, r: 8, fill: "#e9c56b" });
      path("M-19 12Q-18 3-9 7Q-3 2 2 10Q9 4 16 12", "#e0e7d9", 6);
    } else {
      shape("path", { d: "M0-18L5-5L15 0L5 5L0 18L-5 5L-15 0L-5-5Z", fill: "#e6c673", stroke: "#bbaf67", "stroke-width": 1 });
      path("M-18 16Q-8 12 0 16Q8 20 18 16", "#779f96", 2);
    }
  }
  function fillNature(prefix, note) {
    const box = $(prefix);
    box.hidden = !note;
    if (!note) return;
    $(prefix + "-title").textContent = note.title;
    $(prefix + "-look").textContent = note.look;
    $(prefix + "-fact").textContent = note.fact;
    const source = K.source(note.source), a = $(prefix + "-source");
    a.hidden = !source;
    if (source) {
      a.textContent = source.name + " ↗";
      a.setAttribute("href", source.url);
      a.setAttribute("target", "_blank");
      a.setAttribute("rel", "noopener noreferrer");
    }
  }
  function discovery() {
    return photoFromAlbum || miniController.state || rewardController.current ? null : D.visible(state, trip);
  }
  function renderDiscovery() {
    const active = discovery();
    $("observe-button").hidden = !active;
    if (active) {
      const entry2 = D.item(active.id);
      $("observe-name").textContent = `${entry2.interaction ? "看看" : "记住"} · ${entry2.name}`;
      $("observe-hint").textContent = entry2.hint;
    }
    $("trip-count").textContent = `本次记下${trip.found.length}个瞬间`;
    if ((active?.id || null) === natureId) return;
    natureId = active?.id || null;
    natureNode = null;
    naturePoint = null;
    natureArt = null;
    natureLabel = null;
    $("nature-discoveries").replaceChildren();
    if (!active) return;
    const entry = D.item(active.id);
    const { x, y } = visualRoute.sample(active.at + 0.045), g = svg("g", { id: "active-discovery", role: "button", tabindex: 0, class: "nature-marker", "aria-label": `记住${D.item(active.id).name}`, "data-discovery": active.id }, $("nature-discoveries"));
    naturePoint = state.routeId === "wugong" ? [x + active.side * 42 / mapSizing.scale, y - 42 / mapSizing.scale] : [Math.max(48, Math.min(672, x + active.side * 42)), Math.max(55, Math.min(530, y - 42))];
    natureNode = g;
    svg("circle", { r: 42, fill: "transparent" }, g);
    svg("circle", { r: D.item(active.id).icon === "butterfly" ? 14 : 22, fill: entry.interaction ? "transparent" : "#fffaf0", stroke: entry.interaction ? "none" : "#dac691", "stroke-width": 1.5 }, g);
    natureArt = svg("g", {}, g);
    if (entry.edition === 3) svg("image", { href: entry.artV5 || entry.artV4 || entry.badge, x: -24, y: -24, width: 48, height: 48, "aria-hidden": "true" }, natureArt);
    else natureIcon(natureArt, D.item(active.id).icon);
    const label = svg("text", { y: D.item(active.id).icon === "butterfly" ? 28 : 37, "text-anchor": "middle", fill: "#557350", "font-size": 11, "font-weight": 600 }, g);
    natureLabel = label;
    label.textContent = entry.interaction ? "看看这里" : "记住这一刻";
    const collect = (e) => {
      e.stopPropagation?.();
      captureDiscovery(active.id);
    };
    g.addEventListener("click", collect);
    g.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        collect(e);
      }
    });
  }
  function animateDiscovery() {
    if (!natureNode) return;
    const icon = D.item(natureId).icon, p = D.item(natureId).edition === 3 ? { angle: 0, wing: 1 } : L.creature(icon, state.elapsed, motionReduced);
    const full = state.routeId === "wugong" || overview || state.status === "ready" || motionReduced;
    const anchor = Runtime.mapMarkerAnchor({ x: naturePoint[0], y: naturePoint[1] + (motionReduced ? 0 : Math.sin(state.elapsed * 2.2) * 1.5 / mapSizing.scale) }, mapScreen.width, mapScreen.height, view, full);
    const discoveryScale = state.routeId === "wugong" ? Runtime.WUGONG_WAYPOINT_SIZE / (48 * mapSizing.scale) : mapSizing.discovery;
    natureNode.setAttribute("transform", `translate(${anchor.x.toFixed(2)} ${anchor.y.toFixed(2)}) scale(${discoveryScale.toFixed(4)})`);
    natureLabel?.setAttribute("font-size", String(mapSizing.font / discoveryScale));
    natureArt.setAttribute("transform", `rotate(${p.angle.toFixed(2)})`);
    for (const wing of natureArt.motionWings || []) wing.setAttribute("transform", `scale(${p.wing.toFixed(3)} 1)`);
  }
  function saveMoment(moment) {
    journalController.remember(moment);
  }
  function captureDiscovery(id) {
    const active = discovery();
    if (!active || active.id !== id) return;
    const entry = D.item(id);
    if (entry.interaction) {
      beginMicro(entry);
      return;
    }
    const next = D.capture(state, trip, id);
    if (next === trip) return;
    trip = next;
    saveMoment(D.moment(state, trip, id, { weather: J.weather(state) }), entry);
  }
  function beginMicro(entry) {
    miniController.begin(entry);
  }
  function world(lon, lat) {
    return [lon * rad * R, Math.log(Math.tan(Math.PI / 4 + lat * rad / 2)) * R];
  }
  function fitProjection(line, w = 720, h = 600, pad = 50, offsetY = 0) {
    const coords = line.map((p) => world(p[0], p[1])), xs = coords.map((p) => p[0]), ys = coords.map((p) => p[1]), minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys), scale = Math.min((w - pad * 2) / Math.max(1, maxX - minX), (h - pad * 2) / Math.max(1, maxY - minY)), ox = (w - (maxX - minX) * scale) / 2, oy = offsetY + (h - (maxY - minY) * scale) / 2;
    return { scale, minX, maxY, ox, oy, point(lon, lat) {
      const [x, y] = world(lon, lat);
      return [ox + (x - minX) * scale, oy + (maxY - y) * scale];
    }, inverse(x, y) {
      const wx = minX + (x - ox) / scale, wy = maxY - (y - oy) / scale;
      return [wx / R / rad, (2 * Math.atan(Math.exp(wy / R)) - Math.PI / 2) / rad];
    } };
  }
  function routeDrawing(route, mapProjection, bounds) {
    if (route.id === "wugong") return Runtime.createWugongOverviewRoute(bounds);
    const metric = G.metric(route.id);
    const anchors = route.checkpoints.map(cp => cp.fraction);
    if (route.id === "tiger" && tigerRoute) for (const anchor of Object.values(tigerRoute.anchors(route.geo.line))) anchors.push(anchor.fraction);
    return Runtime.createVisualRoute({
      points: route.geo.line.map(point => [...mapProjection.point(point[0], point[1]), point[2]]),
      progress: metric.cumulative.map(distance => metric.total ? distance / metric.total : 0),
      anchors, tolerance: 8, cornerRadius: 12
    });
  }
  function activateWugongEndpoint(kind) {
    if (state.routeId !== "wugong" || miniController.active || rewardController.open || journalController.open || photoFromAlbum) return;
    if (kind === "start" && state.status === "ready") { apply(J.start(state)); return; }
    if (state.pending?.kind === "choice" && state.pending.id === `wugong-${kind}`) {
      $("story-choices").querySelector("button")?.focus({ preventScroll: true });
      return;
    }
    if (kind === "end" && state.pending?.kind === "photo" && state.progress === 1) { $("photo-continue").focus({ preventScroll: true }); return; }
    if (kind === "end" && state.status === "finished") { $("ending-panel").focus({ preventScroll: true }); return; }
    echo = kind === "start" ? "中庵是这一程的起点。背包已收拾好，沿着石阶慢慢往前走。" : "前方是金顶。沿山路抵达后，会停下看终点的风景。";
    echoUntil = state.elapsed + 8;
    uiKey = "";
    render();
  }
  function drawMap() {
    const r = J.routeOf(state);
    const isWugong = r.id === "wugong";
    $("map-toggle").hidden = isWugong;
    $("journey-stage").setAttribute("data-route", r.id);
    $("map-frame").setAttribute("data-route", r.id);
    const rect = $("map-frame").getBoundingClientRect();
    if (rect.width && rect.height) mapScreen = { width: rect.width, height: rect.height, desktop: (window.innerWidth || 0) >= 1024 };
    mapControlBoxes = [...$("map-frame").querySelectorAll(".weather-badge, .map-toggle")].filter(node => !node.hidden).map(node => {
      const control = node.getBoundingClientRect();
      return { x: control.left - rect.left, y: control.top - rect.top, width: control.width, height: control.height };
    });
    fullMapView = Runtime.mapViewport(mapScreen.width, mapScreen.height, mapScreen.desktop);
    const overviewSizing = Runtime.mapSymbols(mapScreen.width, mapScreen.height, fullMapView, true), symbolScale = overviewSizing.marker;
    $("map").querySelector(".map-compass").setAttribute("transform", isWugong ? `translate(${(mapScreen.width - 28 - overviewSizing.offsetX) / overviewSizing.scale} ${(46 - overviewSizing.offsetY) / overviewSizing.scale}) scale(${1 / overviewSizing.scale})` : "translate(681 40)");
    projection = fitProjection(r.geo.line, 720, 600, 85);
    visualRoute = routeDrawing(r, projection, fullMapView);
    if (visualRouteId !== r.id) {
      visualRouteId = r.id;
      hikerFacing = mapHeading.reset(visualRoute.heading(0));
    }
    view = { ...fullMapView };
    $("map").setAttribute("viewBox", `${view.x} ${view.y} ${view.w} ${view.h}`);
    for (const id of ["geo-background", "geo-labels", "geo-markers", "online-tiles", "nature-discoveries", "scene-life", "trail-footprints"]) $(id).replaceChildren();
    natureId = null; natureNode = null; naturePoint = null; natureArt = null; natureLabel = null;
    const projected = visualRoute.points, context = { bounds: fullMapView, features: [...r.geo.background.filter((f) => ["water", "cable", "coast"].includes(f.kind)), ...window.TrailLandscapeData?.[r.geoId]?.features || []].map((f) => ({ ...f, line: f.line.map((p) => projection.point(p[0], p[1])) })), peaks: r.geo.labels.map((p) => ({ ...p, x: projection.point(p.lon, p.lat)[0], y: projection.point(p.lon, p.lat)[1] })) };
    scenePlan = window.TrailScenery.build(r, projected, context);
    $("journey-stage").setAttribute("data-art", scenePlan.artDetail ? "picturebook" : "classic");
    for (const [name, features] of Object.entries(scenePlan.layers)) {
      const group = svg("g", { "data-layer": name }, $("geo-background"));
      if (name === "clouds" || name === "mist") {
        const nodes = name === "clouds" ? cloudNodes : mistNodes;
        nodes.length = 0;
        const groups = /* @__PURE__ */ new Map();
        for (const f of features) {
          const key = f.cloud || f.mist;
          if (!groups.has(key)) groups.set(key, []);
          groups.get(key).push(f);
        }
        for (const shapes of groups.values()) {
          const node = svg("g", name === "mist" ? { filter: "url(#mist-local-soften)" } : {}, group);
          for (const f of shapes) svg(f.tag, Object.fromEntries(window.TrailScenery.attributes(f)), node);
          nodes.push(node);
        }
      } else for (const f of features) svg(f.tag, Object.fromEntries(window.TrailScenery.attributes(f)), group);
    }
    if (!scenePlan.artDetail) {
      const title = svg("text", { x: 32, y: fullMapView.y + 38 * symbolScale, fill: "#66825d", "font-size": 22 * symbolScale, "font-weight": 700 }, $("geo-labels"));
      title.textContent = r.name;
    }
    for (const peak of scenePlan.terrain.peaks) {
      if (!["荞麦梁", "鳌山", "太白梁", "拔仙台", "幺妹峰", "婆缪峰", "莫干岭", "西灣山", "西湾山"].includes(peak.name)) continue;
      const text = svg("text", { x: Math.max(40, Math.min(660, peak.x)), y: Math.max(fullMapView.y + 30 * symbolScale, peak.y - 13 * symbolScale), "text-anchor": "middle", fill: "#5b7970", "font-size": 11 * symbolScale, "font-weight": 600, "data-peak": peak.osmId }, $("geo-labels"));
      text.textContent = peak.name;
    }
    lifeActors = L.mount(svg, $("scene-life"), L.build(scenePlan.theme, projected, { water: scenePlan.terrain.water }));
    footprints = [];
    if (r.theme === "snow") for (let i = 0; i < 8; i++) footprints.push(svg("ellipse", { rx: 1.8, ry: 3.6, fill: "#72918a", opacity: 0 }, $("trail-footprints")));
    if (sceneRenderer?.alive) sceneRenderer.setPlan(scenePlan);
    $("route-outline").setAttribute("d", visualRoute.path);
    $("route-line").setAttribute("d", visualRoute.path);
    if (isWugong) {
      const steps = svg("g", { class: "wugong-stone-steps", "aria-hidden": "true", "pointer-events": "none" }, $("trail-footprints"));
      for (let index = 1; index <= 7; index++) {
        const fraction = index * .015, point = visualRoute.sample(fraction), angle = visualRoute.heading(fraction, 4);
        const nx = -Math.sin(angle) * 2.8, ny = Math.cos(angle) * 2.8;
        svg("path", { d: `M${(point.x - nx).toFixed(2)} ${(point.y - ny).toFixed(2)}L${(point.x + nx).toFixed(2)} ${(point.y + ny).toFixed(2)}`, stroke: "#efe7cb", "stroke-width": .85, "stroke-linecap": "round", "vector-effect": "non-scaling-stroke" }, steps);
      }
    }
    endpointMarkers = [];
    mapLabelPositions.clear();
    if (isWugong) {
      for (const waypoint of Runtime.WUGONG_WAYPOINTS) {
        const { kind, fraction, name, stateId, checkpointId } = waypoint;
        const { x, y } = visualRoute.sample(fraction);
        const g = svg("g", { class: "wugong-waypoint", "data-wugong-waypoint": kind, ...(kind === "start" || kind === "end" ? { "data-route-endpoint": kind } : {}), ...(checkpointId ? { id: `marker-${checkpointId}` } : {}), role: "button", tabindex: 0, "aria-label": `武功山 · ${name}`, "aria-controls": kind === "start" || kind === "end" ? "story-panel" : "photo-panel" }, $("geo-markers"));
        const line = svg("path", { fill: "none", stroke: "#879976", "stroke-width": 1, "stroke-linecap": "round", opacity: .7, "pointer-events": "none" }, g);
        svg("circle", { r: 3.5, fill: "#7b9365", stroke: "#fffdf1", "stroke-width": 1.8, "pointer-events": "none" }, g);
        const { sign, label } = Runtime.createWugongWaypoint({ document, parent: g, kind, label: name });
        endpointMarkers.push({ id: `waypoint-${kind}`, kind, name, stateId, checkpointId, fraction, x, y, width: Runtime.WUGONG_WAYPOINT_LABEL_WIDTH, height: Runtime.WUGONG_WAYPOINT_HEIGHT, g, sign, line, label });
        const activate = event => {
          event.stopPropagation?.();
          if (kind === "start" || kind === "end") { activateWugongEndpoint(kind); return; }
          if (miniController.active || rewardController.open || journalController.open || state.status === "encounter" || photoFromAlbum) return;
          if (state.visited.includes(checkpointId)) { openMemory(checkpointId); return; }
          echo = kind === "meadow" ? "山脊草甸在林缘上方。沿着浅土色山路走，抵达时会停下看一看。" : "这里是云海观景处。走到这段山脊，再一起看山谷里的云。";
          echoUntil = state.elapsed + 8;
          uiKey = "";
          render();
        };
        g.addEventListener("click", activate);
        g.addEventListener("pointerdown", event => event.stopPropagation?.());
        g.addEventListener("keydown", event => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); activate(event); } });
      }
    } else for (const [kind, fraction] of [["start", 0], ["end", 1]]) {
      const { x, y } = visualRoute.sample(fraction);
      const name = kind === "start" ? r.id === "tiger" ? "起点 · 桥头" : "起点" : r.id === "tiger" ? "终点 · 中峡客栈" : "终点";
      const g = svg("g", { "data-route-endpoint": kind, role: "img", "aria-label": r.name + " · " + name, "pointer-events": "none" }, $("geo-markers"));
      const line = svg("path", { fill: "none", stroke: kind === "start" ? "#66856b" : "#aa8553", "stroke-width": 1.3, "stroke-linecap": "round" }, g);
      svg("circle", { r: 4.5, fill: kind === "start" ? "#537c60" : "#b08a53", stroke: "#fffdf0", "stroke-width": 2 }, g);
      const sign = svg("g", {}, g), width = r.id === "tiger" ? 106 : 64;
      svg("rect", { x: -width / 2, y: -16, width, height: 32, rx: 10, fill: "#fffaf0", stroke: "#c9b68a", "stroke-width": 1.2 }, sign);
      const label = svg("text", { x: 0, y: 4, "text-anchor": "middle", fill: kind === "start" ? "#4b6d54" : "#886937", "font-size": 12, "font-weight": 700 }, sign);
      label.textContent = name;
      endpointMarkers.push({ id: `endpoint-${kind}`, kind, x, y, width, height: 32, g, sign, line, label: null });
    }
    mapMarkers = [];
    $("checkpoint-list").replaceChildren();
    for (const [i, cp] of r.checkpoints.entries()) {
      if (!isWugong) {
        const { x, y } = visualRoute.sample(cp.fraction), g = svg("g", { id: `marker-${cp.id}`, role: "button", tabindex: 0, class: "checkpoint-marker", transform: `translate(${x.toFixed(2)} ${y.toFixed(2)})`, "aria-label": cp.name, "aria-controls": "photo-panel" }, $("geo-markers"));
        const leader = svg("path", { fill: "none", stroke: "#7f8c72", "stroke-width": .8, "stroke-dasharray": "2 3", "vector-effect": "non-scaling-stroke", "pointer-events": "none", opacity: .55 }, g);
        const symbol = svg("g", { class: "checkpoint-symbol", transform: `scale(${symbolScale})` }, g);
        svg("circle", { r: 35, fill: "transparent", "aria-hidden": "true" }, symbol);
        svg("circle", { r: 26, fill: "none", stroke: "#537f57", "stroke-width": 3, class: "checkpoint-focus", opacity: 0, "pointer-events": "none", "aria-hidden": "true" }, symbol);
        svg("circle", { r: 21, fill: "#fffaf0", stroke: "#bf9c65", "stroke-width": 2, class: "checkpoint-badge", "aria-hidden": "true" }, symbol);
        window.TrailCheckpoints.draw(svg, symbol, cp.id);
        const label = svg("text", { x: 0, y: 35 * symbolScale, "text-anchor": "middle", fill: "#4f694c", "font-size": 12, "font-weight": 600, class: "checkpoint-label", "pointer-events": "none" }, g);
        label.textContent = cp.name;
        mapMarkers.push({ id: `checkpoint-${cp.id}`, x, y, symbol, label, leader, g, fraction: cp.fraction, name: cp.name, priority: 40 });
        const open = (e) => {
          e.stopPropagation?.();
          openMemory(cp.id);
        };
        g.addEventListener("click", open);
        g.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            open(e);
          }
        });
        g.addEventListener("pointerdown", (e) => e.stopPropagation?.());
      }
      const li = html("li", null, $("checkpoint-list")), button = html("button", null, li, "checkpoint-button");
      button.id = `checkpoint-${cp.id}`;
      button.setAttribute("type", "button");
      const badge = html("span", null, button, "checkpoint-number"), art = svg("svg", { viewBox: "-20 -20 40 40", "aria-hidden": "true" }, badge);
      window.TrailCheckpoints.draw(svg, art, cp.id);
      const span = html("span", null, button);
      html("strong", cp.name, span);
      const hint = html("small", "沿途慢慢发现", span);
      hint.id = `checkpoint-hint-${cp.id}`;
      button.addEventListener("click", () => openMemory(cp.id));
    }
    if (r.id === "tiger" && tigerJourney) {
      for (const id of ["naxi", "bends", "tea-horse", "halfway"]) {
        const anchor = tigerJourney.anchors[id];
        if (!anchor) continue;
        const { x, y } = visualRoute.sample(anchor.fraction), name = anchor.label;
        const g = svg("g", { transform: `translate(${x} ${y})`, role: "img", "aria-label": name, "data-tiger-landmark": id }, $("geo-markers"));
        const leader = svg("path", { fill: "none", stroke: "#7f8c72", "stroke-width": .8, "stroke-dasharray": "2 3", "vector-effect": "non-scaling-stroke", "pointer-events": "none", opacity: .55 }, g);
        const symbol = svg("g", {}, g);
        svg("circle", { r: 14, fill: "#fffaf0", stroke: "#af9873", "stroke-width": 1.4 }, symbol);
        svg("path", { d: id === "bends" ? "M-8 7L-2 2L-6-2L3-7L8-4" : "M-8 3L0-5L8 3M-6 1V8H6V1", fill: "none", stroke: "#647c60", "stroke-width": 1.8, "stroke-linecap": "round", "stroke-linejoin": "round" }, symbol);
        const label = svg("text", { "text-anchor": "middle", fill: "#4f694c", "font-weight": 600, class: "checkpoint-label" }, g);
        label.textContent = name;
        mapMarkers.push({ id: `landmark-${id}`, x, y, symbol, label, leader, name, priority: 60 });
      }
    }
    updatePosition(0, true);
  }
  function describeRoute() {
    const r = J.routeOf(state);
    $("stage-location").textContent = r.name;
    $("route-title").textContent = r.id === "wugong" ? "武功山 · 东江村经典反穿" : r.name;
    $("route-context").textContent = r.id === "wugong" ? "东江村出发，在观音宕／星空营地过夜，第二天经过吊马桩和金顶，从景区下山至大门。" : r.id === "tiger" ? "桥头出发，沿高路走到中峡客栈；再决定是否沿张老师小路往返中虎跳江边。" : "跟着山径走一走，收下沿途照片，也把喜欢的瞬间留在手帐。";
    $("route-notice").textContent = r.id === "wugong" ? "手绘路线为艺术化示意，保留真实地点顺序，不作为实地导航。" : r.notice;
    $("route-sources").replaceChildren();
    const a = html("a", "查看参考路线来源 ↗", $("route-sources"));
    a.setAttribute("href", r.id === "wugong" ? "wugong-walk.html" : r.geo.source.url);
    if (r.id === "wugong") a.textContent = "完整路线与素材来源 ↗";
    a.setAttribute("target", "_blank");
    a.setAttribute("rel", "noopener noreferrer");
    const credit = html("a", "地图来源：© OpenStreetMap contributors ↗", $("route-sources"));
    credit.setAttribute("href", "https://www.openstreetmap.org/copyright");
    credit.setAttribute("target", "_blank");
    credit.setAttribute("rel", "noopener noreferrer");
    credit.hidden = r.id === "wugong";
    for (const r2 of G.ROUTES) $(`route-${r2.id}`).setAttribute("aria-pressed", r2.id === state.routeId);
  }
  function drawPicker() {
    for (const r of G.ROUTES) {
      const b = html("button", null, $("route-cards"), `route-card theme-${r.theme}`);
      b.id = `route-${r.id}`;
      b.setAttribute("type", "button");
      b.setAttribute("aria-pressed", r.id === state.routeId);
      html("strong", r.name, b);
      html("small", r.id === "wugong" ? "东江村反穿 · 草甸与手帐" : r.id === "westlake" ? "溪水、茶叶与小遇见" : { snow: "风雪与山脊", gorge: "江声与山径", meadow: "草甸与云海", coast: "海湾与潮声", forest: "森林与溪谷", bamboo: "竹林与石阶", tea: "溪谷与茶园" }[r.theme], b);
      const art = svg("svg", { viewBox: "0 0 720 600", class: "route-mini", "aria-hidden": "true" }, b), p = fitProjection(r.geo.line, 720, 600, 85);
      svg("path", { d: routeDrawing(r, p).path, fill: "none", stroke: "#52764f", "stroke-width": 18, "stroke-linecap": "round", "stroke-linejoin": "round" }, art);
      b.addEventListener("click", () => selectRoute(r.id));
    }
  }
  function position() {
    return visualRoute.sample(state.progress);
  }
  function updatePosition(dt = 0, snap = false) {
    if (!projection || !visualRoute) return;
    const isWugong = state.routeId === "wugong", phase = isWugong ? Runtime.wugongPhase(state.progress) : null;
    const walking = state.status === "walking" && !audioBackground && !document.hidden && !miniController.active && !rewardController.open && !journalController.open && !photoId && (!tigerJourney || tigerJourney.phase === "high");
    const gait = mapGait.update(dt, walking, state.pace * (phase ? 1 - phase.slope * .08 : 1));
    gaitClock = gait.clock;
    if (gait.contact && sound) footstep();
    const { x, y } = position();
    const full = isWugong || overview || state.status === "ready" || motionReduced;
    const target = full ? fullMapView : Runtime.mapFollowViewport(mapScreen.width, mapScreen.height, fullMapView, { x, y }, mapScreen.desktop, !!photoId);
    const smoothing = dt > 0 ? 1 - Math.exp(-Math.min(.1, dt) * 3.2) : 0;
    const deadzone = 1.2 / Math.max(.1, mapSizing.scale);
    for (const k of ["x", "y", "w", "h"]) {
      if (snap || motionReduced) view[k] = target[k];
      else {
        const delta = target[k] - view[k];
        const threshold = k === "x" || k === "y" ? deadzone : 0;
        if (Math.abs(delta) > threshold) view[k] += (delta - Math.sign(delta) * threshold) * smoothing;
      }
    }
    $("map").setAttribute("viewBox", `${view.x.toFixed(2)} ${view.y.toFixed(2)} ${view.w.toFixed(2)} ${view.h.toFixed(2)}`);
    mapSizing = Runtime.mapSymbols(mapScreen.width, mapScreen.height, view, full);
    const heroScale = mapSizing.hiker;
    $("player").setAttribute("transform", `translate(${x.toFixed(2)} ${(y - 17.2 * heroScale).toFixed(2)}) scale(${heroScale})`);
    $("completed-line").setAttribute("d", visualRoute.pathUntil(state.progress));
    const heroX = x * mapSizing.scale + mapSizing.offsetX, heroY = y * mapSizing.scale + mapSizing.offsetY;
    const labelBoxes = [...mapControlBoxes, { x: heroX - mapSizing.hikerPixels * .42, y: heroY - mapSizing.hikerPixels * 1.15, width: mapSizing.hikerPixels * .84, height: mapSizing.hikerPixels * 1.2 }];
    const labelRequests = [];
    for (const marker of endpointMarkers) {
      const anchor = marker;
      const px = anchor.x * mapSizing.scale + mapSizing.offsetX, py = anchor.y * mapSizing.scale + mapSizing.offsetY;
      const visible = isWugong ? px >= 14 && px <= mapScreen.width - 14 && py >= 14 && py <= mapScreen.height - 14 : px >= -8 && px <= mapScreen.width + 8 && py >= -8 && py <= mapScreen.height + 8;
      marker.g.setAttribute("display", visible ? "" : "none");
      marker.screen = { x: px, y: py, visible };
      if (isWugong) {
        marker.g.setAttribute("tabindex", visible ? "0" : "-1");
        const visited = marker.kind === "start" || marker.kind === "end" ? state.resolved.includes(marker.stateId) : state.visited.includes(marker.checkpointId);
        marker.g.setAttribute("data-visited", String(visited));
        marker.g.setAttribute("data-active", String(state.pending?.id === marker.stateId || state.pending?.id === marker.checkpointId));
        const label = visited && marker.kind === "start" ? "中庵 · 已出发" : visited && marker.kind === "end" ? "金顶 · 已抵达" : marker.name;
        if (marker.label.textContent !== label) marker.label.textContent = label;
      }
      if (!visible) continue;
      marker.g.setAttribute("transform", `translate(${anchor.x} ${anchor.y}) scale(${1 / mapSizing.scale})`);
      labelRequests.push({ id: marker.id, anchor: marker.screen, width: marker.width, height: marker.height, clearance: isWugong ? 7 : 12, preferredSide: marker.kind === "start" ? "bottom" : "top", priority: 100, required: true });
      labelBoxes.push({ x: px - 5, y: py - 5, width: 10, height: 10 });
    }
    for (const marker of mapMarkers) {
      marker.symbol.setAttribute("transform", `scale(${mapSizing.marker.toFixed(4)})`);
      const anchor = marker;
      const px = anchor.x * mapSizing.scale + mapSizing.offsetX, py = anchor.y * mapSizing.scale + mapSizing.offsetY;
      const visible = px > -24 && px < mapScreen.width + 24 && py > -24 && py < mapScreen.height + 24;
      if (marker.g) marker.g.setAttribute("display", visible ? "" : "none");
      marker.screen = { x: px, y: py, visible };
      marker.label.setAttribute("display", "none"); marker.leader.setAttribute("display", "none");
      if (!visible) continue;
      const width = [...marker.label.textContent].reduce((sum, char) => sum + (/[ -~]/.test(char) ? 7 : 12), 8);
      labelRequests.push({ id: marker.id, anchor: marker.screen, width, height: 18, clearance: mapSizing.markerPixels / 2, preferredSide: "bottom", priority: marker.priority });
      labelBoxes.push({ x: px - mapSizing.markerPixels / 2, y: py - mapSizing.markerPixels / 2, width: mapSizing.markerPixels, height: mapSizing.markerPixels });
    }
    mapLabelPositions = Runtime.layoutMapLabels({ width: mapScreen.width, height: mapScreen.height, boxes: labelBoxes, labels: labelRequests, previous: mapLabelPositions });
    for (const marker of endpointMarkers) {
      if (!marker.screen.visible) continue;
      const placement = mapLabelPositions.get(marker.id);
      marker.sign.setAttribute("display", placement?.visible ? "" : "none");
      marker.line.setAttribute("display", placement?.visible ? "" : "none");
      if (!placement?.visible) continue;
      const dx = placement.x - marker.screen.x, dy = placement.y - marker.screen.y;
      marker.sign.setAttribute("transform", `translate(${dx.toFixed(2)} ${dy.toFixed(2)})`);
      marker.line.setAttribute("d", `M0 0L${dx.toFixed(2)} ${dy.toFixed(2)}`);
    }
    for (const marker of mapMarkers) {
      const placement = mapLabelPositions.get(marker.id);
      if (!marker.screen.visible || !placement?.visible) continue;
      const dx = (placement.x - marker.screen.x) / mapSizing.scale, dy = (placement.y - marker.screen.y) / mapSizing.scale;
      marker.label.setAttribute("display", "");
      marker.label.setAttribute("x", String(dx)); marker.label.setAttribute("y", String(dy + mapSizing.font * .35));
      marker.label.setAttribute("font-size", String(mapSizing.font));
      if (Math.abs(placement.x - marker.screen.x) > 14 || placement.y < marker.screen.y) {
        const length = Math.hypot(dx, dy), start = mapSizing.markerPixels / (2 * mapSizing.scale), end = Math.max(start, length - 10 / mapSizing.scale);
        marker.leader.setAttribute("display", "");
        marker.leader.setAttribute("d", `M${(dx / length * start).toFixed(2)} ${(dy / length * start).toFixed(2)}L${(dx / length * end).toFixed(2)} ${(dy / length * end).toFixed(2)}`);
      }
    }
    hikerFacing = mapHeading.update(visualRoute.heading(state.progress), dt, walking);
    updateFigure(walking);
    updateAir();
    animateDiscovery();
    updateLife();
    $("weather-window").setAttribute("cx", x);
    $("weather-window").setAttribute("cy", y);
    $("weather-window").setAttribute("r", J.weather(state) === "blizzard" ? 120 : 215);
    const fogMask = $("fog-hole");
    for (const node of [$("fog-cover"), fogMask, fogMask.querySelector("rect")]) {
      node.setAttribute("x", String(view.x)); node.setAttribute("y", String(view.y));
      node.setAttribute("width", String(view.w)); node.setAttribute("height", String(view.h));
    }
    $("map").setAttribute("aria-label", `${J.routeOf(state).name}艺术化路线示意。背包小人沿平滑山径行进，已走${Math.round(state.progress * 100)}%。`);
    if (sceneRenderer?.alive) sceneRenderer.draw({ view, overview: full, progress: state.progress, elapsed: state.elapsed, weather: J.weather(state), reducedMotion: motionReduced });
  }
  function figureAction() {
    if (miniController.state) return "look";
    if (photoId || state.pending?.kind === "photo") return "photo";
    if (state.pending?.kind === "choice" && ["snow", "blizzard", "wind"].includes(J.weather(state))) return "shelter";
    if (["finished", "retreated"].includes(state.status)) return "finish";
    if (state.status === "paused") return "look";
    if (state.status === "walking" && state.elapsed - actionStarted < 1.2) return "discover";
    return "walk";
  }
  function updateFigure(walking) {
    const action = state.status === "ready" ? "ready" : figureAction();
    $("player").setAttribute("data-action", action);
    const mountain = state.routeId === "wugong" ? Runtime.wugongPhase(state.progress) : null;
    const lean = mountain && walking ? mountain.leanDegrees : 0;
    $("hiker-facing").setAttribute("transform", `scale(${hikerFacing} 1) rotate(${lean.toFixed(2)} 0 17.2)`);
    mapCharacter.paint({ clock: gaitClock, walking, reduced: motionReduced, action, kitMotion: !!mountain, detailed: state.routeId === "wugong" });
    const cold = J.routeOf(state).theme === "snow" && state.status !== "ready", breath = motionReduced ? 0 : (Math.sin(state.elapsed * 2.4) + 1) / 2;
    $("hiker-breath").setAttribute("opacity", cold ? (0.08 + breath * 0.25).toFixed(3) : 0);
    $("hiker-breath").setAttribute("transform", `translate(${(breath * 3 * hikerFacing).toFixed(2)} ${(-breath * 2).toFixed(2)}) scale(${hikerFacing} 1)`);
  }
  function updateLife() {
    L.update(lifeActors, state.elapsed, J.weather(state), motionReduced);
    for (const [i, node] of footprints.entries()) {
      const fraction = state.progress - (i + 1) * 8e-3;
      if (fraction <= 0) {
        node.setAttribute("opacity", 0);
        continue;
      }
      const { x, y } = visualRoute.sample(fraction), angle = visualRoute.heading(fraction, 10) * 180 / Math.PI;
      node.setAttribute("transform", `translate(${(x + (i % 2 ? 2 : -2)).toFixed(2)} ${y.toFixed(2)}) rotate(${(angle - 90).toFixed(2)})`);
      node.setAttribute("opacity", (0.28 * (1 - i / 9)).toFixed(3));
    }
  }
  function playTransition(kind, label, photo = null, icon = null) {
    const layer = $("transition-layer");
    layer.replaceChildren();
    if (motionReduced) return;
    const fx = html("div", null, layer, `scene-fx ${kind}-fx`);
    fx.setAttribute("data-transition", kind);
    if (photo) {
      const image = html("img", null, fx);
      image.setAttribute("src", photo);
      image.setAttribute("alt", "");
    }
    if (icon) {
      const art = svg("svg", { viewBox: "-25 -25 50 50" }, fx);
      natureIcon(art, icon);
    }
    html("span", label, fx);
    fx.addEventListener("animationend", (e) => {
      if (e.target === fx && layer.children[0] === fx) layer.replaceChildren();
    });
  }
  function updateAir() {
    const weather = J.weather(state);
    for (const [i, node] of cloudNodes.entries()) {
      const p = M.cloud(i, state.elapsed, motionReduced);
      node.setAttribute("transform", `translate(${p.x.toFixed(3)} ${p.y.toFixed(3)})`);
      node.setAttribute("opacity", p.alpha.toFixed(3));
    }
    for (const [i, node] of mistNodes.entries()) {
      const p = M.mist(i, state.elapsed, weather, motionReduced);
      node.setAttribute("transform", `translate(${p.x.toFixed(3)} ${p.y.toFixed(3)})`);
      node.setAttribute("opacity", p.alpha.toFixed(3));
    }
  }
  function photoContent(cp) {
    if (!photoSession) photoSession = scenes.enter("photo");
    photoId = cp.id;
    $("photo-title").textContent = cp.name;
    showPhotoImage(cp);
    $("photo-credit").replaceChildren();
    html("span", `摄影：${cp.photo.author}`, $("photo-credit"));
    if (cp.locationNote) html("span", cp.locationNote, $("photo-credit"));
    for (const [text, url] of [["来源 ↗", cp.photo.source], [cp.photo.license, cp.photo.licenseUrl]]) {
      const a = html("a", text, $("photo-credit"));
      a.setAttribute("href", url);
      a.setAttribute("target", "_blank");
      a.setAttribute("rel", "noopener noreferrer");
    }
    fillNature("photo-nature", K.checkpoint(cp.id));
    $("photo-panel").hidden = false;
  }
  function openMemory(id) {
    if (rewardController.open) return;
    if (miniController.active) miniController.finish();
    if (rewardController.open) return;
    const cp = J.routeOf(state).checkpoints.find((c) => c.id === id);
    if (!cp || (!cp.browseAvailable && !state.visited.includes(id)) || state.status === "encounter" || photoFromAlbum) return;
    photoFromAlbum = true;
    cancelLoop();
    photoContent(cp);
    $("photo-continue").textContent = "回到旅程 →";
    refreshRuntime();
    $("photo-continue").focus({ preventScroll: true });
  }
  function closePhoto() {
    if (photoId) {
      const cp = J.routeOf(state).checkpoints.find((c) => c.id === photoId);
      if (cp) playTransition("photo", "收进今天的旅程", cp.photo.file);
    }
    if (photoFromAlbum) {
      photoFromAlbum = false;
      photoId = null;
      $("photo-panel").hidden = true;
      scenes.leave(photoSession);
      photoSession = null;
      refreshRuntime();
      return;
    }
    if (state.pending?.kind === "photo") {
      photoId = null;
      $("photo-panel").hidden = true;
      scenes.leave(photoSession, false);
      photoSession = null;
      apply(J.continuePhoto(state));
    }
  }
  function render() {
    const key = [!!rewardController.current, choiceResult?.until > state.elapsed, state.status, state.pending?.id, state.visited.join(","), Math.round(state.progress * 100), photoId, overview, discovery()?.id, trip.found.length, miniController.state?.id, miniController.state?.acted, tigerJourney?.phase, tigerJourney?.nextStage, Math.floor((tigerJourney?.returnClock || 0) / (motionReduced ? .5 : 1.8))].join("|");
    if (key === uiKey) return;
    uiKey = key;
    $("map").setAttribute("preserveAspectRatio", state.routeId === "wugong" || overview || motionReduced || state.status === "ready" ? "xMidYMid meet" : "xMidYMid slice");
    renderDiscovery();
    const r = J.routeOf(state), walking = state.status === "walking";
    $("journey-stage").classList.toggle("walking", walking);
    $("map-frame").classList.toggle("active", walking);
    $("journey-state").textContent = { ready: "约2–3分钟", walking: "沿着山径慢慢走", paused: "停下来看看", encounter: "在路上停一停", finished: "今天的旅程", retreated: "平安结束" }[state.status];
    if (r.id === "wugong" && state.status === "ready") $("journey-state").textContent = "东江村反穿 · 2天1夜";
    if (r.id === "aotai" && state.status === "ready") $("journey-state").textContent = "塘口 → 汤峪方向";
    if (tigerJourney) $("journey-state").textContent = state.status === "ready" ? "高路 · 江边往返" : ({ high: "沿高路行进", junction: "已到高路终点", connector: "准备进入江边支线", river: "中虎跳江边", riverside: "江边目的地 · 待返回", returning: state.status === "paused" ? "回程歇脚" : "沿原小路返回", complete: "旅程结束" })[tigerJourney.phase];
    $("journey-progress").setAttribute("aria-label", tigerJourney ? "高路进度" : "旅程进度");
    $("journey-progress").setAttribute("aria-valuenow", Math.round(state.progress * 100));
    $("journey-progress").hidden = r.id === "wugong" && state.status === "ready";
    $("journey-progress-fill").style.width = `${state.progress * 100}%`;
    $("thought").textContent = echo && state.elapsed < echoUntil ? echo : state.status === "paused" && !photoFromAlbum ? K.moment(state.routeId, state.progress)?.look || J.thought(state) : J.thought(state);
    if (r.id === "wugong" && state.status === "ready") $("thought").textContent = "穿过林间和草甸，在观音宕歇一夜，把沿途的手绘收进手帐。";
    $("feeling").textContent = J.feeling(state);
    $("walk-toggle").disabled = !(["walking", "paused"].includes(state.status) || ["wugong", "tiger", "aotai"].includes(r.id) && state.status === "ready") || !!photoFromAlbum || !!miniController.state || !!rewardController.current;
    $("walk-toggle").textContent = state.status === "ready" && r.id === "tiger" ? "从桥头出发 →" : r.id === "wugong" && state.status === "ready" ? "从东江村出发 →" : r.id === "aotai" && state.status === "ready" ? "走进秦岭 →" : state.status === "paused" ? "继续走 →" : "停下来看看";
    const wugongWalkPreview = $("wugong-walk-preview");
    if (wugongWalkPreview) wugongWalkPreview.hidden = r.id !== "wugong";
    const tigerWalkPreview = $("tiger-walk-preview");
    if (tigerWalkPreview) tigerWalkPreview.hidden = r.id !== "tiger";
    const aotaiWalkPreview = $("aotai-walk-preview");
    if (aotaiWalkPreview) aotaiWalkPreview.hidden = r.id !== "aotai";
    if (tigerJourney && !["high", "returning"].includes(tigerJourney.phase)) $("walk-toggle").disabled = true;
    if (tigerJourney?.phase === "returning") $("walk-toggle").textContent = state.status === "paused" ? "继续返回 →" : "在回程歇一会儿";
    if (tigerJourney && tigerJourney.phase !== "high") {
      $("thought").textContent = ({ junction: "高路在中峡客栈一带结束。江边支线去过以后，仍会回到这里。", connector: "先经过张老师客栈，再沿张老师小路下到江边。", river: "远处的金沙江，已经来到眼前。", riverside: "这里是支线目的地。沿来时的小路返回，旅程才收束。", returning: "沿张老师小路原路上行，再回到中峡客栈一带。", complete: tigerJourney.branchTaken ? "从高路看江，再到江边取景，最后沿原路回来。" : "从桥头走到中峡客栈，高路的起点和终点都留下了记忆。" })[tigerJourney.phase];
      $("feeling").textContent = tigerJourney.phase === "complete" ? "今天的山径，留在手帐里" : "主线与支线 · 原路往返";
    }
    $("map-toggle").textContent = overview ? "跟着小人走 ↗" : "看完整路线 ↗";
    $("map-toggle").hidden = state.routeId === "wugong";
    $("map-toggle").setAttribute("aria-pressed", overview);
    $("checkpoint-list").closest(".album").querySelector("h2").textContent = tigerJourney ? "沿途实景照片" : "路上，收进来的风景";
    $("album-count").textContent = tigerJourney ? `${r.checkpoints.length} 张 · 随时查看` : `${state.visited.length} / ${r.checkpoints.length}`;
    for (const cp of r.checkpoints) {
      const visited = state.visited.includes(cp.id), unlocked = cp.browseAvailable || visited, b = $(`checkpoint-${cp.id}`);
      b.disabled = !unlocked;
      b.classList.toggle("collected", unlocked);
      b.setAttribute("aria-expanded", photoId === cp.id);
      b.setAttribute("aria-controls", "photo-panel");
      $(`checkpoint-hint-${cp.id}`).textContent = cp.browseAvailable ? visited ? "实景照片 · 再看一眼" : "实景照片 · 点击查看" : unlocked ? "已收集 · 再看一眼" : "沿途慢慢发现";
      $(`marker-${cp.id}`).classList.toggle("unlocked", unlocked);
      $(`marker-${cp.id}`).setAttribute("aria-disabled", r.id === "wugong" ? false : !unlocked);
    }
    const weather = J.weather(state), w = G.WEATHER[weather];
    $("weather-name").textContent = w.name;
    $("weather-icon").textContent = w.icon;
    $("journey-stage").setAttribute("data-weather", weather);
    $("fog-cover").setAttribute("opacity", weather === "fog" ? 0.18 : weather === "blizzard" ? 0.23 : 0);
    $("atmosphere").classList.toggle("cold", state.warmth < 40);
    $("atmosphere").classList.toggle("evening", state.progress > 0.8);
    if (weather !== lastWeather) {
      lastWeather = weather;
      $("weather-fx-html").replaceChildren();
      if (["snow", "blizzard", "rain"].includes(weather)) for (let i = 0; i < 22; i++) {
        const flake = html("span", weather === "rain" ? "╱" : "·", $("weather-fx-html"), "weather-particle");
        flake.style.left = `${i * 43 % 100}%`;
        flake.style.animationDelay = `-${i * 0.37}s`;
        flake.style.animationDuration = `${weather === "rain" ? 1.2 : 2.5 + i % 3}s`;
      }
    }
    const wugongEntry = r.id === "wugong" && state.status === "ready";
    const tigerEntry = r.id === "tiger" && state.status === "ready";
    const aotaiEntry = r.id === "aotai" && state.status === "ready";
    $("map-frame").classList.toggle("wugong-entry", wugongEntry);
    $("map-frame").classList.toggle("tiger-entry", tigerEntry);
    $("map-frame").classList.toggle("aotai-entry", aotaiEntry);
    $("overlay").classList.toggle("wugong-entry-cover", wugongEntry);
    $("overlay").classList.toggle("tiger-entry-cover", tigerEntry);
    $("overlay").classList.toggle("aotai-entry-cover", aotaiEntry);
    $("overlay").hidden = state.status !== "ready" || miniController.active || rewardController.open || !!photoId;
    if (state.status === "ready") {
      const story = J.storyOf(state);
      $("overlay-kicker").textContent = r.id === "wugong" ? "东江村经典反穿 · 两天一夜" : tigerEntry ? "虎跳峡高路 · 两天一夜" : aotaiEntry ? "鳌太线 · 冬季历史路线" : "THE TRAIL IS WAITING";
      $("overlay-title").textContent = r.id === "wugong" ? "沿着草甸，把山野收进手帐。" : aotaiEntry ? "循着山脊，走进云与石之间。" : story.openingTitle;
      $("overlay-copy").textContent = r.id === "wugong" ? "从东江村穿过林间与草甸，在观音宕过夜。第二天经过吊马桩和金顶，沿景区山路下到大门。走到风景里，留下一幅手绘。" : tigerEntry ? "从桥头越过二十八道拐，在中途客栈住一晚。清晨经龙洞瀑布走到中峡客栈，也可沿小路下到中虎跳江边，再循原路返回。" : aotaiEntry ? "从塘口村上鳌山，翻过飞机梁、金字塔与太白梁，走向大爷海和拔仙台。沿历史路线上下山，在途中歇脚过夜，把山野相遇收进手帐，最后经下板寺向汤峪方向离山。" : story.opening;
      $("overlay-action").textContent = r.id === "wugong" ? "从东江村出发 →" : tigerEntry ? "从桥头出发 →" : aotaiEntry ? "走进秦岭 →" : "出发，走一走 →";
      $("overlay-hint").textContent = r.id === "wugong" ? "跟随山路 · 沿途实景 · 手绘互动与旅行手帐" : r.id === "tiger" ? "中途客栈过夜 · 沿途实景 · 手绘收藏" : aotaiEntry ? "历史路线示意 · 多程过夜 · 手绘收藏" : r.id === "westlake" ? "约2–3分钟 · 路边的小动静，值得停一下" : "约2–3分钟 · 自动行走 · 随时停下";
    }
    $("story-panel").hidden = state.pending?.kind !== "choice";
    if (state.pending?.kind === "choice") {
      const e = state.pending;
      $("story-kicker").textContent = e.kicker;
      $("story-title").textContent = e.title;
      $("story-copy").textContent = e.copy;
      $("story-choices").replaceChildren();
      for (const choice of e.choices) {
        const b = html("button", null, $("story-choices"), "story-choice");
        b.id = `choice-${choice.id}`;
        b.setAttribute("type", "button");
        html("strong", choice.label, b);
        html("small", J.choiceEffects(state, choice).join(" · ") || choice.note, b);
        b.addEventListener("click", () => {
          if (state.pending?.id !== e.id) return;
          const next = J.choose(state, choice.id);
          if (next === state) return;
          choiceResult = { label: choice.label, copy: choice.echo, effects: J.choiceEffects(state, choice), until: next.elapsed + 10 };
          echo = choice.echo;
          echoUntil = state.elapsed + 10;
          apply(next);
        });
      }
    }
    const showChoice = choiceResult && state.elapsed < choiceResult.until && !state.pending && !photoFromAlbum && !miniController.state && !rewardController.current;
    $("choice-feedback").hidden = !showChoice;
    if (showChoice) {
      $("choice-feedback-title").textContent = "已选择 · " + choiceResult.label;
      $("choice-feedback-copy").textContent = choiceResult.copy;
      $("choice-feedback-effects").textContent = choiceResult.effects.join(" · ");
    }
    if (state.pending?.kind === "photo" && photoId !== state.pending.id) {
      photoContent(state.pending.checkpoint);
      $("photo-continue").textContent = "继续走 →";
    }
    if (!photoId) $("photo-panel").hidden = true;
    const ended = ["finished", "retreated"].includes(state.status);
    $("ending-panel").hidden = !ended || !!photoFromAlbum;
    if (ended) {
      const end = J.ending(state);
      $("ending-title").textContent = r.id === "wugong" && state.status === "finished" ? "从中庵，走到了金顶。" : tigerJourney ? tigerJourney.branchTaken ? "回到中峡客栈，这一程收好了。" : "走到中峡客栈，今天的高路走完了。" : end.title;
      $("ending-copy").textContent = r.id === "wugong" && state.status === "finished" ? "林缘的石阶、开阔的草甸和一路的停留，连成了从中庵到金顶的这一程。" : tigerJourney ? tigerJourney.branchTaken ? `高路上的俯瞰、${trip.found.includes("tiger-middle-river-frame-v1") ? "江边亲手留下的取景" : "江边近处的水声"}，以及沿张老师小路原路返回的脚步，组成了今天的峡谷旅程。` : "从桥头沿高路走到中峡客栈一带。今天先在这里停下，江边支线留给下一次。" : end.copy;
      $("ending-memories").replaceChildren();
      for (const m of state.memories) html("li", m, $("ending-memories"));
      journalController.renderEnding();
      if (!tigerJourney) html("li", `带回了${state.visited.length}张真实山野照片。`, $("ending-memories"));
    }
    renderTigerRoute();
    sceneCharacter.render({ dialogue: !$("story-panel").hidden && !miniController.active && !rewardController.open && !["wugong-start", "wugong-end"].includes(state.pending?.id),
      photo: !$("photo-panel").hidden && !!photoId && !miniController.active && !rewardController.open });
    syncAudio();
  }
  function apply(next) {
    if (state.routeId === "aotai" && state.status === "ready" && next.status !== "ready") {
      location.assign($("aotai-walk-preview").href);
      return;
    }
    if (state.routeId === "tiger" && state.status === "ready" && next.status !== "ready") {
      location.assign($("tiger-walk-preview").href);
      return;
    }
    if (state.routeId === "wugong" && state.status === "ready" && next.status !== "ready") {
      location.assign($("wugong-walk-preview").href);
      return;
    }
    const previous = state;
    state = next;
    uiKey = "";
    render();
    updatePosition(0);
    if (state.status === "encounter" && previous.pending?.id !== state.pending?.id) {
      const button = state.pending.kind === "photo" ? $("photo-continue") : $("story-choices").querySelector("button");
      button?.focus({ preventScroll: true });
    }
    if (["finished", "retreated"].includes(state.status) && state.status !== previous.status) $("replay").focus({ preventScroll: true });
    ensureLoop();
  }
  function cancelLoop() {
    loop.stop();
  }
  function ensureLoop() {
    loop.ensure();
  }
  function frame(dt) {
    if (miniController.active) {
      miniController.update(dt);
      const approach = riverApproach();
      const mountainStage = miniController.state?.cameraStage || "";
      const openness = Math.round(gorgeOpenness() * 100);
      if (approach !== lastRiverApproach || mountainStage !== lastMountainSoundStage || openness !== lastGorgeOpenness) {
        lastRiverApproach = approach; lastMountainSoundStage = mountainStage; lastGorgeOpenness = openness;
        syncAudio();
      }
      return;
    }
    if (tickTigerFlow(dt)) return;
    const previous = state;
    let next = J.tick(state, dt * (state.routeId === "wugong" ? Runtime.wugongPhase(state.progress).strideScale : 1));
    // A route section can cross a photograph while its painting is open.
    // Present the unresolved photograph on return without moving the map back.
    if (tigerJourney && next.pending?.kind === "photo" && next.progress < previous.progress) next = { ...next, progress: previous.progress };
    if (interceptTigerStop(previous, next)) return;
    state = next;
    if (state.status === "encounter" && previous.status === "walking") {
      render();
      updatePosition(dt);
      const button = state.pending.kind === "photo" ? $("photo-continue") : $("story-choices").querySelector("button");
      button?.focus({ preventScroll: true });
    } else {
      render();
      updatePosition(dt);
    }
    if (["finished", "retreated"].includes(state.status)) $("replay").focus({ preventScroll: true });
  }
  function selectRoute(id) {
    journalController.close(false);
    rewardController.close(false);
    miniController.finish(false, false);
    scenes.leave(photoSession, false);
    scenes.reset();
    photoSession = null;
    choiceResult = null;
    journalController.resetTrip();
    cancelLoop();
    state = J.create(id);
    resetTigerJourney();
    lastRiverApproach = -1;
    lastMountainSoundStage = "";
    lastGorgeOpenness = -1;
    prepareRoutePhotos();
    trip = D.create(id, void 0, { recent: journalController.recent(id) });
    natureId = null;
    natureNode = null;
    naturePoint = null;
    natureArt = null;
    actionStarted = -Infinity;
    $("transition-layer").replaceChildren();
    journalController.render();
    $("discovery-status").textContent = "换一条山径，遇见新的瞬间。之前的回忆还在手帐里。";
    photoId = null;
    photoFromAlbum = false;
    overview = false;
    echo = "";
    gaitClock = 0;
    mapGait.reset();
    hikerFacing = 1;
    visualRouteId = null;
    lastWeather = null;
    uiKey = "";
    view = { x: 0, y: 0, w: 720, h: 600 };
    $("photo-panel").hidden = true;
    describeRoute();
    drawMap();
    render();
    updatePosition(0);
    playTransition("route", J.routeOf(state).name);
  }
  function needsAudioResume() {
    return !journalController.open && !rewardController.current && sound && !audioBackground && !document.hidden && (miniController.state || photoId || ["walking", "encounter"].includes(state.status)) && !audioPlayer.running;
  }
  function audioScene() {
    const mode = rewardController.current ? "reward" : miniController.state ? "moment" : photoId ? "photo" : state.status === "walking" ? "walk" : state.status === "encounter" ? "choice" : "silent";
    return { routeId: state.routeId, checkpointId: photoId, weather: J.weather(state), progress: state.progress, mode, momentId: miniController.state?.id || rewardController.current?.id || null, momentGame: miniController.state?.game || miniGameKind(rewardController.current?.id) || null, riverApproach: riverApproach(), gorgeOpenness: gorgeOpenness() };
  }
  function gorgeOpenness() {
    const mini = miniController.state;
    return Number.isFinite(mini?.gorgeOpenness) ? Math.max(0, Math.min(1, mini.gorgeOpenness)) :
      ({ slope: 0, shoulder: .25, gorge: .7, view: 1 })[mini?.cameraStage] || 0;
  }
  function riverApproach() {
    const mini = miniController.state;
    const progress = mini?.game === "tiger-river" && mini.river?.phase === "descent" ? mini.river.descentProgress : 1;
    return progress < .3 ? 0 : progress < .6 ? .3 : progress < 1 ? .6 : 1;
  }
  function syncAudio() {
    const requested = !journalController.open && sound && !audioBackground && !document.hidden;
    if (!requested) {
      if (journalController.open || audioBackground || document.hidden) audioPlayer.hide();
    } else audioPlayer.setScene(audioScene());
    const playing = requested && audioPlayer.playing;
    $("sound-toggle").setAttribute("aria-pressed", sound);
    $("sound-toggle").textContent = soundBusy ? "声音 · 开启中" : soundError || (needsAudioResume() ? "声音 · 点此恢复" : `声音 · ${sound ? "开" : "关"}`);
    const musicState = audioPlayer.musicState;
    const track = Runtime.musicTrack(audioScene());
    const retryMusic = requested && !!track && ["blocked", "error"].includes(musicState);
    $("music-retry").hidden = !retryMusic;
    $("mini-music-retry").hidden = !retryMusic;
    const p = window.TrailAudio.profile(photoId);
    $("photo-soundscape").hidden = !p;
    if (p) {
      const title = track ? `${track.title} · ${track.author}` : p.title;
      const status = !sound ? "声音关闭" : audioBackground || document.hidden || journalController.open ? "已暂停" : !playing ? "点声音按钮恢复" : !track || musicState === "playing" ? "正在播放" : musicState === "loading" ? "配乐载入中 · 环境声已开启" : "配乐暂未播放 · 环境声已开启";
      $("photo-soundscape").textContent = `♪ ${title} · ${status}`;
      $("photo-soundscape").setAttribute("data-playing", playing);
    }
  }
  function footstep() {
    audioPlayer.step(state.routeId);
  }
  async function toggleSound() {
    if (soundBusy) return;
    if (!audioPlayer.available) {
      soundError = "此浏览器暂无音效";
      uiKey = "";
      render();
      return;
    }
    soundError = "";
    if (sound && !needsAudioResume()) {
      sound = false;
      audioPlayer.disable();
      uiKey = "";
      render();
      return;
    }
    soundBusy = true;
    uiKey = "";
    render();
    const ok = await audioPlayer.enable(audioScene());
    soundBusy = false;
    sound = ok;
    if (!ok && !soundError) soundError = audioPlayer.available ? "声音未能开启，再试一次" : "此浏览器暂无音效";
    uiKey = "";
    render();
  }
  for (const id of ["music-retry", "mini-music-retry"]) {
    $(id).addEventListener("click", () => {
      audioPlayer.retryMusic();
      syncAudio();
    });
  }
  $("choice-feedback-close").addEventListener("click", () => {
    choiceResult = null;
    uiKey = "";
    render();
  });
  $("overlay-action").addEventListener("click", () => apply(J.start(state)));
  $("walk-toggle").addEventListener("click", () => apply(["wugong", "tiger", "aotai"].includes(state.routeId) && state.status === "ready" ? J.start(state) : state.status === "paused" ? J.resume(state) : J.pause(state)));
  $("photo-continue").addEventListener("click", closePhoto);
  $("photo-close").addEventListener("click", closePhoto);
  $("replay").addEventListener("click", () => {
    const id = state.routeId;
    selectRoute(id);
    apply(J.start(state));
  });
  $("map-toggle").addEventListener("click", () => {
    overview = !overview;
    uiKey = "";
    render();
    updatePosition(0, true);
  });
  $("sound-toggle").addEventListener("click", toggleSound);
  $("observe-button").addEventListener("click", () => {
    const active = discovery();
    if (active) captureDiscovery(active.id);
  });
  window.addEventListener("keydown", (event) => {
    if (rewardController.handleKey(event)) return;
    if (event.ctrlKey || event.altKey || event.metaKey || event.repeat || ["INPUT", "TEXTAREA", "SELECT"].includes(event.target?.tagName)) return;
    if (event.key === "Escape" && miniController.active) {
      event.preventDefault();
      miniController.finish();
    } else if (event.key === "Escape" && photoId) {
      event.preventDefault();
      closePhoto();
    } else if (["p", "P", "Escape"].includes(event.key) && ["walking", "paused"].includes(state.status) && !photoFromAlbum && !miniController.active && (!tigerJourney || ["high", "returning"].includes(tigerJourney.phase))) {
      event.preventDefault();
      apply(state.status === "paused" ? J.resume(state) : J.pause(state));
    }
  });
  const backgroundPause = () => {
    audioBackground = true;
    scenes.suspend();
    miniController.pause();
    cancelLoop();
    audioPlayer.hide();
    uiKey = "";
    render();
    updatePosition(0);
  };
  const foreground = () => {
    audioBackground = false;
    scenes.foreground();
    uiKey = "";
    render();
    ensureLoop();
  };
  window.addEventListener("blur", backgroundPause);
  window.addEventListener("focus", foreground);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) backgroundPause();
    else foreground();
  });
  window.addEventListener("pagehide", (event) => {
    backgroundPause();
    if (!event.persisted) {
      miniController.destroy();
      moganGames?.destroy();
      tigerGames.destroy();
      tigerTrailGames?.destroy();
      mapCharacter.destroy();
      sceneCharacter.destroy();
      mapObserver?.disconnect();
      clearTimeout(mapResizeTimer);
      journalController.destroy();
      rewardController.destroy();
      scenes.reset();
      audioPlayer.destroy();
    }
  });
  window.addEventListener("pageshow", (event) => {
    if (event.persisted) foreground();
  });
  prepareRoutePhotos();
  drawPicker();
  describeRoute();
  drawMap();
  journalController.render();
  render();
  updatePosition(0);
  window.addEventListener("resize", () => {
    clearTimeout(mapResizeTimer);
    mapResizeTimer = setTimeout(() => { drawMap(); uiKey = ""; render(); }, 120);
  });
  if (window.ResizeObserver) {
    mapObserver = new window.ResizeObserver(() => {
      const rect = $("map-frame").getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      if (Math.abs(rect.width - mapScreen.width) < .5 && Math.abs(rect.height - mapScreen.height) < .5) return;
      clearTimeout(mapResizeTimer);
      mapResizeTimer = setTimeout(() => { drawMap(); uiKey = ""; render(); }, 120);
    });
    mapObserver.observe($("map-frame"));
  }
  if (window.PIXI && window.TrailPixiScene) {
    window.TrailPixiScene.create(window.PIXI, $("map-frame"), { onReady: () => {
      $("map-frame").classList.toggle("gpu-ready", true);
      $("map-frame").setAttribute("data-renderer", "pixi");
    }, onFallback: () => {
      $("map-frame").classList.toggle("gpu-ready", false);
      $("map-frame").setAttribute("data-renderer", "svg");
    } }).then((renderer) => {
      sceneRenderer = renderer;
      if (renderer?.alive) {
        renderer.setPlan(scenePlan);
        updatePosition(0);
      }
    }).catch(() => {
      $("map-frame").classList.toggle("gpu-ready", false);
    });
  }
})();
