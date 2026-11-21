import fs from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { createHash } from 'node:crypto';

const execFileAsync = promisify(execFile);
const root = process.cwd();
const directory = path.join(root, 'haunted-location-directory');
const photos = path.join(directory, 'case-file-photos');
const agent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36';

function isImage(buffer) {
  return (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff)
    || (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47)
    || (buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP')
    || buffer.toString('ascii', 0, 3) === 'GIF';
}

function loadMaps() {
  const context = { window: {} };
  vm.createContext(context);
  for (const file of ['case-file-sources.js', 'state-directory-addition-sources.js', 'legacy-case-file-sources.js', 'legacy-directory-addition-sources.js']) {
    vm.runInContext(readFileSync(path.join(directory, file), 'utf8'), context);
  }
  return [context.window.TPI_CASE_FILE_SOURCES || {}, context.window.TPI_LEGACY_CASE_FILE_SOURCES || {}];
}

function commonsTitle(source) {
  const match = source.match(/\/wiki\/File:([^?#]+)/i);
  return match ? decodeURIComponent(match[1]).replace(/_/g, ' ') : null;
}

async function curl(url) {
  try {
    const { stdout } = await execFileAsync('curl', ['-sS', '-L', '--connect-timeout', '5', '--max-time', '10', '--retry', '1', '--retry-delay', '2', '--retry-all-errors', '-A', agent, url], { encoding: 'buffer', maxBuffer: 20 * 1024 * 1024 });
    return Buffer.isBuffer(stdout) ? stdout : Buffer.from(stdout);
  } catch {
    return Buffer.alloc(0);
  }
}

function resolveCommons(title) {
  const normalized = title.replace(/ /g, '_');
  const digest = createHash('md5').update(normalized).digest('hex');
  return [
    `https://upload.wikimedia.org/wikipedia/commons/${digest[0]}/${digest.slice(0, 2)}/${encodeURIComponent(normalized)}`,
    `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(title)}?width=1600`
  ];
}

async function main() {
  const [newSources, legacySources] = loadMaps();
  const targets = [];
  for (const [kind, map] of [['new', newSources], ['legacy', legacySources]]) {
    for (const [key, source] of Object.entries(map)) {
      for (const field of ['image', 'caseFileImage']) {
        const asset = source[field];
        if (!asset?.startsWith('case-file-photos/')) continue;
        const file = path.join(directory, asset);
        let buffer;
        try { buffer = await fs.readFile(file); } catch { continue; }
        if (!isImage(buffer)) targets.push({ kind, key, field, source, asset });
      }
    }
  }
  if (!targets.length) {
    console.log('No invalid local haunted-location image assets found.');
    return;
  }

  const repaired = [];
  const skipped = [];
  for (const target of targets) {
    const title = commonsTitle(target.source.source);
    if (!title) throw new Error(`Cannot resolve a Commons file title for ${target.kind}:${target.key}`);
    const directUrls = resolveCommons(title);
    let buffer = null;
    for (const direct of directUrls) {
      const candidate = await curl(direct);
      if (isImage(candidate)) {
        buffer = candidate;
        break;
      }
    }
    if (!buffer) {
      skipped.push({ key: target.key, field: target.field, title });
      continue;
    }
    let asset = target.asset;
    if (asset.endsWith('.tif') || asset.endsWith('.tiff')) asset = asset.replace(/\.tiff?$/i, '.jpg');
    await fs.writeFile(path.join(directory, asset), buffer);
    repaired.push({ key: target.key, field: target.field, from: target.asset, to: asset });
    await new Promise(resolve => setTimeout(resolve, 750));
  }

  console.log(JSON.stringify({ repaired, skipped }, null, 2));
}

main().catch(error => { console.error(error); process.exit(1); });
