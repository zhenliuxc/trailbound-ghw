import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { copyFile, mkdir } from 'node:fs/promises';
import ts from 'typescript';
import { build } from 'esbuild';
import { buildRouteArt } from './build-wugong-art.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const configPath = path.join(root, 'tsconfig.json');
const configFile = ts.readConfigFile(configPath, ts.sys.readFile);
const config = ts.parseJsonConfigFileContent(configFile.config, ts.sys, root);
const program = ts.createProgram(config.fileNames, config.options);
const emit = program.emit();
const diagnostics = [...(configFile.error ? [configFile.error] : []), ...config.errors, ...ts.getPreEmitDiagnostics(program), ...emit.diagnostics];
if (diagnostics.length || emit.emitSkipped) {
  process.stderr.write(ts.formatDiagnosticsWithColorAndContext(diagnostics, {
    getCanonicalFileName: file => file,
    getCurrentDirectory: () => root,
    getNewLine: () => '\n',
  }));
  process.exitCode = 1;
} else {
  // Keep the 3D renderer out of the initial runtime. It is imported on entering
  // the mountain chapter; existing 2D routes do not download Three.js.
  await build({
    absWorkingDir: root,
    entryPoints: ['.build/typescript/runtime/mountain-walk/scene-three.js'],
    outfile: 'dist/mountain-walk-scene-v1.js',
    bundle: true,
    format: 'esm',
    minify: true,
    target: 'es2022',
    charset: 'utf8',
    banner: { js: '// Generated from src/runtime/mountain-walk/*.ts. Includes Three.js (MIT); see vendor/three-LICENSE.txt.' },
  });
  // The authored Blender/Tripo scene stays separate until its actual assets
  // have been produced. Building this module does not activate it in the app.
  await build({
    absWorkingDir: root,
    entryPoints: ['.build/typescript/runtime/mountain-walk/scene-authored.js'],
    outfile: 'dist/mountain-walk-authored-v1.js',
    bundle: true,
    format: 'esm',
    minify: true,
    target: 'es2022',
    charset: 'utf8',
    banner: { js: '// Generated from src/runtime/mountain-walk/scene-authored.ts. Includes Three.js (MIT); see vendor/three-LICENSE.txt.' },
  });
  await mkdir(path.join(root, 'dist/vendor'), { recursive: true });
  await copyFile(path.join(root, 'node_modules/three/LICENSE'), path.join(root, 'dist/vendor/three-LICENSE.txt'));
  await build({
    absWorkingDir: root,
    entryPoints: ['.build/typescript/runtime/index.js'],
    outfile: 'dist/runtime.js',
    bundle: true,
    format: 'iife',
    globalName: 'TrailRuntime',
    target: 'es2022',
    charset: 'utf8',
    banner: { js: '// Generated from src/runtime/*.ts by npm run build. Edit src/, not this file.' },
    footer: { js: "if (typeof module === 'object' && module.exports) module.exports = TrailRuntime;" },
  });
  await build({
    absWorkingDir: root,
    entryPoints: ['.build/typescript/runtime/hint-art.js'],
    outfile: 'dist/hint-art.js',
    bundle: true,
    format: 'iife',
    globalName: 'TrailHintArt',
    target: 'es2022',
    charset: 'utf8',
    banner: { js: '// Generated from src/runtime/hint-art.ts by npm run build.' },
    footer: { js: "if (typeof module === 'object' && module.exports) module.exports = TrailHintArt;" },
  });
  await build({
    absWorkingDir: root,
    entryPoints: ['.build/typescript/wugong-walk/scroll/main.js'],
    outfile: 'dist/wugong-walk.js',
    bundle: true,
    minify: true,
    format: 'iife',
    target: 'es2022',
    charset: 'utf8',
    banner: { js: '// Generated from src/wugong-walk/scroll/*.ts. PixiJS (MIT), see vendor/PIXI-LICENSE.txt. Wugong two-day 2D schematic route.' },
  });
  await build({
    absWorkingDir: root,
    entryPoints: ['.build/typescript/wugong-meadow/main.js'],
    outfile: 'dist/wugong-meadow.js',
    bundle: true,
    minify: true,
    format: 'iife',
    target: 'es2022',
    charset: 'utf8',
    plugins: [{ name: 'wugong-ez-tree-assets', setup(builder) {
      builder.onResolve({ filter: /^@dgreenheck\/ez-tree$/ }, () => ({ path: path.join(root, 'node_modules/@dgreenheck/ez-tree/src/lib/tree.js') }));
      builder.onResolve({ filter: /^\.\/textures$/ }, args => args.importer.includes('@dgreenheck/ez-tree/src/lib/') ? { path: path.join(root, '.build/typescript/wugong-meadow/tree-textures.js') } : undefined);
    } }],
    banner: { js: '// Generated from src/wugong-meadow/*.ts. Complete Wugong 3D route. Three.js + three-stylized (MIT), see research/wugong-meadow-credits.txt.' },
  });
  await mkdir(path.join(root, 'dist/research'), { recursive: true });
  await copyFile(path.join(root, 'src/vendor/three-stylized/LICENSE'), path.join(root, 'dist/vendor/three-stylized-LICENSE.txt'));
  await copyFile(path.join(root, 'src/vendor/three-stylized/UPSTREAM-LICENSE'), path.join(root, 'dist/vendor/stylized-components-LICENSE.txt'));
  await copyFile(path.join(root, 'src/wugong-meadow/CREDITS.txt'), path.join(root, 'dist/research/wugong-meadow-credits.txt'));
  await copyFile(path.join(root, 'node_modules/@dgreenheck/ez-tree/LICENSE'), path.join(root, 'dist/vendor/ez-tree-LICENSE.txt'));
  await buildRouteArt(new URL('../', import.meta.url), { route: 'wugong' });
  await buildRouteArt(new URL('../', import.meta.url), { route: 'tiger' });
  await build({ absWorkingDir: root, entryPoints: ['.build/typescript/tiger-walk/main.js'], outfile: 'dist/tiger-walk.js', bundle: true, minify: true, format: 'iife', target: 'es2022', charset: 'utf8', banner: { js: '// Generated from src/tiger-walk/*.ts. PixiJS (MIT); see vendor/PIXI-LICENSE.txt. High road + same-path Middle Tiger Leaping Gorge branch.' } });
  await build({ absWorkingDir: root, entryPoints: ['.build/typescript/wugong-walk/art-page.js'], outfile: 'dist/wugong-art.js', bundle: true, format: 'iife', target: 'es2022', charset: 'utf8', banner: { js: '// Generated Wugong art bridge. Reuses existing mini-game, reward and journal controllers.' } });
  await build({
    absWorkingDir: root,
    entryPoints: ['src/app.js'],
    outfile: 'dist/app.js',
    bundle: false,
    target: 'es2022',
    charset: 'utf8',
    banner: { js: '// Generated from src/app.js by npm run build. Edit src/, not this file.' },
  });
  process.stdout.write('Built TypeScript runtime and browser entry point. Gameplay/browser/audio tests were not run.\n');
}
