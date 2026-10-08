"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {
  filterSessions, findConflicts, buildCalendar, readFiltersFromUrl, resolveHashFilters, validateProgramme,
} = require("../js/programme.js");

const session = (id, overrides = {}) => ({
  id, date: "2026-11-14", start: "08:30", end: "10:30",
  title: "Workshop on AI", type: "workshop", room: "Room 1", detail: "", pending: false, href: "",
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

test("My agenda filters saved IDs across all days and still respects a chosen day", () => {
  const saved = new Set(["a", "c", "old-session"]);
  assert.deepEqual(ids(filterSessions(sessions, { day: "all", saved: true }, saved)), ["a", "c"]);
  assert.deepEqual(ids(filterSessions(sessions, { day: "2026-11-15", saved: true }, saved)), ["c"]);
  assert.deepEqual(ids(filterSessions(sessions, { saved: true })), []);
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

test("malformed programme data fails safely before hiding static sessions", () => {
  assert.throws(() => validateProgramme({}), /Programme data/);
  assert.throws(() => validateProgramme({ ...programme, sessions: [sessions[0], sessions[0]] }), /Invalid programme session/);
  assert.throws(() => validateProgramme({ ...programme, days: [{ date: "2026-02-30", label: "Invalid" }] }), /Invalid programme day/);
  assert.throws(() => validateProgramme({ ...programme, sessions: [session("bad-time", { end: "08:00" })] }), /Invalid programme session/);
});

test("the checked-in programme is valid and every scheduled event can be exported", () => {
  const data = JSON.parse(fs.readFileSync(path.join(__dirname, "../data/programme.json"), "utf8"));
  assert.equal(validateProgramme(data), data);
  const calendar = buildCalendar(data.sessions);
  assert.equal((calendar.match(/BEGIN:VEVENT/g) || []).length, data.sessions.length);
  assert.equal(new Set(data.sessions.map((item) => item.id)).size, data.sessions.length);
});
