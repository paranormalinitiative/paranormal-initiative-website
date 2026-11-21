import fs from 'node:fs/promises';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const root = process.cwd();
const directory = path.join(root, 'haunted-location-directory');
const photos = path.join(directory, 'case-file-photos');
const agent = 'TPI-Haunted-Location-Directory/1.0 (research)';
const slug = value => value.normalize('NFKD').replace(/[’'`]/g, '').replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '').toLowerCase();

const repairs = [
  { state: 'Montana', name: 'Gold Hill Hotel', city: 'Gold Hill', type: 'Historic Hotel', file: 'montana-gold-hill-hotel.jpg', url: 'https://goldhillhotel.net/wp-content/uploads/2015/04/IMG_0249-2.jpg', source: 'https://goldhillhotel.net/', credit: 'Gold Hill Hotel & Saloon — official location photograph' },
  { state: 'New York', name: 'Hinsdale House', city: 'Hinsdale', type: 'Historic Home', file: 'new-york-hinsdale-hinsdale-house.png', url: 'https://hauntedhinsdalehouse.com/wp-content/uploads/2019/08/Haunted-Hinsdale-dark.png', source: 'https://hauntedhinsdalehouse.com/', credit: 'Haunted Hinsdale House — official location photograph' },
  { state: 'North Dakota', name: 'Hotel Donaldson', city: 'Fargo', type: 'Historic Hotel', file: 'north-dakota-fargo-hotel-donaldson.jpeg', url: 'https://static.wixstatic.com/media/40787e_dc6a47688e6640fea269006848698e38~mv2.jpeg/v1/fit/w_640,h_427,q_90,enc_avif,quality_auto/40787e_dc6a47688e6640fea269006848698e38~mv2.jpeg', source: 'https://www.hoteldonaldson.com/', credit: 'Hotel Donaldson — official location photograph' },
  { state: 'Oklahoma', name: 'Gilcrease Museum', city: 'Tulsa', type: 'Museum', file: 'oklahoma-tulsa-gilcrease-museum.jpg', url: 'https://upload.wikimedia.org/wikipedia/commons/1/1d/Gilcrease_-_Gro%C3%9Fer_Saal_mit_Schlacht_von_Chapultepec.jpg', source: 'https://commons.wikimedia.org/wiki/File:Gilcrease_-_Gro%C3%9Fer_Saal_mit_Schlacht_von_Chapultepec.jpg', credit: 'Wolfgang Sauber — CC BY-SA 3.0; exact Gilcrease Museum interior' },
  { state: 'Missouri', name: 'Chatillon-DeMenil Mansion', city: 'St. Louis', type: 'Historic Home', file: 'chatillon-demenil-mansion.jpg', url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Chatilon-DeMenil%20House%20in%201936%20%28St.%20Louis,%20Missouri%29.jpg?width=1400', source: 'https://commons.wikimedia.org/wiki/File:Chatilon-DeMenil_House_in_1936_(St._Louis,_Missouri).jpg', credit: 'Theodore LaVack / Historic American Buildings Survey — public domain reference' },
  { state: 'North Carolina', name: 'Brown Mountain', city: 'Morganton', type: 'Mountain Area', file: 'north-carolina-morganton-brown-mountain.jpg', url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Brown%20Mountain,%20North%20Carolina%20viewed%20from%20Beacon%20Heights,%20October%202016.jpg?width=1400', source: 'https://commons.wikimedia.org/wiki/File:Brown_Mountain,_North_Carolina_viewed_from_Beacon_Heights,_October_2016.jpg', credit: 'Thomson200 — CC0' },
  { state: 'South Dakota', name: 'Adams House', city: 'Deadwood', type: 'Historic Home', file: 'south-dakota-deadwood-adams-house.jpg', url: 'https://www.cityofdeadwood.com/sites/default/files/imageattachments/historic-preservation/page/26921/adams_house.jpg', source: 'https://www.cityofdeadwood.com/historic-preservation/page/historic-adams-house', credit: 'City of Deadwood — official location photograph' },
  { state: 'South Dakota', name: 'Homestake Opera House', city: 'Lead', type: 'Theater', file: 'south-dakota-lead-homestake-opera-house.jpg', url: 'https://cdn.prod.website-files.com/6722d6530f7a3bf26d94efed/679ed25c6edfab02542e45c5_IMGL7896.jpg', source: 'https://www.homestakeoperahouse.org/', credit: 'Historic Homestake Opera House — official location photograph' },
  { state: 'South Dakota', name: 'The Bullock Hotel Annex', city: 'Deadwood', type: 'Historic Hotel', file: 'bullock-hotel.jpg', url: null, source: 'https://commons.wikimedia.org/wiki/File:Bullock_Hotel,_Deadwood_SD,_North_view_20110821_1.jpg', credit: 'DXR — CC BY-SA 4.0; exact Bullock Hotel reference' },
  { state: 'South Dakota', name: 'Sica Hollow State Park', city: 'Sisseton', type: 'State Park', file: 'south-dakota-sisseton-sica-hollow-state-park.jpg', url: 'https://gfp.sd.gov/userdocs/Sica_HollowSDTourism028.jpg', source: 'https://gfp.sd.gov/parks/detail/sica-hollow-state-park/', credit: 'South Dakota Tourism — official location photograph' },
  { state: 'Tennessee', name: 'Old South Pittsburg Hospital', city: 'South Pittsburg', type: 'Historic Hospital', file: 'tennessee-south-pittsburg-old-south-pittsburg-hospital.jpg', url: 'https://mctnhistory.com/images/south-pittsburg-hospital.jpg', source: 'https://www.mctnhistory.com/industry/south-pittsburg-hospital', credit: 'Tyce H / Middle Tennessee History — location photograph' },
  { state: 'Vermont', name: 'Lake Bomoseen', city: 'Castleton', type: 'Historic Waterfront', file: 'vermont-castleton-lake-bomoseen.jpg', url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Lake%20Bomoseen.JPG?width=1400', source: 'https://commons.wikimedia.org/wiki/File:Lake_Bomoseen.JPG', credit: 'Wikimedia Commons contributor — license recorded on source page' }
];

async function fetchBuffer(url) {
  const { stdout } = await execFileAsync('curl', ['-sS', '-L', '-A', agent, url], { encoding: 'buffer', maxBuffer: 20 * 1024 * 1024 });
  return Buffer.isBuffer(stdout) ? stdout : Buffer.from(stdout);
}

function entryFor(item) {
  const code = { Montana: 'MT', 'New York': 'NY', 'North Dakota': 'ND', Oklahoma: 'OK', Missouri: 'MO', 'North Carolina': 'NC', 'South Dakota': 'SD', Tennessee: 'TN', Vermont: 'VT' }[item.state];
  return [item.name, item.city, item.type,
    `Documented ${item.type.toLowerCase()} in ${item.city}, ${item.state}; TPI records ${item.name} as a location for historical context, reported experiences, and responsible visitor research.`,
    'Reported footsteps and voices; shadow or figure accounts; unexplained movement or temperature reports; location-specific accounts should be checked against current operator and historical sources.',
    `Public exterior; principal ${item.type.toLowerCase()} spaces; corridors or grounds; restricted areas only with permission`,
    `${item.city}, ${code} — verify the exact public reference before field planning`,
    'Verify current public access / permission required for interior research'];
}

async function main() {
  await fs.mkdir(photos, { recursive: true });
  const additionsPath = path.join(directory, 'state-directory-additions.js');
  const additionsSource = await fs.readFile(additionsPath, 'utf8');
  const additionsMatch = additionsSource.match(/const additions = ([\s\S]*?);\n  const stateData/);
  const additions = additionsMatch ? JSON.parse(additionsMatch[1]) : [];
  const sourcePath = path.join(directory, 'state-directory-addition-sources.js');
  const sourceSource = await fs.readFile(sourcePath, 'utf8');
  const sourceMatch = sourceSource.match(/Object\.assign\([^,]+, ([\s\S]*?)\);\s*$/);
  const sourceMap = sourceMatch ? JSON.parse(sourceMatch[1]) : {};

  for (const item of repairs) {
    if (item.url) await fs.writeFile(path.join(photos, item.file), await fetchBuffer(item.url));
    const asset = `case-file-photos/${item.file}`;
    const key = `${item.state}::${item.name}`;
    const previous = additions.find(entry => entry.state === item.state && entry.name === item.name);
    if (!previous) additions.push({ ...item, id: `${slug(item.state)}-${slug(item.city)}-${slug(item.name)}`, asset, source: item.source, credit: item.credit, imageTitle: item.file, entry: entryFor(item) });
    else Object.assign(previous, { asset, source: item.source, credit: item.credit, imageTitle: item.file });
    sourceMap[key] = { image: asset, source: item.source, credit: item.credit };
  }

  await fs.writeFile(additionsPath, `(function () {\n  const additions = ${JSON.stringify(additions, null, 2)};\n  const stateData = window.TPI_STATE_DATA || [];\n  for (const item of additions) {\n    const state = stateData.find(candidate => candidate.name === item.state);\n    if (state && !state.entries.some(entry => entry[0] === item.name)) state.entries.push(item.entry);\n  }\n}());\n`);
  await fs.writeFile(sourcePath, `window.TPI_CASE_FILE_SOURCES = Object.assign(window.TPI_CASE_FILE_SOURCES || {}, ${JSON.stringify(sourceMap, null, 2)});\n`);
  console.log(JSON.stringify({ repaired: repairs.map(item => `${item.state}: ${item.name}`) }, null, 2));
}

main().catch(error => { console.error(error); process.exit(1); });
