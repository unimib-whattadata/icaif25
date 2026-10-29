'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { validateAcceptedPapers, renderAcceptedPapers } = require('./build-accepted-papers');
const root = path.resolve(__dirname, '..');
const source = JSON.parse(fs.readFileSync(path.join(root, 'data/accepted-papers.json'), 'utf8'));

test('publication has all 215 unique papers and applies the later paper 136 correction', () => {
  assert.equal(validateAcceptedPapers(source), 215);
  assert.deepEqual(source.groups.map(group => group.papers.length), [52, 114, 49]);
  const containing = source.groups.filter(group => group.papers.some(paper => paper.id === 136));
  assert.deepEqual(containing.map(group => group.id), ['poster']);
  assert.match(containing[0].papers.find(paper => paper.id === 136).title, /^FAAB:/);
  const html = renderAcceptedPapers(source);
  assert.equal((html.match(/ data-paper>/g) || []).length, 215);
  assert.match(html, /Authors will add a link to their presentation on the Whova platform\./);
  assert.doesNotMatch(html, /data-paper[^>]* hidden/);
  for (const paper of source.groups.flatMap(group => group.papers)) {
    assert.ok(html.includes(`id="paper-${paper.id}"`));
  }
});

test('publication rejects duplicate IDs, missing authors and private source fields', () => {
  let copy = structuredClone(source);
  copy.groups[1].papers[0].id = copy.groups[0].papers[0].id;
  assert.throws(() => validateAcceptedPapers(copy), /duplicate paper ID/);
  copy = structuredClone(source);
  copy.groups[0].papers[0].authors = '';
  assert.throws(() => validateAcceptedPapers(copy), /Missing paper title or authors/);
  copy = structuredClone(source);
  copy.groups[0].papers[0].contactEmail = 'private@example.test';
  assert.throws(() => validateAcceptedPapers(copy), /Only public paper fields/);
});

test('source strings are escaped before rendering HTML', () => {
  const copy = structuredClone(source);
  copy.groups[0].papers[0].title = '<script>alert("title")</script> & finance';
  copy.groups[0].papers[0].authors = 'Researcher <private@example.test>';
  const html = renderAcceptedPapers(copy);
  assert.ok(html.includes('&lt;script&gt;alert(&quot;title&quot;)&lt;/script&gt; &amp; finance'));
  assert.ok(html.includes('Researcher &lt;private@example.test&gt;'));
  assert.ok(!html.includes('<script>'));
});
