// Render actual vector scenes for art review; this does not replace browser/device QA.
const fs=require('fs'),path=require('path'),zlib=require('node:zlib'),G=require('../dist/game'),D=require('../dist/discoveries'),X=require('../dist/micro-moments'),{harness}=require('../tests/dom-harness.cjs'),sharp=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/sharp');
const out=path.join(__dirname,'../docs/previews');fs.mkdirSync(out,{recursive:true});
class Node{constructor(tag,attrs={}){this.tag=tag;this.attrs=attrs;this.children=[];}setAttribute(k,v){this.attrs[k]=v;}}
const svg=(tag,attrs,parent)=>{const n=new Node(tag,attrs);parent?.children.push(n);return n;};
const escape=s=>String(s??'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');
const cases={LINEARGRADIENT:'linearGradient',RADIALGRADIENT:'radialGradient',CLIPPATH:'clipPath',FEGAUSSIANBLUR:'feGaussianBlur'};
function serialize(n,prefix=''){const tag=n.tag||cases[n.tagName]||n.tagName.toLowerCase(),attrs=n.attrs||n.attributes;return `<${tag} ${Object.entries(attrs).filter(([k,v])=>!((k==='opacity'&&String(v)==='1')||(k==='stroke-width'&&attrs.stroke==='none'))).map(([k,v])=>{v=k==='id'?prefix+v:String(v).replace(/url\(#([^)]*)\)/g,(_,id)=>`url(#${prefix}${id})`);return `${k}="${escape(v)}"`;}).join(' ')}>${escape(n.textContent)}${n.children.map(c=>serialize(c,prefix)).join('')}</${tag}>`;}
function text(x,y,value,size=15){return `<text x="${x}" y="${y}" fill="#5e7956" font-size="${size}" font-family="Noto Serif SC,serif">${escape(value)}</text>`;}
const styles='<style>[id$="route-outline"]{stroke:#fcf7df;stroke-width:9}[id$="route-line"]{stroke:#a38a60;stroke-width:3.8}[id$="completed-line"]{stroke:#587d62;stroke-width:4.2}.checkpoint-label{paint-order:stroke;stroke:#f8f4df;stroke-width:3;font-family:Noto Serif SC,serif;font-size:13px}text{font-family:Noto Serif SC,serif}</style>';
async function render(name,body,width,height){const source=`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="${width}" height="${height}" fill="#f7f5e9"/>${body}${styles}</svg>`;fs.writeFileSync(path.join(out,name+(name==='seven-route-gameplay-review'?'.svgz':'.svg')),name==='seven-route-gameplay-review'?zlib.gzipSync(source,{level:9}):source);await sharp(Buffer.from(source)).png().toFile(path.join(out,name+'.png'));}
(async()=>{
 let maps=text(24,38,'山径 · 七条绘本旅程',23);
 for(const [i,route]of G.ROUTES.entries()){
  const row=i<3?0:i<5?1:2,col=i<3?i:i<5?i-3:i-5,x=row?190+col*365:24+col*360,y=65+row*340;
  const h=harness(undefined,{viewport:{width:336,height:280}});h.click('route-'+route.id);const map=h.$('map');map.setAttribute('x',x);map.setAttribute('y',y+28);map.setAttribute('width',336);map.setAttribute('height',280);maps+=text(x,y+18,route.name,16)+serialize(map,'map'+i+'-');
 }
 await render('seven-route-gameplay-review',maps,1104,1090);
 let scenes=text(24,37,'路边的小动静 · 轻触、轻划或静静看',22);const ids=['meadow-bird','meadow-butterfly','coast-shell','bamboo-drop','westlake-floating-leaf','westlake-leaf-shadow'];
 for(const [i,id]of ids.entries()){const entry=D.item(id),root=new Node('svg',{xmlns:'http://www.w3.org/2000/svg',x:24+i%3*414,y:83+Math.floor(i/3)*290,width:400,height:230,viewBox:'0 0 400 230'}),refs=X.draw(svg,root,entry);let s=X.create(entry);s=X.act(s,{x:.45,y:.56,gesture:i===2?'drag':'tap'});if(i===2)for(const p of [{x:.33,y:.76},{x:.42,y:.59},{x:.52,y:.51},{x:.65,y:.45}])s=X.move(s,p);s=X.release(s);s={...s,reaction:1.1,age:1.1};X.paint(refs,s);scenes+=text(24+i%3*414,75+Math.floor(i/3)*290,entry.name,15)+serialize(root,'scene'+i+'-');}
 await render('micro-gameplay-review',scenes,1266,647);
 // A 390 px mobile composition contains the actual micro-scene SVG, with all copy outside it.
 const entry=D.item('coast-shell'),root=new Node('svg',{xmlns:'http://www.w3.org/2000/svg',x:22,y:185,width:346,height:199,viewBox:'0 0 400 230'}),refs=X.draw(svg,root,entry);let s=X.act(X.create(entry),{x:.33,y:.7,gesture:'drag'});for(const p of [{x:.45,y:.56},{x:.56,y:.47},{x:.65,y:.43}])s=X.move(s,p);s=X.release(s);X.paint(refs,{...s,reaction:1.1});
 const body=text(22,43,'山径',25)+text(22,90,'海边，停下来看看。',23)+`<rect x="14" y="129" width="362" height="395" rx="18" fill="#fffdf2" stroke="#d2d8bf"/>`+text(28,158,entry.place,12)+text(28,179,entry.name,16)+serialize(root,'mobile-')+text(28,416,'沿着纹理轻划，看看藏在表面的细节。',12)+text(28,442,'也可以静静看一会儿。',12)+`<rect x="229" y="470" width="122" height="34" rx="17" fill="#ecf1dc"/>`+text(252,492,'继续走 →',12)+text(22,565,'这一刻，留在旅程里。',18)+text(22,598,'MOBILE / INTERACTION STUDY',9);
 await render('mobile-gameplay-review',body,390,632);
 console.log('Saved static art review: seven maps, six interaction examples and a mobile close-up.');
})();
