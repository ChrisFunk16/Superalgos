// ============================================================
// Geräte „Ein Browser genügt“ (Übergang zum Drop, siehe transition.js): Laptop mit Browser-Leiste (36 Tabs, die sich zu EINEM falten) und ein Handy mit derselben Oberfläche.
// Alles gezeichnet in Fensterkoordinaten (1480 × 900), damit es mit der Kamera der Oberflächen-Szene mitläuft.
// Bewusst generisch: erfundene Adresse, keine Marken außer Linkado.
// ============================================================
import { avatarHTML } from '../ui.js';
import { phone } from './act1-bits.js';

let done = false;
export function installDevices(E) {
  if (done) return; done = true;
  E.style(`
  .dv-bezel { position:absolute; left:-26px; top:-122px; width:1532px; height:1048px; border-radius:34px 34px 14px 14px; background:#0B0F18; border:2px solid #2A3144; box-shadow:0 40px 90px rgba(31,37,50,.38), 0 6px 14px rgba(31,37,50,.2); }
  .dv-base { position:absolute; left:-110px; top:926px; width:1700px; height:40px; border-radius:0 0 46px 46px; background:linear-gradient(#D5D9E1,#9AA1B2); box-shadow:0 26px 40px rgba(31,37,50,.32); }
  .dv-base::before { content:""; position:absolute; left:50%; top:0; width:260px; height:14px; margin-left:-130px; border-radius:0 0 18px 18px; background:#7D8598; }
  .dv-chrome { position:absolute; left:0; top:-96px; width:1480px; height:96px; background:#E9ECF2; border-radius:16px 16px 0 0; font-family:var(--font-body); color:#2B3345; }
  .dv-dots { position:absolute; left:22px; top:16px; display:flex; gap:9px; } .dv-dots i { width:13px; height:13px; border-radius:50%; background:#C9CED9; display:block; }
  .dv-tab { position:absolute; left:112px; top:8px; width:340px; height:40px; border-radius:12px 12px 0 0; background:#fff; display:flex; align-items:center; gap:12px; padding:0 14px; font:600 20px/1 var(--font-body); box-shadow:0 -1px 0 #D5D9E3 inset; }
  .dv-tab .fav { width:24px; height:24px; border-radius:6px; overflow:hidden; display:block; flex:none; }
  .dv-tab .x { margin-left:auto; color:#8A92A5; display:flex; }
  .dv-plus { position:absolute; left:470px; top:14px; width:28px; height:28px; border-radius:50%; display:flex; align-items:center; justify-content:center; color:#7D8598; }
  .dv-url { position:absolute; left:0; top:48px; width:1480px; height:48px; background:#fff; border-top:1.5px solid #D5D9E3; display:flex; align-items:center; gap:14px; padding:0 22px; color:#7D8598; }
  .dv-url .pill { flex:none; display:flex; align-items:center; gap:10px; width:720px; height:34px; border-radius:17px; background:#EEF0F5; padding:0 16px; font:500 20px/1 var(--font-body); color:#2B3345; }
  .dv-one { position:absolute; right:26px; top:4px; height:46px; padding:0 20px; border-radius:23px; background:var(--orange); color:#fff; font:700 26px/46px var(--font-body); letter-spacing:.1em; box-shadow:0 8px 18px rgba(230,126,34,.4); }
  .dv-ph { font-family:var(--font-body); color:#1F2532; }
  .dv-tab .fav svg, .dv-ph .fav svg { display:block; width:100%; height:100%; }
  `);
}

const HOME = (E, h, icon) => {
  const sc = [];
  const ab = (st) => h('div', { class: 'abs', style: st });
  // Statuszeile
  sc.push(h('div', { class: 'abs', style: { left: 26, top: 16, right: 26, height: 22, display: 'flex', justifyContent: 'space-between', font: '700 14px/22px var(--font-body)', color: '#1F2532' } }, h('span', { text: '09:13' }), h('span', { text: '▮▮▮  100 %' })));
  // Adresszeile des mobilen Browsers
  sc.push(h('div', { class: 'abs', style: { left: 16, top: 52, right: 16, height: 38, borderRadius: 19, background: '#EEF0F5', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, font: '500 14px/1 var(--font-body)', color: '#2B3345' } }, h('span', { html: icon('lock', 14, '#5E6678', 2.2) }), 'cloud.musterfirma.de'));
  // Kopfzeile
  sc.push(h('div', { class: 'abs', style: { left: 16, top: 106, right: 16, height: 40, display: 'flex', alignItems: 'center', gap: 10 } },
    h('span', { html: icon('menu', 24, '#1F2532', 2.2) }), h('span', { class: 'fav', html: E.iconSVG({ rx: 60 }), style: { width: 26, height: 26, display: 'block', borderRadius: 7, overflow: 'hidden' } }),
    h('span', { text: 'START', style: { font: '700 19px/1 var(--font-display)', letterSpacing: '.04em' } }), h('span', { style: { marginLeft: 'auto' }, html: avatarHTML('anna', 34) })));
  // Hero
  sc.push(h('div', { class: 'abs', style: { left: 16, top: 160, right: 16, height: 158, borderRadius: 22, background: 'linear-gradient(160deg,#E67E22,#D9701A)', padding: '18px 20px', color: '#fff', boxShadow: '0 10px 24px rgba(217,112,26,.35)' } },
    h('div', { text: 'MITTWOCH · 09:13', style: { font: '700 11px/1 var(--font-body)', letterSpacing: '.16em', opacity: 0.85, marginBottom: 12 } }),
    h('div', { text: 'GUTEN MORGEN, ANNA.', style: { font: '700 26px/1.02 var(--font-display)', letterSpacing: '-.005em' } }),
    h('div', { text: 'Heute: 5 Termine, 2 Aufgaben', style: { font: '500 14px/1 var(--font-body)', marginTop: 12, opacity: 0.92 } })));
  // Karten
  const card = (top, ico, col, t1, t2) => h('div', { class: 'abs', style: { left: 16, top, right: 16, height: 80, borderRadius: 18, background: '#fff', boxShadow: '0 6px 16px rgba(31,37,50,.1)', display: 'flex', alignItems: 'center', gap: 14, padding: '0 16px' } },
    h('span', { style: { width: 46, height: 46, borderRadius: 14, background: col, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }, html: icon(ico, 24, '#fff', 2.2) }),
    h('div', {}, h('div', { text: t1, style: { font: '700 16px/1.15 var(--font-body)' } }), h('div', { text: t2, style: { font: '500 13px/1.3 var(--font-body)', color: '#6B7385', marginTop: 4 } })));
  sc.push(card(330, 'calendar', '#E67E22', '10:00 · Teamtermin', 'Raum 2 · 60 Min.'));
  sc.push(card(420, 'file-text', '#2F6FDE', 'Angebot Hartmann', 'Karte fällig · Deck'));
  // App-Reihe
  const apps = [['folder', '#36A9E8', 'Dateien'], ['calendar', '#E5565B', 'Kalender'], ['message-square', '#7B6CF6', 'Talk'], ['users', '#1E9E6A', 'Kontakte']];
  apps.forEach(([ico, col, lbl], k) => sc.push(h('div', { class: 'abs', style: { left: 16 + k * 72, top: 512, width: 64, textAlign: 'center', font: '600 11px/1 var(--font-body)', color: '#4A5266' } },
    h('div', { style: { width: 56, height: 56, margin: '0 auto 7px', borderRadius: 16, background: col, display: 'flex', alignItems: 'center', justifyContent: 'center' }, html: icon(ico, 26, '#fff', 2.2) }), lbl)));
  // untere Leiste
  sc.push(h('div', { class: 'abs', style: { left: 0, right: 0, bottom: 0, height: 64, background: '#fff', borderTop: '1.5px solid #E6E8EE', display: 'flex', justifyContent: 'space-around', alignItems: 'center' } },
    ...[['house', '#E67E22'], ['folder', '#8A92A5'], ['message-square', '#8A92A5'], ['menu', '#8A92A5']].map(([ico, col]) => h('span', { html: icon(ico, 26, col, 2.2) }))));
  return sc;
};

/** Baut Laptop-Rahmen (Bezel + Boden), Browser-Leiste mit EINEM Tab und ein Handy – alles in Fensterkoordinaten.
 *  Rückgabe: { back (hinter dem Fenster), front (Leiste), phone (Handy), pill ("1 TAB"), tab } – Einblendung steuert die Szene. */
export function buildDevices(E, cam, beforeEl) {
  installDevices(E);
  const { h, icon } = E;
  const bezel = h('div', { class: 'dv-bezel' }), base = h('div', { class: 'dv-base' });
  const back = h('div', { class: 'abs', style: { left: 0, top: 0, width: 0, height: 0 } }, bezel, base);
  const tab = h('div', { class: 'dv-tab' }, h('span', { class: 'fav', html: E.iconSVG({ rx: 70 }) }), h('span', { text: 'Startseite' }), h('span', { class: 'x', html: icon('x', 18, '#8A92A5', 2.4) }));
  const pill = h('div', { class: 'dv-one', text: '1 TAB' });
  const chrome = h('div', { class: 'dv-chrome' },
    h('div', { class: 'dv-dots' }, h('i'), h('i'), h('i')), tab, h('div', { class: 'dv-plus', html: icon('plus', 18, '#7D8598', 2.4) }), pill,
    h('div', { class: 'dv-url' }, h('span', { style: { transform: 'scaleX(-1)', display: 'flex' }, html: icon('chevron-right', 22, '#7D8598', 2.2) }), h('span', { html: icon('chevron-right', 22, '#B6BCC9', 2.2) }), h('span', { html: icon('refresh-cw', 19, '#7D8598', 2.2) }), h('span', { class: 'home', html: icon('house', 24, '#4B5468', 2.3), style: { display: 'flex' } }),
      h('div', { class: 'pill' }, h('span', { html: icon('lock', 17, '#5E6678', 2.3) }), 'cloud.musterfirma.de'), h('span', { style: { marginLeft: 'auto' }, html: avatarHTML('anna', 32) }), h('span', { html: icon('ellipsis', 24, '#7D8598', 2.2) })));
  const cols = ['#E5565B', '#7B6CF6', '#36A9E8', '#3FBF8A', '#8E97AE', '#D1497A'];
  const tabs36 = Array.from({ length: 36 }, (_, k) => { const el = h('div', { class: 'abs', style: { top: 8, height: 40, width: 33, borderRadius: '10px 10px 0 0', background: '#fff', boxShadow: '0 -1px 0 #D5D9E3 inset', left: 112 + k * 35 } }, h('div', { class: 'abs', style: { left: 7, top: 12, width: 14, height: 14, borderRadius: 4, background: cols[k % 6] } }), h('div', { class: 'abs', style: { left: 7, top: 31, width: 19, height: 4, borderRadius: 2, background: 'rgba(31,37,50,.22)' } })); return el; });
  tabs36.forEach((el) => chrome.insertBefore(el, tab));
  const ph = phone(E); ph.el.classList.add('dv-ph');
  HOME(E, h, icon).forEach((n) => ph.screen.append(n));
  ph.screen.style.background = '#FAF6EF';
  const phoneOff = h('div', { class: 'abs', style: { inset: 0, background: '#0B0F18', zIndex: 9 } }); ph.screen.append(phoneOff);       // Handy ist zuerst dunkel
  Object.assign(ph.el.style, { left: '-540px', top: '296px', zIndex: 70 });                                                           // steht links neben dem Laptop auf dem Tisch
  if (beforeEl) cam.insertBefore(back, beforeEl); else cam.append(back);
  cam.append(chrome, ph.el);
  return { back, bezel, base, chrome, tab, pill, tabs36, phone: ph.el, phoneScreen: ph.screen, phoneOff, homeX: 138, homeY: -24 };
}
