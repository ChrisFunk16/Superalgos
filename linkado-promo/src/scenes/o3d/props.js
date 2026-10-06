// ============================================================
// Requisiten für das 3D-Büro: Schreibtisch, Stuhl, Monitor, Tastatur, Pflanzen, Lampen, Regale, Küche, Besprechungsraum, Sofa, Teppiche …
// Weiche, abgerundete Formen (RoundedBox), Materialien aus gfx.js. Alle Maße in Metern, Ursprung je Objekt am Boden bzw. in der Mitte.
// ============================================================
import * as THREE from '../../vendor/three.module.js';
import { rbox, put, std, phys, lam, V3, mulberry, drawTex, toTex, keyboardTex, paperTex, noteTex, weaveBump, blobTexture, glowTexture } from './gfx.js';

export const DESK_H = 0.74, SEAT_H = 0.46;
export const MON = { w: 0.66, h: 0.66 * 996 / 1480, standH: 0.19 };

/** zentrale Materialien (werden von world.js gesetzt) */
export const M = {};

/* ---------------------------------------------------------------- Teppiche & Boden-Elemente */
export function rug(parent, x, z, w, d, tex, yaw = 0) {
  const m = new THREE.Mesh(rbox(w, 0.014, d, 0.006, 2), tex); m.position.set(x, 0.007, z); m.rotation.y = yaw; m.receiveShadow = true; m.castShadow = false; parent.add(m); return m;
}
export function blob(parent, x, z, w, d, op = 0.5, yaw = 0, y = 0.017) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshBasicMaterial({ map: M.blobTex, transparent: true, opacity: op, depthWrite: false, color: '#000' }));
  m.rotation.x = -Math.PI / 2; m.rotation.z = yaw; m.position.set(x, y, z); m.renderOrder = 1; m.userData.noAO = true; parent.add(m); return m;
}

/** Lichtfleck auf dem Boden/Tisch (additiv, wirft kein Licht, färbt nur) */
export function glowDecal(parent, x, y, z, w, d, color = '#FFD9A8', op = 0.3, yaw = 0) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshBasicMaterial({ map: M.glowTex, color, transparent: true, opacity: op, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
  m.rotation.x = -Math.PI / 2; m.rotation.z = yaw; m.position.set(x, y, z); m.renderOrder = 2; m.userData.noAO = true; m.castShadow = false; m.receiveShadow = false; parent.add(m); return m;
}
/** Leucht-Halo (immer zur Kamera gedreht) */
export function glowSprite(parent, x, y, z, size = 0.3, color = '#FFD9A0', op = 0.5) {
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: M.glowTex, color, transparent: true, opacity: op, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
  sp.scale.set(size, size, 1); sp.position.set(x, y, z); sp.userData.noAO = true; parent.add(sp); return sp;
}

/* ---------------------------------------------------------------- Bildschirm */
/** Monitor mit dünnem Rahmen, Rückschale, Standfuß; liefert { g, head, scr } – scr = Schirmfläche (z-Richtung = Blickrichtung) */
export function monitor(parent, { key = 'x', tilt = 0.14, screenMat, w = MON.w, h = MON.h, glass = true } = {}) {
  const g = new THREE.Group(); parent.add(g);
  put(g, new THREE.CylinderGeometry(0.115, 0.125, 0.014, 40), M.alu, 0, 0.007, 0.0).scale.set(1, 1, 0.78);
  put(g, rbox(0.06, MON.standH, 0.022, 0.008), M.alu, 0, MON.standH / 2 + 0.004, -0.04);
  const head = new THREE.Group(); head.position.set(0, MON.standH + h / 2 + 0.03, -0.01); head.rotation.x = -tilt; g.add(head);
  const bez = 0.011;
  put(head, rbox(w + 2 * bez, h + 2 * bez, 0.02, 0.009, 4), M.mon, 0, 0, 0);                    // Rahmen (vorn)
  put(head, rbox(w * 0.9, h * 0.9, 0.022, 0.012, 4), M.aluDark, 0, 0.0, -0.016);              // Rückschale (kleiner, gewölbt)
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(w, h), screenMat); scr.position.z = 0.0105; head.add(scr);
  if (glass) { const gl = new THREE.Mesh(new THREE.PlaneGeometry(w, h), M.glassScreen); gl.position.z = 0.0112; gl.renderOrder = 2; gl.userData.noAO = true; head.add(gl); }
  put(head, new THREE.CircleGeometry(0.0022, 8), new THREE.MeshBasicMaterial({ color: '#7FE3A0' }), w * 0.45, -h / 2 - 0.003, 0.0105, false, false);   // Betriebs-LED
  return { g, head, scr, w, h };
}

/* ---------------------------------------------------------------- Tastatur, Maus, Tasse, Notizbuch, Telefon, Lampe, Pflanze */
export function keyboard(parent, { base = '#2B3042', cap = '#E9ECF2', w = 0.43, d = 0.15 } = {}) {
  const g = new THREE.Group(); parent.add(g);
  put(g, rbox(w + 0.01, 0.017, d + 0.012, 0.007), std('#C8CCD8', 0.45, 0.5), 0, 0.0085, 0);
  const kt = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshStandardMaterial({ map: keyboardTex(base, cap), roughness: 0.55, bumpMap: M.kbBump, bumpScale: 1.5 }));
  kt.rotation.x = -Math.PI / 2; kt.position.y = 0.0176; kt.receiveShadow = true; g.add(kt);
  g.rotation.order = 'YXZ'; return g;
}
export function mouse(parent, mouseMat) {
  const m = new THREE.Group(); parent.add(m);
  const b = put(m, new THREE.SphereGeometry(0.034, 20, 14), mouseMat, 0, 0.014, 0); b.scale.set(0.82, 0.5, 1.35);
  put(m, rbox(0.002, 0.001, 0.02, 0.0005, 1), std('#10131B'), 0, 0.0265, -0.012, false, false);
  return m;
}
export function mousepad(parent, color = '#2A3148', w = 0.26, d = 0.21) { return put(parent, rbox(w, 0.004, d, 0.0018, 2), std(color, 0.95), 0, 0.002, 0, false, true); }
export function mug(parent, { color = '#F1EEE6', coffee = '#3A2418', h = 0.092, r = 0.04 } = {}) {
  const g = new THREE.Group(); parent.add(g);
  const pts = [new THREE.Vector2(0.001, 0), new THREE.Vector2(r * 0.9, 0), new THREE.Vector2(r * 0.97, 0.004), new THREE.Vector2(r, h * 0.5), new THREE.Vector2(r * 1.03, h - 0.003), new THREE.Vector2(r * 1.01, h), new THREE.Vector2(r * 0.9, h), new THREE.Vector2(r * 0.88, h - 0.006), new THREE.Vector2(r * 0.86, 0.006), new THREE.Vector2(0.001, 0.006)];
  put(g, new THREE.LatheGeometry(pts, 28), std(color, 0.35, 0, { side: THREE.DoubleSide }), 0, 0, 0);
  put(g, new THREE.CircleGeometry(r * 0.88, 24), std(coffee, 0.25), 0, h - 0.012, 0, false, false).rotation.x = -Math.PI / 2;
  put(g, new THREE.TorusGeometry(0.027, 0.0065, 8, 18, Math.PI), std(color, 0.35), r + 0.002, h * 0.52, 0).rotation.z = -Math.PI / 2;
  return g;
}
export function notebook(parent, { w = 0.21, d = 0.3, cover = '#E8EAF0', lines = true, yaw = 0 } = {}) {
  const g = new THREE.Group(); g.rotation.y = yaw; parent.add(g);
  put(g, rbox(w, 0.012, d, 0.003, 2), std(cover, 0.7), 0, 0.006, 0);
  const pg = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.92, d * 0.95), new THREE.MeshStandardMaterial({ map: M.paper, roughness: 0.9 })); pg.rotation.x = -Math.PI / 2; pg.position.y = 0.0123; pg.receiveShadow = true; g.add(pg);
  return g;
}
export function sticky(parent, x, y, z, col, s = 0.07, rx = 0, ry = 0, rz = 0) {
  const n = new THREE.Mesh(new THREE.PlaneGeometry(s, s), new THREE.MeshStandardMaterial({ map: noteTex(col), roughness: 0.9, side: THREE.DoubleSide })); n.position.set(x, y, z); n.rotation.set(rx, ry, rz); n.castShadow = true; n.receiveShadow = true; parent.add(n); return n;
}
export function deskPhone(parent, color = '#2B3042') {
  const g = new THREE.Group(); parent.add(g);
  put(g, rbox(0.2, 0.05, 0.24, 0.014), std(color, 0.45), 0, 0.025, 0);
  const hs = put(g, rbox(0.06, 0.04, 0.22, 0.016), std(color, 0.4), -0.045, 0.062, 0); hs.rotation.z = 0.05;
  const pad = put(g, rbox(0.1, 0.006, 0.12, 0.003), std('#8F96A8', 0.5, 0.3), 0.04, 0.051, 0.03, false, false); pad.rotation.x = -0.08;
  return g;
}
export function calculator(parent) {
  const g = new THREE.Group(); parent.add(g);
  put(g, rbox(0.1, 0.014, 0.16, 0.008), std('#3A3F52', 0.5), 0, 0.007, 0);
  put(g, rbox(0.078, 0.003, 0.03, 0.001, 1), new THREE.MeshStandardMaterial({ color: '#B8D6B0', roughness: 0.4, emissive: '#5E8E58', emissiveIntensity: 0.3 }), 0, 0.0155, -0.055, false, false);
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) put(g, rbox(0.016, 0.004, 0.016, 0.003, 1), std(j === 3 ? '#E8864A' : '#D9DCE6', 0.5), -0.033 + i * 0.022, 0.016, -0.015 + j * 0.026, false, false);
  return g;
}
export function folderStack(parent, n = 4, colors = ['#E8B04A', '#6D8FD4', '#E5565B', '#8FD3C5'], yaw = 0) {
  const g = new THREE.Group(); g.rotation.y = yaw; parent.add(g);
  for (let i = 0; i < n; i++) { const m = put(g, rbox(0.23 - (i % 2) * 0.01, 0.014, 0.31, 0.004, 2), std(colors[i % colors.length], 0.7), 0, 0.007 + i * 0.0145, 0); m.rotation.y = (i - n / 2) * 0.05; }
  return g;
}
export function penCup(parent, color = '#2B3042') {
  const g = new THREE.Group(); parent.add(g);
  put(g, new THREE.CylinderGeometry(0.03, 0.028, 0.09, 20, 1, true), std(color, 0.5, 0.2, { side: THREE.DoubleSide }), 0, 0.045, 0);
  put(g, new THREE.CylinderGeometry(0.028, 0.028, 0.004, 16), std(color, 0.5), 0, 0.002, 0);
  [['#E5565B', 0.012, 0.0, 0.15], ['#36A9E8', -0.01, 0.006, -0.1], ['#3FBF8A', 0.0, -0.012, 0.22]].forEach(([c, x, z, r]) => { const p = put(g, new THREE.CylinderGeometry(0.0035, 0.0035, 0.13, 8), std(c, 0.5), x, 0.1, z); p.rotation.z = r; p.rotation.x = r * 0.5; });
  return g;
}
export function waterGlass(parent) {
  const g = new THREE.Group(); parent.add(g);
  put(g, new THREE.CylinderGeometry(0.031, 0.026, 0.1, 20, 1, true), new THREE.MeshPhysicalMaterial({ color: '#CFE3F2', roughness: 0.05, transparent: true, opacity: 0.35, side: THREE.DoubleSide, depthWrite: false }), 0, 0.05, 0, false, false);
  put(g, new THREE.CylinderGeometry(0.027, 0.0255, 0.062, 20), new THREE.MeshPhysicalMaterial({ color: '#BFD9EE', roughness: 0.05, transparent: true, opacity: 0.5, depthWrite: false }), 0, 0.034, 0, false, false);
  return g;
}
export function headphones(parent, color = '#2B3042', acc = '#E5565B') {
  const g = new THREE.Group(); parent.add(g);
  const band = put(g, new THREE.TorusGeometry(0.085, 0.009, 8, 28, Math.PI), std(color, 0.5), 0, 0.085, 0); band.rotation.z = 0; band.rotation.x = 0;
  [-1, 1].forEach((s) => { const c = put(g, new THREE.CylinderGeometry(0.047, 0.047, 0.032, 24), std(color, 0.55), s * 0.086, 0.088, 0); c.rotation.z = Math.PI / 2; put(g, new THREE.CylinderGeometry(0.03, 0.03, 0.034, 20), std(acc, 0.5), s * 0.086, 0.088, 0).rotation.z = Math.PI / 2; });
  g.rotation.x = Math.PI / 2 - 0.1; g.position.y = 0.05; const wrap = new THREE.Group(); wrap.add(g); parent.add(wrap); return wrap;
}
export function tabletDev(parent, color = '#1E2536') {
  const g = new THREE.Group(); parent.add(g);
  put(g, rbox(0.17, 0.008, 0.24, 0.01), std('#C9CDD8', 0.4, 0.6), 0, 0.004, 0);
  put(g, new THREE.PlaneGeometry(0.155, 0.225), new THREE.MeshStandardMaterial({ color, roughness: 0.2, emissive: '#35508A', emissiveIntensity: 0.55 }), 0, 0.0085, 0, false, false).rotation.x = -Math.PI / 2;
  return g;
}
/** Handy-Ständer (Schale + Rückenlehne, zeigt nach +z; das Handy lehnt etwa 18° nach hinten) – das Handy selbst gehört zur Figur (figure.js, Pose aus actors.js) */
export function phoneStand(parent) {
  const g = new THREE.Group(); parent.add(g);
  put(g, rbox(0.1, 0.012, 0.075, 0.005, 2), std('#2B3042', 0.45, 0.5), 0, 0.006, 0.0);
  put(g, rbox(0.1, 0.02, 0.012, 0.004, 2), std('#2B3042', 0.45, 0.5), 0, 0.019, -0.034);                    // Anschlag vorn (Kante, auf der das Handy steht)
  const back = put(g, rbox(0.07, 0.15, 0.008, 0.004, 2), std('#3A4158', 0.45, 0.5), 0, 0.085, 0.003); back.rotation.x = 0.32;      // Rückenlehne, nach hinten geneigt (Kopf zeigt nach +z)
  return g;
}
export function laptop(parent, { color = '#C7CCD8', open = 1.95, screenMat } = {}) {
  const g = new THREE.Group(); parent.add(g);
  put(g, rbox(0.33, 0.014, 0.23, 0.007), std(color, 0.4, 0.7), 0, 0.007, 0);
  const kt = new THREE.Mesh(new THREE.PlaneGeometry(0.28, 0.1), new THREE.MeshStandardMaterial({ map: keyboardTex('#1D2230', '#2E3447'), roughness: 0.6 })); kt.rotation.x = -Math.PI / 2; kt.position.set(0, 0.0145, -0.035); g.add(kt);
  put(g, rbox(0.1, 0.0015, 0.065, 0.004, 1), std('#B5BAC8', 0.35, 0.5), 0, 0.0145, 0.065, false, false);
  const hinge = new THREE.Group(); hinge.position.set(0, 0.014, -0.115); hinge.rotation.x = -(open - Math.PI / 2) + 0.0; g.add(hinge);
  const lid = new THREE.Group(); hinge.add(lid); lid.rotation.x = 0;
  put(lid, rbox(0.33, 0.22, 0.01, 0.006), std(color, 0.4, 0.7), 0, 0.11, 0);
  const s = new THREE.Mesh(new THREE.PlaneGeometry(0.31, 0.2), screenMat || new THREE.MeshBasicMaterial({ color: '#1C2640' })); s.position.set(0, 0.11, 0.0055); s.rotation.y = 0; lid.add(s);
  g.userData.hinge = hinge; g.userData.screen = s; return g;
}
export function deskLamp(parent, { color = '#E8864A', on = true } = {}) {
  const g = new THREE.Group(); parent.add(g);
  const dark = std('#2B3042', 0.42, 0.45);
  put(g, new THREE.CylinderGeometry(0.075, 0.08, 0.016, 28), dark, 0, 0.008, 0);
  const a1 = put(g, new THREE.CylinderGeometry(0.0065, 0.0065, 0.36, 10), dark, -0.02, 0.19, 0); a1.rotation.z = 0.28;
  put(g, new THREE.SphereGeometry(0.012, 10, 8), dark, -0.075 + 0.0, 0.365, 0);
  const j = new THREE.Group(); j.position.set(-0.12, 0.36, 0); g.add(j);
  const a2 = put(j, new THREE.CylinderGeometry(0.0065, 0.0065, 0.3, 10), dark, 0.09, 0.03, 0); a2.rotation.z = -1.25;
  const hd = new THREE.Group(); hd.position.set(0.23, 0.095, 0); hd.rotation.z = -0.5; j.add(hd);
  const prof = [new THREE.Vector2(0.008, 0.052), new THREE.Vector2(0.03, 0.05), new THREE.Vector2(0.052, 0.036), new THREE.Vector2(0.068, 0.008), new THREE.Vector2(0.074, -0.026), new THREE.Vector2(0.071, -0.03), new THREE.Vector2(0.064, -0.024), new THREE.Vector2(0.048, 0.0), new THREE.Vector2(0.03, 0.03), new THREE.Vector2(0.008, 0.036)];
  put(hd, new THREE.LatheGeometry(prof, 32), std(color, 0.38, 0.25, { side: THREE.DoubleSide }), 0, 0, 0);
  put(hd, new THREE.SphereGeometry(0.02, 12, 8), new THREE.MeshBasicMaterial({ color: on ? '#FFF0D2' : '#8A8678', toneMapped: false }), 0, -0.014, 0, 1, 1, 1, false, false);
  g.userData.head = hd; return g;
}

/* ---------------------------------------------------------------- Pflanzen */
let leafGeo = null;
function getLeaf() {
  if (leafGeo) return leafGeo;
  const w = 6, h = 10, g = new THREE.PlaneGeometry(1, 1, w, h), p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const u = p.getX(i) + 0.5, v = p.getY(i) + 0.5;                    // 0..1
    const env = Math.pow(Math.sin(Math.PI * Math.pow(v, 0.75)), 0.8);   // Blattform: spitz zu beiden Enden, breit im ersten Drittel
    const x = (u - 0.5) * env * 0.95, y = v * 1.0, z = -Math.pow(v, 1.8) * 0.45 + (Math.abs(u - 0.5)) * (Math.abs(u - 0.5)) * 0.35 * env;
    p.setXYZ(i, x, y, z);
  }
  g.computeVertexNormals(); leafGeo = g; return g;
}
/** Zimmerpflanze mit Topf: kind = 'monstera' | 'fig' | 'snake' | 'bush' | 'succulent' */
export function plant(parent, x, z, { kind = 'monstera', s = 1, potColor = '#E9E4D8', seed = 1, rot = 0 } = {}) {
  const r = mulberry(seed * 977 + 13), g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = rot; parent.add(g);
  const potH = kind === 'succulent' ? 0.1 : 0.36 * s, potR = kind === 'succulent' ? 0.07 : 0.2 * s;
  const pts = [new THREE.Vector2(0.001, 0), new THREE.Vector2(potR * 0.72, 0), new THREE.Vector2(potR * 0.8, 0.01), new THREE.Vector2(potR, potH * 0.9), new THREE.Vector2(potR * 1.06, potH), new THREE.Vector2(potR * 1.0, potH + 0.012), new THREE.Vector2(potR * 0.9, potH + 0.01), new THREE.Vector2(potR * 0.88, potH - 0.01), new THREE.Vector2(0.001, potH - 0.01)];
  put(g, new THREE.LatheGeometry(pts, 28), std(potColor, 0.55, 0, { side: THREE.DoubleSide }), 0, 0, 0);
  put(g, new THREE.CircleGeometry(potR * 0.9, 20), std('#2A2018', 1), 0, potH - 0.014, 0, false, true).rotation.x = -Math.PI / 2;
  const leaf = getLeaf(); const palette = ['#2F7A4F', '#3C9060', '#276B45', '#4BA06A'];
  const add = (n, fn) => { const im = new THREE.InstancedMesh(leaf, new THREE.MeshStandardMaterial({ roughness: 0.55, side: THREE.DoubleSide, color: '#fff' }), n); const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), c = new THREE.Color();
    for (let i = 0; i < n; i++) { const o = fn(i); e.set(o.rx, o.ry, o.rz, 'YXZ'); q.setFromEuler(e); m.compose(new V3(o.x, o.y, o.z), q, new V3(o.sw, o.sl, 1)); im.setMatrixAt(i, m); c.set(palette[Math.floor(r() * palette.length)]).offsetHSL(0, 0, (r() - 0.5) * 0.06); im.setColorAt(i, c); }
    im.castShadow = true; im.receiveShadow = true; g.add(im); return im; };
  if (kind === 'monstera') add(16, (i) => { const a = i * 2.4 + r() * 0.5, t = i / 16; return { x: Math.sin(a) * 0.04, y: potH + 0.02, z: Math.cos(a) * 0.04, rx: -(0.55 + t * 0.55 + r() * 0.25), ry: a, rz: 0, sw: (0.34 + r() * 0.14) * s, sl: (0.55 + r() * 0.25 + t * 0.15) * s }; });
  else if (kind === 'fig') { const st = put(g, new THREE.CylinderGeometry(0.014, 0.02, 1.05 * s, 8), std('#6B5A44', 0.9), 0, potH + 0.52 * s, 0); add(18, (i) => { const t = i / 18, a = i * 2.2, y = potH + 0.3 * s + t * 0.8 * s; return { x: Math.sin(a) * 0.03, y, z: Math.cos(a) * 0.03, rx: -(0.7 + r() * 0.5), ry: a, rz: 0, sw: (0.36 - t * 0.1) * s, sl: (0.34 - t * 0.08) * s }; }); }
  else if (kind === 'snake') add(12, (i) => { const a = i * 2.6 + r(); return { x: Math.sin(a) * 0.06 * s, y: potH, z: Math.cos(a) * 0.06 * s, rx: -(0.1 + r() * 0.22), ry: a, rz: 0, sw: (0.075 + r() * 0.03) * s, sl: (0.55 + r() * 0.45) * s }; });
  else if (kind === 'bush') add(34, (i) => { const a = i * 2.4 + r(), t = r(); return { x: Math.sin(a) * 0.05 * s, y: potH, z: Math.cos(a) * 0.05 * s, rx: -(0.35 + t * 0.9), ry: a, rz: 0, sw: (0.16 + r() * 0.08) * s, sl: (0.32 + t * 0.28) * s }; });
  else if (kind === 'succulent') { const pm = std('#4FA06C', 0.5); for (let ring = 0; ring < 3; ring++) { const n = 8 - ring * 2; for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2 + ring * 0.6, rr = 0.016 + ring * 0.0, tilt = 1.0 - ring * 0.35; const m = put(g, new THREE.SphereGeometry(1, 10, 8), pm, Math.sin(a) * (0.022 - ring * 0.008), potH + 0.012 + ring * 0.012, Math.cos(a) * (0.022 - ring * 0.008), true, true); m.scale.set(0.0105, 0.0055, 0.034 - ring * 0.008); m.rotation.set(0, a, 0); m.rotateX(-tilt); } } }
  return g;
}

/* ---------------------------------------------------------------- Stuhl */
export function chair(parent, { color = '#4A5470', mesh = false } = {}) {
  const g = new THREE.Group(); parent.add(g);
  const fab = lam(color), dark = std('#1A1E2A', 0.5, 0.3), alu = M.alu;
  put(g, rbox(0.5, 0.075, 0.48, 0.032, 4), fab, 0, SEAT_H - 0.04, 0.0);                                     // Sitz
  const back = new THREE.Group(); back.position.set(0, SEAT_H + 0.02, -0.235); back.rotation.x = -0.14; g.add(back);
  put(back, rbox(0.46, 0.5, 0.06, 0.03, 4), fab, 0, 0.27, 0);                                               // Lehne
  put(back, rbox(0.4, 0.2, 0.03, 0.014, 3), lam('#232838'), 0, 0.15, -0.04);                           // Lordosenstütze (Rückseite)
  put(g, new THREE.CylinderGeometry(0.028, 0.034, SEAT_H - 0.14, 14), alu, 0, (SEAT_H - 0.12) / 2 + 0.07, 0);
  put(g, new THREE.CylinderGeometry(0.05, 0.04, 0.05, 16), dark, 0, SEAT_H - 0.1, 0);
  [-1, 1].forEach((s) => {                                                                                    // Armlehnen
    put(g, rbox(0.045, 0.025, 0.3, 0.012), dark, s * 0.275, SEAT_H + 0.18, 0.0);
    put(g, rbox(0.028, 0.2, 0.028, 0.01), dark, s * 0.275, SEAT_H + 0.075, -0.08);
  });
  for (let i = 0; i < 5; i++) {                                                                               // Fußkreuz
    const a = i * Math.PI * 2 / 5 + 0.3;
    const arm = put(g, rbox(0.04, 0.026, 0.3, 0.012), dark, Math.sin(a) * 0.15, 0.07, Math.cos(a) * 0.15); arm.rotation.y = a;
    put(g, new THREE.SphereGeometry(0.03, 12, 10), dark, Math.sin(a) * 0.3, 0.032, Math.cos(a) * 0.3);
  }
  return g;
}

/* ---------------------------------------------------------------- Schreibtisch (Platte, Beine, Rollcontainer, Kabelkanal) */
export function desk(parent, { sx = 1, topMat, w = 1.64, d = 0.82, pedestal = true } = {}) {
  const g = new THREE.Group(); parent.add(g);
  put(g, rbox(w, 0.036, d, 0.014, 4), topMat, 0, DESK_H - 0.018, 0);
  const frame = M.deskFrame;
  [-1, 1].forEach((s) => put(g, rbox(0.045, DESK_H - 0.04, d * 0.86, 0.012), frame, s * (w / 2 - 0.05), (DESK_H - 0.04) / 2, 0));
  put(g, rbox(w - 0.2, 0.34, 0.022, 0.008), M.deskPanel, 0, DESK_H - 0.22, -d * 0.4);                         // Blende
  put(g, rbox(w - 0.14, 0.026, 0.04, 0.01), frame, 0, DESK_H - 0.05, -d * 0.4 + 0.03);
  if (pedestal) {
    const px = sx * (w / 2 - 0.3);
    put(g, rbox(0.42, 0.56, d * 0.8, 0.02), M.deskPanel, px, 0.30, 0.0);
    [0.12, 0.28, 0.44].forEach((y) => { put(g, rbox(0.38, 0.145, 0.008, 0.01), M.deskPanel, px, y + 0.02, d * 0.4 + 0.002, true, true); put(g, rbox(0.16, 0.012, 0.014, 0.005), M.alu, px, y + 0.065, d * 0.4 + 0.012, false, false); });
  }
  return g;
}

/* ---------------------------------------------------------------- Regal / Schrank / Küche / Sofa / Besprechung */
export function bookshelf(parent, x, z, w = 2.6, h = 1.9, yaw = 0, seed = 1) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = yaw; parent.add(g); const r = mulberry(seed * 31 + 5);
  const wood = M.shelfWood;
  put(g, rbox(w, h, 0.03, 0.01), M.deskPanel, 0, h / 2, -0.17);
  [-1, 1].forEach((s) => put(g, rbox(0.03, h, 0.36, 0.01), wood, s * (w / 2 - 0.015), h / 2, 0));
  const n = 5; for (let k = 0; k <= n; k++) put(g, rbox(w, 0.03, 0.36, 0.01), wood, 0, 0.02 + k * (h - 0.04) / n, 0);
  const cols = ['#E5565B', '#36A9E8', '#7B6CF6', '#3FBF8A', '#E8E1D3', '#8E97AE', '#E8B04A', '#2F3B5C'];
  for (let k = 0; k < n; k++) {
    const y0 = 0.035 + k * (h - 0.04) / n; let xx = -w / 2 + 0.05; const sh = (h - 0.04) / n - 0.04;
    while (xx < w / 2 - 0.12) {
      const t = r();
      if (t < 0.08) { xx += 0.1 + r() * 0.15; continue; }                                    // Lücke
      if (t < 0.16) { const p = put(g, new THREE.CylinderGeometry(0.06, 0.05, 0.12, 14), std(cols[Math.floor(r() * cols.length)], 0.6), xx + 0.07, y0 + 0.06, 0); xx += 0.15; continue; }   // Vase/Box
      const bw = 0.03 + r() * 0.035, bh = Math.min(sh - 0.02, 0.2 + r() * 0.16); put(g, rbox(bw, bh, 0.24, 0.004, 2), std(cols[Math.floor(r() * cols.length)], 0.65), xx + bw / 2, y0 + bh / 2, 0.0, true, false); xx += bw + 0.003;
    }
  }
  return g;
}
export function cabinet(parent, x, z, w = 0.9, h = 0.78, d = 0.45, yaw = 0, color) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = yaw; parent.add(g);
  put(g, rbox(w, h, d, 0.015), color || M.deskPanel, 0, h / 2, 0);
  for (let i = 0; i < 2; i++) put(g, rbox(w / 2 - 0.02, h - 0.06, 0.008, 0.008), color || M.deskPanel, (i - 0.5) * (w / 2), h / 2, d / 2 + 0.002, true, true);
  put(g, rbox(0.012, 0.18, 0.014, 0.005), M.alu, -0.04, h / 2, d / 2 + 0.012, false, false); put(g, rbox(0.012, 0.18, 0.014, 0.005), M.alu, 0.04, h / 2, d / 2 + 0.012, false, false);
  return g;
}
export function sofa(parent, x, z, { w = 2.1, color = '#6B7FB0', yaw = 0 } = {}) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = yaw; parent.add(g);
  const f = lam(color);
  put(g, rbox(w, 0.18, 0.9, 0.06, 5), f, 0, 0.17, 0);                                          // Sockel/Sitzfläche
  for (let i = 0; i < 3; i++) put(g, rbox(w / 3 - 0.04, 0.13, 0.62, 0.055, 5), f, (i - 1) * (w / 3), 0.3, 0.1);       // Sitzkissen
  put(g, rbox(w, 0.5, 0.2, 0.08, 5), f, 0, 0.5, -0.36);                                         // Lehne
  [-1, 1].forEach((s) => put(g, rbox(0.2, 0.34, 0.9, 0.08, 5), f, s * (w / 2 - 0.1), 0.34, 0));          // Armlehnen
  [-1, 1].forEach((sx) => [-1, 1].forEach((sz) => put(g, new THREE.CylinderGeometry(0.025, 0.02, 0.1, 10), M.alu, sx * (w / 2 - 0.12), 0.05, sz * 0.36)));
  return g;
}
export function coffeeTable(parent, x, z, { r = 0.45, color = '#E8E1D3' } = {}) { const g = new THREE.Group(); g.position.set(x, 0, z); parent.add(g); put(g, new THREE.CylinderGeometry(r, r, 0.035, 36), std(color, 0.35), 0, 0.4, 0); put(g, new THREE.CylinderGeometry(0.04, 0.05, 0.38, 14), M.alu, 0, 0.2, 0); put(g, new THREE.CylinderGeometry(0.22, 0.24, 0.02, 24), M.alu, 0, 0.01, 0); return g; }
export function kitchen(parent, x, z, yaw = 0) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = yaw; parent.add(g);
  const body = M.deskPanel, top = M.counterTop;
  put(g, rbox(3.6, 0.86, 0.62, 0.02), std('#2F3B5C', 0.55), 0, 0.43, 0); put(g, rbox(3.66, 0.04, 0.68, 0.014), top, 0, 0.88, 0);
  for (let i = 0; i < 6; i++) put(g, rbox(0.56, 0.78, 0.008, 0.008), std('#394870', 0.5), -1.45 + i * 0.58, 0.43, 0.312, true, true);
  put(g, rbox(0.55, 0.012, 0.4, 0.008), M.alu, 0.55, 0.9, 0.0, false, false);                                       // Spüle
  put(g, new THREE.CylinderGeometry(0.014, 0.014, 0.26, 8), M.alu, 0.55, 1.01, -0.2);
  const cm = new THREE.Group(); cm.position.set(-1.2, 0.9, -0.05); g.add(cm);                                      // Kaffeemaschine
  put(cm, rbox(0.3, 0.38, 0.34, 0.03), std('#232838', 0.35, 0.3), 0, 0.19, 0); put(cm, rbox(0.22, 0.03, 0.24, 0.01), std('#C8CCD8', 0.3, 0.7), 0, 0.395, 0.0); put(cm, new THREE.SphereGeometry(0.012, 8, 6), new THREE.MeshBasicMaterial({ color: '#7FE3A0' }), 0.1, 0.3, 0.172, false, false);
  const fr = new THREE.Group(); fr.position.set(1.65, 0, -0.1); g.add(fr);                                           // Kühlschrank
  put(fr, rbox(0.7, 1.85, 0.7, 0.03), std('#E4E7EE', 0.35, 0.25), 0, 0.93, 0); put(fr, rbox(0.02, 0.5, 0.03, 0.01), M.alu, -0.28, 1.2, 0.37, false, false);
  const ins = new THREE.Group(); ins.position.set(0, 0, 1.45); g.add(ins);                                           // Insel
  put(ins, rbox(2.4, 0.88, 0.9, 0.025), std('#2F3B5C', 0.55), 0, 0.44, 0); put(ins, rbox(2.5, 0.045, 1.0, 0.016), top, 0, 0.9, 0);
  put(ins, new THREE.CylinderGeometry(0.17, 0.12, 0.08, 20), std('#E8B04A', 0.4), -0.6, 0.97, 0.1); [['#E5565B', 0.06, 0.0], ['#7FC96A', -0.04, 0.05], ['#F2C14E', 0.02, -0.06]].forEach(([c, dx, dz]) => put(ins, new THREE.SphereGeometry(0.045, 12, 10), std(c, 0.5), -0.6 + dx, 1.03, 0.1 + dz));
  for (let i = 0; i < 3; i++) { const st = new THREE.Group(); st.position.set(-0.7 + i * 0.7, 0, 0.78); ins.add(st); put(st, new THREE.CylinderGeometry(0.19, 0.19, 0.05, 20), std(['#E5565B', '#36A9E8', '#E8B04A'][i], 0.7), 0, 0.64, 0); put(st, new THREE.CylinderGeometry(0.025, 0.025, 0.6, 8), M.alu, 0, 0.32, 0); put(st, new THREE.CylinderGeometry(0.16, 0.18, 0.02, 20), M.alu, 0, 0.01, 0); }
  return g;
}
export function meetingTable(parent, x, z, { r = 1.15, yaw = 0 } = {}) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = yaw; parent.add(g);
  const top = put(g, new THREE.CylinderGeometry(r, r, 0.045, 48), M.woodTop, 0, 0.73, 0); top.scale.set(1.35, 1, 0.82);
  put(g, new THREE.CylinderGeometry(0.1, 0.14, 0.7, 16), M.alu, 0, 0.35, 0); put(g, new THREE.CylinderGeometry(0.44, 0.48, 0.03, 32), M.alu, 0, 0.015, 0);
  for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2 + 0.52, cx = Math.sin(a) * r * 1.35 * 0.98, cz = Math.cos(a) * r * 0.82 * 1.05; const c = new THREE.Group(); c.position.set(cx, 0, cz); c.rotation.y = a + Math.PI; g.add(c); chair(c, { color: ['#E5565B', '#36A9E8', '#3FBF8A', '#E8B04A', '#7B6CF6', '#D1497A'][i] }); c.scale.setScalar(0.92); }
  folderStack(g, 2, ['#E8E1D3', '#8FD3C5'], 0.3).position.set(-0.4, 0.755, 0.1); notebook(g, { w: 0.2, d: 0.28, cover: '#F4EEE3', yaw: 0.6 }).position.set(0.5, 0.755, 0.1);
  return g;
}
export function glassWall(parent, x, z, len, yaw = 0, { h = 2.4, door = false } = {}) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = yaw; parent.add(g);
  const gl = new THREE.Mesh(new THREE.PlaneGeometry(len, h), M.glassWall); gl.position.y = h / 2 + 0.03; gl.renderOrder = 3; gl.userData.noAO = true; g.add(gl);
  put(g, rbox(len, 0.05, 0.06, 0.012), M.alu, 0, 0.025, 0); put(g, rbox(len, 0.05, 0.06, 0.012), M.alu, 0, h + 0.03, 0);
  const n = Math.max(1, Math.round(len / 1.4)); for (let i = 0; i <= n; i++) put(g, rbox(0.04, h, 0.05, 0.01), M.alu, -len / 2 + i * len / n, h / 2 + 0.03, 0);
  return g;
}
export function whiteboard(parent, x, y, z, w = 2.2, h = 1.2, yaw = 0, seed = 1) {
  const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = yaw; parent.add(g);
  put(g, rbox(w + 0.06, h + 0.06, 0.04, 0.012), M.alu, 0, 0, 0, false, true);
  const r = mulberry(seed * 41), tex = drawTex(512, 280, (c, W, H) => { c.fillStyle = '#F4F6FA'; c.fillRect(0, 0, W, H); c.lineCap = 'round'; c.lineJoin = 'round';
    const cols = ['#E5565B', '#2F6FDE', '#1E9E6A', '#2B3042']; for (let i = 0; i < 7; i++) { c.strokeStyle = cols[i % 4]; c.lineWidth = 4 + r() * 2; c.beginPath(); const x0 = 30 + r() * 300, y0 = 24 + i * 34; c.moveTo(x0, y0); for (let k = 0; k < 5; k++) c.lineTo(x0 + (k + 1) * (18 + r() * 28), y0 + (r() - 0.5) * 12); c.stroke(); }
    c.strokeStyle = '#2F6FDE'; c.lineWidth = 5; c.strokeRect(330, 40, 140, 90); c.beginPath(); c.arc(400, 200, 40, 0, 6.3); c.stroke(); });
  const pl = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.5, envMapIntensity: 0.6 })); pl.position.z = 0.0205; pl.receiveShadow = true; g.add(pl); return g;
}
export function pendantLamp(parent, x, z, { h = 2.5, r = 0.32, color = '#E8E1D3' } = {}) {   // nur für Wandlicht-Szenen (Kamera blickt von oben: hängt außerhalb des Bildes)
  const g = new THREE.Group(); g.position.set(x, h, z); parent.add(g);
  put(g, new THREE.CylinderGeometry(0.004, 0.004, 1.2, 6), std('#0B0F18'), 0, 0.6, 0, false, false);
  put(g, new THREE.CylinderGeometry(0.06, r, 0.24, 36, 1, true), std(color, 0.5, 0, { side: THREE.DoubleSide }), 0, 0, 0);
  return g;
}
export function floorLamp(parent, x, z, color = '#E8E1D3') {
  const g = new THREE.Group(); g.position.set(x, 0, z); parent.add(g);
  put(g, new THREE.CylinderGeometry(0.16, 0.18, 0.02, 24), M.aluDark, 0, 0.01, 0); put(g, new THREE.CylinderGeometry(0.012, 0.012, 1.55, 8), M.aluDark, 0, 0.78, 0);
  put(g, new THREE.CylinderGeometry(0.16, 0.24, 0.3, 28, 1, true), new THREE.MeshStandardMaterial({ color, roughness: 0.7, side: THREE.DoubleSide, emissive: '#FFD9A0', emissiveIntensity: 0.55 }), 0, 1.66, 0, false, false);
  put(g, new THREE.SphereGeometry(0.06, 12, 8), new THREE.MeshBasicMaterial({ color: '#FFF0D2', toneMapped: false }), 0, 1.62, 0, false, false);
  return g;
}
