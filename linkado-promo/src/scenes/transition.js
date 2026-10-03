// ============================================================
// Übergang zum Drop (22,0–30,0 s): Annas Büro (3D, siehe office3d.js) – derselbe Bildschirm, der beim Drop zur Linkado-Oberfläche wird.
//   22,0–22,5 Schwarz · 22,5 das dämmrige Büro blendet auf, Anna sitzt mit dem Kopf in den Händen, oben die Cliffhanger-Frage
//   23,6 sie hebt den Kopf · 24,6 Hand an der Maus · 25,0 KLICK aufs Start-Symbol der Browser-Leiste (die Antwort auf die Frage)
//   25,1–26,3 die 36 Tabs falten sich zu EINEM · 25,5 „EIN BROWSER.“ · 26,5 „EIN LOGIN.“ (ein Anmeldefeld mit Haken)
//   27,5 Lichtwelle: aus der grauen Seite wird die Startseite, Annas Gesicht wird warm (der Ah-Moment) · 28,5 „ALLE GERÄTE.“, das Handy leuchtet
//   29,0–29,92 Sog (Zoom beschleunigt, Faden glüht – Overlay a2-ov), 29,92 Einatmen, 30,0 DROP: das Fenster steht schon, der Name erscheint erst jetzt
// Das 3D-Büro (office3d.js) liefert die Kamera; die Oberfläche (Browser-Leiste + Fenster, Koordinaten 1480 × 900) wird per matrix3d auf den 3D-Monitor gelegt
// (act2.js). Die letzte Kameraeinstellung ist so gewählt, dass der Bildschirm exakt die Pose „full“ von Szene 01 ergibt (Landung ±0 px).
// Keine Produkt-/Firmennamen; die Seite im Bildschirm ist bis zur Welle die graue Rohfassung.
// ============================================================
export const T = { in: 22.5, lift: 23.6, mouse: 24.55, click: 25.0, foldA: 25.1, foldB: 26.3, chip1: 25.5, chip2: 26.5, wave0: 27.5, wave1: 28.7, chip3: 28.5, build: 29.0, drop: 30.0 };

export function buildTransition(E, o) {
  const { h, tf, tw, ease, prog, clamp, lerp, show, icon } = E;
  const { root, cam, dev, raw, win } = o;

  /* ---------- Login-Feld mit Haken (liegt über der grauen Seite) ---------- */
  const login = h('div', { class: 'abs', style: { left: 500, top: 250, width: 480, height: 400, borderRadius: 26, background: '#fff', boxShadow: '0 30px 70px rgba(0,0,0,.35)', padding: '44px 46px', zIndex: 8, opacity: 0 } },
    h('div', { style: { font: '700 44px/1 var(--font-display)', textTransform: 'uppercase', color: '#1F2532', marginBottom: 38 }, text: 'Anmelden' }),
    h('div', { style: { height: 66, borderRadius: 14, background: '#F1F3F7', border: '2px solid #E3E7EF', marginBottom: 20, display: 'flex', alignItems: 'center', padding: '0 20px', font: '500 26px/1 var(--font-body)', color: '#8A92A5' }, text: 'anna.meyer' }),
    h('div', { style: { height: 66, borderRadius: 14, background: '#F1F3F7', border: '2px solid #E3E7EF', marginBottom: 32, display: 'flex', alignItems: 'center', padding: '0 20px', font: '700 30px/1 var(--font-body)', color: '#8A92A5', letterSpacing: '.2em' }, text: '••••••••' }),
    h('div', { style: { height: 70, borderRadius: 14, background: '#1F2532', color: '#fff', font: '700 28px/70px var(--font-body)', textAlign: 'center', letterSpacing: '.04em' }, text: 'Weiter' }));
  const check = h('div', { class: 'abs', style: { left: 380, top: 290, width: 130, height: 130, borderRadius: '50%', background: '#3FBF8A', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 16px 36px rgba(63,191,138,.45)', zIndex: 9, opacity: 0 }, html: icon('check', 76, '#fff', 3.2) });
  login.append(check); check.style.left = '350px'; check.style.top = '270px';
  cam.insertBefore(login, win.el);

  /* ---------- Cliffhanger-Frage (Bildschirmraum, oben) ---------- */
  const LINES = ['KEINE LUST MEHR,', 'SICH DAMIT HERUMZUÄRGERN?'];
  const q = h('div', { class: 'abs', style: { left: 0, right: 0, top: 40, height: 270, zIndex: 50, display: 'none' } });
  const qLetters = [];
  LINES.forEach((ln, li) => {
    const row = h('div', { class: 'a1-big', style: { top: li * 126, fontSize: li ? 100 : 112, fontWeight: 600, color: '#F4EEE3', textShadow: '0 0 24px rgba(10,14,22,.95), 0 4px 26px rgba(10,14,22,.9)' } });
    ln.split('').forEach((ch) => { const sp = h('span', { text: ch === ' ' ? ' ' : ch, style: { display: 'inline-block' } }); row.append(sp); qLetters.push(sp); });
    q.append(row);
  });
  root.append(q);

  /* ---------- Die drei Aussagen (eine Zeile oben, Bildschirmraum): EIN BROWSER. EIN LOGIN. ALLE GERÄTE. + Unterzeile ---------- */
  const chipRow = h('div', { class: 'abs', style: { left: 0, right: 0, top: 56, height: 110, display: 'flex', justifyContent: 'center', alignItems: 'flex-start', gap: 58, zIndex: 50 } });
  const CHIP = [['EIN <em>BROWSER.</em>', T.chip1], ['EIN LOGIN.', T.chip2], ['ALLE <em>GERÄTE.</em>', T.chip3]];
  const chips = CHIP.map(([html, t0]) => {
    const el = h('div', { style: { position: 'relative', font: '700 84px/1 var(--font-display)', textTransform: 'uppercase', color: '#F4EEE3', letterSpacing: '-.005em', whiteSpace: 'nowrap', textShadow: '0 0 22px rgba(10,14,22,.95), 0 4px 24px rgba(10,14,22,.9)', opacity: 0 } }, h('span', { html }), h('i', { style: { position: 'absolute', left: 0, bottom: -14, width: '100%', height: 6, borderRadius: 3, background: '#E67E22', transformOrigin: '0 50%', transform: 'scaleX(0)', display: 'block', boxShadow: '0 0 16px rgba(230,126,34,.7)' } }));
    el.querySelectorAll('em').forEach((e) => { e.style.fontStyle = 'normal'; e.style.color = '#F29A4B'; });
    chipRow.append(el); return { el, bar: el.lastChild, t0 };
  });
  const chipSub = h('div', { class: 'abs', style: { left: 0, right: 0, top: 928, textAlign: 'right', paddingRight: 110, font: '500 44px/1.2 var(--font-body)', color: '#E4DCCB', textShadow: '0 0 18px rgba(10,14,22,.95), 0 3px 18px rgba(10,14,22,.9)', zIndex: 50, display: 'none' }, text: 'Dateien, Kalender, Chat – in einem Tab.' });
  const subScrim = h('div', { class: 'abs', style: { left: 0, right: 0, bottom: 0, height: 300, background: 'linear-gradient(to top, rgba(10,14,22,.82), rgba(10,14,22,.5) 55%, rgba(10,14,22,0))', zIndex: 49, display: 'none' } });
  root.append(subScrim, chipRow, chipSub);

  /* ---------- Zeitleisten ---------- */
  const TAB_X0 = 112, TAB_STEP = 35;
  const cursorPath = [[24.2, 820, 560], [24.9, 700, 520], [T.click, dev.homeX, dev.homeY], [25.4, dev.homeX, dev.homeY], [26.3, 960, 520], [29.0, 960, 520]];

  function update(tG, camS) {
    const on = tG >= T.in - 0.05 && tG < T.drop + 0.5;
    show(login, on);
    // Browser-Leiste und Handy: Auf- und Abblenden (das 3D-Büro blendet selbst)
    const vis = tw(tG, T.in, T.in + 0.5, ease.out2) * (1 - tw(tG, T.drop, T.drop + 0.18, ease.out2));
    show(dev.back, false); [dev.chrome].forEach((el) => { show(el, on); el.style.opacity = vis.toFixed(3); });

    /* Frage */
    show(q, tG >= T.in - 0.05 && tG < 25.5);
    const qo = 1 - tw(tG, 24.9, 25.3, ease.in2);
    qLetters.forEach((el, k) => { const p = tw(tG, T.in + k * 0.02, T.in + k * 0.02 + 0.35, ease.out3); tf(el, { y: 26 * (1 - p) - 22 * (1 - qo), o: p * qo }); });

    /* Aussagen: poppen auf den chip-Hits, gleiten im Sog nach oben weg */
    const cOut = tw(tG, 29.2, 29.55, ease.in2), sOut = tw(tG, 29.55, 29.85, ease.in2), cOn = tG >= chips[0].t0 - 0.05 && tG < 29.6;
    chipRow.style.display = cOn ? 'flex' : 'none'; show(chipSub, tG >= 28.5 && tG < 29.9); show(subScrim, tG >= 28.5 && tG < 29.9);
    chips.forEach((c) => { const p = tw(tG, c.t0, c.t0 + 0.5, ease.ui), b = tw(tG, c.t0 + 0.12, c.t0 + 0.6, ease.ui); c.el.style.opacity = (clamp(p * 1.6) * (1 - cOut)).toFixed(3); c.el.style.transform = `translateY(${(30 * (1 - p) - 120 * cOut).toFixed(1)}px)`; c.bar.style.transform = `scaleX(${b.toFixed(3)})`; });
    { const sp = tw(tG, 28.55, 29.05, ease.ui); subScrim.style.opacity = (sp * (1 - sOut)).toFixed(3); chipSub.style.opacity = (sp * (1 - sOut)).toFixed(3); chipSub.style.transform = `translateY(${(24 * (1 - sp) + 20 * sOut).toFixed(1)}px)`; }

    /* Tabs falten, Pille, Login, Handy */
    const f = prog(tG, T.foldA, T.foldB);
    dev.tabs36.forEach((el, k) => {
      const start = (35 - k) / 35 * 0.35, pk = ease.uiInOut(clamp((f * 1.35 - start) / 1));
      const x = lerp(TAB_X0 + k * TAB_STEP, TAB_X0 + 150, pk);
      el.style.left = x.toFixed(1) + 'px'; el.style.width = (33 * (1 - 0.7 * pk)).toFixed(1) + 'px'; el.style.opacity = (1 - clamp((pk - 0.55) / 0.45)).toFixed(3); show(el, on && pk < 0.995);
    });
    dev.tab.style.opacity = ease.out2(prog(tG, 25.7, 26.3)).toFixed(3);
    const pp = tw(tG, 26.0, 26.5, ease.outBack); tf(dev.pill, { s: 0.4 + 0.6 * pp, o: clamp(pp * 2) });
    const li = tw(tG, 26.45, 26.85, ease.ui) * (1 - tw(tG, T.wave0 - 0.1, T.wave0 + 0.35, ease.in2));
    login.style.opacity = li.toFixed(3); login.style.transform = `translateY(${(14 * (1 - tw(tG, 26.45, 26.85, ease.ui))).toFixed(1)}px)`;
    const ck = tw(tG, 27.0, 27.35, ease.outBack); check.style.opacity = clamp(ck * 2).toFixed(3); check.style.transform = `scale(${(0.4 + 0.6 * ck).toFixed(3)})`;
    raw.el.style.opacity = (tG > 25.05 && tG < 25.55 ? 0.55 : 1);                     // „Seite lädt“: kurz abgedunkelt
    dev.phoneOff.style.opacity = (1 - tw(tG, T.chip3, T.chip3 + 0.35, ease.out2)).toFixed(3);
    dev.phone.style.opacity = vis.toFixed(3);
  }

  /** Cursor im Kamera-Raum (null, wenn aus) */
  function cursor(tG, camS) {
    if (tG < cursorPath[0][0] || tG >= 29.3) return null;
    let x = cursorPath[cursorPath.length - 1][1], y = cursorPath[cursorPath.length - 1][2];
    for (let i = 0; i < cursorPath.length - 1; i++) if (tG >= cursorPath[i][0] && tG < cursorPath[i + 1][0]) { const p = ease.uiInOut(prog(tG, cursorPath[i][0], cursorPath[i + 1][0])); x = lerp(cursorPath[i][1], cursorPath[i + 1][1], p); y = lerp(cursorPath[i][2], cursorPath[i + 1][2], p); }
    const d = tG - T.click, press = d >= -0.05 && d < 0.3 ? (d < 0.05 ? 1 - 0.16 * clamp((d + 0.05) / 0.1) : 0.84 + 0.16 * clamp((d - 0.05) / 0.25)) : 1;
    const k = clamp(0.8 / camS, 1, 2.6);
    const rip = d >= 0 && d < 0.55 ? d / 0.55 : -1;
    return { x, y, s: press * k, o: tw(tG, 24.2, 24.5) * (1 - tw(tG, 28.8, 29.2)), rip, ripS: k };
  }
  return { update, cursor };
}
