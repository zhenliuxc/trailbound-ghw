import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';

const catalogs = new Map();

/** Build-time content comes from the same typed modules as the browser. */
export function loadSiteContent(root) {
  const key = root.href;
  if (!catalogs.has(key)) catalogs.set(key, (async () => {
    const result = await build({
      stdin: {
        contents: 'export * from "./src/content/catalog"; export * from "./src/content/day-routes"; export * from "./src/content/changping-memories";',
        resolveDir: fileURLToPath(root),
      },
      bundle: true, platform: 'node', format: 'esm', write: false,
    });
    return import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString('base64')}`);
  })());
  return catalogs.get(key);
}
