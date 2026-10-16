// Generated from src/runtime/hint-art.ts by npm run build.
"use strict";
var TrailHintArt = (() => {
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

  // .build/typescript/runtime/hint-art.js
  var hint_art_exports = {};
  __export(hint_art_exports, {
    HINT_ART: () => HINT_ART,
    createPixiHints: () => createPixiHints,
    createSvgHints: () => createSvgHints,
    creekHintStrokes: () => creekHintStrokes,
    creekHints: () => creekHints,
    hintPose: () => hintPose
  });

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
  function creekHints(s, gates, height) {
    const target = gates[s.gates];
    if (!target || s.play.complete)
      return [];
    const alpha = s.play.reduced ? 0.94 : 0.87 + Math.sin(s.age * 1.5) * 0.07;
    return [hintPose("next-water-mouth", { x: target.x * 800, y: target.y * height }, 100, 0, alpha)];
  }
  function creekHintStrokes(s, gates, height) {
    const target = gates[s.gates];
    if (!target || s.play.complete)
      return [];
    const x = target.x * 800, y = target.y * height;
    return [-1, 1].map((side) => [
      { x: x - 28, y: y + side * height * 0.14 },
      { x: x - 12, y: y + side * height * 0.14 - 2 },
      { x: x + 9, y: y + side * height * 0.14 + 1 },
      { x: x + 30, y: y + side * height * 0.14 - 1 }
    ]);
  }
  var pencilPaths = [
    [[20, 61], [84, 60], [151, 52], [220, 44], [295, 44], [380, 45]],
    [[332, 16], [348, 29], [380, 45], [347, 61], [329, 78]]
  ];
  var attrs = (node, values) => {
    for (const [key, value] of Object.entries(values))
      if (node.getAttribute(key) !== String(value))
        node.setAttribute(key, String(value));
  };
  function createSvgHints(svg, parent) {
    const root = svg("g", { "pointer-events": "none", "aria-hidden": "true", "data-hint-style": "watercolor-brush" }, parent);
    const nodes = /* @__PURE__ */ new Map();
    let disposed = false;
    return {
      paint(poses) {
        if (disposed)
          return;
        for (const node of nodes.values())
          attrs(node, { display: "none" });
        for (const pose of poses) {
          let node = nodes.get(pose.key);
          if (!node) {
            node = svg("g", {}, root);
            nodes.set(pose.key, node);
            const pencil = svg("g", {}, node);
            for (const [color, width] of [["#fff9e9", 17], ["#647955", 7]]) {
              for (const points of pencilPaths)
                svg("polyline", { points: points.map((p) => p.join(",")).join(" "), fill: "none", stroke: color, "stroke-width": width, "stroke-linecap": "round", "stroke-linejoin": "round" }, pencil);
            }
            const image = svg("image", { width: HINT_ART.width, height: HINT_ART.height, preserveAspectRatio: "xMidYMid meet" }, node);
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
          attrs(node, { display: "", opacity: pose.alpha, transform: "translate(" + pose.x + " " + pose.y + ") rotate(" + pose.rotation * 180 / Math.PI + ") scale(" + pose.width / HINT_ART.width + ") translate(" + -HINT_ART.tip.x * HINT_ART.width + " " + -HINT_ART.tip.y * HINT_ART.height + ")" });
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
          for (const node of nodes.values()) {
            node.sprite.texture = texture;
            node.sprite.visible = true;
            node.pencil.visible = false;
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
        for (const node of nodes.values())
          node.root.visible = false;
        for (const pose of poses) {
          let node = nodes.get(pose.key);
          if (!node) {
            const group = new P.Container(), pencil = new P.Graphics(), sprite = new P.Sprite(texture || P.Texture.EMPTY);
            for (const [color, width] of [[16775657, 17], [6584661, 7]])
              for (const points of pencilPaths) {
                pencil.moveTo(points[0][0], points[0][1]);
                for (const point of points.slice(1))
                  pencil.lineTo(point[0], point[1]);
                pencil.stroke({ color, width, cap: "round", join: "round" });
              }
            sprite.visible = !!texture;
            pencil.visible = !texture;
            group.addChild(pencil, sprite);
            root.addChild(group);
            nodes.set(pose.key, node = { root: group, sprite, pencil });
          }
          node.root.visible = true;
          node.root.position.set(pose.x, pose.y);
          node.root.rotation = pose.rotation;
          node.root.pivot.set(HINT_ART.tip.x * HINT_ART.width, HINT_ART.tip.y * HINT_ART.height);
          node.root.scale.set(pose.width / HINT_ART.width);
          node.root.alpha = pose.alpha;
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
  return __toCommonJS(hint_art_exports);
})();
if (typeof module === 'object' && module.exports) module.exports = TrailHintArt;
