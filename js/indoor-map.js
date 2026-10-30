(() => {
  'use strict';
  const explorer = document.querySelector('[data-indoor-map]');
  const source = document.getElementById('indoor-map-data');
  if (!explorer || !source) return;
  let data;
  try { data = JSON.parse(source.textContent); } catch { return; }
  const panels = [...explorer.querySelectorAll('[data-floor-panel]')];
  const floorChoices = [...explorer.querySelectorAll('[data-floor-choice]')];
  const status = explorer.querySelector('[data-indoor-status]');
  const floorById = new Map(data.floors.map(floor => [floor.id, floor]));
  const places = new Map(data.floors.flatMap(floor => floor.places.map(place => [place.id, { ...place, floor }])));
  let floorId = data.defaultFloor;
  let selected = null;
  let zoom = 1;
  let copyRequest = 0;
  let resizeFrame;

  function currentPanel() { return panels.find(panel => panel.dataset.floorPanel === floorId); }
  function currentViewport() { return currentPanel().querySelector('.indoor-viewport'); }
  function updateUrl() {
    const url = new URL(location.href);
    url.searchParams.set('floor', floorId);
    if (selected) url.searchParams.set('place', selected); else url.searchParams.delete('place');
    // Preserve the user's page position while making the selection shareable.
    try { history.replaceState(null, '', url); } catch { /* The map also works when embedded. */ }
  }
  function sizePlan() {
    const viewport = currentViewport();
    const svg = viewport.querySelector('svg');
    const box = svg.viewBox.baseVal;
    const fittedWidth = Math.min(viewport.clientWidth, viewport.clientHeight * box.width / box.height);
    const width = Math.max(fittedWidth, 700) * zoom;
    svg.style.width = `${width}px`;
    explorer.querySelector('[data-indoor-zoom="in"]').disabled = zoom >= 2.5;
    explorer.querySelector('[data-indoor-zoom="out"]').disabled = zoom <= 1;
  }
  function centerPlace() {
    const place = places.get(selected);
    if (!place) return;
    const viewport = currentViewport();
    const svg = viewport.querySelector('svg');
    const box = svg.viewBox.baseVal;
    const scale = svg.getBoundingClientRect().width / box.width;
    const x = (place.x + (place.label?.x ?? place.x)) / 2;
    const y = (place.y + (place.label?.y ?? place.y)) / 2;
    viewport.scrollTo({ left: Math.max(0, (x - box.x) * scale - viewport.clientWidth / 2), top: Math.max(0, (y - box.y) * scale - viewport.clientHeight / 2), behavior: 'instant' });
  }
  function selectPlace(id, writeUrl = true, center = true) {
    const place = places.get(id);
    if (!place || place.floor.id !== floorId) return;
    selected = id;
    copyRequest++;
    const panel = currentPanel();
    panel.querySelectorAll('[data-place], [data-place-choice]').forEach(element => {
      const active = (element.dataset.place || element.dataset.placeChoice) === id;
      element.setAttribute('aria-pressed', String(active));
    });
    panel.querySelector('[data-detail-name]').textContent = place.name;
    panel.querySelector('[data-detail-copy]').textContent = place.description;
    const copy = panel.querySelector('[data-copy-place]');
    copy.hidden = false;
    copy.textContent = 'Copy place link';
    panel.querySelector('.indoor-share-fallback')?.remove();
    status.textContent = `${place.name}, ${place.floor.name}, selected.`;
    if (center) centerPlace();
    if (writeUrl) updateUrl();
  }
  function activatePlace(element) {
    selectPlace(element.dataset.place || element.dataset.placeChoice);
    if (element.dataset.placeChoice && window.matchMedia('(max-width: 1023px)').matches) {
      currentViewport().scrollIntoView({ block: 'center', behavior: 'instant' });
    }
  }
  function showFloor(id, placeId, writeUrl = true) {
    if (!floorById.has(id)) return;
    floorId = id;
    zoom = 1;
    selected = null;
    panels.forEach(panel => { panel.hidden = panel.dataset.floorPanel !== id; });
    floorChoices.forEach(choice => {
      const active = choice.dataset.floorChoice === id;
      choice.setAttribute('aria-pressed', String(active));
      if (active) choice.setAttribute('aria-current', 'true'); else choice.removeAttribute('aria-current');
    });
    sizePlan();
    const floor = floorById.get(id);
    const candidate = places.get(placeId);
    selectPlace(candidate?.floor.id === id ? placeId : floor.places[0].id, false);
    if (writeUrl) updateUrl();
  }
  function readUrl() {
    const params = new URLSearchParams(location.search);
    const place = places.get(params.get('place'));
    showFloor(place?.floor.id || (floorById.has(params.get('floor')) ? params.get('floor') : data.defaultFloor), place?.id, false);
  }

  explorer.classList.add('is-enhanced');
  explorer.querySelectorAll('[data-place]').forEach(place => {
    place.setAttribute('role', 'button');
    place.setAttribute('tabindex', '0');
    place.setAttribute('aria-label', `Select ${place.getAttribute('aria-label')}`);
  });
  explorer.querySelectorAll('[data-place-choice]').forEach(choice => { choice.setAttribute('role', 'button'); });
  explorer.querySelector('.indoor-tools').hidden = false;
  floorChoices.forEach(choice => {
    choice.setAttribute('role', 'button');
    choice.setAttribute('aria-controls', `floor-${choice.dataset.floorChoice}`);
    choice.addEventListener('click', event => { event.preventDefault(); showFloor(choice.dataset.floorChoice); });
    choice.addEventListener('keydown', event => {
      if (event.key === ' ') { event.preventDefault(); showFloor(choice.dataset.floorChoice); }
    });
  });
  explorer.addEventListener('click', async event => {
    const place = event.target.closest('[data-place], [data-place-choice]');
    if (place) { event.preventDefault(); activatePlace(place); return; }
    const control = event.target.closest('[data-indoor-zoom]');
    if (control) {
      const action = control.dataset.indoorZoom;
      zoom = action === 'reset' ? 1 : Math.max(1, Math.min(2.5, zoom + (action === 'in' ? .5 : -.5)));
      sizePlan();
      centerPlace();
      status.textContent = `Floor plan zoom: ${Math.round(zoom * 100)}%.`;
      return;
    }
    const copy = event.target.closest('[data-copy-place]');
    if (copy && selected) {
      const request = ++copyRequest;
      const url = new URL(location.href);
      url.searchParams.set('floor', floorId);
      url.searchParams.set('place', selected);
      url.hash = 'inside-building';
      try {
        await navigator.clipboard.writeText(url.href);
        if (request === copyRequest) { copy.textContent = 'Link copied'; status.textContent = 'Place link copied to clipboard.'; }
      } catch {
        // Keep a selectable link available if clipboard permission is unavailable.
        const detail = copy.closest('.indoor-detail');
        let link = detail.querySelector('.indoor-share-fallback');
        if (!link) { link = document.createElement('a'); link.className = 'link indoor-share-fallback'; detail.append(link); }
        link.href = url.href;
        link.textContent = 'Open place link';
        status.textContent = 'Clipboard unavailable. Use the place link below.';
      }
    }
  });
  explorer.addEventListener('keydown', event => {
    const place = event.target.closest('[data-place], [data-place-choice]');
    if (place && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      activatePlace(place);
    }
  });
  const fullScreen = explorer.querySelector('[data-indoor-fullscreen]');
  if (typeof HTMLDialogElement !== 'undefined' && HTMLDialogElement.prototype.showModal) {
    let dialog = null;
    fullScreen.hidden = false;
    fullScreen.setAttribute('aria-label', 'Expand floor plan');
    fullScreen.addEventListener('click', () => {
      if (dialog) { dialog.close(); return; }
      const parent = explorer.parentNode;
      const next = explorer.nextSibling;
      const previousScroll = window.scrollY;
      dialog = document.createElement('dialog');
      dialog.id = 'indoor-map-dialog';
      dialog.className = 'modal indoor-expanded';
      dialog.setAttribute('aria-label', 'Expanded building floor map');
      const closeForm = document.createElement('form');
      closeForm.method = 'dialog';
      closeForm.className = 'modal-action indoor-close-action';
      const closeButton = document.createElement('button');
      closeButton.className = 'btn';
      closeButton.textContent = 'Close map';
      closeForm.append(closeButton);
      explorer.append(closeForm);
      explorer.classList.add('modal-box');
      dialog.append(explorer);
      document.body.append(dialog);
      dialog.addEventListener('close', () => {
        parent.insertBefore(explorer, next);
        explorer.classList.remove('modal-box');
        closeForm.remove();
        dialog.remove();
        dialog = null;
        fullScreen.setAttribute('aria-label', 'Expand floor plan');
        fullScreen.setAttribute('aria-pressed', 'false');
        window.scrollTo({ top: previousScroll, behavior: 'instant' });
        requestAnimationFrame(() => { sizePlan(); centerPlace(); fullScreen.focus(); });
      });
      dialog.showModal();
      fullScreen.setAttribute('aria-label', 'Close expanded floor plan');
      fullScreen.setAttribute('aria-pressed', 'true');
      requestAnimationFrame(() => { sizePlan(); centerPlace(); });
    });
  }
  window.addEventListener('resize', () => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(() => { sizePlan(); centerPlace(); });
  });
  window.addEventListener('popstate', readUrl);
  readUrl();
})();
