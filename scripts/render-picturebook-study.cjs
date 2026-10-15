// Static SVG compositions from real journey DOM data; these are not browser screenshots.
const fs=require('node:fs'),path=require('node:path'),{harness}=require('../tests/dom-harness.cjs');
const sharp=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,'sharp'):'sharp');
const out=path.join(__dirname,'../docs/previews');fs.mkdirSync(out,{recursive:true});
const escape=s=>String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
function serialize(el){const tag=({LINEARGRADIENT:'linearGradient',RADIALGRADIENT:'radialGradient',CLIPPATH:'clipPath',FEGAUSSIANBLUR:'feGaussianBlur'}[el.tagName]||el.tagName.toLowerCase());return `<${tag} ${Object.entries(el.attributes).map(([k,v])=>`${k}="${escape(v)}"`).join(' ')}>${escape(el.textContent)}${el.children.map(serialize).join('')}</${tag}>`;}
function journey(width,height,overview){const h=harness(undefined,{viewport:{width,height}});h.click('route-westlake');h.click('overlay-action');for(let i=0;i<900&&Number(h.$('journey-progress').getAttribute('aria-valuenow'))<54;i++){h.advance(.5);if(!h.$('story-panel').hidden)h.$('story-choices').querySelector('button').emit('click');if(!h.$('photo-panel').hidden)h.click('photo-continue');}h.click('walk-toggle');if(overview)h.click('map-toggle');return h;}
const font='Noto Serif SC,Noto Serif CJK SC,serif';
const mapCSS=`#route-outline{stroke:#fcf7df;stroke-width:9}#route-line{stroke:#a38a60;stroke-width:3.8}#completed-line{stroke:#587d62;stroke-width:4.2}.checkpoint-label{paint-order:stroke;stroke:#f8f4df;stroke-width:3;font-family:${font};font-size:13px}text{font-family:${font}}`;
function scene(h,x,y,w,hh){const map=h.$('map');map.setAttribute('x',x);map.setAttribute('y',y);map.setAttribute('width',w);map.setAttribute('height',hh);return `<rect x="${x}" y="${y}" width="${w}" height="${hh}" fill="#edf0dd"/>${serialize(map).replace('</svg>',`<style>${mapCSS}</style></svg>`)}`;}
function text(x,y,t,size=14,color='#3e624c',extra=''){return `<text x="${x}" y="${y}" font-size="${size}" fill="${color}" ${extra}>${escape(t)}</text>`;}
function pill(x,y,w,t){return `<rect x="${x}" y="${y}" width="${w}" height="32" rx="16" fill="#fcfaf0" stroke="#d5d7c1"/>${text(x+w/2,y+21,t,11,'#687b5d','text-anchor="middle"')}`;}
function frame(width,height,body){return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="${width}" height="${height}" fill="#f7f5e9"/><g font-family="${font}">${body}</g></svg>`;}
(async()=>{
 const desktop=journey(1040,650,true),mobile=journey(354,460,false);
 let d=text(40,41,'山径',25)+text(113,39,'TRAILBOUND',10,'#7e8d75','letter-spacing="2"')+text(40,95,'雨后，去茶园走走。',32)+text(40,120,'九溪龙井',13,'#819174');
 d+=`<defs><clipPath id="study-desktop-frame"><rect x="40" y="151" width="1040" height="650" rx="18"/></clipPath></defs><g clip-path="url(#study-desktop-frame)">${scene(desktop,40,151,1040,650)}</g>`;
 d+=pill(56,167,80,'晴朗')+pill(947,167,116,'跟着小人走')+text(57,838,'停下来看看',17)+text(57,865,'听溪水从石头旁经过。',13,'#819174')+pill(898,826,164,'继续走 →');
 d+=`<rect x="40" y="902" width="1040" height="1" fill="#d9ddc7"/>`+text(40,937,'WESTLAKE / SVG ART STUDY',11,'#8a967d','letter-spacing="1.5"');
 const ds=frame(1120,960,d);fs.writeFileSync(path.join(out,'westlake-desktop-study.svg'),ds);await sharp(Buffer.from(ds)).resize(1680,1440).png().toFile(path.join(out,'westlake-desktop-study.png'));
 let m=text(18,34,'山径',23)+text(83,32,'TRAILBOUND',8,'#7e8d75','letter-spacing="1.5"')+text(18,84,'雨后，去茶园走走。',25)+text(18,110,'九溪龙井',12,'#819174');
 m+=`<defs><clipPath id="study-mobile-frame"><rect x="18" y="131" width="354" height="460" rx="16"/></clipPath></defs><g clip-path="url(#study-mobile-frame)">${scene(mobile,18,131,354,460)}</g>`;
 m+=pill(28,143,67,'晴朗')+pill(252,143,110,'看完整路线')+text(18,624,'停下来看看',17)+text(18,652,'听溪水从石头旁经过。',12,'#819174');
 m+=`<rect x="18" y="680" width="354" height="3" rx="1.5" fill="#dce1cb"/><rect x="18" y="680" width="191" height="3" rx="1.5" fill="#7e9c70"/>`+pill(240,704,132,'继续走 →');
 m+=text(18,785,'MOBILE / SVG ART STUDY',9,'#8a967d','letter-spacing="1"');const ms=frame(390,810,m);fs.writeFileSync(path.join(out,'westlake-mobile-study.svg'),ms);await sharp(Buffer.from(ms)).resize(780,1620).png().toFile(path.join(out,'westlake-mobile-study.png'));
 const player=desktop.$('player'),defs=desktop.$('map').children.find(e=>e.tagName==='DEFS');const detail=frame(860,410,serialize(defs)+text(32,40,'背包与风光',21)+`<svg x="32" y="60" width="260" height="305" viewBox="-22 -34 50 59">${player.children.map(serialize).join('')}</svg><svg x="330" y="70" width="500" height="290" viewBox="333 85 230 160">${serialize(desktop.$('geo-background'))}</svg>`+text(330,383,'VECTOR DETAIL / ORIGINAL PATHS',10,'#8a967d','letter-spacing="1"'));fs.writeFileSync(path.join(out,'westlake-detail-study.svg'),detail);await sharp(Buffer.from(detail)).resize(1290,615).png().toFile(path.join(out,'westlake-detail-study.png'));
 console.log('Saved 3 SVG compositions and 3 PNG renders. These are static art studies, not browser or phone screenshots.');
})();
