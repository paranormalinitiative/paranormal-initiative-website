(function () {
  const additions = [
  {
    "state": "Alaska",
    "name": "Alaska State Capitol",
    "city": "Juneau",
    "type": "Civic Building",
    "id": "alaska-juneau-alaska-state-capitol",
    "entry": [
      "Alaska State Capitol",
      "Juneau",
      "Civic Building",
      "Documented civic building in Juneau, Alaska; TPI records Alaska State Capitol as a location for historical context, reported experiences, and responsible visitor research.",
      "Reported footsteps and voices; shadow or figure accounts; unexplained movement or temperature reports; location-specific accounts should be checked against current operator and historical sources.",
      "Public exterior; principal civic building spaces; corridors or grounds; restricted areas only with permission",
      "Juneau, AK — verify the exact public reference before field planning",
      "Verify current public access / permission required for interior research"
    ],
    "code": "AK"
  },
  {
    "state": "Delaware",
    "name": "Fort Delaware",
    "city": "Pea Patch Island",
    "type": "Historic Fort",
    "id": "delaware-pea-patch-island-fort-delaware",
    "entry": [
      "Fort Delaware",
      "Pea Patch Island",
      "Historic Fort",
      "Documented historic fort in Pea Patch Island, Delaware; TPI records Fort Delaware as a location for historical context, reported experiences, and responsible visitor research.",
      "Reported footsteps and voices; shadow or figure accounts; unexplained movement or temperature reports; location-specific accounts should be checked against current operator and historical sources.",
      "Public exterior; principal historic fort spaces; corridors or grounds; restricted areas only with permission",
      "Pea Patch Island, DE — verify the exact public reference before field planning",
      "Verify current public access / permission required for interior research"
    ],
    "code": "DE"
  },
  {
    "state": "Delaware",
    "name": "Brandywine Battlefield",
    "city": "Chadds Ford",
    "type": "Battlefield",
    "id": "delaware-chadds-ford-brandywine-battlefield",
    "entry": [
      "Brandywine Battlefield",
      "Chadds Ford",
      "Battlefield",
      "Documented battlefield in Chadds Ford, Delaware; TPI records Brandywine Battlefield as a location for historical context, reported experiences, and responsible visitor research.",
      "Reported footsteps and voices; shadow or figure accounts; unexplained movement or temperature reports; location-specific accounts should be checked against current operator and historical sources.",
      "Public exterior; principal battlefield spaces; corridors or grounds; restricted areas only with permission",
      "Chadds Ford, DE — verify the exact public reference before field planning",
      "Verify current public access / permission required for interior research"
    ],
    "code": "DE"
  },
  {
    "state": "Delaware",
    "name": "Rockwood Park",
    "city": "Wilmington",
    "type": "Historic Estate",
    "id": "delaware-wilmington-rockwood-park",
    "entry": [
      "Rockwood Park",
      "Wilmington",
      "Historic Estate",
      "Documented historic estate in Wilmington, Delaware; TPI records Rockwood Park as a location for historical context, reported experiences, and responsible visitor research.",
      "Reported footsteps and voices; shadow or figure accounts; unexplained movement or temperature reports; location-specific accounts should be checked against current operator and historical sources.",
      "Public exterior; principal historic estate spaces; corridors or grounds; restricted areas only with permission",
      "Wilmington, DE — verify the exact public reference before field planning",
      "Verify current public access / permission required for interior research"
    ],
    "code": "DE"
  },
  {
    "state": "Delaware",
    "name": "Woodburn",
    "city": "Dover",
    "type": "Historic Mansion",
    "id": "delaware-dover-woodburn",
    "entry": [
      "Woodburn",
      "Dover",
      "Historic Mansion",
      "Documented historic mansion in Dover, Delaware; TPI records Woodburn as a location for historical context, reported experiences, and responsible visitor research.",
      "Reported footsteps and voices; shadow or figure accounts; unexplained movement or temperature reports; location-specific accounts should be checked against current operator and historical sources.",
      "Public exterior; principal historic mansion spaces; corridors or grounds; restricted areas only with permission",
      "Dover, DE — verify the exact public reference before field planning",
      "Verify current public access / permission required for interior research"
    ],
    "code": "DE"
  },
  {
    "state": "Delaware",
    "name": "New Castle Court House",
    "city": "New Castle",
    "type": "Civic Building",
    "id": "delaware-new-castle-new-castle-court-house",
    "entry": [
      "New Castle Court House",
      "New Castle",
      "Civic Building",
      "Documented civic building in New Castle, Delaware; TPI records New Castle Court House as a location for historical context, reported experiences, and responsible visitor research.",
      "Reported footsteps and voices; shadow or figure accounts; unexplained movement or temperature reports; location-specific accounts should be checked against current operator and historical sources.",
      "Public exterior; principal civic building spaces; corridors or grounds; restricted areas only with permission",
      "New Castle, DE — verify the exact public reference before field planning",
      "Verify current public access / permission required for interior research"
    ],
    "code": "DE"
  },
  {
    "state": "Delaware",
    "name": "John Dickinson Plantation",
    "city": "Dover",
    "type": "Historic Home",
    "id": "delaware-dover-john-dickinson-plantation",
    "entry": [
      "John Dickinson Plantation",
      "Dover",
      "Historic Home",
      "Documented historic home in Dover, Delaware; TPI records John Dickinson Plantation as a location for historical context, reported experiences, and responsible visitor research.",
      "Reported footsteps and voices; shadow or figure accounts; unexplained movement or temperature reports; location-specific accounts should be checked against current operator and historical sources.",
      "Public exterior; principal historic home spaces; corridors or grounds; restricted areas only with permission",
      "Dover, DE — verify the exact public reference before field planning",
      "Verify current public access / permission required for interior research"
    ],
    "code": "DE"
  },
  {
    "state": "Delaware",
    "name": "Fort DuPont",
    "city": "Delaware City",
    "type": "Historic Fort",
    "id": "delaware-delaware-city-fort-dupont",
    "entry": [
      "Fort DuPont",
      "Delaware City",
      "Historic Fort",
      "Documented historic fort in Delaware City, Delaware; TPI records Fort DuPont as a location for historical context, reported experiences, and responsible visitor research.",
      "Reported footsteps and voices; shadow or figure accounts; unexplained movement or temperature reports; location-specific accounts should be checked against current operator and historical sources.",
      "Public exterior; principal historic fort spaces; corridors or grounds; restricted areas only with permission",
      "Delaware City, DE — verify the exact public reference before field planning",
      "Verify current public access / permission required for interior research"
    ],
    "code": "DE"
  },
  {
    "state": "Delaware",
    "name": "Read House and Gardens",
    "city": "New Castle",
    "type": "Historic Home",
    "id": "delaware-new-castle-read-house-and-gardens",
    "entry": [
      "Read House and Gardens",
      "New Castle",
      "Historic Home",
      "Documented historic home in New Castle, Delaware; TPI records Read House and Gardens as a location for historical context, reported experiences, and responsible visitor research.",
      "Reported footsteps and voices; shadow or figure accounts; unexplained movement or temperature reports; location-specific accounts should be checked against current operator and historical sources.",
      "Public exterior; principal historic home spaces; corridors or grounds; restricted areas only with permission",
      "New Castle, DE — verify the exact public reference before field planning",
      "Verify current public access / permission required for interior research"
    ],
    "code": "DE"
  },
  {
    "state": "Hawaii",
    "name": "Queen Emma Summer Palace",
    "city": "Honolulu",
    "type": "Historic Home",
    "id": "hawaii-honolulu-queen-emma-summer-palace",
    "entry": [
      "Queen Emma Summer Palace",
      "Honolulu",
      "Historic Home",
      "Documented historic home in Honolulu, Hawaii; TPI records Queen Emma Summer Palace as a location for historical context, reported experiences, and responsible visitor research.",
      "Reported footsteps and voices; shadow or figure accounts; unexplained movement or temperature reports; location-specific accounts should be checked against current operator and historical sources.",
      "Public exterior; principal historic home spaces; corridors or grounds; restricted areas only with permission",
      "Honolulu, HI — verify the exact public reference before field planning",
      "Verify current public access / permission required for interior research"
    ],
    "code": "HI"
  },
  {
    "state": "Hawaii",
    "name": "Bishop Museum",
    "city": "Honolulu",
    "type": "Museum",
    "id": "hawaii-honolulu-bishop-museum",
    "entry": [
      "Bishop Museum",
      "Honolulu",
      "Museum",
      "Documented museum in Honolulu, Hawaii; TPI records Bishop Museum as a location for historical context, reported experiences, and responsible visitor research.",
      "Reported footsteps and voices; shadow or figure accounts; unexplained movement or temperature reports; location-specific accounts should be checked against current operator and historical sources.",
      "Public exterior; principal museum spaces; corridors or grounds; restricted areas only with permission",
      "Honolulu, HI — verify the exact public reference before field planning",
      "Verify current public access / permission required for interior research"
    ],
    "code": "HI"
  },
  {
    "state": "West Virginia",
    "name": "Mothman Museum",
    "city": "Point Pleasant",
    "type": "Museum",
    "id": "west-virginia-point-pleasant-mothman-museum",
    "entry": [
      "Mothman Museum",
      "Point Pleasant",
      "Museum",
      "Documented museum in Point Pleasant, West Virginia; TPI records Mothman Museum as a location for historical context, reported experiences, and responsible visitor research.",
      "Reported footsteps and voices; shadow or figure accounts; unexplained movement or temperature reports; location-specific accounts should be checked against current operator and historical sources.",
      "Public exterior; principal museum spaces; corridors or grounds; restricted areas only with permission",
      "Point Pleasant, WV — verify the exact public reference before field planning",
      "Verify current public access / permission required for interior research"
    ],
    "code": "WV"
  }
];
  const esc = value => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
  for (const item of additions) {
    const section = document.querySelector(`section.sec-block[data-state="${item.code}"]`);
    if (!section || section.querySelector(`.entry[data-location-id="${item.id}"]`)) continue;
    const [name, city, type, history, claims, zones, address, access] = item.entry;
    const claimList = claims.split(';').map(value => `<li>${esc(value.trim())}</li>`).join('');
    const zoneList = zones.split(';').map(value => `<li>${esc(value.trim())}</li>`).join('');
    section.insertAdjacentHTML('beforeend', `<div class="entry" data-location-id="${esc(item.id)}"><div class="entry-summary" onclick="this.parentElement.classList.toggle('open')"><div class="entry-header"><h3 class="entry-term">${esc(name)}</h3><div class="entry-tags"><span class="tag tag-business">${esc(type)}</span><span class="tag tag-haunted">Reported Claims</span><span class="tag tag-historic">Historic</span></div></div><div class="entry-meta"><div class="entry-meta-item">${esc(city)}, ${esc(item.code)}</div><div class="entry-meta-item">${esc(type)}</div><div class="entry-meta-item">Access: Verify current rules</div></div><p class="entry-body">${esc(history)}</p></div><div class="entry-details"><div class="detail-grid"><div class="detail-box"><div class="detail-label">Activity Reported</div><ul>${claimList}</ul></div><div class="detail-box"><div class="detail-label">Structure Layout</div><ul>${zoneList}</ul></div><div class="detail-box"><div class="detail-label">Location Data</div><p><strong>Public reference:</strong> ${esc(address)}</p><p><strong>Access:</strong> ${esc(access)}</p></div><div class="detail-box"><div class="detail-label">Classification</div><p>Reported activity is included for visitors and investigators to assess for themselves.</p></div></div></div></div>`);
  }
}());
