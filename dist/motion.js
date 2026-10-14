(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.TrailMotion=api;}(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';const TAU=Math.PI*2,fmt=n=>Math.round(n*1000)/1000;
 function resolution(width,height,dpr=1){const ratio=Number.isFinite(dpr)&&dpr>0?dpr:1;return Math.max(1,Math.min(ratio,3,Math.sqrt(5000000/Math.max(1,width*height))));}
 function viewport(width,height,view,overview=false){const scale=(overview?Math.min:Math.max)(width/view.w,height/view.h);return {scale,x:(width-view.w*scale)/2-view.x*scale,y:(height-view.h*scale)/2-view.y*scale};}
 function joint(hip,foot,l1=8.2,l2=8.3){const dx=foot.x-hip.x,dy=foot.y-hip.y,d=Math.max(.001,Math.hypot(dx,dy)),clamped=Math.min(l1+l2-.001,d),along=(l1*l1-l2*l2+clamped*clamped)/(2*clamped),offset=Math.sqrt(Math.max(0,l1*l1-along*along)),ux=dx/d,uy=dy/d;return {x:hip.x+ux*along+uy*offset,y:hip.y+uy*along-ux*offset};}
 function leg(phase,bob,walking,offset){const t=((phase+offset)%1+1)%1,stance=t<.6;let x,y;if(!walking){x=offset?3:-3;y=17.2;}else if(stance){x=4.8-t/.6*9.6;y=17.2;}else{const swing=(t-.6)/.4;x=-4.8+9.6*swing;y=17.2-Math.sin(swing*Math.PI)*4.3;}const hip={x:offset?1:-1,y:3.1-bob},foot={x,y},knee=walking?joint(hip,foot):{x:(hip.x+foot.x)/2+.4,y:(hip.y+foot.y)/2};return {hip,knee,foot,stance:!walking||stance,path:`M${fmt(hip.x)} ${fmt(hip.y)}L${fmt(knee.x)} ${fmt(knee.y)}L${fmt(foot.x)} ${fmt(foot.y)}`,shoe:`M${fmt(x-1.3)} ${fmt(y+.2)}L${fmt(x+3)} ${fmt(y+.2)}`};}
 function pose(clock=0,walking=false,reducedMotion=false,context={}){walking=walking&&!reducedMotion;const phase=walking?((clock/1.08)%1+1)%1:0,bob=walking?.75*(1-Math.cos(phase*TAU*2)):0,front=leg(phase,bob,walking,0),back=leg(phase,bob,walking,.5),swing=walking?Math.sin(phase*TAU)*3.1:0,action=context.action||'walk';const p={phase,bob,front,back,torso:`translate(0 ${fmt(-bob)}) rotate(${walking?2.5+Math.sin(phase*TAU)*.6:0} 0 3)`,pack:`translate(${fmt(-swing*.08)} ${fmt(Math.sin(phase*TAU-.5)*(walking?.45:0))})`,armBack:`M-4-8Q${fmt(-9+swing*.35)} ${-3} ${fmt(-7+swing)} ${3}`,armFront:`M4-8Q${fmt(9-swing*.25)} ${-5} ${fmt(13-swing*.6)} ${1}`,pole:`M${fmt(13-swing*.6)} ${fmt(-bob)}L${fmt(19-swing*.85)} 17.5`,scarf:`rotate(${walking?fmt(Math.sin(phase*TAU)*8):0} 0 -14)`};
  if(action==='photo'){p.armFront='M4-8Q10-10 10-16';p.armBack='M-4-8Q0-14 7-16';p.torso='translate(0 0) rotate(-3 0 3)';}
  else if(action==='shelter'){p.armFront='M4-8Q10-5 3-14';p.armBack='M-4-8Q-7-3 1-11';p.torso='translate(0 1) rotate(7 0 3)';}
  else if(action==='look'){p.armFront='M4-8Q10-13 7-23';p.torso='translate(0 0) rotate(-2 0 3)';}
  else if(action==='finish'){p.armFront='M4-8Q12-16 13-24';p.armBack='M-4-8Q-10-11-13-16';}
  else if(action==='discover'&&!reducedMotion){const age=Math.max(0,Math.min(1,(context.age||0)/1.2)),lift=Math.sin(age*Math.PI);p.armFront=`M4-8Q${fmt(9-swing*.25)} ${fmt(-5-10*lift)} ${fmt(13-swing*.6)} ${fmt(1-24*lift)}`;}
  if(context.weather==='blizzard'&&walking)p.torso=`translate(0 ${fmt(-bob)}) rotate(7 0 3)`;
  return p;
 }
 function cloud(index,elapsed=0,reduced=false){const time=reduced?0:elapsed;return {x:Math.sin(time*.037+index*1.31)*19,y:Math.sin(time*.022+index*.83)*3.5,alpha:.87+Math.sin(time*.043+index*.92)*.07};}
 function mist(index,elapsed=0,weather='clear',reduced=false){const time=reduced?0:elapsed,amount=weather==='fog'?.48:weather==='blizzard'?.36:weather==='snow'?.1:0;return {x:Math.sin(time*.054+index*2.2)*27,y:Math.cos(time*.034+index*1.7)*5,alpha:amount*(.8+Math.sin(time*.075+index)*.16)};}
 return {resolution,viewport,pose,cloud,mist,joint};
}));
