import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root = process.cwd();
const directory = path.join(root, 'haunted-location-directory');
const isImageFile = file => {
  if (!fs.existsSync(file)) return false;
  const buffer = fs.readFileSync(file).subarray(0, 12);
  return (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff)
    || (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47)
    || (buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP')
    || buffer.toString('ascii', 0, 3) === 'GIF';
};
const stateDataSource = fs.readFileSync(path.join(directory, 'state-data.js'), 'utf8');
const context = { window: {} };
vm.createContext(context);
vm.runInContext(stateDataSource, context);
const imageSourcePath = path.join(directory, 'case-file-sources.js');
const imageSourceSource = fs.readFileSync(imageSourcePath, 'utf8');
vm.runInContext(imageSourceSource, context);
vm.runInContext(fs.readFileSync(path.join(directory, 'state-directory-addition-sources.js'), 'utf8'), context);
vm.runInContext(fs.readFileSync(path.join(directory, 'state-directory-additions.js'), 'utf8'), context);
vm.runInContext(fs.readFileSync(path.join(directory, 'pennsylvania-doss-house.js'), 'utf8'), context);

const allStates = [
  ['alabama', 'Alabama'], ['alaska', 'Alaska'], ['arizona', 'Arizona'], ['arkansas', 'Arkansas'],
  ['california', 'California'], ['colorado', 'Colorado'], ['connecticut', 'Connecticut'], ['delaware', 'Delaware'],
  ['florida', 'Florida'], ['georgia', 'Georgia'], ['hawaii', 'Hawaii'], ['idaho', 'Idaho'],
  ['illinois', 'Illinois'], ['indiana', 'Indiana'], ['iowa', 'Iowa'], ['kansas', 'Kansas'],
  ['kentucky', 'Kentucky'], ['louisiana', 'Louisiana'], ['maine', 'Maine'], ['maryland', 'Maryland'],
  ['massachusetts', 'Massachusetts'], ['michigan', 'Michigan'], ['minnesota', 'Minnesota'], ['mississippi', 'Mississippi'],
  ['missouri', 'Missouri'], ['montana', 'Montana'], ['nebraska', 'Nebraska'], ['nevada', 'Nevada'],
  ['new-hampshire', 'New Hampshire'], ['new-jersey', 'New Jersey'], ['new-mexico', 'New Mexico'], ['new-york', 'New York'],
  ['north-carolina', 'North Carolina'], ['north-dakota', 'North Dakota'], ['ohio', 'Ohio'], ['oklahoma', 'Oklahoma'],
  ['oregon', 'Oregon'], ['pennsylvania', 'Pennsylvania'], ['rhode-island', 'Rhode Island'], ['south-carolina', 'South Carolina'],
  ['south-dakota', 'South Dakota'], ['tennessee', 'Tennessee'], ['texas', 'Texas'], ['utah', 'Utah'],
  ['vermont', 'Vermont'], ['virginia', 'Virginia'], ['washington', 'Washington'], ['west-virginia', 'West Virginia'],
  ['wisconsin', 'Wisconsin'], ['wyoming', 'Wyoming']
];

const failures = [];
const data = context.window.TPI_STATE_DATA || [];
const dataBySlug = new Map(data.map(state => [state.slug, state]));
const imageSources = context.window.TPI_CASE_FILE_SOURCES || {};

const legacyStateSlugs = [
  'alabama', 'alaska', 'arizona', 'arkansas', 'california', 'colorado',
  'connecticut', 'delaware', 'florida', 'georgia', 'hawaii', 'idaho',
  'illinois', 'indiana', 'iowa', 'kansas', 'kentucky', 'louisiana',
  'maine', 'maryland', 'massachusetts'
];

if (data.length !== 25) failures.push(`expected 25 new state data records, found ${data.length}`);

for (const [slug, name] of allStates) {
  const file = path.join(directory, `${slug}.html`);
  if (!fs.existsSync(file)) {
    failures.push(`${name}: missing HTML page`);
    continue;
  }
  const source = fs.readFileSync(file, 'utf8');
  if (/reserved as a placeholder|Pending research|work in progress\.\s*Research entries/i.test(source)) {
    failures.push(`${name}: placeholder copy remains`);
  }
  if (dataBySlug.has(slug)) {
    const state = dataBySlug.get(slug);
    if (state.entries.length < 12) failures.push(`${name}: fewer than 12 completed directory entries (${state.entries.length})`);
    for (const entry of state.entries) {
      if (entry.length !== 8 || entry.some(value => !String(value).trim())) {
        failures.push(`${name}: incomplete entry ${entry[0] || '(unnamed)'}`);
      }
      const image = imageSources[`${name}::${entry[0]}`] || imageSources[entry[0]];
      if (!image?.image || !image.source || !image.credit) failures.push(`${name}: missing image attribution for ${entry[0]}`);
      if (image?.image?.startsWith('case-file-photos/') && !isImageFile(path.join(directory, image.image))) failures.push(`${name}: missing or invalid local image for ${entry[0]}: ${image.image}`);
    }
    if (!source.includes('state-data.js') || !source.includes('case-file-sources.js') || !source.includes('state-directory.js')) {
      failures.push(`${name}: shared renderer is not loaded`);
    }
  } else {
    const metadata = source.match(/totalLocations\s*:\s*(\d+)/)?.[1] || source.match(/"total_locations"\s*:\s*(\d+)/)?.[1];
    if (!metadata || Number(metadata) < 1) failures.push(`${name}: established page has no location count`);
    if (legacyStateSlugs.includes(slug)) {
      for (const requiredAsset of ['legacy-case-file.css', 'legacy-case-file-sources.js', 'legacy-case-file.js', 'case-file-viewer.js']) {
        if (!source.includes(requiredAsset)) failures.push(`${name}: legacy case-file layer is missing ${requiredAsset}`);
      }
      const legacyAdditions = legacyStateSlugs.includes(slug) && ['alaska', 'delaware', 'hawaii', 'west-virginia'].includes(slug)
        ? JSON.parse(fs.readFileSync(path.join(directory, 'legacy-directory-additions.js'), 'utf8').match(/const additions = ([\s\S]*?);\n  const esc/)[1]).filter(item => item.code === dataBySlug.get(slug)?.code || item.state === name)
        : [];
      const entryCount = (source.match(/class="entry"\s+data-location-id=/g) || []).length + legacyAdditions.length;
      if (entryCount < 12) failures.push(`${name}: fewer than 12 completed directory entries (${entryCount})`);
    }
  }
}

const legacySourceContext = { window: {} };
vm.createContext(legacySourceContext);
vm.runInContext(fs.readFileSync(path.join(directory, 'legacy-case-file-sources.js'), 'utf8'), legacySourceContext);
vm.runInContext(fs.readFileSync(path.join(directory, 'legacy-directory-addition-sources.js'), 'utf8'), legacySourceContext);
const legacyImageSources = legacySourceContext.window.TPI_LEGACY_CASE_FILE_SOURCES || {};
for (const [id, image] of Object.entries(legacyImageSources)) {
  for (const asset of [image.image, image.caseFileImage]) {
    if (asset?.startsWith('case-file-photos/') && !isImageFile(path.join(directory, asset))) {
      failures.push(`missing or invalid legacy case-file asset for ${id}: ${asset}`);
    }
  }
  if (!image.source || !image.credit) failures.push(`missing legacy attribution record for ${id}`);
}
if (Object.keys(legacyImageSources).length < 4) failures.push('legacy Alabama image batch has fewer than four verified mappings');
const legacyAdditions = JSON.parse(fs.readFileSync(path.join(directory, 'legacy-directory-additions.js'), 'utf8').match(/const additions = ([\s\S]*?);\n  const esc/)[1]);
for (const item of legacyAdditions) {
  const stateSlug = item.state.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const sourceId = `${item.code.toLowerCase()}-${item.id.slice(stateSlug.length + 1)}`;
  const image = legacyImageSources[sourceId];
  if (!image?.image || !image.source || !image.credit) failures.push(`missing legacy addition attribution record for ${item.id}`);
  if (image?.image?.startsWith('case-file-photos/') && !isImageFile(path.join(directory, image.image))) {
    failures.push(`missing or invalid legacy addition asset for ${item.id}: ${image.image}`);
  }
}
const rendererSource = fs.readFileSync(path.join(directory, 'state-directory.js'), 'utf8');
if (!rendererSource.includes('tpi-case-state-label') || !rendererSource.includes('${esc(state.name)}')) {
  failures.push('case-file renderer does not display the canonical state name on photographs');
}
if (!rendererSource.includes('tpi-case-image-trigger')) {
  failures.push('case-file renderer does not provide a full-image viewer trigger');
}
const caseFileCss = fs.readFileSync(path.join(directory, 'state-directory.css'), 'utf8');
if (!caseFileCss.includes('object-fit:contain') || !caseFileCss.includes('tpi-image-lightbox')) {
  failures.push('case-file CSS does not preserve the full image or provide lightbox styling');
}
const caseFileViewer = fs.readFileSync(path.join(directory, 'case-file-viewer.js'), 'utf8');
if (!caseFileViewer.includes('tpi-image-lightbox') || !caseFileViewer.includes("event.key === 'Escape'")) {
  failures.push('case-file viewer is missing its expanded view or Escape close behavior');
}
for (const requiredImage of ['Wabasha Street Caves', 'Palmer House Hotel', 'Glensheen Mansion', 'Forepaugh’s Restaurant']) {
  const image = imageSources[requiredImage]?.image;
  if (!image || !imageSources[requiredImage]?.source || !imageSources[requiredImage]?.credit) {
    failures.push(`missing exact-photo attribution record for ${requiredImage}`);
  } else if (image.startsWith('case-file-photos/') && !isImageFile(path.join(directory, image))) {
    failures.push(`missing or invalid local case-file photo for ${requiredImage}: ${image}`);
  }
  const treatment = imageSources[requiredImage]?.caseFileImage;
  if (treatment && !fs.existsSync(path.join(directory, treatment))) {
    failures.push(`missing local case-file treatment for ${requiredImage}: ${treatment}`);
  }
}

const michiganSourceNames = [
  'Detroit Masonic Temple', 'The Whitney', 'Elmwood Cemetery',
  'Detroit Public Library — Main Branch', 'Historic Fort Wayne', 'Redford Theatre',
  'Eloise Asylum — Kay Beard Building',
  'Village at Grand Traverse Commons — Former State Hospital',
  'Michigan’s First State Prison — Armory Arts Village', 'Mission Point Resort',
  'Grand Hotel', 'Fort Holmes', 'The Perry Hotel',
  'Terrace Inn and 1911 Restaurant', 'Landmark Inn', 'South Haven Lighthouse',
  'White River Light Station', 'Seul Choix Point Lighthouse',
  'Big Bay Point Lighthouse', 'Old Presque Isle Lighthouse'
];
for (const name of michiganSourceNames) {
  const image = imageSources[name];
  if (!image?.image || !image?.caseFileImage || !image?.source || !image?.credit) {
    failures.push(`missing Michigan exact-photo attribution record for ${name}`);
    continue;
  }
  for (const asset of [image.image, image.caseFileImage]) {
    if (asset.startsWith('case-file-photos/') && !isImageFile(path.join(directory, asset))) {
      failures.push(`missing or invalid local Michigan case-file asset for ${name}: ${asset}`);
    }
  }
}
const michiganSource = fs.readFileSync(path.join(directory, 'michigan.html'), 'utf8');
if (!michiganSource.includes('case-file-sources.js') || !michiganSource.includes('mi-case-state-label')) {
  failures.push('Michigan directory does not load the state-labeled case-file renderer');
}
if (!michiganSource.includes('mi-case-image-trigger') || !michiganSource.includes('case-file-viewer.js')) {
  failures.push('Michigan directory does not load the shared full-image viewer');
}
for (const file of fs.readdirSync(directory).filter(name => name.endsWith('.html'))) {
  const source = fs.readFileSync(path.join(directory, file), 'utf8');
  if (source.includes('case-file-sources.js') && !source.includes('case-file-viewer.js')) {
    failures.push(`${file}: case-file page does not load the shared full-image viewer`);
  }
}

const localDevSource = fs.readFileSync(path.join(root, 'scripts/local-dev.mjs'), 'utf8');
if (!localDevSource.includes('"haunted-location-directory"')) {
  failures.push('local Worker refresh does not include haunted-location-directory assets');
}
for (const asset of fs.readdirSync(path.join(directory, 'case-file-photos'))) {
  if (asset === 'README.md') continue;
  if (!isImageFile(path.join(directory, 'case-file-photos', asset))) failures.push(`invalid case-file photo asset: ${asset}`);
}

for (const [file, expected] of [['haunted-locations.html', 50], ['haunted-location-directory/index.html', 50]]) {
  const source = fs.readFileSync(path.join(root, file), 'utf8');
  const linkCount = new Set([...source.matchAll(/href="(?:haunted-location-directory\/)?([a-z-]+)\.html"/g)].map(match => match[1])).size;
  if (linkCount < expected) failures.push(`${file}: expected links for all 50 state pages, found ${linkCount}`);
}

if (failures.length) {
  console.error('TPI haunted-location-directory verification failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

const newEntryCount = data.reduce((total, state) => total + state.entries.length, 0);
const directoryIndex = fs.readFileSync(path.join(directory, 'index.html'), 'utf8');
const directoryCounts = [...directoryIndex.matchAll(/<span>(\d+) entries<\/span>/g)].map(match => Number(match[1]));
const directoryTotal = directoryCounts.reduce((total, count) => total + count, 0);
if (directoryCounts.length !== 50 || directoryCounts.some(count => count < 12)) {
  console.error('TPI haunted-location-directory verification failed: directory index does not list 50 states at 12+ entries.');
  process.exit(1);
}
console.log(`TPI haunted-location-directory verification passed: 50 state pages, ${directoryTotal} indexed directory entries, no placeholders.`);
