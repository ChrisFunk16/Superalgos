// ============================================================
// Gemeinsame Bausteine für Act II („Klarheit“, 20–52 s)
// Alle sechs Nutzen-Szenen (01–06) verwenden denselben Headline-Block,
// damit die Szenen wie aus einem Guss wirken.
// ============================================================

/** Layout-Raster für Act II (1920×1080) */
export const L = {
  colX: 110,                         // linke Textspalte
  colW: 740,
  stage: { x: 880, y: 150, w: 940, h: 780 },  // rechte Bühne für Visuals (Fenster, Kette, Zeitleiste …)
  margin: 96,
};

let cssDone = false;
function ensureCss(E) {
  if (cssDone) return; cssDone = true;
  E.style(`
  .a2-head { position:absolute; width:${L.colW}px; }
  .a2-num  { display:flex; align-items:center; gap:22px; height:96px; overflow:hidden; }
  .a2-num .num { font-size:96px; line-height:96px; font-weight:600; display:block; }
  .a2-numline { height:4px; width:150px; background:linear-gradient(90deg,var(--orange),rgba(230,126,34,0)); transform-origin:0 50%; border-radius:2px; }
  .a2-title { margin:14px 0 0; font-size:76px; line-height:1.03; color:var(--navy); }
  .a2-title .ln { display:block; overflow:hidden; padding:4px 0 6px; margin:-4px 0 -6px; }
  .a2-title .ln > span { display:block; will-change:transform; }
  .a2-title em { font-style:normal; color:var(--orange-deep); }
  .a2-sub { margin:30px 0 0; font-size:36px; line-height:1.4; color:var(--text-2); font-weight:400; max-width:720px; }
  .a2-title .mu { color:var(--warm-gray); }
  `);
}

/**
 * Headline-Block: orange Nummer, Versalien-Titel (zeilenweise Maske), Untertitel.
 *   opts: { num:'03', lines:['PASSENDE <em>WERKZEUGE</em>','AN EINEM ORT.'], sub:'…', y:340 (Oberkante) }
 *   Rückgabe: { el, update(t, tIn, tOut) } – tIn: Start der Einblendung (Sek.), tOut: Ende der Ausblendung.
 */
export function headline(E, root, opts) {
  ensureCss(E);
  const { h, tf, tw, ease } = E;
  const lns = opts.lines.map((l, i) => h('span', { class: 'ln' }, h('span', { html: l, class: opts.muted && opts.muted[i] ? 'mu' : '' })));
  const num = h('div', { class: 'a2-num' }, h('span', { class: 'num', text: opts.num }), h('span', { class: 'a2-numline' }));
  const title = h('h2', { class: 'disp a2-title', style: { fontSize: opts.size || 76 } }, lns);
  const sub = h('p', { class: 'a2-sub', text: opts.sub });
  const el = h('div', { class: 'a2-head', style: { left: L.colX, top: opts.y ?? 330 } }, num, title, sub);
  root.append(el);
  const numEl = num.firstChild, lineEl = num.lastChild;
  const inner = lns.map((l) => l.firstChild);
  return {
    el,
    update(t, tIn, tOut) {
      const a = t - tIn;
      tf(numEl, { y: 100 * (1 - tw(a, 0, 0.55, ease.ui)) });
      tf(lineEl, { sx: tw(a, 0.15, 0.9, ease.ui), o: 1 });
      inner.forEach((s, i) => { const d = 0.12 + i * 0.1 + ((opts.delays && opts.delays[i]) || 0); tf(s, { y: 120 * (1 - tw(a, d, d + 0.68, ease.ui)) }); });
      const sd = 0.5 + inner.length * 0.1 + (opts.subDelay || 0);
      tf(sub, { y: 24 * (1 - tw(a, sd, sd + 0.6, ease.ui)), o: tw(a, sd, sd + 0.5, ease.out2) });
      const out = tw(t, tOut - 0.4, tOut, ease.in2);
      el.style.opacity = 1 - out; el.style.transform = `translateY(${-26 * out}px)`;
      el.style.display = (t < tIn - 0.05 || t > tOut) ? 'none' : 'block';
    },
  };
}

/** Kleine orange Flagge (Marken-Glyphe) als HTML-String */
export const flagHTML = (w = 30) => `<span class="flag" style="width:${w}px;height:${Math.round(w / 2)}px"></span>`;
