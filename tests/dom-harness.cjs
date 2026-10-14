// Minimal DOM fixture for event wiring and SVG updates; this is NOT a browser renderer.
const fs=require('node:fs'),vm=require('node:vm');
class Element{
  constructor(tag,doc){this.tagName=tag.toUpperCase();this.doc=doc;this.attributes={};this.children=[];this.listeners={};this.style={};this.hidden=false;this.disabled=false;this.dataset={};this.textContent='';this.captured=new Set();this.classes=new Set();this.classList={toggle:(name,force)=>{if(force)this.classes.add(name);else this.classes.delete(name);}};}
  set id(value){this.attributes.id=value;this.doc.ids.set(value,this);}get id(){return this.attributes.id;}
  setAttribute(name,value){this.attributes[name]=String(value);if(name==='id')this.doc.ids.set(String(value),this);if(name.startsWith('data-'))this.dataset[name.slice(5)]=String(value);if(name==='class')this.classes=new Set(String(value).split(/\s+/));}
  appendChild(el){this.children.push(el);return el;}replaceChildren(...els){this.children=els;}
  querySelector(selector){for(const child of this.children){if(child.tagName?.toLowerCase()===selector)return child;const found=child.querySelector?.(selector);if(found)return found;}return null;}
  addEventListener(type,fn){(this.listeners[type]??=[]).push(fn);}
  emit(type,event={}){for(const fn of this.listeners[type]??[])fn({target:this,preventDefault(){this.prevented=true;},...event});}
  focus(){this.doc.activeElement=this;}
  setPointerCapture(id){this.captured.add(id);}hasPointerCapture(id){return this.captured.has(id);}releasePointerCapture(id){this.captured.delete(id);}
  getBoundingClientRect(){return {left:0,top:0,...(this.doc.viewport||{width:720,height:600})};}
}
function harness(storage={getItem:()=>null,setItem:()=>{}},options={}){
  const document={ids:new Map(),all:[],listeners:{},hidden:false,activeElement:null,viewport:options.viewport};
  document.createElement=tag=>{const el=new Element(tag,document);document.all.push(el);return el;};document.createElementNS=(_,tag)=>document.createElement(tag);
  document.createTextNode=text=>({textContent:text});document.getElementById=id=>document.ids.get(id);
  document.querySelectorAll=selector=>document.all.filter(el=>selector==='[data-action]'?el.dataset.action:el.dataset.direction);
  document.addEventListener=(type,fn)=>(document.listeners[type]??=[]).push(fn);
  document.emit=(type,event={})=>{for(const fn of document.listeners[type]??[])fn(event);};
  const root=document.createElement('root'),stack=[root],html=fs.readFileSync(require.resolve('../dist/index.html'),'utf8');
  const voids=new Set(['meta','link','br','input','hr','img']);
  for(const match of html.matchAll(/<\/?([\w-]+)([^>]*?)>/g)){
    const full=match[0],tag=match[1].toLowerCase();if(full.startsWith('</')){if(stack.length>1)stack.pop();continue;}
    const el=document.createElement(tag);for(const a of match[2].matchAll(/([\w-]+)\s*=\s*"([^"]*)"/g))el.setAttribute(a[1],a[2]);
    if(/\bhidden\b/.test(match[2]))el.hidden=true;if(/\bdisabled\b/.test(match[2]))el.disabled=true;if(/\bchecked\b/.test(match[2]))el.checked=true;
    stack.at(-1).appendChild(el);if(!voids.has(tag)&&!full.endsWith('/>'))stack.push(el);
  }
  const window={location:{protocol:'file:'},TrailGame:require('../dist/game.js'),TrailJourney:require('../dist/journey.js'),TrailScenery:require('../dist/scenery.js'),TrailMotion:require('../dist/motion.js'),TrailLife:require('../dist/life.js'),TrailLandscapeData:require('../dist/landscape-data.js'),TrailDiscoveries:require('../dist/discoveries.js'),TrailAudio:require('../dist/audio.js'),TrailCheckpoints:require('../dist/checkpoints.js'),AudioContext:options.AudioContext,setTimeout:options.timers?.setTimeout,clearTimeout:options.timers?.clearTimeout,listeners:{},addEventListener(type,fn){(this.listeners[type]??=[]).push(fn);},emit(type,event={}){for(const fn of this.listeners[type]??[])fn({target:document.activeElement,preventDefault(){this.prevented=true;},...event});}};
  let now=0,frameId=0;const pending=new Map();window.requestAnimationFrame=fn=>{const id=++frameId;pending.set(id,fn);return id;};window.cancelAnimationFrame=id=>pending.delete(id);window.matchMedia=()=>({matches:!!options.reducedMotion});
  vm.runInNewContext(fs.readFileSync(require.resolve('../dist/app.js'),'utf8'),{window,document,localStorage:storage,console}, {filename:'app.js'});
  const api={document,window,advance(seconds){const count=Math.ceil(seconds*50);for(let i=0;i<count;i++){now+=20;const callbacks=[...pending.values()];pending.clear();for(const callback of callbacks)callback(now);}},pendingFrames:()=>pending.size,$:id=>document.getElementById(id),click:id=>document.getElementById(id).emit('click'),key:key=>window.emit('keydown',{key})};
  // Follow the existing first narrative choice until the next photograph, using UI events.
  api.toPhoto=()=>{for(let i=0;i<8;i++){api.advance(160);if(!api.$('photo-panel').hidden)return;const choice=api.$('story-choices').querySelector('button');if(!api.$('story-panel').hidden&&choice)choice.emit('click');else throw Error('Journey did not reach a photo');}throw Error('Too many narrative stops');};
  return api;
}
module.exports={harness};
