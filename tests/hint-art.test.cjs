// Retained nodes and async ownership only; this is not GPU/visual/phone QA.
const test=require('node:test'),assert=require('node:assert/strict'),H=require('../dist/hint-art.js');
test('an unavailable optional watercolor cue retains a pencil marker without allocating per frame',async()=>{
 const P=await import('pixi.js'),parent=new P.Container(),entry={state:'error',promise:null};entry.promise=Promise.resolve(entry);
 const view=H.createPixiHints(P,parent,entry);await entry.promise;
 for(let i=0;i<100;i++)view.paint([H.hintPose('current',{x:200+i,y:120},100)]);
 const layer=parent.children[0];assert.equal(layer.children.length,1);
 const group=layer.children[0];assert.equal(group.children.find(n=>n instanceof P.Graphics).visible,true);assert.equal(group.children.find(n=>n instanceof P.Sprite).visible,false);
 view.dispose();view.dispose();assert.equal(parent.children.length,0);parent.destroy();
});
test('a watercolor asset resolving after exit cannot decode, render or attach to the next scene',async()=>{
 const P=await import('pixi.js'),parent=new P.Container();let resolve,accessed=false,rendered=0;
 const entry={state:'loading',get image(){accessed=true;return {};},promise:new Promise(r=>resolve=r)};
 const view=H.createPixiHints(P,parent,entry,()=>rendered++);view.paint([H.hintPose('current',{x:200,y:120})]);view.dispose();
 entry.state='ready';resolve(entry);await entry.promise;await Promise.resolve();
 assert.equal(accessed,false);assert.equal(rendered,0);assert.equal(parent.children.length,0);parent.destroy();
});
