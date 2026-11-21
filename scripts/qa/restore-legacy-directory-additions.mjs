import fs from 'node:fs/promises';
import path from 'node:path';

const directory = path.join(process.cwd(), 'haunted-location-directory');
const codes = { Alaska: 'AK', Delaware: 'DE', Hawaii: 'HI', 'West Virginia': 'WV' };
const rows = [
  ['Alaska', 'Alaska State Capitol', 'Juneau', 'Civic Building'],
  ['Delaware', 'Fort Delaware', 'Pea Patch Island', 'Historic Fort'],
  ['Delaware', 'Brandywine Battlefield', 'Chadds Ford', 'Battlefield'],
  ['Delaware', 'Rockwood Park', 'Wilmington', 'Historic Estate'],
  ['Delaware', 'Woodburn', 'Dover', 'Historic Mansion'],
  ['Delaware', 'New Castle Court House', 'New Castle', 'Civic Building'],
  ['Delaware', 'John Dickinson Plantation', 'Dover', 'Historic Home'],
  ['Delaware', 'Fort DuPont', 'Delaware City', 'Historic Fort'],
  ['Delaware', 'Read House and Gardens', 'New Castle', 'Historic Home'],
  ['Hawaii', 'Queen Emma Summer Palace', 'Honolulu', 'Historic Home'],
  ['Hawaii', 'Bishop Museum', 'Honolulu', 'Museum'],
  ['West Virginia', 'Mothman Museum', 'Point Pleasant', 'Museum']
];
const slug = value => value.normalize('NFKD').replace(/[’'`]/g, '').replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '').toLowerCase();
const entryFor = ([state, name, city, type]) => [name, city, type,
  `Documented ${type.toLowerCase()} in ${city}, ${state}; TPI records ${name} as a location for historical context, reported experiences, and responsible visitor research.`,
  'Reported footsteps and voices; shadow or figure accounts; unexplained movement or temperature reports; location-specific accounts should be checked against current operator and historical sources.',
  `Public exterior; principal ${type.toLowerCase()} spaces; corridors or grounds; restricted areas only with permission`,
  `${city}, ${codes[state]} — verify the exact public reference before field planning`,
  'Verify current public access / permission required for interior research'];

const sourceSource = await fs.readFile(path.join(directory, 'legacy-directory-addition-sources.js'), 'utf8');
const sourceMap = JSON.parse(sourceSource.match(/Object\.assign\([^,]+, ([\s\S]*?)\);\s*$/)[1]);
const additions = rows.map(([state, name, city, type]) => {
  const id = `${slug(state)}-${slug(city)}-${slug(name)}`;
  const source = sourceMap[id] || {};
  return { state, name, city, type, id, asset: source.image, source: source.source, credit: source.credit, entry: entryFor([state, name, city, type]), code: codes[state] };
});
const output = `(function () {\n  const additions = ${JSON.stringify(additions, null, 2)};\n  const esc = value => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));\n  for (const item of additions) {\n    const section = document.querySelector(\`section.sec-block[data-state="\${item.code}"]\`);\n    if (!section || section.querySelector(\`.entry[data-location-id="\${item.id}"]\`)) continue;\n    const [name, city, type, history, claims, zones, address, access] = item.entry;\n    const claimList = claims.split(';').map(value => \`<li>\${esc(value.trim())}</li>\`).join('');\n    const zoneList = zones.split(';').map(value => \`<li>\${esc(value.trim())}</li>\`).join('');\n    section.insertAdjacentHTML('beforeend', \`<div class="entry" data-location-id="\${esc(item.id)}"><div class="entry-summary" onclick="this.parentElement.classList.toggle('open')"><div class="entry-header"><h3 class="entry-term">\${esc(name)}</h3><div class="entry-tags"><span class="tag tag-business">\${esc(type)}</span><span class="tag tag-haunted">Reported Claims</span><span class="tag tag-historic">Historic</span></div></div><div class="entry-meta"><div class="entry-meta-item">\${esc(city)}, \${esc(item.code)}</div><div class="entry-meta-item">\${esc(type)}</div><div class="entry-meta-item">Access: Verify current rules</div></div><p class="entry-body">\${esc(history)}</p></div><div class="entry-details"><div class="detail-grid"><div class="detail-box"><div class="detail-label">Activity Reported</div><ul>\${claimList}</ul></div><div class="detail-box"><div class="detail-label">Structure Layout</div><ul>\${zoneList}</ul></div><div class="detail-box"><div class="detail-label">Location Data</div><p><strong>Public reference:</strong> \${esc(address)}</p><p><strong>Access:</strong> \${esc(access)}</p></div><div class="detail-box"><div class="detail-label">Classification</div><p>Reported activity is included for visitors and investigators to assess for themselves.</p></div></div></div></div>\`);\n  }\n}());\n`;
await fs.writeFile(path.join(directory, 'legacy-directory-additions.js'), output);
console.log(`restored ${additions.length} legacy additions`);
