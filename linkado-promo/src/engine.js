// ============================================================
// Mini-Engine für den Linkado-Werbefilm
// Prinzip: Jedes Bild ist eine reine Funktion der Zeit t (Sekunden).
// Keine CSS-Animationen/Transitions, kein Date.now(), kein Math.random()
// → jeder Frame ist reproduzierbar und lässt sich einzeln rendern.
// ============================================================
import { icon } from './icons.js';
import { LOGO, BRAND, logoSVG, iconSVG } from './logo.js';

/* ---------- Mathe ---------- */
export const clamp = (x, a = 0, b = 1) => (x < a ? a : x > b ? b : x);
export const lerp = (a, b, t) => a + (b - a) * t;
export const prog = (t, a, b) => (b === a ? (t >= b ? 1 : 0) : clamp((t - a) / (b - a)));
/** lineares, geklemmtes Mapping: x von [a,b] nach [c,d] */
export const map = (x, a, b, c, d) => c + (d - c) * prog(x, a, b);

/** CSS-ähnliche cubic-bezier-Easing-Funktion */
export function bez(x1, y1, x2, y2) {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const sx = (t) => ((ax * t + bx) * t + cx) * t;
  const sy = (t) => ((ay * t + by) * t + cy) * t;
  const dx = (t) => (3 * ax * t + 2 * bx) * t + cx;
  return (x) => {
    if (x <= 0) return 0; if (x >= 1) return 1;
    let t = x;
    for (let i = 0; i < 8; i++) { const e = sx(t) - x; if (Math.abs(e) < 1e-6) return sy(t); const d = dx(t); if (Math.abs(d) < 1e-6) break; t -= e / d; }
    let lo = 0, hi = 1; t = x;
    for (let i = 0; i < 24; i++) { const e = sx(t); if (Math.abs(e - x) < 1e-6) break; if (x > e) lo = t; else hi = t; t = (hi + lo) / 2; }
    return sy(t);
  };
}

export const ease = {
  lin: (x) => x,
  in2: (x) => x * x, in3: (x) => x * x * x, in4: (x) => x ** 4,
  out2: (x) => 1 - (1 - x) ** 2, out3: (x) => 1 - (1 - x) ** 3, out4: (x) => 1 - (1 - x) ** 4, out5: (x) => 1 - (1 - x) ** 5,
  io2: (x) => (x < 0.5 ? 2 * x * x : 1 - (-2 * x + 2) ** 2 / 2),
  io3: (x) => (x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2),
  io4: (x) => (x < 0.5 ? 8 * x ** 4 : 1 - (-2 * x + 2) ** 4 / 2),
  outExpo: (x) => (x >= 1 ? 1 : 1 - 2 ** (-10 * x)),
  inExpo: (x) => (x <= 0 ? 0 : 2 ** (10 * x - 10)),
  outBack: (x, s = 1.70158) => { const c = s + 1; return 1 + c * (x - 1) ** 3 + s * (x - 1) ** 2; },
  inBack: (x, s = 1.70158) => { const c = s + 1; return c * x * x * x - s * x * x; },
  outElastic: (x) => (x <= 0 ? 0 : x >= 1 ? 1 : 2 ** (-10 * x) * Math.sin((x * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1),
  smooth: (x) => x * x * (3 - 2 * x),
  ui: bez(0.2, 0.8, 0.2, 1),          // schnell rein, weich auslaufen (Standard für UI-Bewegung)
  uiInOut: bez(0.65, 0, 0.35, 1),
  snap: bez(0.34, 1.45, 0.64, 1),     // leichter Overshoot
};
/** getweente Fortschrittszahl 0..1 zwischen a und b */
export const tw = (t, a, b, e = ease.out3) => e(prog(t, a, b));
/** Fenster-Funktion: 0 → 1 (in a..b) → 1 → 0 (in c..d) */
export const win = (t, a, b, c, d, e1 = ease.out3, e2 = ease.in3) => e1(prog(t, a, b)) * (1 - e2(prog(t, c, d)));

/** Seeded Zufall (mulberry32) mit Helfern: r(), r.range(a,b), r.int(a,b), r.pick(arr) */
export function rng(seed = 1) {
  let a = seed >>> 0;
  const r = () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  r.range = (lo, hi) => lo + (hi - lo) * r();
  r.int = (lo, hi) => Math.floor(lo + (hi - lo + 1) * r());
  r.pick = (arr) => arr[Math.floor(r() * arr.length)];
  return r;
}

/* ---------- DOM ---------- */
const SVG_NS = 'http://www.w3.org/2000/svg';
const SVG_TAGS = new Set(['svg', 'g', 'path', 'circle', 'rect', 'line', 'polyline', 'polygon', 'ellipse', 'defs', 'linearGradient', 'radialGradient', 'stop', 'clipPath', 'mask', 'text', 'tspan', 'filter', 'feGaussianBlur', 'feTurbulence', 'feColorMatrix', 'feOffset', 'feMerge', 'feMergeNode', 'feDropShadow', 'use', 'pattern']);
export function css(el, o) {
  for (const k in o) { const v = o[k]; if (v == null) continue; if (k.startsWith('--') || k.includes('-')) el.style.setProperty(k, v); else el.style[k] = typeof v === 'number' && !/^(opacity|zIndex|fontWeight|lineHeight|flex|order)$/.test(k) ? v + 'px' : v; }
  return el;
}
/** h('div', {class:'x', style:{left:10}, html:'..', text:'..', 'data-x':1}, ...children) – erzeugt auch SVG-Elemente */
export function h(tag, props = {}, ...kids) {
  const el = SVG_TAGS.has(tag) ? document.createElementNS(SVG_NS, tag) : document.createElement(tag);
  for (const k in props) {
    const v = props[k]; if (v == null || v === false) continue;
    if (k === 'class') el.setAttribute('class', v);
    else if (k === 'style') { if (typeof v === 'string') el.style.cssText = v; else css(el, v); }
    else if (k === 'html') el.innerHTML = v;
    else if (k === 'text') el.textContent = v;
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const c of kids.flat(Infinity)) if (c != null && c !== false) el.append(c.nodeType ? c : document.createTextNode(String(c)));
  return el;
}
/** Setzt Transform/Opacity/Filter kompakt. p: {x,y,s,sx,sy,r,skx,rx,ry,persp,o,blur,bright} */
export function tf(el, p) {
  let t = '';
  if (p.persp) t += `perspective(${p.persp}px) `;
  if (p.x || p.y) t += `translate(${p.x || 0}px,${p.y || 0}px) `;
  if (p.rx) t += `rotateX(${p.rx}deg) `;
  if (p.ry) t += `rotateY(${p.ry}deg) `;
  if (p.r) t += `rotate(${p.r}deg) `;
  if (p.skx) t += `skewX(${p.skx}deg) `;
  if (p.s != null && p.s !== 1) t += `scale(${p.s}) `;
  else if (p.sx != null || p.sy != null) t += `scale(${p.sx ?? 1},${p.sy ?? 1}) `;
  el.style.transform = t || 'none';
  if (p.o != null) el.style.opacity = p.o;
  if (p.blur != null || p.bright != null) el.style.filter = (p.blur ? `blur(${p.blur}px) ` : '') + (p.bright != null ? `brightness(${p.bright})` : '');
  return el;
}
/** Zeigt/versteckt ein Element (display) – schneller als Opacity für unsichtbare Teile */
export const show = (el, on) => { const v = on ? '' : 'none'; if (el.style.display !== v) el.style.display = v; };

/* ---------- Engine ---------- */
export function createEngine(tl, stage) {
  const E = { tl, stage, scenes: [], clamp, lerp, prog, map, tw, win, ease, bez, rng, h, css, tf, show, icon, LOGO, BRAND, logoSVG, iconSVG };
  E.W = tl.meta.width; E.H = tl.meta.height; E.fps = tl.meta.fps; E.bpm = tl.meta.bpm; E.beat = tl.meta.beat; E.bar = tl.meta.bar;
  E.T = (id) => { const s = tl.scenes.find((x) => x.id === id); if (!s) throw new Error('Szene unbekannt: ' + id); return s; };
  E.hits = (kind, voice) => tl.hits.filter((x) => x.kind === kind && (voice == null || x.voice === voice));
  E.style = (text) => { const s = document.createElement('style'); s.textContent = text; document.head.append(s); return s; };
  /** Szene registrieren. def: {id, start?, end?, span?:[idA,idB], shift?, pre?, post?, z?, build(root,E)->state, update(t,state,E)}
   *  shift: die Szene ist in „lokaler“ Zeit geschrieben; update bekommt t − shift, feste start/end-Werte werden um shift verschoben.
   *  map(tGlobal): optional, ersetzt t − shift (z. B. um einen Einschub einzufügen, während die Szene „eingefroren“ ist); update bekommt zusätzlich die globale Zeit als 4. Argument. */
  E.scene = (def) => {
    const literal = def.start != null && !def.span;
    if (def.span) { def.start = E.T(def.span[0]).start; def.end = E.T(def.span[1]).end; }
    else if (def.start == null) { const s = E.T(def.id); def.start = s.start; def.end = s.end; }
    if (def.shift && literal) { def.start += def.shift; def.end += def.shift; }
    E.scenes.push(def); return def;
  };
  E.start = async () => {
    for (const s of E.scenes) {
      s.root = h('section', { class: 'scene', id: 'scene-' + s.id, style: { display: 'none', zIndex: String(s.z ?? 0) } });
      stage.append(s.root);
      try { s.state = (s.build && s.build(s.root, E)) || {}; } catch (e) { console.error('[build ' + s.id + ']', e); s.state = {}; s.broken = true; }
    }
    const fonts = ['500 40px Outfit', '600 40px Outfit', '700 40px Outfit', '800 40px Outfit', '400 20px Inter', '500 20px Inter', '600 20px Inter', '700 20px Inter', '500 30px "Barlow Condensed"', '600 30px "Barlow Condensed"'];
    await Promise.all(fonts.map((f) => document.fonts.load(f).catch(() => {})));
    await document.fonts.ready;
    const dbg = new URLSearchParams(location.search).has('debug');
    const dbgEl = dbg ? stage.appendChild(h('div', { style: { position: 'absolute', right: 12, top: 8, zIndex: 9999, font: '600 20px monospace', color: '#0f0', background: 'rgba(0,0,0,.6)', padding: '2px 8px' } })) : null;
    E.renderAt = (t) => {
      for (const s of E.scenes) {
        const vis = !s.broken && t >= s.start - (s.pre || 0) && t < s.end + (s.post || 0);
        if (vis !== s._vis) { s.root.style.display = vis ? 'block' : 'none'; s._vis = vis; }
        if (vis) { try { s.update(s.map ? s.map(t) : t - (s.shift || 0), s.state, E, t); } catch (e) { if (!s._err) { console.error('[update ' + s.id + ' @' + t.toFixed(2) + ']', e); s._err = true; } } }
      }
      if (dbgEl) dbgEl.textContent = t.toFixed(2) + ' s · bar ' + (Math.floor(t / E.bar) + 1) + ' · beat ' + ((Math.floor(t / E.beat) % 4) + 1);
    };
    window.renderAt = E.renderAt;
    window.__ready = true;
  };
  return E;
}
