// ============================================================
// Act II – Klarheit (20–52 s): Hintergrund + Lichtflut, Overlay (Sneak Peek + Faden),
// und die vier Oberflächen-Szenen 01–04 in EINEM durchgehenden Linkado-Fenster:
//   01 Nextcloud als Basis, Linkado als Benutzererlebnis   (20–24)
//   02 Mehr Übersicht im Arbeitsalltag                      (24–28)
//   03 Passende Werkzeuge an einem Ort (Appshop)            (28–34)
//   04 Hilfe direkt in der Cloud                            (34–40)
// Kamera-Zooms führen den Blick; Aktionen landen auf den hits der timeline.json.
// ============================================================
import { buildUI } from '../ui.js';

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
    id: 'a2-bg', start: 20, end: 52, z: 10,
    build(root) { const flood = h('div', { class: 'abs', style: { inset: 0, background: 'var(--cream)' } }); root.append(flood); return { flood }; },
    update(t, s) {
      const p = tw(t, 20.0, 20.8, ease.out4);
      s.flood.style.clipPath = p >= 1 ? 'none' : `circle(${(1400 * p).toFixed(1)}px at 50% 50%)`;
    },
  });

  /* ---------------------------------------------------------------- Overlay: Sneak Peek + Faden */
  const NODE_T = [20.25, 24.0, 28.0, 34.0, 40.0, 46.0, 52.0];
  const NODE_X = (i) => 110 + i * (1700 / 6);       // 110 … 1810 (Index 6 = Ziel: Linkado)
  const BAR_Y = 1044;
  const ovOut0 = (t) => 1 - tw(t, 52.0, 52.7);
  const progressX = (t) => {
    if (t < NODE_T[0]) return NODE_X(0);
    for (let i = 0; i < 6; i++) if (t < NODE_T[i + 1]) return lerp(NODE_X(i), NODE_X(i + 1), ease.io2(prog(t, NODE_T[i] + 0.35, NODE_T[i + 1] - 0.1)));
    return NODE_X(6);
  };
  E.scene({
    id: 'a2-ov', start: 20, end: 52.8, z: 45,
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
      Object.assign(s.head.style, { left: (x1 - 2) + 'px', top: (y - 7) + 'px', opacity: t < 51.9 ? 1 : 1 - tw(t, 51.9, 52.25) });
      const ovOut = 1 - tw(t, 52.0, 52.7);
      s.track.style.opacity = e * ovOut; s.fade.style.opacity = e * (1 - tw(t, 50.6, 51.2));
      s.nodes.forEach((n, i) => {
        const a = t - NODE_T[i], on = a >= 0;
        const pop = on ? 1 + 0.5 * Math.sin(Math.PI * clamp(a / 0.5)) * (1 - clamp(a / 0.5) * 0.4) : 1;
        n.style.background = on ? 'var(--orange)' : 'var(--cream)';
        n.style.borderColor = on ? 'var(--orange)' : 'rgba(31,37,50,.30)';
        n.style.opacity = e * (1 - tw(t, 51.6, 52.4)); n.style.transform = `scale(${pop})`;
      });
      s.goal.style.opacity = e * (1 - tw(t, 52.2, 52.7)); s.goal.style.transform = `scale(${1 + 0.12 * Math.sin(t * 3)})`;
    },
  });

  /* ---------------------------------------------------------------- Das Linkado-Fenster: 01 – 04 */
  const POSE = {
    full:   { s: 0.70, px: 872, py: 214 },
    search: { s: 1.08, px: 870, py: 132 },
    shop:   { s: 0.98, px: 870, py: 104 },
    help:   { s: 1.00, px: 870, py: 96 },
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

  // Cursor-Weg im Fensterraum (Sek., x, y). Klicks: 25.4, 30.0, 31.5, 33.5, 35.5
  const CUR = [
    [24.70, 980, 620], [25.35, 538, 322], [26.85, 538, 322], [27.15, 470, 418], [27.70, 470, 418], [28.30, 940, 660],
    [29.00, 940, 660], [29.95, 352, 436], [30.50, 352, 436], [31.45, 792, 440], [32.05, 792, 440], [32.65, 306, 200],
    [33.05, 306, 200], [33.45, 972, 480], [33.95, 972, 480], [34.60, 1010, 700],
    [34.65, 1010, 700], [35.05, 560, 312], [35.45, 686, 308], [36.05, 686, 308], [36.60, 760, 560],
  ];
  const CLICKS = [25.4, 30.0, 31.5, 33.5, 35.5];

  // App-Flüge (Karte → Seitenleiste)
  const FLY = [
    { t0: 30.0, from: [188, 324], to: [48, 589], app: 0 },
    { t0: 31.5, from: [628, 324], to: [48, 669], app: 1 },
  ];

  E.scene({
    id: 'a2-ui', start: 20, end: 41, z: 20,
    build(root) {
      const ui = buildUI(E);
      const outer = h('div', { class: 'abs', style: { inset: 0 } });
      const cam = h('div', { class: 'abs', style: { left: 0, top: 0, width: 1480, height: 900, transformOrigin: '0 0' } });
      // Rohfassung = „Nextcloud-Standard“
      const raw = ui.window({ raw: true }); raw.setActive('Startseite'); raw.main.append(ui.dashboard().el);
      // Linkado
      const win = ui.window(); win.setActive('Startseite');
      const dash = ui.dashboard(), shop = ui.appshop(), files = ui.files();
      win.main.append(dash.el, shop.el, files.el);
      const res = ui.results('Angebot'); Object.assign(res.el.style, { left: '52px', top: '283px' }); dash.el.append(res.el);
      const hint = ui.hint(); Object.assign(hint.el.style, { left: '560px', top: '220px' }); files.el.append(hint.el);
      const help = ui.help(); win.main.append(help.el);
      const rFor = win.mk('Formulare', 'clipboard-list', 'Formulare', 12 + 6 * 80);
      const rDeck = win.mk('Deck', 'columns-3', 'Deck', 12 + 7 * 80);
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
      const capRaw = h('div', { style: { ...capStyle, color: 'var(--warm-gray)' } }, h('span', { class: 'flag', style: { background: '#B0B7C2' } }), 'NEXTCLOUD · STANDARD');
      const capLk = h('div', { style: { ...capStyle, color: 'var(--navy)' } }, h('span', { class: 'flag' }), h('span', { html: 'LINKADO · <span style="color:var(--orange-deep)">ERLEBNIS</span>' }));
      root.append(capRaw, capLk);

      const heads = [
        K.headline(E, root, { num: '01', size: 74, y: 258, lines: ['NEXTCLOUD', 'ALS BASIS.', '<em>LINKADO</em> ALS', 'BENUTZERERLEBNIS.'], muted: [true, true, false, false], delays: [0, 0, 1.3, 1.3], sub: 'Technik verständlich und zugänglich machen.', subDelay: 1.3 }),
        K.headline(E, root, { num: '02', size: 80, y: 330, lines: ['MEHR <em>ÜBERSICHT</em>', 'IM ARBEITSALLTAG.'], sub: 'Anwendungen und wichtige Funktionen leichter finden.' }),
        K.headline(E, root, { num: '03', size: 80, y: 290, lines: ['PASSENDE', '<em>WERKZEUGE</em>', 'AN EINEM ORT.'], sub: 'Apps über den Linkado-Appshop auswählen und verwalten.' }),
        K.headline(E, root, { num: '04', size: 80, y: 330, lines: ['HILFE DIREKT', 'IN DER <em>CLOUD.</em>'], sub: 'Anleitungen und Support dort, wo Fragen entstehen.' }),
      ];
      return { ui, outer, cam, raw, win, dash, shop, files, res, hint, help, rFor, rDeck, rails: [rFor, rDeck], bandWrap, shine, edge, trailSvg, flyer, cur, capRaw, capLk, heads, trailLen: {}, activeRail: '' };
    },

    update(t, s) {
      const { cam, outer, raw, win, dash, shop, files, res, hint, help, cur } = s;

      /* ---- Kamera + Fenster-Auftritt/Abgang ---- */
      const c = camAt(t);
      cam.style.transform = `translate(${c.px.toFixed(2)}px,${c.py.toFixed(2)}px) scale(${c.s.toFixed(4)})`;
      const wi = tw(t, 20.25, 20.95, ease.ui), wo = tw(t, 39.9, 40.8, ease.in3);
      outer.style.opacity = wi * (1 - wo);
      outer.style.transform = `translateY(${(36 * (1 - wi) - 30 * wo).toFixed(2)}px)`;

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

      /* ---- 02: Übersicht – Widgets rasten ein, Suche ---- */
      const loose = tw(t, 23.2, 23.95, ease.out3) * (1 - ease.snap(prog(t, 24.0, 24.55)));
      tf(dash.hero, { x: -14 * loose, y: 10 * loose, r: -1.5 * loose }); tf(dash.day, { x: 16 * loose, y: -8 * loose, r: 1.3 * loose });
      const focus = t >= 25.38 && t < 27.6;
      dash.search.style.boxShadow = focus ? '0 0 0 4px rgba(230,126,34,.55), 0 2px 0 rgba(0,0,0,.10)' : '';
      const typed = Math.floor(clamp((t - 25.62) / 0.7) * 7 + 0.001);
      dash.searchText.textContent = t < 25.4 ? 'Suchen: Datei, Person, Termin …' : 'Angebot'.slice(0, typed);
      dash.searchText.style.color = t < 25.4 ? '' : 'var(--navy)';
      dash.caret.style.display = (t >= 25.4 && t < 27.3 && (t < 26.5 || Math.floor(t * 2) % 2 === 0)) ? 'inline-block' : 'none';
      const rp = tw(t, 26.4, 26.75, ease.ui), rq = tw(t, 27.55, 27.95, ease.in2);
      show(res.el, t >= 26.38 && t < 28.0);
      tf(res.el, { y: -14 * (1 - rp), o: rp * (1 - rq) });
      res.rows.forEach((r, i) => { const p = tw(t, 26.45 + i * 0.08, 26.9 + i * 0.08, ease.ui); tf(r, { y: 10 * (1 - p), o: p }); });

      /* ---- Ansichtswechsel Startseite → Appshop → Dateien ---- */
      const act = t < 28.0 ? 'Startseite' : t < 34.0 ? 'Appshop' : t < 35.5 ? 'Dateien' : 'Support';
      if (act !== s.activeRail) { win.setActive(act); s.activeRail = act; }
      show(dash.el, t < 28.5); tf(dash.el, { o: 1 - tw(t, 28.0, 28.45, ease.out2), s: 1 - 0.015 * tw(t, 28.0, 28.45) });
      show(shop.el, t >= 27.98 && t < 34.6);
      shop.el.style.opacity = tw(t, 28.0, 28.3, ease.out2) * (1 - tw(t, 34.0, 34.5, ease.out2));
      const hp = tw(t, 28.1, 28.7, ease.ui);
      tf(shop.head, { y: 20 * (1 - hp), o: hp }); tf(shop.seg, { y: 20 * (1 - hp), o: hp });
      const mp = tw(t, 32.7, 33.2, ease.ui);                               // „Meine Apps“
      tf(shop.chips, { y: 20 * (1 - hp), o: hp * (1 - mp) });
      show(shop.cardsWrap, mp < 0.99); show(shop.listWrap, mp > 0.005);
      shop.cardsWrap.style.opacity = 1 - mp;
      shop.cards.forEach((cd, i) => { const p = tw(t, 28.25 + i * 0.07, 28.85 + i * 0.07, ease.ui); tf(cd.el, { y: 44 * (1 - p), o: p }); });
      shop.seg.children[0].classList.toggle('on', mp < 0.5); shop.seg.children[1].classList.toggle('on', mp >= 0.5);
      const ON = [1, 1, 0, 0, 0, 0, 1, 1];
      shop.list.forEach((r, i) => {
        const p = tw(t, 32.8 + i * 0.06, 33.3 + i * 0.06, ease.ui); tf(r.el, { y: 26 * (1 - p), o: p });
        const on = i === 2 ? tw(t, 33.5, 33.78, ease.out3) : ON[i];
        r.tg.style.background = mixHex('#D8D0BF', '#E67E22', on); r.tg.firstChild.style.left = (4 + 28 * on) + 'px';
      });
      show(files.el, t >= 33.98 && t < 40.9);
      files.el.style.opacity = tw(t, 34.0, 34.5, ease.out2);

      /* ---- 03: Apps hinzufügen – Icon fliegt in die Seitenleiste ---- */
      FLY.forEach((f, k) => {
        const card = shop.cards[f.app], rail = s.rails[k];
        const q = t - f.t0;
        // Button-Zustand
        const done = q >= 0.06;
        card.idle.style.display = done ? 'none' : 'inline-flex'; card.done.style.display = done ? 'inline-flex' : 'none';
        card.btn.classList.toggle('done', done);
        tf(card.btn, { s: 1 - 0.04 * Math.sin(Math.PI * clamp(q / 0.25)) });
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
        const [x0, y0] = act_f.from, [x2, y2] = act_f.to, cx = (x0 + x2) / 2 + 150, cy = (y0 + y2) / 2 - 70;
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

      /* ---- 04: Hilfe direkt dort, wo die Frage entsteht ---- */
      files.rows[1].classList.toggle('hl', t >= 34.95 && t < 36.1);
      const hpp = tw(t, 35.05, 35.45, ease.snap);
      show(hint.el, t >= 35.03 && t < 36.4);
      tf(hint.el, { s: 0.8 + 0.2 * hpp, o: clamp(hpp * 1.6) * (1 - tw(t, 36.0, 36.35)), x: 0 });
      const dp = tw(t, 35.5, 36.15, ease.ui);
      show(help.el, dp > 0.001);
      tf(help.el, { x: -490 * (1 - dp) });
      help.steps.forEach((st, i) => {
        const ti = [36.3, 36.9, 37.5][i], p = tw(t, ti, ti + 0.32, ease.outBack);
        st.ck.style.display = p > 0 ? 'flex' : 'none'; tf(st.ck, { s: Math.max(0.01, p) });
        st.dot.style.borderColor = t >= ti ? 'var(--orange)' : '#D8D0BF';
      });
      const bub = (el, t0) => { const p = tw(t, t0, t0 + 0.4, ease.ui); show(el, t >= t0 - 0.01); tf(el, { y: 14 * (1 - p), o: p, s: 0.96 + 0.04 * p }); };
      bub(help.b1, 38.0); bub(help.b2, 38.5);
      const typing = t >= 38.95 && t < 39.4;
      show(help.typing, typing);
      if (typing) Array.from(help.typing.querySelectorAll('i')).forEach((d, i) => { d.style.transform = `translateY(${(-5 * Math.max(0, Math.sin((t * 9) - i * 0.9))).toFixed(2)}px)`; });
      bub(help.b3, 39.4);

      /* ---- Cursor ---- */
      let cx = CUR[0][1], cy = CUR[0][2];
      if (t >= CUR[CUR.length - 1][0]) { cx = CUR[CUR.length - 1][1]; cy = CUR[CUR.length - 1][2]; }
      else for (let i = 0; i < CUR.length - 1; i++) if (t >= CUR[i][0] && t < CUR[i + 1][0]) { const p = ease.uiInOut(prog(t, CUR[i][0], CUR[i + 1][0])); cx = lerp(CUR[i][1], CUR[i + 1][1], p); cy = lerp(CUR[i][2], CUR[i + 1][2], p); }
      let press = 1;
      for (const ck of CLICKS) { const d = t - ck; if (d >= -0.05 && d < 0.3) press = Math.min(press, d < 0.05 ? 1 - 0.16 * clamp((d + 0.05) / 0.1) : 0.84 + 0.16 * clamp((d - 0.05) / 0.25)); }
      const cop = tw(t, 24.7, 24.95) * (1 - tw(t, 36.3, 36.7));
      show(cur.el, cop > 0.01); tf(cur.el, { x: cx, y: cy, s: press, o: cop });
      let rip = 0, rt = 0; for (const ck of CLICKS) { const d = t - ck; if (d >= 0 && d < 0.55) { rip = 1; rt = d / 0.55; } }
      show(cur.rip, rip > 0);
      if (rip) { tf(cur.rip, { x: cx + 6, y: cy + 4, s: 0.3 + 1.1 * ease.out3(rt), o: 0.8 * (1 - rt) }); }
    },
  });
}
