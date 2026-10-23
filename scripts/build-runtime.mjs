import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import { copyFile, mkdir, readFile, unlink, writeFile } from 'node:fs/promises';
import ts from 'typescript';
import { build } from 'esbuild';
import { loadSiteContent } from './build-content.mjs';
import { copySiteSources } from './build-static.mjs';
import { buildRouteArt } from './build-wugong-art.mjs';
import { buildHomePage } from './build-pages.mjs';
import { buildDayPages } from './build-day-pages.mjs';
import { buildLandmarkLibrary } from './build-landmark-library.mjs';

const rootUrl = new URL('../', import.meta.url), root = fileURLToPath(rootUrl);
const args = process.argv.slice(2);
if (args.length > 1 || args.some(arg => !arg.startsWith('--outdir='))) throw new Error('Usage: npm run build -- [--outdir=.build/site]');
const outputPath = path.resolve(root, args[0]?.slice('--outdir='.length) || 'dist');
const relativeOutput = path.relative(root, outputPath);
const outputParts = relativeOutput.split(path.sep);
if (relativeOutput !== 'dist' && !(outputParts[0] === '.build' && outputParts.length > 1 && outputParts[1] !== 'typescript')) {
  throw new Error('Build output must be dist or a separate directory under .build/ (excluding typescript/)');
}
const output = pathToFileURL(`${outputPath}${path.sep}`);
const configPath = path.join(root, 'tsconfig.json');
const configFile = ts.readConfigFile(configPath, ts.sys.readFile);
const config = ts.parseJsonConfigFileContent(configFile.config, ts.sys, root);
const program = ts.createProgram(config.fileNames, config.options);
const emit = program.emit();
const diagnostics = [...(configFile.error ? [configFile.error] : []), ...config.errors, ...ts.getPreEmitDiagnostics(program), ...emit.diagnostics];
if (diagnostics.length || emit.emitSkipped) {
  process.stderr.write(ts.formatDiagnosticsWithColorAndContext(diagnostics, {
    getCanonicalFileName: file => file, getCurrentDirectory: () => root, getNewLine: () => '\n',
  }));
  process.exitCode = 1;
} else {
  const { CHAPTERS, DAY_ROUTES } = await loadSiteContent(rootUrl);
  const plans = [
    { entry: 'src/runtime/index.ts', file: 'runtime.js', globalName: 'TrailRuntime', footer: { js: "if (typeof module === 'object' && module.exports) module.exports = TrailRuntime;" } },
    { entry: 'src/runtime/hint-art.ts', file: 'hint-art.js', globalName: 'TrailHintArt', footer: { js: "if (typeof module === 'object' && module.exports) module.exports = TrailHintArt;" } },
    { entry: 'src/journey/art-page.ts', file: 'wugong-art.js' },
    { entry: 'src/app.js', file: 'app.js', bundle: false },
  ];
  // Three day routes share one host and one output. Other routes keep their hosts.
  const mapEntries = new Set();
  for (const chapter of CHAPTERS) {
    if (mapEntries.has(chapter.mapEntry)) continue;
    mapEntries.add(chapter.mapEntry);
    plans.push({ entry: chapter.mapEntry, file: chapter.mapEntry === 'src/day-walk/main.ts' ? 'day-walk.js' : chapter.mapPage.replace(/\.html$/, '.js'), minify: true });
  }
  const copies = [
    ['node_modules/matter-js/LICENSE', 'vendor/matter-js-LICENSE.txt'],
  ];
  const generated = [
    ...plans.map(plan => plan.file), ...copies.map(([, file]) => file),
    'index.html', 'route-moments.js', 'tiger-credits.html', 'landmark-library.html', 'landmark-markers.css', 'icons/landmarks/', 'build-manifest.json',
    ...CHAPTERS.map(chapter => chapter.artPage),
    ...Object.values(DAY_ROUTES).flatMap(route => [`${route.id}-walk.html`, `${route.id}-credits.html`]),
  ];
  if (new Set(generated).size !== generated.length) throw new Error('Two build steps own the same output');
  const copied = await copySiteSources(rootUrl, { output, generated });
  for (const plan of plans) {
    const { entry, file, ...options } = plan;
    const input = entry.endsWith('.ts') ? entry.replace(/^src\//, '.build/typescript/').replace(/\.ts$/, '.js') : entry;
    await build({
      absWorkingDir: root, entryPoints: [input], outfile: fileURLToPath(new URL(file, output)),
      bundle: true, format: 'iife', target: 'es2022', charset: 'utf8',
      banner: { js: `// Generated from ${entry}. Edit src/, then run npm run build.` }, ...options,
    });
  }
  await buildHomePage(rootUrl, output);
  for (const chapter of CHAPTERS) await buildRouteArt(rootUrl, { route: chapter.id, output });
  await buildDayPages(rootUrl, output);
  const landmarks = await buildLandmarkLibrary(rootUrl, output);
  const artBundle = new URL('wugong-art.js', output);
  await writeFile(artBundle, (await readFile(artBundle, 'utf8')).replace(/[ \t]+$/gm, ''));
  for (const [source, file] of copies) {
    const destination = new URL(file, output);
    await mkdir(path.dirname(fileURLToPath(destination)), { recursive: true });
    await copyFile(new URL(source, rootUrl), destination);
  }
  const files = [...new Set([...copied, ...generated.filter(file => !file.endsWith('/')), ...landmarks])].sort();
  let previousFiles = [];
  try { previousFiles = JSON.parse(await readFile(new URL('build-manifest.json', output), 'utf8')).files; }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  if (!Array.isArray(previousFiles)) throw new Error('Invalid output manifest: files must be an array');
  const previousOutputs = previousFiles.map(file => {
    if (typeof file !== 'string') throw new Error('Invalid output manifest: file must be a string');
    const destination = path.resolve(outputPath, file), relative = path.relative(outputPath, destination);
    if (!relative || relative.startsWith('..') || path.isAbsolute(relative) || relative.split(path.sep).join('/') !== file) {
      throw new Error(`Invalid output manifest path: ${file}`);
    }
    return { file, destination };
  });
  const currentFiles = new Set(files);
  for (const { file, destination } of previousOutputs) {
    if (currentFiles.has(file)) continue;
    // Only remove retired files previously owned by this build; preserve unknown files.
    await unlink(destination).catch(error => { if (error.code !== 'ENOENT') throw error; });
  }
  await writeFile(new URL('build-manifest.json', output), `${JSON.stringify({ version: 1, sources: ['src/', 'public/'], files }, null, 2)}\n`);
  process.stdout.write(`Built ${relativeOutput} from src/ and public/. Gameplay/browser/audio tests were not run.\n`);
}
