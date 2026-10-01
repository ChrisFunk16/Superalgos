// ============================================================
// Act II – Klarheit (20–54 s): Hintergrund + Lichtflut, Overlay (Sneak Peek + Faden),
// und die vier Oberflächen-Szenen 01–04 in EINEM durchgehenden Linkado-Fenster:
//   01 Nextcloud als Basis, Linkado als Benutzererlebnis   (20–24)
//   02 Mehr Übersicht im Arbeitsalltag                      (24–28)
//   03 Passende Werkzeuge an einem Ort (Appshop)            (28–34)
//   04 Hilfe direkt in der Cloud                            (34–40)
// Kamera-Zooms führen den Blick; Aktionen landen auf den hits der timeline.json.
// ============================================================
import { buildUI, LAY } from '../ui.js';

export const THREAD_Y = 700;   // Höhe des orangenen Fadens in der Pause (Act I) – hier übernimmt er

export default function register(E) {
  const { h, tf, tw, ease, prog, clamp, lerp, show } = E;
  const K = E.kit;

  const mixHex = (a, b, p) => {
    const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
    const ch = (sh) => Math.round(((pa >> sh) & 255) * (1 - p) + ((pb >> sh) & 255) * p);
    return `rgb(${ch(16)},${ch(8)},${ch(0)})`;
  };

  /* ---------------------------------------------------------------- Hintergrund + Lichtflut */
  E.scene({
    id: 'a2-bg', start: 20, end: 54, z: 10,
    build(root) {
      const flood = h('div', { class: 'abs', style: { inset: 0, background: 'var(--cream)' } });
      // Drop-Schlag bei 20.0: Lichtblitz, zwei Druckwellen und ein Funkenkranz aus der Bildmitte (rein dekorativ, Marken-Orange/Navy/Creme)
      const mkRing = (col, w, z) => h('div', { class: 'abs', style: { left: 960, top: 540, borderRadius: '50%', border: `${w}px solid ${col}`, zIndex: z } });
      const ring = mkRing('#E67E22', 12, 3), ring2 = mkRing('#FFFFFF', 7, 4);
      const r = E.rng(5);
      const dots = Array.from({ length: 34 }, (_, k) => {
        const a = (k / 34) * Math.PI * 2 + r.range(-0.1, 0.1), d0 = r.range(120, 260), d1 = r.range(640, 1280), sz = r.range(9, 26);
        const el = h('div', { class: 'abs', style: { left: 960 - sz / 2, top: 540 - sz / 2, width: sz, height: sz, borderRadius: k % 3 === 0 ? '3px' : '50%', background: ['#E67E22', '#E67E22', '#1F2532', '#F7DDBF'][k % 4], zIndex: 5 } });
        root.append(el); return { el, a, d0, d1, sz };
      });
      const flash = h('div', { class: 'abs', style: { inset: 0, background: '#fff', zIndex: 6, opacity: 0 } });
      root.append(flood, ring, ring2, flash);
      return { flood, ring, ring2, dots, flash };
    },
    update(t, s) {
      const p = tw(t, 20.0, 20.6, ease.out4);
      s.flood.style.clipPath = p >= 1 ? 'none' : `circle(${(1500 * p).toFixed(1)}px at 50% 50%)`;
      const a = t - 20.0;
      const ringAt = (el, t0, dur, R1) => { const q = tw(a, t0, t0 + dur, ease.out4), R = 40 + R1 * q; show(el, a >= t0 && a < t0 + dur + 0.02); Object.assign(el.style, { width: 2 * R + 'px', height: 2 * R + 'px', marginLeft: -R + 'px', marginTop: -R + 'px', opacity: (1 - tw(a, t0 + 0.2 * dur, t0 + dur, ease.in2)).toFixed(3) }); };
      ringAt(s.ring, 0.0, 0.9, 1500); ringAt(s.ring2, 0.07, 0.8, 1250);
      s.dots.forEach((d) => { const q = ease.out4(prog(a, 0, 1.0)), dist = lerp(d.d0, d.d1, q); show(d.el, a >= 0 && a < 1.05); tf(d.el, { x: Math.cos(d.a) * dist, y: Math.sin(d.a) * dist, s: 1 - 0.55 * q, o: 1 - tw(a, 0.5, 1.0, ease.in2) }); });
      show(s.flash, a >= 0 && a < 0.45); s.flash.style.opacity = (0.9 * (1 - tw(a, 0.0, 0.32, ease.out3))).toFixed(3);
    },
  });

  /* ---------------------------------------------------------------- Overlay: Sneak Peek + Faden */
  const NODE_T = [20.25, 24.0, 28.0, 34.0, 40.0, 46.0, 54.0];
  const NODE_X = (i) => 110 + i * (1700 / 6);       // 110 … 1810 (Index 6 = Ziel: Linkado)
  const BAR_Y = 1044;
  const ovOut0 = (t) => 1 - tw(t, 54.0, 54.7);
  const progressX = (t) => {
    if (t < NODE_T[0]) return NODE_X(0);
    for (let i = 0; i < 6; i++) if (t < NODE_T[i + 1]) return lerp(NODE_X(i), NODE_X(i + 1), ease.io2(prog(t, NODE_T[i] + 0.35, NODE_T[i + 1] - 0.1)));
    return NODE_X(6);
  };
  E.scene({
    id: 'a2-ov', start: 20, end: 54.8, z: 45,
    build(root) {
      const fade = h('div', { class: 'abs', style: { left: 0, right: 0, bottom: 0, height: 120, background: 'linear-gradient(to top, var(--cream) 55%, rgba(250,246,239,0))' } });
      const pill = h('div', { class: 'abs', style: { left: 110, top: 54, display: 'flex', alignItems: 'center', gap: 14, padding: '11px 26px 11px 20px', borderRadius: 999, background: 'rgba(31,37,50,.07)' } },
        h('span', { class: 'flag' }), h('span', { text: 'SNEAK PEEK', style: { font: '700 21px/1 var(--font-body)', letterSpacing: '.15em', color: 'var(--navy)' } }));
      const track = h('div', { class: 'abs', style: { left: 110, top: BAR_Y - 1.5, width: 1700, height: 3, background: 'rgba(31,37,50,.13)', borderRadius: 2 } });
      const fill = h('div', { class: 'abs', style: { height: 4, background: 'var(--orange)', borderRadius: 2 } });
      const head = h('span', { class: 'flag abs', style: { width: 28, height: 14 } });
      const nodes = Array.from({ length: 6 }, (_, i) => h('div', { class: 'abs', style: { left: NODE_X(i) - 10, top: BAR_Y - 10, width: 20, height: 20, borderRadius: '50%', border: '3px solid rgba(31,37,50,.30)', background: 'var(--cream)' } }));
      const goal = h('div', { class: 'abs', style: { left: NODE_X(6) - 17, top: BAR_Y - 17, width: 34, height: 34, borderRadius: 9, overflow: 'hidden' }, html: E.iconSVG({}) });
      root.append(fade, track, ...nodes, goal, fill, head, pill);
      return { fade, pill, track, fill, head, nodes, goal };
    },
    update(t, s) {
      const pp = tw(t, 20.75, 21.35, ease.ui); tf(s.pill, { y: -18 * (1 - pp), o: pp });
      const e = ease.uiInOut(prog(t, 20.0, 21.0));
      const L = progressX(t);
      const y = lerp(THREAD_Y, BAR_Y, e), x0 = lerp(0, 110, e), x1 = lerp(1860, L, e);
      Object.assign(s.fill.style, { left: x0 + 'px', top: (y - 2) + 'px', width: Math.max(0, x1 - x0) + 'px', opacity: ovOut0(t) });
      Object.assign(s.head.style, { left: (x1 - 2) + 'px', top: (y - 7) + 'px', opacity: t < 53.9 ? 1 : 1 - tw(t, 53.9, 54.25) });
      const ovOut = 1 - tw(t, 54.0, 54.7);
      s.track.style.opacity = e * ovOut; s.fade.style.opacity = e * (1 - tw(t, 52.6, 53.2));
      s.nodes.forEach((n, i) => {
        const a = t - NODE_T[i], on = a >= 0;
        const pop = on ? 1 + 0.5 * Math.sin(Math.PI * clamp(a / 0.5)) * (1 - clamp(a / 0.5) * 0.4) : 1;
        n.style.background = on ? 'var(--orange)' : 'var(--cream)';
        n.style.borderColor = on ? 'var(--orange)' : 'rgba(31,37,50,.30)';
        n.style.opacity = e * (1 - tw(t, 53.6, 54.4)); n.style.transform = `scale(${pop})`;
      });
      s.goal.style.opacity = e * (1 - tw(t, 54.2, 54.7)); s.goal.style.transform = `scale(${1 + 0.12 * Math.sin(t * 3)})`;
    },
  });


  /* ---------------------------------------------------------------- Das Linkado-Fenster: 01 – 04 */
  const POSE = {
    full:   { s: 0.70, px: 872, py: 214 },
    search: { s: 0.95, px: 868, py: 116 },              // Menü-Pose: großes Menü links im Fenster
    shop:   { s: 0.86, px: 862, py: 118 },
    help:   { s: 0.86, px: 862, py: 104 },
    away:   { s: 0.52, px: 1060, py: 300 },
  };
  const POSES = [[20, 'full'], [23.2, 'full'], [24.2, 'search'], [27.4, 'search'], [28.3, 'shop'], [33.4, 'shop'], [34.3, 'help'], [39.4, 'help'], [40.8, 'away']];
  function camAt(t) {
    let a = POSES[0], b = POSES[0];
    for (let i = 0; i < POSES.length - 1; i++) { if (t >= POSES[i][0]) { a = POSES[i]; b = POSES[i + 1]; } }
    if (t >= POSES[POSES.length - 1][0]) { a = b = POSES[POSES.length - 1]; }
    const A = POSE[a[1]], B = POSE[b[1]];
    const p = a === b ? 0 : ease.uiInOut(prog(t, a[0], b[0]));
    const drift = 1 + 0.012 * clamp((t - a[0]) / 4);        // langsamer Schub während des Haltens
    return { s: A.s * Math.pow(B.s / A.s, p) * (a === b || A === B ? drift : 1), px: lerp(A.px, B.px, p), py: lerp(A.py, B.py, p) };
  }

  // Cursor-Weg im Fensterraum (Sek., x, y). Klicks: siehe CLICKS (stehen auch als hits in timeline.json)
  const CLICKS = [25.0, 30.0, 31.5, 33.2, 34.0, 35.5, 37.85];
  const B0 = LAY.apps.btn(0), B1 = LAY.apps.btn(1), TG = LAY.apps.toggle(3), SUP = LAY.rail.support, SIN = LAY.support.input;
  const CUR = [
    [24.40, 980, 640], [24.98, LAY.menu.grid[0] + 4, LAY.menu.grid[1] + 4], [25.50, LAY.menu.grid[0] + 4, LAY.menu.grid[1] + 4], [25.95, 210, 95], [26.75, 210, 95], [27.05, LAY.menu.row(0)[0] + 20, LAY.menu.row(0)[1]], [27.55, LAY.menu.row(0)[0] + 20, LAY.menu.row(0)[1]], [28.30, 760, 560],
    [29.95, B0[0], B0[1]], [30.45, B0[0], B0[1]], [31.45, B1[0], B1[1]], [31.95, B1[0], B1[1]],
    [32.40, 900, 520], [33.15, TG[0], TG[1]], [33.35, TG[0], TG[1]],
    [33.98, SUP[0], SUP[1]], [34.30, SUP[0], SUP[1]],
    [35.45, SIN[0] - 80, SIN[1]], [35.80, SIN[0] - 80, SIN[1]], [37.00, 700, 560],
    [37.80, 1156, 126], [38.30, 1156, 126], [38.80, 1190, 170],
  ];

  // App-Flüge (Hinzufügen-Taste → Seitenleiste); Rail-Positionen 6 und 7 (unter Talk)
  const FLY = [
    { t0: 30.0, from: B0, to: [LAY.rail.x, LAY.rail.y(6)], app: 0 },
    { t0: 31.5, from: B1, to: [LAY.rail.x, LAY.rail.y(7)], app: 1 },
  ];
  const rowOn = (r, v) => { r.tg.style.background = mixHex('#CBC7BF', '#E67E22', v); r.tg.firstChild.style.left = (3 + 22 * v) + 'px'; r.lbl.textContent = v > 0.5 ? 'Aktiv' : 'Aus'; };

  E.scene({
    id: 'a2-ui', start: 20, end: 41, z: 20,
    build(root) {
      const ui = buildUI(E);
      const outer = h('div', { class: 'abs', style: { inset: 0 } });
      const cam = h('div', { class: 'abs', style: { left: 0, top: 0, width: 1480, height: 900, transformOrigin: '0 0' } });
      // Rohfassung = „Nextcloud-Standard“
      const raw = ui.window({ raw: true }); raw.setActive('Startseite'); raw.main.append(ui.home().el);
      // Linkado
      const win = ui.window(); win.setActive('Startseite');
      const dash = ui.home(), shop = ui.apps(), sup = ui.support();
      win.main.append(dash.el, shop.el, sup.el);
      const menu = ui.menu('Angebot'); const dim = h('div', { class: 'ui-dim', style: { display: 'none' } }); win.main.append(dim, menu.el);
      const gridTile = win.top.querySelector('.ui-gridtile');
      const rDeck = win.mk('Deck', 'deck', 'Deck', 8 + 6 * 77);
      const rFor = win.mk('Formulare', 'forms', 'Formulare', 8 + 7 * 77);
      // Welle (Nextcloud → Linkado): Glanzband + orange Kante, nur innerhalb des Fensters sichtbar
      const bandWrap = h('div', { class: 'abs', style: { left: 0, top: 0, width: 1480, height: 900, borderRadius: 20, overflow: 'hidden', pointerEvents: 'none', zIndex: 20 } });
      const shine = h('div', { class: 'abs', style: { top: 0, width: 150, height: 900, background: 'linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,.55))', transform: 'skewX(-18.43deg)' } });
      const edge = h('div', { class: 'abs', style: { top: 0, width: 6, height: 900, background: 'var(--orange)', boxShadow: '0 0 26px rgba(230,126,34,.7)', transform: 'skewX(-18.43deg)' } });
      bandWrap.append(shine, edge); cam.append(raw.el, win.el, bandWrap);
      // Flieger + Spur
      const trailSvg = h('svg', { class: 'abs', width: 1480, height: 900, viewBox: '0 0 1480 900', style: { left: 0, top: 0, zIndex: 55, overflow: 'visible' } }, h('path', { fill: 'none', stroke: '#E67E22', 'stroke-width': 4, 'stroke-linecap': 'round' }));
      const flyer = h('div', { class: 'abs', style: { width: 68, height: 68, borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60, boxShadow: '0 16px 34px rgba(31,37,50,.35)' } });
      const cur = ui.cursor();
      cam.append(trailSvg, flyer, cur.rip, cur.el);
      outer.append(cam); root.append(outer);

      // Beschriftung der Rohfassung (Bildschirmraum)
      const capStyle = { position: 'absolute', left: 874, top: 150, display: 'flex', alignItems: 'center', gap: 14, font: '700 24px/1 var(--font-body)', letterSpacing: '.13em' };
      const capRaw = h('div', { style: { ...capStyle, color: 'var(--warm-gray)' } }, h('span', { class: 'flag', style: { background: '#B0B7C2' } }), 'NEXTCLOUD · BASIS');
      const capLk = h('div', { style: { ...capStyle, color: 'var(--navy)' } }, h('span', { class: 'flag' }), h('span', { html: 'LINKADO · <span style="color:var(--orange-deep)">ERLEBNIS</span>' }));
      root.append(capRaw, capLk);

      const heads = [
        K.headline(E, root, { num: '01', size: 74, y: 258, lines: ['NEXTCLOUD', 'ALS BASIS.', '<em>LINKADO</em> ALS', 'BENUTZERERLEBNIS.'], muted: [true, true, false, false], delays: [0, 0, 1.3, 1.3], sub: 'Technik verständlich und zugänglich machen.', subDelay: 1.3 }),
        K.headline(E, root, { num: '02', size: 80, y: 330, lines: ['MEHR <em>ÜBERSICHT</em>', 'IM ARBEITSALLTAG.'], sub: 'Anwendungen und wichtige Funktionen leichter finden.' }),
        K.headline(E, root, { num: '03', size: 80, y: 290, lines: ['PASSENDE', '<em>WERKZEUGE</em>', 'AN EINEM ORT.'], sub: 'Apps über den Linkado-Appshop auswählen und verwalten.' }),
        K.headline(E, root, { num: '04', size: 80, y: 330, lines: ['HILFE DIREKT', 'IN DER <em>CLOUD.</em>'], sub: 'Anleitungen und Support dort, wo Fragen entstehen.' }),
      ];
      return { ui, outer, cam, raw, win, dash, shop, sup, menu, dim, gridTile, rDeck, rFor, rails: [rDeck, rFor], bandWrap, shine, edge, trailSvg, flyer, cur, capRaw, capLk, heads, trailLen: {}, activeRail: null, tg: { 0: 0, 1: 0, 3: 0 } };
    },

    update(t, s) {
      const { cam, outer, raw, win, dash, shop, sup, menu, dim, gridTile, cur } = s;

      /* ---- Kamera + Fenster-Auftritt/Abgang ---- */
      const c = camAt(t);
      cam.style.transform = `translate(${c.px.toFixed(2)}px,${c.py.toFixed(2)}px) scale(${c.s.toFixed(4)})`;
      const wi = tw(t, 20.25, 20.95, ease.ui), wo = tw(t, 39.9, 40.8, ease.in3);
      outer.style.opacity = wi * (1 - wo);
      const wsc = 0.94 + 0.06 * tw(t, 20.2, 21.0, ease.outBack);          // Fenster „landet“ nach dem Drop-Schlag mit leichtem Nachfedern
      outer.style.transform = `translateY(${(36 * (1 - wi) - 30 * wo).toFixed(2)}px) scale(${wsc.toFixed(4)})`;

      /* ---- 01: Rohfassung → Linkado (Welle 21.0–22.2) ---- */
      const we = ease.uiInOut(prog(t, 21.0, 22.2));
      const xf = lerp(-260, 1480 + 260, we), sl = 150;
      const waving = t >= 21.0 && t < 22.25;
      show(raw.el, t < 22.3);
      win.el.style.clipPath = t < 21.0 ? 'polygon(0 0,0 0,0 0)' : waving ? `polygon(-60px -60px, ${(xf + sl).toFixed(1)}px -60px, ${(xf - sl).toFixed(1)}px 960px, -60px 960px)` : 'none';
      show(s.bandWrap, waving);
      s.shine.style.left = (xf - 150).toFixed(1) + 'px'; s.edge.style.left = (xf - 3).toFixed(1) + 'px';
      tf(s.capRaw, { o: tw(t, 20.5, 20.9, ease.out2) * (1 - tw(t, 21.15, 21.5, ease.out2)) * (1 - tw(t, 23.0, 23.4)), y: 10 * (1 - tw(t, 20.5, 20.9, ease.ui)) });
      tf(s.capLk, { o: tw(t, 21.45, 21.85, ease.out2) * (1 - tw(t, 23.0, 23.4)), y: 10 * (1 - tw(t, 21.45, 21.85, ease.ui)) });

      /* ---- Überschriften ---- */
      s.heads[0].update(t, 20.25, 24.0); s.heads[1].update(t, 24.0, 28.0); s.heads[2].update(t, 28.0, 34.0); s.heads[3].update(t, 34.0, 40.0);

      /* ---- 02: Übersicht – Widgets rasten ein, Suche mit Assistent ---- */
      const loose = tw(t, 23.2, 23.95, ease.out3) * (1 - ease.snap(prog(t, 24.0, 24.55)));
      tf(dash.hero, { x: -14 * loose, y: 10 * loose, r: -1.0 * loose }); tf(dash.day, { x: 16 * loose, y: -8 * loose, r: 1.0 * loose });
      tf(dash.nextCard, { x: -12 * loose, y: 14 * loose }); tf(dash.news, { x: 14 * loose, y: 10 * loose });
      dash.fcards.forEach((f, i) => tf(f, { y: (10 + 4 * i) * loose }));
      /* Das große Menü öffnet sich über dem Raster-Symbol (25.0), die Suche „Was möchten Sie tun?“ findet alles an einem Ort (Treffer 26.4), das Menü schließt (27.55–28.0) */
      const mo = tw(t, 25.02, 25.55, ease.ui), mc = tw(t, 27.55, 28.0, ease.in2), mv = mo * (1 - mc);
      show(menu.el, t >= 25.0 && t < 28.05); tf(menu.el, { x: -352 * (1 - mv) });
      show(dim, t >= 25.0 && t < 28.05); dim.style.opacity = (mv).toFixed(3);
      gridTile.classList.toggle('on', t >= 25.0 && t < 27.9);
      const typed = Math.floor(clamp((t - 25.7) / 0.7) * 7 + 0.001);
      menu.input.textContent = t < 25.68 ? 'Was möchten Sie tun?' : 'Angebot'.slice(0, typed);
      menu.input.style.color = t < 25.68 ? '' : '#171A22';
      menu.caret.style.display = (t >= 25.1 && t < 27.4 && (t < 26.5 || Math.floor(t * 2) % 2 === 0)) ? 'inline-block' : 'none';
      menu.search.style.boxShadow = (t >= 25.1 && t < 27.5) ? '0 0 0 3px rgba(255,255,255,.9)' : '';
      const rp = tw(t, 26.4, 26.8, ease.ui);
      show(menu.res, rp > 0.001); menu.res.style.opacity = rp; tf(menu.scroll, { o: 1 - rp });
      menu.rows.forEach((r, i) => { const p = tw(t, 26.45 + i * 0.08, 26.9 + i * 0.08, ease.ui); tf(r, { y: 10 * (1 - p), o: p }); });

      /* ---- Ansichtswechsel Startseite → Apps und Pakete → Support ---- */
      const act = t < 28.0 ? 'Startseite' : t < 34.0 ? '' : 'Support';
      if (act !== s.activeRail) { win.setActive(act); s.activeRail = act; }
      show(dash.el, t < 28.5); tf(dash.el, { o: 1 - tw(t, 28.0, 28.45, ease.out2), s: 1 - 0.015 * tw(t, 28.0, 28.45) });
      show(shop.el, t >= 27.98 && t < 34.6);
      shop.el.style.opacity = tw(t, 28.0, 28.3, ease.out2) * (1 - tw(t, 34.0, 34.5, ease.out2));
      const hp = (a, d = 0.6) => tw(t, 28.1 + a, 28.1 + a + d, ease.ui);
      tf(shop.menu, { x: -18 * (1 - hp(0)), o: hp(0) });
      tf(shop.head, { y: 22 * (1 - hp(0.05)), o: hp(0.05) }); tf(shop.stat, { y: 16 * (1 - hp(0.15)), o: hp(0.15) });
      tf(shop.search, { y: 16 * (1 - hp(0.2)), o: hp(0.2) }); tf(shop.chips, { y: 16 * (1 - hp(0.25)), o: hp(0.25) });
      shop.cards.forEach((cd, i) => { const p = tw(t, 28.3 + i * 0.09, 28.9 + i * 0.09, ease.ui); tf(cd.el, { y: 44 * (1 - p), o: p }); });
      const sc = ease.uiInOut(prog(t, 32.4, 33.05));                       // Scroll zu „Pakete“
      shop.scroll.style.transform = `translateY(${(-LAY.apps.scroll * sc).toFixed(2)}px)`;
      shop.tg = shop.tg || {};
      const tgv = [tw(t, 30.65, 30.95, ease.out3), tw(t, 32.15, 32.45, ease.out3), 0, tw(t, 33.2, 33.45, ease.out3), 0];
      shop.rows.forEach((r, i) => rowOn(r, r.on ? 1 : tgv[i]));
      shop.nApps.textContent = String(59 + (t >= 30.65 ? 1 : 0) + (t >= 32.15 ? 1 : 0));

      /* ---- 03: Apps hinzufügen – Icon fliegt in die Seitenleiste ---- */
      FLY.forEach((f, k) => {
        const card = shop.cards[f.app], rail = s.rails[k];
        const q = t - f.t0;
        const done = q >= 0.24;
        show(card.add, !done); show(card.more, done);
        card.badge.className = 'ui-badge' + (done ? '' : ' n'); card.badge.firstChild.textContent = done ? 'Aktiv' : 'Verfügbar';
        tf(card.add, { s: 1 - 0.06 * Math.sin(Math.PI * clamp(q / 0.24)) });
        // Seitenleisten-Eintrag
        const lp = tw(q, 0.62, 1.1, ease.outBack);
        tf(rail, { s: 0.55 + 0.45 * lp, o: clamp(lp * 1.8) });
        const glow = 1 - tw(q, 0.7, 1.7);
        rail.style.background = q > 0.62 ? `rgba(255,255,255,${(0.16 * glow).toFixed(3)})` : '';
      });
      const act_f = FLY.find((f) => t >= f.t0 && t < f.t0 + 1.4);
      const path = s.trailSvg.firstChild;
      if (act_f && t >= act_f.t0 + 0.04) {
        const q = t - act_f.t0, p = ease.uiInOut(prog(q, 0.06, 0.78));
        const [x0, y0] = act_f.from, [x2, y2] = act_f.to, cx = (x0 + x2) / 2 + 40, cy = (y0 + y2) / 2 - 90;
        const bx = (1 - p) * (1 - p) * x0 + 2 * (1 - p) * p * cx + p * p * x2, by = (1 - p) * (1 - p) * y0 + 2 * (1 - p) * p * cy + p * p * y2;
        const ap = shop.cards[act_f.app];
        s.flyer.style.display = q < 0.8 ? 'flex' : 'none';
        s.flyer.style.background = ap.col; if (s.flyer.dataset.k !== String(act_f.app)) { s.flyer.innerHTML = E.icon(ap.ico, 34, '#fff', 2); s.flyer.dataset.k = String(act_f.app); }
        tf(s.flyer, { x: bx - 34, y: by - 34, s: 1 - 0.28 * p });
        path.setAttribute('d', `M${x0} ${y0} Q${cx} ${cy} ${x2} ${y2}`);
        const len = s.trailLen[act_f.app] || (s.trailLen[act_f.app] = path.getTotalLength());
        path.setAttribute('stroke-dasharray', `${(len * p).toFixed(1)} ${len.toFixed(1)}`);
        path.setAttribute('stroke-opacity', (1 - tw(q, 0.8, 1.35)).toFixed(3));
        path.style.display = '';
      } else { s.flyer.style.display = 'none'; path.style.display = 'none'; }

      /* ---- 04: Support – Frage → Antwort des Assistenten → Anfrage ---- */
      show(sup.el, t >= 33.98 && t < 40.9);
      sup.el.style.opacity = tw(t, 34.0, 34.4, ease.out2);
      const sp = (a, d = 0.55) => tw(t, 34.1 + a, 34.1 + a + d, ease.ui);
      tf(sup.menu, { x: -16 * (1 - sp(0)), o: sp(0) });
      const g0 = sup.sc.children;                                           // Seitenüberschrift, Banner usw. gestaffelt
      Array.from(g0).forEach((el, i) => { if (el === sup.rOld.el || el === sup.rNew.el) return; const p = sp(0.04 + i * 0.045); tf(el, { y: 18 * (1 - p), o: p }); });
      // Eingabe
      const qTxt = 'Ordner teilen', ty = Math.floor(clamp((t - 35.62) / 0.6) * qTxt.length + 0.001);
      sup.input.textContent = t < 35.5 ? 'z. B. Dateien, Kalender, Zugang' : qTxt.slice(0, ty);
      sup.input.style.color = t < 35.5 ? '#7A7770' : '#171A22';
      sup.caret.style.display = (t >= 35.5 && t < 36.8) ? 'inline-block' : 'none';
      sup.sc.querySelector('.ui-sin .inp').style.boxShadow = (t >= 35.48 && t < 37.0) ? '0 0 0 3px rgba(230,126,34,.55)' : '';
      // Zone: Liste → Antwort
      const al = tw(t, 36.15, 36.55, ease.ui);
      sup.arts.forEach((a, i) => { tf(a, { y: 0, o: 1 - al }); }); sup.artsLbl.style.opacity = 1 - al;
      show(sup.ai, al > 0.001);
      tf(sup.ai, { y: 16 * (1 - al), s: 0.97 + 0.03 * al, o: al });
      sup.steps.forEach((st, i) => {
        const ti = [36.3, 36.9, 37.5][i], p = tw(t, ti, ti + 0.32, ease.outBack);
        st.ck.style.display = p > 0 ? 'flex' : 'none'; tf(st.ck, { s: Math.max(0.01, p) });
        st.dot.style.borderColor = t >= ti ? 'var(--orange)' : '#E2C9A8';
      });
      // Anfragen
      const rn = tw(t, 38.0, 38.5, ease.snap);
      show(sup.rNew.el, t >= 37.99); tf(sup.rNew.el, { y: -20 * (1 - rn), s: 0.96 + 0.04 * rn, o: clamp(rn * 1.6) });
      const grow = tw(t, 39.3, 39.8, ease.ui);
      sup.rNew.el.style.height = (54 + 22 * grow) + 'px';
      sup.rOld.el.style.top = (684 + (64 + 22 * grow) * ease.out3(prog(t, 38.0, 38.5))) + 'px';
      const rs = t >= 38.8;
      sup.rNew.stEl.className = 'ui-rst ' + (rs ? 'o' : ''); sup.rNew.stText.textContent = rs ? 'Antwort vom Support' : 'Eingegangen';
      tf(sup.rNew.stEl, { s: 1 + 0.12 * Math.sin(Math.PI * clamp((t - 38.8) / 0.35)) });
      tf(sup.reply, { o: tw(t, 39.35, 39.85, ease.out2), y: 6 * (1 - tw(t, 39.35, 39.85)) });
      sup.reply.style.display = t >= 39.34 ? '' : 'none';
      sup.rNew.sub.textContent = rs ? 'Anfrage von Ihnen · vor 1 Minute' : 'Anfrage von Ihnen · gerade eben';

      /* ---- Cursor ---- */
      let cx = CUR[0][1], cy = CUR[0][2];
      if (t >= CUR[CUR.length - 1][0]) { cx = CUR[CUR.length - 1][1]; cy = CUR[CUR.length - 1][2]; }
      else for (let i = 0; i < CUR.length - 1; i++) if (t >= CUR[i][0] && t < CUR[i + 1][0]) { const p = ease.uiInOut(prog(t, CUR[i][0], CUR[i + 1][0])); cx = lerp(CUR[i][1], CUR[i + 1][1], p); cy = lerp(CUR[i][2], CUR[i + 1][2], p); }
      let press = 1;
      for (const ck of CLICKS) { const d = t - ck; if (d >= -0.05 && d < 0.3) press = Math.min(press, d < 0.05 ? 1 - 0.16 * clamp((d + 0.05) / 0.1) : 0.84 + 0.16 * clamp((d - 0.05) / 0.25)); }
      const cop = tw(t, 24.7, 24.95) * (1 - tw(t, 38.5, 38.9));
      show(cur.el, cop > 0.01); tf(cur.el, { x: cx, y: cy, s: press, o: cop });
      let rip = 0, rt = 0; for (const ck of CLICKS) { const d = t - ck; if (d >= 0 && d < 0.55) { rip = 1; rt = d / 0.55; } }
      show(cur.rip, rip > 0);
      if (rip) { tf(cur.rip, { x: cx + 6, y: cy + 4, s: 0.3 + 1.1 * ease.out3(rt), o: 0.8 * (1 - rt) }); }
    },
  });
}
