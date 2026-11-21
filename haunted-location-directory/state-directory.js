(function () {
  const data = window.TPI_STATE_DATA || [];
  const imageSources = window.TPI_CASE_FILE_SOURCES || {};
  const slug = window.TPI_DIRECTORY_STATE;
  const state = data.find(item => item.slug === slug);
  if (!state) {
    document.body.innerHTML = '<main class="tpi-page"><p class="tpi-empty">State directory data unavailable.</p></main>';
    return;
  }

  const esc = value => String(value).replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[character]));

  const navStates = [
    ['alabama', 'Alabama'], ['alaska', 'Alaska'], ['arizona', 'Arizona'],
    ['arkansas', 'Arkansas'], ['california', 'California'], ['colorado', 'Colorado'],
    ['connecticut', 'Connecticut'], ['delaware', 'Delaware'], ['florida', 'Florida'],
    ['georgia', 'Georgia'], ['hawaii', 'Hawaii'], ['idaho', 'Idaho'],
    ['illinois', 'Illinois'], ['indiana', 'Indiana'], ['iowa', 'Iowa'],
    ['kansas', 'Kansas'], ['kentucky', 'Kentucky'], ['louisiana', 'Louisiana'],
    ['maine', 'Maine'], ['maryland', 'Maryland'], ['massachusetts', 'Massachusetts'],
    ['michigan', 'Michigan'], ['minnesota', 'Minnesota'], ['mississippi', 'Mississippi'],
    ['missouri', 'Missouri'], ['montana', 'Montana'], ['nebraska', 'Nebraska'],
    ['nevada', 'Nevada'], ['new-hampshire', 'New Hampshire'], ['new-jersey', 'New Jersey'],
    ['new-mexico', 'New Mexico'], ['new-york', 'New York'], ['north-carolina', 'North Carolina'],
    ['north-dakota', 'North Dakota'], ['ohio', 'Ohio'], ['oklahoma', 'Oklahoma'],
    ['oregon', 'Oregon'], ['pennsylvania', 'Pennsylvania'], ['rhode-island', 'Rhode Island'],
    ['south-carolina', 'South Carolina'], ['south-dakota', 'South Dakota'], ['tennessee', 'Tennessee'],
    ['texas', 'Texas'], ['utah', 'Utah'], ['vermont', 'Vermont'], ['virginia', 'Virginia'],
    ['washington', 'Washington'], ['west-virginia', 'West Virginia'], ['wisconsin', 'Wisconsin'],
    ['wyoming', 'Wyoming']
  ];

  document.title = `Location Reference Directory • ${state.name}`;
  document.getElementById('state-label').textContent = state.name;
  document.getElementById('state-badge').textContent = `${state.name} • State Directory`;
  document.getElementById('state-count').textContent = state.entries.length;
  document.getElementById('state-description').textContent = `A sourced ${state.name} field-reference page covering public historic places with documented history and reported paranormal claims. Claims remain claims; this directory does not present them as proven facts.`;
  document.getElementById('state-intro').textContent = `${state.name} entries are source-linked directory references. TPI keeps history, reported experiences, access limits, and investigation questions together so each location can be researched responsibly.`;
  document.getElementById('entry-count').textContent = `${state.entries.length} locations`;
  document.getElementById('source-note').innerHTML = `Primary starting source: <a href="${esc(state.source)}" target="_blank" rel="noopener noreferrer">${esc(state.sourceLabel)}</a>. Each location remains subject to source review, operator permission, safety review, and TPI’s haunted-location criteria before deeper field planning.`;
  document.getElementById('state-nav').innerHTML = navStates.map(([stateSlug, name]) => `<a href="${stateSlug}.html" ${stateSlug === slug ? 'aria-current="page"' : ''}>${name}</a>`).join('');

  const renderImage = name => {
    const image = imageSources[`${state.name}::${name}`] || imageSources[name];
    if (!image) {
      return '<div class="tpi-image-pending"><strong>Exact case-file photograph pending</strong><span>TPI will add a verified image of this location when a source photo and reuse terms are confirmed. No AI substitute is used.</span></div>';
    }
    const displayedImage = image.caseFileImage || image.image;
    const treatment = image.caseFileImage
      ? `Styled case-file treatment of the exact location · <a href="${esc(image.image)}" target="_blank" rel="noopener noreferrer">original photo</a> · `
      : 'Exact location photograph · ';
    return `<figure class="tpi-case-image"><div class="tpi-case-state-label">${esc(state.name)}</div><button class="tpi-case-image-trigger" type="button" aria-label="View ${esc(name)} image larger"><img src="${esc(displayedImage)}" alt="${esc(image.caseFileImage ? `Styled case-file treatment of ${name}` : `Documentary photograph of ${name}`)}" loading="lazy" referrerpolicy="no-referrer"></button><figcaption>${treatment}<a href="${esc(image.source)}" target="_blank" rel="noopener noreferrer">source and license</a> · ${esc(image.credit)}</figcaption></figure>`;
  };

  const render = items => {
    document.getElementById('entries').innerHTML = items.map(entry => {
      const [name, city, type, history, claims, zones, address, access] = entry;
      return `<details class="tpi-entry">
        <summary>
          <div class="tpi-entry-title"><h3>${esc(name)}</h3><div class="tpi-tags"><span class="tpi-tag">${esc(type)}</span><span class="tpi-tag claim">Reported claims</span><span class="tpi-tag">Historic</span></div></div>
          <div class="tpi-meta"><span>${esc(city)}, ${esc(state.name)}</span><span>${esc(access)}</span></div>
          <p class="tpi-summary">${esc(history)}</p>
        </summary>
        <div class="tpi-details">
          ${renderImage(name)}
          <div class="tpi-grid">
            <div class="tpi-box"><h4>Historical Context</h4><p>${esc(history)}</p></div>
            <div class="tpi-box"><h4>Activity Reported</h4><ul>${claims.split(';').map(item => `<li>${esc(item)}</li>`).join('')}</ul></div>
            <div class="tpi-box"><h4>Structure / Research Zones</h4><ul>${zones.split(';').map(item => `<li>${esc(item)}</li>`).join('')}</ul></div>
            <div class="tpi-box"><h4>Location Data</h4><p><strong>Public reference:</strong> ${esc(address)}</p><p><strong>Access:</strong> ${esc(access)}</p><p><strong>Coordinates:</strong> Verify with the official site or public map before field planning.</p><p><strong>State source:</strong> <a href="${esc(state.source)}" target="_blank" rel="noopener noreferrer">${esc(state.sourceLabel)}</a></p></div>
            <div class="tpi-box"><h4>Classification</h4><p>${esc(type)}</p><p>Visitors and investigators may assess the reported activity for themselves while following the location’s access, safety, and permission requirements.</p></div>
            <div class="tpi-box"><h4>Research Status</h4><p><strong>Starter research lead — under review.</strong></p><p>Confirm the exact site identity, source trail, public access, safety conditions, and operator permission before field planning.</p></div>
          </div>
        </div>
      </details>`;
    }).join('') || '<p class="tpi-empty">No matching entries.</p>';
  };

  render(state.entries);
  document.getElementById('search').addEventListener('input', event => {
    const query = event.target.value.toLowerCase().trim();
    render(state.entries.filter(entry => entry.join(' ').toLowerCase().includes(query)));
  });
  window.TPI_LocationDirectory = {
    version: '1.1.0',
    state: state.name,
    totalLocations: state.entries.length,
    lastUpdated: '2026-11-18',
    getAllLocations: () => state.entries.map(entry => ({ name: entry[0], city: entry[1], state: state.name }))
  };
}());
