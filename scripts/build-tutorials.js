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
  return `          <article id="${escape(tutorial.id)}" class="card scroll-mt-24 bg-base-100" data-tutorial>
            <div class="card-body">
              <div class="flex flex-wrap items-center gap-2 mb-5">
                <span class="badge">${label(tutorial.date)}</span>
                <span class="badge tabular-nums"><time datetime="${tutorial.date}T${tutorial.start}:00+01:00">${tutorial.start}</time>–<time datetime="${tutorial.date}T${tutorial.end}:00+01:00">${tutorial.end}</time> CET</span>
                <span class="badge">${escape(tutorial.room)}</span>
              </div>
              <h3 id="${escape(tutorial.id)}-title" data-index-label="${escape(tutorial.indexLabel)}" class="card-title">${escape(tutorial.title)}</h3>
              <div class="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_22rem] gap-7 lg:gap-10">
                <div class="max-w-[72ch] space-y-4 text-base-content/80 leading-relaxed">
                  <h4 class="font-semibold text-base-content">Abstract</h4>
${tutorial.abstract.map(paragraph => `                  <p>${escape(paragraph)}</p>`).join('\n')}
                </div>
                <div class="card bg-base-200">
                  <div class="card-body">
                    <h4 class="card-title"><i data-heroicon="users" class="size-4" aria-hidden="true"></i> Presenters</h4>
                    <ul class="list">
${tutorial.presenters.map(person => `                      <li class="list-row">
                        <p class="list-col-grow font-semibold">${escape(person.name)}</p>
                        <p class="list-col-wrap text-xs text-base-content/70">${escape(person.affiliation)}</p>
                      </li>`).join('\n')}
                    </ul>
                  </div>
                </div>
              </div>
              <div class="card-actions mt-6">
                <a class="btn" href="/programme/?day=${tutorial.date}#${session.id}" aria-label="View in programme: ${escape(tutorial.title)}">View in programme <i data-heroicon="arrow-right" class="size-4" aria-hidden="true"></i></a>
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
          </div>
        </div>
      </section>
      <section class="section-space bg-base-200" aria-labelledby="accepted-tutorials-heading">
        <div class="site-container">
          <div class="max-w-3xl mb-8 sm:mb-12">
            <h2 id="accepted-tutorials-heading" class="section-title text-base-content mb-4 sm:mb-6">Accepted Tutorials</h2>
            <p class="text-base sm:text-lg text-base-content/80 leading-relaxed">14–15 November 2026 <span aria-hidden="true">·</span> Room 3 <span aria-hidden="true">·</span> All times CET (UTC+1)</p>
            <a href="/programme/?day=all&amp;type=tutorial" class="link mt-3 inline-flex min-h-11 items-center gap-2 font-semibold">View tutorials in the programme <i data-heroicon="arrow-right" class="size-4" aria-hidden="true"></i></a>
          </div>
          <div class="grid gap-5 sm:gap-6">
${source.tutorials.map(renderTutorial).join('\n')}
          </div>
        </div>
      </section>
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
  console.log(`Built ${source.tutorials.length} tutorials in workshop-style cards.`);
}
