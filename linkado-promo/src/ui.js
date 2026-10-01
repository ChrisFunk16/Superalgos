// ============================================================
// Linkado-Oberfläche für den Film (nachgebaut nach den Screenshots von linkado.de)
// Native Fenstergröße 1480×900 px; die Kamera skaliert/verschiebt das Fenster.
// Alle Texte sind Demo-Inhalte. Jede Textstelle trägt die Klasse "t", damit die
// Rohfassung (".raw" = Nextcloud-Standard als graues Wireframe) sie zu Balken machen kann.
// ============================================================
export const WIN = { w: 1480, h: 900, top: 60, rail: 96 };
const MAIN = { w: WIN.w - WIN.rail, h: WIN.h - WIN.top };   // 1384 × 840

let cssDone = false;
export function installUiCss(E) {
  if (cssDone) return; cssDone = true;
  E.style(`
  .ui-win { position:absolute; left:0; top:0; width:${WIN.w}px; height:${WIN.h}px; border-radius:20px; background:#F6F1E8; overflow:hidden;
            box-shadow:0 2px 6px rgba(31,37,50,.10), 0 40px 90px rgba(31,37,50,.28); transform-origin:0 0; font-family:var(--font-body); color:var(--navy); }
  .ui-win * { box-sizing:border-box; }
  .ui-top { position:absolute; left:0; top:0; right:0; height:${WIN.top}px; background:var(--navy); display:flex; align-items:center; gap:18px; padding:0 20px; z-index:5; }
  .ui-grid { width:30px; height:30px; display:grid; grid-template-columns:repeat(3,6px); gap:4px; align-content:center; justify-content:center; }
  .ui-grid i { width:6px; height:6px; background:#fff; border-radius:1.5px; opacity:.92; }
  .ui-lbox { width:38px; height:38px; border-radius:10px; background:var(--orange); display:flex; align-items:center; justify-content:center; }
  .ui-lbox svg { width:38px; height:38px; }
  .ui-top .sp { flex:1; }
  .ui-ti { width:34px; height:34px; display:flex; align-items:center; justify-content:center; color:rgba(255,255,255,.88); }
  .ui-avatar { position:relative; width:38px; height:38px; border-radius:50%; background:#E8DECB; color:var(--navy); font:700 14px/1 var(--font-body); display:flex; align-items:center; justify-content:center; }
  .ui-avatar::after { content:""; position:absolute; right:-1px; bottom:-1px; width:11px; height:11px; border-radius:50%; background:#3FBF8A; border:2px solid var(--navy); }
  .ui-rail { position:absolute; left:0; top:${WIN.top}px; bottom:0; width:${WIN.rail}px; background:var(--navy); z-index:4; }
  .ui-ri { position:absolute; left:10px; width:${WIN.rail - 20}px; height:74px; border-radius:14px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:7px;
           color:rgba(255,255,255,.80); font:600 13px/1 var(--font-body); }
  .ui-ri.on { background:#F6F1E8; color:var(--navy); }
  .ui-main { position:absolute; left:${WIN.rail}px; top:${WIN.top}px; width:${MAIN.w}px; height:${MAIN.h}px; background:#F6F1E8; border-top-left-radius:18px; overflow:hidden; z-index:3; }
  .ui-view { position:absolute; inset:0; }
  .ui-abs { position:absolute; }

  /* --- Startseite --- */
  .ui-hero { position:absolute; left:16px; top:16px; width:1352px; height:352px; border-radius:16px; background:var(--orange-deep); overflow:hidden; }
  .ui-hero::before { content:""; position:absolute; inset:0; background:repeating-linear-gradient(115deg, rgba(255,255,255,.055) 0 2px, transparent 2px 24px); }
  .ui-hin { position:absolute; left:38px; top:32px; }
  .ui-date { font:600 14px/1 var(--font-body); letter-spacing:.1em; color:rgba(31,37,50,.86); display:inline-block; }
  .ui-greet { margin-top:14px; font-size:58px; line-height:1; color:var(--navy); font-weight:700; display:block; }
  .ui-sub1 { margin-top:12px; font:700 18px/1.3 var(--font-body); color:var(--navy); display:block; }
  .ui-sub2 { margin-top:6px; font:500 17px/1.3 var(--font-body); color:rgba(31,37,50,.9); display:block; }
  .ui-search { margin-top:24px; width:660px; height:58px; background:#fff; border-radius:12px; display:flex; align-items:center; gap:14px; padding:0 18px; font:500 18px/1 var(--font-body); color:#6B6F78; box-shadow:0 2px 0 rgba(0,0,0,.10); position:relative; }
  .ui-kbd { margin-left:auto; border:1.5px solid #CFCFCF; border-radius:7px; padding:3px 10px; font:600 14px/1 var(--font-body); color:#8A8A8A; }
  .ui-btns { margin-top:14px; display:flex; gap:12px; }
  .ui-b { height:46px; border-radius:10px; border:1.5px solid rgba(31,37,50,.55); display:flex; align-items:center; gap:10px; padding:0 18px; font:600 16px/1 var(--font-body); color:var(--navy); background:rgba(255,255,255,.14); }
  .ui-bigdate { position:absolute; right:44px; top:34px; display:flex; align-items:flex-start; gap:16px; }
  .ui-bigdate .d { font:800 214px/0.88 var(--font-display); color:var(--navy); display:block; letter-spacing:-.02em; }
  .ui-bigdate .m { font:700 16px/1.28 var(--font-body); letter-spacing:.08em; color:var(--navy); margin-top:40px; display:block; }
  .ui-day { position:absolute; left:16px; top:384px; width:1352px; height:440px; border-radius:16px; background:#fff; box-shadow:var(--shadow-1); }
  .ui-dayh { position:absolute; left:28px; top:24px; right:28px; height:44px; display:flex; align-items:center; gap:16px; font:600 15px/1 var(--font-body); }
  .ui-dayh .cap { font:700 14px/1 var(--font-body); letter-spacing:.1em; color:var(--orange-deep); display:flex; align-items:center; gap:10px; }
  .ui-dayh .dt { color:var(--navy); font-weight:700; }
  .ui-seg { display:flex; border:1.5px solid #E1DACB; border-radius:10px; overflow:hidden; font:600 14px/1 var(--font-body); }
  .ui-seg span { padding:11px 16px; color:#6B6F78; } .ui-seg span.on { background:#F1EBDD; color:var(--navy); }
  .ui-axis { position:absolute; left:40px; top:96px; width:1272px; height:300px; }
  .ui-hour { position:absolute; top:0; height:300px; width:100px; border-left:1.5px solid #EFE9DC; font:700 13px/1 var(--font-body); color:#9A9690; padding:2px 0 0 8px; }
  .ui-ev { position:absolute; border-radius:10px; background:#FCE8D0; border-left:5px solid var(--orange); padding:12px 14px; font:700 15px/1.25 var(--font-body); color:var(--navy); overflow:hidden; }
  .ui-ev small { display:block; font:500 13px/1.3 var(--font-body); color:#6B6F78; margin-top:3px; }
  .ui-now { position:absolute; top:-8px; width:3px; height:308px; background:var(--orange); }
  .ui-now b { position:absolute; left:-4px; top:-26px; font:800 12px/1 var(--font-body); letter-spacing:.08em; color:var(--orange-deep); white-space:nowrap; }
  .ui-res { position:absolute; width:700px; background:#fff; border-radius:16px; box-shadow:0 2px 6px rgba(31,37,50,.10), 0 30px 70px rgba(31,37,50,.26); padding:10px; z-index:8; }
  .ui-rg { font:700 12px/1 var(--font-body); letter-spacing:.12em; color:#9A9690; padding:12px 14px 6px; display:block; }
  .ui-rr { height:62px; border-radius:11px; display:flex; align-items:center; gap:16px; padding:0 14px; font:600 18px/1.2 var(--font-body); color:var(--navy); }
  .ui-rr.on { background:#FCEFDD; }
  .ui-rr .ic { width:40px; height:40px; border-radius:10px; background:#F1EBDD; display:flex; align-items:center; justify-content:center; color:var(--navy); flex:none; }
  .ui-rr .ic.o { background:var(--orange); color:#fff; }
  .ui-rr small { display:block; font:500 14px/1.3 var(--font-body); color:#7A7770; margin-top:2px; }
  .ui-rr .go { margin-left:auto; color:#B5AFA2; }
  mark.ui-m { background:transparent; color:var(--orange-deep); font-weight:800; }

  /* --- Dateien --- */
  .ui-fside { position:absolute; left:0; top:0; width:262px; height:100%; background:#EFE9DC; padding:18px 14px; }
  .ui-fi { height:46px; border-radius:10px; display:flex; align-items:center; gap:14px; padding:0 14px; font:600 16px/1 var(--font-body); color:var(--navy); margin-bottom:4px; }
  .ui-fi.on { background:var(--orange); color:#fff; }
  .ui-fmain { position:absolute; left:262px; top:0; right:0; height:100%; background:#fff; }
  .ui-ftool { position:absolute; left:28px; top:22px; right:28px; height:50px; display:flex; align-items:center; gap:18px; font:600 16px/1 var(--font-body); }
  .ui-new { height:44px; border-radius:10px; background:var(--orange); color:#fff; display:flex; align-items:center; gap:8px; padding:0 20px; font:700 16px/1 var(--font-body); }
  .ui-fhead { position:absolute; left:28px; right:28px; top:92px; height:40px; display:flex; align-items:center; font:700 14px/1 var(--font-body); color:#8A867D; border-bottom:1.5px solid #EFE9DC; }
  .ui-frow { position:absolute; left:28px; right:28px; height:68px; display:flex; align-items:center; font:600 17px/1 var(--font-body); color:var(--navy); border-bottom:1px solid #F2EDE2; border-radius:8px; }
  .ui-frow .nm { display:flex; align-items:center; gap:16px; width:560px; } .ui-frow .sz { width:140px; color:#7A7770; font-weight:500; } .ui-frow .md { width:200px; color:#7A7770; font-weight:500; }
  .ui-frow .sh { margin-left:auto; display:flex; align-items:center; gap:22px; color:#9A9690; }
  .ui-frow.hl { background:#FCEFDD; }

  /* --- Hilfe-Panel & Support --- */
  .ui-help { position:absolute; width:470px; left:0; top:0; height:100%; background:#fff; border-radius:0 18px 18px 0; box-shadow:0 2px 6px rgba(31,37,50,.10), 24px 0 70px rgba(31,37,50,.28); z-index:9; overflow:hidden; }
  .ui-hh { height:74px; background:var(--navy); color:#fff; display:flex; align-items:center; padding:0 26px; gap:14px; font:700 20px/1 var(--font-display); letter-spacing:.04em; text-transform:uppercase; }
  .ui-hh .x { margin-left:auto; opacity:.8; }
  .ui-hq { margin:20px 24px 0; height:54px; border-radius:12px; border:1.5px solid #E1DACB; display:flex; align-items:center; gap:12px; padding:0 16px; font:500 17px/1 var(--font-body); color:var(--navy); background:#FBF8F2; }
  .ui-art { margin:16px 24px 0; border-radius:14px; background:#F6F1E8; padding:18px 20px 6px; }
  .ui-art h4 { margin:0 0 4px; font:700 21px/1.2 var(--font-display); text-transform:uppercase; }
  .ui-art p { margin:0 0 10px; font:500 15px/1.4 var(--font-body); color:#6B6F78; }
  .ui-step { display:flex; align-items:center; gap:16px; height:52px; font:600 17px/1.2 var(--font-body); }
  .ui-dot { position:relative; width:34px; height:34px; border-radius:50%; border:2px solid #D8D0BF; display:flex; align-items:center; justify-content:center; font:700 15px/1 var(--font-body); color:#9A9690; flex:none; background:#fff; }
  .ui-dot .ck { position:absolute; inset:-2px; border-radius:50%; background:var(--orange); display:flex; align-items:center; justify-content:center; }
  .ui-sup { margin:16px 24px 0; }
  .ui-sh { display:flex; align-items:center; gap:14px; margin-bottom:12px; font:700 16px/1.2 var(--font-body); }
  .ui-sh small { display:block; font:600 13px/1.3 var(--font-body); color:#3A9E70; }
  .ui-bub { max-width:340px; padding:13px 18px; border-radius:16px 16px 16px 4px; background:#F1EBDD; font:500 17px/1.38 var(--font-body); color:var(--navy); margin-bottom:9px; }
  .ui-bub.me { margin-left:auto; border-radius:16px 16px 4px 16px; background:var(--navy); color:#fff; }
  .ui-inp { position:absolute; left:24px; right:24px; bottom:22px; height:54px; border-radius:12px; border:1.5px solid #E1DACB; display:flex; align-items:center; padding:0 16px; gap:12px; font:500 16px/1 var(--font-body); color:#8A867D; background:#fff; }
  .ui-fab { position:absolute; width:62px; height:62px; border-radius:50%; background:var(--orange); color:#fff; display:flex; align-items:center; justify-content:center; box-shadow:0 10px 30px rgba(230,126,34,.45); z-index:7; }
  .ui-hint { position:absolute; height:48px; padding:0 20px 0 6px; border-radius:24px; background:var(--navy); color:#fff; display:flex; align-items:center; gap:12px; font:600 16px/1 var(--font-body); box-shadow:0 14px 34px rgba(31,37,50,.3); z-index:8; white-space:nowrap; }
  .ui-hint .q { width:36px; height:36px; border-radius:50%; background:var(--orange); display:flex; align-items:center; justify-content:center; }
  .ui-caret { display:inline-block; width:2.5px; height:28px; background:var(--orange); margin-left:-8px; border-radius:2px; }

  /* --- Appshop --- */
  .ui-ahead { position:absolute; left:34px; top:26px; right:34px; display:flex; align-items:flex-end; }
  .ui-atitle { font:700 46px/1 var(--font-display); text-transform:uppercase; letter-spacing:-.005em; display:block; }
  .ui-asub { font:500 17px/1.3 var(--font-body); color:#6B6F78; margin-top:10px; display:block; }
  .ui-chips { position:absolute; left:34px; top:132px; display:flex; gap:10px; }
  .ui-chip { height:42px; border-radius:21px; padding:0 20px; display:flex; align-items:center; font:600 15px/1 var(--font-body); background:#fff; border:1.5px solid #E1DACB; color:#4A4F5C; }
  .ui-chip.on { background:var(--navy); color:#fff; border-color:var(--navy); }
  .ui-card { position:absolute; width:420px; height:206px; border-radius:18px; background:#fff; box-shadow:var(--shadow-1); padding:24px; }
  .ui-card .ai { width:68px; height:68px; border-radius:18px; display:flex; align-items:center; justify-content:center; color:#fff; }
  .ui-card h5 { margin:0; font:700 24px/1.1 var(--font-display); text-transform:uppercase; }
  .ui-card p { margin:8px 0 0; font:500 16px/1.4 var(--font-body); color:#6B6F78; }
  .ui-card .ab { position:absolute; left:24px; right:24px; bottom:22px; height:46px; border-radius:11px; display:flex; align-items:center; justify-content:center; gap:8px; font:700 16px/1 var(--font-body); background:var(--orange); color:#fff; }
  .ui-card .ab.done { background:#fff; color:#2F9A68; box-shadow:inset 0 0 0 2px #2F9A68; }
  .ui-mrow { position:absolute; left:34px; width:900px; height:84px; border-radius:16px; background:#fff; box-shadow:var(--shadow-1); display:flex; align-items:center; gap:22px; padding:0 26px; font:700 21px/1.2 var(--font-display); text-transform:uppercase; }
  .ui-mrow small { display:block; font:500 15px/1.3 var(--font-body); color:#6B6F78; text-transform:none; margin-top:3px; }
  .ui-mrow .ai { width:52px; height:52px; border-radius:14px; display:flex; align-items:center; justify-content:center; color:#fff; flex:none; }
  .ui-tg { margin-left:auto; width:64px; height:36px; border-radius:18px; background:#D8D0BF; position:relative; flex:none; }
  .ui-tg i { position:absolute; top:4px; left:4px; width:28px; height:28px; border-radius:50%; background:#fff; box-shadow:0 2px 5px rgba(0,0,0,.25); }

  /* --- Cursor & Klick --- */
  .ui-cur { position:absolute; left:0; top:0; width:34px; height:34px; z-index:50; pointer-events:none; filter:drop-shadow(0 4px 6px rgba(0,0,0,.35)); }
  .ui-rip { position:absolute; width:60px; height:60px; margin:-30px 0 0 -30px; border-radius:50%; border:3px solid var(--orange); z-index:49; pointer-events:none; }

  /* --- Rohfassung („Nextcloud-Standard“) --- */
  .raw, .raw * { color:transparent !important; text-shadow:none !important; box-shadow:none !important; }
  .raw.ui-win { background:#E6E9EE !important; box-shadow:0 2px 6px rgba(31,37,50,.10), 0 40px 90px rgba(31,37,50,.22) !important; }
  .raw .ui-top, .raw .ui-rail { background:#BFC5CE !important; }
  .raw .ui-main { background:#EEF0F4 !important; }
  .raw .ui-ri.on { background:#EEF0F4 !important; }
  .raw .ui-lbox { background:#A9B0BB !important; } .raw .ui-lbox svg, .raw .ui-grid i { opacity:.0; }
  .raw .ui-grid i { background:#A9B0BB !important; opacity:1; }
  .raw .ui-avatar { background:#A9B0BB !important; } .raw .ui-avatar::after { display:none; }
  .raw .ui-hero { background:#D6DAE1 !important; } .raw .ui-hero::before { display:none; }
  .raw .ui-day { background:#F8F9FB !important; border:1.5px solid #D3D8DF; }
  .raw .ui-search, .raw .ui-b { background:#F8F9FB !important; border:1.5px solid #C4CAD3 !important; }
  .raw .ui-ev { background:#E3E6EB !important; border-left-color:#B0B7C2 !important; }
  .raw .ui-now { background:#B0B7C2 !important; }
  .raw .ui-hour { border-left-color:#E0E4EA !important; }
  .raw .ui-seg { border-color:#D3D8DF !important; }
  .raw .t { background:#C3C9D2 !important; border-radius:5px; }
  .raw svg { stroke:#AEB5C0 !important; }
  .raw .flag { background:#B0B7C2 !important; }
  `);
}

/* ---------- Bausteine ---------- */
export function buildUI(E) {
  installUiCss(E);
  const { h, icon } = E;
  const ic = (n, s = 22, c = 'currentColor', w = 2) => h('span', { style: { display: 'inline-flex' }, html: icon(n, s, c, w) });
  const T = (cls, text, tag = 'span') => h(tag, { class: 't ' + cls, text });
  const lGlyph = '<svg viewBox="0 0 400 400"><path d="M139 100H176V270H277V300H139Z" fill="#1F2532"/></svg>';

  /* Fenster inkl. Kopfleiste und Leiste links */
  function window_(opts = {}) {
    const rail = [
      ['house', 'Startseite'], ['folder', 'Dateien'], ['calendar', 'Kalender'], ['contact', 'Kontakte'], ['mail', 'E-Mail'], ['message-circle', 'Talk'],
    ];
    const top = h('div', { class: 'ui-top' },
      h('div', { class: 'ui-grid' }, Array.from({ length: 9 }, () => h('i'))),
      h('div', { class: 'ui-lbox', html: lGlyph }),
      h('div', { class: 'sp' }),
      ['sparkles', 'search', 'bell', 'building-2', 'globe'].map((n) => h('div', { class: 'ui-ti', html: icon(n, 22, 'currentColor', 2) })),
      h('div', { class: 'ui-avatar', text: 'AM' }));
    const railEl = h('div', { class: 'ui-rail' });
    const items = {};
    const mk = (id, name, label, y) => {
      const el = h('div', { class: 'ui-ri', style: { top: y } }, h('span', { html: icon(name, 28, 'currentColor', 2) }), T('', label));
      railEl.append(el); items[id] = el; return el;
    };
    rail.forEach(([n, l], i) => mk(l, n, l, 12 + i * 80));
    mk('Appshop', 'store', 'Appshop', MAIN.h - 12 - 80 * 2);
    mk('Support', 'life-buoy', 'Support', MAIN.h - 12 - 80);
    const main = h('div', { class: 'ui-main' });
    const el = h('div', { class: 'ui-win' + (opts.raw ? ' raw' : '') }, top, railEl, main);
    return { el, top, rail: railEl, main, items, mk, setActive(id) { for (const k in items) items[k].classList.toggle('on', k === id); } };
  }

  /* Startseite mit Begrüßungsfläche + Tagesleiste */
  function dashboard() {
    const hero = h('div', { class: 'ui-hero' },
      h('div', { class: 'ui-hin' },
        T('ui-date', 'MITTWOCH, 14. OKTOBER 2026 · KW 42'),
        h('h1', { class: 't ui-greet disp', text: 'Guten Morgen, Anna.', style: { margin: '14px 0 0' } }),
        T('ui-sub1', 'Alles Wichtige für heute auf einen Blick'),
        T('ui-sub2', 'Nächster Termin in 47 Minuten: Teamtermin · Besprechungsraum 2'),
        h('div', { class: 'ui-search' }, ic('search', 22, '#6B6F78'), T('', 'Suchen: Datei, Person, Termin …'), h('span', { class: 'ui-caret', style: { display: 'none' } }), T('ui-kbd', '/')),
        h('div', { class: 'ui-btns' }, h('div', { class: 'ui-b' }, ic('calendar-days', 20), T('', 'Termin eintragen')), h('div', { class: 'ui-b' }, ic('message-square', 20), T('', 'Nachricht schreiben')))),
      h('div', { class: 'ui-bigdate' }, T('d disp', '14'), h('span', { class: 't m', html: 'MI<br>OKT<br>KW 42' })));
    const axis = h('div', { class: 'ui-axis' });
    for (let i = 0; i < 12; i++) axis.append(h('div', { class: 'ui-hour', style: { left: i * 100 } }, T('', String(7 + i).padStart(2, '0'))));
    axis.append(
      h('div', { class: 'ui-ev', style: { left: 250, top: 22, width: 150, height: 96 } }, T('', '09:30 Teamtermin'), h('small', { class: 't', text: 'Besprechungsraum 2' })),
      h('div', { class: 'ui-ev', style: { left: 450, top: 150, width: 200, height: 96 } }, T('', '11:00 Angebot'), h('small', { class: 't', text: 'Termin mit Kunde' })),
      h('div', { class: 'ui-ev', style: { left: 760, top: 40, width: 260, height: 96 } }, T('', '14:00 Projektstand'), h('small', { class: 't', text: 'Talk-Raum Projekte' })),
      h('div', { class: 'ui-now', style: { left: 124 } }, h('b', { class: 't', text: 'JETZT 08:13' })));
    const day = h('div', { class: 'ui-day' },
      h('div', { class: 'ui-dayh' }, h('span', { class: 'cap' }, h('span', { class: 'flag' }), T('', 'IHR TAG')), T('dt', 'Mittwoch, 14. Oktober · heute'),
        h('span', { style: { flex: 1 } }), h('div', { class: 'ui-seg' }, T('on', 'Tag', 'span'), T('', 'Woche', 'span'), T('', 'Monat', 'span')), h('div', { class: 'ui-seg' }, T('on', 'Band', 'span'), T('', 'Liste', 'span'))),
      axis);
    const el = h('div', { class: 'ui-view' }, hero, day);
    return { el, hero, day, axis, search: hero.querySelector('.ui-search'), searchText: hero.querySelector('.ui-search .t'), caret: hero.querySelector('.ui-caret'), hin: hero.querySelector('.ui-hin') };
  }

  /* Suchergebnisse (Dropdown unter dem Suchfeld) */
  function results(query = 'Angebot') {
    const rows = [
      ['file-text', 'Angebot_Meyer_2026.pdf', 'Datei · Projekte / Vertrieb', false],
      ['calendar-check', 'Angebot besprechen', 'Termin · heute 11:00', false],
      ['user-round', 'Anna Meyer', 'Person · Vertrieb', false],
      ['message-circle', 'Angebot für Kunde Hartmann', 'Talk · Projekte', false],
    ];
    const hl = (s) => { const i = s.toLowerCase().indexOf(query.toLowerCase()); return i < 0 ? s : s.slice(0, i) + '<mark class="ui-m">' + s.slice(i, i + query.length) + '</mark>' + s.slice(i + query.length); };
    const rowEls = rows.map(([n, a, b], i) => h('div', { class: 'ui-rr' + (i === 0 ? ' on' : '') }, h('span', { class: 'ic' + (i === 0 ? ' o' : ''), html: icon(n, 22, 'currentColor', 2) }), h('div', {}, h('span', { class: 't', html: hl(a) }), h('small', { class: 't', text: b })), h('span', { class: 'go', html: icon('arrow-up-right', 20, 'currentColor', 2) })));
    const el = h('div', { class: 'ui-res' }, h('span', { class: 'ui-rg t', text: 'TREFFER ÜBERALL' }), rowEls);
    return { el, rows: rowEls };
  }

  /* Dateien-Ansicht */
  function files() {
    const side = h('div', { class: 'ui-fside' }, [['folder-open', 'Alle Dateien', true], ['user', 'Persönliche Dateien'], ['clock', 'Neueste'], ['star', 'Favoriten'], ['share-2', 'Freigaben'], ['users', 'Team-Ordner'], ['tag', 'Schlagworte']]
      .map(([n, l, on]) => h('div', { class: 'ui-fi' + (on ? ' on' : '') }, ic(n, 20), T('', l))));
    const rowsDef = [['folder', 'Freigaben', '–', 'vor 4 Minuten', true], ['folder', 'Projekte', '–', 'vor 4 Minuten', true], ['folder', 'Vertrieb', '–', 'gestern', true],
      ['file-text', 'Angebot_Meyer_2026.pdf', '412 KB', 'gestern'], ['file-text', 'Protokoll_Teamtermin.docx', '86 KB', 'vor 2 Tagen'], ['file-spreadsheet', 'Preisliste.xlsx', '58 KB', 'vor 3 Tagen']];
    const rowEls = rowsDef.map(([n, name, sz, md, folder], i) => h('div', { class: 'ui-frow', style: { top: 140 + i * 70 } },
      h('div', { class: 'nm' }, h('span', { html: icon(n, 26, folder ? '#E67E22' : '#5B6272', 2) }), T('', name)), T('sz', sz), T('md', md),
      h('div', { class: 'sh' }, h('span', { class: 'shr', html: icon('share-2', 22, 'currentColor', 2) }), h('span', { html: icon('ellipsis', 22, 'currentColor', 2) }))));
    const main = h('div', { class: 'ui-fmain' },
      h('div', { class: 'ui-ftool' }, h('div', { class: 'ui-new' }, ic('plus', 20, '#fff', 2.6), T('', 'Neu')), h('span', { class: 't', text: 'Alle Dateien' }), ic('chevron-right', 18, '#9A9690'), h('span', { class: 't', text: 'Projekte', style: { fontWeight: 800 } })),
      h('div', { class: 'ui-fhead' }, h('span', { class: 't', text: 'Name', style: { width: 588 } }), h('span', { class: 't', text: 'Größe', style: { width: 140 } }), h('span', { class: 't', text: 'Geändert' })),
      rowEls);
    const el = h('div', { class: 'ui-view' }, side, main);
    return { el, rows: rowEls, side, main };
  }

  /* Appshop */
  const APPS = [
    ['Formulare', 'Umfragen und Anmeldungen in Minuten', 'clipboard-list', '#E67E22'],
    ['Deck', 'Aufgaben übersichtlich als Board', 'columns-3', '#3B6FD4'],
    ['Notizen', 'Gedanken schnell festhalten', 'notebook-pen', '#2F9A68'],
    ['Collectives', 'Wissen gemeinsam pflegen', 'book-open', '#8A5CD0'],
    ['Umfragen', 'Termine gemeinsam finden', 'chart-bar', '#D1497A'],
    ['Whiteboard', 'Gemeinsam skizzieren', 'pencil', '#1F2532'],
  ];
  function appshop() {
    const head = h('div', { class: 'ui-ahead' }, h('div', {}, h('span', { class: 't ui-atitle', text: 'Appshop' }), h('span', { class: 't ui-asub', text: 'Die passenden Werkzeuge für dein Team' })));
    const seg = h('div', { class: 'ui-seg ui-abs', style: { left: 34, top: 112, height: 48, alignItems: 'stretch' } }, T('on', 'Entdecken', 'span'), T('', 'Meine Apps', 'span'));
    seg.style.fontSize = '16px';
    const chips = h('div', { class: 'ui-chips', style: { left: 330, top: 115 } }, ['Alle', 'Büro', 'Kommunikation', 'Projekte', 'Wissen'].map((c, i) => h('div', { class: 'ui-chip' + (i === 0 ? ' on' : '') }, T('', c))));
    const cards = APPS.map(([name, desc, ico, col], i) => {
      const aicon = h('div', { class: 'ai', style: { background: col }, html: icon(ico, 34, '#fff', 2) });
      const idle = h('span', { style: { display: 'inline-flex', alignItems: 'center', gap: 8 } }, ic('plus', 20, '#fff', 2.6), T('', 'Hinzufügen'));
      const done = h('span', { style: { display: 'none', alignItems: 'center', gap: 8 } }, ic('check', 20, '#2F9A68', 3), T('', 'Hinzugefügt'));
      const btn = h('div', { class: 'ab' }, idle, done);
      const el = h('div', { class: 'ui-card', style: { left: 34 + (i % 3) * 440, top: 206 + Math.floor(i / 3) * 226 } },
        h('div', { style: { display: 'flex', gap: 18, alignItems: 'center' } }, aicon, h('div', {}, h('h5', { class: 't', text: name }), h('p', { class: 't', text: desc, style: { margin: '6px 0 0', maxWidth: 270 } }))), btn);
      return { el, aicon, btn, idle, done, name, col, ico };
    });
    const list = APPS.concat([['Talk', 'Chat und Video', 'message-circle', '#E67E22'], ['Kalender', 'Termine und Räume', 'calendar', '#3B6FD4']]).map(([name, desc, ico, col], i) => {
      const tg = h('div', { class: 'ui-tg' }, h('i'));
      const el = h('div', { class: 'ui-mrow', style: { top: 190 + i * 94 } }, h('div', { class: 'ai', style: { background: col }, html: icon(ico, 28, '#fff', 2) }), h('div', {}, h('span', { class: 't', text: name }), h('small', { class: 't', text: desc })), tg);
      return { el, tg, name };
    });
    const listWrap = h('div', { class: 'ui-abs', style: { inset: 0 } }, list.map((r) => r.el));
    const cardsWrap = h('div', { class: 'ui-abs', style: { inset: 0 } }, cards.map((c) => c.el));
    const el = h('div', { class: 'ui-view' }, head, seg, chips, cardsWrap, listWrap);
    return { el, head, chips, cards, list, cardsWrap, listWrap, seg };
  }

  /* Hilfe-Drawer (öffnet aus der Support-Leiste) mit Anleitung und Support-Chat */
  function help() {
    const steps = ['Ordner anklicken', '„Teilen“ wählen', 'Link kopieren'].map((s, i) => {
      const ck = h('span', { class: 'ck', html: icon('check', 20, '#fff', 3.2), style: { display: 'none' } });
      const dot = h('div', { class: 'ui-dot' }, h('span', { text: String(i + 1) }), ck);
      return { dot, ck, el: h('div', { class: 'ui-step' }, dot, T('', s)) };
    });
    const typing = h('div', { class: 'ui-bub', style: { width: 92, position: 'absolute', left: 0, top: 0 } }, h('span', { class: 'td', html: '<i></i><i></i><i></i>' }));
    const b1 = h('div', { class: 'ui-bub' }, T('', 'Hallo Anna! Wobei können wir helfen?'));
    const b2 = h('div', { class: 'ui-bub me' }, T('', 'Wie lade ich Kollegen ein?'));
    const b3 = h('div', { class: 'ui-bub', style: { marginBottom: 0 } }, T('', 'Zeigen wir dir gern – Schritt für Schritt.'));
    const slot3 = h('div', { style: { position: 'relative', minHeight: 70 } }, b3, typing);
    const el = h('div', { class: 'ui-help' },
      h('div', { class: 'ui-hh' }, ic('life-buoy', 26, '#fff'), T('', 'Hilfe & Support'), h('span', { class: 'x', html: icon('x', 24, '#fff', 2.4) })),
      h('div', { class: 'ui-hq' }, ic('search', 22, '#8A867D'), T('', 'Wie teile ich einen Ordner?')),
      h('div', { class: 'ui-art' }, h('h4', { class: 't', text: 'Ordner teilen' }), h('p', { class: 't', text: 'In drei Schritten – direkt hier erklärt.' }), steps.map((s) => s.el)),
      h('div', { class: 'ui-sup' },
        h('div', { class: 'ui-sh' }, h('div', { class: 'ui-lbox', html: lGlyph, style: { width: 42, height: 42 } }), h('div', {}, T('', 'Linkado Support'), h('small', { class: 't', text: '● Online' }))),
        b1, b2, slot3),
      h('div', { class: 'ui-inp' }, T('', 'Nachricht schreiben …'), h('span', { style: { marginLeft: 'auto', color: '#E67E22' }, html: icon('send', 22, 'currentColor', 2.2) })));
    E.style('.ui-bub .td i{display:inline-block;width:9px;height:9px;margin:0 4px;border-radius:50%;background:#9A9690}');
    return { el, steps, b1, b2, b3, typing };
  }

  /* Kontext-Hinweis „Fragen zum Teilen?“ */
  function hint(text = 'Fragen zum Teilen? Hier erklärt.') {
    return { el: h('div', { class: 'ui-hint' }, h('span', { class: 'q', html: icon('circle-help', 24, '#fff', 2.4) }), h('span', { class: 't', text })) };
  }

  /* Cursor (Pfeil) und Klick-Welle */
  function cursor() {
    const el = h('div', { class: 'ui-cur', html: '<svg viewBox="0 0 34 34" width="34" height="34"><path d="M5 3 L5 26 L11 21 L15 30 L19 28 L15 20 L23 20 Z" fill="#fff" stroke="#1F2532" stroke-width="2" stroke-linejoin="round"/></svg>' });
    const rip = h('div', { class: 'ui-rip' });
    return { el, rip };
  }

  return { window: window_, dashboard, results, files, appshop, help, hint, cursor, APPS, MAIN, WIN, ic, T, lGlyph };
}
