#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const destination = path.join(root, 'screensaver.html');
const decode = value => value.replace(/&(#x[\da-f]+|#\d+|amp|quot|apos|lt|gt);/gi, (match, entity) => {
  if (entity.startsWith('#')) return String.fromCodePoint(entity[1].toLowerCase() === 'x'
    ? parseInt(entity.slice(2), 16) : Number(entity.slice(1)));
  return { amp: '&', quot: '"', apos: "'", lt: '<', gt: '>' }[entity.toLowerCase()];
});
const text = value => decode(value.replace(/<[^>]*>/g, '').trim());

function extractSpeakers(home) {
  const section = home.match(/<section\b[^>]*\bid="speakers"[^>]*>([\s\S]*?)<\/section>/)?.[1];
  if (!section) throw new Error('The Home speakers section is missing.');
  const speakers = [...section.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/g)].map(([, card]) => {
    const image = card.match(/<img\b[^>]*\bsrc="([^"]+)"/)?.[1];
    const name = card.match(/<h3\b[^>]*>([\s\S]*?)<\/h3>/)?.[1];
    const role = card.match(/<p\b[^>]*>([\s\S]*?)<\/p>/)?.[1];
    if (!image?.startsWith('img/speakers/') || !name || !role || !fs.existsSync(path.join(root, image))) {
      throw new Error('A Home speaker is missing their published name, role or portrait.');
    }
    return { id: path.basename(image).replace(/-v\d+\.webp$/, ''), name: text(name),
      role: text(role), image: `/${image}` };
  });
  if (!speakers.length || new Set(speakers.map(speaker => speaker.id)).size !== speakers.length) {
    throw new Error('The Home speaker catalogue is empty or has duplicate IDs.');
  }
  return speakers;
}

const speakers = extractSpeakers(fs.readFileSync(path.join(root, 'index.html'), 'utf8'));
const barr = speakers.find(speaker => speaker.id === 'michael-barr');
if (barr) barr.talkTitle = 'Some potential financial stability implications of AI.';
const existing = fs.readFileSync(destination, 'utf8');
const marker = /(<script id="screensaver-speakers" type="application\/json">)[\s\S]*?(<\/script>)/;
if (!marker.test(existing)) throw new Error('The screensaver speaker data marker is missing.');
const output = existing.replace(marker, (_, start, end) =>
  `${start}${JSON.stringify(speakers).replace(/</g, '\\u003c')}${end}`);
if (process.argv.includes('--check')) {
  if (output !== existing) {
    console.error('Screensaver speakers are out of date. Run npm run build:screensaver.');
    process.exitCode = 1;
  } else console.log(`Screensaver matches all ${speakers.length} Home speakers.`);
} else {
  fs.writeFileSync(destination, output);
  console.log(`Built screensaver catalogue with ${speakers.length} Home speakers.`);
}
