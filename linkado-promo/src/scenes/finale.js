// ============================================================
// Finale – Kristallisation (52–60 s)
// Alles, was Linkado verbindet, kristallisiert zum Logo:
//  51.5–53.0  die Knoten aus Szene 06 (handoffDots) bekommen Gesellschaft; der orange FADEN
//             (setzt den Fortschrittsfaden von unten fort) verbindet sie zu einem Netz
//  53.0–53.9  das Netz zieht sich zur Logo-Silhouette zusammen, kurz vor 54.0 wird es still
//  54.0       Kristall: Lichtblitz + Lichtkante, Facetten glitzern, die Buchstaben bauen sich scharf auf
//  54.5       die Spitze des Fadens rastet als Flaggen-Steg ins „A“ – das fehlende „Link“
//  54.75/56.0 „Die Möglichkeiten von Nextcloud.“ / „Einfach für deinen Alltag.“
//  57.0       Lockup-Tagline + genau ein CTA, danach ≥ 3 s ruhiges Endbild
// ============================================================
import { handoffDots } from './act2b.js';

// Texte (leicht änderbar). Das Logo-Lockup nennt „Der europäische digitale Arbeitsplatz“.
const TAGLINE = 'DER EUROPÄISCHE DIGITALE ARBEITSPLATZ';
const CTA_LABEL = 'LINKADO ENTDECKEN';
const CTA_URL = 'linkado.de';

export default function register(E) {
  const { h, tf, tw, ease, prog, clamp, lerp, show, rng, icon, LOGO } = E;
  const hit = (kind) => E.hits(kind).map((x) => x.t);
  const T_CRYSTAL = hit('crystal')[0];                       // 54.0
  const T_WEDGE = hit('snap').filter((x) => x > 54)[0];      // 54.5
  const T_LINES = hit('tagline');                            // 54.75, 56.0, 57.0
  const NAVY = '#1F2532', OR = '#E67E22';
  const K = 1000 / LOGO.viewBox[2];                          // Logo-Maßstab (Breite 1000 px)
  const LW = 1000, LH = LOGO.viewBox[3] * K;
  const CX = 960, CY0 = 540;                                 // Logo-Mitte beim Kristallisieren
  const toScreen = (px, py, cy = CY0) => [CX + (px - (LOGO.viewBox[0] + LOGO.viewBox[2] / 2)) * K, cy + (py - (LOGO.viewBox[1] + LOGO.viewBox[3] / 2)) * K];
  const FLAG_C = toScreen(616.5, 576.5);                     // Mitte des A-Flaggen-Stegs
  const START = [1810, 1044];                                // dort endet der Fortschrittsfaden von Act II
  const LOGO_TOP_FINAL = 250, LOGO_TOP_START = CY0 - LH / 2;

  E.style(`
  .fn-line { position:absolute; left:0; right:0; text-align:center; font:600 56px/1.14 var(--font-display); text-transform:uppercase; letter-spacing:-.005em; color:var(--navy); white-space:nowrap; }
  .fn-line .m { display:inline-block; overflow:hidden; vertical-align:top; padding:6px 10px 12px; margin:-6px -10px -12px; }
  .fn-line .m > span { display:block; }
  .fn-line em { font-style:normal; color:var(--orange-deep); }
  .fn-tag { position:absolute; left:0; right:0; text-align:center; font:600 37px/1 var(--font-tag); text-transform:uppercase; color:#5D6470; white-space:nowrap; }
  .fn-cta { position:absolute; left:0; right:0; top:772px; display:flex; justify-content:center; align-items:center; gap:40px; }
  .fn-cta .u { font:600 40px/1 var(--font-body); color:var(--navy); letter-spacing:.01em; }
  `);

  E.scene({
    id: 'finale', start: 52, end: 60, pre: 0.5, z: 40,
    build(root) {
      root.style.background = 'var(--cream)';
      const dpr = Math.max(1, window.devicePixelRatio || 1);
      const mkCanvas = () => { const c = h('canvas', { width: Math.round(1920 * dpr), height: Math.round(1080 * dpr), style: { position: 'absolute', left: 0, top: 0, width: '1920px', height: '1080px' } }); const x = c.getContext('2d'); x.scale(dpr, dpr); return [c, x]; };
      const [cv, g] = mkCanvas();
      const spot = h('div', { class: 'abs', style: { inset: 0, background: 'radial-gradient(900px 520px at 50% 46%, #FFFDF8, rgba(255,253,248,0))', opacity: 0 } });
      root.append(spot, cv);

      /* ---------- Logo (DOM/SVG, scharf) ---------- */
      const logoWrap = h('div', { class: 'abs', style: { left: CX - LW / 2, top: LOGO_TOP_START, width: LW, height: LH } });
      logoWrap.innerHTML = E.logoSVG({ id: 'fin' }).replace(/width="\d+" height="\d+"/, `width="${LW}" height="${LH}"`);
      const logoSvg = logoWrap.firstChild;
      const flagPart = logoSvg.querySelector('[data-part="A-flag"]');
      const [facetCv, fg] = mkCanvas(); Object.assign(facetCv.style, { left: 0, top: 0 });
      const SKEW = Math.atan((2 * 80) / (LH + 120)) * 180 / Math.PI;
      const edgeWrap = h('div', { class: 'abs', style: { left: CX - LW / 2 - 80, top: -60, width: LW + 160, height: LH + 120, overflow: 'hidden', pointerEvents: 'none', webkitMaskImage: 'linear-gradient(to bottom, transparent 0, #000 24%, #000 76%, transparent 100%)', maskImage: 'linear-gradient(to bottom, transparent 0, #000 24%, #000 76%, transparent 100%)' } });
      const shine = h('div', { class: 'abs', style: { top: 0, width: 150, height: LH + 120, background: 'linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,.9))', transform: `skewX(${-SKEW}deg)` } });
      const edge = h('div', { class: 'abs', style: { top: 0, width: 5, height: LH + 120, background: OR, boxShadow: '0 0 30px rgba(230,126,34,.8)', transform: `skewX(${-SKEW}deg)` } });
      edgeWrap.append(shine, edge);
      root.append(logoWrap, facetCv, edgeWrap);
      // wandernder Flaggen-Steg (Kopf des Fadens)
      const wedge = h('div', { class: 'abs', style: { left: -25.5 * K, top: -13.5 * K, width: 51 * K, height: 27 * K, zIndex: 3 } });
      wedge.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="591 563 51 27" width="${51 * K}" height="${27 * K}"><path d="M603 563H642V568L591 590Z" fill="${OR}"/></svg>`;
      root.append(wedge);
      const flash = h('div', { class: 'abs', style: { inset: 0, background: 'radial-gradient(closest-side at 50% 50%, rgba(255,255,255,1), rgba(255,255,255,.55) 45%, rgba(255,255,255,0))', opacity: 0, zIndex: 6, transform: 'scale(1.6)' } });
      root.append(flash);

      /* ---------- Ziel-Punkte entlang der Logo-Umrisse ---------- */
      const tmp = h('div', { style: { position: 'absolute', left: '-5000px', top: 0 }, html: E.logoSVG({ id: 'tmp' }) }); document.body.append(tmp);
      const loops = [];                                          // Liste von Schleifen: [[x,y], …] (Bildschirmkoordinaten)
      LOGO.parts.forEach((pt) => {
        pt.d.split(/(?=M)/).forEach((sub) => {
          const p = document.createElementNS('http://www.w3.org/2000/svg', 'path'); p.setAttribute('d', sub); tmp.firstChild.append(p);
          const len = p.getTotalLength(), n = Math.max(4, Math.round(len / 25)), pts = [];
          for (let i = 0; i < n; i++) { const q = p.getPointAtLength((len * i) / n); pts.push(toScreen(q.x, q.y)); }
          loops.push({ pts, id: pt.id });
        });
      });
      tmp.remove();
      const targets = [], tEdges = [];
      loops.forEach((lp) => { const b = targets.length; lp.pts.forEach((q) => targets.push(q)); lp.pts.forEach((_, i) => tEdges.push([b + i, b + ((i + 1) % lp.pts.length)])); });

      /* ---------- Knoten: Übergabe aus Szene 06 + Gesellschaft ---------- */
      const r = rng(23), base = handoffDots(E).map((d) => ({ x: d.x, y: d.y, c: d.c, r: d.r, t: 51.0 }));
      for (let i = 0; i < 130; i++) base.push({ x: r.range(60, 1860), y: r.range(70, 1010), c: r.pick(['#1F2532', '#8B837A', '#E67E22', '#343D56', '#B8B0A2']), r: r.range(3, 6.5), t: 52.0 + r.range(0, 1.0) });
      const N = base.length, T = targets.length;
      const order = base.map((_, i) => i).sort((a, b) => base[a].x - base[b].x || base[a].y - base[b].y);
      const taken = new Array(T).fill(-1);
      order.forEach((ni, rank) => { const ti = Math.min(T - 1, Math.floor((rank * T) / N)); base[ni].ti = ti; base[ni].primary = taken[ti] < 0; if (taken[ti] < 0) taken[ti] = ni; base[ni].delay = r.range(0, 0.35); });
      // Nachbarschaftskanten (dünne Linien) für das wachsende Netz
      const edges = [], seen = new Set();
      base.forEach((a, i) => { const near = base.map((b, j) => [j, Math.hypot(a.x - b.x, a.y - b.y)]).filter(([j, d]) => j !== i && d < 250).sort((p, q) => p[1] - q[1]).slice(0, 2); near.forEach(([j]) => { const key = i < j ? i + '_' + j : j + '_' + i; if (!seen.has(key)) { seen.add(key); edges.push({ a: i, b: j, t: Math.max(a.t, base[j].t) + r.range(0.1, 1.2) }); } }); });
      // Faden: feste, elegante Kurve von START (unten rechts) zum A; Knoten nahe der Kurve leuchten orange, sobald die Spitze sie erreicht
      const BZ = [START, [1905, 650], [1390, 420], FLAG_C], SAMPLES = 220, thread = [];
      for (let i = 0; i <= SAMPLES; i++) {
        const u = i / SAMPLES, v = 1 - u;
        const x = v * v * v * BZ[0][0] + 3 * v * v * u * BZ[1][0] + 3 * v * u * u * BZ[2][0] + u * u * u * BZ[3][0];
        const y = v * v * v * BZ[0][1] + 3 * v * v * u * BZ[1][1] + 3 * v * u * u * BZ[2][1] + u * u * u * BZ[3][1];
        const dx = 3 * v * v * (BZ[1][0] - BZ[0][0]) + 6 * v * u * (BZ[2][0] - BZ[1][0]) + 3 * u * u * (BZ[3][0] - BZ[2][0]);
        const dyy = 3 * v * v * (BZ[1][1] - BZ[0][1]) + 6 * v * u * (BZ[2][1] - BZ[1][1]) + 3 * u * u * (BZ[3][1] - BZ[2][1]);
        const dl = Math.hypot(dx, dyy) || 1, wob = 13 * Math.sin(u * 17 + 0.6) * (1 - u) * Math.min(1, u * 8);
        thread.push([x + (-dyy / dl) * wob, y + (dx / dl) * wob]);
      }
      base.forEach((n) => { let bd = 1e9, bi = 0; thread.forEach((q, i) => { const d = Math.hypot(n.x - q[0], n.y - q[1]); if (d < bd) { bd = d; bi = i; } }); n.act = bd < 46 ? bi / SAMPLES : 2; });

      /* ---------- Facetten (gezackte Dreiecksteilung, nur innerhalb der Buchstaben) ---------- */
      const lx0 = CX - LW / 2 - 20, ly0 = CY0 - LH / 2 - 30, S = 62, tris = [];
      const jr = rng(77); const jit = (i, j) => [lx0 + i * S + (j % 2 ? S / 2 : 0) + jr.range(-12, 12), ly0 + j * S * 0.866 + jr.range(-12, 12)];
      const pts = {}; for (let j = 0; j <= 6; j++) for (let i = 0; i <= 18; i++) pts[i + '_' + j] = jit(i, j);
      for (let j = 0; j < 6; j++) for (let i = 0; i < 18; i++) {
        const a = pts[i + '_' + j], b = pts[i + 1 + '_' + j], c = pts[i + '_' + (j + 1)], d = pts[i + 1 + '_' + (j + 1)];
        const e = j % 2 ? pts[i + '_' + (j + 1)] : pts[i + 1 + '_' + (j + 1)];
        if (j % 2 === 0) { tris.push([a, b, c]); tris.push([b, d, c]); } else { tris.push([a, b, d]); tris.push([a, d, c]); }
      }
      const partPaths = LOGO.parts.filter((p) => p.id !== 'A-flag').map((p) => { const path = new Path2D(); path.addPath(new Path2D(p.d), new DOMMatrix([K, 0, 0, K, CX - (LOGO.viewBox[0] + LOGO.viewBox[2] / 2) * K, CY0 - (LOGO.viewBox[1] + LOGO.viewBox[3] / 2) * K])); return { path, rule: p.rule || 'nonzero' }; });
      const facets = tris.map((tri, k) => { const cxm = (tri[0][0] + tri[1][0] + tri[2][0]) / 3, cym = (tri[0][1] + tri[1][1] + tri[2][1]) / 3; return { tri, cx: cxm, cy: cym, v: jr(), inside: partPaths.some((pp) => g.isPointInPath(pp.path, cxm, cym, pp.rule)) }; }).filter((f) => f.inside);

      /* ---------- Texte ---------- */
      const mkLine = (top, inner) => h('div', { class: 'fn-line', style: { top } }, inner);
      const mask = (html) => h('span', { class: 'm' }, h('span', { html }));
      const line1 = mkLine(560, mask('Die Möglichkeiten von Nextcloud.'));
      const line2 = mkLine(636, mask('Einfach für deinen <em>Alltag.</em>'));
      const uline = h('div', { class: 'uline abs', style: { height: 5, width: 0, top: 706, left: 0 } });
      const tagEl = h('div', { class: 'fn-tag', style: { top: LOGO_TOP_FINAL + LH + 30 }, text: TAGLINE });
      const cta = h('div', { class: 'fn-cta' }, h('div', { class: 'btn', style: { padding: '28px 58px 28px 42px', fontSize: 34, letterSpacing: '.06em' } }, h('span', { text: CTA_LABEL }), h('span', { html: icon('arrow-up-right', 30, '#fff', 2.6) })), h('div', { class: 'u', text: CTA_URL }));
      root.append(line1, line2, uline, tagEl, cta);
      return { thread, partPaths, cv, g, dpr, spot, logoWrap, logoSvg, flagPart, facetCv, fg, edgeWrap, shine, edge, wedge, flash, base, N, T, targets, tEdges, edges, facets, line1, line2, uline, tagEl, cta };
    },

    update(t, s) {
      const { g, base, targets, edges, thread } = s;
      const dpr = s.dpr;
      g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, 1920, 1080);

      /* ---- Lichtkante (Kristall) – Position der schrägen Front ---- */
      const sweep = prog(t, T_CRYSTAL, T_CRYSTAL + 0.65), sl = 80;
      const xf = lerp(CX - LW / 2 - 200, CX + LW / 2 + 260, ease.uiInOut(sweep)), crystalOn = t >= T_CRYSTAL;
      const logoY = lerp(LOGO_TOP_START, LOGO_TOP_FINAL, tw(t, T_LINES[0] - 0.05, T_LINES[0] + 0.75, ease.uiInOut));
      const dy = logoY - LOGO_TOP_START;
      const yTop = LOGO_TOP_START - 60, hh = LH + 120;
      const edgeX = (y) => xf + sl - (2 * sl * (y - yTop)) / hh;             // x der schrägen Front auf Höhe y (Bildschirm)

      /* ---- Netz-Phase: Kanten, Faden, Knoten ---- */
      const netA = t < T_CRYSTAL + 0.9 ? 1 : 0;
      if (netA) {
        // Knotenpositionen
        const cont = (n) => ease.uiInOut(prog(t, 53.0 + n.delay, 53.85 + n.delay * 0.4));
        const pos = base.map((n, i) => {
          const c = cont(n), tg = targets[n.ti];
          const dx = Math.sin(t * 0.9 + i) * 7 * (1 - c), dyv = Math.cos(t * 0.8 + i * 1.3) * 7 * (1 - c);
          const still = t >= 53.5 && t < T_CRYSTAL ? 0.55 : 1;
          return [lerp(n.x + dx * still, tg[0], c), lerp(n.y + dyv * still, tg[1], c)];
        });
        // dünne Nachbarschaftskanten (wachsen heran, lösen sich beim Zusammenziehen)
        const eFade = 1 - tw(t, 53.2, 53.8);
        if (eFade > 0.01) {
          g.lineWidth = 1.4;
          edges.forEach((e) => { const p = prog(t, e.t, e.t + 0.7); if (p <= 0) return; const A = pos[e.a], B = pos[e.b]; g.strokeStyle = `rgba(31,37,50,${(0.2 * eFade).toFixed(3)})`; g.beginPath(); g.moveTo(A[0], A[1]); g.lineTo(lerp(A[0], B[0], ease.out3(p)), lerp(A[1], B[1], ease.out3(p))); g.stroke(); });
        }
        // Umriss-Kanten des Logos (Konstellation)
        const oA = tw(t, 53.45, 53.95) * (crystalOn ? 1 - tw(t, T_CRYSTAL + 0.05, T_CRYSTAL + 0.6) : 1);
        if (oA > 0.01) {
          g.lineWidth = 1.6; g.strokeStyle = `rgba(31,37,50,${(0.55 * oA).toFixed(3)})`; g.beginPath();
          s.tEdges.forEach(([a, b]) => { g.moveTo(targets[a][0], targets[a][1] + 0); g.lineTo(targets[b][0], targets[b][1]); }); g.stroke();
        }
        // Faden entlang der festen Kurve
        const spl = thread;
        const uFade = 1 - tw(t, T_WEDGE + 0.05, T_WEDGE + 0.4);
        const uP = ease.io2(prog(t, 52.0, T_WEDGE - 0.05)), uDraw = uP * (spl.length - 1);
        const full = Math.floor(uDraw), frac = uDraw - full;
        let head = spl[0];
        if (uFade > 0.01 && t >= 52.0) {
          g.lineWidth = 3.6; g.lineCap = 'round'; g.lineJoin = 'round'; g.strokeStyle = `rgba(230,126,34,${uFade.toFixed(3)})`; g.beginPath(); g.moveTo(spl[0][0], spl[0][1]);
          for (let i = 1; i <= full; i++) g.lineTo(spl[i][0], spl[i][1]);
          if (full < spl.length - 1) { head = [lerp(spl[full][0], spl[full + 1][0], frac), lerp(spl[full][1], spl[full + 1][1], frac)]; g.lineTo(head[0], head[1]); } else head = spl[spl.length - 1];
          g.stroke();
        } else head = t < 52.0 ? spl[0] : FLAG_C;
        // Knoten
        base.forEach((n, i) => {
          const p = pos[i], appear = tw(t, n.t, n.t + 0.5, ease.out3);
          if (appear <= 0) return;
          const c = cont(n);
          let a = appear * (n.primary ? 1 : 1 - tw(c, 0.55, 0.95));                     // Überzählige verschmelzen und verschwinden
          if (crystalOn) { const ex = edgeX(p[1]); a *= clamp((p[0] - ex) / 70 + 0.2); a *= 1 - tw(t, T_CRYSTAL + 0.35, T_CRYSTAL + 0.9); }
          if (a <= 0.01) return;
          const rr = n.r * (n.primary ? lerp(1, 0.62, c) : lerp(1, 0.5, c));
          const hitT = n.act <= 1 ? clamp((uP - n.act) / 0.06 + 0.0) : 0;
          g.fillStyle = hitT > 0 ? OR : n.c; g.globalAlpha = a; g.beginPath(); g.arc(p[0], p[1], rr * (1 + 0.8 * Math.sin(Math.PI * clamp(hitT * 1.0)) * (1 - c)), 0, 6.2832); g.fill();
        });
        g.globalAlpha = 1;
        // Flaggen-Steg wandert mit der Fadenspitze
        const travel = t < T_WEDGE;
        show(s.wedge, travel && t >= 52.0);
        const wsc = lerp(0.5, 1, ease.in2(prog(t, 53.6, T_WEDGE)));
        tf(s.wedge, { x: head[0], y: head[1], s: wsc, o: tw(t, 52.0, 52.3) });
      } else show(s.wedge, false);

      /* ---- Kristall: Lichtblitz, Kante, Buchstaben, Facetten ---- */
      const fl = t >= T_CRYSTAL - 0.12 && t < T_CRYSTAL + 0.5 ? (t < T_CRYSTAL ? tw(t, T_CRYSTAL - 0.12, T_CRYSTAL, ease.in3) : 1 - tw(t, T_CRYSTAL, T_CRYSTAL + 0.5, ease.out3)) : 0;
      show(s.flash, fl > 0.001); s.flash.style.opacity = (0.8 * fl).toFixed(3);
      s.spot.style.opacity = tw(t, T_CRYSTAL, T_CRYSTAL + 1.0) * 0.9 + tw(t, 53.3, T_CRYSTAL) * 0.25;
      // Logo-Buchstaben (ohne Flaggen-Steg) hinter der Kante sichtbar machen
      const lw = s.logoWrap;
      lw.style.top = logoY + 'px';
      const edgeLocalX = xf - (CX - LW / 2), clipTop = -60, clipBot = LH + 60;
      lw.style.clipPath = !crystalOn ? 'polygon(0 0,0 0,0 0)' : sweep >= 1 ? 'none' : `polygon(-120px ${clipTop}px, ${(edgeLocalX + sl).toFixed(1)}px ${clipTop}px, ${(edgeLocalX - sl).toFixed(1)}px ${clipBot}px, -120px ${clipBot}px)`;
      s.flagPart.style.opacity = t >= T_WEDGE ? 1 : 0;
      const breathe = t > 55.5 ? 1 + 0.003 * Math.sin((t - 55.5) * 1.6) : 1;
      lw.style.transform = `scale(${(0.985 + 0.015 * tw(t, T_CRYSTAL, T_CRYSTAL + 0.9, ease.out3)) * breathe})`;
      // Kante
      const edgeOn = crystalOn && sweep < 1;
      show(s.edgeWrap, edgeOn); s.edgeWrap.style.top = (logoY - 60) + 'px';
      s.edge.style.left = (edgeLocalX + 80 - 3) + 'px'; s.shine.style.left = (edgeLocalX + 80 - 150) + 'px';
      // Facetten funkeln beim Durchlauf der Kante (nur auf den Buchstaben)
      const fc = s.facetCv, fgx = s.fg; fgx.setTransform(dpr, 0, 0, dpr, 0, 0); fgx.clearRect(0, 0, 1920, 1080);
      if (t >= T_CRYSTAL - 0.02 && t < T_CRYSTAL + 1.5) {
        fgx.save(); fgx.translate(0, dy);
        // je Buchstabe als Clip: Facetten nur innerhalb der Buchstaben zeichnen
        s.partPaths.forEach((pp) => {
          fgx.save(); fgx.clip(pp.path, pp.rule);
          s.facets.forEach((f) => {
            const frac = clamp((f.cx - (CX - LW / 2 - 200)) / (LW + 460));                  // wann die Kante diese Facette erreicht (0..1)
            const th = T_CRYSTAL + 0.65 * invUiInOut(frac);
            const d = (t - th) / 0.22, a = Math.exp(-d * d) * (0.35 + 0.65 * f.v);
            if (a < 0.02) return;
            fgx.beginPath(); fgx.moveTo(f.tri[0][0], f.tri[0][1]); fgx.lineTo(f.tri[1][0], f.tri[1][1]); fgx.lineTo(f.tri[2][0], f.tri[2][1]); fgx.closePath();
            fgx.fillStyle = `rgba(255,255,255,${(0.62 * a).toFixed(3)})`; fgx.fill(); fgx.strokeStyle = `rgba(255,255,255,${(0.5 * a).toFixed(3)})`; fgx.lineWidth = 1.2; fgx.stroke();
          });
          fgx.restore();
        });
        fgx.restore();
      }
      // Ring beim Einrasten des Flaggen-Stegs
      // (kleiner Lichtpunkt): kurzer Puls am Steg
      const pulse = prog(t, T_WEDGE, T_WEDGE + 0.5);
      if (pulse > 0 && pulse < 1) { g.save(); g.setTransform(dpr, 0, 0, dpr, 0, 0); g.translate(0, dy); g.strokeStyle = `rgba(230,126,34,${(0.8 * (1 - pulse)).toFixed(3)})`; g.lineWidth = 3; g.beginPath(); g.arc(FLAG_C[0], FLAG_C[1], 20 + 90 * ease.out3(pulse), 0, 6.2832); g.stroke(); g.restore(); }

      /* ---- Schlusszeilen, Tagline, CTA ---- */
      const rev = (el, t0) => { el.firstChild.firstChild.style.transform = `translateY(${(150 * (1 - tw(t, t0, t0 + 0.7, ease.ui))).toFixed(2)}%)`; };
      rev(s.line1, T_LINES[0]); rev(s.line2, T_LINES[1]);
      if (!s.em && t >= T_LINES[0]) { const er = s.line2.querySelector('em').getBoundingClientRect(), sr = E.stage.getBoundingClientRect(); s.em = { x: er.left - sr.left, w: er.width }; }
      const ulW = tw(t, T_LINES[1] + 0.55, T_LINES[1] + 1.2, ease.ui);
      if (s.em) Object.assign(s.uline.style, { left: s.em.x + 'px', width: (s.em.w * ulW) + 'px', display: ulW > 0 ? 'block' : 'none' }); else s.uline.style.display = 'none';
      const tg = tw(t, T_LINES[2], T_LINES[2] + 0.8, ease.ui);
      tf(s.tagEl, { y: 16 * (1 - tg), o: tg }); s.tagEl.style.letterSpacing = (0.3 - 0.1 * tg) + 'em';
      const cg = tw(t, T_LINES[2] + 0.25, T_LINES[2] + 0.95, ease.ui);
      tf(s.cta, { y: 20 * (1 - cg), o: cg });
      // Hintergrund erst sanft einblenden (Szene 06 liegt bis 52.0 darunter)
      s.logoWrap.parentNode.style.opacity = tw(t, 51.5, 51.62);
    },
  });

  // Umkehrfunktion von ease.uiInOut (numerisch, für das Facettenfunkeln)
  function invUiInOut(y) { let lo = 0, hi = 1; for (let i = 0; i < 18; i++) { const m = (lo + hi) / 2; if (E.ease.uiInOut(m) < y) lo = m; else hi = m; } return (lo + hi) / 2; }
}
