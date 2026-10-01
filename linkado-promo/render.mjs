// Rendert den Film Frame für Frame mit Headless-Chromium (Playwright) in PNG-Dateien.
//   node render.mjs                         → alle Frames (30 fps) nach out/frames/
//   node render.mjs --times 1.5,21,54.2     → nur diese Zeitpunkte nach out/preview/ (QA-Standbilder)
//   node render.mjs --fps 10 --scale 0.5    → schnelle Vorschau (halbe Auflösung)
//   Optionen: --from 0 --to 60 --workers 4 --out DIR --debug
import { chromium } from 'playwright-core';
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
const opt = (k, d) => { const i = argv.indexOf('--' + k); return i < 0 ? d : (argv[i + 1] === undefined || argv[i + 1].startsWith('--') ? true : argv[i + 1]); };
const tl = JSON.parse(fs.readFileSync(path.join(ROOT, 'timeline.json'), 'utf8'));
const FPS = +opt('fps', tl.meta.fps), SCALE = +opt('scale', 1), WORKERS = +opt('workers', 4);
const FROM = +opt('from', 0), TO = +opt('to', tl.meta.duration), DEBUG = !!opt('debug', false);
const TIMES = opt('times', null);
const OUT = path.resolve(ROOT, opt('out', TIMES ? 'out/preview' : 'out/frames'));
fs.mkdirSync(OUT, { recursive: true });

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp' };
const server = http.createServer((req, res) => {
  const u = decodeURIComponent(req.url.split('?')[0]);
  const f = u === '/timeline.json' ? path.join(ROOT, 'timeline.json') : path.join(ROOT, 'src', u === '/' ? 'index.html' : u);
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end('404'); return; }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
  fs.createReadStream(f).pipe(res);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const url = `http://127.0.0.1:${server.address().port}/index.html${DEBUG ? '?debug' : ''}`;

let jobs;
if (TIMES) jobs = String(TIMES).split(',').map((s) => ({ t: parseFloat(s), file: path.join(OUT, `t_${parseFloat(s).toFixed(2).padStart(6, '0')}.png`) }));
else { jobs = []; for (let i = Math.round(FROM * FPS); i < Math.round(TO * FPS); i++) jobs.push({ t: i / FPS, file: path.join(OUT, String(i).padStart(5, '0') + '.png') }); }

const browser = await chromium.launch({ args: ['--force-color-profile=srgb', '--font-render-hinting=none', '--disable-lcd-text', '--hide-scrollbars', '--allow-file-access-from-files'] });
const t0 = Date.now(); let done = 0; const errors = new Set();
async function worker(id) {
  const ctx = await browser.newContext({ viewport: { width: tl.meta.width, height: tl.meta.height }, deviceScaleFactor: SCALE });
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') { const s = m.text(); if (!errors.has(s)) { errors.add(s); console.log(`  [browser ${m.type()}] ${s}`); } } });
  page.on('pageerror', (e) => { const s = String(e); if (!errors.has(s)) { errors.add(s); console.log('  [pageerror] ' + s); } });
  await page.goto(url, { waitUntil: 'load' });
  await page.waitForFunction('window.__ready === true', null, { timeout: 60000 });
  const cdp = await ctx.newCDPSession(page);                       // schneller als page.screenshot: PNG mit niedriger Kompressionsstufe
  for (let i = id; i < jobs.length; i += WORKERS) {
    const j = jobs[i];
    await page.evaluate((t) => window.renderAt(t), j.t);
    const shot = await cdp.send('Page.captureScreenshot', { format: 'png', optimizeForSpeed: true, fromSurface: true, clip: { x: 0, y: 0, width: tl.meta.width, height: tl.meta.height, scale: SCALE } });
    fs.writeFileSync(j.file, Buffer.from(shot.data, 'base64'));
    done++;
    if (done % 100 === 0 || done === jobs.length) { const s = (Date.now() - t0) / 1000; process.stdout.write(`\r  ${done}/${jobs.length} Frames · ${s.toFixed(0)} s · ${(done / s).toFixed(1)} fps   `); }
  }
  await ctx.close();
}
await Promise.all(Array.from({ length: Math.min(WORKERS, jobs.length) }, (_, i) => worker(i)));
await browser.close(); server.close();
console.log(`\nFertig: ${jobs.length} Bild(er) → ${path.relative(ROOT, OUT)} in ${((Date.now() - t0) / 1000).toFixed(1)} s`);
