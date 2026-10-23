// Local helper: poll the small source tree instead of allocating native FS watchers.
import { readdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const project = dirname(dirname(fileURLToPath(import.meta.url)));
let child = null;
let pending = false;
let stopping = false;
let debounce;

function snapshot() {
  const files = ['tsconfig.json', 'scripts/build-runtime.mjs', 'scripts/build-wugong-art.mjs', 'scripts/build-pages.mjs', 'scripts/build-day-pages.mjs', 'scripts/build-landmark-library.mjs'];
  function visit(relative) {
    for (const entry of readdirSync(join(project, relative), { withFileTypes: true })) {
      const file = join(relative, entry.name);
      if (entry.isDirectory()) visit(file);
      else if (/\.(?:js|ts|html|css)$/.test(entry.name)) files.push(file);
    }
  }
  visit('src');
  return files.sort().map(file => {
    try {
      const stat = statSync(join(project, file), { bigint: true });
      return `${file}:${stat.mtimeNs}:${stat.size}`;
    } catch (error) {
      if (error.code === 'ENOENT') return `${file}:missing`;
      throw error;
    }
  }).join('\n');
}

function build() {
  if (stopping) return;
  if (child) { pending = true; return; }
  pending = false;
  console.log(`[${new Date().toLocaleTimeString()}] Building Trailbound…`);
  child = spawn(process.execPath, ['scripts/build-runtime.mjs'], { cwd: project, stdio: 'inherit' });
  child.once('error', error => console.error('Build could not start:', error.message));
  child.once('close', code => {
    child = null;
    if (!stopping) {
      console.log(code === 0 ? 'Build ready. Refresh localhost when convenient.' : `Build failed (${code}); watching for the next edit.`);
      if (pending) build();
    }
  });
}

let previous = snapshot();
console.log('Watching src/, tsconfig.json and build scripts; no automatic browser reload.');
build();
const poll = setInterval(() => {
  try {
    const current = snapshot();
    if (current !== previous) {
      previous = current;
      clearTimeout(debounce);
      debounce = setTimeout(build, 350);
    }
  } catch (error) {
    if (error.code !== 'ENOENT') console.error('Source scan:', error.message);
  }
}, 750);

for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, () => {
  stopping = true;
  clearInterval(poll);
  clearTimeout(debounce);
  child?.kill('SIGTERM');
  process.exitCode = signal === 'SIGINT' ? 130 : 143;
});
