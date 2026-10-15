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
async function render(name,body,width,height){const source=`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="${width}" height="${height}" fill="#f7f5e9"/>${body}${styles}</svg>`;fs.writeFileSync(path.join(out,name+(name==='landscape-interactions-review'?'.svgz':'.svg')),name==='landscape-interactions-review'?zlib.gzipSync(source,{level:9}):source);await sharp(Buffer.from(source)).png({compressionLevel:9}).toFile(path.join(out,name+'.png'));}
const P=require('../dist/moment-play');
const labels={follow:'Follow a bird',sweep:'Part the clouds',align:'Catch a sunbeam',wait:'Wait for a hello',echo:'Water-stone echoes',trail:'Find the next step',inspect:'A tiny world, magnified',sand:'Draw, then let the tide erase',turn:'Turn and discover',settle:'Wait for a still reflection',guide:'Guide a leaf downstream',rhythm:'Make a little rain rhythm',place:'Find a resting place',panorama:'Open the landscape',listen:'Listen near and far',spray:'Stay with the waterfall',outline:'Trace the ridge',brew:'Let tea leaves unfold'};
function tick(s,time){for(let i=0;i<Math.ceil(time/.05);i++)s=X.tick(s,.05);return s;}
function demo(entry){let s=X.create(entry),kind=P.type(entry);
 if(kind==='sand'){for(const point of [{x:.2,y:.7},{x:.35,y:.5},{x:.5,y:.8},{x:.65,y:.5},{x:.8,y:.7}])s=X.move(s,point);return tick(X.release(s),.9);}
 s=X.act(s,{assist:true});if(['wait','settle','align','inspect','follow','spray','brew'].includes(kind))return tick(s,['wait','settle','brew'].includes(kind)?2.4:.8);
 for(let i=0;i<2;i++){s=tick(s,.24);s=X.act(s,{assist:true});}return tick(s,.25);
}
(async()=>{
 let scenes=text(24,37,'TRAILBOUND / LANDSCAPE INTERACTIONS',22);
 for(const [row,route]of G.ROUTES.entries()){
  scenes+=text(24,70+row*290,route.name,17);
  const entries=route.id==='westlake'?['westlake-stones','westlake-tea','westlake-basket'].map(D.item):D.CATALOG.filter(e=>e.route===route.id);
  for(const [col,entry] of entries.entries()){
   const x=24+col*414,y=99+row*290,root=new Node('svg',{xmlns:'http://www.w3.org/2000/svg',x,y,width:400,height:230,viewBox:'0 0 400 230'}),refs=X.draw(svg,root,entry);X.paint(refs,demo(entry));
   scenes+=text(x,y-8,({grass:'A wave across the grass',cloudsea:'Let the cloud-sea drift',altar:'An arch made of stone',bamboowind:'Listen to the bamboo',deadtrees:'Match the reflected branches',mistpeak:'A peak comes through the mist'})[entry.scene]||labels[P.type(entry)],12)+serialize(root,'distinct-'+row+'-'+col+'-');
  }
 }
 await render('landscape-interactions-review',scenes,1266,2140);
 console.log('Saved seven journeys with three distinct play types per row.');
})();
