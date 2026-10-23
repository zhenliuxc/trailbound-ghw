import { readFile, writeFile } from 'node:fs/promises';
import { loadSiteContent } from './build-content.mjs';

export async function buildHomePage(root, output = new URL('dist/', root)) {
  const names = ['mini-panel', 'journal-wall', 'memory-overlays'];
  const [home, ...partials] = await Promise.all(['home', ...names].map(name => readFile(new URL(`src/templates/${name}.html`, root), 'utf8')));
  const content = new Map(names.map((name, index) => [name, partials[index]]));
  const { CHAPTERS, MOMENT_CATALOG_VERSION } = await loadSiteContent(root);
  content.set('chapter-previews', CHAPTERS.map(chapter => `<a id="${chapter.id}-walk-preview" class="wugong-walk-preview" href="${chapter.mapPage}?walk=1" hidden>走进山径 ↗</a>`).join(''));
  const page = home.replace(/src="route-moments\.js(?:\?[^\"]*)?"/, `src="route-moments.js?v=${MOMENT_CATALOG_VERSION}"`).replace(/\{\{([a-z-]+)\}\}/g, (_, name) => {
    if (!content.has(name)) throw new Error(`Unknown home template: ${name}`);
    return content.get(name);
  });
  await writeFile(new URL('index.html', output), page);
}
