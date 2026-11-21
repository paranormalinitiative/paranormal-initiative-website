(function () {
  const state = (window.TPI_STATE_DATA || []).find(item => item.slug === 'pennsylvania');
  if (!state || state.entries.some(entry => entry[0] === 'The Doss House')) return;

  state.entries.push([
    'The Doss House',
    'Loretto',
    'Historic Home',
    'The Doss House is an owner-operated historic home in Loretto, preserved in memory of Shawnna Rigsby\'s late mother, Holley Cataldo. The owner presents it as a place where history, remembrance, restoration, and positive community experiences meet the study of paranormal theory.',
    'Owner-reported figures associated with former town professions; a little girl in a green dress; shadowy basement figures; an audible growl; unexplained mantle activity; a reported stairway incident. These reports are included for visitors and investigators to consider for themselves.',
    'Main house; upstairs bedrooms; barber-shop area; living room; basement; street-facing exterior',
    '278 St Mary, Loretto, PA',
    'Daytime tours and investigations by appointment / owner permission required'
  ]);
}());
