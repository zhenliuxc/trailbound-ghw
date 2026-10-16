(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.TrailImageCache=api;}(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 function create(ImageClass,{limit=16,concurrency=2}={}){
  const entries=new Map();let queue=[],active=0,wanted=new Set();
  function trim(){for(const [file,e]of entries){if(entries.size<=limit)break;if(!wanted.has(file)&&e.state!=='loading'&&e.state!=='queued')entries.delete(file);}}
  function pump(){while(ImageClass&&active<concurrency&&queue.length){const e=queue.shift();if(e.state!=='queued')continue;active++;e.state='loading';const image=e.image=new ImageClass();image.setAttribute('decoding','async');image.setAttribute('fetchpriority',e.priority);let settled=false;
   const finish=ok=>{if(settled)return;settled=true;e.state=ok?'ready':'error';active--;e.resolve?.(e);e.onChange?.(e);trim();pump();};
   image.onload=()=>{try{Promise.resolve(image.decode?.()).then(()=>finish(true),()=>finish(false));}catch(_){finish(false);}};image.onerror=()=>finish(false);image.setAttribute('src',e.file);
  }}
  function request(file,priority='low'){if(!ImageClass||!file)return null;let e=entries.get(file);if(e&&e.state!=='error'&&e.state!=='cancelled'){if(priority==='high'){e.priority=priority;e.image?.setAttribute('fetchpriority',priority);if(e.state==='queued'){queue=queue.filter(x=>x!==e);queue.unshift(e);pump();}}return e;}
   e={file,state:'queued',priority,image:null,onChange:null};e.promise=new Promise(resolve=>e.resolve=resolve);entries.delete(file);entries.set(file,e);priority==='high'?queue.unshift(e):queue.push(e);pump();return e;
  }
  function prefetch(files){wanted=new Set(files);for(const e of queue){if(!wanted.has(e.file)){e.state='cancelled';e.resolve(e);entries.delete(e.file);}}queue=queue.filter(e=>e.state==='queued');for(const file of files)request(file);trim();}
  return {request,prefetch,get size(){return entries.size;},get active(){return active;}};
 }
 return {create};
}));
