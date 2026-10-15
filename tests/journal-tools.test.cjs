const test=require('node:test'),assert=require('node:assert/strict'),D=require('../dist/discoveries'),B=require('../dist/journal'),{harness}=require('./dom-harness.cjs');
const record=(id='meadow-bird',key=id,extra={})=>({edition:3,earned:true,artVersion:D.item(id).artV5?5:4,tag:D.item(id).tag,key,id,route:D.item(id).route,place:D.item(id).place,title:D.item(id).tag,memory:'这段文字就在画旁边。',icon:D.item(id).icon,createdAt:1234,progress:.1,elapsed:9,weather:'clear',legacy:false,...extra});
const storage=(records,revision=1)=>{const data=new Map([[D.KEY,JSON.stringify({version:2,historyRevision:revision,moments:records})],['other-save','keep']]);let writes=0;return {getItem:k=>data.get(k)??null,setItem:(k,v)=>{writes++;data.set(k,v);},writes:()=>writes};};
const byClass=(node,name)=>node.classes?.has(name)?node:node.children?.map(c=>byClass(c,name)).find(Boolean);
test('one picture and full memory share each page, without export, import, separate collection or hidden detail',()=>{
 const st=storage([record()]),h=harness(st),card=h.$('journal-list').children[0];
 assert.equal(card.querySelector('h3').textContent,'草浪来信');assert.equal(byClass(card,'journal-memory').textContent,record().memory);assert.ok(card.querySelector('time'));assert.match(card.querySelector('img').getAttribute('src'),/grass-letter/);
 for(const id of ['journal-export','journal-import','collection-list','journal-page','journal-tag-count'])assert.equal(h.$(id),undefined);
 assert.equal(st.writes(),0);assert.equal(h.downloads.length,0);
});
test('route filters and pagination count unique scenes and append without reloading existing art',()=>{
 const records=D.CATALOG.map((e,i)=>record(e.id,e.id,{createdAt:i}));records.push(record('meadow-bird','duplicate'));
 for(const viewport of [{width:320,height:435},{width:390,height:460},{width:990,height:646}]){const st=storage(records),h=harness(st,{viewport});assert.equal(h.$('journal-count').textContent,'29个瞬间');assert.equal(h.$('journal-list').children.length,12);const first=h.$('journal-list').children[0];h.click('journal-more');assert.equal(h.$('journal-list').children.length,24);assert.equal(h.$('journal-list').children[0],first);assert.equal(h.document.activeElement,h.$('journal-list').children[12].querySelector('article'));h.click('journal-more');assert.equal(h.$('journal-list').children.length,29);assert.equal(h.$('journal-more').hidden,true);
 h.$('journal-route').value='tiger';h.$('journal-route').emit('change');assert.equal(h.$('journal-list').children.length,4);assert.ok(h.$('journal-list').children.every(c=>c.getAttribute('data-route')==='tiger'));assert.equal(st.writes(),0);assert.equal(D.loadMoments(st).length,30);}
});
test('replays keep first text, date and art; unfinished records never append or downgrade rewards',()=>{
 const first=record(),again=record('meadow-bird','again',{title:'后来',createdAt:9999}),partial=record('meadow-bird','partial',{earned:false,tag:null});
 assert.equal(B.remember([first],again).status,'unchanged');assert.equal(B.remember([first],partial).status,'unchanged');assert.equal(B.remember([],partial).status,'unchanged');assert.equal(B.page([first,again,partial]).entries[0],first);
 const upgraded=B.remember([partial],first);assert.equal(upgraded.status,'upgraded');assert.equal(B.page(upgraded.moments).total,1);assert.equal(B.page(upgraded.moments).entries[0].earned,true);assert.equal(B.remember(upgraded.moments,again).status,'unchanged');assert.equal(B.remember([first],record('gorge-goat')).status,'added');
});
test('old history stays untouched until explicit confirmation; cancellation does not write',()=>{
 const st=storage([record()],0),raw=st.getItem(D.KEY),h=harness(st,{confirm:()=>false});assert.equal(h.$('journal-reset-notice').hidden,false);assert.equal(st.writes(),0);h.click('journal-reset');assert.equal(st.getItem(D.KEY),raw);assert.equal(st.writes(),0);assert.equal(h.$('journal-count').textContent,'1个瞬间');
});
test('confirmed reset only clears this browser notebook once, and new rewards survive reload',()=>{
 const st=storage([record()],0);let prompt='';const h=harness(st,{confirm:text=>{prompt=text;return true;}});h.click('journal-reset');assert.match(prompt,/永久删除当前浏览器/);assert.match(prompt,/无法恢复/);assert.equal(st.getItem('other-save'),'keep');assert.deepEqual(D.loadMoments(st),[]);assert.equal(h.$('journal-count').textContent,'0个瞬间');assert.equal(h.$('journal-reset-notice').hidden,true);assert.equal(st.writes(),1);
 D.saveMoments(st,[record('bamboo-drop')]);const writes=st.writes(),again=harness(st);assert.equal(again.$('journal-count').textContent,'1个瞬间');assert.equal(again.$('journal-reset-notice').hidden,true);assert.equal(st.writes(),writes);assert.equal(D.resetHistory(st),'ready');assert.equal(st.writes(),writes);
});
test('saving a new reward does not silently accept pending legacy deletion; denied reset leaves history intact',()=>{
 const st=storage([record()],0);D.saveMoments(st,[record(),record('bamboo-drop')]);assert.equal(D.historyState(st),'legacy');
 const raw=st.getItem(D.KEY),denied={getItem:st.getItem,setItem(){throw Error('denied');}},h=harness(denied,{confirm:()=>true});h.click('journal-reset');assert.match(h.$('journal-reset-status').textContent,/尚未清空/);assert.equal(st.getItem(D.KEY),raw);assert.equal(h.$('journal-count').textContent,'2个瞬间');
});
test('corrupt legacy content needs confirmation and unavailable storage reports no successful deletion',()=>{
 const st=storage([]);st.setItem(D.KEY,'{broken');const h=harness(st,{confirm:()=>true});assert.equal(h.$('journal-reset-notice').hidden,false);h.click('journal-reset');assert.equal(D.historyState(st),'ready');assert.deepEqual(D.loadMoments(st),[]);
 const denied=harness({getItem(){throw Error('denied');},setItem(){throw Error('denied');}});assert.match(denied.$('journal-storage').textContent,/尚未确认删除/);
});
test('partly played Pixi games leave no record on skip, Escape or route change',()=>{
 for(const route of ['wugong','westlake','mogan'])for(const exit of ['skip','escape','route']){const st=storage([]),h=harness(st,{miniGames:true,discoverySeed:682});h.click('route-'+route);h.click('overlay-action');h.advance(10);h.click('observe-button');const surface=h.$('micro-surface');surface.emit('pointerdown',{pointerId:1,clientX:200,clientY:200,button:0,isPrimary:true});h.advance(.6);surface.emit('pointerup',{pointerId:1,clientX:200,clientY:200});if(exit==='skip')h.click('micro-skip');else if(exit==='escape')h.key('Escape');else h.click('route-tiger');assert.equal(h.$('micro-panel').hidden,true);assert.equal(h.$('reward-overlay').hidden,true);assert.equal(h.$('journal-count').textContent,'0个瞬间');assert.deepEqual(D.loadMoments(st),[]);assert.equal(st.writes(),0);h.window.emit('pagehide',{persisted:false});}
});
