"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const read = (file) => fs.readFileSync(path.join(__dirname, "..", file), "utf8");
const venue = JSON.parse(read("data/venue-floors.json"));
const programme = JSON.parse(read("data/programme.json"));
const places = new Map(venue.floors.flatMap((floor) => floor.places.map((place) => [
  place.id, { ...place, floorId: floor.id },
])));
const decode = (value) => value.replaceAll("&amp;", "&").replaceAll("&quot;", '"').replaceAll("&#39;", "'");
const hrefs = (html) => [...html.matchAll(/<a\b[^>]*\bhref="([^"]+)"[^>]*>/g)].map((match) => decode(match[1]));
const sessionArticles = (html) => new Map([...html.matchAll(/<article\b[^>]*\bdata-programme-session="([^"]+)"[^>]*>([\s\S]*?)<\/article>/g)]
  .map((match) => [decode(match[1]), match[2]]));
const roomMarkup = (article) => article.match(/<p\b[^>]*\bclass="[^"]*\bprogramme-room\b[^"]*"[^>]*>([\s\S]*?)<\/p>/)?.[1];

test("Main Hall and its Aula Magna name share one stable mapped destination", () => {
  const hall = places.get("aula-magna");
  assert.equal(hall.floorId, "b1");
  assert.equal(hall.name, "Main Hall");
  assert.equal(hall.alias, "Aula Magna");
  assert.ok(hall.programmeRooms.includes("Main Hall"));
  assert.ok(hall.programmeRooms.includes("Aula Magna"));
  const foyer = places.get("foyer");
  assert.equal(foyer.floorId, "b1");
  assert.ok(foyer.programmeRooms.includes("Foyer"));
});

test("every confirmed programme room link selects its real place on both published routes", () => {
  const expected = new Map([
    ["Main Hall", "aula-magna"], ["Foyer", "foyer"],
    ["Room 1", "as01"], ["Room 2", "as02"], ["Room 3", "as03"],
  ]);
  for (const file of ["programme.html", "programme/index.html"]) {
    const articles = sessionArticles(read(file));
    for (const session of programme.sessions) {
      assert.ok(articles.has(session.id), `${file}: missing session ${session.id}`);
      const markup = roomMarkup(articles.get(session.id));
      assert.notEqual(markup, undefined, `${file}: missing room for ${session.id}`);
      const links = hrefs(markup);
      if (expected.has(session.room)) {
        assert.equal(links.length, 1, `${file}: ${session.room} must open the map`);
        const url = new URL(links[0], "https://icaif2026.org");
        const destination = places.get(expected.get(session.room));
        assert.equal(url.pathname, "/venue/");
        assert.equal(url.searchParams.get("floor"), destination.floorId);
        assert.equal(url.searchParams.get("place"), destination.id);
        assert.equal(url.hash, "#inside-building");
      }
      for (const href of links) {
        const url = new URL(href, "https://icaif2026.org");
        if (!url.searchParams.has("place")) continue;
        const destination = places.get(url.searchParams.get("place"));
        assert.ok(destination, `${file}: unknown map destination ${href}`);
        assert.equal(url.searchParams.get("floor"), destination.floorId, `${file}: wrong floor for ${href}`);
        const names = [destination.name, destination.alias, ...(destination.programmeRooms || [])];
        assert.ok(names.includes(session.room), `${file}: ${session.room} has an unsupported room assignment`);
      }
    }
  }
});

test("confirmed Room 1–3 assignments retain the physical classroom codes and existing aliases", () => {
  for (const number of [1, 2, 3]) {
    const id = `as0${number}`;
    const place = places.get(id);
    assert.equal(place.floorId, "b2");
    assert.equal(place.name, `AS0${number}`);
    assert.ok(place.programmeRooms.includes(`Room ${number}`));
    const destinations = [...places.values()].filter((candidate) => (candidate.programmeRooms || []).includes(`Room ${number}`));
    assert.deepEqual(destinations.map((destination) => destination.id), [id], `Room ${number} must resolve to one classroom`);
  }
  assert.equal(places.get("as02").alias, "Deutsche Bank Room");
});

test("the venue exposes both auditorium names without native tooltips covering room labels", () => {
  for (const file of ["venue.html", "venue/index.html"]) {
    const html = read(file);
    const auditorium = html.match(/<g\b[^>]*\bid="map-place-aula-magna"[^>]*>/)?.[0];
    assert.ok(auditorium, `${file}: stable auditorium target is missing`);
    assert.match(html, /Main Hall/);
    assert.match(html, /Aula Magna/);
    assert.ok(!/<g\b[^>]*\bdata-place="[^"]+"[^>]*>\s*<title\b/.test(html),
      `${file}: native place tooltip can cover adjacent map labels`);
  }
});

test("foyer lift markers stay over their shafts instead of the auditorium footprint", () => {
  for (const floor of venue.floors) {
    const lift = floor.places.find((place) => place.id === `${floor.id}-foyer-lifts`);
    assert.ok(lift, `${floor.id}: foyer lift is missing`);
    const marker = lift.marker || lift;
    assert.equal(marker.x, lift.x, `${floor.id}: lift marker must not sit over the auditorium`);
    assert.equal(marker.y, lift.y, `${floor.id}: lift marker must follow the shaft`);
  }
});
