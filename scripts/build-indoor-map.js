#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const data = JSON.parse(fs.readFileSync(path.join(root, 'data/venue-floors.json'), 'utf8'));
const geometry = JSON.parse(fs.readFileSync(path.join(root, 'data/venue-floor-geometry.json'), 'utf8'));
const checkOnly = process.argv.includes('--check');
let stale = false;
const escape = text => String(text).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const marker = '<!-- INDOOR MAP -->';
const endMarker = '<!-- /INDOOR MAP -->';
const icon = kind => ({
  stairs: '<path d="M-12 11h8V3h8v-8h8M-12-1 0-13m-7 0h7v7"/>',
  lift: '<rect x="-12" y="-7" width="24" height="21" rx="2"/><path d="M-8-11l4-4 4 4m2-4 4 4 4-4M-5 5v6m10-6v6"/><circle cx="-5" cy="0" r="2"/><circle cx="5" cy="0" r="2"/>',
  wc: '<text text-anchor="middle" y="6" class="indoor-wc-symbol">WC</text>'
}[kind] || '');
const facilityIcon = kind => `<svg class="indoor-facility-icon" viewBox="-18 -18 36 36" width="24" height="24" aria-hidden="true">${icon(kind)}</svg>`;
const choice = place => `<a class="btn indoor-place-choice${place.shape && place.name.length > 10 ? ' indoor-place-wide' : ''}${!place.shape ? ` indoor-facility-choice indoor-facility--${place.kind}` : ''}" href="#map-place-${place.id}" data-place-choice="${place.id}">${!place.shape ? facilityIcon(place.kind) : ''}<span>${escape(place.name)}</span><svg class="indoor-choice-arrow" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6"/></svg></a>`;

// A deliberately redrawn plan: principal room boundaries and circulation spaces,
// without the source drawings' furniture, hatching, equipment or artwork layer.
for (const floor of data.floors) {
  const base = geometry[floor.id];
  if (!base) throw new Error(`Missing floor geometry: ${floor.id}`);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 620"><title>Röntgen building — ${escape(floor.name)}, schematic layout</title><g stroke="#718898" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"><path d="${base.outline}" fill="#fff"/>${base.spaces.map(d => `<path d="${d}" fill="#f3f7fa"/>`).join('')}<path d="${base.walls}" fill="none"/></g></svg>\n`;
  const asset = path.join(root, `assets/venue/indoor/${floor.id}.svg`);
  if (checkOnly) {
    if (!fs.existsSync(asset) || fs.readFileSync(asset, 'utf8') !== svg) { console.error(`${path.relative(root,asset)} is out of date`); stale = true; }
  } else {
    fs.mkdirSync(path.dirname(asset), { recursive: true });
    if (!fs.existsSync(asset) || fs.readFileSync(asset, 'utf8') !== svg) fs.writeFileSync(asset,svg);
  }
}

function plan(floor) {
  return `<svg class="indoor-plan" viewBox="0 -60 1200 680" xmlns="http://www.w3.org/2000/svg" role="group" aria-label="${escape(floor.name)} floor plan">
    <image href="assets/venue/indoor/${floor.id}.svg" width="1200" height="620" aria-hidden="true"/>
    ${floor.places.map(place => {
      const service = !place.shape;
      const labelWidth = Math.max(76, place.name.length * 11 + 24);
      const label = place.label || place;
      const endX = Math.max(label.x - 88, Math.min(label.x + 88, place.x));
      const endY = Math.max(label.y - 28, Math.min(label.y + 28, place.y));
      return `<g class="indoor-place${service ? ` indoor-service indoor-facility--${place.kind}` : ''}" id="map-place-${place.id}" data-place="${place.id}" aria-label="${escape(place.name)}, ${escape(floor.name)}">
      <title>${escape(place.name)}</title>
      ${service ? `<path class="indoor-service-leader" d="M${place.x} ${place.y}L${endX} ${endY}"/><circle class="indoor-service-point" cx="${place.x}" cy="${place.y}" r="9"/><rect class="indoor-marker-hit" x="${label.x - 96}" y="${label.y - 40}" width="192" height="80"/>` : `<path class="indoor-room-shape" d="${place.shape}"/>`}
      <g class="indoor-marker" transform="translate(${label.x} ${label.y})">
      ${service ? `<rect class="indoor-service-disc" x="-88" y="-28" width="176" height="56" rx="8"/><rect class="indoor-service-tile" x="-88" y="-28" width="56" height="56" rx="8"/><g class="indoor-service-icon" transform="translate(-60 0)">${icon(place.kind)}</g><text class="indoor-service-label" x="-19" y="8">${escape(place.name)}</text>` : `<rect class="indoor-label-bg" x="${-labelWidth / 2}" y="-18" width="${labelWidth}" height="36" rx="5"/><text class="indoor-room-label" text-anchor="middle" y="6">${escape(place.name)}</text>`}
      </g></g>`;
    }).join('\n')}
  </svg>`;
}

function floorPanel(floor) {
  const rooms = floor.places.filter(place => place.shape);
  const facilities = floor.places.filter(place => !place.shape);
  return `<article class="indoor-floor" id="floor-${floor.id}" data-floor-panel="${floor.id}">
    <div class="indoor-plan-column">
      <div class="indoor-plan-heading"><h3>${escape(floor.name)}</h3><span>Röntgen building</span></div>
      <section class="indoor-viewport" tabindex="0" aria-label="Scrollable ${escape(floor.name)} plan">${plan(floor)}</section>
      <div class="indoor-plan-footer"><span class="indoor-map-key"><span aria-hidden="true"></span>Rooms &amp; shared spaces</span><div class="indoor-facility-legend" role="group" aria-label="Facility symbols">${facilities.map(place => `<span class="indoor-facility-key indoor-facility--${place.kind}">${facilityIcon(place.kind)}${escape(place.name)}</span>`).join('')}</div><span>Schematic plan</span></div>
    </div>
    <div class="indoor-directory">
      <div class="indoor-room-directory"><h3>Explore this floor</h3><div class="indoor-place-list">${rooms.map(choice).join('')}</div></div>
      <div class="indoor-facility-directory"><h3>Facilities</h3><div class="indoor-place-list indoor-facility-list">${facilities.map(choice).join('')}</div></div>
      <div class="indoor-detail" aria-live="polite" aria-atomic="true"><p class="indoor-detail-floor">${escape(floor.name)}</p><h4 data-detail-name>${escape(floor.places[0].name)}</h4><p data-detail-copy>${escape(floor.places[0].description)}</p><button class="btn indoor-copy" type="button" data-copy-place hidden>Copy place link</button></div>
    </div>
  </article>`;
}

const markup = `${marker}
      <section id="inside-building" class="section-space indoor-section scroll-mt-24" aria-labelledby="indoor-heading">
        <div class="site-container">
          <div class="indoor-intro"><div><h2 id="indoor-heading" data-index-label="Inside the building" class="section-title">Find your way inside</h2><p>Explore the Röntgen building, one floor at a time.</p></div><span class="badge indoor-preview">Map preview</span></div>
          <p class="indoor-preview-note">Conference room assignments, the arrival entrance and registration point are still being confirmed.</p>
          <div class="indoor-explorer" data-indoor-map>
            <div class="indoor-toolbar">
              <div class="indoor-floor-picker" role="group" aria-label="Choose a floor">${data.floors.map(floor => `<a class="btn indoor-floor-button" href="#floor-${floor.id}" data-floor-choice="${floor.id}"><span class="indoor-floor-number">${floor.number}</span>${escape(floor.short)}</a>`).join('')}</div>
              <div class="indoor-tools" role="group" aria-label="Indoor map controls" hidden><button class="btn" type="button" data-indoor-zoom="out" aria-label="Zoom out of floor plan">−</button><button class="btn" type="button" data-indoor-zoom="in" aria-label="Zoom into floor plan">+</button><button class="btn" type="button" data-indoor-zoom="reset">Reset</button><button class="btn indoor-fullscreen" type="button" data-indoor-fullscreen hidden aria-label="View floor plan in full screen"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/></svg></button></div>
            </div>
            ${data.floors.map(floorPanel).join('\n')}
            <p class="indoor-footnote">Select a room or facility to highlight it. On a phone, swipe the map to explore.</p>
            <p class="sr-only" data-indoor-status role="status"></p>
          </div>
          <script type="application/json" id="indoor-map-data">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>
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
