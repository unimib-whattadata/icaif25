'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname,'../js/home-stats.js'),'utf8');

function loadAt(isoDate) {
  const now=Date.parse(isoDate);
  const window={setInterval(){}};
  const document={hidden:false,querySelector(){return null;},addEventListener(){}};
  class ClockDate extends Date { static now(){return now;} }
  vm.runInNewContext(source,{window,document,Date:ClockDate,Intl});
  return {next:window.ICAIFMilestones.getNextMilestone(now)};
}

test('home follows the extended workshop dates also at AoE boundaries',()=>{
  const cases=[
    ['2026-10-08T12:00:00Z','2026-10-12'],
    ['2026-10-13T11:59:59.999Z','2026-10-12'],
    ['2026-10-13T12:00:00Z','2026-10-16'],
    ['2026-10-17T11:59:59.999Z','2026-10-16'],
    ['2026-10-17T12:00:00Z','2026-10-18'],
    ['2026-10-19T12:00:00Z','2026-10-25'],
  ];
  for(const [now,expected] of cases)assert.equal(loadAt(now).next.date,expected,now);
  assert.equal(loadAt('2026-11-18T12:00:00Z').next,null);
});
