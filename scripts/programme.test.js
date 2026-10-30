"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {
  filterSessions, findConflicts, buildCalendar, readFiltersFromUrl, resolveHashFilters, validateProgramme,
  groupTimelineStops, timelineIndexAtPosition, attachPapers, matchSession,
} = require("../js/programme.js");

const session = (id, overrides = {}) => ({
  id, date: "2026-11-14", start: "08:30", end: "10:30",
  title: "Workshop on AI", type: "workshop", room: "Room 1", detail: "", pending: false, href: "",
  ...overrides,
});
const announcement = (id, overrides = {}) => ({
  id, date: "2026-11-15", title: "Keynote: Agostino Capponi", type: "keynote",
  room: "To be confirmed", detail: "Professor, Columbia University.",
  timeLabel: "Morning · time to be confirmed", href: "/#agostino-capponi",
  ...overrides,
});
const sessions = [
  session("a", { title: "Stratégie financière & AI", detail: "Speaker: José Silva" }),
  session("b", { type: "tutorial", room: "Room 2" }),
  session("c", { date: "2026-11-15", title: "Market models", room: "Room 1" }),
  session("d", { date: "2026-11-15", type: "tutorial", room: "Room 2" }),
];
const programme = {
  days: [{ date: "2026-11-14", label: "Saturday" }, { date: "2026-11-15", label: "Sunday" }],
  sessions,
};
const ids = (selected) => selected.map((item) => item.id);
const unfold = (calendar) => calendar.replace(/\r\n[ \t]/g, "");
const readData = (file) => JSON.parse(fs.readFileSync(path.join(__dirname, `../data/${file}.json`), "utf8"));

const acceptedFixture = {
  groups: [
    { id: "oral", papers: [
      { id: 973, title: "Limit order book generation", authors: "José Silva (University of Milan)" },
      { id: 1067, title: "Conditional diffusion models", authors: "Alex Chen (University of Oxford)" },
    ] },
    { id: "poster", papers: [
      { id: 136, title: "FAAB: Multi-agent workflows", authors: "Zoë Martin (Research Lab)" },
    ] },
    { id: "proceedings-only", papers: [
      { id: 111, title: "Proceedings contribution", authors: "Sam Lee (Research Lab)" },
    ] },
  ],
};

test("assigned papers make their session searchable by ID, title, author and affiliation", () => {
  const original = {
    ...programme,
    sessions: [
      session("oral", { type: "oral-session", paperIds: [1067, 973] }),
      session("poster", { type: "poster-session", room: "Foyer", paperIds: [136] }),
    ],
  };
  const enriched = attachPapers(original, acceptedFixture);
  assert.deepEqual(enriched.sessions[0].papers.map((paper) => paper.id), [1067, 973], "retain the supplied presentation order");
  for (const q of ["973", "limit order", "jose silva", "Milan"]) {
    assert.deepEqual(ids(filterSessions(enriched.sessions, { q })), ["oral"]);
  }
  assert.deepEqual(ids(filterSessions(enriched.sessions, { q: "zoe FAAB", room: "Foyer" })), ["poster"]);
  assert.deepEqual(filterSessions(enriched.sessions, { q: "973", type: "poster-session" }), []);
  assert.equal(original.sessions[0].papers, undefined, "enrichment must not mutate the source programme");
});

test("context queries keep the complete session available without treating every paper as a result", () => {
  const oral = attachPapers({
    ...programme,
    sessions: [session("oral", { type: "oral-session", paperIds: [973, 1067] })],
  }, acceptedFixture).sessions[0];
  for (const query of [" \t\n ", "  WORKSHOP   ai ", "oral SESSION", "Room 1 08:30"]) {
    const result = matchSession(oral, query);
    assert.equal(result.matches, true, `${query} must still find the session`);
    assert.equal(result.contextMatch, true, `${query} is satisfied by the session's own fields`);
    assert.deepEqual(result.paperMatches, [], "context-only searches do not force a paper-result list");
  }
  const keynote = matchSession(announcement("capponi"), "CAPponi morning columbia");
  assert.equal(keynote.matches, true, "untimed announcements remain searchable through their own context");
  assert.equal(keynote.contextMatch, true);
  assert.deepEqual(keynote.paperMatches, []);
});

test("paper results combine one paper's title and authors with its session context", () => {
  const oral = attachPapers({
    ...programme,
    sessions: [session("oral", { type: "oral-session", paperIds: [973, 1067] })],
  }, acceptedFixture).sessions[0];
  for (const [query, expected] of [
    [" Room 1  JOSE   generation ", 973],
    ["JOSÉ university MILAN", 973],
    ["diffusion oxford", 1067],
  ]) {
    const result = matchSession(oral, query);
    assert.equal(result.matches, true);
    assert.equal(result.contextMatch, false);
    assert.deepEqual(result.paperMatches.map((paper) => paper.id), [expected]);
  }
});

test("search does not combine unrelated papers to satisfy one query", () => {
  const oral = attachPapers({
    ...programme,
    sessions: [session("oral", { type: "oral-session", paperIds: [973, 1067] })],
  }, acceptedFixture).sessions[0];
  for (const query of ["jose diffusion", "973 1067", "Milan Oxford"]) {
    const result = matchSession(oral, query);
    assert.equal(result.matches, false, `${query} needs facts from two different papers`);
    assert.equal(result.contextMatch, false);
    assert.deepEqual(result.paperMatches, []);
    assert.deepEqual(filterSessions([oral], { q: query }), []);
  }
});

test("the paper 1044 search isolates its contribution inside the real 38-paper poster session", () => {
  const data = attachPapers(readData("programme"), readData("accepted-papers"));
  const matchingSessions = filterSessions(data.sessions, { day: "all", q: "1044" });
  assert.equal(matchingSessions.length, 1);
  const poster = matchingSessions[0];
  assert.equal(poster.type, "poster-session");
  assert.equal(poster.papers.length, 38);
  const result = matchSession(poster, "1044");
  assert.equal(result.contextMatch, false);
  assert.deepEqual(result.paperMatches.map((paper) => paper.id), [1044]);
  assert.equal(result.paperMatches[0].title, poster.papers.find((paper) => paper.id === 1044).title);
});

test("precise paper results still intersect day, category, room and saved agenda filters", () => {
  const data = attachPapers({
    ...programme,
    sessions: [
      session("oral", { type: "oral-session", paperIds: [973] }),
      session("other", { type: "oral-session", date: "2026-11-15", room: "Room 2", paperIds: [1067] }),
    ],
  }, acceptedFixture);
  const filters = { day: "2026-11-14", type: "oral-session", room: "Room 1", q: "973", saved: true };
  assert.deepEqual(ids(filterSessions(data.sessions, filters, ["oral"])), ["oral"]);
  for (const changed of [{ day: "2026-11-15" }, { type: "poster-session" }, { room: "Room 2" }]) {
    assert.deepEqual(filterSessions(data.sessions, { ...filters, ...changed }, ["oral"]), []);
  }
  assert.deepEqual(filterSessions(data.sessions, filters, ["other"]), []);
  assert.deepEqual(filterSessions(data.sessions, filters, []), []);
});

test("paper assignments reject unknown IDs, repeated papers and the wrong presentation category", () => {
  const withSessions = (...items) => ({ ...programme, sessions: items });
  const oral = (id, paperIds) => session(id, { type: "oral-session", paperIds });
  for (const invalid of [
    withSessions(oral("missing", [999999])),
    withSessions(oral("duplicate", [973, 973])),
    withSessions(oral("first", [973]), oral("second", [973])),
    withSessions(oral("wrong-category", [136])),
    withSessions(session("poster", { type: "poster-session", paperIds: [973] })),
    withSessions(oral("proceedings", [111])),
  ]) {
    assert.throws(() => attachPapers(invalid, acceptedFixture), /paper|assignment/i);
  }
});

test("calendar descriptions carry the selected session's papers and authors", () => {
  const enriched = attachPapers({
    ...programme,
    sessions: [session("oral", { type: "oral-session", paperIds: [973] })],
  }, acceptedFixture);
  const calendar = unfold(buildCalendar(enriched.sessions));
  assert.equal((calendar.match(/BEGIN:VEVENT/g) || []).length, 1, "papers remain inside their session event");
  assert.match(calendar, /DESCRIPTION:[^\r\n]*973[^\r\n]*Limit order book generation/);
  assert.ok(calendar.includes("José Silva (University of Milan)"));
  assert.ok(!calendar.includes("Conditional diffusion models"));
  assert.ok(!calendar.includes("FAAB: Multi-agent workflows"));
});

test("search ignores accents, case and repeated whitespace, including speaker details", () => {
  assert.deepEqual(ids(filterSessions(sessions, { q: "  STRATEGIE   financiere " })), ["a"]);
  assert.deepEqual(ids(filterSessions(sessions, { q: "jose    AI" })), ["a"]);
  assert.deepEqual(ids(filterSessions(sessions, { q: "\t\n" })), ["a", "b", "c", "d"]);
});

test("date, type, room and search intersect rather than replace each other", () => {
  assert.deepEqual(ids(filterSessions(sessions, {
    day: "2026-11-15", type: "workshop", room: "Room 1", q: "models",
  })), ["c"]);
  assert.deepEqual(ids(filterSessions(sessions, {
    day: "2026-11-14", type: "tutorial", room: "Room 1",
  })), []);
});

test("announced keynotes are searchable and respect filters without supplying a timed slot", () => {
  const announcements = [
    announcement("capponi"),
    announcement("barr", {
      date: "2026-11-16", title: "Keynote: Michael Barr",
      detail: "Governor of the Federal Reserve.", timeLabel: "Time to be confirmed", href: "",
    }),
  ];
  assert.deepEqual(ids(filterSessions(announcements, {
    day: "2026-11-15", type: "keynote", room: "To be confirmed", q: "capponi morning columbia",
  })), ["capponi"]);
  assert.deepEqual(ids(filterSessions(announcements, { day: "2026-11-16", q: "barr" })), ["barr"]);
  assert.deepEqual(filterSessions(announcements, { room: "Main Hall" }), []);
  assert.deepEqual(filterSessions(announcements, { type: "workshop" }), []);
  assert.deepEqual(filterSessions(announcements, { saved: true }, ["a"]), []);
  assert.ok(announcements.every((item) => item.start === undefined && item.end === undefined));
});

test("My agenda filters saved IDs across all days and still respects a chosen day", () => {
  const saved = new Set(["a", "c", "old-session"]);
  assert.deepEqual(ids(filterSessions(sessions, { day: "all", saved: true }, saved)), ["a", "c"]);
  assert.deepEqual(ids(filterSessions(sessions, { day: "2026-11-15", saved: true }, saved)), ["c"]);
  assert.deepEqual(ids(filterSessions(sessions, { saved: true })), []);
});

test("timeline groups parallel starts and sorts stops across days without changing source order", () => {
  const source = [
    session("tomorrow", { date: "2026-11-15", start: "09:00" }),
    session("late", { start: "10:00", end: "11:00" }),
    session("early"),
    session("parallel", { room: "Room 2", end: "09:00" }),
  ];
  assert.deepEqual(groupTimelineStops(source), [
    { key: "2026-11-14-08:30", date: "2026-11-14", start: "08:30", sessionIds: ["early", "parallel"] },
    { key: "2026-11-14-10:00", date: "2026-11-14", start: "10:00", sessionIds: ["late"] },
    { key: "2026-11-15-09:00", date: "2026-11-15", start: "09:00", sessionIds: ["tomorrow"] },
  ]);
  assert.deepEqual(ids(source), ["tomorrow", "late", "early", "parallel"]);
});

test("timeline stops reflect the intersection of filters and saved sessions, including empty days", () => {
  const source = [
    ...sessions,
    session("late", { start: "11:00", end: "12:00", room: "Room 2" }),
  ];
  assert.deepEqual(groupTimelineStops(filterSessions(source, { day: "all", type: "tutorial", saved: true }, ["b", "c", "d"]))
    .map((stop) => [stop.date, stop.start, stop.sessionIds]), [
    ["2026-11-14", "08:30", ["b"]], ["2026-11-15", "08:30", ["d"]],
  ]);
  assert.deepEqual(groupTimelineStops(filterSessions(source, { room: "Room 2", q: "11:00" }))
    .map((stop) => stop.sessionIds), [["late"]]);
  assert.deepEqual(groupTimelineStops(filterSessions(source, { saved: true }, [])), []);
  assert.deepEqual(groupTimelineStops(filterSessions(source, { day: "2026-11-15", saved: true }, ["b"])), []);
});

test("scroll position selects the latest reached heading and clamps before and after the timeline", () => {
  assert.equal(timelineIndexAtPosition([], 96), -1);
  assert.equal(timelineIndexAtPosition([120, 240, 400], 96), 0);
  assert.equal(timelineIndexAtPosition([20, 96, 220], 96), 1);
  assert.equal(timelineIndexAtPosition([-100, -10, 90], 96), 2);
  assert.equal(timelineIndexAtPosition([-100, -10, 100], 96), 1);
  assert.equal(timelineIndexAtPosition([400], 96), 0);
});

test("overlaps flag both competing sessions but permit consecutive sessions and different dates", () => {
  const competing = [
    session("workshop"),
    session("poster", { type: "poster-session", start: "10:00", end: "11:00", room: "Room 2" }),
    session("next", { start: "11:00", end: "12:00" }),
    session("tomorrow", { date: "2026-11-15" }),
  ];
  assert.deepEqual([...findConflicts(competing)].sort(), ["poster", "workshop"]);
  assert.deepEqual([...findConflicts(competing, ["workshop", "next"])], []);
});

test("registration, breaks and social events do not produce false track conflicts", () => {
  const selected = [
    session("workshop"),
    ...["registration", "break", "social", "banquet"].map((type) => session(type, { type })),
  ];
  assert.equal(findConflicts(selected).size, 0);
});

test("calendar converts Milan CET to UTC and links each event to its programme entry", () => {
  const calendar = unfold(buildCalendar([session("one")], { now: new Date("2026-10-08T10:20:30Z") }));
  assert.match(calendar, /DTSTAMP:20261008T102030Z\r\n/);
  assert.match(calendar, /DTSTART:20261114T073000Z\r\n/);
  assert.match(calendar, /DTEND:20261114T093000Z\r\n/);
  assert.match(calendar, /UID:one@icaif2026\.org\r\n/);
  assert.match(calendar, /URL:https:\/\/icaif2026\.org\/programme\/\?day=2026-11-14#one\r\n/);
  assert.ok(calendar.endsWith("END:VCALENDAR\r\n"));
});

test("calendar preserves all selected days and escapes content without allowing injected properties", () => {
  const selected = [
    session("late", { date: "2026-11-15" }),
    session("early", { title: "AI, finance; risk\\models\r\nInjected: value", room: "Hall, north; floor 2", detail: "Line one\nLine two", pending: true }),
  ];
  const calendar = unfold(buildCalendar(selected));
  assert.equal((calendar.match(/BEGIN:VEVENT/g) || []).length, 2);
  assert.ok(calendar.indexOf("UID:early") < calendar.indexOf("UID:late"));
  assert.ok(calendar.includes("SUMMARY:AI\\, finance\\; risk\\\\models\\nInjected: value\r\n"));
  assert.ok(calendar.includes("LOCATION:Hall\\, north\\; floor 2\r\n"));
  assert.ok(calendar.includes("DESCRIPTION:Line one\\nLine two\\n\\nDetails to be confirmed.\\n\\nPreliminary programme."));
  assert.ok(!calendar.includes("\r\nInjected:"));
  assert.equal(selected[0].id, "late", "export must not reorder the underlying programme");
});

test("calendar folding respects 75 UTF-8 octets and preserves multibyte text", () => {
  const title = "Finanza è futuro — 東京 🚀 ".repeat(20);
  const calendar = buildCalendar([session("unicode", { title })]);
  for (const line of calendar.split("\r\n")) {
    assert.ok(Buffer.byteLength(line, "utf8") <= 75, `long content line: ${Buffer.byteLength(line, "utf8")} bytes`);
    assert.ok(!line.includes("\ufffd"), "a folded line must not split Unicode characters");
  }
  assert.ok(unfold(calendar).includes(`SUMMARY:${title}\r\n`));
});

test("URL filters reject stale values and open My agenda across all days by default", () => {
  assert.deepEqual(readFiltersFromUrl("?day=2030-01-01&type=unknown&room=unknown&q=%20José%20%20Silva%20&saved=invalid", programme), {
    day: "2026-11-14", type: "all", room: "all", q: "José Silva", saved: false,
  });
  assert.equal(readFiltersFromUrl("?saved=1", programme).day, "all");
  assert.equal(readFiltersFromUrl("?saved=1&day=2026-11-15", programme).day, "2026-11-15");
  assert.equal(readFiltersFromUrl("?day=all&room=Room%202", programme).room, "Room 2");
});

test("URL filters recognize categories and locations supplied by announcements", () => {
  const data = { ...programme, announcements: [announcement("unplaced", { type: "discussion" })] };
  const filters = readFiltersFromUrl("?day=all&type=discussion&room=To%20be%20confirmed", data);
  assert.equal(filters.type, "discussion");
  assert.equal(filters.room, "To be confirmed");
});

test("a session deep link reveals its day and clears only filters that would hide it", () => {
  const filters = { day: "2026-11-14", type: "tutorial", room: "Room 2", q: "nonexistent", saved: true };
  const resolved = resolveHashFilters("?day=2026-11-14#c", filters, sessions, []);
  assert.equal(resolved.session.id, "c");
  assert.deepEqual(resolved.filters, { day: "2026-11-15", type: "all", room: "all", q: "", saved: false });
  const matching = { ...filters, type: "workshop", room: "Room 1", q: "models" };
  assert.deepEqual(resolveHashFilters("#c", matching, sessions, ["c"]).filters, { ...matching, day: "2026-11-15" });
  assert.equal(resolveHashFilters("#not-a-session", filters, sessions, []).session, null);
  assert.equal(resolveHashFilters("#%E0%A4%A", filters, sessions, []).session, null);
});

test("an announcement deep link reveals the confirmed day and clears an incompatible saved view", () => {
  const capponi = announcement("keynote-agostino-capponi");
  const filters = { day: "2026-11-14", type: "workshop", room: "Main Hall", q: "different", saved: true };
  const resolved = resolveHashFilters("#keynote-agostino-capponi", filters, [...sessions, capponi], ["a"]);
  assert.equal(resolved.session, capponi);
  assert.deepEqual(resolved.filters, { day: "2026-11-15", type: "all", room: "all", q: "", saved: false });
  const matching = { ...filters, type: "keynote", room: "To be confirmed", q: "Columbia", saved: false };
  assert.deepEqual(resolveHashFilters("#keynote-agostino-capponi", matching, [...sessions, capponi], []).filters,
    { ...matching, day: "2026-11-15" });
});

test("malformed programme data fails safely before hiding static sessions", () => {
  assert.throws(() => validateProgramme({}), /Programme data/);
  assert.throws(() => validateProgramme({ ...programme, sessions: [sessions[0], sessions[0]] }), /Invalid programme session/);
  assert.throws(() => validateProgramme({ ...programme, days: [{ date: "2026-02-30", label: "Invalid" }] }), /Invalid programme day/);
  assert.throws(() => validateProgramme({ ...programme, sessions: [session("bad-time", { end: "08:00" })] }), /Invalid programme session/);
});

test("optional announcements validate separately and share the programme's unique ID namespace", () => {
  const valid = { ...programme, announcements: [announcement("capponi")] };
  assert.equal(validateProgramme(valid), valid);
  assert.throws(() => validateProgramme({ ...programme, announcements: {} }), /Invalid programme announcements/);
  for (const changes of [
    { id: "a" }, { id: "invalid id" }, { date: "2026-11-16" }, { timeLabel: "" },
    { detail: 42 }, { href: 42 }, { start: "11:00" }, { end: "12:00" },
  ]) {
    assert.throws(() => validateProgramme({ ...programme, announcements: [announcement("capponi", changes)] }),
      /Invalid programme announcement/);
  }
  assert.throws(() => validateProgramme({ ...programme, announcements: [announcement("capponi"), announcement("capponi")] }),
    /Invalid programme announcement/);
});

test("the checked-in programme is valid and every scheduled event can be exported", () => {
  const data = attachPapers(readData("programme"), readData("accepted-papers"));
  const announcements = readData("programme-announcements");
  data.announcements = announcements;
  assert.equal(validateProgramme(data), data);
  const calendar = buildCalendar(data.sessions);
  assert.equal((calendar.match(/BEGIN:VEVENT/g) || []).length, data.sessions.length);
  assert.equal(new Set(data.sessions.map((item) => item.id)).size, data.sessions.length);
  const stops = groupTimelineStops(data.sessions);
  assert.equal(stops.reduce((total, stop) => total + stop.sessionIds.length, 0), data.sessions.length);
  assert.equal(new Set(stops.map((stop) => stop.key)).size, stops.length);
  assert.deepEqual([...new Set(stops.map((stop) => stop.date))], data.days.map((day) => day.date));
  for (const item of announcements) {
    assert.ok(!calendar.includes(`UID:${item.id}@`), "unplaced announcements must not become timed calendar events");
    assert.ok(!stops.some((stop) => stop.sessionIds.includes(item.id)), "unplaced announcements have no timeline stop");
  }
});

test("the public timetable assigns every oral and poster paper once with the supplied themes", () => {
  const accepted = readData("accepted-papers");
  const data = attachPapers(readData("programme"), accepted);
  const assignments = readData("programme-papers");
  const oral = data.sessions.filter((item) => item.type === "oral-session");
  const poster = data.sessions.filter((item) => item.type === "poster-session" && item.paperIds?.length);
  assert.equal(oral.length, 16);
  assert.deepEqual(oral.map((item) => Number(item.title.match(/^Oral Session (\d+):/)[1])),
    Array.from({ length: 16 }, (_, index) => index + 1));
  assert.deepEqual(oral.map((item) => item.paperIds.length), [4, 4, 4, 4, ...Array(12).fill(3)]);
  assert.deepEqual(poster.map((item) => item.paperIds.length), [38, 38, 38]);

  for (const [items, groupId, expectedCount] of [[oral, "oral", 52], [poster, "poster", 114]]) {
    const assignedIds = items.flatMap((item) => item.paperIds);
    const acceptedIds = accepted.groups.find((group) => group.id === groupId).papers.map((paper) => paper.id);
    assert.equal(assignedIds.length, expectedCount);
    assert.equal(new Set(assignedIds).size, expectedCount, "a paper must not appear in two programme events");
    assert.deepEqual([...assignedIds].sort((a, b) => a - b), acceptedIds.sort((a, b) => a - b));
    for (const item of items) {
      const source = assignments.groups.find((group) => group.paperIds.length === item.paperIds.length &&
        group.paperIds.every((id, index) => id === item.paperIds[index]));
      assert.ok(source, `${item.title} must preserve its source assignment and order`);
      assert.ok(item.title.includes(source.title), `${item.title} must include its supplied session theme`);
    }
  }

  assert.ok(poster.find((item) => item.paperIds.includes(136)), "the corrected FAAB paper remains a poster");
  assert.ok(data.sessions.filter((item) => !item.paperIds?.length).every((item) => !item.papers?.length));
});

test("organizer updates retain confirmed keynote days and one Monday central-banking panel", () => {
  const data = JSON.parse(fs.readFileSync(path.join(__dirname, "../data/programme.json"), "utf8"));
  const announcements = JSON.parse(fs.readFileSync(path.join(__dirname, "../data/programme-announcements.json"), "utf8"));
  const capponi = data.sessions.find((item) => item.title.includes("Agostino Capponi Keynote"));
  assert.equal(capponi.date, "2026-11-15");
  assert.equal(capponi.start, "11:00");
  assert.ok(!announcements.some((item) => item.id === "keynote-agostino-capponi"));
  assert.ok(!announcements.some((item) => item.id === "keynote-michael-barr"));
  const barr = data.sessions.find((item) => item.id === "keynote-michael-barr");
  assert.equal(barr.title, "Keynote: Michael Barr");
  assert.equal(barr.date, "2026-11-16");
  assert.equal(barr.start, "11:00");
  assert.equal(barr.end, "11:30");
  assert.equal(barr.room, "Main Hall");
  const firstOrals = data.sessions.filter((item) => item.date === "2026-11-16" &&
    /^Oral Session [1-4]:/.test(item.title));
  assert.equal(firstOrals.length, 4);
  assert.ok(firstOrals.every((item) => item.start === "11:40" && item.end === "13:00"));
  assert.equal(findConflicts([barr, ...firstOrals.slice(0, 1)]).size, 0, "Barr must end before the oral sessions begin");
  const afternoonPanels = data.sessions.filter((item) =>
    item.date === "2026-11-16" && item.type === "panel" && item.start >= "12:00");
  assert.equal(afternoonPanels.length, 1);
  const panel = afternoonPanels[0];
  assert.equal(panel.title, "AI, Systemic Risks and Central Banking");
  assert.equal(panel.start, "14:15");
  assert.equal(panel.end, "15:00");
  assert.equal(panel.room, "Main Hall");
  assert.equal(panel.pending, false);
  for (const name of ["Kartik Anand", "Celso Brunetti", "Andrea Coletta", "Jonas Fisher", "Elena Carletti"]) {
    assert.ok(filterSessions(data.sessions, { day: "2026-11-16", type: "panel", q: name })
      .some((item) => item.id === panel.id), `${name} must find the confirmed panel`);
  }
});
