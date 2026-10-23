import { mountAotaiChapter } from './host';

const chapter = mountAotaiChapter();
document.addEventListener('visibilitychange', () => document.hidden ? chapter.background() : chapter.foreground());
window.addEventListener('pagehide', event => event.persisted ? chapter.background() : chapter.dispose());
window.addEventListener('pageshow', event => { if (event.persisted) chapter.foreground(); });
