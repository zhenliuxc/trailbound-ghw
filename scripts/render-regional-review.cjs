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
async function render(name,body,width,height){const source=`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="${width}" height="${height}" fill="#f7f5e9"/>${body}${styles}</svg>`;fs.writeFileSync(path.join(out,name+(name==='regional-interactions-review'?'.svgz':'.svg')),name==='regional-interactions-review'?zlib.gzipSync(source,{level:9}):source);await sharp(Buffer.from(source)).png({compressionLevel:9}).toFile(path.join(out,name+'.png'));}
(async()=>{
 let scenes=text(24,37,'山径 · 路边的小动静',22);const routes=G.ROUTES.filter(r=>r.id!=='westlake');
 for(const [row,route] of routes.entries()){
  scenes+=text(24,70+row*272,route.name,17);
  for(const [col,entry] of D.CATALOG.filter(e=>e.route===route.id).entries()){
   const root=new Node('svg',{xmlns:'http://www.w3.org/2000/svg',x:24+col*414,y:82+row*272,width:400,height:230,viewBox:'0 0 400 230'}),refs=X.draw(svg,root,entry);
   let s=X.create(entry);s=X.move(s,{x:.32,y:.71});for(const p of [{x:.4,y:.64},{x:.5,y:.59},{x:.6,y:.52},{x:.68,y:.43}])s=X.move(s,p);s=X.release(s);X.paint(refs,{...s,reaction:1.1,age:1.1});scenes+=serialize(root,'regional-'+row+'-'+col+'-');
  }
 }
 await render('regional-interactions-review',scenes,1266,1720);
 console.log('Saved eighteen regional SVG interaction scenes.');
})();
