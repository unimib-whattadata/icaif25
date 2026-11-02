'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { validateWorkshopPapers, renderWorkshopPapers, renderAuthors, paperAnchor } = require('./build-workshop-papers');
const source = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/workshop-papers.json'), 'utf8'));

test('the approved publication includes 120 workshop papers, without keynote entries or private records', () => {
  assert.equal(validateWorkshopPapers(source), 120);
  assert.deepEqual(source.groups.map(group => group.papers.length), [10, 7, 6, 11, 49, 6, 4, 18, 9]);
  assert.deepEqual(source.groups.map(group => group.papers.filter(paper => paper.presentation === 'poster').length), [0, 0, 0, 5, 40, 2, 0, 18, 4]);
  assert.equal(source.groups.flatMap(group => group.papers).filter(paper => paper.presentation === null).length, 20);
  const html = renderWorkshopPapers(source);
  assert.equal((html.match(/ data-paper>/g) || []).length, 120);
  assert.equal((html.match(/class="papers-presenting-author"/g) || []).length, 68);
  assert.equal((html.match(/<span class="badge">Poster<\/span>/g) || []).length, 69);
  assert.doesNotMatch(html, /General Chair|PAYMENT PENDING|COMPLIMENTARY PASS|@|When Proofs Are Abundant/);
  for (const group of source.groups) for (const paper of group.papers) {
    const entry = html.match(new RegExp(`<li id="${paperAnchor(group, paper)}"[\\s\\S]*?<\\/li>`))?.[0];
    assert.ok(entry, `Paper is present: ${paper.title}`);
    assert.equal(entry.includes('<span class="badge">Poster</span>'), paper.presentation === 'poster', `Poster label follows the source: ${paper.title}`);
  }
});

test('public schema rejects payment/contact data and duplicate workshop entries', () => {
  const privateCopy = structuredClone(source);
  privateCopy.groups[0].papers[0].paymentStatus = 'PAID';
  assert.throws(() => validateWorkshopPapers(privateCopy), /Only public paper fields/);
  const invalidPresentation = structuredClone(source);
  invalidPresentation.groups[0].papers[0].presentation = 'Keynote Talk';
  assert.throws(() => validateWorkshopPapers(invalidPresentation), /Invalid presentation type/);
  const duplicate = structuredClone(source);
  duplicate.groups[0].papers.push(duplicate.groups[0].papers[0]);
  assert.throws(() => validateWorkshopPapers(duplicate), /Duplicate paper/);
});

test('presenter annotation preserves author spelling and nested affiliations', () => {
  const html = renderAuthors({ title: 'Example', authors: 'Yi Xie (Technical University of Munich; Heilbronn Data Science Center); Researcher (Institute (Guangzhou))', presenters: ['Yi Xie'] });
  assert.equal(html, '<u class="papers-presenting-author" title="Presenting author">Yi Xie</u> (Technical University of Munich; Heilbronn Data Science Center); Researcher (Institute (Guangzhou))');
});

test('source-confirmed name variants and multiple presenters are underlined individually', () => {
  const html = renderAuthors({ title: 'Example', authors: 'Asier Rodriguez (BBVA); ZHANG ZHENG; Rodrigo Mendoza Smith', presenters: ['Asier Rodríguez González', 'Zheng Zhang', 'Rodrigo Mendoza-Smith'] });
  assert.equal((html.match(/<u /g) || []).length, 3);
  assert.ok(html.includes('>Asier Rodriguez</u> (BBVA)'));
  assert.ok(html.includes('>ZHANG ZHENG</u>'));
});

test('missing presenters stay plain; uncertain and unmatched presenters cannot be silently assigned', () => {
  assert.equal(renderAuthors({ title: 'Example', authors: 'First Author; Second Author', presenters: [] }), 'First Author; Second Author');
  assert.throws(() => renderAuthors({ title: 'Example', authors: 'First Author; Second Author', presenters: ['Unknown Person'] }), /must match one/);
  const copy = structuredClone(source);
  copy.groups[0].papers[0].presenters = ['TBD'];
  assert.throws(() => validateWorkshopPapers(copy), /Invalid presenting author/);
});

test('paper anchors remain unique across workshops and stable for source papers without IDs', () => {
  const paper = { id: null, title: 'A title without a submission ID' };
  assert.equal(paperAnchor({ id: 'first' }, paper), paperAnchor({ id: 'first' }, paper));
  assert.notEqual(paperAnchor({ id: 'first' }, paper), paperAnchor({ id: 'second' }, paper));
});

test('titles, author names and presenter markup are escaped', () => {
  const copy = structuredClone(source);
  copy.groups[0].papers[0] = { id: 1, title: '<script>alert("x")</script>', authors: '<Researcher> & Company', presenters: ['<Researcher> & Company'], presentation: 'poster' };
  const html = renderWorkshopPapers(copy);
  assert.ok(html.includes('&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;'));
  assert.ok(html.includes('>&lt;Researcher&gt; &amp; Company</u>'));
  assert.ok(!html.includes('<script>'));
});
