// ============================================================
// Act I – Chaos (0–20 s). Dunkel, kühl, bewusst „designtes“ Chaos.
//   hook 0–4 (letztes Wort steht 1,6 s) · m365 4–8,5 · opendesk 8,5–13 · nextcloud 13–17,5 · overwhelm 17,5–22 · pause 22–24 (+0.8)
//   Alle Zeiten kommen aus timeline.json (Karten, Pings, Shoves, Texte, Cut, Drop) – nur Feinheiten sind relativ dazu notiert.
//   Überforderung = fünf Blickwinkel im 0,75-s-Raster: Mitarbeitende (Login) · Teams (Tool) · Geschäftsführung (Abo) · Datenschutz (KI) · IT (Frage)
// Muster je Lösung: erst die Stärke, dann „ABER:“, dann drei Lücken – die Chips poppen auf den
// ping-hits der timeline.json. Linkado-Orange kommt hier NICHT vor (außer Faden+Flagge in der Pause).
// ============================================================
import { buildUI, avatarHTML, PEOPLE } from '../ui.js';
import { laptop, phone, mini, quote } from './act1-bits.js';
import { THREAD_Y } from './act2.js';

export default function register(E) {
  const { h, tf, tw, ease, prog, clamp, lerp, show, rng, icon } = E;
  const CREAM = '#F4EEE3', DIM = '#8E97AE', BG = '#131926';
  const ACC = { m365: '#E5565B', opendesk: '#7B6CF6', nextcloud: '#36A9E8' };
  const hit = (kind, v) => E.hits(kind, v).map((x) => x.t);
  const T0 = { m365: hit('card', 1)[0], opendesk: hit('card', 2)[0], nextcloud: hit('card', 3)[0] };
  const PING = { m365: hit('ping', 1), opendesk: hit('ping', 2), nextcloud: hit('ping', 3) };
  const SHOVE = { m365: hit('shove', 1)[0], opendesk: hit('shove', 2)[0], nextcloud: hit('shove', 3)[0] };
  const T_HOOK = T0.m365;                            // 3.5 – Ende des Hooks = erster Karten-Schlag
  const CUT = E.hits('cut')[0].t;                    // 22.0 – harter Schnitt
  const DROP = E.hits('drop')[0].t;                  // 24.0
  const TEXTS = E.hits('text').filter((x) => x.t >= CUT - 5 && x.t < CUT).map((x) => x.t);   // fünf Blickwinkel im 0,75-s-Raster
  const OV = TEXTS[0];                               // 17.5 – Beginn der Überforderung
  const ASK = E.hits('text').find((x) => x.t > CUT && x.t < DROP).t;                  // 23.0

  // Position der weggeschobenen Gruppen (um die Bildmitte 960/540)
  const PILE = { m365: { x: -600, y: -300, s: 0.46, r: -7 }, opendesk: { x: 600, y: -318, s: 0.44, r: 6 }, nextcloud: { x: -560, y: 330, s: 0.46, r: 5 } };

  E.style(`
  .a1-glow { position:absolute; inset:0; background: radial-gradient(1300px 850px at 36% 46%, #1E2739 0%, rgba(19,25,38,0) 72%), radial-gradient(1000px 700px at 90% 92%, #1B2335 0%, rgba(19,25,38,0) 70%); }
  .a1-grid { position:absolute; inset:-96px; background-image: linear-gradient(rgba(255,255,255,.04) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(255,255,255,.04) 1.5px, transparent 1.5px); background-size:96px 96px; }
  .a1-chip { position:absolute; left:0; top:0; padding:11px 20px; background:#F6F1E8; color:#1F2532; border-radius:7px; font:500 24px/1 var(--font-body); white-space:nowrap; box-shadow:0 6px 14px rgba(0,0,0,.38); }
  .a1-hook { position:absolute; left:0; right:0; top:318px; text-align:center; font:600 104px/1.05 var(--font-display); text-transform:uppercase; letter-spacing:-.005em; text-shadow:0 4px 26px rgba(10,14,22,.85); }
  .a1-hook .w { display:inline-block; overflow:hidden; vertical-align:top; padding:8px 16px 12px; margin:-8px -16px -12px; }
  .a1-hook .w > span { display:block; }
  .a1-badge { position:absolute; left:0; top:0; min-width:44px; height:44px; padding:0 12px; border-radius:22px; background:#E5565B; color:#fff; font:700 22px/44px var(--font-body); text-align:center; box-shadow:0 8px 20px rgba(0,0,0,.4); }
  .a1-card { position:absolute; left:110px; top:190px; width:870px; height:640px; border-radius:30px; background:#161D2C; border:1.5px solid rgba(255,255,255,.13); overflow:hidden; }
  .a1-acc { position:absolute; left:0; top:0; bottom:0; width:10px; }
  .a1-name2 { position:absolute; left:110px; top:128px; font:700 84px/1 var(--font-display); text-transform:uppercase; color:${CREAM}; letter-spacing:-.005em; white-space:nowrap; text-shadow:0 4px 22px rgba(10,14,22,.7); }
  .a1-name { position:absolute; left:58px; top:44px; font:700 84px/1 var(--font-display); text-transform:uppercase; color:${CREAM}; letter-spacing:-.005em; white-space:nowrap; }
  .a1-ok { position:absolute; left:58px; top:146px; display:flex; align-items:center; gap:14px; font:600 30px/1 var(--font-body); letter-spacing:.05em; color:#B9C1D3; text-transform:uppercase; white-space:nowrap; }
  .a1-ok .ck { width:34px; height:34px; border-radius:50%; background:rgba(63,191,138,.18); color:#3FBF8A; display:flex; align-items:center; justify-content:center; }
  .a1-ok b { color:var(--acc); font-weight:800; margin-left:2px; }
  .a1-gaps { position:absolute; left:58px; top:222px; width:760px; display:flex; flex-direction:column; gap:16px; }
  .a1-gap { display:flex; align-items:center; gap:22px; min-height:92px; padding:10px 28px 10px 18px; border-radius:20px; background:rgba(255,255,255,.06); border:1.5px solid rgba(255,255,255,.12); font:600 33px/1.1 var(--font-display); text-transform:uppercase; color:${CREAM}; letter-spacing:-.003em; }
  .a1-gap .ic { width:56px; height:56px; border-radius:16px; background:var(--acc); display:flex; align-items:center; justify-content:center; flex:none; color:#fff; }
  .a1-foot { position:absolute; left:58px; bottom:34px; display:flex; align-items:center; gap:12px; font:600 18px/1 var(--font-body); letter-spacing:.14em; color:#7E879B; }
  .a1-foot i { width:12px; height:12px; border-radius:50%; background:rgba(255,255,255,.18); display:block; }
  .a1-win { position:absolute; width:780px; height:520px; border-radius:22px; background:#F1F3F7; overflow:hidden; box-shadow:0 18px 40px rgba(0,0,0,.45); font-family:var(--font-body); color:#1F2532; }
  .a1-win .tb { position:absolute; left:0; top:0; right:0; height:56px; background:#fff; border-bottom:1.5px solid #E3E7EF; display:flex; align-items:center; gap:10px; padding:0 20px; }
  .a1-win .tb i { width:13px; height:13px; border-radius:50%; background:#D5DAE4; display:block; }
  .a1-win .tb b { margin-left:14px; font:600 18px/1 var(--font-body); color:#59627A; }
  .a1-tile { position:absolute; width:128px; height:128px; border-radius:26px; display:flex; align-items:center; justify-content:center; color:#fff; box-shadow:0 6px 14px rgba(31,37,50,.28); }
  .a1-tag { position:absolute; left:0; top:0; display:flex; align-items:center; gap:10px; padding:12px 20px 12px 14px; border-radius:12px; background:#F6F1E8; color:#1F2532; font:700 22px/1 var(--font-body); letter-spacing:.04em; box-shadow:0 8px 18px rgba(0,0,0,.42); white-space:nowrap; }
  .a1-sw { position:absolute; width:330px; height:236px; overflow:hidden; background:#fff; box-shadow:0 12px 28px rgba(0,0,0,.42); }
  .a1-sw .hd { height:46px; display:flex; align-items:center; padding:0 16px; color:#fff; font-size:19px; font-weight:700; }
  .a1-sw .bar { height:12px; margin:14px 16px 0; border-radius:4px; background:#E1E5EC; }
  .a1-login { position:absolute; left:0; top:0; width:330px; padding:20px 22px 22px; border-radius:16px; background:#1B2335; border:1.5px solid rgba(255,255,255,.18); box-shadow:0 14px 34px rgba(0,0,0,.55); font-family:var(--font-body); color:${CREAM}; }
  .a1-login h6 { margin:0 0 14px; font:700 20px/1 var(--font-display); text-transform:uppercase; letter-spacing:.04em; }
  .a1-login .f { height:42px; border-radius:9px; background:rgba(255,255,255,.08); border:1.5px solid rgba(255,255,255,.14); margin-bottom:10px; display:flex; align-items:center; padding:0 12px; font:500 17px/1 var(--font-body); color:#9AA3B8; }
  .a1-login .bt { height:44px; border-radius:9px; display:flex; align-items:center; justify-content:center; font:700 17px/1 var(--font-body); color:#fff; }
  .a1-big { position:absolute; left:0; right:0; text-align:center; text-transform:uppercase; font-family:var(--font-display); font-weight:700; color:${CREAM}; letter-spacing:-.005em; white-space:nowrap; }
  .a1-ai { position:absolute; left:0; top:0; width:300px; border-radius:14px; background:#1B2335; border:1.5px solid rgba(255,255,255,.16); box-shadow:0 14px 34px rgba(0,0,0,.55); overflow:hidden; font-family:var(--font-body); color:${CREAM}; }
  .a1-ai .hd { height:44px; display:flex; align-items:center; gap:10px; padding:0 16px; font:700 19px/1 var(--font-body); color:#fff; }
  .a1-ai .bd { padding:16px 16px 8px; } .a1-ai .bd i { display:block; height:11px; border-radius:4px; background:rgba(255,255,255,.18); margin-bottom:10px; }
  .a1-ai .ft { padding:0 16px 14px; display:flex; align-items:center; gap:8px; font:600 15px/1 var(--font-body); color:#E5565B; }
  .a1-role { position:absolute; left:0; right:0; top:344px; display:flex; justify-content:center; z-index:43; }
  .a1-role .p { display:inline-flex; align-items:center; gap:16px; padding:10px 26px 10px 12px; border-radius:99px; background:rgba(20,26,40,.94); border:1.5px solid rgba(255,255,255,.22); font:700 24px/1 var(--font-body); letter-spacing:.16em; color:#B9C1D3; white-space:nowrap; }
  .a1-role .ic { width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center; }
  .a1-role .dots { display:flex; gap:7px; margin-left:8px; } .a1-role .dots i { width:9px; height:9px; border-radius:50%; background:rgba(255,255,255,.22); display:block; }
  .a1-cap { position:absolute; left:0; right:0; top:588px; display:flex; justify-content:center; z-index:43; }
  .a1-cap .p { display:inline-flex; align-items:center; gap:12px; padding:12px 24px 12px 16px; border-radius:99px; background:#E5565B; color:#fff; font:700 24px/1 var(--font-body); letter-spacing:.1em; box-shadow:0 10px 26px rgba(229,86,91,.35); white-space:nowrap; }
  .a1-bubble { position:absolute; left:0; top:0; padding:14px 22px; border-radius:20px 20px 20px 5px; background:#E8E1D3; color:#1F2532; font:600 24px/1.2 var(--font-body); box-shadow:0 8px 18px rgba(0,0,0,.42); white-space:nowrap; }
  `);

  const FILES = ['protokoll_final_v4_NEU.docx', 'prompt_final_v7.txt', 'Aufgaben_Q3_(2).xlsx', 'KI-Zusammenfassung (2).pdf', 'Präsentation_v7_Kopie.pptx', 'Chat-Export_Montag.json', 'Notizen_Montag.txt', 'Termine_KW40_neu.ics',
    'Budget_2026_final_final.xlsx', 'Transkript_Meeting.vtt', 'Konzept_ENTWURF_v2.docx', 'Logo_final_final_v3.png', 'Fotos_Messe_Kopie (3).zip', 'Vertrag_unterschrieben_neu.pdf', 'Zugang_Projekt_alt.txt', 'Angebot_Hartmann_v2.pdf',
    'Mailanhang_Kopie_2.pdf', 'Preisliste_2025_alt.xlsx', 'Aufgaben_Liste_final.xlsx', 'prompt_test_neu.txt', 'Skizze_Messestand_v5.pptx', 'Einladung_Sommerfest.docx', 'Notizen_Kunde_neu.txt', 'KI-Entwurf_Mail_v3.docx'];

  E.scene({
    id: 'act1', span: ['hook', 'pause'], post: 0.8, z: 2,
    build(root) {
      root.style.background = BG;
      const r = rng(11);
      const glow = h('div', { class: 'a1-glow' }), grid = h('div', { class: 'a1-grid' });
      root.append(glow, grid);

      /* ---- schwebende Dateinamen-Chips (Marken-Motiv der Startseite) ---- */
      const chips = FILES.map((txt, i) => {
        const bg = i < 12;                         // Hintergrund-Chips (immer da) vs. Schwarm (nur in der Überforderung)
        const el = h('div', { class: 'a1-chip', text: txt });
        const d = { el, txt, bg, x: r.range(-140, 1800), y: r.range(40, 1010), rot: r.range(-9, 9), vx: r.range(-26, -8), vy: r.range(-6, 6), sc: r.range(0.8, 1.15), tIn: bg ? 0 : OV + (i - 12) * 0.2 };
        root.append(el); return d;
      });

      /* ---- Hintergrund-Oberflächen: unterschiedliche Fenster füllen nach und nach den Bildschirm (dim im Hook/den Alltagsmomenten, hell in der Überforderung) ---- */
      const BGW = [['mail', 40, 650, 300, 200, -4, 0.8], ['chat', 1500, 60, 320, 210, 3, 1.2], ['cal', 700, 30, 300, 200, -2, 1.8], ['sheet', 1580, 700, 300, 200, 4, 2.4], ['video', 60, 80, 280, 190, 3, 3.0],
        ['ticket', 840, 770, 320, 210, -3, 3.6], ['ai', 1300, 20, 280, 190, -3, 4.4], ['files', 20, 340, 260, 180, -2, 5.2], ['kanban', 1250, 790, 300, 200, 2, 6.0], ['form', 560, 870, 300, 190, -4, 7.0]];
      const bgw = BGW.map(([k, x, y, w, hh, rot, tIn]) => { const el = h('div', { class: 'abs', style: { left: 0, top: 0, zIndex: 2 } }, mini(E, k, w, hh)); root.append(el); return { el, x, y, rot, tIn }; });

      /* ---- Hook ---- */
      const word = (s, c) => h('span', { class: 'w' }, h('span', { text: s, style: { color: c } }));
      const w1 = word('Alles', DIM), w2 = word('funktioniert.', DIM), w3 = word('Nur nicht', DIM);
      // „dazwischen.“ – die beiden Hälften öffnen sich: das Dazwischen wird sichtbar
      const hl = h('span', { text: 'dazwi', style: { display: 'inline-block' } }), hr = h('span', { text: 'schen.', style: { display: 'inline-block' } });
      const w4 = h('span', { class: 'w' }, h('span', { style: { color: CREAM } }, hl, hr));
      const hook = h('div', { class: 'a1-hook' }, h('div', {}, w1, ' ', w2), h('div', {}, w3, ' ', w4));
      root.append(hook);
      const hookBadges = [[430, 250, '3'], [1500, 330, '12'], [1280, 780, '7']].map(([x, y, n]) => { const b = h('div', { class: 'a1-badge', text: n }); root.append(b); return { el: b, x, y }; });

      /* ---- Drei Alltagsmomente (statt Kartenliste): Titel + Stärke, darunter Sätze von Kolleg*innen mit Profilbild; rechts Laptop/Handy voller Apps ---- */
      const mkGroup = (cfg, i) => {
        const g = h('div', { class: 'abs', style: { left: 0, top: 0, width: 1920, height: 1080, transformOrigin: '960px 540px', zIndex: 10 + i } });
        const name = h('div', { class: 'a1-name2', text: cfg.name, style: { fontSize: cfg.size + 'px' } });
        const ok = h('div', { class: 'a1-ok', style: { '--acc': cfg.acc, left: '110px', top: '246px' } }, h('span', { class: 'ck', html: icon('check', 20, '#3FBF8A', 3) }), h('span', { text: cfg.ok }), h('b', { text: 'ABER:' }));
        const qs = cfg.quotes.map(([key, role, txt], k) => { const el = quote(E, avatarHTML(key, 58), { who: PEOPLE[key].name.split(' ')[0], role, text: txt, w: cfg.qw[k] }); Object.assign(el.style, { left: cfg.qpos[k][0] + 'px', top: cfg.qpos[k][1] + 'px' }); return el; });
        g.append(name, ok, ...qs);
        const vis = cfg.visual(g);
        root.append(g);
        return { id: cfg.id, g, name, ok, qs, qrot: cfg.qrot, vis, t0: T0[cfg.id], pings: PING[cfg.id], shove: SHOVE[cfg.id], pile: PILE[cfg.id] };
      };
      const APPCOL = ['#2F6FDE', '#1E9E6A', '#E5565B', '#36A9E8', '#7B6CF6', '#14A8A8', '#4C5BD4', '#D1497A'];
      const APPICO = ['file-text', 'table-2', 'presentation', 'mail', 'calendar', 'message-square', 'cloud', 'users'];

      /* Visual 1 – Allrounder: Laptop mit „Alle Apps“, Handy mit Benachrichtigungen, Preisschilder, ein Kachel, die nicht passt */
      const vSuite = (g) => {
        const lap = laptop(E); Object.assign(lap.el.style, { left: '980px', top: '250px', zIndex: 3 }); g.append(lap.el);
        const scr = lap.screen; scr.style.background = 'linear-gradient(135deg,#1B2840,#0F1626)';
        scr.append(h('div', { class: 'abs', style: { left: 0, top: 0, right: 0, height: 26, background: 'rgba(255,255,255,.08)' } }));
        const back = mini(E, 'chat', 300, 200); Object.assign(back.style, { left: '470px', top: '250px', transform: 'rotate(3deg)' }); scr.append(back);
        const win = h('div', { class: 'abs', style: { left: 60, top: 54, width: 580, height: 372, borderRadius: 12, background: '#F1F3F7', overflow: 'hidden', boxShadow: '0 12px 30px rgba(0,0,0,.45)' } },
          h('div', { class: 'abs', style: { left: 0, top: 0, right: 0, height: 36, background: '#fff', borderBottom: '1.5px solid #E3E7EF', display: 'flex', alignItems: 'center', gap: 8, padding: '0 14px', font: '700 14px/1 var(--font-body)', color: '#59627A' } }, h('i', { style: { width: 10, height: 10, borderRadius: '50%', background: '#D5DAE4', display: 'block' } }), h('i', { style: { width: 10, height: 10, borderRadius: '50%', background: '#D5DAE4', display: 'block' } }), 'Alle Apps'));
        const tiles = APPCOL.map((c, k) => { const el = h('div', { class: 'abs', style: { left: 42 + (k % 4) * 134, top: 66 + Math.floor(k / 4) * 148, width: 110, height: 110, borderRadius: 24, background: c, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 14px rgba(31,37,50,.28)' }, html: icon(APPICO[k], 48, '#fff', 2) }); win.append(el); return el; });
        const ghost = h('div', { class: 'abs', style: { left: 42 + 3 * 134 - 5, top: 66 + 148 - 5, width: 120, height: 120, borderRadius: 28, border: '3px dashed rgba(229,86,91,.9)', zIndex: 3 } });
        win.append(ghost); scr.append(win);
        scr.append(h('div', { class: 'abs', style: { left: 0, right: 0, bottom: 0, height: 34, background: 'rgba(255,255,255,.1)', display: 'flex', alignItems: 'center', gap: 12, padding: '0 16px' } }, ...APPCOL.map((c) => h('i', { style: { width: 20, height: 20, borderRadius: 6, background: c, display: 'block', opacity: 0.85 } }))));
        // Handy daneben, voller Apps und Benachrichtigungen
        const ph = phone(E); Object.assign(ph.el.style, { left: '1640px', top: '470px', zIndex: 5 }); g.append(ph.el);
        ph.screen.style.background = 'linear-gradient(160deg,#2B3A5E,#141B2E)';
        const badges = [];
        for (let k = 0; k < 20; k++) { const ic = h('div', { class: 'abs', style: { left: 22 + (k % 4) * 70, top: 76 + Math.floor(k / 4) * 92, width: 58, height: 58, borderRadius: 15, background: APPCOL[(k * 3) % 8], display: 'flex', alignItems: 'center', justifyContent: 'center' }, html: icon(APPICO[(k * 5) % 8], 28, '#fff', 2) }); if (k % 3 !== 1) { const b = h('div', { class: 'a1-badge', text: String(2 + ((k * 7) % 40)), style: { left: 38, top: -10, transform: 'scale(.7)', transformOrigin: '0 50%', display: 'none' } }); ic.append(b); badges.push(b); } ph.screen.append(ic); }
        const tags = ['+ LIZENZ', '+ ADD-ON', '+ SPEICHER', '+ KI-ZUSATZ'].map((txt) => { const el = h('div', { class: 'a1-tag', style: { zIndex: 8 } }, h('span', { html: icon('euro', 24, '#E5565B', 2.6) }), txt); g.append(el); return el; });
        const peeks = [['mail', 940, 40, -4], ['cal', 1290, 30, 3]].map(([k, x, y, r]) => { const el = mini(E, k, 300, 190); Object.assign(el.style, { left: x + 'px', top: y + 'px', zIndex: 1 }); g.append(el); return { el, r }; });
        return {
          update(t, t0, P) {
            const a = t - t0, p = tw(a, 0, 0.7, ease.ui);
            tf(lap.el, { x: 90 * (1 - p), y: 24 * (1 - p), o: tw(a, 0, 0.5), r: -1.2 });
            tiles.forEach((el, k) => { const q = tw(a, 0.25 + k * 0.06, 0.7 + k * 0.06, ease.snap); const j = k === 7 ? tw(t, P[1], P[1] + 0.35, ease.snap) : 0; tf(el, { s: 0.6 + 0.4 * q, o: clamp(q * 1.5), x: 36 * j, y: -30 * j, r: 12 * j }); });
            show(ghost, t >= P[1]); tf(ghost, { o: tw(t, P[1], P[1] + 0.3, ease.out3) });
            const pp = tw(a, 0.55, 1.2, ease.ui); tf(ph.el, { x: 0, y: 160 * (1 - pp), s: 0.56, o: pp });
            badges.forEach((b, k) => { const tt = P[2] - 0.2 + k * 0.05; show(b, t >= tt); });
            tags.forEach((el, k) => { const tt = P[0] + k * 0.11, q = tw(t, tt, tt + 0.5, ease.out3), bounce = Math.abs(Math.sin(q * Math.PI * 1.5)) * (1 - q) * 40; show(el, t >= tt - 0.01); tf(el, { x: 1580 + (k % 2) * 40 - k * 6, y: 190 + k * 76 - (1 - q) * 240 - bounce, r: -8 + k * 6, o: clamp(q * 3) }); });
            peeks.forEach((pk, k) => { const tt = P[2] + k * 0.15, q = tw(t, tt, tt + 0.5, ease.snap); show(pk.el, t >= tt); tf(pk.el, { y: -30 * (1 - q), s: 0.8 + 0.2 * q, r: pk.r, o: clamp(q * 2) * 0.95 }); });
          },
        };
      };

      /* Visual 2 – Fertiges Portal: ein Login am Handy, dahinter öffnen sich viele unterschiedliche Oberflächen */
      const vPortal = (g) => {
        const ph = phone(E); Object.assign(ph.el.style, { left: '1260px', top: '190px', zIndex: 4 }); g.append(ph.el);
        ph.screen.style.background = 'linear-gradient(160deg,#2A2150,#101226)';
        const tilesP = ['Dateien', 'Mail', 'Chat', 'Wiki', 'Projekte', 'Büro'].map((n, k) => { const el = h('div', { class: 'abs', style: { left: 24 + (k % 2) * 138, top: 110 + Math.floor(k / 2) * 150, width: 120, height: 130, borderRadius: 20, background: '#EEEAFE', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, font: '600 17px/1 var(--font-body)', color: '#4B3FC7' }, html: icon('app-window', 40, '#7B6CF6', 2) + `<span>${n}</span>` }); ph.screen.append(el); return el; });
        const panel = h('div', { class: 'abs', style: { left: 24, top: 130, width: 258, height: 380, borderRadius: 20, background: '#fff', padding: '28px 22px', transformOrigin: '0 50%', boxShadow: '0 14px 40px rgba(0,0,0,.4)' } },
          h('div', { style: { font: '700 24px/1 var(--font-display)', textTransform: 'uppercase', marginBottom: 26, color: '#1F2532' }, text: 'Anmelden' }),
          h('div', { style: { height: 48, borderRadius: 10, background: '#F1F3F7', border: '1.5px solid #E3E7EF', marginBottom: 14 } }), h('div', { style: { height: 48, borderRadius: 10, background: '#F1F3F7', border: '1.5px solid #E3E7EF', marginBottom: 24 } }), h('div', { style: { height: 52, borderRadius: 10, background: '#7B6CF6' } }));
        ph.screen.append(panel);
        const hl = h('div', { class: 'abs', style: { left: 16, top: 122, width: 274, height: 396, borderRadius: 26, border: '4px solid #7B6CF6', boxShadow: '0 0 40px rgba(123,108,246,.6)', zIndex: 3 } }); ph.screen.append(hl);
        const AROUND = [['files', 960, 210, 300, 200, -4], ['chat', 950, 560, 290, 200, 3], ['mail', 1620, 170, 300, 200, 4], ['sheet', 1630, 580, 290, 200, -3], ['ticket', 1290, 880, 320, 190, 2]];
        const wins = AROUND.map(([k, x, y, w, hh, r], i) => { const el = mini(E, k, w, hh); Object.assign(el.style, { left: x + 'px', top: y + 'px', zIndex: 2 }); g.append(el); return { el, r, i }; });
        return {
          update(t, t0, P) {
            const a = t - t0, p = tw(a, 0, 0.7, ease.ui);
            tf(ph.el, { x: 90 * (1 - p), y: 20 * (1 - p), o: tw(a, 0, 0.5), r: -2 });
            tf(hl, { o: tw(t, t0 + 0.3, t0 + 0.6) * (1 - tw(t, P[0], P[0] + 0.5)) * (0.7 + 0.3 * Math.sin(t * 14)) });
            const door = ease.io3(prog(t, P[0], P[0] + 0.7));
            panel.style.transform = `perspective(900px) rotateY(${(-80 * door).toFixed(2)}deg)`; panel.style.opacity = 1 - 0.95 * door;
            tilesP.forEach((el, k) => { const q = tw(t, P[0] + 0.2 + k * 0.06, P[0] + 0.6 + k * 0.06, ease.snap); tf(el, { s: 0.6 + 0.4 * q, o: clamp(q * 2) }); });
            wins.forEach((w, k) => { const tt = P[1] + k * 0.12, q = tw(t, tt, tt + 0.5, ease.snap), sp = tw(t, P[2], P[2] + 0.6, ease.snap); show(w.el, t >= tt); tf(w.el, { x: [-24, -20, 22, 24, 0][k] * sp, y: [-14, 12, -12, 14, 18][k] * sp + 8 * Math.sin(t * 2 + k), r: w.r + [-3, 3, -3, 3, 2][k] * sp, s: 0.6 + 0.4 * q, o: clamp(q * 2) }); });
          },
        };
      };

      /* Visual 3 – Offene Basis: Laptop mit nacktem Wireframe, Update-Balken „selbst erledigen“, Werkzeug-Symbole, ein Ticket */
      const vBase = (g) => {
        const lap = laptop(E); Object.assign(lap.el.style, { left: '980px', top: '250px', zIndex: 3 }); g.append(lap.el);
        const ui = buildUI(E); const w = ui.window({ raw: true }); w.setActive('Startseite'); w.main.append(ui.home().el);
        w.el.style.transformOrigin = '0 0'; w.el.style.transform = `scale(${(812 / 1480).toFixed(4)})`; lap.screen.append(w.el);
        const bar = h('div', { class: 'abs', style: { left: 980, top: 852, width: 840, height: 70, borderRadius: 16, background: '#1B2335', border: '1.5px solid rgba(255,255,255,.14)', display: 'flex', alignItems: 'center', gap: 18, padding: '0 24px', zIndex: 4 } },
          h('span', { html: icon('triangle-alert', 30, '#36A9E8', 2.4) }), h('span', { text: 'UPDATES: SELBST ERLEDIGEN', style: { font: '700 20px/1 var(--font-body)', letterSpacing: '.1em', color: CREAM, whiteSpace: 'nowrap' } }),
          h('div', { style: { flex: 1, height: 14, borderRadius: 7, background: 'rgba(255,255,255,.12)', position: 'relative', overflow: 'hidden' } }, h('div', { class: 'fillbar', style: { position: 'absolute', left: 0, top: 0, bottom: 0, width: '0%', background: '#36A9E8', borderRadius: 7 } })));
        g.append(bar);
        const tools = ['wrench', 'server', 'hammer'].map((n, k) => { const el = h('div', { class: 'abs', style: { left: 1000 + k * 300, top: 200, width: 76, height: 76, borderRadius: 20, background: '#36A9E8', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 18px rgba(0,0,0,.45)', zIndex: 6 }, html: icon(n, 40, '#fff', 2.2) }); g.append(el); return el; });
        const tk = mini(E, 'ticket', 300, 190); Object.assign(tk.style, { left: '1560px', top: '30px', zIndex: 2 }); g.append(tk);
        const mailg = mini(E, 'files', 280, 180); Object.assign(mailg.style, { left: '1250px', top: '20px', zIndex: 1 }); g.append(mailg);
        return {
          update(t, t0, P) {
            const a = t - t0, sc = 1;
            tf(lap.el, { x: 90 * (1 - tw(a, 0.0, 0.7, ease.ui)), y: 24 * (1 - tw(a, 0, 0.7, ease.ui)), o: tw(a, 0.0, 0.5) * (1 - 0.18 * Math.max(0, Math.sin((t - P[1]) * 22)) * (t > P[1] && t < P[1] + 0.35 ? 1 : 0)), r: 1.2 });
            tf(bar, { y: 40 * (1 - tw(t, P[0] - 0.1, P[0] + 0.4, ease.ui)), o: tw(t, P[0] - 0.1, P[0] + 0.3) });
            bar.querySelector('.fillbar').style.width = (28 * ease.out3(prog(t, P[0] + 0.1, P[0] + 1.0))) + '%';
            tools.forEach((el, k) => { const tt = P[1] + k * 0.1, p = tw(t, tt, tt + 0.45, ease.snap); show(el, t >= tt); tf(el, { y: -50 * (1 - p) + 6 * Math.sin(t * 3 + k), s: 0.5 + 0.5 * p, o: clamp(p * 2), r: (k - 1) * 8 }); });
            [tk, mailg].forEach((el, k) => { const tt = P[2] + k * 0.15, q = tw(t, tt, tt + 0.5, ease.snap); show(el, t >= tt); tf(el, { y: -26 * (1 - q), s: 0.8 + 0.2 * q, r: k ? -3 : 3, o: clamp(q * 2) * 0.95 }); });
          },
        };
      };

      // Bewusst ohne Produkt- oder Firmennamen: drei Ansätze, die jeder kennt – erst die Stärke, dann das „Aber“, ausgedrückt in Alltagssätzen.
      const cfgs = [
        { id: 'm365', name: 'DER ALLROUNDER', size: 84, ok: 'ALLES AUS EINER HAND.', acc: ACC.m365, visual: vSuite,
          quotes: [['anna', 'Vertrieb', 'Und wenn der Anbieter die Regeln ändert?'], ['jonas', 'Einkauf', 'Jede Erweiterung kostet extra – und die nächste auch.'], ['lena', 'Projekte', 'Wir passen uns der Software an. Nicht umgekehrt.']],
          qpos: [[110, 380], [200, 540], [130, 700]], qw: [640, 700, 680], qrot: [-1, 0.8, -0.6] },
        { id: 'opendesk', name: 'DAS FERTIGE PORTAL', size: 68, ok: 'OFFEN UND LOKAL GEDACHT.', acc: ACC.opendesk, visual: vPortal,
          quotes: [['tom', 'Geschäftsführung', 'Ein Login, schön. Dahinter ist alles anders.'], ['aylin', 'Büro', 'Die Mail sieht anders aus als der Chat – und der anders als die Dateien.'], ['ben', 'Buchhaltung', 'Es fühlt sich nicht wie ein Ganzes an.']],
          qpos: [[110, 380], [190, 540], [130, 730]], qw: [660, 720, 620], qrot: [0.8, -0.8, 0.6] },
        { id: 'nextcloud', name: 'DIE OFFENE BASIS', size: 76, ok: 'MÄCHTIG UND FREI.', acc: ACC.nextcloud, visual: vBase,
          quotes: [['ben', 'Buchhaltung', 'Das Update spielen wir natürlich selbst ein.'], ['lena', 'Projekte', 'Mächtig, ja. Im Alltag sieht es noch roh aus.'], ['tom', 'Geschäftsführung', 'Für die Kolleg*innen ist das einfach zu technisch.']],
          qpos: [[110, 380], [200, 540], [120, 700]], qw: [650, 660, 700], qrot: [-0.8, 0.8, -0.6] },
      ];
      const groups = cfgs.map(mkGroup);

      /* ---- Überforderung (14–18): fünf Blickwinkel – Login · Tool · Abo · KI · IT ---- */
      const logins = [[120, 120, '#E5565B', 'Firmen-Konto'], [1480, 150, '#7B6CF6', 'Portal-Login'], [1360, 700, '#36A9E8', 'Cloud-Zugang'], [150, 700, '#8E97AE', 'VPN']].map(([x, y, c, ttl], k) => {
        const el = h('div', { class: 'a1-login', style: { borderTop: `6px solid ${c}` } }, h('h6', { text: ttl }), h('div', { class: 'f', text: 'Benutzername' }), h('div', { class: 'f', text: '••••••••' }), h('div', { class: 'bt', style: { background: c }, text: 'Anmelden' }));
        root.append(el); return { el, x, y, c, rot: [-6, 5, -4, 7][k] };
      });
      const tabBar = h('div', { class: 'abs', style: { left: 0, top: 0, width: 1920, height: 66, background: '#0E131E', borderBottom: '1.5px solid rgba(255,255,255,.12)', zIndex: 30 } });
      const tabs = Array.from({ length: 36 }, (_, k) => { const col = ['#E5565B', '#7B6CF6', '#36A9E8', '#3FBF8A', '#8E97AE', '#D1497A'][k % 6]; const el = h('div', { class: 'abs', style: { top: 12, height: 54, borderRadius: '12px 12px 0 0', background: '#1E2638', border: '1.5px solid rgba(255,255,255,.1)', borderBottom: 'none' } }, h('div', { class: 'abs', style: { left: 12, top: 17, width: 20, height: 20, borderRadius: 5, background: col } }), h('div', { class: 'abs', style: { left: 42, top: 22, right: 12, height: 10, borderRadius: 4, background: 'rgba(255,255,255,.22)' } })); tabBar.append(el); return el; });
      const tabCount = h('div', { class: 'abs', style: { right: 24, top: 14, height: 42, padding: '0 18px', borderRadius: 21, background: '#E5565B', color: '#fff', font: '700 22px/42px var(--font-body)', zIndex: 5 } });
      tabBar.append(tabCount); root.append(tabBar);
      const toolTiles = Array.from({ length: 12 }, (_, k) => { const c = ['#2F6FDE', '#1E9E6A', '#E5565B', '#36A9E8', '#7B6CF6', '#14A8A8', '#4C5BD4', '#D1497A'][k % 8]; const el = h('div', { class: 'a1-tile', style: { background: c, width: 110, height: 110, left: 0, top: 0 }, html: icon(['file-text', 'table-2', 'presentation', 'mail', 'calendar', 'message-square', 'cloud', 'users', 'notebook-pen', 'kanban', 'video', 'clipboard-list'][k], 46, '#fff', 2) }); const b = h('div', { class: 'a1-badge', text: String(3 + ((k * 7) % 96)), style: { left: 74, top: -14, transform: 'scale(.7)', transformOrigin: '0 50%' } }); el.append(b); root.append(el); return { el, x: r.range(180, 1640), y: r.range(120, 900), rot: r.range(-12, 12) }; });
      // Blickwinkel Geschäftsführung: Abos stapeln sich
      const aboTags = ['+ LIZENZ', '+ ADD-ON', '+ SPEICHER', '+ KI-ZUSATZ', '+ SUPPORT', '+ NOCH EIN PAKET'].map((txt, k) => { const el = h('div', { class: 'a1-tag', style: { zIndex: 36 } }, h('span', { html: icon('euro', 24, '#E5565B', 2.6) }), txt); root.append(el); return { el, x: [150, 1500, 1380, 190, 760, 1010][k], y: [170, 230, 800, 760, 118, 880][k], rot: [-7, 6, -5, 5, -3, 4][k] }; });
      const aboCount = h('div', { class: 'abs', style: { left: 0, top: 0, height: 42, padding: '0 18px', borderRadius: 21, background: '#E5565B', color: '#fff', font: '700 22px/42px var(--font-body)', zIndex: 37 } }); root.append(aboCount);
      // Blickwinkel Datenschutz: jede*r bringt die eigene KI mit
      const ais = [['Chat-KI', '#7B6CF6', 140, 120], ['Notiz-KI', '#36A9E8', 1480, 110], ['Bild-KI', '#E5565B', 1440, 740], ['Meeting-KI', '#D1497A', 100, 730], ['Übersetzer-KI', '#3FBF8A', 1010, 850]].map(([name, col, x, y], k) => {
        const el = h('div', { class: 'a1-ai', style: { zIndex: 36 } }, h('div', { class: 'hd', style: { background: col } }, h('span', { html: icon('sparkles', 20, '#fff', 2.2) }), name), h('div', { class: 'bd' }, h('i'), h('i', { style: { width: '64%' } }), h('i', { style: { width: '82%' } })), h('div', { class: 'ft' }, h('span', { html: icon('cloud-upload', 17, '#E5565B', 2.4) }), 'sendet Daten …'));
        root.append(el); return { el, x, y, rot: [-5, 4, -4, 5, -2][k] };
      });
      const aiCap = h('div', { class: 'a1-cap' }, h('div', { class: 'p' }, h('span', { html: icon('shield-alert', 28, '#fff', 2.2) }), 'WOHIN GEHEN DIE DATEN?')); root.append(aiCap);
      // Blickwinkel IT: Fragen
      const asks = ['Wo ist die Datei?', 'Passwort vergessen?', 'Wer hat Zugriff?', 'Ticket #4711 offen', 'Welche Version gilt?', 'Darf die KI das?'].map((txt, k) => { const el = h('div', { class: 'a1-bubble', text: txt }); root.append(el); return { el, x: [160, 1380, 620, 1250, 260, 900][k], y: [250, 330, 820, 860, 640, 180][k], rot: [-4, 3, -2, 4, -3, 2][k] }; });
      const vig = h('div', { class: 'abs', style: { left: 160, top: 300, width: 1600, height: 480, background: 'radial-gradient(closest-side, rgba(14,19,30,.94), rgba(14,19,30,.86) 55%, rgba(14,19,30,0))', zIndex: 40 } });
      const BIGS = [['NOCH EIN LOGIN.', 120], ['NOCH EIN TOOL.', 120], ['NOCH EIN ABO.', 120], ['NOCH EINE KI.', 120], ['NOCH EINE FRAGE AN DIE IT.', 100]];
      const bigs = BIGS.map(([txt, sz], k) => {
        const mk = (col, extra = {}) => h('div', { class: 'a1-big', text: txt, style: { top: 470 - sz / 2, fontSize: sz, color: col, zIndex: 42, ...extra } }); const main = mk(CREAM); const gr = mk('#E5565B', { zIndex: 41 }); const gc = mk('#36A9E8', { zIndex: 41 });
        root.append(gr, gc, main); return { main, gr, gc };
      });
      const ROLES = [['user-round', 'MITARBEITENDE', '#E5565B'], ['users', 'TEAMS', '#7B6CF6'], ['banknote', 'GESCHÄFTSFÜHRUNG', '#E5565B'], ['shield-check', 'DATENSCHUTZ', '#7B6CF6'], ['headphones', 'IT-ABTEILUNG', '#36A9E8']];
      const roles = ROLES.map(([ico, txt, col], k) => { const el = h('div', { class: 'a1-role' }, h('div', { class: 'p' }, h('span', { class: 'ic', style: { background: col }, html: icon(ico, 24, '#fff', 2.2) }), h('span', { text: txt }), h('span', { class: 'dots' }, ROLES.map((_, q) => h('i', { style: { background: q === k ? col : '' } }))))); root.append(el); return el; });
      root.append(vig);

      /* ---- Pause ---- */
      const ask = h('div', { class: 'a1-big', style: { top: 428, fontSize: 112, zIndex: 50, fontWeight: 600 } });
      const askLetters = 'ES GEHT AUCH ANDERS.'.split('').map((ch) => h('span', { text: ch === ' ' ? ' ' : ch, style: { display: 'inline-block' } })); ask.append(...askLetters);
      const thr = h('svg', { class: 'abs', width: 1920, height: 1080, viewBox: '0 0 1920 1080', style: { left: 0, top: 0, zIndex: 50 } }, h('line', { x1: 0, y1: THREAD_Y, x2: 1860, y2: THREAD_Y, stroke: '#E67E22', 'stroke-width': 4, 'stroke-linecap': 'round' }));
      const thrFlag = h('span', { class: 'flag abs', style: { width: 28, height: 14, zIndex: 51 } });
      root.append(ask, thr, thrFlag);
      const dark = h('div', { class: 'abs', style: { inset: 0, background: '#0E131E', zIndex: 35 } }); root.append(dark);
      // Sog in den Drop: der Faden glüht auf, ein orangenes Licht wächst aus der Linie, kurz vor 20.0 „atmet alles ein“
      const pGlow = h('div', { class: 'abs', style: { left: 60, top: THREAD_Y - 900, width: 1800, height: 1800, background: 'radial-gradient(closest-side, rgba(230,126,34,.55), rgba(230,126,34,.18) 45%, rgba(230,126,34,0) 100%)', zIndex: 36 } }); root.append(pGlow);

      return { pGlow, bgw, glow, grid, chips, hook, w1, w2, w3, w4, hl, hr, hookBadges, groups, logins, tabBar, tabs, tabCount, toolTiles, aboTags, aboCount, ais, aiCap, asks, vig, bigs, roles, ask, askLetters, thr, thrFlag, dark };
    },

    update(t, s) {
      const pre = t < CUT;                         // vor dem harten Schnitt
      /* ---- Hintergrund ---- */
      s.grid.style.transform = `translate(${(-t * 6).toFixed(2)}px,${(-t * 3).toFixed(2)}px)`;
      s.glow.style.opacity = pre ? 1 : 0.55;
      const dk = t < CUT ? 0 : (t < ASK + 0.9 ? 1 : 1);      // ab dem Schnitt komplett dunkel (Atempause)
      show(s.dark, !pre); s.dark.style.opacity = 1;
      s.grid.style.opacity = pre ? 1 : 0.4;

      /* ---- Dateinamen-Chips ---- */
      const over = prog(t, OV, CUT - 0.2);
      s.chips.forEach((c, i) => {
        if (!pre) { show(c.el, false); return; }
        let o, sc = c.sc;
        if (c.bg) { o = t < T_HOOK ? (0.2 + 0.05 * Math.sin(i)) * (c.y > 250 && c.y < 600 ? 0.3 : 1) : (t < OV ? 0.14 : lerp(0.14, 0.8, ease.out2(over))); o *= tw(t, 0, 0.8); sc *= 1 + 0.25 * over; }
        else { const p = tw(t, c.tIn, c.tIn + 0.35, ease.snap); o = p * 0.95; sc *= 0.7 + 0.35 * p; }
        show(c.el, o > 0.01);
        const spd = 1 + 2.4 * over;
        tf(c.el, { x: c.x + c.vx * t * spd, y: c.y + c.vy * t * spd, r: c.rot + Math.sin(t * 1.3 + i) * 1.2 * (1 + over * 3), s: sc, o });
      });

      /* ---- Hintergrund-Oberflächen ---- */
      const ov = prog(t, OV, CUT - 0.2);
      s.bgw.forEach((w, i) => {
        const p = tw(t, w.tIn * 1.3, w.tIn * 1.3 + 0.9, ease.ui), o = (t < OV ? 0.26 : lerp(0.26, 0.6, ease.out2(ov))) * p;
        show(w.el, pre && o > 0.01);
        tf(w.el, { x: w.x + 6 * Math.sin(t * 0.7 + i), y: w.y + 5 * Math.cos(t * 0.6 + i) + 20 * (1 - p), r: w.rot, s: 1 + 0.12 * ov, o });
      });

      /* ---- Hook (0–4): ruhig gesetzt, „dazwischen.“ landet bei 2,4 und steht 1,6 s, bevor der Schnitt kommt ---- */
      const hk = (el, t0) => tf(el.firstChild, { y: 130 * (1 - tw(t, t0, t0 + 0.9, ease.ui)) });
      hk(s.w1, 0.3); hk(s.w2, 0.8); hk(s.w3, 1.8); hk(s.w4, 2.4);
      const gap = 34 * tw(t, 2.6, 3.5, ease.out3); tf(s.hl, { x: 0 }); tf(s.hr, { x: gap });
      const hx = tw(t, T_HOOK - 0.2, T_HOOK, ease.in3);                // harter Schnitt auf den Karten-Schlag
      show(s.hook, t < T_HOOK + 0.02); tf(s.hook, { y: -50 * hx, o: 1 - hx });
      s.hookBadges.forEach((b, k) => { const t0 = [0.8, 1.8, 2.4][k], p = tw(t, t0, t0 + 0.45, ease.snap); show(b.el, t >= t0 && t < T_HOOK + 0.02); tf(b.el, { x: b.x, y: b.y, s: 0.3 + 0.7 * p, o: clamp(p * 2) * (1 - hx) }); });

      /* ---- Karten-Gruppen ---- */
      s.groups.forEach((G, gi) => {
        const a = t - G.t0;
        const visible = pre && t >= G.t0 - 0.02;
        show(G.g, visible); if (!visible) return;
        // Auftritt (Slam) + Wegschieben (Pile) + leichter Drift
        const slam = tw(a, 0, 0.5, ease.snap), sh = tw(t, G.shove, G.shove + 0.55, ease.uiInOut);
        const grow = 1 + 0.1 * prog(t, OV, CUT - 0.2) * sh;
        const P = G.pile;
        const sc = lerp(1, P.s, sh) * grow, tx = lerp(0, P.x, sh), ty = lerp(0, P.y, sh), rot = lerp(-1.2, P.r, sh) + Math.sin(t * 0.8 + gi) * 0.6 * sh;
        const sl = 1.09 - 0.09 * slam;
        tf(G.g, { x: tx, y: ty + 34 * (1 - slam) * (1 - sh), s: sc * (sh > 0 ? 1 : sl), r: rot, o: clamp(slam * 2) * (1 - 0.8 * sh * (t < OV ? 1 : 1 - 0.15 * prog(t, OV, CUT - 1))) });
        G.g.style.zIndex = String(10 + gi + (sh > 0.5 ? -8 : 0));
        // Titel, Stärke und Alltagssätze (die Sätze erscheinen auf den Pings; beim Wegschieben bleiben nur Gerät und Titel als Schatten)
        tf(G.name, { y: 18 * (1 - tw(a, 0.05, 0.5, ease.ui)), o: tw(a, 0.05, 0.45) * (1 - 0.5 * sh) });
        tf(G.ok, { y: 16 * (1 - tw(a, 0.3, 0.7, ease.ui)), o: tw(a, 0.3, 0.65) * (1 - 0.5 * sh) });
        G.qs.forEach((q, k) => { const tt = G.pings[k] != null ? G.pings[k] : G.t0 + 0.75 * (k + 1), p = tw(t, tt, tt + 0.45, ease.snap); tf(q, { x: -34 * (1 - p), y: 14 * (1 - p), s: 0.92 + 0.08 * p, r: G.qrot[k], o: clamp(p * 2) * (1 - tw(t, G.shove + 0.1, G.shove + 0.45)) }); });
        G.vis.update(t, G.t0, G.pings);
      });

      /* ---- Überforderung (14–18): fünf Blickwinkel auf dem 3/16-Raster (0,75 s) ---- */
      const B = TEXTS;                                                // 14.0 · 14.75 · 15.5 · 16.25 · 17.0
      s.logins.forEach((lg, k) => { const t0 = B[0] + k * 0.12, p = tw(t, t0, t0 + 0.4, ease.snap); show(lg.el, pre && t >= t0); tf(lg.el, { x: lg.x, y: lg.y + 8 * Math.sin(t * 2 + k), r: lg.rot, s: 0.7 + 0.3 * p, o: clamp(p * 2) * (t > B[4] ? 1 : 0.92) }); });
      const tabsOn = pre && t >= B[1] - 0.05;
      show(s.tabBar, tabsOn); tf(s.tabBar, { y: -70 * (1 - tw(t, B[1] - 0.05, B[1] + 0.3, ease.ui)) });
      const nTabs = Math.floor(lerp(3, 36, ease.out2(prog(t, B[1], CUT - 0.4)))); const wTab = Math.min(190, (1800 - 220) / Math.max(1, nTabs));
      s.tabs.forEach((el, k) => { show(el, k < nTabs); el.style.left = (20 + k * (wTab + 2)) + 'px'; el.style.width = wTab + 'px'; });
      s.tabCount.textContent = nTabs + ' TABS';
      s.toolTiles.forEach((tl, k) => { const t0 = B[1] + k * 0.045, p = tw(t, t0, t0 + 0.35, ease.snap); show(tl.el, pre && t >= t0); tf(tl.el, { x: tl.x, y: tl.y + 10 * Math.sin(t * 2.2 + k), r: tl.rot, s: 0.5 + 0.5 * p, o: clamp(p * 2) }); });
      s.aboTags.forEach((a, k) => { const t0 = B[2] + k * 0.09, p = tw(t, t0, t0 + 0.4, ease.snap); show(a.el, pre && t >= t0); tf(a.el, { x: a.x, y: a.y - (1 - p) * 120 + 5 * Math.sin(t * 2.4 + k), r: a.rot, s: 0.7 + 0.3 * p, o: clamp(p * 2.5) }); });
      const nAbo = Math.floor(lerp(2, 9, ease.out2(prog(t, B[2], B[2] + 0.7)))); s.aboCount.textContent = nAbo + ' ABOS';
      show(s.aboCount, pre && t >= B[2]); tf(s.aboCount, { x: 1390, y: 100, s: 0.7 + 0.3 * tw(t, B[2], B[2] + 0.3, ease.snap), o: tw(t, B[2], B[2] + 0.15) });
      s.ais.forEach((a, k) => { const t0 = B[3] + k * 0.09, p = tw(t, t0, t0 + 0.4, ease.snap); show(a.el, pre && t >= t0); tf(a.el, { x: a.x, y: a.y + 8 * Math.sin(t * 2.1 + k), r: a.rot, s: 0.7 + 0.3 * p, o: clamp(p * 2) * 0.96 }); });
      const capP = tw(t, B[3] + 0.3, B[3] + 0.62, ease.snap); show(s.aiCap, pre && t >= B[3] + 0.28); tf(s.aiCap, { y: 24 * (1 - capP), s: 0.92 + 0.08 * capP, o: clamp(capP * 2) * (1 - tw(t, B[4], B[4] + 0.12)) });
      s.asks.forEach((b, k) => { const t0 = B[4] + k * 0.12, p = tw(t, t0, t0 + 0.3, ease.snap); show(b.el, pre && t >= t0); tf(b.el, { x: b.x, y: b.y, r: b.rot, s: 0.6 + 0.4 * p, o: clamp(p * 2) }); });
      // Text-Salven + Rollen-Pille („Blickwinkel“)
      const inBig = pre && t >= OV - 0.05;
      show(s.vig, inBig); s.vig.style.opacity = tw(t, OV - 0.1, OV + 0.2);
      const glitch = clamp((t - (CUT - 0.28)) / 0.28);                 // die letzten 0,28 s vor dem Schnitt
      const NB = s.bigs.length;
      s.bigs.forEach((b, k) => {
        const t0 = B[k], t1 = k < NB - 1 ? B[k + 1] : CUT, a = t - t0, dur = t1 - t0;
        const on = pre && t >= t0 && t < t1;
        [b.main, b.gr, b.gc].forEach((el) => show(el, on));
        show(s.roles[k], on);
        if (!on) return;
        const p = tw(a, 0, 0.14, ease.out4), shake = Math.sin(a * 70) * 7 * (1 - tw(a, 0, 0.2));
        const gl = k === NB - 1 ? glitch : 0, split = 4 * (1 - tw(a, 0, 0.25)) + 22 * gl;
        const base = { x: shake + (gl > 0 ? Math.sin(t * 90) * 10 * gl : 0), s: 1.07 - 0.07 * p, o: clamp(p * 2) * (1 - (k < NB - 1 ? tw(a, dur - 0.12, dur, ease.in2) : 0)) };
        tf(b.main, base); tf(b.gr, { ...base, x: base.x - split, o: base.o * (0.0 + (split > 5 ? 0.8 : 0)) }); tf(b.gc, { ...base, x: base.x + split, o: base.o * (0.0 + (split > 5 ? 0.8 : 0)) });
        const rp = tw(a, 0.02, 0.26, ease.ui); tf(s.roles[k], { y: 16 * (1 - rp), o: rp * (1 - (k < NB - 1 ? tw(a, dur - 0.1, dur) : 0)) });
      });
      // Freeze-Flackern direkt vor dem Schnitt
      if (t > CUT - 0.2 && t < CUT) s.vig.style.opacity = 0.7 + 0.3 * Math.sign(Math.sin(t * 120));

      /* ---- Pause (18–20): Stille, ein Satz, der orange Faden ---- */
      const inPause = !pre;
      show(s.ask, inPause && t >= ASK - 0.05);
      s.askLetters.forEach((el, k) => { const p = tw(t, ASK + k * 0.035, ASK + k * 0.035 + 0.45, ease.out3); tf(el, { y: 26 * (1 - p), o: p, blur: 0 }); });
      const thrP = ease.io2(prog(t, ASK, DROP));
      show(s.thr, inPause && t >= ASK); s.thr.firstChild.setAttribute('x2', (1860 * thrP).toFixed(1));
      const pg = tw(t, ASK, DROP - 0.1, ease.in2), inh = tw(t, DROP - 0.14, DROP - 0.01, ease.in2);          // Aufbau → kurzes Einatmen direkt vor dem Drop
      s.thr.firstChild.setAttribute('stroke-width', (4 + 8 * pg).toFixed(2));
      show(s.pGlow, inPause && t >= ASK); tf(s.pGlow, { s: (0.25 + 0.75 * pg) * (1 - 0.35 * inh), o: 0.95 * pg * (1 - 0.5 * inh) });
      tf(s.ask, { s: 1 + 0.03 * pg - 0.05 * inh });
      if (inPause) s.grid.style.opacity = 0.4 + 0.5 * pg;
      show(s.thrFlag, inPause && t >= ASK); Object.assign(s.thrFlag.style, { left: (1860 * thrP - 2) + 'px', top: (THREAD_Y - 7) + 'px' });
      // alles andere ist ab dem Schnitt aus
      [s.hook].forEach((el) => { if (!pre) show(el, false); });
      s.hookBadges.forEach((b) => { if (!pre) show(b.el, false); });
    },
  });
}
