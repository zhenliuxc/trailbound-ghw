(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.TrailJournal=api;}(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const PAGE_SIZE=12;
 // A read-only view: preserve historical artwork, duplicate visits and storage order.
 function page(moments,route='all',limit=PAGE_SIZE){
  const matching=moments.filter(moment=>route==='all'||moment.route===route);
  const size=Number.isFinite(limit)?Math.max(PAGE_SIZE,Math.floor(limit)):PAGE_SIZE;
  const entries=matching.slice().reverse().slice(0,size);
  return {entries,total:matching.length,remaining:Math.max(0,matching.length-entries.length)};
 }
 return {PAGE_SIZE,page};
}));
