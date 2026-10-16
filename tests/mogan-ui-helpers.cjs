// UI events against the DOM fixture. Not browser, rendering or listening evidence.
const assert=require('node:assert/strict'),A=require('../dist/art-games.js'),R=require('../dist/runtime.js');
const phrase=[0,3,1,4,2,5,3,1];
function pointer(h,x,y=.8){const b=h.$('micro-surface').getBoundingClientRect(),event={pointerId:71,isPrimary:true,button:0,clientX:b.left+x*b.width,clientY:b.top+y*b.height};h.$('micro-surface').emit('pointerdown',event);h.$('micro-surface').emit('pointerup',event);}
function stepPoint(h){
 const b=h.$('micro-surface').getBoundingClientRect(),height=Math.max(320,Math.round(800*b.height/b.width)),index=parseInt(h.$('mogan-count').textContent,10)||0;
 const spot=R.stepSpot({age:0,play:{reduced:true},steps:{index,landedAt:-10}},height);return {x:spot.x/800,y:spot.y/height};
}
function touchStep(h){const p=stepPoint(h);pointer(h,p.x,p.y);}
async function openMogan(h){h.click('route-mogan');h.click('overlay-action');h.advance(10);h.click('observe-button');await h.readyArt();h.advance(.02);assert.equal(h.$('micro-panel').getAttribute('data-mogan'),'true');assert.equal(h.$('micro-surface').getAttribute('aria-busy'),'false');}
function playRain(h){
 for(let i=0;i<800&&!h.$('micro-panel').hidden;i++){
  const n=Math.min(7,parseInt(h.$('mogan-count').textContent,10)||0);pointer(h,.14+phrase[n]*.143);h.advance(.1);
 }
 assert.equal(h.$('reward-overlay').hidden,false);
}
function playSteps(h){
 touchStep(h);
 for(let i=0;i<900&&!h.$('micro-panel').hidden;i++){
  h.advance(.05);if(h.$('mogan-tools').getAttribute('data-beat')==='open')touchStep(h);
 }
 assert.equal(h.$('reward-overlay').hidden,false);
}
function playSling(h){
 const surface=h.$('micro-surface'),box=surface.getBoundingClientRect(),height=Math.max(320,Math.round(800*box.height/box.width)),b=R.moganBounds(height),angle=40*Math.PI/180;
 const from=A.aimPouch({sling:{angle:24,power:.5}}),to={x:A.slingOrigin.x-Math.cos(angle)*.16*.6,y:A.slingOrigin.y+Math.sin(angle)*.16*.6};
 const event=p=>({pointerId:72,isPrimary:true,button:0,clientX:box.left+(b.x+p.x*b.w)/800*box.width,clientY:box.top+(b.y+p.y*b.h)/height*box.height});
 surface.emit('pointerdown',event(from));surface.emit('pointermove',event(to));h.advance(.02);surface.emit('pointerup',event(to));h.advance(5);assert.equal(h.$('reward-overlay').hidden,false);
}
module.exports={openMogan,playRain,playSteps,playSling,pointer,stepPoint,touchStep};
