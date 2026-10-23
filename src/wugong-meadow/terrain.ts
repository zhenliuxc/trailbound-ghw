import * as THREE from 'three';
import { SimplexNoise } from 'three/addons/math/SimplexNoise.js';
import { createLandscape, createTrail, type TerrainData, type VisitId } from '../wugong-walk/model';

const SCALE = 110;
const VERTICAL = 29;
const clamp = THREE.MathUtils.clamp;
const smooth = (a: number, b: number, value: number) => THREE.MathUtils.smoothstep(value, a, b);
const seed = (value: number) => {
  let state = value;
  return () => { state = Math.imul(state ^ (state >>> 15), 1 | state); state ^= state + Math.imul(state ^ (state >>> 7), 61 | state); return ((state ^ (state >>> 14)) >>> 0) / 4294967296; };
};
export interface Bounds { minX: number; maxX: number; minZ: number; maxZ: number }

export type RouteStopId = 'start' | VisitId;
export type RouteStage = 'forest' | 'meadow' | 'camp' | 'ridge' | 'summit' | 'descent' | 'end';
export interface RouteStop { id: RouteStopId; distance: number; point: THREE.Vector3; title: string }
const titles: Record<RouteStopId, string> = { start: '东江村', slope: '绝望坡', meadow: '高山草甸', camp: '观音宕 · 星空营地', horse: '吊马桩', summit: '金顶', end: '景区大门' };

export function createWugongTerrain(data: TerrainData) {
  const landscape = createLandscape(data), trail = createTrail(landscape);
  const noise = new SimplexNoise({ random: seed(270533) });
  const baseHeight = (x: number, z: number) => {
    const edgeX = clamp(x, -1.72 * SCALE, 1.72 * SCALE), edgeZ = clamp(z, data.zMin * SCALE, data.zMax * SCALE);
    const outside = Math.hypot(x - edgeX, z - edgeZ);
    const terrain = (landscape.height(edgeX / SCALE, edgeZ / SCALE) - .9) * VERTICAL;
    return terrain - outside * .18 + noise.noise(x * .023, z * .023) * 9 * smooth(0, 35, outside);
  };
  const pads = [
    { point: trail.sampleWorld(0), dx: 4, dz: 1, inner: 6, outer: 14 },
    { point: trail.sampleWorld(trail.campTravel), dx: 4, dz: -1, inner: 7, outer: 15 },
    { point: trail.sampleWorld(trail.summitTravel), dx: 0, dz: 0, inner: 2, outer: 5 },
    { point: trail.sampleWorld(trail.length), dx: 3, dz: 0, inner: 7, outer: 14 },
  ].map(pad => ({ ...pad, x: pad.point.x * SCALE + pad.dx, z: pad.point.z * SCALE + pad.dz, y: baseHeight(pad.point.x * SCALE, pad.point.z * SCALE) }));
  const rawHeight = (x: number, z: number) => {
    let value = baseHeight(x, z);
    for (const pad of pads) value = THREE.MathUtils.lerp(value, pad.y, 1 - smooth(pad.inner, pad.outer, Math.hypot(x - pad.x, z - pad.z)));
    return value;
  };
  const cell = .6;
  const heightCache = new Map<string, number>();
  function corner(i: number, j: number): number {
    const key = `${i}:${j}`, cached = heightCache.get(key);
    if (cached !== undefined) return cached;
    const value = rawHeight(i * cell, j * cell); heightCache.set(key, value); return value;
  }
  // This is the same triangle interpolation as the visible near-ground grid.
  // Feet, dirt and grass all use it, so none rests on a different approximation.
  function height(x: number, z: number): number {
    const i = Math.floor(x / cell), j = Math.floor(z / cell), x0 = i * cell, z0 = j * cell;
    const u = (x - x0) / cell, v = (z - z0) / cell;
    const a = corner(i, j), b = corner(i + 1, j), c = corner(i, j + 1), d = corner(i + 1, j + 1);
    return u + v <= 1 ? a + (b - a) * u + (c - a) * v : d + (c - d) * (1 - u) + (b - d) * (1 - v);
  }
  const points: THREE.Vector3[] = [];
  const lengths = [0];
  const divisions = Math.max(2600, Math.ceil(trail.length * 1.4));
  for (let i = 0; i <= divisions; i++) {
    const p = trail.sampleWorld(trail.length * i / divisions);
    const point = new THREE.Vector3(p.x * SCALE, height(p.x * SCALE, p.z * SCALE), p.z * SCALE);
    if (points.length) lengths.push(lengths[lengths.length - 1] + points[points.length - 1].distanceTo(point));
    points.push(point);
  }
  const length = lengths[lengths.length - 1];
  const bounds: Bounds = {
    minX: Math.floor((Math.min(...points.map(p => p.x)) - 25) / cell) * cell,
    maxX: Math.ceil((Math.max(...points.map(p => p.x)) + 25) / cell) * cell,
    minZ: Math.floor((Math.min(...points.map(p => p.z)) - 26) / cell) * cell,
    maxZ: Math.ceil((Math.max(...points.map(p => p.z)) + 25) / cell) * cell,
  };
  function sample(distance: number, target = new THREE.Vector3()): THREE.Vector3 {
    const d = clamp(distance, 0, length);
    let low = 0, high = points.length - 1;
    while (low + 1 < high) { const mid = (low + high) >> 1; if (lengths[mid] < d) low = mid; else high = mid; }
    const t = (d - lengths[low]) / Math.max(.0001, lengths[high] - lengths[low]);
    target.lerpVectors(points[low], points[high], t);
    target.y = height(target.x, target.z);
    return target;
  }
  const segments = new Map<string, number[]>();
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1], b = points[i];
    for (let x = Math.floor((Math.min(a.x, b.x) - 3) / 8); x <= Math.floor((Math.max(a.x, b.x) + 3) / 8); x++) {
      for (let z = Math.floor((Math.min(a.z, b.z) - 3) / 8); z <= Math.floor((Math.max(a.z, b.z) + 3) / 8); z++) {
        const key = `${x}:${z}`, bucket = segments.get(key);
        if (bucket) bucket.push(i); else segments.set(key, [i]);
      }
    }
  }
  function roadGap(x: number, z: number): number {
    let best = Infinity;
    for (const i of segments.get(`${Math.floor(x / 8)}:${Math.floor(z / 8)}`) ?? []) {
      const a = points[i - 1], b = points[i], dx = b.x - a.x, dz = b.z - a.z;
      const t = clamp(((x - a.x) * dx + (z - a.z) * dz) / Math.max(.00001, dx * dx + dz * dz), 0, 1);
      best = Math.min(best, (x - a.x - dx * t) ** 2 + (z - a.z - dz * t) ** 2);
    }
    return Math.sqrt(best);
  }
  function routeDistance(travel: number): number {
    const index = clamp(travel / trail.length * divisions, 0, divisions), low = Math.floor(index), high = Math.min(divisions, low + 1);
    return THREE.MathUtils.lerp(lengths[low], lengths[high], index - low);
  }
  const stops: RouteStop[] = [{ id: 'start', distance: 0, point: sample(0), title: titles.start }, ...trail.stops.map(stop => {
    const distance = routeDistance(stop.travel); return { id: stop.id, distance, point: sample(distance), title: titles[stop.id] };
  })];
  const campDistance = routeDistance(trail.campTravel), summitDistance = routeDistance(trail.summitTravel);
  const camp = sample(campDistance), summit = sample(summitDistance), forestEdge = routeDistance(trail.stops[0].travel);
  function stage(distance: number): RouteStage {
    return distance >= length - 2 ? 'end' : distance > summitDistance + 5 ? 'descent' : distance > summitDistance - 6 ? 'summit' : distance > campDistance + 7 ? 'ridge' : distance > campDistance - 5 ? 'camp' : distance > forestEdge ? 'meadow' : 'forest';
  }
  function meadowWeight(x: number, z: number): number { return smooth(1, 11, height(x, z)) * (1 - smooth(.9, 1.7, slopeAt(x, z))); }
  function slopeAt(x: number, z: number): number {
    return Math.hypot(height(x + .4, z) - height(x - .4, z), height(x, z + .4) - height(x, z - .4)) / .8;
  }
  function coverage(x: number, z: number): number {
    const edge = Math.min(x - bounds.minX, bounds.maxX - x, z - bounds.minZ, bounds.maxZ - z);
    const gap = roadGap(x, z);
    const road = smooth(.69, 1.15, gap);
    const rim = smooth(0, 8, edge);
    const slope = 1 - smooth(1.05, 1.8, slopeAt(x, z));
    const campGap = Math.hypot(x - camp.x - 4, z - camp.z + 1);
    const clearing = smooth(4, 9, campGap);
    return road * rim * slope * clearing * meadowWeight(x, z) * (.88 + noise.noise(x * .075, z * .075) * .12);
  }
  function geometry(area: Bounds, columns: number, rows: number, withCoverage = false, cutNear = false): THREE.PlaneGeometry {
    const result = new THREE.PlaneGeometry(area.maxX - area.minX, area.maxZ - area.minZ, columns, rows);
    result.rotateX(-Math.PI / 2);
    result.translate((area.minX + area.maxX) / 2, 0, (area.minZ + area.maxZ) / 2);
    const position = result.getAttribute('position');
    const colors = new Float32Array(position.count * 3), mask = new Float32Array(position.count);
    const green = new THREE.Color('#809264'), sun = new THREE.Color('#a4ae7e');
    const slate = new THREE.Color('#7a8780'), shadow = new THREE.Color('#576f5e'), forest = new THREE.Color('#506d55');
    const color = new THREE.Color();
    for (let i = 0; i < position.count; i++) {
      const x = position.getX(i), z = position.getZ(i), h = height(x, z), slope = slopeAt(x, z);
      position.setY(i, h);
      const wash = noise.noise(x * .039, z * .039) * .5 + .5;
      const grain = noise.noise(x * .53, z * .53) * .028;
      color.copy(forest).lerp(green, smooth(-3, 12, h)).lerp(sun, wash * .42 * smooth(-4, 12, h)).lerp(shadow, smooth(.3, .85, slope) * .18);
      color.lerp(slate, smooth(1.05, 1.8, slope) * .67).multiplyScalar(1 + grain);
      colors.set([color.r, color.g, color.b], i * 3);
      if (withCoverage) mask[i] = coverage(x, z);
    }
    result.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    if (withCoverage) result.setAttribute('meadowCoverage', new THREE.BufferAttribute(mask, 1));
    if (cutNear && result.index) {
      const kept: number[] = [];
      for (let i = 0; i < result.index.count; i += 3) {
        const a = result.index.getX(i), b = result.index.getX(i + 1), c = result.index.getX(i + 2);
        const x = (position.getX(a) + position.getX(b) + position.getX(c)) / 3;
        const z = (position.getZ(a) + position.getZ(b) + position.getZ(c)) / 3;
        if (x > bounds.minX + 1.5 && x < bounds.maxX - 1.5 && z > bounds.minZ + 1.5 && z < bounds.maxZ - 1.5) continue;
        kept.push(a, b, c);
      }
      result.setIndex(kept);
    }
    result.computeVertexNormals();
    return result;
  }
  function roadGeometry(width: number, lift: number): THREE.BufferGeometry {
    const vertices: number[] = [], colors: number[] = [], indices: number[] = [];
    const earth = new THREE.Color('#b8aa88'), edge = new THREE.Color('#929875'), light = new THREE.Color('#d2c5a4');
    const lanes = [-1, -.72, -.36, 0, .36, .72, 1];
    for (let i = 0; i < points.length; i++) {
      const a = points[Math.max(0, i - 1)], b = points[Math.min(points.length - 1, i + 1)], p = points[i];
      const heading = Math.atan2(b.z - a.z, b.x - a.x);
      for (let j = 0; j < lanes.length; j++) {
        const jagged = 1 + noise.noise(p.x * 1.5 + j * 19, p.z * 1.5) * .075;
        const shift = lanes[j] * width * .5 * jagged;
        const x = p.x - Math.sin(heading) * shift, z = p.z + Math.cos(heading) * shift;
        vertices.push(x, height(x, z) + lift, z);
        const color = earth.clone().lerp(light, .18 + noise.noise(x * 4.1, z * 4.1) * .13);
        if (j === 0 || j === lanes.length - 1) color.lerp(edge, .78);
        colors.push(color.r, color.g, color.b);
      }
      if (!i) continue;
      for (let j = 0; j < lanes.length - 1; j++) {
        const a = (i - 1) * lanes.length + j, b = i * lanes.length + j;
        indices.push(a, a + 1, b, b, a + 1, b + 1);
      }
    }
    const result = new THREE.BufferGeometry();
    result.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    result.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    result.setIndex(indices); result.computeVertexNormals();
    return result;
  }
  const backdropBounds = { minX: bounds.minX - 260, maxX: bounds.maxX + 260, minZ: bounds.minZ - 260, maxZ: bounds.maxZ + 260 };
  function nearGeometry(): THREE.PlaneGeometry {
    return geometry(bounds, Math.round((bounds.maxX - bounds.minX) / cell), Math.round((bounds.maxZ - bounds.minZ) / cell), true);
  }
  function patchGeometry(x: number, z: number, size: number): THREE.PlaneGeometry {
    return geometry({ minX: x, maxX: x + size, minZ: z, maxZ: z + size }, Math.round(size / cell), Math.round(size / cell), true);
  }
  return { height, slopeAt, roadGap, geometry, nearGeometry, roadGeometry, patchGeometry, meadowWeight, sample, stage, length, points, stops, campDistance, summitDistance, forestEdge, bounds, backdropBounds, noise };
}
export type WugongTerrain = ReturnType<typeof createWugongTerrain>;
