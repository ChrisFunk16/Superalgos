// DOM-Prüfer: sucht Render-Fehler als Zahlen statt per Auge – abgeschnittener Text, Text außerhalb des Bildes, sich überlagernde Texte.
//   node tools/domcheck.mjs [--from 0 --to 76 --step 0.1 --min 0.35]
// Ausgabe: gruppierte Befunde mit Zeitspannen.
import { chromium } from 'playwright-core';
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const argv = process.argv.slice(2);
const opt = (k, d) => { const i = argv.indexOf('--' + k); return i < 0 ? d : argv[i + 1]; };
const tl = JSON.parse(fs.readFileSync(path.join(ROOT, 'timeline.json'), 'utf8'));
const FROM = +opt('from', 0), TO = +opt('to', tl.meta.duration), STEP = +opt('step', 0.1), MINO = +opt('min', 0.35);
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.png': 'image/png', '.jpg': 'image/jpeg' };
const server = http.createServer((req, res) => {
  const u = decodeURIComponent(req.url.split('?')[0]);
  const f = u === '/timeline.json' ? path.join(ROOT, 'timeline.json') : path.join(ROOT, 'src', u === '/' ? 'index.html' : u);
  if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-store' }); fs.createReadStream(f).pipe(res);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const browser = await chromium.launch({ args: ['--force-color-profile=srgb', '--font-render-hinting=none', '--allow-file-access-from-files'] });
const page = await (await browser.newContext({ viewport: { width: 1920, height: 1080 } })).newPage();
page.on('pageerror', (e) => console.log('[pageerror]', String(e)));
await page.goto(`http://127.0.0.1:${server.address().port}/index.html`, { waitUntil: 'load' });
await page.waitForFunction('window.__ready === true', null, { timeout: 60000 });

const probe = (MINO) => {
  const W = 1920, H = 1080, out = [];
  const cache = new Map();
  const info = (el) => {                                   // effektive Deckkraft + Sichtbarkeit (Kette bis zur Wurzel)
    if (cache.has(el)) return cache.get(el);
    let r;
    if (!el || el === document.body || !el.parentElement) r = { o: 1, vis: true };
    else {
      const p = info(el.parentElement), cs = getComputedStyle(el);
      r = { o: p.o * (cs.opacity === '' ? 1 : parseFloat(cs.opacity)), vis: p.vis && cs.display !== 'none' && cs.visibility !== 'hidden' };
    }
    cache.set(el, r); return r;
  };
  const items = [];
  const tw = document.createTreeWalker(document.getElementById('stage'), NodeFilter.SHOW_TEXT);
  let n;
  while ((n = tw.nextNode())) {
    const txt = n.textContent.replace(/\s+/g, ' ').trim(); if (!txt) continue;
    const el = n.parentElement; const inf = info(el);
    if (!inf.vis || inf.o < MINO) continue;
    if (el.closest('svg')) continue;
    const rg = document.createRange(); rg.selectNodeContents(n);
    const rects = [...rg.getClientRects()].filter((q) => q.width > 1 && q.height > 1);
    if (!rects.length) continue;
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    for (const q of rects) { x0 = Math.min(x0, q.left); y0 = Math.min(y0, q.top); x1 = Math.max(x1, q.right); y1 = Math.max(y1, q.bottom); }
    // geklippt durch overflow-Vorfahren?
    let clipped = 0;
    for (let a = el; a && a !== document.body; a = a.parentElement) {
      const cs = getComputedStyle(a);
      if (cs.overflow !== 'visible' || cs.overflowX !== 'visible' || cs.overflowY !== 'visible') {
        const b = a.getBoundingClientRect();
        const ix = Math.max(0, Math.min(x1, b.right) - Math.max(x0, b.left)), iy = Math.max(0, Math.min(y1, b.bottom) - Math.max(y0, b.top));
        const vis = (ix * iy) / Math.max(1, (x1 - x0) * (y1 - y0));
        if (vis < 0.97) { clipped = Math.max(clipped, 1 - vis); }
      }
    }
    items.push({ txt: txt.slice(0, 40), x0, y0, x1, y1, o: inf.o, el, clipped, ui: !!el.closest('[class*="ui-"]') });
  }
  for (const it of items) {
    const offx = Math.max(0, -it.x0, it.x1 - W), offy = Math.max(0, -it.y0, it.y1 - H);
    const w = it.x1 - it.x0, h = it.y1 - it.y0;
    const offFrac = 1 - (Math.max(0, Math.min(it.x1, W) - Math.max(it.x0, 0)) * Math.max(0, Math.min(it.y1, H) - Math.max(it.y0, 0))) / Math.max(1, w * h);
    if (!it.ui && offFrac > 0.05 && it.o > 0.6) out.push({ k: 'außerhalb', a: it.txt, v: Math.round(offFrac * 100) });
    if (!it.ui && it.clipped > 0.08 && it.o > 0.6) out.push({ k: 'geklippt', a: it.txt, v: Math.round(it.clipped * 100) });
  }
  for (let i = 0; i < items.length; i++) for (let j = i + 1; j < items.length; j++) {
    const a = items[i], b = items[j];
    if (a.el.contains(b.el) || b.el.contains(a.el) || a.txt === b.txt) continue;
    if (a.ui && b.ui) continue;
    const ix = Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0), iy = Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0);
    if (ix <= 2 || iy <= 2) continue;
    const ar = Math.min((a.x1 - a.x0) * (a.y1 - a.y0), (b.x1 - b.x0) * (b.y1 - b.y0));
    const f = (ix * iy) / Math.max(1, ar);
    if (f > 0.12 && Math.min(a.o, b.o) > 0.45) out.push({ k: 'Überlagerung', a: a.txt, b: b.txt, v: Math.round(f * 100), o: +Math.min(a.o, b.o).toFixed(2) });
  }
  return out;
};

const groups = new Map();
const N = Math.round((TO - FROM) / STEP);
for (let i = 0; i <= N; i++) {
  const t = +(FROM + i * STEP).toFixed(3);
  await page.evaluate((t) => window.renderAt(t), t);
  const res = await page.evaluate(probe, MINO);
  for (const r of res) {
    const key = [r.k, r.a, r.b || ''].join(' | ');
    let g = groups.get(key); if (!g) { g = { r, spans: [], max: 0 }; groups.set(key, g); }
    const last = g.spans[g.spans.length - 1];
    if (last && t - last[1] <= STEP * 1.01) last[1] = t; else g.spans.push([t, t]);
    g.max = Math.max(g.max, r.v);
  }
}
const rows = [...groups.values()].sort((a, b) => a.spans[0][0] - b.spans[0][0]);
for (const g of rows) console.log(`${g.r.k.padEnd(12)} max ${String(g.max).padStart(3)}%  ${g.spans.map((s) => s[0].toFixed(1) + '–' + s[1].toFixed(1)).join(', ')}   «${g.r.a}»${g.r.b ? ' ↔ «' + g.r.b + '»' : ''}`);
console.log(`\n${rows.length} Befund-Gruppen (${N + 1} Zeitpunkte)`);
await browser.close(); server.close();
