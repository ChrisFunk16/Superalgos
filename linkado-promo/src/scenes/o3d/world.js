// ============================================================
// Das 3D-Büro (Vogelperspektive): ein dämmriges Großraumbüro als „Schnittmodell“ (Rückwand mit Nachtfenster, Boden, Möbel, Requisiten).
// Drei Arbeitsplätze (Tom, Lena, Anna) mit Schreibtisch, Stuhl, Monitor, Tastatur, Maus, Tasse …; dazu Hintergrund (Regale, Pflanzen, Besprechungstisch, Teeküche).
// Koordinaten: Meter, +Y oben, die Kamera schaut aus +Z auf die Szene (Rückwand bei z = −6), +X nach rechts.
// ============================================================
import * as THREE from '../../vendor/three.module.js';

const V3 = THREE.Vector3;

/** Quader mit abgerundeten Kanten (Extrusion eines Rundrechtecks, Mitte im Ursprung) */
export function rbox(w, h, d, r = 0.012) {
  r = Math.min(r, w / 2 - 1e-3, h / 2 - 1e-3, d / 2 - 1e-3);
  const bev = Math.min(r * 0.6, d / 2 - 1e-3), rr = Math.max(1e-3, r - bev * 0.0);
  const sh = new THREE.Shape(), x = -w / 2 + bev, y = -h / 2 + bev, W = w - 2 * bev, H = h - 2 * bev, c = Math.max(1e-3, r - bev);
  sh.moveTo(x + c, y); sh.lineTo(x + W - c, y); sh.quadraticCurveTo(x + W, y, x + W, y + c); sh.lineTo(x + W, y + H - c); sh.quadraticCurveTo(x + W, y + H, x + W - c, y + H);
  sh.lineTo(x + c, y + H); sh.quadraticCurveTo(x, y + H, x, y + H - c); sh.lineTo(x, y + c); sh.quadraticCurveTo(x, y, x + c, y);
  const g = new THREE.ExtrudeGeometry(sh, { depth: Math.max(1e-3, d - 2 * bev), bevelEnabled: true, bevelThickness: bev, bevelSize: bev, bevelSegments: 3, curveSegments: 5 });
  g.translate(0, 0, -(d - 2 * bev) / 2); return g;
}

const std = (c, r = 0.8, m = 0, extra = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: m, ...extra });

function canvasTex(w, h, draw, repeat) {
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h; const g = cv.getContext('2d'); draw(g, w, h);
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat[0], repeat[1]); }
  return t;
}

/** Hilfsfunktion: Mesh anlegen */
function put(parent, geo, mat, x = 0, y = 0, z = 0, cast = true, recv = true) {
  const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = cast; m.receiveShadow = recv; parent.add(m); return m;
}

export const DESK_H = 0.74, SEAT_H = 0.46;
/** Aufstellung der drei Arbeitsplätze (Ursprung = Tischmitte am Boden) */
export const DESKS = {
  tom:  { pos: new V3(-5.2, 0, -2.3), yaw: 0.0, mirror: 1 },
  lena: { pos: new V3(0.0, 0, -2.7), yaw: 0.0, mirror: -1 },
  anna: { pos: new V3(5.3, 0, -2.0), yaw: 0.0, mirror: 1 },
  // Kolleg*innen im Hintergrund (nur Statisten: arbeiten still weiter)
  jonas: { pos: new V3(-8.0, 0, -2.2), yaw: 0.0, mirror: -1, extra: true },
  mira:  { pos: new V3(-2.55, 0, -2.0), yaw: 0.0, mirror: 1, extra: true },
  ben:   { pos: new V3(2.7, 0, -2.2), yaw: 0.0, mirror: -1, extra: true },
  aylin: { pos: new V3(8.2, 0, -2.5), yaw: 0.0, mirror: -1, extra: true },
};
export const MAIN = ['tom', 'lena', 'anna'], EXTRA = ['jonas', 'mira', 'ben', 'aylin'];
/** Geometrie des Arbeitsplatzes im Tisch-Raum (mirror spiegelt x) – gemeinsam für Welt, Figuren und Kameras */
export function deskLayout(key) {
  const D = DESKS[key], m = D.mirror;
  const toW = (x, y, z) => new V3(x * m, y, z).applyAxisAngle(new V3(0, 1, 0), D.yaw).add(D.pos);
  return {
    key, D, toW, m,
    seat: toW(-0.47, 0, -0.66), seatYaw: m * 0.7 + D.yaw,
    kbd: toW(-0.24, DESK_H + 0.02, -0.34), kbdYaw: m * 0.7 + D.yaw,
    mouse: toW(0.06, DESK_H + 0.02, -0.14),
    mon: toW(0.43, DESK_H, -0.12), monYaw: m * -0.30 + D.yaw,
    phone: toW(-0.66, DESK_H + 0.006, -0.34),
    mug: toW(0.12, DESK_H, -0.36),
    mid: toW(0, DESK_H, 0),
  };
}

/** Monitor-Geometrie: Bildschirmfläche 1480 × 996 (Browser-Leiste + Fenster) */
export const MON = { w: 0.62, h: 0.62 * 996 / 1480, standH: 0.20 };

export function buildWorld() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#141A2C');
  scene.fog = new THREE.Fog('#141A2C', 16, 40);

  /* ---------------- Texturen ---------------- */
  const floorTex = canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = '#374268'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 4000; i++) { const x = (i * 97) % w, y = (i * 57 + (i >> 3) * 13) % h; g.fillStyle = `rgba(255,255,255,${0.012 + ((i * 7) % 5) * 0.004})`; g.fillRect(x, y, 2, 2); }
    g.strokeStyle = 'rgba(10,14,28,.55)'; g.lineWidth = 3; g.strokeRect(0, 0, w, h);
    g.strokeStyle = 'rgba(255,255,255,.05)'; g.lineWidth = 2; g.strokeRect(5, 5, w - 10, h - 10);
  }, [20, 14]);
  const skyTex = canvasTex(1024, 256, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#0E1530'); gr.addColorStop(0.6, '#2A3560'); gr.addColorStop(1, '#4A4F7C'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 90; i++) { g.fillStyle = `rgba(255,255,255,${0.2 + ((i * 13) % 7) * 0.08})`; g.fillRect((i * 211) % w, (i * 37) % (h * 0.5), 1.5, 1.5); }
    let x = 0, k = 0; while (x < w) { const bw = 30 + ((k * 37) % 50), bh = 40 + ((k * 61) % 120); g.fillStyle = k % 2 ? '#141B38' : '#1A2244'; g.fillRect(x, h - bh, bw, bh);
      for (let wy = h - bh + 8; wy < h - 6; wy += 12) for (let wx = x + 6; wx < x + bw - 8; wx += 11) if (((wx * 7 + wy * 3 + k) % 5) < 2) { g.fillStyle = ((wx + wy) % 3) ? 'rgba(255,214,140,.85)' : 'rgba(160,200,255,.75)'; g.fillRect(wx, wy, 5, 6); }
      x += bw + 2; k++; }
  });
  const clockTex = canvasTex(256, 256, (g) => {
    g.fillStyle = '#EDE8DD'; g.beginPath(); g.arc(128, 128, 120, 0, 7); g.fill(); g.strokeStyle = '#0B0F18'; g.lineWidth = 10; g.stroke();
    for (let k = 0; k < 12; k++) { const a = k * Math.PI / 6; g.strokeStyle = '#1F2532'; g.lineWidth = k % 3 ? 5 : 9; g.beginPath(); g.moveTo(128 + Math.sin(a) * 100, 128 - Math.cos(a) * 100); g.lineTo(128 + Math.sin(a) * 112, 128 - Math.cos(a) * 112); g.stroke(); }
    const hand = (a, l, wd) => { g.strokeStyle = '#1F2532'; g.lineWidth = wd; g.lineCap = 'round'; g.beginPath(); g.moveTo(128, 128); g.lineTo(128 + Math.sin(a) * l, 128 - Math.cos(a) * l); g.stroke(); };
    hand((9 + 13 / 60) * Math.PI / 6, 62, 9); hand(13 * Math.PI / 30, 92, 6);
  });
  const kbdTex = canvasTex(256, 96, (g, w, h) => { g.fillStyle = '#C9CEDA'; g.fillRect(0, 0, w, h); for (let r = 0; r < 5; r++) for (let c = 0; c < 15; c++) { g.fillStyle = '#EEF0F5'; g.fillRect(10 + c * 15.6, 8 + r * 15.5, 13, 12.5); } });
  const noteTex = (col) => canvasTex(64, 64, (g) => { g.fillStyle = col; g.fillRect(0, 0, 64, 64); g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = 3; for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(10, 16 + i * 11); g.lineTo(10 + 30 + (i % 2) * 12, 16 + i * 11); g.stroke(); } });

  /* ---------------- Raum ---------------- */
  const room = new THREE.Group(); scene.add(room);
  const floor = put(room, new THREE.BoxGeometry(32, 0.3, 24), new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.95 }), 0, -0.15, 0, false, true);
  const wallM = std('#2B3658', 0.95), baseM = std('#161C33', 0.8), trimM = std('#323E64', 0.8);
  put(room, new THREE.BoxGeometry(32, 4.6, 0.3), wallM, 0, 2.3, -6.15, true, true);                     // Rückwand
  put(room, new THREE.BoxGeometry(0.3, 4.6, 24), wallM, -11.5, 2.3, 0, true, true);                    // linke Wand
  put(room, new THREE.BoxGeometry(32, 0.14, 0.06), baseM, 0, 0.07, -5.96, false, true);
  // Fensterband
  const win = new THREE.Mesh(new THREE.PlaneGeometry(22, 1.9), new THREE.MeshBasicMaterial({ map: skyTex, toneMapped: false })); win.position.set(0, 1.95, -5.99); win.material.color.setScalar(0.62); room.add(win);
  put(room, new THREE.BoxGeometry(22.2, 0.08, 0.1), trimM, 0, 0.98, -5.95, false, false); put(room, new THREE.BoxGeometry(22.2, 0.08, 0.1), trimM, 0, 2.92, -5.95, false, false);
  for (let x = -11; x <= 11.01; x += 2.75) put(room, new THREE.BoxGeometry(0.07, 1.95, 0.1), trimM, x, 1.95, -5.95, false, false);
  // Uhr (09:13)
  const clock = new THREE.Mesh(new THREE.CircleGeometry(0.34, 40), new THREE.MeshBasicMaterial({ map: clockTex })); clock.position.set(2.7, 3.35, -5.98); room.add(clock);
  // Pinnwand + Poster + Whiteboard
  const noteCols = ['#F3D97A', '#F2A6B8', '#8FD3C5', '#A9C4F5'];
  put(room, new THREE.BoxGeometry(1.7, 1.0, 0.04), std('#B88B5E', 0.9), -9.2, 1.9, -5.95, false, true);
  noteCols.forEach((c, i) => { const n = new THREE.Mesh(new THREE.PlaneGeometry(0.28, 0.28), new THREE.MeshStandardMaterial({ map: noteTex(c), roughness: 0.9 })); n.position.set(-9.75 + i * 0.37, 1.95 + (i % 2) * 0.15 - 0.1, -5.92); n.rotation.z = (i - 1.5) * 0.08; room.add(n); });
  put(room, new THREE.BoxGeometry(2.6, 1.4, 0.05), std('#E9ECF2', 0.4), 8.4, 2.0, -5.94, false, true);
  [['#E5565B', -1.0, 0.35, 0.9], ['#36A9E8', -0.9, 0.0, 1.2], ['#3FBF8A', -0.3, -0.3, 0.7]].forEach(([c, x, y, w]) => put(room, new THREE.BoxGeometry(w, 0.03, 0.01), std(c, 0.6), 8.4 + x + w / 2 - 0.4, 2.0 + y, -5.9, false, false));
  // Regale mit Ordnern (Hintergrund)
  const shelf = (x, w = 2.6) => {
    put(room, new THREE.BoxGeometry(w, 0.05, 0.4), std('#3A4468', 0.8), x, 0.45, -5.7); put(room, new THREE.BoxGeometry(w, 0.05, 0.4), std('#3A4468', 0.8), x, 0.0 + 0.9, -5.7);
    put(room, new THREE.BoxGeometry(w, 0.9, 0.05), std('#2C3558', 0.9), x, 0.45, -5.9);
    const cols = ['#E5565B', '#36A9E8', '#7B6CF6', '#3FBF8A', '#E8E1D3', '#8E97AE'];
    for (let i = 0; i < w / 0.075 - 2; i++) put(room, new THREE.BoxGeometry(0.055, 0.32 + ((i * 7) % 3) * 0.03, 0.28), std(cols[(i * 5) % 6], 0.7), x - w / 2 + 0.15 + i * 0.075, 0.475 + 0.17, -5.7, true, false);
  };
  shelf(-7.0); shelf(-1.9, 2.0); shelf(3.0, 3.0); shelf(7.0, 2.2);

  /* ---------------- Hintergrund-Möbel ---------------- */
  const plant = (x, z, s = 1) => {
    const g = new THREE.Group(); g.position.set(x, 0, z); room.add(g);
    put(g, new THREE.CylinderGeometry(0.2 * s, 0.15 * s, 0.38 * s, 18), std('#B88B5E', 0.8), 0, 0.19 * s, 0);
    put(g, new THREE.CylinderGeometry(0.19 * s, 0.19 * s, 0.03, 18), std('#2A2018', 1), 0, 0.38 * s, 0, false, false);
    const lm = std('#2F7A63', 0.75), lm2 = std('#3F9275', 0.75);
    for (let i = 0; i < 9; i++) { const a = i * 2.4, h = (0.55 + (i % 4) * 0.12) * s; const l = put(g, new THREE.SphereGeometry(0.11 * s, 12, 10), i % 2 ? lm : lm2, Math.sin(a) * 0.1 * s, 0.4 * s + h * 0.55, Math.cos(a) * 0.1 * s); l.scale.set(0.55, h * 4.2, 0.3); l.rotation.set(Math.cos(a) * 0.35, a, Math.sin(a) * 0.35); }
    return g;
  };
  plant(-2.6, -5.4, 1.4); plant(2.7, -5.45, 1.5); plant(8.9, -4.6, 1.2); plant(-9.6, -4.2, 1.3); plant(-0.3, -0.2, 0.9);
  const cabinet = (x, z) => { put(room, rbox(0.55, 1.15, 0.65, 0.02), std('#3A4468', 0.6, 0.2), x, 0.575, z); [0.3, 0.6, 0.9].forEach((y) => put(room, new THREE.BoxGeometry(0.2, 0.03, 0.02), std('#C7CCD6', 0.4, 0.6), x, y, z + 0.33, false, false)); };
  cabinet(-3.6, -5.5); cabinet(-3.0, -5.5); cabinet(5.4, -5.5);
  // Besprechungsecke (rechts hinten)
  put(room, new THREE.CylinderGeometry(0.9, 0.9, 0.05, 36), std('#D9BC93', 0.6), 9.0, 0.72, -1.2); put(room, new THREE.CylinderGeometry(0.07, 0.07, 0.7, 12), std('#2A3148', 0.5, 0.4), 9.0, 0.36, -1.2);
  for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + 0.5; const c = new THREE.Group(); c.position.set(9.0 + Math.sin(a) * 1.25, 0, -1.2 + Math.cos(a) * 1.25); c.rotation.y = a + Math.PI; room.add(c); put(c, rbox(0.46, 0.06, 0.46, 0.02), std(['#E5565B', '#36A9E8', '#3FBF8A', '#E8B04A'][i], 0.8), 0, 0.45, 0); put(c, rbox(0.46, 0.42, 0.05, 0.02), std(['#E5565B', '#36A9E8', '#3FBF8A', '#E8B04A'][i], 0.8), 0, 0.68, -0.22); put(c, new THREE.CylinderGeometry(0.03, 0.03, 0.4, 8), std('#14171F', 0.5, 0.3), 0, 0.22, 0); }
  // Teeküche (hinten links), Drucker
  put(room, rbox(2.2, 0.9, 0.7, 0.03), std('#323E64', 0.6), -9.4, 0.45, -3.5); put(room, rbox(2.25, 0.05, 0.75, 0.02), std('#E8E1D3', 0.4), -9.4, 0.92, -3.5);
  put(room, rbox(0.34, 0.45, 0.3, 0.03), std('#14171F', 0.4, 0.3), -9.0, 1.15, -3.5); put(room, new THREE.BoxGeometry(0.22, 0.03, 0.2), std('#E5565B', 0.5), -9.0, 1.2, -3.35, false, false);
  put(room, rbox(0.7, 0.4, 0.55, 0.03), std('#C7CCD6', 0.5), 7.3, 0.95, -5.4); put(room, rbox(0.8, 0.75, 0.6, 0.03), std('#3A4468', 0.6), 7.3, 0.375, -5.4);

  /* ---------------- Arbeitsplätze ---------------- */
  const desks = {};
  const colorsChair = { tom: '#2A3E78', lena: '#1F5F52', anna: '#4A3FA8', jonas: '#3A4468', mira: '#8A4F24', ben: '#3A4468', aylin: '#8A2F57' };
  const genericScr = (v) => canvasTex(256, 172, (g, w, h) => { g.fillStyle = ['#E9ECF2', '#F4EEE3', '#DDE6F4'][v % 3]; g.fillRect(0, 0, w, h); g.fillStyle = ['#3B6FD4', '#1E9E6A', '#7B6CF6'][v % 3]; g.fillRect(0, 0, w, 18); for (let i = 0; i < 7; i++) { g.fillStyle = 'rgba(31,37,50,.2)'; g.fillRect(14, 32 + i * 18, 60 + ((i * 53 + v * 31) % 150), 7); } g.fillStyle = ['#E5565B', '#36A9E8', '#E8B04A'][v % 3]; g.fillRect(150, 70, 80, 70); });
  for (const key of Object.keys(DESKS)) {
    const L = deskLayout(key), g = new THREE.Group(); g.position.copy(L.D.pos); g.rotation.y = L.D.yaw; room.add(g);
    const sx = L.m;                                              // Spiegelung der Aufstellung
    const gx = new THREE.Group(); gx.scale.x = 1; g.add(gx);
    // Teppich unter dem Arbeitsplatz
    if (!L.D.extra) put(gx, rbox(2.9, 0.02, 2.6, 0.01), std(key === 'tom' ? '#33406A' : key === 'lena' ? '#2F4F55' : '#3A3A63', 1), 0, 0.012, -0.1, false, true);
    // Tisch
    put(gx, rbox(1.7, 0.045, 0.85, 0.014), std('#C9A982', 0.6), 0, DESK_H - 0.0225, 0);
    put(gx, new THREE.BoxGeometry(1.64, 0.04, 0.8), std('#B8946B', 0.7), 0, DESK_H - 0.065, 0, true, false);
    const frame = std('#262D45', 0.5, 0.3);
    put(gx, new THREE.BoxGeometry(0.05, DESK_H - 0.05, 0.75), frame, -0.8, (DESK_H - 0.05) / 2, 0); put(gx, new THREE.BoxGeometry(0.05, DESK_H - 0.05, 0.75), frame, 0.8, (DESK_H - 0.05) / 2, 0);
    put(gx, new THREE.BoxGeometry(1.6, 0.4, 0.03), frame, 0, DESK_H - 0.27, -0.36);
    // Schubladenblock (auf der Monitor-Seite, spiegelt mit)
    put(gx, rbox(0.42, 0.55, 0.68, 0.02), std('#3A4468', 0.6), sx * 0.58, 0.275, 0.0); [0.12, 0.28, 0.44].forEach((y) => put(gx, new THREE.BoxGeometry(0.14, 0.02, 0.02), std('#C7CCD6', 0.4, 0.6), sx * 0.58, y, 0.35, false, false));

    // Monitor (Rahmen + Fuß); der Bildschirm selbst ist ein Anker (Welt-Eckpunkte → Projektion der DOM-Oberfläche)
    const mon = new THREE.Group(); mon.position.copy(L.mon.clone().sub(L.D.pos)); mon.rotation.y = L.monYaw - L.D.yaw; g.add(mon);
    const ms = std('#10131B', 0.35, 0.4);
    put(mon, new THREE.CylinderGeometry(0.11, 0.12, 0.018, 24), std('#8F96A8', 0.4, 0.6), 0, 0.009, 0); put(mon, new THREE.BoxGeometry(0.05, MON.standH, 0.03), std('#8F96A8', 0.4, 0.6), 0, MON.standH / 2, -0.03);
    const head = new THREE.Group(); head.position.set(0, MON.standH + MON.h / 2 + 0.02, 0); head.rotation.x = -0.05; mon.add(head);
    put(head, rbox(MON.w + 0.04, MON.h + 0.04, 0.035, 0.014), ms, 0, 0, 0);
    const isX = !!L.D.extra, scr = new THREE.Mesh(new THREE.PlaneGeometry(MON.w, MON.h), isX ? new THREE.MeshBasicMaterial({ map: genericScr(Object.keys(DESKS).indexOf(key)), toneMapped: false, color: '#9AA0B4' }) : new THREE.MeshBasicMaterial({ color: '#1C2640', toneMapped: false })); scr.position.z = 0.0185; head.add(scr);
    // Haftnotizen am Monitorrand
    [['#F3D97A', -0.28, 0.2, 0.1], ['#F2A6B8', -0.31, 0.08, -0.12]].forEach(([c, x, y, r]) => { const n = new THREE.Mesh(new THREE.PlaneGeometry(0.06, 0.06), new THREE.MeshStandardMaterial({ map: noteTex(c), roughness: 0.9 })); n.position.set(x * (MON.w / 0.62), y * (MON.h / 0.42) + MON.h * 0.0, 0.0195 + 0.001); n.rotation.z = r; n.castShadow = true; head.add(n); });
    // Tastatur + Maus
    const kb = new THREE.Group(); kb.position.copy(L.kbd.clone().sub(L.D.pos)); kb.position.y = DESK_H; kb.rotation.y = L.kbdYaw - L.D.yaw; g.add(kb);
    put(kb, rbox(0.43, 0.016, 0.15, 0.006), std('#2B3042', 0.5), 0, 0.008, 0); const kt = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.125), new THREE.MeshStandardMaterial({ map: kbdTex, roughness: 0.6 })); kt.rotation.x = -Math.PI / 2; kt.position.y = 0.0172; kb.add(kt);
    const mo = put(g, new THREE.SphereGeometry(0.03, 16, 12), std('#2B3042', 0.4), L.mouse.x - L.D.pos.x, DESK_H + 0.012, L.mouse.z - L.D.pos.z); mo.scale.set(0.8, 0.5, 1.3);
    // Tasse, Notizblock, Stifte
    const mug = new THREE.Group(); mug.position.copy(L.mug.clone().sub(L.D.pos)); g.add(mug); put(mug, new THREE.CylinderGeometry(0.04, 0.036, 0.09, 18), std('#E8E1D3', 0.5), 0, 0.045, 0); put(mug, new THREE.TorusGeometry(0.03, 0.007, 8, 14, Math.PI), std('#E8E1D3', 0.5), 0.04, 0.05, 0).rotation.z = -Math.PI / 2;
    put(mug, new THREE.CylinderGeometry(0.034, 0.034, 0.004, 14), std('#3A2418', 0.3), 0, 0.085, 0, false, false);
    put(g, rbox(0.21, 0.012, 0.3, 0.004), std('#F4F1EA', 0.9), sx * -0.55, DESK_H + 0.006, 0.18).rotation.y = sx * 0.3;
    // Stuhl
    const ch = new THREE.Group(); ch.position.copy(L.seat.clone().sub(L.D.pos)); ch.position.y = 0; ch.rotation.y = L.seatYaw - L.D.yaw; g.add(ch);
    const cm = std(colorsChair[key], 0.85), cd = std('#14171F', 0.5, 0.3);
    put(ch, rbox(0.5, 0.07, 0.5, 0.03), cm, 0, SEAT_H - 0.035, 0.0); put(ch, rbox(0.46, 0.5, 0.07, 0.03), cm, 0, SEAT_H + 0.27, -0.25).rotation.x = -0.12;
    put(ch, new THREE.CylinderGeometry(0.03, 0.03, SEAT_H - 0.12, 10), cd, 0, (SEAT_H - 0.12) / 2 + 0.05, 0);
    [-1, 1].forEach((s) => { put(ch, new THREE.BoxGeometry(0.04, 0.025, 0.28), cd, s * 0.27, SEAT_H + 0.17, 0.0); put(ch, new THREE.BoxGeometry(0.03, 0.2, 0.03), cd, s * 0.27, SEAT_H + 0.07, -0.08); });
    for (let i = 0; i < 5; i++) { const a = i * Math.PI * 2 / 5 + 0.3; const arm = put(ch, new THREE.BoxGeometry(0.035, 0.025, 0.3), cd, Math.sin(a) * 0.15, 0.065, Math.cos(a) * 0.15); arm.rotation.y = a; put(ch, new THREE.SphereGeometry(0.03, 10, 8), cd, Math.sin(a) * 0.3, 0.032, Math.cos(a) * 0.3); }

    // Pendelleuchte über dem Platz + Spot
    const pend = new THREE.Group(); pend.position.set(0.0, 0.25, -1.45); g.add(pend);
    put(pend, new THREE.CylinderGeometry(0.006, 0.006, 4, 6), std('#0B0F18'), 0, 3.9, 0, false, false);
    put(pend, new THREE.CylinderGeometry(0.05, 0.3, 0.26, 32, 1, true), new THREE.MeshStandardMaterial({ color: '#CFC7B8', roughness: 0.6, side: THREE.DoubleSide }), 0, 1.98, 0);
    put(pend, new THREE.SphereGeometry(0.09, 16, 12), new THREE.MeshBasicMaterial({ color: '#FFE9C4', toneMapped: false }), 0, 1.9, 0, false, false);
    const spot = new THREE.SpotLight('#FFD8A6', 0, 8, 0.75, 0.6, 1.5); spot.visible = !L.D.extra; spot.position.set(0, 2.15, -1.45); spot.target.position.set(0, 0.7, -0.1); g.add(spot); g.add(spot.target);
    // Bildschirmlicht (kühl; wird in der Szene gefärbt)
    const glow = new THREE.PointLight('#9FB4FF', 0, 3.2, 1.8); glow.visible = !L.D.extra; glow.position.copy(L.mon.clone().sub(L.D.pos)); glow.position.y = DESK_H + 0.35; glow.position.add(new V3(Math.sin(L.monYaw) * 0.35, 0, Math.cos(L.monYaw) * 0.35)); g.add(glow);

    // Anker Bildschirm (Welt)
    head.updateWorldMatrix(true, false); scr.updateWorldMatrix(true, false);
    desks[key] = { key, L, g, chair: ch, monHead: head, scr, spot, glow, mon, kb, mug };
  }

  /* ---------------- Licht ---------------- */
  const hemi = new THREE.HemisphereLight('#B0BBE0', '#3F4560', 1.0); scene.add(hemi);
  const key = new THREE.DirectionalLight('#FFF1DE', 1.5); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -0.0004; key.shadow.normalBias = 0.02;
  const sc = key.shadow.camera; sc.left = -3.6; sc.right = 3.6; sc.top = 3.6; sc.bottom = -3.6; sc.near = 1; sc.far = 30; scene.add(key); scene.add(key.target);
  const rim = new THREE.DirectionalLight('#7F9BFF', 0.7); rim.position.set(-3, 5, -9); scene.add(rim);

  return {
    scene, room, desks, lights: { hemi, key, rim }, clock, win,
    /** Schlüssellicht folgt dem Blickpunkt (Schatten bleibt scharf) */
    focus(target, keyI = 1.5) { key.target.position.copy(target); key.position.copy(target).add(new V3(-3.2, 7.5, 5.2)); key.intensity = keyI; key.target.updateMatrixWorld(); },
  };
}
