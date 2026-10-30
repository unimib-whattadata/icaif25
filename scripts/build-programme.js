#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const { attachPapers, validateProgramme } = require('../js/programme.js');
const data = attachPapers(
  JSON.parse(fs.readFileSync(path.join(root, 'data/programme.json'), 'utf8')),
  JSON.parse(fs.readFileSync(path.join(root, 'data/accepted-papers.json'), 'utf8')),
);
data.announcements = JSON.parse(fs.readFileSync(path.join(root, 'data/programme-announcements.json'), 'utf8'));
validateProgramme(data);
const destination = path.join(root, 'programme.html');
const typeLabels = {
  workshop: 'Workshop', tutorial: 'Tutorial', keynote: 'Keynote', panel: 'Panel',
  'oral-session': 'Oral session', 'poster-session': 'Poster session',
  industry: 'Industry', competition: 'Competition', registration: 'Registration',
  break: 'Break', social: 'Social event', banquet: 'Banquet', opening: 'Opening',
  closing: 'Closing', tbc: 'To be confirmed',
};
const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const rooms = ['Main Hall', 'Room 1', 'Room 2', 'Room 3', 'Foyer'];
const venue = JSON.parse(fs.readFileSync(path.join(root, 'data/venue-floors.json'), 'utf8'));
const mappedRooms = new Map();
for (const floor of venue.floors) {
  for (const place of floor.places.filter(place => place.shape)) {
    for (const name of new Set([place.name, place.alias, ...(place.programmeRooms || [])].filter(Boolean))) {
      if (mappedRooms.has(name)) throw new Error(`Ambiguous programme room: ${name}`);
      mappedRooms.set(name, { floor, place });
    }
  }
}
const roomRank = room => rooms.includes(room) ? rooms.indexOf(room) : rooms.length;
const dateLabel = date => new Intl.DateTimeFormat('en', {timeZone:'Europe/Rome', weekday:'long', day:'numeric', month:'long'}).format(new Date(`${date}T12:00:00+01:00`));
const updatedLabel = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Rome', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(`${data.updated}T12:00:00+01:00`));

function renderRoom(room) {
  const target = mappedRooms.get(room);
  if (!target) return escape(room === 'To be confirmed' ? 'Room to be confirmed' : room);
  const { floor, place } = target;
  const name = place.alias ? `${place.name} (${place.alias})` : place.name;
  const href = `/venue/?floor=${encodeURIComponent(floor.id)}&place=${encodeURIComponent(place.id)}#inside-building`;
  return `<a class="link programme-room-link" href="${escape(href)}" aria-label="${escape(room)}: show ${escape(name)} on the ${escape(floor.name)} map">${escape(room)}</a>`;
}

function renderPapers(session) {
  if (!session.papers?.length) return '';
  return `<details class="collapse collapse-arrow programme-papers">
                  <summary class="collapse-title"><span data-programme-papers-label>View ${session.papers.length} papers &amp; authors</span></summary>
                  <div class="collapse-content">
                    <div class="programme-paper-search-tools" data-programme-paper-search-tools hidden>
                      <p data-programme-paper-search-note></p>
                      <button type="button" class="btn programme-all-papers" data-programme-all-papers>Show all papers</button>
                    </div>
                    <ol class="programme-paper-list">
${session.papers.map(paper => `                      <li data-programme-paper="${paper.id}">
                        <span class="programme-paper-id">Paper ${paper.id}</span>
                        <div class="programme-paper-copy">
                          <a class="link programme-paper-title" href="/accepted-papers/#paper-${paper.id}">${escape(paper.title)}</a>
                          <p class="programme-paper-authors">${escape(paper.authors)}</p>
                        </div>
                      </li>`).join('\n')}
                    </ol>
                  </div>
                </details>`;
}

function renderSession(session) {
  const title = session.href
    ? `<a class="link" href="${escape(session.href)}">${escape(session.title)}</a>`
    : escape(session.title);
  const pendingMessage = session.type === 'oral-session' && /^Oral Session \d+$/.test(session.title)
    ? 'Session themes, papers and authors to be announced.'
    : session.pending && !/to be confirmed/i.test(session.detail) ? 'Details to be confirmed' : '';
  return `              <article id="${escape(session.id)}" class="programme-session" data-programme-session="${escape(session.id)}" data-type="${escape(session.type)}">
                <div class="programme-session-overview">
                <div class="programme-session-meta">
                  <p class="programme-room">${renderRoom(session.room)}</p>
                  <span class="badge programme-type">${escape(typeLabels[session.type])}</span>
                </div>
                <div class="programme-session-body">
                <h4 class="programme-session-title">${title}</h4>
                <p class="programme-session-time"><time datetime="${session.date}T${session.start}:00+01:00">${session.start}</time>–<time datetime="${session.date}T${session.end}:00+01:00">${session.end}</time> CET</p>
                ${session.detail && !session.papers?.length ? session.detail.split('\n').map(line => `<p class="programme-detail">${escape(line)}</p>`).join('\n                ') : ''}
                ${pendingMessage ? `<p class="programme-pending">${pendingMessage}</p>` : ''}
                <p class="programme-conflict" data-programme-conflict hidden>Overlaps with another saved session.</p>
                </div>
                <div class="programme-session-actions">
                  <button type="button" class="btn programme-save" data-programme-save="${escape(session.id)}" aria-label="Add to My agenda: ${escape(session.title)} on ${dateLabel(session.date)} at ${session.start}" aria-pressed="false" hidden><span data-agenda-add-icon aria-hidden="true"><i data-heroicon="calendar-clock" class="size-4" aria-hidden="true"></i></span><span data-agenda-added-icon aria-hidden="true" hidden><i data-heroicon="check" class="size-4" aria-hidden="true"></i></span><span data-save-label>Add to My agenda</span></button>
                </div>
                </div>
                ${renderPapers(session)}
              </article>`;
}

function renderAnnouncement(announcement) {
  const title = announcement.href
    ? `<a class="link" href="${escape(announcement.href)}">${escape(announcement.title)}</a>`
    : escape(announcement.title);
  return `            <article id="${escape(announcement.id)}" class="programme-session" data-programme-announcement="${escape(announcement.id)}" data-type="${escape(announcement.type)}">
              <div class="programme-session-meta">
                <p class="programme-room">${renderRoom(announcement.room)}</p>
                <span class="badge programme-type">${escape(typeLabels[announcement.type])}</span>
              </div>
              <h3 class="programme-session-title">${title}</h3>
              <p class="programme-session-time">${escape(announcement.timeLabel)}</p>
              <p class="programme-detail">${escape(announcement.detail)}</p>
            </article>`;
}

const printHeader = `    <div class="programme-print-day-header">
      <div class="programme-print-masthead" role="group" aria-label="ICAIF conference print header">
        <div class="programme-print-brand">
          <img src="/img/logo.svg" alt="" width="2401" height="1482">
          <div>
            <p class="programme-print-wordmark">ICAIF ’26 <span>Milan, Italy</span></p>
            <p>7th ACM International Conference on AI in Finance</p>
          </div>
        </div>
        <div class="programme-print-universities" role="group" aria-label="Universities">
          <img src="/img/loghi/bocconi.svg" alt="Bocconi University" width="320" height="112">
          <img src="/img/loghi/unimib.svg" alt="University of Milano-Bicocca" width="1027" height="1108">
          <img src="/img/loghi/politecnico.svg" alt="Politecnico di Milano" width="282" height="91">
          <img src="/img/loghi/unimi.png" alt="Università degli Studi di Milano — La Statale" width="356" height="122">
        </div>
      </div>
      <div class="programme-print-title">
        <p data-programme-print-title>Conference programme</p>
        <p>14–17 November 2026 · Milan</p>
      </div>
      <p class="programme-print-note">Preliminary schedule · updated ${updatedLabel} · All times CET (UTC+1) · Subject to change</p>
      <p class="programme-print-filters" data-programme-print-filters></p>
    </div>`;

function renderDay(day) {
  const sessions = data.sessions.filter(session => session.date === day.date);
  const announcements = data.announcements.filter(announcement => announcement.date === day.date);
  const starts = [...new Set(sessions.map(session => session.start))].sort();
  const blocks = starts.map(start => {
    const current = sessions.filter(session => session.start === start).sort((a,b) => roomRank(a.room)-roomRank(b.room));
    return `          <li id="programme-slot-${day.date}-${start.replace(':','')}" class="programme-slot" data-programme-slot data-programme-print-columns="${Math.min(current.length, 4)}" data-timeline-day="${day.date}" data-timeline-time="${start}">
            <div class="timeline-start programme-slot-heading">
              <h3 tabindex="-1"><time datetime="${day.date}T${start}:00+01:00">${start}</time></h3>
              <p>${current.length > 1 ? `${current.length} parallel sessions` : 'Scheduled session'}</p>
            </div>
            <div class="timeline-middle" aria-hidden="true"><span class="programme-timeline-point"></span></div>
            <div class="timeline-end programme-sessions">
${current.map(renderSession).join('\n')}
            </div>
            <hr aria-hidden="true">
          </li>`;
  });
  return `        <section class="programme-day" data-programme-day="${day.date}" aria-labelledby="programme-${day.date}">
${printHeader}
          <div class="programme-day-heading">
            <h2 id="programme-${day.date}">${dateLabel(day.date)}</h2>
            <p>${escape(day.subtitle)}</p>
          </div>
${announcements.length ? `          <div class="programme-sessions mb-6" data-programme-announcements>
${announcements.map(renderAnnouncement).join('\n')}
          </div>` : ''}
          <ol class="timeline timeline-vertical programme-timeline">
${blocks.join('\n')}
          </ol>
        </section>`;
}

const programmeEntries = [...data.sessions, ...data.announcements];
const extraRooms = [...new Set(programmeEntries.map(session=>session.room))].filter(room=>!rooms.includes(room)).sort();
const roomOptions = [...rooms, ...extraRooms].map(room=>`<option value="${escape(room)}">${escape(room)}</option>`).join('\n');
const typeOptions = Object.entries(typeLabels).filter(([type])=>programmeEntries.some(session=>session.type===type)).map(([type,label])=>`<option value="${type}">${label}</option>`).join('\n');
const dayButtons = data.days.map(day=>`          <button type="button" class="btn programme-date" data-programme-date="${day.date}" aria-pressed="false"><span>${day.label.slice(0,3)}</span><strong>${Number(day.date.slice(-2))} Nov</strong></button>`).join('\n');
const json = JSON.stringify(data).replace(/</g,'\\u003c');
const main = `    <main id="main-content" tabindex="-1">
      <div class="programme-print-empty-header">${printHeader}</div>
      <section id="page-header" class="hero bg-neutral text-neutral-content">
        <div aria-hidden="true" data-animated-hero-overlay class="hero-overlay bg-primary/20"></div>
        <div class="hero-content page-header-content programme-header">
          <div class="max-w-3xl">
            <h1 class="page-title">Conference programme</h1>
            <p class="programme-header-meta">14–17 November 2026 <span aria-hidden="true">·</span> All times CET (UTC+1)</p>
          </div>
        </div>
      </section>

      <div class="programme-tools" data-programme-controls hidden>
        <div class="programme-datebar">
          <div class="site-container programme-datebar-inner">
            <div class="programme-dates" role="group" aria-label="Choose a programme day">
${dayButtons}
              <button type="button" class="btn programme-date programme-all-dates" data-programme-date="all" aria-pressed="false">All days</button>
            </div>
          </div>
        </div>
        <div class="site-container programme-filter-container">
          <form data-programme-filters class="programme-filters" role="search" aria-label="Filter the conference programme">
            <div class="programme-search-field">
              <label for="programme-search">Search the programme</label>
              <input id="programme-search" type="search" class="input w-full" placeholder="Paper ID, title or author…" autocomplete="off" data-programme-search>
            </div>
            <button type="button" class="btn programme-filter-toggle" aria-controls="programme-extra-filters" aria-expanded="false" data-programme-filter-toggle>Filters <span class="badge" data-programme-filter-count hidden>0</span></button>
            <div id="programme-extra-filters" class="programme-extra-filters" data-programme-extra-filters>
              <div>
              <label for="programme-type">Session type</label>
              <select id="programme-type" class="select w-full" data-programme-type>
                <option value="all">All types</option>
${typeOptions}
              </select>
              </div>
              <div>
              <label for="programme-room">Room or venue</label>
              <select id="programme-room" class="select w-full" data-programme-room>
                <option value="all">All locations</option>
${roomOptions}
              </select>
              </div>
            </div>
            <button type="submit" class="sr-only" tabindex="-1">Search programme</button>
          </form>
        </div>
      </div>

      <div id="programme-timeline" class="site-container programme-content">
        <noscript><p class="programme-source-note">The complete programme is shown below. Enable JavaScript to use search, filters and a personal agenda.</p></noscript>
        <div class="programme-results-toolbar">
          <div>
            <p data-programme-status role="status" aria-live="polite" aria-atomic="true" class="programme-status">${data.sessions.length} scheduled sessions${data.announcements.length ? ` and ${data.announcements.length} announced keynotes` : ''} across four days</p>
            <p class="programme-source-note">Preliminary · updated ${updatedLabel}</p>
          </div>
          <div class="programme-actions" data-programme-actions hidden>
            <button type="button" class="btn programme-agenda-button" aria-pressed="false" data-programme-saved-only>My agenda <span class="badge" data-saved-count>0</span></button>
            <details class="dropdown dropdown-end programme-utilities" data-programme-utilities>
              <summary class="btn">Tools</summary>
              <div class="dropdown-content programme-utility-menu">
                <button type="button" class="btn" data-programme-export aria-describedby="programme-storage-note" disabled><i data-heroicon="download" class="size-4" aria-hidden="true"></i> Export calendar</button>
                <button type="button" class="btn" data-programme-print>Print</button>
                <button type="button" class="btn programme-reset" data-programme-reset>Clear filters</button>
                <p id="programme-storage-note" class="programme-storage-note" data-programme-storage-note hidden>Save sessions to build your agenda. Your choices stay in this browser.</p>
              </div>
            </details>
          </div>
        </div>
        <p class="sr-only" data-programme-feedback aria-live="polite" aria-atomic="true"></p>
        <div class="programme-empty" data-programme-empty hidden>
          <h2 tabindex="-1" data-programme-empty-title>No matching sessions</h2>
          <p data-programme-empty-description>Try another day, room or search term.</p>
          <div class="programme-empty-actions">
            <button type="button" class="btn" data-programme-all-days>Search all days</button>
            <button type="button" class="btn" data-programme-reset data-programme-empty-reset>Clear filters</button>
          </div>
        </div>
      <nav class="programme-navigator" aria-label="Timeline navigator" aria-controls="programme-timeline" data-programme-timeline data-programme-controls hidden>
        <label class="sr-only" for="programme-timeline-day">Choose a programme day</label>
        <select id="programme-timeline-day" class="select programme-navigator-day" data-timeline-day>
${data.days.map(day=>`          <option value="${day.date}">${day.label.slice(0,3)} ${Number(day.date.slice(-2))} Nov</option>`).join('\n')}
          <option value="all">All days</option>
        </select>
        <div class="programme-navigator-stepper">
          <button type="button" class="btn" aria-label="Previous time slot" data-timeline-previous><i data-heroicon="arrow-left" class="size-4" aria-hidden="true"></i></button>
          <p class="programme-navigator-time"><span data-timeline-time>08:15</span> <small>CET</small></p>
          <button type="button" class="btn programme-navigator-picker" aria-haspopup="dialog" aria-controls="programme-time-picker" aria-expanded="false" data-timeline-open>
            <span>Time</span>
            <strong><span class="sr-only" data-timeline-mobile-day>Sat 14 Nov</span><span data-timeline-mobile-time>08:15</span></strong>
          </button>
          <button type="button" class="btn" aria-label="Next time slot" data-timeline-next><i data-heroicon="arrow-right" class="size-4" aria-hidden="true"></i></button>
        </div>
        <div class="programme-navigator-slider">
          <label class="sr-only" for="programme-timeline-position">Scroll the timeline</label>
          <input id="programme-timeline-position" type="range" class="range" min="0" max="1" value="0" step="1" aria-controls="programme-timeline" data-timeline-range>
          <div class="programme-navigator-limits" aria-hidden="true"><span data-timeline-start>08:15</span><span data-timeline-end>16:30</span></div>
        </div>
        <button type="button" class="btn programme-agenda-button programme-navigator-agenda" aria-pressed="false" data-programme-saved-only data-timeline-agenda>My agenda <span class="badge" data-saved-count>0</span></button>
      </nav>
${data.days.map(renderDay).join('\n')}
        <p class="programme-closing-note">Looking for workshop calls and organizing teams? <a class="link" href="/workshop/">Explore the workshops</a>.</p>
      </div>
      <dialog id="programme-time-picker" class="modal modal-bottom sm:modal-middle programme-time-picker" aria-labelledby="programme-time-picker-title" aria-describedby="programme-time-picker-description" data-programme-controls hidden>
        <div class="modal-box programme-time-picker-box">
          <div class="programme-time-picker-header">
            <h2 id="programme-time-picker-title">Choose a time</h2>
            <form method="dialog"><button type="submit" class="btn" autofocus>Close</button></form>
          </div>
          <div class="programme-time-picker-content">
            <p id="programme-time-picker-description">Choose a day and time, then confirm to move the programme. Times follow your current filters.</p>
            <button type="button" class="btn programme-navigator-return" data-timeline-return hidden><i data-heroicon="arrow-left" class="size-4" aria-hidden="true"></i>Back to previous position</button>
            <fieldset data-timeline-picker-day-field>
              <legend>Day</legend>
              <div class="programme-time-picker-days" data-timeline-picker-days>
${data.days.map(day=>`                <button type="button" class="btn" data-timeline-picker-day="${day.date}" aria-pressed="false"><span>${day.label.slice(0,3)} ${Number(day.date.slice(-2))}</span><span>Nov</span></button>`).join('\n')}
              </div>
            </fieldset>
            <fieldset>
              <legend>Time (CET)</legend>
              <div class="programme-time-picker-times" data-timeline-picker-times></div>
            </fieldset>
            <ul class="programme-time-picker-preview" aria-live="polite" data-timeline-picker-preview></ul>
          </div>
          <div class="modal-action programme-time-picker-action">
            <button type="button" class="btn w-full" data-timeline-go>Go to time</button>
          </div>
        </div>
        <form method="dialog" class="modal-backdrop"><button type="submit">Close time picker</button></form>
      </dialog>
      <script id="programme-data" type="application/json">${json}</script>
    </main>`;

let html;
if (fs.existsSync(destination)) {
  html = fs.readFileSync(destination,'utf8');
} else {
  html = fs.readFileSync(path.join(root,'registration.html'),'utf8')
    .replaceAll("Registration | ICAIF '26 Milan", "Programme | ICAIF '26 Milan")
    .replaceAll("Registration information, travel grants, deadlines, entitlements, and fees for ICAIF '26 in Milan, Italy.", "Explore the ICAIF '26 conference programme, November 14–17, 2026. Browse sessions by day, room and type, and save a personal agenda.")
    .replaceAll('https://icaif2026.org/registration/', 'https://icaif2026.org/programme/')
    .replace('data-page="registration"','data-page="programme"')
    .replaceAll('"name": "Registration",','"name": "Programme",')
    .replaceAll('"dateModified": "2026-10-01"','"dateModified": "2026-10-08"')
    .replace(/\sclass="menu-active"/g,'').replace(/\saria-current="page"/g,'')
    .replace(/\n\s*<link[^>]*registration-timeline\.css[^>]*>/,'')
    .replace(/\n\s*<script[^>]*registration-timeline\.js[^>]*><\/script>/,'')
    .replace('</head>','    <link rel="stylesheet" href="css/programme.css?v=2026100810">\n    <script src="js/programme.js?v=2026100810" defer></script>\n  </head>');
}
html = html.replace(/    <main id="main-content"[^>]*>[\s\S]*?<\/main>/,main).replace(/[\t ]+$/gm,'');
// Keep the dedicated print sheet after the screen CSS and version it independently.
html = html.replace(/css\/programme\.css\?v=\d+/g, 'css/programme.css?v=2026103014')
  .replace(/css\/tailwind\.min\.css\?v=\d+/g, 'css/tailwind.min.css?v=2026103008')
  .replace(/js\/programme\.js\?v=\d+/g, 'js/programme.js?v=2026103012');
html = html.replace(/\n\s*<link[^>]*css\/programme-print\.css[^>]*>/, '');
html = html.replace('</head>', '    <link rel="stylesheet" href="css/programme-print.css?v=2026103012">\n  </head>');
if (process.argv.includes('--check')) {
  if (!fs.existsSync(destination) || fs.readFileSync(destination,'utf8') !== html) {
    console.error('Programme page is out of date. Run npm run build:programme.');
    process.exitCode = 1;
  } else {
    console.log(`Programme page matches all ${data.sessions.length} source sessions.`);
  }
} else {
  fs.writeFileSync(destination,html);
  console.log(`Built programme with ${data.sessions.length} sessions across ${data.days.length} days.`);
}
