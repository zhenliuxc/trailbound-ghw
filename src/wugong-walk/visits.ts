import { type VisitId } from './model';
export type PhotoVisitId = VisitId | 'start';

interface VisitInfo {
  readonly title: string; readonly subtitle: string; readonly paragraphs: readonly string[];
  readonly file: string; readonly alt: string; readonly caption: string;
  readonly author: string; readonly source: string; readonly license: string; readonly licenseUrl: string;
  readonly introduction: string;
  readonly reference?: { readonly label: string; readonly url: string };
}
const meadowSource = 'https://commons.wikimedia.org/wiki/File:Wugong_Mountains,_17_June_2018,_Picture12.jpg';
const scenicSource = 'https://www.wugongshan.cn/act/jqgk/spots.html';
export const chapters: Partial<Record<VisitId | 'start', { id: string; label: string; place: string }>> = {
  meadow: { id: 'meadow-bird', label: '借一阵草甸的风', place: '武功山 · 山脊草甸' },
  camp: { id: 'wugong-wind-hiker', label: '在草甸的风里，遇见她', place: '武功山 · 观音宕草甸' },
  horse: { id: 'meadow-butterfly', label: '拨开云，看看山', place: '武功山 · 吊马桩' },
  summit: { id: 'meadow-flower', label: '金顶石语', place: '武功山 · 金顶古祭坛' },
};
export const visits: Record<PhotoVisitId, VisitInfo> = {
  start: {
    title: '东江村 · 反穿起点', subtitle: '第一天，从山下的村子出发',
    paragraphs: ['这一程从东江村进入武功山，沿林间山路爬升，经过绝望坡和高山草甸，到观音宕／星空营地过夜。', '第二天继续越过吊马桩、登上金顶，再沿景区山路步行下降，在景区大门结束。先整理好背包，出发吧。'],
    file: 'photos/wugong-village-v3.jpg', alt: '武功山山脚村落、稻田与晨光实拍', caption: '《Wugongshan, China》· 山脚村落与稻田。作者未标注村名，非已确认的东江村村口。',
    author: 'cattan2011', source: 'https://www.flickr.com/photos/68166820@N08/50770556203', license: 'CC BY 2.0', licenseUrl: 'https://creativecommons.org/licenses/by/2.0/', introduction: scenicSource,
    reference: { label: '东江村出发实拍 · 徒步者游记', url: 'https://www.8264.com/youji/5719213.html' },
  },
  slope: {
    title: '绝望坡', subtitle: '停在山脊，回望来路',
    paragraphs: ['反穿线路经过绝望坡，再向观音宕前进。陡坡和连续起伏的山脊，让这一段的高差格外鲜明。', '这一站先停下，看看真实武功山的山形。继续走，林缘会逐渐退去，草甸和远山展开。'],
    file: 'photos/wugong-ascent-v2.jpg', alt: '武功山草坡上沿山脊爬升的真实山路', caption: '武功山陡坡与山路实景。区域照片，非绝望坡定点照片。',
    author: 'Huangdan2060', source: 'https://commons.wikimedia.org/wiki/File:Wugong_Mountains,_17_June_2018,_Picture15.jpg', license: 'CC0', licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
    introduction: 'https://www.wugongshan.cn/page/strategyList%21info.htm?id=231',
    reference: { label: '绝望坡实拍 · 徒步者游记', url: 'https://www.8264.com/youji/5729385.html' },
  },
  meadow: {
    title: '高山草甸', subtitle: '顺着山肩，转过草甸',
    paragraphs: ['高山草甸是武功山最鲜明的景观之一，分布在金顶、观音宕、发云界等山地。开阔的草坡沿山脊起伏，近处的山路与远处的峰线相接。', '夏季的绿色草甸与林带相邻。沿着弯道慢慢走，留意草叶的方向和山坡上的光影。'],
    file: 'photos/wugong-meadow.webp', alt: '武功山绿色草甸、山路与远处山脊', caption: '武功山草甸实景，摄于 2018 年 6 月。区域照片，非此弯道定点照片。',
    author: 'Huangdan2060', source: meadowSource, license: 'CC0', licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/', introduction: scenicSource,
  },
  camp: {
    title: '观音宕 · 星空营地', subtitle: '第一天，在草甸间歇脚',
    paragraphs: ['观音宕的营地位于高山草甸之间，是这次两天一夜反穿的过夜点。山风、草坡和开阔的视野，是停留在这里的理由。', '天气合适时，武功山能看到云海、日出与星空。先放下背包坐一会儿；第二天的方向是吊马桩、金顶，再从景区下山。'],
    file: 'photos/wugong-grass-saddle-v3.jpg', alt: '武功山夏季草甸与岩壁相接的山坳实拍', caption: '武功山夏季草甸区域实景，摄于 2018 年 6 月。非已确认的观音宕营地定点照片。',
    author: 'Huangdan2060', source: 'https://commons.wikimedia.org/wiki/File:Wugong_Mountains,_17_June_2018,_Picture10.jpg', license: 'CC0', licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
    introduction: 'https://wugongshan.cn/page/strategyList%21info.htm?id=1274',
    reference: { label: '观音宕营地实拍 · 景区图文', url: 'https://www.wugongshan.cn/page/strategyList%21info.htm?id=251' },
  },
  horse: {
    title: '吊马桩', subtitle: '越过鞍部，再往高处走',
    paragraphs: ['沿本段反穿方向，从观音宕继续前行，经过吊马桩，再走向金顶。脚下的草甸山路绕过山肩，沟谷在近处展开。', '山脊路并非一直向上，途中需要下降到鞍部，再爬上下一座山肩。停在这里回望，能看到刚才越过的起伏。'],
    file: 'photos/wugong-ridgetrail-v2.jpg', alt: '真实武功山的草甸弯道与起伏山路', caption: '武功山草甸山路实景。区域照片，非吊马桩定点照片。',
    author: 'Huangdan2060', source: 'https://commons.wikimedia.org/wiki/File:Wugong_Mountains,_17_June_2018,_Picture16.jpg', license: 'CC0', licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/', introduction: scenicSource,
    reference: { label: '吊马桩实景 · 景区介绍', url: 'https://wugongshan.cn/w/jqtj/jqtjInfo.htm?id=36' },
  },
  summit: {
    title: '金顶', subtitle: '登上山顶，回望来路',
    paragraphs: ['走完这段起伏的山脊，终于来到金顶。刚刚经过的山肩、鞍部和营地，连成了身后的一条来路。', '在山顶停一会儿，看看远景。接下来沿景区山路下降，走到景区大门，这一趟反穿才完整结束。'],
    file: 'photos/wugong-goldendome-v2.jpg', alt: '武功山金顶眺望连绵草甸、蜿蜒山路与层层远山的风景实拍', caption: '《Golden Dome of Wugong Mountain》· 金顶远眺草甸山脊，摄于 2024 年 10 月。实拍季节与游戏内夏季示意不同。',
    author: 'RoundNoName', source: 'https://commons.wikimedia.org/wiki/File:Golden_Dome_of_Wugong_Mountain.jpg', license: 'CC BY 4.0', licenseUrl: 'https://creativecommons.org/licenses/by/4.0/', introduction: scenicSource,
    reference: { label: '金顶古祭坛实拍 · 汪仙坛', url: 'https://commons.wikimedia.org/wiki/File:Wugongshan_jisi_yizhi_8384.jpg' },
  },
  end: {
    title: '景区大门', subtitle: '下到山脚，这一程走完了',
    paragraphs: ['从东江村出发，越过林缘和草甸，在观音宕停留，再经吊马桩登上金顶。最后沿景区山路下山，在这里结束两天一夜的反穿。', '回望来路，有爬升，也有下降。山路上的每一个停顿，都属于这一程。'],
    file: 'photos/wugong-valley-v3.jpg', alt: '武功山山脚溪流、汀步与林木实拍', caption: '《Wugongshan valley, Jiangxi, China》· 山脚溪水实景，摄于 2017 年 9 月。旅程回望配图，非景区大门照片。',
    author: 'cattan2011', source: 'https://www.flickr.com/photos/68166820@N08/50833400457', license: 'CC BY 2.0', licenseUrl: 'https://creativecommons.org/licenses/by/2.0/', introduction: scenicSource,
    reference: { label: '景区大门实拍 · 景区图文', url: 'https://www.wugongshan.cn/page/strategyList%21info.htm?id=528' },
  },
};

function node(id: string): HTMLElement {
  const found = document.getElementById(id);
  if (!found) throw new Error(`景点卡片缺少元素：${id}`);
  return found;
}
function link(id: string): HTMLAnchorElement {
  const found = node(id);
  if (!(found instanceof HTMLAnchorElement)) throw new Error(`景点来源链接类型不正确：${id}`);
  return found;
}

export class VisitView {
  private readonly dialog: HTMLDialogElement;
  private readonly media = node('ww-visit-media');
  private readonly status = node('ww-photo-status');
  private readonly retry = node('ww-photo-retry');
  private readonly proceed = node('ww-visit-proceed');
  private readonly photos = new Map<PhotoVisitId, HTMLImageElement>();
  private active: PhotoVisitId | null = null;
  constructor(private readonly onClose: (continueWalk: boolean) => void, signal: AbortSignal) {
    const dialog = node('ww-visit');
    if (!(dialog instanceof HTMLDialogElement)) throw new Error('景点卡片类型不正确');
    this.dialog = dialog;
    node('ww-visit-close').addEventListener('click', () => this.finish(false), { signal });
    this.proceed.addEventListener('click', () => this.finish(true), { signal });
    dialog.addEventListener('cancel', event => { event.preventDefault(); this.finish(false); }, { signal });
    this.retry.addEventListener('click', () => {
      if (!this.active) return;
      const photo = this.photos.get(this.active);
      if (photo) { photo.hidden = true; this.retry.hidden = true; this.status.hidden = false; this.status.textContent = '实景照片正在展开…'; photo.src = `${visits[this.active].file}?retry=${Date.now()}`; }
    }, { signal });
    for (const id of ['start', 'slope', 'meadow', 'camp', 'horse', 'summit', 'end'] satisfies PhotoVisitId[]) {
      const photo = new Image(); photo.alt = visits[id].alt; photo.decoding = 'async';
      photo.addEventListener('load', () => { if (this.active === id) this.photoState(photo); }, { signal });
      photo.addEventListener('error', () => { if (this.active === id) this.photoState(photo); }, { signal });
      photo.src = visits[id].file; this.photos.set(id, photo);
    }
  }
  sync(id: PhotoVisitId | null): void {
    if (this.active === id) return;
    this.active = id;
    if (!id) { this.dialog.close(); return; }
    const info = visits[id], photo = this.photos.get(id);
    node('ww-visit-title').textContent = info.title;
    node('ww-photo-caption').textContent = id === 'summit' ? '金顶远眺 · 秋季实拍' : id === 'start' || id === 'end' ? '武功山山脚实景 · 区域配图' : '武功山区域实景';
    const source = link('ww-photo-source'); source.href = info.source; source.textContent = info.author;
    const license = link('ww-photo-license'); license.href = info.licenseUrl; license.textContent = info.license;
    this.media.replaceChildren(); if (photo) { this.media.append(photo); this.photoState(photo); }
    this.proceed.textContent = id === 'camp' ? '回到营地' : id === 'summit' ? '准备下山' : id === 'end' ? '走完了' : '继续走 →';
    if (!this.dialog.open) this.dialog.showModal();
  }
  private photoState(photo: HTMLImageElement): void {
    const loaded = photo.complete && photo.naturalWidth > 0, failed = photo.complete && !photo.naturalWidth;
    photo.hidden = !loaded; this.status.hidden = loaded; this.retry.hidden = !failed;
    this.status.textContent = failed ? '照片未能加载，可以重试或继续走。' : '实景照片正在展开…';
  }
  private finish(continueWalk: boolean): void {
    if (!this.active) return;
    this.sync(null); this.onClose(continueWalk);
  }
  destroy(): void { this.active = null; if (this.dialog.open) this.dialog.close(); this.photos.clear(); }
}
