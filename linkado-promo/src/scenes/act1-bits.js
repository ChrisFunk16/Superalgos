// ============================================================
// Act I – Bausteine: Laptop, Handy und viele unterschiedliche Mini-Oberflächen
// Alles generisch (keine Marken): Jede Mini-Oberfläche hat bewusst ihre eigene Farbe, Schrift und Anmutung –
// zusammen füllen sie den Bildschirm so, wie sich ein Arbeitstag mit vielen einzelnen Werkzeugen anfühlt.
// ============================================================
let done = false;
export function installBits(E) {
  if (done) return; done = true;
  E.style(`
  .b1-lap { position:absolute; width:840px; height:560px; }
  .b1-lbez { position:absolute; left:0; top:0; width:840px; height:520px; border-radius:22px 22px 8px 8px; background:#0B0F18; border:2px solid #2A3144; box-shadow:0 26px 50px rgba(0,0,0,.5); }
  .b1-lscr { position:absolute; left:14px; top:14px; width:812px; height:492px; border-radius:8px; overflow:hidden; background:#101828; }
  .b1-lbase { position:absolute; left:-44px; top:518px; width:928px; height:22px; border-radius:0 0 26px 26px; background:linear-gradient(#C7CCD6,#8890A2); box-shadow:0 14px 26px rgba(0,0,0,.45); }
  .b1-lbase::before { content:""; position:absolute; left:50%; top:0; width:150px; height:8px; margin-left:-75px; border-radius:0 0 10px 10px; background:#6C7488; }
  .b1-ph { position:absolute; width:330px; height:680px; border-radius:50px; background:#0B0F18; border:2px solid #2A3144; box-shadow:0 26px 50px rgba(0,0,0,.5); transform-origin:0 0; }
  .b1-pscr { position:absolute; left:12px; top:12px; width:306px; height:656px; border-radius:38px; overflow:hidden; background:#101828; }
  .b1-pnotch { position:absolute; left:50%; top:20px; width:92px; height:24px; margin-left:-46px; border-radius:12px; background:#05070B; z-index:4; }
  .b1-mini { position:absolute; left:0; top:0; border-radius:12px; overflow:hidden; background:#fff; box-shadow:0 8px 18px rgba(0,0,0,.4); font-family:var(--font-body); color:#1F2532; }
  .b1-mini .hd { height:32px; display:flex; align-items:center; gap:8px; padding:0 12px; color:#fff; font:700 13px/1 var(--font-body); letter-spacing:.02em; }
  .b1-mini .hd i { width:9px; height:9px; border-radius:50%; background:rgba(255,255,255,.55); display:block; }
  .b1-mini .bar { height:9px; border-radius:4px; background:#DDE2EA; }
  .b1-q { position:absolute; display:flex; align-items:flex-end; gap:16px; }
  .b1-q .av { width:58px; height:58px; border-radius:50%; flex:none; overflow:hidden; box-shadow:0 6px 14px rgba(0,0,0,.4); }
  .b1-q .bd { padding:16px 26px 18px; border-radius:26px 26px 26px 6px; background:rgba(34,43,64,.97); border:1.5px solid rgba(255,255,255,.2); color:#F4EEE3; font:500 31px/1.28 var(--font-body); box-shadow:0 12px 28px rgba(0,0,0,.35); }
  .b1-q .bd { text-wrap:balance; }
  .b1-q .nm { display:block; font:600 16px/1 var(--font-body); color:#9AA3B8; letter-spacing:.05em; margin-bottom:9px; text-transform:uppercase; }
  `);
}

/** Laptop: .el (840×560, Boden bei y=540), .screen (812×492) */
export function laptop(E) {
  installBits(E); const { h } = E;
  const screen = h('div', { class: 'b1-lscr' });
  return { el: h('div', { class: 'b1-lap' }, h('div', { class: 'b1-lbez' }, screen), h('div', { class: 'b1-lbase' })), screen };
}
/** Handy: .el (330×680), .screen (306×656) – Skalierung über transform am .el */
export function phone(E) {
  installBits(E); const { h } = E;
  const screen = h('div', { class: 'b1-pscr' });
  return { el: h('div', { class: 'b1-ph' }, h('div', { class: 'b1-pnotch' }), screen), screen };
}

/** Eine kleine, eigenständige Oberfläche (generisch). kind: mail · chat · cal · sheet · video · ticket · ai · files · kanban · form · notes */
export function mini(E, kind, w = 300, hgt = 200) {
  installBits(E); const { h, icon } = E;
  const el = h('div', { class: 'b1-mini', style: { width: w, height: hgt } });
  const hd = (col, title, ico) => h('div', { class: 'hd', style: { background: col } }, h('i'), h('i'), ico ? h('span', { html: icon(ico, 15, '#fff', 2.2) }) : null, title);
  const bars = (n, wd = [100, 82, 90, 66, 76]) => Array.from({ length: n }, (_, i) => h('div', { class: 'bar', style: { width: wd[i % wd.length] + '%', marginTop: 9 } }));
  switch (kind) {
    case 'mail':
      el.append(hd('#2F6FDE', 'Posteingang', 'mail'), h('div', { style: { position: 'absolute', left: 0, top: 32, bottom: 0, width: 64, background: '#EEF2F8', padding: '12px 10px' } }, ...bars(4, [100, 80, 90, 70])),
        h('div', { style: { position: 'absolute', left: 64, top: 32, right: 0, bottom: 0, padding: '10px 12px' } }, ...[0, 1, 2, 3].map((i) => h('div', { style: { display: 'flex', alignItems: 'center', gap: 8, height: 34, borderBottom: '1px solid #E6EAF1' } }, h('i', { style: { width: 8, height: 8, borderRadius: '50%', background: i === 0 ? '#2F6FDE' : '#C9D0DE', display: 'block' } }), h('div', { class: 'bar', style: { width: [150, 120, 160, 100][i], height: i === 0 ? 11 : 9, background: i === 0 ? '#1F2532' : '#DDE2EA' } })))));
      break;
    case 'chat':
      el.style.background = '#F3F1FF'; el.append(hd('#7B6CF6', 'Team-Chat', 'message-square'),
        h('div', { style: { position: 'absolute', left: 14, top: 46, width: '62%', padding: '10px 12px', borderRadius: '12px 12px 12px 3px', background: '#fff', font: '600 13px/1.3 var(--font-body)' }, text: 'Hat jemand den Link?' }),
        h('div', { style: { position: 'absolute', right: 14, top: 98, width: '56%', padding: '10px 12px', borderRadius: '12px 12px 3px 12px', background: '#7B6CF6', color: '#fff', font: '600 13px/1.3 var(--font-body)' }, text: 'Liegt im Ordner.' }),
        h('div', { style: { position: 'absolute', left: 14, right: 14, bottom: 12, height: 28, borderRadius: 14, background: '#fff', border: '1px solid #DAD5F5' } }));
      break;
    case 'cal':
      el.append(hd('#E5565B', 'Kalender', 'calendar'));
      for (let r = 0; r < 4; r++) for (let c = 0; c < 7; c++) el.append(h('div', { style: { position: 'absolute', left: 8 + c * ((w - 16) / 7), top: 40 + r * ((hgt - 48) / 4), width: (w - 16) / 7 - 3, height: (hgt - 48) / 4 - 3, borderRadius: 4, background: '#F3F4F8' } }));
      [[1, 1, '#E5565B', 2], [3, 2, '#2F6FDE', 2], [0, 3, '#1E9E6A', 3]].forEach(([c, r, col, sp]) => el.append(h('div', { style: { position: 'absolute', left: 8 + c * ((w - 16) / 7), top: 40 + r * ((hgt - 48) / 4), width: ((w - 16) / 7) * sp - 3, height: (hgt - 48) / 4 - 3, borderRadius: 4, background: col, opacity: 0.9 } })));
      break;
    case 'sheet':
      el.style.fontFamily = 'monospace'; el.append(hd('#1E9E6A', 'Tabelle', 'table-2'));
      for (let r = 0; r < 6; r++) for (let c = 0; c < 4; c++) el.append(h('div', { style: { position: 'absolute', left: 8 + c * ((w - 16) / 4), top: 38 + r * 26, width: (w - 16) / 4 - 2, height: 24, border: '1px solid #DCE5DF', background: r === 0 ? '#E7F4EC' : '#fff', font: '600 11px/24px monospace', padding: '0 6px', color: '#33523F' }, text: r === 0 ? ['Q1', 'Q2', 'Q3', 'Q4'][c] : String(((r * 7 + c * 13) % 90) + 10) + ',' + ((c * 3 + r) % 10) }));
      break;
    case 'video':
      el.style.background = '#151A26'; el.append(h('div', { style: { position: 'absolute', left: 0, top: 0, right: 0, height: 28, background: '#0E121C' } }));
      ['#C9825A', '#5B7FA8', '#7B6CF6', '#3FA187'].forEach((col, i) => el.append(h('div', { style: { position: 'absolute', left: 10 + (i % 2) * ((w - 30) / 2 + 10), top: 38 + Math.floor(i / 2) * ((hgt - 86) / 2 + 8), width: (w - 30) / 2, height: (hgt - 86) / 2, borderRadius: 8, background: col, opacity: 0.85 } }, h('div', { style: { position: 'absolute', left: '50%', top: '28%', width: 26, height: 26, marginLeft: -13, borderRadius: '50%', background: 'rgba(0,0,0,.28)' } }))));
      break;
    case 'ticket':
      el.append(hd('#14A8A8', 'Tickets', 'clipboard-list'), ...[['offen', '#E5565B'], ['in Arbeit', '#E8A33D'], ['offen', '#E5565B'], ['erledigt', '#3FBF8A']].map(([st, col], i) => h('div', { style: { position: 'absolute', left: 12, right: 12, top: 42 + i * 38, height: 30, display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid #E6EAF1' } }, h('b', { style: { font: '700 12px/1 var(--font-body)', color: '#667' }, text: '#' + (4700 + i * 11) }), h('div', { class: 'bar', style: { width: [120, 96, 110, 80][i] } }), h('span', { style: { marginLeft: 'auto', padding: '4px 8px', borderRadius: 99, background: col, color: '#fff', font: '700 10.5px/1 var(--font-body)' }, text: st }))));
      break;
    case 'ai':
      el.style.background = 'linear-gradient(160deg,#1E2440,#2B1F4A)'; el.append(h('div', { class: 'hd', style: { background: 'rgba(255,255,255,.08)' } }, h('span', { html: icon('sparkles', 15, '#C7B8FF', 2.2) }), 'Assistent'),
        h('div', { style: { position: 'absolute', right: 14, top: 46, width: '58%', padding: '9px 12px', borderRadius: '12px 12px 3px 12px', background: '#7B6CF6', color: '#fff', font: '600 12.5px/1.3 var(--font-body)' }, text: 'Fasse das kurz zusammen.' }),
        h('div', { style: { position: 'absolute', left: 14, top: 96, width: '70%', padding: '10px 12px', borderRadius: '12px 12px 12px 3px', background: 'rgba(255,255,255,.12)' } }, ...bars(3, [100, 88, 60]).map((b) => { b.style.background = 'rgba(255,255,255,.35)'; return b; })));
      break;
    case 'files':
      el.append(hd('#36A9E8', 'Dateien', 'folder'), ...['Projekte', 'Angebote', 'Archiv_alt', 'final_neu (2)', 'Scans'].map((n, i) => h('div', { style: { position: 'absolute', left: 14, right: 14, top: 40 + i * 28, height: 24, display: 'flex', alignItems: 'center', gap: 10, font: '600 12.5px/1 var(--font-body)', color: '#2A3550' } }, h('span', { html: icon(i < 3 ? 'folder' : 'file-text', 16, i < 3 ? '#E8A33D' : '#6B7A99', 2) }), n)));
      break;
    case 'kanban':
      el.style.background = '#FBEFF3'; el.append(hd('#D1497A', 'Board', 'kanban'));
      for (let c = 0; c < 3; c++) { const col = h('div', { style: { position: 'absolute', left: 8 + c * ((w - 16) / 3), top: 40, width: (w - 16) / 3 - 6, bottom: 8, borderRadius: 8, background: 'rgba(209,73,122,.1)', padding: 6 } }); for (let k = 0; k < 3 - (c % 2); k++) col.append(h('div', { style: { height: 30, borderRadius: 6, background: '#fff', marginBottom: 6, boxShadow: '0 1px 2px rgba(0,0,0,.12)' } })); el.append(col); }
      break;
    case 'form':
      el.append(hd('#4C5BD4', 'Formular', 'clipboard-list'), ...[0, 1, 2].map((i) => h('div', { style: { position: 'absolute', left: 14, right: 14, top: 44 + i * 40, height: 28, borderRadius: 6, border: '1.5px solid #CBD2EA', background: '#F7F8FD' } })), h('div', { style: { position: 'absolute', left: 14, bottom: 12, width: 90, height: 26, borderRadius: 6, background: '#4C5BD4' } }));
      break;
    default:
      el.style.background = '#FFF6C7'; el.append(hd('#E8A33D', 'Notizen', 'notebook-pen'), h('div', { style: { padding: '8px 14px' } }, ...bars(5, [100, 90, 96, 70, 82]).map((b) => { b.style.background = '#E9D98A'; return b; })));
  }
  return el;
}

/** Alltagssatz einer (erfundenen) Kollegin / eines Kollegen mit Profilbild */
export function quote(E, avatarHTML, { who, role, text, w = 620 }) {
  installBits(E); const { h } = E;
  const el = h('div', { class: 'b1-q', style: { width: w } }, h('span', { class: 'av', html: avatarHTML }), h('div', { class: 'bd' }, h('span', { class: 'nm', text: `${who} · ${role}` }), text));
  return el;
}
