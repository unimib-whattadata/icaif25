/* Room displays share the published programme; all times are local to Milan. */
(() => {
  'use strict';

  const TIMEZONE = 'Europe/Rome';
  const STORAGE_KEY = 'icaif2026-screensaver';
  const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
  const TIME_PATTERN = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
  const controllers = new WeakMap();
  const clockFormatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: TIMEZONE, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
  });
  const dayFormatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: TIMEZONE, weekday: 'long', day: 'numeric', month: 'long'
  });
  const typeLabels = {
    'oral-session': 'Oral session', 'poster-session': 'Poster session',
    registration: 'Registration', workshop: 'Workshop', tutorial: 'Tutorial',
    break: 'Break', competition: 'Competition', industry: 'Industry',
    social: 'Social', opening: 'Opening', panel: 'Panel', keynote: 'Keynote',
    banquet: 'Banquet', closing: 'Closing'
  };

  function conferenceClock(now = new Date()) {
    const parts = Object.fromEntries(clockFormatter.formatToParts(now).map(part => [part.type, part.value]));
    return { date: `${parts.year}-${parts.month}-${parts.day}`, time: `${parts.hour}:${parts.minute}` };
  }

  function validDate(value) {
    if (typeof value !== 'string' || !DATE_PATTERN.test(value)) return false;
    const date = new Date(`${value}T12:00:00Z`);
    return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
  }

  function validateProgramme(programme) {
    if (!programme || programme.timezone !== TIMEZONE || !Array.isArray(programme.days) ||
        !programme.days.length || !Array.isArray(programme.sessions)) {
      throw new Error('Invalid programme data.');
    }
    const days = new Set();
    for (const day of programme.days) {
      if (!day || !validDate(day.date) || days.has(day.date)) throw new Error('Invalid programme day.');
      days.add(day.date);
    }
    const ids = new Set();
    for (const session of programme.sessions) {
      if (!session || !['id', 'title', 'type', 'room', 'start', 'end'].every(key =>
        typeof session[key] === 'string' && session[key].trim()) ||
        ids.has(session.id) || !days.has(session.date) || !TIME_PATTERN.test(session.start) ||
        !TIME_PATTERN.test(session.end) || session.start >= session.end) {
        throw new Error('Invalid programme session.');
      }
      ids.add(session.id);
    }
    if (!programme.sessions.length) throw new Error('The programme is empty.');
    return programme;
  }

  function defaultDay(days, now = new Date()) {
    const dates = days.map(day => day.date).sort();
    const today = conferenceClock(now).date;
    return dates.find(date => date >= today) || dates[dates.length - 1] || '';
  }

  function programmeRooms(sessions) {
    return [...new Set(sessions.map(session => session.room))].sort((a, b) => {
      if (a === b) return 0;
      if (a === 'Main Hall') return -1;
      if (b === 'Main Hall') return 1;
      return a.localeCompare(b, 'en', { numeric: true });
    });
  }

  function resolveSettings(programme, { search = '', saved = {}, now = new Date() } = {}) {
    const query = new URLSearchParams(search);
    const previous = saved && typeof saved === 'object' && !Array.isArray(saved) ? saved : {};
    const days = programme.days.map(day => day.date);
    const rooms = programmeRooms(programme.sessions);
    const choose = (key, valid, fallback) =>
      valid.includes(query.get(key)) ? query.get(key) : valid.includes(previous[key]) ? previous[key] : fallback;
    return {
      display: choose('display', ['logo', 'programme'], 'logo'),
      day: choose('day', days, defaultDay(programme.days, now)),
      room: choose('room', rooms, rooms.includes('Main Hall') ? 'Main Hall' : rooms[0]),
      density: choose('density', ['comfortable', 'compact'], 'comfortable')
    };
  }

  function settingsUrl(href, settings) {
    const url = new URL(href);
    for (const key of ['display', 'day', 'room', 'density']) {
      if (settings[key]) url.searchParams.set(key, settings[key]);
    }
    return `${url.pathname}${url.search}${url.hash}`;
  }

  function roomSessions(sessions, day, room) {
    const seen = new Set();
    return sessions.filter(session => session.date === day && session.room === room)
      .sort((a, b) => a.start.localeCompare(b.start) || a.end.localeCompare(b.end) || a.id.localeCompare(b.id))
      .filter(session => {
        // Collapse only records identical in every field except their source ID.
        const signature = JSON.stringify(Object.keys(session).filter(key => key !== 'id').sort()
          .map(key => [key, session[key]]));
        if (seen.has(signature)) return false;
        seen.add(signature);
        return true;
      });
  }

  function sessionStates(sessions, day, now = new Date()) {
    const clock = conferenceClock(now);
    if (day !== clock.date) return sessions.map(session => ({ id: session.id, state: '', label: '' }));
    const nextStart = sessions.filter(session => session.date === day && session.start > clock.time)
      .map(session => session.start).sort()[0];
    return sessions.map(session => {
      if (session.date !== day) return { id: session.id, state: '', label: '' };
      const state = session.end <= clock.time ? 'past' : session.start <= clock.time ? 'current' : 'upcoming';
      return { id: session.id, state, label: state === 'current' ? 'Now' : session.start === nextStart ? 'Next' : '' };
    });
  }

  function sessionFocus(states) {
    const current = states.filter(session => session.state === 'current');
    if (current.length) return { focus: 'current', ids: current.map(session => session.id) };
    const next = states.filter(session => session.label === 'Next');
    return { focus: next.length ? 'next' : '', ids: next.map(session => session.id) };
  }

  function dayLabel(day) {
    return dayFormatter.format(new Date(`${day}T12:00:00Z`));
  }

  function createScreensaverProgramme(stage) {
    controllers.get(stage)?.dispose();
    const document = stage.ownerDocument;
    const window = document.defaultView;
    const modeSelect = document.querySelector('[data-display-mode]');
    const daySelect = document.querySelector('[data-display-day]');
    const roomSelect = document.querySelector('[data-display-room]');
    const densitySelect = document.querySelector('[data-display-density]');
    const settingsPanel = document.querySelector('[data-programme-settings]');
    const panel = stage.querySelector('[data-programme-panel]');
    const identity = stage.querySelector('.screensaver__identity');
    const heading = stage.querySelector('[data-programme-room]');
    const dateLabel = stage.querySelector('[data-programme-date]');
    const list = stage.querySelector('[data-programme-list]');
    const message = stage.querySelector('[data-programme-message]');
    const retry = stage.querySelector('[data-programme-retry]');
    if (![modeSelect, daySelect, roomSelect, densitySelect, settingsPanel, panel, identity,
      heading, dateLabel, list, message, retry].every(Boolean)) return { refreshClock() {}, dispose() {} };

    let saved = {};
    try {
      const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY));
      if (stored && typeof stored === 'object' && !Array.isArray(stored)) saved = stored;
    } catch { /* Storage is optional. */ }
    const initialSearch = window.location.search;
    const query = new URLSearchParams(initialSearch);
    const initialChoice = (key, options, fallback) => options.includes(query.get(key)) ? query.get(key) :
      options.includes(saved?.[key]) ? saved[key] : fallback;
    let settings = {
      display: initialChoice('display', ['logo', 'programme'], 'logo'),
      density: initialChoice('density', ['comfortable', 'compact'], 'comfortable')
    };
    let programme = null;
    let rows = [];
    let disposed = false;
    let loading = false;
    let failed = false;
    let request = null;
    const listeners = [];

    function listen(element, event, listener) {
      element.addEventListener(event, listener);
      listeners.push(() => element.removeEventListener(event, listener));
    }

    function showMode() {
      const programmeMode = settings.display === 'programme';
      document.body.dataset.display = settings.display;
      modeSelect.value = settings.display;
      densitySelect.value = settings.density;
      identity.hidden = programmeMode;
      panel.hidden = !programmeMode;
      settingsPanel.hidden = !programmeMode;
    }

    function persist() {
      saved = { ...saved, ...settings };
      try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(saved)); } catch { /* Continue without storage. */ }
      try {
        const url = settingsUrl(window.location.href, settings);
        if (url !== `${window.location.pathname}${window.location.search}${window.location.hash}`) {
          window.history.replaceState(window.history.state, '', url);
        }
      } catch { /* Private or file-based displays can still use the controls. */ }
    }

    function showStatus() {
      daySelect.disabled = loading || !programme;
      roomSelect.disabled = loading || !programme;
      densitySelect.disabled = loading || !programme;
      panel.setAttribute('aria-busy', String(loading));
      retry.hidden = !failed;
      message.hidden = !loading && !failed && rows.length > 0;
      if (loading) message.textContent = 'Loading programme…';
      else if (failed) message.textContent = 'The programme could not be loaded. Check your connection and choose Retry.';
      else if (!rows.length) message.textContent = `No sessions are scheduled in ${settings.room} on ${dayLabel(settings.day)}.`;
      else message.textContent = '';
    }

    function setOptions(select, options, value) {
      select.replaceChildren(...options.map(([optionValue, label]) => {
        const option = document.createElement('option');
        option.value = optionValue;
        option.textContent = label;
        return option;
      }));
      select.value = value;
    }

    function refreshClock(now = new Date()) {
      if (disposed || !programme) return;
      const states = sessionStates(rows.map(row => row.session), settings.day, now);
      const { focus, ids } = sessionFocus(states);
      const focusedIds = new Set(ids);
      list.dataset.focus = focus;
      rows.forEach((row, index) => {
        const { state, label } = states[index];
        if (state) row.element.dataset.state = state;
        else delete row.element.dataset.state;
        if (focusedIds.has(row.session.id)) row.element.dataset.focus = focus;
        else delete row.element.dataset.focus;
        if (state === 'current') row.element.setAttribute('aria-current', 'time');
        else row.element.removeAttribute('aria-current');
        if (row.badge.textContent !== label) row.badge.textContent = label;
        row.badge.hidden = !label;
      });
    }

    function render() {
      showMode();
      if (!programme) return;
      daySelect.value = settings.day;
      roomSelect.value = settings.room;
      heading.textContent = settings.room;
      dateLabel.textContent = dayLabel(settings.day);
      const sessions = roomSessions(programme.sessions, settings.day, settings.room);
      const columns = sessions.length > 5 ? 2 : 1;
      list.dataset.density = settings.density;
      list.dataset.columns = String(columns);
      list.dataset.size = sessions.length > 0 && sessions.length <= 2 ? 'spacious' :
        sessions.length >= 9 ? 'dense' : 'standard';
      list.style.setProperty('--agenda-rows', String(Math.max(1, Math.ceil(sessions.length / columns))));
      rows = sessions.map(session => {
        const element = document.createElement('li');
        element.className = 'list-row screensaver__session';
        const timeRange = document.createElement('div');
        timeRange.className = 'screensaver__session-time';
        const start = document.createElement('time');
        start.dateTime = `${session.date}T${session.start}`;
        start.textContent = session.start;
        const end = document.createElement('time');
        end.dateTime = `${session.date}T${session.end}`;
        end.textContent = session.end;
        timeRange.append(start, document.createTextNode('–'), end);
        const copy = document.createElement('div');
        copy.className = 'screensaver__session-copy';
        const title = document.createElement('h3');
        title.className = 'screensaver__session-title';
        title.textContent = session.title;
        const meta = document.createElement('p');
        meta.className = 'screensaver__session-meta';
        const type = document.createElement('span');
        type.className = 'screensaver__session-type';
        type.textContent = typeLabels[session.type] || session.type;
        type.hidden = type.textContent.trim().toLowerCase() === session.title.trim().toLowerCase();
        const badge = document.createElement('span');
        badge.className = 'badge screensaver__session-state';
        badge.hidden = true;
        meta.append(type, badge);
        copy.append(title, meta);
        element.append(timeRange, copy);
        return { session, element, badge };
      });
      list.replaceChildren(...rows.map(row => row.element));
      refreshClock();
      showStatus();
    }

    async function load() {
      if (disposed || loading) return;
      loading = true;
      failed = false;
      request = new AbortController();
      showStatus();
      try {
        const response = await window.fetch('/data/programme.json', { signal: request.signal });
        if (!response.ok) throw new Error('Programme request failed.');
        const data = validateProgramme(await response.json());
        if (disposed) return;
        programme = data;
        settings = { ...resolveSettings(data, { search: initialSearch, saved }),
          display: settings.display, density: settings.density };
        setOptions(daySelect, data.days.slice().sort((a, b) => a.date.localeCompare(b.date))
          .map(day => [day.date, dayLabel(day.date)]), settings.day);
        setOptions(roomSelect, programmeRooms(data.sessions).map(room => [room, room]), settings.room);
        loading = false;
        render();
        persist();
      } catch {
        if (disposed) return;
        loading = false;
        failed = true;
        showStatus();
      }
    }

    listen(modeSelect, 'change', () => {
      if (!['logo', 'programme'].includes(modeSelect.value)) return;
      settings.display = modeSelect.value;
      showMode();
      persist();
    });
    for (const [select, key] of [[daySelect, 'day'], [roomSelect, 'room'], [densitySelect, 'density']]) {
      listen(select, 'change', () => {
        if (!programme) return;
        settings = resolveSettings(programme, { saved: { ...settings, [key]: select.value } });
        render();
        persist();
      });
    }
    listen(retry, 'click', load);

    const controller = {
      refreshClock,
      dispose() {
        if (disposed) return;
        disposed = true;
        request?.abort();
        listeners.forEach(remove => remove());
        if (controllers.get(stage) === controller) controllers.delete(stage);
      }
    };
    controllers.set(stage, controller);
    showMode();
    load();
    return controller;
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TIMEZONE, STORAGE_KEY, conferenceClock, validateProgramme, defaultDay,
      programmeRooms, resolveSettings, settingsUrl, roomSessions, sessionStates, sessionFocus };
  }
  if (typeof window !== 'undefined') window.createScreensaverProgramme = createScreensaverProgramme;
})();
