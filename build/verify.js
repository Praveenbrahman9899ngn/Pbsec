// Static verification: link resolution, anchor targets, asset references.
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const problems = [];
const pages = [];

(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith('_') || e.name === 'build' || e.name === 'node_modules') continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full);
    else if (e.name.endsWith('.html')) pages.push(full);
  }
})(ROOT);

console.log(`Found ${pages.length} HTML pages\n`);

const exists = p => { try { return fs.statSync(p).isFile(); } catch { return false; } };

// collect ids per page for anchor checking
const idsByPage = new Map();
for (const page of pages) {
  const html = fs.readFileSync(page, 'utf8');
  const ids = new Set();
  for (const m of html.matchAll(/\sid="([^"]+)"/g)) ids.add(m[1]);
  idsByPage.set(path.resolve(page), ids);
}

let checkedLinks = 0, checkedAssets = 0, checkedAnchors = 0;

for (const page of pages) {
  const html = fs.readFileSync(page, 'utf8');
  const dir = path.dirname(page);
  const rel = path.relative(ROOT, page).replace(/\\/g, '/');
  const pageIds = idsByPage.get(path.resolve(page));

  // ---- hrefs ----
  for (const m of html.matchAll(/\shref="([^"]+)"/g)) {
    const href = m[1];
    if (/^(https?:|mailto:|data:|tel:)/.test(href)) continue;

    const [filePart, frag] = href.split('#');
    checkedLinks++;

    if (!filePart) {
      // same-page anchor
      if (frag) {
        checkedAnchors++;
        if (!pageIds.has(frag)) problems.push(`${rel}: same-page anchor #${frag} not found`);
      }
      continue;
    }

    const target = path.resolve(dir, filePart);
    if (!exists(target)) {
      problems.push(`${rel}: broken link -> ${href}`);
      continue;
    }

    if (frag && target.endsWith('.html')) {
      checkedAnchors++;
      const tIds = idsByPage.get(target);
      if (tIds && !tIds.has(frag)) problems.push(`${rel}: link ${href} — #${frag} not found in target page`);
    }
  }

  // ---- srcs ----
  for (const m of html.matchAll(/\ssrc="([^"]+)"/g)) {
    const src = m[1];
    if (/^(https?:|data:)/.test(src)) continue;
    checkedAssets++;
    const target = path.resolve(dir, src);
    if (!exists(target)) problems.push(`${rel}: missing asset -> ${src}`);
  }

  // ---- structural sanity ----
  const need = [
    ['<header class="site-header"', 'site header'],
    ['<footer class="site-footer"', 'site footer'],
    ['id="main"', 'main landmark'],
    ['assets/site.js', 'shared script'],
    ['styles.css', 'shared stylesheet']
  ];
  for (const [needle, label] of need) {
    if (!html.includes(needle)) problems.push(`${rel}: missing ${label}`);
  }

  // exactly one <h1>
  const h1s = (html.match(/<h1[\s>]/g) || []).length;
  if (h1s !== 1) problems.push(`${rel}: expected exactly 1 <h1>, found ${h1s}`);

  // duplicate ids within a page
  const allIds = [...html.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]);
  const dupes = allIds.filter((v, i) => allIds.indexOf(v) !== i);
  if (dupes.length) problems.push(`${rel}: duplicate id(s) ${[...new Set(dupes)].join(', ')}`);

  // unescaped ampersands outside script/style
  const stripped = html.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<style[\s\S]*?<\/style>/g, '');
  const badAmp = stripped.match(/&(?!(amp|lt|gt|quot|copy|nbsp|#\d+|#x[0-9a-fA-F]+);)/g);
  if (badAmp) problems.push(`${rel}: ${badAmp.length} unescaped ampersand(s)`);
}

/* ------------------------------------------------------------
   SEO consistency
   A page's canonical URL and its sitemap entry must be the same
   string, or crawlers see two URLs for one page. This block makes
   that agreement a build-time invariant instead of a thing someone
   has to remember. It also catches a sitemap entry pointing at a
   page that no longer exists, and a noindex page leaking in.
   ------------------------------------------------------------ */
let checkedSeo = 0;

const sitemapPath = path.join(ROOT, 'sitemap.xml');
const robotsPath = path.join(ROOT, 'robots.txt');

if (!exists(sitemapPath)) {
  problems.push('sitemap.xml is missing');
} else if (!exists(robotsPath)) {
  problems.push('robots.txt is missing');
} else {
  const sitemapXml = fs.readFileSync(sitemapPath, 'utf8');
  const locs = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
  const locSet = new Set(locs);

  if (!locs.length) problems.push('sitemap.xml contains no <loc> entries');

  const originMatch = locs[0] && locs[0].match(/^https?:\/\/[^/]+/);
  if (!originMatch) {
    problems.push('sitemap.xml: first <loc> is not an absolute URL');
  } else {
    const origin = originMatch[0];
    const expectedFor = rel => `${origin}/${rel === 'index.html' ? '' : rel}`;

    // every generated page is either indexable+listed, or noindex+unlisted
    for (const page of pages) {
      const html = fs.readFileSync(page, 'utf8');
      const rel = path.relative(ROOT, page).replace(/\\/g, '/');
      const expected = expectedFor(rel);
      const isNoindex = /<meta name="robots" content="[^"]*noindex/i.test(html);
      const canonicals = [...html.matchAll(/<link rel="canonical" href="([^"]+)"/g)].map(m => m[1]);

      checkedSeo++;

      if (isNoindex) {
        if (locSet.has(expected)) problems.push(`${rel}: marked noindex but present in sitemap.xml`);
        continue;
      }

      if (canonicals.length !== 1) {
        problems.push(`${rel}: expected exactly 1 canonical link, found ${canonicals.length}`);
      } else if (canonicals[0] !== expected) {
        problems.push(`${rel}: canonical is ${canonicals[0]} but sitemap implies ${expected}`);
      }

      if (!locSet.has(expected)) problems.push(`${rel}: indexable but missing from sitemap.xml`);
    }

    // sitemap entries must map back to a real page
    for (const loc of locs) {
      const relFromRoot = loc.startsWith(origin + '/') ? loc.slice(origin.length + 1) : null;
      const target = relFromRoot === '' ? 'index.html' : relFromRoot;
      if (!target || !exists(path.join(ROOT, target))) {
        problems.push(`sitemap.xml: <loc>${loc}</loc> points at no generated page`);
      }
    }

    // robots.txt must advertise the sitemap at the same origin
    const robots = fs.readFileSync(robotsPath, 'utf8');
    if (!robots.includes(`Sitemap: ${origin}/sitemap.xml`)) {
      problems.push(`robots.txt: missing "Sitemap: ${origin}/sitemap.xml"`);
    }

    // the 404 page is noindex, so keep it out of the crawl path too
    const notFound = path.join(ROOT, '404.html');
    if (exists(notFound) && /<meta name="robots" content="[^"]*noindex/i.test(fs.readFileSync(notFound, 'utf8'))) {
      if (!robots.includes('Disallow: /404.html')) {
        problems.push('robots.txt: 404.html is noindex but not disallowed');
      }
    }
  }
}

console.log(`Checked ${checkedLinks} links, ${checkedAssets} assets, ${checkedAnchors} anchors, ${checkedSeo} SEO records`);
console.log('');

if (problems.length) {
  console.log(`FAIL — ${problems.length} problem(s):`);
  problems.forEach(p => console.log('  - ' + p));
  process.exit(1);
} else {
  console.log('PASS — no broken links, missing assets, duplicate ids or structural gaps.');
}
