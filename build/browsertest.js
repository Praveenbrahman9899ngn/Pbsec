/* ============================================================
   Browser test across every generated page (CDP-driven).
   Checks: JS errors, stylesheet load, header/footer, single h1,
   reveal animation completion, horizontal overflow at two widths,
   and that the accent palette actually produces distinct colours.
   ============================================================ */
const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const CHROME = process.env.PBSEC_CHROME || 'C:/Users/Asus/.agent-browser/browsers/chrome-153.0.8010.36/chrome.exe';
const ROOT = path.resolve(__dirname, '..');
// keep Chrome profiles and screenshots out of the deliverable directory
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'pbsec-shot-'));
const PORT = 9336;
const sleep = ms => new Promise(r => setTimeout(r, ms));

const fileUrl = rel =>
  'file:///' + path.join(ROOT, rel).replace(/\\/g, '/').replace(/ /g, '%20');

const PAGES = [
  'index.html', 'services.html', 'about.html', 'careers.html',
  'contact.html', 'insights.html', '404.html',
  'services/web-pentest.html', 'services/mobile-pentest.html',
  'services/network-pentest.html', 'services/ai-security.html',
  'services/threat-detection.html', 'services/red-teaming.html',
  'insights/what-a-web-pentest-covers.html',
  'insights/android-and-ios-fail-differently.html',
  'insights/where-network-tests-find-problems.html',
  'insights/prompt-injection-the-ai-attack-surface.html',
  'insights/detection-is-a-tuning-problem.html',
  'insights/red-teaming-vs-penetration-testing.html'
];

const SHOTS = {
  'index.html': [['idx-hero', 0], ['idx-services', 1150], ['idx-why', 4600]],
  'services.html': [['svc-index', 0]],
  'services/ai-security.html': [['svc-detail', 0]],
  'insights.html': [['insights', 0]],
  'about.html': [['about', 0]],
  'careers.html': [['careers', 0]],
  'contact.html': [['contact', 0]]
};

let pass = 0, fail = 0;
const problems = [];
const check = (page, name, cond, extra) => {
  if (cond) pass++;
  else { fail++; problems.push(`${page}: ${name}${extra !== undefined ? ' -> ' + extra : ''}`); }
};

let chrome, ws;
(async () => {
  chrome = spawn(CHROME, [
    '--headless=new', '--disable-gpu', '--no-sandbox', '--hide-scrollbars', '--no-first-run',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${path.join(TMP, 'profile')}`,
    '--window-size=1440,950', 'about:blank'
  ], { stdio: 'ignore' });

  let up = null;
  for (let i = 0; i < 60; i++) {
    try { up = await (await fetch(`http://127.0.0.1:${PORT}/json/version`)).json(); break; }
    catch { await sleep(400); }
  }
  if (!up) throw new Error('debugger never came up');

  const target = await (await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, { method: 'PUT' })).json();
  ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });

  let id = 0; const pending = new Map(); let events = [];
  ws.onmessage = e => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) {
      const { resolve, reject } = pending.get(m.id); pending.delete(m.id);
      m.error ? reject(new Error(JSON.stringify(m.error))) : resolve(m.result);
    } else if (m.method) events.push(m.method);
  };
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const i = ++id; pending.set(i, { resolve, reject });
    ws.send(JSON.stringify({ id: i, method, params }));
  });
  const js = async expr => {
    const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.text + ' :: ' + expr.slice(0, 80));
    return r.result.value;
  };
  const viewport = (w, h) => send('Emulation.setDeviceMetricsOverride',
    { width: w, height: h, deviceScaleFactor: 1, mobile: w < 700 });

  await send('Page.enable');
  await send('Runtime.enable');
  await viewport(1440, 950);

  for (const rel of PAGES) {
    events = [];
    // install an error collector before the page's own scripts run
    await send('Page.addScriptToEvaluateOnNewDocument', {
      source: 'window.__errs=[];window.addEventListener("error",e=>window.__errs.push(String(e.message)));'
    });
    await send('Page.navigate', { url: fileUrl(rel) });
    for (let i = 0; i < 120 && !events.includes('Page.loadEventFired'); i++) await sleep(120);
    await sleep(900);

    const docH = await js('document.documentElement.scrollHeight');

    // scroll through to fire every reveal
    for (let y = 0; y < docH; y += 600) { await js(`window.scrollTo(0,${y})`); await sleep(60); }
    await js('window.scrollTo(0,0)');
    await sleep(500);

    const r = JSON.parse(await js(`JSON.stringify({
      errs: (window.__errs||[]),
      sheet: document.styleSheets.length,
      // file:// origins are opaque, so cssRules is unreadable — verify the
      // stylesheet actually took effect via computed styles instead.
      applied: (function(){
        var hero = document.querySelector('.hero, .page-hero');
        var card = document.querySelector(
          '.card, .aside-card, .insight-card, .role, .value, .quiz, .form, .step, .faq-wrap'
        );
        var h1 = document.querySelector('h1');
        return {
          bodyFont: getComputedStyle(document.body).fontFamily,
          heroBg: hero ? getComputedStyle(hero).backgroundImage.slice(0, 15) : '',
          cardRadius: card ? getComputedStyle(card).borderRadius : '',
          h1Font: h1 ? getComputedStyle(h1).fontFamily : '',
          wrapMax: getComputedStyle(document.querySelector('.wrap')).maxWidth
        };
      })(),
      header: !!document.querySelector('.site-header'),
      headerVisible: (function(){ var h=document.querySelector('.site-header'); return h ? getComputedStyle(h).display !== 'none' : false; })(),
      footer: !!document.querySelector('.site-footer'),
      navLinks: document.querySelectorAll('.nav-links a').length,
      h1: document.querySelectorAll('h1').length,
      title: document.title,
      reveals: document.querySelectorAll('.reveal').length,
      hiddenReveals: document.querySelectorAll('.reveal:not(.is-in)').length,
      footerYear: (document.getElementById('year')||{}).textContent,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth
    })`));

    check(rel, 'no uncaught JS errors', r.errs.length === 0, JSON.stringify(r.errs));
    check(rel, 'stylesheet applied (body font from our CSS)',
      /Inter/.test(r.applied.bodyFont), r.applied.bodyFont);
    check(rel, 'stylesheet applied (layout tokens resolve)',
      r.applied.wrapMax === '1180px' && r.applied.cardRadius !== '' && r.applied.cardRadius !== '0px',
      `wrap=${r.applied.wrapMax} cardRadius=${r.applied.cardRadius}`);
    check(rel, 'stylesheet applied (hero gradient renders)',
      r.applied.heroBg === 'radial-gradient', r.applied.heroBg);
    check(rel, 'display font applied to h1',
      /Space Grotesk/.test(r.applied.h1Font), r.applied.h1Font);
    check(rel, 'header present and visible', r.header && r.headerVisible);
    check(rel, 'footer present', r.footer);
    check(rel, 'nav has 5 links', r.navLinks === 5, r.navLinks);
    check(rel, 'exactly one h1', r.h1 === 1, r.h1);
    check(rel, 'document title set', /PB Sec/.test(r.title), r.title);
    check(rel, 'all reveals animated in', r.hiddenReveals === 0, `${r.hiddenReveals}/${r.reveals} hidden`);
    check(rel, 'footer year script ran', r.footerYear === String(new Date().getFullYear()), r.footerYear);
    check(rel, 'no horizontal overflow @1440', r.overflow <= 1, r.overflow + 'px');

    // mobile pass
    await viewport(390, 844);
    await js('window.scrollTo(0,0)');
    await sleep(450);
    const mOv = await js('document.documentElement.scrollWidth - document.documentElement.clientWidth');
    check(rel, 'no horizontal overflow @390', mOv <= 1, mOv + 'px');
    await viewport(1440, 950);

    // screenshots
    if (SHOTS[rel]) {
      for (const [name, y] of SHOTS[rel]) {
        await js(`window.scrollTo(0,${y})`);
        await sleep(420);
        const s = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(path.join(TMP, `shot-${name}.png`), Buffer.from(s.data, 'base64'));
      }
    }
    if (rel === 'index.html') {
      for (const [name, scroll] of [
        ['homepage-updated.png', 'window.scrollTo({top:0,left:0,behavior:"instant"})'],
        ['posture-check-updated.png', 'document.querySelector("#posture").scrollIntoView({block:"start",behavior:"instant"})']
      ]) {
        await js(scroll);
        await sleep(420);
        const s = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
        fs.writeFileSync(path.join(TMP, name), Buffer.from(s.data, 'base64'));
      }
    }
  }

  /* ---------- accent palette actually applied? ---------- */
  await send('Page.navigate', { url: fileUrl('index.html') });
  await sleep(1800);
  const accents = JSON.parse(await js(`(function(){
    var out = [];
    document.querySelectorAll('#services .card').forEach(function(c){
      var ic = c.querySelector('.icon');
      var cs = getComputedStyle(ic);
      out.push({ accent: c.getAttribute('data-accent'), color: cs.color });
    });
    return JSON.stringify(out);
  })()`));
  const distinct = new Set(accents.map(a => a.color));
  check('index.html', 'six service cards have six distinct accent colours', distinct.size === 6,
    `${distinct.size} distinct: ${[...distinct].join(' | ')}`);
  check('index.html', 'every service card declares an accent', accents.every(a => a.accent),
    JSON.stringify(accents.map(a => a.accent)));

  const inkColours = JSON.parse(await js(`(function(){
    var set = {};
    ['--a-purple','--a-magenta','--a-cyan','--a-teal','--a-emerald','--a-amber','--a-rose','--a-blue','--a-indigo']
      .forEach(function(v){ set[v] = getComputedStyle(document.documentElement).getPropertyValue(v).trim(); });
    return JSON.stringify(set);
  })()`));
  check('index.html', 'all 9 accent tokens resolve',
    Object.values(inkColours).filter(Boolean).length === 9, JSON.stringify(inkColours));

  /* ---------- hover effects actually fire? ----------
     Note the two selectors: `hover` is the element the pointer is over,
     `probe` is the element whose computed style should change. Rules like
     `.card:hover .icon` need hover forced on the ancestor, not the icon. */
  await send('DOM.enable');
  await send('CSS.enable');
  const doc = await send('DOM.getDocument', { depth: -1 });

  // scroll the whole page first so every .reveal element has settled
  const docH2 = await js('document.documentElement.scrollHeight');
  for (let y = 0; y < docH2; y += 600) { await js(`window.scrollTo(0,${y})`); await sleep(50); }
  await js('window.scrollTo(0,0)');
  await sleep(700);
  check('index.html', 'all reveals settled before hover tests',
    (await js('document.querySelectorAll(".reveal:not(.is-in)").length')) === 0);

  const hoverTargets = [
    { name: 'service card lifts',   hover: '#services .card',        probe: '#services .card',        prop: 'transform' },
    { name: 'card icon fills',      hover: '#services .card',        probe: '#services .card .icon',  prop: 'backgroundImage' },
    { name: 'primary button lifts', hover: '.btn-primary',           probe: '.btn-primary',           prop: 'transform' },
    { name: 'step card lifts',      hover: '#approach .step',        probe: '#approach .step',        prop: 'transform' },
    { name: 'why item lifts',       hover: '#why .why-item',         probe: '#why .why-item',         prop: 'transform' },
    { name: 'faq plus reacts',      hover: '.faq-item',              probe: '.faq-item .plus',        prop: 'transform' },
    { name: 'nav link highlights',  hover: '.nav-links a',           probe: '.nav-links a',           prop: 'transform' },
    { name: 'hero chip reacts',     hover: '.hero-badges .chip',     probe: '.hero-badges .chip',     prop: 'transform' }
  ];

  for (const t of hoverTargets) {
    const node = await send('DOM.querySelector', { nodeId: doc.root.nodeId, selector: t.hover });
    if (!node.nodeId) { check('index.html', `hover: ${t.name}`, false, 'hover selector not found'); continue; }

    const readStyle = async () => JSON.parse(await js(`(function(){
      var el = document.querySelector(${JSON.stringify(t.probe)});
      var cs = getComputedStyle(el);
      return JSON.stringify({ v: cs[${JSON.stringify(t.prop)}], shadow: cs.boxShadow.slice(0, 20) });
    })()`));

    const before = await readStyle();
    await send('CSS.forcePseudoState', { nodeId: node.nodeId, forcedPseudoClasses: ['hover'] });
    await sleep(150);
    const after = await readStyle();
    await send('CSS.forcePseudoState', { nodeId: node.nodeId, forcedPseudoClasses: [] });
    await sleep(60);

    const changed = before.v !== after.v || before.shadow !== after.shadow;
    check('index.html', `hover: ${t.name}`, changed,
      `${t.prop} "${before.v}" -> "${after.v}"`);
  }

  /* ---------- keyboard focus is visible ----------
     Programmatic .focus() does not trigger :focus-visible in Chrome,
     so force the pseudo-class the way a Tab press would. */
  const btnNode = await send('DOM.querySelector', { nodeId: doc.root.nodeId, selector: '.btn-primary' });
  await send('CSS.forcePseudoState', { nodeId: btnNode.nodeId, forcedPseudoClasses: ['focus-visible'] });
  await sleep(120);
  const fr = JSON.parse(await js(`(function(){
    var cs = getComputedStyle(document.querySelector('.btn-primary'));
    return JSON.stringify({ w: cs.outlineWidth, s: cs.outlineStyle, c: cs.outlineColor });
  })()`));
  await send('CSS.forcePseudoState', { nodeId: btnNode.nodeId, forcedPseudoClasses: [] });
  check('index.html', 'focus-visible ring is styled',
    fr.s !== 'none' && parseFloat(fr.w) > 0, JSON.stringify(fr));

  /* ---------- simplified hero and six-question posture check ---------- */
  await viewport(1440, 950);
  await js('window.scrollTo({top:0,left:0,behavior:"instant"})');
  events = [];
  await send('Page.navigate', { url: fileUrl('index.html') });
  for (let i = 0; i < 120 && !events.includes('Page.loadEventFired'); i++) await sleep(120);
  await sleep(900);
  check('index.html', 'quiz initialization does not jump down the page',
    await js('window.scrollX === 0 && window.scrollY === 0'));
  check('index.html', 'simplified security overview replaces radar card',
    await js('!!document.querySelector(".security-overview") && !document.querySelector(".radar-card")'));

  const checkPostureLayout = async stage => {
    for (const width of [320, 390, 768, 1440]) {
      await viewport(width, width < 700 ? 844 : 950);
      for (const selector of ['.hero', '#posture']) {
        const layout = await js(`(() => {
          const el = document.querySelector(${JSON.stringify(selector)});
          if (!el) return { missing: true };
          el.scrollIntoView({ block: 'start', behavior: 'instant' });
          const width = document.documentElement.clientWidth;
          const outside = [el, ...el.querySelectorAll('*')].filter(node => {
            if (!node.getClientRects().length || getComputedStyle(node).visibility === 'hidden') return false;
            const rect = node.getBoundingClientRect();
            return rect.left < -1 || rect.right > width + 1;
          }).map(node => node.id || node.className || node.tagName);
          return {
            pageOverflow: document.documentElement.scrollWidth - width,
            componentOverflow: el.scrollWidth - el.clientWidth,
            outside: outside.slice(0, 8)
          };
        })()`);
        check('index.html', `${stage}: ${selector} has no horizontal overflow @${width}`,
          !layout.missing && layout.pageOverflow <= 1 && layout.componentOverflow <= 1 && layout.outside.length === 0,
          JSON.stringify(layout));
      }
      const infinite = await js(`(() => {
        const hero = document.querySelector('.security-overview');
        return hero ? hero.getAnimations({ subtree: true })
          .filter(animation => animation.effect.getComputedTiming().iterations === Infinity)
          .map(animation => animation.animationName || 'unnamed animation') : ['missing security overview'];
      })()`);
      check('index.html', `${stage}: security overview has no infinite animations @${width}`,
        infinite.length === 0, JSON.stringify(infinite));
    }
  };
  await checkPostureLayout('initial quiz');

  // Each click and its assertions run in the same JS task: delayed advancement
  // or delayed focus cannot pass by waiting for a timer between answers.
  const quizChecks = await js(String.raw`(() => {
    const findings = new Map();
    let context = 'initial quiz';
    let exhaustive = false;
    const record = (name, ok, detail) => {
      const key = (exhaustive ? 'all 4096 answer sequences' : context) + ': ' + name;
      if (!findings.has(key)) findings.set(key, { name: key, ok: true });
      const finding = findings.get(key);
      if (!ok && finding.ok) {
        finding.ok = false;
        finding.detail = context + (detail === undefined ? '' : ' -> ' + JSON.stringify(detail));
      }
    };
    const text = el => el ? el.textContent.trim() : '';
    const visible = el => !!el && !el.hidden && el.getClientRects().length > 0 &&
      getComputedStyle(el).visibility !== 'hidden' && getComputedStyle(el).display !== 'none';
    const normalize = value => value.replace(/\s+/g, ' ').trim().toLowerCase();
    const questions = Array.from(document.querySelectorAll('.q'));
    const active = () => document.querySelector('.q.is-active');
    const answers = Array(6).fill(null);
    const metadata = [];
    const points = { yes: 2, partly: 1, no: 0, unsure: 0 };
    const readScore = () => {
      const number = document.querySelector('#scoreNum, #scoreValue');
      const max = document.querySelector('#scoreMax');
      const match = number ? text(number).match(/^\d+/) :
        text(max && max.parentElement).match(/(\d+)\s*(?:\/|out of)\s*12\b/i);
      return match ? Number(match[1] || match[0]) : null;
    };
    const progress = completed => {
      const el = document.querySelector('#quizProgress');
      record('progressbar exposes completed total ' + completed,
        !!el && el.getAttribute('role') === 'progressbar' &&
        el.getAttribute('aria-valuemax') === '6' && el.getAttribute('aria-valuenow') === String(completed),
        el && { role: el.getAttribute('role'), max: el.getAttribute('aria-valuemax'), now: el.getAttribute('aria-valuenow') });
    };
    const selection = (question, expected, index) => {
      const options = question ? Array.from(question.querySelectorAll('.opt')) : [];
      record('Q' + (index + 1) + ' selection and aria-pressed agree', options.length === 4 && options.every(option => {
        const selected = option.dataset.answer === expected;
        return option.classList.contains('is-selected') === selected &&
          option.getAttribute('aria-pressed') === String(selected);
      }), options.map(option => [option.dataset.answer, option.classList.contains('is-selected'), option.getAttribute('aria-pressed')]));
    };
    const control = kind => {
      const pattern = kind === 'Back' ? /\b(back|previous)\b/i : /\b(retake|restart)\b|start (over|again)|try again/i;
      const button = Array.from(document.querySelectorAll('#posture button, #posture [role="button"]'))
        .find(el => pattern.test((el.getAttribute('aria-label') || '') + ' ' + text(el)) && visible(el));
      record(kind + ' control is available', !!button && !button.disabled && button.getAttribute('aria-disabled') !== 'true');
      if (!button || button.disabled || button.getAttribute('aria-disabled') === 'true') return false;
      button.click();
      if (kind === 'Back') {
        const question = active();
        record('Back immediately focuses the question heading', !!question && document.activeElement === question.querySelector('h3'));
      }
      return true;
    };
    const retake = () => {
      if (!control('Retake')) return false;
      answers.fill(null);
      metadata.length = 0;
      const question = active();
      record('Retake immediately returns to the first question', question === questions[0] &&
        document.querySelectorAll('.q.is-active').length === 1 && !visible(document.querySelector('#scoreTitle')));
      record('Retake resets the displayed score', readScore() === 0, readScore());
      record('Retake clears uncertainty', !visible(document.querySelector('#scoreUnknown')));
      progress(0);
      selection(question, null, 0);
      return question === questions[0];
    };
    const choose = answer => {
      const question = active();
      const index = questions.indexOf(question);
      record('exactly one question is active before answering', index >= 0 && document.querySelectorAll('.q.is-active').length === 1);
      if (index < 0) return false;
      // Read question data only from .q.is-active, never from hidden questions.
      const options = Array.from(question.querySelectorAll('.opt'));
      record('Q' + (index + 1) + ' has all four answer values and scores', options.length === 4 &&
        Object.entries(points).every(([value, score]) => options.filter(option =>
          option.dataset.answer === value && option.dataset.score === String(score)).length === 1),
        options.map(option => [option.dataset.answer, option.dataset.score]));
      selection(question, answers[index], index);
      metadata[index] = { action: question.dataset.action || '', topic: question.dataset.topic || '' };
      record('Q' + (index + 1) + ' declares recommendation action and topic',
        !!metadata[index].action.trim() && !!metadata[index].topic.trim(), metadata[index]);
      const option = options.find(option => option.dataset.answer === answer);
      record('Q' + (index + 1) + ' answer can be clicked', !!option && !option.disabled);
      if (!option || option.disabled) return false;
      option.click();
      answers[index] = answer;
      answers.fill(null, index + 1);
      progress(index + 1);
      const next = active();
      if (index < 5) {
        record('Q' + (index + 1) + ' immediately advances and focuses the next heading',
          next === questions[index + 1] && document.querySelectorAll('.q.is-active').length === 1 &&
          document.activeElement === next.querySelector('h3'));
      } else {
        const title = document.querySelector('#scoreTitle');
        record('last answer immediately reveals and focuses results', !next && visible(title) && document.activeElement === title);
      }
      return true;
    };
    const result = (expectedScore, expectedBand) => {
      const unknown = answers.filter(answer => answer === 'unsure').length;
      const gaps = answers.map((answer, index) => ({ answer, ...metadata[index] })).filter(item => item.answer !== 'yes');
      const recs = Array.from(document.querySelectorAll('#scoreRecs li')).map(el => normalize(text(el)));
      record('displayed score is ' + expectedScore, readScore() === expectedScore, readScore());
      record('maximum score stays 12', text(document.querySelector('#scoreMax')) === '12');
      record('result band is ' + expectedBand, text(document.querySelector('#scoreBand')) === expectedBand,
        text(document.querySelector('#scoreBand')));
      record('unsure is distinct from a known no', visible(document.querySelector('#scoreUnknown')) === (unknown > 0),
        { unknown, label: text(document.querySelector('#scoreUnknown')) });
      record('recommendations contain one to three items', recs.length > 0 && recs.length <= 3, recs);
      record('recommendations do not repeat', new Set(recs).size === recs.length, recs);
      if (gaps.length) {
        record('follow-ups come from gap actions or unsure topics', recs.every(rec => gaps.some(gap => {
          const source = normalize((gap.answer === 'unsure' ? gap.topic : gap.action) || '');
          return source.length > 0 && rec.includes(source);
        })), recs);
      } else {
        record('zero gaps receive routine reminders', recs.every(rec =>
          /\b(routine|regular|keep|continue|maintain|review|recheck|repeat|periodic|remind|schedule)\w*\b/.test(rec)), recs);
        record('zero gaps do not receive gap actions', recs.every(rec => !metadata.some(item =>
          item.action && rec.includes(normalize(item.action)))), recs);
      }
      progress(6);
    };
    const bandFor = sequence => {
      const score = sequence.reduce((sum, answer) => sum + points[answer], 0);
      if (sequence.every(answer => answer === 'unsure')) return 'Needs confirmation';
      if (score >= 10 && !sequence.some(answer => answer === 'no' || answer === 'unsure')) return 'Basics in place';
      return score >= 5 ? 'Some gaps to review' : 'Start with the basics';
    };

    record('there are exactly six questions', questions.length === 6, questions.length);
    record('initial question is the first and only active question', questions.length === 6 &&
      active() === questions[0] && document.querySelectorAll('.q.is-active').length === 1);
    record('initial score is zero out of twelve', readScore() === 0 && text(document.querySelector('#scoreMax')) === '12');
    record('results are initially hidden', !visible(document.querySelector('#scoreTitle')));
    progress(0);
    if (questions.length !== 6 || !active()) return Array.from(findings.values());

    const cases = [
      ['all yes', ['yes', 'yes', 'yes', 'yes', 'yes', 'yes'], 12, 'Basics in place'],
      ['all partly', ['partly', 'partly', 'partly', 'partly', 'partly', 'partly'], 6, 'Some gaps to review'],
      ['all no', ['no', 'no', 'no', 'no', 'no', 'no'], 0, 'Start with the basics'],
      ['all unsure', ['unsure', 'unsure', 'unsure', 'unsure', 'unsure', 'unsure'], 0, 'Needs confirmation'],
      ['score boundary 4', ['partly', 'partly', 'partly', 'partly', 'no', 'no'], 4, 'Start with the basics'],
      ['score boundary 5', ['partly', 'partly', 'partly', 'partly', 'partly', 'no'], 5, 'Some gaps to review'],
      ['score boundary 9', ['yes', 'yes', 'yes', 'partly', 'partly', 'partly'], 9, 'Some gaps to review'],
      ['score boundary 10', ['yes', 'yes', 'yes', 'yes', 'partly', 'partly'], 10, 'Basics in place'],
      ['five yes and one no', ['yes', 'yes', 'yes', 'yes', 'yes', 'no'], 10, 'Some gaps to review'],
      ['five yes and one unsure', ['yes', 'yes', 'yes', 'yes', 'yes', 'unsure'], 10, 'Some gaps to review']
    ];
    for (let i = 0; i < cases.length; i++) {
      const [name, sequence, score, band] = cases[i];
      context = name;
      if (i > 0 && !retake()) return Array.from(findings.values());
      if (!sequence.every(choose)) return Array.from(findings.values());
      result(score, band);
    }

    context = 'Back and edit';
    if (!retake() || !choose('yes') || !choose('no') || !control('Back')) return Array.from(findings.values());
    record('Back returns to the previous question', active() === questions[1]);
    selection(active(), 'no', 1);
    progress(1);
    if (!control('Back')) return Array.from(findings.values());
    record('Back can revisit the first question', active() === questions[0]);
    selection(active(), 'yes', 0);
    progress(0);
    if (!choose('partly')) return Array.from(findings.values());
    selection(active(), null, 1);
    progress(1);
    if (!choose('unsure') || !control('Back')) return Array.from(findings.values());
    record('Back remembers the edited unsure answer', active() === questions[1]);
    selection(active(), 'unsure', 1);
    progress(1);
    if (!control('Back')) return Array.from(findings.values());
    record('Back remembers the edited partly answer', active() === questions[0]);
    selection(active(), 'partly', 0);
    progress(0);
    if (!['partly', 'unsure', 'yes', 'yes', 'yes', 'yes'].every(choose)) return Array.from(findings.values());
    result(9, 'Some gaps to review');
    record('editing no to unsure produces confirmation follow-up',
      Array.from(document.querySelectorAll('#scoreRecs li')).some(el =>
        normalize(text(el)).includes(normalize(metadata[1].topic))));

    // Exercise every ordering, including each position of a single no/unsure.
    // Aggregate identical assertions to keep the CDP result and log compact.
    exhaustive = true;
    let sequencesTested = 0;
    const values = Object.keys(points);
    for (let code = 0; code < 4 ** 6; code++) {
      const sequence = Array.from({ length: 6 }, (_, index) => values[Math.floor(code / (4 ** index)) % 4]);
      context = sequence.join('/');
      if (!retake() || !sequence.every(choose)) break;
      result(sequence.reduce((sum, answer) => sum + points[answer], 0), bandFor(sequence));
      sequencesTested++;
    }
    record('all answer sequences completed synchronously', sequencesTested === 4096, sequencesTested);
    return Array.from(findings.values());
  })()`);
  for (const assertion of quizChecks) check('index.html', 'quiz: ' + assertion.name, assertion.ok, assertion.detail);
  await checkPostureLayout('completed quiz');
  const quizErrors = await js('window.__errs || []');
  check('index.html', 'quiz interactions raise no uncaught JS errors', quizErrors.length === 0, JSON.stringify(quizErrors));

  console.log(`\nScreenshots written to ${TMP}`);
  console.log(`Updated hero screenshot: ${path.join(TMP, 'homepage-updated.png')}`);
  console.log(`Updated posture screenshot: ${path.join(TMP, 'posture-check-updated.png')}`);
  console.log(`\n=========== ${pass} passed, ${fail} failed ===========`);
  if (problems.length) {
    console.log('\nProblems:');
    problems.forEach(p => console.log('  - ' + p));
  }

  process.exitCode = fail ? 1 : 0;
})().catch(e => { console.error('FAILED:', e.message); process.exitCode = 1; }).finally(async () => {
  try {
    if (ws) ws.close();
  } finally {
    if (chrome) chrome.kill();
    await sleep(600);
  }
});
