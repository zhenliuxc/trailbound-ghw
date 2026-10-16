// Generated from src/runtime/*.ts by npm run build. Edit src/, not this file.
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
    CUP: () => CUP,
    MOGAN_GAMES: () => MOGAN_GAMES,
    MOGAN_MEMORIES: () => MOGAN_MEMORIES,
    MOGAN_MUSIC: () => MOGAN_MUSIC,
    MOGAN_ROUTE_ASSETS: () => MOGAN_ROUTE_ASSETS,
    MOGAN_THEMES: () => MOGAN_THEMES,
    RAIN_PHRASE: () => RAIN_PHRASE,
    WUGONG_MUSIC: () => WUGONG_MUSIC,
    WUGONG_THEMES: () => WUGONG_THEMES,
    createDom: () => createDom,
    createFrameLoop: () => createFrameLoop,
    createJournalController: () => createJournalController,
    createMiniGameController: () => createMiniGameController,
    createMoganGames: () => createMoganGames,
    createMoganState: () => createMoganState,
    createMusicLayer: () => createMusicLayer,
    createRewardController: () => createRewardController,
    createSceneManager: () => createSceneManager,
    inputMogan: () => inputMogan,
    keyMogan: () => keyMogan,
    leafTip: () => leafTip,
    moganBounds: () => stageBounds,
    moganFrame: () => moganFrame,
    musicLevel: () => musicLevel,
    musicTrack: () => musicTrack,
    releaseMogan: () => releaseMogan,
    stepFoot: () => stepFoot,
    stepTiming: () => stepTiming,
    tickMogan: () => tickMogan
  });

  // .build/typescript/runtime/dom.js
  function createDom(document) {
    function get(id) {
      const element = document.getElementById(id);
      if (!element)
        throw new Error(`Missing game element: ${id}`);
      return element;
    }
    function html(tag, text2, parent, className) {
      const element = document.createElement(tag);
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
    return { document, get, html, text };
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
        const dt = lastTime === null ? 0 : Math.max(0, Math.min(0.25, (time - lastTime) / 1e3));
        lastTime = time;
        options.update(dt);
        if (version === generation)
          ensure();
      });
    }
    return { ensure, stop };
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
      const sling2 = s.game === "sling";
      $("art-aim").hidden = !sling2 || s.play.complete;
      if (sling2 && s.sling) {
        const angle = Math.round(s.sling.angle), power = Math.round(s.sling.power * 100);
        if ($("art-angle").value !== String(angle))
          $("art-angle").value = String(angle);
        if ($("art-power").value !== String(power))
          $("art-power").value = String(power);
        text("art-angle-value", angle + "°");
        text("art-power-value", power + "%");
        for (const id of ["art-angle", "art-power"])
          $(id).disabled = waiting || s.sling.stage !== "ready";
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
    function water(s) {
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
      if (refs.mogan) {
      } else if (s.game && games?.artAssets[s.game])
        artTools(s, refs);
      else if (s.game && games?.wugongAssets[s.game])
        wugong(s, refs);
      else if (s.game === "wind")
        wind(s, refs);
      else if (s.game)
        water(s);
      if (s.game) {
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
    let refs = null;
    let session = null;
    let pendingPoint = null;
    let pointer = null;
    let soundSerial = 0;
    let genericCompletionSound = false;
    const view = createMiniGameView({ dom, api: { ...options.api, status: (state) => api.status(state) }, platform: games, sound: options.sound });
    const surface = $("micro-surface");
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
      if (current.game) {
        if (current.game === "wind" && games)
          options.audio.wind?.(games.flow(current).energy, current.play.complete);
        for (const event of current.events || [])
          if (event.serial > soundSerial) {
            options.audio.mini?.(current.game, event.type, { x: event.x, index: event.index ?? (current.caught || current.gates) });
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
      if (refs.mogan && refs.contentState !== "ready")
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
      if (!current.game) {
        paint();
        options.audio.interact?.(current.kind, { x: current.x, icon: D.item(current.id).icon, playType: current.play.type });
      }
      updateStatus();
      options.refresh();
    }
    function begin(entry, returnStatus) {
      if (current)
        finish(false, false);
      options.stopLoop();
      session = scenes.enter("minigame", returnStatus);
      api = registered.get(entry.id) || options.api;
      current = api.create(entry, { reduced: options.reduced, weather: options.weather?.() });
      soundSerial = 0;
      genericCompletionSound = false;
      pendingPoint = null;
      view.reset();
      $("mini-retry").disabled = false;
      $("micro-art").replaceChildren();
      refs = api.draw(options.svg, $("micro-art"), entry);
      refs.waitsForArt = !!(refs.art || refs.story || refs.mogan || current.game === "wind");
      if (refs.waitsForArt)
        refs.contentState = "loading";
      surface.setAttribute("aria-busy", String(refs.waitsForArt));
      paint();
      $("wugong-tools").hidden = true;
      $("art-tools").hidden = true;
      $("mogan-tools").hidden = !refs.mogan;
      $("micro-panel").setAttribute("data-mogan", String(!!refs.mogan));
      $("micro-panel").setAttribute("data-art-game", String(!!refs.art));
      $("micro-panel").setAttribute("data-game", current.game || "");
      $("wind-hud").hidden = !current.game || !!refs.art || !!refs.mogan;
      const labels = { wind: "武功山 · 借风", clouds: "武功山 · 拨云见山", altar: "武功山 · 金顶石语", greet: "武功山 · 风口相遇", creek: "九溪 · 推叶", rain: "莫干山 · 接雨" };
      $("mini-place-label").textContent = current.game && current.game in labels ? labels[current.game] : "";
      $("mini-controls").hidden = !current.game;
      options.cache?.request(entry.artV5 || entry.artV4 || entry.badge, "high");
      text("micro-place", entry.place + " · " + entry.condition);
      text("micro-title", entry.name);
      text("micro-instruction", api.instruction(entry));
      surface.setAttribute("aria-label", (dom.get("micro-instruction").textContent || "") + (current.game === "puzzle" ? " 键盘：1–6 选片，方向键选格，Enter 放下。" : current.game === "clouds" ? " 键盘：方向键选择云朵，空格或 Enter 吹散。" : ""));
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
        games?.mount(openingRefs, options.pixi, surface, sceneAsset, actorAsset, frontAsset);
      surface.focus({ preventScroll: true });
      options.ensureLoop();
    }
    function finish(record = true, resume = true) {
      if (!current || !refs || !session)
        return;
      const finished = current, closingRefs = refs, closing = session, entry = D.item(current.id);
      pause();
      current = null;
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
      if (record && finished.play.complete === true)
        rewardShown = options.onFinished({ state: finished, entry, outcome: api.outcome(finished, entry), returnStatus: closing.returnStatus });
      scenes.leave(closing, resume && !rewardShown);
      options.refresh();
      if (resume && !rewardShown)
        $("walk-toggle").focus({ preventScroll: true });
    }
    function update(dt) {
      if (!interactive() || !current || !refs)
        return;
      if (refs.mogan && refs.contentState !== "ready") {
        updateStatus();
        paint();
        return;
      }
      if (pendingPoint) {
        current = api.move(current, pendingPoint);
        pendingPoint = null;
      }
      current = api.tick(current, dt);
      if (!current.game && current.play.complete && !genericCompletionSound) {
        genericCompletionSound = true;
        options.audio.mini?.("memory", "complete");
      }
      updateStatus();
      paint();
      if (current.done)
        finish(true);
    }
    function point(event) {
      const rect = surface.getBoundingClientRect();
      const p = { x: (event.clientX - rect.left) / rect.width, y: (event.clientY - rect.top) / rect.height };
      return refs && api.point ? api.point(refs, p) : refs && games ? games.point(refs, p) : p;
    }
    function retry() {
      if (!interactive() || !current || current.play.complete || !refs)
        return;
      const entry = D.item(current.id);
      pause();
      if (refs.waitsForArt && refs.contentState === "error") {
        const returnStatus = session?.returnStatus;
        finish(false, false);
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
      if (refs.mogan && refs.contentState !== "ready")
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
      if (current.game && event.key.toLowerCase() === "r") {
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
      bindings.listen($("micro-skip"), "click", () => finish());
      bindings.listen(surface, "click", (event) => {
        if (event.detail > 0)
          return;
        perform({ assist: true });
      });
      bindings.listen(surface, "keydown", keydown);
      bindings.listen(surface, "keyup", (event) => {
        if (interactive() && current && refs?.mogan && api.key && inputReady()) {
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
        if (current.game)
          perform({ ...point(event), ...refs?.art || refs?.mogan || current.game === "clouds" ? { phase: "press" } : {} });
      });
      bindings.listen(surface, "pointermove", (event) => {
        if (!interactive() || !pointer || pointer.id !== event.pointerId || !current)
          return;
        event.stopPropagation?.();
        if (Math.hypot(event.clientX - pointer.x, event.clientY - pointer.y) > 8)
          pointer.drag = true;
        if (!pointer.drag)
          return;
        const input = { ...point(event), gesture: "drag" };
        if (current.game) {
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
        if (refs?.art || refs?.mogan || current.game === "clouds") {
          pendingPoint = null;
          if (dragged && refs && (view.artReady(refs) || (refs.mogan || current.game === "clouds") && refs.contentState === "ready"))
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
      bindings.listen($("art-angle"), "input", (event) => action("angle", Number(event.target.value)));
      bindings.listen($("art-power"), "input", (event) => action("power", Number(event.target.value) / 100));
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
      begin,
      finish,
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
        finish(false, false);
        bindings.destroy();
        registered.clear();
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
        if (wasMini && !options.reduced)
          $("journey-stage").animate?.([{ opacity: 0.6, transform: "scale(.985)" }, { opacity: 1, transform: "scale(1)" }], { duration: 450, easing: "ease-out" });
      }
    }
    function show(moment, returnStatus) {
      if (!D.hasTag(moment))
        return false;
      if (current)
        close(false);
      current = moment;
      collecting = false;
      session = scenes.enter("reward", returnStatus);
      const game = options.gameKind(moment.id);
      $("reward-overlay").setAttribute("data-wind", String(!!game));
      $("reward-overlay").setAttribute("data-collecting", "false");
      $("reward-continue").disabled = false;
      $("reward-continue").textContent = game ? "收进手帐，继续走 →" : "收好徽章 →";
      const file = D.tagArt(moment), cached = options.cache?.request(file, "high") || null;
      const display = () => {
        if (current !== moment)
          return;
        let image = $("reward-art");
        if (cached?.state === "ready" && cached.image !== image) {
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
      $("reward-continue").focus({ preventScroll: true });
      options.audio.mini?.(game || "memory", "reveal");
      return true;
    }
    function collect() {
      if (!current || collecting)
        return;
      const game = options.gameKind(current.id);
      options.audio.mini?.(game || "memory", "collect");
      if (!game || options.reduced || !$("reward-dialog").animate) {
        close();
        return;
      }
      collecting = true;
      const moment = current;
      $("reward-continue").disabled = true;
      $("reward-overlay").setAttribute("data-collecting", "true");
      $("wind-keepsake").hidden = false;
      const box = $("reward-dialog").getBoundingClientRect(), target = $("wind-keepsake").getBoundingClientRect();
      const dx = target.left + target.width / 2 - box.left - box.width / 2, dy = target.top + target.height / 2 - box.top - box.height / 2;
      let animation;
      try {
        animation = flight = $("reward-dialog").animate([{ transform: "translate(0,0) scale(1) rotate(0)", opacity: 1 }, { transform: "translate(0,-16px) scale(1.025) rotate(-2deg)", opacity: 1, offset: 0.2 }, { transform: `translate(${dx}px,${dy}px) scale(.08) rotate(6deg)`, opacity: 0 }], { duration: 680, easing: "cubic-bezier(.55,0,.25,1)", fill: "forwards" });
      } catch {
        close();
        return;
      }
      const finish = () => {
        if (current === moment && flight === animation)
          close();
      };
      animation.finished.then(finish, finish);
    }
    bindings.listen($("reward-continue"), "click", collect);
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
          $("reward-continue").focus({ preventScroll: true });
        }
        return true;
      },
      destroy() {
        close(false);
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
    let records = D.loadMoments(options.storage);
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
    function tagImage(parent, file, label, reading = false) {
      const key = file + "|" + label;
      const cached = reading && pictures.get(key);
      if (cached) {
        parent.appendChild(cached);
        return cached;
      }
      const badge2 = html("span", null, parent, "journal-badge-art journal-tag-art");
      badge2.setAttribute("role", "img");
      badge2.setAttribute("aria-label", label + " · 手绘收藏标签");
      const status = html("span", "画作展开中", badge2, "journal-art-status");
      const image = html("img", null, badge2, "journal-tag-image");
      status.setAttribute("aria-hidden", "true");
      image.setAttribute("alt", "");
      image.setAttribute("loading", reading ? "eager" : "lazy");
      image.setAttribute("decoding", "async");
      image.style.opacity = "0";
      if (reading)
        pictures.set(key, badge2);
      const reveal = () => {
        status.hidden = true;
        image.style.opacity = "1";
      };
      image.onload = () => {
        if (reading && image.decode)
          image.decode().then(reveal, reveal);
        else
          reveal();
      };
      image.onerror = () => {
        status.textContent = "画作暂未加载";
        image.hidden = true;
        badge2.setAttribute("aria-label", label + " · 画作暂未加载，文字回忆仍可阅读");
      };
      image.setAttribute("src", file);
      return badge2;
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
      const file = D.tagArt(moment);
      if (file)
        return tagImage(parent, file, moment.tag || moment.title, reading);
      const entryIndex = Math.max(0, D.CATALOG.findIndex((entry) => entry.id === moment.id));
      const i = entryIndex % 9;
      const node = html("span", null, parent, "journal-badge-art");
      node.setAttribute("role", "img");
      node.setAttribute("aria-label", moment.title + "的山野徽章");
      node.style.backgroundImage = `url('badges/${["moments-v1", "moments-expansion-v1", "moments-westlake-v2"][Math.floor(entryIndex / 9)]}.webp')`;
      node.style.backgroundPosition = `${i % 3 * 50}% ${Math.floor(i / 3) * 50}%`;
      return node;
    }
    function render(append = false) {
      const list = $("journal-list");
      const book = data.page(records, route, pageSize);
      $("journal-count").textContent = `${book.totalAll}个瞬间`;
      $("trip-count").textContent = `本次记下${options.tripCount()}个瞬间`;
      const routeName = options.routes.find((r) => r.id === route)?.name || "全部路线";
      $("journal-filter-count").textContent = book.total ? `${routeName} · ${book.total}段回忆${book.remaining ? `，已展示${book.entries.length}段` : ""}` : `${routeName} · 等待新的回忆`;
      $("journal-more").hidden = book.remaining === 0;
      $("journal-more").textContent = `再翻${Math.min(data.PAGE_SIZE, book.remaining)}段回忆 ↓`;
      const offset = append ? list.children.length : 0;
      if (!append)
        list.replaceChildren();
      if (!book.total) {
        const empty = html("li", null, list, "journal-empty");
        html("strong", "这一页，留给下一次相遇", empty);
        html("p", "一阵风、一片落叶，或一段安静的水声。沿途收下的手绘和回忆，会一起留在这里。", empty);
        return;
      }
      for (const moment of book.entries.slice(offset)) {
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
      const copy = html("div", null, page, "journal-copy");
      html("p", moment.place, copy, "journal-location");
      html("h3", moment.title, copy, "journal-entry-title").id = "journal-detail-title";
      html("p", moment.memory, copy, "journal-memory");
      const meta = html("div", null, copy, "journal-entry-meta");
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
        const detail = html("details", null, copy, "journal-place-note");
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
      for (const [id, entry, label] of controls) {
        $(id).setAttribute("aria-disabled", String(!entry));
        $(id).setAttribute("aria-label", entry ? label + "：" + entry.title : label === "上一枚" ? "已是第一枚" : "已是最后一枚");
      }
      $("journal-detail-hint").textContent = entries.length === 1 ? "这一刻，值得留住" : !previous ? "从这一枚，慢慢翻看" : !next ? "已翻到最后一枚" : "左右翻看沿途回忆";
      const keep = /* @__PURE__ */ new Set();
      for (const entry of [previous, moment, next]) {
        if (!entry || !D.hasTag(entry))
          continue;
        const file = D.tagArt(entry);
        if (!file)
          continue;
        const label = entry.tag || entry.title, key = file + "|" + label;
        keep.add(key);
        if (!pictures.has(key))
          tagImage(html("div"), file, label, true);
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
      if (!D.hasTag(moment))
        return;
      tripMoments.push(moment);
      const result = data.remember(records, moment);
      if (result.status === "full")
        $("journal-storage").textContent = "手帐已满，原回忆已保留。这个新片刻仍可在本次旅程结尾查看。";
      else if (result.status !== "unchanged") {
        records = result.moments;
        $("journal-storage").textContent = D.saveMoments(options.storage, records) ? "回忆自动保存在这个浏览器，相同的片刻只留一页。" : "这个浏览器无法保存手帐，本次打开页面期间仍可以记下瞬间。";
      }
      const message = result.status === "unchanged" ? "再次遇见，手帐中已留存" : result.status === "upgraded" ? "手帐已补上手绘" : "刚刚收下标签";
      $("discovery-status").textContent = `${message}「${moment.title}」 · ${moment.place}`;
      render();
      options.onRemember(moment);
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
      for (const r of options.routes)
        html("option", r.name, $("journal-route")).setAttribute("value", r.id);
      bindings.listen($("journal-route"), "change", () => {
        const selected = $("journal-route").value;
        route = options.routes.find((r) => r.id === selected)?.id || "all";
        pageSize = data.PAGE_SIZE;
        render();
      });
      bindings.listen($("journal-more"), "click", () => {
        const previous = $("journal-list").children.length;
        pageSize += data.PAGE_SIZE;
        render(true);
        $("journal-list").children[previous]?.querySelector("button")?.focus();
      });
    }
    bind();
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
      resetTrip() {
        tripMoments = [];
      },
      recent(routeId) {
        return records.filter((moment) => moment.route === routeId).slice(-3).map((moment) => moment.id);
      },
      destroy() {
        close(false);
        bindings.destroy();
      }
    };
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

  // .build/typescript/runtime/mogan/rules.js
  var MOGAN_GAMES = Object.freeze({ "bamboo-drop": "rain", "bamboo-step": "footsteps", "bamboo-leaf": "sling" });
  var CUP = Object.freeze({ width: 132, anchorY: 0.184, mouthY: 0.73, mouthRadius: 38 * 1.32, waterRadius: 34 * 1.32, waterDepth: 14 * 1.32 });
  var RAIN_PHRASE = Object.freeze([0, 3, 1, 4, 2, 5, 3, 1]);
  var RAIN_NOTES = Object.freeze([60, 64, 67, 64, 62, 65, 64, 60]);
  var MOGAN_TITLES = { rain: "听一筒竹林的雨", footsteps: "沿着石阶慢慢走", sling: "给远山送一枚纸叶" };
  var MOGAN_PROMPTS = {
    rain: "看叶尖蓄水，左右移动竹筒，把落雨接成一段旋律。",
    footsteps: "脚印合上时，点亮起的那只脚，走完这段石阶。",
    sling: "向后拉开纸叶，松手送过竹隙，落在远山纸签上。"
  };
  var MOGAN_MEMORIES = {
    rain: "叶尖先亮起一颗水珠。我挪过竹筒，接住一声又一声轻响；最后一滴落下，竹林里留下了一小段雨的旋律。",
    footsteps: "我跟着石阶的长短，左脚、右脚，慢慢走过雨后的古道。苔色留在石边，十次轻轻的落脚，把山路接成了自己的节奏。",
    sling: "我把一枚纸叶放上竹弓，试着借一小段风。纸叶穿过竹隙，轻轻停在远山纸签上；林子里的那扇窗，也亮了起来。"
  };
  var clamp = (n, a = 0, b = 1) => Math.max(a, Math.min(b, Number.isFinite(n) ? n : a));
  var ease = (n) => {
    const t = clamp(n);
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
  function stepTiming(s) {
    const length = [1.55, 1.65, 1.95, 1.55, 2.1, 1.65, 1.55, 1.9, 1.6, 2.05][Math.min(9, s.steps.index)] * (s.steps.slow ? 1.5 : 1);
    const window = s.steps.slow ? 0.62 : 0.44;
    return { length, window, open: length - window, close: length + window, progress: clamp(s.steps.clock / length) };
  }
  function inputMogan(state, p, legacy, mode = "tap") {
    if (state.game === "sling")
      return legacy.input(state, p, mode);
    if (state.done || state.play.complete)
      return state;
    if (state.game === "footsteps" && (mode === "move" || p.phase === "press") && !p.action)
      return state;
    const s = clone(state), action = p.action || (p.assist ? "begin" : "");
    s.gesture = mode === "move" ? "drag" : "tap";
    if (s.game === "rain") {
      if (!s.acted) {
        s.acted = true;
        emit(s, "begin");
        s.feedback = "先看叶尖的水珠，竹筒跟着你的指尖走。";
      }
      if (action === "left" || action === "right")
        s.rain.targetX = clamp(s.rain.targetX + (action === "left" ? -0.09 : 0.09), 0.08, 0.92);
      else if (Number.isFinite(p.x))
        s.rain.targetX = clamp(p.x, 0.08, 0.92);
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
      s.feedback = "先迈左脚。等描边合上，再轻轻落脚。";
      return s;
    }
    const foot = action === "left" || action === "right" ? action : !action && Number.isFinite(p.x) && (p.y ?? 0) >= 0.45 ? p.x < 0.5 ? "left" : "right" : null;
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
      s.feedback = (stepFoot(s.steps.index) === "left" ? "左脚" : "右脚") + "接着来，慢慢走就好。";
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
      return inputMogan(s, { action: "begin" }, legacy);
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

  // .build/typescript/runtime/mogan/scene-model.js
  var stageBounds = (height) => {
    const side = Math.min(800, height * 0.98);
    return { x: (800 - side) / 2, y: (height - side) / 2, w: side, h: side };
  };
  function stonePose(s, ordinal, height) {
    const moving = s.play.reduced ? 0 : 1 - ease((s.age - s.steps.landedAt) / 0.48);
    const relative = ordinal - s.steps.index + moving, q = clamp(1 - relative / 6, 0, 1.24);
    return { x: 400 + Math.sin(ordinal * 0.73) * 24 * q, y: height * (0.18 + 0.67 * Math.pow(q, 1.7)), width: 100 + 555 * Math.pow(q, 1.6), q };
  }
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
    const next = leafTip(RAIN_PHRASE[Math.min(7, r.caught)], s.age, !!s.play.reduced), growing = clamp(1 - r.nextIn / 0.85);
    if (!r.drop && !s.play.complete) {
      ellipse(frame.effects, next.x * 800, next.y * height + 2, 2.3 + growing * 3.3, 3.5 + growing * 5, "#d0e5d8", 0.92);
      ellipse(frame.effects, next.x * 800 - 1, next.y * height, 1.1, 2, "#fffcee", 0.95);
      if (s.acted)
        ellipse(frame.ambient, next.x * 800, y + 3, 12, 3.4, "#f7edcd", 0.22);
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
      const p = stonePose(s, ordinal, height);
      if (p.y > height * 1.35)
        continue;
      sprite(frame, "stone-" + ordinal, resource, p, p.width, { frame: 0, alpha: 0.56 + p.q * 0.4 });
      const landed = ordinal < step.index;
      if (landed || ordinal === target && !s.play.complete) {
        const left = stepFoot(ordinal) === "left", x = p.x + (left ? -1 : 1) * p.width * 0.135, y = p.y - p.width * 0.05;
        sprite(frame, "shoe-" + ordinal, resource, { x, y }, p.width * 0.112, { frame: left ? 1 : 2, anchorY: 0.78, rotation: left ? -0.035 : 0.035, alpha: landed ? 0.76 : 0.25 + timing.progress * 0.52 });
        if (!landed && s.acted && !step.recovery) {
          const ready = step.clock >= timing.open, size = p.width * 0.105 * (s.play.reduced ? 1 : 1.9 - timing.progress * 0.9);
          ellipse(frame.effects, x, y - p.width * 0.06, size, size * 1.5, ready ? "#f4d99a" : "#f2edce", ready ? 0.82 : 0.52, ready ? 2.5 : 1.5);
        }
      }
    }
    sprite(frame, "path-branch-left", resource, { x: 0, y: height * 0.15 }, 210, { frame: 3, anchorX: 0.15, anchorY: 0.2, rotation: -0.2, alpha: 0.75, bend: s.play.reduced ? 0 : Math.sin(s.age * 0.8) * 4 });
    sprite(frame, "path-branch-right", resource, { x: 800, y: height * 0.32 }, 180, { frame: 3, anchorX: 0.15, anchorY: 0.2, rotation: 0.2, flip: true, alpha: 0.8, bend: s.play.reduced ? 0 : Math.sin(s.age * 0.9 + 1) * 4 });
    const recent = s.events.filter((e) => e.type === "step-land").at(-1), age = recent ? s.age - recent.age : 9;
    if (recent && age < 0.55 && !s.play.reduced) {
      const p = stonePose(s, recent.index ?? 0, height), x = p.x + ((recent.index ?? 0) % 2 ? 1 : -1) * p.width * 0.135;
      ellipse(frame.effects, x, p.y - p.width * 0.04, 12 + age * 52, 5 + age * 14, "#f7edcd", 0.52 * (1 - age / 0.55), 1.2);
    }
  }
  function sling(frame, s, height, legacy) {
    const b = stageBounds(height), toWorld = (p) => ({ x: b.x + p.x * b.w, y: b.y + p.y * b.h }), q = s.sling;
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
    line(frame.effects, ends.map((p) => ({ x: p.x, y: p.y - 1 })), "#e8dab4", 0.85, 0.83);
    const leaf = q.shot || legacy.aimPouch(s), angle = q.shot ? Math.atan2(q.shot.vy, q.shot.vx || 1e-3) * 0.3 : -0.25;
    sprite(frame, "paper-leaf", "actor", toWorld(leaf), 0.057 * b.w, { frame: 5, rotation: angle + (s.play.reduced ? 0 : q.stage === "flight" ? Math.sin(s.age * 8) * 0.06 : 0) });
    if (q.stage === "ready" && !s.play.complete)
      for (const [i, p] of legacy.preview(s, 18).entries()) {
        const world = toWorld(p);
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
    const frame = { sprites: [], ambient: [], water: [], effects: [], clip: null, alpha: s.play.reduced ? 1 : 0.5 + 0.5 * ease(s.age / 0.65), paper: s.play.complete ? s.play.reduced ? 1 : ease((elapsed - 0.65) / 1.2) : 0 };
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
  var MOGAN_ROUTE_ASSETS = [MOGAN_BACKGROUND, "sprites/bamboo-cup-v2.webp", MOGAN_PROPS.file, SHARED_PROPS.file];
  function moganAssets(game) {
    return { scene: MOGAN_BACKGROUND, actor: game === "rain" ? "sprites/bamboo-cup-v2.webp" : game === "footsteps" ? MOGAN_PROPS.file : SHARED_PROPS.file, ...game === "footsteps" ? {} : { front: MOGAN_PROPS.file } };
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
  var attrs = (node, values) => {
    for (const [name, value] of Object.entries(values))
      if (node.getAttribute(name) !== String(value))
        node.setAttribute(name, String(value));
  };
  var sequence = 0;
  function fallback(svg, parent, game) {
    const root = svg("g", {}, parent), defs = svg("defs", {}, root), clipId = "mogan-water-" + ++sequence;
    const clip = svg("clipPath", { id: clipId }, defs), clipEllipse = svg("ellipse", {}, clip);
    const background = svg("g", {}, root), ambient = svg("g", {}, root), actors = svg("g", {}, root), water = svg("g", { "clip-path": "url(#" + clipId + ")" }, root), effects = svg("g", {}, root);
    const paper = svg("rect", { x: 0, y: 0, width: 800, height: 800, fill: "#fff8e6", opacity: 0 }, root);
    const nodes = /* @__PURE__ */ new Map(), pools = /* @__PURE__ */ new Map();
    let lastOrder = "";
    function shapes(layer, items) {
      const pool = pools.get(layer) || [];
      pools.set(layer, pool);
      items.forEach((shape, i) => {
        const tag = shape.type === "line" ? "polyline" : shape.type;
        let node = pool[i];
        if (node?.tagName.toLowerCase() !== tag) {
          const next = svg(tag, {}, layer);
          node?.remove();
          pool[i] = node = next;
        }
        if (!node)
          pool[i] = node = svg(tag, {}, layer);
        attrs(node, { opacity: Math.max(0, Math.min(1, shape.alpha)), fill: shape.stroke ? "none" : shape.color, stroke: shape.stroke ? shape.color : "none", "stroke-width": shape.stroke || 0, "stroke-linecap": "round", "stroke-linejoin": "round", display: "" });
        if (shape.type === "ellipse")
          attrs(node, { cx: shape.x, cy: shape.y, rx: Math.max(0, shape.rx), ry: Math.max(0, shape.ry) });
        else if (shape.type === "rect")
          attrs(node, { x: shape.x, y: shape.y, width: shape.w, height: shape.h });
        else
          attrs(node, { points: shape.points.map((p) => p.x + "," + p.y).join(" ") });
      });
      for (let i = items.length; i < pool.length; i++)
        attrs(pool[i], { display: "none" });
    }
    return {
      paint(frame, height) {
        parent.setAttribute("viewBox", "0 0 800 " + height);
        attrs(root, { opacity: frame.alpha });
        for (const node of nodes.values())
          attrs(node, { display: "none" });
        for (const pose of frame.sprites) {
          const spec = source(game, pose.resource), box = region(game, pose);
          let node = nodes.get(pose.key);
          if (!node) {
            node = svg("svg", { overflow: "hidden", preserveAspectRatio: "none", viewBox: [box.x, box.y, box.w, box.h].join(" ") }, pose.key === "background" ? background : actors);
            svg("image", { href: spec.file, width: spec.width, height: spec.height }, node);
            nodes.set(pose.key, node);
          }
          const height2 = pose.width * box.h / box.w;
          attrs(node, { x: -pose.anchorX * pose.width, y: -pose.anchorY * height2, width: pose.width, height: height2, display: "", opacity: Math.min(1, pose.alpha), transform: "translate(" + pose.x + " " + pose.y + ") rotate(" + pose.rotation * 180 / Math.PI + ") scale(" + (pose.flip ? -1 : 1) + " 1)" });
        }
        const order = frame.sprites.filter((pose) => pose.key !== "background").map((pose) => pose.key).join("|");
        if (order !== lastOrder) {
          for (const pose of frame.sprites)
            if (pose.key !== "background")
              actors.appendChild(nodes.get(pose.key));
          lastOrder = order;
        }
        shapes(ambient, frame.ambient);
        shapes(water, frame.water);
        shapes(effects, frame.effects);
        if (frame.clip)
          attrs(clipEllipse, { cx: frame.clip.x, cy: frame.clip.y, rx: frame.clip.rx, ry: frame.clip.ry });
        attrs(paper, { height, opacity: frame.paper * 0.26 });
      },
      dispose() {
        root.remove();
        nodes.clear();
        pools.clear();
      }
    };
  }
  async function renderer(P, host, game, resources, height, displayWidth, cancelled, onLost) {
    const app = new P.Application();
    const resolution = (width) => Math.min(2, Math.max(0.5, width / 800 * Math.min(2, globalThis.devicePixelRatio || 1)));
    let disposed = false;
    const textures = /* @__PURE__ */ new Map(), crops = /* @__PURE__ */ new Map(), nodes = /* @__PURE__ */ new Map();
    let lastOrder = "";
    const background = new P.Container(), ambient = new P.Graphics(), actors = new P.Container(), water = new P.Graphics(), mask = new P.Graphics(), effects = new P.Graphics(), paper = new P.Graphics();
    function dispose() {
      if (disposed)
        return;
      disposed = true;
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
            for (const p of shape.points.slice(1))
              graphic.lineTo(p.x, p.y);
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
      app.stage.addChild(background, ambient, actors, water, mask, effects, paper);
      water.mask = mask;
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
              const node2 = pose.frame === 3 ? new P.MeshPlane({ texture, verticesX: 7, verticesY: 5 }) : new P.Sprite(texture);
              record = { node: node2, texture, ...node2 instanceof P.MeshPlane ? { original: new Float32Array(node2.geometry.getBuffer("aPosition").data) } : {} };
              (pose.key === "background" ? background : actors).addChild(node2);
              nodes.set(pose.key, record);
            }
            const node = record.node;
            node.visible = true;
            node.position.set(pose.x, pose.y);
            node.pivot.set(box.w * pose.anchorX, box.h * pose.anchorY);
            node.scale.set(pose.width / box.w * (pose.flip ? -1 : 1), pose.width / box.w);
            node.rotation = pose.rotation;
            node.alpha = Math.min(1, pose.alpha);
            if (record.original && node instanceof P.MeshPlane) {
              const buffer = node.geometry.getBuffer("aPosition"), values = buffer.data;
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
          shapes2(water, frame.water);
          shapes2(effects, frame.effects);
          mask.clear();
          if (frame.clip)
            mask.ellipse(frame.clip.x, frame.clip.y, frame.clip.rx, frame.clip.ry).fill(16777215);
          paper.clear();
          if (frame.paper)
            paper.rect(0, 0, 800, height2).fill({ color: 16775398, alpha: frame.paper * 0.26 });
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
      refs.gpu = await renderer(P, host, refs.game, resources, refs.height, refs.displayWidth, () => !!refs.disposed, () => {
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
    let precision = false;
    function present(base, view) {
      const s = base, refs = view;
      const waiting = refs.contentState !== "ready", complete2 = s.play.complete;
      $("mogan-tools").hidden = false;
      $("micro-panel").setAttribute("data-phase", waiting ? "loading" : complete2 ? "memory" : !s.acted ? "invite" : "play");
      text("micro-title", MOGAN_TITLES[s.game]);
      text("mogan-kicker", "莫干山 · " + chapterNames[s.game]);
      const count = s.game === "rain" ? s.rain.caught + " / 8 声" : s.game === "footsteps" ? s.steps.index + " / 10 级" : complete2 ? "纸叶已送到" : "穿过竹隙，送给远山";
      text("mogan-count", count);
      const status = waiting ? refs.contentState === "error" ? "画作暂时没有展开，点「重新试一次」可重新加载。" : "竹林画作正在展开，准备好就能出发。" : s.feedback;
      text("mogan-cue", status);
      text("micro-result", status);
      $("micro-surface").setAttribute("aria-busy", String(refs.contentState === "loading"));
      $("micro-surface").setAttribute("aria-label", MOGAN_PROMPTS[s.game] + (s.game === "rain" ? " 键盘左右方向键或 A、D 移动，Enter 开始，R 重试。" : s.game === "footsteps" ? " A 或左方向键迈左脚，D 或右方向键迈右脚，Enter 开始，R 重试。" : " 方向键调整，空格蓄力、松开发射，Enter 发射，R 重试。"));
      $("mogan-rain-controls").hidden = s.game !== "rain" || !s.acted || complete2;
      $("mogan-step-controls").hidden = s.game !== "footsteps" || !s.acted || complete2;
      $("mogan-slow").hidden = s.game !== "footsteps" || complete2;
      $("mogan-tune").hidden = s.game !== "sling" || complete2;
      $("mogan-aim").hidden = s.game !== "sling" || !precision || complete2;
      $("mogan-notes").hidden = s.game !== "rain";
      const start = $("mogan-start");
      start.hidden = complete2 || s.game !== "sling" && s.acted;
      start.disabled = waiting || s.game === "sling" && s.sling.stage !== "ready";
      text("mogan-start", waiting ? "准备画作…" : s.game === "rain" ? "开始听雨 →" : s.game === "footsteps" ? "走上石阶 →" : s.sling.stage === "flight" ? "纸叶在风里…" : s.sling.stage === "miss" ? "等纸叶轻轻落下" : "送出纸叶 →");
      start.setAttribute("data-action", s.game === "sling" ? "fire" : "begin");
      for (const id of ["mogan-rain-left", "mogan-rain-right", "mogan-foot-left", "mogan-foot-right", "mogan-slow", "mogan-tune"])
        $(id).disabled = waiting || complete2;
      if (s.game === "rain") {
        for (const [i, note] of [...$("mogan-notes").children].entries()) {
          note.setAttribute("data-earned", String(i < s.rain.caught));
          note.setAttribute("data-next", String(i === s.rain.caught));
        }
      } else if (s.game === "footsteps") {
        const next = stepFoot(s.steps.index), timing = stepTiming(s), open = s.steps.clock >= timing.open && !s.steps.recovery;
        for (const foot of ["left", "right"]) {
          $("mogan-foot-" + foot).setAttribute("data-next", String(next === foot));
          $("mogan-foot-" + foot).setAttribute("data-ready", String(next === foot && open));
        }
        $("mogan-slow").setAttribute("aria-pressed", String(s.steps.slow));
        text("mogan-slow", s.steps.slow ? "恢复步速" : "慢一点");
      } else {
        $("mogan-tune").setAttribute("aria-expanded", String(precision));
        text("mogan-tune", precision ? "收起微调 ↑" : "调整角度与力度 ↓");
        for (const [id, value, label] of [["mogan-angle", Math.round(s.sling.angle), "°"], ["mogan-power", Math.round(s.sling.power * 100), "%"]]) {
          const input = $(id);
          if (input.value !== String(value))
            input.value = String(value);
          input.disabled = waiting || s.sling.stage !== "ready";
          text(id + "-value", value + label);
        }
      }
      text("mogan-key-hint", s.game === "rain" ? "← → / A D 移动竹筒" : s.game === "footsteps" ? "A / ← 左脚 · D / → 右脚" : "方向键调整 · 空格蓄力，松开发射");
    }
    const adapter = {
      create(entry, options) {
        precision = false;
        return createMoganState(entry, options.reduced, legacy, options.weather);
      },
      act: (s, p) => inputMogan(s, p, legacy),
      move: (s, p) => inputMogan(s, p, legacy, "move"),
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
      point(refs, p) {
        if (refs.game !== "sling")
          return p;
        const height = refs.height, b = stageBounds(height);
        return { ...p, x: ((p.x ?? 0) * 800 - b.x) / b.w, y: ((p.y ?? 0) * height - b.y) / b.h };
      },
      present,
      key: (s, key, phase) => keyMogan(s, key, phase, legacy)
    };
    for (const [id, action] of [["mogan-start", "begin"], ["mogan-rain-left", "left"], ["mogan-rain-right", "right"], ["mogan-foot-left", "left"], ["mogan-foot-right", "right"], ["mogan-slow", "slow"]]) {
      bindings.listen($(id), "click", () => onAction(id === "mogan-start" ? $("mogan-start").getAttribute("data-action") || action : action));
    }
    bindings.listen($("mogan-tune"), "click", () => {
      precision = !precision;
      $("mogan-aim").hidden = !precision;
      $("mogan-tune").setAttribute("aria-expanded", String(precision));
      text("mogan-tune", precision ? "收起微调 ↑" : "调整角度与力度 ↓");
    });
    bindings.listen($("mogan-angle"), "input", (event) => onAction("angle", Number(event.target.value)));
    bindings.listen($("mogan-power"), "input", (event) => onAction("power", Number(event.target.value) / 100));
    return { adapter, destroy: () => bindings.destroy() };
  }
  return __toCommonJS(index_exports);
})();
if (typeof module === 'object' && module.exports) module.exports = TrailRuntime;
