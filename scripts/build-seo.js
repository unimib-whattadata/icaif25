#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const origin = 'https://icaif2026.org';
const dateFlag = process.argv.indexOf('--updated');
const updated = dateFlag >= 0 ? process.argv[dateFlag + 1] : '2026-10-08';
if (!/^\d{4}-\d{2}-\d{2}$/.test(updated) || new Date(`${updated}T12:00:00Z`).toISOString().slice(0,10) !== updated) {
  throw new Error('Use --updated YYYY-MM-DD with the date of a significant content update.');
}

const decode = value => value.replace(/&#(\d+);/g, (_,n)=>String.fromCodePoint(Number(n)))
  .replace(/&#x([\da-f]+);/gi,(_,n)=>String.fromCodePoint(parseInt(n,16)))
  .replaceAll('&amp;','&').replaceAll('&quot;','"').replaceAll('&#39;',"'")
  .replaceAll('&apos;',"'").replaceAll('&lt;','<').replaceAll('&gt;','>');
const escape = value => value.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const attrs = tag => Object.fromEntries([...tag.matchAll(/([\w-]+)="([^"]*)"/g)].map(m=>[m[1],decode(m[2])]));
const meta = (html,key,value) => [...html.matchAll(/<meta\b[^>]*>/g)].map(m=>attrs(m[0])).find(a=>a[key]===value)?.content;
const setMeta = (html,key,name,value) => html.replace(/<meta\b[^>]*>/g,tag=>attrs(tag)[key]===name
  ? `<meta ${key}="${name}" content="${escape(value)}">` : tag);
const descriptions = {
  'call-for-papers.html': "Requirements, research topics and review policies for the ICAIF '26 paper call. Main conference in Milan, Italy, November 16–17, 2026.",
  'call-for-workshop-proposals.html': "Workshop proposal requirements and paper deadlines for ICAIF '26. Explore the accepted workshops in Milan, Italy, November 14–15, 2026.",
  'call-for-tutorials.html': "Tutorial proposal requirements, selection criteria and deadlines for ICAIF '26. Tutorials take place in Milan, Italy, November 14–15, 2026.",
  'call-for-competitions.html': "Competition proposal requirements and selection criteria for ICAIF '26. Explore the accepted competitions and preliminary schedule in Milan.",
  'programme.html': "Preliminary ICAIF '26 programme, Milan, November 14–17, 2026. Browse sessions by day, room and type, and save a personal agenda.",
};
const image = {
  '@type': 'ImageObject', '@id': `${origin}/#conference-image`,
  url: `${origin}/img/piazza-duomo-tramonto.jpg`, width:1536,height:1024,
  caption:'Milan Cathedral and Piazza del Duomo at sunset',
  creditText:'Based on Piazza del Duomo by kuhnmi (original photograph: CC BY 2.0). AI-edited for ICAIF 2026: people removed; lighting, sky and colors modified.',
  isBasedOn:{'@type':'ImageObject',url:'https://commons.wikimedia.org/wiki/File:Piazza_del_Duomo_-_kuhnmi.jpg',license:'https://creativecommons.org/licenses/by/2.0/'},
};
const organization = {'@type':'Organization','@id':`${origin}/#organizer`,name:'ACM ICAIF',url:`${origin}/`,email:'andrea.maurino@unimib.it'};
const event = {
  '@type':'Event','@id':`${origin}/#event`,name:"ICAIF '26 — 7th ACM International Conference on AI in Finance",
  description:'The 7th ACM International Conference on AI in Finance in Milan, Italy, November 14–17, 2026. Workshops and tutorials on November 14–15; main conference on November 16–17.',
  startDate:'2026-11-14',endDate:'2026-11-17',
  eventAttendanceMode:'https://schema.org/MixedEventAttendanceMode',
  eventStatus:'https://schema.org/EventScheduled',url:`${origin}/`,image:{'@id':image['@id']},
  location:{'@type':'Place',name:'Bocconi University',address:{'@type':'PostalAddress',streetAddress:'Via Röntgen 1',addressLocality:'Milan',addressCountry:'IT'}},
  organizer:{'@id':organization['@id']},
};
const website = {'@type':'WebSite','@id':`${origin}/#website`,url:`${origin}/`,name:"ICAIF '26",description:'Official website of the ACM International Conference on AI in Finance, Milan, November 14–17, 2026.',inLanguage:'en',publisher:{'@id':organization['@id']}};
const files = fs.readdirSync(root).filter(file=>file.endsWith('.html')).sort();
const sitemap = [];
for (const file of files) {
  const home = file === 'index.html';
  const url = `${origin}/${home ? '' : `${file.slice(0,-5)}/`}`;
  let html = fs.readFileSync(path.join(root,file),'utf8');
  const title = decode(html.match(/<title>([\s\S]*?)<\/title>/)[1]).trim();
  const h1 = decode(html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/)[1].replace(/<[^>]*>/g,' ')).replace(/\s+/g,' ').trim();
  const description = descriptions[file] || meta(html,'name','description');
  if (!description) throw new Error(`${file} requires a page description`);
  html = setMeta(html,'name','description',description);
  html = setMeta(html,'property','og:description',description);
  html = setMeta(html,'name','twitter:description',description);
  html = setMeta(html,'property','og:title',title);
  html = setMeta(html,'name','twitter:title',title);
  html = setMeta(html,'property','og:url',url);
  html = setMeta(html,'property','og:image:alt',image.caption);
  html = setMeta(html,'name','twitter:image:alt',image.caption);
  const page = {'@type':'WebPage','@id':`${url}#webpage`,url,name:title,description,inLanguage:'en',dateModified:updated,isPartOf:{'@id':website['@id']},about:{'@id':event['@id']},primaryImageOfPage:{'@id':image['@id']}};
  const graph = [website,organization,event,image,page];
  if (!home) {
    const breadcrumb = {'@type':'BreadcrumbList','@id':`${url}#breadcrumb`,itemListElement:[
      {'@type':'ListItem',position:1,name:'Home',item:`${origin}/`},
      {'@type':'ListItem',position:2,name:h1,item:url},
    ]};
    page.breadcrumb = {'@id':breadcrumb['@id']};
    graph.push(breadcrumb);
  }
  const json = JSON.stringify({'@context':'https://schema.org','@graph':graph},null,2).replace(/</g,'\\u003c');
  const script = `<script type="application/ld+json">\n${json.split('\n').map(line=>'      '+line).join('\n')}\n    </script>`;
  if (!/<script\b[^>]*type="application\/ld\+json"/.test(html)) throw new Error(`${file} has no structured-data block`);
  html = html.replace(/<script\b[^>]*type="application\/ld\+json"[^>]*>[\s\S]*?<\/script>/,script);
  fs.writeFileSync(path.join(root,file),html);
  sitemap.push(`    <url>\n        <loc>${url}</loc>\n        <lastmod>${updated}</lastmod>\n    </url>`);
}
fs.writeFileSync(path.join(root,'sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemap.join('\n')}\n</urlset>\n`);
console.log(`Aligned SEO metadata and structured data for ${files.length} canonical pages.`);
