(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.TrailCheckpoints=api;}(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const ICONS=Object.freeze({'wugong-meadow':'grass','wugong-clouds':'cloud','wugong-golden':'sunrise','tiger-trail':'trail','tiger-gorge':'gorge','tiger-halfway':'sign','aotai-aoshan':'shelter','aotai-ridge':'snowpeak','aotai-taibai':'summit'});
 function draw(svg,parent,id){const name=ICONS[id]||'trail',g=svg('g',{'data-checkpoint-icon':name,'aria-hidden':'true','pointer-events':'none'},parent),ink='#41634e',leaf='#91af72',sun='#e8b35f',snow='#f4f8ed',water='#78b1b4';
  const shape=(tag,attrs)=>svg(tag,attrs,g),path=(d,fill='none',stroke=ink,width=1.8)=>shape('path',{d,fill,stroke,'stroke-width':width,'stroke-linecap':'round','stroke-linejoin':'round'});
  if(name==='grass'){path('M-14 9Q0 2 14 9L14 12H-14Z','#d5dfaa','none');path('M-7 7Q-9-2-13-5M-6 7Q-5-5-1-10M2 7Q0-3 4-7M6 7Q8-1 13-4');shape('circle',{cx:9,cy:-10,r:2.6,fill:sun});}
  else if(name==='cloud'){shape('circle',{cx:7,cy:-7,r:5,fill:sun});path('M-13 7Q-18 0-10-2Q-8-10-1-7Q6-12 11-3Q19-1 14 7Z',snow);path('M-9 11H9','none','#8eac9c',1.6);}
  else if(name==='sunrise'){shape('circle',{cx:5,cy:-8,r:5,fill:sun});path('M-14 11L-2-6L12 11Z',leaf);path('M-2-6L2 2L-3 0L-7 2',snow);path('M-15 13H15');}
  else if(name==='trail'){path('M-15 6L-7-5L1 5L7-10L15 6Z','#c4d4a8');path('M-4 14Q8 9 1 5Q-6 1 2-2','none','#bd9158',3);}
  else if(name==='gorge'){path('M-15-11L-7-8L-4 1L-8 11L-15 12Z','#c6b88f');path('M15-12L7-7L4 2L8 11L15 12Z','#a4b398');path('M0-11Q-4-3 1 1T0 14','none',water,3.6);}
  else if(name==='sign'){path('M0-13V14','none','#997b53',2.6);path('M-10-9H8L13-5L8-1H-10Z','#d7e1b2');path('M10 2H-7L-12 6L-7 10H10Z','#b5cca0');}
  else if(name==='shelter'){path('M-11-2H11V12H-11Z','#e4d6b3');path('M-15-2L0-12L15-2Z','#b0c5ae');path('M-9-6L0-12L9-6L3-6L0-8L-3-6Z',snow,'none');path('M-3 12V4H3V12','#97794f');}
  else if(name==='snowpeak'){path('M-15 12L-5-8L6 12Z','#a8c5b8');path('M-5-8L-1 0L-5-2L-9 0Z',snow,'none');path('M-4 12L6-12L16 12Z','#86aaa3');path('M6-12L10-2L6-5L2-2Z',snow,'none');}
  else{path('M-15 13L-1-5L13 13Z','#afc8b7');path('M-1-5L4 2L-1 0L-6 2Z',snow,'none');path('M-1-5V-15');path('M0-15H11L8-11L11-7H0Z',sun);}
  return g;
 }
 return {ICONS,draw};
}));
