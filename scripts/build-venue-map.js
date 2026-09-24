#!/usr/bin/env node
'use strict';

// The same D3 Array + D3 Geo stack as Viterie Orobiche, rendered at build time.
// Shipping SVGs keeps the map available without JavaScript or external services.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const context = vm.createContext({});
for (const file of ['d3-array-3.2.4.min.js', 'd3-geo-3.1.1.min.js']) {
  vm.runInContext(fs.readFileSync(path.join(root, 'js/vendor', file), 'utf8'), context);
}
const d3 = context.d3;
const data = JSON.parse(fs.readFileSync(path.join(root, 'assets/venue/milan.geojson'), 'utf8'));
vm.runInContext(fs.readFileSync(path.join(root, 'js/venue-map-renderer.js'), 'utf8'), context);
for (const mode of ['city','campus']) {
  for (const mobile of [false,true]) {
    const name = `map-${mode}${mobile?'-mobile':''}.svg`;
    fs.writeFileSync(path.join(root, 'assets/venue', name),context.renderVenueMap(d3,data,mode,mobile));
    console.log(`Built ${name}`);
  }
}
