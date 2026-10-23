import { copyFile, mkdir, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SOURCES = ['public/', 'src/legacy/', 'src/styles/', 'src/pages/'];

/** Preserve site-relative URLs; every output has exactly one source owner. */
export async function copySiteSources(root, { output, generated }) {
  const owners = new Map(generated.map(file => [file, 'generated']));
  const written = [];
  async function copyDirectory(source, prefix = '') {
    for (const entry of await readdir(new URL(prefix, source), { withFileTypes: true })) {
      const relative = `${prefix}${entry.name}`;
      if (entry.isDirectory()) await copyDirectory(source, `${relative}/`);
      else if (entry.isFile()) {
        if (source.pathname.endsWith('/src/legacy/') && relative === 'route-moments.js') continue;
        const previous = owners.get(relative) ?? generated.find(file => file.endsWith('/') && relative.startsWith(file));
        if (previous) throw new Error(`Duplicate site output ${relative}: ${previous} and ${source.pathname}`);
        owners.set(relative, source.pathname);
        const destination = new URL(relative, output);
        await mkdir(path.dirname(fileURLToPath(destination)), { recursive: true });
        await copyFile(new URL(relative, source), destination);
        written.push(relative);
      } else throw new Error(`Unsupported source entry: ${new URL(relative, source).pathname}`);
    }
  }
  await mkdir(output, { recursive: true });
  for (const source of SOURCES) await copyDirectory(new URL(source, root));
  return written;
}
