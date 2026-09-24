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
