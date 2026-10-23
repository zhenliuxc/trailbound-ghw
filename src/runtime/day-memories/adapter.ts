import type { MiniApi, MiniState, MiniViewRefs, SoundPlayer } from '../contracts';
import type { GameDom } from '../dom';
import { DAY_MEMORIES, DayMemoryState, dayMemoryId } from './model';
import { DayMemoryView } from './scene';
import { isWestlakeSceneId, WESTLAKE_SCENES } from '../../content/westlake-scenes';

function state(value: MiniState): DayMemoryState { if (!(value instanceof DayMemoryState)) throw new Error('山野互动状态无法读取'); return value; }
function view(value: MiniViewRefs): DayMemoryView { if (!(value instanceof DayMemoryView)) throw new Error('山野画作无法读取'); return value; }
export function createDayMemories(dom: GameDom, audio: SoundPlayer): MiniApi {
  let sounded=0;
  return {
    input:'direct',
    create(entry, options) { sounded=0; return new DayMemoryState(entry,options.reduced); },
    act:(s,p)=>state(s).input(p), move:(s,p)=>state(s).input(p,true), release:s=>state(s).release(),
    point:(v,p)=>view(v).input(p),
    hover:(s,p)=>state(s).scene.kind==='rain'&&s.acted?state(s).input(p,true).release():s,
    tick:(s,dt)=>state(s).tick(dt), key:(s,key,phase)=>state(s).key(key,phase),
    draw:(_svg,_parent,entry)=>new DayMemoryView(entry.route,entry.id), paint:(v,s)=>view(v).paint(state(s)),
    mount:(v,context)=>view(v).mount(context.host,context.cache), dispose:v=>view(v).dispose(),
    assets:entry=>({scene:isWestlakeSceneId(entry.id)?WESTLAKE_SCENES[entry.id].background:`scenes/day-route-v2/${entry.route}.webp`}),
    instruction:entry=>dayMemoryId(entry.id)?DAY_MEMORIES[entry.id].prompt:'',
    status:s=>state(s).feedback,
    outcome(s,entry) { const current=state(s); return {id:s.id,edition:entry.edition,earned:s.play.complete,interaction:s.gesture,memory:DAY_MEMORIES[current.id].memory,title:entry.tag}; },
    present(s,v) {
      const current=state(s),painting=view(v);
      dom.text('micro-title',DAY_MEMORIES[current.id].title);
      dom.text('micro-result',painting.contentState==='loading'?'山野画作正在展开…':painting.contentState==='error'?'画作暂未展开，点「重新试一次」。':current.feedback);
      dom.get('micro-panel').setAttribute('data-day-memory','true');
      dom.get('micro-surface').setAttribute('aria-label',`${DAY_MEMORIES[current.id].prompt} 可用方向键移动，空格或 Enter 操作。`);
      if(current.sounds>sounded){sounded=current.sounds;audio.interact?.(current.scene.kind==='rain'||current.scene.kind==='leaf'||current.scene.kind==='stones'?'ripple':'leaf',{x:s.x,icon:'',playType:current.scene.kind});}
    },
  };
}
