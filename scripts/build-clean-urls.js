#!/usr/bin/env node

'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const checkOnly = process.argv.includes('--check');
const redirectScript = '    <script src="/js/clean-url.js?v=2026092501"></script>\n';
const pages = fs.readdirSync(root).filter((file) => file.endsWith('.html') && file !== 'index.html').sort();

function prefixLocal(url) {
  if (!url || /^(?:#|\/|[a-z][a-z\d+.-]*:)/i.test(url)) return url;
  return `../${url}`;
}

function preparePage(source) {
  return source.replace(redirectScript, '').replace(/(\s)(href|src|srcset|poster|action)=(['"])([\s\S]*?)\3/g, (match, space, name, quote, value) => {
    const updated = name === 'srcset'
      ? value.replace(/(^|,)(\s*)(\S+)/g, (entry, separator, whitespace, url) => `${separator}${whitespace}${prefixLocal(url)}`)
      : prefixLocal(value);
    return `${space}${name}=${quote}${updated}${quote}`;
  });
}

let outOfDate = false;
for (const page of pages) {
  const destination = path.join(root, page.slice(0, -5), 'index.html');
  const output = preparePage(fs.readFileSync(path.join(root, page), 'utf8'));
  const existing = fs.existsSync(destination) ? fs.readFileSync(destination, 'utf8') : null;
  if (existing === output) continue;

  if (checkOnly) {
    console.error(`${path.relative(root, destination)} is missing or out of date`);
    outOfDate = true;
  } else {
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.writeFileSync(destination, output);
  }
}

if (outOfDate) process.exitCode = 1;
else if (!checkOnly) console.log(`Built ${pages.length} clean URL pages.`);
