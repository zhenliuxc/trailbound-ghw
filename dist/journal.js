(function(root,factory){const api=factory(typeof module==='object'&&module.exports?require('./discoveries.js'):root.TrailDiscoveries);if(typeof module==='object'&&module.exports)module.exports=api;else root.TrailJournal=api;}(typeof globalThis!=='undefined'?globalThis:this,function(D){
 'use strict';
 const FORMAT='trailbound-journal';
 function backup(moments,now=Date.now()){return JSON.stringify({format:FORMAT,backupVersion:1,exportedAt:new Date(now).toISOString(),version:2,moments:D.cleanMoments(moments)},null,2);}
 function collection(moments,route='all'){
  const earned=new Map();for(const m of moments)if(m.edition===3&&D.hasTag(m))earned.set(m.id,m);
  const entries=D.CATALOG.filter(e=>route==='all'||e.route===route).map(e=>({entry:e,record:earned.get(e.id)||null,earned:earned.has(e.id)}));
  return {entries,earned:entries.filter(e=>e.earned).length,total:entries.length};
 }
 return {FORMAT,backup,collection};
}));
