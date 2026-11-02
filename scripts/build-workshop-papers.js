#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const root = path.resolve(__dirname, '..');
const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const normalized = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
const tokens = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().match(/[a-z0-9]+/g) || [];

function splitAuthors(text) {
  const parts = [];
  let depth = 0, start = 0;
  for (let i = 0; i < text.length; i += 1) {
    if (text[i] === '(') depth += 1;
    else if (text[i] === ')') depth = Math.max(0, depth - 1);
    else if (text[i] === ';' && depth === 0) { parts.push(text.slice(start, i).trim()); start = i + 1; }
  }
  parts.push(text.slice(start).trim());
  return parts;
}

function presentingAuthorIndexes(paper) {
  const parts = splitAuthors(paper.authors);
  const names = parts.map(part => part.split('(')[0].trim());
  const selected = new Set();
  for (const presenter of paper.presenters) {
    let candidates = names.flatMap((name, i) => normalized(name) === normalized(presenter) ? [i] : []);
    if (!candidates.length) {
      const pt = tokens(presenter);
      candidates = names.flatMap((name, i) => {
        const nt = tokens(name);
        // The source may reverse name order or supply an additional family name.
        return nt.length >= 2 && pt.length >= 2 && (nt.every(t => pt.includes(t)) || pt.every(t => nt.includes(t))) ? [i] : [];
      });
    }
    if (candidates.length !== 1) throw new Error(`Presenting author must match one supplied author: ${presenter} (${paper.title}).`);
    selected.add(candidates[0]);
  }
  return selected;
}

function renderAuthors(paper) {
  const selected = presentingAuthorIndexes(paper);
  return splitAuthors(paper.authors).map((part, i) => {
    if (!selected.has(i)) return escape(part);
    const name = part.split('(')[0].trimEnd();
    return `<u class="papers-presenting-author" title="Presenting author">${escape(name)}</u>${escape(part.slice(name.length))}`;
  }).join('; ');
}

function paperAnchor(group, paper) {
  const identifier = paper.id === null ? createHash('sha256').update(paper.title).digest('hex').slice(0, 12) : paper.id;
  return `paper-${group.id}-${identifier}`;
}

function validateWorkshopPapers(source) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(source.updated) || !source.groups?.length) throw new Error('Expected a publication date and workshop groups.');
  const groups = new Set(), anchors = new Set();
  let total = 0;
  for (const group of source.groups) {
    if (!/^[a-z0-9-]+$/.test(group.id) || groups.has(group.id) || !group.label || !group.shortLabel || !group.papers?.length) throw new Error('Invalid workshop group.');
    if (Object.keys(group).sort().join(',') !== 'id,label,papers,shortLabel') throw new Error('Only public workshop fields may be exported.');
    groups.add(group.id);
    for (const paper of group.papers) {
      if (Object.keys(paper).sort().join(',') !== 'authors,id,presentation,presenters,title') throw new Error('Only public paper fields may be exported.');
      if (paper.id !== null && (!Number.isSafeInteger(paper.id) || paper.id <= 0)) throw new Error('Invalid paper ID.');
      if (typeof paper.title !== 'string' || !paper.title.trim() || typeof paper.authors !== 'string' || !paper.authors.trim()) throw new Error('Missing paper title or authors.');
      if (![null, 'oral', 'poster'].includes(paper.presentation)) throw new Error('Invalid presentation type.');
      if (!Array.isArray(paper.presenters) || paper.presenters.some(name => typeof name !== 'string' || !name.trim() || /\b(?:TBD|to be confirmed)\b/i.test(name))) throw new Error('Invalid presenting author.');
      const anchor = paperAnchor(group, paper);
      if (anchors.has(anchor)) throw new Error('Duplicate paper in workshop.');
      anchors.add(anchor);
      presentingAuthorIndexes(paper);
      total += 1;
    }
  }
  return total;
}

function renderWorkshopPapers(source) {
  const total = validateWorkshopPapers(source);
  return `    <main id="main-content" tabindex="-1">
      <section id="page-header" class="hero bg-neutral text-neutral-content papers-header">
        <div aria-hidden="true" data-animated-hero-overlay class="hero-overlay bg-primary/20"></div>
        <div class="hero-content page-header-content">
          <div class="max-w-3xl">
            <h1 class="page-title">Workshop Papers</h1>
            <p class="page-lead">Explore ${total} papers across ${source.groups.length} ICAIF 2026 workshops. Poster presentations are labelled. Presenting authors are underlined.</p>
          </div>
        </div>
      </section>
      <div class="papers-tools" id="paper-controls">
        <div class="site-container papers-controls">
          <div id="paper-search-panel" class="papers-search" hidden>
            <label for="paper-search">Search workshop papers</label>
            <div class="papers-search-row">
              <input id="paper-search" class="input" type="search" placeholder="Title, author, ID or poster" aria-describedby="paper-search-status">
              <button type="button" class="btn" data-paper-reset disabled>Reset</button>
            </div>
          </div>
          <nav aria-label="Workshops" class="papers-categories-nav">
            <ul class="menu papers-categories">
              <li data-all-papers hidden><button type="button" data-paper-filter="all" aria-pressed="true">All workshops <span data-category-count="all">${total}</span></button></li>
${source.groups.map(group => `              <li><a href="#${group.id}" data-paper-filter="${group.id}">${escape(group.shortLabel)} <span data-category-count="${group.id}">${group.papers.length}</span></a></li>`).join('\n')}
            </ul>
          </nav>
          <div class="papers-mobile-category" hidden>
            <label for="paper-category" class="papers-workshop-label">Workshop</label>
            <select id="paper-category" class="select">
              <option value="all">All workshops (${total})</option>
${source.groups.map(group => `              <option value="${group.id}">${escape(group.shortLabel)} (${group.papers.length})</option>`).join('\n')}
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
              <h2 id="${group.id}" data-index-label="${escape(group.shortLabel)}">${escape(group.label)}</h2>
              <span data-group-count>${group.papers.length} papers</span>
              <a class="link papers-workshop-link" href="/workshop/#${group.id}">Workshop details</a>
            </div>
            <ul class="list papers-list">
${group.papers.map(paper => {
  const anchor = paperAnchor(group, paper);
  return `              <li id="${anchor}" class="list-row papers-row" tabindex="-1" data-paper>
                <div class="list-col-grow papers-row-content">
                  <a href="#${anchor}" class="link papers-id" aria-label="Link to paper: ${escape(paper.title)}">${paper.id === null ? 'Link' : `#${paper.id}`}</a>
                  <div class="papers-copy">
                    <h3>${escape(paper.title)}${paper.presentation === 'poster' ? ' <span class="badge">Poster</span>' : ''}</h3>
                    <p>${renderAuthors(paper)}</p>
                  </div>
                </div>
              </li>`;
}).join('\n')}
            </ul>
          </section>`).join('\n')}
        </div>
      </div>
    </main>`;
}

if (require.main === module) {
  const source = JSON.parse(fs.readFileSync(path.join(root, 'data/workshop-papers.json'), 'utf8'));
  const destination = path.join(root, 'workshop-papers.html');
  const stored = fs.readFileSync(destination, 'utf8');
  const next = stored.replace(/    <main id="main-content"[^>]*>[\s\S]*?<\/main>/, renderWorkshopPapers(source));
  if (process.argv.includes('--check')) {
    if (next !== stored) { console.error('Workshop papers page is out of date. Run npm run build:workshop-papers.'); process.exitCode = 1; }
    else console.log('Workshop papers page matches the publication data.');
  } else { fs.writeFileSync(destination, next); console.log(`Built ${validateWorkshopPapers(source)} workshop papers.`); }
}

module.exports = { validateWorkshopPapers, renderWorkshopPapers, renderAuthors, paperAnchor };
