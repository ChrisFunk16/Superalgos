// ============================================================
// Linkado-Oberfläche für den Film – nachgebaut nach echten Screenshots der Cloud
// (Startseite „Ihr Tag“, Apps und Pakete, Support, Rail mit gefüllten Icons).
// Native Fenstergröße 1480×900 px; die Kamera skaliert/verschiebt das Fenster.
// Die Instanz im Original ist frisch und leer – deshalb sind Demo-Inhalte ergänzt
// (Termine, Dateien, Anfragen). Alle Namen/Daten sind erfunden.
// Jede Textstelle trägt die Klasse "t", damit die Rohfassung (".raw" = Nextcloud-
// Standard als graues Wireframe) sie zu Balken machen kann.
// ============================================================
export const WIN = { w: 1480, h: 900, top: 56, rail: 84 };
const MAIN = { w: WIN.w - WIN.rail, h: WIN.h - WIN.top };   // 1396 × 844

/* Wichtige Koordinaten im Fensterraum (für Cursor, Flüge, Kamera) */
export const LAY = {
  rail: { x: 42, y: (i) => WIN.top + 8 + i * 77 + 36, support: [42, WIN.top + MAIN.h - 8 - 36] },
  home: { search: [WIN.rail + 64, WIN.top + 184, 520, 50] },
  menu: { grid: [33, 28], input: [WIN.rail + 160, WIN.top + 85], row: (i) => [WIN.rail + 150, WIN.top + 150 + i * 56] },
  apps: {
    x0: WIN.rail + 232, scroll: 590, pk: 778,
    card: (k) => [WIN.rail + 232 + 36 + k * 302, WIN.top + 476, 276, 236],
    btn: (k) => [WIN.rail + 232 + 36 + k * 302 + 22 + 72, WIN.top + 476 + 236 - 22 - 20],
    toggle: (i) => [WIN.rail + 232 + 310 + 438, WIN.top + 778 + 130 + i * 76 + 38 - 590],
  },
  support: { input: [WIN.rail + 236 + 36 + 12 + 190, WIN.top + 326] },
};

let cssDone = false;
export function installUiCss(E) {
  if (cssDone) return; cssDone = true;
  const R = WIN.rail;
  E.style(`
  .ui-win { isolation:isolate; position:absolute; left:0; top:0; width:${WIN.w}px; height:${WIN.h}px; border-radius:20px; background:#ECE7E3; overflow:hidden;
            box-shadow:0 2px 6px rgba(31,37,50,.10), 0 40px 90px rgba(31,37,50,.28); transform-origin:0 0; font-family:var(--font-body); color:var(--navy); }
  .ui-win * { box-sizing:border-box; }
  .ui-win svg { display:block; }
  .ui-top { position:absolute; left:0; top:0; right:0; height:${WIN.top}px; background:#1E2430; z-index:5; }
  .ui-gridtile { position:absolute; left:10px; top:5px; width:46px; height:46px; border-radius:9px; background:rgba(255,255,255,.10); display:grid; grid-template-columns:repeat(3,5px); gap:3.5px; align-content:center; justify-content:center; }
  .ui-gridtile i { width:5px; height:5px; background:#fff; border-radius:1px; }
  .ui-lbox { position:absolute; left:73px; top:11px; width:34px; height:34px; border-radius:8px; background:var(--orange); display:flex; align-items:center; justify-content:center; }
  .ui-lbox svg { width:34px; height:34px; }
  .ui-tir { position:absolute; right:14px; top:0; height:${WIN.top}px; display:flex; align-items:center; gap:12px; }
  .ui-ti { position:relative; width:32px; height:32px; display:flex; align-items:center; justify-content:center; color:rgba(255,255,255,.86); }
  .ui-ti .dot { position:absolute; right:5px; top:4px; width:8px; height:8px; border-radius:50%; background:#EF4B3F; }
  .ui-avatar { position:relative; width:36px; height:36px; border-radius:50%; background:#fff; color:#7A4FD0; font:700 16px/1 var(--font-body); display:flex; align-items:center; justify-content:center; margin-left:4px; }
  .ui-avatar::after { content:""; position:absolute; right:-2px; bottom:-2px; width:12px; height:12px; border-radius:50%; background:#3FBF8A; border:2px solid #1E2430; }
  .ui-rail { position:absolute; left:0; top:${WIN.top}px; bottom:0; width:${R}px; background:#1E2430; z-index:4; --rc:#1E2430; }
  .ui-ri { position:absolute; left:10px; width:${R - 20}px; height:72px; border-radius:12px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:7px;
           color:#fff; font:700 11.5px/1 var(--font-body); letter-spacing:.005em; }
  .ui-ri.on { background:#F1ECE7; color:#1E2430; --rc:#F1ECE7; }
  .ui-ri.on::before { content:""; position:absolute; left:-10px; top:26px; width:6px; height:24px; background:var(--orange); transform:skewX(-14deg); border-radius:1px; }
  .ui-rdiv { position:absolute; left:10px; width:${R - 20}px; height:1px; background:rgba(255,255,255,.18); }
  .ui-main { position:absolute; left:${R}px; top:${WIN.top}px; width:${MAIN.w}px; height:${MAIN.h}px; background:#ECE7E3; overflow:hidden; z-index:3; }
  .ui-view { position:absolute; inset:0; }
  .ui-abs { position:absolute; }
  .ui-tick { display:inline-block; width:5px; height:15px; background:var(--orange); transform:skewX(-14deg); flex:none; border-radius:1px; }
  .ui-cap { display:flex; align-items:center; gap:9px; font:700 12px/1 var(--font-body); letter-spacing:.12em; color:#2A2F3A; text-transform:uppercase; }

  /* --- Startseite --- */
  .ui-hero { position:absolute; left:0; top:0; width:${MAIN.w}px; height:300px; background:var(--orange-deep); overflow:hidden; }
  .ui-hero::before { content:""; position:absolute; inset:0; background:repeating-linear-gradient(100deg, transparent 0 21px, rgba(60,25,0,.075) 21px 22.5px); }
  .ui-hin { position:absolute; left:64px; top:30px; color:#171A22; }
  .ui-date { font:600 13px/1 var(--font-body); letter-spacing:.1em; display:inline-block; }
  .ui-greet { margin:12px 0 0; font-size:50px; line-height:1; font-weight:700; display:block; letter-spacing:-.01em; }
  .ui-sub1 { margin-top:14px; font:700 17px/1.3 var(--font-body); display:block; }
  .ui-sub2 { margin-top:4px; font:500 16.5px/1.3 var(--font-body); display:block; }
  .ui-row { position:absolute; left:64px; top:184px; display:flex; align-items:center; gap:12px; }
  .ui-search { width:520px; height:50px; background:#fff; border-radius:9px; display:flex; align-items:center; gap:13px; padding:0 14px 0 16px; font:500 16px/1 var(--font-body); color:#6B6F78; box-shadow:0 2px 0 rgba(0,0,0,.10); position:relative; }
  .ui-kbd { margin-left:auto; border:1.5px solid #D2D2D2; border-radius:6px; padding:3px 9px; font:600 13px/1 var(--font-body); color:#8A8A8A; }
  .ui-b { height:46px; border-radius:9px; border:1.5px solid rgba(23,26,34,.7); display:flex; align-items:center; gap:10px; padding:0 16px; font:700 15px/1 var(--font-body); color:#171A22; }
  .ui-bigdate { position:absolute; right:64px; top:36px; display:flex; align-items:flex-start; gap:12px; color:#171A22; }
  .ui-bigdate .d { font:800 150px/1 var(--font-display); display:block; letter-spacing:-.03em; }
  .ui-bigdate .m { font:700 14px/1.28 var(--font-body); letter-spacing:.08em; margin-top:54px; display:block; }
  .ui-day { position:absolute; left:64px; top:252px; width:1268px; height:214px; border-radius:12px; background:#fff; box-shadow:0 1px 2px rgba(31,37,50,.06), 0 10px 26px rgba(31,37,50,.10); }
  .ui-dayh { position:absolute; left:20px; top:16px; right:20px; height:36px; display:flex; align-items:center; gap:12px; font:700 14px/1 var(--font-body); }
  .ui-dayh .dt { color:#171A22; }
  .ui-ctl { height:34px; border:1px solid #E0DAD3; border-radius:8px; display:flex; align-items:center; padding:0 14px; font:700 13px/1 var(--font-body); color:#171A22; gap:8px; background:#fff; }
  .ui-seg { display:flex; height:34px; border:1px solid #E0DAD3; border-radius:8px; overflow:hidden; font:600 13px/1 var(--font-body); color:#6B6F78; }
  .ui-seg span { display:flex; align-items:center; padding:0 14px; } .ui-seg span.on { background:#F1ECE7; color:#171A22; font-weight:700; }
  .ui-band { position:absolute; left:20px; top:62px; width:1224px; height:140px; overflow:hidden; background:repeating-linear-gradient(100deg, rgba(31,37,50,.07) 0 1.3px, transparent 1.3px 8px); }
  .ui-hr { position:absolute; top:0; height:140px; border-left:1px solid #EFEAE3; font:700 11px/1 'Inter',monospace; color:#2A2F3A; padding:3px 0 0 6px; letter-spacing:.04em; }
  .ui-ev { position:absolute; height:38px; background:#F7DDBF; padding:0 18px 0 16px; display:flex; align-items:center; gap:9px; font:600 12.5px/1 var(--font-body); color:#171A22; white-space:nowrap; clip-path:polygon(9px 0,100% 0,calc(100% - 9px) 100%,0 100%); }
  .ui-ev::before { content:""; position:absolute; left:0; top:0; bottom:0; width:6px; background:var(--orange); }
  .ui-ev b { font-weight:800; }
  .ui-ev small { color:#6B5A48; font:500 12px/1 var(--font-body); }
  .ui-now { position:absolute; top:-4px; width:5px; height:150px; background:var(--orange); transform:skewX(-14deg); }
  .ui-now b { position:absolute; left:6px; bottom:6px; transform:skewX(14deg); font:800 11px/1 var(--font-body); letter-spacing:.08em; color:#8A4A10; white-space:nowrap; }
  .ui-sc { position:absolute; right:3px; top:2px; width:6px; height:130px; border-radius:3px; background:#8C8F94; opacity:.85; }
  .ui-tmpl { position:absolute; left:64px; top:486px; width:1268px; height:34px; display:flex; align-items:center; font:500 13px/1 var(--font-body); color:#5E6168; }
  .ui-adj { margin-left:auto; height:34px; border-radius:8px; background:#fff; display:flex; align-items:center; gap:9px; padding:0 16px; font:700 13px/1 var(--font-body); color:#171A22; }
  .ui-sec { position:absolute; }
  .ui-wcard { position:absolute; background:#fff; border-radius:10px; box-shadow:0 1px 2px rgba(31,37,50,.05); }
  .ui-nrow { display:flex; align-items:center; gap:16px; padding:0 20px; height:62px; font:700 15px/1.25 var(--font-body); color:#171A22; }
  .ui-nrow + .ui-nrow { border-top:1px solid #F0EBE5; }
  .ui-nrow small { display:block; font:500 12.5px/1.3 var(--font-body); color:#6B6F78; margin-top:2px; }
  .ui-slant { width:46px; height:34px; background:#F7DDBF; clip-path:polygon(8px 0,100% 0,calc(100% - 8px) 100%,0 100%); display:flex; align-items:center; justify-content:center; font:800 12.5px/1 var(--font-body); color:#8A4A10; flex:none; }
  .ui-pill { margin-left:auto; padding:6px 12px; border-radius:99px; background:#FBE8D3; color:#8A4A10; font:700 12px/1 var(--font-body); white-space:nowrap; }
  .ui-fcard { position:absolute; height:64px; background:#fff; border-radius:10px; display:flex; align-items:center; gap:12px; padding:0 14px; box-shadow:0 1px 2px rgba(31,37,50,.05); }
  .ui-fcard .ic { width:34px; height:34px; border-radius:8px; background:#F1ECE7; display:flex; align-items:center; justify-content:center; flex:none; color:#4A4F5C; }
  .ui-fcard b { display:block; font:700 14px/1.2 var(--font-body); color:#171A22; white-space:nowrap; }
  .ui-fcard small { display:block; font:500 12px/1.3 var(--font-body); color:#6B6F78; margin-top:3px; white-space:nowrap; }
  .ui-res { position:absolute; width:640px; background:#fff; border-radius:12px; box-shadow:0 2px 6px rgba(31,37,50,.10), 0 30px 70px rgba(31,37,50,.28); padding:8px; z-index:8; }
  .ui-rg { font:700 11px/1 var(--font-body); letter-spacing:.12em; color:#8A867D; padding:10px 12px 6px; display:block; }
  .ui-rr { height:56px; border-radius:9px; display:flex; align-items:center; gap:14px; padding:0 12px; font:600 16px/1.2 var(--font-body); color:#171A22; }
  .ui-rr.on { background:#FCEFDD; }
  .ui-rr .ic { width:36px; height:36px; border-radius:9px; background:#F1ECE7; display:flex; align-items:center; justify-content:center; color:#171A22; flex:none; }
  .ui-rr .ic.o { background:var(--orange); color:#fff; }
  .ui-rr .ic.ai { background:linear-gradient(135deg,#E67E22,#C76A19); color:#fff; }
  .ui-rr small { display:block; font:500 13px/1.3 var(--font-body); color:#6F6C66; margin-top:2px; }
  .ui-rr .go { margin-left:auto; color:#B5AFA2; }
  mark.ui-m { background:transparent; color:#B0560F; font-weight:800; }

  /* --- Apps und Pakete --- */
  .ui-amenu { position:absolute; left:0; top:0; width:232px; height:100%; background:#D3D5D7; padding:18px 0 0; }
  .ui-amh { font:700 15px/1 var(--font-body); color:#171A22; padding:10px 20px 14px 36px; }
  .ui-ami { margin:0 10px; height:35px; border-radius:6px; display:flex; align-items:center; gap:11px; padding:0 6px 0 11px; font:500 13.3px/1 var(--font-body); white-space:nowrap; color:#22262F; }
  .ui-ami.on { background:var(--orange-deep); color:#fff; font-weight:600; }
  .ui-areg { position:absolute; left:232px; top:0; right:0; bottom:0; background:#FBF9F4; overflow:hidden; }
  .ui-ascroll { position:absolute; left:0; top:0; width:${MAIN.w - 232}px; }
  .ui-ahead { position:absolute; left:0; top:0; width:100%; height:236px; background:#F5EDDF; overflow:hidden; }
  .ui-ahead::after { content:""; position:absolute; right:130px; top:-20px; width:150px; height:230px; background:rgba(231,214,186,.55); transform:skewX(-20deg); }
  .ui-ahead::before { content:""; position:absolute; right:70px; top:-20px; width:44px; height:230px; background:rgba(231,214,186,.35); transform:skewX(-20deg); }
  .ui-atitle { margin-top:12px; font:700 34px/1.1 var(--font-display); display:block; letter-spacing:-.005em; color:#171A22; }
  .ui-adesc { margin-top:14px; font:500 14.5px/1.5 var(--font-body); color:#5E6168; display:block; width:540px; }
  .ui-tabs { position:absolute; left:36px; top:190px; display:flex; gap:26px; font:600 15.5px/1 var(--font-body); color:#5E6168; }
  .ui-tabs span { padding-bottom:13px; position:relative; } .ui-tabs span.on { color:#171A22; font-weight:700; }
  .ui-tabs span.on::after { content:""; position:absolute; left:0; right:0; bottom:-1px; height:3px; background:var(--orange); }
  .ui-astat { position:absolute; left:0; top:236px; width:100%; height:48px; border-top:1px solid #E7DECF; border-bottom:1px solid #EAE3D6; display:flex; align-items:center; gap:26px; padding-left:36px; font:500 13px/1 var(--font-body); color:#4A4F5C; }
  .ui-astat b { font:800 17px/1 var(--font-body); color:#171A22; margin-right:6px; display:inline-block; min-width:12px; }
  .ui-field { position:absolute; left:36px; width:560px; }
  .ui-field label { display:block; font:700 12.5px/1 var(--font-body); color:#171A22; margin-bottom:9px; }
  .ui-input { height:44px; border:1px solid #D9D2C6; border-radius:7px; background:#fff; display:flex; align-items:center; padding:0 14px; font:500 15px/1 var(--font-body); color:#6B6F78; }
  .ui-chips { position:absolute; display:flex; gap:9px; }
  .ui-chip { height:38px; border-radius:19px; padding:0 17px; display:flex; align-items:center; font:700 13.5px/1 var(--font-body); background:#fff; border:1px solid #D9D2C6; color:#171A22; }
  .ui-chip.on { background:#1E2430; color:#fff; border-color:#1E2430; }
  .ui-spot { position:absolute; width:276px; height:236px; border-radius:12px; padding:20px 22px; border:1px solid rgba(120,90,50,.18); }
  .ui-spot .ey { font:700 11px/1 var(--font-body); letter-spacing:.1em; color:#3A3F4A; }
  .ui-spot h5 { margin:12px 0 0; font:700 19px/1.15 var(--font-display); color:#171A22; letter-spacing:-.005em; }
  .ui-spot p { margin:7px 0 0; font:500 13px/1.45 var(--font-body); color:#4A4F5C; }
  .ui-st { position:absolute; left:22px; top:148px; display:flex; align-items:center; gap:9px; font:500 12px/1 var(--font-body); color:#4A4F5C; }
  .ui-badge { padding:5px 10px; border-radius:99px; background:#D9ECE6; color:#1F6F5A; font:700 11.5px/1 var(--font-body); }
  .ui-badge.n { background:rgba(31,37,50,.08); color:#4A4F5C; }
  .ui-more { position:absolute; left:22px; bottom:22px; height:36px; display:flex; align-items:center; font:700 14px/1 var(--font-body); color:#171A22; }
  .ui-add { position:absolute; left:22px; bottom:22px; width:144px; height:40px; border-radius:9px; background:var(--orange); color:#fff; display:flex; align-items:center; justify-content:center; gap:8px; font:700 14.5px/1 var(--font-body); }
  .ui-plist { position:absolute; left:0; width:280px; background:#EFE5D8; border-top:1px solid #E1D4C0; border-right:1px solid #E1D4C0; }
  .ui-pi { height:78px; padding:15px 18px 0 22px; border-bottom:1px solid #E1D4C0; position:relative; }
  .ui-pi b { display:block; font:700 15.5px/1.2 var(--font-body); color:#171A22; }
  .ui-pi small { display:block; font:500 12.5px/1 var(--font-body); color:#5E6168; margin-top:9px; }
  .ui-pi .badge { position:absolute; right:16px; bottom:14px; }
  .ui-pi.on { background:#fff; } .ui-pi.on::before { content:""; position:absolute; left:0; top:0; bottom:0; width:4px; background:var(--orange); }
  .ui-pdet { position:absolute; left:310px; }
  .ui-pdet .k { font:500 12.5px/1 var(--font-body); color:#5E6168; }
  .ui-pdet h6 { margin:10px 0 0; font:700 23px/1.1 var(--font-display); color:#171A22; }
  .ui-pbox { margin-top:14px; width:570px; border-radius:9px; background:#F5ECE0; border:1px solid #E6D9C6; padding:14px 16px; font:500 13px/1.5 var(--font-body); color:#4A4F5C; }
  .ui-prow { position:absolute; left:0; width:570px; height:76px; border-bottom:1px solid #E6D9C6; display:flex; align-items:center; gap:16px; }
  .ui-prow .ini { width:42px; height:42px; border-radius:9px; background:#E3E9EE; display:flex; align-items:center; justify-content:center; font:800 13.5px/1 var(--font-body); color:#1E2430; flex:none; }
  .ui-prow b { display:block; font:700 15px/1.2 var(--font-body); color:#171A22; }
  .ui-prow small { display:block; font:500 12.5px/1.3 var(--font-body); color:#5E6168; margin-top:4px; }
  .ui-prow .im { font:500 11.5px/1 var(--font-body); color:#6B6F78; margin-top:5px; display:block; }
  .ui-tg { margin-left:auto; width:44px; height:25px; border-radius:13px; background:#CBC7BF; position:relative; flex:none; }
  .ui-tg i { position:absolute; top:3px; left:3px; width:19px; height:19px; border-radius:50%; background:#1E2430; }
  .ui-prow .on { width:34px; font:500 12px/1 var(--font-body); color:#2A2F3A; }
  .ui-prow .hl { font:700 12.5px/1 var(--font-body); color:#9A4B0C; text-decoration:underline; margin-left:12px; }

  /* --- Support --- */
  .ui-smenu { position:absolute; left:0; top:0; width:236px; height:100%; background:#F7F3EE; border-right:1px solid #E8E2DA; padding:30px 16px 0; }
  .ui-sm1 { font:700 21px/1 var(--font-display); color:#171A22; display:flex; align-items:center; gap:9px; margin-left:4px; }
  .ui-sm2 { font:500 12.5px/1 var(--font-body); color:#6B6F78; margin:9px 0 0 4px; display:block; }
  .ui-sbtn { margin-top:22px; height:44px; border-radius:9px; background:#fff; border:1px solid #E4DED6; display:flex; align-items:center; gap:11px; padding:0 14px; font:600 14px/1 var(--font-body); color:#171A22; }
  .ui-sni { margin-top:6px; height:44px; border-radius:9px; display:flex; align-items:center; gap:12px; padding:0 14px; font:500 14px/1 var(--font-body); color:#4A4F5C; position:relative; }
  .ui-sni.on { background:#FCEBDD; color:#171A22; font-weight:700; } .ui-sni.on::before { content:""; position:absolute; left:0; top:0; bottom:0; width:3px; background:var(--orange); border-radius:2px; }
  .ui-slink { margin:22px 0 0 4px; font:500 12.5px/1 var(--font-body); color:#171A22; text-decoration:underline; display:inline-block; }
  .ui-sreg { position:absolute; left:236px; top:0; right:0; bottom:0; background:#FDFCFA; overflow:hidden; }
  .ui-sc0 { position:absolute; left:36px; top:0; width:880px; height:100%; }
  .ui-h1 { margin:0; position:absolute; left:0; top:54px; font:700 29px/1.1 var(--font-display); text-transform:uppercase; color:#171A22; letter-spacing:-.005em; white-space:nowrap; }
  .ui-h2 { font:700 21px/1.1 var(--font-display); text-transform:uppercase; color:#171A22; letter-spacing:-.003em; }
  .ui-orange { position:absolute; right:0; top:46px; height:46px; padding:0 20px; border-radius:9px; background:var(--orange); color:#fff; display:flex; align-items:center; gap:10px; font:700 14.5px/1 var(--font-body); box-shadow:0 6px 16px rgba(230,126,34,.30); }
  .ui-banner { position:absolute; left:0; top:132px; width:880px; height:82px; border-radius:11px; background:#E9EEF1; padding:0 18px 0 24px; display:flex; align-items:center; gap:16px; overflow:hidden; }
  .ui-banner::before { content:""; position:absolute; left:0; top:0; bottom:0; width:6px; background:var(--orange); transform:skewX(-8deg); transform-origin:0 0; }
  .ui-banner .ic { width:36px; height:36px; border-radius:8px; background:#fff; display:flex; align-items:center; justify-content:center; flex:none; }
  .ui-banner .bt { font:700 17.5px/1.15 var(--font-display); text-transform:uppercase; color:#171A22; }
  .ui-banner small { display:block; font:500 12.5px/1.3 var(--font-body); color:#2A2F3A; margin-top:3px; }
  .ui-banner .go { margin-left:auto; height:40px; border-radius:8px; background:#fff; display:flex; align-items:center; gap:10px; padding:0 14px; font:700 12.5px/1 var(--font-body); color:#171A22; white-space:nowrap; flex:none; }
  .ui-scard { position:absolute; left:0; top:268px; width:556px; height:92px; border-radius:10px; background:#FBF8F2; border:1px solid #E9E3DA; padding:12px 12px 0; }
  .ui-scard label { display:block; font:500 12px/1 var(--font-body); color:#5E6168; margin-bottom:9px; }
  .ui-sin { display:flex; gap:9px; }
  .ui-sin .inp { flex:1; height:44px; border-radius:8px; border:1px solid #E4DED6; background:#fff; display:flex; align-items:center; padding:0 14px; font:500 15px/1 var(--font-body); color:#7A7770; position:relative; }
  .ui-sin .go { height:44px; padding:0 18px; border-radius:8px; background:#fff; border:1px solid #E4DED6; display:flex; align-items:center; font:700 14px/1 var(--font-body); color:#171A22; }
  .ui-caret { display:inline-block; width:2px; height:22px; background:var(--orange); margin-left:2px; border-radius:2px; }
  .ui-schips { position:absolute; left:0; top:374px; display:flex; gap:9px; }
  .ui-sch { height:38px; border-radius:19px; padding:0 17px; display:flex; align-items:center; font:500 13.5px/1 var(--font-body); background:#fff; border:1px solid #E4DED6; color:#171A22; }
  .ui-zone { position:absolute; left:0; top:430px; width:556px; height:200px; }
  .ui-art { position:absolute; left:0; width:556px; height:56px; border-radius:10px; background:#fff; border:1px solid #EEE8DF; display:flex; align-items:center; gap:14px; padding:0 14px; font:600 14.5px/1.2 var(--font-body); color:#171A22; }
  .ui-art .ic { width:32px; height:32px; border-radius:8px; background:#F1ECE7; display:flex; align-items:center; justify-content:center; flex:none; }
  .ui-art small { margin-left:auto; font:500 12px/1 var(--font-body); color:#7A7770; }
  .ui-ai { position:absolute; left:0; top:0; width:556px; border-radius:12px; background:linear-gradient(180deg,#FFF6EA,#FFF1E0); border:1px solid #F1D3AE; padding:16px 20px 14px; }
  .ui-aih { display:flex; align-items:center; gap:11px; font:700 15px/1 var(--font-body); color:#171A22; }
  .ui-aih .ic { width:30px; height:30px; border-radius:8px; background:linear-gradient(135deg,#E67E22,#C76A19); display:flex; align-items:center; justify-content:center; color:#fff; }
  .ui-aih small { margin-left:auto; font:600 11.5px/1 var(--font-body); color:#9A6A3A; }
  .ui-step { display:flex; align-items:center; gap:14px; height:38px; font:600 15px/1.2 var(--font-body); color:#171A22; }
  .ui-dot { position:relative; width:26px; height:26px; border-radius:50%; border:2px solid #E2C9A8; display:flex; align-items:center; justify-content:center; font:700 12.5px/1 var(--font-body); color:#B08A5E; flex:none; background:#fff; }
  .ui-dot .ck { position:absolute; inset:-2px; border-radius:50%; background:var(--orange); display:flex; align-items:center; justify-content:center; }
  .ui-aif { margin-top:6px; font:500 12px/1.3 var(--font-body); color:#8A6A44; display:flex; align-items:center; gap:7px; }
  .ui-reqh { position:absolute; left:0; top:650px; width:556px; display:flex; align-items:baseline; justify-content:space-between; }
  .ui-reqh .lk { font:500 12.5px/1 var(--font-body); color:#171A22; text-decoration:underline; }
  .ui-req { position:absolute; left:0; width:556px; border-radius:10px; background:#fff; border:1px solid #EEE8DF; padding:0 16px; display:flex; align-items:center; gap:14px; overflow:hidden; }
  .ui-req .ic { width:34px; height:34px; border-radius:9px; background:#F1ECE7; display:flex; align-items:center; justify-content:center; flex:none; }
  .ui-req b { display:block; font:700 14.5px/1.2 var(--font-body); color:#171A22; }
  .ui-req small { display:block; font:500 12.5px/1.35 var(--font-body); color:#6B6F78; margin-top:3px; }
  .ui-rst { margin-left:auto; padding:6px 11px; border-radius:99px; background:rgba(31,37,50,.08); color:#4A4F5C; font:700 11.5px/1 var(--font-body); white-space:nowrap; flex:none; }
  .ui-rst.g { background:#D9ECE6; color:#1F6F5A; } .ui-rst.o { background:#FBE8D3; color:#8A4A10; }
  .ui-rcard { position:absolute; left:580px; width:300px; border-radius:12px; background:#EAEEF1; padding:18px 20px; }
  .ui-rcard h6 { margin:0; font:700 17px/1.2 var(--font-display); color:#171A22; display:flex; align-items:center; gap:9px; }
  .ui-rcard p { margin:10px 0 0; font:500 12.5px/1.55 var(--font-body); color:#2A2F3A; }
  .ui-rcard p.g { color:#6B6F78; }
  .ui-rcard .lk { margin-top:12px; font:700 12.5px/1 var(--font-body); color:#171A22; display:flex; align-items:center; gap:8px; }
  .ui-rcard u { font:500 12.5px/1 var(--font-body); color:#171A22; }

  /* --- Großes Menü (Seitenleiste über dem Raster-Symbol) --- */
  .ui-gridtile.on { background:rgba(255,255,255,.22); }
  .ui-dim { position:absolute; inset:0; background:rgba(18,22,34,.46); z-index:11; }
  .ui-menu { position:absolute; left:0; top:0; bottom:0; width:332px; background:#fff; z-index:12; box-shadow:18px 0 60px rgba(0,0,0,.34); overflow:hidden; font-family:var(--font-body); color:#171A22; }
  .ui-mhead { position:absolute; left:0; top:0; right:0; height:120px; background:#1E2430; overflow:hidden; }
  .ui-mhead::before { content:""; position:absolute; inset:0; background:repeating-linear-gradient(100deg, transparent 0 17px, rgba(255,255,255,.055) 17px 18.5px); }
  .ui-mlogo { position:absolute; left:16px; top:12px; font:700 40px/1 var(--font-display); color:#fff; letter-spacing:-.01em; }
  .ui-mx { position:absolute; right:18px; top:22px; color:#fff; opacity:.9; }
  .ui-msearch { position:absolute; left:12px; right:12px; top:64px; height:46px; border-radius:9px; background:#fff; display:flex; align-items:center; gap:11px; padding:0 10px 0 13px; font:500 15px/1 var(--font-body); color:#6B6F78; box-shadow:0 0 0 3px rgba(255,255,255,.28); }
  .ui-msearch .kbd { margin-left:auto; border:1.5px solid #D2D2D2; border-radius:6px; padding:3px 7px; font:600 11.5px/1 var(--font-body); color:#8A8A8A; white-space:nowrap; }
  .ui-mbody { position:absolute; left:0; right:0; top:120px; bottom:50px; overflow:hidden; }
  .ui-mcap { display:flex; align-items:center; gap:9px; padding:0 18px; height:30px; margin-top:8px; font:700 12px/1 var(--font-body); letter-spacing:.12em; color:#2A2F3A; }
  .ui-favs { display:flex; gap:10px; padding:0 12px 0 14px; }
  .ui-fav { width:96px; height:98px; border-radius:10px; border:1px solid #ECE5DC; padding:12px 12px 0; background:#fff; }
  .ui-fav .ic { width:42px; height:42px; border-radius:9px; background:#FBEBDD; display:flex; align-items:center; justify-content:center; color:#171A22; margin-bottom:14px; }
  .ui-fav b { font:700 13.5px/1 var(--font-body); }
  .ui-mhint { padding:10px 18px 4px; font:500 11.5px/1.45 var(--font-body); color:#5E6168; } .ui-mhint u { color:#171A22; }
  .ui-mi { position:relative; height:42px; margin:0 10px 0 12px; border-radius:8px; display:flex; align-items:center; gap:12px; padding:0 10px 0 12px; font:500 15px/1 var(--font-body); color:#171A22; white-space:nowrap; }
  .ui-mi small { font:500 11.5px/1 var(--font-body); color:#6B6F78; margin-left:2px; }
  .ui-mi.on { background:#FCEBDD; } .ui-mi.on::before { content:""; position:absolute; left:-8px; top:11px; width:5px; height:20px; background:var(--orange); transform:skewX(-14deg); }
  .ui-mfoot { position:absolute; left:0; right:0; bottom:0; height:50px; background:#fff; border-top:1px solid #EEE8DF; display:flex; align-items:center; justify-content:space-between; padding:0 18px; font:500 12.5px/1 var(--font-body); color:#2A2F3A; }
  .ui-mfoot span { display:inline-flex; align-items:center; gap:8px; }
  .ui-mres { position:absolute; left:0; right:0; top:0; bottom:0; background:#fff; padding:6px 10px; }
  .ui-mrr { height:56px; border-radius:9px; display:flex; align-items:center; gap:12px; padding:0 10px; font:600 14.5px/1.2 var(--font-body); color:#171A22; }
  .ui-mrr.on { background:#FCEFDD; }
  .ui-mrr .ic { width:34px; height:34px; border-radius:8px; background:#F1ECE7; display:flex; align-items:center; justify-content:center; flex:none; color:#171A22; }
  .ui-mrr .ic.ai { background:linear-gradient(135deg,#E67E22,#C76A19); color:#fff; }
  .ui-mrr small { display:block; font:500 12px/1.3 var(--font-body); color:#6F6C66; margin-top:2px; white-space:nowrap; }
  .ui-mrr .tx { overflow:hidden; }

  /* --- Cursor & Klick --- */
  .ui-cur { position:absolute; left:0; top:0; width:34px; height:34px; z-index:50; pointer-events:none; filter:drop-shadow(0 4px 6px rgba(0,0,0,.35)); }
  .ui-rip { position:absolute; width:60px; height:60px; margin:-30px 0 0 -30px; border-radius:50%; border:3px solid var(--orange); z-index:49; pointer-events:none; }

  /* --- Rohfassung („Nextcloud-Standard“) --- */
  .raw, .raw * { color:transparent !important; text-shadow:none !important; box-shadow:none !important; }
  .raw.ui-win { background:#E6E9EE !important; box-shadow:0 2px 6px rgba(31,37,50,.10), 0 40px 90px rgba(31,37,50,.22) !important; }
  .raw .ui-top, .raw .ui-rail { background:#BFC5CE !important; --rc:#BFC5CE; }
  .raw .ui-main { background:#EEF0F4 !important; }
  .raw .ui-ri.on { background:#EEF0F4 !important; } .raw .ui-ri.on::before { background:#A9B0BB !important; }
  .raw .ui-ri .t { background:#D6DBE2 !important; }
  .raw .ui-gridtile { background:rgba(255,255,255,.28) !important; } .raw .ui-gridtile i { background:#A9B0BB !important; }
  .raw .ui-lbox { background:#A9B0BB !important; } .raw .ui-lbox svg { opacity:0; }
  .raw .ui-avatar { background:#A9B0BB !important; } .raw .ui-avatar::after { display:none; }
  .raw .ui-ti .dot { background:#A9B0BB !important; }
  .raw .ui-hero { background:#D6DAE1 !important; } .raw .ui-hero::before { display:none; }
  .raw .ui-day, .raw .ui-wcard, .raw .ui-fcard, .raw .ui-adj { background:#F8F9FB !important; border:1.5px solid #D3D8DF; }
  .raw .ui-search, .raw .ui-b, .raw .ui-ctl { background:#F8F9FB !important; border:1.5px solid #C4CAD3 !important; }
  .raw .ui-seg { border-color:#D3D8DF !important; } .raw .ui-seg span.on { background:#E6E9EE !important; }
  .raw .ui-band { background:none !important; }
  .raw .ui-ev { background:#E3E6EB !important; } .raw .ui-ev::before, .raw .ui-now, .raw .ui-tick { background:#B0B7C2 !important; }
  .raw .ui-hr { border-left-color:#E0E4EA !important; }
  .raw .ui-sc { background:#C4CAD3 !important; }
  .raw .ui-slant, .raw .ui-pill, .raw .ui-fcard .ic { background:#E3E6EB !important; }
  .raw .t { background:#C3C9D2 !important; border-radius:5px; }
  .raw svg *, .raw svg { stroke:#AEB5C0 !important; } .raw .fi, .raw .fi * { fill:#A9B0BB !important; stroke:none !important; }
  .raw .flag { background:#B0B7C2 !important; }
  `);
}

/* ---------- Gefüllte Rail-Icons (24×24) ---------- */
const FI = {
  home: '<path d="M12 2.8 2.6 11.2h2.6V20a1 1 0 0 0 1 1h4v-6h3.6v6h4a1 1 0 0 0 1-1v-8.8h2.6z"/>',
  files: '<path d="M3 6.2A2.2 2.2 0 0 1 5.2 4h3.9c.6 0 1.1.2 1.5.6L12 6h7A2 2 0 0 1 21 8v9.8a2.2 2.2 0 0 1-2.2 2.2H5.2A2.2 2.2 0 0 1 3 17.8z"/>',
  cal: '<path fill-rule="evenodd" d="M7 2.5a1 1 0 0 1 1 1V5h8V3.5a1 1 0 1 1 2 0V5h.5A2.5 2.5 0 0 1 21 7.5v11a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 18.5v-11A2.5 2.5 0 0 1 5.5 5H6V3.5a1 1 0 0 1 1-1zM5 10v8.5a.5.5 0 0 0 .5.5h13a.5.5 0 0 0 .5-.5V10z"/>',
  contacts: '<path fill-rule="evenodd" d="M5.5 3h13A2.5 2.5 0 0 1 21 5.5v13a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 18.5v-13A2.5 2.5 0 0 1 5.5 3zM12 6.8a2.7 2.7 0 1 0 0 5.4 2.7 2.7 0 0 0 0-5.4zM7.4 17.2c0 .5.4.8.8.8h7.6c.4 0 .8-.3.8-.8 0-2-2.2-3.4-4.6-3.4s-4.6 1.4-4.6 3.4z"/>',
  mail: '<path d="M3 7.2v-.7A2.5 2.5 0 0 1 5.5 4h13A2.5 2.5 0 0 1 21 6.5v.7l-9 5.8z"/><path d="M3 9.6v7.9A2.5 2.5 0 0 0 5.5 20h13a2.5 2.5 0 0 0 2.5-2.5V9.6l-9 5.8z"/>',
  talk: '<path fill-rule="evenodd" d="M5.5 3.5h13A2.5 2.5 0 0 1 21 6v8a2.5 2.5 0 0 1-2.5 2.5H13L8.5 21v-4.5H5.5A2.5 2.5 0 0 1 3 14V6a2.5 2.5 0 0 1 2.5-2.5zM8 9.3a1.1 1.1 0 1 0 0 2.2 1.1 1.1 0 0 0 0-2.2zm4 0a1.1 1.1 0 1 0 0 2.2 1.1 1.1 0 0 0 0-2.2zm4 0a1.1 1.1 0 1 0 0 2.2 1.1 1.1 0 0 0 0-2.2z"/>',
  deck: '<path fill-rule="evenodd" d="M5.5 3.5h13A2.5 2.5 0 0 1 21 6v12a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 18V6a2.5 2.5 0 0 1 2.5-2.5zM6.6 6.6v7.4h2.2V6.6zm4.4 0v10.2h2.2V6.6zm4.4 0v5h2.2v-5z"/>',
  forms: '<path fill-rule="evenodd" d="M9 2.5h6a1 1 0 0 1 1 1V4.5h1.5A2.5 2.5 0 0 1 20 7v12.5a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 19.5V7a2.5 2.5 0 0 1 2.5-2.5H8V3.5a1 1 0 0 1 1-1zM7.5 10.2v1.6h9v-1.6zm0 3.6v1.6H14v-1.6z"/>',
  support: '<path fill-rule="evenodd" d="M12 2.5a9.5 9.5 0 1 0 0 19 9.5 9.5 0 0 0 0-19zm0 6.2a3.3 3.3 0 1 1 0 6.6 3.3 3.3 0 0 1 0-6.6z"/><path d="M5.3 5.3l3.9 3.9M18.7 5.3l-3.9 3.9M5.3 18.7l3.9-3.9M18.7 18.7l-3.9-3.9" stroke="var(--rc,#1E2430)" stroke-width="2.4" fill="none"/>',
};
const fi = (k, s = 26) => `<svg class="fi" viewBox="0 0 24 24" width="${s}" height="${s}" fill="currentColor">${FI[k]}</svg>`;

/* ---------- Bausteine ---------- */
export function buildUI(E) {
  installUiCss(E);
  const { h, icon } = E;
  const ic = (n, s = 22, c = 'currentColor', w = 2) => h('span', { style: { display: 'inline-flex' }, html: icon(n, s, c, w) });
  const T = (cls, text, tag = 'span') => h(tag, { class: 't ' + cls, text });
  const lGlyph = '<svg viewBox="0 0 400 400"><path d="M139 100H176V270H277V300H139Z" fill="#1F2532"/></svg>';
  const tick = () => h('span', { class: 'ui-tick' });

  /* Fenster inkl. Kopfleiste und Leiste links */
  function window_(opts = {}) {
    const rail = [['home', 'Startseite'], ['files', 'Dateien'], ['cal', 'Kalender'], ['contacts', 'Kontakte'], ['mail', 'E-Mail'], ['talk', 'Talk']];
    const top = h('div', { class: 'ui-top' },
      h('div', { class: 'ui-gridtile' }, Array.from({ length: 9 }, () => h('i'))),
      h('div', { class: 'ui-lbox', html: lGlyph }),
      h('div', { class: 'ui-tir' },
        ['sparkles', 'search', 'bell', 'contact', 'globe'].map((n) => h('div', { class: 'ui-ti', html: icon(n, 22, 'currentColor', 2) + (n === 'bell' ? '<i class="dot"></i>' : '') })),
        h('div', { class: 'ui-avatar', text: 'A' })));
    const railEl = h('div', { class: 'ui-rail' });
    const items = {};
    const mk = (id, glyph, label, y) => {
      const el = h('div', { class: 'ui-ri', style: { top: y } }, h('span', { html: fi(glyph, 26) }), T('', label));
      railEl.append(el); items[id] = el; return el;
    };
    rail.forEach(([g, l], i) => mk(l, g, l, 8 + i * 77));
    railEl.append(h('div', { class: 'ui-rdiv', style: { top: MAIN.h - 8 - 72 - 10 } }));
    mk('Support', 'support', 'Support', MAIN.h - 8 - 72);
    const main = h('div', { class: 'ui-main' });
    const el = h('div', { class: 'ui-win' + (opts.raw ? ' raw' : '') }, top, railEl, main);
    return { el, top, rail: railEl, main, items, mk, setActive(id) { for (const k in items) items[k].classList.toggle('on', k === id); } };
  }

  /* Startseite „Ihr Tag“: Begrüßungsfläche + Tagesband */
  function home() {
    const search = h('div', { class: 'ui-search' }, ic('search', 21, '#6B6F78'), T('', 'Suchen: Datei, Person, Termin …'), h('span', { class: 'ui-caret', style: { display: 'none' } }), T('ui-kbd', '/'));
    const hero = h('div', { class: 'ui-hero' },
      h('div', { class: 'ui-hin' },
        T('ui-date', 'MITTWOCH, 14. OKTOBER 2026 · KW 42'),
        h('h1', { class: 't ui-greet disp', text: 'Guten Morgen, Anna.' }),
        T('ui-sub1', 'Alles Wichtige für heute auf einen Blick'),
        T('ui-sub2', 'Nächster Termin in 47 Minuten: Teamtermin · Besprechungsraum 2')),
      h('div', { class: 'ui-row' }, search,
        h('div', { class: 'ui-b' }, ic('calendar-days', 19, '#171A22', 2.2), T('', 'Termin eintragen')),
        h('div', { class: 'ui-b' }, ic('message-square', 19, '#171A22', 2.2), T('', 'Nachricht schreiben'))),
      h('div', { class: 'ui-bigdate' }, T('d disp', '14'), h('span', { class: 't m', html: 'MI<br>OKT<br>KW 42' })));

    // Tagesband 08–17 Uhr, 120 px je Stunde (Band beginnt bei x=24)
    const HW = 120, X = (hh) => (hh - 8) * HW;
    const band = h('div', { class: 'ui-band' });
    for (let i = 0; i < 11; i++) band.append(h('div', { class: 'ui-hr', style: { left: i * HW } }, T('', String(8 + i).padStart(2, '0'))));
    const ev = (hh, mm, dur, label, sub, row) => h('div', { class: 'ui-ev', style: { left: X(hh + mm / 60) + 2, width: dur * HW / 60 - 4, top: 26 + row * 46 } }, h('b', { class: 't', text: label }), sub ? h('small', { class: 't', text: sub }) : null);
    const events = [
      ev(10, 0, 60, '10:00', 'Teamtermin', 0), ev(11, 30, 60, '11:30', 'Angebot besprechen', 1),
      ev(13, 0, 45, '13:00', 'Mittag', 0), ev(14, 0, 100, '14:00', 'Projektstand · Talk', 0), ev(15, 30, 60, '15:30', 'Kundentermin', 1),
    ];
    const nowX = X(9 + 13 / 60);
    const now = h('div', { class: 'ui-now', style: { left: nowX } }, h('b', { class: 't', text: 'JETZT 09:13' }));
    band.append(...events, now, h('div', { class: 'ui-sc' }));
    const day = h('div', { class: 'ui-day' },
      h('div', { class: 'ui-dayh' }, h('span', { class: 'ui-cap' }, tick(), T('', 'IHR TAG')), T('dt', 'Mittwoch, 14. Oktober · heute'),
        h('span', { style: { flex: 1 } }),
        h('div', { class: 'ui-ctl' }, T('', '‹')), h('div', { class: 'ui-ctl' }, T('', 'Heute')), h('div', { class: 'ui-ctl' }, T('', '›')),
        h('div', { class: 'ui-seg' }, T('on', 'Tag', 'span'), T('', 'Woche', 'span'), T('', 'Monat', 'span')),
        h('div', { class: 'ui-seg' }, T('on', 'Band', 'span'), T('', 'Liste', 'span')),
        h('div', { class: 'ui-ctl' }, T('', 'Einstellen'))),
      band);
    band.style.top = '60px';

    const tmpl = h('div', { class: 'ui-tmpl' }, T('', 'Vorlage „Tagesblick“ · Ihre eigene Anordnung'), h('div', { class: 'ui-adj' }, ic('sliders-horizontal', 17, '#171A22', 2.2), T('', 'Anpassen')));
    const cap = (txt, left, top) => h('div', { class: 'ui-sec ui-cap', style: { left, top } }, tick(), T('', txt));
    const nextCard = h('div', { class: 'ui-wcard', style: { left: 64, top: 566, width: 788, height: 126 } },
      h('div', { class: 'ui-nrow' }, h('div', { class: 'ui-slant t', text: '10:00' }), h('div', {}, T('', 'Teamtermin'), h('small', { class: 't', text: 'Besprechungsraum 2 · 60 Min.' })), T('ui-pill', 'in 47 Min.')),
      h('div', { class: 'ui-nrow' }, h('span', { style: { width: 46, display: 'flex', justifyContent: 'center' } }, ic('list-todo', 24, '#C76A19', 2.2)), h('div', {}, T('', 'Karte fällig: Angebot Hartmann prüfen'), h('small', { class: 't', text: 'Deck · Vertrieb' })), T('ui-pill', 'heute')));
    const note = h('div', { class: 'ui-sec t', text: 'Oben steht, was gleich beginnt, was Sie persönlich betrifft und was heute fällig ist.', style: { left: 64, top: 702, font: '500 12.5px/1 var(--font-body)', color: '#5E6168' } });
    const files = [['file-text', 'Angebot_Hartmann.pdf', 'gestern, 16:41 · Vertrieb'], ['file-spreadsheet', 'Preisliste_2026.xlsx', 'Montag · Projekte'], ['file-text', 'Protokoll_Teamtermin.docx', 'Montag · Team']];
    const fcards = files.map(([n, a, b], i) => h('div', { class: 'ui-fcard', style: { left: 64 + i * 268, top: 762, width: 256 } }, h('span', { class: 'ic', html: icon(n, 18, 'currentColor', 2) }), h('div', {}, h('b', { class: 't', text: a }), h('small', { class: 't', text: b }))));
    const news = h('div', { class: 'ui-wcard', style: { left: 880, top: 566, width: 452, height: 192, padding: '22px 26px' } },
      h('div', { class: 't', text: 'Neu: Assistent in Ihrer Cloud', style: { font: '700 18px/1.2 var(--font-body)', color: '#171A22' } }),
      h('div', { class: 't', html: 'Suchen, zusammenfassen, Fragen stellen –<br>direkt dort, wo Sie arbeiten. Aktivieren Sie ihn unter<br>Einstellungen › Assistent.', style: { font: '500 13.5px/1.6 var(--font-body)', color: '#2A2F3A', marginTop: '12px', display: 'block' } }),
      h('div', { style: { position: 'absolute', left: 26, right: 26, bottom: 18, display: 'flex', alignItems: 'center', font: '500 12px/1 var(--font-body)', color: '#6B6F78' } }, T('', 'linkado-team · 14. Oktober'), h('span', { class: 't', text: 'Alle Neuigkeiten →', style: { marginLeft: 'auto', font: '700 13px/1 var(--font-body)', color: '#8A4A10' } })));
    const el = h('div', { class: 'ui-view' }, hero, day, tmpl, cap('ALS NÄCHSTES', 64, 538), nextCard, note, cap('WEITER, WO SIE AUFGEHÖRT HABEN', 64, 734), ...fcards, cap('NEUES BEI LINKADO', 880, 538), news);
    return { el, hero, day, band, events, now, search, searchText: search.querySelector('.t'), caret: search.querySelector('.ui-caret'), hin: hero.querySelector('.ui-hin'), nextCard, news, fcards };
  }

  /* Suchergebnisse (Dropdown unter dem Suchfeld) – erste Zeile: Assistent */
  function results(query = 'Angebot') {
    const rows = [
      ['sparkles', 'Assistent fragen', '„Wie ist der Stand beim Angebot für Hartmann?“', 'ai'],
      ['file-text', 'Angebot_Hartmann.pdf', 'Datei · Vertrieb · gestern', ''],
      ['calendar-check', 'Angebot besprechen', 'Termin · heute 11:30', ''],
      ['message-circle', 'Angebot Hartmann – Team Vertrieb', 'Talk · 3 neue Nachrichten', ''],
      ['user-round', 'Lena Vogt', 'Person · Vertrieb', ''],
    ];
    const hl = (s) => { const i = s.toLowerCase().indexOf(query.toLowerCase()); return i < 0 ? s : s.slice(0, i) + '<mark class="ui-m">' + s.slice(i, i + query.length) + '</mark>' + s.slice(i + query.length); };
    const rowEls = rows.map(([n, a, b, k], i) => h('div', { class: 'ui-rr' + (i === 0 ? ' on' : '') }, h('span', { class: 'ic ' + k, html: icon(n, 20, 'currentColor', 2) }), h('div', {}, h('span', { class: 't', html: hl(a) }), h('small', { class: 't', text: b })), h('span', { class: 'go', html: icon('arrow-up-right', 18, 'currentColor', 2) })));
    const el = h('div', { class: 'ui-res' }, h('span', { class: 'ui-rg t', text: 'TREFFER ÜBERALL' }), rowEls);
    return { el, rows: rowEls };
  }

  /* Apps und Pakete (Linkado-Verwaltung): Spotlight-Karten + Paketliste mit Schaltern */
  const APPS = [
    { id: 'Deck', name: 'Deck', ey: 'IM BLICKPUNKT · DECK', head: 'Aufgaben sichtbar machen.', p: 'Karten statt langer Listen: Ihr Team sieht auf einen Blick, was ansteht.', bg: '#F5DFC5', glyph: 'deck', ico: 'columns-3', col: '#C76A19' },
    { id: 'Formulare', name: 'Formulare', ey: 'IM BLICKPUNKT · FORMULARE', head: 'Antworten sammeln.', p: 'Umfragen und Anmeldungen in Minuten – ohne Umweg über fremde Dienste.', bg: '#EFE6D6', glyph: 'forms', ico: 'clipboard-list', col: '#2F7D6B' },
    { id: 'Talk', name: 'Talk', ey: 'IM BLICKPUNKT · TALK', head: 'Kurze Wege im Team.', p: 'Chat und Anrufe direkt in Ihrer Cloud, Gäste kommen per Link dazu.', bg: '#DDE6EC', glyph: 'talk', ico: 'message-circle', col: '#3B6FA0', active: true },
  ];
  const PKG_ROWS = [['DE', 'Deck', 'Aufgaben und Projekte als Board', 0], ['FO', 'Formulare', 'Umfragen und Anmeldungen erstellen', 0], ['NO', 'Notizen', 'Gedanken schnell festhalten', 1], ['CO', 'Collectives', 'Wissen gemeinsam pflegen', 0], ['UM', 'Umfragen', 'Termine gemeinsam finden', 0]];
  function apps() {
    const menuItems = [['h', 'Persönlich'], ['user-round', 'Persönliche Informationen'], ['lock', 'Sicherheit'], ['bell', 'Benachrichtigungen'], ['share-2', 'Teilen'], ['sparkles', 'Assistent'], ['clock', 'Verfügbarkeit'], ['h', 'Administration'], ['sliders-horizontal', 'Übersicht'], ['settings', 'Grundeinstellungen'], ['share-2', 'Teilen'], ['layers', 'Linkado', true], ['lock', 'Sicherheit']];
    const menu = h('div', { class: 'ui-amenu' }, menuItems.map(([n, l, on]) => n === 'h' ? h('div', { class: 'ui-amh' }, T('', l)) : h('div', { class: 'ui-ami' + (on ? ' on' : '') }, ic(n, 17, 'currentColor', 2), T('', l))));
    const head = h('div', { class: 'ui-ahead' },
      h('div', { style: { position: 'absolute', left: 36, top: 34 } }, h('span', { class: 'ui-cap' }, tick(), T('', 'LINKADO')), h('h1', { class: 't ui-atitle', text: 'Apps und Pakete', style: { margin: '12px 0 0' } }),
        T('ui-adesc', 'Entdecken Sie Pakete für Ihr Team und kostenlose Apps. Verwalten Sie Ihre Apps und behalten Sie Buchungen im Blick.')),
      h('div', { class: 'ui-tabs' }, T('on', 'Apps und Pakete', 'span'), T('', 'Meine Apps', 'span'), T('', 'Buchungen', 'span')));
    const nApps = h('b', { class: 't', text: '59' });
    const stat = h('div', { class: 'ui-astat' }, h('span', { class: 'ui-tick', style: { marginRight: -10, height: 20 } }), h('span', {}, h('b', { class: 't', text: '2' }), T('', 'Pakete gebucht')), h('span', {}, nApps, T('', 'Apps aktiv')), h('span', {}, h('b', { class: 't', text: '3' }), T('', 'Empfehlungen für Ihr Team')));
    const search = h('div', { class: 'ui-field', style: { top: 304 } }, h('label', {}, T('', 'Suche')), h('div', { class: 'ui-input' }, T('', 'Apps oder Pakete suchen')));
    const chips = h('div', { class: 'ui-chips', style: { left: 36, top: 380 } }, ['Alle', 'Dateien mit Office', 'Arbeitsplatz', 'Talk', 'Weitere Apps'].map((c, i) => h('div', { class: 'ui-chip' + (i === 0 ? ' on' : '') }, T('', c))));
    const cnt = h('div', { class: 'ui-abs t', text: '24 von 24 Paketen und Apps', style: { left: 36, top: 440, font: '500 12px/1 var(--font-body)', color: '#5E6168' } });
    const cards = APPS.map((a, k) => {
      const left = 36 + k * 302;
      const badge = h('span', { class: 'ui-badge' + (a.active ? '' : ' n') }, T('', a.active ? 'Aktiv' : 'Verfügbar'));
      const stEl = h('div', { class: 'ui-st' }, badge, T('', 'Im Paket enthalten'));
      const add = a.active ? h('div', { class: 'ui-more' }, T('', 'Mehr über Talk')) : h('div', { class: 'ui-add' }, ic('plus', 18, '#fff', 2.8), T('', 'Hinzufügen'));
      const more = a.active ? null : h('div', { class: 'ui-more', style: { display: 'none' } }, T('', 'Mehr über ' + a.name));
      const el = h('div', { class: 'ui-spot', style: { left, top: 476, background: a.bg } }, h('div', { class: 'ey t', text: a.ey }), h('h5', { class: 't', text: a.head }), h('p', { class: 't', text: a.p }), stEl, add, more);
      return { el, badge, add, more, st: stEl, ...a };
    });
    const pkgs = [['Dateien mit Office', '7 Apps, 2 Dienste', 'Enthalten', false], ['Arbeitsplatz', '8 Apps', 'Gebucht', true], ['Talk', '3 Apps', 'Gebucht', false]];
    const plist = h('div', { class: 'ui-plist', style: { top: LAY.apps.pk } }, pkgs.map(([a, b, c, on]) => h('div', { class: 'ui-pi' + (on ? ' on' : '') }, h('b', { class: 't', text: a }), h('small', { class: 't', text: b }), h('span', { class: 'ui-badge badge' }, T('', c)))));
    const phead = h('div', { class: 'ui-abs', style: { left: 36, top: LAY.apps.pk - 38, width: 880, display: 'flex', alignItems: 'baseline' } }, h('b', { class: 't', text: 'Pakete', style: { font: '800 17px/1 var(--font-body)', color: '#171A22' } }), h('span', { class: 't', text: 'monatlich kündbar', style: { marginLeft: 'auto', font: '500 12px/1 var(--font-body)', color: '#5E6168' } }));
    plist.style.left = '0px'; plist.style.width = '280px';
    const rows = PKG_ROWS.map(([ini, name, desc, on], i) => {
      const tg = h('div', { class: 'ui-tg' }, h('i'));
      const lbl = h('span', { class: 'on t', text: on ? 'Aktiv' : 'Aus' });
      const el = h('div', { class: 'ui-prow', style: { top: 100 + i * 76 } }, h('div', { class: 'ini t', text: ini }), h('div', {}, h('b', { class: 't', text: name }), h('small', { class: 't', text: desc }), h('span', { class: 'im t', text: 'Im Paket enthalten' })), tg, lbl, h('span', { class: 'hl t', text: 'Hilfe' }));
      return { el, tg, lbl, name, on };
    });
    const pdet = h('div', { class: 'ui-pdet', style: { top: LAY.apps.pk } },
      h('div', { class: 'k t', text: 'Erweiterung · 8 Apps' }), h('h6', { class: 't', text: 'Arbeitsplatz' }),
      h('div', { class: 'ui-pbox t', text: 'In Ihrer Cloud enthalten. Jede App einzeln schaltbar.' }),
      ...rows.map((r) => r.el));
    // Detailbereich: Zeilen relativ zum Detailkopf (130 px unter Abschnittsbeginn)
    rows.forEach((r, i) => { r.el.style.top = (130 + i * 76) + 'px'; });
    const scroll = h('div', { class: 'ui-ascroll' }, head, stat, search, chips, cnt, ...cards.map((c) => c.el), phead, plist, pdet);
    const reg = h('div', { class: 'ui-areg' }, scroll);
    const el = h('div', { class: 'ui-view' }, menu, reg);
    return { el, menu, head, stat, nApps, search, chips, cards, scroll, plist, pdet, rows, phead };
  }

  /* Support: Hilfe finden (mit Assistent-Antwort), Meine Anfragen, Hilfe und Kontakt */
  function support() {
    const menu = h('div', { class: 'ui-smenu' },
      h('div', { class: 'ui-sm1' }, tick(), T('', 'Support')), T('ui-sm2', 'Ihr Arbeitsplatz'),
      h('div', { class: 'ui-sbtn' }, ic('message-square', 18, '#171A22', 2), T('', 'Anfrage stellen')),
      h('div', { style: { height: 14 } }),
      [['house', 'Start', true], ['message-square', 'Anfragen'], ['book-open', 'Anleitungen'], ['user-round', 'Mein Konto']].map(([n, l, on]) => h('div', { class: 'ui-sni' + (on ? ' on' : '') }, ic(n, 18, 'currentColor', 2), T('', l))),
      h('div', { style: { height: 1, background: '#E4DED6', margin: '22px 4px 0' } }), T('ui-slink', 'Zum IT-Bereich wechseln'));
    const inp = h('div', { class: 'inp' }, h('span', { class: 'q t', text: 'z. B. Dateien, Kalender, Zugang', style: { color: '#7A7770' } }), h('span', { class: 'ui-caret', style: { display: 'none' } }));
    const sin = h('div', { class: 'ui-scard' }, h('label', {}, T('', 'Anleitungen durchsuchen')), h('div', { class: 'ui-sin' }, inp, h('div', { class: 'go' }, T('', 'Suchen'))));
    // Zone: Liste beliebter Anleitungen ↔ Assistent-Antwort
    const arts = [['file-question', 'Wie teile ich einen Ordner?', '3 Min.'], ['calendar-days', 'Kalender mit dem Team teilen', '2 Min.'], ['key-round', 'Zugang auf dem Handy einrichten', '4 Min.']];
    const artEls = arts.map(([n, a, b], i) => h('div', { class: 'ui-art', style: { top: 30 + i * 58, height: 52 } }, h('span', { class: 'ic', html: icon(n, 17, '#4A4F5C', 2) }), T('', a), T('', b, 'small')));
    const artsLbl = h('div', { class: 'ui-abs ui-cap', style: { left: 0, top: 4 } }, T('', 'BELIEBTE ANLEITUNGEN'));
    const steps = ['Ordner anklicken', '„Teilen“ wählen', 'Link kopieren'].map((s, i) => {
      const ck = h('span', { class: 'ck', html: icon('check', 15, '#fff', 3.4), style: { display: 'none' } });
      const dot = h('div', { class: 'ui-dot' }, h('span', { text: String(i + 1) }), ck);
      return { dot, ck, el: h('div', { class: 'ui-step' }, dot, T('', s)) };
    });
    const ai = h('div', { class: 'ui-ai' },
      h('div', { class: 'ui-aih' }, h('span', { class: 'ic', html: icon('sparkles', 17, '#fff', 2.2) }), T('', 'So teilen Sie einen Ordner'), T('', 'Antwort des Assistenten', 'small')),
      h('div', { style: { height: 8 } }), steps.map((s) => s.el),
      h('div', { class: 'ui-aif' }, ic('book-open', 14, '#8A6A44', 2), T('', 'Quelle: Anleitung „Ordner teilen“ · Hilfreich?')));
    const zone = h('div', { class: 'ui-zone' }, artsLbl, ...artEls, ai);
    const chips = h('div', { class: 'ui-schips' }, ['Zugang', 'Dateien', 'Kalender', 'Freigaben'].map((c) => h('div', { class: 'ui-sch' }, T('', c))));
    const banner = h('div', { class: 'ui-banner' }, h('div', { class: 'ic', html: icon('user-round', 19, '#171A22', 2.2) }),
      h('div', {}, h('div', { class: 'ui-cap', style: { fontWeight: 500, textTransform: 'none', letterSpacing: 0, fontSize: 12.5 } }, tick(), T('', 'Jetzt wichtig')), h('div', { class: 'bt t', text: 'Empfehlung: Schützen Sie Ihr Konto', style: { marginTop: 5 } }), h('small', { class: 't', text: 'Für Ihr Konto ist kein zweiter Faktor aktiviert.' })),
      h('div', { class: 'go' }, T('', 'Sicherheitseinstellungen öffnen'), ic('arrow-right', 16, '#171A22', 2.4)));
    // Anfragen
    const reqh = h('div', { class: 'ui-reqh' }, h('span', { class: 'ui-h2 t', text: 'Meine Anfragen' }), h('span', { class: 'lk t', text: 'Anfragen ansehen' }));
    const mkReq = (n, a, b, st, cls) => { const stEl = h('span', { class: 'ui-rst ' + cls }, T('', st)); const sub = h('small', { class: 't', text: b }); const el = h('div', { class: 'ui-req' }, h('span', { class: 'ic', html: icon(n, 17, '#4A4F5C', 2) }), h('div', {}, h('b', { class: 't', text: a }), sub), stEl); return { el, stEl, sub, stText: stEl.firstChild }; };
    const rOld = mkReq('wrench', 'Drucker im 2. OG einrichten', 'Anfrage von Ihnen · vor 3 Tagen', 'Gelöst', 'g');
    const rNew = mkReq('user-plus', 'Kollegen ins Team einladen', 'Anfrage von Ihnen · gerade eben', 'Eingegangen', '');
    rNew.stText.textContent = 'Eingegangen';
    const reply = h('div', { class: 't', text: '„Hallo Anna, hier ist Ihr Einladungslink.“', style: { font: '500 12.5px/1.35 var(--font-body)', color: '#8A4A10', marginTop: 5 } });
    rNew.sub.after(reply);
    // Karten rechts
    const kto = h('div', { class: 'ui-rcard', style: { top: 236 } }, h('h6', {}, ic('user-round', 18, '#171A22', 2.2), T('', 'Mein Konto')),
      T('', 'Für Ihr Konto ist eine E-Mail-Adresse hinterlegt.', 'p'), T('g', 'Empfehlung: Aktivieren Sie einen zweiten Faktor.', 'p'), h('div', { class: 'lk' }, T('', 'Mein Konto öffnen'), ic('arrow-right', 15, '#171A22', 2.4)));
    const hk = h('div', { class: 'ui-rcard', style: { top: 436 } }, h('h6', {}, T('', 'Hilfe und Kontakt')),
      T('g', 'Anleitungen finden Sie links – oder stellen Sie eine Anfrage.', 'p'), T('', 'Support-Zeiten: Mo–Fr 9–17 Uhr. Außerhalb: Meldung anlegen, wir antworten am nächsten Arbeitstag.', 'p'), h('div', { style: { marginTop: 14 } }, T('', 'Melden ohne Anmeldung', 'u')));
    const sc = h('div', { class: 'ui-sc0' },
      h('div', { class: 'ui-abs', style: { left: 0, top: 30 } }, h('span', { class: 'ui-cap', style: { fontWeight: 500, textTransform: 'none', letterSpacing: 0, fontSize: 12.5, color: '#6B6F78' } }, tick(), T('', 'Support'))),
      h('h1', { class: 'ui-h1 t', text: 'Ihr Support auf einen Blick.' }),
      h('div', { class: 'ui-abs t', text: 'Eine Antwort finden, Hilfe anfordern oder den Stand Ihrer Anfrage ansehen.', style: { left: 0, top: 98, font: '500 13.5px/1 var(--font-body)', color: '#5E6168' } }),
      h('div', { class: 'ui-orange' }, ic('plus', 18, '#fff', 2.8), T('', 'Anfrage stellen')),
      banner,
      h('div', { class: 'ui-abs ui-h2 t', text: 'Hilfe finden', style: { left: 0, top: 236 } }),
      sin, chips, zone, reqh, kto, hk);
    // Anfragen-Zeilen als eigene Ebene
    rOld.el.style.cssText += ';top:748px;height:54px'; rNew.el.style.cssText += ';top:684px;height:54px';
    sc.append(rOld.el, rNew.el);
    const el = h('div', { class: 'ui-view' }, menu, h('div', { class: 'ui-sreg' }, sc));
    return { el, menu, sc, inp, input: inp.firstChild, caret: inp.querySelector('.ui-caret'), zone, arts: artEls, artsLbl, ai, steps, rOld, rNew, reply, banner, kto, hk, h1: sc.querySelector('.ui-h1') };
  }

  /* Großes Menü: Suche „Was möchten Sie tun?“, Favoriten, Bereiche; bei Eingabe wird die Liste durch Treffer ersetzt (erste Zeile: Assistent) */
  function menu(query = 'Angebot') {
    const item = (g, title, sub, on) => h('div', { class: 'ui-mi' + (on ? ' on' : '') }, g.startsWith('fi:') ? h('span', { html: fi(g.slice(3), 20) }) : ic(g, 20, 'currentColor', 2), T('', title, 'span'), sub ? h('small', { class: 't', text: sub }) : null);
    const cap = (txt) => h('div', { class: 'ui-mcap' }, tick(), T('', txt));
    const favs = h('div', { class: 'ui-favs' }, [['fi:talk', 'Talk'], ['fi:cal', 'Kalender']].map(([g, l]) => h('div', { class: 'ui-fav' }, h('div', { class: 'ic', html: fi(g.slice(3), 22) }), h('b', { class: 't', text: l }))));
    const cats = h('div', {},
      cap('FÜR SIE'), favs, h('div', { class: 'ui-mhint t', html: 'Ihre Favoriten, dann was Sie oft öffnen.<br>Gezählt wird nur in dieser Cloud. <u>Einstellen</u>' }),
      h('div', { style: { height: 8 } }),
      item('fi:home', 'Startseite', 'Ihr Tag auf einen Blick', true), item('layout-grid', 'Übersicht', 'Kacheln und Widgets'),
      cap('START'), item('history', 'Aktivität', 'Wer hat was geändert'), item('fi:files', 'Dateien'), item('image', 'Fotos'),
      cap('KOMMUNIKATION'), item('fi:mail', 'E-Mail'), item('messages-square', 'Forum', 'Fragen und Diskussionen'), item('fi:talk', 'Talk', 'Chat und Videoanruf'), item('bell', 'Ankündigungen', 'Aushänge für alle'),
      cap('ORGANISATION'), item('fi:cal', 'Kalender', 'Termine und Urlaub'), item('fi:contacts', 'Kontakte'), item('square-check', 'Aufgaben'), item('notebook-pen', 'Notizen'));
    const rows = [
      ['sparkles', 'Assistent fragen', '„Stand beim Angebot Hartmann?“', 'ai'], ['file-text', 'Angebot_Hartmann.pdf', 'Datei · Vertrieb · gestern', ''], ['calendar-check', 'Angebot besprechen', 'Termin · heute 11:30', ''],
      ['message-circle', 'Angebot Hartmann – Team', 'Talk · 3 neue Nachrichten', ''], ['user-round', 'Lena Vogt', 'Person · Vertrieb', ''],
    ];
    const hl = (t_) => { const i = t_.toLowerCase().indexOf(query.toLowerCase()); return i < 0 ? t_ : t_.slice(0, i) + '<mark class="ui-m">' + t_.slice(i, i + query.length) + '</mark>' + t_.slice(i + query.length); };
    const rowEls = rows.map(([n, a, b, k], i) => h('div', { class: 'ui-mrr' + (i === 0 ? ' on' : '') }, h('span', { class: 'ic ' + k, html: icon(n, 18, 'currentColor', 2) }), h('div', { class: 'tx' }, h('span', { class: 't', html: hl(a) }), h('small', { class: 't', text: b }))));
    const res = h('div', { class: 'ui-mres' }, h('div', { class: 'ui-mcap', style: { margin: '6px 0 4px', padding: '0 8px' } }, T('', 'TREFFER ÜBERALL')), rowEls);
    const input = h('span', { class: 't', text: 'Was möchten Sie tun?' });
    const caret = h('span', { class: 'ui-caret', style: { display: 'none', height: 20 } });
    const search = h('div', { class: 'ui-msearch' }, ic('search', 20, '#6B6F78', 2), input, caret, h('span', { class: 'kbd t', text: 'Strg K' }));
    const head = h('div', { class: 'ui-mhead' }, h('div', { class: 'ui-mlogo t', text: 'LINKADO' }), h('span', { class: 'ui-mx', html: icon('x', 22, '#fff', 2.4) }), search);
    const scroll = h('div', {}, cats);
    const body = h('div', { class: 'ui-mbody' }, scroll, res);
    const foot = h('div', { class: 'ui-mfoot' }, h('span', {}, h('span', { html: fi('support', 17) }), T('', 'Hilfe')), h('span', {}, ic('sliders-horizontal', 16, 'currentColor', 2), T('', 'Anpassen')), h('span', {}, ic('palette', 16, 'currentColor', 2), T('', 'Menü gestalten')));
    const el = h('div', { class: 'ui-menu' }, head, body, foot);
    return { el, input, caret, search, cats, scroll, res, rows: rowEls };
  }

  /* Cursor (Pfeil) und Klick-Welle */
  function cursor() {
    const el = h('div', { class: 'ui-cur', html: '<svg viewBox="0 0 34 34" width="34" height="34"><path d="M5 3 L5 26 L11 21 L15 30 L19 28 L15 20 L23 20 Z" fill="#fff" stroke="#1F2532" stroke-width="2" stroke-linejoin="round"/></svg>' });
    const rip = h('div', { class: 'ui-rip' });
    return { el, rip };
  }

  return { window: window_, home, results, menu, apps, support, cursor, APPS, PKG_ROWS, MAIN, WIN, LAY, ic, T, lGlyph, fi };
}
