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

  const matchSession = (session, query) => {
    const terms = normalizeSearch(query).split(" ").filter(Boolean);
    const context = normalizeSearch([
      session.title, session.detail, session.room,
      session.type.replace(/-/g, " "), session.start, session.end, session.timeLabel,
    ].join(" "));
    const contextMatch = !terms.length || terms.every((term) => context.includes(term));
    if (contextMatch) return { matches: true, contextMatch: true, paperMatches: [] };
    // All terms must describe one paper, allowing its session to supply context.
    const paperMatches = (session.papers || []).filter((paper) => {
      const text = `${context} ${normalizeSearch([paper.id, paper.title, paper.authors].join(" "))}`;
      return terms.every((term) => text.includes(term));
    });
    return { matches: paperMatches.length > 0, contextMatch: false, paperMatches };
  };

  // Resolve only publication fields; assignment sources can also contain private notes.
  const attachPapers = (programme, accepted) => {
    const papers = new Map();
    for (const group of accepted.groups || []) {
      for (const paper of group.papers || []) {
        if (!Number.isInteger(paper.id) || papers.has(paper.id) ||
            typeof paper.title !== "string" || typeof paper.authors !== "string") {
          throw new Error("Invalid accepted paper data.");
        }
        papers.set(paper.id, { group: group.id, paper: {
          id: paper.id, title: paper.title, authors: paper.authors,
        } });
      }
    }
    const assigned = new Set();
    return { ...programme, sessions: programme.sessions.map((session) => {
      if (session.paperIds === undefined) return { ...session };
      if (!Array.isArray(session.paperIds) || !session.paperIds.length) {
        throw new Error("Invalid paper assignments.");
      }
      const expected = { "oral-session": "oral", "poster-session": "poster" }[session.type];
      return { ...session, papers: session.paperIds.map((id) => {
        const record = papers.get(id);
        if (!record || record.group !== expected || assigned.has(id)) {
          throw new Error(`Invalid paper assignment: ${id}`);
        }
        assigned.add(id);
        return { ...record.paper };
      }) };
    }) };
  };

  const filterSessions = (sessions, filters = {}, savedIds = []) => {
    const saved = asIdSet(savedIds);
    return sessions.filter((session) => {
      if (filters.day && filters.day !== "all" && session.date !== filters.day) return false;
      if (filters.type && filters.type !== "all" && session.type !== filters.type) return false;
      if (filters.room && filters.room !== "all" && session.room !== filters.room) return false;
      if (filters.saved && !saved.has(session.id)) return false;
      return matchSession(session, filters.q).matches;
    });
  };

  // Parallel sessions share one stop; ordering does not depend on source rows.
  const groupTimelineStops = (sessions) => {
    const groups = new Map();
    sessions.forEach((session) => {
      const key = `${session.date}-${session.start}`;
      if (!groups.has(key)) groups.set(key, { key, date: session.date, start: session.start, sessionIds: [] });
      groups.get(key).sessionIds.push(session.id);
    });
    return [...groups.values()].sort((a, b) => a.key.localeCompare(b.key));
  };

  // Before the schedule, select its first stop; below it, retain the last stop.
  const timelineIndexAtPosition = (headingTops, threshold) => {
    if (!headingTops.length) return -1;
    let index = 0;
    headingTops.forEach((top, candidate) => {
      if (top <= threshold) index = candidate;
    });
    return index;
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
        ...(session.papers || []).map((paper) => `Paper ${paper.id}: ${paper.title}\n${paper.authors}`),
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
    if (programme.announcements !== undefined && !Array.isArray(programme.announcements)) {
      throw new Error("Invalid programme announcements.");
    }
    for (const announcement of programme.announcements || []) {
      if (!announcement || typeof announcement.id !== "string" || !/^[a-zA-Z0-9_-]+$/.test(announcement.id) ||
          ids.has(announcement.id) || !dates.has(announcement.date) ||
          [announcement.title, announcement.type, announcement.room, announcement.timeLabel]
            .some((value) => typeof value !== "string" || !value.trim()) ||
          (announcement.detail !== undefined && typeof announcement.detail !== "string") ||
          (announcement.href !== undefined && typeof announcement.href !== "string") ||
          announcement.start !== undefined || announcement.end !== undefined) {
        throw new Error("Invalid programme announcement.");
      }
      ids.add(announcement.id);
    }
    return programme;
  };

  const readFiltersFromUrl = (url, programme) => {
    const address = new URL(url, SITE_URL);
    const params = address.searchParams;
    const dates = new Set(programme.days.map((day) => day.date));
    const items = [...programme.sessions, ...(programme.announcements || [])];
    const types = new Set(items.map((session) => session.type));
    const rooms = new Set(items.map((session) => session.room));
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
    module.exports = { attachPapers, matchSession, filterSessions, findConflicts, buildCalendar, readFiltersFromUrl, resolveHashFilters, validateProgramme, groupTimelineStops, timelineIndexAtPosition };
  }
  if (typeof document === "undefined") return;

  const selectAll = (selector) => [...document.querySelectorAll(selector)];
  const controls = selectAll("[data-programme-controls], [data-programme-actions]");
  const articles = selectAll("[data-programme-session]");
  const announcementArticles = selectAll("[data-programme-announcement]");
  const announcementGroups = selectAll("[data-programme-announcements]");
  if (!articles.length) return;
  const days = selectAll("[data-programme-day]");
  const slots = selectAll("[data-programme-slot]");
  const saveButtons = selectAll("[data-programme-save]");
  const storageNote = document.querySelector("[data-programme-storage-note]");
  const status = document.querySelector("[data-programme-status]");
  const feedback = document.querySelector("[data-programme-feedback]");
  const empty = document.querySelector("[data-programme-empty]");

  const staticFallback = () => {
    [...articles, ...announcementArticles, ...announcementGroups, ...slots, ...days]
      .forEach((element) => { element.hidden = false; });
    slots.forEach((element) => { element.removeAttribute("aria-current"); });
    [...controls, ...saveButtons].forEach((element) => { element.hidden = true; });
    selectAll("[data-programme-conflict]").forEach((element) => { element.hidden = true; });
    selectAll("[data-programme-paper]").forEach((element) => {
      element.hidden = false;
      delete element.dataset.searchMatch;
    });
    selectAll("[data-programme-paper-search-tools]").forEach((element) => { element.hidden = true; });
    selectAll(".programme-paper-list").forEach((list) => {
      list.append(...[...list.children].sort((a, b) => Number(a.dataset.paperOrder || 0) - Number(b.dataset.paperOrder || 0)));
      const details = list.closest("details");
      const label = details && details.querySelector("[data-programme-papers-label]");
      if (label) label.textContent = `${details.open ? "Hide" : "View"} ${list.children.length} papers & authors`;
    });
    if (storageNote) storageNote.hidden = true;
    if (empty) empty.hidden = true;
    if (feedback) feedback.textContent = "";
    if (status) status.textContent = `${articles.length} scheduled sessions${announcementArticles.length ? ` and ${announcementArticles.length} announced keynotes` : ""} across four days`;
  };

  const initializeProgramme = () => {
    const dataNode = document.getElementById("programme-data");
    const programme = validateProgramme(JSON.parse(dataNode ? dataNode.textContent : "null"));
    const sessions = programme.sessions;
    const announcements = programme.announcements || [];
    const items = [...sessions, ...announcements];
    const sessionById = new Map(sessions.map((session) => [session.id, session]));
    const articleById = new Map(articles.map((article) => [article.dataset.programmeSession, article]));
    const announcementById = new Map(announcementArticles.map((article) => [article.dataset.programmeAnnouncement, article]));
    const itemArticleById = new Map([...articleById, ...announcementById]);
    const slotGroups = slots.map((element) => ({
      element,
      articles: [...element.querySelectorAll("[data-programme-session]")],
      caption: element.querySelector(".programme-slot-heading p"),
    }));
    const dayFormatter = new Intl.DateTimeFormat("en-GB", {
      weekday: "long", day: "numeric", month: "long", timeZone: "UTC",
    });
    const dayLabels = new Map(programme.days.map((day) => [
      day.date, dayFormatter.format(new Date(`${day.date}T12:00:00Z`)),
    ]));
    // Fail open to the static schedule if the data and published markup drift.
    if (articleById.size !== sessions.length || articles.length !== sessions.length ||
        sessions.some((session) => !articleById.has(session.id)) ||
        announcementById.size !== announcements.length || announcementArticles.length !== announcements.length ||
        announcements.some((announcement) => !announcementById.has(announcement.id))) {
      throw new Error("Programme markup does not match its data.");
    }

    const queryInput = document.querySelector("[data-programme-search]");
    const typeSelect = document.querySelector("[data-programme-type]");
    const roomSelect = document.querySelector("[data-programme-room]");
    const dateButtons = selectAll("[data-programme-date]");
    const savedOnlyButtons = selectAll("[data-programme-saved-only]");
    const savedOnlyButton = savedOnlyButtons[0];
    const exportButton = document.querySelector("[data-programme-export]");
    const allDaysButtons = selectAll("[data-programme-all-days]");
    const emptyDescription = document.querySelector("[data-programme-empty-description]");
    const emptyTitle = document.querySelector("[data-programme-empty-title]");
    const emptyReset = document.querySelector("[data-programme-empty-reset]");
    const filterToggle = document.querySelector("[data-programme-filter-toggle]");
    const extraFilters = document.querySelector("[data-programme-extra-filters]");
    const filterCount = document.querySelector("[data-programme-filter-count]");
    const utilities = document.querySelector("[data-programme-utilities]");
    const mobileFilters = window.matchMedia("(max-width: 639px)");
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
    let filtersExpanded = state.type !== "all" || state.room !== "all";

    const updateFilterPanel = () => {
      if (!filterToggle || !extraFilters) return;
      const expanded = !mobileFilters.matches || filtersExpanded;
      if (!expanded && extraFilters.contains(document.activeElement)) filterToggle.focus({ preventScroll: true });
      extraFilters.hidden = !expanded;
      filterToggle.setAttribute("aria-expanded", String(expanded));
      const count = Number(state.type !== "all") + Number(state.room !== "all");
      if (filterCount) {
        filterCount.textContent = String(count);
        filterCount.hidden = count === 0;
      }
      filterToggle.setAttribute("aria-label", count ? `Filters, ${count} active` : "Filters by session type and room");
    };
    if (filterToggle) filterToggle.addEventListener("click", () => {
      filtersExpanded = !filtersExpanded;
      updateFilterPanel();
    });
    mobileFilters.addEventListener("change", updateFilterPanel);

    const closeUtilities = (restoreFocus = false) => {
      if (!utilities || !utilities.open) return;
      utilities.open = false;
      if (restoreFocus) utilities.querySelector("summary").focus({ preventScroll: true });
    };
    if (utilities) {
      document.addEventListener("click", (event) => {
        if (utilities.open && !utilities.contains(event.target)) closeUtilities(utilities.contains(document.activeElement));
      });
      document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && utilities.open) {
          event.preventDefault();
          closeUtilities(true);
        }
      });
    }

    const paperViews = new Map(sessions.filter((session) => session.papers?.length).map((session) => {
      const article = articleById.get(session.id);
      const details = article.querySelector(".programme-papers");
      const list = details && details.querySelector(".programme-paper-list");
      const rows = session.papers.map((paper) => ({
        paper, element: article.querySelector(`[data-programme-paper="${paper.id}"]`),
      }));
      if (!details || !list || rows.some((row) => !row.element)) throw new Error("Programme paper markup is unavailable.");
      rows.forEach(({ element }, index) => { element.dataset.paperOrder = String(index); });
      return [session.id, {
        session, details, list, rows, showAll: false, query: "", matches: [],
        label: details.querySelector("[data-programme-papers-label]"),
        tools: details.querySelector("[data-programme-paper-search-tools]"),
        note: details.querySelector("[data-programme-paper-search-note]"),
        button: details.querySelector("[data-programme-all-papers]"),
      }];
    }));

    const updatePaperView = (view) => {
      const matchingIds = new Set(view.matches.map((paper) => paper.id));
      const searchingPapers = matchingIds.size > 0;
      const ordered = searchingPapers
        ? [...view.rows.filter(({ paper }) => matchingIds.has(paper.id)), ...view.rows.filter(({ paper }) => !matchingIds.has(paper.id))]
        : view.rows;
      if (ordered.some((row, index) => view.list.children[index] !== row.element)) {
        view.list.append(...ordered.map((row) => row.element));
      }
      view.rows.forEach(({ paper, element }) => {
        const matches = searchingPapers && matchingIds.has(paper.id);
        element.hidden = searchingPapers && !view.showAll && !matches;
        if (matches) element.dataset.searchMatch = "true";
        else delete element.dataset.searchMatch;
      });
      if (view.tools) view.tools.hidden = !searchingPapers;
      if (view.note) view.note.textContent = `${matchingIds.size} matching ${matchingIds.size === 1 ? "paper" : "papers"} · ${view.rows.length} in this session`;
      if (view.button) {
        view.button.hidden = !searchingPapers || matchingIds.size === view.rows.length;
        view.button.textContent = view.showAll
          ? `Show ${matchingIds.size === 1 ? "matching paper" : "matching papers"} only`
          : `Show all ${view.rows.length} papers`;
        view.button.setAttribute("aria-pressed", String(view.showAll));
      }
      if (view.label) {
        const count = searchingPapers && !view.showAll ? matchingIds.size : view.rows.length;
        view.label.textContent = `${view.details.open ? "Hide" : "View"} ${count}${searchingPapers && !view.showAll ? " matching" : ""} ${count === 1 ? "paper" : "papers"} & authors`;
      }
    };
    paperViews.forEach((view) => {
      view.details.addEventListener("toggle", () => updatePaperView(view));
      if (view.button) view.button.addEventListener("click", () => {
        view.showAll = !view.showAll;
        updatePaperView(view);
        scheduleTimelineSync();
        announce(view.showAll ? `Showing all ${view.rows.length} papers in this session. Search matches appear first.` : `Showing ${view.matches.length} matching ${view.matches.length === 1 ? "paper" : "papers"}.`);
      });
    });

    const announce = (message) => {
      if (feedback) feedback.textContent = message;
    };

    const timeline = document.querySelector("[data-programme-timeline]");
    const timelineBoundary = timeline && timeline.closest(".programme-content");
    const timelineDay = timeline && timeline.querySelector("select[data-timeline-day]");
    const timelineRange = timeline && timeline.querySelector("[data-timeline-range]");
    const timelinePrevious = timeline && timeline.querySelector("[data-timeline-previous]");
    const timelineNext = timeline && timeline.querySelector("[data-timeline-next]");
    const timelineTime = timeline && timeline.querySelector("[data-timeline-time]");
    const timelineStart = timeline && timeline.querySelector("[data-timeline-start]");
    const timelineEnd = timeline && timeline.querySelector("[data-timeline-end]");
    const timelineOpen = timeline && timeline.querySelector("[data-timeline-open]");
    const timelineMobileDay = timeline && timeline.querySelector("[data-timeline-mobile-day]");
    const timelineMobileTime = timeline && timeline.querySelector("[data-timeline-mobile-time]");
    const timelineReturn = document.querySelector("[data-timeline-return]");
    const timePicker = document.getElementById("programme-time-picker");
    const pickerDays = timePicker && timePicker.querySelector("[data-timeline-picker-days]");
    const pickerDayField = timePicker && timePicker.querySelector("[data-timeline-picker-day-field]");
    const pickerDescription = timePicker && timePicker.querySelector("#programme-time-picker-description");
    const pickerTimes = timePicker && timePicker.querySelector("[data-timeline-picker-times]");
    const pickerPreview = timePicker && timePicker.querySelector("[data-timeline-picker-preview]");
    const pickerGo = timePicker && timePicker.querySelector("[data-timeline-go]");
    if (timeline && [timelineDay, timelineRange, timelinePrevious, timelineNext,
      timelineTime, timelineStart, timelineEnd,
      timelineOpen, timelineMobileDay, timelineMobileTime, timelineReturn,
      timePicker, pickerDays, pickerDescription, pickerTimes, pickerPreview, pickerGo].some((element) => !element)) {
      throw new Error("Timeline controls are unavailable.");
    }
    const slotByKey = new Map(slotGroups.map((group) => [
      `${group.element.dataset.timelineDay}-${group.element.dataset.timelineTime}`, group.element,
    ]));
    if (timeline && groupTimelineStops(sessions).some((stop) => !slotByKey.has(stop.key))) {
      throw new Error("Timeline markup does not match its data.");
    }
    const shortDayFormatter = new Intl.DateTimeFormat("en-GB", {
      weekday: "short", day: "numeric", month: "short", timeZone: "UTC",
    });
    let visibleStops = [];
    let activeStopKey = null;
    let scrollFrame = null;
    let pendingScroll = null;
    let pendingTimer = null;
    let draggingRange = false;
    let draftStopKey = null;
    let returnPosition = null;
    let pickerFocusTarget = null;
    const mobileTimeline = window.matchMedia("(max-width: 767px)");
    const scrollY = () => window.scrollY || window.pageYOffset || 0;
    const navigationHeight = () => {
      const navigation = document.querySelector(".site-nav");
      return navigation ? navigation.getBoundingClientRect().height : 0;
    };
    const timelineOffset = () => navigationHeight() + (mobileTimeline.matches || timeline.hidden
      ? 0 : timeline.getBoundingClientRect().height + 16);
    const preserveTimelineFocus = (focused) => {
      if (!timeline || !focused || !timeline.contains(focused) || !focused.disabled) return;
      const candidates = mobileTimeline.matches ? [timelineOpen] : [timelineRange, timelineDay];
      const target = candidates.find((element) => !element.disabled) || timeline;
      if (target === timeline) target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
    };
    const updateTimeline = (stop) => {
      if (!timeline) return;
      const focused = document.activeElement;
      const index = stop ? visibleStops.findIndex((item) => item.key === stop.key) : -1;
      const dayStops = stop ? visibleStops.filter((item) => item.date === stop.date) : [];
      activeStopKey = stop ? stop.key : null;
      slots.forEach((element) => {
        if (stop && slotByKey.get(stop.key) === element) element.setAttribute("aria-current", "step");
        else element.removeAttribute("aria-current");
      });
      timelineDay.disabled = !stop;
      timelineDay.value = state.day;
      timelineRange.min = "0";
      timelineRange.max = String(Math.max(1, dayStops.length - 1));
      timelineRange.value = String(stop ? dayStops.findIndex((item) => item.key === stop.key) : 0);
      timelineRange.disabled = dayStops.length < 2;
      timelineRange.setAttribute("aria-valuetext", stop
        ? `${dayLabels.get(stop.date)}, ${stop.start} CET, time ${Number(timelineRange.value) + 1} of ${dayStops.length}`
        : "No sessions match these filters");
      timelinePrevious.disabled = index <= 0;
      timelineNext.disabled = index < 0 || index === visibleStops.length - 1;
      timelineTime.textContent = stop ? stop.start : "—";
      timelineOpen.disabled = !stop;
      timelineMobileDay.textContent = stop
        ? shortDayFormatter.format(new Date(`${stop.date}T12:00:00Z`)) : "No sessions";
      timelineMobileTime.textContent = stop ? stop.start : "—";
      timelineOpen.setAttribute("aria-label", stop ? `Choose time, ${dayLabels.get(stop.date)}, ${stop.start} CET` : "Choose time");
      timelineStart.textContent = dayStops.length ? dayStops[0].start : "—";
      timelineEnd.textContent = dayStops.length ? dayStops[dayStops.length - 1].start : "—";
      preserveTimelineFocus(focused);
    };
    const selectPickerStop = (stop) => {
      draftStopKey = stop ? stop.key : null;
      [...pickerTimes.children].forEach((button) => {
        button.setAttribute("aria-pressed", String(button.dataset.timelinePickerStop === draftStopKey));
      });
      pickerPreview.replaceChildren(...(stop ? stop.sessionIds : []).map((id) => {
        const item = document.createElement("li");
        item.textContent = sessionById.get(id).title;
        return item;
      }));
      pickerGo.disabled = !stop;
      pickerGo.textContent = stop ? `Go to ${stop.start}` : "Go to time";
    };
    const renderTimePicker = (stop) => {
      const focusedKey = document.activeElement && document.activeElement.dataset.timelinePickerStop;
      const multipleDays = new Set(visibleStops.map((item) => item.date)).size > 1;
      if (pickerDayField) pickerDayField.hidden = !multipleDays;
      pickerDescription.textContent = multipleDays
        ? "Choose a day and time, then confirm to move the programme. Times follow your current filters."
        : `${dayLabels.get(stop.date)}. Choose a time, then confirm to move the programme. Times follow your current filters.`;
      [...pickerDays.children].forEach((button) => {
        button.hidden = !visibleStops.some((item) => item.date === button.dataset.timelinePickerDay);
        button.setAttribute("aria-pressed", String(Boolean(stop) && button.dataset.timelinePickerDay === stop.date));
      });
      pickerTimes.replaceChildren(...visibleStops.filter((item) => stop && item.date === stop.date).map((item) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "btn";
        button.dataset.timelinePickerStop = item.key;
        button.textContent = item.start;
        const count = item.sessionIds.length;
        button.setAttribute("aria-label", `${item.start} CET, ${count} ${count === 1 ? "session" : "parallel sessions"}`);
        return button;
      }));
      selectPickerStop(stop);
      const focused = [...pickerTimes.children].find((button) => button.dataset.timelinePickerStop === focusedKey);
      if (focused) focused.focus({ preventScroll: true });
    };
    const clearPendingScroll = () => {
      pendingScroll = null;
      window.clearTimeout(pendingTimer);
      pendingTimer = null;
    };
    const syncTimelineToScroll = () => {
      scrollFrame = null;
      if (!timeline) return;
      const firstSlot = visibleStops.length && slotByKey.get(visibleStops[0].key);
      const atTimeline = firstSlot && firstSlot.getBoundingClientRect().top <= navigationHeight() + 32;
      const focused = document.activeElement;
      timeline.hidden = !firstSlot || (mobileTimeline.matches && !atTimeline &&
        !pendingScroll && !timePicker.open);
      if (timeline.hidden && timeline.contains(focused)) {
        const target = dateButtons.find((button) => button.dataset.programmeDate === state.day) || queryInput;
        if (target) target.focus({ preventScroll: true });
      }
      if (timelineBoundary) {
        timelineBoundary.style.setProperty("--programme-site-nav-height", `${navigationHeight()}px`);
        timelineBoundary.style.setProperty("--programme-timeline-height", `${timeline.getBoundingClientRect().height}px`);
        timeline.classList.toggle("programme-navigator-bounded", mobileTimeline.matches &&
          timelineBoundary.getBoundingClientRect().bottom <= window.innerHeight);
      }
      if (!visibleStops.length || draggingRange || timePicker.open) return;
      if (pendingScroll) {
        if (Math.abs(scrollY() - pendingScroll.top) > 3) return;
        clearPendingScroll();
        // Keep the chosen stop through the final frame of an intentional jump.
        return;
      }
      const index = timelineIndexAtPosition(visibleStops.map((stop) => {
        const element = slotByKey.get(stop.key);
        return (element.querySelector("h3") || element).getBoundingClientRect().top;
      }), timelineOffset() + 32);
      const stop = visibleStops[index];
      if (stop.key !== activeStopKey) updateTimeline(stop);
    };
    const scheduleTimelineSync = () => {
      if (timeline && scrollFrame === null) scrollFrame = window.requestAnimationFrame(syncTimelineToScroll);
    };
    const scrollTimelineTo = (top) => {
      clearPendingScroll();
      const maximum = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      pendingScroll = { top: Math.min(maximum, Math.max(0, top)) };
      pendingTimer = window.setTimeout(() => {
        clearPendingScroll();
        scheduleTimelineSync();
      }, 900);
      const reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: pendingScroll.top, behavior: reducedMotion ? "auto" : "smooth" });
      scheduleTimelineSync();
    };
    const navigateTimeline = (stop, { rememberPosition = true } = {}) => {
      if (!stop) return;
      if (mobileTimeline.matches && rememberPosition) {
        returnPosition = { top: scrollY(), key: activeStopKey };
        timelineReturn.hidden = false;
      }
      updateTimeline(stop);
      const element = slotByKey.get(stop.key);
      const heading = element.querySelector("h3") || element;
      const destination = heading.getBoundingClientRect().top + scrollY() - timelineOffset() - 24;
      scrollTimelineTo(destination);
      const index = visibleStops.findIndex((item) => item.key === stop.key);
      announce(`${dayLabels.get(stop.date)}, ${stop.start} CET. Time ${index + 1} of ${visibleStops.length}.`);
    };
    const renderTimeline = (visible) => {
      if (!timeline) return;
      const nextStops = groupTimelineStops(visible);
      if (JSON.stringify(nextStops) !== JSON.stringify(visibleStops)) {
        clearPendingScroll();
        visibleStops = nextStops;
        returnPosition = null;
        timelineReturn.hidden = true;
      }
      updateTimeline(visibleStops.find((stop) => stop.key === activeStopKey) || visibleStops[0]);
      if (timePicker.open) {
        if (!visibleStops.length) timePicker.close();
        else renderTimePicker(visibleStops.find((stop) => stop.key === draftStopKey) || visibleStops[0]);
      }
      scheduleTimelineSync();
    };
    if (timeline) {
      timelineOpen.addEventListener("click", () => {
        clearPendingScroll();
        renderTimePicker(visibleStops.find((stop) => stop.key === activeStopKey) || visibleStops[0]);
        timePicker.showModal();
        timelineOpen.setAttribute("aria-expanded", "true");
        timePicker.querySelector(".programme-time-picker-content").scrollTop = 0;
      });
      timePicker.addEventListener("close", () => {
        timelineOpen.setAttribute("aria-expanded", "false");
        if (pickerFocusTarget) {
          pickerFocusTarget.focus({ preventScroll: true });
          pickerFocusTarget = null;
          return;
        }
        const target = mobileTimeline.matches ? timelineOpen : timelineDay;
        if (!target.disabled) target.focus({ preventScroll: true });
        else preserveTimelineFocus(timelineOpen);
      });
      pickerDays.addEventListener("click", (event) => {
        const button = event.target.closest("[data-timeline-picker-day]");
        if (button) renderTimePicker(visibleStops.find((stop) => stop.date === button.dataset.timelinePickerDay));
      });
      pickerTimes.addEventListener("click", (event) => {
        const button = event.target.closest("[data-timeline-picker-stop]");
        if (button) selectPickerStop(visibleStops.find((stop) => stop.key === button.dataset.timelinePickerStop));
      });
      pickerGo.addEventListener("click", () => {
        const stop = visibleStops.find((item) => item.key === draftStopKey);
        if (!stop) return;
        const heading = slotByKey.get(stop.key).querySelector("h3");
        // Native dialog closure can restore the opener after this handler returns.
        pickerFocusTarget = heading;
        timePicker.close();
        navigateTimeline(stop);
        heading.focus({ preventScroll: true });
      });
      timelineReturn.addEventListener("click", () => {
        if (!returnPosition) return;
        const previous = returnPosition;
        returnPosition = null;
        timelineReturn.hidden = true;
        if (timePicker.open) {
          pickerFocusTarget = timelineOpen;
          timePicker.close();
        }
        timelineOpen.focus({ preventScroll: true });
        updateTimeline(visibleStops.find((stop) => stop.key === previous.key) || visibleStops[0]);
        scrollTimelineTo(previous.top);
        announce("Returned to your previous programme position.");
      });
      mobileTimeline.addEventListener("change", () => {
        if (!mobileTimeline.matches && timePicker.open) timePicker.close();
      });
      timelineDay.addEventListener("change", () => {
        changeFilters({ day: timelineDay.value });
        if (visibleStops.length) navigateTimeline(visibleStops[0], { rememberPosition: false });
        else queryInput.focus();
      });
      timelineRange.addEventListener("input", () => {
        const active = visibleStops.find((stop) => stop.key === activeStopKey);
        const dayStops = visibleStops.filter((stop) => active && stop.date === active.date);
        navigateTimeline(dayStops[Number(timelineRange.value)]);
      });
      timelinePrevious.addEventListener("click", () => {
        const index = visibleStops.findIndex((stop) => stop.key === activeStopKey);
        navigateTimeline(visibleStops[index - 1]);
      });
      timelineNext.addEventListener("click", () => {
        const index = visibleStops.findIndex((stop) => stop.key === activeStopKey);
        navigateTimeline(visibleStops[index + 1]);
      });
      const endDrag = () => {
        draggingRange = false;
        scheduleTimelineSync();
      };
      if ("PointerEvent" in window) {
        timelineRange.addEventListener("pointerdown", () => { draggingRange = true; });
        window.addEventListener("pointerup", endDrag);
        window.addEventListener("pointercancel", endDrag);
      } else {
        timelineRange.addEventListener("mousedown", () => { draggingRange = true; });
        timelineRange.addEventListener("touchstart", () => { draggingRange = true; }, { passive: true });
        window.addEventListener("mouseup", endDrag);
        window.addEventListener("touchend", endDrag);
        window.addEventListener("touchcancel", endDrag);
      }
      window.addEventListener("scroll", scheduleTimelineSync, { passive: true });
      window.addEventListener("resize", scheduleTimelineSync);
      if ("onscrollend" in window) window.addEventListener("scrollend", () => {
        clearPendingScroll();
        scheduleTimelineSync();
      });
      window.addEventListener("wheel", () => {
        clearPendingScroll();
        scheduleTimelineSync();
      }, { passive: true });
      window.addEventListener("touchstart", (event) => {
        if (!timeline.contains(event.target)) clearPendingScroll();
      }, { passive: true });
      document.addEventListener("toggle", scheduleTimelineSync, true);
    }

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
      const visibleAnnouncements = state.saved ? [] : filterSessions(announcements, state);
      const visibleAnnouncementIds = new Set(visibleAnnouncements.map((announcement) => announcement.id));
      const visibleCount = visible.length + visibleAnnouncements.length;
      const conflicts = findConflicts(sessions, savedIds);
      const query = normalizeSearch(state.q);
      let matchingPaperCount = 0;
      articles.forEach((article) => {
        const id = article.dataset.programmeSession;
        article.hidden = !visibleIds.has(id);
        article.dataset.saved = String(savedIds.has(id));
        const view = paperViews.get(id);
        if (view) {
          const hadMatches = view.matches.length > 0;
          view.matches = visibleIds.has(id) ? matchSession(view.session, query).paperMatches : [];
          const hasMatches = view.matches.length > 0;
          matchingPaperCount += view.matches.length;
          if (view.query !== query || hadMatches !== hasMatches) {
            view.showAll = false;
            if (hasMatches && !view.details.open) {
              view.details.open = true;
              view.details.dataset.searchOpened = "true";
            } else if (!hasMatches && view.details.dataset.searchOpened) {
              view.details.open = false;
              delete view.details.dataset.searchOpened;
            }
          }
          view.query = query;
          updatePaperView(view);
        }
        const conflict = article.querySelector("[data-programme-conflict]");
        if (conflict) conflict.hidden = !conflicts.has(id);
      });
      announcementArticles.forEach((article) => {
        article.hidden = !visibleAnnouncementIds.has(article.dataset.programmeAnnouncement);
      });
      announcementGroups.forEach((group) => {
        group.hidden = ![...group.querySelectorAll("[data-programme-announcement]")]
          .some((article) => visibleAnnouncementIds.has(article.dataset.programmeAnnouncement));
      });
      slotGroups.forEach((group) => {
        const count = group.articles.filter((article) => visibleIds.has(article.dataset.programmeSession)).length;
        const total = group.articles.length;
        group.element.hidden = count === 0;
        group.element.dataset.programmePrintColumns = String(Math.min(count, 4));
        if (group.caption) {
          group.caption.textContent = total === 1 ? "Scheduled session"
            : count === total ? `${total} parallel sessions`
              : `${count} of ${total} parallel sessions`;
        }
      });
      days.forEach((element) => {
        element.hidden = ![...element.querySelectorAll("[data-programme-session], [data-programme-announcement]")]
          .some((article) => visibleIds.has(article.dataset.programmeSession) ||
            visibleAnnouncementIds.has(article.dataset.programmeAnnouncement));
      });
      saveButtons.forEach((button) => {
        const id = button.dataset.programmeSave;
        const session = sessionById.get(id);
        if (!session) { button.hidden = true; return; }
        const saved = savedIds.has(id);
        button.setAttribute("aria-pressed", String(saved));
        const action = saved ? "Remove from agenda" : "Add to My agenda";
        button.setAttribute("aria-label", `${action}: ${session.title}, ${dayLabels.get(session.date)} at ${session.start}, ${session.room}`);
        button.title = saved ? "Remove this session from My agenda" : "Add this session to your personal schedule";
        const label = button.querySelector("[data-save-label]");
        if (label) label.textContent = action;
        const addIcon = button.querySelector("[data-agenda-add-icon]");
        const addedIcon = button.querySelector("[data-agenda-added-icon]");
        if (addIcon) addIcon.hidden = saved;
        if (addedIcon) addedIcon.hidden = !saved;
      });
      dateButtons.forEach((button) => {
        button.setAttribute("aria-pressed", String(button.dataset.programmeDate === state.day));
      });
      if (queryInput && queryInput.value !== state.q) queryInput.value = state.q;
      if (typeSelect) typeSelect.value = state.type;
      if (roomSelect) roomSelect.value = state.room;
      updateFilterPanel();
      savedOnlyButtons.forEach((button) => button.setAttribute("aria-pressed", String(state.saved)));
      selectAll("[data-saved-count]").forEach((count) => { count.textContent = String(savedIds.size); });
      if (exportButton) exportButton.disabled = savedIds.size === 0;
      if (storageNote) {
        storageNote.hidden = false;
        const storageMessage = storageAvailable
          ? "Your agenda is kept in this browser."
          : "Your agenda lasts for this visit; browser storage is unavailable.";
        storageNote.textContent = `Save sessions, then export them to your calendar. ${storageMessage}`;
      }
      const dateLabel = state.day === "all" ? "All days" : dayLabels.get(state.day);
      if (status) {
        const summaries = [];
        if (matchingPaperCount) summaries.push(`${matchingPaperCount} matching ${matchingPaperCount === 1 ? "paper" : "papers"}`);
        if (visible.length || !visibleAnnouncements.length) {
          summaries.push(`${visible.length} ${state.saved ? "saved " : ""}${visible.length === 1 ? "session" : "sessions"}`);
        }
        if (visibleAnnouncements.length) {
          summaries.push(`${visibleAnnouncements.length} announced ${visibleAnnouncements.length === 1 ? "keynote" : "keynotes"}`);
        }
        const filterLabels = [
          state.type !== "all" && typeSelect ? typeSelect.selectedOptions[0].textContent : "",
          state.room !== "all" ? state.room : "",
        ].filter(Boolean);
        status.textContent = [summaries.join(" · "), dateLabel, ...filterLabels].join(" · ");
      }
      document.body.dataset.programmePrintCompact = String(state.saved || state.type !== "all" || state.room !== "all" || Boolean(state.q.trim()));
      selectAll("[data-programme-print-title]").forEach((title) => {
        title.textContent = state.saved ? "My agenda" : "Conference programme";
      });
      const printLabels = [];
      if (state.type !== "all" && typeSelect) printLabels.push(typeSelect.selectedOptions[0].textContent);
      if (state.room !== "all") printLabels.push(state.room);
      if (state.q.trim()) printLabels.push(`Search: “${state.q.trim()}”`);
      selectAll("[data-programme-print-filters]").forEach((filters) => {
        filters.textContent = printLabels.length ? `Filtered programme · ${printLabels.join(" · ")}` : "";
        filters.hidden = printLabels.length === 0;
      });
      if (empty) empty.hidden = visibleCount > 0;
      const matchesAcrossDays = filterSessions(items, { ...state, day: "all" }, savedIds).length;
      const canExpandDays = !visibleCount && state.day !== "all" && matchesAcrossDays > 0;
      const emptyAgenda = state.saved && savedIds.size === 0;
      if (emptyTitle) emptyTitle.textContent = emptyAgenda ? "Your agenda is empty" : "No sessions found";
      if (emptyReset) emptyReset.textContent = emptyAgenda ? "Browse programme" : "Clear filters";
      allDaysButtons.forEach((button) => { button.hidden = !canExpandDays; });
      if (emptyDescription) {
        emptyDescription.textContent = emptyAgenda
          ? "Add sessions to My agenda as you browse, then return here to review or export your choices."
          : canExpandDays
            ? `No ${state.saved ? "saved " : ""}sessions match on this day. Try all days or clear the filters.`
            : `No ${state.saved ? "saved " : ""}sessions match these filters. Clear them to see the programme.`;
      }
      renderTimeline(visible);
      if (timeline && !visible.length) timeline.hidden = true;
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
        readFiltersFromUrl(window.location.href, programme), items, savedIds);
      state = resolved.filters;
      render();
      writeUrl("replace", true);
      if (resolved.session) {
        window.requestAnimationFrame(() => {
          itemArticleById.get(resolved.session.id).scrollIntoView({ block: "start" });
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
      button.addEventListener("click", () => {
        changeFilters({ type: "all", room: "all", q: "", saved: false });
        if (utilities && utilities.contains(button)) {
          closeUtilities();
          if (queryInput) queryInput.focus({ preventScroll: true });
        }
      });
    });
    allDaysButtons.forEach((button) => {
      button.addEventListener("click", () => changeFilters({ day: "all" }));
    });
    savedOnlyButtons.forEach((button) => {
      button.addEventListener("click", () => {
        changeFilters({ saved: !state.saved, ...(!state.saved ? { day: "all" } : {}) });
        if (button.hasAttribute("data-timeline-agenda")) {
          const target = empty && !empty.hidden ? empty.querySelector("h2")
            : days.find((day) => !day.hidden)?.querySelector("h2");
          if (target) {
            target.setAttribute("tabindex", "-1");
            target.focus({ preventScroll: true });
            scrollTimelineTo(target.getBoundingClientRect().top + scrollY() - timelineOffset() - 24);
          }
        }
      });
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
      closeUtilities(true);
      const selected = sessions.filter((session) => savedIds.has(session.id));
      if (!selected.length) {
        announce("Add a session to My agenda to download your calendar.");
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
      button.addEventListener("click", () => { closeUtilities(true); window.print(); });
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
