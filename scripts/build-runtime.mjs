import { fileURLToPath } from 'node:url';
import path from 'node:path';
import ts from 'typescript';
import { build } from 'esbuild';

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
    entryPoints: ['src/app.js'],
    outfile: 'dist/app.js',
    bundle: false,
    target: 'es2022',
    charset: 'utf8',
    banner: { js: '// Generated from src/app.js by npm run build. Edit src/, not this file.' },
  });
  process.stdout.write('Built TypeScript runtime and browser entry point. Gameplay/browser/audio tests were not run.\n');
}
