// ============================================================
// Act I – Chaos (0–24 s). Dunkel, kühl, bewusst „designtes“ Chaos.
//   hook 0–4 (letztes Wort steht ≈ 1,3 s) · m365 4–8,5 · opendesk 8,5–13 · nextcloud 13–17,5 · overwhelm 17,5–22 · pause 22–24 (Cliffhanger-Frage 22,5, Faden/Glühen ab 23,0; post 0.8)
//   Alle Zeiten kommen aus timeline.json (Karten, Pings, Shoves, Texte, Cut, Drop) – nur Feinheiten sind relativ dazu notiert.
//   Überforderung = fünf Blickwinkel im 0,75-s-Raster: Mitarbeitende (Login) · Teams (Tool) · Geschäftsführung (Abo) · Datenschutz (KI) · IT (Frage)
// Muster je Lösung: erst die Stärke, dann „ABER:“, dann drei Alltagssätze – sie poppen auf den
// ping-hits der timeline.json. Linkado-Orange kommt hier kaum vor: nur der erste Faden-Strich im Hook und Faden+Flagge in der Pause.
// ============================================================
import { mini } from './act1-bits.js';

export default function register(E) {
  const { h, tf, tw, ease, prog, clamp, lerp, show, rng, icon } = E;
  const CREAM = '#F4EEE3', DIM = '#8E97AE', BG = '#131926';
  const ACC = { m365: '#E5565B', opendesk: '#7B6CF6', nextcloud: '#36A9E8' };
  const hit = (kind, v) => E.hits(kind, v).map((x) => x.t);
  const T0 = { m365: hit('card', 1)[0], opendesk: hit('card', 2)[0], nextcloud: hit('card', 3)[0] };
  const PING = { m365: hit('ping', 1), opendesk: hit('ping', 2), nextcloud: hit('ping', 3) };
  const SHOVE = { m365: hit('shove', 1)[0], opendesk: hit('shove', 2)[0], nextcloud: hit('shove', 3)[0] };
  const HP = E.hits('ping', 0).map((x) => x.t).filter((x) => x < T0.m365);   // Hook-Pings (1.0 · 2.0 · 2.5) = Wortauftritte „funktioniert.“ · „Nur nicht“ · „dazwischen.“
  const T_HOOK = T0.m365;                            // 4.0 – Ende des Hooks = erster Karten-Schlag
  const CUT = E.hits('cut')[0].t;                    // 22.0 – harter Schnitt
  const DROP = E.hits('drop')[0].t;                  // 24.0
  const TEXTS = E.hits('text').filter((x) => x.t >= CUT - 5 && x.t < CUT).map((x) => x.t);   // fünf Blickwinkel im 0,75-s-Raster
  const OV = TEXTS[0];                               // 17.5 – Beginn der Überforderung

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
  .a1-big { position:absolute; left:0; right:0; text-align:center; text-transform:uppercase; font-family:var(--font-display); font-weight:700; color:${CREAM}; letter-spacing:-.005em; white-space:nowrap; text-shadow:0 0 18px rgba(14,19,30,.9), 0 3px 22px rgba(14,19,30,.85); }
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
      const BGW = [['mail', 40, 650, 300, 200, -4, 0.4], ['chat', 1500, 60, 320, 210, 3, 0.9], ['cal', 880, 24, 300, 200, -2, 1.3], ['sheet', 1580, 700, 300, 200, 4, 2.4], ['video', 250, 905, 280, 190, 3, 3.0],
        ['ticket', 840, 770, 320, 210, -3, 3.6], ['ai', 1300, 20, 280, 190, -3, 4.4], ['files', 20, 340, 260, 180, -2, 5.2], ['kanban', 1250, 790, 300, 200, 2, 6.0], ['form', 560, 870, 300, 190, -4, 7.0]];
      const bgw = BGW.map(([k, x, y, w, hh, rot, tIn]) => { const el = h('div', { class: 'abs', style: { left: 0, top: 0, zIndex: 2 } }, mini(E, k, w, hh)); root.append(el); return { el, x, y, w, hh, rot, tIn }; });

      /* ---- Hook ---- */
      const word = (s, c) => h('span', { class: 'w' }, h('span', { text: s, style: { color: c } }));
      const w1 = word('Alles', DIM), w2 = word('funktioniert.', DIM), w3 = word('Nur nicht', DIM);
      // „dazwischen.“ – die beiden Hälften öffnen sich: das Dazwischen wird sichtbar
      const hl = h('span', { text: 'dazwi', style: { display: 'inline-block' } }), hr = h('span', { text: 'schen.', style: { display: 'inline-block' } });
      // der Faden zeigt sich zum ersten Mal: ein dünner oranger Strich in der Lücke (noch ohne Namen, ohne Logo)
      const stroke = h('i', { style: { position: 'absolute', left: '0px', top: '16px', width: '4px', height: '84px', borderRadius: '2px', background: '#E67E22', boxShadow: '0 0 22px rgba(230,126,34,.85)', opacity: 0, display: 'block' } });
      hr.style.position = 'relative'; hr.append(stroke);
      const w4 = h('span', { class: 'w', style: { paddingRight: '56px', marginRight: '-56px' } }, h('span', { style: { color: CREAM } }, hl, hr));   // Platz für die nach rechts wandernde Hälfte (inkl. Schlusspunkt)
      const hook = h('div', { class: 'a1-hook' }, h('div', {}, w1, ' ', w2), h('div', {}, w3, ' ', w4));
      root.append(hook);
      // die roten Zähler sind Benachrichtigungen der ersten drei Hintergrund-Fenster (Posteingang · Team-Chat · Kalender)
      const hookBadges = [[0, '3'], [1, '12'], [2, '7']].map(([k, n]) => { const b = h('div', { class: 'a1-badge', text: n, style: { margin: '-22px 0 0 -22px', zIndex: 3 } }); root.append(b); return { el: b, k, x: 0, y: 0 }; });

      /* ---- Die drei Büro-Szenen (4–17,5 s) liegen im 3D-Büro (office3d.js, eigene Szene über diesem Hintergrund) ---- */

      /* ---- Überforderung (17,5–22): fünf Blickwinkel – Login · Tool · Abo · KI · IT ---- */
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
      const BIGS = [['NOCH EIN LOGIN.', 120], ['NOCH EIN TOOL.', 120], ['NOCH EIN ABO.', 120], ['NOCH EINE KI.', 120], ['NOCH EINE IT-FRAGE.', 120]];
      const bigs = BIGS.map(([txt, sz], k) => {
        const mk = (col, extra = {}) => h('div', { class: 'a1-big', text: txt, style: { top: 470 - sz / 2, fontSize: sz, color: col, zIndex: 42, ...extra } }); const main = mk(CREAM); const gr = mk('#E5565B', { zIndex: 41 }); const gc = mk('#36A9E8', { zIndex: 41 });
        root.append(gr, gc, main); return { main, gr, gc };
      });
      const ROLES = [['user-round', 'MITARBEITENDE', '#E5565B'], ['users', 'TEAMS', '#7B6CF6'], ['banknote', 'GESCHÄFTSFÜHRUNG', '#E5565B'], ['shield-check', 'DATENSCHUTZ', '#7B6CF6'], ['headphones', 'IT-ABTEILUNG', '#36A9E8']];
      const roles = ROLES.map(([ico, txt, col], k) => { const el = h('div', { class: 'a1-role' }, h('div', { class: 'p' }, h('span', { class: 'ic', style: { background: col }, html: icon(ico, 24, '#fff', 2.2) }), h('span', { text: txt }), h('span', { class: 'dots' }, ROLES.map((_, q) => h('i', { style: { background: q === k ? col : '' } }))))); root.append(el); return el; });
      root.append(vig);

      /* ---- Pause: 22,0–22,5 Schwarz; danach übernimmt das Büro (a2-ui) mit der Cliffhanger-Frage; Faden und Glühen liegen im Overlay (a2-ov) ---- */
      const dark = h('div', { class: 'abs', style: { inset: 0, background: '#0E131E', zIndex: 35 } }); root.append(dark);

      return { stroke, bgw, glow, grid, chips, hook, w1, w2, w3, w4, hl, hr, hookBadges, logins, tabBar, tabs, tabCount, toolTiles, aboTags, aboCount, ais, aiCap, asks, vig, bigs, roles, dark };
    },

    update(t, s) {
      const pre = t < CUT;                         // vor dem harten Schnitt
      /* ---- Hintergrund ---- */
      s.grid.style.transform = `translate(${(-t * 6).toFixed(2)}px,${(-t * 3).toFixed(2)}px)`;
      s.glow.style.opacity = pre ? 1 : 0.55;
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
        w.px = w.x + 6 * Math.sin(t * 0.7 + i); w.py = w.y + 5 * Math.cos(t * 0.6 + i) + 20 * (1 - p);
        tf(w.el, { x: w.px, y: w.py, r: w.rot, s: 1 + 0.12 * ov, o });
      });

      /* ---- Hook (0–4): ruhig gesetzt, Wörter landen auf dem Raster (0,25 · 1,0 · 2,0 · 2,5); „dazwischen.“ steht ca. 1,3 s, bevor der Schnitt kommt ---- */
      const hk = (el, t0) => tf(el.firstChild, { y: 130 * (1 - tw(t, t0, t0 + 0.9, ease.ui)) });
      hk(s.w1, 0.25); hk(s.w2, HP[0]); hk(s.w3, HP[1]); hk(s.w4, HP[2]);
      const gq = tw(t, HP[2] + 0.2, HP[2] + 1.1, ease.out3), gap = 34 * gq; tf(s.hl, { x: 0 }); tf(s.hr, { x: gap });
      s.stroke.style.left = (-gap / 2 - 2).toFixed(2) + 'px'; s.stroke.style.opacity = (gq * (0.75 + 0.25 * Math.sin(t * 5))).toFixed(3);
      const hx = tw(t, T_HOOK - 0.2, T_HOOK, ease.in3);                // harter Schnitt auf den Karten-Schlag
      show(s.hook, t < T_HOOK + 0.02); tf(s.hook, { y: -50 * hx, o: 1 - hx });
      s.hookBadges.forEach((b, k) => { const t0 = HP[k], p = tw(t, t0, t0 + 0.45, ease.snap), W = s.bgw[b.k]; b.x = W.px + W.w - 14; b.y = W.py + 8; show(b.el, t >= t0 && t < T_HOOK + 0.02); tf(b.el, { x: b.x, y: b.y, s: 0.3 + 0.7 * p, o: clamp(p * 2) * (1 - hx) }); });

      /* ---- Überforderung (14–18): fünf Blickwinkel auf dem 3/16-Raster (0,75 s) ---- */
      const B = TEXTS;                                                // 17.5 · 18.25 · 19.0 · 19.75 · 20.5
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
      const capP = tw(t, B[3] + 0.02, B[3] + 0.34, ease.snap); show(s.aiCap, pre && t >= B[3]); tf(s.aiCap, { y: 24 * (1 - capP), s: 0.92 + 0.08 * capP, o: clamp(capP * 2) * (1 - tw(t, B[4] + 0.12, B[4] + 0.27)) });   // steht ≈ 0,9 s, fast ganz vor der IT-Frage
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

      // alles andere ist ab dem Schnitt aus
      [s.hook].forEach((el) => { if (!pre) show(el, false); });
      s.hookBadges.forEach((b) => { if (!pre) show(b.el, false); });
    },
  });
}
