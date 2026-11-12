'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  conferenceClock, validateProgramme, defaultDay, programmeRooms, resolveSettings,
  settingsUrl, roomSessions, sessionStates, sessionFocus
} = require('../js/screensaver-programme.js');
const official = require('../data/programme.json');
const now = new Date('2026-11-15T09:00:00Z');
const session = (id, overrides = {}) => ({
  id, date: '2026-11-15', room: 'Main Hall', start: '10:00', end: '11:00',
  title: 'Official session title', type: 'workshop', ...overrides
});

test('conference clock follows Milan across midnight and daylight-saving changes', () => {
  assert.deepEqual(conferenceClock(new Date('2026-11-14T23:10:00Z')), { date: '2026-11-15', time: '00:10' });
  assert.deepEqual(conferenceClock(new Date('2026-07-01T22:30:00Z')), { date: '2026-07-02', time: '00:30' });
  assert.deepEqual(conferenceClock(new Date('2026-10-25T00:30:00Z')), { date: '2026-10-25', time: '02:30' });
  assert.deepEqual(conferenceClock(new Date('2026-10-25T01:30:00Z')), { date: '2026-10-25', time: '02:30' });
});

test('default day is today in Milan, then the first future or final published day', () => {
  assert.equal(defaultDay(official.days, new Date('2026-11-01T00:00:00Z')), '2026-11-14');
  assert.equal(defaultDay(official.days, new Date('2026-11-14T23:01:00Z')), '2026-11-15');
  assert.equal(defaultDay(official.days, new Date('2026-11-30T00:00:00Z')), '2026-11-17');
  assert.equal(defaultDay([official.days[3], official.days[0]], now), '2026-11-17');
});

test('day and room are exact filters, with stable chronological order and no source mutation', () => {
  const source = [session('z'), session('other-room', { room: 'Main Hall Annex' }),
    session('b', { end: '10:30' }), session('other-day', { date: '2026-11-14' }),
    session('a', { end: '10:30' }), session('early', { start: '09:00', end: '09:30' })];
  const originalOrder = source.map(item => item.id);
  assert.deepEqual(roomSessions(source, '2026-11-15', 'Main Hall').map(item => item.id), ['early', 'a', 'b', 'z']);
  assert.deepEqual(source.map(item => item.id), originalOrder);
  assert.deepEqual(roomSessions(source, 'all', 'Main Hall'), []);
  assert.deepEqual(roomSessions(source, '2026-11-15', 'main hall'), []);
  assert.deepEqual(roomSessions(source, '2026-11-15', 'Main'), []);
});

test('all published rooms remain selectable even when the chosen day is empty', () => {
  const rooms = programmeRooms(official.sessions);
  assert.equal(rooms.length, 8);
  assert.equal(rooms[0], 'Main Hall');
  assert.ok(rooms.includes('Museo della Scienza e della Tecnica'));
  assert.deepEqual(roomSessions(official.sessions, '2026-11-14', 'Museo della Scienza e della Tecnica'), []);
  const resolved = resolveSettings(official, {
    search: '?day=2026-11-14&room=Museo+della+Scienza+e+della+Tecnica', now
  });
  assert.equal(resolved.room, 'Museo della Scienza e della Tecnica');
});

test('validated URL values override saved settings, while invalid values use saved or sensible defaults', () => {
  const saved = { display: 'logo', day: '2026-11-16', room: 'Room 1', density: 'comfortable' };
  assert.deepEqual(resolveSettings(official, {
    search: '?display=programme&day=2026-11-14&room=Room+2&density=compact', saved, now
  }), { display: 'programme', day: '2026-11-14', room: 'Room 2', density: 'compact' });
  assert.deepEqual(resolveSettings(official, {
    search: '?display=invalid&day=2026-11-31&room=all&density=tiny', saved, now
  }), saved);
  assert.deepEqual(resolveSettings(official, {
    search: '?display=<script>&day=all&room=Unknown&density=large',
    saved: { display: 'bad', day: 'old', room: 'gone', density: 'tiny' }, now
  }), { display: 'logo', day: '2026-11-15', room: 'Main Hall', density: 'comfortable' });
  assert.equal(resolveSettings(official, { saved: null, now }).room, 'Main Hall');
});

test('share URLs round-trip every setting, including exact Unicode room names', () => {
  const settings = { display: 'programme', day: '2026-11-15', room: 'Università Bocconi — Foyer', density: 'compact' };
  const url = new URL(settingsUrl('https://icaif2026.org/screensaver/?room=old&room=duplicate#display', settings), 'https://icaif2026.org');
  assert.equal(url.pathname, '/screensaver/');
  assert.equal(url.hash, '#display');
  assert.equal(url.searchParams.getAll('room').length, 1);
  assert.deepEqual(resolveSettings(official, { search: url.search, now }), settings);
});

test('Now and Next follow exclusive end times, gaps and concurrent next sessions', () => {
  const sessions = [session('past', { start: '09:00', end: '10:00' }), session('current'),
    session('next-b', { start: '11:30', end: '12:00' }),
    session('next-a', { start: '11:30', end: '12:30' }),
    session('later', { start: '13:00', end: '14:00' })];
  assert.deepEqual(sessionStates(sessions, '2026-11-15', now), [
    { id: 'past', state: 'past', label: '' }, { id: 'current', state: 'current', label: 'Now' },
    { id: 'next-b', state: 'upcoming', label: 'Next' }, { id: 'next-a', state: 'upcoming', label: 'Next' },
    { id: 'later', state: 'upcoming', label: '' }
  ]);
  const gap = sessionStates(sessions, '2026-11-15', new Date('2026-11-15T10:15:00Z'));
  assert.equal(gap.find(item => item.id === 'current').state, 'past');
  assert.equal(gap.filter(item => item.label === 'Now').length, 0);
  assert.equal(gap.filter(item => item.label === 'Next').length, 2);
  assert.ok(sessionStates(sessions, '2026-11-15', new Date('2026-11-15T14:00:00Z')).every(item => item.state === 'past' && !item.label));
});

test('browsing a different conference day never assigns live status', () => {
  const sessions = [session('a'), session('b', { date: '2026-11-16' })];
  assert.ok(sessionStates(sessions, '2026-11-16', now).every(item => item.state === '' && item.label === ''));
  assert.deepEqual(sessionStates(sessions, '2026-11-15', now)[1], { id: 'b', state: '', label: '' });
});

test('live focus selects every current session ahead of the next slot without changing labels or order', () => {
  const sessions = [session('next', { start: '11:30', end: '12:30' }),
    session('current-b', { start: '09:30', end: '10:30' }), session('current-a'),
    session('past', { start: '09:00', end: '10:00' })];
  const states = sessionStates(sessions, '2026-11-15', now);
  const originalStates = structuredClone(states);
  assert.deepEqual(sessionFocus(states), { focus: 'current', ids: ['current-b', 'current-a'] });
  assert.equal(states[0].label, 'Next');
  assert.deepEqual(states, originalStates);
});

test('before sessions and during a gap, focus selects all concurrent sessions at the earliest next start', () => {
  const sessions = [session('later', { start: '14:00', end: '15:00' }),
    session('next-b', { start: '11:30', end: '12:00' }),
    session('next-a', { start: '11:30', end: '12:30' }),
    session('first')];
  assert.deepEqual(sessionFocus(sessionStates(sessions, '2026-11-15', new Date('2026-11-15T08:00:00Z'))),
    { focus: 'next', ids: ['first'] });
  assert.deepEqual(sessionFocus(sessionStates(sessions, '2026-11-15', new Date('2026-11-15T10:15:00Z'))),
    { focus: 'next', ids: ['next-b', 'next-a'] });
});

test('focus changes at inclusive start and exclusive end boundaries in Milan time', () => {
  const sessions = [session('first'), session('second', { start: '11:00', end: '12:00' })];
  const focusAt = time => sessionFocus(sessionStates(sessions, '2026-11-15', new Date(`2026-11-15T${time}Z`)));
  assert.deepEqual(focusAt('08:59:59'), { focus: 'next', ids: ['first'] });
  assert.deepEqual(focusAt('09:00:00'), { focus: 'current', ids: ['first'] });
  assert.deepEqual(focusAt('09:59:59'), { focus: 'current', ids: ['first'] });
  assert.deepEqual(focusAt('10:00:00'), { focus: 'current', ids: ['second'] });
  assert.deepEqual(focusAt('11:00:00'), { focus: '', ids: [] });
});

test('completed days, other selected dates, and empty rooms have no live focus', () => {
  const sessions = [session('today'), session('tomorrow', { date: '2026-11-16' })];
  assert.deepEqual(sessionFocus(sessionStates(sessions, '2026-11-15', new Date('2026-11-15T15:00:00Z'))),
    { focus: '', ids: [] });
  for (const date of ['2026-11-14', '2026-11-16']) {
    const selected = [session('selected', { date })];
    assert.deepEqual(sessionFocus(sessionStates(selected, date, now)), { focus: '', ids: [] });
  }
  assert.deepEqual(sessionFocus(sessionStates([], '2026-11-15', now)), { focus: '', ids: [] });
  assert.deepEqual(sessionFocus(sessionStates(sessions, '2026-11-15', new Date('2026-11-15T23:00:00Z'))),
    { focus: '', ids: [] });
});

test('published data is accepted without shortening, deduplicating or modifying factual session titles', () => {
  assert.equal(validateProgramme(official), official);
  for (const day of official.days) {
    for (const room of programmeRooms(official.sessions)) {
      const expected = official.sessions.filter(item => item.date === day.date && item.room === room);
      const actual = roomSessions(official.sessions, day.date, room);
      assert.equal(actual.length, expected.length);
      for (const item of actual) assert.equal(item.title, official.sessions.find(source => source.id === item.id).title);
    }
  }
});

test('malformed dates, room data, duplicate IDs, timezone and reversed times reject the payload', () => {
  const minimal = { timezone: 'Europe/Rome', days: [{ date: '2026-11-15' }], sessions: [session('a')] };
  for (const invalid of [
    { ...minimal, timezone: 'America/New_York' },
    { ...minimal, days: [{ date: '2026-02-30' }] },
    { ...minimal, sessions: [] },
    { ...minimal, sessions: [session('a'), session('a')] },
    { ...minimal, sessions: [session('a', { room: '' })] },
    { ...minimal, sessions: [session('a', { start: '25:00' })] },
    { ...minimal, sessions: [session('a', { start: '11:00', end: '10:00' })] },
    { ...minimal, sessions: [session('a', { date: '2026-11-16' })] }
  ]) assert.throws(() => validateProgramme(invalid));
});
