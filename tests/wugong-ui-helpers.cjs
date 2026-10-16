// Simulated UI controls; no browser rendering or real device input is measured here.
const Mini=require('../dist/mini-games.js'),D=require('../dist/discoveries.js');
async function openWind(h){h.click('overlay-action');h.advance(10);h.click('observe-button');await h.readyArt();}
function fly(h){
 const surface=h.$('micro-surface'),height=h.document.viewport?.height||600;
 for(let i=0;i<600&&!h.$('micro-panel').hidden;i++){
  const probe=Mini.create(D.item('meadow-bird'));probe.travel=Number(h.$('micro-progress').getAttribute('aria-valuenow'))/100;probe.age=i*.1;probe.actor.x=.24+probe.travel*.37;
  const y=Mini.windTarget(probe)*height;
  surface.emit('pointerdown',{pointerId:1,clientX:180,clientY:y,button:0,isPrimary:true});surface.emit('pointerup',{pointerId:1,clientX:180,clientY:y});h.advance(.1);
 }
 if(!h.$('micro-panel').hidden)throw Error('The continuous flight did not finish through its pointer controls');
}
module.exports={openWind,fly};
