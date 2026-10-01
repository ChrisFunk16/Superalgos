// ============================================================
// Act I – Chaos (0–20 s). Dunkel, kühl, bewusst „designtes“ Chaos.
//   hook 0–2 · m365 2–6 · opendesk 6–10 · nextcloud 10–14 · overwhelm 14–18 · pause 18–20 (+0.8)
// Muster je Lösung: erst die Stärke, dann „ABER:“, dann drei Lücken – die Chips poppen auf den
// ping-hits der timeline.json. Linkado-Orange kommt hier NICHT vor (außer Faden+Flagge in der Pause).
// ============================================================
import { buildUI } from '../ui.js';
import { THREAD_Y } from './act2.js';

export default function register(E) {
  const { h, tf, tw, ease, prog, clamp, lerp, show, rng, icon } = E;
  const CREAM = '#F4EEE3', DIM = '#8E97AE', BG = '#131926';
  const ACC = { m365: '#E5565B', opendesk: '#7B6CF6', nextcloud: '#36A9E8' };
  const hit = (kind, v) => E.hits(kind, v).map((x) => x.t);
  const T0 = { m365: hit('card', 1)[0], opendesk: hit('card', 2)[0], nextcloud: hit('card', 3)[0] };
  const PING = { m365: hit('ping', 1), opendesk: hit('ping', 2), nextcloud: hit('ping', 3) };
  const SHOVE = { m365: hit('shove', 1)[0], opendesk: hit('shove', 2)[0], nextcloud: 13.7 };
  const CUT = E.hits('cut')[0].t;                    // 18.0 – harter Schnitt
  const TEXTS = E.hits('text').filter((x) => x.t >= 14 && x.t <= 17).map((x) => x.t);   // 14,15,16,17
  const ASK = E.hits('text').find((x) => x.t > 18.5 && x.t < 19.5).t;                  // 19.0

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
  .a1-bubble { position:absolute; left:0; top:0; padding:14px 22px; border-radius:20px 20px 20px 5px; background:#E8E1D3; color:#1F2532; font:600 24px/1.2 var(--font-body); box-shadow:0 8px 18px rgba(0,0,0,.42); white-space:nowrap; }
  `);

  const FILES = ['protokoll_final_v3.docx', 'protokoll_final_v4_NEU.docx', 'Aufgaben_Q3_(2).xlsx', 'Angebot_Meyer_FINAL_neu.pdf', 'Präsentation_v7_Kopie.pptx', 'Kundenliste_alt.xlsx', 'Notizen_Montag.txt', 'Termine_KW40_neu.ics',
    'Budget_2026_final_final.xlsx', 'Rechnung_0815_scan.pdf', 'Konzept_ENTWURF_v2.docx', 'Fotos_Messe_Kopie (3).zip', 'Logo_final_final_v3.png', 'Vertrag_unterschrieben_neu.pdf', 'Protokoll_Teamtermin (1).docx', 'Zugang_Projekt_alt.txt',
    'Angebot_Hartmann_v2.pdf', 'Besprechung_Do_NEU.docx', 'Mailanhang_Kopie_2.pdf', 'Preisliste_2025_alt.xlsx', 'Aufgaben_Liste_final.xlsx', 'Skizze_Messestand_v5.pptx', 'Einladung_Sommerfest.docx', 'Notizen_Kunde_neu.txt'];

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
        const d = { el, txt, bg, x: r.range(-140, 1800), y: r.range(40, 1010), rot: r.range(-9, 9), vx: r.range(-26, -8), vy: r.range(-6, 6), sc: r.range(0.8, 1.15), tIn: bg ? 0 : 14.0 + (i - 12) * 0.2 };
        root.append(el); return d;
      });

      /* ---- Hook ---- */
      const word = (s, c) => h('span', { class: 'w' }, h('span', { text: s, style: { color: c } }));
      const w1 = word('Digitale', DIM), w2 = word('Zusammenarbeit', DIM), w3 = word('heute.', CREAM);
      const hook = h('div', { class: 'a1-hook' }, h('div', {}, w1, ' ', w2), h('div', {}, w3));
      root.append(hook);
      const hookBadges = [[430, 250, '3'], [1500, 330, '12'], [1280, 780, '7']].map(([x, y, n]) => { const b = h('div', { class: 'a1-badge', text: n }); root.append(b); return { el: b, x, y }; });

      /* ---- Gruppen (Karte + Visual) ---- */
      const mkGroup = (cfg, i) => {
        const g = h('div', { class: 'abs', style: { left: 0, top: 0, width: 1920, height: 1080, transformOrigin: '960px 540px', zIndex: 10 + i } });
        const card = h('div', { class: 'a1-card', style: { '--acc': cfg.acc } });
        const gaps = cfg.gaps.map(([ico, txt]) => h('div', { class: 'a1-gap', style: { '--acc': cfg.acc } }, h('span', { class: 'ic', html: icon(ico, 30, '#fff', 2.2) }), h('span', { html: txt })));
        card.append(h('div', { class: 'a1-acc', style: { background: cfg.acc } }), h('div', { class: 'a1-name', text: cfg.name }),
          h('div', { class: 'a1-ok', style: { '--acc': cfg.acc } }, h('span', { class: 'ck', html: icon('check', 20, '#3FBF8A', 3) }), h('span', { text: cfg.ok }), h('b', { text: 'ABER:' })),
          h('div', { class: 'a1-gaps' }, gaps),
          h('div', { class: 'a1-foot' }, [0, 1, 2].map((k) => h('i', { style: { background: k === i ? cfg.acc : '' } })), h('span', { text: `LÖSUNG ${i + 1} VON 3`, style: { marginLeft: 8 } })));
        g.append(card);
        const vis = cfg.visual(g);
        root.append(g);
        return { id: cfg.id, g, card, gaps, ok: card.querySelector('.a1-ok'), name: card.querySelector('.a1-name'), vis, t0: T0[cfg.id], pings: PING[cfg.id], shove: SHOVE[cfg.id], pile: PILE[cfg.id] };
      };

      /* Visual 1 – Microsoft 365: „App-Raster von der Stange“ + Kostenschilder */
      const vM365 = (g) => {
        const win = h('div', { class: 'a1-win', style: { left: 1030, top: 280 } },
          h('div', { class: 'tb' }, h('i'), h('i'), h('i'), h('b', { text: 'Alle Apps' })),
          h('div', { class: 'abs', style: { left: 0, top: 56, bottom: 0, width: 70, background: '#E5E9F1' } }, [0, 1, 2, 3, 4].map((k) => h('div', { class: 'abs', style: { left: 21, top: 30 + k * 62, width: 28, height: 28, borderRadius: 8, background: '#C9D0DE' } }))));
        const cols = ['#2F6FDE', '#1E9E6A', '#E5565B', '#36A9E8', '#7B6CF6', '#14A8A8', '#4C5BD4', '#D1497A'];
        const icos = ['file-text', 'table-2', 'presentation', 'mail', 'calendar', 'message-square', 'cloud', 'users'];
        const tiles = cols.map((c, k) => { const el = h('div', { class: 'a1-tile', style: { background: c, left: 120 + (k % 4) * 152, top: 100 + Math.floor(k / 4) * 154 }, html: icon(icos[k], 52, '#fff', 2) }); win.append(el); return el; });
        const tags = ['+ LIZENZ', '+ ADD-ON', '+ SPEICHER', '+ SUPPORT'].map((s, k) => { const el = h('div', { class: 'a1-tag' }, h('span', { html: icon('euro', 24, '#E5565B', 2.6) }), s); g.append(el); return el; });
        const ghost = h('div', { class: 'abs', style: { left: 120 + 3 * 152 - 4, top: 100 + 154 - 4, width: 136, height: 136, borderRadius: 30, border: '3px dashed rgba(229,86,91,.85)', zIndex: 3 } });
        win.append(ghost); g.append(win); win.style.zIndex = 2;
        tags.forEach((el) => { el.style.zIndex = 5; });
        return {
          win, update(t, t0, P) {
            const a = t - t0;
            tf(win, { x: 90 * (1 - tw(a, 0.0, 0.7, ease.ui)), y: 30 * (1 - tw(a, 0.0, 0.7, ease.ui)), r: 2.5, o: tw(a, 0.0, 0.5) });
            tiles.forEach((el, k) => { const p = tw(a, 0.15 + k * 0.05, 0.6 + k * 0.05, ease.snap); let q = { s: 0.6 + 0.4 * p, o: clamp(p * 1.5) };
              if (k === 7) { const j = tw(t, P[2], P[2] + 0.35, ease.snap); q.x = 46 * j; q.y = -38 * j; q.r = 14 * j; } tf(el, q); });
            const gp = tw(t, P[2], P[2] + 0.3, ease.out3); show(ghost, t >= P[2]); tf(ghost, { o: gp });
            tags.forEach((el, k) => { const tt = P[1] + k * 0.11, p = tw(t, tt, tt + 0.5, ease.out3); const bounce = Math.abs(Math.sin(p * Math.PI * 1.5)) * (1 - p) * 40;
              show(el, t >= tt - 0.01); tf(el, { x: 1530 + (k % 2) * 40 - k * 6, y: 330 + k * 86 - (1 - p) * 260 - bounce, r: -8 + k * 6, o: clamp(p * 3) }); });
          },
        };
      };

      /* Visual 2 – openDesk: Portal-Fassade klappt auf, dahinter uneinheitliche Fenster */
      const vOpenDesk = (g) => {
        const wrap = h('div', { class: 'abs', style: { left: 1030, top: 280, width: 780, height: 520, perspective: '1600px' } });
        const styles = [
          { t: 'Dateien', c: '#2F6FDE', rad: 4, x: 0, y: 0, font: 'var(--font-body)' }, { t: 'Mail', c: '#1E9E6A', rad: 22, x: 440, y: 20, font: 'Georgia, serif' },
          { t: 'Chat', c: '#7B6CF6', rad: 0, x: 20, y: 270, font: 'monospace' }, { t: 'Wiki', c: '#14A8A8', rad: 12, x: 450, y: 290, font: 'var(--font-display)' },
        ];
        const sws = styles.map((s) => { const el = h('div', { class: 'a1-sw', style: { left: s.x, top: s.y, borderRadius: s.rad, fontFamily: s.font } }, h('div', { class: 'hd', style: { background: s.c }, text: s.t }), h('div', { class: 'bar' }), h('div', { class: 'bar', style: { width: 180 } }), h('div', { class: 'bar', style: { width: 240 } }), h('div', { class: 'bar', style: { width: 120 } })); wrap.append(el); return el; });
        const front = h('div', { class: 'a1-win', style: { left: 0, top: 0, transformOrigin: '0 50%', background: '#fff' } },
          h('div', { class: 'tb' }, h('i'), h('i'), h('i'), h('b', { text: 'Portal' })),
          h('div', { class: 'abs', style: { left: 40, top: 92, width: 280, height: 380, borderRadius: 16, background: '#fff', boxShadow: '0 12px 40px rgba(31,37,50,.18)', border: '1.5px solid #E3E7EF', padding: '26px 24px' } },
            h('div', { style: { font: '700 22px/1 var(--font-display)', textTransform: 'uppercase', marginBottom: 20 }, text: 'Anmelden' }),
            h('div', { style: { height: 44, borderRadius: 9, background: '#F1F3F7', border: '1.5px solid #E3E7EF', marginBottom: 12 } }), h('div', { style: { height: 44, borderRadius: 9, background: '#F1F3F7', border: '1.5px solid #E3E7EF', marginBottom: 18 } }),
            h('div', { style: { height: 48, borderRadius: 9, background: '#7B6CF6' } })),
          ['Dateien', 'Mail', 'Chat', 'Wiki', 'Projekte', 'Büro'].map((n, k) => h('div', { class: 'abs', style: { left: 360 + (k % 2) * 190, top: 100 + Math.floor(k / 2) * 126, width: 172, height: 108, borderRadius: 14, background: '#EEEAFE', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, font: '600 18px/1 var(--font-body)', color: '#4B3FC7' } }, h('span', { html: icon('app-window', 32, '#7B6CF6', 2) }), n)));
        const hl = h('div', { class: 'abs', style: { left: 34, top: 86, width: 292, height: 392, borderRadius: 20, border: '4px solid #7B6CF6', boxShadow: '0 0 40px rgba(123,108,246,.6)', transformOrigin: '0 50%' } });
        front.append(hl); wrap.append(front); g.append(wrap);
        return {
          wrap, update(t, t0, P) {
            const a = t - t0;
            tf(wrap, { x: 90 * (1 - tw(a, 0.0, 0.7, ease.ui)), o: tw(a, 0.0, 0.5), r: -2 });
            const door = ease.io3(prog(t, P[1], P[1] + 0.7));
            front.style.transform = `perspective(1600px) rotateY(${(72 * door).toFixed(2)}deg)`; front.style.opacity = 1 - 0.65 * door;
            tf(hl, { o: tw(t, P[0], P[0] + 0.25) * (1 - door) * (0.7 + 0.3 * Math.sin(t * 14)) });
            sws.forEach((el, k) => { const sp = tw(t, P[2], P[2] + 0.5, ease.snap); const rot = [-5, 4, 6, -4][k] * sp; tf(el, { x: [-18, 22, -20, 24][k] * sp, y: [-14, -10, 16, 14][k] * sp, r: rot, o: 0.35 + 0.65 * door }); });
          },
        };
      };

      /* Visual 3 – Nextcloud: nacktes Wireframe + Update-Balken „nur das Nötigste“ */
      const vNextcloud = (g) => {
        const ui = buildUI(E);
        const w = ui.window({ raw: true }); w.setActive('Dateien'); w.main.append(ui.dashboard().el);
        w.el.style.transformOrigin = '0 0';
        const frame = h('div', { class: 'abs', style: { left: 1030, top: 270, width: 780, height: 470 } }); frame.append(w.el); g.append(frame);
        const bar = h('div', { class: 'abs', style: { left: 1030, top: 770, width: 780, height: 70, borderRadius: 16, background: '#1B2335', border: '1.5px solid rgba(255,255,255,.14)', display: 'flex', alignItems: 'center', gap: 18, padding: '0 24px' } },
          h('span', { html: icon('triangle-alert', 30, '#36A9E8', 2.4) }), h('span', { text: 'UPDATES: NUR DAS NÖTIGSTE', style: { font: '700 20px/1 var(--font-body)', letterSpacing: '.1em', color: CREAM, whiteSpace: 'nowrap' } }),
          h('div', { style: { flex: 1, height: 14, borderRadius: 7, background: 'rgba(255,255,255,.12)', position: 'relative', overflow: 'hidden' } }, h('div', { class: 'fillbar', style: { position: 'absolute', left: 0, top: 0, bottom: 0, width: '0%', background: '#36A9E8', borderRadius: 7 } })));
        g.append(bar);
        const tools = ['wrench', 'server', 'hammer'].map((n, k) => { const el = h('div', { class: 'abs', style: { left: 1030 + 90 + k * 280, top: 250, width: 76, height: 76, borderRadius: 20, background: '#36A9E8', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 18px rgba(0,0,0,.45)', zIndex: 6 }, html: icon(n, 40, '#fff', 2.2) }); g.append(el); return el; });
        return {
          frame, update(t, t0, P) {
            const a = t - t0, sc = 780 / 1480;
            tf(frame, { x: 90 * (1 - tw(a, 0.0, 0.7, ease.ui)), o: tw(a, 0.0, 0.5) * (1 - 0.18 * Math.max(0, Math.sin((t - P[1]) * 22)) * (t > P[1] && t < P[1] + 0.35 ? 1 : 0)), r: 1.5 });
            w.el.style.transform = `scale(${sc.toFixed(4)})`;
            tf(bar, { y: 40 * (1 - tw(t, P[0] - 0.1, P[0] + 0.4, ease.ui)), o: tw(t, P[0] - 0.1, P[0] + 0.3) });
            bar.querySelector('.fillbar').style.width = (28 * ease.out3(prog(t, P[0] + 0.1, P[0] + 1.0))) + '%';
            tools.forEach((el, k) => { const tt = P[2] + k * 0.1, p = tw(t, tt, tt + 0.45, ease.snap); show(el, t >= tt); tf(el, { y: -50 * (1 - p) + 6 * Math.sin(t * 3 + k), s: 0.5 + 0.5 * p, o: clamp(p * 2), r: (k - 1) * 8 }); });
          },
        };
      };

      const cfgs = [
        { id: 'm365', name: 'MICROSOFT 365', ok: 'BEKANNT UND VERBREITET.', acc: ACC.m365, gaps: [['globe-lock', 'ABHÄNGIG VON<br>US-KONZERNEN'], ['euro', 'TEUER'], ['shirt', 'NICHT<br>ZUGESCHNITTEN']], visual: vM365 },
        { id: 'opendesk', name: 'OPENDESK', ok: 'DEUTSCHE LÖSUNG.', acc: ACC.opendesk, gaps: [['panels-top-left', 'NUR OBERFLÄCHE<br>UND LOGIN'], ['blocks', 'FÜR FREMDE<br>OPEN-SOURCE-SOFTWARE'], ['unplug', 'KEIN DURCHGÄNGIGES<br>ERLEBNIS']], visual: vOpenDesk },
        { id: 'nextcloud', name: 'NEXTCLOUD', ok: 'STARKE OPEN-SOURCE-BASIS.', acc: ACC.nextcloud, gaps: [['history', 'OFT NUR AUF DEM<br>NÖTIGSTEN STAND'], ['hammer', 'ROH UND UNFERTIG<br>IM ALLTAG'], ['server', 'VIEL TECHNIK,<br>WENIG ERLEBNIS']], visual: vNextcloud },
      ];
      const groups = cfgs.map(mkGroup);

      /* ---- Überforderung (14–18): Logins, Tabs, Tools, Fragen ---- */
      const logins = [[120, 120, '#E5565B', 'Microsoft-Konto'], [1480, 150, '#7B6CF6', 'Portal-Login'], [1360, 700, '#36A9E8', 'Cloud-Zugang'], [150, 700, '#8E97AE', 'VPN']].map(([x, y, c, ttl], k) => {
        const el = h('div', { class: 'a1-login', style: { borderTop: `6px solid ${c}` } }, h('h6', { text: ttl }), h('div', { class: 'f', text: 'Benutzername' }), h('div', { class: 'f', text: '••••••••' }), h('div', { class: 'bt', style: { background: c }, text: 'Anmelden' }));
        root.append(el); return { el, x, y, c, rot: [-6, 5, -4, 7][k] };
      });
      const tabBar = h('div', { class: 'abs', style: { left: 0, top: 0, width: 1920, height: 66, background: '#0E131E', borderBottom: '1.5px solid rgba(255,255,255,.12)', zIndex: 30 } });
      const tabs = Array.from({ length: 36 }, (_, k) => { const col = ['#E5565B', '#7B6CF6', '#36A9E8', '#3FBF8A', '#8E97AE', '#D1497A'][k % 6]; const el = h('div', { class: 'abs', style: { top: 12, height: 54, borderRadius: '12px 12px 0 0', background: '#1E2638', border: '1.5px solid rgba(255,255,255,.1)', borderBottom: 'none' } }, h('div', { class: 'abs', style: { left: 12, top: 17, width: 20, height: 20, borderRadius: 5, background: col } }), h('div', { class: 'abs', style: { left: 42, top: 22, right: 12, height: 10, borderRadius: 4, background: 'rgba(255,255,255,.22)' } })); tabBar.append(el); return el; });
      const tabCount = h('div', { class: 'abs', style: { right: 24, top: 14, height: 42, padding: '0 18px', borderRadius: 21, background: '#E5565B', color: '#fff', font: '700 22px/42px var(--font-body)', zIndex: 5 } });
      tabBar.append(tabCount); root.append(tabBar);
      const toolTiles = Array.from({ length: 12 }, (_, k) => { const c = ['#2F6FDE', '#1E9E6A', '#E5565B', '#36A9E8', '#7B6CF6', '#14A8A8', '#4C5BD4', '#D1497A'][k % 8]; const el = h('div', { class: 'a1-tile', style: { background: c, width: 110, height: 110, left: 0, top: 0 }, html: icon(['file-text', 'table-2', 'presentation', 'mail', 'calendar', 'message-square', 'cloud', 'users', 'notebook-pen', 'kanban', 'video', 'clipboard-list'][k], 46, '#fff', 2) }); const b = h('div', { class: 'a1-badge', text: String(3 + ((k * 7) % 96)), style: { left: 74, top: -14, transform: 'scale(.7)', transformOrigin: '0 50%' } }); el.append(b); root.append(el); return { el, x: r.range(180, 1640), y: r.range(120, 900), rot: r.range(-12, 12) }; });
      const asks = ['Wo ist die Datei?', 'Passwort vergessen?', 'Wer hat Zugriff?', 'Ticket #4711 offen', 'Welche Version gilt?'].map((txt, k) => { const el = h('div', { class: 'a1-bubble', text: txt }); root.append(el); return { el, x: [160, 1380, 620, 1250, 260][k], y: [220, 260, 820, 840, 620][k], rot: [-4, 3, -2, 4, -3][k] }; });
      const vig = h('div', { class: 'abs', style: { left: 160, top: 300, width: 1600, height: 480, background: 'radial-gradient(closest-side, rgba(14,19,30,.94), rgba(14,19,30,.86) 55%, rgba(14,19,30,0))', zIndex: 40 } });
      const bigs = [['NOCH EIN LOGIN.', 120], ['NOCH EIN TAB.', 120], ['NOCH EIN TOOL.', 120], ['NOCH EINE FRAGE AN DIE IT.', 100]].map(([txt, sz], k) => {
        const mk = (col, extra = {}) => h('div', { class: 'a1-big', text: txt, style: { top: 470 - sz / 2, fontSize: sz, color: col, zIndex: 42, ...extra } }); const main = mk(CREAM); const gr = mk('#E5565B', { zIndex: 41 }); const gc = mk('#36A9E8', { zIndex: 41 });
        root.append(gr, gc, main); return { main, gr, gc };
      });
      root.append(vig);

      /* ---- Pause ---- */
      const ask = h('div', { class: 'a1-big', style: { top: 428, fontSize: 112, zIndex: 50, fontWeight: 600 } });
      const askLetters = 'ES GEHT AUCH ANDERS.'.split('').map((ch) => h('span', { text: ch === ' ' ? ' ' : ch, style: { display: 'inline-block' } })); ask.append(...askLetters);
      const thr = h('svg', { class: 'abs', width: 1920, height: 1080, viewBox: '0 0 1920 1080', style: { left: 0, top: 0, zIndex: 50 } }, h('line', { x1: 0, y1: THREAD_Y, x2: 1860, y2: THREAD_Y, stroke: '#E67E22', 'stroke-width': 4, 'stroke-linecap': 'round' }));
      const thrFlag = h('span', { class: 'flag abs', style: { width: 28, height: 14, zIndex: 51 } });
      root.append(ask, thr, thrFlag);
      const dark = h('div', { class: 'abs', style: { inset: 0, background: '#0E131E', zIndex: 35 } }); root.append(dark);

      return { glow, grid, chips, hook, w1, w2, w3, hookBadges, groups, logins, tabBar, tabs, tabCount, toolTiles, asks, vig, bigs, ask, askLetters, thr, thrFlag, dark };
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
      const over = prog(t, 14.0, 17.8);
      s.chips.forEach((c, i) => {
        if (!pre) { show(c.el, false); return; }
        let o, sc = c.sc;
        if (c.bg) { o = t < 2.0 ? 0.2 + 0.05 * Math.sin(i) : (t < 14 ? 0.14 : lerp(0.14, 0.8, ease.out2(over))); o *= tw(t, 0, 0.8); sc *= 1 + 0.25 * over; }
        else { const p = tw(t, c.tIn, c.tIn + 0.35, ease.snap); o = p * 0.95; sc *= 0.7 + 0.35 * p; }
        show(c.el, o > 0.01);
        const spd = 1 + 2.4 * over;
        tf(c.el, { x: c.x + c.vx * t * spd, y: c.y + c.vy * t * spd, r: c.rot + Math.sin(t * 1.3 + i) * 1.2 * (1 + over * 3), s: sc, o });
      });

      /* ---- Hook (0–2) ---- */
      const hk = (el, t0) => tf(el.firstChild, { y: 130 * (1 - tw(t, t0, t0 + 0.7, ease.ui)) });
      hk(s.w1, 0.15); hk(s.w2, 0.45); hk(s.w3, 0.95);
      const hx = tw(t, 1.7, 2.0, ease.in3);
      show(s.hook, t < 2.05); tf(s.hook, { y: -50 * hx, o: 1 - hx });
      s.hookBadges.forEach((b, k) => { const t0 = [0.5, 1.0, 1.5][k], p = tw(t, t0, t0 + 0.35, ease.snap); show(b.el, t >= t0 && t < 2.05); tf(b.el, { x: b.x, y: b.y, s: 0.3 + 0.7 * p, o: clamp(p * 2) * (1 - hx) }); });

      /* ---- Karten-Gruppen ---- */
      s.groups.forEach((G, gi) => {
        const a = t - G.t0;
        const visible = pre && t >= G.t0 - 0.02;
        show(G.g, visible); if (!visible) return;
        // Auftritt (Slam) + Wegschieben (Pile) + leichter Drift
        const slam = tw(a, 0, 0.5, ease.snap), sh = tw(t, G.shove, G.shove + 0.55, ease.uiInOut);
        const grow = 1 + 0.1 * prog(t, 14, 17.8) * sh;
        const P = G.pile;
        const sc = lerp(1, P.s, sh) * grow, tx = lerp(0, P.x, sh), ty = lerp(0, P.y, sh), rot = lerp(-1.2, P.r, sh) + Math.sin(t * 0.8 + gi) * 0.6 * sh;
        const sl = 1.09 - 0.09 * slam;
        tf(G.g, { x: tx, y: ty + 34 * (1 - slam) * (1 - sh), s: sc * (sh > 0 ? 1 : sl), r: rot, o: clamp(slam * 2) * (1 - 0.62 * sh * (t < 14 ? 1 : 1 - 0.15 * prog(t, 14, 17))) });
        G.g.style.zIndex = String(10 + gi + (sh > 0.5 ? -8 : 0));
        // Inhalte der Karte
        tf(G.ok, { y: 16 * (1 - tw(a, 0.2, 0.6, ease.ui)), o: tw(a, 0.2, 0.55) });
        G.gaps.forEach((gp, k) => { const tt = G.pings[k], p = tw(t, tt, tt + 0.32, ease.snap); tf(gp, { x: 34 * (1 - p), s: 0.93 + 0.07 * p, o: clamp(p * 2) }); });
        G.vis.update(t, G.t0, G.pings);
      });

      /* ---- Überforderung (14–18) ---- */
      const L = (k) => TEXTS[k];
      s.logins.forEach((lg, k) => { const t0 = 14.0 + k * 0.28, p = tw(t, t0, t0 + 0.4, ease.snap); show(lg.el, pre && t >= t0); tf(lg.el, { x: lg.x, y: lg.y + 8 * Math.sin(t * 2 + k), r: lg.rot, s: 0.7 + 0.3 * p, o: clamp(p * 2) * (t > 17 ? 1 : 0.92) }); });
      const tabsOn = pre && t >= L(1) - 0.05;
      show(s.tabBar, tabsOn); tf(s.tabBar, { y: -70 * (1 - tw(t, L(1) - 0.05, L(1) + 0.3, ease.ui)) });
      const nTabs = Math.floor(lerp(3, 36, ease.out2(prog(t, L(1), 17.6)))); const wTab = Math.min(190, (1800 - 220) / Math.max(1, nTabs));
      s.tabs.forEach((el, k) => { show(el, k < nTabs); el.style.left = (20 + k * (wTab + 2)) + 'px'; el.style.width = wTab + 'px'; });
      s.tabCount.textContent = nTabs + ' TABS';
      s.toolTiles.forEach((tl, k) => { const t0 = L(2) + k * 0.075, p = tw(t, t0, t0 + 0.35, ease.snap); show(tl.el, pre && t >= t0); tf(tl.el, { x: tl.x, y: tl.y + 10 * Math.sin(t * 2.2 + k), r: tl.rot, s: 0.5 + 0.5 * p, o: clamp(p * 2) }); });
      s.asks.forEach((b, k) => { const t0 = L(3) + k * 0.16, p = tw(t, t0, t0 + 0.3, ease.snap); show(b.el, pre && t >= t0); tf(b.el, { x: b.x, y: b.y, r: b.rot, s: 0.6 + 0.4 * p, o: clamp(p * 2) }); });
      // Text-Salven
      const inBig = pre && t >= 13.95;
      show(s.vig, inBig); s.vig.style.opacity = tw(t, 13.9, 14.2);
      const glitch = clamp((t - 17.72) / 0.28);                       // 17.72 → 18.0
      s.bigs.forEach((b, k) => {
        const t0 = TEXTS[k], t1 = k < 3 ? TEXTS[k + 1] : CUT, a = t - t0;
        const on = pre && t >= t0 && t < t1;
        [b.main, b.gr, b.gc].forEach((el) => show(el, on));
        if (!on) return;
        const p = tw(a, 0, 0.16, ease.out4), shake = Math.sin(a * 70) * 7 * (1 - tw(a, 0, 0.2));
        const gl = k === 3 ? glitch : 0, split = 4 * (1 - tw(a, 0, 0.25)) + 22 * gl;
        const base = { x: shake + (gl > 0 ? Math.sin(t * 90) * 10 * gl : 0), s: 1.07 - 0.07 * p, o: clamp(p * 2) * (1 - (k < 3 ? tw(a, 0.86, 1.0, ease.in2) : 0)) };
        tf(b.main, base); tf(b.gr, { ...base, x: base.x - split, o: base.o * (0.0 + (split > 5 ? 0.8 : 0)) }); tf(b.gc, { ...base, x: base.x + split, o: base.o * (0.0 + (split > 5 ? 0.8 : 0)) });
      });
      // Freeze-Flackern direkt vor dem Schnitt
      if (t > 17.8 && t < CUT) s.vig.style.opacity = 0.7 + 0.3 * Math.sign(Math.sin(t * 120));

      /* ---- Pause (18–20): Stille, ein Satz, der orange Faden ---- */
      const inPause = !pre;
      show(s.ask, inPause && t >= ASK - 0.05);
      s.askLetters.forEach((el, k) => { const p = tw(t, ASK + k * 0.035, ASK + k * 0.035 + 0.45, ease.out3); tf(el, { y: 26 * (1 - p), o: p, blur: 0 }); });
      const thrP = ease.io2(prog(t, ASK, 20.0));
      show(s.thr, inPause && t >= ASK); s.thr.firstChild.setAttribute('x2', (1860 * thrP).toFixed(1));
      show(s.thrFlag, inPause && t >= ASK); Object.assign(s.thrFlag.style, { left: (1860 * thrP - 2) + 'px', top: (THREAD_Y - 7) + 'px' });
      // alles andere ist ab dem Schnitt aus
      [s.hook].forEach((el) => { if (!pre) show(el, false); });
      s.hookBadges.forEach((b) => { if (!pre) show(b.el, false); });
    },
  });
}
