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
  ['member-shell.css', '64'],
  ['member-shell.js', '61'],
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
  ['stylesheet.href', 'member-shell.css', '64'],
  ['script.src', 'member-shell.js', '61'],
]) {
  const match = includes.match(new RegExp(`${assignment} = "/${asset.replaceAll('.', '\\.')}(?:\\?v=([0-9]+))?"`));
  if (!match || match[1] !== version) failures.push(`includes.js: injected ${asset} has ${match?.[1] ?? 'no version'}; expected ${version}`);
}

for (const [file, assets] of Object.entries({
  'member-home.html': ['style.css?v=95', 'profile-style.css?v=8'],
  'member-profile.html': ['style.css?v=95', 'profile-style.css?v=8'],
  'member-dashboard.html': ['style.css?v=95', 'profile-style.css?v=8', 'workspace-shell.css?v=4'],
  'member-login.html': ['style.css?v=95'],
  'admin-panel.html': ['workspace-shell.css?v=3'],
})) {
  const source = readFileSync(resolve(root, file), 'utf8');
  for (const asset of assets) if (!source.includes(asset)) failures.push(`${file}: expected current route asset ${asset}`);
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log(`PASS: ${files.length} in-scope HTML pages use current shared asset versions.`);
