(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.TrailCheckpoints=api;}(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const ICONS=Object.freeze({'wugong-meadow':'grass','wugong-clouds':'cloud','wugong-golden':'sunrise','tiger-trail':'trail','tiger-gorge':'gorge','tiger-halfway':'sign','aotai-aoshan':'shelter','aotai-ridge':'snowpeak','aotai-taibai':'summit','westlake-creek':'creekstone','westlake-path':'stonepath','westlake-tea':'teavillage',
  "maclehose-saiwan": "beach",
  "maclehose-hamtin": "waves",
  "maclehose-chekkeng": "pier",
  "changping-forest": "conifer",
  "changping-valley": "stream",
  "changping-meadow": "valley",
  "mogan-bamboo": "bamboo",
  "mogan-path": "steps",
  "mogan-stream": "spring"
});
 function draw(svg,parent,id){const name=ICONS[id]||'trail',g=svg('g',{'data-checkpoint-icon':name,'aria-hidden':'true','pointer-events':'none'},parent),ink='#41634e',leaf='#91af72',sun='#e8b35f',snow='#f4f8ed',water='#78b1b4';
  const shape=(tag,attrs)=>svg(tag,attrs,g),path=(d,fill='none',stroke=ink,width=1.8)=>shape('path',{d,fill,stroke,'stroke-width':width,'stroke-linecap':'round','stroke-linejoin':'round'});
  if(name==='grass'){path('M-14 9Q0 2 14 9L14 12H-14Z','#d5dfaa','none');path('M-7 7Q-9-2-13-5M-6 7Q-5-5-1-10M2 7Q0-3 4-7M6 7Q8-1 13-4');shape('circle',{cx:9,cy:-10,r:2.6,fill:sun});}
  else if(name==='cloud'){shape('circle',{cx:7,cy:-7,r:5,fill:sun});path('M-13 7Q-18 0-10-2Q-8-10-1-7Q6-12 11-3Q19-1 14 7Z',snow);path('M-9 11H9','none','#8eac9c',1.6);}
  else if(name==='sunrise'){shape('circle',{cx:5,cy:-8,r:5,fill:sun});path('M-14 11L-2-6L12 11Z',leaf);path('M-2-6L2 2L-3 0L-7 2',snow);path('M-15 13H15');}
  else if(name==='trail'){path('M-15 6L-7-5L1 5L7-10L15 6Z','#c4d4a8');path('M-4 14Q8 9 1 5Q-6 1 2-2','none','#bd9158',3);}
  else if(name==='gorge'){path('M-15-11L-7-8L-4 1L-8 11L-15 12Z','#c6b88f');path('M15-12L7-7L4 2L8 11L15 12Z','#a4b398');path('M0-11Q-4-3 1 1T0 14','none',water,3.6);}
  else if(name==='sign'){path('M0-13V14','none','#997b53',2.6);path('M-10-9H8L13-5L8-1H-10Z','#d7e1b2');path('M10 2H-7L-12 6L-7 10H10Z','#b5cca0');}
  else if(name==='shelter'){path('M-11-2H11V12H-11Z','#e4d6b3');path('M-15-2L0-12L15-2Z','#b0c5ae');path('M-9-6L0-12L9-6L3-6L0-8L-3-6Z',snow,'none');path('M-3 12V4H3V12','#97794f');}
  else if(name==='creekstone'){path('M-15-6Q-4-1 5-6T17-6','none',water,1.7);path('M-16 10Q-6 5 2 10T16 10','none',water,1.7);for(const [x,y]of [[-9,2],[5,-1]])shape('ellipse',{cx:x,cy:y,rx:6,ry:3.5,fill:'#bbc3a6',stroke:ink,'stroke-width':1.2});}
  else if(name==='stonepath'){path('M-15 11L-4-13L10-13L15 11Z','#e0d8b4');path('M-9 0H11M-12 7H14','none','#9eaa83',1.5);path('M-15-8V6M-19-5L-15-11L-11-5Z',leaf);}
  else if(name==='teavillage'){path('M-12-2H12V13H-12Z','#e4dcc0');path('M-16-2L0-12L16-2L12 1H-12Z','#8aa281');path('M-3 13V4H3V13','#a29063');path('M13 11Q15 4 18 0M15 6Q8-1 10-4Q18-4 15 6',leaf,'none');}
  else if(name==='beach'){shape('circle',{cx:8,cy:-9,r:4,fill:sun});path('M-15 4Q-5-1 2 4T15 4','none',water,2.5);path('M-15 10Q0 6 15 10','none','#c3a575',3);}
  else if(name==='waves'){for(const y of [-8,1,10])path(`M-15 ${y}Q-7 ${y-5} 0 ${y}T15 ${y}`,'none',water,2.5);}
  else if(name==='pier'){path('M-14-4H14V2H-14Z','#c7b189');path('M-10 2V13M10 2V13','none','#8c8161',2.5);path('M-16 12Q-7 8 0 12T16 12','none',water,1.5);}
  else if(name==='conifer'){path('M-10 12V-11M9 12V-15');path('M-19 5L-10-10L-1 5Z',leaf);path('M-3 3L9-14L20 3Z','#7c9f7c');}
  else if(name==='stream'){path('M-15-6L-5-14L3-6L12-11L16-5','#c2d4b0');path('M-3-3Q-10 2 0 6T2 14','none',water,3);}
  else if(name==='valley'){path('M-18 4L-8-12L1 4L10-15L19 4Z','#94b3a5');path('M-8-12L-4-5L-9-7L-13-4Z',snow,'none');path('M-17 12Q0 4 17 12','#cedba9');}
  else if(name==='bamboo'){for(const x of [-8,3,11]){path(`M${x} 13V-13`,'none','#729467',2.5);path(`M${x-2} 0h4M${x-2}-7h4`,'none','#a9c384',1);}path('M-8-4Q-19-15-18-5Q-17 0-8-4M3-7Q16-18 14-8Q10-3 3-7',leaf,'none');}
  else if(name==='steps'){path('M-15 13H15V7H8V1H1V-5H-6V-11H-13','none','#9c957b',3);path('M-16 16H16','none',leaf,1.8);}
  else if(name==='spring'){path('M-15-7L-8-12L-1-5L9-11L15-3Z','#b2b9a0');path('M0-3V5Q-8 9 0 12T14 12','none',water,2.5);path('M-15 10Q-11 6-8 10','none',leaf,2);}
  else if(name==='snowpeak'){path('M-15 12L-5-8L6 12Z','#a8c5b8');path('M-5-8L-1 0L-5-2L-9 0Z',snow,'none');path('M-4 12L6-12L16 12Z','#86aaa3');path('M6-12L10-2L6-5L2-2Z',snow,'none');}
  else{path('M-15 13L-1-5L13 13Z','#afc8b7');path('M-1-5L4 2L-1 0L-6 2Z',snow,'none');path('M-1-5V-15');path('M0-15H11L8-11L11-7H0Z',sun);}
  return g;
 }
 return {ICONS,draw};
}));
