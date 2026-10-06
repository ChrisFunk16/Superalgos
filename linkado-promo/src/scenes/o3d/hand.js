// ============================================================
// Hände: Handfläche + vier Finger (je drei Glieder) + Daumen (zwei Glieder). Pose über Parameter: curl (Faust), splay (Spreizung), thumb (Daumen anlegen), type (Tipp-Bewegung).
// Hand-Raum: +Z = Richtung der Finger (Unterarmachse), +Y = Handrücken (Handfläche nach unten bei roll 0), +X zur Linken der Person. side: 0 = rechte Hand (Daumen bei +x), 1 = linke Hand (Daumen bei −x).
// ============================================================
import * as THREE from '../../vendor/three.module.js';
import { noise } from './anim.js';

const FINGERS = [   // x-Position an der Handfläche, Länge gesamt, Radius, Krümmungsfaktor
  { x: 0.027, len: 0.068, r: 0.0088, k: 1.0, a: 0.0 },    // Zeigefinger (Seite des Daumens)
  { x: 0.009, len: 0.076, r: 0.0092, k: 1.0, a: 0.0 },
  { x: -0.009, len: 0.07, r: 0.0088, k: 1.05, a: 0.0 },
  { x: -0.026, len: 0.057, r: 0.0082, k: 1.1, a: 0.0 },   // kleiner Finger
];

export function buildHand(side, skinMat, hi = true) {
  const g = new THREE.Group(), th = side === 0 ? 1 : -1;       // Daumenseite
  const add = (parent, geo, px = 0, py = 0, pz = 0, sx = 1, sy = 1, sz = 1) => { const m = new THREE.Mesh(geo, skinMat); m.position.set(px, py, pz); m.scale.set(sx, sy, sz); m.castShadow = true; m.receiveShadow = true; parent.add(m); return m; };
  const caps = (r, len) => { const c = new THREE.CapsuleGeometry(r, Math.max(0.001, len - 2 * r), 4, 8); c.rotateX(Math.PI / 2); c.translate(0, 0, len / 2); return c; };
  // Handfläche: abgerundeter Block + Ballen
  add(g, new THREE.SphereGeometry(0.04, 18, 12), 0, 0, 0.026, 1.0, 0.5, 1.02);
  add(g, new THREE.SphereGeometry(0.034, 16, 10), 0, -0.002, 0.058, 1.12, 0.44, 0.74);
  const fing = [];
  if (hi) {
    FINGERS.forEach((F, fi) => {
      const x = F.x * th, j1 = new THREE.Group(); j1.position.set(x, 0.001, 0.074 - (fi === 3 ? 0.008 : 0) - (fi === 2 ? 0.002 : 0)); g.add(j1);
      const l1 = F.len * 0.45, l2 = F.len * 0.31, l3 = F.len * 0.24;
      add(j1, caps(F.r, l1)); const j2 = new THREE.Group(); j2.position.z = l1; j1.add(j2);
      add(j2, caps(F.r * 0.95, l2)); const j3 = new THREE.Group(); j3.position.z = l2; j2.add(j3);
      add(j3, caps(F.r * 0.88, l3));
      fing.push({ j1, j2, j3, F, fi });
    });
    // Daumen
    const t1 = new THREE.Group(); t1.position.set(0.03 * th, -0.004, 0.026); g.add(t1);
    add(t1, caps(0.0108, 0.044)); const t2 = new THREE.Group(); t2.position.z = 0.044; t1.add(t2); add(t2, caps(0.0098, 0.036));
    fing.thumb = { t1, t2 };
  } else {
    // einfache Variante für Statisten: Fäustling mit Daumen
    add(g, new THREE.SphereGeometry(0.03, 14, 10), 0, -0.002, 0.098, 1.15, 0.5, 1.2);
    const t1 = add(g, new THREE.SphereGeometry(0.015, 10, 8), 0.04 * th, 0.003, 0.04, 1, 0.9, 1.7); t1.rotation.y = th * 0.5;
  }
  /** curl 0..1, splay 0..1, thumb 0..1 (anlegen), type 0..1 (Amplitude der Tipp-Bewegung), t/seed für deterministische Fingerbewegungen */
  function set({ curl = 0.3, splay = 0.0, thumb = 0.3, type = 0, t = 0, seed = 1 } = {}) {
    if (!hi) return;
    fing.forEach(({ j1, j2, j3, F, fi }) => {
      const ph = Math.max(0, Math.sin(t * (7.0 + fi * 1.7 + (seed % 3) * 0.4) + fi * 1.9 + seed)) * type, ph2 = Math.max(0, noise(t, seed + fi * 3, 5)) * type;
      const c = Math.min(1.25, curl * F.k + 0.34 * ph + 0.12 * ph2 + 0.0);
      j1.rotation.set(0.18 + c * 1.15, (1.5 - fi) * 0.12 * splay * th, 0); j2.rotation.x = 0.12 + c * 1.35; j3.rotation.x = 0.04 + c * 0.85;
    });
    const T = fing.thumb; if (T) { T.t1.rotation.set(0.12 + 0.3 * (1 - thumb) - 0.25 * curl, th * (0.55 - 0.45 * thumb), -th * 0.2); T.t2.rotation.x = 0.1 + 0.55 * curl; }
  }
  set();
  return { group: g, set };
}
