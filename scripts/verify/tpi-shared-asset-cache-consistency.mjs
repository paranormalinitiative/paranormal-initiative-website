import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '../..');
const excluded = new Set([
  'TPI_Evidence_Compendium.html',
  'TPI_Field_Encyclopedia.html',
  'TPI_Forensic_Analysis_Compendium.html',
  'TPI_Investigation_Compendium.html',
  'TPI_Terminology_Reference_Unified.html',
]);
const files = execFileSync('git', ['ls-files', '*.html'], { cwd: root, encoding: 'utf8' })
  .split('\n').filter(Boolean)
  .filter((file) => !excluded.has(file) && !file.startsWith('haunted-location-directory/'));
const expected = new Map([
  ['(?<!profile-)style.css', '92'],
  ['member-shell.css', '63'],
  ['member-shell.js', '59'],
  ['profile-style.css', '6'],
  ['profile-style.js', '2'],
  ['includes.js', '18'],
  ['api-client.js', '18'],
]);
const failures = [];

for (const file of files) {
  const source = readFileSync(resolve(root, file), 'utf8');
  for (const [asset, version] of expected) {
    const pattern = new RegExp(`${asset.replaceAll('.', '\\.')}(?:\\?v=([0-9]+))?`, 'g');
    for (const match of source.matchAll(pattern)) {
      if (match[1] !== version) failures.push(`${file}: ${asset} has ${match[1] ?? 'no version'}; expected ${version}`);
    }
  }
}

const includes = readFileSync(resolve(root, 'includes.js'), 'utf8');
for (const [assignment, asset, version] of [
  ['stylesheet.href', 'member-shell.css', '63'],
  ['script.src', 'member-shell.js', '59'],
]) {
  const match = includes.match(new RegExp(`${assignment} = "/${asset.replaceAll('.', '\\.')}(?:\\?v=([0-9]+))?"`));
  if (!match || match[1] !== version) failures.push(`includes.js: injected ${asset} has ${match?.[1] ?? 'no version'}; expected ${version}`);
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log(`PASS: ${files.length} in-scope HTML pages use current shared asset versions.`);
