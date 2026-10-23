import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const sourceUrl = new URL('../../src/wugong-walk/visits.ts', import.meta.url);
const source = ts.createSourceFile(fileURLToPath(sourceUrl), await readFile(sourceUrl, 'utf8'), ts.ScriptTarget.Latest, true);
const values = new Map();
let stops;
for (const statement of source.statements) {
  if (!ts.isVariableStatement(statement)) continue;
  for (const declaration of statement.declarationList.declarations) {
    if (!ts.isIdentifier(declaration.name) || !declaration.initializer) continue;
    if (ts.isStringLiteralLike(declaration.initializer)) values.set(declaration.name.text, declaration.initializer.text);
    if (declaration.name.text === 'visits' && ts.isObjectLiteralExpression(declaration.initializer)) stops = declaration.initializer;
  }
}
if (!stops) throw new Error('Cannot read the Wugong visit photo registry');
const rows = stops.properties.flatMap(stop => {
  if (!ts.isPropertyAssignment(stop) || !ts.isObjectLiteralExpression(stop.initializer)) return [];
  const fields = {};
  for (const field of stop.initializer.properties) {
    if (!ts.isPropertyAssignment(field)) continue;
    const name = field.name.getText(source).replace(/^['"]|['"]$/g, '');
    const value = field.initializer;
    if (ts.isStringLiteralLike(value)) fields[name] = value.text;
    else if (ts.isIdentifier(value) && values.has(value.text)) fields[name] = values.get(value.text);
  }
  return [{ id: stop.name.getText(source), title: fields.title, file: fields.file, caption: fields.caption, source: fields.source, license: fields.license }];
});
const files = [...new Set(rows.map(row => row.file))];
process.stdout.write(`${JSON.stringify({
  stops: rows.length,
  uniquePhotos: files.length,
  photos: files.map(file => ({ file, usedBy: rows.filter(row => row.file === file).map(row => row.id) })),
  regionalOrNonExact: rows.filter(row => /区域|未标注村名|非.*(?:照片|定点|现场|站位|村口)/.test(row.caption)).map(row => row.id),
  rows,
}, null, 2)}\n`);
