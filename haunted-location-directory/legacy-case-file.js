(function () {
  const sources = window.TPI_LEGACY_CASE_FILE_SOURCES || {};
  const escapeHtml = value => String(value).replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[character]));

  document.querySelectorAll('.entry[data-location-id]').forEach(entry => {
    const details = entry.querySelector('.entry-details');
    if (!details || details.querySelector('.legacy-case-image, .legacy-image-pending')) return;

    const id = entry.dataset.locationId;
    const name = entry.querySelector('.entry-term')?.textContent.trim() || 'Location';
    const state = document.title.replace(/^.*•\s*/, '') || entry.closest('.sec-block')?.dataset.state || 'TPI';
    const source = sources[id];

    if (!source) {
      details.insertAdjacentHTML('afterbegin', `<div class="legacy-image-pending"><strong>Exact case-file photograph pending</strong><span>TPI will add a verified image of ${escapeHtml(name)} when an exact source photograph and reuse terms are confirmed. No AI substitute is used.</span></div>`);
      return;
    }

    const displayedImage = source.caseFileImage || source.image;
    details.insertAdjacentHTML('afterbegin', `<figure class="legacy-case-image"><div class="legacy-case-state-label">${escapeHtml(state)}</div><button class="legacy-case-image-trigger" type="button" aria-label="View ${escapeHtml(name)} image larger"><img src="${escapeHtml(displayedImage)}" alt="Styled case-file treatment of ${escapeHtml(name)}" loading="lazy" referrerpolicy="no-referrer"></button><figcaption>Styled case-file treatment of the exact location · <a href="${escapeHtml(source.image)}" target="_blank" rel="noopener noreferrer">original photo</a> · <a href="${escapeHtml(source.source)}" target="_blank" rel="noopener noreferrer">source and license</a> · ${escapeHtml(source.credit)}</figcaption></figure>`);
  });

  window.TPI_LegacyCaseFileDirectory = {
    version: '1.0.0',
    state: document.title.replace(/^.*•\s*/, ''),
    totalLocations: document.querySelectorAll('.entry[data-location-id]').length,
    imageCount: document.querySelectorAll('.legacy-case-image').length,
    pendingCount: document.querySelectorAll('.legacy-image-pending').length
  };
}());
