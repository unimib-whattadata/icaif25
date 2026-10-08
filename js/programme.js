(() => {
  "use strict";

  const STORAGE_KEY = "icaif2026-programme";
  const SITE_URL = "https://icaif2026.org/programme/";
  const NON_CONFLICT_TYPES = new Set(["registration", "break", "social", "banquet"]);
  const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
  const TIME_PATTERN = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

  const normalizeSearch = (value) => String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

  const asIdSet = (ids) => ids instanceof Set ? ids : new Set(Array.isArray(ids) ? ids : []);

  const filterSessions = (sessions, filters = {}, savedIds = []) => {
    const saved = asIdSet(savedIds);
    const terms = normalizeSearch(filters.q).split(" ").filter(Boolean);
    return sessions.filter((session) => {
      if (filters.day && filters.day !== "all" && session.date !== filters.day) return false;
      if (filters.type && filters.type !== "all" && session.type !== filters.type) return false;
      if (filters.room && filters.room !== "all" && session.room !== filters.room) return false;
      if (filters.saved && !saved.has(session.id)) return false;
      if (!terms.length) return true;
      const text = normalizeSearch([
        session.title, session.detail, session.room,
        session.type.replace(/-/g, " "), session.start, session.end,
      ].join(" "));
      return terms.every((term) => text.includes(term));
    });
  };

  // The strict interval boundaries let a visitor save consecutive sessions.
  // Registration, refreshment breaks and social events do not occupy a track.
  const findConflicts = (sessions, savedIds) => {
    const saved = savedIds === undefined ? null : asIdSet(savedIds);
    const selected = sessions.filter((session) =>
      (!saved || saved.has(session.id)) && !NON_CONFLICT_TYPES.has(session.type));
    const conflicts = new Set();
    selected.forEach((session, index) => {
      for (let otherIndex = index + 1; otherIndex < selected.length; otherIndex += 1) {
        const other = selected[otherIndex];
        if (session.date === other.date && session.start < other.end && session.end > other.start) {
          conflicts.add(session.id);
          conflicts.add(other.id);
        }
      }
    });
    return conflicts;
  };

  const escapeCalendarText = (value) => String(value || "")
    .replace(/\\/g, "\\\\")
    .replace(/\r\n|\n|\r/g, "\\n")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,");

  // RFC 5545 limits content lines to 75 octets, including the continuation space.
  // Iterate code points so folding never cuts a UTF-8 character in half.
  const foldCalendarLine = (line) => {
    let folded = "";
    let octets = 0;
    for (const character of line) {
      const point = character.codePointAt(0);
      const size = point <= 0x7f ? 1 : point <= 0x7ff ? 2 : point <= 0xffff ? 3 : 4;
      if (octets + size > 75) {
        folded += "\r\n ";
        octets = 1;
      }
      folded += character;
      octets += size;
    }
    return folded;
  };

  const calendarStamp = (date) => date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

  const isValidDate = (date) => {
    if (!DATE_PATTERN.test(date)) return false;
    const parsed = new Date(`${date}T12:00:00Z`);
    return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === date;
  };

  const calendarTime = (date, time) => {
    if (!isValidDate(date) || !TIME_PATTERN.test(time)) throw new Error("Invalid programme date or time.");
    // All programme dates are in November 2026: Milan observes CET (UTC+1).
    // An explicit offset keeps downloads correct in every visitor time zone.
    return calendarStamp(new Date(`${date}T${time}:00+01:00`));
  };

  const buildCalendar = (sessions, options = {}) => {
    const now = options.now || new Date();
    const baseUrl = options.baseUrl || SITE_URL;
    const lines = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//ICAIF 2026//My agenda//EN",
      "CALSCALE:GREGORIAN", "METHOD:PUBLISH", "X-WR-CALNAME:ICAIF 2026 — My agenda",
    ];
    const ordered = [...sessions].sort((a, b) =>
      a.date.localeCompare(b.date) || a.start.localeCompare(b.start) || a.id.localeCompare(b.id));
    for (const session of ordered) {
      const description = [
        session.detail,
        session.pending ? "Details to be confirmed." : "",
        "Preliminary programme. Times and sessions are subject to change.",
      ].filter(Boolean).join("\n\n");
      const eventUrl = new URL(baseUrl);
      eventUrl.searchParams.set("day", session.date);
      eventUrl.hash = session.id;
      lines.push(
        "BEGIN:VEVENT",
        `UID:${escapeCalendarText(session.id)}@icaif2026.org`,
        `DTSTAMP:${calendarStamp(now)}`,
        `DTSTART:${calendarTime(session.date, session.start)}`,
        `DTEND:${calendarTime(session.date, session.end)}`,
        `SUMMARY:${escapeCalendarText(session.title)}`,
        `LOCATION:${escapeCalendarText(session.room)}`,
        `DESCRIPTION:${escapeCalendarText(description)}`,
        `URL:${eventUrl.href}`,
        "END:VEVENT",
      );
    }
    lines.push("END:VCALENDAR");
    return `${lines.map(foldCalendarLine).join("\r\n")}\r\n`;
  };

  const validateProgramme = (programme) => {
    if (!programme || !Array.isArray(programme.days) || !programme.days.length ||
        !Array.isArray(programme.sessions) || !programme.sessions.length) {
      throw new Error("Programme data is unavailable.");
    }
    const dates = new Set();
    for (const day of programme.days) {
      if (!day || !isValidDate(day.date) || dates.has(day.date) || typeof day.label !== "string") {
        throw new Error("Invalid programme day.");
      }
      dates.add(day.date);
    }
    const ids = new Set();
    for (const session of programme.sessions) {
      if (!session || typeof session.id !== "string" || !/^[a-zA-Z0-9_-]+$/.test(session.id) ||
          ids.has(session.id) || !dates.has(session.date) ||
          !TIME_PATTERN.test(session.start) || !TIME_PATTERN.test(session.end) || session.end <= session.start ||
          [session.title, session.type, session.room].some((value) => typeof value !== "string" || !value.trim()) ||
          (session.detail !== undefined && typeof session.detail !== "string")) {
        throw new Error("Invalid programme session.");
      }
      ids.add(session.id);
    }
    return programme;
  };

  const readFiltersFromUrl = (url, programme) => {
    const address = new URL(url, SITE_URL);
    const params = address.searchParams;
    const dates = new Set(programme.days.map((day) => day.date));
    const types = new Set(programme.sessions.map((session) => session.type));
    const rooms = new Set(programme.sessions.map((session) => session.room));
    const saved = params.get("saved") === "1" || params.get("saved") === "true";
    const day = params.get("day");
    const type = params.get("type");
    const room = params.get("room");
    return {
      day: day === "all" || dates.has(day) ? day : saved ? "all" : programme.days[0].date,
      type: types.has(type) ? type : "all",
      room: rooms.has(room) ? room : "all",
      q: (params.get("q") || "").replace(/\s+/g, " ").trim(),
      saved,
    };
  };

  const resolveHashFilters = (url, filters, sessions, savedIds) => {
    let id;
    try {
      id = decodeURIComponent(new URL(url, SITE_URL).hash.slice(1));
    } catch {
      return { filters, session: null };
    }
    const session = sessions.find((item) => item.id === id);
    if (!session) return { filters, session: null };
    let resolved = { ...filters, day: session.date };
    if (!filterSessions([session], resolved, savedIds).length) {
      resolved = { day: session.date, type: "all", room: "all", q: "", saved: false };
    }
    return { filters: resolved, session };
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = { filterSessions, findConflicts, buildCalendar, readFiltersFromUrl, resolveHashFilters, validateProgramme };
  }
  if (typeof document === "undefined") return;

  const selectAll = (selector) => [...document.querySelectorAll(selector)];
  const controls = selectAll("[data-programme-controls], [data-programme-actions]");
  const articles = selectAll("[data-programme-session]");
  if (!articles.length) return;
  const days = selectAll("[data-programme-day]");
  const slots = selectAll("[data-programme-slot]");
  const saveButtons = selectAll("[data-programme-save]");
  const storageNote = document.querySelector("[data-programme-storage-note]");
  const status = document.querySelector("[data-programme-status]");
  const feedback = document.querySelector("[data-programme-feedback]");
  const empty = document.querySelector("[data-programme-empty]");

  const staticFallback = () => {
    [...articles, ...slots, ...days].forEach((element) => { element.hidden = false; });
    [...controls, ...saveButtons].forEach((element) => { element.hidden = true; });
    selectAll("[data-programme-conflict]").forEach((element) => { element.hidden = true; });
    if (storageNote) storageNote.hidden = true;
    if (empty) empty.hidden = true;
    if (feedback) feedback.textContent = "";
    if (status) status.textContent = `${articles.length} sessions across four days`;
  };

  const initializeProgramme = () => {
    const dataNode = document.getElementById("programme-data");
    const programme = validateProgramme(JSON.parse(dataNode ? dataNode.textContent : "null"));
    const sessions = programme.sessions;
    const sessionById = new Map(sessions.map((session) => [session.id, session]));
    const articleById = new Map(articles.map((article) => [article.dataset.programmeSession, article]));
    const dayFormatter = new Intl.DateTimeFormat("en-GB", {
      weekday: "long", day: "numeric", month: "long", timeZone: "UTC",
    });
    const dayLabels = new Map(programme.days.map((day) => [
      day.date, dayFormatter.format(new Date(`${day.date}T12:00:00Z`)),
    ]));
    // Fail open to the static schedule if the data and published markup drift.
    if (articleById.size !== sessions.length || articles.length !== sessions.length ||
        sessions.some((session) => !articleById.has(session.id))) {
      throw new Error("Programme markup does not match its data.");
    }

    const queryInput = document.querySelector("[data-programme-search]");
    const typeSelect = document.querySelector("[data-programme-type]");
    const roomSelect = document.querySelector("[data-programme-room]");
    const dateButtons = selectAll("[data-programme-date]");
    const savedOnlyButton = document.querySelector("[data-programme-saved-only]");
    const exportButton = document.querySelector("[data-programme-export]");
    const allDaysButtons = selectAll("[data-programme-all-days]");
    const emptyDescription = document.querySelector("[data-programme-empty-description]");
    let storage = null;
    let storageAvailable = false;
    let savedIds = new Set();

    const parseSavedIds = (value) => {
      try {
        const parsed = JSON.parse(value || "[]");
        return new Set(Array.isArray(parsed) ? parsed.filter((id) => sessionById.has(id)) : []);
      } catch {
        return new Set();
      }
    };

    try {
      storage = window.localStorage;
      savedIds = parseSavedIds(storage.getItem(STORAGE_KEY));
      storageAvailable = true;
    } catch {
      // Privacy settings may deny both the property access and getItem itself.
    }

    let state = readFiltersFromUrl(window.location.href, programme);

    const announce = (message) => {
      if (feedback) feedback.textContent = message;
    };

    const persistSavedIds = () => {
      if (!storageAvailable) return;
      try {
        storage.setItem(STORAGE_KEY, JSON.stringify([...savedIds]));
      } catch {
        // Keep the visitor's current choices in memory even if writing fails.
        storageAvailable = false;
      }
    };

    const render = () => {
      const visible = filterSessions(sessions, state, savedIds);
      const visibleIds = new Set(visible.map((session) => session.id));
      const conflicts = findConflicts(sessions, savedIds);
      articles.forEach((article) => {
        const id = article.dataset.programmeSession;
        article.hidden = !visibleIds.has(id);
        article.dataset.saved = String(savedIds.has(id));
        const conflict = article.querySelector("[data-programme-conflict]");
        if (conflict) conflict.hidden = !conflicts.has(id);
      });
      [...slots, ...days].forEach((element) => {
        element.hidden = ![...element.querySelectorAll("[data-programme-session]")]
          .some((article) => visibleIds.has(article.dataset.programmeSession));
      });
      saveButtons.forEach((button) => {
        const id = button.dataset.programmeSave;
        const session = sessionById.get(id);
        if (!session) { button.hidden = true; return; }
        const saved = savedIds.has(id);
        button.setAttribute("aria-pressed", String(saved));
        button.setAttribute("aria-label", `${saved ? "Remove" : "Save"} ${session.title}, ${dayLabels.get(session.date)} at ${session.start}, ${session.room}, ${saved ? "from" : "to"} My agenda`);
        const label = button.querySelector("[data-save-label]");
        if (label) label.textContent = saved ? "Saved" : "Save";
      });
      dateButtons.forEach((button) => {
        button.setAttribute("aria-pressed", String(button.dataset.programmeDate === state.day));
      });
      if (queryInput && queryInput.value !== state.q) queryInput.value = state.q;
      if (typeSelect) typeSelect.value = state.type;
      if (roomSelect) roomSelect.value = state.room;
      if (savedOnlyButton) savedOnlyButton.setAttribute("aria-pressed", String(state.saved));
      selectAll("[data-saved-count]").forEach((count) => { count.textContent = String(savedIds.size); });
      if (exportButton) exportButton.disabled = savedIds.size === 0;
      if (storageNote) {
        storageNote.hidden = false;
        const storageMessage = storageAvailable
          ? "Saved in this browser."
          : "Saved for this visit; browser storage is unavailable.";
        storageNote.textContent = `${storageMessage} Save sessions to export your calendar.`;
      }
      const dateLabel = state.day === "all" ? "All days" : dayLabels.get(state.day);
      if (status) {
        status.textContent = `${visible.length} ${state.saved ? "saved " : ""}${visible.length === 1 ? "session" : "sessions"} · ${dateLabel}`;
      }
      if (empty) empty.hidden = visible.length > 0;
      const matchesAcrossDays = filterSessions(sessions, { ...state, day: "all" }, savedIds).length;
      const canExpandDays = !visible.length && state.day !== "all" && matchesAcrossDays > 0;
      allDaysButtons.forEach((button) => { button.hidden = !canExpandDays; });
      if (emptyDescription) {
        emptyDescription.textContent = state.saved && savedIds.size === 0
          ? "Your agenda is empty. Save a session to add it here."
          : canExpandDays
            ? `No ${state.saved ? "saved " : ""}sessions match on this day. Try all days or clear the filters.`
            : `No ${state.saved ? "saved " : ""}sessions match these filters. Clear them to see the programme.`;
      }
    };

    const writeUrl = (method = "replace", preserveHash = false) => {
      const address = new URL(window.location.href);
      for (const name of ["day", "type", "room", "q", "saved"]) address.searchParams.delete(name);
      // My agenda defaults to all days. Keep an explicitly selected first day
      // in the URL too, so refresh and browser history preserve that choice.
      if (state.day !== programme.days[0].date || state.saved) address.searchParams.set("day", state.day);
      if (state.type !== "all") address.searchParams.set("type", state.type);
      if (state.room !== "all") address.searchParams.set("room", state.room);
      if (state.q.trim()) address.searchParams.set("q", state.q.trim());
      if (state.saved) address.searchParams.set("saved", "1");
      if (!preserveHash) address.hash = "";
      if (address.href === window.location.href) return;
      try {
        window.history[method === "push" ? "pushState" : "replaceState"](null, "", address.href);
      } catch {
        // Filtering remains usable when an embedded browser denies history writes.
      }
    };

    const changeFilters = (changes, method = "push") => {
      const focused = document.activeElement;
      state = { ...state, ...changes };
      render();
      writeUrl(method);
      // Empty-state actions disappear after a successful reset or day expansion.
      if (focused && focused.closest("[data-programme-empty]") && empty && empty.hidden) {
        const focusTarget = queryInput || dateButtons.find((button) => button.dataset.programmeDate === state.day);
        if (focusTarget) focusTarget.focus();
      }
    };

    const readLocation = () => {
      const resolved = resolveHashFilters(window.location.href,
        readFiltersFromUrl(window.location.href, programme), sessions, savedIds);
      state = resolved.filters;
      render();
      writeUrl("replace", true);
      if (resolved.session) {
        window.requestAnimationFrame(() => {
          articleById.get(resolved.session.id).scrollIntoView({ block: "start" });
        });
      }
    };

    selectAll("[data-programme-filters]").forEach((form) => {
      form.addEventListener("submit", (event) => { event.preventDefault(); });
    });
    if (queryInput) queryInput.addEventListener("input", () => changeFilters({ q: queryInput.value }, "replace"));
    if (typeSelect) typeSelect.addEventListener("change", () => changeFilters({ type: typeSelect.value }));
    if (roomSelect) roomSelect.addEventListener("change", () => changeFilters({ room: roomSelect.value }));
    dateButtons.forEach((button) => {
      button.addEventListener("click", () => changeFilters({ day: button.dataset.programmeDate }));
    });
    selectAll("[data-programme-reset]").forEach((button) => {
      button.addEventListener("click", () => changeFilters({ type: "all", room: "all", q: "", saved: false }));
    });
    allDaysButtons.forEach((button) => {
      button.addEventListener("click", () => changeFilters({ day: "all" }));
    });
    if (savedOnlyButton) savedOnlyButton.addEventListener("click", () => {
      changeFilters({ saved: !state.saved, ...(!state.saved ? { day: "all" } : {}) });
    });

    saveButtons.forEach((button) => {
      const id = button.dataset.programmeSave;
      if (!sessionById.has(id)) return;
      button.addEventListener("click", () => {
        const removed = savedIds.has(id);
        if (removed) savedIds.delete(id);
        else savedIds.add(id);
        persistSavedIds();
        render();
        const hasConflict = !removed && findConflicts(sessions, savedIds).has(id);
        announce(`${sessionById.get(id).title} ${removed ? "removed from" : "added to"} My agenda.${hasConflict ? " Overlaps with another saved session." : ""}`);
        // Removing a session in My agenda hides its button. Move focus to the
        // visible agenda control; other saves leave focus on the same button.
        if (articleById.get(id).hidden && document.activeElement === button) {
          const focusTarget = savedOnlyButton || queryInput || dateButtons[0];
          if (focusTarget) focusTarget.focus();
        }
      });
    });

    if (exportButton) exportButton.addEventListener("click", () => {
      const selected = sessions.filter((session) => savedIds.has(session.id));
      if (!selected.length) {
        announce("Save a session to download your agenda as a calendar.");
        return;
      }
      let objectUrl;
      try {
        objectUrl = URL.createObjectURL(new Blob([buildCalendar(selected)], { type: "text/calendar;charset=utf-8" }));
        const link = document.createElement("a");
        link.href = objectUrl;
        link.download = "icaif26-my-agenda.ics";
        document.body.append(link);
        link.click();
        link.remove();
        announce(`Calendar downloaded with all ${selected.length} saved ${selected.length === 1 ? "session" : "sessions"}.`);
      } catch {
        announce("Calendar download is unavailable in this browser. Try printing your agenda.");
      } finally {
        if (objectUrl) window.setTimeout(() => URL.revokeObjectURL(objectUrl), 10000);
      }
    });
    selectAll("[data-programme-print]").forEach((button) => {
      button.addEventListener("click", () => { window.print(); });
    });
    window.addEventListener("popstate", readLocation);
    window.addEventListener("hashchange", readLocation);
    window.addEventListener("storage", (event) => {
      if (!storageAvailable || (event.key !== STORAGE_KEY && event.key !== null)) return;
      savedIds = parseSavedIds(event.newValue);
      render();
    });

    controls.forEach((element) => { element.hidden = false; });
    saveButtons.forEach((button) => { button.hidden = false; });
    readLocation();
  };

  try {
    initializeProgramme();
  } catch {
    staticFallback();
  }
})();
