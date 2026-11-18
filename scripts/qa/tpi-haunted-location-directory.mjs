import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root = process.cwd();
const directory = path.join(root, 'haunted-location-directory');
const stateDataSource = fs.readFileSync(path.join(directory, 'state-data.js'), 'utf8');
const context = { window: {} };
vm.createContext(context);
vm.runInContext(stateDataSource, context);
const imageSourcePath = path.join(directory, 'case-file-sources.js');
const imageSourceSource = fs.readFileSync(imageSourcePath, 'utf8');
vm.runInContext(imageSourceSource, context);

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
    if (state.entries.length < 4) failures.push(`${name}: fewer than four starter entries`);
    for (const entry of state.entries) {
      if (entry.length !== 8 || entry.some(value => !String(value).trim())) {
        failures.push(`${name}: incomplete entry ${entry[0] || '(unnamed)'}`);
      }
    }
    if (!source.includes('state-data.js') || !source.includes('case-file-sources.js') || !source.includes('state-directory.js')) {
      failures.push(`${name}: shared renderer is not loaded`);
    }
  } else {
    const metadata = source.match(/totalLocations\s*:\s*(\d+)/)?.[1] || source.match(/"total_locations"\s*:\s*(\d+)/)?.[1];
    if (!metadata || Number(metadata) < 1) failures.push(`${name}: established page has no location count`);
  }
}

const imageSources = context.window.TPI_CASE_FILE_SOURCES || {};
const rendererSource = fs.readFileSync(path.join(directory, 'state-directory.js'), 'utf8');
if (!rendererSource.includes('tpi-case-state-label') || !rendererSource.includes('${esc(state.name)}')) {
  failures.push('case-file renderer does not display the canonical state name on photographs');
}
for (const requiredImage of ['Wabasha Street Caves', 'Glensheen Mansion', 'Forepaugh’s Restaurant']) {
  const image = imageSources[requiredImage]?.image;
  if (!image || !imageSources[requiredImage]?.source || !imageSources[requiredImage]?.credit) {
    failures.push(`missing exact-photo attribution record for ${requiredImage}`);
  } else if (image.startsWith('case-file-photos/') && !fs.existsSync(path.join(directory, image))) {
    failures.push(`missing local case-file photo for ${requiredImage}: ${image}`);
  }
  const treatment = imageSources[requiredImage]?.caseFileImage;
  if (treatment && !fs.existsSync(path.join(directory, treatment))) {
    failures.push(`missing local case-file treatment for ${requiredImage}: ${treatment}`);
  }
}

const localDevSource = fs.readFileSync(path.join(root, 'scripts/local-dev.mjs'), 'utf8');
if (!localDevSource.includes('"haunted-location-directory"')) {
  failures.push('local Worker refresh does not include haunted-location-directory assets');
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
console.log(`TPI haunted-location-directory verification passed: 50 state pages, ${newEntryCount} new starter entries, no placeholders.`);
