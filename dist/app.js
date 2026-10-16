(function(){
 'use strict';const G=window.TrailGame,J=window.TrailJourney,M=window.TrailMotion,D=window.TrailDiscoveries,L=window.TrailLife,K=window.TrailNature,X=window.TrailMiniGames?window.TrailMiniGames.enhance(window.TrailMicroMoments):window.TrailMicroMoments,$=id=>document.getElementById(id),NS='http://www.w3.org/2000/svg',R=6378137,rad=Math.PI/180;
 let state=J.create('wugong'),projection=null,view={x:0,y:0,w:720,h:600},overview=false,photoId=null,photoReturn=null,lastTime=null,uiKey='',rafId=null,echoUntil=0,echo='',sound=false,soundBusy=false,audioBackground=false,soundError='',lastStrike=-1,scenePlan=null,sceneRenderer=null,cloudNodes=[],mistNodes=[],gaitClock=0,hikerFacing=1,lastWeather=null;
 const motionReduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches||false;
 const audioPlayer=window.TrailAudio.create({AudioContext:window.AudioContext||window.webkitAudioContext,navigator:window.navigator,fetch:window.fetch?.bind(window),timers:window,onStateChange:()=>{uiKey='';render();},onError:()=>{sound=false;soundError=audioPlayer.available?'声音未能开启，再试一次':'此浏览器暂无音效';audioPlayer.disable();uiKey='';render();}});
 const artCache=window.TrailImageCache?.create(window.Image);
 let miniPendingPoint=null,miniSoundSerial=0,artActionKey=null,rewardCollecting=false,rewardFlight=null,windWasOpen=false;
 let micro=null,microRefs=null,microReturn=null,microPointer=null,tripMoments=[];
 let journalOpen=false,journalTrigger=null,journalReturn=null,journalScroll='',journalEntries=[],journalIndex=0,journalSwipe=null,journalFlip=null;
 const journalPictures=new Map();
 let journalRoute='all',journalPageSize=window.TrailJournal.PAGE_SIZE,choiceResult=null,reward=null,rewardReturn=null,rewardScroll='';
 let storage=null;try{storage=localStorage;}catch(_){}
 let trip=D.create(state.routeId),journal=D.loadMoments(storage),natureId=null,natureNode=null,naturePoint=null,natureArt=null,lifeActors=[],footprints=[],actionStarted=-Infinity;
 // Keep the actual decoded image nodes: private hosting may revalidate a new request even for a small WebP.
 const photoCache=new Map();
 function preparePhoto(cp,priority='low'){
  const file=cp.photo.file;let entry=photoCache.get(file);
  if(entry&&!entry.failed){if(priority==='high')entry.image.setAttribute('fetchpriority','high');return entry;}
  if(!window.Image)return null;
  const image=new window.Image();entry={image,ready:false,failed:false,onChange:null};photoCache.set(file,entry);
  image.setAttribute('decoding','async');image.setAttribute('fetchpriority',priority);
  image.onload=()=>{const ready=()=>{entry.ready=true;entry.failed=false;entry.onChange?.();};try{if(image.decode)image.decode().then(ready,ready);else ready();}catch(_){ready();}};
  image.onerror=()=>{entry.failed=true;entry.ready=false;entry.onChange?.();};
  image.setAttribute('src',file);return entry;
 }
 function prepareRoutePhotos(){
  const cps=J.routeOf(state).checkpoints,keep=new Set(cps.map(cp=>cp.photo.file));
  for(const [file,e]of photoCache)if(!keep.has(file)){e.onChange=null;photoCache.delete(file);}
  cps.forEach((cp,i)=>preparePhoto(cp,i===0?'high':'low'));
  const gameArt=state.routeId==='westlake'?Object.values(window.TrailMiniGames?.waterAssets?.creek||{}):state.routeId==='mogan'?Object.values(window.TrailMiniGames?.waterAssets?.rain||{}):state.routeId==='wugong'?Object.values(window.TrailMiniGames?.wugongAssets||{}).flatMap(Object.values):[];
  const art=D.CATALOG.filter(e=>e.route===state.routeId).map(e=>e.artV5||e.artV4||e.badge).filter(Boolean);
  artCache?.prefetch([...new Set([...gameArt,...(window.TrailMiniGames?.artRouteAssets(state.routeId)||[]),'scenes/'+state.routeId+'-v1.webp',...(state.routeId==='wugong'?['sprites/wugong-swallow-kite-v1.webp','sprites/wugong-meadow-grass-v1.webp']:[]),...art])]);
 }
 function showPhotoImage(cp){
  const entry=preparePhoto(cp,'high'),previous=$('checkpoint-photo'),image=entry?.image||previous;
  if(image!==previous){previous.removeAttribute('id');image.id='checkpoint-photo';previous.replaceWith(image);}
  image.setAttribute('alt',cp.photo.alt);image.setAttribute('fetchpriority','high');
  const update=(ready,failed=false)=>{if(photoId!==cp.id||$('checkpoint-photo')!==image)return;image.hidden=!ready;image.setAttribute('aria-busy',!ready&&!failed);$('photo-loading').hidden=ready||failed;$('photo-error').hidden=!failed;};
  if(entry){entry.onChange=()=>update(entry.ready,entry.failed);entry.onChange();}
  else{update(false);image.onload=()=>update(true);image.onerror=()=>update(false,true);if(image.getAttribute('src')!==cp.photo.file)image.setAttribute('src',cp.photo.file);if(image.complete&&image.naturalWidth>0)update(true);}
 }
 function svg(tag,attrs,parent){const el=document.createElementNS(NS,tag);for(const [k,v]of Object.entries(attrs))el.setAttribute(k,String(v));if(parent)parent.appendChild(el);return el;}
 function html(tag,text,parent,cls){const el=document.createElement(tag);if(text)el.textContent=text;if(cls)el.setAttribute('class',cls);if(parent)parent.appendChild(el);return el;}
 function textWhenChanged(id,value){const node=$(id);if(node.textContent!==value)node.textContent=value;}
 function natureIcon(parent,name){if(name==='cloud'){svg('path',{d:'M-21 8Q-27 1-19-5Q-14-9-8-6Q-5-18 7-14Q17-13 17-4Q29-3 24 7Q20 12 10 10H-12Q-18 12-21 8Z',fill:'#f7fcf1',stroke:'#8ea89c','stroke-width':1.5},parent);return;}if(name.startsWith('place:')){window.TrailCheckpoints.draw(svg,parent,name.slice(6));return;}const shape=(tag,attrs)=>svg(tag,attrs,parent),path=(d,color,width=2)=>shape('path',{d,fill:'none',stroke:color,'stroke-width':width,'stroke-linecap':'round','stroke-linejoin':'round'});if(name==='bird'||name==='eagle'){L.bird(svg,parent,name==='eagle');}
  else if(name==='stones'){path('M-20 9Q-7 4 2 9T20 9','#83b5ac',2);for(const [x,y]of [[-12,0],[0,-5],[12,1]])shape('ellipse',{cx:x,cy:y,rx:7,ry:4,fill:'#acb3a0',stroke:'#839985','stroke-width':1.2});path('M-10 15H10','#a4cbb5',1.6);}
  else if(name==='tea'){path('M0 18V-13','#668450',2);shape('path',{d:'M0 2Q-20 0-19-13Q-5-15 0 2M1-2Q20-17 19-3Q13 7 1-2Z',fill:'#a9c879',stroke:'#709452','stroke-width':1.3});path('M0-8Q-6-18 0-23Q6-19 0-8','#a6c568',3);}
  else if(name==='basket'){shape('path',{d:'M-17-5Q0-18 17-5L12 14Q0 21-12 14Z',fill:'#d2b679',stroke:'#a1885a','stroke-width':1.5});for(let i=-2;i<3;i++)path(`M${i*6}-5V15`,'#9f875a',1);path('M-14 3H14M-13 9H13','#9f875a',1);}
  else if(name==='eaves'){shape('path',{d:'M-17-3H17V17H-17Z',fill:'#efe4c7',stroke:'#b6af8a','stroke-width':1.2});shape('path',{d:'M-22-4Q-12-7 0-17Q12-7 22-4L16 0H-16Z',fill:'#7b9383',stroke:'#54755f','stroke-width':1.3});path('M-4 17V5H4V17','#a28f65',2);}
  else if(name==='tide'){path('M-18-8Q-8-2 0-8T18-8','#78aeb8',2.5);path('M-19 3Q-8 10 2 3T20 3','#b9cfbc',3);path('M-15 15Q0 10 15 15','#c8b17f',1.5);}
  else if(name==='shell'){shape('path',{d:'M0 15L-17-5Q-14-18 0-18Q14-18 17-5Z',fill:'#e7d6b3',stroke:'#ac9470','stroke-width':1.5});for(const x of [-12,-6,0,6,12])path(`M0 13L${x}-12`,'#bc9f7d',1);}
  else if(name==='pier'||name==='bridge'){path('M-19-2H19M-17 6H17','#aa8760',4);path('M-15-10V14M15-10V14','#7f785c',2.5);path('M-17 17Q-8 13 0 17T18 17','#78aeb8',2);}
  else if(name==='moss'){path('M-19 9L17-6','#8b785d',9);for(const [x,y]of [[-12,6],[-3,2],[7,-2],[13,-5]])shape('ellipse',{cx:x,cy:y-3,rx:6,ry:4,fill:'#83a367'});}
  else if(name==='reflection'){shape('path',{d:'M-17 0L-2-17L14 0Z',fill:'#9bb4a4'});shape('path',{d:'M-17 5L-2 19L14 5Z',fill:'#a5c8c1',opacity:.65});path('M-20 3H20M-10 11H13','#74a6ae',1.5);}
  else if(name==='drop'){shape('path',{d:'M0-17C-2-8-12 0-10 8Q0 21 10 8C12 0 2-8 0-17Z',fill:'#95c7c6',stroke:'#6c9c99','stroke-width':1.5});path('M-5 4Q-7 11-1 12','#f2f7dc',2);}
  else if(name==='steps'){path('M-19 16H19V10H13V4H7V-2H1V-8H-5V-14H-15','#b4b197',3);path('M-16 19H17','#94a581',2);}
  else if(name==='leaf'){shape('path',{d:'M-17 13Q-25-12 18-17Q18 7-17 13Z',fill:'#bfc08a',stroke:'#8f9f65','stroke-width':1.5});path('M-17 13L14-13','#8f9f65',1.4);}
  else if(name==='butterfly'){const small=svg('g',{transform:'scale(.5)'},parent);parent.motionWings=L.butterfly(svg,small).map(part=>part.node);}
  else if(name==='flower'){path('M0 4V19M0 12Q-12 4-10 13Q-5 17 0 15','#688752',2);for(let i=0;i<5;i++){const angle=i*Math.PI*2/5;shape('circle',{cx:Math.cos(angle)*7,cy:Math.sin(angle)*7-5,r:5.5,fill:'#de957b'});}shape('circle',{cx:0,cy:-5,r:3.5,fill:'#f1d589'});}
  else if(name==='goat'){shape('ellipse',{cx:-2,cy:2,rx:12,ry:7,fill:'#e7d7b0'});shape('ellipse',{cx:11,cy:-4,rx:5,ry:7,fill:'#d2ba88'});path('M8-9Q3-17 9-17M13-10Q18-18 13-18','#756e51',2);path('M-10 7L-12 17M-2 8L0 17M6 6L9 15M-13 0L-18-5','#7e785c',3);shape('circle',{cx:13,cy:-5,r:1,fill:'#3e5143'});}
  else if(name==='tracks'){for(const [x,y]of [[-7,9],[6,-7]]){shape('ellipse',{cx:x,cy:y,rx:4.5,ry:6,fill:'#96ada8',transform:`rotate(15 ${x} ${y})`});for(const dx of [-4,0,4])shape('circle',{cx:x+dx,cy:y-8,r:1.8,fill:'#96ada8'});}}
  else if(name==='lichen'){shape('path',{d:'M-17 12L-13-7L1-15L17-3L18 12Z',fill:'#b0b4a1',stroke:'#8d9d8c','stroke-width':2});for(const [x,y,r]of [[-6,-1,5],[3,5,6],[9,-4,4]])shape('circle',{cx:x,cy:y,r,fill:'#89a36b'});}
  else if(name==='sun'){for(let i=0;i<8;i++){const a=i*Math.PI/4;path(`M${Math.cos(a)*12} ${Math.sin(a)*12}L${Math.cos(a)*17} ${Math.sin(a)*17}`,'#d8af55',2);}shape('circle',{cx:0,cy:0,r:8,fill:'#e9c56b'});path('M-19 12Q-18 3-9 7Q-3 2 2 10Q9 4 16 12','#e0e7d9',6);}
  else{shape('path',{d:'M0-18L5-5L15 0L5 5L0 18L-5 5L-15 0L-5-5Z',fill:'#e6c673',stroke:'#bbaf67','stroke-width':1});path('M-18 16Q-8 12 0 16Q8 20 18 16','#779f96',2);}
 }
 function momentContext(moment){const parts=[moment.place];if(moment.weather&&G.WEATHER[moment.weather])parts.push(G.WEATHER[moment.weather].name);if(Number.isFinite(moment.elapsed))parts.push(`走了${Math.floor(moment.elapsed/60)}分${Math.floor(moment.elapsed%60)}秒`);return parts.join(' · ');}
 function tagImage(parent,file,label,reading=false){
  const key=file+'|'+label,cached=reading&&journalPictures.get(key);
  if(cached){parent.appendChild(cached);return cached;}
  const badge=html('span',null,parent,'journal-badge-art journal-tag-art');badge.setAttribute('role','img');badge.setAttribute('aria-label',label+' · 手绘收藏标签');
  const status=html('span','画作展开中',badge,'journal-art-status'),image=html('img',null,badge,'journal-tag-image');status.setAttribute('aria-hidden','true');image.setAttribute('alt','');image.setAttribute('loading','lazy');image.setAttribute('decoding','async');image.style.opacity='0';
  if(reading){image.setAttribute('loading','eager');journalPictures.set(key,badge);}
  const reveal=()=>{status.hidden=true;image.style.opacity='1';};
  image.onload=()=>{if(reading&&image.decode)image.decode().then(reveal,reveal);else reveal();};image.onerror=()=>{status.textContent='画作暂未加载';image.hidden=true;badge.setAttribute('aria-label',label+' · 画作暂未加载，文字回忆仍可阅读');};image.setAttribute('src',file);return badge;
 }
 function momentBadge(parent,moment,reading=false){
  if(moment.edition===3&&!D.hasTag(moment)){const note=html('span',null,parent,'journal-memory-label');const sketch=svg('svg',{viewBox:'0 0 72 44','aria-hidden':'true'},note);svg('path',{d:'M8 34L25 12L37 28L47 18L65 34M20 34H54M26 38H47',fill:'none',stroke:'currentColor','stroke-width':1.3,'stroke-linecap':'round','stroke-linejoin':'round'},sketch);html('span','沿途记事',note);html('small','未获得标签',note);return note;}
  const file=D.tagArt(moment);if(file)return tagImage(parent,file,moment.tag,reading);
  const entryIndex=D.CATALOG.findIndex(entry=>entry.id===moment.id),index=entryIndex%9,badge=html('span',null,parent,'journal-badge-art');badge.setAttribute('role','img');badge.setAttribute('aria-label',moment.title+'的山野徽章');badge.style.backgroundImage=`url('badges/${['moments-v1','moments-expansion-v1','moments-westlake-v2'][Math.floor(entryIndex/9)]}.webp')`;badge.style.backgroundPosition=`${index%3*50}% ${Math.floor(index/3)*50}%`;return badge;
 }
 function setupJournalTools(){
  const dialog=$('journal-detail');
  $('journal-detail-close').addEventListener('click',()=>dialog.close());
  $('journal-detail-prev').addEventListener('click',()=>turnJournal(-1));
  $('journal-detail-next').addEventListener('click',()=>turnJournal(1));
  dialog.addEventListener('keydown',event=>{
   event.stopPropagation();
   if(event.altKey||event.ctrlKey||event.metaKey||event.shiftKey||event.target.isContentEditable||/^(INPUT|SELECT|TEXTAREA)$/.test(event.target.tagName))return;
   if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();turnJournal(event.key==='ArrowLeft'?-1:1);}
  });
  const page=$('journal-detail-page');
  page.addEventListener('pointerdown',event=>{
   journalSwipe=null;
   if(event.pointerType!=='touch'||!event.isPrimary||event.target.closest?.('button,a,summary,details'))return;
   journalSwipe={id:event.pointerId,x:event.clientX,y:event.clientY,time:event.timeStamp,scroll:page.scrollTop};
  });
  page.addEventListener('pointerup',event=>{
   const start=journalSwipe;journalSwipe=null;
   if(!start||start.id!==event.pointerId||event.timeStamp-start.time>650||Math.abs(page.scrollTop-start.scroll)>8)return;
   const dx=event.clientX-start.x,dy=event.clientY-start.y;
   if(Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy)*1.7)turnJournal(dx<0?1:-1);
  });
  page.addEventListener('pointercancel',()=>{journalSwipe=null;});
  dialog.addEventListener('close',()=>{
   if(!journalOpen)return;
   journalOpen=false;document.body.style.overflow=journalScroll;journalSwipe=null;journalFlip?.cancel();journalFlip=null;
   journalTrigger?.setAttribute('aria-expanded','false');
   if(journalReturn==='walking'&&!audioBackground&&!document.hidden)state=J.resume(state);
   journalReturn=null;uiKey='';render();updatePosition(0);ensureLoop();
   if(journalTrigger?.isConnected)journalTrigger.focus({preventScroll:true});
   journalTrigger=null;journalEntries=[];journalPictures.clear();page.replaceChildren();
  });
  for(const r of G.ROUTES){const option=html('option',r.name,$('journal-route'));option.setAttribute('value',r.id);}
  $('journal-route').addEventListener('change',()=>{journalRoute=G.ROUTES.some(r=>r.id===$('journal-route').value)?$('journal-route').value:'all';journalPageSize=window.TrailJournal.PAGE_SIZE;renderJournal();});
  $('journal-more').addEventListener('click',()=>{const previous=$('journal-list').children.length;journalPageSize+=window.TrailJournal.PAGE_SIZE;renderJournal(true);$('journal-list').children[previous]?.querySelector('button')?.focus();});
 }
 function renderJournal(append=false){
  const list=$('journal-list'),book=window.TrailJournal.page(journal,journalRoute,journalPageSize);
  $('journal-count').textContent=`${book.totalAll}个瞬间`;
  $('trip-count').textContent=`本次记下${trip.found.length}个瞬间`;
  const routeName=G.ROUTES.find(r=>r.id===journalRoute)?.name||'全部路线';
  $('journal-filter-count').textContent=book.total?`${routeName} · ${book.total}段回忆${book.remaining?`，已展示${book.entries.length}段`:''}`:`${routeName} · 等待新的回忆`;
  $('journal-more').hidden=book.remaining===0;
  $('journal-more').textContent=`再翻${Math.min(window.TrailJournal.PAGE_SIZE,book.remaining)}段回忆 ↓`;
  const offset=append?list.children.length:0;
  if(!append)list.replaceChildren();
  if(!book.total){const empty=html('li',null,list,'journal-empty');html('strong','这一页，留给下一次相遇',empty);html('p','一阵风、一片落叶，或一段安静的水声。沿途收下的手绘和回忆，会一起留在这里。',empty);return;}
  for(const moment of book.entries.slice(offset)){
   const li=html('li',null,list,'journal-entry found');li.setAttribute('data-route',moment.route);li.setAttribute('data-moment',moment.key);li.setAttribute('data-kind',D.hasTag(moment)?'tag':'note');
   const button=html('button',null,li,'journal-wall-button');button.setAttribute('type','button');button.setAttribute('aria-haspopup','dialog');button.setAttribute('aria-controls','journal-detail');button.setAttribute('aria-expanded','false');button.setAttribute('aria-label','翻看'+moment.title+' · '+moment.place);
   momentBadge(button,moment);html('strong',moment.title,button,'journal-wall-title');html('small',moment.place.split(' · ')[0],button,'journal-wall-place');const hint=html('span','翻看回忆 ↗',button,'journal-wall-hint');hint.setAttribute('aria-hidden','true');
   button.addEventListener('click',()=>openJournalDetail(moment,button));
  }
 }
 function openJournalDetail(moment,button){
  if(journalOpen||reward)return;
  journalEntries=window.TrailJournal.page(journal,journalRoute,D.MAX_MOMENTS).entries;
  journalIndex=journalEntries.findIndex(entry=>entry.route===moment.route&&entry.id===moment.id);
  if(journalIndex<0)return;
  renderJournalDetail();
  $('journal-detail').showModal();journalOpen=true;journalTrigger=button;journalReturn=state.status;button.setAttribute('aria-expanded','true');
  journalScroll=document.body.style.overflow||'';document.body.style.overflow='hidden';state=J.pause(state);
  clearMicroPointer();if(micro)micro=X.release(micro);cancelLoop();uiKey='';render();$('journal-detail-close').focus({preventScroll:true});
 }
 function turnJournal(direction){
  const next=journalIndex+direction;if(!journalOpen||next<0||next>=journalEntries.length)return;
  journalIndex=next;renderJournalDetail(direction);
 }
 function renderJournalDetail(direction=0){
  const moment=journalEntries[journalIndex],page=$('journal-detail-page');journalFlip?.cancel();journalFlip=null;page.replaceChildren();page.scrollTop=0;
   if(D.hasTag(moment)){const art=html('div',null,page,'journal-illustration');momentBadge(art,moment,true);html('span','一幅手绘，留住这一刻',art,'journal-art-caption');}
   const copy=html('div',null,page,'journal-copy');
   html('p',moment.place,copy,'journal-location');
   const title=html('h3',moment.title,copy,'journal-entry-title');title.id='journal-detail-title';
   html('p',moment.memory,copy,'journal-memory');
   const meta=html('div',null,copy,'journal-entry-meta');
   if(Number.isFinite(moment.createdAt)){const date=new Date(moment.createdAt),time=html('time',date.toLocaleString('zh-CN',{year:'numeric',month:'long',day:'numeric',hour:'2-digit',minute:'2-digit'}),meta,'journal-time');time.setAttribute('datetime',date.toISOString());}
   else html('span','从旧手帐留下',meta,'journal-time');
   if(!D.hasTag(moment))html('span','沿途记事',meta,'journal-entry-kind');
   const weather=G.WEATHER[moment.weather];if(weather)html('span',weather.name,meta,'journal-entry-weather');
   const proof=moment.edition===3?window.TrailRouteMoments.evidence(moment.id):null,note=proof?{fact:proof.fact}:K.observation(moment.id),source=proof||(note&&K.source(note.source));
   if(note&&source){const detail=html('details',null,copy,'journal-place-note');html('summary','关于这片山野',detail);html('p',note.fact,detail);const link=html('a',source.name+' ↗',detail,'journal-source');link.setAttribute('href',source.url);link.setAttribute('target','_blank');link.setAttribute('rel','noopener noreferrer');}
  $('journal-detail-route').textContent=G.ROUTES.find(route=>route.id===moment.route)?.name||moment.place;
  $('journal-detail-position').textContent=`${journalIndex+1} / ${journalEntries.length}`;
  $('journal-detail-announcement').textContent=`第${journalIndex+1}段，共${journalEntries.length}段：${moment.title}`;
  const previous=journalEntries[journalIndex-1],next=journalEntries[journalIndex+1];
  for(const [id,entry,label] of [['journal-detail-prev',previous,'上一枚'],['journal-detail-next',next,'下一枚']]){
   const control=$(id);control.setAttribute('aria-disabled',!entry);control.setAttribute('aria-label',entry?label+'：'+entry.title:label==='上一枚'?'已是第一枚':'已是最后一枚');
  }
  $('journal-detail-hint').textContent=journalEntries.length===1?'这一刻，值得留住':!previous?'从这一枚，慢慢翻看':!next?'已翻到最后一枚':'左右翻看沿途回忆';
  // Retain decoded current/adjacent pictures only; back-and-forth paging reuses nodes.
  const keep=new Set();
  for(const entry of [previous,moment,next].filter(Boolean)){
   const file=D.hasTag(entry)&&D.tagArt(entry);if(!file)continue;
   const key=file+'|'+entry.tag;keep.add(key);
   if(!journalPictures.has(key))tagImage(html('div'),file,entry.tag,true);
  }
  for(const key of journalPictures.keys())if(!keep.has(key))journalPictures.delete(key);
  if(direction&&!motionReduced&&page.animate)journalFlip=page.animate([{opacity:.35,transform:`translateX(${direction*16}px)`},{opacity:1,transform:'translateX(0)'}],{duration:220,easing:'ease-out'});
 }
 function renderEndingJournal(){const section=$('ending-journal'),list=$('ending-badges'),detail=$('ending-detail');const collected=tripMoments.filter(D.hasTag);section.hidden=!collected.length;list.replaceChildren();detail.textContent='';for(const moment of collected){const button=html('button',null,list,'ending-badge-button');button.setAttribute('type','button');button.setAttribute('aria-expanded','false');button.setAttribute('aria-controls','ending-detail');button.setAttribute('aria-label','翻看'+moment.title);momentBadge(button,moment);html('small',moment.title,button);button.addEventListener('click',()=>{const open=button.getAttribute('aria-expanded')==='true';for(const b of list.children)b.setAttribute('aria-expanded','false');button.setAttribute('aria-expanded',!open);detail.textContent=open?'':moment.place+' · '+moment.memory;});}}
 function fillNature(prefix,note){
 const box=$(prefix);box.hidden=!note;if(!note)return;
 $(prefix+'-title').textContent=note.title;$(prefix+'-look').textContent=note.look;$(prefix+'-fact').textContent=note.fact;
 const source=K.source(note.source),a=$(prefix+'-source');a.hidden=!source;if(source){a.textContent=source.name+' ↗';a.setAttribute('href',source.url);a.setAttribute('target','_blank');a.setAttribute('rel','noopener noreferrer');}
}
 function discovery(){return photoReturn||micro||reward?null:D.visible(state,trip);}
 function renderDiscovery(){const active=discovery();$('observe-button').hidden=!active;if(active){const entry=D.item(active.id);$('observe-name').textContent=`${entry.interaction?'看看':'记住'} · ${entry.name}`;$('observe-hint').textContent=entry.hint;}$('trip-count').textContent=`本次记下${trip.found.length}个瞬间`;if((active?.id||null)===natureId)return;natureId=active?.id||null;natureNode=null;naturePoint=null;natureArt=null;$('nature-discoveries').replaceChildren();if(!active)return;const entry=D.item(active.id);
  const point=G.position({routeId:state.routeId,distance:G.metric(state.routeId).total*(active.at+.045)}),[x,y]=projection.point(point.lon,point.lat),g=svg('g',{id:'active-discovery',role:'button',tabindex:0,class:'nature-marker','aria-label':`记住${D.item(active.id).name}`,'data-discovery':active.id},$('nature-discoveries'));naturePoint=[Math.max(48,Math.min(672,x+active.side*42)),Math.max(55,Math.min(530,y-42))];natureNode=g;svg('circle',{r:42,fill:'transparent'},g);svg('circle',{r:D.item(active.id).icon==='butterfly'?14:22,fill:entry.interaction?'transparent':'#fffaf0',stroke:entry.interaction?'none':'#dac691','stroke-width':1.5},g);natureArt=svg('g',{},g);if(entry.edition===3)svg('image',{href:entry.artV5||entry.artV4||entry.badge,x:-24,y:-24,width:48,height:48,'aria-hidden':'true'},natureArt);else natureIcon(natureArt,D.item(active.id).icon);const label=svg('text',{y:D.item(active.id).icon==='butterfly'?28:37,'text-anchor':'middle',fill:'#557350','font-size':11,'font-weight':600},g);label.textContent=entry.interaction?'看看这里':'记住这一刻';const collect=e=>{e.stopPropagation?.();captureDiscovery(active.id);};g.addEventListener('click',collect);g.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();collect(e);}});
 }
 function animateDiscovery(){if(!natureNode)return;const icon=D.item(natureId).icon,p=D.item(natureId).edition===3?{angle:0,wing:1}:L.creature(icon,state.elapsed,motionReduced);natureNode.setAttribute('transform',`translate(${naturePoint[0].toFixed(2)} ${(naturePoint[1]+(motionReduced?0:Math.sin(state.elapsed*2.2)*1.5)).toFixed(2)})`);natureArt.setAttribute('transform',`rotate(${p.angle.toFixed(2)})`);for(const wing of natureArt.motionWings||[])wing.setAttribute('transform',`scale(${p.wing.toFixed(3)} 1)`);}
 function saveMoment(moment,entry){
  if(!moment||!D.hasTag(moment))return;
  tripMoments.push(moment);actionStarted=state.elapsed;playTransition('discovery',moment.title,null,entry.icon);
  state={...state,memories:[...state.memories,moment.memory]};
  const result=window.TrailJournal.remember(journal,moment);
  if(result.status==='full')$('journal-storage').textContent='手帐已满，原回忆已保留。这个新片刻仍可在本次旅程结尾查看。';
  else if(result.status!=='unchanged'){
   journal=result.moments;
   const saved=D.saveMoments(storage,journal);
   $('journal-storage').textContent=saved?'回忆自动保存在这个浏览器，相同的片刻只留一页。':'这个浏览器无法保存手帐，本次打开页面期间仍可以记下瞬间。';
  }
  const message=result.status==='unchanged'?'再次遇见，手帐中已留存':result.status==='upgraded'?'手帐已补上手绘':D.hasTag(moment)?'刚刚收下标签':'刚刚记下一段回忆';
  $('discovery-status').textContent=`${message}「${moment.title}」 · ${moment.place}`;
  echo=moment.memory;echoUntil=state.elapsed+7;renderJournal();uiKey='';render();updatePosition(0);
 }
 function captureDiscovery(id){const active=discovery();if(!active||active.id!==id)return;const entry=D.item(id);if(entry.interaction){beginMicro(entry);return;}const next=D.capture(state,trip,id);if(next===trip)return;trip=next;saveMoment(D.moment(state,trip,id,{weather:J.weather(state)}),entry);}
 function beginMicro(entry){
  const games=window.TrailMiniGames;windWasOpen=!!games?.kinds[entry.id];$('mini-retry').disabled=false;miniPendingPoint=null;miniSoundSerial=0;artActionKey=null;microReturn=state.status;state=J.pause(state);cancelLoop();
  micro=X.create(entry,{reduced:motionReduced});$('micro-art').replaceChildren();microRefs=X.draw(svg,$('micro-art'),entry);if(microRefs.art)microRefs.contentState='loading';X.paint(microRefs,micro,motionReduced);
  $('wugong-tools').hidden=true;$('art-tools').hidden=true;$('micro-panel').setAttribute('data-art-game',microRefs.art?'true':'false');$('micro-panel').setAttribute('data-game',micro.game||'');$('wind-hud').hidden=!micro.game||!!microRefs.art;$('mini-place-label').textContent=({wind:'武功山 · 借风',clouds:'武功山 · 风路疏云',altar:'武功山 · 金顶石语',greet:'武功山 · 风口相遇',creek:'九溪 · 推叶',rain:'莫干山 · 接雨'})[micro.game]||'';$('mini-controls').hidden=!micro.game;
  artCache?.request(entry.artV5||entry.artV4||entry.badge,'high');$('micro-place').textContent=entry.place+' · '+entry.condition;$('micro-title').textContent=entry.name;$('micro-instruction').textContent=X.instruction(entry);$('micro-surface').setAttribute('aria-label',$('micro-instruction').textContent);$('micro-result').textContent=X.status(micro);updateMicroStatus();$('micro-panel').hidden=false;uiKey='';render();
  const assets=games?.artAssets[micro.game]||games?.wugongAssets[micro.game]||games?.waterAssets[micro.game],scene=assets?.scene||'scenes/'+entry.route+'-v1.webp',actor=entry.id==='meadow-bird'?'sprites/wugong-swallow-kite-v1.webp':assets?.actor,front=entry.id==='meadow-bird'?'sprites/wugong-meadow-grass-v1.webp':micro.game==='creek'?assets.stone:assets?.front;
  const sceneAsset=artCache?.request(scene,'high'),actorAsset=actor?artCache?.request(actor,'high'):null,frontAsset=front?artCache?.request(front,'high'):null;
  if(microRefs.story||microRefs.art){const refs=microRefs;refs.contentState=sceneAsset?'loading':'error';Promise.all([sceneAsset,actorAsset].filter(Boolean).map(item=>item.promise)).then(items=>{if(refs.disposed||microRefs!==refs)return;refs.contentState=sceneAsset&&items.every(item=>item.state==='ready')&&(!assets?.actor||actorAsset)?'ready':'error';updateMicroStatus();});}
  games?.mount(microRefs,window.PIXI,$('micro-surface'),sceneAsset,actorAsset,frontAsset);$('micro-surface').focus({preventScroll:true});ensureLoop();
 }
 function microPoint(event){const rect=$('micro-surface').getBoundingClientRect(),p={x:(event.clientX-rect.left)/rect.width,y:(event.clientY-rect.top)/rect.height};return window.TrailMiniGames?.point(microRefs,p)||p;}
 function updateWugongTools(f){
  const c=f.controls,box=$('wugong-tools');box.hidden=!c;if(!c)return;
  textWhenChanged('wugong-speaker',c.speaker);textWhenChanged('wugong-line',c.line);
  const loading=microRefs?.contentState==='loading',failed=microRefs?.contentState==='error';
  if((micro.game==='clouds'||micro.stage==='camera')&&(loading||failed))textWhenChanged('wugong-line',failed?'画作暂未加载，请点「重新试一次」重新展开。':'画作正在展开，稍等片刻就能操作。');
  for(const [id,action]of [['wugong-primary',c.primary],['wugong-secondary',c.secondary]]){const button=$(id);button.hidden=!action;if(action){textWhenChanged(id,action.label);button.setAttribute('data-action',action.action);button.disabled=!!action.disabled||((action.action==='send'||action.action==='shutter')&&(loading||failed));}}
  $('wugong-clear').hidden=!c.clear;$('wugong-clear').disabled=!!micro.flight||micro.play.complete;$('wugong-zoom').hidden=!c.zoom;
  $('wugong-zoom-in').disabled=micro.camera?.zoom>=1.44;$('wugong-zoom-out').disabled=micro.camera?.zoom<=.86;
 }
 function artReady(){return !!microRefs?.art&&microRefs.contentState==='ready';}
 function updateArtTools(f){
  const box=$('art-tools'),waiting=!artReady();box.hidden=false;
  textWhenChanged('art-kicker',f.kicker);textWhenChanged('art-count',f.counter);textWhenChanged('art-title',micro.play.complete?'这一幅，慢慢完整了':f.title);
  textWhenChanged('art-cue',waiting?(microRefs.contentState==='error'?'画作暂未加载，请点「重新试一次」重新展开。':'水彩画作正在展开，准备好就能操作。'):f.cue);
  const actions=f.controls,key=actions.map(c=>c.action).join('|');
  if(key!==artActionKey){$('art-actions').replaceChildren();for(const item of actions){const button=html('button',item.label,$('art-actions'));button.type='button';button.setAttribute('data-action',item.action);}artActionKey=key;}
  for(const item of actions){const button=$('art-actions').querySelector('[data-action="'+item.action+'"]');if(!button)continue;if(button.textContent!==item.label)button.textContent=item.label;button.disabled=waiting||!!item.disabled;button.setAttribute('data-primary',item.primary?'true':'false');}
  const sling=micro.game==='sling';$('art-aim').hidden=!sling||micro.play.complete;
  if(sling){const angle=Math.round(micro.sling.angle),power=Math.round(micro.sling.power*100);if($('art-angle').value!==String(angle))$('art-angle').value=angle;if($('art-power').value!==String(power))$('art-power').value=power;textWhenChanged('art-angle-value',angle+'°');textWhenChanged('art-power-value',power+'%');for(const id of ['art-angle','art-power'])$(id).disabled=waiting||micro.sling.stage!=='ready';}
  textWhenChanged('art-key-hint',({puzzle:'1–6 选片 · Q / E 旋转 · 方向键选格 · Enter 放下',match:'方向键选格 · Enter 选中／交换 · R 重试',sling:'方向键调整 · 按住空格蓄力、松开发射 · R 重试'})[micro.game]);
  $('micro-surface').setAttribute('aria-busy',waiting?'true':'false');$('mini-retry').disabled=micro.play.complete;
 }
 function updateMicroStatus(){if(!micro)return;if(window.TrailMiniGames?.artAssets[micro.game]){
   const f=window.TrailMiniGames.artFlow(micro);$('micro-panel').setAttribute('data-phase',f.phase);updateArtTools(f);
  }else if(window.TrailMiniGames?.wugongAssets[micro.game]){
   const f=window.TrailMiniGames.wugongFlow(micro),panel=$('micro-panel');if(panel.getAttribute('data-phase')!==f.phase)panel.setAttribute('data-phase',f.phase);panel.setAttribute('data-story-stage',micro.stage||'');textWhenChanged('wind-stage-name',f.stage);textWhenChanged('wind-count',f.counter||f.count+' / '+f.total+' '+f.unit);textWhenChanged('wind-cue',f.cue);
   $('wind-steady-fill').style.width=(f.hold*100)+'%';$('wind-hud').setAttribute('data-in-wind',micro.near?'true':'false');for(let i=0;i<3;i++)$('wind-feather-'+i).setAttribute('data-earned',i<micro.gates?'true':'false');
   if(f.story)updateWugongTools(f);
   const title=f.story?(f.phase==='memory'?'这一刻，值得留下':f.phase==='soar'?(micro.game==='clouds'?'草脊，浮出云海':'下次山里见'):''):f.phase==='invite'?f.title:f.phase==='caught'?'这一处，留住了':f.phase==='soar'?'把一段石语留在心里':f.phase==='memory'?'这一刻，值得留下':'';
   $('wind-chapter').hidden=!title;textWhenChanged('wind-chapter-title',title);textWhenChanged('wind-chapter-kicker',f.kicker);textWhenChanged('wind-chapter-copy',f.phase==='invite'?f.invitation:f.phase==='memory'?'正在展开你的手绘纪念':micro.game==='greet'?'相遇很短，笑容留在了画里。':micro.game==='clouds'?'雾散在山坳，云仍留在谷中。':'石头留在原处，回忆带在身边。');$('mini-retry').disabled=micro.play.complete;
  }else if(micro.game==='wind'){
   const f=window.TrailMiniGames.flow(micro),stage=window.TrailMiniGames.windNames[Math.min(2,micro.gates)],panel=$('micro-panel');
   if(panel.getAttribute('data-phase')!==f.phase)panel.setAttribute('data-phase',f.phase);if($('wind-stage-name').textContent!==(stage))$('wind-stage-name').textContent=stage;if($('wind-count').textContent!==(micro.gates+' / 3 阵风'))$('wind-count').textContent=micro.gates+' / 3 阵风';
   if($('wind-cue').textContent!==f.cue)$('wind-cue').textContent=f.cue;
   $('wind-steady-fill').style.width=(micro.windHold/2.6*100)+'%';$('wind-hud').setAttribute('data-in-wind',micro.windNear?'true':'false');
   for(let i=0;i<3;i++)$('wind-feather-'+i).setAttribute('data-earned',i<micro.gates?'true':'false');
   const chapter=f.phase==='invite'?'借一阵草甸的风':f.phase==='caught'?f.cue:f.phase==='soar'?'把风借给远方':f.phase==='memory'?'这一刻，值得留下':'';
   if($('wind-chapter-title').textContent!==(chapter))$('wind-chapter-title').textContent=chapter;$('wind-chapter').hidden=!chapter;
   $('wind-chapter-kicker').textContent=f.phase==='invite'?'武功山 · 山野小事':f.phase==='caught'?stage:'草浪来信';
   $('wind-chapter-copy').textContent=f.phase==='invite'?'让草浪告诉你，风往哪里去。':f.phase==='caught'?'下一阵风，在更高处。':f.phase==='memory'?'正在展开你的手绘纪念':'纸鸢越过山脊，云海在眼前展开。';
   $('mini-retry').disabled=micro.play.complete;
   audioPlayer.wind?.(micro.windNear?micro.windHold/2.6:0,micro.play.complete);
  }else if(micro.game){
   const f=window.TrailMiniGames.waterFlow(micro),rain=micro.game==='rain',panel=$('micro-panel');
   panel.setAttribute('data-phase',f.phase==='settle'?'soar':f.phase);$('wind-stage-name').textContent=rain?'把雨接成一首歌':['初入浅溪','绕过青石','漂向下游'][Math.min(2,micro.gates)];
   $('wind-count').textContent=f.count+' / '+f.total+(rain?' 滴雨':' 处水口');$('wind-cue').textContent=f.cue;$('wind-steady-fill').style.width=(micro.play.progress*100)+'%';$('wind-hud').setAttribute('data-in-wind',f.pulse>0?'true':'false');
   for(let i=0;i<3;i++)$('wind-feather-'+i).setAttribute('data-earned',i<micro.gates?'true':'false');
   const title=f.phase==='invite'?(rain?'听一筒竹林的雨':'陪一片叶子顺流而下'):f.phase==='memory'?'这一刻，值得留下':f.phase==='settle'?(rain?'八滴雨，一段回声':'把溪声寄向远方'):'';
   $('wind-chapter').hidden=!title;$('wind-chapter-title').textContent=title;$('wind-chapter-kicker').textContent=rain?'莫干山 · 竹雨成曲':'九溪 · 一叶顺流';$('wind-chapter-copy').textContent=f.phase==='invite'?(rain?'看叶尖蓄水，让竹筒等在雨滴下面。':'水纹有方向，轻轻拨水，绕过青石。'):f.phase==='memory'?'正在展开你的手绘纪念':rain?'雨滴在竹筒里，留下最后一圈涟漪。':'落叶慢慢漂远，溪水还在轻轻流。';
   $('mini-retry').disabled=micro.play.complete;
  } if(micro.game){for(const e of micro.events)if(e.serial>miniSoundSerial){audioPlayer.mini?.(micro.game,e.type,{x:e.x,index:e.index??(micro.caught||micro.gates)});miniSoundSerial=e.serial;}textWhenChanged('mini-sound',sound?'声音 · 开':'声音 · 点击开启');$('mini-sound').setAttribute('aria-pressed',sound);}const progress=Math.round(micro.play.progress*100);$('micro-progress').setAttribute('aria-valuenow',progress);$('micro-progress-fill').style.width=progress+'%';const next=microRefs?.art&&!artReady()?$('art-cue').textContent:X.status(micro);if($('micro-result').textContent!==next)$('micro-result').textContent=next;}
 function clearMicroPointer(){miniPendingPoint=null;if(microPointer){try{if($('micro-surface').hasPointerCapture?.(microPointer.id))$('micro-surface').releasePointerCapture(microPointer.id);}catch(_){}microPointer=null;}}
 function performMicro(point={}){if(!micro||audioBackground||document.hidden||microRefs?.art&&!artReady())return;if(microRefs?.story&&['loading','error'].includes(microRefs.contentState)&&(point.action==='send'||point.action==='shutter'||point.assist&&micro.game==='greet'&&micro.stage==='camera'))return;const next=X.act(micro,point);if(next===micro)return;micro=next;if(!micro.game)X.paint(microRefs,micro,motionReduced);updateMicroStatus();if(!micro.game)audioPlayer.interact?.(micro.kind,{x:micro.x,icon:D.item(micro.id).icon,playType:micro.play.type});uiKey='';render();ensureLoop();}
 function showReward(moment,previous){rewardCollecting=false;reward=moment;$('reward-overlay').setAttribute('data-wind',window.TrailMiniGames?.kinds[moment.id]?'true':'false');$('reward-overlay').setAttribute('data-collecting','false');$('reward-continue').disabled=false;$('reward-continue').textContent=window.TrailMiniGames?.kinds[moment.id]?'收进手帐，继续走 →':'收好徽章 →';rewardReturn=previous;state=J.pause(state);const file=D.tagArt(moment),cached=artCache?.request(file,'high');
  const display=()=>{if(reward!==moment)return;let image=$('reward-art');if(cached?.state==='ready'&&cached.image!==image){image.removeAttribute('id');cached.image.id='reward-art';cached.image.setAttribute('class','reward-art');image.replaceWith(cached.image);image=cached.image;}if(!cached)image.setAttribute('src',file);image.setAttribute('alt',moment.tag+' · 手绘水彩徽章');image.hidden=!!cached&&cached.state!=='ready';$('reward-loading').hidden=!cached||cached.state==='ready';$('reward-loading').textContent=cached?.state==='error'?'画作暂未加载，可收好后在手帐查看。':'正在展开手绘纪念…';};if(cached)cached.onChange=display;display();$('reward-title').textContent=moment.tag;$('reward-place').textContent=moment.place;$('reward-copy').textContent=D.item(moment.id).result;$('reward-overlay').hidden=false;$('app-main').setAttribute('inert','');rewardScroll=document.body.style.overflow||'';document.body.style.overflow='hidden';uiKey='';render();cancelLoop();$('reward-continue').focus({preventScroll:true});if(window.TrailMiniGames?.kinds[moment.id])audioPlayer.mini?.(window.TrailMiniGames.kinds[moment.id],'reveal');}
 function closeReward(resume=true){if(!reward)return;rewardFlight?.cancel();rewardFlight=null;rewardCollecting=false;$('wind-keepsake').hidden=true;const previous=rewardReturn;reward=null;rewardReturn=null;$('reward-overlay').hidden=true;$('app-main').removeAttribute('inert');document.body.style.overflow=rewardScroll;if(resume&&previous==='walking'&&!audioBackground&&!document.hidden)state=J.resume(state);uiKey='';render();updatePosition(0);if(resume){$('walk-toggle').focus({preventScroll:true});if(windWasOpen&&!motionReduced)$('journey-stage').animate?.([{opacity:.6,transform:'scale(.985)'},{opacity:1,transform:'scale(1)'}],{duration:450,easing:'ease-out'});}ensureLoop();}
 function collectReward(){
  if(!reward||rewardCollecting)return;
  if(!window.TrailMiniGames?.kinds[reward.id]||motionReduced||!$('reward-dialog').animate){closeReward();return;}
  rewardCollecting=true;const current=reward;audioPlayer.mini?.(window.TrailMiniGames.kinds[reward.id],'collect');$('reward-continue').disabled=true;$('reward-overlay').setAttribute('data-collecting','true');$('wind-keepsake').hidden=false;
  const box=$('reward-dialog').getBoundingClientRect(),target=$('wind-keepsake').getBoundingClientRect(),dx=target.left+target.width/2-box.left-box.width/2,dy=target.top+target.height/2-box.top-box.height/2;
  let animation;try{animation=rewardFlight=$('reward-dialog').animate([{transform:'translate(0,0) scale(1) rotate(0)',opacity:1},{transform:'translate(0,-16px) scale(1.025) rotate(-2deg)',opacity:1,offset:.2},{transform:`translate(${dx}px,${dy}px) scale(.08) rotate(6deg)`,opacity:0}],{duration:680,easing:'cubic-bezier(.55,0,.25,1)',fill:'forwards'});}catch(_){closeReward();return;}
  // Rejection (for example cancellation) must never leave a modal trapped on screen.
  const finish=()=>{if(reward===current&&rewardFlight===animation)closeReward();};animation.finished.then(finish,finish);
 }
 function finishMicro(record=true,resume=true){if(!micro)return;clearMicroPointer();const finished=micro,previous=microReturn,entry=D.item(finished.id);window.TrailMiniGames?.dispose(microRefs);miniPendingPoint=null;micro=null;microRefs=null;microReturn=null;microPointer=null;$('micro-panel').hidden=true;cancelLoop();let moment=null;if(record&&finished.play?.complete===true){const next=D.capture(state,trip,finished.id);if(next!==trip){trip=next;moment=D.moment(state,trip,finished.id,{weather:J.weather(state),experience:X.outcome(finished,entry)});saveMoment(moment,entry);}}if(moment&&D.hasTag(moment)){showReward(moment,previous);return;}if(resume&&previous==='walking'&&!audioBackground&&!document.hidden)state=J.resume(state);uiKey='';render();updatePosition(0);if(resume)$('walk-toggle').focus({preventScroll:true});ensureLoop();}


 function world(lon,lat){return [lon*rad*R,Math.log(Math.tan(Math.PI/4+lat*rad/2))*R];}
 function fitProjection(line,w=720,h=600,pad=50){const coords=line.map(p=>world(p[0],p[1])),xs=coords.map(p=>p[0]),ys=coords.map(p=>p[1]),minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys),scale=Math.min((w-pad*2)/Math.max(1,maxX-minX),(h-pad*2)/Math.max(1,maxY-minY)),ox=(w-(maxX-minX)*scale)/2,oy=(h-(maxY-minY)*scale)/2;return {scale,minX,maxY,ox,oy,point(lon,lat){const [x,y]=world(lon,lat);return [ox+(x-minX)*scale,oy+(maxY-y)*scale];},inverse(x,y){const wx=minX+(x-ox)/scale,wy=maxY-(y-oy)/scale;return [wx/R/rad,(2*Math.atan(Math.exp(wy/R))-Math.PI/2)/rad];}};}
 function lineD(line,p=projection){return line.map((c,i)=>{const [x,y]=p.point(c[0],c[1]);return `${i?'L':'M'}${x.toFixed(2)},${y.toFixed(2)}`;}).join(' ');}

 function cartoonLine(line,p=projection){const points=line.map(c=>p.point(c[0],c[1]));function reduce(pts){if(pts.length<3)return pts;const a=pts[0],b=pts.at(-1),dx=b[0]-a[0],dy=b[1]-a[1];let max=0,index=0;for(let i=1;i<pts.length-1;i++){const t=Math.max(0,Math.min(1,((pts[i][0]-a[0])*dx+(pts[i][1]-a[1])*dy)/(dx*dx+dy*dy||1))),d=Math.hypot(pts[i][0]-a[0]-t*dx,pts[i][1]-a[1]-t*dy);if(d>max){max=d;index=i;}}return max>2.5?[...reduce(pts.slice(0,index+1)).slice(0,-1),...reduce(pts.slice(index))]:[a,b];}return reduce(points).map((pt,i)=>`${i?'L':'M'}${pt[0].toFixed(2)},${pt[1].toFixed(2)}`).join(' ');}
 function drawMap(){const r=J.routeOf(state);projection=fitProjection(r.geo.line,720,600,85);view={x:0,y:0,w:720,h:600};$('map').setAttribute('viewBox','0 0 720 600');for(const id of ['geo-background','geo-labels','geo-markers','online-tiles','nature-discoveries','scene-life','trail-footprints'])$(id).replaceChildren();
 const projected=r.geo.line.map(p=>[...projection.point(p[0],p[1]),p[2]]),context={features:[...r.geo.background.filter(f=>['water','cable','coast'].includes(f.kind)),...(window.TrailLandscapeData?.[r.geoId]?.features||[])].map(f=>({...f,line:f.line.map(p=>projection.point(p[0],p[1]))})),peaks:r.geo.labels.map(p=>({...p,x:projection.point(p.lon,p.lat)[0],y:projection.point(p.lon,p.lat)[1]}))};
 scenePlan=window.TrailScenery.build(r,projected,context);
 $('journey-stage').setAttribute('data-art',scenePlan.artDetail?'picturebook':'classic');
 for(const [name,features]of Object.entries(scenePlan.layers)){const group=svg('g',{'data-layer':name},$('geo-background'));if(name==='clouds'||name==='mist'){const nodes=name==='clouds'?cloudNodes:mistNodes;nodes.length=0;const groups=new Map();for(const f of features){const key=f.cloud||f.mist;if(!groups.has(key))groups.set(key,[]);groups.get(key).push(f);}for(const shapes of groups.values()){const node=svg('g',name==='mist'?{filter:'url(#mist-local-soften)'}:{},group);for(const f of shapes)svg(f.tag,Object.fromEntries(window.TrailScenery.attributes(f)),node);nodes.push(node);}}else for(const f of features)svg(f.tag,Object.fromEntries(window.TrailScenery.attributes(f)),group);}
 if(!scenePlan.artDetail){const title=svg('text',{x:32,y:38,fill:'#66825d','font-size':22,'font-weight':700},$('geo-labels'));title.textContent=r.name;}
 for(const peak of scenePlan.terrain.peaks){if(!['荞麦梁','鳌山','太白梁','拔仙台','幺妹峰','婆缪峰','莫干岭','西灣山','西湾山'].includes(peak.name))continue;const text=svg('text',{x:Math.max(40,Math.min(660,peak.x)),y:Math.max(60,peak.y-13),'text-anchor':'middle',fill:'#5b7970','font-size':11,'font-weight':600,'data-peak':peak.osmId},$('geo-labels'));text.textContent=peak.name;}
 lifeActors=L.mount(svg,$('scene-life'),L.build(scenePlan.theme,projected,{water:scenePlan.terrain.water}));footprints=[];if(r.theme==='snow')for(let i=0;i<8;i++)footprints.push(svg('ellipse',{rx:1.8,ry:3.6,fill:'#72918a',opacity:0},$('trail-footprints')));
 if(sceneRenderer?.alive)sceneRenderer.setPlan(scenePlan);
 $('route-outline').setAttribute('d',cartoonLine(r.geo.line));$('route-line').setAttribute('d',cartoonLine(r.geo.line));

 const start=G.position({routeId:r.id,distance:0}),[sx,sy]=projection.point(start.lon,start.lat);svg('circle',{cx:sx,cy:sy,r:7,fill:'#537c60',stroke:'#fffdf0','stroke-width':3},$('geo-markers'));
 const labels=[];$('checkpoint-list').replaceChildren();for(const [i,cp]of r.checkpoints.entries()){
  const pos=G.position({routeId:r.id,distance:G.metric(r.id).total*cp.fraction}),[x,y]=projection.point(pos.lon,pos.lat),g=svg('g',{id:`marker-${cp.id}`,role:'button',tabindex:0,class:'checkpoint-marker',transform:`translate(${x.toFixed(2)} ${y.toFixed(2)})`,'aria-label':cp.name,'aria-controls':'photo-panel'},$('geo-markers'));
  svg('circle',{r:35,fill:'transparent','aria-hidden':'true'},g);
  svg('circle',{r:26,fill:'none',stroke:'#537f57','stroke-width':3,class:'checkpoint-focus',opacity:0,'pointer-events':'none','aria-hidden':'true'},g);
  svg('circle',{r:21,fill:'#fffaf0',stroke:'#bf9c65','stroke-width':2,class:'checkpoint-badge','aria-hidden':'true'},g);
  window.TrailCheckpoints.draw(svg,g,cp.id);
  let lx=Math.max(80,Math.min(640,x)),ly=y+(y>450?-37:39);if(labels.some(p=>Math.abs(p[0]-lx)<155&&Math.abs(p[1]-ly)<28))ly+=32;labels.push([lx,ly]);
  const label=svg('text',{x:lx-x,y:ly-y,'text-anchor':'middle',fill:'#4f694c','font-size':12,'font-weight':600,class:'checkpoint-label','pointer-events':'none'},g);label.textContent=cp.name;
  const open=e=>{e.stopPropagation?.();openMemory(cp.id);};g.addEventListener('click',open);g.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open(e);}});g.addEventListener('pointerdown',e=>e.stopPropagation?.());
  const li=html('li',null,$('checkpoint-list')),button=html('button',null,li,'checkpoint-button');button.id=`checkpoint-${cp.id}`;button.setAttribute('type','button');
  const badge=html('span',null,button,'checkpoint-number'),art=svg('svg',{viewBox:'-20 -20 40 40','aria-hidden':'true'},badge);window.TrailCheckpoints.draw(svg,art,cp.id);
  const span=html('span',null,button);html('strong',cp.name,span);const hint=html('small','沿途慢慢发现',span);hint.id=`checkpoint-hint-${cp.id}`;button.addEventListener('click',()=>openMemory(cp.id));
 }
 updatePosition(0);}
 function describeRoute(){const r=J.routeOf(state);$('stage-location').textContent=r.name;$('route-title').textContent=r.name;$('route-context').textContent='跟着山径走一走，收下沿途照片，也把喜欢的瞬间留在手帐。';$('route-notice').textContent=r.notice;$('route-sources').replaceChildren();const a=html('a','查看参考路线来源 ↗',$('route-sources'));a.setAttribute('href',r.geo.source.url);a.setAttribute('target','_blank');a.setAttribute('rel','noopener noreferrer');const credit=html('a','地图来源：© OpenStreetMap contributors ↗',$('route-sources'));credit.setAttribute('href','https://www.openstreetmap.org/copyright');credit.setAttribute('target','_blank');credit.setAttribute('rel','noopener noreferrer');for(const r of G.ROUTES)$(`route-${r.id}`).setAttribute('aria-pressed',r.id===state.routeId);}
 function drawPicker(){for(const r of G.ROUTES){const b=html('button',null,$('route-cards'),`route-card theme-${r.theme}`);b.id=`route-${r.id}`;b.setAttribute('type','button');b.setAttribute('aria-pressed',r.id===state.routeId);html('strong',r.name,b);html('small',r.id==='westlake'?'溪水、茶叶与小遇见':({snow:'风雪与山脊',gorge:'江声与山径',meadow:'草甸与云海',coast:'海湾与潮声',forest:'森林与溪谷',bamboo:'竹林与石阶',tea:'溪谷与茶园'})[r.theme],b);const art=svg('svg',{viewBox:'0 0 120 100',class:'route-mini','aria-hidden':'true'},b),p=fitProjection(r.geo.line,120,100,12);svg('path',{d:lineD(r.geo.line,p),fill:'none',stroke:'#52764f','stroke-width':3},art);b.addEventListener('click',()=>selectRoute(r.id));}}
 function position(){return G.position({routeId:state.routeId,distance:G.metric(state.routeId).total*state.progress});}
 function updatePosition(smoothing=.14){if(!projection)return;const p=position(),[x,y]=projection.point(p.lon,p.lat);const full=overview||state.status==='ready'||motionReduced,w=full?720:470,h=full?600:Math.min(600,w/(($('map-frame').getBoundingClientRect().width||720)/($('map-frame').getBoundingClientRect().height||600))),target={x:full?0:Math.max(0,Math.min(720-w,x-w/2)),y:full?0:(photoId?Math.max(-80,Math.min(600-h+400,y-h*.24)):Math.max(0,Math.min(600-h,y-h*.54))),w,h};for(const k of ['x','y','w','h'])view[k]=smoothing?view[k]+(target[k]-view[k])*smoothing:target[k];$('map').setAttribute('viewBox',`${view.x.toFixed(2)} ${view.y.toFixed(2)} ${view.w.toFixed(2)} ${view.h.toFixed(2)}`);const heroScale=(scenePlan?.artDetail?1.62:1.45)*view.w/720;$('player').setAttribute('transform',`translate(${x.toFixed(2)} ${(y-17.2*heroScale).toFixed(2)}) scale(${heroScale})`);const next=G.position({routeId:state.routeId,distance:G.metric(state.routeId).total*Math.min(1,state.progress+.007)}),[nx]=projection.point(next.lon,next.lat);if(state.status==='walking'&&Math.abs(nx-x)>.8)hikerFacing=nx>x?1:-1;updateFigure();updateAir();animateDiscovery();updateLife();$('weather-window').setAttribute('cx',x);$('weather-window').setAttribute('cy',y);$('weather-window').setAttribute('r',J.weather(state)==='blizzard'?120:215);$('map').setAttribute('aria-label',`${J.routeOf(state).name}卡通路线。背包小人自动沿参考路线走向行进，已走${Math.round(state.progress*100)}%。`);if(sceneRenderer?.alive)sceneRenderer.draw({view,overview:full,progress:state.progress,elapsed:state.elapsed,weather:J.weather(state),reducedMotion:motionReduced});}
 function figureAction(){if(micro)return 'look';if(photoId||state.pending?.kind==='photo')return 'photo';if(state.pending?.kind==='choice'&&['snow','blizzard','wind'].includes(J.weather(state)))return 'shelter';if(['finished','retreated'].includes(state.status))return 'finish';if(state.status==='paused')return 'look';if(state.status==='walking'&&state.elapsed-actionStarted<1.2)return 'discover';return 'walk';}
 function updateFigure(){const action=figureAction(),pose=M.pose(gaitClock,state.status==='walking',motionReduced,{action,age:state.elapsed-actionStarted,weather:J.weather(state)});$('player').setAttribute('data-action',action);$('hiker-facing').setAttribute('transform',`scale(${hikerFacing} 1)`);$('hiker-torso').setAttribute('transform',pose.torso);$('hiker-pack').setAttribute('transform',pose.pack);$('hiker-scarf').setAttribute('transform',pose.scarf);$('hiker-camera').setAttribute('opacity',action==='photo'?1:0);$('hiker-pole').setAttribute('opacity',['photo','shelter','look','finish'].includes(action)?0:1);for(const [id,path]of [['leg-front',pose.front.path],['shoe-front',pose.front.shoe],['leg-back',pose.back.path],['shoe-back',pose.back.shoe],['arm-front',pose.armFront],['arm-back',pose.armBack],['hiker-pole',pose.pole]])$(id).setAttribute('d',path);const cold=J.routeOf(state).theme==='snow'&&state.status!=='ready',breath=motionReduced?0:(Math.sin(state.elapsed*2.4)+1)/2;$('hiker-breath').setAttribute('opacity',cold?(.08+breath*.25).toFixed(3):0);$('hiker-breath').setAttribute('transform',`translate(${(breath*3*hikerFacing).toFixed(2)} ${(-breath*2).toFixed(2)}) scale(${hikerFacing} 1)`);}
 function updateLife(){L.update(lifeActors,state.elapsed,J.weather(state),motionReduced);for(const [i,node]of footprints.entries()){const fraction=state.progress-(i+1)*.008;if(fraction<=0){node.setAttribute('opacity',0);continue;}const p=G.position({routeId:state.routeId,distance:G.metric(state.routeId).total*fraction}),[x,y]=projection.point(p.lon,p.lat),next=G.position({routeId:state.routeId,distance:G.metric(state.routeId).total*Math.min(1,fraction+.002)}),[nx,ny]=projection.point(next.lon,next.lat),angle=Math.atan2(ny-y,nx-x)*180/Math.PI;node.setAttribute('transform',`translate(${(x+(i%2?2:-2)).toFixed(2)} ${y.toFixed(2)}) rotate(${(angle-90).toFixed(2)})`);node.setAttribute('opacity',(.28*(1-i/9)).toFixed(3));}}
 function playTransition(kind,label,photo=null,icon=null){const layer=$('transition-layer');layer.replaceChildren();if(motionReduced)return;const fx=html('div',null,layer,`scene-fx ${kind}-fx`);fx.setAttribute('data-transition',kind);if(photo){const image=html('img',null,fx);image.setAttribute('src',photo);image.setAttribute('alt','');}if(icon){const art=svg('svg',{viewBox:'-25 -25 50 50'},fx);natureIcon(art,icon);}html('span',label,fx);fx.addEventListener('animationend',e=>{if(e.target===fx&&layer.children[0]===fx)layer.replaceChildren();});}
 function updateAir(){const weather=J.weather(state);for(const [i,node]of cloudNodes.entries()){const p=M.cloud(i,state.elapsed,motionReduced);node.setAttribute('transform',`translate(${p.x.toFixed(3)} ${p.y.toFixed(3)})`);node.setAttribute('opacity',p.alpha.toFixed(3));}for(const [i,node]of mistNodes.entries()){const p=M.mist(i,state.elapsed,weather,motionReduced);node.setAttribute('transform',`translate(${p.x.toFixed(3)} ${p.y.toFixed(3)})`);node.setAttribute('opacity',p.alpha.toFixed(3));}}
 function photoContent(cp){photoId=cp.id;$('photo-title').textContent=cp.name;showPhotoImage(cp);$('photo-credit').replaceChildren();html('span',`摄影：${cp.photo.author}`,$('photo-credit'));for(const [text,url]of [['来源 ↗',cp.photo.source],[cp.photo.license,cp.photo.licenseUrl]]){const a=html('a',text,$('photo-credit'));a.setAttribute('href',url);a.setAttribute('target','_blank');a.setAttribute('rel','noopener noreferrer');}fillNature('photo-nature',K.checkpoint(cp.id));$('photo-panel').hidden=false;}
 function openMemory(id){if(reward)return;if(micro)finishMicro(micro.acted||D.item(micro.id).bonus);if(reward)return;const cp=J.routeOf(state).checkpoints.find(c=>c.id===id);if(!cp||!state.visited.includes(id)||state.status==='encounter'||photoReturn)return;photoReturn=state.status;if(state.status==='walking')state=J.pause(state);cancelLoop();photoContent(cp);$('photo-continue').textContent='回到旅程 →';uiKey='';render();updatePosition(0);$('photo-continue').focus({preventScroll:true});}
 function closePhoto(){if(photoId){const cp=J.routeOf(state).checkpoints.find(c=>c.id===photoId);if(cp)playTransition('photo','收进今天的旅程',cp.photo.file);}if(photoReturn){const previous=photoReturn;photoReturn=null;photoId=null;$('photo-panel').hidden=true;if(previous==='walking')state=J.resume(state);uiKey='';render();updatePosition(0);ensureLoop();return;}if(state.pending?.kind==='photo'){photoId=null;$('photo-panel').hidden=true;apply(J.continuePhoto(state));}}
 function render(){const key=[!!reward,choiceResult?.until>state.elapsed,state.status,state.pending?.id,state.visited.join(','),Math.round(state.progress*100),photoId,overview,discovery()?.id,trip.found.length,micro?.id,micro?.acted].join('|');if(key===uiKey)return;uiKey=key;$('map').setAttribute('preserveAspectRatio',overview||motionReduced||state.status==='ready'?'xMidYMid meet':'xMidYMid slice');renderDiscovery();const r=J.routeOf(state),walking=state.status==='walking';$('journey-stage').classList.toggle('walking',walking);$('map-frame').classList.toggle('active',walking);$('journey-state').textContent=({ready:'约2–3分钟',walking:'沿着山径慢慢走',paused:'停下来看看',encounter:'在路上停一停',finished:'今天的旅程',retreated:'平安结束'})[state.status];$('journey-progress').setAttribute('aria-valuenow',Math.round(state.progress*100));$('journey-progress-fill').style.width=`${state.progress*100}%`;$('thought').textContent=echo&&state.elapsed<echoUntil?echo:state.status==='paused'&&!photoReturn?(K.moment(state.routeId,state.progress)?.look||J.thought(state)):J.thought(state);$('feeling').textContent=J.feeling(state);$('walk-toggle').disabled=!['walking','paused'].includes(state.status)||!!photoReturn||!!micro||!!reward;$('walk-toggle').textContent=state.status==='paused'?'继续走 →':'停下来看看';$('map-toggle').textContent=overview?'跟着小人走 ↗':'看完整路线 ↗';$('map-toggle').setAttribute('aria-pressed',overview);$('album-count').textContent=`${state.visited.length} / ${r.checkpoints.length}`;
 const p=position(),completed=r.geo.line.slice(0,p.index);completed.push([p.lon,p.lat,p.ele]);$('completed-line').setAttribute('d',cartoonLine(completed));
 for(const cp of r.checkpoints){const unlocked=state.visited.includes(cp.id),b=$(`checkpoint-${cp.id}`);b.disabled=!unlocked;b.classList.toggle('collected',unlocked);b.setAttribute('aria-expanded',photoId===cp.id);b.setAttribute('aria-controls','photo-panel');$(`checkpoint-hint-${cp.id}`).textContent=unlocked?'已收集 · 再看一眼':'沿途慢慢发现';$(`marker-${cp.id}`).classList.toggle('unlocked',unlocked);$(`marker-${cp.id}`).setAttribute('aria-disabled',!unlocked);}
 const weather=J.weather(state),w=G.WEATHER[weather];$('weather-name').textContent=w.name;$('weather-icon').textContent=w.icon;$('journey-stage').setAttribute('data-weather',weather);$('fog-cover').setAttribute('opacity',weather==='fog'?.18:weather==='blizzard'?.23:0);$('atmosphere').classList.toggle('cold',state.warmth<40);$('atmosphere').classList.toggle('evening',state.progress>.8);if(weather!==lastWeather){lastWeather=weather;$('weather-fx-html').replaceChildren();if(['snow','blizzard','rain'].includes(weather))for(let i=0;i<22;i++){const flake=html('span',weather==='rain'?'╱':'·',$('weather-fx-html'),'weather-particle');flake.style.left=`${i*43%100}%`;flake.style.animationDelay=`-${i*.37}s`;flake.style.animationDuration=`${weather==='rain'?1.2:2.5+(i%3)}s`;}}
 $('overlay').hidden=state.status!=='ready';if(state.status==='ready'){const story=J.storyOf(state);$('overlay-title').textContent=story.openingTitle;$('overlay-copy').textContent=story.opening;$('overlay-hint').textContent=r.id==='westlake'?'约2–3分钟 · 路边的小动静，值得停一下':'约2–3分钟 · 自动行走 · 随时停下';}
 $('story-panel').hidden=state.pending?.kind!=='choice';if(state.pending?.kind==='choice'){const e=state.pending;$('story-kicker').textContent=e.kicker;$('story-title').textContent=e.title;$('story-copy').textContent=e.copy;$('story-choices').replaceChildren();for(const choice of e.choices){const b=html('button',null,$('story-choices'),'story-choice');b.id=`choice-${choice.id}`;b.setAttribute('type','button');html('strong',choice.label,b);html('small',J.choiceEffects(state,choice).join(' · ')||choice.note,b);b.addEventListener('click',()=>{if(state.pending?.id!==e.id)return;const next=J.choose(state,choice.id);if(next===state)return;choiceResult={label:choice.label,copy:choice.echo,effects:J.choiceEffects(state,choice),until:next.elapsed+10};echo=choice.echo;echoUntil=state.elapsed+10;apply(next);});}}
 const showChoice=choiceResult&&state.elapsed<choiceResult.until&&!state.pending&&!photoReturn&&!micro&&!reward;$('choice-feedback').hidden=!showChoice;if(showChoice){$('choice-feedback-title').textContent='已选择 · '+choiceResult.label;$('choice-feedback-copy').textContent=choiceResult.copy;$('choice-feedback-effects').textContent=choiceResult.effects.join(' · ');}
 if(state.pending?.kind==='photo'&&photoId!==state.pending.id){photoContent(state.pending.checkpoint);$('photo-continue').textContent='继续走 →';}
 if(!photoId)$('photo-panel').hidden=true;
 const ended=['finished','retreated'].includes(state.status);$('ending-panel').hidden=!ended||!!photoReturn;if(ended){const end=J.ending(state);$('ending-title').textContent=end.title;$('ending-copy').textContent=end.copy;$('ending-memories').replaceChildren();for(const m of state.memories)html('li',m,$('ending-memories'));renderEndingJournal();html('li',`带回了${state.visited.length}张真实山野照片。`,$('ending-memories'));}
 syncAudio();

 }
 function apply(next){const previous=state;state=next;uiKey='';render();updatePosition(state.status==='walking'?.1:0);if(state.status==='encounter'&&previous.pending?.id!==state.pending?.id){const button=state.pending.kind==='photo'?$('photo-continue'):$('story-choices').querySelector('button');button?.focus({preventScroll:true});}if(['finished','retreated'].includes(state.status)&&state.status!==previous.status)$('replay').focus({preventScroll:true});ensureLoop();}
 function cancelLoop(){if(rafId!==null){window.cancelAnimationFrame(rafId);rafId=null;}lastTime=null;}
 function ensureLoop(){const active=!journalOpen&&!reward&&!audioBackground&&!document.hidden&&(state.status==='walking'||micro);if(active&&rafId===null)rafId=window.requestAnimationFrame(frame);else if(!active)cancelLoop();}
 function frame(time){rafId=null;const dt=lastTime===null?0:Math.max(0,Math.min(.25,(time-lastTime)/1000));lastTime=time;if(micro){if(audioBackground||document.hidden){cancelLoop();return;}if(miniPendingPoint){micro=X.move(micro,miniPendingPoint);miniPendingPoint=null;}micro=X.tick(micro,dt);updateMicroStatus();X.paint(microRefs,micro,motionReduced);if(micro.done)finishMicro(true);else ensureLoop();return;}const previous=state;if(state.status==='walking')gaitClock+=dt*state.pace;state=J.tick(state,dt);if(state.status==='encounter'&&previous.status==='walking'){render();updatePosition(0);const b=state.pending.kind==='photo'?$('photo-continue'):$('story-choices').querySelector('button');b?.focus({preventScroll:true});lastTime=null;}else{render();updatePosition(dt>0?1-Math.exp(-dt*6):.1);}if(state.status==='walking'){footstep();ensureLoop();}else{cancelLoop();if(['finished','retreated'].includes(state.status))$('replay').focus({preventScroll:true});}}
 function selectRoute(id){if(reward)closeReward(false);choiceResult=null;if(micro)finishMicro(false,false);tripMoments=[];cancelLoop();state=J.create(id);prepareRoutePhotos();trip=D.create(id,undefined,{recent:journal.filter(m=>m.route===id).slice(-3).map(m=>m.id)});natureId=null;natureNode=null;naturePoint=null;natureArt=null;actionStarted=-Infinity;$('transition-layer').replaceChildren();renderJournal();$('discovery-status').textContent='换一条山径，遇见新的瞬间。之前的回忆还在手帐里。';photoId=null;photoReturn=null;overview=false;echo='';gaitClock=0;hikerFacing=1;lastStrike=-1;lastWeather=null;uiKey='';view={x:0,y:0,w:720,h:600};$('photo-panel').hidden=true;describeRoute();drawMap();render();updatePosition(0);playTransition('route',J.routeOf(state).name);}
 function needsAudioResume(){return !journalOpen&&!reward&&sound&&!audioBackground&&!document.hidden&&(micro||photoId||['walking','encounter'].includes(state.status))&&!audioPlayer.running;}
 function syncAudio(){const requested=!journalOpen&&sound&&(!reward||window.TrailMiniGames?.kinds[reward.id])&&!audioBackground&&!document.hidden,mode=reward&&window.TrailMiniGames?.kinds[reward.id]?'moment':micro?'moment':photoId?'photo':state.status==='walking'?'walk':state.status==='encounter'?'choice':'silent';if(!requested){if(journalOpen||audioBackground||document.hidden)audioPlayer.hide();else if(reward&&sound)audioPlayer.setScene({routeId:state.routeId,mode:'silent'});}else audioPlayer.setScene({routeId:state.routeId,checkpointId:photoId,weather:J.weather(state),progress:state.progress,mode,momentGame:micro?.game||window.TrailMiniGames?.kinds[reward?.id]||null});const playing=requested&&audioPlayer.playing;$('sound-toggle').setAttribute('aria-pressed',sound);$('sound-toggle').textContent=soundBusy?'声音 · 开启中':soundError||(needsAudioResume()?'声音 · 点此恢复':`声音 · ${sound?'开':'关'}`);const p=window.TrailAudio.profile(photoId);$('photo-soundscape').hidden=!p;if(p){$('photo-soundscape').textContent=`♪ ${p.title} · ${playing?'正在播放':!sound?'声音关闭':audioBackground||document.hidden?'已暂停':'点声音按钮恢复'}`;$('photo-soundscape').setAttribute('data-playing',playing);}}
 function footstep(){const strike=Math.floor(gaitClock/.54);if(!sound||strike===lastStrike)return;lastStrike=strike;audioPlayer.step(state.routeId);}
 async function toggleSound(){if(soundBusy)return;if(!audioPlayer.available){soundError='此浏览器暂无音效';uiKey='';render();return;}soundError='';if(sound&&!needsAudioResume()){sound=false;audioPlayer.disable();uiKey='';render();return;}soundBusy=true;uiKey='';render();const ok=await audioPlayer.enable();soundBusy=false;sound=ok;if(!ok&&!soundError)soundError=audioPlayer.available?'声音未能开启，再试一次':'此浏览器暂无音效';uiKey='';render();}
 $('micro-skip').addEventListener('click',()=>finishMicro(!!micro?.acted||!!D.item(micro?.id)?.bonus));$('micro-surface').addEventListener('click',e=>{if(e.detail>0)return;performMicro({assist:true});});
 $('micro-surface').addEventListener('keydown',e=>{const shifts={ArrowLeft:[-.08,0],ArrowRight:[.08,0],ArrowUp:[0,-.1],ArrowDown:[0,.1]};if(!micro||audioBackground||document.hidden||!shifts[e.key]||microRefs?.art)return;e.preventDefault();const d=shifts[e.key];micro=X.release(X.move(micro,{x:micro.x+d[0],y:micro.y+d[1],key:true,dx:d[0],dy:d[1]}));X.paint(microRefs,micro,motionReduced);updateMicroStatus();ensureLoop();});
 $('micro-surface').addEventListener('pointerdown',e=>{if(!micro||audioBackground||document.hidden||microPointer||e.isPrimary===false||(e.button!==undefined&&e.button!==0)||microRefs?.art&&!artReady())return;e.stopPropagation?.();microPointer={id:e.pointerId,x:e.clientX,y:e.clientY,drag:false};$('micro-surface').setPointerCapture?.(e.pointerId);if(micro.game)performMicro({...microPoint(e),...(microRefs?.art?{phase:'press'}:{})});});
 $('micro-surface').addEventListener('pointermove',e=>{if(!microPointer||microPointer.id!==e.pointerId||!micro||audioBackground||document.hidden)return;e.stopPropagation?.();if(Math.hypot(e.clientX-microPointer.x,e.clientY-microPointer.y)>8)microPointer.drag=true;if(!microPointer.drag)return;const rect=$('micro-surface').getBoundingClientRect(),point={...microPoint(e),gesture:'drag'};if(micro.game){miniPendingPoint=point;ensureLoop();return;}if(!micro.acted)performMicro({x:(microPointer.x-rect.left)/rect.width,y:(microPointer.y-rect.top)/rect.height,gesture:'drag'});micro=X.move(micro,point);updateMicroStatus();X.paint(microRefs,micro,motionReduced);});
 $('micro-surface').addEventListener('pointerup',e=>{if(!microPointer||microPointer.id!==e.pointerId||!micro)return;e.stopPropagation?.();const dragged=microPointer.drag,point={...microPoint(e),gesture:dragged?'drag':'tap'};if(microRefs?.art){miniPendingPoint=null;if(dragged&&artReady())micro=X.move(micro,point);performMicro({...point,phase:'release',dragged});}else if(dragged){miniPendingPoint=null;micro=X.release(X.move(micro,point));}else performMicro(point);microPointer=null;if($('micro-surface').hasPointerCapture?.(e.pointerId))$('micro-surface').releasePointerCapture(e.pointerId);X.paint(microRefs,micro,motionReduced);});
 function cancelMicroGesture(){clearMicroPointer();if(micro){micro=X.release(micro);X.paint(microRefs,micro,motionReduced);updateMicroStatus();}}
 $('micro-surface').addEventListener('pointercancel',cancelMicroGesture);
 $('micro-surface').addEventListener('lostpointercapture',e=>{if(microPointer?.id===e.pointerId)cancelMicroGesture();});
 $('micro-surface').addEventListener('keydown',e=>{
  if(!microRefs?.art||!micro||e.ctrlKey||e.altKey||e.metaKey)return;const arrows=e.key.startsWith('Arrow'),supported=arrows||['Enter',' '].includes(e.key)||micro.game==='puzzle'&&/^[1-6qQeE]$/.test(e.key);if(!supported)return;e.preventDefault();if(!artReady()||audioBackground||document.hidden||e.repeat&&!arrows)return;
  micro=window.TrailMiniGames.artKey(micro,e.key);X.paint(microRefs,micro,motionReduced);updateMicroStatus();ensureLoop();
 });
 $('micro-surface').addEventListener('keyup',e=>{if(!microRefs?.art||e.key!==' ')return;e.preventDefault();if(!artReady()||!micro||audioBackground||document.hidden)return;micro=window.TrailMiniGames.artKey(micro,e.key,'up');X.paint(microRefs,micro,motionReduced);updateMicroStatus();ensureLoop();});
 $('micro-surface').addEventListener('blur',()=>{if(micro?.sling?.charge)cancelMicroGesture();});
 function artAction(action,value){if(!microRefs?.art||!artReady()||!micro||audioBackground||document.hidden)return;clearMicroPointer();micro=X.release(micro);performMicro({action,value});}
 $('art-actions').addEventListener('click',e=>{const button=e.target.closest?.('button[data-action]');if(button&&!button.disabled)artAction(button.getAttribute('data-action'));});
 $('art-angle').addEventListener('input',e=>artAction('angle',Number(e.target.value)));
 $('art-power').addEventListener('input',e=>artAction('power',Number(e.target.value)/100));
 $('mini-sound').addEventListener('click',async()=>{await toggleSound();updateMicroStatus();});
 $('mini-retry').addEventListener('click',()=>{if(!micro?.game||micro.play.complete)return;const e=D.item(micro.id);clearMicroPointer();if((microRefs?.story||microRefs?.art)&&microRefs.contentState==='error'){const previous=microReturn;window.TrailMiniGames?.dispose(microRefs);beginMicro(e);microReturn=previous;return;}micro=X.create(e,{reduced:motionReduced});miniSoundSerial=0;updateMicroStatus();X.paint(microRefs,micro,motionReduced);$('micro-surface').focus({preventScroll:true});ensureLoop();});
 $('micro-surface').addEventListener('keydown',e=>{if(micro?.game&&e.key.toLowerCase()==='r'){e.preventDefault();$('mini-retry').click();}});
 function wugongAction(action){if(!micro||audioBackground||document.hidden)return;clearMicroPointer();micro=X.release(micro);performMicro({action});}
 for(const id of ['wugong-primary','wugong-secondary'])$(id).addEventListener('click',()=>wugongAction($(id).getAttribute('data-action')));
 $('wugong-clear').addEventListener('click',()=>wugongAction('clear'));
 $('wugong-zoom-in').addEventListener('click',()=>wugongAction('zoom-in'));
 $('wugong-zoom-out').addEventListener('click',()=>wugongAction('zoom-out'));
 $('micro-surface').addEventListener('keydown',e=>{
  if(!['clouds','greet'].includes(micro?.game)||e.ctrlKey||e.altKey||e.metaKey)return;
  let action=null;if(e.key==='Enter')action=micro.game==='clouds'?'send':micro.stage==='camera'?'shutter':micro.stage==='review'&&!micro.capture?.ok?'retake':'advance';
  else if(e.key===' ')action=micro.game==='clouds'?'choose':micro.stage==='camera'?'shutter':micro.stage==='review'&&!micro.capture?.ok?'retake':'advance';
  else if(micro.game==='clouds'&&e.key==='Backspace')action='undo';
  else if(micro.game==='greet'&&['+','=','-','_'].includes(e.key))action=['-','_'].includes(e.key)?'zoom-out':'zoom-in';
  if(!action)return;e.preventDefault();if(e.repeat)return;
  if((action==='send'||action==='shutter')&&['loading','error'].includes(microRefs?.contentState))return;
  if(action==='choose')performMicro({assist:true});else wugongAction(action);
 });
 $('reward-continue').addEventListener('click',collectReward);$('choice-feedback-close').addEventListener('click',()=>{choiceResult=null;uiKey='';render();});
 $('overlay-action').addEventListener('click',()=>apply(J.start(state)));$('walk-toggle').addEventListener('click',()=>apply(state.status==='paused'?J.resume(state):J.pause(state)));$('photo-continue').addEventListener('click',closePhoto);$('photo-close').addEventListener('click',closePhoto);$('replay').addEventListener('click',()=>{const id=state.routeId;selectRoute(id);apply(J.start(state));});$('map-toggle').addEventListener('click',()=>{overview=!overview;uiKey='';render();updatePosition(0);});$('sound-toggle').addEventListener('click',toggleSound);$('observe-button').addEventListener('click',()=>{const active=discovery();if(active)captureDiscovery(active.id);});
 window.addEventListener('keydown',e=>{if(reward){if(e.key==='Escape'){e.preventDefault();closeReward();}else if(e.key==='Tab'){e.preventDefault();$('reward-continue').focus({preventScroll:true});}return;}if(e.ctrlKey||e.altKey||e.metaKey||e.repeat||['INPUT','TEXTAREA','SELECT'].includes(e.target?.tagName))return;if(e.key==='Escape'&&micro){e.preventDefault();finishMicro(micro.acted||D.item(micro.id).bonus);}else if(e.key==='Escape'&&photoId){e.preventDefault();closePhoto();}else if(['p','P','Escape'].includes(e.key)&&['walking','paused'].includes(state.status)&&!photoReturn&&!micro){e.preventDefault();apply(state.status==='paused'?J.resume(state):J.pause(state));}});
 const backgroundPause=()=>{audioBackground=true;if(journalOpen)journalReturn='paused';if(reward)rewardReturn='paused';if(micro){microReturn='paused';micro=X.release(micro);clearMicroPointer();}if(state.status==='walking')apply(J.pause(state));cancelLoop();audioPlayer.hide();uiKey='';render();};const foreground=()=>{audioBackground=false;uiKey='';render();ensureLoop();};window.addEventListener('blur',backgroundPause);window.addEventListener('focus',foreground);document.addEventListener('visibilitychange',()=>{if(document.hidden)backgroundPause();else foreground();});window.addEventListener('pagehide',e=>{backgroundPause();if(!e.persisted){audioPlayer.destroy();window.TrailMiniGames?.dispose(microRefs);}});window.addEventListener('pageshow',e=>{if(e.persisted)foreground();});
 prepareRoutePhotos();drawPicker();describeRoute();drawMap();setupJournalTools();renderJournal();render();updatePosition(0);
 window.addEventListener('resize',()=>updatePosition(0));
 if(window.PIXI&&window.TrailPixiScene){window.TrailPixiScene.create(window.PIXI,$('map-frame'),{onReady:()=>{$('map-frame').classList.toggle('gpu-ready',true);$('map-frame').setAttribute('data-renderer','pixi');},onFallback:()=>{$('map-frame').classList.toggle('gpu-ready',false);$('map-frame').setAttribute('data-renderer','svg');}}).then(renderer=>{sceneRenderer=renderer;if(renderer?.alive){renderer.setPlan(scenePlan);updatePosition(0);}}).catch(()=>{$('map-frame').classList.toggle('gpu-ready',false);});}
}());
