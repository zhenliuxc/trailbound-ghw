// UI events against the DOM fixture. This is not browser, rendering or listening evidence.
const assert=require('node:assert/strict');
const phrase=[0,3,1,4,2,5,3,1];
function pointer(h,x){const b=h.$('micro-surface').getBoundingClientRect(),event={pointerId:71,isPrimary:true,button:0,clientX:x*b.width,clientY:b.height*.8};h.$('micro-surface').emit('pointerdown',event);h.$('micro-surface').emit('pointerup',event);}
async function openMogan(h){h.click('route-mogan');h.click('overlay-action');h.advance(10);h.click('observe-button');await h.readyArt();h.advance(.02);assert.equal(h.$('micro-panel').getAttribute('data-mogan'),'true');assert.equal(h.$('micro-surface').getAttribute('aria-busy'),'false');}
function playRain(h){
 for(let i=0;i<800&&!h.$('micro-panel').hidden;i++){
  const n=Math.min(7,parseInt(h.$('mogan-count').textContent,10)||0);pointer(h,.14+phrase[n]*.143);h.advance(.1);
 }
 assert.equal(h.$('reward-overlay').hidden,false);
}
function playSteps(h){
 h.click('mogan-start');
 for(let i=0;i<900&&!h.$('micro-panel').hidden;i++){
  h.advance(.05);
  for(const side of ['left','right'])if(h.$('mogan-foot-'+side).getAttribute('data-ready')==='true')h.click('mogan-foot-'+side);
 }
 assert.equal(h.$('reward-overlay').hidden,false);
}
function playSling(h){
 h.click('mogan-tune');for(const [id,value]of [['mogan-angle',40],['mogan-power',60]]){h.$(id).value=String(value);h.$(id).emit('input');}
 h.click('mogan-start');h.advance(5);assert.equal(h.$('reward-overlay').hidden,false);
}
module.exports={openMogan,playRain,playSteps,playSling};
