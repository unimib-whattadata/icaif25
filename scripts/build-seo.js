#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const origin = 'https://icaif2026.org';

function validDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
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
  'workshop-papers.html': 'Browse 113 ICAIF 2026 workshop papers across nine workshops, with poster presentations labelled and presenting authors underlined.',
  'accepted-papers.html': 'Browse the 214 accepted ICAIF 2026 papers: oral presentations, poster presentations and proceedings only, with titles, authors and affiliations.',
  'index.html': 'ICAIF 2026 has concluded. Explore the programme, accepted papers and ACM proceedings from the conference held in Milan on November 14–17, 2026.',
  'call-for-papers.html': 'Archived ICAIF 2026 paper call: research topics, submission requirements and review policies. The call is closed.',
  'call-for-workshop-proposals.html': 'Archived ICAIF 2026 workshop proposal call, including its original requirements and deadlines. Submissions are closed.',
  'call-for-tutorials.html': 'Archived ICAIF 2026 tutorial proposal call, including its original requirements and selection criteria. Submissions are closed.',
  'call-for-competitions.html': 'Archived ICAIF 2026 competition proposal call, including its original requirements and selection criteria. Submissions are closed.',
  'programme.html': "Preliminary ICAIF '26 programme in Milan, November 14–17, 2026: keynotes, panels, workshops and tutorials. Browse scheduled sessions and save a personal agenda.",
  'tutorials.html': "ICAIF '26 tutorials in Milan on November 14–15, 2026. Explore schedules, presenters and abstracts on trustworthy AI, Bayesian calibration and financial agents.",
  'news.html': 'ICAIF news: Atlanta will host the 2027 conference. Explore the 2026 Best Paper and Best Poster awards and announcements from the Milan edition.',
  'call-for-student-volunteers.html': 'Archived ICAIF 2026 Student Volunteer call, including the original duties, eligibility and application dates. Applications are closed.',
  'registration.html': 'ICAIF 2026 registration is closed. Find administrative support and archived registration information for the November 14–17, 2026 conference.',
  'important-dates.html': 'Historical ICAIF 2026 dates and deadlines for papers, workshops, student volunteers and registration. All calls and registration periods have ended.',
  'venue.html': 'ICAIF 2026 was held at Bocconi University, Via Röntgen 1, Milan, on November 14–17. Explore the building and archived conference floor plans.',
  'become-a-sponsor.html': 'Archived sponsorship prospectus and opportunities for ICAIF 2026. The conference has concluded; its sponsors and supporters remain acknowledged.',
  'qrt-student-travel-awards.html': 'Archived QRT Student Travel Awards information for ICAIF 2026, including the original eligibility and selection criteria. Applications are closed.',
  'screensaver.html': 'The ICAIF 2026 conference screensaver has been retired. Visit the programme and research archive from the November 14–17, 2026 edition.',
  'media-kit.html': 'The ICAIF 2026 media kit has been removed. Visit the conference archive for the programme, research and news from the Milan edition.',
  'sponsors-and-supporters.html': 'Thank you to the sponsors and supporters of ICAIF 2026, held in Milan on November 14–17, 2026.',
  'competitions.html': 'Competition descriptions, organisers and resources from ICAIF 2026, held in Milan on November 14–17, 2026.',
  'workshop.html': 'Workshop descriptions, organisers and detailed agendas from ICAIF 2026, held in Milan on November 14–15, 2026.',
};
const titles = {
  'workshop-papers.html': 'Workshop Papers | ICAIF 2026 Milan',
  'accepted-papers.html': 'Accepted Papers | ICAIF 2026 Milan',
  'index.html': 'ICAIF 2026 Milan | ACM Conference on AI in Finance',
  'registration.html': 'Registration Archive & Support | ICAIF 2026 Milan',
  'important-dates.html': 'Dates & Deadlines Archive | ICAIF 2026 Milan',
  'programme.html': 'Conference Programme | ICAIF 2026 Milan',
  'workshop.html': 'AI in Finance Workshops | ICAIF 2026 Milan',
  'tutorials.html': 'AI in Finance Tutorials | ICAIF 2026 Milan',
  'competitions.html': 'AI in Finance Competitions | ICAIF 2026 Milan',
  'venue.html': 'Venue: Bocconi University | ICAIF 2026 Milan',
  'screensaver.html': 'Screensaver Retired | ICAIF 2026 Milan',
  'media-kit.html': 'Media Kit Removed | ICAIF 2026 Milan',
  'become-a-sponsor.html': 'Sponsorship Archive | ICAIF 2026 Milan',
};
const image = {
  '@type': 'ImageObject', '@id': `${origin}/#conference-image`,
  url: `${origin}/img/hero/icaif-waves-hero-v1.jpg`, width:1774,height:887,
  caption:'ICAIF 2026 navy, blue and copper wave illustration',
  creditText:'AI-generated for ICAIF 2026, coordinated with the conference brand artwork.',
};
const organization = {'@type':'Organization','@id':`${origin}/#organizer`,name:'ACM ICAIF',url:`${origin}/`,email:'andrea.maurino@unimib.it'};
const event = {
  '@type':'Event','@id':`${origin}/#event`,name:"ICAIF '26 — 7th ACM International Conference on AI in Finance",
  description:'The 7th ACM International Conference on AI in Finance was held in Milan, Italy, November 14–17, 2026. Workshops and tutorials on November 14–15; main conference on November 16–17.',
  startDate:'2026-11-14',endDate:'2026-11-17',
  eventAttendanceMode:'https://schema.org/MixedEventAttendanceMode',
  eventStatus:'https://schema.org/EventScheduled',url:`${origin}/`,image:{'@id':image['@id']},
  location:{'@type':'Place',name:'Bocconi University',address:{'@type':'PostalAddress',streetAddress:'Via Röntgen 1',addressLocality:'Milan',addressCountry:'IT'}},
  organizer:{'@id':organization['@id']},
};
const website = {'@type':'WebSite','@id':`${origin}/#website`,url:`${origin}/`,name:'ICAIF 2026',alternateName:"ICAIF '26",description:'Official website of the ACM International Conference on AI in Finance, Milan, November 14–17, 2026.',inLanguage:'en',publisher:{'@id':organization['@id']}};

function buildSeo(root, { updated, onlyPages = [] } = {}) {
  if (updated !== undefined && !validDate(updated)) throw new Error('Use --updated YYYY-MM-DD with a valid significant content update date.');
  if (onlyPages.length && updated === undefined) throw new Error('--page requires --updated YYYY-MM-DD.');
  const files = fs.readdirSync(root).filter(file=>file.endsWith('.html')).sort();
  for (const file of onlyPages) {
    if (!files.includes(file)) throw new Error(`Unknown canonical page: ${file}`);
  }
  const sitemap = [];
  const outputs = [];
  for (const file of files) {
    const home = file === 'index.html';
    const url = `${origin}/${home ? '' : `${file.slice(0,-5)}/`}`;
    let html = fs.readFileSync(path.join(root,file),'utf8');
    const previousGraph = JSON.parse(html.match(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/)[1])['@graph'];
    const previousDate = previousGraph.find(node=>node['@type']==='WebPage')?.dateModified;
    const modified = updated !== undefined && (!onlyPages.length || onlyPages.includes(file)) ? updated : previousDate;
    if (!validDate(modified)) throw new Error(`${file} requires a valid dateModified; supply --updated YYYY-MM-DD --page ${file}.`);
    const title = titles[file] || decode(html.match(/<title>([\s\S]*?)<\/title>/)[1]).trim().replaceAll("ICAIF '26", 'ICAIF 2026');
    const h1 = decode(html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/)[1].replace(/<[^>]*>/g,' ')).replace(/\s+/g,' ').trim();
    const description = (descriptions[file] || meta(html,'name','description'))?.replaceAll("ICAIF '26", 'ICAIF 2026');
    if (!description) throw new Error(`${file} requires a page description`);
    html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${escape(title)}</title>`);
    html = setMeta(html,'name','description',description);
    html = setMeta(html,'property','og:description',description);
    html = setMeta(html,'name','twitter:description',description);
    html = setMeta(html,'property','og:title',title);
    html = setMeta(html,'name','twitter:title',title);
    html = setMeta(html,'property','og:url',url);
    html = setMeta(html,'property','og:site_name',website.name);
    html = setMeta(html,'property','og:image',image.url);
    html = setMeta(html,'property','og:image:secure_url',image.url);
    html = setMeta(html,'property','og:image:width',String(image.width));
    html = setMeta(html,'property','og:image:height',String(image.height));
    html = setMeta(html,'property','og:image:alt',image.caption);
    html = setMeta(html,'name','twitter:image',image.url);
    html = setMeta(html,'name','twitter:image:alt',image.caption);
    const page = {'@type':'WebPage','@id':`${url}#webpage`,url,name:title,description,inLanguage:'en',dateModified:modified,isPartOf:{'@id':website['@id']},about:{'@id':event['@id']},primaryImageOfPage:{'@id':image['@id']}};
    const graph = [website,organization,event,image,page];
    if (file === 'news.html') {
      const items = [...html.matchAll(/<article\b[^>]*\bid="([^"]+)"[^>]*>[\s\S]*?<h3\b[^>]*>([\s\S]*?)<\/h3>/g)].map((match, index)=>({
        '@type':'ListItem',position:index + 1,url:`${url}#${match[1]}`,
        name:decode(match[2].replace(/<[^>]*>/g,' ')).replace(/\s+/g,' ').trim(),
      }));
      if (!items.length) throw new Error('News requires visible announcements for its structured list.');
      const announcements = {'@type':'ItemList','@id':`${url}#announcements`,name:'ICAIF 2026 news and announcements',itemListOrder:'https://schema.org/ItemListOrderDescending',numberOfItems:items.length,itemListElement:items};
      page.mainEntity = {'@id':announcements['@id']};
      graph.push(announcements);
    }
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
    outputs.push([path.join(root,file),html]);
    sitemap.push(`    <url>\n        <loc>${url}</loc>\n        <lastmod>${modified}</lastmod>\n    </url>`);
  }
  for (const [file, html] of outputs) fs.writeFileSync(file,html);
  fs.writeFileSync(path.join(root,'sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemap.join('\n')}\n</urlset>\n`);
  console.log(`Aligned SEO metadata and structured data for ${files.length} canonical pages.`);
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const options = { onlyPages: [] };
  for (let index = 0; index < args.length; index += 1) {
    const flag = args[index];
    const value = args[++index];
    if (value === undefined || value.startsWith('--')) throw new Error(`Missing value for ${flag}`);
    if (flag === '--updated') options.updated = value;
    else if (flag === '--page') options.onlyPages.push(value);
    else throw new Error(`Unknown option: ${flag}`);
  }
  buildSeo(path.resolve(__dirname, '..'), options);
}

module.exports = { buildSeo };
