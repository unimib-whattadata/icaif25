"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const code = fs.readFileSync(path.join(root, "js/hero-time.js"), "utf8");
const context = { window: {}, document: { querySelector: () => null }, Intl, Date };
vm.runInNewContext(code, context);
const { getPeriod, timeZone } = context.window.ICAIFHeroTime;

test("uses Milan time, independently of the visitor's time zone", () => {
  assert.equal(timeZone, "Europe/Rome");
  assert.equal(getPeriod(new Date("2026-07-15T04:00:00Z")), "dawn");
  assert.equal(getPeriod(new Date("2026-11-15T04:00:00Z")), "night");
});

for (const [season, month, offset] of [["summer", 7, 2], ["winter", 11, 1]]) {
  test(`covers every minute and every boundary in ${season}`, () => {
    for (let minute = 0; minute < 1440; minute += 1) {
      const hour = Math.floor(minute / 60);
      const date = new Date(Date.UTC(2026, month - 1, 15, hour - offset, minute % 60));
      const expected = hour < 6 ? "night" : hour < 9 ? "dawn" : hour < 17 ? "day" : hour < 20 ? "sunset" : "night";
      assert.equal(getPeriod(date), expected, `${season} ${hour}:${minute % 60}`);
    }
  });
}

test("handles both daylight-saving transitions", () => {
  for (const date of ["2026-03-29T00:59:59Z", "2026-03-29T01:00:00Z", "2026-10-25T00:59:59Z", "2026-10-25T01:00:00Z"]) {
    assert.equal(getPeriod(new Date(date)), "night");
  }
  assert.equal(getPeriod(new Date("2026-03-29T04:00:00Z")), "dawn");
  assert.equal(getPeriod(new Date("2026-10-25T05:00:00Z")), "dawn");
});

test("has a safe sunset fallback", () => {
  assert.equal(getPeriod(new Date("invalid")), "sunset");
  const noIntl = { window: {}, document: { querySelector: () => null }, Intl: undefined, Date };
  vm.runInNewContext(code, noIntl);
  assert.equal(noIntl.window.ICAIFHeroTime.getPeriod(), "sunset");
});

test("every phase has a web image and both download formats", () => {
  for (const phase of ["alba", "giorno", "tramonto", "notte"]) {
    for (const format of ["webp", "jpg", "png"]) {
      assert.ok(fs.statSync(path.join(root, `img/piazza-duomo-${phase}.${format}`)).size > 1000);
    }
  }
});
