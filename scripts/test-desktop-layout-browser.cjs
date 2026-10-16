// Approved local layout QA; phone emulation is not a physical-phone test.
const assert=require('node:assert/strict'),fs=require('node:fs/promises'),path=require('node:path');
const {chromium}=require(process.env.TRAILBOUND_PLAYWRIGHT_MODULE||'playwright');
const base=process.env.TRAILBOUND_TEST_URL||'http://127.0.0.1:4173/',out=process.env.TRAILBOUND_REVIEW_DIR||'/tmp/trailbound-desktop-layout';
assert.match(base,/^http:\/\/(127\.0\.0\.1|localhost):\d+\/$/);
let browser;
async function readerFixture(page){
 await page.goto(base,{waitUntil:'networkidle'});
 // Local reader fixtures only, never production data or a claim of earned gameplay.
 await page.evaluate(()=>{
  const moments=TrailDiscoveries.CATALOG.slice(0,18).map((e,i)=>({key:'layout-fixture-'+i,id:e.id,route:e.route,edition:e.edition||3,earned:true,artVersion:e.artV5?5:4,tag:e.tag,title:e.tag,place:e.place,memory:'仅用于本地排版验收的回忆文字。',createdAt:i+1,elapsed:1,progress:e.at,icon:e.icon}));
  localStorage.setItem(TrailDiscoveries.KEY,JSON.stringify({version:2,moments}));
 });
 await page.reload({waitUntil:'networkidle'});
 if(await page.locator('#journal-more').isVisible())await page.locator('#journal-more').click();
 await page.evaluate(()=>scrollTo(0,0));
}
async function layout(page){return page.evaluate(()=>{
 const box=selector=>{const b=document.querySelector(selector).getBoundingClientRect();return {x:b.x,y:b.y,width:b.width,height:b.height,right:b.right};};
 const cols=selector=>getComputedStyle(document.querySelector(selector)).gridTemplateColumns.split(/\s+/).length;
 const view=document.querySelector('#map').viewBox.baseVal,path=document.querySelector('#route-line').getBBox();
 return {viewport:{width:innerWidth,height:innerHeight},clientWidth:document.documentElement.clientWidth,scrollWidth:document.documentElement.scrollWidth,main:box('main'),header:box('.site-header'),map:box('#map-frame'),camera:{x:view.x,y:view.y,w:view.width,h:view.height},routeBounds:{x:path.x,y:path.y,w:path.width,h:path.height},routeColumns:cols('.route-cards'),journalColumns:cols('.journal-list'),journalEntries:document.querySelectorAll('#journal-list button').length,routeOverflow:[...document.querySelectorAll('.route-card strong,.route-card small')].some(el=>el.scrollWidth>el.clientWidth+1)};
});}
(async()=>{
 await fs.mkdir(out,{recursive:true});
 browser=await chromium.launch({executablePath:process.env.TRAILBOUND_CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:1280,height:900}}),errors=[];
 page.on('pageerror',e=>errors.push(String(e)));
 await readerFixture(page);const results=[];
 for(const [width,height]of [[1024,768],[1280,900],[1440,900],[1920,1080],[2560,1440],[2964,1548],[1920,800]]){
  await page.setViewportSize({width,height});
  await page.waitForFunction(()=>{const b=document.querySelector('#map-frame').getBoundingClientRect(),v=document.querySelector('#map').viewBox.baseVal;return Math.abs(b.width/b.height-v.width/v.height)<.001;},{},{timeout:5000});
  const m=await layout(page),gutter=Math.max(24,Math.min(72,m.clientWidth*.03));
  assert.ok(Math.abs(m.main.x-gutter)<1,'fluid desktop gutter');
  assert.ok(Math.abs(m.header.x-m.main.x)<1&&Math.abs(m.header.width-m.main.width)<1,'header and content align');
  assert.ok(Math.abs(m.main.width-(m.clientWidth-2*gutter))<1,'desktop uses available width');
  assert.ok(m.scrollWidth<=m.clientWidth+1,'no horizontal page overflow');
  assert.equal(m.routeColumns,width>=1440?7:4);assert.equal(m.routeOverflow,false);
  assert.ok(m.journalEntries===18&&m.journalColumns>=5,'the populated label wall reflows');
  assert.ok(m.map.height>=420&&m.map.height<=860,'map height remains bounded');
  assert.ok(Math.abs(m.map.width/m.map.height-m.camera.w/m.camera.h)<.001,'desktop overview fills the wide frame: '+JSON.stringify(m));
  assert.ok(m.routeBounds.y>=m.camera.y&&m.routeBounds.y+m.routeBounds.h<=m.camera.y+m.camera.h,'the full route fits the crop');
  if(width===1920||width===2964)await page.screenshot({path:path.join(out,`desktop-${width}x${height}.png`),animations:'disabled'});
  results.push(m);
 }
 const detail=page.locator('#journal-list button').first();await detail.click();assert.equal(await page.locator('#journal-detail').isVisible(),true);
 await page.locator('#journal-detail-close').click();assert.equal(await page.locator('#journal-detail').isVisible(),false);
 const routeIds=await page.locator('.route-card').evaluateAll(nodes=>nodes.map(el=>el.id));
 for(const id of routeIds){
  await page.locator('#'+id).click();const m=await layout(page);
  assert.ok(m.routeBounds.x>=0&&m.routeBounds.x+m.routeBounds.w<=720&&m.routeBounds.y>=m.camera.y&&m.routeBounds.y+m.routeBounds.h<=m.camera.y+m.camera.h,'all route projections remain inside their overview');
 }
 await page.locator('#overlay-action').click();await page.waitForTimeout(350);
 const before=Number(await page.locator('#journey-progress').getAttribute('aria-valuenow'));
 await page.setViewportSize({width:1920,height:1080});await page.waitForTimeout(350);
 assert.ok(Number(await page.locator('#journey-progress').getAttribute('aria-valuenow'))>=before,'resizing keeps journey progress');
 await page.locator('#map-toggle').click();const overview=await layout(page);
 assert.ok(Math.abs(overview.map.width/overview.map.height-overview.camera.w/overview.camera.h)<.001);
 await page.close();
 const phone=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});phone.on('pageerror',e=>errors.push(String(e)));await readerFixture(phone);
 for(const [width,height]of [[390,844],[844,390]]){
  await phone.setViewportSize({width,height});await phone.waitForTimeout(150);const m=await layout(phone);
  assert.ok(m.scrollWidth<=m.clientWidth+1,'phone page does not overflow');
  if(width===390){assert.equal(m.journalColumns,2);assert.equal(await phone.locator('.route-cards').evaluate(el=>getComputedStyle(el).display),'flex');}
  results.push({...m,touchEmulated:true});
 }
 await phone.setViewportSize({width:390,height:844});await phone.locator('#journal-list button').first().tap();assert.equal(await phone.locator('#journal-detail').isVisible(),true);await phone.locator('#journal-detail-close').tap();
 await phone.screenshot({path:path.join(out,'phone-home.png'),animations:'disabled'});
 assert.deepEqual(errors,[]);await browser.close();browser=null;
 const result={passed:true,results,routeOverviews:routeIds,resizePreservesProgress:true,pageErrors:errors,readerData:'18 local layout fixtures; not earned gameplay',physicalPhoneNotTested:true};
 await fs.writeFile(path.join(out,'results.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
})().catch(async e=>{console.error(e);await browser?.close();process.exitCode=1;});
