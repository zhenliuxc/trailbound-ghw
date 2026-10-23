import type { MiniApi, MiniState, MiniViewRefs, SoundPlayer } from '../contracts';
import type { GameDom } from '../dom';
import { CHANGPING_MEMORIES, ChangpingMemoryState, changpingMemoryId } from './model';
import { backgroundFor, ChangpingMemoryView } from './scene';

function state(value: MiniState): ChangpingMemoryState { if (!(value instanceof ChangpingMemoryState)) throw new Error('无法读取彩林互动'); return value; }
function view(value: MiniViewRefs): ChangpingMemoryView { if (!(value instanceof ChangpingMemoryView)) throw new Error('无法读取彩林画作'); return value; }
export function createChangpingMemories(dom: GameDom, audio: SoundPlayer): MiniApi {
  let sounded = 0;
  let painting: ChangpingMemoryView | null = null;
  return {
    input: 'direct', soundTheme: 'creek',
    create(entry, options) { sounded = 0; return new ChangpingMemoryState(entry, options.reduced); },
    act: (s, p) => state(s).input(p), move: (s, p) => state(s).input(p, true), release: s => state(s).release(false),
    point: (v, p) => view(v).input(p),
    tick: (s, dt) => state(s).tick(dt), key: (s, key, phase) => state(s).key(key, phase),
    draw(_svg, _parent, entry) { if (!changpingMemoryId(entry.id)) throw new Error('无法读取彩林画作'); painting = new ChangpingMemoryView(entry.id); return painting; },
    paint: (v, s) => view(v).paint(state(s)), mount: (v, { host, cache }) => view(v).mount(host, cache),
    dispose(v) { view(v).dispose(); painting = null; delete dom.get('micro-panel').dataset.changpingMemory; delete dom.get('micro-panel').dataset.dayMemory; },
    assets: entry => changpingMemoryId(entry.id) ? { scene: backgroundFor(entry.id) } : {},
    instruction: entry => changpingMemoryId(entry.id) ? CHANGPING_MEMORIES[entry.id].prompt : '',
    status: s => state(s).feedback,
    outcome(s, entry) {
      const current = state(s), spec = CHANGPING_MEMORIES[current.id], captureArt = painting?.capture(current);
      return { id: s.id, edition: entry.edition, earned: s.play.complete, interaction: s.gesture, memory: spec.memory, title: spec.badge, ...(captureArt ? { captureArt, artSource: 'capture' as const } : {}) };
    },
    present(s, v) {
      const current = state(s), spec = CHANGPING_MEMORIES[current.id];
      const panel = dom.get('micro-panel'); panel.dataset.dayMemory = 'true'; panel.dataset.changpingMemory = current.scene.kind;
      panel.dataset.memoryPhase = current.phase;
      dom.text('micro-title', spec.title); dom.text('micro-skip', '继续山径 →');
      dom.text('micro-result', v.contentState === 'loading' ? '彩林画作正在展开…' : v.contentState === 'error' ? '画作暂未展开，可以重试或继续山径。' : current.feedback);
      dom.get('micro-surface').setAttribute('aria-label', `${spec.prompt} 键盘：方向键移动，按住空格操作、松开停下；枝影可按 1、2、3 选择。`);
      if (current.sounds > sounded) {
        sounded = current.sounds;
        audio.interact?.(current.scene.kind === 'branches' ? 'ripple' : 'leaf', { x: s.x, icon: current.scene.kind === 'cords' && current.phase === 'reveal' ? 'bell' : 'leaf', playType: current.scene.kind });
      }
    },
  };
}
