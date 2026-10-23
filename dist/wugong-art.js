// Generated from src/journey/art-page.ts. Reuses existing mini-game, reward and journal controllers.
"use strict";
(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));

  // node_modules/matter-js/build/matter.js
  var require_matter = __commonJS({
    "node_modules/matter-js/build/matter.js"(exports, module) {
      (function webpackUniversalModuleDefinition(root, factory) {
        if (typeof exports === "object" && typeof module === "object")
          module.exports = factory();
        else if (typeof define === "function" && define.amd)
          define("Matter", [], factory);
        else if (typeof exports === "object")
          exports["Matter"] = factory();
        else
          root["Matter"] = factory();
      })(exports, function() {
        return (
          /******/
          (function(modules) {
            var installedModules = {};
            function __webpack_require__(moduleId) {
              if (installedModules[moduleId]) {
                return installedModules[moduleId].exports;
              }
              var module2 = installedModules[moduleId] = {
                /******/
                i: moduleId,
                /******/
                l: false,
                /******/
                exports: {}
                /******/
              };
              modules[moduleId].call(module2.exports, module2, module2.exports, __webpack_require__);
              module2.l = true;
              return module2.exports;
            }
            __webpack_require__.m = modules;
            __webpack_require__.c = installedModules;
            __webpack_require__.d = function(exports2, name, getter) {
              if (!__webpack_require__.o(exports2, name)) {
                Object.defineProperty(exports2, name, { enumerable: true, get: getter });
              }
            };
            __webpack_require__.r = function(exports2) {
              if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
                Object.defineProperty(exports2, Symbol.toStringTag, { value: "Module" });
              }
              Object.defineProperty(exports2, "__esModule", { value: true });
            };
            __webpack_require__.t = function(value, mode) {
              if (mode & 1) value = __webpack_require__(value);
              if (mode & 8) return value;
              if (mode & 4 && typeof value === "object" && value && value.__esModule) return value;
              var ns = /* @__PURE__ */ Object.create(null);
              __webpack_require__.r(ns);
              Object.defineProperty(ns, "default", { enumerable: true, value });
              if (mode & 2 && typeof value != "string") for (var key in value) __webpack_require__.d(ns, key, function(key2) {
                return value[key2];
              }.bind(null, key));
              return ns;
            };
            __webpack_require__.n = function(module2) {
              var getter = module2 && module2.__esModule ? (
                /******/
                function getDefault() {
                  return module2["default"];
                }
              ) : (
                /******/
                function getModuleExports() {
                  return module2;
                }
              );
              __webpack_require__.d(getter, "a", getter);
              return getter;
            };
            __webpack_require__.o = function(object, property) {
              return Object.prototype.hasOwnProperty.call(object, property);
            };
            __webpack_require__.p = "";
            return __webpack_require__(__webpack_require__.s = 20);
          })([
            /* 0 */
            /***/
            (function(module2, exports2) {
              var Common = {};
              module2.exports = Common;
              (function() {
                Common._baseDelta = 1e3 / 60;
                Common._nextId = 0;
                Common._seed = 0;
                Common._nowStartTime = +/* @__PURE__ */ new Date();
                Common._warnedOnce = {};
                Common._decomp = null;
                Common.extend = function(obj, deep) {
                  var argsStart, args, deepClone;
                  if (typeof deep === "boolean") {
                    argsStart = 2;
                    deepClone = deep;
                  } else {
                    argsStart = 1;
                    deepClone = true;
                  }
                  for (var i = argsStart; i < arguments.length; i++) {
                    var source = arguments[i];
                    if (source) {
                      for (var prop in source) {
                        if (deepClone && source[prop] && source[prop].constructor === Object) {
                          if (!obj[prop] || obj[prop].constructor === Object) {
                            obj[prop] = obj[prop] || {};
                            Common.extend(obj[prop], deepClone, source[prop]);
                          } else {
                            obj[prop] = source[prop];
                          }
                        } else {
                          obj[prop] = source[prop];
                        }
                      }
                    }
                  }
                  return obj;
                };
                Common.clone = function(obj, deep) {
                  return Common.extend({}, deep, obj);
                };
                Common.keys = function(obj) {
                  if (Object.keys)
                    return Object.keys(obj);
                  var keys = [];
                  for (var key in obj)
                    keys.push(key);
                  return keys;
                };
                Common.values = function(obj) {
                  var values = [];
                  if (Object.keys) {
                    var keys = Object.keys(obj);
                    for (var i = 0; i < keys.length; i++) {
                      values.push(obj[keys[i]]);
                    }
                    return values;
                  }
                  for (var key in obj)
                    values.push(obj[key]);
                  return values;
                };
                Common.get = function(obj, path, begin, end) {
                  path = path.split(".").slice(begin, end);
                  for (var i = 0; i < path.length; i += 1) {
                    obj = obj[path[i]];
                  }
                  return obj;
                };
                Common.set = function(obj, path, val, begin, end) {
                  var parts = path.split(".").slice(begin, end);
                  Common.get(obj, path, 0, -1)[parts[parts.length - 1]] = val;
                  return val;
                };
                Common.shuffle = function(array) {
                  for (var i = array.length - 1; i > 0; i--) {
                    var j = Math.floor(Common.random() * (i + 1));
                    var temp = array[i];
                    array[i] = array[j];
                    array[j] = temp;
                  }
                  return array;
                };
                Common.choose = function(choices) {
                  return choices[Math.floor(Common.random() * choices.length)];
                };
                Common.isElement = function(obj) {
                  if (typeof HTMLElement !== "undefined") {
                    return obj instanceof HTMLElement;
                  }
                  return !!(obj && obj.nodeType && obj.nodeName);
                };
                Common.isArray = function(obj) {
                  return Object.prototype.toString.call(obj) === "[object Array]";
                };
                Common.isFunction = function(obj) {
                  return typeof obj === "function";
                };
                Common.isPlainObject = function(obj) {
                  return typeof obj === "object" && obj.constructor === Object;
                };
                Common.isString = function(obj) {
                  return toString.call(obj) === "[object String]";
                };
                Common.clamp = function(value, min, max) {
                  if (value < min)
                    return min;
                  if (value > max)
                    return max;
                  return value;
                };
                Common.sign = function(value) {
                  return value < 0 ? -1 : 1;
                };
                Common.now = function() {
                  if (typeof window !== "undefined" && window.performance) {
                    if (window.performance.now) {
                      return window.performance.now();
                    } else if (window.performance.webkitNow) {
                      return window.performance.webkitNow();
                    }
                  }
                  if (Date.now) {
                    return Date.now();
                  }
                  return /* @__PURE__ */ new Date() - Common._nowStartTime;
                };
                Common.random = function(min, max) {
                  min = typeof min !== "undefined" ? min : 0;
                  max = typeof max !== "undefined" ? max : 1;
                  return min + _seededRandom() * (max - min);
                };
                var _seededRandom = function() {
                  Common._seed = (Common._seed * 9301 + 49297) % 233280;
                  return Common._seed / 233280;
                };
                Common.colorToNumber = function(colorString) {
                  colorString = colorString.replace("#", "");
                  if (colorString.length == 3) {
                    colorString = colorString.charAt(0) + colorString.charAt(0) + colorString.charAt(1) + colorString.charAt(1) + colorString.charAt(2) + colorString.charAt(2);
                  }
                  return parseInt(colorString, 16);
                };
                Common.logLevel = 1;
                Common.log = function() {
                  if (console && Common.logLevel > 0 && Common.logLevel <= 3) {
                    console.log.apply(console, ["matter-js:"].concat(Array.prototype.slice.call(arguments)));
                  }
                };
                Common.info = function() {
                  if (console && Common.logLevel > 0 && Common.logLevel <= 2) {
                    console.info.apply(console, ["matter-js:"].concat(Array.prototype.slice.call(arguments)));
                  }
                };
                Common.warn = function() {
                  if (console && Common.logLevel > 0 && Common.logLevel <= 3) {
                    console.warn.apply(console, ["matter-js:"].concat(Array.prototype.slice.call(arguments)));
                  }
                };
                Common.warnOnce = function() {
                  var message = Array.prototype.slice.call(arguments).join(" ");
                  if (!Common._warnedOnce[message]) {
                    Common.warn(message);
                    Common._warnedOnce[message] = true;
                  }
                };
                Common.deprecated = function(obj, prop, warning) {
                  obj[prop] = Common.chain(function() {
                    Common.warnOnce("🔅 deprecated 🔅", warning);
                  }, obj[prop]);
                };
                Common.nextId = function() {
                  return Common._nextId++;
                };
                Common.indexOf = function(haystack, needle) {
                  if (haystack.indexOf)
                    return haystack.indexOf(needle);
                  for (var i = 0; i < haystack.length; i++) {
                    if (haystack[i] === needle)
                      return i;
                  }
                  return -1;
                };
                Common.map = function(list, func) {
                  if (list.map) {
                    return list.map(func);
                  }
                  var mapped = [];
                  for (var i = 0; i < list.length; i += 1) {
                    mapped.push(func(list[i]));
                  }
                  return mapped;
                };
                Common.topologicalSort = function(graph) {
                  var result = [], visited = [], temp = [];
                  for (var node in graph) {
                    if (!visited[node] && !temp[node]) {
                      Common._topologicalSort(node, visited, temp, graph, result);
                    }
                  }
                  return result;
                };
                Common._topologicalSort = function(node, visited, temp, graph, result) {
                  var neighbors = graph[node] || [];
                  temp[node] = true;
                  for (var i = 0; i < neighbors.length; i += 1) {
                    var neighbor = neighbors[i];
                    if (temp[neighbor]) {
                      continue;
                    }
                    if (!visited[neighbor]) {
                      Common._topologicalSort(neighbor, visited, temp, graph, result);
                    }
                  }
                  temp[node] = false;
                  visited[node] = true;
                  result.push(node);
                };
                Common.chain = function() {
                  var funcs = [];
                  for (var i = 0; i < arguments.length; i += 1) {
                    var func = arguments[i];
                    if (func._chained) {
                      funcs.push.apply(funcs, func._chained);
                    } else {
                      funcs.push(func);
                    }
                  }
                  var chain = function() {
                    var lastResult, args = new Array(arguments.length);
                    for (var i2 = 0, l = arguments.length; i2 < l; i2++) {
                      args[i2] = arguments[i2];
                    }
                    for (i2 = 0; i2 < funcs.length; i2 += 1) {
                      var result = funcs[i2].apply(lastResult, args);
                      if (typeof result !== "undefined") {
                        lastResult = result;
                      }
                    }
                    return lastResult;
                  };
                  chain._chained = funcs;
                  return chain;
                };
                Common.chainPathBefore = function(base, path, func) {
                  return Common.set(base, path, Common.chain(
                    func,
                    Common.get(base, path)
                  ));
                };
                Common.chainPathAfter = function(base, path, func) {
                  return Common.set(base, path, Common.chain(
                    Common.get(base, path),
                    func
                  ));
                };
                Common.setDecomp = function(decomp) {
                  Common._decomp = decomp;
                };
                Common.getDecomp = function() {
                  var decomp = Common._decomp;
                  try {
                    if (!decomp && typeof window !== "undefined") {
                      decomp = window.decomp;
                    }
                    if (!decomp && typeof global !== "undefined") {
                      decomp = global.decomp;
                    }
                  } catch (e) {
                    decomp = null;
                  }
                  return decomp;
                };
              })();
            }),
            /* 1 */
            /***/
            (function(module2, exports2) {
              var Bounds = {};
              module2.exports = Bounds;
              (function() {
                Bounds.create = function(vertices) {
                  var bounds = {
                    min: { x: 0, y: 0 },
                    max: { x: 0, y: 0 }
                  };
                  if (vertices)
                    Bounds.update(bounds, vertices);
                  return bounds;
                };
                Bounds.update = function(bounds, vertices, velocity) {
                  bounds.min.x = Infinity;
                  bounds.max.x = -Infinity;
                  bounds.min.y = Infinity;
                  bounds.max.y = -Infinity;
                  for (var i = 0; i < vertices.length; i++) {
                    var vertex = vertices[i];
                    if (vertex.x > bounds.max.x) bounds.max.x = vertex.x;
                    if (vertex.x < bounds.min.x) bounds.min.x = vertex.x;
                    if (vertex.y > bounds.max.y) bounds.max.y = vertex.y;
                    if (vertex.y < bounds.min.y) bounds.min.y = vertex.y;
                  }
                  if (velocity) {
                    if (velocity.x > 0) {
                      bounds.max.x += velocity.x;
                    } else {
                      bounds.min.x += velocity.x;
                    }
                    if (velocity.y > 0) {
                      bounds.max.y += velocity.y;
                    } else {
                      bounds.min.y += velocity.y;
                    }
                  }
                };
                Bounds.contains = function(bounds, point2) {
                  return point2.x >= bounds.min.x && point2.x <= bounds.max.x && point2.y >= bounds.min.y && point2.y <= bounds.max.y;
                };
                Bounds.overlaps = function(boundsA, boundsB) {
                  return boundsA.min.x <= boundsB.max.x && boundsA.max.x >= boundsB.min.x && boundsA.max.y >= boundsB.min.y && boundsA.min.y <= boundsB.max.y;
                };
                Bounds.translate = function(bounds, vector) {
                  bounds.min.x += vector.x;
                  bounds.max.x += vector.x;
                  bounds.min.y += vector.y;
                  bounds.max.y += vector.y;
                };
                Bounds.shift = function(bounds, position) {
                  var deltaX = bounds.max.x - bounds.min.x, deltaY = bounds.max.y - bounds.min.y;
                  bounds.min.x = position.x;
                  bounds.max.x = position.x + deltaX;
                  bounds.min.y = position.y;
                  bounds.max.y = position.y + deltaY;
                };
              })();
            }),
            /* 2 */
            /***/
            (function(module2, exports2) {
              var Vector = {};
              module2.exports = Vector;
              (function() {
                Vector.create = function(x, y) {
                  return { x: x || 0, y: y || 0 };
                };
                Vector.clone = function(vector) {
                  return { x: vector.x, y: vector.y };
                };
                Vector.magnitude = function(vector) {
                  return Math.sqrt(vector.x * vector.x + vector.y * vector.y);
                };
                Vector.magnitudeSquared = function(vector) {
                  return vector.x * vector.x + vector.y * vector.y;
                };
                Vector.rotate = function(vector, angle, output) {
                  var cos = Math.cos(angle), sin = Math.sin(angle);
                  if (!output) output = {};
                  var x = vector.x * cos - vector.y * sin;
                  output.y = vector.x * sin + vector.y * cos;
                  output.x = x;
                  return output;
                };
                Vector.rotateAbout = function(vector, angle, point2, output) {
                  var cos = Math.cos(angle), sin = Math.sin(angle);
                  if (!output) output = {};
                  var x = point2.x + ((vector.x - point2.x) * cos - (vector.y - point2.y) * sin);
                  output.y = point2.y + ((vector.x - point2.x) * sin + (vector.y - point2.y) * cos);
                  output.x = x;
                  return output;
                };
                Vector.normalise = function(vector) {
                  var magnitude = Vector.magnitude(vector);
                  if (magnitude === 0)
                    return { x: 0, y: 0 };
                  return { x: vector.x / magnitude, y: vector.y / magnitude };
                };
                Vector.dot = function(vectorA, vectorB) {
                  return vectorA.x * vectorB.x + vectorA.y * vectorB.y;
                };
                Vector.cross = function(vectorA, vectorB) {
                  return vectorA.x * vectorB.y - vectorA.y * vectorB.x;
                };
                Vector.cross3 = function(vectorA, vectorB, vectorC) {
                  return (vectorB.x - vectorA.x) * (vectorC.y - vectorA.y) - (vectorB.y - vectorA.y) * (vectorC.x - vectorA.x);
                };
                Vector.add = function(vectorA, vectorB, output) {
                  if (!output) output = {};
                  output.x = vectorA.x + vectorB.x;
                  output.y = vectorA.y + vectorB.y;
                  return output;
                };
                Vector.sub = function(vectorA, vectorB, output) {
                  if (!output) output = {};
                  output.x = vectorA.x - vectorB.x;
                  output.y = vectorA.y - vectorB.y;
                  return output;
                };
                Vector.mult = function(vector, scalar) {
                  return { x: vector.x * scalar, y: vector.y * scalar };
                };
                Vector.div = function(vector, scalar) {
                  return { x: vector.x / scalar, y: vector.y / scalar };
                };
                Vector.perp = function(vector, negate) {
                  negate = negate === true ? -1 : 1;
                  return { x: negate * -vector.y, y: negate * vector.x };
                };
                Vector.neg = function(vector) {
                  return { x: -vector.x, y: -vector.y };
                };
                Vector.angle = function(vectorA, vectorB) {
                  return Math.atan2(vectorB.y - vectorA.y, vectorB.x - vectorA.x);
                };
                Vector._temp = [
                  Vector.create(),
                  Vector.create(),
                  Vector.create(),
                  Vector.create(),
                  Vector.create(),
                  Vector.create()
                ];
              })();
            }),
            /* 3 */
            /***/
            (function(module2, exports2, __webpack_require__) {
              var Vertices = {};
              module2.exports = Vertices;
              var Vector = __webpack_require__(2);
              var Common = __webpack_require__(0);
              (function() {
                Vertices.create = function(points, body) {
                  var vertices = [];
                  for (var i = 0; i < points.length; i++) {
                    var point2 = points[i], vertex = {
                      x: point2.x,
                      y: point2.y,
                      index: i,
                      body,
                      isInternal: false
                    };
                    vertices.push(vertex);
                  }
                  return vertices;
                };
                Vertices.fromPath = function(path, body) {
                  var pathPattern = /L?\s*([-\d.e]+)[\s,]*([-\d.e]+)*/ig, points = [];
                  path.replace(pathPattern, function(match, x, y) {
                    points.push({ x: parseFloat(x), y: parseFloat(y) });
                  });
                  return Vertices.create(points, body);
                };
                Vertices.centre = function(vertices) {
                  var area = Vertices.area(vertices, true), centre = { x: 0, y: 0 }, cross, temp, j;
                  for (var i = 0; i < vertices.length; i++) {
                    j = (i + 1) % vertices.length;
                    cross = Vector.cross(vertices[i], vertices[j]);
                    temp = Vector.mult(Vector.add(vertices[i], vertices[j]), cross);
                    centre = Vector.add(centre, temp);
                  }
                  return Vector.div(centre, 6 * area);
                };
                Vertices.mean = function(vertices) {
                  var average = { x: 0, y: 0 };
                  for (var i = 0; i < vertices.length; i++) {
                    average.x += vertices[i].x;
                    average.y += vertices[i].y;
                  }
                  return Vector.div(average, vertices.length);
                };
                Vertices.area = function(vertices, signed) {
                  var area = 0, j = vertices.length - 1;
                  for (var i = 0; i < vertices.length; i++) {
                    area += (vertices[j].x - vertices[i].x) * (vertices[j].y + vertices[i].y);
                    j = i;
                  }
                  if (signed)
                    return area / 2;
                  return Math.abs(area) / 2;
                };
                Vertices.inertia = function(vertices, mass) {
                  var numerator = 0, denominator = 0, v = vertices, cross, j;
                  for (var n = 0; n < v.length; n++) {
                    j = (n + 1) % v.length;
                    cross = Math.abs(Vector.cross(v[j], v[n]));
                    numerator += cross * (Vector.dot(v[j], v[j]) + Vector.dot(v[j], v[n]) + Vector.dot(v[n], v[n]));
                    denominator += cross;
                  }
                  return mass / 6 * (numerator / denominator);
                };
                Vertices.translate = function(vertices, vector, scalar) {
                  scalar = typeof scalar !== "undefined" ? scalar : 1;
                  var verticesLength = vertices.length, translateX = vector.x * scalar, translateY = vector.y * scalar, i;
                  for (i = 0; i < verticesLength; i++) {
                    vertices[i].x += translateX;
                    vertices[i].y += translateY;
                  }
                  return vertices;
                };
                Vertices.rotate = function(vertices, angle, point2) {
                  if (angle === 0)
                    return;
                  var cos = Math.cos(angle), sin = Math.sin(angle), pointX = point2.x, pointY = point2.y, verticesLength = vertices.length, vertex, dx, dy, i;
                  for (i = 0; i < verticesLength; i++) {
                    vertex = vertices[i];
                    dx = vertex.x - pointX;
                    dy = vertex.y - pointY;
                    vertex.x = pointX + (dx * cos - dy * sin);
                    vertex.y = pointY + (dx * sin + dy * cos);
                  }
                  return vertices;
                };
                Vertices.contains = function(vertices, point2) {
                  var pointX = point2.x, pointY = point2.y, verticesLength = vertices.length, vertex = vertices[verticesLength - 1], nextVertex;
                  for (var i = 0; i < verticesLength; i++) {
                    nextVertex = vertices[i];
                    if ((pointX - vertex.x) * (nextVertex.y - vertex.y) + (pointY - vertex.y) * (vertex.x - nextVertex.x) > 0) {
                      return false;
                    }
                    vertex = nextVertex;
                  }
                  return true;
                };
                Vertices.scale = function(vertices, scaleX, scaleY, point2) {
                  if (scaleX === 1 && scaleY === 1)
                    return vertices;
                  point2 = point2 || Vertices.centre(vertices);
                  var vertex, delta;
                  for (var i = 0; i < vertices.length; i++) {
                    vertex = vertices[i];
                    delta = Vector.sub(vertex, point2);
                    vertices[i].x = point2.x + delta.x * scaleX;
                    vertices[i].y = point2.y + delta.y * scaleY;
                  }
                  return vertices;
                };
                Vertices.chamfer = function(vertices, radius2, quality, qualityMin, qualityMax) {
                  if (typeof radius2 === "number") {
                    radius2 = [radius2];
                  } else {
                    radius2 = radius2 || [8];
                  }
                  quality = typeof quality !== "undefined" ? quality : -1;
                  qualityMin = qualityMin || 2;
                  qualityMax = qualityMax || 14;
                  var newVertices = [];
                  for (var i = 0; i < vertices.length; i++) {
                    var prevVertex = vertices[i - 1 >= 0 ? i - 1 : vertices.length - 1], vertex = vertices[i], nextVertex = vertices[(i + 1) % vertices.length], currentRadius = radius2[i < radius2.length ? i : radius2.length - 1];
                    if (currentRadius === 0) {
                      newVertices.push(vertex);
                      continue;
                    }
                    var prevNormal = Vector.normalise({
                      x: vertex.y - prevVertex.y,
                      y: prevVertex.x - vertex.x
                    });
                    var nextNormal = Vector.normalise({
                      x: nextVertex.y - vertex.y,
                      y: vertex.x - nextVertex.x
                    });
                    var diagonalRadius = Math.sqrt(2 * Math.pow(currentRadius, 2)), radiusVector = Vector.mult(Common.clone(prevNormal), currentRadius), midNormal = Vector.normalise(Vector.mult(Vector.add(prevNormal, nextNormal), 0.5)), scaledVertex = Vector.sub(vertex, Vector.mult(midNormal, diagonalRadius));
                    var precision = quality;
                    if (quality === -1) {
                      precision = Math.pow(currentRadius, 0.32) * 1.75;
                    }
                    precision = Common.clamp(precision, qualityMin, qualityMax);
                    if (precision % 2 === 1)
                      precision += 1;
                    var alpha = Math.acos(Vector.dot(prevNormal, nextNormal)), theta = alpha / precision;
                    for (var j = 0; j < precision; j++) {
                      newVertices.push(Vector.add(Vector.rotate(radiusVector, theta * j), scaledVertex));
                    }
                  }
                  return newVertices;
                };
                Vertices.clockwiseSort = function(vertices) {
                  var centre = Vertices.mean(vertices);
                  vertices.sort(function(vertexA, vertexB) {
                    return Vector.angle(centre, vertexA) - Vector.angle(centre, vertexB);
                  });
                  return vertices;
                };
                Vertices.isConvex = function(vertices) {
                  var flag = 0, n = vertices.length, i, j, k, z;
                  if (n < 3)
                    return null;
                  for (i = 0; i < n; i++) {
                    j = (i + 1) % n;
                    k = (i + 2) % n;
                    z = (vertices[j].x - vertices[i].x) * (vertices[k].y - vertices[j].y);
                    z -= (vertices[j].y - vertices[i].y) * (vertices[k].x - vertices[j].x);
                    if (z < 0) {
                      flag |= 1;
                    } else if (z > 0) {
                      flag |= 2;
                    }
                    if (flag === 3) {
                      return false;
                    }
                  }
                  if (flag !== 0) {
                    return true;
                  } else {
                    return null;
                  }
                };
                Vertices.hull = function(vertices) {
                  var upper = [], lower = [], vertex, i;
                  vertices = vertices.slice(0);
                  vertices.sort(function(vertexA, vertexB) {
                    var dx = vertexA.x - vertexB.x;
                    return dx !== 0 ? dx : vertexA.y - vertexB.y;
                  });
                  for (i = 0; i < vertices.length; i += 1) {
                    vertex = vertices[i];
                    while (lower.length >= 2 && Vector.cross3(lower[lower.length - 2], lower[lower.length - 1], vertex) <= 0) {
                      lower.pop();
                    }
                    lower.push(vertex);
                  }
                  for (i = vertices.length - 1; i >= 0; i -= 1) {
                    vertex = vertices[i];
                    while (upper.length >= 2 && Vector.cross3(upper[upper.length - 2], upper[upper.length - 1], vertex) <= 0) {
                      upper.pop();
                    }
                    upper.push(vertex);
                  }
                  upper.pop();
                  lower.pop();
                  return upper.concat(lower);
                };
              })();
            }),
            /* 4 */
            /***/
            (function(module2, exports2, __webpack_require__) {
              var Body2 = {};
              module2.exports = Body2;
              var Vertices = __webpack_require__(3);
              var Vector = __webpack_require__(2);
              var Sleeping = __webpack_require__(7);
              var Common = __webpack_require__(0);
              var Bounds = __webpack_require__(1);
              var Axes = __webpack_require__(11);
              (function() {
                Body2._timeCorrection = true;
                Body2._inertiaScale = 4;
                Body2._nextCollidingGroupId = 1;
                Body2._nextNonCollidingGroupId = -1;
                Body2._nextCategory = 1;
                Body2._baseDelta = 1e3 / 60;
                Body2.create = function(options) {
                  var defaults = {
                    id: Common.nextId(),
                    type: "body",
                    label: "Body",
                    parts: [],
                    plugin: {},
                    angle: 0,
                    vertices: Vertices.fromPath("L 0 0 L 40 0 L 40 40 L 0 40"),
                    position: { x: 0, y: 0 },
                    force: { x: 0, y: 0 },
                    torque: 0,
                    positionImpulse: { x: 0, y: 0 },
                    constraintImpulse: { x: 0, y: 0, angle: 0 },
                    totalContacts: 0,
                    speed: 0,
                    angularSpeed: 0,
                    velocity: { x: 0, y: 0 },
                    angularVelocity: 0,
                    isSensor: false,
                    isStatic: false,
                    isSleeping: false,
                    motion: 0,
                    sleepThreshold: 60,
                    density: 1e-3,
                    restitution: 0,
                    friction: 0.1,
                    frictionStatic: 0.5,
                    frictionAir: 0.01,
                    collisionFilter: {
                      category: 1,
                      mask: 4294967295,
                      group: 0
                    },
                    slop: 0.05,
                    timeScale: 1,
                    render: {
                      visible: true,
                      opacity: 1,
                      strokeStyle: null,
                      fillStyle: null,
                      lineWidth: null,
                      sprite: {
                        xScale: 1,
                        yScale: 1,
                        xOffset: 0,
                        yOffset: 0
                      }
                    },
                    events: null,
                    bounds: null,
                    chamfer: null,
                    circleRadius: 0,
                    positionPrev: null,
                    anglePrev: 0,
                    parent: null,
                    axes: null,
                    area: 0,
                    mass: 0,
                    inertia: 0,
                    deltaTime: 1e3 / 60,
                    _original: null
                  };
                  var body = Common.extend(defaults, options);
                  _initProperties(body, options);
                  return body;
                };
                Body2.nextGroup = function(isNonColliding) {
                  if (isNonColliding)
                    return Body2._nextNonCollidingGroupId--;
                  return Body2._nextCollidingGroupId++;
                };
                Body2.nextCategory = function() {
                  Body2._nextCategory = Body2._nextCategory << 1;
                  return Body2._nextCategory;
                };
                var _initProperties = function(body, options) {
                  options = options || {};
                  Body2.set(body, {
                    bounds: body.bounds || Bounds.create(body.vertices),
                    positionPrev: body.positionPrev || Vector.clone(body.position),
                    anglePrev: body.anglePrev || body.angle,
                    vertices: body.vertices,
                    parts: body.parts || [body],
                    isStatic: body.isStatic,
                    isSleeping: body.isSleeping,
                    parent: body.parent || body
                  });
                  Vertices.rotate(body.vertices, body.angle, body.position);
                  Axes.rotate(body.axes, body.angle);
                  Bounds.update(body.bounds, body.vertices, body.velocity);
                  Body2.set(body, {
                    axes: options.axes || body.axes,
                    area: options.area || body.area,
                    mass: options.mass || body.mass,
                    inertia: options.inertia || body.inertia
                  });
                  var defaultFillStyle = body.isStatic ? "#14151f" : Common.choose(["#f19648", "#f5d259", "#f55a3c", "#063e7b", "#ececd1"]), defaultStrokeStyle = body.isStatic ? "#555" : "#ccc", defaultLineWidth = body.isStatic && body.render.fillStyle === null ? 1 : 0;
                  body.render.fillStyle = body.render.fillStyle || defaultFillStyle;
                  body.render.strokeStyle = body.render.strokeStyle || defaultStrokeStyle;
                  body.render.lineWidth = body.render.lineWidth || defaultLineWidth;
                  body.render.sprite.xOffset += -(body.bounds.min.x - body.position.x) / (body.bounds.max.x - body.bounds.min.x);
                  body.render.sprite.yOffset += -(body.bounds.min.y - body.position.y) / (body.bounds.max.y - body.bounds.min.y);
                };
                Body2.set = function(body, settings, value) {
                  var property;
                  if (typeof settings === "string") {
                    property = settings;
                    settings = {};
                    settings[property] = value;
                  }
                  for (property in settings) {
                    if (!Object.prototype.hasOwnProperty.call(settings, property))
                      continue;
                    value = settings[property];
                    switch (property) {
                      case "isStatic":
                        Body2.setStatic(body, value);
                        break;
                      case "isSleeping":
                        Sleeping.set(body, value);
                        break;
                      case "mass":
                        Body2.setMass(body, value);
                        break;
                      case "density":
                        Body2.setDensity(body, value);
                        break;
                      case "inertia":
                        Body2.setInertia(body, value);
                        break;
                      case "vertices":
                        Body2.setVertices(body, value);
                        break;
                      case "position":
                        Body2.setPosition(body, value);
                        break;
                      case "angle":
                        Body2.setAngle(body, value);
                        break;
                      case "velocity":
                        Body2.setVelocity(body, value);
                        break;
                      case "angularVelocity":
                        Body2.setAngularVelocity(body, value);
                        break;
                      case "speed":
                        Body2.setSpeed(body, value);
                        break;
                      case "angularSpeed":
                        Body2.setAngularSpeed(body, value);
                        break;
                      case "parts":
                        Body2.setParts(body, value);
                        break;
                      case "centre":
                        Body2.setCentre(body, value);
                        break;
                      default:
                        body[property] = value;
                    }
                  }
                };
                Body2.setStatic = function(body, isStatic) {
                  for (var i = 0; i < body.parts.length; i++) {
                    var part = body.parts[i];
                    if (isStatic) {
                      if (!part.isStatic) {
                        part._original = {
                          restitution: part.restitution,
                          friction: part.friction,
                          mass: part.mass,
                          inertia: part.inertia,
                          density: part.density,
                          inverseMass: part.inverseMass,
                          inverseInertia: part.inverseInertia
                        };
                      }
                      part.restitution = 0;
                      part.friction = 1;
                      part.mass = part.inertia = part.density = Infinity;
                      part.inverseMass = part.inverseInertia = 0;
                      part.positionPrev.x = part.position.x;
                      part.positionPrev.y = part.position.y;
                      part.anglePrev = part.angle;
                      part.angularVelocity = 0;
                      part.speed = 0;
                      part.angularSpeed = 0;
                      part.motion = 0;
                    } else if (part._original) {
                      part.restitution = part._original.restitution;
                      part.friction = part._original.friction;
                      part.mass = part._original.mass;
                      part.inertia = part._original.inertia;
                      part.density = part._original.density;
                      part.inverseMass = part._original.inverseMass;
                      part.inverseInertia = part._original.inverseInertia;
                      part._original = null;
                    }
                    part.isStatic = isStatic;
                  }
                };
                Body2.setMass = function(body, mass) {
                  var moment = body.inertia / (body.mass / 6);
                  body.inertia = moment * (mass / 6);
                  body.inverseInertia = 1 / body.inertia;
                  body.mass = mass;
                  body.inverseMass = 1 / body.mass;
                  body.density = body.mass / body.area;
                };
                Body2.setDensity = function(body, density) {
                  Body2.setMass(body, density * body.area);
                  body.density = density;
                };
                Body2.setInertia = function(body, inertia) {
                  body.inertia = inertia;
                  body.inverseInertia = 1 / body.inertia;
                };
                Body2.setVertices = function(body, vertices) {
                  if (vertices[0].body === body) {
                    body.vertices = vertices;
                  } else {
                    body.vertices = Vertices.create(vertices, body);
                  }
                  body.axes = Axes.fromVertices(body.vertices);
                  body.area = Vertices.area(body.vertices);
                  Body2.setMass(body, body.density * body.area);
                  var centre = Vertices.centre(body.vertices);
                  Vertices.translate(body.vertices, centre, -1);
                  Body2.setInertia(body, Body2._inertiaScale * Vertices.inertia(body.vertices, body.mass));
                  Vertices.translate(body.vertices, body.position);
                  Bounds.update(body.bounds, body.vertices, body.velocity);
                };
                Body2.setParts = function(body, parts, autoHull) {
                  var i;
                  parts = parts.slice(0);
                  body.parts.length = 0;
                  body.parts.push(body);
                  body.parent = body;
                  for (i = 0; i < parts.length; i++) {
                    var part = parts[i];
                    if (part !== body) {
                      part.parent = body;
                      body.parts.push(part);
                    }
                  }
                  if (body.parts.length === 1)
                    return;
                  autoHull = typeof autoHull !== "undefined" ? autoHull : true;
                  if (autoHull) {
                    var vertices = [];
                    for (i = 0; i < parts.length; i++) {
                      vertices = vertices.concat(parts[i].vertices);
                    }
                    Vertices.clockwiseSort(vertices);
                    var hull = Vertices.hull(vertices), hullCentre = Vertices.centre(hull);
                    Body2.setVertices(body, hull);
                    Vertices.translate(body.vertices, hullCentre);
                  }
                  var total = Body2._totalProperties(body);
                  body.area = total.area;
                  body.parent = body;
                  body.position.x = total.centre.x;
                  body.position.y = total.centre.y;
                  body.positionPrev.x = total.centre.x;
                  body.positionPrev.y = total.centre.y;
                  Body2.setMass(body, total.mass);
                  Body2.setInertia(body, total.inertia);
                  Body2.setPosition(body, total.centre);
                };
                Body2.setCentre = function(body, centre, relative) {
                  if (!relative) {
                    body.positionPrev.x = centre.x - (body.position.x - body.positionPrev.x);
                    body.positionPrev.y = centre.y - (body.position.y - body.positionPrev.y);
                    body.position.x = centre.x;
                    body.position.y = centre.y;
                  } else {
                    body.positionPrev.x += centre.x;
                    body.positionPrev.y += centre.y;
                    body.position.x += centre.x;
                    body.position.y += centre.y;
                  }
                };
                Body2.setPosition = function(body, position, updateVelocity) {
                  var delta = Vector.sub(position, body.position);
                  if (updateVelocity) {
                    body.positionPrev.x = body.position.x;
                    body.positionPrev.y = body.position.y;
                    body.velocity.x = delta.x;
                    body.velocity.y = delta.y;
                    body.speed = Vector.magnitude(delta);
                  } else {
                    body.positionPrev.x += delta.x;
                    body.positionPrev.y += delta.y;
                  }
                  for (var i = 0; i < body.parts.length; i++) {
                    var part = body.parts[i];
                    part.position.x += delta.x;
                    part.position.y += delta.y;
                    Vertices.translate(part.vertices, delta);
                    Bounds.update(part.bounds, part.vertices, body.velocity);
                  }
                };
                Body2.setAngle = function(body, angle, updateVelocity) {
                  var delta = angle - body.angle;
                  if (updateVelocity) {
                    body.anglePrev = body.angle;
                    body.angularVelocity = delta;
                    body.angularSpeed = Math.abs(delta);
                  } else {
                    body.anglePrev += delta;
                  }
                  for (var i = 0; i < body.parts.length; i++) {
                    var part = body.parts[i];
                    part.angle += delta;
                    Vertices.rotate(part.vertices, delta, body.position);
                    Axes.rotate(part.axes, delta);
                    Bounds.update(part.bounds, part.vertices, body.velocity);
                    if (i > 0) {
                      Vector.rotateAbout(part.position, delta, body.position, part.position);
                    }
                  }
                };
                Body2.setVelocity = function(body, velocity) {
                  var timeScale = body.deltaTime / Body2._baseDelta;
                  body.positionPrev.x = body.position.x - velocity.x * timeScale;
                  body.positionPrev.y = body.position.y - velocity.y * timeScale;
                  body.velocity.x = (body.position.x - body.positionPrev.x) / timeScale;
                  body.velocity.y = (body.position.y - body.positionPrev.y) / timeScale;
                  body.speed = Vector.magnitude(body.velocity);
                };
                Body2.getVelocity = function(body) {
                  var timeScale = Body2._baseDelta / body.deltaTime;
                  return {
                    x: (body.position.x - body.positionPrev.x) * timeScale,
                    y: (body.position.y - body.positionPrev.y) * timeScale
                  };
                };
                Body2.getSpeed = function(body) {
                  return Vector.magnitude(Body2.getVelocity(body));
                };
                Body2.setSpeed = function(body, speed) {
                  Body2.setVelocity(body, Vector.mult(Vector.normalise(Body2.getVelocity(body)), speed));
                };
                Body2.setAngularVelocity = function(body, velocity) {
                  var timeScale = body.deltaTime / Body2._baseDelta;
                  body.anglePrev = body.angle - velocity * timeScale;
                  body.angularVelocity = (body.angle - body.anglePrev) / timeScale;
                  body.angularSpeed = Math.abs(body.angularVelocity);
                };
                Body2.getAngularVelocity = function(body) {
                  return (body.angle - body.anglePrev) * Body2._baseDelta / body.deltaTime;
                };
                Body2.getAngularSpeed = function(body) {
                  return Math.abs(Body2.getAngularVelocity(body));
                };
                Body2.setAngularSpeed = function(body, speed) {
                  Body2.setAngularVelocity(body, Common.sign(Body2.getAngularVelocity(body)) * speed);
                };
                Body2.translate = function(body, translation, updateVelocity) {
                  Body2.setPosition(body, Vector.add(body.position, translation), updateVelocity);
                };
                Body2.rotate = function(body, rotation, point2, updateVelocity) {
                  if (!point2) {
                    Body2.setAngle(body, body.angle + rotation, updateVelocity);
                  } else {
                    var cos = Math.cos(rotation), sin = Math.sin(rotation), dx = body.position.x - point2.x, dy = body.position.y - point2.y;
                    Body2.setPosition(body, {
                      x: point2.x + (dx * cos - dy * sin),
                      y: point2.y + (dx * sin + dy * cos)
                    }, updateVelocity);
                    Body2.setAngle(body, body.angle + rotation, updateVelocity);
                  }
                };
                Body2.scale = function(body, scaleX, scaleY, point2) {
                  var totalArea = 0, totalInertia = 0;
                  point2 = point2 || body.position;
                  for (var i = 0; i < body.parts.length; i++) {
                    var part = body.parts[i];
                    Vertices.scale(part.vertices, scaleX, scaleY, point2);
                    part.axes = Axes.fromVertices(part.vertices);
                    part.area = Vertices.area(part.vertices);
                    Body2.setMass(part, body.density * part.area);
                    Vertices.translate(part.vertices, { x: -part.position.x, y: -part.position.y });
                    Body2.setInertia(part, Body2._inertiaScale * Vertices.inertia(part.vertices, part.mass));
                    Vertices.translate(part.vertices, { x: part.position.x, y: part.position.y });
                    if (i > 0) {
                      totalArea += part.area;
                      totalInertia += part.inertia;
                    }
                    part.position.x = point2.x + (part.position.x - point2.x) * scaleX;
                    part.position.y = point2.y + (part.position.y - point2.y) * scaleY;
                    Bounds.update(part.bounds, part.vertices, body.velocity);
                  }
                  if (body.parts.length > 1) {
                    body.area = totalArea;
                    if (!body.isStatic) {
                      Body2.setMass(body, body.density * totalArea);
                      Body2.setInertia(body, totalInertia);
                    }
                  }
                  if (body.circleRadius) {
                    if (scaleX === scaleY) {
                      body.circleRadius *= scaleX;
                    } else {
                      body.circleRadius = null;
                    }
                  }
                };
                Body2.update = function(body, deltaTime) {
                  deltaTime = (typeof deltaTime !== "undefined" ? deltaTime : 1e3 / 60) * body.timeScale;
                  var deltaTimeSquared = deltaTime * deltaTime, correction = Body2._timeCorrection ? deltaTime / (body.deltaTime || deltaTime) : 1;
                  var frictionAir = 1 - body.frictionAir * (deltaTime / Common._baseDelta), velocityPrevX = (body.position.x - body.positionPrev.x) * correction, velocityPrevY = (body.position.y - body.positionPrev.y) * correction;
                  body.velocity.x = velocityPrevX * frictionAir + body.force.x / body.mass * deltaTimeSquared;
                  body.velocity.y = velocityPrevY * frictionAir + body.force.y / body.mass * deltaTimeSquared;
                  body.positionPrev.x = body.position.x;
                  body.positionPrev.y = body.position.y;
                  body.position.x += body.velocity.x;
                  body.position.y += body.velocity.y;
                  body.deltaTime = deltaTime;
                  body.angularVelocity = (body.angle - body.anglePrev) * frictionAir * correction + body.torque / body.inertia * deltaTimeSquared;
                  body.anglePrev = body.angle;
                  body.angle += body.angularVelocity;
                  for (var i = 0; i < body.parts.length; i++) {
                    var part = body.parts[i];
                    Vertices.translate(part.vertices, body.velocity);
                    if (i > 0) {
                      part.position.x += body.velocity.x;
                      part.position.y += body.velocity.y;
                    }
                    if (body.angularVelocity !== 0) {
                      Vertices.rotate(part.vertices, body.angularVelocity, body.position);
                      Axes.rotate(part.axes, body.angularVelocity);
                      if (i > 0) {
                        Vector.rotateAbout(part.position, body.angularVelocity, body.position, part.position);
                      }
                    }
                    Bounds.update(part.bounds, part.vertices, body.velocity);
                  }
                };
                Body2.updateVelocities = function(body) {
                  var timeScale = Body2._baseDelta / body.deltaTime, bodyVelocity = body.velocity;
                  bodyVelocity.x = (body.position.x - body.positionPrev.x) * timeScale;
                  bodyVelocity.y = (body.position.y - body.positionPrev.y) * timeScale;
                  body.speed = Math.sqrt(bodyVelocity.x * bodyVelocity.x + bodyVelocity.y * bodyVelocity.y);
                  body.angularVelocity = (body.angle - body.anglePrev) * timeScale;
                  body.angularSpeed = Math.abs(body.angularVelocity);
                };
                Body2.applyForce = function(body, position, force) {
                  var offset = { x: position.x - body.position.x, y: position.y - body.position.y };
                  body.force.x += force.x;
                  body.force.y += force.y;
                  body.torque += offset.x * force.y - offset.y * force.x;
                };
                Body2._totalProperties = function(body) {
                  var properties = {
                    mass: 0,
                    area: 0,
                    inertia: 0,
                    centre: { x: 0, y: 0 }
                  };
                  for (var i = body.parts.length === 1 ? 0 : 1; i < body.parts.length; i++) {
                    var part = body.parts[i], mass = part.mass !== Infinity ? part.mass : 1;
                    properties.mass += mass;
                    properties.area += part.area;
                    properties.inertia += part.inertia;
                    properties.centre = Vector.add(properties.centre, Vector.mult(part.position, mass));
                  }
                  properties.centre = Vector.div(properties.centre, properties.mass);
                  return properties;
                };
              })();
            }),
            /* 5 */
            /***/
            (function(module2, exports2, __webpack_require__) {
              var Events2 = {};
              module2.exports = Events2;
              var Common = __webpack_require__(0);
              (function() {
                Events2.on = function(object, eventNames, callback) {
                  var names = eventNames.split(" "), name;
                  for (var i = 0; i < names.length; i++) {
                    name = names[i];
                    object.events = object.events || {};
                    object.events[name] = object.events[name] || [];
                    object.events[name].push(callback);
                  }
                  return callback;
                };
                Events2.off = function(object, eventNames, callback) {
                  if (!eventNames) {
                    object.events = {};
                    return;
                  }
                  if (typeof eventNames === "function") {
                    callback = eventNames;
                    eventNames = Common.keys(object.events).join(" ");
                  }
                  var names = eventNames.split(" ");
                  for (var i = 0; i < names.length; i++) {
                    var callbacks = object.events[names[i]], newCallbacks = [];
                    if (callback && callbacks) {
                      for (var j = 0; j < callbacks.length; j++) {
                        if (callbacks[j] !== callback)
                          newCallbacks.push(callbacks[j]);
                      }
                    }
                    object.events[names[i]] = newCallbacks;
                  }
                };
                Events2.trigger = function(object, eventNames, event) {
                  var names, name, callbacks, eventClone;
                  var events2 = object.events;
                  if (events2 && Common.keys(events2).length > 0) {
                    if (!event)
                      event = {};
                    names = eventNames.split(" ");
                    for (var i = 0; i < names.length; i++) {
                      name = names[i];
                      callbacks = events2[name];
                      if (callbacks) {
                        eventClone = Common.clone(event, false);
                        eventClone.name = name;
                        eventClone.source = object;
                        for (var j = 0; j < callbacks.length; j++) {
                          callbacks[j].apply(object, [eventClone]);
                        }
                      }
                    }
                  }
                };
              })();
            }),
            /* 6 */
            /***/
            (function(module2, exports2, __webpack_require__) {
              var Composite2 = {};
              module2.exports = Composite2;
              var Events2 = __webpack_require__(5);
              var Common = __webpack_require__(0);
              var Bounds = __webpack_require__(1);
              var Body2 = __webpack_require__(4);
              (function() {
                Composite2.create = function(options) {
                  return Common.extend({
                    id: Common.nextId(),
                    type: "composite",
                    parent: null,
                    isModified: false,
                    bodies: [],
                    constraints: [],
                    composites: [],
                    label: "Composite",
                    plugin: {},
                    cache: {
                      allBodies: null,
                      allConstraints: null,
                      allComposites: null
                    }
                  }, options);
                };
                Composite2.setModified = function(composite, isModified, updateParents, updateChildren) {
                  composite.isModified = isModified;
                  if (isModified && composite.cache) {
                    composite.cache.allBodies = null;
                    composite.cache.allConstraints = null;
                    composite.cache.allComposites = null;
                  }
                  if (updateParents && composite.parent) {
                    Composite2.setModified(composite.parent, isModified, updateParents, updateChildren);
                  }
                  if (updateChildren) {
                    for (var i = 0; i < composite.composites.length; i++) {
                      var childComposite = composite.composites[i];
                      Composite2.setModified(childComposite, isModified, updateParents, updateChildren);
                    }
                  }
                };
                Composite2.add = function(composite, object) {
                  var objects = [].concat(object);
                  Events2.trigger(composite, "beforeAdd", { object });
                  for (var i = 0; i < objects.length; i++) {
                    var obj = objects[i];
                    switch (obj.type) {
                      case "body":
                        if (obj.parent !== obj) {
                          Common.warn("Composite.add: skipped adding a compound body part (you must add its parent instead)");
                          break;
                        }
                        Composite2.addBody(composite, obj);
                        break;
                      case "constraint":
                        Composite2.addConstraint(composite, obj);
                        break;
                      case "composite":
                        Composite2.addComposite(composite, obj);
                        break;
                      case "mouseConstraint":
                        Composite2.addConstraint(composite, obj.constraint);
                        break;
                    }
                  }
                  Events2.trigger(composite, "afterAdd", { object });
                  return composite;
                };
                Composite2.remove = function(composite, object, deep) {
                  var objects = [].concat(object);
                  Events2.trigger(composite, "beforeRemove", { object });
                  for (var i = 0; i < objects.length; i++) {
                    var obj = objects[i];
                    switch (obj.type) {
                      case "body":
                        Composite2.removeBody(composite, obj, deep);
                        break;
                      case "constraint":
                        Composite2.removeConstraint(composite, obj, deep);
                        break;
                      case "composite":
                        Composite2.removeComposite(composite, obj, deep);
                        break;
                      case "mouseConstraint":
                        Composite2.removeConstraint(composite, obj.constraint);
                        break;
                    }
                  }
                  Events2.trigger(composite, "afterRemove", { object });
                  return composite;
                };
                Composite2.addComposite = function(compositeA, compositeB) {
                  compositeA.composites.push(compositeB);
                  compositeB.parent = compositeA;
                  Composite2.setModified(compositeA, true, true, false);
                  return compositeA;
                };
                Composite2.removeComposite = function(compositeA, compositeB, deep) {
                  var position = Common.indexOf(compositeA.composites, compositeB);
                  if (position !== -1) {
                    var bodies = Composite2.allBodies(compositeB);
                    Composite2.removeCompositeAt(compositeA, position);
                    for (var i = 0; i < bodies.length; i++) {
                      bodies[i].sleepCounter = 0;
                    }
                  }
                  if (deep) {
                    for (var i = 0; i < compositeA.composites.length; i++) {
                      Composite2.removeComposite(compositeA.composites[i], compositeB, true);
                    }
                  }
                  return compositeA;
                };
                Composite2.removeCompositeAt = function(composite, position) {
                  composite.composites.splice(position, 1);
                  Composite2.setModified(composite, true, true, false);
                  return composite;
                };
                Composite2.addBody = function(composite, body) {
                  composite.bodies.push(body);
                  Composite2.setModified(composite, true, true, false);
                  return composite;
                };
                Composite2.removeBody = function(composite, body, deep) {
                  var position = Common.indexOf(composite.bodies, body);
                  if (position !== -1) {
                    Composite2.removeBodyAt(composite, position);
                    body.sleepCounter = 0;
                  }
                  if (deep) {
                    for (var i = 0; i < composite.composites.length; i++) {
                      Composite2.removeBody(composite.composites[i], body, true);
                    }
                  }
                  return composite;
                };
                Composite2.removeBodyAt = function(composite, position) {
                  composite.bodies.splice(position, 1);
                  Composite2.setModified(composite, true, true, false);
                  return composite;
                };
                Composite2.addConstraint = function(composite, constraint) {
                  composite.constraints.push(constraint);
                  Composite2.setModified(composite, true, true, false);
                  return composite;
                };
                Composite2.removeConstraint = function(composite, constraint, deep) {
                  var position = Common.indexOf(composite.constraints, constraint);
                  if (position !== -1) {
                    Composite2.removeConstraintAt(composite, position);
                  }
                  if (deep) {
                    for (var i = 0; i < composite.composites.length; i++) {
                      Composite2.removeConstraint(composite.composites[i], constraint, true);
                    }
                  }
                  return composite;
                };
                Composite2.removeConstraintAt = function(composite, position) {
                  composite.constraints.splice(position, 1);
                  Composite2.setModified(composite, true, true, false);
                  return composite;
                };
                Composite2.clear = function(composite, keepStatic, deep) {
                  if (deep) {
                    for (var i = 0; i < composite.composites.length; i++) {
                      Composite2.clear(composite.composites[i], keepStatic, true);
                    }
                  }
                  if (keepStatic) {
                    composite.bodies = composite.bodies.filter(function(body) {
                      return body.isStatic;
                    });
                  } else {
                    composite.bodies.length = 0;
                  }
                  composite.constraints.length = 0;
                  composite.composites.length = 0;
                  Composite2.setModified(composite, true, true, false);
                  return composite;
                };
                Composite2.allBodies = function(composite) {
                  if (composite.cache && composite.cache.allBodies) {
                    return composite.cache.allBodies;
                  }
                  var bodies = [].concat(composite.bodies);
                  for (var i = 0; i < composite.composites.length; i++)
                    bodies = bodies.concat(Composite2.allBodies(composite.composites[i]));
                  if (composite.cache) {
                    composite.cache.allBodies = bodies;
                  }
                  return bodies;
                };
                Composite2.allConstraints = function(composite) {
                  if (composite.cache && composite.cache.allConstraints) {
                    return composite.cache.allConstraints;
                  }
                  var constraints = [].concat(composite.constraints);
                  for (var i = 0; i < composite.composites.length; i++)
                    constraints = constraints.concat(Composite2.allConstraints(composite.composites[i]));
                  if (composite.cache) {
                    composite.cache.allConstraints = constraints;
                  }
                  return constraints;
                };
                Composite2.allComposites = function(composite) {
                  if (composite.cache && composite.cache.allComposites) {
                    return composite.cache.allComposites;
                  }
                  var composites = [].concat(composite.composites);
                  for (var i = 0; i < composite.composites.length; i++)
                    composites = composites.concat(Composite2.allComposites(composite.composites[i]));
                  if (composite.cache) {
                    composite.cache.allComposites = composites;
                  }
                  return composites;
                };
                Composite2.get = function(composite, id2, type) {
                  var objects, object;
                  switch (type) {
                    case "body":
                      objects = Composite2.allBodies(composite);
                      break;
                    case "constraint":
                      objects = Composite2.allConstraints(composite);
                      break;
                    case "composite":
                      objects = Composite2.allComposites(composite).concat(composite);
                      break;
                  }
                  if (!objects)
                    return null;
                  object = objects.filter(function(object2) {
                    return object2.id.toString() === id2.toString();
                  });
                  return object.length === 0 ? null : object[0];
                };
                Composite2.move = function(compositeA, objects, compositeB) {
                  Composite2.remove(compositeA, objects);
                  Composite2.add(compositeB, objects);
                  return compositeA;
                };
                Composite2.rebase = function(composite) {
                  var objects = Composite2.allBodies(composite).concat(Composite2.allConstraints(composite)).concat(Composite2.allComposites(composite));
                  for (var i = 0; i < objects.length; i++) {
                    objects[i].id = Common.nextId();
                  }
                  return composite;
                };
                Composite2.translate = function(composite, translation, recursive) {
                  var bodies = recursive ? Composite2.allBodies(composite) : composite.bodies;
                  for (var i = 0; i < bodies.length; i++) {
                    Body2.translate(bodies[i], translation);
                  }
                  return composite;
                };
                Composite2.rotate = function(composite, rotation, point2, recursive) {
                  var cos = Math.cos(rotation), sin = Math.sin(rotation), bodies = recursive ? Composite2.allBodies(composite) : composite.bodies;
                  for (var i = 0; i < bodies.length; i++) {
                    var body = bodies[i], dx = body.position.x - point2.x, dy = body.position.y - point2.y;
                    Body2.setPosition(body, {
                      x: point2.x + (dx * cos - dy * sin),
                      y: point2.y + (dx * sin + dy * cos)
                    });
                    Body2.rotate(body, rotation);
                  }
                  return composite;
                };
                Composite2.scale = function(composite, scaleX, scaleY, point2, recursive) {
                  var bodies = recursive ? Composite2.allBodies(composite) : composite.bodies;
                  for (var i = 0; i < bodies.length; i++) {
                    var body = bodies[i], dx = body.position.x - point2.x, dy = body.position.y - point2.y;
                    Body2.setPosition(body, {
                      x: point2.x + dx * scaleX,
                      y: point2.y + dy * scaleY
                    });
                    Body2.scale(body, scaleX, scaleY);
                  }
                  return composite;
                };
                Composite2.bounds = function(composite) {
                  var bodies = Composite2.allBodies(composite), vertices = [];
                  for (var i = 0; i < bodies.length; i += 1) {
                    var body = bodies[i];
                    vertices.push(body.bounds.min, body.bounds.max);
                  }
                  return Bounds.create(vertices);
                };
              })();
            }),
            /* 7 */
            /***/
            (function(module2, exports2, __webpack_require__) {
              var Sleeping = {};
              module2.exports = Sleeping;
              var Body2 = __webpack_require__(4);
              var Events2 = __webpack_require__(5);
              var Common = __webpack_require__(0);
              (function() {
                Sleeping._motionWakeThreshold = 0.18;
                Sleeping._motionSleepThreshold = 0.08;
                Sleeping._minBias = 0.9;
                Sleeping.update = function(bodies, delta) {
                  var timeScale = delta / Common._baseDelta, motionSleepThreshold = Sleeping._motionSleepThreshold;
                  for (var i = 0; i < bodies.length; i++) {
                    var body = bodies[i], speed = Body2.getSpeed(body), angularSpeed = Body2.getAngularSpeed(body), motion = speed * speed + angularSpeed * angularSpeed;
                    if (body.force.x !== 0 || body.force.y !== 0) {
                      Sleeping.set(body, false);
                      continue;
                    }
                    var minMotion = Math.min(body.motion, motion), maxMotion = Math.max(body.motion, motion);
                    body.motion = Sleeping._minBias * minMotion + (1 - Sleeping._minBias) * maxMotion;
                    if (body.sleepThreshold > 0 && body.motion < motionSleepThreshold) {
                      body.sleepCounter += 1;
                      if (body.sleepCounter >= body.sleepThreshold / timeScale) {
                        Sleeping.set(body, true);
                      }
                    } else if (body.sleepCounter > 0) {
                      body.sleepCounter -= 1;
                    }
                  }
                };
                Sleeping.afterCollisions = function(pairs) {
                  var motionSleepThreshold = Sleeping._motionSleepThreshold;
                  for (var i = 0; i < pairs.length; i++) {
                    var pair = pairs[i];
                    if (!pair.isActive)
                      continue;
                    var collision = pair.collision, bodyA = collision.bodyA.parent, bodyB = collision.bodyB.parent;
                    if (bodyA.isSleeping && bodyB.isSleeping || bodyA.isStatic || bodyB.isStatic)
                      continue;
                    if (bodyA.isSleeping || bodyB.isSleeping) {
                      var sleepingBody = bodyA.isSleeping && !bodyA.isStatic ? bodyA : bodyB, movingBody = sleepingBody === bodyA ? bodyB : bodyA;
                      if (!sleepingBody.isStatic && movingBody.motion > motionSleepThreshold) {
                        Sleeping.set(sleepingBody, false);
                      }
                    }
                  }
                };
                Sleeping.set = function(body, isSleeping) {
                  var wasSleeping = body.isSleeping;
                  if (isSleeping) {
                    body.isSleeping = true;
                    body.sleepCounter = body.sleepThreshold;
                    body.positionImpulse.x = 0;
                    body.positionImpulse.y = 0;
                    body.positionPrev.x = body.position.x;
                    body.positionPrev.y = body.position.y;
                    body.anglePrev = body.angle;
                    body.speed = 0;
                    body.angularSpeed = 0;
                    body.motion = 0;
                    if (!wasSleeping) {
                      Events2.trigger(body, "sleepStart");
                    }
                  } else {
                    body.isSleeping = false;
                    body.sleepCounter = 0;
                    if (wasSleeping) {
                      Events2.trigger(body, "sleepEnd");
                    }
                  }
                };
              })();
            }),
            /* 8 */
            /***/
            (function(module2, exports2, __webpack_require__) {
              var Collision = {};
              module2.exports = Collision;
              var Vertices = __webpack_require__(3);
              var Pair = __webpack_require__(9);
              (function() {
                var _supports = [];
                var _overlapAB = {
                  overlap: 0,
                  axis: null
                };
                var _overlapBA = {
                  overlap: 0,
                  axis: null
                };
                Collision.create = function(bodyA, bodyB) {
                  return {
                    pair: null,
                    collided: false,
                    bodyA,
                    bodyB,
                    parentA: bodyA.parent,
                    parentB: bodyB.parent,
                    depth: 0,
                    normal: { x: 0, y: 0 },
                    tangent: { x: 0, y: 0 },
                    penetration: { x: 0, y: 0 },
                    supports: [null, null],
                    supportCount: 0
                  };
                };
                Collision.collides = function(bodyA, bodyB, pairs) {
                  Collision._overlapAxes(_overlapAB, bodyA.vertices, bodyB.vertices, bodyA.axes);
                  if (_overlapAB.overlap <= 0) {
                    return null;
                  }
                  Collision._overlapAxes(_overlapBA, bodyB.vertices, bodyA.vertices, bodyB.axes);
                  if (_overlapBA.overlap <= 0) {
                    return null;
                  }
                  var pair = pairs && pairs.table[Pair.id(bodyA, bodyB)], collision;
                  if (!pair) {
                    collision = Collision.create(bodyA, bodyB);
                    collision.collided = true;
                    collision.bodyA = bodyA.id < bodyB.id ? bodyA : bodyB;
                    collision.bodyB = bodyA.id < bodyB.id ? bodyB : bodyA;
                    collision.parentA = collision.bodyA.parent;
                    collision.parentB = collision.bodyB.parent;
                  } else {
                    collision = pair.collision;
                  }
                  bodyA = collision.bodyA;
                  bodyB = collision.bodyB;
                  var minOverlap;
                  if (_overlapAB.overlap < _overlapBA.overlap) {
                    minOverlap = _overlapAB;
                  } else {
                    minOverlap = _overlapBA;
                  }
                  var normal = collision.normal, tangent = collision.tangent, penetration = collision.penetration, supports = collision.supports, depth = minOverlap.overlap, minAxis = minOverlap.axis, normalX = minAxis.x, normalY = minAxis.y, deltaX = bodyB.position.x - bodyA.position.x, deltaY = bodyB.position.y - bodyA.position.y;
                  if (normalX * deltaX + normalY * deltaY >= 0) {
                    normalX = -normalX;
                    normalY = -normalY;
                  }
                  normal.x = normalX;
                  normal.y = normalY;
                  tangent.x = -normalY;
                  tangent.y = normalX;
                  penetration.x = normalX * depth;
                  penetration.y = normalY * depth;
                  collision.depth = depth;
                  var supportsB = Collision._findSupports(bodyA, bodyB, normal, 1), supportCount = 0;
                  if (Vertices.contains(bodyA.vertices, supportsB[0])) {
                    supports[supportCount++] = supportsB[0];
                  }
                  if (Vertices.contains(bodyA.vertices, supportsB[1])) {
                    supports[supportCount++] = supportsB[1];
                  }
                  if (supportCount < 2) {
                    var supportsA = Collision._findSupports(bodyB, bodyA, normal, -1);
                    if (Vertices.contains(bodyB.vertices, supportsA[0])) {
                      supports[supportCount++] = supportsA[0];
                    }
                    if (supportCount < 2 && Vertices.contains(bodyB.vertices, supportsA[1])) {
                      supports[supportCount++] = supportsA[1];
                    }
                  }
                  if (supportCount === 0) {
                    supports[supportCount++] = supportsB[0];
                  }
                  collision.supportCount = supportCount;
                  return collision;
                };
                Collision._overlapAxes = function(result, verticesA, verticesB, axes) {
                  var verticesALength = verticesA.length, verticesBLength = verticesB.length, verticesAX = verticesA[0].x, verticesAY = verticesA[0].y, verticesBX = verticesB[0].x, verticesBY = verticesB[0].y, axesLength = axes.length, overlapMin = Number.MAX_VALUE, overlapAxisNumber = 0, overlap, overlapAB, overlapBA, dot, i, j;
                  for (i = 0; i < axesLength; i++) {
                    var axis = axes[i], axisX = axis.x, axisY = axis.y, minA = verticesAX * axisX + verticesAY * axisY, minB = verticesBX * axisX + verticesBY * axisY, maxA = minA, maxB = minB;
                    for (j = 1; j < verticesALength; j += 1) {
                      dot = verticesA[j].x * axisX + verticesA[j].y * axisY;
                      if (dot > maxA) {
                        maxA = dot;
                      } else if (dot < minA) {
                        minA = dot;
                      }
                    }
                    for (j = 1; j < verticesBLength; j += 1) {
                      dot = verticesB[j].x * axisX + verticesB[j].y * axisY;
                      if (dot > maxB) {
                        maxB = dot;
                      } else if (dot < minB) {
                        minB = dot;
                      }
                    }
                    overlapAB = maxA - minB;
                    overlapBA = maxB - minA;
                    overlap = overlapAB < overlapBA ? overlapAB : overlapBA;
                    if (overlap < overlapMin) {
                      overlapMin = overlap;
                      overlapAxisNumber = i;
                      if (overlap <= 0) {
                        break;
                      }
                    }
                  }
                  result.axis = axes[overlapAxisNumber];
                  result.overlap = overlapMin;
                };
                Collision._findSupports = function(bodyA, bodyB, normal, direction) {
                  var vertices = bodyB.vertices, verticesLength = vertices.length, bodyAPositionX = bodyA.position.x, bodyAPositionY = bodyA.position.y, normalX = normal.x * direction, normalY = normal.y * direction, vertexA = vertices[0], vertexB = vertexA, nearestDistance = normalX * (bodyAPositionX - vertexB.x) + normalY * (bodyAPositionY - vertexB.y), vertexC, distance4, j;
                  for (j = 1; j < verticesLength; j += 1) {
                    vertexB = vertices[j];
                    distance4 = normalX * (bodyAPositionX - vertexB.x) + normalY * (bodyAPositionY - vertexB.y);
                    if (distance4 < nearestDistance) {
                      nearestDistance = distance4;
                      vertexA = vertexB;
                    }
                  }
                  vertexC = vertices[(verticesLength + vertexA.index - 1) % verticesLength];
                  nearestDistance = normalX * (bodyAPositionX - vertexC.x) + normalY * (bodyAPositionY - vertexC.y);
                  vertexB = vertices[(vertexA.index + 1) % verticesLength];
                  if (normalX * (bodyAPositionX - vertexB.x) + normalY * (bodyAPositionY - vertexB.y) < nearestDistance) {
                    _supports[0] = vertexA;
                    _supports[1] = vertexB;
                    return _supports;
                  }
                  _supports[0] = vertexA;
                  _supports[1] = vertexC;
                  return _supports;
                };
              })();
            }),
            /* 9 */
            /***/
            (function(module2, exports2, __webpack_require__) {
              var Pair = {};
              module2.exports = Pair;
              var Contact = __webpack_require__(16);
              (function() {
                Pair.create = function(collision, timestamp) {
                  var bodyA = collision.bodyA, bodyB = collision.bodyB;
                  var pair = {
                    id: Pair.id(bodyA, bodyB),
                    bodyA,
                    bodyB,
                    collision,
                    contacts: [Contact.create(), Contact.create()],
                    contactCount: 0,
                    separation: 0,
                    isActive: true,
                    isSensor: bodyA.isSensor || bodyB.isSensor,
                    timeCreated: timestamp,
                    timeUpdated: timestamp,
                    inverseMass: 0,
                    friction: 0,
                    frictionStatic: 0,
                    restitution: 0,
                    slop: 0
                  };
                  Pair.update(pair, collision, timestamp);
                  return pair;
                };
                Pair.update = function(pair, collision, timestamp) {
                  var supports = collision.supports, supportCount = collision.supportCount, contacts = pair.contacts, parentA = collision.parentA, parentB = collision.parentB;
                  pair.isActive = true;
                  pair.timeUpdated = timestamp;
                  pair.collision = collision;
                  pair.separation = collision.depth;
                  pair.inverseMass = parentA.inverseMass + parentB.inverseMass;
                  pair.friction = parentA.friction < parentB.friction ? parentA.friction : parentB.friction;
                  pair.frictionStatic = parentA.frictionStatic > parentB.frictionStatic ? parentA.frictionStatic : parentB.frictionStatic;
                  pair.restitution = parentA.restitution > parentB.restitution ? parentA.restitution : parentB.restitution;
                  pair.slop = parentA.slop > parentB.slop ? parentA.slop : parentB.slop;
                  pair.contactCount = supportCount;
                  collision.pair = pair;
                  var supportA = supports[0], contactA = contacts[0], supportB = supports[1], contactB = contacts[1];
                  if (contactB.vertex === supportA || contactA.vertex === supportB) {
                    contacts[1] = contactA;
                    contacts[0] = contactA = contactB;
                    contactB = contacts[1];
                  }
                  contactA.vertex = supportA;
                  contactB.vertex = supportB;
                };
                Pair.setActive = function(pair, isActive, timestamp) {
                  if (isActive) {
                    pair.isActive = true;
                    pair.timeUpdated = timestamp;
                  } else {
                    pair.isActive = false;
                    pair.contactCount = 0;
                  }
                };
                Pair.id = function(bodyA, bodyB) {
                  return bodyA.id < bodyB.id ? bodyA.id.toString(36) + ":" + bodyB.id.toString(36) : bodyB.id.toString(36) + ":" + bodyA.id.toString(36);
                };
              })();
            }),
            /* 10 */
            /***/
            (function(module2, exports2, __webpack_require__) {
              var Constraint = {};
              module2.exports = Constraint;
              var Vertices = __webpack_require__(3);
              var Vector = __webpack_require__(2);
              var Sleeping = __webpack_require__(7);
              var Bounds = __webpack_require__(1);
              var Axes = __webpack_require__(11);
              var Common = __webpack_require__(0);
              (function() {
                Constraint._warming = 0.4;
                Constraint._torqueDampen = 1;
                Constraint._minLength = 1e-6;
                Constraint.create = function(options) {
                  var constraint = options;
                  if (constraint.bodyA && !constraint.pointA)
                    constraint.pointA = { x: 0, y: 0 };
                  if (constraint.bodyB && !constraint.pointB)
                    constraint.pointB = { x: 0, y: 0 };
                  var initialPointA = constraint.bodyA ? Vector.add(constraint.bodyA.position, constraint.pointA) : constraint.pointA, initialPointB = constraint.bodyB ? Vector.add(constraint.bodyB.position, constraint.pointB) : constraint.pointB, length = Vector.magnitude(Vector.sub(initialPointA, initialPointB));
                  constraint.length = typeof constraint.length !== "undefined" ? constraint.length : length;
                  constraint.id = constraint.id || Common.nextId();
                  constraint.label = constraint.label || "Constraint";
                  constraint.type = "constraint";
                  constraint.stiffness = constraint.stiffness || (constraint.length > 0 ? 1 : 0.7);
                  constraint.damping = constraint.damping || 0;
                  constraint.angularStiffness = constraint.angularStiffness || 0;
                  constraint.angleA = constraint.bodyA ? constraint.bodyA.angle : constraint.angleA;
                  constraint.angleB = constraint.bodyB ? constraint.bodyB.angle : constraint.angleB;
                  constraint.plugin = {};
                  var render = {
                    visible: true,
                    lineWidth: 2,
                    strokeStyle: "#ffffff",
                    type: "line",
                    anchors: true
                  };
                  if (constraint.length === 0 && constraint.stiffness > 0.1) {
                    render.type = "pin";
                    render.anchors = false;
                  } else if (constraint.stiffness < 0.9) {
                    render.type = "spring";
                  }
                  constraint.render = Common.extend(render, constraint.render);
                  return constraint;
                };
                Constraint.preSolveAll = function(bodies) {
                  for (var i = 0; i < bodies.length; i += 1) {
                    var body = bodies[i], impulse = body.constraintImpulse;
                    if (body.isStatic || impulse.x === 0 && impulse.y === 0 && impulse.angle === 0) {
                      continue;
                    }
                    body.position.x += impulse.x;
                    body.position.y += impulse.y;
                    body.angle += impulse.angle;
                  }
                };
                Constraint.solveAll = function(constraints, delta) {
                  var timeScale = Common.clamp(delta / Common._baseDelta, 0, 1);
                  for (var i = 0; i < constraints.length; i += 1) {
                    var constraint = constraints[i], fixedA = !constraint.bodyA || constraint.bodyA && constraint.bodyA.isStatic, fixedB = !constraint.bodyB || constraint.bodyB && constraint.bodyB.isStatic;
                    if (fixedA || fixedB) {
                      Constraint.solve(constraints[i], timeScale);
                    }
                  }
                  for (i = 0; i < constraints.length; i += 1) {
                    constraint = constraints[i];
                    fixedA = !constraint.bodyA || constraint.bodyA && constraint.bodyA.isStatic;
                    fixedB = !constraint.bodyB || constraint.bodyB && constraint.bodyB.isStatic;
                    if (!fixedA && !fixedB) {
                      Constraint.solve(constraints[i], timeScale);
                    }
                  }
                };
                Constraint.solve = function(constraint, timeScale) {
                  var bodyA = constraint.bodyA, bodyB = constraint.bodyB, pointA = constraint.pointA, pointB = constraint.pointB;
                  if (!bodyA && !bodyB)
                    return;
                  if (bodyA && !bodyA.isStatic) {
                    Vector.rotate(pointA, bodyA.angle - constraint.angleA, pointA);
                    constraint.angleA = bodyA.angle;
                  }
                  if (bodyB && !bodyB.isStatic) {
                    Vector.rotate(pointB, bodyB.angle - constraint.angleB, pointB);
                    constraint.angleB = bodyB.angle;
                  }
                  var pointAWorld = pointA, pointBWorld = pointB;
                  if (bodyA) pointAWorld = Vector.add(bodyA.position, pointA);
                  if (bodyB) pointBWorld = Vector.add(bodyB.position, pointB);
                  if (!pointAWorld || !pointBWorld)
                    return;
                  var delta = Vector.sub(pointAWorld, pointBWorld), currentLength = Vector.magnitude(delta);
                  if (currentLength < Constraint._minLength) {
                    currentLength = Constraint._minLength;
                  }
                  var difference = (currentLength - constraint.length) / currentLength, isRigid = constraint.stiffness >= 1 || constraint.length === 0, stiffness = isRigid ? constraint.stiffness * timeScale : constraint.stiffness * timeScale * timeScale, damping = constraint.damping * timeScale, force = Vector.mult(delta, difference * stiffness), massTotal = (bodyA ? bodyA.inverseMass : 0) + (bodyB ? bodyB.inverseMass : 0), inertiaTotal = (bodyA ? bodyA.inverseInertia : 0) + (bodyB ? bodyB.inverseInertia : 0), resistanceTotal = massTotal + inertiaTotal, torque, share, normal, normalVelocity, relativeVelocity;
                  if (damping > 0) {
                    var zero = Vector.create();
                    normal = Vector.div(delta, currentLength);
                    relativeVelocity = Vector.sub(
                      bodyB && Vector.sub(bodyB.position, bodyB.positionPrev) || zero,
                      bodyA && Vector.sub(bodyA.position, bodyA.positionPrev) || zero
                    );
                    normalVelocity = Vector.dot(normal, relativeVelocity);
                  }
                  if (bodyA && !bodyA.isStatic) {
                    share = bodyA.inverseMass / massTotal;
                    bodyA.constraintImpulse.x -= force.x * share;
                    bodyA.constraintImpulse.y -= force.y * share;
                    bodyA.position.x -= force.x * share;
                    bodyA.position.y -= force.y * share;
                    if (damping > 0) {
                      bodyA.positionPrev.x -= damping * normal.x * normalVelocity * share;
                      bodyA.positionPrev.y -= damping * normal.y * normalVelocity * share;
                    }
                    torque = Vector.cross(pointA, force) / resistanceTotal * Constraint._torqueDampen * bodyA.inverseInertia * (1 - constraint.angularStiffness);
                    bodyA.constraintImpulse.angle -= torque;
                    bodyA.angle -= torque;
                  }
                  if (bodyB && !bodyB.isStatic) {
                    share = bodyB.inverseMass / massTotal;
                    bodyB.constraintImpulse.x += force.x * share;
                    bodyB.constraintImpulse.y += force.y * share;
                    bodyB.position.x += force.x * share;
                    bodyB.position.y += force.y * share;
                    if (damping > 0) {
                      bodyB.positionPrev.x += damping * normal.x * normalVelocity * share;
                      bodyB.positionPrev.y += damping * normal.y * normalVelocity * share;
                    }
                    torque = Vector.cross(pointB, force) / resistanceTotal * Constraint._torqueDampen * bodyB.inverseInertia * (1 - constraint.angularStiffness);
                    bodyB.constraintImpulse.angle += torque;
                    bodyB.angle += torque;
                  }
                };
                Constraint.postSolveAll = function(bodies) {
                  for (var i = 0; i < bodies.length; i++) {
                    var body = bodies[i], impulse = body.constraintImpulse;
                    if (body.isStatic || impulse.x === 0 && impulse.y === 0 && impulse.angle === 0) {
                      continue;
                    }
                    Sleeping.set(body, false);
                    for (var j = 0; j < body.parts.length; j++) {
                      var part = body.parts[j];
                      Vertices.translate(part.vertices, impulse);
                      if (j > 0) {
                        part.position.x += impulse.x;
                        part.position.y += impulse.y;
                      }
                      if (impulse.angle !== 0) {
                        Vertices.rotate(part.vertices, impulse.angle, body.position);
                        Axes.rotate(part.axes, impulse.angle);
                        if (j > 0) {
                          Vector.rotateAbout(part.position, impulse.angle, body.position, part.position);
                        }
                      }
                      Bounds.update(part.bounds, part.vertices, body.velocity);
                    }
                    impulse.angle *= Constraint._warming;
                    impulse.x *= Constraint._warming;
                    impulse.y *= Constraint._warming;
                  }
                };
                Constraint.pointAWorld = function(constraint) {
                  return {
                    x: (constraint.bodyA ? constraint.bodyA.position.x : 0) + (constraint.pointA ? constraint.pointA.x : 0),
                    y: (constraint.bodyA ? constraint.bodyA.position.y : 0) + (constraint.pointA ? constraint.pointA.y : 0)
                  };
                };
                Constraint.pointBWorld = function(constraint) {
                  return {
                    x: (constraint.bodyB ? constraint.bodyB.position.x : 0) + (constraint.pointB ? constraint.pointB.x : 0),
                    y: (constraint.bodyB ? constraint.bodyB.position.y : 0) + (constraint.pointB ? constraint.pointB.y : 0)
                  };
                };
                Constraint.currentLength = function(constraint) {
                  var pointAX = (constraint.bodyA ? constraint.bodyA.position.x : 0) + (constraint.pointA ? constraint.pointA.x : 0);
                  var pointAY = (constraint.bodyA ? constraint.bodyA.position.y : 0) + (constraint.pointA ? constraint.pointA.y : 0);
                  var pointBX = (constraint.bodyB ? constraint.bodyB.position.x : 0) + (constraint.pointB ? constraint.pointB.x : 0);
                  var pointBY = (constraint.bodyB ? constraint.bodyB.position.y : 0) + (constraint.pointB ? constraint.pointB.y : 0);
                  var deltaX = pointAX - pointBX;
                  var deltaY = pointAY - pointBY;
                  return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
                };
              })();
            }),
            /* 11 */
            /***/
            (function(module2, exports2, __webpack_require__) {
              var Axes = {};
              module2.exports = Axes;
              var Vector = __webpack_require__(2);
              var Common = __webpack_require__(0);
              (function() {
                Axes.fromVertices = function(vertices) {
                  var axes = {};
                  for (var i = 0; i < vertices.length; i++) {
                    var j = (i + 1) % vertices.length, normal = Vector.normalise({
                      x: vertices[j].y - vertices[i].y,
                      y: vertices[i].x - vertices[j].x
                    }), gradient = normal.y === 0 ? Infinity : normal.x / normal.y;
                    gradient = gradient.toFixed(3).toString();
                    axes[gradient] = normal;
                  }
                  return Common.values(axes);
                };
                Axes.rotate = function(axes, angle) {
                  if (angle === 0)
                    return;
                  var cos = Math.cos(angle), sin = Math.sin(angle);
                  for (var i = 0; i < axes.length; i++) {
                    var axis = axes[i], xx;
                    xx = axis.x * cos - axis.y * sin;
                    axis.y = axis.x * sin + axis.y * cos;
                    axis.x = xx;
                  }
                };
              })();
            }),
            /* 12 */
            /***/
            (function(module2, exports2, __webpack_require__) {
              var Bodies2 = {};
              module2.exports = Bodies2;
              var Vertices = __webpack_require__(3);
              var Common = __webpack_require__(0);
              var Body2 = __webpack_require__(4);
              var Bounds = __webpack_require__(1);
              var Vector = __webpack_require__(2);
              (function() {
                Bodies2.rectangle = function(x, y, width, height, options) {
                  options = options || {};
                  var rectangle = {
                    label: "Rectangle Body",
                    position: { x, y },
                    vertices: Vertices.fromPath("L 0 0 L " + width + " 0 L " + width + " " + height + " L 0 " + height)
                  };
                  if (options.chamfer) {
                    var chamfer = options.chamfer;
                    rectangle.vertices = Vertices.chamfer(
                      rectangle.vertices,
                      chamfer.radius,
                      chamfer.quality,
                      chamfer.qualityMin,
                      chamfer.qualityMax
                    );
                    delete options.chamfer;
                  }
                  return Body2.create(Common.extend({}, rectangle, options));
                };
                Bodies2.trapezoid = function(x, y, width, height, slope, options) {
                  options = options || {};
                  if (slope >= 1) {
                    Common.warn("Bodies.trapezoid: slope parameter must be < 1.");
                  }
                  slope *= 0.5;
                  var roof = (1 - slope * 2) * width;
                  var x1 = width * slope, x2 = x1 + roof, x3 = x2 + x1, verticesPath;
                  if (slope < 0.5) {
                    verticesPath = "L 0 0 L " + x1 + " " + -height + " L " + x2 + " " + -height + " L " + x3 + " 0";
                  } else {
                    verticesPath = "L 0 0 L " + x2 + " " + -height + " L " + x3 + " 0";
                  }
                  var trapezoid = {
                    label: "Trapezoid Body",
                    position: { x, y },
                    vertices: Vertices.fromPath(verticesPath)
                  };
                  if (options.chamfer) {
                    var chamfer = options.chamfer;
                    trapezoid.vertices = Vertices.chamfer(
                      trapezoid.vertices,
                      chamfer.radius,
                      chamfer.quality,
                      chamfer.qualityMin,
                      chamfer.qualityMax
                    );
                    delete options.chamfer;
                  }
                  return Body2.create(Common.extend({}, trapezoid, options));
                };
                Bodies2.circle = function(x, y, radius2, options, maxSides) {
                  options = options || {};
                  var circle2 = {
                    label: "Circle Body",
                    circleRadius: radius2
                  };
                  maxSides = maxSides || 25;
                  var sides = Math.ceil(Math.max(10, Math.min(maxSides, radius2)));
                  if (sides % 2 === 1)
                    sides += 1;
                  return Bodies2.polygon(x, y, sides, radius2, Common.extend({}, circle2, options));
                };
                Bodies2.polygon = function(x, y, sides, radius2, options) {
                  options = options || {};
                  if (sides < 3)
                    return Bodies2.circle(x, y, radius2, options);
                  var theta = 2 * Math.PI / sides, path = "", offset = theta * 0.5;
                  for (var i = 0; i < sides; i += 1) {
                    var angle = offset + i * theta, xx = Math.cos(angle) * radius2, yy = Math.sin(angle) * radius2;
                    path += "L " + xx.toFixed(3) + " " + yy.toFixed(3) + " ";
                  }
                  var polygon2 = {
                    label: "Polygon Body",
                    position: { x, y },
                    vertices: Vertices.fromPath(path)
                  };
                  if (options.chamfer) {
                    var chamfer = options.chamfer;
                    polygon2.vertices = Vertices.chamfer(
                      polygon2.vertices,
                      chamfer.radius,
                      chamfer.quality,
                      chamfer.qualityMin,
                      chamfer.qualityMax
                    );
                    delete options.chamfer;
                  }
                  return Body2.create(Common.extend({}, polygon2, options));
                };
                Bodies2.fromVertices = function(x, y, vertexSets, options, flagInternal, removeCollinear, minimumArea, removeDuplicatePoints) {
                  var decomp = Common.getDecomp(), canDecomp, body, parts, isConvex, isConcave, vertices, i, j, k, v, z;
                  canDecomp = Boolean(decomp && decomp.quickDecomp);
                  options = options || {};
                  parts = [];
                  flagInternal = typeof flagInternal !== "undefined" ? flagInternal : false;
                  removeCollinear = typeof removeCollinear !== "undefined" ? removeCollinear : 0.01;
                  minimumArea = typeof minimumArea !== "undefined" ? minimumArea : 10;
                  removeDuplicatePoints = typeof removeDuplicatePoints !== "undefined" ? removeDuplicatePoints : 0.01;
                  if (!Common.isArray(vertexSets[0])) {
                    vertexSets = [vertexSets];
                  }
                  for (v = 0; v < vertexSets.length; v += 1) {
                    vertices = vertexSets[v];
                    isConvex = Vertices.isConvex(vertices);
                    isConcave = !isConvex;
                    if (isConcave && !canDecomp) {
                      Common.warnOnce(
                        "Bodies.fromVertices: Install the 'poly-decomp' library and use Common.setDecomp or provide 'decomp' as a global to decompose concave vertices."
                      );
                    }
                    if (isConvex || !canDecomp) {
                      if (isConvex) {
                        vertices = Vertices.clockwiseSort(vertices);
                      } else {
                        vertices = Vertices.hull(vertices);
                      }
                      parts.push({
                        position: { x, y },
                        vertices
                      });
                    } else {
                      var concave = vertices.map(function(vertex) {
                        return [vertex.x, vertex.y];
                      });
                      decomp.makeCCW(concave);
                      if (removeCollinear !== false)
                        decomp.removeCollinearPoints(concave, removeCollinear);
                      if (removeDuplicatePoints !== false && decomp.removeDuplicatePoints)
                        decomp.removeDuplicatePoints(concave, removeDuplicatePoints);
                      var decomposed = decomp.quickDecomp(concave);
                      for (i = 0; i < decomposed.length; i++) {
                        var chunk = decomposed[i];
                        var chunkVertices = chunk.map(function(vertices2) {
                          return {
                            x: vertices2[0],
                            y: vertices2[1]
                          };
                        });
                        if (minimumArea > 0 && Vertices.area(chunkVertices) < minimumArea)
                          continue;
                        parts.push({
                          position: Vertices.centre(chunkVertices),
                          vertices: chunkVertices
                        });
                      }
                    }
                  }
                  for (i = 0; i < parts.length; i++) {
                    parts[i] = Body2.create(Common.extend(parts[i], options));
                  }
                  if (flagInternal) {
                    var coincident_max_dist = 5;
                    for (i = 0; i < parts.length; i++) {
                      var partA = parts[i];
                      for (j = i + 1; j < parts.length; j++) {
                        var partB = parts[j];
                        if (Bounds.overlaps(partA.bounds, partB.bounds)) {
                          var pav = partA.vertices, pbv = partB.vertices;
                          for (k = 0; k < partA.vertices.length; k++) {
                            for (z = 0; z < partB.vertices.length; z++) {
                              var da = Vector.magnitudeSquared(Vector.sub(pav[(k + 1) % pav.length], pbv[z])), db = Vector.magnitudeSquared(Vector.sub(pav[k], pbv[(z + 1) % pbv.length]));
                              if (da < coincident_max_dist && db < coincident_max_dist) {
                                pav[k].isInternal = true;
                                pbv[z].isInternal = true;
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                  if (parts.length > 1) {
                    body = Body2.create(Common.extend({ parts: parts.slice(0) }, options));
                    Body2.setPosition(body, { x, y });
                    return body;
                  } else {
                    return parts[0];
                  }
                };
              })();
            }),
            /* 13 */
            /***/
            (function(module2, exports2, __webpack_require__) {
              var Detector = {};
              module2.exports = Detector;
              var Common = __webpack_require__(0);
              var Collision = __webpack_require__(8);
              (function() {
                Detector.create = function(options) {
                  var defaults = {
                    bodies: [],
                    collisions: [],
                    pairs: null
                  };
                  return Common.extend(defaults, options);
                };
                Detector.setBodies = function(detector, bodies) {
                  detector.bodies = bodies.slice(0);
                };
                Detector.clear = function(detector) {
                  detector.bodies = [];
                  detector.collisions = [];
                };
                Detector.collisions = function(detector) {
                  var pairs = detector.pairs, bodies = detector.bodies, bodiesLength = bodies.length, canCollide = Detector.canCollide, collides = Collision.collides, collisions = detector.collisions, collisionIndex = 0, i, j;
                  bodies.sort(Detector._compareBoundsX);
                  for (i = 0; i < bodiesLength; i++) {
                    var bodyA = bodies[i], boundsA = bodyA.bounds, boundXMax = bodyA.bounds.max.x, boundYMax = bodyA.bounds.max.y, boundYMin = bodyA.bounds.min.y, bodyAStatic = bodyA.isStatic || bodyA.isSleeping, partsALength = bodyA.parts.length, partsASingle = partsALength === 1;
                    for (j = i + 1; j < bodiesLength; j++) {
                      var bodyB = bodies[j], boundsB = bodyB.bounds;
                      if (boundsB.min.x > boundXMax) {
                        break;
                      }
                      if (boundYMax < boundsB.min.y || boundYMin > boundsB.max.y) {
                        continue;
                      }
                      if (bodyAStatic && (bodyB.isStatic || bodyB.isSleeping)) {
                        continue;
                      }
                      if (!canCollide(bodyA.collisionFilter, bodyB.collisionFilter)) {
                        continue;
                      }
                      var partsBLength = bodyB.parts.length;
                      if (partsASingle && partsBLength === 1) {
                        var collision = collides(bodyA, bodyB, pairs);
                        if (collision) {
                          collisions[collisionIndex++] = collision;
                        }
                      } else {
                        var partsAStart = partsALength > 1 ? 1 : 0, partsBStart = partsBLength > 1 ? 1 : 0;
                        for (var k = partsAStart; k < partsALength; k++) {
                          var partA = bodyA.parts[k], boundsA = partA.bounds;
                          for (var z = partsBStart; z < partsBLength; z++) {
                            var partB = bodyB.parts[z], boundsB = partB.bounds;
                            if (boundsA.min.x > boundsB.max.x || boundsA.max.x < boundsB.min.x || boundsA.max.y < boundsB.min.y || boundsA.min.y > boundsB.max.y) {
                              continue;
                            }
                            var collision = collides(partA, partB, pairs);
                            if (collision) {
                              collisions[collisionIndex++] = collision;
                            }
                          }
                        }
                      }
                    }
                  }
                  if (collisions.length !== collisionIndex) {
                    collisions.length = collisionIndex;
                  }
                  return collisions;
                };
                Detector.canCollide = function(filterA, filterB) {
                  if (filterA.group === filterB.group && filterA.group !== 0)
                    return filterA.group > 0;
                  return (filterA.mask & filterB.category) !== 0 && (filterB.mask & filterA.category) !== 0;
                };
                Detector._compareBoundsX = function(bodyA, bodyB) {
                  return bodyA.bounds.min.x - bodyB.bounds.min.x;
                };
              })();
            }),
            /* 14 */
            /***/
            (function(module2, exports2, __webpack_require__) {
              var Mouse = {};
              module2.exports = Mouse;
              var Common = __webpack_require__(0);
              (function() {
                Mouse.create = function(element) {
                  var mouse = {};
                  if (!element) {
                    Common.log("Mouse.create: element was undefined, defaulting to document.body", "warn");
                  }
                  mouse.element = element || document.body;
                  mouse.absolute = { x: 0, y: 0 };
                  mouse.position = { x: 0, y: 0 };
                  mouse.mousedownPosition = { x: 0, y: 0 };
                  mouse.mouseupPosition = { x: 0, y: 0 };
                  mouse.offset = { x: 0, y: 0 };
                  mouse.scale = { x: 1, y: 1 };
                  mouse.wheelDelta = 0;
                  mouse.button = -1;
                  mouse.pixelRatio = parseInt(mouse.element.getAttribute("data-pixel-ratio"), 10) || 1;
                  mouse.sourceEvents = {
                    mousemove: null,
                    mousedown: null,
                    mouseup: null,
                    mousewheel: null
                  };
                  mouse.mousemove = function(event) {
                    var position = Mouse._getRelativeMousePosition(event, mouse.element, mouse.pixelRatio), touches = event.changedTouches;
                    if (touches) {
                      mouse.button = 0;
                      event.preventDefault();
                    }
                    mouse.absolute.x = position.x;
                    mouse.absolute.y = position.y;
                    mouse.position.x = mouse.absolute.x * mouse.scale.x + mouse.offset.x;
                    mouse.position.y = mouse.absolute.y * mouse.scale.y + mouse.offset.y;
                    mouse.sourceEvents.mousemove = event;
                  };
                  mouse.mousedown = function(event) {
                    var position = Mouse._getRelativeMousePosition(event, mouse.element, mouse.pixelRatio), touches = event.changedTouches;
                    if (touches) {
                      mouse.button = 0;
                      event.preventDefault();
                    } else {
                      mouse.button = event.button;
                    }
                    mouse.absolute.x = position.x;
                    mouse.absolute.y = position.y;
                    mouse.position.x = mouse.absolute.x * mouse.scale.x + mouse.offset.x;
                    mouse.position.y = mouse.absolute.y * mouse.scale.y + mouse.offset.y;
                    mouse.mousedownPosition.x = mouse.position.x;
                    mouse.mousedownPosition.y = mouse.position.y;
                    mouse.sourceEvents.mousedown = event;
                  };
                  mouse.mouseup = function(event) {
                    var position = Mouse._getRelativeMousePosition(event, mouse.element, mouse.pixelRatio), touches = event.changedTouches;
                    if (touches) {
                      event.preventDefault();
                    }
                    mouse.button = -1;
                    mouse.absolute.x = position.x;
                    mouse.absolute.y = position.y;
                    mouse.position.x = mouse.absolute.x * mouse.scale.x + mouse.offset.x;
                    mouse.position.y = mouse.absolute.y * mouse.scale.y + mouse.offset.y;
                    mouse.mouseupPosition.x = mouse.position.x;
                    mouse.mouseupPosition.y = mouse.position.y;
                    mouse.sourceEvents.mouseup = event;
                  };
                  mouse.mousewheel = function(event) {
                    mouse.wheelDelta = Math.max(-1, Math.min(1, event.wheelDelta || -event.detail));
                    event.preventDefault();
                    mouse.sourceEvents.mousewheel = event;
                  };
                  Mouse.setElement(mouse, mouse.element);
                  return mouse;
                };
                Mouse.setElement = function(mouse, element) {
                  mouse.element = element;
                  element.addEventListener("mousemove", mouse.mousemove, { passive: true });
                  element.addEventListener("mousedown", mouse.mousedown, { passive: true });
                  element.addEventListener("mouseup", mouse.mouseup, { passive: true });
                  element.addEventListener("wheel", mouse.mousewheel, { passive: false });
                  element.addEventListener("touchmove", mouse.mousemove, { passive: false });
                  element.addEventListener("touchstart", mouse.mousedown, { passive: false });
                  element.addEventListener("touchend", mouse.mouseup, { passive: false });
                };
                Mouse.clearSourceEvents = function(mouse) {
                  mouse.sourceEvents.mousemove = null;
                  mouse.sourceEvents.mousedown = null;
                  mouse.sourceEvents.mouseup = null;
                  mouse.sourceEvents.mousewheel = null;
                  mouse.wheelDelta = 0;
                };
                Mouse.setOffset = function(mouse, offset) {
                  mouse.offset.x = offset.x;
                  mouse.offset.y = offset.y;
                  mouse.position.x = mouse.absolute.x * mouse.scale.x + mouse.offset.x;
                  mouse.position.y = mouse.absolute.y * mouse.scale.y + mouse.offset.y;
                };
                Mouse.setScale = function(mouse, scale) {
                  mouse.scale.x = scale.x;
                  mouse.scale.y = scale.y;
                  mouse.position.x = mouse.absolute.x * mouse.scale.x + mouse.offset.x;
                  mouse.position.y = mouse.absolute.y * mouse.scale.y + mouse.offset.y;
                };
                Mouse._getRelativeMousePosition = function(event, element, pixelRatio) {
                  var elementBounds = element.getBoundingClientRect(), rootNode = document.documentElement || document.body.parentNode || document.body, scrollX = window.pageXOffset !== void 0 ? window.pageXOffset : rootNode.scrollLeft, scrollY = window.pageYOffset !== void 0 ? window.pageYOffset : rootNode.scrollTop, touches = event.changedTouches, x, y;
                  if (touches) {
                    x = touches[0].pageX - elementBounds.left - scrollX;
                    y = touches[0].pageY - elementBounds.top - scrollY;
                  } else {
                    x = event.pageX - elementBounds.left - scrollX;
                    y = event.pageY - elementBounds.top - scrollY;
                  }
                  return {
                    x: x / (element.clientWidth / (element.width || element.clientWidth) * pixelRatio),
                    y: y / (element.clientHeight / (element.height || element.clientHeight) * pixelRatio)
                  };
                };
              })();
            }),
            /* 15 */
            /***/
            (function(module2, exports2, __webpack_require__) {
              var Plugin = {};
              module2.exports = Plugin;
              var Common = __webpack_require__(0);
              (function() {
                Plugin._registry = {};
                Plugin.register = function(plugin) {
                  if (!Plugin.isPlugin(plugin)) {
                    Common.warn("Plugin.register:", Plugin.toString(plugin), "does not implement all required fields.");
                  }
                  if (plugin.name in Plugin._registry) {
                    var registered = Plugin._registry[plugin.name], pluginVersion = Plugin.versionParse(plugin.version).number, registeredVersion = Plugin.versionParse(registered.version).number;
                    if (pluginVersion > registeredVersion) {
                      Common.warn("Plugin.register:", Plugin.toString(registered), "was upgraded to", Plugin.toString(plugin));
                      Plugin._registry[plugin.name] = plugin;
                    } else if (pluginVersion < registeredVersion) {
                      Common.warn("Plugin.register:", Plugin.toString(registered), "can not be downgraded to", Plugin.toString(plugin));
                    } else if (plugin !== registered) {
                      Common.warn("Plugin.register:", Plugin.toString(plugin), "is already registered to different plugin object");
                    }
                  } else {
                    Plugin._registry[plugin.name] = plugin;
                  }
                  return plugin;
                };
                Plugin.resolve = function(dependency) {
                  return Plugin._registry[Plugin.dependencyParse(dependency).name];
                };
                Plugin.toString = function(plugin) {
                  return typeof plugin === "string" ? plugin : (plugin.name || "anonymous") + "@" + (plugin.version || plugin.range || "0.0.0");
                };
                Plugin.isPlugin = function(obj) {
                  return obj && obj.name && obj.version && obj.install;
                };
                Plugin.isUsed = function(module3, name) {
                  return module3.used.indexOf(name) > -1;
                };
                Plugin.isFor = function(plugin, module3) {
                  var parsed = plugin.for && Plugin.dependencyParse(plugin.for);
                  return !plugin.for || module3.name === parsed.name && Plugin.versionSatisfies(module3.version, parsed.range);
                };
                Plugin.use = function(module3, plugins) {
                  module3.uses = (module3.uses || []).concat(plugins || []);
                  if (module3.uses.length === 0) {
                    Common.warn("Plugin.use:", Plugin.toString(module3), "does not specify any dependencies to install.");
                    return;
                  }
                  var dependencies = Plugin.dependencies(module3), sortedDependencies = Common.topologicalSort(dependencies), status = [];
                  for (var i = 0; i < sortedDependencies.length; i += 1) {
                    if (sortedDependencies[i] === module3.name) {
                      continue;
                    }
                    var plugin = Plugin.resolve(sortedDependencies[i]);
                    if (!plugin) {
                      status.push("❌ " + sortedDependencies[i]);
                      continue;
                    }
                    if (Plugin.isUsed(module3, plugin.name)) {
                      continue;
                    }
                    if (!Plugin.isFor(plugin, module3)) {
                      Common.warn("Plugin.use:", Plugin.toString(plugin), "is for", plugin.for, "but installed on", Plugin.toString(module3) + ".");
                      plugin._warned = true;
                    }
                    if (plugin.install) {
                      plugin.install(module3);
                    } else {
                      Common.warn("Plugin.use:", Plugin.toString(plugin), "does not specify an install function.");
                      plugin._warned = true;
                    }
                    if (plugin._warned) {
                      status.push("🔶 " + Plugin.toString(plugin));
                      delete plugin._warned;
                    } else {
                      status.push("✅ " + Plugin.toString(plugin));
                    }
                    module3.used.push(plugin.name);
                  }
                  if (status.length > 0) {
                    Common.info(status.join("  "));
                  }
                };
                Plugin.dependencies = function(module3, tracked) {
                  var parsedBase = Plugin.dependencyParse(module3), name = parsedBase.name;
                  tracked = tracked || {};
                  if (name in tracked) {
                    return;
                  }
                  module3 = Plugin.resolve(module3) || module3;
                  tracked[name] = Common.map(module3.uses || [], function(dependency) {
                    if (Plugin.isPlugin(dependency)) {
                      Plugin.register(dependency);
                    }
                    var parsed = Plugin.dependencyParse(dependency), resolved = Plugin.resolve(dependency);
                    if (resolved && !Plugin.versionSatisfies(resolved.version, parsed.range)) {
                      Common.warn(
                        "Plugin.dependencies:",
                        Plugin.toString(resolved),
                        "does not satisfy",
                        Plugin.toString(parsed),
                        "used by",
                        Plugin.toString(parsedBase) + "."
                      );
                      resolved._warned = true;
                      module3._warned = true;
                    } else if (!resolved) {
                      Common.warn(
                        "Plugin.dependencies:",
                        Plugin.toString(dependency),
                        "used by",
                        Plugin.toString(parsedBase),
                        "could not be resolved."
                      );
                      module3._warned = true;
                    }
                    return parsed.name;
                  });
                  for (var i = 0; i < tracked[name].length; i += 1) {
                    Plugin.dependencies(tracked[name][i], tracked);
                  }
                  return tracked;
                };
                Plugin.dependencyParse = function(dependency) {
                  if (Common.isString(dependency)) {
                    var pattern = /^[\w-]+(@(\*|[\^~]?\d+\.\d+\.\d+(-[0-9A-Za-z-+]+)?))?$/;
                    if (!pattern.test(dependency)) {
                      Common.warn("Plugin.dependencyParse:", dependency, "is not a valid dependency string.");
                    }
                    return {
                      name: dependency.split("@")[0],
                      range: dependency.split("@")[1] || "*"
                    };
                  }
                  return {
                    name: dependency.name,
                    range: dependency.range || dependency.version
                  };
                };
                Plugin.versionParse = function(range) {
                  var pattern = /^(\*)|(\^|~|>=|>)?\s*((\d+)\.(\d+)\.(\d+))(-[0-9A-Za-z-+]+)?$/;
                  if (!pattern.test(range)) {
                    Common.warn("Plugin.versionParse:", range, "is not a valid version or range.");
                  }
                  var parts = pattern.exec(range);
                  var major = Number(parts[4]);
                  var minor = Number(parts[5]);
                  var patch = Number(parts[6]);
                  return {
                    isRange: Boolean(parts[1] || parts[2]),
                    version: parts[3],
                    range,
                    operator: parts[1] || parts[2] || "",
                    major,
                    minor,
                    patch,
                    parts: [major, minor, patch],
                    prerelease: parts[7],
                    number: major * 1e8 + minor * 1e4 + patch
                  };
                };
                Plugin.versionSatisfies = function(version, range) {
                  range = range || "*";
                  var r = Plugin.versionParse(range), v = Plugin.versionParse(version);
                  if (r.isRange) {
                    if (r.operator === "*" || version === "*") {
                      return true;
                    }
                    if (r.operator === ">") {
                      return v.number > r.number;
                    }
                    if (r.operator === ">=") {
                      return v.number >= r.number;
                    }
                    if (r.operator === "~") {
                      return v.major === r.major && v.minor === r.minor && v.patch >= r.patch;
                    }
                    if (r.operator === "^") {
                      if (r.major > 0) {
                        return v.major === r.major && v.number >= r.number;
                      }
                      if (r.minor > 0) {
                        return v.minor === r.minor && v.patch >= r.patch;
                      }
                      return v.patch === r.patch;
                    }
                  }
                  return version === range || version === "*";
                };
              })();
            }),
            /* 16 */
            /***/
            (function(module2, exports2) {
              var Contact = {};
              module2.exports = Contact;
              (function() {
                Contact.create = function(vertex) {
                  return {
                    vertex,
                    normalImpulse: 0,
                    tangentImpulse: 0
                  };
                };
              })();
            }),
            /* 17 */
            /***/
            (function(module2, exports2, __webpack_require__) {
              var Engine2 = {};
              module2.exports = Engine2;
              var Sleeping = __webpack_require__(7);
              var Resolver = __webpack_require__(18);
              var Detector = __webpack_require__(13);
              var Pairs = __webpack_require__(19);
              var Events2 = __webpack_require__(5);
              var Composite2 = __webpack_require__(6);
              var Constraint = __webpack_require__(10);
              var Common = __webpack_require__(0);
              var Body2 = __webpack_require__(4);
              (function() {
                Engine2._deltaMax = 1e3 / 60;
                Engine2.create = function(options) {
                  options = options || {};
                  var defaults = {
                    positionIterations: 6,
                    velocityIterations: 4,
                    constraintIterations: 2,
                    enableSleeping: false,
                    events: [],
                    plugin: {},
                    gravity: {
                      x: 0,
                      y: 1,
                      scale: 1e-3
                    },
                    timing: {
                      timestamp: 0,
                      timeScale: 1,
                      lastDelta: 0,
                      lastElapsed: 0,
                      lastUpdatesPerFrame: 0
                    }
                  };
                  var engine = Common.extend(defaults, options);
                  engine.world = options.world || Composite2.create({ label: "World" });
                  engine.pairs = options.pairs || Pairs.create();
                  engine.detector = options.detector || Detector.create();
                  engine.detector.pairs = engine.pairs;
                  engine.grid = { buckets: [] };
                  engine.world.gravity = engine.gravity;
                  engine.broadphase = engine.grid;
                  engine.metrics = {};
                  return engine;
                };
                Engine2.update = function(engine, delta) {
                  var startTime = Common.now();
                  var world = engine.world, detector = engine.detector, pairs = engine.pairs, timing = engine.timing, timestamp = timing.timestamp, i;
                  if (delta > Engine2._deltaMax) {
                    Common.warnOnce(
                      "Matter.Engine.update: delta argument is recommended to be less than or equal to",
                      Engine2._deltaMax.toFixed(3),
                      "ms."
                    );
                  }
                  delta = typeof delta !== "undefined" ? delta : Common._baseDelta;
                  delta *= timing.timeScale;
                  timing.timestamp += delta;
                  timing.lastDelta = delta;
                  var event = {
                    timestamp: timing.timestamp,
                    delta
                  };
                  Events2.trigger(engine, "beforeUpdate", event);
                  var allBodies = Composite2.allBodies(world), allConstraints = Composite2.allConstraints(world);
                  if (world.isModified) {
                    Detector.setBodies(detector, allBodies);
                    Composite2.setModified(world, false, false, true);
                  }
                  if (engine.enableSleeping)
                    Sleeping.update(allBodies, delta);
                  Engine2._bodiesApplyGravity(allBodies, engine.gravity);
                  if (delta > 0) {
                    Engine2._bodiesUpdate(allBodies, delta);
                  }
                  Events2.trigger(engine, "beforeSolve", event);
                  Constraint.preSolveAll(allBodies);
                  for (i = 0; i < engine.constraintIterations; i++) {
                    Constraint.solveAll(allConstraints, delta);
                  }
                  Constraint.postSolveAll(allBodies);
                  var collisions = Detector.collisions(detector);
                  Pairs.update(pairs, collisions, timestamp);
                  if (engine.enableSleeping)
                    Sleeping.afterCollisions(pairs.list);
                  if (pairs.collisionStart.length > 0) {
                    Events2.trigger(engine, "collisionStart", {
                      pairs: pairs.collisionStart,
                      timestamp: timing.timestamp,
                      delta
                    });
                  }
                  var positionDamping = Common.clamp(20 / engine.positionIterations, 0, 1);
                  Resolver.preSolvePosition(pairs.list);
                  for (i = 0; i < engine.positionIterations; i++) {
                    Resolver.solvePosition(pairs.list, delta, positionDamping);
                  }
                  Resolver.postSolvePosition(allBodies);
                  Constraint.preSolveAll(allBodies);
                  for (i = 0; i < engine.constraintIterations; i++) {
                    Constraint.solveAll(allConstraints, delta);
                  }
                  Constraint.postSolveAll(allBodies);
                  Resolver.preSolveVelocity(pairs.list);
                  for (i = 0; i < engine.velocityIterations; i++) {
                    Resolver.solveVelocity(pairs.list, delta);
                  }
                  Engine2._bodiesUpdateVelocities(allBodies);
                  if (pairs.collisionActive.length > 0) {
                    Events2.trigger(engine, "collisionActive", {
                      pairs: pairs.collisionActive,
                      timestamp: timing.timestamp,
                      delta
                    });
                  }
                  if (pairs.collisionEnd.length > 0) {
                    Events2.trigger(engine, "collisionEnd", {
                      pairs: pairs.collisionEnd,
                      timestamp: timing.timestamp,
                      delta
                    });
                  }
                  Engine2._bodiesClearForces(allBodies);
                  Events2.trigger(engine, "afterUpdate", event);
                  engine.timing.lastElapsed = Common.now() - startTime;
                  return engine;
                };
                Engine2.merge = function(engineA, engineB) {
                  Common.extend(engineA, engineB);
                  if (engineB.world) {
                    engineA.world = engineB.world;
                    Engine2.clear(engineA);
                    var bodies = Composite2.allBodies(engineA.world);
                    for (var i = 0; i < bodies.length; i++) {
                      var body = bodies[i];
                      Sleeping.set(body, false);
                      body.id = Common.nextId();
                    }
                  }
                };
                Engine2.clear = function(engine) {
                  Pairs.clear(engine.pairs);
                  Detector.clear(engine.detector);
                };
                Engine2._bodiesClearForces = function(bodies) {
                  var bodiesLength = bodies.length;
                  for (var i = 0; i < bodiesLength; i++) {
                    var body = bodies[i];
                    body.force.x = 0;
                    body.force.y = 0;
                    body.torque = 0;
                  }
                };
                Engine2._bodiesApplyGravity = function(bodies, gravity) {
                  var gravityScale = typeof gravity.scale !== "undefined" ? gravity.scale : 1e-3, bodiesLength = bodies.length;
                  if (gravity.x === 0 && gravity.y === 0 || gravityScale === 0) {
                    return;
                  }
                  for (var i = 0; i < bodiesLength; i++) {
                    var body = bodies[i];
                    if (body.isStatic || body.isSleeping)
                      continue;
                    body.force.y += body.mass * gravity.y * gravityScale;
                    body.force.x += body.mass * gravity.x * gravityScale;
                  }
                };
                Engine2._bodiesUpdate = function(bodies, delta) {
                  var bodiesLength = bodies.length;
                  for (var i = 0; i < bodiesLength; i++) {
                    var body = bodies[i];
                    if (body.isStatic || body.isSleeping)
                      continue;
                    Body2.update(body, delta);
                  }
                };
                Engine2._bodiesUpdateVelocities = function(bodies) {
                  var bodiesLength = bodies.length;
                  for (var i = 0; i < bodiesLength; i++) {
                    Body2.updateVelocities(bodies[i]);
                  }
                };
              })();
            }),
            /* 18 */
            /***/
            (function(module2, exports2, __webpack_require__) {
              var Resolver = {};
              module2.exports = Resolver;
              var Vertices = __webpack_require__(3);
              var Common = __webpack_require__(0);
              var Bounds = __webpack_require__(1);
              (function() {
                Resolver._restingThresh = 2;
                Resolver._restingThreshTangent = Math.sqrt(6);
                Resolver._positionDampen = 0.9;
                Resolver._positionWarming = 0.8;
                Resolver._frictionNormalMultiplier = 5;
                Resolver._frictionMaxStatic = Number.MAX_VALUE;
                Resolver.preSolvePosition = function(pairs) {
                  var i, pair, contactCount, pairsLength = pairs.length;
                  for (i = 0; i < pairsLength; i++) {
                    pair = pairs[i];
                    if (!pair.isActive)
                      continue;
                    contactCount = pair.contactCount;
                    pair.collision.parentA.totalContacts += contactCount;
                    pair.collision.parentB.totalContacts += contactCount;
                  }
                };
                Resolver.solvePosition = function(pairs, delta, damping) {
                  var i, pair, collision, bodyA, bodyB, normal, contactShare, positionImpulse, positionDampen = Resolver._positionDampen * (damping || 1), slopDampen = Common.clamp(delta / Common._baseDelta, 0, 1), pairsLength = pairs.length;
                  for (i = 0; i < pairsLength; i++) {
                    pair = pairs[i];
                    if (!pair.isActive || pair.isSensor)
                      continue;
                    collision = pair.collision;
                    bodyA = collision.parentA;
                    bodyB = collision.parentB;
                    normal = collision.normal;
                    pair.separation = collision.depth + normal.x * (bodyB.positionImpulse.x - bodyA.positionImpulse.x) + normal.y * (bodyB.positionImpulse.y - bodyA.positionImpulse.y);
                  }
                  for (i = 0; i < pairsLength; i++) {
                    pair = pairs[i];
                    if (!pair.isActive || pair.isSensor)
                      continue;
                    collision = pair.collision;
                    bodyA = collision.parentA;
                    bodyB = collision.parentB;
                    normal = collision.normal;
                    positionImpulse = pair.separation - pair.slop * slopDampen;
                    if (bodyA.isStatic || bodyB.isStatic)
                      positionImpulse *= 2;
                    if (!(bodyA.isStatic || bodyA.isSleeping)) {
                      contactShare = positionDampen / bodyA.totalContacts;
                      bodyA.positionImpulse.x += normal.x * positionImpulse * contactShare;
                      bodyA.positionImpulse.y += normal.y * positionImpulse * contactShare;
                    }
                    if (!(bodyB.isStatic || bodyB.isSleeping)) {
                      contactShare = positionDampen / bodyB.totalContacts;
                      bodyB.positionImpulse.x -= normal.x * positionImpulse * contactShare;
                      bodyB.positionImpulse.y -= normal.y * positionImpulse * contactShare;
                    }
                  }
                };
                Resolver.postSolvePosition = function(bodies) {
                  var positionWarming = Resolver._positionWarming, bodiesLength = bodies.length, verticesTranslate = Vertices.translate, boundsUpdate = Bounds.update;
                  for (var i = 0; i < bodiesLength; i++) {
                    var body = bodies[i], positionImpulse = body.positionImpulse, positionImpulseX = positionImpulse.x, positionImpulseY = positionImpulse.y, velocity = body.velocity;
                    body.totalContacts = 0;
                    if (positionImpulseX !== 0 || positionImpulseY !== 0) {
                      for (var j = 0; j < body.parts.length; j++) {
                        var part = body.parts[j];
                        verticesTranslate(part.vertices, positionImpulse);
                        boundsUpdate(part.bounds, part.vertices, velocity);
                        part.position.x += positionImpulseX;
                        part.position.y += positionImpulseY;
                      }
                      body.positionPrev.x += positionImpulseX;
                      body.positionPrev.y += positionImpulseY;
                      if (positionImpulseX * velocity.x + positionImpulseY * velocity.y < 0) {
                        positionImpulse.x = 0;
                        positionImpulse.y = 0;
                      } else {
                        positionImpulse.x *= positionWarming;
                        positionImpulse.y *= positionWarming;
                      }
                    }
                  }
                };
                Resolver.preSolveVelocity = function(pairs) {
                  var pairsLength = pairs.length, i, j;
                  for (i = 0; i < pairsLength; i++) {
                    var pair = pairs[i];
                    if (!pair.isActive || pair.isSensor)
                      continue;
                    var contacts = pair.contacts, contactCount = pair.contactCount, collision = pair.collision, bodyA = collision.parentA, bodyB = collision.parentB, normal = collision.normal, tangent = collision.tangent;
                    for (j = 0; j < contactCount; j++) {
                      var contact = contacts[j], contactVertex = contact.vertex, normalImpulse = contact.normalImpulse, tangentImpulse = contact.tangentImpulse;
                      if (normalImpulse !== 0 || tangentImpulse !== 0) {
                        var impulseX = normal.x * normalImpulse + tangent.x * tangentImpulse, impulseY = normal.y * normalImpulse + tangent.y * tangentImpulse;
                        if (!(bodyA.isStatic || bodyA.isSleeping)) {
                          bodyA.positionPrev.x += impulseX * bodyA.inverseMass;
                          bodyA.positionPrev.y += impulseY * bodyA.inverseMass;
                          bodyA.anglePrev += bodyA.inverseInertia * ((contactVertex.x - bodyA.position.x) * impulseY - (contactVertex.y - bodyA.position.y) * impulseX);
                        }
                        if (!(bodyB.isStatic || bodyB.isSleeping)) {
                          bodyB.positionPrev.x -= impulseX * bodyB.inverseMass;
                          bodyB.positionPrev.y -= impulseY * bodyB.inverseMass;
                          bodyB.anglePrev -= bodyB.inverseInertia * ((contactVertex.x - bodyB.position.x) * impulseY - (contactVertex.y - bodyB.position.y) * impulseX);
                        }
                      }
                    }
                  }
                };
                Resolver.solveVelocity = function(pairs, delta) {
                  var timeScale = delta / Common._baseDelta, timeScaleSquared = timeScale * timeScale, timeScaleCubed = timeScaleSquared * timeScale, restingThresh = -Resolver._restingThresh * timeScale, restingThreshTangent = Resolver._restingThreshTangent, frictionNormalMultiplier = Resolver._frictionNormalMultiplier * timeScale, frictionMaxStatic = Resolver._frictionMaxStatic, pairsLength = pairs.length, tangentImpulse, maxFriction, i, j;
                  for (i = 0; i < pairsLength; i++) {
                    var pair = pairs[i];
                    if (!pair.isActive || pair.isSensor)
                      continue;
                    var collision = pair.collision, bodyA = collision.parentA, bodyB = collision.parentB, normalX = collision.normal.x, normalY = collision.normal.y, tangentX = collision.tangent.x, tangentY = collision.tangent.y, inverseMassTotal = pair.inverseMass, friction = pair.friction * pair.frictionStatic * frictionNormalMultiplier, contacts = pair.contacts, contactCount = pair.contactCount, contactShare = 1 / contactCount;
                    var bodyAVelocityX = bodyA.position.x - bodyA.positionPrev.x, bodyAVelocityY = bodyA.position.y - bodyA.positionPrev.y, bodyAAngularVelocity = bodyA.angle - bodyA.anglePrev, bodyBVelocityX = bodyB.position.x - bodyB.positionPrev.x, bodyBVelocityY = bodyB.position.y - bodyB.positionPrev.y, bodyBAngularVelocity = bodyB.angle - bodyB.anglePrev;
                    for (j = 0; j < contactCount; j++) {
                      var contact = contacts[j], contactVertex = contact.vertex;
                      var offsetAX = contactVertex.x - bodyA.position.x, offsetAY = contactVertex.y - bodyA.position.y, offsetBX = contactVertex.x - bodyB.position.x, offsetBY = contactVertex.y - bodyB.position.y;
                      var velocityPointAX = bodyAVelocityX - offsetAY * bodyAAngularVelocity, velocityPointAY = bodyAVelocityY + offsetAX * bodyAAngularVelocity, velocityPointBX = bodyBVelocityX - offsetBY * bodyBAngularVelocity, velocityPointBY = bodyBVelocityY + offsetBX * bodyBAngularVelocity;
                      var relativeVelocityX = velocityPointAX - velocityPointBX, relativeVelocityY = velocityPointAY - velocityPointBY;
                      var normalVelocity = normalX * relativeVelocityX + normalY * relativeVelocityY, tangentVelocity = tangentX * relativeVelocityX + tangentY * relativeVelocityY;
                      var normalOverlap = pair.separation + normalVelocity;
                      var normalForce = Math.min(normalOverlap, 1);
                      normalForce = normalOverlap < 0 ? 0 : normalForce;
                      var frictionLimit = normalForce * friction;
                      if (tangentVelocity < -frictionLimit || tangentVelocity > frictionLimit) {
                        maxFriction = tangentVelocity > 0 ? tangentVelocity : -tangentVelocity;
                        tangentImpulse = pair.friction * (tangentVelocity > 0 ? 1 : -1) * timeScaleCubed;
                        if (tangentImpulse < -maxFriction) {
                          tangentImpulse = -maxFriction;
                        } else if (tangentImpulse > maxFriction) {
                          tangentImpulse = maxFriction;
                        }
                      } else {
                        tangentImpulse = tangentVelocity;
                        maxFriction = frictionMaxStatic;
                      }
                      var oAcN = offsetAX * normalY - offsetAY * normalX, oBcN = offsetBX * normalY - offsetBY * normalX, share = contactShare / (inverseMassTotal + bodyA.inverseInertia * oAcN * oAcN + bodyB.inverseInertia * oBcN * oBcN);
                      var normalImpulse = (1 + pair.restitution) * normalVelocity * share;
                      tangentImpulse *= share;
                      if (normalVelocity < restingThresh) {
                        contact.normalImpulse = 0;
                      } else {
                        var contactNormalImpulse = contact.normalImpulse;
                        contact.normalImpulse += normalImpulse;
                        if (contact.normalImpulse > 0) contact.normalImpulse = 0;
                        normalImpulse = contact.normalImpulse - contactNormalImpulse;
                      }
                      if (tangentVelocity < -restingThreshTangent || tangentVelocity > restingThreshTangent) {
                        contact.tangentImpulse = 0;
                      } else {
                        var contactTangentImpulse = contact.tangentImpulse;
                        contact.tangentImpulse += tangentImpulse;
                        if (contact.tangentImpulse < -maxFriction) contact.tangentImpulse = -maxFriction;
                        if (contact.tangentImpulse > maxFriction) contact.tangentImpulse = maxFriction;
                        tangentImpulse = contact.tangentImpulse - contactTangentImpulse;
                      }
                      var impulseX = normalX * normalImpulse + tangentX * tangentImpulse, impulseY = normalY * normalImpulse + tangentY * tangentImpulse;
                      if (!(bodyA.isStatic || bodyA.isSleeping)) {
                        bodyA.positionPrev.x += impulseX * bodyA.inverseMass;
                        bodyA.positionPrev.y += impulseY * bodyA.inverseMass;
                        bodyA.anglePrev += (offsetAX * impulseY - offsetAY * impulseX) * bodyA.inverseInertia;
                      }
                      if (!(bodyB.isStatic || bodyB.isSleeping)) {
                        bodyB.positionPrev.x -= impulseX * bodyB.inverseMass;
                        bodyB.positionPrev.y -= impulseY * bodyB.inverseMass;
                        bodyB.anglePrev -= (offsetBX * impulseY - offsetBY * impulseX) * bodyB.inverseInertia;
                      }
                    }
                  }
                };
              })();
            }),
            /* 19 */
            /***/
            (function(module2, exports2, __webpack_require__) {
              var Pairs = {};
              module2.exports = Pairs;
              var Pair = __webpack_require__(9);
              var Common = __webpack_require__(0);
              (function() {
                Pairs.create = function(options) {
                  return Common.extend({
                    table: {},
                    list: [],
                    collisionStart: [],
                    collisionActive: [],
                    collisionEnd: []
                  }, options);
                };
                Pairs.update = function(pairs, collisions, timestamp) {
                  var pairUpdate = Pair.update, pairCreate = Pair.create, pairSetActive = Pair.setActive, pairsTable = pairs.table, pairsList = pairs.list, pairsListLength = pairsList.length, pairsListIndex = pairsListLength, collisionStart = pairs.collisionStart, collisionEnd = pairs.collisionEnd, collisionActive = pairs.collisionActive, collisionsLength = collisions.length, collisionStartIndex = 0, collisionEndIndex = 0, collisionActiveIndex = 0, collision, pair, i;
                  for (i = 0; i < collisionsLength; i++) {
                    collision = collisions[i];
                    pair = collision.pair;
                    if (pair) {
                      if (pair.isActive) {
                        collisionActive[collisionActiveIndex++] = pair;
                      }
                      pairUpdate(pair, collision, timestamp);
                    } else {
                      pair = pairCreate(collision, timestamp);
                      pairsTable[pair.id] = pair;
                      collisionStart[collisionStartIndex++] = pair;
                      pairsList[pairsListIndex++] = pair;
                    }
                  }
                  pairsListIndex = 0;
                  pairsListLength = pairsList.length;
                  for (i = 0; i < pairsListLength; i++) {
                    pair = pairsList[i];
                    if (pair.timeUpdated >= timestamp) {
                      pairsList[pairsListIndex++] = pair;
                    } else {
                      pairSetActive(pair, false, timestamp);
                      if (pair.collision.bodyA.sleepCounter > 0 && pair.collision.bodyB.sleepCounter > 0) {
                        pairsList[pairsListIndex++] = pair;
                      } else {
                        collisionEnd[collisionEndIndex++] = pair;
                        delete pairsTable[pair.id];
                      }
                    }
                  }
                  if (pairsList.length !== pairsListIndex) {
                    pairsList.length = pairsListIndex;
                  }
                  if (collisionStart.length !== collisionStartIndex) {
                    collisionStart.length = collisionStartIndex;
                  }
                  if (collisionEnd.length !== collisionEndIndex) {
                    collisionEnd.length = collisionEndIndex;
                  }
                  if (collisionActive.length !== collisionActiveIndex) {
                    collisionActive.length = collisionActiveIndex;
                  }
                };
                Pairs.clear = function(pairs) {
                  pairs.table = {};
                  pairs.list.length = 0;
                  pairs.collisionStart.length = 0;
                  pairs.collisionActive.length = 0;
                  pairs.collisionEnd.length = 0;
                  return pairs;
                };
              })();
            }),
            /* 20 */
            /***/
            (function(module2, exports2, __webpack_require__) {
              var Matter = module2.exports = __webpack_require__(21);
              Matter.Axes = __webpack_require__(11);
              Matter.Bodies = __webpack_require__(12);
              Matter.Body = __webpack_require__(4);
              Matter.Bounds = __webpack_require__(1);
              Matter.Collision = __webpack_require__(8);
              Matter.Common = __webpack_require__(0);
              Matter.Composite = __webpack_require__(6);
              Matter.Composites = __webpack_require__(22);
              Matter.Constraint = __webpack_require__(10);
              Matter.Contact = __webpack_require__(16);
              Matter.Detector = __webpack_require__(13);
              Matter.Engine = __webpack_require__(17);
              Matter.Events = __webpack_require__(5);
              Matter.Grid = __webpack_require__(23);
              Matter.Mouse = __webpack_require__(14);
              Matter.MouseConstraint = __webpack_require__(24);
              Matter.Pair = __webpack_require__(9);
              Matter.Pairs = __webpack_require__(19);
              Matter.Plugin = __webpack_require__(15);
              Matter.Query = __webpack_require__(25);
              Matter.Render = __webpack_require__(26);
              Matter.Resolver = __webpack_require__(18);
              Matter.Runner = __webpack_require__(27);
              Matter.SAT = __webpack_require__(28);
              Matter.Sleeping = __webpack_require__(7);
              Matter.Svg = __webpack_require__(29);
              Matter.Vector = __webpack_require__(2);
              Matter.Vertices = __webpack_require__(3);
              Matter.World = __webpack_require__(30);
              Matter.Engine.run = Matter.Runner.run;
              Matter.Common.deprecated(Matter.Engine, "run", "Engine.run ➤ use Matter.Runner.run(engine) instead");
            }),
            /* 21 */
            /***/
            (function(module2, exports2, __webpack_require__) {
              var Matter = {};
              module2.exports = Matter;
              var Plugin = __webpack_require__(15);
              var Common = __webpack_require__(0);
              (function() {
                Matter.name = "matter-js";
                Matter.version = true ? "0.20.0" : void 0;
                Matter.uses = [];
                Matter.used = [];
                Matter.use = function() {
                  Plugin.use(Matter, Array.prototype.slice.call(arguments));
                };
                Matter.before = function(path, func) {
                  path = path.replace(/^Matter./, "");
                  return Common.chainPathBefore(Matter, path, func);
                };
                Matter.after = function(path, func) {
                  path = path.replace(/^Matter./, "");
                  return Common.chainPathAfter(Matter, path, func);
                };
              })();
            }),
            /* 22 */
            /***/
            (function(module2, exports2, __webpack_require__) {
              var Composites = {};
              module2.exports = Composites;
              var Composite2 = __webpack_require__(6);
              var Constraint = __webpack_require__(10);
              var Common = __webpack_require__(0);
              var Body2 = __webpack_require__(4);
              var Bodies2 = __webpack_require__(12);
              var deprecated = Common.deprecated;
              (function() {
                Composites.stack = function(x, y, columns, rows, columnGap, rowGap, callback) {
                  var stack = Composite2.create({ label: "Stack" }), currentX = x, currentY = y, lastBody, i = 0;
                  for (var row = 0; row < rows; row++) {
                    var maxHeight = 0;
                    for (var column = 0; column < columns; column++) {
                      var body = callback(currentX, currentY, column, row, lastBody, i);
                      if (body) {
                        var bodyHeight = body.bounds.max.y - body.bounds.min.y, bodyWidth = body.bounds.max.x - body.bounds.min.x;
                        if (bodyHeight > maxHeight)
                          maxHeight = bodyHeight;
                        Body2.translate(body, { x: bodyWidth * 0.5, y: bodyHeight * 0.5 });
                        currentX = body.bounds.max.x + columnGap;
                        Composite2.addBody(stack, body);
                        lastBody = body;
                        i += 1;
                      } else {
                        currentX += columnGap;
                      }
                    }
                    currentY += maxHeight + rowGap;
                    currentX = x;
                  }
                  return stack;
                };
                Composites.chain = function(composite, xOffsetA, yOffsetA, xOffsetB, yOffsetB, options) {
                  var bodies = composite.bodies;
                  for (var i = 1; i < bodies.length; i++) {
                    var bodyA = bodies[i - 1], bodyB = bodies[i], bodyAHeight = bodyA.bounds.max.y - bodyA.bounds.min.y, bodyAWidth = bodyA.bounds.max.x - bodyA.bounds.min.x, bodyBHeight = bodyB.bounds.max.y - bodyB.bounds.min.y, bodyBWidth = bodyB.bounds.max.x - bodyB.bounds.min.x;
                    var defaults = {
                      bodyA,
                      pointA: { x: bodyAWidth * xOffsetA, y: bodyAHeight * yOffsetA },
                      bodyB,
                      pointB: { x: bodyBWidth * xOffsetB, y: bodyBHeight * yOffsetB }
                    };
                    var constraint = Common.extend(defaults, options);
                    Composite2.addConstraint(composite, Constraint.create(constraint));
                  }
                  composite.label += " Chain";
                  return composite;
                };
                Composites.mesh = function(composite, columns, rows, crossBrace, options) {
                  var bodies = composite.bodies, row, col, bodyA, bodyB, bodyC;
                  for (row = 0; row < rows; row++) {
                    for (col = 1; col < columns; col++) {
                      bodyA = bodies[col - 1 + row * columns];
                      bodyB = bodies[col + row * columns];
                      Composite2.addConstraint(composite, Constraint.create(Common.extend({ bodyA, bodyB }, options)));
                    }
                    if (row > 0) {
                      for (col = 0; col < columns; col++) {
                        bodyA = bodies[col + (row - 1) * columns];
                        bodyB = bodies[col + row * columns];
                        Composite2.addConstraint(composite, Constraint.create(Common.extend({ bodyA, bodyB }, options)));
                        if (crossBrace && col > 0) {
                          bodyC = bodies[col - 1 + (row - 1) * columns];
                          Composite2.addConstraint(composite, Constraint.create(Common.extend({ bodyA: bodyC, bodyB }, options)));
                        }
                        if (crossBrace && col < columns - 1) {
                          bodyC = bodies[col + 1 + (row - 1) * columns];
                          Composite2.addConstraint(composite, Constraint.create(Common.extend({ bodyA: bodyC, bodyB }, options)));
                        }
                      }
                    }
                  }
                  composite.label += " Mesh";
                  return composite;
                };
                Composites.pyramid = function(x, y, columns, rows, columnGap, rowGap, callback) {
                  return Composites.stack(x, y, columns, rows, columnGap, rowGap, function(stackX, stackY, column, row, lastBody, i) {
                    var actualRows = Math.min(rows, Math.ceil(columns / 2)), lastBodyWidth = lastBody ? lastBody.bounds.max.x - lastBody.bounds.min.x : 0;
                    if (row > actualRows)
                      return;
                    row = actualRows - row;
                    var start = row, end = columns - 1 - row;
                    if (column < start || column > end)
                      return;
                    if (i === 1) {
                      Body2.translate(lastBody, { x: (column + (columns % 2 === 1 ? 1 : -1)) * lastBodyWidth, y: 0 });
                    }
                    var xOffset = lastBody ? column * lastBodyWidth : 0;
                    return callback(x + xOffset + column * columnGap, stackY, column, row, lastBody, i);
                  });
                };
                Composites.newtonsCradle = function(x, y, number, size, length) {
                  var newtonsCradle = Composite2.create({ label: "Newtons Cradle" });
                  for (var i = 0; i < number; i++) {
                    var separation = 1.9, circle2 = Bodies2.circle(
                      x + i * (size * separation),
                      y + length,
                      size,
                      { inertia: Infinity, restitution: 1, friction: 0, frictionAir: 1e-4, slop: 1 }
                    ), constraint = Constraint.create({ pointA: { x: x + i * (size * separation), y }, bodyB: circle2 });
                    Composite2.addBody(newtonsCradle, circle2);
                    Composite2.addConstraint(newtonsCradle, constraint);
                  }
                  return newtonsCradle;
                };
                deprecated(Composites, "newtonsCradle", "Composites.newtonsCradle ➤ moved to newtonsCradle example");
                Composites.car = function(x, y, width, height, wheelSize) {
                  var group = Body2.nextGroup(true), wheelBase = 20, wheelAOffset = -width * 0.5 + wheelBase, wheelBOffset = width * 0.5 - wheelBase, wheelYOffset = 0;
                  var car = Composite2.create({ label: "Car" }), body = Bodies2.rectangle(x, y, width, height, {
                    collisionFilter: {
                      group
                    },
                    chamfer: {
                      radius: height * 0.5
                    },
                    density: 2e-4
                  });
                  var wheelA = Bodies2.circle(x + wheelAOffset, y + wheelYOffset, wheelSize, {
                    collisionFilter: {
                      group
                    },
                    friction: 0.8
                  });
                  var wheelB = Bodies2.circle(x + wheelBOffset, y + wheelYOffset, wheelSize, {
                    collisionFilter: {
                      group
                    },
                    friction: 0.8
                  });
                  var axelA = Constraint.create({
                    bodyB: body,
                    pointB: { x: wheelAOffset, y: wheelYOffset },
                    bodyA: wheelA,
                    stiffness: 1,
                    length: 0
                  });
                  var axelB = Constraint.create({
                    bodyB: body,
                    pointB: { x: wheelBOffset, y: wheelYOffset },
                    bodyA: wheelB,
                    stiffness: 1,
                    length: 0
                  });
                  Composite2.addBody(car, body);
                  Composite2.addBody(car, wheelA);
                  Composite2.addBody(car, wheelB);
                  Composite2.addConstraint(car, axelA);
                  Composite2.addConstraint(car, axelB);
                  return car;
                };
                deprecated(Composites, "car", "Composites.car ➤ moved to car example");
                Composites.softBody = function(x, y, columns, rows, columnGap, rowGap, crossBrace, particleRadius, particleOptions, constraintOptions) {
                  particleOptions = Common.extend({ inertia: Infinity }, particleOptions);
                  constraintOptions = Common.extend({ stiffness: 0.2, render: { type: "line", anchors: false } }, constraintOptions);
                  var softBody = Composites.stack(x, y, columns, rows, columnGap, rowGap, function(stackX, stackY) {
                    return Bodies2.circle(stackX, stackY, particleRadius, particleOptions);
                  });
                  Composites.mesh(softBody, columns, rows, crossBrace, constraintOptions);
                  softBody.label = "Soft Body";
                  return softBody;
                };
                deprecated(Composites, "softBody", "Composites.softBody ➤ moved to softBody and cloth examples");
              })();
            }),
            /* 23 */
            /***/
            (function(module2, exports2, __webpack_require__) {
              var Grid = {};
              module2.exports = Grid;
              var Pair = __webpack_require__(9);
              var Common = __webpack_require__(0);
              var deprecated = Common.deprecated;
              (function() {
                Grid.create = function(options) {
                  var defaults = {
                    buckets: {},
                    pairs: {},
                    pairsList: [],
                    bucketWidth: 48,
                    bucketHeight: 48
                  };
                  return Common.extend(defaults, options);
                };
                Grid.update = function(grid, bodies, engine, forceUpdate) {
                  var i, col, row, world = engine.world, buckets = grid.buckets, bucket, bucketId, gridChanged = false;
                  for (i = 0; i < bodies.length; i++) {
                    var body = bodies[i];
                    if (body.isSleeping && !forceUpdate)
                      continue;
                    if (world.bounds && (body.bounds.max.x < world.bounds.min.x || body.bounds.min.x > world.bounds.max.x || body.bounds.max.y < world.bounds.min.y || body.bounds.min.y > world.bounds.max.y))
                      continue;
                    var newRegion = Grid._getRegion(grid, body);
                    if (!body.region || newRegion.id !== body.region.id || forceUpdate) {
                      if (!body.region || forceUpdate)
                        body.region = newRegion;
                      var union = Grid._regionUnion(newRegion, body.region);
                      for (col = union.startCol; col <= union.endCol; col++) {
                        for (row = union.startRow; row <= union.endRow; row++) {
                          bucketId = Grid._getBucketId(col, row);
                          bucket = buckets[bucketId];
                          var isInsideNewRegion = col >= newRegion.startCol && col <= newRegion.endCol && row >= newRegion.startRow && row <= newRegion.endRow;
                          var isInsideOldRegion = col >= body.region.startCol && col <= body.region.endCol && row >= body.region.startRow && row <= body.region.endRow;
                          if (!isInsideNewRegion && isInsideOldRegion) {
                            if (isInsideOldRegion) {
                              if (bucket)
                                Grid._bucketRemoveBody(grid, bucket, body);
                            }
                          }
                          if (body.region === newRegion || isInsideNewRegion && !isInsideOldRegion || forceUpdate) {
                            if (!bucket)
                              bucket = Grid._createBucket(buckets, bucketId);
                            Grid._bucketAddBody(grid, bucket, body);
                          }
                        }
                      }
                      body.region = newRegion;
                      gridChanged = true;
                    }
                  }
                  if (gridChanged)
                    grid.pairsList = Grid._createActivePairsList(grid);
                };
                deprecated(Grid, "update", "Grid.update ➤ replaced by Matter.Detector");
                Grid.clear = function(grid) {
                  grid.buckets = {};
                  grid.pairs = {};
                  grid.pairsList = [];
                };
                deprecated(Grid, "clear", "Grid.clear ➤ replaced by Matter.Detector");
                Grid._regionUnion = function(regionA, regionB) {
                  var startCol = Math.min(regionA.startCol, regionB.startCol), endCol = Math.max(regionA.endCol, regionB.endCol), startRow = Math.min(regionA.startRow, regionB.startRow), endRow = Math.max(regionA.endRow, regionB.endRow);
                  return Grid._createRegion(startCol, endCol, startRow, endRow);
                };
                Grid._getRegion = function(grid, body) {
                  var bounds = body.bounds, startCol = Math.floor(bounds.min.x / grid.bucketWidth), endCol = Math.floor(bounds.max.x / grid.bucketWidth), startRow = Math.floor(bounds.min.y / grid.bucketHeight), endRow = Math.floor(bounds.max.y / grid.bucketHeight);
                  return Grid._createRegion(startCol, endCol, startRow, endRow);
                };
                Grid._createRegion = function(startCol, endCol, startRow, endRow) {
                  return {
                    id: startCol + "," + endCol + "," + startRow + "," + endRow,
                    startCol,
                    endCol,
                    startRow,
                    endRow
                  };
                };
                Grid._getBucketId = function(column, row) {
                  return "C" + column + "R" + row;
                };
                Grid._createBucket = function(buckets, bucketId) {
                  var bucket = buckets[bucketId] = [];
                  return bucket;
                };
                Grid._bucketAddBody = function(grid, bucket, body) {
                  var gridPairs = grid.pairs, pairId = Pair.id, bucketLength = bucket.length, i;
                  for (i = 0; i < bucketLength; i++) {
                    var bodyB = bucket[i];
                    if (body.id === bodyB.id || body.isStatic && bodyB.isStatic)
                      continue;
                    var id2 = pairId(body, bodyB), pair = gridPairs[id2];
                    if (pair) {
                      pair[2] += 1;
                    } else {
                      gridPairs[id2] = [body, bodyB, 1];
                    }
                  }
                  bucket.push(body);
                };
                Grid._bucketRemoveBody = function(grid, bucket, body) {
                  var gridPairs = grid.pairs, pairId = Pair.id, i;
                  bucket.splice(Common.indexOf(bucket, body), 1);
                  var bucketLength = bucket.length;
                  for (i = 0; i < bucketLength; i++) {
                    var pair = gridPairs[pairId(body, bucket[i])];
                    if (pair)
                      pair[2] -= 1;
                  }
                };
                Grid._createActivePairsList = function(grid) {
                  var pair, gridPairs = grid.pairs, pairKeys = Common.keys(gridPairs), pairKeysLength = pairKeys.length, pairs = [], k;
                  for (k = 0; k < pairKeysLength; k++) {
                    pair = gridPairs[pairKeys[k]];
                    if (pair[2] > 0) {
                      pairs.push(pair);
                    } else {
                      delete gridPairs[pairKeys[k]];
                    }
                  }
                  return pairs;
                };
              })();
            }),
            /* 24 */
            /***/
            (function(module2, exports2, __webpack_require__) {
              var MouseConstraint = {};
              module2.exports = MouseConstraint;
              var Vertices = __webpack_require__(3);
              var Sleeping = __webpack_require__(7);
              var Mouse = __webpack_require__(14);
              var Events2 = __webpack_require__(5);
              var Detector = __webpack_require__(13);
              var Constraint = __webpack_require__(10);
              var Composite2 = __webpack_require__(6);
              var Common = __webpack_require__(0);
              var Bounds = __webpack_require__(1);
              (function() {
                MouseConstraint.create = function(engine, options) {
                  var mouse = (engine ? engine.mouse : null) || (options ? options.mouse : null);
                  if (!mouse) {
                    if (engine && engine.render && engine.render.canvas) {
                      mouse = Mouse.create(engine.render.canvas);
                    } else if (options && options.element) {
                      mouse = Mouse.create(options.element);
                    } else {
                      mouse = Mouse.create();
                      Common.warn("MouseConstraint.create: options.mouse was undefined, options.element was undefined, may not function as expected");
                    }
                  }
                  var constraint = Constraint.create({
                    label: "Mouse Constraint",
                    pointA: mouse.position,
                    pointB: { x: 0, y: 0 },
                    length: 0.01,
                    stiffness: 0.1,
                    angularStiffness: 1,
                    render: {
                      strokeStyle: "#90EE90",
                      lineWidth: 3
                    }
                  });
                  var defaults = {
                    type: "mouseConstraint",
                    mouse,
                    element: null,
                    body: null,
                    constraint,
                    collisionFilter: {
                      category: 1,
                      mask: 4294967295,
                      group: 0
                    }
                  };
                  var mouseConstraint = Common.extend(defaults, options);
                  Events2.on(engine, "beforeUpdate", function() {
                    var allBodies = Composite2.allBodies(engine.world);
                    MouseConstraint.update(mouseConstraint, allBodies);
                    MouseConstraint._triggerEvents(mouseConstraint);
                  });
                  return mouseConstraint;
                };
                MouseConstraint.update = function(mouseConstraint, bodies) {
                  var mouse = mouseConstraint.mouse, constraint = mouseConstraint.constraint, body = mouseConstraint.body;
                  if (mouse.button === 0) {
                    if (!constraint.bodyB) {
                      for (var i = 0; i < bodies.length; i++) {
                        body = bodies[i];
                        if (Bounds.contains(body.bounds, mouse.position) && Detector.canCollide(body.collisionFilter, mouseConstraint.collisionFilter)) {
                          for (var j = body.parts.length > 1 ? 1 : 0; j < body.parts.length; j++) {
                            var part = body.parts[j];
                            if (Vertices.contains(part.vertices, mouse.position)) {
                              constraint.pointA = mouse.position;
                              constraint.bodyB = mouseConstraint.body = body;
                              constraint.pointB = { x: mouse.position.x - body.position.x, y: mouse.position.y - body.position.y };
                              constraint.angleB = body.angle;
                              Sleeping.set(body, false);
                              Events2.trigger(mouseConstraint, "startdrag", { mouse, body });
                              break;
                            }
                          }
                        }
                      }
                    } else {
                      Sleeping.set(constraint.bodyB, false);
                      constraint.pointA = mouse.position;
                    }
                  } else {
                    constraint.bodyB = mouseConstraint.body = null;
                    constraint.pointB = null;
                    if (body)
                      Events2.trigger(mouseConstraint, "enddrag", { mouse, body });
                  }
                };
                MouseConstraint._triggerEvents = function(mouseConstraint) {
                  var mouse = mouseConstraint.mouse, mouseEvents = mouse.sourceEvents;
                  if (mouseEvents.mousemove)
                    Events2.trigger(mouseConstraint, "mousemove", { mouse });
                  if (mouseEvents.mousedown)
                    Events2.trigger(mouseConstraint, "mousedown", { mouse });
                  if (mouseEvents.mouseup)
                    Events2.trigger(mouseConstraint, "mouseup", { mouse });
                  Mouse.clearSourceEvents(mouse);
                };
              })();
            }),
            /* 25 */
            /***/
            (function(module2, exports2, __webpack_require__) {
              var Query = {};
              module2.exports = Query;
              var Vector = __webpack_require__(2);
              var Collision = __webpack_require__(8);
              var Bounds = __webpack_require__(1);
              var Bodies2 = __webpack_require__(12);
              var Vertices = __webpack_require__(3);
              (function() {
                Query.collides = function(body, bodies) {
                  var collisions = [], bodiesLength = bodies.length, bounds = body.bounds, collides = Collision.collides, overlaps = Bounds.overlaps;
                  for (var i = 0; i < bodiesLength; i++) {
                    var bodyA = bodies[i], partsALength = bodyA.parts.length, partsAStart = partsALength === 1 ? 0 : 1;
                    if (overlaps(bodyA.bounds, bounds)) {
                      for (var j = partsAStart; j < partsALength; j++) {
                        var part = bodyA.parts[j];
                        if (overlaps(part.bounds, bounds)) {
                          var collision = collides(part, body);
                          if (collision) {
                            collisions.push(collision);
                            break;
                          }
                        }
                      }
                    }
                  }
                  return collisions;
                };
                Query.ray = function(bodies, startPoint, endPoint, rayWidth) {
                  rayWidth = rayWidth || 1e-100;
                  var rayAngle = Vector.angle(startPoint, endPoint), rayLength = Vector.magnitude(Vector.sub(startPoint, endPoint)), rayX = (endPoint.x + startPoint.x) * 0.5, rayY = (endPoint.y + startPoint.y) * 0.5, ray = Bodies2.rectangle(rayX, rayY, rayLength, rayWidth, { angle: rayAngle }), collisions = Query.collides(ray, bodies);
                  for (var i = 0; i < collisions.length; i += 1) {
                    var collision = collisions[i];
                    collision.body = collision.bodyB = collision.bodyA;
                  }
                  return collisions;
                };
                Query.region = function(bodies, bounds, outside) {
                  var result = [];
                  for (var i = 0; i < bodies.length; i++) {
                    var body = bodies[i], overlaps = Bounds.overlaps(body.bounds, bounds);
                    if (overlaps && !outside || !overlaps && outside)
                      result.push(body);
                  }
                  return result;
                };
                Query.point = function(bodies, point2) {
                  var result = [];
                  for (var i = 0; i < bodies.length; i++) {
                    var body = bodies[i];
                    if (Bounds.contains(body.bounds, point2)) {
                      for (var j = body.parts.length === 1 ? 0 : 1; j < body.parts.length; j++) {
                        var part = body.parts[j];
                        if (Bounds.contains(part.bounds, point2) && Vertices.contains(part.vertices, point2)) {
                          result.push(body);
                          break;
                        }
                      }
                    }
                  }
                  return result;
                };
              })();
            }),
            /* 26 */
            /***/
            (function(module2, exports2, __webpack_require__) {
              var Render = {};
              module2.exports = Render;
              var Body2 = __webpack_require__(4);
              var Common = __webpack_require__(0);
              var Composite2 = __webpack_require__(6);
              var Bounds = __webpack_require__(1);
              var Events2 = __webpack_require__(5);
              var Vector = __webpack_require__(2);
              var Mouse = __webpack_require__(14);
              (function() {
                var _requestAnimationFrame, _cancelAnimationFrame;
                if (typeof window !== "undefined") {
                  _requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.msRequestAnimationFrame || function(callback) {
                    window.setTimeout(function() {
                      callback(Common.now());
                    }, 1e3 / 60);
                  };
                  _cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame || window.webkitCancelAnimationFrame || window.msCancelAnimationFrame;
                }
                Render._goodFps = 30;
                Render._goodDelta = 1e3 / 60;
                Render.create = function(options) {
                  var defaults = {
                    engine: null,
                    element: null,
                    canvas: null,
                    mouse: null,
                    frameRequestId: null,
                    timing: {
                      historySize: 60,
                      delta: 0,
                      deltaHistory: [],
                      lastTime: 0,
                      lastTimestamp: 0,
                      lastElapsed: 0,
                      timestampElapsed: 0,
                      timestampElapsedHistory: [],
                      engineDeltaHistory: [],
                      engineElapsedHistory: [],
                      engineUpdatesHistory: [],
                      elapsedHistory: []
                    },
                    options: {
                      width: 800,
                      height: 600,
                      pixelRatio: 1,
                      background: "#14151f",
                      wireframeBackground: "#14151f",
                      wireframeStrokeStyle: "#bbb",
                      hasBounds: !!options.bounds,
                      enabled: true,
                      wireframes: true,
                      showSleeping: true,
                      showDebug: false,
                      showStats: false,
                      showPerformance: false,
                      showBounds: false,
                      showVelocity: false,
                      showCollisions: false,
                      showSeparations: false,
                      showAxes: false,
                      showPositions: false,
                      showAngleIndicator: false,
                      showIds: false,
                      showVertexNumbers: false,
                      showConvexHulls: false,
                      showInternalEdges: false,
                      showMousePosition: false
                    }
                  };
                  var render = Common.extend(defaults, options);
                  if (render.canvas) {
                    render.canvas.width = render.options.width || render.canvas.width;
                    render.canvas.height = render.options.height || render.canvas.height;
                  }
                  render.mouse = options.mouse;
                  render.engine = options.engine;
                  render.canvas = render.canvas || _createCanvas(render.options.width, render.options.height);
                  render.context = render.canvas.getContext("2d");
                  render.textures = {};
                  render.bounds = render.bounds || {
                    min: {
                      x: 0,
                      y: 0
                    },
                    max: {
                      x: render.canvas.width,
                      y: render.canvas.height
                    }
                  };
                  render.controller = Render;
                  render.options.showBroadphase = false;
                  if (render.options.pixelRatio !== 1) {
                    Render.setPixelRatio(render, render.options.pixelRatio);
                  }
                  if (Common.isElement(render.element)) {
                    render.element.appendChild(render.canvas);
                  }
                  return render;
                };
                Render.run = function(render) {
                  (function loop(time) {
                    render.frameRequestId = _requestAnimationFrame(loop);
                    _updateTiming(render, time);
                    Render.world(render, time);
                    render.context.setTransform(render.options.pixelRatio, 0, 0, render.options.pixelRatio, 0, 0);
                    if (render.options.showStats || render.options.showDebug) {
                      Render.stats(render, render.context, time);
                    }
                    if (render.options.showPerformance || render.options.showDebug) {
                      Render.performance(render, render.context, time);
                    }
                    render.context.setTransform(1, 0, 0, 1, 0, 0);
                  })();
                };
                Render.stop = function(render) {
                  _cancelAnimationFrame(render.frameRequestId);
                };
                Render.setPixelRatio = function(render, pixelRatio) {
                  var options = render.options, canvas = render.canvas;
                  if (pixelRatio === "auto") {
                    pixelRatio = _getPixelRatio(canvas);
                  }
                  options.pixelRatio = pixelRatio;
                  canvas.setAttribute("data-pixel-ratio", pixelRatio);
                  canvas.width = options.width * pixelRatio;
                  canvas.height = options.height * pixelRatio;
                  canvas.style.width = options.width + "px";
                  canvas.style.height = options.height + "px";
                };
                Render.setSize = function(render, width, height) {
                  render.options.width = width;
                  render.options.height = height;
                  render.bounds.max.x = render.bounds.min.x + width;
                  render.bounds.max.y = render.bounds.min.y + height;
                  if (render.options.pixelRatio !== 1) {
                    Render.setPixelRatio(render, render.options.pixelRatio);
                  } else {
                    render.canvas.width = width;
                    render.canvas.height = height;
                  }
                };
                Render.lookAt = function(render, objects, padding, center) {
                  center = typeof center !== "undefined" ? center : true;
                  objects = Common.isArray(objects) ? objects : [objects];
                  padding = padding || {
                    x: 0,
                    y: 0
                  };
                  var bounds = {
                    min: { x: Infinity, y: Infinity },
                    max: { x: -Infinity, y: -Infinity }
                  };
                  for (var i = 0; i < objects.length; i += 1) {
                    var object = objects[i], min = object.bounds ? object.bounds.min : object.min || object.position || object, max = object.bounds ? object.bounds.max : object.max || object.position || object;
                    if (min && max) {
                      if (min.x < bounds.min.x)
                        bounds.min.x = min.x;
                      if (max.x > bounds.max.x)
                        bounds.max.x = max.x;
                      if (min.y < bounds.min.y)
                        bounds.min.y = min.y;
                      if (max.y > bounds.max.y)
                        bounds.max.y = max.y;
                    }
                  }
                  var width = bounds.max.x - bounds.min.x + 2 * padding.x, height = bounds.max.y - bounds.min.y + 2 * padding.y, viewHeight = render.canvas.height, viewWidth = render.canvas.width, outerRatio = viewWidth / viewHeight, innerRatio = width / height, scaleX = 1, scaleY = 1;
                  if (innerRatio > outerRatio) {
                    scaleY = innerRatio / outerRatio;
                  } else {
                    scaleX = outerRatio / innerRatio;
                  }
                  render.options.hasBounds = true;
                  render.bounds.min.x = bounds.min.x;
                  render.bounds.max.x = bounds.min.x + width * scaleX;
                  render.bounds.min.y = bounds.min.y;
                  render.bounds.max.y = bounds.min.y + height * scaleY;
                  if (center) {
                    render.bounds.min.x += width * 0.5 - width * scaleX * 0.5;
                    render.bounds.max.x += width * 0.5 - width * scaleX * 0.5;
                    render.bounds.min.y += height * 0.5 - height * scaleY * 0.5;
                    render.bounds.max.y += height * 0.5 - height * scaleY * 0.5;
                  }
                  render.bounds.min.x -= padding.x;
                  render.bounds.max.x -= padding.x;
                  render.bounds.min.y -= padding.y;
                  render.bounds.max.y -= padding.y;
                  if (render.mouse) {
                    Mouse.setScale(render.mouse, {
                      x: (render.bounds.max.x - render.bounds.min.x) / render.canvas.width,
                      y: (render.bounds.max.y - render.bounds.min.y) / render.canvas.height
                    });
                    Mouse.setOffset(render.mouse, render.bounds.min);
                  }
                };
                Render.startViewTransform = function(render) {
                  var boundsWidth = render.bounds.max.x - render.bounds.min.x, boundsHeight = render.bounds.max.y - render.bounds.min.y, boundsScaleX = boundsWidth / render.options.width, boundsScaleY = boundsHeight / render.options.height;
                  render.context.setTransform(
                    render.options.pixelRatio / boundsScaleX,
                    0,
                    0,
                    render.options.pixelRatio / boundsScaleY,
                    0,
                    0
                  );
                  render.context.translate(-render.bounds.min.x, -render.bounds.min.y);
                };
                Render.endViewTransform = function(render) {
                  render.context.setTransform(render.options.pixelRatio, 0, 0, render.options.pixelRatio, 0, 0);
                };
                Render.world = function(render, time) {
                  var startTime = Common.now(), engine = render.engine, world = engine.world, canvas = render.canvas, context = render.context, options = render.options, timing = render.timing;
                  var allBodies = Composite2.allBodies(world), allConstraints = Composite2.allConstraints(world), background = options.wireframes ? options.wireframeBackground : options.background, bodies = [], constraints = [], i;
                  var event = {
                    timestamp: engine.timing.timestamp
                  };
                  Events2.trigger(render, "beforeRender", event);
                  if (render.currentBackground !== background)
                    _applyBackground(render, background);
                  context.globalCompositeOperation = "source-in";
                  context.fillStyle = "transparent";
                  context.fillRect(0, 0, canvas.width, canvas.height);
                  context.globalCompositeOperation = "source-over";
                  if (options.hasBounds) {
                    for (i = 0; i < allBodies.length; i++) {
                      var body = allBodies[i];
                      if (Bounds.overlaps(body.bounds, render.bounds))
                        bodies.push(body);
                    }
                    for (i = 0; i < allConstraints.length; i++) {
                      var constraint = allConstraints[i], bodyA = constraint.bodyA, bodyB = constraint.bodyB, pointAWorld = constraint.pointA, pointBWorld = constraint.pointB;
                      if (bodyA) pointAWorld = Vector.add(bodyA.position, constraint.pointA);
                      if (bodyB) pointBWorld = Vector.add(bodyB.position, constraint.pointB);
                      if (!pointAWorld || !pointBWorld)
                        continue;
                      if (Bounds.contains(render.bounds, pointAWorld) || Bounds.contains(render.bounds, pointBWorld))
                        constraints.push(constraint);
                    }
                    Render.startViewTransform(render);
                    if (render.mouse) {
                      Mouse.setScale(render.mouse, {
                        x: (render.bounds.max.x - render.bounds.min.x) / render.options.width,
                        y: (render.bounds.max.y - render.bounds.min.y) / render.options.height
                      });
                      Mouse.setOffset(render.mouse, render.bounds.min);
                    }
                  } else {
                    constraints = allConstraints;
                    bodies = allBodies;
                    if (render.options.pixelRatio !== 1) {
                      render.context.setTransform(render.options.pixelRatio, 0, 0, render.options.pixelRatio, 0, 0);
                    }
                  }
                  if (!options.wireframes || engine.enableSleeping && options.showSleeping) {
                    Render.bodies(render, bodies, context);
                  } else {
                    if (options.showConvexHulls)
                      Render.bodyConvexHulls(render, bodies, context);
                    Render.bodyWireframes(render, bodies, context);
                  }
                  if (options.showBounds)
                    Render.bodyBounds(render, bodies, context);
                  if (options.showAxes || options.showAngleIndicator)
                    Render.bodyAxes(render, bodies, context);
                  if (options.showPositions)
                    Render.bodyPositions(render, bodies, context);
                  if (options.showVelocity)
                    Render.bodyVelocity(render, bodies, context);
                  if (options.showIds)
                    Render.bodyIds(render, bodies, context);
                  if (options.showSeparations)
                    Render.separations(render, engine.pairs.list, context);
                  if (options.showCollisions)
                    Render.collisions(render, engine.pairs.list, context);
                  if (options.showVertexNumbers)
                    Render.vertexNumbers(render, bodies, context);
                  if (options.showMousePosition)
                    Render.mousePosition(render, render.mouse, context);
                  Render.constraints(constraints, context);
                  if (options.hasBounds) {
                    Render.endViewTransform(render);
                  }
                  Events2.trigger(render, "afterRender", event);
                  timing.lastElapsed = Common.now() - startTime;
                };
                Render.stats = function(render, context, time) {
                  var engine = render.engine, world = engine.world, bodies = Composite2.allBodies(world), parts = 0, width = 55, height = 44, x = 0, y = 0;
                  for (var i = 0; i < bodies.length; i += 1) {
                    parts += bodies[i].parts.length;
                  }
                  var sections = {
                    "Part": parts,
                    "Body": bodies.length,
                    "Cons": Composite2.allConstraints(world).length,
                    "Comp": Composite2.allComposites(world).length,
                    "Pair": engine.pairs.list.length
                  };
                  context.fillStyle = "#0e0f19";
                  context.fillRect(x, y, width * 5.5, height);
                  context.font = "12px Arial";
                  context.textBaseline = "top";
                  context.textAlign = "right";
                  for (var key in sections) {
                    var section = sections[key];
                    context.fillStyle = "#aaa";
                    context.fillText(key, x + width, y + 8);
                    context.fillStyle = "#eee";
                    context.fillText(section, x + width, y + 26);
                    x += width;
                  }
                };
                Render.performance = function(render, context) {
                  var engine = render.engine, timing = render.timing, deltaHistory = timing.deltaHistory, elapsedHistory = timing.elapsedHistory, timestampElapsedHistory = timing.timestampElapsedHistory, engineDeltaHistory = timing.engineDeltaHistory, engineUpdatesHistory = timing.engineUpdatesHistory, engineElapsedHistory = timing.engineElapsedHistory, lastEngineUpdatesPerFrame = engine.timing.lastUpdatesPerFrame, lastEngineDelta = engine.timing.lastDelta;
                  var deltaMean = _mean(deltaHistory), elapsedMean = _mean(elapsedHistory), engineDeltaMean = _mean(engineDeltaHistory), engineUpdatesMean = _mean(engineUpdatesHistory), engineElapsedMean = _mean(engineElapsedHistory), timestampElapsedMean = _mean(timestampElapsedHistory), rateMean = timestampElapsedMean / deltaMean || 0, neededUpdatesPerFrame = Math.round(deltaMean / lastEngineDelta), fps = 1e3 / deltaMean || 0;
                  var graphHeight = 4, gap = 12, width = 60, height = 34, x = 10, y = 69;
                  context.fillStyle = "#0e0f19";
                  context.fillRect(0, 50, gap * 5 + width * 6 + 22, height);
                  Render.status(
                    context,
                    x,
                    y,
                    width,
                    graphHeight,
                    deltaHistory.length,
                    Math.round(fps) + " fps",
                    fps / Render._goodFps,
                    function(i) {
                      return deltaHistory[i] / deltaMean - 1;
                    }
                  );
                  Render.status(
                    context,
                    x + gap + width,
                    y,
                    width,
                    graphHeight,
                    engineDeltaHistory.length,
                    lastEngineDelta.toFixed(2) + " dt",
                    Render._goodDelta / lastEngineDelta,
                    function(i) {
                      return engineDeltaHistory[i] / engineDeltaMean - 1;
                    }
                  );
                  Render.status(
                    context,
                    x + (gap + width) * 2,
                    y,
                    width,
                    graphHeight,
                    engineUpdatesHistory.length,
                    lastEngineUpdatesPerFrame + " upf",
                    Math.pow(Common.clamp(engineUpdatesMean / neededUpdatesPerFrame || 1, 0, 1), 4),
                    function(i) {
                      return engineUpdatesHistory[i] / engineUpdatesMean - 1;
                    }
                  );
                  Render.status(
                    context,
                    x + (gap + width) * 3,
                    y,
                    width,
                    graphHeight,
                    engineElapsedHistory.length,
                    engineElapsedMean.toFixed(2) + " ut",
                    1 - lastEngineUpdatesPerFrame * engineElapsedMean / Render._goodFps,
                    function(i) {
                      return engineElapsedHistory[i] / engineElapsedMean - 1;
                    }
                  );
                  Render.status(
                    context,
                    x + (gap + width) * 4,
                    y,
                    width,
                    graphHeight,
                    elapsedHistory.length,
                    elapsedMean.toFixed(2) + " rt",
                    1 - elapsedMean / Render._goodFps,
                    function(i) {
                      return elapsedHistory[i] / elapsedMean - 1;
                    }
                  );
                  Render.status(
                    context,
                    x + (gap + width) * 5,
                    y,
                    width,
                    graphHeight,
                    timestampElapsedHistory.length,
                    rateMean.toFixed(2) + " x",
                    rateMean * rateMean * rateMean,
                    function(i) {
                      return (timestampElapsedHistory[i] / deltaHistory[i] / rateMean || 0) - 1;
                    }
                  );
                };
                Render.status = function(context, x, y, width, height, count, label, indicator, plotY) {
                  context.strokeStyle = "#888";
                  context.fillStyle = "#444";
                  context.lineWidth = 1;
                  context.fillRect(x, y + 7, width, 1);
                  context.beginPath();
                  context.moveTo(x, y + 7 - height * Common.clamp(0.4 * plotY(0), -2, 2));
                  for (var i = 0; i < width; i += 1) {
                    context.lineTo(x + i, y + 7 - (i < count ? height * Common.clamp(0.4 * plotY(i), -2, 2) : 0));
                  }
                  context.stroke();
                  context.fillStyle = "hsl(" + Common.clamp(25 + 95 * indicator, 0, 120) + ",100%,60%)";
                  context.fillRect(x, y - 7, 4, 4);
                  context.font = "12px Arial";
                  context.textBaseline = "middle";
                  context.textAlign = "right";
                  context.fillStyle = "#eee";
                  context.fillText(label, x + width, y - 5);
                };
                Render.constraints = function(constraints, context) {
                  var c = context;
                  for (var i = 0; i < constraints.length; i++) {
                    var constraint = constraints[i];
                    if (!constraint.render.visible || !constraint.pointA || !constraint.pointB)
                      continue;
                    var bodyA = constraint.bodyA, bodyB = constraint.bodyB, start, end;
                    if (bodyA) {
                      start = Vector.add(bodyA.position, constraint.pointA);
                    } else {
                      start = constraint.pointA;
                    }
                    if (constraint.render.type === "pin") {
                      c.beginPath();
                      c.arc(start.x, start.y, 3, 0, 2 * Math.PI);
                      c.closePath();
                    } else {
                      if (bodyB) {
                        end = Vector.add(bodyB.position, constraint.pointB);
                      } else {
                        end = constraint.pointB;
                      }
                      c.beginPath();
                      c.moveTo(start.x, start.y);
                      if (constraint.render.type === "spring") {
                        var delta = Vector.sub(end, start), normal = Vector.perp(Vector.normalise(delta)), coils = Math.ceil(Common.clamp(constraint.length / 5, 12, 20)), offset;
                        for (var j = 1; j < coils; j += 1) {
                          offset = j % 2 === 0 ? 1 : -1;
                          c.lineTo(
                            start.x + delta.x * (j / coils) + normal.x * offset * 4,
                            start.y + delta.y * (j / coils) + normal.y * offset * 4
                          );
                        }
                      }
                      c.lineTo(end.x, end.y);
                    }
                    if (constraint.render.lineWidth) {
                      c.lineWidth = constraint.render.lineWidth;
                      c.strokeStyle = constraint.render.strokeStyle;
                      c.stroke();
                    }
                    if (constraint.render.anchors) {
                      c.fillStyle = constraint.render.strokeStyle;
                      c.beginPath();
                      c.arc(start.x, start.y, 3, 0, 2 * Math.PI);
                      c.arc(end.x, end.y, 3, 0, 2 * Math.PI);
                      c.closePath();
                      c.fill();
                    }
                  }
                };
                Render.bodies = function(render, bodies, context) {
                  var c = context, engine = render.engine, options = render.options, showInternalEdges = options.showInternalEdges || !options.wireframes, body, part, i, k;
                  for (i = 0; i < bodies.length; i++) {
                    body = bodies[i];
                    if (!body.render.visible)
                      continue;
                    for (k = body.parts.length > 1 ? 1 : 0; k < body.parts.length; k++) {
                      part = body.parts[k];
                      if (!part.render.visible)
                        continue;
                      if (options.showSleeping && body.isSleeping) {
                        c.globalAlpha = 0.5 * part.render.opacity;
                      } else if (part.render.opacity !== 1) {
                        c.globalAlpha = part.render.opacity;
                      }
                      if (part.render.sprite && part.render.sprite.texture && !options.wireframes) {
                        var sprite = part.render.sprite, texture = _getTexture(render, sprite.texture);
                        c.translate(part.position.x, part.position.y);
                        c.rotate(part.angle);
                        c.drawImage(
                          texture,
                          texture.width * -sprite.xOffset * sprite.xScale,
                          texture.height * -sprite.yOffset * sprite.yScale,
                          texture.width * sprite.xScale,
                          texture.height * sprite.yScale
                        );
                        c.rotate(-part.angle);
                        c.translate(-part.position.x, -part.position.y);
                      } else {
                        if (part.circleRadius) {
                          c.beginPath();
                          c.arc(part.position.x, part.position.y, part.circleRadius, 0, 2 * Math.PI);
                        } else {
                          c.beginPath();
                          c.moveTo(part.vertices[0].x, part.vertices[0].y);
                          for (var j = 1; j < part.vertices.length; j++) {
                            if (!part.vertices[j - 1].isInternal || showInternalEdges) {
                              c.lineTo(part.vertices[j].x, part.vertices[j].y);
                            } else {
                              c.moveTo(part.vertices[j].x, part.vertices[j].y);
                            }
                            if (part.vertices[j].isInternal && !showInternalEdges) {
                              c.moveTo(part.vertices[(j + 1) % part.vertices.length].x, part.vertices[(j + 1) % part.vertices.length].y);
                            }
                          }
                          c.lineTo(part.vertices[0].x, part.vertices[0].y);
                          c.closePath();
                        }
                        if (!options.wireframes) {
                          c.fillStyle = part.render.fillStyle;
                          if (part.render.lineWidth) {
                            c.lineWidth = part.render.lineWidth;
                            c.strokeStyle = part.render.strokeStyle;
                            c.stroke();
                          }
                          c.fill();
                        } else {
                          c.lineWidth = 1;
                          c.strokeStyle = render.options.wireframeStrokeStyle;
                          c.stroke();
                        }
                      }
                      c.globalAlpha = 1;
                    }
                  }
                };
                Render.bodyWireframes = function(render, bodies, context) {
                  var c = context, showInternalEdges = render.options.showInternalEdges, body, part, i, j, k;
                  c.beginPath();
                  for (i = 0; i < bodies.length; i++) {
                    body = bodies[i];
                    if (!body.render.visible)
                      continue;
                    for (k = body.parts.length > 1 ? 1 : 0; k < body.parts.length; k++) {
                      part = body.parts[k];
                      c.moveTo(part.vertices[0].x, part.vertices[0].y);
                      for (j = 1; j < part.vertices.length; j++) {
                        if (!part.vertices[j - 1].isInternal || showInternalEdges) {
                          c.lineTo(part.vertices[j].x, part.vertices[j].y);
                        } else {
                          c.moveTo(part.vertices[j].x, part.vertices[j].y);
                        }
                        if (part.vertices[j].isInternal && !showInternalEdges) {
                          c.moveTo(part.vertices[(j + 1) % part.vertices.length].x, part.vertices[(j + 1) % part.vertices.length].y);
                        }
                      }
                      c.lineTo(part.vertices[0].x, part.vertices[0].y);
                    }
                  }
                  c.lineWidth = 1;
                  c.strokeStyle = render.options.wireframeStrokeStyle;
                  c.stroke();
                };
                Render.bodyConvexHulls = function(render, bodies, context) {
                  var c = context, body, part, i, j, k;
                  c.beginPath();
                  for (i = 0; i < bodies.length; i++) {
                    body = bodies[i];
                    if (!body.render.visible || body.parts.length === 1)
                      continue;
                    c.moveTo(body.vertices[0].x, body.vertices[0].y);
                    for (j = 1; j < body.vertices.length; j++) {
                      c.lineTo(body.vertices[j].x, body.vertices[j].y);
                    }
                    c.lineTo(body.vertices[0].x, body.vertices[0].y);
                  }
                  c.lineWidth = 1;
                  c.strokeStyle = "rgba(255,255,255,0.2)";
                  c.stroke();
                };
                Render.vertexNumbers = function(render, bodies, context) {
                  var c = context, i, j, k;
                  for (i = 0; i < bodies.length; i++) {
                    var parts = bodies[i].parts;
                    for (k = parts.length > 1 ? 1 : 0; k < parts.length; k++) {
                      var part = parts[k];
                      for (j = 0; j < part.vertices.length; j++) {
                        c.fillStyle = "rgba(255,255,255,0.2)";
                        c.fillText(i + "_" + j, part.position.x + (part.vertices[j].x - part.position.x) * 0.8, part.position.y + (part.vertices[j].y - part.position.y) * 0.8);
                      }
                    }
                  }
                };
                Render.mousePosition = function(render, mouse, context) {
                  var c = context;
                  c.fillStyle = "rgba(255,255,255,0.8)";
                  c.fillText(mouse.position.x + "  " + mouse.position.y, mouse.position.x + 5, mouse.position.y - 5);
                };
                Render.bodyBounds = function(render, bodies, context) {
                  var c = context, engine = render.engine, options = render.options;
                  c.beginPath();
                  for (var i = 0; i < bodies.length; i++) {
                    var body = bodies[i];
                    if (body.render.visible) {
                      var parts = bodies[i].parts;
                      for (var j = parts.length > 1 ? 1 : 0; j < parts.length; j++) {
                        var part = parts[j];
                        c.rect(part.bounds.min.x, part.bounds.min.y, part.bounds.max.x - part.bounds.min.x, part.bounds.max.y - part.bounds.min.y);
                      }
                    }
                  }
                  if (options.wireframes) {
                    c.strokeStyle = "rgba(255,255,255,0.08)";
                  } else {
                    c.strokeStyle = "rgba(0,0,0,0.1)";
                  }
                  c.lineWidth = 1;
                  c.stroke();
                };
                Render.bodyAxes = function(render, bodies, context) {
                  var c = context, engine = render.engine, options = render.options, part, i, j, k;
                  c.beginPath();
                  for (i = 0; i < bodies.length; i++) {
                    var body = bodies[i], parts = body.parts;
                    if (!body.render.visible)
                      continue;
                    if (options.showAxes) {
                      for (j = parts.length > 1 ? 1 : 0; j < parts.length; j++) {
                        part = parts[j];
                        for (k = 0; k < part.axes.length; k++) {
                          var axis = part.axes[k];
                          c.moveTo(part.position.x, part.position.y);
                          c.lineTo(part.position.x + axis.x * 20, part.position.y + axis.y * 20);
                        }
                      }
                    } else {
                      for (j = parts.length > 1 ? 1 : 0; j < parts.length; j++) {
                        part = parts[j];
                        for (k = 0; k < part.axes.length; k++) {
                          c.moveTo(part.position.x, part.position.y);
                          c.lineTo(
                            (part.vertices[0].x + part.vertices[part.vertices.length - 1].x) / 2,
                            (part.vertices[0].y + part.vertices[part.vertices.length - 1].y) / 2
                          );
                        }
                      }
                    }
                  }
                  if (options.wireframes) {
                    c.strokeStyle = "indianred";
                    c.lineWidth = 1;
                  } else {
                    c.strokeStyle = "rgba(255, 255, 255, 0.4)";
                    c.globalCompositeOperation = "overlay";
                    c.lineWidth = 2;
                  }
                  c.stroke();
                  c.globalCompositeOperation = "source-over";
                };
                Render.bodyPositions = function(render, bodies, context) {
                  var c = context, engine = render.engine, options = render.options, body, part, i, k;
                  c.beginPath();
                  for (i = 0; i < bodies.length; i++) {
                    body = bodies[i];
                    if (!body.render.visible)
                      continue;
                    for (k = 0; k < body.parts.length; k++) {
                      part = body.parts[k];
                      c.arc(part.position.x, part.position.y, 3, 0, 2 * Math.PI, false);
                      c.closePath();
                    }
                  }
                  if (options.wireframes) {
                    c.fillStyle = "indianred";
                  } else {
                    c.fillStyle = "rgba(0,0,0,0.5)";
                  }
                  c.fill();
                  c.beginPath();
                  for (i = 0; i < bodies.length; i++) {
                    body = bodies[i];
                    if (body.render.visible) {
                      c.arc(body.positionPrev.x, body.positionPrev.y, 2, 0, 2 * Math.PI, false);
                      c.closePath();
                    }
                  }
                  c.fillStyle = "rgba(255,165,0,0.8)";
                  c.fill();
                };
                Render.bodyVelocity = function(render, bodies, context) {
                  var c = context;
                  c.beginPath();
                  for (var i = 0; i < bodies.length; i++) {
                    var body = bodies[i];
                    if (!body.render.visible)
                      continue;
                    var velocity = Body2.getVelocity(body);
                    c.moveTo(body.position.x, body.position.y);
                    c.lineTo(body.position.x + velocity.x, body.position.y + velocity.y);
                  }
                  c.lineWidth = 3;
                  c.strokeStyle = "cornflowerblue";
                  c.stroke();
                };
                Render.bodyIds = function(render, bodies, context) {
                  var c = context, i, j;
                  for (i = 0; i < bodies.length; i++) {
                    if (!bodies[i].render.visible)
                      continue;
                    var parts = bodies[i].parts;
                    for (j = parts.length > 1 ? 1 : 0; j < parts.length; j++) {
                      var part = parts[j];
                      c.font = "12px Arial";
                      c.fillStyle = "rgba(255,255,255,0.5)";
                      c.fillText(part.id, part.position.x + 10, part.position.y - 10);
                    }
                  }
                };
                Render.collisions = function(render, pairs, context) {
                  var c = context, options = render.options, pair, collision, corrected, bodyA, bodyB, i, j;
                  c.beginPath();
                  for (i = 0; i < pairs.length; i++) {
                    pair = pairs[i];
                    if (!pair.isActive)
                      continue;
                    collision = pair.collision;
                    for (j = 0; j < pair.contactCount; j++) {
                      var contact = pair.contacts[j], vertex = contact.vertex;
                      c.rect(vertex.x - 1.5, vertex.y - 1.5, 3.5, 3.5);
                    }
                  }
                  if (options.wireframes) {
                    c.fillStyle = "rgba(255,255,255,0.7)";
                  } else {
                    c.fillStyle = "orange";
                  }
                  c.fill();
                  c.beginPath();
                  for (i = 0; i < pairs.length; i++) {
                    pair = pairs[i];
                    if (!pair.isActive)
                      continue;
                    collision = pair.collision;
                    if (pair.contactCount > 0) {
                      var normalPosX = pair.contacts[0].vertex.x, normalPosY = pair.contacts[0].vertex.y;
                      if (pair.contactCount === 2) {
                        normalPosX = (pair.contacts[0].vertex.x + pair.contacts[1].vertex.x) / 2;
                        normalPosY = (pair.contacts[0].vertex.y + pair.contacts[1].vertex.y) / 2;
                      }
                      if (collision.bodyB === collision.supports[0].body || collision.bodyA.isStatic === true) {
                        c.moveTo(normalPosX - collision.normal.x * 8, normalPosY - collision.normal.y * 8);
                      } else {
                        c.moveTo(normalPosX + collision.normal.x * 8, normalPosY + collision.normal.y * 8);
                      }
                      c.lineTo(normalPosX, normalPosY);
                    }
                  }
                  if (options.wireframes) {
                    c.strokeStyle = "rgba(255,165,0,0.7)";
                  } else {
                    c.strokeStyle = "orange";
                  }
                  c.lineWidth = 1;
                  c.stroke();
                };
                Render.separations = function(render, pairs, context) {
                  var c = context, options = render.options, pair, collision, corrected, bodyA, bodyB, i, j;
                  c.beginPath();
                  for (i = 0; i < pairs.length; i++) {
                    pair = pairs[i];
                    if (!pair.isActive)
                      continue;
                    collision = pair.collision;
                    bodyA = collision.bodyA;
                    bodyB = collision.bodyB;
                    var k = 1;
                    if (!bodyB.isStatic && !bodyA.isStatic) k = 0.5;
                    if (bodyB.isStatic) k = 0;
                    c.moveTo(bodyB.position.x, bodyB.position.y);
                    c.lineTo(bodyB.position.x - collision.penetration.x * k, bodyB.position.y - collision.penetration.y * k);
                    k = 1;
                    if (!bodyB.isStatic && !bodyA.isStatic) k = 0.5;
                    if (bodyA.isStatic) k = 0;
                    c.moveTo(bodyA.position.x, bodyA.position.y);
                    c.lineTo(bodyA.position.x + collision.penetration.x * k, bodyA.position.y + collision.penetration.y * k);
                  }
                  if (options.wireframes) {
                    c.strokeStyle = "rgba(255,165,0,0.5)";
                  } else {
                    c.strokeStyle = "orange";
                  }
                  c.stroke();
                };
                Render.inspector = function(inspector, context) {
                  var engine = inspector.engine, selected = inspector.selected, render = inspector.render, options = render.options, bounds;
                  if (options.hasBounds) {
                    var boundsWidth = render.bounds.max.x - render.bounds.min.x, boundsHeight = render.bounds.max.y - render.bounds.min.y, boundsScaleX = boundsWidth / render.options.width, boundsScaleY = boundsHeight / render.options.height;
                    context.scale(1 / boundsScaleX, 1 / boundsScaleY);
                    context.translate(-render.bounds.min.x, -render.bounds.min.y);
                  }
                  for (var i = 0; i < selected.length; i++) {
                    var item = selected[i].data;
                    context.translate(0.5, 0.5);
                    context.lineWidth = 1;
                    context.strokeStyle = "rgba(255,165,0,0.9)";
                    context.setLineDash([1, 2]);
                    switch (item.type) {
                      case "body":
                        bounds = item.bounds;
                        context.beginPath();
                        context.rect(
                          Math.floor(bounds.min.x - 3),
                          Math.floor(bounds.min.y - 3),
                          Math.floor(bounds.max.x - bounds.min.x + 6),
                          Math.floor(bounds.max.y - bounds.min.y + 6)
                        );
                        context.closePath();
                        context.stroke();
                        break;
                      case "constraint":
                        var point2 = item.pointA;
                        if (item.bodyA)
                          point2 = item.pointB;
                        context.beginPath();
                        context.arc(point2.x, point2.y, 10, 0, 2 * Math.PI);
                        context.closePath();
                        context.stroke();
                        break;
                    }
                    context.setLineDash([]);
                    context.translate(-0.5, -0.5);
                  }
                  if (inspector.selectStart !== null) {
                    context.translate(0.5, 0.5);
                    context.lineWidth = 1;
                    context.strokeStyle = "rgba(255,165,0,0.6)";
                    context.fillStyle = "rgba(255,165,0,0.1)";
                    bounds = inspector.selectBounds;
                    context.beginPath();
                    context.rect(
                      Math.floor(bounds.min.x),
                      Math.floor(bounds.min.y),
                      Math.floor(bounds.max.x - bounds.min.x),
                      Math.floor(bounds.max.y - bounds.min.y)
                    );
                    context.closePath();
                    context.stroke();
                    context.fill();
                    context.translate(-0.5, -0.5);
                  }
                  if (options.hasBounds)
                    context.setTransform(1, 0, 0, 1, 0, 0);
                };
                var _updateTiming = function(render, time) {
                  var engine = render.engine, timing = render.timing, historySize = timing.historySize, timestamp = engine.timing.timestamp;
                  timing.delta = time - timing.lastTime || Render._goodDelta;
                  timing.lastTime = time;
                  timing.timestampElapsed = timestamp - timing.lastTimestamp || 0;
                  timing.lastTimestamp = timestamp;
                  timing.deltaHistory.unshift(timing.delta);
                  timing.deltaHistory.length = Math.min(timing.deltaHistory.length, historySize);
                  timing.engineDeltaHistory.unshift(engine.timing.lastDelta);
                  timing.engineDeltaHistory.length = Math.min(timing.engineDeltaHistory.length, historySize);
                  timing.timestampElapsedHistory.unshift(timing.timestampElapsed);
                  timing.timestampElapsedHistory.length = Math.min(timing.timestampElapsedHistory.length, historySize);
                  timing.engineUpdatesHistory.unshift(engine.timing.lastUpdatesPerFrame);
                  timing.engineUpdatesHistory.length = Math.min(timing.engineUpdatesHistory.length, historySize);
                  timing.engineElapsedHistory.unshift(engine.timing.lastElapsed);
                  timing.engineElapsedHistory.length = Math.min(timing.engineElapsedHistory.length, historySize);
                  timing.elapsedHistory.unshift(timing.lastElapsed);
                  timing.elapsedHistory.length = Math.min(timing.elapsedHistory.length, historySize);
                };
                var _mean = function(values) {
                  var result = 0;
                  for (var i = 0; i < values.length; i += 1) {
                    result += values[i];
                  }
                  return result / values.length || 0;
                };
                var _createCanvas = function(width, height) {
                  var canvas = document.createElement("canvas");
                  canvas.width = width;
                  canvas.height = height;
                  canvas.oncontextmenu = function() {
                    return false;
                  };
                  canvas.onselectstart = function() {
                    return false;
                  };
                  return canvas;
                };
                var _getPixelRatio = function(canvas) {
                  var context = canvas.getContext("2d"), devicePixelRatio2 = window.devicePixelRatio || 1, backingStorePixelRatio = context.webkitBackingStorePixelRatio || context.mozBackingStorePixelRatio || context.msBackingStorePixelRatio || context.oBackingStorePixelRatio || context.backingStorePixelRatio || 1;
                  return devicePixelRatio2 / backingStorePixelRatio;
                };
                var _getTexture = function(render, imagePath) {
                  var image = render.textures[imagePath];
                  if (image)
                    return image;
                  image = render.textures[imagePath] = new Image();
                  image.src = imagePath;
                  return image;
                };
                var _applyBackground = function(render, background) {
                  var cssBackground = background;
                  if (/(jpg|gif|png)$/.test(background))
                    cssBackground = "url(" + background + ")";
                  render.canvas.style.background = cssBackground;
                  render.canvas.style.backgroundSize = "contain";
                  render.currentBackground = background;
                };
              })();
            }),
            /* 27 */
            /***/
            (function(module2, exports2, __webpack_require__) {
              var Runner = {};
              module2.exports = Runner;
              var Events2 = __webpack_require__(5);
              var Engine2 = __webpack_require__(17);
              var Common = __webpack_require__(0);
              (function() {
                Runner._maxFrameDelta = 1e3 / 15;
                Runner._frameDeltaFallback = 1e3 / 60;
                Runner._timeBufferMargin = 1.5;
                Runner._elapsedNextEstimate = 1;
                Runner._smoothingLowerBound = 0.1;
                Runner._smoothingUpperBound = 0.9;
                Runner.create = function(options) {
                  var defaults = {
                    delta: 1e3 / 60,
                    frameDelta: null,
                    frameDeltaSmoothing: true,
                    frameDeltaSnapping: true,
                    frameDeltaHistory: [],
                    frameDeltaHistorySize: 100,
                    frameRequestId: null,
                    timeBuffer: 0,
                    timeLastTick: null,
                    maxUpdates: null,
                    maxFrameTime: 1e3 / 30,
                    lastUpdatesDeferred: 0,
                    enabled: true
                  };
                  var runner = Common.extend(defaults, options);
                  runner.fps = 0;
                  return runner;
                };
                Runner.run = function(runner, engine) {
                  runner.timeBuffer = Runner._frameDeltaFallback;
                  (function onFrame(time) {
                    runner.frameRequestId = Runner._onNextFrame(runner, onFrame);
                    if (time && runner.enabled) {
                      Runner.tick(runner, engine, time);
                    }
                  })();
                  return runner;
                };
                Runner.tick = function(runner, engine, time) {
                  var tickStartTime = Common.now(), engineDelta = runner.delta, updateCount = 0;
                  var frameDelta = time - runner.timeLastTick;
                  if (!frameDelta || !runner.timeLastTick || frameDelta > Math.max(Runner._maxFrameDelta, runner.maxFrameTime)) {
                    frameDelta = runner.frameDelta || Runner._frameDeltaFallback;
                  }
                  if (runner.frameDeltaSmoothing) {
                    runner.frameDeltaHistory.push(frameDelta);
                    runner.frameDeltaHistory = runner.frameDeltaHistory.slice(-runner.frameDeltaHistorySize);
                    var deltaHistorySorted = runner.frameDeltaHistory.slice(0).sort();
                    var deltaHistoryWindow = runner.frameDeltaHistory.slice(
                      deltaHistorySorted.length * Runner._smoothingLowerBound,
                      deltaHistorySorted.length * Runner._smoothingUpperBound
                    );
                    var frameDeltaSmoothed = _mean(deltaHistoryWindow);
                    frameDelta = frameDeltaSmoothed || frameDelta;
                  }
                  if (runner.frameDeltaSnapping) {
                    frameDelta = 1e3 / Math.round(1e3 / frameDelta);
                  }
                  runner.frameDelta = frameDelta;
                  runner.timeLastTick = time;
                  runner.timeBuffer += runner.frameDelta;
                  runner.timeBuffer = Common.clamp(
                    runner.timeBuffer,
                    0,
                    runner.frameDelta + engineDelta * Runner._timeBufferMargin
                  );
                  runner.lastUpdatesDeferred = 0;
                  var maxUpdates = runner.maxUpdates || Math.ceil(runner.maxFrameTime / engineDelta);
                  var event = {
                    timestamp: engine.timing.timestamp
                  };
                  Events2.trigger(runner, "beforeTick", event);
                  Events2.trigger(runner, "tick", event);
                  var updateStartTime = Common.now();
                  while (engineDelta > 0 && runner.timeBuffer >= engineDelta * Runner._timeBufferMargin) {
                    Events2.trigger(runner, "beforeUpdate", event);
                    Engine2.update(engine, engineDelta);
                    Events2.trigger(runner, "afterUpdate", event);
                    runner.timeBuffer -= engineDelta;
                    updateCount += 1;
                    var elapsedTimeTotal = Common.now() - tickStartTime, elapsedTimeUpdates = Common.now() - updateStartTime, elapsedNextEstimate = elapsedTimeTotal + Runner._elapsedNextEstimate * elapsedTimeUpdates / updateCount;
                    if (updateCount >= maxUpdates || elapsedNextEstimate > runner.maxFrameTime) {
                      runner.lastUpdatesDeferred = Math.round(Math.max(0, runner.timeBuffer / engineDelta - Runner._timeBufferMargin));
                      break;
                    }
                  }
                  engine.timing.lastUpdatesPerFrame = updateCount;
                  Events2.trigger(runner, "afterTick", event);
                  if (runner.frameDeltaHistory.length >= 100) {
                    if (runner.lastUpdatesDeferred && Math.round(runner.frameDelta / engineDelta) > maxUpdates) {
                      Common.warnOnce("Matter.Runner: runner reached runner.maxUpdates, see docs.");
                    } else if (runner.lastUpdatesDeferred) {
                      Common.warnOnce("Matter.Runner: runner reached runner.maxFrameTime, see docs.");
                    }
                    if (typeof runner.isFixed !== "undefined") {
                      Common.warnOnce("Matter.Runner: runner.isFixed is now redundant, see docs.");
                    }
                    if (runner.deltaMin || runner.deltaMax) {
                      Common.warnOnce("Matter.Runner: runner.deltaMin and runner.deltaMax were removed, see docs.");
                    }
                    if (runner.fps !== 0) {
                      Common.warnOnce("Matter.Runner: runner.fps was replaced by runner.delta, see docs.");
                    }
                  }
                };
                Runner.stop = function(runner) {
                  Runner._cancelNextFrame(runner);
                };
                Runner._onNextFrame = function(runner, callback) {
                  if (typeof window !== "undefined" && window.requestAnimationFrame) {
                    runner.frameRequestId = window.requestAnimationFrame(callback);
                  } else {
                    throw new Error("Matter.Runner: missing required global window.requestAnimationFrame.");
                  }
                  return runner.frameRequestId;
                };
                Runner._cancelNextFrame = function(runner) {
                  if (typeof window !== "undefined" && window.cancelAnimationFrame) {
                    window.cancelAnimationFrame(runner.frameRequestId);
                  } else {
                    throw new Error("Matter.Runner: missing required global window.cancelAnimationFrame.");
                  }
                };
                var _mean = function(values) {
                  var result = 0, valuesLength = values.length;
                  for (var i = 0; i < valuesLength; i += 1) {
                    result += values[i];
                  }
                  return result / valuesLength || 0;
                };
              })();
            }),
            /* 28 */
            /***/
            (function(module2, exports2, __webpack_require__) {
              var SAT = {};
              module2.exports = SAT;
              var Collision = __webpack_require__(8);
              var Common = __webpack_require__(0);
              var deprecated = Common.deprecated;
              (function() {
                SAT.collides = function(bodyA, bodyB) {
                  return Collision.collides(bodyA, bodyB);
                };
                deprecated(SAT, "collides", "SAT.collides ➤ replaced by Collision.collides");
              })();
            }),
            /* 29 */
            /***/
            (function(module2, exports2, __webpack_require__) {
              var Svg = {};
              module2.exports = Svg;
              var Bounds = __webpack_require__(1);
              var Common = __webpack_require__(0);
              (function() {
                Svg.pathToVertices = function(path, sampleLength) {
                  if (typeof window !== "undefined" && !("SVGPathSeg" in window)) {
                    Common.warn("Svg.pathToVertices: SVGPathSeg not defined, a polyfill is required.");
                  }
                  var i, il, total, point2, segment, segments, segmentsQueue, lastSegment, lastPoint, segmentIndex, points = [], lx, ly, length = 0, x = 0, y = 0;
                  sampleLength = sampleLength || 15;
                  var addPoint = function(px, py, pathSegType) {
                    var isRelative = pathSegType % 2 === 1 && pathSegType > 1;
                    if (!lastPoint || px != lastPoint.x || py != lastPoint.y) {
                      if (lastPoint && isRelative) {
                        lx = lastPoint.x;
                        ly = lastPoint.y;
                      } else {
                        lx = 0;
                        ly = 0;
                      }
                      var point3 = {
                        x: lx + px,
                        y: ly + py
                      };
                      if (isRelative || !lastPoint) {
                        lastPoint = point3;
                      }
                      points.push(point3);
                      x = lx + px;
                      y = ly + py;
                    }
                  };
                  var addSegmentPoint = function(segment2) {
                    var segType = segment2.pathSegTypeAsLetter.toUpperCase();
                    if (segType === "Z")
                      return;
                    switch (segType) {
                      case "M":
                      case "L":
                      case "T":
                      case "C":
                      case "S":
                      case "Q":
                        x = segment2.x;
                        y = segment2.y;
                        break;
                      case "H":
                        x = segment2.x;
                        break;
                      case "V":
                        y = segment2.y;
                        break;
                    }
                    addPoint(x, y, segment2.pathSegType);
                  };
                  Svg._svgPathToAbsolute(path);
                  total = path.getTotalLength();
                  segments = [];
                  for (i = 0; i < path.pathSegList.numberOfItems; i += 1)
                    segments.push(path.pathSegList.getItem(i));
                  segmentsQueue = segments.concat();
                  while (length < total) {
                    segmentIndex = path.getPathSegAtLength(length);
                    segment = segments[segmentIndex];
                    if (segment != lastSegment) {
                      while (segmentsQueue.length && segmentsQueue[0] != segment)
                        addSegmentPoint(segmentsQueue.shift());
                      lastSegment = segment;
                    }
                    switch (segment.pathSegTypeAsLetter.toUpperCase()) {
                      case "C":
                      case "T":
                      case "S":
                      case "Q":
                      case "A":
                        point2 = path.getPointAtLength(length);
                        addPoint(point2.x, point2.y, 0);
                        break;
                    }
                    length += sampleLength;
                  }
                  for (i = 0, il = segmentsQueue.length; i < il; ++i)
                    addSegmentPoint(segmentsQueue[i]);
                  return points;
                };
                Svg._svgPathToAbsolute = function(path) {
                  var x0, y0, x1, y1, x2, y2, segs = path.pathSegList, x = 0, y = 0, len = segs.numberOfItems;
                  for (var i = 0; i < len; ++i) {
                    var seg = segs.getItem(i), segType = seg.pathSegTypeAsLetter;
                    if (/[MLHVCSQTA]/.test(segType)) {
                      if ("x" in seg) x = seg.x;
                      if ("y" in seg) y = seg.y;
                    } else {
                      if ("x1" in seg) x1 = x + seg.x1;
                      if ("x2" in seg) x2 = x + seg.x2;
                      if ("y1" in seg) y1 = y + seg.y1;
                      if ("y2" in seg) y2 = y + seg.y2;
                      if ("x" in seg) x += seg.x;
                      if ("y" in seg) y += seg.y;
                      switch (segType) {
                        case "m":
                          segs.replaceItem(path.createSVGPathSegMovetoAbs(x, y), i);
                          break;
                        case "l":
                          segs.replaceItem(path.createSVGPathSegLinetoAbs(x, y), i);
                          break;
                        case "h":
                          segs.replaceItem(path.createSVGPathSegLinetoHorizontalAbs(x), i);
                          break;
                        case "v":
                          segs.replaceItem(path.createSVGPathSegLinetoVerticalAbs(y), i);
                          break;
                        case "c":
                          segs.replaceItem(path.createSVGPathSegCurvetoCubicAbs(x, y, x1, y1, x2, y2), i);
                          break;
                        case "s":
                          segs.replaceItem(path.createSVGPathSegCurvetoCubicSmoothAbs(x, y, x2, y2), i);
                          break;
                        case "q":
                          segs.replaceItem(path.createSVGPathSegCurvetoQuadraticAbs(x, y, x1, y1), i);
                          break;
                        case "t":
                          segs.replaceItem(path.createSVGPathSegCurvetoQuadraticSmoothAbs(x, y), i);
                          break;
                        case "a":
                          segs.replaceItem(path.createSVGPathSegArcAbs(x, y, seg.r1, seg.r2, seg.angle, seg.largeArcFlag, seg.sweepFlag), i);
                          break;
                        case "z":
                        case "Z":
                          x = x0;
                          y = y0;
                          break;
                      }
                    }
                    if (segType == "M" || segType == "m") {
                      x0 = x;
                      y0 = y;
                    }
                  }
                };
              })();
            }),
            /* 30 */
            /***/
            (function(module2, exports2, __webpack_require__) {
              var World = {};
              module2.exports = World;
              var Composite2 = __webpack_require__(6);
              var Common = __webpack_require__(0);
              (function() {
                World.create = Composite2.create;
                World.add = Composite2.add;
                World.remove = Composite2.remove;
                World.clear = Composite2.clear;
                World.addComposite = Composite2.addComposite;
                World.addBody = Composite2.addBody;
                World.addConstraint = Composite2.addConstraint;
              })();
            })
            /******/
          ])
        );
      });
    }
  });

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

  // .build/typescript/content/catalog.js
  var CHAPTERS = [
    { id: "wugong", name: "武功山", mapPage: "wugong-walk.html", artPage: "wugong-art.html", cover: {
      kicker: "东江村经典反穿 · 两天一夜",
      title: "沿着草甸，把山野收进手帐。",
      copy: "从东江村穿过林间与草甸，在观音宕过夜。第二天经过吊马桩和金顶，沿景区山路下到大门。走到风景里，留下一幅手绘。",
      action: "从东江村出发 →",
      hint: "跟随山路 · 沿途实景 · 手绘互动与旅行手帐"
    } },
    { id: "tiger", name: "虎跳峡", mapPage: "tiger-walk.html", artPage: "tiger-art.html", cover: {
      kicker: "虎跳峡高路 · 两天一夜",
      title: "从高路，走到金沙江边。",
      copy: "从桥头越过二十八道拐，在中途客栈住一晚。清晨经龙洞瀑布走到中峡客栈，也可沿小路下到中虎跳江边，再循原路返回。",
      action: "从桥头出发 →",
      hint: "中途客栈过夜 · 沿途实景 · 手绘收藏"
    } },
    { id: "aotai", name: "鳌太线", mapPage: "aotai-walk.html", artPage: "aotai-art.html", cover: {
      kicker: "鳌太线 · 冬季历史路线",
      title: "循着山脊，走进云与石之间。",
      copy: "从塘口村上鳌山，翻过飞机梁、金字塔与太白梁，走向大爷海和拔仙台。沿历史路线上下山，在途中歇脚过夜，把山野相遇收进手帐，最后经下板寺向汤峪方向离山。",
      action: "走进秦岭 →",
      hint: "历史路线示意 · 多程过夜 · 手绘收藏"
    } },
    { id: "maclehose", name: "麦理浩径", mapPage: "maclehose-walk.html", artPage: "maclehose-art.html", cover: {
      kicker: "麦理浩径第二段 · 一日海岸",
      title: "翻过山，海就在那里。",
      copy: "从浪茄翻过西湾山，走过西湾与咸田湾的沙岸。越过大浪坳，在赤径的潮水边歇脚，再沿林间山径走到北潭凹。",
      action: "从浪茄出发 →",
      hint: "浪茄 → 北潭凹 · 海岸实景 · 手绘收藏"
    } },
    ...Object.values(DAY_ROUTES).map((route) => ({
      id: route.id,
      name: route.name,
      mapPage: `${route.id}-walk.html`,
      artPage: `${route.id}-art.html`,
      cover: {
        kicker: `${route.region} · ${route.id === "changping" ? "十月彩林 · 一日往返" : route.id === "mogan" ? "古道选段" : "溪谷与茶园"}`,
        title: route.title,
        copy: `${route.subtitle}。${route.note}`,
        action: `从${route.places[0].name}出发 →`,
        hint: "沿途实景 · 手绘互动 · 旅行手帐"
      }
    }))
  ];
  function chapterFor(id2) {
    return CHAPTERS.find((chapter2) => chapter2.id === id2) ?? null;
  }
  var ROUTE_SUMMARIES = CHAPTERS.map(({ id: id2, name }) => ({ id: id2, name }));

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

  // .build/typescript/content/art-events.js
  var ART_EVENTS = {
    wugong: [WUGONG_EVENTS.kite, WUGONG_EVENTS.encounter, WUGONG_EVENTS.clouds, WUGONG_EVENTS.stones],
    tiger: Object.values(EVENTS),
    aotai: Object.values(CUES),
    maclehose: Object.values(CUES2),
    changping: DAY_ROUTES.changping.events,
    mogan: DAY_ROUTES.mogan.events,
    westlake: DAY_ROUTES.westlake.events
  };

  // .build/typescript/runtime/dom.js
  function createDom(document2) {
    function get(id2) {
      const element = document2.getElementById(id2);
      if (!element)
        throw new Error(`Missing game element: ${id2}`);
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
    function text(id2, value) {
      const element = get(id2);
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
      const session2 = { id: ++serial, name, returnStatus };
      sessions.push(session2);
      options.pause();
      return session2;
    }
    function leave(session2, resume = true) {
      if (!session2)
        return;
      const index = sessions.indexOf(session2);
      if (index < 0)
        return;
      const wasTop = index === sessions.length - 1;
      sessions.splice(index, 1);
      if (wasTop && sessions.length === 0 && resume && session2.returnStatus === "walking" && !background && !options.hidden())
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
      isTop(session2) {
        return !!session2 && sessions.at(-1) === session2;
      },
      canAnimate(hasMini) {
        if (background || options.hidden())
          return false;
        const active = sessions.at(-1)?.name;
        return active === "minigame" ? hasMini : !active && options.status() === "walking";
      },
      suspend() {
        background = true;
        for (const session2 of sessions)
          session2.returnStatus = "paused";
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

  // .build/typescript/runtime/journal-store.js
  function createJournalStore({ catalog: catalog2, data, storage: storage2 }) {
    const read = () => catalog2.loadMoments(storage2);
    function save(moment) {
      if (!catalog2.hasTag(moment) || moment.edition === 3 && !moment.earned) {
        return { kind: "error", message: "完成互动后才会记入手帐。" };
      }
      const result = data.remember(read(), moment);
      if (result.status === "full")
        return { kind: "error", message: "手帐已满，原有回忆已保留。可以先留在这里看看画。" };
      if (result.status !== "unchanged" && !catalog2.saveMoments(storage2, result.moments)) {
        return { kind: "error", message: "暂时无法保存手帐，可以重试。" };
      }
      return { kind: "stored", existing: result.status === "unchanged", change: result.status, moments: result.moments };
    }
    return { read, save };
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
  function tigerBadgeArt(id2) {
    switch (id2) {
      case "tiger-bends-puzzle-v4":
        return TIGER_BADGE_ENTRIES[id2];
      case "tiger-inn-pairs-v4":
        return TIGER_BADGE_ENTRIES[id2];
      case "tiger-waterfall-paint-v4":
        return TIGER_BADGE_ENTRIES[id2];
      case "tiger-river-roundframe-v4":
        return TIGER_BADGE_ENTRIES[id2];
      default:
        return null;
    }
  }
  function tigerLegacyBadgeTile(id2) {
    switch (id2) {
      case "gorge-goat":
        return TIGER_LEGACY_BADGE_TILES[id2];
      case "gorge-eagle":
        return TIGER_LEGACY_BADGE_TILES[id2];
      case "gorge-sparkle":
        return TIGER_LEGACY_BADGE_TILES[id2];
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
  function circle(ctx, radius2) {
    ctx.moveTo(PAPER_BADGE.center + radius2, PAPER_BADGE.center);
    ctx.arc(PAPER_BADGE.center, PAPER_BADGE.center, radius2, 0, Math.PI * 2);
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
      const radius2 = artRadius + i * 37 % 97 / 97 * (outerRadius - artRadius);
      const x = center + Math.cos(angle) * radius2, y = center + Math.sin(angle) * radius2;
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
        const radius2 = line2.radius + Math.sin(angle * 13) * 0.35 + Math.sin(angle * 29) * 0.15;
        const x = center + Math.cos(angle) * radius2, y = center + Math.sin(angle) * radius2;
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
  function paintBadgeImage(ctx, image, source, target) {
    const scale = target.radius / source.radius;
    ctx.drawImage(image, target.x - source.x * scale, target.y - source.y * scale, image.naturalWidth * scale, image.naturalHeight * scale);
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
    let source;
    if (atlas && tile) {
      source = { x: (tile.column + 0.5) * width / 3, y: (tile.row + 0.5) * height / 3, radius: Math.min(width, height) / 3 * 0.41 };
    } else if (rectangular) {
      source = { x: width / 2, y: height / 2, radius: Math.min(width, height) / 2 };
    } else if (moment.captureArt && art) {
      if (width === PAPER_BADGE.size && height === PAPER_BADGE.size)
        return { src: original };
      source = { x: width / 2, y: height / 2, radius: width * 249 / 576 };
    } else {
      source = { x: width * (art?.x ?? 0.5), y: height * (art?.y ?? 0.5), radius: Math.min(width, height) * (art?.radius ?? 0.41) };
    }
    const canvas = composePaperBadge(image.ownerDocument, (ctx, target) => paintBadgeImage(ctx, image, source, target));
    const src = canvas && encodePaperBadge(canvas);
    if (!src)
      return null;
    const keepOriginal = !atlas && (rectangular || Boolean(moment.captureArt && !art));
    const presentation = { src, ...keepOriginal ? { original } : {} };
    const cache2 = presentedArt.get(image) ?? /* @__PURE__ */ new Map();
    cache2.set(cacheKey, presentation);
    presentedArt.set(image, cache2);
    return presentation;
  }

  // .build/typescript/runtime/journal-route-filter.js
  function createJournalRouteFilter({ dom: dom2, routes, onChange }) {
    const root = dom2.get("journal-route");
    const bindings = new EventBindings();
    const choices = [{ id: "all", name: "全部路线" }, ...routes];
    root.replaceChildren();
    function reveal(label) {
      if (root.scrollWidth <= root.clientWidth)
        return;
      const bounds = root.getBoundingClientRect(), item = label.getBoundingClientRect();
      if (item.left < bounds.left + 6)
        root.scrollLeft += item.left - bounds.left - 6;
      else if (item.right > bounds.right - 6)
        root.scrollLeft += item.right - bounds.right + 6;
    }
    const tabs = choices.map((choice) => {
      const label = dom2.html("label", null, root, "journal-route-option");
      const input = dom2.html("input", null, label);
      input.type = "radio";
      input.name = "journal-route";
      input.value = choice.id;
      input.checked = choice.id === "all";
      input.setAttribute("aria-controls", "journal-list");
      const paper2 = dom2.html("span", null, label, "journal-route-tab");
      dom2.html("span", choice.name, paper2, "journal-route-name");
      const count = dom2.html("span", null, paper2, "journal-route-total");
      count.setAttribute("aria-hidden", "true");
      bindings.listen(input, "change", () => {
        if (!input.checked)
          return;
        reveal(label);
        onChange(choice.id);
      });
      bindings.listen(input, "focus", () => reveal(label));
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
    const { dom: dom2, catalog: D, data, scenes: scenes2 } = options;
    const { get: $2, html } = dom2;
    const bindings = new EventBindings();
    const pictures = /* @__PURE__ */ new Map();
    const store = createJournalStore({ catalog: D, data, storage: options.storage });
    let records = store.read();
    let tripMoments = [];
    let route = "all";
    let pageSize = data.PAGE_SIZE;
    let session2 = null;
    let trigger = null;
    let bodyOverflow = "";
    let entries = [];
    let index = 0;
    let flip = null;
    let swipe = null;
    const routeFilter = createJournalRouteFilter({ dom: dom2, routes: options.routes, onChange(selected) {
      route = selected;
      pageSize = data.PAGE_SIZE;
      render();
    } });
    function tagImage(parent, file, label, reading, moment) {
      const key = file + "|" + label;
      const cached = reading && pictures.get(key);
      if (cached) {
        parent.appendChild(cached);
        return cached;
      }
      const panel = reading ? html("div", null, parent, "journal-art-view") : null;
      const badge2 = html("span", null, panel ?? parent, "journal-badge-art journal-tag-art");
      badge2.setAttribute("role", "img");
      badge2.setAttribute("aria-label", label + " · 手绘收藏标签");
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
                badge2.setAttribute("aria-label", label + (showOriginal ? " · 完整原画" : " · 手绘收藏标签"));
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
        badge2.setAttribute("aria-label", label + " · 画作暂未加载，文字回忆仍可阅读");
      };
      image.setAttribute("src", file);
      return panel ?? badge2;
    }
    function badge(parent, moment, reading = false) {
      if (moment.edition === 3 && !D.hasTag(moment)) {
        const note = html("span", null, parent, "journal-memory-label");
        const svg = dom2.document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("viewBox", "0 0 72 44");
        svg.setAttribute("aria-hidden", "true");
        const path = dom2.document.createElementNS("http://www.w3.org/2000/svg", "path");
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
      const node = html("span", null, parent, "journal-badge-art");
      node.setAttribute("role", "img");
      node.setAttribute("aria-label", moment.title + "的山野徽章");
      node.style.backgroundImage = `url('badges/${["moments-v1", "moments-expansion-v1", "moments-westlake-v2"][Math.floor(entryIndex / 9)]}.webp')`;
      node.style.backgroundPosition = `${i % 3 * 50}% ${Math.floor(i / 3) * 50}%`;
      return node;
    }
    function render(append = false) {
      const list = $2("journal-list");
      const book = data.page(records, route, pageSize);
      routeFilter.render(route, data.page(records, "all", D.MAX_MOMENTS).entries);
      $2("journal-count").textContent = `${book.totalAll}个瞬间`;
      $2("trip-count").textContent = `本次记下${options.tripCount()}个瞬间`;
      const routeName = options.routes.find((r) => r.id === route)?.name || "全部路线";
      $2("journal-filter-count").textContent = book.total ? `${routeName} · ${book.total}段回忆${book.remaining ? `，已展示${book.entries.length}段` : ""}` : `${routeName} · 等待新的回忆`;
      $2("journal-more").hidden = book.remaining === 0;
      $2("journal-more").textContent = `再翻${Math.min(data.PAGE_SIZE, book.remaining)}段回忆 ↓`;
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
      const page = $2("journal-detail-page");
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
      const source = proof || observation && options.source(observation.source);
      if (note && source) {
        const detail = html("details", null, copy2, "journal-place-note");
        html("summary", "关于这片山野", detail);
        html("p", note.fact, detail);
        const link = html("a", source.name + " ↗", detail, "journal-source");
        link.setAttribute("href", source.url);
        link.setAttribute("target", "_blank");
        link.setAttribute("rel", "noopener noreferrer");
      }
      $2("journal-detail-route").textContent = options.routes.find((r) => r.id === moment.route)?.name || moment.place;
      $2("journal-detail-position").textContent = `${index + 1} / ${entries.length}`;
      $2("journal-detail-announcement").textContent = `第${index + 1}段，共${entries.length}段：${moment.title}`;
      const previous = entries[index - 1], next = entries[index + 1];
      const controls = [["journal-detail-prev", previous, "上一枚"], ["journal-detail-next", next, "下一枚"]];
      for (const [id2, entry, label] of controls) {
        $2(id2).setAttribute("aria-disabled", String(!entry));
        $2(id2).setAttribute("aria-label", entry ? label + "：" + entry.title : label === "上一枚" ? "已是第一枚" : "已是最后一枚");
      }
      $2("journal-detail-hint").textContent = entries.length === 1 ? "这一刻，值得留住" : !previous ? "从这一枚，慢慢翻看" : !next ? "已翻到最后一枚" : "左右翻看沿途回忆";
      const keep = /* @__PURE__ */ new Set();
      for (const entry of [previous, moment, next]) {
        if (!entry || !D.hasTag(entry))
          continue;
        const file = D.tagArt(entry) ?? tigerLegacyBadgeFile(entry);
        if (!file)
          continue;
        const label = entry.tag || entry.title, key = file + "|" + label;
        keep.add(key);
        if (!pictures.has(key))
          tagImage(html("div"), file, label, true, entry);
      }
      for (const key of pictures.keys())
        if (!keep.has(key))
          pictures.delete(key);
      if (direction && !options.reduced && page.animate)
        flip = page.animate([{ opacity: 0.35, transform: `translateX(${direction * 16}px)` }, { opacity: 1, transform: "translateX(0)" }], { duration: 220, easing: "ease-out" });
    }
    function open(moment, button) {
      if (session2 || options.rewardOpen())
        return;
      entries = data.page(records, route, D.MAX_MOMENTS).entries;
      index = entries.findIndex((entry) => entry.route === moment.route && entry.id === moment.id);
      if (index < 0)
        return;
      renderDetail();
      $2("journal-detail").setAttribute("aria-modal", "true");
      $2("journal-detail").showModal();
      session2 = scenes2.enter("journal");
      trigger = button;
      button.setAttribute("aria-expanded", "true");
      bodyOverflow = dom2.document.body.style.overflow || "";
      dom2.document.body.style.overflow = "hidden";
      options.pauseInteraction();
      options.stopLoop();
      options.refresh();
      $2("journal-detail-close").focus({ preventScroll: true });
    }
    function closed(resume = true) {
      if (!session2)
        return;
      const closing2 = session2;
      session2 = null;
      dom2.document.body.style.overflow = bodyOverflow;
      swipe = null;
      flip?.cancel();
      flip = null;
      trigger?.setAttribute("aria-expanded", "false");
      scenes2.leave(closing2, resume);
      options.refresh();
      if (trigger?.isConnected)
        trigger.focus({ preventScroll: true });
      trigger = null;
      entries = [];
      pictures.clear();
      $2("journal-detail-page").replaceChildren();
    }
    function close(resume = true) {
      closed(resume);
      $2("journal-detail").close();
    }
    function turn(direction) {
      const next = index + direction;
      if (!session2 || next < 0 || next >= entries.length)
        return;
      index = next;
      renderDetail(direction);
    }
    function remember(moment) {
      const result = store.save(moment);
      if (result.kind === "error") {
        $2("journal-storage").textContent = result.message;
        return result;
      }
      records = result.moments;
      if (!tripMoments.some((entry) => entry.route === moment.route && entry.id === moment.id))
        tripMoments.push(moment);
      $2("journal-storage").textContent = "回忆自动保存在这个浏览器，相同的片刻只留一页。";
      const message = result.change === "unchanged" ? "再次遇见，手帐中已留存" : result.change === "upgraded" ? "手帐已补上手绘" : "刚刚收下标签";
      $2("discovery-status").textContent = `${message}「${moment.title}」 · ${moment.place}`;
      render();
      options.onRemember(moment);
      return result;
    }
    function renderEnding() {
      const section = $2("ending-journal"), list = $2("ending-badges"), detail = $2("ending-detail");
      const collected2 = tripMoments.filter((moment) => D.hasTag(moment));
      section.hidden = !collected2.length;
      list.replaceChildren();
      detail.textContent = "";
      for (const moment of collected2) {
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
      const dialog = $2("journal-detail");
      bindings.listen($2("journal-detail-close"), "click", () => close());
      bindings.listen($2("journal-detail-prev"), "click", () => turn(-1));
      bindings.listen($2("journal-detail-next"), "click", () => turn(1));
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
      const page = $2("journal-detail-page");
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
      bindings.listen($2("journal-more"), "click", () => {
        const previous = $2("journal-list").children.length;
        pageSize += data.PAGE_SIZE;
        render(true);
        $2("journal-list").children[previous]?.querySelector("button")?.focus();
      });
    }
    function reload() {
      records = store.read();
      render();
    }
    const browser = dom2.document.defaultView;
    const storageChanged = (event) => {
      if (event.storageArea === options.storage)
        reload();
    };
    browser?.addEventListener("storage", storageChanged);
    bind();
    return {
      get open() {
        return session2 !== null;
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
      recent(routeId2) {
        return records.filter((moment) => moment.route === routeId2).slice(-3).map((moment) => moment.id);
      },
      destroy() {
        close(false);
        routeFilter.destroy();
        bindings.destroy();
        browser?.removeEventListener("storage", storageChanged);
      }
    };
  }

  // .build/typescript/runtime/mini-game-view.js
  function createMiniGameView({ dom: dom2, api, platform: games2, sound }) {
    const { get: $2, text, html } = dom2;
    let actionKey = null;
    const artReady = (refs) => !!refs.art && refs.contentState === "ready";
    function storyTools(s, refs, flow) {
      const controls = flow.controls;
      $2("wugong-tools").hidden = !controls;
      if (!controls)
        return;
      text("wugong-speaker", controls.speaker);
      text("wugong-line", controls.line);
      const loading = refs.contentState === "loading", failed = refs.contentState === "error";
      if ((s.game === "clouds" || s.stage === "camera") && (loading || failed))
        text("wugong-line", failed ? "画作暂未加载，请点「重新试一次」重新展开。" : "画作正在展开，稍等片刻就能操作。");
      for (const [id2, action] of [["wugong-primary", controls.primary], ["wugong-secondary", controls.secondary]]) {
        const button = $2(id2);
        button.hidden = !action;
        if (action) {
          text(id2, action.label);
          button.setAttribute("data-action", action.action);
          button.disabled = !!action.disabled || action.action === "shutter" && (loading || failed);
        }
      }
      $2("wugong-zoom").hidden = !controls.zoom;
      $2("wugong-zoom-in").disabled = (s.camera?.zoom ?? 1) >= 1.44;
      $2("wugong-zoom-out").disabled = (s.camera?.zoom ?? 1) <= 0.86;
    }
    function artTools(s, refs) {
      if (!games2)
        return;
      const flow = games2.artFlow(s), waiting = !artReady(refs);
      $2("micro-panel").setAttribute("data-phase", flow.phase);
      $2("art-tools").hidden = false;
      text("art-kicker", flow.kicker);
      text("art-count", flow.counter);
      text("art-title", s.play.complete ? "这一幅，慢慢完整了" : flow.title);
      text("art-cue", waiting ? refs.contentState === "error" ? "画作暂未加载，请点「重新试一次」重新展开。" : "水彩画作正在展开，准备好就能操作。" : flow.cue);
      const key = flow.controls.map((c) => c.action).join("|");
      if (key !== actionKey) {
        $2("art-actions").replaceChildren();
        for (const control of flow.controls) {
          const button = html("button", control.label, $2("art-actions"));
          button.type = "button";
          button.setAttribute("data-action", control.action);
        }
        actionKey = key;
      }
      for (const control of flow.controls) {
        const button = $2("art-actions").querySelector('[data-action="' + control.action + '"]');
        if (!button)
          continue;
        if (button.textContent !== control.label)
          button.textContent = control.label;
        button.disabled = waiting || !!control.disabled;
        button.setAttribute("data-primary", String(!!control.primary));
      }
      const hints = { puzzle: "1–6 选片 · 方向键选格 · Enter 放下", match: "方向键选格 · Enter 选中／交换 · R 重试", sling: "方向键调整 · 按住空格蓄力、松开发射 · R 重试" };
      text("art-key-hint", s.game && s.game in hints ? hints[s.game] : "");
      $2("micro-surface").setAttribute("aria-busy", String(refs.contentState === "loading"));
    }
    function wugong(s, refs) {
      if (!games2)
        return;
      const flow = games2.wugongFlow(s), panel = $2("micro-panel");
      panel.setAttribute("data-phase", flow.phase);
      panel.setAttribute("data-story-stage", s.stage || "");
      text("wind-stage-name", flow.stage);
      text("wind-count", flow.counter || flow.count + " / " + flow.total + " " + flow.unit);
      text("wind-cue", flow.cue);
      $2("wind-steady-fill").style.width = flow.hold * 100 + "%";
      $2("wind-hud").setAttribute("data-in-wind", String(!!s.near));
      for (let i = 0; i < 3; i++)
        $2("wind-feather-" + i).setAttribute("data-earned", String(i < (s.gates || 0)));
      if (flow.story)
        storyTools(s, refs, flow);
      const title = flow.story ? flow.phase === "memory" ? "这一刻，值得留下" : flow.phase === "soar" ? s.game === "clouds" ? "草脊，浮出云海" : "下次山里见" : "" : flow.phase === "invite" ? flow.title : flow.phase === "caught" ? "这一处，留住了" : flow.phase === "soar" ? "把一段石语留在心里" : flow.phase === "memory" ? "这一刻，值得留下" : "";
      $2("wind-chapter").hidden = !title;
      text("wind-chapter-title", title);
      text("wind-chapter-kicker", flow.kicker);
      text("wind-chapter-copy", flow.phase === "invite" ? flow.invitation : flow.phase === "memory" ? "正在展开你的手绘纪念" : s.game === "greet" ? "相遇很短，笑容留在了画里。" : s.game === "clouds" ? "雾散在山坳，云仍留在谷中。" : "石头留在原处，回忆带在身边。");
    }
    function wind(s, refs) {
      if (!games2)
        return;
      const flow = games2.flow(s), gates = s.gates || 0, stage = games2.windNames[Math.min(2, gates)];
      $2("micro-panel").setAttribute("data-phase", flow.phase);
      text("wind-stage-name", stage);
      text("wind-count", flow.counter);
      text("wind-cue", flow.cue);
      $2("wind-steady-fill").style.width = flow.energy * 100 + "%";
      $2("wind-hud").setAttribute("data-in-wind", String(!!s.windNear));
      for (let i = 0; i < 3; i++)
        $2("wind-feather-" + i).setAttribute("data-earned", String(i < gates));
      const title = flow.phase === "invite" ? "借一阵草甸的风" : flow.phase === "caught" ? flow.cue : flow.phase === "soar" ? "把风借给远方" : flow.phase === "memory" ? "这一刻，值得留下" : "";
      text("wind-chapter-title", title);
      $2("wind-chapter").hidden = !title;
      text("wind-chapter-kicker", flow.phase === "invite" ? "武功山 · 山野小事" : flow.phase === "caught" ? stage : "草浪来信");
      text("wind-chapter-copy", flow.phase === "invite" ? "让草浪告诉你，风往哪里去。" : flow.phase === "caught" ? gates === 1 ? "侧风会带动纸鸢，顺着风带继续飞。" : "山脊已在身后，缓缓放线，借远处的气流。" : flow.phase === "memory" ? "正在展开你的手绘纪念" : "纸鸢越过山脊，云海在眼前展开。");
      if (refs.contentState !== "ready")
        text("wind-cue", refs.contentState === "error" ? "纸鸢画作暂未加载，点「重新试一次」重新展开。" : "水彩纸鸢正在展开，准备好就能起飞。");
    }
    function water2(s) {
      if (!games2)
        return;
      const flow = games2.waterFlow(s), rain = s.game === "rain";
      $2("micro-panel").setAttribute("data-phase", flow.phase === "settle" ? "soar" : flow.phase);
      text("wind-stage-name", rain ? "把雨接成一首歌" : ["初入浅溪", "绕过青石", "漂向下游"][Math.min(2, s.gates || 0)]);
      text("wind-count", flow.count + " / " + flow.total + (rain ? " 滴雨" : " 处水口"));
      text("wind-cue", flow.cue);
      $2("wind-steady-fill").style.width = s.play.progress * 100 + "%";
      $2("wind-hud").setAttribute("data-in-wind", String(flow.pulse > 0));
      for (let i = 0; i < 3; i++)
        $2("wind-feather-" + i).setAttribute("data-earned", String(i < (s.gates || 0)));
      const title = flow.phase === "invite" ? rain ? "听一筒竹林的雨" : "陪一片叶子顺流而下" : flow.phase === "memory" ? "这一刻，值得留下" : flow.phase === "settle" ? rain ? "八滴雨，一段回声" : "把溪声寄向远方" : "";
      $2("wind-chapter").hidden = !title;
      text("wind-chapter-title", title);
      text("wind-chapter-kicker", rain ? "莫干山 · 竹雨成曲" : "九溪 · 一叶顺流");
      text("wind-chapter-copy", flow.phase === "invite" ? rain ? "看叶尖蓄水，让竹筒等在雨滴下面。" : "水纹有方向，轻轻拨水，绕过青石。" : flow.phase === "memory" ? "正在展开你的手绘纪念" : rain ? "雨滴在竹筒里，留下最后一圈涟漪。" : "落叶慢慢漂远，溪水还在轻轻流。");
    }
    function update(s, refs) {
      if (refs.mogan || refs.tiger || refs.directInput) {
      } else if (s.game && games2?.artAssets[s.game])
        artTools(s, refs);
      else if (s.game && games2?.wugongAssets[s.game])
        wugong(s, refs);
      else if (s.game === "wind")
        wind(s, refs);
      else if (s.game)
        water2(s);
      if (s.game || refs.directInput) {
        $2("mini-retry").disabled = s.play.complete;
        text("mini-sound", sound() ? "声音 · 开" : "声音 · 点击开启");
        $2("mini-sound").setAttribute("aria-pressed", String(sound()));
      }
      const progress = Math.round(s.play.progress * 100);
      $2("micro-progress").setAttribute("aria-valuenow", String(progress));
      $2("micro-progress-fill").style.width = progress + "%";
      const status = refs.art && !artReady(refs) ? $2("art-cue").textContent || "" : s.game === "clouds" && refs.contentState !== "ready" ? refs.contentState === "error" ? "云海暂未加载，请点「重新试一次」。" : "云海正在展开…" : api.status(s) + (s.game === "clouds" ? " · " + (s.gates || 0) + " / 3" : "");
      text("micro-result", status);
    }
    return { update, reset() {
      actionKey = null;
    }, artReady };
  }

  // .build/typescript/runtime/mini-game-controller.js
  function createMiniGameController(options) {
    const { dom: dom2, scenes: scenes2, platform: games2, catalog: D } = options, { get: $2, text } = dom2;
    const bindings = new EventBindings();
    const registered = /* @__PURE__ */ new Map();
    let api = options.api;
    let current = null;
    let currentEntry = null;
    let refs = null;
    let session2 = null;
    let pendingPoint = null;
    let pointer = null;
    let soundSerial = 0;
    let genericCompletionSound = false;
    const view3 = createMiniGameView({ dom: dom2, api: { ...options.api, status: (state3) => api.status(state3) }, platform: games2, sound: options.sound });
    const surface = $2("micro-surface");
    const soundTheme = () => api.soundTheme ?? current?.game;
    const directInput = () => api.input === "direct" || !!refs?.directInput;
    function interactive() {
      return !!current && scenes2.isTop(session2) && !scenes2.background && !dom2.document.hidden;
    }
    function paint() {
      if (current && refs)
        api.paint(refs, current, options.reduced);
    }
    function updateStatus() {
      if (!current || !refs)
        return;
      view3.update(current, refs);
      api.present?.(current, refs);
      const theme2 = soundTheme();
      if (theme2) {
        if (current.game === "wind" && games2 && !refs.directInput)
          options.audio.wind?.(games2.flow(current).energy, current.play.complete);
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
      if (refs.art && !view3.artReady(refs))
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
      session2 = scenes2.enter("minigame", returnStatus);
      api = registered.get(entry.id) || options.api;
      current = api.create(entry, { reduced: options.reduced, weather: options.weather?.() });
      currentEntry = entry;
      soundSerial = 0;
      genericCompletionSound = false;
      pendingPoint = null;
      view3.reset();
      $2("mini-retry").disabled = false;
      $2("micro-art").replaceChildren();
      refs = api.draw(options.svg, $2("micro-art"), entry);
      if (api.input === "direct")
        refs.directInput = true;
      refs.waitsForArt = !!(refs.art || refs.story || refs.mogan || refs.tiger || refs.directInput || current.game === "wind");
      if (refs.waitsForArt)
        refs.contentState = "loading";
      surface.setAttribute("aria-busy", String(refs.waitsForArt));
      paint();
      $2("wugong-tools").hidden = true;
      $2("art-tools").hidden = true;
      $2("mogan-tools").hidden = !refs.mogan;
      $2("tiger-tools").hidden = !refs.tiger;
      $2("micro-panel").setAttribute("data-tiger", String(!!refs.tiger));
      $2("micro-panel").setAttribute("data-mogan", String(!!refs.mogan));
      $2("micro-panel").setAttribute("data-art-game", String(!!refs.art));
      $2("micro-panel").setAttribute("data-game", current.game || "");
      $2("micro-panel").setAttribute("data-direct", String(directInput()));
      $2("wind-hud").hidden = !current.game || !!refs.art || !!refs.mogan || !!refs.tiger || !!refs.directInput;
      const labels = { wind: "武功山 · 借风", clouds: "武功山 · 拨云见山", altar: "武功山 · 金顶石语", greet: "武功山 · 风口相遇", creek: "九溪 · 推叶", rain: "莫干山 · 接雨" };
      $2("mini-place-label").textContent = current.game && current.game in labels ? labels[current.game] : "";
      $2("mini-controls").hidden = !current.game && !directInput();
      options.cache?.request(entry.artV5 || entry.artV4 || entry.badge, "high");
      text("micro-place", entry.place + " · " + entry.condition);
      text("micro-title", entry.name);
      text("micro-instruction", api.instruction(entry));
      const keyHints = { puzzle: "1–6 选片，方向键选格，Enter 放下。", match: "方向键选卡，Enter 选中或交换。", sling: "方向键调整，按住空格蓄力、松开发射。", greet: "方向键取景，＋／－调整远近，空格拍照。", clouds: "方向键选择云朵，空格或 Enter 吹散。" };
      const keyHint = current.game && current.game in keyHints ? keyHints[current.game] : "";
      surface.setAttribute("aria-label", (dom2.get("micro-instruction").textContent || "") + (keyHint ? " 键盘辅助：" + keyHint : ""));
      updateStatus();
      $2("micro-panel").hidden = false;
      options.refresh();
      const assets = api.assets?.(entry) || current.game && (games2?.artAssets[current.game] || games2?.wugongAssets[current.game] || games2?.waterAssets[current.game]);
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
        games2?.mount(openingRefs, options.pixi, surface, sceneAsset, actorAsset, frontAsset, hintAsset);
      surface.focus({ preventScroll: true });
      options.ensureLoop();
    }
    function finish2(record = true, resume = true) {
      if (!current || !currentEntry || !refs || !session2)
        return;
      const finished = current, closingRefs = refs, closing2 = session2, entry = currentEntry;
      pause();
      const outcome = record && finished.play.complete === true ? api.outcome(finished, entry) : null;
      current = null;
      currentEntry = null;
      refs = null;
      session2 = null;
      try {
        if (api.dispose)
          api.dispose(closingRefs);
        else
          games2?.dispose(closingRefs);
      } catch {
      }
      closingRefs.disposed = true;
      $2("micro-panel").hidden = true;
      options.stopLoop();
      let rewardShown = false;
      if (outcome)
        rewardShown = options.onFinished({ state: finished, entry, outcome, returnStatus: closing2.returnStatus });
      scenes2.leave(closing2, resume && !rewardShown);
      options.onClosed?.(finished.id, finished.play.complete === true, resume);
      options.refresh();
      if (resume && !rewardShown)
        $2("walk-toggle").focus({ preventScroll: true });
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
    function point2(event) {
      const rect = surface.getBoundingClientRect();
      const p2 = { x: (event.clientX - rect.left) / rect.width, y: (event.clientY - rect.top) / rect.height };
      return refs && api.point ? api.point(refs, p2) : refs && games2 ? games2.point(refs, p2) : p2;
    }
    function retry() {
      if (!interactive() || !current || !currentEntry || current.play.complete || !refs)
        return;
      const entry = currentEntry;
      pause();
      if (refs.waitsForArt && refs.contentState === "error") {
        const returnStatus = session2?.returnStatus;
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
      if (refs.art && !view3.artReady(refs))
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
        if (!view3.artReady(refs) || event.repeat && !arrows[event.key] || !games2)
          return;
        current = games2.artKey(current, event.key);
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
      bindings.listen($2("micro-skip"), "click", () => finish2());
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
        if (!interactive() || !current || !refs?.art || event.key !== " " || !games2)
          return;
        event.preventDefault();
        if (!view3.artReady(refs))
          return;
        current = games2.artKey(current, event.key, "up");
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
          perform({ ...point2(event), ...refs?.art || refs?.mogan || refs?.tiger || directInput() || current.game === "clouds" ? { phase: "press" } : {} });
      });
      bindings.listen(surface, "pointermove", (event) => {
        if (!interactive() || !current)
          return;
        if (!pointer) {
          if (event.pointerType === "mouse" && api.hover && inputReady()) {
            const next = api.hover(current, point2(event));
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
        const input = { ...point2(event), gesture: "drag" };
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
        const dragged = pointer.drag, input = { ...point2(event), gesture: dragged ? "drag" : "tap" };
        if (refs?.art || refs?.mogan || refs?.tiger || refs?.directInput || current.game === "clouds") {
          pendingPoint = null;
          if (dragged && refs && (view3.artReady(refs) || (refs.mogan || refs.tiger || refs.directInput || current.game === "clouds") && refs.contentState === "ready"))
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
      bindings.listen($2("mini-retry"), "click", retry);
      bindings.listen($2("mini-sound"), "click", async () => {
        await options.toggleSound();
        updateStatus();
      });
      bindings.listen($2("art-actions"), "click", (event) => {
        const button = event.target.closest?.("button[data-action]");
        const name = button?.getAttribute("data-action");
        if (button && !button.disabled && name)
          action(name);
      });
      for (const id2 of ["wugong-primary", "wugong-secondary"])
        bindings.listen($2(id2), "click", () => {
          const name = $2(id2).getAttribute("data-action");
          if (name)
            action(name);
        });
      bindings.listen($2("wugong-zoom-in"), "click", () => action("zoom-in"));
      bindings.listen($2("wugong-zoom-out"), "click", () => action("zoom-out"));
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
        for (const id2 of ids)
          registered.set(id2, adapter);
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
    const { dom: dom2, scenes: scenes2, catalog: D } = options, { get: $2 } = dom2;
    const bindings = new EventBindings();
    let current = null;
    let session2 = null;
    let collecting = false;
    let flight = null;
    let bodyOverflow = "";
    let imageEntry = null;
    let imageListener = null;
    function close(resume = true) {
      if (!current)
        return;
      const wasMini = !!options.gameKind(current.id), closing2 = session2;
      current = null;
      session2 = null;
      collecting = false;
      flight?.cancel();
      flight = null;
      if (imageEntry && imageEntry.onChange === imageListener)
        imageEntry.onChange = null;
      imageEntry = null;
      imageListener = null;
      $2("wind-keepsake").hidden = true;
      $2("reward-overlay").hidden = true;
      $2("app-main").removeAttribute("inert");
      dom2.document.body.style.overflow = bodyOverflow;
      scenes2.leave(closing2, resume);
      options.refresh();
      if (resume) {
        $2("walk-toggle").focus({ preventScroll: true });
        if (wasMini && !options.reduced && !options.autoCollect)
          $2("journey-stage").animate?.([{ opacity: 0.6, transform: "scale(.985)" }, { opacity: 1, transform: "scale(1)" }], { duration: 450, easing: "ease-out" });
      }
    }
    function show(moment, returnStatus) {
      if (!D.hasTag(moment) || options.autoCollect && (!moment.earned || moment.edition !== 3))
        return false;
      if (current)
        close(false);
      current = moment;
      collecting = false;
      session2 = scenes2.enter("reward", returnStatus);
      const game = options.gameKind(moment.id);
      $2("reward-overlay").setAttribute("data-wind", String(!!game));
      $2("reward-overlay").setAttribute("data-collecting", "false");
      $2("reward-overlay").setAttribute("data-auto", String(!!options.autoCollect));
      $2("reward-continue").disabled = false;
      $2("reward-continue").hidden = !!options.autoCollect;
      $2("reward-continue").textContent = game ? "收进手帐，继续走 →" : "收好徽章 →";
      const file = D.tagArt(moment), cached = options.cache?.request(file, "high") || null;
      const display = () => {
        if (current !== moment)
          return;
        let image = $2("reward-art");
        if (options.presentArt && current) {
          const framed = cached?.state === "ready" ? options.presentArt(cached.image, current) : null;
          const source = framed?.src || file;
          if (source && image.getAttribute("src") !== source)
            image.setAttribute("src", source);
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
        $2("reward-loading").hidden = !cached || cached.state === "ready";
        $2("reward-loading").textContent = cached?.state === "error" ? "画作暂未加载，可收好后在手帐查看。" : "正在展开手绘纪念…";
      };
      if (cached) {
        imageEntry = cached;
        imageListener = display;
        cached.onChange = display;
      }
      display();
      $2("reward-title").textContent = moment.tag || moment.title;
      $2("reward-place").textContent = moment.place;
      $2("reward-copy").textContent = D.item(moment.id).result;
      $2("reward-overlay").hidden = false;
      $2("app-main").setAttribute("inert", "");
      bodyOverflow = dom2.document.body.style.overflow || "";
      dom2.document.body.style.overflow = "hidden";
      options.stopLoop();
      options.refresh();
      if (options.autoCollect) {
        $2("reward-dialog").setAttribute("tabindex", "-1");
        $2("reward-dialog").focus({ preventScroll: true });
      } else
        $2("reward-continue").focus({ preventScroll: true });
      options.audio.mini?.(game || "memory", "reveal");
      if (options.autoCollect && !dom2.document.hidden)
        collect();
      return true;
    }
    function collect() {
      if (!current || collecting)
        return;
      if (options.onCollected?.(current) === false) {
        $2("reward-continue").hidden = false;
        $2("reward-continue").textContent = "重试保存";
        $2("reward-continue").focus({ preventScroll: true });
        return;
      }
      if (options.autoCollect)
        $2("reward-continue").hidden = true;
      const game = options.gameKind(current.id);
      options.audio.mini?.(game || "memory", "collect");
      const targetElement = $2(options.autoCollect ? "reward-overlay" : "reward-dialog");
      if (!targetElement.animate || !options.autoCollect && (!game || options.reduced)) {
        close();
        return;
      }
      collecting = true;
      const moment = current;
      $2("reward-continue").disabled = true;
      $2("reward-overlay").setAttribute("data-collecting", "true");
      $2("wind-keepsake").hidden = !!options.autoCollect;
      let animation;
      try {
        if (options.autoCollect) {
          const hold = options.reduced ? 1200 : 1500, fade = options.reduced ? 180 : 950;
          animation = flight = targetElement.animate([{ opacity: 1 }, { opacity: 1, offset: hold / (hold + fade) }, { opacity: 0 }], { duration: hold + fade, easing: "ease-in-out", fill: "forwards" });
        } else {
          const box = $2("reward-dialog").getBoundingClientRect(), target = $2("wind-keepsake").getBoundingClientRect();
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
    bindings.listen($2("reward-continue"), "click", collect);
    function visibilityChanged() {
      if (!options.autoCollect || !current)
        return;
      if (dom2.document.hidden)
        flight?.pause?.();
      else if (flight)
        flight.play?.();
      else if ($2("reward-continue").hidden)
        collect();
    }
    if (options.autoCollect)
      dom2.document.addEventListener("visibilitychange", visibilityChanged);
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
          $2($2("reward-continue").hidden ? "reward-dialog" : "reward-continue").focus({ preventScroll: true });
        }
        return true;
      },
      destroy() {
        close(false);
        bindings.destroy();
        dom2.document.removeEventListener("visibilitychange", visibilityChanged);
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
    let source = null;
    let volume = null;
    let state3 = "off";
    let desired = false, destroyed = false, failed = false, pending2 = false;
    let failureState = "error";
    let epoch = 0, target = 0;
    let stopTimer = null;
    let fade = null;
    let lastDuck = -Infinity;
    const listeners = [];
    function publish(next) {
      if (state3 === next || destroyed)
        return;
      state3 = next;
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
        state3 = failureState = "unavailable";
        return false;
      }
      try {
        media = createMedia();
        if (!media) {
          failed = true;
          state3 = failureState = "unavailable";
          return false;
        }
        media.preload = "none";
        media.loop = true;
        media.setAttribute("playsinline", "");
        source = context.createMediaElementSource(media);
        volume = context.createGain();
        volume.gain.value = 0;
        source.connect(volume);
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
          pending2 = false;
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
        source?.disconnect();
        volume?.disconnect();
        source = null;
        volume = null;
        media?.pause();
        if (media)
          for (const [type, fn] of listeners)
            media.removeEventListener(type, fn);
        listeners.length = 0;
        media = null;
        state3 = failureState = "unavailable";
        return false;
      }
    }
    function play() {
      if (pending2 || failed || !media || !desired || destroyed)
        return;
      if (!media.paused) {
        if (state3 === "paused") {
          state3 = "playing";
          ramp(target, 1.4);
        }
        return;
      }
      const token = ++epoch;
      pending2 = true;
      state3 = "loading";
      try {
        Promise.resolve(media.play()).then(() => {
          if (destroyed || !desired) {
            media?.pause();
            return;
          }
          if (token !== epoch)
            return;
          pending2 = false;
          ramp(target, 2.4);
          publish("playing");
        }).catch((error) => {
          if (token !== epoch || destroyed || !desired)
            return;
          pending2 = false;
          failed = true;
          silence();
          media?.pause();
          failureState = error instanceof Error && error.name === "NotAllowedError" ? "blocked" : "error";
          publish(failureState);
        });
      } catch (_) {
        pending2 = false;
        failed = true;
        silence();
        state3 = failureState = "error";
      }
    }
    function pause(immediate = false, duration = 0.32) {
      if (destroyed)
        return;
      desired = false;
      pending2 = false;
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
      state3 = "paused";
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
        state3 = failureState;
        return;
      }
      if (!prepare())
        return;
      if (!wasDesired && !media.paused) {
        state3 = "playing";
        ramp(target, 1.4);
      } else if (changed && state3 === "playing")
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
      if (!volume || !desired || state3 !== "playing" || context.currentTime - lastDuck < 0.12)
        return;
      lastDuck = context.currentTime;
      const now = context.currentTime;
      hold();
      const lower = target * Math.max(0.5, Math.min(1, strength));
      volume.gain.linearRampToValueAtTime(lower, now + 0.04);
      volume.gain.linearRampToValueAtTime(target, now + length);
      fade = { from: lower, to: target, at: now + 0.04, duration: length - 0.04 };
    }
    function destroy2() {
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
      source?.disconnect();
      volume?.disconnect();
      media = null;
      source = null;
      volume = null;
    }
    return { sync, resume, pause, duck, destroy: destroy2, get state() {
      return state3;
    }, get playing() {
      return desired && state3 === "playing";
    } };
  }
  function createMusicLayer(options) {
    const layers = /* @__PURE__ */ new Map();
    let requested = null;
    let previous = null;
    let desired = false, destroyed = false;
    function fadePrevious(duration) {
      const id2 = previous;
      previous = null;
      if (id2 && id2 !== requested?.id)
        layers.get(id2)?.pause(false, duration);
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
        for (const [id2, layer] of layers)
          if (id2 !== track.id && id2 !== outgoing)
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
    function destroy2() {
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
      destroy: destroy2,
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

  // .build/typescript/runtime/journal-badge.js
  var ROUND_BADGE_IDS = /* @__PURE__ */ new Set(["wugong-forest-leaves", "wugong-camp-stars", "wugong-homeward-pages"]);
  var SIZE = 640;
  var CENTER = SIZE / 2;
  var outline = (radius2) => Array.from({ length: 145 }, (_, i) => {
    const a = i / 144 * Math.PI * 2, r = radius2 + Math.sin(a * 11) * 0.8 + Math.sin(a * 23) * 0.35;
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
  function badgeFrameSvg() {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="${outer} ${inner}" fill="#f3edd9" fill-rule="evenodd"/><path d="${gold}" fill="none" stroke="#b69a61" stroke-width="2.4"/><path d="${ink}" fill="none" stroke="#a6a67b" stroke-width="1.1"/>${sprigs.map((d) => `<path d="${d}" fill="#b4a777" fill-opacity=".8"/>`).join("")}</svg>`;
  }
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

  // .build/typescript/wugong-walk/model.js
  function curve(knots, subdivisions = 15) {
    if (knots.length < 2)
      return [...knots];
    const points = [];
    const sample = (a, b, c, d, t) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t * t + (-a + 3 * b - 3 * c + d) * t * t * t);
    for (let i = 0; i < knots.length - 1; i++) {
      const a = knots[Math.max(0, i - 1)], b = knots[i], c = knots[i + 1], d = knots[Math.min(knots.length - 1, i + 2)];
      for (let j = 0; j < subdivisions; j++)
        points.push({ x: sample(a.x, b.x, c.x, d.x, j / subdivisions), y: sample(a.y, b.y, c.y, d.y, j / subdivisions) });
    }
    points.push(knots[knots.length - 1]);
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
  var clamp = (value, low, high) => Math.max(low, Math.min(high, value));
  var distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  function makeTrail(points) {
    const cumulative = [0];
    for (let i = 1; i < points.length; i++)
      cumulative.push(cumulative[i - 1] + distance(points[i - 1], points[i]));
    return { points, cumulative, length: cumulative[cumulative.length - 1] || 0 };
  }
  var CLIMB_TRAIL = makeTrail(CLIMB_PATH);
  var PASSAGE_TRAIL = makeTrail(PASSAGE_PATH);
  var DESCENT_TRAIL = makeTrail(DESCENT_PATH);
  function pointAt(trail, at2) {
    const d = clamp(Number.isFinite(at2) ? at2 : 0, 0, trail.length);
    let index = 0;
    while (index < trail.points.length - 2 && trail.cumulative[index + 1] <= d)
      index++;
    const a = trail.points[index] || { x: 0, y: 0 }, b = trail.points[index + 1] || a;
    const length = distance(a, b), ratio = length > 0 ? (d - (trail.cumulative[index] || 0)) / length : 0;
    return {
      x: a.x + (b.x - a.x) * ratio,
      y: a.y + (b.y - a.y) * ratio,
      distance: d,
      segment: index,
      heading: Math.atan2(b.y - a.y, b.x - a.x)
    };
  }
  function turnAhead(trail, at2, within2 = 48) {
    const a = pointAt(trail, at2), b = pointAt(trail, Math.min(trail.length, at2 + within2));
    return Math.abs(Math.atan2(Math.sin(b.heading - a.heading), Math.cos(b.heading - a.heading)));
  }

  // .build/typescript/runtime/tiger-trail/rules.js
  var TRAIL_GAMES = {
    "tiger-28-bends-v1": "tiger-climb",
    "tiger-middle-river-frame-v1": "tiger-river",
    "tiger-halfway-view-v1": "tiger-rest",
    "tiger-longdong-passage-v1": "tiger-passage"
  };
  var TITLES = {
    "tiger-climb": "二十八道拐 · 山路慢行",
    "tiger-river": "中虎跳江边 · 留下这一江激流",
    "tiger-rest": "中途客栈 · 在山腰歇一会儿",
    "tiger-passage": "龙洞瀑布 · 沿崖经过"
  };
  var PROMPTS = {
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
  var scenePoint = (p2) => ({ x: clamp(p2.x, 0, WORLD.width), y: clamp(p2.y, 0, WORLD.height) });
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
      feedback: PROMPTS[game],
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
  function copy(state3) {
    return {
      ...state3,
      play: { ...state3.play },
      camera: { ...state3.camera },
      viewport: { ...state3.viewport },
      climb: { ...state3.climb, position: { ...state3.climb.position } },
      passage: { ...state3.passage, position: { ...state3.passage.position } },
      rest: { ...state3.rest },
      river: {
        ...state3.river,
        captures: state3.river.captures.slice(),
        captureRequest: state3.river.captureRequest ? { ...state3.river.captureRequest, camera: { ...state3.river.captureRequest.camera } } : null
      },
      pointer: state3.pointer ? { ...state3.pointer } : null,
      keys: state3.keys.slice(),
      events: state3.events.slice(-31)
    };
  }
  function emit(state3, type, x = 0.5, index) {
    state3.events.push({ serial: ++state3.serial, type, x: clamp(x, 0, 1), ...index === void 0 ? {} : { index } });
    if (state3.events.length > 32)
      state3.events.shift();
  }
  function stopWalking(state3) {
    for (const walk of [state3.climb, state3.passage]) {
      walk.held = false;
      walk.speed = 0;
    }
    state3.pointer = null;
    state3.keys = [];
    state3.dragging = false;
  }
  function finish(state3) {
    stopWalking(state3);
    state3.play.complete = true;
    state3.play.progress = 1;
    state3.play.completedAt = state3.age;
    state3.river.burst = false;
    state3.river.burstRemaining = 0;
    state3.river.captureRequest = null;
    emit(state3, "complete");
  }
  function requestCapture(state3) {
    const river = state3.river;
    if (river.phase !== "river" || river.captureRequest || river.captures.length >= MAX_CAPTURES)
      return false;
    river.captureRequest = { id: ++river.captureSerial, age: state3.age, waveClock: river.waveClock, camera: { ...state3.camera } };
    state3.acted = true;
    emit(state3, "shutter", 0.5, river.captureRequest.id);
    return true;
  }
  function attachTrailCapture(state3, url, requestId) {
    const request = state3.river.captureRequest;
    if (state3.done || state3.play.complete || state3.game !== "tiger-river" || state3.river.phase !== "river" || !request || requestId !== void 0 && request.id !== requestId)
      return state3;
    if (!/^data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(url) || url.length > 3e5) {
      return rejectTrailCapture(state3, request.id);
    }
    const next = copy(state3);
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
    emit(next, "frame-ready", 0.5, next.river.selected);
    return next;
  }
  function rejectTrailCapture(state3, requestId) {
    if (!state3.river.captureRequest || requestId !== void 0 && state3.river.captureRequest.id !== requestId)
      return state3;
    const next = copy(state3);
    next.river.captureRequest = null;
    next.river.burst = false;
    next.river.burstRemaining = 0;
    next.feedback = "这一帧没能保存，可以再拍一次；已经拍好的画面还在。";
    return next;
  }
  function beginWalk(state3, point2) {
    const walk = state3.climb;
    if (walk.arrivedAt !== null)
      return;
    walk.held = true;
    state3.pointer = point2;
    state3.feedback = PROMPTS[state3.game];
    state3.acted = true;
    state3.dragging = true;
    state3.gesture = "hold";
  }
  function rememberViewport(state3, input) {
    if (Number.isFinite(input.viewWidth) && input.viewWidth > 0)
      state3.viewport.width = Math.min(WORLD.width, input.viewWidth);
    if (Number.isFinite(input.viewHeight) && input.viewHeight > 0)
      state3.viewport.height = Math.min(WORLD.height, input.viewHeight);
  }
  function viewCamera(state3, camera) {
    const halfW = Math.min(WORLD.width, state3.viewport.width) / 2;
    const halfH = Math.min(WORLD.height, state3.viewport.height) / 2;
    return {
      zoom: clamp(camera.zoom, 1, 1.8),
      x: clamp(camera.x, halfW, WORLD.width - halfW),
      y: clamp(camera.y, halfH, WORLD.height - halfH)
    };
  }
  function pan(state3, point2) {
    if (!state3.pointer)
      return;
    const dx = point2.x - state3.pointer.x, dy = point2.y - state3.pointer.y;
    const before = state3.camera;
    state3.camera = viewCamera(state3, { ...before, x: before.x - dx, y: before.y - dy });
    state3.pointer = { x: point2.x + state3.camera.x - before.x, y: point2.y + state3.camera.y - before.y };
    state3.rest.panX = (state3.camera.x - 500) / 500;
    state3.dragging = true;
    state3.acted = true;
    state3.gesture = "drag";
  }
  function moveTrail(state3, input) {
    if (state3.done || state3.play.complete || state3.game === "tiger-climb" || !hasPoint(input))
      return state3;
    const next = copy(state3), point2 = scenePoint(input);
    rememberViewport(next, input);
    if (next.pointer && (next.game === "tiger-rest" || next.river.phase === "river"))
      pan(next, point2);
    else
      return state3;
    return next;
  }
  function inputTrail(state3, input) {
    if (input.action === "viewport") {
      const next2 = copy(state3);
      rememberViewport(next2, input);
      if (next2.game === "tiger-rest" || next2.game === "tiger-river")
        next2.camera = viewCamera(next2, next2.camera);
      return next2;
    }
    if (state3.done || state3.play.complete)
      return state3;
    if (input.phase === "release" && !input.action)
      return releaseTrail(state3);
    const next = copy(state3), action = input.action || "";
    rememberViewport(next, input);
    if (input.phase === "press" && !action) {
      if (!hasPoint(input))
        return state3;
      const point2 = scenePoint(input);
      if (next.game === "tiger-climb")
        beginWalk(next, point2);
      else if (next.game === "tiger-rest" || next.river.phase === "river") {
        next.pointer = point2;
        next.dragging = true;
        next.acted = true;
        next.gesture = "drag";
      }
      return next;
    }
    if (input.phase === "press")
      return state3;
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
      return state3;
    if (next.game === "tiger-river") {
      if (action === "continue-to-river" && next.river.phase === "descent") {
        next.river.phase = "river";
        next.river.descentProgress = 1;
        next.acted = true;
        next.feedback = PROMPTS[next.game];
        emit(next, "river-arrive");
        return next;
      }
      if (next.river.phase !== "river")
        return state3;
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
      const zoom = clamp(input.value, 1, 1.8), ratio = next.camera.zoom / zoom;
      next.viewport.width = Math.min(WORLD.width, next.viewport.width * ratio);
      next.viewport.height = Math.min(WORLD.height, next.viewport.height * ratio);
      next.camera = viewCamera(next, { ...next.camera, zoom });
      next.acted = true;
      next.rest.panX = (next.camera.x - 500) / 500;
      return next;
    }
    return state3;
  }
  function releaseTrail(state3) {
    if (!state3.pointer && !state3.keys.length && !state3.climb.held && !state3.passage.held && !state3.river.burst)
      return state3;
    const next = copy(state3);
    stopWalking(next);
    next.river.burst = false;
    next.river.burstRemaining = 0;
    return next;
  }
  function advanceClimb(state3, dt) {
    const walk = state3.climb, trail = CLIMB_TRAIL;
    if (walk.arrivedAt !== null)
      return;
    if (!walk.held && !state3.keys.length) {
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
    state3.play.progress = walk.progress * 0.94;
    state3.x = position.x / WORLD.width;
    state3.y = position.y / WORLD.height;
    if (travelled > 0) {
      walk.nextStep -= travelled;
      if (walk.nextStep <= 0) {
        walk.nextStep += 20;
        emit(state3, "trail-step", state3.x, Math.floor(walk.distance / 20));
      }
    }
    if (trail.length - walk.distance <= 0.2) {
      const end = pointAt(trail, trail.length);
      walk.distance = trail.length;
      walk.progress = 1;
      walk.position = { x: end.x, y: end.y };
      walk.arrivedAt = state3.age;
      stopWalking(state3);
      state3.feedback = "转上山肩了。停下脚步，看看谷底的金沙江。";
      emit(state3, "trail-arrive", end.x / WORLD.width);
    }
  }
  function tickTrail(state3, dt) {
    if (state3.done || !Number.isFinite(dt) || dt <= 0)
      return state3;
    const next = copy(state3), elapsed = Math.min(0.12, dt);
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
        x: clamp(walk.position.x + 105, 0, WORLD.width),
        y: clamp(walk.position.y - 88, 0, WORLD.height),
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
  function keyTrail(state3, key, phase = "down") {
    const normalized = keyName(key);
    if (ARROWS.includes(normalized) || state3.game === "tiger-climb" && (normalized === " " || normalized === "Enter")) {
      const next = copy(state3);
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
      return ["Enter", " ", "+", "=", "-", "_", "b", "B", "k", "K"].includes(key) ? state3 : null;
    if (state3.done || state3.play.complete)
      return null;
    if (key === "Enter" || key === " ") {
      if (state3.game === "tiger-rest" || state3.game === "tiger-passage")
        return inputTrail(state3, { action: "continue" });
      return inputTrail(state3, { action: state3.river.phase === "descent" ? "continue-to-river" : "shutter" });
    }
    if ((key === "+" || key === "=") && (state3.game === "tiger-river" || state3.game === "tiger-rest"))
      return inputTrail(state3, { action: "zoom", value: state3.camera.zoom + 0.15 });
    if ((key === "-" || key === "_") && (state3.game === "tiger-river" || state3.game === "tiger-rest"))
      return inputTrail(state3, { action: "zoom", value: state3.camera.zoom - 0.15 });
    if ((key === "b" || key === "B") && state3.game === "tiger-river")
      return inputTrail(state3, { action: "burst" });
    if ((key === "k" || key === "K") && state3.game === "tiger-river")
      return inputTrail(state3, { action: "keep" });
    if (/^[1-5]$/.test(key) && state3.game === "tiger-river")
      return inputTrail(state3, { action: "select-frame", value: Number(key) - 1 });
    return null;
  }

  // .build/typescript/runtime/map-walk-art.js
  var MAP_WALK_FILE = "characters/trailbound-walk-v2.webp";
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
  var clamp2 = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
  var smooth = (n) => {
    const q = clamp2(n, 0, 1);
    return q * q * (3 - 2 * q);
  };
  var attrs = (node, values) => {
    for (const [key, value] of Object.entries(values))
      if (node.getAttribute(key) !== String(value))
        node.setAttribute(key, String(value));
  };
  function imageRect(entry) {
    const ratio = (entry.image.naturalWidth || 1280) / (entry.image.naturalHeight || 720);
    const width = Math.max(WORLD.width, WORLD.height * ratio), height = width / ratio;
    return { x: (WORLD.width - width) / 2, y: (WORLD.height - height) / 2, width, height };
  }
  function project(camera, height) {
    const scale = Math.max(1, height / WORLD.height) * clamp2(camera.zoom, 1, 1.8);
    const vw = WORLD.width / scale, vh = height / scale;
    const cx = vw < WORLD.width ? clamp2(camera.x, vw / 2, WORLD.width - vw / 2) : WORLD.width / 2;
    const cy = vh < WORLD.height ? clamp2(camera.y, vh / 2, WORLD.height - vh / 2) : WORLD.height / 2;
    return { scale, x: WORLD.width / 2 - cx * scale, y: height / 2 - cy * scale, width: WORLD.width, height };
  }
  function walkingFrame(stride) {
    return Math.floor(Math.max(0, stride) / 4) % 8;
  }
  function stageFrame(state3, height, capture = false) {
    const climb = state3.game === "tiger-climb", river = state3.game === "tiger-river", passage = state3.game === "tiger-passage";
    const camera = { ...state3.camera }, progress = climb ? state3.climb.progress : passage ? state3.passage.progress : river ? state3.river.descentProgress : 0;
    const request = capture ? state3.river.captureRequest : null;
    if (request)
      Object.assign(camera, request.camera);
    else if (passage) {
      camera.x = state3.passage.position.x + 90;
      camera.y = state3.passage.position.y - 50;
      camera.zoom = 1.12 - progress * 0.05;
    } else if (river && state3.river.phase === "descent") {
      const q = smooth(progress);
      camera.y -= (1 - q) * 110;
      camera.zoom += (1 - q) * 0.18;
    }
    let actor = null;
    if (climb) {
      const facing = Math.cos(state3.climb.heading) < 0 ? -1 : 1;
      actor = { at: state3.climb.position, width: 38 - smooth(progress) * 10, frame: walkingFrame(state3.climb.distance), rotation: clamp2(Math.sin(state3.climb.heading) * facing * 0.1, -0.08, 0.06), alpha: 1, mirror: facing };
    } else if (passage)
      actor = { at: state3.passage.position, width: 40 - progress * 10, frame: walkingFrame(state3.passage.distance), rotation: -0.025, alpha: 1, mirror: Math.cos(state3.passage.heading) < 0 ? -1 : 1 };
    return {
      camera,
      projection: project(camera, height),
      age: request?.age ?? state3.age,
      wave: request?.waveClock ?? (river ? state3.river.waveClock : state3.age),
      reduced: !!state3.play.reduced,
      actor,
      river,
      passage,
      rest: state3.game === "tiger-rest",
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
  function waterPolygon(frame2, rect) {
    return (frame2.river ? RIVER_WATER : frame2.passage ? FALL_WATER : HIGH_WATER).map((p2) => ({ x: rect.x + p2.x * rect.width, y: rect.y + p2.y * rect.height }));
  }
  function waterHoles(frame2, rect) {
    return (frame2.river ? RIVER_ROCKS : frame2.passage ? [FALL_LEDGE] : []).map((rock) => rock.map((p2) => ({ x: rect.x + p2.x * rect.width, y: rect.y + p2.y * rect.height })));
  }
  function within(p2, polygon2) {
    let yes = false;
    for (let i = 0, j = polygon2.length - 1; i < polygon2.length; j = i++) {
      const a = polygon2[i], b = polygon2[j];
      if (a.y > p2.y !== b.y > p2.y && p2.x < (b.x - a.x) * (p2.y - a.y) / (b.y - a.y) + a.x)
        yes = !yes;
    }
    return yes;
  }
  function waves(frame2, rect) {
    const polygon2 = waterPolygon(frame2, rect), holes = waterHoles(frame2, rect), count = frame2.river ? 38 : frame2.rest ? 0 : frame2.passage ? 14 : 16;
    const time = frame2.reduced ? 1.7 : frame2.wave;
    const result = [];
    for (let i = 0; i < count; i++) {
      const q = ((time * (frame2.river ? 0.095 : frame2.passage ? 0.18 : 0.035) + i * 0.137) % 1 + 1) % 1;
      const flow = frame2.passage ? FALL_FLOW : HIGH_FLOW;
      const section = Math.min(flow.length - 2, Math.floor(q * (flow.length - 1))), t = q * (flow.length - 1) - section;
      const a = flow[section], b = flow[section + 1];
      const x = frame2.river ? rect.x + (0.43 + q * 0.4 + Math.sin(i * 5.71) * (0.02 + q * 0.14)) * rect.width : rect.x + (a.x + (b.x - a.x) * t) * rect.width;
      const y = frame2.river ? rect.y + (0.51 + q * 0.5) * rect.height : rect.y + (a.y + (b.y - a.y) * t) * rect.height;
      if (!within({ x, y }, polygon2) || holes.some((hole) => within({ x, y }, hole)))
        continue;
      result.push({ x, y, length: (frame2.river ? 12 : frame2.passage ? 9 : 5) + q * (frame2.river ? 30 : 8), alpha: Math.sin(q * Math.PI) * (frame2.river ? 0.45 : frame2.passage ? 0.25 : 0.35), bend: 3 + Math.sin(time * 1.2 + i) * 2 });
    }
    return result;
  }
  function actorCrop(entry, frame2) {
    const [x, y, width, height] = MAP_WALK_FRAMES[frame2];
    return { x, y, width, height };
  }
  var HIKER_ANCHORS = MAP_WALK_FRAMES.map(([, , width, height, footX, footY]) => ({ x: footX / width, y: footY / height }));
  var svgSequence = 0;
  function fallback(svg, parent, game) {
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
      paint(frame2, resources) {
        const p2 = frame2.projection;
        attrs(parent, { viewBox: "0 0 " + p2.width + " " + p2.height, preserveAspectRatio: "none" });
        attrs(paper2, { height: p2.height });
        attrs(loading, { y: p2.height / 2, display: resources.has("scene") ? "none" : "" });
        attrs(world, { transform: "translate(" + p2.x + " " + p2.y + ") scale(" + p2.scale + ")" });
        const scene = resources.get("scene");
        if (!scene)
          return;
        const rect = imageRect(scene);
        attrs(background, { ...rect, preserveAspectRatio: "none" });
        attrs(waterShape, { points: waterPolygon(frame2, rect).map((v) => v.x + "," + v.y).join(" ") });
        const holes = waterHoles(frame2, rect);
        for (let i = 0; i < rockShapes.length; i++)
          attrs(rockShapes[i], holes[i] ? { points: holes[i].map((v) => v.x + "," + v.y).join(" "), display: "" } : { display: "none" });
        const lines = waves(frame2, rect);
        for (let i = 0; i < waveNodes.length; i++) {
          const line2 = lines[i];
          attrs(waveNodes[i], line2 ? {
            display: "",
            opacity: line2.alpha,
            "stroke-width": frame2.passage ? 1.05 : 2.1,
            d: "M" + line2.x + " " + line2.y + " q" + (frame2.passage ? line2.length * 0.14 : line2.length * 0.45) + " " + (frame2.passage ? line2.length * 0.5 : -line2.bend) + " " + (frame2.passage ? line2.length * 0.45 : line2.length) + " " + (frame2.passage ? line2.length : 0)
          } : { display: "none" });
        }
        const art = resources.get("actor");
        if (frame2.actor && art) {
          const pose = frame2.actor, region = actorCrop(art, pose.frame), ah = pose.width * region.height / region.width, anchor = HIKER_ANCHORS[pose.frame];
          attrs(hiker, { display: "", transform: "translate(" + pose.at.x + " " + pose.at.y + ") rotate(" + pose.rotation * 180 / Math.PI + ") scale(" + pose.mirror + " 1)" });
          attrs(crop, { viewBox: [region.x, region.y, region.width, region.height].join(" "), x: -pose.width * anchor.x, y: -ah * anchor.y, width: pose.width, height: ah });
          attrs(actor, { width: art.image.naturalWidth, height: art.image.naturalHeight });
          attrs(shadow, { display: "", cx: pose.at.x, cy: pose.at.y + 2, rx: 12, ry: 3.5 });
        } else {
          attrs(hiker, { display: "none" });
          attrs(shadow, { display: "none" });
        }
      },
      dispose() {
        root.remove();
      }
    };
  }
  function encodeCapture(source) {
    const budget = 3e5;
    for (const quality of [0.82, 0.7, 0.58]) {
      const url = source.toDataURL("image/webp", quality);
      if (url.length <= budget && /^data:image\/(?:webp|png|jpeg);base64,/.test(url))
        return url;
    }
    for (const side of [800, 640, 480, 320]) {
      const scale = Math.min(1, side / Math.max(source.width, source.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(source.width * scale));
      canvas.height = Math.max(1, Math.round(source.height * scale));
      const context = canvas.getContext("2d");
      if (!context)
        throw new Error("Canvas is unavailable.");
      context.fillStyle = "#f3edda";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(source, 0, 0, canvas.width, canvas.height);
      for (const format of ["image/webp", "image/jpeg"]) {
        const url = canvas.toDataURL(format, side >= 640 ? 0.7 : 0.62);
        if (url.length <= budget && /^data:image\/(?:webp|png|jpeg);base64,/.test(url))
          return url;
      }
    }
    throw new Error("The frozen painting exceeds the journal image budget.");
  }
  async function renderer(P, host, resources, initialHeight, displayWidth, cancelled, onLost) {
    const app = new P.Application(), textures = /* @__PURE__ */ new Map(), crops = [];
    let disposed2 = false;
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
      if (disposed2)
        return;
      disposed2 = true;
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
      let setWaterMask2 = function(frame2, rect) {
        const key = frame2.river ? "river" : frame2.passage ? "passage" : "high";
        if (maskKey === key)
          return;
        const canvas = document.createElement("canvas");
        canvas.width = WORLD.width;
        canvas.height = WORLD.height;
        const context = canvas.getContext("2d");
        if (!context)
          throw new Error("The river mask could not be made.");
        const polygon2 = (points) => {
          context.beginPath();
          context.moveTo(points[0].x, points[0].y);
          for (const p2 of points.slice(1))
            context.lineTo(p2.x, p2.y);
          context.closePath();
          context.fill();
        };
        context.fillStyle = "#ffffff";
        polygon2(waterPolygon(frame2, rect));
        context.globalCompositeOperation = "destination-out";
        for (const hole of waterHoles(frame2, rect))
          polygon2(hole);
        const previous = maskTexture;
        maskTexture = P.Texture.from(canvas, true);
        waterMask.texture = maskTexture;
        previous?.destroy(true);
        maskKey = key;
      }, paint2 = function(frame2) {
        if (disposed2)
          return;
        const projection = frame2.projection, res = resolution(projection.height);
        if (app.screen.height !== projection.height || Math.abs(app.renderer.resolution - res) > 0.01)
          app.renderer.resize(WORLD.width, projection.height, res);
        paper2.clear().rect(0, 0, WORLD.width, projection.height).fill(15986138);
        world.scale.set(projection.scale);
        world.position.set(projection.x, projection.y);
        const rect = imageRect(resources.get("scene"));
        background.position.set(rect.x, rect.y);
        background.width = rect.width;
        background.height = rect.height;
        const activeWater = !frame2.rest;
        water2.visible = activeWater;
        whitewater.visible = activeWater;
        waterMask.visible = activeWater;
        if (activeWater) {
          setWaterMask2(frame2, rect);
          water2.position.set(rect.x, rect.y);
          water2.width = rect.width;
          water2.height = rect.height;
          const buffer = water2.geometry.getBuffer("aPosition"), values = buffer.data;
          for (let i = 0; i < values.length; i += 2) {
            const x = original[i], y = original[i + 1], q = y / sceneTexture.height;
            values[i] = x + (frame2.reduced ? 0 : Math.sin(y * 0.043 + frame2.wave * 1.3) * (frame2.river ? 2.4 : frame2.passage ? 0.38 : 1.05) * q);
            values[i + 1] = y + (frame2.reduced ? 0 : Math.sin(x * 0.034 + y * 0.01 - frame2.wave * 1.8) * (frame2.river ? 1.9 : frame2.passage ? 0.55 : 0.7) * q);
          }
          buffer.update();
          whitewater.clear();
          for (const wave of waves(frame2, rect))
            whitewater.moveTo(wave.x, wave.y).quadraticCurveTo(wave.x + wave.length * (frame2.passage ? 0.14 : 0.45), wave.y + (frame2.passage ? wave.length * 0.5 : -wave.bend), wave.x + wave.length * (frame2.passage ? 0.45 : 1), wave.y + (frame2.passage ? wave.length : 0)).stroke({ color: 16775133, width: frame2.river ? 2.1 : frame2.passage ? 1.05 : 1.3, alpha: wave.alpha, cap: "round" });
        }
        shadow.clear();
        if (hiker) {
          hiker.visible = !!frame2.actor;
          if (frame2.actor) {
            const a = frame2.actor, anchor = HIKER_ANCHORS[a.frame];
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
        capture(frame2) {
          if (disposed2)
            throw new Error("The painted scene has closed.");
          paint2({ ...frame2, capture: true });
          const canvas = app.renderer.extract.canvas({ target: scene, frame: new P.Rectangle(0, 0, WORLD.width, frame2.projection.height), resolution: Math.min(1, 960 / Math.max(WORLD.width, frame2.projection.height)), clearColor: "#f3edda", antialias: true });
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
    attrs(parent, { viewBox: "0 0 1000 720", preserveAspectRatio: "xMidYMid meet" });
    return { tiger: true, tigerTrail: true, game, parent, fallback: fallback(svg, parent, game), gpu: null, resources: /* @__PURE__ */ new Map(), loaded: false, height: 720, displayWidth: 1e3, latest: null, host: null, resize: null, captureBusy: false, generation: 0, embedded: /* @__PURE__ */ new Map(), waitsForArt: true, contentState: "loading", disposed: false };
  }
  function paintTigerTrail(refs, state3) {
    if (refs.disposed)
      return;
    refs.latest = state3;
    const frame2 = stageFrame(state3, refs.height);
    if (refs.gpu) {
      try {
        refs.gpu.paint(frame2);
        refs.parent.setAttribute("visibility", "hidden");
        return;
      } catch {
        refs.gpu.dispose();
        refs.gpu = null;
      }
    }
    refs.parent.removeAttribute("visibility");
    refs.fallback.paint(frame2, refs.resources);
    const loading = refs.fallback.root.querySelector("[data-loading]");
    if (loading)
      loading.textContent = refs.contentState === "error" ? "画作暂未展开，可以重试或继续行程。" : "江谷画作正在展开…";
  }
  function tigerTrailViewport(refs, state3 = refs.latest) {
    const p2 = project(state3?.camera || { x: 500, y: 360, zoom: 1 }, refs.height);
    return { action: "viewport", viewWidth: p2.width / p2.scale, viewHeight: p2.height / p2.scale };
  }
  function tigerTrailPoint(refs, point2) {
    if (!refs.latest)
      return point2;
    const p2 = stageFrame(refs.latest, refs.height).projection;
    return {
      ...point2,
      x: ((point2.x ?? 0) * p2.width - p2.x) / p2.scale,
      y: ((point2.y ?? 0) * p2.height - p2.y) / p2.scale,
      viewWidth: p2.width / p2.scale,
      viewHeight: p2.height / p2.scale,
      ...point2.dx === void 0 ? {} : { dx: point2.dx * p2.width / p2.scale },
      ...point2.dy === void 0 ? {} : { dy: point2.dy * p2.height / p2.scale }
    };
  }
  async function mountTigerTrail(refs, host, cache2, pixi) {
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
    const assets = tigerTrailAssets(refs.game), pending2 = [];
    for (const key of ["scene", "actor"]) {
      const file = assets[key];
      if (!file)
        continue;
      const entry = cache2?.request(file, "high");
      if (!entry) {
        refs.contentState = "error";
        return;
      }
      pending2.push([key, entry]);
    }
    await Promise.all(pending2.map(([, entry]) => entry.promise));
    if (cancelled())
      return;
    if (pending2.some(([, entry]) => entry.state !== "ready")) {
      refs.contentState = "error";
      return;
    }
    refs.resources = new Map(pending2);
    refs.loaded = true;
    const P = pixi;
    if (typeof P?.Application === "function") {
      await new Promise((resolve) => setTimeout(resolve, 0));
      if (cancelled())
        return;
      refs.gpu = await renderer(P, host, refs.resources, refs.height, () => refs.displayWidth, cancelled, () => {
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
  async function svgCapture(refs, frame2) {
    refs.fallback.paint({ ...frame2, capture: true }, refs.resources);
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    svg.setAttribute("viewBox", "0 0 1000 " + refs.height);
    const scale = Math.min(1, 960 / Math.max(WORLD.width, refs.height));
    svg.setAttribute("width", String(Math.round(WORLD.width * scale)));
    svg.setAttribute("height", String(Math.round(refs.height * scale)));
    const clone = refs.fallback.root.cloneNode(true);
    clone.querySelectorAll("[data-capture-hide]").forEach((node) => node.remove());
    svg.appendChild(clone);
    for (const node of clone.querySelectorAll("image")) {
      const href = node.getAttribute("href");
      if (!href)
        continue;
      let embedded = refs.embedded.get(href);
      if (!embedded) {
        const key = Object.entries(tigerTrailAssets(refs.game)).find(([, file]) => file === href)?.[0];
        const image = key && refs.resources.get(key)?.image;
        if (!image) {
          node.remove();
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
      node.setAttribute("href", embedded);
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
  async function captureTigerTrail(refs, state3 = refs.latest) {
    if (refs.disposed || !refs.loaded || !state3 || refs.captureBusy)
      return null;
    refs.captureBusy = true;
    const generation = refs.generation;
    try {
      const frame2 = stageFrame(state3, refs.height, true), url = refs.gpu ? refs.gpu.capture(frame2) : await svgCapture(refs, frame2);
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
  var MEMORIES = {
    "tiger-climb": "沿二十八道拐的一段折返小径走上高处，山壁逐渐退开，金沙江落在深深的谷底。",
    "tiger-river": "沿张老师小路来到中虎跳江边，白浪掠过江中巨石。我选下这一帧，把自己的构图和奔流的一刻留在手帐里。",
    "tiger-rest": "在中途客栈歇了歇，看看峡谷对面的山。",
    "tiger-passage": "沿高路经过龙洞瀑布，水声短暂靠近，又落在身后。"
  };
  function createTigerTrailGames({ dom: dom2, onAction, riverArrived = false }) {
    const { get: $2, text, html } = dom2, bindings = new EventBindings();
    let generation = 0, pending2 = null, busy = false;
    let actionKey = "", framesKey = "", current = null;
    let activeRefs = null;
    let shutterPointer = null, shutterHeldAt = 0, holdingBurst = false, ignoreClick = false;
    const strip = $2("tiger-frame-strip");
    const zoom = $2("tiger-trail-zoom");
    const withViewport = (state3) => activeRefs && !activeRefs.disposed ? inputTrail(state3, tigerTrailViewport(activeRefs, state3)) : state3;
    function renderFrames(s) {
      strip.hidden = s.game !== "tiger-river" || !s.river.captures.length;
      const key = s.id + ":" + s.river.captures.map((frame2) => frame2.id).join(",");
      if (key !== framesKey) {
        strip.replaceChildren();
        s.river.captures.forEach((frame2, index) => {
          const button = html("button", null, strip, "tiger-frame");
          button.type = "button";
          button.dataset.frame = String(index);
          button.setAttribute("aria-label", "选择第 " + (index + 1) + " 帧");
          const picture = html("img", null, button);
          picture.src = frame2.url;
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
    function present(base, view3) {
      const s = base, refs = view3, waiting = refs.contentState !== "ready";
      current = s;
      $2("tiger-tools").hidden = false;
      $2("micro-panel").setAttribute("data-trail", "true");
      $2("micro-panel").setAttribute("data-trail-game", s.game);
      $2("micro-panel").setAttribute("data-phase", waiting ? "loading" : s.play.complete ? "memory" : s.game === "tiger-river" ? s.river.phase : s.acted ? "play" : "invite");
      text("micro-title", TITLES[s.game]);
      text("tiger-key-hint", KEYS[s.game]);
      text("micro-result", waiting ? refs.contentState === "error" ? "画作未能展开，可以重新加载，或继续旅程。" : "山与江正在展开……" : s.feedback);
      text("micro-skip", s.game === "tiger-river" ? "返回高路 →" : "继续走 →");
      $2("micro-surface").setAttribute("aria-busy", String(refs.contentState === "loading"));
      $2("micro-surface").setAttribute("aria-label", PROMPTS[s.game] + " " + KEYS[s.game] + " R 重试。");
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
        $2("tiger-actions").replaceChildren();
        for (const control of controls) {
          const b = html("button", control.label, $2("tiger-actions"));
          b.type = "button";
          b.dataset.trailAction = control.action;
        }
        actionKey = key;
      }
      for (const control of controls) {
        const button = $2("tiger-actions").querySelector('[data-trail-action="' + control.action + '"]');
        if (!button)
          continue;
        if (button.textContent !== control.label)
          button.textContent = control.label;
        button.disabled = waiting || s.play.complete || !!control.disabled;
        button.setAttribute("data-primary", String(!!control.primary));
      }
      const zoomVisible = s.game === "tiger-river" && s.river.phase === "river";
      $2("tiger-trail-lens").hidden = !zoomVisible;
      zoom.disabled = waiting || s.play.complete;
      if (dom2.document.activeElement !== zoom)
        zoom.value = String(s.camera.zoom);
      renderFrames(s);
    }
    const adapter = {
      create(entry, options) {
        generation++;
        pending2 = null;
        busy = false;
        actionKey = "";
        framesKey = "";
        shutterPointer = null;
        holdingBurst = false;
        ignoreClick = false;
        return createTrailState(entry, { ...options, riverArrival: riverArrived ? "river" : "descent" });
      },
      act: (state3, point2) => inputTrail(withViewport(state3), point2),
      move: (state3, point2) => moveTrail(state3, point2),
      release(state3) {
        shutterPointer = null;
        holdingBurst = false;
        return releaseTrail(state3);
      },
      tick(state3, dt) {
        let s = withViewport(state3);
        if (pending2 && pending2.generation === generation && pending2.id === s.id) {
          const result = pending2;
          pending2 = null;
          s = result.url ? attachTrailCapture(s, result.url, result.request) : rejectTrailCapture(s, result.request);
        }
        if (shutterPointer !== null && !holdingBurst && s.age - shutterHeldAt >= 0.45) {
          holdingBurst = true;
          s = inputTrail(s, { action: "burst" });
        }
        return tickTrail(s, dt);
      },
      draw: (svg, parent, entry) => drawTigerTrail(svg, parent, TRAIL_GAMES[entry.id]),
      paint(view3, state3) {
        const refs = view3, s = state3;
        activeRefs = refs;
        paintTigerTrail(refs, s);
        const request = s.river.captureRequest;
        if (!request || busy || pending2 || refs.captureBusy || refs.contentState !== "ready")
          return;
        busy = true;
        const started = generation;
        void captureTigerTrail(refs, s).then((url) => {
          if (generation === started && !refs.disposed)
            pending2 = { generation: started, id: s.id, request: request.id, url };
        }, () => {
          if (generation === started && !refs.disposed)
            pending2 = { generation: started, id: s.id, request: request.id, url: null };
        }).finally(() => {
          if (generation === started)
            busy = false;
        });
      },
      instruction: (entry) => PROMPTS[TRAIL_GAMES[entry.id]],
      status: (state3) => state3.feedback,
      outcome(state3, entry) {
        const s = state3, captured = s.game === "tiger-river" ? s.river.captures[s.river.selected]?.url : null;
        return {
          id: s.id,
          edition: entry.edition,
          earned: s.play.complete,
          interaction: s.gesture,
          memory: MEMORIES[s.game],
          title: s.play.complete ? entry.tag : entry.name,
          ...captured ? { captureArt: captured, artSource: "capture" } : {}
        };
      },
      assets: (entry) => tigerTrailAssets(TRAIL_GAMES[entry.id]),
      mount: (refs, context) => mountTigerTrail(refs, context.host, context.cache, context.pixi),
      dispose(refs) {
        generation++;
        pending2 = null;
        busy = false;
        current = null;
        activeRefs = null;
        shutterPointer = null;
        holdingBurst = false;
        strip.replaceChildren();
        strip.hidden = true;
        $2("tiger-trail-lens").hidden = true;
        $2("micro-panel").removeAttribute("data-trail");
        $2("micro-panel").removeAttribute("data-trail-game");
        disposeTigerTrail(refs);
      },
      point: (refs, point2) => tigerTrailPoint(refs, point2),
      key: (state3, key, phase) => keyTrail(withViewport(state3), key, phase),
      present
    };
    const actions = $2("tiger-actions");
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

  // .build/typescript/runtime/tiger-memories/model.js
  var MEMORY_SPECS = {
    "tiger-bends-puzzle-v4": { kind: "bends", game: "tiger-climb", title: "转过山弯", badge: "山弯初见", prompt: "从起点沿箭头描过 S 弯，画到山肩后松手出发。", keys: "方向键移笔，按住空格或 Enter 落笔，松开后启程；R 重试。", memory: "我沿着山坡画下一道 S 弯，小人循着山路走上山肩。山弯转过，金沙江的白浪在峡谷里奔流，江声慢慢涌了上来。" },
    "tiger-inn-pairs-v4": { kind: "inn", game: "tiger-rest", title: "记住山色", badge: "半山灯火", prompt: "翻开四张画片，找到两对相同的风景。", keys: "方向键选画片，Enter 翻开。", memory: "在中途客栈的桌边认出两对山影与窗灯。山色暗下来，窗里亮起暖光，今晚就在这里歇脚。" },
    "tiger-waterfall-paint-v4": { kind: "waterfall", game: "tiger-passage", title: "涂一页山色", badge: "崖间飞瀑", prompt: "蘸一点颜色，把岩壁与草木两处留白涂上山色。", keys: "1–3 选颜料；方向键移动笔，按住空格落笔。", memory: "在龙洞瀑布附近停下，用自己选的颜色涂过岩壁和草木。水声落在山径边，山色留在这一页。" },
    "tiger-river-roundframe-v4": { kind: "river", game: "tiger-river", title: "把江声留下", badge: "江声入峡", prompt: "拖动圆形取景窗，把巨石和白浪一起装进去，松手拍下。", keys: "方向键移动取景窗，Enter 拍下；巨石和近旁白浪都要入窗。", memory: "沿张老师小路来到中虎跳江边，把江心巨石和它旁边的一段白浪一起放进圆窗，留下当时亲手选定的构图。" }
  };
  var memoryId = (id2) => Object.hasOwn(MEMORY_SPECS, id2);
  var MEMORY_IDS = Object.keys(MEMORY_SPECS).filter(memoryId);
  var sceneFile = (kind) => `scenes/tiger-memories-v4/${kind}.webp`;
  var badgeFile = (kind) => TIGER_BADGE_ART[kind].file;
  var clamp3 = (value, low, high) => Math.max(low, Math.min(high, value));
  var distance2 = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  var inside = (p2, r) => p2.x >= r.x && p2.y >= r.y && p2.x <= r.x + r.width && p2.y <= r.y + r.height;
  var MemoryState = class {
    id;
    route = "tiger";
    kind;
    game;
    age = 0;
    acted = false;
    dragging = false;
    gesture = "tap";
    done = false;
    x = 0.5;
    y = 0.5;
    play = { type: "tiger-memory", progress: 0, complete: false, completedAt: null, reduced: false };
    events = [];
    serial = 0;
    feedback;
    flow = { kind: "playing" };
    portrait = false;
    wave = 0;
    session;
    constructor(id2, reduced2, order = [0, 1, 1, 0]) {
      this.id = id2;
      const spec = MEMORY_SPECS[id2];
      this.kind = spec.kind;
      this.game = spec.game;
      this.feedback = spec.prompt;
      this.play.reduced = reduced2;
      switch (spec.kind) {
        case "bends":
          this.session = { kind: "bends", phase: { kind: "drawing", progress: 0, pen: { kind: "up" }, cursor: { x: 178 * 1e3 / 724, y: 479 * 750 / 543 }, keyboard: false } };
          break;
        case "inn":
          this.session = { kind: "inn", order, open: [], matched: [], turnAt: null, focus: 0 };
          break;
        case "waterfall":
          this.session = { kind: "waterfall", color: 0, strokes: [], coverage: [[], []], brush: { x: 0.35, y: 0.45 }, drawing: false, keyHeld: false, keyboard: false, reveal: 0 };
          break;
        case "river":
          this.session = { kind: "river", center: { x: 0.23, y: 0.3 }, drag: null, adjusted: false, shot: null };
          break;
      }
    }
  };
  function fork(s) {
    const n = new MemoryState(s.id, s.play.reduced);
    Object.assign(n, s);
    n.play = { ...s.play };
    n.events = s.events.slice(-15);
    switch (s.session.kind) {
      case "bends":
        n.session = { ...s.session, phase: s.session.phase.kind === "drawing" ? { ...s.session.phase, pen: s.session.phase.pen.kind === "down" ? { kind: "down", last: { ...s.session.phase.pen.last } } : { kind: "up" }, cursor: { ...s.session.phase.cursor } } : { ...s.session.phase } };
        break;
      case "inn":
        n.session = { ...s.session, open: s.session.open.slice(), matched: s.session.matched.slice() };
        break;
      case "waterfall":
        n.session = { ...s.session, brush: { ...s.session.brush }, strokes: s.session.strokes.slice(), coverage: [s.session.coverage[0].slice(), s.session.coverage[1].slice()] };
        break;
      case "river":
        n.session = { ...s.session, center: { ...s.session.center }, drag: s.session.drag ? { ...s.session.drag } : null };
        break;
    }
    return n;
  }
  function stateOf(base) {
    if (!(base instanceof MemoryState))
      throw new Error("虎跳峡互动状态不匹配");
    return base;
  }
  function emit2(s, type, index = 0) {
    s.events.push({ serial: ++s.serial, type, x: 0.5, index });
  }
  function settle(s) {
    if (s.flow.kind === "playing") {
      s.flow = { kind: "settling", at: s.age };
      s.dragging = false;
    }
  }

  // .build/typescript/runtime/tiger-memories/road.js
  var ROAD_POINTS = curve([[178, 479], [252, 461], [331, 436], [398, 416], [430, 395], [399, 380], [332, 365], [255, 347], [180, 328], [130, 307], [127, 289], [193, 273], [299, 256], [388, 233]].map(([x, y]) => ({ x: x * 1e3 / 724, y: y * 750 / 543 })), 8);
  var lengths = [0];
  for (let i = 1; i < ROAD_POINTS.length; i++)
    lengths.push(lengths[i - 1] + distance2(ROAD_POINTS[i - 1], ROAD_POINTS[i]));
  var ROAD_LENGTH = lengths[lengths.length - 1];
  var ROAD_STATIONS = ROAD_POINTS.map((point2, i) => ({ point: point2, progress: lengths[i] / ROAD_LENGTH }));
  var TURN_DISTANCES = [lengths[4 * 8], lengths[10 * 8]];
  var WALK_SPEED = ROAD_LENGTH / 8.6;
  var TURN_PAUSE = 0.32;
  var ROAD_WALK_SECONDS = ROAD_LENGTH / WALK_SPEED + TURN_PAUSE * TURN_DISTANCES.length;
  var ROAD_RIVER_SECONDS = 4.8;
  var roadWalk = (phase) => phase.kind === "walking" ? phase.progress : phase.kind === "river" ? 1 : 0;
  function roadAt(progress) {
    const at2 = clamp3(progress, 0, 1) * ROAD_LENGTH;
    let i = 1;
    while (i < lengths.length - 1 && lengths[i] < at2)
      i++;
    const a = ROAD_POINTS[i - 1], b = ROAD_POINTS[i], t = (at2 - lengths[i - 1]) / Math.max(1e-3, lengths[i] - lengths[i - 1]);
    return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, heading: Math.atan2(b.y - a.y, b.x - a.x) };
  }
  function roadWalkingProgress(elapsed) {
    let stopped = 0;
    for (const turn of TURN_DISTANCES) {
      const arrive = turn / WALK_SPEED + stopped;
      if (elapsed < arrive)
        break;
      if (elapsed < arrive + TURN_PAUSE)
        return turn / ROAD_LENGTH;
      stopped += TURN_PAUSE;
    }
    return clamp3((elapsed - stopped) * WALK_SPEED / ROAD_LENGTH, 0, 1);
  }
  function traceRoad(progress, from, to, tolerance) {
    const count = Math.max(1, Math.min(256, Math.ceil(distance2(from, to) / 8)));
    for (let sample = 1; sample <= count; sample++) {
      const at2 = { x: from.x + (to.x - from.x) * sample / count, y: from.y + (to.y - from.y) * sample / count };
      const low = Math.max(0, progress * ROAD_LENGTH - tolerance), high = Math.min(ROAD_LENGTH, progress * ROAD_LENGTH + 22);
      let nearest = Infinity, next = progress;
      for (let i = 1; i < ROAD_POINTS.length; i++) {
        if (lengths[i] < low || lengths[i - 1] > high)
          continue;
        const a = ROAD_POINTS[i - 1], b = ROAD_POINTS[i], len = lengths[i] - lengths[i - 1];
        const t = clamp3(((at2.x - a.x) * (b.x - a.x) + (at2.y - a.y) * (b.y - a.y)) / Math.max(1e-3, len * len), clamp3((low - lengths[i - 1]) / Math.max(1e-3, len), 0, 1), clamp3((high - lengths[i - 1]) / Math.max(1e-3, len), 0, 1));
        const d = distance2(at2, { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
        if (d < nearest) {
          nearest = d;
          next = Math.max(progress, (lengths[i - 1] + t * len) / ROAD_LENGTH);
        }
      }
      if (nearest > tolerance)
        return { progress, connected: false };
      progress = next;
    }
    return { progress, connected: true };
  }

  // .build/typescript/runtime/tiger-memories/layout.js
  var PALETTE = ["#a8a778", "#7c998a", "#b99c7c"];
  var BRUSH = 0.068;
  var regionRock = [{ x: 0.08, y: 0.05 }, { x: 0.38, y: 0.02 }, { x: 0.47, y: 0.14 }, { x: 0.4, y: 0.33 }, { x: 0.52, y: 0.5 }, { x: 0.4, y: 0.65 }, { x: 0.24, y: 0.67 }, { x: 0.15, y: 0.42 }];
  var regionPlants = [{ x: 0.02, y: 0.47 }, { x: 0.2, y: 0.44 }, { x: 0.29, y: 0.63 }, { x: 0.42, y: 0.72 }, { x: 0.5, y: 0.91 }, { x: 0.32, y: 0.99 }, { x: 0.03, y: 0.97 }];
  var PAINT_REGIONS = [regionRock, regionPlants];
  function polygonContains(p2, polygon2) {
    let result = false;
    for (let i = 0, j = polygon2.length - 1; i < polygon2.length; j = i++) {
      const a = polygon2[i], b = polygon2[j];
      if (a.y > p2.y !== b.y > p2.y && p2.x < (b.x - a.x) * (p2.y - a.y) / (b.y - a.y) + a.x)
        result = !result;
    }
    return result;
  }
  var PAINT_CELLS = PAINT_REGIONS.map((region) => {
    const cells = [];
    for (let y = 0.025; y < 1; y += 0.05)
      for (let x = 0.025; x < 1; x += 0.05)
        if (polygonContains({ x, y }, region))
          cells.push({ x, y });
    return cells;
  });
  var coverage = (s) => s.session.kind === "waterfall" ? s.session.coverage.map((cells, i) => cells.length / PAINT_CELLS[i].length) : [];
  function layout(s, viewport) {
    const height = s.kind === "bends" && viewport ? 1e3 * viewport.height / viewport.width : s.portrait ? s.kind === "bends" ? 1040 : 1260 : 750;
    const walk = s.session.kind === "bends" ? roadWalk(s.session.phase) : 0;
    const zoom = s.kind === "bends" ? Math.max(1, height / 750) * (1.03 - walk * 0.03) : 1;
    const scene = s.kind === "river" ? { x: 0, y: 0, width: 1e3, height } : s.kind === "bends" ? {
      x: clamp3(500 - 385 * zoom, 1e3 - 1e3 * zoom, 0),
      y: clamp3(height / 2 - (492 - walk * 25) * zoom, height - 750 * zoom, 0),
      width: 1e3 * zoom,
      height: 750 * zoom
    } : { x: 0, y: 0, width: 1e3, height: 750 };
    const sketch = s.portrait ? { x: 90, y: 800, width: 680, height: 400 } : { x: 545, y: 350, width: 405, height: 340 };
    const sketchImage = { x: sketch.x + 20, y: sketch.y + 16, width: sketch.width - 40, height: sketch.height - 42 };
    const swatches = PALETTE.map((_, i) => s.portrait ? { x: 885, y: 865 + i * 135 } : { x: 508, y: 410 + i * 98 });
    const cardWidth = s.portrait ? 175 : 132, cardHeight = cardWidth * 0.9;
    const cards = Array.from({ length: 4 }, (_, i) => ({ x: (s.portrait ? 105 : 170) + i * (s.portrait ? 205 : 161), y: s.portrait ? 900 : 550, width: cardWidth, height: cardHeight }));
    const radius2 = s.portrait ? 360 : 236;
    return { width: 1e3, height, scene, sketch, sketchImage, swatches, cards, radius: radius2 };
  }
  function riverImageRect(portrait) {
    const height = portrait ? 1260 : 750, scale = Math.max(1, height / 750);
    return { x: (1e3 - 1e3 * scale) * 0.55, y: 0, width: 1e3 * scale, height: 750 * scale };
  }
  var riverToStage = (p2, portrait) => {
    const r = riverImageRect(portrait);
    return { x: r.x + p2.x * r.width, y: r.y + p2.y * r.height };
  };
  var stageToRiver = (p2, portrait) => {
    const r = riverImageRect(portrait);
    return { x: (p2.x - r.x) / r.width, y: (p2.y - r.y) / r.height };
  };
  function frameCenter(s) {
    const at2 = riverToStage(s.session.kind === "river" ? s.session.center : { x: 0.23, y: 0.3 }, s.portrait), l = layout(s);
    return { x: clamp3(at2.x, l.radius, 1e3 - l.radius), y: clamp3(at2.y, l.radius, l.height - l.radius) };
  }
  function frameFits(s) {
    if (s.session.kind !== "river")
      return false;
    const center = frameCenter(s), radius2 = layout(s).radius;
    return [{ x: 0.489, y: 0.45 }, { x: 0.765, y: 0.68 }, { x: 0.64, y: 0.81 }, { x: 0.4, y: 0.68 }].every((p2) => distance2(center, riverToStage(p2, s.portrait)) < radius2 * 0.94);
  }
  function moveFrame(s, p2) {
    const l = layout(s), radius2 = l.radius;
    return stageToRiver({ x: clamp3(p2.x, radius2, l.width - radius2), y: clamp3(p2.y, radius2, l.height - radius2) }, s.portrait);
  }
  function roadFromStage(s, at2, viewport) {
    const r = layout(s, viewport).scene;
    return { x: (at2.x - r.x) * 1e3 / r.width, y: (at2.y - r.y) * 750 / r.height };
  }
  function roadToStage(s, at2, viewport) {
    const r = layout(s, viewport).scene;
    return { x: r.x + at2.x * r.width / 1e3, y: r.y + at2.y * r.height / 750 };
  }

  // .build/typescript/runtime/tiger-memories/rules.js
  var point = (input) => typeof input.x === "number" && typeof input.y === "number" && Number.isFinite(input.x) && Number.isFinite(input.y) ? { x: input.x, y: input.y } : null;
  function createMemory(id2, reduced2) {
    const order = [0, 0, 1, 1];
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    return new MemoryState(id2, reduced2, order);
  }
  function beginRoad(s, at2) {
    const p2 = s.session;
    if (p2.kind !== "bends" || p2.phase.kind !== "drawing")
      return;
    const phase = p2.phase;
    phase.cursor = at2;
    if (distance2(at2, roadAt(phase.progress)) > (s.portrait ? 58 : 36)) {
      s.feedback = "从已经画好的路头接着画就好。";
      return;
    }
    phase.pen = { kind: "down", last: at2 };
    s.dragging = true;
  }
  function drawRoad(s, at2) {
    const p2 = s.session;
    if (p2.kind !== "bends" || p2.phase.kind !== "drawing")
      return;
    const phase = p2.phase, before = phase.progress;
    if (phase.pen.kind !== "down")
      return;
    const next = traceRoad(before, phase.pen.last, at2, s.portrait ? 48 : 26);
    phase.progress = next.progress;
    phase.cursor = at2;
    phase.pen = next.connected ? { kind: "down", last: at2 } : { kind: "up" };
    s.dragging = next.connected;
    if (next.progress > before + 1e-4) {
      if (!s.acted)
        emit2(s, "depth-paper");
      s.acted = true;
      s.gesture = "drag";
    }
    s.play.progress = phase.progress * 0.55;
    s.feedback = phase.progress >= 0.99 ? "山路画好了，松手就出发。" : next.connected ? "顺着这道山弯，慢慢往上画。" : "这段已经留下了，从路头接着画。";
  }
  function finishRoad(s) {
    const p2 = s.session;
    if (p2.kind !== "bends" || p2.phase.kind !== "drawing")
      return;
    const phase = p2.phase, placed = phase.pen.kind === "down" && phase.progress >= 0.99;
    phase.pen = { kind: "up" };
    s.dragging = false;
    if (placed) {
      p2.phase = { kind: "walking", elapsed: 0, progress: 0 };
      s.feedback = "沿着刚画好的山路，走上山肩。";
      emit2(s, "pack-place");
    }
  }
  function flipCard(s, index) {
    const p2 = s.session;
    if (p2.kind !== "inn" || p2.turnAt !== null || p2.matched.includes(index) || p2.open.includes(index))
      return;
    p2.open.push(index);
    s.acted = true;
    s.feedback = "再找找相同的那一张。";
    emit2(s, "depth-paper", index);
    if (p2.open.length !== 2)
      return;
    if (p2.order[p2.open[0]] === p2.order[p2.open[1]]) {
      p2.matched.push(...p2.open);
      p2.open = [];
      s.play.progress = p2.matched.length / 4;
      s.feedback = p2.matched.length === 4 ? "山影与窗灯，都记住了。" : "找到一对了，还有两张。";
      emit2(s, "pack-place", index);
      if (p2.matched.length === 4)
        settle(s);
    } else {
      p2.turnAt = s.age;
      s.feedback = "这两张不同，再翻翻看。";
    }
  }
  function paintPoint(s, at2, start = false) {
    const p2 = s.session;
    if (p2.kind !== "waterfall")
      return;
    const r = layout(s).sketchImage, next = { x: clamp3((at2.x - r.x) / r.width, 0, 1), y: clamp3((at2.y - r.y) / r.height, 0, 1) };
    const lastStroke = p2.strokes[p2.strokes.length - 1], old = lastStroke?.points[lastStroke.points.length - 1] ?? p2.brush;
    p2.brush = next;
    if (!inside(at2, r)) {
      p2.drawing = false;
      return;
    }
    if (!p2.drawing && !start)
      return;
    if (!start && lastStroke?.color === p2.color && distance2(old, next) < 3e-3)
      return;
    const begin = start || !p2.strokes.length || p2.strokes[p2.strokes.length - 1].color !== p2.color;
    if (begin) {
      p2.strokes.push({ color: p2.color, points: [next] });
    } else {
      const last = p2.strokes[p2.strokes.length - 1];
      if (last.points.length >= 500)
        p2.strokes.push({ color: p2.color, points: [old, next] });
      else
        p2.strokes[p2.strokes.length - 1] = { color: last.color, points: [...last.points, next] };
    }
    p2.drawing = true;
    s.acted = true;
    s.gesture = "drag";
    const samples = Math.max(1, Math.ceil(distance2(begin ? next : old, next) / (BRUSH * 0.35)));
    for (let j = 0; j <= samples; j++) {
      const t = j / samples, a = begin ? next : old, sample = { x: a.x + (next.x - a.x) * t, y: a.y + (next.y - a.y) * t };
      PAINT_CELLS.forEach((cells, region) => cells.forEach((cell, index) => {
        if (distance2(cell, sample) <= BRUSH && !p2.coverage[region].includes(index))
          p2.coverage[region].push(index);
      }));
    }
    const filled = coverage(s);
    s.play.progress = filled.reduce((sum, value) => sum + Math.min(1, value / 0.62), 0) / 2;
    s.feedback = filled.every((value) => value >= 0.62) ? "这一页山色，留下来了。" : filled[0] >= 0.62 ? "岩壁有颜色了，再涂涂草木。" : filled[1] >= 0.62 ? "草木有颜色了，再涂涂岩壁。" : "把颜色轻轻涂在纸上的两处留白。";
    if (start)
      emit2(s, "depth-paper");
    if (filled.every((value) => value >= 0.62)) {
      p2.drawing = false;
      p2.keyHeld = false;
      settle(s);
    }
  }
  function shoot(s) {
    const p2 = s.session;
    if (p2.kind !== "river")
      return;
    if (!p2.adjusted || !frameFits(s)) {
      s.feedback = "把巨石的上缘和旁边的白浪，都留在圆窗里。";
      return;
    }
    p2.shot = { center: frameCenter(s), wave: s.wave, portrait: s.portrait };
    s.acted = true;
    s.play.progress = 1;
    emit2(s, "shutter");
    settle(s);
  }
  function actMemory(state3, input) {
    const s = fork(state3);
    if (input.action === "retry-capture" && s.flow.kind === "capture-error") {
      s.flow = { kind: "capturing" };
      return s;
    }
    if (s.flow.kind !== "playing")
      return state3;
    const at2 = point(input), l = layout(s), p2 = s.session;
    if (!at2)
      return state3;
    if (input.phase === "press") {
      switch (p2.kind) {
        case "bends":
          if (p2.phase.kind === "drawing") {
            p2.phase.keyboard = false;
            beginRoad(s, roadFromStage(s, at2));
          }
          break;
        case "inn":
          break;
        case "waterfall": {
          p2.keyboard = false;
          const color = l.swatches.findIndex((c) => distance2(c, at2) <= (s.portrait ? 76 : 48));
          if (color >= 0) {
            p2.color = color;
            emit2(s, "depth-paper");
          } else if (inside(at2, l.sketchImage))
            paintPoint(s, at2, true);
          break;
        }
        case "river": {
          const center = frameCenter(s);
          if (distance2(at2, center) <= l.radius + 35)
            p2.drag = { offset: { x: center.x - at2.x, y: center.y - at2.y }, moved: false };
          break;
        }
      }
    } else if (input.phase === "release") {
      switch (p2.kind) {
        case "bends":
          drawRoad(s, roadFromStage(s, at2));
          finishRoad(s);
          break;
        case "inn": {
          const index = l.cards.findIndex((card) => inside(at2, card));
          if (index >= 0) {
            p2.focus = index;
            flipCard(s, index);
          }
          break;
        }
        case "waterfall":
          p2.drawing = false;
          break;
        case "river": {
          const moved = p2.drag?.moved;
          p2.drag = null;
          if (moved)
            shoot(s);
          break;
        }
      }
      s.dragging = false;
    }
    return s;
  }
  function moveMemory(state3, input) {
    if (state3.flow.kind !== "playing")
      return state3;
    const at2 = point(input);
    if (!at2)
      return state3;
    const s = fork(state3), p2 = s.session;
    switch (p2.kind) {
      case "bends":
        drawRoad(s, roadFromStage(s, at2));
        break;
      case "inn":
        break;
      case "waterfall":
        if (p2.drawing)
          paintPoint(s, at2);
        break;
      case "river":
        if (p2.drag) {
          const center = { x: at2.x + p2.drag.offset.x, y: at2.y + p2.drag.offset.y }, before = frameCenter(s);
          p2.center = moveFrame(s, center);
          if (distance2(before, frameCenter(s)) > 0.2) {
            p2.drag.moved = true;
            p2.adjusted = true;
            s.acted = true;
            s.gesture = "drag";
          }
          s.feedback = frameFits(s) ? "巨石和白浪入窗了，松手留下这一刻。" : "再移一移圆窗，把巨石和白浪一起装进去。";
        }
        break;
    }
    return s;
  }
  function releaseMemory(state3) {
    const s = fork(state3), p2 = s.session;
    s.dragging = false;
    if (p2.kind === "bends" && p2.phase.kind === "drawing")
      p2.phase.pen = { kind: "up" };
    if (p2.kind === "waterfall") {
      p2.drawing = false;
      p2.keyHeld = false;
    }
    if (p2.kind === "river")
      p2.drag = null;
    return s;
  }
  function tickMemory(state3, dt) {
    if (!Number.isFinite(dt) || dt <= 0 || state3.done)
      return state3;
    const s = fork(state3), p2 = s.session;
    s.age += Math.min(dt, 0.1);
    if (p2.kind !== "river" || !p2.shot)
      s.wave += s.play.reduced ? 0 : Math.min(dt, 0.1);
    if (p2.kind === "bends" && s.flow.kind === "playing") {
      const phase = p2.phase;
      if (phase.kind === "walking") {
        const before = Math.floor(phase.progress * ROAD_LENGTH / 34);
        phase.elapsed += Math.min(dt, 0.1);
        phase.progress = roadWalkingProgress(phase.elapsed);
        s.play.progress = 0.55 + phase.progress * 0.3;
        const step = Math.floor(phase.progress * ROAD_LENGTH / 34);
        if (step > before)
          emit2(s, "road-step", step);
        if (phase.elapsed >= ROAD_WALK_SECONDS) {
          p2.phase = { kind: "river", elapsed: 0 };
          s.feedback = "山弯转过，金沙江的激流就在峡谷下方。";
          emit2(s, "river-arrive");
        }
      } else if (phase.kind === "river") {
        phase.elapsed = Math.min(ROAD_RIVER_SECONDS, phase.elapsed + Math.min(dt, 0.1));
        s.play.progress = 0.85 + phase.elapsed / ROAD_RIVER_SECONDS * 0.1;
        if (phase.elapsed >= ROAD_RIVER_SECONDS)
          settle(s);
      }
    }
    if (p2.kind === "inn" && p2.turnAt !== null && s.age - p2.turnAt > (s.play.reduced ? 0.35 : 0.85)) {
      p2.open = [];
      p2.turnAt = null;
    }
    if (p2.kind === "waterfall") {
      if (p2.keyHeld && s.flow.kind === "playing") {
        const r = layout(s).sketchImage;
        paintPoint(s, { x: r.x + p2.brush.x * r.width, y: r.y + p2.brush.y * r.height });
      }
      if (s.flow.kind !== "playing")
        p2.reveal = clamp3(p2.reveal + dt * 1.4, 0, 1);
    }
    if (s.flow.kind === "settling" && s.age - s.flow.at >= (s.play.reduced ? 0.3 : 1.1))
      s.flow = { kind: "capturing" };
    if (s.flow.kind === "complete" && s.play.completedAt !== null && s.age - s.play.completedAt > (s.play.reduced ? 0.3 : 1.15))
      s.done = true;
    return s;
  }
  function attachMemoryCapture(state3, art) {
    if (state3.flow.kind !== "capturing")
      return state3;
    const s = fork(state3);
    if (!art) {
      s.flow = { kind: "capture-error" };
      s.feedback = "画面暂未能保存，可重试留下这幅画，或继续旅程。";
      return s;
    }
    s.flow = { kind: "complete", art };
    s.play.complete = true;
    s.play.progress = 1;
    s.play.completedAt = s.age;
    s.feedback = MEMORY_SPECS[s.id].badge + "，这一刻值得留下。";
    emit2(s, "complete");
    return s;
  }
  function keyMemory(state3, key, phase) {
    const arrow2 = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[key];
    if (!arrow2 && !["Enter", " ", "1", "2", "3"].includes(key))
      return null;
    if (state3.flow.kind !== "playing")
      return state3;
    const s = fork(state3), p2 = s.session;
    if (phase === "up") {
      if (p2.kind === "bends" && (key === " " || key === "Enter"))
        finishRoad(s);
      if (key === " " && p2.kind === "waterfall") {
        p2.keyHeld = false;
        p2.drawing = false;
      }
      return s;
    }
    switch (p2.kind) {
      case "bends": {
        if (p2.phase.kind !== "drawing")
          break;
        p2.phase.keyboard = true;
        if (arrow2) {
          const at2 = { x: clamp3(p2.phase.cursor.x + arrow2[0] * 12, 0, 1e3), y: clamp3(p2.phase.cursor.y + arrow2[1] * 12, 0, 750) };
          if (p2.phase.pen.kind === "down")
            drawRoad(s, at2);
          else
            p2.phase.cursor = at2;
        } else if ((key === " " || key === "Enter") && p2.phase.pen.kind === "up")
          beginRoad(s, p2.phase.cursor);
        break;
      }
      case "inn":
        if (arrow2)
          p2.focus = (p2.focus + (arrow2[0] || arrow2[1]) + 4) % 4;
        else if (key === "Enter" || key === " ")
          flipCard(s, p2.focus);
        break;
      case "waterfall": {
        p2.keyboard = true;
        if (/^[1-3]$/.test(key)) {
          p2.color = Number(key) - 1;
          p2.drawing = false;
        } else if (arrow2) {
          p2.brush = { x: clamp3(p2.brush.x + arrow2[0] * 0.045, 0, 1), y: clamp3(p2.brush.y + arrow2[1] * 0.045, 0, 1) };
        } else if (key === " ") {
          p2.keyHeld = true;
          const r = layout(s).sketchImage;
          paintPoint(s, { x: r.x + p2.brush.x * r.width, y: r.y + p2.brush.y * r.height }, !p2.drawing);
        }
        break;
      }
      case "river":
        if (arrow2) {
          const center = frameCenter(s);
          p2.center = moveFrame(s, { x: center.x + arrow2[0] * 24, y: center.y + arrow2[1] * 24 });
          p2.adjusted = true;
          s.acted = true;
        } else if (key === "Enter" || key === " ")
          shoot(s);
        break;
    }
    return s;
  }

  // .build/typescript/wugong-walk/scroll/camp-poses.js
  var CAMP_POSE_FILE = "scenes/wugong-camp-night-v1/actions-q-v1.webp";
  var CAMP_POSE_SCALE = 54 / 634;
  var CAMP_POSES = [
    {
      "x": 122,
      "y": 23,
      "width": 375,
      "height": 634,
      "footX": 288.75,
      "footY": 629
    },
    {
      "x": 728,
      "y": 88,
      "width": 479,
      "height": 565,
      "footX": 153.28,
      "footY": 560
    },
    {
      "x": 61,
      "y": 695,
      "width": 556,
      "height": 516,
      "footX": 489.28000000000003,
      "footY": 511
    },
    {
      "x": 670,
      "y": 694,
      "width": 539,
      "height": 519,
      "footX": 474.32,
      "footY": 514
    }
  ];

  // .build/typescript/characters/braided-art.js
  var BRAIDED_FILE = "characters/braided-hiker-v1.webp";
  var BRAIDED_WALK_SCALE = 54 / 348.5;
  var BRAIDED_ACTION_SCALE = 54 / 284;
  var BRAIDED_WALK_FRAMES = [[99, 17, 243, 358, 125, 357], [484, 17, 218, 356, 124, 355], [869, 17, 212, 359, 121, 358], [1242, 17, 218, 358, 134, 357], [98, 389, 234, 344, 117, 343], [484, 389, 227, 343, 119, 342], [865, 389, 215, 345, 125, 344], [1241, 389, 228, 344, 137, 343]];
  var BRAIDED_ACTION_FRAMES = [[105, 737, 178, 285, 104, 284], [463, 765, 277, 247, 87, 246], [805, 773, 313, 241, 155, 240], [1189, 773, 321, 241, 161, 240]];
  var BRAIDED_CONTACT_OFFSETS = [-6.934, 4.088, -3.717, -8.292, -3.218, 7.271, -2.926, -7.643];

  // .build/typescript/characters/catalog.js
  function walkingFrames(frames, scale, contacts) {
    return frames.map(([x, y, width, height, footX, footY], i) => ({ x, y, width, height, footX, footY, scale, contactX: contacts[i] ?? 0 }));
  }
  var blueCampRoots = [340, 875, 345, 957];
  var CHARACTERS = {
    blue: {
      name: "蓝衣旅人",
      detail: "灰蓝外套 · 苔绿背包",
      preview: "characters/blue-hiker-preview-v1.webp",
      walk: { file: MAP_WALK_FILE, frames: walkingFrames(MAP_WALK_FRAMES, MAP_WALK_SCALE, [-3.74, 3.74, -0.44, -4.92, -5.12, 2.83, -3.49, -4.95]) },
      actions: { file: CAMP_POSE_FILE, frames: CAMP_POSES.map((p2, i) => ({ ...p2, footX: blueCampRoots[i] - p2.x, scale: CAMP_POSE_SCALE, contactX: 0 })) }
    },
    braids: {
      name: "双辫旅人",
      detail: "米白外套 · 红棕背包",
      preview: "characters/braided-hiker-preview-v1.webp",
      walk: { file: BRAIDED_FILE, frames: walkingFrames(BRAIDED_WALK_FRAMES, BRAIDED_WALK_SCALE, BRAIDED_CONTACT_OFFSETS) },
      actions: { file: BRAIDED_FILE, frames: walkingFrames(BRAIDED_ACTION_FRAMES, BRAIDED_ACTION_SCALE, [0, 0, 0, 0]) }
    }
  };
  var CHARACTER_IDS = ["blue", "braids"];
  var DEFAULT_CHARACTER = "blue";
  var storageKey = "trailbound.character.v1";
  var sessionChoice;
  function characterId(value) {
    return CHARACTER_IDS.find((id2) => id2 === value);
  }
  function readCharacterId() {
    if (sessionChoice)
      return sessionChoice;
    try {
      return characterId(localStorage.getItem(storageKey)) ?? DEFAULT_CHARACTER;
    } catch {
      return DEFAULT_CHARACTER;
    }
  }

  // .build/typescript/runtime/tiger-memories/view.js
  function polygon(ctx, points, r) {
    points.forEach((p2, i) => {
      const x = r.x + p2.x * r.width, y = r.y + p2.y * r.height;
      if (!i)
        ctx.moveTo(x, y);
      else
        ctx.lineTo(x, y);
    });
    ctx.closePath();
  }
  function paintImage(ctx, image, r) {
    ctx.drawImage(image, r.x, r.y, r.width, r.height);
  }
  function imagePart(ctx, image, source, target) {
    ctx.drawImage(image, source.x * image.naturalWidth / 1e3, source.y * image.naturalHeight / 750, source.width * image.naturalWidth / 1e3, source.height * image.naturalHeight / 750, target.x, target.y, target.width, target.height);
  }
  function paperPath(ctx, r) {
    ctx.beginPath();
    ctx.moveTo(r.x + 3, r.y + 2);
    ctx.lineTo(r.x + r.width - 3, r.y);
    ctx.lineTo(r.x + r.width, r.y + r.height - 4);
    ctx.lineTo(r.x + 2, r.y + r.height);
    ctx.closePath();
  }
  function paper(ctx, r, outline2 = "#b9b196", shadow = false) {
    ctx.save();
    if (shadow) {
      ctx.shadowColor = "#253e393d";
      ctx.shadowBlur = 13;
      ctx.shadowOffsetY = 5;
    }
    paperPath(ctx, r);
    ctx.fillStyle = "#f4efdf";
    ctx.fill();
    ctx.shadowColor = "transparent";
    ctx.strokeStyle = outline2;
    ctx.lineWidth = 1.6;
    ctx.stroke();
    ctx.restore();
  }
  function ink2(ctx, text, at2, size = 17) {
    ctx.fillStyle = "#6b7761";
    ctx.font = `${size}px "PingFang SC",sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText(text, at2.x, at2.y);
  }
  var MemoryView = class {
    kind;
    doc;
    tiger = true;
    canvas;
    contentState = "loading";
    disposed = false;
    images = null;
    observer = null;
    host = null;
    state = null;
    brushCanvas;
    paintedStrokes = -1;
    paintedPoints = -1;
    portraitValue = false;
    cssWidth = 1e3;
    actorId;
    constructor(kind, doc) {
      this.kind = kind;
      this.doc = doc;
      this.actorId = characterId(new URLSearchParams(doc.defaultView?.location.search).get("character")) ?? readCharacterId();
      this.canvas = doc.createElement("canvas");
      this.canvas.className = "tiger-memory-canvas";
      this.canvas.setAttribute("aria-hidden", "true");
      this.brushCanvas = doc.createElement("canvas");
      this.brushCanvas.width = 640;
      this.brushCanvas.height = 480;
    }
    get portrait() {
      return this.portraitValue;
    }
    resize() {
      if (!this.host || this.disposed)
        return;
      const rect = this.host.getBoundingClientRect(), ratio = Math.min(2, window.devicePixelRatio || 1, Math.sqrt(3e6 / Math.max(1, rect.width * rect.height)));
      this.cssWidth = Math.max(1, rect.width);
      this.portraitValue = window.innerWidth <= 600 || rect.height / Math.max(1, rect.width) > 1.05;
      this.canvas.width = Math.max(1, Math.round(rect.width * ratio));
      this.canvas.height = Math.max(1, Math.round(rect.height * ratio));
      if (this.state)
        this.paint(this.state);
    }
    async mount(host, cache2) {
      this.host = host;
      host.append(this.canvas);
      this.resize();
      this.observer = new ResizeObserver(() => this.resize());
      this.observer.observe(host);
      const load = async (file) => {
        const entry = cache2?.request(file, "high");
        if (entry) {
          await entry.promise;
          if (entry.state !== "ready")
            throw new Error("画作暂未能展开");
          return entry.image;
        }
        const image = new Image();
        image.src = file;
        await image.decode();
        return image;
      };
      try {
        if (!this.canvas.getContext("2d"))
          throw new Error("画面暂不支持绘制");
        const loadActor = async () => {
          if (this.kind !== "bends")
            return null;
          try {
            return await load(CHARACTERS[this.actorId].walk.file);
          } catch (error) {
            if (this.actorId === DEFAULT_CHARACTER)
              throw error;
            this.actorId = DEFAULT_CHARACTER;
            return load(CHARACTERS[this.actorId].walk.file);
          }
        };
        const [scene, badge, actor, rapids] = await Promise.all([load(sceneFile(this.kind)), load(badgeFile(this.kind)), loadActor(), this.kind === "bends" ? load(sceneFile("river")) : Promise.resolve(null)]);
        if (this.disposed)
          return;
        this.images = { scene, badge, actor, rapids };
        this.contentState = "ready";
        if (this.state)
          this.paint(this.state);
      } catch {
        if (!this.disposed) {
          this.contentState = "error";
          if (this.state)
            this.paint(this.state);
        }
      }
    }
    input(input) {
      if (this.kind === "bends" && this.state && typeof input.x === "number" && typeof input.y === "number") {
        const viewport = this.canvas, l = layout(this.state, viewport);
        const world = roadFromStage(this.state, { x: input.x * l.width, y: input.y * l.height }, viewport);
        return { ...input, ...roadToStage(this.state, world) };
      }
      const height = this.portraitValue ? this.kind === "bends" ? 1040 : 1260 : 750, scale = Math.min(this.canvas.width / 1e3, this.canvas.height / height);
      const dx = (this.canvas.width - 1e3 * scale) / 2, dy = (this.canvas.height - height * scale) / 2;
      return { ...input, x: typeof input.x === "number" ? (input.x * this.canvas.width - dx) / scale : void 0, y: typeof input.y === "number" ? (input.y * this.canvas.height - dy) / scale : void 0 };
    }
    brushLayer(s) {
      const p2 = s.session;
      if (p2.kind !== "waterfall")
        return this.brushCanvas;
      const points = p2.strokes.reduce((sum, stroke) => sum + stroke.points.length, 0);
      if (this.paintedStrokes === p2.strokes.length && this.paintedPoints === points)
        return this.brushCanvas;
      this.paintedStrokes = p2.strokes.length;
      this.paintedPoints = points;
      const ctx = this.brushCanvas.getContext("2d");
      if (!ctx)
        return this.brushCanvas;
      ctx.clearRect(0, 0, 640, 480);
      ctx.save();
      ctx.beginPath();
      for (const region of PAINT_REGIONS)
        polygon(ctx, region, { x: 0, y: 0, width: 640, height: 480 });
      ctx.clip();
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      for (const stroke of p2.strokes) {
        const first = stroke.points[0];
        if (!first)
          continue;
        ctx.strokeStyle = PALETTE[stroke.color];
        ctx.fillStyle = PALETTE[stroke.color];
        ctx.globalAlpha = 0.6;
        ctx.lineWidth = 640 * 0.136;
        ctx.beginPath();
        ctx.moveTo(first.x * 640, first.y * 480);
        for (const point2 of stroke.points.slice(1))
          ctx.lineTo(point2.x * 640, point2.y * 480);
        if (stroke.points.length === 1) {
          ctx.arc(first.x * 640, first.y * 480, 640 * 0.068, 0, Math.PI * 2);
          ctx.fill();
        } else
          ctx.stroke();
        ctx.globalAlpha = 0.12;
        ctx.lineWidth = 640 * 0.153;
        ctx.stroke();
      }
      ctx.restore();
      return this.brushCanvas;
    }
    paintedScene(ctx, s, r) {
      if (!this.images)
        return;
      paintImage(ctx, this.images.scene, r);
      ctx.save();
      ctx.beginPath();
      for (const region of PAINT_REGIONS)
        polygon(ctx, region, r);
      ctx.clip();
      ctx.globalAlpha = 0.87;
      ctx.fillStyle = "#f4efdf";
      ctx.fillRect(r.x, r.y, r.width, r.height);
      ctx.globalAlpha = 1;
      paintImage(ctx, this.brushLayer(s), r);
      ctx.globalCompositeOperation = "multiply";
      ctx.globalAlpha = 0.85;
      paintImage(ctx, this.images.scene, r);
      ctx.restore();
    }
    river(ctx, s, wave = s.wave, image = this.images?.scene, r = riverImageRect(s.portrait)) {
      if (!image)
        return;
      paintImage(ctx, image, r);
      if (s.play.reduced)
        return;
      const opacity = ctx.globalAlpha;
      ctx.save();
      ctx.beginPath();
      polygon(ctx, [{ x: 0.06, y: 0.53 }, { x: 0.4, y: 0.47 }, { x: 0.5, y: 0.45 }, { x: 0.6, y: 0.46 }, { x: 0.8, y: 0.54 }, { x: 1, y: 0.55 }, { x: 1, y: 1 }, { x: 0.62, y: 1 }, { x: 0.45, y: 0.84 }, { x: 0.13, y: 0.74 }], r);
      polygon(ctx, [{ x: 0.427, y: 0.585 }, { x: 0.449, y: 0.498 }, { x: 0.489, y: 0.454 }, { x: 0.555, y: 0.477 }, { x: 0.623, y: 0.512 }, { x: 0.653, y: 0.565 }, { x: 0.735, y: 0.591 }, { x: 0.766, y: 0.675 }, { x: 0.736, y: 0.73 }, { x: 0.65, y: 0.74 }, { x: 0.54, y: 0.704 }, { x: 0.462, y: 0.663 }], r);
      ctx.clip("evenodd");
      ctx.globalAlpha = opacity * 0.34;
      for (let i = 0; i < 12; i++) {
        const y = 0.46 + i * 0.045, sy = y * image.naturalHeight, h = 0.045 * image.naturalHeight;
        const shift = Math.sin(wave * 1.8 - i * 0.6) * (1 + i * 0.13);
        ctx.drawImage(image, 0, sy, image.naturalWidth, Math.min(h, image.naturalHeight - sy), r.x + shift, r.y + y * r.height + Math.sin(wave * 1.3 - i) * 1.8, r.width, h / image.naturalHeight * r.height + 2);
      }
      ctx.globalAlpha = opacity * 0.42;
      ctx.strokeStyle = "#f5f5e4";
      ctx.lineWidth = 1.3;
      for (let i = 0; i < 30; i++) {
        const t = (wave * 0.12 + i * 0.137) % 1, x = 0.75 + Math.sin(i * 23.6) * 0.15 + t * 0.08, y = 0.55 + t * 0.44;
        ctx.beginPath();
        ctx.ellipse(r.x + x * r.width, r.y + y * r.height, 2 + t * 7, 0.7 + t, 0.3, 0.1, 2.7);
        ctx.stroke();
      }
      ctx.restore();
    }
    waterDrops(ctx, s) {
      if (s.play.reduced)
        return;
      ctx.save();
      ctx.strokeStyle = "#f4f5e8";
      ctx.lineWidth = 1.2;
      ctx.globalAlpha = 0.45;
      for (let i = 0; i < 21; i++) {
        const t = (s.wave * 0.35 + i * 0.139) % 1;
        const x = 105 + t * 105 + Math.sin(i * 4.8) * (5 + t * 7), y = 25 + t * 470;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + 1, y + 5 + t * 7);
        ctx.stroke();
      }
      ctx.restore();
    }
    roadJourney(ctx, s, l) {
      if (!this.images || s.session.kind !== "bends")
        return;
      const phase = s.session.phase, walk = roadWalk(phase), drawn = phase.kind === "drawing" ? phase.progress : 1, unit = 1e3 / this.cssWidth;
      ctx.save();
      ctx.translate(l.scene.x, l.scene.y);
      ctx.scale(l.scene.width / 1e3, l.scene.height / 750);
      const stroke = (progress) => {
        ctx.beginPath();
        ctx.moveTo(ROAD_POINTS[0].x, ROAD_POINTS[0].y);
        for (const station of ROAD_STATIONS) {
          if (station.progress > progress)
            break;
          ctx.lineTo(station.point.x, station.point.y);
        }
        const tip = roadAt(progress);
        ctx.lineTo(tip.x, tip.y);
      };
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      if (phase.kind === "drawing") {
        stroke(1);
        ctx.globalAlpha = 0.95;
        ctx.strokeStyle = "#fcf7e7";
        ctx.lineWidth = 10;
        ctx.stroke();
        ctx.globalAlpha = 0.92;
        ctx.strokeStyle = "#557759";
        ctx.lineWidth = 3.2;
        ctx.setLineDash([8, 7]);
        ctx.stroke();
        ctx.setLineDash([]);
      }
      if (drawn > 0) {
        stroke(drawn);
        ctx.globalAlpha = 0.95;
        ctx.strokeStyle = "#f8f4e7";
        ctx.lineWidth = 10;
        ctx.stroke();
        ctx.globalAlpha = 1;
        ctx.strokeStyle = "#547159";
        ctx.lineWidth = 4.8;
        ctx.stroke();
        ctx.globalAlpha = 0.55;
        ctx.fillStyle = "#ece6d4";
        for (let i = 2; i < ROAD_STATIONS.length; i += 3) {
          const at3 = ROAD_STATIONS[i];
          if (at3.progress > drawn)
            break;
          ctx.beginPath();
          ctx.ellipse(at3.point.x + Math.sin(i) * 1.5, at3.point.y, 1.2, 0.5, i, 0, 7);
          ctx.fill();
        }
      }
      if (phase.kind === "drawing") {
        const tip = phase.keyboard ? phase.cursor : roadAt(drawn);
        ctx.globalAlpha = 0.95;
        ctx.strokeStyle = "#53715a";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(tip.x, tip.y);
        ctx.lineTo(tip.x + 12, tip.y - 17);
        ctx.lineTo(tip.x + 16, tip.y - 14);
        ctx.lineTo(tip.x + 3, tip.y + 1);
        ctx.closePath();
        ctx.stroke();
      }
      ctx.restore();
      if (phase.kind === "drawing") {
        for (const progress of [0.17, 0.52, 0.84]) {
          if (progress <= drawn)
            continue;
          const at3 = roadAt(progress), point2 = roadToStage(s, at3, this.canvas);
          ctx.save();
          ctx.translate(point2.x, point2.y);
          ctx.rotate(at3.heading);
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
          ctx.beginPath();
          ctx.moveTo(-5 * unit, -5 * unit);
          ctx.lineTo(2 * unit, 0);
          ctx.lineTo(-5 * unit, 5 * unit);
          ctx.strokeStyle = "#fff9e9";
          ctx.lineWidth = 5 * unit;
          ctx.stroke();
          ctx.strokeStyle = "#355d43";
          ctx.lineWidth = 2 * unit;
          ctx.stroke();
          ctx.restore();
        }
        const label = (text, progress, below) => {
          const at3 = roadToStage(s, roadAt(progress), this.canvas), gap = 12 * unit, height = 28 * unit;
          ctx.save();
          ctx.font = `600 ${13 * unit}px "PingFang SC",sans-serif`;
          const width = ctx.measureText(text).width + 20 * unit;
          const rect = { x: clamp3(at3.x - width / 2, 8 * unit, l.width - width - 8 * unit), y: below ? at3.y + gap : at3.y - gap - height, width, height };
          paper(ctx, rect, "#99ab8a", true);
          ctx.fillStyle = "#35573f";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(text, rect.x + width / 2, rect.y + height / 2);
          ctx.fillStyle = "#f9f5e5";
          ctx.strokeStyle = "#456c4e";
          ctx.lineWidth = 2 * unit;
          ctx.beginPath();
          ctx.arc(at3.x, at3.y, 5 * unit, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          if (below) {
            ctx.beginPath();
            ctx.arc(at3.x, at3.y, 2 * unit, 0, Math.PI * 2);
            ctx.fillStyle = "#456c4e";
            ctx.fill();
          } else {
            ctx.beginPath();
            ctx.moveTo(at3.x, at3.y - 2 * unit);
            ctx.lineTo(at3.x, at3.y - 18 * unit);
            ctx.lineTo(at3.x + 10 * unit, at3.y - 15 * unit);
            ctx.lineTo(at3.x, at3.y - 10 * unit);
            ctx.stroke();
          }
          ctx.restore();
        };
        label(drawn > 0.01 ? "起点" : "起点 · 从这里画", 0, true);
        label("终点 · 山肩", 1, false);
      }
      const actor = this.images.actor, at2 = roadAt(walk);
      const moving = phase.kind === "walking" && roadWalkingProgress(phase.elapsed + 0.02) > walk + 1e-5;
      if (actor) {
        const frame2 = CHARACTERS[this.actorId].walk.frames[moving && !s.play.reduced ? Math.floor(walk * ROAD_LENGTH / 12) % 8 : 1];
        const { x: sx, y: sy, width: w, height: h, footX: fx, footY: fy } = frame2;
        const scale = (60 - walk * 9) / 54 * frame2.scale * l.scene.width / 1e3, facing = Math.cos(at2.heading) < 0 ? -1 : 1;
        ctx.save();
        ctx.translate(l.scene.x + at2.x * l.scene.width / 1e3, l.scene.y + at2.y * l.scene.height / 750);
        if (phase.kind === "drawing")
          ctx.translate(-15, 5);
        ctx.fillStyle = "#38473b35";
        ctx.beginPath();
        ctx.ellipse(0, 1, 12, 3, 0, 0, 7);
        ctx.fill();
        ctx.rotate(clamp3(Math.sin(at2.heading) * facing * 0.08, -0.06, 0.04));
        ctx.scale(scale * facing, scale);
        ctx.drawImage(actor, sx, sy, w, h, -fx, -fy, w, h);
        ctx.restore();
      }
      if (phase.kind === "river" && this.images.rapids) {
        const fade = clamp3(phase.elapsed / (s.play.reduced ? 0.3 : 1), 0, 1), cover3 = Math.max(1, l.height / 750);
        const zoom = s.play.reduced ? 1 : 1 + Math.min(phase.elapsed, 4.8) * 6e-3;
        const width = 1e3 * cover3 * zoom, height = 750 * cover3 * zoom;
        ctx.save();
        ctx.globalAlpha = fade * fade * (3 - 2 * fade);
        this.river(ctx, s, phase.elapsed * 1.35, this.images.rapids, { x: (1e3 - width) * 0.55, y: (l.height - height) * 0.5, width, height });
        ctx.restore();
      }
    }
    pairs(ctx, s) {
      if (!this.images || s.session.kind !== "inn")
        return;
      const p2 = s.session, l = layout(s);
      if (s.portrait) {
        ctx.save();
        ctx.fillStyle = "#e7e0ca";
        ctx.fillRect(0, 750, 1e3, 510);
        ctx.globalAlpha = 0.18;
        paintImage(ctx, this.images.scene, { x: 0, y: 750, width: 1e3, height: 750 });
        ctx.restore();
      }
      for (const [index, r] of l.cards.entries()) {
        const visible = p2.open.includes(index) || p2.matched.includes(index);
        paper(ctx, r, p2.focus === index ? "#8e9b7b" : "#d4c9ad", true);
        ctx.save();
        paperPath(ctx, { x: r.x + 7, y: r.y + 7, width: r.width - 14, height: r.height - 14 });
        ctx.clip();
        if (visible) {
          const crop = p2.order[index] === 0 ? { x: 340, y: 235, width: 290, height: 260 } : { x: 8, y: 200, width: 240, height: 245 };
          imagePart(ctx, this.images.scene, crop, { x: r.x + 7, y: r.y + 7, width: r.width - 14, height: r.height - 14 });
        } else {
          ctx.globalAlpha = 0.17;
          paintImage(ctx, this.images.scene, r);
          ctx.globalAlpha = 1;
          ctx.strokeStyle = "#9ca58a";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(r.x + r.width * 0.2, r.y + r.height * 0.65);
          ctx.lineTo(r.x + r.width * 0.44, r.y + r.height * 0.3);
          ctx.lineTo(r.x + r.width * 0.62, r.y + r.height * 0.54);
          ctx.lineTo(r.x + r.width * 0.76, r.y + r.height * 0.36);
          ctx.stroke();
        }
        if (p2.matched.includes(index)) {
          ctx.fillStyle = "#f3ebba17";
          ctx.fillRect(r.x, r.y, r.width, r.height);
        }
        ctx.restore();
      }
      ctx.save();
      ctx.globalAlpha = p2.matched.length / 4 * 0.12;
      ctx.fillStyle = "#203957";
      ctx.fillRect(0, 0, 1e3, 510);
      ctx.restore();
    }
    painting(ctx, s) {
      if (s.session.kind !== "waterfall")
        return;
      const l = layout(s), p2 = s.session;
      this.waterDrops(ctx, s);
      if (s.portrait) {
        ctx.fillStyle = "#e8e6d7";
        ctx.fillRect(0, 750, 1e3, 510);
      }
      paper(ctx, l.sketch, "#d3c6a8", true);
      this.paintedScene(ctx, s, l.sketchImage);
      ctx.save();
      ctx.strokeStyle = "#71806b";
      ctx.globalAlpha = 0.45;
      ctx.lineWidth = 1;
      const filled = coverage(s);
      PAINT_REGIONS.forEach((region, i) => {
        if (filled[i] >= 0.62)
          return;
        ctx.beginPath();
        polygon(ctx, region, l.sketchImage);
        ctx.stroke();
      });
      ctx.restore();
      for (const [i, at2] of l.swatches.entries()) {
        ctx.save();
        ctx.translate(at2.x, at2.y);
        ctx.beginPath();
        for (let n = 0; n <= 30; n++) {
          const a = n / 30 * Math.PI * 2, r = 24 + Math.sin(n * 2.3) * 2;
          if (!n)
            ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
          else
            ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
        }
        ctx.fillStyle = PALETTE[i];
        ctx.fill();
        if (p2.color === i) {
          ctx.strokeStyle = "#fef9e4";
          ctx.lineWidth = 3;
          ctx.stroke();
        }
        ctx.restore();
      }
      if (p2.keyboard) {
        ctx.save();
        ctx.strokeStyle = "#516d59";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(l.sketchImage.x + p2.brush.x * l.sketchImage.width, l.sketchImage.y + p2.brush.y * l.sketchImage.height, 12, 0, 7);
        ctx.stroke();
        ctx.restore();
      }
    }
    paint(s) {
      this.state = s;
      if (this.disposed)
        return;
      const ctx = this.canvas.getContext("2d");
      if (!ctx)
        return;
      const l = layout(s, s.kind === "bends" ? this.canvas : void 0), scale = Math.min(this.canvas.width / l.width, this.canvas.height / l.height);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      ctx.fillStyle = "#ede9da";
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      ctx.setTransform(scale, 0, 0, scale, (this.canvas.width - l.width * scale) / 2, (this.canvas.height - l.height * scale) / 2);
      if (this.contentState !== "ready" || !this.images) {
        ink2(ctx, this.contentState === "error" ? "画作暂未展开，可以重试或继续走。" : "山与江正在展开……", { x: 500, y: l.height / 2 }, 24);
        return;
      }
      if (s.kind === "river") {
        this.river(ctx, s, s.session.kind === "river" && s.session.shot ? s.session.shot.wave : s.wave);
        const center = s.session.kind === "river" && s.session.shot ? s.session.shot.center : frameCenter(s);
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, 1e3, l.height);
        ctx.arc(center.x, center.y, l.radius, 0, 7, true);
        ctx.fillStyle = "#233a3455";
        ctx.fill("evenodd");
        ctx.beginPath();
        ctx.arc(center.x, center.y, l.radius, 0, 7);
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = frameFits(s) ? "#f2e2a5" : "#f3edd8";
        ctx.stroke();
        ctx.restore();
      } else {
        paintImage(ctx, this.images.scene, l.scene);
        if (s.kind === "bends")
          this.roadJourney(ctx, s, l);
        if (s.kind === "inn")
          this.pairs(ctx, s);
        if (s.kind === "waterfall")
          this.painting(ctx, s);
      }
      if (s.flow.kind === "complete") {
        const q = clamp3((s.age - (s.play.completedAt ?? s.age)) / (s.play.reduced ? 0.2 : 1), 0, 1), size = Math.min(510, l.height * 0.62), x = (1e3 - size) / 2, y = (l.height - size) / 2;
        ctx.save();
        ctx.fillStyle = `rgba(34,53,44,${q * 0.42})`;
        ctx.fillRect(0, 0, 1e3, l.height);
        ctx.globalAlpha = q;
        const capture = this.captureImage;
        if (capture?.complete && capture.naturalWidth)
          ctx.drawImage(capture, x, y, size, size);
        ctx.restore();
      }
    }
    captureImage = null;
    capture(s) {
      if (!this.images || this.disposed)
        return null;
      const badge = this.images.badge;
      const canvas = composePaperBadge(this.doc, (ctx, art) => {
        if (s.session.kind === "waterfall") {
          const scale = art.radius / 249;
          ctx.translate(art.x, art.y);
          ctx.scale(scale, scale);
          ctx.translate(-288, -288);
          this.paintedScene(ctx, s, { x: -88, y: -6, width: 752, height: 564 });
        } else if (s.session.kind === "river" && s.session.shot) {
          const l = layout(s), at2 = s.session.shot.center;
          ctx.translate(art.x, art.y);
          ctx.scale(art.radius / l.radius, art.radius / l.radius);
          ctx.translate(-at2.x, -at2.y);
          this.river(ctx, s, s.session.shot.wave);
        } else {
          const source = TIGER_BADGE_ART[s.kind];
          paintBadgeImage(ctx, badge, {
            x: badge.naturalWidth * source.x,
            y: badge.naturalHeight * source.y,
            radius: Math.min(badge.naturalWidth, badge.naturalHeight) * source.radius
          }, art);
        }
      });
      const url = canvas && encodePaperBadge(canvas, 4e5);
      if (url) {
        this.captureImage = new Image();
        this.captureImage.src = url;
      }
      return url;
    }
    reset() {
      this.paintedStrokes = this.paintedPoints = -1;
      this.captureImage = null;
    }
    dispose() {
      this.disposed = true;
      this.observer?.disconnect();
      this.observer = null;
      this.canvas.remove();
      this.images = null;
      this.state = null;
      this.captureImage = null;
      this.canvas.width = this.canvas.height = this.brushCanvas.width = this.brushCanvas.height = 1;
    }
  };
  function viewOf(refs) {
    if (!(refs instanceof MemoryView))
      throw new Error("虎跳峡互动画面不匹配");
    return refs;
  }

  // .build/typescript/runtime/tiger-memories/adapter.js
  function createTigerMemoryGames(dom2, onAction) {
    const { get: $2, text } = dom2, bindings = new EventBindings();
    let active = null;
    const captureButton = dom2.document.createElement("button");
    captureButton.type = "button";
    captureButton.textContent = "重试留下这幅画";
    captureButton.hidden = true;
    $2("tiger-actions").append(captureButton);
    bindings.listen(captureButton, "click", () => onAction("retry-capture"));
    bindings.listen($2("micro-surface"), "blur", () => {
      if (active && !active.disposed)
        onAction("cancel-brush");
    });
    const adapter = {
      create(entry, options) {
        if (!memoryId(entry.id))
          throw new Error("虎跳峡互动没有对应的画作");
        active?.reset();
        return createMemory(entry.id, options.reduced);
      },
      act: (s, input) => actMemory(stateOf(s), input),
      move: (s, input) => moveMemory(stateOf(s), input),
      release: (s) => releaseMemory(stateOf(s)),
      tick(state3, dt) {
        let s = tickMemory(stateOf(state3), dt);
        s.portrait = s.session.kind === "river" && s.session.shot ? s.session.shot.portrait : active?.portrait ?? s.portrait;
        if (s.flow.kind === "capturing" && active?.contentState === "ready")
          s = attachMemoryCapture(s, active.capture(s));
        return s;
      },
      draw(_svg, _parent, entry) {
        if (!memoryId(entry.id))
          throw new Error("虎跳峡画作不存在");
        return new MemoryView(MEMORY_SPECS[entry.id].kind, dom2.document);
      },
      paint(refs, state3) {
        const view3 = viewOf(refs), s = stateOf(state3);
        active = view3;
        s.portrait = s.session.kind === "river" && s.session.shot ? s.session.shot.portrait : view3.portrait;
        view3.paint(s);
      },
      instruction: (entry) => memoryId(entry.id) ? MEMORY_SPECS[entry.id].prompt : "",
      status: (s) => stateOf(s).feedback,
      outcome(state3, entry) {
        const s = stateOf(state3);
        return { id: s.id, edition: entry.edition, earned: s.play.complete && s.flow.kind === "complete", interaction: s.gesture, memory: MEMORY_SPECS[s.id].memory, title: MEMORY_SPECS[s.id].badge, ...s.flow.kind === "complete" && (s.kind === "waterfall" || s.kind === "river") ? { captureArt: s.flow.art, artSource: "capture" } : {} };
      },
      assets: (entry) => ({ scene: memoryId(entry.id) ? sceneFile(MEMORY_SPECS[entry.id].kind) : void 0 }),
      mount: (refs, context) => viewOf(refs).mount(context.host, context.cache),
      dispose(refs) {
        viewOf(refs).dispose();
        active = null;
        $2("micro-panel").removeAttribute("data-memory");
        $2("micro-panel").removeAttribute("data-memory-acted");
        $2("micro-panel").removeAttribute("data-road-phase");
        captureButton.hidden = true;
      },
      point: (refs, input) => viewOf(refs).input(input),
      key: (s, key, phase) => keyMemory(stateOf(s), key, phase),
      present(state3, refs) {
        const s = stateOf(state3), view3 = viewOf(refs), spec = MEMORY_SPECS[s.id];
        const panel = $2("micro-panel");
        panel.dataset.memory = s.kind;
        panel.dataset.memoryActed = String(s.acted);
        panel.dataset.phase = s.play.complete ? "memory" : s.acted ? "play" : "invite";
        text("micro-title", spec.title);
        text("micro-instruction", view3.contentState === "ready" ? spec.prompt : view3.contentState === "error" ? "画作暂未展开，可以重试或继续走。" : "手绘正在展开……");
        text("micro-result", s.feedback);
        text("micro-skip", "继续旅程 →");
        if (s.session.kind === "bends") {
          panel.dataset.roadPhase = s.session.phase.kind;
          if (s.session.phase.kind === "drawing" && !s.acted && view3.contentState === "ready")
            text("micro-result", "画一个 S 弯，再看看山下的江。");
          else if (s.session.phase.kind !== "drawing" && view3.contentState === "ready")
            text("micro-instruction", "");
        }
        $2("micro-surface").setAttribute("aria-label", spec.prompt + " " + spec.keys + (s.kind === "bends" ? "" : " R 重试。"));
        $2("micro-surface").setAttribute("aria-busy", String(view3.contentState === "loading"));
        $2("tiger-tools").hidden = s.flow.kind !== "capture-error";
        $2("tiger-trail-lens").hidden = true;
        $2("tiger-frame-strip").hidden = true;
        captureButton.hidden = s.flow.kind !== "capture-error";
      }
    };
    return { adapter, destroy() {
      bindings.destroy();
      captureButton.remove();
    } };
  }

  // .build/typescript/runtime/aotai-games/takin.js
  var TAKIN_START = { x: 0.43, y: 0.67635 };
  var TAKIN_PLATFORM = [
    { x: 0.09, y: 0.76 },
    { x: 0.29, y: 0.735 },
    { x: 0.44, y: 0.765 },
    { x: 0.45, y: 0.85 },
    { x: 0.38, y: 0.91 },
    { x: 0.13, y: 0.91 },
    { x: 0.07, y: 0.85 }
  ];
  function createEncounter() {
    return { kind: "takin", actor: { ...TAKIN_START }, target: null, phase: { kind: "opening", elapsed: 0 }, stride: 0, moving: false, footsteps: 0, breath: 0 };
  }
  var trailY = (x) => 0.7 - x * 0.055;
  var TRAIL_HALF_WIDTH = 0.037;
  function onPlatform(p2) {
    let inside2 = false;
    for (let i = 0, j = TAKIN_PLATFORM.length - 1; i < TAKIN_PLATFORM.length; j = i++) {
      const a = TAKIN_PLATFORM[i], b = TAKIN_PLATFORM[j];
      if (a.y > p2.y !== b.y > p2.y && p2.x < (b.x - a.x) * (p2.y - a.y) / (b.y - a.y) + a.x)
        inside2 = !inside2;
    }
    return inside2;
  }
  function passageClear(p2, height) {
    const distance4 = Math.abs((p2.y - trailY(p2.x)) * height) / Math.hypot(1, 0.055 * height / 1e3);
    return onPlatform(p2) && distance4 > TRAIL_HALF_WIDTH * height + 27;
  }
  function walkable(p2) {
    return p2.x >= 0.09 && p2.x <= 0.57 && (Math.abs(p2.y - trailY(p2.x)) <= 0.055 || onPlatform(p2) || p2.x >= 0.29 && p2.x <= 0.46 && p2.y >= 0.67 && p2.y <= 0.81);
  }
  function targetEncounter(p2, at2) {
    if (p2.phase.kind === "opening" || p2.phase.kind === "aftermath" || p2.phase.kind === "returning" || p2.phase.kind === "finished" || !walkable(at2))
      return false;
    if ((p2.phase.kind === "yielding" || p2.phase.kind === "adult") && at2.x > p2.actor.x + 0.035)
      return false;
    p2.target = at2;
    return true;
  }
  function encounterAdult(p2) {
    return p2.phase.kind === "opening" ? 0.8 + (1 - Math.min(1, Math.max(0, (p2.phase.elapsed - 4) / 6))) * 0.32 : p2.phase.kind === "yielding" ? 0.8 : p2.phase.kind === "adult" ? 0.8 - p2.phase.progress * 1.04 : -0.24;
  }
  function encounterCalf(p2) {
    return p2.phase.kind === "calf" ? 0.94 - p2.phase.progress * 1.15 : p2.phase.kind === "aftermath" || p2.phase.kind === "returning" || p2.phase.kind === "finished" ? -0.21 : 0.94;
  }
  function tickEncounter(p2, dt, height, reduced2) {
    const wasMoving = p2.moving;
    p2.moving = false;
    if (p2.target) {
      const dx = (p2.target.x - p2.actor.x) * 1e3, dy = (p2.target.y - p2.actor.y) * height, length = Math.hypot(dx, dy), step = Math.min(length, dt * 48);
      if (length > 1) {
        p2.actor.x += dx / length * step / 1e3;
        p2.actor.y += dy / length * step / height;
        p2.moving = true;
        p2.stride += step / 23;
      }
    }
    const clear = passageClear(p2.actor, height), phase = p2.phase, pace = reduced2 ? 1.65 : 1;
    let walking = false;
    switch (phase.kind) {
      case "opening":
        phase.elapsed += dt * pace;
        walking = phase.elapsed > 1 && phase.elapsed < 10;
        if (phase.elapsed >= 10)
          p2.phase = { kind: "yielding", clearFor: 0 };
        break;
      case "yielding":
        phase.clearFor = clear ? phase.clearFor + dt : 0;
        if (phase.clearFor >= 0.8)
          p2.phase = { kind: "adult", progress: 0 };
        break;
      case "adult":
        if (clear) {
          phase.progress = Math.min(1, phase.progress + dt * pace / 17);
          walking = true;
        }
        if (phase.progress >= 1)
          p2.phase = { kind: "calf-reveal", elapsed: 0 };
        break;
      case "calf-reveal":
        phase.elapsed += dt * pace;
        if (phase.elapsed >= 6)
          p2.phase = { kind: "calf", progress: 0 };
        break;
      case "calf":
        if (clear) {
          phase.progress = Math.min(1, phase.progress + dt * pace / 14);
          walking = true;
        }
        if (phase.progress >= 1) {
          p2.target = null;
          p2.phase = { kind: "aftermath", elapsed: 0 };
        }
        break;
      case "aftermath":
        phase.elapsed += dt * pace;
        if (phase.elapsed >= 7)
          p2.phase = { kind: "returning", elapsed: 0, from: { ...p2.actor } };
        break;
      case "returning": {
        phase.elapsed += dt * pace;
        const t = Math.min(1, phase.elapsed / 4), ease2 = t * t * (3 - 2 * t);
        p2.actor = { x: phase.from.x + (TAKIN_START.x - phase.from.x) * ease2, y: phase.from.y + (TAKIN_START.y - phase.from.y) * ease2 };
        p2.moving = t < 1;
        p2.stride += dt * 1.6;
        if (t === 1)
          p2.phase = { kind: "finished" };
        break;
      }
      case "finished":
        break;
    }
    const oldFootsteps = p2.footsteps;
    if (walking)
      p2.footsteps += dt * (phase.kind === "calf" ? 1.55 : 1.1);
    const oldBreath = p2.breath;
    if (!walking && ["yielding", "adult", "calf"].includes(phase.kind))
      p2.breath += dt / 3.8;
    return { complete: p2.phase.kind === "finished", hoof: Math.floor(oldFootsteps) !== Math.floor(p2.footsteps), breath: Math.floor(oldBreath) !== Math.floor(p2.breath), cloth: p2.moving && !wasMoving };
  }

  // .build/typescript/runtime/aotai-games/painterly-art.js
  var PAINTED_PROPS_FILE = "scenes/aotai-painterly-v1/props-atlas.webp";
  var PAINTED_PROPS = {
    "mother": {
      "x": 69,
      "y": 11,
      "width": 781,
      "height": 542
    },
    "calf": {
      "x": 1005,
      "y": 163,
      "width": 491,
      "height": 388
    },
    "tent": {
      "x": 36,
      "y": 555,
      "width": 931,
      "height": 469
    },
    "snowball": {
      "x": 1147,
      "y": 696,
      "width": 269,
      "height": 263
    }
  };

  // .build/typescript/runtime/aotai-games/snowball.js
  var import_matter_js = __toESM(require_matter());
  var SNOW_RADIUS = 26;
  var SNOW_START = { x: 168, y: 352 };
  var SNOW_FLOOR = [
    { x: 95, y: 365 },
    { x: 265, y: 408 },
    { x: 355, y: 442 },
    { x: 455, y: 456 },
    { x: 560, y: 505 },
    { x: 665, y: 530 },
    { x: 754, y: 573 },
    { x: 815, y: 599 },
    { x: 872, y: 592 },
    { x: 915, y: 510 }
  ];
  var SNOW_GOAL = { x: 826, y: 580, radius: 49 };
  var SnowballWorld = class {
    engine = import_matter_js.Engine.create({ gravity: { x: 0, y: 1.05, scale: 1e-3 } });
    ball = import_matter_js.Bodies.circle(SNOW_START.x, SNOW_START.y, SNOW_RADIUS, { friction: 0.075, frictionAir: 9e-3, restitution: 0.08, density: 14e-4 });
    impacts = 0;
    constructor() {
      import_matter_js.Body.setStatic(this.ball, true);
      const ground = SNOW_FLOOR.slice(1).map((b, i) => {
        const a = SNOW_FLOOR[i], angle = Math.atan2(b.y - a.y, b.x - a.x), depth = 36;
        return import_matter_js.Bodies.rectangle((a.x + b.x) / 2 - Math.sin(angle) * depth / 2, (a.y + b.y) / 2 + Math.cos(angle) * depth / 2, Math.hypot(b.x - a.x, b.y - a.y) + 2, depth, { isStatic: true, angle, friction: i > 5 ? 0.3 : 0.08, restitution: 0.04 });
      });
      import_matter_js.Composite.add(this.engine.world, [...ground, this.ball]);
      import_matter_js.Events.on(this.engine, "collisionStart", (event) => {
        if (event.pairs.some((pair) => pair.bodyA === this.ball || pair.bodyB === this.ball))
          this.impacts++;
      });
    }
    get point() {
      return this.ball.position;
    }
    get angle() {
      return this.ball.angle;
    }
    get speed() {
      return this.ball.speed;
    }
    launch(drag) {
      const limit = (n, a, b) => Math.max(a, Math.min(b, n));
      import_matter_js.Body.setStatic(this.ball, false);
      import_matter_js.Body.setVelocity(this.ball, { x: limit(drag.x * 0.045, -5, 8), y: limit(drag.y * 0.025, -5, 3) });
      import_matter_js.Body.setAngularVelocity(this.ball, drag.x * 8e-4);
    }
    tick(dt) {
      for (let left = dt; left > 1e-5; ) {
        const step = Math.min(left, 1 / 60);
        import_matter_js.Engine.update(this.engine, step * 1e3);
        left -= step;
      }
    }
    reset() {
      import_matter_js.Body.setStatic(this.ball, true);
      import_matter_js.Body.setPosition(this.ball, SNOW_START);
      import_matter_js.Body.setAngle(this.ball, 0);
      import_matter_js.Body.setVelocity(this.ball, { x: 0, y: 0 });
      import_matter_js.Body.setAngularVelocity(this.ball, 0);
    }
    dispose() {
      import_matter_js.Events.off(this.engine, "collisionStart");
      import_matter_js.Composite.clear(this.engine.world, false);
      import_matter_js.Engine.clear(this.engine);
    }
  };

  // .build/typescript/runtime/aotai-games/model.js
  var AOTAI_GAMES = {
    "snow-tracks": { kind: "snowball", game: "sling", title: "石海滚雪球", badge: "石海纹理", prompt: "从雪球向右下方轻拖，松手，让它滚进石槽尽头的雪窝。", keys: "方向键调整推送方向，Enter 推出雪球。", memory: "我轻轻推了一团雪，看它沿石槽滚下，碰起一点雪粉，最后稳稳停在雪窝里。石海里也藏着这样的小趣味。", scene: "stone-sea", place: "鳌山 · 冬日石海" },
    "snow-lichen": { kind: "wind", game: "wind", title: "踏风上梁", badge: "秦岭长脊", prompt: "按住小人上山；风强时松手，在岩后歇一下，再继续。", keys: "按住空格或 Enter 前行，松开歇脚。", memory: "飞机梁的风掀起围巾。我在岩后歇了片刻，等风缓下来，再一步步登上山梁，看见更远的秦岭。", scene: "ridge", place: "飞机梁 · 冬日连峰" },
    "aotai-takin-first": { kind: "takin", game: "footsteps", title: "冬林初遇", badge: "秦岭初遇", prompt: "退到宽处，让出山路。", keys: "按住身后地面缓慢退行，松手停下。方向键也可选择下一步，松开停下。", memory: "雪林里，一大一小正要经过。我退到路旁，看小牛慢慢追上母亲。等脚印远去，我也重新背起自己的旅途。", scene: "forest", place: "2800营地 · 冬日林缘" },
    "aotai-camp-night": { kind: "camp", game: "packing", title: "雪夜搭营", badge: "雪夜营灯", prompt: "把两根松开的帐绳拖到地钉处系紧，再点亮帐门里的营灯。", keys: "左右键选帐绳，Enter 抓住，方向键移动，Enter 系紧；再按 Enter 点灯。", memory: "大石河的夜风慢慢吹来。我系紧帐绳，点亮一盏小灯。帐篷稳下来，雪色也有了一点温暖；明早再去看下一道山脊。", scene: "forest", place: "大石河 · 冬夜营地" }
  };
  var aotaiGameId = (id2) => Object.hasOwn(AOTAI_GAMES, id2);
  var AOTAI_IDS = Object.keys(AOTAI_GAMES).filter(aotaiGameId);
  var sceneFile2 = (id2) => `scenes/aotai-painterly-v1/${AOTAI_GAMES[id2].scene === "forest" ? "winter-encounter" : AOTAI_GAMES[id2].scene}.webp`;
  var AotaiState = class {
    id;
    route = "aotai";
    game;
    kind;
    age = 0;
    acted = false;
    dragging = false;
    gesture = "tap";
    done = false;
    x = 0.5;
    y = 0.5;
    portrait = false;
    events = [];
    serial = 0;
    feedback;
    settledAt = null;
    play;
    session;
    constructor(id2, reduced2) {
      this.id = id2;
      const spec = AOTAI_GAMES[id2];
      this.game = spec.game;
      this.kind = spec.kind;
      this.feedback = spec.prompt;
      this.play = { type: "aotai-memory-v2", progress: 0, complete: false, completedAt: null, reduced: reduced2 };
      switch (spec.kind) {
        case "snowball":
          this.session = { kind: "snowball", world: new SnowballWorld(), motion: { kind: "ready" }, aim: { x: 100, y: 28 } };
          break;
        case "wind":
          this.session = { kind: "wind", progress: 0, holding: false, rested: false, stride: 0, gust: 0 };
          break;
        case "takin":
          this.session = createEncounter();
          break;
        case "camp":
          this.session = { kind: "camp", phase: { kind: "ropes", tied: "none", focus: 0, drag: null } };
          break;
      }
    }
  };
  function stateOf2(s) {
    if (!(s instanceof AotaiState))
      throw new Error("鳌太线互动状态不匹配");
    return s;
  }
  var clamp4 = (n, min, max) => Math.max(min, Math.min(max, n));
  var near = (a, b, radius2) => Math.hypot(a.x - b.x, a.y - b.y) <= radius2;
  function layout2(s) {
    const height = s.portrait ? 1240 : 720, offset = s.portrait ? 320 : 0;
    const tentHeight = 470 * PAINTED_PROPS.tent.height / PAINTED_PROPS.tent.width;
    const tent = { x: 310, y: height * (s.portrait ? 0.68 : 0.79) - tentHeight, width: 470, height: tentHeight };
    const pegs = [{ x: 145, y: tent.y + tent.height * 0.94 }, { x: 895, y: tent.y + tent.height * 0.95 }];
    const roots = [{ x: tent.x + tent.width * 0.22, y: tent.y + tent.height * 0.51 }, { x: tent.x + tent.width * 0.81, y: tent.y + tent.height * 0.49 }];
    const loose = [{ x: 315, y: tent.y + tent.height * 0.93 }, { x: 785, y: tent.y + tent.height * 0.98 }];
    const lamp = { x: tent.x + tent.width * 0.44, y: tent.y + tent.height * 0.38 };
    return { width: 1e3, height, snowOffset: offset, tent, pegs, roots, loose, lamp };
  }
  function windPointAt(t, portrait) {
    const height = portrait ? 1240 : 720;
    return { x: 170 + t * 650, y: height * (0.78 - t * 235 / 720 - Math.sin(t * Math.PI) * 25 / 720) };
  }
  function windPoint(s) {
    return windPointAt(s.session.kind === "wind" ? s.session.progress : 0, s.portrait);
  }
  var windStrength = (age) => {
    const phase = age % 5.8;
    return phase < 2.6 ? 0.17 : phase < 4.4 ? 0.88 : 0.3;
  };
  var ropeTied = (p2, index) => p2.kind !== "ropes" || p2.tied === (index === 0 ? "left" : "right");
  function emit3(s, type, x = 0.5, index = 0) {
    s.events.push({ serial: ++s.serial, type, x, index });
    if (s.events.length > 12)
      s.events.shift();
  }
  function settle2(s, feedback) {
    if (s.settledAt !== null)
      return;
    s.settledAt = s.age;
    s.feedback = feedback;
    s.dragging = false;
    s.play.progress = 1;
    emit3(s, "pack-place");
  }
  function launch(s, drag) {
    const p2 = s.session;
    if (p2.kind !== "snowball")
      return;
    if (Math.hypot(drag.x, drag.y) < 24) {
      p2.motion = { kind: "ready" };
      s.feedback = "轻轻向右下方推一下雪球，再松手。";
      return;
    }
    p2.world.launch(drag);
    p2.motion = { kind: "rolling", elapsed: 0, stable: 0, impacts: p2.world.impacts };
    s.acted = true;
    s.gesture = "drag";
    s.feedback = "雪球滚起来了。";
    emit3(s, "sling-release", 0.2);
  }
  function tieRope(s) {
    const p2 = s.session;
    if (p2.kind !== "camp")
      return;
    const phase = p2.phase;
    if (phase.kind !== "ropes")
      return;
    const drag = phase.drag;
    if (!drag)
      return;
    const l = layout2(s);
    if (!near(drag.point, l.pegs[drag.index], 70)) {
      phase.drag = null;
      s.feedback = "把绳头拉到地钉旁，再松手系紧。";
      return;
    }
    s.acted = true;
    s.gesture = "drag";
    emit3(s, "pack-place", drag.index ? 0.85 : 0.15);
    if (phase.tied !== "none") {
      p2.phase = { kind: "lamp", pressed: false };
      s.play.progress = 0.7;
      s.feedback = "帐篷稳下来了，点亮帐门里的营灯。";
    } else {
      phase.tied = drag.index === 0 ? "left" : "right";
      phase.focus = drag.index === 0 ? 1 : 0;
      phase.drag = null;
      s.play.progress = 0.35;
      s.feedback = "一根系好了，再拉紧另一根帐绳。";
    }
  }
  function lightLamp(s) {
    const p2 = s.session;
    if (p2.kind !== "camp" || p2.phase.kind !== "lamp")
      return;
    p2.phase = { kind: "lit", elapsed: 0 };
    emit3(s, "aotai-camp-quiet");
    s.acted = true;
    s.play.progress = 0.9;
    s.feedback = "营灯亮了，夜风慢慢安静下来。";
    emit3(s, "depth-paper");
  }
  function actAotai(s, input) {
    if (s.settledAt !== null || typeof input.x !== "number" || typeof input.y !== "number")
      return s;
    const p2 = s.session, at2 = { x: input.x, y: input.y }, l = layout2(s);
    if (input.phase === "press") {
      switch (p2.kind) {
        case "snowball":
          if (p2.motion.kind === "ready" && near(at2, { x: SNOW_START.x, y: SNOW_START.y + l.snowOffset }, 75)) {
            p2.motion = { kind: "aiming", to: at2 };
            s.dragging = true;
          }
          break;
        case "wind":
          if (near(at2, { x: windPoint(s).x, y: windPoint(s).y - 55 }, 100)) {
            p2.holding = true;
            s.dragging = true;
            s.acted = true;
          }
          break;
        case "takin":
          if (targetEncounter(p2, { x: at2.x / 1e3, y: at2.y / l.height })) {
            s.dragging = true;
            s.acted = true;
            s.gesture = "hold";
          }
          break;
        case "camp":
          if (p2.phase.kind === "ropes") {
            const index = near(at2, l.loose[0], 72) ? 0 : near(at2, l.loose[1], 72) ? 1 : null;
            if (index !== null && !ropeTied(p2.phase, index)) {
              p2.phase.drag = { index, point: at2 };
              p2.phase.focus = index;
              s.dragging = true;
            }
          } else if (p2.phase.kind === "lamp")
            p2.phase.pressed = near(at2, l.lamp, 76);
          break;
      }
    } else if (input.phase === "release") {
      switch (p2.kind) {
        case "snowball":
          if (p2.motion.kind === "aiming")
            launch(s, { x: at2.x - SNOW_START.x, y: at2.y - l.snowOffset - SNOW_START.y });
          break;
        case "wind":
          p2.holding = false;
          break;
        case "takin":
          p2.target = null;
          break;
        case "camp":
          if (p2.phase.kind === "ropes" && p2.phase.drag) {
            p2.phase.drag.point = at2;
            tieRope(s);
          } else if (p2.phase.kind === "lamp" && p2.phase.pressed && near(at2, l.lamp, 76))
            lightLamp(s);
          break;
      }
      s.dragging = false;
    }
    return s;
  }
  function moveAotai(s, input) {
    if (s.settledAt !== null || typeof input.x !== "number" || typeof input.y !== "number")
      return s;
    const p2 = s.session;
    if (p2.kind === "snowball" && p2.motion.kind === "aiming")
      p2.motion.to = { x: input.x, y: input.y };
    else if (p2.kind === "takin" && s.dragging)
      targetEncounter(p2, { x: input.x / 1e3, y: input.y / layout2(s).height });
    else if (p2.kind === "camp" && p2.phase.kind === "ropes" && p2.phase.drag)
      p2.phase.drag.point = { x: input.x, y: input.y };
    return s;
  }
  function releaseAotai(s) {
    s.dragging = false;
    const p2 = s.session;
    if (p2.kind === "snowball" && p2.motion.kind === "aiming")
      p2.motion = { kind: "ready" };
    else if (p2.kind === "wind")
      p2.holding = false;
    else if (p2.kind === "takin")
      p2.target = null;
    else if (p2.kind === "camp") {
      if (p2.phase.kind === "ropes")
        p2.phase.drag = null;
      if (p2.phase.kind === "lamp")
        p2.phase.pressed = false;
    }
    return s;
  }
  function tickAotai(s, dt) {
    if (dt <= 0 || !Number.isFinite(dt))
      return s;
    s.age += dt;
    const p2 = s.session;
    if (s.settledAt === null)
      switch (p2.kind) {
        case "snowball":
          if (p2.motion.kind === "rolling") {
            p2.world.tick(dt);
            p2.motion.elapsed += dt;
            if (p2.world.impacts !== p2.motion.impacts) {
              p2.motion.impacts = p2.world.impacts;
              emit3(s, "altar-place", p2.world.point.x / 1e3);
            }
            const ball = p2.world.point;
            s.play.progress = clamp4((ball.x - SNOW_START.x) / (SNOW_GOAL.x - SNOW_START.x), 0, 0.94);
            if (near(ball, SNOW_GOAL, 49) && p2.world.speed < 1.7)
              p2.motion.stable += dt;
            else
              p2.motion.stable = 0;
            if (p2.motion.stable > 0.6)
              settle2(s, "雪球停在雪窝里，石海也安静下来。");
            else if (ball.y > 900 || ball.x < 20 || ball.x > 1010 || p2.motion.elapsed > 12) {
              p2.motion = { kind: "retry", elapsed: 0 };
              s.feedback = "再轻推一次，让雪球顺着石槽走。";
            }
          } else if (p2.motion.kind === "retry") {
            p2.motion.elapsed += dt;
            if (p2.motion.elapsed > 1) {
              p2.world.reset();
              p2.motion = { kind: "ready" };
              s.play.progress = 0;
            }
          }
          break;
        case "wind": {
          const gust = windStrength(s.age);
          if (p2.gust <= 0.6 && gust > 0.6)
            emit3(s, "aotai-gust");
          p2.gust = gust;
          if (!p2.holding && p2.progress >= 0.34 && p2.progress <= 0.5 && p2.gust > 0.6) {
            p2.rested = true;
            s.feedback = "在岩后歇一下，风缓了再按住小人出发。";
          }
          if (p2.holding) {
            const speed = p2.gust > 0.6 ? 0.018 : 0.15, next = Math.min(p2.rested ? 1 : 0.48, p2.progress + speed * dt);
            p2.stride += (next - p2.progress) * 17;
            p2.progress = next;
            s.feedback = p2.gust > 0.6 ? "风强了，松手在岩后歇一下。" : "一步一步，远山正在展开。";
            if (p2.progress >= 0.48 && !p2.rested)
              s.feedback = "松开，在岩后歇一下，等风缓下来。";
          }
          s.play.progress = p2.progress;
          if (p2.progress >= 1 && p2.rested && s.acted) {
            p2.holding = false;
            settle2(s, "登上山梁，秦岭在眼前展开。");
          }
          break;
        }
        case "takin": {
          const result = tickEncounter(p2, dt, layout2(s).height, s.play.reduced);
          if (result.hoof)
            emit3(s, "aotai-hoof", p2.phase.kind === "calf" ? 0.94 - p2.phase.progress : 0.8, Math.floor(p2.footsteps));
          if (result.breath)
            emit3(s, "aotai-breath", 0.72);
          if (result.cloth)
            emit3(s, "aotai-cloth", p2.actor.x);
          const phase = p2.phase;
          s.play.progress = phase.kind === "opening" ? 0.02 : phase.kind === "yielding" ? 0.08 : phase.kind === "adult" ? 0.15 + phase.progress * 0.3 : phase.kind === "calf-reveal" ? 0.5 : phase.kind === "calf" ? 0.55 + phase.progress * 0.3 : 0.9;
          s.feedback = phase.kind === "opening" ? "风雪里，传来沉重的踩雪声。" : phase.kind === "yielding" || phase.kind === "adult" ? passageClear(p2.actor, layout2(s).height) ? "停在宽处，等它经过。" : p2.actor.x < 0.36 ? "再向平台里面退一点，主路还没让开。" : AOTAI_GAMES[s.id].prompt : phase.kind === "calf-reveal" || phase.kind === "calf" ? "雪幕里还有一组脚步，继续留在宽处。" : "脚步声远了，雪地上留下交错的足迹。";
          if (result.complete && s.acted)
            settle2(s, "山路重新安静下来，把这次相遇留在手帐。");
          break;
        }
        case "camp":
          if (p2.phase.kind === "lit") {
            p2.phase.elapsed += dt;
            if (p2.phase.elapsed >= (s.play.reduced ? 1 : 2.5))
              settle2(s, "帐绳系稳，营灯亮起。把这一夜的温暖收进手帐。");
          }
          break;
      }
    if (s.settledAt !== null && s.age - s.settledAt >= (s.play.reduced ? 0.7 : 2)) {
      s.play.complete = true;
      s.play.completedAt = s.age;
      s.done = true;
    }
    return s;
  }
  function keyAotai(s, key, phase) {
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Enter", " "].includes(key))
      return null;
    const p2 = s.session, confirm = key === "Enter" || key === " ", left = key === "ArrowLeft", right = key === "ArrowRight", up = key === "ArrowUp", down = key === "ArrowDown";
    if (phase === "up") {
      if (p2.kind === "wind" && confirm)
        p2.holding = false;
      if (p2.kind === "takin")
        p2.target = null;
      return s;
    }
    if (s.settledAt !== null)
      return s;
    switch (p2.kind) {
      case "snowball":
        if (p2.motion.kind === "ready") {
          p2.aim.x = clamp4(p2.aim.x + (right ? 20 : left ? -20 : 0), -100, 170);
          p2.aim.y = clamp4(p2.aim.y + (down ? 20 : up ? -20 : 0), -120, 100);
          if (confirm)
            launch(s, p2.aim);
        }
        break;
      case "wind":
        if (confirm) {
          p2.holding = true;
          s.acted = true;
        }
        break;
      case "takin":
        if (!confirm && targetEncounter(p2, { x: p2.actor.x + (left ? -0.12 : right ? 0.12 : 0), y: p2.actor.y + (up ? -0.12 : down ? 0.12 : 0) })) {
          s.acted = true;
          s.gesture = "hold";
        }
        break;
      case "camp":
        if (p2.phase.kind === "ropes") {
          const phase2 = p2.phase, l = layout2(s);
          if (phase2.drag) {
            phase2.drag.point.x += left ? -48 : right ? 48 : 0;
            phase2.drag.point.y += up ? -48 : down ? 48 : 0;
            if (confirm)
              tieRope(s);
          } else if (confirm) {
            if (!ropeTied(phase2, phase2.focus))
              phase2.drag = { index: phase2.focus, point: { ...l.loose[phase2.focus] } };
          } else if (left || right)
            phase2.focus = right ? 1 : 0;
        } else if (p2.phase.kind === "lamp" && confirm)
          lightLamp(s);
        break;
    }
    return s;
  }

  // .build/typescript/runtime/aotai-games/watercolor.js
  var grain = (i) => {
    const n = Math.sin(i * 127.1 + 311.7) * 43758.5453;
    return n - Math.floor(n);
  };
  function paperLayer(doc) {
    const canvas = doc.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");
    if (!ctx)
      return canvas;
    for (let i = 0; i < 5100; i++) {
      const value = i % 3 ? "#716853" : "#fff8df";
      ctx.globalAlpha = 0.025 + grain(i + 13) * 0.04;
      ctx.fillStyle = value;
      ctx.fillRect(grain(i) * 256, grain(i + 7) * 256, 0.6 + grain(i + 9) * 1.5, 0.4 + grain(i + 11) * 0.7);
    }
    ctx.lineWidth = 0.45;
    ctx.strokeStyle = "#978b6a";
    ctx.globalAlpha = 0.045;
    for (let i = 0; i < 70; i++) {
      const x = grain(i + 40) * 256, y = grain(i + 61) * 256;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + grain(i + 20) * 5, y + 1);
      ctx.stroke();
    }
    return canvas;
  }
  function snowContact(ctx, at2, width, depth = 7) {
    ctx.save();
    ctx.translate(at2.x, at2.y);
    ctx.fillStyle = "#70858a";
    for (let i = 0; i < 5; i++) {
      ctx.globalAlpha = 0.025 + i * 7e-3;
      ctx.beginPath();
      ctx.ellipse((grain(i + 7) - 0.5) * width * 0.12, 1 + i * 0.2, width * (0.42 - i * 0.035), depth * (0.8 - i * 0.09), -0.035, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.strokeStyle = "#f9f3e1";
    ctx.globalAlpha = 0.65;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-width * 0.3, depth * 0.3);
    ctx.quadraticCurveTo(0, depth * 0.7, width * 0.31, depth * 0.2);
    ctx.stroke();
    ctx.restore();
  }
  function snowMark(ctx, at2, size, angle, hoof = false) {
    ctx.save();
    ctx.translate(at2.x, at2.y);
    ctx.rotate(angle);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#718b8b";
    ctx.lineWidth = hoof ? size * 0.42 : size * 0.7;
    ctx.globalAlpha = 0.27;
    for (const x of hoof ? [-size * 0.32, size * 0.32] : [0]) {
      ctx.beginPath();
      ctx.moveTo(x - size * 0.1, -size * 0.48);
      ctx.quadraticCurveTo(x - size * 0.28, 0, x + size * 0.04, size * 0.48);
      ctx.stroke();
    }
    ctx.globalAlpha = 0.4;
    ctx.lineWidth = 0.8;
    ctx.strokeStyle = "#fff9e9";
    ctx.beginPath();
    ctx.moveTo(-size * 0.65, size * 0.6);
    ctx.quadraticCurveTo(0, size * 0.9, size * 0.6, size * 0.5);
    ctx.stroke();
    ctx.restore();
  }
  function washPaper(ctx, texture, rect) {
    const pattern = ctx.createPattern(texture, "repeat");
    if (!pattern)
      return;
    ctx.save();
    ctx.globalCompositeOperation = "multiply";
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = pattern;
    ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
    ctx.restore();
  }

  // .build/typescript/runtime/aotai-games/view.js
  var noise = (i) => {
    const n = Math.sin(i * 127.1 + 311.7) * 43758.5453;
    return n - Math.floor(n);
  };
  function cover(ctx, image, r, ground) {
    const scale = Math.max(r.width / image.naturalWidth, r.height / image.naturalHeight), w = image.naturalWidth * scale, h = image.naturalHeight * scale;
    const y = ground === void 0 ? r.y + (r.height - h) / 2 : Math.min(r.y, Math.max(r.y + r.height - h, ground - h * 0.64));
    ctx.drawImage(image, r.x + (r.width - w) / 2, y, w, h);
  }
  function line(ctx, points) {
    ctx.beginPath();
    points.forEach((p2, i) => i ? ctx.lineTo(p2.x, p2.y) : ctx.moveTo(p2.x, p2.y));
  }
  function arrow(ctx, a, b, alpha = 0.7) {
    const angle = Math.atan2(b.y - a.y, b.x - a.x);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = "#5e7774";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.quadraticCurveTo((a.x + b.x) / 2 + 2, (a.y + b.y) / 2 - 3, b.x, b.y);
    ctx.stroke();
    line(ctx, [{ x: b.x - Math.cos(angle - 0.5) * 15, y: b.y - Math.sin(angle - 0.5) * 15 }, b, { x: b.x - Math.cos(angle + 0.5) * 15, y: b.y - Math.sin(angle + 0.5) * 15 }]);
    ctx.stroke();
    ctx.restore();
  }
  var AotaiGameView = class {
    id;
    doc;
    directInput = true;
    canvas;
    contentState = "loading";
    disposed = false;
    pending = new AbortController();
    observer = null;
    host = null;
    state = null;
    scene = null;
    props = null;
    actor = null;
    actions = null;
    stone = null;
    paper;
    slope = null;
    portrait = false;
    scale = 1;
    dx = 0;
    dy = 0;
    viewport = { x: 0, y: 0, width: 1e3, height: 720 };
    character;
    constructor(id2, doc) {
      this.id = id2;
      this.doc = doc;
      this.canvas = doc.createElement("canvas");
      this.canvas.className = "aotai-game-canvas";
      this.canvas.setAttribute("aria-hidden", "true");
      this.paper = paperLayer(doc);
      this.character = characterId(new URLSearchParams(doc.defaultView?.location.search).get("character")) ?? readCharacterId();
    }
    resize() {
      if (!this.host || this.disposed)
        return;
      const rect = this.host.getBoundingClientRect(), dpr = Math.min(2, devicePixelRatio || 1, Math.sqrt(28e5 / Math.max(1, rect.width * rect.height)));
      this.portrait = rect.height > rect.width;
      this.canvas.width = Math.max(1, Math.round(rect.width * dpr));
      this.canvas.height = Math.max(1, Math.round(rect.height * dpr));
      const height = this.portrait ? 1240 : 720;
      this.scale = Math.min(this.canvas.width / 1e3, this.canvas.height / height);
      this.dx = (this.canvas.width - 1e3 * this.scale) / 2;
      this.dy = (this.canvas.height - height * this.scale) / 2;
      this.viewport = { x: -this.dx / this.scale, y: -this.dy / this.scale, width: this.canvas.width / this.scale, height: this.canvas.height / this.scale };
      if (this.state)
        this.paint(this.state);
    }
    async mount(host, cache2) {
      this.host = host;
      host.append(this.canvas);
      this.resize();
      this.observer = new ResizeObserver(() => this.resize());
      this.observer.observe(host);
      const { signal } = this.pending;
      const load = (file) => new Promise((resolve, reject) => {
        const entry = cache2?.request(file, "high");
        let image = null;
        const clean = () => {
          signal.removeEventListener("abort", abort);
          if (image)
            image.onload = image.onerror = null;
        };
        const abort = () => {
          clean();
          reject(new DOMException("画作已收起", "AbortError"));
        };
        if (signal.aborted) {
          abort();
          return;
        }
        signal.addEventListener("abort", abort, { once: true });
        if (entry)
          void entry.promise.then((item) => {
            if (signal.aborted)
              return;
            clean();
            if (item.state === "ready")
              resolve(item.image);
            else
              reject(new Error("画作暂未展开"));
          });
        else {
          image = new Image();
          image.decoding = "async";
          image.onload = () => {
            if (!image)
              return;
            clean();
            resolve(image);
          };
          image.onerror = () => {
            clean();
            reject(new Error("画作暂未展开"));
          };
          image.src = file;
        }
      });
      try {
        const appearance = CHARACTERS[this.character];
        const [scene, props, actor, actions, slope] = await Promise.all([
          load(sceneFile2(this.id)),
          this.id !== "snow-lichen" ? load(PAINTED_PROPS_FILE) : Promise.resolve(null),
          load(appearance.walk.file),
          this.id === "aotai-camp-night" ? load(appearance.actions.file) : Promise.resolve(null),
          this.id === "snow-lichen" ? load("scenes/aotai-painterly-v1/winter-slope.webp") : Promise.resolve(null)
        ]);
        if (this.disposed || signal.aborted)
          return;
        this.scene = scene;
        this.props = props;
        this.actor = actor;
        this.actions = actions;
        this.slope = slope ? this.foregroundLayer(slope) : null;
        this.stone = this.id === "snow-tracks" ? this.foregroundLayer(scene, true) : null;
        this.contentState = "ready";
        host.setAttribute("aria-busy", "false");
        if (this.state)
          this.paint(this.state);
      } catch {
        if (!this.disposed && !signal.aborted) {
          this.contentState = "error";
          host.setAttribute("aria-busy", "false");
          if (this.state)
            this.paint(this.state);
        }
      }
    }
    input(input) {
      return { ...input, x: typeof input.x === "number" ? (input.x * this.canvas.width - this.dx) / this.scale : void 0, y: typeof input.y === "number" ? (input.y * this.canvas.height - this.dy) / this.scale : void 0 };
    }
    foregroundLayer(image, stone = false) {
      const canvas = this.doc.createElement("canvas");
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx)
        throw new Error("山坡画层无法展开");
      ctx.drawImage(image, 0, 0);
      ctx.globalCompositeOperation = "destination-in";
      const edge = ctx.createLinearGradient(0, 0, canvas.width, 0);
      edge.addColorStop(0, "transparent");
      edge.addColorStop(0.1, "#fff");
      edge.addColorStop(0.88, "#fff");
      edge.addColorStop(1, "transparent");
      ctx.fillStyle = edge;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      if (stone) {
        const top = ctx.createLinearGradient(0, 0, 0, canvas.height);
        top.addColorStop(0, "transparent");
        top.addColorStop(0.28, "transparent");
        top.addColorStop(0.49, "#fff");
        top.addColorStop(0.78, "#fff");
        top.addColorStop(1, "transparent");
        ctx.fillStyle = top;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      return canvas;
    }
    characterAt(ctx, at2, height, frame2 = 2, pose = false, lean = 0) {
      const appearance = CHARACTERS[this.character], image = pose ? this.actions : this.actor;
      if (!image)
        return;
      const frames = pose ? appearance.actions.frames : appearance.walk.frames, spec = frames[frame2 % frames.length], base = frames[0];
      const scale = height / (base.height * base.scale) * spec.scale;
      snowContact(ctx, at2, height * 0.43, height * 0.035);
      ctx.save();
      ctx.translate(at2.x, at2.y);
      ctx.rotate(lean);
      ctx.filter = "saturate(.88) contrast(.96)";
      ctx.drawImage(image, spec.x, spec.y, spec.width, spec.height, -spec.footX * scale, -spec.footY * scale, spec.width * scale, spec.height * scale);
      ctx.restore();
    }
    snow(ctx, s, strength) {
      if (s.play.reduced)
        return;
      const v = this.viewport, l = layout2(s);
      for (let i = 0; i < 28; i++) {
        const t = (noise(i + 31) + s.age * (0.025 + strength * 0.03)) % 1, x = v.x + (noise(i + 5) * v.width + s.age * strength * 40) % v.width, y = v.y + t * v.height;
        ctx.fillStyle = `rgba(249,249,237,${0.32 + strength * 0.18})`;
        ctx.beginPath();
        ctx.ellipse(x, y, 1.3, 1.8, -0.4, 0, Math.PI * 2);
        ctx.fill();
      }
      if (strength > 0.65) {
        ctx.strokeStyle = "#eff3e4";
        ctx.lineWidth = 1.3;
        ctx.globalAlpha = 0.36;
        for (let i = 0; i < 12; i++) {
          const y = l.height * 0.25 + noise(i + 60) * l.height * 0.48, x = (noise(i + 45) * 1200 + s.age * 120) % 1300 - 160;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.quadraticCurveTo(x + 60, y - 12, x + 120, y - 8);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
      }
    }
    snowball(ctx, s) {
      const p2 = s.session;
      if (p2.kind !== "snowball")
        return;
      const l = layout2(s), points = SNOW_FLOOR.map((p3) => ({ x: p3.x, y: p3.y + l.snowOffset }));
      ctx.save();
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      if (this.stone)
        ctx.drawImage(this.stone, 0, l.snowOffset, 1e3, 720);
      const gx = SNOW_GOAL.x, gy = SNOW_GOAL.y + l.snowOffset;
      snowContact(ctx, { x: gx, y: gy + 13 }, 87, 11);
      ctx.strokeStyle = "#fcf5e1ba";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(gx - 38, gy + 17);
      ctx.bezierCurveTo(gx - 18, gy + 30, gx + 22, gy + 25, gx + 43, gy + 8);
      ctx.stroke();
      ctx.fillStyle = "#647779";
      ctx.font = '20px "Kaiti SC","STKaiti",serif';
      ctx.textAlign = "center";
      ctx.fillText("雪窝", gx + 12, gy + 59);
      const ball = p2.world.point, by = ball.y + l.snowOffset;
      snowContact(ctx, { x: ball.x, y: by + SNOW_RADIUS - 2 }, SNOW_RADIUS * 1.7, 4);
      if (this.props) {
        const f = PAINTED_PROPS.snowball;
        ctx.save();
        ctx.translate(ball.x, by);
        ctx.rotate(p2.world.angle);
        ctx.drawImage(this.props, f.x, f.y, f.width, f.height, -SNOW_RADIUS, -SNOW_RADIUS, SNOW_RADIUS * 2, SNOW_RADIUS * 2);
        ctx.restore();
      }
      if (p2.motion.kind === "ready")
        arrow(ctx, { x: SNOW_START.x + 38, y: SNOW_START.y + l.snowOffset - 42 }, { x: SNOW_START.x + 102, y: SNOW_START.y + l.snowOffset - 12 }, 0.65);
      if (p2.motion.kind === "aiming")
        arrow(ctx, { x: SNOW_START.x, y: SNOW_START.y + l.snowOffset }, p2.motion.to);
      if (p2.motion.kind === "rolling" && p2.world.speed > 1.5 && !s.play.reduced)
        for (let i = 0; i < 7; i++) {
          ctx.fillStyle = "#f4f5e7a6";
          ctx.beginPath();
          ctx.arc(ball.x - 18 - noise(i + s.age) * 36, by + 12 - noise(i + 5) * 12, 1.4, 0, Math.PI * 2);
          ctx.fill();
        }
      this.characterAt(ctx, { x: 100, y: points[0].y + 10 }, s.portrait ? 135 : 105);
      ctx.restore();
    }
    wind(ctx, s) {
      const p2 = s.session;
      if (p2.kind !== "wind")
        return;
      const l = layout2(s);
      ctx.save();
      if (this.slope)
        ctx.drawImage(this.slope, 0, 0, 1e3, l.height);
      for (let i = 0; i < Math.floor(p2.progress * 25); i++) {
        const at2 = windPointAt(i / 25, s.portrait);
        snowMark(ctx, { x: at2.x + (i % 2 ? 4 : -4), y: at2.y + 5 }, 6, -0.32);
      }
      this.characterAt(ctx, windPoint(s), s.portrait ? 145 : 110, p2.holding ? Math.floor(p2.stride * 8) % 8 : 2, false, p2.holding ? 0.035 + p2.gust * 0.045 : -0.025);
      this.snow(ctx, s, p2.gust);
      ctx.restore();
    }
    animal(ctx, frame2, x, footY, height, gait, faceLeft = false) {
      if (!this.props)
        return;
      const scale = height / frame2.height;
      snowContact(ctx, { x, y: footY }, frame2.width * scale * 0.64, 7);
      ctx.save();
      if (faceLeft) {
        ctx.beginPath();
        ctx.rect(-400, -300, 1372, 2100);
        ctx.clip();
      }
      ctx.translate(x, footY);
      if (faceLeft)
        ctx.scale(-1, 1);
      ctx.rotate(Math.sin(gait) * 7e-3);
      ctx.drawImage(this.props, frame2.x, frame2.y, frame2.width, frame2.height, -frame2.width * scale / 2, -height, frame2.width * scale, height);
      ctx.restore();
    }
    takin(ctx, s) {
      const p2 = s.session;
      if (p2.kind !== "takin")
        return;
      const l = layout2(s), phase = p2.phase, clear = passageClear(p2.actor, l.height);
      ctx.save();
      for (let i = 0; i < 32; i++) {
        const x = 110 + noise(i + 91) * 330, y = l.height * (0.75 + noise(i + 112) * 0.14);
        ctx.fillStyle = "#f9f6e720";
        ctx.beginPath();
        ctx.ellipse(x, y, 2 + noise(i) * 4, 1.3, -0.2, 0, Math.PI * 2);
        ctx.fill();
      }
      const adultX = encounterAdult(p2), calfX = encounterCalf(p2), adultProgress = Math.max(0, (0.8 - adultX) / 1.04), calfProgress = Math.max(0, (0.94 - calfX) / 1.15);
      for (let animal = 0; animal < 2; animal++)
        for (let i = 0; i < Math.floor((animal ? calfProgress : adultProgress) * 27); i++) {
          const x = (animal ? 0.94 : 0.8) * 1e3 - i * 40, y = trailY(x / 1e3) * l.height;
          for (const side of [-1, 1])
            snowMark(ctx, { x: x + side * 5, y: y + side * 7 }, animal ? 4 : 6, -0.17, true);
        }
      const adultWalking = phase.kind === "opening" || phase.kind === "adult" && clear;
      const calfWalking = phase.kind === "calf" && clear;
      const mh = s.portrait ? 235 : 205, ch = mh * 0.53;
      if (!["aftermath", "returning", "finished"].includes(phase.kind)) {
        ctx.save();
        ctx.globalAlpha = phase.kind === "calf" ? 1 : phase.kind === "calf-reveal" ? 0.2 + Math.min(1, phase.elapsed / 6) * 0.8 : 0.13;
        this.animal(ctx, PAINTED_PROPS.calf, calfX * 1e3, trailY(calfX) * l.height + 2, ch, calfWalking && !s.play.reduced ? p2.footsteps * Math.PI : 0, true);
        ctx.restore();
      }
      if (adultX > -0.21)
        this.animal(ctx, PAINTED_PROPS.mother, adultX * 1e3, trailY(adultX) * l.height, mh, adultWalking && !s.play.reduced ? p2.footsteps * Math.PI : 0, true);
      if (phase.kind === "opening" || phase.kind === "calf-reveal") {
        ctx.fillStyle = "#e4e9df38";
        ctx.beginPath();
        ctx.ellipse(970, l.height * 0.61, 70, 55, -0.1, 0, Math.PI * 2);
        ctx.fill();
      }
      const actor = { x: p2.actor.x * 1e3, y: p2.actor.y * l.height };
      this.characterAt(ctx, actor, s.portrait ? 112 : 90, p2.moving ? Math.floor(p2.stride * 4) % 8 : 2);
      if ((phase.kind === "yielding" || phase.kind === "adult" || phase.kind === "calf") && !clear && !s.play.reduced) {
        const x = (phase.kind === "calf" ? calfX : adultX) * 1e3, y = trailY(x / 1e3) * l.height;
        ctx.strokeStyle = "#f7f3e150";
        ctx.lineWidth = 2;
        ctx.beginPath();
        const by = y - (phase.kind === "calf" ? 45 : 92);
        ctx.moveTo(x - 77, by);
        ctx.bezierCurveTo(x - 84, by - 5, x - 89, by + Math.sin(s.age * 1.6) * 3, x - 97, by - 2);
        ctx.stroke();
      }
      this.snow(ctx, s, phase.kind === "opening" ? 0.6 - Math.min(1, phase.elapsed / 10) * 0.4 : 0.18);
      ctx.restore();
    }
    camp(ctx, s) {
      const p2 = s.session;
      if (p2.kind !== "camp" || !this.props)
        return;
      const l = layout2(s), phase = p2.phase, t = l.tent;
      const lit = phase.kind === "lit" ? Math.min(1, phase.elapsed / 1.7) : 0;
      ctx.fillStyle = `rgba(14,30,56,${0.66 + lit * 0.06})`;
      ctx.fillRect(this.viewport.x, this.viewport.y, this.viewport.width, this.viewport.height);
      snowContact(ctx, { x: t.x + t.width / 2, y: t.y + t.height * 0.97 }, t.width * 0.94, 17);
      const drift = s.play.reduced ? 0 : Math.sin(s.age * 4.6) * (phase.kind === "ropes" ? phase.tied === "none" ? 4 : 2 : 0.25);
      ctx.save();
      ctx.filter = `brightness(${0.62 + lit * 0.22}) saturate(.8)`;
      const tentArt = PAINTED_PROPS.tent;
      for (let row = 0; row < 8; row++) {
        const sy = row / 8 * tentArt.height, sh = tentArt.height / 8;
        ctx.drawImage(this.props, tentArt.x, tentArt.y + sy, tentArt.width, Math.min(sh + 1, tentArt.height - sy), t.x + drift * (1 - row / 8), t.y + row / 8 * t.height, t.width, t.height / 8 + 1);
      }
      ctx.restore();
      for (const index of [0, 1]) {
        const tied = ropeTied(phase, index), root = l.roots[index], peg = l.pegs[index], end = tied ? peg : phase.kind === "ropes" && phase.drag?.index === index ? phase.drag.point : l.loose[index];
        ctx.strokeStyle = "#e6dec1";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(root.x + drift * 0.45, root.y);
        ctx.quadraticCurveTo((root.x + end.x) / 2, (root.y + end.y) / 2 + (tied ? 0 : 26 + Math.sin(s.age * 5 + index) * 6), end.x, end.y);
        ctx.stroke();
        ctx.strokeStyle = "#c1c9b1";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(peg.x - 3, peg.y + 9);
        ctx.lineTo(peg.x + 4, peg.y - 11);
        ctx.lineTo(peg.x + 13, peg.y - 10);
        ctx.stroke();
        if (!tied) {
          ctx.strokeStyle = "#f6efdc";
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(end.x, end.y, 13, 0, Math.PI * 2);
          ctx.stroke();
          if (phase.kind === "ropes" && (phase.focus === index || phase.drag?.index === index))
            arrow(ctx, { x: end.x + (index ? 19 : -19), y: end.y - 10 }, { x: peg.x, y: peg.y - 16 }, 0.55);
        }
      }
      if (phase.kind === "lamp" && !s.play.reduced) {
        const r = 21 + Math.sin(s.age * 2) * 2;
        ctx.strokeStyle = "#eee6ce";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(l.lamp.x - r * 0.8, l.lamp.y + 20);
        ctx.quadraticCurveTo(l.lamp.x, l.lamp.y + 24, l.lamp.x + r * 0.7, l.lamp.y + 20);
        ctx.stroke();
      }
      if (lit > 0) {
        const glow = ctx.createRadialGradient(l.lamp.x, l.lamp.y, 2, l.lamp.x, l.lamp.y, 155);
        glow.addColorStop(0, `rgba(255,214,128,${lit * 0.8})`);
        glow.addColorStop(0.27, `rgba(238,179,84,${lit * 0.37})`);
        glow.addColorStop(1, "rgba(233,181,95,0)");
        ctx.fillStyle = glow;
        ctx.fillRect(l.lamp.x - 160, l.lamp.y - 160, 320, 320);
        ctx.fillStyle = `rgba(255,230,161,${lit})`;
        ctx.beginPath();
        ctx.ellipse(l.lamp.x, l.lamp.y + 5, 7, 11, 0, 0, Math.PI * 2);
        ctx.fill();
        for (let i = 0; i < 25; i++) {
          ctx.fillStyle = `rgba(249,239,202,${lit * 0.6})`;
          ctx.beginPath();
          ctx.arc(noise(i + 71) * 1e3, noise(i + 49) * l.height * 0.3, i % 5 ? 1 : 1.6, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      this.characterAt(ctx, { x: 260, y: t.y + t.height + 18 }, s.portrait ? 140 : 110, lit > 0.5 ? 2 : 0, true);
      this.snow(ctx, s, phase.kind === "ropes" ? 0.75 : 0.2);
    }
    paint(s) {
      if (this.disposed)
        return;
      this.state = s;
      s.portrait = this.portrait;
      const ctx = this.canvas.getContext("2d");
      if (!ctx)
        return;
      const l = layout2(s), scene = this.scene, v = this.viewport;
      ctx.setTransform(this.scale, 0, 0, this.scale, this.dx, this.dy);
      ctx.clearRect(v.x, v.y, v.width, v.height);
      ctx.fillStyle = "#e8ecdf";
      ctx.fillRect(v.x, v.y, v.width, v.height);
      if (this.contentState !== "ready" || !scene) {
        ctx.font = '24px "PingFang SC",sans-serif';
        ctx.textAlign = "center";
        ctx.fillStyle = "#64786e";
        ctx.fillText(this.contentState === "error" ? "画作暂未展开，可以重试或继续山路。" : "山间画作正在展开……", 500, l.height / 2);
        return;
      }
      const camera = s.session.kind === "takin" && !s.play.reduced ? 1 + Math.max(0, 1 - s.age / 10) * 0.075 : 1;
      ctx.save();
      ctx.translate(500, l.height * 0.7);
      ctx.scale(camera, camera);
      ctx.translate(-500, -l.height * 0.7);
      const progress = s.session.kind === "wind" ? s.session.progress : 0;
      ctx.save();
      const zoom = 1 + progress * 0.09;
      ctx.translate(-progress * 28, progress * 20);
      cover(ctx, scene, { x: v.x, y: v.y - progress * 65, width: v.width * zoom, height: v.height * zoom }, s.session.kind === "takin" || s.session.kind === "camp" ? l.height * 0.67 : void 0);
      ctx.restore();
      switch (s.session.kind) {
        case "snowball":
          this.snowball(ctx, s);
          break;
        case "wind":
          this.wind(ctx, s);
          break;
        case "takin":
          this.takin(ctx, s);
          break;
        case "camp":
          this.camp(ctx, s);
          break;
      }
      ctx.restore();
      washPaper(ctx, this.paper, v);
      if (s.settledAt !== null) {
        const t = Math.min(1, (s.age - s.settledAt) / 1.6);
        ctx.fillStyle = `rgba(247,241,221,${t * 0.12})`;
        ctx.fillRect(v.x, v.y, v.width, v.height);
      }
    }
    dispose() {
      if (this.disposed)
        return;
      this.disposed = true;
      this.pending.abort();
      this.observer?.disconnect();
      this.canvas.remove();
      if (this.state?.session.kind === "snowball")
        this.state.session.world.dispose();
      this.host = null;
      this.state = null;
      this.scene = this.props = this.actor = this.actions = null;
      this.slope = this.stone = null;
    }
  };
  function viewOf2(refs) {
    if (!(refs instanceof AotaiGameView))
      throw new Error("鳌太线画面不存在");
    return refs;
  }

  // .build/typescript/runtime/aotai-games/adapter.js
  function createAotaiGames(dom2) {
    const { get: $2, text } = dom2;
    return {
      create(entry, options) {
        if (!aotaiGameId(entry.id))
          throw new Error("鳌太线画作不存在");
        return new AotaiState(entry.id, options.reduced);
      },
      act: (s, input) => actAotai(stateOf2(s), input),
      move: (s, input) => moveAotai(stateOf2(s), input),
      release: (s) => releaseAotai(stateOf2(s)),
      tick: (s, dt) => tickAotai(stateOf2(s), dt),
      draw(_svg, _parent, entry) {
        if (!aotaiGameId(entry.id))
          throw new Error("鳌太线画作不存在");
        return new AotaiGameView(entry.id, dom2.document);
      },
      paint: (refs, s) => viewOf2(refs).paint(stateOf2(s)),
      instruction: (entry) => aotaiGameId(entry.id) ? AOTAI_GAMES[entry.id].prompt : "",
      status: (s) => stateOf2(s).feedback,
      outcome(state3, entry) {
        const s = stateOf2(state3), spec = AOTAI_GAMES[s.id];
        return { id: s.id, edition: entry.edition, earned: s.play.complete && s.settledAt !== null, interaction: s.gesture, memory: spec.memory, title: spec.badge };
      },
      assets: (entry) => ({ scene: aotaiGameId(entry.id) ? sceneFile2(entry.id) : void 0 }),
      mount: (refs, context) => viewOf2(refs).mount(context.host, context.cache),
      dispose(refs) {
        viewOf2(refs).dispose();
        $2("micro-panel").removeAttribute("data-aotai");
      },
      point: (refs, input) => viewOf2(refs).input(input),
      key: (s, key, phase) => keyAotai(stateOf2(s), key, phase),
      present(state3, refs) {
        const s = stateOf2(state3), spec = AOTAI_GAMES[s.id], view3 = viewOf2(refs);
        $2("micro-panel").dataset.aotai = s.kind;
        if (s.session.kind === "takin") {
          $2("micro-panel").dataset.encounterPhase = s.session.phase.kind;
          $2("micro-panel").dataset.activeSeconds = s.age.toFixed(1);
        }
        text("micro-title", spec.title);
        text("micro-instruction", view3.contentState === "ready" ? s.settledAt !== null ? "" : spec.prompt : view3.contentState === "error" ? "画作暂未展开，可以重试或继续山路。" : "山间画作正在展开……");
        text("micro-result", view3.contentState === "ready" && s.feedback !== spec.prompt ? s.feedback : "");
        text("micro-skip", "继续山路 →");
        $2("micro-surface").setAttribute("aria-label", spec.prompt + " " + spec.keys + " R 重试。");
        $2("micro-surface").setAttribute("aria-busy", String(view3.contentState === "loading"));
      }
    };
  }

  // .build/typescript/runtime/projection.js
  function createProjection(x, y, scaleX, scaleY = scaleX) {
    return {
      x,
      y,
      scaleX,
      scaleY,
      toScreen: (world) => ({ x: x + world.x * scaleX, y: y + world.y * scaleY }),
      toWorld: (screen) => ({ x: (screen.x - x) / scaleX, y: (screen.y - y) / scaleY })
    };
  }
  function coverCamera(width, height, world, focus, zoom = 1) {
    const scale = Math.max(width / world.width, height / world.height) * zoom;
    const halfWidth = width / scale / 2, halfHeight = height / scale / 2;
    const cx = Math.max(halfWidth, Math.min(world.width - halfWidth, focus.x));
    const cy = Math.max(halfHeight, Math.min(world.height - halfHeight, focus.y));
    return { ...createProjection(width / 2 - cx * scale, height / 2 - cy * scale, scale), scale };
  }

  // .build/typescript/runtime/coast-memories/birdsong.js
  var BIRDS = [0, 1, 2];
  var PHRASES = [[0, 2], [1, 0, 2]];
  var PERCHES = [{ x: 220, y: 322 }, { x: 500, y: 262 }, { x: 780, y: 339 }];
  function birdsongLayout(width, height) {
    const portrait = height > width;
    const sceneHeight = 1e3 * height / Math.max(1, width);
    const cover3 = Math.max(1, sceneHeight / 1500), left = (1e3 - 1e3 * cover3) / 2, top = (sceneHeight - 1500 * cover3) / 2;
    const camera = coverCamera(1e3, sceneHeight, { width: 1e3, height: 667 }, { x: 500, y: 255 });
    const scale = portrait ? 0.38 * cover3 : 0.25 * camera.scale;
    const perches = portrait ? [{ x: 220 * cover3 + left, y: 334.5 * cover3 + top }, { x: 500, y: 882 * cover3 + top }, { x: 780 * cover3 + left, y: 750 * cover3 + top }] : PERCHES.map(camera.toScreen);
    return { portrait, height: sceneHeight, scale, perches, headOffset: 45 * scale / 0.25, camera };
  }
  function createBirdsong() {
    return { kind: "birdsong", round: 0, matched: 0, phase: { kind: "arriving", elapsed: 0 }, cue: null, repeated: false };
  }
  function repeatBirdsong(p2) {
    if (p2.phase.kind === "leaving" || p2.phase.kind === "finished" || p2.phase.kind === "breath")
      return;
    p2.phase = { kind: "listening", cursor: p2.matched, wait: 0.55 };
    p2.cue = null;
  }
  function answerBird(p2, bird) {
    if (p2.phase.kind !== "answering")
      return false;
    const phrase = PHRASES[p2.round];
    if (phrase[p2.matched] !== bird) {
      p2.repeated = true;
      repeatBirdsong(p2);
      return false;
    }
    p2.matched++;
    p2.cue = { bird, age: 0, source: "answer" };
    p2.repeated = false;
    p2.phase = p2.matched < phrase.length ? { kind: "answering", idle: 0 } : p2.round === 0 ? { kind: "breath", elapsed: 0 } : { kind: "leaving", elapsed: 0 };
    return true;
  }
  function tickBirdsong(p2, dt) {
    if (p2.cue) {
      p2.cue.age += dt;
      if (p2.cue.age >= 0.85)
        p2.cue = null;
    }
    const phase = p2.phase;
    switch (phase.kind) {
      case "arriving":
        phase.elapsed += dt;
        if (phase.elapsed >= 1.15)
          repeatBirdsong(p2);
        break;
      case "listening": {
        phase.wait -= dt;
        if (phase.wait > 0)
          break;
        const bird = PHRASES[p2.round][phase.cursor];
        if (bird === void 0)
          p2.phase = { kind: "answering", idle: 0 };
        else {
          phase.cursor++;
          phase.wait = 1.2;
          p2.cue = { bird, age: 0, source: "call" };
          return bird;
        }
        break;
      }
      case "answering":
        phase.idle += dt;
        if (phase.idle >= 10)
          repeatBirdsong(p2);
        break;
      case "breath":
        phase.elapsed += dt;
        if (phase.elapsed >= 1.65) {
          p2.round = 1;
          p2.matched = 0;
          p2.repeated = false;
          p2.phase = { kind: "listening", cursor: 0, wait: 0.5 };
        }
        break;
      case "leaving":
        phase.elapsed += dt;
        if (phase.elapsed >= 2)
          p2.phase = { kind: "finished" };
        break;
      case "finished":
        break;
      default: {
        const exhaustive = phase;
        return exhaustive;
      }
    }
    return null;
  }
  function birdsongFeedback(p2) {
    switch (p2.phase.kind) {
      case "arriving":
        return "海浪声远了，林间传来一小段鸣叫。";
      case "listening":
        return p2.repeated ? "再听剩下这一段，已经回应过的留着。" : p2.round === 0 ? "先听两声，看看是哪两只小鸟。" : "这次多了一声，先看它们依次鸣叫。";
      case "answering":
        return p2.matched ? "记住了这一声，接着回应。" : "轮到你了，按刚才的顺序轻点小鸟。";
      case "breath":
        return "回应上了，树枝上又响起一段短句。";
      case "leaving":
      case "finished":
        return "鸣叫在林间接上了，海风还在山口等你。";
      default: {
        const exhaustive = p2.phase;
        return exhaustive;
      }
    }
  }

  // .build/typescript/runtime/coast-memories/model.js
  var COAST_MEMORIES = {
    "maclehose-sideways-crab": { kind: "driftwood", game: "packing", title: "给它让一条沙路", badge: "横着也能到", prompt: "把挡路的漂木拖到旁边沙地，让螃蟹自己经过。", keys: "数字 1、2、3 选择漂木，方向键挪动，R 重试。", memory: "西湾的沙地上，一只小螃蟹正在找路。我挪开几根漂木，看它横着走过，留下一串浅浅的脚印。" },
    "coast-pier": { kind: "mooring", game: "creek", title: "把小船轻轻泊好", badge: "赤径慢潮", prompt: "拖动小船靠近左侧渡头，松手停稳，再把绳圈套到系桩。", keys: "方向键移动小船，Enter 停船；靠泊后 Enter 拿绳，方向键挪动，Enter 系好。R 重试。", memory: "赤径的水慢下来。我把纸上的小船轻轻送到渡头，套好绳圈，看倒影在船边重新聚拢。" },
    "maclehose-woodland-echo": { kind: "birdsong", game: "bells", title: "林间回声", badge: "山坳回声", prompt: "先听小鸟的短句，再按顺序轻点回应。", keys: "数字 1、2、3 对应左、中、右的小鸟；空格重听，R 重试。静音可看抬头和枝叶提示。", memory: "离开咸田湾，往大浪坳的林缘歇了歇。纸上的小鸟依次鸣叫，我记住一小段顺序，轻轻回应，才发现海浪声已经远了。" }
  };
  var coastMemoryId = (id2) => Object.hasOwn(COAST_MEMORIES, id2);
  var COAST_MEMORY_IDS = Object.keys(COAST_MEMORIES).filter(coastMemoryId);
  var WIDTH = 1e3;
  var HEIGHT = 667;
  var DOCK = { x: 507, y: 355 };
  var POST = { x: 361, y: 301 };
  var boatRope = (boat) => ({ x: boat.x - 69, y: boat.y - 19 });
  var crabPoint = (progress) => ({ x: 185 + 710 * progress, y: 365 + 105 * progress + Math.sin(Math.PI * progress) * 6 });
  var clamp5 = (n, min, max) => Math.max(min, Math.min(max, n));
  var distance3 = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  var validPoint = (input) => typeof input.x === "number" && Number.isFinite(input.x) && typeof input.y === "number" && Number.isFinite(input.y) ? { x: input.x, y: input.y } : null;
  var radius = (input) => Math.max(18, 22 * WIDTH / Math.max(220, input.viewWidth ?? WIDTH));
  var CoastMemoryState = class {
    id;
    route = "maclehose";
    game;
    kind;
    age = 0;
    acted = false;
    dragging = false;
    gesture = "tap";
    done = false;
    x = 0.5;
    y = 0.5;
    events = [];
    serial = 0;
    feedback;
    play;
    session;
    constructor(id2, reduced2) {
      this.id = id2;
      const spec = COAST_MEMORIES[id2];
      this.game = spec.game;
      this.kind = spec.kind;
      this.feedback = spec.prompt;
      this.play = { type: "coast-memory-5", progress: 0, complete: false, completedAt: null, reduced: reduced2 };
      this.session = spec.kind === "birdsong" ? createBirdsong() : spec.kind === "driftwood" ? { kind: "driftwood", crab: 0, moving: false, focus: 0, drag: null, logs: [
        { x: 400, y: 404, width: 24, height: 96, axis: "vertical" },
        { x: 590, y: 437, width: 218, height: 56, axis: "horizontal" },
        { x: 780, y: 470, width: 24, height: 96, axis: "vertical" }
      ] } : { kind: "mooring", boat: { x: 600, y: 480 }, phase: { kind: "sailing", velocity: { x: 0, y: 0 }, lastMove: 0, released: false, stable: 0, travel: 0, drag: null } };
    }
  };
  function stateOf3(state3) {
    if (!(state3 instanceof CoastMemoryState))
      throw new Error("海岸互动状态不匹配");
    return state3;
  }
  function emit4(s, type, x) {
    s.events.push({ serial: ++s.serial, type, x: x / WIDTH });
    if (s.events.length > 10)
      s.events.shift();
  }
  function complete(s, feedback) {
    s.play.complete = true;
    s.play.progress = 1;
    s.play.completedAt = s.age;
    s.dragging = false;
    s.feedback = feedback;
    emit4(s, "complete", 0.5 * WIDTH);
  }
  function echoReply(s, p2, bird) {
    if (answerBird(p2, bird)) {
      s.acted = true;
      s.gesture = "tap";
      s.events.push({ serial: ++s.serial, type: "coast-bird-answer", x: PERCHES[bird].x / WIDTH, index: bird });
    }
    s.feedback = birdsongFeedback(p2);
  }
  function logBlocks(log, at2) {
    return Math.abs(log.x - at2.x) < log.width / 2 + 46 && Math.abs(log.y - at2.y) < log.height / 2 + 28;
  }
  function logClear(log) {
    for (let i = 0; i <= 50; i++)
      if (logBlocks(log, crabPoint(i / 50)))
        return false;
    return true;
  }
  function logsOverlap(a, b) {
    return Math.abs(a.x - b.x) < (a.width + b.width) / 2 + 6 && Math.abs(a.y - b.y) < (a.height + b.height) / 2 + 6;
  }
  function sandBottom(x) {
    return x < 500 ? 475 + (x - 280) * 0.5 : x < 760 ? 585 + (x - 500) * 0.14 : 621.4 - (x - 760) * 0.18;
  }
  function moveLog(s, p2, index, target) {
    const log = p2.logs[index], start = { x: log.x, y: log.y }, span = distance3(start, target), steps2 = Math.max(1, Math.ceil(span / 12));
    for (let i = 1; i <= steps2; i++) {
      const x = clamp5(start.x + (target.x - start.x) * i / steps2, 280 + log.width / 2, 945 - log.width / 2);
      const y = clamp5(start.y + (target.y - start.y) * i / steps2, 205 + x * 0.25 + log.height / 2, sandBottom(x) - log.height / 2);
      const next = { ...log, x, y };
      if (p2.logs.some((other, j) => j !== index && logsOverlap(next, other)) || logBlocks(next, crabPoint(p2.crab)))
        break;
      log.x = x;
      log.y = y;
    }
    if (distance3(log, start) > 1) {
      s.acted = true;
      s.gesture = "drag";
    }
  }
  function moveBoat(s, p2, target) {
    if (p2.phase.kind !== "sailing")
      return;
    const before = p2.boat, next = { x: clamp5(target.x, 493, 896), y: clamp5(target.y, 335, 582) }, dt = Math.max(0.025, s.age - p2.phase.lastMove);
    p2.phase.velocity = { x: clamp5((next.x - before.x) / dt, -200, 200), y: clamp5((next.y - before.y) / dt, -200, 200) };
    p2.phase.lastMove = s.age;
    p2.phase.travel += distance3(before, next);
    p2.phase.released = false;
    p2.boat = next;
    s.acted = true;
    s.gesture = "drag";
  }
  function released(s, input) {
    const p2 = s.session, at2 = validPoint(input);
    if (p2.kind === "driftwood") {
      p2.drag = null;
    } else if (p2.kind === "mooring" && p2.phase.kind === "sailing" && p2.phase.drag) {
      p2.phase.drag = null;
      p2.phase.released = true;
      p2.phase.velocity.x *= 0.08;
      p2.phase.velocity.y *= 0.08;
      s.feedback = distance3(p2.boat, DOCK) < 46 ? "松开了，让船在渡头旁慢慢停稳。" : "再靠近一点，左侧的渡头就在前面。";
    } else if (p2.kind === "mooring" && p2.phase.kind === "rope" && p2.phase.holding) {
      if (at2)
        p2.phase.end = at2;
      if (distance3(p2.phase.end, POST) <= Math.max(43, radius(input))) {
        p2.phase = { kind: "tied", elapsed: 0 };
        s.play.progress = 0.94;
        s.feedback = "绳圈套好了，小船在水面上轻轻晃。";
        emit4(s, "coast-rope-tied", POST.x);
      } else {
        p2.phase.holding = false;
        p2.phase.end = boatRope(p2.boat);
        s.feedback = "把船头的绳圈拖到渡头上的木桩，再松手。";
      }
    }
    s.dragging = false;
    return s;
  }
  function actCoast(s, input) {
    if (s.play.complete)
      return s;
    if (s.session.kind === "birdsong") {
      const p3 = s.session;
      if (input.action === "echo-repeat") {
        repeatBirdsong(p3);
        s.feedback = birdsongFeedback(p3);
        return s;
      }
      const at3 = validPoint(input);
      if (input.phase !== "press" || !at3)
        return s;
      const layout3 = birdsongLayout(input.viewWidth ?? WIDTH, input.viewHeight ?? HEIGHT), pad2 = Math.max(65 * layout3.scale / 0.25, radius(input));
      const bird = BIRDS.find((bird2) => distance3(at3, { x: layout3.perches[bird2].x, y: layout3.perches[bird2].y - layout3.headOffset }) <= pad2);
      if (bird !== void 0)
        echoReply(s, p3, bird);
      return s;
    }
    if (input.phase === "release") {
      moveCoast(s, input);
      return released(s, input);
    }
    const at2 = validPoint(input);
    if (!at2 || input.phase !== "press")
      return s;
    s.x = at2.x / WIDTH;
    s.y = at2.y / HEIGHT;
    const p2 = s.session, pad = radius(input);
    if (p2.kind === "driftwood") {
      const candidates = p2.logs.map((log, index) => ({ log, index })).filter(({ log }) => Math.abs(log.x - at2.x) < log.width / 2 + pad && Math.abs(log.y - at2.y) < log.height / 2 + pad).sort((a, b) => distance3(a.log, at2) - distance3(b.log, at2));
      const picked = candidates[0];
      if (!picked)
        return s;
      p2.focus = picked.index;
      p2.drag = { index: picked.index, offset: { x: at2.x - picked.log.x, y: at2.y - picked.log.y } };
      s.dragging = true;
      s.feedback = "轻轻挪开，给它留出能横着经过的空隙。";
      emit4(s, "coast-wood-pick", at2.x);
    } else if (p2.phase.kind === "sailing" && Math.abs(at2.x - p2.boat.x) < 100 + pad && Math.abs(at2.y - p2.boat.y) < 44 + pad) {
      p2.phase.drag = { x: at2.x - p2.boat.x, y: at2.y - p2.boat.y };
      p2.phase.velocity = { x: 0, y: 0 };
      p2.phase.released = false;
      s.dragging = true;
      s.feedback = "靠近左侧渡头，再松手。";
    } else if (p2.phase.kind === "rope" && distance3(at2, boatRope(p2.boat)) < 27 + pad) {
      p2.phase.holding = true;
      p2.phase.end = at2;
      s.dragging = true;
      s.feedback = "把绳圈套到渡头上的木桩。";
      emit4(s, "coast-rope-pick", at2.x);
    }
    return s;
  }
  function moveCoast(s, input) {
    const at2 = validPoint(input);
    if (!at2 || s.play.complete)
      return s;
    const p2 = s.session;
    s.x = at2.x / WIDTH;
    s.y = at2.y / HEIGHT;
    if (p2.kind === "driftwood" && p2.drag)
      moveLog(s, p2, p2.drag.index, { x: at2.x - p2.drag.offset.x, y: at2.y - p2.drag.offset.y });
    else if (p2.kind === "mooring") {
      if (p2.phase.kind === "sailing" && p2.phase.drag)
        moveBoat(s, p2, { x: at2.x - p2.phase.drag.x, y: at2.y - p2.phase.drag.y });
      else if (p2.phase.kind === "rope" && p2.phase.holding)
        p2.phase.end = { x: clamp5(at2.x, 30, 950), y: clamp5(at2.y, 180, 600) };
    }
    return s;
  }
  function cancelCoast(s) {
    const p2 = s.session;
    s.dragging = false;
    if (p2.kind === "driftwood")
      p2.drag = null;
    else if (p2.kind === "mooring" && p2.phase.kind === "sailing") {
      p2.phase.drag = null;
      p2.phase.released = false;
      p2.phase.velocity = { x: 0, y: 0 };
      p2.phase.stable = 0;
    } else if (p2.kind === "mooring" && p2.phase.kind === "rope") {
      p2.phase.holding = false;
      p2.phase.end = boatRope(p2.boat);
    }
    return s;
  }
  function tickCoast(s, dt) {
    if (s.done || !Number.isFinite(dt) || dt <= 0)
      return s;
    dt = Math.min(0.05, dt);
    s.age += dt;
    if (s.play.complete) {
      s.done = s.play.completedAt !== null && s.age - s.play.completedAt >= 1.7;
      return s;
    }
    const p2 = s.session;
    if (p2.kind === "driftwood") {
      const next = Math.min(1, p2.crab + dt * 0.073);
      p2.moving = s.acted && !p2.logs.some((log) => logBlocks(log, crabPoint(next)));
      if (p2.moving)
        p2.crab = next;
      const cleared = p2.logs.filter(logClear).length;
      s.play.progress = Math.min(0.94, cleared * 0.17 + p2.crab * 0.43);
      if (s.acted && !s.dragging)
        s.feedback = p2.moving ? "路让出来了，它正沿着沙地慢慢经过。" : "前面还有一根漂木，再给它让一点空间。";
      if (p2.crab === 1 && !s.dragging)
        complete(s, "它走过去了，沙地上留下浅浅的足迹。");
    } else if (p2.kind === "mooring") {
      const phase = p2.phase;
      if (phase.kind === "sailing") {
        if (!phase.drag) {
          const damping = Math.exp(-dt * 7);
          phase.velocity.x *= damping;
          phase.velocity.y *= damping;
          p2.boat.x = clamp5(p2.boat.x + phase.velocity.x * dt, 493, 896);
          p2.boat.y = clamp5(p2.boat.y + phase.velocity.y * dt, 335, 582);
        }
        s.play.progress = s.acted ? clamp5((1 - distance3(p2.boat, DOCK) / 340) * 0.65, 0.02, 0.65) : 0;
        const near3 = distance3(p2.boat, DOCK) < 43 && Math.hypot(phase.velocity.x, phase.velocity.y) < 14;
        phase.stable = phase.released && phase.travel > 100 && near3 ? phase.stable + dt : 0;
        if (phase.stable >= 0.65) {
          p2.phase = { kind: "landing", from: { ...p2.boat }, elapsed: 0 };
          s.feedback = "船靠稳了，船头还放着一个绳圈。";
          emit4(s, "coast-boat-touch", p2.boat.x);
        }
      } else if (phase.kind === "landing") {
        phase.elapsed += dt;
        const t = Math.min(1, phase.elapsed / 0.7), ease2 = t * t * (3 - 2 * t);
        p2.boat = { x: phase.from.x + (DOCK.x - phase.from.x) * ease2, y: phase.from.y + (DOCK.y - phase.from.y) * ease2 };
        if (t === 1) {
          p2.phase = { kind: "rope", end: boatRope(p2.boat), holding: false };
          s.play.progress = 0.78;
          s.feedback = "把船头的绳圈拖到木桩上，系好这段慢潮。";
        }
      } else if (phase.kind === "tied") {
        phase.elapsed += dt;
        if (phase.elapsed >= 1.4)
          complete(s, "绳结稳了，村落与小船的倒影慢慢聚拢。");
      }
    } else {
      const bird = tickBirdsong(p2, dt);
      if (bird !== null)
        s.events.push({ serial: ++s.serial, type: "coast-bird-call", x: PERCHES[bird].x / WIDTH, index: bird });
      s.play.progress = Math.min(0.94, ((p2.round === 0 ? 0 : 2) + p2.matched) / 5 * 0.94);
      s.feedback = birdsongFeedback(p2);
      if (p2.phase.kind === "finished" && s.acted)
        complete(s, s.feedback);
    }
    if (s.events.length > 10)
      s.events.splice(0, s.events.length - 10);
    return s;
  }
  function keyCoast(s, key, phase) {
    if (phase === "up" || s.play.complete)
      return null;
    const arrows = { ArrowLeft: { x: -18, y: 0 }, ArrowRight: { x: 18, y: 0 }, ArrowUp: { x: 0, y: -18 }, ArrowDown: { x: 0, y: 18 } }, direction = arrows[key], p2 = s.session;
    if (p2.kind === "birdsong") {
      const bird = key === "1" ? 0 : key === "2" ? 1 : key === "3" ? 2 : null;
      if (bird !== null) {
        echoReply(s, p2, bird);
        return s;
      }
      if (key === " " || key === "Enter") {
        repeatBirdsong(p2);
        s.feedback = birdsongFeedback(p2);
        return s;
      }
      return null;
    }
    if (p2.kind === "driftwood") {
      if (/^[1-3]$/.test(key)) {
        p2.focus = Number(key) - 1;
        return s;
      }
      if (!direction)
        return null;
      const log = p2.logs[p2.focus];
      moveLog(s, p2, p2.focus, { x: log.x + direction.x, y: log.y + direction.y });
      return s;
    }
    if (p2.phase.kind === "sailing") {
      if (direction) {
        moveBoat(s, p2, { x: p2.boat.x + direction.x, y: p2.boat.y + direction.y });
        p2.phase.velocity = { x: 0, y: 0 };
        return s;
      }
      if (key === "Enter" || key === " ") {
        p2.phase.released = true;
        p2.phase.velocity = { x: 0, y: 0 };
        return s;
      }
    } else if (p2.phase.kind === "rope") {
      if (key === "Enter" || key === " ") {
        if (!p2.phase.holding) {
          p2.phase.holding = true;
          s.dragging = true;
          s.acted = true;
        } else
          released(s, { x: p2.phase.end.x, y: p2.phase.end.y });
        return s;
      }
      if (direction && p2.phase.holding) {
        p2.phase.end = { x: clamp5(p2.phase.end.x + direction.x, 30, 950), y: clamp5(p2.phase.end.y + direction.y, 180, 600) };
        return s;
      }
    }
    return null;
  }

  // .build/typescript/runtime/coast-memories/view.js
  var FRAMES = {
    crab: { x: 43, y: 166, width: 502, height: 272 },
    horizontal: { x: 581, y: 238, width: 684, height: 178 },
    vertical: { x: 1308, y: 10, width: 139, height: 572 },
    boat: { x: 37, y: 653, width: 686, height: 278 },
    rope: { x: 769, y: 611, width: 426, height: 340 },
    post: { x: 1253, y: 601, width: 242, height: 392 }
  };
  var PROPS = "scenes/maclehose-games-v5/props.webp";
  var PHONE_SCENE = "scenes/maclehose-echo-v9/forest-phone.webp";
  var propsFile = (id2) => id2 === "maclehose-woodland-echo" ? "scenes/maclehose-echo-v9/birds.webp" : PROPS;
  var sceneFile3 = (id2) => id2 === "maclehose-woodland-echo" ? "scenes/maclehose-echo-v9/forest.webp" : `scenes/maclehose-games-v5/${id2 === "coast-pier" ? "pier" : "beach"}.webp`;
  var BIRD_FRAMES = [
    { x: 0, y: 64, width: 550, height: 540, footX: 355, footY: 504 },
    { x: 570, y: 64, width: 480, height: 540, footX: 174, footY: 493 },
    { x: 1050, y: 64, width: 486, height: 540, footX: 188, footY: 493 }
  ];
  function pencil(ctx, a, b) {
    const angle = Math.atan2(b.y - a.y, b.x - a.x);
    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    for (const [color, width] of [["#fff9e4c9", 6], ["#716e56b0", 2]]) {
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.quadraticCurveTo((a.x + b.x) / 2 + 8, (a.y + b.y) / 2, b.x, b.y);
      ctx.moveTo(b.x - Math.cos(angle - 0.6) * 13, b.y - Math.sin(angle - 0.6) * 13);
      ctx.lineTo(b.x, b.y);
      ctx.lineTo(b.x - Math.cos(angle + 0.6) * 13, b.y - Math.sin(angle + 0.6) * 13);
      ctx.stroke();
    }
    ctx.restore();
  }
  var CoastMemoryView = class {
    id;
    doc;
    directInput = true;
    canvas;
    contentState = "loading";
    disposed = false;
    pending = new AbortController();
    observer = null;
    host = null;
    scene = null;
    phoneScene = null;
    props = null;
    state = null;
    repeat;
    focus = null;
    paintedAt = 0;
    constructor(id2, doc, onAction) {
      this.id = id2;
      this.doc = doc;
      this.canvas = doc.createElement("canvas");
      this.canvas.className = "coast-memory-canvas";
      this.canvas.setAttribute("aria-hidden", "true");
      this.repeat = id2 === "maclehose-woodland-echo" ? doc.createElement("button") : null;
      if (this.repeat) {
        const repeat = this.repeat;
        repeat.type = "button";
        repeat.className = "coast-echo-repeat";
        repeat.textContent = "再听一遍";
        repeat.disabled = true;
        repeat.addEventListener("pointerdown", (event) => event.stopPropagation(), { signal: this.pending.signal });
        repeat.addEventListener("keydown", (event) => {
          if (event.key === " " || event.key === "Enter")
            event.stopPropagation();
        }, { signal: this.pending.signal });
        repeat.addEventListener("click", (event) => {
          event.stopPropagation();
          onAction("echo-repeat");
        }, { signal: this.pending.signal });
      }
    }
    resize() {
      if (!this.host || this.disposed)
        return;
      const rect = this.host.getBoundingClientRect(), dpr = Math.min(2, devicePixelRatio || 1, Math.sqrt(24e5 / Math.max(1, rect.width * rect.height)));
      this.canvas.width = Math.max(1, Math.round(rect.width * dpr));
      this.canvas.height = Math.max(1, Math.round(rect.height * dpr));
      if (this.state)
        this.paint(this.state);
    }
    async mount(host, cache2) {
      this.host = host;
      host.append(this.canvas);
      if (this.repeat)
        this.doc.getElementById("mini-controls")?.append(this.repeat);
      this.observer = new ResizeObserver(() => this.resize());
      this.observer.observe(host);
      this.resize();
      const { signal } = this.pending;
      const load = (file) => new Promise((resolve, reject) => {
        const entry = cache2?.request(file, "high");
        let image = null;
        const clean = () => {
          signal.removeEventListener("abort", abort);
          if (image)
            image.onload = image.onerror = null;
        };
        const abort = () => {
          clean();
          reject(new DOMException("已离开海岸画作", "AbortError"));
        };
        if (signal.aborted) {
          abort();
          return;
        }
        signal.addEventListener("abort", abort, { once: true });
        if (entry)
          void entry.promise.then((asset) => {
            if (signal.aborted)
              return;
            clean();
            if (asset.state === "ready")
              resolve(asset.image);
            else
              reject(new Error("海岸画作暂未展开"));
          });
        else {
          image = this.doc.createElement("img");
          image.decoding = "async";
          image.onload = () => {
            if (!image)
              return;
            clean();
            resolve(image);
          };
          image.onerror = () => {
            clean();
            reject(new Error("海岸画作暂未展开"));
          };
          image.src = file;
        }
      });
      try {
        const [scene, props, phone] = await Promise.all([load(sceneFile3(this.id)), load(propsFile(this.id)), this.id === "maclehose-woodland-echo" ? load(PHONE_SCENE) : Promise.resolve(null)]);
        if (this.disposed || signal.aborted)
          return;
        this.scene = scene;
        this.props = props;
        this.phoneScene = phone;
        this.contentState = "ready";
      } catch {
        if (!this.disposed && !signal.aborted)
          this.contentState = "error";
      }
      if (!this.disposed) {
        host.setAttribute("aria-busy", String(this.contentState === "loading"));
        if (this.state)
          this.paint(this.state);
      }
    }
    input(input) {
      const rect = this.host?.getBoundingClientRect();
      if (!rect || typeof input.x !== "number" || typeof input.y !== "number")
        return input;
      const point2 = this.id === "maclehose-woodland-echo" ? { x: input.x * WIDTH, y: input.y * birdsongLayout(rect.width, rect.height).height } : coverCamera(rect.width, rect.height, { width: WIDTH, height: HEIGHT }, this.focus ?? { x: WIDTH / 2, y: HEIGHT / 2 }).toWorld({ x: input.x * rect.width, y: input.y * rect.height });
      return { ...input, ...point2, viewWidth: rect.width, viewHeight: rect.height };
    }
    sprite(ctx, name, at2, width, height, rotation = 0) {
      if (!this.props)
        return;
      const frame2 = FRAMES[name], scale = Math.min(width / frame2.width, height / frame2.height), w = frame2.width * scale, h = frame2.height * scale;
      ctx.save();
      ctx.translate(at2.x, at2.y);
      ctx.rotate(rotation);
      ctx.drawImage(this.props, frame2.x, frame2.y, frame2.width, frame2.height, -w / 2, -h / 2, w, h);
      ctx.restore();
    }
    shadow(ctx, at2, rx, ry) {
      ctx.save();
      ctx.fillStyle = "#675d3b24";
      ctx.beginPath();
      ctx.ellipse(at2.x + 2, at2.y + 6, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    driftwood(ctx, s) {
      const p2 = s.session;
      if (p2.kind !== "driftwood")
        return;
      ctx.save();
      ctx.fillStyle = "#8b745342";
      for (let i = 0; i < Math.floor(p2.crab * 36); i++) {
        const at3 = crabPoint(i / 36);
        for (const side of [-1, 1]) {
          ctx.beginPath();
          ctx.ellipse(at3.x, at3.y + side * 18, 2.8, 1.4, side * 0.6, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      for (const [index, log] of p2.logs.entries()) {
        this.shadow(ctx, { x: log.x, y: log.y + log.height * 0.22 }, log.width * 0.53, log.height * 0.19);
        this.sprite(ctx, log.axis, log, log.width, log.height);
        if (p2.drag?.index === index) {
          ctx.strokeStyle = "#90775342";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(log.x - 12, log.y + log.height / 2 + 9);
          ctx.quadraticCurveTo(log.x, log.y + log.height / 2 + 13, log.x + 12, log.y + log.height / 2 + 9);
          ctx.stroke();
        }
      }
      const at2 = crabPoint(p2.crab), gait = s.play.reduced || !p2.moving ? 0 : Math.sin(s.age * 17);
      this.shadow(ctx, { x: at2.x, y: at2.y + 12 }, 35, 6);
      this.sprite(ctx, "crab", at2, 92, 56, gait * 0.018);
      if (!s.acted || !s.dragging && p2.crab < 0.03) {
        const log = p2.logs.find((log2) => !logClear(log2));
        if (log)
          pencil(ctx, { x: log.x + log.width / 2 + 20, y: log.y - 20 }, { x: log.x + log.width / 2 + 20, y: log.y + 38 });
      }
      ctx.restore();
    }
    rope(ctx, a, b, taut) {
      ctx.save();
      ctx.lineCap = "round";
      for (const [color, width] of [["#79684eaa", 5], ["#e0c89f", 3], ["#f7e6c76b", 1]]) {
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.quadraticCurveTo((a.x + b.x) / 2, (a.y + b.y) / 2 + (taut ? 4 : 15), b.x, b.y);
        ctx.stroke();
      }
      ctx.restore();
    }
    mooring(ctx, s) {
      const p2 = s.session;
      if (p2.kind !== "mooring")
        return;
      const phase = p2.phase, boat = p2.boat, reduced2 = s.play.reduced;
      ctx.save();
      for (let i = 0; i < 16; i++) {
        const x = 460 + i * 31 % 470, y = 220 + i * 59 % 380;
        ctx.strokeStyle = "#f6f4dc48";
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.quadraticCurveTo(x + 28, y + (reduced2 ? 0 : Math.sin(s.age * 0.6 + i) * 2.4), x + 57, y - 1);
        ctx.stroke();
      }
      ctx.fillStyle = "#2e77714a";
      ctx.beginPath();
      ctx.ellipse(boat.x + 7, boat.y + 21, 103, 16, -0.04, 0, Math.PI * 2);
      ctx.fill();
      const speed = phase.kind === "sailing" ? Math.hypot(phase.velocity.x, phase.velocity.y) : 0;
      if (!reduced2)
        for (let i = 0; i < 3; i++) {
          const t = (s.age * 0.24 + i / 3) % 1;
          ctx.strokeStyle = `rgba(240,240,214,${(1 - t) * (speed > 8 ? 0.38 : 0.14)})`;
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.ellipse(boat.x + 7, boat.y + 22, 100 + t * 42, 15 + t * 13, -0.04, 0, Math.PI * 2);
          ctx.stroke();
        }
      this.sprite(ctx, "boat", boat, 202, 86, reduced2 || s.dragging ? 0 : Math.sin(s.age * 1.05) * 6e-3);
      const root = boatRope(boat);
      if (phase.kind === "rope") {
        if (phase.holding)
          this.rope(ctx, root, phase.end, false);
        this.sprite(ctx, "rope", phase.holding ? phase.end : root, 37, 31);
        if (!phase.holding)
          pencil(ctx, { x: root.x - 10, y: root.y - 25 }, { x: POST.x + 19, y: POST.y - 5 });
      } else if (phase.kind === "tied")
        this.rope(ctx, root, { x: POST.x, y: POST.y + 4 }, true);
      else {
        this.sprite(ctx, "rope", root, 35, 30);
        if (!s.acted)
          pencil(ctx, { x: boat.x - 100, y: boat.y + 64 }, { x: DOCK.x + 25, y: DOCK.y + 65 });
      }
      this.sprite(ctx, "post", POST, 36, 56);
      if (phase.kind === "tied") {
        ctx.strokeStyle = "#e8d5ac";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(POST.x, POST.y + 3, 14, 5, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    }
    birdsong(ctx, s, p2) {
      if (!this.props)
        return;
      const cue = p2.cue, layout3 = birdsongLayout(this.canvas.width, this.canvas.height);
      for (const bird of BIRDS) {
        const frame2 = BIRD_FRAMES[bird], perch = layout3.perches[bird], calling = cue?.bird === bird;
        const pulse = calling ? Math.sin(Math.min(1, cue.age / 0.85) * Math.PI) : 0;
        ctx.save();
        ctx.translate(perch.x, perch.y);
        const idle = s.play.reduced ? 0 : Math.sin(s.age * 0.7 + bird) * 6e-3;
        ctx.rotate(s.play.reduced ? 0 : idle + pulse * (bird === 0 ? -0.075 : 0.075));
        ctx.scale(layout3.scale, layout3.scale);
        ctx.drawImage(this.props, frame2.x, frame2.y, frame2.width, frame2.height, -frame2.footX, -frame2.footY, frame2.width, frame2.height);
        ctx.restore();
        if (calling) {
          const side = bird === 0 ? 1 : -1;
          ctx.save();
          ctx.strokeStyle = cue.source === "answer" ? "#547866" : "#576653";
          ctx.lineWidth = 2.1;
          ctx.lineCap = "round";
          ctx.globalAlpha = s.play.reduced ? 0.9 : 0.3 + pulse * 0.7;
          for (let i = 0; i < 2; i++) {
            const x = perch.x + side * (50 + i * 10) * layout3.scale / 0.25, y = perch.y - 101 * layout3.scale / 0.25;
            ctx.beginPath();
            ctx.moveTo(x, y - 6 - i * 3);
            ctx.quadraticCurveTo(x + side * 9, y, x, y + 6 + i * 3);
            ctx.stroke();
          }
          ctx.restore();
        }
      }
      if (!s.play.reduced) {
        ctx.save();
        ctx.strokeStyle = "#b8bd86a8";
        ctx.lineWidth = 1.4;
        ctx.lineCap = "round";
        for (let i = 0; i < 5; i++) {
          const x = 95 + i * 193, y = 130 + i % 2 * 400, drift = Math.sin(s.age * 0.75 + i) * 5;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.quadraticCurveTo(x + 12 + drift, y - 7, x + 23 + drift, y - 3);
          ctx.stroke();
        }
        ctx.restore();
      }
    }
    paint(s) {
      this.state = s;
      if (this.disposed)
        return;
      const ctx = this.canvas.getContext("2d");
      if (!ctx) {
        this.contentState = "error";
        return;
      }
      const echo = s.session.kind === "birdsong", layout3 = birdsongLayout(this.canvas.width, this.canvas.height), height = echo ? layout3.height : HEIGHT;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      if (echo)
        ctx.setTransform(this.canvas.width / WIDTH, 0, 0, this.canvas.height / height, 0, 0);
      else {
        const target = s.session.kind === "driftwood" ? { x: crabPoint(s.session.crab).x + 135, y: 440 } : s.session.kind === "mooring" ? { x: (s.session.boat.x + DOCK.x) / 2 - 25, y: 390 } : { x: WIDTH / 2, y: HEIGHT / 2 };
        const elapsed = Math.max(0, s.age - this.paintedAt);
        if (!this.focus || s.age < this.paintedAt || s.play.reduced)
          this.focus = target;
        else if (!s.dragging) {
          const blend = 1 - Math.exp(-elapsed * 3);
          this.focus = { x: this.focus.x + (target.x - this.focus.x) * blend, y: this.focus.y + (target.y - this.focus.y) * blend };
        }
        this.paintedAt = s.age;
        const camera = coverCamera(this.canvas.width, this.canvas.height, { width: WIDTH, height: HEIGHT }, this.focus);
        ctx.setTransform(camera.scale, 0, 0, camera.scale, camera.x, camera.y);
      }
      ctx.fillStyle = "#e9e5d0";
      ctx.fillRect(0, 0, WIDTH, height);
      const scene = echo && layout3.portrait ? this.phoneScene : this.scene;
      if (scene) {
        if (echo && !layout3.portrait)
          ctx.drawImage(scene, layout3.camera.x, layout3.camera.y, WIDTH * layout3.camera.scale, HEIGHT * layout3.camera.scale);
        else if (echo) {
          const cover3 = Math.max(WIDTH / scene.naturalWidth, height / scene.naturalHeight), w = scene.naturalWidth * cover3, h = scene.naturalHeight * cover3;
          ctx.drawImage(scene, (WIDTH - w) / 2, (height - h) / 2, w, h);
        } else
          ctx.drawImage(scene, 0, 0, WIDTH, height);
      }
      if (this.repeat && s.session.kind === "birdsong")
        this.repeat.disabled = this.contentState !== "ready" || s.play.complete || ["breath", "leaving", "finished"].includes(s.session.phase.kind);
      if (this.contentState === "ready") {
        if (s.session.kind === "driftwood")
          this.driftwood(ctx, s);
        else if (s.session.kind === "mooring")
          this.mooring(ctx, s);
        else
          this.birdsong(ctx, s, s.session);
      }
    }
    dispose() {
      if (this.disposed)
        return;
      this.disposed = true;
      this.pending.abort();
      this.observer?.disconnect();
      this.canvas.remove();
      this.repeat?.remove();
      this.canvas.width = this.canvas.height = 1;
      this.scene = this.props = this.phoneScene = null;
      this.state = null;
      this.host = null;
    }
  };
  function viewOf3(refs) {
    if (!(refs instanceof CoastMemoryView))
      throw new Error("海岸画作界面不匹配");
    return refs;
  }

  // .build/typescript/runtime/coast-memories/adapter.js
  function createCoastMemories(dom2, onAction) {
    const { get: $2, text } = dom2;
    return {
      create(entry, options) {
        if (!coastMemoryId(entry.id))
          throw new Error("海岸互动不存在");
        return new CoastMemoryState(entry.id, options.reduced);
      },
      act: (s, input) => actCoast(stateOf3(s), input),
      move: (s, input) => moveCoast(stateOf3(s), input),
      release: (s) => cancelCoast(stateOf3(s)),
      tick: (s, dt) => tickCoast(stateOf3(s), dt),
      draw(_svg, _parent, entry) {
        if (!coastMemoryId(entry.id))
          throw new Error("海岸画作不存在");
        return new CoastMemoryView(entry.id, dom2.document, onAction);
      },
      paint: (refs, s) => viewOf3(refs).paint(stateOf3(s)),
      instruction: (entry) => coastMemoryId(entry.id) ? COAST_MEMORIES[entry.id].prompt : "",
      status: (s) => stateOf3(s).feedback,
      outcome(state3, entry) {
        const s = stateOf3(state3), spec = COAST_MEMORIES[s.id];
        return { id: s.id, edition: entry.edition, earned: s.play.complete && s.play.completedAt !== null, interaction: s.gesture, memory: spec.memory, title: spec.badge };
      },
      assets: (entry) => coastMemoryId(entry.id) ? { scene: sceneFile3(entry.id), actor: propsFile(entry.id), ...entry.id === "maclehose-woodland-echo" ? { front: PHONE_SCENE } : {} } : {},
      mount: (refs, context) => viewOf3(refs).mount(context.host, context.cache),
      dispose(refs) {
        viewOf3(refs).dispose();
        for (const key of ["coastMemory", "coastPhase", "clearedLogs"])
          delete $2("micro-panel").dataset[key];
      },
      point: (refs, point2) => viewOf3(refs).input(point2),
      key: (s, key, phase) => keyCoast(stateOf3(s), key, phase),
      present(state3, refs) {
        const s = stateOf3(state3), spec = COAST_MEMORIES[s.id], view3 = viewOf3(refs), panel = $2("micro-panel");
        panel.dataset.coastMemory = s.kind;
        panel.dataset.coastPhase = s.play.complete ? "complete" : s.session.kind === "driftwood" ? s.session.moving ? "passing" : "waiting" : s.session.phase.kind;
        if (s.session.kind === "driftwood")
          panel.dataset.clearedLogs = String(s.session.logs.filter(logClear).length);
        text("micro-title", spec.title);
        text("micro-instruction", spec.prompt);
        text("micro-result", view3.contentState === "ready" ? s.feedback : view3.contentState === "error" ? "画作暂未展开，可以重试或继续山径。" : "海岸画作正在展开……");
        text("micro-skip", "继续山径 →");
        $2("micro-surface").setAttribute("aria-label", spec.prompt + " 键盘辅助：" + spec.keys);
        $2("micro-surface").setAttribute("aria-busy", String(view3.contentState === "loading"));
      }
    };
  }

  // .build/typescript/runtime/coast-memories/shoulder/model.js
  var SCENE = { width: 1672, height: 941 };
  var FOOTHOLDS = [
    { x: 505, y: 913 },
    { x: 445, y: 816 },
    { x: 410, y: 718 },
    { x: 450, y: 651 },
    { x: 505, y: 600 },
    { x: 560, y: 575 },
    { x: 760, y: 643 },
    { x: 900, y: 666 },
    { x: 1030, y: 675 }
  ];
  var LOOKOUT = FOOTHOLDS[FOOTHOLDS.length - 1];
  var PROMPT = "轻点山路，登高望海。";
  var MEMORY = "沿西湾山的石阶登高，转过山肩，白沙海湾与蚺蛇尖一起展开。我背着包站在高处，让海风吹过，把这一眼山海留在手帐里。";
  var clamp6 = (n, min = 0, max = 1) => Math.max(min, Math.min(max, n));
  var mix = (a, b, t) => a + (b - a) * t;
  var ease = (t) => {
    const x = clamp6(t);
    return x * x * (3 - 2 * x);
  };
  var STEP_TIME = 0.8;
  var VIEW_TIME = 6;
  var ShoulderState = class {
    id = "coast-sand";
    route = "maclehose";
    kind = "saiwan-steps";
    age = 0;
    acted = false;
    dragging = false;
    gesture = "tap";
    done = false;
    x = 0.5;
    y = 0.5;
    play;
    phase = { kind: "ready", idle: 0 };
    step = 0;
    cameraProgress = 0;
    hover = false;
    feedback = PROMPT;
    events = [];
    serial = 0;
    constructor(reduced2) {
      this.play = { type: "saiwan-lookout-14", progress: 0, complete: false, completedAt: null, reduced: reduced2 };
    }
    emit(type, at2, index = 0) {
      this.events.push({ serial: ++this.serial, type, x: clamp6(at2 / SCENE.width), index });
      if (this.events.length > 12)
        this.events.shift();
    }
  };
  function shoulderState(state3) {
    if (!(state3 instanceof ShoulderState))
      throw new Error("西湾山互动状态不匹配");
    return state3;
  }
  function accepts(s, at2) {
    if (s.phase.kind !== "ready")
      return false;
    for (let i = 1; i < FOOTHOLDS.length; i++) {
      const a = FOOTHOLDS[i - 1], b = FOOTHOLDS[i], dx = b.x - a.x, dy = b.y - a.y;
      const t = clamp6(((at2.x - a.x) * dx + (at2.y - a.y) * dy) / (dx * dx + dy * dy));
      if (Math.hypot(at2.x - mix(a.x, b.x, t), at2.y - mix(a.y, b.y, t)) <= 90)
        return true;
    }
    return false;
  }
  function actShoulder(s, input) {
    if (input.phase !== "press" || s.phase.kind !== "ready" || typeof input.x !== "number" || !Number.isFinite(input.x) || typeof input.y !== "number" || !Number.isFinite(input.y))
      return s;
    const at2 = { x: input.x, y: input.y };
    if (!accepts(s, at2)) {
      s.feedback = "轻点脚边的山路，跟着海风往上走。";
      return s;
    }
    s.acted = true;
    s.hover = false;
    s.phase = { kind: "climbing", to: 1, elapsed: 0, landed: false };
    s.feedback = "沿着石阶登高，海风从山肩外吹来。";
    return s;
  }
  function hoverShoulder(s, input) {
    s.hover = typeof input.x === "number" && typeof input.y === "number" && accepts(s, { x: input.x, y: input.y });
    return s;
  }
  function keyShoulder(s, key, phase) {
    if (!["Enter", " ", "ArrowUp", "ArrowRight"].includes(key))
      return null;
    if (phase === "down")
      actShoulder(s, { phase: "press", ...FOOTHOLDS[1], key: true });
    return s;
  }
  function walkProgress(s) {
    return s.phase.kind === "climbing" ? (s.step + ease(s.phase.elapsed / STEP_TIME)) / (FOOTHOLDS.length - 1) : s.step / (FOOTHOLDS.length - 1);
  }
  function actorPoint(s) {
    const phase = s.phase;
    if (phase.kind === "climbing") {
      const a = FOOTHOLDS[s.step], b = FOOTHOLDS[phase.to], t = ease(phase.elapsed / STEP_TIME);
      return { x: mix(a.x, b.x, t), y: mix(a.y, b.y, t) - (s.play.reduced ? 0 : Math.sin(Math.PI * t) * 4) };
    }
    return FOOTHOLDS[s.step];
  }
  function tickShoulder(s, dt) {
    if (s.done || !Number.isFinite(dt) || dt <= 0)
      return s;
    dt = Math.min(0.05, dt);
    s.age += dt;
    if (s.play.complete) {
      s.done = s.play.completedAt !== null && s.age - s.play.completedAt >= 1;
      return s;
    }
    const phase = s.phase;
    switch (phase.kind) {
      case "ready":
        phase.idle += dt;
        break;
      case "climbing": {
        phase.elapsed += dt;
        if (!phase.landed && phase.elapsed >= STEP_TIME * 0.82) {
          phase.landed = true;
          s.emit("coast-step-land", FOOTHOLDS[phase.to].x, phase.to);
        }
        if (phase.elapsed >= STEP_TIME) {
          s.step = phase.to;
          s.phase = s.step === FOOTHOLDS.length - 1 ? { kind: "view", elapsed: 0 } : { kind: "climbing", to: s.step + 1, elapsed: 0, landed: false };
          s.feedback = s.phase.kind === "view" ? "站在高处，望见白沙湾与蚺蛇尖。" : s.step < 4 ? "沿着石阶登高，海风从山肩外吹来。" : "转过山肩，海湾慢慢展开。";
          if (s.step === 5)
            s.emit("coast-sea-reveal", 0.6 * SCENE.width);
        }
        break;
      }
      case "view":
        phase.elapsed += dt;
        if (phase.elapsed >= VIEW_TIME) {
          s.phase = { kind: "finished" };
          s.play.complete = true;
          s.play.completedAt = s.age;
          s.play.progress = 1;
          s.emit("complete", LOOKOUT.x);
        }
        break;
      case "finished":
        break;
      default: {
        const exhaustive = phase;
        return exhaustive;
      }
    }
    const target = ease((walkProgress(s) - 0.18) / 0.82);
    s.cameraProgress = mix(s.cameraProgress, target, s.play.reduced ? 1 : 1 - Math.exp(-dt * 2.2));
    if (!s.play.complete)
      s.play.progress = walkProgress(s) * 0.8 + (s.phase.kind === "view" ? 0.18 * clamp6(s.phase.elapsed / VIEW_TIME) : 0);
    return s;
  }

  // .build/typescript/runtime/coast-memories/shoulder/pose-art.generated.js
  var SHOULDER_POSES = {
    "blue": [
      {
        "x": 80,
        "y": 4,
        "width": 300,
        "height": 439,
        "footX": 138.3165059284735,
        "footY": 435
      },
      {
        "x": 532,
        "y": 5,
        "width": 283,
        "height": 434,
        "footX": 183.1916584587168,
        "footY": 396
      },
      {
        "x": 960,
        "y": 4,
        "width": 280,
        "height": 436,
        "footX": 87.69340905104377,
        "footY": 432
      },
      {
        "x": 1431,
        "y": 5,
        "width": 280,
        "height": 435,
        "footX": 190.96598377281953,
        "footY": 417
      },
      {
        "x": 94,
        "y": 443,
        "width": 233,
        "height": 429,
        "footX": 165.32516494901574,
        "footY": 425
      },
      {
        "x": 479,
        "y": 489,
        "width": 324,
        "height": 370,
        "footX": 204.12,
        "footY": 366
      },
      {
        "x": 908,
        "y": 514,
        "width": 390,
        "height": 346,
        "footX": 245.7,
        "footY": 342
      },
      {
        "x": 1368,
        "y": 512,
        "width": 384,
        "height": 350,
        "footX": 241.92000000000002,
        "footY": 346
      }
    ],
    "braids": [
      {
        "x": 158,
        "y": 11,
        "width": 277,
        "height": 432,
        "footX": 138,
        "footY": 428
      },
      {
        "x": 566,
        "y": 16,
        "width": 274,
        "height": 415,
        "footX": 187.46434866828088,
        "footY": 406
      },
      {
        "x": 964,
        "y": 16,
        "width": 262,
        "height": 418,
        "footX": 89.56974282302644,
        "footY": 414
      },
      {
        "x": 1411,
        "y": 10,
        "width": 279,
        "height": 418,
        "footX": 192.18316072668358,
        "footY": 410
      },
      {
        "x": 155,
        "y": 443,
        "width": 220,
        "height": 427,
        "footX": 135.3892030619133,
        "footY": 423
      },
      {
        "x": 506,
        "y": 489,
        "width": 301,
        "height": 373,
        "footX": 189.63,
        "footY": 369
      },
      {
        "x": 940,
        "y": 506,
        "width": 340,
        "height": 359,
        "footX": 214.2,
        "footY": 355
      },
      {
        "x": 1378,
        "y": 512,
        "width": 339,
        "height": 353,
        "footX": 213.57,
        "footY": 349
      }
    ]
  };

  // .build/typescript/runtime/coast-memories/shoulder/layout.js
  function shoulderCamera(s, width, height) {
    const portrait = height > width, reveal = s.cameraProgress;
    const zoom = mix(portrait ? 1.13 : 1.55, 1, reveal);
    const focus = { x: mix(portrait ? 505 : 540, portrait ? 1e3 : SCENE.width / 2, reveal), y: mix(710, SCENE.height / 2, reveal) };
    return { ...coverCamera(width, height, SCENE, focus, zoom), portrait };
  }

  // .build/typescript/runtime/coast-memories/shoulder/view.js
  var ART_ROOT = "scenes/maclehose-saiwan-v13/";
  var ShoulderView = class {
    doc;
    directInput = true;
    canvas;
    contentState = "loading";
    disposed = false;
    character;
    lifecycle = new AbortController();
    observer = null;
    host = null;
    images = null;
    state = null;
    width = 1e3;
    height = 563;
    constructor(doc) {
      this.doc = doc;
      this.character = characterId(new URLSearchParams(doc.defaultView?.location.search).get("character")) ?? readCharacterId();
      this.canvas = doc.createElement("canvas");
      this.canvas.className = "coast-memory-canvas saiwan-steps-canvas";
      this.canvas.setAttribute("aria-hidden", "true");
    }
    resize() {
      if (!this.host || this.disposed)
        return;
      const r = this.host.getBoundingClientRect();
      this.width = Math.max(1, r.width);
      this.height = Math.max(1, r.height);
      const ratio = Math.min(2, this.doc.defaultView?.devicePixelRatio || 1, Math.sqrt(26e5 / (this.width * this.height)));
      this.canvas.width = Math.max(1, Math.round(this.width * ratio));
      this.canvas.height = Math.max(1, Math.round(this.height * ratio));
      if (this.state)
        this.paint(this.state);
    }
    async mount(host, cache2) {
      this.host = host;
      host.append(this.canvas);
      this.observer = new ResizeObserver(() => this.resize());
      this.observer.observe(host);
      this.resize();
      const { signal } = this.lifecycle;
      const load = (file) => new Promise((resolve, reject) => {
        const asset = cache2?.request(file, "high");
        let image = null;
        const clean = () => {
          signal.removeEventListener("abort", abort);
          if (image)
            image.onload = image.onerror = null;
        };
        const abort = () => {
          clean();
          reject(new DOMException("已离开西湾山", "AbortError"));
        };
        if (signal.aborted) {
          abort();
          return;
        }
        signal.addEventListener("abort", abort, { once: true });
        if (asset)
          void asset.promise.then((entry) => {
            if (signal.aborted)
              return;
            clean();
            if (entry.state === "ready")
              resolve(entry.image);
            else
              reject(new Error("山海画作暂未展开"));
          });
        else {
          image = this.doc.createElement("img");
          image.decoding = "async";
          image.onload = () => {
            if (!image)
              return;
            clean();
            resolve(image);
          };
          image.onerror = () => {
            clean();
            reject(new Error("山海画作暂未展开"));
          };
          image.src = file;
        }
      });
      try {
        if (!this.canvas.getContext("2d"))
          throw new Error("画面暂不支持绘制");
        const [panorama, terrain, shoulder, poses, walk] = await Promise.all([
          load(ART_ROOT + "panorama.webp"),
          load(ART_ROOT + "terrain.webp"),
          load(ART_ROOT + "shoulder.webp"),
          load(ART_ROOT + `${this.character}-poses.webp`),
          load(CHARACTERS[this.character].walk.file)
        ]);
        if (this.disposed || signal.aborted)
          return;
        this.images = { panorama, terrain, shoulder, poses, walk };
        this.contentState = "ready";
      } catch {
        if (!this.disposed && !signal.aborted)
          this.contentState = "error";
      }
      if (!this.disposed) {
        host.setAttribute("aria-busy", "false");
        if (this.state)
          this.paint(this.state);
      }
    }
    input(input) {
      if (!this.state || typeof input.x !== "number" || typeof input.y !== "number")
        return input;
      const world = shoulderCamera(this.state, this.width, this.height).toWorld({ x: input.x * this.width, y: input.y * this.height });
      return { ...input, x: world.x, y: world.y, viewWidth: this.width, viewHeight: this.height };
    }
    person(ctx, s) {
      if (!this.images)
        return;
      const phase = s.phase, at2 = actorPoint(s), poses = SHOULDER_POSES[this.character];
      let index, facing = 1, walking = false;
      if (phase.kind === "climbing") {
        const t = clamp6(phase.elapsed / STEP_TIME);
        facing = FOOTHOLDS[phase.to].x < FOOTHOLDS[s.step].x ? -1 : 1;
        walking = phase.to > 5;
        index = walking ? Math.floor(s.age * 9) % 8 : (phase.to % 2 ? 0 : 2) + (t >= 0.56 ? 1 : 0);
      } else {
        index = 4;
        if (phase.kind === "ready")
          facing = -1;
      }
      const standingHeight = (poses[0].height + poses[1].height + poses[2].height + poses[3].height) / 4;
      const scale = 128 / standingHeight;
      ctx.save();
      ctx.translate(at2.x, at2.y);
      ctx.fillStyle = "#3e514a30";
      ctx.beginPath();
      ctx.ellipse(0, 3, 21, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.scale(facing, 1);
      if (walking) {
        const appearance = CHARACTERS[this.character].walk, frame2 = appearance.frames[index], walkScale = 128 / appearance.frames[0].height;
        ctx.drawImage(this.images.walk, frame2.x, frame2.y, frame2.width, frame2.height, -frame2.footX * walkScale, -frame2.footY * walkScale, frame2.width * walkScale, frame2.height * walkScale);
      } else {
        const frame2 = poses[index];
        ctx.drawImage(this.images.poses, frame2.x, frame2.y, frame2.width, frame2.height, -frame2.footX * scale, -frame2.footY * scale, frame2.width * scale, frame2.height * scale);
      }
      ctx.restore();
    }
    footprint(ctx, at2, strength, facing) {
      ctx.save();
      ctx.translate(at2.x, at2.y);
      ctx.rotate(facing < 0 ? -0.35 : 0.35);
      ctx.globalAlpha = strength;
      ctx.fillStyle = "#66725c";
      ctx.beginPath();
      ctx.ellipse(0, -3, 5, 11, 0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#f9edcc";
      ctx.beginPath();
      ctx.ellipse(0, -5, 2.3, 6, 0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    hints(ctx, s) {
      if (s.phase.kind === "ready") {
        const next = FOOTHOLDS[1], hint = s.hover || s.phase.idle > 2.5;
        if (hint)
          this.footprint(ctx, next, s.hover ? 0.54 : 0.28 + (s.play.reduced ? 0 : Math.sin(s.age * 1.5) * 0.05), next.x - FOOTHOLDS[s.step].x);
      }
    }
    sea(ctx, s) {
      if (s.play.reduced)
        return;
      ctx.save();
      ctx.strokeStyle = "#e1f0e979";
      ctx.lineWidth = 1;
      for (let i = 0; i < 13; i++) {
        const x = 1290 + i * 87 % 355, y = 323 + i * 13 % 78, drift = Math.sin(s.age * 0.45 + i) * 3;
        ctx.globalAlpha = 0.24 + Math.sin(s.age * 0.6 + i) * 0.1;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.quadraticCurveTo(x + 11 + drift, y - 2, x + 28 + drift, y - 1);
        ctx.stroke();
      }
      ctx.restore();
    }
    paint(s) {
      this.state = s;
      if (this.disposed)
        return;
      const ctx = this.canvas.getContext("2d");
      if (!ctx) {
        this.contentState = "error";
        return;
      }
      ctx.setTransform(this.canvas.width / this.width, 0, 0, this.canvas.height / this.height, 0, 0);
      ctx.fillStyle = "#f0ecdc";
      ctx.fillRect(0, 0, this.width, this.height);
      if (!this.images)
        return;
      const camera = shoulderCamera(s, this.width, this.height), reveal = s.cameraProgress;
      ctx.save();
      ctx.translate(camera.x, camera.y);
      ctx.scale(camera.scale, camera.scale);
      ctx.drawImage(this.images.panorama, 0, 0, SCENE.width, SCENE.height);
      this.sea(ctx, s);
      ctx.save();
      ctx.translate(mix(0, -90, reveal), 0);
      ctx.scale(mix(1.1, 1, reveal), mix(1.1, 1, reveal));
      ctx.drawImage(this.images.shoulder, 0, 0, SCENE.width, SCENE.height);
      ctx.restore();
      ctx.drawImage(this.images.terrain, 0, 0, SCENE.width, SCENE.height);
      this.hints(ctx, s);
      this.person(ctx, s);
      if (s.phase.kind === "climbing" && s.phase.landed && !s.play.reduced) {
        const at2 = actorPoint(s), t = clamp6((s.phase.elapsed / STEP_TIME - 0.82) / 0.18);
        ctx.save();
        ctx.globalAlpha = (1 - t) * 0.2;
        ctx.fillStyle = "#c4b694";
        for (let i = 0; i < 4; i++) {
          ctx.beginPath();
          ctx.arc(at2.x + (i - 1.5) * (5 + t * 7), at2.y - t * (3 + i % 2 * 3), 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
      ctx.restore();
      this.host?.setAttribute("data-scene-ready", String(this.contentState === "ready"));
    }
    dispose() {
      if (this.disposed)
        return;
      this.disposed = true;
      this.lifecycle.abort();
      this.observer?.disconnect();
      this.canvas.remove();
      this.canvas.width = this.canvas.height = 1;
      this.images = null;
      this.state = null;
      this.host = null;
    }
  };
  function shoulderView(refs) {
    if (!(refs instanceof ShoulderView))
      throw new Error("西湾山画面不匹配");
    return refs;
  }

  // .build/typescript/runtime/coast-memories/shoulder/adapter.js
  function createSaiwanShoulder(dom2) {
    const { get: $2, text } = dom2;
    return {
      input: "direct",
      soundTheme: "footsteps",
      create: (_entry, options) => new ShoulderState(options.reduced),
      act: (state3, input) => actShoulder(shoulderState(state3), input),
      move: (state3, input) => hoverShoulder(shoulderState(state3), input),
      hover: (state3, input) => hoverShoulder(shoulderState(state3), input),
      release(state3) {
        shoulderState(state3).hover = false;
        return state3;
      },
      tick: (state3, dt) => tickShoulder(shoulderState(state3), dt),
      draw: () => new ShoulderView(dom2.document),
      paint: (refs, state3) => shoulderView(refs).paint(shoulderState(state3)),
      instruction: () => PROMPT,
      status: (state3) => shoulderState(state3).feedback,
      outcome(state3, entry) {
        const s = shoulderState(state3);
        return { id: s.id, edition: entry.edition, earned: s.play.complete && s.play.completedAt !== null, interaction: "tap", memory: MEMORY, title: "转角见海" };
      },
      assets: () => ({ scene: ART_ROOT + "panorama.webp", front: ART_ROOT + "terrain.webp", hint: ART_ROOT + "shoulder.webp" }),
      mount: (refs, context) => shoulderView(refs).mount(context.host, context.cache),
      dispose(refs) {
        shoulderView(refs).dispose();
        delete $2("micro-panel").dataset.coastMemory;
        delete $2("micro-panel").dataset.coastPhase;
        delete $2("micro-panel").dataset.coastStep;
      },
      point: (refs, input) => shoulderView(refs).input(input),
      key: (state3, key, phase) => keyShoulder(shoulderState(state3), key, phase),
      present(state3, refs) {
        const s = shoulderState(state3), view3 = shoulderView(refs), panel = $2("micro-panel");
        panel.dataset.coastMemory = "saiwan-steps";
        panel.dataset.coastPhase = s.phase.kind;
        panel.dataset.coastStep = String(s.step);
        text("micro-place", "麦理浩径 · 西湾山");
        text("micro-title", "登高望海");
        text("micro-instruction", s.phase.kind === "ready" ? PROMPT : "跟着山路登高，看海湾在山肩外展开。");
        text("micro-result", view3.contentState === "error" ? "画作暂未展开，可以重试或继续山径。" : view3.contentState === "loading" ? "山肩外的海风，正吹开这一页。" : s.feedback);
        text("micro-skip", "继续山径 →");
        $2("micro-surface").setAttribute("aria-label", "轻点山路，人物会自动登高，停下望海。键盘 Enter 或空格开始，R 重试。");
        $2("micro-surface").setAttribute("aria-busy", String(view3.contentState === "loading"));
      }
    };
  }

  // .build/typescript/runtime/coast-memories/tide/model.js
  var SAND = [{ x: 65, y: 225 }, { x: 250, y: 260 }, { x: 490, y: 325 }, { x: 760, y: 400 }, { x: 970, y: 450 }, { x: 950, y: 545 }, { x: 750, y: 620 }, { x: 500, y: 580 }, { x: 280, y: 470 }, { x: 90, y: 350 }];
  var QUIET_TIME = 4.5;
  var WASH_TIME = 3.2;
  var shoreY = (x) => 145 + x * 0.25;
  var PROMPT2 = "在沙面上拖动画一画，停笔后让潮水收走。";
  var TideState = class {
    id = "coast-shell";
    route = "maclehose";
    kind = "ripple";
    age = 0;
    acted = false;
    dragging = false;
    gesture = "look";
    done = false;
    x = 500;
    y = 420;
    play;
    strokes = [];
    events = [];
    phase = { kind: "ready" };
    length = 0;
    points = 0;
    cursorVisible = false;
    serial = 0;
    constructor(reduced2) {
      this.play = { type: "coast-sand-18", progress: 0, complete: false, completedAt: null, reduced: reduced2 };
    }
    event(type) {
      this.events.push({ serial: ++this.serial, type, x: this.x / 1e3 });
      if (this.events.length > 8)
        this.events.shift();
    }
  };
  function tideState(state3) {
    if (!(state3 instanceof TideState))
      throw new Error("沙滩画笔状态不匹配");
    return state3;
  }
  function onSand(point2) {
    let inside2 = false;
    for (let i = 0, j = SAND.length - 1; i < SAND.length; j = i++) {
      const a = SAND[i], b = SAND[j];
      if (a.y > point2.y !== b.y > point2.y && point2.x < (b.x - a.x) * (point2.y - a.y) / (b.y - a.y) + a.x)
        inside2 = !inside2;
    }
    return inside2;
  }
  function at(input) {
    return typeof input.x === "number" && typeof input.y === "number" && Number.isFinite(input.x) && Number.isFinite(input.y) ? { x: input.x, y: input.y } : null;
  }
  function endStroke(state3) {
    if (state3.phase.kind !== "drawing")
      return;
    state3.dragging = false;
    state3.phase = state3.strokes.length ? { kind: "pause", quiet: 0 } : { kind: "ready" };
  }
  function actTide(state3, input) {
    if (input.phase === "release") {
      endStroke(state3);
      return state3;
    }
    if (!["ready", "pause"].includes(state3.phase.kind))
      return state3;
    const point2 = input.assist ? { x: state3.x, y: state3.y } : at(input);
    if (!point2 || !onSand(point2) || state3.points >= 6e3)
      return state3;
    if (!input.key)
      state3.cursorVisible = false;
    const stroke = [point2];
    state3.strokes.push(stroke);
    state3.points++;
    state3.x = point2.x;
    state3.y = point2.y;
    state3.phase = { kind: "drawing", stroke };
    state3.dragging = true;
    return state3;
  }
  function moveTide(state3, input) {
    if (state3.phase.kind !== "drawing")
      return state3;
    const point2 = at(input);
    if (!point2 || !onSand(point2)) {
      endStroke(state3);
      return state3;
    }
    const previous = state3.phase.stroke[state3.phase.stroke.length - 1];
    const distance4 = Math.hypot(point2.x - previous.x, point2.y - previous.y);
    if (distance4 < 0.5 || state3.points >= 6e3)
      return state3;
    state3.phase.stroke.push(point2);
    state3.points++;
    state3.length += distance4;
    state3.x = point2.x;
    state3.y = point2.y;
    state3.acted = true;
    state3.gesture = "drag";
    state3.play.progress = Math.min(0.65, state3.length / 160 * 0.65);
    return state3;
  }
  function cancelTide(state3) {
    if (state3.phase.kind === "drawing") {
      state3.strokes.pop();
      state3.length = 0;
      state3.points = 0;
      for (const stroke of state3.strokes) {
        state3.points += stroke.length;
        for (let i = 1; i < stroke.length; i++)
          state3.length += Math.hypot(stroke[i].x - stroke[i - 1].x, stroke[i].y - stroke[i - 1].y);
      }
      state3.phase = state3.strokes.length ? { kind: "pause", quiet: 0 } : { kind: "ready" };
      state3.play.progress = Math.min(0.65, state3.length / 160 * 0.65);
    } else if (state3.phase.kind === "pause")
      state3.phase.quiet = 0;
    state3.dragging = false;
    return state3;
  }
  function tickTide(state3, dt) {
    if (state3.done || !Number.isFinite(dt) || dt <= 0)
      return state3;
    dt = Math.min(0.1, dt);
    state3.age += dt;
    const phase = state3.phase;
    if (phase.kind === "pause") {
      phase.quiet += dt;
      if (state3.length >= 80 && phase.quiet >= QUIET_TIME) {
        state3.phase = { kind: "washing", elapsed: 0 };
        state3.event("water");
      }
    } else if (phase.kind === "washing") {
      phase.elapsed += dt;
      state3.play.progress = 0.65 + 0.35 * Math.min(1, phase.elapsed / WASH_TIME);
      if (phase.elapsed >= WASH_TIME) {
        state3.phase = { kind: "memory", elapsed: 0 };
        state3.play.progress = 1;
        state3.play.complete = true;
        state3.play.completedAt = state3.age;
        state3.event("complete");
      }
    } else if (phase.kind === "memory") {
      phase.elapsed += dt;
      state3.done = phase.elapsed >= 1.2;
    }
    return state3;
  }
  function tideFeedback(state3) {
    switch (state3.phase.kind) {
      case "ready":
        return PROMPT2;
      case "drawing":
        return "笔迹留在沙面上，慢慢画。";
      case "pause":
        return state3.length < 80 ? "再画长一点，让这一笔留在沙面。" : "还可以接着画，下一道浪还没到。";
      case "washing":
        return "潮水漫过笔迹，再轻轻退去。";
      case "memory":
        return "沙面重新平整，这一笔留进回忆里。";
      default: {
        const exhaustive = state3.phase;
        return exhaustive;
      }
    }
  }
  function keyTide(state3, key, phase) {
    if (key === " ") {
      if (phase === "up")
        endStroke(state3);
      else if (state3.phase.kind !== "drawing") {
        state3.cursorVisible = true;
        actTide(state3, { x: state3.x, y: state3.y, phase: "press", key: true });
      }
      return state3;
    }
    if (key === "Enter") {
      if (phase === "down") {
        state3.cursorVisible = true;
        state3.phase.kind === "drawing" ? endStroke(state3) : actTide(state3, { x: state3.x, y: state3.y, phase: "press", key: true });
      }
      return state3;
    }
    const direction = key === "ArrowLeft" ? { x: -16, y: 0 } : key === "ArrowRight" ? { x: 16, y: 0 } : key === "ArrowUp" ? { x: 0, y: -16 } : key === "ArrowDown" ? { x: 0, y: 16 } : null;
    if (!direction)
      return null;
    state3.cursorVisible = true;
    if (phase === "down") {
      const point2 = { x: state3.x + direction.x, y: state3.y + direction.y };
      if (onSand(point2)) {
        if (state3.phase.kind === "drawing")
          moveTide(state3, point2);
        else {
          state3.x = point2.x;
          state3.y = point2.y;
        }
      }
    }
    return state3;
  }

  // .build/typescript/runtime/coast-memories/tide/view.js
  var TIDE_SCENE = "scenes/maclehose-games-v5/beach.webp";
  var tideCamera = (width, height) => coverCamera(width, height, { width: 1e3, height: 667 }, { x: 590, y: 275 });
  var TideView = class {
    doc;
    directInput = true;
    canvas;
    contentState = "loading";
    disposed = false;
    observer = null;
    host = null;
    image = null;
    state = null;
    width = 1e3;
    height = 667;
    pending = new AbortController();
    constructor(doc) {
      this.doc = doc;
      this.canvas = doc.createElement("canvas");
      this.canvas.className = "coast-memory-canvas";
      this.canvas.setAttribute("aria-hidden", "true");
    }
    resize() {
      if (!this.host || this.disposed)
        return;
      const rect = this.host.getBoundingClientRect();
      this.width = Math.max(1, rect.width);
      this.height = Math.max(1, rect.height);
      const dpr = Math.min(2, this.doc.defaultView?.devicePixelRatio || 1, Math.sqrt(26e5 / (this.width * this.height)));
      this.canvas.width = Math.max(1, Math.round(this.width * dpr));
      this.canvas.height = Math.max(1, Math.round(this.height * dpr));
      if (this.state)
        this.paint(this.state);
    }
    async mount(host, cache2) {
      this.host = host;
      host.append(this.canvas);
      this.observer = new ResizeObserver(() => this.resize());
      this.observer.observe(host);
      this.resize();
      try {
        const asset = cache2?.request(TIDE_SCENE, "high");
        if (asset) {
          const loaded = await asset.promise;
          if (loaded.state !== "ready")
            throw new Error("海滩画作暂未展开");
          this.image = loaded.image;
        } else
          this.image = await new Promise((resolve, reject) => {
            const image = this.doc.createElement("img"), { signal } = this.pending;
            const cleanup = () => {
              image.onload = image.onerror = null;
              signal.removeEventListener("abort", abort);
            };
            const abort = () => {
              cleanup();
              reject(new DOMException("已离开海滩", "AbortError"));
            };
            if (signal.aborted) {
              abort();
              return;
            }
            signal.addEventListener("abort", abort, { once: true });
            image.decoding = "async";
            image.onload = () => {
              cleanup();
              resolve(image);
            };
            image.onerror = () => {
              cleanup();
              reject(new Error("海滩画作暂未展开"));
            };
            image.src = TIDE_SCENE;
          });
        if (!this.disposed)
          this.contentState = this.canvas.getContext("2d") ? "ready" : "error";
      } catch {
        if (!this.disposed)
          this.contentState = "error";
      }
      if (!this.disposed) {
        host.setAttribute("aria-busy", "false");
        if (this.state)
          this.paint(this.state);
      } else
        this.image = null;
    }
    input(input) {
      if (typeof input.x !== "number" || typeof input.y !== "number")
        return input;
      return { ...input, ...tideCamera(this.width, this.height).toWorld({ x: input.x * this.width, y: input.y * this.height }) };
    }
    sand(ctx) {
      ctx.beginPath();
      SAND.forEach((point2, i) => i ? ctx.lineTo(point2.x, point2.y) : ctx.moveTo(point2.x, point2.y));
      ctx.closePath();
    }
    path(ctx, stroke) {
      if (!stroke.length)
        return;
      ctx.beginPath();
      ctx.moveTo(stroke[0].x, stroke[0].y);
      if (stroke.length === 1)
        ctx.lineTo(stroke[0].x + 0.5, stroke[0].y);
      for (let i = 1; i < stroke.length; i++) {
        const point2 = stroke[i], next = stroke[i + 1];
        if (next)
          ctx.quadraticCurveTo(point2.x, point2.y, (point2.x + next.x) / 2, (point2.y + next.y) / 2);
        else
          ctx.lineTo(point2.x, point2.y);
      }
      ctx.stroke();
    }
    ink(ctx, state3) {
      ctx.save();
      ctx.lineJoin = ctx.lineCap = "round";
      for (const [color, width, dx, dy] of [["#87694242", 6, 1, 1.5], ["#89633f", 3.7, 0, 0], ["#5e482b99", 1.3, 0, 0.3], ["#fff0caaa", 0.8, -0.7, -1.5]]) {
        ctx.save();
        ctx.translate(dx, dy);
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        for (const stroke of state3.strokes)
          this.path(ctx, stroke);
        ctx.restore();
      }
      ctx.restore();
    }
    paint(state3) {
      this.state = state3;
      if (this.disposed)
        return;
      const ctx = this.canvas.getContext("2d");
      if (!ctx) {
        this.contentState = "error";
        return;
      }
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      const camera = tideCamera(this.width, this.height), ratio = this.canvas.width / this.width;
      ctx.setTransform(camera.scale * ratio, 0, 0, camera.scale * ratio, camera.x * ratio, camera.y * ratio);
      ctx.fillStyle = "#eee4c6";
      ctx.fillRect(0, 0, 1e3, 667);
      if (this.image)
        ctx.drawImage(this.image, 0, 0, 1e3, 667);
      if (state3.phase.kind === "memory")
        return;
      ctx.save();
      this.sand(ctx);
      ctx.clip();
      if (state3.phase.kind === "washing") {
        const t = Math.min(1, state3.phase.elapsed / WASH_TIME);
        if (state3.play.reduced) {
          ctx.globalAlpha = 1 - t;
          this.ink(ctx, state3);
        } else {
          const reach = Math.min(1, t / 0.58), level = t < 0.58 ? reach : 1 - (t - 0.58) / 0.42;
          const front = (x, advance) => shoreY(x) + advance * 470 + Math.sin(x * 0.025 + state3.age) * 4;
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(0, front(0, reach));
          for (let x = 0; x <= 1e3; x += 20)
            ctx.lineTo(x, front(x, reach));
          ctx.lineTo(1e3, 700);
          ctx.lineTo(0, 700);
          ctx.closePath();
          ctx.clip();
          this.ink(ctx, state3);
          ctx.restore();
          ctx.restore();
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(1e3, 0);
          ctx.lineTo(1e3, 550);
          for (const point2 of SAND.slice(6))
            ctx.lineTo(point2.x, point2.y);
          ctx.lineTo(0, 320);
          ctx.closePath();
          ctx.clip();
          ctx.globalAlpha = Math.min(1, t * 10, (1 - t) * 10);
          ctx.beginPath();
          ctx.moveTo(0, shoreY(0) - 15);
          for (let x = 0; x <= 1e3; x += 20)
            ctx.lineTo(x, shoreY(x) - 15);
          for (let x = 1e3; x >= 0; x -= 20)
            ctx.lineTo(x, front(x, level));
          ctx.closePath();
          const water2 = ctx.createLinearGradient(0, 170, 0, 650);
          water2.addColorStop(0, "#83c5bc00");
          water2.addColorStop(0.4, "#94cbb948");
          water2.addColorStop(1, "#c6dcc95c");
          ctx.fillStyle = water2;
          ctx.fill();
          ctx.beginPath();
          for (let x = 0; x <= 1e3; x += 10)
            x ? ctx.lineTo(x, front(x, level)) : ctx.moveTo(x, front(x, level));
          ctx.shadowColor = "#fff8e999";
          ctx.shadowBlur = 7;
          ctx.strokeStyle = "#fff8e9c9";
          ctx.lineWidth = 3;
          ctx.lineCap = "round";
          ctx.stroke();
        }
      } else
        this.ink(ctx, state3);
      ctx.restore();
      if (state3.cursorVisible && state3.phase.kind !== "washing") {
        ctx.strokeStyle = "#655439c9";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(state3.x - 4, state3.y);
        ctx.lineTo(state3.x + 4, state3.y);
        ctx.moveTo(state3.x, state3.y - 4);
        ctx.lineTo(state3.x, state3.y + 4);
        ctx.stroke();
      }
    }
    dispose() {
      this.disposed = true;
      this.pending.abort();
      this.observer?.disconnect();
      this.canvas.remove();
      this.canvas.width = this.canvas.height = 1;
      this.host = null;
      this.image = null;
      this.state = null;
    }
  };
  function tideView(refs) {
    if (!(refs instanceof TideView))
      throw new Error("沙滩画笔界面不匹配");
    return refs;
  }

  // .build/typescript/runtime/coast-memories/tide/adapter.js
  function createTide(dom2) {
    const { get: $2, text } = dom2;
    return {
      input: "direct",
      soundTheme: "creek",
      create: (_entry, options) => new TideState(options.reduced),
      act: (state3, input) => actTide(tideState(state3), input),
      move: (state3, input) => moveTide(tideState(state3), input),
      release: (state3) => cancelTide(tideState(state3)),
      tick: (state3, dt) => tickTide(tideState(state3), dt),
      draw: () => new TideView(dom2.document),
      paint: (refs, state3) => tideView(refs).paint(tideState(state3)),
      assets: () => ({ scene: TIDE_SCENE }),
      mount: (refs, { host, cache: cache2 }) => tideView(refs).mount(host, cache2),
      point: (refs, input) => tideView(refs).input(input),
      key: (state3, key, phase) => keyTide(tideState(state3), key, phase),
      instruction: () => PROMPT2,
      status: (state3) => tideFeedback(tideState(state3)),
      outcome(state3, entry) {
        const s = tideState(state3);
        return { id: s.id, edition: entry.edition, earned: s.play.complete && s.play.completedAt !== null, interaction: "drag", title: "潮汐收笔", memory: "我在咸田湾的沙面上慢慢画了几笔，看潮水漫过笔迹，再一点点退去。沙面平整了，这一刻却留了下来。" };
      },
      dispose(refs) {
        tideView(refs).dispose();
        for (const key of ["coastMemory", "coastPhase", "tideStrokes", "tidePoints"])
          delete $2("micro-panel").dataset[key];
      },
      present(state3, refs) {
        const s = tideState(state3), panel = $2("micro-panel");
        panel.dataset.coastMemory = "tide";
        panel.dataset.coastPhase = s.phase.kind;
        panel.dataset.tideStrokes = String(s.strokes.filter((stroke) => stroke.length > 1).length);
        panel.dataset.tidePoints = String(s.points);
        text("micro-title", "留给下一道浪的一笔");
        text("micro-instruction", PROMPT2);
        text("micro-skip", "继续山径 →");
        text("micro-result", refs.contentState === "ready" ? tideFeedback(s) : refs.contentState === "error" ? "海滩暂未展开，可以重试或继续山径。" : "海滩水彩正在展开……");
        $2("micro-surface").setAttribute("aria-label", PROMPT2 + " 键盘辅助：方向键移动笔尖，按住空格画，松开收笔，R 重试。");
      }
    };
  }

  // .build/typescript/journey/art-session.js
  var PROTOCOL = "trailbound.art.v1";
  function artMessage(session2, type, collected2 = 0) {
    return type === "ready" || type === "dispose" ? { ...session2, protocol: PROTOCOL, type } : { ...session2, protocol: PROTOCOL, type, collected: collected2 };
  }
  function readArtMessage(value, current) {
    if (!current || !value || typeof value !== "object" || !("protocol" in value) || value.protocol !== PROTOCOL || !("session" in value) || value.session !== current.session || !("entry" in value) || value.entry !== current.entry || !("type" in value))
      return null;
    if (value.type === "ready" || value.type === "dispose")
      return artMessage(current, value.type);
    if ((value.type === "collected" || value.type === "close") && "collected" in value && typeof value.collected === "number" && Number.isSafeInteger(value.collected) && value.collected >= 0 && value.collected <= 1) {
      return artMessage(current, value.type, value.collected);
    }
    return null;
  }

  // .build/typescript/runtime/day-memories/model.js
  var DAY_MEMORIES = {
    "valley-moss": { kind: "reflection", title: "把枝影留在水里", prompt: "轻拖水中的倒影，让岸上的枯树与枝影相接。", memory: "我把错开的枝影轻轻合上，清水里又长出一棵树。" },
    "valley-bridge": { kind: "lichen", title: "石头上，也有一片森林", prompt: "拖动透镜，慢慢看过红石表面的细小纹理。", memory: "红石的纹理在透镜里展开，山野也藏在很小的地方。" },
    "valley-reflection": { kind: "vista", title: "走出森林，雪山就在眼前", prompt: "向两边拨开林缘，给远处的雪山让出视野。", memory: "林缘退开，溪谷、草甸和雪山在眼前连成了一幅画。" },
    "bamboo-drop": { kind: "rain", title: "接一小段竹雨", prompt: "移动竹筒，接住叶尖落下的四滴雨，听它们落成一段短音。", memory: "四滴竹雨落进筒里，一深一浅，像山林写来的短曲。" },
    "bamboo-step": { kind: "steps", title: "拂开落叶，沿古道上山", prompt: "轻扫石阶上的落叶，露出脚下的路，再看旅人走过山弯。", memory: "拂开雨后的落叶，石阶重新显出轮廓，脚步沿着竹林上山。" },
    "bamboo-leaf": { kind: "wind", title: "借一阵风，送出叶笺", prompt: "看叶梢的方向，等风朝向远山时轻点，送出一枚叶笺。", memory: "我等来一阵顺风，看一枚叶笺穿过竹隙，慢慢飞向远山。" },
    "westlake-floating-leaf": { kind: "leaf", title: "推一圈水纹，送落叶过溪", prompt: "轻点落叶后方的水面，用水纹把它推向下游。", memory: "水纹轻轻推着落叶，绕过溪石，带着我的目光漂向下游。" },
    "westlake-stones": { kind: "stones", title: "踏石听溪", prompt: "轻点前方相连的溪石，让旅人走过浅溪，听脚下的水声。", memory: "我顺着三块相连的溪石走过去，水声在脚边一近一远。" },
    "westlake-tea": { kind: "tea", title: "一芽两叶，留一页春天", prompt: "认出一枚细嫩的芽和两片嫩叶，点选它们留在手帐里。", memory: "一枚嫩芽和两片新叶，在纸上拼成了今天的春天。" },
    "westlake-eaves": { kind: "brew", title: "慢慢注水，等一盏茶", prompt: "按住茶盏注水，水面过半后松手，看茶叶慢慢舒展。", memory: "水温让叶子慢慢舒展。村口的一盏茶，收住了今天的溪声。" }
  };
  function dayMemoryId(value) {
    return Object.hasOwn(DAY_MEMORIES, value);
  }
  var STONES = [{ x: 0.34, y: 0.79 }, { x: 0.52, y: 0.69 }, { x: 0.69, y: 0.58 }];
  var TEA = [
    { x: 0.28, y: 0.46, young: true, bud: true },
    { x: 0.52, y: 0.46, young: false, bud: false },
    { x: 0.74, y: 0.46, young: true, bud: false },
    { x: 0.28, y: 0.73, young: false, bud: false },
    { x: 0.51, y: 0.73, young: true, bud: false },
    { x: 0.74, y: 0.73, young: false, bud: false }
  ];
  var STEP_LEAVES = Array.from({ length: 12 }, (_, i) => ({ x: 0.38 + i % 4 * 0.085 + Math.floor(i / 4) * 0.05, y: 0.82 - Math.floor(i / 4) * 0.13 }));
  var RAIN = [0.28, 0.67, 0.43, 0.72];
  var clamp7 = (n, min = 0, max = 1) => Math.max(min, Math.min(max, n));
  function sceneFor(id2) {
    switch (DAY_MEMORIES[id2].kind) {
      case "reflection":
        return { kind: "reflection", offset: 0.23, still: 0 };
      case "lichen":
        return { kind: "lichen", cells: /* @__PURE__ */ new Set() };
      case "vista":
        return { kind: "vista", opened: 0 };
      case "rain":
        return { kind: "rain", cup: 0.5, target: 0.5, drop: 0.16, count: 0, wait: 0.8 };
      case "steps":
        return { kind: "steps", cleared: /* @__PURE__ */ new Set() };
      case "wind":
        return { kind: "wind", gust: 0 };
      case "leaf":
        return { kind: "leaf", distance: 0, impulse: 0 };
      case "stones":
        return { kind: "stones", index: 0, walking: 0 };
      case "tea":
        return { kind: "tea", picked: /* @__PURE__ */ new Set() };
      case "brew":
        return { kind: "brew", water: 0, steep: 0, released: false };
    }
  }
  var DayMemoryState = class {
    reduced;
    id;
    route;
    kind = "day-memory";
    scene;
    play = { type: "day-memory", progress: 0, complete: false, completedAt: 0 };
    age = 0;
    acted = false;
    dragging = false;
    gesture = "tap";
    done = false;
    x = 0.5;
    y = 0.65;
    phase = "play";
    reveal = 0;
    feedback;
    sounds = 0;
    constructor(entry, reduced2) {
      this.reduced = reduced2;
      if (!dayMemoryId(entry.id))
        throw new Error("未知山野互动");
      this.id = entry.id;
      this.route = entry.route;
      this.scene = sceneFor(this.id);
      this.feedback = DAY_MEMORIES[this.id].prompt;
    }
    found() {
      this.phase = "reveal";
      this.reveal = 0;
      this.dragging = false;
      this.play.progress = 1;
      this.feedback = "把这一刻多留一会儿…";
      this.sounds++;
    }
    input(p2, move = false) {
      if (p2.phase === "release") {
        this.dragging = false;
        if (this.scene.kind === "brew" && this.scene.water >= 0.45)
          this.scene.released = true;
        return this;
      }
      if (this.phase !== "play" || this.done || p2.action === "outside-scene")
        return this;
      const previous = this.x;
      this.x = clamp7(p2.x ?? this.x);
      this.y = clamp7(p2.y ?? this.y);
      this.acted = true;
      this.dragging = move || p2.phase === "press";
      this.gesture = move ? "drag" : "tap";
      const s = this.scene;
      switch (s.kind) {
        case "reflection":
          if (move && this.y > 0.48) {
            s.offset = clamp7(s.offset + this.x - previous, -0.35, 0.35);
            s.still = 0;
            this.play.progress = 1 - Math.min(1, Math.abs(s.offset) / 0.23);
          }
          break;
        case "lichen": {
          const u = (this.x - 0.25) / 0.5, v = (this.y - 0.35) / 0.48;
          if (u >= 0 && u < 1 && v >= 0 && v < 1) {
            s.cells.add(Math.floor(u * 4) + Math.floor(v * 3) * 4);
            this.play.progress = s.cells.size / 8;
          }
          if (s.cells.size >= 8)
            this.found();
          break;
        }
        case "vista":
          if (move) {
            s.opened = clamp7(s.opened + Math.abs(this.x - previous) * 1.5);
            this.play.progress = s.opened;
            if (s.opened >= 1)
              this.found();
          }
          break;
        case "rain":
          s.target = clamp7(this.x, 0.16, 0.84);
          break;
        case "steps":
          STEP_LEAVES.forEach((leaf2, i) => {
            if (Math.hypot(this.x - leaf2.x, this.y - leaf2.y) < 0.09)
              s.cleared.add(i);
          });
          this.play.progress = s.cleared.size / 10;
          if (s.cleared.size >= 10)
            this.found();
          break;
        case "wind":
          if (!move && s.gust > 0.05)
            this.found();
          else
            this.feedback = "等叶梢朝向远山，再轻点送出。";
          break;
        case "leaf": {
          const leaf2 = leafPosition(s.distance);
          if (this.x < leaf2.x + 0.05 && Math.hypot(this.x - leaf2.x, this.y - leaf2.y) < 0.25) {
            s.impulse = Math.min(1, s.impulse + 0.48);
            this.sounds++;
            this.feedback = "水纹推开了，再从落叶后方送它一程。";
          }
          break;
        }
        case "stones":
          if (!move && s.walking === 0 && s.index < STONES.length && Math.hypot(this.x - STONES[s.index].x, this.y - STONES[s.index].y) < 0.1) {
            s.walking = 1e-3;
            this.sounds++;
          }
          break;
        case "tea":
          if (!move) {
            const i = TEA.findIndex((t) => Math.hypot(t.x - this.x, t.y - this.y) < 0.105);
            if (i >= 0 && TEA[i].young) {
              if (!s.picked.has(i))
                this.sounds++;
              s.picked.add(i);
              this.play.progress = s.picked.size / 3;
              if (s.picked.size === 3)
                this.found();
            } else
              this.feedback = "嫩芽细长，嫩叶更小、更浅绿。再看看。";
          }
          break;
        case "brew":
          if (!s.released)
            this.dragging = true;
          break;
      }
      this.play.progress = clamp7(this.play.progress);
      return this;
    }
    release() {
      this.dragging = false;
      return this;
    }
    tick(dt) {
      if (this.done)
        return this;
      this.age += dt;
      if (this.play.complete) {
        this.done = this.age - this.play.completedAt >= 1.2;
        return this;
      }
      if (this.phase === "reveal") {
        this.reveal += dt;
        const duration = this.reduced ? 1.5 : this.scene.kind === "vista" || this.scene.kind === "steps" || this.scene.kind === "wind" ? 5 : 2.6;
        if (this.reveal >= duration) {
          this.play.complete = true;
          this.play.completedAt = this.age;
          this.feedback = "已留住这一刻，正在收进手帐…";
        }
        return this;
      }
      const s = this.scene;
      if (s.kind === "wind")
        s.gust = Math.sin(this.age * 0.9);
      if (!this.acted)
        return this;
      if (s.kind === "reflection" && Math.abs(s.offset) < 0.035 && !this.dragging) {
        s.still += dt;
        if (s.still > 0.8)
          this.found();
      }
      if (s.kind === "rain") {
        s.cup += (s.target - s.cup) * (1 - Math.exp(-dt * 12));
        if (s.wait > 0)
          s.wait -= dt;
        else {
          s.drop += dt * 0.23;
          if (s.drop >= 0.73) {
            if (Math.abs(s.cup - RAIN[s.count]) < 0.12) {
              s.count++;
              this.sounds++;
              this.play.progress = s.count / 4;
              this.feedback = `接住了 ${s.count} 声竹雨`;
            } else
              this.feedback = "雨落在筒旁了，下一滴还会从这片叶尖落下。";
            s.drop = 0.16;
            s.wait = 0.55;
            if (s.count === 4)
              this.found();
          }
        }
      }
      if (s.kind === "leaf") {
        s.distance = clamp7(s.distance + s.impulse * dt * 0.4);
        s.impulse = Math.max(0, s.impulse - dt * 0.22);
        this.play.progress = s.distance;
        if (s.distance >= 1)
          this.found();
      }
      if (s.kind === "stones" && s.walking > 0) {
        s.walking += dt / 1.2;
        if (s.walking >= 1) {
          s.walking = 0;
          s.index++;
          this.play.progress = s.index / 3;
          this.feedback = "下一块溪石，就在前面。";
          if (s.index === 3)
            this.found();
        }
      }
      if (s.kind === "brew") {
        if (this.dragging && !s.released)
          s.water = clamp7(s.water + dt * 0.3);
        if (s.water >= 0.45 && !s.released)
          this.feedback = "水面已经过半，可以松手，等茶叶舒展。";
        if (s.released) {
          s.steep += dt;
          this.feedback = "茶叶慢慢舒展，溪声还在窗外。";
          if (s.steep >= 4)
            this.found();
        }
        this.play.progress = s.released ? 0.45 + 0.55 * clamp7(s.steep / 4) : Math.min(0.45, s.water);
      }
      return this;
    }
    key(key, phase) {
      const supported = ["Enter", " ", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"];
      if (!supported.includes(key))
        return null;
      if (phase === "up")
        return this.input({ phase: "release" });
      if (key.startsWith("Arrow"))
        return this.input({ x: this.x + (key === "ArrowLeft" ? -0.065 : key === "ArrowRight" ? 0.065 : 0), y: this.y + (key === "ArrowUp" ? -0.09 : key === "ArrowDown" ? 0.09 : 0) }, true).release();
      const s = this.scene;
      if (s.kind === "reflection")
        return this.input({ x: this.x - s.offset, y: 0.65 }, true).release();
      if (s.kind === "lichen") {
        const i = Array.from({ length: 12 }, (_, i2) => i2).find((i2) => !s.cells.has(i2)) ?? 0;
        return this.input({ x: 0.25 + (i % 4 + 0.5) * 0.125, y: 0.35 + (Math.floor(i / 4) + 0.5) * 0.16 });
      }
      if (s.kind === "vista")
        return this.input({ x: this.x < 0.5 ? 0.9 : 0.1 }, true).release();
      if (s.kind === "rain")
        return this.input({ x: RAIN[Math.min(3, s.count)] });
      if (s.kind === "steps") {
        const i = STEP_LEAVES.findIndex((_, i2) => !s.cleared.has(i2));
        return this.input(STEP_LEAVES[Math.max(0, i)], true).release();
      }
      if (s.kind === "leaf") {
        const p2 = leafPosition(s.distance);
        return this.input({ x: p2.x - 0.08, y: p2.y });
      }
      if (s.kind === "stones")
        return this.input(STONES[Math.min(2, s.index)]);
      if (s.kind === "tea")
        return this.input(TEA.find((t, i) => t.young && !s.picked.has(i)) ?? {});
      return this.input({ phase: "press" });
    }
  };
  function rainX(state3) {
    return state3.scene.kind === "rain" ? RAIN[Math.min(3, state3.scene.count)] : 0.5;
  }
  function leafPosition(t) {
    return { x: 0.24 + t * 0.53, y: 0.77 - t * 0.25 + Math.sin(t * Math.PI * 2) * 0.04 };
  }

  // .build/typescript/content/westlake-scenes.js
  var WESTLAKE_SCENES = {
    "westlake-floating-leaf": {
      kind: "leaf",
      place: "九溪溪谷",
      background: "scenes/westlake-journey-v3/forest-pool.webp",
      focus: { x: 0.5, y: 0.66 },
      portraitFocus: { x: 0.5, y: 0.5 }
    },
    "westlake-stones": {
      kind: "stones",
      place: "九溪十八涧",
      background: "scenes/day-route-v2/westlake.webp",
      focus: { x: 0.48, y: 0.82 },
      portraitFocus: { x: 0.49, y: 0.65 }
    },
    "westlake-tea": {
      kind: "tea",
      place: "龙井茶园",
      background: "scenes/westlake-v1.webp",
      focus: { x: 0.74, y: 0.13 },
      portraitFocus: { x: 0.75, y: 0.12 }
    },
    "westlake-eaves": {
      kind: "brew",
      place: "龙井村口",
      background: "scenes/westlake-journey-v3/village-tea.webp",
      focus: { x: 0.5, y: 0.65 },
      portraitFocus: { x: 0.54, y: 0.5 }
    }
  };
  function isWestlakeSceneId(id2) {
    return Object.hasOwn(WESTLAKE_SCENES, id2);
  }

  // .build/typescript/runtime/day-memories/westlake-layout.js
  function westlakeField(kind, width, height) {
    switch (kind) {
      case "leaf":
        return { x: 0, y: 0.25, width: 1, height: 0.72 };
      case "stones":
        return { x: 0.04, y: 0.31, width: 0.92, height: 0.65 };
      case "tea":
        return { x: 0.03, y: 0.18, width: 0.94, height: 0.9 };
      case "brew": {
        const size = westlakeCupSize(width, height);
        return { x: 0.5 - size / width * 0.44, y: 0.72 - size / height * 0.43, width: size / width * 0.88, height: size / height * 0.88 };
      }
    }
  }
  function westlakeCupSize(width, height) {
    return Math.min(width * 0.72, height * 0.48, 390);
  }
  function westlakePoint(field, point2) {
    return { x: field.x + point2.x * field.width, y: field.y + point2.y * field.height };
  }
  function westlakeInput(kind, input) {
    if (input.x === void 0 || input.y === void 0 || input.phase === "release" || input.action === "outside-scene")
      return input;
    const field = westlakeField(kind, input.viewWidth, input.viewHeight);
    const x = (input.x - field.x) / field.width, y = (input.y - field.y) / field.height;
    return { ...input, x, y, action: x < 0 || x > 1 || y < 0 || y > 1 ? "outside-scene" : input.action };
  }

  // .build/typescript/runtime/day-memories/westlake-scene.js
  function paintWestlake({ ctx, images, character, id: id2, state: s, width: w, height: h }) {
    const spec = WESTLAKE_SCENES[id2], bg = images.get(spec.background);
    if (!bg)
      return;
    const focus = w < h ? spec.portraitFocus : spec.focus;
    const cover3 = Math.max(w / bg.naturalWidth, h / bg.naturalHeight);
    ctx.drawImage(bg, -(bg.naturalWidth * cover3 - w) * focus.x, -(bg.naturalHeight * cover3 - h) * focus.y, bg.naturalWidth * cover3, bg.naturalHeight * cover3);
    const field = westlakeField(spec.kind, w, h), unit = Math.min(w, h * 1.45), t = s.reduced ? 0 : s.age;
    const point2 = (p2) => {
      const at2 = westlakePoint(field, p2);
      return { x: at2.x * w, y: at2.y * h };
    };
    const sprite = (file, at2, width, angle = 0, alpha = 1) => {
      const img = images.get(file);
      if (!img)
        return;
      const height = width * img.naturalHeight / img.naturalWidth;
      ctx.save();
      ctx.translate(at2.x, at2.y);
      ctx.rotate(angle);
      ctx.globalAlpha = alpha;
      ctx.drawImage(img, -width / 2, -height / 2, width, height);
      ctx.restore();
    };
    const ripple = (at2, radius2, alpha) => {
      ctx.save();
      ctx.strokeStyle = `rgba(246,243,213,${alpha})`;
      ctx.lineWidth = Math.max(1, unit * 18e-4);
      ctx.beginPath();
      ctx.ellipse(at2.x, at2.y, radius2, radius2 * 0.23, -0.07, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    };
    const leafArt = (frame2, at2, width, rotation = 0, alpha = 1) => {
      const img = images.get("sprites/art-play-props-v1.webp");
      if (!img)
        return;
      const regions = [[99, 26, 169, 350], [393, 75, 367, 282], [810, 80, 317, 274]];
      const region = regions[frame2];
      if (!region)
        return;
      const [sx, sy, sw, sh] = region;
      ctx.save();
      ctx.translate(at2.x, at2.y);
      ctx.rotate(rotation);
      ctx.globalAlpha = alpha;
      ctx.drawImage(img, sx, sy, sw, sh, -width / 2, -width * sh / sw / 2, width, width * sh / sw);
      ctx.restore();
    };
    const scene = s.scene;
    if (scene.kind === "leaf") {
      const at2 = point2(leafPosition(scene.distance)), size = Math.min(74, unit * 0.11);
      ripple({ x: at2.x - size * 0.06, y: at2.y + size * 0.16 }, size * 0.47, 0.38);
      sprite("sprites/creek-leaf-v1.webp", at2, size, -0.12 + Math.sin(t * 0.6) * 0.07);
      if (s.acted)
        for (let i = 0; i < 3; i++) {
          const progress = (t * 0.48 + i / 3) % 1;
          ripple(point2({ x: s.x, y: s.y }), unit * (0.025 + progress * 0.095), (1 - progress) * 0.4);
        }
      else
        ripple(point2({ x: leafPosition(0).x - 0.08, y: leafPosition(0).y }), unit * 0.035, 0.65);
    } else if (scene.kind === "stones") {
      const rock = images.get("sprites/mogan-props-v1.webp");
      const start = { x: 0.18, y: 0.88 }, exit = { x: 0.86, y: 0.48 };
      const rockAt = (p2, size) => {
        const at3 = point2(p2), height = size * 158 / 480;
        ripple({ x: at3.x, y: at3.y + height * 0.35 }, size * 0.48, 0.32);
        if (rock)
          ctx.drawImage(rock, 16, 177, 480, 158, at3.x - size / 2, at3.y - height * 0.44, size, height);
      };
      rockAt(start, unit * 0.21);
      rockAt(exit, unit * 0.2);
      STONES.forEach((p2, i) => rockAt(p2, unit * (0.19 - i * 0.018)));
      const active = STONES[scene.index];
      if (active && scene.walking === 0)
        ripple(point2(active), unit * 0.054, 0.75);
      const from = scene.index === 0 ? start : STONES[Math.min(2, scene.index - 1)];
      const to = scene.index >= 3 ? exit : STONES[scene.index];
      const fraction = scene.index >= 3 ? Math.min(1, s.reveal / 1.5) : scene.walking;
      const at2 = point2({ x: from.x + (to.x - from.x) * fraction, y: from.y + (to.y - from.y) * fraction });
      const image = images.get(character.walk.file);
      if (image) {
        const moving = fraction > 0 && fraction < 1;
        const frame2 = character.walk.frames[moving && !s.reduced ? Math.floor(s.age * 8) % 8 : 2];
        const size = Math.max(38, Math.min(72, unit * 0.1)), scale = size / frame2.height;
        ctx.save();
        ctx.fillStyle = "#34463d32";
        ctx.beginPath();
        ctx.ellipse(at2.x, at2.y + 1, size * 0.2, size * 0.045, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.drawImage(image, frame2.x, frame2.y, frame2.width, frame2.height, at2.x - frame2.footX * scale, at2.y - frame2.footY * scale, frame2.width * scale, frame2.height * scale);
        ctx.restore();
      }
    } else if (scene.kind === "tea") {
      const left = w * 0.1, top = h * 0.49, width = w * 0.8, height = h * 0.46;
      ctx.save();
      ctx.shadowColor = "#32493632";
      ctx.shadowBlur = 14;
      ctx.shadowOffsetY = 5;
      ctx.fillStyle = "#faf5e6f2";
      ctx.beginPath();
      ctx.moveTo(left, top + 4);
      ctx.lineTo(left + width * 0.49, top);
      ctx.lineTo(left + width, top + 5);
      ctx.lineTo(left + width - 3, top + height);
      ctx.lineTo(left + 4, top + height - 3);
      ctx.closePath();
      ctx.fill();
      ctx.shadowColor = "transparent";
      ctx.strokeStyle = "#cfc7a65c";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(w * 0.5, top + 8);
      ctx.lineTo(w * 0.5, top + height - 8);
      ctx.stroke();
      ctx.restore();
      TEA.forEach((p2, i) => {
        const at2 = point2(p2), picked = scene.picked.has(i), size = Math.min(w * 0.145, h * 0.17);
        leafArt(p2.bud ? 0 : p2.young ? 1 : 2, at2, size * (p2.bud ? 0.44 : p2.young ? 0.8 : 1.1), Math.sin(i) * 0.12, picked ? 0.5 : 1);
        if (picked) {
          ctx.save();
          ctx.strokeStyle = "#607c50";
          ctx.lineWidth = Math.max(1.5, unit * 22e-4);
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(at2.x - 5, at2.y + size * 0.56);
          ctx.lineTo(at2.x - 1, at2.y + size * 0.61);
          ctx.lineTo(at2.x + 8, at2.y + size * 0.49);
          ctx.stroke();
          ctx.restore();
        }
      });
    } else if (scene.kind === "brew") {
      const size = westlakeCupSize(w, h), cx = w * 0.5, cy = h * 0.72;
      ctx.save();
      ctx.fillStyle = "#56432b26";
      ctx.beginPath();
      ctx.ellipse(cx, cy + size * 0.4, size * 0.42, size * 0.06, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      sprite("scenes/day-route-v2/teacup.webp", { x: cx, y: cy }, size);
      const waterY = cy + size * 0.19 - scene.water * size * 0.3;
      ctx.save();
      ctx.fillStyle = "#bad27c55";
      ctx.beginPath();
      ctx.ellipse(cx, waterY, size * 0.31, size * 0.07, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      for (let i = 0; i < 3; i++)
        leafArt(i === 0 ? 0 : 1, { x: cx + size * (i * 0.085 - 0.085), y: waterY + size * 0.045 + Math.sin(t + i) * size * 6e-3 }, size * 0.075, Math.sin(i + scene.steep) * 0.4, 0.8);
      if (s.dragging && !scene.released) {
        ctx.save();
        ctx.strokeStyle = "#ecf4dbab";
        ctx.lineWidth = Math.max(2, size * 0.018);
        ctx.beginPath();
        ctx.moveTo(cx - size * 0.12, cy - size * 0.52);
        ctx.quadraticCurveTo(cx, cy - size * 0.25, cx, waterY);
        ctx.stroke();
        ctx.restore();
      }
      if (scene.released)
        for (let i = 0; i < 3; i++) {
          const drift = s.reduced ? 0 : Math.sin(t * 0.6 + i) * size * 0.012;
          ctx.save();
          ctx.strokeStyle = "#fffbe7a6";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(cx + size * (i * 0.1 - 0.1), cy - size * 0.23);
          ctx.bezierCurveTo(cx + size * (i * 0.1 - 0.13) + drift, cy - size * 0.33, cx + size * (i * 0.1 - 0.07), cy - size * 0.38, cx + size * (i * 0.1 - 0.1) + drift, cy - size * 0.46);
          ctx.stroke();
          ctx.restore();
        }
    }
    if (s.phase === "reveal") {
      ctx.fillStyle = `rgba(251,247,225,${Math.min(0.1, s.reveal * 0.02)})`;
      ctx.fillRect(0, 0, w, h);
    }
  }

  // .build/typescript/runtime/day-memories/scene.js
  var DayMemoryView = class {
    route;
    id;
    directInput = true;
    contentState = "loading";
    disposed = false;
    canvas = null;
    ctx = null;
    observer = null;
    images = /* @__PURE__ */ new Map();
    width = 1e3;
    height = 700;
    character = CHARACTERS[readCharacterId()];
    latest = null;
    constructor(route, id2) {
      this.route = route;
      this.id = id2;
    }
    get background() {
      return isWestlakeSceneId(this.id) ? WESTLAKE_SCENES[this.id].background : `scenes/day-route-v2/${this.route}.webp`;
    }
    input(point2) {
      return isWestlakeSceneId(this.id) ? westlakeInput(WESTLAKE_SCENES[this.id].kind, { ...point2, viewWidth: this.width, viewHeight: this.height }) : point2;
    }
    async mount(host, cache2) {
      const canvas = document.createElement("canvas");
      this.canvas = canvas;
      canvas.className = "mini-game-canvas day-memory-canvas";
      canvas.setAttribute("aria-hidden", "true");
      const ctx = canvas.getContext("2d");
      if (!ctx)
        throw new Error("画作无法展开");
      this.ctx = ctx;
      const props = isWestlakeSceneId(this.id) ? WESTLAKE_SCENES[this.id].kind === "leaf" ? ["sprites/creek-leaf-v1.webp"] : WESTLAKE_SCENES[this.id].kind === "stones" ? [this.character.walk.file, "sprites/mogan-props-v1.webp"] : WESTLAKE_SCENES[this.id].kind === "tea" ? ["sprites/art-play-props-v1.webp"] : ["sprites/art-play-props-v1.webp", "scenes/day-route-v2/teacup.webp"] : [this.character.walk.file, "sprites/creek-leaf-v1.webp", "sprites/art-play-props-v1.webp", "sprites/mogan-props-v1.webp", "sprites/bamboo-cup-v2.webp", "scenes/day-route-v2/teacup.webp"];
      const files = [this.background, ...props];
      const resources = await Promise.all(files.map((file) => cache2?.request(file, "high")?.promise));
      if (this.disposed)
        return;
      if (resources.some((asset) => asset?.state !== "ready")) {
        this.contentState = "error";
        return;
      }
      resources.forEach((asset, i) => {
        if (asset)
          this.images.set(files[i], asset.image);
      });
      host.append(canvas);
      this.contentState = "ready";
      const resize = () => {
        const box = host.getBoundingClientRect(), dpr = Math.min(2, devicePixelRatio || 1);
        this.width = Math.max(1, box.width);
        this.height = Math.max(1, box.height);
        canvas.width = Math.round(this.width * dpr);
        canvas.height = Math.round(this.height * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        if (this.latest)
          this.paint(this.latest);
      };
      this.observer = new ResizeObserver(resize);
      this.observer.observe(host);
      resize();
      host.setAttribute("aria-busy", "false");
    }
    dispose() {
      this.disposed = true;
      this.observer?.disconnect();
      this.canvas?.remove();
      this.images.clear();
    }
    paint(s) {
      this.latest = s;
      const ctx = this.ctx, bg = this.images.get(this.background);
      if (!ctx || !bg || this.disposed)
        return;
      const w = this.width, h = this.height, unit = Math.min(w, h * 1.45), scene = s.scene, t = s.reduced ? 0 : s.age;
      ctx.clearRect(0, 0, w, h);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      if (isWestlakeSceneId(this.id)) {
        paintWestlake({ ctx, images: this.images, character: this.character, id: this.id, state: s, width: w, height: h });
        this.canvas?.setAttribute("data-scene", WESTLAKE_SCENES[this.id].kind);
        this.canvas?.setAttribute("data-place", WESTLAKE_SCENES[this.id].place);
        return;
      }
      const focus = scene.kind === "reflection" ? 0.14 : scene.kind === "lichen" ? 0.78 : this.route === "mogan" ? 0.64 : 0.5;
      const cover3 = Math.max(w / bg.naturalWidth, h / bg.naturalHeight), cropX = (bg.naturalWidth * cover3 - w) * focus;
      ctx.drawImage(bg, -cropX, (h - bg.naturalHeight * cover3) / 2, bg.naturalWidth * cover3, bg.naturalHeight * cover3);
      const image = (file, x, y, width, rotation = 0, alpha = 1) => {
        const img = this.images.get(file);
        if (!img)
          return;
        const height = width * img.naturalHeight / img.naturalWidth;
        ctx.save();
        ctx.translate(x * w, y * h);
        ctx.rotate(rotation);
        ctx.globalAlpha = alpha;
        ctx.drawImage(img, -width / 2, -height / 2, width, height);
        ctx.restore();
      };
      const ring = (x, y, r, alpha = 0.7) => {
        ctx.save();
        ctx.strokeStyle = `rgba(248,242,208,${alpha})`;
        ctx.lineWidth = Math.max(1, unit * 3e-3);
        ctx.beginPath();
        ctx.ellipse(x * w, y * h, r * unit, r * unit * 0.28, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      };
      const atlas = (frame2, x, y, size, rotation = 0, alpha = 1) => {
        const img = this.images.get("sprites/art-play-props-v1.webp");
        if (!img)
          return;
        const regions = [[99, 26, 169, 350], [393, 75, 367, 282], [810, 80, 317, 274], [1161, 34, 352, 333], [82, 399, 241, 339], [447, 457, 269, 246]];
        const [sx, sy, sw, sh] = regions[frame2], height = size * sh / sw;
        ctx.save();
        ctx.translate(x * w, y * h);
        ctx.rotate(rotation);
        ctx.globalAlpha = alpha;
        ctx.drawImage(img, sx, sy, sw, sh, -size / 2, -height / 2, size, height);
        ctx.restore();
      };
      const hiker = (x, y, walk) => {
        const img = this.images.get(this.character.walk.file);
        if (!img)
          return;
        const frame2 = this.character.walk.frames[walk > 0 ? Math.floor(walk * 8) % 8 : 2], size = Math.max(34, Math.min(66, unit * 0.09)), scale = size / frame2.height;
        ctx.save();
        ctx.fillStyle = "#3f4c4133";
        ctx.beginPath();
        ctx.ellipse(x * w, y * h + 1, size * 0.24, size * 0.06, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.drawImage(img, frame2.x, frame2.y, frame2.width, frame2.height, x * w - frame2.footX * scale, y * h - frame2.footY * scale, frame2.width * scale, frame2.height * scale);
        ctx.restore();
      };
      const reveal = Math.min(1, s.reveal / 4);
      if (scene.kind === "reflection") {
        ctx.save();
        ctx.beginPath();
        ctx.rect(w * 0.08, h * 0.58, w * 0.84, h * 0.32);
        ctx.clip();
        ctx.globalAlpha = 0.26;
        ctx.translate(w * scene.offset, h * 1.07);
        ctx.scale(1, -0.45);
        ctx.drawImage(bg, -cropX, 0, bg.naturalWidth * cover3, bg.naturalHeight * cover3);
        ctx.restore();
        for (let i = 0; i < 6; i++)
          ring(0.25 + i * 0.1, 0.67 + Math.sin(i) * 0.055, 0.06 + Math.sin(t * 0.8 + i) * 8e-3, 0.22);
        if (s.phase === "play") {
          ring(0.5, 0.7, 0.12, 0.6);
          ctx.fillStyle = "#fff8e6c9";
          ctx.font = `${Math.max(12, unit * 0.02)}px serif`;
          ctx.textAlign = "center";
          ctx.fillText("← 轻拖枝影 →", w * 0.5, h * 0.9);
        }
      } else if (scene.kind === "lichen") {
        const rw = w * 0.68, rh = Math.min(h * 0.58, rw * 0.8), rx = (w - rw) / 2, ry = h * 0.34;
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(w * 0.5, ry + rh * 0.5, rw * 0.5, rh * 0.5, -0.08, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(bg, bg.naturalWidth * 0.55, bg.naturalHeight * 0.65, bg.naturalWidth * 0.45, bg.naturalHeight * 0.35, rx, ry, rw, rh);
        ctx.restore();
        const lx = s.x * w, ly = s.y * h, lr = unit * 0.115;
        ctx.save();
        ctx.beginPath();
        ctx.arc(lx, ly, lr, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(bg, bg.naturalWidth * (0.57 + (s.x - 0.25) * 0.45), bg.naturalHeight * (0.66 + (s.y - 0.35) * 0.25), bg.naturalWidth * 0.13, bg.naturalHeight * 0.13, lx - lr, ly - lr, lr * 2, lr * 2);
        ctx.restore();
        ctx.strokeStyle = "#a1885d";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(lx, ly, lr, 0, Math.PI * 2);
        ctx.moveTo(lx + lr * 0.7, ly + lr * 0.7);
        ctx.lineTo(lx + lr * 1.25, ly + lr * 1.25);
        ctx.stroke();
      } else if (scene.kind === "vista") {
        const opened = s.phase === "reveal" ? Math.min(1, scene.opened + reveal) : scene.opened;
        ctx.save();
        ctx.globalAlpha = 1 - opened * 0.95;
        const strip = bg.naturalWidth * 0.28;
        ctx.drawImage(bg, 0, 0, strip, bg.naturalHeight, -opened * w * 0.45, 0, w * 0.43, h);
        ctx.drawImage(bg, bg.naturalWidth - strip, 0, strip, bg.naturalHeight, w * 0.57 + opened * w * 0.45, 0, w * 0.43, h);
        ctx.restore();
        hiker(0.76 + reveal * 0.04, 0.9 - reveal * 0.06, s.phase === "reveal" && reveal < 1 ? s.reveal : 0);
      } else if (scene.kind === "rain") {
        image("sprites/bamboo-cup-v2.webp", scene.cup, 0.81, unit * 0.18);
        const dx = rainX(s);
        ctx.fillStyle = "#a2cad6";
        ctx.strokeStyle = "#eaf0dd";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(dx * w, scene.drop * h, Math.max(3, unit * 8e-3), Math.max(5, unit * 0.013), 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        const sprig = this.images.get("sprites/mogan-props-v1.webp");
        if (sprig)
          ctx.drawImage(sprig, 528, 549, 480, 437, dx * w - unit * 0.13, 0.04 * h, unit * 0.26, unit * 0.24);
        for (let i = 0; i < 4; i++)
          ring(0.4 + i * 0.065, 0.94, 0.012, i < scene.count ? 1 : 0.25);
      } else if (scene.kind === "steps") {
        for (const [i, p2] of STEP_LEAVES.entries())
          if (!scene.cleared.has(i))
            image("sprites/creek-leaf-v1.webp", p2.x, p2.y, unit * 0.065, i * 0.8);
        hiker(0.45 + reveal * 0.23, 0.91 - reveal * 0.35, s.phase === "reveal" && reveal < 1 ? s.reveal : 0);
      } else if (scene.kind === "wind") {
        const x = s.phase === "play" ? 0.3 : 0.3 + reveal * 0.43, y = s.phase === "play" ? 0.68 : 0.68 - reveal * 0.32 - Math.sin(reveal * Math.PI) * 0.1;
        atlas(5, x, y, unit * (0.12 - reveal * 0.05), s.phase === "play" ? scene.gust * 0.28 : reveal * 2);
        const sprig = this.images.get("sprites/mogan-props-v1.webp");
        if (sprig) {
          ctx.save();
          ctx.translate(w * 0.73, h * 0.23);
          ctx.rotate(scene.gust * 0.13);
          ctx.drawImage(sprig, 528, 549, 480, 437, -unit * 0.17, -unit * 0.08, unit * 0.34, unit * 0.31);
          ctx.restore();
        }
        if (scene.gust > 0.05 && s.phase === "play")
          ring(0.3, 0.79, 0.06, 0.65);
      }
      if (s.phase === "reveal") {
        ctx.fillStyle = `rgba(251,247,225,${Math.min(0.12, s.reveal * 0.025)})`;
        ctx.fillRect(0, 0, w, h);
      }
      this.canvas?.setAttribute("data-scene", DAY_MEMORIES[s.id].kind);
    }
  };

  // .build/typescript/runtime/day-memories/adapter.js
  function state(value) {
    if (!(value instanceof DayMemoryState))
      throw new Error("山野互动状态无法读取");
    return value;
  }
  function view(value) {
    if (!(value instanceof DayMemoryView))
      throw new Error("山野画作无法读取");
    return value;
  }
  function createDayMemories(dom2, audio2) {
    let sounded = 0;
    return {
      input: "direct",
      create(entry, options) {
        sounded = 0;
        return new DayMemoryState(entry, options.reduced);
      },
      act: (s, p2) => state(s).input(p2),
      move: (s, p2) => state(s).input(p2, true),
      release: (s) => state(s).release(),
      point: (v, p2) => view(v).input(p2),
      hover: (s, p2) => state(s).scene.kind === "rain" && s.acted ? state(s).input(p2, true).release() : s,
      tick: (s, dt) => state(s).tick(dt),
      key: (s, key, phase) => state(s).key(key, phase),
      draw: (_svg, _parent, entry) => new DayMemoryView(entry.route, entry.id),
      paint: (v, s) => view(v).paint(state(s)),
      mount: (v, context) => view(v).mount(context.host, context.cache),
      dispose: (v) => view(v).dispose(),
      assets: (entry) => ({ scene: isWestlakeSceneId(entry.id) ? WESTLAKE_SCENES[entry.id].background : `scenes/day-route-v2/${entry.route}.webp` }),
      instruction: (entry) => dayMemoryId(entry.id) ? DAY_MEMORIES[entry.id].prompt : "",
      status: (s) => state(s).feedback,
      outcome(s, entry) {
        const current = state(s);
        return { id: s.id, edition: entry.edition, earned: s.play.complete, interaction: s.gesture, memory: DAY_MEMORIES[current.id].memory, title: entry.tag };
      },
      present(s, v) {
        const current = state(s), painting = view(v);
        dom2.text("micro-title", DAY_MEMORIES[current.id].title);
        dom2.text("micro-result", painting.contentState === "loading" ? "山野画作正在展开…" : painting.contentState === "error" ? "画作暂未展开，点「重新试一次」。" : current.feedback);
        dom2.get("micro-panel").setAttribute("data-day-memory", "true");
        dom2.get("micro-surface").setAttribute("aria-label", `${DAY_MEMORIES[current.id].prompt} 可用方向键移动，空格或 Enter 操作。`);
        if (current.sounds > sounded) {
          sounded = current.sounds;
          audio2.interact?.(current.scene.kind === "rain" || current.scene.kind === "leaf" || current.scene.kind === "stones" ? "ripple" : "leaf", { x: s.x, icon: "", playType: current.scene.kind });
        }
      }
    };
  }

  // .build/typescript/content/changping-memories.js
  var CHANGPING_MEMORIES = {
    "changping-branch-reflection": { kind: "branches", title: "枯枝认影", prompt: "看看纸上的枝桠，点出水里同样的倒影。", badge: "枯林水镜", memory: "十月的枯树滩，我认出了浅水中的两种枝影。风经过，它们又轻轻散开。" },
    "changping-bell-cord": { kind: "cords", title: "马铃解绳", prompt: "先拉开压在上面的绳头，再解开下面的一圈。", badge: "铃响山谷", memory: "干海子一带歇脚时，我理开布垫上的两圈闲绳。小铃重新响起，远处的马抬起了头。" },
    "changping-valley-path": { kind: "path", title: "画里有条路", prompt: "上下移动近处的纸片，把两段小径接起来。", badge: "长谷见峰", memory: "到木骡子前，我把手帐里错开的两段小径接好。走出林边，草甸、溪水与雪山一起展开了。" },
    "changping-autumn-print": { kind: "print", title: "叶脉留秋", prompt: "在纸上来回轻擦，让落叶的叶脉慢慢显出来。", badge: "一叶长坪", memory: "返程经过彩林，我用蜡笔拓下落叶的叶脉。留下的是纸上的秋色，落叶仍回到林间。" }
  };
  var CHANGPING_MEMORY_IDS = Object.keys(CHANGPING_MEMORIES);
  function changpingMemoryId(id2) {
    return Object.hasOwn(CHANGPING_MEMORIES, id2);
  }

  // .build/typescript/runtime/changping-memories/model.js
  var SHADOW_X = [0.22, 0.5, 0.78];
  var SHADOW_ANSWER = [2, 0];
  var CORD_ENDS = [{ x: 0.74, y: 0.55 }, { x: 0.26, y: 0.61 }];
  var PATH_PAGE = { x: 0.08, y: 0.62, width: 0.84, height: 0.36 };
  function leafFrame(width, height) {
    const size = Math.min(width * 0.58, height * 0.62);
    return { x: width * 0.5 - size / 2, y: height * 0.57 - size / 2, size };
  }
  var clamp8 = (n, min = 0, max = 1) => Math.max(min, Math.min(max, n));
  var near2 = (a, b, radius2 = 0.1) => Math.hypot(a.x - b.x, a.y - b.y) <= radius2;
  function insideLeaf(x, y) {
    return ((x - 0.5) / 0.34) ** 2 + ((y - 0.5) / 0.44) ** 2 < 1;
  }
  var PRINT_CELLS = Array.from({ length: 15 * 18 }, (_, i) => ({
    x: (i % 15 + 0.5) / 15,
    y: (Math.floor(i / 15) + 0.5) / 18
  })).filter((p2) => insideLeaf(p2.x, p2.y));
  var ChangpingMemoryState = class {
    reduced;
    kind = "changping-memory";
    route = "changping";
    id;
    scene;
    play = { type: "changping-memory", progress: 0, complete: false, completedAt: null };
    phase = "play";
    age = 0;
    acted = false;
    dragging = false;
    gesture = "tap";
    done = false;
    x = 0.5;
    y = 0.65;
    reveal = 0;
    sounds = 0;
    mistake = 0;
    keyboard = false;
    rubbingSoundAt = 0;
    width = 1e3;
    height = 700;
    feedback;
    constructor(entry, reduced2) {
      this.reduced = reduced2;
      if (!changpingMemoryId(entry.id))
        throw new Error("无法读取长坪沟互动");
      this.id = entry.id;
      const spec = CHANGPING_MEMORIES[this.id];
      this.feedback = spec.prompt;
      switch (spec.kind) {
        case "branches":
          this.scene = { kind: "branches", round: 0, found: 0, selected: null, settle: 0 };
          break;
        case "cords":
          this.scene = { kind: "cords", opened: 0, held: null, tug: 0, end: { ...CORD_ENDS[0] } };
          break;
        case "path":
          this.scene = { kind: "path", offset: 0.18, grab: null, walked: 0 };
          break;
        case "print":
          this.scene = { kind: "print", strokes: [], cells: /* @__PURE__ */ new Set(), current: null };
          break;
      }
    }
    finish() {
      if (this.phase !== "play")
        return;
      this.phase = "reveal";
      this.reveal = 0;
      this.dragging = false;
      this.play.progress = 1;
      this.sounds++;
      this.feedback = this.scene.kind === "branches" ? "认出来了。让溪水再晃一会儿。" : this.scene.kind === "cords" ? "铃响了，山谷里传来轻轻的回声。" : this.scene.kind === "path" ? "路接好了。沿着纸上的小径，走进开阔处。" : "这一片秋色，会连同你的笔触留在手帐里。";
    }
    input(p2, move = false) {
      if (this.phase !== "play" || this.done)
        return this;
      if (p2.phase === "release")
        return this.release();
      this.width = p2.viewWidth ?? this.width;
      this.height = p2.viewHeight ?? this.height;
      const x = clamp8(p2.x ?? this.x), y = clamp8(p2.y ?? this.y);
      this.x = x;
      this.y = y;
      this.gesture = move ? "drag" : "tap";
      const s = this.scene;
      switch (s.kind) {
        case "branches": {
          if (move || s.settle > 0)
            break;
          const selected = SHADOW_X.findIndex((cx) => Math.abs(x - cx) < 0.12 && Math.abs(y - 0.7) < 0.2);
          if (selected < 0)
            break;
          this.acted = true;
          s.selected = selected;
          if (selected === SHADOW_ANSWER[s.round]) {
            s.found++;
            s.settle = 1.25;
            this.play.progress = s.found / 2;
            this.sounds++;
            this.feedback = s.found === 1 ? "是这一枝。再看看那根弯弯的枝桠。" : "两种枝影都认出来了。";
          } else {
            this.mistake = 1.1;
            this.feedback = "看看分叉的方向，再试一枝。";
          }
          break;
        }
        case "cords": {
          if (!move) {
            const index = CORD_ENDS.findIndex((end, i) => i >= s.opened && near2({ x, y }, end, 0.12));
            if (index < 0)
              break;
            this.acted = true;
            this.dragging = true;
            s.held = index;
            s.end = { x, y };
          } else if (this.dragging && s.held !== null) {
            s.end = { x, y };
            if (s.held !== s.opened) {
              s.tug = 0.9;
              this.feedback = "这根还被压着，先看看上面的绳头。";
              break;
            }
            const opened = s.opened === 0 ? x > 0.8 && y < 0.46 : x < 0.2 && y < 0.48;
            if (opened) {
              s.opened++;
              s.held = null;
              this.dragging = false;
              this.play.progress = s.opened / 2;
              this.sounds++;
              if (s.opened === 2)
                this.finish();
              else
                this.feedback = "上面的一圈松开了，再拉开左边的绳头。";
            }
          }
          break;
        }
        case "path": {
          if (!move && x > PATH_PAGE.x && x < PATH_PAGE.x + PATH_PAGE.width && y > PATH_PAGE.y + s.offset && y < PATH_PAGE.y + PATH_PAGE.height + s.offset) {
            s.grab = { y, offset: s.offset };
            this.dragging = true;
            this.acted = true;
          } else if (move && s.grab && this.dragging) {
            s.offset = clamp8(s.grab.offset + y - s.grab.y, -0.16, 0.22);
            this.play.progress = clamp8(1 - Math.abs(s.offset) / 0.18) * 0.85;
            this.feedback = Math.abs(s.offset) < 0.035 ? "两段路接上了，松手出发。" : CHANGPING_MEMORIES[this.id].prompt;
          }
          break;
        }
        case "print": {
          const frame2 = leafFrame(this.width, this.height);
          const px = (x * this.width - frame2.x) / frame2.size, py = (y * this.height - frame2.y) / frame2.size;
          if (!move) {
            this.dragging = true;
            this.acted = true;
            s.current = [];
            s.strokes.push(s.current);
          }
          if (!this.dragging || !s.current || !insideLeaf(px, py))
            break;
          const last = s.current.at(-1);
          if (last && near2(last, { x: px, y: py }, 6e-3))
            break;
          if (s.current.length < 1600 && s.strokes.length < 120)
            s.current.push({ x: px, y: py });
          if (last) {
            const steps2 = Math.max(1, Math.ceil(Math.hypot(px - last.x, py - last.y) / 0.012));
            for (let j = 0; j <= steps2; j++)
              this.rub({ x: last.x + (px - last.x) * j / steps2, y: last.y + (py - last.y) * j / steps2 });
          }
          if (last)
            this.rub({ x: px, y: py });
          if (last && this.age - this.rubbingSoundAt > 0.35) {
            this.sounds++;
            this.rubbingSoundAt = this.age;
          }
          this.play.progress = Math.min(0.98, s.cells.size / PRINT_CELLS.length / 0.65);
          this.feedback = this.play.progress >= 0.98 ? "叶脉已显出，松手把秋色留下。" : "顺着叶形轻擦，细细的叶脉正在显出来。";
          break;
        }
      }
      return this;
    }
    rub(p2) {
      if (this.scene.kind !== "print")
        return;
      PRINT_CELLS.forEach((cell, i) => {
        if (near2(p2, cell, 0.085) && this.scene.kind === "print")
          this.scene.cells.add(i);
      });
    }
    release(commit = true) {
      this.dragging = false;
      if (this.scene.kind === "cords")
        this.scene.held = null;
      if (this.scene.kind === "path") {
        const hadGrab = this.scene.grab !== null;
        this.scene.grab = null;
        if (commit && hadGrab && Math.abs(this.scene.offset) < 0.035) {
          this.scene.offset = 0;
          this.finish();
        }
      }
      if (this.scene.kind === "print") {
        this.scene.current = null;
        if (commit && this.scene.cells.size / PRINT_CELLS.length >= 0.65)
          this.finish();
      }
      return this;
    }
    tick(dt) {
      if (!Number.isFinite(dt) || dt <= 0 || this.done)
        return this;
      const step = Math.min(dt, 0.1);
      this.age += step;
      this.mistake = Math.max(0, this.mistake - step);
      const s = this.scene;
      if (s.kind === "cords")
        s.tug = Math.max(0, s.tug - step);
      if (s.kind === "branches" && s.settle > 0) {
        s.settle = Math.max(0, s.settle - step);
        if (s.settle === 0) {
          if (s.found === 2)
            this.finish();
          else {
            s.round = 1;
            s.selected = null;
          }
        }
      }
      if (this.phase === "reveal") {
        this.reveal += step;
        if (s.kind === "path")
          s.walked = clamp8(this.reveal / (this.reduced ? 2.6 : 6.5));
        const duration = s.kind === "path" ? this.reduced ? 4 : 8 : this.reduced ? 1.5 : 3.5;
        if (this.reveal >= duration) {
          this.done = true;
          this.play.complete = true;
          this.play.completedAt = this.age;
        }
      }
      return this;
    }
    key(key, phase) {
      if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " ", "Enter", "1", "2", "3"].includes(key))
        return null;
      this.keyboard = true;
      if (phase === "up") {
        if (key === " " || key === "Enter")
          this.release();
        return this;
      }
      if (this.scene.kind === "branches" && ["1", "2", "3"].includes(key))
        return this.input({ x: SHADOW_X[Number(key) - 1], y: 0.7 });
      if (key === " " || key === "Enter") {
        if (!this.dragging)
          this.input({ x: this.x, y: this.y });
        return this;
      }
      const x = clamp8(this.x + (key === "ArrowRight" ? 0.035 : key === "ArrowLeft" ? -0.035 : 0));
      const y = clamp8(this.y + (key === "ArrowDown" ? 0.035 : key === "ArrowUp" ? -0.035 : 0));
      if (this.dragging)
        this.input({ x, y }, true);
      else {
        this.x = x;
        this.y = y;
      }
      return this;
    }
  };

  // .build/typescript/runtime/changping-memories/scene.js
  var AUTUMN_ASSETS = {
    creek: "scenes/day-route-v2/changping.webp",
    horse: "scenes/changping-autumn-v1/horse-rest.webp",
    valley: "scenes/changping-autumn-v1/valley.webp",
    props: "scenes/changping-autumn-v1/props.webp"
  };
  function backgroundFor(id2) {
    return id2 === "changping-branch-reflection" ? AUTUMN_ASSETS.creek : id2 === "changping-valley-path" ? AUTUMN_ASSETS.valley : AUTUMN_ASSETS.horse;
  }
  function cover2(ctx, image, w, h, focus = 0.5, focusY = 0.5) {
    const scale = Math.max(w / image.naturalWidth, h / image.naturalHeight);
    ctx.drawImage(image, -(image.naturalWidth * scale - w) * focus, (h - image.naturalHeight * scale) * focusY, image.naturalWidth * scale, image.naturalHeight * scale);
  }
  var ChangpingMemoryView = class {
    id;
    directInput = true;
    contentState = "loading";
    disposed = false;
    canvas = null;
    ctx = null;
    observer = null;
    images = /* @__PURE__ */ new Map();
    character = CHARACTERS[readCharacterId()];
    width = 1e3;
    height = 700;
    latest = null;
    layer = document.createElement("canvas");
    mask = document.createElement("canvas");
    maskRevision = -1;
    frame = new Image();
    constructor(id2) {
      this.id = id2;
      this.frame.src = `data:image/svg+xml,${encodeURIComponent(badgeFrameSvg())}`;
    }
    async mount(host, cache2) {
      const canvas = document.createElement("canvas");
      canvas.className = "mini-game-canvas day-memory-canvas";
      canvas.setAttribute("aria-hidden", "true");
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d");
      if (!this.ctx)
        throw new Error("画作无法展开");
      const files = [backgroundFor(this.id), AUTUMN_ASSETS.props, this.character.walk.file];
      const resources = await Promise.all(files.map((file) => cache2?.request(file, "high")?.promise));
      if (this.disposed)
        return;
      if (resources.some((asset) => asset?.state !== "ready")) {
        this.contentState = "error";
        return;
      }
      resources.forEach((asset, i) => {
        if (asset)
          this.images.set(files[i], asset.image);
      });
      host.append(canvas);
      this.contentState = "ready";
      host.setAttribute("aria-busy", "false");
      const resize = () => {
        const box = host.getBoundingClientRect(), dpr = Math.min(2, devicePixelRatio || 1);
        this.width = Math.max(1, box.width);
        this.height = Math.max(1, box.height);
        canvas.width = Math.round(this.width * dpr);
        canvas.height = Math.round(this.height * dpr);
        this.ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
        this.maskRevision = -1;
        if (this.latest)
          this.paint(this.latest);
      };
      this.observer = new ResizeObserver(resize);
      this.observer.observe(host);
      resize();
    }
    input(p2) {
      return { ...p2, viewWidth: this.width, viewHeight: this.height };
    }
    dispose() {
      this.disposed = true;
      this.observer?.disconnect();
      this.canvas?.remove();
      this.images.clear();
    }
    prop(ctx, cell, x, y, size, rotation = 0, mirror = false) {
      const image = this.images.get(AUTUMN_ASSETS.props);
      if (!image)
        return;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      if (mirror)
        ctx.scale(-1, 1);
      ctx.drawImage(image, cell % 3 * 512, Math.floor(cell / 3) * 512, 512, 512, -size / 2, -size / 2, size, size);
      ctx.restore();
    }
    paper(ctx, x, y, w, h) {
      ctx.save();
      ctx.shadowColor = "#31403640";
      ctx.shadowBlur = 14;
      ctx.shadowOffsetY = 6;
      ctx.fillStyle = "#f4eddc";
      ctx.beginPath();
      ctx.moveTo(x, y + 3);
      ctx.lineTo(x + w * 0.31, y);
      ctx.lineTo(x + w * 0.68, y + 2);
      ctx.lineTo(x + w, y - 1);
      ctx.lineTo(x + w - 2, y + h);
      ctx.lineTo(x + w * 0.4, y + h - 2);
      ctx.lineTo(x + 2, y + h + 1);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      const props = this.images.get(AUTUMN_ASSETS.props);
      if (props) {
        ctx.save();
        ctx.globalAlpha = 0.5;
        ctx.drawImage(props, 1024, 512, 512, 512, x, y, w, h);
        ctx.restore();
      }
    }
    caption(ctx, text, x, y, size) {
      ctx.save();
      ctx.font = `${size}px "Songti SC", "Noto Serif SC", serif`;
      ctx.fillStyle = "#505a47";
      ctx.textAlign = "center";
      ctx.fillText(text, x, y);
      ctx.restore();
    }
    paint(s) {
      this.latest = s;
      const ctx = this.ctx;
      if (!ctx || this.contentState !== "ready" || this.disposed)
        return;
      this.draw(ctx, s, this.width, this.height, false);
      if (s.keyboard && s.phase === "play") {
        ctx.save();
        ctx.strokeStyle = "#faf4df";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(s.x * this.width, s.y * this.height, 8, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = "#53674d";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
      }
    }
    draw(ctx, s, w, h, badge) {
      const bg = this.images.get(backgroundFor(this.id));
      if (!bg)
        return;
      const u = Math.min(w, h * 1.3), t = s.reduced ? 0 : s.age;
      ctx.clearRect(0, 0, w, h);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      const valleyFocus = s.scene.kind === "path" ? 0.5 - s.scene.walked * 0.2 : 0.5;
      cover2(ctx, bg, w, h, s.scene.kind === "cords" ? w < h ? 0.92 : 0.68 : s.scene.kind === "branches" ? 0.3 : 0.5, valleyFocus);
      if (s.scene.kind === "branches") {
        const scene = s.scene;
        const wash = ctx.createLinearGradient(0, h * 0.45, 0, h);
        wash.addColorStop(0, "#d9e3d600");
        wash.addColorStop(0.35, "#d8e1d6dd");
        wash.addColorStop(1, "#abbeb8ef");
        ctx.fillStyle = wash;
        ctx.fillRect(0, h * 0.45, w, h * 0.55);
        if (!badge) {
          const pw = Math.min(w * 0.38, h * 0.4), ph = Math.min(h * 0.36, pw * 1.1);
          this.paper(ctx, w * 0.5 - pw / 2, h * 0.07, pw, ph);
          this.prop(ctx, scene.round === 0 ? 1 : 2, w * 0.5, h * 0.07 + ph * 0.49, ph * 0.87);
          this.caption(ctx, "找找它的倒影", w * 0.5, h * 0.07 + ph * 0.93, Math.max(11, Math.min(16, u * 0.025)));
        }
        for (const [i, x] of SHADOW_X.entries()) {
          const answer = SHADOW_ANSWER[scene.round], isMatch = i === answer;
          const frame2 = isMatch ? scene.round === 0 ? 1 : 2 : i === (answer + 1) % 3 ? scene.round === 0 ? 2 : 1 : scene.round === 0 ? 1 : 2;
          const size = Math.min(w * 0.23, h * 0.36);
          ctx.save();
          ctx.translate(x * w, 0.7 * h);
          ctx.scale(1, -1);
          ctx.globalAlpha = scene.selected === i && s.mistake > 0 ? 0.32 : 0.76;
          this.prop(ctx, frame2, 0, 0, size, 0, !isMatch && frame2 === (scene.round === 0 ? 1 : 2));
          ctx.restore();
          ctx.strokeStyle = scene.selected === i && s.mistake === 0 ? "#f4e4ba" : "#ecf0e0a0";
          ctx.lineWidth = 1.4;
          for (let j = 0; j < 3; j++) {
            ctx.beginPath();
            ctx.ellipse(x * w + Math.sin(t * 0.6 + j) * 3, h * (0.8 + j * 0.025), size * (0.3 + j * 0.08), 3 + j, -0.08, 0, Math.PI * 2);
            ctx.stroke();
          }
          if (!badge)
            this.caption(ctx, String(i + 1), x * w, h * 0.93, Math.max(13, u * 0.026));
        }
      } else if (s.scene.kind === "cords") {
        const scene = s.scene;
        const stroke = (points, color, width) => {
          const draw = (dy) => {
            ctx.beginPath();
            ctx.moveTo(points[0].x * w, points[0].y * h + dy);
            for (let i = 1; i + 2 < points.length; i += 3)
              ctx.bezierCurveTo(points[i].x * w, points[i].y * h + dy, points[i + 1].x * w, points[i + 1].y * h + dy, points[i + 2].x * w, points[i + 2].y * h + dy);
          };
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
          ctx.strokeStyle = "#3e332633";
          ctx.lineWidth = width + 3;
          draw(2);
          ctx.stroke();
          ctx.strokeStyle = color;
          ctx.lineWidth = width;
          draw(0);
          ctx.stroke();
          ctx.strokeStyle = "#eee2b672";
          ctx.lineWidth = width * 0.25;
          draw(-1);
          ctx.stroke();
        };
        const bellSize = u * 0.24, swing = s.phase === "reveal" ? Math.sin(s.reveal * 7) * 0.13 * Math.exp(-s.reveal * 0.8) : 0;
        this.prop(ctx, 0, w * 0.5, h * 0.79, bellSize, swing);
        if (scene.opened < 2) {
          const end = scene.held === 1 ? { x: CORD_ENDS[1].x + (scene.end.x - CORD_ENDS[1].x) * (scene.opened === 0 ? 0.12 : 1), y: CORD_ENDS[1].y + (scene.end.y - CORD_ENDS[1].y) * (scene.opened === 0 ? 0.12 : 1) } : CORD_ENDS[1];
          stroke([{ x: 0.5, y: 0.73 }, { x: 0.35, y: 0.63 }, { x: 0.69, y: 0.4 }, { x: 0.7, y: 0.62 }, { x: 0.72, y: 0.79 }, { x: 0.37, y: 0.78 }, end], "#9d8253", Math.max(4.5, u * 0.012));
        } else
          stroke([{ x: 0.5, y: 0.72 }, { x: 0.38, y: 0.65 }, { x: 0.25, y: 0.45 }, { x: 0.15, y: 0.4 }], "#9d8253", Math.max(4.5, u * 0.012));
        if (scene.opened === 0) {
          const end = scene.held === 0 ? scene.end : CORD_ENDS[0];
          stroke([{ x: 0.5, y: 0.72 }, { x: 0.7, y: 0.59 }, { x: 0.27, y: 0.38 }, { x: 0.3, y: 0.65 }, { x: 0.33, y: 0.84 }, { x: 0.63, y: 0.74 }, end], "#936650", Math.max(5, u * 0.014));
        } else
          stroke([{ x: 0.5, y: 0.72 }, { x: 0.65, y: 0.65 }, { x: 0.77, y: 0.38 }, { x: 0.86, y: 0.39 }], "#936650", Math.max(5, u * 0.014));
        if (s.phase === "play" && !badge) {
          for (let i = scene.opened; i < 2; i++) {
            const end = scene.held === i && i === scene.opened ? scene.end : CORD_ENDS[i];
            ctx.fillStyle = i === 0 ? "#865b47" : "#957849";
            ctx.beginPath();
            ctx.ellipse(end.x * w, end.y * h, Math.max(8, u * 0.016), Math.max(7, u * 0.012), -0.3, 0, Math.PI * 2);
            ctx.fill();
          }
          if (!s.acted)
            this.caption(ctx, "顺着绳子，找到上面的绳头", w * 0.5, h * 0.93, Math.max(12, Math.min(17, u * 0.028)));
        }
        if (s.phase === "reveal") {
          ctx.save();
          ctx.strokeStyle = "#c5a158";
          ctx.lineWidth = 1.5;
          ctx.globalAlpha = 0.65 * Math.exp(-s.reveal * 0.55);
          for (const direction of [-1, 1]) {
            ctx.beginPath();
            ctx.ellipse(w * 0.5, h * 0.78, bellSize * (0.48 + s.reveal * 0.04), bellSize * 0.28, 0, direction < 0 ? 2.5 : -0.6, direction < 0 ? 3.7 : 0.6);
            ctx.stroke();
          }
          ctx.restore();
        }
      } else if (s.scene.kind === "path") {
        const scene = s.scene, fade = s.phase === "reveal" ? Math.max(0, 1 - s.reveal / 1.2) : 1;
        const x = w * PATH_PAGE.x, y = h * PATH_PAGE.y, pw = w * PATH_PAGE.width, ph = h * PATH_PAGE.height;
        if (fade > 0 && !badge) {
          ctx.save();
          ctx.globalAlpha = fade;
          this.paper(ctx, x - 4, y + scene.offset * h - 4, pw + 8, ph + 8);
          ctx.beginPath();
          ctx.rect(x, y + scene.offset * h, pw, ph);
          ctx.clip();
          ctx.translate(0, scene.offset * h);
          cover2(ctx, bg, w, h, 0.5, valleyFocus);
          ctx.restore();
          if (s.phase === "play") {
            this.caption(ctx, "↕", w * 0.86, Math.min(h * 0.94, y + scene.offset * h + ph * 0.4), Math.max(20, u * 0.045));
          }
        }
        const progress = scene.walked, scale = Math.max(w / bg.naturalWidth, h / bg.naturalHeight), cropX = (bg.naturalWidth * scale - w) / 2, cropY = (bg.naturalHeight * scale - h) * valleyFocus;
        const px = 0.465 + 0.125 * Math.sin(progress * Math.PI / 2), py = 0.82 - 0.22 * progress;
        const hx = px * bg.naturalWidth * scale - cropX, hy = py * bg.naturalHeight * scale - cropY + (s.phase === "play" ? scene.offset * h : 0);
        const person = this.images.get(this.character.walk.file);
        if (person && !badge) {
          const moving = s.phase === "reveal" && progress < 1, frame2 = this.character.walk.frames[moving ? Math.floor(s.reveal * 7) % 8 : 2];
          const size = Math.max(28, Math.min(76, u * 0.105)) * (1 - progress * 0.28), factor = size / frame2.height;
          ctx.fillStyle = "#48513a33";
          ctx.beginPath();
          ctx.ellipse(hx, hy, size * 0.18, size * 0.055, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.drawImage(person, frame2.x, frame2.y, frame2.width, frame2.height, hx - frame2.footX * factor, hy - frame2.footY * factor, frame2.width * factor, frame2.height * factor);
        }
      } else {
        const scene = s.scene;
        ctx.fillStyle = "#d8b2732a";
        ctx.fillRect(0, 0, w, h);
        this.paper(ctx, w * 0.17, h * 0.19, w * 0.66, h * 0.75);
        const frame2 = leafFrame(w, h), size = frame2.size, x = frame2.x + size / 2, y = frame2.y + size / 2;
        ctx.save();
        ctx.globalAlpha = 0.13;
        this.prop(ctx, 3, x, y, size);
        ctx.restore();
        const revision = scene.strokes.reduce((count, stroke) => count + stroke.length, 0);
        if (this.maskRevision !== revision || this.layer.width !== Math.ceil(w) || this.layer.height !== Math.ceil(h)) {
          this.layer.width = this.mask.width = Math.ceil(w);
          this.layer.height = this.mask.height = Math.ceil(h);
          const ink3 = this.layer.getContext("2d"), mask = this.mask.getContext("2d");
          if (ink3 && mask) {
            this.prop(ink3, 3, x, y, size);
            mask.lineWidth = size * 0.17;
            mask.lineCap = "round";
            mask.lineJoin = "round";
            mask.strokeStyle = "#000";
            for (const stroke of scene.strokes)
              if (stroke.length > 1) {
                mask.beginPath();
                mask.moveTo(frame2.x + stroke[0].x * size, frame2.y + stroke[0].y * size);
                for (const p2 of stroke.slice(1))
                  mask.lineTo(frame2.x + p2.x * size, frame2.y + p2.y * size);
                mask.stroke();
              }
            ink3.globalCompositeOperation = "destination-in";
            ink3.drawImage(this.mask, 0, 0);
            ink3.globalCompositeOperation = "source-over";
          }
          this.maskRevision = revision;
        }
        ctx.drawImage(this.layer, 0, 0);
        ctx.save();
        ctx.strokeStyle = "#be8b3d2c";
        ctx.lineWidth = Math.max(2, u * 6e-3);
        ctx.lineCap = "round";
        for (const stroke of scene.strokes)
          if (stroke.length > 1) {
            ctx.beginPath();
            ctx.moveTo(frame2.x + stroke[0].x * size, frame2.y + stroke[0].y * size);
            for (const p2 of stroke.slice(1))
              ctx.lineTo(frame2.x + p2.x * size, frame2.y + p2.y * size);
            ctx.stroke();
          }
        ctx.restore();
        if (!badge)
          this.caption(ctx, s.phase === "play" ? "十月 · 长坪沟" : "把秋色留在纸上", w * 0.5, h * 0.9, Math.max(12, Math.min(17, u * 0.027)));
        if (s.dragging && !badge) {
          ctx.save();
          ctx.translate(s.x * w, s.y * h);
          ctx.rotate(-0.6);
          ctx.fillStyle = "#c49b51";
          ctx.fillRect(-3, -u * 0.13, 8, u * 0.13);
          ctx.fillStyle = "#e1c691";
          ctx.fillRect(-3, -u * 0.105, 8, u * 0.065);
          ctx.restore();
        }
      }
    }
    capture(s) {
      if (this.contentState !== "ready")
        return void 0;
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 640;
      const ctx = canvas.getContext("2d");
      if (!ctx)
        return void 0;
      ctx.save();
      ctx.beginPath();
      ctx.arc(320, 320, 280, 0, Math.PI * 2);
      ctx.clip();
      this.draw(ctx, s, 640, 640, true);
      ctx.restore();
      if (this.frame.complete && this.frame.naturalWidth)
        ctx.drawImage(this.frame, 0, 0, 640, 640);
      else {
        ctx.strokeStyle = "#d4bf89";
        ctx.lineWidth = 15;
        ctx.beginPath();
        ctx.arc(320, 320, 288, 0, Math.PI * 2);
        ctx.stroke();
      }
      return canvas.toDataURL("image/webp", 0.86);
    }
  };

  // .build/typescript/runtime/changping-memories/adapter.js
  function state2(value) {
    if (!(value instanceof ChangpingMemoryState))
      throw new Error("无法读取彩林互动");
    return value;
  }
  function view2(value) {
    if (!(value instanceof ChangpingMemoryView))
      throw new Error("无法读取彩林画作");
    return value;
  }
  function createChangpingMemories(dom2, audio2) {
    let sounded = 0;
    let painting = null;
    return {
      input: "direct",
      soundTheme: "creek",
      create(entry, options) {
        sounded = 0;
        return new ChangpingMemoryState(entry, options.reduced);
      },
      act: (s, p2) => state2(s).input(p2),
      move: (s, p2) => state2(s).input(p2, true),
      release: (s) => state2(s).release(false),
      point: (v, p2) => view2(v).input(p2),
      tick: (s, dt) => state2(s).tick(dt),
      key: (s, key, phase) => state2(s).key(key, phase),
      draw(_svg, _parent, entry) {
        if (!changpingMemoryId(entry.id))
          throw new Error("无法读取彩林画作");
        painting = new ChangpingMemoryView(entry.id);
        return painting;
      },
      paint: (v, s) => view2(v).paint(state2(s)),
      mount: (v, { host, cache: cache2 }) => view2(v).mount(host, cache2),
      dispose(v) {
        view2(v).dispose();
        painting = null;
        delete dom2.get("micro-panel").dataset.changpingMemory;
        delete dom2.get("micro-panel").dataset.dayMemory;
      },
      assets: (entry) => changpingMemoryId(entry.id) ? { scene: backgroundFor(entry.id) } : {},
      instruction: (entry) => changpingMemoryId(entry.id) ? CHANGPING_MEMORIES[entry.id].prompt : "",
      status: (s) => state2(s).feedback,
      outcome(s, entry) {
        const current = state2(s), spec = CHANGPING_MEMORIES[current.id], captureArt = painting?.capture(current);
        return { id: s.id, edition: entry.edition, earned: s.play.complete, interaction: s.gesture, memory: spec.memory, title: spec.badge, ...captureArt ? { captureArt, artSource: "capture" } : {} };
      },
      present(s, v) {
        const current = state2(s), spec = CHANGPING_MEMORIES[current.id];
        const panel = dom2.get("micro-panel");
        panel.dataset.dayMemory = "true";
        panel.dataset.changpingMemory = current.scene.kind;
        panel.dataset.memoryPhase = current.phase;
        dom2.text("micro-title", spec.title);
        dom2.text("micro-skip", "继续山径 →");
        dom2.text("micro-result", v.contentState === "loading" ? "彩林画作正在展开…" : v.contentState === "error" ? "画作暂未展开，可以重试或继续山径。" : current.feedback);
        dom2.get("micro-surface").setAttribute("aria-label", `${spec.prompt} 键盘：方向键移动，按住空格操作、松开停下；枝影可按 1、2、3 选择。`);
        if (current.sounds > sounded) {
          sounded = current.sounds;
          audio2.interact?.(current.scene.kind === "branches" ? "ripple" : "leaf", { x: s.x, icon: current.scene.kind === "cords" && current.phase === "reveal" ? "bell" : "leaf", playType: current.scene.kind });
        }
      }
    };
  }

  // .build/typescript/runtime/frame-loop.js
  function createFrameLoop(options) {
    let pending2 = null;
    let lastTime = null;
    let generation = 0;
    function stop() {
      generation++;
      if (pending2 !== null)
        options.cancel(pending2);
      pending2 = null;
      lastTime = null;
    }
    function ensure() {
      if (!options.active()) {
        stop();
        return;
      }
      if (pending2 !== null)
        return;
      const version = generation;
      pending2 = options.request((time) => {
        if (version !== generation)
          return;
        pending2 = null;
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

  // .build/typescript/journey/art-page.js
  var dom = createDom(document);
  var { get: $ } = dom;
  var query = new URLSearchParams(location.search);
  var id = query.get("entry");
  var sessionId = query.get("session");
  var session = sessionId ? { session: sessionId, entry: id } : null;
  document.body.dataset.embedded = String(window.parent !== window);
  function notifyParent(type) {
    if (window.parent !== window && session)
      window.parent.postMessage(type === "ready" ? artMessage(session, type) : artMessage(session, type, collected), location.origin);
  }
  var chapter = chapterFor(document.body.dataset.route ?? "wugong");
  if (!chapter)
    throw new Error("无法读取这段旅程");
  var routeId = chapter.id;
  var mapPage = chapter.mapPage;
  var events = ART_EVENTS[routeId];
  var allowed = /* @__PURE__ */ new Set([...events.map((event) => event.entry), ...routeId === "tiger" ? Object.keys(TRAIL_GAMES) : []]);
  var place = events.find((event) => event.entry === id)?.place ?? null;
  var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var disposed = false;
  var closing = false;
  var collected = 0;
  var pending = null;
  var storage = null;
  try {
    storage = localStorage;
  } catch {
  }
  var catalog = window.TrailDiscoveries;
  var games = window.TrailMiniGames;
  var scenes = createSceneManager({ status: () => "paused", pause() {
  }, resume() {
  }, hidden: () => document.hidden });
  var cache = window.TrailImageCache.create(Image);
  function returnToMap() {
    if (disposed)
      return;
    if (window.parent !== window)
      notifyParent("close");
    else
      location.href = mapPage;
  }
  function stopLoop() {
    clock.stop();
  }
  function ensureLoop() {
    clock.ensure();
  }
  function audioScene() {
    const current = mini.state, phase = current instanceof MemoryState && current.session.kind === "bends" ? current.session.phase : null;
    return { routeId, mode: reward.open ? "reward" : mini.active ? "moment" : "silent", momentId: current?.id ?? pending?.id, momentGame: phase?.kind === "river" ? "tiger-river" : mini.soundTheme ?? null, ...phase ? { gorgeOpenness: roadWalk(phase), riverApproach: phase.kind === "river" ? Math.min(1, phase.elapsed) : 0 } : {}, ...current instanceof ShoulderState ? { coastOpenness: current.cameraProgress } : {} };
  }
  function refresh() {
    if (disposed)
      return;
    audio.setScene(audioScene());
    if (closing && !mini.active && !reward.open) {
      pending = null;
      returnToMap();
      return;
    }
    ensureLoop();
  }
  var audio = window.TrailAudio.create({ AudioContext, navigator, fetch: fetch.bind(window), timers: window, createMusic: createMusicLayer, onError() {
    $("mini-sound").textContent = "声音未能开启，再试一次";
  }, onStateChange() {
  } });
  var reward = createRewardController({
    dom,
    scenes,
    catalog,
    cache,
    audio,
    reduced,
    autoCollect: true,
    presentArt: roundJournalArt,
    gameKind: (entryId) => routeId === "aotai" ? aotaiGameId(entryId) ? AOTAI_GAMES[entryId].game : void 0 : routeId === "tiger" ? memoryId(entryId) ? MEMORY_SPECS[entryId].game : TRAIL_GAMES[entryId] : routeId === "maclehose" && entryId === "coast-sand" ? "footsteps" : routeId === "maclehose" && coastMemoryId(entryId) ? COAST_MEMORIES[entryId].game : games.kinds[entryId],
    refresh,
    stopLoop,
    onCollected(moment) {
      const saved = journal.remember(moment);
      if (saved.kind === "error") {
        $("reward-copy").textContent = saved.message;
        return false;
      }
      $("reward-copy").textContent = "已收进手帐";
      collected = 1;
      pending = null;
      notifyParent("collected");
      return true;
    }
  });
  var journal = createJournalController({
    dom,
    scenes,
    catalog,
    data: window.TrailJournal,
    routes: ROUTE_SUMMARIES,
    weather: { clear: { name: "晴" }, cloud: { name: "多云" }, mist: { name: "薄雾" }, drizzle: { name: "小雨" } },
    storage,
    reduced,
    presentArt: roundJournalArt,
    tripCount: () => collected,
    rewardOpen: () => reward.open,
    pauseInteraction: () => mini.pause(),
    stopLoop,
    refresh,
    onRemember() {
    },
    evidence: (entryId) => window.TrailRouteMoments.evidence(entryId),
    observation: () => null,
    source: () => null
  });
  var legacyMini = games.enhance(window.TrailMicroMoments);
  var mini = createMiniGameController({
    dom,
    scenes,
    api: legacyMini,
    platform: games,
    pixi: window.PIXI,
    catalog,
    cache,
    audio,
    reduced,
    svg(tag, attributes, parent) {
      const node = document.createElementNS("http://www.w3.org/2000/svg", tag);
      for (const [name, value] of Object.entries(attributes))
        node.setAttribute(name, String(value));
      parent?.appendChild(node);
      return node;
    },
    sound: () => audio.enabled,
    async toggleSound() {
      if (audio.enabled)
        audio.disable();
      else
        await audio.enable(audioScene());
      refresh();
    },
    stopLoop,
    ensureLoop,
    refresh,
    onFinished(finished) {
      const outcome = finished.outcome, entry = finished.entry;
      if (!allowed.has(entry.id) || outcome.id !== entry.id || outcome.edition !== 3 || !outcome.earned)
        return false;
      const captureArt = outcome.captureArt ? catalog.safeCaptureArt(outcome.captureArt) : null;
      if (outcome.captureArt && !captureArt)
        return false;
      const now = Date.now();
      pending = {
        key: `${now}-${routeId}-${entry.id}`,
        id: entry.id,
        route: routeId,
        edition: 3,
        earned: true,
        title: outcome.title,
        memory: outcome.memory,
        icon: entry.icon,
        tag: entry.tag,
        place: place ?? entry.place,
        ...entry.artV5 ? { artVersion: 5 } : entry.artV4 ? { artVersion: 4 } : {},
        createdAt: now,
        ...captureArt ? { captureArt, artSource: outcome.artSource } : {}
      };
      return reward.show(pending, "paused");
    },
    onClosed() {
      closing = true;
    }
  });
  var tigerGames = routeId === "tiger" ? createTigerTrailGames({ dom, riverArrived: true, onAction: (name, value) => mini.action(name, value) }) : null;
  if (tigerGames)
    mini.registerGame(Object.keys(TRAIL_GAMES), tigerGames.adapter);
  var tigerMemories = routeId === "tiger" ? createTigerMemoryGames(dom, (name) => mini.action(name)) : null;
  if (tigerMemories)
    mini.registerGame(MEMORY_IDS, tigerMemories.adapter);
  if (routeId === "aotai")
    mini.registerGame(AOTAI_IDS, createAotaiGames(dom));
  if (routeId === "maclehose") {
    mini.registerGame(COAST_MEMORY_IDS, createCoastMemories(dom, (name) => mini.action(name)));
    mini.registerGame(["coast-sand"], createSaiwanShoulder(dom));
    mini.registerGame(["coast-shell"], createTide(dom));
  }
  if (routeId === "changping" || routeId === "mogan" || routeId === "westlake")
    mini.registerGame(Object.keys(DAY_MEMORIES), createDayMemories(dom, audio));
  if (routeId === "changping")
    mini.registerGame(CHANGPING_MEMORY_IDS, createChangpingMemories(dom, audio));
  var clock = createFrameLoop({ request: (callback) => requestAnimationFrame(callback), cancel: (id2) => cancelAnimationFrame(id2), maxDelta: 0.05, active: () => !disposed && !document.hidden && mini.active, update: frame });
  var soundElapsed = 0;
  function frame(dt) {
    mini.update(dt);
    soundElapsed += dt;
    if (soundElapsed > 0.18 && (mini.state instanceof ShoulderState || mini.state instanceof MemoryState && mini.state.session.kind === "bends")) {
      audio.setScene(audioScene());
      soundElapsed = 0;
    }
  }
  function destroy() {
    if (disposed)
      return;
    disposed = true;
    stopLoop();
    mini.destroy();
    tigerGames?.destroy();
    tigerMemories?.destroy();
    reward.destroy();
    journal.destroy();
    audio.destroy();
  }
  $("walk-toggle").addEventListener("click", () => {
    destroy();
    if (window.parent !== window)
      notifyParent("close");
    else
      location.href = mapPage;
  });
  window.addEventListener("message", (event) => {
    if (event.source === window.parent && event.origin === location.origin && readArtMessage(event.data, session)?.type === "dispose")
      destroy();
  });
  window.addEventListener("keydown", (event) => {
    if (reward.handleKey(event))
      return;
    if (event.key === "Escape" && !journal.open) {
      event.preventDefault();
      $("walk-toggle").click();
    }
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopLoop();
      mini.pause();
      audio.hide();
      scenes.suspend();
    } else {
      scenes.foreground();
      ensureLoop();
    }
  });
  window.addEventListener("pagehide", destroy);
  journal.render();
  if (id && allowed.has(id)) {
    if (routeId === "maclehose")
      $("art-page-title").textContent = id === "coast-sand" ? "转角见海" : "海岸手绘";
    $("art-journal-wall").hidden = true;
    const original = catalog.item(id), currentPlace = place;
    mini.begin(currentPlace ? { ...original, place: currentPlace, memory: original.memory.replace(original.place, currentPlace) } : original, "paused");
  } else
    $("art-page-title").textContent = "旅行手帐";
  notifyParent("ready");
})();
/*! Bundled license information:

matter-js/build/matter.js:
  (*!
   * matter-js 0.20.0 by @liabru
   * http://brm.io/matter-js/
   * License MIT
   *
   * The MIT License (MIT)
   *
   * Copyright (c) Liam Brummitt and contributors.
   *
   * Permission is hereby granted, free of charge, to any person obtaining a copy
   * of this software and associated documentation files (the "Software"), to deal
   * in the Software without restriction, including without limitation the rights
   * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
   * copies of the Software, and to permit persons to whom the Software is
   * furnished to do so, subject to the following conditions:
   *
   * The above copyright notice and this permission notice shall be included in
   * all copies or substantial portions of the Software.
   *
   * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
   * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
   * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
   * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
   * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
   * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
   * THE SOFTWARE.
   *)
*/
