// Focused test for the insights category filter.
const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const CHROME = 'C:/Users/Asus/.agent-browser/browsers/chrome-153.0.8010.36/chrome.exe';
const ROOT = 'C:/Users/Asus/WorkBuddy AI/2026-09-13-13-44-46';
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'pbsec-filter-'));
const PORT = 9337;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const url = 'file:///' + path.join(ROOT, 'insights.html').replace(/\\/g, '/').replace(/ /g, '%20');

let pass = 0, fail = 0;
const check = (n, c, e) => { c ? (pass++, console.log('  PASS  ' + n)) : (fail++, console.log('  FAIL  ' + n + (e !== undefined ? ' -> ' + e : ''))); };

(async () => {
  const chrome = spawn(CHROME, [
    '--headless=new', '--disable-gpu', '--no-sandbox', '--hide-scrollbars', '--no-first-run',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${path.join(TMP, 'profile')}`,
    '--window-size=1400,950', 'about:blank'
  ], { stdio: 'ignore' });

  let up = null;
  for (let i = 0; i < 60; i++) { try { up = await (await fetch(`http://127.0.0.1:${PORT}/json/version`)).json(); break; } catch { await sleep(400); } }
  if (!up) { console.error('no debugger'); chrome.kill(); process.exit(1); }

  const t = await (await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, { method: 'PUT' })).json();
  const ws = new WebSocket(t.webSocketDebuggerUrl);
  await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
  let id = 0; const p = new Map(); const ev = [];
  ws.onmessage = e => {
    const m = JSON.parse(e.data);
    if (m.id && p.has(m.id)) { const { resolve, reject } = p.get(m.id); p.delete(m.id); m.error ? reject(new Error(JSON.stringify(m.error))) : resolve(m.result); }
    else if (m.method) ev.push(m.method);
  };
  const send = (method, params = {}) => new Promise((resolve, reject) => { const i = ++id; p.set(i, { resolve, reject }); ws.send(JSON.stringify({ id: i, method, params })); });
  const js = async x => {
    const r = await send('Runtime.evaluate', { expression: x, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.text);
    return r.result.value;
  };

  await send('Page.enable'); await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 1400, height: 950, deviceScaleFactor: 1, mobile: false });
  await send('Page.addScriptToEvaluateOnNewDocument', { source: 'window.__errs=[];window.addEventListener("error",e=>window.__errs.push(String(e.message)));' });
  await send('Page.navigate', { url });
  for (let i = 0; i < 100 && !ev.includes('Page.loadEventFired'); i++) await sleep(120);
  await sleep(1200);

  const total = await js('document.querySelectorAll(".insight-card").length');
  console.log(`  ${total} insight cards on the page\n`);
  check('six articles listed', total === 6, total);

  const filters = JSON.parse(await js(`JSON.stringify([...document.querySelectorAll('#insightFilter [data-filter]')].map(b => b.getAttribute('data-filter')))`));
  check('seven filter buttons (all + six topics)', filters.length === 7, JSON.stringify(filters));

  const visible = async () => js('[...document.querySelectorAll(".insight-card")].filter(c => !c.hidden).length');
  check('all visible initially', (await visible()) === 6, await visible());

  // exercise every topic filter
  for (const key of filters.filter(f => f !== 'all')) {
    await js(`document.querySelector('#insightFilter [data-filter="${key}"]').click()`);
    await sleep(220);
    const shown = await visible();
    const labels = JSON.parse(await js(`JSON.stringify([...document.querySelectorAll('.insight-card')].filter(c=>!c.hidden).map(c=>c.getAttribute('data-category')))`));
    check(`filter "${key}" shows only ${key} articles`, shown >= 1 && labels.every(l => l === key), `shown=${shown} labels=${JSON.stringify(labels)}`);

    const active = await js(`document.querySelector('#insightFilter .filter-btn.is-active').getAttribute('data-filter')`);
    check(`filter "${key}" marked active`, active === key, active);
    const pressed = await js(`document.querySelector('#insightFilter [data-filter="${key}"]').getAttribute('aria-pressed')`);
    check(`filter "${key}" sets aria-pressed`, pressed === 'true', pressed);
  }

  // back to all
  await js(`document.querySelector('#insightFilter [data-filter="all"]').click()`);
  await sleep(220);
  check('"All" restores every article', (await visible()) === 6, await visible());
  check('empty-state message hidden while articles show', await js('document.getElementById("insightEmpty").hidden'));

  check('no runtime errors', (await js('JSON.stringify(window.__errs||[])')) === '[]', await js('JSON.stringify(window.__errs||[])'));
  check('no horizontal overflow @390 after filtering', await (async () => {
    await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
    await sleep(400);
    return (await js('document.documentElement.scrollWidth - document.documentElement.clientWidth')) <= 1;
  })());

  console.log(`\n=========== ${pass} passed, ${fail} failed ===========`);
  ws.close(); chrome.kill(); await sleep(500);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('FAILED:', e.message); process.exit(1); });
