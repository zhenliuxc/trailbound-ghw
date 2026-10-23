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
    BEAT_SECONDS: () => BEAT_SECONDS,
    CUP: () => CUP,
    MAP_CHARACTER_FILE: () => MAP_CHARACTER_FILE,
    MAP_WALK_FILE: () => MAP_WALK_FILE,
    MOGAN_GAMES: () => MOGAN_GAMES,
    MOGAN_MEMORIES: () => MOGAN_MEMORIES,
    MOGAN_MUSIC: () => MOGAN_MUSIC,
    MOGAN_ROUTE_ASSETS: () => MOGAN_ROUTE_ASSETS,
    MOGAN_THEMES: () => MOGAN_THEMES,
    RAIN_PHRASE: () => RAIN_PHRASE,
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
    createDom: () => createDom,
    createFrameLoop: () => createFrameLoop,
    createJournalController: () => createJournalController,
    createMapCharacter: () => createMapCharacter,
    createMapGait: () => createMapGait,
    createMapHeading: () => createMapHeading,
    createMiniGameController: () => createMiniGameController,
    createMoganGames: () => createMoganGames,
    createMoganState: () => createMoganState,
    createMusicLayer: () => createMusicLayer,
    createProceduralMapCharacter: () => createProceduralMapCharacter,
    createRewardController: () => createRewardController,
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

  // .build/typescript/runtime/map-viewport.js
  var canonical = () => ({ x: 0, y: 0, w: 720, h: 600 });
  var valid = (width, height) => Number.isFinite(width) && Number.isFinite(height) && width > 0 && height > 0;
  var clamp = (n, min, max) => Math.max(min, Math.min(max, n));
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
    return { x: clamp(point.x - w / 2, minX, Math.max(minX, maxX)), y: clamp(point.y - h * (photo ? 0.24 : 0.54), minY, Math.max(minY, maxY)), w, h };
  }
  function mapSymbols(width, height, view, full) {
    const scale = valid(width, height) ? (full ? Math.min : Math.max)(width / view.w, height / view.h) : 1;
    const safeScale = Math.max(1e-3, scale), frameHeight = valid(width, height) ? height : 600;
    const markerPixels = clamp(frameHeight * 0.05, 36, 44), discoveryPixels = clamp(frameHeight * 0.075, 48, 64), hikerPixels = clamp(frameHeight * 0.08, 44, 68);
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
      x: (clamp(point.x * metrics.scale + metrics.offsetX, left, right) - metrics.offsetX) / metrics.scale,
      y: (clamp(point.y * metrics.scale + metrics.offsetY, top, bottom) - metrics.offsetY) / metrics.scale
    };
  }

  // .build/typescript/runtime/visual-route.js
  var clamp2 = (value, low, high) => Math.max(low, Math.min(high, value));
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
    const protectedProgress = /* @__PURE__ */ new Set([0, 1, ...anchors.map((value) => clamp2(value, 0, 1))]);
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
        const point = points[i], t = squaredLength ? clamp2(((point.x - a.x) * dx + (point.y - a.y) * dy) / squaredLength, 0, 1) : 0;
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
    const target = clamp2(value, 0, segment.length);
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
        return { x: clamp2(point.x + sign * direction.x * scale, Math.min(start.x, end.x), Math.max(start.x, end.x)), y: clamp2(point.y + sign * direction.y * scale, Math.min(start.y, end.y), Math.max(start.y, end.y)) };
      };
      const controlA = control(start, tangents[i - 1], 1), controlB = control(end, tangents[i], -1);
      const segment = { start, end, controlA, controlB, startDistance: length, length: 0, arc: [{ t: 0, distance: 0 }], command: command(controlA, controlB, end) };
      const steps = Math.max(6, Math.ceil(span / 3));
      let previous = start;
      for (let step = 1; step <= steps; step++) {
        const t = step / steps, point = curveAt(segment, t);
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
      const value = clamp2(progress, 0, 1);
      let low = 0, high = segments.length - 1;
      while (low < high) {
        const middle = low + high >>> 1;
        if (segments[middle].end.progress < value)
          low = middle + 1;
        else
          high = middle;
      }
      const segment = segments[low], fraction = (value - segment.start.progress) / (segment.end.progress - segment.start.progress);
      const travelled = clamp2(fraction, 0, 1) * segment.length;
      return { index: low, segment, t: tAtDistance(segment, travelled), distance: segment.startDistance + travelled };
    }
    function atDistance(value) {
      const target = clamp2(value, 0, length);
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
        return { ...point, elevation: sourceAt(source2, clamp2(progress, 0, 1)).elevation, heading: Math.atan2(tangent2.y, tangent2.x), tangentX: tangent2.x, tangentY: tangent2.y };
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

  // .build/typescript/runtime/map-labels.js
  var edge = 10;
  var gap = 6;
  var clamp3 = (value, min, max) => Math.max(min, Math.min(max, value));
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
        const x = clamp3(label2.anchor.x + offset.x, edge + label2.width / 2, layout.width - edge - label2.width / 2);
        const y = clamp3(label2.anchor.y + offset.y, edge + label2.height / 2, layout.height - edge - label2.height / 2);
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
    const p = clamp4(progress, 0, 1);
    let phase = summitPhase;
    let previous = WUGONG_PHASES[0];
    for (const candidate of WUGONG_PHASES) {
      if (p < candidate.end) {
        phase = candidate;
        break;
      }
      previous = candidate;
    }
    const blend = smoothstep(phase.start, phase.start + 0.025, p);
    const slope = previous.slope + (phase.slope - previous.slope) * blend;
    return {
      ...phase,
      slope,
      cloudReveal: smoothstep(0.46, 0.58, p),
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
    const p = clamp4(progress, 0, 1);
    let nearest = null;
    let shortest = Infinity;
    for (const stop of WUGONG_STOPS) {
      const distance3 = Math.abs(p - stop.fraction);
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
  var NS = "http://www.w3.org/2000/svg";
  var WUGONG_MAP_ASSETS = ["scenes/wugong-terrain-v1.webp", WUGONG_PROP_FILE, "scenes/wugong-cloudsea-v1.webp"];
  function createWugongScene(options) {
    const { document: document2, background, foreground } = options;
    function svg(tag, attrs4, parent) {
      const node2 = document2.createElementNS(NS, tag);
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
      if (refs.mogan || refs.tiger) {
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
    let currentEntry = null;
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
      if ((refs.mogan || refs.tiger) && refs.contentState !== "ready")
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
      refs.waitsForArt = !!(refs.art || refs.story || refs.mogan || refs.tiger || current.game === "wind");
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
      $("wind-hud").hidden = !current.game || !!refs.art || !!refs.mogan || !!refs.tiger;
      const labels = { wind: "武功山 · 借风", clouds: "武功山 · 拨云见山", altar: "武功山 · 金顶石语", greet: "武功山 · 风口相遇", creek: "九溪 · 推叶", rain: "莫干山 · 接雨" };
      $("mini-place-label").textContent = current.game && current.game in labels ? labels[current.game] : "";
      $("mini-controls").hidden = !current.game;
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
      if (record && finished.play.complete === true)
        rewardShown = options.onFinished({ state: finished, entry, outcome: api.outcome(finished, entry), returnStatus: closing.returnStatus });
      scenes.leave(closing, resume && !rewardShown);
      options.onClosed?.(finished.id, finished.play.complete === true, resume);
      options.refresh();
      if (resume && !rewardShown)
        $("walk-toggle").focus({ preventScroll: true });
    }
    function update(dt) {
      if (!interactive() || !current || !refs)
        return;
      if ((refs.mogan || refs.tiger) && refs.contentState !== "ready") {
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
        finish2(true);
    }
    function point(event) {
      const rect = surface.getBoundingClientRect();
      const p = { x: (event.clientX - rect.left) / rect.width, y: (event.clientY - rect.top) / rect.height };
      return refs && api.point ? api.point(refs, p) : refs && games ? games.point(refs, p) : p;
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
      if ((refs.mogan || refs.tiger) && refs.contentState !== "ready")
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
      bindings.listen($("micro-skip"), "click", () => finish2());
      bindings.listen(surface, "click", (event) => {
        if (event.detail > 0)
          return;
        perform({ assist: true });
      });
      bindings.listen(surface, "keydown", keydown);
      bindings.listen(surface, "keyup", (event) => {
        if (interactive() && current && (refs?.mogan || refs?.tiger) && api.key && inputReady()) {
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
          perform({ ...point(event), ...refs?.art || refs?.mogan || refs?.tiger || current.game === "clouds" ? { phase: "press" } : {} });
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
        if (refs?.art || refs?.mogan || refs?.tiger || current.game === "clouds") {
          pendingPoint = null;
          if (dragged && refs && (view.artReady(refs) || (refs.mogan || refs.tiger || current.game === "clouds") && refs.contentState === "ready"))
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
        if (refs?.mountain) {
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
          const source2 = framed || file;
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
    function tagImage(parent, file, label2, reading, moment) {
      const key = file + "|" + label2;
      const cached = reading && pictures.get(key);
      if (cached) {
        parent.appendChild(cached);
        return cached;
      }
      const badge2 = html("span", null, parent, "journal-badge-art journal-tag-art");
      badge2.setAttribute("role", "img");
      badge2.setAttribute("aria-label", label2 + " · 手绘收藏标签");
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
      let presented = false;
      image.onload = () => {
        if (!presented && options.presentArt) {
          presented = true;
          const file2 = options.presentArt(image, moment);
          if (file2) {
            image.src = file2;
            return;
          }
        }
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
        $(id).setAttribute("aria-disabled", String(!entry));
        $(id).setAttribute("aria-label", entry ? label2 + "：" + entry.title : label2 === "上一枚" ? "已是第一枚" : "已是最后一枚");
      }
      $("journal-detail-hint").textContent = entries.length === 1 ? "这一刻，值得留住" : !previous ? "从这一枚，慢慢翻看" : !next ? "已翻到最后一枚" : "左右翻看沿途回忆";
      const keep = /* @__PURE__ */ new Set();
      for (const entry of [previous, moment, next]) {
        if (!entry || !D.hasTag(entry))
          continue;
        const file = D.tagArt(entry);
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
      reload() {
        records = D.loadMoments(options.storage);
        render();
      },
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

  // .build/typescript/wugong-walk/badge-art.js
  var ROUND_BADGE_IDS = /* @__PURE__ */ new Set(["wugong-forest-leaves", "wugong-camp-stars", "wugong-homeward-pages", "tiger-28-bends-v1", "tiger-middle-river-frame-v1"]);
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
    if (options.preserveFrame) {
      ctx.fillStyle = "#e9e7d7";
      ctx.fillRect(0, 0, SIZE, SIZE);
      const ratio = image.naturalWidth / image.naturalHeight, h = 555 / Math.sqrt(1 + ratio * ratio), w = h * ratio;
      ctx.drawImage(image, 0, 0, image.naturalWidth, image.naturalHeight, CENTER - w / 2, CENTER - h / 2, w, h);
    } else
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
    const tiger = moment.route === "tiger";
    if (!ROUND_BADGE_IDS.has(moment.id) || !tiger && image.naturalWidth <= image.naturalHeight * 1.1)
      return null;
    const canvas = circularBadge(image, { preserveFrame: tiger, camp: moment.id === "wugong-camp-stars", legacyPaper: !tiger && !!moment.captureArt && moment.id !== "wugong-camp-stars" });
    return canvas?.toDataURL("image/webp", 0.88) ?? null;
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
    const index = Math.min(9, s.steps.index), p = stonePose(s, index, height), foot = stepFoot(index);
    return { x: p.x + (foot === "left" ? -1 : 1) * p.width * 0.135, y: p.y - p.width * 0.11, rx: p.width * 0.12, ry: p.width * 0.17, foot };
  }
  function stepTiming(s) {
    const length = [1.55, 1.65, 1.95, 1.55, 2.1, 1.65, 1.55, 1.9, 1.6, 2.05][Math.min(9, s.steps.index)] * (s.steps.slow ? 1.5 : 1);
    const window = s.steps.slow ? 0.62 : 0.44;
    return { length, window, open: length - window, close: length + window, progress: clamp5(s.steps.clock / length) };
  }
  function inputMogan(state, p, legacy, mode = "tap") {
    if (state.game === "sling")
      return legacy.input(state, p, mode);
    if (state.done || state.play.complete)
      return state;
    if (state.game === "footsteps" && (mode === "move" || p.phase === "press" || p.action === "outside-step"))
      return state;
    const s = clone(state), action = p.action || (p.assist ? state.game === "footsteps" && state.acted ? "step" : "begin" : "");
    s.gesture = mode === "move" ? "drag" : "tap";
    if (s.game === "rain") {
      if (!s.acted) {
        s.acted = true;
        emit(s, "begin");
        s.feedback = "竹筒跟着鼠标或指尖走，接住叶尖落下的雨滴。";
      }
      if (action === "left" || action === "right")
        s.rain.targetX = clamp5(s.rain.targetX + (action === "left" ? -0.09 : 0.09), 0.08, 0.92);
      else if (Number.isFinite(p.x))
        s.rain.targetX = clamp5(p.x, 0.08, 0.92);
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
                svg("polyline", { points: points.map((p) => p.join(",")).join(" "), fill: "none", stroke: color, "stroke-width": width, "stroke-linecap": "round", "stroke-linejoin": "round" }, pencil);
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
      const p = stonePose(s, ordinal, height);
      if (p.y > height * 1.35)
        continue;
      sprite(frame, "stone-" + ordinal, resource, p, p.width, { frame: 0, alpha: 0.56 + p.q * 0.4 });
      const landed = ordinal < step.index;
      if (landed || ordinal === target && !s.play.complete) {
        const left = stepFoot(ordinal) === "left", x = p.x + (left ? -1 : 1) * p.width * 0.135, y = p.y - p.width * 0.05;
        const ready = !s.acted || step.clock >= timing.open;
        sprite(frame, "shoe-" + ordinal, resource, { x, y }, p.width * 0.112, { frame: left ? 1 : 2, anchorY: 0.78, rotation: left ? -0.035 : 0.035, alpha: landed ? 0.76 : ready ? 0.98 : 0.42 + timing.progress * 0.16 });
        if (!landed && !step.recovery) {
          const spot = stepSpot(s, height);
          frame.hints.push(hintPose("next-footstep", { x: spot.x + (left ? -1 : 1) * spot.rx * 0.5, y: spot.y }, clamp5(p.width * 0.17, 64, 100), left ? 0 : Math.PI, ready ? 0.95 : 0.2));
        }
      }
    }
    sprite(frame, "path-branch-left", resource, { x: 0, y: height * 0.15 }, 210, { frame: 3, anchorX: 0.15, anchorY: 0.2, rotation: -0.2, alpha: 0.75, bend: s.play.reduced ? 0 : Math.sin(s.age * 0.8) * 4 });
    sprite(frame, "path-branch-right", resource, { x: 800, y: height * 0.32 }, 180, { frame: 3, anchorX: 0.15, anchorY: 0.2, rotation: 0.2, flip: true, alpha: 0.8, bend: s.play.reduced ? 0 : Math.sin(s.age * 0.9 + 1) * 4 });
    const recent = s.events.filter((e) => e.type === "step-land").at(-1), age = recent ? s.age - recent.age : 9;
    if (recent && age < 0.55 && !s.play.reduced) {
      const p = stonePose(s, recent.index ?? 0, height), x = p.x + ((recent.index ?? 0) % 2 ? 1 : -1) * p.width * 0.135;
      const y = p.y - p.width * 0.04;
      for (const side of [-1, 1])
        line(frame.effects, [{ x: x + side * 16, y: y + 9 }, { x: x + side * 25, y: y + 7 }, { x: x + side * 32, y: y + 10 }], "#e5e9d5", 2, 0.55 * (1 - age / 0.55));
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
    if (q.stage === "ready" && !q.aiming && !s.play.complete) {
      const handle = toWorld(leaf);
      frame.hints.push(hintPose("pull-paper-leaf", { x: handle.x - 16, y: handle.y + 10 }, 88, -0.55, s.play.reduced ? 0.9 : 0.82 + Math.sin(s.age * 1.5) * 0.08));
    }
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
    const background = svg("g", {}, root), ambient = svg("g", {}, root), actors = svg("g", {}, root), water = svg("g", { "clip-path": "url(#" + clipId + ")" }, root), effects = svg("g", {}, root);
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
          attrs2(node2, { points: shape.points.map((p) => p.x + "," + p.y).join(" ") });
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
        shapes(water, frame.water);
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
    const background = new P.Container(), ambient = new P.Graphics(), actors = new P.Container(), water = new P.Graphics(), mask = new P.Graphics(), effects = new P.Graphics(), paper2 = new P.Graphics();
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
      app.stage.addChild(background, ambient, actors, water, mask, effects, paper2);
      water.mask = mask;
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
          shapes2(water, frame.water);
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
      act: (s, p) => inputMogan(s, p, legacy),
      move: (s, p) => inputMogan(s, p, legacy, "move"),
      hover: (base, p) => {
        const s = base;
        return s.game === "rain" && s.acted && !s.play.complete ? releaseMogan(inputMogan(s, p, legacy, "move"), legacy) : s;
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
      point(view, p) {
        const refs = view;
        if (refs.game === "footsteps") {
          const s = refs.latest;
          if (!s || s.game !== "footsteps")
            return { ...p, action: "outside-step" };
          const spot = stepSpot(s, refs.height), padding = 22 * 800 / Math.max(1, refs.displayWidth);
          const distance3 = Math.hypot(((p.x ?? -1) * 800 - spot.x) / Math.max(spot.rx, padding), ((p.y ?? -1) * refs.height - spot.y) / Math.max(spot.ry, padding));
          return { ...p, action: distance3 <= 1 ? "step" : "outside-step" };
        }
        if (refs.game !== "sling")
          return p;
        const b = stageBounds(refs.height);
        return { ...p, x: ((p.x ?? 0) * 800 - b.x) / b.w, y: ((p.y ?? 0) * refs.height - b.y) / b.h };
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
    s.bag.poses.forEach((p, i) => {
      if (i !== index && p.cell)
        for (const c of itemCells(i, p.rotation))
          occupied.add(p.cell.x + c.x + ":" + (p.cell.y + c.y));
    });
    return itemCells(index, rotation).every((c) => {
      const x = cell.x + c.x, y = cell.y + c.y;
      return x >= 0 && y >= 0 && x < BAG.columns && y < BAG.rows && !occupied.has(x + ":" + y);
    });
  }
  function packedPiece(s, x, y) {
    const col = Math.floor(x), row = Math.floor(y);
    return s.bag.poses.findIndex((p, i) => p.cell && itemCells(i, p.rotation).some((c) => p.cell.x + c.x === col && p.cell.y + c.y === row));
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
    const count = s.bag.poses.filter((p) => p.cell).length;
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
  function inputTiger(state, p, move = false) {
    if (state.done || state.play.complete)
      return state;
    const action = p.action || "", value = p.value ?? -1;
    if (move) {
      if (state.game === "packing" && state.bag.held) {
        const s2 = clone2(state);
        if (Number.isFinite(p.x) && Number.isFinite(p.y))
          s2.bag.held.at = { x: p.x - s2.bag.held.grab.x, y: p.y - s2.bag.held.grab.y };
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
    if (p.phase === "press") {
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
        const old = s2.bag.poses[index].cell, fromBag = action === "pack-piece" && old && Number.isFinite(p.x) && Number.isFinite(p.y);
        const grab = fromBag ? { x: p.x - old.x, y: p.y - old.y } : { x: 0.5, y: 0.5 };
        s2.bag.selected = index;
        s2.bag.held = { piece: index, grab, at: { x: (p.x ?? -10) - grab.x, y: (p.y ?? -10) - grab.y } };
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
    s.gesture = p.gesture || "tap";
    if (s.game === "depth") {
      if (action === "depth-card" && value >= 0 && value < 4) {
        const from = p.dragged && s.depth.held >= 0 ? s.depth.held : s.depth.selected;
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
        if (action === "pack-cell" && (p.dragged || p.phase === "release") || action === "pack-piece" && p.dragged && Number.isFinite(p.x)) {
          place(s, held.piece, { x: Math.floor((p.x ?? -10) - held.grab.x + 0.5), y: Math.floor((p.y ?? -10) - held.grab.y + 0.5) });
        }
        s.bag.held = null;
        return s;
      }
      if (action === "select-piece" && value >= 0 && value < ITEMS.length) {
        s.bag.selected = value;
        s.feedback = ITEMS[value].name + "已选中，点内袋放下。";
      } else if (action === "pack-cell" && s.bag.selected >= 0)
        place(s, s.bag.selected, { x: Math.floor(p.x ?? s.bag.cursor.x), y: Math.floor(p.y ?? s.bag.cursor.y) });
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
        s.play.progress = s.bag.poses.filter((p2) => p2.cell).length / ITEMS.length * 0.85;
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
    const { width: w, height: h } = r, gap2 = Math.max(7, w * 9e-3), p = Math.max(12, w * 0.018);
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
    const buttonW = Math.min(145, (w - p * 2 - 10) / 2);
    chip(r, "left-view", (s.depth.seen & 1 ? "✓ " : "") + "左边观景", { x: p, y: 12, w: buttonW, h: 44 }, s.depth.view === 0, "view", 0);
    chip(r, "right-view", (s.depth.seen & 2 ? "✓ " : "") + "右边观景", { x: w - p - buttonW, y: 12, w: buttonW, h: 44 }, s.depth.view === 1, "view", 1);
    const strip = { x: 0, y: stripY - 24, w, h: cardH + 40 };
    node(r, "depth-paper", "rect", { x: strip.x, y: strip.y, width: strip.w, height: strip.h, fill: colors.paper, opacity: 0.95 });
    label(r, "depth-direction", "近处  →  远处", p, stripY - 6, 13, colors.muted);
    const cw = (w - p * 2 - gap2 * 3) / 4, cards = [];
    const crop = ["0 90 470 580", "700 300 580 420", "450 315 360 405", "290 0 690 285"];
    s.depth.order.forEach((id, i) => {
      const box = { x: p + i * (cw + gap2), y: stripY + 3, w: cw, h: cardH - 5 };
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
        const water = s.score.notes[0][s.score.beat], drop = s.score.notes[1][s.score.beat], wind = s.score.notes[2][s.score.beat];
        for (let i = 0; i < 9; i++) {
          const x = art.x + art.w * (0.3 + i * 0.041), y = art.y + art.h * (0.3 + (q + i * 0.08) % 1 * 0.4);
          node(r, "fall-line-" + i, "path", { d: "M " + x + " " + y + " q " + (wind ? 9 : 3) + " 14 0 " + (water ? 37 : 12), fill: "none", stroke: "#eef5e3", "stroke-width": drop && i % 2 ? 3 : 1.5, opacity: water || drop || wind ? 0.65 : 0 });
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
  function tigerPoint(r, p) {
    const x = (p.x ?? -1) * r.width, y = (p.y ?? -1) * r.height;
    const grid = r.layout.grid;
    if (r.game === "packing" && grid && r.latest?.game === "packing") {
      const gx = (x - grid.x) / grid.cell, gy = (y - grid.y) / grid.cell;
      if (inside(grid, x, y)) {
        const piece = packedPiece(r.latest, gx, gy);
        return { ...p, action: piece >= 0 ? "pack-piece" : "pack-cell", value: piece, x: gx, y: gy };
      }
      const hit2 = r.layout.hits.find((b) => inside(b, x, y));
      const action = hit2?.action === "pack-piece" && r.latest.bag.poses[hit2.value].cell ? "select-piece" : hit2?.action || "outside";
      return { ...p, action, value: hit2?.value, x: gx, y: gy };
    }
    const hit = r.layout.hits.find((b) => inside(b, x, y));
    return { ...p, action: hit?.action || "outside", value: hit?.value };
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
        const count = s.bag.poses.filter((p) => p.cell).length, selected = s.bag.selected;
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
      act: (s, p) => inputTiger(s, p),
      move: (s, p) => inputTiger(s, p, true),
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
      point: (refs, p) => tigerPoint(refs, p),
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

  // .build/typescript/wugong-walk/model.js
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
  var hasPoint = (p) => Number.isFinite(p.x) && Number.isFinite(p.y);
  var scenePoint = (p) => ({ x: clamp7(p.x, 0, WORLD.width), y: clamp7(p.y, 0, WORLD.height) });
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
      const steps = Math.max(1, Math.ceil(elapsed / (1 / 60)));
      for (let i = 0; i < steps; i++)
        advanceClimb(next, elapsed / steps);
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
    ...HIGH_FLOW.map((p) => ({ x: p.x - (15e-4 + (p.y - 0.65) * 0.024), y: p.y })),
    ...HIGH_FLOW.slice().reverse().map((p) => ({ x: p.x + (15e-4 + (p.y - 0.65) * 0.024), y: p.y }))
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
    ...FALL_FLOW.map((p) => ({ x: p.x - (p.y < 0.5 ? 4e-3 : 8e-3), y: p.y })),
    ...FALL_FLOW.slice().reverse().map((p) => ({ x: p.x + (p.y < 0.5 ? 5e-3 : 0.01), y: p.y }))
  ];
  var FALL_LEDGE = [{ x: 0.32, y: 0.565 }, { x: 0.46, y: 0.565 }, { x: 0.46, y: 0.605 }, { x: 0.32, y: 0.605 }];
  function waterPolygon(frame, rect) {
    return (frame.river ? RIVER_WATER : frame.passage ? FALL_WATER : HIGH_WATER).map((p) => ({ x: rect.x + p.x * rect.width, y: rect.y + p.y * rect.height }));
  }
  function waterHoles(frame, rect) {
    return (frame.river ? RIVER_ROCKS : frame.passage ? [FALL_LEDGE] : []).map((rock) => rock.map((p) => ({ x: rect.x + p.x * rect.width, y: rect.y + p.y * rect.height })));
  }
  function within(p, polygon) {
    let yes = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const a = polygon[i], b = polygon[j];
      if (a.y > p.y !== b.y > p.y && p.x < (b.x - a.x) * (p.y - a.y) / (b.y - a.y) + a.x)
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
        const p = frame.projection;
        attrs3(parent, { viewBox: "0 0 " + p.width + " " + p.height, preserveAspectRatio: "none" });
        attrs3(paper2, { height: p.height });
        attrs3(loading, { y: p.height / 2, display: resources.has("scene") ? "none" : "" });
        attrs3(world, { transform: "translate(" + p.x + " " + p.y + ") scale(" + p.scale + ")" });
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
    let background = null, water = null, original = null, hiker = null;
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
          for (const p of points.slice(1))
            context.lineTo(p.x, p.y);
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
        water.visible = activeWater;
        whitewater.visible = activeWater;
        waterMask.visible = activeWater;
        if (activeWater) {
          setWaterMask2(frame, rect);
          water.position.set(rect.x, rect.y);
          water.width = rect.width;
          water.height = rect.height;
          const buffer = water.geometry.getBuffer("aPosition"), values = buffer.data;
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
      water = new P.MeshPlane({ texture: sceneTexture, verticesX: 28, verticesY: 20 });
      original = new Float32Array(water.geometry.getBuffer("aPosition").data);
      water.alpha = 0.72;
      world.addChild(water, waterMask, whitewater, shadow);
      water.mask = waterMask;
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
    const p = project(state?.camera || { x: 500, y: 360, zoom: 1 }, refs.height);
    return { action: "viewport", viewWidth: p.width / p.scale, viewHeight: p.height / p.scale };
  }
  function tigerTrailPoint(refs, point) {
    if (!refs.latest)
      return point;
    const p = stageFrame(refs.latest, refs.height).projection;
    return {
      ...point,
      x: ((point.x ?? 0) * p.width - p.x) / p.scale,
      y: ((point.y ?? 0) * p.height - p.y) / p.scale,
      viewWidth: p.width / p.scale,
      viewHeight: p.height / p.scale,
      ...point.dx === void 0 ? {} : { dx: point.dx * p.width / p.scale },
      ...point.dy === void 0 ? {} : { dy: point.dy * p.height / p.scale }
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
  return __toCommonJS(index_exports);
})();
if (typeof module === 'object' && module.exports) module.exports = TrailRuntime;
