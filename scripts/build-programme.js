#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const data = JSON.parse(fs.readFileSync(path.join(root, 'data/programme.json'), 'utf8'));
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
const roomRank = room => rooms.includes(room) ? rooms.indexOf(room) : rooms.length;
const dateLabel = date => new Intl.DateTimeFormat('en', {timeZone:'Europe/Rome', weekday:'long', day:'numeric', month:'long'}).format(new Date(`${date}T12:00:00+01:00`));

function renderSession(session) {
  const title = session.href
    ? `<a class="link" href="${escape(session.href)}">${escape(session.title)}</a>`
    : escape(session.title);
  return `              <article id="${escape(session.id)}" class="programme-session" data-programme-session="${escape(session.id)}" data-type="${escape(session.type)}">
                <div class="programme-session-meta">
                  <p class="programme-room">${escape(session.room)}</p>
                  <span class="badge programme-type">${escape(typeLabels[session.type])}</span>
                </div>
                <h4 class="programme-session-title">${title}</h4>
                <p class="programme-session-time"><time datetime="${session.date}T${session.start}:00+01:00">${session.start}</time>–<time datetime="${session.date}T${session.end}:00+01:00">${session.end}</time> CET</p>
                ${session.detail ? `<p class="programme-detail">${escape(session.detail)}</p>` : ''}
                ${session.pending ? '<p class="programme-pending">Details to be confirmed</p>' : ''}
                <p class="programme-conflict" data-programme-conflict hidden>Overlaps with another saved session.</p>
                <div class="programme-session-actions">
                  <button type="button" class="btn programme-save" data-programme-save="${escape(session.id)}" aria-label="Add to My agenda: ${escape(session.title)} on ${dateLabel(session.date)} at ${session.start}" aria-pressed="false" hidden><span data-agenda-add-icon aria-hidden="true"><i data-heroicon="calendar-clock" class="size-4" aria-hidden="true"></i></span><span data-agenda-added-icon aria-hidden="true" hidden><i data-heroicon="check" class="size-4" aria-hidden="true"></i></span><span data-save-label>Add to My agenda</span></button>
                </div>
              </article>`;
}

function renderDay(day) {
  const sessions = data.sessions.filter(session => session.date === day.date);
  const starts = [...new Set(sessions.map(session => session.start))].sort();
  const blocks = starts.map(start => {
    const current = sessions.filter(session => session.start === start).sort((a,b) => roomRank(a.room)-roomRank(b.room));
    return `          <li id="programme-slot-${day.date}-${start.replace(':','')}" class="programme-slot" data-programme-slot data-timeline-day="${day.date}" data-timeline-time="${start}">
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
          <div class="programme-day-heading">
            <h2 id="programme-${day.date}">${dateLabel(day.date)}</h2>
            <p>${escape(day.subtitle)}</p>
          </div>
          <ol class="timeline timeline-vertical programme-timeline">
${blocks.join('\n')}
          </ol>
        </section>`;
}

const extraRooms = [...new Set(data.sessions.map(session=>session.room))].filter(room=>!rooms.includes(room)).sort();
const roomOptions = [...rooms, ...extraRooms].map(room=>`<option value="${escape(room)}">${escape(room)}</option>`).join('\n');
const typeOptions = Object.entries(typeLabels).filter(([type])=>data.sessions.some(session=>session.type===type)).map(([type,label])=>`<option value="${type}">${label}</option>`).join('\n');
const dayButtons = data.days.map(day=>`          <button type="button" class="btn programme-date" data-programme-date="${day.date}" aria-pressed="false"><span>${day.label.slice(0,3)}</span><strong>${Number(day.date.slice(-2))} Nov</strong></button>`).join('\n');
const json = JSON.stringify(data).replace(/</g,'\\u003c');
const main = `    <main id="main-content" tabindex="-1">
      <section id="page-header" class="hero bg-neutral text-neutral-content">
        <div aria-hidden="true" data-animated-hero-overlay class="hero-overlay bg-primary/20"></div>
        <div class="hero-content page-header-content programme-header">
          <div class="max-w-3xl">
            <h1 class="page-title">Conference programme</h1>
            <p class="page-lead">Four days of ideas, conversations and research in Milan.<br>Find your sessions and build your own ICAIF '26 agenda.</p>
            <p class="programme-header-meta">14–17 November 2026 <span aria-hidden="true">·</span> All times CET (UTC+1)</p>
          </div>
          <span class="badge programme-preliminary">Preliminary programme</span>
        </div>
      </section>

      <div class="programme-tools" data-programme-controls hidden>
        <div class="programme-datebar">
          <div class="site-container programme-datebar-inner">
            <div class="programme-dates" role="group" aria-label="Choose a programme day">
${dayButtons}
              <button type="button" class="btn programme-date programme-all-dates" data-programme-date="all" aria-pressed="false">All days</button>
            </div>
            <p class="programme-timezone">Milan time · CET (UTC+1)</p>
          </div>
        </div>
        <div class="site-container programme-filter-container">
          <form data-programme-filters class="programme-filters" role="search" aria-label="Filter the conference programme">
            <div class="programme-search-field">
              <label for="programme-search">Search the programme</label>
              <input id="programme-search" type="search" class="input w-full" placeholder="Session title, topic or speaker…" autocomplete="off" data-programme-search>
            </div>
            <div>
              <label for="programme-type">Session type</label>
              <select id="programme-type" class="select w-full" data-programme-type>
                <option value="all">All session types</option>
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
            <button type="submit" class="sr-only" tabindex="-1">Search programme</button>
          </form>
        </div>
      </div>

      <div id="programme-timeline" class="site-container programme-content">
        <noscript><p class="programme-source-note">The complete programme is shown below. Enable JavaScript to use search, filters and a personal agenda.</p></noscript>
        <div class="programme-results-toolbar">
          <div>
            <p data-programme-status role="status" aria-live="polite" aria-atomic="true" class="programme-status">${data.sessions.length} sessions across four days</p>
            <p class="programme-source-note">Preliminary schedule · updated 8 October 2026 · subject to change</p>
          </div>
          <div class="programme-actions" data-programme-actions hidden>
            <button type="button" class="btn programme-agenda-button" aria-pressed="false" data-programme-saved-only>My agenda <span class="badge" data-saved-count>0</span></button>
            <button type="button" class="btn" data-programme-export aria-describedby="programme-storage-note" disabled><i data-heroicon="download" class="size-4" aria-hidden="true"></i> Export calendar</button>
            <button type="button" class="btn" data-programme-print>Print</button>
            <button type="button" class="btn programme-reset" data-programme-reset>Reset filters</button>
          </div>
        </div>
        <p id="programme-storage-note" class="programme-storage-note" data-programme-storage-note hidden>Add sessions to My agenda, then review your choices or export your calendar. Your agenda is kept in this browser.</p>
        <p class="sr-only" data-programme-feedback aria-live="polite" aria-atomic="true"></p>
        <div class="programme-empty" data-programme-empty hidden>
          <h2>No sessions match your view</h2>
          <p data-programme-empty-description>Try another day, room or search term.</p>
          <div class="programme-empty-actions">
            <button type="button" class="btn" data-programme-all-days>Search all days</button>
            <button type="button" class="btn" data-programme-reset>Reset filters</button>
          </div>
        </div>
${data.days.map(renderDay).join('\n')}
        <p class="programme-closing-note">Looking for workshop calls and organizing teams? <a class="link" href="/workshop/">Explore the workshops</a>.</p>
      </div>
      <nav class="programme-navigator" aria-label="Timeline navigator" aria-controls="programme-timeline" data-programme-timeline data-programme-controls hidden>
        <div class="programme-navigator-title">
          <p>Timeline</p>
          <span data-timeline-position aria-hidden="true">1 / ${new Set(data.sessions.map(session=>`${session.date}|${session.start}`)).size}</span>
        </div>
        <label class="sr-only" for="programme-timeline-day">Timeline day</label>
        <select id="programme-timeline-day" class="select programme-navigator-day" data-timeline-day>
${data.days.map(day=>`          <option value="${day.date}">${day.label.slice(0,3)} ${Number(day.date.slice(-2))} November</option>`).join('\n')}
        </select>
        <div class="programme-navigator-stepper">
          <button type="button" class="btn" aria-label="Previous time slot" data-timeline-previous><i data-heroicon="arrow-left" class="size-4" aria-hidden="true"></i></button>
          <p class="programme-navigator-time"><span data-timeline-time>08:15</span> <small>CET</small></p>
          <button type="button" class="btn" aria-label="Next time slot" data-timeline-next><i data-heroicon="arrow-right" class="size-4" aria-hidden="true"></i></button>
        </div>
        <div class="programme-navigator-slider">
          <label class="sr-only" for="programme-timeline-position">Scroll the timeline</label>
          <input id="programme-timeline-position" type="range" class="range" min="0" max="1" value="0" step="1" aria-controls="programme-timeline" data-timeline-range>
          <div class="programme-navigator-limits" aria-hidden="true"><span data-timeline-start>08:15</span><span data-timeline-end>16:30</span></div>
        </div>
        <p class="programme-navigator-empty" data-timeline-empty hidden>No sessions match. Adjust the filters above.</p>
      </nav>
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
    .replace('</head>','    <link rel="stylesheet" href="css/programme.css?v=2026100804">\n    <script src="js/programme.js?v=2026100805" defer></script>\n  </head>');
}
html = html.replace(/    <main id="main-content"[^>]*>[\s\S]*?<\/main>/,main).replace(/[\t ]+$/gm,'');
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
