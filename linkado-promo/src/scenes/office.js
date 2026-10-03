// ============================================================
// Akt I – drei Büro-Szenen (statt der drei Fenster-Momente). Ein kühles, dämmriges Büro, in dem Menschen ihre Alltagsprobleme erleben:
//   4,0–8,5   Tom (Einkauf)  – „Der Allrounder“: ärgert sich über Zusatzkosten und telefoniert mit der IT
//   8,5–13,0  Lena (Büro)    – „Das fertige Portal“: ein Login – und dahinter sieht alles anders aus; zuckt ratlos mit den Schultern
//   13,0–17,5 Anna (Vertrieb) – „Die offene Basis“: Tab-Flut vor der rohen Oberfläche, rauft sich die Haare
// Zeiten (Kartenschlag, drei Pings, Schub) kommen aus timeline.json; die Gesten hängen an den Pings. Keine Produkt-/Firmennamen:
// auf den Bildschirmen sind nur generische „Standardprogramme“ angedeutet (Raster, Fenster, Tabs).
// Ruhig gesetzt: harte Schnitte, gehaltene Posen, Mundbewegung 3–4 Hz, keine Kamerafahrt.
// ============================================================
import { buildUI } from '../ui.js';
import { laptop, mini } from './act1-bits.js';
import { figure, POSE, lerpPose } from './figures.js';

const CREAM = '#F4EEE3';
let cssOn = false;
function css(E) {
  if (cssOn) return; cssOn = true;
  E.style(`
  .of-bub { position:absolute; left:110px; max-width:640px; padding:22px 34px 24px; border-radius:34px; background:${CREAM}; color:#1F2532; font:600 46px/1.16 var(--font-body); box-shadow:0 18px 40px rgba(0,0,0,.45); text-wrap:balance; transform-origin:100% 70%; }
  .of-bub::after { content:""; position:absolute; right:-14px; top:58%; width:30px; height:30px; background:${CREAM}; transform:rotate(45deg); border-radius:0 0 8px 0; }
  .of-who { position:absolute; left:114px; font:700 24px/1 var(--font-body); letter-spacing:.14em; color:#9AA3B8; text-transform:uppercase; }
  .of-ok { position:absolute; left:110px; top:246px; display:flex; align-items:center; gap:16px; font:600 40px/1 var(--font-body); letter-spacing:.04em; color:#C9D0E0; text-transform:uppercase; white-space:nowrap; text-shadow:0 2px 14px rgba(10,14,22,.8); }
  .of-ok .ck { width:46px; height:46px; border-radius:50%; background:rgba(63,191,138,.2); color:#3FBF8A; display:flex; align-items:center; justify-content:center; flex:none; }
  .of-ok b { color:var(--acc); font-weight:800; margin-left:4px; }
  .of-name { position:absolute; left:110px; top:128px; font:700 84px/1 var(--font-display); text-transform:uppercase; color:${CREAM}; letter-spacing:-.005em; white-space:nowrap; text-shadow:0 4px 22px rgba(10,14,22,.7); }
  .of-tag { position:absolute; left:0; top:0; display:flex; align-items:center; gap:10px; padding:12px 20px 12px 14px; border-radius:12px; background:#F6F1E8; color:#1F2532; font:700 24px/1 var(--font-body); letter-spacing:.04em; box-shadow:0 8px 18px rgba(0,0,0,.42); white-space:nowrap; }
  `);
}

const APPCOL = ['#2F6FDE', '#1E9E6A', '#E5565B', '#36A9E8', '#7B6CF6', '#14A8A8', '#4C5BD4', '#D1497A'];
const APPICO = ['file-text', 'table-2', 'presentation', 'mail', 'calendar', 'message-square', 'cloud', 'users'];

/** Wand, Pendelleuchte, Uhr (09:13 – dieselbe Zeit wie später auf der Startseite), Tisch */
function deskSet(E, g, variant) {
  const { h } = E;
  const wall = h('div', { class: 'abs', style: { left: 0, top: -400, width: 1920, height: 1600, background: 'linear-gradient(180deg,#1D2742 0%,#161D31 60%,#10162A 100%)' } });
  const glow = h('div', { class: 'abs', style: { left: 640, top: 40, width: 640, height: 640, background: 'radial-gradient(closest-side, rgba(255,238,208,.20), rgba(255,238,208,0))' } });
  const hx = variant === 1 ? 1060 : 960;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080" style="position:absolute;left:0;top:0;overflow:visible">` +
    `<line x1="${hx}" y1="-400" x2="${hx}" y2="116" stroke="#0B0F18" stroke-width="3"/><path d="M${hx - 80} 168 L${hx - 48} 116 H${hx + 48} L${hx + 80} 168Z" fill="#CFC7B8"/><ellipse cx="${hx}" cy="170" rx="46" ry="8" fill="#FFF1D6"/>` +
    `<g transform="translate(1800 92)"><circle r="56" fill="#E9E4DA" stroke="#0B0F18" stroke-width="5"/>` + [...Array(12)].map((_, k) => `<line x1="0" y1="-46" x2="0" y2="-${k % 3 ? 50 : 42}" stroke="#1F2532" stroke-width="3" transform="rotate(${k * 30})"/>`).join('') +
    `<line x1="0" y1="0" x2="0" y2="-28" stroke="#1F2532" stroke-width="5" stroke-linecap="round" transform="rotate(276.5)"/><line x1="0" y1="0" x2="0" y2="-40" stroke="#1F2532" stroke-width="3.4" stroke-linecap="round" transform="rotate(78)"/><circle r="4" fill="#1F2532"/></g>` +
    (variant === 2 ? '<g fill="rgba(255,255,255,.07)"><rect x="1300" y="260" width="9" height="380"/><rect x="1500" y="260" width="9" height="380"/></g>' : '') +
    `</svg>`;
  const decor = h('div', { class: 'abs', style: { inset: 0 }, html: svg });
  g.append(wall, glow, decor);
}
/** Tischplatte und -front (verdeckt den unteren Teil der Figur), Tasse */
function deskFront(E, g) {
  const { h } = E;
  const slab = h('div', { class: 'abs', style: { left: 560, top: 654, width: 1400, height: 30, background: 'linear-gradient(#46526F,#36405A)', borderTop: '2px solid #5A678A' } });
  const front = h('div', { class: 'abs', style: { left: 560, top: 684, width: 1400, height: 400, background: 'linear-gradient(#1C2438,#121827)' } });
  const mug = h('div', { class: 'abs', style: { left: 1136, top: 606, width: 46, height: 48, borderRadius: '6px 6px 12px 12px', background: '#D9D2C4', boxShadow: 'inset -8px 0 0 rgba(0,0,0,.12)' } });
  const handle = h('div', { class: 'abs', style: { left: 1176, top: 616, width: 20, height: 26, borderRadius: '0 14px 14px 0', border: '6px solid #D9D2C4', borderLeft: 'none' } });
  g.append(slab, front, mug, handle);
}
const scrim = (E) => E.h('div', { class: 'abs', style: { left: 0, top: -400, width: 1100, height: 1600, background: 'linear-gradient(90deg, rgba(12,17,28,.9) 0%, rgba(12,17,28,.78) 42%, rgba(12,17,28,0) 100%)' } });

const blinkAt = (t, seed) => { const ph = (t + seed) % 3.3; return ph < 0.14 ? Math.sin(Math.PI * ph / 0.14) : 0; };
const talkMouth = (t, calm) => ['open', calm ? 'flat' : 'open', 'open', 'flat', calm ? 'smile' : 'wide', 'flat'][Math.floor(t * 7.2) % 6];

/** Baut die drei Büro-Szenen. ctx: { T0, PING, SHOVE } je id; Rückgabe: Liste { update(t) } */
export function buildVignettes(E, root, ctx) {
  css(E);
  const { h, tf, tw, ease, prog, clamp, lerp, show, icon } = E;

  function shell(i, cfg) {
    const g = h('div', { class: 'abs', style: { left: 0, top: 0, width: 1920, height: 1080, transformOrigin: '960px 540px', zIndex: 10 + i, display: 'none' } });
    deskSet(E, g, i);
    const fig = figure(E, cfg.key); Object.assign(fig.el.style, { left: '742px', top: '276px', transform: 'scale(1.45)' }); g.append(fig.el);
    deskFront(E, g);
    const lap = laptop(E); Object.assign(lap.el.style, { left: '1210px', top: '218px', transformOrigin: '0 0', transform: 'scale(.8)' }); g.append(lap.el);
    g.append(scrim(E));
    const name = h('div', { class: 'of-name', text: cfg.name, style: { fontSize: cfg.size + 'px' } });
    const ok = h('div', { class: 'of-ok', style: { '--acc': cfg.acc } }, h('span', { class: 'ck', html: icon('check', 26, '#3FBF8A', 3) }), h('span', { text: cfg.ok }), h('b', { text: 'ABER:' }));
    const who = h('div', { class: 'of-who', text: cfg.who, style: { top: '340px' } });
    const bub = h('div', { class: 'of-bub', text: cfg.say, style: { top: '384px' } });
    g.append(name, ok, who, bub);
    root.append(g);
    return { g, fig, lap, name, ok, who, bub };
  }
  /** gemeinsamer Auftritt / Abgang der ganzen Szene */
  function frame(V, t, T0, SH, P) {
    const a = t - T0, slam = tw(a, 0, 0.4, ease.snap), sh = tw(t, SH, SH + 0.30, ease.uiInOut);
    const on = t >= T0 - 0.02 && t < SH + 0.31;
    show(V.g, on); if (!on) return false;
    tf(V.g, { s: (1.05 - 0.05 * slam) * (1 - 0.06 * sh), y: 90, o: clamp(slam * 4) * (1 - sh) });
    tf(V.name, { y: 18 * (1 - tw(a, 0.05, 0.5, ease.ui)), o: tw(a, 0.05, 0.45) });
    tf(V.ok, { y: 16 * (1 - tw(a, 0.3, 0.7, ease.ui)), o: tw(a, 0.3, 0.65) });
    return true;
  }
  const bubble = (V, t, tIn) => { const p = tw(t, tIn, tIn + 0.4, ease.snap); tf(V.bub, { s: 0.88 + 0.12 * p, o: clamp(p * 2.2) }); tf(V.who, { o: clamp(p * 2.2) }); };

  /* ------------------------------------------------------------ 1 · Tom: Zusatzkosten, Telefon */
  const A1 = (() => {
    const { T0, PING: P, SHOVE: SH } = ctx.m365;
    const V = shell(0, { key: 'tom', name: 'DER ALLROUNDER', size: 84, acc: '#E5565B', ok: 'ALLES AUS EINER HAND.', who: 'Tom · Einkauf', say: 'Jede Erweiterung kostet extra.' });
    // Bildschirm: „Alle Apps“ (generisch), eine Kachel passt nicht ins Raster
    const scr = V.lap.screen; scr.style.background = 'linear-gradient(135deg,#1B2840,#0F1626)';
    scr.append(h('div', { class: 'abs', style: { left: 0, top: 0, right: 0, height: 26, background: 'rgba(255,255,255,.08)' } }));
    const win = h('div', { class: 'abs', style: { left: 60, top: 54, width: 580, height: 372, borderRadius: 12, background: '#F1F3F7', overflow: 'hidden', boxShadow: '0 12px 30px rgba(0,0,0,.45)' } },
      h('div', { class: 'abs', style: { left: 0, top: 0, right: 0, height: 36, background: '#fff', borderBottom: '1.5px solid #E3E7EF', display: 'flex', alignItems: 'center', gap: 8, padding: '0 14px', font: '700 14px/1 var(--font-body)', color: '#59627A' } }, h('i', { style: { width: 10, height: 10, borderRadius: '50%', background: '#D5DAE4', display: 'block' } }), h('i', { style: { width: 10, height: 10, borderRadius: '50%', background: '#D5DAE4', display: 'block' } }), 'Alle Apps'));
    APPCOL.forEach((c, k) => win.append(h('div', { class: 'abs', style: { left: 42 + (k % 4) * 134, top: 66 + Math.floor(k / 4) * 148, width: 110, height: 110, borderRadius: 24, background: c, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 14px rgba(31,37,50,.28)' }, html: icon(APPICO[k], 48, '#fff', 2) })));
    const ghost = h('div', { class: 'abs', style: { left: 42 + 3 * 134 - 5, top: 66 + 148 - 5, width: 120, height: 120, borderRadius: 28, border: '3px dashed rgba(229,86,91,.9)', zIndex: 3 } });
    win.append(ghost); scr.append(win);
    const mb = mini(E, 'chat', 190, 130); Object.assign(mb.style, { left: '610px', top: '300px', transform: 'rotate(3deg)' }); scr.append(mb);
    // Preisschilder fallen auf den Laptop
    const TAGS = [['+ LIZENZ', 1250, 150, -7], ['+ ADD-ON', 1470, 128, 5], ['+ KI-ZUSATZ', 1672, 156, -4]].map(([txt, x, y, r]) => { const el = h('div', { class: 'of-tag', style: { zIndex: 6 } }, h('span', { html: icon('euro', 26, '#E5565B', 2.6) }), txt); V.g.append(el); return { el, x, y, r }; });
    return {
      update(t) {
        if (!frame(V, t, T0, SH, P)) return;
        bubble(V, t, P[1] + 0.1);
        TAGS.forEach((q, k) => { const tt = P[0] + k * 0.11, p = tw(t, tt, tt + 0.5, ease.out3), bounce = Math.abs(Math.sin(p * Math.PI * 1.5)) * (1 - p) * 40; show(q.el, t >= tt - 0.01); tf(q.el, { x: q.x, y: q.y - (1 - p) * 300 - bounce + (t > P[2] ? 4 * Math.sin((t - P[2]) * 5 + k) * Math.exp(-(t - P[2]) * 0.9) : 0), r: q.r, o: clamp(p * 3) }); });
        const sp = tw(t, P[1], P[1] + 0.4, ease.uiInOut), ges = tw(t, P[2], P[2] + 0.35, ease.uiInOut);
        const base = lerpPose('typing', 'phone', sp), g2 = POSE.phoneGest.L;
        const L = [lerp(base.L[0], g2[0], ges), lerp(base.L[1], g2[1], ges) + ges * Math.sin((t - P[2]) * 6.5) * 7];
        const talking = t > P[1] + 0.35 && t < SH - 0.1;
        V.fig.set({ ...base, L, brow: t >= P[0] ? 'angry' : 'neutral', mouth: talking ? talkMouth(t, true) : (t >= P[0] ? 'flat' : 'smile'), look: sp > 0.5 ? [0, 3] : [4, 1], head: { rot: 5 * sp + 2 * ges * Math.sin((t - P[2]) * 3), dx: 0, dy: 0 }, lean: 6 * ges, blink: blinkAt(t, 0.4) });
      },
    };
  })();

  /* ------------------------------------------------------------ 2 · Lena: ein Login – dahinter sieht alles anders aus */
  const A2 = (() => {
    const { T0, PING: P, SHOVE: SH } = ctx.opendesk;
    const V = shell(1, { key: 'lena', name: 'DAS FERTIGE PORTAL', size: 68, acc: '#7B6CF6', ok: 'OFFEN UND LOKAL GEDACHT.', who: 'Lena · Büro', say: 'Ein Login – und dahinter alles anders.' });
    const scr = V.lap.screen; scr.style.background = 'linear-gradient(160deg,#2A2150,#101226)';
    // dahinter: drei sichtbar verschiedene Oberflächen
    const wins = [['mail', 22, 40, 250, 200, -2], ['chat', 282, 70, 250, 190, 2], ['sheet', 540, 40, 250, 210, -1.5], ['files', 60, 270, 250, 190, 2], ['ticket', 340, 280, 250, 190, -2]].map(([k, x, y, w, hh, r]) => { const el = mini(E, k, w, hh); Object.assign(el.style, { left: x + 'px', top: y + 'px', transform: `rotate(${r}deg)` }); scr.append(el); return el; });
    const panel = h('div', { class: 'abs', style: { left: 240, top: 60, width: 330, height: 380, borderRadius: 20, background: '#fff', padding: '30px 26px', transformOrigin: '0 50%', boxShadow: '0 14px 40px rgba(0,0,0,.4)', zIndex: 5 } },
      h('div', { style: { font: '700 26px/1 var(--font-display)', textTransform: 'uppercase', marginBottom: 28, color: '#1F2532' }, text: 'Anmelden' }),
      h('div', { style: { height: 50, borderRadius: 10, background: '#F1F3F7', border: '1.5px solid #E3E7EF', marginBottom: 14 } }), h('div', { style: { height: 50, borderRadius: 10, background: '#F1F3F7', border: '1.5px solid #E3E7EF', marginBottom: 26 } }), h('div', { style: { height: 54, borderRadius: 10, background: '#7B6CF6' } }));
    scr.append(panel);
    const FLOAT = [['files', 1180, 36, 270, 176, -4], ['ticket', 1500, 22, 280, 182, 3], ['chat', 1690, 262, 215, 150, -3]].map(([k, x, y, w, hh, r]) => { const el = mini(E, k, w, hh); Object.assign(el.style, { left: 0, top: 0, zIndex: 6 }); V.g.append(el); return { el, x, y, r }; });
    return {
      update(t) {
        if (!frame(V, t, T0, SH, P)) return;
        bubble(V, t, P[1] + 0.15);
        const door = ease.io3(prog(t, P[0], P[0] + 0.7));
        panel.style.transform = `perspective(900px) rotateY(${(-82 * door).toFixed(2)}deg)`; panel.style.opacity = 1 - 0.95 * door;
        wins.forEach((el, k) => { const tt = P[0] + 0.15 + k * 0.1, p = tw(t, tt, tt + 0.5, ease.snap); show(el, t >= tt); tf(el, { s: 0.7 + 0.3 * p, o: clamp(p * 2), r: [-2, 2, -1.5, 2, -2][k] }); });
        FLOAT.forEach((q, k) => { const tt = P[2] + k * 0.12, p = tw(t, tt, tt + 0.5, ease.snap); show(q.el, t >= tt); tf(q.el, { x: q.x, y: q.y + 8 * Math.sin(t * 2 + k) - 14 * (1 - p), r: q.r, s: 0.6 + 0.4 * p, o: clamp(p * 2) * 0.96 }); });
        const sh = tw(t, P[1], P[1] + 0.4, ease.uiInOut), base = lerpPose('rest', 'shrug', sh);
        const talking = t > P[1] + 0.2 && t < P[1] + 1.7;
        V.fig.set({ ...base, shrug: 8 * sh, brow: t >= T0 + 0.4 ? 'worried' : 'neutral', mouth: talking ? talkMouth(t, true) : 'flat', look: t > P[2] ? [4, -3] : [4, 0], head: { rot: -7 * sh, dx: 0, dy: 0 }, blink: blinkAt(t, 1.3) });
      },
    };
  })();

  /* ------------------------------------------------------------ 3 · Anna: Tab-Flut, Haareraufen */
  const A3 = (() => {
    const { T0, PING: P, SHOVE: SH } = ctx.nextcloud;
    const V = shell(2, { key: 'anna', name: 'DIE OFFENE BASIS', size: 76, acc: '#36A9E8', ok: 'MÄCHTIG UND FREI.', who: 'Anna · Vertrieb', say: 'Welcher Tab war das noch?' });
    // Bildschirm: Browser-Leiste mit wachsender Tab-Zahl über der rohen, grauen Oberfläche (dieselbe wie später beim Zoom)
    const scr = V.lap.screen;
    const ui = buildUI(E), w = ui.window({ raw: true }); w.setActive('Startseite'); w.main.append(ui.home().el);
    w.el.style.transformOrigin = '0 0'; w.el.style.transform = `translate(0px,30px) scale(${(812 / 1480).toFixed(4)})`; scr.append(w.el);
    const strip = h('div', { class: 'abs', style: { left: 0, top: 0, width: 812, height: 30, background: '#E4E8EF', zIndex: 5 } });
    const cols = ['#E5565B', '#7B6CF6', '#36A9E8', '#3FBF8A', '#8E97AE', '#D1497A'];
    const tabs = Array.from({ length: 12 }, (_, k) => { const el = h('div', { class: 'abs', style: { top: 4, height: 26, borderRadius: '8px 8px 0 0', background: '#fff', border: '1px solid #D5DAE4', borderBottom: 'none' } }, h('div', { class: 'abs', style: { left: 7, top: 8, width: 10, height: 10, borderRadius: 3, background: cols[k % 6] } }), h('div', { class: 'abs', style: { left: 22, top: 11, right: 6, height: 5, borderRadius: 2, background: 'rgba(31,37,50,.22)' } })); strip.append(el); return el; });
    scr.append(strip);
    return {
      update(t) {
        if (!frame(V, t, T0, SH, P)) return;
        bubble(V, t, P[1] + 0.1);
        const n = Math.floor(lerp(3, 12, ease.out2(prog(t, P[0], P[0] + 2.4))) + 0.001), wt = Math.min(112, (812 - 20) / n);
        tabs.forEach((el, k) => { show(el, k < n); el.style.left = (8 + k * (wt + 1)) + 'px'; el.style.width = wt + 'px'; });
        const hp = tw(t, P[1], P[1] + 0.45, ease.uiInOut), base = lerpPose('typing', 'hair', hp);
        const pull = t > P[2] ? Math.exp(-(t - P[2]) * 0.8) * 0.5 * (1 + Math.sin((t - P[2]) * 9)) : 0;     // einmal ziehen, klingt aus
        const R = [lerp(base.R[0], POSE.hairPull.R[0], pull), lerp(base.R[1], POSE.hairPull.R[1], pull)], Lh = [lerp(base.L[0], POSE.hairPull.L[0], pull), lerp(base.L[1], POSE.hairPull.L[1], pull)];
        const slump = tw(t, P[2] + 1.0, P[2] + 2.0, ease.io2);
        const talking = t > P[1] + 0.2 && t < P[1] + 1.5;
        V.fig.set({ ...base, L: Lh, R, brow: t >= P[0] ? 'worried' : 'neutral', mouth: talking ? talkMouth(t, false) : (hp > 0.5 ? 'frown' : 'smile'), look: hp > 0.5 ? [2, 2] : [4, 0], head: { rot: -3 * hp + 3 * Math.sin((t - P[2]) * 6) * pull, dx: 0, dy: 8 * slump }, blink: blinkAt(t, 2.1) });
      },
    };
  })();

  return [A1, A2, A3];
}
