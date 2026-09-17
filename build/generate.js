/* ============================================================
   PB Sec — static site generator
   Run: node build/generate.js
   Emits every page from build/data.js so the header, footer and
   design system stay identical across the site.
   ============================================================ */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

/* ------------------------------------------------------------
   Escaping
   build/data.js is written as plain prose, so every string is
   escaped once here. Escaping &, <, > and " is safe in both text
   nodes and double-quoted attributes, which means authors can
   type "Cloud & infrastructure" without thinking about entities.
   ------------------------------------------------------------ */
function escapeDeep(v) {
  if (typeof v === 'string') {
    return v.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
  }
  if (Array.isArray(v)) return v.map(escapeDeep);
  if (v && typeof v === 'object') {
    const out = {};
    for (const k of Object.keys(v)) out[k] = escapeDeep(v[k]);
    return out;
  }
  return v;
}

const D = escapeDeep(require('./data.js'));

/* Canonical origin, used for <link rel="canonical">, og:url, sitemap.xml
   and robots.txt. Trailing slashes are stripped so joins are predictable.
   Change SITE.url in build/data.js — not here. */
const SITE_URL = String(D.SITE.url).replace(/\/+$/, '');

/* ------------------------------------------------------------
   Icons
   ------------------------------------------------------------ */
const ICONS = {
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/><path d="M11 8v6M8 11h6"/>',
  pulse: '<path d="M2 12h4l2.5-7 3.5 14 3-9 2 2h5"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a15 15 0 0 1 0 18"/><path d="M12 3a15 15 0 0 0 0 18"/>',
  smartphone: '<rect x="6" y="2" width="12" height="20" rx="2.5"/><path d="M11 18h2"/>',
  network: '<rect x="9" y="2" width="6" height="6" rx="1.5"/><rect x="2" y="16" width="6" height="6" rx="1.5"/><rect x="16" y="16" width="6" height="6" rx="1.5"/><path d="M12 8v4M5 16v-2h14v2"/>',
  cpu: '<rect x="6" y="6" width="12" height="12" rx="2"/><rect x="10" y="10" width="4" height="4" rx="1"/><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>',
  cloud: '<path d="M17.5 19a4.5 4.5 0 0 0 .5-8.97A6.5 6.5 0 0 0 5.2 8.6 4.5 4.5 0 0 0 6 19h11.5Z"/><path d="M12 12v5M9.5 14.5 12 12l2.5 2.5"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 11h-6M19 8v6"/>',
  file: '<path d="M14 2H6.5A1.5 1.5 0 0 0 5 3.5v17A1.5 1.5 0 0 0 6.5 22h11a1.5 1.5 0 0 0 1.5-1.5V7l-5-5Z"/><path d="M14 2v5h5"/><path d="m9 14 1.8 1.8L15 12"/>',
  siren: '<path d="M12 2 3.5 5.8v6.4c0 5.5 3.6 8.9 8.5 10.3 4.9-1.4 8.5-4.8 8.5-10.3V5.8L12 2Z"/><path d="M12 8v4.5M12 16h.01"/>',
  shield: '<path d="M12 2 3.5 5.8v6.4c0 5.5 3.6 8.9 8.5 10.3 4.9-1.4 8.5-4.8 8.5-10.3V5.8L12 2Z"/>',
  shieldCheck: '<path d="M12 2 3.5 5.8v6.4c0 5.5 3.6 8.9 8.5 10.3 4.9-1.4 8.5-4.8 8.5-10.3V5.8L12 2Z"/><path d="m9 12 2 2 4-4"/>',
  compass: '<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5 5-2Z"/>',
  chat: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z"/>',
  scale: '<path d="M12 4v16M7 20h10M4 9h16"/><path d="M7 9 4 15h6L7 9Z"/><path d="M17 9l-3 6h6l-3-6Z"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 6 10-6"/>',
  phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z"/>',
  pin: '<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  alert: '<path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 16v-5M12 8h.01"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>'
};

const svg = (name, cls, w) =>
  `<svg${cls ? ` class="${cls}"` : ''} viewBox="0 0 24 24" fill="none" stroke="currentColor" ` +
  `stroke-width="${w || 1.9}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">` +
  `${ICONS[name] || ''}</svg>`;

const arrowIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" ` +
  `stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS.arrow}</svg>`;

const checkIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" ` +
  `stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS.check}</svg>`;

/* ------------------------------------------------------------
   Paths
   ------------------------------------------------------------ */
// depth 0 = site root, 1 = /services/ or /insights/
const P = (depth, href) => {
  if (!href) return '#';
  if (/^(https?:|mailto:|#)/.test(href)) return href;
  return (depth ? '../'.repeat(depth) : '') + href;
};

/* Written out as assets/favicon.svg — a real file rather than a data URI,
   so browsers can cache it and it shows up in link previews. */
const FAVICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" role="img" aria-label="${D.SITE.name}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#8b5cf6"/>
      <stop offset="1" stop-color="#d946ef"/>
    </linearGradient>
  </defs>
  <path d="M16 2 5 6.5v9C5 23.4 9.7 28.6 16 30c6.3-1.4 11-6.6 11-14.5v-9L16 2Z" fill="url(#g)"/>
  <path d="M16 9.5a3.2 3.2 0 0 0-3.2 3.2v1.6h-.6a1 1 0 0 0-1 1v5.2a1 1 0 0 0 1 1h7.6a1 1 0 0 0 1-1v-5.2a1 1 0 0 0-1-1h-.6v-1.6A3.2 3.2 0 0 0 16 9.5Zm1.7 4.8h-3.4v-1.6a1.7 1.7 0 0 1 3.4 0Z" fill="#fff"/>
</svg>
`;

/* ------------------------------------------------------------
   Shared shell
   ------------------------------------------------------------ */
function head({ title, description, depth, bodyPage, canonical, robots }) {
  /* The homepage is served at the directory root, so its canonical must be
     the bare origin — not /index.html. Emitting both would give crawlers two
     URLs for one page, which is exactly what a canonical tag prevents.
     buildSitemap() applies the same rule, so the two always agree. */
  const canonPath = canonical === 'index.html' ? '' : canonical;
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<meta name="description" content="${description}">
<meta name="theme-color" content="#1b0b33">
${robots ? `<meta name="robots" content="${robots}">\n` : ''}<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:type" content="website">
${canonical ? `<meta property="og:url" content="${SITE_URL}/${canonPath}">\n<link rel="canonical" href="${SITE_URL}/${canonPath}">\n` : ''}<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;family=Space+Grotesk:wght@500;600;700&amp;display=swap" rel="stylesheet">
<link rel="icon" type="image/svg+xml" href="${P(depth, 'assets/favicon.svg')}">
<link rel="apple-touch-icon" href="${P(depth, 'assets/favicon.svg')}">
<link rel="stylesheet" href="${P(depth, 'assets/styles.css')}">
</head>
<body data-page="${bodyPage}">
<a class="skip-link" href="#main">Skip to content</a>
`;
}

function header(depth, activeKey) {
  const links = D.NAV.map(n => {
    const active = n.key === activeKey;
    return `<a href="${P(depth, n.href)}"${active ? ' class="is-active" aria-current="page"' : ''}>${n.label}</a>`;
  }).join('\n        ');

  return `
<header class="site-header" id="top">
  <div class="wrap nav">
    <a class="brand" href="${P(depth, 'index.html')}" aria-label="${D.SITE.name} home">
      <svg class="brand-mark" viewBox="0 0 32 32" aria-hidden="true">
        <defs>
          <linearGradient id="bm" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="#8b5cf6"/><stop offset="1" stop-color="#d946ef"/>
          </linearGradient>
        </defs>
        <path d="M16 2 5 6.5v9C5 23.4 9.7 28.6 16 30c6.3-1.4 11-6.6 11-14.5v-9L16 2Z" fill="url(#bm)"/>
        <path d="M16 9.5a3.2 3.2 0 0 0-3.2 3.2v1.6h-.6a1 1 0 0 0-1 1v5.2a1 1 0 0 0 1 1h7.6a1 1 0 0 0 1-1v-5.2a1 1 0 0 0-1-1h-.6v-1.6A3.2 3.2 0 0 0 16 9.5Zm1.7 4.8h-3.4v-1.6a1.7 1.7 0 0 1 3.4 0Z" fill="#fff"/>
      </svg>
      <span>PB<em>Sec</em></span>
    </a>

    <nav class="nav-links" id="navLinks" aria-label="Main">
        ${links}
    </nav>

    <div class="nav-cta">
      <a class="btn btn-ghost" href="${P(depth, 'index.html#posture')}">Free posture check</a>
      <a class="btn btn-primary" href="${P(depth, 'contact.html')}">Talk to us</a>
      <button class="menu-btn" id="menuBtn" aria-label="Toggle navigation" aria-expanded="false" aria-controls="navLinks">
        <span></span><span></span><span></span>
      </button>
    </div>
  </div>
</header>
`;
}

function footer(depth) {
  const svc = D.SERVICES.map(s =>
    `<li><a href="${P(depth, `services/${s.slug}.html`)}">${s.nav}</a></li>`).join('\n          ');

  return `
<footer class="site-footer">
  <div class="wrap">
    <div class="footer-grid">
      <div>
        <a class="brand" href="${P(depth, 'index.html')}">
          <svg class="brand-mark" viewBox="0 0 32 32" aria-hidden="true">
            <defs>
              <linearGradient id="bmFooter" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stop-color="#8b5cf6"/><stop offset="1" stop-color="#d946ef"/>
              </linearGradient>
            </defs>
            <path d="M16 2 5 6.5v9C5 23.4 9.7 28.6 16 30c6.3-1.4 11-6.6 11-14.5v-9L16 2Z" fill="url(#bmFooter)"/>
            <path d="M16 9.5a3.2 3.2 0 0 0-3.2 3.2v1.6h-.6a1 1 0 0 0-1 1v5.2a1 1 0 0 0 1 1h7.6a1 1 0 0 0 1-1v-5.2a1 1 0 0 0-1-1h-.6v-1.6A3.2 3.2 0 0 0 16 9.5Zm1.7 4.8h-3.4v-1.6a1.7 1.7 0 0 1 3.4 0Z" fill="#fff"/>
          </svg>
          <span>PB<em>Sec</em></span>
        </a>
        <p class="footer-about">Independent cybersecurity for companies that need real protection, not a bigger stack of tools.</p>
      </div>

      <div class="footer-col">
        <h4>Services</h4>
        <ul>
          ${svc}
        </ul>
      </div>

      <div class="footer-col">
        <h4>Company</h4>
        <ul>
          <li><a href="${P(depth, 'about.html')}">About us</a></li>
          <li><a href="${P(depth, 'index.html#approach')}">Our approach</a></li>
          <li><a href="${P(depth, 'insights.html')}">Insights</a></li>
          <li><a href="${P(depth, 'careers.html')}">Careers</a></li>
          <li><a href="${P(depth, 'contact.html')}">Contact</a></li>
        </ul>
      </div>

      <div class="footer-col">
        <h4>Get started</h4>
        <ul>
          <li><a href="${P(depth, 'index.html#posture')}">Free posture check</a></li>
          <li><a href="${P(depth, 'contact.html')}">Book a review</a></li>
          <li><a href="mailto:${D.SITE.email}">${D.SITE.email}</a></li>
        </ul>
      </div>
    </div>

    <div class="footer-bottom">
      <span>&copy; <span id="year">2026</span> ${D.SITE.name}. All rights reserved.</span>
      <ul>
        <li><a href="${P(depth, 'contact.html')}">Privacy</a></li>
        <li><a href="${P(depth, 'contact.html')}">Terms</a></li>
        <li><a href="${P(depth, 'contact.html')}">Responsible disclosure</a></li>
      </ul>
    </div>
  </div>
</footer>

<script src="${P(depth, 'assets/site.js')}"></script>
</body>
</html>
`;
}

function crumbs(depth, trail) {
  const items = trail.map((t, i) => {
    const last = i === trail.length - 1;
    return last
      ? `<li><span aria-current="page">${t.label}</span></li>`
      : `<li><a href="${P(depth, t.href)}">${t.label}</a></li>`;
  }).join('\n        ');
  return `<ol class="crumbs">\n        ${items}\n      </ol>`;
}

function ctaBand(depth, heading, text, btnLabel) {
  return `
<section class="section section--tight">
  <div class="wrap">
    <div class="cta-band reveal">
      <div>
        <h2>${heading}</h2>
        <p>${text}</p>
      </div>
      <a class="btn btn-light btn-lg" href="${P(depth, 'contact.html')}">
        ${btnLabel || 'Book a security review'}
        ${arrowIcon}
      </a>
    </div>
  </div>
</section>
`;
}

function faqBlock(items, accent, heading) {
  const rows = items.map(f => `
      <div class="faq-item">
        <button class="faq-q" aria-expanded="false">${f.q}<span class="plus"></span></button>
        <div class="faq-a"><p>${f.a}</p></div>
      </div>`).join('');
  return `
<section class="section"${accent ? ` data-accent="${accent}"` : ''}>
  <div class="wrap">
    <div class="section-head center reveal">
      <span class="eyebrow">Questions</span>
      <h2>${heading}</h2>
    </div>
    <div class="faq-wrap reveal">
${rows}
    </div>
  </div>
</section>
`;
}

/* ------------------------------------------------------------
   Block renderer for prose bodies
   ------------------------------------------------------------ */
function renderBlocks(blocks) {
  return blocks.map(b => {
    if (b.h2) return `<h2>${b.h2}</h2>`;
    if (b.h3) return `<h3>${b.h3}</h3>`;
    if (b.p) return `<p>${b.p}</p>`;
    if (b.quote) return `<blockquote><p>${b.quote}</p></blockquote>`;
    if (b.ul) return `<ul>${b.ul.map(li => `<li>${li}</li>`).join('')}</ul>`;
    if (b.ol) return `<ol>${b.ol.map(li => `<li>${li}</li>`).join('')}</ol>`;
    if (b.callout) {
      const warn = b.callout.kind === 'warn';
      return `<div class="callout${warn ? ' callout--warn' : ''}">${svg(warn ? 'alert' : 'info')}` +
             `<div><p><strong>${b.callout.title}</strong>${b.callout.text}</p></div></div>`;
    }
    return '';
  }).join('\n      ');
}

/* ------------------------------------------------------------
   Reusable fragments
   ------------------------------------------------------------ */
const securityOverview = `
      <aside class="security-overview" aria-labelledby="securityOverviewTitle">
        <div class="security-overview-head">
          <span class="security-label">The PB Sec approach</span>
          <span class="security-monogram" aria-hidden="true">PB<span>/</span></span>
        </div>
        <h2 id="securityOverviewTitle">A clear view.<br>A safer business.</h2>
        <p class="security-intro">Know what matters. Know what to do next.</p>
        <div class="security-scope">
          <span class="security-scope-icon">${svg('shield')}</span>
          <div><strong>Your business</strong><span>People, systems &amp; data</span></div>
        </div>
        <ol class="security-path">
          <li>
            <span class="security-step-number">01</span>
            <div><h3>Find the gaps</h3><p>See where your business is exposed.</p></div>
            ${svg('search')}
          </li>
          <li>
            <span class="security-step-number">02</span>
            <div><h3>Fix what matters</h3><p>Put the biggest risks first.</p></div>
            ${svg('shieldCheck')}
          </li>
          <li>
            <span class="security-step-number">03</span>
            <div><h3>Keep watch</h3><p>Spot changes. Know when to act.</p></div>
            ${svg('pulse')}
          </li>
        </ol>
        <div class="security-overview-foot">Less noise. More clarity.<span>PB Sec</span></div>
      </aside>`;

const frameworkStrip = `
<section class="strip">
  <div class="wrap strip-inner">
    <span class="strip-label">We map your programme to</span>
    <ul>
      ${D.FRAMEWORKS.map(f => `<li>${f}</li>`).join('\n      ')}
    </ul>
  </div>
</section>`;

const CONTACT_FORM = (depth) => `
      <form class="form reveal" id="contactForm" action="https://formsubmit.co/${D.SITE.email}" method="POST" novalidate>
        <input type="hidden" name="_subject" value="New PB Sec security enquiry">
        <input type="hidden" name="_captcha" value="false">
        <input type="hidden" name="_template" value="table">
        <input type="hidden" name="_next" value="">
        <input type="hidden" id="topicValue" name="topic" value="">
        <input type="text" name="_honey" tabindex="-1" autocomplete="off" aria-hidden="true" class="visually-hidden">
        <div class="field-row">
          <div class="field">
            <label for="fName">Name <span class="req">*</span></label>
            <input id="fName" name="name" type="text" autocomplete="name" required>
          </div>
          <div class="field">
            <label for="fCompany">Company</label>
            <input id="fCompany" name="company" type="text" autocomplete="organization">
          </div>
        </div>

        <div class="field">
          <label for="fEmail">Work email <span class="req">*</span></label>
          <input id="fEmail" name="email" type="email" autocomplete="email" required>
        </div>

        <fieldset class="topic-options">
          <legend>What do you need help with? <span class="req">*</span></legend>
          <div class="topic-option-grid">
            ${D.SERVICES.map((s, i) => `<label class="topic-option"><input class="topic-input" type="checkbox" value="${s.title}"${i === 0 ? ' checked' : ''}><span>${s.nav}</span></label>`).join('\n            ')}
            <label class="topic-option"><input class="topic-input" type="checkbox" value="Not sure yet — let's talk"><span>Not sure yet — let's talk</span></label>
          </div>
        </fieldset>

        <div class="field">
          <label for="fMessage">Anything we should know? <span class="req">*</span></label>
          <textarea id="fMessage" name="message" required placeholder="Team size, systems you are worried about, deadlines you are working to…"></textarea>
        </div>

        <div class="form-foot">
          <button class="btn btn-primary btn-lg" type="submit">
            Send enquiry
            ${arrowIcon}
          </button>
          <span class="form-status" id="formStatus" role="status" aria-live="polite"></span>
        </div>

        <p class="form-note">Your enquiry is sent securely to our team. We usually reply within one business day.</p>
      </form>`;

const CONTACT_INFO = `
        <ul class="contact-list">
          <li>
            <div class="icon" data-accent="purple">${svg('mail')}</div>
            <div><b>Email</b><a href="mailto:${D.SITE.email}">${D.SITE.email}</a></div>
          </li>
          <li>
            <div class="icon" data-accent="rose">${svg('phone')}</div>
            <div><b>Incident hotline</b><span>Retainer clients — 24/7, number issued at onboarding</span></div>
          </li>
          <li>
            <div class="icon" data-accent="amber">${svg('clock')}</div>
            <div><b>Response time</b><span>Within one business day, usually much sooner</span></div>
          </li>
          <li>
            <div class="icon" data-accent="cyan">${svg('pin')}</div>
            <div><b>Remote-first</b><span>Working with teams across time zones</span></div>
          </li>
        </ul>`;

/* ============================================================
   HOME
   ============================================================ */
function buildHome() {
  const depth = 0;

  const serviceCards = D.SERVICES.map(s => `
      <a class="card reveal" href="services/${s.slug}.html" data-accent="${s.accent}">
        <div class="icon">${svg(s.icon)}</div>
        <h3>${s.title}</h3>
        <p>${s.blurb}</p>
        <ul>${s.tags.slice(0, 4).map(t => `<li>${t}</li>`).join('')}</ul>
      </a>`).join('');

  const steps = [
    { accent: 'purple', n: 'Phase 01', h: 'Discover', p: 'We map what you actually have: assets, identities, data flows, and the gaps between the diagram and reality. Discovery is where most surprises hide.' },
    { accent: 'cyan', n: 'Phase 02', h: 'Prioritise', p: 'Findings get scored on real-world exploitability and business impact — not raw CVSS. You get a ranked list you could hand to an engineer tomorrow.' },
    { accent: 'amber', n: 'Phase 03', h: 'Harden', p: 'We work the list with your team or take it on ourselves: identity first, then exposure, then detection. Measurable change, sprint by sprint.' },
    { accent: 'emerald', n: 'Phase 04', h: 'Prove &amp; monitor', p: 'We re-test what we fixed, keep watching what we can\'t, and report in language your board and your auditor both accept.' }
  ].map(s => `
      <article class="step reveal" data-accent="${s.accent}">
        <div class="step-num">${s.n}</div>
        <h3>${s.h}</h3>
        <p>${s.p}</p>
      </article>`).join('');

  const why = [
    { accent: 'purple', icon: 'compass', h: 'Vendor-neutral by design', p: 'We do not resell licences and take no commission. If you already own the right tools, we will use them. If you don\'t, we will tell you what you can safely skip.' },
    { accent: 'cyan', icon: 'pulse', h: 'Offence informs defence', p: 'Our testers and our defenders sit in the same room. A finding from an attack becomes a detection rule the same week — that is what purple teaming means in practice.' },
    { accent: 'amber', icon: 'chat', h: 'Reporting humans read', p: 'Executive summary on page one, technical detail in the appendix. Your board gets risk in business terms; your engineers get reproduction steps.' },
    { accent: 'emerald', icon: 'clock', h: 'Priced so you can keep going', p: 'Security is a programme, not a project. Our retainers are scoped in days per month so the work continues after the report lands.' }
  ].map(w => `
      <article class="why-item reveal" data-accent="${w.accent}">
        <div class="icon">${svg(w.icon)}</div>
        <h3>${w.h}</h3>
        <p>${w.p}</p>
      </article>`).join('');

  const homeFaqs = [
    { q: 'How long does a first assessment take?', a: 'For most small and mid-sized companies, an external assessment plus a cloud and identity review lands in two to four weeks, depending on how many systems are in scope. We will give you a fixed scope and a fixed date before we start.' },
    { q: 'We are a small team. Are we a realistic client?', a: 'Yes — that is most of who we work with. Small teams usually get the biggest return from identity hardening, MFA, backups, and basic monitoring, because those four things close the majority of realistic attack paths without needing a security department.' },
    { q: 'Do you resell tools or take vendor commissions?', a: 'No. We are independent and vendor-neutral. If a tool you already own solves the problem, we will configure it rather than sell you a replacement. When a purchase genuinely is the right answer, we will say so and show you the reasoning.' },
    { q: 'Can you help us pass a SOC 2 or ISO 27001 audit?', a: 'We prepare you for it: gap analysis against the framework, the policy and control set, and an evidence pipeline so audit time is a review rather than a scramble. We are not an audit firm, so the certification itself stays genuinely independent — which is the point.' },
    { q: 'What happens if we are breached at 2am?', a: 'Retainer clients get a direct line to an on-call engineer, not a ticket queue. We triage, contain, and coordinate — and we will tell you honestly what we know, what we don\'t, and what we are doing next. Communication during an incident is half the job.' },
    { q: 'Will you work with our existing IT team?', a: 'Preferably. We are at our best as an extension of an internal team — bringing offensive testing, monitoring, and programme structure while your people keep ownership of the environment. We document as we go so the knowledge stays with you.' }
  ];

  const quizQuestions = escapeDeep([
    {
      q: 'Do you know which devices and accounts can access company data?',
      help: 'Think about work laptops, phones and accounts used to open company files.',
      topic: 'Devices and accounts',
      action: 'List the devices and accounts that can access company data, and remove access no longer needed.',
      o: [
        { label: 'Yes', hint: 'We keep an up-to-date list of devices and accounts.', score: 2, value: 'yes' },
        { label: 'Partly', hint: 'We know some, but our list is incomplete.', score: 1, value: 'partly' },
        { label: 'No', hint: 'We do not have a list of devices and accounts.', score: 0, value: 'no' },
        { label: 'Not sure', hint: 'I would need to ask our IT person.', score: 0, value: 'unsure' }
      ]
    },
    {
      q: 'Do staff use a second step to sign in to work accounts?',
      help: 'For example, approving a sign-in in an app as well as entering a password.',
      topic: 'A second sign-in step',
      action: 'Turn on a second sign-in step for work accounts, including email and accounts that manage company systems.',
      o: [
        { label: 'Yes', hint: 'All staff use a second step for work accounts.', score: 2, value: 'yes' },
        { label: 'Partly', hint: 'Only some staff or work accounts use a second step.', score: 1, value: 'partly' },
        { label: 'No', hint: 'Staff use only a password to sign in.', score: 0, value: 'no' },
        { label: 'Not sure', hint: 'I would need to ask our IT person.', score: 0, value: 'unsure' }
      ]
    },
    {
      q: 'Are work devices and apps kept up to date?',
      help: 'Updates fix known problems in laptops, phones and the apps staff use.',
      topic: 'Device and app updates',
      action: 'Choose someone to check that work devices and apps receive updates, and follow up on missed updates.',
      o: [
        { label: 'Yes', hint: 'Updates are installed regularly and someone checks for missed ones.', score: 2, value: 'yes' },
        { label: 'Partly', hint: 'Some devices or apps are updated, but others are missed.', score: 1, value: 'partly' },
        { label: 'No', hint: 'We do not regularly update work devices and apps.', score: 0, value: 'no' },
        { label: 'Not sure', hint: 'I would need to ask our IT person.', score: 0, value: 'unsure' }
      ]
    },
    {
      q: 'Does someone review alerts about unusual work-account sign-ins?',
      help: 'For example, a warning about a sign-in from an unfamiliar device or place.',
      topic: 'Unusual sign-in alerts',
      action: 'Set up unusual sign-in alerts for work accounts and choose someone to review and follow up on them.',
      o: [
        { label: 'Yes', hint: 'Alerts are on and someone is responsible for reviewing them.', score: 2, value: 'yes' },
        { label: 'Partly', hint: 'Some alerts are on, but not all are reviewed.', score: 1, value: 'partly' },
        { label: 'No', hint: 'We have no alerts, or nobody reviews them.', score: 0, value: 'no' },
        { label: 'Not sure', hint: 'I would need to ask our IT person.', score: 0, value: 'unsure' }
      ]
    },
    {
      q: 'Do staff know who to contact and what to do if the company is hacked?',
      help: 'A short plan should name a contact and explain the first steps to take.',
      topic: 'What to do if hacked',
      action: 'Write down who staff should contact and the first steps to take if hacked, then practise the plan together.',
      o: [
        { label: 'Yes', hint: 'Staff have a written plan and have practised the first steps.', score: 2, value: 'yes' },
        { label: 'Partly', hint: 'We have a contact or a rough plan, but have not practised it.', score: 1, value: 'partly' },
        { label: 'No', hint: 'Staff do not have a contact or a plan to follow.', score: 0, value: 'no' },
        { label: 'Not sure', hint: 'I would need to ask our IT person.', score: 0, value: 'unsure' }
      ]
    },
    {
      q: 'Have you checked that important files can be recovered from a backup?',
      help: 'A backup is a separate copy of your files. A recovery test checks you can get them back.',
      topic: 'Getting files back',
      action: 'Check that important files are backed up, then restore test copies without overwriting the originals and check they open.',
      o: [
        { label: 'Yes', hint: 'We have restored important files and checked they open.', score: 2, value: 'yes' },
        { label: 'Partly', hint: 'We have backups, but have not checked that files can be restored.', score: 1, value: 'partly' },
        { label: 'No', hint: 'We do not have backups of important files.', score: 0, value: 'no' },
        { label: 'Not sure', hint: 'I would need to ask our IT person.', score: 0, value: 'unsure' }
      ]
    }
  ]);

  const quizHTML = quizQuestions.map((item, i) => `
        <div class="q${i === 0 ? ' is-active' : ''}" data-q="${i}" data-action="${item.action}" data-topic="${item.topic}"${i === 0 ? '' : ' hidden'}>
          <div class="q-count" id="q-count-${i}">Question ${i + 1} of ${quizQuestions.length}</div>
          <h3 tabindex="-1" aria-describedby="q-help-${i} q-count-${i}">${item.q}</h3>
          <p class="q-help" id="q-help-${i}">${item.help}</p>
          <div class="opts">
            ${item.o.map(({ label, hint, score, value }) => `<button class="opt" type="button" data-score="${score}" data-answer="${value}" aria-pressed="false"><span class="dot"></span><span>${label}<small>${hint}</small></span></button>`).join('\n            ')}
          </div>
        </div>`).join('');

  return head({
    title: `${D.SITE.name} — Cybersecurity that holds up under pressure`,
    description: D.SITE.description,
    depth, bodyPage: 'home', canonical: 'index.html'
  }) + header(depth, 'home') + `
<main id="main">

<section class="hero">
  <div class="wrap">
    <div class="hero-grid">
      <div>
        <span class="eyebrow eyebrow--light">${D.SITE.tagline}</span>
        <h1>Security that <span class="grad">holds up</span> when it actually matters.</h1>
        <p class="lede">PB Sec helps growing companies find the gaps that really matter, close them in the right order, and know within minutes — not months — when something is wrong.</p>

        <div class="hero-actions">
          <a class="btn btn-primary btn-lg" href="contact.html">
            Book a security review
            ${arrowIcon}
          </a>
          <a class="btn btn-outline-light btn-lg" href="#posture">2-minute security check</a>
        </div>

        <p class="hero-note">
          ${svg('shieldCheck')}
          Plain-English reporting. No fear-selling, no jargon walls.
        </p>

        <div class="hero-badges">
          <span class="chip" data-accent="magenta">Web &amp; mobile testing</span>
          <span class="chip" data-accent="blue">Network &amp; infrastructure</span>
          <span class="chip" data-accent="cyan">AI &amp; LLM security</span>
          <span class="chip" data-accent="rose">Red teaming</span>
          <span class="chip" data-accent="emerald">Threat detection</span>
        </div>
      </div>
${securityOverview}
    </div>
  </div>
</section>
${frameworkStrip}

<section class="section" id="services">
  <div class="wrap">
    <div class="section-head center reveal">
      <span class="eyebrow">What we do</span>
      <h2>Six things we do properly</h2>
      <p class="lede">Pick one, or let us run the whole security function. Every engagement ends with something you can act on — not a 90-page PDF nobody reads.</p>
    </div>
    <div class="grid-3">
${serviceCards}
    </div>
  </div>
</section>

<section class="section approach" id="approach">
  <div class="wrap">
    <div class="section-head reveal">
      <span class="eyebrow" data-accent="cyan">How we work</span>
      <h2>Four phases, in this order, every time</h2>
      <p class="lede">Most security budgets fail because the work happens in the wrong sequence — a tool bought before the problem is understood. We fix the order first.</p>
    </div>
    <div class="steps">
${steps}
    </div>
  </div>
</section>

<section class="section" id="posture">
  <div class="wrap">
    <div class="section-head center reveal">
      <span class="eyebrow" data-accent="magenta">Free tool</span>
      <h2>Check your company's security in 2 minutes</h2>
      <p class="lede">Six simple questions. No technical knowledge or email required. Get a basic self-check and suggested next steps based on your answers.</p>
    </div>

    <div class="posture-grid">
      <div class="quiz reveal" id="quiz">
        <div class="quiz-progress" id="quizProgress" role="progressbar" aria-label="Quiz progress" aria-valuemin="0" aria-valuemax="${quizQuestions.length}" aria-valuenow="0" aria-valuetext="0 of ${quizQuestions.length} questions completed"><i id="quizBar"></i></div>
${quizHTML}
        <div class="result" id="quizResult" hidden>
          <div class="score-ring" id="scoreRing" style="--deg:0deg">
            <b><span id="scoreNum">0</span><small>of <span id="scoreMax">${quizQuestions.length * 2}</span></small></b>
          </div>
          <div class="center"><span class="band mid" id="scoreBand">Some gaps to review</span></div>
          <h3 id="scoreTitle" tabindex="-1" aria-describedby="scoreBand scoreLead scoreUnknown">Your self-check result</h3>
          <p class="result-lead" id="scoreLead"></p>
          <p id="scoreUnknown">Not sure answers are unconfirmed, not confirmed failures. They count as zero in this basic self-check.</p>
          <h4 id="scoreNext">What to do next</h4>
          <ul class="recs" id="scoreRecs" aria-labelledby="scoreNext"></ul>
          <p class="result-note">This basic self-check uses only your answers. It is not an independent security audit and does not confirm that your company is secure.</p>
          <div class="quiz-nav" style="justify-content:center;gap:18px">
            <button class="link-btn" id="quizRestart" type="button">Retake the check</button>
            <a class="btn btn-primary" href="contact.html">Talk through the results</a>
          </div>
        </div>

        <div class="quiz-nav" id="quizNav">
          <button class="link-btn" id="quizBack" type="button" disabled>Back</button>
          <span class="quiz-hint">Your answers stay in this page only. Choosing an answer moves to the next question.</span>
        </div>
      </div>

      <aside class="posture-side">
        <div class="side-card reveal" data-accent="purple">
          <h3>A starting point, not an audit</h3>
          <p>This tool looks at six everyday security basics using only what you tell it. It does not scan your systems or verify your answers.</p>
          <ul class="side-list">
            <li>${checkIcon} A score based on your answers</li>
            <li>${checkIcon} Up to three suggested next steps</li>
            <li>${checkIcon} A count of all gaps and unconfirmed answers</li>
          </ul>
        </div>
        <div class="side-card side-card--plain reveal" data-accent="cyan">
          <h3>Not sure? That is useful to know</h3>
          <p>Choose Not sure rather than guess, then check those answers with your IT person. Your answers stay in page memory: they are not sent anywhere or saved to browser storage.</p>
        </div>
      </aside>
    </div>
  </div>
</section>

<section class="section why" id="why">
  <div class="wrap">
    <div class="section-head reveal">
      <span class="eyebrow eyebrow--light" data-accent="magenta">Why ${D.SITE.name}</span>
      <h2>Four reasons clients stay</h2>
      <p class="lede">We are deliberately small, deliberately independent, and deliberately boring about the things that should be boring.</p>
    </div>
    <div class="why-grid">
${why}
    </div>
  </div>
</section>
${faqBlock(homeFaqs, 'purple', 'The things people ask us first')}
${ctaBand(depth, 'Start with the gaps, not the shopping list.', 'Book a 30-minute review. We will look at what you have and tell you the three things worth doing first.')}
</main>
` + footer(depth);
}

/* ============================================================
   SERVICES INDEX
   ============================================================ */
function buildServicesIndex() {
  const depth = 0;

  const cards = D.SERVICES.map(s => `
      <a class="card reveal" href="services/${s.slug}.html" data-accent="${s.accent}">
        <div class="icon">${svg(s.icon)}</div>
        <h3>${s.title}</h3>
        <p>${s.blurb}</p>
        <ul>${s.tags.slice(0, 4).map(t => `<li>${t}</li>`).join('')}</ul>
      </a>`).join('');

  const facts = D.SERVICES.slice(0, 3).map((s, i) => {
    const accents = ['magenta', 'cyan', 'blue'];
    return `<div class="fact" data-accent="${accents[i]}"><b>${s.nav}</b><span>${s.tag}</span></div>`;
  }).join('\n      ');

  return head({
    title: `Services — ${D.SITE.name}`,
    description: 'Assessment and penetration testing, detection and response, cloud security, identity, compliance and incident readiness. Six services, delivered by the people who do the work.',
    depth, bodyPage: 'services', canonical: 'services.html'
  }) + header(depth, 'services') + `
<main id="main">

<section class="page-hero">
  <div class="wrap">
    ${crumbs(depth, [{ label: 'Home', href: 'index.html' }, { label: 'Services' }])}
    <span class="eyebrow eyebrow--light" data-accent="magenta">What we do</span>
    <h1>Six services, one sequence</h1>
    <p class="lede">Most companies do not need all of this at once. They need the right one, in the right order, delivered by people who will still be around when it needs revisiting.</p>
    <div class="page-hero-actions">
      <a class="btn btn-primary btn-lg" href="contact.html">Book a security review ${arrowIcon}</a>
      <a class="btn btn-outline-light btn-lg" href="index.html#posture">Free posture check</a>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="section-head reveal">
      <span class="eyebrow" data-accent="cyan">Start anywhere</span>
      <h2>Pick the problem you actually have</h2>
      <p class="lede">Each of these works as a standalone engagement, and each is designed to slot into a longer programme if you want one. Click through for what is involved, what you get, and what it costs you in your team's time.</p>
    </div>
    <div class="grid-3">
${cards}
    </div>
    <div class="fact-row">
      ${facts}
    </div>
  </div>
</section>

<section class="section approach">
  <div class="wrap">
    <div class="section-head reveal">
      <span class="eyebrow" data-accent="amber">How we sequence it</span>
      <h2>If you are not sure where to start</h2>
      <p class="lede">Almost every company should begin in the same place. Identity hardening and tested backups close the majority of realistic attack paths, and both are cheap relative to what they prevent.</p>
    </div>
    <div class="prose">
      <ol>
        <li><strong>Harden identity first.</strong> MFA everywhere, least privilege, and an end to standing admin rights. This is the highest return on effort available to almost anyone.</li>
        <li><strong>Prove your backups.</strong> A restore test is the difference between an incident and an extinction event. Do it before you need it.</li>
        <li><strong>Find your exposure.</strong> An assessment tells you what an attacker can already see. It is usually cheaper than the surprise.</li>
        <li><strong>Add detection.</strong> Once the fundamentals are in place, monitoring turns a breach into an incident you can respond to.</li>
        <li><strong>Then prove it to others.</strong> Compliance and reporting get much easier when the controls already exist and the evidence collects itself.</li>
      </ol>
    </div>
  </div>
</section>
${ctaBand(depth, 'Not sure which one you need?', 'Tell us what is worrying you and we will tell you honestly where to start — including when the answer is "nothing yet".')}
</main>
` + footer(depth);
}

/* ============================================================
   SERVICE DETAIL
   ============================================================ */
function buildServiceDetail(s, idx) {
  const depth = 1;
  const prev = D.SERVICES[(idx - 1 + D.SERVICES.length) % D.SERVICES.length];
  const next = D.SERVICES[(idx + 1) % D.SERVICES.length];

  const coverList = `
      <ul class="checklist" data-accent="${s.accent}">
        ${s.covers.map(c => `<li>${checkIcon}<span>${c}</span></li>`).join('\n        ')}
      </ul>`;

  const asideNav = D.SERVICES.map(x =>
    `<li><a href="${x.slug}.html"${x.slug === s.slug ? ' aria-current="page"' : ''}>${x.nav}</a></li>`).join('\n          ');

  return head({
    title: `${s.title} — ${D.SITE.name}`,
    description: s.lede,
    depth, bodyPage: 'service', canonical: `services/${s.slug}.html`
  }) + header(depth, 'services') + `
<main id="main">

<section class="page-hero" data-accent="${s.accent}">
  <div class="wrap">
    ${crumbs(depth, [
      { label: 'Home', href: 'index.html' },
      { label: 'Services', href: 'services.html' },
      { label: s.nav }
    ])}
    <span class="eyebrow eyebrow--light">${s.tag}</span>
    <h1>${s.h1}</h1>
    <p class="lede">${s.lede}</p>
    <div class="page-hero-actions">
      <a class="btn btn-primary btn-lg" href="../contact.html">Talk to us about this ${arrowIcon}</a>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="detail-grid">
      <div class="prose" data-accent="${s.accent}">
        <h2>What this covers</h2>
${coverList}
        <div class="mt-l"></div>
        ${renderBlocks(s.body)}
      </div>

      <aside class="detail-aside">
        <div class="aside-card aside-card--dark" data-accent="${s.accent}">
          <h3>What you get</h3>
          <ul class="aside-list">
            ${s.deliverables.map(d => `<li>${checkIcon}<span>${d}</span></li>`).join('\n            ')}
          </ul>
        </div>

        <div class="aside-card">
          <h3>All services</h3>
          <ul class="aside-nav">
            ${asideNav}
          </ul>
        </div>

        <div class="aside-card" data-accent="${s.accent}">
          <h3>Not sure this is the right one?</h3>
          <p style="font-size:.9rem">Most engagements start with a short conversation rather than a scoping document. Tell us the problem and we will tell you which service — if any — actually fits.</p>
          <p class="mt-s"><a class="btn btn-primary" href="../contact.html" style="width:100%">Start a conversation</a></p>
        </div>
      </aside>
    </div>
  </div>
</section>
${faqBlock(s.faqs, s.accent, `Questions about ${s.nav.toLowerCase()}`)}

<section class="section section--tight">
  <div class="wrap">
    <div class="page-nav">
      <a href="${prev.slug}.html">
        <span>Previous</span>
        <b>${prev.nav}</b>
      </a>
      <a class="next" href="${next.slug}.html">
        <span>Next</span>
        <b>${next.nav}</b>
      </a>
    </div>
  </div>
</section>
${ctaBand(depth, 'Ready to look at this properly?', 'A 30-minute call, no pitch deck. We will tell you whether we are the right fit — and if we are not, we will point you somewhere better.', 'Book a security review')}
</main>
` + footer(depth);
}

/* ============================================================
   INSIGHTS INDEX
   ============================================================ */
function buildInsightsIndex() {
  const depth = 0;

  const filters = D.CATEGORIES.map(c =>
    `<button class="filter-btn${c.key === 'all' ? ' is-active' : ''}" data-filter="${c.key}" aria-pressed="${c.key === 'all' ? 'true' : 'false'}"${c.accent ? ` data-accent="${c.accent}"` : ''}>${c.label}</button>`).join('\n      ');

  const cards = D.INSIGHTS.map(a => `
      <a class="insight-card reveal" href="insights/${a.slug}.html" data-category="${a.category}" data-accent="${a.accent}">
        <div class="insight-meta">
          <span class="tag">${a.categoryLabel}</span>
          <span>${a.readTime}</span>
        </div>
        <h3>${a.title}</h3>
        <p>${a.excerpt}</p>
        <span class="read-more">Read the article ${arrowIcon}</span>
      </a>`).join('');

  return head({
    title: `Insights — ${D.SITE.name}`,
    description: 'Practical writing on identity, cloud security, resilience and incident response — the things we get asked about most.',
    depth, bodyPage: 'insights', canonical: 'insights.html'
  }) + header(depth, 'insights') + `
<main id="main">

<section class="page-hero">
  <div class="wrap">
    ${crumbs(depth, [{ label: 'Home', href: 'index.html' }, { label: 'Insights' }])}
    <span class="eyebrow eyebrow--light" data-accent="cyan">Insights</span>
    <h1>Practical notes from the work</h1>
    <p class="lede">No thought-leadership, no predictions. Just the problems we get asked about most often, written up so you can act on them without hiring anyone.</p>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="filter-bar" id="insightFilter" role="group" aria-label="Filter articles by topic">
      ${filters}
    </div>
    <div class="insight-grid">
${cards}
    </div>
    <div class="empty-note" id="insightEmpty" hidden>No articles in this topic yet.</div>
  </div>
</section>
${ctaBand(depth, 'Want this applied to your environment?', 'Reading about it is a good start. A 30-minute review will tell you which of these actually applies to you.', 'Book a security review')}
</main>
` + footer(depth);
}

/* ============================================================
   INSIGHT ARTICLE
   ============================================================ */
function buildInsightArticle(a) {
  const depth = 1;

  const others = D.INSIGHTS.filter(x => x.slug !== a.slug).slice(0, 3);
  const otherLinks = others.map(o =>
    `<li><a href="${o.slug}.html">${o.title}</a></li>`).join('\n            ');

  const takeaways = `
        <div class="aside-card" data-accent="${a.accent}">
          <h3>Key takeaways</h3>
          <ul class="aside-list">
            ${a.takeaways.map(t => `<li>${checkIcon}<span>${t}</span></li>`).join('\n            ')}
          </ul>
        </div>`;

  return head({
    title: `${a.title} — ${D.SITE.name} Insights`,
    description: a.excerpt,
    depth, bodyPage: 'insight', canonical: `insights/${a.slug}.html`
  }) + header(depth, 'insights') + `
<main id="main">

<section class="page-hero" data-accent="${a.accent}">
  <div class="wrap">
    ${crumbs(depth, [
      { label: 'Home', href: 'index.html' },
      { label: 'Insights', href: 'insights.html' },
      { label: a.categoryLabel }
    ])}
    <span class="eyebrow eyebrow--light">${a.categoryLabel}</span>
    <h1>${a.title}</h1>
    <p class="lede">${a.lede}</p>
    <div class="article-meta">
      <span class="tag" data-accent="${a.accent}">${a.categoryLabel}</span>
      <span>${a.readTime}</span>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="detail-grid">
      <div class="prose" data-accent="${a.accent}">
        ${renderBlocks(a.body)}
      </div>

      <aside class="detail-aside">
        <div class="aside-card aside-card--dark" data-accent="${a.accent}">
          <h3>Want this done for you?</h3>
          <p>We do this work every week for companies that would rather not become an expert in it. A short call is usually enough to tell whether you need us.</p>
          <p class="mt-s"><a class="btn btn-light" href="../contact.html" style="width:100%">Talk to us</a></p>
        </div>

        <div class="aside-card">
          <h3>More insights</h3>
          <ul class="aside-nav">
            ${otherLinks}
          </ul>
        </div>

        <div class="aside-card" data-accent="${a.accent}">
          <h3>Related service</h3>
          <p style="font-size:.9rem">${relatedServiceText(a, depth)}</p>
        </div>
      </aside>
    </div>
  </div>
</section>
${ctaBand(depth, 'Start with the gaps, not the shopping list.', 'Book a 30-minute review. We will look at what you have and tell you the three things worth doing first.')}
</main>
` + footer(depth);
}

function relatedServiceText(a, depth) {
  const map = {
    web:       ['web-pentest',       'Web application penetration testing'],
    mobile:    ['mobile-pentest',    'Android &amp; iOS penetration testing'],
    network:   ['network-pentest',   'Network penetration testing'],
    ai:        ['ai-security',       'AI security testing'],
    detection: ['threat-detection',  'Threat detection'],
    redteam:   ['red-teaming',       'Red teaming']
  };
  const [slug, label] = map[a.category] || ['web-pentest', 'Web application penetration testing'];
  return `${label} — <a href="${P(depth, `services/${slug}.html`)}">see what is involved</a>.`;
}

/* ============================================================
   ABOUT
   ============================================================ */
function buildAbout() {
  const depth = 0;

  const values = D.ABOUT_VALUES.map(v => `
      <article class="value reveal" data-accent="${v.accent}">
        <div class="icon">${svg(v.icon)}</div>
        <h3>${v.title}</h3>
        <p>${v.text}</p>
      </article>`).join('');

  const principles = D.ABOUT_PRINCIPLES.map(p => `
      <div class="principle reveal">
        <div class="principle-n">${p.n}</div>
        <div>
          <h3>${p.title}</h3>
          <p>${p.text}</p>
        </div>
      </div>`).join('');

  const facts = D.ABOUT_FACTS.map(f =>
    `<div class="fact" data-accent="${f.accent}"><b>${f.b}</b><span>${f.s}</span></div>`).join('\n      ');

  return head({
    title: `About — ${D.SITE.name}`,
    description: 'PB Sec is a small, independent cybersecurity consultancy. Vendor-neutral, purple-team led, and honest about what security work actually changes.',
    depth, bodyPage: 'about', canonical: 'about.html'
  }) + header(depth, 'about') + `
<main id="main">

<section class="page-hero">
  <div class="wrap">
    ${crumbs(depth, [{ label: 'Home', href: 'index.html' }, { label: 'About' }])}
    <span class="eyebrow eyebrow--light" data-accent="amber">About us</span>
    <h1>Small, independent, and hard to sell to</h1>
    <p class="lede">${D.SITE.name} exists because most security advice available to a growing company is either too expensive, too generic, or quietly for sale. We built the consultancy we wished our clients could hire.</p>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="split">
      <div class="reveal">
        <span class="eyebrow" data-accent="purple">Why we exist</span>
        <h2>Security advice should not be a sales channel</h2>
        <p class="lede">The most common problem we are called in to fix is not a missing product. It is a sequence problem: a platform bought before the risk was understood, a compliance framework implemented as paperwork, a penetration test commissioned to satisfy a customer rather than to find anything.</p>
        <p class="lede mt-s">So we work the other way round. Understand the environment, find what actually matters, fix it in the order that reduces risk fastest, and only then talk about tooling — if there is anything left to buy.</p>
      </div>
      <div class="reveal">
        <div class="aside-card aside-card--dark" data-accent="cyan">
          <h3>What we are not</h3>
          <ul class="aside-list">
            <li>${checkIcon}<span>A reseller — we take no vendor commission</span></li>
            <li>${checkIcon}<span>An audit firm — we prepare you, we do not certify you</span></li>
            <li>${checkIcon}<span>A body shop — you work with the people who did the work</span></li>
            <li>${checkIcon}<span>A 24/7 SOC for everyone — we quote coverage honestly</span></li>
          </ul>
        </div>
      </div>
    </div>

    <div class="fact-row">
      ${facts}
    </div>
  </div>
</section>

<section class="section approach">
  <div class="wrap">
    <div class="section-head reveal">
      <span class="eyebrow" data-accent="emerald">How we behave</span>
      <h2>Six things we hold to</h2>
      <p class="lede">These are not aspirations. They are the constraints we accept, including when they cost us work.</p>
    </div>
    <div class="value-grid">
${values}
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="detail-grid">
      <div class="reveal">
        <div class="section-head">
          <span class="eyebrow" data-accent="magenta">How we think</span>
          <h2>Five working principles</h2>
        </div>
${principles}
      </div>
      <aside class="detail-aside reveal">
        <div class="aside-card" data-accent="blue">
          <h3>How an engagement starts</h3>
          <p style="font-size:.93rem">A 30-minute call, then a short written scope with a fixed price and a fixed date. No discovery phase that bills by the hour while we work out what we are doing.</p>
        </div>
        <div class="aside-card" data-accent="amber">
          <h3>What we need from you</h3>
          <p style="font-size:.93rem">A technical contact who can answer questions, read access to configuration and logs, and permission to be blunt in the report. That is usually enough to start.</p>
        </div>
        <div class="aside-card aside-card--dark" data-accent="purple">
          <h3>Work with us</h3>
          <p>Whether you need a one-off assessment or a long-term partner, the first step is the same.</p>
          <p class="mt-s"><a class="btn btn-light" href="contact.html" style="width:100%">Book a review</a></p>
        </div>
      </aside>
    </div>
  </div>
</section>
${ctaBand(depth, 'Let us look at what you have.', 'Thirty minutes, no pitch deck. We will tell you the three things worth doing first — and whether you need us at all.')}
</main>
` + footer(depth);
}

/* ============================================================
   CAREERS
   ============================================================ */
function buildCareers() {
  const depth = 0;

  const roles = D.ROLES.map(r => `
      <article class="role reveal" data-accent="${r.accent}">
        <div class="role-head">
          <h3>${r.title}</h3>
          <span class="role-status${r.statusKind === 'pipeline' ? ' role-status--pipeline' : ''}">${r.status}</span>
        </div>
        <p>${r.text}</p>
        <div class="role-tags">
          ${r.tags.map(t => `<span>${t}</span>`).join('\n          ')}
        </div>
      </article>`).join('');

  const steps = [
    { accent: 'purple', n: 'Step 01', h: 'A conversation', p: 'Thirty minutes with the person you would work alongside. Mostly about what you have actually done and what you want to get better at.' },
    { accent: 'cyan', n: 'Step 02', h: 'A real problem', p: 'A short, paid exercise drawn from real work — not a puzzle. You keep your notes and we will walk through our thinking either way.' },
    { accent: 'amber', n: 'Step 03', h: 'Meet the team', p: 'You talk to the people you would sit with. Ask them the awkward questions; that is what the stage is for.' },
    { accent: 'emerald', n: 'Step 04', h: 'An honest answer', p: 'A decision within a week, with real feedback whether it is a yes or a no. Nobody enjoys being left hanging.' }
  ].map(s => `
      <article class="step reveal" data-accent="${s.accent}">
        <div class="step-num">${s.n}</div>
        <h3>${s.h}</h3>
        <p>${s.p}</p>
      </article>`).join('');

  return head({
    title: `Careers — ${D.SITE.name}`,
    description: 'Work on real security problems with people who will read your findings. Open roles in penetration testing, detection engineering and compliance consulting.',
    depth, bodyPage: 'careers', canonical: 'careers.html'
  }) + header(depth, 'careers') + `
<main id="main">

<section class="page-hero">
  <div class="wrap">
    ${crumbs(depth, [{ label: 'Home', href: 'index.html' }, { label: 'Careers' }])}
    <span class="eyebrow eyebrow--light" data-accent="emerald">Careers</span>
    <h1>Do the work, then write it up honestly</h1>
    <p class="lede">We are a small team by choice. That means fewer people, more ownership, and no layer of account managers between you and the problem you are solving.</p>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="section-head reveal">
      <span class="eyebrow" data-accent="cyan">Open roles</span>
      <h2>Where we are hiring</h2>
      <p class="lede">If your experience does not map neatly onto a listing but you think you would be good at this, write to us anyway and tell us why.</p>
    </div>
    <div class="grid-2">
${roles}
    </div>
  </div>
</section>

<section class="section approach">
  <div class="wrap">
    <div class="section-head reveal">
      <span class="eyebrow" data-accent="amber">How we hire</span>
      <h2>Four steps, no whiteboard theatre</h2>
      <p class="lede">We are not trying to find out whether you can perform under artificial pressure. We are trying to find out whether you would be good to work with on a bad day.</p>
    </div>
    <div class="steps">
${steps}
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="split">
      <div class="reveal">
        <span class="eyebrow" data-accent="magenta">What you get</span>
        <h2>Working here</h2>
        <ul class="checklist" data-accent="magenta">
          <li>${checkIcon}<span>Remote-first, with hours that fit around your life</span></li>
          <li>${checkIcon}<span>Time and budget for certifications and conferences</span></li>
          <li>${checkIcon}<span>Direct access to clients — no layers in between</span></li>
          <li>${checkIcon}<span>A say in what we take on and how we do it</span></li>
          <li>${checkIcon}<span>Work on offence and defence, not just one</span></li>
          <li>${checkIcon}<span>Honest feedback, including when you are right and we are not</span></li>
        </ul>
      </div>
      <div class="reveal">
        <div class="aside-card aside-card--dark" data-accent="emerald">
          <h3>Not seeing your role?</h3>
          <p>We keep a short list of people we would like to work with before there is a vacancy. If that sounds presumptuous, it is — but it has worked well for us so far.</p>
          <p class="mt-s"><a class="btn btn-light" href="contact.html" style="width:100%">Get in touch</a></p>
        </div>
      </div>
    </div>
  </div>
</section>
${ctaBand(depth, 'Think you would fit?', 'Send us something you have written or built, and tell us what you want to get better at. That tells us more than a CV.', 'Start a conversation')}
</main>
` + footer(depth);
}

/* ============================================================
   CONTACT
   ============================================================ */
function buildContact() {
  const depth = 0;

  const contactFaqs = [
    { q: 'What happens after I send this?', a: 'A person reads it — usually within a business day — and replies with either a few clarifying questions or a proposed time to talk. You will not be added to a mailing list or passed to a sales sequence.' },
    { q: 'Do you charge for the first call?', a: 'No. The first 30-minute conversation is free, and we will tell you honestly if we are not the right fit. We would rather point you somewhere better than take on work we cannot do well.' },
    { q: 'How is pricing structured?', a: 'Assessments are fixed price, scoped and quoted before we start. Ongoing work is a retainer measured in days per month, so you can scale it up or down as your needs change. No surprise invoices.' },
    { q: 'We think we may have been breached. What now?', a: 'Say so in the message, or call if you have a number for us. Do not wipe or rebuild anything yet — containment and evidence preservation come first, and those two goals sometimes pull in opposite directions.' },
    { q: 'Do you work with companies outside your time zone?', a: 'Yes. We are remote-first and work with clients across several time zones. For incident response retainers we agree the covered hours explicitly so there is no ambiguity about when you can reach someone.' },
    { q: 'Can you sign an NDA before we talk?', a: 'Gladly. Send yours and we will return it, or use ours. We are also happy to keep the first conversation general enough that nothing sensitive needs to be shared.' }
  ];

  return head({
    title: `Contact — ${D.SITE.name}`,
    description: 'Book a 30-minute security review with PB Sec. No pitch deck, no obligation — we will tell you the three things worth doing first.',
    depth, bodyPage: 'contact', canonical: 'contact.html'
  }) + header(depth, 'contact') + `
<main id="main">

<section class="page-hero">
  <div class="wrap">
    ${crumbs(depth, [{ label: 'Home', href: 'index.html' }, { label: 'Contact' }])}
    <span class="eyebrow eyebrow--light" data-accent="purple">Get in touch</span>
    <h1>Tell us what is worrying you</h1>
    <p class="lede">A short call, no pitch deck. We will tell you whether we are the right fit — and if we are not, we will point you somewhere better.</p>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="contact-grid">
      <div class="contact-info reveal">
        <h2>How to reach us</h2>
        <p class="lede">Use the form, or email us directly if you prefer. If you are dealing with an active incident, say so in the first line and we will prioritise it.</p>
${CONTACT_INFO}
      </div>
${CONTACT_FORM(depth)}
    </div>
  </div>
</section>
${faqBlock(contactFaqs, 'purple', 'Before you get in touch')}
${ctaBand(depth, 'Prefer to start with something free?', 'Run the two-minute posture check first and bring the results to the call. It usually makes the conversation sharper.', 'Take the posture check')}
</main>
` + footer(depth);
}

/* ============================================================
   404
   ============================================================ */
function buildNotFound() {
  const depth = 0;

  const links = [
    { accent: 'magenta', icon: 'globe',    h: 'Web app testing',    p: 'Web applications and APIs, tested the way an attacker would.', href: 'services/web-pentest.html' },
    { accent: 'amber',   icon: 'smartphone', h: 'Mobile app testing', p: 'Android and iOS, on real devices, including the API behind them.', href: 'services/mobile-pentest.html' },
    { accent: 'rose',    icon: 'target',   h: 'Red teaming',        p: 'A goal-based simulation against people, process and technology.', href: 'services/red-teaming.html' },
    { accent: 'cyan',    icon: 'cpu',      h: 'AI security testing', p: 'Prompt injection, data leakage and agent tool abuse.', href: 'services/ai-security.html' }
  ].map(l => `
      <a class="card reveal" href="${l.href}" data-accent="${l.accent}">
        <div class="icon">${svg(l.icon)}</div>
        <h3>${l.h}</h3>
        <p>${l.p}</p>
      </a>`).join('');

  return head({
    title: `Page not found — ${D.SITE.name}`,
    description: 'That page does not exist. Here are the places most people are looking for.',
    depth, bodyPage: '404', robots: 'noindex, follow'
  }) + header(depth, '') + `
<main id="main">

<section class="page-hero page-hero--center" data-accent="magenta">
  <div class="wrap">
    <span class="eyebrow eyebrow--light">Error 404</span>
    <h1>That page is not here</h1>
    <p class="lede">The link may be out of date, or the page may have moved. Nothing is broken on your side — and if you arrived here from a link on our own site, we would like to know.</p>
    <div class="page-hero-actions">
      <a class="btn btn-primary btn-lg" href="index.html">Back to the homepage ${arrowIcon}</a>
      <a class="btn btn-outline-light btn-lg" href="contact.html">Report a broken link</a>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="section-head center reveal">
      <span class="eyebrow" data-accent="cyan">Popular pages</span>
      <h2>Maybe one of these was what you wanted</h2>
    </div>
    <div class="grid-2">
${links}
    </div>

    <div class="fact-row">
      <div class="fact" data-accent="magenta"><b><a href="services.html">All services</a></b><span>Six engagements, and how they fit together.</span></div>
      <div class="fact" data-accent="emerald"><b><a href="insights.html">Insights</a></b><span>Practical writing you can act on without hiring anyone.</span></div>
      <div class="fact" data-accent="purple"><b><a href="index.html#posture">Free posture check</a></b><span>Six questions, two minutes, no email required.</span></div>
    </div>
  </div>
</section>
${ctaBand(depth, 'Still stuck?', 'Tell us what you were looking for and we will point you at it — or tell you it does not exist.', 'Get in touch')}
</main>
` + footer(depth);
}

/* ============================================================
   sitemap.xml / robots.txt
   ============================================================ */
function buildSitemap(entries) {
  const rows = entries.map(([rel, meta]) => {
    const loc = `${SITE_URL}/${rel === 'index.html' ? '' : rel}`;
    return `  <url>
    <loc>${loc}</loc>
    <changefreq>${meta.changefreq}</changefreq>
    <priority>${meta.priority}</priority>
  </url>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${rows}
</urlset>
`;
}

function buildRobots() {
  return `# ${D.SITE.name}
User-agent: *
Allow: /
Disallow: /404.html

Sitemap: ${SITE_URL}/sitemap.xml
`;
}

/* ============================================================
   WRITE EVERYTHING
   ============================================================ */
const pages = [];
// priority/changefreq are used by sitemap.xml only
const sitemapMeta = [];

const add = (rel, html, meta) => {
  pages.push([rel, html]);
  if (meta) sitemapMeta.push([rel, meta]);
};

add('index.html', buildHome(), { priority: '1.0', changefreq: 'monthly' });
add('services.html', buildServicesIndex(), { priority: '0.9', changefreq: 'monthly' });
add('about.html', buildAbout(), { priority: '0.6', changefreq: 'yearly' });
add('careers.html', buildCareers(), { priority: '0.5', changefreq: 'weekly' });
add('contact.html', buildContact(), { priority: '0.8', changefreq: 'yearly' });
add('insights.html', buildInsightsIndex(), { priority: '0.7', changefreq: 'weekly' });

D.SERVICES.forEach((s, i) => {
  add(`services/${s.slug}.html`, buildServiceDetail(s, i), { priority: '0.9', changefreq: 'monthly' });
});
D.INSIGHTS.forEach(a => {
  add(`insights/${a.slug}.html`, buildInsightArticle(a), { priority: '0.6', changefreq: 'yearly' });
});

// 404 is generated but deliberately kept out of the sitemap
add('404.html', buildNotFound(), null);

let written = 0;
const expected = new Set(pages.map(([rel]) => rel.replace(/\\/g, '/')));

// Remove stale pages from the generated subdirectories — only .html files
// directly inside services/ and insights/, never anything else.
let removed = 0;
for (const dir of ['services', 'insights']) {
  const abs = path.join(ROOT, dir);
  if (!fs.existsSync(abs)) continue;
  for (const name of fs.readdirSync(abs)) {
    if (!name.endsWith('.html')) continue;
    const rel = `${dir}/${name}`;
    if (!expected.has(rel)) {
      fs.unlinkSync(path.join(abs, name));
      console.log(`  removed stale: ${rel}`);
      removed++;
    }
  }
}

pages.forEach(([rel, html]) => {
  const out = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, html, 'utf8');
  written++;
  console.log(`  ${rel.padEnd(52)} ${(html.length / 1024).toFixed(1)} KB`);
});

// non-page assets
const extras = [
  ['assets/favicon.svg', FAVICON_SVG],
  ['sitemap.xml', buildSitemap(sitemapMeta)],
  ['robots.txt', buildRobots()]
];
for (const [rel, content] of extras) {
  const out = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, content, 'utf8');
  console.log(`  ${rel.padEnd(52)} ${(content.length / 1024).toFixed(1)} KB`);
}

console.log(`\n${written} pages written, ${extras.length} extra files${removed ? `, ${removed} stale page(s) removed` : ''}.`);
console.log(`Site URL used for canonical + sitemap: ${SITE_URL}`);
