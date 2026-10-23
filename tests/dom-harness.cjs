// Minimal DOM fixture for event wiring and SVG updates; this is NOT a browser renderer.
const fs=require('node:fs'),vm=require('node:vm');
class Element{
  constructor(tag,doc){this.tagName=tag.toUpperCase();this.doc=doc;this.attributes={};this.children=[];this.listeners={};this.style={setProperty(name,value){this[name]=String(value);},removeProperty(name){delete this[name];}};this.hidden=false;this.disabled=false;this.dataset={};this.textContent='';this.captured=new Set();this.classes=new Set();this.classList={toggle:(name,force)=>{if(force)this.classes.add(name);else this.classes.delete(name);}};}
  set id(value){this.attributes.id=value;this.doc.ids.set(value,this);}get id(){return this.attributes.id;}
  setAttribute(name,value){this.attributes[name]=String(value);if(name==='id')this.doc.ids.set(String(value),this);if(name.startsWith('data-'))this.dataset[name.slice(5)]=String(value);if(name==='class')this.classes=new Set(String(value).split(/\s+/));}
  getAttribute(name){return this.attributes[name]??null;}removeAttribute(name){if(name==='id')this.doc.ids.delete(this.id);delete this.attributes[name];}
  before(el){const parent=this.parentNode;if(!parent)return;el.remove?.();parent.children.splice(parent.children.indexOf(this),0,el);el.parentNode=parent;}
  prepend(...els){for(const el of [...els].reverse()){el.remove?.();this.children.unshift(el);el.parentNode=this;}}
  append(...els){for(const el of els)this.appendChild(typeof el==='string'?this.doc.createTextNode(el):el);}
  appendChild(el){el.remove?.();el.parentNode=this;this.children.push(el);return el;}replaceChildren(...els){for(const child of this.children)child.parentNode=null;this.children=els;for(const child of els)child.parentNode=this;}
  replaceWith(el){const parent=this.parentNode,index=parent.children.indexOf(this);parent.children[index]=el;el.parentNode=parent;this.parentNode=null;}
  matches(selector){if(selector.includes(','))return selector.split(',').some(part=>this.matches(part.trim()));if(selector.startsWith('.'))return this.classes.has(selector.slice(1));const attr=/^([\w-]+)?\[([\w-]+)(?:="([^"]*)")?\]$/.exec(selector);return attr?(!attr[1]||this.tagName.toLowerCase()===attr[1])&&this.getAttribute(attr[2])!==null&&(attr[3]===undefined||this.getAttribute(attr[2])===attr[3]):this.tagName.toLowerCase()===selector;}
  closest(selector){for(let node=this;node;node=node.parentNode)if(node.matches?.(selector))return node;return null;}
  querySelectorAll(selector){return this.children.flatMap(child=>[...(child.matches?.(selector)?[child]:[]),...(child.querySelectorAll?.(selector)||[])]);}
  querySelector(selector){for(const child of this.children){if(child.matches?.(selector))return child;const found=child.querySelector?.(selector);if(found)return found;}return null;}
  addEventListener(type,fn){(this.listeners[type]??=[]).push(fn);}
  removeEventListener(type,fn){this.listeners[type]=(this.listeners[type]||[]).filter(listener=>listener!==fn);}
  emit(type,event={}){const pending=[];for(const fn of this.listeners[type]??[]){const r=fn({target:this,stopPropagation(){this.stopped=true;},preventDefault(){this.prevented=true;},...event});if(r?.then)pending.push(r);}return Promise.all(pending);}
  click(){return this.emit('click');}remove(){if(this.parentNode)this.parentNode.children=this.parentNode.children.filter(n=>n!==this);this.parentNode=null;}
  focus(){this.doc.activeElement=this;}
  get isConnected(){let node=this;while(node){if(node===this.doc.body)return true;node=node.parentNode;}return false;}
  // Model dialog events only: native focus trapping / rendering still need a browser.
  showModal(){this.open=true;this.setAttribute('open','');}
  close(){if(!this.open)return;this.open=false;this.removeAttribute('open');this.emit('close');}
  setPointerCapture(id){this.captured.add(id);}hasPointerCapture(id){return this.captured.has(id);}releasePointerCapture(id){this.captured.delete(id);}
  getBoundingClientRect(){return {left:0,top:0,...(this.doc.viewport||{width:720,height:600})};}
}
function harness(storage={getItem:()=>null,setItem:()=>{}},options={}){
  const document={ids:new Map(),all:[],listeners:{},hidden:false,activeElement:null,viewport:options.viewport};
  document.createElement=tag=>{const el=new Element(tag,document);document.all.push(el);return el;};document.createElementNS=(_,tag)=>document.createElement(tag);
  const photoRequests=[],photoImages=[];
  const Image=options.images||options.autoImages?class extends Element{
    constructor(){super('img',document);photoImages.push(this);this.complete=false;this.naturalWidth=0;this.decodeCalls=0;}
    setAttribute(name,value){super.setAttribute(name,value);if(name==='src'){photoRequests.push(value);if(options.autoImages)queueMicrotask(()=>this.load());}}
    decode(){this.decodeCalls++;return options.decode?options.decode(this):Promise.resolve();}
    load(){this.complete=true;this.naturalWidth=1024;this.onload?.();}
    fail(){this.complete=true;this.naturalWidth=0;this.onerror?.();}
  }:undefined;
  document.createTextNode=text=>({textContent:text});document.getElementById=id=>document.ids.get(id);
  document.querySelectorAll=selector=>document.all.filter(el=>selector==='[data-action]'?el.dataset.action:el.dataset.direction);
  document.addEventListener=(type,fn)=>(document.listeners[type]??=[]).push(fn);
  document.removeEventListener=(type,fn)=>{document.listeners[type]=(document.listeners[type]??[]).filter(listener=>listener!==fn);};
  document.emit=(type,event={})=>{for(const fn of document.listeners[type]??[])fn(event);};
  const root=document.createElement('root'),stack=[root],html=fs.readFileSync(require.resolve(options.artEntry?'../dist/wugong-art.html':'../dist/index.html'),'utf8');
  const voids=new Set(['meta','link','br','input','hr','img']);
  for(const match of html.matchAll(/<\/?([\w-]+)([^>]*?)>/g)){
    const full=match[0],tag=match[1].toLowerCase();if(full.startsWith('</')){if(stack.length>1)stack.pop();continue;}
    const el=document.createElement(tag);for(const a of match[2].matchAll(/([\w-]+)\s*=\s*"([^"]*)"/g))el.setAttribute(a[1],a[2]);
    if(/\bhidden\b/.test(match[2]))el.hidden=true;if(/\bdisabled\b/.test(match[2]))el.disabled=true;if(/\bchecked\b/.test(match[2]))el.checked=true;
    stack.at(-1).appendChild(el);if(!voids.has(tag)&&!full.endsWith('/>'))stack.push(el);
  }
  document.body=root;const downloads=[];
  const window={confirm:options.confirm||(()=>false),Blob,URL:{createObjectURL:blob=>{downloads.push(blob);return 'blob:fixture-'+downloads.length;},revokeObjectURL(){}},TrailRuntime:require('../dist/runtime.js'),TrailJournal:require('../dist/journal.js'),location:{protocol:'file:'},TrailRouteMoments:require('../dist/route-moments.js'),TrailGame:require('../dist/game.js'),TrailJourney:require('../dist/journey.js'),TrailScenery:require('../dist/scenery.js'),TrailMotion:require('../dist/motion.js'),TrailLife:require('../dist/life.js'),TrailLandscapeData:require('../dist/landscape-data.js'),TrailDiscoveries:require('../dist/discoveries.js'),TrailMicroMoments:require('../dist/micro-moments.js'),TrailNature:require('../dist/nature.js'),TrailAudio:require('../dist/audio.js'),TrailCheckpoints:require('../dist/checkpoints.js'),AudioContext:options.AudioContext,setTimeout:options.timers?.setTimeout,clearTimeout:options.timers?.clearTimeout,listeners:{},addEventListener(type,fn){(this.listeners[type]??=[]).push(fn);},emit(type,event={}){for(const fn of this.listeners[type]??[])fn({target:document.activeElement,preventDefault(){this.prevented=true;},...event});}};
  if(options.miniGames){window.TrailMiniGames=require('../dist/mini-games.js');window.TrailArtGames=require('../dist/art-games.js');window.TrailImageCache=require('../dist/image-cache.js');}
  if(options.discoverySeed!==undefined){const base=window.TrailDiscoveries;window.TrailDiscoveries={...base,create:(route,seed,opts)=>base.create(route,options.discoverySeed,opts)};}
  if(options.discoveryId){const base=window.TrailDiscoveries;window.TrailDiscoveries={...base,create:(route,seed,opts)=>{const trip=base.create(route,seed,opts);return base.item(options.discoveryId).route===route?{...trip,slots:[{id:options.discoveryId,at:.02,until:.95,side:1}]}:trip;}};}
  window.Image=Image;
  window.navigator=options.navigator;window.fetch=options.fetch;
  let now=0,frameId=0;const pending=new Map();window.requestAnimationFrame=fn=>{const id=++frameId;pending.set(id,fn);return id;};window.cancelAnimationFrame=id=>pending.delete(id);window.matchMedia=()=>({matches:!!options.reducedMotion});
  const messages=[];
  if(options.artEntry){
    window.parent={postMessage(message,origin){messages.push({message,origin});}};
    window.location={protocol:'http:',origin:'http://fixture.local',search:'?entry='+encodeURIComponent(options.artEntry)+(options.artPlace?'&place='+encodeURIComponent(options.artPlace):'')};
    window.TrailMicroMoments=window.TrailMicroMoments||require('../dist/micro-moments.js');
  }
  const globals={window,document,localStorage:storage,console};
  if(options.artEntry)Object.assign(globals,{location:window.location,URLSearchParams,Image,AudioContext:undefined,navigator:{},fetch:async()=>{throw Error('Unexpected fixture network request');},matchMedia:window.matchMedia,requestAnimationFrame:window.requestAnimationFrame,cancelAnimationFrame:window.cancelAnimationFrame});
  vm.runInNewContext(fs.readFileSync(require.resolve(options.artEntry?'../dist/wugong-art.js':'../dist/app.js'),'utf8'),globals, {filename:options.artEntry?'wugong-art.js':'app.js'});
  const api={document,window,downloads,messages,photoImages,photoRequests,advance(seconds){const count=Math.ceil(seconds*50);for(let i=0;i<count;i++){now+=20;const callbacks=[...pending.values()];pending.clear();for(const callback of callbacks)callback(now);}},pendingFrames:()=>pending.size,$:id=>document.getElementById(id),click:id=>document.getElementById(id).emit('click'),key:key=>window.emit('keydown',{key})};
  api.readyArt=async()=>{for(let i=0;i<100;i++)await Promise.resolve();};
  api.finishMoment=(mode='tap')=>{if(api.$('micro-panel').hidden)throw Error('No active micro-moment');if(mode==='tap')for(let i=0;i<3&&!api.$('micro-panel').hidden;i++){api.click('micro-surface');api.advance(.22);}for(let i=0;i<520&&!api.$('micro-panel').hidden;i++)api.advance(.02);if(!api.$('micro-panel').hidden)throw Error('Micro-moment did not finish');if(!api.$('reward-overlay').hidden)api.click('reward-continue');};
  api.collectMoment=(mode='tap')=>{api.click('observe-button');api.finishMoment(mode);};
  // Follow the existing first narrative choice until the next photograph, using UI events.
  api.toPhoto=()=>{for(let i=0;i<8;i++){api.advance(160);if(!api.$('photo-panel').hidden)return;const choice=api.$('story-choices').querySelector('button');if(!api.$('story-panel').hidden&&choice)choice.emit('click');else throw Error('Journey did not reach a photo');}throw Error('Too many narrative stops');};
  return api;
}
module.exports={harness};
