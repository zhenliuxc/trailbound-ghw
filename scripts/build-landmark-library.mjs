import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { build } from 'esbuild';

export async function buildLandmarkLibrary(root, output = new URL('dist/', root)) {
  const bundle = await build({ entryPoints: [new URL('src/journey/landmark-symbol.ts', root).pathname], bundle: true, platform: 'node', format: 'esm', write: false });
  const { LANDMARK_NAMES, LANDMARK_SIZE, landmarkSymbol } = await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString('base64')}`);
  const directory = new URL('icons/landmarks/', output);
  await mkdir(directory, { recursive: true });
  await Promise.all(Object.keys(LANDMARK_NAMES).map(id => writeFile(new URL(`${id}.svg`, directory), landmarkSymbol(id))));
  const variables = Object.entries(LANDMARK_SIZE).map(([key, value]) => `--landmark-${key.replace(/[A-Z]/g, letter => '-' + letter.toLowerCase())}:${value}px`).join(';');
  const css = await readFile(new URL('src/journey/landmark-markers.css', root), 'utf8');
  await writeFile(new URL('landmark-markers.css', output), `/* Generated from src/journey/landmark-{symbol.ts,markers.css}. */\n:root{${variables}}\n${css}`);
  const template = await readFile(new URL('src/templates/landmark-library.html', root), 'utf8');
  const cards = Object.entries(LANDMARK_NAMES).map(([id, name]) => `<a class="symbol-card" href="icons/landmarks/${id}.svg" download="${id}.svg" aria-label="下载${name}图标"><span class="icon-slot">${landmarkSymbol(id)}</span><span>${name}</span><code>${id}</code></a>`).join('\n');
  await writeFile(new URL('landmark-library.html', output), template.replace('{{icons}}', cards).replace('{{count}}', String(Object.keys(LANDMARK_NAMES).length)));
  return ['landmark-markers.css', 'landmark-library.html', ...Object.keys(LANDMARK_NAMES).map(id => `icons/landmarks/${id}.svg`)];
}
