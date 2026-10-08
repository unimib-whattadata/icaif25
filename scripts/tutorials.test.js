'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { filterSessions } = require('../js/programme.js');
const root = path.resolve(__dirname, '..');
const tutorials = JSON.parse(fs.readFileSync(path.join(root, 'data/tutorials.json'), 'utf8')).tutorials;
const programme = JSON.parse(fs.readFileSync(path.join(root, 'data/programme.json'), 'utf8'));
const html = fs.readFileSync(path.join(root, 'tutorials.html'), 'utf8');
const escape = value => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll("'", '&#39;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

test('supplied tutorials match the programme schedule and link in both directions', () => {
  assert.equal(tutorials.length, 4);
  assert.equal(new Set(tutorials.map(tutorial => tutorial.id)).size, 4);
  for (const tutorial of tutorials) {
    const matches = programme.sessions.filter(session => session.type === 'tutorial' && session.title === tutorial.title);
    assert.equal(matches.length, 1, tutorial.title);
    const session = matches[0];
    for (const key of ['date', 'start', 'end', 'room']) assert.equal(session[key], tutorial[key], `${tutorial.title}: ${key}`);
    assert.equal(session.href, `/tutorials/#${tutorial.id}`);
    assert.ok(html.includes(`id="${tutorial.id}"`));
    assert.ok(html.includes(`/programme/?day=${session.date}#${session.id}`));
  }
});

test('each supplied presenter remains findable through the programme speaker search', () => {
  assert.equal(tutorials.reduce((total, tutorial) => total + tutorial.presenters.length, 0), 11);
  for (const tutorial of tutorials) {
    const session = programme.sessions.find(session => session.title === tutorial.title);
    for (const presenter of tutorial.presenters) {
      assert.ok(filterSessions(programme.sessions, { day: 'all', q: presenter.name }).some(match => match.id === session.id), presenter.name);
      assert.ok(html.includes(escape(presenter.name)), presenter.name);
      assert.ok(html.includes(escape(presenter.affiliation)), presenter.affiliation);
    }
  }
});

test('the published page retains every complete abstract paragraph and CET endpoint', () => {
  for (const tutorial of tutorials) {
    assert.ok(html.includes(escape(tutorial.title)), tutorial.title);
    for (const paragraph of tutorial.abstract) assert.ok(html.includes(escape(paragraph)), `${tutorial.title}: missing abstract text`);
    for (const endpoint of ['start', 'end']) assert.ok(html.includes(`datetime="${tutorial.date}T${tutorial[endpoint]}:00+01:00"`), tutorial.title);
  }
});
