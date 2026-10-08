'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const pages = fs.readdirSync(root).filter(file=>file.endsWith('.html')).sort();
const decode = s => s.replaceAll('&amp;','&').replaceAll('&quot;','"').replaceAll('&#39;',"'");
const read = file => fs.readFileSync(path.join(root,file),'utf8');
const graph = html => JSON.parse(html.match(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/)[1])['@graph'];
const canonical = file => `https://icaif2026.org/${file === 'index.html' ? '' : `${file.slice(0,-5)}/`}`;
const extractMeta = (html,key,name) => {
  const tag = [...html.matchAll(/<meta\b[^>]*>/g)].map(m=>m[0]).find(tag=>tag.includes(`${key}="${name}"`));
  return decode(tag.match(/content="([^"]*)"/)[1]);
};

test('all 17 canonical pages have unique coherent search and social metadata',()=>{
  assert.equal(pages.length,17);
  const titles = new Set(),descriptions = new Set();
  for(const file of pages) {
    const html=read(file), title=decode(html.match(/<title>(.*?)<\/title>/)[1]);
    const description=extractMeta(html,'name','description');
    assert.ok(title && description, file);
    assert.ok(!titles.has(title),`${file} duplicate title`);
    assert.ok(!descriptions.has(description),`${file} duplicate description`);
    titles.add(title);descriptions.add(description);
    assert.equal(extractMeta(html,'property','og:title'),title,file);
    assert.equal(extractMeta(html,'name','twitter:title'),title,file);
    assert.equal(extractMeta(html,'property','og:description'),description,file);
    assert.equal(extractMeta(html,'name','twitter:description'),description,file);
    assert.equal(extractMeta(html,'property','og:url'),canonical(file),file);
    const canonicalTag=[...html.matchAll(/<link\b[^>]*>/g)].map(m=>m[0]).find(tag=>tag.includes('rel="canonical"'));
    assert.equal(canonicalTag.match(/href="([^"]*)"/)[1],canonical(file),file);
    const webpage=graph(html).find(x=>x['@type']==='WebPage');
    assert.equal(webpage.url,canonical(file),file);
    assert.equal(webpage.name,title,file);
    assert.equal(webpage.description,description,file);
    assert.equal((html.match(/<h1\b/g)||[]).length,1,file);
  }
});

test('event truth and all structured-data references agree throughout the site',()=>{
  let event;
  for(const file of pages) {
    const nodes=graph(read(file)), ids=new Set(nodes.map(node=>node['@id']));
    assert.equal(ids.size,nodes.length,`${file} repeated entity id`);
    const current=nodes.find(node=>node['@type']==='Event');
    if(!event)event=current;
    assert.deepEqual(current,event,`${file} conference facts drifted`);
    assert.equal(current.startDate,'2026-11-14');
    assert.equal(current.endDate,'2026-11-17');
    assert.equal(current.location.address.streetAddress,'Via Röntgen 1');
    assert.equal(current.eventAttendanceMode,'https://schema.org/MixedEventAttendanceMode');
    const inspect=value=>{
      if(!value || typeof value!=='object')return;
      if(Object.keys(value).length===1 && value['@id'])assert.ok(ids.has(value['@id']),`${file} dangling reference ${value['@id']}`);
      Object.values(value).forEach(inspect);
    };
    nodes.forEach(inspect);
    assert.ok(!JSON.stringify(nodes).includes('&amp;'),`${file} undecoded HTML entity`);
    const breadcrumb=nodes.find(node=>node['@type']==='BreadcrumbList');
    if(file==='index.html')assert.equal(breadcrumb,undefined);
    else {
      assert.equal(breadcrumb.itemListElement.length,2,file);
      assert.equal(breadcrumb.itemListElement[1].item,canonical(file),file);
    }
  }
});

test('sitemap has canonical URLs and factual update dates matching each page',()=>{
  const sitemap=read('sitemap.xml');
  const entries=[...sitemap.matchAll(/<url>([\s\S]*?)<\/url>/g)].map(m=>({url:m[1].match(/<loc>(.*?)<\/loc>/)[1],updated:m[1].match(/<lastmod>(.*?)<\/lastmod>/)[1]}));
  assert.equal(entries.length,pages.length);
  assert.equal(new Set(entries.map(x=>x.url)).size,pages.length);
  for(const file of pages){
    const entry=entries.find(x=>x.url===canonical(file));
    assert.ok(entry,file);
    assert.equal(entry.updated,graph(read(file)).find(x=>x['@type']==='WebPage').dateModified,file);
  }
  assert.ok(!entries.some(x=>x.url.includes('.html')||x.url.includes('?')));
});

test('skip targets are focusable and superseded dates remain readable',()=>{
  for(const file of pages) {
    const html=read(file);
    assert.ok(/<main\b[^>]*id="main-content"[^>]*tabindex="-1"/.test(html),file);
    assert.ok(/href="#main-content"/.test(html),file);
    for(const tag of html.matchAll(/<(?:time|del)\b[^>]*>/g))assert.ok(!tag[0].includes('opacity-50'),`${file} faded factual date`);
  }
  assert.ok(!read('css/tailwind.input.css').includes('0.01ms'));
  assert.ok(!read('js/site-layout.js').includes('motion-safe:animate-ping'));
});

test('registration fee periods have independent row groups without dropping mobile prices',()=>{
  const html=read('registration.html');
  const table=html.match(/<table class="table min-w-\[920px\]">[\s\S]*?<\/table>/)[0];
  const groups=[...table.matchAll(/<tbody>([\s\S]*?)<\/tbody>/g)].map(m=>m[1]);
  assert.equal(groups.length,3);
  for(const body of groups){
    assert.equal((body.match(/<tr>/g)||[]).length,3);
    assert.equal((body.match(/scope="rowgroup"/g)||[]).length,1);
    assert.equal((body.match(/scope="row"/g)||[]).length,3);
    assert.equal((body.match(/<td\b/g)||[]).length,15);
  }
  assert.equal((table.match(/&euro;\d+/g)||[]).length,45);
});

test('author registration policy distinguishes main conference and workshop papers',()=>{
  const text=read('registration.html').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ');
  assert.ok(text.includes('Each accepted main conference paper'));
  assert.ok(text.includes('For an accepted workshop paper, a Workshop Days registration is sufficient.'));
  assert.ok(!text.includes('Each accepted paper must be associated with one in-person Passport'));
});
