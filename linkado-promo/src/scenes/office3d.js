// ============================================================
// Das 3D-Büro (three.js, Vogelperspektive) für Akt I (4,0–17,5 s) und den Übergang in Annas Büro (22,5–30,0 s).
//   4,0–8,5 Tom „Der Allrounder“ · 8,5–13,0 Lena „Das fertige Portal“ · 13,0–17,5 Anna „Die offene Basis“ – ein Büro, die Kamera gleitet von Platz zu Platz
//   22,5–30,0 Übergang: nachts, Annas Platz, Kamera fährt langsam heran und taucht frontal in den Bildschirm; der Zoom landet exakt in Szene 01 (act2.js)
// Die Bildschirme sind DOM (Oberflächen aus ui.js / act1-bits.js), per matrix3d auf die 3D-Monitore projiziert (o3d/domquad.js).
// Alles ist eine reine Funktion der Zeit t. Keine Produkt-/Firmennamen; Figuren sind erfunden.
// ============================================================
import * as THREE from '../vendor/three.module.js';
import { buildUI } from '../ui.js';
import { mini } from './act1-bits.js';
import { buildFigure } from './o3d/figure.js';
import { buildWorld, deskLayout, DESK_H, SEAT_H, MON, EXTRA, SCR_Z, DESKS } from './o3d/world.js';
import { M as M_ } from './o3d/props.js';
import { Actor, scriptTom, scriptLena, scriptAnna, scriptIdle } from './o3d/actors.js';
import { matrixFor } from './o3d/domquad.js';
import { ez, prog, lerp, clamp } from './o3d/anim.js';
import { createPost } from './o3d/post.js';
import { mulberry } from './o3d/gfx.js';

const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const CREAM = '#F4EEE3', W = 1920, H = 1080;
const D2R = Math.PI / 180;
let cssOn = false;
function css(E) {
  if (cssOn) return; cssOn = true;
  E.style(`
  .of-bub { position:absolute; left:110px; max-width:640px; padding:22px 34px 24px; border-radius:34px; background:${CREAM}; color:#1F2532; font:600 46px/1.16 var(--font-body); box-shadow:0 18px 40px rgba(0,0,0,.45); text-wrap:balance; transform-origin:100% 70%; }
  .of-bub::after { content:""; position:absolute; right:-14px; top:58%; width:30px; height:30px; background:${CREAM}; transform:rotate(45deg); border-radius:0 0 8px 0; }
  .of-call { position:absolute; left:114px; display:flex; align-items:center; gap:14px; height:64px; padding:0 26px 0 8px; border-radius:32px; background:#1B3B31; color:#fff; font:700 28px/1 var(--font-body); box-shadow:0 10px 24px rgba(0,0,0,.4); white-space:nowrap; transform-origin:0 50%; }
  .of-call .ic { width:48px; height:48px; border-radius:50%; background:#3FBF8A; display:flex; align-items:center; justify-content:center; flex:none; }
  .of-call small { font:600 24px/1 var(--font-body); color:#B9E7D3; font-variant-numeric:tabular-nums; letter-spacing:.02em; }
  .of-call .eq { display:flex; align-items:center; gap:4px; height:30px; margin-left:4px; } .of-call .eq i { display:block; width:5px; height:8px; border-radius:3px; background:#7BE0B4; }
  .of-bub.re { left:150px; max-width:560px; padding:18px 30px 20px; border-radius:30px; background:#26354A; color:#E9EEF6; font:600 40px/1.16 var(--font-body); box-shadow:0 14px 32px rgba(0,0,0,.4); transform-origin:0% 20%; }
  .of-bub.re::after { display:none; }
  .of-who { position:absolute; left:114px; font:700 24px/1 var(--font-body); letter-spacing:.14em; color:#9AA3B8; text-transform:uppercase; }
  .of-ok { position:absolute; left:110px; display:flex; align-items:center; gap:16px; font:600 40px/1 var(--font-body); letter-spacing:.04em; color:#C9D0E0; text-transform:uppercase; white-space:nowrap; text-shadow:0 2px 14px rgba(10,14,22,.8); }
  .of-ok .ck { width:46px; height:46px; border-radius:50%; background:rgba(63,191,138,.2); color:#3FBF8A; display:flex; align-items:center; justify-content:center; flex:none; }
  .of-ok b { color:var(--acc); font-weight:800; margin-left:4px; }
  .of-name { position:absolute; left:110px; font:700 84px/1 var(--font-display); text-transform:uppercase; color:${CREAM}; letter-spacing:-.005em; white-space:nowrap; text-shadow:0 4px 22px rgba(10,14,22,.7); }
  .of-tag { position:absolute; left:0; top:0; display:flex; align-items:center; gap:10px; padding:12px 20px 12px 14px; border-radius:12px; background:#F6F1E8; color:#1F2532; font:700 24px/1 var(--font-body); letter-spacing:.04em; box-shadow:0 8px 18px rgba(0,0,0,.42); white-space:nowrap; transform-origin:0 0; }
  .o3-host { position:absolute; left:0; top:0; transform-origin:0 0; overflow:hidden; backface-visibility:hidden; }
  .o3-pl { position:absolute; left:0; top:0; transform-origin:0 0; }
  .o3-glass { background: linear-gradient(115deg, rgba(255,255,255,.22) 0%, rgba(255,255,255,.07) 26%, rgba(255,255,255,0) 40%, rgba(255,255,255,0) 70%, rgba(255,255,255,.06) 100%), radial-gradient(130% 120% at 50% 45%, rgba(0,0,0,0) 58%, rgba(6,10,24,.34) 100%); box-shadow: inset 0 0 0 2px rgba(255,255,255,.06), inset 0 0 36px rgba(0,0,0,.28); }
  `);
}

/** Licht-Look (Werte aus Look-Dev-Reihen): Hemisphäre, Umgebung, Schlüssellicht, Füll-/Randlicht, Spots über den Plätzen (Spanne ruhig → im Fokus), Belichtung, Glühen, Bodenfarbe */
const LOOK = { hemi: 1.8, env: 1.0, key: 0.9, fill: 0.5, rim: 0.6, spot: [1.3, 6.6], exposure: 1.25, floor: '#A0A5C0', pr: 1.5 };

const APPCOL = ['#2F6FDE', '#1E9E6A', '#E5565B', '#36A9E8', '#7B6CF6', '#14A8A8', '#4C5BD4', '#D1497A'];
const APPICO = ['file-text', 'table-2', 'presentation', 'mail', 'calendar', 'message-square', 'cloud', 'users'];

/* ---------------------------------------------------------------- Kamera-Einstellungen (echte Vogelperspektive: 60–80° Blickwinkel von oben) */
const mkShot = (tgt, az, el, d, fov = 28, sx = 0, sy = 0) => ({ tgt, az, el, d, fov, sx, sy });
const heroT = (k, dy = 0.95) => { const L = deskLayout(k); return L.mon.clone().lerp(L.seat, 0.42).setY(dy); };      // etwas näher am Bildschirm als an der Person
const SHOTS = {
  over: mkShot(V(0.0, 0.2, -0.6), 0, 79, 25.5, 34, 330, 0),
  tom:  mkShot(heroT('tom'), 6, 60, 4.9, 28, 330, 10),
  lena: mkShot(heroT('lena'), -6, 60, 4.9, 28, 330, 10),
  anna: mkShot(heroT('anna'), 4, 60, 4.9, 28, 330, 10),
};
/** Nahaufnahmen (v7): die Kamera fährt über die Schulter an den Bildschirm heran – von hinten und oben –, damit man das Problem auf dem Bildschirm lesen kann */
const scrC = (k) => deskLayout(k).mon.clone().setY(DESK_H + MON.standH + MON.h / 2 + 0.02);
const closeShot = (k, az, el, d, sx = 430, sy = 0) => mkShot(scrC(k), az, el, d, 28, sx, sy);
SHOTS.tomC = closeShot('tom', 9, 34, 1.85);
SHOTS.lenaC = closeShot('lena', -9, 34, 1.85, 500);
SHOTS.annaC = closeShot('anna', 8, 34, 1.85);
const mixShot = (a, b, p) => ({ tgt: a.tgt.clone().lerp(b.tgt, p), az: lerp(a.az, b.az, p), el: lerp(a.el, b.el, p), d: lerp(a.d, b.d, p), fov: lerp(a.fov, b.fov, p), sx: lerp(a.sx, b.sx, p), sy: lerp(a.sy, b.sy, p) });
const driftShot = (s, k, az = 0.9, dd = -0.05) => ({ ...s, az: s.az + k * az, d: s.d + k * dd, tgt: s.tgt });
const shotPose = (s) => { const az = s.az * D2R, el = s.el * D2R; return { pos: s.tgt.clone().add(V(Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el)).multiplyScalar(s.d)), tgt: s.tgt.clone(), up: V(0, 1, 0), fov: s.fov, sx: s.sx, sy: s.sy }; };

export default function register(E) {
  css(E);
  const { h, tf, tw, ease, show, icon } = E;
  const hit = (kind, v) => E.hits(kind, v).map((x) => x.t);
  const T0 = { tom: hit('card', 1)[0], lena: hit('card', 2)[0], anna: hit('card', 3)[0] };
  const PING = { tom: hit('ping', 1), lena: hit('ping', 2), anna: hit('ping', 3) };
  const SHOVE = { tom: hit('shove', 1)[0], lena: hit('shove', 2)[0], anna: hit('shove', 3)[0] };
  const CUT = E.hits('cut')[0].t, DROP = E.hits('drop')[0].t, DT = DROP - 30.0, TIN = 22.5 + DT;      // DT: Verschiebung des Übergangs gegenüber der Urfassung (6,0 s)

  const api = { ready: false, dbg: {} };
  E.o3d = api;

  /* ---------------------------------------------------------------- Kamerafahrt Akt I */
  const GLIDES = E.hits('glide').filter((g) => g.t < CUT).map((g) => [g.t, g.end]);       // Gleitfahrten Tom → Lena, Lena → Anna
  const SCN = [['tom', T0.tom, T0.tom + 1.4], ['lena', T0.lena, GLIDES[0][1]], ['anna', T0.anna, GLIDES[1][1]]];                   // [Person, Kartenschlag, Ankunft in der Halbnahen]
  const PUSH = [2.6, 3.6];                                                                // Einfahrt zur Nahaufnahme: Kartenschlag + 2,6 … + 3,6 s
  const within = (i, t) => {
    const [key, c, arr] = SCN[i], hero = driftShot(SHOTS[key], Math.max(0, t - arr), 0.7), close = driftShot(SHOTS[key + 'C'], Math.max(0, t - (c + PUSH[1])), 0.5);
    return mixShot(hero, close, ez.io2(prog(t, c + PUSH[0], c + PUSH[1])));
  };
  function shotAt(t) {
    if (t < SCN[0][2]) return mixShot(SHOTS.over, within(0, SCN[0][2]), ez.out3(prog(t, T0.tom, SCN[0][2])));
    for (let i = 0; i < 3; i++) {
      const g = GLIDES[i];
      if (!g || t < g[0]) return within(i, t);
      if (t < g[1]) { const p = ez.io2(prog(t, g[0], g[1])), s = mixShot(within(i, g[0]), within(i + 1, g[1]), p), a = Math.sin(Math.PI * p); s.el += 12 * a; s.d += 3.2 * a; return s; }
    }
    return within(2, t);
  }

  E.scene({
    id: 'o3d', start: T0.tom - 0.05, end: DROP + 0.5, z: 3,
    build(root) {
      const canvas = h('canvas', { style: { position: 'absolute', left: 0, top: 0, width: W + 'px', height: H + 'px' } });
      root.append(canvas);
      const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: true });
      if (window.__SORT !== false && renderer.setOpaqueSort) renderer.setOpaqueSort((a, b) => a.groupOrder - b.groupOrder || a.renderOrder - b.renderOrder || a.z - b.z || a.id - b.id);   // Vorne nach hinten → weniger Überzeichnung (früher Tiefentest)
      const PR = Math.min(window.devicePixelRatio || 1, window.__PR || LOOK.pr); renderer.setPixelRatio(PR); renderer.setSize(W, H, false);
      renderer.shadowMap.enabled = true; renderer.shadowMap.type = window.__SHADOW === 'vsm' ? THREE.VSMShadowMap : THREE.PCFShadowMap; renderer.toneMapping = THREE.NoToneMapping;
      const world = buildWorld(renderer), camera = new THREE.PerspectiveCamera(28, W / H, 0.1, 160);
      world.scene.add(camera);
      const post = createPost(renderer, world.scene, camera, W, H, PR);

      /* Figuren */
      const SC = { tom: scriptTom, lena: scriptLena, anna: scriptAnna };
      const actors = {};
      ['tom', 'lena', 'anna'].forEach((k, i) => { const fig = buildFigure(k); world.scene.add(fig.group); actors[k] = new Actor(k, fig, SC[k], { seed: 3 + i * 5 }); });
      const extras = EXTRA.map((k, i) => { const fig = buildFigure(k); world.scene.add(fig.group); return new Actor(k, fig, scriptIdle, { seed: 41 + i * 7, sip: i % 2 === 0, off: i * 2.7 }); });

      /* Schichten */
      const scrim = h('div', { class: 'abs', style: { left: 0, top: 0, width: 1250, height: 1080, background: 'linear-gradient(90deg, rgba(12,17,28,.88) 0%, rgba(12,17,28,.74) 40%, rgba(12,17,28,0) 100%)' } });
      const hostLayer = h('div', { class: 'abs', style: { inset: 0, pointerEvents: 'none' } }), planeLayer = h('div', { class: 'abs', style: { inset: 0, pointerEvents: 'none' } }), textLayer = h('div', { class: 'abs', style: { inset: 0 } });
      root.append(scrim, hostLayer, planeLayer, textLayer);

      /* ---- Bildschirm-Inhalte (DOM 812 × 546 je Monitor) ---- */
      const mkHost = () => { const el = h('div', { class: 'o3-host', style: { width: '812px', height: '546px', background: '#101828', display: 'none' } }); hostLayer.append(el); return el; };
      const addGlass = (el) => el.append(h('div', { class: 'abs o3-glass', style: { left: 0, top: 0, width: 812, height: 546, zIndex: 50, pointerEvents: 'none' } }));
      const hosts = { tom: mkHost(), lena: mkHost(), anna: mkHost() };
      Object.values(hosts).forEach(addGlass);
      // Tom: „Alle Apps“ (generisch), eine Kachel passt nicht ins Raster
      const tomUI = (() => { const host = hosts.tom, scr = h('div', { class: 'abs', style: { inset: 0 } }); host.append(scr); scr.style.background = 'linear-gradient(135deg,#1B2840,#0F1626)';
        scr.append(h('div', { class: 'abs', style: { left: 0, top: 0, right: 0, height: 26, background: 'rgba(255,255,255,.08)' } }));
        const win = h('div', { class: 'abs', style: { left: 40, top: 62, width: 600, height: 400, borderRadius: 12, background: '#F1F3F7', overflow: 'hidden', boxShadow: '0 12px 30px rgba(0,0,0,.45)' } },
          h('div', { class: 'abs', style: { left: 0, top: 0, right: 0, height: 38, background: '#fff', borderBottom: '1.5px solid #E3E7EF', display: 'flex', alignItems: 'center', gap: 8, padding: '0 14px', font: '700 15px/1 var(--font-body)', color: '#59627A' } }, h('i', { style: { width: 10, height: 10, borderRadius: '50%', background: '#D5DAE4', display: 'block' } }), h('i', { style: { width: 10, height: 10, borderRadius: '50%', background: '#D5DAE4', display: 'block' } }), 'Alle Apps'));
        APPCOL.forEach((c, k) => win.append(h('div', { class: 'abs', style: { left: 46 + (k % 4) * 138, top: 72 + Math.floor(k / 4) * 158, width: 116, height: 116, borderRadius: 26, background: c, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 14px rgba(31,37,50,.28)' }, html: icon(APPICO[k], 52, '#fff', 2) })));
        win.append(h('div', { class: 'abs', style: { left: 46 + 3 * 138 - 5, top: 72 + 158 - 5, width: 126, height: 126, borderRadius: 30, border: '3px dashed rgba(229,86,91,.9)', zIndex: 3 } }));
        scr.append(win);
        const mb = mini(E, 'chat', 200, 138); Object.assign(mb.style, { left: '606px', top: '330px', transform: 'rotate(3deg)' }); scr.append(mb);
        // Abo-Übersicht: die Folge von „alles aus einer Hand“ – jeder Baustein pro Nutzer, im Jahresabo, mit Aufpreis (ohne Beträge); der Balken wächst mit jedem Schild
        const abo = h('div', { class: 'abs', style: { inset: 0, background: '#F4F5F8', zIndex: 6, opacity: 0, display: 'none' } });
        abo.append(h('div', { class: 'abs', style: { left: 0, top: 0, right: 0, height: 78, background: '#1F2532', color: '#fff', display: 'flex', alignItems: 'center', gap: 18, padding: '0 28px', font: '700 30px/1 var(--font-display)', textTransform: 'uppercase', letterSpacing: '.03em' } },
          'Abo-Übersicht', h('span', { text: 'Preisanpassung zum 1. Juli', style: { marginLeft: 'auto', font: '700 17px/1 var(--font-body)', textTransform: 'none', letterSpacing: '.02em', background: '#F2B23C', color: '#3A2A06', padding: '10px 16px', borderRadius: 20 } })));
        const ROWS = [['Basis-Abo', '#1F2532', '▲ Preis angepasst', '#F2B23C', '#3A2A06'], ['KI-Zusatz', '#E5565B', '+ extra', '#E5565B', '#fff'], ['Telefonie', '#E67E22', '+ extra', '#E67E22', '#fff'], ['Zusatzspeicher', '#D1497A', '+ extra', '#D1497A', '#fff']];
        const rows = ROWS.map(([name, dot, chip, cbg, cfg], i) => { const el = h('div', { class: 'abs', style: { left: 28, right: 28, top: 98 + i * 72, height: 60, borderRadius: 14, background: '#fff', boxShadow: '0 4px 12px rgba(31,37,50,.1)', display: 'flex', alignItems: 'center', gap: 16, padding: '0 18px', opacity: 0 } },
          h('i', { style: { width: 16, height: 16, borderRadius: 5, background: dot, display: 'block', flex: 'none' } }),
          h('div', {}, h('div', { text: name, style: { font: '700 24px/1.1 var(--font-body)', color: '#1F2532' } }), h('div', { text: 'pro Nutzer / Monat · Jahresabo', style: { font: '500 15px/1.2 var(--font-body)', color: '#6B7385', marginTop: 3 } })),
          h('span', { text: chip, style: { marginLeft: 'auto', font: '700 18px/1 var(--font-body)', background: cbg, color: cfg, padding: '10px 16px', borderRadius: 20, whiteSpace: 'nowrap' } })); abo.append(el); return el; });
        const SEGW = [300, 130, 110, 90], segs = ROWS.map(([, dot], i) => h('i', { style: { display: 'block', height: 34, width: '0px', background: dot, borderRadius: i === 0 ? '8px 0 0 8px' : i === 3 ? '0 8px 8px 0' : '0' } }));
        abo.append(h('div', { class: 'abs', style: { left: 28, right: 28, top: 398, height: 110 } }, h('div', { text: 'Kosten pro Nutzer ▲', style: { font: '700 17px/1 var(--font-body)', letterSpacing: '.1em', color: '#6B7385', textTransform: 'uppercase', marginBottom: 14 } }), h('div', { style: { display: 'flex' } }, ...segs)));
        host.append(abo);
        const toast = h('div', { class: 'abs', style: { left: 150, top: 14, width: 520, height: 62, borderRadius: 14, background: '#fff', boxShadow: '0 12px 28px rgba(0,0,0,.4)', display: 'flex', alignItems: 'center', gap: 14, padding: '0 18px', zIndex: 7, opacity: 0, font: '700 22px/1.1 var(--font-body)', color: '#1F2532' } }, h('span', { html: icon('mail', 28, '#E5565B', 2.4) }), 'Preisanpassung zum 1. Juli'); host.append(toast);
        return { apps: scr, abo, rows, segs, SEGW, toast }; })();
      // Lena: Anmeldefeld (klappt wie eine Tür auf) → fünf unterschiedliche Oberflächen
      const lenaUI = (() => { const scr = hosts.lena; scr.style.background = 'linear-gradient(160deg,#2A2150,#101226)';
        const wins = [['mail', 22, 44, 262, 210, -2], ['chat', 300, 76, 262, 200, 2], ['sheet', 566, 44, 232, 220, -1.5], ['files', 50, 290, 262, 200, 2], ['ticket', 340, 300, 262, 200, -2]].map(([k, x, y, w, hh, r]) => { const el = mini(E, k, w, hh); Object.assign(el.style, { left: x + 'px', top: y + 'px', transform: `rotate(${r}deg)` }); scr.append(el); return { el, r }; });
        const panel = h('div', { class: 'abs', style: { left: 240, top: 72, width: 340, height: 400, borderRadius: 20, background: '#fff', padding: '30px 26px', transformOrigin: '0 50%', boxShadow: '0 14px 40px rgba(0,0,0,.4)', zIndex: 5 } },
          h('div', { style: { font: '700 28px/1 var(--font-display)', textTransform: 'uppercase', marginBottom: 28, color: '#1F2532' }, text: 'Anmelden' }),
          h('div', { style: { height: 50, borderRadius: 10, background: '#F1F3F7', border: '1.5px solid #E3E7EF', marginBottom: 14 } }), h('div', { style: { height: 50, borderRadius: 10, background: '#F1F3F7', border: '1.5px solid #E3E7EF', marginBottom: 26 } }), h('div', { style: { height: 56, borderRadius: 10, background: '#7B6CF6' } }));
        scr.append(panel); return { wins, panel }; })();
      // Anna: rohe, graue Oberfläche (dieselbe wie später im Übergang) + Browser-Leiste mit wachsender Tab-Zahl
      const TABN = ['Mail', 'Kalender', 'Dateien', 'Chat', 'Aufgaben', 'Wiki', 'Tabelle', 'Formular', 'Angebote', 'Kontakte', 'Tickets', 'Notizen'];
      const annaUI = (() => { const scr = hosts.anna; const ui = buildUI(E), w = ui.window({ raw: true }); w.setActive('Startseite'); w.main.append(ui.home().el);
        w.el.style.transformOrigin = '0 0'; w.el.style.transform = `translate(0px,32px) scale(${(812 / 1480).toFixed(4)})`; scr.append(w.el);
        const strip = h('div', { class: 'abs', style: { left: 0, top: 0, width: 812, height: 32, background: '#E4E8EF', zIndex: 5 } });
        const cols = ['#E5565B', '#7B6CF6', '#36A9E8', '#3FBF8A', '#8E97AE', '#D1497A'];
        const tabs = Array.from({ length: 12 }, (_, k) => { const el = h('div', { class: 'abs', style: { top: 4, height: 28, borderRadius: '8px 8px 0 0', background: '#fff', border: '1px solid #D5DAE4', borderBottom: 'none' } }, h('div', { class: 'abs', style: { left: 7, top: 9, width: 10, height: 10, borderRadius: 3, background: cols[k % 6] } }), h('div', { class: 'abs', style: { left: 21, top: 8, right: 3, font: '600 11px/14px var(--font-body)', color: '#4A5266', overflow: 'hidden', whiteSpace: 'nowrap' }, text: TABN[k] })); strip.append(el); return el; });
        const tip = h('div', { class: 'abs', style: { top: 42, left: 0, padding: '8px 12px', borderRadius: 8, background: '#1F2532', color: '#fff', font: '600 17px/1 var(--font-body)', whiteSpace: 'nowrap', zIndex: 8, opacity: 0, boxShadow: '0 6px 16px rgba(0,0,0,.3)' } });
        const cur = h('div', { class: 'abs', style: { left: 0, top: 0, width: 26, height: 26, zIndex: 9, opacity: 0, filter: 'drop-shadow(0 2px 3px rgba(0,0,0,.4))' }, html: '<svg viewBox="0 0 24 24" width="26" height="26"><path d="M3 2 L3 19 L8 14.5 L11.5 22 L14.5 20.7 L11 13.3 L17.5 13 Z" fill="#fff" stroke="#1F2532" stroke-width="1.6" stroke-linejoin="round"/></svg>' });
        scr.append(strip, tip, cur); return { tabs, tip, cur }; })();

      /* ---- Schwebende Fenster/Schilder (DOM-Flächen im Raum) ---- */
      const planes = [];
      const mkPlane = (el, wpx, hpx, wm) => { el.classList.add('o3-pl'); el.style.display = 'none'; planeLayer.append(el); const p = { el, wpx, hpx, wm, c: V(), roll: 0, scale: 1 }; planes.push(p); return p; };
      const tomTags = [['+ KI-OPTION', 232], ['+ TELEFONIE', 240], ['+ SPEICHER', 226]].map(([txt, w]) => { const el = h('div', { class: 'of-tag', style: { width: w + 'px', height: '52px', boxSizing: 'border-box' } }, h('span', { html: icon('euro', 26, '#E5565B', 2.6) }), txt); return mkPlane(el, w, 52, 0.30 * w / 200); });
      const mkPill = ([txt, icn, col, w]) => { const el = h('div', { class: 'of-tag', style: { width: w + 'px', height: '52px', boxSizing: 'border-box' } }, h('span', { html: icon(icn, 26, col, 2.6) }), txt); return mkPlane(el, w, 52, 0.30 * w / 200); };
      const lenaPills = [['ANDERE SUCHE', 'search', '#7B6CF6', 256], ['ANDERES MENÜ', 'menu', '#7B6CF6', 258], ['ANDERE KNÖPFE', 'mouse-pointer-click', '#7B6CF6', 276]].map(mkPill);      // Beschriftungen der Nahaufnahme: was an den fünf Oberflächen jeweils anders ist
      const annaPills = [['12 TABS OFFEN', 'app-window', '#36A9E8', 272], ['OBERFLÄCHE ROH', 'wrench', '#36A9E8', 288], ['UPDATES: SELBST', 'refresh-cw', '#36A9E8', 304]].map(mkPill);

      /* ---- Texte ---- */
      const mkText = (cfg) => {
        const name = h('div', { class: 'of-name', text: cfg.name, style: { fontSize: cfg.size + 'px', top: '232px' } });
        const ok = h('div', { class: 'of-ok', style: { '--acc': cfg.acc, top: '350px' } }, h('span', { class: 'ck', html: icon('check', 26, '#3FBF8A', 3) }), h('span', { text: cfg.ok }), h('b', { text: 'ABER:' }));
        const who = h('div', { class: 'of-who', text: cfg.who, style: { top: '444px' } });
        const bub = h('div', { class: 'of-bub', text: cfg.say, style: { top: '488px' } });
        const out = { name, ok, who, bub };
        if (cfg.say2) { out.bub2 = h('div', { class: 'of-bub re', text: cfg.say2, style: { top: '764px' } }); textLayer.append(out.bub2); }
        if (cfg.call) {                                                   // Telefonat: wer am anderen Ende ist, ohne Lesezeit (kleine Pille unter der Blase)
          const bars = Array.from({ length: 4 }, () => h('i')), time = h('small', { text: '02:14' });
          out.call = h('div', { class: 'of-call', style: { top: '672px' } }, h('span', { class: 'ic', html: icon('phone', 24, '#fff', 2.6) }), h('span', { text: cfg.call }), time, h('span', { class: 'eq' }, ...bars));
          Object.defineProperty(out, 'fx', { value: { bars, time }, enumerable: false });      // nicht aufzählbar: show() läuft nur über die Elemente
        }
        textLayer.append(name, ok, who, bub); if (out.call) textLayer.append(out.call); return out;
      };
      const TXT = {
        tom: mkText({ name: 'DER ALLROUNDER', size: 84, acc: '#E5565B', ok: 'ALLES AUS EINER HAND.', who: 'Tom · Einkauf', say: 'Die KI kostet extra? Pro Nutzer?!', say2: 'Ja. Und nur im Jahresabo.', call: 'IT-Service' }),
        lena: mkText({ name: 'DAS FERTIGE PORTAL', size: 68, acc: '#7B6CF6', ok: 'OFFEN UND LOKAL GEDACHT.', who: 'Lena · Büro', say: 'Ein Login – aber überall andere Knöpfe.' }),
        anna: mkText({ name: 'DIE OFFENE BASIS', size: 76, acc: '#36A9E8', ok: 'MÄCHTIG UND FREI.', who: 'Anna · Vertrieb', say: 'Alles drin – nur welcher Tab war das noch?' }),
      };

      /* ---- Bildschirm-Anker (Welt) ---- */
      const MW = MON.w / 2, MH = MON.h / 2;
      const scrCorners = {}, scrNormal = {};
      for (const k of ['tom', 'lena', 'anna']) {
        const hd = world.desks[k].monHead; hd.updateWorldMatrix(true, false);
        scrCorners[k] = [[-MW, MH], [MW, MH], [MW, -MH], [-MW, -MH]].map(([x, y]) => V(x, y, SCR_Z).applyMatrix4(hd.matrixWorld));
        scrNormal[k] = V(0, 0, 1).applyQuaternion(hd.getWorldQuaternion(new THREE.Quaternion()));
      }
      const scrCenter = (k) => scrCorners[k][0].clone().add(scrCorners[k][2]).multiplyScalar(0.5);

      /* ---- Übergangs-Kamera (nachts): von weit oben bis frontal vor den Bildschirm, Landung exakt in Szene 01 ---- */
      const FIN = { w: 1036, cx: 1390, cy: 146.8 + 697.2 / 2 };
      const hdA = world.desks.anna.monHead; const qA = hdA.getWorldQuaternion(new THREE.Quaternion());
      const Cn = scrCenter('anna'), Nn = V(0, 0, 1).applyQuaternion(qA), Upn = V(0, 1, 0).applyQuaternion(qA);
      const FOVF = 30, fpx = (H / 2) / Math.tan(FOVF * D2R / 2), dF = MON.w * fpx / FIN.w;
      const finalPose = { pos: Cn.clone().addScaledVector(Nn, dF), tgt: Cn.clone(), up: Upn, fov: FOVF, sx: FIN.cx - W / 2, sy: FIN.cy - H / 2 };
      const T_Z0 = 22.6 + DT;
      /* Kamerabogen: Schlüsselbilder (Ziel, Azimut, Höhenwinkel, Abstand, Brennweite, Linsenverschiebung) mit weichem Hermite-Verlauf; am Ende beschleunigt die Fahrt (Sog) und landet exakt in „full“ */
      const finalShot = mkShot(Cn.clone(), Math.atan2(Nn.x, Nn.z) / D2R, Math.asin(clamp(Nn.y, -1, 1)) / D2R, dF, FOVF, FIN.cx - W / 2, FIN.cy - H / 2);
      const phoneW = world.desks.anna.L.toW(world.desks.anna.L.monX + 0.52, DESK_H + 0.10, 0.10);                    // Handy im Ständer rechts neben dem Monitor
      const midT = (k) => Cn.clone().lerp(phoneW, k).add(V(0, -0.06, 0));
      const KEYS = [
        [T_Z0, mkShot(heroT('anna', 0.8), 4, 74, 9.5, 30, 0, 90)],                           // hoch über Annas Platz
        [T_Z0 + 2.6, mkShot(midT(0.45), 5, 52, 4.2, 30, 150, 30)],                          // Frage steht: Platz mit Bildschirm und Handy
        [DROP - 2.7, mkShot(midT(0.30), 3, 30, 2.5, 30, 160, 10)],                          // über Annas Schulter: Bildschirm und Handy nebeneinander
        [DROP, finalShot],
      ];
      const KP = KEYS.map(([t, k]) => ({ t, p: [k.tgt.x, k.tgt.y, k.tgt.z, k.az, k.el, k.d, k.fov, k.sx, k.sy] }));
      const KM = KP.map((k, i) => { const a = KP[Math.max(0, i - 1)], b = KP[Math.min(KP.length - 1, i + 1)], dt = Math.max(1e-6, b.t - a.t), f = i === 0 ? 0.55 : i === KP.length - 1 ? 1.6 : 1; return k.p.map((_, j) => f * (b.p[j] - a.p[j]) / dt); });
      const transShot = (t) => {
        if (t <= KP[0].t) return KEYS[0][1]; if (t >= KP[KP.length - 1].t) return finalShot;
        let i = 0; while (t >= KP[i + 1].t) i++;
        const hh = KP[i + 1].t - KP[i].t, u = (t - KP[i].t) / hh, u2 = u * u, u3 = u2 * u, h00 = 2 * u3 - 3 * u2 + 1, h10 = u3 - 2 * u2 + u, h01 = -2 * u3 + 3 * u2, h11 = u3 - u2;
        const pp = KP[i].p.map((_, j) => h00 * KP[i].p[j] + h10 * hh * KM[i][j] + h01 * KP[i + 1].p[j] + h11 * hh * KM[i + 1][j]);
        return mkShot(V(pp[0], pp[1], pp[2]), pp[3], pp[4], pp[5], pp[6], pp[7], pp[8]);
      };
      const transPose = (t) => shotPose(transShot(t));

      /* Staub im Licht des Bildschirms: wenige, sehr weiche Partikel, die langsam steigen (deterministisch aus t) */
      const motes = (() => {
        const N = 150, r = mulberry(31), base = [], geo = new THREE.BufferGeometry(), arr = new Float32Array(N * 3);
        for (let i = 0; i < N; i++) base.push([(r() - 0.5) * 1.5, r(), (r() - 0.5) * 1.2, r() * 6.28, 0.6 + r() * 0.8]);
        geo.setAttribute('position', new THREE.BufferAttribute(arr, 3));
        const pts = new THREE.Points(geo, new THREE.PointsMaterial({ size: 0.014, map: M_.glowTex, color: '#FFD9A8', transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true, toneMapped: false }));
        pts.frustumCulled = false; pts.userData.noAO = true; world.scene.add(pts);
        const bs = Cn.clone().add(V(0, -0.12, 0.35));
        pts.userData.update = (t, op) => { pts.material.opacity = op; pts.visible = op > 0.004; for (let i = 0; i < N; i++) { const b = base[i], y = ((b[1] + t * 0.018 * b[4]) % 1); arr[i * 3] = bs.x + b[0] + Math.sin(t * 0.35 * b[4] + b[3]) * 0.05; arr[i * 3 + 1] = bs.y + y * 0.9; arr[i * 3 + 2] = bs.z + b[2] + Math.cos(t * 0.3 * b[4] + b[3]) * 0.05; } geo.attributes.position.needsUpdate = true; };
        return pts;
      })();

      const setCamera = (pose) => {
        camera.position.copy(pose.pos); camera.up.copy(pose.up); camera.lookAt(pose.tgt); camera.fov = pose.fov; camera.updateProjectionMatrix();
        const pm = camera.projectionMatrix.elements; pm[8] += -2 * pose.sx / W; pm[9] += 2 * pose.sy / H; camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();
        camera.updateMatrixWorld(true);
      };
      const tmpV = new THREE.Vector3();
      const projPx = (p, out) => { tmpV.copy(p).applyMatrix4(camera.matrixWorldInverse); const z = tmpV.z; tmpV.applyMatrix4(camera.projectionMatrix); out[0] = (tmpV.x * 0.5 + 0.5) * W; out[1] = (-tmpV.y * 0.5 + 0.5) * H; out[2] = z; return out; };
      const quadPx = (corners) => { const q = corners.map((c) => projPx(c, [0, 0, 0])); return q; };

      Object.assign(api, { ready: true, world, camera, actors, setCamera, quadPx, scrCorners, scrNormal, transPose, FIN });
      api.trans = (tG) => {                                           // Übergang: Bildschirm- und Handy-Viereck in Pixeln (für act2.js)
        setCamera(transPose(tG));
        const q = quadPx(scrCorners.anna), f = actors.anna.fig;
        let phoneQuad = null;
        if (f.phone.visible) { f.phone.updateWorldMatrix(true, false); phoneQuad = quadPx([[-0.036, 0.0046, -0.074], [0.036, 0.0046, -0.074], [0.036, 0.0046, 0.074], [-0.036, 0.0046, 0.074]].map(([x, y, z]) => V(x, y, z).applyMatrix4(f.phone.matrixWorld))); }
        return { quad: q, phoneQuad, scale: Math.hypot(q[1][0] - q[0][0], q[1][1] - q[0][1]) / 1480 };
      };
      return { renderer, post, canvas, world, camera, actors, extras, hosts, motes, lenaUI, annaUI, tomUI, planes, tomTags, lenaPills, annaPills, TXT, scrim, hostLayer, planeLayer, textLayer, setCamera, projPx, quadPx, scrCorners, scrNormal, scrCenter, transPose };
    },

    update(t, s) {
      const { renderer, world, camera, actors, hosts, TXT } = s;
      const trans = t >= TIN - 0.1, vignettes = t >= T0.tom - 0.05 && t < T0.anna + 6.75;
      const live = vignettes || trans;
      s.canvas.style.display = live ? 'block' : 'none';
      [s.scrim, s.hostLayer, s.planeLayer, s.textLayer].forEach((el) => show(el, live));
      if (!live) { Object.values(hosts).forEach((el) => { el.style.display = 'none'; }); return; }

      /* ---- Kamera ---- */
      let pose;
      if (api.override) { const o = api.override; pose = shotPose({ ...o, tgt: V(...o.tgt), sx: o.sx || 0, sy: o.sy || 0, fov: o.fov || 28 }); }
      else if (trans) pose = s.transPose(t); else { const sh = shotAt(t), p = shotPose(sh); pose = p; }
      s.setCamera(pose);
      const camPos = pose.pos;

      /* ---- Licht ---- */
      const wFocus = { tom: 0, lena: 0, anna: 0 };
      if (trans) wFocus.anna = 1;
      else { const ov = ez.out3(prog(t, T0.tom, SCN[0][2])); const a = ez.io2(prog(t, GLIDES[0][0], GLIDES[0][1])), b = ez.io2(prog(t, GLIDES[1][0], GLIDES[1][1])); wFocus.tom = (1 - ov) * 0.45 + ov * (1 - a); wFocus.lena = a * (1 - b) + (1 - ov) * 0.45; wFocus.anna = b + (1 - ov) * 0.45; }
      const L = world.lights, dist = pose.pos.distanceTo(pose.tgt), DB = api.dbg, K = LOOK, HK = ['tom', 'lena', 'anna'];
      // ein Spot + ein Punktlicht folgen dem Platz im Fokus (Gewichte aus der Kamerafahrt); die anderen Plätze bekommen nur weiche Lichtflecke
      { const sum = wFocus.tom + wFocus.lena + wFocus.anna || 1, sp = V(), st = V(), gp = V(); let wmax = 0;
        HK.forEach((k) => { const w = wFocus[k] / sum, d = world.desks[k]; sp.addScaledVector(d.spotPos, w); st.addScaledVector(d.spotTgt, w); gp.addScaledVector(d.glowPos, w); wmax = Math.max(wmax, wFocus[k]); });
        L.spot.position.copy(sp); L.spot.target.position.copy(st); L.spot.target.updateMatrixWorld(); L.spot.intensity = (trans ? K.spot[1] * 1.0 : K.spot[1]) * clamp((wmax - 0.45) / 0.5) * (DB.spotK ?? 1); L.spot.color.set(trans ? '#FFD9B0' : '#FFE9D2');
        L.glow.position.copy(gp); L.glow.intensity = (trans ? 2.4 : 1.1) * clamp((wmax - 0.45) / 0.5);
        HK.forEach((k) => { const d = world.desks[k], w = clamp(wFocus[k]); d.pool.material.opacity = (trans ? 0.22 : 0.20) * (0.35 + 0.65 * w) * (DB.poolK ?? 1); d.halo.material.opacity = (trans ? 0.8 : 0.6) * (0.5 + 0.5 * w); d.screenGlow.material.opacity = (trans ? 0.5 : 0.3) * (0.4 + 0.6 * w); }); }
      const wide = clamp((dist - 9) / 14);                    // Totale/Kamerafahrt: Raum insgesamt etwas heller, damit das ganze Büro lesbar bleibt
      L.hemi.intensity = (trans ? K.hemi * 0.5 : K.hemi) * (1 + (DB.wideH ?? 0.8) * wide) * (DB.hemiK ?? 1); L.rim.intensity = (trans ? K.rim * 0.8 : K.rim) * (DB.rimK ?? 1); L.fill.intensity = (trans ? K.fill * 0.5 : K.fill) * (DB.fillK ?? 1);
      { const ei = (trans ? K.env * 0.65 : K.env) * (DB.envK ?? 1); for (const m of [M_.alu, M_.aluDark, M_.mon, M_.glassScreen, M_.glassWall]) m.envMapIntensity = ei; }
      world.AO.uAOon.value = DB.ao ?? 1; world.AO.uAOk.value = DB.aok ?? 1;
      world.floorMat.color.set(DB.floorColor || K.floor);
      const ft = trans ? s.scrCenter('anna') : pose.tgt;
      world.focus(ft.clone().setY(0.8), (trans ? K.key * 0.5 : K.key) * (DB.keyK ?? 1), clamp(dist * 0.55, 3.8, 14));

      /* ---- Darsteller*innen ---- */
      const ctx = { camPos, t };
      for (const k of ['tom', 'lena', 'anna']) { actors[k].update(t, ctx); world.desks[k].chair.rotation.y = actors[k].yawNow - world.desks[k].L.D.yaw; }          // der Stuhl dreht mit
      s.extras.forEach((a) => a.update(t, ctx));

      /* ---- Bildschirm-Glühen (Farbe der Seite → Licht im Gesicht und auf dem Tisch) ---- */
      L.glow.color.set('#9FB4FF');
      if (trans) { const warm = ez.io2(prog(t, 27.6 + DT, 28.7 + DT)); L.glow.color.set('#9FB4FF').lerp(new THREE.Color('#FFA85C'), warm); L.glow.intensity = lerp(2.2, 4.2, warm); world.desks.anna.screenGlow.material.color.set('#9FB4FF').lerp(new THREE.Color('#FFB070'), warm); world.desks.anna.screenGlow.material.opacity = lerp(0.45, 0.8, warm);
        const dn = world.desks.anna; dn.phoneGlow.material.opacity = 0.55 * ez.io2(prog(t, 25.2 + DT, 28.5 + DT)) * (0.6 + 0.4 * warm); s.motes.userData.update(t, (0.18 + 0.5 * warm) * tw(t, TIN, TIN + 1.0)); }
      else { world.desks.anna.phoneGlow.material.opacity = 0; s.motes.userData.update(t, 0); }

      /* ---- Bildschirme: DOM auf die 3D-Flächen ---- */
      const q = [0, 0, 0];
      for (const k of ['tom', 'lena', 'anna']) {
        const el = hosts[k], c = s.scrCenter(k), vis = !(trans && k === 'anna') && scrNormalDot(s, k, camPos) > 0.12;
        if (!vis) { el.style.display = 'none'; continue; }
        const quad = s.quadPx(s.scrCorners[k]);
        if (quad.some((p) => p[2] > -0.2)) { el.style.display = 'none'; continue; }
        el.style.display = 'block'; el.style.transform = matrixFor(0, 0, 812, 546, quad.map((p) => [p[0], p[1]]));
      }
      /* Bildschirm-Inhalte */
      updateContent(s, t);
      /* Schilder, Fenster, Texte */
      updatePlanes(s, t, camera);
      updateTexts(s, t);
      /* ---- Zeichnen ---- */
      const fadeIn = tw(t, T0.tom, T0.tom + 0.25, ease.out2), fadeOut = 1 - tw(t, T0.anna + 6.2, T0.anna + 6.75, ease.in2);
      const tIn = tw(t, TIN, TIN + 0.5, ease.out2), tOut = 1 - tw(t, DROP + 0.12, DROP + 0.4, ease.out2);
      const op = (trans ? tIn * tOut : fadeIn * fadeOut).toFixed(3);
      s.canvas.style.opacity = op; s.hostLayer.style.opacity = op; s.planeLayer.style.opacity = op;
      { const fp = s.projPx(pose.tgt, [0, 0, 0]); s.post.set({ focus: [fp[0] / W, 1 - fp[1] / H], band: 0.17, soft: 0.5, maxR: lerp(5, 12, clamp((dist - 5) / 18)), seed: Math.round(t * 30), exposure: (DB.exposure ?? LOOK.exposure) * (1 + (DB.wideE ?? 0.08) * wide) }); s.post.render(); }
    },
  });

  const scrNormalDot = (s, k, camPos) => s.scrNormal[k].dot(camPos.clone().sub(s.scrCenter(k)).normalize());

  function updateContent(s, t) {
    // Tom: Mitteilung → Abo-Übersicht; Zeilen und Kostenbalken wachsen mit den Schildern (an den Pings)
    { const c = T0.tom, P = PING.tom, u = s.tomUI, sw = ez.io2(prog(t, c + 1.15, c + 1.55)), tIn = tw(t, P[0], P[0] + 0.3, ease.out3), tOut = tw(t, c + 1.45, c + 1.7, ease.in2);
      u.apps.style.opacity = (1 - sw).toFixed(3); u.abo.style.display = sw > 0.001 ? 'block' : 'none'; u.abo.style.opacity = sw.toFixed(3);
      tf(u.toast, { y: -30 * (1 - tIn), o: tIn * (1 - tOut) });
      const TR_ = [c + 1.3, P[0] + 0.3, P[1] + 0.3, P[2] + 0.3];
      u.rows.forEach((el, i) => { const p = tw(t, TR_[i], TR_[i] + 0.4, ease.ui); el.style.opacity = p.toFixed(3); el.style.transform = `translateY(${(14 * (1 - p)).toFixed(1)}px)`; u.segs[i].style.width = (u.SEGW[i] * tw(t, TR_[i] + 0.15, TR_[i] + 0.65, ease.ui)).toFixed(1) + 'px'; }); }
    // Anna: der Mauszeiger fährt über die Tabs, ein Tooltip nennt den Titel – „Welcher Tab war das noch?“
    { const c = T0.anna, u = s.annaUI, HV = [[3, 'Chat – Team Vertrieb'], [8, 'Angebote – Hartmann'], [6, 'Tabelle – Q3 Pipeline'], [10, 'Tickets – Anfrage 4711'], [5, 'Wiki – Preisliste'], [7, 'Formular – Kundenanfrage']];
      const t0 = c + 3.55, dw = 0.5, k = Math.floor((t - t0) / dw), live = t >= t0 && k < HV.length && t < SHOVE.anna - 0.1, wt = 66, cx = (i) => 8 + i * (wt + 1) + wt / 2;
      if (!live) { u.cur.style.opacity = 0; u.tip.style.opacity = 0; u.tabs.forEach((el) => { el.style.background = '#fff'; }); }
      else {
        const prev = k > 0 ? HV[k - 1][0] : 1, cur = HV[k][0], m = ez.io2(clamp((t - t0 - k * dw) / 0.18)), x = lerp(cx(prev), cx(cur), m), y = lerp(k > 0 ? 18 : 120, 18, k > 0 ? 1 : m);
        u.cur.style.opacity = tw(t, t0, t0 + 0.2).toFixed(3); u.cur.style.transform = `translate(${(x - 4).toFixed(1)}px,${(y - 2).toFixed(1)}px)`;
        const dwell = clamp((t - t0 - k * dw - 0.18) / 0.12); u.tip.textContent = HV[k][1]; u.tip.style.opacity = dwell.toFixed(3); u.tip.style.left = clamp(cx(cur) - 60, 8, 570).toFixed(1) + 'px';
        u.tabs.forEach((el, i) => { el.style.background = i === cur && dwell > 0.5 ? '#E8EEFF' : '#fff'; });
      } }
    // Lena: Anmeldefeld klappt auf, dahinter fünf Oberflächen (an den Pings)
    { const P = PING.lena, door = ease.io3(prog(t, P[0], P[0] + 0.7));
      s.lenaUI.panel.style.transform = `perspective(900px) rotateY(${(-82 * door).toFixed(2)}deg)`; s.lenaUI.panel.style.opacity = 1 - 0.95 * door;
      s.lenaUI.wins.forEach((w, k) => { const tt = P[0] + 0.15 + k * 0.1, p = tw(t, tt, tt + 0.5, ease.snap); show(w.el, t >= tt); tf(w.el, { s: 0.7 + 0.3 * p, o: clamp(p * 2), r: w.r }); }); }
    // Anna: Tab-Leiste wächst von 3 auf 12
    { const P = PING.anna, n = Math.floor(lerp(3, 12, ease.out2(prog(t, P[0] - 0.7, P[0] + 1.9))) + 0.001), wt = Math.min(116, (812 - 20) / n);
      s.annaUI.tabs.forEach((el, k) => { show(el, k < n); el.style.left = (8 + k * (wt + 1)) + 'px'; el.style.width = wt + 'px'; }); }
  }
  const mapPlane = (p, camera, s) => {
    const cr = V().setFromMatrixColumn(camera.matrixWorld, 0), cu = V().setFromMatrixColumn(camera.matrixWorld, 1);
    const hm = p.wm * p.hpx / p.wpx, cs = Math.cos(p.roll), sn = Math.sin(p.roll);
    const rx = cr.clone().multiplyScalar(cs).addScaledVector(cu, sn), ry = cu.clone().multiplyScalar(cs).addScaledVector(cr, -sn);
    const hw = (p.wm * p.scale) / 2, hh = (hm * p.scale) / 2;
    const corners = [[-1, 1], [1, 1], [1, -1], [-1, -1]].map(([x, y]) => p.c.clone().addScaledVector(rx, x * hw).addScaledVector(ry, y * hh));
    const quad = s.quadPx(corners);
    if (quad.some((q) => q[2] > -0.2)) { p.el.style.display = 'none'; return; }
    p.el.style.display = 'block'; p.el.style.transform = matrixFor(0, 0, p.wpx, p.hpx, quad.map((q) => [q[0], q[1]]));
  };
  function updatePlanes(s, t, camera) {
    const cr = V().setFromMatrixColumn(camera.matrixWorld, 0), cu = V().setFromMatrixColumn(camera.matrixWorld, 1);
    // Tom: Preisschilder fallen herab (je eines pro Ping), schweben um den Monitor und ordnen sich bei der Nahaufnahme über dem Bildschirm
    { const P = PING.tom, c0 = s.scrCenter('tom'), offsH = [[-0.66, 0.30], [0.70, 0.46], [0.86, 0.04]], offsC = [[-0.30, 0.33], [0.0, 0.33], [0.30, 0.33]], rolls = [-0.1, 0.07, -0.06];
      const push = ez.io2(prog(t, T0.tom + PUSH[0], T0.tom + PUSH[1])), fo = 1 - tw(t, SHOVE.tom - 0.1, SHOVE.tom + 0.2, ease.in2);
      s.tomTags.forEach((p, k) => { const tt = P[k], a = prog(t, tt, tt + 0.55), pp = ez.out3(a), bounce = Math.abs(Math.sin(a * Math.PI * 1.5)) * (1 - a) * 0.22;
        if (t < tt - 0.01 || fo <= 0.01) { p.el.style.display = 'none'; return; }
        const ox = lerp(offsH[k][0], offsC[k][0], push), oy = lerp(offsH[k][1], offsC[k][1], push);
        p.c.copy(c0).addScaledVector(cr, ox).addScaledVector(cu, oy - (1 - pp) * 1.9 * (1 - push) + bounce * (1 - push) + (t > P[2] ? 0.012 * Math.sin((t - P[2]) * 4 + k) : 0));
        p.roll = lerp(rolls[k], 0, push * 0.8); p.scale = lerp(1, 0.7, push); p.el.style.opacity = clamp(a * 3) * fo; mapPlane(p, camera, s); }); }
    // Lena und Anna: Beschriftungen über dem Bildschirm in der Nahaufnahme – was genau das Problem ist
    const pills = (arr, key, c, times, sh, offs) => { const c0 = s.scrCenter(key), fo = 1 - tw(t, sh - 0.1, sh + 0.2, ease.in2);
      arr.forEach((p, k) => { const tt = c + times[k], a = prog(t, tt, tt + 0.45), pp = ez.back(a, 1.2);
        if (t < tt || fo <= 0.01) { p.el.style.display = 'none'; return; }
        p.c.copy(c0).addScaledVector(cr, offs[k]).addScaledVector(cu, 0.33 + 0.012 * Math.sin(t * 2.2 + k)); p.roll = (k - 1) * 0.04; p.scale = 0.7 * (0.6 + 0.4 * pp); p.el.style.opacity = clamp(a * 2.4) * fo; mapPlane(p, camera, s); }); };
    pills(s.lenaPills, 'lena', T0.lena, [3.0, 3.5, 4.0], SHOVE.lena, [-0.42, -0.10, 0.22]);
    pills(s.annaPills, 'anna', T0.anna, [3.2, 3.7, 4.2], SHOVE.anna, [-0.42, -0.06, 0.29]);
  }
  function updateTexts(s, t) {
    const SPEC = [['tom', T0.tom, SHOVE.tom, T0.tom + 2.4], ['lena', T0.lena, SHOVE.lena, T0.lena + 2.0], ['anna', T0.anna, SHOVE.anna, T0.anna + 2.0]];
    for (const [k, t0, sh, bubIn] of SPEC) {
      // Tom/Lena: der Text ist weg, sobald das Schieben (Wisch-Ton) trifft – so läuft der nächste Schreibtisch nicht halbtransparent hinter der Sprechblase durch
      const f0 = k === 'anna' ? sh : sh - 0.3, f1 = k === 'anna' ? sh + 0.3 : sh + 0.05;
      const V_ = s.TXT[k], a = t - t0, on = t >= t0 - 0.02 && t < f1 + 0.01, off = tw(t, f0, f1, ease.uiInOut);
      Object.values(V_).forEach((el) => show(el, on));
      if (!on) continue;
      const slam = tw(a, 0, 0.4, ease.snap);
      tf(V_.name, { y: 18 * (1 - tw(a, 0.05, 0.5, ease.ui)), s: 1.04 - 0.04 * slam, o: tw(a, 0.05, 0.45) * (1 - off) });
      tf(V_.ok, { y: 16 * (1 - tw(a, 0.3, 0.7, ease.ui)), o: tw(a, 0.3, 0.65) * (1 - off) });
      const p = tw(t, bubIn, bubIn + 0.4, ease.snap);
      tf(V_.bub, { s: 0.88 + 0.12 * p, o: clamp(p * 2.2) * (1 - off) }); tf(V_.who, { o: clamp(p * 2.2) * (1 - off) });
      if (V_.bub2) { const p2 = tw(t, t0 + 3.9, t0 + 4.3, ease.snap); tf(V_.bub2, { s: 0.9 + 0.1 * p2, o: clamp(p2 * 2.2) * (1 - off) }); }
      if (V_.call) {
        const pc = tw(t, bubIn - 0.35, bubIn, ease.snap), sec = 134 + Math.max(0, Math.floor(t - bubIn)), mm = Math.floor(sec / 60), ss = sec % 60;
        tf(V_.call, { s: 0.9 + 0.1 * pc, o: clamp(pc * 2.2) * (1 - off) }); V_.fx.time.textContent = `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
        V_.fx.bars.forEach((b, i) => { b.style.height = (8 + 20 * Math.abs(Math.sin(t * 9.5 + i * 1.7) * Math.cos(t * 3.1 + i))).toFixed(1) + 'px'; });
      }
    }
  }
}
