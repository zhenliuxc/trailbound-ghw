#!/usr/bin/env node
// Packaging only: all illustrations are generated with built-in imagegen.
'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const sharp=require('sharp');
const root=path.resolve(__dirname,'..'),sources=path.join(root,'art/provenance/badges-v4/sources.json'),review=path.join(root,'.local/art-review/badges-v4'),out=path.join(root,'public/badges');
const routes=[['wugong','武功山','Wugong','暖季绿色草甸'],['tiger','虎跳峡高路','Tiger Gorge','暖季峡谷'],['aotai','秦岭虚拟章节','Qinling','风雪季'],['maclehose','麦理浩径第二段','MacLehose 2','暖季绿色海岸'],['changping','长坪沟','Changping','绿林溪谷 · 远峰积雪'],['mogan','莫干山古道','Mogan','湿润绿竹林'],['westlake','九溪—龙井村','Jiuxi / Longjing','春日茶园']];
const order=['wugong-wind-hiker','wugong-grass-letter','wugong-cloud-island','wugong-stone-altar','tiger-bell-first','tiger-river-below','tiger-halfway-rest','tiger-longdong-waterfall','aotai-takin-first','aotai-rock-facets','aotai-ridgeline','maclehose-sideways-crab','maclehose-bay-reveal','maclehose-tide-drawing','maclehose-chek-keng','changping-tree-double','changping-red-stone','changping-muluozi','mogan-bamboo-reply','mogan-old-stone-path','westlake-five-more-minutes','westlake-creek-stones','westlake-longjing-bud'];
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
async function main(){
 const records=JSON.parse(fs.readFileSync(sources,'utf8')).items;
 const byId=new Map(records.map(r=>[r.id,r]));
 if(records.length!==23||byId.size!==23||order.some(id=>!byId.has(id)))throw Error('Expected all 23 unique source images before packaging');
 fs.mkdirSync(out,{recursive:true});
 fs.mkdirSync(review,{recursive:true});
 const entries=[];
 for(const id of order){
  const row=byId.get(id),original=fs.readFileSync(row.source),input=await sharp(original).metadata();
  if(!input.hasAlpha||input.width<1000||input.height<1000)throw Error('Source resolution / alpha: '+id);
  const file=id+'-v4.webp',dest=path.join(out,file);
  await sharp(original).resize(384,384,{fit:'contain',background:{r:0,g:0,b:0,alpha:0}}).webp({quality:86,alphaQuality:100,effort:6}).toFile(dest);
  const data=fs.readFileSync(dest),metadata=await sharp(data).metadata(),{data:raw,info}=await sharp(data).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  const corners=[0,info.width-1,(info.height-1)*info.width,info.width*info.height-1];
  if(metadata.width!==384||metadata.height!==384||!metadata.hasAlpha||corners.some(i=>raw[i*4+3]!==0))throw Error('Output dimensions / transparent corners: '+id);
  if(data.length>110000)throw Error('Badge exceeds 110KB: '+id);
  entries.push({id,route:row.route,name:row.name,season:row.season,file:'badges/'+file,width:384,height:384,bytes:data.length,sha256:hash(data),sourceGeneratedFile:path.basename(row.source),sourceSha256:hash(original),reused:row.reused});
 }
 if(new Set(entries.map(e=>e.sha256)).size!==23)throw Error('Duplicate badge image');
 const manifest={artVersion:4,stage:'image-preview',runtimeBound:false,generator:'built-in imagegen',format:'webp',transparent:true,entries};
 fs.writeFileSync(path.join(out,'art-v4.json'),JSON.stringify(manifest,null,2)+'\n');
 const figures=new Map(entries.map(e=>[e.id,`<figure><button type="button" aria-label="放大${escape(e.name)}" data-name="${escape(e.name)}"><img src="data:image/webp;base64,${fs.readFileSync(path.join(root,'public',e.file)).toString('base64')}" width="384" height="384" alt="${escape(e.name)}"></button><figcaption><strong>${escape(e.name)}</strong><small>${escape(e.season)}</small></figcaption></figure>`]));
 const html=`<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>山径 · 23枚手帐标签</title><style>*{box-sizing:border-box}body{margin:0;background:#f5f0e4;color:#304c40;font-family:system-ui,-apple-system,"PingFang SC","Microsoft YaHei",sans-serif}main{max-width:1160px;margin:auto;padding:32px 22px 56px}h1{font-size:clamp(26px,5vw,40px);margin:0 0 12px}p{line-height:1.8;color:#647566}header{padding:10px 0 22px}section{margin-top:28px;padding-top:20px;border-top:1px solid #d9ddca}h2{font-size:22px;margin:0}h2 small{display:block;font-size:13px;font-weight:400;color:#718372;margin:7px 0 17px}.grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:22px 20px}figure{margin:0;text-align:center;min-width:0}button{border:0;background:transparent;padding:0;cursor:zoom-in;width:100%;border-radius:50%}button:focus-visible{outline:3px solid #6d9866;outline-offset:4px}img{display:block;width:100%;height:auto}figcaption{padding:10px 4px 12px}strong{display:block;font-size:17px}figcaption small{display:block;margin-top:7px;color:#7c806b;font-size:12px;line-height:1.5}dialog{max-width:min(92vw,650px);border:0;border-radius:20px;background:#f8f3e7;color:#304c40;padding:20px}dialog::backdrop{background:#173d35a8}dialog button{cursor:pointer;width:auto;border-radius:6px;padding:8px 12px;background:#e2e6d7;float:right}dialog img{clear:both;margin-top:8px}dialog p{text-align:center;margin:10px 0 0}@media(max-width:650px){main{padding:24px 15px 40px}.grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:17px 13px}strong{font-size:16px}}</style><main><header><h1>山径 · 手帐里的23次停留</h1><p>沿途的人、动物、植物与景物。按地图场景选择时节，名字和说明放在图案外。<br>点按图片可单独放大查看。</p></header>${routes.map(([id,name,,season])=>`<section><h2>${name}<small>${season}</small></h2><div class="grid">${entries.filter(e=>e.route===id).map(e=>figures.get(e.id)).join('')}</div></section>`).join('')}<dialog><button type="button" id="close">关闭</button><img alt=""><p></p></dialog></main><script>const d=document.querySelector('dialog');document.querySelectorAll('figure button').forEach(b=>b.addEventListener('click',()=>{d.querySelector('img').src=b.querySelector('img').src;d.querySelector('img').alt=b.dataset.name;d.querySelector('p').textContent=b.dataset.name;d.showModal()}));document.querySelector('#close').addEventListener('click',()=>d.close());d.addEventListener('click',e=>{if(e.target===d)d.close()});</script></html>`;
 fs.writeFileSync(path.join(review,'review.html'),html);
 // Static composition proof. Latin labels use installed fonts; Chinese captions are in the HTML.
 const W=1168,H=2634,canvas=[],texts=['<rect width="1168" height="2634" fill="#f5f0e4"/>','<text x="32" y="46" font-size="27" fill="#304c40">TRAILBOUND · 23 JOURNAL BADGES</text>'];
 for(let row=0;row<routes.length;row++){
  const [id,,english]=routes[row],top=82+row*360;
  texts.push(`<text x="32" y="${top+24}" font-size="22" fill="#304c40">${escape(english)}</text>`);
  const group=entries.filter(e=>e.route===id);
  for(let col=0;col<group.length;col++){
   const e=group[col],left=32+col*282,index=entries.indexOf(e)+1;
   const buf=await sharp(path.join(root,'public',e.file)).resize(250,250).png().toBuffer();
   canvas.push({input:buf,left,top:top+40});
   texts.push(`<text x="${left+125}" y="${top+317}" text-anchor="middle" font-size="16" fill="#647566">${String(index).padStart(2,'0')}</text>`);
  }
 }
 // Caption layer is deliberately above the background and below each illustration.
 const svg=Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><g font-family="DejaVu Sans">${texts.join('')}</g></svg>`);
 await sharp(svg).composite(canvas).webp({quality:86,effort:5}).toFile(path.join(review,'overview.webp'));
 const total=entries.reduce((n,e)=>n+e.bytes,0);
 const summary={count:entries.length,totalBytes:total,meanBytes:Math.round(total/entries.length),maxBytes:Math.max(...entries.map(e=>e.bytes)),dimensions:'384×384',transparentCorners:true,distinctHashes:true,routeCounts:Object.fromEntries(routes.map(([id])=>[id,entries.filter(e=>e.route===id).length]))};
 fs.writeFileSync(path.join(review,'validation.json'),JSON.stringify(summary,null,2)+'\n');
 console.log(JSON.stringify(summary,null,2));
}
main().catch(e=>{console.error(e.message);process.exitCode=1});
