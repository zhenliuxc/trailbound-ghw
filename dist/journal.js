(function(root,factory){const api=factory(typeof module==='object'&&module.exports?require('./discoveries.js'):root.TrailDiscoveries);if(typeof module==='object'&&module.exports)module.exports=api;else root.TrailJournal=api;}(typeof globalThis!=='undefined'?globalThis:this,function(D){
 'use strict';
 const PAGE_SIZE=12;
 const identity=moment=>moment.route+':'+moment.id;
 // Completed current interactions take precedence over old illustrations and plain notes.
 // Within the same tier, keep the first memory and its original artwork/date.
 const rank=moment=>D.hasTag(moment)?(moment.edition===3?2:1):0;
 function unique(moments){
  const entries=new Map();
  for(const moment of moments){const key=identity(moment),previous=entries.get(key);if(!previous||rank(moment)>rank(previous))entries.set(key,moment);}
  return [...entries.values()];
 }
 function remember(moments,moment){
  if(!D.hasTag(moment))return {moments,status:'unchanged'};
  const previous=unique(moments).find(entry=>identity(entry)===identity(moment));
  if(previous&&rank(moment)<=rank(previous))return {moments,status:'unchanged'};
  if(moments.length>=D.MAX_MOMENTS)return {moments,status:'full'};
  // Keep old persisted records intact. An upgrade is appended only once and the view
  // displays its completed artwork in the existing slot; replays never append copies.
  return {moments:D.cleanMoments([...moments,moment]),status:previous?'upgraded':'added'};
 }
 // Deduplicate before filtering and pagination, without rewriting historical storage.
 function page(moments,route='all',limit=PAGE_SIZE){
  const all=unique(moments),matching=all.filter(moment=>route==='all'||moment.route===route);
  const size=Number.isFinite(limit)?Math.max(PAGE_SIZE,Math.floor(limit)):PAGE_SIZE;
  const entries=matching.slice().reverse().slice(0,size);
  return {entries,total:matching.length,totalAll:all.length,remaining:Math.max(0,matching.length-entries.length)};
 }
 return {PAGE_SIZE,page,remember};
}));
