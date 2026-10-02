// ============================================================
// Act II, Teil 2: 05 Ein stimmiges Gesamtpaket (44–50) · 06 Mehr Zeit fürs Wesentliche (50–58)
//  05: drei Kettenglieder (Oberfläche · Erweiterungen · Betreuung) greifen ineinander – snap 41/42/43, lock 44
//  06: ein Arbeitstag als Zeitleiste: Technik-Reibung schrumpft, Wesentliches wächst; gemeinsam im Dokument.
//      Ab ~53.2 löst sich alles in Knoten auf (Übergabe ans Finale, siehe handoffDots).
// ============================================================
import { avatarHTML } from '../ui.js';

/** Knoten, aus denen das Finale das Netz aufbaut (gleiche Positionen wie die Auflösung hier). */
export function handoffDots(E) {
  const r = E.rng(5), out = [];
  const cols = 14, rows = 8, x0 = 900, x1 = 1810, y0 = 235, y1 = 850;
  const pal = ['#1F2532', '#1F2532', '#8B837A', '#E67E22', '#343D56', '#B8B0A2'];
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    out.push({ x: x0 + (x1 - x0) * (i / (cols - 1)) + r.range(-22, 22), y: y0 + (y1 - y0) * (j / (rows - 1)) + r.range(-22, 22), c: r.pick(pal), r: r.range(4.5, 8.5) });
  }
  return out;
}

export default function register(E) {
  const { h, tf, tw, ease, prog, clamp, lerp, show, rng, icon } = E;
  const K = E.kit;
  const hit = (kind) => E.hits(kind).map((x) => x.t);

  E.style(`
  .a2b-lab { position:absolute; left:0; top:0; width:300px; margin-left:-150px; text-align:center; font:700 27px/1 var(--font-display); text-transform:uppercase; letter-spacing:.02em; color:var(--navy); white-space:nowrap; }
  .a2b-lab small { display:block; margin-top:10px; font:500 19px/1.3 var(--font-body); text-transform:none; letter-spacing:0; color:var(--text-2); }
  .a2b-ico { position:absolute; left:0; top:0; width:84px; height:84px; margin:-42px 0 0 -42px; display:flex; align-items:center; justify-content:center; }
  .a2b-card { position:absolute; left:890px; top:196px; width:920px; height:700px; border-radius:28px; background:#fff; box-shadow:0 2px 6px rgba(31,37,50,.08), 0 36px 80px rgba(31,37,50,.20); }
  .a2b-cap { position:absolute; left:60px; top:34px; display:flex; align-items:center; gap:14px; font:700 20px/1 var(--font-body); letter-spacing:.14em; color:var(--navy); }
  .a2b-hr { position:absolute; top:92px; width:80px; font:600 15px/1 var(--font-body); color:#A19B90; padding-left:6px; }
  .a2b-blk { position:absolute; top:122px; height:112px; border-radius:14px; display:flex; align-items:center; padding:0 14px; font:700 17px/1.15 var(--font-body); letter-spacing:.05em; text-transform:uppercase; overflow:hidden; white-space:nowrap; }
  .a2b-gray { background:repeating-linear-gradient(135deg,#E8E1D3 0 7px,#F3EEE3 7px 14px); color:#8B837A; }
  .a2b-doc { position:absolute; left:60px; top:318px; width:800px; height:320px; border-radius:18px; background:#FBF8F2; border:1.5px solid #E7DFCF; overflow:hidden; }
  .a2b-av { position:absolute; width:46px; height:46px; border-radius:50%; font:800 18px/46px var(--font-display); text-align:center; color:#fff; border:3px solid #FBF8F2; }
  .a2b-flag { position:absolute; height:30px; padding:0 12px 0 10px; border-radius:6px 6px 6px 0; font:700 15px/30px var(--font-body); color:#fff; white-space:nowrap; }
  `);

  /* ======================================================== 05  Gesamtpaket */
  const SHB = E.T('package').start - 44.0;                                                 // Szene 05 ist für den Start bei 44.0 geschrieben
  const SNAP = hit('snap').map((x) => x - SHB).filter((x) => x >= 45 && x <= 47), LOCK = hit('lock')[0] - SHB;     // 45, 46, 47 · 48 (lokal)
  E.scene({
    id: 'package', post: 0.5, shift: SHB, z: 20,
    build(root) {
      const W = 360, H = 200, TH = 34, R = (H - TH) / 2, CY = 540;
      const CX = [1090, 1350, 1610];
      const NAVY = '#1F2532', OR = '#E67E22';
      const defs = h('defs', {},
        h('linearGradient', { id: 'pk-g', x1: 0, y1: 0, x2: 1, y2: 1 }, h('stop', { offset: 0, 'stop-color': NAVY }), h('stop', { offset: 0.55, 'stop-color': NAVY }), h('stop', { offset: 1, 'stop-color': OR })),
        h('linearGradient', { id: 'pk-shine', gradientUnits: 'userSpaceOnUse', x1: 0, y1: 0, x2: 160, y2: 0 }, h('stop', { offset: 0, 'stop-color': '#fff', 'stop-opacity': 0 }), h('stop', { offset: 0.5, 'stop-color': '#fff', 'stop-opacity': 0.85 }), h('stop', { offset: 1, 'stop-color': '#fff', 'stop-opacity': 0 })),
        h('clipPath', { id: 'pk-c0' }, h('rect', { x: CX[1] - W / 2 - 40, y: CY - H / 2 - 30, width: W / 2 + 120, height: H / 2 + 30 })),
        h('clipPath', { id: 'pk-c1' }, h('rect', { x: CX[2] - W / 2 - 40, y: CY - H / 2 - 30, width: W / 2 + 120, height: H / 2 + 30 })));
      const rectFor = (cx, extra) => h('rect', { x: cx - W / 2 + TH / 2, y: CY - H / 2 + TH / 2, width: W - TH, height: H - TH, rx: R, fill: 'none', ...extra });
      const mkLink = (cx, stroke) => { const g = h('g', {}, rectFor(cx, { stroke: '#FAF6EF', 'stroke-width': TH + 20 }), rectFor(cx, { stroke, 'stroke-width': TH })); return g; };
      const links = CX.map((cx, i) => mkLink(cx, ['#1F2532', '#E67E22', 'url(#pk-g)'][i]));
      const over0 = h('g', { 'clip-path': 'url(#pk-c0)' }), over1 = h('g', { 'clip-path': 'url(#pk-c1)' });
      const o0 = mkLink(CX[0], NAVY), o1 = mkLink(CX[1], OR); over0.append(o0); over1.append(o1);
      // Glanz: Maske = Linkformen, darauf wandert ein Lichtband
      const maskG = h('g', { fill: 'none', stroke: '#fff', 'stroke-width': TH }, CX.map((cx) => rectFor(cx, { stroke: '#fff', 'stroke-width': TH })));
      defs.append(h('mask', { id: 'pk-m', maskUnits: 'userSpaceOnUse', x: 0, y: 0, width: 1920, height: 1080 }, maskG));
      const shineRect = h('rect', { x: 0, y: CY - H / 2 - 20, width: 160, height: H + 40, fill: 'url(#pk-shine)', mask: 'url(#pk-m)' });
      const svg = h('svg', { class: 'abs', width: 1920, height: 1080, viewBox: '0 0 1920 1080', style: { left: 0, top: 0 } }, defs, links[0], links[1], links[2], over0, over1, shineRect);
      const glow = h('div', { class: 'abs', style: { left: 1350 - 600, top: CY - 300, width: 1200, height: 600, background: 'radial-gradient(closest-side, rgba(230,126,34,.30), rgba(230,126,34,0))', opacity: 0 } });
      const rings = CX.map((cx, i) => h('div', { class: 'abs', style: { left: (i === 0 ? cx : cx - 130) - 70, top: CY - 70, width: 140, height: 140, borderRadius: '50%', border: `4px solid ${['#1F2532', '#E67E22', '#E67E22'][i]}` } }));
      const icons = [['layout-grid', '#1F2532'], ['puzzle', '#E67E22'], ['life-buoy', '#1F2532']].map(([n, c], i) => h('div', { class: 'a2b-ico', style: { left: CX[i], top: CY }, html: icon(n, 56, c, 2.2) }));
      const labs = [['Oberfläche', 'klar und vertraut'], ['Erweiterungen', 'passende Apps'], ['Betreuung', 'Hilfe in der Cloud']].map(([a, b], i) => h('div', { class: 'a2b-lab', style: { left: CX[i], top: i === 1 ? CY + H / 2 + 54 : CY - H / 2 - 74 } }, a, h('small', { text: b })));
      const grp = h('div', { class: 'abs', style: { inset: 0 } }, glow, svg, ...rings, ...icons, ...labs);
      root.append(grp);
      const head = K.headline(E, root, { num: '05', size: 80, y: 330, lines: ['EIN STIMMIGES', '<em>GESAMTPAKET.</em>'], sub: 'Oberfläche, Erweiterungen und Betreuung greifen ineinander.' });
      return { CX, CY, W, H, links, o0, o1, shineRect, glow, rings, icons, labs, grp, head, svg };
    },
    update(t, s) {
      s.head.update(t, 44.2, 50.0);
      const OFF = [[-760, 0], [720, -70], [760, 90]], tS = SNAP;
      const pos = [];
      s.links.forEach((g, i) => {
        const p = ease.snap(prog(t, tS[i] - 0.6, tS[i]));
        const lockP = tw(t, LOCK, LOCK + 0.35, ease.snap);
        const dx = OFF[i][0] * (1 - p) + (i === 0 ? 16 * lockP : i === 2 ? -16 * lockP : 0), dy = OFF[i][1] * (1 - p) * (1 - p);
        const squash = 1 + 0.05 * Math.sin(Math.PI * clamp((t - tS[i]) / 0.22)) * (t > tS[i] ? 1 : 0) + 0.025 * Math.sin(Math.PI * clamp((t - LOCK) / 0.3)) * (t > LOCK ? 1 : 0);
        const o = clamp((t - (tS[i] - 0.6)) / 0.12);
        const breath = t > LOCK + 0.4 ? 1 + 0.006 * Math.sin((t - LOCK) * 2.4) : 1;
        const tr = `translate(${dx.toFixed(2)} ${dy.toFixed(2)}) translate(${s.CX[i]} ${s.CY}) scale(${(squash * breath).toFixed(4)}) translate(${-s.CX[i]} ${-s.CY})`;
        g.setAttribute('transform', tr); g.style.opacity = o;
        if (i === 0) { s.o0.setAttribute('transform', tr); s.o0.style.opacity = o; }
        if (i === 1) { s.o1.setAttribute('transform', tr); s.o1.style.opacity = o; }
        pos.push(dx);
        // Ring beim Einrasten
        const q = prog(t, tS[i], tS[i] + 0.55), ring = s.rings[i];
        show(ring, q > 0 && q < 1); tf(ring, { s: 0.4 + 1.5 * ease.out3(q), o: 0.7 * (1 - q) });
      });
      // Symbole + Beschriftungen folgen den Gliedern
      s.icons.forEach((el, i) => { const p = tw(t, tS[i] - 0.05, tS[i] + 0.35, ease.ui); tf(el, { x: pos[i], s: 0.7 + 0.3 * p, o: p }); });
      s.labs.forEach((el, i) => { const p = tw(t, tS[i] + 0.05, tS[i] + 0.55, ease.ui); tf(el, { x: pos[i] * 0.2, y: 14 * (1 - p), o: p }); });
      // Lock: Lichtband + Glow
      const sh = prog(t, LOCK + 0.02, LOCK + 0.8);
      show(s.shineRect, sh > 0 && sh < 1); s.shineRect.setAttribute('x', (850 + 1000 * ease.io2(sh)).toFixed(1));
      s.shineRect.parentNode.querySelector('#pk-shine').setAttribute('x1', 0);
      const gl = tw(t, LOCK - 0.05, LOCK + 0.3, ease.out3) * (0.75 + 0.25 * Math.cos(Math.max(0, t - LOCK - 0.3) * 2)); s.glow.style.opacity = t < LOCK - 0.05 ? 0 : gl * 0.9;
      // Ausblenden
      const ex = tw(t, 49.45, 50.0, ease.in2);
      s.grp.style.opacity = 1 - ex; s.grp.style.transform = `translateX(${-60 * ex}px)`;
    },
  });

  /* ======================================================== 06  Mehr Zeit */
  const DOTS = handoffDots(E);
  E.scene({
    id: 'time', z: 20,
    build(root) {
      const card = h('div', { class: 'a2b-card' });
      card.append(h('div', { class: 'a2b-cap' }, h('span', { class: 'flag' }), 'DEIN ARBEITSTAG'));
      for (let i = 0; i < 10; i++) card.append(h('div', { class: 'a2b-hr', style: { left: 60 + i * 80 }, text: String(8 + i).padStart(2, '0') }));
      // Zeitleiste: graue Technik-Blöcke + wesentliche Blöcke (Summe der Breiten = 800)
      const defs = [
        { id: 'a1', g: 1, txt: 'ANMELDEN', w0: 90, w1: 0 }, { id: 'a2', g: 1, txt: 'SUCHEN', w0: 110, w1: 0 }, { id: 'c1', g: 0, txt: 'PROJEKT', w0: 90, w1: 330, bg: '#1F2532', fg: '#fff' },
        { id: 'a3', g: 1, txt: 'TOOL WECHSELN', w0: 150, w1: 0 }, { id: 'a4', g: 1, txt: 'IT FRAGEN', w0: 100, w1: 0 }, { id: 'c2', g: 0, txt: 'AUSTAUSCH', w0: 70, w1: 220, bg: '#E67E22', fg: '#fff' },
        { id: 'a5', g: 1, txt: 'SUCHEN', w0: 120, w1: 0 }, { id: 'c3', g: 0, txt: 'FOKUS', w0: 70, w1: 250, bg: '#343D56', fg: '#fff' },
      ];
      const blocks = defs.map((d) => { const el = h('div', { class: 'a2b-blk ' + (d.g ? 'a2b-gray' : ''), style: d.g ? {} : { background: d.bg, color: d.fg } }, h('span', { text: d.txt })); card.append(el); return { ...d, el }; });
      // Legende
      card.append(h('div', { class: 'abs', style: { left: 60, top: 258, display: 'flex', gap: 34, alignItems: 'center', font: '700 16px/1 var(--font-body)', letterSpacing: '.1em', color: '#6B6F78' } },
        h('span', { style: { display: 'inline-flex', alignItems: 'center', gap: 10 } }, h('i', { class: 'a2b-gray', style: { width: 26, height: 16, borderRadius: 4, display: 'block', border: '1px solid #DDD5C5' } }), 'TECHNIK'),
        h('span', { style: { display: 'inline-flex', alignItems: 'center', gap: 10 } }, h('i', { style: { width: 26, height: 16, borderRadius: 4, display: 'block', background: '#E67E22' } }), 'WESENTLICHES')));
      // gemeinsames Dokument
      const doc = h('div', { class: 'a2b-doc' });
      doc.append(h('div', { class: 'abs', style: { left: 28, top: 22, font: '800 22px/1 var(--font-display)', textTransform: 'uppercase', color: '#1F2532' }, text: 'Projektplan Herbst' }),
        h('div', { class: 'abs', style: { left: 28, top: 56, font: '500 15px/1 var(--font-body)', color: '#8B837A' }, text: 'Gemeinsam bearbeitet · gerade eben' }));
      const lines = [[300, '#E67E22', 'Anna'], [480, '#1F2532', 'Ben'], [380, '#3B6FD4', 'Lena']];
      const lineEls = lines.map(([w, c, nm], i) => {
        const bar = h('div', { class: 'abs', style: { left: 28, top: 108 + i * 62, height: 16, borderRadius: 6, background: '#E3DACA', width: 0 } });
        const bar2 = h('div', { class: 'abs', style: { left: 28, top: 132 + i * 62, height: 12, borderRadius: 5, background: '#EDE6D8', width: 0 } });
        const flag = h('div', { class: 'a2b-flag', style: { background: c, top: 78 + i * 62 }, text: nm });
        const caret = h('div', { class: 'abs', style: { width: 3, height: 30, background: c, top: 101 + i * 62 } });
        doc.append(bar, bar2, caret, flag); return { bar, bar2, flag, caret, w, c };
      });
      const avs = ['anna', 'ben', 'lena'].map((k, i) => { const el = h('div', { class: 'a2b-av', style: { right: 28 + (2 - i) * 38, top: 20, background: 'none', padding: 0 }, html: avatarHTML(k, 40) }); doc.append(el); return el; });
      card.append(doc);
      const dots = DOTS.map((d) => { const el = h('div', { class: 'abs', style: { left: -d.r, top: -d.r, width: d.r * 2, height: d.r * 2, borderRadius: '50%', background: d.c } }); root.append(el); return el; });
      root.append(card);
      card.style.zIndex = 2; dots.forEach((d) => { d.style.zIndex = 3; });
      const head = K.headline(E, root, { num: '06', size: 74, y: 300, lines: ['MEHR ZEIT', 'FÜRS <em>WESENTLICHE.</em>'], sub: 'Weniger mit Technik beschäftigen. Leichter zusammenarbeiten.' });
      return { card, blocks, doc, lineEls, avs, dots, head };
    },
    update(T, s) {
      const t = T - (E.T('time').start - 46.0);         // Zeiten unten gelten für den Start bei 46.0
      // Ruhiger Takt (8 s statt 6 s): jeder Zustand bleibt ≥ 1,3 s stehen – Blöcke erscheinen (46.4), kurz halten, schrumpfen/wachsen (48.0–50.0),
      // halten, Dokument (50.2), Cursor tippen (50.8–52.7), halten, Auflösung in Knoten (53.2) – Übergabe ans Finale bei 54.0
      s.head.update(t, 46.2, 53.4);
      const cin = tw(t, 46.0, 46.8, ease.ui), cout = tw(t, 53.2, 53.7, ease.in2);
      show(s.card, t < 53.75);
      tf(s.card, { x: 80 * (1 - cin), y: 20 * (1 - cin), o: cin * (1 - cout), s: 1 - 0.02 * cout });
      // Zeitleiste: Blöcke erscheinen, dann schrumpfen die grauen
      let x = 60;
      s.blocks.forEach((b, i) => {
        const pin = tw(t, 46.4 + i * 0.09, 46.95 + i * 0.09, ease.ui);
        const st = b.g ? 48.0 + (i % 3) * 0.14 : 48.2;                     // graue schrumpfen gestaffelt, bunte wachsen
        const e = ease.uiInOut(prog(t, st, st + 1.8));
        const w = lerp(b.w0, b.w1, e);
        Object.assign(b.el.style, { left: x + 'px', width: Math.max(0, w - 4) + 'px', opacity: pin * (b.g ? clamp(1 - (e - 0.7) / 0.3) : 1), display: w < 3 ? 'none' : 'flex' });
        b.el.firstChild.style.opacity = b.g ? clamp((w - 40) / 60) : 1;
        x += w;
      });
      // Dokument + Cursor
      const din = tw(t, 50.2, 50.9, ease.ui);
      tf(s.doc, { y: 40 * (1 - din), o: din });
      s.lineEls.forEach((L, i) => {
        const tt = 50.8 + i * 0.4, p = ease.out2(prog(t, tt, tt + 1.1));
        L.bar.style.width = (L.w * p) + 'px'; L.bar2.style.width = (L.w * 0.62 * ease.out2(prog(t, tt + 0.5, tt + 1.4))) + 'px';
        const cx = 28 + L.w * p, vis = t >= tt - 0.1 && t < 53.0;
        show(L.caret, vis); show(L.flag, vis);
        L.caret.style.left = cx + 'px'; L.caret.style.opacity = (Math.floor(t * 2.2 + i) % 2 === 0 || p < 1) ? 1 : 0.15;
        L.flag.style.left = (cx + 6) + 'px';
      });
      s.avs.forEach((a, i) => { const p = tw(t, 50.9 + i * 0.14, 51.3 + i * 0.14, ease.snap); tf(a, { s: 0.4 + 0.6 * p, o: clamp(p * 2) }); });
      // Auflösung in Knoten (Übergabe ans Finale)
      s.dots.forEach((d, i) => {
        const p = tw(t, 53.2 + (i % 7) * 0.025, 53.6, ease.out2), q = tw(t, 53.6, 54.0, ease.in2);
        const dd = DOTS[i], dr = Math.hypot(dd.x - 1350, dd.y - 540);
        const drift = 14 * tw(t, 53.4, 54.0, ease.out2);
        show(d, p > 0 && t < 54.05);
        tf(d, { x: dd.x + ((dd.x - 1350) / (dr + 1)) * drift, y: dd.y + ((dd.y - 540) / (dr + 1)) * drift, s: 0.2 + 0.8 * p, o: p * (1 - q) });
      });
    },
  });
}
