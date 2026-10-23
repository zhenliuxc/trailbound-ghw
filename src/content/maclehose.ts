export type CoastEventId = 'coast-sand' | 'maclehose-sideways-crab' | 'coast-shell' | 'maclehose-woodland-echo' | 'coast-pier';

export const CUES = {
  'coast-sand': {entry:'coast-sand',place:'麦理浩径 · 西湾山山肩',line:'前面的石阶绕进山肩，海风从岩壁外吹来。',motif:'<path d="m3 29 10-15 9 10 8-16 15 25M4 40q8-6 16 0t16 0t12 0"/>'},
  'maclehose-sideways-crab': {entry:'maclehose-sideways-crab',place:'麦理浩径 · 西湾沙滩',line:'一只小螃蟹停在漂木前，细小的脚印拐了个弯。',motif:'<path d="M15 25q10-10 20 0v10H15ZM15 27l-8-8M35 27l8-8M15 32l-9 7M35 32l9 7M20 21l-2-7M30 21l2-7"/>'},
  'coast-shell': {entry:'coast-shell',place:'麦理浩径 · 咸田湾沙滩',line:'浪退下去，留出一小片湿润的沙。',motif:'<path d="M4 17q7-6 14 0t14 0t14 0M8 41q8-12 17-2t14-8M6 28q10-6 20 0t20 0"/>'},
  'maclehose-woodland-echo': {entry:'maclehose-woodland-echo',place:'麦理浩径 · 大浪坳上坡林缘',line:'海浪声远了，枝叶之间传来几声清亮的回应。',motif:'<path d="M5 38q20-6 40 0M16 34q-7-18 7-19q12 0 9 13l-8 8ZM31 19l8 2-7 4M21 35v5M27 34v5M39 12q6 4 2 9"/>'},
  'coast-pier': {entry:'coast-pier',place:'麦理浩径 · 赤径渡头',line:'渡头旁，一只小木船随着缓流轻轻晃着。',motif:'<path d="M5 27h38M12 27v15M34 27v15M7 19h21M9 19v8M26 19v8M5 47q9-5 18 0t18 0"/>'},
} satisfies Record<CoastEventId,{entry:CoastEventId;place:string;line:string;motif:string}>;
