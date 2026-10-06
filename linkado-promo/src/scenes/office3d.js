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
  const CUT = E.hits('cut')[0].t, DROP = E.hits('drop')[0].t, TIN = 22.5;

  const api = { ready: false, dbg: {} };
  E.o3d = api;

  /* ---------------------------------------------------------------- Kamerafahrt Akt I */
  const GL1 = [8.0, 8.95], GL2 = [12.5, 13.45];
  function shotAt(t) {
    const hold = (key, t0, k = 1) => driftShot(SHOTS[key], Math.max(0, t - t0), 0.9 * k);
    if (t < T0.lena - 0.5) return t < 5.4 ? mixShot(SHOTS.over, hold('tom', 5.4), ez.out3(prog(t, T0.tom, 5.4))) : hold('tom', 5.4);
    if (t < GL1[1]) {
      const p = ez.io2(prog(t, GL1[0], GL1[1])), s = mixShot(hold('tom', 5.4), hold('lena', GL1[1], 0), p), a = Math.sin(Math.PI * p);
      s.el += 12 * a; s.d += 3.2 * a; return s;
    }
    if (t < GL2[0]) return hold('lena', GL1[1]);
    if (t < GL2[1]) {
      const p = ez.io2(prog(t, GL2[0], GL2[1])), s = mixShot(hold('lena', GL1[1]), hold('anna', GL2[1], 0), p), a = Math.sin(Math.PI * p);
      s.el += 12 * a; s.d += 3.2 * a; return s;
    }
    const s = hold('anna', GL2[1]); const push = ez.io2(prog(t, 16.4, 17.5)); s.d -= 0.5 * push; s.el -= 3 * push; return s;
  }

  E.scene({
    id: 'o3d', start: T0.tom - 0.05, end: 30.5, z: 3,
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
      { const scr = hosts.tom; scr.style.background = 'linear-gradient(135deg,#1B2840,#0F1626)';
        scr.append(h('div', { class: 'abs', style: { left: 0, top: 0, right: 0, height: 26, background: 'rgba(255,255,255,.08)' } }));
        const win = h('div', { class: 'abs', style: { left: 40, top: 62, width: 600, height: 400, borderRadius: 12, background: '#F1F3F7', overflow: 'hidden', boxShadow: '0 12px 30px rgba(0,0,0,.45)' } },
          h('div', { class: 'abs', style: { left: 0, top: 0, right: 0, height: 38, background: '#fff', borderBottom: '1.5px solid #E3E7EF', display: 'flex', alignItems: 'center', gap: 8, padding: '0 14px', font: '700 15px/1 var(--font-body)', color: '#59627A' } }, h('i', { style: { width: 10, height: 10, borderRadius: '50%', background: '#D5DAE4', display: 'block' } }), h('i', { style: { width: 10, height: 10, borderRadius: '50%', background: '#D5DAE4', display: 'block' } }), 'Alle Apps'));
        APPCOL.forEach((c, k) => win.append(h('div', { class: 'abs', style: { left: 46 + (k % 4) * 138, top: 72 + Math.floor(k / 4) * 158, width: 116, height: 116, borderRadius: 26, background: c, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 14px rgba(31,37,50,.28)' }, html: icon(APPICO[k], 52, '#fff', 2) })));
        win.append(h('div', { class: 'abs', style: { left: 46 + 3 * 138 - 5, top: 72 + 158 - 5, width: 126, height: 126, borderRadius: 30, border: '3px dashed rgba(229,86,91,.9)', zIndex: 3 } }));
        scr.append(win);
        const mb = mini(E, 'chat', 200, 138); Object.assign(mb.style, { left: '606px', top: '330px', transform: 'rotate(3deg)' }); scr.append(mb); }
      // Lena: Anmeldefeld (klappt wie eine Tür auf) → fünf unterschiedliche Oberflächen
      const lenaUI = (() => { const scr = hosts.lena; scr.style.background = 'linear-gradient(160deg,#2A2150,#101226)';
        const wins = [['mail', 22, 44, 262, 210, -2], ['chat', 300, 76, 262, 200, 2], ['sheet', 566, 44, 232, 220, -1.5], ['files', 50, 290, 262, 200, 2], ['ticket', 340, 300, 262, 200, -2]].map(([k, x, y, w, hh, r]) => { const el = mini(E, k, w, hh); Object.assign(el.style, { left: x + 'px', top: y + 'px', transform: `rotate(${r}deg)` }); scr.append(el); return { el, r }; });
        const panel = h('div', { class: 'abs', style: { left: 240, top: 72, width: 340, height: 400, borderRadius: 20, background: '#fff', padding: '30px 26px', transformOrigin: '0 50%', boxShadow: '0 14px 40px rgba(0,0,0,.4)', zIndex: 5 } },
          h('div', { style: { font: '700 28px/1 var(--font-display)', textTransform: 'uppercase', marginBottom: 28, color: '#1F2532' }, text: 'Anmelden' }),
          h('div', { style: { height: 50, borderRadius: 10, background: '#F1F3F7', border: '1.5px solid #E3E7EF', marginBottom: 14 } }), h('div', { style: { height: 50, borderRadius: 10, background: '#F1F3F7', border: '1.5px solid #E3E7EF', marginBottom: 26 } }), h('div', { style: { height: 56, borderRadius: 10, background: '#7B6CF6' } }));
        scr.append(panel); return { wins, panel }; })();
      // Anna: rohe, graue Oberfläche (dieselbe wie später im Übergang) + Browser-Leiste mit wachsender Tab-Zahl
      const annaUI = (() => { const scr = hosts.anna; const ui = buildUI(E), w = ui.window({ raw: true }); w.setActive('Startseite'); w.main.append(ui.home().el);
        w.el.style.transformOrigin = '0 0'; w.el.style.transform = `translate(0px,32px) scale(${(812 / 1480).toFixed(4)})`; scr.append(w.el);
        const strip = h('div', { class: 'abs', style: { left: 0, top: 0, width: 812, height: 32, background: '#E4E8EF', zIndex: 5 } });
        const cols = ['#E5565B', '#7B6CF6', '#36A9E8', '#3FBF8A', '#8E97AE', '#D1497A'];
        const tabs = Array.from({ length: 12 }, (_, k) => { const el = h('div', { class: 'abs', style: { top: 4, height: 28, borderRadius: '8px 8px 0 0', background: '#fff', border: '1px solid #D5DAE4', borderBottom: 'none' } }, h('div', { class: 'abs', style: { left: 7, top: 9, width: 10, height: 10, borderRadius: 3, background: cols[k % 6] } }), h('div', { class: 'abs', style: { left: 22, top: 12, right: 6, height: 5, borderRadius: 2, background: 'rgba(31,37,50,.22)' } })); strip.append(el); return el; });
        scr.append(strip); return { tabs }; })();

      /* ---- Schwebende Fenster/Schilder (DOM-Flächen im Raum) ---- */
      const planes = [];
      const mkPlane = (el, wpx, hpx, wm) => { el.classList.add('o3-pl'); el.style.display = 'none'; planeLayer.append(el); const p = { el, wpx, hpx, wm, c: V(), roll: 0, scale: 1 }; planes.push(p); return p; };
      const tomTags = [['+ KI-OPTION', 232], ['+ TELEFONIE', 240], ['+ SPEICHER', 226]].map(([txt, w]) => { const el = h('div', { class: 'of-tag', style: { width: w + 'px', height: '52px', boxSizing: 'border-box' } }, h('span', { html: icon('euro', 26, '#E5565B', 2.6) }), txt); return mkPlane(el, w, 52, 0.30 * w / 200); });
      const lenaMinis = [['files', 268, 176], ['ticket', 276, 180], ['chat', 232, 160]].map(([k, w, hh]) => mkPlane(mini(E, k, w, hh), w, hh, 0.34));

      /* ---- Texte ---- */
      const mkText = (cfg) => {
        const name = h('div', { class: 'of-name', text: cfg.name, style: { fontSize: cfg.size + 'px', top: '232px' } });
        const ok = h('div', { class: 'of-ok', style: { '--acc': cfg.acc, top: '350px' } }, h('span', { class: 'ck', html: icon('check', 26, '#3FBF8A', 3) }), h('span', { text: cfg.ok }), h('b', { text: 'ABER:' }));
        const who = h('div', { class: 'of-who', text: cfg.who, style: { top: '444px' } });
        const bub = h('div', { class: 'of-bub', text: cfg.say, style: { top: '488px' } });
        const out = { name, ok, who, bub };
        if (cfg.call) {                                                   // Telefonat: wer am anderen Ende ist, ohne Lesezeit (kleine Pille unter der Blase)
          const bars = Array.from({ length: 4 }, () => h('i')), time = h('small', { text: '02:14' });
          out.call = h('div', { class: 'of-call', style: { top: '672px' } }, h('span', { class: 'ic', html: icon('phone', 24, '#fff', 2.6) }), h('span', { text: cfg.call }), time, h('span', { class: 'eq' }, ...bars));
          Object.defineProperty(out, 'fx', { value: { bars, time }, enumerable: false });      // nicht aufzählbar: show() läuft nur über die Elemente
        }
        textLayer.append(name, ok, who, bub); if (out.call) textLayer.append(out.call); return out;
      };
      const TXT = {
        tom: mkText({ name: 'DER ALLROUNDER', size: 84, acc: '#E5565B', ok: 'ALLES AUS EINER HAND.', who: 'Tom · Einkauf', say: 'Die KI kostet extra? Pro Nutzer?!', call: 'IT-Service' }),
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
      const startPose = shotPose(mkShot(heroT('anna', 0.8), 4, 74, 9.5, 30, 0, 90));
      const T_Z0 = 22.6;
      const transPose = (t) => {
        const p = ez.in2(prog(t, T_Z0, DROP)), a = startPose, b = finalPose;
        return { pos: a.pos.clone().lerp(b.pos, p), tgt: a.tgt.clone().lerp(b.tgt, p), up: a.up.clone().lerp(b.up, p).normalize(), fov: lerp(a.fov, b.fov, p), sx: lerp(a.sx, b.sx, p), sy: lerp(a.sy, b.sy, p) };
      };

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
      return { renderer, post, canvas, world, camera, actors, extras, hosts, lenaUI, annaUI, planes, tomTags, lenaMinis, TXT, scrim, hostLayer, planeLayer, textLayer, setCamera, projPx, quadPx, scrCorners, scrNormal, scrCenter, transPose };
    },

    update(t, s) {
      const { renderer, world, camera, actors, hosts, TXT } = s;
      const trans = t >= TIN - 0.1, vignettes = t >= T0.tom - 0.05 && t < T0.anna + 4.75;
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
      else { const ov = ez.out3(prog(t, T0.tom, 5.4)); const a = ez.io2(prog(t, GL1[0], GL1[1])), b = ez.io2(prog(t, GL2[0], GL2[1])); wFocus.tom = (1 - ov) * 0.45 + ov * (1 - a); wFocus.lena = a * (1 - b) + (1 - ov) * 0.45; wFocus.anna = b + (1 - ov) * 0.45; }
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
      if (trans) { const warm = ez.io2(prog(t, 27.6, 28.7)); L.glow.color.set('#9FB4FF').lerp(new THREE.Color('#FFA85C'), warm); L.glow.intensity = lerp(2.2, 4.2, warm); world.desks.anna.screenGlow.material.color.set('#9FB4FF').lerp(new THREE.Color('#FFB070'), warm); world.desks.anna.screenGlow.material.opacity = lerp(0.45, 0.8, warm); }

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
      const fadeIn = tw(t, T0.tom, T0.tom + 0.25, ease.out2), fadeOut = 1 - tw(t, 17.2, 17.75, ease.in2);
      const tIn = tw(t, TIN, TIN + 0.5, ease.out2), tOut = 1 - tw(t, DROP + 0.12, DROP + 0.4, ease.out2);
      const op = (trans ? tIn * tOut : fadeIn * fadeOut).toFixed(3);
      s.canvas.style.opacity = op; s.hostLayer.style.opacity = op; s.planeLayer.style.opacity = op;
      { const fp = s.projPx(pose.tgt, [0, 0, 0]); s.post.set({ focus: [fp[0] / W, 1 - fp[1] / H], band: 0.17, soft: 0.5, maxR: lerp(5, 12, clamp((dist - 5) / 18)), seed: Math.round(t * 30), exposure: (DB.exposure ?? LOOK.exposure) * (1 + (DB.wideE ?? 0.08) * wide) }); s.post.render(); }
    },
  });

  const scrNormalDot = (s, k, camPos) => s.scrNormal[k].dot(camPos.clone().sub(s.scrCenter(k)).normalize());

  function updateContent(s, t) {
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
    // Tom: Preisschilder fallen herab und schweben um den Monitor
    { const P = PING.tom, c0 = s.scrCenter('tom'), offs = [[-0.66, 0.30], [0.70, 0.46], [0.86, 0.04]], rolls = [-0.1, 0.07, -0.06];
      s.tomTags.forEach((p, k) => { const tt = P[0] + k * 0.11, a = prog(t, tt, tt + 0.55), pp = ez.out3(a), bounce = Math.abs(Math.sin(a * Math.PI * 1.5)) * (1 - a) * 0.22;
        const fo = 1 - tw(t, SHOVE.tom - 0.1, SHOVE.tom + 0.2, ease.in2);
        if (t < tt - 0.01 || fo <= 0.01) { p.el.style.display = 'none'; return; }
        const cr = V().setFromMatrixColumn(camera.matrixWorld, 0), cu = V().setFromMatrixColumn(camera.matrixWorld, 1);
        p.c.copy(c0).addScaledVector(cr, offs[k][0]).addScaledVector(cu, offs[k][1] - (1 - pp) * 1.9 + bounce + (t > P[2] ? 0.012 * Math.sin((t - P[2]) * 4 + k) : 0)).add(V(0, 0, 0.0));
        p.roll = rolls[k]; p.scale = 1; p.el.style.opacity = clamp(a * 3) * fo; mapPlane(p, camera, s); }); }
    // Lena: weitere Fenster schweben aus dem Bildschirm
    { const P = PING.lena, c0 = s.scrCenter('lena'), offs = [[0.80, 0.30], [0.84, 0.64], [1.24, 0.08]], rolls = [0.07, -0.05, 0.08];
      s.lenaMinis.forEach((p, k) => { const tt = P[2] + k * 0.12, a = prog(t, tt, tt + 0.55), pp = ez.back(a, 1.1);
        const fo = 1 - tw(t, SHOVE.lena - 0.1, SHOVE.lena + 0.2, ease.in2);
        if (t < tt || fo <= 0.01) { p.el.style.display = 'none'; return; }
        const cr = V().setFromMatrixColumn(camera.matrixWorld, 0), cu = V().setFromMatrixColumn(camera.matrixWorld, 1);
        const px = ez.out3(a) ** 1.6, py = ez.out3(Math.min(1, a * 1.4));
        p.c.copy(c0).addScaledVector(cr, offs[k][0] * px).addScaledVector(cu, offs[k][1] * py + 0.03 * Math.sin(t * 2 + k)).add(V(0, 0, 0.1));
        p.roll = rolls[k]; p.scale = 0.5 + 0.5 * pp; p.el.style.opacity = clamp(a * 2.2) * 0.97 * fo; mapPlane(p, camera, s); }); }
  }
  function updateTexts(s, t) {
    const SPEC = [['tom', T0.tom, SHOVE.tom, PING.tom[1] + 0.1], ['lena', T0.lena, SHOVE.lena, PING.lena[1] + 0.15], ['anna', T0.anna, SHOVE.anna, PING.anna[1] + 0.1]];
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
      if (V_.call) {
        const pc = tw(t, bubIn + 0.25, bubIn + 0.6, ease.snap), sec = 134 + Math.max(0, Math.floor(t - bubIn)), mm = Math.floor(sec / 60), ss = sec % 60;
        tf(V_.call, { s: 0.9 + 0.1 * pc, o: clamp(pc * 2.2) * (1 - off) }); V_.fx.time.textContent = `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
        V_.fx.bars.forEach((b, i) => { b.style.height = (8 + 20 * Math.abs(Math.sin(t * 9.5 + i * 1.7) * Math.cos(t * 3.1 + i))).toFixed(1) + 'px'; });
      }
    }
  }
}
