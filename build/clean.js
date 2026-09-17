/* ============================================================
   Remove build scratch artifacts from the workspace root.

   Deliberately allowlisted — it only ever touches paths that are
   directly inside the workspace root and match one of the known
   scratch patterns. It will not recurse into anything else.

   Run: node build/clean.js
   ============================================================ */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

// exact filenames to remove
const FILES = [
  '_capture.js',
  '_test.js',
  '_anchor.js',
  '_preview-desktop.png'
];

// filename patterns to remove
const PATTERNS = [
  /^_shot-.*\.png$/,
  /^_cdp-profile\d*$/
];

const targets = [];

for (const entry of fs.readdirSync(ROOT, { withFileTypes: true })) {
  const { name } = entry;
  const full = path.join(ROOT, name);

  // never touch anything that is not directly inside the root
  if (path.dirname(full) !== ROOT) continue;
  // never touch the workspace metadata directory
  if (name.startsWith('.')) continue;

  const isTarget = FILES.includes(name) || PATTERNS.some(re => re.test(name));
  if (!isTarget) continue;

  // only ever remove a directory if it is one of the Chrome profile dirs
  if (entry.isDirectory() && !/^_cdp-profile\d*$/.test(name)) continue;

  let size = 0;
  try {
    if (entry.isDirectory()) {
      const walk = d => {
        for (const e of fs.readdirSync(d, { withFileTypes: true })) {
          const f = path.join(d, e.name);
          if (e.isDirectory()) walk(f);
          else { try { size += fs.statSync(f).size; } catch {} }
        }
      };
      walk(full);
    } else {
      size = fs.statSync(full).size;
    }
  } catch {}

  targets.push({ name, full, isDir: entry.isDirectory(), size });
}

if (!targets.length) {
  console.log('Nothing to clean — no scratch artifacts found.');
  process.exit(0);
}

const totalBytes = targets.reduce((a, t) => a + t.size, 0);
console.log(`Removing ${targets.length} scratch item(s), ${(totalBytes / 1048576).toFixed(1)} MB total:\n`);

let removed = 0, failed = 0;
for (const t of targets) {
  try {
    fs.rmSync(t.full, { recursive: t.isDir, force: true });
    console.log(`  removed  ${t.name.padEnd(26)} ${(t.size / 1024).toFixed(0)} KB${t.isDir ? '  (dir)' : ''}`);
    removed++;
  } catch (e) {
    console.log(`  FAILED   ${t.name}  -> ${e.message}`);
    failed++;
  }
}

// verify
const leftover = fs.readdirSync(ROOT, { withFileTypes: true })
  .filter(e => FILES.includes(e.name) || PATTERNS.some(re => re.test(e.name)))
  .map(e => e.name);

console.log(`\n${removed} removed${failed ? `, ${failed} failed` : ''}.`);
console.log(leftover.length ? `Still present: ${leftover.join(', ')}` : 'Verified: no scratch artifacts remain.');

console.log('\nWorkspace root now contains:');
for (const e of fs.readdirSync(ROOT, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
  console.log(`  ${e.isDirectory() ? '[dir] ' : '      '}${e.name}`);
}
