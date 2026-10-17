'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { buildSeo } = require('./build-seo');

const project = path.resolve(__dirname, '..');
const readPage = (root, file) => fs.readFileSync(path.join(root, file), 'utf8');
const date = html => JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph'].find(node => node['@type'] === 'WebPage').dateModified;

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'icaif-seo-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  for (const [file, modified] of [['index.html', '2026-10-16'], ['registration.html', '2026-10-18']]) {
    const html = readPage(project, file).replace(/"dateModified": "[^"]+"/, `"dateModified": "${modified}"`);
    fs.writeFileSync(path.join(root, file), html);
  }
  return root;
}

test('SEO rebuild preserves distinct page dates and is idempotent', t => {
  const root = fixture(t);
  const main = readPage(root, 'index.html').match(/<main\b[\s\S]*?<\/main>/)[0];
  buildSeo(root);
  assert.equal(date(readPage(root, 'index.html')), '2026-10-16');
  assert.equal(date(readPage(root, 'registration.html')), '2026-10-18');
  assert.equal(readPage(root, 'index.html').match(/<main\b[\s\S]*?<\/main>/)[0], main);
  const first = ['index.html', 'registration.html', 'sitemap.xml'].map(file => readPage(root, file));
  buildSeo(root);
  assert.deepEqual(['index.html', 'registration.html', 'sitemap.xml'].map(file => readPage(root, file)), first);
});

test('explicit page updates change only that date and matching sitemap entry', t => {
  const root = fixture(t);
  buildSeo(root, { updated: '2026-10-19', onlyPages: ['registration.html'] });
  assert.equal(date(readPage(root, 'index.html')), '2026-10-16');
  assert.equal(date(readPage(root, 'registration.html')), '2026-10-19');
  const sitemap = readPage(root, 'sitemap.xml');
  assert.match(sitemap, /<loc>https:\/\/icaif2026.org\/<\/loc>\s*<lastmod>2026-10-16<\/lastmod>/);
  assert.match(sitemap, /<loc>https:\/\/icaif2026.org\/registration\/<\/loc>\s*<lastmod>2026-10-19<\/lastmod>/);
});

test('invalid dates, unknown pages and missing publication dates fail before writing', t => {
  const root = fixture(t);
  const original = readPage(root, 'index.html');
  assert.throws(() => buildSeo(root, { updated: '2026-02-30' }), /valid/);
  assert.throws(() => buildSeo(root, { updated: '2026-10-19', onlyPages: ['typo.html'] }), /Unknown canonical page/);
  assert.throws(() => buildSeo(root, { onlyPages: ['index.html'] }), /requires --updated/);
  const missingDate = readPage(root, 'registration.html').replace(/"dateModified": "[^"]+",/, '');
  fs.writeFileSync(path.join(root, 'registration.html'), missingDate);
  assert.throws(() => buildSeo(root), /registration.html requires a valid dateModified/);
  assert.equal(readPage(root, 'index.html'), original);
  assert.equal(fs.existsSync(path.join(root, 'sitemap.xml')), false);
});

test('News structured list matches visible announcements and their order', () => {
  const html = readPage(project, 'news.html');
  const graph = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph'];
  const list = graph.find(node => node['@type'] === 'ItemList');
  const anchors = [...html.matchAll(/<article\b[^>]*\bid="([^"]+)"/g)].map(match => `https://icaif2026.org/news/#${match[1]}`);
  assert.equal(list.numberOfItems, anchors.length);
  assert.deepEqual(list.itemListElement.map(item => item.url), anchors);
  assert.deepEqual(list.itemListElement.map(item => item.position), anchors.map((_, index) => index + 1));
  assert.equal(list.itemListElement[0].name, 'Call for Student Volunteers');
  assert.equal(graph.find(node => node['@type'] === 'WebPage').mainEntity['@id'], list['@id']);
});
