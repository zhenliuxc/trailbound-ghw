export const CHANGPING_MEMORIES = {
  'changping-branch-reflection': { kind: 'branches', title: '枯枝认影', prompt: '看看纸上的枝桠，点出水里同样的倒影。', badge: '枯林水镜', memory: '十月的枯树滩，我认出了浅水中的两种枝影。风经过，它们又轻轻散开。' },
  'changping-bell-cord': { kind: 'cords', title: '马铃解绳', prompt: '先拉开压在上面的绳头，再解开下面的一圈。', badge: '铃响山谷', memory: '干海子一带歇脚时，我理开布垫上的两圈闲绳。小铃重新响起，远处的马抬起了头。' },
  'changping-valley-path': { kind: 'path', title: '画里有条路', prompt: '上下移动近处的纸片，把两段小径接起来。', badge: '长谷见峰', memory: '到木骡子前，我把手帐里错开的两段小径接好。走出林边，草甸、溪水与雪山一起展开了。' },
  'changping-autumn-print': { kind: 'print', title: '叶脉留秋', prompt: '在纸上来回轻擦，让落叶的叶脉慢慢显出来。', badge: '一叶长坪', memory: '返程经过彩林，我用蜡笔拓下落叶的叶脉。留下的是纸上的秋色，落叶仍回到林间。' },
} as const;
export type ChangpingMemoryId = keyof typeof CHANGPING_MEMORIES;
export const CHANGPING_MEMORY_IDS = Object.keys(CHANGPING_MEMORIES) as ChangpingMemoryId[];
export function changpingMemoryId(id: string): id is ChangpingMemoryId { return Object.hasOwn(CHANGPING_MEMORIES, id); }
