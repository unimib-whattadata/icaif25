#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const root = path.resolve(__dirname, '..');
const data = JSON.parse(fs.readFileSync(path.join(root, 'data/venue-floors.json'), 'utf8'));
const geometry = JSON.parse(fs.readFileSync(path.join(root, 'data/venue-floor-geometry.json'), 'utf8'));
const checkOnly = process.argv.includes('--check');
let stale = false;
const escape = text => String(text).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const marker = '<!-- INDOOR MAP -->';
const endMarker = '<!-- /INDOOR MAP -->';
const floorById = new Map(data.floors.map(floor => [floor.id, floor]));
const placeById = new Map(data.floors.flatMap(floor => floor.places.map(place => [place.id, { ...place, floor: floor.id }])));
const connectedPlaces = new Set();
for (const connection of data.connections || []) {
  if (!['stairs', 'lift'].includes(connection.kind) || connection.stops.length < 2) throw new Error(`Invalid floor connection: ${connection.id}`);
  const stops = new Set();
  for (const stop of connection.stops) {
    const place = placeById.get(stop.place);
    if (!floorById.has(stop.floor) || place?.floor !== stop.floor || place.kind !== connection.kind || stops.has(stop.floor) || connectedPlaces.has(stop.place)) {
      throw new Error(`Invalid connection stop: ${connection.id} / ${stop.place}`);
    }
    stops.add(stop.floor);
    connectedPlaces.add(stop.place);
  }
}
const facilityNames = { stairs: 'Stairs', lift: 'Lifts', wc: 'Toilets', entrance: 'Entrances', press: 'Press room', work: 'Work area' };
const icon = kind => ({
  stairs: '<path d="M-12 11h8V3h8v-8h8M-12-1 0-13m-7 0h7v7"/>',
  lift: '<rect x="-12" y="-7" width="24" height="21" rx="2"/><path d="M-8-11l4-4 4 4m2-4 4 4 4-4M-5 5v6m10-6v6"/><circle cx="-5" cy="0" r="2"/><circle cx="5" cy="0" r="2"/>',
  wc: '<text text-anchor="middle" y="6" class="indoor-wc-symbol">WC</text>',
  entrance: '<path d="M3-13h10v26H3M-13 0H7M0-7l7 7-7 7"/>',
  press: '<rect x="-13" y="-11" width="26" height="22" rx="2"/><path d="M-8-6h6v6h-6zM3-6h5M3-1h5M-8 5H8"/>',
  work: '<path d="M-14 12h28M-11 7V-9h22V7H-11ZM1-6l-5 7h6l-3 5"/>'
}[kind] || '');
const facilityIcon = kind => `<svg class="indoor-facility-icon" viewBox="-18 -18 36 36" width="24" height="24" aria-hidden="true">${icon(kind)}</svg>`;
const programmeName = place => place.kind === 'room' ? (place.programmeRooms || []).find(name => name !== place.name && name !== place.alias) || place.mapSubtitle : undefined;
const secondaryNames = place => [...new Set([programmeName(place), place.alias].filter(name => name && name !== place.name))];
const placeNames = place => [place.name, ...secondaryNames(place)];
const zoneClass = place => `${place.shape ? ` indoor-area--${place.kind === 'space' ? 'foyer' : place.kind}` : ''}${place.zone ? ` indoor-zone--${place.zone}` : ''}`;
const choiceSecondary = place => programmeName(place) || (place.kind === 'room' ? place.alias : undefined);
const choice = place => `<a class="btn indoor-place-choice${zoneClass(place)}${!place.shape ? ` indoor-facility-choice indoor-facility--${place.kind}` : ''}" href="#map-place-${place.id}" data-place-choice="${place.id}" aria-label="${escape(placeNames(place).join(' · '))}">${!place.shape ? facilityIcon(place.kind) : ''}<span class="indoor-choice-label"><span class="indoor-choice-name">${escape(place.name)}</span>${choiceSecondary(place) ? `<span class="indoor-choice-meta">${escape(choiceSecondary(place))}</span>` : ''}</span><svg class="indoor-choice-arrow" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6"/></svg></a>`;

function stairShape(stair) {
  return stair.shape || `M${stair.x} ${stair.y}h${stair.width}v${stair.height}h${-stair.width}Z`;
}

function stairs(stair) {
  const flights = stair.flights || [stair];
  const runs = flights.map(flight => {
    const { x, y, width, height } = flight;
    const horizontal = flight.direction === 'horizontal';
    const count = flight.steps || Math.max(4, Math.min(32, Math.round((horizontal ? width : height) / 5)));
    const treads = Array.from({ length: count }, (_, i) => {
      const step = (i + 1) / (count + 1);
      return horizontal ? `M${x + width * step} ${y}v${height}` : `M${x} ${y + height * step}h${width}`;
    }).join('');
    return `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="#fff" stroke="#9bafbd" stroke-width="1.3"/><path d="${treads}" fill="none" stroke="#9bafbd" stroke-width="1.2"/>`;
  }).join('');
  return `<g><path d="${stairShape(stair)}" fill="#f0f3f6" stroke="#9bafbd" stroke-width="1.5"/>${(stair.landings || []).map(d => `<path d="${d}" fill="#fff" stroke="#9bafbd" stroke-width="1.3"/>`).join('')}${runs}${stair.arrow ? `<path d="${stair.arrow}" fill="none" stroke="#647b8b" stroke-width="1.5"/>` : ''}</g>`;
}

// Keep room, corridor and service-core outlines to make the plan legible.
// Draw the stair flights and landings, with pictograms on mapped staircases.
// Explicitly removed architecture stays omitted in the source geometry.
function background(floor) {
  const base = geometry[floor.id];
  const boundaryId = `indoor-boundary-${floor.id}`;
  const mappedFacilities = new Set(floor.places.filter(place => !place.shape).map(place => place.id));
  const separateShapes = new Set([
    ...floor.places.filter(place => place.shape).map(place => place.shape),
    ...(base.landmarks || []).map(item => item.shape),
    ...(base.voids || []).map(item => item.shape)
  ]);
  return `<g stroke-linejoin="round" stroke-linecap="round">
    <defs><clipPath id="${boundaryId}"><path d="${base.outline}"/></clipPath></defs>
    <path d="${base.outline}" fill="#fff" stroke="#647b8b" stroke-width="3.5"/>
    <g clip-path="url(#${boundaryId})">
    <g fill="#f0f3f6" stroke="#afbec8" stroke-width="1.8">${(base.spaces || []).filter(shape => !separateShapes.has(shape)).map(shape => `<path d="${shape}"/>`).join('')}</g>
    ${(base.voids || []).map(item => `<path d="${item.shape}" fill="#fff" stroke="#afbec8" stroke-width="1.8"/>`).join('')}
    ${(base.landmarks || []).map(item => `<path d="${item.shape}" fill="#e5ecf1" stroke="#9bafbd" stroke-width="2"/>`).join('')}
    <path d="${base.walls}" fill="none" stroke="#9bafbd" stroke-width="2"/>
    ${(base.stairs || []).map(stairs).join('')}
    ${(base.lifts || []).filter(item => mappedFacilities.has(item.coreId)).map(item => `<g fill="#f1f5f9" stroke="#64748b" stroke-width="1.5"><rect x="${item.x}" y="${item.y}" width="${item.width}" height="${item.height}"/><path d="M${item.x} ${item.y}l${item.width} ${item.height}m0 ${-item.height}l${-item.width} ${item.height}"/></g>`).join('')}
    </g>
  </g>`.replace(/^[\t ]+$/gm, '');
}

for (const floor of data.floors) {
  if (!geometry[floor.id]) throw new Error(`Missing floor geometry: ${floor.id}`);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 620"><title>Röntgen building — ${escape(floor.name)}, orientation plan</title>${background(floor)}</svg>\n`;
  const asset = path.join(root, `assets/venue/indoor/${floor.id}.svg`);
  if (checkOnly) {
    if (!fs.existsSync(asset) || fs.readFileSync(asset, 'utf8') !== svg) { console.error(`${path.relative(root, asset)} is out of date`); stale = true; }
  } else {
    fs.mkdirSync(path.dirname(asset), { recursive: true });
    if (!fs.existsSync(asset) || fs.readFileSync(asset, 'utf8') !== svg) fs.writeFileSync(asset, svg);
  }
}

function roomLabel(place) {
  const lines = place.mapLines || (place.name === 'Aula Magna' ? ['Aula', 'Magna'] : [place.name]);
  const programme = programmeName(place);
  const subtitle = lines.includes(programme) ? undefined : programme;
  const labelClass = lines.length === 1 && lines[0] === programme ? 'indoor-programme-label' : 'indoor-room-label';
  const compact = place.compact || (/^AS\d+$/.test(place.name) ? String(Number(place.name.slice(2))) : place.kind === 'space' ? 'Foyer' : place.name);
  return `<g class="indoor-full-label"${place.label?.rotate ? ` transform="rotate(${place.label.rotate})"` : ''}><text class="${labelClass}" text-anchor="middle" dominant-baseline="central" y="${subtitle ? -10 : -(lines.length - 1) * 12}">${lines.map((line, i) => `<tspan x="0" dy="${i ? 24 : 0}">${escape(line)}</tspan>`).join('')}</text>${subtitle ? `<text class="indoor-programme-label" text-anchor="middle" dominant-baseline="central" y="12">${escape(subtitle)}</text>` : ''}</g><g class="indoor-compact-label"><text class="indoor-room-label" text-anchor="middle" dominant-baseline="central">${escape(compact)}</text></g>`;
}

function plan(floor) {
  const base = geometry[floor.id];
  const version = createHash('sha256').update(background(floor)).digest('hex').slice(0, 10);
  const context = [...(base.voids || []), ...(base.landmarks || [])].filter(item => item.label);
  // Room footprints own their clicks even where a nearby facility's enlarged
  // touch target overlaps them. Shared foyer space stays behind the facilities.
  const layer = place => place.kind === 'space' ? 0 : place.kind === 'event' ? 1 : place.shape ? 3 : 2;
  return `<svg class="indoor-plan" viewBox="0 45 1155 565" xmlns="http://www.w3.org/2000/svg" role="group" aria-label="${escape(floor.name)} floor plan">
    <desc>Rooms, shared spaces and facilities. Viale Bligny is on the left; Via Guglielmo Röntgen is along the bottom. All floors share the same orientation. Select a labelled place to highlight it.</desc>
    <image href="assets/venue/indoor/${floor.id}.svg?v=${version}" width="1200" height="620" aria-hidden="true"/>
    <g class="indoor-street-labels" aria-hidden="true">${(data.orientationLabels || []).map(label => `<g transform="translate(${label.x} ${label.y}) rotate(${label.rotate || 0})"><g class="indoor-street-label-content"><text text-anchor="middle">${escape(label.text)}</text></g></g>`).join('')}</g>
    <g class="indoor-context" aria-hidden="true">${context.map(item => `<g transform="translate(${item.x} ${item.y})"><g class="indoor-context-label"><text text-anchor="middle" dominant-baseline="central">${(item.lines || [item.label]).map((line, i, lines) => `<tspan x="0" dy="${i ? 18 : -(lines.length - 1) * 9}">${escape(line)}</tspan>`).join('')}</text></g></g>`).join('')}</g>
    ${[...floor.places].sort((a, b) => layer(a) - layer(b)).map(place => {
      const service = !place.shape;
      const label = service ? (place.marker || place) : (place.label || place);
      return `<g class="indoor-place${zoneClass(place)}${/^AS\d+$/.test(place.name) || place.compact ? ' indoor-code-room' : ''}${service ? ` indoor-service indoor-facility--${place.kind}` : ''}" id="map-place-${place.id}" data-place="${place.id}" aria-label="${escape(placeNames(place).join(' · '))}, ${escape(floor.name)}">
      ${service && place.kind === 'lift' ? (base.lifts || []).filter(lift => lift.coreId === place.id).map(lift => `<rect class="indoor-service-shape" x="${lift.x}" y="${lift.y}" width="${lift.width}" height="${lift.height}"/>`).join('') : ''}
      ${service ? (place.marker ? `<path class="indoor-service-leader" d="M${place.x} ${place.y}L${label.x} ${label.y}"/><circle class="indoor-service-point" cx="${place.x}" cy="${place.y}" r="5"/>` : '') : `<path class="indoor-room-shape indoor-room--${place.kind}" d="${place.shape}"/>`}
      ${(place.stands || []).map(stand => `<g class="indoor-exhibition-stand" aria-hidden="true"><rect x="${stand.x}" y="${stand.y}" width="${stand.width}" height="${stand.height}" rx="2"/><text x="${stand.x + stand.width / 2}" y="${stand.y + stand.height / 2}" text-anchor="middle" dominant-baseline="central">${stand.number}</text></g>`).join('')}
      <g class="indoor-marker" transform="translate(${label.x} ${label.y})" aria-hidden="true"><g class="indoor-marker-content">
      ${service ? `<rect class="indoor-marker-hit" x="-40" y="-40" width="80" height="80"/><rect class="indoor-service-disc" x="-23" y="-23" width="46" height="46" rx="8"/><g class="indoor-service-icon">${icon(place.kind)}</g>${place.mapCaption ? `<text class="indoor-service-caption" text-anchor="middle" y="43">${escape(place.mapCaption)}</text>` : ''}` : roomLabel(place)}
      </g></g></g>`.replace(/^[\t ]+$/gm, '');
    }).join('\n')}
  </svg>`;
}

function floorPanel(floor) {
  const rooms = floor.places.filter(place => place.shape);
  const facilities = floor.places.filter(place => !place.shape);
  const facilityKinds = [...new Set(facilities.map(place => place.kind))];
  const options = places => places.map(place => `<option value="${place.id}">${escape(placeNames(place).join(' · '))}</option>`).join('');
  return `<article class="indoor-floor" id="floor-${floor.id}" data-floor-panel="${floor.id}">
    <div class="indoor-plan-column">
      <div class="indoor-plan-heading"><div><h3>${escape(floor.name)}</h3><p>${escape(floor.summary || floor.description)}</p></div><span class="indoor-building-name">Röntgen building</span></div>
      <div class="indoor-quick-find" hidden><label for="indoor-find-${floor.id}">Find a place</label><select class="select" id="indoor-find-${floor.id}" data-place-select><option value="">Whole floor</option><optgroup label="Rooms &amp; areas">${options(rooms)}</optgroup><optgroup label="Facilities">${options(facilities)}</optgroup></select></div>
      <p class="indoor-pan-hint" id="indoor-pan-${floor.id}">Scroll to explore the floor · Whole floor shows the overview.</p>
      <section class="indoor-viewport" tabindex="0" aria-label="Scrollable ${escape(floor.name)} plan" aria-describedby="indoor-pan-${floor.id}">${plan(floor)}</section>
      ${floor.overviewNote ? `<p class="indoor-code-note">${escape(floor.overviewNote)}</p>` : ''}
      <div class="indoor-plan-footer"><div class="indoor-map-legend">${rooms.some(place => place.kind === 'room') ? '<span class="indoor-map-key indoor-map-key--rooms indoor-area--room"><span aria-hidden="true"></span>Rooms</span>' : ''}${rooms.filter(place => place.kind === 'event').map(place => `<span class="indoor-map-key indoor-map-key--event${zoneClass(place)}"><span aria-hidden="true"></span>${escape(place.name)}</span>`).join('')}${rooms.some(place => place.kind === 'space') ? '<span class="indoor-map-key indoor-map-key--shared indoor-area--foyer"><span aria-hidden="true"></span>Foyers</span>' : ''}<span class="indoor-map-key indoor-map-key--other"><span aria-hidden="true"></span>Other areas</span></div><div class="indoor-facility-legend" role="group" aria-label="Facility symbols">${facilityKinds.map(kind => `<span class="indoor-facility-key indoor-facility--${kind}">${facilityIcon(kind)}${facilityNames[kind]}</span>`).join('')}</div></div>
      <div class="indoor-detail" aria-live="polite" aria-atomic="true"><div><h4 data-detail-name>Floor overview</h4><p class="indoor-detail-meta" data-detail-meta hidden></p><p data-detail-copy>${escape(floor.description)}</p><p class="indoor-selection-note" data-selection-note hidden>Selected on the map</p><div class="indoor-connections" data-floor-links hidden><p data-connection-label></p><div class="indoor-connection-actions" data-connection-actions></div></div></div><button class="btn indoor-copy" type="button" data-copy-place hidden>Copy place link</button></div>
    </div>
    <div class="indoor-directory">
      <div class="indoor-room-directory"><h3>Rooms &amp; areas</h3><div class="indoor-place-list">${rooms.map(choice).join('')}</div></div>
      <div class="indoor-facility-directory"><h3>Facilities</h3><div class="indoor-place-list indoor-facility-list">${facilities.map(choice).join('')}</div></div>
      ${(floor.notes || []).length ? `<div class="indoor-useful-notes"><h3>Useful on this floor</h3>${floor.notes.map(note => `<div class="indoor-useful-note"><p><strong>${escape(note.label)}</strong><span>${escape(note.text)}</span></p>${note.source ? `<a class="link" href="${escape(note.source)}" target="_blank" rel="noopener noreferrer" aria-label="Bocconi guide: ${escape(note.label)} on ${escape(floor.name)}">Bocconi guide<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M14 4h6v6m0-6L10 14M10 4H4v16h16v-6"/></svg></a>` : ''}</div>`).join('')}</div>` : ''}
    </div>
  </article>`.replace(/^[\t ]+$/gm, '');
}

const clientData = { ...data, floors: data.floors.map(floor => ({ ...floor, places: floor.places.map(place => ({ ...place, secondaryLabel: secondaryNames(place).join(' · ') })) })) };
const markup = `${marker}
      <section id="inside-building" class="section-space indoor-section scroll-mt-24" aria-labelledby="indoor-heading">
        <div class="site-container">
          <div class="indoor-intro"><h2 id="indoor-heading" data-index-label="Inside the building" class="section-title">Inside the building</h2><p class="venue-section-lead">Choose a floor, then select a room, area or facility.</p></div>
          <p class="indoor-preview-note">Ground floor: entrance and registration. Level −1: Main Hall, exhibition and catering. Level −2: posters between Aula Magna and the workshop classrooms AS01–AS03.</p>
          <div class="indoor-explorer" data-indoor-map>
            <div class="indoor-toolbar">
              <div class="indoor-floor-picker" role="group" aria-label="Choose a floor">${data.floors.map(floor => `<a class="btn indoor-floor-button" href="#floor-${floor.id}" data-floor-choice="${floor.id}" aria-label="${escape(floor.name)}"><span class="indoor-floor-label">${escape(floor.short)}</span><span class="indoor-floor-compact" aria-hidden="true">${escape(floor.compact || floor.short)}</span></a>`).join('')}</div>
              <div class="indoor-tools" role="group" aria-label="Indoor map controls" hidden><button class="btn" type="button" data-indoor-zoom="out" aria-label="Zoom out of floor plan">−</button><button class="btn" type="button" data-indoor-zoom="in" aria-label="Zoom into floor plan">+</button><button class="btn" type="button" data-indoor-zoom="reset">Whole floor</button><button class="btn indoor-fullscreen" type="button" data-indoor-fullscreen hidden aria-label="View floor plan in full screen"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/></svg></button></div>
            </div>
            ${data.floors.map(floorPanel).join('\n')}
            <p class="indoor-footnote">Simplified orientation plans · Same orientation on every floor · Highlighted places are selections, not live positions.</p>
            <p class="sr-only" data-indoor-status role="status"></p>
          </div>
          <script type="application/json" id="indoor-map-data">${JSON.stringify(clientData).replace(/</g, '\\u003c')}</script>
        </div>
      </section>
      ${endMarker}`;

const target = path.join(root, 'venue.html');
const html = fs.readFileSync(target, 'utf8');
const start = html.indexOf(marker);
const end = html.indexOf(endMarker, start);
if (start < 0 || end < 0) throw new Error('Indoor map markers missing from venue.html');
const output = html.slice(0, start) + markup + html.slice(end + endMarker.length);
if (checkOnly) {
  if (html !== output) { console.error('Indoor map is out of date. Run npm run build:indoor-map.'); stale = true; }
  if (stale) process.exitCode = 1;
} else {
  if (html !== output) fs.writeFileSync(target, output);
  console.log(`Built indoor map: ${data.floors.length} floors.`);
}
