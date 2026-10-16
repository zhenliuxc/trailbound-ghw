// Generated from src/app.js by npm run build. Edit src/, not this file.
"use strict";
(function() {
  "use strict";
  const G = window.TrailGame, J = window.TrailJourney, M = window.TrailMotion, D = window.TrailDiscoveries, L = window.TrailLife, K = window.TrailNature, X = window.TrailMiniGames ? window.TrailMiniGames.enhance(window.TrailMicroMoments) : window.TrailMicroMoments, $ = (id) => document.getElementById(id), NS = "http://www.w3.org/2000/svg", R = 6378137, rad = Math.PI / 180;
  let state = J.create("wugong"), projection = null, view = { x: 0, y: 0, w: 720, h: 600 }, overview = false, photoId = null, photoFromAlbum = false, photoSession = null, uiKey = "", echoUntil = 0, echo = "", sound = false, soundBusy = false, audioBackground = false, soundError = "", lastStrike = -1, scenePlan = null, sceneRenderer = null, cloudNodes = [], mistNodes = [], gaitClock = 0, hikerFacing = 1, lastWeather = null;
  const motionReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches || false;
  const audioPlayer = window.TrailAudio.create({ AudioContext: window.AudioContext || window.webkitAudioContext, navigator: window.navigator, fetch: window.fetch?.bind(window), timers: window, onStateChange: () => {
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
  let trip = D.create(state.routeId), natureId = null, natureNode = null, naturePoint = null, natureArt = null, lifeActors = [], footprints = [], actionStarted = -Infinity;
  const photoCache = /* @__PURE__ */ new Map();
  const Runtime = window.TrailRuntime;
  const dom = Runtime.createDom(document);
  const scenes = Runtime.createSceneManager({ status: () => state.status, pause: () => {
    state = J.pause(state);
  }, resume: () => {
    state = J.resume(state);
  }, hidden: () => document.hidden });
  const rewardController = Runtime.createRewardController({ dom, scenes, catalog: D, cache: artCache, audio: audioPlayer, reduced: motionReduced, gameKind: (id) => window.TrailMiniGames?.kinds[id], refresh: refreshRuntime, stopLoop: cancelLoop });
  const journalController = Runtime.createJournalController({
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
      const next = D.capture(state, trip, finished.state.id);
      if (next === trip) return false;
      trip = next;
      const moment = D.moment(state, trip, finished.state.id, { weather: J.weather(state), experience: finished.outcome });
      journalController.remember(moment);
      return rewardController.show(moment, finished.returnStatus);
    }
  });
  const loop = Runtime.createFrameLoop({ request: (callback) => window.requestAnimationFrame(callback), cancel: (id) => window.cancelAnimationFrame(id), active: () => scenes.canAnimate(miniController.active), update: frame });
  function refreshRuntime() {
    uiKey = "";
    render();
    updatePosition(0);
    ensureLoop();
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
    const gameArt = state.routeId === "westlake" ? Object.values(window.TrailMiniGames?.waterAssets?.creek || {}) : state.routeId === "mogan" ? Object.values(window.TrailMiniGames?.waterAssets?.rain || {}) : state.routeId === "wugong" ? Object.values(window.TrailMiniGames?.wugongAssets || {}).flatMap(Object.values) : [];
    const art = D.CATALOG.filter((e) => e.route === state.routeId).map((e) => e.artV5 || e.artV4 || e.badge).filter(Boolean);
    artCache?.prefetch([.../* @__PURE__ */ new Set([...gameArt, ...window.TrailMiniGames?.artRouteAssets(state.routeId) || [], "scenes/" + state.routeId + "-v1.webp", ...state.routeId === "wugong" ? ["sprites/wugong-swallow-kite-v1.webp", "sprites/wugong-meadow-grass-v1.webp"] : [], ...art])]);
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
    $("nature-discoveries").replaceChildren();
    if (!active) return;
    const entry = D.item(active.id);
    const point = G.position({ routeId: state.routeId, distance: G.metric(state.routeId).total * (active.at + 0.045) }), [x, y] = projection.point(point.lon, point.lat), g = svg("g", { id: "active-discovery", role: "button", tabindex: 0, class: "nature-marker", "aria-label": `记住${D.item(active.id).name}`, "data-discovery": active.id }, $("nature-discoveries"));
    naturePoint = [Math.max(48, Math.min(672, x + active.side * 42)), Math.max(55, Math.min(530, y - 42))];
    natureNode = g;
    svg("circle", { r: 42, fill: "transparent" }, g);
    svg("circle", { r: D.item(active.id).icon === "butterfly" ? 14 : 22, fill: entry.interaction ? "transparent" : "#fffaf0", stroke: entry.interaction ? "none" : "#dac691", "stroke-width": 1.5 }, g);
    natureArt = svg("g", {}, g);
    if (entry.edition === 3) svg("image", { href: entry.artV5 || entry.artV4 || entry.badge, x: -24, y: -24, width: 48, height: 48, "aria-hidden": "true" }, natureArt);
    else natureIcon(natureArt, D.item(active.id).icon);
    const label = svg("text", { y: D.item(active.id).icon === "butterfly" ? 28 : 37, "text-anchor": "middle", fill: "#557350", "font-size": 11, "font-weight": 600 }, g);
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
    natureNode.setAttribute("transform", `translate(${naturePoint[0].toFixed(2)} ${(naturePoint[1] + (motionReduced ? 0 : Math.sin(state.elapsed * 2.2) * 1.5)).toFixed(2)})`);
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
  function fitProjection(line, w = 720, h = 600, pad = 50) {
    const coords = line.map((p) => world(p[0], p[1])), xs = coords.map((p) => p[0]), ys = coords.map((p) => p[1]), minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys), scale = Math.min((w - pad * 2) / Math.max(1, maxX - minX), (h - pad * 2) / Math.max(1, maxY - minY)), ox = (w - (maxX - minX) * scale) / 2, oy = (h - (maxY - minY) * scale) / 2;
    return { scale, minX, maxY, ox, oy, point(lon, lat) {
      const [x, y] = world(lon, lat);
      return [ox + (x - minX) * scale, oy + (maxY - y) * scale];
    }, inverse(x, y) {
      const wx = minX + (x - ox) / scale, wy = maxY - (y - oy) / scale;
      return [wx / R / rad, (2 * Math.atan(Math.exp(wy / R)) - Math.PI / 2) / rad];
    } };
  }
  function lineD(line, p = projection) {
    return line.map((c, i) => {
      const [x, y] = p.point(c[0], c[1]);
      return `${i ? "L" : "M"}${x.toFixed(2)},${y.toFixed(2)}`;
    }).join(" ");
  }
  function cartoonLine(line, p = projection) {
    const points = line.map((c) => p.point(c[0], c[1]));
    function reduce(pts) {
      if (pts.length < 3) return pts;
      const a = pts[0], b = pts.at(-1), dx = b[0] - a[0], dy = b[1] - a[1];
      let max = 0, index = 0;
      for (let i = 1; i < pts.length - 1; i++) {
        const t = Math.max(0, Math.min(1, ((pts[i][0] - a[0]) * dx + (pts[i][1] - a[1]) * dy) / (dx * dx + dy * dy || 1))), d = Math.hypot(pts[i][0] - a[0] - t * dx, pts[i][1] - a[1] - t * dy);
        if (d > max) {
          max = d;
          index = i;
        }
      }
      return max > 2.5 ? [...reduce(pts.slice(0, index + 1)).slice(0, -1), ...reduce(pts.slice(index))] : [a, b];
    }
    return reduce(points).map((pt, i) => `${i ? "L" : "M"}${pt[0].toFixed(2)},${pt[1].toFixed(2)}`).join(" ");
  }
  function drawMap() {
    const r = J.routeOf(state);
    projection = fitProjection(r.geo.line, 720, 600, 85);
    view = { x: 0, y: 0, w: 720, h: 600 };
    $("map").setAttribute("viewBox", "0 0 720 600");
    for (const id of ["geo-background", "geo-labels", "geo-markers", "online-tiles", "nature-discoveries", "scene-life", "trail-footprints"]) $(id).replaceChildren();
    const projected = r.geo.line.map((p) => [...projection.point(p[0], p[1]), p[2]]), context = { features: [...r.geo.background.filter((f) => ["water", "cable", "coast"].includes(f.kind)), ...window.TrailLandscapeData?.[r.geoId]?.features || []].map((f) => ({ ...f, line: f.line.map((p) => projection.point(p[0], p[1])) })), peaks: r.geo.labels.map((p) => ({ ...p, x: projection.point(p.lon, p.lat)[0], y: projection.point(p.lon, p.lat)[1] })) };
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
      const title = svg("text", { x: 32, y: 38, fill: "#66825d", "font-size": 22, "font-weight": 700 }, $("geo-labels"));
      title.textContent = r.name;
    }
    for (const peak of scenePlan.terrain.peaks) {
      if (!["荞麦梁", "鳌山", "太白梁", "拔仙台", "幺妹峰", "婆缪峰", "莫干岭", "西灣山", "西湾山"].includes(peak.name)) continue;
      const text = svg("text", { x: Math.max(40, Math.min(660, peak.x)), y: Math.max(60, peak.y - 13), "text-anchor": "middle", fill: "#5b7970", "font-size": 11, "font-weight": 600, "data-peak": peak.osmId }, $("geo-labels"));
      text.textContent = peak.name;
    }
    lifeActors = L.mount(svg, $("scene-life"), L.build(scenePlan.theme, projected, { water: scenePlan.terrain.water }));
    footprints = [];
    if (r.theme === "snow") for (let i = 0; i < 8; i++) footprints.push(svg("ellipse", { rx: 1.8, ry: 3.6, fill: "#72918a", opacity: 0 }, $("trail-footprints")));
    if (sceneRenderer?.alive) sceneRenderer.setPlan(scenePlan);
    $("route-outline").setAttribute("d", cartoonLine(r.geo.line));
    $("route-line").setAttribute("d", cartoonLine(r.geo.line));
    const start = G.position({ routeId: r.id, distance: 0 }), [sx, sy] = projection.point(start.lon, start.lat);
    svg("circle", { cx: sx, cy: sy, r: 7, fill: "#537c60", stroke: "#fffdf0", "stroke-width": 3 }, $("geo-markers"));
    const labels = [];
    $("checkpoint-list").replaceChildren();
    for (const [i, cp] of r.checkpoints.entries()) {
      const pos = G.position({ routeId: r.id, distance: G.metric(r.id).total * cp.fraction }), [x, y] = projection.point(pos.lon, pos.lat), g = svg("g", { id: `marker-${cp.id}`, role: "button", tabindex: 0, class: "checkpoint-marker", transform: `translate(${x.toFixed(2)} ${y.toFixed(2)})`, "aria-label": cp.name, "aria-controls": "photo-panel" }, $("geo-markers"));
      svg("circle", { r: 35, fill: "transparent", "aria-hidden": "true" }, g);
      svg("circle", { r: 26, fill: "none", stroke: "#537f57", "stroke-width": 3, class: "checkpoint-focus", opacity: 0, "pointer-events": "none", "aria-hidden": "true" }, g);
      svg("circle", { r: 21, fill: "#fffaf0", stroke: "#bf9c65", "stroke-width": 2, class: "checkpoint-badge", "aria-hidden": "true" }, g);
      window.TrailCheckpoints.draw(svg, g, cp.id);
      let lx = Math.max(80, Math.min(640, x)), ly = y + (y > 450 ? -37 : 39);
      if (labels.some((p) => Math.abs(p[0] - lx) < 155 && Math.abs(p[1] - ly) < 28)) ly += 32;
      labels.push([lx, ly]);
      const label = svg("text", { x: lx - x, y: ly - y, "text-anchor": "middle", fill: "#4f694c", "font-size": 12, "font-weight": 600, class: "checkpoint-label", "pointer-events": "none" }, g);
      label.textContent = cp.name;
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
    updatePosition(0);
  }
  function describeRoute() {
    const r = J.routeOf(state);
    $("stage-location").textContent = r.name;
    $("route-title").textContent = r.name;
    $("route-context").textContent = "跟着山径走一走，收下沿途照片，也把喜欢的瞬间留在手帐。";
    $("route-notice").textContent = r.notice;
    $("route-sources").replaceChildren();
    const a = html("a", "查看参考路线来源 ↗", $("route-sources"));
    a.setAttribute("href", r.geo.source.url);
    a.setAttribute("target", "_blank");
    a.setAttribute("rel", "noopener noreferrer");
    const credit = html("a", "地图来源：© OpenStreetMap contributors ↗", $("route-sources"));
    credit.setAttribute("href", "https://www.openstreetmap.org/copyright");
    credit.setAttribute("target", "_blank");
    credit.setAttribute("rel", "noopener noreferrer");
    for (const r2 of G.ROUTES) $(`route-${r2.id}`).setAttribute("aria-pressed", r2.id === state.routeId);
  }
  function drawPicker() {
    for (const r of G.ROUTES) {
      const b = html("button", null, $("route-cards"), `route-card theme-${r.theme}`);
      b.id = `route-${r.id}`;
      b.setAttribute("type", "button");
      b.setAttribute("aria-pressed", r.id === state.routeId);
      html("strong", r.name, b);
      html("small", r.id === "westlake" ? "溪水、茶叶与小遇见" : { snow: "风雪与山脊", gorge: "江声与山径", meadow: "草甸与云海", coast: "海湾与潮声", forest: "森林与溪谷", bamboo: "竹林与石阶", tea: "溪谷与茶园" }[r.theme], b);
      const art = svg("svg", { viewBox: "0 0 120 100", class: "route-mini", "aria-hidden": "true" }, b), p = fitProjection(r.geo.line, 120, 100, 12);
      svg("path", { d: lineD(r.geo.line, p), fill: "none", stroke: "#52764f", "stroke-width": 3 }, art);
      b.addEventListener("click", () => selectRoute(r.id));
    }
  }
  function position() {
    return G.position({ routeId: state.routeId, distance: G.metric(state.routeId).total * state.progress });
  }
  function updatePosition(smoothing = 0.14) {
    if (!projection) return;
    const p = position(), [x, y] = projection.point(p.lon, p.lat);
    const full = overview || state.status === "ready" || motionReduced, w = full ? 720 : 470, h = full ? 600 : Math.min(600, w / (($("map-frame").getBoundingClientRect().width || 720) / ($("map-frame").getBoundingClientRect().height || 600))), target = { x: full ? 0 : Math.max(0, Math.min(720 - w, x - w / 2)), y: full ? 0 : photoId ? Math.max(-80, Math.min(600 - h + 400, y - h * 0.24)) : Math.max(0, Math.min(600 - h, y - h * 0.54)), w, h };
    for (const k of ["x", "y", "w", "h"]) view[k] = smoothing ? view[k] + (target[k] - view[k]) * smoothing : target[k];
    $("map").setAttribute("viewBox", `${view.x.toFixed(2)} ${view.y.toFixed(2)} ${view.w.toFixed(2)} ${view.h.toFixed(2)}`);
    const heroScale = (scenePlan?.artDetail ? 1.62 : 1.45) * view.w / 720;
    $("player").setAttribute("transform", `translate(${x.toFixed(2)} ${(y - 17.2 * heroScale).toFixed(2)}) scale(${heroScale})`);
    const next = G.position({ routeId: state.routeId, distance: G.metric(state.routeId).total * Math.min(1, state.progress + 7e-3) }), [nx] = projection.point(next.lon, next.lat);
    if (state.status === "walking" && Math.abs(nx - x) > 0.8) hikerFacing = nx > x ? 1 : -1;
    updateFigure();
    updateAir();
    animateDiscovery();
    updateLife();
    $("weather-window").setAttribute("cx", x);
    $("weather-window").setAttribute("cy", y);
    $("weather-window").setAttribute("r", J.weather(state) === "blizzard" ? 120 : 215);
    $("map").setAttribute("aria-label", `${J.routeOf(state).name}卡通路线。背包小人自动沿参考路线走向行进，已走${Math.round(state.progress * 100)}%。`);
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
  function updateFigure() {
    const action = figureAction(), pose = M.pose(gaitClock, state.status === "walking", motionReduced, { action, age: state.elapsed - actionStarted, weather: J.weather(state) });
    $("player").setAttribute("data-action", action);
    $("hiker-facing").setAttribute("transform", `scale(${hikerFacing} 1)`);
    $("hiker-torso").setAttribute("transform", pose.torso);
    $("hiker-pack").setAttribute("transform", pose.pack);
    $("hiker-scarf").setAttribute("transform", pose.scarf);
    $("hiker-camera").setAttribute("opacity", action === "photo" ? 1 : 0);
    $("hiker-pole").setAttribute("opacity", ["photo", "shelter", "look", "finish"].includes(action) ? 0 : 1);
    for (const [id, path] of [["leg-front", pose.front.path], ["shoe-front", pose.front.shoe], ["leg-back", pose.back.path], ["shoe-back", pose.back.shoe], ["arm-front", pose.armFront], ["arm-back", pose.armBack], ["hiker-pole", pose.pole]]) $(id).setAttribute("d", path);
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
      const p = G.position({ routeId: state.routeId, distance: G.metric(state.routeId).total * fraction }), [x, y] = projection.point(p.lon, p.lat), next = G.position({ routeId: state.routeId, distance: G.metric(state.routeId).total * Math.min(1, fraction + 2e-3) }), [nx, ny] = projection.point(next.lon, next.lat), angle = Math.atan2(ny - y, nx - x) * 180 / Math.PI;
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
    if (!cp || !state.visited.includes(id) || state.status === "encounter" || photoFromAlbum) return;
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
    const key = [!!rewardController.current, choiceResult?.until > state.elapsed, state.status, state.pending?.id, state.visited.join(","), Math.round(state.progress * 100), photoId, overview, discovery()?.id, trip.found.length, miniController.state?.id, miniController.state?.acted].join("|");
    if (key === uiKey) return;
    uiKey = key;
    $("map").setAttribute("preserveAspectRatio", overview || motionReduced || state.status === "ready" ? "xMidYMid meet" : "xMidYMid slice");
    renderDiscovery();
    const r = J.routeOf(state), walking = state.status === "walking";
    $("journey-stage").classList.toggle("walking", walking);
    $("map-frame").classList.toggle("active", walking);
    $("journey-state").textContent = { ready: "约2–3分钟", walking: "沿着山径慢慢走", paused: "停下来看看", encounter: "在路上停一停", finished: "今天的旅程", retreated: "平安结束" }[state.status];
    $("journey-progress").setAttribute("aria-valuenow", Math.round(state.progress * 100));
    $("journey-progress-fill").style.width = `${state.progress * 100}%`;
    $("thought").textContent = echo && state.elapsed < echoUntil ? echo : state.status === "paused" && !photoFromAlbum ? K.moment(state.routeId, state.progress)?.look || J.thought(state) : J.thought(state);
    $("feeling").textContent = J.feeling(state);
    $("walk-toggle").disabled = !["walking", "paused"].includes(state.status) || !!photoFromAlbum || !!miniController.state || !!rewardController.current;
    $("walk-toggle").textContent = state.status === "paused" ? "继续走 →" : "停下来看看";
    $("map-toggle").textContent = overview ? "跟着小人走 ↗" : "看完整路线 ↗";
    $("map-toggle").setAttribute("aria-pressed", overview);
    $("album-count").textContent = `${state.visited.length} / ${r.checkpoints.length}`;
    const p = position(), completed = r.geo.line.slice(0, p.index);
    completed.push([p.lon, p.lat, p.ele]);
    $("completed-line").setAttribute("d", cartoonLine(completed));
    for (const cp of r.checkpoints) {
      const unlocked = state.visited.includes(cp.id), b = $(`checkpoint-${cp.id}`);
      b.disabled = !unlocked;
      b.classList.toggle("collected", unlocked);
      b.setAttribute("aria-expanded", photoId === cp.id);
      b.setAttribute("aria-controls", "photo-panel");
      $(`checkpoint-hint-${cp.id}`).textContent = unlocked ? "已收集 · 再看一眼" : "沿途慢慢发现";
      $(`marker-${cp.id}`).classList.toggle("unlocked", unlocked);
      $(`marker-${cp.id}`).setAttribute("aria-disabled", !unlocked);
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
    $("overlay").hidden = state.status !== "ready";
    if (state.status === "ready") {
      const story = J.storyOf(state);
      $("overlay-title").textContent = story.openingTitle;
      $("overlay-copy").textContent = story.opening;
      $("overlay-hint").textContent = r.id === "westlake" ? "约2–3分钟 · 路边的小动静，值得停一下" : "约2–3分钟 · 自动行走 · 随时停下";
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
      $("ending-title").textContent = end.title;
      $("ending-copy").textContent = end.copy;
      $("ending-memories").replaceChildren();
      for (const m of state.memories) html("li", m, $("ending-memories"));
      journalController.renderEnding();
      html("li", `带回了${state.visited.length}张真实山野照片。`, $("ending-memories"));
    }
    syncAudio();
  }
  function apply(next) {
    const previous = state;
    state = next;
    uiKey = "";
    render();
    updatePosition(state.status === "walking" ? 0.1 : 0);
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
      return;
    }
    const previous = state;
    if (state.status === "walking") gaitClock += dt * state.pace;
    state = J.tick(state, dt);
    if (state.status === "encounter" && previous.status === "walking") {
      render();
      updatePosition(0);
      const button = state.pending.kind === "photo" ? $("photo-continue") : $("story-choices").querySelector("button");
      button?.focus({ preventScroll: true });
    } else {
      render();
      updatePosition(dt > 0 ? 1 - Math.exp(-dt * 6) : 0.1);
    }
    if (state.status === "walking") footstep();
    else if (["finished", "retreated"].includes(state.status)) $("replay").focus({ preventScroll: true });
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
    hikerFacing = 1;
    lastStrike = -1;
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
  function syncAudio() {
    const requested = !journalController.open && sound && !audioBackground && !document.hidden, mode = rewardController.current ? "reward" : miniController.state ? "moment" : photoId ? "photo" : state.status === "walking" ? "walk" : state.status === "encounter" ? "choice" : "silent";
    if (!requested) {
      if (journalController.open || audioBackground || document.hidden) audioPlayer.hide();
    } else audioPlayer.setScene({ routeId: state.routeId, checkpointId: photoId, weather: J.weather(state), progress: state.progress, mode, momentId: miniController.state?.id || rewardController.current?.id || null, momentGame: miniController.state?.game || window.TrailMiniGames?.kinds[rewardController.current?.id] || null });
    const playing = requested && audioPlayer.playing;
    $("sound-toggle").setAttribute("aria-pressed", sound);
    $("sound-toggle").textContent = soundBusy ? "声音 · 开启中" : soundError || (needsAudioResume() ? "声音 · 点此恢复" : `声音 · ${sound ? "开" : "关"}`);
    const p = window.TrailAudio.profile(photoId);
    $("photo-soundscape").hidden = !p;
    if (p) {
      $("photo-soundscape").textContent = `♪ ${p.title} · ${playing ? "正在播放" : !sound ? "声音关闭" : audioBackground || document.hidden ? "已暂停" : "点声音按钮恢复"}`;
      $("photo-soundscape").setAttribute("data-playing", playing);
    }
  }
  function footstep() {
    const strike = Math.floor(gaitClock / 0.54);
    if (!sound || strike === lastStrike) return;
    lastStrike = strike;
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
    const ok = await audioPlayer.enable();
    soundBusy = false;
    sound = ok;
    if (!ok && !soundError) soundError = audioPlayer.available ? "声音未能开启，再试一次" : "此浏览器暂无音效";
    uiKey = "";
    render();
  }
  $("choice-feedback-close").addEventListener("click", () => {
    choiceResult = null;
    uiKey = "";
    render();
  });
  $("overlay-action").addEventListener("click", () => apply(J.start(state)));
  $("walk-toggle").addEventListener("click", () => apply(state.status === "paused" ? J.resume(state) : J.pause(state)));
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
    updatePosition(0);
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
    } else if (["p", "P", "Escape"].includes(event.key) && ["walking", "paused"].includes(state.status) && !photoFromAlbum && !miniController.active) {
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
  window.addEventListener("resize", () => updatePosition(0));
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
