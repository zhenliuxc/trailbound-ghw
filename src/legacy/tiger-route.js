(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.TrailTigerRoute = api;
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  // Coordinates are WGS84 [longitude, latitude]. Mapped objects are not a
  // claim about current access, a surveyed entrance, or a photographic stance.
  const RETRIEVED_AT = '2026-10-17';
  const SOURCE = {
    track: { url: 'https://fastestknowntime.com/route/tiger-leaping-gorge-yunnan-china',
      fileUrl: 'https://fastestknowntime.com/system/files/routes/gps_data/TLG%20-%20eTrex.GPX',
      author: 'Tegyn / Wildplans', type: 'historical-gpx', retrievedAt: RETRIEVED_AT,
      note: '原文件 5134 个轨迹点；现有高路为往返记录的去程截取，端点不是核准的建筑入口。' },
    order: { url: 'https://www.thegonegoat.com/china/hiking-the-tiger-leaping-gorge-china',
      type: 'first-person-account', retrievedAt: RETRIEVED_AT },
    waterfall: { url: 'https://thehiddenchina.com/tiger-leaping-gorge-hiking-guide/',
      type: 'first-person-account', retrievedAt: RETRIEVED_AT },
    halfwayView: { url: 'https://www.xinhuanet.com/20240622/620b9e431462474a8835225edcce6355/c.html',
      type: 'on-site-report', publishedAt: '2024-06-22', retrievedAt: RETRIEVED_AT },
    riverBranch: { url: 'https://thefabryk.com/blog/tiger-leaping-gorge-hike',
      type: 'first-person-account', retrievedAt: RETRIEVED_AT,
      note: '张老师客栈入口、折返步道及可原路返回的叙述；不引用开放状态。' },
    branchAlternatives: { url: 'https://en.wikivoyage.org/w/index.php?title=Tiger_Leaping_Gorge_trek&oldid=5388695',
      type: 'community-guide', retrievedAt: RETRIEVED_AT },
    riverView: { url: 'https://www.jennyfaraway.com/tiger-leaping-gorge-yunnan/',
      type: 'first-person-photos', retrievedAt: RETRIEVED_AT }
  };
  function osm(type, id, snapshot, note) {
    return { url: 'https://www.openstreetmap.org/' + type + '/' + id,
      type: 'openstreetmap', objectType: type, objectId: id, snapshot,
      retrievedAt: RETRIEVED_AT, license: 'ODbL-1.0', note: note || '' };
  }
  const HIGH_START = {
    id: 'high-start', label: '桥头一带 · 高路起点',
    coord: [100.0519283, 27.1859388], status: 'historical-track-endpoint',
    coordinateRole: 'recorded-route-start', source: [SOURCE.track], leg: 'high'
  };
  const HIGH_END = {
    id: 'high-end', label: '中峡客栈一带 · 高路终点',
    coord: [100.157685, 27.2574499], status: 'historical-track-endpoint',
    coordinateRole: 'recorded-route-end', source: [SOURCE.track], leg: 'high'
  };
  const PLACES = {
    'high-start': HIGH_START,
    janes: { id: 'janes', label: '桥头起点附近客栈', coord: [100.0521112, 27.1840154],
      status: 'osm-mapped', coordinateRole: 'guesthouse-poi', leg: 'high',
      source: [osm('node', 2694196127, '2026-07-15T15:22:01Z', '与历史出发记录点不同，不把二者合为建筑入口。')] },
    naxi: { id: 'naxi', label: '纳西雅阁', coord: [100.0883168, 27.1854008],
      status: 'osm-mapped', coordinateRole: 'building-bounds-center', leg: 'high',
      source: [osm('way', 523168322, '2026-07-15T15:22:01Z'), SOURCE.order] },
    bends: { id: 'bends', label: '二十八道拐', coord: [100.090327, 27.186094],
      status: 'osm-mapped-section', coordinateRole: 'named-path-endpoint', leg: 'high',
      section: { endpointCoords: [[100.090327, 27.186094], [100.102111, 27.189478]],
        sourceObject: 'way/460845367', geometrySource: 'dist/geography.js#tiger.background/460845367',
        note: '28拐命名路径的两个端点；沿高路的先后由实际投影计算，不声称逐弯复原。' },
      source: [osm('way', 460845367, '2026-10-14T01:23:33.508244+00:00', '来自本地既有 OSM 背景快照，名称为28拐。'), SOURCE.order] },
    'tea-horse': { id: 'tea-horse', label: '茶马客栈', coord: [100.1112804, 27.2099128],
      status: 'osm-mapped', coordinateRole: 'building-bounds-center', leg: 'high',
      source: [osm('way', 523179408, '2026-07-15T15:22:01Z'), SOURCE.order] },
    halfway: { id: 'halfway', label: '中途客栈', coord: [100.1346063, 27.2405505],
      status: 'osm-mapped', coordinateRole: 'guesthouse-poi', leg: 'high',
      source: [osm('node', 1548360566, '2026-07-15T15:22:01Z'), SOURCE.halfwayView] },
    longdong: { id: 'longdong', label: '龙洞瀑布', coord: null,
      status: 'sequence-only', coordinateRole: null, leg: 'high',
      after: 'halfway', before: 'high-end', source: [SOURCE.waterfall],
      note: '名称及沿途顺序有现场资料；未把OSM的大瀑布或匿名瀑布擅自等同龙洞。' },
    tinas: { id: 'tinas', label: '中峡客栈', coord: [100.1565898, 27.2568165],
      status: 'osm-mapped', coordinateRole: 'guesthouse-poi', leg: 'high',
      source: [osm('node', 12738700042, '2026-07-15T15:22:01Z'), SOURCE.track] },
    'high-end': HIGH_END,
    connector: { id: 'connector', label: '前往张老师小路', coord: null,
      status: 'sequence-only', coordinateRole: null, leg: 'connector',
      source: [SOURCE.riverBranch], note: '有客栈位置及周边道路，完整接入步道尚未核准。' },
    'teacher-zhang': { id: 'teacher-zhang', label: '张老师客栈', coord: [100.1569705, 27.2543535],
      status: 'osm-mapped', coordinateRole: 'guesthouse-poi', leg: 'river',
      source: [osm('node', 4493654134, '2026-07-15T15:22:01Z'), SOURCE.riverBranch],
      note: '这是客栈POI；入口位于客栈的现场叙述不能把该POI变为已测步道口。' },
    'teacher-path': { id: 'teacher-path', label: '张老师小路', coord: null,
      status: 'sequence-only', coordinateRole: null, leg: 'river',
      source: [SOURCE.riverBranch, SOURCE.branchAlternatives] },
    riverside: { id: 'riverside', label: '中虎跳江边', coord: null,
      status: 'viewpoint-pending', coordinateRole: null, leg: 'river',
      source: [SOURCE.riverView, SOURCE.riverBranch],
      note: '玩家岸边站位待核，不能用江中虎跳石或景区中心点代替。' },
    'middle-stone': { id: 'middle-stone', label: '中虎跳石', coord: [100.163818, 27.2557114],
      status: 'osm-mapped', coordinateRole: 'scenic-reference-not-player-position', leg: 'river',
      source: [osm('node', 2969840607, '2026-07-24T11:04:51Z', 'OSM名称中虎跳石，位于小桥way293392144末端。'), SOURCE.riverView] }
  };
  function stage(id, label, placeId, leg, kind, gameId) {
    const place = PLACES[placeId];
    return { id, label, placeId, leg, kind, gameId: gameId || null,
      coord: place.coord, status: place.status, source: place.source };
  }
  const STAGES = [
    stage('high-start', '从桥头出发', 'high-start', 'high', 'start'),
    stage('naxi', '纳西雅阁', 'naxi', 'high', 'pass'),
    stage('bends', '二十八道拐 · 江在脚下', 'bends', 'high', 'climb', 'tiger-28-bends-v1'),
    stage('tea-horse', '茶马客栈', 'tea-horse', 'high', 'pass'),
    stage('halfway', '中途客栈 · 雪山前歇脚', 'halfway', 'high', 'rest', 'tiger-halfway-view-v1'),
    stage('longdong', '龙洞瀑布 · 沿崖经过', 'longdong', 'high', 'passage', 'tiger-longdong-passage-v1'),
    stage('high-end', '中峡客栈 · 高路终点', 'high-end', 'high', 'finish'),
    stage('connector', '前往张老师小路', 'connector', 'connector', 'transition'),
    stage('teacher-zhang', '张老师客栈', 'teacher-zhang', 'river', 'pass'),
    stage('teacher-path', '沿张老师小路下行', 'teacher-path', 'river', 'descent'),
    stage('riverside', '中虎跳江边 · 奔流的一刻', 'riverside', 'river', 'frame', 'tiger-middle-river-frame-v1'),
    stage('return', '沿原小路返回', 'teacher-path', 'return', 'return'),
    stage('journey-end', '回到中峡客栈一带', 'high-end', 'return', 'finish')
  ];
  const LEGS = [
    { id: 'high', label: '高路', mode: 'historical-track', start: 'high-start', end: 'high-end',
      source: [SOURCE.track], geometry: null, geometrySource: 'dist/geography.js#tiger.line' },
    { id: 'connector', label: '支线联络', mode: 'sequence-diagram', start: 'high-end', end: 'teacher-zhang',
      source: [SOURCE.riverBranch], geometry: null, distanceKm: null },
    { id: 'river', label: '中虎跳江边支线', mode: 'sequence-diagram', start: 'teacher-zhang', end: 'riverside',
      source: [SOURCE.riverBranch], geometry: null, distanceKm: null },
    { id: 'return', label: '原路返回', mode: 'sequence-diagram', start: 'riverside', end: 'high-end',
      reverseOf: ['river', 'connector'], source: [SOURCE.riverBranch], geometry: null, distanceKm: null }
  ];
  const MODE = { high: 'historical-track-with-sourced-anchors', branch: 'sequence-diagram',
    branchLabel: '江边支线 · 路线顺序示意', branchGeometryVerified: false };
  const ATTRIBUTION = { text: '© OpenStreetMap contributors',
    url: 'https://www.openstreetmap.org/copyright', license: 'ODbL-1.0' };

  const RAD = Math.PI / 180;
  const MAX_ANCHOR_OFFSET_METERS = 150;
  const valid = p => Array.isArray(p) && p.length >= 2 && Number.isFinite(p[0]) && Number.isFinite(p[1]);
  // Match TrailGame.metric's horizontal-distance model; no manually supplied fractions.
  function meters(a, b) {
    return Math.hypot((a[0] - b[0]) * Math.cos((a[1] + b[1]) * RAD / 2), a[1] - b[1]) * RAD * 6371000;
  }
  function trackLine(track) {
    const line = Array.isArray(track) ? track : track && (track.line || (track.geo && track.geo.line));
    return Array.isArray(line) && line.length >= 2 && line.every(valid) ? line : null;
  }
  function projection(point, line) {
    let total = 0, best = null;
    for (let i = 1; i < line.length; i++) {
      const a = line[i - 1], b = line[i];
      const cos = Math.cos((a[1] + b[1] + point[1]) * RAD / 3);
      const dx = (b[0] - a[0]) * cos, dy = b[1] - a[1];
      const length = meters(a, b), squared = dx * dx + dy * dy;
      const t = squared ? Math.max(0, Math.min(1, ((point[0] - a[0]) * cos * dx + (point[1] - a[1]) * dy) / squared)) : 0;
      const coord = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
      const offset = meters(point, coord);
      if (!best || offset < best.offTrackMeters) best = {
        trackCoord: coord, distance: total + length * t, offTrackMeters: offset, segmentIndex: i - 1, segmentT: t
      };
      total += length;
    }
    if (!best || total <= 0) return null;
    return Object.assign(best, { total, fraction: best.distance / total, distanceKm: best.distance / 1000 });
  }
  function anchors(track) {
    const line = trackLine(track), result = {};
    if (!line) return result;
    Object.keys(PLACES).forEach(id => {
      const p = PLACES[id];
      if (p.leg !== 'high' || !valid(p.coord)) return;
      let anchor = projection(p.coord, line);
      if (!anchor || anchor.offTrackMeters > MAX_ANCHOR_OFFSET_METERS) return;
      if (p.section) {
        const ends = p.section.endpointCoords.map(coord => projection(coord, line));
        if (ends.some(e => !e || e.offTrackMeters > MAX_ANCHOR_OFFSET_METERS)) return;
        ends.sort((a, b) => a.distance - b.distance);
        anchor = Object.assign({}, ends[0], { endDistance: ends[1].distance, endFraction: ends[1].fraction,
          endTrackCoord: ends[1].trackCoord, sectionSource: p.section.sourceObject });
      }
      result[id] = Object.assign({ placeId: id, label: p.label, coord: p.coord,
        status: p.status, source: p.source, coordinateRole: p.coordinateRole }, anchor);
    });
    return result;
  }
  function highStops(track) {
    const located = anchors(track);
    // Keep unlocated narrative stages explicit: they have anchor:null and no fraction.
    return STAGES.filter(s => s.leg === 'high').map(s => {
      const anchor = located[s.placeId] || null;
      return anchor ? Object.assign({}, s, { anchor, fraction: anchor.fraction, distance: anchor.distance,
        distanceKm: anchor.distanceKm, offTrackMeters: anchor.offTrackMeters }) : Object.assign({}, s, { anchor: null });
    });
  }
  function highSection(track, placeId) {
    const anchor = anchors(track)[placeId];
    if (!anchor || !Number.isFinite(anchor.endFraction) || anchor.endFraction <= anchor.fraction) return null;
    return { placeId, startFraction: anchor.fraction, endFraction: anchor.endFraction,
      startCoord: anchor.trackCoord, endCoord: anchor.endTrackCoord, source: anchor.sectionSource };
  }
  return { RETRIEVED_AT, SOURCE, PLACES, STAGES, LEGS, MODE, HIGH_START, HIGH_END,
    ATTRIBUTION, MAX_ANCHOR_OFFSET_METERS, anchors, highStops, highSection };
}));
