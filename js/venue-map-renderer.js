/* D3 cartography shared by the browser and the static fallback generator. */
'use strict';
const HOME = [9.18782, 45.45068]; // Within OSM building way 35780519 (Edificio Roentgen).
const escape = (s) => String(s).replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const VENUE_FOOTPRINT = 'M-2.6-1.8C-4-3.4-3.4-7-1.4-8.5C.5-9.8 3-8 2.7-5.4C2.5-3.7 1.4-2-.2-1.5C-1.1-1.2-2-1.3-2.6-1.8ZM-1.8.4C-.8-.2.8-.1 1.5.6L1.4 3.2C.6 4.2-1.2 4.2-2 3.3Z';
function venueRouteStyle(segment) {
  if (segment.line === 'M2') return {color:'#008746',edge:'#006b38',label:'M2 metro'};
  if (segment.line === 'M3') return {color:'#ffd200',edge:'#856b00',label:'M3 metro'};
  return segment.mode === 'walk' ? {color:'#bf4c16',edge:'#a33d0e',label:'Walk'} : {color:'#0369a1',edge:'#0369a1',label:'Tram 9'};
}

// Footprints follow the projected street geometry, also in generated SVGs.
function venueWalkingMarks(coordinates, projection) {
  const points = coordinates.map(projection);
  let distance = 0, next = 9, index = 0;
  const marks = [];
  for (let i=1;i<points.length;i++) {
    const [x,y] = points[i-1], dx = points[i][0]-x, dy = points[i][1]-y;
    const length = Math.hypot(dx,dy);
    if (!length) continue;
    while (next <= distance+length) {
      const t = (next-distance)/length, side = index%2 ? -1 : 1;
      const px = x+dx*t-dy/length*4.5*side, py = y+dy*t+dx/length*4.5*side;
      const angle = Math.atan2(dy,dx)*180/Math.PI+90;
      marks.push(`<path class="map-footprint" d="${VENUE_FOOTPRINT}" transform="translate(${px.toFixed(1)} ${py.toFixed(1)}) rotate(${angle.toFixed(1)}) scale(${side*1.05} 1.05)" fill="#bf4c16" stroke="#f3f7fa" stroke-width=".8"/>`);
      next += 18; index++;
    }
    distance += length;
  }
  return marks.join('');
}

function venueMapGeometry(d3, mode, mobile, route) {
  const campus = mode === 'campus';
  const width = mobile ? 440 : 900;
  const height = mobile ? 520 : 720;
  const center = campus ? [9.1887, 45.4502] : [9.1878, 45.4556];
  const scale = campus ? (mobile ? 2000000 : 3300000) : (mobile ? 770000 : 1220000);
  const projection = d3.geoMercator().center(center).scale(scale).translate([width / 2, height / 2]);
  if (route && !campus) {
    projection.fitExtent([[mobile ? 64 : 130, 86], [width-(mobile ? 64 : 130), height-136]], {
      type: 'MultiLineString', coordinates: route.segments.map(segment => segment.coordinates)
    });
  }
  return {width, height, center: projection.invert([width/2,height/2]), scale: projection.scale(), projection};
}

function renderVenueMap(d3, data, mode, mobile, route) {
  const campus = mode === 'campus';
  const {width,height,center,projection} = venueMapGeometry(d3,mode,mobile,route);
  const geoPath = d3.geoPath(projection).digits(1);
  const [mx, my] = projection(HOME);
  const points = [];
  const text = (x,y,content,cls='label',anchor='middle',extra='') => `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" class="${cls}" text-anchor="${anchor}" ${extra}>${escape(content)}</text>`;
  const at = (coord, label, cls='label', dx=0, dy=0, anchor='middle') => {
    const [x,y] = projection(coord);
    points.push(text(x+dx,y+dy,label,cls,anchor));
  };
  const isVisible = (f) => {
    const b = geoPath.bounds(f);
    return b[1][0] >= -30 && b[0][0] <= width+30 && b[1][1] >= -30 && b[0][1] <= height+30;
  };
  const visible = data.features.filter(isVisible);
  const paths = (predicate, cls) => visible.filter(predicate).map(f=>`<path class="${cls}" d="${geoPath(f)}"/>`).join('');
  const kind = (name) => (f) => f.properties.kind === name;
  const roads = (name) => (f) => f.properties.kind === 'road' && f.properties.class === name;

  if (campus) {
    at([9.1926,45.4478], 'Ravizza', 'park-label');
    at([9.1926,45.4478], 'Park', 'park-label', 0, 19);
    at([9.1886,45.44695], 'NEW CAMPUS', 'district');
    if (!mobile) at([9.1848,45.4492], 'BOCCONI', 'district');
    // Road labels follow the actual orientation of their mapped coordinates.
    const roadNames = new Map([
      ['Viale Bligny', [9.1899,45.45192]],
      ['Via Roberto Sarfatti', [9.1878,45.44814]],
      ['Via Ferdinando Bocconi', [9.19053,45.44927]],
      ['Via Guglielmo Röntgen', [9.1864,45.45025]],
      ['Via Castelbarco', [9.18605,45.4469]]
    ]);
    for (const [name, coord] of roadNames) {
      const [x,y]=projection(coord);
      if (mobile && name === 'Viale Bligny') continue;
      if (x < 24 || x > width-24 || y < 45 || y > height-40) continue;
      const angle = /Bocconi|Castelbarco/.test(name) ? -83 : -7;
      const short = name.replace('Roberto ', '').replace('Ferdinando ', '').replace('Guglielmo ', '').replace(/^Via (.*)/, '$1 St').replace(/^Viale (.*)/, '$1 Ave');
      points.push(text(x,y,short,'street','middle',`transform="rotate(${angle} ${x.toFixed(1)} ${y.toFixed(1)})"`));
    }
    const [tx,ty]=projection([9.19035,45.45162]);
    points.push(`<circle cx="${tx}" cy="${ty}" r="6" fill="#0369a1" stroke="#fff" stroke-width="3"/>`);
    points.push(text(tx+(mobile?-10:12),ty-12,'Bocconi tram stop','label',mobile?'end':'start'));
    points.push(text(tx+(mobile?-10:12),ty+7,'TRAM 9','small',mobile?'end':'start'));
  } else if (!route) {
    const [dx,dy]=projection([9.1908,45.4641]);
    points.push(`<circle cx="${dx}" cy="${dy}" r="5" fill="#0369a1" stroke="#fff" stroke-width="2"/>`);
    points.push(text(dx,dy-19,'Milan Cathedral','landmark'));
    at([9.1772,45.4525], 'NAVIGLI DISTRICT', 'district');
    at([9.1800,45.45555], 'Darsena Basin', 'water-label', 0, -10);
    if (!mobile) at([9.194,45.4473], 'Ravizza Park', 'park-label',20,18);
    at([9.1786,45.4584], 'Basilicas', 'park-label');
    at([9.1786,45.4584], 'Park', 'park-label',0,17);
    for (const name of ['Crocetta','Porta Romana']) {
      const f = visible.find(f=>f.properties.kind==='station'&&f.properties.name===name);
      if(!f) continue;
      const [x,y]=projection(f.geometry.coordinates);
      const end = mobile && name==='Porta Romana';
      points.push(`<rect x="${x-13}" y="${y-11}" width="26" height="22" rx="4" fill="#ffd200" stroke="#856b00"/>`);
      points.push(text(x,y+4,'M3','metro'));
      points.push(text(x+(end?-17:17),y+5,name,'label',end?'end':'start'));
    }
    if (!mobile) {
      at([9.1985,45.4550], 'Porta Romana Avenue','street',0,0,'middle');
      at([9.184,45.463], 'HISTORIC CENTRE','district');
      at([9.199,45.4459], 'Isonzo Avenue','street');
    }
  }
  let routeMarkup = '';
  let routeMask = '';
  if (route) {
    const segmentPaths = route.segments.map(segment => geoPath({type:'LineString',coordinates:segment.coordinates}));
    // One continuous mask makes the reveal travel through legs in order.
    const track = geoPath({type:'LineString',coordinates:route.segments.flatMap(segment => segment.coordinates)});
    routeMask = `<mask id="route-reveal" maskUnits="userSpaceOnUse" x="0" y="0" width="${width}" height="${height}"><path class="map-route-reveal" d="${track}" fill="none" stroke="white" stroke-width="26" stroke-linecap="round" stroke-linejoin="round" pathLength="1"/></mask>`;
    routeMarkup = `<g class="map-route" mask="url(#route-reveal)">${route.segments.map((segment,index) => {
      const style = venueRouteStyle(segment), path = segmentPaths[index];
      if (segment.mode === 'walk') return `<path class="map-route-segment" d="${path}" fill="none" stroke="none"/>${venueWalkingMarks(segment.coordinates,projection)}`;
      return `<path d="${path}" fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>${segment.line === 'M3' ? `<path d="${path}" fill="none" stroke="${style.edge}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>` : ''}<path class="map-route-segment" d="${path}" fill="none" stroke="${style.color}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`;
    }).join('')}</g>`;
    route.stops.forEach((stop,index) => {
      const [x,y] = projection(stop.coordinates);
      if (x < 16 || x > width-16 || y < 40 || y > height-90) return;
      const radius = index === 0 ? 8 : 5;
      const style = venueRouteStyle(route.segments[Math.min(index,route.segments.length-1)]);
      routeMarkup += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${radius}" fill="#fff" stroke="${style.edge}" stroke-width="3"/>`;
      if (stop.label && (!campus || index === 0)) {
        const half = Math.min(width/2-20,stop.label.length*4.5);
        const tx = Math.max(half+16,Math.min(width-half-16,x));
        routeMarkup += text(tx,y-20,stop.label,index === 0 ? 'route-origin' : 'label');
      }
    });
    routeMarkup += '<circle class="map-route-traveller" r="6" fill="#0369a1" stroke="#fff" stroke-width="3" visibility="hidden"/>';
  }
  const barMetres = campus ? 100 : 500;
  const lonDelta = barMetres/(111320*Math.cos(center[1]*Math.PI/180));
  const barWidth = projection([center[0]+lonDelta,center[1]])[0] - projection(center)[0];
  const venueLabelX = Math.max(98, Math.min(width-98, mx));
  const venueLabelY = Math.min(height-27, my+48);
  const markup = `<svg class="venue-cartography" xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title desc">
<title id="title">ICAIF ’26 at Bocconi University, Via Röntgen 1</title>
<desc id="desc">${route ? `Illustrated route from ${escape(route.label)} to Bocconi. M2 is green, M3 is yellow, trams are blue. Copper footprints mark walking sections.` : `${campus?'Bocconi campus':'Central Milan'} locator map.`} Copper marks the Röntgen building. North is up. Map data © OpenStreetMap contributors.</desc>
<style>
text{font-family:Inter,Arial,sans-serif;fill:#24475e}.label,.landmark,.street,.district,.park-label,.water-label{paint-order:stroke;stroke:#f3f7fa;stroke-width:5;stroke-linejoin:round}.label{font-size:15px;font-weight:600}.landmark{font-size:${mobile?19:22}px;font-weight:700;fill:#075985}.street{font-size:${mobile?12:15}px;fill:#46657a;stroke-width:4}.district{font-size:${mobile?13:16}px;letter-spacing:2px;font-weight:600;fill:#557386}.park-label{font-size:13px;fill:#54766c;stroke:#edf4f1;stroke-width:4}.water-label{font-size:15px;font-style:italic;fill:#39728e}.small{font-size:11px;font-weight:600;fill:#47677c;paint-order:stroke;stroke:#f3f7fa;stroke-width:4}.metro{font-size:11px;fill:#493d10;font-weight:700}.park{fill:#e3eeea}.water{fill:#b5d4e2;stroke:#8fb7cc;stroke-width:1}.waterway{fill:none;stroke:#a5c9dc;stroke-width:7;stroke-linecap:round}.campus{fill:#e1edf4}.building{fill:#d0dde7;stroke:#f3f7fa;stroke-width:.8}.venue{fill:#c26a41;stroke:#a33d0e;stroke-width:1.5}.road{fill:none;stroke-linecap:round;stroke-linejoin:round}.minor{stroke:#dbe5ec;stroke-width:${campus?4:1.6}}.secondary-case{stroke:#fff;stroke-width:${campus?11:6}}.secondary{stroke:#b8cfdd;stroke-width:${campus?5:2.6}}.major-case{stroke:#fff;stroke-width:${campus?15:8}}.major{stroke:#9fbfD1;stroke-width:${campus?7:3.8}}
</style>
<defs>
${routeMask}
<radialGradient id="detail"><stop offset="0" stop-color="white"/><stop offset=".55" stop-color="white"/><stop offset="1" stop-color="black"/></radialGradient>
<mask id="focus"><ellipse cx="${mx}" cy="${my}" rx="${campus?width:width*.43}" ry="${campus?height:height*.38}" fill="url(#detail)"/></mask>
<linearGradient id="fade-x"><stop stop-color="#f3f7fa"/><stop offset=".07" stop-color="#f3f7fa" stop-opacity="0"/><stop offset=".93" stop-color="#f3f7fa" stop-opacity="0"/><stop offset="1" stop-color="#f3f7fa"/></linearGradient>
<linearGradient id="fade-y" x2="0" y2="1"><stop stop-color="#f3f7fa"/><stop offset=".065" stop-color="#f3f7fa" stop-opacity="0"/><stop offset=".92" stop-color="#f3f7fa" stop-opacity="0"/><stop offset="1" stop-color="#f3f7fa"/></linearGradient>
</defs>
<rect width="${width}" height="${height}" fill="#f3f7fa"/>
${paths(kind('park'),'park')}${paths(kind('campus'),'campus')}
<g mask="url(#focus)">${paths(kind('building'),'building')}</g>
${paths(kind('water'),'water')}${paths(kind('waterway'),'waterway')}
${paths(roads('minor'),'road minor')}${paths(roads('secondary'),'road secondary-case')}${paths(roads('secondary'),'road secondary')}${paths(roads('major'),'road major-case')}${paths(roads('major'),'road major')}
${paths(kind('venue'),'venue')}
<rect width="${width}" height="${height}" fill="url(#fade-x)"/><rect width="${width}" height="${height}" fill="url(#fade-y)"/>
${points.join('')}
${routeMarkup}
<g class="map-marker" transform="translate(${mx.toFixed(1)} ${my.toFixed(1)})">
<circle class="map-pulse" r="${campus?36:31}" fill="#bf4c16" fill-opacity=".09"/><circle r="${campus?23:20}" fill="none" stroke="#bf4c16" stroke-opacity=".22"/>
<g class="map-pin-icon"><path d="M0 0C-5-8-16-16-16-28a16 16 0 1 1 32 0C16-16 5-8 0 0Z" fill="#bf4c16" stroke="#fff" stroke-width="3"/><circle cy="-28" r="5" fill="#fff"/></g>
</g>
${text(venueLabelX,venueLabelY,'Röntgen building','venue-label')}
<style>.venue-label{fill:#0f2c42;font-size:${mobile?18:19}px;font-weight:700;paint-order:stroke;stroke:#f3f7fa;stroke-width:6;stroke-linejoin:round}.route-origin{font-size:${mobile?18:20}px;font-weight:700;fill:#075985;paint-order:stroke;stroke:#f3f7fa;stroke-width:7;stroke-linejoin:round}</style>
<g transform="translate(${width-31} 35)" fill="none" stroke="#43687f" stroke-width="1.4"><path d="M0 28V3M-5 11 0 3 5 11"/>${text(0,-5,'N','small')}</g>
<g transform="translate(26 ${height-28})" stroke="#57788d" stroke-width="1.5"><path d="M0-5V0H${barWidth.toFixed(1)}V-5" fill="none"/>${text(barWidth/2,-11,`${barMetres} m`,'small')}</g>
</svg>`;
  // SVG styles must not leak into the surrounding document when rendered inline.
  return markup.replace(/<style>([\s\S]*?)<\/style>/g, (_, css) => `<style>${css.replace(/([^{}]+)\{/g, (_, selectors) => selectors.split(',').map(selector => `.venue-cartography ${selector.trim()}`).join(',') + '{')}</style>`);
}
