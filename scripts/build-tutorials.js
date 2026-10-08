#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const source = JSON.parse(fs.readFileSync(path.join(root, 'data/tutorials.json'), 'utf8'));
const programmePath = path.join(root, 'data/programme.json');
const storedProgramme = fs.readFileSync(programmePath, 'utf8');
const programme = JSON.parse(storedProgramme);
const destination = path.join(root, 'tutorials.html');
const escape = value => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
const dates = [...new Set(source.tutorials.map(tutorial => tutorial.date))].sort();
const label = date => new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${date}T12:00:00Z`));

function renderTutorial(tutorial) {
  const matches = programme.sessions.filter(session => session.type === 'tutorial' &&
    ['date', 'start', 'end', 'room', 'title'].every(key => session[key] === tutorial[key]));
  if (matches.length !== 1) throw new Error(`Tutorial schedule does not match the programme: ${tutorial.title}`);
  const session = matches[0];
  const names = tutorial.presenters.map(person => person.name);
  const joined = names.length > 1 ? `${names.slice(0, -1).join(', ')} and ${names.at(-1)}` : names[0];
  session.detail = `Presenters: ${joined}.`;
  session.href = `/tutorials/#${tutorial.id}`;
  return `          <article id="${escape(tutorial.id)}" class="grid gap-6 border-t border-base-300 pt-8 scroll-mt-36 lg:grid-cols-[12rem_minmax(0,1fr)] lg:gap-10" data-tutorial>
            <h3 id="${escape(tutorial.id)}-title" data-index-label="${escape(tutorial.indexLabel)}" class="subsection-title max-w-4xl lg:col-span-2">${escape(tutorial.title)}</h3>
            <div>
              <dl class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-1">
                <div>
                  <dt class="text-sm text-base-content/80">Time</dt>
                  <dd class="mt-1 font-semibold tabular-nums"><time datetime="${tutorial.date}T${tutorial.start}:00+01:00">${tutorial.start}</time>–<time datetime="${tutorial.date}T${tutorial.end}:00+01:00">${tutorial.end}</time> CET</dd>
                </div>
                <div>
                  <dt class="text-sm text-base-content/80">Room</dt>
                  <dd class="mt-1 font-semibold">${escape(tutorial.room)}</dd>
                </div>
              </dl>
              <a class="btn mt-5" href="/programme/?day=${tutorial.date}#${session.id}" aria-label="View in programme: ${escape(tutorial.title)}">View in programme <i data-heroicon="arrow-right" class="size-4" aria-hidden="true"></i></a>
            </div>
            <div class="max-w-[72ch]">
              <h4 class="text-lg font-semibold">Presenters</h4>
              <ul class="mt-3 mb-7 list-disc space-y-2 pl-5 leading-relaxed">
${tutorial.presenters.map(person => `                <li><strong>${escape(person.name)}</strong> (${escape(person.affiliation)})</li>`).join('\n')}
              </ul>
              <h4 class="text-lg font-semibold mb-3">Abstract</h4>
              <div class="space-y-4 leading-relaxed">
${tutorial.abstract.map(paragraph => `                <p>${escape(paragraph)}</p>`).join('\n')}
              </div>
            </div>
          </article>`;
}

const main = `    <main id="main-content" tabindex="-1">
      <section id="page-header" class="hero bg-neutral text-neutral-content">
        <div aria-hidden="true" data-animated-hero-overlay class="hero-overlay bg-primary/20"></div>
        <div class="hero-content page-header-content">
          <div class="max-w-3xl">
            <h1 class="page-title">Tutorials</h1>
            <p class="page-lead">Explore the tutorial abstracts and presenters for ICAIF '26, from trustworthy language models to Bayesian calibration and financial agents.</p>
            <p class="mt-5 text-sm leading-relaxed">14–15 November 2026 <span aria-hidden="true">·</span> Room 3 <span aria-hidden="true">·</span> All times CET (UTC+1)</p>
            <a href="/programme/?day=all&amp;type=tutorial" class="link mt-5 inline-flex min-h-11 items-center gap-2 font-semibold">View tutorials in the programme <i data-heroicon="arrow-right" class="size-4" aria-hidden="true"></i></a>
          </div>
        </div>
      </section>
${dates.map(date => `      <section class="section-space ${date === dates[0] ? 'bg-base-100' : 'bg-base-200'}" aria-labelledby="tutorials-${date}">
        <div class="site-container">
          <h2 id="tutorials-${date}" class="section-title mb-8 sm:mb-10">${label(date)}</h2>
          <div class="grid gap-10 sm:gap-14">
${source.tutorials.filter(tutorial => tutorial.date === date).map(renderTutorial).join('\n')}
          </div>
        </div>
      </section>`).join('\n')}
    </main>`;

let html = fs.readFileSync(destination, 'utf8').replace(/    <main id="main-content"[^>]*>[\s\S]*?<\/main>/, main);
const nextProgramme = JSON.stringify(programme, null, 2) + '\n';
if (process.argv.includes('--check')) {
  if (html !== fs.readFileSync(destination, 'utf8') || nextProgramme !== storedProgramme) {
    console.error('Tutorial page or programme presenter metadata is out of date. Run npm run build:tutorials.');
    process.exitCode = 1;
  } else console.log(`Tutorial page matches all ${source.tutorials.length} supplied abstracts and schedules.`);
} else {
  fs.writeFileSync(destination, html);
  if (nextProgramme !== storedProgramme) fs.writeFileSync(programmePath, nextProgramme);
  console.log(`Built ${source.tutorials.length} tutorials across ${dates.length} days.`);
}
