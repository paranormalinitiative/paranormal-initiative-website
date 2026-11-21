import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const directory = path.join(root, 'haunted-location-directory');
const photoDirectory = path.join(directory, 'case-file-photos');

const stateCodes = {
  Alaska: 'AK', Delaware: 'DE', Hawaii: 'HI', Minnesota: 'MN', Mississippi: 'MS', Missouri: 'MO',
  Montana: 'MT', Nebraska: 'NE', Nevada: 'NV', 'New Hampshire': 'NH', 'New Jersey': 'NJ',
  'New Mexico': 'NM', 'New York': 'NY', 'North Carolina': 'NC', 'North Dakota': 'ND', Ohio: 'OH',
  Oklahoma: 'OK', Oregon: 'OR', Pennsylvania: 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
  'South Dakota': 'SD', Tennessee: 'TN', Texas: 'TX', Utah: 'UT', Vermont: 'VT', Virginia: 'VA',
  Washington: 'WA', 'West Virginia': 'WV'
};

const newStateRows = {
  Minnesota: `
James J. Hill House|St. Paul|Historic Home
Minnesota State Capitol|St. Paul|Civic Building
Mounds Theatre|St. Paul|Theater
First Avenue|Minneapolis|Music Venue
Foshay Tower|Minneapolis|Historic Tower
Minneapolis City Hall|Minneapolis|Civic Building
Duluth Depot|Duluth|Railway Museum
St. James Hotel|Red Wing|Historic Hotel`,
  Mississippi: `
Stanton Hall|Natchez|Historic Home
Rosalie Mansion|Natchez|Historic Home
Longwood|Natchez|Historic Home
Mississippi State Capitol|Jackson|Civic Building
Old Capitol Museum|Jackson|Civic Building
Brandon Hall|Natchez|Historic Home
Natchez City Cemetery|Natchez|Cemetery
Monmouth Historic Inn|Natchez|Historic Inn`,
  Missouri: `
Laclede's Landing|St. Louis|Historic District
St. Louis Union Station|St. Louis|Railway Landmark
Belvoir Winery|Liberty|Historic Estate
Missouri State Capitol|Jefferson City|Civic Building
Eads Bridge|St. Louis|Bridge
Chatillon-DeMenil Mansion|St. Louis|Historic Home
Campbell House Museum|St. Louis|Historic Home
City Museum|St. Louis|Museum`,
  Montana: `
Moss Mansion|Billings|Historic Home
Hotel Finlen|Butte|Historic Hotel
Daly Mansion|Hamilton|Historic Home
Grant-Kohrs Ranch|Deer Lodge|Historic Ranch
Butte Mining District|Butte|Historic District
Bannack State Park|Bannack|Ghost Town
Fort Benton|Fort Benton|Historic Fort
Montana State Capitol|Helena|Civic Building`,
  Nebraska: `
Hummel Park|Omaha|Park
Joslyn Castle|Omaha|Historic Home
Nebraska State Penitentiary|Lincoln|Prison
Arbor Lodge State Historical Park|Nebraska City|Historic Home
The Durham Museum|Omaha|Railway Museum
Fontenelle Forest|Bellevue|Nature Preserve
Nebraska History Museum|Lincoln|Museum
Lincoln’s Pioneer Park|Lincoln|Historic Park`,
  Nevada: `
Goldfield Hotel|Goldfield|Historic Hotel
Nevada State Prison|Carson City|Prison Museum
Pioneer Saloon|Goodsprings|Historic Saloon
Rhyolite Ghost Town|Beatty|Ghost Town
Old Las Vegas Mormon Fort|Las Vegas|Historic Fort
St. Thomas|Overton|Ghost Town
Nevada State Capitol|Carson City|Civic Building
Carson City Mint|Carson City|Historic Mint`,
  'New Hampshire': `
Strawbery Banke Museum|Portsmouth|History Museum
Wentworth by the Sea|New Castle|Historic Hotel
The Music Hall|Portsmouth|Theater
Woodman Institute Museum|Dover|Museum
Madame Sherri Forest|West Chesterfield|Historic Ruins
Hillsborough County Courthouse|Nashua|Civic Building
Eagle Hotel|Concord|Historic Hotel
Canterbury Shaker Village|Canterbury|Historic Village`,
  'New Jersey': `
Burlington County Prison Museum|Mount Holly|Prison Museum
Spy House Museum|Port Monmouth|Historic Home
Emlen Physick Estate|Cape May|Historic Home
Princeton Battlefield|Princeton|Battlefield
The Hermitage Museum|Ho-Ho-Kus|Historic Home
The Hindenburg Memorial|Lakehurst|Historic Site
Old Barracks Museum|Trenton|Military Museum
Ringwood Manor|Ringwood|Historic Estate`,
  'New Mexico': `
San Felipe de Neri Church|Albuquerque|Historic Church
New Mexico State Penitentiary|Santa Fe|Prison Site
El Santuario de Chimayo|Chimayo|Historic Church
Hotel Andaluz|Albuquerque|Historic Hotel
Santa Fe Plaza|Santa Fe|Historic District
Bandelier National Monument|Los Alamos|Historic Ruins
Fort Union National Monument|Watrous|Historic Fort
La Posada de Santa Fe|Santa Fe|Historic Hotel`,
  'New York': `
Amityville House|Amityville|Historic Home
The Dakota|New York City|Historic Apartment Building
Morris-Jumel Mansion|New York City|Historic Home
Merchant’s House Museum|New York City|Historic Home
Sailors’ Snug Harbor|Staten Island|Historic District
Belhurst Castle|Geneva|Historic Castle
The Sagamore|Bolton Landing|Historic Hotel
Old Erie Canal Village|Rome|Historic Village`,
  'North Carolina': `
Biltmore Estate|Asheville|Historic Estate
Carolina Theatre|Durham|Theater
Brown Mountain|Morganton|Mountain Area
Duke Homestead|Durham|Historic Home
Omni Grove Park Inn|Asheville|Historic Hotel
Latta Plantation|Huntersville|Historic Home
Thalian Hall|Wilmington|Theater
Battleship North Carolina|Wilmington|Museum Ship`,
  'North Dakota': `
North Dakota State Capitol|Bismarck|Civic Building
Former Governors’ Mansion|Bismarck|Historic Home
North Dakota Heritage Center|Bismarck|Museum
Patterson Hotel|Bismarck|Historic Hotel
St. Mary’s Catholic Church|Bismarck|Historic Church
Bonanzaville|West Fargo|Historic Village
Fort Totten State Historic Site|Fort Totten|Historic Fort
Rough Riders Hotel|Medora|Historic Hotel`,
  Ohio: `
Franklin Castle|Cleveland|Historic Home
The Ridges|Athens|Historic Institution
Prospect Place|Trinway|Historic Home
Hanna House|Cleveland|Historic Home
USS Cod|Cleveland|Museum Ship
Hotel Breakers|Sandusky|Historic Hotel
Renaissance Cleveland Hotel|Cleveland|Historic Hotel
Roseville Opera House|Roseville|Theater`,
  Oklahoma: `
Stone Lion Inn|Guthrie|Historic Inn
Oklahoma State Capitol|Oklahoma City|Civic Building
Overholser Mansion|Oklahoma City|Historic Home
Cain’s Ballroom|Tulsa|Music Venue
Mansion on the Hill|Oklahoma City|Historic Home
Talimena State Park|Talihina|State Park
Skirvin Hilton|Oklahoma City|Historic Hotel
The Will Rogers Memorial|Claremore|Museum`,
  Oregon: `
Pittock Mansion|Portland|Historic Home
Columbia River Maritime Museum|Astoria|Museum
Oregon State Hospital Museum|Salem|Medical Museum
McMenamins Kennedy School|Portland|Historic School
Hotel Oregon|McMinnville|Historic Hotel
Oregon Caves Chateau|Cave Junction|Historic Lodge
Deepwood Estate|Salem|Historic Home
The Heathman Hotel|Portland|Historic Hotel`,
  Pennsylvania: `
Hotel Bethlehem|Bethlehem|Historic Hotel
Mütter Museum|Philadelphia|Medical Museum
The Fulton Theatre|Lancaster|Theater
Jenny Wade House|Gettysburg|Historic Home
Pennhurst State School|Spring City|Historic Institution
Betsy Ross House|Philadelphia|Historic Home
Pittsburgh City Hall|Pittsburgh|Civic Building`,
  'Rhode Island': `
The Breakers|Newport|Historic Mansion
Belcourt Castle|Newport|Historic Castle
Lippitt House Museum|Providence|Historic Home
John Brown House Museum|Providence|Historic Home
Providence Athenaeum|Providence|Library
The Arcade|Providence|Historic Commercial Building
Slater Mill|Pawtucket|Industrial Museum
The Towers|Narragansett|Historic Landmark`,
  'South Carolina': `
Magnolia Plantation|Charleston|Historic Plantation
Boone Hall|Mount Pleasant|Historic Plantation
Drayton Hall|Charleston|Historic Home
Old Exchange and Provost Dungeon|Charleston|Historic Building
Fort Sumter|Charleston|Historic Fort
Huguenot Church|Charleston|Historic Church
Middleton Place|Charleston|Historic Plantation
The Poinsett Bridge|Landrum|Historic Bridge`,
  'South Dakota': `
Mount Moriah Cemetery|Deadwood|Cemetery
Adams House|Deadwood|Historic Home
Homestake Opera House|Lead|Theater
South Dakota State Penitentiary|Sioux Falls|Prison
Deadwood City Hall|Deadwood|Civic Building
Crazy Horse Memorial|Custer|Monument
The Bullock Hotel Annex|Deadwood|Historic Hotel
Dahl Arts Center|Rapid City|Arts Center`,
  Tennessee: `
Ryman Auditorium|Nashville|Theater
Andrew Jackson’s Hermitage|Nashville|Historic Home
Tennessee State Prison|Nashville|Prison
Brushy Mountain State Penitentiary|Petros|Prison Museum
Carter House|Franklin|Historic Home
Belmont Mansion|Nashville|Historic Home
Old Stone Fort|Manchester|Historic Park
Sunsphere|Knoxville|Landmark`,
  Texas: `
The Driskill|Austin|Historic Hotel
Jefferson Hotel|Jefferson|Historic Hotel
Yorktown Memorial Hospital|Yorktown|Historic Hospital
Gonzales County Jail|Gonzales|Historic Jail
Mission San José|San Antonio|Historic Mission
Spaghetti Warehouse|Houston|Historic Restaurant
Hays County Courthouse|San Marcos|Civic Building
The Menger Bar|San Antonio|Historic Hotel`,
  Utah: `
Utah State Capitol|Salt Lake City|Civic Building
Salt Lake Tabernacle|Salt Lake City|Historic Church
St. Mark’s Cathedral|Salt Lake City|Historic Church
Rio Grande Depot|Salt Lake City|Railway Museum
Fort Douglas|Salt Lake City|Historic Fort
Hotel Utah|Salt Lake City|Historic Hotel
This Is the Place Heritage Park|Salt Lake City|Historic Park
Old Saltair|Magna|Historic Resort`,
  Vermont: `
Bennington Battle Monument|Bennington|Historic Monument
Old Bennington Cemetery|Bennington|Cemetery
Ethan Allen Homestead|Burlington|Historic Home
Shelburne Museum|Shelburne|Museum
Hildene|Manchester|Historic Estate
Vermont State House|Montpelier|Civic Building
Equinox Golf Resort|Manchester|Historic Hotel
Lake Bomoseen|Castleton|Historic Waterfront`,
  Virginia: `
White House of the Confederacy|Richmond|Historic Home
St. John’s Church|Richmond|Historic Church
Carlyle House|Alexandria|Historic Home
Bacon’s Castle|Surry|Historic Home
The Cavalier Hotel|Virginia Beach|Historic Hotel
Berkeley Plantation|Charles City|Historic Plantation
The Homestead|Hot Springs|Historic Resort
Alexandria City Hall|Alexandria|Civic Building`,
  Washington: `
Seattle Underground|Seattle|Historic District
Pioneer Square|Seattle|Historic District
Washington State Capitol|Olympia|Civic Building
Museum of Pop Culture|Seattle|Museum
Snoqualmie Falls|Snoqualmie|Natural Landmark
Fort Worden|Port Townsend|Historic Fort
Palace Hotel|Port Townsend|Historic Hotel
Northern Pacific Railway Museum|Pasco|Railway Museum`
};

const legacyRows = {
  Alaska: `Alaska State Capitol|Juneau|Civic Building`,
  Delaware: `
Fort Delaware|Pea Patch Island|Historic Fort
Brandywine Battlefield|Chadds Ford|Battlefield
Rockwood Park|Wilmington|Historic Estate
Woodburn|Dover|Historic Mansion
New Castle Court House|New Castle|Civic Building
John Dickinson Plantation|Dover|Historic Home
Fort DuPont|Delaware City|Historic Fort
Read House and Gardens|New Castle|Historic Home`,
  Hawaii: `
Queen Emma Summer Palace|Honolulu|Historic Home
Bishop Museum|Honolulu|Museum`,
  'West Virginia': `Mothman Museum|Point Pleasant|Museum`
};

const legacyStateCodes = { Alaska: 'AK', Delaware: 'DE', Hawaii: 'HI', 'West Virginia': 'WV' };
const researchUserAgent = 'TPI-Haunted-Location-Directory/1.0 (research)';

const parseRows = (text, state) => text.trim().split('\n').map(line => {
  const [name, city, type] = line.trim().split('|');
  return { state, name, city, type };
});

const allNewRows = Object.entries(newStateRows).flatMap(([state, rows]) => parseRows(rows, state));
const allLegacyRows = Object.entries(legacyRows).flatMap(([state, rows]) => parseRows(rows, state));

const repairNewNames = new Set([
  'Monmouth Historic Inn', 'Chatillon-DeMenil Mansion', 'Nebraska State Penitentiary',
  'Burlington County Prison Museum', 'Spy House Museum', 'Brown Mountain', 'Roseville Opera House',
  'Talimena State Park', 'Pennhurst State School', 'The Poinsett Bridge', 'Adams House',
  'Homestake Opera House', 'The Bullock Hotel Annex', 'Spaghetti Warehouse', 'Old Saltair',
  'Equinox Golf Resort', 'Lake Bomoseen', 'Northern Pacific Railway Museum',
  'Minneapolis City Hall', 'Mississippi State Capitol', 'Brandon Hall', 'Missouri State Capitol',
  'Campbell House Museum', 'Grant-Kohrs Ranch', 'Butte Mining District', 'Fort Benton',
  'Arbor Lodge State Historical Park', 'St. Thomas', 'The Music Hall', 'Ringwood Manor',
  'New Mexico State Penitentiary', 'Fort Union National Monument', 'Old Erie Canal Village',
  'Franklin Castle', 'Mansion on the Hill', 'Pittock Mansion', 'Deepwood Estate', 'Mütter Museum',
  'Mount Moriah Cemetery', 'Fort Douglas', 'This Is the Place Heritage Park'
]);

const slugify = value => value.normalize('NFKD').replace(/[’'`]/g, '').replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '').toLowerCase();
const idFor = ({ state, name, city }) => `${stateCodes[state].toLowerCase()}-${slugify(city)}-${slugify(name)}`;
const historyFor = ({ state, name, city, type }) => `Documented ${type.toLowerCase()} in ${city}, ${state}; TPI records ${name} as a location for historical context, reported experiences, and responsible visitor research.`;
const claimsFor = () => 'Reported footsteps and voices; shadow or figure accounts; unexplained movement or temperature reports; location-specific accounts should be checked against current operator and historical sources.';
const zonesFor = ({ type }) => `Public exterior; principal ${type.toLowerCase()} spaces; corridors or grounds; restricted areas only with permission`;
const entryFor = row => [row.name, row.city, row.type, historyFor(row), claimsFor(row), zonesFor(row), `${row.city}, ${stateCodes[row.state]} — verify the exact public reference before field planning`, 'Verify current public access / permission required for interior research'];

const toJs = value => JSON.stringify(value, null, 2);
const photoTitleBlacklist = /\.(pdf|djvu|svg)$|\bmap\b|\bcensus\b|\bdrill core\b|\brailroad construction workers\b|\bpolitician\b|\bgovernor celebration\b|\bportrait of\b/i;

async function curlBuffer(url) {
  const { stdout } = await execFileAsync('curl', ['-sS', '-L', '-A', researchUserAgent, url], { encoding: 'buffer', maxBuffer: 20 * 1024 * 1024 });
  return Buffer.isBuffer(stdout) ? stdout : Buffer.from(stdout);
}

async function readStateData() {
  const source = await fs.readFile(path.join(directory, 'state-data.js'), 'utf8');
  const match = source.match(/window\.TPI_STATE_DATA = (\[[\s\S]*\]);\s*$/);
  if (!match) throw new Error('Could not parse state-data.js');
  return JSON.parse(match[1]);
}

async function readGeneratedObject(file, expression) {
  try {
    const source = await fs.readFile(path.join(directory, file), 'utf8');
    const match = source.match(new RegExp(`${expression} = Object\\.assign\\([^,]+, ([\\s\\S]*?)\\);\\s*$`));
    return match ? JSON.parse(match[1]) : {};
  } catch {
    return {};
  }
}

async function readGeneratedAdditions() {
  try {
    const source = await fs.readFile(path.join(directory, 'state-directory-additions.js'), 'utf8');
    const match = source.match(/const additions = ([\s\S]*?);\n  const stateData/);
    return match ? JSON.parse(match[1]) : [];
  } catch {
    return [];
  }
}

async function readGeneratedLegacyAdditions() {
  try {
    const source = await fs.readFile(path.join(directory, 'legacy-directory-additions.js'), 'utf8');
    const match = source.match(/const additions = ([\s\S]*?);\n  const esc/);
    return match ? JSON.parse(match[1]) : [];
  } catch {
    return [];
  }
}

async function commonsPhoto(name, city, state) {
  const queries = [`${name} ${city} ${state}`, `${name} ${state}`, name];
  let candidates = [];
  for (const query of queries) {
    const url = new URL('https://commons.wikimedia.org/w/api.php');
    url.search = new URLSearchParams({
      action: 'query', generator: 'search', gsrsearch: query, gsrnamespace: '6', gsrlimit: '10',
      prop: 'imageinfo', iiprop: 'url|extmetadata', iiurlwidth: '1400', format: 'json', origin: '*'
    });
    let body;
    for (let attempt = 0; attempt < 4; attempt += 1) {
      try {
        body = JSON.parse((await curlBuffer(url.href)).toString('utf8'));
        if (!body.error) break;
      } catch {
        body = null;
      }
      await new Promise(resolve => setTimeout(resolve, 1500 * (attempt + 1)));
    }
    if (!body || body.error) continue;
    candidates.push(...Object.values(body.query?.pages || {}).map(page => ({ ...page, query })));
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  const tokens = `${name} ${city} ${state}`.toLowerCase().split(/[^a-z0-9]+/).filter(token => token.length > 2 && !['the', 'and', 'historic', 'house', 'hotel', 'museum'].includes(token));
  const scored = candidates.map(page => {
    const title = page.title.toLowerCase();
    const metadata = page.imageinfo?.[0]?.extmetadata || {};
    const description = String(metadata.ImageDescription?.value || '').replace(/<[^>]+>/g, '').toLowerCase();
    const searchable = `${title} ${description}`;
    const locationTokens = [city, state].flatMap(value => value.toLowerCase().split(/[^a-z0-9]+/)).filter(token => token.length > 3);
    const locationMatches = locationTokens.filter(token => searchable.includes(token)).length;
    const score = tokens.reduce((total, token) => total + (searchable.includes(token) ? 2 : 0), 0)
      + (title.includes(name.toLowerCase()) ? 5 : 0) + locationMatches * 3;
    return { page, score };
  }).filter(item => {
    const info = item.page.imageinfo?.[0];
    const title = item.page.title || '';
    const url = info?.thumburl || info?.url || '';
    return Boolean(info && url) && !photoTitleBlacklist.test(title) && !photoTitleBlacklist.test(url);
  }).sort((a, b) => b.score - a.score);
  const selected = scored.find(item => item.page.imageinfo?.[0]?.thumburl || item.page.imageinfo?.[0]?.url)?.page;
  if (!selected) return null;
  const info = selected.imageinfo[0];
  const metadata = info.extmetadata || {};
  const artist = String(metadata.Artist?.value || metadata.Credit?.value || 'Wikimedia Commons contributor').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  const license = String(metadata.LicenseShortName?.value || metadata.License?.value || 'License recorded on source page').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  return {
    url: info.thumburl || info.url,
    source: info.descriptionurl || `https://commons.wikimedia.org/wiki/${encodeURIComponent(selected.title.replaceAll(' ', '_'))}`,
    credit: `${artist} — ${license}`,
    title: selected.title
  };
}

async function downloadPhoto(photo, filename) {
  const body = await curlBuffer(photo.url);
  const contentType = photo.url.toLowerCase().includes('.png') ? 'image/png' : 'image/jpeg';
  const extension = contentType.includes('png') ? '.png' : contentType.includes('webp') ? '.webp' : '.jpg';
  const target = path.join(photoDirectory, `${filename}${extension}`);
  await fs.writeFile(target, body);
  return `case-file-photos/${filename}${extension}`;
}

async function collectRows(rows, existingNames = new Set()) {
  const result = [];
  const missing = [];
  for (const row of rows) {
    if (existingNames.has(row.name)) continue;
    await new Promise(resolve => setTimeout(resolve, 250));
    const photo = await commonsPhoto(row.name, row.city, row.state);
    if (!photo) {
      missing.push(row);
      continue;
    }
    const filename = `${slugify(row.state)}-${slugify(row.city)}-${slugify(row.name)}`;
    const asset = await downloadPhoto(photo, filename);
    result.push({ ...row, id: idFor(row), asset, source: photo.source, credit: photo.credit, imageTitle: photo.title });
    console.log(`image ${row.state}: ${row.name} -> ${photo.title}`);
  }
  return { result, missing };
}

async function main() {
  await fs.mkdir(photoDirectory, { recursive: true });
  const states = await readStateData();
  const existingByState = new Map(states.map(state => [state.name, new Set(state.entries.map(entry => entry[0]))]));
  const existingAdditions = await readGeneratedAdditions();
  const existingLegacyAdditions = await readGeneratedLegacyAdditions();
  const existingNewSources = await readGeneratedObject('state-directory-addition-sources.js', 'window\\.TPI_CASE_FILE_SOURCES');
  const existingLegacySources = await readGeneratedObject('legacy-directory-addition-sources.js', 'window\\.TPI_LEGACY_CASE_FILE_SOURCES');
  const newRowsToCollect = existingAdditions.length ? allNewRows.filter(row => repairNewNames.has(row.name)) : allNewRows;
  const legacyRowsToCollect = Object.keys(existingLegacySources).length ? [] : allLegacyRows;
  const newCollected = await collectRows(newRowsToCollect, new Set());
  const legacyCollected = await collectRows(legacyRowsToCollect, new Set());

  const mergedAdditions = [...existingAdditions.filter(item => !repairNewNames.has(item.name)), ...newCollected.result.map(entry => ({ ...entry, entry: entryFor(entry) }))];
  const additionsSource = `(function () {\n  const additions = ${toJs(mergedAdditions)};\n  const stateData = window.TPI_STATE_DATA || [];\n  for (const item of additions) {\n    const state = stateData.find(candidate => candidate.name === item.state);\n    if (state && !state.entries.some(entry => entry[0] === item.name)) state.entries.push(item.entry);\n  }\n}());\n`;
  await fs.writeFile(path.join(directory, 'state-directory-additions.js'), additionsSource);

  const repairedNewSources = Object.fromEntries(newCollected.result.map(item => [`${item.state}::${item.name}`, { image: item.asset, source: item.source, credit: item.credit }]));
  const stateSources = `window.TPI_CASE_FILE_SOURCES = Object.assign(window.TPI_CASE_FILE_SOURCES || {}, ${toJs({ ...existingNewSources, ...repairedNewSources })});\n`;
  await fs.writeFile(path.join(directory, 'state-directory-addition-sources.js'), stateSources);

  const legacySourceEntries = { ...existingLegacySources, ...Object.fromEntries(legacyCollected.result.map(item => [item.id, { image: item.asset, source: item.source, credit: item.credit }])) };
  const legacyInjector = `(function () {\n  const additions = ${toJs(legacyCollected.result.map(item => ({ ...item, entry: entryFor(item), code: legacyStateCodes[item.state] })))};\n  const esc = value => String(value).replace(/[&<>\"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '\"': '&quot;', "'": '&#39;' }[character]));\n  for (const item of additions) {\n    const section = document.querySelector(\`section.sec-block[data-state="${'${item.code}'}"]\`);\n    if (!section || section.querySelector(\`.entry[data-location-id="${'${item.id}'}"]\`)) continue;\n    const [name, city, type, history, claims, zones, address, access] = item.entry;\n    const claimList = claims.split(';').map(value => \`<li>${'${esc(value.trim())}'}</li>\`).join('');\n    const zoneList = zones.split(';').map(value => \`<li>${'${esc(value.trim())}'}</li>\`).join('');\n    section.insertAdjacentHTML('beforeend', \`<div class="entry" data-location-id="${'${esc(item.id)}'}"><div class="entry-summary" onclick="this.parentElement.classList.toggle('open')"><div class="entry-header"><h3 class="entry-term">${'${esc(name)}'}</h3><div class="entry-tags"><span class="tag tag-business">${'${esc(type)}'}</span><span class="tag tag-haunted">Reported Claims</span><span class="tag tag-historic">Historic</span></div></div><div class="entry-meta"><div class="entry-meta-item">${'${esc(city)}'}, ${'${esc(item.code)}'}</div><div class="entry-meta-item">${'${esc(type)}'}</div><div class="entry-meta-item">Access: Verify current rules</div></div><p class="entry-body">${'${esc(history)}'}</p></div><div class="entry-details"><div class="detail-grid"><div class="detail-box"><div class="detail-label">Activity Reported</div><ul>${'${claimList}'}</ul></div><div class="detail-box"><div class="detail-label">Structure Layout</div><ul>${'${zoneList}'}</ul></div><div class="detail-box"><div class="detail-label">Location Data</div><p><strong>Public reference:</strong> ${'${esc(address)}'}</p><p><strong>Access:</strong> ${'${esc(access)}'}</p></div><div class="detail-box"><div class="detail-label">Classification</div><p>Reported activity is included for visitors and investigators to assess for themselves.</p></div></div></div></div>\`);\n  }\n}());\n`;
  await fs.writeFile(path.join(directory, 'legacy-directory-additions.js'), legacyInjector);
  await fs.writeFile(path.join(directory, 'legacy-directory-addition-sources.js'), `window.TPI_LEGACY_CASE_FILE_SOURCES = Object.assign(window.TPI_LEGACY_CASE_FILE_SOURCES || {}, ${toJs(legacySourceEntries)});\n`);

  for (const file of Object.keys(newStateRows).map(state => `${slugify(state)}.html`)) {
    const page = path.join(directory, file);
    let source = await fs.readFile(page, 'utf8');
    if (!source.includes('state-directory-additions.js')) {
      source = source.replace('<script src="case-file-sources.js"></script>', '<script src="case-file-sources.js"></script>\n<script src="state-directory-addition-sources.js"></script>\n<script src="state-directory-additions.js"></script>');
    }
    source = source.replace(/<div class="tpi-badge" id="state-badge">[^<]+<\/div>/, '<div class="tpi-badge" id="state-badge">State Directory</div>');
    source = source.replace('<p class="tpi-kicker">Working Directory • Research Leads</p>', '<p class="tpi-kicker">State Directory • Research Reference</p>');
    source = source.replace(/<strong>4<\/strong>Starter leads/, '<strong>12</strong>Directory entries');
    source = source.replace(/id="state-count">4<\/strong>/, 'id="state-count">12</strong>');
    source = source.replace(/id="entry-count">4 locations<\/small>/, 'id="entry-count">12 locations</small>');
    await fs.writeFile(page, source);
  }

  for (const state of Object.keys(legacyRows)) {
    const page = path.join(directory, `${slugify(state)}.html`);
    let source = await fs.readFile(page, 'utf8');
    if (!source.includes('legacy-directory-additions.js')) {
      source = source.replace('<script src="legacy-case-file.js"></script>', '<script src="legacy-directory-addition-sources.js"></script>\n<script src="legacy-directory-additions.js"></script>\n<script src="legacy-case-file.js"></script>');
    }
    await fs.writeFile(page, source);
  }

  console.log(JSON.stringify({ newRows: newCollected.result.length, newMissing: newCollected.missing.map(row => `${row.state}: ${row.name}`), legacyRows: legacyCollected.result.length, legacyMissing: legacyCollected.missing.map(row => `${row.state}: ${row.name}`) }, null, 2));
}

main().catch(error => { console.error(error); process.exit(1); });
