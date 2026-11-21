(function () {
  const mapRoot = document.getElementById('haunted-usa-map');
  const stateLayer = document.getElementById('haunted-usa-map-states');
  const stateSelect = document.getElementById('haunted-usa-state-select');
  const status = document.getElementById('haunted-usa-map-status');
  const selectedName = document.getElementById('haunted-usa-selected-name');
  const selectedCount = document.getElementById('haunted-usa-selected-count');
  const selectedLink = document.getElementById('haunted-usa-selected-link');
  const stateCards = [...document.querySelectorAll('#state-directory a[href*="haunted-location-directory/"]')];

  if (!mapRoot || !stateLayer || !stateSelect || stateCards.length === 0) return;

  const coordinates = [
    ['alabama', 'AL', 704, 525], ['alaska', 'AK', 148, 575], ['arizona', 'AZ', 252, 382],
    ['arkansas', 'AR', 590, 418], ['california', 'CA', 156, 310], ['colorado', 'CO', 384, 345],
    ['connecticut', 'CT', 914, 320], ['delaware', 'DE', 858, 376], ['florida', 'FL', 794, 574],
    ['georgia', 'GA', 762, 522], ['hawaii', 'HI', 316, 575], ['idaho', 'ID', 252, 196],
    ['illinois', 'IL', 652, 330], ['indiana', 'IN', 700, 337], ['iowa', 'IA', 575, 290],
    ['kansas', 'KS', 500, 370], ['kentucky', 'KY', 694, 399], ['louisiana', 'LA', 596, 495],
    ['maine', 'ME', 948, 198], ['maryland', 'MD', 840, 367], ['massachusetts', 'MA', 928, 288],
    ['michigan', 'MI', 701, 236], ['minnesota', 'MN', 558, 194], ['mississippi', 'MS', 652, 500],
    ['missouri', 'MO', 583, 350], ['montana', 'MT', 346, 160], ['nebraska', 'NE', 481, 307],
    ['nevada', 'NV', 224, 294], ['new-hampshire', 'NH', 923, 244], ['new-jersey', 'NJ', 873, 345],
    ['new-mexico', 'NM', 372, 430], ['new-york', 'NY', 858, 267], ['north-carolina', 'NC', 817, 426],
    ['north-dakota', 'ND', 466, 178], ['ohio', 'OH', 749, 329], ['oklahoma', 'OK', 520, 435],
    ['oregon', 'OR', 164, 238], ['pennsylvania', 'PA', 821, 319], ['rhode-island', 'RI', 943, 321],
    ['south-carolina', 'SC', 800, 478], ['south-dakota', 'SD', 470, 245], ['tennessee', 'TN', 679, 455],
    ['texas', 'TX', 493, 516], ['utah', 'UT', 284, 330], ['vermont', 'VT', 897, 231],
    ['virginia', 'VA', 803, 382], ['washington', 'WA', 156, 165], ['west-virginia', 'WV', 785, 362],
    ['wisconsin', 'WI', 650, 230], ['wyoming', 'WY', 350, 255]
  ];

  const cardData = new Map(stateCards.map(card => {
    const match = card.getAttribute('href').match(/([^/]+)\.html$/);
    const count = card.querySelector('span')?.textContent.trim() || '0 entries';
    const name = card.querySelector('strong')?.textContent.trim() || match?.[1] || '';
    return [match?.[1], { name, count }];
  }));

  const states = coordinates.map(([slug, code, x, y]) => ({
    slug, code, x, y, ...(cardData.get(slug) || { name: slug, count: 'Directory entry' })
  })).filter(state => cardData.has(state.slug));

  const esc = value => String(value).replace(/[&<>"]/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'
  }[character]));

  stateLayer.innerHTML = states.map(state => `<g class="haunted-usa-map-state" data-state="${esc(state.slug)}" role="button" tabindex="0" aria-pressed="false" aria-label="${esc(`${state.name}, ${state.count}`)}"><title>${esc(`${state.name} — ${state.count}`)}</title><circle cx="${state.x}" cy="${state.y}" r="14"></circle><text x="${state.x}" y="${state.y}">${state.code}</text></g>`).join('');
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
      selectedLink.setAttribute('aria-disabled', 'true');
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
  selectState('');
}());
