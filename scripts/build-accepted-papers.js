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
      <section id="page-header" class="hero bg-neutral text-neutral-content papers-header">
        <div aria-hidden="true" data-animated-hero-overlay class="hero-overlay bg-primary/20"></div>
        <div class="hero-content page-header-content">
          <div class="max-w-3xl">
            <h1 class="page-title">Accepted Papers</h1>
            <p class="page-lead">Browse the ${total} accepted main conference papers, grouped by oral presentation, poster presentation and proceedings only.</p>
          </div>
        </div>
      </section>
      <div class="papers-note">
        <div class="site-container papers-note-inner">
          <p>Authors will add a link to their presentation on the Whova platform.</p>
          <p>Updated <time datetime="${source.updated}">${updated}</time>. Paper IDs, titles, authors and affiliations are listed below.</p>
        </div>
      </div>
      <div class="papers-tools" id="paper-controls">
        <div class="site-container papers-controls">
          <div id="paper-search-panel" class="papers-search" hidden>
            <label for="paper-search">Search accepted papers</label>
            <div class="papers-search-row">
              <input id="paper-search" class="input" type="search" placeholder="Title, author or ID" aria-describedby="paper-search-status">
              <button type="button" class="btn" data-paper-reset disabled>Reset</button>
            </div>
          </div>
          <nav aria-label="Paper categories" class="papers-categories-nav">
            <ul class="menu papers-categories">
              <li data-all-papers hidden><button type="button" data-paper-filter="all" aria-pressed="true">All papers <span data-category-count="all">${total}</span></button></li>
${source.groups.map((group, index) => `              <li><a href="#${group.id}" data-paper-filter="${group.id}">${['Oral', 'Poster', 'Proceedings only'][index]} <span data-category-count="${group.id}">${group.papers.length}</span></a></li>`).join('\n')}
            </ul>
          </nav>
          <div class="papers-mobile-category" hidden>
            <label for="paper-category" class="sr-only">Paper category</label>
            <select id="paper-category" class="select">
              <option value="all">All papers (${total})</option>
${source.groups.map((group, index) => `              <option value="${group.id}">${['Oral', 'Poster', 'Proceedings only'][index]} (${group.papers.length})</option>`).join('\n')}
            </select>
          </div>
          <p id="paper-search-status" class="papers-status" role="status" aria-live="polite" aria-atomic="true">${total} papers</p>
        </div>
      </div>
      <div class="site-container papers-content" id="paper-results">
        <div class="papers-empty" id="papers-empty" hidden>
          <h2>No papers found</h2>
          <p>Try a different title, author or affiliation, or reset the filters.</p>
          <button type="button" class="btn" data-paper-reset>Reset filters</button>
        </div>
        <div class="papers-groups">
${source.groups.map(group => `          <section aria-labelledby="${group.id}" data-paper-group data-category="${group.id}">
            <div class="papers-group-heading">
              <h2 id="${group.id}" data-index-label="${escape(group.label)}">${escape(group.label)}</h2>
              <span data-group-count>${group.papers.length} papers</span>
            </div>
            <ul class="list papers-list">
${group.papers.map(paper => `              <li id="paper-${paper.id}" class="list-row papers-row" tabindex="-1" data-paper>
                <div class="list-col-grow papers-row-content">
                  <a href="#paper-${paper.id}" class="link papers-id" aria-label="Paper ${paper.id}">#${paper.id}</a>
                  <div class="papers-copy">
                    <h3>${escape(paper.title)}</h3>
                    <p>${escape(paper.authors)}</p>
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
