#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const escape = value => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));

function validateAcceptedPapers(source) {
  const categories = ['oral', 'poster', 'proceedings-only'];
  if (!/^\d{4}-\d{2}-\d{2}$/.test(source.updated) || source.groups?.length !== 3) throw new Error('Expected a publication date and three paper groups.');
  const ids = new Set();
  source.groups.forEach((group, index) => {
    if (group.id !== categories[index] || !group.label || !group.papers?.length) throw new Error('Invalid paper group.');
    for (const paper of group.papers) {
      if (Object.keys(paper).sort().join(',') !== 'authors,id,title') throw new Error('Only public paper fields may be exported.');
      if (!Number.isSafeInteger(paper.id) || paper.id <= 0 || ids.has(paper.id)) throw new Error('Invalid or duplicate paper ID.');
      if (typeof paper.title !== 'string' || !paper.title.trim() || typeof paper.authors !== 'string' || !paper.authors.trim()) throw new Error('Missing paper title or authors.');
      ids.add(paper.id);
    }
  });
  return ids.size;
}

function renderAcceptedPapers(source) {
  const total = validateAcceptedPapers(source);
  const updated = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${source.updated}T12:00:00Z`));
  return `    <main id="main-content" tabindex="-1">
      <section id="page-header" class="hero bg-neutral text-neutral-content">
        <div aria-hidden="true" data-animated-hero-overlay class="hero-overlay bg-primary/20"></div>
        <div class="hero-content page-header-content">
          <div class="max-w-3xl">
            <h1 class="page-title">Accepted Papers</h1>
            <p class="page-lead">Browse the ${total} accepted main conference papers, grouped by oral presentation, poster presentation and proceedings only.</p>
          </div>
        </div>
      </section>
      <div class="site-container section-space">
        <div class="max-w-3xl space-y-4">
          <p class="text-base sm:text-lg leading-relaxed">Authors will add a link to their presentation on the Whova platform.</p>
          <p class="text-sm text-base-content/70">Updated <time datetime="${source.updated}">${updated}</time>. Paper IDs, titles, authors and affiliations are listed below.</p>
        </div>
        <div id="paper-search-panel" class="my-8 max-w-2xl" hidden>
          <label for="paper-search" class="mb-2 block font-semibold">Search accepted papers</label>
          <input id="paper-search" class="input min-h-11 w-full text-base" type="search" placeholder="ID, title, author, affiliation" aria-describedby="paper-search-status">
          <p id="paper-search-status" class="mt-2 text-sm text-base-content/70" role="status" aria-live="polite" aria-atomic="true">${total} papers</p>
        </div>
        <div class="document-sections mt-10">
${source.groups.map(group => `          <section aria-labelledby="${group.id}" data-paper-group>
            <h2 id="${group.id}" class="section-title mb-4 sm:mb-6" data-index-label="${escape(group.label)}">${escape(group.label)}</h2>
            <p class="mb-2 text-sm text-base-content/70" data-group-count>${group.papers.length} papers</p>
            <p data-group-empty hidden>No matching papers in this group. Try another title, author or paper ID.</p>
            <ul class="list">
${group.papers.map(paper => `              <li id="paper-${paper.id}" class="list-row px-0 py-6 scroll-mt-36" data-paper>
                <div class="list-col-grow flex flex-col sm:flex-row gap-x-5 gap-y-1 min-w-0">
                  <a href="#paper-${paper.id}" class="link inline-flex min-h-11 items-center self-start whitespace-nowrap text-sm tabular-nums sm:w-16 sm:shrink-0" aria-label="Paper ${paper.id}">#${paper.id}</a>
                  <div class="min-w-0">
                    <h3 class="max-w-[90ch] text-base sm:text-lg font-semibold leading-snug">${escape(paper.title)}</h3>
                    <p class="mt-2 max-w-[90ch] text-sm sm:text-base leading-relaxed text-base-content/80">${escape(paper.authors)}</p>
                  </div>
                </div>
              </li>`).join('\n')}
            </ul>
          </section>`).join('\n')}
        </div>
      </div>
    </main>`;
}

if (require.main === module) {
  const source = JSON.parse(fs.readFileSync(path.join(root, 'data/accepted-papers.json'), 'utf8'));
  const destination = path.join(root, 'accepted-papers.html');
  const stored = fs.readFileSync(destination, 'utf8');
  const next = stored.replace(/    <main id="main-content"[^>]*>[\s\S]*?<\/main>/, renderAcceptedPapers(source));
  if (process.argv.includes('--check')) {
    if (next !== stored) {
      console.error('Accepted papers page is out of date. Run npm run build:accepted-papers.');
      process.exitCode = 1;
    } else console.log('Accepted papers page matches the publication data.');
  } else {
    fs.writeFileSync(destination, next);
    console.log(`Built ${validateAcceptedPapers(source)} accepted papers.`);
  }
}

module.exports = { validateAcceptedPapers, renderAcceptedPapers };
