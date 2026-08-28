#!/usr/bin/env node

'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const htmlFiles = fs.readdirSync(root).filter((file) => file.endsWith('.html')).sort();
const errors = [];
const usedIcons = new Set();
const navigationSignatures = new Map();
const footerSignatures = new Map();
const assetVersions = new Map();

function addError(file, message) {
    errors.push(`${file}: ${message}`);
}

function getAttributes(tag) {
    return Object.fromEntries(
        Array.from(tag.matchAll(/([:\w-]+)\s*=\s*["']([^"']*)["']/g), (match) => [match[1], match[2]])
    );
}

function getLocalTarget(url) {
    if (!url || /^(?:https?:|mailto:|tel:|javascript:|data:|#)/i.test(url)) {
        return null;
    }

    let target = decodeURIComponent(url.split('#')[0].split('?')[0]);
    if (!target) {
        return null;
    }

    if (target.endsWith('/')) {
        target += 'index.html';
    }

    return path.resolve(root, target);
}

function getBlock(html, tagName) {
    const match = html.match(new RegExp(`<${tagName}\\b[\\s\\S]*?<\\/${tagName}>`, 'i'));
    return match ? match[0] : '';
}

function getHrefSignature(block) {
    return Array.from(block.matchAll(/href=["']([^"']+)/gi), (match) => match[1]).join('|');
}

function recordSignature(collection, signature, file) {
    if (!collection.has(signature)) {
        collection.set(signature, []);
    }
    collection.get(signature).push(file);
}

for (const file of htmlFiles) {
    const html = fs.readFileSync(path.join(root, file), 'utf8');

    if (!/<title>[^<]+<\/title>/i.test(html)) addError(file, 'missing page title');
    if (!/<meta\s+name=["']description["']/i.test(html)) addError(file, 'missing meta description');
    if (!/<link\s+rel=["']canonical["']/i.test(html)) addError(file, 'missing canonical URL');
    if ((html.match(/<h1\b/gi) || []).length !== 1) addError(file, 'must contain exactly one h1');
    if ((html.match(/<main\b/gi) || []).length !== 1) addError(file, 'must contain exactly one main element');
    if (/<style\b/i.test(html)) addError(file, 'contains inline CSS; move it to a shared stylesheet');

    const ids = Array.from(html.matchAll(/\bid=["']([^"']+)["']/gi), (match) => match[1]);
    const duplicateIds = Array.from(new Set(ids.filter((id, index) => ids.indexOf(id) !== index)));
    if (duplicateIds.length) addError(file, `duplicate ids: ${duplicateIds.join(', ')}`);

    for (const match of html.matchAll(/<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi)) {
        try {
            JSON.parse(match[1]);
        } catch {
            addError(file, 'contains invalid JSON-LD');
        }
    }

    for (const match of html.matchAll(/data-heroicon=["']([^"']+)/gi)) {
        usedIcons.add(match[1]);
    }

    for (const match of html.matchAll(/<(?:a|img|script|link)\b[^>]*>/gi)) {
        const attributes = getAttributes(match[0]);

        for (const attribute of ['href', 'src']) {
            const target = getLocalTarget(attributes[attribute]);
            if (target && !fs.existsSync(target)) {
                addError(file, `missing local target ${attributes[attribute]}`);
            }
        }

        if (attributes.target === '_blank' && !(attributes.rel || '').includes('noopener')) {
            addError(file, `external link is missing rel="noopener": ${attributes.href}`);
        }
    }

    for (const match of html.matchAll(/(?:css\/(?:tailwind\.min|responsive)\.css|js\/(?:site|heroicons)\.js)\?v=([0-9]+)/g)) {
        const asset = match[0].split('?')[0];
        if (!assetVersions.has(asset)) assetVersions.set(asset, new Set());
        assetVersions.get(asset).add(match[1]);
    }

    recordSignature(navigationSignatures, getHrefSignature(getBlock(html, 'nav')), file);
    recordSignature(footerSignatures, getHrefSignature(getBlock(html, 'footer')), file);
}

const iconSource = fs.readFileSync(path.join(root, 'js', 'heroicons.js'), 'utf8');
const definedIcons = new Set(
    Array.from(iconSource.matchAll(/^\s*(?:'([^']+)'|([a-z][\w-]*))\s*:/gm), (match) => match[1] || match[2])
);

for (const icon of usedIcons) {
    if (!definedIcons.has(icon)) addError('js/heroicons.js', `missing icon definition for ${icon}`);
}

if (navigationSignatures.size !== 1) {
    addError('navigation', `inconsistent link sets across ${navigationSignatures.size} page groups`);
}

if (footerSignatures.size !== 1) {
    addError('footer', `inconsistent link sets across ${footerSignatures.size} page groups`);
}

for (const [asset, versions] of assetVersions) {
    if (versions.size !== 1) addError(asset, `inconsistent cache versions: ${Array.from(versions).join(', ')}`);
}

if (errors.length) {
    console.error(`Site checks failed (${errors.length}):`);
    errors.forEach((error) => console.error(`- ${error}`));
    process.exitCode = 1;
} else {
    console.log(`Site checks passed for ${htmlFiles.length} HTML pages.`);
}
