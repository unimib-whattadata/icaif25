# ICAIF venue cartography

The venue is the Bocconi Röntgen building, Via Guglielmo Röntgen 1, Milan, confirmed by the site owner. The pin is inside OpenStreetMap building way 35780519 at longitude 9.18782, latitude 45.45068. It identifies the building, not a separately verified doorway.

## Building section and photograph

The short building section uses the history supplied by [Bocconi’s campus exhibition](https://virtualexhibitions.unibocconi.it/campus/en/77/rontgen-1), checked on 24 September 2026. It links to that English-language exhibition and the owner-requested [Röntgen virtual tour](https://www.campusvr.unibocconi.it/it/Tour/Detail?id=1).

`rontgen-building.jpg` is a colour-adapted version of the exhibition’s photograph titled “Edificio di Via Roentgen, veduta da Viale Bligny”: [source photograph](https://virtualexhibitions.unibocconi.it/campus/getImage.php?id=22), supplied by Università Bocconi. The source’s building geometry and composition are retained. The built-in ImageGen tool applied a restrained navy/amber colour grade to match ICAIF. The exact editing prompt is in `rontgen-building.prompt.txt` and embedded in the image metadata. The visible caption credits the exhibition. The photograph is separate from the OSM database and its licence.

## Implementation

As in Viterie Orobiche, D3 Array 3 and D3 Geo 3 render real OpenStreetMap geometry with a Mercator projection. Pinned local distributions and ISC licenses are in `js/vendor/`. No map service, API key, tracking, remote tiles, or CDN is used by the page.

`js/venue-map-renderer.js` is shared by the browser and the SVG fallback generator. The browser renders an inline SVG, with city/campus views and bounded zoom around the venue. Camera transitions interpolate the SVG viewBox; the pin arrival, gentle idle float and repeating halo use the Web Animations API. The pin animates only while the map is in view and has a Pause/Play control. Motion is suppressed for prefers-reduced-motion and cancelled when the document is hidden. Small screens have their own projection and label positions. English descriptive labels are authored separately from the OSM dataset; the venue postal address retains its official street name.

If JavaScript or map data cannot load, a pre-rendered SVG remains visible. Address and directions links work independently of the map.

## Regeneration

1. Query a public Overpass API using `overpass.txt`. Send `Accept: application/json` and an identifying User-Agent. The captured dataset is from 24 September 2026.
2. Run `python3 scripts/prepare-venue-map.py /path/to/overpass-response.json` from the repository root.
3. Run `npm run build:venue-map` to regenerate the four desktop/mobile fallback SVGs.

The preparation script rounds coordinates to approximately one metre, removes consecutive duplicates, preserves closed building footprints and rewinds polygon exteriors clockwise for D3's spherical projection. The renderer uses one decimal of SVG path precision and culls geometry outside each viewport.

## Attribution and sources

Map data © [OpenStreetMap contributors](https://www.openstreetmap.org/copyright), available under the [Open Database License](https://opendatacommons.org/licenses/odbl/1-0/). The local GeoJSON is a derived database under ODbL; retain its attribution when redistributing. The page and generated SVGs include attribution.

Travel text is based on [Bocconi's campus travel guide](https://www.unibocconi.it/en/campus/buildings-and-classrooms/how-reach-bocconi-campus), checked on 24 September 2026. A link to the guide and current transport information is visible on the page.

## Selectable journeys

`routes.json` defines four illustrated journeys: Milano Centrale (M3 + tram 9), Milano Cadorna (M2 + tram 9), Porta Genova (tram 9) and Duomo (walking via Corso Italia). Google Maps directions were consulted in the browser on 24 September 2026 before authoring these itineraries; each record retains its source link. The transit itineraries use Porta Lodovica for the final walk to Röntgen 1. Current Google Maps results can vary with departure time and service changes, so no live duration or departure claim is shown.

Route geometry is an authored illustration aligned to OSM streets and station locations, not a downloaded Google Maps polyline or a routing engine. Metro curves and short transfers are simplified. The page labels this distinction and provides an origin-specific Google Maps directions link with the appropriate transit/walking mode. The Duomo walking distance (about 1.7 km) was observed in Google Maps. The extended basemap includes main roads around Centrale; the additional northern query can be run separately and deduplicated with the original dataset if the public Overpass instance times out.

The SVG projection fits the selected route, while Campus keeps the local venue view. A continuous mask reveals the journey in order with a moving indicator; text steps are available immediately. Camera transitions preserve geographic centre and scale, including interrupted motion. A Replay route control repeats the sequence. Selecting another origin fits the new route, and choosing “Explore the area” clears the route. Keyboard selection, responsive projection, Pause/Play, reduced motion, and independent route-data failure are supported. The locator and its external directions link remain available if route data fails.

M2 uses green and M3 uses yellow, following the [ATM network line colours](https://giromilano.atm.it/). These categories appear consistently in the SVG, legend and numbered steps; the yellow line has a dark edge for contrast. Tram 9 stays blue. Alternating authored SVG shoeprints mark walking segments, oriented along the route and revealed progressively by the same mask. A single animation-frame loop owns camera and route motion; path lengths are cached for each reveal.

## Indoor schematic plans

The indoor map is a local orientation trial for the ground floor, Level −1 and Level −2. It uses simplified, authored SVG geometry derived from three user-supplied Bocconi artwork-layout sheets:

- Ground: `grafton foyer pt sculture Layout1 (1).pdf`.
- Level −1: `grafton foyer -1 sculture Layout1.pdf`.
- Level −2: `grafton foyer p-2 SCULTURE Layout1 (1).pdf`.

These sheets are spatial source evidence, not a confirmed conference access plan. The redraw retains the principal footprint, room boundaries, service cores and circulation spaces while omitting seating, facade hatching, equipment and artwork annotations. AS01–AS03 retain their stepped fronts, AS04–AS05 their entry recesses, and Aula Magna its irregular envelope. The source PDFs are not published; the three shipping files in `indoor/` are generated SVG backgrounds. No raster artwork was added for the indoor map.

The organiser confirmed Main Hall / Aula Magna and the Room 1–3 assignments on 30 October. The annotated conference plans supplied on 5 November establish the arrival entrance, registration and event areas described below. The drawn stairs and lifts do not assert verified accessible routes. Labels and descriptions are in English.

The 30 October wayfinding refinement adds intermediate architectural detail: visible stair flights, lift shafts, principal columns, the ground-floor opening and the recognisable Aula Magna volume. The main and central staircases and lift cores are selectable landmarks. The Level −2 upper staircase marker was realigned to its flight, and an incorrectly enclosed rectangle was removed from the central foyer. AS01–AS05 retain the source ordering.

Room names appear directly on their coloured footprints, while secondary architecture stays quiet. The plan, Facilities directory and legend share English pictograms and category colours: blue stairs, purple lifts and teal toilets. A stronger navy contour shows the selected place while retaining its category colour. Offset symbols use short leaders to preserve their source anchors while avoiding overlaps on narrow screens. The desktop overview fits the whole floor; phones start at a readable scale with horizontal scrolling. The explicit Whole floor overview uses room numbers 01–05 for AS01–AS05, explained beside the plan. A native Find a place selector sits above the plan on phones. Selecting a place zooms to its location, and Whole floor restores the overview. Full AS01–AS05 labels return as soon as the zoom provides enough space. Selection represents a chosen place, not live positioning.

Public-source verification adds street-side labels (Viale Bligny at left, Via G. Röntgen below), Floor 0 signage, the AS02 / Deutsche Bank Room alias and descriptive café/water-refill notes. Exact facility pins and ICAIF entrances are not inferred from historical brochures. Source URLs, diagram registration and limitations are recorded in [the public-source notes](../../docs/venue-map-sources.md).

The circulation revision registers the three floors at a common scale using the repeated lift shafts and service cores, checked against the published architectural plans. Stair runs and landings are drawn separately. S7 (the compact foyer stair), S41 (beside Aula Magna) and S30 (beside the toilet block) remain separate systems with their documented floor extents. Adjacent WC cubicles are not lift shafts. Only established matching cores receive links between floors; the selected location and zoom are preserved when following a link. Selecting a facility also highlights its architectural footprint. The source identifiers are recorded in the notes rather than introduced as unverified onsite signage.

The readability revision gives the plan the full content width and moves the directory below it. A tighter SVG frame removes unused margins. Expanded mode reserves a stable, large canvas, with Close map in the toolbar; opening details cannot shrink the drawing. Room labels are larger and facility pictograms have their own scale. Phones start with a roughly 760px-wide drawing that can be scrolled horizontally, while Whole floor explicitly fits the compact overview. Selecting an AS room keeps the other AS rooms in view. Directory and inter-floor selections return the map to view.

### Editing and regeneration

The 5 November conference overlay follows the handwritten red annotations in `mappe bocconi_261105_152806.pdf`, rather than the original magenta artwork marks. Ground opens by default and shows the conference entrance and registration beside the Aula Magna stairs. Level −1 shows the exhibition area with stands 1–4, catering, press room (the handwriting was clarified by the organiser in chat), and workstations with tables and charging sockets. Level −2 identifies the central foyer as the poster area and AS01–AS03 as workshop classrooms. At the organiser’s request, AS04 and AS05 are omitted from the selectable rooms, labels and directory; other architectural areas stay neutral. Existing physical IDs and programme links are retained, including `b2-foyer` for the poster area. Conference areas have distinct dashed category colours: copper registration, amber exhibition, teal catering and indigo posters. Rooms use conference blue and foyers use slate. Each role pairs dark text with an explicit pale fill from the documented ICAIF palette, shared by the map, directory and legend. Multiply blending preserves architectural linework. Selection deepens the same tint and adds a stronger navy outline, with no switch to a different category colour or full dark fill. Facility selections likewise retain their type colour. Main Hall and both foyers keep their requested dashed outlines; the Level −1 foyer is labelled Foyer - 1. Press is rose and work is slate; entrances retain copper pictograms. These are schematic locations, not surveyed furniture layouts or new routing claims. The organiser later requested removal of the Main Hall entrance pictogram and caption from Level −1. The annotated source PDF is not published.

1. Edit `data/venue-floors.json` for the directory, descriptions, stable IDs, source anchors and selectable room contours. Optional facility `marker` coordinates offset a compact symbol from its unchanged `x`/`y` anchor and draw a leader. `mapLines` controls room-label wrapping. `connections` contains documented core correspondences, with `id`, `name`, `kind` and `stops` (`floor` / `place` pairs); the builder validates each stop. Edit `data/venue-floor-geometry.json` for background outlines and optional `stairs`, `lifts`, `columns`, `voids` and `landmarks`. A stair can have a footprint `shape`, individual `flights` with tread counts and `landings`; its `id` matches the selectable place. Lift records use `coreId` to associate shaft geometry with a place. Compare geometry with the relevant source sheet; these are schematic orientation plans, not metric surveys.
   Conference overlays use `kind: "event"`; `compact` and the floor's `overviewNote` supply readable overview codes. `label.rotate` rotates the full label only. `mapCaption` labels a service pictogram; `stands` contains the exhibition's schematic numbered boxes. `mapSubtitle` supplies a secondary room label when no programme-room alias is available. Floor notes may omit `source` when they come from the organiser's plans.
2. Run `npm run build:indoor-map` from the repository root to regenerate the indoor section in `venue.html` and `assets/venue/indoor/{ground,b1,b2}.svg`.
3. Run `npm run build` to update the canonical `venue/index.html` route, styling and site checks. Do not edit the generated panels or SVGs directly.

`js/indoor-map.js` enhances the static plans with floor/place selection, overview, zoom, shareable `floor`/`place` query links, copy feedback and an expanded native dialog. Static plans and anchor links remain available without the runtime. `css/indoor-map.css` reuses the site's palette, typography and controls. SVG background references include a content hash to invalidate cached geometry after regeneration.

The trial and circulation revision were checked locally. Verification covers desktop and 320px phone overviews, independent facility hit targets, narrow-screen labels, selection and query links, inter-floor links with preserved zoom, keyboard focus and reset, plus the full site checks, HTML validation and 21-page consistency checks.

### Consistent map interface

The published backgrounds retain the building perimeter, room and corridor boundaries, service-core outlines, the ground-floor opening, the Aula Magna volume and mapped lift shafts. Shapes already drawn as conference areas or landmarks are not duplicated. The organiser's specific architectural removals are recorded in `data/venue-floor-geometry.json`. All remaining source staircases show their architectural flights, treads and landings; mapped staircases also use the same blue pictogram as the directory and legend. Secondary stair selection footprints are omitted. Columns and door details remain omitted on all three floors. Selectable conference areas and facility anchors are unchanged.

The city/campus figure and the indoor explorer share panel, control, supporting-text and caption type roles defined in `css/venue.css`. Indoor map, directory, legend and selected-place details reuse canonical names. Ground and Level −1 foyers are labelled Foyer - 0 and Foyer - 1. Programme room names remain in `programmeRooms`; human-useful aliases and Room 1–3 appear as secondary metadata rather than duplicated primary headings. The builder derives `secondaryLabel` for the embedded client data. All three floors use the same two-column room/area directory and section-heading hierarchy.

Workshop room footprints use the single labels Room 1, Room 2 and Room 3 through `mapLines`. A programme name already used as the primary map label is not repeated as a subtitle. Stable physical IDs continue to resolve programme links.

On narrow phones the floor picker shortens Ground floor to Ground. Whole floor uses F0 / F1 for the foyers and repeats the full names in the overview key. Zoomed plans retain the complete labels. All room/area directory choices use a 64px minimum height; long contextual aliases remain in selected-place metadata. Below 360px, facilities use one column.
