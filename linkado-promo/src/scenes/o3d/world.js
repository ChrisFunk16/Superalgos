// ============================================================
// Das 3D-Büro (Vogelperspektive): ein modernes Großraumbüro als schwebendes „Schnittmodell“ über einer Stadt bei Nacht.
// Zwei Reihen Schreibtische – alle Personen sitzen mit dem Rücken zur Kamera und schauen nach Norden auf ihren Bildschirm (Kamera = Over-the-Shoulder von oben), drei Hauptplätze (Tom, Lena, Anna), Teeküche, Besprechungsraum aus Glas, Lounge,
// Fensterfront mit Stadtlichtern, Pflanzen, Regale, Teppiche. Weiche Kontaktschatten kommen aus einer einmal gebackenen Höhenkarte (Draufsicht) → gfx.js withHeightAO.
// Koordinaten: Meter, +Y oben, die Kamera schaut meist aus +Z (Süden) nach Norden (−Z), +X rechts. Rückwand (Fenster) bei z = OFFICE.z0.
// ============================================================
import * as THREE from '../../vendor/three.module.js';
import { woodTextures, carpetTextures, concreteTextures, plankTextures, weaveBump, blobTexture, cityTexture, paperTex, drawTex, toTex, pixCanvas, vnoise, fbm, mulberry, rbox, put, std, phys, lam, glowTexture, withHeightAO, fixNormals, AO, V3 } from './gfx.js';
import * as P from './props.js';
import { M, DESK_H, SEAT_H, MON } from './props.js';

export { DESK_H, SEAT_H, MON };
export const OFFICE = { x0: -12.0, x1: 12.0, z0: -7.4, z1: 6.4, H: 3.1 };
export const SCR_Z = 0.0118;                                           // Bildschirmebene (Kopf-Raum des Monitors), knapp vor dem Glas

/** Aufstellung (Ursprung = Tischmitte am Boden); yaw dreht den Platz um die Hochachse, mirror spiegelt x im Tisch-Raum */
export const DESKS = {
  // hintere Reihe (Fensterseite): Personen sitzen südlich ihres Tisches (Rücken zur Kamera) und blicken nach Norden auf den Bildschirm; yaw π = Blick nach Norden
  jonas: { pos: new V3(-9.8, 0, -3.6), yaw: Math.PI + 0.04, mirror: 1, extra: true },
  tom:   { pos: new V3(-5.9, 0, -3.5), yaw: Math.PI, mirror: -1 },
  mira:  { pos: new V3(-2.3, 0, -3.6), yaw: Math.PI - 0.04, mirror: 1, extra: true },
  lena:  { pos: new V3(1.2, 0, -3.5), yaw: Math.PI, mirror: 1 },
  ben:   { pos: new V3(4.4, 0, -3.6), yaw: Math.PI + 0.05, mirror: -1, extra: true },
  anna:  { pos: new V3(7.7, 0, -3.5), yaw: Math.PI, mirror: -1 },
  aylin: { pos: new V3(10.5, 0, -3.7), yaw: Math.PI - 0.05, mirror: 1, extra: true },
  // vordere Reihe: ebenfalls Blick nach Norden
  sven:  { pos: new V3(-5.2, 0, 1.4), yaw: Math.PI, mirror: 1, extra: true },
  nora:  { pos: new V3(-1.8, 0, 1.6), yaw: Math.PI - 0.04, mirror: -1, extra: true },
  kai:   { pos: new V3(1.6, 0, 1.4), yaw: Math.PI + 0.05, mirror: 1, extra: true },
  lea:   { pos: new V3(5.0, 0, 1.7), yaw: Math.PI, mirror: -1, extra: true },
};
export const MAIN = ['tom', 'lena', 'anna'], EXTRA = Object.keys(DESKS).filter((k) => DESKS[k].extra);

const wrapPi = (a) => Math.atan2(Math.sin(a), Math.cos(a));
/**
 * Geometrie des Arbeitsplatzes (Welt) – gemeinsam für Welt, Figuren und Kameras.
 * Tisch-Raum (vor Spiegelung m): die Person sitzt bei z = −0,70 und blickt nach +z auf den Bildschirm (z = +0,14); ihre rechte Seite ist −x.
 * Heroes sitzen 0,30 neben der Bildschirmmitte (Over-the-Shoulder-Landung am Ende: die Kamera fliegt an der Schulter vorbei vor den Bildschirm).
 * yawFace = Blickrichtung der Person (Welt-Yaw, fwd(yaw) = (sin, 0, cos)); L.kbdYaw = Blickrichtung des Tippenden; L.monYaw = Richtung der Bildschirmnormalen (zur Person / Kamera).
 */
export function deskLayout(key) {
  const D = DESKS[key], m = D.mirror, hero = !D.extra, Yax = new V3(0, 1, 0);
  const toW = (x, y, z) => new V3(x * m, y, z).applyAxisAngle(Yax, D.yaw).add(D.pos);
  const sx = hero ? -0.30 : -0.06, monX = sx + (hero ? 0.44 : 0.06), kbX = sx + (hero ? 0.12 : 0.02);
  const seat = toW(sx, 0, -0.70), mon = toW(monX, DESK_H, 0.14);
  const dMon = wrapPi(Math.atan2(mon.x - seat.x, mon.z - seat.z) - D.yaw);                         // Drehung der Person zum Monitor
  const toSeat = seat.clone().sub(mon), dSeat = wrapPi(Math.atan2(toSeat.x, toSeat.z) - (D.yaw + Math.PI));
  return {
    key, D, toW, m, sx, kbX, monX,
    seat, seatYaw: D.yaw + 0.5 * dMon,
    kbd: toW(kbX, DESK_H + 0.02, -0.28), kbdYaw: D.yaw + 0.3 * dMon,
    mouse: toW(kbX - 0.30, DESK_H + 0.02, -0.24),
    mon, monYaw: D.yaw + Math.PI + (hero ? 0.12 : 0.3) * dSeat,
    phone: toW(kbX - 0.60, DESK_H + 0.006, -0.22),
    mug: toW(kbX + 0.52, DESK_H, -0.22),
    mid: toW(0, DESK_H, 0),
  };
}

/** Stadt bei Nacht in der Draufsicht (Straßenraster, Dächer, Lichtpunkte) – liegt als Hintergrund tief unter dem Büro */
function cityTop({ w = 2048, seed = 9 } = {}) {
  const r = mulberry(seed), cv = document.createElement('canvas'); cv.width = cv.height = w; const g = cv.getContext('2d');
  g.fillStyle = '#060A18'; g.fillRect(0, 0, w, w);
  const bl = 92, st = 16;                                                  // Blockgröße, Straßenbreite
  for (let by = 0; by * (bl + st) < w; by++) for (let bx = 0; bx * (bl + st) < w; bx++) {
    const x = bx * (bl + st) + st, y = by * (bl + st) + st, t = r();
    g.fillStyle = t < 0.25 ? '#0C1530' : t < 0.6 ? '#0A112A' : '#101A38'; g.fillRect(x, y, bl, bl);
    const n = 3 + Math.floor(r() * 6); for (let i = 0; i < n; i++) { g.fillStyle = r() < 0.65 ? `rgba(255,205,135,${0.18 + r() * 0.5})` : `rgba(150,195,255,${0.15 + r() * 0.45})`; g.fillRect(x + r() * (bl - 10), y + r() * (bl - 8), 3 + r() * 6, 3 + r() * 5); }
    if (r() < 0.12) { g.fillStyle = 'rgba(70,130,90,.35)'; g.fillRect(x + 6, y + 6, bl - 12, bl - 12); }
  }
  for (let i = 0; i * (bl + st) < w; i++) {
    const p = i * (bl + st) + st / 2;
    for (const horiz of [true, false]) { g.strokeStyle = 'rgba(255,184,110,.42)'; g.lineWidth = 2.2; g.beginPath(); if (horiz) { g.moveTo(0, p); g.lineTo(w, p); } else { g.moveTo(p, 0); g.lineTo(p, w); } g.stroke(); }
  }
  for (let k = 0; k < 520; k++) { const along = r() * w, lane = Math.floor(r() * (w / (bl + st))) * (bl + st) + st / 2 + (r() < 0.5 ? -3 : 3), horiz = r() < 0.5, len = 8 + r() * 26; g.strokeStyle = r() < 0.5 ? 'rgba(255,240,215,.85)' : 'rgba(255,90,80,.8)'; g.lineWidth = 2.4; g.lineCap = 'round'; g.beginPath(); if (horiz) { g.moveTo(along, lane); g.lineTo(along + len, lane); } else { g.moveTo(lane, along); g.lineTo(lane, along + len); } g.stroke(); }
  for (let k = 0; k < 900; k++) { const x = r() * w, y = r() * w, rad = 2 + r() * 5, gg = g.createRadialGradient(x, y, 0, x, y, rad); const c = r() < 0.7 ? '255,200,130' : '140,190,255'; gg.addColorStop(0, `rgba(${c},.85)`); gg.addColorStop(1, `rgba(${c},0)`); g.fillStyle = gg; g.beginPath(); g.arc(x, y, rad, 0, 7); g.fill(); }
  return toTex(cv, { aniso: 4 });
}

export function buildWorld(renderer) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#080C1A');

  /* ---------------- Material-Satz ---------------- */
  const oak = woodTextures({ light: '#E7D0A9', dark: '#CBA878', seed: 3, repeat: [1, 1] });
  M.woodTop = std('#ffffff', 0.52, 0, { map: oak.map, bumpMap: oak.bump, bumpScale: 0.6 });
  const oakDark = woodTextures({ light: '#B98A5C', dark: '#8E6338', seed: 8 });
  M.shelfWood = std('#ffffff', 0.55, 0, { map: oakDark.map, bumpMap: oakDark.bump, bumpScale: 0.5 });
  M.deskPanel = lam('#EDEAE3'); M.glowTex = glowTexture(128, 2.0); M.deskFrame = std('#2B3042', 0.45, 0.35);
  M.counterTop = std('#EEF0F4', 0.3, 0.0); M.alu = std('#C9CEDA', 0.34, 0.85); M.aluDark = std('#262B3C', 0.45, 0.6);
  M.mon = std('#10131B', 0.38, 0.35); M.weave = weaveBump({ repeat: [3, 3] }); M.kbBump = weaveBump({ w: 128, h: 128, cells: 16 }); M.paper = paperTex(); M.blobTex = blobTexture(128, 0, 2.2);
  M.glassScreen = new THREE.MeshPhysicalMaterial({ color: '#000', roughness: 0.12, metalness: 0, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, envMapIntensity: 1.4, clearcoat: 0.5 });
  M.glassWall = new THREE.MeshPhysicalMaterial({ color: '#9CC2E4', roughness: 0.05, metalness: 0, transparent: true, opacity: 0.1, side: THREE.DoubleSide, depthWrite: false, envMapIntensity: 1.0 });
  const carpetBlue = carpetTextures({ color: '#8E92AA', seed: 2, repeat: [12, 6.5], seam: 0.85 });
  const floorMat = lam('#ffffff', { map: carpetBlue.map });
  const wallMat = lam('#C9CAD8'), wallDark = lam('#7A8099'), trimMat = lam('#EDEBE6');

  /* ---------------- Umgebungslicht (prozedurales Raum-Environment) ---------------- */
  {
    const env = new THREE.Scene();
    const sph = new THREE.Mesh(new THREE.SphereGeometry(30, 32, 16), new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, uniforms: {}, vertexShader: 'varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }', fragmentShader: 'varying vec3 vP; void main(){ float h = normalize(vP).y; vec3 top = vec3(0.10, 0.12, 0.24), hor = vec3(0.34, 0.38, 0.52), bot = vec3(0.14, 0.13, 0.16); vec3 c = h > 0.0 ? mix(hor, top, pow(h, 0.6)) : mix(hor, bot, pow(-h, 0.5)); gl_FragColor = vec4(c, 1.0); }' })); env.add(sph);
    const panel = (w, h, pos, look, col, k) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(col).multiplyScalar(k), side: THREE.DoubleSide, toneMapped: false })); m.position.copy(pos); m.lookAt(look); env.add(m); };
    panel(14, 6, new V3(0, 6, -16), new V3(0, 0, 0), '#9DB8FF', 1.3);          // Fensterfront (kühl)
    panel(8, 5, new V3(-16, 8, 8), new V3(0, 0, 0), '#FFD6A0', 1.8);           // warmes Licht von vorn links
    panel(10, 2.2, new V3(0, 14, 0), new V3(0, 0, 0), '#FFFFFF', 1.1);         // Deckenband
    panel(6, 4, new V3(16, 6, 6), new V3(0, 0, 0), '#7CA0FF', 0.9);
    const pm = new THREE.PMREMGenerator(renderer); const envTex = pm.fromScene(env, 0.03).texture; pm.dispose();
    // Umgebungslicht nur auf glänzenden Materialien (Metall, Glas, Weißwand) – spart viel Rechenzeit gegenüber scene.environment für alle Materialien
    for (const m of [M.alu, M.aluDark, M.mon, M.glassScreen, M.glassWall]) { m.envMap = envTex; m.needsUpdate = true; }
    M.envTex = envTex;
  }

  /* ---------------- Raum ---------------- */
  const room = new THREE.Group(); scene.add(room);
  const { x0, x1, z0, z1, H } = OFFICE, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, W = x1 - x0, D = z1 - z0;
  put(room, rbox(W + 0.8, 0.5, D + 0.8, 0.06), floorMat, cx, -0.25, cz, false, true).material = floorMat;                         // Bodenplatte
  put(room, rbox(W + 0.5, 0.18, D + 0.5, 0.04), std('#2A2F46', 0.7), cx, -0.58, cz, false, false);                                 // Sockel darunter
  // Boden-Zonen
  const wood = plankTextures({ seed: 4, repeat: [3, 2] });
  const kitchenFloor = put(room, rbox(5.2, 0.02, 6.0, 0.006, 2), lam('#ffffff', { map: wood.map }), -9.4, 0.01, 3.4, false, true);
  const conc = concreteTextures({ color: '#9096A8', seed: 5, repeat: [4, 2] });
  put(room, rbox(5.0, 0.02, 5.6, 0.006, 2), lam('#ffffff', { map: conc.map }), 9.6, 0.01, 2.6, false, true);      // Besprechungsraum
  // Teppiche
  const rugA = drawTex(256, 256, (g, w, h) => { g.fillStyle = '#2E3A5E'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(255,255,255,.1)'; g.lineWidth = 6; for (let i = 1; i < 6; i++) { g.strokeRect(i * 18, i * 18, w - i * 36, h - i * 36); } }, {});
  const rugTex = (c1, c2) => drawTex(256, 256, (g, w, h) => { g.fillStyle = c1; g.fillRect(0, 0, w, h); g.strokeStyle = c2; g.globalAlpha = 0.5; g.lineWidth = 8; g.strokeRect(12, 12, w - 24, h - 24); g.lineWidth = 3; g.strokeRect(26, 26, w - 52, h - 52); }, {});
  const rugMat = (c1, c2) => lam('#ffffff', { map: rugTex(c1, c2) });
  P.rug(room, -5.9, -3.0, 3.3, 3.4, rugMat('#4A5A8C', '#C5D2F5')); P.rug(room, 1.2, -3.0, 3.3, 3.4, rugMat('#3E6F68', '#CDEFE6')); P.rug(room, 7.7, -3.0, 3.3, 3.4, rugMat('#6A5CB0', '#DAD4FA'));
  P.rug(room, -3.9, 4.9, 3.0, 2.2, rugMat('#8A5668', '#F8D2DC'));
  // Wände (hinten Fensterfront, links/rechts Fenster + Wandstücke)
  const wallBuild = (x, z, w, d, yaw = 0) => {
    const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = yaw; room.add(g);
    put(g, rbox(w, 0.9, d, 0.02), wallMat, 0, 0.45, 0); put(g, rbox(w, 0.62, d, 0.02), wallMat, 0, H - 0.31, 0);
    put(g, rbox(w + 0.02, 0.07, d + 0.03, 0.012), trimMat, 0, 0.935, 0); put(g, rbox(w + 0.02, 0.07, d + 0.03, 0.012), trimMat, 0, H - 0.65, 0);
    const n = Math.max(1, Math.round(w / 3.0)); for (let i = 0; i <= n; i++) put(g, rbox(0.14, H, d + 0.04, 0.02), wallMat, -w / 2 + i * w / n, H / 2, 0);
    for (let i = 0; i < n; i++) put(g, rbox(0.045, H - 1.5, 0.05, 0.01), M.aluDark, -w / 2 + (i + 0.5) * w / n, H / 2 + 0.05, 0, false, false);       // Pfosten in den Fenstern
    put(g, rbox(w, 0.04, d + 0.18, 0.015), trimMat, 0, 0.99, d / 2, false, true);                                                                             // Fensterbank (innen)
    return g;
  };
  wallBuild(cx, z0 - 0.15, W + 0.3, 0.3); wallBuild(x0 - 0.15, cz, D, 0.3, Math.PI / 2); wallBuild(x1 + 0.15, cz, D, 0.3, -Math.PI / 2);
  // Stadt unter dem Büro
  const city = new THREE.Mesh(new THREE.PlaneGeometry(140, 140), new THREE.MeshBasicMaterial({ map: cityTop(), toneMapped: false, fog: false })); city.rotation.x = -Math.PI / 2; city.position.set(cx, -16, cz - 8); city.userData.noAO = true; scene.add(city);
  city.material.color.setScalar(0.85);
  // Wandschmuck: Whiteboard, Poster, Uhr
  P.whiteboard(room, -7.9, 1.65, z0 + 0.02, 2.4, 1.2, 0, 3); P.whiteboard(room, 10.6, 1.7, z0 + 0.02, 1.8, 1.0, 0, 7);
  const clock = new THREE.Mesh(new THREE.CircleGeometry(0.3, 40), new THREE.MeshBasicMaterial({ map: drawTex(256, 256, (g) => { g.fillStyle = '#F4F1EA'; g.beginPath(); g.arc(128, 128, 122, 0, 7); g.fill(); g.strokeStyle = '#1F2532'; g.lineWidth = 9; g.stroke(); for (let k = 0; k < 12; k++) { const a = k * Math.PI / 6; g.lineWidth = k % 3 ? 4 : 8; g.beginPath(); g.moveTo(128 + Math.sin(a) * 100, 128 - Math.cos(a) * 100); g.lineTo(128 + Math.sin(a) * 114, 128 - Math.cos(a) * 114); g.stroke(); } const hand = (a, l, wd) => { g.lineWidth = wd; g.lineCap = 'round'; g.beginPath(); g.moveTo(128, 128); g.lineTo(128 + Math.sin(a) * l, 128 - Math.cos(a) * l); g.stroke(); }; hand((9 + 13 / 60) * Math.PI / 6, 60, 9); hand(13 * Math.PI / 30, 90, 6); }) })); clock.position.set(-1.0, 2.55, z0 + 0.03); room.add(clock);
  // Regale & Schränke an der Rückwand
  P.bookshelf(room, -10.3, z0 + 0.2, 2.2, 1.9, 0, 1); P.bookshelf(room, -3.8, z0 + 0.2, 2.6, 1.9, 0, 2); P.bookshelf(room, 3.4, z0 + 0.2, 2.6, 1.9, 0, 3); P.bookshelf(room, 8.9, z0 + 0.2, 2.2, 1.9, 0, 4);
  P.cabinet(room, -1.2, z0 + 0.4, 1.8, 0.74, 0.45); P.cabinet(room, 5.8, z0 + 0.4, 1.4, 0.74, 0.45);
  P.plant(room, -11.3, -6.6, { kind: 'fig', s: 1.3, seed: 3, potColor: '#E8E1D3' }); P.plant(room, 11.3, -6.5, { kind: 'monstera', s: 1.4, seed: 5, potColor: '#D9C9B2' }); P.plant(room, 0.3, -6.9, { kind: 'snake', s: 1.5, seed: 7, potColor: '#2F3B5C' });
  P.plant(room, -7.9, -6.8, { kind: 'bush', s: 1.2, seed: 11, potColor: '#E9E4D8' }); P.plant(room, 6.2, -6.9, { kind: 'fig', s: 1.2, seed: 13, potColor: '#E8E1D3' });
  // Teeküche (links vorn) + Lounge
  P.kitchen(room, -11.65, 3.0, Math.PI / 2);
  P.sofa(room, -3.8, 5.3, { w: 2.2, color: '#6B7FB0', yaw: Math.PI }); P.coffeeTable(room, -3.8, 3.9); P.floorLamp(room, -2.2, 5.9);
  P.plant(room, -6.3, 5.7, { kind: 'monstera', s: 1.2, seed: 21, potColor: '#E8E1D3' }); P.plant(room, -1.4, 4.4, { kind: 'bush', s: 1.1, seed: 22, potColor: '#D9C9B2' });
  // Besprechungsraum (Glas)
  P.glassWall(room, 9.6, -0.1, 5.0, 0); P.glassWall(room, 7.1, 2.7, 5.6, Math.PI / 2); P.glassWall(room, 9.6, 5.5, 5.0, 0);
  P.meetingTable(room, 9.6, 2.7, { r: 1.0, yaw: 0.1 }); P.whiteboard(room, 11.95, 1.6, 2.7, 2.2, 1.1, -Math.PI / 2, 5);
  P.plant(room, 11.4, 5.0, { kind: 'snake', s: 1.2, seed: 31, potColor: '#2F3B5C' });
  // Hängepflanzen/Deko an der linken Wand
  P.plant(room, -11.4, -1.0, { kind: 'monstera', s: 1.1, seed: 41, potColor: '#E9E4D8' });
  P.cabinet(room, -11.6, -4.9, 1.5, 0.74, 0.45, Math.PI / 2);

  /* ---------------- Arbeitsplätze ---------------- */
  const desks = {};
  const chairCol = { tom: '#2F4A8C', lena: '#1F6F5E', anna: '#5A4FC0', jonas: '#3A4468', mira: '#B0662E', ben: '#3A4468', aylin: '#A83F66', sven: '#2F5A52', nora: '#7A5AA8', kai: '#B8872E', lea: '#3A6FA8' };
  const genScr = (v) => drawTex(256, 172, (g, w, h) => { g.fillStyle = ['#E9ECF2', '#F4EEE3', '#DDE6F4', '#EDEAF6'][v % 4]; g.fillRect(0, 0, w, h); g.fillStyle = ['#3B6FD4', '#1E9E6A', '#7B6CF6', '#E5565B'][v % 4]; g.fillRect(0, 0, w, 18); for (let i = 0; i < 7; i++) { g.fillStyle = 'rgba(31,37,50,.2)'; g.fillRect(14, 32 + i * 18, 60 + ((i * 53 + v * 31) % 150), 7); } g.fillStyle = ['#E5565B', '#36A9E8', '#E8B04A', '#3FBF8A'][v % 4]; g.fillRect(150, 70, 80, 70); }, { aniso: 4 });
  const keys = Object.keys(DESKS);
  for (const key of keys) {
    const L = deskLayout(key), g = new THREE.Group(); g.position.copy(L.D.pos); g.rotation.y = L.D.yaw; room.add(g);
    const m = L.m, lp = (x, y, z) => new V3(x * m, y, z), loc = (w) => g.worldToLocal(w.clone());
    const isX = !!L.D.extra, idx = keys.indexOf(key);
    g.updateMatrixWorld(true);
    P.desk(g, { sx: m, topMat: M.woodTop });
    P.blob(g, 0.0, -0.2, 2.6, 2.0, 0.28);                                                                       // weiche Fläche unter dem Tisch
    // Monitor (der Bildschirm schaut zur Person – und damit zur Kamera hinter ihr)
    const screenMat = isX ? new THREE.MeshBasicMaterial({ map: genScr(idx), toneMapped: false, color: '#B9BFD2' }) : new THREE.MeshBasicMaterial({ color: '#1C2640', toneMapped: false });
    const mon = P.monitor(g, { key, tilt: 0.16, screenMat });
    mon.g.position.copy(loc(L.mon)); mon.g.rotation.y = L.monYaw - L.D.yaw;
    // Tastatur (Funktionsreihe zeigt vom Tippenden weg), Maus rechts davon, Tasse links
    const kb = P.keyboard(g, { base: '#2B3042', cap: '#B7BDCB' }); kb.position.copy(loc(L.kbd)); kb.position.y = DESK_H; kb.rotation.y = L.kbdYaw + Math.PI - L.D.yaw;
    const mo = P.mouse(g, std('#2B3042', 0.4)); mo.position.copy(loc(L.mouse)); mo.position.y = DESK_H; mo.rotation.y = L.kbdYaw + Math.PI - L.D.yaw;
    const mg = P.mug(g, { color: ['#F1EEE6', '#E5565B', '#36A9E8', '#F2C14E'][idx % 4] }); mg.position.copy(loc(L.mug));
    // Platz-spezifische Dinge (Tisch-Raum vor Spiegelung: x rechts der Person = −x, z weg von der Person = +z; Bereich hinter dem Monitor bleibt frei)
    const at = (obj, x, z, yaw = 0, y = DESK_H) => { obj.position.copy(lp(x, y, z)); obj.rotation.y = yaw * m; return obj; };
    const kx = L.kbX;
    at(P.mousepad(g, isX ? '#2A3148' : key === 'lena' ? '#2F3B3A' : key === 'anna' ? '#3A3563' : '#2A3148'), kx - 0.30, -0.24, 0, DESK_H + 0.002);
    let phoneGlow = null;
    if (key === 'tom') {
      at(P.deskPhone(g), kx + 0.62, -0.02, 0.5); at(P.calculator(g), kx - 0.56, 0.14, 0.35); at(P.folderStack(g, 5, undefined, 0.2), kx + 0.74, 0.22, 0.0); at(P.penCup(g), kx - 0.78, -0.02); at(P.waterGlass(g), kx + 0.30, -0.34);
      P.sticky(mon.head, -0.31, 0.19, 0.012, '#F3D97A', 0.07, 0, 0, 0.1); P.sticky(mon.head, -0.33, 0.09, 0.012, '#F2A6B8', 0.065, 0, 0, -0.14); P.sticky(mon.head, 0.30, -0.19, 0.012, '#8FD3C5', 0.06, 0, 0, 0.08);
    } else if (key === 'lena') {
      at(P.laptop(g, { open: 1.95 }), kx + 0.66, -0.06, 0.25); at(P.notebook(g, { yaw: 0.25 }), kx - 0.58, 0.04); at(P.plant(g, 0, 0, { kind: 'succulent', s: 1, seed: 4, potColor: '#E9E4D8' }), kx - 0.78, 0.30);
      at(P.waterGlass(g), kx + 0.34, -0.34); at(P.penCup(g, '#E8E1D3'), kx - 0.40, 0.16);
      P.sticky(mon.head, -0.32, 0.17, 0.012, '#8FD3C5', 0.07, 0, 0, -0.1);
    } else if (key === 'anna') {
      at(P.phoneStand(g), L.monX + 0.52, 0.10, 0); phoneGlow = P.glowSprite(g, ...lp(L.monX + 0.52, DESK_H + 0.12, 0.04).toArray(), 0.55, '#FFB874', 0.0);       // Handy-Ständer rechts neben dem Monitor (das Handy steht in der Szene Annas, nie hinter ihrem Kopf) at(P.headphones(g), kx - 0.45, 0.2, 0.5); at(P.notebook(g, { yaw: -0.3, cover: '#F2A6B8' }), kx - 0.62, 0.0); at(P.plant(g, 0, 0, { kind: 'succulent', s: 1, seed: 6, potColor: '#C9B8E8' }), kx - 0.80, 0.30);
      const mg2 = P.mug(g, { color: '#F2C14E' }); mg2.position.copy(lp(kx + 0.36, DESK_H, -0.34));
      P.sticky(mon.head, -0.34, 0.2, 0.012, '#F3D97A', 0.07, 0, 0, 0.12); P.sticky(mon.head, -0.34, 0.1, 0.012, '#F2A6B8', 0.07, 0, 0, -0.08); P.sticky(mon.head, -0.34, 0.0, 0.012, '#A9C4F5', 0.07, 0, 0, 0.05); P.sticky(mon.head, 0.34, 0.18, 0.012, '#F3D97A', 0.06, 0, 0, -0.1);
      P.sticky(g, (kx + 0.30) * m, DESK_H + 0.002, -0.05, '#F3D97A', 0.075, -Math.PI / 2, 0, 0.2); P.sticky(g, (kx + 0.46) * m, DESK_H + 0.002, -0.06, '#F2A6B8', 0.075, -Math.PI / 2, 0, -0.1);
    } else {
      at(P.notebook(g, { yaw: 0.2 * idx }), kx - 0.58, 0.0); if (idx % 2) at(P.plant(g, 0, 0, { kind: 'succulent', s: 1, seed: idx, potColor: '#E9E4D8' }), kx + 0.7, 0.2); else at(P.penCup(g), kx + 0.7, 0.04);
    }
    // Stuhl (rotiert später mit der Figur)
    const ch = new THREE.Group(); ch.position.copy(lp(-0.47, 0, -0.66)); ch.position.set(...L.seat.clone().sub(L.D.pos).applyAxisAngle(new V3(0, 1, 0), -L.D.yaw).toArray()); ch.rotation.y = L.seatYaw - L.D.yaw; g.add(ch);
    P.chair(ch, { color: chairCol[key] });
    P.blob(ch, 0, 0, 1.15, 1.15, 0.45, 0, 0.004);
    // Schreibtischlampe (nur Hauptplätze)
    let lampG = null;
    if (!isX) { lampG = P.deskLamp(g, { color: key === 'tom' ? '#E8864A' : key === 'lena' ? '#6AB9A8' : '#7B6CF6' }); lampG.position.copy(lp(kx - 0.74, DESK_H, 0.28)); lampG.rotation.y = 0.5 * m + Math.PI; }
    // Anker für das Folge-Licht (Spot über dem Platz, Bildschirmlicht) + Lichtflecken (additiv: Pfütze am Boden, Bildschirmschein auf dem Tisch, Lampen-Halo)
    g.updateMatrixWorld(true);
    const sg = L.monYaw - L.D.yaw, spotPos = g.localToWorld(new V3(0.1 * m, 2.9, -2.0)), spotTgt = g.localToWorld(new V3(0.05, 0.7, -0.3)), glowPos = g.localToWorld(mon.g.position.clone().add(new V3(Math.sin(sg) * 0.38, 0.4, Math.cos(sg) * 0.38)));
    const pool = isX ? null : P.glowDecal(g, 0.05, 0.02, -0.4, 4.6, 3.8, '#FFDDB0', 0.0);
    const screenGlow = P.glowDecal(g, mon.g.position.x + Math.sin(sg) * 0.34, DESK_H + 0.004, mon.g.position.z + Math.cos(sg) * 0.34, 0.95, 0.62, isX ? '#8FA8FF' : '#9FB4FF', isX ? 0.16 : 0.0, -sg);
    let halo = null; if (lampG) halo = P.glowSprite(lampG.userData.head, 0, -0.03, 0, 0.34, '#FFD7A0', 0.0);
    mon.head.updateWorldMatrix(true, false);
    desks[key] = { key, L, g, chair: ch, monHead: mon.head, scr: mon.scr, spotPos, spotTgt, glowPos, pool, screenGlow, halo, phoneGlow, mon: mon.g, kb, mug: mg, lamp: lampG, screenMat };
  }

  fixNormals(room);

  /* ---------------- Licht ---------------- */
  const hemi = new THREE.HemisphereLight('#A8B6DC', '#77708A', 0.9); scene.add(hemi);
  const key = new THREE.DirectionalLight('#FFE9CF', 2.0); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -0.0003; key.shadow.normalBias = 0.025; key.shadow.radius = 3.5;
  const sc = key.shadow.camera; sc.left = -3.6; sc.right = 3.6; sc.top = 3.6; sc.bottom = -3.6; sc.near = 1; sc.far = 40; scene.add(key); scene.add(key.target);
  const follow = { spot: new THREE.SpotLight('#FFE9D2', 0, 10, 0.66, 0.95, 1.1), glow: new THREE.PointLight('#9FB4FF', 0, 3.4, 1.8) }; scene.add(follow.spot, follow.spot.target, follow.glow);
  const fill = new THREE.DirectionalLight('#7A94FF', 0.5); fill.position.set(6, 6, -8); scene.add(fill);
  const rim = new THREE.DirectionalLight('#FFC9A0', 0.6); rim.position.set(-3, 5, -9); scene.add(rim);

  /* ---------------- Höhenfeld für weiche Kontaktschatten (einmalig gebacken) ---------------- */
  room.traverse((o) => { if (o.isMesh && !o.userData.noAO) { const ms = Array.isArray(o.material) ? o.material : [o.material]; ms.forEach((mm) => { if (mm.isMeshStandardMaterial || mm.isMeshPhysicalMaterial || mm.isMeshLambertMaterial) { if (!(mm.transparent && mm.blending === THREE.AdditiveBlending) && !(mm.transparent && mm.opacity < 0.5)) withHeightAO(mm); } }); } });
  const hf = (() => {
    const wpx = 2048, hpx = Math.round(wpx * (D + 0.8) / (W + 0.8));
    const rt = new THREE.WebGLRenderTarget(wpx, hpx, { type: THREE.HalfFloatType, format: THREE.RGBAFormat, minFilter: THREE.LinearMipmapLinearFilter, magFilter: THREE.LinearFilter, generateMipmaps: true, depthBuffer: true });
    const cam = new THREE.OrthographicCamera(-(W + 0.8) / 2, (W + 0.8) / 2, (D + 0.8) / 2, -(D + 0.8) / 2, 0.1, 80); cam.position.set(cx, 40, cz); cam.up.set(0, 0, -1); cam.lookAt(cx, 0, cz); cam.updateMatrixWorld(true);
    const mat = new THREE.ShaderMaterial({ vertexShader: 'varying float vY; void main(){ vec4 p = vec4(position, 1.0);\n#ifdef USE_INSTANCING\np = instanceMatrix * p;\n#endif\n vec4 wp = modelMatrix * p; vY = wp.y; gl_Position = projectionMatrix * viewMatrix * wp; }', fragmentShader: 'varying float vY; void main(){ gl_FragColor = vec4(max(vY, 0.0), 0.0, 0.0, 1.0); }' });
    const hidden = []; room.traverse((o) => { if (o.isMesh && (o.userData.noAO || (o.material && (o.material.transparent && o.material.blending !== THREE.NormalBlending || o.material.transparent && o.material.opacity < 0.6)))) { if (o.visible) { o.visible = false; hidden.push(o); } } });
    const bgV = scene.background, sc2 = scene.environment; scene.background = null; const cityVis = city.visible; city.visible = false;
    const prevT = renderer.getRenderTarget(), prevCol = renderer.getClearColor(new THREE.Color()), prevA = renderer.getClearAlpha(); renderer.setClearColor(0x000000, 1);
    scene.overrideMaterial = mat; renderer.setRenderTarget(rt); renderer.clear(); renderer.render(scene, cam); scene.overrideMaterial = null; renderer.setRenderTarget(prevT); renderer.setClearColor(prevCol, prevA);
    hidden.forEach((o) => { o.visible = true; }); scene.background = bgV; city.visible = cityVis;
    AO.uHF.value = rt.texture; AO.uHFRect.value.set(cx - (W + 0.8) / 2, cz - (D + 0.8) / 2, 1 / (W + 0.8), 1 / (D + 0.8)); AO.uHFInfo.value.set(wpx / (W + 0.8), hpx / (D + 0.8));
    AO.rt = rt; return rt;
  })();

  return {
    scene, room, desks, lights: { hemi, key, fill, rim, spot: follow.spot, glow: follow.glow }, city, AO, floorMat,
    /** Schlüssellicht folgt dem Blickpunkt (Schatten bleibt scharf); ext = halbe Kantenlänge der Schattenkarte */
    focus(target, keyI = 2.0, ext = 3.6, dir = new V3(-6.0, 6.5, 2.5)) { key.target.position.copy(target); key.position.copy(target).add(dir); key.intensity = keyI; const s = key.shadow.camera; s.left = -ext; s.right = ext; s.top = ext; s.bottom = -ext; s.updateProjectionMatrix(); key.target.updateMatrixWorld(); },
  };
}
