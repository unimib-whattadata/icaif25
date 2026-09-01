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
const requiredComponentClasses = ['navbar', 'menu', 'dropdown', 'hero', 'footer'];
const daisyComponentRoots = new Set([
    'alert',
    'aura',
    'badge',
    'btn',
    'card',
    'dropdown',
    'footer',
    'hero',
    'link',
    'list',
    'list-row',
    'menu',
    'navbar',
    'stats',
    'steps',
    'table',
]);
const forbiddenCardUtilities = new Set([
    'border',
    'border-base-300',
    'hover:-translate-y-1',
    'rounded-box',
    'transition-all',
    'transition-transform',
]);
const forbiddenNonDefaultComponentClasses = [
    /^card-(?:border|dash|xs|sm|md|lg|xl)$/,
    /^btn-(?:neutral|primary|secondary|accent|info|success|warning|error|outline|dash|soft|ghost|link|active|xs|sm|md|lg|xl|wide|block|square|circle)$/,
    /^badge-(?:outline|dash|soft|ghost|neutral|primary|secondary|accent|info|success|warning|error|xs|sm|md|lg|xl)$/,
    /^table-(?:zebra|pin-rows|pin-cols|xs|sm|md|lg|xl)$/,
    /^link-(?:hover|neutral|primary|secondary|accent|success|info|warning|error)$/,
    /^alert-(?:outline|dash|soft|info|success|warning|error)$/,
    /^step-(?:neutral|primary|secondary|accent|info|success|warning|error)$/,
];
const allowedPriorityActionComponentClasses = new Set(['btn-accent', 'btn-lg']);
const allowedEmphasisAlertComponentClasses = new Set(['alert-info', 'alert-soft']);
const allowedRegistrationPhaseBadgeClasses = new Set([
    'badge-success',
    'badge-info',
    'badge-warning',
]);
const allowedPositiveStatusBadgeClasses = new Set(['badge-success']);
const allowedWorkshopSubmissionBadgeClasses = new Set(['badge-info']);
const requiredDaisyModules = new Set([
    'alert',
    'aura',
    'badge',
    'button',
    'card',
    'dropdown',
    'footer',
    'hero',
    'link',
    'list',
    'menu',
    'navbar',
    'properties',
    'radius',
    'rootcolor',
    'rootscrollgutter',
    'rootscrolllock',
    'scrollbar',
    'stat',
    'steps',
    'svg',
    'table',
]);
const requiredCompiledCssSelectors = [
    '@font-face',
    '.alert{',
    '.aura{',
    '.badge{',
    '.btn{',
    '.card{',
    '.dropdown{',
    '.footer{',
    '.hero{',
    '.link{',
    '.list{',
    '.menu{',
    '.navbar{',
    '.stats{',
    '.steps{',
    '.table{',
];
const excludedCompiledCssSelectors = [
    '.carousel{',
    '.chat{',
    '.checkbox{',
    '.diff{',
    '.drawer{',
    '.modal{',
    '.rating{',
    '.toggle{',
    '.tooltip{',
];
const forbiddenLegacyClasses = new Set([
    'card-shadow',
    'hero-background',
    'hero-reveal',
    'linkedin-embed',
    'workshops-shell',
    'workshops-intro',
    'workshop-list',
    'workshop-submission',
    'workshop-submission-label',
    'workshop-submission-track',
    'workshop-submission-actions',
    'workshop-submit-button',
    'workshop-website-link',
    'committee-card',
    'committee-card-with-ribbon',
    'committee-grid',
    'committee-photo',
    'committee-photo-placeholder',
    'committee-ribbon',
]);

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

function getLocalFragment(url, currentFile) {
    if (!url || /^(?:https?:|mailto:|tel:|javascript:|data:)/i.test(url) || !url.includes('#')) {
        return null;
    }

    const [targetPart, fragmentPart] = url.split('#');
    if (!fragmentPart) {
        return null;
    }

    let target = decodeURIComponent(targetPart.split('?')[0]) || currentFile;
    if (target.endsWith('/')) {
        target += 'index.html';
    }

    return {
        fragment: decodeURIComponent(fragmentPart),
        target: path.resolve(root, target),
    };
}

function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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
    const animatedHeroOverlayTags = Array.from(
        html.matchAll(/<div\b[^>]*\bdata-animated-hero-overlay\b[^>]*>/gi),
        (match) => match[0]
    );

    if (!/<title>[^<]+<\/title>/i.test(html)) addError(file, 'missing page title');
    if (!/<meta\s+name=["']description["']/i.test(html)) addError(file, 'missing meta description');
    if (!/<link\s+rel=["']canonical["']/i.test(html)) addError(file, 'missing canonical URL');
    if ((html.match(/<h1\b/gi) || []).length !== 1) addError(file, 'must contain exactly one h1');
    if ((html.match(/<main\b/gi) || []).length !== 1) addError(file, 'must contain exactly one main element');
    if (!/<a\b[^>]*href=["']#main-content["']/i.test(html)) addError(file, 'missing skip link to main content');
    if (!/<nav\b[^>]*aria-label=["']Primary["']/i.test(html)) addError(file, 'missing labelled primary navigation');
    if (!/aria-label=["']Navigation menu["']/i.test(html)) addError(file, 'mobile navigation trigger needs a stable accessible name');
    if (!/class=["'][^"']*\bmenu\b[^"']*\bmenu-lg\b[^"']*\bdropdown-content\b/i.test(html)) {
        addError(file, 'mobile navigation must use menu-lg touch targets');
    }
    if (!/class=["'][^"']*\bmenu-horizontal\b[^"']*\blg:flex\b/i.test(html)) {
        addError(file, 'compact desktop navigation must start at lg');
    }
    if (!/<details\b[^>]*class=["'][^"']*\bdropdown\b[^"']*\blg:hidden\b/i.test(html)) {
        addError(file, 'mobile navigation must remain available below lg');
    }
    if (/<style\b/i.test(html)) addError(file, 'contains inline CSS; move it to a shared stylesheet');
    if (/\sstyle\s*=/i.test(html)) addError(file, 'contains an inline style attribute');
    if (!/<html\b[^>]*\bdata-theme=["']icaif["']/i.test(html)) addError(file, 'must use the daisyUI icaif theme');
    if (file !== 'index.html') {
        const pageHeaderTag = html.match(/<section\b[^>]*\bid=["']page-header["'][^>]*>/i)?.[0] || '';
        const pageHeaderClasses = new Set((getAttributes(pageHeaderTag).class || '').split(/\s+/).filter(Boolean));
        const animatedHeroClasses = new Set(
            (getAttributes(animatedHeroOverlayTags[0] || '').class || '').split(/\s+/).filter(Boolean)
        );

        if (
            !pageHeaderClasses.has('hero')
            || !pageHeaderClasses.has('bg-neutral')
            || !pageHeaderClasses.has('text-neutral-content')
        ) {
            addError(file, 'internal page header must use the shared neutral daisyUI hero');
        }

        if (
            animatedHeroOverlayTags.length !== 1
            || !animatedHeroClasses.has('hero-overlay')
            || !animatedHeroClasses.has('bg-primary/20')
        ) {
            addError(file, 'internal page header must use one accessible daisyUI hero overlay');
        }
    } else if (animatedHeroOverlayTags.length) {
        addError(file, 'home hero must not use the internal-page background animation');
    }
    if (/<body\b[^>]*\bclass=["'][^"']*\b(?:bg-base-|text-base-content)\b/i.test(html)) {
        addError(file, 'body overrides the default daisyUI theme surface');
    }
    if (/css\/responsive\.css|js\/site\.js/i.test(html)) addError(file, 'references a removed legacy asset');
    if (/css\/fonts\.css/i.test(html)) addError(file, 'loads source-only font CSS at runtime');
    if ((html.match(/css\/tailwind\.min\.css(?:\?[^"']*)?/gi) || []).length !== 1) {
        addError(file, 'must load exactly one compiled Tailwind stylesheet');
    }

    for (const match of html.matchAll(/<[^>]+\bclass=["']([^"']*)["'][^>]*>/gi)) {
        const interactiveClasses = match[1].split(/\s+/).filter((className) =>
            /^(?:hover:|group-hover:|transition-|duration-)/.test(className)
        );

        if (interactiveClasses.length && !(/data-heroicon=/i.test(match[0]) && /\bgroup-hover:text-primary\/20\b/.test(match[1]))) {
            addError(file, `uses a custom hover or transition outside approved effects: ${interactiveClasses.join(', ')}`);
        }
    }

    const classTokens = new Set(
        Array.from(html.matchAll(/\bclass=["']([^"']*)["']/gi), (match) => match[1])
            .flatMap((value) => value.split(/\s+/))
            .filter(Boolean)
    );
    const auraTags = Array.from(
        html.matchAll(/<([a-z][\w-]*)\b[^>]*\bclass=["'][^"']*\baura\b[^"']*["'][^>]*>/gi)
    );

    if (auraTags.length > 1) addError(file, 'uses more than one daisyUI aura');

    for (const auraTag of auraTags) {
        const auraClasses = new Set((getAttributes(auraTag[0]).class || '').split(/\s+/).filter(Boolean));
        const directChildTag = html.slice(auraTag.index + auraTag[0].length).match(/^\s*<([a-z][\w-]*)\b[^>]*>/i)?.[0] || '';

        if (
            auraTag[1].toLowerCase() !== 'div'
            || !auraClasses.has('aura-glow')
            || !auraClasses.has('aura-lg')
            || !auraClasses.has('text-accent')
        ) {
            addError(file, 'aura must use the shared orange aura-glow structure');
        }

        if (!/^\s*<a\b/i.test(directChildTag) || !/\bdata-priority-action\b/i.test(directChildTag)) {
            addError(file, 'aura must directly wrap the page priority action');
        }
    }

    for (const match of html.matchAll(/<[^>]+\bclass=["']([^"']*)["'][^>]*>/gi)) {
        const elementClasses = match[1].split(/\s+/).filter(Boolean);
        const componentRoots = elementClasses.filter((className) => daisyComponentRoots.has(className));
        const isPriorityAction = /\bdata-priority-action\b/i.test(match[0]);
        const isEmphasisAlert = /\bdata-emphasis-alert\b/i.test(match[0]);
        const isRegistrationPhase = /\bdata-registration-phase\b/i.test(match[0]);
        const isPositiveStatus = /\bdata-positive-status\b/i.test(match[0]);
        const isWorkshopSubmission = /\bdata-workshop-submission\b/i.test(match[0]);

        if (componentRoots.length > 1) {
            addError(file, `combines daisyUI component roots on one element: ${componentRoots.join(', ')}`);
        }

        if (elementClasses.includes('card')) {
            const forbiddenUtilities = elementClasses.filter((className) => forbiddenCardUtilities.has(className));
            if (forbiddenUtilities.length) {
                addError(file, `card overrides native daisyUI styling with ${forbiddenUtilities.join(', ')}`);
            }
        }

        for (const className of elementClasses) {
            if (
                forbiddenNonDefaultComponentClasses.some((pattern) => pattern.test(className))
                && !(isPriorityAction && allowedPriorityActionComponentClasses.has(className))
                && !(isEmphasisAlert && allowedEmphasisAlertComponentClasses.has(className))
                && !(isRegistrationPhase && allowedRegistrationPhaseBadgeClasses.has(className))
                && !(isPositiveStatus && allowedPositiveStatusBadgeClasses.has(className))
                && !(isWorkshopSubmission && allowedWorkshopSubmissionBadgeClasses.has(className))
            ) {
                addError(file, `uses non-default daisyUI component styling ${className}`);
            }
        }

        if (
            elementClasses.includes('bg-primary/10')
            && elementClasses.includes('border')
            && elementClasses.includes('border-primary/20')
            && elementClasses.includes('rounded-box')
        ) {
            addError(file, 'uses a hand-built panel instead of a daisyUI component');
        }
    }

    for (const match of html.matchAll(/<tr\b[^>]*\bclass=["']([^"']*)["']/gi)) {
        if (/\btransition-colors\b/.test(match[1])) {
            addError(file, 'table row overrides the native daisyUI table interaction');
        }
    }

    for (const componentClass of requiredComponentClasses) {
        if (!classTokens.has(componentClass)) addError(file, `missing required daisyUI component class ${componentClass}`);
    }

    for (const className of classTokens) {
        if (forbiddenLegacyClasses.has(className) || /^hero-reveal-/.test(className)) {
            addError(file, `uses legacy custom class ${className}`);
        }
        if (/(?:^|:)(?:bg|text|border|divide|ring|from|via|to)-(?:brand|slate)-/.test(className)) {
            addError(file, `uses non-semantic color class ${className}`);
        }
        if (className === 'text-base-content/50' || className === 'text-base-content/60' || className === 'opacity-60') {
            addError(file, `uses low-contrast text treatment ${className}`);
        }
    }

    if (/<table\b/i.test(html)) {
        if (!classTokens.has('table')) addError(file, 'table markup must use the daisyUI table component');
        if (!classTokens.has('overflow-x-auto')) addError(file, 'table must have a responsive horizontal overflow wrapper');
        if ((html.match(/<table\b/gi) || []).length !== (html.match(/<caption\b/gi) || []).length) {
            addError(file, 'every table must provide a caption');
        }
    }

    const priorityActionCount = (html.match(/\bbtn-(?:primary|accent)\b/gi) || []).length;
    if (priorityActionCount > 1) addError(file, 'uses more than one visually primary page action');
    if (/>(?:\s*)https?:\/\//i.test(html)) addError(file, 'uses a raw URL as visible link text');

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

        if (/^<a\b/i.test(match[0])) {
            const localFragment = getLocalFragment(attributes.href, file);

            if (localFragment && fs.existsSync(localFragment.target) && localFragment.target.endsWith('.html')) {
                const targetHtml = fs.readFileSync(localFragment.target, 'utf8');
                const fragmentPattern = new RegExp(`\\bid=["']${escapeRegExp(localFragment.fragment)}["']`, 'i');

                if (!fragmentPattern.test(targetHtml)) {
                    addError(file, `missing local anchor target ${attributes.href}`);
                }
            }
        }
    }

    for (const match of html.matchAll(/(?:css\/tailwind\.min\.css|js\/(?:heroicons|home-stats|important-dates)\.js)\?v=([0-9]+)/g)) {
        const asset = match[0].split('?')[0];
        if (!assetVersions.has(asset)) assetVersions.set(asset, new Set());
        assetVersions.get(asset).add(match[1]);
    }

    recordSignature(navigationSignatures, getHrefSignature(getBlock(html, 'nav')), file);
    recordSignature(footerSignatures, getHrefSignature(getBlock(html, 'footer')), file);

    if (file === 'workshop.html') {
        const womenWorkshop = html.match(/<article\b[^>]*\bid=["']women-ai-finance["'][\s\S]*?<\/article>/i)?.[0] || '';

        if (!womenWorkshop) {
            addError(file, 'missing Women in AI and Finance workshop');
        } else if (/Submission\/Create|data-workshop-submission|Submit paper/i.test(womenWorkshop)) {
            addError(file, 'Women in AI and Finance must not offer paper submissions');
        }
    }
}

const iconSource = fs.readFileSync(path.join(root, 'js', 'heroicons.js'), 'utf8');
const definedIcons = new Set(
    Array.from(iconSource.matchAll(/^\s*(?:'([^']+)'|([a-z][\w-]*))\s*:/gm), (match) => match[1] || match[2])
);

for (const icon of usedIcons) {
    if (!definedIcons.has(icon)) addError('js/heroicons.js', `missing icon definition for ${icon}`);
}

for (const icon of definedIcons) {
    if (!usedIcons.has(icon)) addError('js/heroicons.js', `unused icon definition for ${icon}`);
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

for (const removedFile of ['tailwind.config.js', 'css/responsive.css', 'js/site.js']) {
    if (fs.existsSync(path.join(root, removedFile))) addError(removedFile, 'legacy file must be removed');
}

const cssInput = fs.readFileSync(path.join(root, 'css', 'tailwind.input.css'), 'utf8');
const sharedLayerStart = cssInput.indexOf('@layer base');
const cssBeforeSharedLayers = sharedLayerStart >= 0 ? cssInput.slice(0, sharedLayerStart) : cssInput;
if (/^\s*[.#][^{]+\{/m.test(cssBeforeSharedLayers) || /@keyframes\b/.test(cssInput)) {
    addError('css/tailwind.input.css', 'contains ad-hoc selectors before the shared layers or custom keyframes');
}

if (!/@import\s+["']\.\/fonts\.css["']\s*;/i.test(cssInput)) {
    addError('css/tailwind.input.css', 'must bundle the local font declarations');
}

const daisyConfig = cssInput.match(/@plugin\s+["']daisyui["']\s*\{([\s\S]*?)\}/i)?.[1] || '';
const includedDaisyModules = new Set(
    (daisyConfig.match(/\binclude\s*:\s*([^;]+);/i)?.[1] || '')
        .split(',')
        .map((moduleName) => moduleName.trim())
        .filter(Boolean)
);

for (const moduleName of requiredDaisyModules) {
    if (!includedDaisyModules.has(moduleName)) {
        addError('css/tailwind.input.css', `missing required daisyUI module ${moduleName}`);
    }
}

const compiledCss = fs.readFileSync(path.join(root, 'css', 'tailwind.min.css'), 'utf8');

for (const selector of requiredCompiledCssSelectors) {
    if (!compiledCss.includes(selector)) {
        addError('css/tailwind.min.css', `missing compiled selector ${selector}`);
    }
}

for (const selector of excludedCompiledCssSelectors) {
    if (compiledCss.includes(selector)) {
        addError('css/tailwind.min.css', `contains excluded daisyUI selector ${selector}`);
    }
}

if (errors.length) {
    console.error(`Site checks failed (${errors.length}):`);
    errors.forEach((error) => console.error(`- ${error}`));
    process.exitCode = 1;
} else {
    console.log(`Site checks passed for ${htmlFiles.length} HTML pages.`);
}
