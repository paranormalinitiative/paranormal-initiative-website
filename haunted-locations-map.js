(function () {
  const mapRoot = document.getElementById('haunted-usa-map');
  const stateLayer = document.getElementById('haunted-usa-map-states');
  const stateSelect = document.getElementById('haunted-usa-state-select');
  const status = document.getElementById('haunted-usa-map-status');
  const selectedName = document.getElementById('haunted-usa-selected-name');
  const selectedCount = document.getElementById('haunted-usa-selected-count');
  const selectedLink = document.getElementById('haunted-usa-selected-link');
  const stateDirectoryData = document.getElementById('state-directory-data');
  const stateCards = [...(stateDirectoryData?.content.querySelectorAll('a[href*="haunted-location-directory/"]') || [])];

  if (!mapRoot || !stateLayer || !stateSelect || stateCards.length === 0) return;

  const stateCodes = {
    alabama: 'AL', alaska: 'AK', arizona: 'AZ', arkansas: 'AR', california: 'CA', colorado: 'CO',
    connecticut: 'CT', delaware: 'DE', florida: 'FL', georgia: 'GA', hawaii: 'HI', idaho: 'ID',
    illinois: 'IL', indiana: 'IN', iowa: 'IA', kansas: 'KS', kentucky: 'KY', louisiana: 'LA',
    maine: 'ME', maryland: 'MD', massachusetts: 'MA', michigan: 'MI', minnesota: 'MN', mississippi: 'MS',
    missouri: 'MO', montana: 'MT', nebraska: 'NE', nevada: 'NV', 'new-hampshire': 'NH', 'new-jersey': 'NJ',
    'new-mexico': 'NM', 'new-york': 'NY', 'north-carolina': 'NC', 'north-dakota': 'ND', ohio: 'OH',
    oklahoma: 'OK', oregon: 'OR', pennsylvania: 'PA', 'rhode-island': 'RI', 'south-carolina': 'SC',
    'south-dakota': 'SD', tennessee: 'TN', texas: 'TX', utah: 'UT', vermont: 'VT', virginia: 'VA',
    washington: 'WA', 'west-virginia': 'WV', wisconsin: 'WI', wyoming: 'WY'
  };

  const cardData = new Map(stateCards.map(card => {
    const match = card.getAttribute('href').match(/([^/]+)\.html$/);
    const count = card.querySelector('span')?.textContent.trim() || '0 entries';
    const name = card.querySelector('strong')?.textContent.trim() || match?.[1] || '';
    return [match?.[1], { name, count }];
  }));

  const states = Object.keys(stateCodes).map(slug => ({
    slug, code: stateCodes[slug], ...(cardData.get(slug) || { name: slug, count: 'Directory entry' })
  })).filter(state => cardData.has(state.slug));

  const esc = value => String(value).replace(/[&<>"]/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'
  }[character]));

  stateSelect.insertAdjacentHTML('beforeend', states.map(state => `<option value="${esc(state.slug)}">${esc(state.name)} — ${esc(state.count)}</option>`).join(''));

  const selectState = slug => {
    const state = states.find(item => item.slug === slug);
    document.querySelectorAll('.haunted-usa-map-state').forEach(node => {
      const selected = node.dataset.state === slug;
      node.classList.toggle('is-selected', selected);
      node.setAttribute('aria-pressed', String(selected));
    });
    if (!state) {
      stateSelect.value = '';
      status.textContent = 'Select a state on the map or from the list.';
      selectedName.textContent = 'Choose a state';
      selectedCount.textContent = 'Explore the map to see its current directory total.';
      selectedLink.href = 'haunted-location-directory/index.html';
      selectedLink.removeAttribute('aria-disabled');
      return;
    }
    stateSelect.value = state.slug;
    status.textContent = `${state.name} selected · ${state.count}`;
    selectedName.textContent = state.name;
    selectedCount.textContent = `${state.count} in the TPI State Directory.`;
    selectedLink.href = `haunted-location-directory/${state.slug}.html`;
    selectedLink.removeAttribute('aria-disabled');
  };

  stateLayer.addEventListener('click', event => {
    const state = event.target.closest('.haunted-usa-map-state');
    if (state) selectState(state.dataset.state);
  });
  stateLayer.addEventListener('keydown', event => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    const state = event.target.closest('.haunted-usa-map-state');
    if (!state) return;
    event.preventDefault();
    selectState(state.dataset.state);
  });
  stateSelect.addEventListener('change', event => selectState(event.target.value));

  const mapAssets = (mapRoot.dataset.mapAssets || 'haunted-locations-us-map.svg').split(/\s+/).filter(Boolean);
  const renderStateMap = async () => {
    const responses = await Promise.all(mapAssets.map(asset => fetch(asset, { credentials: 'same-origin' })));
    const failedResponse = responses.find(response => !response.ok);
    if (failedResponse) throw new Error(`Unable to load state-boundary map (${failedResponse.status})`);
    const sources = await Promise.all(responses.map(response => response.text()));
    const parser = new DOMParser();
    const sourceGroups = new Map();
    sources.forEach(sourceText => {
      const source = parser.parseFromString(sourceText, 'image/svg+xml');
      source.querySelectorAll('g[id]').forEach(group => sourceGroups.set(group.id, group));
    });
    const svgNamespace = 'http://www.w3.org/2000/svg';
    stateLayer.innerHTML = states.map(state => {
      const sourceGroup = sourceGroups.get(state.code);
      if (!sourceGroup) return '';
      const group = sourceGroup.cloneNode(true);
      group.setAttribute('class', 'haunted-usa-map-state');
      group.dataset.state = state.slug;
      group.setAttribute('role', 'button');
      group.setAttribute('tabindex', '0');
      group.setAttribute('aria-pressed', 'false');
      group.setAttribute('aria-label', `${state.name}, ${state.count}`);
      group.querySelectorAll('text').forEach(label => label.setAttribute('aria-hidden', 'true'));
      const title = document.createElementNS(svgNamespace, 'title');
      title.textContent = `${state.name} — ${state.count}`;
      group.prepend(title);
      return group.outerHTML;
    }).join('');
    selectState('');
  };

  renderStateMap().catch(error => {
    status.textContent = 'State-boundary map unavailable. Use the state directory below.';
    console.error(error);
  });
}());
