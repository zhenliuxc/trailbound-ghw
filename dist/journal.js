(function(root,factory){const api=factory(typeof module==='object'&&module.exports?require('./discoveries.js'):root.TrailDiscoveries);if(typeof module==='object'&&module.exports)module.exports=api;else root.TrailJournal=api;}(typeof globalThis!=='undefined'?globalThis:this,function(D){
 'use strict';
 const FORMAT='trailbound-journal',MAX_BYTES=32*1024*1024;
 function backup(moments,now=Date.now()){return JSON.stringify({format:FORMAT,backupVersion:1,exportedAt:new Date(now).toISOString(),version:2,moments:D.cleanMoments(moments)},null,2);}
 function parse(raw){
  if(typeof raw!=='string'||raw.length>MAX_BYTES)throw Error('文件太大，请选择32MB以内的手帐备份。');
  let data;try{data=JSON.parse(raw);}catch(_){throw Error('这个文件不是有效的手帐备份。');}
  if(!data||typeof data!=='object'||Array.isArray(data))throw Error('这个文件不是山径手帐备份。');
  if(data.format!==undefined&&(data.format!==FORMAT||data.backupVersion!==1))throw Error('暂不支持这个备份格式或版本。');
  let moments;
  if(data.version===1&&Array.isArray(data.found)){
   if(data.found.some(id=>!D.item(id)))throw Error('旧备份含有无法识别的片刻，未导入。');
   moments=D.loadMoments({getItem:()=>JSON.stringify(data)});
  }else if(data.version===2&&Array.isArray(data.moments)){
   if(data.moments.length>D.MAX_MOMENTS)throw Error('备份超过可保留的回忆数量，未导入。');
   const seen=new Map();for(const m of data.moments){const entry=D.item(m?.id);if(!entry||m.route!==entry.route||typeof m.key!=='string'||!m.key||m.key.length>100)throw Error('备份含有无法识别的回忆，未导入。');
    const record=D.cleanMoments([m])[0];if(!record)throw Error('备份中有损坏的回忆，未导入。');
    const old=seen.get(record.key);if(old&&JSON.stringify(old)!==JSON.stringify(record))throw Error('备份中有编号冲突的回忆，未导入。');seen.set(record.key,record);
   }moments=[...seen.values()];
  }else throw Error('暂不支持这个备份格式或版本。');
  return moments;
 }
 function merge(existing,incoming){
  const current=D.cleanMoments(existing),out=current.slice(),keys=new Map(current.map(m=>[m.key,m]));let added=0,duplicates=0;
  const signature=m=>{const {key,...rest}=m;return JSON.stringify(rest);},signatures=new Set(current.map(signature));
  for(const entry of incoming){const sig=signature(entry);if(signatures.has(sig)){duplicates++;continue;}
   let value=entry;if(keys.has(value.key)){let suffix=1,key;do{key=value.key.slice(0,82)+'-import-'+suffix++;}while(keys.has(key));value={...value,key};}
   out.push(value);keys.set(value.key,value);signatures.add(sig);added++;
  }
  if(out.length>D.MAX_MOMENTS)throw Error('合并后回忆数量超过容量，原手帐未更改。请先导出备份。');
  return {moments:out,added,duplicates};
 }
 function collection(moments,route='all'){
  const earned=new Map();for(const m of moments)if(m.edition===3&&D.hasTag(m))earned.set(m.id,m);
  const entries=D.CATALOG.filter(e=>route==='all'||e.route===route).map(e=>({entry:e,record:earned.get(e.id)||null,earned:earned.has(e.id)}));
  return {entries,earned:entries.filter(e=>e.earned).length,total:entries.length};
 }
 return {FORMAT,MAX_BYTES,backup,parse,merge,collection};
}));
